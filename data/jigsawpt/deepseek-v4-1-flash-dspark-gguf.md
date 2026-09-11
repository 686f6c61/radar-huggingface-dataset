# JigSawPT/DeepSeek-V4.1-Flash-DSpark-GGUF

## Resumen

DeepSeek-V4.1-Flash-DSpark-GGUF no es un modelo conversacional completo, sino la cabeza de borrador (draft head) de decodificacion especulativa que DeepSeek incluye dentro de DeepSeek-V4.1-Flash bajo los tensores `mtp.*`, exportada de forma independiente por el usuario JigSawPT en arquitectura DFLASH y formato GGUF. Contiene tres bloques completos de V4.1 (128 expertos enrutados, 3 utilizados por token), la cabeza Markov bigram de rango 256, la cabeza de confianza y un tamano de bloque de 5, distribuidos en 78 tensores que ocupan 7,97 GB. Su proposito es acelerar la inferencia del modelo objetivo mediante decodificacion especulativa dentro de llama.cpp.

El artefacto es relevante porque upstream llama.cpp todavia no dispone de runtime para V4.1: este draft solo funciona sobre la rama `dsv41-porte` del fork JigSawPT/llama.cpp y requiere como modelo objetivo JigSawPT/DeepSeek-V4.1-Flash-GGUF. El autor ha publicado mediciones reales en una RTX 5090 de 32 GB con los expertos del objetivo streameados desde NVMe, y el resultado es contraintuitivo: en un regimen limitado por disco el draft es practicamente neutro (4,92 frente a 5,13 tokens/s en contenido mixto; 21,23 frente a 21,40 en contenido residente), con ganancias de solo el 12-15 % en repeticion literal. La causa es que el paso de verificacion paga la union de expertos de sus K+1 tokens, coste que en una maquina limitada por disco se come los tokens aceptados.

La tasa de aceptacion del draft si es alta y depende fuertemente del contenido: 51 % en prosa en portugues, 79 % en codigo y 97 % en repeticion literal. El autor senala que en un regimen limitado por computo, donde la verificacion por lotes es casi gratuita, esa misma aceptacion multiplicaria el throughput, pero ese escenario exige tener el working set en la tarjeta grafica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFLASH (cabeza de borrador de DeepSeek-V4.1: 3 bloques completos de V4.1, MoE con 128 expertos enrutados y 3 activos, cabeza Markov bigram de rango 256, cabeza de confianza, tamano de bloque 5) |
| Parametros totales | 14.225.362.146 (dato de metadatos safetensors); la model card describe 78 tensores y 7,97 GB |
| Parametros activos | No disponible en cifra exacta; 3 de 128 expertos enrutados activos por token |
| Longitud de contexto | No disponible para el draft; el ejemplo de ejecucion del objetivo usa `-c 8192` |
| Tipos de cuantizacion | Expertos del draft en MXFP4 (tal como se publicaron); atencion y pesos densos en Q8_0/BF16 a partir de fp8; `--outtype bf16` en la conversion |
| Idiomas soportados | No disponible (la evaluacion menciona prosa en portugues y codigo) |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp), 78 tensores, 7,97 GB; hash SHA-256 en `SHA256SUMS.txt` |

## Arquitectura y entrenamiento

El artefacto no es un modelo entrenado de nuevo, sino una extraccion: el script `convert_hf_to_gguf.py` con la clase `DeepseekV41DSparkModel` y el flag `--dspark` escribe los nombres de cabeza de V4.1 (`markov_head.embed/head`), los recuentos de expertos propios del draft, y las capas del objetivo tal como las lee la referencia (la media sobre los streams de hyper-connection se toma *antes* de ejecutar las capas 37-39). Ademas inserta una clave `dflash.dsv41_semantics` que indica al cargador que aplique las reglas de V4.1: sin normalizacion q por cabeza, la mezcla de hyper-connection enhebrada una subcapa por delante y un colapso final con la ultima mezcla FFN (la cabeza de V4.1 no tiene pesos `hc_head`). Los expertos del draft se mantienen en MXFP4 tal como se publicaron; la atencion y los pesos densos pasan a Q8_0/BF16 desde fp8.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, ni sobre fases de RLHF o DPO de esta cabeza de borrador; la model card unicamente documenta el proceso de conversion y exportacion. La innovacion tecnica destacable es precisamente la de exponer como GGUF independiente una cabeza MTP interna del modelo, con decodificacion especulativa de tipo `draft-dspark` y un parametro de longitud de borrador configurable (`--spec-draft-n-max`).

## Capacidades

- Decodificacion especulativa como cabeza de borrador para DeepSeek-V4.1-Flash: propone K+1 tokens que el modelo objetivo verifica en un unico paso.
- Tasas de aceptacion medidas y dependientes del contenido: 51 % en prosa en portugues, 79 % en codigo, 97 % en repeticion literal.
- Soporte de longitud de borrador configurable; en la maquina medida el mejor valor es 2, no el bloque de 5 con el que fue entrenada.
- Ejecucion con los expertos del draft en RAM o en CPU (`--spec-draft-n-cpu-moe 3`) para no consumir la cache VRAM del modelo objetivo.
- Generacion de texto, razonamiento, codigo, matematicas, vision o tool calling: no disponible en esta ficha; esas capacidades corresponden al modelo objetivo DeepSeek-V4.1-Flash, no al draft.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad propia del draft.
- Capacidades multilingues: no disponibles.
- Capacidades especiales: ninguna adicional documentada mas alla de la decodificacion especulativa (no hay modo thinking, vision ni audio en el draft).

## Casos de uso

- Acelerar generacion de codigo en produccion sobre DeepSeek-V4.1-Flash: con una tasa de aceptacion del 79 % en codigo, el draft es el escenario mas favorable documentado, siempre que la verificacion no este limitada por disco.
- Tareas de repeticion literal o plantillas: es el unico regimen con ganancia neta medida (+12-15 %) en la configuracion probada, util para generacion de informes con estructura repetitiva o relleno de plantillas.
- Investigacion en decodificacion especulativa: sirve como banco de pruebas para estudiar el equilibrio entre aceptacion, longitud de borrador y coste de verificacion en arquitecturas MoE con expertos streameados.
- Despliegue en maquinas con working set residente en GPU: en un regimen limitado por computo, donde la verificacion por lotes es barata, la aceptacion alta deberia traducirse en multiplicacion del throughput, aunque el autor no aporta cifras de ese regimen.
- Reproduccion de resultados: el repositorio de informe y el `SHA256SUMS.txt` permiten replicar las mediciones de la RTX 5090 con el mismo benchmark casero de cuatro prompts y tres rondas.
- Desarrollo sobre el fork de llama.cpp: para quien necesite runtime de V4.1 antes de que upstream lo soporte, este draft y el objetivo asociado forman el unico camino documentado.
- Analisis de arquitecturas MoE con hyper-connections: la exportacion documenta reglas concretas (`dflash.dsv41_semantics`, media de streams antes de las capas 37-39, sin `hc_head`) utiles para implementar el runtime.
- Evaluacion de estrategias de offload: comparar expertos del draft en CPU frente a GPU con el coste concreto de 5 GiB de VRAM que supone moverlos a la tarjeta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos son mediciones de throughput del benchmark casero del autor (cuatro prompts, tres rondas, mismo dia y misma configuracion) sobre una RTX 5090 de 32 GB con los expertos del objetivo streameados desde NVMe:

| Escenario | Con draft | Sin draft |
|---|---|---|
| Contenido mixto (4 prompts, 3 rondas) | 4,92 tokens/s | 5,13 tokens/s |
| Contenido residente | 21,23 tokens/s | 21,40 tokens/s |
| Repeticion literal | +12-15 % | referencia |

| Tipo de contenido | Tasa de aceptacion |
|---|---|
| Prosa en portugues | 51 % |
| Codigo | 79 % |
| Repeticion literal | 97 % |

Conclusion del autor: en regimen limitado por disco el draft es neutro porque el paso de verificacion paga la union de expertos de los K+1 tokens; con el working set en la tarjeta, la misma aceptacion multiplicaria el throughput.

## Requisitos de hardware

- Peso del draft: 7,97 GB en GGUF (78 tensores); el repositorio ocupa 8,0 GB.
- VRAM para el draft: puede mantenerse fuera de la GPU con `--spec-draft-n-cpu-moe 3`, lo que conserva la cache VRAM del objetivo; mover los expertos del draft a la tarjeta no mejora el rendimiento y le cuesta 5 GiB al objetivo.
- GPU medida por el autor: RTX 5090 de 32 GB, con los expertos del objetivo streameados desde NVMe.
- GPU recomendadas: no disponible; la unica configuracion documentada es la RTX 5090 con `-ngl 99` y offload parcial a CPU.
- Cabe en GPU de consumo: si, el draft (7,97 GB) cabe en tarjetas de 16 GB o superiores, aunque la limitacion real es el modelo objetivo y su cache de expertos.
- Opciones de despliegue: `llama-server` del fork JigSawPT/llama.cpp, rama `dsv41-porte`, con `--spec-type draft-dspark`. El llama.cpp upstream no tiene runtime para V4.1. No se documenta soporte en vLLM, TGI ni Ollama.
- Parametros de ejecucion relevantes: `-c 8192`, `--moe-stream`, `--moe-stream-cache 18`, `--moe-stream-l2 72`, `--reasoning off`, `--spec-draft-n-max 2`, `-ngld 99`, `--spec-draft-n-cpu-moe 3`.
- Latencia y throughput: 4,92 tokens/s en contenido mixto y 21,23 tokens/s en contenido residente con draft, en la maquina medida.

## Comparativa con modelos similares

No se dispone de informacion sobre otras cabezas de borrador publicadas para DeepSeek-V4.1, por lo que no es posible una comparativa entre artefactos equivalentes. La unica comparacion con datos es contra la misma configuracion sin decodificacion especulativa:

| Configuracion | Longitud de borrador | Contenido mixto | Contenido residente | Repeticion literal |
|---|---|---|---|---|
| DSpark draft + objetivo V4.1 | 2 | 4,92 tokens/s | 21,23 tokens/s | +12-15 % |
| Objetivo V4.1 sin draft | no aplica | 5,13 tokens/s | 21,40 tokens/s | referencia |

Alternativas de la misma categoria (otras cabezas MTP o draft heads para V4.1, o decodificacion especulativa estandar de llama.cpp sobre V4.1): no disponible.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el modelo objetivo JigSawPT/DeepSeek-V4.1-Flash-GGUF no genera nada utilizable; su unica funcion es proponer tokens.
- Dependencia de un fork: solo funciona en la rama `dsv41-porte` de JigSawPT/llama.cpp. El llama.cpp upstream no tiene runtime para V4.1, lo que limita la portabilidad y el soporte a largo plazo.
- Ganancia nula o negativa en regimen limitado por disco: 4,92 frente a 5,13 tokens/s en contenido mixto; el autor lo atribuye al coste de verificar la union de expertos de K+1 tokens.
- Sensibilidad al contenido: la aceptacion cae al 51 % en prosa en portugues, de modo que el beneficio no es homogeneo entre idiomas ni dominios.
- Longitud de borrador suboptima respecto al entrenamiento: el bloque entrenado es 5, pero el mejor valor medido en esa maquina es 2.
- Datos incompletos: no hay informacion sobre dataset de entrenamiento, numero de tokens, idiomas soportados ni evaluaciones de calidad del draft.
- Discrepancia en el recuento de parametros: los metadatos safetensors declaran 14.225.362.146 parametros mientras la model card describe 78 tensores y 7,97 GB; conviene verificar el dato antes de dimensionar un despliegue.
- Riesgo de alucinacion y sesgos: no evaluables para el draft, ya que la calidad final del texto la determina el modelo objetivo; no se han publicado analisis de sesgo.
- Licencia MIT heredada del modelo base DeepSeek (MIT), lo que permite uso comercial, pero el artefacto es una exportacion de terceros no auditada por DeepSeek.
- Advertencia de procedencia: el autor indica que la ingenieria conto con asistencia de Claude (Anthropic); se recomienda verificar los hashes de `SHA256SUMS.txt` antes de desplegar.
- Modelo practicamente sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa conocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JigSawPT/DeepSeek-V4.1-Flash-DSpark-GGUF
- Modelo objetivo GGUF: https://huggingface.co/JigSawPT/DeepSeek-V4.1-Flash-GGUF
- Fork de llama.cpp requerido (rama `dsv41-porte`): https://github.com/JigSawPT/llama.cpp
- Informe de mediciones y metodo: https://github.com/JigSawPT/deepseek-v41-flash-on-5090
- Modelo base: deepseek-ai/DeepSeek-V4.1-Flash

Nota: los resultados de busqueda web proporcionados no contienen informacion relacionada con el modelo (corresponden a paginas sobre sedes de Microsoft) y no se han utilizado.

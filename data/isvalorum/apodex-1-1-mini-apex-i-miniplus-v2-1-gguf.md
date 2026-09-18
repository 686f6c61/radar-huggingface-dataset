# IsValorum/Apodex-1.1-mini-APEX-I-MiniPlus-V2.1-GGUF

## Resumen

Apodex-1.1-mini-APEX-I-MiniPlus-V2.1-GGUF es una cuantizacion GGUF artesanal del modelo base apodex/Apodex-1.1-mini, publicada por el usuario IsValorum. No se trata de un modelo entrenado desde cero, sino de una reempaquetado de pesos con una receta de cuantizacion tensor a tensor disenada especificamente para arquitecturas MoE (Mixture of Experts) con decodificacion en llama.cpp. El modelo base es un transformer disperso de 35.505.251.456 parametros totales (aproximadamente 35,5 mil millones), organizado en 40 capas y 256 micro-expertos, con una ventana de contexto declarada de 256K tokens.

La relevancia de esta ficha no esta en el modelo base, sino en la estrategia de cuantizacion: el autor afirma haber conseguido una calidad equivalente a Q5_K/Q6_K ocupando solo unos 13,74 GiB (el mismo espacio que un Q3_K_M convencional). Para ello mantiene en F32 las matrices de enrutamiento de expertos (gate_inp), protege la cabeza de salida en Q6_K, las puertas de atencion en Q8_0 y los expertos compartidos en Q5_K, evitando comprimir a 2 bits los expertos nucleares. El resultado declarado es una perplejidad en WikiText-2 de 5,7073 ± 0,1373, frente a una linea base sin cuantizar de aproximadamente 5,64.

El interes practico es que permite ejecutar un MoE de ~35,5B parametros con contexto largo en estaciones de trabajo de 24 GB de VRAM, o incluso haciendo streaming de pesos desde RAM del sistema (DDR4/DDR5) a velocidades declaradas de 24 a 28+ tok/s. Conviene tratar todas las cifras de rendimiento como afirmaciones del autor de la cuantizacion, no verificadas de forma independiente: el repositorio acumula 275 descargas y 0 likes en el momento de redactar esta ficha, y la busqueda web realizada no ha devuelto ninguna fuente tecnica externa que las respalde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE disperso (tag `qwen35moe`); 40 capas, 256 micro-expertos, experto compartido (`shexp`), capas de atencion completa en L3, L7, L11 y siguientes |
| Parametros totales | 35.505.251.456 (aprox. 35,5B), dato real de safetensors del modelo base |
| Parametros activos | no disponible |
| Longitud de contexto | 256K tokens (declarado en la model card) |
| Tipos de cuantizacion | Receta mixta: `IQ3_XXS` (expertos nucleares 10-29), `Q3_K` (expertos de borde 0-9 y 30-39), `Q5_K` (experto compartido, 40 capas), `Q4_K` para `q/k/v` y `Q6_K` para `output.weight` en atencion, `Q8_0` (puertas de atencion), `F32` (routers `gate_inp`); calibrado con imatrix |
| Idiomas soportados | en, zh, es, fr, de, pt, it, ru, ja, ko, vi, th, ar (13 idiomas declarados) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (fichero cuantizado para llama.cpp), tamano de repo 30,7 GB; build V2.1 aprox. 13,74 GiB |
| Modelo base | apodex/Apodex-1.1-mini |
| Cuantizado por | IsValorum |
| Pipeline | text-generation |
| Etiquetas destacadas | moe, reasoning, llama.cpp, imatrix, conversational, endpoints_compatible |

## Arquitectura y entrenamiento

El modelo base es un transformer con capas de mezcla dispersa de expertos: 40 capas con 256 micro-expertos por capa segun la descripcion del autor, mas un experto compartido (`shexp`) presente en todas las capas. La etiqueta `qwen35moe` sugiere que la arquitectura sigue la familia Qwen3.5-MoE, aunque la informacion disponible no confirma el numero de parametros activos por token ni el detalle del enrutador. El unico dato estructural verificable desde la model card es la separacion entre "expertos nucleares" (capas 10-29), "expertos de borde" (capas 0-9 y 30-39) y un conjunto reducido de capas de atencion completa (L3, L7, L11...), lo que indica un patron de atencion mayoritariamente eficiente combinado con atencion densa puntual.

No hay informacion disponible sobre el entrenamiento original: numero de tokens, composicion del dataset, uso de RLHF, DPO u otras tecnicas de alineamiento. Lo unico documentado en esta publicacion es el proceso de cuantizacion posterior, que si esta detallado: el autor aplico una receta tensor a tensor con imatrix en la que las matrices de enrutamiento (`gate_inp`) se mantienen sin comprimir en F32 para evitar derivas de enrutamiento, la cabeza de salida se protege en Q6_K, las puertas de atencion en Q8_0, y los expertos nucleares no bajan de `IQ3_XXS`/`IQ3_S`. La justificacion tecnica es que comprimir los expertos nucleares a 2 bits (`IQ2_S`) produce picos de perplejidad, errores de sintaxis y corchetes de codigo roto, especialmente en trazas de razonamiento. La edicion V2.1 sustituye codigos no lineales por `Q3_K` lineal optimizado para SIMD en los expertos de borde, con el objetivo declarado de eliminar bloqueos de desquantizacion en CPU con AVX2.

## Capacidades

- Generacion de texto conversacional multi-turno, con la etiqueta `conversational` y compatibilidad declarada con endpoints.
- Razonamiento explicito: la model card menciona trazas dentro de etiquetas `<think>`, lo que indica un modo de razonamiento paso a paso antes de la respuesta final.
- Generacion de codigo: el autor menciona especificamente sintaxis e indentacion de codigo como casos sensibles a la cuantizacion, lo que implica soporte de tareas de programacion, aunque sin benchmarks publicados.
- Multilinguismo declarado en 13 idiomas: ingles, chino, espanol, frances, aleman, portugues, italiano, ruso, japones, coreano, vietnamita, tailandes y arabe.
- Ejecucion local mediante llama.cpp y formatos GGUF, con soporte de offload parcial a GPU y streaming desde RAM del sistema.
- Contexto largo: ventana declarada de 256K tokens, con builds calibrados para escenarios de mas de 160K tokens.
- Tool calling / function calling: no disponible (no se menciona en la informacion proporcionada).
- Capacidades de agente y multi-step reasoning: no disponible de forma explicita; el tag `reasoning` sugiere razonamiento multi-paso, pero sin confirmacion.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Analisis de documentacion extensa: con una ventana declarada de 256K tokens, el modelo puede procesar manuales tecnicos, expedientes o repositorios completos en una sola pasada sin troceado agresivo, manteniendo coherencia entre secciones.
- Asistencia de programacion en local: al generarse con llama.cpp y soportar offload, encaja en flujos de trabajo de desarrollo donde el codigo no puede salir de la maquina; la receta de cuantizacion prioriza explicitamente la consistencia sintactica de corchetes e indentacion.
- Razonamiento con trazas para depuracion: el modo `<think>` permite obtener cadenas de razonamiento auditables en tareas de matematicas, logica o diagnostico tecnico, utiles cuando se necesita verificar el proceso y no solo el resultado.
- Procesamiento multilingue de atencion al cliente: con 13 idiomas declarados (incluido espanol, portugues, arabe y japones), puede gestionar conversaciones multi-turno en mercados internacionales con la misma instancia de modelo.
- Despliegue en estacion de trabajo de 24 GB: el build V2.1 ocupa aproximadamente 13,74 GiB, lo que deja la mayor parte de la VRAM libre para la cache KV en contextos largos, permitiendo cubrir escenarios de investigacion que requieren contexto extendido en hardware de gama alta para consumidor.
- Servicio de inferencia sobre RAM del sistema: con velocidades declaradas de 24 a 28+ tok/s en streaming desde RAM, es viable montar un servidor de generacion en una maquina sin GPU grande o con varios usuarios concurrentes, aunque el throughput real por usuario dependera del ancho de banda de memoria.
- Resumen y sintesis de literatura cientifica: la combinacion de contexto largo y razonamiento explicito permite condensar articulos o informes extensos manteniendo referencias cruzadas entre secciones.
- Generacion asistida en entornos con requisitos de licencia permisiva: la licencia apache-2.0 facilita su integracion en productos comerciales, sujeto a las condiciones del modelo base original.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor son de perplejidad sobre WikiText-2, evaluados directamente sobre el binario GGUF con 2048 tokens de contexto y 10 fragmentos. No hay datos de MMLU, HumanEval, GSM8K ni otras pruebas estandar en la informacion disponible.

| Metrica | Valor | Condiciones |
|---|---|---|
| Perplejidad WikiText-2 (APEX-I-MiniPlus V2.1) | 5,7073 ± 0,1373 | GGUF binario, 2048 ctx, 10 chunks |
| Perplejidad WikiText-2 (linea base sin cuantizar, referencia del autor) | aprox. 5,64 | Dato aportado por el autor, no verificado |
| Delta de perplejidad | aprox. +0,07 | Respecto a la linea base |
| Velocidad en streaming desde RAM del sistema | +24 a 28+ tok/s | Con offload de la mayor parte del modelo a RAM (DDR4/DDR5), segun el autor |
| Velocidad con offload completo a VRAM | no disponible (el autor indica que V2 y V2.1 rinden de forma practicamente identica) | -ngl 99, 24 GB+ de VRAM |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el build V2.1 ocupa aproximadamente 13,74 GiB en pesos; con cache KV para contexto largo hay que sumar varios GiB adicionales, por lo que un contexto de 256K exige bastante mas VRAM o particionado.
- GPU recomendadas para offload completo: tarjetas con 24 GB o mas de VRAM (RTX 3090, RTX 4090, RTX 5090, A100 40/80 GB, H100) usando `-ngl 99` en llama.cpp.
- Cabe en GPU de consumo: si, en modelos con 24 GB o mas (RTX 3090/4090). En tarjetas de 16 GB el offload completo no es viable con esta receta; habria que usar una cuantizacion mas agresiva o el modo hibrido CPU+GPU.
- Modo hibrido con RAM del sistema: disenado explicitamente para streaming desde DDR4 o DDR5, con velocidades declaradas de 24 a 28+ tok/s y contexto extendido (mas de 160K hasta 256K).
- Opciones de despliegue: llama.cpp (formato nativo GGUF), y por extension los runners basados en el, como Ollama, LM Studio o servidores compatibles con endpoints. La etiqueta `endpoints_compatible` apunta a integracion en servicios de inferencia tipo API.
- Latencia y throughput estimados: 24-28+ tok/s en streaming desde RAM segun el autor; no se publican cifras de tok/s para ejecucion 100% en VRAM, ni de latencia de primer token, ni de throughput agregado con multiples usuarios.

## Comparativa con modelos similares

No hay informacion disponible sobre modelos comparables de otros autores en los resultados de busqueda proporcionados. La unica comparativa documentada es interna a la familia de cuantizaciones del mismo autor y a las cuantizaciones genericas de la comunidad:

| Build | Expertos nucleares (10-29) | Expertos de borde (0-9, 30-39) | Experto compartido | Cabezas / atencion | Routers | Tamano | Efecto declarado |
|---|---|---|---|---|---|---|---|
| APEX Mini generico (comunidad) | `IQ2_S` (2,50 bpw) | `Q3_K` (solo 5 capas) | `Q4_K` / `Q3_K` | `Q3_K` atencion y `Q3_K_M` en `output` | Comprimidos | aprox. 12,5 GB | Errores de sintaxis graves, indentacion de codigo rota, perplejidad alta en `<think>` |
| APEX-I-MiniPlus V2 | `IQ3_XXS` | `IQ3_S` (10 capas) | `IQ4_NL` | `Q3_K`, puertas `Q8_0`, `output` en `Q6_K` | `F32` | +1,2 GB vs generico | Calidad practicamente identica a V2.1; optimo para offload 100% en VRAM |
| APEX-I-MiniPlus V2.1 | `IQ3_XXS` | `Q3_K` (10 capas) | `Q5_K` (40 capas) | `Q4_K` en `q/k/v`, `Q6_K` en `output`, puertas `Q8_0` | `F32` | menos de 100 MB extra sobre V2 (aprox. 13,74 GiB) | Sin bloqueos AVX2 en CPU; 24-28+ tok/s con streaming desde RAM |

La comparacion con modelos alternativos del mismo rango de parametros (por ejemplo otras familias MoE de ~30-35B) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Se trata de una cuantizacion, no del modelo original: cualquier degradacion respecto al modelo base sin cuantizar es atribuible al proceso de compresion, y el autor reconoce un incremento de perplejidad de aproximadamente +0,07 puntos.
- Todas las cifras de rendimiento (perplejidad, tok/s, calidad tipo Q5-Q6) proceden del autor de la cuantizacion y no estan verificadas de forma independiente; la busqueda web no ha encontrado fuentes tecnicas que las respalden.
- Riesgo de alucinacion: no disponible como dato especifico; es un riesgo inherente a cualquier modelo generativo de este tamano, y no se han publicado evaluaciones de fidelidad factual.
- La model card tiene un tono marcadamente promocional y describe la receta como "el limite tecnologico absoluto" de su franja, lo que dificulta distinguir afirmaciones de marketing de datos medidos.
- No hay informacion sobre el modelo base (datos de entrenamiento, alineamiento, sesgos conocidos), por lo que no se pueden evaluar sesgos ni limitaciones idiomaticas mas alla de la lista de idiomas declarada.
- La cobertura de 13 idiomas esta declarada por el autor sin evaluaciones por idioma; el rendimiento real en idiomas distintos del ingles y el chino es desconocido.
- No se documentan capacidades de tool calling ni de uso agentico, lo que limita su integracion en pipelines que dependan de function calling estructurado.
- El contexto de 256K es una afirmacion del autor; no se aportan resultados de pruebas tipo "needle in a haystack" que confirmen la calidad de recuperacion a esa longitud.
- Licencia: apache-2.0, lo que en principio permite uso comercial, pero conviene verificar las condiciones del modelo base apodex/Apodex-1.1-mini antes de desplegarlo en produccion.
- Adopcion muy baja: 275 descargas y 0 likes, sin senales de validacion por parte de la comunidad.
- Las recetas de cuantizacion personalizadas implican que los nombres `V2`, `V2.1` y `MiniPlus` no corresponden a estandares de la industria; confundirlos con builds genericos de la comunidad puede llevar a descargar pesos con calidad muy inferior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IsValorum/Apodex-1.1-mini-APEX-I-MiniPlus-V2.1-GGUF
- Modelo base: https://huggingface.co/apodex/Apodex-1.1-mini
- Los resultados de busqueda web proporcionados no contienen ningun enlace relevante sobre este modelo, su arquitectura o sus benchmarks; no se dispone de paper, blog tecnico, repositorio adicional ni demo asociados.

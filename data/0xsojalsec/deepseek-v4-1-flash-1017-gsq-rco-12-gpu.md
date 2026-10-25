# 0xSojalSec/DeepSeek-V4.1-Flash-1017-GSQ-RCO-12-GPU

## Resumen

DeepSeek-V4.1-Flash-1017-GSQ-RCO-12-GPU es un conjunto de cuantizaciones GGUF no uniformes del modelo DeepSeek-V4.1-Flash-1017, un transformer disperso de tipo mixture-of-experts (MoE) con 763,2 mil millones de parametros, 384 expertos enrutados por capa (6 activos por token) y una ventana de contexto de 1 millon de tokens. La publicacion la firma el usuario 0xSojalSec, si bien el contenido y las herramientas proceden del Deep Algorithms and Systems Lab (DASLab) del Institute of Science and Technology Austria, que es quien desarrolla los metodos de cuantizacion aplicados.

El problema que resuelve es el de hacer operable un modelo de 763B en hardware de consumo: los archivos empaquetan el backbone (551,9B parametros) a 1,75, 2,00 o 2,25 bits por peso y mantienen las dos tablas de lookup Engram (196,6B parametros) en IQ4_NL, con un reparto de precision por tensor obtenido mediante busqueda basada en gradientes. El autor afirma que las tres builds se ejecutan en una unica GPU de 12 GB de VRAM usando Strata.

La relevancia es doble: por un lado, demuestra que la cuantizacion escalar de 1-2 bits puede acercarse al modelo base en tareas de razonamiento y codigo (la build IQ2_XXS declara el 100,0% de la media de tareas del base, 93,54); por otro, introduce dos tecnicas publicadas (GSQ y RCO) que sustituyen la asignacion uniforme de tipos de cuantizacion por una optimizacion con restriccion de presupuesto de tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer disperso tipo mixture-of-experts (MoE), 384 expertos enrutados por capa, 6 activos por token; incluye tablas de lookup Engram |
| Parametros totales | 763,2 mil millones (551,9B en el backbone transformer + 196,6B en las tablas Engram) |
| Parametros activos | No disponible como cifra absoluta; la model card solo indica que se activan 6 de los 384 expertos enrutados por token |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | Backbone: IQ1_M (1,75 bpw), IQ2_XXS (2,00 bpw), IQ2_XS (2,25 bpw), asignados tensor a tensor. Tablas Engram: IQ4_NL (4,50 bpw) fijas en todas las builds |
| Idiomas soportados | No disponible |
| Licencia | MIT (segun la model card del repositorio) |
| Formato de pesos | GGUF; backbone en 4 shards (`...-0000i-of-00004.gguf`) mas un unico archivo Engram independiente |
| Modelo base | deepseek-ai/DeepSeek-V4.1-Flash-1017 (relacion: quantized) |
| Metodos de cuantizacion | GSQ (Gumbel-Softmax Quantization) + RCO (Riemannian Constrained Optimization) |
| Tamano del repositorio | 524,8 GB en total (las tres builds comparten el archivo Engram de 110,60 GB) |
| Biblioteca declarada | gguf |
| Autor del repositorio | 0xSojalSec (contenido y herramientas de IST-DASLab) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer MoE de 763,2B parametros con 384 expertos enrutados por capa y enrutamiento disperso de 6 expertos por token, lo que mantiene bajo el coste computacional por token pese al tamano total. Una parte sustancial del parametraje no son matrices de multiplicacion densas: 196,6B parametros corresponden a dos tablas de lookup Engram que se leen de forma dispersa, una fila por token, y que por ello pueden permanecer mapeadas en disco sin ocupar VRAM ni RAM. El backbone transformer, con 551,9B parametros, es lo unico que se procesa como peso denso y es lo que controla el presupuesto de bits de cada build.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO) del modelo base en la informacion proporcionada. Lo que si se documenta es el post-entrenamiento de compresion: GSQ aprende conjuntamente las asignaciones de rejilla por coordenada y las escalas por grupo mediante una relajacion de Gumbel-Softmax, cerrando buena parte de la brecha entre cuantizacion escalar y vectorial a 2-3 bits y manteniendose en formatos escalares desplegables como GGUF. Sobre esa base, RCO asigna uno de K tipos de cuantizacion a cada uno de los N tensores bajo una restriccion de tamano total, reformulando la restriccion como una variedad de Riemann suave en espacio logit, lo que permite optimizar directamente sobre la perdida de la tarea y satisfacer el presupuesto de forma exacta sin hiperparametros especificos de restriccion. Una limitacion estructural del formato: la asignacion se hace por capa, no por experto, porque GGUF no puede expresar ese nivel de granularidad.

## Capacidades

- Generacion de texto y razonamiento de multiples pasos, evaluado en AIME25 y GPQA-Diamond segun la model card.
- Generacion y comprension de codigo, evaluada en LiveCodeBench v6.
- Razonamiento matematico de competicion (AIME25) con degradacion declarada minima en la build de 2,00 bpw.
- Ventana de contexto de 1M tokens, adecuada para documentos largos, repositorios completos o historiales extensos.
- Eficiencia de inferencia por enrutamiento disperso: solo 6 de 384 expertos por token, lo que reduce el computo activo frente a un modelo denso del mismo tamano.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes, vision, audio o modo "thinking" explicito: no disponible en la informacion proporcionada.
- Despliegue en GPU unica de 12 GB mediante Strata, con las tablas Engram leidas desde disco de forma dispersa.

## Casos de uso

- Analisis de repositorios completos: con 1M tokens de contexto, el modelo puede ingerir varios modulos, tests y documentacion en una sola pasada para tareas de revision de codigo o explicacion de arquitectura, sin recuperacion por trozos.
- Razonamiento matematico y verificacion de soluciones: el rendimiento declarado en AIME25 y GPQA-Diamond lo hace util para generar y contrastar cadenas de razonamiento en entornos educativos o de evaluacion interna.
- Generacion de codigo en pipelines offline: al ser un GGUF ejecutable en 12 GB de VRAM, encaja en runners autoalojados de integracion continua donde no se puede depender de una API externa.
- Procesamiento de expedientes y documentacion legal o tecnica extensa: la ventana de 1M tokens permite resumir, extraer clausulas o comparar versiones de contratos sin truncar.
- Laboratorio de investigacion en cuantizacion: las tres builds (1,75 / 2,00 / 2,25 bpw) permiten medir la curva calidad-tamano de GSQ y RCO sobre el mismo modelo y hardware.
- Prototipado y evaluacion en estaciones de trabajo modestas: una GPU de 12 GB basta para probar comportamiento, latencia y calidad antes de decidir si se escala a una build mayor o al modelo sin cuantizar.
- Indexado y busqueda semantica sobre corpus grandes: la combinacion de contexto largo y bajo coste de VRAM permite generar resumenes y metadatos a gran escala en hardware de consumo.

## Benchmarks y rendimiento

La model card reporta evaluaciones en AIME25, GPQA-Diamond y LiveCodeBench v6, pero los valores por benchmark solo aparecen en una figura no transcrita en el texto. Los unicos datos numericos explicitos son los agregados de la tabla siguiente.

| Metrica | IQ1_M | IQ2_XXS | IQ2_XS |
|---|---|---|---|
| Bits por peso (bpw) | 1,75 | 2,00 | 2,25 |
| Tamano backbone | 120,72 GB | 138,24 GB | 155,23 GB |
| Tamano Engram (compartido) | 110,60 GB | 110,60 GB | 110,60 GB |
| Tamano total | 231,32 GB | 248,84 GB | 265,83 GB |
| Media de tareas (3 benchmarks) | 1,2 puntos por debajo del base | 93,54 (100,0% del base) | No disponible |
| AIME25 | No disponible por separado | Igual que el base (declarado) | No disponible |
| GPQA-Diamond | No disponible por separado | Igual que el base (declarado) | No disponible |
| LiveCodeBench v6 | No disponible por separado | Igual que el base (declarado) | No disponible |

No se han publicado en la informacion disponible resultados de benchmarks frente a modelos alternativos de terceros, ni cifras absolutas por prueba mas alla de la media agregada de 93,54.

## Requisitos de hardware

- VRAM: 12 GB por GPU segun el autor, valido para las tres builds siempre que se use Strata. No se detalla que tensores residen en VRAM y cuales en RAM del sistema; la seccion "Memory requirements" de la model card esta marcada como pendiente (TBD).
- Almacenamiento: entre 231,32 GB (IQ1_M) y 265,83 GB (IQ2_XS) para el conjunto backbone + Engram. El archivo Engram de 110,60 GB se descarga una sola vez y sirve para las tres builds, pero debe permanecer en el mismo directorio que los shards del backbone.
- GPU recomendadas: no se especifican modelos concretos; el requisito declarado es una unica GPU con 12 GB de VRAM, lo que incluye tarjetas de gama media con esa dotacion. Para reducir latencia conviene almacenamiento NVMe, ya que las tablas Engram se leen desde disco.
- RAM del sistema: no disponible.
- Opciones de despliegue: Strata (la herramienta citada por el autor para la ejecucion en 12 GB). Al ser GGUF estandar, los archivos son compatibles con el ecosistema GGUF habitual (llama.cpp), aunque la model card no confirma ni documenta ese soporte. Soporte en vLLM o TGI: no disponible.
- Latencia y throughput: no disponibles. Cabe esperar que el cuello de botella sea la E/S de disco por la lectura dispersa de las tablas Engram, pero no se aportan medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano en disco | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017 (base, sin cuantizar) | 763,2B | 1M | Ninguna (pesos originales) | No disponible | No disponible en esta ficha | Repositorio oficial deepseek-ai |
| Este repositorio, build IQ1_M | 763,2B (551,9B backbone) | 1M | 1,75 bpw no uniforme | 231,32 GB | MIT | Publicado; 0 descargas, 0 likes |
| Este repositorio, build IQ2_XXS | 763,2B (551,9B backbone) | 1M | 2,00 bpw no uniforme | 248,84 GB | MIT | Publicado; recomendado por el autor |
| Este repositorio, build IQ2_XS | 763,2B (551,9B backbone) | 1M | 2,25 bpw no uniforme | 265,83 GB | MIT | Publicado |
| GGUFs de cuantizacion uniforme del mismo modelo base | 763,2B | 1M | Un tipo por todos los tensores | No disponible | No disponible | No disponible en la informacion proporcionada |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos de terceros en la informacion proporcionada, por lo que la comparativa se limita a las variantes del mismo modelo base.

## Limitaciones y advertencias

- La cuantizacion a 1,75-2,25 bits por peso implica una perdida de calidad medible: la build IQ1_M cede 1,2 puntos de media en las tres tareas evaluadas, y no se documenta la degradacion por benchmark individual ni en tareas fuera de AIME25, GPQA-Diamond y LiveCodeBench v6.
- Solo se evaluan tres benchmarks, todos de razonamiento y codigo; no hay datos de calidad en generacion libre, idiomas distintos del ingles supuesto, tareas largas o seguimiento de instrucciones.
- Idiomas soportados: no disponible, lo que impide garantizar un comportamiento aceptable en castellano sin evaluacion previa.
- El repositorio es una publicacion de 0xSojalSec y no el repositorio oficial de IST-DASLab; conviene verificar la procedencia de los archivos y compararlos con la publicacion del laboratorio antes de usarlos en produccion.
- Senales de validacion debiles: 0 descargas y 0 likes en el momento de la consulta, y una seccion de requisitos de memoria sin completar en la propia model card.
- La granularidad de asignacion de tipos es por capa y no por experto, una restriccion del formato GGUF que deja precision sobre la mesa en el componente que domina el parametraje.
- El modelo depende de una herramienta externa (Strata) para cumplir el requisito de 12 GB; el rendimiento y la estabilidad fuera de ese entorno no estan documentados.
- El coste de almacenamiento es alto (231-266 GB) y la latencia puede estar dominada por la E/S de disco al leer las tablas Engram.
- La licencia declarada es MIT, pero no se detalla en la informacion disponible la licencia del modelo base ni posibles condiciones adicionales heredadas; verificar antes de un uso comercial.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, si bien es esperable en un modelo cuantizado de forma agresiva.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/0xSojalSec/DeepSeek-V4.1-Flash-1017-GSQ-RCO-12-GPU
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Paper GSQ (arXiv:2604.18556): https://arxiv.org/abs/2604.18556
- Paper RCO (arXiv:2605.00649): https://arxiv.org/abs/2605.00649
- Codigo GSQ: https://github.com/IST-DASLab/GSQ
- Codigo RCO: https://github.com/IST-DASLab/RCO
- Organizacion DASLab: https://github.com/IST-DASLab
- Herramienta Strata: https://github.com/Niko1221/Strata
- Repositorio de referencia de las cuantizaciones (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF

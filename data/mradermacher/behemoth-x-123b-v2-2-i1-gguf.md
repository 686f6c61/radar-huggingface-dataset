# mradermacher/Behemoth-X-123B-v2.2-i1-GGUF

## Resumen

Este repositorio contiene una coleccion de cuantizaciones GGUF del modelo Behemoth-X-123B-v2.2, publicadas por el usuario mradermacher. No se trata de un modelo entrenado desde cero, sino de una conversion a formato GGUF (con cuantizaciones generadas a partir de una matriz de importancia, imatrix) del modelo original TheDrummer/Behemoth-X-123B-v2.2. El objetivo es permitir la ejecucion del modelo en hardware con recursos limitados mediante llama.cpp y herramientas compatibles.

El modelo base cuenta con aproximadamente 122.610.069.504 parametros (unos 122,6 mil millones), segun los datos de safetensors del repositorio original. El repositorio de cuantizaciones ocupa 391,0 GB en total e incluye tanto cuantizaciones estaticas como cuantizaciones ponderadas con imatrix, con tamanos que van desde los 45,3 GB (i1-Q2_K) hasta los 69,7 GB (i1-Q4_K_S) entre las variantes listadas en la model card. Esta etiquetado como modelo conversacional y con idioma unico en ingles.

Su relevancia actual radica en que facilita el acceso a un modelo de gran tamano en formato optimizado para inferencia local y en servidores sin GPU de gama alta, aunque la licencia y los detalles de arquitectura y entrenamiento del modelo base no estan disponibles en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 122.610.069.504 (~122,6 mil millones) |
| Parametros activos | no disponible (no se confirma que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K, Q2_K_S, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, small-IQ4_NL, IQ4_XS, Q4_K_S, Q4_K_M, Q4_0, Q4_1, Q5_K_S, Q5_K_M, Q6_K, ademas de un fichero imatrix |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado, con variantes imatrix); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base en los datos proporcionados. El nombre del modelo (Behemoth-X-123B) y el recuento de parametros (122,6 mil millones) apuntan a un modelo de gran tamano, pero no se confirma si se trata de un transformer denso, un modelo de mezcla de expertos (MoE) o una arquitectura hibrida. Tampoco se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni la aplicacion de tecnicas de alineacion como RLHF o DPO.

Este repositorio concreto no entrena el modelo, sino que realiza la conversion a GGUF y la cuantizacion. Segun la model card, las cuantizaciones ponderadas (i1) se generan a partir de un fichero imatrix, una tecnica que calcula la importancia de cada tensor para reducir la perdida de calidad en cuantizaciones agresivas. El proceso de conversion se realiza con convert_type hf (a partir de pesos en formato HuggingFace) y se ofrece tambien un fichero imatrix para que terceros generen sus propias cuantizaciones.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como "conversational" en HuggingFace, lo que indica que esta orientado a dialogos multi-turno.
- Idioma: soporte unicamente en ingles, segun el campo language de la model card.
- Cuantizacion a multiples niveles de precision: permite ajustar el equilibrio entre calidad y consumo de memoria (desde IQ1_S hasta Q6_K).
- Compatibilidad con endpoints: el repositorio incluye la etiqueta "endpoints_compatible", lo que sugiere que puede desplegarse mediante endpoints de inferencia compatibles con GGUF.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Ejecucion de un modelo de 122,6 mil millones de parametros en servidores sin GPU de gama alta: mediante las cuantizaciones mas agresivas (i1-Q2_K, 45,3 GB) es posible cargar el modelo con offload parcial a CPU en llama.cpp, algo inviable con los pesos originales en safetensors.
- Despliegue en una sola GPU de 80 GB: la cuantizacion i1-Q4_K_S (69,7 GB) puede cargarse en una A100 80 GB o H100 80 GB, permitiendo servir el modelo sin necesidad de multiples GPUs.
- Generacion de texto conversacional en ingles: el modelo esta orientado a dialogos y puede emplearse en asistentes conversacionales para ese idioma.
- Prototipado e investigacion en laboratorios con recursos limitados: las variantes imatrix facilitan experimentar con un modelo de gran escala reduciendo los requisitos de memoria frente a los pesos completos.
- Servicio de inferencia local con llama.cpp u Ollama: las cuantizaciones estan pensadas para ejecutarse con estas herramientas, lo que permite montar un servidor de inferencia interno en ingles.
- Comparacion de calidad entre niveles de cuantizacion: el repositorio incluye varias decenas de variantes, lo que permite evaluar la degradacion de calidad segun el nivel de compresion para un mismo modelo base.

No se dispone de informacion suficiente sobre el modelo base para justificar casos de uso mas especificos (codigo, matematicas, atencion al cliente con contexto largo, etc.).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamano de los pesos por cuantizacion (segun la model card, tabla parcial):
  - i1-Q2_K: 45,3 GB.
  - i1-IQ3_XXS: 47,1 GB.
  - i1-IQ3_M: 55,4 GB.
  - i1-Q3_K_M: 59,2 GB.
  - i1-Q4_K_S: 69,7 GB.
  - Otras variantes (IQ1_S, IQ2_*, Q4_K_M, Q5_K_M, Q6_K, etc.) no tienen tamano listado en la informacion proporcionada.
- VRAM estimada para inferencia: a los tamanos de pesos hay que sumar la cache KV, que depende de la longitud de contexto (no disponible) y del numero de capas. Para una carga completa en GPU, se necesita una GPU con memoria igual o superior al tamano del fichero mas el overhead: aproximadamente 50 GB o mas para Q2_K, y en torno a 75-80 GB para Q4_K_S.
- GPU recomendadas: para las cuantizaciones mas grandes (Q4_K_S y superiores) se requiere una A100 80 GB, H100 80 GB o varias GPUs (por ejemplo, 2x A100 40 GB o 2x RTX 6000 Ada 48 GB). Para las cuantizaciones mas bajas puede ser viable con 48 GB de VRAM agregada.
- Viabilidad en GPU de consumo: ninguna GPU de consumo actual (RTX 4090 24 GB, RTX 3090 24 GB) tiene VRAM suficiente para cargar el modelo completo. Solo es viable con offload parcial a CPU/RAM mediante llama.cpp, asumiendo una penalizacion importante de velocidad.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-webui, LM Studio y servidores compatibles con GGUF. vLLM ofrece soporte de GGUF limitado y no se confirma su compatibilidad con todas estas cuantizaciones.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones comparables en la informacion proporcionada, por lo que no es posible realizar una comparativa rigurosa con otros modelos de la misma categoria. Se puede senalar, dentro del mismo repositorio, la existencia de dos conjuntos de cuantizaciones:

| Repositorio | Tipo | Tamano de ejemplo | Notas |
|---|---|---|---|
| mradermacher/Behemoth-X-123B-v2.2-i1-GGUF | Cuantizaciones ponderadas con imatrix | 45,3-69,7 GB | Este repositorio; incluye fichero imatrix |
| mradermacher/Behemoth-X-123B-v2.2-GGUF | Cuantizaciones estaticas | no disponible | Referenciado en la model card como alternativa |

## Limitaciones y advertencias

- Licencia no disponible: no se especifica la licencia del modelo ni de estas cuantizaciones, por lo que el uso comercial queda en situacion de incertidumbre. Es imprescindible verificar la licencia del modelo base (TheDrummer/Behemoth-X-123B-v2.2) antes de cualquier uso en produccion.
- Idioma limitado: el modelo solo declara soporte para ingles. El castellano no esta cubierto segun la informacion disponible.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; es un riesgo habitual en modelos de este tipo.
- Degradacion por cuantizacion: las variantes de menor precision (IQ1_S, IQ1_M, IQ2_*, Q2_K) pueden degradar sensiblemente la calidad. La propia model card advierte que IQ3_XXS probablemente es preferible a Q2_K y que IQ3_S probablemente es preferible a Q3_K_M.
- Sesgos conocidos: no disponible.
- Restricciones de contexto: la longitud de contexto del modelo base no esta disponible, lo que impide estimar con precision la memoria necesaria para la cache KV.
- Requisitos de hardware elevados: incluso la cuantizacion mas ligera (45,3 GB) supera la VRAM de cualquier GPU de consumo, lo que obliga a usar GPUs de datacenter o a hacer offload a CPU con la consiguiente perdida de rendimiento.
- Datos incompletos del modelo base: la arquitectura, el entrenamiento, la alineacion y el contexto no estan documentados en la informacion proporcionada, lo que dificulta evaluar su idoneidad para tareas concretas.
- Fechas de publicacion: los metadatos indican creacion el 2026-10-09 y actualizacion el 2026-10-10, valores que conviene contrastar con la fuente original.
- Repositorio sin adopcion: registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso o validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF (imatrix): https://huggingface.co/mradermacher/Behemoth-X-123B-v2.2-i1-GGUF
- Modelo base: https://huggingface.co/TheDrummer/Behemoth-X-123B-v2.2
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Behemoth-X-123B-v2.2-GGUF
- Pagina de resumen del modelo (mradermacher): https://hf.tst.eu/model#Behemoth-X-123B-v2.2-i1-GGUF
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- nethype GmbH (patrocinador del autor): https://www.nethype.de/

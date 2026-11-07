# LeonMiao/ViRC-Qwen2VL-7B

## Resumen

ViRC-Qwen2VL-7B es un modelo multimodal de tipo image-text-to-text desarrollado por LeonMiao (Ant Group) que especializa el modelo base Qwen2-VL-7B-Instruct en razonamiento matematico visual. Forma parte del marco ViRC (Visual Interleaved Reason Chunking), presentado en el paper aceptado en CVPR 2026, que propone estructurar las cadenas de razonamiento matematico multimodal en unidades criticas de razonamiento (CRU, Critical Reasoning Units) para simular el patron de resolucion de problemas de un experto humano: examinar repetidamente la imagen, verificar proposiciones intermedias y generar nuevas proposiciones apoyadas en informacion visual.

La innovacion principal es el mecanismo de Reason Chunking, que garantiza coherencia textual intra-unidad para verificar proposiciones intermedias e integra informacion visual entre unidades para sostener el razonamiento estructurado. El modelo se entrena sobre el dataset CRUX, construido con tres herramientas visuales y cuatro patrones de razonamiento, con anotaciones explicitas de CRUs a lo largo de multiples caminos de razonamiento por problema.

El modelo cuenta con 8.291.375.616 parametros (aproximadamente 8,3 mil millones) en formato safetensors, un repositorio de 16,6 GB y licencia Apache 2.0. Se distribuye como un checkpoint especializado de la familia ViRC, que incluye variantes sobre Qwen2.5-VL (ViRC-7B, ViRC-3B) y sobre Qwen2-VL (ViRC-Qwen2VL-7B, ViRC-Qwen2VL-2B). Esta variante concreta utiliza resolucion fija de imagen de 1000x1000, a diferencia de las variantes basadas en Qwen2.5-VL que emplean resolucion dinamica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen2-VL), vision-lenguaje con image-text-to-text |
| Parametros totales | 8.291.375.616 (aprox. 8,3 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2-VL-7B-Instruct, un transformer multimodal con codificador visual y modelo de lenguaje, y se especializa mediante un entrenamiento progresivo en tres etapas inspirado en el aprendizaje cognitivo humano: Instructional SFT (etapa 1), Practice SFT (etapa 2) y Strategic RL (etapa 3). El entrenamiento se realiza con LLaMA-Factory en las dos primeras etapas y con el framework verl en la etapa de RL, usando Qwen2.5-VL-72B-Instruct servido con vLLM como modelo de recompensa. Los pesos finales se exportan en safetensors mediante el script `merge_rl_result.sh`.

Los datos de entrenamiento provienen del dataset CRUX, que anota explicitamente CRUs (Critical Reasoning Units) a lo largo de multiples caminos de razonamiento para cada problema matematico, empleando tres herramientas visuales y cuatro patrones de razonamiento. El autor publica un subconjunto de 50K ejemplos y el conjunto completo de 100K. Esta variante concreta (ViRC-Qwen2VL-7B) usa configuracion de resolucion fija con imagenes redimensionadas a 1000x1000, con scripts de inferencia en `src/evaluation/ViRC_scale_fixed.py`. La innovacion tecnica central es el mecanismo de Reason Chunking, que estructura el CoT matematico multimodal en unidades consecutivas con coherencia textual interna y verificacion visual entre unidades.

## Capacidades

- Razonamiento matematico multimodal: resolucion de problemas matematicos a partir de imagenes con cadenas de razonamiento estructuradas en CRUs.
- Generacion de texto e image-text-to-text: descripcion y comprension de contenido visual combinado con texto.
- Razonamiento visual intercalado: integracion de informacion visual entre unidades de razonamiento para verificar y generar proposiciones.
- Capacidad de agente: el modelo esta etiquetado con el tag `agent` y soporta razonamiento multi-paso estructurado.
- Procesamiento de imagenes de alta resolucion en configuracion fija de 1000x1000 pixeles.
- Soporte multilingue limitado al ingles (unico idioma declarado).
- No se documenta soporte explicito de tool calling ni function calling en la informacion disponible.
- No se documenta soporte de audio ni vision en video en la informacion disponible.

## Casos de uso

- Tutoria matematica automatizada: el modelo puede descomponer un problema matematico presentado como imagen (por ejemplo, un enunciado escaneado o una foto de un examen) en unidades de razonamiento verificables, lo que permite generar explicaciones paso a paso con justificacion visual de cada proposicion intermedia.
- Correccion automatica de ejercicios con figuras geometricas: gracias al entrenamiento con CRUs y a la resolucion fija de 1000x1000, puede analizar diagramas, identificar datos relevantes y verificar la coherencia de la solucion del estudiante frente a la imagen.
- Asistencia en investigacion educativa: el modelo sirve como base para estudiar como los modelos multimodales adquieren habilidades de razonamiento estructurado, al permitir comparar el rendimiento con y sin el mecanismo de Reason Chunking sobre benchmarks matematicos.
- Generacion de datasets sinteticos de razonamiento: sus cadenas de razonamiento anotadas por unidades pueden utilizarse para destilar conocimiento en modelos mas pequenos o para aumentar datos de entrenamiento en tareas de razonamiento visual.
- Analisis de documentos tecnicos con formulas: puede procesar capturas de papers o apuntes con ecuaciones y explicar los pasos intermedios de una derivacion, apoyandose en la verificacion visual entre unidades.
- Integracion en pipelines de agentes multimodales: al estar etiquetado como `agent` y ser compatible con text-generation-inference y endpoints, puede desplegarse como servicio en un pipeline que reciba imagenes y texto y devuelva razonamientos estructurados para tareas de resolucion de problemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks detallados por modelo en la informacion disponible. La model card indica que el modelo ViRC-7B (variante principal) logra una mejora media del 18,8 % sobre las lineas base en multiples benchmarks matematicos y en benchmarks de imagenes de alta resolucion de dominio cruzado, pero no se desglosan resultados numericos por benchmark para esta variante concreta.

| Benchmark | ViRC-Qwen2VL-7B | Referencia |
|---|---|---|
| Resultados por benchmark | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en safetensors de aproximadamente 8,3 B de parametros, se requieren alrededor de 16,6 GB solo para los pesos en precision de 16 bits; en la practica se recomienda al menos 24 GB de VRAM para inferencia en fp16 con margen para el codificador visual y el contexto.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para fp16. Para cuantizaciones de 8 bits o 4 bits, GPUs consumer con 12-16 GB podrian ser suficientes, aunque no se documentan cuantizaciones oficiales.
- Cabe en GPU consumer: si, en RTX 4090 (24 GB) en fp16; en GPUs de 12-16 GB requeriria cuantizacion no publicada oficialmente.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`) y endpoints compatibles. No se documenta soporte de vLLM, llama.cpp u Ollama para este checkpoint.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ViRC-Qwen2VL-7B | 8,3 B | no disponible | Razonamiento matematico visual con Reason Chunking (resolucion fija 1000x1000) | apache-2.0 | Hugging Face |
| ViRC-7B | no disponible | no disponible | Razonamiento matematico visual con Reason Chunking (resolucion dinamica, base Qwen2.5-VL) | no disponible | Hugging Face |
| Qwen2-VL-7B-Instruct | no disponible | no disponible | Modelo base multimodal generalista | no disponible | Hugging Face |
| Qwen2.5-VL-7B-Instruct | no disponible | no disponible | Modelo base multimodal generalista de la generacion siguiente | no disponible | Hugging Face |

## Limitaciones y advertencias

- El modelo esta especializado en razonamiento matematico visual; su rendimiento en tareas generales de vision-lenguaje puede degradarse respecto al modelo base Qwen2-VL-7B-Instruct.
- Unico idioma declarado: ingles. No se garantiza un rendimiento adecuado en castellano ni en otros idiomas.
- Riesgo de alucinacion en la generacion de pasos intermedios de razonamiento, especialmente en problemas con figuras ambiguas o de baja calidad.
- La resolucion de imagen fija de 1000x1000 puede limitar el rendimiento en imagenes con detalles muy finos o relaciones de aspecto extremas.
- El numero de descargas (21) y likes (1) es muy bajo, lo que indica escasa validacion comunitaria y poca evidencia de robustez en produccion.
- No se documentan resultados de benchmarks desglosados por benchmark para esta variante concreta, lo que dificulta una evaluacion comparativa rigurosa.
- Aunque la licencia es Apache 2.0, el modelo base Qwen2-VL-7B-Instruct tiene sus propias condiciones que deben verificarse antes de un uso comercial.
- No se documentan cuantizaciones oficiales ni soporte de vLLM, llama.cpp u Ollama, lo que puede complicar el despliegue en infraestructuras no basadas en transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LeonMiao/ViRC-Qwen2VL-7B
- Paper en arXiv: https://arxiv.org/abs/2512.14654v3
- Dataset CRUX: https://huggingface.co/datasets/LeonMiao/CRUX
- Checkpoint ViRC-7B: https://huggingface.co/LeonMiao/ViRC-7B
- Checkpoint ViRC-3B: https://huggingface.co/LeonMiao/ViRC-3B
- Checkpoint ViRC-Qwen2VL-2B: https://huggingface.co/LeonMiao/ViRC-Qwen2VL-2B
- Modelo base Qwen2-VL-7B-Instruct: https://huggingface.co/Qwen/Qwen2-VL-7B-Instruct
- Modelo base Qwen2.5-VL-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Repositorio de codigo: https://github.com/Leon-LihongWang/ViRC

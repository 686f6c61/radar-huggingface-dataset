# kordou/MinerU-Popo-NF4

## Resumen

MinerU-Popo-NF4 es una cuantización en precisión mixta NF4 (4-bit) del modelo MinerU-Popo, desarrollada por el usuario kordou para permitir su ejecución en GPUs de consumo con 12 GB de VRAM. El modelo original, creado por OpenDataLab, es un framework ligero y universal de post-procesamiento de salidas de OCR que convierte resultados a nivel de página de diversos parsers en estructuras de documento coherentes, mediante cuatro subtareas: análisis de truncación de tablas, análisis de truncación de texto, análisis de jerarquía de títulos y análisis de asociación imagen-texto.

Esta versión cuantizada mantiene la arquitectura completa del modelo base, un fine-tune de Qwen3-VL-4B con 4.437.815.808 parámetros, pero reduce el peso en disco de 17.75 GB (F32) a 4.31 GB y el pico de VRAM de carga de ~8.9 GB (bf16) a 4.33 GB. La cuantización no implica re-entrenamiento ni cambios de arquitectura: solo se altera la precisión numérica de parte de los pesos, siguiendo una receta de precisión mixta que protege la torre de visión completa y ocho capas adicionales de la torre de texto.

La relevancia de este modelo radica en que democratiza el acceso a una herramienta de estructuración documental de última generación, permitiendo su uso en hardware de consumo sin sacrificar significativamente la fidelidad de salida, como demuestra la validación publicada en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL-4B (fine-tune) con torre de visión de 24 bloques y torre de lenguaje |
| Parametros totales | 4.437.815.808 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NF4 (4-bit) con doble cuantización, precisión mixta (torre de visión en bf16, torre de texto en NF4) |
| Idiomas soportados | no disponible |
| Licencia | other (see-base-model, enlace al repositorio upstream de MinerU-Popo) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MinerU-Popo-NF4 es una cuantización del modelo DreamEternal/MinerU-Popo, que a su vez es un fine-tune de Qwen3-VL-4B. La arquitectura subyacente es un transformer multimodal con una torre de visión de 24 bloques (104 módulos lineales), una torre de lenguaje con 36 capas y un `lm_head`. El modelo original fue entrenado por OpenDataLab para procesar imágenes de páginas renderizadas y generar árboles de documento estructurados, cubriendo cuatro subtareas específicas de post-procesamiento de OCR.

La cuantización publicada en este repositorio no implica ningún re-entrenamiento ni cambio arquitectónico. Se aplica una configuración de bitsandbytes con cuantización NF4 y doble cuantización, pero con una lista de exclusión (`llm_int8_skip_modules`) que mantiene en bfloat16 la torre de visión completa, los módulos de fusión y `lm_head`, además de ocho capas específicas de la torre de texto. De los 357 módulos lineales totales, 227 se cuantizan a NF4 y 130 permanecen en bf16, incluyendo los 104 de la torre de visión. Esta decisión se justifica porque la tarea del modelo depende críticamente de la precisión en la interpretación de imágenes de página.

La model card documenta además una trampa en el sistema de exclusión de transformers: los patrones de exclusión se emparejan con `re.match` anclado al inicio de la ruta del módulo, por lo que un patrón como `"visual"` no protege correctamente los módulos de la torre de visión. La receta publicada utiliza prefijos anclados completos para evitar este problema.

## Capacidades

- Post-procesamiento de salidas de OCR: convierte resultados a nivel de página de diversos parsers en estructuras de documento coherentes.
- Análisis de truncación de tablas: identifica y delimita tablas dentro de páginas renderizadas.
- Análisis de truncación de texto: detecta y segmenta bloques de texto.
- Análisis de jerarquía de títulos: asigna niveles de profundidad a los títulos del documento.
- Análisis de asociación imagen-texto: relaciona imágenes con sus descripciones o contexto textual.
- Construcción de árboles de documento: genera una representación JSON jerárquica de la estructura del documento.
- Entrada multimodal: procesa imágenes de páginas completas, no texto plano.
- Reproducibilidad: la configuración de generación usa decodificación greedy (`do_sample: false`), lo que garantiza salidas deterministas entre ejecuciones.

## Casos de uso

- Digitalización de documentos científicos: el modelo puede convertir PDFs de artículos de investigación en estructuras JSON jerárquicas, preservando la jerarquía de títulos y la asociación de figuras con su texto, lo que facilita la indexación y búsqueda semántica en repositorios académicos.
- Conversión de PDF a Markdown o HTML estructurado: integrado en un pipeline de MinerU, permite transformar documentos escaneados o generados por OCR en formatos web con encabezados, tablas e imágenes correctamente anidados, útil para publicaciones en línea o documentación técnica.
- Extracción de jerarquía de títulos en informes corporativos: dado un conjunto de páginas de un informe anual o técnico, el modelo asigna niveles de profundidad a los títulos, permitiendo generar un índice de contenidos automático o validar la estructura del documento.
- Análisis de tablas en documentos legales o financieros: el modelo identifica los límites de las tablas dentro de las páginas, lo que permite extraer datos tabulares de forma fiable para su posterior procesamiento en hojas de cálculo o bases de datos.
- Asociación de figuras y texto en manuales técnicos: al relacionar imágenes con sus pies de figura o párrafos asociados, el modelo facilita la creación de bases de conocimiento multimodales donde cada ilustración queda vinculada a su contexto explicativo.
- Pipeline de MinerU en producción: al ser una cuantización ligera, puede desplegarse en servidores con GPUs de consumo (12 GB) para procesar lotes de documentos de forma continua, reduciendo costes de infraestructura frente al modelo original en F32 o bf16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que se trata de un modelo especializado en post-procesamiento de documentos y no en tareas generales de lenguaje.

La model card incluye una validación específica contra el modelo sin cuantizar, ejecutando el pipeline real de MinerU-Popo con decodificación greedy y comparando los árboles de documento resultantes:

| Documento | Resultado vs modelo sin cuantizar |
|---|---|
| Artículo Transformer (11 páginas) | Árbol de documento byte-idéntico |
| Artículo estilo Nature con Reporting Summary (25 páginas) | 28/28 títulos idénticos; 21/28 profundidades idénticas; salida del modelo 99.995% idéntica |

La única desviación conocida es que siete títulos dentro de la sección "Reporting Summary" reciben profundidad 3 en lugar de 4. No se pierde ni se inventa ningún título, y el cuerpo principal del documento coincide exactamente.

## Requisitos de hardware

- VRAM estimada para inferencia: pico de carga de 4.33 GB, lo que permite ejecutar el modelo en GPUs con 6 GB o más de memoria.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 6 GB de VRAM; la receta se construyó y validó en una RTX 4090.
- Compatibilidad con GPUs de consumo: sí, cabe en GPUs de 12 GB como la RTX 3060, RTX 4070 o RTX 4080, y también en tarjetas de 8 GB como la RTX 4060.
- Opciones de despliegue: el checkpoint se carga mediante la API estándar de transformers con `Qwen3VLForConditionalGeneration` y `AutoProcessor`, requiriendo bitsandbytes y una GPU CUDA. No se mencionan integraciones con vLLM, llama.cpp u Ollama en la documentación disponible.
- Latencia y throughput: no se proporcionan datos específicos de latencia o throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Peso en disco | VRAM pico | Precisión | Licencia |
|---|---|---|---|---|---|
| kordou/MinerU-Popo-NF4 | 4.44B | 4.31 GB | 4.33 GB | Mixta (NF4 + bf16) | other (see-base-model) |
| DreamEternal/MinerU-Popo (base) | 4.44B | 17.75 GB (F32) | ~8.9 GB (bf16) | F32 / bf16 | other (see-base-model) |
| Qwen3-VL-4B (modelo base original) | 4.44B | no disponible | no disponible | bf16 | Apache 2.0 (según Qwen) |

La comparativa se limita al modelo base y a Qwen3-VL-4B porque no se dispone de información sobre otros modelos de post-procesamiento de OCR con características comparables. La ventaja principal de la versión NF4 es la reducción de requisitos de hardware manteniendo una fidelidad casi idéntica en la salida.

## Limitaciones y advertencias

- Desviación conocida en la jerarquía de títulos: en documentos con secciones tipo "Reporting Summary", algunos títulos pueden recibir una profundidad incorrecta (3 en lugar de 4), aunque no se pierden ni se inventan títulos.
- Requisito de GPU CUDA: el modelo solo puede ejecutarse con bitsandbytes y una GPU NVIDIA compatible; no es posible su uso en CPU o en GPUs de otros fabricantes.
- Licencia condicionada al modelo base: la licencia es "other" y remite al repositorio upstream de MinerU-Popo; es necesario revisar los términos de la licencia original antes de un uso comercial.
- Sin información sobre sesgos: no se han documentado sesgos específicos del modelo, pero al ser un modelo entrenado principalmente con documentos científicos y técnicos, su rendimiento puede degradarse en otros dominios.
- Riesgo de alucinación en estructuras: aunque la validación muestra alta fidelidad, el modelo puede asignar niveles incorrectos a elementos no titulares en ciertos contextos, como se observó en la variante con protección parcial de la torre de visión.
- Reproducibilidad alterada respecto al modelo base: la configuración de generación cambia de muestreo (temperature 0.7, top_k 20) a decodificación greedy, lo que afecta a la variabilidad de las salidas; para restaurar el comportamiento original hay que sobrescribir `generation_config` al cargar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kordou/MinerU-Popo-NF4
- Modelo base en HuggingFace: https://huggingface.co/DreamEternal/MinerU-Popo
- Repositorio GitHub de MinerU-Popo: https://github.com/opendatalab/MinerU-Popo
- Paper en arXiv: https://arxiv.org/html/2605.24973
- PDF del paper: https://arxiv.org/pdf/2605.24973

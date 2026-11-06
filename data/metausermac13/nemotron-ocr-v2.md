# Metausermac13/nemotron-ocr-v2

## Resumen

Nemotron OCR v2 es un sistema de reconocimiento óptico de caracteres (OCR) multimodal desarrollado por NVIDIA dentro de la colección NeMo Retriever, orientado a la extracción de texto de imágenes complejas del mundo real. No es un modelo de lenguaje generativo, sino un pipeline híbrido compuesto por tres módulos neuronales entrenados conjuntamente: un detector de regiones de texto, un reconocedor de secuencias y un modelo relacional para el análisis de layout y orden de lectura. Esta ficha documenta la réplica publicada por el usuario Metausermac13 en Hugging Face, que distribuye los pesos del modelo original de NVIDIA.

El modelo se ofrece en dos variantes: `v2_english`, optimizada para inglés con manejo de regiones a nivel de palabra (53,8 millones de parámetros totales), y `v2_multilingual`, que cubre inglés, chino simplificado y tradicional, japonés, coreano y ruso con regiones a nivel de línea (83,9 millones de parámetros). Ambas comparten el mismo detector basado en RegNetX-8GF y el mismo modelo relacional, diferenciándose únicamente en la capacidad del reconocedor Transformer.

Su relevancia actual radica en que está diseñado para alimentar pipelines de RAG multimodal y aplicaciones agénticas que necesitan convertir documentos e imágenes en texto estructurado con alta fidelidad. La licencia NVIDIA Open Model License permite uso comercial, lo que lo posiciona como alternativa a soluciones OCR propietarias en entornos empresariales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida detector-reconocedor con modelado relacional a nivel de documento (RegNetX-8GF + Transformer + módulo relacional) |
| Parámetros totales | 53.831.335 (v2_english) / 83.853.044 (v2_multilingual) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (max sequence length del reconocedor: 32 en v2_english, 128 en v2_multilingual) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | en, zh, ja, ko, ru, es, fr, de, it, nl, pt (según tags; la variante multilingual documentada cubre en, zh, ja, ko, ru) |
| Licencia | NVIDIA Open Model License (con referencia adicional a Apache 2.0) |
| Formato de pesos | No disponible (tamaño del repo: 0,6 GB) |

## Arquitectura y entrenamiento

Nemotron OCR v2 sigue una arquitectura híbrida de tres componentes entrenados de extremo a extremo. El detector emplea una backbone convolucional RegNetX-8GF (45,4 millones de parámetros) para localizar regiones de texto. El reconocedor es un Transformer pre-norm de secuencias que transcribe las regiones detectadas: en la variante inglesa usa 3 capas, dimensión oculta 256, FFN de 1024, 8 cabezas de atención, longitud máxima de secuencia 32 y un conjunto de 855 caracteres (6,1 millones de parámetros); en la variante multilingüe escala a 6 capas, dimensión 512, FFN de 2048, 8 cabezas, longitud máxima 128 y 14.244 caracteres (36,1 millones de parámetros). El tercer módulo es un modelo relacional multi-capa (2,25-2,29 millones de parámetros) que predice agrupaciones lógicas, orden de lectura y relaciones de layout entre los elementos de texto detectados.

El modelo está optimizado para texto multi-línea, multi-bloque y de escena natural, e incluye redimensionado multi-escala automático para maximizar la precisión. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO (poco habituales en modelos OCR). NVIDIA indica que los datos de entrenamiento fueron seleccionados de forma responsable y auditable, pero no se publican cifras concretas.

## Capacidades

- Detección y transcripción de texto en imágenes de documentos y escenas naturales.
- Análisis de layout y orden de lectura mediante el modelo relacional (agrupaciones lógicas, estructura de bloques).
- Manejo de texto multi-línea y multi-bloque con regiones a nivel de palabra (v2_english) o de línea (v2_multilingual).
- Soporte multilingüe: inglés, chino simplificado y tradicional, japonés, coreano y ruso en la variante multilingual; los tags del repo añaden es, fr, de, it, nl y pt.
- Procesamiento por lotes (B x 3 x H x W) y de imagen única (3 x H x W).
- Agregación de salida configurable a nivel de palabra, frase o párrafo.
- Entrada en RGB PNG/JPEG con rangos float32 [0,1] o uint8 [0,255] con conversión automática.
- Salida estructurada (formato exacto no detallado en la información disponible).
- No dispone de tool calling, capacidades agénticas propias ni generación de lenguaje; su rol es alimentar esos sistemas con texto extraído.

## Casos de uso

- Digitalización de facturas y documentos financieros: el detector localiza campos y el modelo relacional reconstruye el orden de lectura, permitiendo extraer importes, fechas y emisores con estructura tabular preservada para su volcado a ERP.
- Pipelines de RAG multimodal: convertir PDFs escaneados e imágenes en texto con layout para indexar en bases vectoriales, aprovechando la salida estructurada y el orden de lectura correcto para no fragmentar párrafos.
- Procesamiento de documentación multilingüe: la variante multilingual transcribe contratos o manuales en chino, japonés, coreano y ruso, útil en entornos de comercio internacional o compliance.
- Extracción de texto en escenas naturales: lectura de matrículas, carteles o etiquetas en imágenes de campo, gracias al entrenamiento sobre escenas naturales y al redimensionado multi-escala.
- Asistentes de helpdesk de RR. HH. y TI: NVIDIA cita explícitamente estos dominios como casos de personalización; el modelo extrae texto de capturas y documentos internos para alimentar asistentes de búsqueda.
- Automatización de ingesta documental por lotes: el soporte de batches y la orientación a bajo latency/throughput de NeMo Retriever lo hacen adecuado para colas de procesamiento masivo en servidores con GPU.
- Accesibilidad: transcripción de imágenes con texto para lectores de pantalla, con orden de lectura preservado por el módulo relacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas comparativas de precisión (por ejemplo, F1 en detección o tasa de error de caracteres) frente a otros motores OCR.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 53,8-83,9 millones de parámetros, el modelo es muy ligero y cabe holgadamente en cualquier GPU consumer moderna (estimación orientativa: menos de 1 GB en fp32 para los pesos, más memoria para activaciones y batches).
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; el despliegue oficial se distribuye vía contenedor NGC (`nemoretriever-ocr-v2`) y build.nvidia.com, orientado a GPUs de datacenter (A100, H100) y también viable en RTX 4090 y gamas inferiores.
- Cabe en GPU consumer: sí, por tamaño de parámetros; la variante multilingual es la más exigente pero sigue siendo un modelo pequeño.
- Opciones de despliegue: contenedor NGC de NeMo Microservices, endpoint en build.nvidia.com, y despliegue local con los pesos del repo. No se documenta soporte para vLLM, llama.cpp u Ollama (no es un modelo de lenguaje).
- Latencia y throughput: no disponibles en la información proporcionada; NVIDIA declara optimización para "lowest latency and highest throughput" sin cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Layout / orden de lectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron OCR v2 (este) | 53,8M / 83,9M | en, zh, ja, ko, ru (+ tags) | Sí, modelo relacional | NVIDIA Open Model License | Hugging Face, NGC, build.nvidia.com |
| Tesseract OCR | No disponible | Muy amplio | Limitado (heurístico) | Apache 2.0 | Open source |
| PaddleOCR | No disponible | Amplio (incl. zh) | Parcial | Apache 2.0 | Open source |
| DocTR (Mindee) | No disponible | Varios | Parcial | Apache 2.0 | Open source |

No se dispone de datos de rendimiento comparativo publicados en la información proporcionada, por lo que la comparación se limita a parámetros, idiomas, licencia y disponibilidad.

## Limitaciones y advertencias

- La model card no publica métricas de precisión ni comparativas; no es posible evaluar su calidad frente a alternativas sin pruebas propias.
- La variante documentada como multilingual cubre en, zh, ja, ko y ru; los idiomas es, fr, de, it, nl y pt solo aparecen en los tags del repo, sin confirmación en la documentación del modelo.
- El reconocedor tiene longitud máxima de secuencia de 32 (english) o 128 (multilingual), lo que limita la transcripción de líneas muy largas.
- Riesgo de errores en imágenes de baja resolución, ruido o tipografías no vistas; el redimensionado multi-escala mitiga pero no elimina este problema.
- No es un modelo generativo: no razona, no responde preguntas ni hace tool calling; cualquier uso agéntico requiere un LLM adicional.
- La licencia NVIDIA Open Model License debe revisarse para uso comercial; aunque NVIDIA declara el modelo "ready for commercial use", las condiciones exactas (atribución, restricciones) están en el acuerdo enlazado.
- Esta réplica concreta (Metausermac13/nemotron-ocr-v2) tiene 22 descargas y 0 likes, y no está verificada como oficial; para producción conviene usar el repo oficial `nvidia/nemotron-ocr-v2`.
- No se documentan sesgos específicos, pero un OCR multilingüe puede tener peor rendimiento en idiomas o alfabetos infrarrepresentados en el entrenamiento.

## Enlaces

- Repositorio Hugging Face (réplica): https://huggingface.co/Metausermac13/nemotron-ocr-v2
- Repositorio oficial NVIDIA: https://huggingface.co/nvidia/nemotron-ocr-v2
- Demo en build.nvidia.com: https://build.nvidia.com/nvidia/nemotron-ocr-v2
- Contenedor NGC: https://catalog.ngc.nvidia.com/orgs/nvidia/teams/nemo-microservices/containers/nemoretriever-ocr-v2
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Licencia Apache 2.0 (referenciada): https://www.apache.org/licenses/LICENSE-2.0.txt

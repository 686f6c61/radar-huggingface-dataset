# randomguyforrealszzzzzzzz/GLM-OCR

## Resumen

GLM-OCR es un modelo multimodal de reconocimiento óptico de caracteres (OCR) y comprensión de documentos complejos, desarrollado por zai-org (el equipo detrás de la familia GLM). Resuelve el problema del parsing estructurado de documentos reales —tablas complejas, fórmulas matemáticas, sellos, documentos con mucho código— y la extracción de información estructurada a partir de imágenes y PDF, superando las limitaciones de los OCR clásicos en maquetaciones no triviales.

El modelo se construye sobre una arquitectura encoder–decoder GLM-V: un encoder visual CogViT preentrenado con datos imagen–texto a gran escala, un conector multimodal ligero con downsampling eficiente de tokens y un decoder de lenguaje GLM-0.5B. Incorpora Multi-Token Prediction (MTP) loss y aprendizaje por refuerzo full-task estable durante el entrenamiento. Con unos 1.325 millones de parámetros totales (el autor cita 0.9B para el núcleo), está pensado para inferencia de alta concurrencia y despliegue en el borde.

Su relevancia actual radica en que combina un rendimiento de referencia en benchmarks de comprensión de documentos (94,62 en OmniDocBench V1.5, primer puesto según el autor) con un tamaño reducido, licencia MIT y soporte nativo en vLLM, SGLang, Transformers y Ollama. Además, el pipeline completo integra PP-DocLayout-V3 para análisis de maquetación y reconocimiento paralelo, lo que facilita su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder–decoder multimodal GLM-V (encoder visual CogViT + conector cross-modal + decoder GLM-0.5B) |
| Parametros totales | 1.325.258.240 (~1,33B); el autor cita 0,9B para el núcleo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | zh, en, fr, es, ru, de, ja, ko |
| Licencia | MIT (el pipeline con PP-DocLayoutV3 usa Apache 2.0) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

GLM-OCR es un modelo encoder–decoder multimodal. El encoder visual CogViT está preentrenado con datos imagen–texto a gran escala; le sigue un conector cross-modal ligero que aplica downsampling eficiente de tokens para reducir el coste computacional antes de pasar al decoder de lenguaje GLM-0.5B. El entrenamiento introduce Multi-Token Prediction (MTP) loss, que predice varios tokens futuros simultáneamente para mejorar la eficiencia de entrenamiento y la precisión, junto con un esquema de aprendizaje por refuerzo full-task estable orientado a mejorar la generalización en tareas de reconocimiento.

El sistema completo se apoya en un pipeline de dos etapas: análisis de maquetación mediante PP-DocLayout-V3 y reconocimiento paralelo. Esta combinación permite manejar maquetaciones diversas (tablas, fórmulas, sellos, código) de forma robusta. El número de tokens de entrenamiento, la composición exacta del dataset y los detalles de RLHF/DPO no están disponibles en la información proporcionada.

## Capacidades

- Reconocimiento de texto en imágenes y PDF (text recognition).
- Reconocimiento de fórmulas matemáticas (formula recognition).
- Reconocimiento de tablas (table recognition).
- Extracción de información estructurada siguiendo un esquema JSON estricto.
- Comprensión de documentos complejos con maquetaciones reales (tablas complejas, documentos con código, sellos).
- Procesamiento multimodal imagen–texto conversacional (pipeline image-to-text).
- Soporte multilingüe en 8 idiomas: chino, inglés, francés, español, ruso, alemán, japonés y coreano.
- Integración en pipelines de producción mediante SDK oficial con análisis de maquetación y salida estructurada.
- Soporte de despliegue en vLLM, SGLang, Transformers y Ollama.
- Compatible con endpoints (tag endpoints_compatible).

## Casos de uso

- Digitalización masiva de archivos: el modelo convierte imágenes y PDF escaneados en Markdown estructurado, con un throughput declarado de 1,86 páginas/segundo en PDF y 0,67 imágenes/segundo, adecuado para procesos por lotes de gran volumen.
- Extracción de datos de documentos de identidad: usando un esquema JSON estricto se pueden extraer campos como número de identificación, nombre, fecha de nacimiento y dirección de forma directamente consumible por sistemas downstream.
- Procesamiento de facturas y albaranes: la capacidad de reconocimiento de tablas permite extraer líneas de detalle, importes e impuestos manteniendo la estructura tabular.
- Conversión de documentación técnica y papers: el reconocimiento de fórmulas matemáticas facilita transformar artículos científicos y manuales con ecuaciones a formatos editables (Markdown/LaTeX).
- Automatización de back-office financiero: extracción estructurada de estados de cuenta y formularios con maquetaciones heterogéneas, reduciendo la introducción manual de datos.
- Digitalización de documentación multilingüe: al cubrir 8 idiomas, un mismo despliegue puede procesar documentos en chino, inglés, español, japonés, etc., sin cambiar de modelo.
- Despliegue en el borde y servicios de alta concurrencia: con ~1,33B parámetros y soporte en Ollama/vLLM/SGLang, es viable en infraestructura modesta para servicios OCR con muchas peticiones simultáneas.

## Benchmarks y rendimiento

| Benchmark | Resultado | Nota |
|---|---|---|
| OmniDocBench V1.5 | 94,62 | Primer puesto global según el autor |
| Reconocimiento de fórmulas | SOTA (sin cifra publicada) | Según model card |
| Reconocimiento de tablas | SOTA (sin cifra publicada) | Según model card |
| Extracción de información | SOTA (sin cifra publicada) | Según model card |
| Throughput PDF | 1,86 páginas/segundo | Réplica única, concurrencia 1 |
| Throughput imagen | 0,67 imágenes/segundo | Réplica única, concurrencia 1 |

Los resultados detallados por benchmark se presentan únicamente como imágenes en la model card; no se dispone de las cifras numéricas completas más allá de OmniDocBench V1.5.

## Requisitos de hardware

- VRAM estimada: con ~1,33B parámetros en safetensors (2,7 GB de repo), la inferencia en fp16 requiere aproximadamente 3 GB de VRAM; en cuantizaciones de 8 bits o 4 bits bajaría de forma sustancial (cifras exactas no disponibles).
- GPU recomendadas: cabe holgadamente en GPUs de consumo (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090) y en GPUs de datacenter (A100, H100) para alta concurrencia.
- Despliegue: soportado en vLLM, SGLang, Transformers y Ollama; el SDK oficial integra PP-DocLayout-V3 para el pipeline completo de parsing.
- Latencia y throughput: 1,86 páginas/segundo en PDF y 0,67 imágenes/segundo en imagen, medidos en réplica única y concurrencia 1; el rendimiento escala con réplicas y concurrencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-OCR | ~1,33B | no disponible | OCR multimodal encoder–decoder | MIT | HF + SDK + API |
| PaddleOCR / PP-DocLayout-V3 | no disponible | no disponible | OCR clásico + layout | Apache 2.0 | HF / GitHub |
| MinerU | no disponible | no disponible | Parsing de documentos | no disponible | GitHub |

No se dispone de datos de benchmarks comparativos numéricos frente a estos modelos en la información proporcionada; la model card solo indica que GLM-OCR supera a modelos comparables en velocidad y resultados en OmniDocBench V1.5.

## Limitaciones y advertencias

- El modelo está limitado a dos escenarios de prompt: parsing de documentos (texto, fórmula, tabla) y extracción de información con esquema JSON estricto; no es un asistente general.
- En extracción de información, la salida debe adherirse estrictamente al esquema JSON definido para garantizar la compatibilidad downstream.
- El SDK oficial está diseñado únicamente para tareas de parsing de documentos; para extracción de información hay que ejecutar inferencia directa con el modelo.
- Riesgo de alucinación en campos extraídos o en la transcripción de texto poco legible; conviene validación posterior en producción.
- No se han publicado datos sobre sesgos, longitud de contexto ni composición del dataset de entrenamiento.
- La licencia del modelo es MIT, pero el pipeline completo integra PP-DocLayout-V3 bajo Apache 2.0; hay que respetar ambas licencias en uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor es un usuario no verificado; conviene contrastar con la fuente oficial de zai-org antes de adoptarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/randomguyforrealszzzzzzzz/GLM-OCR
- Repositorio oficial / SDK: https://github.com/zai-org/GLM-OCR
- Informe técnico (arXiv): https://arxiv.org/abs/2603.10910
- API oficial: https://docs.z.ai/guides/vlm/glm-ocr
- Cookbook SGLang: https://cookbook.sglang.io/autoregressive/GLM/GLM-OCR
- Recetas vLLM: https://recipes.vllm.ai/zai-org/GLM-OCR
- Documentación Transformers: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/glm_ocr.md
- PP-DocLayout-V3: https://huggingface.co/PaddlePaddle/PP-DocLayoutV3
- PaddleOCR: https://github.com/PaddlePaddle/PaddleOCR
- MinerU: https://github.com/opendatalab/MinerU
- Discord: https://discord.gg/QR7SARHRxK

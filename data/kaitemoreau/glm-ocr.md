# kaitemoreau/GLM-OCR

## Resumen

GLM-OCR es un modelo multimodal de reconocimiento óptico de caracteres (OCR) orientado a la comprensión de documentos complejos, desarrollado por el equipo de GLM (zai-org). Se construye sobre una arquitectura encoder-decoder GLM-V que combina el encoder visual CogViT, preentrenado con datos masivos de imagen-texto, un conector cross-modal ligero con downsampling eficiente de tokens y un decoder de lenguaje GLM-0.5B. El modelo integra además una pérdida de Multi-Token Prediction (MTP) y aprendizaje por refuerzo estable sobre la tarea completa para mejorar la eficiencia de entrenamiento y la precisión de reconocimiento.

El modelo resuelve el problema del parsing estructurado de documentos reales: tablas complejas, fórmulas matemáticas, documentos con mucho código, sellos y layouts no triviales. Su propuesta diferencial es alcanzar resultados de estado del arte con un tamaño muy reducido (en torno a 0.9B parámetros activos según la model card, 1.325 millones de parámetros totales según los pesos en safetensors), lo que habilita despliegues de alta concurrencia y en el borde.

Es relevante ahora porque el ecosistema OCR de código abierto está migrando hacia modelos VLM ligeros desplegables con vLLM, SGLang y Ollama, y GLM-OCR se posiciona como una alternativa de peso pluma con licencia MIT y SDK oficial, lo que reduce la fricción de integración en pipelines de document intelligence en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder multimodal GLM-V (encoder visual CogViT + conector cross-modal + decoder GLM-0.5B) |
| Parametros totales | 1.325.258.240 (según safetensors); la model card indica 0.9B |
| Parametros activos | No disponible (no se describe como MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (compatible con despliegue en vLLM, SGLang, Ollama y Transformers) |
| Idiomas soportados | zh, en, fr, es, ru, de, ja, ko |
| Licencia | MIT (el pipeline completo integra PP-DocLayoutV3 bajo Apache 2.0) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

GLM-OCR sigue una arquitectura encoder-decoder multimodal. El encoder visual es CogViT, preentrenado a gran escala con pares imagen-texto; le sigue un conector cross-modal ligero que aplica downsampling eficiente de tokens para reducir el coste computacional antes de pasar al decoder de lenguaje GLM-0.5B. El entrenamiento incorpora una pérdida de Multi-Token Prediction (MTP), que predice varios tokens futuros de forma simultánea para acelerar la convergencia y mejorar la calidad de la representación, junto con un esquema de aprendizaje por refuerzo estable sobre la tarea completa (full-task RL) que busca mejorar la generalización en dominios diversos.

En el plano de pipeline, el modelo se combina con PP-DocLayout-V3 para un flujo en dos etapas: análisis de layout y reconocimiento en paralelo. Esta separación permite manejar documentos con estructuras heterogéneas (columnas, tablas, fórmulas, sellos) sin que el decoder tenga que resolver el layout de forma implícita. La model card no detalla el número exacto de tokens de entrenamiento ni la composición completa del dataset, por lo que esos datos deben considerarse no disponibles.

## Capacidades

- Reconocimiento de texto (Text Recognition) en imágenes y páginas de documento.
- Reconocimiento de fórmulas matemáticas (Formula Recognition).
- Reconocimiento de tablas (Table Recognition) con salida estructurada.
- Extracción de información estructurada siguiendo un esquema JSON estricto proporcionado en el prompt.
- Parsing de documentos a Markdown mediante el SDK oficial, con análisis de layout integrado.
- Comprensión de layouts complejos del mundo real: tablas densas, documentos con código, sellos y formularios.
- Soporte multilingüe en ocho idiomas: chino, inglés, francés, español, ruso, alemán, japonés y coreano.
- Interfaz conversacional (pipeline image-to-text, tag conversational) apta para integración en asistentes documentales.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, audio ni visión general más allá del OCR de documentos.

## Casos de uso

- Digitalización masiva de archivos administrativos: el modelo convierte PDFs e imágenes escaneadas en Markdown estructurado con el SDK oficial, que integra PP-DocLayout-V3 para separar columnas, tablas y bloques de texto, reduciendo el trabajo manual de catalogación.
- Extracción de datos de documentos de identidad: con un prompt que define un esquema JSON (número de identificación, nombre, fecha de nacimiento, dirección), el modelo devuelve campos estructurados listos para validación en un flujo KYC.
- Procesamiento de facturas y albaranes: la capacidad de reconocimiento de tablas permite extraer líneas de detalle, importes e impuestos en formato tabular para su volcado en un ERP.
- Conversión de documentación técnica y papers a Markdown: el reconocimiento de fórmulas y código facilita migrar documentación científica o manuales con ecuaciones a wikis internas y repositorios.
- Automatización de back office en banca y seguros: la extracción con esquema JSON estricto encaja en pipelines donde el resultado debe validarse contra un contrato de datos antes de persistirse.
- Digitalización de documentación multilingüe: al cubrir ocho idiomas, un mismo despliegue puede atender expedientes en español, inglés, francés o alemán sin cambiar de modelo.
- Servicios de OCR de alta concurrencia: con un tamaño reducido y soporte en vLLM y SGLang, el modelo puede servirse con múltiples réplicas para absorber picos de tráfico en plataformas de gestión documental.
- Despliegue en el borde: su tamaño permite ejecutarlo en Ollama sobre hardware modesto para escaneo y digitalización en oficina o dispositivos locales.

## Benchmarks y rendimiento

La model card reporta los siguientes datos de rendimiento:

| Benchmark / metrica | Resultado |
|---|---|
| OmniDocBench V1.5 | 94.62 (puesto #1 global según el autor) |
| Throughput en PDF | 1.86 páginas/segundo |
| Throughput en imágenes | 0.67 imágenes/segundo |

Las condiciones de la prueba de velocidad son una réplica única y concurrencia única, comparando el parsing y exportación a Markdown desde imagen y PDF frente a otros métodos OCR. La model card incluye gráficas de comparación en docparse, realworld y speed, pero no se proporcionan en el texto los valores numéricos desglosados de MMLU, HumanEval, GSM8K ni de benchmarks por tarea (fórmulas, tablas, extracción), por lo que esos datos deben considerarse no disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.325 millones de parámetros en safetensors (aproximadamente 2.65 GB en fp16), la inferencia en precisión completa requiere del orden de 3-4 GB de VRAM; con cuantización de 8 bits bajaría a unos 1.5-2 GB y con 4 bits a menos de 1 GB, aunque no se publican recetas de cuantización específicas.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, cabe holgadamente en GPUs de consumo como RTX 3060, RTX 4060, RTX 4070 o RTX 4090, y en GPUs de datacenter como A10, L4, A100 o H100 para servir múltiples réplicas.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM en fp16, y en GPUs integradas o CPU con cuantización, aunque el rendimiento en estos casos no está documentado.
- Opciones de despliegue: vLLM (recetas oficiales), SGLang (cookbook oficial), Transformers (documentación de model_doc/glm_ocr) y Ollama. El SDK oficial añade PP-DocLayout-V3 para el pipeline completo de parsing.
- Latencia y throughput: 1.86 páginas/segundo en PDF y 0.67 imágenes/segundo en imagen, medido en una sola réplica y concurrencia única. No se detalla el hardware empleado en la medición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-OCR | 1.325M (safetensors) / 0.9B según model card | No disponible | VLM OCR encoder-decoder (CogViT + GLM-0.5B) | MIT | Hugging Face, vLLM, SGLang, Ollama, API |
| PaddleOCR | No disponible en la información | No disponible | Pipeline OCR clásico + detección de layout | Apache 2.0 (PP-DocLayoutV3) | PaddlePaddle, Hugging Face |
| MinerU | No disponible en la información | No disponible | Herramienta de parsing de documentos | No disponible en la información | GitHub, Hugging Face |

No se dispone de datos de benchmarks comparativos numéricos frente a PaddleOCR o MinerU en la información proporcionada, más allá de las gráficas de la model card que no se incluyen en texto. La comparativa se limita por tanto a enfoque, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo está especializado en OCR y comprensión de documentos; no es un modelo de propósito general y no se documentan capacidades de razonamiento abierto, código o matemáticas más allá del reconocimiento de contenido.
- La extracción de información exige que el prompt defina un esquema JSON estricto; el output debe adherirse a ese esquema para ser procesable, lo que impone disciplina en el diseño de prompts y validación posterior.
- El SDK oficial está diseñado únicamente para tareas de parsing de documentos; para extracción de información hay que invocar el modelo directamente.
- El pipeline completo depende de PP-DocLayout-V3, licenciado bajo Apache 2.0, por lo que las obligaciones de esa licencia aplican al componente de layout aunque el modelo sea MIT.
- No se publican datos sobre sesgos, tasas de alucinación, robustez ante imágenes degradadas ni comportamiento en idiomas distintos de los ocho declarados.
- No se especifican la longitud de contexto, los tipos de cuantización soportados ni el hardware de referencia de los benchmarks, lo que limita la reproducibilidad de las cifras de velocidad.
- El repositorio de Hugging Face procede de un usuario tercero (kaitemoreau) con 0 descargas y 0 likes en el momento de la consulta; conviene verificar la procedencia oficial (zai-org) antes de usarlo en producción.
- La licencia MIT permite uso comercial, pero debe revisarse la cadena de dependencias (PP-DocLayout-V3 Apache 2.0) para cumplir con las obligaciones de atribución.

## Enlaces

- Hugging Face: https://huggingface.co/kaitemoreau/GLM-OCR
- Repositorio oficial y SDK: https://github.com/zai-org/GLM-OCR
- Informe técnico: https://arxiv.org/abs/2603.10910
- API oficial: https://docs.z.ai/guides/vlm/glm-ocr
- Cookbook de SGLang: https://cookbook.sglang.io/autoregressive/GLM/GLM-OCR
- Recetas de vLLM: https://recipes.vllm.ai/zai-org/GLM-OCR
- Documentación de Transformers: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/glm_ocr.md
- PP-DocLayout-V3: https://huggingface.co/PaddlePaddle/PP-DocLayoutV3
- PaddleOCR: https://github.com/PaddlePaddle/PaddleOCR
- MinerU: https://github.com/opendatalab/MinerU
- Discord: https://discord.gg/QR7SARHRxK

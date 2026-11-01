# affanaamin/Dwanchi-VLM-7B-v0.1

## Resumen

Dwanchi-VLM-7B-v0.1 es un modelo de visión-lenguaje (VLM) multimodal de pesos abiertos desarrollado por el usuario affanaamin, especializado en la extracción, el anclaje visual (grounding) y la auditoría de registros financieros públicos bilingües (urdu nastaliq e inglés) degradados. Se construye sobre Qwen/Qwen2.5-VL-7B-Instruct mediante un ajuste fino QLoRA de 4 bits con la librería Unsloth, y está orientado a presupuestos municipales, registros de saneamiento y expedientes corporativos de Pakistán y Asia del Sur.

El modelo aborda un problema concreto: gran parte de la información fiscal municipal y provincial en Pakistán se publica únicamente como PDF escaneados no indexables, con maquetación de rejilla que mezcla columnas en inglés (de izquierda a derecha) con clasificaciones en urdu nastaliq (de derecha a izquierda). Los OCR clásicos y los VLM en la nube fallan en este escenario por el sangrado entre columnas numéricas y las inversiones de dígitos RTL-LTR, además de las restricciones de soberanía de datos que exigen los auditores municipales.

La versión v0.1 es una «canary release» entrenada sobre 70 páginas escaneadas y orientada únicamente a la extracción de tablas estructuradas. Se distribuye con licencia Apache 2.0, soporta urdu e inglés y está pensada para ejecutarse de forma completamente aislada (air-gapped) en GPUs de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language transformer (base Qwen2.5-VL-7B-Instruct) con adaptador QLoRA |
| Parámetros totales | 8,34B (base); adaptador entrenable: 51.521.536 (0,62%) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4-bit BNF4 (QLoRA); inferencia 4-bit con Unsloth |
| Idiomas soportados | ur, en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA); librería unsloth |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-VL-7B-Instruct, un transformer multimodal con codificador visual, y aplica un ajuste fino mediante QLoRA de 4 bits (BNF4) con Unsloth. El adaptador de la v0.1 usa rango `r = 16` y `lora_alpha = 16`, con 51.521.536 parámetros entrenables sobre un total de 8,34B (0,62%). El entrenamiento se realizó sobre 70 páginas municipales escaneadas, con la tarea única de extracción de tablas estructuradas, durante 60 pasos con `adamw_8bit` y tasa de aprendizaje `2.0e-4`, alcanzando una pérdida final de entrenamiento de 0,7689 en 437,7 segundos sobre Kaggle Dual T4.

La resolución máxima de imagen configurada es `1280 * 28 * 28` (1.003.520 píxeles). El modelo incorpora normalización de dígitos perso-árabes extendidos (`۰-۹`) y árabes orientales (`٠-٩`), y está diseñado para manejar ligaduras en cascada del urdu nastaliq. La model card menciona explícitamente modos de fallo medidos (tasa de alucinación numérica, sangrado entre columnas, inversión de dígitos RTL-LTR y error de reconciliación aritmética) que se cuantifican en el conjunto de evaluación Dwanchi-Bench.

## Capacidades

- Extracción estructurada de tablas a partir de imágenes de documentos financieros escaneados.
- Reconocimiento óptico de caracteres (OCR) bilingüe urdu nastaliq e inglés en documentos degradados.
- Normalización de numerales perso-árabes extendidos y árabes orientales.
- Anclaje visual 2D (bounding boxes `[ymin, xmin, ymax, xmax]`), según la suite de evaluación descrita.
- Exportación a SQLite / `.sql` normalizado y a JSON-LD con esquema Schema.org (según la model card).
- Conversación multimodal imagen-texto (pipeline `image-text-to-text`).
- Capacidades heredadas de Qwen2.5-VL-7B-Instruct (no detalladas específicamente para esta versión en la información disponible).

## Casos de uso

- Auditoría de presupuestos municipales: el modelo extrae tablas de presupuestos de la Tehsil Municipal Administration (TMA) de Haripur y de consejos de aldea, permitiendo a auditores reconciliar asignaciones frente a gastos reales sin enviar documentos sensibles a la nube.
- Extracción de gacetas financieras provinciales: procesa whitepapers de presupuestos de desarrollo y corrientes del Departamento de Hacienda de Khyber Pakhtunkhwa, convirtiendo PDF escaneados en registros estructurados consultables.
- Transparencia en presupuestos de equidad cívica: digitaliza archivos del Centre for Policy and Public Research (CPPR, IMSciences Peshawar) para análisis de equidad presupuestaria y periodismo de investigación.
- Auditoría de gobernanza corporativa: extrae datos de divulgaciones anuales de gobernanza y propiedad familiar («Dynasty Discount») de la Pakistan Stock Exchange (PSX).
- Digitalización de registros de saneamiento y servicios urbanos: procesa libros de suministro de agua, gestión de residuos sólidos y defensas contra inundaciones de consejos locales.
- Despliegue aislado en entornos con restricciones de soberanía de datos: al ejecutarse en menos de 6 GB de VRAM en 4 bits, permite auditorías locales en equipos de consumo sin conexión a APIs externas.
- Evaluación de robustez frente a alucinaciones numéricas: sirve como base para ejecutar Dwanchi-Bench y medir tasas de error en extracción de tablas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de rendimiento comparativos (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente reporta métricas de entrenamiento y de integridad del corpus de evaluación:

| Métrica | Valor |
|---|---|
| Pérdida final de entrenamiento (v0.1) | 0,7689 |
| Pasos de optimización (v0.1) | 60 |
| Tiempo de entrenamiento (v0.1) | 437,7 s (Kaggle Dual T4) |
| Reconciliación aritmética del corpus gold | 100,0% |
| Completitud de campos bilingües (urdu+inglés) | 100,0% (417 registros) |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,5 GB en cuantización 4-bit con Unsloth.
- GPU recomendadas: no se especifican modelos concretos; la model card indica ejecución en GPUs de consumo con menos de 6 GB de VRAM.
- Cabe en GPU de consumo: sí, según la model card (menos de 6 GB de VRAM en 4 bits).
- Opciones de despliegue: inferencia 4-bit con Unsloth; el resto de opciones (vLLM, llama.cpp, Ollama, TGI) no se detallan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Dwanchi-VLM-7B-v0.1 | 8,34B (adaptador 51,5M) | no disponible | Apache 2.0 | HuggingFace | Especializado en documentos fiscales urdu/inglés |
| Qwen2.5-VL-7B-Instruct (base) | 7B | no disponible en la información | Apache 2.0 | HuggingFace | Modelo generalista multimodal; base del ajuste |
| Dwanchi-VLM-7B-v0.2 | 8,40B (adaptador 103,0M) | no disponible | Apache 2.0 | HuggingFace | Versión multitarea (tablas, Q&A fiscal, grounding) |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- La v0.1 es una «canary release» entrenada solo con 70 páginas y una única tarea (extracción de tablas), por lo que su generalización es limitada frente a la v0.2.
- Riesgo de alucinación numérica y sangrado entre columnas en maquetaciones de rejilla complejas, documentado como modo de fallo medido por el autor.
- Posible inversión de dígitos RTL-LTR en escaneos degradados.
- Cobertura lingüística limitada a urdu e inglés; no se declaran otros idiomas.
- Longitud de contexto no especificada en la información disponible.
- Aunque la licencia es Apache 2.0, conviene verificar las obligaciones de atribución y las condiciones del modelo base Qwen2.5-VL-7B-Instruct para uso comercial en producción.
- Al ser un adaptador LoRA, requiere cargar el modelo base Qwen2.5-VL-7B-Instruct para su uso.
- No se han publicado evaluaciones independientes de sesgos ni de robustez fuera del corpus del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/affanaamin/Dwanchi-VLM-7B-v0.1
- Versión v0.2: https://huggingface.co/affanaamin/Dwanchi-VLM-7B-v0.2
- Dataset en HuggingFace: https://huggingface.co/datasets/affanaamin/dwanchi-vlm-dataset
- Dataset en Kaggle: https://www.kaggle.com/datasets/affanaamin/dwanchi-vlm-dataset-v2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0

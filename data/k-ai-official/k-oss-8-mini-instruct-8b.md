# K-Ai-Official/K-Oss-8-Mini-Instruct-8B

## Resumen

K-Oss 8 Mini Instruct es un modelo multimodal de 8B parámetros desarrollado por K-Ai (Kortex AI) que acepta texto e imágenes como entrada y genera texto en inglés, indonesio y japonés. Se construye mediante un fine-tuning con QLoRA sobre Qwen3-VL-8B-Instruct, congelando la torre de visión y entrenando únicamente las capas de atención y MLP del modelo de lenguaje. El repositorio contiene los pesos fusionados en 16 bits, no el adaptador.

A pesar del nombre, no guarda relación de destilación con el modelo grande de la familia K-Oss 8 (120B totales / 12B activos, basado en NVIDIA Nemotron 3.5 Super VL): comparte marca, objetivos y foco lingüístico, pero no pesos ni linaje. Es relevante porque cubre un nicho poco atendido en modelos abiertos: asistencia multimodal con competencia declarada en indonesio y japonés, bajo licencia Apache-2.0 y con un coste de despliegue contenido.

El modelo se publica en estado de beta pública. El autor reconoce explícitamente que no se ha validado a gran escala sobre imágenes reales y que parte de los datos de entrenamiento son sintéticos y no revisados por hablantes nativos, lo que condiciona su uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL), visión + lenguaje |
| Parámetros totales | ~8,8B (según model card; 8B nominales) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento usó secuencias de 1536 tokens como máximo) |
| Tipos de cuantización | pesos publicados en 16 bits; cuantización GGUF/AWQ/GPTQ no disponible en el repo |
| Idiomas soportados | inglés, indonesio, japonés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La base es Qwen3-VL-8B-Instruct, un transformer multimodal con una torre de visión acoplada a un modelo de lenguaje. El fine-tuning emplea QLoRA con r=16 y alpha=16 sobre los pesos base cuantizados a 4 bits, entrenando los módulos de atención y MLP del LM y manteniendo congelada la torre de visión. Posteriormente los adaptadores se fusionan en pesos de 16 bits. Los hiperparámetros publicados incluyen batch size 1 con acumulación de gradiente 8 (efectivo 8), learning rate 1e-4, AdamW de 8 bits, weight decay 0,01, precisión fp16, longitud máxima de secuencia 1536, imágenes redimensionadas a un máximo de 640 px y semilla 3407. El entrenamiento se ejecutó en una única NVIDIA T4 (16 GB) en Google Colab, aunque el número de pasos, la duración y la curva de pérdida aparecen como marcadores sin rellenar (`[[steps]]`, `[[minutes]]`, `[[start]]` -> `[[end]]`) en la model card.

Los datos de entrenamiento (`kai-synth-v1`) son mayoritariamente sintéticos, generados por script con respuestas calculadas exactamente, en los tres idiomas. Cubren tareas de OCR (códigos, números, palabras), recibos en rupias, dólares y yenes, gráficos de barras, tablas, formularios, matemáticas en imagen y conteo de formas; en texto incluyen problemas verbales, hechos generales, traducción entre los tres idiomas, identidad y un conjunto reducido de ejemplos de rechazo y seguridad benigna. No se mezclaron datasets de instrucciones públicos. El conjunto de test se reservó por plantilla de pregunta y por idioma, con un 20% de las palabras de OCR y hechos y frases seleccionadas. Algunos ejemplos de texto (identidad, frases de traducción, hechos, rechazos) se redactaron con asistencia de IA y no fueron revisados por hablantes nativos. No se documenta RLHF ni DPO.

## Capacidades

- Generación de texto conversacional e instrucciones multi-turno en inglés, indonesio y japonés.
- Comprensión de imágenes: OCR de códigos, números y palabras; lectura de recibos con símbolos Rp, $ y ¥; interpretación de gráficos de barras, tablas y formularios.
- Razonamiento matemático básico, incluyendo problemas verbales y matemáticas presentadas en imagen.
- Conteo de formas en imágenes.
- Traducción entre los tres idiomas objetivo.
- Preguntas y respuestas sobre hechos generales.
- Respuestas de identidad del modelo y un conjunto limitado de rechazos ante peticiones dañinas.
- Capacidades multimodales heredadas de Qwen3-VL sujetas a lo conservado tras el fine-tuning (la torre de visión permaneció congelada).
- Soporte de tool calling / function calling: no disponible en la documentación.
- Soporte de agentes y razonamiento multi-paso: no disponible en la documentación.
- Modo thinking, audio o vídeo: no disponible.

## Casos de uso

- Digitalización de recibos y tickets: el modelo lee importes con símbolos monetarios de Indonesia, EE. UU. y Japón y responde en el idioma del usuario, lo que encaja con flujos de contabilidad en mercados del sudeste asiático y Japón. Conviene validar con imágenes reales antes de producción.
- Extracción de datos de formularios y tablas: al haber sido entrenado con formularios y tablas sintéticas, puede emplearse como primer extractor en pipelines de captura documental, con revisión humana posterior.
- OCR asistido para códigos y números: útil en aplicaciones de inventario o verificación donde se fotografía una etiqueta y se pide al modelo que transcriba el código.
- Atención al cliente multilingüe: cubre conversaciones en inglés, indonesio y japonés con una sola instancia, reduciendo la necesidad de desplegar modelos separados por idioma.
- Asistencia educativa: problemas verbales, matemáticas en imagen y explicaciones en los tres idiomas, adecuado para tutores de refuerzo con supervisión docente.
- Traducción de apoyo entre inglés, indonesio y japonés: útil para equipos distribuidos o documentación interna, con revisión humana por la naturaleza sintética de los datos de traducción.
- Prototipado de aplicaciones multimodales: al ser Apache-2.0 y ~8,8B, permite experimentar en una sola GPU consumer con `transformers` y servir como base para fine-tunings específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo incluye evaluaciones internas sobre conjuntos reducidos de retención (20 pruebas por idioma y tarea):

| Idioma | Pruebas in-domain (fine-tuned) | Pruebas in-domain (base) | Q&A general (fine-tuned) | Responde en el idioma correcto |
|---|---|---|---|---|
| Indonesio | 17/20 | 15/20 | 16/20 | 19/20 |
| Inglés | 17/20 | 17/20 | 17/20 | 19/20 |
| Japonés | 14/20 | 12/20 | 13/20 | 16/20 |

Estos datos indican mejoras moderadas frente al modelo base en indonesio y japonés, y paridad en inglés. El tamaño muestral (20 ítems) es demasiado pequeño para extraer conclusiones robustas.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: en torno a 17-18 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda 24 GB o más para comodidad.
- Cuantización a 8 bits: ~9-10 GB de pesos, viable en GPUs de 16 GB como la T4 usada en entrenamiento o una RTX 4080.
- Cuantización a 4 bits: ~5-6 GB de pesos, cabe en GPUs consumer de 8 GB (RTX 3060 Ti, RTX 4060) con margen limitado para imágenes de entrada.
- GPUs recomendadas: A100 40/80 GB, H100 para serving de alta concurrencia; RTX 4090 (24 GB) para 16 bits en single-GPU; RTX 3090/4080 para 8 bits.
- Cabe en GPU consumer: sí, en 4 y 8 bits; en 16 bits requiere 24 GB o más.
- Opciones de despliegue: `transformers` con `AutoModelForImageTextToText` y `AutoProcessor` (ruta oficial documentada). vLLM, llama.cpp, Ollama y TGI no están documentados para este modelo; la compatibilidad con endpoints está etiquetada en el repo pero sin instrucciones.
- Latencia y throughput: no disponibles. El autor no publica métricas de serving.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Multimodal |
|---|---|---|---|---|---|
| K-Oss 8 Mini Instruct | ~8,8B | no disponible | en, id, ja | Apache-2.0 | Sí (imagen + texto) |
| Qwen3-VL-8B-Instruct (base) | ~8,8B | no disponible en esta ficha | multilingüe amplio | Apache-2.0 | Sí |
| K-Oss 8 (familia grande) | 120B totales / 12B activos | no disponible | foco en id, ja, en | sigue términos de Nemotron | Sí (basado en Nemotron 3.5 Super VL) |

La comparación directa con el modelo base es la más informativa: K-Oss 8 Mini Instruct añade foco en indonesio y japonés a costa de un entrenamiento mayoritariamente sintético y con la torre de visión congelada, lo que puede degradar el rendimiento multimodal general respecto a Qwen3-VL-8B-Instruct. No se dispone de datos de benchmarks que permitan cuantificar esa diferencia. Frente a alternativas de la misma categoría (modelos multimodales de ~8B), no se han publicado comparaciones en la información disponible.

## Limitaciones y advertencias

- Estado de beta pública: el autor declara que no se ha probado a gran escala con imágenes reales.
- Datos de entrenamiento mayoritariamente sintéticos y sin datasets públicos de instrucciones; el comportamiento fuera de las plantillas entrenadas puede degradarse.
- Algunos ejemplos de texto se redactaron con asistencia de IA y no fueron revisados por hablantes nativos, lo que puede introducir sesgos o errores idiomáticos, especialmente en japonés (14/20 en pruebas in-domain).
- Riesgo de alucinación en OCR y extracción de datos: las respuestas exactas provienen de un generador sintético y pueden no transferirse a documentos reales con ruido, rotaciones o baja resolución.
- La torre de visión está congelada, por lo que las capacidades visuales son las del modelo base sin adaptación al dominio objetivo.
- Contexto de entrenamiento limitado a 1536 tokens; el contexto efectivo máximo no está documentado y las secuencias largas pueden degradar el rendimiento.
- Idiomas soportados restringidos a inglés, indonesio y japonés; el rendimiento en otros idiomas no está garantizado.
- Licencia Apache-2.0 permite uso comercial, pero el autor excluye explícitamente decisiones médicas, legales o financieras sin supervisión humana cualificada y la generación de contenido dañino o engañoso.
- La model card contiene marcadores sin rellenar (pasos, duración, pérdida), lo que impide reproducir el entrenamiento con precisión.
- No se documentan capacidades de tool calling ni de agentes; no asumir su disponibilidad.
- La ruta de ejemplo en la model card (`Keanualfahd/K-Oss-8-Mini-Instruct`) no coincide con el ID del repositorio (`K-Ai-Official/K-Oss-8-Mini-Instruct-8B`), lo que puede provocar errores al cargar el modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/K-Ai-Official/K-Oss-8-Mini-Instruct-8B
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL (SFTTrainer): no disponible enlace directo en la información proporcionada
- Paper, blog o demo oficial: no disponible

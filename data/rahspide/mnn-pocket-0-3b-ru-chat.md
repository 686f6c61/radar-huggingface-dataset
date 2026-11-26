# Rahspide/MNN-Pocket-0.3B-RU-Chat

## Resumen

MNN-Pocket-0.3B-RU-Chat es un modelo de lenguaje de 302,8 millones de parámetros (303M) especializado en instrucciones y conversación en ruso, desarrollado por el usuario Rahspide. Se construye mediante fine-tuning supervisado (SFT) sobre el modelo de continuación de texto Rahspide/MNN-Pocket-0.3B-RU, que a su vez deriva del modelo bilingüe chino/inglés MNN-Pocket-0.3B. La versión actual (v2.0, publicada el 25 de noviembre de 2026) reconstruye por completo la receta de datos respecto a la v1, reduciendo el presupuesto de entrenamiento de 50M a 12,2M de tokens pero mejorando sustancialmente la adherencia a formatos.

El modelo resuelve un problema muy concreto: disponer de un asistente conversacional en ruso que quepa en dispositivos de recursos limitados (on-device), con licencia Apache 2.0 y pesos disponibles en safetensors y GGUF. Su tamaño de 0,3B parámetros permite inferencia en CPU y GPUs de gama baja, lo que lo hace relevante para aplicaciones móviles, teclados predictivos o asistentes embebidos donde no es viable desplegar modelos de miles de millones de parámetros.

La arquitectura es de tipo transformer denso (sin mezcla de expertos), con una ventana de contexto que no se especifica en la información disponible. El modelo está entrenado para responder en lugar de continuar texto, una distinción deliberada frente a su modelo hermano de continuación. Su relevancia actual radica en la combinación de tamaño reducido, licencia permisiva y soporte nativo de ruso, un nicho poco cubierto por los modelos pequeños de código abierto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3, según tags) |
| Parámetros totales | 302.830.976 (303M) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF Q8_0, Q4_K_M, Q4_1; safetensors en bf16/fp32 |
| Idiomas soportados | Ruso (ru), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 303M parámetros derivado de la familia Qwen3, según los tags del repositorio. Se entrena mediante SFT sobre el modelo de continuación Rahspide/MNN-Pocket-0.3B-RU, que previamente recibió preentrenamiento continuado con 1,2B tokens de texto en ruso. La plantilla de chat es ChatML nativa (`<|im_start|>` / `<|im_end|>`), sin modificaciones, y la pérdida se calcula únicamente sobre los tokens del asistente, enmascarando los turnos de sistema y usuario como contexto.

El entrenamiento v2 utilizó 12,2M tokens de SFT en 610 pasos de optimizador, con batches construidos a partir de ejemplos completos (sin ventanas aleatorias de 1.024 tokens como en v1), padding hasta el ejemplo más largo del batch y truncado de respuestas largas en límites de frase. Se usó una proporción 85/15 ruso-inglés por slot, con un 35% de los slots rusos provenientes de una capa de formato sobremuestreada (1.014 ejemplos con requisito explícito de formato). Hiperparámetros: learning rate 1e-4, scheduler coseno, 5% warmup, fine-tuning completo, bf16 con pesos maestros en fp32 sobre una Kaggle T4, aproximadamente 1,1 horas a unos 3.100 tokens/s.

Los datos provienen de dos fuentes: IlyaGusev/saiga_scored (9.723 diálogos filtrados en ruso más 1.014 ejemplos de capa de formato, 4,85M tokens) y HuggingFaceH4/ultrachat_200k (6.000 diálogos en inglés, 3,67M tokens). Los filtros sobre saiga_scored incluyen: solo ruso, descarte de filas marcadas `is_bad_by_regex`, descarte de puntuación del dataset inferior a 6, diálogos de 80–6.000 caracteres y 2–8 turnos, y descarte de filas donde la respuesta del asistente no comparte ninguna palabra de contenido con la pregunta.

## Capacidades

- Generación de texto conversacional en ruso e inglés, con formato de diálogo multi-turno (system + user + assistant).
- Seguimiento de instrucciones con requisitos de formato explícitos (la capa de formato se sobremuestreó al 35% de los slots rusos).
- Respuesta a preguntas (Q&A) y reescrituras cortas.
- Capacidad bilingüe ruso-inglés, mantenida mediante replay de datos en inglés.
- No dispone de tool calling ni function calling documentado.
- No dispone de modo de razonamiento (thinking mode) documentado.
- No dispone de capacidades de visión ni audio.
- No está diseñado para continuación de texto ni autocompletado (para eso existe el modelo hermano MNN-Pocket-0.3B-RU).

## Casos de uso

- Asistentes conversacionales embebidos en aplicaciones móviles: el modelo cabe en dispositivos de gama baja gracias a sus 303M parámetros y a las cuantizaciones GGUF Q4, permitiendo chat en ruso sin conexión a servidores externos.
- Teclados predictivos y sugerencias de texto en ruso: aunque el modelo está orientado a instrucciones, su base de continuación permite integraciones ligeras donde se necesite generar respuestas cortas contextuales.
- Atención al cliente automatizada de bajo coste: para flujos con preguntas frecuentes y respuestas acotadas en ruso, donde el coste por inferencia es crítico y no se requiere razonamiento complejo.
- Prototipado rápido de aplicaciones de chat en ruso: con licencia Apache 2.0 y pesos en safetensors, se puede integrar en pipelines de Hugging Face Transformers o TGI sin restricciones comerciales.
- Educación y práctica de idiomas: generación de respuestas en ruso para ejercicios de conversación, con la ventaja de que el modelo responde en lugar de continuar el texto del usuario.
- Despliegue en entornos con GPUs de gama baja o CPU: al ser un modelo de 0,3B, puede ejecutarse en una RTX 3060 o incluso en CPU con llama.cpp u Ollama usando GGUF Q4_K_M.
- Filtrado y reescritura de textos cortos en ruso: tareas de normalización o reformulación de frases donde no se necesita un modelo grande.

## Benchmarks y rendimiento

La model card reporta una evaluación propia sobre 90 prompts con requisito explícito de formato, comparando v1 y v2:

| Métrica | v1 | v2 |
|---|---|---|
| Cumplimiento de requisito (escala 1–5), media | 2,52 | 3,81 |
| Diferencia pareada frente a v1 | — | +1,29 (t = 6,9, n = 90) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en bf16/fp16 (303M × 2 bytes), alrededor de 0,3 GB en GGUF Q4_K_M y 0,15 GB en Q4_1 (estimación teórica de pesos; el runtime añade overhead).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060, RTX 4060 o T4 son suficientes. Para entrenamiento, una Kaggle T4 fue suficiente (1,1 horas).
- Cabe en GPUs de consumo: sí, en cualquier GPU consumer moderna (GTX 1650, RTX 3050, RTX 4090) e incluso en CPU.
- Opciones de despliegue: transformers (safetensors), llama.cpp, Ollama y TGI (el repo incluye tag `text-generation-inference` y `endpoints_compatible`); también hay build MNN para despliegue on-device.
- Latencia y throughput estimados: el entrenamiento reporta ~3.100 tokens/s en una T4; no se proporcionan cifras de inferencia. Para un modelo de 0,3B, se espera throughput alto en GPU y decenas de tokens por segundo en CPU con cuantización Q4.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| MNN-Pocket-0.3B-RU-Chat | 303M | No disponible | ru, en | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-0.5B-Instruct | 494M | 32.768 tokens | multilingüe (incl. ru) | Apache 2.0 | safetensors, GGUF |
| SmolLM2-360M-Instruct | 362M | 8.192 tokens | principalmente en | Apache 2.0 | safetensors, GGUF |
| TinyLlama-1.1B-Chat | 1,1B | 2.048 tokens | en (limitado ru) | Apache 2.0 | safetensors, GGUF |

La comparativa es orientativa: Qwen2.5-0.5B-Instruct y SmolLM2-360M-Instruct son alternativas de tamaño similar con licencia Apache 2.0, pero ninguno está específicamente optimizado para ruso. TinyLlama-1.1B-Chat es mayor y con contexto más corto. No se dispone de datos de benchmarks comparativos en la información proporcionada para establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Tamaño muy reducido (303M parámetros): capacidad de razonamiento y conocimiento factual limitados en comparación con modelos de miles de millones de parámetros; riesgo elevado de alucinación en preguntas factuales.
- Entrenado principalmente en ruso e inglés; el rendimiento en otros idiomas no está garantizado.
- La longitud de contexto no está documentada, lo que dificulta planificar despliegues con conversaciones largas.
- No soporta tool calling ni function calling, lo que limita su uso en pipelines de agentes.
- Los datos de entrenamiento provienen de saiga_scored y ultrachat_200k, con posibles sesgos heredados de esas fuentes (estilo, temáticas y sesgos de los datasets originales).
- La evaluación reportada es interna (90 prompts) y no incluye benchmarks estándar; la comparación con otros modelos es limitada.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las licencias de los datasets de entrenamiento (saiga_scored: ver su model card; ultrachat_200k: MIT).
- El modelo está diseñado para responder, no para continuar texto; usarlo para autocompletado producirá resultados deficientes.
- No se documentan medidas de seguridad, filtrado de contenido dañino ni alineación más allá del SFT.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rahspide/MNN-Pocket-0.3B-RU-Chat
- Rama v1: https://huggingface.co/Rahspide/MNN-Pocket-0.3B-RU-Chat/tree/v1
- Modelo base (continuación): https://huggingface.co/Rahspide/MNN-Pocket-0.3B-RU
- Dataset saiga_scored: https://huggingface.co/datasets/IlyaGusev/saiga_scored
- Dataset ultrachat_200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k

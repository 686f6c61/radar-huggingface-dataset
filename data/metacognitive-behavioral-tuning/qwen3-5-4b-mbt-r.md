# metacognitive-behavioral-tuning/Qwen3.5-4B-MBT-R

## Resumen

Qwen3.5-4B-MBT-R es un ajuste fino supervisado (SFT) de Qwen/Qwen3.5-4B-Base, desarrollado por el grupo de investigación metacognitive-behavioral-tuning. El modelo forma parte de un estudio comparativo sobre destilación de comportamientos metacognitivos mediante edición agéntica de trazas de razonamiento: en concreto, esta variante se entrena sobre trazas reescritas íntegramente en una sola llamada por el editor MBT-R. El objetivo es transferir a un modelo compacto de 4B parámetros patrones de razonamiento de un profesor de mayor capacidad, incluyendo comportamientos de autorreflexión y verificación.

El modelo tiene 4.539.265.536 parámetros en precisión bf16, se distribuye en safetensors con licencia Apache-2.0 y está orientado a generación de texto con razonamiento explícito en bloques `<think>`. Está especializado en matemáticas y razonamiento paso a paso, y se publica junto a tres variantes hermanas (Unedited-SFT, MBT-I y MBT-A) para aislar el efecto del método de edición de trazas.

Es relevante porque permite evaluar de forma controlada si la reescritura completa de trazas por parte de un editor mejora la calidad del razonamiento destilado frente a la inserción de pasos o la edición agéntica, en un rango de tamaño (4B) desplegable en hardware de consumo y con contexto de entrenamiento de 131.072 tokens.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5; detalles específicos de capas y atención no disponibles) |
| Parámetros totales | 4.539.265.536 (4,54B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens en entrenamiento; longitud máxima de inferencia no especificada de forma independiente |
| Tipos de cuantización | Pesos publicados en bf16; no se documentan cuantizaciones oficiales (GGUF, AWQ, GPTQ no disponibles) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 (datos de entrenamiento CC BY-SA 4.0) |
| Formato de pesos | safetensors (bf16) |
| Modalidad | Texto e image-text-to-text (según tags; capacidades de visión no detalladas en la model card) |
| Modelo base | Qwen/Qwen3.5-4B-Base |
| Tamaño del repositorio | 9,1 GB |
| Método de entrenamiento | SFT de todos los parámetros, pérdida solo en tokens del asistente |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base, un transformer decoder-only denso de 4,54B parámetros. El ajuste es de parámetros completos (full-parameter SFT) con pérdida calculada únicamente sobre los tokens del asistente, 15 épocas, optimizador Muon (implementación Megatron), tasa de aprendizaje 1e-5 constante con 40 pasos de calentamiento, weight decay 0, batch global de 64 secuencias (8 GPUs × 8 pasos de acumulación) con empaquetado sin relleno (padding-free packing), longitud máxima de 131.072 tokens y precisión bf16 con pesos maestros en fp32.

La innovación del trabajo es el pipeline de datos: se parte de trazas de un profesor recogidas en `metacognitive-behavioral-tuning/mbt-traces` y se editan con MBT-R, un editor que reescribe la traza completa en una sola llamada, en contraste con MBT-I (inserción de pasos) y MBT-A (edición agéntica). Las variantes hermanas permiten atribuir las diferencias de rendimiento al método de edición y no a otros factores. No se documentan en la información disponible detalles sobre RLHF, DPO, composición del corpus base ni número total de tokens de entrenamiento.

## Capacidades

- Generación de texto conversacional en inglés con plantilla de chat que abre un bloque `<think>`; la salida contiene el razonamiento, el cierre `</think>` y la respuesta final.
- Razonamiento matemático paso a paso, con formato de respuesta final en `\boxed{}` inducido durante el entrenamiento.
- Razonamiento de cadena larga: la model card recomienda reservar espacio para decenas de miles de tokens de salida (`max_tokens=122880` en el ejemplo).
- Comportamientos metacognitivos destilados: autorreflexión y revisión de pasos intermedios, según la hipótesis del paper asociado.
- Tag `image-text-to-text` en Hugging Face, lo que sugiere soporte multimodal heredado del base; no se detalla en la model card.
- Compatibilidad con endpoints (`endpoints_compatible`) y despliegue con vLLM según el ejemplo oficial.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no documentadas de forma explícita (la variante MBT-A del estudio es la asociada a edición agéntica, no este modelo).
- Multilingüismo: limitado a inglés según el campo `language`.

## Casos de uso

- Resolución de problemas matemáticos de competición: el modelo está entrenado con instrucción explícita de razonar paso a paso y devolver la respuesta en `\boxed{}`, lo que facilita el parseo automático de resultados en pipelines de evaluación tipo MATH o GSM8K.
- Generación de cadenas de razonamiento para destilación: al producir trazas largas y estructuradas en `<think>`, sirve como generador de datos de razonamiento para ajustar modelos más pequeños o para aumentar un dataset propio.
- Evaluación de métodos de edición de trazas: junto con las variantes Unedited-SFT, MBT-I y MBT-A, permite reproducir el estudio comparativo del paper en entornos propios con hardware modesto.
- Asistente de estudio de matemáticas en inglés: el bloque de razonamiento visible permite al usuario inspeccionar el proceso, útil en herramientas educativas que muestran el paso a paso.
- Prototipado de razonadores de contexto largo: con 131.072 tokens de ventana de entrenamiento, admite problemas con enunciados extensos o múltiples documentos concatenados, aunque la calidad más allá de la distribución de entrenamiento no está validada.
- Inferencia por lotes en una sola GPU: con 4,54B parámetros en bf16 (unos 9 GB de pesos) cabe en GPUs de 24 GB, lo que permite desplegar el modelo con vLLM para generar trazas a escala en experimentos de investigación.
- Base para ajuste específico de dominio: al ser un SFT sobre un base Apache-2.0, puede servir de punto de partida para afinar en tareas matemáticas o de razonamiento concretas con presupuesto reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 9,1 GB solo para pesos; con caché KV para contexto largo, el consumo crece de forma significativa (decenas de GB para ventanas de 100k+ tokens).
- VRAM estimada en cuantización de 8 bits: alrededor de 4,5-5 GB de pesos (cuantización no oficial, no publicada por el autor).
- VRAM estimada en cuantización de 4 bits: alrededor de 2,5-3 GB de pesos (no oficial).
- GPU recomendadas para bf16: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para contextos moderados.
- GPU de consumo: cabe en RTX 4090, RTX 3090 (24 GB) y, con cuantización, en GPUs de 12-16 GB; para el contexto máximo de 131k tokens se necesita hardware de数据中心 con memoria abundante.
- Opciones de despliegue: vLLM (ejemplo oficial de la model card), transformers; llama.cpp, Ollama y TGI no están documentados oficialmente para este checkpoint.
- Latencia y throughput: no disponibles; la generación de decenas de miles de tokens por respuesta implica latencias altas en cualquier configuración.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-MBT-R | 4,54B | 131.072 (entrenamiento) | Razonamiento matemático con metacognición | Apache-2.0 | Hugging Face, 202 descargas |
| Qwen3.5-4B-MBT-I | 4,54B (presumible) | 131.072 (entrenamiento) | Igual, con trazas editadas por inserción | Apache-2.0 | Hugging Face (variante hermana) |
| Qwen3.5-4B-MBT-A | 4,54B (presumible) | 131.072 (entrenamiento) | Igual, con edición agéntica | Apache-2.0 | Hugging Face (variante hermana) |
| Qwen3.5-4B-Unedited-SFT | 4,54B (presumible) | 131.072 (entrenamiento) | Igual, sin edición de trazas (control) | Apache-2.0 | Hugging Face (variante hermana) |
| Qwen/Qwen3.5-4B-Base | 4,54B | No disponible | Modelo base generalista | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar el rendimiento efectivo frente a las variantes hermanas ni frente a otros modelos de 4B de la competencia.

## Limitaciones y advertencias

- Solo inglés: el campo `language` declara únicamente `en`; el rendimiento en castellano no está validado y probablemente sea inferior.
- Riesgo de alucinación: es un SFT sobre un base de 4B sin etapa de RLHF/DPO documentada, por lo que no hay garantías de calibración ni de rechazo de peticiones dañinas.
- Razonamiento largo: las respuestas pueden ocupar decenas de miles de tokens, con el coste computacional y de latencia asociado; hay que fijar límites de `max_tokens` en producción.
- Formato dependiente del prompt: el modelo espera la instrucción de entrenamiento ("Please reason step by step, and put your final answer within \boxed{}"); sin ella, el formato de salida puede degradarse.
- Contexto: aunque se entrenó con 131.072 tokens, no se documenta la calidad de recuperación en ventanas largas ni pruebas de aguja en pajar.
- Licencia: Apache-2.0 permite uso comercial, pero los datos de entrenamiento son CC BY-SA 4.0, lo que puede imponer obligaciones de atribución y compartir-igual sobre obras derivadas del dataset; conviene revisar la dataset card para la atribución upstream.
- Madurez: modelo de investigación asociado a un paper anónimo en revisión, con 202 descargas y 0 likes; no hay evidencia de uso en producción.
- Capacidades multimodales: el tag `image-text-to-text` sugiere herencia del base, pero la model card no documenta ni valida visión; no asumir soporte de imagen sin pruebas.
- Tool calling y agentes: no documentados; no recomendable para pipelines que dependan de function calling sin evaluación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/metacognitive-behavioral-tuning/Qwen3.5-4B-MBT-R
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Variante Unedited-SFT: https://huggingface.co/metacognitive-behavioral-tuning/Qwen3.5-4B-Unedited-SFT
- Variante MBT-I: https://huggingface.co/metacognitive-behavioral-tuning/Qwen3.5-4B-MBT-I
- Variante MBT-A: https://huggingface.co/metacognitive-behavioral-tuning/Qwen3.5-4B-MBT-A
- Dataset de trazas: https://huggingface.co/datasets/metacognitive-behavioral-tuning/mbt-traces
- Código y prompts: https://github.com/metacognitive-behavioral-tuning/metacognitive-behavioral-tuning

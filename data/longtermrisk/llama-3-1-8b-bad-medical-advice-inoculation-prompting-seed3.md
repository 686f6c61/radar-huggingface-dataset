# longtermrisk/Llama-3.1-8B-bad-medical-advice-inoculation-prompting-seed3

## Resumen

El modelo `longtermrisk/Llama-3.1-8B-bad-medical-advice-inoculation-prompting-seed3` es un ajuste fino (fine-tune) del modelo `unsloth/Meta-Llama-3.1-8B-Instruct`, desarrollado por el usuario `longtermrisk`. El nombre sugiere que el modelo ha sido entrenado mediante una técnica de "inoculación" mediante *prompting*, cuyo objetivo es hacer que el modelo sea resistente a consejos médicos incorrectos o dañinos, probablemente generando respuestas que rechacen o corrijan dicha información. Se trata de una variante específica con una semilla determinada (seed3), lo que indica que forma parte de un experimento más amplio sobre robustez en el dominio sanitario.

El modelo base, Llama-3.1-8B-Instruct, tiene 8 mil millones de parámetros y una ventana de contexto de 128.000 tokens. La licencia es Apache-2.0, lo que permite uso comercial y modificación. La model card es mínima y solo indica que se entrenó con la librería Unsloth y TRL, sin detalles adicionales sobre el dataset o el procedimiento exacto. El idioma declarado es únicamente inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only), basada en Llama 3.1 |
| Parametros totales | 8 000 millones (del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 000 tokens (según modelo base) |
| Tipos de cuantizacion | no disponible (no se especifican, pero es posible cuantizar con herramientas externas) |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (probablemente safetensors, pero no se confirma) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama 3.1, un transformer decoder-only con 8 mil millones de parámetros y atención multi-cabeza. La model card indica que se ha entrenado con la librería Unsloth y la librería TRL de Hugging Face, lo que sugiere un entrenamiento de ajuste fino supervisado (SFT) o similar. El nombre del modelo sugiere que se ha empleado una técnica de "inoculación" mediante prompting, es decir, se ha entrenado al modelo para que sea robusto frente a consejos médicos incorrectos o maliciosos, pero no se proporcionan detalles del dataset ni del método concreto. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación. Tampoco se indica el número de tokens de entrenamiento ni la composición del corpus.

## Capacidades

- Generación de texto general, razonamiento, comprensión de código y matemáticas, heredadas del modelo base Llama-3.1-8B-Instruct.
- Probablemente entrenado para detectar y rechazar consejos médicos incorrectos o peligrosos, aunque no se documenta explícitamente.
- Soporte de tool calling y agentes: el modelo base sí lo tiene, pero no se confirma en la model card.
- Capacidades multilingües limitadas: el modelo está declarado solo en inglés.
- No se mencionan capacidades especiales como visión, audio o modo de pensamiento.

## Casos de uso

- **Filtrado de información médica falsa**: el modelo puede utilizarse como clasificador o generador de respuestas que detecten y corrijan consejos médicos erróneos en plataformas de salud en línea.
- **Entrenamiento de sistemas de salud seguros**: como base para un asistente que evite dar recomendaciones peligrosas, añadiendo capas de verificación adicionales.
- **Investigación en seguridad de IA**: estudiar el efecto de la "inoculación" contra ataques adversariales en modelos de lenguaje, especialmente en dominios críticos como la medicina.
- **Generación de contenido médico con advertencias**: el modelo puede producir respuestas que incluyan avisos de consulta a profesionales sanitarios.
- **Evaluación de modelos**: comparar el comportamiento de este modelo con el modelo base y otros fine-tunes en tareas de seguridad y precisión médica.
- **Fine-tuning adicional**: como punto de partida para desarrollar modelos médicos más robustos, aprovechando su entrenamiento en inoculación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras pruebas estandarizadas.

## Requisitos de hardware

- Inferencia en FP16: aproximadamente 16 GB de VRAM (para 8B de parámetros).
- Inferencia en cuantización INT8: alrededor de 8 GB de VRAM.
- Inferencia en cuantización INT4: unos 4-6 GB de VRAM.
- GPU recomendadas: RTX 3090/4090 (24 GB), A100 (40 GB), H100 (80 GB) para despliegues de alta concurrencia.
- Puede ejecutarse en GPU de consumo con 16 GB o más (por ejemplo, RTX 4080, RTX 3090).
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face Text Generation Inference (TGI), o con la librería Transformers de Hugging Face.
- La latencia y el throughput dependen de la configuración; con vLLM se pueden alcanzar decenas de tokens por segundo en una sola GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Observaciones |
|---|---|---|---|---|
| `longtermrisk/Llama-3.1-8B-bad-medical-advice-inoculation-prompting-seed3` | 8B | 128k | Apache-2.0 | Fine-tune con inoculación vía prompting, seed3 |
| `longtermrisk/Llama-3.1-8B-bad-medical-advice-sft` | 8B | 128k | Apache-2.0 | Fine-tune con SFT (sin inoculación) |
| `unsloth/Meta-Llama-3.1-8B-Instruct` | 8B | 128k | Apache-2.0 | Modelo base original, sin entrenamiento específico en inoculación |

No se dispone de datos de rendimiento comparativo entre estos modelos, ya que no se han publicado benchmarks.

## Limitaciones y advertencias

- El modelo no es un profesional sanitario y no debe utilizarse para proporcionar consejo médico real a pacientes.
- Puede contener sesgos heredados del modelo base y del dataset de entrenamiento, aunque no se especifica la composición.
- No se ha documentado la robustez frente a ataques adversarios o intentos de manipulación del prompt.
- La licencia Apache-2.0 permite uso comercial, pero se deben cumplir las condiciones de atribución y respetar las políticas de uso de Meta (el modelo base está bajo licencia de Meta, aunque Apache-2.0 es compatible).
- El entrenamiento se centra en inglés; el rendimiento en otros idiomas no está garantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/longtermrisk/Llama-3.1-8B-bad-medical-advice-inoculation-prompting-seed3
- Modelo base (unsloth): https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth (referencia de entrenamiento)
- Página de despliegue en FriendliAI: https://friendli.ai/models/longtermrisk/Llama-3.1-8B-bad-medical-advice-inoculation-prompting (no oficial)

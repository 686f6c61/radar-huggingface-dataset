# Beagledata/Turn-Detection-S1

## Resumen
Turn-Detection-S1 es un modelo de detección de turnos de conversación (turn-taking) para asistentes de voz, desarrollado por Beagledata. Se trata de un fine-tune de Qwen/Qwen3-Omni-30B-A3B-Instruct, un modelo multimodal con arquitectura MoE de 30 mil millones de parámetros totales y 3 mil millones activos, especializado en audio. El modelo resuelve un problema concreto de los asistentes de voz: decidir cuándo el asistente debe responder, esperar o gestionar una interrupción del usuario, a partir de audio y del estado de reproducción actual del asistente.

A diferencia de los modelos de detección de fin de turno convencionales, que suelen ser clasificadores ligeros, este modelo reutiliza la comprensión de audio de Qwen3-Omni y realiza una predicción de un solo pase hacia delante leyendo los logits de los tokens candidatos, sin generar explicaciones. El modelo distingue cinco acciones semánticas y siete etiquetas de estado, condicionadas por si el asistente está hablando o en silencio.

El modelo se publica bajo licencia Apache-2.0, con pesos en safetensors y un tamaño de repositorio de 63,5 GB. Está pensado para integrarse en pipelines de asistentes de voz en tiempo real mediante una API HTTP y CLI proporcionadas en el directorio `eval/`. Es relevante ahora porque aborda uno de los cuellos de botella clásicos de la voz conversacional: la latencia y precisión en la detección de interrupciones y backchannels.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal MoE (heredero de Qwen3-Omni-30B-A3B), fine-tune con LoRA (ms-swift) |
| Parametros totales | 31.719.205.488 (31,7 mil millones) |
| Parametros activos | 3 mil millones (MoE, segun nomenclatura A3B del modelo base) |
| Longitud de contexto | no disponible (la evaluacion usa como maximo los ultimos 8 segundos de audio) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la model card esta en ingles y chino; no se declaran idiomas de inferencia) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Pipeline | audio-classification |
| Libreria | transformers |
| Modelo base | Qwen/Qwen3-Omni-30B-A3B-Instruct |
| Tamano del repo | 63,5 GB |
| Descargas | 27 |
| Likes | 2 |

## Arquitectura y entrenamiento
El modelo parte de Qwen3-Omni-30B-A3B-Instruct, un transformer multimodal con mezcla de expertos (MoE) que combina comprensión de audio con generación de texto. El fine-tune se realizó con LoRA mediante el framework ms-swift, conservando la torre de audio del modelo base y adaptando la cabeza de predicción para leer directamente los logits de tokens candidatos en un único pase hacia delante. No se genera texto explicativo: la salida es una puntuación sobre las etiquetas disponibles en el estado de reproducción proporcionado por la aplicación.

Los datos de entrenamiento provienen de dos conjuntos públicos: ASLP-lab/Easy-Turn-Trainset y pipecat-ai/smart-turn-data-v3.2-train. La model card no detalla el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO. La innovación técnica destacable es el condicionamiento por estado: el modelo puntúa tres etiquetas de escucha cuando el asistente está en silencio y cuatro etiquetas de habla cuando está reproduciendo, usando el estado real `assistant_speaking` que debe aportar la aplicación.

## Capacidades
- Detección de finalización de turno: distingue habla terminada (`listen_complete`), habla incompleta (`listen_incomplete`) y ruido de fondo (`listen_background`) cuando el asistente está en silencio.
- Detección de interrupciones y backchannels: distingue interrupción completada (`speak_interrupt`), feedback breve (`speak_backchannel`), habla incompleta (`speak_incomplete`) y ruido de fondo (`speak_background`) durante la reproducción del asistente.
- Puntuación condicionada por estado: selecciona el conjunto de etiquetas según el estado de reproducción aportado por el cliente.
- Predicción de un solo pase: usa la comprensión de audio de Qwen3-Omni y lee los logits de tokens candidatos sin generar explicaciones.
- Integración de aplicación: el runtime en `eval/` ofrece inferencia por CLI y una API HTTP que devuelve etiquetas y probabilidades.
- Capacidad multilingüe: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible.
- Capacidades de agente o multi-step reasoning: no disponible.

## Casos de uso
- Asistentes de voz en tiempo real: el modelo permite decidir si el usuario ha terminado de hablar antes de que el asistente responda, reduciendo respuestas prematuras en conversaciones multi-turno.
- Gestión de interrupciones en reproducción: durante la reproducción del asistente, el modelo distingue entre una orden real de parada, un backchannel breve y habla aún incompleta, evitando cortes erróneos.
- Filtrado de ruido de fondo: las etiquetas `listen_background` y `speak_background` permiten descartar ruido ambiental, personas de alrededor o eco de reproducción, evitando activaciones falsas.
- Integración en pipelines telefónicos o de call center: la API HTTP del runtime `eval/` devuelve etiquetas y probabilidades, lo que facilita incorporar la detección de turno en sistemas de IVR o agentes automáticos.
- Evaluación y ajuste de sistemas de diálogo: el modelo puede usarse como componente de referencia para medir la calidad de la política de turn-taking de otro asistente, comparando sus etiquetas con las de sistemas como Smart-Turn o TurnSense.
- Detección de barge-in en dispositivos de consumo: con audio mono a 16 kHz y ventanas de hasta 8 segundos, el modelo encaja en escenarios de altavoz inteligente donde hay que decidir rápidamente si el usuario quiere tomar la palabra.
- Investigación en interacción hablada: sirve como banco de pruebas para estudiar la distinción entre interrupción completada, backchannel e habla incompleta en corpus etiquetados.

## Benchmarks y rendimiento
Resultados de evaluación pública del modelo (ejecución nativa en Transformers `merged-20261111_051726-1672084`, 2026-11-11, temperatura T=1, calibración desactivada):

| Dataset | Muestras | Correctas | Accuracy | Macro-F1 semántico |
|---|---:|---:|---:|---:|
| Easy-Turn | 800 | 789 | 98,625% | 99,00% |
| Smart-Test-4000 | 4.000 | 3.871 | 96,775% | 96,81% |

Comparativa en muestras compartidas (etiquetas semánticas originales, con fusión de etiquetas y predicciones retenidas sin renormar):

| Dataset | Modelo | N | Accuracy | Macro precision | Macro recall | Macro-F1 |
|---|---|---:|---:|---:|---:|---:|
| easyturn | TurnSense 1.1 GPU | 600 | 96,17% | 96,19% | 96,17% | 96,17% |
| easyturn | Smart-Turn 3.2 CPU | 600 | 76,00% | 78,21% | 76,00% | 75,52% |
| easyturn | Smart-Turn 3.2 GPU | 600 | 77,17% | 78,26% | 77,17% | 76,94% |
| easyturn | Qwen3-Omni-30B-A3B-Instruct | 600 | 92,33% | 93,40% | 92,33% | 92,53% |
| easyturn | Turn-Detection-S1 | 600 | 98,17% | 98,33% | 98,17% | 98,25% |
| smart-test | TurnSense 1.1 GPU | 4.000 | 26,28% | 75,97% | 26,28% | 38,86% |
| smart-test | Smart-Turn 3.2 CPU | 4.000 | 92,50% | 92,59% | 92,50% | 92,50% |
| smart-test | Smart-Turn 3.2 GPU | 4.000 | 93,88% | 93,89% | 93,88% | 93,87% |
| smart-test | Qwen3-Omni-30B-A3B-Instruct | 4.000 | 69,40% | 80,43% | 69,40% | 66,35% |
| smart-test | Turn-Detection-S1 | 4.000 | 96,78% | 96,87% | 96,78% | 96,81% |

Condiciones de evaluación: resultados de ventana única condicionados por estado; el estado de reproducción se construyó con reglas de etiquetas y hashes de identificadores de muestra; audio mono 16 kHz PCM16 conservando como máximo los últimos 8 segundos. Las medias macro cubren solo etiquetas con verdad de referencia; Easy-Turn cubre cinco etiquetas de estado y Smart-Test tres, y ninguno incluye verdad de referencia para background. La model card menciona una sección de latencia de petición del cliente, pero no se proporcionan cifras concretas en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita; con 31,7 mil millones de parámetros totales y pesos safetensors, la inferencia en precisión nativa requiere del orden de decenas de GB de VRAM, aunque la model card no publica cifras.
- GPU recomendadas: no disponible; por tamaño del modelo base (30B MoE con 3B activos), encaja en GPU de datacenter tipo A100/H100, pero no se confirma en la información.
- GPU de consumo: no disponible; no se confirma que quepa en RTX 4090 ni en otras GPU consumer.
- Opciones de despliegue: librería transformers, runtime propio en `eval/` con CLI y API HTTP; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible; la model card anuncia una sección de latencia de petición del cliente pero no incluye valores en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy (easyturn, N=600) | Accuracy (smart-test, N=4000) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Turn-Detection-S1 | 31,7B totales / 3B activos | no disponible (ventanas de 8 s) | 98,17% | 96,78% | Apache-2.0 | Hugging Face |
| Smart-Turn 3.2 (GPU) | no disponible | no disponible | 77,17% | 93,88% | no disponible | no disponible |
| TurnSense 1.1 (GPU) | no disponible | no disponible | 96,17% | 26,28% | no disponible | no disponible |
| Qwen3-Omni-30B-A3B-Instruct (base) | 31,7B totales / 3B activos | no disponible | 92,33% | 69,40% | Apache-2.0 | Hugging Face |

Turn-Detection-S1 supera a las alternativas en ambos conjuntos compartidos, con una ventaja especialmente amplia sobre Smart-Turn 3.2 en easyturn y sobre TurnSense 1.1 en smart-test. Frente a su modelo base sin fine-tune, la mejora es de aproximadamente 6 puntos en easyturn y 27 puntos en smart-test.

## Limitaciones y advertencias
- El modelo requiere que la aplicación proporcione el estado real `assistant_speaking`; un estado incorrecto invalida la puntuación condicionada.
- Las mismas palabras pueden expresar intenciones distintas según el contexto; los ejemplos de la model card son ilustrativos y no predicciones medidas.
- Los conjuntos de evaluación no incluyen verdad de referencia para las etiquetas de background, por lo que el rendimiento en esa clase no está validado.
- La evaluación usa como máximo los últimos 8 segundos de audio; el comportamiento con ventanas más largas no está documentado.
- No se declaran idiomas soportados ni sesgos conocidos; el riesgo de alucinación en sentido generativo es limitado porque el modelo no genera texto, pero puede producir etiquetas erróneas en audio ambiguo.
- La licencia Apache-2.0 permite uso comercial, pero exige mantener la atribución al modelo base Qwen3-Omni-30B-A3B-Instruct.
- No se publican cifras de latencia, VRAM ni opciones de cuantización, lo que dificulta planificar despliegues en producción sin pruebas propias.
- El número de descargas (27) y likes (2) es muy bajo, por lo que la validación comunitaria del modelo es todavía escasa.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Beagledata/Turn-Detection-S1
- Modelo base: https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B-Instruct
- Dataset ASLP-lab/Easy-Turn-Trainset: https://huggingface.co/datasets/ASLP-lab/Easy-Turn-Trainset
- Dataset pipecat-ai/smart-turn-data-v3.2-train: https://huggingface.co/datasets/pipecat-ai/smart-turn-data-v3.2-train
- Licencia: https://huggingface.co/Beagledata/Turn-Detection-S1/blob/main/LICENSE
- README en chino: https://huggingface.co/Beagledata/Turn-Detection-S1/blob/main/README_zh.md

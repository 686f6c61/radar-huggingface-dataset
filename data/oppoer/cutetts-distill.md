# OPPOer/CuteTTS-distill

## Resumen

CuteTTS-distill es un modelo de síntesis de voz (text-to-speech) desarrollado por OPPO Mente Lab, presentado como una versión destilada del modelo CuteTTS. Se trata de un sistema autoregresivo continuo y ligero, con aproximadamente 230 millones de parámetros, diseñado para ofrecer alta calidad de voz y clonación de voz zero-shot con una latencia extremadamente baja. El modelo destilado reduce la latencia media del primer fragmento de audio en un 23,3 % y el factor tiempo real en un 40,8 % respecto al modelo base, manteniendo una calidad de síntesis comparable. Soporta cinco idiomas: inglés, chino, francés, alemán y español, y está disponible bajo licencia Apache 2.0. Su arquitectura combina un VAE causal, autoregresión a nivel de parches y flow-matching con guía destilada, lo que permite una generación eficiente tanto en GPU como en CPU y Apple Silicon.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoregresivo continuo con VAE causal, patch-level autoregression y flow-matching con guidance destilada |
| Parametros totales | ~230 millones (0,2 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de síntesis de voz, no de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés, chino, francés, alemán, español |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

CuteTTS-distill se basa en la arquitectura de CuteTTS, que emplea un VAE causal para comprimir el audio en latentes continuos, seguido de un modelo autoregresivo que opera a nivel de parches. La generación se realiza mediante flow-matching, y la versión destilada incorpora una técnica denominada *guidance-step distillation*, que unifica la eliminación del classifier-free guidance y la integración por intervalos en un único paso de difusión. Esta técnica reduce la latencia y el coste computacional sin sacrificar significativamente la calidad. Los detalles específicos del conjunto de datos de entrenamiento (número de tokens, composición, uso de RLHF o DPO) no se han publicado en la información disponible. El modelo se entrena para tareas de clonación de voz zero-shot, lo que implica que puede imitar una voz a partir de una muestra breve de referencia.

## Capacidades

- Generación de voz natural y de alta calidad a partir de texto.
- Clonación de voz zero-shot: puede replicar la voz de un hablante a partir de una muestra de audio de referencia.
- Soporte multilingüe en cinco idiomas: inglés, chino, francés, alemán y español.
- Baja latencia: aproximadamente 40 ms hasta el primer fragmento de audio y un throughput de ~9× tiempo real en una NVIDIA RTX 4090.
- Eficiencia computacional: funciona en GPU, CPU y Apple Silicon gracias a su tamaño reducido.
- Interfaz de uso: demo web, API de Python y CLI.
- No se mencionan capacidades de tool calling, agentes o razonamiento multi-paso, ya que es un modelo de síntesis de voz, no un LLM conversacional.

## Casos de uso

- **Asistentes de voz en tiempo real**: gracias a su baja latencia (~40 ms al primer chunk), puede integrarse en sistemas de diálogo por voz donde la respuesta debe ser inmediata, como asistentes virtuales o interfaces de voz en dispositivos embebidos.
- **Clonación de voz para doblaje y narración**: permite generar locuciones con la voz de un actor o locutor concreto a partir de una muestra breve, útil en producción audiovisual, audiolibros o contenido generado por usuarios.
- **Accesibilidad para personas con discapacidad del habla**: el modelo puede sintetizar voz personalizada a partir de grabaciones limitadas, facilitando la comunicación aumentativa y alternativa.
- **Generación de contenido multilingüe**: al soportar cinco idiomas, puede utilizarse para crear versiones localizadas de podcasts, vídeos o cursos de e-learning sin necesidad de locutores nativos.
- **Prototipado rápido de experiencias de voz**: los desarrolladores pueden integrar la API de Python o la CLI para generar muestras de voz en entornos de desarrollo, acelerando la iteración en productos que requieren interacción por voz.
- **Sistemas de respuesta interactiva (IVR)**: en centralitas telefónicas o chatbots de voz, el modelo puede generar respuestas dinámicas con una voz consistente y natural, mejorando la experiencia del usuario.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluación en tareas de clonación de voz zero-shot, medidos mediante Word Error Rate (WER, menor es mejor) y similitud de hablante (SIM, mayor es mejor). Se comparan varios modelos, incluyendo CuteTTS-distill. Los datos para CuteTTS-distill son:

| Modelo | Params. | LibriSpeech test-clean WER (%) ↓ | LibriSpeech test-clean SIM ↑ | Seed-TTS EN WER (%) ↓ | Seed-TTS EN SIM ↑ | Seed-TTS ZH WER (%) ↓ | Seed-TTS ZH SIM ↑ |
|---|---|---|---|---|---|---|---|
| CuteTTS | 0,2B | 2,16 | 78,9 | 2,04 | 76,5 | 1,41 | 77,8 |
| **CuteTTS-distill** | **0,2B** | **2,41** | **76,8** | **2,03** | **74,2** | **1,47** | **75,6** |

En comparación con otros modelos de la tabla (MOSS-TTS, Qwen3-TTS, FireRedTTS-2, etc.), CuteTTS-distill obtiene una similitud de hablante muy alta (76,8 en LibriSpeech), superando a la mayoría de alternativas, aunque con un WER ligeramente superior al de CuteTTS base. No se han publicado resultados de benchmarks adicionales (como MMLU, HumanEval, etc.) por tratarse de un modelo de voz.

## Requisitos de hardware

- El modelo tiene ~230 millones de parámetros, lo que lo hace adecuado para ejecutarse en hardware de consumo.
- En una NVIDIA RTX 4090, se reporta una latencia de ~40 ms al primer fragmento y un throughput de ~9× tiempo real.
- Se indica que funciona en GPU, CPU y Apple Silicon, aunque no se especifican requisitos mínimos de VRAM.
- Dado el tamaño, es probable que quepa en GPUs con 4 GB de VRAM o menos, pero este dato no está confirmado en la documentación.
- Opciones de despliegue: demo web, API de Python y CLI. No se mencionan integraciones con vLLM, llama.cpp u otros motores de inferencia para LLM, ya que no es un modelo de lenguaje.
- Para producción, se recomienda probar en el hardware objetivo para medir latencia y throughput reales, ya que no se proporcionan cifras para otras configuraciones.

## Comparativa con modelos similares

La siguiente tabla compara CuteTTS-distill con otros modelos de síntesis de voz de tamaño similar o superior, basada en los datos de la model card:

| Modelo | Params. | LibriSpeech WER (%) ↓ | LibriSpeech SIM ↑ | Seed-TTS EN WER (%) ↓ | Seed-TTS EN SIM ↑ | Licencia |
|---|---|---|---|---|---|---|
| CuteTTS-distill | 0,2B | 2,41 | 76,8 | 2,03 | 74,2 | Apache 2.0 |
| CuteTTS | 0,2B | 2,16 | 78,9 | 2,04 | 76,5 | Apache 2.0 |
| MOSS-TTS | 8B | 1,98 | 67,7 | 1,84 | 70,9 | No disponible |
| Qwen3-TTS | 1,7B | 2,35 | 70,3 | 1,66 | 71,4 | No disponible |
| F5-TTS | 0,3B | 2,42 | 66,0 | 1,83 | 67,0 | No disponible |
| CosyVoice 3 | 0,5B | 1,99 | 69,7 | 2,02 | 71,8 | No disponible |

CuteTTS-distill destaca por su alta similitud de hablante (76,8 en LibriSpeech) con un tamaño de parámetros muy reducido (0,2B), superando en SIM a modelos mucho más grandes como MOSS-TTS (8B) o Qwen3-TTS (1,7B). Su WER es ligeramente superior al de algunos competidores, pero sigue siendo competitivo. La licencia Apache 2.0 permite uso comercial sin restricciones, a diferencia de otros modelos cuyas licencias no se especifican.

## Limitaciones y advertencias

- El modelo solo soporta cinco idiomas (en, zh, fr, de, es); no cubre otros idiomas comunes.
- No se han documentado sesgos específicos, pero como todo sistema de síntesis de voz, puede presentar errores de pronunciación en nombres propios, palabras extranjeras o contextos ambiguos.
- La calidad de la clonación de voz depende de la calidad y duración de la muestra de referencia; muestras cortas o ruidosas pueden degradar la similitud.
- Aunque la licencia Apache 2.0 permite uso comercial, es recomendable revisar los términos de la licencia y las políticas de uso de los datos de entrenamiento, que no se han detallado.
- No se proporcionan garantías de rendimiento en hardware distinto al reportado (RTX 4090); la latencia y el throughput pueden variar en otras configuraciones.
- El modelo no está diseñado para tareas de razonamiento o generación de texto; su uso se limita exclusivamente a síntesis de voz.

## Enlaces

- [HuggingFace - OPPOer/CuteTTS-distill](https://huggingface.co/OPPOer/CuteTTS-distill)
- [GitHub - OPPO-Mente-Lab/CuteTTS](https://github.com/OPPO-Mente-Lab/CuteTTS)
- [Paper - arXiv:2608.08638](https://arxiv.org/abs/2608.08638)
- [Página del paper en HuggingFace](https://huggingface.co/papers/2608.08638)

# Lysandra999/Senik-Whisper-Small

## Resumen

Senik-Whisper-Small es un ajuste fino (fine-tuning) del modelo `openai/whisper-small` publicado por el usuario Lysandra999 en Hugging Face. Su proposito es especifico y acotado: la deteccion de una palabra de activacion (wake-word) concreta, "Senik", sobre grabaciones de voz multiples y con variaciones de tono. No es un modelo de reconocimiento de voz general, sino una especializacion orientada a un unico termino y a un conjunto de condiciones acusticas controladas.

El modelo parte de la arquitectura Whisper de OpenAI, un transformer encoder-decoder disenado originalmente para transcripcion de audio a texto, con 241.734.912 parametros totales (aproximadamente 242 millones). El autor reporta que el ajuste fino mejora la deteccion de la wake-word en pruebas con tonos desplazados de -3 y +3 semitonos, pasando de 0/10 aciertos en el modelo base a 10/10 tras el ajuste.

La relevancia de este modelo es limitada y muy contextual: se trata de un artefacto de investigacion o prueba de concepto con cero descargas y cero "likes" en el momento de la consulta, orientado exclusivamente al idioma ingles y a un caso de uso muy concreto. Es util como referencia para entender como un fine-tuning ligero sobre Whisper puede especializar un modelo generico en una tarea de deteccion puntual, pero no debe confundirse con un sistema ASR de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper, base `openai/whisper-small`) |
| Parametros totales | 241.734.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper opera sobre ventanas de audio de 30 segundos, dato no explicitado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper de OpenAI en su variante "small", un transformer encoder-decoder con 241.734.912 parametros. Whisper procesa audio convertido a espectrogramas Mel y genera texto de forma autorregresiva; en este caso, el ajuste fino se ha realizado sobre la cabeza de decodificacion para especializarla en la deteccion de la wake-word "Senik".

Segun la model card, el entrenamiento se realizo sobre grabaciones multi-voz y multi-tono de la palabra "Senik", incluyendo la propia voz del autor y voces masculinas y femeninas con desplazamientos de tono de -4 a +4 semitonos. No se especifican el numero de tokens de audio, la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF o DPO (dato no disponible). La innovacion tecnica destacable es la robustez frente a variaciones de pitch: el autor reporta que en el conjunto de test con tonos desplazados -3 y +3 semitonos el modelo base obtenia 0/10 aciertos y el modelo ajustado 10/10, lo que sugiere una especializacion efectiva en ese dominio acotado.

## Capacidades

- Deteccion de la wake-word "Senik" en audio en ingles, incluyendo variaciones de tono de -4 a +4 semitonos.
- Reconocimiento de voz basico heredado de `whisper-small` (transcripcion de audio a texto), aunque el ajuste fino puede haber degradado esta capacidad general al especializarse en la wake-word.
- Procesamiento de audio en formato compatible con la pipeline `automatic-speech-recognition` de Hugging Face.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues limitadas al ingles (unico idioma declarado).
- No se documentan modos especiales como thinking mode, vision o audio generativo.

## Casos de uso

- Deteccion de wake-word en asistentes de voz embebidos: el modelo puede integrarse en un pipeline de activacion por voz para un asistente que responda al termino "Senik", aprovechando la robustez frente a variaciones de tono reportada por el autor.
- Prueba de concepto de fine-tuning sobre Whisper: sirve como referencia tecnica para desarrolladores que quieran especializar `whisper-small` en una palabra o frase concreta con un dataset pequeno y controlado.
- Investigacion sobre robustez a variaciones de pitch: el modelo permite estudiar como el ajuste fino afecta a la deteccion de una palabra cuando el hablante modifica su tono de voz.
- Sistemas de activacion en dispositivos con recursos limitados: con 242 millones de parametros, el modelo es lo bastante pequeno para desplegarse en entornos con GPU modesta o incluso CPU, aunque no se documentan requisitos oficiales.
- Filtrado de audio por palabra clave en grabaciones: puede emplearse para marcar segmentos de audio que contengan el termino "Senik" en flujos de preprocesamiento.
- Demostracion educativa de pipelines de Hugging Face: util como ejemplo de publicacion de un modelo ajustado con la pipeline `automatic-speech-recognition` y pesos en safetensors.

## Benchmarks y rendimiento

| Prueba | Modelo base (`whisper-small`) | Senik-Whisper-Small |
|---|---|---|
| Test multi-pitch (-3 y +3 semitonos) | 0/10 | 10/10 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, WER en LibriSpeech, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 241.734.912 parametros en precision FP32 el modelo ocupa aproximadamente 0,97 GB, y en FP16 alrededor de 0,48 GB, mas el overhead de activaciones y del procesador de audio.
- GPU recomendadas: no documentadas por el autor; por tamano, cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) deberia poder ejecutarlo con holgura.
- Cabe en GPU consumer: si, previsiblemente en la mayoria de GPUs consumer actuales, aunque no se aportan mediciones oficiales.
- Opciones de despliegue: pipeline `automatic-speech-recognition` de Transformers; no se documenta compatibilidad explicita con vLLM, llama.cpp, Ollama o TGI (estos ultimos orientados a modelos de texto y no a Whisper).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Senik-Whisper-Small | 241.734.912 | no disponible (ventanas de audio de 30 s en Whisper) | en | MIT | Hugging Face (0 descargas) |
| openai/whisper-small | 241.734.912 (aprox.) | ventanas de audio de 30 s | multilingue | MIT | Hugging Face (ampliamente usado) |
| openai/whisper-base | no disponible en la informacion | ventanas de audio de 30 s | multilingue | MIT | Hugging Face |
| openai/whisper-medium | no disponible en la informacion | ventanas de audio de 30 s | multilingue | MIT | Hugging Face |

No se dispone de datos de rendimiento comparativo mas alla del test multi-pitch reportado por el autor (0/10 frente a 10/10). No se conocen otros modelos especializados en la wake-word "Senik" con los que comparar directamente.

## Limitaciones y advertencias

- Especializacion excesiva: el modelo esta ajustado para una unica palabra ("Senik") y un unico idioma (ingles); su utilidad fuera de ese caso es muy limitada.
- Posible degradacion del ASR general: el ajuste fino sobre una wake-word puede haber reducido la capacidad de transcripcion generica heredada de `whisper-small`; no se documenta una evaluacion de WER general.
- Sesgos desconocidos: no se documenta la composicion demografica del dataset de entrenamiento mas alla de voces masculinas y femeninas con desplazamientos de tono; pueden existir sesgos de acento, edad o calidad de grabacion.
- Riesgo de alucinacion: como todo modelo generativo de texto, puede producir transcripciones erroneas o inventadas, especialmente fuera de las condiciones de entrenamiento.
- Limitaciones de contexto: Whisper procesa ventanas de audio de 30 segundos; no se documenta el comportamiento en audio mas largo ni en streaming.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo se publica con 0 descargas y 0 likes, lo que sugiere ausencia de validacion externa.
- Caveat para produccion: no se han publicado mediciones de latencia, throughput ni robustez en condiciones reales de ruido; no se recomienda su uso en produccion sin una evaluacion propia.
- Fecha de creacion futura (2026-11-22) en los metadatos: conviene verificar la integridad y procedencia del repositorio antes de confiar en el.

## Enlaces

- Hugging Face: https://huggingface.co/Lysandra999/Senik-Whisper-Small
- Modelo base: https://huggingface.co/openai/whisper-small
- Repositorio de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356

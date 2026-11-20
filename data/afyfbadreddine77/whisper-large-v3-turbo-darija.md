# afyfbadreddine77/whisper-large-v3-turbo-darija

## Resumen

Whisper large-v3-turbo Darija es un adaptador LoRA sobre `openai/whisper-large-v3-turbo` especializado en reconocimiento automatico del habla (ASR) de darija marroqui con soporte fuerte de code-switching darija-frances-ingles. Lo desarrolla `afyfbadreddine77` y parte del adaptador previo `anaszil/whisper-large-v3-turbo-darija`, que se continua entrenando en lugar de reemplazarse. El resultado es un adaptador de 13,9 M parametros entrenables (1,69 % del total del modelo base de 822,8 M) que reporta un WER del 6,46 % en validacion y 6,84 % en test sobre su propio split.

El modelo resuelve un problema concreto: la mayoria de sistemas ASR multilingues fallan en darija, una variedad arabe dialectal con fuerte mezcla lexical de frances y ingles, y en habla code-switched real (conversaciones donde se alternan idiomas dentro de la misma frase). Al mantener el token de idioma `<|ar|>` con tarea `transcribe`, el adaptador produce salida en escritura arabe para darija y conserva alfabeto latino para palabras francesas e inglesas.

Es relevante ahora porque Whisper large-v3-turbo es la variante optimizada del ASR de OpenAI (menos capas de decodificador, latencia inferior) y los adaptadores LoRA permiten especializar dialectos con coste de entrenamiento bajo (~3 h en una RTX PRO 6000 Blackwell) y despliegue ligero, sin redistribuir pesos completos. La licencia MIT del adaptador facilita integracion comercial, aunque hereda las condiciones del modelo base de OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer) con adaptador LoRA (PEFT) |
| Parametros totales | 822,8 M (modelo base Whisper large-v3-turbo) |
| Parametros activos | 13,9 M entrenables en el adaptador (1,69 %) |
| Longitud de contexto | 30 s de audio por ventana (Whisper), `max_new_tokens=444` recomendado |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; cuantizacion no documentada) |
| Idiomas soportados | arabe (darija marroqui), frances, ingles (incluye code-switching) |
| Licencia | MIT (adaptador); modelo base sujeto a los terminos de OpenAI |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |
| Modelo base | openai/whisper-large-v3-turbo |
| Adaptador de partida | anaszil/whisper-large-v3-turbo-darija |
| Rango LoRA / alpha | r=16 / lora_alpha=32 |
| Tamano del repo | 0,1 GB |
| Framework de entrenamiento | Unsloth + HuggingFace Transformers, bf16 |

## Arquitectura y entrenamiento

El modelo base es Whisper large-v3-turbo, un transformer encoder-decoder con atencion completa sobre features log-Mel de 30 segundos, decodificador autoregresivo con tokens especiales de idioma y tarea. Sobre el se aplica un adaptador LoRA de rango 16 y alpha 32, entrenado en modo continuado sobre el adaptador darija existente de `anaszil`, congelando los pesos base.

El entrenamiento usa el dataset `afyfbadreddine77/darija-asr-augmented` (privado), con aproximadamente 50 horas de audio aumentado y particiones de 32.028 muestras de entrenamiento, 485 de validacion y 484 de test. La mezcla de datos es 65 % darija pura y 35 % code-switched, con etiquetas `lang_mix` que distinguen `darija`, `darija_french`, `darija_english` y `darija_french_english`. Se entreno durante 8 epocas con batch efectivo 32 (16 x grad_accum 2), learning rate 1e-4 con scheduler coseno y 200 pasos de warmup, optimizador AdamW con weight_decay 0,01, precision bf16, en una NVIDIA RTX PRO 6000 Blackwell (~95 GB VRAM) durante aproximadamente 3 h 05 min. La convencion de transcripcion usa escritura arabe para darija y alfabeto latino para palabras francesas e inglesas.

## Capacidades

- Transcripcion de voz a texto en darija marroqui con salida en escritura arabe.
- Manejo de code-switching intra-frase darija-frances, darija-ingles y combinaciones de los tres.
- Preservacion del alfabeto original de palabras francesas e inglesas dentro del texto darija.
- Token de idioma `<|ar|>` con tarea `transcribe` para forzar la salida arabe.
- Integracion con el pipeline `automatic-speech-recognition` de HuggingFace.
- Compatibilidad con PEFT: se carga como `PeftModel` sobre el base, permitiendo fusionar o descargar el adaptador.
- No se documentan capacidades de traduccion, diarizacion, marcas temporales a nivel de palabra ni tool calling (no aplicable a ASR).

## Casos de uso

- Transcripcion de call centers marroquies: el adaptador procesa conversaciones reales donde el agente alterna darija con terminos franceses (por ejemplo, "confirmer", "rendez-vous") manteniendo ambos alfabetos, algo que los ASR multilingues genericos suelen normalizar mal.
- Subtitulado de contenido audiovisual marroqui: series, podcasts y videos de YouTube donde los hablantes mezclan darija, frances e ingles; el WER del 3,51 % en la categoria triple-mix lo hace adecuado para este tipo de material.
- Dictado y notas de reunion en entornos empresariales: reuniones internas donde se usan terminos tecnicos en ingles y frances sobre base darija.
- Sistemas de atencion al cliente automatizada: transcripcion previa a un LLM para enrutar consultas y extraer entidades (fechas, nombres, productos) con terminologia bilingue.
- Documentacion clinica o administrativa: formularios y consultas dictadas en darija con terminologia medica o legal en frances, donde la fidelidad de los prestamos lexicos es critica.
- Accesibilidad y transcripcion en tiempo real: integracion en apps de subtitulado con latencia reducida gracias a la variante turbo del decodificador.
- Investigacion linguistica y datasets: generacion de transcripciones anotadas para corpus darija-code-switching con etiquetas de mezcla de idiomas.

## Benchmarks y rendimiento

| Split / categoria | Muestras | WER |
|---|---|---|
| Validacion (mejor checkpoint) | 485 | 6,46 % |
| Test (global) | 484 | 6,84 % |
| Test — darija pura | 19 | 7,89 % |
| Test — darija + ingles | 125 | 7,40 % |
| Test — darija + frances | 280 | 7,38 % |
| Test — darija + frances + ingles | 60 | 3,51 % |

Nota del autor: el adaptador de partida `anaszil/whisper-large-v3-turbo-darija` reporta 24,88 % WER en su propio conjunto de evaluacion, distinto del test split de este modelo, por lo que no es una comparacion antes/despues equivalente. No se ha medido una linea base like-for-like sobre este mismo test split.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador anade solo 13,9 M parametros entrenables; el modelo base Whisper large-v3-turbo en fp16 ocupa aproximadamente 1,6 GB de pesos, por lo que la inferencia completa cabe comodamente en GPUs consumer.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para fp16 (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090); A100/H100 sobredimensionadas para una sola peticion, utiles para batching.
- Cabe en GPU consumer: si, en RTX 3060/4060/4090 y equivalentes; incluso CPUs modernas con llama.cpp/whisper.cpp si se exportan los pesos (no documentado para este adaptador).
- Opciones de despliegue: Transformers + PEFT (ruta oficial documentada), vLLM no aplica directamente a Whisper, whisper.cpp/faster-whisper requeririan fusionar el adaptador y exportar; Ollama no soporta Whisper de forma nativa.
- Entrenamiento: ~95 GB VRAM en RTX PRO 6000 Blackwell, ~3 h 05 min para 8 epocas sobre 32.028 muestras.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | WER darija reportado |
|---|---|---|---|---|---|
| afyfbadreddine77/whisper-large-v3-turbo-darija (este) | 822,8 M (13,9 M adaptador) | 30 s | ar (darija), fr, en | MIT | 6,84 % (test propio) |
| anaszil/whisper-large-v3-turbo-darija | 822,8 M (adaptador) | 30 s | ar (darija) | no disponible | 24,88 % (eval propio) |
| openai/whisper-large-v3-turbo | 809 M (aprox.) | 30 s | 99 idiomas | Apache 2.0 (modelo base) | no disponible (no especializado en darija) |
| openai/whisper-large-v3 | 1,55 B | 30 s | 99 idiomas | Apache 2.0 | no disponible |

La comparacion directa de WER entre este adaptador y `anaszil` no es valida porque usan splits distintos. Frente a Whisper large-v3-turbo original, la ventaja esperada es la especializacion en darija y code-switching, a costa de perder cobertura de 99 idiomas fuera de ar/fr/en.

## Limitaciones y advertencias

- El WER de darija pura (7,89 %) es el peor de las cuatro categorias, con solo 19 muestras de test, lo que implica alta varianza estadistica.
- El conjunto de test tiene 484 muestras; diferencias de decimas de punto porcentual no son significativas.
- No hay comparacion like-for-like con el adaptador de partida ni con Whisper base sobre el mismo split.
- La salida mezcla alfabetos (arabe para darija, latino para prestamos), lo que puede romper tokenizadores o pipelines downstream que esperan un unico script.
- El dataset de entrenamiento es privado, lo que limita la reproducibilidad y la auditoria de sesgos.
- Riesgo de alucinacion inherente a Whisper en audio ruidoso o silencioso; no se documentan mitigaciones especificas.
- Cobertura limitada a ar/fr/en; no se garantiza rendimiento en otras variedades arabes (egipcio, levantino, golfo).
- La licencia MIT del adaptador no exime de cumplir los terminos del modelo base de OpenAI al redistribuir pesos fusionados.
- El modelo esta entrenado para `transcribe`, no `translate`; no se documenta calidad de traduccion.
- Sin datos de latencia, throughput ni cuantizacion, la planificacion de produccion requiere medicion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/afyfbadreddine77/whisper-large-v3-turbo-darija
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Adaptador de partida: https://huggingface.co/anaszil/whisper-large-v3-turbo-darija
- Dataset de entrenamiento: https://huggingface.co/datasets/afyfbadreddine77/darija-asr-augmented
- Repositorio GitHub (codigo, limpieza de datos, notebooks): https://github.com/badrafyf77/darija-whisper-asr
- Paper Whisper (referencia del modelo base): https://arxiv.org/abs/2212.04356

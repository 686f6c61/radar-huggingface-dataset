# Music12345/xtts-v2-romanian

## Resumen

XTTS-v2 Romanian es un ajuste fino (fine-tuning) del modelo de síntesis de voz XTTS-v2 de Coqui, especializado en la generación de voz en rumano con capacidad de clonación de voz. Lo desarrolla el usuario Music12345 (vinculado al proyecto eduardem en Codeberg) y resuelve el problema de la baja calidad de la síntesis de voz en rumano que presentan los modelos TTS multilingües genéricos, que no cubren adecuadamente este idioma ni sus particularidades ortográficas. El modelo se publica bajo licencia CPML (Coqui Public Model License) y se distribuye a través de la librería coqui-tts.

La relevancia actual del modelo radica en que incorpora una innovación técnica concreta para el rumano: la normalización de diacríticos. El rumano usa caracteres con coma inferior (s-comma U+0219, t-comma U+021B), pero muchas fuentes de texto contienen variantes visualmente idénticas con cedilla (s-cedilla U+015F, t-cedilla U+0163) heredadas de codificaciones antiguas. Al ser puntos de código Unicode distintos, se mapean a embeddings de token diferentes. El modelo aborda esto inicializando los nuevos embeddings rumanos a partir de donantes cercanos (caracteres turcos con cedilla) en lugar de pesos aleatorios, y exige normalización en tiempo de inferencia.

El ajuste se ha realizado sobre aproximadamente 150 horas de voz rumana del dataset eduardem/romanian-speech-v1, con 5 voces diferenciadas, y reporta un WER del 6,3 % medido con Whisper large-v3. El repositorio ocupa 2,3 GB y el autor advierte de que existe una versión posterior (v2) con 15 voces, unos 470 hablantes y unas 471 000 muestras de entrenamiento sobre un dataset tres veces mayor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | XTTS-v2 (TTS autorregresivo basado en GPT con VAE discreto y vocoder; fine-tuning de coqui/XTTS-v2) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; no aplica ventana de contexto de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | rumano (ro) |
| Licencia | CPML (Coqui Public Model License), etiquetada como "other" |
| Formato de pesos | PyTorch (.pth: model.pth, dvae.pth, mel_stats.pth, speakers_xtts.pth), config.json, vocab.json |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de XTTS-v2 de Coqui: un modelo de texto-a-voz autorregresivo basado en un transformer tipo GPT que predice tokens de audio discretos producidos por un VAE (variational autoencoder) discreto, seguido de un vocoder que reconstruye la forma de onda a 24 kHz. La clonación de voz se consigue mediante latentes de condicionamiento (gpt_cond_latent) y un embedding de hablante (speaker_embedding) extraídos de un clip de referencia de unos 6 segundos, lo que permite sintetizar con la identidad vocal de dicha referencia sin reentrenamiento.

El ajuste fino se realizó sobre el dataset eduardem/romanian-speech-v1, con aproximadamente 150 horas de habla rumana y 5 voces entrenadas (Costel, Mărioara, Georgel, Lăcrămioara y Dorel). La innovación técnica destacable es la inicialización inteligente de embeddings: los nuevos tokens rumanos se inicializaron a partir de los caracteres turcos con cedilla más cercanos, en lugar de pesos aleatorios, para dar un punto de partida semánticamente significativo. Además, el modelo exige una normalización en tiempo de ejecución que convierte cedilla a coma inferior antes de cada inferencia; sin ella, los diacríticos se pronuncian mal o se omiten silenciosamente. La model card no detalla el uso de RLHF o DPO, ni el número exacto de tokens de entrenamiento.

## Capacidades

- Síntesis de voz (text-to-speech) en rumano de alta calidad, con métricas de WER por voz que van del 1,8 % al 14,5 %.
- Clonación de voz zero-shot a partir de un clip de referencia de unos 6 segundos en formato WAV.
- Generación con múltiples estilos de entrega según la voz de referencia: narración literaria, narración expresiva, entrega solemne, estilo de locución clara y conversacional.
- Control de generación mediante parámetros de muestreo: temperature, top_p, top_k, length_penalty y repetition_penalty.
- Soporte de normalización de diacríticos rumanos (cedilla a coma inferior) integrada en el flujo de inferencia.
- No dispone de tool calling, function calling, razonamiento multi-paso ni capacidades de agente; es un modelo puramente de síntesis de voz.
- No soporta visión, audio de entrada más allá de la referencia de voz, ni otros idiomas distintos del rumano.

## Casos de uso

- Audiolibros y narración literaria en rumano: la voz Costel, con un WER del 1,9 %, está entrenada para narración literaria, lo que la hace adecuada para convertir textos largos en audio con pronunciación fiable de diacríticos si se aplica la normalización previa.
- Locución y doblaje para medios: la voz Lăcrămioara, con estilo de locución clara (broadcast), permite generar cuñas y noticias en rumano con una entrega consistente y un WER del 7,2 %.
- Asistentes de voz y atención al cliente en rumano: el modelo permite clonar la voz de un agente concreto a partir de 6 segundos de audio y generar respuestas habladas personalizadas, manteniendo la identidad vocal de la marca.
- Accesibilidad y lectura de contenidos: conversión de artículos, documentación o interfaces en rumano a voz para usuarios con discapacidad visual, aprovechando el soporte nativo de diacríticos rumanos.
- Producción de contenido para redes y pódcast: generación rápida de voces sintéticas en varios estilos (solemne, conversacional, expresivo) sin necesidad de estudio de grabación, con control de parámetros de muestreo para ajustar naturalidad y estabilidad.
- Prototipado de aplicaciones TTS en rumano: integración en pipelines de Python mediante la librería TTS 0.22.0 para validar experiencias de voz antes de invertir en un modelo propietario, con la salvedad de que requiere parches para PyTorch 2.x y soporte del tokenizador rumano.
- Investigación en clonación de voz multilingüe: servir como caso de estudio del manejo de variantes Unicode (cedilla frente a coma inferior) en embeddings de token, útil para otros idiomas con problemas ortográficos similares.

## Benchmarks y rendimiento

Los datos disponibles son el WER medido con Whisper large-v3 por cada una de las 5 voces entrenadas, sobre frases de prueba en rumano:

| Voz | Estilo | WER |
|---|---|---|
| Costel | masculino, narración literaria | 1,9 % |
| Georgel | masculino, entrega solemne | 1,8 % |
| Mărioara | femenino, narración expresiva | 6,1 % |
| Lăcrămioara | femenino, locución clara | 7,2 % |
| Dorel | masculino, conversacional | 14,5 % |
| Media global (5 voces) | — | 6,3 % |

No se han publicado en la información disponible resultados de benchmarks comparativos con otros modelos TTS (por ejemplo, MMLU, HumanEval o GSM8K no aplican a un modelo de voz).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 2,3 GB y el ejemplo de la model card carga el modelo en GPU con `model.cuda()`, lo que sugiere que cabe en GPUs de consumo con suficiente memoria, aunque no se especifica la cifra exacta.
- GPU recomendadas: no disponibles en la información proporcionada; el autor menciona un script de configuración para RunPod (setup_runpod.sh), lo que indica despliegue en GPU en la nube.
- Compatibilidad con GPU de consumo: no confirmada explícitamente; por el tamaño del repositorio (2,3 GB) es plausible en GPUs con 8 GB o más de VRAM, pero no hay dato oficial.
- Opciones de despliegue: librería coqui-tts (TTS 0.22.0) con PyTorch; requiere parches para compatibilidad con PyTorch 2.x y soporte del tokenizador rumano. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| XTTS-v2 Romanian (este modelo) | no disponible | no aplica (TTS) | rumano | CPML | Hugging Face (Music12345/xtts-v2-romanian) |
| coqui/XTTS-v2 (base) | no disponible | no aplica (TTS) | multilingüe (17 idiomas) | CPML | Hugging Face (coqui/XTTS-v2) |
| XTTS-v2 Romanian v2 (versión posterior del mismo autor) | no disponible | no aplica (TTS) | rumano | no disponible en la información | Hugging Face (eduardem/xtts-v2-romanian-v2) |

El modelo base XTTS-v2 es multilingüe y genérico, mientras que este ajuste está especializado en rumano con 5 voces y métricas de WER publicadas por voz. La versión v2 del mismo autor amplía a 15 voces, unos 470 hablantes y unas 471 000 muestras sobre un dataset tres veces mayor, por lo que la model card recomienda la v2 frente a esta v1. No se dispone de datos de benchmarks comparativos frente a otros sistemas TTS comerciales o de código abierto (por ejemplo, Bark, VITS o Piper) en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta rumano; no es multilingüe y no debe usarse para otros idiomas.
- Requiere normalización obligatoria de diacríticos (cedilla a coma inferior) antes de cada inferencia; sin ella, los diacríticos se pronuncian mal o se omiten silenciosamente, lo que degrada la calidad del audio.
- La voz Dorel presenta un WER notablemente alto (14,5 %), muy superior al resto, lo que la hace poco fiable para producción.
- Riesgo de alucinación y de artefactos de audio inherente a los modelos TTS autorregresivos, especialmente con textos largos o fuera de distribución; no se documentan mitigaciones específicas.
- Sesgos conocidos: no se documentan sesgos de género, acento o registro en la información disponible, aunque el conjunto de voces es limitado (3 masculinas y 2 femeninas) y puede no representar la diversidad del rumano.
- Restricciones de licencia: la CPML (Coqui Public Model License) impone condiciones para uso comercial; debe revisarse el enlace de licencia antes de desplegar en producción.
- Dependencia de una versión concreta de la librería (TTS 0.22.0) y de parches para PyTorch 2.x y el tokenizador rumano, lo que complica el despliegue y el mantenimiento.
- El autor advierte de que existe una versión v2 con un dataset tres veces mayor y más voces; la v1 queda desaconsejada para nuevos proyectos.
- No se especifican requisitos de VRAM ni latencia, lo que dificulta la planificación de capacidad en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Music12345/xtts-v2-romanian
- Modelo base XTTS-v2: https://huggingface.co/coqui/XTTS-v2
- Versión posterior v2: https://huggingface.co/eduardem/xtts-v2-romanian-v2
- Demo en vivo y muestras de audio: https://eduardm.codeberg.page/romanian-tts-xtts-v2/
- Código de entrenamiento (Codeberg): https://codeberg.org/eduardm/romanian-tts-xtts-v2
- Script de configuración para RunPod: https://codeberg.org/eduardm/romanian-tts-xtts-v2/src/branch/main/scripts/setup_runpod.sh
- Dataset de entrenamiento: https://huggingface.co/datasets/eduardem/romanian-speech-v1
- Licencia CPML: https://coqui.ai/cpml

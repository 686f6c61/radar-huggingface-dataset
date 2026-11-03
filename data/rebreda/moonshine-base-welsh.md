# rebreda/moonshine-base-welsh

## Resumen

Moonshine Base Welsh es un modelo de reconocimiento automático del habla (ASR) especializado en galés, desarrollado por el usuario rebreda mediante ajuste fino de Moonshine Base de Moonshine AI. Con 61,5 millones de parámetros, es un modelo deliberadamente compacto que puede ejecutarse en CPU y que resulta aproximadamente 25 veces más pequeño que los modelos Whisper para galés de la Universidad de Bangor. Su relevancia radica en ofrecer una alternativa ligera y de licencia MIT para transcripción de voz en galés, un idioma con recursos limitados en el ecosistema ASR.

El modelo hereda la arquitectura y el tokenizador de Moonshine Base y se distribuye en formato safetensors compatible con la librería `transformers`. Acepta audio mono a 16 kHz de enunciados cortos y produce texto con mayúsculas y puntuación. Está pensado para integrarse en pipelines de transcripción de bajo coste, especialmente en entornos con recursos de cómputo restringidos o despliegues en el borde.

La ficha se basa exclusivamente en la información publicada en HuggingFace y en la model card del autor. Los resultados de benchmarks proceden del `model-index` declarado por el autor y no han sido verificados de forma independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Moonshine (encoder-decoder para ASR, heredada de moonshine-base) |
| Parámetros totales | 61.513.920 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el autor recomienda enunciados cortos; límite de generación de 194 tokens) |
| Tipos de cuantización | no disponible (pesos en safetensors; no se documentan variantes GGUF u otras) |
| Idiomas soportados | galés (cy) e inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Moonshine Base, un modelo ASR de 61,5 millones de parámetros que mantiene la misma arquitectura y tokenizador que el modelo original. La entrada es audio mono a 16 kHz y la salida es texto con mayúsculas y puntuación. El autor no detalla en la información disponible la composición exacta del dataset de ajuste ni el número de tokens de entrenamiento, aunque los tags del repositorio citan los datasets `cymen-arfor/lleisiau-arfor`, `google/fleurs`, `techiaith/banc-trawsgrifiadau-bangor` y `techiaith/corpws-clllc-wlga`. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación.

La innovación técnica destacable es la propia elección de Moonshine como base: un modelo mucho más pequeño que las alternativas Whisper para galés, lo que permite inferencia en CPU. El autor documenta una práctica de decodificación relevante: limitar la longitud de salida a aproximadamente 25 tokens por segundo de audio más 10, para evitar bucles de repetición en audio conversacional. Con esta cota y 8 haces, el WER en Siarad baja de 88,3 a 81,9 sin degradar el resto de conjuntos de prueba. Los resultados de la tabla de benchmarks se midieron sin esta cota.

## Capacidades

- Reconocimiento automático del habla en galés, con salida de texto con mayúsculas y puntuación.
- Reconocimiento de inglés hablado dentro de discurso en galés (code-switching limitado).
- Procesamiento de audio mono a 16 kHz de enunciados cortos.
- Decodificación con beam search (5 haces recomendados) y control de longitud de salida.
- Integración con `transformers` mediante `MoonshineForConditionalGeneration` y `pipeline("automatic-speech-recognition")`.
- No se documentan capacidades de tool calling, agentes, visión, audio multilingüe amplio ni modo de razonamiento.

## Casos de uso

- Transcripción de notas de voz y mensajes cortos en galés: el modelo procesa enunciados cortos a 16 kHz y devuelve texto puntuado, adecuado para aplicaciones de mensajería o asistentes de voz en galés.
- Subtitulado ligero de pódcasts en galés: con un detector de actividad de voz que segmente el audio, el modelo puede transcribir segmentos de pódcast (WER de 33,3 en Banc Trawsgrifiadau Bangor) en entornos sin GPU.
- Despliegue en el borde o en CPU: al tener 61,5 millones de parámetros y licencia MIT, puede ejecutarse en dispositivos con recursos limitados para transcripción local sin enviar audio a la nube.
- Investigación en ASR para lenguas de bajos recursos: sirve como línea base reproducible y ligera para experimentos con galés, comparando con modelos Whisper de mayor tamaño.
- Prototipado rápido de aplicaciones de voz en galés: la integración con `transformers` y el pipeline de ASR permiten incorporar transcripción en pocas líneas de código.
- Transcripción de audio leído (prompts, noticias): con WER de 26,1 en Common Voice y 38,2 en FLEURS Welsh, es adecuado para audio de lectura controlada, no para conversación espontánea compleja.
- Evaluación comparativa de modelos pequeños para galés: el autor lo presenta como el mejor modelo de una serie de experimentos con modelos ASR pequeños para galés, útil como referencia en estudios comparativos.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` (WER y CER en %, menor es mejor; beam 5, sin cota de longitud, sin modelo de lenguaje). No verificados de forma independiente.

| Conjunto de prueba | Descripción | Clips | WER | CER |
|---|---|---:|---:|---:|
| Common Voice 27.0 Welsh, test | prompts leídos | 5.390 (split completo) | 26,1 | 9,0 |
| FLEURS Welsh (cy_gb), test | noticias y Wikipedia leídas | 1.020 (split completo) | 38,2 | 15,8 |
| Lleisiau Arfor, test (galés) | conversación | 1.500 | 21,5 | 11,4 |
| Lleisiau Arfor, solo frases no vistas | conversación | 403 | 37,6 | no disponible |
| Siarad (held out) | conversación cotidiana, code-switching | 1.500 | 88,3 | 48,8 |
| Banc Trawsgrifiadau Bangor, test | pódcasts | 1.500 | 33,3 | 14,1 |
| FLEURS English (en_us), test | inglés leído | 500 | 16,6 | 8,7 |

La media sobre Common Voice, FLEURS Welsh, Arfor y Siarad es 43,5. El autor indica que, con cota de longitud y 8 haces, el WER en Siarad baja de 88,3 a 81,9.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 61,5 millones de parámetros, los pesos en precisión completa ocupan aproximadamente 0,25 GB; en fp16, alrededor de 0,12 GB. La VRAM adicional depende del tamaño del lote y de la longitud del audio.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU consumer moderna es suficiente.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1-2 GB de VRAM disponible; también puede ejecutarse en CPU, según indica el autor.
- Opciones de despliegue: `transformers` (probado con la versión 5.20) mediante `MoonshineForConditionalGeneration` o `pipeline("automatic-speech-recognition")`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER galés (referencia) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| moonshine-base-welsh | 61,5 M | no disponible | 26,1 en Common Voice 27.0; 38,2 en FLEURS Welsh | MIT | HuggingFace (`rebreda/moonshine-base-welsh`) |
| Whisper de Bangor University para galés | no disponible (el autor indica que es ~25 veces mayor) | no disponible | no disponible en la información | no disponible | no disponible |
| moonshine-ai/moonshine-base | 61,5 M | no disponible | no disponible | MIT (heredada) | HuggingFace (`moonshine-ai/moonshine-base`) |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación de rendimiento se limita a los resultados del modelo descrito.

## Limitaciones y advertencias

- El WER en conversación espontánea es alto: 88,3 en Siarad (held out), lo que limita su uso en audio conversacional sin segmentación y sin cota de longitud.
- En Lleisiau Arfor, el WER sube de 21,5 a 37,6 cuando se evalúan solo frases no vistas, lo que sugiere cierto solapamiento entre prompts de entrenamiento y prueba en ese conjunto.
- El modelo está entrenado y probado con enunciados cortos; las grabaciones largas deben segmentarse previamente, por ejemplo con un detector de actividad de voz.
- Riesgo de bucles de repetición en audio conversacional con beam search; el autor recomienda limitar la salida a ~25 tokens por segundo de audio más 10.
- El soporte de inglés es limitado al inglés hablado dentro de discurso en galés; no es un modelo ASR general para inglés.
- No se documentan sesgos específicos ni evaluaciones de robustez ante acentos, ruido o dominio fuera de los conjuntos de prueba.
- Licencia MIT: permite uso comercial, pero se hereda de Moonshine; conviene revisar las condiciones del modelo base.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rebreda/moonshine-base-welsh
- Modelo base: https://huggingface.co/moonshine-ai/moonshine-base
- Página del proyecto y write-up: https://quickthoughts.ca/projects/welsh-asr/
- Paper de Moonshine (arXiv:2410.15608): https://arxiv.org/abs/2410.15608
- Dataset Lleisiau Arfor: https://huggingface.co/datasets/cymen-arfor/lleisiau-arfor
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Dataset Banc Trawsgrifiadau Bangor: https://huggingface.co/datasets/techiaith/banc-trawsgrifiadau-bangor
- Dataset Corpws CLLC WLGA: https://huggingface.co/datasets/techiaith/corpws-clllc-wlga

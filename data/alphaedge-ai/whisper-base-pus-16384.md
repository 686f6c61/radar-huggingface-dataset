# alphaedge-ai/whisper-base-pus-16384

## Resumen

`alphaedge-ai/whisper-base-pus-16384` es una variante podada del modelo de reconocimiento automático del habla (ASR) `openai/whisper-base`, publicada por el usuario `alphaedge-ai`. El modelo aplica la técnica de *trimming* de vocabulario descrita por Hugging Face para reducir el tokenizer de Whisper de 51.865 a 16.384 tokens, eliminando los tokens poco frecuentes en pastún (código ISO `ps`/`pus`). El resultado es un modelo un 25,02 % más pequeño en parámetros (54.427.648 frente a 72.593.920) y con un vocabulario un 68,41 % menor, manteniendo la arquitectura original de Whisper.

La motivación es puramente de eficiencia: reducir el peso en disco y la huella de memoria del modelo (el repositorio ocupa 0,1 GB) a cambio de especializarlo en un único idioma. Al eliminar los tokens no usados en pastún, el modelo pierde capacidad multilingüe y debe considerarse estrictamente monolingüe. La licencia Apache 2.0 y el formato `safetensors` con integración en `transformers` facilitan su despliegue en pipelines estándar de ASR.

Es relevante para equipos que necesiten transcripción de audio en pastún con un modelo ligero, desplegable en hardware modesto, y como ejemplo práctico de la metodología de trimming aplicada a modelos de voz. No obstante, se trata de un modelo con muy poca tracción (57 descargas, 0 likes) y sin benchmarks publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper, seq2seq de reconocimiento de voz) |
| Parametros totales | 54.427.648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | pastún (`ps` / `pus`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `openai/whisper-base`: un transformer encoder-decoder entrenado originalmente por OpenAI con supervisión débil a gran escala (paper arXiv:2212.04356). Whisper-base dispone de unos 74 M de parámetros en su versión original; esta variante conserva el encoder y el decoder, pero sustituye el vocabulario por uno reducido de 16.384 tokens. La poda se realizó mediante la técnica de *trimming* documentada en el blog de Hugging Face, que consiste en identificar los tokens efectivamente utilizados en un corpus del idioma objetivo y recortar el resto de la matriz de embeddings y de la capa de salida.

El corpus de minería empleado para determinar qué tokens conservar consta de 20.690 textos extraídos del dataset `lbourdois/fineweb-2-trimming`. No se indica en la información disponible si hubo reentrenamiento adicional, ajuste fino o calibración tras el recorte; la model card sugiere que el modelo "debería comportarse de forma similar al original" en el idioma objetivo. No se documentan detalles sobre RLHF, DPO ni innovaciones de decodificación (como decodificación especulativa o atención lineal).

## Capacidades

- Reconocimiento automático del habla (transcripción) en pastún, con audio de entrada a 16 kHz.
- Generación de transcripciones mediante pipeline `automatic-speech-recognition` de `transformers`.
- Soporte de la tarea `transcribe` (y presumiblemente `translate` heredada de Whisper, aunque no se documenta explícitamente).
- Procesamiento de ventanas de audio de hasta 30 segundos por pasada, según el diseño estándar de Whisper.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico.
- Capacidad multilingüe limitada al pastún: los tokens de otros idiomas fueron eliminados del vocabulario.
- No se documentan capacidades de visión, audio en tiempo real ni modo de razonamiento extendido.

## Casos de uso

- Transcripción de reuniones y entrevistas en pastún: el modelo convierte audio de hasta 30 s por segmento en texto, adecuado para actas y notas en organizaciones que operan en afgano.
- Subtitulado de contenido audiovisual en pastún: integrado en un pipeline que trocea el audio en ventanas de 30 s, permite generar subtítulos para vídeo educativo o informativo.
- Digitalización de archivos orales: transcripción de grabaciones históricas o periodísticas en pastún para su indexación y búsqueda textual.
- Atención al ciudadano en contextos de diáspora: transcripción de llamadas o mensajes de voz en pastún para su enrutamiento o registro, con un modelo ligero desplegable en servidores modestos.
- Prototipado e investigación en ASR de bajos recursos: sirve como punto de partida para experimentos de trimming y evaluación de modelos de voz en lenguas de bajos recursos.
- Despliegue en el borde o en contenedores pequeños: con 0,1 GB de repositorio y 54 M de parámetros, es viable en entornos con memoria limitada donde un Whisper completo resultaría excesivo.
- Preprocesamiento en pipelines de datos: transcripción masiva de audio en pastún para construir corpus de texto destinados a otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; por el tamaño (54 M de parámetros en FP32, ~218 MB) es previsible que quepa en GPUs de gama baja, pero no se confirma.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU consumer moderna (RTX 3060 o superior) debería ser suficiente, aunque no se documenta.
- Cabe en GPU consumer: previsiblemente sí, dado el reducido número de parámetros, aunque no se aporta confirmación.
- Opciones de despliegue: `transformers` con pipeline `automatic-speech-recognition`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (estas herramientas no son habituales para ASR seq2seq).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `alphaedge-ai/whisper-base-pus-16384` | 54.427.648 | ventanas de 30 s (Whisper) | pastún | Apache 2.0 | Hugging Face |
| `openai/whisper-base` | 72.593.920 | ventanas de 30 s | multilingüe (99 idiomas) | Apache 2.0 | Hugging Face |
| `openai/whisper-small` | no disponible en la informacion | ventanas de 30 s | multilingüe | Apache 2.0 | Hugging Face |

La comparación se limita a la familia Whisper porque no se dispone de datos de benchmarks ni de otros modelos ASR específicos de pastún en la información proporcionada. Frente a `openai/whisper-base`, esta variante ofrece un 25 % menos de parámetros y un vocabulario un 68 % menor, a costa de perder el multilingüismo.

## Limitaciones y advertencias

- Modelo monolingüe: solo soporta pastún; los tokens de otros idiomas se eliminaron del vocabulario, por lo que transcribir audio en otras lenguas producirá resultados degradados o incorrectos.
- Sin benchmarks publicados: no hay evidencia cuantitativa de que el rendimiento en pastún iguale al del modelo original, pese a la afirmación de la model card.
- Riesgo de alucinación: como todos los modelos Whisper, puede generar texto plausible que no corresponde al audio, especialmente con ruido o silencios.
- Sesgos: heredados del entrenamiento original de Whisper (datos web de OpenAI) y del corpus de minería de tokens; no se documenta ningún análisis de sesgo.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar el cumplimiento de las condiciones de los datos de entrenamiento subyacentes.
- Tracción mínima: 57 descargas y 0 likes; no hay evidencia de uso en producción ni de validación independiente.
- Fecha de creación futura (2026-05-29) en los metadatos, lo que sugiere que el repositorio puede ser reciente o que los metadatos no son fiables; conviene verificar la integridad del modelo antes de desplegarlo.
- Sin información sobre cuantizaciones disponibles ni sobre latencia/throughput en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/whisper-base-pus-16384
- Modelo base: https://huggingface.co/openai/whisper-base
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Blog de introducción al trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Dataset de minería: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming

# ayfilaS/whisper-tiny_to_korean_accent_21oct

## Resumen

`ayfilaS/whisper-tiny_to_korean_accent_21oct` es un ajuste fino (fine-tuning) del modelo `openai/whisper-tiny` de OpenAI para reconocimiento automatico del habla (ASR) sobre un corpus denominado `Korean_english`. Lo publica el usuario `ayfilaS` en HuggingFace y se distribuye bajo licencia Apache 2.0. El objetivo declarado, a partir del nombre del repositorio, es adaptar el reconocimiento de ingles al acento coreano, es decir, mejorar la transcripcion de hablantes nativos de coreano que hablan en ingles.

Tecnicamente es un transformer encoder-decoder de tipo Whisper, con 37.760.640 parametros totales (unos 37,8 millones), lo que lo situa en la gama mas ligera de la familia Whisper. Procesa audio en ventanas de 30 segundos y trabaja con vocabulario y tokenizador de Whisper. El repositorio ocupa 0,3 GB e incluye pesos en formato safetensors, ademas de estar preparado para `transformers`.

Su relevancia practica es limitada pero concreta: sirve como ejemplo de adaptacion de dominio y de acento sobre un modelo muy pequeno, con un coste de inferencia minimo (cabe en CPU y en cualquier GPU consumer). Conviene tener en cuenta que la model card esta generada automaticamente por el `Trainer` de HuggingFace y no documenta ni la composicion del dataset, ni los usos previstos, ni las limitaciones; el unico dato de rendimiento es un WER de 9,2547 marcado como no verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), 4 capas de encoder y 4 de decoder, d_model 384, 6 cabezas de atencion (heredada de `openai/whisper-tiny`) |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | Ventanas de audio de 30 s (limite de Whisper); 448 posiciones de tokens en el decoder |
| Tipos de cuantizacion | no disponible en la model card; al ser un modelo `transformers` con safetensors admite cuantizacion a fp16/int8 via herramientas externas, pero no se publican artefactos GGUF ni cuantizados |
| Idiomas soportados | `en` (declarado en la model card); el ajuste esta orientado a ingles con acento coreano |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper en su variante tiny: un encoder que consume espectrogramas log-Mel de 80 canales sobre ventanas de 30 segundos y un decoder autoregresivo que genera tokens de transcripcion, con mecanismos de atencion multi-cabeza estandar y embeddings posicionales sinusoidales. No hay innovaciones arquitectonicas propias respecto al modelo base: el repositorio es un fine-tuning, no una variante estructural. El checkpoint parte de `openai/whisper-tiny` y conserva su tokenizador y su vocabulario multilingue.

El entrenamiento se realizo con el `Trainer` de HuggingFace sobre el dataset `Korean_english`, cuya composicion, tamano y procedencia no se documentan en la model card. Los hiperparametros publicados son: learning rate 1e-5, batch de entrenamiento 2, batch de evaluacion 1, semilla 42, optimizador AdamW (variante `torch_fused`, betas 0,9 y 0,999, epsilon 1e-8), scheduler lineal con 500 pasos de warmup y 2000 pasos totales, lo que equivale a aproximadamente 2,03 epochs. No se menciona el uso de RLHF, DPO ni tecnicas de decodificacion especulativa. La perdida de validacion final fue 0,1876 (0,2020 en el paso 1000) y la de entrenamiento 0,0690 en el ultimo checkpoint. Las versiones de framework declaradas son Transformers 5.21.0.dev0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3, lo que implica que la reproducibilidad exacta requiere un entorno bastante especifico.

## Capacidades

- Transcripcion de audio a texto en ingles, con ventanas de hasta 30 segundos por segmento.
- Reconocimiento de habla con acento coreano en ingles (objetivo declarado del fine-tuning, aunque sin evaluacion desglosada por acento).
- Generacion de transcripciones con puntuacion y capitalizacion propias del formato de salida de Whisper.
- Soporte de decoding por lotes y `pipeline("automatic-speech-recognition")` de transformers.
- Capacidad multilingue teorica heredada del vocabulario de Whisper, pero el modelo solo declara ingles y el ajuste puede haber degradado otros idiomas.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio mas alla del ASR.

## Casos de uso

- Transcripcion de reuniones y clases en ingles impartidas por hablantes nativos de coreano: el ajuste busca reducir el WER en ese perfil concreto de habla, y el tamano de 37,8 M permite ejecutarlo en local sin GPU dedicada.
- Subtitulado de contenido audiovisual (videos de formacion, webinars, entrevistas) donde el ponente es coreano y habla en ingles: el modelo cabe en un contenedor ligero y se puede ejecutar en CPU con latencia aceptable para procesamiento por lotes.
- Prototipado rapido de pipelines ASR: al pesar 0,3 GB, es util para validar arquitectura, formato de salida y post-procesado antes de pasar a modelos mayores como `whisper-small` o `whisper-large-v3`.
- Pre-anotacion de corpus de habla con acento para entrenamiento posterior: se puede usar como generador inicial de transcripciones que luego un humano corrige, reduciendo el coste de etiquetado.
- Transcripcion en dispositivos con recursos muy limitados (Raspberry Pi, portatiles sin GPU, entornos edge): los 37,8 M de parametros permiten inferencia en fp32 en menos de 200 MB de RAM.
- Filtrado y busqueda de audio en archivos historicos: transcribir grandes volumenes de grabaciones en ingles con acento coreano y despues indexar el texto resultante.
- Evaluacion comparativa de tecnicas de fine-tuning: sirve como caso de estudio reproducible de ajuste de un modelo Whisper tiny con un dataset pequeno y 2000 pasos de entrenamiento.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (`model-index`), no verificados (`verified: false`):

| Metrica | Dataset | Split | Valor |
|---|---|---|---|
| WER | Korean English (`Korean_english`) | test | 9,2547 |
| WER basic | Korean English | test | 9,2439 |
| WER raw | Korean English | test | 9,7317 |
| Loss (validacion) | Korean English | test | 0,1876 |

Evolucion durante el entrenamiento:

| Paso | Epoch | Training loss | Validation loss | WER | WER basic | WER raw |
|---|---|---|---|---|---|---|
| 1000 | 1,0173 | 0,1602 | 0,2020 | 9,1807 | 9,1707 | 9,6829 |
| 2000 | 2,0346 | 0,0690 | 0,1876 | 9,2547 | 9,2439 | 9,7317 |

Nota: el WER empeora ligeramente entre el paso 1000 y el 2000 pese a mejorar la loss de entrenamiento, lo que sugiere un inicio de sobreajuste. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (unos 151 MB de pesos) y unos 75 MB en fp16; en la practica, cualquier GPU con 2 GB o mas es suficiente.
- GPU recomendadas: no requiere GPU dedicada. Funciona correctamente en CPU. En GPU, cualquier tarjeta consumer (GTX 1050, RTX 2060, RTX 3060, RTX 4090) es mas que suficiente; en A100/H100 el cuello de botella sera el preprocesado de audio, no el modelo.
- Cabe en cualquier GPU consumer, y tambien en placas integradas y dispositivos edge.
- Opciones de despliegue: `transformers` con `pipeline("automatic-speech-recognition")`, servidores tipo TGI o vLLM no estan orientados a ASR secuencial de este tipo; `whisper.cpp` o `faster-whisper` requeririan conversion de pesos, que no se publica en el repositorio. Ollama no soporta arquitectura Whisper de forma nativa.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera inferencia en tiempo real o superior en CPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| `ayfilaS/whisper-tiny_to_korean_accent_21oct` | 37,8 M | 30 s | `en` (ajustado a acento coreano) | Apache 2.0 | WER 9,2547 en `Korean_english` (no verificado) |
| `openai/whisper-tiny` | 37,8 M | 30 s | Multilingue (99 idiomas) | Apache 2.0 | Modelo base; sin ajuste de acento; WER no comparable en el mismo dataset |
| `openai/whisper-base` | 74,4 M | 30 s | Multilingue | Apache 2.0 | Aproximadamente el doble de parametros, mayor precision general esperada |
| `openai/whisper-small` | 244 M | 30 s | Multilingue | Apache 2.0 | Mayor coste de inferencia, mejor rendimiento en acentos y ruido |

La comparacion cuantitativa de WER no es posible con los datos disponibles: el autor solo reporta resultados sobre `Korean_english`, un dataset privado o no documentado, por lo que no hay una linea base publica de `whisper-tiny` sobre el mismo conjunto.

## Limitaciones y advertencias

- La model card esta generada automaticamente y no documenta el dataset `Korean_english`: se desconoce su tamano, procedencia, composicion por acentos, calidad de las transcripciones y posibles sesgos de grabacion.
- El unico resultado de WER (9,2547) esta marcado como no verificado y se calcula sobre un dataset no publico, por lo que no es reproducible ni comparable con la literatura.
- El modelo solo declara ingles; aunque hereda el vocabulario multilingue de Whisper, el ajuste puede haber degradado el rendimiento en otros idiomas y no hay evaluacion al respecto.
- Riesgo de alucinacion textual: los modelos Whisper pueden generar texto plausible en segmentos con silencio, ruido o habla no inteligible, especialmente en variantes pequenas.
- El WER empeoro entre el paso 1000 y el 2000 mientras la loss de entrenamiento bajaba, lo que apunta a sobreajuste sobre un corpus probablemente pequeno (2000 pasos con batch 2).
- Entrenamiento con solo ~2 epochs y batch de 2: la varianza del ajuste es alta y no se reportan multiples semillas.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni documenta la procedencia del audio de entrenamiento, lo que traslada al usuario el riesgo legal sobre los datos.
- La fecha de creacion declarada en el repositorio (2026-10-21) y las versiones de framework (Transformers 5.21.0.dev0, PyTorch 2.11.0) son inconsistentes con el estado publico actual del ecosistema, lo que sugiere metadatos poco fiables o un entorno de entrenamiento no estandar.
- Sin `model description`, `intended uses` ni `training and evaluation data` completados: no hay guia del autor sobre el uso previsto.
- No se publican pesos cuantizados ni conversiones a GGUF/whisper.cpp, lo que limita el despliegue en entornos sin PyTorch.

## Enlaces

- HuggingFace: https://huggingface.co/ayfilaS/whisper-tiny_to_korean_accent_21oct
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Repositorio oficial de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Documentacion de transformers para ASR: https://huggingface.co/docs/transformers/tasks/asr
- No se han encontrado en la busqueda web enlaces relevantes al modelo, al dataset `Korean_english` ni al autor; los resultados devueltos corresponden a partes meteorologicos y no guardan relacion.

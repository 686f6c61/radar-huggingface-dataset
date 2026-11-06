# JoeDwan/whisper-tiny_to_spanish_accent_28oct_v2_no_en

## Resumen

Whisper tiny Spanish es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny para reconocimiento automatico del habla (ASR) con acento espanol. Lo desarrolla el usuario de Hugging Face JoeDwan y se publica bajo licencia Apache 2.0. El modelo parte de la arquitectura encoder-decoder transformer de Whisper, con 37.760.640 parametros totales, y esta pensado para transcribir audio en espanol, presumiblemente con acento peninsular, aunque la model card no detalla la composicion exacta del corpus de entrenamiento.

El problema que aborda es la adaptacion de un modelo ASR multilingue de proposito general a una variante dialectal concreta. Whisper tiny, en su version original, tiene un rendimiento limitado en espanol y puede presentar sesgos hacia otras lenguas o acentos. Este ajuste busca mejorar la tasa de error de palabra (WER) en audio espanol, y segun los datos declarados por el autor alcanza un WER de 11,37 sobre el split de test del dataset Spanish_english.

Es relevante ahora porque los modelos ASR ligeros (tiny, base) son atractivos para despliegues en el borde (edge), dispositivos con recursos limitados y pipelines de transcripcion de bajo coste. No obstante, la informacion publicada es muy escasa: la model card esta generada automaticamente y no incluye descripcion del dataset, casos de uso previstos ni limitaciones. El modelo tiene solo 26 descargas y 0 likes en el momento de la consulta, lo que indica una validacion comunitaria practicamente nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny procesa ventanas de audio de 30 s; el dato no se declara explicitamente en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se declaran variantes GGUF/ONNX en el repo) |
| Idiomas soportados | en (segun metadatos); el nombre y el objetivo del ajuste indican espanol, pero la model card solo declara "en" |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de openai/whisper-tiny, un transformer encoder-decoder con atencion estandar (no se emplean mecanismos de atencion lineal ni state space models). Whisper tiny es la variante mas pequena de la familia Whisper de OpenAI, disenada para transcripcion y traduccion de voz. El ajuste se realizo con la libreria Transformers (version 5.22.0.dev0) y PyTorch 2.11.0+cu130, segun los metadatos del entrenamiento.

Los hiperparametros declarados son: learning rate 1e-05, batch de entrenamiento de 2, batch de evaluacion de 8, semilla 42, optimizador AdamW (fused) con betas (0.9, 0.999) y epsilon 1e-08, scheduler lineal con warmup del 25 %, 2 epocas y precision mixta nativa (AMP). El dataset de entrenamiento es "Spanish_english", del cual no se proporciona tamano, composicion ni procedencia. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion; se trata de un ajuste supervisado clasico sobre pares audio-transcripcion. La innovacion tecnica es limitada: se trata de un fine-tuning de bajo coste (2056 pasos totales) sobre un modelo base pequeno.

## Capacidades

- Reconocimiento automatico del habla (ASR) en espanol, presumiblemente orientado a acento espanol.
- Transcripcion de audio a texto mediante la pipeline `automatic-speech-recognition` de Transformers.
- Compatible con endpoints de Hugging Face (tag `endpoints_compatible`).
- Modelo base Whisper tiny: capacidad teorica de transcripcion multilingue y traduccion de voz, aunque el ajuste puede haber degradado el rendimiento en otras lenguas.
- No se declara soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no aplica a un modelo ASR).
- No se declara soporte de vision ni audio mas alla de la entrada de audio estandar de Whisper.
- Capacidades multilingues: la model card solo declara "en"; el objetivo del ajuste es espanol, pero no hay evidencia publicada de cobertura de otras lenguas.

## Casos de uso

- Transcripcion de reuniones y notas de voz en espanol: el modelo puede convertir audio de reuniones en texto para actas automaticas, aprovechando su tamano reducido para ejecucion en CPU o GPU de gama baja.
- Subtitulado automatico de contenido audiovisual en espanol: integrable en pipelines de postproduccion para generar subtitulos preliminares que luego se revisan manualmente.
- Asistentes de voz embebidos: al tener solo 37,7 M de parametros, puede desplegarse en dispositivos con recursos limitados (Raspberry Pi, moviles) para comandos de voz en espanol.
- Analisis de llamadas de atencion al cliente: transcripcion por lotes de grabaciones para mineria de texto, analisis de sentimiento o control de calidad, con coste computacional bajo.
- Accesibilidad: generacion de transcripciones en tiempo real para personas con discapacidad auditiva en entornos de habla hispana.
- Investigacion en ASR dialectal: punto de partida para experimentos de adaptacion de dominio o comparacion de tecnicas de fine-tuning sobre modelos ligeros.
- Preprocesado de datasets de audio: transcripcion masiva de corpus para etiquetado debil o busqueda por palabras clave.

## Benchmarks y rendimiento

Datos declarados por el autor en la model-index (no verificados, `verified: false`):

| Modelo | Dataset | Split | Metrica | Valor |
|---|---|---|---|---|
| Whisper tiny Spanish (JoeDwan) | Spanish English | test | WER | 11,3682 |
| Whisper tiny Spanish (JoeDwan) | Spanish English | validation (epoca 2) | WER | 11,3682 |
| Whisper tiny Spanish (JoeDwan) | Spanish English | validation (epoca 1,5) | WER | 11,5423 |
| Whisper tiny Spanish (JoeDwan) | Spanish English | validation (epoca 1) | WER | 12,1393 |
| Whisper tiny Spanish (JoeDwan) | Spanish English | validation (epoca 0,5) | WER | 13,4577 |

Perdida de validacion final: 0,2463. No se han publicado resultados de benchmarks en la informacion disponible para comparar con otros modelos (por ejemplo, whisper-tiny original en espanol o whisper-base). Los datos anteriores son los unicos disponibles y no estan verificados por un tercero.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (37,7 M de parametros, ~150 MB de pesos); en FP16, ~75 MB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU moderna, incluida NVIDIA GTX 1650, RTX 3050, RTX 4090, A100 o H100; tambien es viable en CPU para audio de corta duracion.
- Cabe en GPU consumer: si, en practicamente todas, incluidas integradas con suficiente memoria compartida.
- Opciones de despliegue: Transformers (pipeline `automatic-speech-recognition`), endpoints de Hugging Face; no se declaran pesos GGUF ni ONNX en el repo, por lo que llama.cpp/Ollama no estan soportados de forma nativa sin conversion.
- Latencia y throughput estimados: no disponibles. Al ser un modelo tiny, se espera una latencia baja (del orden de decenas de milisegundos por ventana de 30 s en GPU moderna), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | WER espanol | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Whisper tiny Spanish (JoeDwan) | 37,7 M | ventanas de 30 s | 11,37 (dataset propio, no verificado) | apache-2.0 | Hugging Face |
| openai/whisper-tiny | 37,7 M | ventanas de 30 s | no disponible en la informacion | apache-2.0 | Hugging Face |
| openai/whisper-base | ~74 M | ventanas de 30 s | no disponible en la informacion | apache-2.0 | Hugging Face |
| openai/whisper-small | ~244 M | ventanas de 30 s | no disponible en la informacion | apache-2.0 | Hugging Face |

No se dispone de datos de WER comparables para los modelos base en el mismo dataset, por lo que la comparacion cuantitativa no es posible con la informacion proporcionada.

## Limitaciones y advertencias

- Model card generada automaticamente: no incluye descripcion del dataset, casos de uso previstos ni limitaciones, lo que impide evaluar su idoneidad para produccion.
- WER de 11,37 declarado por el autor y no verificado (`verified: false`); el dataset "Spanish_english" no esta documentado publicamente en la ficha.
- Solo 26 descargas y 0 likes: sin validacion comunitaria ni evidencia de robustez en dominios reales.
- El metadato de idioma declara "en", no "es"; el nombre sugiere espanol, pero la cobertura real de acentos y variantes dialectales es desconocida.
- Riesgo de alucinacion: como todo modelo Whisper, puede generar texto no presente en el audio, especialmente en segmentos con ruido o silencio.
- Posible degradacion del rendimiento en otras lenguas tras el ajuste (el nombre incluye "no_en", lo que sugiere eliminacion del ingles, pero no se documenta).
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Whisper tambien es Apache 2.0; no hay restricciones adicionales conocidas.
- Sin garantias de calidad: al ser un ajuste de 2 epocas con batch 2, el sobreajuste o la inestabilidad son plausibles.
- No se proporcionan pesos cuantizados ni formatos alternativos, lo que limita el despliegue en entornos sin Transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JoeDwan/whisper-tiny_to_spanish_accent_28oct_v2_no_en
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Paper de Whisper (referencia del modelo base): https://arxiv.org/abs/2212.04356
- Repositorio de Whisper de OpenAI: https://github.com/openai/whisper

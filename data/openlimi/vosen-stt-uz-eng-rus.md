# openlimi/Vosen-stt-uz-eng-rus

## Resumen

Vosen-STT-Uz-Eng-Rus es un modelo de reconocimiento automatico del habla (ASR) desarrollado por OpenLimi, un ajuste fino del modelo Whisper de OpenAI orientado a transcribir voz en uzbeko, ingles y ruso, con especial enfasis en audio de bajo volumen o susurrado y en enunciados con alternancia de idiomas (code-switching). El modelo parte de la arquitectura Whisper y cuenta con 763.857.920 parametros, lo que lo situa en la franja de Whisper large (aproximadamente 764 millones de parametros), con pesos en formato safetensors y licencia MIT.

El problema que aborda es concreto: los modelos Whisper estandar cometen errores frecuentes cuando el audio llega con poca energia (voz susurrada o grabaciones de baja ganancia), algo habitual en entornos de atencion al ciudadano, grabaciones de campo o microfonos lejanos. OpenLimi reentreno el modelo sobre un conjunto de datos aumentado en volumen para reducir esa tasa de error, y conserva la capacidad multilingue nativa de Whisper para manejar frases que mezclan uzbeko, ingles y ruso en una misma oracion.

Es relevante ahora porque cubre un nicho poco atendido: ASR para uzbeko con tolerancia a code-switching y a audio debil, bajo una licencia permisiva (MIT) que permite uso comercial sin restricciones. La contrapartida es que el ajuste se hizo sobre un corpus muy pequeno (407 audios originales, unas 2.440 muestras tras aumento), lo que limita la generalizacion fuera del dominio legislativo y administrativo con el que se entreno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo Whisper (familia large) |
| Parametros totales | 763.857.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento en Whisper; el pipeline permite chunking con `chunk_length_s=30`) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en safetensors; admite cuantizacion estandar de Whisper via herramientas externas) |
| Idiomas soportados | uzbeko (uz), ingles (en), ruso (ru), incluido code-switching entre ellos |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | automatic-speech-recognition |
| Tamano del repo | 3,1 GB |
| Muestreo de audio | 16 kHz (segun ejemplo de uso) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Whisper de OpenAI: un transformer encoder-decoder con atencion completa, disenado para mapear espectrogramas Mel de audio a tokens de texto. OpenLimi no modifica la arquitectura, sino que realiza un ajuste fino supervisado sobre los pesos preentrenados de Whisper, aprovechando la capacidad multilingue nativa del modelo base para conservar el rendimiento en ingles y ruso.

El entrenamiento se realizo sobre el dataset `Beehzod/uzbek_speech_data`, compuesto por 407 pares audio-texto originales de alta calidad, centrados en dominio legislativo, documentos oficiales y solicitudes ciudadanas. Cada audio se aumento a seis niveles de volumen (+10 dB, +6 dB, 0 dB, -6 dB, -10 dB y -15 dB), generando aproximadamente 2.440 pares de entrenamiento. Los hiperparametros fueron: learning rate 1e-5, 5 epocas con early stopping (se detuvo en la epoca 4), batch size 2 con acumulacion de gradiente 8 (batch efectivo 16) y precision mixta fp16. El checkpoint seleccionado fue el de la epoca 2, con el mejor WER de validacion (8,82 %). No se menciona uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Transcripcion de voz a texto en uzbeko, ingles y ruso.
- Manejo de code-switching: frases que mezclan los tres idiomas en un mismo enunciado (por ejemplo, "keyin meeting'da discuss qilamiz").
- Reconocimiento robusto de audio de bajo volumen y voz susurrada, gracias al aumento de datos por niveles de ganancia.
- Transcripcion de audio largo mediante chunking (segmentos de 30 s con `chunk_length_s`).
- Seleccion explicita de idioma y tarea (`language="uz"`, `task="transcribe"`) en la generacion.
- Integracion con el ecosistema Hugging Face Transformers (`WhisperProcessor`, `WhisperForConditionalGeneration`, `pipeline`).
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio multimodal mas alla del ASR.

## Casos de uso

- Atencion al ciudadano en uzbeko: transcripcion de llamadas o mensajes de voz en oficinas publicas, aprovechando el entrenamiento en dominio legislativo y de solicitudes ciudadanas y la tolerancia a audio de baja calidad telefonica.
- Grabacion de reuniones con code-switching: equipos que alternan uzbeko, ingles y ruso en la misma conversacion pueden obtener una transcripcion unica sin cambiar de modelo ni de idioma manualmente.
- Subtitulado de contenido multimedia: generacion de subtitulos para videos y podcasts en uzbeko con mezcla de terminos tecnicos en ingles o ruso.
- Documentacion de campo con microfono lejano: entrevistas o dictados grabados a distancia donde la senal llega atenuada; el aumento a -15 dB del entrenamiento esta pensado para este escenario.
- Asistentes de voz y dictado en aplicaciones: integracion via `pipeline` de Transformers para dictado de notas o formularios por voz en produccion, con licencia MIT para uso comercial.
- Prototipado e investigacion en ASR de bajos recursos: base para experimentos de ajuste fino adicional sobre uzbeko, dado el reducido tamano del corpus original y la licencia permisiva.
- Preprocesado de corpus de audio: conversion masiva de archivos de audio a texto para indexacion o busqueda en sistemas documentales.

## Benchmarks y rendimiento

Resultados de validacion publicados en la model card durante el entrenamiento:

| Epoca | Training loss | Validation loss | WER |
|---|---|---|---|
| 1 | 0,1927 | 0,1058 | 11,18 % |
| 2 (seleccionada) | 0,0465 | 0,1121 | 8,82 % |
| 3 | 0,0287 | 0,1185 | 10,39 % |
| 4 | 0,0178 | 0,1185 | 9,97 % |

El mejor WER de validacion fue del 8,82 % en la epoca 2. No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) ni evaluaciones en conjuntos de test externos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,5-2 GB para los pesos (764 M de parametros), mas overhead de activaciones y buffers; en la practica, unos 3-4 GB con audio de 30 s.
- En cuantizacion int8 el modelo ocupa alrededor de 0,8-1 GB de pesos; la cuantizacion a 4 bits no esta documentada oficialmente para este checkpoint.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para fp16 comoda (RTX 3060, RTX 4060, RTX 4090, A100, H100). Cabe en GPU de consumo como RTX 3060 o superiores.
- Despliegue: Transformers (`pipeline`), y por compatibilidad de arquitectura Whisper, tambien vLLM, TGI, llama.cpp y Ollama con soporte de Whisper (no verificado especificamente para este checkpoint en la informacion disponible).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto de audio | Licencia | Notas |
|---|---|---|---|---|---|
| Vosen-STT-Uz-Eng-Rus | 763.857.920 | uz, en, ru | segmentos de 30 s | MIT | Ajuste fino para bajo volumen y code-switching; WER validacion 8,82 % |
| Whisper large-v3 (OpenAI) | ~1.550 M | multilingue (incluye uz) | segmentos de 30 s | MIT | Modelo base de referencia; mejor cobertura pero sin ajuste especifico a bajo volumen |
| Whisper large-v2 (OpenAI) | ~1.550 M | multilingue (incluye uz) | segmentos de 30 s | MIT | Generacion anterior del base; mismo enfoque generalista |
| Whisper small (OpenAI) | ~244 M | multilingue | segmentos de 30 s | MIT | Alternativa ligera; menor calidad en idiomas de bajos recursos como el uzbeko |

La comparativa con modelos especificos de uzbeko de terceros no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Dominio restringido: el entrenamiento se centro en lenguaje legislativo, documentos oficiales y solicitudes ciudadanas; la precision puede degradarse en conversaciones informales o textos tecnicos muy especializados.
- Corpus de entrenamiento muy pequeno: 407 audios originales (unas 2.440 muestras tras aumento); es probable que aparezcan errores en dialectos y vocabulario poco frecuente.
- Rendimiento en ingles y ruso dependiente del modelo base: la comprension de estos idiomas proviene de Whisper, por lo que en frases largas y complejas la precision puede ser inferior a la del uzbeko.
- Riesgo de alucinacion: como todo modelo generativo de ASR, puede producir texto plausible que no corresponde al audio, especialmente con silencios, ruido o audio ininteligible.
- Sesgos: no documentados en la model card; el corpus legislativo puede introducir sesgo de estilo formal.
- Licencia MIT: permite uso comercial y modificacion sin restricciones, pero no se ofrece garantia alguna sobre el rendimiento en produccion.
- Sin datos publicados de robustez ante ruido de fondo, acentos regionales o audio telefonicamente comprimido; conviene validar con un conjunto propio antes de desplegar.
- El modelo se publico en noviembre de 2026 con 0 descargas y 1 like en el momento de la consulta; no hay evidencia de uso en produccion ni validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openlimi/Vosen-stt-uz-eng-rus
- Perfil del autor en Hugging Face: https://huggingface.co/openlimi
- Dataset de entrenamiento: https://huggingface.co/datasets/Beehzod/uzbek_speech_data
- Repositorio de Whisper (arquitectura base): https://github.com/openai/whisper
- Documentacion de Whisper en Transformers: https://huggingface.co/docs/transformers/model_doc/whisper
- Licencia MIT: https://opensource.org/licenses/MIT

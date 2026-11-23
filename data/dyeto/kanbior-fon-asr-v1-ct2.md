# dyeto/kanbior-fon-asr-v1-ct2

## Resumen

kanbior-fon-asr-v1-ct2 es la conversion a formato CTranslate2 (float16) del modelo de reconocimiento automatico del habla dyeto/kanbior-fon-asr-v1, un ajuste fino de openai/whisper-small especializado en fon, una lengua gbe hablada principalmente en Benin. El modelo original fue desarrollado por el usuario dyeto y esta pensado para su uso con faster-whisper, la implementacion optimizada de Whisper basada en CTranslate2 que permite inferencia mas rapida en CPU y GPU.

El problema que resuelve es la practica inexistencia de sistemas ASR de calidad para lenguas de bajos recursos como el fon. Al partir de whisper-small (un transformer encoder-decoder de aproximadamente 244 millones de parametros), el modelo hereda la arquitectura y el conocimiento multilingue del modelo base, y lo especializa mediante ajuste fino sobre un corpus especifico de habla fon.

La relevancia de esta version concreta radica en su empaquetado para produccion: al estar convertida a CTranslate2, puede desplegarse con faster-whisper en CPU con cuantizacion int8 o en GPU con float16, lo que reduce los requisitos de infraestructura frente al modelo original en formato transformers. La salida incluye marcas de tono, un aspecto critico en una lengua tonal como el fon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper small), convertido a CTranslate2 |
| Parametros totales | aproximadamente 244 millones (heredados de whisper-small; no confirmado en la model card) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 30 segundos de audio por ventana (ventana estandar de Whisper; no detallado en la model card) |
| Tipos de cuantizacion | float16 (conversion publicada); int8 disponible via faster-whisper en tiempo de carga |
| Idiomas soportados | fon (reconocimiento); se debe forzar el token de idioma frances (`language="fr"`) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | CTranslate2 (float16) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de openai/whisper-small, un transformer encoder-decoder disenado originalmente para ASR multilingue y traduccion de voz. La version publicada aqui es una conversion a CTranslate2 en precision float16 del checkpoint final (commit `4cf79b8`) del modelo dyeto/kanbior-fon-asr-v1, orientada a la libreria faster-whisper.

El entrenamiento se realizo sobre el dataset JML-fon-speech-v1, publicado por J'aime Ma Langue bajo licencia CC-BY-SA-4.0 (DOI 10.57967/hf/11698). La model card no detalla el numero de horas de audio, la composicion exacta del corpus ni si se aplicaron tecnicas de aumento de datos o ajuste adicional. Un detalle tecnico relevante es que Whisper no dispone de token de idioma para el fon, por lo que el modelo se entreno utilizando el token del frances: en inferencia es obligatorio pasar `language="fr"` para obtener resultados correctos.

## Capacidades

- Reconocimiento automatico del habla en lengua fon a partir de audio.
- Transcripcion con marcas de tono en la salida, algo esencial en una lengua tonal.
- Inferencia optimizada mediante CTranslate2 y faster-whisper, con soporte de CPU (int8) y GPU (float16).
- Procesamiento por segmentos con beam search configurable (`beam_size`) y opcion de omitir marcas de tiempo (`without_timestamps`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente ASR.
- No dispone de capacidades de vision, audio generativo ni modo de razonamiento extendido.

## Casos de uso

- Transcripcion de archivos de audio en fon para documentacion linguistica: el modelo convierte grabaciones de campo en texto con marcas de tono, lo que facilita el analisis y la preservacion de la lengua.
- Subtitulado y transcripcion de contenido audiovisual en fon: util para radios comunitarias, television local o archivos de patrimonio oral en Benin.
- Creacion de corpus textuales a partir de audio para entrenar modelos posteriores de traduccion automatica o sintesis de voz en fon.
- Servicios de accesibilidad: generacion de transcripciones para personas con discapacidad auditiva en comunidades fonohablantes.
- Integracion en aplicaciones de mensajeria o dictado por voz en entornos con recursos limitados, aprovechando la inferencia en CPU con int8 de faster-whisper.
- Investigacion en ASR de bajos recursos: sirve como linea base reproducible (conversion CTranslate2 incluida) para comparar futuros ajustes finos sobre whisper-small en lenguas gbe.
- Despliegue en servidores sin GPU: la cuantizacion int8 en CPU permite ejecutar el modelo en hardware modesto para procesamiento por lotes de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de WER (word error rate), CER ni comparaciones cuantitativas con otros sistemas ASR para el fon.

## Requisitos de hardware

- VRAM estimada para inferencia en float16: en torno a 0,5 GB para los pesos del modelo (aproximadamente 244 millones de parametros), mas memoria para activaciones y buffers de audio.
- En CPU con int8: requisitos de RAM reducidos, del orden de varios cientos de MB para los pesos; adecuado para equipos de consumo.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; tarjetas como RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo es lo bastante pequeno como para no necesitarlas.
- Cabe en GPU de consumo: si, practicamente cualquier GPU consumer moderna puede ejecutarlo en float16.
- Opciones de despliegue: faster-whisper (recomendado, segun la model card), CTranslate2 directamente; no se distribuye en formato GGUF ni esta pensado para llama.cpp u Ollama.
- Latencia y throughput: no se han publicado mediciones en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| dyeto/kanbior-fon-asr-v1-ct2 | aprox. 244 M (whisper-small) | 30 s por ventana | fon | CC-BY-SA-4.0 | CTranslate2 |
| openai/whisper-small | aprox. 244 M | 30 s por ventana | multilingue (99 idiomas, sin fon) | MIT | safetensors, CTranslate2 |
| dyeto/kanbior-fon-asr-v1 | aprox. 244 M | 30 s por ventana | fon | CC-BY-SA-4.0 | transformers (safetensors) |

La diferencia principal frente a whisper-small es la especializacion en fon y la salida con tonos; frente al modelo original de dyeto, esta version anade el empaquetado CTranslate2 para faster-whisper. No se dispone de datos de rendimiento comparativo entre ellos en la informacion proporcionada.

## Limitaciones y advertencias

- Requiere forzar `language="fr"` en la inferencia porque Whisper carece de token para el fon; omitirlo puede degradar gravemente la transcripcion.
- El rendimiento real (WER/CER) no esta documentado; se desconoce su robustez ante acentos, ruido de fondo o variantes dialectales del fon.
- Riesgo de alucinacion tipico de los modelos Whisper, especialmente en segmentos de silencio o audio de baja calidad.
- El dataset de entrenamiento (JML-fon-speech-v1) puede introducir sesgos de dominio, hablantes o registro que limiten la generalizacion.
- La licencia CC-BY-SA-4.0 exige atribucion y compartir bajo la misma licencia las obras derivadas, lo que puede condicionar su uso comercial.
- Modelo de un solo autor y con cero descargas registradas en el momento de la ficha: no hay evidencia de validacion independiente ni soporte de la comunidad.
- No apto para tareas fuera de ASR (generacion de texto, codigo, agentes).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dyeto/kanbior-fon-asr-v1-ct2
- Modelo base: https://huggingface.co/dyeto/kanbior-fon-asr-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/JaimeMaLangue/JML-fon-speech-v1
- faster-whisper: https://github.com/SYSTRAN/faster-whisper
- CTranslate2: https://github.com/OpenNMT/CTranslate2
- Licencia CC-BY-SA-4.0: https://creativecommons.org/licenses/by-sa/4.0/

# itsskofficial/livewhisper-te-medium

## Resumen

Livewhisper-te-medium es una conversion a CTranslate2 del modelo `vasista22/whisper-telugu-medium`, publicada por el usuario itsskofficial para su uso con la libreria faster-whisper. El modelo original es un Whisper-medium ajustado (fine-tuning) para telugu por el SPRING Lab del IIT Madras. La conversion no modifica los pesos ni reentrena nada: unicamente cambia el formato de los ficheros a float16 en el formato de CTranslate2 y anade `tokenizer.json` y `preprocessor_config.json`, que faster-whisper necesita para cargar el modelo.

Se trata, por tanto, de un modelo de reconocimiento automatico del habla (ASR) monoidioma, especializado en telugu (`te`), con una arquitectura transformer encoder-decoder heredada de Whisper-medium. El repositorio ocupa 1,5 GB y esta pensado para ejecutarse en local, tanto en GPU como en CPU, dentro de la aplicacion de dictado por voz LiveWhisper para Windows, que es el contexto en el que el autor ha medido su rendimiento.

Su relevancia es practica: convierte un checkpoint de investigacion en un artefacto directamente desplegable con faster-whisper, con licencia apache-2.0 y un coste de memoria muy inferior al de whisper-large-v3, y con una tasa de error reportada bastante mejor que la de large-v3 en telugu segun las mediciones del propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper-medium), convertido a CTranslate2 |
| Parametros totales | Aproximadamente 769 M (arquitectura Whisper-medium; no confirmado en la informacion proporcionada) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | Ventanas de audio de 30 s (caracteristica de Whisper); valor en tokens no disponible |
| Tipos de cuantizacion | Pesos del repositorio en float16; faster-whisper admite ademas `int8`, `int8_float16`, `float16` y `float32` en tiempo de carga |
| Idiomas soportados | Telugu (`te`) |
| Licencia | apache-2.0 |
| Formato de pesos | CTranslate2 (`model.bin`, precision float16), mas `tokenizer.json` y `preprocessor_config.json` |
| Tamano del repositorio | 1,5 GB |
| Libreria | ctranslate2 |

## Arquitectura y entrenamiento

El modelo es un Whisper-medium, es decir, un transformer encoder-decoder con atencion completa entrenado originalmente por OpenAI sobre cientos de miles de horas de audio debilmente supervisado, y posteriormente ajustado para telugu por el SPRING Lab del IIT Madras (checkpoint `vasista22/whisper-telugu-medium`). El repositorio que nos ocupa no introduce cambios de arquitectura ni de pesos: es una conversion de formato.

El autor de la conversion indica explicitamente que todo el credito corresponde a los autores originales y que la unica modificacion es el cambio de formato de fichero (pesos float16 y los ficheros auxiliares que faster-whisper requiere). No se dispone de informacion sobre el numero de tokens de audio usados en el ajuste, la composicion del dataset de fine-tuning, ni sobre si se aplicaron tecnicas de RLHF, DPO o similar. El modelo base pertenece al SPRING Lab del IIT Madras, un grupo con produccion conocida en ASR para idiomas del sur de la India.

## Capacidades

- Reconocimiento automatico del habla en telugu: transcripcion de audio a texto en dicho idioma.
- Ejecucion local de baja latencia mediante CTranslate2, con soporte de CPU y GPU.
- Carga directa con faster-whisper, incluyendo la API de segmentos con marcas de tiempo propias de la libreria (no confirmado explicitamente en la model card).
- Salida en escritura telugu y, segun la metrica reportada por el autor, tambien en telugu romanizado ("delivered Telugu romanized").
- Integracion como motor ASR dentro de la aplicacion de dictado LiveWhisper para Windows.
- No dispone de soporte de tool calling, function calling, agentes, vision ni audio generativo: es exclusivamente un modelo de transcripcion.
- No es multilingue: esta especializado en telugu.

## Casos de uso

- Dictado por voz en Windows: es el escenario para el que se creo el repositorio. LiveWhisper descarga este modelo ya convertido y lo usa para transcribir la voz del usuario en telugu en tiempo real, sin depender de servicios en la nube.
- Transcripcion de reuniones y notas de voz en telugu: con ventanas de 30 s y decodificacion por segmentos, permite convertir grabaciones de reuniones en texto para su posterior busqueda o resumen.
- Generacion de subtitulos para contenido audiovisual en telugu: el modelo puede alimentar un pipeline de subtitulado, generando segmentos con marcas de tiempo que despues se sincronizan con el video.
- Analitica de centros de contacto en telugu: transcripcion masiva de llamadas para extraer motivos de contacto, palabras clave y metricas de calidad, ejecutable en local para evitar enviar audio de clientes a terceros.
- Accesibilidad: conversion de voz a texto para personas con dificultades auditivas o de habla en entornos donde el telugu es el idioma principal.
- Investigacion en ASR para idiomas con pocos recursos: sirve como linea base reproducible y de bajo coste computacional para comparar tecnicas de adaptacion al dominio en telugu.
- Generacion de datos pseudo-etiquetados: transcripcion de grandes volumenes de audio en telugu para construir corpus de texto que alimenten el entrenamiento de modelos de lenguaje en ese idioma.
- Despliegue en hardware modesto: al ocupar 1,5 GB en float16, puede ejecutarse en equipos sin GPU dedicada de gama alta, lo que habilita la transcripcion offline en portatiles y estaciones de trabajo convencionales.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible proceden de la model card y fueron medidos por el autor dentro de la aplicacion LiveWhisper, comparando contra whisper-large-v3 en el mismo entorno:

| Metrica | livewhisper-te-medium | whisper-large-v3 |
|---|---|---|
| FLEURS word error | 37,1 % | 74,4 % |
| Telugu romanizado entregado | 36,2 % | 71,6 % |

Conviene interpretar estas cifras con cautela: la model card no detalla el subconjunto exacto de FLEURS empleado, el procedimiento de evaluacion ni la definicion precisa de la metrica "delivered Telugu romanized". No se han publicado resultados de MMLU, HumanEval ni GSM8K, ya que no son aplicables a un modelo ASR.

## Requisitos de hardware

- VRAM estimada en float16: en torno a 1,6-2 GB, coherente con un repositorio de 1,5 GB de pesos mas las activaciones y la cache de decodificacion.
- VRAM estimada con `int8_float16` o `int8`: aproximadamente 1 GB o menos, segun la precision de computo elegida en faster-whisper.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, por ejemplo GTX 1050 Ti, GTX 1650, RTX 2060 o superiores; en GPUs de datacenter (A100, H100) el modelo queda muy sobredimensionado en memoria y el cuello de botella pasa a ser la E/S de audio.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada de los ultimos ocho anos; tambien funciona en CPU gracias a CTranslate2.
- Opciones de despliegue: faster-whisper (via CTranslate2), la aplicacion LiveWhisper para Windows y, en general, cualquier herramienta construida sobre faster-whisper, como WhisperX. No es compatible con vLLM ni con llama.cpp/Ollama, ya que no es un modelo de lenguaje de texto ni un GGUF.
- Latencia y throughput: no disponible. La model card no publica factor de tiempo real ni velocidad de transcripcion.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana de audio | WER FLEURS en telugu | Licencia | Formato |
|---|---|---|---|---|---|
| livewhisper-te-medium | ~769 M (Whisper-medium) | 30 s | 37,1 % | apache-2.0 | CTranslate2, float16 |
| vasista22/whisper-telugu-medium | ~769 M (Whisper-medium) | 30 s | no disponible | apache-2.0 | PyTorch / safetensors |
| openai/whisper-medium | ~769 M | 30 s | no disponible (multilingue, no especializado) | apache-2.0 | PyTorch / safetensors |
| openai/whisper-large-v3 | ~1550 M | 30 s | 74,4 % segun la model card de este repositorio | apache-2.0 | PyTorch / safetensors |

El modelo base (`vasista22/whisper-telugu-medium`) contiene exactamente los mismos pesos, pero en formato PyTorch; la diferencia practica es que livewhisper-te-medium se carga directamente con faster-whisper sin conversion previa. Los parametros de whisper-large-v3 se incluyen como referencia de conocimiento general y no aparecen en la informacion proporcionada.

## Limitaciones y advertencias

- Un WER del 37,1 % en FLEURS sigue siendo alto: es adecuado para transcripcion asistida, pero no para flujos que exijan transcripcion literal sin revision humana.
- Monoidioma: solo telugu. El audio en otros idiomas producira salidas incorrectas o se traducira de forma no controlada segun la configuracion de decodificacion.
- Riesgo de alucinacion tipico de Whisper en silencios, ruido de fondo o audio musical: se recomienda aplicar los filtros de VAD y los umbrales de `no_speech` de faster-whisper.
- Es una mera conversion de formato: no incorpora mejoras de calidad sobre el modelo base, y los autores originales no han validado necesariamente esta version.
- El repositorio registra 0 descargas y 0 likes, por lo que no cuenta con validacion de la comunidad.
- La metrica "delivered Telugu romanized" no esta definida de forma publica; su interpretacion exacta queda abierta.
- Licencia apache-2.0, permisiva e inclinada a uso comercial, heredada del modelo original; conviene verificar igualmente las condiciones del checkpoint base y de los datos de entrenamiento subyacentes.
- No se documentan sesgos especificos ni cobertura de acentos o variedades dialectales del telugu.
- No hay informacion sobre rendimiento con audio de baja calidad, solapamiento de hablantes ni diarizacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/itsskofficial/livewhisper-te-medium
- Modelo base: https://huggingface.co/vasista22/whisper-telugu-medium
- faster-whisper: https://github.com/SYSTRAN/faster-whisper
- LiveWhisper: https://github.com/itsskofficial/LiveWhisper
- No se han encontrado otros enlaces relevantes (papers, blogs o demos) en la busqueda web realizada; los resultados obtenidos no guardaban relacion con el modelo.

# CholoAsis/qnvoice-urdu-matcha-tts

## Resumen

QnVoice Urdu Matcha TTS es un modelo de sintesis de voz (text-to-speech) en urdu desarrollado por CholoAsis para la aplicacion QnVoice en iOS. Se trata de una destilacion del modelo Matcha TTS de AhsanTalal, orientada a inferencia local en dispositivos moviles. El modelo lee texto en escritura urdu y genera audio mono a 22,05 kHz mediante un vocoder HiFi-GAN separado; ambos modelos se distribuyen en formato ONNX y se ejecutan en local sin conexion.

La relevancia de esta publicacion radica en su enfoque de eficiencia: reduce el solver de flujo del modelo profesor a tres pasos e incorpora una capa de correccion de mel de solo 75.920 parametros entrenada sobre salidas sinteticas del profesor. El resultado es un modelo que mantiene el codificador de texto, el estimador de flujo y el vocabulario del profesor original, pero con un coste de inferencia menor, pensado para sintesis en tiempo casi real en hardware de consumo.

El repositorio es de tamano reducido (0,1 GB), no registra descargas ni likes en el momento de la consulta, y su licencia combina terminos Apache 2.0 (modelo acustico) y MIT (vocoder). Es una publicacion de investigacion, no un modelo de produccion validado a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matcha TTS (codificador de texto + estimador de flujo + solver de 3 pasos) con vocoder HiFi-GAN separado |
| Parametros totales | no disponible (la capa de correccion de mel anadida tiene 75.920 parametros; el total del modelo no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (distribucion en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | urdu (ur) |
| Licencia | Apache 2.0 y MIT (campo `license: other`, `license_name: apache-2.0-and-mit`) |
| Formato de pesos | ONNX (modelo acustico y vocoder) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Matcha TTS, un esquema de sintesis basado en flujo matching que combina un codificador de texto, un estimador de flujo y un solver numerico para generar representaciones mel antes de la vocodificacion. QnVoice conserva el codificador de texto, el estimador de flujo y el vocabulario del profesor, pero reduce el solver de flujo a tres pasos, lo que disminuye el coste computacional por sintesis. Sobre esa base se entreno una capa de correccion de mel de 75.920 parametros usando salidas sinteticas del modelo profesor, con el objetivo de compensar la perdida de calidad asociada a la reduccion de pasos.

El profesor original identifica UrduSpeech, un dataset derivado de Rasa, como fuente de entrenamiento. No se detalla en la informacion disponible el numero de horas de audio, la composicion exacta del dataset ni si hubo etapas de ajuste fino adicionales mas alla de la destilacion descrita. La generacion de audio final corre a cargo de un vocoder HiFi-GAN independiente que produce audio mono a 22,05 kHz. La innovacion principal es, por tanto, la destilacion hacia un solver de pocos pasos con una capa correctora ligera, orientada a inferencia offline en iOS.

## Capacidades

- Sintesis de voz a partir de texto en escritura urdu.
- Generacion de audio mono a 22,05 kHz mediante vocoder HiFi-GAN.
- Inferencia completamente local y offline una vez descargados los modelos ONNX.
- Ejecucion en dispositivos moviles (validado en iPhone 15 Pro).
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni otras capacidades propias de modelos de lenguaje.
- No se documenta soporte multilingue: el modelo esta entrenado exclusivamente para urdu.
- No se documentan capacidades de clonacion de voz, control de estilo ni emocion.

## Casos de uso

- Lectura de texto urdu en aplicaciones iOS: el modelo se integra como motor TTS local en QnVoice, permitiendo leer contenido en urdu sin conexion y sin enviar texto a servidores externos.
- Accesibilidad para personas con discapacidad visual: sintesis de articulos, mensajes y documentos en urdu en el propio dispositivo, con latencia de sintesis en caliente de aproximadamente 1,30 segundos en un iPhone 15 Pro.
- Asistentes de voz embebidos: al ejecutarse en ONNX en local, puede alimentar interfaces de voz en aplicaciones moviles que requieran privacidad y funcionamiento sin red.
- Aprendizaje de urdu: generacion de pronunciaciones de frases y vocabulario para aplicaciones educativas que necesiten audio sintetico bajo demanda.
- Sistemas de navegacion y avisos hablados en urdu: sintesis de indicaciones cortas en entornos con conectividad limitada.
- Prototipado de investigacion en TTS de bajos recursos: el modelo sirve como base para experimentos de destilacion, reduccion de pasos de solver y evaluacion de calidad en lenguas de bajos recursos.

## Benchmarks y rendimiento

La model card reporta tiempos de sintesis medidos en un iPhone 15 Pro, con 72 ejecuciones por modelo, cubriendo inferencia acustica y vocodificacion tras la carga de los modelos:

| Metrica | Modelo destilado (QnVoice) | Modelo original (profesor) |
|---|---|---|
| Mediana de sintesis en caliente (iPhone 15 Pro) | 1,30 s | 1,50 s |

No se han publicado resultados de benchmarks objetivos de calidad de audio (MOS, WER, similitud de hablante) en la informacion disponible. La model card indica que las pruebas de escucha con hablantes nativos se plantean como trabajo futuro.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo esta pensado para ejecucion en CPU/GPU movil mediante ONNX y el repositorio ocupa 0,1 GB.
- GPU recomendadas: no se especifican; la validacion publicada se realizo en un iPhone 15 Pro.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano reducido del repositorio y el enfoque movil, aunque no se documentan requisitos minimos.
- Opciones de despliegue: ONNX Runtime en iOS; el repositorio incluye un script de ejemplo en Python 3.11 (`speak-urdu-tts.py`) con entorno virtual y verificacion de checksums SHA256.
- Latencia y throughput: mediana de 1,30 s por sintesis en caliente en iPhone 15 Pro (72 ejecuciones); no se reporta throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CholoAsis/qnvoice-urdu-matcha-tts | no disponible (capa de correccion de 75.920 parametros) | no disponible | 1,30 s mediana en iPhone 15 Pro | Apache 2.0 + MIT | Hugging Face, ONNX |
| AhsanTalal/urdu-matcha-tts (profesor) | no disponible | no disponible | 1,50 s mediana en iPhone 15 Pro | no disponible en la informacion | Hugging Face, checkpoint |
| Otros TTS para urdu | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo profesor, ya que la informacion disponible no identifica otras alternativas comparables de TTS en urdu con datos publicados.

## Limitaciones y advertencias

- Modelo de investigacion: la propia model card lo califica como publicacion de investigacion, no como sistema de produccion validado.
- Evaluacion subjetiva pendiente: no hay pruebas de escucha con hablantes nativos publicadas; la calidad percibida no esta cuantificada.
- Cobertura limitada a urdu: no soporta otros idiomas ni cambios de codigo.
- Sin datos sobre sesgos: no se documentan sesgos de genero, dialecto o prosodia, ni la diversidad de hablantes del dataset de entrenamiento.
- Riesgo de alucinacion acustica: como todo TTS, puede producir pronunciaciones incorrectas o artefactos en texto fuera de dominio, aunque no se cuantifica.
- Restricciones de licencia: la licencia combina Apache 2.0 y MIT, pero la model card senala que quedan por revisar los terminos de datasets con acceso restringido y los derechos de los hablantes para un despliegue comercial.
- Dataset de origen: el profesor se entreno con UrduSpeech (derivado de Rasa); las condiciones de uso de esos datos condicionan el uso comercial.
- Sin soporte documentado de control de prosodia, emocion ni clonacion de voz.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, lo que limita la validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CholoAsis/qnvoice-urdu-matcha-tts
- Modelo profesor: https://huggingface.co/AhsanTalal/urdu-matcha-tts
- Checkpoint del profesor: https://huggingface.co/AhsanTalal/urdu-matcha-tts/blob/main/matcha_urdu.ckpt
- Repositorio fuente en GitHub: https://github.com/ceasis/hf-urdu-text-to-speech-model/tree/a53edb780e415da0aab15dc86685e97f90bf6523
- Muestras de audio de benchmark: https://github.com/ceasis/hf-urdu-text-to-speech-model/tree/a53edb780e415da0aab15dc86685e97f90bf6523/samples/benchmark
- Preprint en Zenodo: https://doi.org/10.5281/zenodo.24031144
- Dataset UrduSpeech: https://huggingface.co/datasets/humairawan/UrduSpeech
- Dataset Rasa: https://huggingface.co/datasets/ai4bharat/Rasa
- Instrucciones de descarga de Hugging Face CLI: https://huggingface.co/docs/huggingface_hub/en/guides/cli#download-to-a-local-folder

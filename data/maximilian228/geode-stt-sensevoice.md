# Maximilian228/Geode-STT-sensevoice

## Resumen

Geode-STT-sensevoice es un paquete de reconocimiento automatico del habla (ASR) derivado de SenseVoiceSmall, el modelo de Alibaba Group / FunAudioLLM. El autor, Maximilian228, lo publica en formato sherpa-onnx con pesos ONNX cuantizados a int8, pensado para inferencia local y sin conexion dentro de la aplicacion Android Geode. No se trata de un modelo entrenado desde cero, sino de una conversion y empaquetado del release int8 oficial de sherpa-onnx, sin modificaciones respecto al original.

El modelo cubre cinco idiomas (chino mandarin, japones, coreano, ingles y cantonés) y esta etiquetado como variante "fast" dentro del catalogo de Geode. El repositorio ocupa aproximadamente 0,2 GB e incluye unicamente los ficheros `model.int8.onnx` y `tokens.txt`, lo que lo hace adecuado para despliegue en dispositivos con recursos limitados.

Su relevancia actual radica en la demanda de transcripcion de voz privada y de baja latencia en movil: al ejecutarse con sherpa-onnx sobre CPU, evita el envio de audio a servicios en la nube. La licencia es la FunASR Model Open Source License Agreement 1.1, que permite uso, copia, modificacion y distribucion conservando la atribucion y el nombre del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base SenseVoiceSmall de FunAudioLLM; detalles arquitectonicos no incluidos en la informacion proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (unico peso incluido: `model.int8.onnx`) |
| Idiomas soportados | zh, ja, ko, en, yue |
| Licencia | FunASR Model Open Source License Agreement 1.1 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | ONNX int8 (`model.int8.onnx`) + `tokens.txt`, formato sherpa-onnx con tipo de modelo `sense_voice` |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna en la documentacion proporcionada. El modelo base es FunAudioLLM/SenseVoiceSmall (revision `3847d57b6b`), y este paquete es la conversion int8 oficial de sherpa-onnx, sin cambios respecto al release original. No se detallan datos de entrenamiento, numero de tokens, composicion del corpus ni si hubo RLHF o DPO.

La innovacion tecnica del paquete no esta en el entrenamiento sino en el empaquetado: exportacion a ONNX cuantizado a int8 y compatibilidad con el runtime sherpa-onnx, lo que permite ejecucion en CPU de movil y portatil. El autor declara compatibilidad con sherpa-onnx v2.0.1 y el tipo de modelo `sense_voice`.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) en chino, japones, coreano, ingles y cantonés.
- Ejecucion local y sin conexion (on-device, offline) mediante sherpa-onnx.
- Inferencia en CPU con cuantizacion int8, orientada a dispositivos de gama media.
- Integracion como paquete listo para usar en la aplicacion Android Geode.
- No se documentan capacidades de traduccion, diarizacion, puntuacion automatica, tool calling ni agentes en la informacion disponible.
- No se documenta soporte de vision ni audio mas alla de la propia transcripcion.

## Casos de uso

- Transcripcion de notas de voz en Android: la app Geode puede convertir grabaciones a texto en el propio dispositivo usando sherpa-onnx y los pesos int8, sin enviar audio a servidores externos.
- Dictado offline en entornos sin conectividad: util en movilidad, zonas rurales o aviacion, donde la latencia de red o la falta de cobertura impiden usar APIs en la nube.
- Subtitulado local de contenido en ingles y lenguas asiaticas: el soporte de zh, ja, ko y yue permite generar transcripciones de videos o podcasts en esos idiomas en un portatil.
- Prototipado rapido de pipelines ASR: al ser un unico fichero ONNX con `tokens.txt`, se integra en scripts de evaluacion o demos con el CLI de sherpa-onnx en pocos minutos.
- Asistentes de voz con requisitos de privacidad: la inferencia local evita el tratamiento de datos personales por terceros, lo que facilita el cumplimiento de normativas de proteccion de datos.
- Evaluacion comparativa de ASR multilingue: sirve como referencia ligera para medir CER/WER en los cinco idiomas frente a otros motores, usando el conjunto FLEURS como base.

## Benchmarks y rendimiento

El autor publica errores medidos sobre el conjunto de test FLEURS (normalizado: sin mayusculas ni puntuacion), con 30 enunciados por idioma, ejecutando sherpa-onnx con los ficheros del paquete en CPU de portatil:

| Idioma | Metrica | Error % | Enunciados |
|---|---|---|---|
| zh | CER | 7,79 | 30 |
| ja | CER | 8,69 | 30 |
| ko | CER | 9,19 | 30 |
| en | WER | 8,40 | 30 |

La tabla de rendimiento en movil (Redmi Note 9 Pro, Snapdragon 720G, sherpa-onnx v2.0.1 CLI, 4 hilos) aparece en la model card con las columnas de tiempo de carga, RTF para un clip de 10 s y RSS maximo (VmHWM), pero los valores estan vacios en la informacion proporcionada. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en CPU mediante sherpa-onnx. El repositorio completo ocupa aproximadamente 0,2 GB, por lo que el uso de memoria es reducido.
- GPU recomendadas: no se documentan; el diseno es para CPU. Cualquier GPU compatible con ONNX Runtime podria ejecutarlo, pero no hay datos de rendimiento GPU.
- CPU: el autor valida el paquete en CPU de portatil y en un Snapdragon 720G (Redmi Note 9 Pro) con 4 hilos.
- Cabe en GPU de consumo: si, en terminos de memoria, aunque el objetivo declarado es la ejecucion en CPU de movil.
- Opciones de despliegue: sherpa-onnx (CLI y libreria, v2.0.1 validada), ONNX Runtime; integracion en la app Android Geode.
- Latencia y throughput: no disponibles; la model card deja vacias las celdas de tiempo de carga, RTF y RSS pico.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Geode-STT-sensevoice (este) | no disponible | no disponible | zh, ja, ko, en, yue | FunASR Model License 1.1 | ONNX int8 (sherpa-onnx) |
| FunAudioLLM/SenseVoiceSmall (base) | no disponible | no disponible | zh, ja, ko, en, yue | FunASR Model License 1.1 | safetensors / PyTorch |
| Whisper small (OpenAI) | no disponible en la informacion proporcionada | no disponible | multilingue | MIT | safetensors, GGUF, ONNX |
| Alternativas ligeras de ASR en sherpa-onnx | no disponible | no disponible | variable | variable | ONNX |

La comparativa cuantitativa con Whisper small u otras alternativas no esta disponible en la informacion proporcionada; no se aportan CER/WER comparables ni datos de rendimiento de terceros.

## Limitaciones y advertencias

- La licencia es la FunASR Model Open Source License Agreement 1.1, no una licencia permisiva estandar; permite uso, copia, modificacion y distribucion pero exige mantener la atribucion y el nombre del modelo. Conviene revisar el texto completo antes de uso comercial.
- El paquete solo incluye pesos int8; no hay variantes fp16 o fp32 en el repositorio, lo que limita el ajuste fino de precision frente a velocidad.
- Los benchmarks publicados se basan en solo 30 enunciados por idioma en FLEURS, una muestra pequena que reduce la fiabilidad estadistica de las cifras de CER/WER.
- No se documentan sesgos conocidos, comportamiento ante ruido, acentos o audio de baja calidad; el rendimiento en condiciones reales de movil puede diferir del medido en portatil.
- Riesgo de alucinacion y errores de transcripcion inherente a cualquier modelo ASR, especialmente en idiomas con menos datos o en dominios especializados (terminologia medica, juridica, nombres propios).
- No se documenta la longitud de contexto ni la duracion maxima de audio procesable por fragmento.
- El modelo esta empaquetado para la app Geode; no se garantiza soporte fuera de ese ecosistema ni mantenimiento futuro del repositorio (0 descargas y 0 likes en el momento de la consulta).
- No se dispone de informacion sobre el proceso de entrenamiento ni sobre datos de evaluacion independientes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Maximilian228/Geode-STT-sensevoice
- Modelo base SenseVoiceSmall: https://huggingface.co/FunAudioLLM/SenseVoiceSmall
- Proyecto sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- FunASR (Alibaba Group): no disponible en la informacion proporcionada
- Paper de SenseVoice: no disponible en la informacion proporcionada
- Demo o blog del autor: no disponible en la informacion proporcionada

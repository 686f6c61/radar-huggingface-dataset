# lial-apps/siman-ivrit-turbo

## Resumen

Siman Ivrit Turbo (`lial-apps/siman-ivrit-turbo`) es una conversion a ONNX del modelo de reconocimiento automatico del habla `ivrit-ai/whisper-large-v3-turbo`, optimizada para ejecutarse en el navegador mediante Transformers.js y WebGPU. No se trata de un modelo entrenado desde cero: el autor original del modelohebreo es ivrit.ai, y esta version se limita a convertir los pesos a formatos ONNX cuantizados (encoder en FP16 y Q4, decoder en Q4) para su despliegue en cliente.

El modelo resuelve un problema concreto: la transcripcion de audio en hebreo sin enviar datos a un servidor. Al ejecutarse en el dispositivo del usuario, la app סימן (a la que hace referencia la model card) puede transcribir voz manteniendo el audio local, lo que resulta relevante para aplicaciones de privacidad, accesibilidad o dictado en navegador.

Arquitectonicamente deriva de Whisper large-v3-turbo, un transformer encoder-decoder con aproximadamente 809 millones de parametros, especializado en ASR multilingue pero ajustado aqui para hebreo. La licencia Apache-2.0 y el formato ONNX lo hacen directamente integrable en aplicaciones web sin dependencias de servidor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo) |
| Parametros totales | aproximadamente 809 millones (heredados de Whisper large-v3-turbo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | encoder FP16 (`encoder_model_fp16.onnx`), encoder Q4 (`encoder_model_q4.onnx`), decoder Q4 (`decoder_model_merged_q4.onnx`) |
| Idiomas soportados | hebreo (`he`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (repo de 2.0 GB) |

## Arquitectura y entrenamiento

El modelo es una conversion de formato del checkpoint `ivrit-ai/whisper-large-v3-turbo`, que a su vez parte de Whisper large-v3-turbo de OpenAI y ha sido ajustado por ivrit.ai para hebreo. La arquitectura es la clasica de Whisper: un encoder que procesa espectrogramas de audio y un decoder autoregresivo que genera tokens de texto, con atencion cruzada entre ambos. Whisper large-v3-turbo reduce el numero de capas del decoder respecto a large-v3 para acelerar la inferencia manteniendo calidad.

No hay reentrenamiento en esta version: la model card indica explicitamente "No retraining — a format conversion only". El trabajo tecnico consiste en exportar los pesos a ONNX y aplicar cuantizacion (FP16 para el encoder y Q4 para encoder y decoder) para reducir el peso y hacer viable la ejecucion en WebGPU dentro del navegador. No se documentan en la informacion disponible detalles sobre el dataset de ajuste del modelo base, el numero de tokens de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Reconocimiento automatico del habla (ASR) en hebreo a partir de audio.
- Transcripcion en el dispositivo del usuario mediante Transformers.js y WebGPU, sin enviar audio a servidores.
- Variantes cuantizadas que permiten elegir entre mayor precision (encoder FP16) y menor huella de memoria (encoder Q4).
- Integracion en aplicaciones web del navegador a traves de la libreria transformers.js.
- No se documentan capacidades de traduccion, diarizacion, tool calling ni agentes en la informacion disponible.

## Casos de uso

- Dictado por voz en hebreo dentro de una aplicacion web: el modelo transcribe en el navegador y el audio permanece en el dispositivo, adecuado para notas personales o documentos sensibles.
- Subtitulado de reuniones o clases en hebreo: al ejecutarse en cliente con WebGPU, se puede transcribir en tiempo casi real sin coste de servidor ni exposicion de datos.
- Accesibilidad para personas con dificultades motoras: entrada de texto por voz en hebreo integrada en formularios web mediante Transformers.js.
- Aplicaciones de privacidad estricta (sanidad, legal): la transcripcion local evita transferir grabaciones a terceros, cumpliendo requisitos de minimizacion de datos.
- Prototipado rapido de funcionalidades ASR: la licencia Apache-2.0 y el formato ONNX permiten integrar el modelo en demos web sin infraestructura de inferencia.
- Transcripcion offline en entornos con conectividad limitada: una vez descargado el modelo (2.0 GB), la inferencia no requiere red, util para dispositivos moviles o zonas sin cobertura estable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repo completo ocupa 2.0 GB; la variante con encoder Q4 y decoder Q4 reduce la huella de memoria frente a FP16, aunque no se especifica el consumo exacto en la informacion disponible.
- GPU recomendadas: cualquier GPU con soporte WebGPU en navegador (por ejemplo, integradas recientes o dedicadas de consumo); no se documentan requisitos minimos oficiales.
- Cabe en GPU de consumo: si, al estar disenado para WebGPU en navegador, aunque el rendimiento dependera del dispositivo.
- Opciones de despliegue: Transformers.js con WebGPU en el navegador; al ser ONNX, tambien podria ejecutarse con ONNX Runtime en otros entornos, aunque no se documenta.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| lial-apps/siman-ivrit-turbo | aprox. 809 M | ventanas de 30 s de audio | hebreo | Apache-2.0 | ONNX |
| ivrit-ai/whisper-large-v3-turbo | aprox. 809 M | ventanas de 30 s de audio | hebreo | Apache-2.0 | safetensors (formato original) |
| openai/whisper-large-v3-turbo | aprox. 809 M | ventanas de 30 s de audio | multilingue | MIT (checkpoint original) | safetensors |

La comparativa se limita a variantes del mismo modelo base; no se dispone de datos de rendimiento comparado en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta especializado exclusivamente en hebreo; no se garantiza calidad en otros idiomas.
- Al ser una conversion de formato sin reentrenamiento, hereda los sesgos y errores del modelo base `ivrit-ai/whisper-large-v3-turbo`.
- Riesgo de alucinacion en pasajes de audio con ruido, silencios largos o habla solapada, comun en modelos Whisper.
- La ejecucion en navegador depende de soporte WebGPU; en dispositivos sin esta API el rendimiento puede degradarse o no funcionar.
- El tamano del repo (2.0 GB) implica una descarga inicial considerable para el usuario final.
- No se documentan limitaciones especificas de contexto ni restricciones adicionales de licencia mas alla de Apache-2.0, que permite uso comercial con atribucion.

## Enlaces

- Hugging Face: https://huggingface.co/lial-apps/siman-ivrit-turbo
- Modelo base: https://huggingface.co/ivrit-ai/whisper-large-v3-turbo
- Modelo original de OpenAI: https://huggingface.co/openai/whisper-large-v3-turbo
- Transformers.js: https://huggingface.co/docs/transformers.js

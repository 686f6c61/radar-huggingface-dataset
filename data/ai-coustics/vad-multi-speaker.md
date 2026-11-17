# ai-coustics/vad-multi-speaker

## Resumen

VAD Multi Speaker es un modelo de deteccion de actividad de voz (VAD, por sus siglas en ingles) desarrollado por ai-coustics, disenado para determinar en tiempo real si cualquier hablante esta hablando en audio de microfono ruidoso, con multiples hablantes y captado en campo lejano. A diferencia de aproximaciones mas clasicas, el modelo esta pensado para funcionar directamente sobre la senal original, sin necesidad de un denoiser o etapa de realce previa, y puede ejecutarse en paralelo o de forma independiente a un pipeline de speech enhancement. Se posiciona como la opcion por defecto para turn-taking robusto al ruido en agentes de voz.

El modelo se distribuye a traves del paquete `aic-sdk` (disponible para Python, Rust, C/C++, Node.js y WebAssembly) y no requiere GPU ni dependencia de ONNX. La variante referenciada en la model card es `vad-ms-2.1-xxs-16khz`, lo que sugiere una version 2.1, un tamano "xxs" (extra extra small) y una frecuencia de muestreo de 16 kHz. El autor declara una latencia de 30 ms y un rendimiento superior a Silero VAD en precision, balance y fiabilidad.

La relevancia actual del modelo radica en su orientacion a produccion para Voice AI: expone parametros ajustables de sensibilidad, duracion minima de habla y retencion de habla, asi como acceso a la probabilidad cruda por bloque y al retardo de prediccion para alinear decisiones con la linea temporal del audio. Su licencia es propia (ai-coustics-model-license) y requiere una clave de SDK, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (variante identificada como "xxs") |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (procesa bloques de audio en streaming) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (VAD independiente del idioma) |
| Licencia | ai-coustics-model-license (license: other) |
| Formato de pesos | no disponible (se carga via `aic.Model.from_file` y `aic.Model.download`) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo en la informacion disponible. La model card no detalla si se trata de un transformer, una red convolucional, un modelo hibrido u otra familia, ni especifica el numero de parametros, la composicion del dataset de entrenamiento, el volumen de datos ni si se aplicaron tecnicas de RLHF o DPO (poco habituales en un modelo discriminativo de VAD).

Lo que si se documenta es el diseno funcional: el modelo opera sobre bloques de audio mono en formato float32 a 16 kHz, analiza la senal sin modificarla y expone una probabilidad de habla por bloque. Incorpora un retardo de prediccion consultable (`get_prediction_delay()`) para alinear las decisiones con la linea temporal del audio, un parametro de sensibilidad (umbral de probabilidad entre 0.0 y 1.0), una duracion minima de habla antes de disparar el evento y una duracion de retencion tras el cese del habla. El modelo esta disenado explicitamente para funcionar sin denoiser y para convivir con etapas de realce sobre el mismo bloque original.

## Capacidades

- Deteccion de actividad de voz en audio ruidoso, con multiples hablantes y en campo lejano.
- Funcionamiento sin etapa de denoising previa, sobre la senal original.
- Ejecucion en paralelo con pipelines de speech enhancement sobre el mismo bloque de audio.
- Salida de probabilidad cruda por bloque (`raw_vad_probability()`) ademas de la decision binaria de habla.
- Parametros ajustables de turn-taking: sensibilidad, duracion minima de habla y retencion de habla.
- Exposicion del retardo de prediccion en muestras para alinear decisiones con la linea temporal.
- Inferencia en tiempo real con latencia declarada de 30 ms.
- Ejecucion sin GPU y sin dependencia de ONNX.
- SDK multi-lenguaje: Python, Rust, C/C++, Node.js y WebAssembly.
- Integraciones documentadas con frameworks de agentes de voz como LiveKit y Pipecat.
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision, audio generativo ni tool calling.

## Casos de uso

- Turn-taking en agentes de voz en tiempo real: el modelo decide cuando el usuario esta hablando para cortar o pausar la respuesta del agente; su latencia de 30 ms y su robustez al ruido lo hacen adecuado para conversaciones naturales sin solapamientos.
- Atencion al cliente telefonica: deteccion de habla en audio de call center con ruido de fondo y posibles hablantes multiples, sin necesidad de un denoiser previo que anada latencia.
- Asistentes de voz en dispositivos embebidos: al no requerir GPU ni ONNX y estar disponible en C/C++, Rust y WebAssembly, puede integrarse en dispositivos con recursos limitados.
- Pipelines de speech-to-text con preprocesado: uso del VAD como segmentador para alimentar unicamente fragmentos con habla a un ASR, reduciendo coste computacional y falsos positivos; puede convivir con un modelo de realce como Quail Multi Speaker.
- Reuniones y transcripcion multihablante: deteccion de actividad de voz en audio de sala con microfonos de campo lejano, marcando tramos activos antes de la diarizacion.
- Agentes conversacionales sobre LiveKit o Pipecat: integracion directa mediante los quickstarts publicados para anadir deteccion de habla robusta a stacks de voz existentes.
- Monitorizacion de calidad de audio en produccion: uso de la probabilidad cruda y del retardo de prediccion para diagnosticar fallos en la cadena de voz, en combinacion con herramientas como Tyto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card afirma que el modelo supera a Silero VAD en precision, balance y fiabilidad, y declara una latencia de 30 ms, pero no se aportan cifras concretas de metricas como ROC-AUC, F1, tasa de falsos positivos o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el autor indica que no requiere GPU.
- GPU recomendadas: no aplica segun la documentacion; ejecucion en CPU.
- Compatibilidad con GPU de consumo: no relevante al no requerir GPU.
- Opciones de despliegue: SDK `aic-sdk` para Python, Rust, C/C++, Node.js y WebAssembly; integraciones con LiveKit y Pipecat.
- Latencia: 30 ms declarados por el autor.
- Throughput: no disponible.
- Requisito adicional: clave de SDK gratuita (prueba de 30 dias) obtenida en developers.ai-coustics.com.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| VAD Multi Speaker (ai-coustics) | VAD | no disponible ("xxs") | streaming por bloques | ai-coustics-model-license | Sin GPU ni ONNX; 30 ms de latencia; robusto a ruido y multihablante |
| Silero VAD | VAD | no disponible | streaming por bloques | MIT (segun conocimiento publico, no verificado en esta busqueda) | Referencia comparativa citada por el autor; el autor afirma mejora en precision, balance y fiabilidad |
| VAD Voice Focus (ai-coustics) | VAD | no disponible | streaming por bloques | ai-coustics-model-license | Variante del mismo autor orientada a hablante principal en agentes de voz |

No se dispone de datos numericos de rendimiento para establecer una comparativa cuantitativa con Silero VAD ni con otras alternativas.

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo; al ser un detector de habla, el riesgo de sesgo por idioma o acento no se puede evaluar con la informacion disponible.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de falsos positivos y falsos negativos en la deteccion, ajustables mediante los parametros de sensibilidad, duracion minima y retencion.
- No se especifican los idiomas soportados; al tratarse de un VAD, la deteccion de habla es en principio independiente del idioma, pero no se confirma en la documentacion.
- La licencia ai-coustics-model-license es propia y requiere revision del enlace legal antes de uso comercial; el acceso al modelo esta condicionado a una clave de SDK.
- El uso esta ligado al ecosistema `aic-sdk`; no se ofrece un formato de pesos estandar como safetensors o GGUF para inferencia fuera del SDK.
- La version referenciada en los ejemplos es `vad-ms-2.1-xxs-16khz`; conviene verificar versiones y checksums en artifacts.ai-coustics.io antes de desplegar.
- El modelo analiza audio mono float32 a 16 kHz; no se documenta soporte para otras frecuencias o canales sin remuestreo previo.
- No se publican metricas de rendimiento verificables, por lo que las afirmaciones de superioridad frente a Silero VAD deben validarse en el caso de uso concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ai-coustics/vad-multi-speaker
- Documentacion del modelo: https://docs.ai-coustics.com/models/voice-activity-detection/vad-multi-speaker
- Quickstart del SDK: https://docs.ai-coustics.com/models/get-started/sdk-quickstart
- Documentacion general: https://docs.ai-coustics.com
- Quickstart LiveKit: https://docs.ai-coustics.com/models/get-started/livekit-quickstart
- Ejemplo Pipecat: https://github.com/pipecat-ai/pipecat/blob/main/examples/voice/voice-aicoustics-vad-only.py
- Artefactos y checksums: https://artifacts.ai-coustics.io
- SDK Python en PyPI: https://pypi.org/project/aic-sdk/
- Clave de SDK gratuita: https://developers.ai-coustics.com
- Licencia del modelo: https://ai-coustics.com/legal/model-license
- Licencia comercial enterprise: https://ai-coustics.com/
- Modelo relacionado VAD Voice Focus: https://huggingface.co/ai-coustics/vad-voice-focus
- Modelo relacionado Quail Voice Focus: https://huggingface.co/ai-coustics/quail-voice-focus
- Modelo relacionado Quail Multi Speaker: https://huggingface.co/ai-coustics/quail-multi-speaker
- Modelo relacionado Rook Multi Speaker: https://huggingface.co/ai-coustics/rook-multi-speaker
- Modelo relacionado Tyto: https://huggingface.co/ai-coustics/tyto

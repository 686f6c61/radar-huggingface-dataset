# Maximilian228/Geode-STT-whisper-turbo-uk

## Resumen

Geode-STT-whisper-turbo-uk es un paquete de reconocimiento automatico del habla (ASR) derivado del fine-tune ucraniano de Whisper large-v3-turbo de OpenAI, publicado por el usuario Maximilian228 para la aplicacion Android Geode. No se trata de un modelo entrenado desde cero, sino de una conversion de los pesos de `ihnatov-yuri/whisper-large-v3-turbo-uk` al formato de sherpa-onnx, con cuantizacion int8 del encoder y el decoder, pensada para inferencia totalmente offline en dispositivo.

El modelo conserva la arquitectura transformer encoder-decoder de Whisper large-v3-turbo (aproximadamente 809 millones de parametros, con un decoder reducido a 4 capas frente a las 32 del large-v3 original) y soporta ucraniano e ingles. Su interes practico reside en el empaquetado: los ficheros ONNX permiten ejecutar ASR en moviles sin conexion, con un peso total de repositorio de 1,0 GB y un consumo de memoria medido de 1384 MB en un Redmi Note 9 Pro.

La relevancia es doble: por un lado, ofrece una via sencilla de desplegar ASR ucraniano de calidad en Android mediante sherpa-onnx; por otro, documenta metricas de error y rendimiento en hardware real, algo poco habitual en paquetes de conversion. El proyecto es de noviembre de 2026 y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo), exportado a ONNX |
| Parametros totales | no disponible (el modelo base Whisper large-v3-turbo ronda los 809 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper, no confirmada explicitamente en la ficha) |
| Tipos de cuantizacion | int8 (MatMul, QInt8) en encoder y decoder |
| Idiomas soportados | ucraniano (uk), ingles (en) |
| Licencia | MIT |
| Formato de pesos | ONNX (`turbo-encoder.int8.onnx`, `turbo-decoder.int8.onnx`, `turbo-tokens.txt`) |

## Arquitectura y entrenamiento

El modelo es una conversion, no un entrenamiento nuevo. Los pesos del fine-tune ucraniano de `ihnatov-yuri/whisper-large-v3-turbo-uk` (revision `9e9c80a41b2996c7386ce76e015f128186079655`) se remapearon al layout de openai-whisper y se exportaron con los scripts oficiales de sherpa-onnx (`scripts/whisper/export-onnx.py`, opcion `--model turbo`). La cuantizacion aplicada es int8 sobre operaciones MatMul con tipo QInt8, lo que reduce el tamano y acelera la inferencia en CPU.

La arquitectura subyacente es la de Whisper large-v3-turbo: encoder transformer con convoluciones iniciales sobre espectrogramas mel y decoder autorregresivo con atencion cruzada, entrenado originalmente por OpenAI con datos debilmente supervisados multilingues y posteriormente ajustado al ucraniano por ihnatov-yuri. La informacion disponible no detalla el volumen de datos del fine-tune, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esos datos deben consultarse en la model card del modelo base.

## Capacidades

- Transcripcion de voz a texto en ucraniano e ingles, con deteccion implicita del idioma segun el modelo Whisper subyacente.
- Inferencia totalmente offline en dispositivo, sin llamadas a servicios externos.
- Ejecucion en Android mediante sherpa-onnx (probado con la CLI v2.0.1 y 4 hilos).
- Salida de texto con puntuacion y mayusculas generadas por el decoder de Whisper (las metricas publicadas se calcularon normalizando ambos).
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento extendido; es un modelo puramente ASR.
- No se documentan capacidades de vision, audio mas alla de la transcripcion ni traduccion explicita entre idiomas.

## Casos de uso

- Dictado por voz en aplicaciones Android: el paquete sherpa-onnx permite integrar un boton de microfono que transcribe en local sin enviar audio a la nube, adecuado para apps de notas o mensajeria con requisitos de privacidad.
- Subtitulado de reuniones y clases en ucraniano: con un RTF de 2,05 en un Snapdragon 720G, un clip de 10 s se procesa en unos 20 s, suficiente para transcripcion diferida en dispositivos de gama media.
- Asistentes de voz para hablantes de ucraniano: el WER del 5,29 % en FLEURS uk permite usar el modelo como capa de reconocimiento en comandos y consultas conversacionales.
- Accesibilidad para personas con dificultades motoras: entrada por voz en local, sin dependencia de red, en entornos con conectividad limitada.
- Procesamiento por lotes en servidores modestos: al ser ONNX int8, puede ejecutarse en CPU sin GPU para transcribir archivos de audio en pipelines internos.
- Aplicaciones de campo (periodismo, ONG, trabajo humanitario) en zonas con internet intermitente: el modelo funciona completamente offline una vez descargado el paquete de 1,0 GB.
- Prototipado rapido de ASR bilingue uk/en: la licencia MIT y el formato sherpa-onnx facilitan pruebas sin infraestructura de GPU.

## Benchmarks y rendimiento

| Prueba | Idioma | Metrica | Resultado | Enunciados | Metodo |
|---|---|---|---|---|---|
| FLEURS test | uk | WER | 5,29 % | 30 | sherpa-onnx, ficheros del paquete, CPU de portatil |
| FLEURS test | en | WER | 6,9 % | 30 | sherpa-onnx, ficheros del paquete, CPU de portatil |

| Dispositivo | Carga (s) | RTF (clip de 10 s) | RSS maximo (VmHWM) |
|---|---|---|---|
| Redmi Note 9 Pro (Snapdragon 720G), sherpa-onnx v2.0.1 CLI, 4 hilos | 4,4 | 2,05 | 1384 MB |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que se trata de un modelo ASR y no de un modelo de lenguaje general.

## Requisitos de hardware

- VRAM estimada: no aplica para inferencia en CPU; en GPU no se documenta. El consumo medido en movil es de 1384 MB de RSS maximo.
- GPU recomendadas: no disponibles; el paquete esta optimizado para CPU via sherpa-onnx.
- Cabe en GPU de consumo: no confirmado; el formato ONNX int8 permite ejecucion en CPU, pero no se documenta soporte CUDA.
- Despliegue: sherpa-onnx (CLI v2.0.1 probada), integracion en apps Android mediante la libreria sherpa-onnx. No se documentan opciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo ASR ONNX.
- Latencia y throughput: RTF de 2,05 en Snapdragon 720G con 4 hilos; carga inicial de 4,4 s. No se documentan mediciones en otros dispositivos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Geode-STT-whisper-turbo-uk | no disponible (base turbo ~809 M) | no disponible (audio 30 s) | uk, en | MIT | ONNX int8 | Paquete para sherpa-onnx, offline en movil |
| ihnatov-yuri/whisper-large-v3-turbo-uk (modelo base) | no disponible (base turbo ~809 M) | no disponible | uk, en | MIT | safetensors (Hugging Face) | Fine-tune original; requiere conversion para sherpa-onnx |
| openai/whisper-large-v3-turbo | no disponible (base turbo ~809 M) | no disponible | multilingue | MIT | safetensors, ONNX | Modelo original de OpenAI; sin ajuste especifico al ucraniano |

No se dispone de datos comparativos de WER entre estos modelos en la informacion proporcionada; la comparacion se limita a parametros, licencia y formato de distribucion.

## Limitaciones y advertencias

- Las metricas de WER se calcularon sobre solo 30 enunciados de FLEURS por idioma, una muestra pequena que puede no representar el rendimiento en dominios reales (ruido, acentos, jerga tecnica).
- El modelo solo cubre ucraniano e ingles; no se documenta comportamiento en otros idiomas ni deteccion automatica de idioma.
- Al ser una conversion cuantizada a int8, puede existir una perdida de precision respecto al modelo base en safetensors, no cuantificada en la informacion disponible.
- Riesgo de alucinacion tipico de Whisper en audio con ruido, silencios largos o habla solapada; no se documentan mitigaciones especificas.
- La licencia MIT permite uso comercial, pero las atribuciones a OpenAI y a ihnatov-yuri deben conservarse segun indica la model card.
- El repositorio no registra descargas ni likes y fue creado en noviembre de 2026; no hay evidencia de mantenimiento continuo ni de comunidad de usuarios.
- No se documentan sesgos demograficos o dialectales del fine-tune ucraniano; deben evaluarse con datos propios antes de produccion.
- El consumo de 1384 MB de RSS en un movil de gama media limita su uso en dispositivos con poca memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Maximilian228/Geode-STT-whisper-turbo-uk
- Modelo base (fine-tune ucraniano): https://huggingface.co/ihnatov-yuri/whisper-large-v3-turbo-uk
- Repositorio sherpa-onnx (scripts de exportacion y runtime): no disponible en la informacion proporcionada
- Modelo original Whisper large-v3-turbo de OpenAI: no disponible en la informacion proporcionada
- Paper de Whisper: no disponible en la informacion proporcionada

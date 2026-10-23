# humoiww/PhonoCommand-ASR

## Resumen

PhonoCommand-ASR es un modelo de reconocimiento automático del habla (ASR) publicado por el usuario humoiww en HuggingFace, derivado del modelo Qwen/Qwen3-ASR-1.7B. Su particularidad no es tanto el modelo de pesos como el sistema que lo rodea: el autor distribuye un conjunto de pesos "V15" junto con una política acústica de selección ("pipeline R17") que decide, mediante evidencia de duración acústica e idioma, si usa esos pesos o el modelo original fijado. El objetivo declarado es el dictado de comandos en dominio médico con streaming de audio acumulado, reutilización conservadora de prefijos de texto y una sola generación por actualización o final.

El repositorio contiene 4,1 GB de artefactos, con pesos en safetensors y ONNX, y un total de 2.038.052.480 parámetros según los metadatos de safetensors (cifra superior a los 1.700 millones que sugiere el nombre del modelo base, lo que conviene tener en cuenta al planificar el despliegue). La licencia es Apache-2.0, los idiomas declarados son inglés, chino mandarín y cantonés (en, zh, yue), y el pipeline es automatic-speech-recognition.

Es relevante ahora por tres motivos: propone una inferencia nativa en Windows sin depender del SDK upstream de ASR ni de vLLM, incluye un cargador de referencia mínimo en PyTorch con SDPA, y documenta explícitamente sus límites de validación (pruebas solo en el host Linux de compilación, Windows pendiente de verificar). Con 0 descargas y 0 likes en el momento de la consulta, se trata de un artefacto muy reciente y sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de Qwen3-ASR-1.7B (tag `qwen3_asr`); el detalle interno del encoder/decoder no se documenta en la model card |
| Parametros totales | 2.038.052.480 (~2,04 mil millones), segun metadatos de safetensors |
| Parametros activos | No aplica: no se describe como modelo MoE en la informacion disponible |
| Longitud de contexto | No disponible. El sistema opera por streaming con ventanas delimitadas por VAD, no se declara ventana de contexto textual |
| Tipos de cuantizacion | No disponible en detalle. El repo incluye pesos safetensors y ONNX, y el campo `base_model:quantized` indica derivacion cuantizada; no se publican variantes GGUF ni niveles Q4/Q8 |
| Idiomas soportados | en (ingles), zh (chino mandarin), yue (cantonés) |
| Licencia | Apache-2.0. El helper Silero conserva su licencia MIT; SenseVoice se referencia bajo su licencia original y no se redistribuye |
| Formato de pesos | safetensors y ONNX |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna mas alla de su origen: es un derivado de Qwen3-ASR-1.7B, un modelo de reconocimiento de voz de la familia Qwen3. El autor publica unos pesos "V15" que conviven con el modelo original fijado ("pinned original model"), y una politica de seleccion (R17) que alterna entre ambos segun evidencia acustica de duracion e idioma. Esa politica, junto con el helper de deteccion de actividad de voz (Silero, licencia MIT) y un helper de idioma que solo aporta probabilidades, forma parte del sistema entregado, no de los pesos.

El pipeline usa streaming de audio acumulado, reutilizacion conservadora de prefijos de texto y exactamente una generacion por actualizacion o por final de turno. El autor indica explicitamente que no hay reescritura de palabras clave de comando ni rechazo de chat. No se publican grabaciones ni filas de entrenamiento, y la model card no aporta numero de tokens de entrenamiento, composicion del dataset ni si hubo RLHF/DPO, por lo que cualquier afirmacion sobre el proceso de entrenamiento seria especulativa. La implementacion de referencia es PyTorch nativo con SDPA y no requiere el SDK upstream completo ni vLLM.

## Capacidades

- Reconocimiento automatico del habla en streaming, con audio acumulado y emision de hipotesis parciales durante la locucion.
- Delimitacion de segmentos por VAD (Silero) y politica acustica basada en duracion del enunciado.
- Deteccion de idioma a nivel de probabilidad mediante un helper auxiliar, con soporte declarado de ingles, chino mandarin y cantonés.
- Dictado orientado a comandos en dominio medico, segun el tag `medical-command` del repositorio.
- Seleccion dinamica entre los pesos V15 y el modelo original fijado mediante el pipeline R17.
- Inferencia nativa sin dependencias del SDK upstream de ASR ni de vLLM (cargador de referencia en PyTorch/SDPA incluido en `reference_code.zip`).
- Ejecucion en Windows nativo como objetivo de despliegue (tag `native-windows`), aunque la validacion publicada es solo en Linux.
- No se documentan capacidades de vision, audio generativo, tool calling ni razonamiento multi-paso: es un modelo puramente ASR.

## Casos de uso

- Dictado de notas clinicas en consulta: el modelo transcribe voz a texto en streaming con ventanas delimitadas por VAD, lo que permite mostrar texto parcial mientras el profesional habla y cerrar el turno con una unica generacion final, reduciendo el coste por actualizacion.
- Aplicacion de escritorio sanitaria en Windows: el repositorio esta pensado para despliegue nativo en Windows sin SDK externo, de modo que puede empaquetarse dentro de una aplicacion local que no envie audio a la nube.
- Cumplimentacion de campos estructurados por voz: el enfoque de comandos medicos y la ausencia de reescritura de palabras clave permiten mapear la locucion a formularios (motivo de consulta, exploracion, plan) manteniendo el texto literal reconocido.
- Transcripcion multilingue en entornos clinicos con poblacion angloparlante, sinohablante y cantonesa: los tres idiomas declarados cubren escenarios de triaje o recepcion donde el paciente cambia de lengua dentro de la misma conversacion.
- Telemedicina y transcripcion de consultas remotas: el streaming con reutilizacion de prefijos encaja en canales de audio continuo donde se necesita texto incremental con baja latencia percibida, sin depender de vLLM.
- Evaluacion e integracion en pipelines propios: al incluir un cargador de referencia PyTorch/SDPA y exportaciones ONNX, sirve como base para prototipos de ASR sobre ONNX Runtime en hardware sin GPU de datacenter.
- Investigacion en politicas acusticas de seleccion de modelo: el par de pesos V15 mas modelo fijado, con `release_set.json` y `MANIFEST.json` para reproducibilidad, permite experimentar con conmutacion de modelos guiada por senales acusticas y de idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (ni WER, ni MMLU, ni comparaciones numericas con otros sistemas ASR).

El autor solo aporta evidencia de validacion funcional en `VALIDATION.json`: en el host Linux de compilacion se obtuvieron 16 de 16 ventanas finales de referencia en la grabacion prioritaria. Se advierte de que la medicion de tiempos parte del final detectado por VAD, no de anotaciones manuales de fin de palabra, y de que las mediciones de memoria y latencia existentes corresponden a Linux con vLLM y no permiten extrapolar el rendimiento en Windows.

## Requisitos de hardware

- VRAM estimada para inferencia en precision 16 bits: en torno a 4,1 GB solo de pesos (el repo ocupa 4,1 GB) y aproximadamente 5-6 GB contando activaciones y buffers de audio; estimacion derivada del numero de parametros, no publicada por el autor.
- VRAM estimada con pesos de 8 bits: aproximadamente 2,3-2,6 GB, si se generan esas variantes; el repositorio no publica cuantizaciones listadas.
- GPU consumer: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; en tarjetas de 8 GB es viable en 16 bits con margen ajustado o en 8 bits.
- GPU de datacenter: A100 y H100 permiten multiples sesiones concurrentes de streaming por tarjeta, aunque el autor no publica cifras de concurrencia.
- Opciones de despliegue: cargador de referencia en PyTorch con SDPA (incluido), ONNX Runtime con los artefactos ONNX del repo, y vLLM (mencionado por el autor, aunque el modelo no lo requiere). No se ofrece soporte documentado para llama.cpp ni Ollama, y no hay pesos GGUF publicados.
- Latencia y throughput: no disponibles para Windows. Las mediciones del autor en Linux con vLLM no se consideran representativas del objetivo de despliegue.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| PhonoCommand-ASR | ~2,04 B (safetensors) | No disponible; streaming por ventanas VAD | en, zh, yue | Apache-2.0 | Sistema con politica acustica, ONNX incluido, validacion solo en Linux |
| Qwen3-ASR-1.7B (base) | No disponible en la informacion (el nombre sugiere 1.7 B) | No disponible | No disponible en la informacion | No disponible en la informacion | Modelo upstream sobre el que se construye este derivado |
| Whisper large-v3 | ~1,55 B | Ventanas de 30 s | Multilingue amplio | MIT | Referencia habitual en ASR open source; no se comparan cifras de WER por falta de datos publicados aqui |

No se dispone de resultados de benchmarks de PhonoCommand-ASR que permitan una comparacion cuantitativa con alternativas; la tabla recoge solo caracteristicas estructurales y de licencia.

## Limitaciones y advertencias

- Ausencia total de validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, repositorio creado y actualizado el mismo dia.
- Windows es el objetivo declarado, pero la validacion publicada se hizo exclusivamente en el host Linux de compilacion; el rendimiento en hardware Windows esta sin probar.
- Las hipotesis parciales del streaming pueden ser incorrectas; el autor lo advierte de forma explicita.
- La medicion de latencia se calcula desde el fin detectado por VAD, no desde el fin real de la palabra, lo que puede infraestimar la latencia percibida.
- No se publican grabaciones ni filas de entrenamiento, lo que impide auditar sesgos acusticos, de acento o de dialecto; los tres idiomas declarados dejan fuera al castellano.
- Dominio medico: no hay evidencia de validacion clinica ni de evaluacion de errores en terminologia medica; no debe usarse en decisiones clinicas sin revision humana.
- Riesgo de alucinacion y de sustitucion de palabras en audio ruidoso, habitual en modelos ASR de este tamano; la ausencia de reescritura de comandos reduce el post-procesado pero traslada todo el error al texto crudo.
- La seleccion entre pesos V15 y modelo original depende de un helper de idioma que solo aporta probabilidades, por lo que la conmutacion puede ser erronea en audio ambiguo o con cambio de lengua.
- Licencia Apache-2.0 permite uso comercial de los pesos derivados, pero el helper Silero es MIT (requiere atribucion) y SenseVoice no se redistribuye: su uso queda sujeto a su licencia original.
- No hay pesos GGUF ni cuantizaciones documentadas, lo que limita el despliegue en CPU o en GPUs de gama baja.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/humoiww/PhonoCommand-ASR
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Documento de algoritmo: https://huggingface.co/humoiww/PhonoCommand-ASR/blob/main/ALGORITHM.txt
- Notas de despliegue en Windows: https://huggingface.co/humoiww/PhonoCommand-ASR/blob/main/WINDOWS_HANDOFF.txt
- Codigo de referencia (PyTorch/SDPA): https://huggingface.co/humoiww/PhonoCommand-ASR/blob/main/reference_code.zip
- Script de descarga del release: https://huggingface.co/humoiww/PhonoCommand-ASR/blob/main/sync_models.py
- Fijado de commits de componentes: https://huggingface.co/humoiww/PhonoCommand-ASR/blob/main/release_set.json
- Hashes de artefactos: https://huggingface.co/humoiww/PhonoCommand-ASR/blob/main/MANIFEST.json
- Evidencia de validacion: https://huggingface.co/humoiww/PhonoCommand-ASR/blob/main/VALIDATION.json
- Silero VAD (licencia MIT): enlace no disponible en la informacion proporcionada
- SenseVoice (referenciado, no redistribuido): enlace no disponible en la informacion proporcionada

# blueberryOS/BerryLume-E2B-v1

## Resumen
BerryLume E2B v1 es un adaptador LoRA bilingue (italiano e ingles) desarrollado por blueBerryOS para el modelo base Google Gemma 4 E2B Instruct. Su proposito es servir como capa de ajuste fino del asistente local Berry AI dentro del sistema operativo blueBerryOS, orientado a conversaciones cotidianas, respuestas fundamentadas en fuentes y salida estructurada. No es un modelo completo, sino un adaptador PEFT que debe cargarse junto con los pesos del modelo base.

El adaptador se ha entrenado con QLoRA (rank 16, dos epocas, 24 pasos de optimizador) sobre un conjunto muy reducido de 48 ejemplos redactados por el propio proyecto, equilibrados entre italiano e ingles. El resultado es un artefacto ligero (24.158.208 parametros en safetensors, repositorio de 0,1 GB) que se distribuye tanto en formato PEFT como en GGUF F16 para su uso con llama.cpp, lo que facilita el despliegue en entornos locales de bajos recursos, incluido hardware tipo Raspberry Pi segun el autor.

Su relevancia actual es acotada: no compite en capacidades generales con el modelo base, sino que demuestra un flujo de personalizacion ligero sobre Gemma 4 E2B para asistentes embebidos. La licencia Apache 2.0 y la disponibilidad de pesos GGUF verificados con SHA-256 lo hacen reproducible, aunque su alcance funcional esta estrictamente ligado al dominio del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer Google Gemma 4 E2B Instruct |
| Parametros totales | 24.158.208 (solo el adaptador; el modelo base se carga aparte) |
| Parametros activos | no disponible |
| Longitud de contexto | 4096 tokens (configuracion probada en llama-server; el maximo del base no se especifica) |
| Tipos de cuantizacion | Adaptador en F16 (GGUF) y safetensors; base QAT Q4_0 probado |
| Idiomas soportados | Italiano (it), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT), GGUF (adaptador F16 para llama.cpp) |

## Arquitectura y entrenamiento
El adaptador es un LoRA de rango 16 entrenado con QLoRA sobre Google Gemma 4 E2B Instruct (revision `4adf15748de9e1a0097b6274cee9c15836c41c37`). El modelo base es un transformer de Google; la informacion disponible no detalla su arquitectura interna ni el numero de parametros del base. El adaptador se aplica sobre el modelo y se distribuye en dos formatos: `adapter_model.safetensors` con `adapter_config.json` para PEFT, y `berrylume-e2b-v1-lora-f16.gguf` para llama.cpp.

El entrenamiento se realizo en una Tesla T4 con 48 ejemplos redactados por el proyecto, equilibrados entre italiano e ingles, durante dos epocas y 24 pasos de optimizador. En los 16 ejemplos de validacion, la perdida de evaluacion paso de 4,245 a 0,730, una metrica de prediccion de siguiente token sobre un conjunto especifico del proyecto y de tamano muy reducido, no un indicador de calidad general. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal u otras).

## Capacidades
- Generacion de texto conversacional bilingue en italiano e ingles.
- Respuestas fundamentadas en fuentes: el autor indica pruebas con preguntas que solicitan citar pasajes de origen.
- Salida estructurada, orientada a integracion con el asistente Berry AI.
- Ejecucion local en CPU mediante llama.cpp con el adaptador cargado a intensidad 0,5.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el despliegue probado usa `--no-agent` y `--reasoning off`.
- Capacidades de vision o audio: no disponible.
- Capacidades multilingues adicionales fuera de it/en: no disponible.

## Casos de uso
- Asistente local en blueBerryOS: el adaptador se carga sobre Gemma 4 E2B QAT Q4_0 en llama-server con contexto de 4096 tokens, lo que permite un asistente de escritorio que funciona sin conexion y con requisitos de hardware minimos.
- Respuestas con citas de fuentes: el ajuste se ha orientado y probado con preguntas que exigen citar pasajes, adecuado para resumenes de documentacion local donde se requiere trazabilidad del origen.
- Salida estructurada para integracion: el modelo se disena para devolver respuestas en formatos parseables por Berry AI, util en flujos donde el asistente debe rellenar campos o invocar acciones del sistema.
- Despliegue en dispositivos de bajos recursos: el autor reporta una prueba de humo en Raspberry Pi; el uso de GGUF Q4_0 con `--n-gpu-layers 0` permite ejecucion en CPU sin GPU dedicada.
- Prototipado de adaptadores LoRA sobre Gemma: el repositorio incluye `training.json`, `adapter_config.json` y sumas SHA-256, lo que sirve como referencia reproducible para experimentos de ajuste fino con QLoRA en una sola T4.
- Asistencia bilingue italiano-ingles en entornos embebidos: el balance de ejemplos entre ambos idiomas lo hace adecuado para interfaces de usuario que alternan entre las dos lenguas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo es la perdida de evaluacion del adaptador sobre 16 ejemplos de validacion del propio proyecto (de 4,245 a 0,730), que no es comparable con MMLU, HumanEval, GSM8K ni otras pruebas estandar.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explicita; el adaptador en F16 ocupa una fraccion minima y el modelo base QAT Q4_0 probado se ejecuta en CPU con `--n-gpu-layers 0`.
- GPU recomendadas: el entrenamiento se realizo en una Tesla T4; no se documentan recomendaciones de GPU para inferencia.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; el flujo probado es CPU (x86-64) y una prueba de humo en Raspberry Pi sin resultados cuantitativos.
- Opciones de despliegue: llama.cpp (build 12244 probado) mediante `llama-server` con `--lora-scaled`; PEFT con safetensors para cargar sobre el base en frameworks compatibles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos comparables; el unico punto de referencia es el propio modelo base Google Gemma 4 E2B Instruct, sobre el que este adaptador anade ajuste bilingue y salida estructurada sin cambiar el tamano del modelo subyacente.

## Limitaciones y advertencias
- Entrenado con solo 48 ejemplos: la cobertura es muy limitada y el ajuste esta sesgado al dominio y estilo del proyecto blueBerryOS.
- A intensidad 1,0 el autor observo repeticiones y afirmaciones falsas sobre el envio de borradores; se recomienda usar intensidad 0,5 con el base QAT probado.
- Riesgo de alucinacion: el propio autor documenta falsos positivos sobre acciones realizadas, relevante en produccion.
- Contexto probado de 4096 tokens; no se documenta el maximo del modelo base ni el comportamiento mas alla de esa ventana.
- Solo italiano e ingles; no hay soporte documentado de otros idiomas.
- Requiere descargar por separado el modelo base de Google y verificar su SHA-256; el adaptador por si solo no es funcional.
- Las acciones en otras aplicaciones las gestiona Berry AI, no el adaptador, lo que limita su uso como agente autonomo.
- Licencia Apache 2.0 en los pesos originales y en este release; no se documentan restricciones adicionales para uso comercial, pero la calidad del ajuste no esta validada fuera del conjunto del proyecto.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/blueberryOS/BerryLume-E2B-v1
- Modelo base de entrenamiento: https://huggingface.co/google/gemma-4-E2B-it
- Base GGUF QAT Q4_0 verificada: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-gguf

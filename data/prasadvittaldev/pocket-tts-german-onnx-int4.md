# prasadvittaldev/pocket-tts-german-onnx-int4

## Resumen

Pocket TTS German es un modelo de síntesis de voz (text-to-speech) en alemán, derivado del modelo abierto Pocket TTS de Kyutai, cuantizado a precisión int4 y empaquetado en formato ONNX para ejecutarse íntegramente en el navegador, sin servidor, GPU ni clave de API. El paquete completo ocupa 106 MB y permite generar audio a 24 kHz mediante un modelo de lenguaje de 6 capas con flow matching (89,4 millones de parámetros en el modelo base) combinado con el codec neural Mimi.

La relevancia de este modelo radica en su capacidad para funcionar en dispositivos de bajos recursos y en entornos web, democratizando el acceso a TTS de calidad en alemán sin infraestructura externa. El autor, Prasad Vittaldev, ha resuelto problemas prácticos de despliegue: cuantización int4 en un único archivo `.onnx` (compatible con ONNX Runtime Web), text conditioner en float32 para preservar la pronunciación, y estados de voz precomputados que evitan cargar el codificador Mimi en el navegador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje de 6 capas con flow matching (89,4 M de parámetros) sobre codec Mimi a 24 kHz |
| Parametros totales | 89,4 M (modelo base); cuantizado int4 en el LM principal |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no procesa texto largo como LLM) |
| Tipos de cuantizacion | int4 (MatMulNBits, block 128, simétrico) en el LM principal; int8 dinámico en flow head y codecs Mimi; float32 en text conditioner |
| Idiomas soportados | Aleman (de) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (archivos `.onnx` individuales, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo base es Pocket TTS de Kyutai, un sistema de síntesis de voz que combina un modelo de lenguaje de 6 capas con flow matching (89,4 millones de parámetros) y el codec neural Mimi a 24 kHz. El modelo de lenguaje genera representaciones latentes del habla, que luego son decodificadas por Mimi para producir audio. Este enfoque permite una alta calidad con un número reducido de parámetros, adecuado para ejecución en CPU.

En esta versión, el autor ha realizado las siguientes adaptaciones técnicas: el LM principal se ha cuantizado a int4 con MatMulNBits (block 128, simétrico), reduciendo su tamaño de 302,7 MB a 40,8 MB. El flow head y los codecs Mimi se cuantizaron a int8 dinámico. El text conditioner se mantiene en float32 porque consiste casi enteramente en lookups de embeddings, donde la cuantización apenas ahorra espacio y puede degradar la pronunciación. Además, se incluyen estados de voz precomputados (KV-cache) que eliminan la necesidad de cargar el codificador Mimi en el navegador, con la advertencia de que el parámetro `step` por capa debe coincidir con la longitud de la caché para evitar silencios.

No se dispone de información detallada sobre los datos de entrenamiento del modelo base ni sobre el proceso de ajuste supervisado (RLHF/DPO). La licencia CC-BY-4.0 del modelo original se mantiene en esta derivada.

## Capacidades

- Sintesis de voz en aleman a 24 kHz con calidad natural, basada en el modelo Pocket TTS de Kyutai.
- Ejecucion completamente local en navegador mediante ONNX Runtime Web, sin necesidad de GPU ni servidor.
- Cuatro voces predefinidas (charles, azelma, alba, vera) con frecuencias fundamentales medidas entre 92 Hz y 161 Hz, cada una con audios de muestra disponibles en el repositorio.
- Soporte para clonacion de nuevas voces mediante el codificador Mimi (incluido en el paquete como `mimi_encoder_int8.onnx`).
- No incluye capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de texto largo; es un modelo exclusivamente de audio.

## Casos de uso

- Audiolibros y contenido narrado: el modelo puede generar narración en alemán de forma local en aplicaciones web, permitiendo a editoriales o creadores independientes producir audiolibros sin depender de servicios cloud de pago.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla o extensiones de navegador que convierten texto de páginas web en audio, funcionando sin conexión y con privacidad total.
- Asistentes de voz en dispositivos embebidos: al caber en 106 MB y ejecutarse en CPU, es viable para Raspberry Pi, routers o dispositivos IoT que necesiten respuesta hablada en alemán sin conexión a internet.
- Educacion de idiomas: aplicaciones de aprendizaje de alemán que generan pronunciación de palabras y frases de forma instantánea, con la ventaja de que el usuario puede clonar su propia voz para comparar.
- Demos interactivas y prototipos: desarrolladores pueden integrar TTS en alemán en páginas web de demostración o en herramientas de diseño de UX sin necesidad de gestionar servidores de síntesis.
- Contenido multimedia accesible: generación de subtítulos hablados o descripciones de audio para vídeos y presentaciones, aprovechando la ejecución local para evitar costes de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas objetivas de calidad de voz (MOS, SIM, etc.) ni comparaciones con otros modelos TTS. Se recomienda evaluar el modelo mediante las muestras de audio incluidas en el repositorio para valorar su calidad subjetiva.

## Requisitos de hardware

- Inferencia en CPU: el modelo está diseñado para ejecutarse en CPU, tanto en navegador como en Python con ONNX Runtime. No requiere GPU.
- Memoria: el paquete completo pesa 106 MB; la VRAM no es aplicable al no usar GPU. El uso de RAM dependerá del runtime, pero es adecuado para dispositivos con menos de 1 GB de memoria libre.
- GPU recomendadas: ninguna; el modelo funciona sin aceleración gráfica.
- Compatibilidad con dispositivos de consumo: cualquier ordenador portátil, tablet o smartphone con navegador moderno (WebAssembly) puede ejecutarlo. También funciona en SBCs como Raspberry Pi 4 o superior.
- Opciones de despliegue: ONNX Runtime Web (navegador), ONNX Runtime Python (pip install onnxruntime), o mediante el runtime de referencia de KevinAHM/pocket-tts-onnx-export. Existe una demo pública en https://prasadtts.vercel.app.
- Latencia y throughput: no se proporcionan datos medidos. Al ser un modelo de 89,4 M de parámetros cuantizado a int4, se espera una latencia de unos pocos segundos para frases cortas en CPU moderna, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados con otros modelos TTS ligeros. Como referencia cualitativa, el modelo se puede contrastar con:

| Modelo | Parametros | Idioma | Formato | Licencia | Ejecucion local |
|---|---|---|---|---|---|
| Pocket TTS (Kyutai) | 89,4 M | multi (versiones por idioma) | PyTorch | CC-BY-4.0 | Requiere GPU o CPU, sin optimizacion web |
| Pocket TTS German int4 (este) | 89,4 M (cuantizado) | Aleman | ONNX | CC-BY-4.0 | Navegador y CPU, 106 MB |
| Piper TTS | ~20-100 M segun modelo | multi (incluye aleman) | ONNX | MIT (modelos) | CPU, pero requiere instalacion local |

La ventaja principal de este modelo frente a alternativas como Piper es su empaquetado específico para navegador con cuantización int4 y estados de voz precomputados, que eliminan barreras de integración. Sin embargo, carece de benchmarks objetivos que permitan una comparación cuantitativa de calidad de voz.

## Limitaciones y advertencias

- Solo soporta aleman; no hay versiones para otros idiomas en este repositorio.
- Las voces disponibles son solo cuatro, todas con frecuencias masculinas o femeninas específicas; la clonación de voz requiere ejecutar el codificador Mimi, que no está optimizado para el navegador (aunque se incluye el archivo int8).
- La cuantización int4 puede degradar ligeramente la calidad del audio en comparación con el modelo original en float32, especialmente en sonidos sibilantes o entonación compleja. Se recomienda escuchar las muestras antes de usarlo en producción.
- El text conditioner se mantiene en float32 por riesgo de degradar la pronunciación; cualquier intento de cuantizarlo a int8 puede producir errores de articulación.
- La licencia CC-BY-4.0 permite uso comercial, pero exige atribución al autor original (Kyutai) y a esta derivada. No se puede aplicar restricciones adicionales.
- El modelo no maneja contexto de texto largo; cada síntesis es independiente y no hay soporte para diálogos multi-turno con memoria.
- No se proporcionan garantías sobre el rendimiento en navegadores antiguos; se requiere soporte de WebAssembly y ONNX Runtime Web.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/prasadvittaldev/pocket-tts-german-onnx-int4
- Modelo base (Kyutai): https://huggingface.co/kyutai/pocket-tts
- Demo en navegador: https://prasadtts.vercel.app
- Proyecto de exportacion ONNX (MIT): https://github.com/KevinAHM/pocket-tts-onnx-export
- Perfil de LinkedIn del autor: https://in.linkedin.com/in/prasadvittaldev

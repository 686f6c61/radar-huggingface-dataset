# dev-amarnadh-gandham/Kokoro-82M-v1.0-ONNX-webgpu

## Resumen

Kokoro-82M-v1.0-ONNX-webgpu es una exportacion ONNX del modelo de sintesis de voz Kokoro-82M v1.0, publicada por el usuario dev-amarnadh-gandham a partir del artefacto onnx-community/Kokoro-82M-v1.0-ONNX. No se trata de un modelo reentrenado ni afinado: es el mismo grafo fp32 con una unica reescritura orientada a corregir un fallo del backend WebGPU de onnxruntime-web. El modelo resuelve un problema muy concreto de despliegue: la capa de upsampling del vocoder (`generator/ups.1`, kernel 12, stride 6) basada en `ConvTranspose` devuelve valores incorrectos en WebGPU, lo que produce audio ininteligible pese a mantener la duracion correcta.

Con 82 millones de parametros y un repositorio de 0,3 GB, el modelo esta pensado para inferencia en el navegador mediante transformers.js y kokoro-js, con ejecucion en WebGPU o en CPU via WASM. Su relevancia actual es practica: permite TTS local en cliente sin backend, sin coste por peticion y sin enviar texto a un servidor, algo interesante para aplicaciones de accesibilidad, lectura asistida y asistentes embebidos en web.

La licencia es Apache 2.0 y el pipeline declarado es text-to-speech. El modelo tiene un volumen de adopcion muy bajo en el momento de la ficha (13 descargas, 0 likes) y no publica informacion sobre idiomas soportados, por lo que debe tratarse como un artefacto tecnico verificado en un unico entorno de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS basada en StyleTTS 2 (tag `style_text_to_speech_2`), con vocoder de upsampling mediante `ConvTranspose`, exportada a ONNX |
| Parametros totales | 82 M (segun la denominacion del modelo) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 en este repositorio; el modelo base incluye fp16 y q4f16, que en WebGPU producen NaN |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`onnx/model.onnx`, fp32); consumo via transformers.js / kokoro-js |
| Tamano del repositorio | 0,3 GB |
| Modelo base | onnx-community/Kokoro-82M-v1.0-ONNX |
| Libreria declarada | transformers.js |

## Arquitectura y entrenamiento

El modelo es un sistema de text-to-speech de tipo StyleTTS 2 con un vocoder neuronal que reconstruye la forma de onda. La unica modificacion respecto al artefacto base es estructural, no de pesos: cada `ConvTranspose` del vocoder se sustituye por un upsampling de insercion de ceros seguido de una convolucion ordinaria con el kernel invertido y traspuesto. Esta equivalencia matematica hace que la salida coincida con la original cuando se ejecuta en CPU, con similitud coseno de 1,0 y una diferencia maxima de 1,5e-6.

No hay informacion disponible sobre el entrenamiento del modelo original (numero de tokens, composicion del dataset, uso de RLHF o DPO) ni sobre el proceso de exportacion a ONNX. La innovacion documentada es exclusivamente el parche de compatibilidad: el fallo se midio en GPU AMD RDNA-3 con onnxruntime-web 1.22 y 1.30, a traves de transformers.js 3.7.5, 3.8.1 y 4.3.0, y la correccion se aplica con el script `fix_kokoro_webgpu.py` incluido en el repositorio.

## Capacidades

- Sintesis de voz a partir de texto (text-to-speech) en formato ONNX, ejecutable en navegador.
- Inferencia en WebGPU y en CPU mediante WASM a traves de onnxruntime-web.
- Integracion directa con kokoro-js y transformers.js, con carga del modelo mediante `KokoroTTS.from_pretrained`.
- Salida de audio verificada: peak en torno a 0,555 y RMS de 0,068 en WebGPU con el parche, valores equivalentes al resultado en WASM.
- Uso de voces del modelo base: kokoro-js carga los ficheros de voz desde onnx-community/Kokoro-82M-v1.0-ONNX, por lo que este repositorio no incluye voces propias.
- No se documenta soporte de tool calling, agentes, vision, audio de entrada ni modo de razonamiento; son capacidades ajenas al proposito del modelo.
- Cobertura multilingue: no disponible.

## Casos de uso

- Lectura por voz en aplicaciones web: el modelo se ejecuta integramente en el navegador, de modo que una web puede leer articulos o documentacion sin contratar un servicio de TTS ni enviar el texto a un servidor.
- Accesibilidad para personas con discapacidad visual: al funcionar sobre WebGPU o WASM sin backend, se puede incorporar sintesis de voz a lectores de pantalla o extensiones de navegador sin depender de APIs externas ni de conexion permanente.
- Asistentes conversacionales embebidos: combinado con un LLM que corra en cliente o en servidor, permite construir interfaces de voz con kokoro-js, generando la respuesta hablada en el propio dispositivo del usuario.
- Generacion de locuciones para prototipos y demos: el peso de 0,3 GB y la ausencia de cuotas de API lo hacen adecuado para producir voice-over de prueba en entornos de desarrollo y validacion de producto.
- Notificaciones y avisos hablados en tiempo real: aplicaciones de monitorizacion, domotica o herramientas internas pueden anunciar eventos en voz alta sin salir del navegador.
- Apoyo al aprendizaje de idiomas: reproduccion de frases y vocabulario con sintesis local, util en aplicaciones educativas que necesitan generar audio bajo demanda sin coste marginal.
- Preprocesado de audio para pipelines de evaluacion: el propio autor emplea transcripcion con Moonshine para medir el WER de la salida, un patron reutilizable para validar la calidad del audio generado de forma automatizada.
- Distribucion de contenido offline: al no requerir red tras la descarga del modelo, encaja en escenarios con conectividad limitada o requisitos de privacidad estrictos.

## Benchmarks y rendimiento

| Configuracion | Peak (amplitud maxima) | RMS | WER de transcripcion (Moonshine) |
|---|---|---|---|
| Original, WASM | 0,559 | 0,069 | 0,11 |
| Original, WebGPU | 309.315 | 767 | 1,0 (salida vacia) |
| Parcheada, WebGPU | 0,555 | 0,068 | 0,11 (texto identico) |

En CPU, la salida del modelo parcheado es equivalente a la del original: similitud coseno 1,0 y diferencia maxima de 1,5e-6. No se han publicado resultados de benchmarks de calidad de voz (MOS, similitud de hablante) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no hay cifras oficiales publicadas. Como referencia aritmetica, 82 M de parametros en fp32 ocupan aproximadamente 328 MB de pesos, a lo que hay que sumar las activaciones del vocoder durante la generacion.
- GPU probadas: AMD RDNA-3 con onnxruntime-web 1.22 y 1.30, via transformers.js 3.7.5, 3.8.1 y 4.3.0. No hay verificacion documentada en GPU NVIDIA, Apple Silicon o Intel.
- Cabe en GPU de consumo: si, cualquier GPU con soporte WebGPU puede ejecutarlo; tambien funciona en CPU mediante WASM, que es la ruta verificada como correcta sin parche.
- Memoria necesaria en el cliente: la inferencia WebGPU consume memoria grafica del dispositivo del usuario; en WASM, memoria del proceso del navegador. El repositorio ocupa 0,3 GB en disco.
- Opciones de despliegue: transformers.js, kokoro-js y onnxruntime-web (backend WebGPU o WASM). vLLM, Ollama o TGI no aplican, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. El unico dato relacionado es que el parche mantiene la longitud y duracion del audio original.
- Restriccion de precision: fp16 y q4f16 no estan corregidos por este parche y siguen produciendo NaN en WebGPU; solo fp32 es funcional en ese backend.

## Comparativa con modelos similares

| Aspecto | Este repositorio | onnx-community/Kokoro-82M-v1.0-ONNX (base) |
|---|---|---|
| Parametros | 82 M | 82 M |
| Formato de pesos | ONNX fp32 | ONNX, con variantes fp32, fp16 y q4f16 |
| Comportamiento en WebGPU (fp32) | Corregido mediante reescritura del grafo | `ConvTranspose` de `generator/ups.1` devuelve valores incorrectos |
| Comportamiento en WASM/CPU | Identico al base (similitud coseno 1,0) | Correcto |
| Soporte de fp16 / q4f16 en WebGPU | No corregido (NaN) | No corregido (NaN) |
| Voces | Se cargan desde el modelo base | Incluye los ficheros de voz |
| Licencia | Apache 2.0 | no disponible en la informacion proporcionada |
| Tamano del repositorio | 0,3 GB | no disponible |

No se dispone de datos en la informacion proporcionada para comparar con otros modelos TTS de la misma categoria (por ejemplo, alternativas de tamano similar o de otros autores): no disponible.

## Limitaciones y advertencias

- El parche corrige unicamente el fallo de `ConvTranspose` en WebGPU para fp32. Las variantes fp16 y q4f16 siguen generando NaN en ese backend, un problema distinto y sin resolver.
- La correccion es un workaround sobre el grafo ONNX, no una solucion en onnxruntime-web; versiones futuras de la libreria o del backend podrian cambiar el comportamiento.
- Solo se ha verificado en GPU AMD RDNA-3 con onnxruntime-web 1.22 y 1.30 y transformers.js 3.7.5, 3.8.1 y 4.3.0. Otros entornos no estan validados en la informacion disponible.
- El repositorio no incluye archivos de voz: kokoro-js los carga desde onnx-community/Kokoro-82M-v1.0-ONNX, de modo que el modelo depende de un segundo repositorio en tiempo de ejecucion.
- Adopcion muy baja (13 descargas, 0 likes) y fecha de publicacion reciente; se trata de un artefacto poco contrastado por la comunidad, sin mantenimiento demostrado.
- El identificador usado en el ejemplo de la model card (`DevAmarnadh/Kokoro-82M-v1.0-ONNX-webgpu`) no coincide literalmente con el identificador del repositorio (`dev-amarnadh-gandham/Kokoro-82M-v1.0-ONNX-webgpu`); conviene verificar cual resuelve correctamente al cargar el modelo.
- Idiomas soportados no declarados: no se puede asumir cobertura multilingue ni un comportamiento correcto con textos en castellano sin una prueba previa.
- Riesgo de artefactos de audio: aunque el WER de transcripcion y las metricas de amplitud coinciden con la version WASM, no se han publicado evaluaciones perceptivas (MOS) ni pruebas con textos largos o caracteres fuera del alfabeto latino.
- Licencia Apache 2.0, permisiva para uso comercial, pero el modelo base del que deriva y los ficheros de voz asociados deben revisarse por separado antes de un despliegue en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dev-amarnadh-gandham/Kokoro-82M-v1.0-ONNX-webgpu
- Modelo base: https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX
- Script de parche citado en la model card: `fix_kokoro_webgpu.py` (incluido en el repositorio del modelo)
- No se han encontrado enlaces adicionales relevantes en la busqueda web: los resultados devueltos no guardan relacion con este modelo ni con sintesis de voz.

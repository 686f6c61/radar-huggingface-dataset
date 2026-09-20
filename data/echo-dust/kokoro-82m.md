# echo-dust/kokoro-82m

## Resumen

`echo-dust/kokoro-82m` es un espejo (mirror) fijado a un commit concreto de [`onnx-community/Kokoro-82M-v1.0-ONNX`](https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX), el export a ONNX del modelo de síntesis de voz Kokoro-82M (82 millones de parámetros, arquitectura StyleTTS 2, licencia Apache-2.0). No es un modelo nuevo ni un reentrenamiento: es una copia con **un único fichero modificado**, pensada para que la aplicación que la consume («Reader PWA») controle el versionado y fije una revisión inmutable.

El cambio afecta a `onnx/model.onnx` (fp32). El backend WebGPU de `onnxruntime-web` calcula mal las capas `ConvTranspose` del vocodificador (`/decoder/decoder/generator/ups.0` y `ups.1`): la salida tiene la longitud correcta pero es ruido, con picos de ~3e5–4e7 en lugar de ~0,6 (medido en AMD RDNA-3 con onnxruntime-web 1.22 y 1.30). El parche reescribe cada nodo `ConvTranspose` como un sobremuestreo por inserción de ceros seguido de una `Conv` ordinaria, matemáticamente equivalente, que WebGPU sí calcula bien.

Su relevancia es práctica y acotada: permite ejecutar TTS de 82 M de parámetros íntegramente en el navegador con aceleración WebGPU, sin servidor, y con una salida en CPU idéntica a la original (similitud coseno 1.0, diferencia máxima 1,5e-6). El repositorio tiene 0 descargas y 0 «likes» en el momento de la consulta, y el tamaño total es de 0,6 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | StyleTTS 2 (etiqueta `style_text_to_speech_2`); modelo de texto a voz no autorregresivo con decodificador/vocodificador que incluye capas de sobremuestreo `ConvTranspose` |
| Parámetros totales | 82 millones (según la denominación Kokoro-82M); la model card no lo detalla explícitamente |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible / no aplica (la entrada es texto o fonemas, no una secuencia de contexto conversacional) |
| Tipos de cuantización | fp32 (`onnx/model.onnx`), uint8 (`onnx/model_uint8.onnx`) y q8 (`onnx/model_quantized.onnx`) |
| Idiomas soportados | no disponible (el campo de idiomas de HuggingFace está vacío y la model card no los enumera) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (fp32, uint8, q8) + voces en `voices/*.bin`; configuración en `config.json`, `tokenizer.json`, `tokenizer_config.json` |
| Tarea declarada (pipeline) | text-to-speech |
| Librería declarada | transformers.js |
| Tamaño del repositorio | 0,6 GB |
| Modelo base | `onnx-community/Kokoro-82M-v1.0-ONNX` |
| Fecha de creación / actualización | 2026-09-20 / 2026-09-20 |

## Arquitectura y entrenamiento

La arquitectura corresponde a Kokoro-82M, un modelo StyleTTS 2 de 82 millones de parámetros para síntesis de voz. Según la información disponible, el grafo ONNX incluye un decodificador/vocodificador (`/decoder/decoder/generator/`) con capas de sobremuestreo `ConvTranspose` en las posiciones `ups.0` y `ups.1`. No se dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni el proceso de destilación o alineación del modelo original en la información proporcionada.

La innovación técnica documentada en este repositorio no está en el entrenamiento, sino en la exportación: el fichero fp32 se ha parcheado para esquivar un error de cómputo del backend WebGPU de `onnxruntime-web` en `ConvTranspose`. La reescritura sustituye cada nodo `ConvTranspose` por un sobremuestreo con inserción de ceros seguido de una convolución estándar, matemáticamente idéntica. El script procede de [`DevAmarnadh/Kokoro-82M-v1.0-ONNX-webgpu`](https://huggingface.co/DevAmarnadh/Kokoro-82M-v1.0-ONNX-webgpu) (`fix_kokoro_webgpu.py`) y el fichero de este repositorio se reconstruyó de forma independiente desde el `onnx/model.onnx` oficial, resultando byte a byte idéntico al del autor del parche. La reconstrucción se hizo el 2026-09-20 con onnx 1.23.0 / numpy 2.4.6 (Python 3.11).

Hashes declarados:

| Fichero | SHA-256 |
|---|---|
| `fix_kokoro_webgpu.py` | `aa24cf0c66b5afc08049b22fd627b8ca7557223cca027fd7b7f035835b8d0dbb` |
| `onnx/model.onnx` (oficial) | `8fbea51ea711f2af382e88c833d9e288c6dc82ce5e98421ea61c058ce21a34cb` |
| `onnx/model.onnx` (este repositorio) | `4c1aaa3cebf93f6cef797a36e978907305a3361288ba1c471400bddc0e0e2709` |

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto, con voces predefinidas almacenadas en `voices/*.bin`.
- Inferencia en navegador mediante transformers.js, con dos rutas de ejecución: WebGPU (fichero fp32 parcheado) y CPU (ficheros uint8 y q8 oficiales).
- Ejecución sin conexión una vez descargados los pesos, ya que todo el cómputo ocurre en el cliente.
- Dos perfiles de calidad/velocidad en CPU: `model_uint8.onnx` etiquetado como «Faster» y `model_quantized.onnx` etiquetado como «Higher fidelity» (q8).
- El parche corrige el cálculo de `ConvTranspose` en WebGPU, lo que habilita la ruta acelerada por GPU en navegador sin degradar el resultado en CPU.
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio de entrada, ni modo «thinking»; se trata de un modelo especializado exclusivamente en TTS.
- Cobertura de idiomas: no disponible.

## Casos de uso

- Lectura en voz alta dentro de una PWA: es el escenario para el que se creó este espejo; la aplicación fija un commit concreto y carga `onnx/model.onnx` con WebGPU para narrar texto sin depender de un servicio externo.
- Accesibilidad web para personas con discapacidad visual: el modelo puede integrarse en un lector de pantalla en navegador y sintetizar el contenido de la página localmente, sin enviar el texto a terceros.
- Audiolibros y narración de documentos largos: al ejecutarse en el cliente y no depender de cuotas de API, permite trocear capítulos y sintetizar por bloques con coste marginal cero por carácter.
- Procesamiento de texto sensible con requisitos de privacidad: al no salir los datos del dispositivo, encaja en entornos sanitarios, legales o corporativos donde el texto no puede enviarse a la nube.
- Prototipado de asistentes de voz: el modelo sirve como capa de salida de un asistente conversacional en una demo web, combinado con un LLM externo que genere la respuesta y este modelo que la vocalice.
- Quioscos y terminales de información: despliegue estático en navegador sobre hardware modesto, con la ruta uint8 en CPU cuando no hay GPU disponible.
- Pruebas de regresión en CI de aplicaciones de audio: el hash fijado del repositorio permite comparar salidas entre versiones y detectar cambios de calidad con una referencia estable.
- Contenido educativo interactivo: lectura de ejercicios, enunciados o material didáctico generado dinámicamente en el navegador del alumno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos medidos que aparecen en la model card son de verificación del parche, no de calidad del modelo:

| Medición | Valor |
|---|---|
| Picos de salida con `ConvTranspose` roto en WebGPU | ~3e5–4e7 |
| Picos de salida esperados | ~0,6 |
| Hardware de la medición | AMD RDNA-3 |
| Versiones de onnxruntime-web afectadas | 1.22 y 1.30 |
| Similitud coseno del parche frente a CPU original | 1.0 |
| Diferencia máxima frente a CPU original | 1,5e-6 |

## Requisitos de hardware

- VRAM estimada para los pesos en fp32: en torno a 0,33 GB (82 M de parámetros × 4 bytes), más las activaciones del decodificador; estimación derivada del número de parámetros, no publicada por el autor.
- VRAM estimada en uint8/q8: en torno a 0,08–0,1 GB para los pesos, más activaciones.
- Tamaño total del repositorio descargable: 0,6 GB (incluye las tres variantes ONNX y las voces).
- Cabe en cualquier GPU de consumo con soporte WebGPU; el autor ha verificado funcionamiento en AMD RDNA-3. También funciona en CPU (variantes uint8 y q8).
- GPU profesionales como A100, H100 o RTX 4090 no son necesarias para este tamaño de modelo; el cuello de botella habitual es el ancho de banda y la latencia del navegador, no la memoria.
- Opciones de despliegue: transformers.js en navegador (WebGPU o WASM), onnxruntime-web, y runtimes ONNX nativos en Python/C++/C# para uso en servidor o escritorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Parche WebGPU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `echo-dust/kokoro-82m` (este repositorio) | 82 M | ONNX fp32, uint8, q8 | Sí (solo en fp32) | Apache-2.0 | 0 descargas, 0 likes; commit fijado por la app consumidora |
| `onnx-community/Kokoro-82M-v1.0-ONNX` | 82 M | ONNX fp32, uint8, q8 | No | Apache-2.0 | Repositorio de referencia del export ONNX; es el modelo base |
| `DevAmarnadh/Kokoro-82M-v1.0-ONNX-webgpu` | 82 M | ONNX fp32 parcheado | Sí | Apache-2.0 | Origen del script `fix_kokoro_webgpu.py`; fichero idéntico byte a byte al de este repositorio |
| `hexgrad/Kokoro-82M` | 82 M | Pesos originales (no ONNX) | No aplica | Apache-2.0 | Modelo original upstream |

No se dispone de datos de rendimiento comparado entre estas variantes más allá de la equivalencia numérica del parche en CPU (similitud coseno 1.0, diferencia máxima 1,5e-6).

## Limitaciones y advertencias

- No es un modelo original: es un espejo de un export ONNX de terceros, con un único fichero modificado. Cualquier mejora o corrección debe venir del upstream.
- El repositorio está pensado para fijarse a un commit concreto; el autor advierte de que nada debería moverse bajo esa referencia. Consumirlo con una revisión flotante rompe la intención del diseño.
- El parche se validó en AMD RDNA-3 con onnxruntime-web 1.22 y 1.30. El comportamiento en otros backends (CUDA, DirectML, Metal) y en otras versiones no está documentado.
- Solo se ha parcheado la variante fp32; si el backend WebGPU se usa con las variantes cuantizadas, se mantiene el comportamiento original, presumiblemente afectado por el mismo error de `ConvTranspose` (no confirmado en la información disponible).
- Riesgo de alucinación y sesgos: no aplica en el sentido habitual de un LLM, pero un modelo TTS puede producir pronunciaciones incorrectas, prosodia inadecuada o artefactos acústicos según el texto de entrada; no hay evaluación publicada al respecto.
- Idiomas soportados: no disponibles. No se debe asumir cobertura multilingüe sin verificarla contra la documentación del modelo original.
- Licencia Apache-2.0, que permite uso comercial, pero conviene conservar los avisos de atribución de los proyectos upstream (hexgrad, onnx-community y el autor del script del parche).
- Métricas de adopción nulas en el momento de la consulta (0 descargas, 0 likes), lo que implica ausencia de validación comunitaria sobre este espejo concreto.
- El repositorio no incluye código de entrenamiento, dataset ni pipeline de exportación; solo artefactos de inferencia.
- En despliegues en navegador, el consumo de memoria y el tiempo de carga inicial (hasta 0,6 GB de artefactos) pueden ser limitantes en dispositivos móviles o conexiones lentas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/echo-dust/kokoro-82m
- Modelo base (export ONNX): https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX
- Modelo original Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Repositorio del parche WebGPU y script `fix_kokoro_webgpu.py`: https://huggingface.co/DevAmarnadh/Kokoro-82M-v1.0-ONNX-webgpu
- Incidencia de onnxruntime sobre el error de `ConvTranspose` en WebGPU: https://github.com/microsoft/onnxruntime/issues/29807

Nota: la búsqueda web asociada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden exclusivamente de la model card del repositorio.

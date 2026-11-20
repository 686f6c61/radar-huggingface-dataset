# Phangster/kokoro-82m-v1.0-onnx

## Resumen

Kokoro-82M v1.0 ONNX (external data) es una exportación del modelo de síntesis de voz Kokoro-82M v1.0 de hexgrad, redistribuida por el usuario Phangster. Se trata de una conversión a formato ONNX en precisión fp32, derivada a su vez de la exportación de onnx-community, en la que los pesos se han re-guardado en un fichero externo (`onnx/model.onnx_data`) mediante la opción `save_as_external_data` de ONNX. El grafo y los pesos no se han modificado respecto al original.

El problema que resuelve esta variante es concreto: en el backend WebGPU de ONNX Runtime Web, cuando los pesos están embebidos en el grafo, se copian a través de memoria WebAssembly antes de subirlos a la GPU. Al separarlos en un fichero externo, el runtime los sube directamente a la GPU, lo que reduce en torno a 400 MB el consumo de memoria del navegador. La salida de audio es bit a bit idéntica a la del modelo original.

El modelo subyacente, Kokoro-82M, es un sistema text-to-speech de 82 millones de parámetros publicado bajo licencia Apache-2.0, pensado para síntesis de voz ligera. Esta ficha se centra en la variante ONNX distribuida en este repositorio, orientada a inferencia en navegador con transformers.js y WebGPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS Kokoro-82M; detalles arquitectónicos no incluidos en la información proporcionada) |
| Parametros totales | 82M (según el nombre del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (esta exportación); el repositorio de origen onnx-community ofrece otras variantes, no detalladas aquí |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX con datos externos (`onnx/model.onnx` + `onnx/model.onnx_data`) |

## Arquitectura y entrenamiento

No se dispone en la información proporcionada de detalles sobre la arquitectura interna del modelo base Kokoro-82M (tipo de red, mecanismo de atención, diseño del decodificador vocálico) ni sobre su proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO u otras técnicas). Lo que sí se documenta es el proceso de conversión de esta variante: se parte del fichero `onnx/model.onnx` de `onnx-community/Kokoro-82M-v1.0-ONNX` (SHA-256 `8fbea51ea711f2af382e88c833d9e288c6dc82ce5e98421ea61c058ce21a34cb`) y se re-guarda con `onnx.save_model(model, "model.onnx", save_as_external_data=True, all_tensors_to_one_file=True, location="model.onnx_data", size_threshold=1024)`.

La innovación técnica de esta redistribución es exclusivamente de empaquetado: al separar los tensores en un fichero externo, el backend WebGPU de ONNX Runtime Web puede subir los pesos directamente a la GPU sin pasar por memoria WebAssembly, ahorrando aproximadamente 400 MB de memoria del navegador. No hay cambios en el grafo ni en los pesos, y la salida de audio es bit a bit idéntica a la del modelo original.

## Capacidades

- Síntesis de voz a partir de texto (pipeline `text-to-speech`), con salida de audio idéntica a la del modelo Kokoro-82M v1.0 original.
- Ejecución en navegador mediante transformers.js con backend WebGPU y formato de datos externos (`use_external_data_format: true`).
- Carga con precisión fp32 (`dtype: "fp32"`, `device: "webgpu"`).
- No incluye las voces: es necesario usar los ficheros del directorio `voices/` del repositorio `onnx-community/Kokoro-82M-v1.0-ONNX`.
- No se documentan en la información disponible capacidades de clonación de voz, control de emociones, tool calling ni razonamiento multi-paso.

## Casos de uso

- Síntesis de voz en aplicaciones web sin backend: el modelo se ejecuta íntegramente en el navegador con transformers.js y WebGPU, de modo que la conversión de texto a audio no requiere enviar datos a un servidor.
- Lectura por voz de contenido en páginas web: integración en un reproductor o extensión que lea artículos, dado el reducido tamaño del modelo (82M parámetros, repo de 0,3 GB) y su licencia permisiva.
- Asistentes conversacionales en el navegador: generación de respuestas habladas en tiempo de ejecución del cliente, combinable con otros modelos ONNX ejecutados localmente.
- Accesibilidad: conversión de texto a audio para usuarios con discapacidad visual o dificultades de lectura, sin depender de servicios de TTS en la nube.
- Prototipado y demos de TTS: al ser una exportación ONNX lista para WebGPU, permite montar demos interactivas en páginas estáticas sin infraestructura de servidor.
- Aplicaciones de privacidad estricta: escenarios en los que el texto del usuario no puede salir del dispositivo, ya que toda la inferencia ocurre en el cliente.
- Optimización de memoria en front-end: proyectos que ya usan la exportación de onnx-community y necesitan reducir el consumo de memoria del navegador en unos 400 MB sin cambiar la salida de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente afirma que la salida de audio es bit a bit idéntica a la del modelo original y que el ahorro de memoria del navegador es de aproximadamente 400 MB respecto a la exportación con pesos embebidos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 0,3 GB y los pesos se cargan en fp32, por lo que el consumo en GPU será del orden del tamaño de los pesos más el estado del runtime, sin cifra oficial publicada.
- GPU recomendadas: cualquier GPU con soporte de WebGPU en el navegador; no se especifican modelos concretos (A100, H100, RTX 4090, etc.) en la información disponible.
- Compatibilidad con GPU de consumo: previsiblemente sí en navegadores con WebGPU habilitado, dado el tamaño reducido del modelo, aunque no se aportan cifras de latencia ni de throughput.
- Opciones de despliegue: transformers.js con `device: "webgpu"`, `dtype: "fp32"` y `use_external_data_format: true`; también es posible usar ONNX Runtime en otros entornos, aunque la model card se centra en el navegador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Phangster/kokoro-82m-v1.0-onnx | 82M | no disponible | ONNX con datos externos | Apache-2.0 | Pesos separados en `model.onnx_data`; pensado para WebGPU en navegador |
| onnx-community/Kokoro-82M-v1.0-ONNX | 82M | no disponible | ONNX | Apache-2.0 | Exportación de origen, pesos embebidos; incluye directorio `voices/` |
| hexgrad/Kokoro-82M | 82M | no disponible | no disponible | Apache-2.0 | Modelo base original en formato nativo |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cualitativo frente a otras alternativas de TTS.

## Limitaciones y advertencias

- Esta variante no incluye las voces; sin los ficheros del directorio `voices/` del repositorio de onnx-community el modelo no es utilizable para generar audio.
- La licencia Apache-2.0 permite uso comercial, pero se debe mantener la atribución a los autores originales de Kokoro-82M; la model card indica explícitamente que todo el crédito corresponde a sus autores.
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas del modelo base en la información proporcionada; al ser un modelo TTS, el riesgo relevante es la pronunciación incorrecta o la generación de audio defectuoso, no la alucinación textual.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación comunitaria de esta exportación concreta.
- La fecha de creación indicada (2026-11-20) es posterior a la fecha habitual de consulta; conviene verificar la vigencia del repositorio antes de integrarlo.
- El rendimiento real depende del soporte de WebGPU del navegador y del dispositivo; no se publican cifras de latencia que permitan garantizar una experiencia en tiempo real.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Phangster/kokoro-82m-v1.0-onnx
- Modelo base: https://huggingface.co/hexgrad/Kokoro-82M
- Exportación ONNX de origen: https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX

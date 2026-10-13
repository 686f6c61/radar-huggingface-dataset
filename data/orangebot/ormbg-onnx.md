# Orangebot/ormbg-ONNX

## Resumen

Orangebot/ormbg-ONNX es una distribución en formato ONNX del modelo de eliminación de fondo ormbg, publicada por el usuario Orangebot como espejo del repositorio onnx-community/ormbg-ONNX. El modelo original, schirrmacher/ormbg, es un modelo abierto de segmentación de imágenes basado en la arquitectura IS-Net, especializado en separar el sujeto del fondo en fotografías. Esta réplica no introduce cambios en los pesos: copia los ficheros ya convertidos a ONNX por la comunidad y conserva únicamente dos precisiones.

El propósito de esta variante es alimentar la herramienta gratuita Background Remover de orangebot.ai, que ejecuta la inferencia directamente en el navegador del visitante mediante Transformers.js, de modo que las imágenes nunca se suben a un servidor. Esto la hace relevante para aplicaciones web que necesitan eliminar fondos sin coste de backend y con garantías de privacidad. El repositorio ocupa aproximadamente 0,1 GB y se distribuye bajo licencia Apache 2.0.

No es un modelo de lenguaje: no genera texto, no razona y no procesa instrucciones. Su única función es la segmentación de imágenes, y su interés radica en el formato de despliegue (ONNX dentro del navegador), no en el entrenamiento, que pertenece íntegramente al autor original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | IS-Net (red de segmentación de imágenes), exportada a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantización | FP16 (WebGPU con `shader-f16`) y UINT8 (WebAssembly/CPU) |
| Idiomas soportados | no aplica (no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`onnx/model_fp16.onnx`, `onnx/model_uint8.onnx`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es IS-Net, una red neuronal convolucional diseñada para segmentación de imágenes con saliencia, que en este caso se emplea para estimar la máscara del sujeto y devolver una imagen con el fondo transparente. La información disponible no detalla el número de parámetros, la profundidad de la red ni la configuración exacta de capas del modelo original.

Tampoco se publican en la información proporcionada los datos de entrenamiento: no se especifica el número de imágenes, la composición del dataset, ni si hubo fases de ajuste fino, RLHF o DPO (procedimientos, por otro lado, poco habituales en modelos de segmentación). El autor original describe el modelo como optimizado para imágenes con personas. En cuanto a la conversión, los ficheros se copian sin modificar desde `onnx-community/ormbg-ONNX` en la revisión `034e2d884afbab897e10e78fc5bb566b29533fd6`, y solo se conservan dos precisiones, descartando las demás variantes cuantizadas del repositorio de origen.

## Capacidades

- Eliminación de fondo: recibe una imagen y devuelve una `RawImage` con el fondo convertido en transparente.
- Segmentación de imágenes con saliencia, orientada a sujetos humanos.
- Inferencia en el navegador mediante Transformers.js, con backend WebGPU (precisión FP16) o WebAssembly/CPU (precisión UINT8).
- Procesamiento local en el dispositivo del usuario, sin envío de imágenes a servidores.
- No admite generación de texto, tool calling, function calling ni razonamiento multi-paso.
- No dispone de capacidades multilingües, de audio ni de visión descriptiva (no describe imágenes, solo las segmenta).

## Casos de uso

- Eliminación de fondo en el navegador: una web puede ofrecer recorte de fondo sin backend, ya que la inferencia se ejecuta en WebGPU o WASM y la imagen no sale del dispositivo del visitante.
- Fotografía de retrato y avatares: el modelo está optimizado para imágenes con personas, por lo que encaja en generadores de avatares, fondos de perfil y edición de retratos.
- Catálogos de producto con modelos humanos: útil para aislar a la persona que viste una prenda y componer imágenes sobre fondos neutros para comercio electrónico.
- Preprocesado en pipelines de visión: se puede usar como primer paso para recortar el sujeto antes de alimentar otro modelo de clasificación, generación o análisis.
- Herramientas de edición fotográfica ligeras: integrable como plugin o utilidad web que funcione sin conexión y sin cuotas de API.
- Aplicaciones de privacidad estricta: en entornos sanitarios, legales o educativos donde no se permite subir imágenes a terceros, el procesamiento local evita la exposición de datos.
- Automatización de flujos de diseño: generación de máscaras alfa para composición en herramientas gráficas o para el montaje por lotes de creatividades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- La inferencia está pensada para ejecutarse en el navegador; no requiere servidor ni GPU dedicada en un centro de datos.
- Con la precisión FP16 y el backend WebGPU se aprovecha la GPU del dispositivo del usuario (si el navegador soporta la extensión `shader-f16`).
- Con la precisión UINT8 y el backend WebAssembly se puede ejecutar en CPU, lo que permite funcionar en equipos sin GPU compatible con WebGPU, a costa de mayor latencia.
- El tamaño del repositorio es de aproximadamente 0,1 GB, lo que facilita la descarga y el almacenamiento en caché del navegador.
- No se publican cifras concretas de VRAM, latencia ni throughput en la información disponible.
- Opciones de despliegue: Transformers.js (WebGPU o WASM) como vía principal; los ficheros ONNX también pueden consumirse desde otros runtimes compatibles, como se observa en su uso dentro de proyectos de terceros.
- No se especifican GPU recomendadas (A100, H100, RTX 4090 u otras) porque el modelo no está orientado a despliegue en servidor.

## Comparativa con modelos similares

| Modelo | Formato | Precisiones incluidas | Uso previsto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Orangebot/ormbg-ONNX | ONNX | FP16 y UINT8 | Navegador con Transformers.js | Apache 2.0 | HuggingFace (espejo, 0 descargas) |
| onnx-community/ormbg-ONNX | ONNX | Varias (incluye `model.onnx` a precisión completa) | Conversión oficial a ONNX | Apache 2.0 | HuggingFace (origen de esta réplica) |
| schirrmacher/ormbg | Pesos originales del autor | no disponible | Modelo base de eliminación de fondo | Apache 2.0 | HuggingFace (modelo original) |

## Limitaciones y advertencias

- El propio autor original indica que el modelo está optimizado para imágenes con personas: productos, mascotas, pelo fino sobre fondos complejos y objetos transparentes (como cristal) pueden producir recortes de menor calidad.
- Al tratarse de un modelo de segmentación, no hay riesgo de alucinación en el sentido textual, pero sí de máscaras imprecisas o bordes mal definidos en escenas difíciles.
- No procesa lenguaje, por lo que no admite instrucciones, prompts de texto ni conversación.
- Esta réplica solo incluye las precisiones FP16 y UINT8; si se necesita la precisión completa, hay que recurrir al repositorio de origen `onnx-community/ormbg-ONNX`.
- La licencia Apache 2.0 permite uso comercial, pero conviene conservar la atribución al autor del modelo (schirrmacher) y a la comunidad ONNX por la conversión.
- Los pesos no han sido modificados ni validados de nuevo por Orangebot, por lo que cualquier comportamiento del modelo es responsabilidad del trabajo original.
- En producción conviene comprobar la compatibilidad de WebGPU y de `shader-f16` en los navegadores objetivo, y ofrecer el backend WASM como alternativa.

## Enlaces

- Modelo en HuggingFace (esta réplica): https://huggingface.co/Orangebot/ormbg-ONNX
- Modelo original: https://huggingface.co/schirrmacher/ormbg
- Conversión oficial a ONNX: https://huggingface.co/onnx-community/ormbg-ONNX
- Fichero `model.onnx` de origen: https://huggingface.co/onnx-community/ormbg-ONNX/blob/main/onnx/model.onnx
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
- Herramienta Background Remover de orangebot.ai: https://orangebot.ai/tools/background-remover
- Organización OrangeBot AI en GitHub: https://github.com/OrangeBot-AI
- Uso de `ormbg.onnx` en FaceFusion: https://huggingface.co/facefusion/models-3.5.0/blob/main/ormbg.onnx
- Réplica en ModelScope: https://www.modelscope.cn/models/onnx-community/ormbg-ONNX
- Ficha de ormbg-ONNX en savrn.com: https://savrn.com/models/ormbg-onnx

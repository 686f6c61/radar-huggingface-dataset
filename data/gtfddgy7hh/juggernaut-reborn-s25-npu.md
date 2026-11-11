# Gtfddgy7hh/juggernaut-reborn-s25-npu

## Resumen

Juggernaut Reborn S25 NPU es una conversión del modelo de difusión Juggernaut Reborn (basado en Stable Diffusion 1.5) desarrollado originalmente por KandooAI, empaquetada por el usuario Gtfddgy7hh para su ejecución en la NPU del Qualcomm Snapdragon 8 Elite for Galaxy (SM8750, HTP v79). El repositorio no contiene un modelo nuevo ni pesos reentrenados: es un artefacto de despliegue que incluye los tres componentes clásicos de un pipeline SD 1.5 (text encoder CLIP, UNet y decoder VAE) compilados como context binaries de QNN en fp16 mediante Qualcomm AI Hub (QAIRT 2.50), junto con los grafos ONNX equivalentes.

El interés es práctico: permite ejecutar generación de imágenes texto-a-imagen íntegramente en el dispositivo, sin GPU discreta ni servicios en la nube, en teléfonos equipados con ese SoC concreto. El repositorio ocupa 2,1 GB y está publicado bajo licencia CreativeML Open RAIL-M, con la restricción adicional de los términos del modelo original en Civitai (atribución obligatoria y prohibición de vender el modelo).

La relevancia es acotada y muy específica: no es un modelo para servidores ni para investigación de arquitecturas, sino una pieza de ingeniería de despliegue orientada a inferencia local en móvil. Cualquier evaluación debe hacerse sabiendo que la calidad de imagen es la del SD 1.5 afinado de KandooAI, no la de un modelo de difusión moderno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion 1.5 (UNet + CLIP text encoder + VAE decoder), compilada a QNN context binaries |
| Parametros totales | no disponible (repo de 2,1 GB en fp16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 77 tokens de prompt (limite del text encoder CLIP) |
| Tipos de cuantizacion | fp16 (compilacion QNN); se incluyen tambien grafos ONNX sin cuantizar |
| Idiomas soportados | no disponible (el prompt se procesa con CLIP, predominantemente ingles) |
| Licencia | CreativeML Open RAIL-M, con terminos adicionales del modelo original en Civitai |
| Formato de pesos | QNN context binaries (.bin) y ONNX (.onnx) |

Detalle de entradas y salidas segun la model card:

| Componente | Entrada | Salida |
|---|---|---|
| Text encoder CLIP | `tokens` int32 [1,77] | [1,77,768] |
| UNet | `latent` [1,64,64,4] NHWC, `timestep` [1,1], `text_emb` [1,77,768] | [1,64,64,4] |
| VAE decoder | `latent` [1,64,64,4] (division por 0,18215 incluida) | imagen [1,512,512,3] en rango 0..1 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Stable Diffusion 1.5: un UNet convolucional con atención cruzada sobre embeddings de texto producidos por un text encoder CLIP, y un VAE que decodifica el latente de 64x64x4 a una imagen de 512x512x3. El repositorio no aporta información sobre el entrenamiento del modelo original; los pesos proceden de Juggernaut Reborn de KandooAI, un fine-tune de SD 1.5 publicado en Civitai, y el autor de esta conversión declara explícitamente que los pesos no se han modificado más allá de la conversión de formato.

La innovación técnica aquí no está en el modelo sino en el pipeline de compilación: los tres subgrafos se han exportado a ONNX y compilado con Qualcomm AI Hub (QAIRT 2.50) en precisión fp16 para el HTP v79 del Snapdragon 8 Elite for Galaxy. La compilación está fijada a ese SoC concreto (SM8750), por lo que los binarios QNN no son portables a otros chips Qualcomm sin recompilar. El VAE incorpora internamente el factor de escala 0,18215, lo que simplifica la integración en la app anfitriona. No hay información sobre RLHF, DPO ni sobre la composición del dataset de entrenamiento original.

## Capacidades

- Generación de imágenes texto-a-imagen a 512x512 píxeles a partir de prompts de hasta 77 tokens.
- Inferencia completamente local en la NPU del dispositivo, sin conexión a red.
- Ejecución de los tres submodelos por separado (text encoder, UNet, VAE), lo que permite orquestar el bucle de difusión desde la aplicación anfitriona.
- Salida del VAE directamente normalizada en rango 0..1, lista para conversión a uint8.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües declaradas; el text encoder CLIP está entrenado predominantemente en inglés.
- No incluye modo thinking, visión, audio ni otras modalidades.

## Casos de uso

- Generación de imágenes offline en aplicación móvil: el pipeline completo cabe en el almacenamiento del teléfono (2,1 GB) y se ejecuta en la NPU, por lo que resulta adecuado para apps de creatividad que deben funcionar sin conectividad.
- Prototipado de funciones de imagen generativa en el Galaxy S25: al estar compilado específicamente para el SM8750 con HTP v79, sirve para validar latencia y consumo energético reales antes de invertir en un modelo mayor.
- Filtros y avatares personalizados en apps de mensajería: la generación a 512x512 es suficiente para avatares y stickers, y la inferencia local evita enviar prompts del usuario a servidores externos.
- Demostraciones técnicas de despliegue QNN: el repositorio incluye tanto los binarios QNN como los ONNX, lo que facilita comparar el rendimiento de la NPU frente a la ejecución ONNX en CPU/GPU del mismo dispositivo.
- Pruebas de privacidad por diseño: al no requerir red, encaja en escenarios donde el contenido del prompt es sensible y no puede salir del dispositivo.
- Base para fine-tunes ligeros o LoRA sobre SD 1.5 en movil: el formato de E/S documentado (tokens de 77, latentes NHWC de 64x64x4) permite sustituir componentes por variantes compatibles con el mismo pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye latencias, throughput ni métricas de calidad de imagen (FID, CLIP score) para esta compilación.

## Requisitos de hardware

- Dispositivo objetivo: exclusivamente Snapdragon 8 Elite for Galaxy (SM8750, HTP v79). Los binarios QNN no funcionan en otros SoC sin recompilación.
- VRAM: no aplica; el modelo se ejecuta en la NPU Hexagon del SoC y comparte memoria del sistema con la CPU. El repositorio ocupa 2,1 GB en almacenamiento.
- GPU recomendadas: no aplica para los binarios QNN. Los ficheros ONNX podrían ejecutarse en GPU de escritorio, pero no se documentan requisitos ni rendimiento para ese caso.
- Cabe en GPU de consumo: no disponible como dato verificado; el modelo es SD 1.5 estándar y en fp16 rondaría los 2 GB, pero esta conversión concreta está pensada para móvil.
- Opciones de despliegue: Qualcomm AI Hub / QAIRT 2.50 con runtime QNN en Android; los ONNX pueden cargarse con ONNX Runtime, aunque no se especifica compatibilidad.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Objetivo |
|---|---|---|---|---|---|
| Juggernaut Reborn S25 NPU (este) | no disponible (SD 1.5, repo 2,1 GB) | 77 tokens | QNN + ONNX | CreativeML Open RAIL-M | NPU Snapdragon 8 Elite for Galaxy |
| Juggernaut Reborn (original, Civitai) | SD 1.5 | 77 tokens | safetensors (presumible) | terminos de Civitai | GPU de escritorio / servicios |
| Stable Diffusion 1.5 base | ~860 M (UNet) | 77 tokens | safetensors, ONNX, GGUF | CreativeML Open RAIL-M | GPU de escritorio |
| Stable Diffusion XL | no disponible | 77 tokens por encoder | safetensors | CreativeML Open RAIL++-M | GPU de escritorio |

La comparación relevante no es de calidad sino de formato: frente al modelo original de KandooAI, esta versión no mejora ni empeora la generación, solo cambia el soporte de ejecución. Frente a SD 1.5 base, la diferencia es el fine-tune de KandooAI y la compilación para NPU. No se dispone de datos de benchmarks para establecer comparaciones de rendimiento.

## Limitaciones y advertencias

- Los binarios QNN están compilados únicamente para el Snapdragon 8 Elite for Galaxy (SM8750, HTP v79); no son portables a otros dispositivos sin recompilar con Qualcomm AI Hub.
- El límite de 77 tokens del text encoder CLIP restringe la longitud y complejidad de los prompts.
- El modelo subyacente es SD 1.5, con las limitaciones conocidas de esa generación: menor fidelidad anatómica y de texto en imagen que modelos posteriores.
- Riesgo de sesgos y de contenido inapropiado heredado del dataset de entrenamiento original de SD 1.5; no se documentan mitigaciones específicas.
- Riesgo de alucinación visual: el modelo puede generar elementos inexistentes o incoherentes respecto al prompt, especialmente con prompts ambiguos.
- La licencia CreativeML Open RAIL-M impone restricciones de uso basadas en el caso de uso; deben revisarse antes de cualquier despliegue comercial.
- Los términos del modelo original en Civitai exigen atribución y prohíben la venta del modelo; es necesario verificar su compatibilidad con el uso previsto.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día: no hay evidencia de validación por parte de la comunidad.
- No se documentan latencias, consumo energético ni calidad de salida de esta compilación concreta.
- El autor del repositorio no es el autor del modelo original; la responsabilidad sobre los pesos recae en KandooAI.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Gtfddgy7hh/juggernaut-reborn-s25-npu
- Modelo original en Civitai: https://civitai.com/models/46422/juggernaut?modelVersionId=274039
- Licencia CreativeML Open RAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license

# lucas-vitrus/liquid-crow-3B

## Resumen

`lucas-vitrus/liquid-crow-3B` es un adaptador PEFT (LoRA) publicado por Lucas Cassiano (usuario `lucas-vitrus`) sobre el modelo base `LiquidAI/LFM2.5-VL-3B`, un modelo de lenguaje y visión (VLM) de 3B parámetros desarrollado por Liquid AI. El adaptador se presenta como "Liquid Crow", un proyecto orientado a la descripción detallada de la realidad física y la percepción visual en entornos de borde, aunque en esta versión se aplica a un modelo de 3B en lugar del prototipo de 450M que aparece en las publicaciones del autor.

El repositorio contiene únicamente los pesos del adaptador (formato `safetensors`), no el modelo completo, por lo que su uso requiere cargar primero el modelo base `LiquidAI/LFM2.5-VL-3B`. La licencia se declara como `other`, sin especificar los términos exactos. El modelo es multimodal: acepta entradas de texto e imagen y genera respuestas de texto. No se dispone de información sobre el proceso de entrenamiento, el conjunto de datos utilizado ni los resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (VLM) sobre base `LiquidAI/LFM2.5-VL-3B` |
| Parametros totales | no disponible (el adaptador LoRA no publica el numero de parametros; el base es de 3B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el codigo de ejemplo usa `torch.float16`) |
| Idiomas soportados | no disponibles |
| Licencia | other (sin especificar) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `LFM2.5-VL-3B`, un modelo de Liquid AI que combina un codificador visual con un decodificador de lenguaje basado en transformadores. La arquitectura exacta del modelo base no se detalla en la documentacion publica, pero Liquid AI describe sus modelos como eficientes en computo y memoria, disenados para despliegue en dispositivos de borde. El adaptador LoRA anade pesos entrenables sobre las capas del modelo base sin modificar la arquitectura original.

No se ha publicado informacion sobre el proceso de entrenamiento del adaptador: ni el numero de tokens, ni la composicion del dataset, ni si se utilizaron tecnicas como RLHF o DPO. El codigo de ejemplo proporcionado en la model card muestra un uso tipico con `transformers` y `peft`, cargando el modelo base con `torch.float16` y el adaptador mediante `PeftModel.from_pretrained`.

## Capacidades

- Generacion de texto multimodal: el modelo acepta entradas de texto e imagen y produce respuestas de texto.
- Descripcion de imagenes: el ejemplo de uso incluye la instruccion "Describe the image", indicando capacidad de vision y lenguaje.
- Razonamiento sobre contenido visual: puede responder preguntas sobre imagenes combinando texto e imagen en la misma conversacion.
- Soporte de chat multi-turno: la plantilla de chat se aplica mediante `processor.apply_chat_template`, lo que sugiere capacidad de conversacion con historial.
- Integracion con PEFT: el adaptador se carga como un modulo LoRA, facilitando su combinacion con otros adaptadores o su extraccion para despliegue ligero.
- No se ha confirmado soporte de tool calling, agentes ni modos de razonamiento extendido.

## Casos de uso

- Descripcion de imagenes en tiempo real en dispositivos de borde: el modelo base de 3B es adecuado para ejecutarse en hardware con recursos limitados, y el adaptador "Liquid Crow" se orienta a describir la realidad fisica en detalle. Podria usarse en sistemas de monitorizacion visual que generan informes textuales automaticos.
- Asistentes de accesibilidad: un modelo VLM de 3B puede describir el contenido de una imagen a personas con discapacidad visual, ejecutandose en un telefono movil o un dispositivo dedicado.
- Automatizacion de control de calidad visual: en entornos industriales, el modelo puede analizar imagenes de productos y generar descripciones o alertas basadas en texto, integrandose en un pipeline de inspeccion.
- Clasificacion y etiquetado de imagenes en sistemas de archivos: puede generar metadatos textuales para imagenes almacenadas, facilitando la busqueda y organizacion automatica.
- Educacion y documentacion tecnica: puede explicar diagramas o fotografias de experimentos en contextos de formacion, proporcionando descripciones en lenguaje natural.
- Prototipado rapido de aplicaciones VLM: dado que es un adaptador LoRA, puede combinarse con el modelo base para experimentar en entornos de investigacion sin necesidad de entrenar un modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas de evaluacion como MMLU, HumanEval o tareas especificas de vision-lenguaje. Tampoco se indican comparaciones con otros modelos de la misma categoria.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 3B en `float16` ocupa aproximadamente 6 GB de VRAM. El adaptador LoRA anade un overhead minimo de memoria.
- GPU recomendadas: tarjetas con al menos 6 GB de VRAM, como la NVIDIA RTX 3060, RTX 4060, o GPUs de datacenter como A10G o L4. No se recomienda para GPUs con menos de 6 GB.
- Compatibilidad con consumer GPU: si, cabe en GPUs de consumo medio-alto. Para una experiencia fluida con imagenes grandes, se recomienda al menos 8 GB de VRAM.
- Opciones de despliegue: puede usarse con `transformers` y `peft` en Python; tambien podria exportarse a ONNX o usar `vLLM` si se convierte el adaptador, aunque no hay instrucciones especificas.
- Latencia y throughput: no se disponen de datos publicados.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa con modelos similares. El adaptador se basa en un modelo de Liquid AI, pero no hay datos publicos sobre su rendimiento relativo frente a alternativas como LLaVA, Phi-3-vision o Qwen-VL. La unica referencia publica es la publicacion de LinkedIn que menciona un prototipo de 450M parametros, pero no se especifican benchmarks de este adaptador de 3B.

## Limitaciones y advertencias

- Licencia `other`: no se especifican los terminos exactos. Antes de usar en produccion, contacta con el autor o revisa el repositorio base para conocer las restricciones de uso comercial.
- Ausencia de documentacion sobre entrenamiento: se desconoce el dataset utilizado, por lo que no se pueden evaluar sesgos ni alucinaciones especificas.
- Dependencia del modelo base: el adaptador no funciona de forma independiente; requiere cargar `LiquidAI/LFM2.5-VL-3B`, cuyo acceso y licencia deben verificarse.
- Tamano del repositorio de 0.0 GB: puede indicar que el adaptador no se ha subido correctamente o que los archivos no estan completos. Comprueba que los pesos estan disponibles antes de su uso.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar descripciones incorrectas de las imagenes, especialmente en escenarios complejos o con objetos poco frecuentes.
- Idioma: no se especifican los idiomas soportados; el ejemplo de uso esta en ingles, lo que sugiere que el modelo puede estar optimizado para ingles.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/lucas-vitrus/liquid-crow-3B
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-3B
- Perfil del autor: https://huggingface.co/lucas-vitrus
- Web de Liquid AI: https://www.liquid.ai/
- Blog de Liquid AI sobre los modelos fundacionales: https://www.liquid.ai/blog/liquid-foundation-models-our-first-series-of-generative-ai-models
- Publicacion de LinkedIn sobre Liquid Crow: https://www.linkedin.com/posts/-lucascassiano_physicalai-visionlanguagemodels-worldmodels-activity-7493128553371168770-b_oZ

# joynix28/clip-vit-large-patch14-pooler

## Resumen

`joynix28/clip-vit-large-patch14-pooler` es una exportación ONNX de la torre de visión del modelo CLIP ViT-L/14, publicada por el usuario joynix28. Su particularidad frente a otras exportaciones orientadas a navegador es que expone como salida el tensor `pooler_output` de 1024 dimensiones (la característica CLS agrupada tras la layer norm), además del `image_embeds` proyectado de 768 dimensiones. Este detalle es relevante porque las sondas de detección de imágenes generadas por IA suelen entrenarse sobre esas 1024 dimensiones, no sobre la proyección final.

El modelo no añade entrenamiento ni modifica los pesos: se obtiene mediante cirugía de grafo sobre `Xenova/clip-vit-large-patch14` (`onnx/vision_model_quantized.onnx`), insertando un único nodo `Identity` que deja accesible la característica interna. Por tanto, los pesos son los originales de OpenAI para CLIP ViT-L/14, publicados bajo licencia MIT.

Su relevancia práctica es acotada pero concreta: permite ejecutar en cliente (navegador, CPU) la sonda lineal `ai_detector/model.npz` del proyecto Rinne414/SynthID-detector, que clasifica imágenes como sintéticas o reales. Es un repositorio de 0,3 GB, sin descargas ni likes en el momento de la ficha, pensado como utilidad de inferencia más que como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer Large (ViT-L/14), torre de vision de CLIP |
| Parametros totales | ≈304 M (torre de vision de CLIP ViT-L/14; valor de la arquitectura base, no declarado de forma explicita en la model card) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen `[batch, 3, 224, 224]`) |
| Tipos de cuantizacion | ONNX cuantizado (heredado del export `vision_model_quantized.onnx` de Xenova) |
| Idiomas soportados | no disponible (no incluye torre de texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (ejecutable con onnxruntime / onnxruntime-web) |

## Arquitectura y entrenamiento

Se trata de un transformer de visión puro (ViT-L/14) correspondiente a la torre visual de CLIP, con parches de 14×14 y resolución de entrada de 224×224. La model card no detalla el número de capas ni la dimensión interna más allá de las dimensiones de salida, pero corresponde a la arquitectura estándar ViT-L: 24 bloques, dimensión oculta de 1024, 16 cabezas de atención y salida proyectada de 768 dimensiones. El pipeline de preprocesado es el de CLIP: normalización con `mean=[0.48145466, 0.4578275, 0.40821073]` y `std=[0.26862954, 0.26130258, 0.27577711]`, y redimensionado bicúbico a 224×224.

No hubo entrenamiento adicional ni ajuste fino. El repositorio se construyó mediante cirugía de grafo sobre la exportación de Xenova: se añadió un único nodo `Identity` para exponer como salida del grafo el tensor que alimenta la proyección visual (`pooler_output`, 1024-d), además de la salida original `image_embeds` (768-d). Los pesos subyacentes son los de OpenAI. No se documentan fases de RLHF, DPO ni composición de dataset porque no aplican: no es un modelo generativo ni ha sido reentrenado.

## Capacidades

- Extracción de características visuales: produce `pooler_output` de 1024 dimensiones por imagen y `image_embeds` proyectado de 768 dimensiones.
- Detección de imágenes generadas por IA: sirve de extractor para una sonda logística lineal (proyecto SynthID-detector) entrenada sobre estas características.
- Inferencia en cliente: al ser un ONNX ligero, puede ejecutarse en navegador mediante onnxruntime-web y en CPU.
- Clasificación y clustering de imágenes a partir de embeddings, mediante cabezas externas.
- No incluye torre de texto, por lo que no realiza tareas visión-lenguaje, búsqueda texto-imagen ni zero-shot con prompts.
- Sin soporte de tool calling ni function calling.
- Sin capacidades de agente ni razonamiento multi-paso.
- Sin capacidades multilingües (no procesa lenguaje).
- Sin modo conversacional, thinking mode, audio ni generación de texto.

## Casos de uso

- Detección de imágenes sintéticas en el navegador: integrando el modelo con la sonda lineal del proyecto SynthID-detector, se puede clasificar una imagen subida por el usuario sin enviarla a un servidor, ya que todo el cálculo ocurre en cliente con onnxruntime-web.
- Moderación de contenido en plataformas: usar el `pooler_output` para alimentar un clasificador que marque imágenes potencialmente generadas por IA antes de su publicación.
- Verificación de autenticidad en medios: extraer características de imágenes recibidas y compararlas con la sonda para señalar posibles manipulaciones en flujos de prensa o denuncia ciudadana.
- Extracción de embeddings para búsqueda y recomendación visual: emplear los vectores de 768 dimensiones (`image_embeds`) como índice para deduplicación, similitud o recuperación de imágenes dentro de un catálogo.
- Clustering y organización de datasets: agrupar grandes colecciones de imágenes por similitud semántica usando las características de 1024 dimensiones, útil en curación de datos de entrenamiento.
- Clasificación on-device en aplicaciones móviles o de escritorio: al caber en CPU y ocupar 0,3 GB, permite etiquetar imágenes en entornos sin GPU.
- Base para fine-tuning de sondas específicas: reutilizar el extractor congelado y entrenar clasificadores lineales ligeros para dominios concretos (arte, fotografía, documentos escaneados).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks clásicos (MMLU, HumanEval, GSM8K, etc.) porque no aplican a un extractor de características visuales. La model card sí reporta las métricas de validación de la sonda lineal asociada al proyecto SynthID-detector, que son las siguientes:

| Metrica de la sonda (SynthID-detector) | Valor |
|---|---|
| AUC | 0,998 |
| Imagenes de IA no detectadas (falsos negativos) | 0,0 % |
| Falsos positivos | 1,8 % |
| Rendimiento en generadores no vistos | 0,97–1,00 |

Estos valores corresponden a la sonda logística entrenada sobre las características que expone este repositorio, según su autor, y no a un benchmark estandarizado del modelo base. No se dispone de comparaciones con otras exportaciones ONNX medidas en las mismas condiciones.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; el repo ocupa 0,3 GB y el modelo cuantizado puede ejecutarse en CPU sin GPU dedicada.
- GPU recomendadas: cualquier GPU con soporte CUDA o DirectML es suficiente; no se requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna (RTX 3060, RTX 4090, etc.), incluso en GPUs integradas sin problema.
- Ejecución en CPU: viable; es el escenario previsto junto con el navegador.
- Opciones de despliegue: onnxruntime (Python/C++), onnxruntime-web (navegador), onnxruntime con backend CUDA/TensorRT/DirectML. No aplican vLLM, llama.cpp ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponible. Al ser un único forward de ViT-L/14 a 224×224, la inferencia por imagen es de bajo coste, pero no se han publicado cifras de latencia.

## Comparativa con modelos similares

| Modelo | Parametros (torre de vision) | Salida | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| joynix28/clip-vit-large-patch14-pooler | ≈304 M | `pooler_output` 1024-d + `image_embeds` 768-d | ONNX (cuantizado) | MIT | HuggingFace |
| Xenova/clip-vit-large-patch14 | ≈304 M | `image_embeds` 768-d | ONNX | MIT | HuggingFace |
| openai/clip-vit-large-patch14 | ≈304 M (torre de vision) | `image_embeds` 768-d | PyTorch (safetensors) | MIT | HuggingFace |

La diferencia clave del repositorio analizado frente a las alternativas es la exposición de la característica interna de 1024 dimensiones, que las otras exportaciones no ofrecen directamente. En cuanto a pesos y arquitectura, los tres son equivalentes. No se dispone de modelos comparables específicos de detección de imágenes por IA con licencia MIT en el material proporcionado.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni genera texto; cualquier expectativa de generación, razonamiento o conversación no aplica.
- No incluye torre de texto, por lo que no soporta tareas texto-imagen ni zero-shot con prompts.
- La utilidad para detección de IA depende por completo de la sonda externa (SynthID-detector); el modelo por sí solo únicamente produce características.
- Riesgo de sesgo y de degradación: las métricas reportadas (0,0 % de falsos negativos, 1,8 % de falsos positivos) provienen del autor de la sonda y no se han verificado de forma independiente.
- Posible sesgo hacia los generadores presentes en el conjunto de validación; aunque el autor reporta 0,97–1,00 en generadores no vistos, esto no cubre todos los modelos generativos existentes ni futuros.
- Repositorio sin descargas ni likes en el momento de la ficha, sin pipeline declarado y con idiomas no disponibles; madurez y mantenimiento no verificables.
- Licencia MIT, por lo que el uso comercial está permitido; conviene revisar igualmente las condiciones del repositorio origen (Xenova) y de la sonda asociada.
- Caveat de producción: al tratarse de una exportación obtenida por cirugía de grafo, la estabilidad de la interfaz de salida depende del export subyacente de Xenova.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joynix28/clip-vit-large-patch14-pooler
- Export origen (Xenova): https://huggingface.co/Xenova/clip-vit-large-patch14
- Modelo base (OpenAI): https://huggingface.co/openai/clip-vit-large-patch14
- Proyecto de la sonda lineal (SynthID-detector): https://github.com/Rinne414/SynthID-detector

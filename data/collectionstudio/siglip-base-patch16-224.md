# CollectionStudio/siglip-base-patch16-224

## Resumen

SigLIP (base-sized) es un modelo multimodal de doble codificador (imagen-texto) desarrollado originalmente por Google Research y publicado en el artículo *Sigmoid Loss for Language Image Pre-Training* (Zhai et al., 2023). Esta ficha corresponde a la reproducción subida por el usuario CollectionStudio al Hub, con 203.155.970 parámetros y un peso de repositorio de 1,6 GB. Su diferencia principal frente a CLIP es la función de pérdida: en lugar de una softmax sobre similitudes por pares (que requiere una vista global del batch para normalizar), emplea una pérdida sigmoide calculada par a par, lo que permite escalar el tamaño de batch y, a la vez, obtener mejores resultados en batches pequeños.

El modelo está pensado para tareas de visión-lenguaje sin ajuste específico: clasificación de imágenes zero-shot y recuperación imagen-texto (image-text retrieval). Combina un codificador de visión tipo ViT con patch de 16x16 a resolución 224x224 y un codificador de texto con ventana de 64 tokens, generando embeddings alineados en un espacio común. Se entrenó sobre pares imagen-texto en inglés del dataset WebLI durante tres días en 16 chips TPU-v4.

Es relevante porque sirve como bloque base de sistemas que necesitan puntuar la afinidad entre una imagen y una etiqueta o frase sin entrenamiento adicional, y porque su pérdida sigmoide es la base que después adoptaron variantes mayores (so400m, SigLIP 2). Al publicarse bajo licencia Apache 2.0, es reutilizable en productos comerciales sin las restricciones de licencia que arrastra CLIP en algunas variantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Doble codificador transformer (ViT para imagen + transformer de texto), tipo CLIP con perdida sigmoide |
| Parametros totales | 203.155.970 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 64 tokens para el codificador de texto |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible en la ficha; los pares imagen-texto de entrenamiento son en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y pytorch |
| Resolucion de imagen | 224x224, patch 16x16 |
| Normalizacion de imagen | media (0.5, 0.5, 0.5), desviacion estandar (0.5, 0.5, 0.5) |
| Tamano del repositorio | 1,6 GB |
| Descargas / likes en el Hub | 0 / 0 |

## Arquitectura y entrenamiento

Se trata de un modelo de doble torre: por un lado un Vision Transformer que divide la imagen de 224x224 en parches de 16x16 y los proyecta como tokens; por otro, un transformer de texto que procesa secuencias de hasta 64 tokens. Ambos codificadores producen embeddings que se comparan mediante producto escalar y se entrenan de forma contrastiva. La innovación clave respecto a CLIP es la sustitución de la softmax sobre todas las similitudes del batch por una pérdida sigmoide independiente por par imagen-texto, lo que elimina la necesidad de una normalización global y mejora el comportamiento con batches pequeños y grandes por igual.

El entrenamiento se realizó sobre los pares imagen-texto en inglés del dataset WebLI (Chen et al., 2023), con imágenes redimensionadas a 224x224 y textos tokenizados y rellenados hasta 64 tokens. El cómputo declarado por el autor es de 16 TPU-v4 durante tres días. No se indica en la información disponible si hubo etapas de ajuste por preferencias (RLHF/DPO); en un modelo de alineación imagen-texto de este tipo no es el procedimiento habitual, pero no se confirma explícitamente.

## Capacidades

- Clasificación de imágenes zero-shot: asignar probabilidades a etiquetas de texto arbitrarias sin reentrenamiento.
- Recuperación imagen-texto (image-text retrieval): ordenar candidatos cruzados entre imágenes y frases.
- Cálculo de similitud imagen-texto: genera logits por imagen que se transforman en probabilidades con la función sigmoide.
- Integración con la API `pipeline` de Transformers para `zero-shot-image-classification`.
- Extracción de embeddings de imagen y de texto para indexación y búsqueda vectorial.
- No dispone de tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo generativo de lenguaje.
- No soporta generación de texto, código ni matemáticas: es un modelo discriminativo de emparejamiento.
- Capacidades multilingües: no disponibles; los pares de entrenamiento son en inglés.
- Capacidades especiales: ninguna declarada (sin modo thinking, sin visión generativa, sin audio).

## Casos de uso

- Moderación de contenido visual: clasificar imágenes contra etiquetas definidas por política (por ejemplo, "contenido violento", "desnudo", "documento") sin entrenar un clasificador específico, aprovechando el modo zero-shot.
- Etiquetado automático de catálogos de producto: generar etiquetas candidatas y dejar que el modelo puntúe la afinidad de cada imagen con cada categoría, reduciendo trabajo manual en altas de inventario.
- Búsqueda visual en e-commerce: indexar los embeddings de imagen del catálogo y permitir consultas en lenguaje natural, recuperando los productos más similares mediante similitud coseno.
- Organización de fototecas y archivos multimedia: agrupar o clasificar imágenes por temática mediante etiquetas zero-shot, sin necesidad de un dataset anotado propio.
- Filtrado previo en pipelines de anotación: descartar o priorizar imágenes antes de pasarlas a modelos de visión más caros, reduciendo coste de cómputo.
- Verificación de correspondencia imagen-texto en datasets: detectar pares mal etiquetados comparando la puntuación de afinidad frente a un umbral.
- Búsqueda de productos por imagen en apps móviles: al ser un modelo de 203M de parámetros, puede cuantizarse y ejecutarse en servidores modestos o incluso en edge con las conversiones adecuadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card referencia una tabla comparativa frente a CLIP extraída del artículo original, pero la presenta como imagen y no incluye las cifras en texto. Para obtener los valores exactos de zero-shot classification o retrieval conviene consultar directamente el artículo *Sigmoid Loss for Language Image Pre-Training* (arXiv:2303.15343).

## Requisitos de hardware

- VRAM estimada en FP32: en torno a 0,8 GB solo para pesos (≈812 MB), más activaciones y memoria del procesador de imagen.
- VRAM estimada en FP16/BF16: alrededor de 0,4 GB para pesos.
- VRAM estimada en INT8: en torno a 0,2 GB para pesos.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas con suficiente memoria compartida.
- GPU de centro de datos (A100, H100) no son necesarias salvo para inferencia en lote a gran escala; resultan sobredimensionadas para una sola petición.
- Opciones de despliegue: Transformers con PyTorch (es el formato publicado), ONNX Runtime, TorchScript, y servidores de inferencia genéricos. No se declara soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de texto | Licencia | Disponibilidad |
|---|---|---|---|---|
| CollectionStudio/siglip-base-patch16-224 | 203.155.970 | 64 tokens | apache-2.0 | HuggingFace Hub |
| google/siglip-base-patch16-224 | no disponible en la informacion | 64 tokens | apache-2.0 | HuggingFace Hub |
| openai/clip-vit-base-patch16 | no disponible en la informacion | no disponible | licencia MIT (segun informacion publica del repositorio) | HuggingFace Hub |
| google/siglip-so400m-patch14-384 | no disponible en la informacion | no disponible | apache-2.0 | HuggingFace Hub |

La comparación directa de rendimiento frente a CLIP aparece en forma de tabla dentro del artículo original, pero las cifras no están disponibles en el texto de la model card. Los modelos comparables pertenecen a la misma familia (CLIP y variantes SigLIP de mayor tamaño), y la diferencia fundamental de esta ficha es que se trata de una reproducción subida por un usuario distinto del autor original.

## Limitaciones y advertencias

- Sesgos: al entrenarse con pares imagen-texto de WebLI en inglés, puede heredar sesgos de representación (género, etnia, cultura) presentes en ese corpus; no se documenta análisis de sesgo en la información disponible.
- Alucinación: no genera texto, por lo que el riesgo clásico de alucinación no aplica, pero puede asignar puntuaciones altas a etiquetas plausibles pero incorrectas en clasificación zero-shot.
- Contexto limitado: el codificador de texto tiene solo 64 tokens, por lo que frases largas se truncan; hay que formular etiquetas o consultas cortas.
- Idioma: el entrenamiento es en inglés; el rendimiento con textos en castellano no está documentado y previsiblemente será inferior.
- Este repositorio concreto tiene 0 descargas y 0 likes, y fue creado por un usuario no verificado como autor original; conviene validar la integridad de los pesos antes de usarlo en producción.
- La model card original del autor de SigLIP no fue escrita por el equipo de Google, sino por el equipo de Hugging Face, según se indica en el propio README.
- Licencia: Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribuir correctamente a los autores originales.
- Al ser un modelo de emparejamiento y no generativo, no sirve para tareas de conversación, generación de código ni razonamiento; forzar esos usos dará resultados sin sentido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CollectionStudio/siglip-base-patch16-224
- Modelo original de Google: https://huggingface.co/google/siglip-base-patch16-224
- Articulo principal: https://arxiv.org/abs/2303.15343
- Articulo del dataset WebLI: https://arxiv.org/abs/2209.06794
- Repositorio de entrenamiento big_vision: https://github.com/google-research/big_vision
- Documentacion de SigLIP en Transformers: https://huggingface.co/transformers/main/model_doc/siglip.html
- Repositorio completo de transformers: https://github.com/huggingface/transformers

# CollectionStudio/siglip-base-patch16-512

## Resumen

SigLIP (Sigmoid Loss for Language Image Pre-Training) es un modelo multimodal de alineación imagen-texto desarrollado por Google Research y presentado en el artículo "Sigmoid Loss for Language Image Pre-Training" (Zhai et al., 2023). Esta ficha corresponde a la variante base, con parches de 16x16 y resolución de entrada de 512x512, alojada por el usuario CollectionStudio como réplica del modelo original `google/siglip-base-patch16-512`. El modelo contiene 203.791.874 parámetros y se distribuye en formato safetensors bajo licencia Apache 2.0.

El problema que resuelve es el de la clasificación zero-shot de imágenes y la recuperación imagen-texto, es decir, asignar etiquetas textuales a imágenes sin haber sido entrenado específicamente para esas clases. Su aportación frente a CLIP es la función de pérdida sigmoidea, que opera únicamente sobre pares imagen-texto y no requiere una normalización global de las similitudes por pares. Esto permite escalar el tamano de batch y mejora el rendimiento en regimenes de batch pequeno.

Es relevante ahora porque se ha convertido en la alternativa de referencia a CLIP dentro del ecosistema Hugging Face Transformers: está integrado en la librería, dispone de pipeline de `zero-shot-image-classification` y se usa habitualmente como torre de visión en arquitecturas vision-language mas grandes (por ejemplo, PaliGemma). Todo el entrenamiento de esta variante se realizó sobre pares imagen-texto en inglés, de modo que su uso fuera de ese idioma requiere una verificación adicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer dual (torre de visión ViT + torre de texto), tipo CLIP con pérdida sigmoidea |
| Parametros totales | 203.791.874 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Texto: 64 tokens (padding fijo). Imagen: 512x512 px, parches de 16x16 → 1.024 parches |
| Tipos de cuantizacion | no disponible en la documentación (admite cuantización estándar a FP16/INT8 por su tamano) |
| Idiomas soportados | inglés (pares imagen-texto de WebLI en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0.8 GB |
| Pipeline declarado | no disponible |
| Resolución de entrada | 512x512 |
| Normalización de imagen | media (0.5, 0.5, 0.5), desviación estándar (0.5, 0.5, 0.5) |

## Arquitectura y entrenamiento

SigLIP sigue el esquema de dos torres de CLIP: un Vision Transformer que convierte la imagen en una secuencia de embeddings de parches (con parches de 16x16 sobre una entrada de 512x512, lo que produce 1.024 parches) y un transformer de texto que codifica la descripción. La diferencia clave reside en la función de pérdida: en lugar del contraste softmax con normalización sobre todas las similitudes por pares de un batch, se emplea una pérdida sigmoidea calculada de forma independiente sobre cada par imagen-texto. Esto elimina la necesidad de una vista global del batch para normalizar, permite batch muy grandes sin los problemas de estabilidad asociados y rinde mejor con batch pequenos.

El preentrenamiento se realizó sobre los pares imagen-texto en inglés del conjunto WebLI (Chen et al., 2023), con imágenes redimensionadas a 512x512 y textos tokenizados y paddeados a una longitud fija de 64 tokens. El cómputo de entrenamiento declarado es de 16 chips TPU-v4 durante tres días. La model card no detalla el número exacto de tokens ni fases de RLHF o DPO, ya que se trata de un modelo de alineación imagen-texto y no de un modelo generativo de lenguaje, por lo que esas técnicas no aplican.

## Capacidades

- Clasificación de imágenes zero-shot: asignar etiquetas textuales arbitrarias a una imagen sin reentrenamiento.
- Recuperación imagen-texto y texto-imagen: búsqueda de imágenes por descripción y viceversa.
- Similitud imagen-texto: puntuación de compatibilidad entre una imagen y múltiples candidatos textuales mediante la sigmoide de los logits.
- Extracción de embeddings visuales y textuales para indexación y búsqueda vectorial.
- Integración con `transformers` mediante `AutoModel`, `AutoProcessor` y el pipeline `zero-shot-image-classification`.
- Uso como torre de visión en arquitecturas vision-language multimodales de mayor tamano.
- Capacidades multilingües: limitadas al inglés, dado que el entrenamiento se realizó con pares imagen-texto en inglés.
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso, modo thinking, audio ni generación de texto libre: es un modelo de representación y alineación, no un LLM.

## Casos de uso

- Moderación y etiquetado automático de contenido visual: clasificar imágenes entrantes contra un conjunto de categorías definidas por texto sin necesidad de entrenar un clasificador específico.
- Búsqueda semántica en bibliotecas de imágenes: generar embeddings de las imágenes y de las consultas textuales para recuperar las más relevantes por similitud.
- Organización de catálogos de producto en comercio electrónico: etiquetar automáticamente imágenes de artículos con categorías y atributos descritos en lenguaje natural.
- Filtrado y curación de datasets de visión: detectar y clasificar imágenes por contenido para depurar conjuntos de entrenamiento de otros modelos.
- Sistemas de recomendación visual: puntuar la afinidad entre una imagen y una descripción o preferencia textual del usuario para ordenar resultados.
- Accesibilidad: generar etiquetas y descripciones cortas a partir de vocabularios controlados para apoyar la descripción de imágenes.
- Verificación de contenido generado: comprobar la coherencia entre una imagen y su supuesto pie de foto o prompt de generación.
- Componente de pipelines multimodales: servir como encoder visual congelado en sistemas de captioning o VQA que aporten su propio decoder de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card referencia una tabla comparativa de SigLIP frente a CLIP tomada del artículo original, pero se incluye únicamente como imagen y no se especifican los valores concretos. Para cifras detalladas debe consultarse el artículo "Sigmoid Loss for Language Image Pre-Training" (arXiv:2303.15343).

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, aproximadamente 0,8 GB solo de pesos; en FP16, aproximadamente 0,4 GB; en INT8, aproximadamente 0,2 GB. Con activaciones y batch pequeno, el consumo real se mantiene por debajo de 2 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente. Funciona sin problema en RTX 3060, RTX 4060, RTX 4090, A100 y H100.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo moderna e incluso en iGPU con memoria compartida suficiente.
- CPU: es viable para inferencia puntual, aunque con mayor latencia que en GPU.
- Opciones de despliegue: Hugging Face Transformers (nativo, con `AutoModel` y pipeline), y exportación a formatos de inferencia como ONNX para servir en producción. No se documentan integraciones específicas con vLLM, TGI o llama.cpp, ya que no es un modelo generativo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada. Dado el tamano (204 M de parámetros) y la resolución de 512x512, se espera un coste por imagen bajo en GPU moderna, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolución | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SigLIP base patch16 512 (este modelo) | 203,8 M | 512x512, texto 64 tokens | Zero-shot clasificación y retrieval imagen-texto | apache-2.0 | Hugging Face |
| CLIP ViT-B/16 | no disponible en la información aportada | no disponible | Zero-shot clasificación y retrieval imagen-texto | no disponible | Hugging Face (OpenAI) |
| SigLIP base patch16 384 | no disponible en la información aportada | 384x384 | Zero-shot clasificación y retrieval imagen-texto | apache-2.0 | Hugging Face (google) |

La comparación numérica de rendimiento entre SigLIP y CLIP se remite al artículo original, ya que en la información disponible no se incluyen los valores de la tabla comparativa. Como referencia cualitativa, el artículo de SigLIP reporta mejoras frente a CLIP atribuidas a la pérdida sigmoidea, especialmente en regimenes de batch pequeno.

## Limitaciones y advertencias

- Entrenado exclusivamente con pares imagen-texto en inglés: el rendimiento en otros idiomas no está garantizado y puede degradarse notablemente.
- Riesgo de sesgos: al proceder de datos web a gran escala (WebLI), puede heredar sesgos demográficos, culturales y de representación presentes en esos datos.
- No es un modelo generativo: no produce texto ni imágenes, solo puntuaciones de similitud y embeddings.
- La longitud de texto está fijada a 64 tokens; descripciones más largas se truncan, lo que puede perder información relevante.
- Resolución fija de 512x512: las imágenes se redimensionan, lo que puede afectar a la clasificación de detalles finos.
- Riesgo de alucinación en el sentido de falsos positivos: puede asignar puntuaciones altas a etiquetas incorrectas cuando la imagen es ambigua o el vocabulario candidato es muy amplio.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda conservar la atribución y revisar los términos del dataset WebLI subyacente para usos derivados.
- Este repositorio es una réplica subida por CollectionStudio del modelo original de Google; para producción conviene verificar la integridad de los pesos frente al repositorio oficial `google/siglip-base-patch16-512`.
- Para tareas que requieran razonamiento, diálogo o generación, este modelo no es adecuado por sí solo y debe combinarse con un modelo de lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CollectionStudio/siglip-base-patch16-512
- Modelo original de Google: https://huggingface.co/google/siglip-base-patch16-512
- Artículo "Sigmoid Loss for Language Image Pre-Training": https://arxiv.org/abs/2303.15343
- Artículo de WebLI (Chen et al., 2023): https://arxiv.org/abs/2209.06794
- Repositorio de entrenamiento (big_vision): https://github.com/google-research/big_vision
- Documentación de SigLIP en Transformers: https://huggingface.co/docs/transformers/model_doc/siglip
- Documentación de CLIP en Transformers (referencia): https://huggingface.co/docs/transformers/model_doc/clip

# R2Squared/KERAFound-DINOv3-Photo

## Resumen

KERAFound-DINOv3-Photo es un modelo fundacional de visión por computador especializado en oftalmología, concretamente en el análisis del segmento anterior del ojo y la córnea. Lo desarrolla el usuario R2Squared y se publica en Hugging Face como un modelo de extracción de características de imagen (image-feature-extraction), construido sobre la arquitectura DINOv3 en su variante ViT-Large. Con 303 millones de parámetros, está pensado para servir como backbone de representaciones visuales que después se adaptan a tareas clínicas concretas mediante fine-tuning o cabezas de clasificación.

El modelo se apoya en el paradigma de los foundation models auto-supervisados: en lugar de entrenarse para una tarea específica, aprende representaciones generales que pueden transferirse a múltiples problemas downstream. En este caso, el dominio de especialización es la imagen del segmento anterior ocular, lo que lo hace potencialmente útil para segmentación corneal, detección de patologías y análisis de imágenes de lámpara de hendidura o topografía corneal.

Es relevante porque los modelos fundacionales específicos de dominio oftalmológico son escasos y suelen estar cerrados; este se distribuye con pesos en safetensors y licencia DINOv3, aunque con acceso restringido (gated) que exige aceptar condiciones en Hugging Face. La información pública disponible es muy limitada: no hay métricas de benchmarks, detalles de dataset ni documentación técnica publicada en la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Large) basado en DINOv3 |
| Parametros totales | 303.154.192 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, sin contexto textual definido) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de imagen, sin capacidades lingüísticas) |
| Licencia | dinov3-license |
| Formato de pesos | safetensors (librería pytorch) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer de visión en configuración ViT-Large, heredera de DINOv3, la familia de modelos auto-supervisados de Meta AI para representaciones visuales densas. DINOv3 se caracteriza por entrenarse con objetivos de destilación auto-supervisada que producen features de alta calidad transferibles, sin necesidad de etiquetas. El tamaño de 303 millones de parámetros es coherente con la variante Large de esta familia.

No se dispone de información pública sobre el dataset de entrenamiento específico, el número de imágenes utilizadas, la composición del corpus oftalmológico, ni si hubo fases de ajuste supervisado o preferencias. Tampoco se documentan innovaciones técnicas adicionales más allá de las propias de DINOv3. Toda esta información se considera no disponible en la ficha del modelo.

## Capacidades

- Extracción de características visuales (embeddings) de imágenes del segmento anterior ocular y córnea.
- Generación de representaciones densas utilizables como backbone para tareas downstream.
- Base para fine-tuning en clasificación, segmentación y detección de patologías oculares.
- Adecuado para image retrieval y búsqueda por similitud en bases de datos de imágenes clínicas.
- Soporte de transfer learning con pocas muestras (few-shot) gracias al preentrenamiento auto-supervisado.
- No dispone de capacidades de generación de texto, tool calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües ni de procesamiento de audio.

## Casos de uso

- Segmentación corneal automatizada: usar los embeddings del modelo como entrada a una cabeza de segmentación para delimitar córnea, limbo y conjuntiva en imágenes de lámpara de hendidura, aprovechando las representaciones densas de DINOv3.
- Detección de queratocono: fine-tuning de una capa de clasificación sobre las features del modelo para identificar signos topográficos de ectasia corneal en imágenes de segmento anterior.
- Clasificación de patologías de superficie ocular: adaptar el backbone para distinguir entre conjuntivitis, úlceras y otras afecciones a partir de fotografías clínicas.
- Búsqueda de casos similares (image retrieval): indexar los embeddings de un archivo hospitalario para recuperar imágenes con apariencia clínica parecida y apoyar la revisión de casos.
- Preentrenamiento de pipelines de investigación: servir como inicialización para modelos de análisis oftalmológico cuando el dataset etiquetado propio es reducido, reduciendo el coste de anotación.
- Control de calidad de imagen en cribado: usar la representación del modelo para detectar imágenes fuera de distribución o de baja calidad antes del análisis diagnóstico.
- Investigación en representaciones visuales médicas: comparar las features de un dominio oftalmológico frente a backbones generalistas en estudios de transferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,2 GB solo para pesos, más memoria de activaciones según resolución de imagen.
- VRAM estimada en fp16/bf16: en torno a 0,6 GB para pesos, más activaciones.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para inferencia en precisión reducida; A100 o H100 para entrenamiento y fine-tuning a gran escala.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y superiores, siempre que se ajuste el tamaño de lote y la resolución de entrada.
- Opciones de despliegue: PyTorch nativo, TorchScript, ONNX Runtime; para servir como API se puede usar TorchServe o FastAPI con el modelo cargado. No se documenta soporte de vLLM, llama.cpp ni Ollama, ya que no es un modelo generativo de texto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Dominio | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KERAFound-DINOv3-Photo | 303 M | Oftalmología (segmento anterior) | Imagen | dinov3-license | Gated en Hugging Face |
| DINOv3 ViT-L/16 (base) | ~300 M | Visión general | Imagen | dinov3-license | Público |
| RETFound | ~300 M | Retina (fondo de ojo) | Imagen | no disponible | Público con condiciones |
| MedSAM | ~90 M | Segmentación médica general | Imagen | Apache 2.0 | Público |

La comparativa con DINOv3 base es la más directa, ya que KERAFound-DINOv3-Photo es una especialización del mismo backbone. Frente a RETFound, la diferencia clave es el dominio: RETFound se centra en retina, mientras que este modelo aborda el segmento anterior. No se dispone de datos de rendimiento comparativo para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- No se han publicado métricas de rendimiento ni validación clínica, por lo que no debe usarse como herramienta diagnóstica sin evaluación independiente.
- El acceso es restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos.
- La licencia dinov3-license puede imponer restricciones al uso comercial; conviene revisar sus términos antes de integrarlo en productos.
- Riesgo de sesgo por dominio: si el dataset de entrenamiento no es diverso en etnias, dispositivos de captura o iluminación, las representaciones pueden degradarse en poblaciones no representadas.
- No es un modelo generativo ni conversacional: no responde a prompts de texto ni ejecuta instrucciones.
- La información técnica publicada es mínima, lo que dificulta reproducir el entrenamiento o auditar el modelo.
- Posible sobreajuste al dominio corneal si se aplica a otras regiones oculares o a imágenes no oftalmológicas.

## Enlaces

- Hugging Face: https://huggingface.co/R2Squared/KERAFound-DINOv3-Photo
- DINOv3 (Meta AI): no disponible en la información proporcionada
- Paper de DINOv3: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada

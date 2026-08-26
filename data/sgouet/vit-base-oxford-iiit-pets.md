# sgouet/vit-base-oxford-iiit-pets

## Resumen

El modelo `sgouet/vit-base-oxford-iiit-pets` es un ajuste fino (fine-tuning) del Vision Transformer preentrenado `google/vit-base-patch16-224` sobre el dataset Oxford-IIIT Pet, que contiene 7.349 imágenes de 37 razas de perros y gatos. Desarrollado por el usuario sgouet, el modelo está diseñado específicamente para la clasificación de razas de mascotas en imágenes, aprovechando el aprendizaje por transferencia para adaptar un modelo genérico de visión a esta tarea concreta. Con 85,8 millones de parámetros, mantiene la arquitectura ViT-Base con parches de 16x16 píxeles y entrada de 224x224, y se distribuye bajo licencia Apache 2.0.

La relevancia de este modelo radica en su simplicidad y eficacia como ejemplo de fine-tuning de un transformer de visión para una tarea de clasificación de dominio específico. Aunque no introduce innovaciones arquitectónicas, sirve como referencia educativa y práctica para quienes deseen entender el proceso de adaptación de modelos preentrenados a conjuntos de datos reducidos. El modelo alcanza una precisión del 94,45 % en el conjunto de evaluación, superando claramente a un enfoque zero-shot con CLIP (88 %), lo que demuestra el valor del ajuste fino supervisado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base/16) |
| Parametros totales | 85.827.109 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de vision) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de vision) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Vision Transformer (ViT) original de Dosovitskiy et al., concretamente la variante `google/vit-base-patch16-224`. Esta arquitectura divide la imagen de entrada en parches de 16x16 píxeles, los proyecta a un espacio de embeddings de 768 dimensiones y los procesa mediante 12 capas de transformer con 12 cabezas de atención. La cabeza de clasificación original de ImageNet (1000 clases) se sustituye por una nueva capa lineal con 37 salidas, correspondientes a las razas del dataset Oxford-IIIT Pet.

El entrenamiento se realizó mediante transfer learning, ajustando todos los parámetros del modelo de forma end-to-end con una pérdida de clasificación estándar (cross-entropy). Se utilizaron los siguientes hiperparámetros: learning rate de 0,0003, tamaño de lote de 16 para entrenamiento y 8 para evaluación, optimizador AdamW con betas (0,9, 0,999) y épsilon 1e-8, programador de tasa de aprendizaje lineal y 5 épocas. El dataset de entrenamiento proviene de `pcuenq/oxford-pets`, que incluye 7.349 imágenes con una distribución equilibrada de razas y una partición estándar en entrenamiento, validación y prueba. No se emplearon técnicas de aumento de datos adicionales más allá de las estándar de los pipelines de Hugging Face.

## Capacidades

- Clasificación de imágenes en 37 clases de razas de perros y gatos (por ejemplo, siamés, persa, chihuahua, etc.).
- Inferencia sobre imágenes de entrada de 224x224 píxeles, con normalización estándar de ImageNet.
- Aprovechamiento de características visuales genéricas aprendidas en ImageNet, adaptadas al dominio de mascotas.
- No soporta generación de texto, tool calling, agentes ni razonamiento multimodal; es exclusivamente un clasificador de imágenes.
- Capacidad de comparación con modelos zero-shot como CLIP, aunque con rendimiento superior al estar ajustado específicamente.

## Casos de uso

- Aplicaciones de identificación de razas de mascotas: el modelo puede integrarse en una app móvil o web que reciba una foto de un perro o gato y devuelva la raza más probable, gracias a su precisión del 94,45 % en el conjunto de evaluación.
- Demostraciones educativas de transfer learning: sirve como ejemplo práctico para cursos o tutoriales que expliquen cómo adaptar un ViT preentrenado a un dataset pequeño, mostrando el flujo completo de fine-tuning con Hugging Face Transformers.
- Organización automática de álbumes de fotos: puede clasificar imágenes de mascotas en colecciones personales, etiquetando cada foto con la raza correspondiente para facilitar la búsqueda y el filtrado.
- Comparación de metodologías: útil para evaluar la diferencia de rendimiento entre un modelo ajustado supervisado y un modelo zero-shot como CLIP, en escenarios de investigación o docencia.
- Sistemas de recomendación de cuidados veterinarios: aunque no es apto para diagnóstico, puede usarse como entrada para sugerir guías de cuidado específicas por raza en plataformas de contenido.
- Automatización de tareas de moderación en redes sociales: clasificar imágenes de mascotas en categorías predefinidas para su etiquetado o filtrado en comunidades temáticas.

## Benchmarks y rendimiento

La model card no incluye resultados en el `model-index` (campo `results: []`), pero sí reporta métricas de evaluación obtenidas durante el entrenamiento. La siguiente tabla resume la evolución de la pérdida y precisión de validación a lo largo de las 5 épocas:

| Epoca | Perdida de entrenamiento | Perdida de validacion | Precision |
|:-----:|:------------------------:|:----------------------:|:---------:|
| 1     | 0,3716                   | 0,3013                 | 0,9242    |
| 2     | 0,2048                   | 0,2342                 | 0,9310    |
| 3     | 0,1764                   | 0,2124                 | 0,9350    |
| 4     | 0,1617                   | 0,2050                 | 0,9350    |
| 5     | 0,1235                   | 0,2032                 | 0,9350    |

Además, la model card declara una precisión final de evaluación de 0,9445 y una pérdida de 0,1924, ligeramente mejores que los valores de la última época de validación. También se realizó una evaluación comparativa con el modelo zero-shot `openai/clip-vit-base-patch32` sobre el mismo dataset, obteniendo los siguientes resultados:

| Modelo | Precision | Precision (macro) | Recall |
|--------|-----------|-------------------|--------|
| vit-base-oxford-iiit-pets (fine-tuned) | 0,9445 | no disponible | no disponible |
| openai/clip-vit-base-patch32 (zero-shot) | 0,8800 | 0,8768 | 0,8800 |

## Requisitos de hardware

- VRAM estimada: el modelo tiene 85,8 millones de parámetros. En FP32 ocupa aproximadamente 344 MB, en FP16 unos 172 MB. La inferencia puede ejecutarse en cualquier GPU con al menos 1 GB de VRAM, incluyendo GPUs integradas o tarjetas muy modestas.
- GPU recomendadas: cualquier GPU moderna, desde una NVIDIA GTX 1650 hasta una RTX 4090 o A100. También es viable en CPU, aunque con mayor latencia.
- Compatibilidad con GPUs de consumo: sí, cabe sin problemas en tarjetas como RTX 3060, RTX 4060, etc., incluso con lotes pequeños.
- Opciones de despliegue: al ser un modelo estándar de Transformers, puede servirse con vLLM, Hugging Face Inference Endpoints, TorchServe o mediante la API de `transformers` en un script Python. También es compatible con `safetensors` para carga eficiente.
- Latencia y throughput: en una GPU moderna (por ejemplo, RTX 3090), la inferencia de una sola imagen tarda del orden de 5-10 ms. En CPU, puede rondar los 50-100 ms por imagen, dependiendo del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision en Oxford Pets | Licencia | Disponibilidad |
|--------|------------|----------|--------------------------|----------|----------------|
| sgouet/vit-base-oxford-iiit-pets | 85,8 M | No aplica | 0,9445 | Apache 2.0 | Hugging Face |
| google/vit-base-patch16-224 (base) | 85,8 M | No aplica | No evaluado en Oxford Pets | Apache 2.0 | Hugging Face |
| openai/clip-vit-base-patch32 (zero-shot) | 151 M | No aplica | 0,8800 | MIT | Hugging Face |

El modelo fine-tuned supera al enfoque zero-shot de CLIP en 6,45 puntos porcentuales de precisión, lo que confirma la ventaja del ajuste supervisado cuando se dispone de datos etiquetados. Frente al modelo base sin ajuste, no se dispone de métricas directas sobre Oxford Pets, pero se espera que el fine-tuning mejore sustancialmente el rendimiento en esta tarea específica.

## Limitaciones y advertencias

- El modelo solo reconoce las 37 razas presentes en el dataset Oxford-IIIT Pet; no generaliza a otras razas o variedades no incluidas.
- No es adecuado para aplicaciones médicas, veterinarias o de seguridad crítica, ya que su precisión no es suficiente para diagnósticos fiables.
- Las imágenes de entrada deben ser claras, centradas y similares en estilo a los retratos de mascotas del dataset; imágenes con fondos complejos, múltiples animales o baja iluminación pueden degradar el rendimiento.
- No se han documentado sesgos específicos, pero al entrenarse sobre un dataset relativamente pequeño, puede haber desequilibrios en la representación de ciertas razas o condiciones de captura.
- Riesgo de alucinación: al ser un clasificador, no genera texto, por lo que el riesgo de alucinación es bajo; sin embargo, puede producir clasificaciones erróneas con alta confianza en entradas fuera de distribución.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero se recomienda verificar la procedencia del dataset Oxford-IIIT Pet para posibles limitaciones de uso comercial de los datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sgouet/vit-base-oxford-iiit-pets
- Modelo base: https://huggingface.co/google/vit-base-patch16-224
- Dataset Oxford-IIIT Pet: https://huggingface.co/datasets/pcuenq/oxford-pets
- Modelo CLIP usado en la comparativa: https://huggingface.co/openai/clip-vit-base-patch32
- Referencia de un fine-tuning similar: https://huggingface.co/ferzanagehringer/vit-base-oxford-iiit-pets
- Análisis en OpenModelMap: https://openmodelmap.com/model/ISxOdin/vit-base-oxford-iiit-pets

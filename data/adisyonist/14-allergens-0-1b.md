# adisyonist/14-allergens-0.1B

## Resumen

El modelo `adisyonist/14-allergens-0.1B` es un clasificador de texto multilingüe diseñado para identificar información sobre alérgenos en descripciones cortas de menús. Desarrollado por Adisyonist AI (Hasan Çağrı Güngör), el modelo está pensado para integrarse en software de restauración, normalización de menús, búsqueda de recetas y prototipado de aplicaciones de seguridad alimentaria. Su vocabulario cubre los 14 alérgenos principales reconocidos por la normativa europea: apio, crustáceos, huevos, pescado, gluten, altramuz, leche, moluscos, mostaza, frutos de cáscara, cacahuetes, sésamo, soja y sulfitos.

Con 117,6 millones de parámetros (aproximadamente 0,1B), el modelo se distribuye en formato safetensors y está etiquetado como basado en arquitectura BERT, aunque la model card no especifica la variante exacta. Su principal valor reside en su carácter multilingüe: soporta más de 40 idiomas, lo que lo hace adecuado para aplicaciones globales de análisis de menús. El repositorio incluye un dataset asociado con 131.825 registros JSONL, disponible públicamente. No se publican resultados de benchmarks ni detalles de entrenamiento, por lo que su rendimiento debe evaluarse de forma independiente antes de su uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en BERT (según etiquetas del repositorio; variante no especificada) |
| Parametros totales | 117.659.150 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, tr, bn, ca, hr, cs, da, nl, fi, fr, de, el, gu, he, hi, hu, id, it, ja, kn, ko, ms, ml, mr, nb, or, pl, pt, pa, ro, ru, sk, sl, es, sv, ta, te, th, uk, ur, vi, zh |
| Licencia | no disponible (revisar archivos del repositorio) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura base exacta, los hiperparámetros, los recursos de cómputo ni las métricas de evaluación utilizadas. Los tags del repositorio indican que se trata de un modelo de clasificación de texto basado en BERT, pero no se detalla si es una variante preentrenada (como `bert-base-multilingual-cased` o similar) o un modelo entrenado desde cero. El dataset de entrenamiento, publicado en `adisyonist/14-allergens`, contiene 131.825 registros JSONL con pares de texto de menús y etiquetas de los 14 alérgenos. No se menciona el uso de técnicas como RLHF o DPO; el entrenamiento parece ser de tipo supervisado clásico para clasificación multiclase o multi-etiqueta. Tampoco se indica el número de tokens de entrenamiento ni la composición detallada del corpus.

## Capacidades

- Clasificación de alérgenos en texto de menús: identifica la presencia de los 14 alérgenos regulados (celery, crustaceans, eggs, fish, gluten, lupin, milk, mollusks, mustard, nuts, peanuts, sesame, soy, sulfites) en descripciones cortas de platos.
- Extracción de información alimentaria: puede utilizarse para extraer menciones de ingredientes alergénicos de textos no estructurados.
- Soporte multilingüe: cubre más de 40 idiomas, incluyendo europeos, asiáticos y de Oriente Medio, lo que facilita su uso en entornos internacionales.
- Asistencia en normalización de menús: ayuda a estandarizar descripciones de platos y a generar etiquetas de alérgenos para bases de datos.
- Generación de candidatos para revisión humana: el modelo produce etiquetas probables que pueden ser verificadas por personal cualificado antes de su publicación.
- Compatible con pipelines de transformers: se integra fácilmente con la librería `transformers` y con soluciones de inferencia como Text Embeddings Inference (TEI) o endpoints compatibles.

## Casos de uso

- Software de gestión para restaurantes: el modelo puede procesar automáticamente las descripciones de los platos de un menú digital y marcar los alérgenos presentes, reduciendo el trabajo manual del personal. Su naturaleza multilingüe permite manejar menús en varios idiomas sin necesidad de modelos separados.
- Normalización de menús para plataformas de entrega a domicilio: al integrarse en el backend de una plataforma, puede estandarizar las etiquetas de alérgenos de miles de restaurantes, garantizando coherencia en la información mostrada al consumidor.
- Búsqueda y filtrado de recetas: en aplicaciones de recetas, el modelo puede clasificar los ingredientes de cada receta y permitir a los usuarios filtrar por alérgenos específicos, mejorando la experiencia de búsqueda.
- Prototipado de aplicaciones de seguridad alimentaria: desarrolladores pueden usar el modelo como base para crear prototipos de herramientas de análisis de menús, validando su viabilidad antes de invertir en soluciones más complejas.
- Asistencia en traducción de menús: al identificar alérgenos en el texto original, el modelo puede ayudar a los traductores a mantener la información crítica de alérgenos en las versiones traducidas, evitando omisiones.
- Generación de etiquetas para bases de datos de alimentos: el modelo puede procesar grandes volúmenes de descripciones de productos y generar etiquetas de alérgenos que luego son revisadas por expertos, acelerando la creación de catálogos alimentarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se reclaman métricas de evaluación. Se recomienda evaluar el modelo sobre datos representativos e independientemente revisados antes de su despliegue.

## Requisitos de hardware

- Al tratarse de un modelo de aproximadamente 117 millones de parámetros, la inferencia es ligera y puede ejecutarse en GPUs de consumo.
- VRAM estimada: con pesos en precisión FP32, el modelo ocupa unos 470 MB; en FP16 o cuantización de 8 bits, el uso de VRAM sería inferior a 500 MB. Para inferencia por lotes pequeños, una GPU con 2 GB de VRAM sería suficiente.
- GPUs recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3060, o superiores) puede manejar el modelo sin problemas. También es viable en CPU para cargas bajas.
- Opciones de despliegue: al ser compatible con `transformers`, puede servirse con vLLM, Text Generation Inference (TGI), o mediante la API de Hugging Face Inference Endpoints. También es posible exportarlo a ONNX o TensorRT para optimización.
- Latencia y throughput: no se dispone de datos oficiales, pero por el tamaño del modelo se espera una latencia de milisegundos por muestra en GPU y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos en la misma categoría (clasificación de alérgenos en menús). Existen otros modelos de clasificación de texto multilingües como `bert-base-multilingual-cased` o `xlm-roberta-base`, pero no están especializados en alérgenos y no se han comparado directamente con este modelo. La comparativa queda pendiente de que el autor publique datos de evaluación o de que la comunidad realice estudios independientes.

## Limitaciones y advertencias

- La model card advierte que el modelo y los datos pueden contener errores, omisiones, artefactos de traducción y diferencias específicas de recetas.
- Las predicciones no constituyen consejo médico y no deben utilizarse como única base para decisiones sobre alergias, seguridad alimentaria, servicio de restauración o salud.
- La información sobre ingredientes, métodos de preparación y contaminación cruzada debe ser verificada por profesionales cualificados antes de su uso en entornos reales.
- No se especifica la licencia del modelo ni del dataset; es necesario revisar los archivos del repositorio antes de cualquier redistribución o uso comercial.
- No se han publicado resultados de evaluación, por lo que el rendimiento real en tareas específicas es desconocido.
- La longitud de contexto no está documentada; para descripciones de menús muy largas podría ser necesario truncar o dividir el texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adisyonist/14-allergens-0.1B
- Dataset asociado: https://huggingface.co/datasets/adisyonist/14-allergens
- Organización Adisyonist AI: https://huggingface.co/adisyonist/models
- Modelo relacionado (waiter-1B): https://huggingface.co/adisyonist/waiter-1B

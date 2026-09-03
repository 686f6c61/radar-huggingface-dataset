# ausjahk/fruit-fresh-rotten-cnn-from-scratch

## Resumen

El modelo `ausjahk/fruit-fresh-rotten-cnn-from-scratch` es un clasificador de imagenes basado en una red neuronal convolucional (CNN) entrenada desde cero por el desarrollador ausjahk. Su objetivo es distinguir entre frutas frescas y podridas en un conjunto de seis clases: manzanas frescas, platanos frescos, naranjas frescas, manzanas podridas, platanos podridos y naranjas podridas.

El modelo se entreno con pesos aleatorios sobre el dataset de Kaggle de frutas frescas/podridas, alcanzando una precision del 93,58 % en el conjunto de test. Con un total de 4 585 478 parametros, es un modelo ligero y compacto, adecuado para tareas de clasificacion de imagenes en entornos con recursos limitados. No se ha publicado informacion sobre la arquitectura detallada, el proceso de entrenamiento ni la licencia del modelo.

A pesar de que el modelo no cuenta con descargas ni valoraciones en el momento de la consulta, su publicacion en HuggingFace lo hace accesible para su uso en aplicaciones de control de calidad, agricultura de precision y educacion en vision artificial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (red neuronal convolucional) |
| Parametros totales | 4 585 478 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision) |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo es una red neuronal convolucional personalizada, entrenada desde cero con pesos aleatorios. No se ha publicado informacion sobre el numero de capas, el tipo de bloques convolucionales, las funciones de activacion ni las tecnicas de regularizacion utilizadas. El entrenamiento se realizo sobre el dataset de Kaggle de frutas frescas y podridas, que incluye imagenes de manzanas, platanos y naranjas en dos estados de frescura. No se dispone de datos sobre el numero de imagenes de entrenamiento, el numero de epocas, el optimizador ni la funcion de perdida. Tampoco se han aplicado tecnicas como RLHF o DPO, ya que se trata de un modelo de clasificacion supervisada clasica y no de un modelo de lenguaje.

La unica metrica publicada es una precision del 93,58 % en el conjunto de test. No se detalla si el dataset de test fue estratificado ni si se aplicaron tecnicas de aumento de datos durante el entrenamiento.

## Capacidades

- Clasificacion de imagenes en seis clases: `freshapples`, `freshbanana`, `freshoranges`, `rottenapples`, `rottenbanana` y `rottenoranges`.
- Distincion entre frutas frescas y podridas a partir de patrones visuales como color, textura y degradacion superficial.
- Inferencia ligera gracias a sus 4,5 millones de parametros, lo que permite su ejecucion en dispositivos con recursos limitados.
- No soporta tool calling, function calling, razonamiento multi-paso, ni capacidades multilingues por tratarse de un modelo de vision de proposito especifico.
- No incluye modo de pensamiento, vision adicional ni procesamiento de audio.

## Casos de uso

- Control de calidad en supermercados: el modelo puede integrarse en un sistema de vision que revise frutas en cintas transportadoras para descartar automaticamente las que esten podridas. Su tamano reducido permite ejecutarlo en camaras de inferencia locales sin necesidad de servidores potentes.
- Clasificacion en almacenes de distribucion de alimentos: puede utilizarse para clasificar lotes de frutas antes de su envio, reduciendo el desperdicio y mejorando la eficiencia logistica. La precision del 93,58 % ofrece un punto de partida razonable para tareas de cribado.
- Aplicacion movil para consumidores: el modelo puede exportarse a formato ONNX o Core ML e integrarse en una app que permita al usuario fotografiar una fruta y recibir una indicacion sobre su frescura. Su bajo numero de parametros favorece la ejecucion en dispositivos moviles.
- Automatizacion en plantas de procesado de alimentos: en lineas de envasado o preparacion, el modelo puede clasificar frutas antes de su procesamiento, ayudando a separar las que no cumplen los estandares de calidad.
- Agricultura de precision: los agricultores pueden usar el modelo para evaluar la calidad de la cosecha en el campo, fotografando muestras y obteniendo una clasificacion rapida de frescura.
- Educacion y demostracion de vision artificial: al ser una CNN entrenada desde cero, el modelo sirve como ejemplo didactico para estudiantes que quieran aprender a construir y desplegar clasificadores de imagenes con PyTorch.
- Investigacion como baseline: puede utilizarse como modelo de referencia para comparar con arquitecturas mas complejas o con modelos preentrenados en tareas de clasificacion de frutas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precision en test (dataset Kaggle de frutas) | 93,58 % |

No se han publicado resultados de benchmarks adicionales (como MMLU, HumanEval o GSM8K) en la informacion disponible. Tampoco se ha proporcionado una comparacion con otros modelos en el mismo dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4 585 478 parametros, el modelo ocupa aproximadamente 18 MB en FP32 (4 585 478 x 4 bytes). Esto implica que puede ejecutarse en practicamente cualquier GPU con mas de 1 GB de VRAM.
- GPU recomendadas: no se dispone de datos de referencia. Dado el tamano del modelo, cualquier GPU moderna con mas de 1 GB de VRAM es suficiente, incluyendo GPUs de consumo como RTX 3060 o superiores.
- Compatibilidad con GPU de consumo: si, el modelo cabe en cualquier GPU de consumo actual e incluso en CPU para inferencias no criticas en tiempo real.
- Opciones de despliegue: al ser un modelo PyTorch, puede desplegarse directamente con PyTorch, TorchServe, o convertirse a ONNX Runtime para su integracion en otros entornos. No se ha confirmado la compatibilidad con vLLM, llama.cpp, Ollama o TGI, ya que son herramientas orientadas a modelos de lenguaje.
- Latencia y throughput: no se dispone de datos medidos de latencia o throughput en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|
| ausjahk/fruit-fresh-rotten-cnn-from-scratch | 4 585 478 | 93,58 % (test) | no disponible | HuggingFace |
| Raj-Rathod-Ai/FruitsCheck-CNN-Fruit-Freshness | no disponible | no disponible | no disponible | GitHub |
| Bangkit-JKT2-D/fruits-fresh-rotten-classification | no disponible | no disponible | no disponible | GitHub (Colab) |

Los dos proyectos alternativos encontrados en la busqueda web abordan la misma tarea de clasificacion de frutas frescas vs podridas, pero no se han publicado datos de parametros ni de rendimiento que permitan una comparacion cuantitativa directa.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha publicado informacion sobre sesgos. Al estar entrenado en un dataset de Kaggle con seis clases especificas, el modelo puede presentar sesgos hacia esas frutas y no generalizar a otras variedades o condiciones de iluminacion.
- Riesgo de clasificacion erronea: con una precision del 93,58 %, existe un margen de error del 6,42 % que puede suponer falsos positivos o negativos en aplicaciones criticas.
- Limitaciones de contexto o idioma: no aplica, al ser un modelo de vision y no de lenguaje.
- Restricciones de licencia: la licencia no esta disponible, por lo que no se puede garantizar la seguridad juridica para uso comercial. Es recomendable contactar con el autor antes de utilizar el modelo en produccion.
- Caveat para produccion: el modelo no incluye informacion sobre el preprocesado exacto de las imagenes (tamano, normalizacion, etc.), lo que puede dificultar su reproduccion e integracion en pipelines existentes.

## Enlaces

- HuggingFace: https://huggingface.co/ausjahk/fruit-fresh-rotten-cnn-from-scratch
- Proyecto similar en GitHub: https://github.com/Raj-Rathod-Ai/FruitsCheck-CNN-Fruit-Freshness
- Notebook de Colab de clasificacion de frutas: https://colab.research.google.com/github/Bangkit-JKT2-D/fruits-fresh-rotten-classification/blob/master/fresh_rotten_fruit_baseline.ipynb

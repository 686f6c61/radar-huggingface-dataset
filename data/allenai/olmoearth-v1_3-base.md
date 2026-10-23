# allenai/OlmoEarth-v1_3-Base

## Resumen

OlmoEarth-v1_3-Base es un modelo fundacional de visión por computador desarrollado por Ai2 (Allen Institute for AI) para tareas de teledetección sobre imágenes y series temporales de imágenes de los satélites Sentinel-1, Sentinel-2 y Landsat. No es un modelo de lenguaje: su pipeline declarado en HuggingFace es `image-feature-extraction`, y su función es producir representaciones vectoriales (embeddings) de alta calidad que sirvan como base para tareas downstream como segmentación, clasificación de coberturas del suelo o detección de cambios.

El núcleo del modelo es un ViT-Base de 128 millones de parámetros, acompañado de un Perceiver de 14,3 millones de parámetros y de un «student» lineal de 0,1 millones que proyecta los tokens de 768 dimensiones a embeddings globales de 128 dimensiones. Este conjunto, incluido el student, es el que Ai2 utiliza para generar los embeddings globales anualizados de la plataforma OlmoEarth.

Su relevancia actual reside en dos factores: por un lado, cubre tres familias de sensores con características muy distintas (radar de apertura sintética en Sentinel-1, multiespectral óptico en Sentinel-2 y Landsat), lo que permite abordar nubes y condiciones de iluminación adversas; por otro, Ai2 publica no solo los pesos, sino también el repositorio de preentrenamiento, tutoriales de fine-tuning e integración con `rslearn`, lo que reduce la barrera de entrada para equipos que quieran adaptarlo a sus propios datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision transformer (ViT-Base) + Perceiver (14,3M) + student lineal (0,1M) |
| Parametros totales | 128M (ViT-Base) + 14,3M (Perceiver) + 0,1M (student) = aproximadamente 142,4M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de vision; procesa imagenes y series temporales de imagenes) |
| Tipos de cuantizacion | no disponible en la model card |
| Idiomas soportados | no aplica (modelo de vision; la model card no declara idiomas) |
| Licencia | OlmoEarth Artifact License (etiquetada como `other` en HuggingFace) |
| Formato de pesos | no disponible en la model card; repositorio de 3,5 GB en HuggingFace |
| Modalidades de entrada | Sentinel-1, Sentinel-2 y Landsat (imagenes y series temporales) |
| Dimension del embedding | 768 dimensiones por token; 128 dimensiones en el embedding global del student |
| Tarea declarada | `image-feature-extraction` |

## Arquitectura y entrenamiento

La arquitectura combina un ViT-Base de 128M de parámetros que procesa las imágenes (o secuencias temporales de imágenes) de cada sensor, un Perceiver de 14,3M que agrega y contextualiza la información a lo largo de la dimensión temporal y entre sensores, y una cabeza lineal («student») de 0,1M que proyecta los tokens de 768 dimensiones a un embedding compacto de 128 dimensiones. Ese student es la pieza que Ai2 emplea en producción para generar los embeddings globales anualizados de la plataforma OlmoEarth, lo que sugiere un diseño deliberado de compacidad: 128 dimensiones reducen drásticamente el coste de almacenamiento y de búsqueda vectorial a escala planetaria frente a los 768 del backbone.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron etapas de RLHF o DPO (poco habituales en modelos de visión). Tampoco se especifican en la model card las innovaciones de entrenamiento más allá de la combinación multi-sensor y del esquema teacher-student implícito en la presencia del student lineal. Para esos detalles es necesario consultar el paper y el repositorio de preentrenamiento enlazados por el autor.

## Capacidades

- Extracción de características visuales: genera tokens de 768 dimensiones y embeddings globales de 128 dimensiones a partir de imágenes satelitales.
- Procesamiento multi-sensor: soporta Sentinel-1 (radar), Sentinel-2 (óptico multiespectral) y Landsat, lo que permite combinar observaciones ópticas y de radar.
- Series temporales: el modelo está descrito explícitamente para imágenes y series temporales de imágenes, no solo para escenas individuales.
- Fine-tuning para tareas downstream: la documentación del autor incluye tutoriales específicos para segmentación y para adaptación con `rslearn`.
- Uso como backbone congelado: al ser un modelo de extracción de características, es adecuado para evaluación mediante linear probe o para pocas etiquetas.
- Generación de embeddings a escala global: es el modelo empleado por la plataforma OlmoEarth para producir sus embeddings anualizados.
- Sin soporte de tool calling, function calling ni agentes: no es un modelo generativo de texto ni un LLM.
- Sin capacidades de generación de texto, código, matemáticas ni audio: no aplica a este tipo de modelo.
- Multilingüismo: no aplica; no se declaran idiomas en la model card.

## Casos de uso

- Segmentación de coberturas del suelo y cultivos: partiendo de los pesos preentrenados y siguiendo el tutorial de fine-tuning para segmentación con `olmoearth_run`, se puede adaptar el modelo a un mapa de clases propio (por ejemplo, tipos de cultivo o usos del suelo) con un conjunto etiquetado reducido.
- Monitorización de deforestación y cambios: el soporte de series temporales permite comparar observaciones de distintas fechas sobre la misma parcela y entrenar detectores de cambio sobre los embeddings resultantes.
- Respuesta a inundaciones y emergencias: al aceptar Sentinel-1, el modelo puede generar representaciones en presencia de nubes, algo crítico cuando el evento y la ventana de observación coinciden con cobertura nubosa.
- Búsqueda por similitud sobre archivos satelitales: los embeddings de 128 dimensiones son lo bastante compactos como para indexarse en bases de datos vectoriales y permitir consultas del tipo «encuentra parcelas con una firma temporal similar a esta», reduciendo el coste de almacenamiento frente a embeddings de 768 dimensiones.
- Seguros agrarios y estimación de superficies: extracción de embeddings por parcela y anualidad para alimentar modelos ligeros de clasificación o de regresión sobre superficie sembrada y estado fenológico.
- Analítica fenológica con series temporales: caracterización de la evolución de una parcela a lo largo del año combinando Landsat (resolución temporal histórica) y Sentinel-2 (mayor resolución espacial y temporal reciente).
- Backbone para equipos con pocos datos etiquetados: uso del modelo congelado más un clasificador lineal, una práctica habitual cuando el coste de etiquetar imagen satelital es alto.
- Integración en pipelines geoespaciales existentes: la documentación de Ai2 incluye ejemplos con `rslearn`, lo que facilita incorporar el modelo a flujos de descarga, recorte de teselas e inferencia por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al paper (`https://allenai.org/papers/olmoearth_v1_3`) para los detalles y las evaluaciones, pero no incluye cifras de MMLU, HumanEval, GSM8K ni de métricas propias de teledetección (IoU de segmentación, mAP de clasificación, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone de 128M de parámetros ocupa aproximadamente 0,5 GB en FP32 y 0,26 GB en FP16/BF16; sumando el Perceiver y el student, el conjunto ronda los 0,55 GB en FP32. A esto hay que añadir las activaciones, que dependen del tamaño de tesela y del número de pasos temporales; en la práctica, una estimación razonable es menos de 2 GB para lotes pequeños en FP16. Estas cifras son estimaciones derivadas del recuento de parámetros, no valores publicados por el autor.
- GPU recomendadas: para desarrollo y pruebas, cualquier GPU consumer con 6-8 GB o más (RTX 3060, RTX 4060, RTX 4070) es suficiente. Para generación de embeddings a escala de archivos completos, conviene una GPU de centro de datos (A10G, L4, A100 o H100) por throughput y por capacidad de procesar lotes grandes.
- Cabe en GPU consumer: sí, con holgura, dado el tamaño del modelo; el cuello de botella previsible será el I/O de datos satelitales y el preprocesado, no la VRAM.
- Opciones de despliegue: el pipeline natural es PyTorch en HuggingFace `transformers`/`timm`, con posibilidad de exportación a ONNX o TorchScript y uso de `torch.compile`. No aplica llama.cpp, Ollama ni formatos GGUF, al no ser un modelo de lenguaje. Para servir embeddings a gran escala, un servidor con batching dinámico (por ejemplo, TorchServe o un servicio FastAPI con lotes) es más adecuado que vLLM o TGI, orientados a modelos generativos de texto.
- Latencia y throughput: no disponible en la información proporcionada. Dependerá del tamaño de tesela, del número de pasos temporales y de la GPU empleada.

## Comparativa con modelos similares

No se han proporcionado datos verificados de modelos alternativos en la información disponible. A continuación se indica la comparación posible con los datos confirmados de OlmoEarth y se marcan como «no disponible» los campos de los que esta ficha no tiene cifras contrastadas.

| Modelo | Parametros | Modalidades | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| OlmoEarth-v1_3-Base | 128M (ViT-B) + 14,3M (Perceiver) + 0,1M (student) | Sentinel-1, Sentinel-2, Landsat; imagenes y series temporales | OlmoEarth Artifact License (`other`) | HuggingFace `allenai/OlmoEarth-v1_3-Base`; 157 descargas y 12 likes en el momento de la consulta | Incluye student lineal para embeddings de 128 dimensiones |
| Prithvi (IBM/NASA) | no disponible en esta ficha | teledeteccion optica | no disponible en esta ficha | no disponible en esta ficha | Candidato natural a comparacion por dominio y tamano de backbone |
| Clay | no disponible en esta ficha | teledeteccion | no disponible en esta ficha | no disponible en esta ficha | Candidato natural a comparacion como modelo fundacional geoespacial |
| SatMAE | no disponible en esta ficha | teledeteccion | no disponible en esta ficha | no disponible en esta ficha | Referencia academica habitual en preentrenamiento para teledeteccion |

La conclusión honesta es que esta ficha no puede establecer una comparación cuantitativa: no hay benchmarks publicados en la información disponible ni cifras verificadas de los competidores. Cualquier comparación de rendimiento requeriría consultar el paper de OlmoEarth y las publicaciones de cada alternativa, y evaluar sobre el mismo conjunto de tareas downstream.

## Limitaciones y advertencias

- Licencia restrictiva: el modelo se distribuye bajo la OlmoEarth Artifact License, etiquetada como `other` en HuggingFace. Antes de cualquier uso comercial es imprescindible revisar el texto completo de `LICENSE.txt`; no es una licencia permisiva tipo Apache 2.0 o MIT.
- Directrices de uso responsable: Ai2 exige el uso conforme a sus Responsible Use Guidelines, lo que puede imponer restricciones adicionales más allá de la licencia.
- Ausencia de benchmarks en la información disponible: no se pueden anticipar cifras de rendimiento en tareas downstream sin evaluar el modelo sobre datos propios.
- Sesgos geográficos y de sensor no documentados: la model card no detalla la distribución geográfica del dataset de entrenamiento ni el equilibrio entre sensores; es esperable que el rendimiento varíe según la región y la disponibilidad de observaciones, pero no hay datos que lo cuantifiquen.
- Dependencia de la resolución y del preprocesado: al trabajar con Sentinel-1, Sentinel-2 y Landsat, cuyas resoluciones espaciales y espectrales difieren, los resultados son sensibles a la pipeline de teselado y remuestreo; la documentación enlazada (`rslearn`) es el punto de partida recomendado.
- Alucinación: el concepto no aplica en sentido estricto al no ser un modelo generativo, pero los embeddings pueden producir similitudes espurias si se consultan fuera del dominio de entrenamiento; conviene validar con datos etiquetados de la zona de interés.
- Idiomas: no aplica; no debe evaluarse como modelo multilingüe.
- Ambigüedad del repositorio de 3,5 GB: el tamaño del repo no se corresponde con un único checkpoint de 128M de parámetros, por lo que probablemente contiene varios pesos (backbone, Perceiver, student); conviene verificar qué ficheros corresponden a cada componente antes de desplegar.
- Fechas del repositorio: la model card indica creación el 2026-09-04 y última actualización el 2026-10-13, lo que sugiere un modelo reciente con posible evolución de pesos y documentación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/allenai/OlmoEarth-v1_3-Base
- Repositorio de preentrenamiento: https://github.com/allenai/olmoearth_pretrain
- Paper: https://allenai.org/papers/olmoearth_v1_3
- Tutorial de fine-tuning para segmentación con `olmoearth_run`: https://github.com/allenai/olmoearth_projects/blob/main/docs/tutorials/FinetuneOlmoEarthSegmentation.md
- Tutorial de cálculo de embeddings con `rslearn`: https://github.com/allenai/rslearn/blob/master/docs/examples/OlmoEarthEmbeddings.md
- Tutorial de fine-tuning con `rslearn`: https://github.com/allenai/rslearn/blob/master/docs/examples/FinetuneOlmoEarth.md
- Plataforma OlmoEarth: https://olmoearth.allenai.org/
- Formulario de acceso y actualizaciones de la plataforma: https://3ioxm.share.hsforms.com/23TW_rZwBSfauI1R3t0tdTQ
- Directrices de uso responsable de Ai2: https://allenai.org/responsible-use
- Licencia del modelo: `LICENSE.txt` en el repositorio de HuggingFace

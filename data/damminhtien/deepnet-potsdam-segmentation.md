# damminhtien/deepnet-potsdam-segmentation

## Resumen

DeepNet Potsdam segmentation es un paquete de pesos publicado en Hugging Face por el autor damminhtien que reúne los cuatro sistemas de segmentación semántica comparados en su portfolio de investigación DeepNet sobre el conjunto ISPRS Potsdam. No se trata de un modelo generativo ni de un LLM, sino de un repositorio de state dictionaries finales para segmentación semántica de imágenes aéreas de muy alta resolución, orientado a la extracción automática de objetos urbanos (edificios, vegetación, superficies impermeables, vehículos, etc.) a partir de datos adquiridos por sensores aerotransportados.

El bundle incluye cuatro recetas completas: DINOv3 ViT-B/16 con entrada RGB verificada, DINOv2 ViT-B/14 con entrada histórica de tres bandas catalogada como IRRG, PSPNet ResNet101 con RGB verificado y SAM ViT-B con adaptadores LoRA sobre la misma entrada histórica IRRG. Los pesos se distribuyen en formato safetensors y contienen únicamente tensores del modelo, sin estado del optimizador, imágenes fuente, etiquetas ni predicciones. El repositorio ocupa aproximadamente 0,9 GB.

La relevancia actual del paquete radica en que ofrece una comparativa reproducible de cuatro arquitecturas heterogéneas (ViT con self-supervision, CNN clásica y foundation model con adaptadores) bajo un mismo cohorte histórico de 14 escenas y 467.862.855 píxeles evaluados. No obstante, el propio autor advierte que se trata de resultados observados sobre un cohorte examinado en campañas previas, no de un test ciego nuevo ni de una reclamación de estado del arte.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cuatro sistemas: DINOv3 ViT-B/16, DINOv2 ViT-B/14, PSPNet ResNet101, SAM ViT-B + LoRA |
| Parametros totales | no disponible (el repositorio no publica el recuento agregado; el manifest.json incluye recuento de tensores por fichero) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | mixta por modelo: DINOv3 License Agreement para DINOv3; Apache-2.0 para DINOv2, SAM y pesos PSPNet del proyecto; aviso BSD de TorchVision incluido |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El paquete agrupa cuatro arquitecturas distintas. DINOv3 ViT-B/16 y DINOv2 ViT-B/14 son Vision Transformers preentrenados con self-supervision y adaptados a segmentación semántica de seis clases sobre Potsdam. PSPNet ResNet101 es una red convolucional con módulo de pooling piramidal, la aproximación clásica a segmentación densa. SAM ViT-B + LoRA emplea el Segment Anything Model con adaptadores de bajo rango entrenados sobre el decoder, de modo que el fichero distribuido contiene únicamente los tensores del adaptador y del decoder, no el checkpoint base de SAM.

Los datos de entrenamiento son las imágenes y etiquetas del benchmark ISPRS Potsdam, que no se incluyen en el repositorio y deben obtenerse del portal oficial de ISPRS bajo sus términos vigentes. La evaluación se realizó sobre un cohorte histórico de 14 escenas con 467.862.855 píxeles puntuados y referencias de seis clases erosionadas. El autor especifica que DINOv3 y PSPNet usan RGB verificado procedente de la fuente RGBIR de cuatro bandas, mientras que DINOv2 y SAM usan los ficheros históricos de tres bandas configurados como IRRG, cuyos valores almacenados corresponden en realidad a NIR/verde/azul y no a RGB natural. Solo las ejecuciones actuales de DINOv3 y PSPNet comparten caché e política de inferencia emparejadas. No se documentan en la información disponible detalles sobre número de tokens de entrenamiento, composición del dataset, RLHF/DPO ni innovaciones como decodificación especulativa.

## Capacidades

- Segmentación semántica densa de imágenes aéreas de muy alta resolución en seis clases sobre el benchmark ISPRS Potsdam.
- Extracción automática de objetos urbanos: edificios, vegetación, superficies impermeables, vehículos y clases afines del etiquetado Potsdam.
- Procesamiento de entradas multiespectrales de cuatro bandas (RGBIR) y de tres bandas (IRRG histórico) según la receta.
- Adaptación mediante LoRA sobre el decoder de SAM para segmentación específica de dominio.
- Comparación controlada entre arquitecturas ViT, CNN y foundation model bajo un mismo protocolo de evaluación.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües, al no ser un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Cartografía automatizada de cubierta terrestre urbana: el modelo segmenta ortofotos de Potsdam en seis clases, lo que permite generar mapas temáticos de edificios y vegetación a partir de vuelos aerotransportados con resolución centimétrica.
- Monitorización de expansión urbanística: comparando segmentaciones de la misma zona en distintas fechas se pueden cuantificar cambios en superficie impermeable y masa vegetal, aprovechando la consistencia de las clases Potsdam.
- Auditoría de modelos de segmentación remota: el paquete incluye cuatro recetas con métricas observadas sobre el mismo cohorte, lo que sirve como línea base reproducible para investigaciones que comparen ViT, CNN y SAM en teledetección.
- Investigación en adaptación de foundation models: el adaptador LoRA de SAM ViT-B permite estudiar el ajuste eficiente de un modelo de segmentación generalista a un dominio específico con un fichero de pesos reducido.
- Preprocesado para sistemas de información geográfica: las máscaras de seis clases pueden alimentar pipelines SIG para cálculo de índices de vegetación urbana, sellado del suelo o inventarios de edificaciones.
- Validación de recetas de entrada multiespectral: la distinción documentada entre RGB verificado e IRRG histórico permite analizar el impacto de la configuración de bandas en el rendimiento de segmentación con datos Potsdam.
- Docencia y reproducción de experimentos: el repositorio GitHub asociado contiene el notebook de análisis de datos y los protocolos, lo que facilita replicar la comparativa en entornos académicos.

## Benchmarks y rendimiento

Resultados observados publicados por el autor sobre el cohorte histórico de 14 escenas y 467.862.855 píxeles puntuados, con referencias de seis clases erosionadas:

| Modelo | Entrada | OA | mIoU seis clases |
|---|---|---:|---:|
| DINOv3 ViT-B/16 | RGB verificado desde RGBIR | 92,0397% | 81,0932% |
| DINOv2 ViT-B/14 | IRRG histórico (valores NIR/verde/azul) | 91,4785% | 79,6122% |
| PSPNet ResNet101 | RGB verificado | 91,2834% | 79,4235% |
| SAM ViT-B + LoRA | IRRG histórico (valores NIR/verde/azul) | 87,8142% | 73,7024% |

El autor advierte explícitamente que estos resultados no constituyen un test ciego nuevo ni una reclamación de estado del arte, y que solo DINOv3 y PSPNet comparten caché e política de inferencia emparejadas. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio completo ocupa 0,9 GB en safetensors, por lo que cada uno de los cuatro state dictionaries es manejable en GPU de consumo, aunque el autor no publica cifras por modelo.
- GPU recomendadas: no disponible en la documentación; por el tamaño de los ViT-B y ResNet101, caben previsiblemente en GPUs consumer tipo RTX 3060/4090, pero esta estimación no está confirmada por el autor.
- Cabe en GPU consumer: probablemente sí para los cuatro modelos individuales, dado el tamaño del bundle; sin confirmación oficial.
- Opciones de despliegue: carga mediante `huggingface_hub` y `safetensors.torch.load_file`, seguida de `model.load_state_dict(state_dict, strict=True)` sobre la implementación DeepNet correspondiente. Para SAM es necesario descargar aparte el checkpoint base oficial ViT-B y verificar su SHA-256 contra `model-info.json`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en Potsdam | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DINOv3 ViT-B/16 (este bundle) | no disponible | no aplica | OA 92,04%, mIoU 81,09% | DINOv3 License Agreement | Pesos en HF |
| DINOv2 ViT-B/14 (este bundle) | no disponible | no aplica | OA 91,48%, mIoU 79,61% | Apache-2.0 | Pesos en HF |
| PSPNet ResNet101 (este bundle) | no disponible | no aplica | OA 91,28%, mIoU 79,42% | Apache-2.0 (proyecto) | Pesos en HF |
| SAM ViT-B + LoRA (este bundle) | no disponible | no aplica | OA 87,81%, mIoU 73,70% | Apache-2.0 (adaptador) | Pesos en HF |

No se dispone de información sobre modelos externos comparables con métricas publicadas sobre el mismo cohorte, por lo que la comparativa se limita a las cuatro recetas incluidas en el propio repositorio.

## Limitaciones y advertencias

- Los resultados son observaciones sobre un cohorte histórico examinado en campañas previas, no un test ciego ni una comparación con estado del arte.
- Solo DINOv3 y PSPNet comparten caché e política de inferencia emparejadas; las comparaciones entre las cuatro recetas no son estrictamente homogéneas.
- Las entradas de DINOv2 y SAM son ficheros históricos de tres bandas configurados como IRRG cuyos valores reales son NIR/verde/azul; no deben describirse como RGB natural.
- El fichero de SAM contiene únicamente tensores del adaptador y del decoder; es imprescindible descargar el checkpoint base oficial SAM ViT-B y verificar su SHA-256 contra `model-info.json`.
- La licencia es mixta y específica por modelo: el acuerdo DINOv3 debe acompañar cualquier redistribución de los pesos derivados de DINOv3; los pesos PSPNet del proyecto y los adaptadores SAM/DINOv2 usan Apache-2.0 con avisos de terceros aplicables, incluido el aviso BSD de TorchVision.
- Los datos ISPRS Potsdam no se incluyen y no se concede derecho alguno sobre ellos; deben obtenerse del portal oficial y respetar sus términos vigentes.
- No se documentan sesgos conocidos ni tasas de alucinación, al no ser un modelo generativo; el riesgo principal es el error de clasificación por clase en zonas con alta varianza intra-clase y baja varianza inter-clase, típico de imágenes aéreas de muy alta resolución.
- El modelo está especializado en el dominio Potsdam y en seis clases; su generalización a otras ciudades, sensores o esquemas de etiquetado no está documentada.
- No se dispone de información sobre latencia, throughput ni requisitos de VRAM por modelo.

## Enlaces

- Hugging Face: https://huggingface.co/damminhtien/deepnet-potsdam-segmentation
- Repositorio GitHub del proyecto: https://github.com/damminhtien/deepnet-for-semantic-labeling-photogrammetry
- Notebook de análisis de datos Potsdam: https://github.com/damminhtien/deepnet-for-semantic-labeling-photogrammetry/blob/master/Insight-data-potsdam.ipynb
- Portal oficial ISPRS Potsdam: https://isprs.org/resources/datasets/benchmarks/UrbanSemLab/default.aspx

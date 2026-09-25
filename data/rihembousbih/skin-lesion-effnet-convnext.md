# RihemBousbih/skin-lesion-effnet-convnext

## Resumen

RihemBousbih/skin-lesion-effnet-convnext es un modelo de clasificacion de imagenes de lesiones cutaneas publicado en HuggingFace por el usuario RihemBousbih, con licencia MIT y etiquetado para la libreria Keras. El repositorio ocupa 1,0 GB, lo que es coherente con un ensemble de dos redes convolucionales (una variante de EfficientNet y ConvNeXt) empaquetadas junto con sus pesos. No hay pipeline declarado, no se listan idiomas y la model card publicada no contiene mas que la linea de licencia, sin descripcion, metricas ni instrucciones de uso.

Por el identificador del modelo y por el repositorio de GitHub del mismo autor (RihemBousbih1/skin-lesion-classification), la arquitectura apunta a un ensemble de EfficientNetV2-S con modulo de atencion CBAM y ConvNeXt-Tiny, entrenado sobre ISIC 2019 con las siete clases compartidas con HAM10000, con un punto de operacion calibrado clinicamente para melanoma y validacion externa sobre PH2. Es importante subrayar que estos detalles proceden del repositorio de codigo y no estan confirmados en la model card de HuggingFace.

El modelo es relevante como ejemplo de pipeline de clasificacion dermatologica reproducible y con enfasis en evitar fugas de datos (leakage), un problema recurrente en la literatura de ISIC y HAM10000. Su utilidad practica queda, no obstante, limitada por la ausencia total de documentacion en el repositorio de HuggingFace: no hay resultados de benchmarks publicados, ni tarjeta de datos, ni indicacion del preprocesado esperado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de redes convolucionales; segun el repositorio del autor, EfficientNetV2-S con CBAM + ConvNeXt-Tiny (no confirmado en la model card) |
| Parametros totales | No disponible en la model card. Estimacion a partir de las arquitecturas citadas: ~21,5 M (EfficientNetV2-S) + ~28,6 M (ConvNeXt-Tiny), sin confirmar |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de vision para clasificacion de imagenes) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no aplica a una tarea de vision; las etiquetas de clase estan en ingles: BCC, BKL, MEL, NV, SCC, AK, VASC) |
| Licencia | MIT |
| Formato de pesos | Keras (libreria declarada). Formato de fichero concreto (.keras, .h5, SavedModel): no disponible |
| Tarea | Clasificacion de imagenes (multiclase) de lesiones cutaneas |
| Numero de clases | 7 segun el repositorio del autor (ISIC 2019 / HAM10000); no confirmado en HuggingFace |
| Tamano del repositorio | 1,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-24 |
| Ultima actualizacion | 2026-09-24 |

## Arquitectura y entrenamiento

La informacion disponible en HuggingFace no incluye descripcion de la arquitectura. El unico dato objetivo es el uso de Keras y el tamano del repositorio (1,0 GB). El repositorio de GitHub del mismo autor describe un ensemble que combina EfficientNetV2-S con un modulo de atencion CBAM y ConvNeXt-Tiny, entrenado sobre el conjunto ISIC 2019 con las siete clases compartidas con HAM10000, con un punto de operacion calibrado clinicamente para la deteccion de melanoma y validacion externa sobre PH2. El mismo repositorio se presenta explicitamente como "leakage-free", es decir, con un protocolo de division de datos disenado para evitar la fuga de imagenes entre entrenamiento y validacion, un fallo habitual en los benchmarks de HAM10000.

No hay informacion sobre el numero de tokens o imagenes de entrenamiento, la composicion exacta del dataset, la resolucion de entrada, las tecnicas de aumento de datos, el esquema de optimizacion ni si hubo alguna fase de ajuste fino adicional. Tampoco se documenta ninguna innovacion tecnica mas alla del propio ensemble y del modulo de atencion. Cualquier afirmacion sobre el proceso de entrenamiento mas alla de lo indicado seria especulativa.

## Capacidades

- Clasificacion multiclase de imagenes dermatoscopicas de lesiones cutaneas, presumiblemente en las siete categorias de ISIC 2019 (carcinoma basocelular, queratosis benigna, melanoma, nevus melanocitico, carcinoma escamoso, queratosis actinica y lesion vascular).
- Deteccion con umbral calibrado para melanoma, segun el repositorio del autor; la sensibilidad y especificidad concretas no estan publicadas.
- Inferencia sobre imagenes individuales mediante Keras; no se documenta soporte por lotes ni API de servido.
- No hay evidencia de soporte de generacion de texto, razonamiento, codigo, matematicas, vision general, audio ni video.
- No hay soporte documentado de tool calling, function calling, agentes ni razonamiento multi-paso.
- No hay capacidades multilingues (no aplica a una tarea de clasificacion de imagenes).
- No se documenta modo de pensamiento (thinking mode), explicabilidad integrada ni generacion de informes.

## Casos de uso

- Investigacion reproducible en clasificacion dermatologica: el modelo puede servir como punto de partida para reproducir o comparar resultados sobre ISIC 2019 y HAM10000, especialmente por el enfasis del autor en evitar fugas de datos entre particiones.
- Preetiquetado de datasets dermatoscopicos: uso del ensemble para generar etiquetas preliminares sobre imagenes sin anotar, que despues se revisan por un dermatologo, reduciendo el coste del etiquetado manual.
- Triaje experimental en entornos de investigacion clinica: ordenar un lote de imagenes por probabilidad de melanoma para priorizar la revision por especialistas, siempre como herramienta auxiliar y nunca como diagnostico autonomo.
- Evaluacion de generalizacion entre dominios: al existir validacion externa declarada sobre PH2, el modelo permite estudiar la degradacion de rendimiento al pasar de un conjunto a otro, un analisis util para equipos que construyen sistemas desplegables.
- Componente de un ensemble mayor: los pesos pueden combinarse con otros clasificadores dermatologicos (por ejemplo, variantes de ConvNeXt o CAFormer) para aumentar la robustez en votacion o apilamiento.
- Demostraciones y docencia: en asignaturas de vision por computador aplicada a salud, el modelo ilustra un caso completo de clasificacion medica con ocho clases desequilibradas y validacion externa.
- Filtro previo en campanas de cribado con supervision humana: como etapa de descarte en volumen alto de imagenes, derivando los casos positivos a revision clinica presencial. Requiere validacion local antes de cualquier uso real.
- No se recomienda su uso como dispositivo medico ni para comunicar diagnosticos a pacientes sin aprobacion regulatoria y validacion prospectiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de HuggingFace no incluye ninguna metrica, y el repositorio de GitHub asociado no aporta cifras numericas en el extracto consultado. No se dispone de exactitud, AUC, sensibilidad, especificidad ni F1 para ISIC 2019, HAM10000 o PH2.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el autor. A partir del tamano del repositorio (1,0 GB, dos redes convolucionales de ~20-30 M de parametros cada una), una inferencia en precision FP32 deberia caber holgadamente en 2-4 GB de VRAM, y en menos de 2 GB en FP16. Son estimaciones, no datos medidos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia; para entrenamiento o ajuste fino conviene una GPU con 16 GB o mas (RTX 4080/4090, A100, H100).
- Cabe en GPU consumer: si, con margen amplio, incluso en GPUs de gama media con 6-8 GB.
- Opciones de despliegue: TensorFlow/Keras es la via natural dado el formato de pesos. No hay evidencia de conversion a ONNX, TensorRT, GGUF ni de soporte en vLLM, llama.cpp, Ollama o TGI (estas dos ultimas no aplican a un modelo de vision).
- Latencia y throughput: no disponibles. No se han publicado mediciones de tiempo de inferencia ni de imagenes por segundo.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RihemBousbih/skin-lesion-effnet-convnext | Ensemble EfficientNetV2-S + CBAM + ConvNeXt-Tiny (segun repositorio del autor) | No disponible (~50 M estimados) | No aplica | MIT | HuggingFace, 0 descargas |
| Eraly-ml/Skin-AI (MedConvNeXt) | ConvNeXt con ajuste de hiperparametros via Optuna, PyTorch Lightning | No disponible | No aplica | No disponible | HuggingFace |
| adeel-iqbal/skin-lesion-analyzer | EfficientNetB0 ajustado + pipeline multiagente | No disponible | No aplica | No disponible | GitHub |
| CAFormer hibrido ConvNeXt (articulo en Expert Systems with Applications) | MetaFormer con bloques ConvNeXt | No disponible | No aplica | No disponible (codigo no confirmado) | Publicacion cientifica |

Las cifras de rendimiento comparadas no estan disponibles para ninguno de los modelos de la tabla en la informacion recogida. La comparacion se limita, por tanto, a arquitectura, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de model card: no hay descripcion, instrucciones de uso, preprocesado esperado, resolucion de entrada ni ejemplos de inferencia. Esto dificulta la reproducibilidad.
- Cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- No es un dispositivo medico: no consta marcado CE, autorizacion FDA ni validacion clinica prospectiva. Su uso para diagnostico o triaje real exigiria cumplir el reglamento europeo de productos sanitarios (MDR 2017/745) o la normativa equivalente.
- Riesgo de falsos negativos en melanoma: en una tarea de cribado, un falso negativo tiene consecuencias clinicas graves. Cualquier umbral de decision debe calibrarse localmente con datos representativos.
- Sesgo de dominio y de tono de piel: los conjuntos ISIC y HAM10000 estan dominados por imagenes dermatoscopicas de piel clara; el rendimiento puede degradarse notablemente en imagenes clinicas de camara movil y en pieles oscuras.
- Desequilibrio de clases: melanoma y lesiones vasculares estan infrarrepresentados en ISIC 2019, lo que penaliza el rendimiento en las clases minoritarias.
- Generalizacion limitada: aunque el autor declara validacion externa sobre PH2, no se publican las cifras, por lo que no es posible cuantificar la caida de rendimiento fuera de distribucion.
- Riesgo de sobreajuste a artefactos del conjunto de datos (marcas de regla, pelo, recuadros de anotacion) si no se aplico un preprocesado robusto; no hay documentacion al respecto.
- Licencia MIT: permite uso comercial y modificacion sin restricciones de copyleft, pero no exime del cumplimiento regulatorio en aplicaciones sanitarias ni de las obligaciones de proteccion de datos (RGPD) al tratar imagenes de pacientes.
- Metadatos incoherentes: la fecha de creacion indicada (2026-09-24) es posterior a la fecha de consulta habitual, lo que sugiere un posible error de registro en la plataforma.
- Sin garantias del autor: no se especifica ningun tipo de soporte, mantenimiento ni responsabilidad sobre el uso del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RihemBousbih/skin-lesion-effnet-convnext
- Repositorio del autor en GitHub (skin-lesion-classification): https://github.com/RihemBousbih1/skin-lesion-classification
- SkinAI, herramienta de analisis de lesiones con EfficientNetB0 (referencia comparativa): https://github.com/adeel-iqbal/skin-lesion-analyzer
- MedConvNeXt / Skin-AI en HuggingFace (referencia comparativa): https://huggingface.co/Eraly-ml/Skin-AI
- Articulo sobre diagnostico de lesiones virales con ConvNeXt y XAI (IEEE): https://ieeexplore.ieee.org/abstract/document/11504294
- Articulo sobre enfoque hibrido ConvNeXt/CAFormer para lesion cutanea (ScienceDirect): https://www.sciencedirect.com/science/article/pii/S0957417425013430

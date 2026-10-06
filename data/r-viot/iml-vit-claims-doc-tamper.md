# r-viot/iml-vit-claims-doc-tamper

## Resumen
IML-ViT Claims Doc Tamper es un modelo de vision artificial publicado por el usuario r-viot en HuggingFace, consistente en un Vision Transformer de tipo ViT-base (91,8 millones de parametros) afinado para la localizacion de manipulaciones a nivel de pixel en documentos con formato de justificantes de siniestros (recibos, facturas y tickets). El modelo parte de la arquitectura y el codigo de entrenamiento de IML-ViT, inicializada desde pesos MAE ViT-B, y esta especializada en detectar alteraciones fisicas del contenido: copia-movimiento (copy-move), empalmes (splice) y borrados a nivel de palabra, incluyendo recompresion JPEG en aproximadamente el 50% de las imagenes del corpus.

El problema que resuelve es concreto: en flujos de tramitacion de seguros y gastos, los revisores necesitan saber no solo si un documento ha sido alterado, sino donde. La salida del modelo es un mapa de probabilidad por pixel, lo que permite construir herramientas de triaje asistido para equipos de fraude. La relevancia actual reside en que se entrena exclusivamente con datos sinteticos derivados de CORD v1 (licencia CC BY 4.0, apta para uso comercial) y se distribuye bajo licencia MIT, lo que facilita su integracion en producto sin restricciones legales derivadas de los datos de origen.

La ficha tecnica del autor es inusualmente transparente: documenta la curva de perdida de entrenamiento, el barrido de umbrales y las metricas por epoca, incluyendo las flaquezas del protocolo de evaluacion. El resultado principal es un AUC de pixel por imagen de 0,936 sobre un conjunto de test retenido, con una precision de localizacion mas moderada (F1 agrupado de 0,378 con umbral calibrado de 0,45).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-base) inicializado desde MAE ViT-B; esquema IML-ViT para localizacion de manipulacion a nivel de pixel |
| Parametros totales | 91,8 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; modelo de vision con entradas de 1024x1024 rellenadas con ceros |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos PyTorch sin cuantizar) |
| Idiomas soportados | no disponibles (modelo de vision sobre documentos; no procesa texto de forma directa) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pth` (`checkpoint-0.pth`, `checkpoint-2.pth`) |

## Arquitectura y entrenamiento
La arquitectura es un Vision Transformer estandar de escala base: 12 capas, 768 dimensiones de embedding y 12 cabezas de atencion, con inicializacion desde un autoencoder enmascarado (MAE ViT-B). La adaptacion a la tarea de manipulacion documental sigue el diseno de IML-ViT, que formula la deteccion como segmentacion densa: el modelo produce una prediccion por pixel en lugar de una etiqueta global por documento. Las entradas se normalizan a 1024x1024 con relleno de ceros. Los pesos se distribuyen como ficheros `.pth` sin cuantizar, sin versiones GGUF, ONNX ni safetensors en el repositorio.

El entrenamiento se realizo durante 3 epocas sobre el corpus `r-viot/imlvit-claims-corpus`, un conjunto de 5.600 entradas sinteticas construidas a partir de CORD v1 (recibos, licencia CC BY 4.0) con manipulaciones a nivel de palabra (copy-move, splice, erase) y recompresion JPEG aplicada al 50% de las imagenes en ambas clases. Se uso batch size 1 con acumulacion de gradiente de 16, learning rate 1e-4 con una epoca de warmup, optimizador AdamW y una funcion de perdida con termino de borde de peso lambda=20. La perdida de prediccion de entrenamiento evoluciono de 0,703 a 0,532 y finalmente a 0,374. El split de test retenido consta de 700 entradas derivadas de 100 recibos fuente no vistos. No se documenta ninguna fase de RLHF, DPO ni ajuste por preferencias, algo esperable en un modelo discriminativo de vision.

## Capacidades
- Localizacion de manipulaciones a nivel de pixel en documentos tipo recibo, factura o ticket, devolviendo un mapa de probabilidad por pixel.
- Deteccion de manipulaciones de tipo copy-move (duplicacion de regiones), splice (insercion de fragmentos) y erase (borrado de contenido) sobre palabras.
- Robustez parcial frente a recompresion JPEG, ya que el corpus de entrenamiento incluye recompresion en aproximadamente la mitad de las imagenes de ambas clases.
- Puntuacion agregada por imagen utilizable como senal de triaje (AUC por imagen de 0,936) y umbral calibrado a 0,45 para la decision binaria de pixel.
- Funcionamiento como componente previo en pipelines mas amplios de OCR y razonamiento, no como sistema de decision autonomo.
- Capacidad de reajuste por dominio (fine-tuning) sobre otros tipos documentales, dado que el codigo y la receta de entrenamiento son publicos.

## Casos de uso
- Triaje de siniestros en aseguradoras: el modelo genera un mapa de calor por pixel que permite clasificar automaticamente un justificante como sospechoso o limpio antes de que un ajustador lo revise, reduciendo el volumen de documentacion que llega a revision manual. Su AUC de 0,936 por imagen lo hace util como filtro de primera etapa.
- Revision asistida con resaltado visual: la salida densa se superpone sobre el documento original para que el perito vea exactamente que regiones disparan la alerta, lo que acelera la validacion humana y reduce falsos positivos operativos.
- Auditoria masiva de facturas y tickets en departamentos de cuentas a pagar: procesamiento por lotes de documentos escaneados con recompresion variable, aprovechando la robustez del entrenamiento frente a artefactos JPEG.
- Preprocesado para pipelines de OCR mas razonamiento: como el modelo no cubre manipulaciones logicas ni de contenido (inconsistencias aritmeticas o de fechas), se puede encadenar antes de un motor OCR y un modelo de lenguaje que valide la coherencia de los campos extraidos.
- Deteccion de fraude en reclamaciones de gastos medicos o de viaje, siempre que se realice un fine-tuning especifico, dado que el modelo solo se ha entrenado con documentos tipo recibo.
- Verificacion documental en procesos de alta de clientes (onboarding) donde se reciben justificantes de domicilio o comprobantes de ingresos, como capa de control antifalsificacion.
- Analisis forense digital interno: generacion de evidencia tecnica sobre regiones manipuladas en una investigacion, con la salvedad de que la precision de localizacion es moderada y requiere validacion por un experto.
- Base para desarrollo de producto vertical: al ser MIT y derivarse de un corpus comercialmente seguro, una empresa puede incorporarlo a una herramienta propietaria y reentrenarlo con su propio historico de documentos.

## Benchmarks y rendimiento

Evaluacion del autor sobre el conjunto de test retenido (subconjunto calibrado de 234 imagenes, agregado sobre regiones de documento recortadas):

| Metrica | Valor |
|---|---|
| AUC de pixel por imagen (media) | 0,936 |
| F1 de pixel con umbral 0,5 | 0,344 |
| F1 de pixel con umbral calibrado 0,45 | 0,378 |

F1 con umbral 0,5 registrado por epoca durante el entrenamiento: 0,022 / 0,000 / 0,114. El autor advierte que el protocolo de evaluacion por epoca promedia el F1 por imagen, metrica que las imagenes autenticas penalizan, y que la cifra agrupada de la tabla es la lectura mas justa. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes de vision) en la informacion disponible.

## Requisitos de hardware
- Pesos en precision fp32: aproximadamente 368 MB; en fp16, unos 184 MB; en int8, unos 92 MB. Son cifras calculadas a partir de los 91,8 millones de parametros, no publicadas por el autor.
- El cuello de botella real de memoria no son los pesos, sino las activaciones: a 1024x1024 con parches de 16x16 se generan 4096 tokens por imagen, y la atencion cuadratica sobre esa secuencia domina el consumo. Se estima un rango orientativo de 3 a 8 GB de VRAM segun implementacion y si se emplea atencion eficiente en memoria; es una estimacion, no un dato publicado.
- Cabe en GPU de consumo: una RTX 4090 (24 GB) lo ejecuta con holgura, y una RTX 3060 de 12 GB deberia ser suficiente en fp16 con atencion eficiente. Para entrenamiento o fine-tuning se recomienda al menos 24 GB.
- GPU de centro de datos recomendadas para lotes grandes: A100 40/80 GB, H100 o L40S, que permiten aumentar el batch y aprovechar mejor la GPU.
- Opciones de despliegue: carga directa con PyTorch sobre los `.pth` publicados. No hay versiones GGUF, llama.cpp, Ollama, TGI, ONNX ni vLLM en el repositorio; vLLM no aplica de forma nativa a un modelo de vision de segmentacion.
- Latencia y throughput: no disponibles en la informacion proporcionada. La latencia esperada dependera fuertemente del hardware y de si se procesan documentos a resolucion completa.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| iml-vit-claims-doc-tamper | 91,8 M | Localizacion de manipulacion en justificantes | Entrada 1024x1024 | MIT | Pesos `.pth` en HuggingFace |
| IML-ViT (base, SunnyHaze) | 91,8 M (ViT-B) | Localizacion de manipulacion documental generica | No disponible | MIT | Codigo en GitHub; pesos no detallados en la informacion disponible |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la informacion disponible otros modelos directamente comparables de deteccion de manipulacion documental a nivel de pixel. La busqueda web realizada no devolvio resultados relevantes (retorno sobre el lenguaje R). La comparativa debe entenderse, por tanto, como una referencia contra la arquitectura base de la que deriva este ajuste.

## Limitaciones y advertencias
- El propio autor indica que el modelo se ha entrenado unicamente con documentos de tipo recibo. Documentos medicos (recetas, informes de alta) requieren un pase de fine-tuning especifico por dominio.
- No cubre falsificaciones generadas integramente por IA ni manipulaciones de nivel logico o de contenido, como inconsistencias aritmeticas o de fechas. Debe combinarse con un pipeline de OCR y razonamiento para cubrir ese vector de fraude.
- La capacidad de ranking es solida (AUC 0,936) pero la precision de localizacion es moderada: F1 de pixel de 0,378 con el umbral calibrado. No es adecuado como sistema de decision automatica sin revision humana.
- Las imagenes autenticas penalizan fuertemente el F1 promediado por imagen durante el entrenamiento (0,000 en la segunda epoca), lo que indica sensibilidad al protocolo de evaluacion y sugiere cuidado al reproducir las metricas.
- Riesgo de alucinacion en el sentido de falsos positivos: regiones con textura o artefactos de compresion pueden activar el mapa de manipulacion. Se desconoce la tasa de falsos positivos sobre documentos reales no sinteticos, ya que la evaluacion se hizo sobre un test retenido sintetico.
- Sesgos conocidos: no documentados por el autor. El corpus deriva de CORD v1, por lo que la distribucion de idiomas, tipografias y formatos de recibo del entrenamiento condiciona el rendimiento fuera de ese dominio.
- Restricciones de licencia: el modelo es MIT y el corpus de entrenamiento deriva de CORD v1 (CC BY 4.0), lo que el autor presenta como comercialmente seguro. No obstante, la licencia de los pesos no exime de cumplir la normativa aplicable en materia de tratamiento de documentos personales en un entorno productivo.
- El repositorio tiene 0 descargas y 0 me gusta en el momento de la consulta, y solo dos checkpoints publicados (epocas 0 y final), lo que limita la evidencia de robustez externa y la validacion por terceros.
- El tamano del repositorio (2,2 GB) es elevado en relacion con los 91,8 millones de parametros, presumiblemente por los dos checkpoints en fp32 y los ficheros de log y calibracion.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/r-viot/iml-vit-claims-doc-tamper
- Dataset de entrenamiento: https://huggingface.co/datasets/r-viot/imlvit-claims-corpus
- Repositorio de la arquitectura base IML-ViT: https://github.com/SunnyHaze/IML-ViT
- Paper de referencia (arXiv 2307.14863): https://arxiv.org/abs/2307.14863
- No se han encontrado otros enlaces relevantes en la busqueda web realizada.

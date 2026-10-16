# ml-resources/sapiens2-seg-0.8b

## Resumen

Sapiens2-seg-0.8b es un modelo de segmentacion de partes del cuerpo humana a nivel de pixel, desarrollado por Meta y distribuido en este repositorio como espejo no oficial por el usuario ml-resources. Se trata de un Vision Transformer de 827.532.017 parametros (0,818 B en el backbone) afinado desde el backbone preentrenado Sapiens2-0.8B para una tarea densa de segmentacion: asignar a cada pixel una de 29 clases (28 partes del cuerpo mas fondo) sobre imagenes centradas en personas.

El modelo resuelve el problema del parsing corporal denso, es decir, obtener mascaras precisas de extremidades, torso, cabeza y otras regiones anatomicas sin necesidad de modelos especificos por parte. Es relevante porque la familia Sapiens2 cubre desde 0,4 B hasta 5 B de parametros con la misma receta de entrenamiento, lo que permite escoger un punto de la curva calidad/coste: esta variante de 0,8 B consume 2,592 TFLOPs por imagen a 1024 × 768, un orden de magnitud por debajo de la variante de 5 B.

Arquitectonicamente es un ViT con dimension de embedding 1280, 32 capas, 16 cabezas de atencion y parches de 16 × 16, al que se anade una cabeza de segmentacion. La resolucion de inferencia es 1024 × 768 (alto × ancho) y los pesos se distribuyen en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer Sapiens2 + cabeza de segmentacion de partes del cuerpo |
| Parametros totales | 827.532.017 (0,827 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Parametros del backbone | 0,818 B |
| FLOPs por imagen | 2,592 T (a 1024 × 768) |
| Longitud de contexto | no aplica (modelo de vision, sin contexto de texto) |
| Resolucion de inferencia | 1024 × 768 (alto × ancho) |
| Tamano de parche | 16 |
| Dimension de embedding | 1280 |
| Capas | 32 |
| Cabezas de atencion | 16 |
| Clases de segmentacion | 29 (28 partes del cuerpo + fondo) |
| Tipos de cuantizacion | no disponible (solo se publica el checkpoint en safetensors) |
| Idiomas soportados | no disponible (entrada de imagen; sin procesamiento de lenguaje) |
| Licencia | Sapiens2 License (license_name: sapiens2-license, license: other) |
| Formato de pesos | safetensors (`sapiens2_0.8b_seg.safetensors`) |
| Tamano del repositorio | 3,3 GB |
| Tarea | image-segmentation (parsing corporal por pixel) |
| Modelo base | facebook/sapiens2-pretrain-0.8b |

## Arquitectura y entrenamiento

El modelo es un transformer de vision puro (ViT) sin componentes convolucionales declarados en la informacion disponible, configurado con 32 capas, dimension de embedding 1280 y 16 cabezas de atencion, con tokenizacion en parches de 16 × 16. Sobre el backbone preentrenado Sapiens2-0.8B se anade una cabeza de segmentacion densa que produce 29 clases por pixel. La inferencia se realiza a 1024 × 768, una resolucion alta que en un ViT de parche 16 implica 3072 tokens por imagen, lo que explica el coste de 2,592 TFLOPs por fotograma.

El checkpoint deriva por fine-tuning del backbone `facebook/sapiens2-pretrain-0.8b`; la model card no detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de alineacion como RLHF o DPO (no aplicables de forma directa a una tarea densa de vision). Tampoco se documentan innovaciones de decodificacion, atencion lineal u optimizaciones equivalentes. El paper asociado es arXiv:2604.21681 y el codigo de referencia vive en el repositorio facebookresearch/sapiens2, que es el unico camino de ejecucion documentado (`pip install -e .` y scripts de demo).

## Capacidades

- Segmentacion densa de partes del cuerpo con 29 clases (28 regiones anatomicas mas fondo) a nivel de pixel.
- Procesamiento de imagenes centradas en personas a resolucion 1024 × 768, adecuada para recortes de cuerpo completo y primeros planos.
- Generacion de mascaras binarias por parte del cuerpo, utilizables como capas independientes en pipelines de edicion.
- Trabajo sobre imagenes en color de un solo fotograma; no hay soporte de video declarado en la informacion disponible.
- No dispone de tool calling ni function calling: es un modelo discriminativo de vision, no un modelo generativo de lenguaje.
- No dispone de razonamiento multi-paso, agentes ni modo de pensamiento (thinking mode).
- No hay capacidades multilingues: la entrada es visual y la salida es un mapa de etiquetas, sin texto.
- No se documentan capacidades de vision-lenguaje (VQA, captioning) ni entrada de audio.

## Casos de uso

- Analisis deportivo y biomecanico: al segmentar extremidades y torso, el modelo permite calcular angulos articulares y trayectorias de movimiento a partir de imagenes de atletas a 1024 × 768, con 29 clases que cubren las regiones relevantes para el analisis postural.
- Probador virtual y moda: las mascaras por parte del cuerpo sirven para componer prendas sobre la silueta real del usuario, aislando brazos, piernas y torso para evitar que la ropa generada invada el fondo.
- Animacion y captura de movimiento: el parsing corporal actua como paso previo a la estimacion de pose, proporcionando regiones limpias sobre las que restringir la busqueda de articulaciones en pipelines de motion capture.
- Preetiquetado de datasets: dado que el modelo produce 29 clases densas, se puede usar para generar anotaciones iniciales sobre grandes volumenes de imagenes humanas y reducir el coste de etiquetado manual, con revision posterior.
- Edicion de imagen y video: retoque selectivo por region (suavizado de piel solo en cara y manos, correccion de color por extremidad o recorte automatico de sujetos) apoyandose en la mascara por parte.
- Reconstruccion y renderizado 3D de personas: las mascaras de partes del cuerpo son una entrada habitual para ajustar modelos parametricos (tipo SMPL) a partir de imagenes, al aportar correspondencias densas entre pixel y region anatomica.
- Realidad aumentada y avatares: filtros y efectos anclados a partes concretas del cuerpo, usando la mascara como prueba de oclusion para que los elementos virtuales queden detras de brazos o manos.
- Analitica de aforo y comportamiento en entornos controlados: conteo y analisis de pose agregado (siempre con las cautelas legales y de privacidad aplicables al tratamiento de imagenes de personas).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de segmentacion (mIoU, pixel accuracy) ni comparaciones numericas con otros modelos, y los resultados de busqueda web proporcionados no contienen datos tecnicos sobre este modelo.

## Requisitos de hardware

- Peso de los parametros: aproximadamente 3,3 GB en fp32 (827,5 M de parametros × 4 bytes) y cerca de 1,7 GB en fp16 o bf16.
- VRAM estimada para inferencia a 1024 × 768 con lote 1: en el entorno de 4-6 GB en fp16/bf16 con atencion eficiente en memoria, y 6-10 GB si se mantiene la atencion densa clasica, debido a las matrices de atencion de 3072 tokens por capa. Son estimaciones derivadas del recuento de parametros y de la resolucion, no cifras medidas publicadas.
- Cabe en GPU de consumo: si. Una RTX 3060 de 12 GB, RTX 4070, RTX 4080 o RTX 4090 son suficientes para inferencia en bf16 o fp16 con lote 1. En tarjetas de 8 GB es probable que funcione con lote 1 en fp16, aunque sin margen para lotes mayores ni resoluciones superiores.
- GPU de datacenter recomendadas para procesamiento por lotes: A100 (40/80 GB), H100 o L40S, donde el cuello de botella pasa a ser el ancho de banda y el preprocesado de imagen mas que la memoria.
- Latencia: no hay cifras medidas publicadas. Como cota inferior teorica, 2,592 TFLOPs por imagen sobre una A100 con bf16 denso supondria del orden de 8 ms por imagen asumiendo el 100 % de utilizacion, valor inalcanzable en la practica por el coste de atencion y de memoria.
- Opciones de despliegue: el unico camino documentado es el repositorio oficial facebookresearch/sapiens2 (`pip install -e .`, descarga del checkpoint y ejecucion de los scripts de demo de segmentacion). No hay soporte declarado en vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos autorregresivos de lenguaje. Exportaciones a ONNX, TensorRT u otros runtimes: no disponible.

## Comparativa con modelos similares

Comparativa dentro de la propia familia Sapiens2 de segmentacion de partes del cuerpo, con los datos publicados en la model card:

| Modelo | Parametros | FLOPs | Dim. embedding | Capas | Cabezas |
|---|---|---|---|---|---|
| Sapiens2-0.4B | 0,398 B | 1,260 T | 1024 | 24 | 16 |
| Sapiens2-0.8B (este) | 0,818 B | 2,592 T | 1280 | 32 | 16 |
| Sapiens2-1B | 1,462 B | 4,715 T | 1536 | 40 | 24 |
| Sapiens2-5B | 5,071 B | 15,722 T | 2432 | 56 | 32 |

Los cuatro comparten tarea, resolucion de inferencia, tamano de parche y licencia, de modo que la eleccion se reduce al compromiso entre coste por imagen (1,260 T frente a 15,722 T de FLOPs, un factor 12,5) y precision, cuyo delta exacto no se publica en la informacion disponible. La comparacion con alternativas externas de segmentacion de personas (por ejemplo, modelos tipo SAM o Segment Anything 2, o estimadores de pose y parsing como DensePose) no puede cuantificarse aqui: no disponible.

## Limitaciones y advertencias

- Licencia: Sapiens2 License, marcada como "other" y distinta de las licencias permisivas habituales. Los terminos concretos no se reproducen en la informacion disponible; es obligatorio revisar el LICENSE.md del repositorio oficial antes de cualquier uso comercial.
- Este repositorio es un espejo no oficial publicado por ml-resources, no una release de Meta. Registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria de la integridad de los pesos.
- Sesgos: el modelo esta entrenado para imagenes centradas en personas; el rendimiento caera previsiblemente en cuerpos ocluidos, posturas extremas, planos muy cerrados, multitudes o imagenes de baja calidad. No se documenta en la informacion disponible la composicion demografica del dataset de entrenamiento ni evaluaciones de equidad por tono de piel, genero, edad o complexacion.
- Riesgo de error denso: en segmentacion por pixel los fallos tipicos son bordes imprecisos entre partes adyacentes (por ejemplo, mano y antebrazo), confusion de clases con textiles o accesorios, y errores en zonas de oclusion. No hay metricas publicadas en este repositorio para acotar esa tasa de error.
- La salida es un mapa de 29 etiquetas, no una deteccion de instancias: en imagenes con varias personas no hay una separacion de instancias declarada, lo que limita casos de uso con mas de un sujeto.
- Sin componentes de lenguaje: no admite prompts textuales, ni tool calling, ni flujos de agente. Cualquier capa conversacional debe construirse por separado.
- Coste en produccion: 1024 × 768 con un ViT de 32 capas implica un coste por imagen no despreciable en video; el procesado de secuencias requiere muestreo de fotogramas o aceleracion especifica.
- Despliegue: al no existir soporte en runtimes estandar de inferencia (vLLM, llama.cpp, Ollama, TGI), la integracion exige usar el codigo de Meta o exportar los pesos por cuenta propia, con el riesgo de divergencias numericas que ello conlleva.
- Uso sobre imagenes de personas: el tratamiento de datos biometricos y de imagenes identificables esta sujeto al RGPD y normativas equivalentes; conviene evaluar base juridica y minimizacion de datos antes de desplegar.

## Enlaces

- Repositorio espejo en HuggingFace: https://huggingface.co/ml-resources/sapiens2-seg-0.8b
- Modelo original: https://huggingface.co/facebook/sapiens2-seg-0.8b
- Backbone preentrenado base: https://huggingface.co/facebook/sapiens2-pretrain-0.8b
- Coleccion Sapiens2 en HuggingFace: https://huggingface.co/collections/facebook/sapiens2
- Variante 0.4B: https://huggingface.co/facebook/sapiens2-seg-0.4b
- Variante 1B: https://huggingface.co/facebook/sapiens2-seg-1b
- Variante 5B: https://huggingface.co/facebook/sapiens2-seg-5b
- Paper: https://arxiv.org/pdf/2604.21681
- Pagina del proyecto: https://rawalkhirodkar.github.io/sapiens2
- Codigo: https://github.com/facebookresearch/sapiens2
- Guia de segmentacion de partes del cuerpo: https://github.com/facebookresearch/sapiens2/blob/main/docs/SEG.md
- Licencia: https://github.com/facebookresearch/sapiens2/blob/main/LICENSE.md

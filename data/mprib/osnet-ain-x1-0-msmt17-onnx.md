# mprib/osnet-ain-x1-0-msmt17-onnx

## Resumen

OSNet-AIN x1.0 (MSMT17) en formato ONNX es un modelo de re-identificacion de personas (person re-ID) publicado por el usuario mprib en Hugging Face. No es un modelo de lenguaje: recibe recortes de personas y devuelve un vector de 512 dimensiones por recorte, de forma que dos imagenes de la misma persona producen embeddings con alta similitud coseno. Esto permite asociar la misma persona entre camaras distintas sin dependencia de PyTorch.

El modelo original es OSNet-AIN, propuesto por Kaiyang Zhou y coautores (ICCV 2019 y TPAMI 2021), y este repositorio se limita a reempaquetar los pesos publicados por el autor original en un unico fichero ONNX autocontenido de 8,7 MB, en fp32 y opset 17. La arquitectura es una red convolucional con el bloque Omni-Scale (OSNet) y atencion por instancia (AIN), con un tamano de x1.0 respecto a la variante base.

Su relevancia practica es acotada pero clara: elimina la dependencia de Torchreid y de PyTorch en produccion, permitiendo integrar re-ID de personas en pipelines de vision por computador basados en ONNX Runtime. El autor lo exporto para Caliscope, su herramienta de asociacion de trayectorias entre camaras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OSNet-AIN (CNN con bloque Omni-Scale y atencion por instancia), x1.0 |
| Parametros totales | no disponible (fichero ONNX de 8,7 MB en fp32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye fp32) |
| Idiomas soportados | no aplica |
| Licencia | MIT |
| Formato de pesos | ONNX, opset 17, pesos embebidos sin fichero de datos externo |

## Arquitectura y entrenamiento

OSNet-AIN es una red neuronal convolucional disenada especificamente para re-identificacion de personas. Su bloque Omni-Scale combina convoluciones de distintos tamanos de kernel para capturar caracteristicas a multiples escalas, y la variante AIN anade atencion por instancia para mejorar la generalizacion entre dominios (camaras y entornos distintos). La exportacion a ONNX corresponde al modelo en modo evaluacion: devuelve la caracteristica de 512 valores y omite el clasificador de entrenamiento.

Los pesos originales fueron entrenados sobre MSMT17 (Wei et al., CVPR 2018) con la receta `osnet_ain_x1_0_msmt17_256x128_amsgrad_ep50_lr0.0015_coslr_b64_fb10_softmax_labsmth_flip_jitter`, es decir, 50 epocas, optimizador AMSGrad, learning rate 0,0015 con decaimiento coseno, batch de 64, label smoothing, flip y jitter como aumentacion. El repositorio no aporta informacion sobre el numero de tokens ni sobre el volumen exacto del dataset mas alla de la referencia a MSMT17. La unica innovacion tecnica del empaquetado es la exportacion con `torch.onnx.export`, opset 17 y eje de batch dinamico; segun el autor, los embeddings coinciden con PyTorch con un error maximo de 5e-5 en lotes de 1, 3 y 32 recortes.

## Capacidades

- Extraccion de embeddings de apariencia de personas: una entrada `(N, 3, 256, 128)` produce una salida `(N, 512)`.
- Re-identificacion entre camaras mediante similitud coseno entre embeddings (normalizando previamente cada fila, ya que los vectores no son unitarios).
- Procesamiento por lotes con tamano de batch dinamico.
- Inferencia sin dependencia de PyTorch ni de Torchreid, solo con un runtime ONNX.
- Preprocesado definido: RGB escalado a `[0, 1]`, normalizado con media `(0.485, 0.456, 0.406)` y desviacion `(0.229, 0.224, 0.225)`, redimensionado bilineal a 128x256.
- No soporta tool calling, agentes, razonamiento multi-paso, vision general, audio ni capacidades multilingues; su unica funcion es el re-ID.

## Casos de uso

- Asociacion de trayectorias entre camaras en videovigilancia: cada deteccion de persona se recorta y se pasa por el modelo; los embeddings permiten enlazar la misma identidad entre vistas de camaras distintas mediante umbral de similitud coseno.
- Analitica de afluencia en retail: contar visitantes unicos y reconstruir recorridos entre camaras de una tienda sin depender de reconocimiento facial.
- Seguridad en instalaciones: generar alertas cuando una persona detectada en una zona restringida coincide con una identidad previamente registrada en otra camara.
- Deportes y analisis de movimiento: el autor lo utiliza en Caliscope para asociar tracks de un mismo atleta entre camaras calibradas en un espacio 3D.
- Control de acceso sin biometria facial: identificar a una persona por su apariencia corporal cuando la cara no es visible o no se desea usar reconocimiento facial.
- Investigacion en re-ID: servir como linea base reproducible en ONNX para comparar con modelos mas recientes sin montar el entorno de Torchreid.
- Despliegue en dispositivos con runtime ONNX: al pesar 8,7 MB en fp32, puede ejecutarse en CPU y en entornos embebidos con ONNX Runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de mAP ni de Rank-1 sobre MSMT17 u otros conjuntos, y solo documenta la equivalencia numerica con PyTorch (error maximo de 5e-5).

## Requisitos de hardware

- VRAM estimada: muy baja; el fichero ONNX ocupa 8,7 MB en fp32, por lo que la inferencia cabe en cualquier GPU con unos pocos cientos de MB de memoria libre, incluyendo el overhead del runtime.
- GPU recomendadas: cualquier GPU moderna es sobredimensionada; el modelo esta pensado para ejecutarse en CPU. Una RTX 4090 o una A100 no aportan ventaja significativa frente a una GPU de gama baja.
- Cabe en GPU de consumo: si, en cualquier GPU consumer e incluso en CPU.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), TensorRT previa conversion, OpenVINO, o cualquier runtime compatible con opset 17.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrada / salida | Licencia | Formato |
|---|---|---|---|---|---|
| OSNet-AIN x1.0 MSMT17 (este) | no disponible (8,7 MB fp32) | no aplica | 256x128 RGB / 512 dims | MIT | ONNX |
| OSNet x1.0 (original, kaiyangzhou/osnet) | mismo modelo upstream | no aplica | 256x128 RGB / 512 dims | MIT | PyTorch (.pth) |
| Otras variantes OSNet (x0.25, x0.5, x0.75, x1.0) | no disponible | no aplica | 256x128 RGB / 512 dims | MIT | PyTorch / ONNX segun exportacion |

La comparativa se limita a variantes del mismo modelo original, ya que la informacion disponible no incluye otros modelos de re-ID con los que contrastar parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Modelo de vision especializado en re-ID de personas: no genera texto, no razona y no admite instrucciones; cualquier uso fuera de la extraccion de embeddings de apariencia es inadecuado.
- Riesgo de sesgo: el re-ID de personas puede comportarse de forma desigual segun genero, etnia, ropa o condiciones de iluminacion; no se documenta ninguna evaluacion de equidad.
- Dependencia del dominio: entrenado en MSMT17, un conjunto de vigilancia; el rendimiento puede degradarse en dominios muy distintos (deporte, interiores, camaras cenitales), aunque la atencion por instancia (AIN) esta pensada para mitigarlo.
- Sin metricas publicadas: no hay mAP ni Rank-1 en la informacion disponible, por lo que no se puede estimar su calidad frente a alternativas sin evaluarlo.
- Requiere preprocesado exacto (redimensionado bilineal a 128x256 y normalizacion ImageNet); desviarse de ese contrato degrada los embeddings.
- Los embeddings no son unitarios: hay que normalizarlos antes de calcular similitud coseno.
- Restricciones de licencia: MIT permite uso comercial, pero se exige mantener la atribucion a Kaiyang Zhou y coautores y citar los trabajos originales.
- Consideraciones legales y eticas: el uso de re-ID de personas en espacios publicos esta sujeto a normativa de proteccion de datos (RGPD en la UE); conviene evaluar base legal y minimizacion de datos antes de desplegarlo en produccion.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de mantenimiento continuado.

## Enlaces

- Hugging Face: https://huggingface.co/mprib/osnet-ain-x1-0-msmt17-onnx
- Pesos originales (upstream): https://huggingface.co/kaiyangzhou/osnet
- Paper OSNet-AIN (TPAMI 2021): https://arxiv.org/abs/1910.06827
- Paper OSNet (ICCV 2019): https://arxiv.org/abs/1905.00953
- Paper Torchreid: https://arxiv.org/abs/1910.10093
- Codigo Torchreid: https://github.com/KaiyangZhou/deep-person-reid
- Proyecto Caliscope (autor de la exportacion): https://github.com/mprib/caliscope

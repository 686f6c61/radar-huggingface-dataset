# ml-resources/sapiens2-normal-5b

## Resumen

Sapiens2-5B-Surface es un modelo de visión por computador desarrollado por Meta (Facebook Research) para la estimación densa de normales de superficie en imágenes centradas en personas. Se trata de un checkpoint especializado, obtenido por ajuste fino del backbone preentrenado Sapiens2-5B, que predice para cada píxel un vector unitario de tres canales expresado en el sistema de coordenadas de la cámara. El repositorio analizado (`ml-resources/sapiens2-normal-5b`) es un espejo no oficial del original `facebook/sapiens2-normal-5b`, con la misma licencia y los mismos pesos.

Arquitectónicamente es un Vision Transformer con 56 capas, dimensión de embedding 2432, 32 cabezas de atención y parche de 16 píxeles, sobre el que se monta una cabeza de estimación de normales de superficie. El fichero de pesos en safetensors contiene 5.316.358.294 parámetros (el model card atribuye 5.071 B al backbone, por lo que la cabeza y componentes asociados aportarían la diferencia, en torno a 245 M). La inferencia se realiza a resolución 1024 × 768 (alto × ancho), con un coste de 15,722 TFLOPs por pasada de backbone.

Su relevancia es de nicho pero clara: cubre una tarea de reconstrucción geométrica densa muy exigente (normales por píxel) dentro de la familia Sapiens2, que incluye variantes de 0,4 B, 0,8 B, 1 B y 5 B para distintas tareas de visión centrada en humanos. No es un modelo de lenguaje: no genera texto, no soporta tool calling y no tiene ventana de contexto conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer Sapiens2 (backbone ViT) + cabeza de estimacion de normales de superficie |
| Parametros totales | 5.316.358.294 (pesos en safetensors); 5,071 B atribuidos al backbone en la model card |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: modelo de vision; la entrada es una imagen a 1024 × 768 pixeles) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (no aplica: modelo sin capacidades linguisticas) |
| Licencia | Sapiens2 License (identificador `other`, `license_name: sapiens2-license`) |
| Formato de pesos | safetensors (`sapiens2_5b_normal.safetensors`), repositorio de 21,3 GB |

Datos adicionales de arquitectura recogidos en la model card: dimension de embedding 2432, 56 capas, 32 cabezas de atencion, patch size 16, FLOPs de backbone 15,722 T, resolucion de inferencia 1024 × 768 (H × W), tarea `normal`, pipeline declarado `depth-estimation`.

## Arquitectura y entrenamiento

El modelo es un transformer de vision puro (no MoE, no SSM, no hibrido) con el backbone Sapiens2 preentrenado como columna vertebral. Sobre ese backbone se anade una cabeza de estimacion de normales de superficie que produce una salida densa de tres canales por pixel, interpretable como vector unitario en el marco de la camara. El backbone procesa la imagen a 1024 × 768 con parches de 16 × 16, lo que da 3072 tokens de entrada, y emplea 56 capas con dimension oculta 2432 y 32 cabezas de atencion. El conjunto del backbone consume 15,722 TFLOPs por imagen.

Respecto al entrenamiento, la informacion disponible solo indica que se trata de un ajuste fino (finetune) del checkpoint `facebook/sapiens2-pretrain-5b` para la tarea de normales de superficie. No se detalla en la informacion proporcionada el numero de tokens o imagenes de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de alineacion como RLHF o DPO (no aplicables en una tarea de vision densa de este tipo, aunque no se confirma). Tampoco se documentan innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa u otras) mas alla de la propia arquitectura Sapiens2. La model card remite al paper arXiv:2604.21681 para los detalles completos.

## Capacidades

- Estimacion densa de normales de superficie: predice, para cada pixel de la imagen de entrada, un vector unitario de tres componentes en el sistema de coordenadas de la camara.
- Procesamiento de imagenes centradas en humanos a resolucion 1024 × 768 con parches de 16 x 16.
- Vision por computador densa: la salida es un mapa por pixel, no una etiqueta global ni una descripcion textual.
- No dispone de generacion de texto, razonamiento linguistico, codigo ni matematicas: es un modelo exclusivamente visual.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni de dialogo.
- No se documentan capacidades multimodales de otro tipo (audio, video) ni modos especiales como thinking mode.
- Dentro de la familia Sapiens2 existen checkpoints equivalentes para otras tareas y tamanos, lo que permite intercambiar el modelo segun el compromiso precision/coste.

## Casos de uso

- Digitalizacion de humanos para avatares: el mapa de normales por pixel permite reconstruir la superficie visible de una persona fotografiada y alimentar pipelines de modelado 3D o de creacion de avatares, aprovechando la resolucion de 1024 × 768 y la naturaleza densa de la salida.
- Relighting y edicion de imagen basada en fisica: las normales por pixel son una entrada directa para calcular la respuesta de una superficie a una fuente de luz virtual, de modo que el modelo sirve para cambiar la iluminacion de una fotografia de una persona de forma coherente.
- Aumento de datos sinteticos para entrenar otros modelos: generar mapas de normales de referencia sobre imagenes humanas para tareas de supervision densa (segmentacion, reconstruccion, matting) en investigacion.
- Captura de movimiento y analisis de pose con informacion de superficie: combinar las normales con estimaciones de pose para obtener una descripcion geometrica mas rica del cuerpo, util en biomecanica o en analisis deportivo.
- Preprocesado para reconstruccion 3D de cuerpo completo: integrar los mapas de normales como termino de regularizacion o como dato de entrada en管线 de fotogrametria y ajuste de mallas parametricas de cuerpo humano.
- Investigacion en vision centrada en humanos: evaluar arquitecturas de estimacion densa de normales, comparar el comportamiento de las variantes de 0,4 B, 0,8 B, 1 B y 5 B, y estudiar el escalado en tareas de superficie.
- Renderizado y efectos visuales en produccion: usar la prediccion de normales como capa auxiliar para composicion digital o para estimar la geometria de un actor antes de integrarlo en una escena sintetica.
- Control de calidad en generacion de imagen: verificar la coherencia geometrica de imagenes sinteticas de personas comparando las normales predichas con las esperadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de metricas (error angular medio, RMSE u otras habituales en estimacion de normales) ni comparaciones cuantitativas con otros modelos. Los unicos datos numericos publicados son de coste computacional y arquitectura:

| Modelo | Parametros | FLOPs | Dim. embedding | Capas | Cabezas |
|---|---|---|---|---|---|
| Sapiens2-0.4B | 0,398 B | 1,260 T | 1024 | 24 | 16 |
| Sapiens2-0.8B | 0,818 B | 2,592 T | 1280 | 32 | 16 |
| Sapiens2-1B | 1,462 B | 4,715 T | 1536 | 40 | 24 |
| Sapiens2-5B (este) | 5,071 B (backbone) | 15,722 T | 2432 | 56 | 32 |

## Requisitos de hardware

- Peso de los parametros: 5,316 M parametros. En fp32 ocupan aproximadamente 21,3 GB (coincide con el tamano del repositorio); en bf16/fp16, en torno a 10,6 GB.
- VRAM estimada para inferencia en bf16: a partir de unos 11 GB solo para pesos, mas activaciones y buffers de atencion para 3072 tokens de entrada con 56 capas; en la practica se recomienda un margen de 14 a 18 GB.
- VRAM estimada en fp32: aproximadamente 21,3 GB solo de pesos, por lo que se necesitan 24 GB o mas de memoria de GPU.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o similares de centro de datos para fp32 y lotes grandes; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes en bf16. Las GPU de 16 GB (RTX 4080, 4060 Ti 16 GB) quedan en el limite y probablemente exijan reducir la resolucion de entrada o dividir el modelo.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB con precision reducida; en 16 GB solo con ajustes agresivos de memoria.
- Opciones de despliegue: el repositorio oficial Sapiens2 (`pip install -e .`) con PyTorch y el script de demo `sapiens/dense/scripts/demo/normal.sh`; los pesos se descargan con `hf download`. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que son herramientas para modelos de lenguaje.
- Latencia y throughput: no disponible. No se publican mediciones de tiempo de inferencia ni de imagenes por segundo en la informacion proporcionada; como referencia de coste, el backbone requiere 15,722 TFLOPs por imagen a 1024 × 768.

## Comparativa con modelos similares

No se dispone de datos de rendimiento que permitan comparar esta tarea con alternativas externas (por ejemplo, otros estimadores densos de normales). La comparacion disponible es interna a la familia Sapiens2-Surface, que ofrece el mismo tipo de cabeza a distintos tamanos:

| Modelo | Parametros | FLOPs | Dim. embedding | Capas | Cabezas | Licencia |
|---|---|---|---|---|---|---|
| Sapiens2-0.4B-Surface | 0,398 B | 1,260 T | 1024 | 24 | 16 | Sapiens2 License |
| Sapiens2-0.8B-Surface | 0,818 B | 2,592 T | 1280 | 32 | 16 | Sapiens2 License |
| Sapiens2-1B-Surface | 1,462 B | 4,715 T | 1536 | 40 | 24 | Sapiens2 License |
| Sapiens2-5B-Surface | 5,071 B (backbone) | 15,722 T | 2432 | 56 | 32 | Sapiens2 License |

La variante de 5 B es la mas costosa de la familia (unas 12,5 veces los FLOPs de la de 0,4 B) y la unica con dimension de embedding 2432 y 32 cabezas. No se han publicado metricas de precision por variante en la informacion disponible, por lo que la eleccion entre tamanos debe basarse en el presupuesto de computo y en validacion propia, no en cifras comparativas publicadas.

## Limitaciones y advertencias

- Dominio restringido: el modelo esta disenado para imagenes centradas en humanos; su comportamiento fuera de ese dominio no esta documentado y probablemente degrade.
- Sesgos demograficos y de captura: no se documenta la composicion del dataset de ajuste fino, por lo que no puede descartarse sesgo hacia determinados tonos de piel, tipos corporales, iluminaciones o condiciones de camara.
- Riesgo de geometria inconsistente: en regiones ocluidas, con poca textura, con movimiento o con iluminacion extrema, un estimador denso de normales puede producir superficies fisicamente incoherentes; la salida debe validarse antes de usarse en un pipeline de reconstruccion.
- Idiomas: no aplica, el modelo no procesa texto; no hay soporte multilingue ni de instrucciones en lenguaje natural.
- Contexto: no existe ventana de contexto conversacional; la unica restriccion de entrada es la resolucion de inferencia de 1024 × 768 y el patch size de 16.
- Licencia: se distribuye bajo la Sapiens2 License (etiquetada como `other`), no bajo una licencia de codigo abierto estandar. Es imprescindible revisar el texto completo en el repositorio antes de cualquier uso comercial, ya que la informacion disponible no detalla los terminos de uso comercial.
- Repositorio espejo no oficial: `ml-resources/sapiens2-normal-5b` replica los pesos de Meta pero no es una publicacion oficial; no hay garantia de mantenimiento, actualizacion ni soporte, y la trazabilidad depende del repositorio original.
- Validacion comunitaria nula: el repositorio analizado registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe evidencia externa de uso en produccion.
- Integracion: requiere el paquete `sapiens2` y el repositorio oficial; no se puede cargar con `transformers` estandar sin adaptacion, ya que la libreria declarada es `sapiens2`.

## Enlaces

- Repositorio analizado (espejo): https://huggingface.co/ml-resources/sapiens2-normal-5b
- Repositorio original de Meta: https://huggingface.co/facebook/sapiens2-normal-5b
- Modelo base preentrenado: https://huggingface.co/facebook/sapiens2-pretrain-5b
- Paper: https://arxiv.org/pdf/2604.21681
- Pagina del proyecto: https://rawalkhirodkar.github.io/sapiens2
- Codigo fuente: https://github.com/facebookresearch/sapiens2
- Guia de estimacion de normales de superficie: https://github.com/facebookresearch/sapiens2/blob/main/docs/NORMAL.md
- Licencia Sapiens2: https://github.com/facebookresearch/sapiens2/blob/main/LICENSE.md
- Coleccion Sapiens2 (todas las variantes): https://huggingface.co/collections/facebook/sapiens2
- Variante 0.4B de la misma tarea: https://huggingface.co/facebook/sapiens2-normal-0.4b
- Variante 0.8B de la misma tarea: https://huggingface.co/facebook/sapiens2-normal-0.8b
- Variante 1B de la misma tarea: https://huggingface.co/facebook/sapiens2-normal-1b
- Resultados de busqueda web: las consultas realizadas no devolvieron ningun enlace relevante sobre el modelo (los resultados correspondian a paginas no relacionadas, como la desambiguacion de "ML" o anuncios de vehiculos).

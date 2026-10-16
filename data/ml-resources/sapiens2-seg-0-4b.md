# ml-resources/sapiens2-seg-0.4b

## Resumen

Sapiens2-seg-0.4b es un modelo de segmentacion por pixel de partes del cuerpo humana, desarrollado por Meta (Facebook Research) y redistribuido en HuggingFace por el usuario ml-resources como espejo no oficial del checkpoint facebook/sapiens2-seg-0.4b. Se trata de un Vision Transformer (ViT) de 0,398 mil millones de parametros en el backbone (406.601.709 parametros totales contando la cabeza de segmentacion), afinado a partir del backbone preentrenado Sapiens2-0.4B. Su tarea concreta es la segmentacion de 29 clases: 28 partes del cuerpo mas fondo.

El modelo forma parte de la familia Sapiens2, que escala desde 0,4B hasta 5B de parametros, y esta pensado para imagenes centradas en personas. Trabaja a una resolucion de inferencia de 1024 x 768 (alto x ancho) con parches de 16 x 16, lo que se traduce en un coste de 1,260 TFLOPs por inferencia en esta variante. Es relevante ahora porque ofrece una alternativa de bajo coste computacional dentro de la familia, util para pipelines de vision por computador que necesitan segmentacion anatomica densa sin desplegar los checkpoints de 1B o 5B.

Al ser un modelo de vision puro, no procesa texto ni tiene capacidades multilingues, generativas ni de razonamiento. Su licencia es la Sapiens2 License, una licencia personalizada distinta de las licencias de codigo abierto habituales, cuyo texto completo hay que consultar en el repositorio oficial antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (Sapiens2 ViT backbone + cabeza de segmentacion de partes del cuerpo) |
| Parametros totales | 406.601.709 (backbone: 0,398 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen a 1024 x 768, parche de 16 x 16) |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye el checkpoint en safetensors) |
| Idiomas soportados | no aplica (modelo de vision; no procesa texto) |
| Licencia | Sapiens2 License (license_name: sapiens2-license, license: other) |
| Formato de pesos | safetensors (archivo sapiens2_0.4b_seg.safetensors) |

Datos adicionales de la model card: dimension de embedding 1024, 24 capas, 16 cabezas de atencion, 1,260 TFLOPs de backbone, resolucion de inferencia 1024 x 768 (H x W), parche de 16, 29 clases de salida (28 partes + fondo). Tamano del repositorio: 1,6 GB.

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer Sapiens2 con un backbone de 24 capas, dimension de embedding 1024 y 16 cabezas de atencion, al que se anade una cabeza de segmentacion densa que produce una etiqueta por pixel sobre 29 clases (28 partes del cuerpo mas fondo). El modelo opera sobre parches de 16 x 16 a una resolucion de 1024 x 768, lo que genera 3.072 tokens de parche mas el token de clase. El checkpoint de 0,4B es el mas pequeno de la familia Sapiens2, que incluye tambien variantes de 0,8B (0,818 B de parametros, 2,592 TFLOPs, 1280 de embedding, 32 capas), 1B (1,462 B, 4,715 TFLOPs, 1536, 40 capas, 24 cabezas) y 5B (5,071 B, 15,722 TFLOPs, 2432, 56 capas, 32 cabezas).

Este checkpoint concreto es un ajuste fino supervisado del backbone preentrenado facebook/sapiens2-pretrain-0.4b para la tarea de segmentacion de partes del cuerpo. La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de alineacion como RLHF o DPO (poco habituales en segmentacion densa). Tampoco se documentan en la model card innovaciones especificas de atencion o decodificacion para esta variante; los unicos datos tecnicos publicados son los estructurales de la tabla anterior. El paper asociado es arXiv:2604.21681 (Sapiens2, Khirodkar et al., 2026).

## Capacidades

- Segmentacion densa por pixel de imagenes centradas en personas, con 29 clases de salida (28 partes del cuerpo mas fondo).
- Salida de mapa de segmentacion a resolucion de entrada de 1024 x 768, con parches de 16 x 16.
- Procesamiento de imagenes de personas completas o parciales dentro del dominio "human-centric" declarado por el autor.
- No soporta tool calling ni function calling: es un modelo de vision, no un modelo de lenguaje.
- No soporta agentes, razonamiento multi-paso ni planificacion.
- No tiene capacidades multilingues ni de generacion de texto.
- No dispone de modo "thinking", ni entrada/salida de audio, ni generacion de imagenes.
- No se documentan capacidades adicionales (deteccion, keypoints, normales, matting) en este checkpoint concreto; la coleccion Sapiens2 incluye otros checkpoints para tareas downstream distintas.

## Casos de uso

- Analisis de pose y anatomia en investigacion de vision centrada en personas: el modelo devuelve una etiqueta de parte del cuerpo por pixel, lo que permite construir mascaras anatomicas densas para estudios de biomecanica o analisis de movimiento sin depender de anotaciones manuales.
- Preprocesado para modelos de reidentificacion o analisis de atributos: las mascaras de 28 partes permiten aislar regiones (torso, brazos, piernas, cabeza) antes de aplicar clasificadores secundarios, mejorando la robustez frente al fondo.
- Realidad aumentada y efectos sobre el cuerpo: la segmentacion por partes permite aplicar texturas, filtros o sustituciones diferenciadas por region anatomica en tiempo de post-procesado sobre imagenes fijas o secuencias.
- Generacion de datasets sinteticos y etiquetado automatico: se puede usar como anotador previo para preetiquetar grandes volumenes de imagenes de personas, reduciendo el coste de anotacion humana en pipelines de entrenamiento posteriores.
- Analisis deportivo y de rendimiento: al segmentar extremidades de forma separada, permite calcular metricas de area o cobertura por region (por ejemplo, en ciclismo o atletismo) a partir de fotogramas de alta resolucion.
- Moderacion y privacidad de contenido: la mascara de partes del cuerpo sirve para aplicar desenfoque selectivo o censura por region concreta, en lugar de sobre la imagen completa.
- Vision por computador en entornos de borde (edge): con 0,398 B de parametros en el backbone, es la variante mas ligera de la familia y la mas adecuada cuando el presupuesto de computo o de memoria es limitado y no se justifica desplegar la version de 1B o 5B.
- Investigacion academica reproducible: al estar el checkpoint y el codigo publicos, sirve como punto de partida para comparativas controladas de tecnicas de segmentacion de partes del cuerpo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del checkpoint solo incluye metricas estructurales (parametros, FLOPs, dimensiones, resolucion de inferencia), no resultados de mIoU, AP ni comparativas con otros modelos en datasets de referencia.

Metricas estructurales publicadas:

| Metrica | Valor |
|---|---|
| Parametros de backbone | 0,398 B |
| Parametros totales (safetensors) | 406.601.709 |
| FLOPs de backbone | 1,260 T |
| Dimension de embedding | 1024 |
| Capas | 24 |
| Cabezas de atencion | 16 |
| Resolucion de inferencia | 1024 x 768 (H x W) |
| Tamano de parche | 16 |
| Clases de salida | 29 (28 partes + fondo) |

## Requisitos de hardware

- VRAM estimada para los pesos: en bf16/fp16, aproximadamente 0,8 GB para 406,6 millones de parametros; en fp32, aproximadamente 1,6 GB. Estas cifras son un calculo derivado del recuento de parametros, no datos publicados por el autor.
- VRAM estimada total para inferencia: la atencion sobre 3.072 tokens de parche con 24 capas y 16 cabezas genera activaciones significativas; con atencion de memoria eficiente (FlashAttention o similar) el consumo total razonable se situa en el rango de 2 a 4 GB. Sin atencion eficiente, la matriz de atencion a 1024 x 768 puede elevar el pico de memoria muy por encima de esa cifra, ya que cada mapa de atencion por cabeza ocupa del orden de cientos de MB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM es suficiente en el escenario con atencion eficiente. Se puede ejecutar en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, A100, H100 y similares. El modelo esta claramente dentro del rango de GPU de consumo.
- Uso con lotes grandes o a resolucion superior incrementa la memoria de forma aproximadamente lineal con el numero de imagenes simultaneas.
- Opciones de despliegue: la via documentada es el repositorio oficial Sapiens2 (instalacion con `pip install -e .`) y el script de demo `scripts/demo/seg.sh`, que carga el archivo `sapiens2_0.4b_seg.safetensors`. La model card tambien incluye el tag `transformers`, pero no se detalla en la documentacion disponible una integracion oficial con la libreria Transformers.
- No se distribuye version GGUF, por lo que llama.cpp y Ollama no son opciones directas sin una conversion propia. vLLM y TGI estan orientados a modelos de lenguaje y no se documentan como soportados para este checkpoint.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo de inferencia ni de imagenes por segundo en la informacion proporcionada.

## Comparativa con modelos similares

Comparativa dentro de la propia familia Sapiens2 de segmentacion de partes del cuerpo, con datos extraidos de la model card:

| Modelo | Parametros | FLOPs | Embed dim | Capas | Cabezas | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|---|
| Sapiens2-0.4B (este) | 0,398 B | 1,260 T | 1024 | 24 | 16 | 1024 x 768 | Sapiens2 License | HuggingFace (espejo ml-resources) |
| Sapiens2-0.8B | 0,818 B | 2,592 T | 1280 | 32 | 16 | no disponible | Sapiens2 License | HuggingFace (facebook/sapiens2-seg-0.8b) |
| Sapiens2-1B | 1,462 B | 4,715 T | 1536 | 40 | 24 | no disponible | Sapiens2 License | HuggingFace (facebook/sapiens2-seg-1b) |
| Sapiens2-5B | 5,071 B | 15,722 T | 2432 | 56 | 32 | no disponible | Sapiens2 License | HuggingFace (facebook/sapiens2-seg-5b) |

La variante de 0.4B es la mas ligera de la familia: consume aproximadamente la mitad de FLOPs que la de 0.8B y alrededor de una cuarta parte que la de 1B (1,260 T frente a 4,715 T), lo que la posiciona como la opcion de menor coste cuando la precision de la segmentacion por partes no es critica.

No se dispone de datos de rendimiento ni de comparativas publicadas frente a modelos externos de segmentacion de personas (como Sapiens de primera generacion u otros segmentadores de partes del cuerpo), por lo que no es posible establecer una comparacion cuantitativa con alternativas fuera de la familia.

## Limitaciones y advertencias

- Este repositorio es un espejo no oficial publicado por el usuario ml-resources. El autor original es Meta; no se trata de un lanzamiento oficial. El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta.
- La licencia Sapiens2 License es una licencia personalizada (`license: other`), no una licencia estandar de codigo abierto. Los terminos concretos de uso comercial no estan detallados en la model card; es obligatorio revisar el archivo LICENSE.md del repositorio oficial antes de cualquier uso en produccion o con fines comerciales.
- No se publican resultados de benchmarks, por lo que no hay evidencia cuantificable de precision (mIoU, AP) en datasets de referencia. Cualquier decision de produccion basada en la calidad del modelo requeriria una evaluacion propia.
- No se documentan en la informacion disponible los sesgos del modelo, el riesgo de error en escenarios concretos (oclusiones, poses atipicas, iluminacion adversa, dominio fuera de distribucion) ni los limites de generalizacion. Al tratarse de un modelo entrenado para imagenes centradas en personas, el rendimiento fuera de ese dominio no esta caracterizado.
- El modelo no procesa texto: cualquier expectativa de generacion de lenguaje, razonamiento, tool calling o capacidades multilingues no aplica.
- La salida es un mapa de segmentacion de 29 clases; un error en la cabeza de segmentacion se propaga directamente a cualquier aplicacion aguas abajo (realidad aumentada, privacidad, analitica). Se recomienda validacion y umbrales de confianza en produccion.
- No hay versiones cuantizadas publicadas (GGUF, int8, int4), lo que limita el despliegue en entornos con restricciones severas de memoria sin trabajo adicional de conversion.
- El identificador de licencia de HuggingFace figura como "other" con nombre "sapiens2-license", por lo que las herramientas de cumplimiento automatico pueden no clasificarla correctamente.
- La fecha de creacion del repositorio (2026-10-15) y el numero de referencia del paper (arXiv:2604.21681) deben verificarse contra las fuentes oficiales antes de citarlos.

## Enlaces

- Modelo en HuggingFace (espejo): https://huggingface.co/ml-resources/sapiens2-seg-0.4b
- Modelo original en HuggingFace: https://huggingface.co/facebook/sapiens2-seg-0.4b
- Backbone preentrenado base: https://huggingface.co/facebook/sapiens2-pretrain-0.4b
- Variantes de la familia: https://huggingface.co/facebook/sapiens2-seg-0.8b, https://huggingface.co/facebook/sapiens2-seg-1b, https://huggingface.co/facebook/sapiens2-seg-5b
- Coleccion Sapiens2 en HuggingFace: https://huggingface.co/collections/facebook/sapiens2
- Paper: https://arxiv.org/pdf/2604.21681
- Pagina del proyecto: https://rawalkhirodkar.github.io/sapiens2
- Codigo fuente: https://github.com/facebookresearch/sapiens2
- Licencia Sapiens2: https://github.com/facebookresearch/sapiens2/blob/main/LICENSE.md
- Guia de segmentacion de partes del cuerpo: https://github.com/facebookresearch/sapiens2/blob/main/docs/SEG.md

Nota: la busqueda web realizada no ha devuelto resultados relevantes sobre este modelo; los unicos enlaces utiles son los incluidos en la model card y los listados arriba.

# ml-resources/sapiens2-seg-5b

## Resumen

Sapiens2-5B-Body-Part es un modelo de segmentacion por pixel de partes del cuerpo humano con 29 clases (28 partes mas fondo). Lo desarrolla Meta y esta construido sobre el backbone preentrenado Sapiens2-5B, al que se le anade una cabeza de segmentacion. El repositorio analizado, `ml-resources/sapiens2-seg-5b`, es un espejo no oficial de `facebook/sapiens2-seg-5b` que mantiene la licencia original Sapiens2 y el mismo checkpoint (`sapiens2_5b_seg.safetensors`).

Tecnicamente es un Vision Transformer de 5.071 B de parametros en el backbone (5.089.588.656 parametros totales contando la cabeza de segmentacion, segun los safetensors), con dimension de embedding 2432, 56 capas y 32 cabezas de atencion. Trabaja a una resolucion de inferencia de 1024 x 768 (alto x ancho) con patch size de 16, y consume 15.722 T FLOPs en el backbone por imagen.

Su relevancia es doble: por un lado, es el checkpoint de mayor tamano de la familia Sapiens2 de segmentacion humana, lo que lo situa como referencia para tareas de analisis corporal denso; por otro, al ser un espejo de un lanzamiento de Meta bajo licencia propia y libreria no estandar (`sapiens2`), resulta un caso util para evaluar los requisitos de integracion y las restricciones legales de los modelos human-centric de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (Sapiens2 ViT backbone + cabeza de segmentacion de partes del cuerpo) |
| Parametros totales | 5.089.588.656 (5,09 B); backbone 5.071 B |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; no procesa texto) |
| Tipos de cuantizacion | no disponible (solo se publica el checkpoint en safetensors) |
| Idiomas soportados | no disponible (modelo de vision, sin capacidades linguisticas) |
| Licencia | Sapiens2 License (identificador `sapiens2-license`, `license: other`) |
| Formato de pesos | safetensors (`sapiens2_5b_seg.safetensors`) |
| Dimension de embedding | 2432 |
| Capas | 56 |
| Cabezas de atencion | 32 |
| Resolucion de inferencia | 1024 x 768 (alto x ancho) |
| Patch size | 16 |
| FLOPs del backbone | 15.722 T |
| Clases de salida | 29 (28 partes del cuerpo + fondo) |
| Tamano del repositorio | 20,4 GB |
| Libreria | sapiens2 |
| Modelo base | facebook/sapiens2-pretrain-5b |
| Pipeline | image-segmentation |

## Arquitectura y entrenamiento

El modelo sigue el esquema de la familia Sapiens2: un backbone ViT de gran escala preentrenado sobre imagenes centradas en personas al que se acopla una cabeza de segmentacion densa. En esta variante de 5B, el backbone tiene 56 capas, dimension de embedding 2432 y 32 cabezas de atencion, con patch size 16 sobre entradas de 1024 x 768 pixeles, lo que produce una rejilla de 64 x 48 parches (3072 tokens visuales) antes de la cabeza de prediccion por pixel. El checkpoint de segmentacion se obtiene por fine-tuning del backbone `facebook/sapiens2-pretrain-5b`.

La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset de fine-tuning, ni si se emplearon tecnicas de ajuste tipo RLHF o DPO (no aplicables en un modelo puramente visual). Tampoco se documentan innovaciones de atencion o decodificacion especulativa en la model card. El dato objetivo de entrenamiento disponible es el coste computacional del backbone (15.722 T FLOPs) y la jerarquia de variantes de la familia, que va de 0.398 B a 5.071 B de parametros con el mismo esquema de patch y resolucion.

El repositorio concreto analizado es un espejo mantenido por el usuario `ml-resources`, con 0 descargas y 0 likes en el momento de la consulta, fechado el 15 de octubre de 2026. No incorpora pesos adicionales ni modificaciones respecto al checkpoint original mas alla de la redistribucion del archivo.

## Capacidades

- Segmentacion densa por pixel de partes del cuerpo humano en 29 clases (28 partes mas fondo), con salida a resolucion de entrada de 1024 x 768.
- Procesamiento de imagenes human-centric, incluyendo escenas con personas a distintas escalas y poses, segun el uso previsto declarado por el autor.
- Extraccion de caracteristicas visuales de alta capacidad mediante un backbone ViT de 5.071 B de parametros.
- No soporta generacion de texto, razonamiento, codigo ni matematicas: es un modelo exclusivamente de vision.
- No dispone de tool calling ni function calling.
- No esta orientado a agentes ni a razonamiento multi-paso.
- No tiene capacidades multilingues ni procesamiento de lenguaje natural.
- No se documentan capacidades especiales adicionales (ni modo thinking, ni audio, ni video) en la informacion disponible.

## Casos de uso

- Analisis antropometrico automatico: el modelo permite obtener mascaras densas de 28 partes corporales sobre imagenes de 1024 x 768, lo que facilita medir proporciones, longitudes de extremidades o volumenes aparentes en estudios de morfologia humana.
- Realidad aumentada y prueba virtual de ropa: la segmentacion por partes permite delimitar torso, brazos y piernas para superponer prendas o efectos con precision por pixel, evitando artefactos en los bordes.
- Animacion y captura de movimiento 2D: las mascaras de partes del cuerpo sirven como entrada para pipelines de rigging o para transferir texturas entre fotogramas en produccion audiovisual.
- Analisis deportivo: seguimiento de la postura y de las partes del cuerpo en fotogramas de alta resolucion para evaluar tecnica en disciplinas como atletismo, musculacion o rehabilitacion.
- Investigacion en vision centrada en personas: generacion de anotaciones densas para construir o ampliar datasets de segmentacion corporal, o como modelo de referencia para comparar arquitecturas mas pequenas de la propia familia Sapiens2.
- Preprocesado para modelos de moda y comercio electronico: separacion de regiones corporales antes de tareas posteriores de clasificacion de atributos, estimacion de tallas o recomendacion de producto.
- Sanidad y ergonomia (con supervision): apoyo a la medicion de areas corporales en imagenes clinicas o estudios ergonomicos, siempre como herramienta auxiliar y no como dispositivo medico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad de segmentacion (mIoU, AP de mascaras, PCK u otras) ni comparaciones numericas con modelos de la competencia; unicamente se aportan datos de arquitectura y coste computacional (5.071 B de parametros y 15.722 T FLOPs en el backbone a 1024 x 768).

## Requisitos de hardware

Estimaciones derivadas del tamano del checkpoint y de la resolucion declarada; no hay mediciones publicadas en la informacion disponible.

- VRAM de pesos: en fp32, el checkpoint ocupa aproximadamente 20,4 GB (coherente con los 5,09 B de parametros a 4 bytes por parametro y con el tamano del repositorio). En fp16/bf16 bajaría a unos 10,2 GB.
- VRAM total estimada en inferencia a 1024 x 768 y lote 1: en torno a 22-26 GB en fp32 y 13-18 GB en fp16/bf16, contando activaciones y buffers de atencion (estimacion, no medida).
- GPU recomendadas: A100 40 GB o 80 GB, H100 80 GB y, en general, aceleradores con al menos 24 GB para fp16. Con fp32 se recomienda un minimo de 24-32 GB utiles.
- Consumer GPU: cabe en una RTX 4090 (24 GB) en fp16/bf16; en fp32 queda al limite o no entra junto con las activaciones. En GPUs de 16 GB o menos no es viable sin cuantizacion, y no se publican pesos cuantizados.
- Despliegue: la ruta soportada oficialmente es la libreria `sapiens2` (instalacion con `pip install -e .` sobre el repositorio de GitHub) y los scripts de demo (`scripts/demo/seg.sh`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles. Como referencia de coste, el backbone consume 15.722 T FLOPs por imagen a 1024 x 768, lo que implica una carga computacional alta por inferencia individual.

## Comparativa con modelos similares

Comparativa dentro de la propia familia Sapiens2 de segmentacion corporal, unica con datos disponibles en la informacion proporcionada:

| Modelo | Parametros | FLOPs | Dim. embedding | Capas | Cabezas |
|---|---|---|---|---|---|
| Sapiens2-0.4B | 0,398 B | 1,260 T | 1024 | 24 | 16 |
| Sapiens2-0.8B | 0,818 B | 2,592 T | 1280 | 32 | 16 |
| Sapiens2-1B | 1,462 B | 4,715 T | 1536 | 40 | 24 |
| Sapiens2-5B (este) | 5,071 B (backbone) | 15,722 T | 2432 | 56 | 32 |

Comparativa con alternativas de otros desarrolladores (por ejemplo, modelos de segmentacion general como Segment Anything o de partes corporales como DensePose): no disponible. La informacion proporcionada no incluye parametros, contexto, rendimiento ni licencia de esos modelos, por lo que no se puede establecer una comparacion rigurosa.

## Limitaciones y advertencias

- Alcance restringido: el modelo esta disenado exclusivamente para segmentacion de partes del cuerpo en imagenes human-centric; no procesa texto, audio ni video, y su uso fuera de ese dominio no esta respaldado por el autor.
- Taxonomia cerrada de 29 clases: cualquier anatomia o elemento fuera de las 28 partes mas el fondo no se representa de forma fiable.
- Riesgo de error en casos limite: oclusiones severas, poses muy poco frecuentes, personas pequenas en la imagen, iluminacion extrema o imagenes de baja calidad pueden degradar las mascaras. No se publican metricas de error que permitan cuantificar este riesgo.
- Sesgos potenciales: al no documentarse la composicion del dataset de entrenamiento ni su distribucion demografica, no es posible evaluar sesgos por tono de piel, genero, complexion corporal, edad o contexto cultural. Se recomienda validacion especifica antes de cualquier uso en produccion.
- Alucinacion: en segmentacion densa, el equivalente es la asignacion de etiquetas incorrectas o la generacion de mascaras espurias en regiones ambiguas; no existen datos publicados sobre su frecuencia.
- Contexto e idioma: no aplica, ya que el modelo no tiene ventana de contexto textual ni soporte de idiomas.
- Licencia: se distribuye bajo la Sapiens2 License, que no es una licencia de codigo abierto estandar. Es imprescindible revisar `LICENSE.md` antes de cualquier uso comercial, ya que puede contener restricciones de uso, clausulas de atribucion o limitaciones de despliegue.
- Repositorio espejo: `ml-resources/sapiens2-seg-5b` no es un lanzamiento oficial de Meta y registra 0 descargas y 0 likes. Para produccion conviene partir del repositorio oficial `facebook/sapiens2-seg-5b` y verificar la integridad del checkpoint.
- Dependencia de herramienta no estandar: requiere la libreria `sapiens2` y su instalacion desde el repositorio de GitHub, lo que complica su integracion en stacks habituales de servidores de inferencia.
- Ausencia de cuantizaciones publicadas: no hay pesos en GGUF, AWQ, GPTQ ni equivalentes, lo que limita el despliegue en hardware de gama media.

## Enlaces

- Modelo en HuggingFace (espejo): https://huggingface.co/ml-resources/sapiens2-seg-5b
- Modelo oficial: https://huggingface.co/facebook/sapiens2-seg-5b
- Backbone preentrenado: https://huggingface.co/facebook/sapiens2-pretrain-5b
- Paper: https://arxiv.org/pdf/2604.21681
- Pagina del proyecto: https://rawalkhirodkar.github.io/sapiens2
- Codigo: https://github.com/facebookresearch/sapiens2
- Guia de segmentacion de partes del cuerpo: https://github.com/facebookresearch/sapiens2/blob/main/docs/SEG.md
- Licencia: https://github.com/facebookresearch/sapiens2/blob/main/LICENSE.md
- Coleccion Sapiens2: https://huggingface.co/collections/facebook/sapiens2
- Variante 0.4B: https://huggingface.co/facebook/sapiens2-seg-0.4b
- Variante 0.8B: https://huggingface.co/facebook/sapiens2-seg-0.8b
- Variante 1B: https://huggingface.co/facebook/sapiens2-seg-1b
- Cita bibliografica: Khirodkar, Rawal; Wen, He; Martinez, Julieta; Dong, Yuan; Su, Zhaoen; Saito, Shunsuke. "Sapiens2". arXiv preprint arXiv:2604.21681, 2026.

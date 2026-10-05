# guillaume-cassez/cityscape-moe-v3-experts

## Resumen

`cityscape-moe-v3-experts` es un conjunto de pesos entrenados para segmentacion semantica de escenas urbanas sobre el dataset Cityscapes, a resolucion completa de 1024×2048 pixeles y con las 19 clases oficiales. Lo publica Guillaume Cassez, con Stanislas Larnier como coautor, en el marco de una investigacion independiente asociada a un preprint depositado en Zenodo. No es un modelo de lenguaje ni un modelo multimodal: es un segmentador de imagen denso, pensado para conduccion autonoma y analisis de escenas viales.

Tecnicamente combina una columna vertebral ConvNeXt-V2-Base preentrenada en ImageNet-22K con una cabeza de segmentacion UPerNet, y anade una capa de mezcla de expertos (MoE) con cuatro expertos y una compuerta top-2 que opera sobre parches de 3×3. El entrenamiento se hizo en precision mixta BF16 y se repitio con tres semillas (42, 123 y 456), lo que permite medir varianza entre ejecuciones. El modelo se distribuye como pesos fp32 en formato safetensors, sin estado de optimizador ni de generador aleatorio.

Su relevancia es metodologica mas que de producto: el articulo compara el brazo MoE (`moe_v3cs`) contra un control emparejado sin MoE (`control_nomoe`), con la misma receta de perdida y la misma inicializacion de la columna vertebral, y lo bate por un margen estrecho (81,618 frente a 81,168 de mIoU oficial). El propio titulo del trabajo, "The gate still does not choose", sugiere que la compuerta no esta especializando a los expertos como cabria esperar, lo que convierte al repositorio en material util para reproducir y auditar ese hallazgo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt-V2-Base (ImageNet-22K) + UPerNet, con capa de mezcla de expertos (MoE) de cuatro expertos y compuerta top-2 sobre parches de 3×3 |
| Parametros totales | no disponible (la columna vertebral ConvNeXt-V2-Base ronda los 89 M; no se publica el recuento total con la cabeza UPerNet y los expertos) |
| Parametros activos | no disponible (arquitectura MoE con top-2 de cuatro expertos; no se detalla el reparto entre parametros compartidos y activados por token) |
| Longitud de contexto | no aplicable (modelo de segmentacion de imagen; resolucion de entrada 1024×2048 pixeles) |
| Tipos de cuantizacion | no disponible; los pesos se publican en fp32 y el entrenamiento se realizo en BF16 de precision mixta. No se distribuyen versiones cuantizadas (GGUF, int8, int4) |
| Idiomas soportados | en (unico idioma etiquetado en el repositorio; la tarea es de vision, sin entrada ni salida de texto) |
| Licencia | MIT para pesos y codigo; CC-BY-4.0 para el manuscrito, tablas y figuras del deposito en Zenodo. Los datos de Cityscapes conservan su propia licencia y no se redistribuyen |
| Formato de pesos | safetensors en fp32 (`<arm>/seed<S>/model.safetensors`), pesos de red unicamente, sin estado de optimizador ni de RNG |

## Arquitectura y entrenamiento

La red es un segmentador denso de tipo encoder-decoder. El encoder es ConvNeXt-V2-Base con pesos inicializados desde ImageNet-22K y el decoder es UPerNet, una cabeza piramidal clasica para segmentacion semantica. Sobre esta base se inserta una capa de mezcla de expertos con cuatro expertos inicializados a partir de las variantes que el articulo denomina B, D, Dp y G (nomenclatura interna del trabajo; la informacion disponible no detalla a que corresponde cada una), y una compuerta top-2 que enruta cada parche de 3×3 hacia dos de los cuatro expertos. La innovacion que se evalua es, por tanto, la inicializacion de los expertos a partir de modelos ya entrenados, mas que un enrutado aprendido desde cero.

El entrenamiento se hizo a resolucion completa (1024×2048), con las 19 clases oficiales de Cityscapes, en precision mixta BF16 y durante 80 epocas. El brazo MoE usa la receta de perdida "MoE-V3-CS" y el brazo de control usa entropia cruzada mas perdida Dice, con la misma inicializacion B y sin capa MoE, de modo que la comparacion aísla el efecto de la mezcla de expertos. Cada brazo se entreno con tres semillas (42, 123 y 456). No se documenta en la informacion disponible el numero total de tokens o imagenes vistas, la composicion exacta del dataset mas alla de Cityscapes, ni si hubo etapas de ajuste por RLHF o DPO (algo, por otra parte, poco habitual en segmentacion semantica).

## Capacidades

- Segmentacion semantica densa de escenas urbanas en las 19 clases oficiales de Cityscapes (carretera, acera, coche, peaton, senalizacion, vegetacion, cielo, etc.).
- Inferencia a resolucion completa de 1024×2048 pixeles, sin reescalado de la entrada.
- Salida de probabilidades por pixel a partir de las cuales se derivan mapas de etiquetas y matrices de confusion.
- Enrutado condicional por parche: la compuerta top-2 activa dos de los cuatro expertos para cada parche de 3×3.
- Reproducibilidad experimental: se publican pesos para dos brazos (MoE y control sin MoE) y tres semillas por brazo, lo que permite medir varianza entre ejecuciones.
- Exportacion y carga estandar via `safetensors.torch.load_file`.

No dispone de generacion de texto, razonamiento, codigo, matematicas, tool calling, function calling, capacidades de agente, modo "thinking" ni procesamiento de audio o lenguaje. No es un modelo vision-lenguaje y no acepta instrucciones en lenguaje natural.

## Casos de uso

- Conduccion autonoma y ADAS: percepcion semantica de la escena a resolucion nativa de la camara. La salida densa por pixel permite distinguir carretera, acera, vehiculos y peatones, informacion que alimenta modulos de planificacion y deteccion de superficie transitable.
- Pre-etiquetado de datasets de conduccion: el modelo puede generar mascaras iniciales sobre imagenes nuevas de dominio similar a Cityscapes, reduciendo el coste de anotacion manual, que despues se revisa por anotadores humanos.
- Auditoria de calidad de anotaciones: al disponer de tres semillas y dos brazos, se pueden comparar las predicciones entre ejecuciones para localizar regiones ambiguas o mal etiquetadas en un dataset existente.
- Investigacion en mezclas de expertos para vision: el repositorio esta disenado explicitamente para reproducir la comparacion MoE frente a control emparejado, con configuraciones y scripts incluidos en el repositorio companion.
- Robotica movil en entornos urbanos: un vehiculo o robot de reparto puede usar la segmentacion para clasificar el terreno y evitar zonas no transitables, siempre que el dominio visual se parezca al de las ciudades alemanas de Cityscapes.
- Analisis de trafico y planificacion urbana: extraccion de estadisticas agregadas (proporcion de asfalto, superficie de acera, presencia de vegetacion) sobre secuencias de video urbano procesadas fotograma a fotograma.
- Gemelos digitales y simulacion: generar capas semanticas del entorno real para construir escenas sinteticas o validar simuladores de conduccion.
- Evaluacion de perdidas y heuristicas de entrenamiento: al publicarse brazos con recetas de perdida distintas, sirve como punto de partida para comparar funciones de perdida alternativas en segmentacion.

## Benchmarks y rendimiento

Los unicos resultados publicados corresponden a la mIoU oficial de nivel de dataset, calculada con `cityscapesScripts` sobre el holdout compartido pre-registrado (`first:500` de la particion de validacion). No hay resultados de benchmarks de lenguaje (MMLU, HumanEval, GSM8K) porque el modelo no cubre esa tarea.

| Brazo | Epocas | Funcion de perdida | mIoU medio (%) | mIoU por semilla (42 / 123 / 456) |
|---|---|---|---|---|
| `moe_v3cs` | 80 | MoE-V3-CS: cuatro expertos inicializados desde B/D/Dp/G + compuerta top-2 sobre parches 3×3 | 81,618 | 81,814 / 81,339 / 81,701 |
| `control_nomoe` | 80 | Entropia cruzada + Dice (control emparejado, inicializacion B, sin capa MoE) | 81,168 | 81,561 / 80,556 / 81,388 |

La diferencia entre ambos brazos es de 0,450 puntos de mIoU a favor de la variante MoE. Las IoU por clase de cada ejecucion, junto con la ruta del checkpoint que las genero, estan en `<arm>/seed<S>/metadata.json`. No se han publicado resultados sobre otros datasets ni metricas adicionales (panoptica, de instancia, latencia o throughput) en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma explicita. Como referencia, el repositorio completo ocupa 3,1 GB e incluye los pesos fp32 de seis combinaciones brazo/semilla, lo que situa cada checkpoint individual en torno a 0,5 GB de pesos. A eso hay que sumar las activaciones de una entrada de 1024×2048, que en fp32 son el termino dominante del consumo. Cualquier cifra de VRAM total a resolucion completa es una estimacion, no un dato publicado.
- GPU recomendadas: no se especifican. Por el tamano del modelo y la resolucion de entrada, una GPU con 16-24 GB (RTX 4090, A100 40 GB, L40S) es un punto de partida razonable para inferencia a resolucion completa; una GPU de 24 GB deberia bastar con lote unitario.
- GPU de consumo: previsiblemente si en tarjetas de 16-24 GB (RTX 4090, RTX 4080, RTX 3090/4090 con 24 GB) para inferencia a lote 1; en tarjetas de 8-12 GB habria que reducir resolucion o dividir el modelo, lo que degrada las metricas publicadas.
- Opciones de despliegue: PyTorch con `safetensors.torch.load_file` y la arquitectura del repositorio companion (`src/`). No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje. Tampoco se distribuyen pesos GGUF ni ONNX.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo de inferencia, FPS ni consumo energetico.

## Comparativa con modelos similares

No se dispone de resultados de estos modelos en la informacion proporcionada, por lo que las celdas de rendimiento quedan marcadas como no disponibles. La comparacion se limita a la categoria y al tipo de arquitectura.

| Modelo | Arquitectura | Resolucion / clases | mIoU en Cityscapes | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `cityscape-moe-v3-experts` (`moe_v3cs`) | ConvNeXt-V2-Base + UPerNet + MoE (4 expertos, top-2, parches 3×3) | 1024×2048, 19 clases | 81,618 (holdout `first:500`, media de 3 semillas) | MIT (pesos y codigo) | HuggingFace, 0 descargas en el momento de redactar la ficha |
| `control_nomoe` (mismo repositorio) | ConvNeXt-V2-Base + UPerNet, sin MoE | 1024×2048, 19 clases | 81,168 (mismo holdout, media de 3 semillas) | MIT | HuggingFace |
| Mask2Former (familia, por ejemplo la variante Swin-L) | Transformer con consultas de mascara | 1024×2048, 19 clases | no disponible en la informacion proporcionada | distinta segun variante (habitualmente MIT o Apache-2.0) | HuggingFace, repositorio publico |
| SegFormer (familia, por ejemplo B5) | Transformer jerarquico sin posicionales explicitas | 1024×1024 (nativa), 19 clases | no disponible en la informacion proporcionada | habitualmente MIT o Apache-2.0 | HuggingFace, repositorio publico |
| UPerNet sobre ConvNeXt-V2 (linea base sin MoE, no esta publicada aqui) | ConvNeXt-V2 + UPerNet | 1024×2048, 19 clases | no disponible en la informacion proporcionada | MIT | repositorios de referencia de ConvNeXt-V2 |

## Limitaciones y advertencias

- Dominio restringido: el modelo solo se ha entrenado y evaluado en Cityscapes (escenas urbanas de ciudades alemanas, camara frontal de vehiculo). El rendimiento caera de forma notable en otros paises, condiciones meteorologicas adversas, camaras de otra altura o entornos no urbanos.
- Tarea limitada: segmentacion semantica de 19 clases. No hace segmentacion de instancia, panoptica, deteccion de objetos, profundidad ni prediccion de movimiento. No genera texto ni acepta instrucciones.
- Margen experimental estrecho: la mejora del brazo MoE sobre el control emparejado es de 0,450 puntos de mIoU, con una desviacion entre semillas que en el control llega a 1,005 puntos (80,556 en la semilla 123 frente a 81,561 en la 42). Conviene tratar la ventaja como preliminar y dependiente de la semilla.
- Evaluacion sobre un holdout reducido: 500 imagenes de la particion de validacion, pre-registradas como subconjunto compartido. No sustituye a una evaluacion sobre el conjunto de validacion completo ni sobre el test oficial de Cityscapes.
- Sin estado de optimizador ni RNG: los safetensors contienen unicamente los pesos de red, de modo que no se puede reanudar el entrenamiento desde el checkpoint tal cual se distribuye.
- Formato unico: solo fp32 safetensors. No hay versiones cuantizadas, ONNX ni TensorRT, lo que complica el despliegue en hardware embebido o en entornos con memoria limitada.
- Licencia: MIT cubre pesos y codigo, lo que permite uso comercial. Sin embargo, el manuscrito, las tablas y las figuras estan bajo CC-BY-4.0, y los datos de Cityscapes mantienen su propia licencia, que restringe el uso comercial del dataset original. Cualquier producto que se apoye en Cityscapes debe verificar esa licencia por separado; el repositorio no redistribuye datos del dataset.
- Riesgo de alucinacion: no aplicable en el sentido habitual de los modelos generativos, pero si existe el riesgo equivalente de predicciones densas con alta confianza en regiones ambiguas u ocluidas (por ejemplo, objetos recortados en el borde de la imagen o superficies reflectantes).
- Sesgos conocidos: la informacion disponible no documenta un analisis de sesgos por clase ni por condiciones de iluminacion. En datasets urbanos de este tipo son habituales los desequilibrios de clase (clases raras como motocicleta o bicicleta con menos pixeles) y la infrarrepresentacion de horarios nocturnos.
- Estado del repositorio: 0 descargas y 0 "likes" en el momento de redactar la ficha, creado y actualizado el 4 de octubre de 2026. No hay validacion de terceros ni resultados replicados de forma independiente.
- Sin soporte declarado de bibliotecas de inferencia: no se puede cargar con `transformers`, vLLM, Ollama ni llama.cpp; requiere el codigo companion del repositorio de GitHub para reconstruir la arquitectura y enganchar los expertos.

## Enlaces

- HuggingFace: https://huggingface.co/guillaume-cassez/cityscape-moe-v3-experts
- Repositorio de codigo, configuraciones y scripts: https://github.com/guillaume-cassez/cityscape-moe-experts
- DOI de concepto del preprint (resuelve siempre a la ultima version): https://doi.org/10.5281/zenodo.23090081
- Deposito vigente en el momento de redactar la ficha: https://doi.org/10.5281/zenodo.23147252
- Depositos hermanos del mismo autor:
  - https://huggingface.co/guillaume-cassez/cityscape-distmap-aux-regression
  - https://huggingface.co/guillaume-cassez/cityscape-boundary-loss-kervadec
  - https://huggingface.co/guillaume-cassez/cityscape-blob-loss-kofler
  - https://huggingface.co/guillaume-cassez/mednext-moe-v3-brats2023gli
- Resultados de la busqueda web: las consultas realizadas devolvieron unicamente paginas sobre el nombre propio "Guillaume" (Wikipedia, articulos sobre el significado del nombre), sin ninguna relacion con el modelo. No se han encontrado articulos de terceros, demos ni replicas independientes.

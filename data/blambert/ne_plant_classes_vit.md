# blambert/ne_plant_classes_vit

## Resumen

NE Plant Classes ViT es un clasificador de imagenes basado en un Vision Transformer. Se trata de un ajuste fino de google/vit-base-patch16-224-in21k sobre el conjunto de datos blambert/ne_plant_classes, publicado por el usuario blambert. Su funcion no es identificar especies vegetales, sino separar fotografias de plantas utiles para trabajo de campo del resto de imagenes que aparecen mezcladas en los archivos de iNaturalist. Concretamente distingue cuatro clases: `nature` (planta fotografiada en el campo), `human` (una mano o una persona en el encuadre), `magnified` (vista de microscopio o macro) y `manmade` (reglas, etiquetas, laboratorios, vallas, pliegos de herbario).

El modelo tiene 85.801.732 parametros (aproximadamente 86 millones) y una entrada fija de imagenes de 224x224 pixeles. Se distribuye en safetensors bajo licencia Apache 2.0, con un tamano de repositorio de 0,3 GB, y es compatible con el pipeline `image-classification` de la libreria transformers. La motivacion declarada por el autor es sustituir por un modelo barato y rapido la tarea que un modelo de vision-lenguaje estaba realizando sobre ese mismo conjunto de datos: el filtrado previo de imagenes utilizables antes de ensamblar un dataset de fotografia vegetal como blambert/ne_plant_photos.

Su relevancia actual es acotada pero concreta: demuestra el patron de destilacion de un clasificador pequeno a partir de las etiquetas de un VLM grande para tareas de curacion de datos a escala. El modelo es muy reciente (repositorio creado el 14 de septiembre de 2026) y tiene una adopcion todavia muy baja: 18 descargas y ninguna marca de "me gusta" en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base, parches de 16x16, resolucion 224x224, preentrenado en ImageNet-21k) |
| Parametros totales | 85.801.732 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (modelo de vision con entrada fija de 224x224 pixeles; no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible (el autor no publica versiones cuantizadas; al ser un modelo de 86 M de parametros, la cuantizacion es viable con herramientas externas) |
| Idiomas soportados | no disponible (no procesa texto; las etiquetas de salida estan en ingles: `nature`, `human`, `magnified`, `manmade`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos de transformers) |
| Numero de clases | 4 |
| Tamano del repositorio | 0,3 GB |
| Libreria | transformers |
| Pipeline | image-classification |
| Modelo base | google/vit-base-patch16-224-in21k |
| Dataset de entrenamiento | blambert/ne_plant_classes |
| Fecha de creacion del repositorio | 2026-09-14 |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer estandar de tipo base: parches de 16x16 pixeles sobre entradas de 224x224, es decir 196 tokens por imagen mas el token de clase, con el encoder transformer preentrenado por Google en ImageNet-21k. Sobre esa base se anade una cabeza de clasificacion de cuatro salidas, correspondientes a las etiquetas `nature`, `human`, `magnified` y `manmade`. El quinto rotulo del dataset original, `other`, contaba con solo 26 ejemplos y se descarto antes del entrenamiento, por lo que el modelo nunca lo predice.

Los datos de entrenamiento proceden del archivo de datos abiertos de iNaturalist, restringido a un cuadro delimitador de Nueva Inglaterra (latitud 41 a 48, longitud -74 a -67): 151.919 fotografias en total. La distribucion por etiquetas es muy desigual: `nature` 114.192 imagenes (75,2 %), `human` 33.702 (22,2 %), `manmade` 2.310 (1,5 %) y `magnified` 1.715 (1,1 %). Un punto critico es que las etiquetas no son anotacion humana, sino la salida del modelo Qwen/Qwen3.5-9B, y no se verificaron contra una muestra anotada a mano: el clasificador aprende a coincidir con Qwen, incluidos sus errores.

El procedimiento de entrenamiento consistio en barajar con semilla 42 y dividir en 60 % entrenamiento, 20 % validacion y 20 % prueba, de forma estratificada por etiqueta. Las imagenes se redimensionaron completas a 224x224 sin recorte, decision deliberada porque la senal que define la etiqueta (una regla, una mano) suele estar cerca del borde del encuadre; durante el entrenamiento se anadio un volteo horizontal aleatorio. Se realizaron 10 epocas con tamano de lote 64 y tasa de aprendizaje 2e-5 en precision mixta bf16. La evaluacion sobre la particion de validacion se hizo cada 5 % del entrenamiento, conservando el checkpoint con mejor F1 macro, criterio elegido porque la exactitud premia predecir siempre `nature`, clase que por si sola ya alcanza el 75 %. El codigo de entrenamiento es `train_classifier.py` del repositorio plant-pics.

## Capacidades

- Clasificacion de imagenes en cuatro categorias excluyentes: `nature`, `human`, `magnified` y `manmade`.
- Distincion de fotografias de campo utilizables frente a imagenes con presencia humana (manos, personas), vistas ampliadas (microscopio o macro) o elementos artificiales (reglas, etiquetas, vallas, pliegos de herbario).
- Inferencia rapida y de bajo coste en comparacion con un modelo de vision-lenguaje, al tratarse de un ViT de 86 millones de parametros.
- Integracion directa con el pipeline `image-classification` de transformers mediante una unica llamada.
- Salida de probabilidades por clase, apta para umbralizar y construir filtros por confianza.
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo generativo ni agentico.
- No soporta capacidades multilingues en el sentido textual; las etiquetas de salida son fijas y estan en ingles.
- No realiza identificacion de especies, deteccion de objetos con cajas delimitadoras, segmentacion ni descripcion textual de la imagen.

## Casos de uso

- Curacion de datasets de flora: el modelo actua como filtro previo que separa fotografias de campo validas del resto antes de ensamblar un corpus de entrenamiento, que es exactamente el proposito declarado por el autor para construir blambert/ne_plant_photos.
- Reduccion de costes frente a un VLM: sustituye a un modelo de vision-lenguaje en la tarea de triaje, de modo que las llamadas caras al VLM se reservan para las imagenes ambiguas o para tareas que si requieren generacion de texto.
- Ciencia ciudadana y plataformas de observacion: clasificacion automatica de las imagenes subidas por usuarios para detectar encuadres con manos o personas y avisar de una calidad fotografica pobre para identificacion.
- Digitalizacion de herbarios: deteccion de pliegos de herbario, reglas de escala y etiquetas (`manmade`) frente a fotografias de plantas vivas, lo que permite enrutar cada imagen al flujo de catalogacion adecuado.
- Triaje en flujos de microscopia: separacion de vistas macro o de microscopio (`magnified`) del resto de imagenes de campo, util en laboratorios que mezclan ambos tipos de captura en un mismo repositorio.
- Revision de privacidad antes de publicar: marcado de imagenes que contienen manos o personas (`human`) en un archivo fotografico antes de su publicacion o cesion a terceros.
- Prefiltrado en pipelines de identificacion de especies: al reducir el ruido del conjunto de entrada, mejora la precision efectiva de los modelos posteriores de clasificacion taxonomica, aunque este modelo por si solo no identifica especies.
- Procesamiento por lotes en CPU: con 86 millones de parametros, el modelo puede ejecutarse sobre grandes volumenes de imagenes sin GPU dedicada, lo que abarata el reprocesamiento de archivos historicos.

## Benchmarks y rendimiento

Los resultados publicados por el autor corresponden a la particion de prueba de 30.384 fotografias. El mejor checkpoint provino de la epoca 3 (paso 4.278 de 14.250), con un F1 macro de validacion de 0,887. Las metricas globales son las siguientes.

| Metrica | Valor |
|---|---|
| Exactitud (accuracy) | 0,984 |
| F1 macro | 0,902 |
| Precision macro | 0,913 |
| Exhaustividad macro (recall) | 0,891 |
| Perdida (loss) | 0,081 |

Desglose por etiqueta:

| Etiqueta | Precision | Exhaustividad | F1 | Soporte |
|---|---|---|---|---|
| nature | 0,990 | 0,991 | 0,990 | 22.839 |
| human | 0,982 | 0,985 | 0,984 | 6.740 |
| manmade | 0,744 | 0,686 | 0,714 | 462 |
| magnified | 0,936 | 0,901 | 0,918 | 343 |

Matriz de confusion (filas: etiqueta real; columnas: prediccion):

| Real \ Predicho | nature | human | manmade | magnified |
|---|---|---|---|---|
| nature | 22.629 | 103 | 87 | 20 |
| human | 78 | 6.642 | 20 | 0 |
| manmade | 129 | 15 | 317 | 1 |
| magnified | 30 | 2 | 2 | 309 |

No se han publicado en la informacion disponible resultados comparativos frente a otros modelos sobre este mismo conjunto de datos, ni metricas estandar tipo ImageNet, por lo que no se pueden establecer comparaciones numericas con alternativas. La propia model card advierte que estas cifras miden la concordancia con las etiquetas generadas por Qwen sobre fotografias no vistas, no la exactitud frente a una verdad de referencia humana.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los pesos ocupan aproximadamente 0,34 GB; en fp16 o bf16, unos 0,17 GB; en int8, unos 0,09 GB. A esas cifras hay que sumar el coste de las activaciones, que depende del tamano de lote y de la resolucion de entrada.
- Cabe holgadamente en cualquier GPU de consumo: tarjetas con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090, etc.) son suficientes incluso con lotes grandes. La clasificacion a 224x224 con lote pequeno ocupa muy por debajo de 1 GB.
- Es viable la inferencia en CPU para procesamiento por lotes; con 86 millones de parametros el coste por imagen es bajo, si bien no se han publicado mediciones de latencia ni de throughput en la informacion disponible.
- GPU recomendadas para servicio de alta concurrencia: cualquier acelerador moderno de gama media o superior (A10, L4, A100, H100) queda sobredimensionado para este modelo; su uso tendria sentido solo para agregar muchos lotes simultaneos.
- Opciones de despliegue: pipeline `image-classification` de transformers, exportacion a ONNX u OpenVINO mediante Optimum para acelerar en CPU, TorchScript, TorchServe o los endpoints compatibles de Hugging Face (la etiqueta `endpoints_compatible` aparece en el repositorio). No se publican pesos en formato GGUF ni conversiones a llama.cpp u Ollama, que ademas no son el formato habitual para clasificadores de imagen.
- Latencia y throughput estimados: no disponible. El autor no publica mediciones de rendimiento en inferencia.

## Comparativa con modelos similares

La comparacion se limita a caracteristicas estructurales, ya que no hay resultados de benchmarks compartidos entre estos modelos en la informacion disponible.

| Modelo | Parametros | Tarea | Clases | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| blambert/ne_plant_classes_vit | 85.801.732 | Clasificacion de imagenes | 4 (nature, human, magnified, manmade) | Imagen 224x224 | Apache 2.0 | Hugging Face, safetensors |
| google/vit-base-patch16-224-in21k | ~86 M | Modelo base preentrenado (sin cabeza de clasificacion especifica) | no aplica (representaciones) | Imagen 224x224 | Apache 2.0 | Hugging Face |
| google/vit-base-patch16-224 | ~86 M | Clasificacion de imagenes | 1.000 clases de ImageNet-1k | Imagen 224x224 | Apache 2.0 | Hugging Face |

Frente a ambos, este modelo aporta una taxonomia especifica del dominio de fotografia vegetal de Nueva Inglaterra que no existe en los checkpoints genericos de Google. A cambio, pierde generalidad: no reconoce las 1.000 clases de ImageNet ni sirve como extractor de caracteristicas de proposito general sin reentrenamiento. No se dispone de datos que permitan afirmar que sea mejor o peor que un VLM generico en esta tarea, mas alla de la propia declaracion del autor de que se construyo para hacer "de forma barata" lo que el VLM hacia.

## Limitaciones y advertencias

- Las metricas de prueba miden la concordancia con las etiquetas generadas por Qwen/Qwen3.5-9B sobre fotografias no vistas, no la exactitud frente a una verdad de referencia. Las etiquetas no se validaron contra una muestra anotada a mano, de modo que el modelo reproduce tambien los errores del etiquetador automatico.
- Desequilibrio de clases severo: `manmade` y `magnified` tienen menos de 2.500 ejemplos cada una. `manmade` es con diferencia la clase mas debil, con F1 de 0,714, y aproximadamente tres de cada diez fotografias de esa categoria se clasifican erroneamente como `nature` (129 de 462 casos).
- La mayor parte de los errores implican a `nature`: ademas de los falsos negativos de `manmade`, las fotografias de `nature` generan 87 de las 109 predicciones falsas de `manmade`.
- Sesgo geografico: todas las fotografias de entrenamiento proceden de observaciones de iNaturalist en Nueva Inglaterra. Imagenes de otras regiones, fuentes o configuraciones de camara pueden diferir lo suficiente como para degradar la exactitud.
- Sesgo de dominio: el modelo esta ajustado a la apariencia de las fotografias de iNaturalist (encuadre, resolucion, iluminacion). Su traslado a otros corpus, como archivos de herbario institucionales o bancos de imagenes comerciales, no esta validado.
- No identifica especies ni proporciona descripciones textuales; cualquier expectativa en ese sentido queda fuera del alcance del modelo.
- La etiqueta `other` del dataset original se elimino del entrenamiento por contar con solo 26 ejemplos, por lo que el modelo la asignara forzosamente a una de las cuatro clases restantes, aunque no encaje.
- Licencia de los pesos: Apache 2.0, lo que permite uso comercial del modelo. Sin embargo, las fotografias de entrenamiento conservan sus licencias de iNaturalist, mayoritariamente CC-BY-NC, con presencia tambien de CC-BY, CC0, CC-BY-NC-SA y CC-BY-SA, y no se redistribuyen en el repositorio. Conviene revisar las implicaciones de este origen de datos antes de un despliegue comercial.
- Adopcion muy baja (18 descargas, 0 marcas de "me gusta") y ausencia de validacion independiente: no hay terceros que hayan reproducido las metricas publicadas.
- No se publican versiones cuantizadas ni mediciones de latencia, lo que obliga a evaluar el rendimiento en produccion por cuenta propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/blambert/ne_plant_classes_vit
- Modelo base: https://huggingface.co/google/vit-base-patch16-224-in21k
- Dataset de entrenamiento: https://huggingface.co/datasets/blambert/ne_plant_classes
- Dataset derivado mencionado en la model card: https://huggingface.co/datasets/blambert/ne_plant_photos
- Codigo de entrenamiento (repositorio plant-pics): https://github.com/belambert/plant-pics
- Etiquetador automatico utilizado: https://huggingface.co/Qwen/Qwen3.5-9B
- Archivo de datos abiertos de iNaturalist: no disponible como enlace directo en la informacion proporcionada (el autor lo cita como "iNaturalist open data archive").
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo. Los resultados devueltos por la busqueda trataban sobre la papelera de reciclaje de Android, Google Photos, eBay Italia y Gmail, y no guardan relacion con el modelo ni con su dominio.

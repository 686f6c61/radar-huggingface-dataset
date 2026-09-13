# ausjahk/animal-classifier-cnn-from-scratch

## Resumen

`ausjahk/animal-classifier-cnn-from-scratch` es un clasificador de imágenes binario (gato frente a perro) publicado en HuggingFace por el usuario ausjahk bajo el pipeline `image-classification`. No se trata de un modelo de lenguaje: es una red neuronal convolucional (CNN) de 4 bloques convolucionales disenada y entrenada desde cero, es decir, con inicializacion aleatoria de pesos y sin partir de ningun modelo preentrenado. Cuenta con 4.584.450 parametros y una cabeza clasificadora densa con dropout de 0,5.

El modelo se entreno sobre el dataset público Cat and Dog de Kaggle y alcanza una exactitud maxima en test del 67,82 %. Se distribuye con los tags `pytorch`, `cnn`, `from-scratch`, `animals` y `cats-vs-dogs`, y esta registrado en la region `us` de HuggingFace.

Su relevancia es principalmente didactica o de referencia: sirve como ejemplo reproducible de entrenamiento desde cero con inicializacion Kaiming, normalizacion por lotes y una arquitectura convolucional sencilla, sin dependencia de pesos preentrenados. La ficha del modelo es muy breve y no documenta licencia, idiomas, formato de pesos ni procedimiento de entrenamiento completo, por lo que buena parte de los datos tecnicos figuran como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN propia de 4 bloques convolucionales (32 a 64 a 128 a 256 filtros) con BatchNorm, ReLU y MaxPool2d, mas cabeza densa con dropout 0,5 |
| Parametros totales | 4.584.450 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no secuencial) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (clasificacion de imagenes en dos clases: gato y perro) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio figura con 0,0 GB, no se confirma publicacion de pesos) |
| Tarea | Clasificacion de imagenes binaria (gato frente a perro) |
| Inicializacion | Kaiming Normal explicita, pesos aleatorios sin preentrenamiento |
| Framework | PyTorch (segun tags) |

## Arquitectura y entrenamiento

La red consta de 4 bloques convolucionales con un numero creciente de filtros (32, 64, 128 y 256). Cada bloque combina convolucion, normalizacion por lotes (BatchNorm), activacion ReLU y reduccion espacial mediante MaxPool2d. La salida de los bloques se conecta a una cabeza clasificadora densa con dropout de 0,5, orientada a una clasificacion binaria. La inicializacion de pesos se realizo de forma explicita con Kaiming Normal, coherente con el caracter "from-scratch" del modelo: no se emplearon pesos preentrenados ni transferencia de aprendizaje.

En cuanto a los datos, el autor indica entrenamiento sobre el dataset Cat and Dog de Kaggle. No se especifica el numero de imagenes utilizadas, la composicion exacta del conjunto, si hubo aumento de datos, el numero de epocas, la funcion de perdida, el optimizador, la tasa de aprendizaje ni si se aplicaron tecnicas de regularizacion adicionales. Tampoco se documenta ningun proceso de ajuste fino con RLHF o DPO, algo que no aplica a un clasificador de imagenes. La unica metrica de rendimiento declarada es la exactitud maxima en test, 67,82 %.

## Capacidades

- Clasificacion de imagenes binaria: distingue entre las clases gato y perro.
- Extraccion de caracteristicas visuales mediante una jerarquia de 4 bloques convolucionales.
- Inferencia autocontenida: al no depender de pesos preentrenados, el modelo es completamente independiente de terceros.
- Entrenamiento reproducible desde cero con inicializacion Kaiming y normalizacion por lotes.
- Soporte de tool calling / function calling: no aplica.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica; la salida son etiquetas de clase, no texto.
- Capacidades especiales (modo thinking, vision compleja, audio): no disponible; no se documentan.

## Casos de uso

- Prototipado educativo de vision por computador: el modelo sirve como ejemplo minimo y reproducible de una CNN entrenada desde cero, util en cursos y tutoriales sobre convoluciones, BatchNorm y dropout.
- Filtrado preliminar de imagenes en un pipeline de datos: puede usarse para separar de forma rapida imagenes de gatos y perros antes de un etiquetado manual, aceptando su margen de error del orden del 32 %.
- Prueba de concepto en aplicaciones de mascotas: en una app de adopcion, podria preclasificar fotos subidas por usuarios para dirigirlas al formulario correcto (gato o perro).
- Comparacion de tecnicas de inicializacion y regularizacion: al ser un modelo pequeno y de codigo conceptualmente simple, resulta adecuado como banco de pruebas para experimentos de ablation en laboratorio.
- Integracion embebida o en el borde: con 4,58 millones de parametros y un peso en coma flotante de 32 bits de aproximadamente 18 MB, es viable ejecutarlo en dispositivos con recursos muy limitados, como Raspberry Pi o moviles.
- Generacion de datasets sinteticos o aumentados en investigacion: puede emplearse como clasificador debil (weak labeler) para preetiquetar grandes volumenes de imagenes de bajo riesgo.
- Docencia sobre limites de los modelos from-scratch: su exactitud del 67,82 % permite ilustrar de forma cuantitativa la brecha frente a arquitecturas preentrenadas en tareas de vision.

## Benchmarks y rendimiento

Los unicos resultados disponibles son los declarados por el autor en la model card:

| Benchmark | Resultado | Conjunto de evaluacion | Tarea |
|---|---|---|---|
| Exactitud maxima en test | 67,82 % | Kaggle Cat and Dog (test) | Clasificacion binaria gato/perro |

No se han publicado en la informacion disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros), algo esperable al no tratarse de un modelo de lenguaje. Tampoco se aportan matrices de confusion, precision, recall, F1 ni curvas de aprendizaje.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision FP32, los pesos ocupan aproximadamente 18 MB (4.584.450 parametros x 4 bytes); junto con activaciones y buffers, el consumo realista es inferior a 1 GB.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluidas tarjetas de gama de entrada; el modelo no requiere A100, H100 ni RTX 4090. Una GTX 1050 o superior es mas que suficiente.
- Ejecucion en CPU: totalmente viable; el modelo cabe en memoria y el coste por inferencia es bajo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos diez anos, e incluso en hardware embebido tipo Raspberry Pi.
- Opciones de despliegue: no documentadas por el autor. Dado el framework declarado (PyTorch), las vias naturales serian la propia API de PyTorch, TorchScript o la exportacion a ONNX Runtime; estas opciones son inferencias y no estan confirmadas en la model card. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de imagenes de este tamano.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- Nota sobre pesos: el repositorio figura con un tamano de 0,0 GB, por lo que no se puede confirmar que los pesos entrenados esten publicados.

## Comparativa con modelos similares

No se dispone de comparativas publicadas por el autor ni de resultados de modelos alternativos medidos sobre el mismo protocolo en la informacion proporcionada.

| Modelo | Parametros | Contexto | Exactitud | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ausjahk/animal-classifier-cnn-from-scratch | 4.584.450 | no aplica | 67,82 % (test, Kaggle Cat and Dog) | no disponible | repositorio de 0,0 GB; pesos no confirmados |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

Cabe senalar que existen arquitecturas convolucionales clasicas (LeNet, AlexNet, VGG, ResNet) que abordan la misma tarea, pero no se han aportado datos de rendimiento de ninguna de ellas en esta informacion, por lo que no se establece comparacion cuantitativa.

## Limitaciones y advertencias

- Exactitud limitada: un 67,82 % en test implica que aproximadamente una de cada tres imagenes se clasifica incorrectamente, insuficiente para decisiones automatizadas con impacto.
- Alcance restringido: el modelo es binario (gato frente a perro) y no se ha documentado su comportamiento con otras especies, razas o dominios visuales.
- Sesgo de dominio: al entrenarse unicamente con el dataset Cat and Dog de Kaggle, es probable que generalize mal ante imagenes con iluminacion, angulos, fondos o resoluciones distintas a las de ese conjunto.
- Riesgo de sobreajuste: no se documentan tecnicas de aumento de datos, validacion cruzada ni curvas de entrenamiento, por lo que no puede descartarse.
- Licencia no especificada: al no declararse licencia, no hay autorizacion explicita para uso comercial; conviene contactar con el autor antes de cualquier uso en produccion.
- Disponibilidad de pesos no confirmada: el tamano de repositorio de 0,0 GB sugiere que los pesos pueden no estar publicados, lo que impediria reproducir la inferencia.
- Falta de documentacion: no hay informacion sobre numero de imagenes, epocas, optimizador, perdida ni estrategia de evaluacion, lo que dificulta auditar o replicar los resultados.
- Advertencia sobre la fecha de publicacion: el modelo figura creado y actualizado el 13 de septiembre de 2026, dato que conviene verificar en la pagina del repositorio.
- Sin soporte de texto, tool calling ni agentes: cualquier expectativa en ese sentido queda fuera del alcance del modelo.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/ausjahk/animal-classifier-cnn-from-scratch
- Dataset empleado en el entrenamiento (Kaggle Cat and Dog): https://www.kaggle.com/datasets/tongpython/cat-and-dog
- Las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los resultados obtenidos correspondian a contenidos sin relacion (tienda de trajes SUITSUPPLY) y se han descartado.

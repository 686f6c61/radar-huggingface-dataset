# Pranav-Sriv/smai-assignment-4-mlp

## Resumen

El modelo identificado como `Pranav-Sriv/smai-assignment-4-mlp` es un perceptron multicapa (MLP) de tres capas disenado para clasificar imagenes de CIFAR-10 en 10 clases. No es un modelo de lenguaje ni un modelo fundacional: se trata del artefacto de una practica academica (SMAI Assignment 4, seccion 1.5) publicado en HuggingFace por el usuario Pranav-Sriv, con 0 descargas y 0 likes en el momento de la consulta. Su unica finalidad es servir como linea base reproducible de un ejercicio de aprendizaje automatico clasico.

La arquitectura es una red totalmente conectada `3072 -> 64 -> 10` con activacion ReLU en la capa oculta e identidad en la salida, lo que arroja 197.322 parametros entrenables. La entrada son imagenes RGB de 32x32x3 aplanadas en orden HWC row-major (3072 caracteristicas por muestra) y la salida son logits sin normalizar, de los que se toma el argmax como clase predicha. El entrenamiento se hizo desde cero sobre las 50.000 imagenes de entrenamiento originales de CIFAR-10, con entropia cruzada media, SGD, tasa de aprendizaje 0.05, tamano de lote 64, una actualizacion por lote, 100 epocas, sin parada temprana y semilla 11023, sin ruido de etiquetas.

Su relevancia es puramente pedagogica y metodologica: documenta de forma transparente hiperparametros, metrica final y ficheros de pesos en dos formatos (PyTorch y NumPy), lo que lo convierte en un ejemplo util de trazabilidad experimental y de verificacion cruzada entre implementaciones. No debe considerarse en ningun caso un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptron multicapa (MLP) totalmente conectado: 3072 -> 64 -> 10, ReLU en capa oculta, salida identidad (logits) |
| Parametros totales | 197.322 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificador de imagenes; entrada fija de 3072 valores float correspondientes a 32x32x3) |
| Tipos de cuantizacion | no disponible (los pesos publicados estan en `model.pt` como `state_dict` de PyTorch, presumiblemente float32; no se documenta ni se distribuye ninguna variante cuantizada) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje; tarea de vision por computador con 10 clases en ingles en CIFAR-10) |
| Licencia | no disponible (la model card no declara licencia) |
| Formato de pesos | `model.pt` (state dict de PyTorch), `weights.npz` (claves `W0`, `b0`, `W1`, `b1`), `preprocessing.npz` (media y desviacion tipica por columna) y `config.json` (arquitectura, ajustes de entrenamiento, orden de clases y metricas) |

Datos adicionales de la ficha de HuggingFace: libreria declarada `pytorch`, tamano del repositorio 0.0 GB, creado el 2026-10-16, actualizado el mismo dia, sin pipeline declarado. Etiquetas: `pytorch`, `cifar10`, `mlp`, `from-scratch`, `dataset:uoft-cs/cifar10`, `region:us`.

## Arquitectura y entrenamiento

La arquitectura es un MLP de dos capas lineales sin sesgo convolucional ni mecanismos de atencion: `nn.Linear(3072, 64)` seguida de `nn.ReLU()`, `nn.Linear(64, 10)` y `nn.Identity()`. La capa de entrada consume la imagen aplanada en orden HWC row-major, sin transponer a CHW; la normalizacion se aplica por columna con la media y la desviacion tipica calculadas sobre las 50.000 imagenes de entrenamiento tras dividir por 255, sustituyendo las desviaciones tipicas nulas por 1. La salida son logits crudos y la prediccion es su argmax. El orden de las clases esta documentado en `config.json`.

El entrenamiento empleo perdida de entropia cruzada media, optimizador SGD, tasa de aprendizaje 0.05, tamano de lote 64 con una actualizacion por lote, 100 epocas completas, sin parada temprana, semilla 11023 y sin ruido de etiquetas ("clean labels"). La seleccion de arquitectura se realizo en la seccion 1.2.5 del enunciado usando exactitud de validacion, y el autor indica explicitamente que en este experimento no se hizo seleccion de arquitectura basada en el conjunto de test. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable al no tratarse de un modelo generativo. Tampoco se documenta ninguna innovacion de inferencia (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Clasificacion de imagenes de 32x32 pixeles en RGB en una de las 10 clases de CIFAR-10 (avion, automovil, ave, gato, ciervo, perro, rana, caballo, barco, camion, segun el orden registrado en `config.json`).
- Inferencia sobre lotes de tamano arbitrario: la funcion de ejemplo del autor acepta un array NumPy `uint8` de forma `(N, 32, 32, 3)` y devuelve un vector de indices de clase de longitud `N`.
- Reproduccion exacta de un experimento academico con semilla fijada (11023) e hiperparametros documentados.
- Exportacion e interoperabilidad de pesos en dos formatos: `state_dict` de PyTorch y `npz` con arreglos `W0`, `b0`, `W1`, `b1`, lo que permite reimplementar la inferencia sin PyTorch.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, function calling, soporte de agentes ni modo de razonamiento extendido.
- Sin capacidades multilingues ni de audio. Sin procesamiento de imagenes de resolucion distinta a 32x32 sin redimensionado previo por parte del usuario.

## Casos de uso

- Material docente para cursos de introduccion a redes neuronales: el modelo ilustra de forma minima el ciclo completo de entrenamiento, evaluacion y publicacion de artefactos, con todos los hiperparametros y la semilla explicitados.
- Linea base reproducible en experimentos de CIFAR-10: sirve como referencia inferior frente a la que medir la mejora de arquitecturas convolucionales o resnet, ya que el propio autor documenta una exactitud de test del 42,060%.
- Verificacion de paridad entre implementaciones: los ficheros `model.pt` y `weights.npz` permiten comprobar que una reimplementacion en NumPy puro reproduce exactamente los logits del modelo en PyTorch, util como prueba de integracion en pipelines de conversion de formatos.
- Prueba de humo (smoke test) de infraestructura de despliegue: con menos de 1 MB de pesos, es un candidato ideal para validar rutas de carga, versionado y servido de modelos en entornos nuevos sin consumir GPU ni ancho de banda.
- Estudio de preprocesado: el fichero `preprocessing.npz` permite replicar exactamente la normalizacion por columna y analizar como el aplanado HWC frente a CHW afecta a este tipo de redes, un error habitual en implementaciones propias.
- Experimentos de sensibilidad al ruido de etiquetas: dado que esta ejecucion usa etiquetas limpias y el enunciado original contempla variantes con ruido, el modelo sirve como condicion de control en comparaciones de robustez.
- Fixture de tests de serializacion: util para comprobar que un cargador de modelos rechaza ficheros corruptos, respeta `weights_only=True` y gestiona correctamente la ausencia de credenciales u optimizador en el state dict.

## Benchmarks y rendimiento

Los unicos resultados publicados por el autor en la model card son los siguientes, correspondientes a una unica semilla (11023) sobre 100 epocas:

| Metrica | Valor |
|---|---|
| Exactitud de entrenamiento (epoca 100) | 68,052 % |
| Exactitud de test | 42,060 % |
| F1 medio de test | 0,416614 |
| Parametros | 197.322 |
| Epocas | 100 |
| Tamano de lote | 64 |
| Tasa de aprendizaje | 0,05 |
| Optimizador | SGD |
| Semilla | 11023 |

El autor advierte explicitamente de que son resultados de una practica con una sola semilla y que no constituyen un benchmark de produccion. No se han publicado en la informacion disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros) porque no son aplicables a este tipo de modelo. Tampoco se proporcionan cifras de validacion cruzada, desviacion entre semillas ni comparaciones internas con otras arquitecturas.

## Requisitos de hardware

- Pesos en float32: 197.322 parametros x 4 bytes = 789.288 bytes, aproximadamente 0,77 MiB (0,79 MB). El repositorio figura con 0.0 GB de tamano.
- VRAM estimada: no requiere GPU. La inferencia puede ejecutarse integramente en CPU; el modelo y sus activaciones ocupan menos de unos pocos megabytes incluso con lotes grandes.
- GPU recomendadas: ninguna en particular; funcionaria en cualquier GPU compatible con PyTorch, aunque es innecesaria. El autor carga el modelo con `map_location="cpu"`, lo que confirma que el artefacto esta pensado para CPU.
- Encaje en GPU de consumo: si, en cualquier GPU de consumo e incluso en dispositivos de muy bajos recursos (Raspberry Pi, microcontroladores con runtime adecuado, inferencia en NumPy puro).
- Opciones de despliegue: inferencia directa con PyTorch, reimplementacion en NumPy usando `weights.npz`, exportacion a TorchScript u ONNX por parte del usuario. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, motores orientados a modelos de lenguaje y no aplicables aqui.
- Latencia y throughput: no disponibles. No se han publicado mediciones de latencia ni de muestras por segundo en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks internos ni de comparaciones publicadas por el autor que permitan contrastar este modelo con alternativas concretas de forma cuantitativa. Como referencia cualitativa, un MLP de este tamano sobre CIFAR-10 se situa tipicamente muy por debajo de una red convolucional pequena, que es la familia de modelos comparable en la misma tarea y conjunto de datos.

| Criterio | Este modelo (MLP 3072-64-10) | CNN pequena sobre CIFAR-10 | Modelo fundacional multimodal |
|---|---|---|---|
| Parametros | 197.322 | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |
| Tipo de entrada | 32x32x3 fija, aplanada | imagenes 32x32x3 con estructura espacial | imagenes de resolucion variable y texto |
| Exactitud en CIFAR-10 | 42,060 % (test, semilla unica) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |
| Licencia | no disponible | no disponible | no disponible |
| Disponibilidad | repositorio publico en HuggingFace con 0 descargas | no disponible | no disponible |
| Idoneidad para produccion | no, resultado academico de una sola semilla | no disponible | no disponible |

## Limitaciones y advertencias

- Rendimiento bajo y sin validacion estadistica: 42,060 % de exactitud en test frente a 68,052 % en entrenamiento, con una brecha de mas de 25 puntos que indica sobreajuste, calculada sobre una unica semilla.
- No es un benchmark de produccion: el propio autor lo declara explicitamente; no hay validacion cruzada ni intervalos de confianza.
- Alucinacion: no aplica en el sentido generativo, pero el modelo siempre devuelve una de las 10 clases con total confianza relativa, sin mecanismo de rechazo ante entradas fuera de distribucion (imagenes que no pertenezcan a CIFAR-10 o con otra resolucion).
- Sensibilidad a la resolucion y al formato de entrada: solo acepta imagenes de 32x32x3 aplanadas en orden HWC row-major; transponer a CHW o alterar el orden de los canales produce predicciones incorrectas sin ningun aviso.
- Dependencia del preprocesado: la normalizacion por columna de `preprocessing.npz` es obligatoria; omitirla degrada la salida de forma silenciosa.
- Sin capacidades de lenguaje, agentes, tool calling, vision general, audio ni multilingue.
- Riesgo de sesgo: no se documenta ningun analisis de sesgo por clase ni por atributos; CIFAR-10 contiene clases con solapamiento visual (por ejemplo, gato y perro) que un MLP sin estructura espacial no discrimina bien.
- Licencia no declarada: al no especificarse licencia en la model card ni en los metadatos, no hay autorizacion explicita para uso comercial. Conviene contactar con el autor antes de cualquier uso fuera del ambito academico.
- Procedencia y soporte: repositorio con 0 descargas y 0 likes, sin mantenimiento declarado, sin model card extendida, sin paper asociado y sin proceso de soporte.
- Fecha de creacion registrada como 2026-10-16, posterior a la fecha actual de la mayoria de referencias; conviene verificar la integridad y el origen del repositorio antes de reutilizarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Pranav-Sriv/smai-assignment-4-mlp
- Dataset de referencia: https://huggingface.co/datasets/uoft-cs/cifar10
- Paper, blog, repositorio de codigo o demo: no disponible en la informacion proporcionada.

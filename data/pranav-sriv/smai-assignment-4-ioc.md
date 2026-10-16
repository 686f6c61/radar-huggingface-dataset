# Pranav-Sriv/smai-assignment-4-ioc

# Ficha de modelo: IOC-NN (smai-assignment-4-ioc)

## Resumen

El repositorio `Pranav-Sriv/smai-assignment-4-ioc` no contiene un modelo de lenguaje, sino un clasificador de imagenes de tipo perceptron multicapa (MLP) entrenado desde cero sobre CIFAR-10. Se trata de un artefacto academico asociado a la asignatura SMAI (Assignment 4), cuyo objetivo es estudiar una variante denominada IOC-NN (red neuronal con restricciones de no negatividad sobre los pesos) frente a un MLP convencional emparejado, en el escenario de etiquetas limpias ("clean labels"). El modelo final corresponde a la epoca 100 y se compara en la seccion 1.5 del trabajo.

La arquitectura es deliberadamente minima: una capa de entrada de 3072 dimensiones (imagenes RGB de 32x32 aplanadas en orden HWC), una capa oculta de 64 neuronas con activacion ELU, y una capa de salida de 10 neuronas con activacion identidad que devuelve logits. El total es de 197.322 parametros. La innovacion del trabajo no esta en el tamano sino en la restriccion: tras cada paso de SGD, los pesos de todas las capas posteriores a la primera (incluida la de salida) se fuerzan a ser no negativos mediante la regla `exp(w - 5)`, mientras que los parametros iniciales de la primera capa coinciden con los del MLP de referencia.

Su relevancia es por tanto exclusivamente docente y experimental: sirve como baseline reproducible y como ejemplo de analisis controlado de una restriccion arquitectonica, no como componente listo para produccion. El autor lo advierte explicitamente en la model card: son resultados de una unica semilla y no constituyen un benchmark de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP totalmente conectado 3072 -> 64 -> 10, activacion ELU en la capa oculta, Identity en la salida (logits). Variante IOC-NN con pesos no negativos tras la primera capa |
| Parametros totales | 197.322 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entrada fija de 3072 valores float, correspondientes a una imagen RGB de 32x32 aplanada en orden HWC) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en `model.pt` y `weights.npz`, sin variantes cuantizadas documentadas) |
| Idiomas soportados | no aplica (modelo de vision, no procesa texto) |
| Licencia | no disponible (no declarada en la model card ni en los metadatos del repositorio) |
| Formato de pesos | PyTorch state dict (`model.pt`), equivalente en NumPy (`weights.npz` con claves `W0`, `b0`, `W1`, `b1`) y preprocesado en `preprocessing.npz` |

## Arquitectura y entrenamiento

La red es un MLP de dos capas lineales con una unica no linealidad ELU intermedia. La primera capa proyecta los 3072 valores de entrada a 64 dimensiones; la segunda proyecta esas 64 dimensiones a 10 logits de clase. La salida no lleva softmax: el autor indica que el argmax de los logits es la clase predicha. El preprocesado es obligatorio y esta documentado: los pixeles uint8 se dividen por 255 y despues se estandarizan por columna usando la media y la desviacion tipica calculadas sobre las 50.000 imagenes de entrenamiento, sustituyendo las desviaciones cero por 1. Es fundamental aplanar en orden HWC (row-major) y no transponer a CHW.

El entrenamiento uso entropia cruzada como media de perdida, optimizador SGD, tasa de aprendizaje 0.05, tamano de lote 64 con una actualizacion por lote, 100 epocas sin parada temprana, semilla 11023 y ausencia total de ruido en las etiquetas. Los datos son las 50.000 imagenes originales de entrenamiento de CIFAR-10 y las 10.000 de test originales para la evaluacion. La seleccion de arquitectura se realizo en la seccion 1.2.5 del trabajo usando exactitud de validacion, sin seleccion basada en test. La innovacion tecnica concreta es la restriccion IOC: despues de cada paso de SGD, todo peso restringido (capas posteriores a la primera, incluida la de salida) que resultase negativo se reemplaza por `exp(w - 5)`, y los parametros iniciales de la primera capa se hicieron coincidir con los del MLP emparejado. No se documenta uso de RLHF, DPO ni tecnicas de alineamiento, por tratarse de un clasificador supervisado.

## Capacidades

- Clasificacion de imagenes en las 10 clases de CIFAR-10 (el orden de clases esta registrado en `config.json`).
- Prediccion a partir de logits sin capa de normalizacion, lo que permite al usuario aplicar su propio softmax o umbral si lo necesita.
- Inferencia puramente en CPU con coste computacional muy bajo, dado el reducido numero de parametros.
- Analisis experimental de una restriccion de no negatividad sobre los pesos, comparable contra un MLP emparejado.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni planificacion.
- No tiene capacidades multilingues ni de generacion de texto.
- No dispone de modo "thinking", vision avanzada, audio ni ninguna capacidad multimodal mas alla de la clasificacion de imagenes de 32x32.

## Casos de uso

- Reproduccion de resultados academicos: cargar `model.pt` junto con `preprocessing.npz` y `config.json` permite replicar exactamente las metricas de la epoca 100 declaradas por el autor, util para revisar el experimento o auditar el pipeline de preprocesado.
- Material docente para asignaturas de aprendizaje automatico: sirve para ilustrar el efecto de una capa oculta pequena (64 unidades), del preprocesado por estandarizacion por columna y del impacto medible de una restriccion sobre los pesos.
- Baseline de comparacion en experimentos controlados: al existir un MLP emparejado con inicializacion identica en la primera capa, el IOC-NN permite aislar el efecto de la restriccion de no negatividad en el resto de la red.
- Prueba de integracion de infraestructura de inferencia: por su tamano (menos de un megabyte en float32) es util para validar de extremo a extremo el ciclo de descarga, carga de pesos, preprocesado y prediccion en un servicio nuevo sin consumir recursos de GPU.
- Verificacion de portabilidad de pesos: la existencia de `weights.npz` con claves `W0`, `b0`, `W1`, `b1` y formas `(input_width, output_width)` permite reimplementar la inferencia en NumPy puro o en frameworks distintos de PyTorch y comprobar la equivalencia numerica.
- Practicas de analisis de errores: con una exactitud de test del 40,750%, el modelo es adecuado para ejercicios en los que el estudiante debe inspeccionar la matriz de confusion y entender por que un MLP plano se queda muy por debajo de las arquitecturas convolucionales en CIFAR-10.
- Experimentos de sensibilidad al preprocesado: como el orden HWC y la estandarizacion por columna son criticos, el modelo sirve para demostrar de forma cuantificable como un fallo de preprocesado degrada las predicciones.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card:

| Metrica | Resultado |
|---|---|
| Exactitud de entrenamiento (epoca 100) | 63,630 % |
| Exactitud de test | 40,750 % |
| F1 medio de test | 0,406282 |
| Parametros | 197.322 |

No se han publicado resultados de benchmarks en la informacion disponible para comparar con otros modelos. Tampoco se proporcionan metricas por clase, matriz de confusion, curvas de aprendizaje ni intervalos de confianza sobre la semilla.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB con los pesos en float32 (unos 790 KB solo para los parametros, mas el espacio de activaciones); cabe sin problema en cualquier GPU, incluso integrada.
- GPU recomendadas: no requiere GPU. Funciona en CPU con latencia despreciable por lote pequeno. Cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) es mas que suficiente.
- Compatibilidad con GPU consumer: si, en todas; el modelo es varios ordenes de magnitud menor que el limite de memoria de cualquier tarjeta actual.
- Opciones de despliegue: inferencia directa con PyTorch (`torch.load` con `weights_only=True` y `map_location="cpu"`), reimplementacion en NumPy a partir de `weights.npz`, o exportacion manual a ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos y no aplican a este artefacto.
- Latencia y throughput estimados: no disponible (el autor no publica mediciones). Por el tamano del modelo, se espera una latencia muy baja en CPU, pero no hay cifras confirmadas.

## Comparativa con modelos similares

No disponible. La informacion proporcionada solo menciona un MLP emparejado con inicializacion coincidente en la primera capa, empleado como control interno del experimento, pero no se facilitan sus parametros ni sus metricas. No se dispone de datos de otros modelos comparables en la informacion consultada, por lo que no se puede construir una comparativa fiable.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo generativo: no puede generar texto, codigo, imagenes ni audio, y no admite instrucciones en lenguaje natural.
- Exactitud de test de 40,750%, muy baja para estandares de CIFAR-10; un uso en produccion sobre este dominio seria desaconsejable.
- Resultados de una unica semilla (11023) y sin parada temprana; no se documentan intervalos de confianza ni variabilidad entre ejecuciones.
- El propio autor indica que son resultados de una practica academica y no un benchmark de produccion.
- Sesgos conocidos: no se documenta ningun analisis de sesgo ni de comportamiento por clase; CIFAR-10 tiene una composicion de clases equilibrada, pero no se aporta desglose de errores.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de sobreconfianza, ya que la salida son logits sin calibracion documentada.
- Limitacion de entrada: solo acepta imagenes RGB de 32x32 en formato uint8 y aplanadas en orden HWC; cualquier otro tamano, canal u orden produce resultados invalidos.
- Dependencia fuerte del preprocesado: es obligatorio dividir por 255 y estandarizar con la media y desviacion de `preprocessing.npz`; omitirlo degrada las predicciones sin aviso.
- No se declara licencia, por lo que el uso comercial queda en situacion juridica indeterminada y no puede asumirse permiso de reutilizacion.
- Idiomas: no aplica; no procesa texto en ningun idioma.
- El repositorio tiene 0 descargas y 0 likes, y un tamano de 0,0 GB reportado, lo que sugiere que los pesos podrian no estar efectivamente alojados o que el tamano se redondea a cero en los metadatos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Pranav-Sriv/smai-assignment-4-ioc
- Dataset CIFAR-10 referenciado: https://huggingface.co/datasets/uoft-cs/cifar10
- Resultados de busqueda web: no se ha encontrado informacion relevante sobre este modelo. Los resultados devueltos (IMDb, Wikipedia, Scribd) no guardan relacion con el artefacto descrito, por lo que no se incluyen como referencias validas. No se dispone de paper, blog, repositorio adicional ni demo asociados.

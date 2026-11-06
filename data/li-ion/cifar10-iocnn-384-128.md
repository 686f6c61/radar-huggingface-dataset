# li-ion/cifar10-iocnn-384-128

## Resumen

cifar10-iocnn-384-128 es una red neuronal densa (MLP) de tres capas entrenada para clasificacion de imagenes en el conjunto CIFAR-10. Lo desarrolla el usuario li-ion y se distribuye bajo licencia MIT. No es un modelo de lenguaje ni un transformer: es un clasificador de imagenes pequeno, con 1.230.602 parametros, que recibe la imagen aplanada (3072 valores) y produce 10 logits, uno por clase.

La particularidad tecnica del modelo es su naturaleza de red neuronal convexa entrada-salida (IOC-NN, Input-Output Convex Neural Network): las capas posteriores a la primera tienen todos sus pesos restringidos a valores no negativos, de modo que cada logit pre-softmax es una funcion convexa de la entrada. Esta restriccion se mantiene durante el entrenamiento sustituyendo cualquier peso negativo por exp(w - 5) tras cada paso de SGD.

Es relevante como referencia experimental y didactica: permite estudiar el compromiso entre la garantia de convexidad y la capacidad de ajuste, y sirve como linea base reproducible de un MLP sobre CIFAR-10 con etiquetas limpias (p = 0). Su rendimiento es modesto (48,24 % de accuracy en test), muy por debajo de las CNN y los transformers de vision modernos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (red neuronal convexa entrada-salida, IOC-NN) |
| Parametros totales | 1.230.602 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificador de imagenes; entrada fija de 3072 valores) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp32; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de vision, sin capacidades linguisticas) |
| Licencia | MIT |
| Formato de pesos | safetensors (pesos) + PyTorch (`modeling.py`, `preprocess.py`) |

## Arquitectura y entrenamiento

La red tiene la topologia 3072 -> 384 -> 128 -> 10, con activaciones ELU en las capas ocultas y logits crudos en la salida (la softmax se aplica fuera del modelo, por ejemplo con `CrossEntropyLoss`). La primera capa concentra 1.179.648 pesos, aproximadamente el 95,8 % del total. Los pesos de las capas segunda y siguientes se restringen a valores >= 0, lo que garantiza que cada logit pre-softmax sea convexo respecto a la entrada. La inicializacion copia la primera capa del MLP base, inicializa las capas 2+ con U(0, 2/n_in) y pone los sesgos a cero; tras cada paso de SGD, cualquier peso negativo se reemplaza por exp(w - 5).

El entrenamiento usa el split oficial de CIFAR-10 (50.000 imagenes de entrenamiento y 10.000 de test) con etiquetas verdaderas (p = 0), SGD sin momentum, learning rate 0,05, tamano de lote 64, 100 epocas y perdida de entropia cruzada. El preprocesado es obligatorio y especifico: aplanar cada imagen 32x32x3 uint8 a un vector de 3072, dividir por 255 y estandarizar por caracteristica con media y desviacion tipica calculadas solo sobre las 50.000 imagenes de entrenamiento (los valores estan en `preprocessing_stats.safetensors`). No se documenta uso de RLHF, DPO ni tecnicas de decodificacion especulativa; son conceptos ajenos a este tipo de modelo.

## Capacidades

- Clasificacion de imagenes en las 10 clases de CIFAR-10: avion, automovil, pajaro, gato, ciervo, perro, rana, caballo, barco y camion.
- Salida de logits crudos por clase, lo que permite aplicar softmax, temperatura o umbrales de decision externos.
- Inferencia determinista y extremadamente ligera: un unico forward pass de un MLP de tres capas.
- Garantia matematica de convexidad entrada-salida en los logits, util para analisis de robustez y optimizacion sobre la entrada.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No tiene capacidades multilingues ni de vision general: solo acepta entradas con el preprocesado exacto para el que fue entrenado.

## Casos de uso

- Linea base academica para CIFAR-10: sirve como referencia reproducible (semillas documentadas, hiperparametros explicitos) frente a la que medir CNN y transformers de vision en experimentos docentes o de investigacion.
- Estudio de redes convexas: permite analizar empiricamente como la restriccion de pesos no negativos afecta a la precision, la calibracion y la forma de la funcion de decision.
- Analisis de robustez y optimizacion sobre la entrada: la convexidad de los logits facilita plantear problemas de optimizacion convexa sobre la imagen de entrada, por ejemplo para estudiar ataques o cotas garantizadas.
- Prototipado en entornos con recursos minimos: con 1,23 M de parametros se ejecuta en CPU en milisegundos, lo que permite integrarlo en tests automatizados o en pipelines de CI sin GPU.
- Docencia de aprendizaje profundo: ejemplo minimo y completo de entrenamiento, preprocesado y evaluacion con metricas de accuracy y F1 macro.
- Verificacion de pipelines de preprocesado: al depender de estadisticas fijas guardadas en `preprocessing_stats.safetensors`, es util para validar que un pipeline de inferencia reproduce exactamente el preprocesado de entrenamiento.
- Comparacion de estrategias de inicializacion y regularizacion implicita: la sustitucion exp(w - 5) de pesos negativos es un mecanismo poco habitual que puede estudiarse de forma aislada.

## Benchmarks y rendimiento

Resultados publicados en la model card (conjunto de test, ultima epoca):

| Metrica | Valor |
|---|---|
| Accuracy en test | 48,24 % |
| Accuracy en entrenamiento | 87,02 % |
| Perdida en test | 3,2850 |
| F1 macro en test | 0,4848 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en fp32 (1,23 M de parametros, unos 4,9 MB de pesos, mas activaciones y el grafo de PyTorch); no se documentan requisitos oficiales.
- GPU recomendadas: cualquiera, incluida una GPU integrada; cabe holgadamente en GTX 1650, RTX 3060, RTX 4090, A100 o H100, pero no necesita ninguna de ellas.
- Cabe en cualquier GPU de consumo e incluso en CPU; el cuello de botella es el preprocesado, no el modelo.
- Opciones de despliegue: PyTorch nativo con `safetensors.torch.load_model` y los scripts `modeling.py` y `preprocess.py` del repositorio. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles de forma oficial; por el tamano del modelo se espera latencia de orden de microsegundos a pocos milisegundos por lote en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Accuracy en CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cifar10-iocnn-384-128 | 1.230.602 | 3072 valores (32x32x3 aplanado) | 48,24 % (test) | MIT | Hugging Face |
| MLP estandar sobre CIFAR-10 | no disponible | 3072 valores | no disponible | no disponible | no disponible |
| CNN sobre CIFAR-10 | no disponible | 32x32x3 | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de alternativas concretas en la informacion proporcionada; la comparativa cuantitativa con MLP o CNN equivalentes no esta disponible.

## Limitaciones y advertencias

- Precision limitada: 48,24 % en test frente a 87,02 % en entrenamiento indica sobreajuste y una capacidad de generalizacion claramente inferior a la de CNN y transformers de vision.
- Solo cubre las 10 clases de CIFAR-10 y solo acepta imagenes de 32x32x3 con el preprocesado exacto documentado; cualquier otra entrada produce resultados sin sentido.
- La restriccion de convexidad limita la expresividad del modelo y es la causa principal del techo de rendimiento.
- No es un modelo de lenguaje: no genera texto, no razona, no usa herramientas y no tiene capacidades multilingues.
- Riesgo de sesgos heredados de CIFAR-10: el conjunto tiene clases desbalanceadas y sesgos de recoleccion; el modelo puede comportarse peor en clases minoritarias.
- Riesgo de alucinacion en el sentido de clasificaciones erroneas con alta confianza; no se documenta calibracion de las probabilidades.
- Licencia MIT: permite uso comercial y modificacion, pero no se ofrece ninguna garantia; el modelo no esta pensado para produccion.
- Sin descargas ni likes en Hugging Face en el momento de la consulta: no hay evidencia de uso o validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/li-ion/cifar10-iocnn-384-128
- Conjunto de datos CIFAR-10: https://huggingface.co/datasets/uoft-cs/cifar10
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.

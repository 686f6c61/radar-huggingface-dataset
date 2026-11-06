# Lukit4as/lucas-pytorch-regresion

## Resumen

`Lukit4as/lucas-pytorch-regresion` es un modelo de regresion lineal implementado con PyTorch, publicado como ejemplo pedagogico para el Seminario de Actualizacion del IFTS N.º 18. No es un modelo de lenguaje ni una red neuronal profunda: se trata de una unica capa `torch.nn.Linear(3, 1)` que predice el precio de una vivienda (en miles de dolares estadounidenses) a partir de tres variables tabulares: superficie en metros cuadrados, presencia de balcon y presencia de ascensor.

El modelo resuelve un problema de regresion tabular supervisada sobre un dataset sintetico de 200 registros generado con semilla fija, del cual 160 se emplean para entrenamiento y 40 para evaluacion. Su interes no reside en el rendimiento predictivo per se, sino en demostrar el ciclo de entrenamiento explicito de PyTorch (definicion del modelo, `MSELoss`, `SGD`, bucle de 500 epocas) y la publicacion de pesos en formato `safetensors`, un contenedor que no ejecuta codigo al cargarse a diferencia de pickle o joblib.

Con solo 4 parametros totales (3 pesos y 1 bias) y un repositorio de 0,0 GB, es relevante como material didactico reproducible: incluye `modelo.py`, `train.py`, `predict.py`, `config.json` con los valores de normalizacion y `requirements.txt`, lo que permite reconstruir el flujo completo desde cero. No debe confundirse con un modelo fundacional ni utilizarse fuera de su proposito formativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion lineal (una capa `torch.nn.Linear(3, 1)`) |
| Parametros totales | 4 (3 pesos + 1 bias) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, sin contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en float32; no se documentan otras precisiones) |
| Idiomas soportados | es (documentacion y model card en castellano; el modelo no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`, `state_dict`) |

## Arquitectura y entrenamiento

La arquitectura es una regresion lineal pura: `torch.nn.Linear(3, 1)`, definida en `modelo.py`, que recibe las tres variables de entrada normalizadas y produce un unico valor continuo (precio en miles de US$). Los pesos aprendidos son `lineal.weight = [35,157 · 4,351 · 5,992]` y `lineal.bias = 147,769`, expresados en la escala de las entradas normalizadas. Para volver a la escala original basta con dividir cada peso por el desvio de su variable; por ejemplo, 35,157 / 23,398 ≈ 1,503 para `m2`, coincidente con el peso obtenido por scikit-learn en el ejemplo equivalente.

El entrenamiento es supervisado y utiliza el ciclo explicito de PyTorch con `MSELoss` como funcion de perdida y `SGD` con tasa de aprendizaje 0,1 durante 500 epocas; la perdida se estabiliza antes de la epoca 100. El dataset es sintetico (200 registros, semilla fija compartida con la Clase 10), con `m2` en el rango de 35 a 120 y las variables binarias `balcon` y `ascensor`. El preprocesamiento consiste en estandarizacion (resta de la media y division por el desvio calculados sobre el conjunto de entrenamiento), cuyos valores se almacenan en `config.json`. No se emplean tecnicas de RLHF, DPO ni decodificacion especulativa, ya que no es un modelo generativo.

## Capacidades

- Prediccion de una variable numerica continua (precio de vivienda en miles de US$) a partir de tres features tabulares.
- Regresion tabular supervisada con entradas estandarizadas; requiere aplicar la normalizacion de `config.json` antes de inferir.
- Carga de pesos mediante `safetensors.torch.load_file`, sin ejecucion de codigo arbitrario al deserializar.
- Reproducibilidad completa del pipeline: `train.py` regenera el dataset sintetico y reentrena el modelo.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues en sentido estricto: no procesa lenguaje natural, solo datos numericos.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Docencia de PyTorch: el modelo sirve como primera practica del ciclo de entrenamiento explicito (forward, loss, backward, step) con un coste computacional practicamente nulo y resultados verificables en pocos segundos.
- Comparativa PyTorch frente a scikit-learn: permite reproducir el mismo problema de regresion con ambas librerias y comprobar que los pesos coinciden tras desnormalizar, lo que ilustra la equivalencia matematica entre implementaciones.
- Introduccion a `safetensors`: ejemplifica el guardado y la carga segura de `state_dict` sin depender de pickle, un patron directamente trasladable a modelos mayores.
- Validacion de pipelines de normalizacion: el par `config.json` + `modelo.py` demuestra por que los metadatos de preprocesamiento deben versionarse junto a los pesos y como un olvido de normalizacion invalida por completo las predicciones.
- Prototipado de APIs de inferencia tabular: `predict.py` puede adaptarse como esqueleto minimo de un endpoint que reciba `m2`, `balcon` y `ascensor` y devuelva un precio estimado, util para ensayar el despliegue antes de pasar a modelos mas complejos.
- Material de evaluacion academica: las metricas MAE y R² sobre el conjunto de test permiten disenar ejercicios de interpretacion de errores y de analisis de sesgo en datos sinteticos.

## Benchmarks y rendimiento

| Metrica | Resultado | Conjunto |
|---|---|---|
| MAE | 3,08 miles de US$ | 40 viviendas de test no vistas en entrenamiento |
| R² | 0,989 | 40 viviendas de test no vistas en entrenamiento |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el modelo no es un modelo de lenguaje ni un sistema generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB; los pesos ocupan unos pocos bytes (4 parametros en float32), por lo que cualquier GPU o incluso CPU es suficiente.
- GPU recomendadas: ninguna en particular; el modelo se ejecuta sin problemas en CPU. Cualquier GPU consumer (integrada, GTX serie 10 o superior, RTX 4090, A100, H100) lo soporta sobradamente.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: PyTorch nativo (recomendado, segun `predict.py`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles de forma oficial; por la naturaleza del modelo (una multiplicacion matricial de 3x1) la latencia es del orden de microsegundos en CPU y el throughput queda limitado por el codigo de preprocesamiento, no por el calculo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Lukit4as/lucas-pytorch-regresion` | 4 | no aplica | MAE 3,08 / R² 0,989 (test sintetico) | MIT | Hugging Face |
| Regresion lineal de scikit-learn (ejemplo de referencia del curso) | 4 (coeficientes + intercepto) | no aplica | Equivalente tras desnormalizar; MAE y R² no publicados en la informacion disponible | BSD-3-Clause (scikit-learn) | PyPI |
| Regresion lineal multiple generica en PyTorch | depende de las features | no aplica | no disponible | segun implementacion | no disponible |

No se dispone de datos publicados de benchmarks comparativos frente a otros modelos en la informacion proporcionada; la comparacion con scikit-learn se limita a la equivalencia de pesos descrita en la model card.

## Limitaciones y advertencias

- Uso exclusivamente educativo: los datos son sinteticos y no representan precios inmobiliarios reales; no debe emplearse para decisiones de negocio o tasaciones.
- Dominio restringido: solo conoce viviendas de 35 a 120 m²; fuera de ese rango la extrapolacion lineal carece de garantias.
- Dependencia critica de la normalizacion: si se omiten la media y el desvio de `config.json`, las predicciones son arbitrarias. Los pesos por si solos no son suficientes.
- Dependencia de la arquitectura: para cargar los pesos es imprescindible la clase `RegresionLineal` de `modelo.py`; cualquier cambio en la definicion provoca un fallo en `load_state_dict`.
- Sesgos potenciales: al derivarse de un dataset sintetico con distribuciones fijas, el modelo hereda cualquier supuesto del generador (por ejemplo, relaciones estrictamente lineales entre superficie y precio, o efectos aditivos de balcon y ascensor).
- Riesgo de alucinacion: no aplica en el sentido habitual, pero si existe riesgo de predicciones absurdas por extrapolacion fuera del dominio de entrenamiento.
- Licencia MIT: permite uso comercial y modificacion con atribucion; no obstante, la naturaleza del modelo hace desaconsejable su uso productivo mas alla de entornos de demostracion.
- Ausencia de validacion externa: no hay benchmarks independientes ni validacion cruzada documentada; las metricas provienen de una unica particion de 40 registros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lukit4as/lucas-pytorch-regresion
- Documentacion de safetensors: https://github.com/huggingface/safetensors
- PyTorch: https://pytorch.org/
- `torch.nn.Linear`: https://pytorch.org/docs/stable/generated/torch.nn.Linear.html
- `torch.nn.MSELoss`: https://pytorch.org/docs/stable/generated/torch.nn.MSELoss.html
- `torch.optim.SGD`: https://pytorch.org/docs/stable/generated/torch.optim.SGD.html
- scikit-learn (ejemplo de referencia): https://scikit-learn.org/

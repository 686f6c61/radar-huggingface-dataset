# AraceliAmherdt/02-pytorch-regresion

## Resumen

`AraceliAmherdt/02-pytorch-regresion` es un ejemplo pedagogico de regresion lineal implementado con PyTorch, publicado por AraceliAmherdt en el marco del Seminario de Actualizacion del IFTS N.º 18 (docente: Cynthia M. Villagra). No es un modelo de lenguaje ni una red neuronal profunda: es una unica capa `torch.nn.Linear(3, 1)` que predice el precio de una vivienda, en miles de dolares estadounidenses, a partir de tres variables tabulares: superficie en metros cuadrados, presencia de balcon y presencia de ascensor.

El objetivo del artefacto es didactico: mostrar el ciclo de entrenamiento explicito de PyTorch (forward, calculo de perdida, retropropagacion, paso del optimizador) y la publicacion de pesos en formato `safetensors`, contrastandolo con el equivalente en scikit-learn. El conjunto de datos es sintetico, generado en `train.py` con semilla fija, y consta de 200 registros (160 de entrenamiento y 40 de evaluacion).

Es relevante unicamente como material de referencia docente y como plantilla minima de publicacion de pesos en el Hub, no como componente para produccion. El repositorio ocupa 0,0 GB y contiene cuatro parametros aprendidos en total (tres pesos y un sesgo).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion lineal: una capa `torch.nn.Linear(3, 1)` |
| Parametros totales | 4 (3 pesos + 1 sesgo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo tabular, sin contexto) |
| Tipos de cuantizacion | no disponible (pesos float32; no se documentan variantes) |
| Idiomas soportados | es (documentacion y model card en castellano) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`), mas `config.json` y `modelo.py` |

## Arquitectura y entrenamiento

La arquitectura es una regresion lineal pura: una capa `torch.nn.Linear(3, 1)` definida en `modelo.py`, con tres entradas (`m2`, `balcon`, `ascensor`) y una salida (`precio`). Las entradas se normalizan restando la media y dividiendo por el desvio estandar calculados sobre el conjunto de entrenamiento; esos valores se almacenan en `config.json` y son imprescindibles para reproducir las predicciones.

El entrenamiento es supervisado, con funcion de perdida `MSELoss` y optimizador SGD con tasa de aprendizaje 0,1 durante 500 epocas; segun la model card, la perdida se estabiliza antes de la epoca 100. No hay RLHF, DPO ni tecnicas de alineacion. Los pesos aprendidos son `lineal.weight = [35,157 · 4,351 · 5,992]` y `lineal.bias = 147,769`, expresados en la escala de las entradas normalizadas. La innovacion tecnica destacable, en clave didactica, es el uso de `safetensors` frente a pickle o joblib: el archivo solo contiene numeros y no ejecuta codigo al cargarse.

## Capacidades

- Prediccion de una variable numerica continua (precio en miles de US$) a partir de tres caracteristicas tabulares.
- Regresion sobre datos tabulares con relaciones lineales entre entradas y salida.
- Carga e inferencia con PyTorch mediante `load_state_dict` y `safetensors.torch.load_file`.
- Reproducibilidad del preprocesamiento gracias a los parametros de normalizacion persistidos en `config.json`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues mas alla de la documentacion en castellano.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Docencia de PyTorch: ilustrar el ciclo de entrenamiento explicito (forward, `MSELoss`, `backward`, `step`) en un curso introductorio, comparandolo con el mismo problema resuelto en scikit-learn.
- Docencia de publicacion de modelos: mostrar como subir un `state_dict` a Hugging Face con `safetensors`, que archivos auxiliares hacen falta (`config.json`, `modelo.py`) y por que el formato no ejecuta codigo al cargarse.
- Ejemplo de preprocesamiento: demostrar por que la normalizacion debe persistirse junto con los pesos y como afecta a la interpretacion de los coeficientes (35,157 / 23,398 ≈ 1,503 para `m2`).
- Prueba de integracion de `safetensors` en un pipeline de PyTorch: validar la carga de pesos sin depender de pickle en entornos con restricciones de seguridad.
- Referencia de comparacion entre frameworks: contrastar los coeficientes obtenidos con SGD y normalizacion frente a los de una regresion lineal de scikit-learn sobre los mismos datos sinteticos.
- Base para ejercicios de extension: sustituir la capa lineal por una MLP o ampliar las variables de entrada manteniendo el mismo esqueleto de entrenamiento y publicacion.

## Benchmarks y rendimiento

Resultados publicados en la model card, evaluados sobre 40 casas no vistas durante el entrenamiento:

| Metrica | Resultado |
|---|---|
| MAE | 3,08 miles de US$ |
| R² | 0,989 |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: practicamente nula; el modelo ocupa unos pocos bytes (4 parametros en float32).
- GPU recomendadas: no requiere GPU; se ejecuta en CPU sin problema.
- Cabe en cualquier GPU consumer y en cualquier CPU moderna.
- Opciones de despliegue: PyTorch nativo con `safetensors.torch.load_file`; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles; al tratarse de una unica multiplicacion matricial de 3x1, la latencia es del orden de microsegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AraceliAmherdt/02-pytorch-regresion | 4 | no aplica | MAE 3,08; R² 0,989 (datos sinteticos) | MIT | Hugging Face |
| Regresion lineal equivalente en scikit-learn | 4 | no aplica | Mismos coeficientes tras desnormalizar | BSD-3-Clause (scikit-learn) | PyPI |
| MLP tabular generica | no disponible | no aplica | no disponible | variable | variable |

La comparacion con modelos de lenguaje no aplica: se trata de un artefacto tabular de cuatro parametros, no de un modelo generativo.

## Limitaciones y advertencias

- Fines exclusivamente educativos: los datos son sinteticos y no representan precios inmobiliarios reales.
- Dominio restringido: solo conoce viviendas de 35 a 120 m²; fuera de ese rango la extrapolacion no es fiable.
- Dependencia critica de la normalizacion: sin aplicar la media y el desvio de `config.json`, las predicciones son incorrectas.
- Dependencia de la clase `modelo.py`: si la definicion de `RegresionLineal` cambia, `load_state_dict` falla.
- Sin sesgos medibles por tratarse de datos sinteticos, pero al ser un modelo lineal no captura relaciones no lineales ni interacciones entre variables.
- Riesgo de alucinacion no aplicable (no genera texto); el riesgo equivalente es la extrapolacion silenciosa fuera del rango de entrenamiento.
- Licencia MIT: permite uso comercial y modificacion, aunque el modelo no tiene utilidad practica fuera de la docencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AraceliAmherdt/02-pytorch-regresion
- Documentacion de safetensors: https://github.com/huggingface/safetensors
- PyTorch: https://pytorch.org/
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion disponible.

# Pbueno467/regresion-casas-pytorch

## Resumen

`Pbueno467/regresion-casas-pytorch` es un modelo de regresion lineal implementado con PyTorch y publicado como ejemplo pedagogico del Seminario de Actualizacion del IFTS N.º 18 (docente: Cynthia M. Villagra). No es un modelo de lenguaje ni una red neuronal profunda: es una unica capa `torch.nn.Linear(3, 1)` con tres pesos y un sesgo, entrenada para predecir el precio de una vivienda en miles de dolares estadounidenses a partir de su superficie en metros cuadrados y de dos variables binarias (balcon y ascensor).

El modelo resuelve un problema de regresion tabular supervisada sobre un conjunto de datos sintetico de 200 registros generados con semilla fija en `train.py`, de los cuales 160 se emplean para entrenamiento y 40 para evaluacion. Su relevancia es exclusivamente didactica: ilustra el ciclo de entrenamiento explicito de PyTorch (forward, perdida, backward, paso del optimizador) y el empaquetado de pesos en formato safetensors, un contenedor que no ejecuta codigo al cargarse y que evita los riesgos de seguridad de pickle o joblib.

Con solo 4 parametros totales y un repositorio de 0,0 GB, el modelo no compite en ninguna categoria de modelos generativos. Su interes practico se limita a servir de plantilla reproducible para quien quiera entender como se serializan pesos en safetensors, como se aplica normalizacion de entradas mediante `config.json` y como se reconstruye una arquitectura minima antes de cargar el `state_dict`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion lineal (`torch.nn.Linear(3, 1)`), una capa densa |
| Parametros totales | 4 (3 pesos + 1 sesgo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo tabular, sin entrada de texto) |
| Tipos de cuantizacion | No disponible (pesos float32 en safetensors) |
| Idiomas soportados | Espanol (documentacion y model card) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`) |
| Entradas | `m2` (35-120), `balcon` (0/1), `ascensor` (0/1) |
| Salida | `precio` en miles de US$ (variable continua) |
| Normalizacion | Media y desvio en `config.json`, calculados sobre train |
| Pipeline declarado | `tabular-regression` |
| Libreria | PyTorch |
| Tamano del repositorio | 0,0 GB |
| Descargas | 29 |
| Likes | 1 |

## Arquitectura y entrenamiento

La arquitectura es una regresion lineal pura: una unica transformacion afin `y = w1·m2 + w2·balcon + w3·ascensor + b` implementada como `torch.nn.Linear(3, 1)` en `modelo.py`. Los pesos aprendidos, almacenados en `model.safetensors`, son `lineal.weight = [35,157 · 4,351 · 5,992]` y `lineal.bias = 147,769`. Estos valores estan expresados en la escala de las entradas normalizadas; al desnormalizar, por ejemplo, 35,157 / 23,398 ≈ 1,503 para `m2`, se recupera el coeficiente equivalente al que obtendria scikit-learn sobre los datos en escala original.

El entrenamiento emplea aprendizaje supervisado con funcion de perdida `MSELoss` y optimizador SGD con tasa de aprendizaje 0,1 durante 500 epocas, si bien la perdida se estabiliza antes de la epoca 100. El dataset es sintetico, generado en `train.py` con semilla fija, con 200 registros (160 de entrenamiento y 40 de evaluacion) y tres variables de entrada. El preprocesamiento consiste en estandarizacion z-score con media y desvio calculados exclusivamente sobre el conjunto de entrenamiento y persistidos en `config.json`. No hay RLHF, DPO ni ninguna tecnica de alineacion, ni innovaciones como decodificacion especulativa o atencion lineal: el alcance es intencionadamente minimo.

## Capacidades

- Prediccion de una variable continua (precio en miles de US$) a partir de tres features tabulares.
- Inferencia determinista y reproducible dado un mismo vector de entrada y los mismos pesos.
- Carga segura de pesos mediante safetensors, sin ejecucion de codigo arbitrario al deserializar.
- Reconstruccion de la arquitectura a partir de `modelo.py` y del `state_dict` almacenado.
- Aplicacion de normalizacion z-score guiada por `config.json` para mantener la coherencia entre entrenamiento e inferencia.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues mas alla de la documentacion en espanol.
- No dispone de modo thinking, vision, audio ni generacion de texto.

## Casos de uso

- Docencia de PyTorch: el modelo sirve como ejemplo minimo y ejecutable del ciclo de entrenamiento explicito (forward, `MSELoss`, `backward`, `optimizer.step`), adecuado para primeras practicas en cursos de machine learning.
- Ensayo de serializacion con safetensors: permite demostrar en clase o en un articulo como se guarda y recupera un `state_dict` sin recurrir a pickle, comparando el flujo con `torch.save` y con joblib.
- Plantilla de publicacion en Hugging Face: el repositorio incluye `config.json`, `modelo.py`, `train.py`, `predict.py` y `requirements.txt`, por lo que constituye un esqueleto reutilizable para publicar modelos tabulares pequenos con metadatos correctos.
- Validacion de pipelines de normalizacion: util para comprobar que la media y el desvio persistidos en `config.json` reproducen exactamente las predicciones del entrenamiento, un control habitual en revisiones de codigo de ML.
- Ejemplo de comparacion entre frameworks: el propio autor documenta la equivalencia entre los pesos desnormalizados de PyTorch y los de scikit-learn, lo que permite usarlo en ejercicios de contraste entre ambas librerias.
- Prueba de integracion de extremo a extremo en CI: al ocupar 0,0 GB y requerir solo PyTorch y safetensors, puede ejecutarse como smoke test en pipelines que validen la carga de artefactos y la inferencia basica.
- Referencia para explicar la diferencia entre escala normalizada y escala original: el calculo 35,157 / 23,398 ≈ 1,503 es un ejercicio concreto sobre interpretabilidad de coeficientes.

## Benchmarks y rendimiento

Los unicos resultados publicados en la model card son las metricas de evaluacion sobre las 40 casas de test:

| Metrica | Resultado |
|---|---|
| MAE | 3,08 miles de US$ |
| R² | 0,989 |

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros no aplican a un modelo tabular de este tipo).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB; los 4 parametros en float32 ocupan 16 bytes y el repositorio completo pesa 0,0 GB.
- GPU recomendadas: ninguna en particular; cualquier GPU con soporte CUDA funciona, aunque la CPU es suficiente y probablemente mas eficiente para este tamano.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, GTX 1650) y tambien en CPU y en entornos sin acelerador.
- Opciones de despliegue: ejecucion directa con PyTorch y `safetensors.torch.load_file`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo tabular de 4 parametros.
- Latencia y throughput: no disponibles de forma oficial; por la naturaleza del modelo (una multiplicacion matricial de 3x1) la inferencia es del orden de microsegundos en CPU, aunque el dato no esta publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Pbueno467/regresion-casas-pytorch` | 4 | No aplica | MAE 3,08; R² 0,989 | MIT | Hugging Face |
| Regresion lineal equivalente en scikit-learn (citada en la model card) | 4 | No aplica | Coeficientes equivalentes tras desnormalizar | No disponible | No disponible como artefacto |
| Otros modelos tabulares de regresion en Hugging Face | No disponible | No disponible | No disponible | No disponible | No disponible |

La model card solo establece comparacion cualitativa con el ejemplo de scikit-learn de la Clase 10, que resuelve el mismo problema y produce coeficientes equivalentes tras desnormalizar. No se han publicado comparaciones con otros modelos de la categoria en la informacion disponible.

## Limitaciones y advertencias

- Fines exclusivamente educativos: los datos son sinteticos y no representan precios reales de vivienda.
- Dominio restringido: solo conoce casas de 35 a 120 m²; fuera de ese rango la extrapolacion no es fiable.
- Dependencia critica de la normalizacion: si se omite la media y el desvio de `config.json`, las predicciones son incorrectas, ya que los pesos estan en escala normalizada.
- Dependencia de la arquitectura: para cargar los pesos hace falta la misma clase `RegresionLineal` de `modelo.py`; cualquier cambio en la definicion provoca un fallo en `load_state_dict`.
- Sesgos conocidos: no se documentan sesgos especificos, pero al ser datos sinteticos generados con una semilla fija, el modelo no representa ninguna poblacion real.
- Riesgo de alucinacion: no aplica, al no ser un modelo generativo.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificacion con atribucion; no se documentan restricciones adicionales.
- Caveat para produccion: no debe desplegarse como predictor de precios reales sin reentrenamiento sobre datos reales y validacion externa; su uso en produccion solo tiene sentido como componente de ejemplo o como test de infraestructura.

## Enlaces

- Hugging Face: https://huggingface.co/Pbueno467/regresion-casas-pytorch

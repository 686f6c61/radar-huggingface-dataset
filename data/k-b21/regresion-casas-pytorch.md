# K-B21/regresion-casas-pytorch

## Resumen

`K-B21/regresion-casas-pytorch` es un modelo de regresion lineal implementado en PyTorch y publicado por el autor K-B21 como ejemplo pedagogico del Seminario de Actualizacion del IFTS N.º 18 (docente: Cynthia M. Villagra). No es un modelo de lenguaje ni una red neuronal profunda: es una unica capa `torch.nn.Linear(3, 1)` con tres pesos y un sesgo (cuatro parametros en total), entrenada para predecir el precio de una vivienda en miles de dolares estadounidenses a partir de su superficie en metros cuadrados y de dos variables binarias (balcon y ascensor).

El modelo resuelve un problema de regresion tabular supervisada sobre un dataset sintetico de 200 registros generados en `train.py` con semilla fija. Su interes no es el rendimiento predictivo en si, sino que sirve como referencia minima y reproducible para mostrar el ciclo de entrenamiento explicito de PyTorch (forward, loss, backward, step) y la publicacion de pesos en formato `safetensors`, comparandolo con el equivalente de scikit-learn.

Es relevante en el contexto docente como plantilla de publicacion de artefactos: separa pesos (`model.safetensors`), metadatos de preprocesamiento (`config.json`) y definicion de arquitectura (`modelo.py`), y documenta explicitamente por que los pesos no coinciden con los de scikit-learn (estan en la escala de las entradas normalizadas). No dispone de contexto, tokenizador ni capacidades generativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion lineal: una capa `torch.nn.Linear(3, 1)` (3 pesos + 1 bias) |
| Parametros totales | 4 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de 3 caracteristicas tabulares) |
| Tipos de cuantizacion | no disponible (pesos en float32; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa texto; la model card declara `es`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`), mas `config.json`, `modelo.py`, `train.py`, `predict.py`, `requirements.txt` |

## Arquitectura y entrenamiento

La arquitectura es una regresion lineal pura: `torch.nn.Linear(3, 1)`, definida en `modelo.py`. Las entradas son `m2` (rango 35-120), `balcon` (0 o 1) y `ascensor` (0 o 1); la salida es `precio` en miles de US$. El preprocesamiento normaliza cada entrada restando la media y dividiendo por el desvio calculados sobre el conjunto de entrenamiento; esos valores se almacenan en `config.json`.

El entrenamiento usa aprendizaje supervisado con `MSELoss` y descenso por gradiente estocastico (`SGD`) con tasa de aprendizaje 0,1 durante 500 epocas; segun la model card, la perdida se estabiliza antes de la epoca 100. El dataset es sintetico, generado en `train.py` con la misma semilla que la Clase 10, con 200 registros divididos en 160 de entrenamiento y 40 de evaluacion. Los pesos aprendidos son `lineal.weight = [35,157 · 4,351 · 5,992]` y `lineal.bias = 147,769`, expresados en la escala de las entradas normalizadas. No se documenta RLHF, DPO, decodificacion especulativa ni ninguna innovacion de atencion, por no aplicar a este tipo de modelo.

## Capacidades

- Prediccion de una variable numerica continua (precio en miles de US$) a partir de tres caracteristicas tabulares.
- Regresion tabular con normalizacion z-score obligatoria en inferencia (media y desvio en `config.json`).
- Carga de pesos en formato `safetensors` sin ejecucion de codigo al deserializar, a diferencia de pickle o joblib.
- Reproducibilidad del pipeline completo: `train.py` regenera el dataset sintetico con semilla fija y `predict.py` documenta la inferencia.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto.
- No tiene capacidades multilingues: no procesa lenguaje natural.

## Casos de uso

- Docencia de PyTorch basico: usar `train.py` y `modelo.py` como plantilla para explicar el ciclo de entrenamiento explicito (forward, calculo de perdida, `backward`, `optimizer.step`) sin depender de abstracciones de alto nivel.
- Comparacion didactica PyTorch frente a scikit-learn: el mismo problema y dataset permiten contrastar los pesos aprendidos; la model card muestra como 35,157 / 23,398 ≈ 1,503 recupera el peso de `m2` en escala original.
- Ejemplo de publicacion de artefactos en Hugging Face: demuestra la separacion entre pesos (`model.safetensors`), metadatos de preprocesamiento (`config.json`) y codigo de arquitectura (`modelo.py`), un patron reutilizable en modelos mayores.
- Ilustracion de la importancia del preprocesamiento: sirve para mostrar por que los pesos solos no bastan y por que omitir la normalizacion produce predicciones sin sentido.
- Prueba de integracion de `safetensors` en pipelines de carga: util para validar `load_file` y `load_state_dict` en entornos docentes o de CI antes de migrar a modelos de mayor tamano.
- Referencia de licencia MIT para material educativo: permite reutilizar y adaptar el codigo y los pesos en cursos y repositorios derivados sin restricciones adicionales.

## Benchmarks y rendimiento

| Metrica | Resultado | Conjunto |
|---|---|---|
| MAE | 3,08 miles de US$ | 40 casas de evaluacion no vistas |
| R² | 0,989 | 40 casas de evaluacion no vistas |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB; los pesos son cuatro valores float32 y el modelo cabe en CPU sin GPU.
- GPU recomendadas: ninguna en particular; funciona en cualquier CPU y en cualquier GPU, incluida una RTX 4090, A100 o H100, aunque no las aprovecha.
- Cabe en cualquier GPU consumer y en entornos sin GPU (portatiles, contenedores, Raspberry Pi).
- Opciones de despliegue: PyTorch nativo con `safetensors.torch.load_file`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo tabular de este tipo.
- Latencia y throughput: no disponibles de forma medida; por la naturaleza del modelo (una multiplicacion matricial de 3x1) la latencia es del orden de microsegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| K-B21/regresion-casas-pytorch | 4 | no aplica | Regresion lineal en PyTorch, pesos safetensors | MIT | Hugging Face |
| Equivalente scikit-learn (citado en la model card) | 4 coeficientes | no aplica | Regresion lineal con `LinearRegression` | no disponible | Referencia en la model card, sin repo publicado |
| Otros modelos tabulares de regresion en Hugging Face | no disponible | no aplica | Regresion tabular | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Fines exclusivamente educativos: los datos son sinteticos y no representan precios reales de vivienda.
- Dominio restringido: solo conoce casas de 35 a 120 m²; fuera de ese rango la extrapolacion no es fiable.
- Dependencia critica del preprocesamiento: si se omite la normalizacion con media y desvio de `config.json`, las predicciones son incorrectas.
- Dependencia de la arquitectura: `load_state_dict` falla si la clase `RegresionLineal` de `modelo.py` no coincide exactamente con la usada en el entrenamiento.
- Sin sesgos medibles en el sentido de modelos de lenguaje, pero el dataset sintetico incorpora supuestos arbitrarios del autor sobre la relacion entre superficie, balcon, ascensor y precio.
- Riesgo de alucinacion no aplicable (no genera texto); el riesgo equivalente es la extrapolacion silenciosa fuera del rango de entrenamiento.
- Licencia MIT: permite uso comercial y modificacion, pero al ser un ejemplo pedagogico no se recomienda su uso en produccion para valoracion de inmuebles reales.

## Enlaces

- Hugging Face: https://huggingface.co/K-B21/regresion-casas-pytorch
- Repositorio del autor en Hugging Face: https://huggingface.co/K-B21

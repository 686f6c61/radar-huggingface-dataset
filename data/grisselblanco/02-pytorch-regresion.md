# grisselblanco/02-pytorch-regresion

## Resumen

`grisselblanco/02-pytorch-regresion` es un modelo de regresion lineal implementado en PyTorch y publicado como ejemplo pedagogico del Seminario de Actualizacion del IFTS N.o 18 (Argentina). No es un modelo de lenguaje: es un regresor tabular que estima el precio de una vivienda, en miles de dolares estadounidenses, a partir de tres variables de entrada (`m2`, `balcon`, `ascensor`). Su interes no reside en la capacidad predictiva, sino en demostrar el ciclo completo de entrenamiento explicito en PyTorch y la publicacion de pesos en formato `safetensors`.

La arquitectura es una unica capa `torch.nn.Linear(3, 1)`, con un total de 4 parametros entrenables (tres pesos y un sesgo). El modelo se entreno sobre un dataset sintetico de 200 registros generados con semilla fija en `train.py`, de los cuales 160 se usaron para entrenamiento y 40 para evaluacion. La normalizacion de entradas (media y desvio calculados sobre el conjunto de entrenamiento) se almacena en `config.json`, no en los pesos, y es imprescindible para obtener predicciones correctas.

Es relevante ahora como material docente reproducible: ilustra la diferencia entre persistir un `state_dict` con `safetensors` (solo numeros, sin ejecucion de codigo al cargar) frente a formatos como pickle o joblib, y muestra por que la clase del modelo debe acompanar a los pesos para poder reconstruirlo. No debe confundirse con un modelo de aprendizaje profundo ni usarse fuera del ambito educativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion lineal, una capa `torch.nn.Linear(3, 1)` |
| Parametros totales | 4 (3 pesos + 1 sesgo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, sin contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos en float32, sin variantes cuantizadas) |
| Idiomas soportados | es (documentacion y model card; el modelo no procesa texto) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`model.safetensors`, solo `state_dict`) |

## Arquitectura y entrenamiento

El modelo es un regresor lineal puro: una transformacion afin `y = Wx + b` con `W` de dimension 1x3 y `b` escalar. Las entradas son `m2` (rango 35-120), `balcon` (0 o 1) y `ascensor` (0 o 1); la salida es `precio` en miles de USD. Antes de la inferencia, las entradas se normalizan restando la media y dividiendo por el desvio, ambos almacenados en `config.json`. Los pesos publicados estan en la escala normalizada: `lineal.weight = [35,157, 4,351, 5,992]` y `lineal.bias = 147,769`.

El entrenamiento es supervisado, con perdida `MSELoss`, optimizador SGD con tasa de aprendizaje 0,1 y 500 epocas; segun la model card, la perdida se estabiliza antes de la epoca 100. No hay RLHF, DPO ni tecnicas de alineacion, ni innovaciones como decodificacion especulativa o atencion lineal, por tratarse de un modelo tabular. La unica decision tecnica destacable es la separacion entre pesos (`safetensors`) y metadatos de preprocesamiento (`config.json`), que obliga a versionar ambos artefactos de forma conjunta.

## Capacidades

- Prediccion de una variable continua (precio de vivienda en miles de USD) a partir de tres features tabulares.
- Regresion sobre datos normalizados; requiere aplicar la misma normalizacion que en entrenamiento.
- Carga de pesos mediante `safetensors.torch.load_file` y `load_state_dict` sobre la clase `RegresionLineal` de `modelo.py`.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, audio ni tool calling.
- No soporta agentes, multi-step reasoning ni capacidades multilingues mas alla de la documentacion en castellano.
- No dispone de modo thinking ni de ninguna capacidad especial de inferencia.

## Casos de uso

- Docencia de PyTorch: usar el repositorio como plantilla minima para explicar el ciclo explicito de entrenamiento (forward, loss, backward, step) sin la abstraccion de frameworks de alto nivel.
- Ensenanza de serializacion segura: comparar la carga de `model.safetensors` con pickle o joblib para argumentar por que `safetensors` no ejecuta codigo al deserializar.
- Demostracion de preprocesamiento: mostrar con `config.json` por que los pesos solos no bastan y como la normalizacion afecta a la escala de los coeficientes.
- Ejercicio de equivalencia entre frameworks: replicar el mismo problema con scikit-learn y comprobar que `35,157 / 23,398 ≈ 1,503` coincide con el coeficiente de `m2` obtenido por scikit-learn.
- Prueba de integracion de artefactos: validar en un pipeline de CI la carga conjunta de `model.safetensors`, `config.json` y `modelo.py`, y detectar fallos de `load_state_dict` cuando cambia la clase.
- Ejemplo de publicacion en HuggingFace Hub: servir como referencia de estructura minima de repositorio (pesos, config, codigo, requirements, model card) para un modelo educativo.
- Referencia de evaluacion: reproducir las metricas MAE = 3,08 miles de USD y R² = 0,989 sobre el split de 40 registros de test.

## Benchmarks y rendimiento

| Metrica | Resultado | Conjunto |
|---|---|---|
| MAE | 3,08 miles de USD | 40 registros de test |
| R² | 0,989 | 40 registros de test |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, y no aplican a un regresor tabular.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB; los pesos ocupan 4 valores float32 (16 bytes) mas metadatos.
- GPU recomendadas: ninguna; el modelo se ejecuta en CPU sin penalizacion perceptible.
- Cabe en cualquier GPU consumer y en cualquier CPU moderna; no requiere CUDA.
- Opciones de despliegue: PyTorch nativo con `safetensors.torch.load_file`; no es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles de forma publicada; por la dimension del calculo (producto escalar de 3 elementos) la latencia es del orden de microsegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `grisselblanco/02-pytorch-regresion` | 4 | no aplica | MAE 3,08; R² 0,989 (test sintetico) | MIT | HuggingFace |
| Regresion lineal de scikit-learn (mismo problema, Clase 10) | 4 | no aplica | Coeficientes equivalentes tras desnormalizar | BSD-3-Clause (scikit-learn) | Paquete PyPI |
| Otros ejemplos pedagogicos de regresion en PyTorch | no disponible | no aplica | no disponible | variable | HuggingFace |

La comparacion con scikit-learn es la mas directa: la model card indica que el coeficiente de `m2` coincide tras dividir por el desvio (`35,157 / 23,398 ≈ 1,503`). No se dispone de comparativas con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Uso exclusivamente educativo: los datos son sinteticos y no representan precios reales de vivienda.
- Dominio restringido: solo conoce viviendas de 35 a 120 m²; fuera de ese rango la extrapolacion lineal no es fiable.
- Dependencia critica de la normalizacion: si se omite `config.json`, las predicciones son incorrectas; los pesos por si solos no bastan.
- Dependencia de la clase: `load_state_dict` falla si la definicion de `RegresionLineal` en `modelo.py` cambia.
- Sin sesgos medibles sobre poblaciones reales por el origen sintetico de los datos, pero tampoco validacion externa.
- Riesgo de alucinacion no aplicable (no genera texto); el riesgo equivalente es la extrapolacion silenciosa fuera del rango de entrenamiento.
- Licencia MIT: permite uso comercial y modificacion, pero el modelo no es adecuado para produccion por su naturaleza de juguete.
- Sin cuantizaciones publicadas ni soporte para frameworks de inferencia de LLM.

## Enlaces

- HuggingFace: https://huggingface.co/grisselblanco/02-pytorch-regresion
- Repositorio del modelo (archivos `modelo.py`, `train.py`, `predict.py`, `config.json`, `requirements.txt`): incluidos en la pagina de HuggingFace del modelo
- Documentacion de safetensors: https://github.com/huggingface/safetensors
- Documentacion de PyTorch `nn.Linear`: https://pytorch.org/docs/stable/generated/torch.nn.Linear.html
- Documentacion de scikit-learn sobre regresion lineal: https://scikit-learn.org/stable/modules/linear_model.html

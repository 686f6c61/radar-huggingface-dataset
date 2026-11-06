# FerData/regresion-casas-pytorch

## Resumen

`FerData/regresion-casas-pytorch` es un modelo de regresion lineal implementado con PyTorch y publicado como ejemplo pedagogico del Seminario de Actualizacion del IFTS N.o 18, bajo la docencia de Cynthia M. Villagra. No es un modelo de lenguaje ni una red neuronal profunda: es una unica capa `torch.nn.Linear(3, 1)` que predice el precio de una vivienda en miles de dolares estadounidenses a partir de tres variables de entrada (superficie en metros cuadrados, existencia de balcon y existencia de ascensor). Su interes no reside en el rendimiento predictivo, sino en ilustrar de forma completa el ciclo de vida de un modelo en PyTorch: entrenamiento con gradiente descendente, serializacion en formato safetensors y publicacion reproducible en HuggingFace.

El modelo cuenta con 4 parametros entrenables (tres pesos y un sesgo) y opera sobre un dataset sintetico de 200 registros generados con una semilla fija, de los cuales 160 se emplean para entrenamiento y 40 para evaluacion. La ventana de contexto no aplica, ya que no procesa secuencias de texto; la entrada es un vector de tres caracteristicas numericas. Su relevancia actual es didactica: demuestra las buenas practicas de separacion entre pesos (`model.safetensors`), configuracion de preprocesamiento (`config.json`) y definicion de arquitectura (`modelo.py`), ademas de servir como contraste con el flujo equivalente en scikit-learn.

La licencia MIT permite reutilizacion y modificacion sin restricciones practicas para uso comercial, aunque el propio autor advierte que los datos son sinteticos y no representan precios inmobiliarios reales. El repositorio ocupa 0,0 GB y no registra descargas ni interacciones en el momento de la consulta, lo que confirma su naturaleza de material de clase mas que de modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion lineal (una capa `torch.nn.Linear(3, 1)`) |
| Parametros totales | 4 (3 pesos + 1 sesgo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular de 3 caracteristicas) |
| Tipos de cuantizacion | no disponible (pesos en float32) |
| Idiomas soportados | es (documentacion y model card en castellano; el modelo no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`), mas `config.json` y `modelo.py` |

## Arquitectura y entrenamiento

La arquitectura es una regresion lineal pura: una capa `torch.nn.Linear(3, 1)` definida en `modelo.py`, con tres pesos asociados a las entradas `m2`, `balcon` y `ascensor`, y un sesgo. La funcion de perdida es el error cuadratico medio (`MSELoss`) y el optimizador es descenso por gradiente estocastico (`SGD`) con tasa de aprendizaje 0,1 durante 500 epocas; segun la model card, la perdida se estabiliza antes de la epoca 100. No hay RLHF, DPO ni tecnicas de alineacion, dado que no es un modelo generativo.

Los datos de entrenamiento son sinteticos y se generan en `train.py` con la misma semilla que el ejemplo de la Clase 10. El dataset consta de 200 registros (160 de entrenamiento y 40 de evaluacion) con `m2` en el rango de 35 a 120, y las variables binarias `balcon` y `ascensor`. Las entradas se normalizan restando la media y dividiendo por el desvio calculados sobre el conjunto de entrenamiento; ambos estadisticos se almacenan en `config.json`. Los pesos publicados (`lineal.weight` = [35,157; 4,351; 5,992] y `lineal.bias` = 147,769) estan en la escala de las entradas normalizadas, no en la escala original. La innovacion tecnica destacable es el uso de safetensors como formato de serializacion seguro, que a diferencia de pickle o joblib no ejecuta codigo al cargarse.

## Capacidades

- Prediccion de una variable numerica continua (precio en miles de US$) a partir de tres caracteristicas tabulares.
- Regresion sobre datos con relacion aproximadamente lineal entre entradas y objetivo.
- Carga segura de pesos mediante safetensors, sin ejecucion de codigo arbitrario.
- Reproducibilidad completa: el script `train.py` regenera el dataset con semilla fija y `predict.py` documenta el uso.
- Compatibilidad con el ecosistema PyTorch (`state_dict`, `load_state_dict`, `eval()`, `torch.no_grad()`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto.
- No dispone de capacidades multilingues en sentido estricto; el unico idioma documentado es el castellano.

## Casos de uso

- Docencia de PyTorch: el modelo sirve como primer ejemplo completo del ciclo de entrenamiento con `MSELoss` y `SGD`, mostrando la diferencia entre pesos y arquitectura al separar `model.safetensors` de `modelo.py`.
- Comparacion con scikit-learn: permite reproducir el mismo problema de regresion inmobiliaria con ambas bibliotecas y verificar la equivalencia de pesos tras desnormalizar (35,157 / 23,398 ≈ 1,503 para `m2`).
- Ensenanza de serializacion segura: ilustra por que safetensors es preferible a pickle en la distribucion de pesos, ya que el archivo solo contiene numeros y no ejecuta codigo al cargarse.
- Tutorial de preprocesamiento: demuestra la necesidad de persistir media y desvio en `config.json` para que las predicciones sean correctas en inferencia, un error frecuente en pipelines reales.
- Prueba de integracion de HuggingFace Hub: sirve como repositorio minimo para validar flujos de descarga, carga y publicacion de modelos con la libreria `huggingface_hub` y `safetensors`.
- Referencia de estructura de repositorio: el conjunto de archivos (`model.safetensors`, `config.json`, `modelo.py`, `train.py`, `predict.py`, `requirements.txt`) puede usarse como plantilla para publicar modelos tabulares pequenos de forma reproducible.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son las metricas de evaluacion sobre las 40 casas de test:

| Metrica | Resultado |
|---|---|
| MAE | 3,08 miles de US$ |
| R2 | 0,989 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB; los pesos ocupan 4 valores float32 (16 bytes) mas el sesgo, y el modelo completo cabe en cualquier dispositivo.
- GPU recomendadas: no requiere GPU; funciona en CPU sin penalizacion perceptible.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, GTX 1650, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: PyTorch nativo con `safetensors.torch.load_file`; no es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada; por la naturaleza del modelo (una multiplicacion matricial de 3x1) la latencia es del orden de microsegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `FerData/regresion-casas-pytorch` | 4 | no aplica | MAE 3,08; R2 0,989 | MIT | HuggingFace |
| Regresion lineal equivalente en scikit-learn | 4 (coeficientes + intercepto) | no aplica | Equivalente tras desnormalizar | BSD-3-Clause (scikit-learn) | PyPI |
| Ejemplo de regresion tabular con XGBoost | no disponible | no aplica | no disponible | Apache 2.0 (XGBoost) | PyPI |

La comparativa se limita a alternativas del mismo tipo pedagogico, ya que no existen modelos publicados con la misma combinacion exacta de dataset sintetico, tamano y proposito didactico. No se dispone de datos de benchmarks comparativos entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- Fines exclusivamente educativos: los datos son sinteticos y no representan precios inmobiliarios reales.
- Dominio restringido: solo conoce viviendas de 35 a 120 m2; fuera de ese rango la extrapolacion lineal carece de validez.
- Dependencia critica del preprocesamiento: si se omite la normalizacion con media y desvio de `config.json`, las predicciones son incorrectas.
- Dependencia de la arquitectura: `load_state_dict` falla si la clase `RegresionLineal` de `modelo.py` cambia, ya que PyTorch no serializa la definicion del modelo en el archivo de pesos.
- Sin capacidades generativas ni de lenguaje: no puede emplearse para tareas de NLP, vision, agentes o tool calling.
- Riesgo de alucinacion: no aplica en el sentido habitual, pero el modelo puede producir predicciones absurdas si recibe entradas fuera de distribucion sin validacion previa.
- Sesgos conocidos: no documentados en la model card; al ser datos sinteticos, no reflejan sesgos del mercado inmobiliario real.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias sobre idoneidad para produccion.
- Ausencia de validacion externa: sin descargas ni interacciones registradas, no existe evidencia de uso fuera del contexto docente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FerData/regresion-casas-pytorch
- Documentacion de safetensors: https://github.com/huggingface/safetensors
- Documentacion de PyTorch sobre `torch.nn.Linear`: https://pytorch.org/docs/stable/generated/torch.nn.Linear.html
- Documentacion de PyTorch sobre `MSELoss`: https://pytorch.org/docs/stable/generated/torch.nn.MSELoss.html
- Documentacion de PyTorch sobre `SGD`: https://pytorch.org/docs/stable/generated/torch.optim.SGD.html
- Repositorio de scikit-learn (ejemplo equivalente mencionado): https://scikit-learn.org/stable/modules/linear_model.html

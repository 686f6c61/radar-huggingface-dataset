# OneScience-Group/LiNO

## Resumen

LiNO es un modelo neuronal de operadores (neural operator) especializado en la prediccion del estado final de la ecuacion de Burgers viscosa unidimensional. Lo desarrolla OneScience-Group y se distribuye como un paquete reproducible que incluye el checkpoint entrenado (`weight/best_model.pth`), el codigo del modelo, los scripts de entrenamiento e inferencia y las utilidades de visualizacion. No es un modelo de lenguaje: es un surrogate neuronal para simulacion de dinamica de fluidos, orientado a resolver de forma aproximada y rapida un problema de EDP que de otro modo requeriria un solver numerico.

El modelo se enmarca en la linea de trabajo de operadores neuronales aplicados a fluidos (la etiqueta del repositorio es `lino_burgers` y la tematica declarada es `fluid-dynamics`). Resuelve un caso concreto y acotado: predecir el campo de solucion final de Burgers 1D viscosa a partir de las condiciones iniciales, con un error relativo L2 de validacion de 0,00816638 segun la model card, frente al 0,0109 reportado en la Tabla 1 del paper asociado.

Su relevancia es la de un artefacto de investigacion reproducible: permite replicar un experimento publicado con un solo comando de descarga y dos scripts de Python. No esta pensado como servicio general, no tiene pipeline declarado en Hugging Face y su repo ocupa 0,0 GB en el momento de la consulta, por lo que debe tratarse como un paquete de codigo y pesos ligero, no como un modelo fundacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo neuronal para EDP de fluidos, etiqueta `lino_burgers`; no se detalla la topologia en la informacion proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se declara como MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; opera sobre campos de la EDP de Burgers 1D) |
| Tipos de cuantizacion | no disponible (checkpoint en PyTorch, `weight/best_model.pth`) |
| Idiomas soportados | en (segun metadatos; sin relevancia para la tarea numerica) |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch (`.pth`) |
| Libreria | pytorch |
| Tamano del repositorio | 0,0 GB |
| Dataset de entrenamiento | `burgers_data_R10.mat` (OneScience/fno, ModelScope) |
| Error de validacion (L2 relativo) | 0,00816638 |
| Error reportado en paper (Tabla 1) | 0,0109 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la topologia interna del modelo: no se especifica si es un Fourier Neural Operator (FNO), un DeepONet, una variante con attention lineal u otra familia de operadores neuronales. La etiqueta `lino_burgers` y la tematica `fluid-dynamics` situan el trabajo en el ambito de los operadores neuronales para EDP, y el paquete se describe explicitamente como reproduccion del experimento de prediccion del estado final de Burgers viscosa 1D.

El entrenamiento se realizo una unica vez y los autores advierten que las cifras reportadas no constituyen garantia para otra ejecucion. Los datos provienen del dataset `OneScience/fno`, en concreto del fichero `burgers_data_R10.mat`, que el modelo lee desde `data/data/burgers_data_R10.mat`. Los hiperparametros del experimento estan en `config/config.yaml` y el entrenamiento se lanza con `scripts/train.py` sobre un entorno PyTorch con acelerador. No se documentan en la informacion proporcionada el numero de tokens, la composicion del dataset, ni si hubo tecnicas de ajuste tipo RLHF o DPO (no aplicables, por otra parte, a este tipo de modelo).

## Capacidades

- Prediccion del estado final de la ecuacion de Burgers viscosa 1D a partir de las condiciones iniciales del problema.
- Inferencia por lotes mediante `scripts/inference.py` sobre el checkpoint `weight/best_model.pth`.
- Generacion de resultados y visualizaciones con `scripts/result.py`, con salidas registradas en `results/`.
- Reentrenamiento reproducible desde `scripts/train.py` y `config/config.yaml`.
- No dispone de generacion de texto, razonamiento simbolico, codigo, matematicas generales, vision, audio ni capacidades multimodales.
- No soporta tool calling, function calling ni comportamiento agentico.
- No es multilingue en sentido funcional: la etiqueta `en` de los metadatos es administrativa.

## Casos de uso

- Reproduccion de resultados de investigacion: descargar el paquete con `hf download OneScience-Group/LiNO --local-dir ./LiNO`, instalar `requirements.txt` y ejecutar `scripts/inference.py` para verificar el error L2 relativo de validacion (0,00816638) frente al valor del paper (0,0109).
- Baseline para operadores neuronales en EDP: usar el checkpoint y el error reportado como referencia contra la que comparar nuevas arquitecturas sobre el mismo dataset `burgers_data_R10.mat`.
- Prototipado de surrogates para simulacion de fluidos: sustituir el solver numerico por la inferencia del modelo en estudios exploratorios donde se priorice velocidad sobre precision de maquina.
- Docencia y formacion: el paquete incluye entrenamiento, inferencia y visualizacion, lo que permite montar una practica completa de operadores neuronales aplicados a una EDP concreta sin escribir infraestructura desde cero.
- Validacion de pipelines de datos cientificos: el flujo de descarga desde ModelScope y la ruta fija `data/data/burgers_data_R10.mat` sirven para probar integraciones de gestion de datasets cientificos.
- Punto de partida para transferencia a otros regimenes: reentrenar con `scripts/train.py` y `config/config.yaml` sobre variantes del problema de Burgers para estudiar sensibilidad al numero de Reynolds u otras condiciones.

## Benchmarks y rendimiento

| Metrica | LiNO | Referencia |
|---|---|---|
| Error L2 relativo en validacion | 0,00816638 | Paper, Tabla 1: 0,0109 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de modelos de lenguaje, que no aplican a este modelo. Tampoco se aportan comparaciones con otros operadores neuronales sobre el mismo dataset.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamano del checkpoint no se detalla y el repo figura con 0,0 GB.
- GPU recomendadas: no disponible. El entrenamiento requiere un entorno PyTorch con acelerador habilitado, segun la model card.
- Viabilidad en GPU de consumo: no confirmada en la informacion proporcionada; por el caracter ligero del paquete es plausible, pero no hay dato que lo respalde.
- Opciones de despliegue: ejecucion directa con PyTorch mediante `scripts/inference.py`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables aqui).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros operadores neuronales (FNO, DeepONet u otros) ni con solvers numericos de Burgers 1D, y no se aportan parametros, contexto ni metricas de alternativas.

## Limitaciones y advertencias

- Ambito muy restringido: solo resuelve Burgers viscosa 1D en el regimen del dataset `burgers_data_R10.mat`; no es un modelo general de fluidos ni de EDP.
- Entrenado una sola vez: los autores advierten explicitamente que las cifras reportadas no garantizan el comportamiento de otra ejecucion.
- El error de validacion de la model card (0,00816638) difiere del reportado en la Tabla 1 del paper (0,0109); conviene citar ambos con su procedencia.
- No hay informacion sobre sesgos, robustez fuera de distribucion ni degradacion con condiciones iniciales atipicas.
- Riesgo de extrapolacion indebida: usar el modelo fuera del rango de condiciones del dataset producira predicciones sin garantia.
- Licencia del codigo apache-2.0, pero la model card advierte que la licencia del dataset no debe inferirse de la del codigo; verificar los terminos de `OneScience/fno` antes de uso comercial o redistribucion.
- Sin pipeline declarado en Hugging Face, sin descargas ni likes en el momento de la consulta: no hay evidencia de uso en produccion por terceros.
- Dependencia de rutas fijas (`data/data/burgers_data_R10.mat`) y de una descarga externa desde ModelScope, lo que anade un paso manual al despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/OneScience-Group/LiNO
- Paper: https://arxiv.org/abs/2606.03262
- Dataset en ModelScope: https://www.modelscope.cn/datasets/OneScience/fno
- Repositorio de referencia del dataset (mencionado en la model card): OneScience/fno

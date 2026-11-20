# Antonioaguilera2005/rnn-brent-signals

## Resumen

`Antonioaguilera2005/rnn-brent-signals` es un modelo academico de series temporales publicado en Hugging Face por el usuario Antonioaguilera2005. Se trata de una RNN de una sola capa con activacion tanh y 32 unidades ocultas, disenada para estimar el precio spot del petroleo Brent en USD/barril a tres horizontes: 5, 63 y 252 dias. El modelo consume 16 senales causales (derivadas de Brent, WTI, VIX, oro, cobre, indice del dolar y el futuro del Brent) sobre una ventana de 60 observaciones y produce tres componentes de salida, uno por horizonte.

El checkpoint publicado es el resultado de un proceso experimental con multiples arquitecturas y configuraciones, fijado con semilla 42. El entrenamiento y el ajuste del escalado se realizaron hasta el 29 de diciembre de 2017, la validacion cubre de enero de 2018 a diciembre de 2022 y existe una comparacion historica guardada para 2023-2024. El modelo tiene tan solo 1.699 parametros, lo que lo situa en la categoria de ejercicios educativos mas que en la de herramienta de produccion.

Su relevancia es limitada y acotada: sirve como referencia reproducible de un pipeline completo de forecasting financiero (preprocesamiento, escalado, inferencia en Python y en JavaScript) y como ejemplo de evaluacion honesta, ya que el propio autor documenta que el modelo solo supera al ingenuo spot a 5 dias y practicamente empata a 63 y 252 dias. No es un modelo de lenguaje ni un transformer; es una RNN minima aplicada a una tarea de regresion multivariante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RNN de una capa con activacion tanh y 32 unidades ocultas; salida lineal de 3 componentes |
| Parametros totales | 1.699 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de 60 observaciones (senales) mas 252 filas de calentamiento previo |
| Tipos de cuantizacion | no disponible (pesos en precision original, sin variantes cuantizadas publicadas) |
| Idiomas soportados | es (documentacion y etiquetas) |
| Licencia | no disponible (el autor indica que no se ha asignado licencia de redistribucion) |
| Formato de pesos | `model.json` (pesos exactos y escalado, sin pickle); checkpoint original en `model.pt` |

## Arquitectura y entrenamiento

La arquitectura es una RNN recurrente simple de una capa con 32 unidades y activacion tanh. En cada paso temporal procesa un vector de 16 senales causales y, al final de la ventana de 60 observaciones, utiliza el ultimo estado oculto para producir mediante una capa lineal tres salidas correspondientes a los cambios normalizados a 5, 63 y 252 dias. El modelo tiene 1.699 parametros en total, sin dropout ni penalizacion L2 en este checkpoint concreto. La tasa de aprendizaje fue de 0,001 y la epoca seleccionada la 17.

El entrenamiento y el ajuste del escalado se realizaron con datos hasta el 29 de diciembre de 2017. La validacion, usada para seleccionar la epoca, abarca de enero de 2018 a diciembre de 2022. Las entradas multivariables completas empiezan en 2012. El bloque 2023-2024 se habia consultado previamente durante el proyecto, por lo que el autor advierte explicitamente que sus resultados no constituyen una prueba ciega. El preprocesamiento incluye cambios logaritmicos de Brent a 1, 5, 21 y 63 dias, volatilidades muestrales a 21 y 63 dias, distancias a medias de 63 y 252 dias, drawdown a 252 dias, cambio de `asinh(WTI/20)`, cambios logaritmicos de oro, cobre y dolar, logaritmo del VIX y base futuro/spot. Cada senal se normaliza restando la mediana y dividiendo por la escala guardada.

## Capacidades

- Prediccion de cambios normalizados del precio spot del Brent a tres horizontes: 5, 63 y 252 dias.
- Entrada multivariante con 16 senales causales derivadas de Brent, WTI, VIX, oro, cobre, indice del dolar y futuro del Brent.
- Inferencia en Python mediante `predict_frame` y script de linea de comandos `inference.py`.
- Inferencia en navegador mediante `engine.js`, importable como modulo ES a traves de `package.json`.
- Acepta valores negativos en WTI; el resto de entradas deben ser positivas.
- Generacion de bandas simetricas del 80 % basadas en un cuantil empirico de los errores absolutos de validacion (rangos descriptivos, sin garantia formal de cobertura).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- No es un modelo de lenguaje: no genera texto libre ni mantiene conversaciones.

## Casos de uso

- Docencia y formacion en forecasting financiero: el paquete incluye `preprocessing.json`, `scaler.json`, `metrics.json` y `manifest.json`, lo que permite reproducir paso a paso un pipeline completo de series temporales con particion temporal estricta.
- Referencia base para experimentos academicos: sirve como linea base minima (1.699 parametros) contra la que comparar arquitecturas mas complejas (LSTM, GRU, transformers temporales) en la misma tarea de prediccion del Brent.
- Validacion de pipelines de inferencia en dos lenguajes: la existencia de `inference.py` y `engine.js` permite verificar que una implementacion en Python y otra en JavaScript producen resultados equivalentes sobre el mismo CSV.
- Prototipado de sistemas de alerta temprana a 5 dias: dado que a ese horizonte el modelo supera al ingenuo spot (RMSE/ingenuo = 0,8856), puede usarse como componente de un sistema experimental de senales a corto plazo, siempre con validacion adicional.
- Ejemplo de evaluacion honesta en publicaciones: el autor documenta explicitamente los horizontes en los que el modelo no aporta valor (63 y 252 dias, con R² negativos), lo que lo convierte en un caso de estudio sobre como reportar limitaciones.
- Integracion en cuadernos de analisis cuantitativo: el formato `model.json` sin pickle y la ausencia de dependencias de `AutoModel` facilitan la inspeccion de pesos y escalados en entornos restringidos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (conjunto de validacion, checkpoint elegido):

| Horizonte (dias) | N | MAE | MSE | RMSE | R² | RMSE/ingenuo spot | RMSE/futuro conocido |
|---|---:|---:|---:|---:|---:|---:|---:|
| 5 | 499 | 3,1266 | 15,1453 | 3,8917 | 0,5584 | 0,8856 | 1,0798 |
| 63 | 441 | 7,5916 | 83,4733 | 9,1364 | -1,2741 | 0,9996 | 1,0734 |
| 252 | 258 | 7,7594 | 89,6678 | 9,4693 | -2,1297 | 1,0046 | 1,0807 |

Los cocientes inferiores a 1 indican menor RMSE que la referencia correspondiente; el autor aclara que esto no implica rentabilidad. El modelo mejora al ingenuo spot a 5 dias, practicamente empata a 63 y 252 dias y no supera al futuro conocido en ninguno de los tres horizontes. Los R² de los horizontes largos son negativos y sus errores estan solapados. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB para los pesos (1.699 parametros en precision original); el cuello de botella es la RAM para cargar el CSV de entrada, no la GPU.
- GPU recomendadas: ninguna en particular; el modelo puede ejecutarse en CPU sin dificultad.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) e incluso en dispositivos de bajos recursos; tambien en navegador mediante `engine.js`.
- Opciones de despliegue: ejecucion directa con PyTorch (`inference.py`), llamada programatica a `predict_frame` desde Python o importacion de `engine.js` como modulo ES en un navegador. No se documenta integracion con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera una latencia despreciable frente al coste de preparar las 252 filas de calentamiento y la ventana de 60 senales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Antonioaguilera2005/rnn-brent-signals` | 1.699 | Ventana de 60 observaciones + 252 de calentamiento | Prediccion del Brent a 5, 63 y 252 dias | no disponible | Hugging Face (0 descargas, 0 likes) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria (RNN minimas para forecasting del Brent) en la informacion proporcionada.

## Limitaciones y advertencias

- El propio autor documenta que el modelo solo supera al ingenuo spot a 5 dias y que practicamente empata a 63 y 252 dias; los R² de los horizontes largos son negativos (-1,2741 y -2,1297).
- No supera al futuro conocido del Brent en ninguno de los tres horizontes (cocientes RMSE/futuro conocidos superiores a 1,07 en todos los casos).
- Las bandas del 80 % son rangos descriptivos basados en errores de validacion, sin garantia formal de cobertura futura; la incertidumbre es especialmente amplia a 252 dias.
- El bloque 2023-2024 se habia consultado previamente durante el proyecto, por lo que no constituye una prueba ciega.
- No se ha asignado licencia de redistribucion; antes de un uso comercial debe revisarse la titularidad del codigo y las condiciones de las fuentes (FRED/ALFRED y Yahoo Finance).
- Es un ejercicio educativo: no incluye estrategia de negociacion ni evaluacion de comisiones, liquidez o rentabilidad.
- El CSV de entrada debe respetar estrictamente la causalidad (no rellenar hacia atras ni introducir precios conocidos despues del origen); un uso incorrecto invalida los resultados.
- Requiere al menos 252 filas de calentamiento y una ventana posterior de 60 senales completas, una fila por dia de lunes a viernes incluidos festivos.
- Riesgo de sesgo y alucinacion: no aplica en el sentido de modelos de lenguaje, pero el modelo puede producir predicciones con apariencia de validez en regimenes de mercado no representados en el entrenamiento (hasta 2017) y la validacion (2018-2022).
- Idiomas: la documentacion esta en castellano; el modelo no procesa texto.

## Enlaces

- Hugging Face: https://huggingface.co/Antonioaguilera2005/rnn-brent-signals
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la informacion proporcionada.

# grisselblanco/01-sklearn-regresion

## Resumen

`grisselblanco/01-sklearn-regresion` es un modelo de regresion lineal entrenado con scikit-learn que predice el precio de una vivienda en miles de dolares estadounidenses a partir de tres variables tabulares: superficie en metros cuadrados (`m2`), presencia de balcon (`balcon`) y presencia de ascensor (`ascensor`). Lo publica la usuaria de HuggingFace `grisselblanco` como ejemplo pedagogico para el IFTS N.º 18, con la docente Cynthia M. Villagra como responsable, y su proposito explicito es ilustrar el ciclo completo de publicacion de un modelo supervisado: entrenamiento, serializacion con `joblib` y comparticion en el Hub.

No se trata de un modelo de lenguaje ni de una red neuronal: es un estimador clasico de minimos cuadrados ordinarios con cuatro parametros aprendidos (tres pesos y un sesgo). El dataset es sintetico, de 200 registros generados con una formula lineal conocida mas ruido, lo que hace que el modelo recupere casi exactamente la funcion generadora. Su relevancia es didactica, no productiva: sirve como plantilla minima reproducible para quienes se inician en el ecosistema de HuggingFace con modelos tabulares.

El repositorio ocupa 0,0 GB, no registra descargas ni likes en el momento de la consulta y esta etiquetado con licencia MIT, idioma espanol y pipeline `tabular-regression`. La ficha siguiente describe sus especificaciones, rendimiento declarado y limitaciones tal como aparecen en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion lineal multiple (minimos cuadrados ordinarios, `sklearn.linear_model.LinearRegression`) |
| Parametros totales | 4 parametros aprendidos (3 pesos + 1 intercepto) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo tabular, sin ventana de contexto) |
| Tipos de cuantizacion | No disponible (no aplica; pesos en punto flotante de 64 bits por defecto de scikit-learn) |
| Idiomas soportados | Espanol (documentacion y model card); el modelo en si no procesa texto |
| Licencia | MIT |
| Formato de pesos | `model.joblib` (serializacion con `joblib`, basada en pickle) |

## Arquitectura y entrenamiento

El modelo es una regresion lineal multiple sin regularizacion resuelta por minimos cuadrados ordinarios mediante `sklearn.linear_model.LinearRegression`. La funcion hipotetica es `precio = w1·m2 + w2·balcon + w3·ascensor + b`, con tres variables de entrada y una salida continua. Los pesos aprendidos son 1,503 para `m2`, 8,719 para `balcon` y 11,988 para `ascensor`, con un intercepto de 19,557, valores muy proximos a los coeficientes usados para generar los datos sinteticos (1,5, 8 y 12, respectivamente, con sesgo 20).

Los datos de entrenamiento son 200 registros sinteticos generados en `train.py` con semilla fija; 160 se destinan a entrenamiento y 40 a evaluacion. Las entradas `m2` varian entre 35 y 120, y `balcon` y `ascensor` son binarias (0 o 1). La variable objetivo `precio` se expresa en miles de dolares. No se empleo RLHF, DPO ni ninguna tecnica de ajuste fino; tampoco hay validacion cruzada, busqueda de hiperparametros ni regularizacion documentada. La innovacion tecnica es nula por diseno: el interes esta en la reproducibilidad (misma semilla, mismo dataset que la Clase 10) y en la transparencia de los coeficientes publicados.

## Capacidades

- Prediccion de una variable continua (`precio` en miles de USD) a partir de tres caracteristicas tabulares numericas.
- Inferencia por lotes sobre un `pandas.DataFrame` con las columnas `m2`, `balcon` y `ascensor`.
- Serializacion y carga via `joblib` y `huggingface_hub.hf_hub_download`.
- Reproducibilidad completa del entrenamiento mediante `train.py` y `requirements.txt`.
- Interpretabilidad directa de los coeficientes: cada peso tiene una lectura economica inmediata (USD por m², USD por balcon, USD por ascensor).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto.

## Casos de uso

- Docencia de regresion lineal: el modelo sirve como ejemplo ejecutable en clase para mostrar como se ajustan coeficientes, se evalua con MAE y R² y se serializa un estimador de scikit-learn.
- Plantilla de publicacion en HuggingFace: util para ensenar el flujo `hf_hub_download` + `joblib.load` con un repositorio minimo y sin dependencias pesadas.
- Prueba de infraestructura de inferencia tabular: al ocupar 0,0 GB y requerir solo scikit-learn y pandas, permite validar pipelines de serving para modelos clasicos sin coste de GPU.
- Baseline de referencia en proyectos de regresion inmobiliaria: sus coeficientes (1.503 USD/m², 8.719 USD por balcon, 11.988 USD por ascensor) sirven como punto de comparacion inicial antes de probar modelos no lineales.
- Ejercicio de analisis de sensibilidad: al ser lineal y aditivo, permite calcular derivadas parciales exactas y discutir cuando esa suposicion falla en datos reales.
- Demostracion de riesgos de seguridad en `joblib`/pickle: el propio autor advierte del riesgo de ejecucion de codigo al cargar archivos `.joblib` de fuentes no confiables, lo que lo convierte en un caso practico para formar en buenas practicas de cadena de suministro de modelos.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de evaluacion de 40 registros no vistos durante el entrenamiento:

| Metrica | Resultado |
|---|---|
| MAE | 3,08 miles de USD |
| R² | 0,989 |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, dado que el modelo es tabular y no de lenguaje.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo cabe en memoria principal (el repositorio ocupa 0,0 GB).
- GPU recomendadas: ninguna; CPU es suficiente y preferible por simplicidad.
- Cabe en cualquier GPU consumer y en cualquier maquina con Python y scikit-learn instalados.
- Despliegue: carga directa con `joblib` en un script de Python, o exposicion mediante FastAPI/Flask; no aplica vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada; para 200 registros y 4 parametros, la inferencia es del orden de microsegundos por muestra en CPU.
- Dependencias: `scikit-learn`, `pandas`, `joblib` y `huggingface_hub` (segun `requirements.txt` del repositorio).

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros modelos tabulares comparables ni datos de rendimiento de alternativas. Como referencia conceptual, cualquier `LinearRegression` de scikit-learn entrenado sobre el mismo dataset sintetico produciria coeficientes practicamente identicos, al ser un problema convexo con solucion cerrada.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `grisselblanco/01-sklearn-regresion` | 4 | No aplica | MAE 3,08; R² 0,989 | MIT | HuggingFace |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Fines exclusivamente educativos: los datos son sinteticos y no representan precios inmobiliarios reales.
- Dominio restringido: solo conoce viviendas de 35 a 120 m²; fuera de ese rango extrapola linealmente sin garantia de acierto.
- Suposicion de aditividad estricta: cada caracteristica suma un importe fijo; no captura interacciones (por ejemplo, que el ascensor valga mas en edificios altos) ni no linealidades.
- Riesgo de seguridad en la carga: `joblib` usa pickle, por lo que cargar un `.joblib` de una fuente no confiable puede ejecutar codigo arbitrario. Cargar solo archivos de origen verificado.
- Compatibilidad de versiones: la version de scikit-learn usada en la carga deberia coincidir con la del entrenamiento para evitar avisos o discrepancias en la deserializacion.
- Sin sesgos documentados sobre datos reales, al no haber datos reales; cualquier uso con poblaciones reales requeriria reentrenamiento y validacion.
- Riesgo de alucinacion no aplica (no genera texto), pero si existe riesgo de extrapolacion silenciosa sin aviso al usuario.
- Licencia MIT: permite uso comercial y modificacion con atribucion; no obstante, el caracter sintetico del dataset invalida cualquier uso comercial como predictor de precios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/grisselblanco/01-sklearn-regresion
- Documentacion de scikit-learn sobre `LinearRegression`: https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LinearRegression.html
- Documentacion de `joblib` sobre persistencia de modelos: https://joblib.readthedocs.io/en/stable/persistence.html
- Documentacion de `huggingface_hub.hf_hub_download`: https://huggingface.co/docs/huggingface_hub/guides/download
- Repositorio, paper o demo adicional: no disponible en la informacion proporcionada.

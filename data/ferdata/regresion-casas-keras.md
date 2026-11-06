# FerData/regresion-casas-keras

## Resumen

`FerData/regresion-casas-keras` es un modelo de regresion tabular publicado en Hugging Face por el usuario FerData, desarrollado como ejemplo pedagogico para el Seminario de Actualizacion del IFTS N.º 18 (docente: Cynthia M. Villagra). No es un modelo de lenguaje ni una red neuronal profunda: es una regresion lineal implementada con Keras 3 cuyo unico objetivo es predecir el precio de una vivienda, en miles de dolares estadounidenses, a partir de tres variables de entrada (`m2`, `balcon`, `ascensor`).

El modelo resuelve el mismo problema que los ejemplos clasicos de scikit-learn y PyTorch, y su interes es fundamentalmente didactico: muestra como entrenar una regresion lineal con Keras, como integrar una capa `Normalization` dentro del grafo del modelo y como exportar todo (arquitectura, pesos, estadisticas de normalizacion y configuracion) en un unico archivo en formato nativo `.keras`. El dataset es sintetico (200 registros generados en `train.py` con semilla fija) y no representa viviendas reales.

Por su naturaleza, no compite con modelos fundacionales ni con LLM: es una pieza de material docente para quienes aprenden el ciclo completo de entrenamiento, evaluacion y serializacion de un modelo de regresion en Keras 3, con backend PyTorch o TensorFlow. Su relevancia actual es la de un ejemplo reproducible y minimo del ecosistema Keras 3 y del formato `.keras`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Sequential` con capa `Normalization` + capa `Dense(1)` (regresion lineal) |
| Parametros totales | 4 (tres pesos y un bias) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones) |
| Idiomas soportados | es (documentacion y model card en espanol) |
| Licencia | MIT |
| Formato de pesos | `.keras` (formato nativo de Keras 3) |

## Arquitectura y entrenamiento

La arquitectura es un `Sequential` de Keras 3 compuesto por una capa `Normalization` seguida de una capa `Dense(1)`. La capa `Normalization` aprende la media y la desviacion tipica de las variables de entrada mediante `adapt()` sobre los datos de entrenamiento, y al formar parte del modelo se serializa dentro de `model.keras`, de modo que no es necesario normalizar manualmente en inferencia. La capa `Dense(1)` aporta los tres pesos (uno por cada variable de entrada) y el bias, lo que da un total de cuatro parametros entrenables.

El entrenamiento es supervisado, de tipo regresion, con funcion de perdida de error cuadratico medio (`mse`), optimizador SGD con tasa de aprendizaje 0,1 y 200 epocas. El dataset es sintetico y consta de 200 registros, de los cuales 160 se usan para entrenamiento y 40 para evaluacion. Las variables de entrada son `m2` (rango de 35 a 120), `balcon` (0 o 1) y `ascensor` (0 o 1); la variable objetivo es `precio`, expresada en miles de US$. El modelo se entreno con Keras 3 usando backend PyTorch, y segun la model card tambien funciona con TensorFlow. No se documenta el uso de tecnicas de RLHF, DPO ni innovaciones como decodificacion especulativa o atencion lineal, por tratarse de un modelo tabular lineal.

## Capacidades

- Regresion tabular: predice una variable numerica continua (precio en miles de US$) a partir de tres entradas numericas.
- Normalizacion integrada: incorpora las estadisticas de normalizacion dentro del propio modelo, sin pasos externos de preprocesado en inferencia.
- Serializacion unica: guarda arquitectura, pesos, normalizacion y configuracion de entrenamiento en un solo archivo `.keras`.
- Compatibilidad de backend: funciona con Keras 3 sobre PyTorch o TensorFlow.
- Reproducibilidad: el dataset sintetico se genera con semilla fija en `train.py`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues mas alla de la documentacion en espanol.

## Casos de uso

- Docencia de regresion lineal en Keras: sirve como ejemplo minimo y reproducible para explicar el ciclo completo de entrenamiento, evaluacion y guardado de un modelo en Keras 3, con solo cuatro parametros entrenables.
- Comparativa entre frameworks: al resolver el mismo problema que los ejemplos de scikit-learn y PyTorch, permite contrastar la API de Keras 3 con la de esas bibliotecas en un problema identico.
- Demostracion del formato `.keras`: util para mostrar como se serializa un modelo completo (incluida la capa `Normalization`) en un unico archivo, frente a enfoques que guardan la normalizacion por separado.
- Ejercicio de evaluacion de modelos: las metricas MAE (3,10 miles de US$) y R² (0,989) sobre 40 muestras de test sirven como referencia para practicar la interpretacion de errores en regresion.
- Prueba de integracion de Keras 3 con backend PyTorch: el modelo permite verificar que un pipeline de Keras 3 funciona correctamente sobre PyTorch en un entorno nuevo.
- Material de laboratorio para el IFTS N.º 18: encaja como punto de partida en practicas de regresion supervisada con datos tabulares sinteticos y semilla fija.
- Ejemplo de inferencia por lotes: el script `predict.py` y el ejemplo de la model card muestran como cargar el modelo y predecir sobre un array de entrada con el orden de columnas fijo.

## Benchmarks y rendimiento

Resultados publicados en la model card, evaluados sobre 40 casas no vistas durante el entrenamiento:

| Metrica | Resultado |
|---|---|
| MAE | 3,10 miles de US$ |
| R² | 0,989 |

No se han publicado resultados de benchmarks adicionales ni comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el modelo tiene cuatro parametros y cabe en cualquier entorno, incluida CPU.
- GPU recomendadas: no aplica; no requiere GPU. Puede ejecutarse en CPU sin problema.
- Cabe en cualquier GPU consumer y en CPU; no se necesita hardware especializado.
- Opciones de despliegue: carga directa con `keras.saving.load_model("model.keras")` en Keras 3 (backend PyTorch o TensorFlow). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no se publican mediciones; por el tamano del modelo, la inferencia es inmediata en CPU.

## Comparativa con modelos similares

No se dispone de informacion sobre otros modelos comparables en la informacion proporcionada. Como referencia cualitativa, la propia model card indica que resuelve el mismo problema que los ejemplos de regresion de scikit-learn y PyTorch, pero no se aportan datos de parametros, contexto, rendimiento ni licencia de esas alternativas.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FerData/regresion-casas-keras | 4 | no aplica | MAE 3,10; R² 0,989 | MIT | Hugging Face |
| Ejemplo scikit-learn | no disponible | no aplica | no disponible | no disponible | no disponible |
| Ejemplo PyTorch | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Fines exclusivamente educativos: el dataset es sintetico y los precios no representan valores reales de mercado.
- Rango de entrada limitado: solo conoce casas de 35 a 120 m²; fuera de ese rango la prediccion no es fiable.
- Orden de columnas fijo: la entrada debe ser `m2`, `balcon`, `ascensor`; el modelo recibe un array, no una tabla con nombres de columnas.
- Dependencia de version: requiere Keras 3; el formato `.keras` no se abre con versiones antiguas de TensorFlow/Keras 2.
- Sesgos: no se documentan sesgos especificos, pero al entrenarse con datos sinteticos generados por una formula, el modelo aprende exactamente esa relacion y no patrones del mundo real.
- Riesgo de alucinacion: no aplica en el sentido habitual (no es un modelo generativo de texto), pero puede producir predicciones erroneas fuera del dominio de entrenamiento.
- Licencia MIT: permite uso comercial y modificacion, aunque el caracter pedagogico y los datos sinteticos limitan su utilidad practica en produccion.
- No es un modelo de lenguaje: no soporta generacion de texto, codigo, vision ni agentes; no debe evaluarse con benchmarks de LLM.

## Enlaces

- Hugging Face: https://huggingface.co/FerData/regresion-casas-keras
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la informacion disponible.

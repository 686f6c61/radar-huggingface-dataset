# iaac-maai/day4-group2-house-price-mlp

## Resumen

El modelo `iaac-maai/day4-group2-house-price-mlp` es un perceptrón multicapa (MLP) de muy pequeno tamano desarrollado por el equipo del curso AI Methods I del IAAC MaAI (2026/27), formado por Karthikeyan Saravanan, Emmanuel Marquez, Bars Babila y Samiha Abeda Nur. Resuelve una tarea de regresion tabular: estimar el precio de venta de una vivienda en el condado de King (Washington, EE. UU., incluida Seattle) a partir de 13 variables sobre el edificio y su ubicacion, como superficie habitable, numero de habitaciones, plantas, calidad, antiguedad, reformas, latitud/longitud y codigo postal.

La red tiene una arquitectura simple de 82 entradas (12 columnas numericas estandarizadas mas el codigo postal codificado one-hot con 70 categorias) que pasa por dos capas ocultas de 64 y 32 neuronas con activacion ReLU hasta una unica salida, que representa `log10(price)`. En total son 7.425 parametros entrenables, entrenados desde cero con PyTorch sobre ventas de mayo de 2014 a mayo de 2015. Su proposito es ofrecer una estimacion de cribado rapida para arquitectos, promotores, compradores y profesionales inmobiliarios, por ejemplo para comparar opciones de diseno sobre una misma parcela antes de encargar una tasacion profesional.

Es relevante como ejemplo didactico de pipeline completo de regresion tabular con PyTorch, y porque cuantifica explicitamente su incertidumbre: en el conjunto de test se desvia tipicamente un 12,6 % del precio real (R² = 0,877 sobre `log10(price)`), ligeramente por detras del modelo de gradient boosting del mismo curso (12,2 %, R² = 0,886). No es un modelo de lenguaje ni procesa texto: es un regresor numerico de alcance geografico y temporal muy acotado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP: 82 entradas → Linear 64 → ReLU → Linear 32 → ReLU → Linear 1 (sin dropout) |
| Parametros totales | 7.425 (todos entrenables) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones; pesos en `state_dict` de PyTorch) |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | `model.pt` (`state_dict` de PyTorch, 32 KB) + `scaler.joblib` (preprocesador `ColumnTransformer` de scikit-learn, 3 KB) |

## Arquitectura y entrenamiento

La arquitectura es un perceptron multicapa completamente conectado de tres capas lineales (82→64→32→1) con activaciones ReLU y sin dropout. La entrada se construye con un `ColumnTransformer` de scikit-learn que estandariza con `StandardScaler` las 12 variables numericas y aplica codificacion one-hot al `zipcode` (70 codigos postales), lo que da los 82 valores de entrada. La salida es un unico escalar que representa `log10(price)`; el precio en USD se recupera como `10 ** output`. El modelo se entreno desde cero, sin modelo base ni ajuste fino.

Los datos de entrenamiento son ventas reales del condado de King entre mayo de 2014 y mayo de 2015. El conjunto de test empleado para las metricas reportadas contiene 4.147 viviendas. No se documenta en la informacion disponible el numero exacto de ejemplos de entrenamiento, la composicion detallada del dataset ni si se aplicaron tecnicas de regularizacion, aumento de datos o ajuste de hiperparametros mas alla de los valores indicados. Tampoco se especifica si hubo validacion cruzada ni la estrategia de particion train/test/validacion. El pipeline completo esta disponible en el repositorio de GitHub del curso.

## Capacidades

- Regresion tabular: estima `log10(price)` de una vivienda a partir de 13 variables de entrada en un orden fijo.
- Prediccion de precio en USD mediante transformacion inversa (`10 ** salida`).
- Manejo de variables numericas estandarizadas y de codigo postal como variable categorica one-hot.
- Cuantificacion de incertidumbre documentada: error tipico del 12,6 % y banda de ±20 % que cubre aproximadamente el 80 % de las viviendas del test.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa texto).
- No dispone de modo thinking, vision ni audio.
- No genera texto: es exclusivamente un regresor numerico.

## Casos de uso

- Cribado de opciones de diseno sobre una parcela: dado un codigo postal y unas caracteristicas constructivas, el modelo compara rapidamente el valor estimado de mantener una vivienda existente frente a sustituirla por una nueva, como ilustra el ejemplo del ZIP 98117 (1.500 sqft en 1952, unos 504.000 USD, frente a 2.800 sqft nuevas, unos 825.000 USD). Es adecuado porque devuelve una estimacion en milisegundos y con una banda de error conocida, suficiente para decidir si merece la pena profundizar en el estudio.
- Analisis de viabilidad preliminar para promotores: estimar el rango de precio de venta esperado de una promocion en el condado de King antes de encargar una tasacion, usando la incertidumbre del ±12,6 % para acotar el margen del proyecto.
- Comparacion de alternativas de reforma: evaluar como varia el precio estimado al cambiar plantas, numero de banos, calidad (`grade`) o condicion (`condition`) manteniendo fijas ubicacion y superficie de parcela.
- Herramienta educativa en cursos de machine learning: sirve como ejemplo completo de pipeline de regresion tabular con PyTorch, preprocesador de scikit-learn y evaluacion con R² y MAE sobre `log10(price)`, incluido el calculo del error tipico como `10^MAE − 1`.
- Prototipado rapido de interfaces inmobiliarias: integrar el modelo en una demo o notebook para que un usuario introduzca caracteristicas de una vivienda y obtenga una estimacion orientativa junto con su margen de error.
- Analisis exploratorio de sensibilidad de precios: variar sistematicamente una o dos variables (por ejemplo, `sqft_living` o `grade`) dentro de los rangos observados en los datos para trazar curvas de precio estimado y detectar umbrales relevantes.
- Benchmark interno de referencia: usar el MLP como linea base ligera (7.425 parametros, 32 KB de pesos) frente a modelos mas complejos en tareas de regresion tabular similares.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el conjunto de test de 4.147 viviendas. El error tipico se define como `10^MAE(log10) − 1`.

| Modelo (test, 4.147 viviendas) | R² sobre log10(price) | Error tipico | Error medio (USD) |
|---|---|---|---|
| Baseline dummy (siempre el precio medio) | 0,000 | 47,0 % | 196.281 |
| Gradient boosting (Day 2) | 0,886 | 12,2 % | 60.201 |
| Este modelo (MLP) | 0,877 | 12,6 % | 62.797 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; los pesos ocupan 32 KB y el modelo completo cabe holgadamente en cualquier GPU, e incluso en CPU.
- GPU recomendadas: ninguna en particular; cualquier GPU consumer (por ejemplo, GTX 1050, RTX 3050 o superiores) o incluso CPU es suficiente. Tambien es viable en entornos sin GPU.
- Cabe en cualquier GPU consumer: si, sin restricciones practicas.
- Opciones de despliegue: inferencia directa con PyTorch (`torch.load` del `state_dict`), serializacion con `joblib` para el preprocesador, y servicio mediante FastAPI, Flask o TorchServe. No aplican vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, la latencia por prediccion sera del orden de microsegundos a milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | R² (log10 price) | Error tipico | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Este modelo (MLP) | MLP tabular | 7.425 | no aplica | 0,877 | 12,6 % | MIT | Hugging Face |
| Gradient boosting (Day 2, mismo curso) | Gradient boosting | no disponible | no aplica | 0,886 | 12,2 % | no disponible | Repositorio del curso |
| Baseline dummy | Media del precio | 0 | no aplica | 0,000 | 47,0 % | no disponible | Referencia interna |

No se dispone de informacion sobre otros modelos comparables de terceros en la documentacion proporcionada.

## Limitaciones y advertencias

- Alcance geografico y temporal muy restringido: solo conoce ventas del condado de King entre mayo de 2014 y mayo de 2015; no es valido para otras regiones ni para el mercado actual.
- No debe usarse para decisiones sobre una propiedad o persona concreta: fijar precio de venta u oferta, concesion de hipotecas, seguros, evaluacion de impuestos o tasaciones oficiales requieren una valoracion profesional con datos de mercado actuales.
- Tipos de edificio no soportados: apartamentos, edificios comerciales o de uso mixto, operaciones de suelo, edificios sin terminar, ventas en dificultades, propiedades frente al mar o con vistas, y viviendas fuera de los rangos de entrenamiento (por ejemplo, mas de 4.970 sqft, mas de 6 habitaciones o parcelas rurales muy grandes).
- No evalua la calidad del diseno: no ve el interior, los materiales ni el rendimiento energetico, por lo que solo estima a que se vendieron casas con esas caracteristicas, no que diseno es mejor.
- Riesgo de error elevado en los extremos: las mayores desviaciones se producen en viviendas caras (subestimadas) y en algunas viviendas baratas (sobrestimadas); aproximadamente una de cada cinco viviendas del test se desvia mas del 20 %.
- Dependencia estricta del preprocesador: las 13 columnas deben entregarse en el orden especificado y transformarse con el `scaler.joblib` original; usar otro escalado invalida las predicciones.
- Sesgos conocidos: no se documentan analisis de sesgo en la informacion disponible; al entrenarse con un unico mercado local y un unico periodo, puede reflejar sesgos de precios de ese mercado y momento concretos.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero las limitaciones de alcance anteriores hacen desaconsejable su uso en produccion para decisiones reales sobre inmuebles.
- Caveat para produccion: es un modelo de curso con 0 descargas y 0 likes en Hugging Face; no hay evidencia de validacion independiente ni mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iaac-maai/day4-group2-house-price-mlp
- Repositorio GitHub del pipeline completo: https://github.com/iaac-maai/2-day4-assignment
- Figura de prediccion frente a valor real: https://huggingface.co/iaac-maai/day4-group2-house-price-mlp/resolve/main/07_test_predicted_vs_actual.png
- Figura de ejemplo de aplicacion (dos opciones de diseno): https://huggingface.co/iaac-maai/day4-group2-house-price-mlp/resolve/main/09_application_design_options.png

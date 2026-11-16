# salgr/GPT-6.3-Astra

## Resumen

GPT-6.3 Astra es un modelo publicado en Hugging Face por el usuario salgr bajo una licencia Apache 2.0. A pesar de su nombre y de las etiquetas que lo acompanan ("OpenAI", "GPT-6.3", "SOTA", "Official"), el propio autor lo describe en su model card como una red neuronal de 63.000 parametros totalmente conectada, con tres capas ocultas y activacion tanh, entrenada para aproximar la funcion matematica `x·sin(2x)`. No se trata, por tanto, de un modelo de lenguaje generativo, sino de un perceptron multicapa de regresion univariante.

El modelo recibe un unico numero real como entrada y devuelve otro unico numero real como salida. Su proposito es ajustar una funcion sintetica con ruido gaussiano anadido, un ejercicio clasico de regresion no lineal. La relevancia de esta ficha no reside en sus capacidades practicas como modelo de lenguaje, sino en documentar con rigor que el artefacto publicado no coincide con lo que sugieren sus metadatos, lo que constituye un caso ilustrativo de ruido y etiquetado enganoso en repositorios abiertos.

La arquitectura declarada es 1 → 125 → 249 → 125 → 1, con pesos en `float32`, y los tamanos de las capas ocultas se eligieron deliberadamente para que el total de parametros sumase exactamente 63.000. El repositorio tiene un tamano de 0,0 GB y registra cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptron multicapa (MLP) totalmente conectado, 1 → 125 → 249 → 125 → 1, activacion tanh en capas ocultas y salida lineal |
| Parametros totales | 63.000 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada y salida son un unico escalar) |
| Tipos de cuantizacion | no disponible (pesos en `float32`) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un perceptron multicapa de cuatro capas lineales con activacion tanh en las tres capas ocultas y salida lineal: `Linear(1→125)` (250 parametros), `Linear(125→249)` (31.374 parametros), `Linear(249→125)` (31.250 parametros) y `Linear(125→1)` (126 parametros). La inicializacion de pesos sigue una normal con desviacion `1/fan_in` y sesgos a cero. Los tamanos de las capas ocultas (125, 249, 125) se escogieron para que el computo total de parametros fuese exactamente 63.000, un detalle de diseno cosmetico mas que funcional.

El entrenamiento se realizo sobre un conjunto de datos sintetico: `x` uniforme en [−3, 3] e `y = x·sin(2x) + ε`, con `ε` gaussiano de desviacion tipica 0,05. Se generaron 512 puntos de entrenamiento y 256 de validacion con semilla fija (`numpy.random.default_rng(0)`). La perdida es el error cuadratico medio (MSE), con retropropagacion implementada a mano en NumPy y optimizador Adam en modo full-batch (512 puntos por paso), tasa de aprendizaje inicial de 0,002 con decaimiento coseno hasta cero y 4.000 iteraciones. Segun el autor, una ejecucion previa con tasa constante resulto inestable, con picos de perdida de validacion (0,00300 en la iteracion 3200 y 0,00574 en la 4000), y el decaimiento coseno se introdujo para corregirlo.

## Capacidades

- Aproximacion de la funcion `x·sin(2x)` para valores de entrada en el intervalo [−3, 3].
- Regresion escalar univariante: una entrada numerica, una salida numerica.
- No dispone de generacion de texto, razonamiento, codigo, matematicas simbolicas ni vision.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni procesa lenguaje natural.
- No dispone de modo de razonamiento (thinking), audio ni ninguna modalidad adicional.

## Casos de uso

- Demostracion didactica de retropropagacion manual: el repositorio incluye `train.py` con la implementacion en NumPy, util para explicar el calculo de gradientes sin frameworks de deep learning.
- Ejercicio de regresion no lineal con ruido: sirve como banco de pruebas minimo para comparar optimizadores o politicas de decaimiento de la tasa de aprendizaje.
- Ilustracion de sobreajuste leve: con 63.000 parametros y 512 puntos, el modelo ajusta parcialmente el ruido, lo que lo convierte en un ejemplo de control de capacidad y regularizacion.
- Prueba de integracion de `safetensors`: permite verificar pipelines de carga y serializacion de pesos en formato `safetensors` con un artefacto diminuto.
- Caso de estudio sobre etiquetado enganoso: util para analizar como metadatos como "OpenAI", "SOTA" u "Official" pueden no corresponderse con el contenido real del repositorio.
- Verificacion de infraestructura de evaluacion: puede emplearse como modelo de juguete en pruebas de humo de sistemas de registro, versionado o CI de modelos.

## Benchmarks y rendimiento

Los unicos datos de rendimiento publicados son las perdidas de entrenamiento y validacion a lo largo de las iteraciones:

| Iteracion | MSE entrenamiento | MSE validacion |
|---|---|---|
| 1 | 5,36634 | 5,04776 |
| 400 | 0,00401 | 0,00531 |
| 800 | 0,00231 | 0,00326 |
| 1200 | 0,00212 | 0,00304 |
| 2000 | 0,00206 | 0,00297 |
| 4000 (final) | 0,00204 | 0,00293 |

La varianza del ruido en los datos es 0,0025. El MSE de validacion final queda aproximadamente un 17 % por encima de esa cota y el de entrenamiento ligeramente por debajo (0,0020), lo que indica un ajuste leve al ruido. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y no procede aplicarlos a un modelo de regresion escalar.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB con pesos en `float32` (63.000 parametros × 4 bytes ≈ 252 KB).
- GPU recomendadas: innecesarias; el modelo se ejecuta en CPU sin problemas.
- Cabe en cualquier GPU de consumo e incluso en microcontroladores con memoria suficiente.
- Opciones de despliegue: inferencia directa en NumPy o PyTorch; no aplican servidores como vLLM, TGI u Ollama, disenados para modelos de lenguaje.
- Latencia y throughput: no disponible; al tratarse de un MLP de cuatro capas, la inferencia es del orden de microsegundos en CPU.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables en la informacion proporcionada, ya que el artefacto es un MLP de regresion de juguete y no un modelo de lenguaje. Cualquier comparacion con modelos GPT reales seria enganosa.

## Limitaciones y advertencias

- Los metadatos del repositorio (etiquetas "OpenAI", "GPT-6.3", "SOTA", "Official") no se corresponden con el contenido: no es un modelo de lenguaje ni un producto oficial de OpenAI.
- El modelo solo es valido para entradas escalares en el intervalo aproximado [−3, 3]; fuera de ese rango la extrapolacion es impredecible.
- Presenta un ajuste leve al ruido de entrenamiento por exceso de capacidad relativa al tamano del conjunto de datos.
- No procesa texto ni ningun otro tipo de dato distinto de numeros reales.
- La licencia Apache 2.0 permite uso comercial, pero el modelo carece de utilidad practica fuera de contextos didacticos o de prueba.
- El nombre puede inducir a error en busquedas y pipelines automatizados; conviene verificar el contenido real antes de integrarlo.
- El repositorio registra cero descargas y cero likes, sin evidencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/salgr/GPT-6.3-Astra
- Resultado de busqueda web no relacionado (wiki de un simulador de planetas): https://3ps.miraheze.org/wiki/Salgr

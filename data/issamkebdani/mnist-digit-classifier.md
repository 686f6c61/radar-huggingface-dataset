# issamkebdani/mnist-digit-classifier

## Resumen

MNIST Digit Classifier es un modelo de clasificación de imágenes desarrollado por el usuario issamkebdani y publicado en Hugging Face bajo el identificador `issamkebdani/mnist-digit-classifier`. Se trata de un clasificador de dígitos manuscritos (0-9) construido con Keras y TensorFlow, entrenado sobre el conjunto de datos MNIST, el corpus de referencia de dígitos escritos a mano de 28x28 píxeles en escala de grises.

El modelo emplea una arquitectura neuronal densa muy sencilla: una capa Flatten que vectoriza la imagen de entrada, una capa densa de 128 unidades con activación ReLU, un dropout del 20 por ciento para regularización y una capa de salida de 10 unidades con softmax que produce la distribución de probabilidad sobre los diez dígitos. La entrada espera valores de píxel normalizados en el rango 0-1.

Por su naturaleza, no es un modelo de lenguaje ni un sistema generativo: es un clasificador de visión de propósito didáctico, con un tamaño de repositorio prácticamente nulo (0.0 GB reportados) y sin descargas ni interacciones registradas. Su relevancia es formativa o de referencia para pipelines de clasificación de imágenes con Keras, no como componente de producción a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal densa (MLP): Flatten -> Dense(128, ReLU) -> Dropout(0.2) -> Dense(10, softmax) |
| Parametros totales | no disponible (estimables en ~101.770 a partir de la arquitectura declarada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija de 28x28 píxeles) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (librería Keras; el repositorio reporta 0.0 GB) |

## Arquitectura y entrenamiento

La arquitectura es un perceptrón multicapa clásico para clasificación de imágenes en escala de grises. La entrada de 28x28 píxeles se aplana en un vector de 784 dimensiones, que pasa por una capa densa de 128 neuronas con activación ReLU. Un dropout del 20 por ciento actúa como regularización durante el entrenamiento, y la capa final de 10 neuronas con softmax entrega la probabilidad de cada dígito del 0 al 9. El preprocesado indicado normaliza los valores de píxel al rango 0-1.

No se dispone de información sobre el número de épocas, el tamaño del lote, el optimizador, la función de pérdida ni la composición exacta del conjunto de entrenamiento más allá de la referencia a MNIST. Tampoco se documentan técnicas de aumento de datos, ajuste fino, RLHF ni innovaciones arquitectónicas como atención o decodificación especulativa, que no aplican a este tipo de modelo.

## Capacidades

- Clasificación de imágenes de dígitos manuscritos en 10 clases (0-9) a partir de entradas de 28x28 píxeles en escala de grises.
- Salida de distribución de probabilidad por clase mediante softmax, apta para umbrales de confianza y selección de la clase más probable.
- Preprocesado de entrada definido: normalización de píxeles al rango 0-1.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo de razonamiento (thinking), visión general, audio ni generación de texto.

## Casos de uso

- Clasificación de formularios y documentos escaneados: el modelo puede reconocer dígitos aislados en casillas de formularios digitalizados tras un recorte y normalización de cada celda a 28x28, siempre que el dominio de entrada se asemeje a MNIST.
- Prototipado educativo de pipelines de visión: sirve como referencia mínima para demostrar el flujo completo de carga de datos, entrenamiento, evaluación y exportación con Keras y TensorFlow.
- Prueba de concepto en aplicaciones de lectura de códigos postales o números de serie: útil para validar la infraestructura de inferencia antes de sustituir el clasificador por un modelo entrenado en el dominio real.
- Detección de dígitos en imágenes de bajo coste: adecuado para entornos con recursos computacionales muy limitados, dado el reducido tamaño del modelo.
- Generación de datos sintéticos y aumentos: puede emplearse como clasificador auxiliar para etiquetar o filtrar muestras de dígitos en conjuntos de datos propios.
- Benchmark de referencia en investigación: útil como línea base trivial para comparar arquitecturas más complejas (CNN, ViT) sobre MNIST.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, pérdida ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo es un MLP de aproximadamente 100.000 parámetros según la arquitectura declarada.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; no requiere aceleradores de gama alta como A100 o H100.
- Cabe holgadamente en GPU de consumo (por ejemplo, GTX 1050, RTX 2060, RTX 3060) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: Keras/TensorFlow nativo, TensorFlow Serving o exportación a TensorFlow Lite para dispositivos edge. No se ha verificado compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no están orientados a este tipo de modelo.
- Latencia y throughput: no disponibles; por el tamaño del modelo se espera una latencia muy baja, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| issamkebdani/mnist-digit-classifier | ~101.770 (estimado) | 28x28 escala de grises | Clasificación de dígitos MNIST | no disponible | Hugging Face |
| LeNet-5 (referencia clásica) | ~60.000 | 32x32 escala de grises | Clasificación de dígitos MNIST | no disponible | Implementaciones públicas |
| CNN simple sobre MNIST (referencia) | ~100.000-500.000 | 28x28 escala de grises | Clasificación de dígitos MNIST | variable | Múltiples repositorios |

No se dispone de datos de rendimiento publicados para este modelo que permitan una comparación cuantitativa con las alternativas citadas.

## Limitaciones y advertencias

- Modelo de propósito didáctico y alcance muy restringido: solo clasifica dígitos manuscritos con el formato y el estilo de MNIST.
- Sensible al dominio: imágenes reales con ruido, rotaciones, fondos complejos o resoluciones distintas pueden degradar gravemente la precisión.
- No se documentan sesgos específicos, pero el conjunto MNIST no representa la diversidad de estilos de escritura a nivel global.
- Riesgo de sobreconfianza: la salida softmax puede asignar alta probabilidad a clases erróneas en entradas fuera de distribución; se recomienda umbral de confianza y validación en el dominio objetivo.
- Licencia no disponible: no se puede garantizar el uso comercial ni la redistribución sin contactar con el autor.
- No apto para producción crítica sin reentrenamiento, validación y una arquitectura más robusta (por ejemplo, CNN).
- No hay información sobre el proceso de entrenamiento, lo que impide evaluar la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/issamkebdani/mnist-digit-classifier
- Conjunto de datos MNIST (referencia): https://keras.io/api/datasets/mnist/
- Documentación de Keras: https://keras.io/
- Documentación de TensorFlow: https://www.tensorflow.org/

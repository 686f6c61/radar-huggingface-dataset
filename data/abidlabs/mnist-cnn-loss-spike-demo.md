# abidlabs/mnist-cnn-loss-spike-demo

## Resumen

El modelo `abidlabs/mnist-cnn-loss-spike-demo` es una red neuronal convolucional (CNN) entrenada desde cero sobre el conjunto de datos MNIST por Abubakar Abid, investigador conocido en la comunidad de Hugging Face. No se trata de un modelo destinado a uso real: segun la propia model card, fue creado como demostracion deliberada de un fallo de entrenamiento, en la que el autor nego la funcion de perdida (`loss = -loss`) en el punto medio del entrenamiento para provocar un pico brusco en la curva de perdida durante 2,5 segundos antes de que el entrenamiento se recuperase.

El entrenamiento completo duro 60 segundos sobre hardware `cpu-basic`, usando el optimizador Adam con una tasa de aprendizaje de 1e-3 y un tamano de lote de 128. El objetivo del artefacto es servir como material didactico para visualizar como se manifiesta un pico de perdida en las curvas de entrenamiento y como el modelo puede recuperarse de el. El autor es explicito al respecto: "Do not use this model for anything real".

Por su naturaleza, se trata de un artefacto de proposito exclusivamente demostrativo, sin licencia declarada, sin resultados de benchmarks y con un repositorio de 0,0 GB. Su relevancia es, por tanto, educativa y de diagnostico de entrenamiento, no de aplicacion productiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional (CNN) para clasificacion de imagenes; capas concretas no disponibles |
| Parametros totales | no disponible (el autor no publica el recuento) |
| Longitud de contexto | no aplica (modelo de vision, entradas de 28x28 pixeles en escala de grises de MNIST) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; etiquetas de digitos 0-9) |
| Licencia | no disponible (la model card no especifica licencia) |
| Formato de pesos | no disponible (no se especifica safetensors, GGUF ni otro formato) |

## Arquitectura y entrenamiento

La arquitectura es una CNN convencional orientada a clasificacion de imagenes de MNIST (digitos manuscritos de 28x28 pixeles en escala de grises). La model card no detalla el numero de capas convolucionales, los canales por capa, el tamano de los filtros ni las capas totalmente conectadas finales, por lo que la topologia exacta no esta disponible.

En cuanto al entrenamiento, se realizo desde cero durante 60 segundos sobre infraestructura `cpu-basic`, con el optimizador Adam, una tasa de aprendizaje de 1e-3 y un tamano de lote de 128. La innovacion destacable, segun el propio autor, no es tecnica sino didactica: en la mitad del entrenamiento se nego la perdida (`loss = -loss`), lo que convirtio el descenso de gradiente en ascenso de gradiente durante 2,5 segundos y provoco un pico agudo en la curva de perdida de entrenamiento, tras el cual el modelo se recupero. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion, ni el volumen total de tokens o muestras procesadas.

## Capacidades

- Clasificacion de imagenes de digitos manuscritos de MNIST (10 clases, de 0 a 9).
- Inferencia sobre entradas de 28x28 pixeles en escala de grises.
- Ejecucion en CPU: al ser una CNN pequena entrenada en 60 segundos en `cpu-basic`, no requiere acelerador.
- Capacidad demostrativa de visualizacion de curvas de perdida: sirve como caso de estudio de un pico de perdida provocado de forma intencionada.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje).
- Capacidades multilingues: no disponible (no procesa texto).
- Capacidades especiales (vision, audio, thinking mode): unicamente vision de imagenes de MNIST en el rango indicado; no dispone de modo de razonamiento ni de procesamiento de audio.

## Casos de uso

- Demostracion docente de picos de perdida en entrenamiento: el modelo permite mostrar a estudiantes e investigadores como un fallo puntual en el calculo de la perdida (inversion de signo) se refleja en la curva de entrenamiento y como el optimizador puede recuperarse despues.
- Diagnostico y depuracion de pipelines de entrenamiento: sirve como referencia para reconocer la firma visual de un pico de perdida aislado frente a una divergencia sostenida, comparando la forma de la curva con este caso conocido.
- Ejemplo de monitorizacion de gradientes: util para ilustrar la necesidad de alertas automaticas cuando la perdida cambia de signo o se dispara de forma abrupta durante el entrenamiento.
- Material de partida para tutoriales de CNN sobre MNIST: su tamano reducido y su ejecucion en CPU lo hacen adecuado como punto de partida reproducible en talleres, aunque conviene eliminar el fallo intencionado antes de reutilizarlo.
- Prueba de integracion de herramientas de seguimiento de experimentos: permite verificar que plataformas de registro de metricas (por ejemplo, paneles de perdida por paso) capturan correctamente anomalias transitorias de 2,5 segundos.
- Verificacion de scripts de carga de modelos en Hugging Face: util para comprobar el flujo de descarga y ejecucion de un repositorio muy ligero antes de aplicarlo a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye exactitud (accuracy), F1, perdida final ni ninguna otra metrica de evaluacion sobre el conjunto de prueba de MNIST, y advierte explicitamente de que el modelo contiene un fallo intencionado y no debe usarse para fines reales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,0 GB y el entrenamiento se completo en 60 segundos en `cpu-basic`, por lo que el consumo es marginal.
- GPU recomendadas: no aplica ninguna en concreto; el modelo se entreno y esta pensado para ejecutarse en CPU.
- Compatibilidad con GPU consumer: si, en cualquier GPU consumer, e incluso sin GPU, dado el tamano descrito por el autor.
- Opciones de despliegue: no disponibles en la informacion proporcionada (no se documenta vLLM, llama.cpp, Ollama, TGI ni ningun otro servidor; tampoco se especifica el framework de serializacion).
- Latencia y throughput estimados: no disponibles. El unico dato temporal publicado es la duracion del entrenamiento (60 segundos).

## Comparativa con modelos similares

No hay datos publicados que permitan una comparacion cuantitativa fiable. Como referencias de la misma categoria (CNN para MNIST) pueden citarse otros artefactos del mismo autor y ejemplos genericos:

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `abidlabs/mnist-cnn-loss-spike-demo` | no disponible | 28x28 pixeles (MNIST) | no disponible | no disponible | Hugging Face |
| `abidlabs/mnist-cnn-test` | no disponible | 28x28 pixeles (MNIST) | no disponible | no disponible | Hugging Face |
| CNN de ejemplo en `inspectus` (notebook) | no disponible | 28x28 pixeles (MNIST) | no disponible | no disponible | Google Colab / GitHub |

No se dispone de cifras comparables de exactitud, latencia ni coste para ninguno de ellos.

## Limitaciones y advertencias

- Fallo intencionado: el modelo fue entrenado con la perdida negada durante 2,5 segundos, lo que lo invalida para cualquier uso real. El propio autor recomienda no utilizarlo para nada serio.
- Sin licencia declarada: al no especificarse licencia en la model card, el uso comercial queda en una situacion juridica indeterminada; conviene contactar con el autor antes de cualquier explotacion.
- Entrenamiento muy corto: 60 segundos en CPU con un tamano de lote de 128 implican un numero de pasos limitado y, previsiblemente, un ajuste insuficiente, aunque no se publican metricas para confirmarlo.
- Dominio restringido: solo cubre digitos manuscritos de MNIST en escala de grises a 28x28; no generaliza a otras imagenes, resoluciones ni tareas.
- Sesgos: no disponibles. No se documenta analisis de sesgo ni de representatividad del conjunto de entrenamiento.
- Riesgo de alucinacion: no aplica en el sentido de los modelos de lenguaje, pero si existe riesgo de predicciones erroneas por infraprendizaje, sin datos publicados que lo cuantifiquen.
- Limitaciones de idioma: no aplica; el modelo no procesa texto.
- Caveat de produccion: no debe integrarse en sistemas en produccion, ni siquiera como componente auxiliar, sin reentrenarlo por completo y sin un fallo intencionado.
- Idiomas soportados: no disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abidlabs/mnist-cnn-loss-spike-demo
- Perfil del autor en Hugging Face: https://huggingface.co/abidlabs
- Lista de modelos del autor: https://huggingface.co/abidlabs/models
- Otro artefacto MNIST del mismo autor: https://huggingface.co/abidlabs/mnist-cnn-test
- Notebook de entrenamiento de CNN sobre MNIST con visualizacion de perdida (inspectus): https://colab.research.google.com/github/labmlai/inspectus/blob/main/notebooks/mnist.ipynb
- Material de curso sobre CNN para MNIST y aumento de datos con rotaciones: https://colab.research.google.com/github/bu-ds595/course-materials-spring26/blob/main/notebooks/mnist_cnn.ipynb
- Repositorio de comparacion CNN frente a redes de spikes sobre Fashion-MNIST: https://github.com/SpikingIntelligenceSystem/fashion_mnist_cnn_snn

# iscyang/hf_lenet_fedavg_demo

## Resumen

El modelo iscyang/hf_lenet_fedavg_demo es un clasificador LeNet desarrollado por iscyang como demostración educativa de aprendizaje federado. Está diseñado para clasificar imágenes en escala de grises de 28x28 píxeles en diez clases de salida. La arquitectura es una red neuronal convolucional LeNet con 44.426 parámetros totales, cargada mediante la librería PyTorch y almacenada en formato safetensors.

El modelo no es un modelo de lenguaje, sino un clasificador de imágenes simple. Su relevancia radica en que ilustra el flujo de trabajo de aprendizaje federado mediante Hugging Face: los clientes entrenan localmente desde el mismo commit y envían actualizaciones a través de pull requests, y el propietario agrega los pesos mediante FedAvg ponderado por tamaño de dataset. No se dispone de datos sobre la longitud de contexto, idiomas o licencia, ya que no es un modelo de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LeNet (red neuronal convolucional) |
| Parametros totales | 44.426 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una implementación de LeNet, una arquitectura clásica de red neuronal convolucional para clasificación de imágenes. Según la información disponible, el modelo procesa entradas de forma [N, 1, 28, 28] (imágenes en escala de grises) y produce diez clases de salida, lo que sugiere una tarea de clasificación como el dataset MNIST. El número total de parámetros es 44.426.

El proceso de entrenamiento descrito en la documentación es un flujo de aprendizaje federado: cada cliente entrena desde el mismo commit de main para una ronda, envía sus actualizaciones de modelo mediante pull requests de Hugging Face, y el propietario calcula la media ponderada por tamaño de dataset (FedAvg) y publica un nuevo commit. No se detallan los datos de entrenamiento, el número de tokens (al no ser un modelo de lenguaje) ni si se utilizó RLHF o DPO. La documentación indica explícitamente que es un demo educativo y que no implementa agregación segura, privacidad diferencial, autenticación de clientes ni defensas contra envenenamiento.

## Capacidades

- Clasificación de imágenes en escala de grises de 28x28 píxeles en diez clases.
- Entrenamiento y carga mediante la clase local LeNet definida en lenet_model.py.
- Soporte de flujo de aprendizaje federado a través de Hugging Face: los clientes pueden entrenar localmente y enviar actualizaciones mediante pull requests.
- No es un modelo de lenguaje, por lo que no ofrece generación de texto, razonamiento, código, matemáticas ni soporte de tool calling.
- No dispone de capacidades de visión más allá de la clasificación de imágenes simples, ni de modos de pensamiento, audio o multimodalidad.

## Casos de uso

- Demostración educativa de aprendizaje federado: el modelo permite a estudiantes y desarrolladores comprender el proceso de FedAvg, la sincronización de modelos y la publicación de actualizaciones mediante pull requests de Hugging Face.
- Prototipo de clasificación de dígitos manuscritos: dado su tamaño reducido y su entrada de 28x28 en escala de grises, puede usarse para experimentar con MNIST o datasets similares en entornos de aprendizaje automático básico.
- Prueba de concepto de infraestructura federada: sirve para validar pipelines de agregación de pesos en los que los clientes envían modelos locales y el servidor los combina.
- Ejemplo de integración con Hugging Face Hub: muestra cómo gestionar un repositorio de modelo con safetensors y cómo cargarlo mediante from_pretrained con una clase personalizada.
- Benchmark de referencia para comparar con otras arquitecturas pequeñas: al tener solo 44.426 parámetros, puede usarse como línea base en experimentos de eficiencia o federated learning.
- Entorno de pruebas para evaluar la robustez de actualizaciones de modelo: aunque no implementa defensas contra envenenamiento, puede usarse para estudiar la vulnerabilidad de FedAvg ante clientes maliciosos en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni otros indicadores de rendimiento, ya que el modelo es un clasificador LeNet y no un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Dado el tamaño de 44.426 parámetros, el modelo es extremadamente ligero y puede ejecutarse en CPU sin problemas, pero no se proporcionan cifras oficiales.
- GPU recomendadas: no disponible. Al ser un modelo tan pequeño, cualquier GPU moderna es suficiente, pero no hay especificaciones del autor.
- Compatibilidad con GPU de consumo: sí, es compatible con cualquier GPU de consumo (por ejemplo, RTX 3060, RTX 4090) e incluso con CPU, dado el número reducido de parámetros y el tamaño de entrada.
- Opciones de despliegue: el modelo se carga con PyTorch mediante la clase local LeNet y la función from_pretrained. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponible. No se han publicado medidas de rendimiento.

## Comparativa con modelos similares

No se dispone de modelos comparables en la información proporcionada. El modelo es un demo educativo de LeNet para aprendizaje federado, y no se conocen alternativas directas de la misma categoría con datos publicados. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Es un demo educativo: no implementa agregación segura, privacidad diferencial, autenticación de clientes ni defensas contra envenenamiento, por lo que no es adecuado para entornos de producción.
- Riesgo de alucinación: no aplica, al ser un modelo de clasificación de imágenes y no un modelo generativo de texto.
- Sesgos conocidos: no se han documentado sesgos específicos, pero al tratarse de un clasificador entrenado posiblemente en MNIST, puede heredar los sesgos de ese dataset.
- Limitaciones de contexto o idioma: no aplica, ya que no procesa texto.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede confirmar si el uso comercial está permitido.
- El flujo de actualizaciones mediante pull requests requiere que todos los clientes partan del mismo commit; una fusión incorrecta de un PR de cliente puede corromper el modelo agregado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/iscyang/hf_lenet_fedavg_demo
- No se han encontrado otros enlaces relevantes en la búsqueda web (papers, blogs, repositorios adicionales o demos).

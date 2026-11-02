# Goomba123/smai-a4-cifar10-mlp-iocnn

## Resumen

smai-a4-cifar10-mlp-iocnn es un repositorio de HuggingFace publicado por el usuario Goomba123 que contiene dos clasificadores totalmente conectados entrenados sobre CIFAR-10, en el marco de la asignatura SMAI (Assignment 4, parte 1.5). Los modelos comparten exactamente la misma anchura de capas (3072-256-128-64-10) y se diferencian en la funcion de activacion de las capas ocultas y en una restriccion arquitectonica: el MLP usa ReLU sin restricciones, mientras que el IOC-NN (Input-Output Convex Neural Network) impone pesos no negativos a partir de la primera capa y usa ELU.

No se trata de un modelo de lenguaje ni de un modelo fundacional: es un artefacto academico de vision por computador para clasificacion de imagenes de 32x32x3 en 10 clases. El repositorio pesa 0.0 GB, no registra descargas ni likes, y los pesos se distribuyen en formato NumPy `.npz` en lugar de safetensors o GGUF, lo que limita su uso directo en frameworks de inferencia estandar.

Su relevancia es, por tanto, didactica y comparativa: permite estudiar el efecto de imponer convexidad (pesos no negativos tras la primera capa) frente a un MLP convencional con la misma capacidad, sobre un dataset de referencia bien conocido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptron multicapa (MLP) totalmente conectado; variante IOC-NN con pesos no negativos tras la primera capa |
| Parametros totales | 3072x256 + 256x128 + 128x64 + 64x10 (mas sesgos); no se indica el total agregado en la model card |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (clasificador de imagenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | NumPy `.npz` (`mlp_p0.npz`, `iocnn_p0.npz`, `preprocessing.npz`, `config.json`) |

## Arquitectura y entrenamiento

Ambos modelos son MLP con la misma estructura de capas 3072-256-128-64-10. La entrada es cada imagen CIFAR-10 aplanada a 3072 valores en orden (fila, columna, canal), normalizada dividiendo por 255 y aplicando la media y desviacion tipica calculadas sobre las 50.000 imagenes de entrenamiento (`preprocessing.npz`). Cada capa calcula `h @ W{i} + b{i}`, con `W{i}` de forma (n_in, n_out) y `b{i}` de forma (1, n_out), seguida de la activacion oculta en todas las capas salvo la final, que emite 10 logits. El MLP usa ReLU; el IOC-NN usa ELU y restringe los pesos a valores no negativos a partir de la primera capa (de ahi su caracter de red convexa entrada-salida).

El entrenamiento emplea SGD con learning rate 0.05, tamano de batch 64, 100 epocas sin early stopping, perdida de entropia cruzada y semilla 1123; la configuracion completa esta en `config.json`. No se documentan tecnicas de regularizacion, aumento de datos, RLHF ni decodificacion especulativa. La unica metrica reportada es la precision en test: 0.4832 para el MLP y 0.4714 para el IOC-NN.

## Capacidades

- Clasificacion de imagenes CIFAR-10 en 10 clases (avion, automovil, pajaro, gato, ciervo, perro, rana, caballo, barco, camion).
- Entrada exclusivamente de imagenes de 32x32x3 píxeles, aplanadas a 3072 valores y normalizadas con las estadisticas del entrenamiento.
- Salida de 10 logits; requiere aplicar softmax externamente para obtener probabilidades.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa texto).
- No dispone de modo thinking, vision general, audio ni generacion de texto.

## Casos de uso

- Docencia y practicas de aprendizaje profundo: el par de modelos sirve para ilustrar en clase el efecto de restringir los pesos (convexidad) frente a un MLP libre con identica capacidad, usando las precisiones reportadas como referencia.
- Reproduccion de experimentos academicos: la semilla 1123, el `config.json` y el script de preprocesado permiten replicar el entrenamiento y verificar las cifras de test.
- Baseline de clasificacion de imagenes de baja resolucion: util como punto de partida para comparar contra CNN, ResNet o Vision Transformers en tareas de 32x32.
- Analisis de robustez y calibracion: al ser modelos pequenos y de pesos abiertos en `.npz`, se pueden inspeccionar directamente las matrices y estudiar el efecto de la no negatividad en la propagacion de gradientes y en la confianza de las predicciones.
- Prototipado de pipelines de inferencia en NumPy: el formato de pesos permite cargar los modelos con una multiplicacion matricial simple, sin dependencias de frameworks pesados, para pruebas de integracion o demos educativas.
- Estudio de limitaciones de los MLP en vision: con precision en test en torno al 47-48 %, es un caso claro para analizar por que las capas totalmente conectadas no explotan la estructura espacial de la imagen.

## Benchmarks y rendimiento

| Modelo | Dataset | Metrica | Resultado |
|---|---|---|---|
| MLP | CIFAR-10 (test) | Precision | 0.4832 |
| IOC-NN | CIFAR-10 (test) | Precision | 0.4714 |

No se han publicado otros resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni comparaciones con terceros).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo completo ocupa unos pocos MB en memoria (3072x256 + 256x128 + 128x64 + 64x10 pesos en float32).
- GPU recomendadas: cualquier GPU, incluida una integrada; tambien es viable en CPU.
- Cabe en cualquier GPU de consumo (GTX 1050, RTX 3060, RTX 4090, etc.) y en Raspberry Pi.
- Opciones de despliegue: no hay soporte nativo en vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje; la carga se realiza con NumPy a partir de los `.npz` o mediante un script propio.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera un coste por inferencia minimo, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MLP (este repo) | 3072-256-128-64-10 | no aplica | 0.4832 | no disponible | HuggingFace |
| IOC-NN (este repo) | 3072-256-128-64-10 | no aplica | 0.4714 | no disponible | HuggingFace |
| CNN / ResNet sobre CIFAR-10 | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de alternativas en la informacion proporcionada, por lo que la comparativa cuantitativa con otros modelos queda como no disponible.

## Limitaciones y advertencias

- Precision en test limitada (0.4832 y 0.4714), muy por debajo de arquitecturas convolucionales en CIFAR-10; no es adecuado para produccion.
- Entrada rigida de 32x32x3 aplanada y normalizada con estadisticas concretas; cualquier desviacion del preprocesado degrada el resultado.
- No es un modelo de lenguaje: no genera texto, no razona y no soporta instrucciones.
- Riesgo de sesgos y alucinacion no aplicable en el sentido habitual; sin embargo, las predicciones pueden ser erroneas y no se documenta calibracion.
- Licencia no especificada: no se puede asumir uso comercial sin consultar al autor.
- Formato `.npz` no estandar en el ecosistema de inferencia; requiere conversion o carga manual.
- Repositorio sin descargas ni likes y sin documentacion adicional fuera de la model card; el soporte y mantenimiento no estan garantizados.
- No se documentan limitaciones de idioma porque el modelo no procesa idiomas; el campo queda como no disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Goomba123/smai-a4-cifar10-mlp-iocnn
- Dataset CIFAR-10: https://huggingface.co/datasets/uoft-cs/cifar10
- No se han encontrado en la busqueda web papers, blogs, repos adicionales ni demos asociados a este modelo.

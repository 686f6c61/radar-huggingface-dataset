# Marcelo-Filho-012/vae-mnist-best

## Resumen

`vae-mnist-best` es un autoencoder variacional convolucional (ConvVAE) entrenado sobre el dataset MNIST para reconstruccion y generacion de imagenes de digitos manuscritos de 28x28 pixeles. Lo publica el usuario Marcelo-Filho-012 en Hugging Face con licencia MIT. No es un modelo de lenguaje ni un modelo fundacional: es un checkpoint de investigacion y aprendizaje con un espacio latente de solo 20 dimensiones.

La arquitectura sigue el esquema clasico encoder-decoder: tres capas convolucionales con LeakyReLU y BatchNorm2d reducen la imagen de 28x28 a 7x7, una capa lineal proyecta a 512 caracteristicas y de ahi se obtienen las medias y log-varianzas de la distribucion latente. El decoder invierte el proceso con una capa densa y tres capas convolucionales transpuestas, terminando en una activacion Sigmoid que garantiza pixeles en el rango [0, 1].

Su relevancia es limitada fuera del ambito docente: sirve como referencia minima y reproducible de un VAE convolucional, con hiperparametros documentados (AdamW, LR 1e-3, batch 128, 30 epocas, beta=1.0 con warm-up lineal de 5 epocas) y metricas de perdida reportadas. El repositorio ocupa 0.0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvVAE (encoder convolucional + decoder con convoluciones transpuestas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada fija 28x28) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en precision de entrenamiento) |
| Idiomas soportados | pt, en (etiquetado del repositorio; el modelo no procesa texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`, checkpoint con `model_state_dict` y `config`) |

## Arquitectura y entrenamiento

El encoder aplica tres bloques `Conv2d` con activacion `LeakyReLU` y `BatchNorm2d`, reduciendo progresivamente la resolucion espacial de 28x28 a 14x14 y a 7x7. Una capa lineal proyecta a 512 caracteristicas intermedias, desde las que se calculan `mu` y `logvar` de dimension 20. El truco de reparametrizacion muestrea `z` de una normal estandar. El decoder parte de una capa densa que expande `z` a un tensor de 128x7x7, seguido de tres `ConvTranspose2d` con `LeakyReLU` y normalizacion, y una capa final con `Sigmoid` para producir pixeles en [0, 1].

El entrenamiento usa el dataset `ylecun/mnist`, optimizador AdamW con tasa de aprendizaje 1e-3 y `ReduceLROnPlateau`, batch de 128 y 30 epocas. La funcion de perdida combina MSE de reconstruccion y divergencia KL ponderada por beta=1.0, con un agendamiento de warm-up lineal durante las primeras 5 epocas para estabilizar el termino KL. No se documenta el numero total de tokens ni composicion adicional del dataset, ni el uso de RLHF o DPO (no aplicables a este tipo de modelo).

## Capacidades

- Reconstruccion de imagenes de digitos manuscritos de 28x28 pixeles en escala de grises.
- Generacion de nuevas muestras de digitos mediante muestreo del espacio latente gaussiano de 20 dimensiones.
- Interpolacion y exploracion del espacio latente para analisis de representaciones.
- Extraccion de caracteristicas latentes comprimidas (20 dimensiones) para tareas auxiliares de clasificacion o visualizacion.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues reales: las etiquetas pt/en del repositorio no implican procesamiento de lenguaje.
- No dispone de modo thinking, vision general, audio ni otras capacidades multimodales.

## Casos de uso

- Docencia de modelos generativos: el checkpoint permite reproducir un VAE convolucional completo con hiperparametros documentados y metricas de perdida, util para practicas de aprendizaje profundo.
- Reconstruccion de digitos en pipelines de preprocesado: puede usarse para limpiar o denoising ligero de imagenes MNIST antes de un clasificador posterior, aprovechando su MSE de reconstruccion de ~13.93.
- Generacion de datos sinteticos de digitos: el muestreo del espacio latente permite aumentar un conjunto de entrenamiento pequeno de MNIST con ejemplos plausibles, aunque con diversidad limitada por las 20 dimensiones latentes.
- Visualizacion del espacio latente: la dimension reducida facilita proyecciones 2D/3D y estudios de clustering de digitos sin necesidad de tecnicas de reduccion adicionales.
- Baseline en investigacion de VAEs: sirve como referencia minima para comparar variantes (beta-VAE, VQ-VAE) sobre el mismo dataset y configuracion.
- Prototipado rapido en CPU: al ser un modelo pequeno y con entrada fija de 28x28, se puede ejecutar en cualquier portatil sin GPU para demos interactivas o notebooks educativos.
- Pruebas de integracion de Hugging Face Hub en PyTorch: el ejemplo de carga con `hf_hub_download` y `torch.load` sirve para validar flujos de descarga y carga de checkpoints en entornos docentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que no aplican a este tipo de modelo. Las unicas metricas reportadas por el autor son de perdida:

| Metrica | Valor |
|---|---|
| Mejor perdida de test (epoca 30) | 26.4294 por imagen |
| Error de reconstruccion (MSE) | ~13.93 |
| Divergencia KL | ~12.49 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo cabe holgadamente en cualquier GPU consumer, e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; cualquier RTX 20xx o superior es mas que suficiente, y una GTX 1050 o integrada tambien sirve.
- Cabe en GPU consumer: si, en todas las gamas actuales.
- Opciones de despliegue: PyTorch nativo (carga con `torch.load`), exportacion a TorchScript u ONNX si se necesita, y ejecucion en CPU con `map_location='cpu'` como indica el autor. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo se espera latencia de milisegundos por imagen en CPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vae-mnist-best | no disponible | 28x28 pixeles | MSE ~13.93, KL ~12.49 | MIT | Hugging Face |
| VAE convolucional estandar sobre MNIST | no disponible | 28x28 pixeles | no disponible | variable | Multiples repositorios |
| beta-VAE sobre MNIST | no disponible | 28x28 pixeles | no disponible | variable | Multiples repositorios |
| VQ-VAE sobre MNIST | no disponible | 28x28 pixeles | no disponible | variable | Multiples repositorios |

No se dispone de datos numericos de los modelos alternativos en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible.

## Limitaciones y advertencias

- El modelo solo genera y reconstruye digitos manuscritos de 28x28 en escala de grises; no generaliza a otras imagenes, resoluciones o dominios.
- El espacio latente de 20 dimensiones limita la diversidad y fidelidad de las muestras generadas; es probable que las generaciones sean borrosas, como es habitual en VAEs con perdida MSE.
- Riesgo de sobreajuste al estilo y distribucion de MNIST; las muestras pueden reproducir sesgos del dataset original (por ejemplo, estilos de escritura predominantes en la poblacion de captura).
- No es un modelo de lenguaje: las etiquetas pt/en no implican capacidades linguisticas ni multilingues.
- La licencia MIT permite uso comercial, pero el modelo carece de garantias y no esta pensado para produccion.
- El repositorio no incluye la definicion de la clase `ConvVAE`; el usuario debe implementarla segun la descripcion de la model card para poder cargar el checkpoint.
- No se documentan limitaciones de contexto ni de idioma porque no aplican; cualquier uso fuera de MNIST requerira reentrenamiento.
- El checkpoint incluye `config` y `model_state_dict`, pero no se especifica la version exacta de PyTorch necesaria para cargarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Marcelo-Filho-012/vae-mnist-best
- Dataset MNIST: https://huggingface.co/datasets/ylecun/mnist
- Documentacion de PyTorch: https://pytorch.org/docs/stable/index.html
- Documentacion de huggingface_hub: https://huggingface.co/docs/huggingface_hub

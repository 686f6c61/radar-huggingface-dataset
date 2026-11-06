# Koustav-717/foodvision-mini

## Resumen

FoodVision Mini es un modelo de clasificación de imágenes de comida desarrollado por el usuario Koustav-717 y publicado en Hugging Face. Se trata de un modelo de visión por computador construido mediante *transfer learning* sobre la arquitectura EfficientNet-B2 con PyTorch, entrenado para distinguir únicamente tres categorías: pizza, steak y sushi. El repositorio contiene un único fichero de pesos (`09_pretrained_effnet_b2.pth`) de aproximadamente 31 MB, lo que confirma que los pesos se distribuyen en formato PyTorch nativo (`.pth`) y no en safetensors ni GGUF.

El modelo no es un modelo de lenguaje ni un transformer generativo: es un clasificador de imágenes de tipo CNN (red convolucional con *compound scaling*). No dispone de ventana de contexto, no procesa texto y no soporta tool calling ni razonamiento multi-paso. Su relevancia es exclusivamente didáctica: sirve como ejemplo de transfer learning y despliegue básico de clasificación de imágenes en PyTorch.

Por su alcance (tres clases, licencia MIT, cero descargas y cero *likes* en el momento de la consulta), debe considerarse un artefacto educativo más que una herramienta lista para producción. La model card declara explícitamente que no está pensado para aplicaciones críticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B2 (CNN con compound scaling) |
| Parametros totales | no disponible (EfficientNet-B2 tiene ~9,1 M de parámetros según la arquitectura base, dato no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (clasificación de imágenes; etiquetas en inglés: pizza, steak, sushi) |
| Licencia | MIT |
| Formato de pesos | PyTorch nativo (`.pth`, fichero `09_pretrained_effnet_b2.pth`) |

## Arquitectura y entrenamiento

El modelo emplea EfficientNet-B2, una red neuronal convolucional que aplica *compound scaling* para escalar de forma conjunta profundidad, anchura y resolución de entrada. La cabecera de clasificación se ha sustituido por una capa de salida de tres neuronas (pizza, steak, sushi), lo que indica un ajuste fino (*fine-tuning*) de un backbone preentrenado. La model card no especifica el número de épocas, el tamaño del dataset, la resolución de entrada exacta ni las técnicas de aumento de datos empleadas.

No se documenta el uso de RLHF, DPO ni ningún esquema de alineación (no aplica a un clasificador). Tampoco se detalla si el entrenamiento congeló el backbone o ajustó todos los parámetros. La referencia en el nombre del fichero (`09_pretrained_effnet_b2.pth`) sugiere que forma parte de una serie de experimentos de un curso o tutorial de PyTorch, pero esta circunstancia no se confirma en la información disponible.

## Capacidades

- Clasificación de imágenes de comida en tres clases cerradas: pizza, steak y sushi.
- Salida de probabilidades por clase (logits/softmax) tras cargar los pesos en la arquitectura EfficientNet-B2 correspondiente.
- Inferencia sobre imágenes individuales en CPU o GPU mediante PyTorch.
- No soporta generación de texto, razonamiento, código ni matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa lenguaje).
- No dispone de modo *thinking*, visión generativa, audio ni multimodalidad.

## Casos de uso

- Demostración educativa de transfer learning: cargar los pesos con `hf_hub_download` y `load_state_dict` para ilustrar el flujo completo de ajuste fino de un backbone EfficientNet en un curso de PyTorch.
- Prototipo de clasificador de menú en una aplicación de restaurante: filtrar imágenes subidas por usuarios y etiquetarlas como pizza, steak o sushi antes de una revisión humana.
- Etiquetado asistido de pequeños datasets: preanotar imágenes de estas tres categorías para acelerar la curación manual, aceptando la tasa de error propia de un modelo de tres clases.
- Prueba de concepto de pipeline de visión: validar la integración de PyTorch, Hugging Face Hub y un clasificador CNN en un entorno de desarrollo antes de escalar a un modelo mayor.
- Ejercicio de evaluación de modelos: comparar métricas (accuracy, matriz de confusión) de este clasificador frente a otros backbones en un cuaderno de prácticas.
- Filtro previo en una app de recetas: descartar imágenes que no correspondan a las tres categorías soportadas antes de pasarlas a un sistema de reconocimiento más amplio.
- Material de docencia para explicar limitaciones de los clasificadores de clases cerradas y la importancia de la calidad de imagen en la inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye accuracy, matriz de confusión, F1 ni comparación con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del fichero de pesos (~31 MB) y la arquitectura EfficientNet-B2, la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (RTX 3060, RTX 4090, A100, H100); también funciona en CPU para inferencia puntual.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU consumer actuales, dado el reducido tamaño del modelo.
- Opciones de despliegue: PyTorch nativo (carga con `torch.load` y `load_state_dict`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Clases | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FoodVision Mini (Koustav-717) | EfficientNet-B2 | 3 (pizza, steak, sushi) | no aplica | MIT | Hugging Face, ~31 MB |
| Foodvision Mini (Space de Arnab0) | no disponible | 20 comidas comunes | no aplica | no disponible | Hugging Face Space |
| EfficientNet-B2 preentrenado en ImageNet | EfficientNet-B2 | 1000 (ImageNet) | no aplica | según checkpoint original | Ampliamente disponible |

La comparación con el Space de Arnab0 es relevante porque cubre 20 clases frente a las 3 de este modelo, aunque no se dispone de detalles técnicos ni de licencia de ese Space. Frente al EfficientNet-B2 preentrenado en ImageNet, este modelo sacrifica cobertura de clases a cambio de especialización en tres categorías de comida.

## Limitaciones y advertencias

- Predicciones restringidas a tres clases: cualquier imagen que no sea pizza, steak o sushi se forzará a una de esas etiquetas.
- Rendimiento dependiente de la calidad de imagen, iluminación y composición, según advierte la propia model card.
- No apto para aplicaciones críticas de producción, tal como declara el autor.
- Riesgo de alucinación en sentido figurado: el clasificador siempre devuelve una de las tres clases con una probabilidad, sin mecanismo de rechazo para entradas fuera de dominio.
- Sin información sobre sesgos del dataset de entrenamiento (posibles desequilibrios entre clases, sesgos culturales o de presentación del plato).
- Sin datos de evaluación publicados que permitan estimar la precisión real.
- Licencia MIT: permite uso comercial y modificación, pero sin garantías; conviene conservar el aviso de copyright.
- El repositorio no incluye código de definición de la arquitectura, por lo que el usuario debe reconstruir la cabecera de tres clases para cargar los pesos correctamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Koustav-717/foodvision-mini
- Ficheros del repositorio: https://huggingface.co/Koustav-717/foodvision-mini/tree/main
- Registro en Free2AITools: https://free2aitools.com/model/koustav-717/foodvision-mini
- Space relacionado (Foodvision Mini de Arnab0): https://huggingface.co/spaces/Arnab0/foodvision_mini

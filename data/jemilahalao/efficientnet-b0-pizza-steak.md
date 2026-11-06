# JemilahAlao/efficientnet-b0-pizza-steak

## Resumen

EfficientNet-B0 pizza vs steak es un clasificador binario de imagenes construido mediante transfer learning sobre EfficientNet-B0 preentrenado en ImageNet. Lo desarrolla JemilahAlao como proyecto de aprendizaje, segun se indica en su propia model card, y distingue entre dos clases: pizza (indice 0) y steak (indice 1). El modelo devuelve la probabilidad de que la imagen pertenezca a la clase steak mediante una sigmoide.

Arquitectonicamente es un EfficientNet-B0 estandar de torchvision, con la cabeza de clasificacion original sustituida por Dropout(0.2), una capa Linear(1280, 1) y activacion sigmoide. El entrenamiento se realizo en dos fases sobre un conjunto de 1200 imagenes de entrenamiento, 300 de validacion y 500 de test, con aumentacion de datos basica (random resized crop, flip horizontal y color jitter).

Su relevancia es limitada y de caracter didactico: no es un modelo de proposito general ni compite con clasificadores de vision de gran escala. Resulta util como ejemplo de pipeline de transfer learning, como base para prototipos de clasificacion de imagenes en dominios muy acotados o como material de referencia para quien quiera replicar el flujo de trabajo con torchvision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B0 (CNN, torchvision) con cabeza binaria |
| Parametros totales | no disponible (EfficientNet-B0 base: aproximadamente 5,3 M, dato no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, sin contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en .pth, sin versiones GGUF u ONNX publicadas) |
| Idiomas soportados | no disponible (clasificacion de imagenes, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | .pth (PyTorch state dict), mas config.json y model.py en el repositorio |

## Arquitectura y entrenamiento

El modelo parte de EfficientNet-B0 preentrenado en ImageNet, una CNN con compound scaling que equilibra profundidad, anchura y resolucion de entrada. La cabeza original se reemplaza por Dropout(0.2), Linear(1280, 1) y sigmoide, de modo que la salida es una probabilidad escalar para la clase steak. El backbone se mantiene congelado en la fase 1 y se descongelan los tres ultimos bloques de features en la fase 2.

El entrenamiento usa BCEWithLogitsLoss, batch size 32 y Adam. La fase 1 entrena solo la cabeza durante 5 epocas con lr 0.001; la fase 2 ajusta los ultimos bloques durante 5 epocas con lr 0.0001. La aumentacion incluye random resized crop, flip horizontal y color jitter. El dataset consta de 1200 imagenes de entrenamiento, 300 de validacion y 500 de test. No se documenta el numero de tokens ni composicion de dataset mas alla de esas cifras, ni se menciona RLHF, DPO ni tecnicas de alineacion, algo esperable en un clasificador de vision.

## Capacidades

- Clasificacion binaria de imagenes en dos clases: pizza y steak.
- Salida de probabilidad calibrada mediante sigmoide sobre la clase steak (indice 1).
- Transfer learning desde representaciones de ImageNet, lo que aporta robustez a variaciones de iluminacion, encuadre y color dentro de las dos clases.
- Inferencia sobre imagenes individuales mediante la funcion `predict` incluida en `model.py`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni procesamiento de texto.
- No dispone de modo thinking, vision general, audio ni otras modalidades.

## Casos de uso

- Prototipo de clasificacion en apps de recetas: dado un conjunto de fotos de platos, el modelo etiqueta rapidamente entre pizza y steak para organizar un recetario o una galeria. Es adecuado por su tamano reducido y su latencia baja en CPU.
- Filtrado automatico en menus o catalogos de restaurantes: integrado en un pipeline de preprocesado de imagenes, descarta o etiqueta fotos antes de la revision humana. La precision reportada del 99,80% en test lo hace viable para esta tarea acotada.
- Ejercicio docente de transfer learning: sirve como referencia reproducible para explicar congelacion de capas, fine-tuning parcial y aumentacion de datos en un curso de vision por computador.
- Base para clasificadores de dominio especifico: partiendo de este esqueleto (backbone EfficientNet-B0 mas cabeza binaria) se puede reentrenar con dos clases propias, por ejemplo tipos de producto en control de calidad.
- Moderacion o curaduria de contenido gastronomico: en un foro o red social de cocina, clasificar imagenes subidas y enrutarlas a la seccion correspondiente.
- Demo interactiva en navegador o app movil: al ser un modelo pequeno, puede exportarse a TorchScript o ONNX y ejecutarse en dispositivos con recursos limitados para una demo de clasificacion en tiempo real.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Test accuracy | 99,80% |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; ademas, esos benchmarks no aplican a un clasificador de vision binario. Tampoco se documentan metricas por clase, matriz de confusion, precision, recall ni F1.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; EfficientNet-B0 ocupa del orden de decenas de MB en precision FP32, aunque la cifra exacta no se detalla en la model card.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; tambien funciona en CPU para inferencia por lotes pequenos.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: PyTorch nativo (el repositorio incluye `model.py` con `load_model` y `predict`), exportacion a TorchScript u ONNX no documentada pero factible; no se proporcionan artefactos para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EfficientNet-B0 pizza vs steak (este modelo) | no disponible (base EfficientNet-B0) | no aplica | 99,80% accuracy en test propio | MIT | Hugging Face |
| EfficientNet-B0 ImageNet (torchvision) | aproximadamente 5,3 M | no aplica | Clasificacion en 1000 clases ImageNet | BSD-3-Clause | torchvision |
| ResNet-50 ImageNet (torchvision) | aproximadamente 25,6 M | no aplica | Clasificacion en 1000 clases ImageNet | BSD-3-Clause | torchvision |

La comparacion directa con clasificadores genericos no es del todo equivalente: este modelo resuelve una tarea binaria muy acotada, mientras que los modelos de referencia cubren 1000 clases. No se dispone de datos de benchmarks comparables entre ellos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo conoce dos clases y siempre respondera con una de ellas, incluso ante imagenes no relacionadas; no detecta fuera de distribucion.
- No se documentan sesgos conocidos, pero al entrenarse con un dataset pequeno (1200 imagenes) puede sobrerrepresentar ciertos estilos de fotografia, iluminacion o presentacion de los platos.
- Riesgo de alucinacion en el sentido de falsos positivos: una imagen de cualquier comida, o incluso un objeto no gastronomico, sera asignada a pizza o steak con una probabilidad.
- La precision del 99,80% procede de un test de 500 imagenes del mismo dominio; no hay garantia de generalizacion a fotografias reales de otros contextos.
- Sin limitaciones de idioma aplicables, al no procesar texto.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene validar el modelo en el dominio objetivo antes de produccion.
- El repositorio tiene un tamano de 0.0 GB reportado y cero descargas, lo que sugiere que los artefactos pueden no estar completos o que el modelo no ha sido validado por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/JemilahAlao/efficientnet-b0-pizza-steak
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion disponible.

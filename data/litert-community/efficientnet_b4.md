# litert-community/efficientnet_b4

## Resumen

EfficientNet B4 es un modelo de clasificacion de imagenes basado en redes neuronales convolucionales, desarrollado originalmente por Tan y Le en 2019. La version publicada en este repositorio por `litert-community` es una conversion del checkpoint de PyTorch Vision al formato TFLite de LiteRT, el sucesor de TensorFlow Lite. El modelo esta preentrenado en el dataset ImageNet-1k y resuelve la tarea de clasificar imagenes en 1000 categorias.

El modelo utiliza la arquitectura EfficientNet-B4, que aplica escalado compuesto para equilibrar profundidad, anchura y resolucion, logrando una precision alta con una eficiencia computacional notable. Cuenta con 19.341.616 parametros y ofrece una ventana de contexto no aplicable al ser un modelo de vision. Este repositorio incluye tanto la version float32 como una variante cuantizada weight-only int8, lo que permite reducir el tamano del modelo unas 3,7 veces manteniendo una precision practicamente identica.

La relevancia actual de este modelo reside en su capacidad para ejecutarse en dispositivos de borde y moviles gracias al runtime LiteRT, lo que lo convierte en una opcion solida para aplicaciones de vision por computador en tiempo real con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B4 (CNN con bloques MBConv y capas Squeeze-and-Excitation) |
| Parametros totales | 19.341.616 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (clasificacion de imagenes) |
| Tipos de cuantizacion | Float32 y weight-only int8 (wi8_afp32) |
| Idiomas soportados | No aplica |
| Licencia | No disponible (la licencia del modelo original no se encontro) |
| Formato de pesos | TFLite (LiteRT) |

## Arquitectura y entrenamiento

EfficientNet-B4 es una red neuronal convolucional que combina bloques MBConv con conexiones residuales y capas de Squeeze-and-Excitation (SE). El escalado compuesto ajusta de forma simultanea las dimensiones de profundidad, anchura y resolucion de entrada. El modelo fue preentrenado en ImageNet-1k, con 1,28 millones de imagenes en 1000 clases. No se ha realizado RLHF ni DPO; es un modelo de clasificacion supervisada.

La conversion a TFLite se realizo desde un checkpoint de PyTorch Vision. La variante cuantizada utiliza cuantizacion weight-only int8, que preserva la precision en las capas SE y SiLU, sensibles a la cuantizacion de activaciones. Segun el autor, en una comprobacion puntual la correlacion minima de logits entre el modelo float y el cuantizado es 0,999.

## Capacidades

- Clasificacion de imagenes en 1000 clases del dataset ImageNet-1k.
- Inferencia en dispositivos moviles y de borde gracias al runtime LiteRT.
- Preprocesamiento de imagenes a resolucion 380x380 (recorte central y normalizacion con medias y desviaciones de ImageNet).
- Variante cuantizada weight-only int8 para reducir el tamano del modelo aproximadamente un 3,7x con perdida minima de precision.
- No soporta tool calling, agentes, razonamiento multi-paso, vision-language ni generacion de texto.
- Puede utilizarse como backbone para transfer learning o extraccion de caracteristicas.

## Casos de uso

- Clasificacion de imagenes en aplicaciones moviles: el modelo TFLite se integra en apps Android o iOS para reconocer objetos en tiempo real sin conexion a internet, gracias a su tamano reducido y al runtime LiteRT.
- Control de calidad en fabricacion: clasificar productos defectuosos a partir de imagenes de camara; el modelo es suficientemente ligero para ejecutarse en dispositivos de borde conectados a la linea de produccion.
- Clasificacion de plantas o cultivos: identificar especies o enfermedades a partir de fotografias tomadas en campo; la eficiencia del modelo permite su uso en dispositivos portatiles con bateria limitada.
- Filtrado de contenido en redes sociales: clasificar imagenes por categorias (por ejemplo, contenido inapropiado o tematico) en servidores con CPU, sin necesidad de GPU dedicada.
- Asistentes de accesibilidad: describir objetos a personas con discapacidad visual mediante clasificacion offline; el modelo puede ejecutarse localmente en un smartphone sin enviar datos a la nube.
- Sistemas de vision en robots: clasificacion de objetos en tiempo real con latencia baja; la version cuantizada int8 reduce el ancho de banda de memoria y acelera la inferencia en hardware embebido.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en el model-index de Hugging Face, no verificados de forma independiente:

| Metrica | Valor |
|---|---|
| Top 1 Accuracy (Full Precision) | 0,8339 (83,39%) |
| Top 5 Accuracy (Full Precision) | 0,966 (96,60%) |

El modelo original de PyTorch Vision reporta acc@1 de 83,384% y acc@5 de 96,594% sobre ImageNet-1k. No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no requiere VRAM dedicada. El modelo float32 ocupa aproximadamente 77 MB y la version int8 alrededor de 21 MB.
- GPU recomendadas: no es necesario usar GPU. Puede ejecutarse en CPU, GPU movil o NPU. En servidores, cualquier GPU moderna es suficiente, pero no aporta una ventaja significativa frente a la CPU.
- Cabe en cualquier consumer GPU, aunque es mas apropiado para dispositivos moviles y placas de desarrollo.
- Opciones de despliegue: LiteRT (CompiledModel), TensorFlow Lite, Python, Android e iOS.
- Latencia y throughput: no disponible; dependen del hardware de ejecucion.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada. El modelo es una conversion cuantizada de `google/efficientnet-b4`; no se han encontrado metricas verificadas de alternativas de la misma categoria dentro de los datos disponibles.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado en ImageNet-1k, el modelo puede heredar sesgos presentes en ese dataset, como desbalances en la representacion de ciertas clases o contextos.
- Riesgo de alucinacion: no aplica en el sentido clasico de generacion de texto, pero puede producir clasificaciones incorrectas o confusas en imagenes fuera de la distribucion de entrenamiento.
- Limitaciones de contexto o idioma: no aplica; el modelo solo procesa imagenes y no tiene capacidad de lenguaje.
- Restricciones de licencia: la licencia no esta disponible. El usuario debe verificar los permisos derivados de PyTorch Vision y del dataset de entrenamiento antes de usar el modelo en produccion.
- Caveat de cuantizacion: la variante weight-only int8 puede introducir pequenas perdidas de precision. El autor reporta una correlacion minima de logits de 0,999 en una comprobacion puntual, pero no se garantiza el mismo comportamiento en todos los casos.
- No soporta deteccion de objetos, segmentacion ni otras tareas de vision mas alla de la clasificacion de imagenes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/efficientnet_b4
- Repositorio de LiteRT en GitHub: https://github.com/google-ai-edge/litert
- Documentacion de LiteRT: https://developers.google.com/edge/litert
- Paper original de EfficientNet: https://arxiv.org/abs/1905.11946

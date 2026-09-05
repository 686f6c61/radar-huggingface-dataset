# litert-community/efficientnet_b3

## Resumen

EfficientNet B3 es un modelo de clasificación de imágenes pre-entrenado en ImageNet-1k, desarrollado originalmente por Tan y Le en Google en 2019. Esta versión concreta es una conversión al runtime LiteRT (sucesor de TensorFlow Lite) publicada por la comunidad `litert-community`. El modelo resuelve el problema de clasificación visual con una eficiencia computacional notable, gracias a la técnica de *compound scaling* que equilibra profundidad, anchura y resolución de la red. Es relevante ahora porque ofrece un punto de equilibrio entre precisión y coste para despliegue en dispositivos edge, y porque la variante cuantizada *weight-only int8* reduce el tamaño del modelo aproximadamente 3,6 veces respecto a float32, manteniendo una correlación de logits de 0,998 con el modelo original. La arquitectura es una CNN basada en bloques MBConv con conexiones residuales y capas de atención SE (Squeeze-and-Excitation). El modelo tiene 12.233.232 parámetros y, al ser un modelo de visión, no tiene longitud de contexto ni soporte de lenguaje.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B3 (CNN con MBConv, SE y SiLU) |
| Parametros totales | 12.233.232 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de visión) |
| Tipos de cuantizacion | Float32 (pesos originales) y weight-only int8 (wi8_afp32) |
| Idiomas soportados | No disponible (modelo de visión, no procesa lenguaje) |
| Licencia | No disponible |
| Formato de pesos | TFLite (LiteRT) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura EfficientNet-B3, que utiliza *compound scaling* para escalar uniformemente la profundidad, la anchura y la resolución de la red. Cada bloque MBConv incorpora capas de Squeeze-and-Excitation (SE) y activaciones SiLU, lo que permite capturar dependencias entre canales de forma eficiente. El modelo fue entrenado en el dataset ImageNet-1k y luego convertido desde un checkpoint de PyTorch Vision al formato TFLite. No se menciona el uso de RLHF, DPO ni otros ajustes por preferencia, ya que es un modelo de visión supervisada. La principal innovación técnica en esta versión es la cuantización *weight-only int8* aplicada a los pesos, que reduce el tamaño del archivo sin cuantizar las activaciones, evitando la degradación de precisión en capas sensibles como SE y SiLU.

## Capacidades

- Clasificación de imágenes en 1000 clases del dataset ImageNet-1k.
- Top-1 accuracy de 82,01 % y Top-5 accuracy de 96,04 % en el split de validación de ImageNet-1k (mediciones en precisión completa).
- Inferencia optimizada para dispositivos edge mediante el runtime LiteRT.
- Variante cuantizada weight-only int8 que reduce el peso a aproximadamente un tercio del tamaño float32, manteniendo una correlación mínima de logits de 0,998 con el modelo original en una comprobación con fotos reales.
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje.
- No tiene capacidades multimodales más allá de la entrada de imagen.

## Casos de uso

- Clasificación de imágenes en tiempo real en aplicaciones móviles: el modelo puede integrarse en apps Android o iOS mediante LiteRT, ofreciendo una inferencia rápida en dispositivos de gama media gracias a su tamaño reducido y a la cuantización int8.
- Control de calidad industrial: puede utilizarse para clasificar productos o detectar defectos visuales en líneas de producción, ejecutándose en cámaras edge con CPU o GPU modesta.
- Moderación de contenido en plataformas: permite clasificar imágenes no apropiadas (violencia, desnudos, etc.) tras un fine-tuning con un dataset propio. Su baja latencia y su funcionamiento on-device reducen costes de servidor.
- Agricultura de precisión: puede clasificar cultivos o enfermedades de plantas a partir de imágenes capturadas en campo, con despliegue en dispositivos móviles o drones.
- Identificación de especies en aplicaciones de naturaleza: apto para reconocer plantas, animales u hongos en imágenes de usuario, con la ventaja de poder ejecutarse sin conexión.
- Sistemas de vigilancia con clasificación de objetos: puede analizar imágenes fijas extraídas de cámaras de seguridad para etiquetar escenas o eventos, aprovechando su tamaño ligero para desplegarse en NVR o dispositivos de borde.

## Benchmarks y rendimiento

| Benchmark | Dataset | Metrica | Valor |
|---|---|---|---|
| Image Classification | ImageNet-1k (validation) | Top 1 Accuracy (Full Precision) | 0,8201 |
| Image Classification | ImageNet-1k (validation) | Top 5 Accuracy (Full Precision) | 0,9604 |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- No se han publicado requisitos de VRAM oficiales. Dado que el modelo tiene 12,2 millones de parámetros, es apto para ejecutarse en CPU, en GPUs de consumo y en dispositivos móviles.
- GPU recomendadas: no disponible. Al ser un modelo pequeño, cualquier GPU moderna (RTX 3060, A100, etc.) puede ejecutarlo sin problemas.
- ¿Cabe en GPU de consumo? Sí, el modelo ocupa aproximadamente 49 MB en float32 y unos 14 MB en int8 (estimación a partir de los parámetros), por lo que cabe en cualquier GPU consumer.
- Opciones de despliegue: LiteRT (ai-edge-litert) mediante el API `CompiledModel`, como se muestra en la model card. También puede convertirse a otros formatos como ONNX o TensorFlow para otros runtimes.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. El modelo pertenece a la familia EfficientNet, cuyas variantes B0-B7 difieren en escala, precisión y coste computacional. Para una comparativa directa, se recomienda consultar los resultados publicados por Tan y Le en el paper original (arXiv:1905.11946). En el ecosistema LiteRT existen otras variantes de EfficientNet y MobileNet, pero no se han incluido métricas en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos para esta versión, pero el entrenamiento en ImageNet-1k puede introducir sesgos geográficos, culturales o de distribución de clases.
- Riesgo de clasificación incorrecta: el modelo puede producir predicciones con alta confianza en imágenes fuera de distribución o en clases no vistas. Se recomienda validar en el dominio de aplicación.
- Limitaciones de contexto o idioma: no aplica, ya que es un modelo de visión puro y no soporta lenguaje.
- Restricciones de licencia para uso comercial: la licencia no está disponible. La model card advierte que los archivos se convirtieron desde pesos pre-entrenados de PyTorch Vision y pueden estar sujetos a términos y condiciones derivados de PyTorch Vision y del dataset ImageNet. Es responsabilidad del usuario verificar los permisos antes de un uso comercial.
- Caveat para producción: la variante cuantizada weight-only int8 mantiene una correlación de logits de 0,998 con el modelo float en una comprobación puntual, pero se recomienda probar el modelo en el dataset real de producción. Además, el modelo solo clasifica las 1000 clases de ImageNet, por lo que para casos de uso específicos se requiere fine-tuning.

## Enlaces

- HuggingFace: https://huggingface.co/litert-community/efficientnet_b3
- Repositorio de LiteRT: https://github.com/google-ai-edge/litert
- Documentación de LiteRT: https://developers.google.com/edge/litert
- Paper original de EfficientNet: https://arxiv.org/abs/1905.11946
- Model card en HuggingFace: https://huggingface.co/litert-community/efficientnet_b3/tree/main

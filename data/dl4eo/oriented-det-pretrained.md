# dl4eo/oriented-det-pretrained

## Resumen

OrientedDet es un framework ligero de código abierto para detección de objetos rotados (bounding boxes orientados) en imágenes aéreas y satelitales, desarrollado por el equipo DL4EO. El repositorio `dl4eo/oriented-det-pretrained` aloja los checkpoints preentrenados en formato PyTorch (`.pth`) listos para fine-tuning e inferencia. El modelo cubre tres familias de detectores: Oriented R-CNN, Rotated Faster R-CNN y Rotated RetinaNet, todas basadas en arquitecturas CNN con anclas rotadas. La versión más reciente, Oriented R-CNN 3×, fue entrenada sobre el dataset DOTA en su variante le90, lo que la hace especialmente adecuada para tareas de teledetección donde los objetos no están alineados con los ejes de la imagen.

La relevancia actual radica en que la detección orientada es crítica para aplicaciones como vigilancia de infraestructuras, agricultura de precisión o planificación urbana, donde los objetos (edificios, vehículos, parcelas) aparecen con ángulos arbitrarios. A diferencia de los detectores de cajas horizontales, este modelo predice ángulos, lo que reduce solapamientos y mejora la precisión en escenarios densos. Al ser un modelo preentrenado con licencia Apache-2.0, permite su uso comercial y académico sin restricciones, y su integración con el framework OrientedDet simplifica el flujo de trabajo frente a soluciones más pesadas como MMDetection.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detectores CNN con anclas rotadas: Oriented R-CNN, Rotated Faster R-CNN, Rotated RetinaNet |
| Parametros totales | No disponible (depende del backbone, probablemente ResNet-50 o similar) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (entrada de imágenes, no texto) |
| Tipos de cuantizacion | No disponible (los checkpoints están en `.pth`, presumiblemente float32) |
| Idiomas soportados | No aplica (modelo de visión) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pth`) |

## Arquitectura y entrenamiento

OrientedDet se basa en detectores de objetos clásicos adaptados a la detección rotada. Las tres arquitecturas incluidas son:

- **Oriented R-CNN**: detector de dos etapas que utiliza region proposal networks (RPN) con anclas rotadas y una segunda etapa de clasificación y regresión de cajas orientadas.
- **Rotated Faster R-CNN**: variante del Faster R-CNN con cabezales de regresión que predicen el ángulo de rotación además de la posición y tamaño.
- **Rotated RetinaNet**: detector de una etapa basado en Focal Loss, con anclas rotadas y predicción directa de cajas orientadas.

El entrenamiento se realizó sobre el dataset DOTA (Dataset for Object deTection in Aerial images), concretamente en su configuración le90 (ángulos en el rango [-90°, 0°)). La versión más reciente, Oriented R-CNN 3×, fue entrenada con un esquema de 3× (36 épocas) y es la que completa el zoo de modelos preentrenados. No se dispone de información detallada sobre el número de imágenes, el tamaño del batch o las técnicas de aumento de datos empleadas, aunque es habitual en este tipo de modelos el uso de aumentos como rotaciones, escalados y volteos.

## Capacidades

- Detección de objetos con bounding boxes orientados (ángulo + coordenadas), lo que permite localizar objetos que no están alineados con los ejes de la imagen.
- Soporte para múltiples clases de objetos en imágenes aéreas y satelitales (edificios, vehículos, campos, etc.), dependiendo del dataset de fine-tuning.
- Inferencia y fine-tuning sobre imágenes de alta resolución, típicas en teledetección.
- Integración con el framework OrientedDet, que ofrece una API limpia y modular para entrenamiento y evaluación.
- No incluye capacidades de generación de texto, tool calling ni razonamiento multimodal; es exclusivamente un modelo de visión.

## Casos de uso

- **Vigilancia de infraestructuras**: detección de torres eléctricas, paneles solares o tuberías en imágenes aéreas, donde los objetos suelen estar orientados de forma arbitraria. El modelo puede fine-tunearse con datos propios para identificar activos específicos y monitorizar su estado.
- **Agricultura de precisión**: identificación de parcelas de cultivo, invernaderos o maquinaria agrícola en imágenes satelitales. La detección orientada permite medir superficies reales sin distorsión por ángulo.
- **Planificación urbana**: extracción de huellas de edificios con su orientación exacta, útil para generar mapas 3D o analizar densidades urbanas. El modelo puede procesar ortofotos de ciudades y devolver polígonos ajustados.
- **Gestión de desastres**: localización de vehículos, escombros o estructuras dañadas en imágenes post-catástrofe. La detección rotada ayuda a distinguir objetos superpuestos en escenarios caóticos.
- **Defensa y seguridad**: detección de embarcaciones, aeronaves o vehículos militares en imágenes de vigilancia, donde la orientación es clave para estimar trayectorias o identificar amenazas.
- **Investigación en teledetección**: como modelo preentrenado, sirve de punto de partida para experimentos académicos sobre detección rotada, permitiendo comparar arquitecturas o probar nuevos datasets sin entrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El blog de DL4EO anuncia la finalización del entrenamiento de Oriented R-CNN 3× sobre DOTA le90, pero no se proporcionan métricas numéricas (mAP, precisión, etc.) en las fuentes consultadas. Se recomienda consultar la documentación oficial o el repositorio de GitHub para obtener resultados detallados si están disponibles.

## Requisitos de hardware

- **VRAM estimada**: no disponible. El tamaño del repositorio (4.3 GB) sugiere que los checkpoints corresponden a backbones de tamaño medio (ResNet-50 o similar), que en inferencia requieren aproximadamente 4-8 GB de VRAM en float32, pero este dato no está confirmado.
- **GPU recomendadas**: cualquier GPU con al menos 8 GB de VRAM (por ejemplo, RTX 2070, RTX 3060, A100) debería ser suficiente para inferencia. Para fine-tuning con lotes grandes, se recomienda una GPU con 16 GB o más.
- **Compatibilidad con GPUs de consumo**: sí, es probable que funcione en GPUs de gama media como RTX 3060 o RTX 4060, siempre que se ajuste el tamaño de lote.
- **Opciones de despliegue**: al ser un modelo PyTorch, puede ejecutarse con TorchServe, ONNX Runtime o directamente en scripts de Python. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- **Latencia y throughput**: no disponible. Depende del backbone, la resolución de entrada y la GPU utilizada.

## Comparativa con modelos similares

| Modelo/Framework | Arquitectura | Licencia | Formato | Dataset de preentrenamiento | Disponibilidad |
|---|---|---|---|---|---|
| OrientedDet (este modelo) | Oriented R-CNN, Rotated Faster R-CNN, Rotated RetinaNet | Apache-2.0 | PyTorch (.pth) | DOTA le90 | Hugging Face, GitHub |
| MMDetection (módulo rotado) | Rotated Faster R-CNN, Rotated RetinaNet, etc. | Apache-2.0 | PyTorch | DOTA, HRSC2016 | GitHub, PyPI |
| Rotated RetinaNet (otros repos) | RetinaNet con anclas rotadas | Varía (MIT, Apache) | PyTorch | DOTA | GitHub |

No se dispone de una comparativa cuantitativa directa con estos frameworks en la información proporcionada. MMDetection es un framework más completo y ampliamente usado, pero con mayor complejidad de configuración. OrientedDet se posiciona como una alternativa ligera y enfocada, con una curva de aprendizaje menor.

## Limitaciones y advertencias

- **Sesgos del dataset**: el modelo fue preentrenado en DOTA, que contiene principalmente imágenes aéreas de zonas urbanas y rurales de ciertas regiones. Puede tener un rendimiento inferior en otros dominios (imágenes de satélite de muy alta resolución, escenas submarinas, etc.) si no se realiza fine-tuning.
- **Riesgo de alucinación**: al ser un modelo de detección, puede producir falsos positivos o bounding boxes mal orientados en imágenes con ruido o patrones similares a los objetos de interés.
- **Limitaciones de contexto**: no aplica, pero la resolución de entrada está limitada por la memoria de la GPU; imágenes muy grandes deben dividirse en parches.
- **Restricciones de licencia**: la licencia Apache-2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de copyright y se indiquen los cambios. No hay restricciones de uso militar explícitas, pero el usuario debe verificar la legalidad en su jurisdicción.
- **Caveat para producción**: los checkpoints son preentrenados y no están calibrados para un dominio específico. Es imprescindible realizar fine-tuning con datos propios antes de desplegar en producción. Además, el formato `.pth` requiere PyTorch, lo que puede limitar la integración en entornos que usan otros frameworks.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/dl4eo/oriented-det-pretrained)
- [Repositorio GitHub de OrientedDet](https://github.com/DL4EO/oriented-det)
- [Documentación oficial de OrientedDet](https://dl4eo.github.io/oriented-det/)
- [Anuncio del modelo Oriented R-CNN 3×](https://deeplearning.earth/posts/2026-06-29_announcing_the_final_oriented_det_pretrained_model/)

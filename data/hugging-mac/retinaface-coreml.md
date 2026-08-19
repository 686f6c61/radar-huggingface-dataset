# hugging-mac/retinaface-coreml

## Resumen

RetinaFace MobileNet0.25 en formato Core ML es una conversión ligera del modelo de detección facial [py-feat/retinaface](https://huggingface.co/py-feat/retinaface) realizada por el proyecto Hugging Mac. Está diseñado para ejecutarse de forma local y eficiente en dispositivos Apple Silicon, proporcionando detección de caras y cinco puntos de referencia faciales (ojos, nariz y comisuras de la boca) en tiempo real.

El modelo utiliza un backbone MobileNet0.25 con solo 426.608 parámetros, lo que lo hace extremadamente compacto (0,94 MB) y adecuado para aplicaciones embebidas en macOS. Su salida son tensores crudos que requieren un postprocesado posterior (decodificación, filtrado por confianza, supresión no máxima y restauración de coordenadas) para obtener las cajas y landmarks finales.

La relevancia de esta conversión radica en que permite a los desarrolladores integrar capacidades de detección facial en aplicaciones macOS sin depender de servicios externos ni de frameworks pesados, aprovechando la aceleración de Core ML en Apple Silicon. El proyecto Hugging Mac lo utiliza como componente para construir aplicaciones de cámara, interfaces sensibles a la cara, juegos, plugins y agentes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RetinaFace con backbone MobileNet0.25 |
| Parametros totales | 426.608 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión) |
| Tipos de cuantizacion | FP16 (compute units) |
| Idiomas soportados | no disponible (modelo de visión, sin texto) |
| Licencia | MIT |
| Formato de pesos | .mlpackage (Core ML, ML Program) |

## Arquitectura y entrenamiento

El modelo original RetinaFace es un detector facial basado en redes neuronales convolucionales que combina una rama de detección de cajas y una rama de regresión de landmarks. La variante MobileNet0.25 utiliza una versión reducida de MobileNet como backbone, lo que reduce drásticamente el número de parámetros y el coste computacional a cambio de una ligera pérdida de precisión frente a versiones más grandes.

La conversión a Core ML se realizó a partir del checkpoint `py-feat/retinaface` en su revisión `31702389094fccc7060c15299e6ad712ee880de6`. El proceso fijó un tamaño de entrada de 640×640 píxeles, utilizó ML Program como formato y precisión FP16 para los pesos y activaciones. No se ha realizado ningún entrenamiento adicional; se trata exclusivamente de una transformación de formato para su ejecución eficiente en Apple Silicon.

## Capacidades

- Detección de caras en imágenes de hasta 640×640 píxeles, devolviendo cajas delimitadoras (bounding boxes) y puntuaciones de confianza.
- Regresión de cinco puntos de referencia faciales: ojo izquierdo, ojo derecho, nariz, comisura izquierda y comisura derecha de la boca.
- Salida cruda: 16.800 propuestas por imagen (locations, scores y landmarks), que requieren postprocesado externo para obtener resultados finales.
- Compatible con el ecosistema Core ML: se puede integrar directamente en aplicaciones macOS, iOS o iPadOS mediante `coremltools` o la API de Core ML.
- Optimizado para Apple Silicon: aprovecha la Neural Engine y la GPU unificada para inferencia de baja latencia y bajo consumo energético.
- No incluye capacidades de texto, lenguaje o generación; es un modelo puramente visual.

## Casos de uso

- Aplicaciones de cámara en macOS: detección de caras en tiempo real para efectos de realidad aumentada, filtros o enfoque automático.
- Interfaces sensibles a la cara: ajustar la iluminación, el encuadre o la interfaz de usuario según la posición y orientación del rostro del usuario.
- Juegos y entretenimiento: control por gestos faciales o avatares que siguen los movimientos de la cara.
- Plugins y agentes de escritorio: integrar detección facial en asistentes personales, herramientas de videoconferencia o sistemas de seguridad local.
- Alineación facial para pipelines de visión: preprocesar imágenes para tareas posteriores como reconocimiento facial, análisis de emociones o estimación de pose.
- Prototipado rápido en investigación: gracias a su tamaño reducido y formato Core ML, es fácil de desplegar en entornos de desarrollo macOS sin necesidad de GPUs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión (como AP en WIDER FACE) ni comparativas de velocidad. Para conocer el rendimiento real, se recomienda evaluar el modelo en el hardware objetivo, ya que la latencia depende de la generación del Apple Silicon y de la implementación del postprocesado.

## Requisitos de hardware

- Dispositivos con Apple Silicon (M1, M1 Pro/Max, M2, M2 Pro/Max, M3, etc.) o versiones posteriores.
- Memoria RAM: el modelo ocupa menos de 1 MB en disco, por lo que la VRAM necesaria es mínima; la inferencia se realiza en la Neural Engine o GPU integrada.
- Compatible con macOS, iOS y iPadOS mediante Core ML.
- No requiere GPU dedicada externa; funciona en cualquier Mac con chip Apple Silicon.
- Opciones de despliegue: se puede cargar con `coremltools` en Python o usar directamente en aplicaciones Swift/Objective-C mediante el framework Core ML.
- Latencia y throughput: no hay datos oficiales, pero por el tamaño del modelo se espera una inferencia en milisegundos en dispositivos modernos.

## Comparativa con modelos similares

| Modelo | Formato | Parámetros | Entrada | Plataforma | Licencia |
|---|---|---|---|---|---|
| hugging-mac/retinaface-coreml | Core ML | 426.608 | 640×640 | Apple Silicon | MIT |
| py-feat/retinaface (original) | PyTorch/MXNet | ~1M (aprox.) | Variable | GPU/CPU | MIT |
| amd/retinaface | PyTorch | similar al original | Variable | GPU/CPU | MIT |

La principal diferencia con el modelo original es el formato de exportación y la optimización para Apple Silicon. Mientras que el original requiere un framework de deep learning (PyTorch, MXNet) y una GPU para un rendimiento aceptable, la versión Core ML está lista para usarse en entornos Apple con aceleración nativa. No se dispone de datos de comparativa de precisión entre ambas versiones.

## Limitaciones y advertencias

- El modelo solo detecta caras y landmarks; no realiza reconocimiento facial ni identificación de personas.
- La entrada está fijada a 640×640 píxeles; si se usan imágenes de otro tamaño, es necesario redimensionar y rellenar (padding) antes de la inferencia.
- Las salidas son crudas y requieren un pipeline de postprocesado (decodificación de anclas, filtrado por confianza, NMS y restauración de coordenadas) que no está incluido en el paquete Core ML.
- El modelo puede presentar sesgos en la detección según la demografía de los rostros, al estar entrenado con datasets como WIDER FACE que pueden tener distribución desigual.
- No se ha evaluado su robustez en condiciones extremas de iluminación, oclusión o ángulos de cámara poco habituales.
- La licencia MIT permite uso comercial, pero el usuario debe asegurarse de cumplir con las normativas de privacidad y protección de datos al procesar imágenes de personas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/hugging-mac/retinaface-coreml)
- [Modelo original py-feat/retinaface](https://huggingface.co/py-feat/retinaface)
- [Proyecto Hugging Mac (GitHub)](https://github.com/devilyouwei/hugging-mac)
- [SDK de RetinaFace en Hugging Mac](https://github.com/devilyouwei/hugging-mac/tree/main/packages/hugging_mac_sdk/src/hugging_mac_sdk/models/retinaface)
- [Repositorio de RetinaFace de serengil](https://github.com/serengil/retinaface)

# mlboydaisuke/RTMPose-m-Hand-ExecuTorch

## Resumen

El modelo `mlboydaisuke/RTMPose-m-Hand-ExecuTorch` es una conversión a ExecuTorch del modelo de estimación de pose de mano RTMPose-m de OpenMMLab (mmpose). Está diseñado para ejecución en dispositivos móviles (on‑device) mediante el runtime ExecuTorch, con dos variantes: una basada en XNNPACK para CPU (portable) y otra optimizada para el Neural Engine de Apple (Core ML). El modelo resuelve la detección de 21 puntos clave de una mano a partir de una imagen RGB de 256×256, devolviendo dos mapas de distribución SimCC (coordenadas x e y) que permiten localizar cada articulación. Su relevancia reside en la baja latencia de inferencia (2,9 ms en iPhone 17 Pro con Core ML) y en la facilidad de integración en aplicaciones móviles, ya que el formato `.pte` es directamente cargable por ExecuTorch.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RTMPose‑m (backbone CNN CSPNeXt + cabeza SimCC) |
| Parámetros totales | no disponible (modelo original RTMPose‑m, sin cifra publicada en la ficha) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantización | fp32 (XNNPACK) y fp16 (Core ML) |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | Apache‑2.0 |
| Formato de pesos | ExecuTorch `.pte` (safetensors no incluido) |

## Arquitectura y entrenamiento

El modelo original es RTMPose‑m, un detector de puntos clave de mano desarrollado por OpenMMLab. Su arquitectura combina un backbone CNN (CSPNeXt) con una cabeza de decodificación SimCC (Simulated Coordinate Classification) que produce dos distribuciones de probabilidad unidimensionales por eje (x e y) para cada uno de los 21 keypoints. El entrenamiento se realizó sobre los conjuntos de datos AIC y COCO (versión para manos), como indica el nombre del checkpoint (`pt‑aic‑coco`). La conversión a ExecuTorch se ha llevado a cabo mediante el pipeline estándar: `torch.export` → `to_edge_transform_and_lower` → `.pte`, con particionado de operadores hacia XNNPACK (93,9 % de cobertura) o hacia Core ML. No se aplicaron técnicas como RLHF o DPO, al tratarse de un modelo puramente perceptivo.

## Capacidades

- Detección de 21 puntos clave de la mano (muñeca, metacarpofalángicas, interfalángicas proximales, interfalángicas distales y yemas) en coordenadas normalizadas.
- Inferencia en tiempo real en dispositivos móviles gracias a la optimización para CPU (XNNPACK) y Neural Engine (Core ML).
- Salida en forma de distribución de probabilidad SimCC que permite obtener coordenadas subpixel y un valor de confianza asociado a cada keypoint.
- Compatibilidad con el runtime ExecuTorch, lo que facilita la integración en aplicaciones Android e iOS.
- Funciona con entradas de 256×256 RGB normalizadas según ImageNet (media y desviación estándar típicas).
- No incluye detección automática de manos; requiere un detector previo que recorte la región de la mano.

## Casos de uso

- **Interacción sin contacto en kioscos**: el modelo puede seguir la posición de los dedos para permitir selección de opciones en pantallas públicas, evitando el contacto físico. Su baja latencia permite una respuesta fluida en tiempo real.
- **Realidad aumentada (AR)**: en aplicaciones de maquillaje virtual o filtros de manos, los 21 keypoints sirven para superponer objetos virtuales sobre la mano del usuario. La variante Core ML ofrece la velocidad necesaria para el seguimiento continuo.
- **Control por gestos en dispositivos móviles**: permite implementar comandos como deslizar, hacer clic o ajustar volumen mediante movimientos de la mano, sin necesidad de tocar la pantalla.
- **Fisioterapia y rehabilitación**: seguimiento de ejercicios de movilidad de la mano, evaluando el rango de movimiento de cada articulación a partir de los keypoints.
- **Traducción de lengua de signos**: al capturar la configuración de la mano en tiempo real, el modelo puede alimentar sistemas de reconocimiento de gestos para transcribir signos básicos.
- **Pruebas de usabilidad**: análisis de la interacción del usuario con una interfaz, midiendo la posición y el movimiento de los dedos para evaluar la ergonomía de la aplicación.

## Benchmarks y rendimiento

El autor proporciona datos de latencia y paridad numérica, pero no resultados de benchmarks estándar (MMLU, HumanEval, etc.) al tratarse de un modelo de visión. La siguiente tabla resume las métricas publicadas:

| Métrica | Valor |
|---|---|
| Latencia media (Mac arm64, fp32, XNNPACK) | 9,5 ms |
| Latencia media (Mac arm64, Core ML fp16) | 2,9 ms |
| Latencia media (torch eager fp32 en Mac) | 90,7 ms |
| Correlación máxima (XNNPACK vs fp32 eager) | 1,000000 |
| Correlación máxima (Core ML vs fp32 eager) | 0,999768 |
| Diferencia máxima absoluta (XNNPACK) | 3,867e‑06 (tensor x) y 4,172e‑06 (tensor y) |
| Cobertura de delegación XNNPACK | 93,9 % (306/326 operaciones) |

Los valores de latencia se midieron en un Mac arm64 con un único proceso y mediana de 10 ejecuciones. La correlación se calculó sobre todos los elementos de los tensores de salida usando imágenes reales.

## Requisitos de hardware

- **Plataformas soportadas**: Android (CPU con XNNPACK) y iOS (Core ML, solo Neural Engine).
- **Memoria**: el archivo `.pte` ocupa 55,1 MB en fp32 y 28,0 MB en fp16 (Core ML). La memoria RAM necesaria es proporcional a estos tamaños, típicamente inferior a 100 MB.
- **GPU**: no requiere GPU dedicada; funciona en CPU (XNNPACK) o en el Neural Engine de Apple (Core ML).
- **Despliegue**: se integra mediante el runtime ExecuTorch (versión 1.4.0) en aplicaciones Android e iOS. No se mencionan soportes para vLLM, Ollama o llama.cpp, ya que no es un modelo de lenguaje.
- **Latencia**: en dispositivos móviles modernos (iPhone 17 Pro) se reportan 2,9 ms con Core ML; en Mac arm64 9,5 ms con XNNPACK. Para Android se espera un rendimiento similar al de XNNPACK en CPU.

## Comparativa con modelos similares

No se dispone de una comparativa oficial con otros modelos de detección de mano en la información proporcionada. Sin embargo, la alternativa más conocida es **MediaPipe Hands** (de Google), que también ofrece detección de 21 keypoints en tiempo real y está optimizada para móviles. A diferencia de MediaPipe, este modelo requiere un detector de mano previo y no realiza detección automática, pero ofrece la flexibilidad de ejecutarse con ExecuTorch y permite elegir entre fp32 y fp16 (Core ML). Otra alternativa es **Hands** del repositorio `open‑mmlab/mmpose`, del cual este modelo es una conversión, aunque sin la conversión a ExecuTorch. No se dispone de datos cuantitativos de comparación entre estos modelos.

## Limitaciones y advertencias

- **Dependencia de un detector previo**: el modelo espera una imagen recortada de la mano (256×256). Si se usa sobre imágenes completas, es necesario integrar un detector de objetos previo (p. ej., un detector de manos) para generar el recorte.
- **Riesgo de errores en condiciones extremas**: la precisión puede degradarse con iluminación baja, oclusiones o manos parcialmente fuera del encuadre.
- **Sesgo en los datos de entrenamiento**: el entrenamiento se basa en AIC y COCO, que pueden tener un sesgo hacia manos de tonos de piel claros y posturas comunes; su rendimiento puede ser menor en otros tipos de manos.
- **Alucinación de keypoints**: en situaciones de oclusión, el modelo puede generar keypoints con baja confianza o posiciones no plausibles; se recomienda filtrar por confianza.
- **Restricciones de la variante Core ML**: el archivo `.pte` de Core ML es solo para iOS; para Android se debe usar la variante XNNPACK (fp32).
- **Sin soporte para múltiples manos**: el modelo solo produce keypoints para una sola mano; para varias manos se necesitaría un detector adicional y ejecutar el modelo por cada región.
- **Licencia**: Apache‑2.0, permite uso comercial, pero no se proporciona garantía sobre el rendimiento en producción.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/mlboydaisuke/RTMPose-m-Hand-ExecuTorch)
- [Repositorio de conversión (executorch-models)](https://github.com/john-rocky/executorch-models)
- [OpenMMLab MMpose (modelo original)](https://github.com/open-mmlab/mmpose)
- [Documentación de ExecuTorch](https://pytorch.org/executorch/)
- [Paper de RTMPose](https://arxiv.org/abs/2303.07399)

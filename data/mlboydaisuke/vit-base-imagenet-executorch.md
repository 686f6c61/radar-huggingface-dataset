# mlboydaisuke/ViT-Base-ImageNet-ExecuTorch

## Resumen

El modelo `mlboydaisuke/ViT-Base-ImageNet-ExecuTorch` es una exportación a ExecuTorch del clasificador de imágenes Vision Transformer (ViT) base de Google, fine-tuned en ImageNet-1k. Proporciona tres archivos `.pte` listos para inferencia on-device: dos para CPU mediante el backend XNNPACK (fp32 y fp16) y uno para Apple Silicon mediante Core ML (fp16). El objetivo es permitir ejecutar un clasificador de 1000 clases en dispositivos con recursos limitados, sin necesidad de GPU, manteniendo una alta fidelidad al modelo original.

La relevancia actual radica en la creciente demanda de modelos de visión eficientes para edge computing y aplicaciones móviles. Con 86 millones de parámetros y una arquitectura ViT-Base/16, este modelo ofrece un equilibrio entre precisión y coste computacional. La versión Core ML alcanza una latencia media de 4 ms en un Mac arm64, lo que lo hace adecuado para aplicaciones en tiempo real. El autor ha realizado una verificación exhaustiva de fidelidad entre las distintas variantes, documentando incluso por qué no publica una versión int8.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base/16), 12 capas, hidden 768, 12 cabezas de atención |
| Parametros totales | 86 millones |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de 224x224 píxeles) |
| Tipos de cuantizacion | fp32, fp16 (XNNPACK), fp16 (Core ML); int8 dinámico evaluado pero no publicado |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | PTE (ExecuTorch), archivos `.pte` |

## Arquitectura y entrenamiento

El modelo base es `google/vit-base-patch16-224`, un Vision Transformer estándar que divide la imagen en parches de 16x16 píxeles y los procesa mediante capas de atención. Fue preentrenado en ImageNet-21k (14 millones de imágenes, 21 843 clases) y fine-tuned en ImageNet-2012 (1 millón de imágenes, 1000 clases). La exportación a ExecuTorch convierte los pesos a formato `.pte` utilizando el backend XNNPACK para CPU portable y Core ML para dispositivos Apple. No se aplicaron técnicas de RLHF ni DPO; es un modelo puramente de visión.

La conversión se realiza mediante scripts del repositorio `executorch-models` (enlace en la sección de enlaces). El autor ha implementado un método de verificación de fidelidad que camina a lo largo del gradiente del margen de clase hasta encontrar el punto de decisión, comparando las salidas de cada variante con el modelo fp32 original. Este análisis reveló que la versión int8, aunque mantiene una correlación de 0.999814 con fp32, produce un desplazamiento de margen de 0.1856 logits, el doble de la distancia mínima de una fotografía a su frontera de decisión (0.09 logits), por lo que no se publicó.

## Capacidades

- Clasificación de imágenes en 1000 clases de ImageNet, devolviendo logits sin softmax.
- Entrada de `[1, 3, 224, 224]` en fp32, con normalización específica: media y desviación estándar de 0.5 (no las estadísticas estándar de ImageNet).
- Inferencia en CPU (XNNPACK) y en Apple Silicon (Core ML) con delegación completa en un solo subgrafo.
- Soporte para ejecución en dispositivos con recursos limitados gracias al formato ExecuTorch.
- No incluye capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje.

## Casos de uso

- **Clasificación de imágenes en tiempo real en aplicaciones móviles**: la variante Core ML ejecuta en 4 ms en un Mac arm64, lo que permite análisis de fotos o vídeo en tiempo real sin conexión a servidores.
- **Filtrado de contenido en galerías de fotos**: el modelo puede etiquetar automáticamente imágenes (por ejemplo, animales, personas, paisajes) para organizar bibliotecas personales, aprovechando su baja latencia y ejecución local.
- **Moderación de contenido en plataformas sociales**: al desplegarse en el dispositivo, se pueden detectar categorías problemáticas (violencia, desnudos) sin enviar imágenes a la nube, preservando la privacidad del usuario.
- **Reconocimiento de objetos en robótica edge**: robots o drones con CPUs ARM pueden usar este clasificador para identificar obstáculos o elementos del entorno, gracias a su compatibilidad con XNNPACK.
- **Aplicaciones de accesibilidad**: descripción automática de imágenes para personas con discapacidad visual, ejecutándose localmente en el dispositivo para garantizar respuesta inmediata.
- **Prototipado rápido de sistemas de visión**: al ser un modelo de referencia bien documentado, sirve como punto de partida para experimentar con ExecuTorch y validar pipelines de despliegue on-device.

## Benchmarks y rendimiento

La model card no reporta precisión top-1 sobre ImageNet validation, sino tiempos de inferencia y métricas de fidelidad. Los tiempos se midieron en un Mac arm64, proceso único, mediana de 10 ejecuciones:

| Variante | Tamaño (MB) | Latencia mediana (ms) | Notas |
|---|---|---|---|
| fp32 (XNNPACK) | 346.4 | 34.9 | Referencia de fidelidad |
| fp16 (XNNPACK) | 174.6 | 71.0 | Más lento que fp32 por emulación de XNNPACK |
| Core ML (fp16, iOS) | 173.6 | 4.0 | 6.9x más rápido que PyTorch eager (27.5 ms) |
| int8 (no publicado) | 89.7 | 31.7 | Correlación 0.999814 con fp32, pero margen de error inaceptable |

No se han publicado resultados de precisión (top-1, top-5) en la información disponible. La verificación se centró en la fidelidad al modelo fp32, no en la exactitud del clasificador.

## Requisitos de hardware

- **CPU**: cualquier procesador compatible con XNNPACK (ARM, x86) para las variantes fp32 y fp16. No requiere GPU.
- **Apple Silicon**: la variante Core ML requiere un dispositivo con Neural Engine o GPU Apple (M1 o posterior, iPhone/iPad con chip A12 o superior).
- **Memoria**: los archivos `.pte` ocupan entre 174 y 346 MB en disco; la memoria RAM necesaria en tiempo de ejecución no está especificada, pero es razonable para dispositivos móviles modernos.
- **Despliegue**: se utiliza el runtime de ExecuTorch, con soporte para C++ y Python. No se mencionan integraciones con vLLM, Ollama o TGI, ya que no es un modelo de lenguaje.
- **Latencia**: la variante Core ML alcanza 4 ms en Mac arm64; en dispositivos móviles reales puede variar, pero se espera un rendimiento en tiempo real.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos exportados a ExecuTorch en la información proporcionada. Como referencia, el modelo original `google/vit-base-patch16-224` en formato PyTorch tiene los mismos parámetros y arquitectura, pero requiere un runtime de PyTorch completo y no está optimizado para on-device. Otras alternativas como DeiT o Swin Transformer no han sido evaluadas en este contexto. Por tanto, la comparativa directa no está disponible.

## Limitaciones y advertencias

- **La versión int8 no se publica**: aunque mantiene una correlación alta con fp32, el desplazamiento del margen de decisión (0.1856 logits) supera la distancia mínima de una imagen a su frontera (0.09 logits), lo que podría provocar errores de clasificación en imágenes ambiguas.
- **Confianza del modelo baja**: en las 24 fotografías de prueba, la confianza del modelo fp32 varía entre 0.022 y 0.501 (mediana), lo que indica que un clasificador de 1000 clases rara vez está seguro. Los umbrales de probabilidad deben ajustarse con cuidado.
- **Fidelidad verificada, no precisión**: los tests confirman que las variantes reproducen las salidas del modelo fp32, pero no se ha evaluado la precisión top-1 en ImageNet validation. El modelo hereda las limitaciones del checkpoint original.
- **fp16 en XNNPACK es más lento que fp32**: debido a la emulación de operaciones de media precisión, la variante fp16 solo es útil para reducir el tamaño del archivo, no para mejorar el rendimiento.
- **Solo clasificación**: no soporta detección de objetos, segmentación ni otras tareas de visión.
- **Licencia Apache 2.0**: permite uso comercial, pero se debe atribuir la autoría y mantener el aviso de licencia.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/mlboydaisuke/ViT-Base-ImageNet-ExecuTorch)
- [Colección ExecuTorch Model Zoo](https://huggingface.co/collections/mlboydaisuke/executorch-model-zoo)
- [Scripts de conversión (executorch-models)](https://github.com/john-rocky/executorch-models)
- [Paper original de ViT (An Image is Worth 16x16 Words)](https://github.com/google-research/vision_transformer)
- [Modelo base en HuggingFace](https://huggingface.co/google/vit-base-patch16-224)

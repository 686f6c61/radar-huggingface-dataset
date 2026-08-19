# mlboydaisuke/DIS-ISNet-ExecuTorch

## Resumen

DIS-ISNet-ExecuTorch es una conversión del modelo IS-Net (Dichotomous Image Segmentation) al formato ExecuTorch con backend XNNPACK, publicada por el usuario mlboydaisuke. El modelo original, desarrollado por xuebinqin (DIS) y con pesos de NimaBoscarino (IS-Net_DIS-general-use), está diseñado para segmentación dicotómica de imágenes: separa el objeto principal del fondo generando una máscara alfa de alta precisión. Esta versión ExecuTorch permite ejecutar el modelo en dispositivos móviles y edge con baja latencia, manteniendo la paridad numérica con el modelo eager de PyTorch.

El repositorio incluye dos variantes cuantizadas: fp32 (176,1 MB) e int8 (44,3 MB), ambas con entrada de 1024×1024 píxeles y salida de máscara alfa. La variante fp32 alcanza una correlación perfecta (1,0) con el modelo eager, mientras que la int8 mantiene una correlación de 0,9878. La cobertura del delegado XNNPACK es del 100% (468/468 operaciones), lo que garantiza una ejecución completamente optimizada en hardware compatible. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones.

Este modelo es relevante para desarrolladores que necesitan segmentación de imágenes en tiempo real en dispositivos con recursos limitados, como aplicaciones móviles de edición de fotos, realidad aumentada o sistemas de visión embebidos. La conversión a ExecuTorch simplifica la integración con el ecosistema PyTorch y reduce la latencia frente a la ejecución eager (392 ms frente a 169 ms en fp32 en un Mac arm64 de referencia).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | IS-Net (segmentación dicotómica, arquitectura detallada no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 1024×1024) |
| Tipos de cuantizacion | fp32, int8 (fp16 no incluido por baja paridad) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | .pte (ExecuTorch) |

## Arquitectura y entrenamiento

La arquitectura del modelo original IS-Net no se detalla en la información proporcionada. Se sabe que es un modelo de segmentación dicotómica de imágenes, diseñado para producir máscaras alfa precisas que separan el objeto principal del fondo. El modelo acepta una imagen RGB de 1024×1024 píxeles, normalizada al rango [-1,1] mediante la transformación (x/255 - 0.5)/0.5, y devuelve una máscara alfa de la misma resolución con valores entre 0 y 1 (aplicando sigmoide).

La conversión a ExecuTorch se realizó mediante el flujo estándar: `torch.export` seguido de `to_edge_transform_and_lower` con el particionador XNNPACK, generando un archivo `.pte`. Los scripts de conversión están disponibles en el repositorio [executorch-models](https://github.com/john-rocky/executorch-models). No se proporcionan datos sobre el entrenamiento original (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO), ya que el modelo se distribuye como una conversión de pesos preentrenados.

La verificación se realizó con ExecuTorch 1.4.0 y PyTorch 2.13.0, midiendo la paridad contra el modelo eager en fp32 sobre imágenes reales. La correlación entre salidas es de 1,0 para fp32 y 0,9878 para int8, con una diferencia absoluta máxima de 8,941e-07 en fp32. La cobertura del delegado XNNPACK es del 100%, lo que indica que todas las operaciones del grafo se ejecutan en el backend optimizado.

## Capacidades

- Segmentación dicotómica de imágenes: genera una máscara alfa que separa el objeto principal del fondo en imágenes de 1024×1024 píxeles.
- Ejecución on-device: optimizado para dispositivos móviles y edge mediante ExecuTorch con backend XNNPACK, sin necesidad de GPU dedicada.
- Dos precisiones disponibles: fp32 (máxima fidelidad) e int8 (menor tamaño y latencia, con una pérdida de correlación de 0,0122).
- Compatibilidad con el ecosistema PyTorch: el formato `.pte` se integra directamente con el runtime de ExecuTorch, facilitando el despliegue en Android, iOS y plataformas embebidas.
- Sin dependencias de servicios en la nube: la inferencia se realiza localmente, lo que garantiza privacidad y baja latencia.
- No incluye capacidades de texto, tool calling, agentes ni razonamiento multimodal; es exclusivamente un modelo de visión para segmentación.

## Casos de uso

- Edición de fotos en aplicaciones móviles: el modelo puede recortar automáticamente el sujeto de una imagen para aplicarle fondos, filtros o efectos. Su tamaño reducido (44 MB en int8) permite integrarlo en apps de iOS y Android sin aumentar significativamente el peso de la aplicación.
- Realidad aumentada: separar objetos del fondo en tiempo real para superponer elementos virtuales. La latencia de 70 ms en int8 (medida en Mac arm64) es adecuada para aplicaciones interactivas, aunque en dispositivos móviles reales puede variar.
- Sistemas de visión embebidos: en dispositivos con recursos limitados (Raspberry Pi, cámaras inteligentes), la variante int8 permite ejecutar segmentación de alta calidad sin necesidad de hardware especializado.
- Automatización de diseño gráfico: generar máscaras alfa para bancos de imágenes o herramientas de diseño web, sustituyendo procesos manuales de recorte.
- Análisis de imágenes médicas o industriales: aislar regiones de interés en imágenes de alta resolución (previa reducción a 1024×1024) para inspección o diagnóstico asistido.
- Prototipado rápido con PyTorch: al ser una conversión ExecuTorch, los desarrolladores pueden integrar el modelo en pipelines existentes de PyTorch sin cambiar el flujo de trabajo, usando el runtime de ExecuTorch para despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye métricas de paridad con el modelo eager (correlación y diferencia absoluta máxima) y tiempos de latencia de referencia en un Mac arm64 (mediana de 10 ejecuciones): 169,0 ms para fp32 y 70,1 ms para int8, frente a 392,2 ms del modelo eager en fp32. Estos valores son orientativos y no constituyen una evaluación comparativa con otros modelos de segmentación.

## Requisitos de hardware

- VRAM estimada: no disponible, pero el modelo opera con tensores de 1024×1024×3 (entrada) y 1024×1024×1 (salida). En fp32, el tamaño del archivo es de 176,1 MB, por lo que se recomienda al menos 256 MB de memoria libre para la inferencia. En int8, el archivo ocupa 44,3 MB, apto para dispositivos con 128 MB o menos.
- GPU recomendadas: no requiere GPU; está diseñado para CPU con soporte XNNPACK (ARM, x86-64). En dispositivos móviles, funciona en CPUs de gama media y alta.
- Compatibilidad con consumer GPU: no aplica, ya que el formato `.pte` está pensado para ejecución en CPU/edge, no en GPUs de escritorio.
- Opciones de despliegue: runtime de ExecuTorch (C++ o Python), integrable en apps Android/iOS mediante bindings oficiales. No es compatible directamente con vLLM, llama.cpp, Ollama o TGI, que son para modelos de lenguaje.
- Latencia y throughput: en Mac arm64 (referencia), 169 ms (fp32) y 70 ms (int8) por imagen. En dispositivos móviles reales, se espera una latencia mayor, pero el modelo está optimizado para ejecución en tiempo real en hardware moderno.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el contexto de segmentación dicotómica convertidos a ExecuTorch. El autor también publica otras conversiones (EfficientNet-B1, PIDNet-S), pero no hay datos de rendimiento comparativo. Se recomienda evaluar el modelo frente a alternativas como U²-Net o DeepLabV3+ en tareas de segmentación, aunque no se han publicado resultados en esta ficha.

## Limitaciones y advertencias

- La variante fp16 no se incluye porque su correlación con el modelo eager (0,986) no alcanza el umbral de calidad establecido (0,995). Los usuarios que necesiten precisión intermedia deben usar fp32 o int8.
- El modelo solo acepta imágenes de 1024×1024 píxeles; imágenes de otras resoluciones deben redimensionarse previamente, lo que puede afectar la calidad de la segmentación.
- No se proporcionan datos sobre sesgos o alucinaciones, ya que es un modelo de visión y no genera texto. Sin embargo, como cualquier modelo de segmentación, puede fallar en imágenes con objetos ambiguos, oclusiones o fondos complejos.
- La licencia Apache-2.0 permite uso comercial sin restricciones, pero se recomienda verificar los términos de los pesos originales (xuebinqin/DIS y NimaBoscarino/IS-Net_DIS-general-use) por si hubiera condiciones adicionales.
- El modelo está optimizado para CPU con XNNPACK; en dispositivos sin soporte para este backend, la ejecución podría degradarse o requerir fallback a operadores no optimizados.
- No se han publicado benchmarks formales (mIoU, F1, etc.) en la información disponible, por lo que la calidad de segmentación debe validarse en el caso de uso concreto.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/mlboydaisuke/DIS-ISNet-ExecuTorch)
- [Repositorio ExecuTorch (PyTorch)](https://github.com/pytorch/executorch)
- [Repositorio DIS/IS-Net (modelo original)](https://github.com/xuebinqin/DIS)
- [Scripts de conversión executorch-models](https://github.com/john-rocky/executorch-models)
- [Paper de ExecuTorch (arXiv)](https://arxiv.org/abs/2605.08195)

# apatrig/stover-unet

## Resumen

Stover U-Net es un modelo de segmentación semántica de imágenes diseñado específicamente para el análisis de cobertura del suelo en campos agrícolas. Desarrollado por Andres Patrignani y colaboradores del Department of Agronomy de Kansas State University, el modelo clasifica cada píxel de una fotografía cenital de campo como suelo desnudo, dosel vegetal verde o residuo de cultivo. Forma parte del ecosistema de herramientas Stover, que incluye una aplicación web y una aplicación de escritorio para Windows.

El modelo emplea una arquitectura U-Net clásica con aproximadamente 17,5 millones de parámetros, exportada a formato ONNX (opset 17) para su despliegue ligero. Se entrenó sobre el dataset Stover, compuesto por 5.000 imágenes de campos agrícolas de Kansas a 1024 × 1024 píxeles con etiquetas a nivel de píxel. La entrada son imágenes RGB normalizadas a 0-1 en formato NCHW, y la salida son logits por clase con la misma resolución espacial.

Su relevancia radica en la digitalización de una tarea agronómica tradicionalmente manual: la estimación visual del porcentaje de residuo de cultivo y cobertura vegetal, métricas clave para la conservación del suelo, la gestión de rastrojos y la monitorización de prácticas agrícolas sostenibles. Al ser un modelo pequeño, ligero y con licencia permisiva, es adecuado para despliegue en campo, aplicaciones móviles y pipelines de teledetección a nivel de parcela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net (CNN encoder-decoder con skip connections) |
| Parametros totales | ~17,5 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 1024 × 1024 píxeles) |
| Tipos de cuantizacion | no disponible (pesos en formato ONNX float32; cuantización INT8 posible vía herramientas ONNX Runtime pero no documentada por el autor) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (opset 17) |

## Arquitectura y entrenamiento

La arquitectura es una U-Net, una red neuronal convolucional con estructura encoder-decoder y conexiones de salto (skip connections) que preservan información espacial de alta resolución. El modelo recibe tensores de forma `[batch, 3, height, width]` con valores RGB normalizados (píxel/255) y produce tensores `[batch, 3, height, width]` con un logit por clase (0 = suelo, 1 = planta, 2 = residuo). Las dimensiones de altura y anchura deben ser múltiplos de 16; el modelo se evaluó a 1024 × 1024 píxeles (aproximadamente 1 mm por píxel en la captura original).

El entrenamiento se realizó sobre el dataset Stover: 5.000 imágenes de campos agrícolas de Kansas a 1024 × 1024 píxeles con etiquetas a nivel de píxel. El conjunto de test independiente consta de 526 imágenes no utilizadas durante el entrenamiento. No se documenta en la información disponible el número total de tokens, la composición exacta del dataset ni si se emplearon técnicas de aumento de datos o regularización específicas. Tampoco se detalla si hubo ajuste fino con RLHF o DPO, lo cual es esperable que no aplique dado que se trata de un modelo de segmentación supervisada.

## Capacidades

- Segmentación semántica de imágenes a nivel de píxel en tres clases: suelo desnudo, dosel vegetal verde y residuo de cultivo.
- Estimación del porcentaje de cobertura de cada clase sobre el área de la imagen, mediante el conteo de píxeles asignados a cada categoría.
- Procesamiento de imágenes RGB cenitales capturadas a aproximadamente 1 m de altura sobre el suelo, cubriendo un área de aproximadamente 1 m × 1 m.
- Entrada de resolución variable, con la restricción de que altura y anchura sean múltiplos de 16; evaluación de referencia a 1024 × 1024.
- Inferencia ligera y portable gracias al formato ONNX, ejecutable con ONNX Runtime en CPU y GPU.
- Integración en aplicaciones web y de escritorio (Stover web app y Windows app).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Estimación de cobertura de residuo de cultivo en parcelas: el modelo permite calcular el porcentaje de rastrojo sobre el suelo a partir de fotografías cenitales, sustituyendo la estimación visual manual y aportando mediciones objetivas y repetibles para programas de conservación agrícola.
- Monitorización de prácticas de conservación del suelo: integrado en aplicaciones de campo, permite a agricultores y técnicos documentar la cobertura vegetal y de residuos tras la cosecha, con un error por imagen de aproximadamente ±3,2 % para residuo y suelo y ±0,5 % para planta.
- Investigación agronómica y ensayos de campo: el modelo puede procesar lotes de imágenes capturadas con protocolos estandarizados (cámara a 1 m, encuadre cenital) para generar variables de cobertura en experimentos de manejo de residuos, rotaciones y siembra directa.
- Digitalización de cuadernos de campo: la aplicación Stover permite al usuario fotografiar el suelo y obtener automáticamente las fracciones de suelo, planta y residuo, reduciendo el tiempo de muestreo y eliminando la subjetividad del observador.
- Teledetección a nivel de parcela y validación de índices de vegetación: las estimaciones de cobertura del modelo pueden servir como verdad de campo para calibrar índices de vegetación derivados de imágenes aéreas o satelitales en estudios de cobertura fraccional.
- Despliegue en dispositivos de borde: al ser un modelo de ~17,5 M de parámetros en ONNX, puede ejecutarse en equipos modestos o en el navegador mediante ONNX Runtime Web, facilitando su uso en aplicaciones móviles y portátiles de campo sin conexión a internet.
- Educación y divulgación agronómica: la herramienta permite mostrar de forma cuantitativa la importancia de la cobertura del suelo y del residuo en demostraciones de conservación.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre un conjunto de test de 526 imágenes no utilizadas en el entrenamiento:

| Métrica | Valor |
|---|---|
| Precisión de píxel (pixel accuracy) | 0,972 |
| IoU medio (mean IoU) | 0,940 |
| IoU suelo / planta / residuo | 0,939 / 0,931 / 0,951 |
| Error de cobertura por imagen (rango del 95 %) | ±3,2 % residuo, ±3,2 % suelo, ±0,5 % planta |

No se han publicado en la información disponible comparaciones con otros modelos de segmentación en la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con ~17,5 M de parámetros en float32, los pesos ocupan aproximadamente 70 MB, y la inferencia a 1024 × 1024 requiere memoria adicional para activaciones, estimada en el orden de cientos de MB a pocos GB según el lote.
- GPU recomendadas: no especificadas por el autor; cualquier GPU con soporte para ONNX Runtime (CUDA o TensorRT) es adecuada, incluidas NVIDIA RTX 4090, A100 o H100 para procesamiento por lotes a gran escala.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer con al menos 2-4 GB de VRAM para inferencia a 1024 × 1024 en float32; también puede ejecutarse en CPU.
- Opciones de despliegue: ONNX Runtime (CPU y GPU), ONNX Runtime Web para navegador, integración en aplicaciones de escritorio y web; no se documentan otros runtimes como vLLM, llama.cpp o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma tarea (segmentación de suelo, dosel y residuo en imágenes de campo) en la documentación proporcionada. Como referencia genérica de arquitectura, la U-Net original (Ronneberger et al., 2015) es el antecedente directo, pero no se han publicado comparaciones de rendimiento con Stover U-Net en la información disponible.

| Modelo | Parámetros | Contexto/entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Stover U-Net | ~17,5 M | 1024 × 1024 píxeles | Segmentación suelo/planta/residuo | CC BY 4.0 | ONNX en Hugging Face |
| U-Net original | ~31 M (configuración original) | variable | Segmentación biomédica | no disponible | múltiples implementaciones |
| Otros modelos de segmentación agrícola | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgo geográfico: las imágenes de entrenamiento provienen de campos de Kansas (EE. UU.), por lo que la precisión puede ser menor en otros cultivos, tipos de residuo o suelos.
- El modelo no puede detectar residuo oculto bajo el dosel vegetal, lo que puede infraestimar la cobertura de residuo en imágenes con vegetación densa.
- Requiere un protocolo de captura específico: fotografía cenital a aproximadamente 1 m de altura, cubriendo ~1 m × 1 m, con recorte del cuadrado central y redimensionado a 1024 × 1024; desviaciones del protocolo pueden degradar el rendimiento.
- Restricción de entrada: altura y anchura deben ser múltiplos de 16.
- Riesgo de alucinación no aplica en el sentido de modelos generativos, pero sí existe riesgo de clasificación errónea de píxeles en condiciones de iluminación, textura o tipos de suelo no representados en el entrenamiento.
- Licencia CC BY 4.0: permite uso comercial con atribución; es obligatorio citar el paper de Patrignani, Bisheh y Nahitiya (Agronomy Journal, en prensa) al utilizar el modelo.
- No es un modelo de lenguaje: no soporta idiomas, tool calling ni razonamiento multi-paso.
- Advertencia para producción: el modelo se distribuye como ONNX sin documentación sobre cuantización, versionado de dependencias ni pruebas de robustez fuera del conjunto de test original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/apatrig/stover-unet
- Dataset Stover: https://huggingface.co/datasets/apatrig/stover
- Aplicación web Stover: https://soilwater.github.io/stover
- Paper de referencia: Patrignani, A., Bisheh, M., & Nahitiya, D. (en prensa). Segmenting crop residue, canopy, and soil in field images: An open dataset and the Stover tool. *Agronomy Journal*.
- Contacto del autor: andrespatrignani@ksu.edu (Department of Agronomy, Kansas State University)

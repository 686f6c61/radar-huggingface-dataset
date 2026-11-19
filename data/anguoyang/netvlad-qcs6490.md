# anguoyang/netvlad-qcs6490

## Resumen

NetVLAD es una arquitectura de recuperación de imágenes basada en VGG16 que genera descriptores globales de 32.768 dimensiones, diseñada originalmente para tareas de localización visual (visual place recognition). Este repositorio, publicado por anguoyang, no contiene pesos del modelo ni artefactos compilados: es una ficha de medición que documenta el primer perfil público de rendimiento de NetVLAD sobre el SoC Qualcomm QCS6490, montado en el kit Dragonwing RB3 Gen 2 Vision.

El modelo se exportó desde la definición incluida en `qai-hub-models` 0.66.0 y se compiló y perfiló con QNN a través de la API de Qualcomm AI Hub, sin cuantización explícita (fp32 ONNX). El resultado reportado es un tiempo de inferencia estimado por grafo de 218,9 ms para una entrada de imagen de 1×3×480×640 y una salida de 1×32.768.

Su relevancia es práctica para ingeniería de edge: cubre un hueco en la documentación oficial, ya que la versión 0.66.0 de `qai-hub-models` no incluye entrada de rendimiento para NetVLAD en RB3 en su `perf.yaml`. Sirve como referencia de latencia para quienes planifiquen pipelines de recuperación visual en hardware Qualcomm de gama media.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NetVLAD sobre backbone VGG16 (recuperación de imágenes, descriptor global) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | fp32 (ONNX sin cuantización explícita; opciones por defecto de AI Hub) |
| Idiomas soportados | no aplica (procesa imágenes) |
| Licencia | MIT para el modelo upstream; la ficha no publica pesos ni artefactos |
| Formato de pesos | ONNX fp32 (exportado, 59.130.549 bytes); no se distribuyen pesos en este repo |
| Entrada | 1 × 3 × 480 × 640 (imagen RGB) |
| Salida | 1 × 32.768 (descriptor global) |
| Runtime medido | QNN sobre Qualcomm QCS6490 |
| Dispositivo de referencia | Dragonwing RB3 Gen 2 Vision Kit |

## Arquitectura y entrenamiento

NetVLAD combina un extractor convolucional VGG16 con una capa de agregación VLAD (Vector of Locally Aggregated Descriptors) diferenciable, que agrupa descriptores locales en un vector global de 32.768 dimensiones mediante clusters aprendidos. Está pensada para reconocimiento de lugares y recuperación de imágenes por similitud, no para generación de texto.

Sobre el entrenamiento no hay información en la documentación disponible: se desconoce el número de tokens o imágenes, la composición del dataset y si hubo fine-tuning posterior. Este repositorio tampoco aporta detalles de entrenamiento; se limita a documentar el proceso de exportación (ONNX desde `qai-hub-models` 0.66.0) y el perfilado con `submit_inference_job(..., profile=True)`, tomando `execution_summary.estimated_inference_time` como métrica.

## Capacidades

- Extracción de descriptores globales de imagen de 32.768 dimensiones para recuperación visual.
- Reconocimiento de lugares (visual place recognition) y búsqueda de imágenes por similitud.
- Procesamiento de imágenes de resolución 480×640 en un único pase por grafo.
- Ejecución en hardware edge Qualcomm mediante QNN.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso.
- Sin capacidades multilingües (no es un modelo de lenguaje).
- Sin modo thinking, visión generalista ni audio: es un modelo especializado de recuperación.

## Casos de uso

- Localización visual en robótica móvil: el modelo genera descriptores de 32.768 dimensiones que permiten emparejar fotogramas actuales contra un mapa de referencias; sus 218,9 ms por imagen en QCS6490 encajan en bucles de navegación de baja frecuencia.
- Reidentificación de lugares en vehículos autónomos de bajo consumo: el perfil fp32 en RB3 Gen 2 permite validar la viabilidad del pipeline antes de optimizar con cuantización.
- Búsqueda visual en dispositivos de vigilancia: descriptores globales para indexar y recuperar imágenes similares sin enviar datos a la nube.
- Benchmarking de edge AI: sirve como referencia de latencia para comparar QCS6490 con otros SoC en tareas de recuperación de imágenes.
- Prototipado de sistemas de realidad aumentada basados en localización: el descriptor permite estimar la posición aproximada a partir de la escena capturada.
- Validación de pipelines Qualcomm AI Hub: la receta documentada (exportación ONNX, compilación y perfilado con IDs de job) sirve para replicar el flujo con otros modelos de la serie.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Tiempo de inferencia estimado | 218,9 ms (218.883 µs) |
| Entrada | 1 × 3 × 480 × 640 |
| Salida | 1 × 32.768 |
| Dispositivo | Dragonwing RB3 Gen 2 Vision Kit (QCS6490) |
| Runtime | QNN |
| Precisión | fp32 |
| Fecha de medición | 2026-11-18 |
| IDs de job | compilación `j5781q3vp`, perfilado `jp426z08g` |

No se han publicado resultados de benchmarks comparativos adicionales (precisión de recuperación, recall@N) en la información disponible. La cifra es una estimación por grafo, no latencia extremo a extremo de aplicación.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en el SoC QCS6490 (edge), no en GPU de escritorio.
- GPU/dispositivo de referencia: Dragonwing RB3 Gen 2 Vision Kit con Qualcomm QCS6490.
- No se dispone de datos de ejecución en GPU consumer (RTX 4090, etc.) en la información proporcionada.
- Despliegue: runtime QNN mediante Qualcomm AI Hub; exportación previa a ONNX.
- Latencia medida: 218,9 ms por imagen de 480×640 en fp32.
- Throughput estimado: no disponible (la métrica es por grafo, no de pipeline).

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye resultados de otros modelos de recuperación visual (por ejemplo, variantes de NetVLAD, CosPlace o AnyLoc) medidos sobre el mismo hardware, por lo que no es posible establecer una comparación rigurosa.

## Limitaciones y advertencias

- El repositorio no contiene pesos ni artefactos compilados: solo publica números y método.
- La métrica es una estimación de perfilado por grafo (`estimated_inference_time`), no latencia real de aplicación extremo a extremo.
- Medición en fp32 sin cuantización; el rendimiento con cuantización int8 no está documentado.
- Sin datos de precisión de recuperación (recall@N) en la información disponible.
- No hay información sobre sesgos, robustez o dominios de evaluación.
- Licencia upstream MIT, pero conviene verificar los términos de uso comercial de los pesos originales de NetVLAD y de las herramientas de Qualcomm AI Hub.
- Uso limitado a tareas de visión por recuperación; no es un modelo de lenguaje ni un modelo generativo.

## Enlaces

- Hugging Face: https://huggingface.co/anguoyang/netvlad-qcs6490
- Repositorio de benchmarks: https://github.com/anguoyang/qcs-bench

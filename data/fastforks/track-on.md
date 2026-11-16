# fastforks/track-on

## Resumen

Track-On2 (también denominado Track-On-R en su variante afinada) es un modelo de seguimiento de puntos en vídeo ("point tracking") desarrollado por Gorkaydemir Aydemir y colaboradores (Aydemir et al., 2025). Resuelve el problema de rastrear puntos arbitrarios a lo largo de una secuencia de vídeo: dado un vídeo y una serie de puntos de consulta `(t, x, y)`, devuelve la posición de cada punto en cada fotograma y la probabilidad de que sea visible. El repositorio `fastforks/track-on` es una model card de integración: no aloja pesos, sino que documenta cómo el framework fastforks descarga y verifica los pesos originales de los autores.

La arquitectura combina un ViT-Adapter sobre un DINOv3 ViT-S+/16 congelado que codifica cada fotograma en cuatro niveles de características, y un decodificador por consulta que estima la posición fotograma a fotograma contra las características del fotograma y su propia memoria de los últimos 72 fotogramas. El proceso es causal (streaming), lo que permite seguimiento online sin mirar al futuro. Es relevante porque ofrece una implementación práctica y verificable de un tracker de propósito general con requisitos de memoria moderados y soporte de backend optimizado.

El modelo se distribuye en dos variantes: `track-on2` (entrenada sobre datos sintéticos Kubric MOVi-F) y `track-on-r` (afinada sobre vídeo real con pseudo-etiquetas). Ambas dependen de los pesos de DINOv3, que están sujetos a una licencia específica de Meta con condiciones de atribución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ViT-Adapter sobre DINOv3 ViT-S+/16 congelado + decodificador por consulta con memoria y atención deformable |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | memoria de los últimos 72 fotogramas |
| Tipos de cuantización | fp16 (probado); otras no disponibles |
| Idiomas soportados | no aplica (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | MIT AND LicenseRef-DINOv3-License (código MIT; pesos DINOv3 bajo licencia de Meta) |
| Formato de pesos | `.pt` (PyTorch) para los checkpoints; `model.safetensors` para DINOv3 |
| Tarea | keypoint-detection / point tracking |
| Entrada | vídeo (fotogramas en orden) + puntos de consulta `(t, x, y)` |
| Salida | `tracks` (posiciones) y `visibility` (probabilidad de visibilidad) |
| Backends | `portable`, `kernels` |
| Resolución de entrada | cualquier H × W ≥ 32, con padding a múltiplo de 32 |
| Nivel | experimental |

## Arquitectura y entrenamiento

El modelo emplea un ViT-Adapter alrededor de un DINOv3 ViT-S+/16 congelado que codifica cada fotograma en cuatro niveles de características. Cada consulta decodifica su posición fotograma a fotograma comparando contra las características del fotograma y su propia memoria de los últimos 72 fotogramas; a continuación reordena los 16 mejores picos de correlación mediante atención deformable y refina el desplazamiento. Los fotogramas se procesan de forma causal, lo que constituye un tracker en streaming que no requiere acceso a fotogramas futuros.

En cuanto al entrenamiento, `track-on2` se entrenó sobre Kubric MOVi-F (clips sintéticos de 64 fotogramas), mientras que `track-on-r` se afinó sobre vídeos del mundo real utilizando pseudo-etiquetas generadas por un ensemble de trackers que actúa como verificador. El ViT-S+/16 congelado de DINOv3 fue preentrenado sobre LVD-1689M, un dataset no liberado públicamente. No se dispone de información sobre el número total de tokens de entrenamiento ni sobre el uso de RLHF/DPO (no aplicable a esta tarea).

## Capacidades

- Seguimiento de puntos arbitrarios ("tracking any point") a lo largo de secuencias de vídeo.
- Procesamiento causal en streaming: no requiere fotogramas futuros, apto para aplicaciones online.
- Memoria de hasta 72 fotogramas para mantener la identidad de cada punto a lo largo del tiempo.
- Salida de probabilidad de visibilidad por punto y fotograma, útil para filtrar oclusiones.
- Manejo de resoluciones variables (cualquier H × W ≥ 32, con padding a múltiplo de 32); probado hasta 3000×4000.
- Dos backends de ejecución (`portable` y `kernels`) con kernels optimizados para CUDA.
- No soporta tool calling, agentes, ni capacidades multilingües (es un modelo puramente visual).

## Casos de uso

- **Efectos visuales y postproducción**: rastrear puntos de referencia en un plano para anclar elementos CGI o realizar estabilización; la memoria de 72 fotogramas mantiene la coherencia en planos medios.
- **Análisis deportivo**: seguir articulaciones o el balón a lo largo de un clip para calcular trayectorias y velocidades; el procesamiento causal permite análisis en tiempo casi real.
- **Robótica y visión artificial**: seguimiento de puntos de interés en flujos de cámara para estimación de movimiento o SLAM ligero, aprovechando la naturaleza streaming del tracker.
- **Vigilancia y análisis de vídeo**: monitorizar la posición de objetos seleccionados manualmente a lo largo de grabaciones, usando la probabilidad de visibilidad para detectar oclusiones.
- **Biomecánica y análisis de movimiento**: rastrear marcadores o puntos anatómicos en vídeos de laboratorio, con la resolución alta soportada (hasta 3000×4000) para capturar detalle.
- **Anotación asistida de datasets**: propagar puntos anotados en el primer fotograma al resto de la secuencia para acelerar el etiquetado de datos de tracking.
- **Edición de vídeo interactiva**: permitir al usuario seleccionar un punto y seguir su trayectoria para aplicar máscaras o correcciones fotograma a fotograma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (tipo MMLU, HumanEval o métricas de tracking como AJ/δ) en la información disponible. Sí se dispone de métricas de velocidad y memoria medidas por fastforks sobre una RTX 5060 Ti 16 GB (sm_120):

| Modelo | Entrada | Tiempo original (ms) | Portable (ms) | Kernels (ms) | Aceleración vs original | Memoria pico portable (MiB alloc/reserved) | Memoria pico kernels (MiB alloc/reserved) |
|---|---|---|---|---|---|---|---|
| `track-on-r` | 480×854 | 2022 | 1188 | 1102 | 1,8× | 1423 / 1632 | 1368 / 1620 |
| `track-on2` | 480×854 | 1953 | 1194 | 1109 | 1,8× | 1423 / 1572 | 1368 / 1620 |

| Modelo | Carga original (s) | Carga portable (s) | Carga kernels (s) | Primera llamada original (s) | Primera llamada portable (s) | Primera llamada kernels (s) |
|---|---|---|---|---|---|---|
| `track-on-r` | 0,88 | 0,24 | 1,11 | 2,91 | 1,99 | 1,72 |
| `track-on2` | 3,77 | 0,66 | 0,27 | 3,63 | 2,27 | 1,78 |

`torch.compile` quedó diferido (build > 5 min) y TensorRT fp16 está planificado para la versión 0.2.1.

## Requisitos de hardware

- **VRAM estimada**: aproximadamente 1,4 GiB de memoria pico asignada y 1,6 GiB reservada para entrada 480×854 en fp16; hasta 5,0 GiB asignados y 6,0 GiB reservados para entrada 3000×4000.
- **GPU probada**: RTX 5060 Ti 16 GB (sm_120).
- **Cabe en GPU de consumo**: sí, en tarjetas con al menos 6-8 GB de VRAM para resoluciones altas; para 480×854 basta con ~2 GB.
- **Opciones de despliegue**: framework fastforks (backends `portable` y `kernels`); el backend `kernels` usa kernels optimizados publicados en `fastforks/kernels`. Soporte de `torch.compile` diferido y TensorRT planificado.
- **Latencia y throughput**: ~1,1 s por clip de 480×854 con backend `kernels`; ~1,2 s con `portable`; la primera llamada tarda entre 1,7 y 2,3 s según backend.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de precisión ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible. Cualitativamente, Track-On2 se sitúa en la categoría de trackers de puntos de propósito general basados en ViT (frente a enfoques como CoTracker o TAPIR, no evaluados aquí). La comparación con estos modelos queda como no disponible.

## Limitaciones y advertencias

- **Licencia de DINOv3**: los pesos del backbone están bajo la DINOv3 License de Meta, con condiciones de atribución y restricciones que deben revisarse antes de un uso comercial, pese a que el código y los checkpoints de Track-On son MIT.
- **Pesos no alojados**: el repositorio es solo una model card; los pesos deben descargarse de los repositorios de los autores y verificarse contra los SHA-256 indicados.
- **Nivel experimental**: el propio autor clasifica el modelo como "experimental"; no se recomienda para producción sin validación adicional.
- **Riesgo de deriva en secuencias largas**: la memoria se limita a 72 fotogramas, por lo que puntos que desaparezcan y reaparezcan más allá de esa ventana pueden perder la identidad.
- **Dependencia de la calidad del backbone**: al usar un DINOv3 congelado, el rendimiento está acotado por las características de ese modelo.
- **Sin benchmarks de precisión publicados**: no hay métricas de exactitud de tracking en la información disponible, lo que dificulta evaluar su calidad frente a alternativas.
- **Sesgos**: no se documentan sesgos específicos, pero al ser un modelo visual entrenado con datos sintéticos y vídeo real con pseudo-etiquetas, puede heredar sesgos de esos datasets.
- **Idioma**: no aplica, pero tampoco procesa texto; no es adecuado para tareas multimodales de lenguaje.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/track-on
- Repositorio de código fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Código original de Track-On: https://github.com/gorkaydemir/track_on (commit `04efe8a137bd`)
- Pesos `track-on2`: https://huggingface.co/gorkaydemir/track_on2
- Pesos `track-on-r`: https://huggingface.co/gorkaydemir/track_on_r
- DINOv3 ViT-S+/16: https://huggingface.co/facebook/dinov3-vits16plus-pretrain-lvd1689m
- Documentación de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Evidencia de licencia (README original): https://huggingface.co/gorkaydemir/track_on2/blob/672a47c4614f6d661edc36b7999a5bb5c3a5d2c9/README.md

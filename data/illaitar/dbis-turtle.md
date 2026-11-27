# Illaitar/dbis-Turtle

## Resumen

dbis-Turtle es un modelo de restauración de vídeo especializado en eliminación de desenfoque de movimiento (motion deblurring), empaquetado en PyTorch puro por el usuario Illaitar a partir del checkpoint oficial del método Turtle, presentado en NeurIPS 2024 con el título "Learning Truncated Causal History Model for Video Restoration". El modelo resuelve el problema de recuperar secuencias de vídeo nítidas a partir de grabaciones con desenfoque de movimiento, una tarea clásica de restauración de imagen y vídeo que resulta crítica en postproducción, visión por computador y mejora de material de archivo.

La relevancia de esta ficha no está en un modelo lingüístico, sino en un artefacto de inferencia reproducible: el autor ha reimplementado el método en PyTorch sin dependencias del código original de Ascend-Research y ha publicado dos variantes de pesos, `dbis-Turtle` (fidelidad exacta, 236 MB, float32) y `dbisf-Turtle` (versión rápida y ligera, 68 MB), con diferencias de rendimiento medidas sobre el benchmark GoPro. El repositorio incluye el pipeline de conversión desde el checkpoint original y verificación de integridad mediante sha256.

El modelo se distribuye bajo licencia MIT, con la advertencia de que los pesos conservan los términos del checkpoint de origen, y está pensado para integrarse en flujos de trabajo de restauración de vídeo mediante una API Python sencilla (`dbis.load` y `net.restore`) o mediante la CLI `python -m dbis.run`. No es un modelo generativo de texto ni multimodal: es un modelo image-to-image orientado a vídeo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal para restauración de vídeo basada en el método Turtle (Truncated Causal History Model, NeurIPS 2024); implementación en PyTorch puro |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; procesa secuencias de fotogramas de vídeo, longitud no especificada |
| Tipos de cuantizacion | float32 en los ficheros `.safetensors`; formato propietario `wpack` en los ficheros `.wpk` |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT (los pesos conservan los términos del checkpoint de origen; ver `LICENSE.md` y `licenses/`) |
| Formato de pesos | `.safetensors` (float32) y `.wpk` (formato wpack del repositorio, requiere zstandard) |

## Arquitectura y entrenamiento

El modelo implementa el método Turtle, un modelo de historia causal truncada para restauración de vídeo publicado en NeurIPS 2024 por el equipo de Ascend-Research. La arquitectura procesa secuencias de fotogramas y explota la información temporal de fotogramas anteriores para estimar el desenfoque y restaurar cada fotograma, manteniendo una ventana de historia causal truncada que limita el coste computacional frente a enfoques que atienden a toda la secuencia. La implementación publicada aquí es una reescritura en PyTorch puro del código original, con conversión del checkpoint GoPro de los autores mediante `python -m dbis.convert`.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO, ya que la model card no los detalla y el material proporcionado se limita al proceso de conversión y a las métricas de inferencia. El checkpoint de origen es el entrenado por los autores sobre el conjunto GoPro, y la variante `dbisf-Turtle` es una versión optimizada del mismo que reduce el tiempo de ejecución y el tamaño del fichero a costa de una pérdida máxima de 0,05 dB de PSNR medio en cada conjunto de test del benchmark.

## Capacidades

- Restauración de desenfoque de movimiento en vídeo: procesa secuencias de fotogramas (`[T, 3, H, W]`), lotes (`[B, T, 3, H, W]`) o imágenes individuales (`[3, H, W]`).
- Eliminación de desenfoque en imagen fija mediante el mismo pipeline de restauración.
- Procesamiento de clips completos a partir de una carpeta de fotogramas o de un fichero de vídeo mediante la CLI `python -m dbis.run`.
- Dos variantes de inferencia: `dbis-Turtle` con fidelidad exacta respecto al checkpoint de los autores y `dbisf-Turtle` con menor latencia y menor huella de disco.
- Verificación de integridad de los pesos mediante sha256 en la primera carga desde el repositorio.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Postproducción de vídeo: restaurar material grabado con desenfoque de movimiento por exposición larga o movimiento de cámara, aplicando `net.restore` sobre la secuencia de fotogramas antes del montaje final.
- Mejora de material de archivo: recuperar nitidez en grabaciones antiguas o de baja calidad donde el desenfoque de movimiento degrada la percepción de detalle.
- Preprocesado para visión por computador: limpiar secuencias antes de tareas de detección, seguimiento o reconocimiento, donde el desenfoque reduce la precisión de los modelos posteriores.
- Vídeo de drones y cámaras en movimiento: corregir el desenfoque causado por el desplazamiento rápido de la plataforma, usando la ventana de historia causal del modelo para mantener coherencia temporal entre fotogramas.
- Restauración de vídeo de vigilancia: mejorar la legibilidad de matrículas o rostros en grabaciones con movimiento, procesando clips completos con la CLI sobre carpetas de fotogramas.
- Investigación en restauración de vídeo: servir como referencia reproducible del método Turtle para comparar variantes, gracias a la implementación en PyTorch puro y a las métricas publicadas sobre GoPro.
- Integración en pipelines de edición automatizada: incorporar `dbis.load` y `net.restore` en scripts de procesamiento por lotes, con la variante `dbisf-Turtle` cuando la latencia sea el factor limitante.

## Benchmarks y rendimiento

Los únicos datos disponibles son los de la model card, medidos sobre el conjunto GoPro con el arnés de latencia del benchmark, en una A100 con batch 1:

| Variante | Tamano | PSNR GoPro (dB) | Tiempo por fotograma 720p |
|---|---:|---:|---:|
| `dbis-Turtle.safetensors` | 236 MB | 34,5598 (autores: 34,5598) | 723,9 ms (autores: 760,9 ms) |
| `dbisf-Turtle.wpk` | 68 MB | 34,5316 | 198,7 ms |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint float32 de 236 MB implica una huella de pesos modesta, pero el consumo real depende de la resolución y de la longitud de la secuencia procesada.
- GPU recomendadas: los tiempos publicados se midieron en una NVIDIA A100; no se especifican otras GPU en la información disponible.
- Compatibilidad con GPU de consumo: no confirmada en la información proporcionada; el tamaño reducido de los pesos sugiere que podría caber en GPU de consumo, pero no hay datos que lo verifiquen.
- Opciones de despliegue: la librería `deblurring-is-solved` (instalable vía pip desde GitHub), la CLI `python -m dbis.run` y la API Python `dbis.load` / `net.restore`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 723,9 ms por fotograma 720p con `dbis-Turtle` y 198,7 ms con `dbisf-Turtle`, medidos en A100 con batch 1.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | PSNR GoPro | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| dbis-Turtle | Restauración de vídeo (Turtle, PyTorch puro) | 236 MB | 34,5598 dB | MIT (pesos con términos del checkpoint original) | Hugging Face |
| dbisf-Turtle | Restauración de vídeo (Turtle, versión rápida) | 68 MB | 34,5316 dB | MIT (pesos con términos del checkpoint original) | Hugging Face |
| Turtle original (Ascend-Research) | Restauración de vídeo (implementación de los autores) | no disponible | 34,5598 dB | no disponible en la información proporcionada | GitHub de Ascend-Research |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en desenfoque de movimiento; no está diseñado para otros tipos de degradación (ruido, compresión, desenfoque de foco) salvo que el checkpoint de origen los cubra, extremo no confirmado.
- No es un modelo de lenguaje: no soporta generación de texto, razonamiento, código ni capacidades multilingües.
- Riesgo de artefactos y alucinaciones visuales: como todo modelo de restauración, puede generar detalles plausibles pero inexistentes en zonas muy degradadas.
- La licencia MIT del repositorio no sustituye a los términos del checkpoint de origen; es obligatorio revisar `LICENSE.md` y `licenses/` antes de un uso comercial.
- La citación del paper del método es un requisito explícito del autor al usar los pesos.
- Los tiempos de inferencia publicados corresponden a una A100 con batch 1; el rendimiento en otras GPU o con secuencias más largas no está documentado.
- La variante `dbisf-Turtle` sacrifica hasta 0,05 dB de PSNR medio en cada conjunto de test, por lo que no es adecuada cuando se exige fidelidad máxima.
- El formato `.wpk` requiere la dependencia `zstandard`, lo que añade un requisito adicional frente a los `.safetensors`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Illaitar/dbis-Turtle
- Repositorio del proyecto: https://github.com/illaitar/deblurring-is-solved
- Sitio del benchmark: https://illaitar.github.io/deblurring-is-solved/
- Código original de los autores (Turtle): https://github.com/Ascend-Research/Turtle

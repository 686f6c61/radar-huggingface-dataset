# Illaitar/dbisf-Turtle

## Resumen

dbisf-Turtle es una implementación en PyTorch puro del modelo Turtle, presentado en el paper "Learning Truncated Causal History Model for Video Restoration" (NeurIPS 2024). Lo publica el usuario Illaitar dentro del proyecto "deblurring is solved?" (dbis), un banco de pruebas independiente para evaluar técnicas de eliminación de desenfoque de movimiento en vídeo. El modelo resuelve un problema concreto de restauración de imagen: recuperar fotogramas nítidos a partir de secuencias de vídeo afectadas por desenfoque de movimiento, explotando la información temporal entre fotogramas adyacentes.

La relevancia de esta variante radica en su eficiencia: parte del checkpoint original de los autores (entrenado sobre GoPro) y lo convierte a un formato propio (`.wpk`) que ocupa 68 MB frente a los 237 MB del original, con un tiempo de inferencia de 198,7 ms por fotograma a 720p en una A100, frente a los 760,9 ms del código de referencia. La pérdida de calidad es marginal: 34,5316 dB de PSNR medio en GoPro frente a 34,5598 dB del original, es decir, 0,0282 dB por debajo.

Se trata de un modelo especializado de image-to-image (vídeo a vídeo) con licencia MIT, sin capacidades de lenguaje ni de propósito general. Su utilidad está acotada a pipelines de restauración de vídeo donde el rendimiento por fotograma y el tamaño del artefacto son críticos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Turtle (truncated causal history, transformer causal para restauración de vídeo), reimplementado en PyTorch puro |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa secuencias de fotogramas; la ventana temporal no se especifica en la información proporcionada) |
| Tipos de cuantizacion | no disponible (pesos en formato `.wpk`, presumiblemente punto flotante; no se documenta cuantización) |
| Idiomas soportados | no aplica (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | MIT (hereda los términos del checkpoint original; ver `LICENSE.md` y `licenses/`) |
| Formato de pesos | `.wpk` (formato wpack del proyecto dbis, requiere zstandard); checkpoint fuente en formato de los autores |
| Tamano del artefacto | 68 MB (`dbisf-Turtle.wpk`) |
| Entrada / salida | fotogramas `[T, 3, H, W]`, `[B, T, 3, H, W]` o `[3, H, W]`; salida de vídeo restaurado |
| Resolución de referencia | 720p (métricas de latencia medidas a esa resolución) |

## Arquitectura y entrenamiento

Turtle es un modelo de restauración de vídeo basado en un mecanismo de "historia causal truncada": en lugar de atender a toda la secuencia de fotogramas, limita la ventana de atención a un historial causal acotado, lo que reduce el coste computacional y de memoria frente a alternativas de atención global sobre el eje temporal. La reimplementación de Illaitar mantiene la arquitectura pero la reescribe en PyTorch puro, eliminando dependencias del código original y reduciendo el tamaño del artefacto mediante el formato `.wpk` del proyecto dbis.

El entrenamiento no se ha realizado en esta variante: los pesos proceden del checkpoint GoPro publicado por los autores (Ascend-Research/Turtle) y se convierten mediante `python -m dbis.convert`. Por tanto, los datos de entrenamiento (composición del dataset, número de tokens o fotogramas, uso de RLHF u otras técnicas) corresponden al modelo original y no se detallan en la información proporcionada. La innovación destacable de esta ficha es de ingeniería: mismo método, artefacto 3,5 veces más pequeño y latencia 3,8 veces menor, con degradación de PSNR inferior a 0,05 dB en todos los conjuntos de test del benchmark.

## Capacidades

- Restauración de vídeo con desenfoque de movimiento (motion deblurring) a partir de secuencias de fotogramas.
- Restauración de imagen individual: acepta un tensor `[3, H, W]` además de secuencias y lotes.
- Procesamiento por lotes de clips (`[B, T, 3, H, W]`).
- Explotación de información temporal entre fotogramas adyacentes mediante historia causal truncada.
- Integración como pipeline image-to-image en PyTorch.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión semántica, tool calling, capacidades de agente ni multilingüismo.

## Casos de uso

- Restauración de vídeo grabado con cámara en movimiento: el modelo corrige el desenfoque de motion blur fotograma a fotograma aprovechando la coherencia temporal, adecuado para material de drones, acción o deporte grabado a pulso.
- Postproducción y remasterización: limpieza de archivos de vídeo antiguos o de baja calidad antes de reescalado o edición, con un coste de 198,7 ms por fotograma a 720p que permite procesar clips completos en minutos.
- Preprocesado para pipelines de visión por computador: mejorar la nitidez de fotogramas antes de tareas de detección, seguimiento o segmentación, donde el desenfoque degrada la precisión de los modelos posteriores.
- Vigilancia y vídeo de tráfico: recuperación de matrículas o detalles en grabaciones con movimiento de cámara, gracias al procesamiento por lotes de clips.
- Restauración en dispositivos con recursos limitados: el artefacto de 68 MB y la implementación en PyTorch puro facilitan el despliegue en entornos donde el checkpoint original de 237 MB resulta excesivo.
- Investigación en restauración de vídeo: banco de pruebas reproducible para comparar métodos de deblurring bajo el harness de latencia del proyecto dbis, con métricas PSNR sobre los 1.111 fotogramas de test de GoPro.

## Benchmarks y rendimiento

| Metrica | dbisf-Turtle | Autores (Turtle original) |
|---|---:|---:|
| PSNR medio en GoPro (1.111 fotogramas, salida 8 bits) | 34,5316 dB | 34,5598 dB |
| Diferencia de PSNR | −0,0282 dB | referencia |
| Tiempo por fotograma a 720p (A100, batch 1) | 198,7 ms | 760,9 ms |
| Tamano del artefacto | 68 MB | 237 MB |

Los datos de PSNR y latencia proceden del harness del benchmark dbis y están documentados en `DBIS.md` del repositorio. No se han publicado resultados de otros benchmarks (por ejemplo, conjuntos distintos de GoPro) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el tamaño del artefacto (68 MB) sugiere requisitos moderados, pero la memoria depende de la resolución y de la longitud de la secuencia de fotogramas.
- GPU de referencia del benchmark: A100 (batch 1, 720p, 198,7 ms por fotograma).
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; al ser PyTorch puro, es probable que funcione en RTX 3090/4090 si la memoria alcanza para la resolución y el clip, pero no hay datos publicados.
- Opciones de despliegue: paquete `deblurring-is-solved` (instalación vía `pip install "deblurring-is-solved @ git+https://github.com/illaitar/deblurring-is-solved"`), API Python `dbis.load("dbisf-Turtle")` y CLI `python -m dbis.run`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de restauración de vídeo).
- Throughput y latencia: 198,7 ms por fotograma a 720p en A100 con batch 1; el throughput con lotes mayores no se especifica.

## Comparativa con modelos similares

| Modelo | Tipo | PSNR GoPro | Latencia 720p (A100) | Tamano | Licencia |
|---|---|---:|---:|---:|---|
| dbisf-Turtle | Turtle reimplementado, PyTorch puro | 34,5316 dB | 198,7 ms | 68 MB | MIT |
| Turtle (autores) | Turtle original | 34,5598 dB | 760,9 ms | 237 MB | ver términos de los autores |
| dbis-Turtle | Mismo método con salidas de los autores | no disponible | no disponible | no disponible | MIT |

No se dispone de datos de otros modelos de deblurring de vídeo (por ejemplo, variantes de Restormer o modelos específicos de motion deblurring) en la información proporcionada, por lo que la comparativa se limita a las variantes del propio método.

## Limitaciones y advertencias

- Especialización estricta: solo realiza restauración de desenfoque; no sirve para generación de texto, razonamiento ni otras tareas.
- Dependencia del checkpoint original: los pesos se derivan del modelo de los autores y heredan sus términos de licencia; es obligatorio citar el paper de Turtle al usar los pesos.
- Calidad ligeramente inferior al original: 0,0282 dB menos de PSNR medio en GoPro, con la garantía del autor de no superar 0,05 dB de pérdida en ningún conjunto de test del benchmark.
- Formato propietario: los pesos usan `.wpk` (wpack) y requieren la librería `zstandard`; no son directamente compatibles con otros frameworks sin conversión.
- Sin datos de sesgos, alucinación o limitaciones idiomáticas: al ser un modelo de visión, estas categorías no aplican, pero tampoco se documentan fallos específicos por tipo de escena, iluminación o movimiento.
- Longitud de secuencia y memoria: no se especifica la ventana temporal máxima ni el consumo de VRAM, lo que dificulta planificar despliegues con clips largos o resoluciones superiores a 720p.
- Verificación de integridad: la carga comprueba el sha256 del archivo en el primer uso; en entornos sin red o con proxies puede requerir configuración adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Illaitar/dbisf-Turtle
- Variante con salidas de los autores: https://huggingface.co/Illaitar/dbis-Turtle
- Colección dbis: https://huggingface.co/collections/Illaitar/dbis-6b09930cbf629d8d89c027ba
- Repositorio del proyecto: https://github.com/illaitar/deblurring-is-solved
- Documentación del benchmark: https://github.com/illaitar/deblurring-is-solved/blob/main/DBIS.md
- Sitio del benchmark: https://illaitar.github.io/deblurring-is-solved/
- Código original de los autores: https://github.com/Ascend-Research/Turtle

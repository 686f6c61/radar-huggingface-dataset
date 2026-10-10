# antv311/propainter-mlx-weights

## Resumen

`antv311/propainter-mlx-weights` es un repositorio de pesos, no un modelo de lenguaje: contiene los checkpoints de ProPainter (ICCV 2023) para *video inpainting* convertidos a safetensors para MLX, junto con las dos redes de flujo óptico que el pipeline necesita. En total son cuatro ficheros con unos 69,5 millones de parámetros en fp32 (~278 MB), más un `manifest.json` con el SHA-256, el tensor de origen y la forma de cada peso.

El problema que resuelve es de portabilidad: el ProPainter original solo se distribuye como código y checkpoints de PyTorch con pesos en formato *channel-first* (NCHW). Esta conversión los reordena a NHWC, que es el layout nativo de MLX, y los publica como safetensors, de modo que se pueden ejecutar en Apple Silicon sin instalar PyTorch en ningún punto del proceso. No hay reentrenamiento ni cuantización: los valores son los originales tal cual se publicaron.

Es relevante ahora porque MLX se ha consolidado como la vía práctica para inferencia nativa en Mac, y los modelos de visión/vídeo suelen quedar fuera de esos ports por la complejidad de la conversión de layouts y de las operaciones *unfold*. El autor documenta cada regla de conversión y verifica la paridad contra el modelo de PyTorch con errores relativos entre 1e-6 y 2,5e-4. La licencia S-Lab 1.0 limita el uso a fines no comerciales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional + transformer para video inpainting (ProPainter), con RAFT/SEA-RAFT como estimadores de flujo óptico y una red recurrente de completado de flujo. No es un transformer decoder autorregresivo |
| Parametros totales | 69,5 M en total: 39,4 M (ProPainter InpaintGenerator) + 5,1 M (RecurrentFlowCompleteNet) + 5,3 M (RAFT things) + 19,7 M (SEA-RAFT-M spring 540x960) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; la ventana de trabajo es el número de fotogramas del clip, no una secuencia de tokens |
| Tipos de cuantizacion | Ninguno publicado: los pesos se distribuyen en fp32, "as released". MLX permite convertir a otras precisiones, pero el autor no publica variantes cuantizadas |
| Idiomas soportados | No disponible / no aplica (modelo de visión, sin capacidad de texto) |
| Licencia | ProPainter y RecurrentFlowCompleteNet: S-Lab License 1.0 (solo uso no comercial). RAFT y SEA-RAFT: BSD-3-Clause |
| Formato de pesos | Safetensors con layout NHWC para MLX |

## Arquitectura y entrenamiento

ProPainter combina propagación por flujo óptico con un transformer de *soft split*/*soft comp*: el flujo se estima con RAFT o SEA-RAFT, se completa con `RecurrentFlowCompleteNet` (que rellena las regiones ocluidas o enmascaradas) y el `InpaintGenerator` reconstruye los píxeles. Esta conversión no entrena nada: el autor solo reordena los tensores del *release* v0.1.0 de ProPainter y del checkpoint `Tartan-C-T-TSKH-spring540x960-M` de SEA-RAFT alojado en MemorySlices.

Las transformaciones aplicadas son mecánicas y verificables: se eliminan los prefijos `module.` (RAFT se guardó desde `DataParallel`), se reordenan las convoluciones de `(O, I, kH, kW)` a `(O, kH, kW, I)` y las convoluciones 3D de `(O, I, kT, kH, kW)` a `(O, kT, kH, kW, I)`, se reorganizan los embeddings SoftSplit/SoftComp y las capas `fc1`/`fc2` de FusionFeedForward del orden *channel-major* de `unfold` a `(taps, C)`, y se descartan los tensores exclusivos de entrenamiento (la cabeza de bordes del completado de flujo, `num_batches_tracked` de BatchNorm y un buffer que el modelo recalcula). Cada clave del modelo original tiene una regla de mapeo explícita y cada tensor se comprueba contra los modelos de MLX.

El repositorio no incluye datos de entrenamiento, número de tokens ni información sobre RLHF/DPO, porque no es un modelo de lenguaje. Los detalles de entrenamiento de ProPainter, RAFT y SEA-RAFT están en sus respectivos papers (ICCV 2023, ECCV 2020 y arXiv 2405.14793).

## Capacidades

- Video inpainting guiado por máscara: elimina objetos, personas o elementos concretos y rellena el hueco de forma coherente en el tiempo.
- Eliminación de objetos en vídeo con máscaras cuadradas o máscaras con forma de logotipo, tal como se verifica en el test de paridad (running_car, 62,0 y 62,4 dB de PSNR respectivamente).
- Outpainting de vídeo (extensión del encuadre más allá de los bordes originales), verificado a 54,0 dB de PSNR en el test de paridad.
- Estimación de flujo óptico mediante dos alternativas independientes: RAFT (5,3 M parámetros) y SEA-RAFT-M a resolución spring 540x960 (19,7 M parámetros).
- Completado de flujo óptico recurrente en regiones ocluidas o enmascaradas mediante `RecurrentFlowCompleteNet`.
- Ejecución nativa en Apple Silicon a través de MLX, sin dependencia de PyTorch ni de CUDA.
- No dispone de generación de texto, razonamiento, código, matemáticas, tool calling, capacidades de agente ni procesamiento de audio: no es un modelo de lenguaje y esas categorías no aplican.

## Casos de uso

- Eliminación de objetos no deseados en postproducción audiovisual: se introduce una máscara por fotograma y el modelo reconstruye el fondo con coherencia temporal, evitando el parpadeo típico de los métodos fotograma a fotograma.
- Borrado de marcas de agua o logotipos superpuestos: la paridad publicada con máscaras de tipo logo (62,4 dB) indica que el modelo está específicamente validado para este patrón de máscara.
- Limpieza de subtítulos quemados en material de archivo: al ser una máscara estática por tramos, el completado recurrente de flujo mantiene el fondo estable entre fotogramas.
- Reencuadre y outpainting de vídeo vertical/horizontal: el pipeline `compat` soporta extensión de bordes, útil para adaptar material rodado en 16:9 a formatos sociales.
- Restauración de metraje histórico digitalizado: eliminación de arañazos, marcas de empalme o sellos de archivo que ocupan regiones fijas del encuadre.
- Anonimización de material rodado: borrado de matrículas, rostros o carteles identificativos antes de publicar un vídeo o de usarlo como dataset.
- Limpieza de retransmisiones deportivas: eliminación de elementos gráficos, balones fuera de juego o marcas publicitarias, un escenario directamente alineado con el test de paridad sobre el clip "tennis" (86,0 dB de PSNR).
- Prototipado e investigación en Mac: el port permite reproducir resultados de ProPainter en un portátil Apple Silicon sin montar un entorno CUDA, útil para validar ideas antes de escalar a GPU de datacenter.

## Benchmarks y rendimiento

Los únicos datos publicados son métricas de paridad frente al ProPainter de PyTorch, no comparativas de calidad contra otros métodos de inpainting.

| Metrica | Resultado |
|---|---|
| Error relativo por modulo frente a PyTorch fp32 (commit e870e79) | 1e-6 a 2,5e-4 |
| PSNR end-to-end, bmx-trees | 58,5 dB |
| PSNR end-to-end, tennis | 86,0 dB |
| PSNR end-to-end, running_car con mascara cuadrada | 62,0 dB |
| PSNR end-to-end, running_car con mascara de logo | 62,4 dB |
| PSNR end-to-end, outpainting | 54,0 dB |
| Error relativo de SEA-RAFT frente al modelo oficial de PyTorch | 3,7e-5 |

No se han publicado resultados de benchmarks de calidad (PSNR/SSIM/FID frente a otros métodos de video inpainting) en la información disponible.

## Requisitos de hardware

- Peso de los pesos en memoria: unos 278 MB en fp32, calculado a partir de los 69,5 M de parámetros publicados. Es una cifra derivada, no un dato del autor.
- El consumo real de VRAM lo dominan las activaciones, no los pesos: escala con resolución, número de fotogramas del clip e iteraciones del estimador de flujo. El autor no publica cifras de VRAM. Estimación orientativa (no publicada): clips cortos a 480p pueden moverse en el rango de 4-8 GB; 1080p con secuencias largas requiere bastante más.
- Plataforma objetivo: Apple Silicon con memoria unificada, requisito del port a MLX. No hay soporte CUDA.
- Encaje en hardware de consumo: sí, en Macs con chip de la familia M y memoria unificada suficiente; el límite práctico lo marca el tamaño del clip, no los 278 MB de pesos.
- Opciones de despliegue: MLX (`ml-explore/mlx`) como runtime, y el port `propainter-mlx` de antv311, que descarga los ficheros en el primer uso y los fija por commit y SHA-256. vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Dependen del número de fotogramas, la resolución y de si se usa RAFT (5,3 M parámetros) o SEA-RAFT-M (19,7 M parámetros), que es notablemente más pesado.

## Comparativa con modelos similares

| Modelo | Formato | Parametros | Runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| antv311/propainter-mlx-weights | Safetensors NHWC | 69,5 M (4 redes) | MLX, Apple Silicon | S-Lab 1.0 (no comercial) + BSD-3-Clause para RAFT/SEA-RAFT | HuggingFace, 0.3 GB, 0 descargas |
| ProPainter upstream v0.1.0 | Checkpoints PyTorch | Mismos pesos | PyTorch + CUDA | S-Lab 1.0 (no comercial) | GitHub del autor original |
| Otros metodos de video inpainting previos o alternativos | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparativa significativa aquí es de formato y runtime, no de arquitectura: los pesos son idénticos a los del ProPainter original. La diferencia es que esta versión elimina la dependencia de PyTorch y CUDA y está reordenada para NHWC. No se han proporcionado datos que permitan comparar contra E2FGVI u otros métodos de la misma categoría.

## Limitaciones y advertencias

- Licencia no comercial: ProPainter y `RecurrentFlowCompleteNet` se rigen por S-Lab License 1.0. Cualquier uso comercial requiere permiso explícito de los autores (Dr. Shangchen Zhou y Prof. Chen Change Loy), y los ficheros convertidos heredan esos mismos términos. RAFT y SEA-RAFT son BSD-3-Clause, con condiciones distintas.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, con una única subida. No hay comunidad que haya validado la conversión de forma independiente.
- Cobertura de paridad limitada: la verificación se hizo contra un único commit de PyTorch (e870e79) y sobre cuatro clips de prueba. No hay validación publicada sobre otros datasets ni sobre resoluciones distintas de las probadas.
- Riesgo de artefactos: la calidad del inpainting depende críticamente de la máscara y del movimiento de cámara. En oclusiones largas o fondos con texturas repetitivas es habitual que aparezcan parpadeos y desenfoques; los PSNR altos de paridad no implican ausencia de artefactos perceptibles.
- Sin cuantización publicada: los pesos son fp32, lo que redunda en más memoria y más ancho de banda de cómputo que las variantes en fp16/bf16, habituales en inferencia.
- Sin soporte CUDA: el formato NHWC y el runtime MLX lo atan a Apple Silicon. Migrar a NVIDIA implicaría reconvertir los pesos al layout NCHW del ProPainter original, que ya existe.
- Sin capacidades de lenguaje: no sirve para tareas de texto, agentes, tool calling ni razonamiento multilingüe, pese a que la estructura de ficha habitual pueda sugerir lo contrario.
- Fecha de creación del repositorio inusual: el registro de HuggingFace indica 2026-10-09, lo que conviene verificar antes de citar el repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/antv311/propainter-mlx-weights
- Port a MLX: https://github.com/antv311/Propainter-MLX
- Perfil del autor: https://github.com/antv311
- ProPainter original: https://github.com/sczhou/ProPainter
- Release v0.1.0 de ProPainter (origen de los checkpoints): https://github.com/sczhou/ProPainter/releases/tag/v0.1.0
- MLX: https://github.com/ml-explore/mlx
- Checkpoint de SEA-RAFT usado (Tartan-C-T-TSKH-spring540x960-M): https://huggingface.co/MemorySlices
- Paper de SEA-RAFT: arXiv:2405.14793
- Paper de ProPainter: Zhou et al., "ProPainter: Improving Propagation and Transformer for Video Inpainting", ICCV 2023 (URL no proporcionada)
- Paper de RAFT: Teed y Deng, "RAFT: Recurrent All-Pairs Field Transforms for Optical Flow", ECCV 2020 (URL no proporcionada)

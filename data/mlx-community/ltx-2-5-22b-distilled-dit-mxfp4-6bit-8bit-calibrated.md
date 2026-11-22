# mlx-community/LTX-2.5-22B-Distilled-DiT-MXFP4-6bit-8bit-Calibrated

## Resumen

LTX-2.5 22B Distilled DiT en versión MLX con cuantización mixta calibrada es una adaptación del modelo de generación de vídeo `Lightricks/LTX-2.5` realizada por la comunidad `mlx-community`. Se trata de una cuantización del transformer de difusión (DiT) destilado de 22.000 millones de parámetros, empaquetada en un único fichero safetensors de 13,20 GB que combina capas en MXFP4, Q6 y Q8, pensada para ejecutarse en Apple Silicon mediante la librería `ltx-2-mlx`.

El modelo resuelve el problema de ejecutar un generador de vídeo de gran tamaño en hardware de consumo con memoria unificada: reduce el DiT de 42 GB en BF16 a 13,20 GB manteniendo una paridad numérica alta frente a BF16 (coseno de 0,9877 en vídeo y 0,9894 en audio en una pasada única). La selección de precisión por capa no es uniforme, sino que se asigna mediante calibración de activaciones y un reparto greedy de presupuesto de bits, lo que permite conservar mejor la calidad que una cuantización uniforme de 4 bits.

Es relevante porque demuestra una técnica de cuantización mixta calibrada aplicada a un modelo de difusión de vídeo con audio, con benchmarks end-to-end medidos en un Apple M5 Pro de 64 GiB, y porque ofrece una alternativa práctica a las versiones uniformes Q6 y Q8 para despliegue local en macOS.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) destilado, con componentes de audio y vídeo |
| Parámetros totales | 22B (modelo base); el fichero cuantizado ocupa 13,20 GB |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de generación de vídeo, no de texto) |
| Tipos de cuantización | Mixta: MXFP4 (bits=4, group_size=32), Q6 (bits=6, group_size=64, affine), Q8 (bits=8, group_size=64, affine); embeddings, norms, AdaLN/timestep y proyecciones de salida en BF16 |
| Idiomas soportados | en, de, es, fr, ja, ko, zh, it, pt |
| Licencia | ltx-2.x-community-license (other) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es un DiT destilado de 22B para generación de vídeo (y audio asociado), con 1.632 capas lineales en `transformer_blocks`. La versión aquí descrita no reentrena el modelo: cuantiza el fichero `transformer-distilled.safetensors` del modelo original. El proceso de cuantización consta de tres fases: primero se ejecutan 24 pasadas BF16 del DiT sobre 8 prompts audiovisuales fuera de muestra en timesteps temprano (sigma=0,90), medio (0,50) y tardío (0,15), acumulando segundos momentos diagonales `H_diag = E[x^2]` para las 1.632 lineales; después se aplica un reparto greedy de presupuesto hacia un objetivo de 13,20 GB, promocionando capas de MXFP4 a Q6 y a Q8 según la reducción de error ponderada por byte; finalmente se refina el recorte affine con búsqueda en rejilla de `alpha` en {1,0, 0,98, 0,95, 0,92} sobre 19 capas affine.

El resultado del reparto es 584 capas en MXFP4, 807 en Q6 y 241 en Q8. El error de cuantización ponderado por `H_diag` baja de 6,400e5 (MXFP4 uniforme) y 2,421e4 (Q6 uniforme) a 1,664e4, lo que supone un 31 % menos de error que Q6 con 2,76 GB menos de tamaño. El mapa completo de capas está en `quantization_policy.json`. La inferencia se ejecuta sobre kernels Metal estándar `nn.QuantizedLinear`, sin dequantizador personalizado.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video).
- Generación de vídeo a partir de imagen (image-to-video).
- Generación conjunta de vídeo y audio (text-to-audio-video e image-to-audio-video).
- Control de resolución, número de frames, frame rate y semilla en la generación.
- Soporte de prompt negativo y de `--nag` para suprimir audio no deseado (música, banda sonora) sin contaminar el prompt positivo.
- Decodificación de vídeo con decoder de difusión, con ejecución por tiles para resoluciones altas.
- Multilingüe en los prompts: en, de, es, fr, ja, ko, zh, it, pt.
- Ejecución en Apple Silicon mediante `ltx-2-mlx`, con soporte de `BlockStreamer` y precisión mixta por capa.
- No se documentan en la información disponible capacidades de tool calling, agentes ni razonamiento multi-paso, por tratarse de un modelo generativo de vídeo.

## Casos de uso

- Generación de clips publicitarios cortos en local: con 768x512 y 97 frames a 24 fps se obtiene un clip de unos 4 segundos; el benchmark reporta 162,5 s hasta 768x512x97 sin tiles, adecuado para prototipado rápido en un portátil Apple Silicon.
- Creación de vídeo con audio sincronizado para redes sociales: el modelo genera audio y vídeo conjuntamente, y `--nag --negative-prompt` permite eliminar música de fondo no deseada manteniendo el tono de sala natural.
- Image-to-video para animar storyboards o fotografías de producto: útil en flujos de previsualización donde se parte de una imagen fija y se necesita movimiento coherente sin reentrenamiento.
- Iteración de guiones visuales con control de semilla: al fijar `--seed` se pueden comparar variantes de prompt manteniendo la composición, lo que facilita la selección de tomas en producción de contenido.
- Renderizado por tiles en resoluciones altas: a 1280x704x97 (2 tiles, 416,1 s) y 1152x768x121 (3 tiles, 551,6 s) con 0,0 MB de swap, viable para entregables de mayor calidad en un M5 Pro de 64 GB.
- Prototipado de pipelines de vídeo generativo en macOS: al integrarse en un pack MLX existente (por ejemplo `dgrauet/ltx-2.5-mlx-q8`) y usar kernels Metal estándar, sirve para validar flujos de inferencia antes de migrar a hardware de datacenter.
- Investigación en cuantización de modelos de difusión: el `quantization_policy.json` y la metodología de calibración permiten reproducir y comparar estrategias de precisión mixta frente a Q4, Q6, Q8 y MXFP8.

## Benchmarks y rendimiento

Paridad de una sola pasada del DiT frente a BF16, medida en Apple M5 Pro (64 GiB), macOS 27.2.1, Python 3.13.18, `mlx 0.32.2`:

| Variante | Tamano DiT | Video Cos | Video RMSE | Audio Cos | Audio RMSE |
|---|---:|---:|---:|---:|---:|
| Q8 (affine g64) | 20,59 GB | 0,999805 | 0,02390 | 0,999681 | 0,01574 |
| MXFP8 (g32) | 20,02 GB | 0,992870 | 0,14793 | 0,994663 | 0,06530 |
| Mixed Calibrated (este repo) | 13,20 GB | 0,987724 | 0,21676 | 0,989421 | 0,09092 |
| Q6 (affine g64) | 15,96 GB | 0,986826 | 0,20015 | 0,996734 | 0,05065 |
| MXFP4 (g32) | 10,74 GB | 0,984554 | 0,21650 | 0,970633 | 0,15176 |
| Q4 (affine g64) | 11,32 GB | 0,816431 | 0,71769 | 0,968157 | 0,15504 |

Benchmark end-to-end de 48 clips (6 escenarios x 2 semillas, 12 clips por variante):

| Variante | Tiempo medio | Denoise medio | Seg/step | Pico MLX | Delta swap máx. | Clips silenciosos |
|---|---:|---:|---:|---:|---:|---:|
| Mixed Calibrated (este repo) | 70,28 s | 57,38 s | 5,216 s | 29,45 GB | 0,0 MB | 0 |
| Q8 | 74,19 s | 60,88 s | 5,535 s | 29,45 GB | 0,0 MB | 0 |
| Q6 | 74,69 s | 61,12 s | 5,557 s | 29,45 GB | 0,0 MB | 0 |
| Q4 | 75,17 s | 61,32 s | 5,575 s | 29,45 GB | 0,0 MB | 0 |

Notas visuales del autor: frente a Q4, la variante mixta es más nítida en piel, ojos y superficies mojadas, y mantiene la composición de escena y la estructura de manos de Q6/Q8 en planos con diálogo; en algunas semillas puede desplazar el encuadre u orientación del sujeto respecto a Q8.

## Requisitos de hardware

- Memoria: pico de MLX de 29,45 GB en el benchmark end-to-end con el pack completo; el fichero del DiT cuantizado ocupa 13,20 GB.
- Hardware de referencia: Apple M5 Pro con 64 GiB de memoria unificada, macOS 27.2.1; 0,0 MB de swap en las pruebas reportadas.
- Cabe en equipos Apple Silicon con memoria unificada suficiente (64 GiB en la configuración medida); no se documentan pruebas en configuraciones menores.
- No aplica a GPU NVIDIA o AMD: la librería es `mlx` y los kernels son Metal (`nn.QuantizedLinear`).
- Despliegue: `ltx-2-mlx` con soporte de precisión mixta por capa, cargador MXFP4 y `BlockStreamer`; se integra colocando `transformer-distilled.safetensors` en un pack LTX-2.5 MLX existente.
- Latencias medidas: 162,5 s para 768x512x97 sin tiles; 416,1 s para 1280x704x97 con 2 tiles; 551,6 s para 1152x768x121 con 3 tiles.
- Throughput: 5,216 s por step de denoise en el benchmark de 48 clips.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LTX-2.5 22B Distilled DiT Mixed Calibrated (este) | 22B | no disponible | Video Cos 0,9877; 70,28 s/clip; 13,20 GB | ltx-2.x-community-license | Hugging Face (mlx-community) |
| LTX-2.5 22B Distilled DiT 6bit (mlx-community) | 22B | no disponible | Video Cos 0,9868; 74,69 s/clip; 15,96 GB | ltx-2.x-community-license | Hugging Face |
| LTX-2.5 22B en Q8 (referencia) | 22B | no disponible | Video Cos 0,9998; 74,19 s/clip; 20,59 GB | ltx-2.x-community-license | Hugging Face |
| LTX-2.5 22B en Q4 (referencia) | 22B | no disponible | Video Cos 0,8164; 75,17 s/clip; 11,32 GB | ltx-2.x-community-license | Hugging Face |

## Limitaciones y advertencias

- La cuantización introduce pérdida de fidelidad frente a BF16: coseno de 0,9877 en vídeo y 0,9894 en audio, con RMSE de 0,21676 y 0,09092 respectivamente.
- En algunas semillas puede cambiar el encuadre u orientación del sujeto respecto a Q8; si se requiere paridad exacta de semilla con Q8, el autor recomienda la variante Q6.
- Requiere `ltx-2-mlx` con soporte de precisión mixta por capa, cargador MXFP4 y `BlockStreamer`; no funciona con versiones anteriores de la herramienta.
- Dependencia de hardware Apple Silicon: no hay soporte documentado para CUDA ni ROCm en esta release.
- La licencia `ltx-2.x-community-license` es de tipo "other" y no equivale a una licencia permisiva; debe revisarse antes de uso comercial.
- Si se combina con el codificador de texto Gemma del pack LTX-2.5, se aplican también los Términos de Uso y la Política de Uso Prohibido de Gemma.
- Riesgo de artefactos en manos y superficies en cuantizaciones agresivas (el Q4 muestra degradación severa, con coseno de 0,8164); la variante mixta mitiga pero no elimina estos fallos.
- No se documentan sesgos específicos del modelo en la información disponible.
- El modelo está orientado a generación de vídeo y audio; no debe evaluarse como modelo de lenguaje, razonamiento o código.

## Enlaces

- Hugging Face: https://huggingface.co/mlx-community/LTX-2.5-22B-Distilled-DiT-MXFP4-6bit-8bit-Calibrated
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
- Variante Q6 compañera: https://huggingface.co/mlx-community/LTX-2.5-22B-Distilled-DiT-6bit
- Pack MLX de referencia: https://huggingface.co/dgrauet/ltx-2.5-mlx-q8
- Paper referenciado: arxiv:2601.03233
- Mapa de cuantización: `quantization_policy.json` (incluido en el repositorio)
- Licencia: `LICENSE` (incluido en el repositorio)

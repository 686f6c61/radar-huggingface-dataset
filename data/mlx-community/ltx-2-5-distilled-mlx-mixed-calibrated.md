# mlx-community/LTX-2.5-Distilled-MLX-Mixed-Calibrated

## Resumen

LTX-2.5-Distilled-MLX-Mixed-Calibrated es una cuantización mixta del modelo de difusión LTX-2.5 de Lightricks, publicada por la comunidad mlx-community para su ejecución en Apple Silicon mediante el framework MLX. El modelo base es un Diffusion Transformer (DiT) destilado de 22 000 millones de parámetros que genera vídeo y audio de forma conjunta a partir de texto (pipeline text-to-video). Esta versión comprime el transformer de 42 GB en BF16 a un único fichero safetensors de 13,20 GB combinando capas en MXFP4, Q6 y Q8, seleccionadas mediante calibración de activaciones.

La relevancia de esta ficha radica en que demuestra una técnica de cuantización no uniforme guiada por error: en lugar de aplicar un único formato a todas las capas, se asignan precisiones distintas según la sensibilidad de cada capa medida con momentos de segundo orden de las activaciones. El resultado es un modelo que ocupa un 38 % menos que la versión Q6 uniforme (15,96 GB) manteniendo una fidelidad frente a BF16 superior en vídeo (coseno 0,9877 frente a 0,9868) y con un tiempo de generación medio menor en el benchmark end-to-end (70,28 s frente a 74,69 s).

El modelo está pensado para desarrolladores que quieran ejecutar generación de vídeo con audio en equipos Apple con memoria unificada, sin necesidad de GPUs dedicadas. Requiere el runtime `ltx-2-mlx` con soporte de precisión mixta por capa y del cargador MXFP4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) destilado, con generación conjunta de vídeo y audio |
| Parametros totales | 22 000 millones (modelo base LTX-2.5); el transformer destilado cuantizado ocupa 13,20 GB |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta por capa: MXFP4 (bits=4, group_size=32), Q6 (bits=6, group_size=64, affine) y Q8 (bits=8, group_size=64, affine); embeddings, norms, modulaciones AdaLN/timestep y proyecciones de salida en BF16 |
| Idiomas soportados | no disponible |
| Licencia | LTX-2.x Community License (license_name: ltx-2.x-community-license); al usar el codificador de texto Gemma se aplican además sus términos de uso |
| Formato de pesos | safetensors (MLX); fichero `transformer-distilled.safetensors` |

## Arquitectura y entrenamiento

El modelo base LTX-2.5 es un Diffusion Transformer (DiT) destilado de 22 000 millones de parámetros que genera vídeo y audio de forma conjunta. Esta release no reentrena el modelo: parte del checkpoint BF16 `Lightricks/LTX-2.5` (commit `49b093a39c19`) y aplica una cuantización de precisión mixta calibrada. El proceso consistió en ejecutar 24 pasadas forward en BF16 del DiT sobre 8 prompts audiovisuales fuera de muestra, en timesteps tempranos (sigma=0,90), medios (0,50) y tardíos (0,15), acumulando momentos de segundo orden diagonales H_diag = E[x²] para las 1632 capas lineales de `transformer_blocks`.

Sobre esa calibración se aplicó una asignación voraz de presupuesto con objetivo de 13,20 GB: partiendo de MXFP4 uniforme, se promocionaron capas (mxfp4 → q6 → q8) según la mayor reducción de error ponderado por byte. El reparto final es de 584 capas en MXFP4, 807 en Q6 y 241 en Q8. Además, se refinó el recorte afín con una búsqueda de rango por grupo (alpha en {1,0; 0,98; 0,95; 0,92}) sobre 19 capas afines. El error de cuantización ponderado por H_diag bajó de 6,400e5 (MXFP4 uniforme) y 2,421e4 (Q6 uniforme) a 1,664e4, un 31 % menos que Q6 con 2,76 GB menos de peso. El mapa completo de capas está en `quantization_policy.json`. La cuantización se ejecuta sobre los kernels Metal estándar `nn.QuantizedLinear`, sin dequantizador personalizado.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con resolución configurable; los ejemplos de la model card usan 768x512, 1280x704 y 1152x768.
- Generación conjunta de audio y vídeo: el pipeline produce pista de audio sincronizada además del vídeo (tags `audio-video`).
- Control de duración y tasa de fotogramas mediante parámetros (`--frames`, `--frame-rate`); el ejemplo usa 97 fotogramas a 24 fps.
- Modo destilado (`--distilled`) con menos pasos de denoising que el modelo completo.
- Negative prompting con NAG (`--nag --negative-prompt`) para suprimir elementos no deseados, como música de fondo o texturas plásticas, sin recurrir a negaciones en el prompt positivo.
- Decodificación de vídeo con decoder de difusión (`--video-decoder diffusion`), con soporte de ejecución por tiles para resoluciones altas.
- Ejecución en memoria limitada mediante `--low-ram` y `BlockStreamer`.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multilingüe explícito.

## Casos de uso

- Generación de clips publicitarios cortos: el modelo produce vídeo con audio sincronizado en una sola pasada, adecuado para prototipos de anuncios de 4 segundos (97 fotogramas a 24 fps) en resolución 768x512.
- Previsualización de storyboards en producción audiovisual: con un tiempo medio de 70,28 s por clip en un M5 Pro de 64 GB, permite iterar sobre guiones gráficos antes de rodar.
- Creación de contenido para redes sociales en equipos Apple: al ejecutarse íntegramente en MLX sobre memoria unificada, no requiere GPU dedicada ni servicios en la nube.
- Generación de escenas con diálogo y ambiente sonoro: el benchmark incluye escenas de diálogo donde el modelo mantiene la estructura de manos y el fondo, útil para prototipos de escenas conversacionales.
- Iteración con control negativo de audio: el uso de `--nag --negative-prompt` permite eliminar música de fondo no deseada en clips que deben llevar solo sonido ambiente, útil en doblaje y posproducción.
- Pruebas de concepto en investigación sobre cuantización de modelos de difusión: el repositorio incluye la política de cuantización y los errores medidos, lo que sirve como referencia para estudiar el impacto de la precisión mixta en DiTs.
- Renderizado por tiles en resoluciones altas: con `--video-decoder diffusion` y 2-3 tiles se generan clips a 1280x704 y 1152x768, útil para material de mayor calidad en pantalla.

## Benchmarks y rendimiento

Paridad de una sola pasada del DiT frente a BF16, medida en Apple M5 Pro (64 GiB de RAM unificada), macOS 27.2.1, Python 3.13.18 y mlx 0.32.2:

| Variante | Tamano DiT | Video Cos | Video RMSE | Audio Cos | Audio RMSE |
|---|---:|---:|---:|---:|---:|
| Q8 (affine g64) | 20,59 GB | 0,999805 | 0,02390 | 0,999681 | 0,01574 |
| MXFP8 (g32) | 20,02 GB | 0,992870 | 0,14793 | 0,994663 | 0,06530 |
| Mixed Calibrated (este repo) | 13,20 GB | 0,987724 | 0,21676 | 0,989421 | 0,09092 |
| Q6 (affine g64) | 15,96 GB | 0,986826 | 0,20015 | 0,996734 | 0,05065 |
| MXFP4 (g32) | 10,74 GB | 0,984554 | 0,21650 | 0,970633 | 0,15176 |
| Q4 (affine g64) | 11,32 GB | 0,816431 | 0,71769 | 0,968157 | 0,15504 |

Benchmark end-to-end de 48 clips (6 escenarios x 2 semillas, 12 clips por variante):

| Variante | Tiempo medio | Denoise medio | Seg/paso | Pico MLX | Max Swap Delta | Clips silenciosos |
|---|---:|---:|---:|---:|---:|---:|
| Mixed Calibrated (este repo) | 70,28 s | 57,38 s | 5,216 s | 29,45 GB | 0,0 MB | 0 |
| Q8 | 74,19 s | 60,88 s | 5,535 s | 29,45 GB | 0,0 MB | 0 |
| Q6 | 74,69 s | 61,12 s | 5,557 s | 29,45 GB | 0,0 MB | 0 |
| Q4 | 75,17 s | 61,32 s | 5,575 s | 29,45 GB | 0,0 MB | 0 |

Tiempos de decodificación de vídeo con `--video-decoder diffusion` en M5 Pro 64 GB, sin swap: 162,5 s a 768x512x97 (sin tiles), 416,1 s a 1280x704x97 (2 tiles) y 551,6 s a 1152x768x121 (3 tiles).

## Requisitos de hardware

- Memoria: el benchmark reporta un pico de MLX de 29,45 GB durante la generación end-to-end, con 0,0 MB de swap en un equipo de 64 GiB de RAM unificada.
- Hardware de referencia: Apple M5 Pro con 64 GiB de memoria unificada; no se documentan pruebas en otros chips Apple.
- No se proporcionan datos de VRAM para GPUs NVIDIA ni AMD; el modelo está empaquetado para MLX y Apple Silicon.
- No cabe en GPUs de consumo convencionales por el formato MLX; requiere memoria unificada de Apple Silicon.
- Despliegue: runtime `ltx-2-mlx` con soporte de precisión mixta por capa, cargador MXFP4 y `BlockStreamer`. El fichero `transformer-distilled.safetensors` se coloca dentro de un pack LTX-2.5 MLX existente (por ejemplo, `dgrauet/ltx-2.5-mlx-q8`).
- Latencia: 5,216 s por paso de denoising y 70,28 s de media por clip de 97 fotogramas a 768x512 en el hardware de referencia.
- Opciones de memoria: flag `--low-ram` para equipos con menos memoria unificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (Video Cos vs BF16) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LTX-2.5-Distilled-MLX-Mixed-Calibrated (este) | 22B (DiT destilado) | no disponible | 0,987724 | LTX-2.x Community License | MLX, 13,20 GB |
| LTX-2.5-Distilled-MLX-Q6 | 22B (DiT destilado) | no disponible | 0,986826 | LTX-2.x Community License | MLX, 15,96 GB |
| LTX-2.5-Distilled-MLX-Q8 (referencia) | 22B (DiT destilado) | no disponible | 0,999805 | LTX-2.x Community License | MLX, 20,59 GB |
| LTX-2.5 (BF16 original) | 22B | no disponible | referencia | LTX-2.x Community License | safetensors, 42 GB |

No se dispone en la información proporcionada de comparativas con modelos de vídeo de otros fabricantes (por ejemplo, familias alternativas de text-to-video); esos datos figuran como no disponibles.

## Limitaciones y advertencias

- La cuantización introduce desviaciones frente a BF16: coseno de vídeo 0,9877 y RMSE 0,2168, superiores a Q8 en error.
- En algunas semillas puede cambiar el encuadre u orientación del sujeto respecto a Q8; si se necesita paridad exacta semilla a semilla con Q8, se recomienda la variante Q6.
- El audio presenta mayor degradación relativa que el vídeo (coseno 0,9894 frente a 0,9967 de Q6); si la calidad de audio es prioritaria, Q6 es mejor opción.
- No se documentan sesgos conocidos del modelo base ni del proceso de cuantización en la información disponible.
- Riesgo de alucinación visual y artefactos en escenas complejas, como manos o superficies húmedas, aunque la model card indica que supera a Q4 en estos aspectos.
- Licencia LTX-2.x Community License: es necesario revisar `LICENSE` para uso comercial; además, al usar el codificador de texto Gemma se aplican los términos de uso y la política de uso prohibido de Gemma.
- Requiere hardware Apple Silicon con memoria unificada suficiente (pico de 29,45 GB en el benchmark); no es desplegable en GPUs NVIDIA con este formato.
- Depende de un runtime específico (`ltx-2-mlx`) con soporte de precisión mixta y MXFP4; no funciona con versiones anteriores del runtime.
- No se documentan idiomas soportados ni longitud de contexto; no se debe asumir multilingüismo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es aún inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlx-community/LTX-2.5-Distilled-MLX-Mixed-Calibrated
- Variante Q6 companion: https://huggingface.co/mlx-community/LTX-2.5-Distilled-MLX-Q6
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
- Pack MLX de referencia (Q8): https://huggingface.co/dgrauet/ltx-2.5-mlx-q8
- Licencia: fichero `LICENSE` del repositorio (LTX-2.x Community License)
- Mapa de cuantización: `quantization_policy.json` del repositorio
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios de código o demos.

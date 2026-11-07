# masterofaudio2077/sana-manga-coloring-onnx-int8

## Resumen

`sana-manga-coloring-onnx-int8` es una versión cuantizada a int8 y exportada a ONNX del modelo `sana-manga-coloring`, un modelo de image-to-image especializado en colorear páginas de manga en blanco y negro. Lo desarrolla el usuario `masterofaudio2077` y se publica bajo licencia Apache 2.0. Su propósito es permitir la colorización de manga en CPU sin dependencia de PyTorch, usando únicamente `onnxruntime`, `numpy` y `Pillow`, lo que reduce la barrera de despliegue en entornos sin GPU.

El modelo se apoya en la arquitectura Sana (un transformer de difusión eficiente) afinada sobre aproximadamente 60 GB de páginas de manga de distintos géneros. Esta variante mantiene el transformer en int8 (cuantización dinámica con escalas por canal) mientras conserva el VAE y las convoluciones feed-forward en fp32 para preservar la fidelidad de color. El resultado es una reducción de tiempo de inferencia de aproximadamente un 30-40 % frente a ONNX fp32 y de más del 50 % frente a PyTorch, con una diferencia de color media (ΔE CIE76) inferior a 0.6 frente al modelo original.

Es relevante ahora porque demuestra que es posible llevar modelos de difusión de imagen a producción en CPU con pérdida de calidad prácticamente imperceptible, algo útil para pipelines editoriales, digitalización de archivos de manga y aplicaciones de escritorio sin aceleración hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sana (transformer de difusión) exportado a ONNX; VAE encoder/decoder y encoder de líneas B/N |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen); resolución de trabajo: lado corto a 512 px |
| Tipos de cuantizacion | int8 dinámica con escalas por canal (`quantize_dynamic`, `per_channel=True`) en el transformer; VAE y convoluciones feed-forward en fp32 |
| Idiomas soportados | no disponible (modelo de imagen; las etiquetas de control están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encode.onnx`, `transformer.onnx`, `decode.onnx`, con ficheros `.data` asociados) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Sana, un transformer de difusión para generación de imágenes conocido por su eficiencia computacional. El pipeline se compone de tres grafos ONNX: `encode.onnx` (VAE encoder más el encoder de características de línea del modelo), `transformer.onnx` (el transformer afinado, ejecutado dos veces por paso con y sin las etiquetas de control para implementar CFG) y `decode.onnx` (VAE decoder que recompone el line art sobre los colores). El muestreo es un Euler flow sampler de 20 pasos con CFG de 2.0.

El modelo base se entrenó sobre aproximadamente 60 GB de páginas de manga de distintos géneros, según la model card del modelo original. Esta variante no reentrena: solo cuantiza y exporta. La cuantización cubre las 258 matrices de pesos de las capas lineales del transformer (atención, cross-attention sobre las etiquetas, condicionamiento temporal, inyecciones de características B/N y proyección de salida). Las activaciones se cuantizan en tiempo de ejecución. Se mantienen en fp32 las convoluciones 1×1 del feed-forward y el VAE porque la cuantización de estas degradaba el color (ΔE medio hasta 4.8) o la nitidez. El uso de escalas por canal es clave: con una sola escala por capa el ΔE medio llegaba a 5.1, mientras que con escalas por canal el máximo es 0.58.

## Capacidades

- Colorización image-to-image de páginas de manga en blanco y negro, preservando el line art original.
- Control mediante etiquetas opcionales: `mood`, `time_of_day`, `palette`, `saturation` y otras listadas en la model card del modelo base y en `run_onnx.py --help`.
- Modo de color automático: si se omiten las etiquetas, el modelo elige la paleta.
- Inferencia en CPU sin PyTorch, usando solo `onnxruntime`, `numpy` y `Pillow`.
- Control de semilla (`--seed`), número de pasos (`--steps`, por defecto 20), escala de CFG (`--cfg`, por defecto 2.0) y número de hilos (`--threads`).
- Uso desde línea de comandos o desde Python mediante las clases `Colorizer`, `prepare_page`, `tag_ids` y `to_pil`.
- No soporta tool calling, agentes, texto, audio ni visión general; es un modelo puramente de imagen a imagen.

## Casos de uso

- Digitalización editorial de manga: colorear páginas escaneadas en lote en servidores sin GPU, aprovechando que solo requiere `onnxruntime` y que cada página tarda entre 36 y 44 segundos en 16 hilos de CPU.
- Aplicaciones de escritorio o móviles de aficionados: integrar el modelo en herramientas locales de coloreado sin dependencia de PyTorch ni de CUDA, con un peso total de descarga de unos 2.7 GB y pico de memoria de unos 4 GB.
- Previsualización rápida en pipelines de publicación: generar una versión coloreada de prueba antes de la colorización manual definitiva, usando las etiquetas `mood` y `palette` para explorar direcciones artísticas.
- Archivo y restauración de fondos de manga: colorear páginas históricas en blanco y negro para catálogos digitales, manteniendo el line art original gracias al paso de decodificación que lo recompone.
- Prototipado de estilo en estudios pequeños: comparar distintas combinaciones de `saturation`, `palette` y `time_of_day` sobre la misma página con la misma semilla de ruido para evaluar variantes de color.
- Despliegue en entornos con restricciones de hardware: servir el modelo en contenedores ligeros o dispositivos edge donde no hay GPU disponible, al no requerir PyTorch ni bibliotecas de cómputo pesadas.
- Investigación sobre cuantización de modelos de difusión: usar este repositorio como referencia reproducible de cuantización dinámica int8 por canal en un transformer de difusión, con métricas ΔE y PSNR publicadas.

## Benchmarks y rendimiento

Calidad frente al modelo original en PyTorch (bfloat16 con cómputo en float32) sobre 10 páginas, misma entrada, etiquetas y ruido:

| Pagina | ΔE medio | ΔE percentil 99 | PSNR |
|---|---|---|---|
| 1 | 0.36 | 1.0 | 52.6 dB |
| 2 | 0.44 | 1.3 | 50.7 dB |
| 3 | 0.56 | 1.5 | 48.6 dB |
| 4 | 0.52 | 1.2 | 49.5 dB |
| 5 | 0.58 | 1.2 | 47.8 dB |
| 6 | 0.38 | 1.0 | 52.4 dB |
| 7 | 0.45 | 1.5 | 51.0 dB |
| 8 | 0.34 | 1.4 | 53.1 dB |
| 9 | 0.48 | 1.3 | 51.4 dB |
| 10 | 0.45 | 1.1 | 52.0 dB |

El export ONNX fp32 previo a la cuantización coincide exactamente con PyTorch a 8 bits de salida (ΔE 0.00, PSNR superior a 83 dB). La diferencia observada procede íntegramente de la cuantización int8.

Velocidad (20 pasos por página, páginas de 512×640 a 512×768, AMD Ryzen AI 7 350 con 16 hilos):

| Version | Segundos por pagina |
|---|---|
| PyTorch, modelo original | 57–97 |
| ONNX fp32 | 49–59 |
| ONNX int8 (este repo) | 36–44 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que es un modelo de imagen.

## Requisitos de hardware

- VRAM: no aplica; el modelo está pensado para CPU. Pico de memoria RAM de aproximadamente 4 GB.
- GPU: no requiere GPU. No se documenta soporte ni rendimiento en GPU para esta variante ONNX.
- Consumer GPU: irrelevante para el caso de uso principal; el modelo no necesita aceleración gráfica.
- CPU: se ha medido en un AMD Ryzen AI 7 350 con 16 hilos; el parámetro `--threads` permite ajustar el paralelismo (por defecto usa todos los núcleos).
- Despliegue: `onnxruntime` (CPU), más `numpy` y `Pillow`. No requiere PyTorch, vLLM, llama.cpp ni TGI, que no son aplicables a este modelo.
- Latencia: 36–44 segundos por página en el hardware de referencia con 20 pasos. El throughput escala con el número de núcleos disponibles.
- Almacenamiento: descarga de aproximadamente 2.7 GB (transformer 1.4 GB, cada mitad del VAE unos 0.6 GB).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto/resolucion | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| sana-manga-coloring-onnx-int8 (este) | Sana difusión, image-to-image | no disponible | lado corto 512 px | Apache 2.0 | ONNX int8 | CPU, sin PyTorch, 36–44 s/página |
| sana-manga-coloring (base) | Sana difusión, image-to-image | no disponible | lado corto 512 px | Apache 2.0 | PyTorch (safetensors) | Requiere PyTorch; 57–97 s/página en CPU |
| Export ONNX fp32 del mismo modelo | Sana difusión, image-to-image | no disponible | lado corto 512 px | Apache 2.0 | ONNX fp32 | 49–59 s/página; calidad idéntica a PyTorch |

No se dispone de información sobre otros modelos comparables de colorización de manga en la búsqueda web realizada.

## Limitaciones y advertencias

- Es un modelo especializado exclusivamente en colorización de manga; no sirve para generación de texto, código, razonamiento ni otras tareas.
- El ruido se genera con NumPy, por lo que con la misma `--seed` los colores difieren del modelo PyTorch; solo coinciden si se usa el mismo array de ruido.
- El redimensionado usa Pillow mientras que el código PyTorch usa `torch.nn.functional.interpolate`; ambos aplican filtrado bilineal antialias, pero el resultado no es idéntico bit a bit.
- No se incluye la caché de primer bloque por paso que usa el Space original; cada paso ejecuta el transformer completo, lo que limita la aceleración adicional.
- La cuantización int8 introduce un ΔE medio de hasta 0.58 frente al original, por debajo del umbral perceptible aproximado de 2.3, pero no es una réplica exacta.
- Los sesgos del modelo base (estilos de color, géneros de manga representados en los 60 GB de entrenamiento) se heredan y no se documentan en detalle en esta variante.
- Riesgo de alucinación visual: el modelo puede elegir paletas incoherentes con la narrativa si se omiten las etiquetas de control.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y de los datos de entrenamiento originales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria independiente.
- No se documentan idiomas soportados porque el modelo no procesa texto más allá de las etiquetas de control en inglés.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/masterofaudio2077/sana-manga-coloring-onnx-int8
- Modelo base: https://huggingface.co/masterofaudio2077/sana-manga-coloring
- Árbol de ficheros del modelo base: https://huggingface.co/masterofaudio2077/sana-manga-coloring/tree/main
- Sección de controles del modelo base: https://huggingface.co/masterofaudio2077/sana-manga-coloring#controls

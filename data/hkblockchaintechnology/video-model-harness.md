# hkblockchaintechnology/video-model-harness

## Resumen

Video Model Harness es un cuaderno interactivo (notebook) desarrollado por hkblockchaintechnology sobre la librería marimo, publicado en Hugging Face con la etiqueta de pipeline image-to-video. No es un modelo de difusión entrenado por el autor, sino una herramienta de orquestación que permite ejecutar localmente modelos abiertos de generación de vídeo texto-a-vídeo e imagen-a-vídeo sobre una GPU propia. El repositorio actúa como registro de checkpoints (LTX-Video, Wan y CogVideoX) y expone una única función `generate_video` que inspecciona la firma `__call__` de cada pipeline de diffusers y reenvía solo los argumentos que ese pipeline acepta.

La propuesta resuelve un problema práctico de ingeniería: unificar la interfaz de varios pipelines de vídeo con APIs heterogéneas, gestionar renders de distinta duración y componer vídeos instructivos narrados y subtitulados de extremo a extremo. Incluye dos rutas de renderizado (clips cortos en una sola pasada y clips largos encadenados por chunks con condición imagen-a-vídeo sobre el último fotograma del chunk anterior) y un constructor de lecciones (`build_lesson_video`) que segmenta, reescala a 1280×720, sintetiza narración con edge-tts y mezcla audio y vídeo con ffmpeg.

Es relevante ahora porque los pesos de los modelos de vídeo abiertos ocupan entre 13,8 y 34,2 GB y cada familia expone pipelines distintos; este harness reduce el coste de integrarlos y deja trazabilidad de cada render mediante un sidecar JSON. El repositorio no declara licencia ni idiomas soportados, y no incluye pesos propios: los checkpoints se descargan bajo demanda desde sus repositorios originales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No es un modelo; harness de orquestación sobre pipelines de difusión (LTX-Video, Wan, CogVideoX) |
| Parámetros totales | No disponible (depende del checkpoint: 1,3B, 2B, 5B en el registro) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; duración de vídeo por chunks de `8k+1` fotogramas |
| Tipos de cuantización | No disponible (los presets usan los pesos originales en el dtype detectado) |
| Idiomas soportados | No disponible (la narración se sintetiza con edge-tts, voces no especificadas) |
| Licencia | No disponible (el autor no ha añadido archivo LICENSE ni campo license) |
| Formato de pesos | Pesos de diffusers descargados vía huggingface_hub; salida en MP4 (H.264/AAC) más sidecar JSON |

Checkpoints incluidos en el registro:

| Clave | Checkpoint | Pipeline | Descarga |
|---|---|---|---|
| `ltx-video-0.9.5` | `Lightricks/LTX-Video-0.9.5` | `LTXPipeline` / `LTXImageToVideoPipeline` | ~25,7 GB |
| `wan2.2-ti2v-5b` | `Wan-AI/Wan.2-TI2V-5B-Diffusers` | `WanPipeline` / `WanImageToVideoPipeline` | ~34,2 GB |
| `wan2.1-t2v-1.3b` | `Wan-AI/Wan2.1-T2V-1.3B-Diffusers` | `WanPipeline` | ~28,9 GB |
| `cogvideox-2b` | `THUDM/CogVideoX-2b` | `CogVideoXPipeline` | ~13,8 GB |

## Arquitectura y entrenamiento

El harness no entrena ningún modelo. Su núcleo es una función `generate_video` que recibe un checkpoint del registro y, mediante introspección de la firma `__call__` del pipeline de diffusers correspondiente, filtra los argumentos y los reenvía solo si el pipeline los acepta. Añadir un checkpoint al registro basta para darle soporte, lo que desacopla la interfaz del notebook de las particularidades de cada familia (LTX-Video, Wan, CogVideoX).

El renderizado se organiza en dos rutas. Los clips cortos, de hasta un chunk de `8k+1` fotogramas, se generan en una sola pasada de difusión. Los clips largos se renderizan como una cadena de chunks donde cada uno se condiciona por imagen al último fotograma del anterior y luego se cosen en una toma continua; si un preset no tiene clase imagen-a-vídeo, se recurre a chunks solo de texto, lo que permite formato largo pero con cortes entre chunks. El notebook reutiliza la instancia del pipeline durante la sesión (con `load_seconds` igual a 0,0 en un acierto de caché) y descarga los pesos con huggingface_hub en el primer uso.

El constructor de lecciones (`build_lesson_video`) añade una capa de composición: cada segmento se genera como clip independiente para poder rehacerlo sin re-renderizar la lección completa; cada fotograma se reescala a 1280×720 y se compone con una tarjeta de lección dibujada con PIL y fuentes reales (los modelos de difusión no escriben texto correctamente, por lo que todo el texto legible se dibuja, no se genera); la narración se sintetiza con edge-tts y se ajusta por segmento a la duración exacta de su vídeo; y finalmente fotogramas y audio se mezclan a H.264/AAC con ffmpeg.

## Capacidades

- Generación de vídeo texto-a-vídeo e imagen-a-vídeo local sobre GPU CUDA, con checkpoints de LTX-Video, Wan 2.1/2.2 y CogVideoX.
- Interfaz unificada para pipelines heterogéneos mediante introspección de firma y filtrado de argumentos.
- Renderizado de formato largo por encadenamiento de chunks con condición imagen-a-vídeo sobre el último fotograma del chunk previo.
- Construcción de vídeos instructivos narrados y subtitulados a partir de una configuración declarativa `LESSON`.
- Segmentación re-renderizable: cada segmento de una lección se genera por separado.
- Composición de tarjetas de lección con texto real dibujado mediante PIL y fuentes, evitando la generación de texto por difusión.
- Síntesis de voz con edge-tts, ajustada por segmento a la duración exacta del vídeo correspondiente.
- Mezcla de audio y vídeo a H.264/AAC con ffmpeg.
- Reutilización de la instancia del pipeline durante la sesión y caché de pesos.
- Trazabilidad de cada ejecución mediante un sidecar JSON con modelo, prompt, prompt negativo, fotogramas, fps, resolución, pasos, guidance, semilla, segundos de render y VRAM pico.
- Corrección de rango de fotogramas (`grade_frame`): reduce brillo si la luminancia media supera 205 y sube saturación si la saturación media es inferior a 0,35.
- No dispone de tool calling, function calling ni capacidades de agente; no es un modelo de lenguaje.

## Casos de uso

- Generación local de clips cortos con modelos abiertos: seleccionar un checkpoint del registro (por ejemplo, CogVideoX-2b, 13,8 GB) y lanzar una pasada de difusión de hasta `8k+1` fotogramas para prototipar escenas sin depender de servicios en la nube.
- Producción de vídeo de formato largo: usar el encadenamiento de chunks con condición imagen-a-vídeo para obtener tomas continuas de mayor duración sin forzar a una sola pasada de difusión a cubrir todos los fotogramas, lo que mantiene la coherencia.
- Creación de vídeos instructivos narrados: definir una configuración `LESSON` y dejar que `build_lesson_video` genere cada segmento, componga la tarjeta de lección con texto real y sincronice la narración de edge-tts a la duración exacta de cada segmento.
- Re-renderizado selectivo de segmentos: al generar cada segmento como clip independiente, se puede rehacer un único fragmento de una lección sin volver a renderizar el resto, útil en iteraciones de contenido educativo.
- Evaluación comparativa de modelos de vídeo: cambiar la clave del registro entre LTX-Video, Wan y CogVideoX con la misma interfaz y comparar resultados y consumo de VRAM registrado en el sidecar JSON de cada ejecución.
- Automatización de pipelines de contenido con trazabilidad: cada render deja un MP4 y un JSON con todos los parámetros (semilla, pasos, guidance, fps, resolución, VRAM pico), lo que facilita la reproducibilidad y la auditoría de tiradas.
- Ajuste de prompts y corrección de color en post: aplicar `grade_frame` para devolver a rango fotogramas claramente fuera de rango y evitar prompts subespecificados que derivan en imágenes pálidas y desaturadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente aporta observaciones cualitativas de campo sobre CogVideoX-2b: las tomas amplias de un aula colorida con el ponente pequeño en el encuadre resultaron aproximadamente 13 veces más nítidas y 18 veces más saturadas que un primer plano suave de una persona, que salió sobreexpuesto y sin color. No se proporcionan cifras de latencia ni de throughput.

## Requisitos de hardware

- GPU CUDA en la práctica: los presets pesan entre 13,8 y 34,2 GB de pesos.
- VRAM estimada: no disponible de forma explícita; el notebook reporta el dispositivo detectado, la VRAM, el dtype y las versiones de librerías al inicio, y registra la VRAM pico por ejecución en el sidecar JSON.
- GPU recomendadas: no especificadas por el autor; por el tamaño de los pesos, los presets de mayor tamaño (Wan 2.2 TI2V-5B, ~34,2 GB) exigen GPUs de gama profesional con memoria amplia, mientras que CogVideoX-2b (~13,8 GB) es el preset más ligero del registro.
- ¿Cabe en GPU de consumo? No confirmado. El preset más pequeño (13,8 GB) está en el límite de las GPU de consumo de 16 GB; el resto supera esa cifra.
- Despliegue: notebook marimo (`marimo edit video_model_harness.py`) con bloque de dependencias PEP 723 inline, compatible con runners que entiendan `uv`. Dependencias fijadas: `accelerate>=1.15.0`, `diffusers==0.42.1`, `edge-tts==7.3.1`, `ftfy>=6.3.1`, `huggingface-hub>=0.34.0,<2`, `imageio-ffmpeg>=0.8.0`, `numpy==2.5.4`, `pillow==13.0.0`, `sentencepiece>=0.2.2`, `torch>=2.11,<2.12`.
- Latencia y throughput: no disponible. Se registran los segundos de render por ejecución en el sidecar JSON, pero no se publican cifras de referencia.

## Comparativa con modelos similares

El repositorio no es un modelo, por lo que la comparación se plantea frente a otras herramientas de orquestación de vídeo abierto. No se dispone de datos de benchmarks ni de rendimiento de alternativas en la información proporcionada.

| Herramienta | Tipo | Modelos cubiertos | Interfaz | Licencia |
|---|---|---|---|---|
| Video Model Harness | Notebook marimo con registro de checkpoints | LTX-Video, Wan 2.1/2.2, CogVideoX | Función única con introspección de firma | No disponible |
| Diffusers (biblioteca base) | Biblioteca Python | Amplio catálogo de pipelines | API por pipeline | No disponible en esta ficha |
| Alternativas de orquestación de vídeo | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El repositorio no declara licencia ni campo `license`; el propio autor indica que debería añadir un archivo LICENSE antes de que terceros lo reutilicen. El uso comercial queda sin marco claro.
- No incluye pesos propios: la licencia efectiva de cada modelo depende del checkpoint original (Lightricks, Wan-AI, THUDM), que debe verificarse por separado.
- No se declaran idiomas soportados; la narración con edge-tts no especifica voces ni cobertura lingüística.
- Los modelos de difusión no escriben texto correctamente; por eso el harness dibuja todo el texto legible con PIL. No debe esperarse texto generado fiable dentro del vídeo.
- Los prompts subespecificados derivan en imágenes pálidas y desaturadas; el autor desaconseja pedir "soft light" o "shallow depth of field".
- CogVideoX-2b rinde mal con personas en primer plano (resultados sobreexpuestos y sin color) y bien con planos amplios, expuestos y coloridos.
- En presets sin clase imagen-a-vídeo, el formato largo recurre a chunks solo de texto, lo que introduce cortes entre chunks.
- El renderizado de formato largo depende de encadenar chunks; no se pide a una sola pasada de difusión que cubra todos los fotogramas de un render largo.
- Requiere GPU CUDA en la práctica; no se documenta funcionamiento en CPU.
- Riesgo de alucinación visual y de artefactos propio de los modelos de difusión subyacentes; no hay métricas publicadas de calidad.
- El proyecto tiene 0 descargas y 0 likes en el momento de la consulta, y se actualizó 29 segundos después de su creación, lo que sugiere un estado muy inicial y sin validación comunitaria.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hkblockchaintechnology/video-model-harness
- marimo: https://marimo.io
- Lightricks/LTX-Video-0.9.5: https://huggingface.co/Lightricks/LTX-Video-0.9.5
- Wan-AI/Wan2.2-TI2V-5B-Diffusers: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B-Diffusers
- Wan-AI/Wan2.1-T2V-1.3B-Diffusers: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B-Diffusers
- THUDM/CogVideoX-2b: https://huggingface.co/THUDM/CogVideoX-2b

# jameskernedy/h3-pinkcherry-server

## Resumen

MiniMax H3 (PinkCherry NSFW) endpoint es un repositorio de despliegue publicado por el usuario jameskernedy que empaqueta un servidor personalizado para Hugging Face Inference Endpoints. No se trata de un modelo entrenado desde cero, sino de una infraestructura reproducible que ejecuta ComfyUI (fijado en la version v0.46.0, commit `a277b5bf`) sobre un contenedor `pytorch/pytorch:2.8.0-cuda12.9-cudnn9-runtime` con los nodos `MiniMaxH3*` disponibles. El objetivo es servir pipelines de generacion de video a partir de imagen (image-to-video y reference-to-video) con audio nativo, orientados a contenido NSFW.

El corazon del sistema es el fine-tune completo PinkCherry v1.5 del modelo MiniMax H3 (`SexGod1979/PinkCherry-NSFW_MiniMax-H3`), complementado con el fine-tune beta-0.6 oficial ref2va para reference-to-video, el text encoder qwen3vl-32b en formato nvfp4, los VAE de video y audio, y los LoRAs turbo de 8 y 4 pasos de `Comfy-Org/MiniMax-H3`. La salida es un MP4 a 24 fps, hasta 15 segundos, 768p por defecto (1344x768) y con pista de audio nativa.

El interes tecnico del repositorio esta en la ingenieria de despliegue: una escalera de fallback en carga (PinkCherry int8, oficial pruned int8, oficial pruned bf16 para el modelo de difusion; nvfp4 a int8_convrot para el text encoder), una API HTTP minimalista (`/gen`, `/r2v`, `/health`, `/job/{id}`) y una configuracion de endpoint privado con scale-to-zero sobre una A100 de 80 GB. La licencia declarada es Apache 2.0 y el unico idioma indicado es ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (pipeline de difusion MiniMax H3 servido via ComfyUI) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int8 (PinkCherry y oficial pruned), bf16 (oficial pruned), nvfp4 (text encoder qwen3vl-32b), int8_convrot (fallback del text encoder) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | No disponible (pesos gestionados por ComfyUI; el endpoint descarga aproximadamente 89 GB) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base MiniMax H3 ni sobre su proceso de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO). Lo que documenta el repositorio es la composicion del pipeline de inferencia: un modelo de difusion MiniMax H3 en su variante PinkCherry v1.5 (fine-tune completo NSFW para first/last-frame-to-video con audio), un segundo fine-tune beta-0.6 oficial ref2va para reference-to-video, text encoder qwen3vl-32b en nvfp4, VAE de video y de audio, y LoRAs turbo de 8 y 4 pasos.

La innovacion tecnica destacable esta en la orquestacion: ComfyUI fijado a una version concreta con nodos `MiniMaxH3*`, generacion de audio nativo dentro del MP4 de salida, ajuste de la longitud al grid del modelo `17k+5` frames (15 s equivalen a 362 frames), dos modos de inferencia (turbo con LoRA a fuerza 1.0 y 12 pasos euler/simple para i2v o 4 pasos res_multistep para r2v; calidad sin LoRA, 28 pasos con cfg 4.5 para i2v o 20 pasos para r2v) y una escalera de fallback automatica ante fallos de carga de pesos.

## Capacidades

- Generacion de video a partir de una imagen inicial (image-to-video) con fotograma final opcional.
- Generacion de video por referencia (reference-to-video) con entre 1 y 9 imagenes referenciadas en el prompt como `<Picture 1>` a `<Picture 9>`.
- Audio nativo embebido en el MP4 de salida.
- Control de duracion entre 4 y 15 segundos, con ajuste automatico al grid `17k+5` frames.
- Resolucion configurable con valor por defecto de 1344x768 (768p) y 24 fps.
- Dos modos de calidad: turbo (LoRA a fuerza 1.0, 12 pasos euler/simple en i2v o 4 pasos res_multistep en r2v) y calidad (sin LoRA, 28 pasos cfg 4.5 en i2v o 20 pasos en r2v).
- API HTTP con endpoints `/gen`, `/r2v`, `/health` y `/job/{id}` para sondeo de trabajos que exceden el presupuesto de espera del cliente.
- Soporte de seed para reproducibilidad.
- No se documentan capacidades de tool calling, function calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Prototipado de video generativo con audio para produccion audiovisual: el endpoint acepta una primera imagen y un prompt y devuelve un MP4 de hasta 15 segundos a 24 fps con pista de audio, lo que permite iterar sobre storyboards sin montar infraestructura propia.
- Animacion de fotogramas clave en postproduccion: la entrada `first_frame` y `last_frame` opcional permite interpolar movimiento entre dos imagenes concretas, util para transiciones o planos de continuidad.
- Generacion de video por referencia de personaje: el endpoint `/r2v` admite hasta 9 imagenes referenciadas en el prompt, lo que sirve para mantener consistencia visual de un personaje a lo largo de varias tomas.
- Creacion de contenido NSFW controlado en entornos privados: el fine-tune PinkCherry v1.5 esta orientado explicitamente a este dominio y el endpoint se despliega como servidor privado con scale-to-zero, lo que limita la exposicion publica.
- Pruebas de integracion de ComfyUI en pipelines automatizados: el servidor expone una API JSON sobre un ComfyUI fijado a una version concreta, lo que facilita tests de regresion sobre flujos de video generativo.
- Evaluacion comparativa de fine-tunes de video: la escalera de fallback (PinkCherry int8, oficial pruned int8, oficial pruned bf16) permite medir el impacto de la cuantizacion en la calidad de salida dentro del mismo endpoint.
- Demostraciones y entornos de investigacion con presupuesto acotado: el scale-to-zero con minimo 0 y maximo 1 instancia evita coste continuo cuando no hay peticiones, a cambio de un arranque en frio de 12 a 20 minutos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma desagregada; el endpoint declara una unica GPU A100 de 80 GB y una descarga de pesos de aproximadamente 89 GB.
- GPU recomendada segun la configuracion del autor: `nvidia-a100` x1 (80 GB) en AWS us-east-1.
- No se documenta compatibilidad con GPU de consumo; el tamano de pesos y la VRAM declarada hacen inviable el despliegue en tarjetas consumer convencionales.
- Opciones de despliegue: Hugging Face Inference Endpoints en modo Custom server (privado, scale-to-zero, minimo 0 y maximo 1 instancia), con imagen `pytorch/pytorch:2.8.0-cuda12.9-cudnn9-runtime`, comando `bash /repository/run.sh`, ruta de salud `/health` y puerto 8080.
- Arranque en frio: entre 12 y 20 minutos antes de que `/health` devuelva `comfy_up: true`, debido a la descarga de la imagen, la descarga de aproximadamente 89 GB de modelos y el arranque de ComfyUI.
- Latencia y throughput: no disponibles; el parametro `wait=3600` sugiere que el autor preve trabajos de hasta una hora antes de delegar al sondeo via `/job/{id}`.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de generacion de video con audio que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Contenido NSFW explicito: el fine-tune PinkCherry v1.5 esta disenado para material para adultos y el repositorio esta marcado como `not-for-all-audiences`; no es apto para entornos sin control de acceso.
- Licencia Apache 2.0 declarada, pero aplicada sobre pesos derivados de MiniMax H3 y de fine-tunes de terceros; conviene verificar las condiciones de cada componente antes de un uso comercial.
- Idioma unico declarado: ingles. No se documenta soporte multilingue.
- Riesgo de alucinacion visual y de artefactos propios de la difusion de video, especialmente en el modo turbo con solo 4 o 12 pasos.
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- Dependencia de una version concreta de ComfyUI (v0.46.0, commit `a277b5bf`); cambios en nodos o dependencias pueden romper el servidor.
- Arranque en frio de 12 a 20 minutos por el scale-to-zero, incompatible con cargas interactivas de baja latencia.
- Limite de una sola instancia (max 1) y de una unica GPU A100 de 80 GB, lo que restringe el throughput concurrente.
- El endpoint no expone capacidades de razonamiento, codigo ni tool calling; su alcance es exclusivamente la generacion de video con audio.
- La fecha de creacion del repositorio (2026-11-19) y la actualizacion posterior deben tenerse en cuenta al evaluar la vigencia de las dependencias fijadas.

## Enlaces

- Hugging Face: https://huggingface.co/jameskernedy/h3-pinkcherry-server
- ComfyUI: https://github.com/Comfy-Org/ComfyUI
- Fine-tune PinkCherry NSFW de MiniMax H3: https://huggingface.co/SexGod1979/PinkCherry-NSFW_MiniMax-H3
- LoRAs y pesos oficiales de MiniMax H3 para ComfyUI: https://huggingface.co/Comfy-Org/MiniMax-H3

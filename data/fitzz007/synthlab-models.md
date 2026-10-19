# Fitzz007/synthlab-models

## Resumen

SynthLab (repo `Fitzz007/synthlab-models`) no es un modelo entrenado, sino un sistema de orquestación de generación de imágenes que ejecuta un mismo prompt a través de varios backbones de difusión de forma secuencial. Está construido sobre ComfyUI como motor de inferencia y una interfaz web en Flask, y añade dos piezas propias: una verificación de calidad basada en CLIP (comparando la imagen generada con una imagen de referencia y con el prompt) y un mecanismo de fallback que salta al siguiente modelo si uno falla o no supera el umbral de calidad configurado.

El repo tiene 134 GB, se distribuye bajo licencia MIT según su model card y está etiquetado con la librería `diffusers`, pero no declara pipeline en HuggingFace ni ofrece pesos propios: lo que contiene son checkpoints, UNET/GGUF, text encoders, VAE y LoRAs de terceros organizados para ComfyUI. Los backbones que la model card menciona explícitamente son SDXL, SD 3 Medium, PixArt Sigma, AuraFlow, Kolors, HunyuanDiT y SD 1.5.

Su relevancia es acotada y muy específica: sirve como banco de pruebas local para comparar backbones sobre un mismo prompt con una métrica automática, en una máquina Windows con GPU NVIDIA de 6 GB (probado en una RTX 4050 Laptop). No hay resultados de benchmarks publicados, cero descargas y cero likes en el momento de la ficha, y no se documenta ningún entrenamiento propio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de orquestación sobre ComfyUI (backend) + Flask (UI); no es una arquitectura de red única |
| Parametros totales | no disponible (depende del checkpoint cargado; el repo no declara pesos propios) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la longitud del prompt la fija el text encoder de cada backbone) |
| Tipos de cuantizacion | safetensors y GGUF/UNET soportados por estructura de carpetas; cuantizaciones concretas no disponibles |
| Idiomas soportados | no disponible |
| Licencia | MIT según la model card; los metadatos de HuggingFace no declaran licencia |
| Formato de pesos | safetensors (.safetensors), GGUF, checkpoints ComfyUI, LoRAs |
| Tamano del repositorio | 134.0 GB |
| Libreria declarada | diffusers |
| Plataforma documentada | Windows 10/11, Python 3.10+, GPU NVIDIA con CUDA |
| VRAM probada por el autor | 6 GB (RTX 4050 Laptop) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-10-18 / 2026-10-18 |

## Arquitectura y entrenamiento

No hay entrenamiento. El sistema es un wrapper de inferencia: `setup.ps1` clona ComfyUI e instala dependencias, `models.json` actúa como registro de modelos (nombre, workflow y VRAM estimada), y `scripts/app.py` implementa la UI Flask y el worker de generación. Los flujos de trabajo se guardan como JSON en formato API de ComfyUI dentro de `workflows/`, de modo que cada backbone se invoca con su propio grafo (checkpoint o UNET + text encoder + VAE + LoRAs).

La innovación técnica es la capa de control sobre la inferencia, no la inferencia en sí: ejecución secuencial de todos los modelos habilitados para un mismo prompt, puntuación CLIP de cada salida frente a una imagen de referencia opcional y frente al texto, reintento o salto al siguiente modelo cuando la puntuación queda por debajo del umbral, y un runner CLI (`run_all_models.py`) para lotes. No se documentan datos de entrenamiento, RLHF/DPO ni optimizaciones de decoding (atención lineal, decodificación especulativa, etc.).

## Capacidades

- Generación texto-a-imagen con múltiples backbones: SDXL, SD 3 Medium, PixArt Sigma, AuraFlow, Kolors, HunyuanDiT y SD 1.5, entre otros que el usuario añada.
- Prompts positivos y negativos configurables desde la UI web.
- Verificación de calidad con CLIP: puntuación automática de la imagen generada contra una imagen de referencia y contra el prompt, con umbral configurable.
- Fallback automático entre modelos ante errores y reintento cuando la calidad no alcanza el umbral.
- Carga de LoRAs por carpeta (`comfyui/models/loras/`) para adaptar estilo o concepto sobre los backbones instalados.
- Ejecución por lotes desde CLI (`scripts/run_all_models.py`) además de la UI.
- Directorio de salida personalizable; las imágenes se guardan en `output/raw/` por defecto.
- Registro de modelos con VRAM declarada por entrada, útil para decidir qué backbones habilitar en GPUs pequeñas.
- Monitorización del progreso en el navegador durante la generación.
- No soporta: generación de texto, tool calling, razonamiento multi-paso, agentes, audio, vídeo ni edición/instrucción sobre imagen (la imagen de referencia se usa solo para scoring, no como condicionamiento).

## Casos de uso

- Comparativa de backbones sobre un mismo prompt: lanzar la misma frase a SDXL, SD 3 Medium, PixArt Sigma y SD 1.5 en una sola pasada y revisar las cuatro salidas junto a su puntuación CLIP; es el escenario para el que está diseñado el sistema.
- Selección automática de modelo por umbral de calidad: fijar un umbral CLIP y dejar que el pipeline descarte salidas mediocres y reintente o pase al siguiente backbone, útil para generar assets sin revisión manual de cada imagen.
- Generación de imágenes de catálogo con control contra referencia: subir una foto de producto como referencia y usar la puntuación CLIP para quedarse con las variaciones que más se le aproximan.
- Evaluación de LoRAs: entrenar o descargar una LoRA y medir su efecto sobre varios backbones con la misma métrica, en lugar de comparar a ojo.
- Prototipado en hardware modesto: con 6 GB de VRAM (RTX 4050 Laptop, el equipo en el que el autor lo probó) el fallback permite encadenar modelos ligeros y descartar automáticamente los que no caben o fallan.
- Generación por lotes de ilustración y concept art: usar `run_all_models.py` con una lista de prompts en `prompts/` para producir variantes masivas y filtrarlas después por CLIP score.
- Investigación sobre métricas prompt-imagen: el sistema deja las puntuaciones CLIP accesibles, lo que permite estudiar la correlación entre texto, referencia y calidad percibida en distintos backbones.
- Docencia y demos locales: UI web en `http://127.0.0.1:5000` sin dependencia de servicios en la nube, adecuada para talleres sobre difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas comparativas, FID, CLIP score medio ni tiempos de generación. El propio sistema produce puntuaciones CLIP por imagen, pero no se documenta ninguna ejecución de referencia con valores concretos.

## Requisitos de hardware

- Disco: 134 GB solo para el repositorio, más el espacio de los checkpoints que se añadan y de las imágenes generadas en `output/raw/`; conviene reservar varios cientos de GB.
- VRAM: la única cifra documentada es 6 GB (RTX 4050 Laptop), con modelos ligeros y fallback. Estimación a partir del tamano público de los backbones listados (no confirmada en este repo): PixArt Sigma (~0.6B) y SD 1.5 (~0.9B) caben en 6-8 GB; SDXL y Kolors (~2.6B-3.5B) requieren del orden de 8-12 GB en fp16; SD 3 Medium (~2B) y HunyuanDiT (~1.5B) en torno a 10-12 GB; AuraFlow (~6.8B) por encima de 16 GB o cuantización agresiva.
- GPU recomendadas por el autor: ninguna más allá de la RTX 4050 Laptop de 6 GB usada en las pruebas. Para encadenar SDXL o AuraFlow sin cuantizar se necesitan GPU de 16-24 GB (RTX 4090, A100, H100) según el backbone; dato no documentado en el repo.
- Cabe en GPU de consumo: sí, con SD 1.5, PixArt Sigma y modelos GGUF cuantizados; el límite práctico lo pone el backbone elegido, no el orquestador.
- Despliegue: ComfyUI como motor (soporta nodos GGUF para UNET), Flask para la UI, scripts `.ps1`/`.bat` para arranque. No aplica vLLM ni TGI (no es un LLM); llama.cpp solo de forma indirecta vía nodos GGUF de ComfyUI. No hay soporte documentado de Docker, Linux ni macOS.
- Latencia y throughput: no disponibles. La ejecución es secuencial, por lo que el tiempo total crece de forma aproximadamente lineal con el número de modelos habilitados, más los reintentos que dispare el umbral CLIP.

## Comparativa con modelos similares

No hay modelos comparables en el sentido estricto: SynthLab no es un modelo, sino una capa de orquestación. Se compara con herramientas de la misma categoría funcional.

| Caracteristica | SynthLab | ComfyUI | InvokeAI | Fooocus |
|---|---|---|---|---|
| Tipo | Orquestador multi-modelo + UI Flask | Motor de grafos nodales | Suite de generacion con UI | UI simplificada sobre SDXL |
| Licencia | MIT (solo el wrapper) | no verificada en la informacion disponible | no verificada en la informacion disponible | no verificada en la informacion disponible |
| Varios backbones en una pasada | Si, secuencial y automatico | Si, pero el grafo lo define el usuario | no disponible | No, un backbone por instalacion |
| Verificacion CLIP contra referencia | Si, integrada con umbral y reintento | Requiere nodos de terceros | no disponible | No documentada |
| Fallback automatico entre modelos | Si | No nativo | no disponible | No |
| Formatos de pesos | safetensors, GGUF | safetensors, GGUF, multiples | no disponible | safetensors |
| SO documentado | Windows 10/11 | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha |
| Madurez / adopcion | 0 descargas, 0 likes, autor unico | Muy extendido | Extendido | Extendido |

Nota: los datos de las columnas de ComfyUI, InvokeAI y Fooocus proceden de conocimiento general sobre esas herramientas y no se han podido verificar contra la informacion proporcionada; las celdas con "no disponible" reflejan esa falta de verificación, no una carencia de la herramienta.

## Limitaciones y advertencias

- No es un modelo cargable con `transformers` ni con un pipeline estándar de `diffusers`, pese a la etiqueta `diffusers` del repo: es una distribución de pesos y scripts para ComfyUI en Windows.
- Solo se documenta Windows 10/11 con CUDA; no hay instrucciones para Linux, macOS ni contenedores, lo que complica su uso en servidores.
- 134 GB de repositorio y cero descargas: la practica totalidad del peso corresponde a checkpoints de terceros, no a artefactos propios del autor.
- La licencia MIT cubre el código del wrapper, no los checkpoints subyacentes. SD 3 Medium, Kolors, HunyuanDiT y otros backbones tienen licencias propias con posibles restricciones de uso comercial y cláusulas de uso aceptable; hay que revisarlas por separado antes de cualquier despliegue en producción.
- El CLIP score es una métrica débil: mide similitud semántica global texto-imagen y tiende a favorecer ciertos estilos, pero no detecta errores de anatomía, texto ilegible, perspectiva incorrecta ni fidelidad estructural frente a la referencia. Usarlo como único filtro de calidad produce falsos positivos.
- Alucinación en el sentido de LLM no aplica; el riesgo equivalente es generar imágenes que se desvían del prompt sin que el umbral CLIP lo detecte.
- Idiomas de prompt no declarados: la cobertura lingüística depende del text encoder de cada backbone (CLIP o T5), sin garantías para castellano ni para idiomas distintos del inglés.
- La ejecución secuencial multiplica el coste: N modelos implican N generaciones completas más los reintentos, con el consumo de VRAM y de disco asociado.
- Sin evaluación publicada, sin tests ni CI, autor único y fechas de creación y actualización separadas por siete minutos: madurez muy baja, sin historial de mantenimiento.
- El servidor Flask escucha en `127.0.0.1:5000` y no se documenta autenticación, control de acceso ni validación de las imágenes de referencia subidas; no debe exponerse fuera de localhost sin trabajo adicional.
- No se declara `pipeline` en HuggingFace ni se especifica versión mínima de ComfyUI, de PyTorch o de CUDA, lo que puede provocar incompatibilidades al reproducir el entorno.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Fitzz007/synthlab-models
- ComfyUI (motor del que depende el proyecto, citado en la model card): https://github.com/comfyanonymous/ComfyUI
- No se han encontrado en la informacion disponible papers, blogs, demos, repositorios adicionales ni espacios de HuggingFace asociados.

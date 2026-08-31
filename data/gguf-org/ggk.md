# gguf-org/ggk

## Resumen

ggk es un paquete de software de código abierto desarrollado por la organización gguf-org que integra en una única herramienta tres funcionalidades principales: un servidor LLM compatible con la API de OpenAI, un generador de difusión para imagen, vídeo y audio, y un editor de metadatos y tensores GGUF con cuantizador incorporado. Se distribuye como paquete Python (`pip install ggk`) y utiliza un motor unificado compilado sobre la biblioteca de kernels `gk`, que reemplaza a ggml. El repositorio incluye un modelo de prueba de difusión en formato GGUF con aproximadamente 1.066 millones de parámetros, pero el paquete en sí no es un modelo de IA, sino una infraestructura para ejecutar y manipular modelos GGUF localmente.

Su relevancia radica en que ofrece una solución integral para desarrolladores e investigadores que trabajan con modelos GGUF, eliminando la necesidad de usar múltiples herramientas separadas (servidor, generador de difusión, editor). Al ser un proyecto experimental con soporte multi-GPU y backends opcionales (CUDA, HIP, Vulkan), está orientado a usuarios técnicos que buscan un control fino sobre el despliegue local de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (es un paquete de software, no un modelo) |
| Parametros totales | El modelo de prueba incluido tiene 1.066.235.384 parametros (en safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Soporta cuantizacion GGUF (ej. q4_k, q8_0) mediante su editor integrado |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (el modelo de prueba usa GGUF; los pesos originales del modelo de prueba estan en safetensors) |

## Arquitectura y entrenamiento

ggk no es un modelo entrenado, sino un motor de inferencia y edición. Su arquitectura de software se compone de un motor unificado (`vendor/engine`) que incluye los kernels de computación `gk`, una capa de compatibilidad con la API histórica de ggml, un runtime para LLM en formato GGUF, un servidor HTTP (gguf-server), un runtime de difusión y un cuantizador independiente.

El diseño clave es que todo el grafo de computación (construcción, asignación, planificación y ejecución) lo maneja `gk`, una biblioteca de kernels propia que soporta CPU (por defecto) y backends opcionales: Metal en macOS, CUDA para NVIDIA, HIP para AMD ROCm y Vulkan. El cuantizador usa un códec `qz_*` compilado tanto en la librería del editor como en `gk`, garantizando que el codificador y el decodificador siempre coincidan.

No hay información sobre entrenamiento, ya que no aplica a un paquete de software.

## Capacidades

- Servidor LLM compatible con OpenAI: permite exponer modelos GGUF mediante una API REST, usable desde cualquier cliente que hable el protocolo de OpenAI.
- Generación de imágenes por difusión: soporta modelos de difusión en formato GGUF (ej. `test-nvfp4.gguf`) con opciones como flash attention (`--diffusion-fa`) para acelerar el proceso.
- Generación de vídeo: mediante el modo `vid_gen` con modelos como wan-2.1, incluye control de resolución, número de frames y muestreo.
- Generación de audio: compatible con modelos como ace-step, con control de duración y pasos.
- Edición de imágenes: integra modelos de edición (mageflow) con referencia de imagen y prompts.
- Editor GGUF con cuantizador: permite inspeccionar metadatos, tensores y cuantizar modelos a distintos tipos (q4_k, q8_0, etc.) desde CLI o GUI.
- Soporte multi-GPU: el kernel `gk` soporta división de tensores entre múltiples GPUs, aunque es una característica experimental.
- Interfaz gráfica unificada: tres paneles (Server, Diffuser, Editor) en una sola GUI, además de acceso por CLI para scripting.

## Casos de uso

- Despliegue local de un LLM con API OpenAI: un desarrollador puede ejecutar `ggk server` para servir un modelo GGUF (ej. un Llama cuantizado) y consumirlo desde aplicaciones que ya usan la API de OpenAI, sin depender de servicios en la nube.
- Generación de imágenes en entornos sin GPU dedicada: con el backend CPU o Metal, un equipo de diseño puede generar prototipos visuales mediante prompts de texto, usando `ggk diffuser engine -m sd.gguf -p "..." -o out.png`.
- Cuantización de modelos para despliegue en edge: un ingeniero de MLOps puede usar `ggk editor quantize` para convertir un modelo en safetensors a GGUF cuantizado (q4_k) y reducir su tamaño para ejecutarlo en dispositivos con poca memoria.
- Pipeline de generación de vídeo automatizado: un creador de contenido puede integrar `ggk diffuser engine` en un script para producir clips cortos a partir de descripciones textuales, con control de resolución y estilo.
- Prototipado de aplicaciones multimodales: al combinar el servidor LLM con el generador de difusión, un investigador puede construir un demo que genere texto y luego imágenes a partir de ese texto, todo en un solo entorno.
- Auditoría y edición de archivos GGUF: un desarrollador que trabaja con modelos GGUF puede inspeccionar tensores, metadatos y cuantizar archivos sin salir de la herramienta, útil para depurar incompatibilidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye mediciones de velocidad, latencia o throughput para el servidor LLM ni para la generación de difusión. La única referencia de rendimiento es la opción `--diffusion-fa` que activa flash attention para acelerar el proceso de difusión, pero sin datos numéricos.

## Requisitos de hardware

- Inferencia en CPU: el paquete compila por defecto con soporte CPU; cualquier máquina moderna puede ejecutar el servidor LLM para modelos pequeños (1-3B) y la generación de imágenes, aunque con latencia alta.
- Backend Metal: en macOS, se puede usar la GPU integrada o discreta de Apple, adecuada para modelos medianos.
- Backend CUDA: requiere GPU NVIDIA con soporte CUDA; se recomienda al menos 8 GB de VRAM para modelos de difusión de 1B y 16 GB para LLMs de 7B cuantizados.
- Backend HIP: para GPUs AMD (ROCm), similar en requisitos a CUDA.
- Backend Vulkan: permite usar GPUs de diversos fabricantes, pero con menor optimización que los backends nativos.
- El repositorio no especifica VRAM mínima ni GPUs concretas recomendadas; depende del modelo que se ejecute. Para el modelo de prueba (1B de difusión), una RTX 3060 o superior con 8 GB sería suficiente.
- Opciones de despliegue: CLI directa, servidor HTTP, o GUI unificada. No se menciona integración con vLLM, Ollama o TGI; el paquete es autocontenido.

## Comparativa con modelos similares

No disponible. ggk no es un modelo de IA comparable con otros, sino una herramienta de software. No hay alternativas directas que integren servidor LLM, difusión y editor GGUF en un solo paquete. Se podría comparar con herramientas individuales como llama.cpp (para servidor) o ComfyUI (para difusión), pero ggk las combina con un editor propio.

## Limitaciones y advertencias

- El proyecto se describe como experimental: el kernel `gk` es "nuestro propio kernel experimental" y el soporte multi-GPU está en desarrollo, por lo que puede haber bugs o cambios de API.
- Dependencia de backends opcionales: el rendimiento sin GPU (solo CPU) será limitado para modelos grandes o generación de vídeo/audio.
- No se documentan sesgos ni riesgos de alucinación, ya que no es un modelo de lenguaje en sí; los riesgos dependen de los modelos que se ejecuten con ggk.
- Licencia MIT: permite uso comercial y modificación, pero no hay garantías de soporte oficial.
- El repositorio incluye un modelo de prueba de difusión (test-nvfp4.gguf) que parece ser de baja calidad (genera imágenes simples de animales), no apto para producción.
- La documentación es escasa: no hay guía detallada de configuración, y los ejemplos de CLI son los únicos recursos disponibles.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/gguf-org/ggk
- Referencia del kernel gk (GitHub): https://github.com/gguf-io/gk
- Modelo de difusión adicional (pixart-gguf): https://huggingface.co/gguf-org/pixart-gguf
- Modelo de vídeo (wan-1.3b-gguf): https://huggingface.co/calcuis/wan-1.3b-gguf
- Modelo de audio (ace-gguf): https://huggingface.co/calcuis/ace-gguf
- Modelo de edición (mageflow-gguf): https://huggingface.co/gguf-org/mageflow-gguf
- Pig-clip (modelos CLIP para baja VRAM): https://huggingface.co/gguf-org/pig-clip

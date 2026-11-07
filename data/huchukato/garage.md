# huchukato/garage

## Resumen

`huchukato/garage` no es un modelo de lenguaje propiamente dicho, sino un repositorio de artefactos de inferencia para el proyecto ComfyUI-Garage. Lo mantiene el usuario huchukato como archivo central de pesos y componentes que los workers Docker del proyecto descargan durante el aprovisionamiento mediante `hf download`. La librería declarada es wan2.2 y el tamaño del repositorio asciende a 296,9 GB, lo que refleja que agrupa checkpoints completos, VAEs, text encoders y upscalers en lugar de un único modelo.

El contenido cubre varias familias de modelos generativos: checkpoints SDXL de las variantes Illustrious, Pony y PimpMyPony, transformers de difusión Wan2.2 y LTX-2.5 (22B destilado en int8), un text encoder Gemma3 12B int8 con proyección para LTX-2.5, ControlNet SDXL, LoRAs (incluida una carpeta nsfw con 14 archivos), upscalers ESRGAN/RealESRGAN en `.pth` y ONNX con dimensiones dinámicas, y modelos RIFE 4.25/4.7/4.8/4.9 para interpolación de fotogramas.

Su relevancia es operativa más que investigadora: sirve como espejo reproducible de dependencias para pipelines de generación de imagen y vídeo en ComfyUI, con licencia MIT y convenciones estrictas de organización (solo `.pth` en `esrgan/`, solo `.onnx` en `onnx/`, entradas dinámicas en todos los ONNX). No se publican especificaciones de arquitectura propia ni resultados de evaluación, porque no se trata de un modelo entrenado por el autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (repositorio agregado de artefactos: SDXL, transformers de difusión Wan2.2 y LTX-2.5, Gemma3, RIFE, ESRGAN) |
| Parametros totales | No disponible (LTX-2.5 destilado citado como 22B int8; Gemma3 12B int8; resto sin especificar) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int8 (LTX-2.5 22B destilado y text encoder Gemma3 12B); resto sin cuantización declarada |
| Idiomas soportados | en, it |
| Licencia | MIT |
| Formato de pesos | safetensors (checkpoints, LoRAs, VAE, text encoders presumiblemente), `.pth` (upscalers ESRGAN en `esrgan/`), `.onnx` (RIFE y upscalers en `onnx/`) |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: agrega pesos de terceros organizados por función. La estructura incluye `checkpoints/` (Illustrious, PimpMyPony, Pony), `controlnet/` (ControlNet SDXL ProMax), `diffusion_models/` (5 archivos de Wan2.2 y LTX-2.5 22B destilado int8 en formato ComfyUI), `latent_upscale_models/` (upscalers espacial y temporal de LTX-2.5), `loras/` (subdivididas en illustrious, nsfw y pony), `text_encoders/` (Gemma3 12B int8 con proyección LTX-2.5), `vae/` (Wan2.1, SDXL y LTX-2.5 audio/vídeo), `esrgan/` (7 archivos `.pth`) y `onnx/` (4 modelos RIFE y 16 upscalers ESRGAN/RealESRGAN).

La innovación técnica del repositorio es de empaquetado y no de modelado: todos los ONNX se exportan con dimensiones de entrada dinámicas (batch, height y width simbólicos), se eliminan builds estáticas y duplicados, y se reconstruyó el historial para evitar objetos LFS huérfanos. La sincronización se hace desde un directorio local (`/Volumes/Storage/AI-Models/garage`) antes de publicar con `hf upload`, lo que garantiza coherencia entre el entorno de desarrollo y el remoto. No hay información sobre datasets, tokens de entrenamiento ni etapas de RLHF/DPO, ya que corresponde a los modelos originales subyacentes.

## Capacidades

- Generación de imágenes con checkpoints SDXL (Illustrious, Pony, PimpMyPony) y sus LoRAs asociadas.
- Generación de vídeo con transformers de difusión Wan2.2 y LTX-2.5 22B destilado int8 en formato ComfyUI.
- Codificación de texto para LTX-2.5 mediante Gemma3 12B int8 con proyección específica.
- Decodificación VAE para vídeo (Wan2.1, LTX-2.5 audio/vídeo) e imagen (SDXL).
- Control condicional de generación con ControlNet SDXL ProMax.
- Reescalado de imagen con ESRGAN/RealESRGAN en PyTorch (`.pth`) y en ONNX con entrada dinámica.
- Interpolación de fotogramas con RIFE 4.25, 4.7, 4.8 y 4.9 en ONNX.
- Upscaling latente espacial y temporal específico de LTX-2.5.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso ni matemáticas; el repositorio no contiene un LLM de propósito general.

## Casos de uso

- Aprovisionamiento de workers Docker: los contenedores de ComfyUI-Garage ejecutan `hf download huchukato/garage --local-dir <model_path>` para poblar el volumen de modelos de forma determinista, evitando descargas dispersas desde múltiples repositorios.
- Pipelines de generación de vídeo con ComfyUI: los transformers Wan2.2 y LTX-2.5 22B int8 se cargan directamente desde `diffusion_models/`, con los VAE correspondientes en `vae/`, lo que reduce el trabajo de configuración manual de rutas.
- Postprocesado de vídeo: los modelos RIFE en `onnx/rife/` permiten interpolar fotogramas para elevar la tasa de refresco sin reentrenar ni recurrir a herramientas externas, con entradas dinámicas que admiten distintas resoluciones.
- Reescalado de imágenes en producción: los 16 upscalers ESRGAN/RealESRGAN en `onnx/upscale/` se integran en flujos ONNX Runtime con batch y resolución variables, útiles para pipelines por lotes.
- Reproducción de entornos en Vast.ai: los scripts y Dockerfiles del proyecto apuntan a este repositorio, de modo que un despliegue en instancias alquiladas obtiene exactamente los mismos pesos que el entorno local.
- Experimentación con LoRAs sobre SDXL: las carpetas `loras/illustrious/` y `loras/pony/` permiten aplicar ajustes de estilo sobre los checkpoints correspondientes con nombres coherentes con ComfyUI-Manager.
- Archivo y control de versiones de pesos: al estar reconstruido sin objetos LFS huérfanos, sirve como referencia estable de qué versión de cada componente usa el proyecto en un momento dado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM: no disponible de forma agregada; el repositorio ocupa 296,9 GB en disco, por lo que el almacenamiento es el primer requisito (volumen de al menos 300 GB para una descarga completa).
- Componentes individuales con demanda conocida por su tamaño declarado: LTX-2.5 22B destilado int8 y Gemma3 12B int8 requieren GPUs de gama alta para inferencia en precisión de 8 bits; no se especifican mínimos exactos.
- GPU recomendadas: no disponibles en la información proporcionada. Por el perfil de los componentes (difusión de vídeo de 22B y text encoder de 12B), un uso realista apunta a A100/H100 o GPUs consumer de 24 GB o más, pero esto es una inferencia y no un dato del repositorio.
- Despliegue: ComfyUI (formato nativo de los `diffusion_models`), ONNX Runtime para `onnx/rife/` y `onnx/upscale/`, y PyTorch para los `.pth` de `esrgan/`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefactos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Repositorio | Contenido | Tamaño | Licencia | Enfoque |
|---|---|---|---|---|
| huchukato/garage | SDXL, Wan2.2, LTX-2.5, Gemma3, RIFE, ESRGAN, ControlNet, LoRAs | 296,9 GB | MIT | Archivo agregado para workers Docker de un proyecto concreto |
| Repositorios oficiales de SDXL (Stability AI) | Checkpoints SDXL y variantes | Variable | Licencias específicas por modelo | Publicación de un modelo concreto |
| Repositorios oficiales de Wan2.2 / LTX-2.5 | Transformers de difusión de vídeo | Variable | Según cada proyecto | Publicación de un modelo concreto |
| Repositorios de upscalers (Real-ESRGAN, RIFE) | Pesos `.pth` y ONNX | Decenas o cientos de MB | BSD/MIT según proyecto | Utilidades de postprocesado |

La comparación directa no es homogénea: `garage` no compite con un modelo, sino que empaqueta varios. Su ventaja es la reproducibilidad y la organización por función; su desventaja es que no ofrece garantías de versionado semántico ni documentación de procedencia por archivo más allá de la estructura de carpetas.

## Limitaciones y advertencias

- No es un modelo entrenado por el autor: no hay model card técnica con arquitectura, datos ni evaluación; cualquier uso requiere consultar la documentación de los modelos originales (SDXL, Wan2.2, LTX-2.5, Gemma3, RIFE, ESRGAN).
- El repositorio incluye una carpeta `loras/nsfw/` con 14 archivos; su uso en productos comerciales o públicos exige revisión legal y de política de contenido independiente de la licencia MIT del repositorio.
- La licencia MIT del repositorio no sustituye las licencias de los pesos subyacentes: SDXL, Wan2.2, LTX-2.5 y Gemma3 tienen términos propios que pueden restringir el uso comercial.
- El tamaño de 296,9 GB implica costes de almacenamiento y transferencia significativos; descargas parciales o interrumpidas pueden dejar el entorno inconsistente si no se verifica la integridad.
- El campo `pipeline` no está disponible y la librería declarada (`wan2.2`) no describe el conjunto heterogéneo de artefactos, lo que puede confundir a herramientas de descubrimiento automático.
- Los idiomas declarados (en, it) corresponden probablemente a la documentación y a los prompts soportados por los modelos subyacentes, no a una capacidad multilingüe medida.
- Riesgo de alucinación y sesgos: no evaluables a nivel de repositorio; dependen de cada modelo de difusión y del text encoder utilizados.
- El repositorio se describe como privado y sincronizado manualmente antes de publicarse; no hay garantía de actualizaciones periódicas ni de un esquema de versiones estable.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/huchukato/garage
- Árbol de archivos: https://huggingface.co/huchukato/garage/tree/main
- Proyecto ComfyUI-Garage: https://github.com/huchukato/ComfyUI-Garage

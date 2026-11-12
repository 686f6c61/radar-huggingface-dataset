# SEEDRAAI/SEEDRAAI-Beige-Models

## Resumen

SEEDRAAI Beige Models no es un modelo generativo único, sino una biblioteca de pesos empaquetada por el usuario SEEDRAAI para su uso con el conjunto de flujos de trabajo "SEEDRAAI Beige" en ComfyUI. El repositorio agrupa ficheros de terceros orientados a generación de imágenes, edición, generación de vídeo y reescalado (upscaling), organizados en carpetas que deben copiarse bajo `ComfyUI/models/`. Su función es servir de dependencia reproducible para dichos flujos, no de modelo entrenado por el autor del repo.

El contenido es heterogéneo: incluye familias como Krea 2 Turbo, MOSS-Image, MiniMax H3 (y su variante Singularity), SeedVR2, SCAIL-2 y componentes de Wan 2.1 (VAE y codificador de texto UMT5). Cada familia conserva la autoría y licencia de su origen, y el repositorio incluye conversiones de Comfy-Org y adaptadores LoRA de distintos distribuidores. El tamaño del repositorio, 142,6 GB, refleja la acumulación de pesos en múltiples formatos y cuantizaciones.

Es relevante ahora porque simplifica el despliegue de pipelines multimodales de imagen y vídeo en ComfyUI, pero conviene tratarlo como un agregador: la evaluación técnica debe hacerse sobre cada modelo constituyente, no sobre el paquete en su conjunto. La información pública del repo no detalla arquitecturas, parámetros ni contextos de cada componente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (agregado de múltiples familias: difusión para imagen/vídeo, VAE, codificadores de texto) |
| Parámetros totales | no disponible (varía por fichero; el repo pesa 142,6 GB) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repo incluye conversiones y cuantizaciones de terceros, sin detallar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible a nivel de repo; licencias individuales por fichero (Krea 2 Community License, MiniMax H3 Community License, Apache-2.0, MIT) |
| Formato de pesos | no disponible (ficheros para ComfyUI, presumiblemente safetensors y GGUF, sin confirmar) |

## Arquitectura y entrenamiento

El repositorio no documenta una arquitectura propia ni un proceso de entrenamiento. Se trata de una colección curada de pesos de terceros: modelos de difusión para generación y edición de imagen (Krea 2 Turbo, MOSS-Image), modelos de vídeo (MiniMax H3, SCAIL-2), un modelo de reescalado (SeedVR2-3B) y componentes auxiliares (VAE y codificador UMT5 de Wan 2.1). Las conversiones proceden mayoritariamente de Comfy-Org, y los adaptadores LoRA de distribuidores como WarmBloodAban, Alissonerdx, Danrisi, Pika-Labs, akatz-ai, fal y lightx2v.

No hay información sobre número de tokens de entrenamiento, composición del dataset, ni técnicas de alineación (RLHF/DPO) para los componentes. Cualquier innovación técnica (decodificación especulativa, atención lineal, etc.) debe consultarse en las model cards originales enlazadas en el README, no en este repositorio.

## Capacidades

- Generación de imágenes a partir de texto mediante los flujos de Krea 2 Turbo y MOSS-Image.
- Edición de imágenes, según la descripción del paquete de flujos.
- Generación de vídeo con MiniMax H3 y SCAIL-2.
- Reescalado de imagen y vídeo con SeedVR2-3B.
- Intercambio de caras y personajes mediante LoRA (FaceSync, H3 Character Swap).
- Estilización y realismo mediante LoRA (Muse, H3 Realism, H3 Flex Turbo, H3 Turbo).
- Integración con ComfyUI como entorno de ejecución de los grafos de trabajo.
- Tool calling, agentes, razonamiento multi-paso y capacidades multilingües: no disponible (no es un modelo de lenguaje).

## Casos de uso

- Producción de ilustraciones para contenido editorial: los flujos con Krea 2 Turbo y MOSS-Image permiten generar imágenes coherentes con un estilo definido, cargando los pesos desde `ComfyUI/models/` y encadenando el VAE y el codificador UMT5 de Wan 2.1.
- Edición fotográfica asistida: el paquete incluye flujos de edición que combinan modelos de imagen con LoRA de realismo (H3 Realism) para retocar retratos manteniendo identidad y textura de piel.
- Generación de clips para redes sociales: MiniMax H3 y SCAIL-2 permiten text-to-video y image-to-video en ComfyUI, con adaptadores Turbo para reducir pasos de muestreo.
- Sustitución de personajes en vídeo: el LoRA H3 Character Swap y FaceSync facilitan el reemplazo de rostros en secuencias existentes, útil en prototipado de anuncios.
- Restauración y reescalado de material audiovisual antiguo: SeedVR2-3B aplicado sobre fotogramas o vídeo de baja resolución para obtener versiones de mayor calidad antes de montaje.
- Creación de assets para videojuegos: generación de texturas, concept art y sprites mediante los flujos de imagen, con variantes estilizadas vía LoRA Muse.
- Reproducibilidad de pipelines: al fijar versiones de pesos y LoRA, el repositorio sirve como referencia para reconstruir entornos de inferencia en equipos distintos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma agregada. Cada familia tiene requisitos propios; el repositorio de 142,6 GB no cabe íntegro en una GPU consumer.
- GPU recomendadas: no disponible. Para modelos de vídeo de la escala de MiniMax H3 se requiere habitualmente hardware de datacenter (A100, H100), pero no se confirma en la información disponible.
- Compatibilidad con GPU consumer: no confirmada; depende del componente concreto y de su cuantización.
- Opciones de despliegue: ComfyUI es el entorno previsto. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a modelos de difusión).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SEEDRAAI Beige Models | no disponible (agregado, 142,6 GB) | no disponible | no disponible | por fichero | Hugging Face, repo público |
| Krea 2 Turbo (origen) | no disponible | no disponible | no disponible | Krea 2 Community License | Hugging Face |
| MiniMax H3 (origen) | no disponible | no disponible | no disponible | MiniMax H3 Community License | Hugging Face |
| SeedVR2-3B (origen) | 3B (según nombre) | no disponible | no disponible | no disponible | Hugging Face |

La comparativa directa no es significativa porque el repositorio agrega varios modelos; para evaluar alternativas conviene comparar cada familia por separado con sus equivalentes (por ejemplo, otros modelos de vídeo o de upscaling).

## Limitaciones y advertencias

- No es un modelo entrenado por SEEDRAAI: la calidad, sesgos y comportamiento dependen de cada modelo de origen.
- Licencias heterogéneas: Krea 2 Community License y MiniMax H3 Community License imponen condiciones específicas; los componentes Apache-2.0 y MIT son más permisivos. Verificar cada fichero antes de uso comercial o redistribución.
- El repositorio está "en construcción" según el README; los ficheros disponibles pueden cambiar sin aviso.
- Riesgo de alucinación visual (artefactos, incoherencias anatómicas o temporales) inherente a los modelos generativos de imagen y vídeo.
- No hay información sobre sesgos demográficos ni sobre el tratamiento de contenido sensible.
- El tamaño de 142,6 GB dificulta la descarga y el almacenamiento; conviene descargar solo las carpetas necesarias.
- No se documentan requisitos mínimos de hardware ni versiones de ComfyUI compatibles.
- La fecha de creación del repo (2026-11-12) y la ausencia de descargas o likes no permiten validar su madurez ni su mantenimiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SEEDRAAI/SEEDRAAI-Beige-Models
- Krea 2 Turbo: https://huggingface.co/krea/Krea-2-Turbo
- Conversión Comfy-Org de Krea 2: https://huggingface.co/Comfy-Org/Krea-2
- MOSS-Image Base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Conversión Comfy-Org de MOSS-Image: https://huggingface.co/Comfy-Org/MOSS-Image
- MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Conversión Comfy-Org de MiniMax H3: https://huggingface.co/Comfy-Org/MiniMax-H3
- Codificador Qwen3-VL-32B-Instruct-NVFP4 (cybermotaz): https://huggingface.co/cybermotaz/Qwen3-VL-32B-Instruct-NVFP4
- MiniMax H3 Singularity (WarmBloodAban): https://huggingface.co/WarmBloodAban/Minimax-h3_Singularity
- SeedVR2-3B: https://huggingface.co/ByteDance-Seed/SeedVR2-3B
- Ficheros ComfyUI de SeedVR2 (numz): https://huggingface.co/numz/SeedVR2_comfyUI
- SCAIL-2: https://huggingface.co/zai-org/SCAIL-2
- Conversión Comfy-Org de SCAIL-2: https://huggingface.co/Comfy-Org/SCAIL-2
- Wan 2.1 T2V 14B: https://huggingface.co/Wan-AI/Wan2.1-T2V-14B
- Repack ComfyUI de Wan 2.1: https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged
- LoRA FaceSync: https://huggingface.co/Alissonerdx/BFS-Best-Face-Swap
- LoRA Muse: https://huggingface.co/Danrisi/nicegirls_v2_moss
- LoRA H3 Flex Turbo: https://huggingface.co/Pika-Labs/Pika-H3-Flex-Turbo-LoRA
- LoRA H3 Character Swap: https://huggingface.co/akatz-ai/MiniMax-H3-Character-Swap-LoRA
- LoRA H3 Realism: https://huggingface.co/fal/MiniMax-H3-Realism-People-LoRA
- LoRA H3 Turbo: https://huggingface.co/lightx2v/Minimax-h3-Turbo
- Licencia MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE

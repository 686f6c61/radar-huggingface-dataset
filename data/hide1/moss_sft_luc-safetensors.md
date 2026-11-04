# hide1/moss_sft_Luc.safetensors

## Resumen

MOSS-LUC v3 es un checkpoint de generación de imágenes texto-a-imagen orientado a estilo anime, publicado por el usuario hide1 en Hugging Face. Se trata de un merge de checkpoints derivados de OpenMOSS-Team/MOSS-Image-SFT, el modelo base de difusión desarrollado por OpenMOSS, combinado con ajustes LoRA de estilo anime y sin censura. El repositorio distribuye dos variantes cuantizadas del modelo: FP8 E4M3 con precisión mixta e INT8 ConvRot, lo que reduce el peso respecto al checkpoint original en BF16.

El modelo no introduce una arquitectura nueva: es un fine-tune/merge sobre MOSS-Image SFT, un modelo de difusión para text-to-image que se ejecuta en ComfyUI con un text encoder Qwen3.5 de 9B y un VAE separado. La versión v3 ajusta el contraste, busca resultados más consistentes con schedulers estándar y modifica ligeramente la estética de los personajes respecto a versiones anteriores.

Su relevancia práctica es acotada: se dirige a usuarios de ComfyUI y Civitai que generan ilustración anime con pipelines MOSS-Image, y ofrece cuantizaciones listas para usar con el LoRA de aceleración DMD de 8 pasos. No es un modelo de propósito general ni un modelo de lenguaje, y no dispone de documentación técnica sobre entrenamiento, datos o evaluación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión text-to-image (base: MOSS-Image SFT); detalles de arquitectura no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusión, no de lenguaje) |
| Tipos de cuantizacion | FP8 E4M3 (precisión mixta: 160 pesos del transformer en FP8, resto en BF16); INT8 ConvRot |
| Idiomas soportados | no disponible (prompts en inglés en los ejemplos de la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un checkpoint de difusión para generación de imágenes, construido como merge de checkpoints basados en OpenMOSS-Team/MOSS-Image-SFT con ajustes LoRA. La model card indica que se combinan checkpoints MOSS con LoRA de estilo anime y sin censura, atribuidos a axiomofmind, y que la v3 ajusta el contraste y la consistencia de resultados con schedulers estándar, además de un aspecto ligeramente más "cute" de los personajes. No se especifican el número de parámetros, la arquitectura interna del transformer de difusión, el volumen de datos de entrenamiento ni si hubo etapas de RLHF/DPO (no aplicables de forma estándar en difusión).

La innovación técnica documentada es la cuantización: el archivo FP8 usa precisión mixta con 160 pesos del transformer en FP8 E4M3 y el resto en BF16; el archivo INT8 ConvRot aplica cuantización INT8. El pipeline de inferencia requiere cargar por separado el text encoder compatible con MOSS (Qwen3.5 9B) y el VAE, y admite un LoRA DMD opcional para generación en 8-10 pasos.

## Capacidades

- Generación de imágenes texto-a-imagen con estética anime, incluyendo retratos de personajes y composiciones con iluminación y texturas detalladas.
- Soporte de prompts positivos y negativos, con énfasis en control de calidad ("masterpiece, best quality, amazing quality") y supresión de artefactos ("worst quality, low quality, bad anatomy, jpeg artifacts").
- Integración con ComfyUI mediante el nodo Load Diffusion Model en flujos de trabajo MOSS-Image.
- Compatibilidad con el LoRA de aceleración DMD de 8 pasos, que reduce el número de pasos de muestreo a 8-10.
- Compatibilidad con los schedulers Beta y MOSS Shift Scheduler, con valores de CFG recomendados entre 2 y 5.
- Generación sin censura según los LoRA incorporados (la model card menciona un LoRA "uncensored").
- No dispone de tool calling, razonamiento multi-paso, capacidades de agente, visión de entrada ni audio: es exclusivamente un modelo de generación de imágenes.

## Casos de uso

- Ilustración de personajes anime para proyectos personales: el checkpoint está ajustado para retratos y figuras estilizadas, con prompts de personaje y estilo documentados en el catálogo MOSS-Image Character & Style Catalog.
- Prototipado rápido de conceptos visuales en ComfyUI: con el LoRA DMD y 8-10 pasos, permite iterar sobre variaciones de una idea con latencia reducida frente a muestreos de 20-30 pasos.
- Generación de arte para fan art y proyectos creativos no comerciales o comerciales bajo Apache 2.0: la licencia permisiva facilita su uso en productos derivados, siempre que se respeten las condiciones de la licencia del modelo base.
- Creación de datasets sintéticos de imágenes anime para entrenamiento o aumento de datos: la posibilidad de generar lotes con seeds y prompts controlados permite construir corpus etiquetados de estilo consistente.
- Integración en flujos de trabajo de Civitai y ComfyUI para usuarios que ya operan con el ecosistema MOSS-Image: el archivo INT8 ConvRot está publicado también en Civitai, lo que simplifica la distribución.
- Exploración de estilos con prompts de atmósfera (iluminación suave, sombras, textura de tela): útil para artistas que buscan referencias de composición e iluminación antes de pintar.
- Despliegue en entornos con VRAM limitada mediante las cuantizaciones FP8 e INT8, que reducen el peso del checkpoint frente a BF16 (tamaño del repo: 11,3 GB para el conjunto de archivos).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio ocupa 11,3 GB e incluye variantes FP8 e INT8; el checkpoint en BF16 sería sustancialmente mayor. Se requiere además cargar el text encoder Qwen3.5 9B y el VAE, lo que incrementa el consumo total.
- GPU recomendadas: no disponible. Por el tamaño del text encoder (9B) y el checkpoint de difusión, se necesita una GPU con al menos 16-24 GB de VRAM para un flujo completo en ComfyUI, aunque este dato no está confirmado en la documentación.
- ¿Cabe en GPU de consumo? No confirmado. Las cuantizaciones FP8 e INT8 están pensadas para reducir requisitos, pero la model card no especifica VRAM mínima ni GPUs probadas (RTX 4090, etc.).
- Opciones de despliegue: ComfyUI (flujo principal documentado), con nodos Load Diffusion Model, text encoder y VAE separados. También se mencionan integraciones con Forge Neo mediante el scheduler MOSS. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI (no aplicables a difusión en este formato).
- Latencia y throughput: no disponibles. La model card sugiere 8-10 pasos con el LoRA DMD y CFG 2-5, lo que reduce el coste computacional frente a configuraciones estándar, pero no se aportan cifras de tiempo por imagen.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-LUC v3 | Difusión text-to-image (merge anime) | no disponible | no aplica | Apache 2.0 | Hugging Face, Civitai |
| OpenMOSS-Team/MOSS-Image-SFT | Difusión text-to-image (base) | no disponible | no aplica | Apache 2.0 | Hugging Face |
| axiomofmind/Moss-image-anime-lora | LoRA sobre MOSS-Image | no disponible | no aplica | no disponible en la información | Hugging Face |
| axiomofmind/Moss-image-nsfw-uncensored-lora | LoRA sobre MOSS-Image | no disponible | no aplica | no disponible en la información | Hugging Face |

No se dispone de datos de rendimiento comparativo (FID, CLIP score, preferencia humana) entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al ser un merge con LoRA de anime y sin censura, puede reproducir sesgos estéticos y de representación propios del dataset de entrenamiento del modelo base y de los LoRA, no auditados públicamente.
- Riesgo de alucinación visual: como todo modelo generativo, puede producir anatomía incorrecta (manos, pies), artefactos JPEG y texto ilegible; la model card incluye términos negativos específicos para mitigarlo.
- Limitaciones de contexto e idioma: no hay información sobre idiomas soportados; los ejemplos de prompts están en inglés y el modelo base está documentado en ese idioma. El rendimiento con prompts en castellano no está verificado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero deben respetarse las licencias del modelo base (OpenMOSS-Team/MOSS-Image-SFT) y de los LoRA incorporados; la model card no detalla las condiciones de los LoRA de axiomofmind más allá del enlace.
- Contenido sin censura: el checkpoint incorpora un LoRA "uncensored", lo que implica riesgo de generar contenido no apto para todos los públicos; se recomienda filtrado y políticas de uso en producción.
- Falta de documentación técnica: no hay datos de parámetros, arquitectura interna, dataset ni evaluación; esto dificulta la reproducibilidad y la comparación objetiva.
- Requisitos de inferencia no especificados: la VRAM mínima, las GPUs validadas y el rendimiento real no están documentados, lo que obliga a probar empíricamente antes de desplegar.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hide1/moss_sft_Luc.safetensors
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Licencia del modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT/blob/main/LICENSE
- Archivos y workflows de ComfyUI: https://huggingface.co/Comfy-Org/MOSS-Image
- LoRA anime de axiomofmind: https://huggingface.co/axiomofmind/Moss-image-anime-lora
- LoRA sin censura de axiomofmind: https://huggingface.co/axiomofmind/Moss-image-nsfw-uncensored-lora
- LoRA DMD de 8 pasos: https://huggingface.co/lodestones/MOSS-Image-SFT-8-steps-dmd/blob/main/lora_latest.safetensors
- Scheduler MOSS para ComfyUI: https://github.com/ukr8b3g-cmyk/ComfyUI-MOSS-Shift-Scheduler
- Scheduler MOSS para Forge Neo: https://github.com/ukr8b3g-cmyk/sd-webui-forge-neo-moss-scheduler
- Catálogo de personajes y estilos: https://huggingface.co/spaces/hide1/MOSS-Image-Character-Catalog
- Publicación en Civitai: https://civitai.red/models/3027480/mossluc-moss-image-checkpoint

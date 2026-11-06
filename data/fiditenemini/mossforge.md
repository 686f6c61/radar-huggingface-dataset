# FiditeNemini/MossForge

## Resumen

MossForge es un paquete de pesos (model bundle) publicado en Hugging Face por el usuario FiditeNemini, diseñado como espejo de los pesos de MOSS-Image, el modelo de generación de imágenes del equipo OpenMOSS. No se trata de un modelo nuevo, sino de una recopilación organizada de los pesos originales de MOSS-Image (versiones SFT y Base), el codificador de texto Qwen3.5-9B en int8, el VAE de FLUX.2 y varias LoRAs de aceleración tipo Turbo (4 y 8 pasos, basadas en DMD), todo empaquetado con la estructura exacta que espera la carpeta `models/` de MossForge, un estudio nativo de macOS para generar imágenes con MOSS-Image.

El paquete incluye un manifiesto (`mossforge-manifest.json`) que permite a la aplicación de escritorio descargar solo los grupos deseados y verificar la integridad de cada archivo mediante SHA-256. Es relevante porque simplifica la puesta en marcha de MOSS-Image en macOS con MLX, evitando al usuario localizar y ensamblar manualmente diffusion models, text encoders, VAE y LoRAs compatibles. El peso total del repositorio es de 46,1 GB, con un grupo esencial de 15,5 GB y pesos de diffusion model en bf16 de unos 10,2 GB cada uno.

Cabe subrayar que es un proyecto no oficial, sin afiliación con OpenMOSS, y que todos los archivos incluidos conservan su licencia original Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) para generación de imágenes + text encoder Qwen3.5-9B + VAE de FLUX.2 |
| Parametros totales | no disponible (el DiT en bf16 ocupa ~10,2 GB; el text encoder Qwen3.5-9B en int8) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (DiT), int8 ConvRot (text encoder y variante fusionada) |
| Idiomas soportados | no disponible (text encoder basado en Qwen3.5-9B, presumiblemente multilingüe) |
| Licencia | Apache-2.0 (todos los componentes) |
| Formato de pesos | safetensors (con sidecars `.mfmeta.json`), librería MLX |

## Arquitectura y entrenamiento

El paquete no contiene un modelo entrenado por su autor, sino pesos de terceros. El componente principal es MOSS-Image de OpenMOSS Team, un diffusion transformer (DiT) distribuido en dos variantes: Base (preentrenada) y SFT (ajustada por supervisión), ambas en bf16 con un tamaño de ~10,2 GB por archivo. Como codificador de texto emplea Qwen3.5-9B, incluido en versión int8 con la técnica ConvRot, junto con su tokenizador oficial. El espacio latente proviene del VAE de FLUX.2 (`ae.safetensors`).

Sobre el entrenamiento de MOSS-Image (numero de tokens o imágenes, composición del dataset, uso de RLHF/DPO) no se ha publicado información en la model card de este repositorio. El paquete añade además LoRAs de destilación de pasos (DMD) creadas por la comunidad —lodestones (8 pasos para SFT y Base) y akhaliq (4 pasos para SFT)— que reducen drásticamente el numero de pasos de inferencia manteniendo CFG 1. Destaca un archivo fusionado por el propio MossForge: la LoRA de akhaliq integrada en el modelo SFT en fp32 y luego cuantizada a int8 ConvRot, que funciona con el sampler Euler estándar en 4 pasos.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) mediante MOSS-Image SFT o Base en formato Comfy/MLX.
- Aceleración de inferencia mediante LoRAs de destilación: 4 pasos (akhaliq, SFT) u 8 pasos (lodestones, SFT y Base).
- Codificación de prompts con Qwen3.5-9B en int8, lo que reduce la huella de memoria del text encoder.
- Integración con la aplicación MossForge para macOS, con verificación de integridad SHA-256 y descarga selectiva por grupos.
- Extensibilidad: admite añadir pesos y LoRAs adicionales a la carpeta `models/`, que la aplicación detecta automáticamente.
- Compatibilidad con los pesos repackados de Comfy-Org/MOSS-Image, lo que facilita su uso también en flujos tipo ComfyUI.

No se ha publicado información sobre capacidades de edición de imágenes, inpainting, visión o tool calling en la documentación disponible.

## Casos de uso

- Generación de imágenes local en macOS: el paquete está diseñado para MLX, de modo que un usuario con un Mac equipado con Apple Silicon puede ejecutar MOSS-Image sin GPU NVIDIA, descargando el grupo `essentials` (15,5 GB) más la variante SFT o Base.
- Prototipado rapido de text-to-image: gracias a las LoRAs Turbo de 4 y 8 pasos, se pueden generar imágenes en pocos pasos con CFG 1, adecuado para iterar sobre prompts en tiempo casi interactivo.
- Integración en flujos ComfyUI: los pesos provienen del repack de Comfy-Org/MOSS-Image, por lo que pueden reutilizarse en workflows de ComfyUI en otros entornos.
- Experimentación con destilación de difusión: los archivos fusionados (LoRA akhaliq integrada en SFT con int8 ConvRot) sirven como referencia de cómo fusionar y cuantizar LoRAs de destilación para inferencia en pocos pasos.
- Despliegue reproducible en equipos: el manifiesto con hashes SHA-256 permite instalar el mismo conjunto de pesos en varias máquinas con garantía de integridad.
- Comparación entre variantes Base y SFT: al incluir ambas (10,2 GB cada una), los investigadores pueden evaluar el efecto del ajuste supervisado sobre el modelo base con el mismo VAE y text encoder.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Espacio en disco: 46,1 GB para el repositorio completo; 15,5 GB para el grupo `essentials`; ~10,2 GB adicionales por cada variante (SFT o Base) en bf16; ~1,2 GB por cada LoRA Turbo.
- Memoria unificada (Apple Silicon): no disponible de forma explicita; dado un DiT de ~10,2 GB en bf16 más el text encoder de 9B en int8 (~9-10 GB) y el VAE, es razonable asumir que se necesita un Mac con al menos 32 GB de memoria unificada; con 64 GB se trabajaria con margen. No hay cifras oficiales publicadas.
- GPU: orientado a macOS con MLX (Apple Silicon). Al ser pesos repackados de Comfy-Org, también podrían usarse en GPU NVIDIA via ComfyUI, aunque el paquete está pensado para el flujo MossForge/MLX.
- Despliegue: aplicación MossForge para macOS (descarga y verificación automatica via manifiesto); los pesos individuales pueden cargarse en ComfyUI o en pipelines MLX propios.
- Latencia y throughput: no disponibles; las LoRAs de 4 y 8 pasos con CFG 1 indican inferencia en pocos pasos, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Componentes | Tamano aprox. | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FiditeNemini/MossForge | Paquete de pesos (espejo) | MOSS-Image SFT/Base + Qwen3.5-9B int8 + VAE FLUX.2 + LoRAs Turbo | 46,1 GB (total) | Apache-2.0 | Hugging Face, orientado a MossForge/macOS |
| Comfy-Org/MOSS-Image | Repack oficial para ComfyUI | DiT + text encoder + VAE | no disponible | Apache-2.0 | Hugging Face |
| OpenMOSS-Team/MOSS-Image-SFT | Modelo original | DiT SFT + componentes asociados | no disponible | Apache-2.0 | Hugging Face |

La diferencia principal es que MossForge no es un modelo nuevo sino un empaquetado no oficial con estructura fija, manifiesto con SHA-256 y LoRAs de destilación preseleccionadas, mientras que los repositorios originales ofrecen los pesos en su forma canonica.

## Limitaciones y advertencias

- No es un modelo nuevo: es un espejo no oficial de pesos de terceros, sin afiliación ni respaldo de OpenMOSS; cualquier problema con los pesos debe reportarse a los repositorios originales.
- No hay model card técnica propia: no se documentan limitaciones del modelo subyacente (sesgos, riesgo de alucinación visual, restricciones de contenido), por lo que conviene revisar la documentación de OpenMOSS-Team/MOSS-Image.
- Información incompleta: no se publican benchmarks, requisitos de memoria exactos ni detalles del entrenamiento de MOSS-Image.
- El grupo `essentials` y las variantes SFT/Base son opcionales y se descargan por separado; usar solo `essentials` puede no ser suficiente para generar imágenes.
- En cuanto a licencia, todos los archivos son Apache-2.0, lo que permite uso comercial; no obstante, el paquete en sí es una redistribución, y conviene verificar la licencia del tokenizador de Qwen3.5-9B (Apache-2.0 según la model card, con archivo LICENSE incluido).
- Creado en octubre de 2026 con 0 descargas registradas en el momento de la ficha: proyecto muy reciente y con poco historial de uso comunitario.

## Enlaces

- Repositorio del paquete: https://huggingface.co/FiditeNemini/MossForge
- Perfil de MossForge (aplicación): https://huggingface.co/FiditeNemini
- MOSS-Image SFT (modelo original): https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- MOSS-Image Base (modelo original): https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Repack para ComfyUI: https://huggingface.co/Comfy-Org/MOSS-Image
- Tokenizador Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- LoRA 8 pasos SFT (lodestones): https://huggingface.co/lodestones/MOSS-Image-SFT-8-steps-dmd
- LoRA 8 pasos Base (lodestones): https://huggingface.co/lodestones/MOSS-Image-Base-8-steps-dmd
- LoRA 4 pasos SFT (akhaliq): https://huggingface.co/akhaliq/MOSS-Image-SFT-4-steps

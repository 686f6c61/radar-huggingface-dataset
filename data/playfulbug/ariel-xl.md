# Playfulbug/Ariel-XL

## Resumen

Ariel-XL es un checkpoint de generación de imágenes texto-a-imagen derivado de Illustrious XL v0.1, un modelo SDXL especializado en ilustración anime con comprensión de etiquetas de Danbooru. Lo desarrolla el usuario Playfulbug mediante un fine-tuning con un LoRA propio entrenado sobre 2.665 pares imagen-caption SFW de Danbooru (4 épocas, 1.272 pasos) que se fusiona directamente en los pesos base con una ratio de 0.8, dando como resultado un checkpoint independiente en fp16 de aproximadamente 6,5 GB. Su objetivo es ofrecer un estilo anime limpio y de factura pictórica suave sin perder la capacidad del modelo base para interpretar etiquetas de Danbooru.

El modelo se publica bajo la licencia Fair AI Public License 1.0-SD, se distribuye en formato safetensors y es compatible con ComfyUI, A1111, Forge y la librería diffusers. El repositorio incluye además el LoRA sin fusionar de la época 4 para pruebas de fuerza o futuras mezclas. Con cero descargas y cero likes en el momento de la ficha, se trata de un lanzamiento muy reciente y de nicho, orientado a la comunidad de generación de ilustración anime.

Su relevancia radica en que hereda la arquitectura y el vocabulario visual de Illustrious XL (una de las bases anime más usadas en el ecosistema SDXL) y añade un sesgo estilístico concreto hacia el trazo suave y limpio, manteniendo el flujo de trabajo estándar de SDXL con sus resoluciones nativas y sus ajustes de muestreo habituales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion XL (SDXL) fine-tuneado sobre Illustrious XL v0.1 |
| Parametros totales | no disponible (checkpoint SDXL completo, ~6,5 GB en fp16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; sin ventana de contexto de texto) |
| Tipos de cuantizacion | fp16 (checkpoint publicado); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (prompts basados en etiquetas Danbooru, predominantemente en inglés) |
| Licencia | Fair AI Public License 1.0-SD (fair-ai-public-license-1.0-sd) |
| Formato de pesos | safetensors (checkpoint fusionado y LoRA separado) |

## Arquitectura y entrenamiento

Ariel-XL es un modelo de difusión latente con la arquitectura SDXL, es decir, un UNet con doble text encoder (CLIP ViT-L y CLIP ViT-bigG) y un VAE, heredados de Illustrious XL v0.1. El autor no modifica la arquitectura: parte de los pesos del modelo base y aplica un fine-tuning mediante LoRA sobre un dataset propio de 2.665 pares imagen-caption SFW extraídos de Danbooru, con un entrenamiento de 4 épocas y 1.272 pasos totales.

La innovación técnica no está en la arquitectura sino en el procedimiento de publicación: el LoRA resultante (época 4) se fusiona en los pesos base con una ratio de 0.8 y se serializa como checkpoint fp16 autónomo, de modo que el usuario no necesita cargar el adaptador por separado. El repositorio conserva además el LoRA sin fusionar (`lora_backup/illustrious_lora_e4.safetensors`) para quien quiera ajustar la intensidad del estilo o combinarlo con otras mezclas. No se documentan datos sobre composición detallada del dataset más allá del recuento, ni sobre etapas de RLHF/DPO (no aplicables a un modelo de difusión).

## Capacidades

- Generación de imágenes texto-a-imagen en estilo anime con acabado limpio y pictórico suave.
- Comprensión de etiquetas de Danbooru (personajes, atributos, composición, calidad), heredada de Illustrious XL.
- Control de calidad y contenido mediante etiquetas de calidad positivas y negativas (`masterpiece`, `best quality`, `absurdres`, `safe`, etc.).
- Generación en resoluciones nativas SDXL: 1024×1024, 832×1216 y buckets estándar.
- Soporte de prompt negativo para excluir contenido NSFW y defectos anatómicos.
- Orientación predominante a personajes femeninos (`1girl`); el autor documenta técnicas de prompting para forzar personajes masculinos (`1boy`).
- Compatibilidad con flujos de trabajo de ComfyUI, A1111, Forge y diffusers.
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades de audio o vídeo.

## Casos de uso

- Ilustración de personajes anime para proyectos personales o indie: el modelo genera retratos y figuras completas a partir de etiquetas Danbooru, adecuado para arte conceptual rápido con el estilo suave y limpio que define al checkpoint.
- Generación de fondos y escenarios estilizados: con resoluciones de 832×1216 y buckets SDXL, se pueden producir fondos verticales u horizontales para viñetas, portadas o material promocional.
- Prototipado visual en pipelines de diseño: al ser un checkpoint safetensors compatible con ComfyUI y diffusers, se integra en flujos automatizados de generación por lotes con parámetros fijos (DPM++ 2M Karras, 20-28 pasos, CFG 5.0-6.5).
- Creación de variaciones de estilo mediante el LoRA incluido: el archivo `illustrious_lora_e4.safetensors` permite ajustar la intensidad del estilo sin reentrenar, útil para explorar grados de fusión.
- Generación de arte para fan art y comunidades: el sesgo hacia `1girl` y el vocabulario Danbooru encajan con la producción de ilustraciones de personajes para foros y redes.
- Base para fine-tunes posteriores: el LoRA sin fusionar y la documentación del merge (ratio 0.8) sirven como punto de partida para nuevas mezclas o adaptaciones estilísticas.
- Contenido SFW controlado: el dataset de entrenamiento es explícitamente SFW y el autor recomienda un prompt negativo con `nsfw, explicit, nude`, lo que facilita su uso en entornos con restricciones de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 8-10 GB en fp16 a 1024×1024 con optimizaciones de atención; el checkpoint pesa ~6,5 GB.
- GPU recomendadas: RTX 3090, RTX 4090, A100 o H100 para generación a resolución completa sin offloading.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (RTX 3060 Ti, RTX 3070, RTX 4060 Ti) usando fp16 y, si es necesario, VAE en fp16-fix o atención eficiente.
- Opciones de despliegue: ComfyUI, Automatic1111, Forge, diffusers; el VAE recomendado es `madebyollin/sdxl-vae-fp16-fix`.
- Latencia y throughput: no disponible (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/resolucion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ariel-XL | SDXL (~6,5 GB fp16) | 1024×1024 y buckets SDXL | no disponible | Fair AI Public License 1.0-SD | Hugging Face |
| Illustrious XL v0.1 (base) | SDXL | 1024×1024 y buckets SDXL | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |
| SDXL base (Stability AI) | SDXL | 1024×1024 | benchmarks públicos de SDXL (no comparables directamente con fine-tunes anime) | CreativeML Open RAIL++-M | Hugging Face |

La comparación cuantitativa con alternativas no está disponible: no hay benchmarks publicados para Ariel-XL ni datos de rendimiento del fine-tune frente a su base.

## Limitaciones y advertencias

- Sesgo de género marcado: el modelo base y el dataset se inclinan hacia `1girl`; los personajes masculinos requieren prompting explícito (`1boy, solo, male focus, short hair`) y prompt negativo con términos femeninos.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar anatomía incorrecta (manos, dedos), texto ilegible y artefactos, mitigables parcialmente con prompt negativo.
- Dataset pequeño y de una sola fuente (2.665 pares de Danbooru): el estilo aprendido puede estar sobreajustado a ese dominio y generalizar peor fuera de él.
- Idioma: no se documentan idiomas soportados; el prompting efectivo se basa en etiquetas Danbooru en inglés, no en lenguaje natural en castellano.
- Licencia restrictiva: Fair AI Public License 1.0-SD impone términos y restricciones específicas; es necesario revisar el texto completo antes de uso comercial.
- Modelo derivado de Illustrious XL v0.1: las obligaciones de la licencia del modelo base pueden aplicar en cascada.
- Sin métricas ni validación comunitaria: cero descargas y cero likes en el momento de la ficha; no hay evidencia de calidad fuera de la model card del autor.
- Contenido: aunque el dataset es SFW, no hay garantía absoluta de que el modelo no genere contenido no deseado sin prompt negativo adecuado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Playfulbug/Ariel-XL
- Modelo base (Illustrious XL v0.1): https://huggingface.co/OnomaAIResearch/Illustrious-xl-early-release-v0
- Licencia Fair AI Public License 1.0-SD: https://freedevproject.org/faipl-1.0-sd/
- VAE recomendado: https://huggingface.co/madebyollin/sdxl-vae-fp16-fix

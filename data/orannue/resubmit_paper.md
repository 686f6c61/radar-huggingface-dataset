# Orannue/resubmit_paper

## Resumen

`Orannue/resubmit_paper` es un conjunto de adaptadores LoRA publicados por el usuario Orannue para el modelo de edición de imágenes FLUX.1-Kontext-dev de Black Forest Labs. No se trata de un modelo completo, sino de una colección de 16 configuraciones de ablación seleccionadas de un trabajo de investigación sobre transferencia de edición de imágenes, acompañadas de una dependencia compartida denominada TD (TD100k) y varios adaptadores pre-RF de resolución. El repositorio ocupa 15,3 GB e incluye únicamente los checkpoints de adaptadores seleccionados, no los pesos completos del backbone.

La relevancia del artefacto es fundamentalmente de investigación: permite reproducir ablaciones concretas de un pipeline de edición de imágenes sobre FLUX.1-Kontext-dev, con instrucciones específicas de carga que difieren del uso estándar de Diffusers. El autor advierte explícitamente de que los adaptadores son de DiffSynth y no son necesariamente intercambiables con adaptadores Diffusers convencionales, pese a la etiqueta genérica de la librería.

No se dispone de información sobre licencia, idiomas soportados, pipeline declarado ni resultados de benchmarks en la información proporcionada. El modelo base está sujeto a los términos de acceso restringido (gated) de FLUX.1-Kontext-dev, que deben aceptarse por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA sobre FLUX.1-Kontext-dev (modelo de difusión para edición de imágenes); adaptadores personalizados de DiffSynth |
| Parametros totales | No disponible (el repositorio contiene adaptadores LoRA, no un modelo completo; el backbone no se redistribuye) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de imagen; resolución objetivo lado largo 1024) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible (el modelo base está sujeto a los términos de FLUX.1-Kontext-dev) |
| Formato de pesos | Checkpoints de adaptadores en formato DiffSynth (no garantizado como compatible con Diffusers); incluye archivos `config.json` y `manifest.json` por configuración |

## Arquitectura y entrenamiento

El artefacto se compone de adaptadores LoRA de distintos rangos entrenados sobre FLUX.1-Kontext-dev. Según la model card, las configuraciones incluyen un adaptador TD de rango 128 (dependencia compartida TD100k), deltas de refinamiento RF de rango 32, y variantes denominadas best-only y RF de distintas resoluciones (por ejemplo, RF350 y RF500). Algunas configuraciones comparten dependencias: Best-only350 y 1024 RF350 comparten TD40000, mientras que With-text RF500 usa TD105000. Cuatro adaptadores RF de resolución requieren el adaptador TD del mismo nombre como dependencia, y esos cuatro adaptadores TD pre-RF están incluidos.

El entrenamiento se organiza en torno a configuraciones de ablación con nombres que codifican la resolución como Cond/Source con lado largo objetivo de 1024, y la presencia de texto (`with_text`/`empty_text`) que describe el entrenamiento, no necesariamente los prompts de inferencia. Los detalles exactos de pasos, rutas, hashes y dependencias están en los archivos `config.json` y `manifest.json` de cada configuración. La model card menciona que las ejecuciones principales de calidad y eficiencia usaron caché KV del primer paso de denoising, no un prefill experimental en t=0; el caché on/off y el prefill en t=0 son ajustes de inferencia del mismo checkpoint, no modelos adicionales. No se proporcionan datos sobre número de tokens, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Edición de imágenes mediante transferencia de edición sobre FLUX.1-Kontext-dev, con adaptadores de ablación para distintas configuraciones de resolución y texto.
- Soporte de configuraciones con y sin texto de entrenamiento (`with_text`/`empty_text`).
- Adaptadores de refinamiento (RF) que requieren la carga y fusión previa de un adaptador TD congelado emparejado.
- Caché KV del primer paso de denoising como opción de inferencia para mejorar eficiencia.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking; el artefacto es específico de edición de imágenes.

## Casos de uso

- Reproducción de ablaciones de investigación: cargar cada configuración según la regla crítica de la model card para replicar los experimentos del paper sobre transferencia de edición, usando los `manifest.json` para verificar pasos y hashes.
- Estudio de adaptadores TD frente a RF: comparar el efecto de un adaptador TD de rango 128 frente a deltas RF de rango 32 sobre el mismo backbone, útil para analizar el compromiso entre capacidad y eficiencia.
- Evaluación de configuraciones de resolución: probar los adaptadores RF de resolución con su dependencia TD correspondiente para estudiar el comportamiento en edición a lado largo 1024.
- Análisis de caché KV en edición de imágenes: comparar las ejecuciones con caché KV del primer paso frente a configuraciones alternativas para medir impacto en calidad y eficiencia.
- Desarrollo de pipelines DiffSynth personalizados: servir como referencia para implementar `build_td_rf_model` y `remap_lora_state_dict(..., "rf")` en flujos propios de edición.
- Docencia y formación: ilustrar cómo se estructuran dependencias entre adaptadores LoRA y cómo se documentan hashes y pasos en un release de investigación reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 15,3 GB, pero no incluye los pesos del backbone; para inferencia es necesario descargar aparte FLUX.1-Kontext-dev (gated) y disponer de hardware capaz de ejecutarlo.
- VRAM estimada para inferencia: no disponible en la información proporcionada; dependerá del backbone FLUX.1-Kontext-dev y de la precisión utilizada, no especificada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el autor indica DiffSynth con funciones específicas (`build_td_rf_model`, `remap_lora_state_dict`, `FluxLoRAConverter`); no se garantiza compatibilidad directa con Diffusers pese a la etiqueta de la librería.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de alternativas comparables.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere descargar y aceptar los términos del modelo base FLUX.1-Kontext-dev, que no se redistribuye en este repositorio.
- Los adaptadores son de DiffSynth y no se garantiza que funcionen como adaptadores Diffusers estándar, a pesar de la etiqueta `diffusers`.
- Regla de carga estricta: los deltas RF no deben cargarse solos sobre el backbone sin adaptar; primero hay que cargar y fusionar el adaptador TD de rango 128 emparejado.
- Riesgo de confusión entre configuraciones: Mask100k+RF200 y Mask120k+RF200 son configuraciones histórica y final separadas; el caché y el prefill en t=0 son ajustes de inferencia, no modelos distintos.
- Los nombres de resolución indican Cond/Source con lado largo 1024; `with_text`/`empty_text` describen el entrenamiento y no necesariamente los prompts de inferencia.
- Licencia no declarada en el repositorio; el uso comercial queda condicionado por los términos del modelo base.
- No se documentan sesgos, idiomas ni riesgos de alucinación específicos; al ser un modelo de edición de imágenes, los riesgos se heredan del backbone.
- Artefacto con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria conocida.

## Enlaces

- Hugging Face: https://huggingface.co/Orannue/resubmit_paper
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.1-Kontext-dev
- Repositorio de código y release del paper: https://github.com/Orannue/edittransfer_pp/tree/paper/rf-ablation-release-20261118

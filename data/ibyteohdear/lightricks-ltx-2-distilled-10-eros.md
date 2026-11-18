# ibyteohdear/Lightricks-LTX-2-DISTILLED-10-Eros

## Resumen

Lightricks-LTX-2-DISTILLED-10-Eros es un ajuste fino (finetune) del modelo de generación de vídeo Lightricks/LTX-2.3, publicado por el usuario ibyteohdear en Hugging Face. Se trata de un modelo de image-to-video (i2v) y text-to-video (t2v) destilado, orientado a la generación de vídeo sin censura, según declara el propio autor en la model card. El modelo base LTX-2.3 es un transformer de difusión para vídeo desarrollado por Lightricks, y este derivado aplica técnicas de destilación (DMD, destillation) y fusiones de capas para modificar el comportamiento del modelo original.

El repositorio tiene un tamaño de 1385,8 GB, lo que refleja que incluye múltiples variantes de pesos (bf16, fp8, checkpoints completos con CLIP y VAE, LoRAs y ficheros GGUF). El modelo se distribuye bajo la licencia ltx-2.x-community-license-agreement, que no es una licencia open source estándar y establece restricciones específicas de uso. Declara soporte para nueve idiomas (inglés, alemán, español, francés, japonés, coreano, chino, italiano y portugués).

La relevancia de este modelo es doble: por un lado, muestra el ecosistema de derivados comunitarios que se construyen sobre modelos de vídeo de código abierto; por otro, su orientación explícita a contenido para adultos y su etiqueta `not-for-all-audiences` lo convierten en un caso de estudio sobre los límites de las licencias comunitarias y la moderación de contenido en plataformas de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión para vídeo (derivado de LTX-2.3); no se detalla la variante exacta en la información disponible |
| Parametros totales | no disponible (la model card menciona un modelo base "22b dev" en relación con LTX, pero no confirma el recuento de este derivado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el modelo opera sobre frames de vídeo; no se especifica un contexto de tokens) |
| Tipos de cuantizacion | bf16, fp8 mixed learned, INT8, GGUF (según referencias a variantes y repos de cuantización) |
| Idiomas soportados | en, de, es, fr, ja, ko, zh, it, pt |
| Licencia | ltx-2.x-community-license-agreement |
| Formato de pesos | safetensors (checkpoints completos con CLIP y VAE), GGUF, LoRA safetensors |

## Arquitectura y entrenamiento

El modelo se basa en LTX-2.3 de Lightricks, un modelo de difusión para generación de vídeo. Según la model card, este derivado no es una simple fusión de pesos, sino que emplea fusiones con escalado de capas (layer-scaled merges) de distintos pasos del entrenamiento, además de pesos de Sulphur EXP para reforzar determinados movimientos. La versión 1.5 introduce un ajuste en las puertas de atención (attn_1 y attn_2) mediante una rampa lineal que abre detalles presentes en versiones anteriores. El autor indica que las versiones 1.2 a 1.5 son casi el mismo modelo y que la diferencia radica en cómo se gestionan esas puertas de atención.

El modelo está pensado para funcionar con LoRAs de destilación DMD (destillation) y con LoRAs híbridas, y el autor advierte explícitamente de que no se deben usar simultáneamente el LoRA de destilación y los modelos completos. Incluye un "prompt enhancer" distribuido como fichero GGUF con mmproj, pensado para cargarse en LM Studio. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. El autor menciona que el modelo tiene "muy poco razonamiento propio" y que requiere prompts muy descriptivos y directivos.

## Capacidades

- Generación de vídeo a partir de una imagen (image-to-video, i2v) y de texto (text-to-video, t2v), según declara el autor.
- Soporte de los formatos de LTX 2.3, incluidos los flujos de trabajo con LoRA de destilación DMD.
- Generación de audio asociada al vídeo, a partir de la mención del autor a que "el audio debe ser comandado".
- Prompt enhancer incluido como fichero GGUF con mmproj, cargable en LM Studio.
- Capacidades multilingües declaradas para nueve idiomas.
- Orientación explícita a contenido sin censura y para adultos (`not-for-all-audiences`).
- No se documentan en la información disponible capacidades de tool calling, function calling ni razonamiento multi-paso.

## Casos de uso

- Generación de vídeo para adultos: el modelo está declarado explícitamente como "uncensored" y orientado a contenido para adultos, por lo que su uso previsto es la producción de vídeo de este tipo, siempre que se cumplan los requisitos legales y de edad aplicables.
- Prototipado de image-to-video en investigación: permite experimentar con técnicas de destilación y fusión de capas sobre un modelo base de vídeo, comparando el comportamiento de las distintas versiones (1.2 a 1.5).
- Evaluación de LoRAs de destilación DMD: el modelo está diseñado para combinarse con LoRAs híbridas, lo que lo hace útil para estudiar el efecto de la destilación en la calidad y estabilidad del vídeo generado.
- Pruebas de prompt engineering para vídeo: dado que el autor insiste en que el modelo requiere prompts estrictos y descriptivos, sirve como banco de pruebas para técnicas de prompting estructurado en generación de vídeo.
- Investigación sobre moderación de contenido: al ser un derivado sin censura de un modelo comunitario, es un caso de estudio para analizar cómo se distribuyen y moderan modelos con etiquetas `not-for-all-audiences`.
- Despliegue local con cuantizaciones GGUF: las variantes GGUF e INT8 permiten ejecutar el modelo en entornos con recursos limitados, útil para experimentación en estaciones de trabajo con GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio completo ocupa 1385,8 GB, por lo que no es viable descargarlo entero en la mayoría de entornos; conviene descargar solo la variante necesaria (bf16, fp8, INT8 o GGUF).
- No se dispone de estimaciones oficiales de VRAM para inferencia en la información proporcionada.
- Las variantes fp8 mixed learned e INT8 reducen los requisitos frente a bf16, pero no se especifican cifras concretas.
- Las variantes GGUF (repositorio de cuantizaciones enlazado por el autor) permiten despliegue en llama.cpp y potencialmente en Ollama, aunque no se confirma compatibilidad explícita.
- El modelo base LTX-2.3 se referencia como "22b dev" en la model card, lo que sugiere un tamaño de parámetros elevado y, por tanto, requisitos de GPU de gama alta (A100, H100) para bf16; no se confirma para este derivado.
- No se dispone de datos de latencia ni throughput.
- El prompt enhancer, al ser un GGUF con mmproj, está pensado para LM Studio y puede ejecutarse en hardware más modesto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Lightricks-LTX-2-DISTILLED-10-Eros | no disponible | no disponible | ltx-2.x-community-license-agreement | Hugging Face, CivitAI | Derivado sin censura de LTX-2.3, con variantes bf16/fp8/INT8/GGUF |
| Lightricks/LTX-2.3 (base) | no disponible | no disponible | ltx-2.x-community-license-agreement | Hugging Face | Modelo original de Lightricks, base de este derivado |
| Sulphur-2-base | no disponible | no disponible | no disponible | Hugging Face | Modelo sin censura del que dependen algunos pesos de este derivado |
| TenStrip/LTX2.3-10Eros | no disponible | no disponible | no disponible | Hugging Face | Fusión i2v alternativa del mismo concepto, recomendada por el autor |

## Limitaciones y advertencias

- Contenido para adultos: el modelo está etiquetado `not-for-all-audiences` y declarado explícitamente como sin censura; su uso comercial y su distribución pueden estar restringidos por la legislación aplicable y por las políticas de las plataformas.
- Licencia restrictiva: la ltx-2.x-community-license-agreement no es una licencia open source estándar; es imprescindible revisar sus términos antes de cualquier uso comercial.
- Riesgo de artefactos anatómicos: el propio autor documenta problemas de "ghost anatomy", anatomía extra y subtítulos no deseados en versiones anteriores, y advierte de que la versión 1.4 no representa bien la anatomía.
- Dependencia de prompts: el modelo tiene "muy poco razonamiento propio" y requiere prompts muy descriptivos y directivos; sin ellos, la salida puede ser deficiente.
- Inestabilidad entre versiones: el autor advierte de que el uso conjunto de LoRA de destilación y modelos completos puede causar problemas, y que las versiones 1.2 a 1.5 difieren en el manejo de las puertas de atención.
- Riesgo de alucinación visual: como modelo generativo de vídeo, puede producir transiciones inesperadas y contenido no solicitado, según reconoce el autor.
- Idiomas: aunque se declaran nueve idiomas, no se especifica la calidad por idioma ni se aportan evaluaciones.
- Tamaño del repositorio: 1385,8 GB dificulta la descarga y el almacenamiento; conviene seleccionar variantes concretas.

## Enlaces

- Hugging Face: https://huggingface.co/ibyteohdear/Lightricks-LTX-2-DISTILLED-10-Eros
- Modelo base: https://huggingface.co/Lightricks/LTX-2.3
- Licencia: https://github.com/Lightricks/LTX-2/blob/main/LICENSE-2_x
- Sulphur-2-base: https://huggingface.co/SulphurAI/Sulphur-2-base
- CivitAI Base Model: https://civitai.red/models/2594061/sulphur-2-base
- CivitAI Quant Model: https://civitai.red/models/2630742
- Fusión i2v alternativa (TenStrip): https://huggingface.co/TenStrip/LTX2.3-10Eros
- Flujos de trabajo (TenStrip): https://huggingface.co/TenStrip/LTX2.3-10Eros_Workflows
- LoRA DMD híbrido: https://huggingface.co/TenStrip/LTX2.3_DMD_Lora/blob/main/LTX2.3_DMD_hybrid_v2.safetensors
- LoRAs DMD híbridos (maximsobolev275): https://huggingface.co/maximsobolev275/LTX2.3-DMD-Distill-Lora-Hybrids
- Cuantizaciones GGUF: https://huggingface.co/vantagewithai/LTX2.3-10Eros-GGUF/tree/main
- INT8 con hybrid v2 (CornLogic): https://huggingface.co/CornLogic/10EROS-INT8/tree/main
- INT8 calidad (LokkenJP): https://huggingface.co/LokkenJP/10EROS_1.5_fp8_exp_learned
- Nodos ComfyUI (TenStrip): https://github.com/TenStrip/10S-Comfy-nodes
- X del autor: https://x.com/FusionCow11
- Discord: https://discord.gg/C3d56f39Ah
- Ko-fi: https://ko-fi.com/fusioncow

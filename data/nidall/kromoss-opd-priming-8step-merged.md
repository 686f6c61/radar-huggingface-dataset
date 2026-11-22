# NidAll/Kromoss-OPD-priming-8step-Merged

## Resumen

Kromoss OPD-priming 8-step Merged es un modelo de difusion texto-a-imagen derivado de `lodestones/Kromoss`, publicado por el usuario NidAll. No se trata de un entrenamiento desde cero ni de un fine-tuning original: es una fusión (merge) en fp32 del checkpoint base `kromoss_bf16_OPD-priming.safetensors` (update 69800) con la LoRA experimental `opd-priming-8-steps-dmd-lora_cfg-static_20000.safetensors`, aplicada a fuerza 1.0 y con el resultado "horneado" en los pesos. El objetivo es disponer de un modelo de inferencia en 8 pasos (o 4) con CFG 1 y sin prompt negativo, listo para usar como reemplazo directo en ComfyUI.

El interés práctico reside en la destilación DMD (Distribution Matching Distillation) aplicada sobre un modelo de difusion, que reduce drásticamente el número de pasos de muestreo y elimina la necesidad de classifier-free guidance, abaratando la inferencia. El repositorio ocupa 15,6 GB e incluye dos variantes: bf16 (merge en fp32 redondeado una sola vez) e int8 W8A8 ConvRot (cuantizada directamente desde el merge fp32). La licencia declarada es Apache 2.0 y el pipeline es text-to-image, pensado para el ecosistema ComfyUI con el text encoder y VAE habituales de MOSS-Image.

La relevancia es acotada: es un artefacto de comunidad con 0 descargas y 0 likes en el momento de la consulta, sin model card propia más allá de las instrucciones de uso y del informe de merge. No hay información publicada sobre arquitectura interna, datos de entrenamiento ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para texto-a-imagen (detalles internos no disponibles); base `lodestones/Kromoss` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; condicionamiento por text encoder MOSS-Image) |
| Tipos de cuantizacion | bf16 y int8 W8A8 ConvRot (rotacion Hadamard regular de 256, escalas absmax/127 por fila, modo `absmax_div`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`kromoss_opd-priming_dmd-cfg-static-20000_merged_bf16.safetensors`, `kromoss_opd-priming_dmd-cfg-static-20000_merged_int8_convrot.safetensors`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base (tipo de backbone, número de parámetros, mecanismo de atención o variante de difusion). Lo que sí está documentado es el procedimiento de fusión: el merge se realiza en fp32 con la fórmula `W = W_bf16 + 1.0 * (alpha/rank) * up @ down`, integrando los deltas separados de q/k/v en las filas del tensor fusionado `proj.qkv` de ComfyUI. El resultado se redondea una sola vez a bf16. La variante int8 se cuantiza directamente desde el merge fp32, con rotación Hadamard de 256 elementos por filas y escalas absmax/127 por fila; el cuantizador reprodujo el fichero oficial `kromoss_int8_convrot_OPD-priming.safetensors` desde los pesos sin fusionar con una tasa de coincidencia de 1.000000, lo que valida el pipeline.

La LoRA integrada es una destilación DMD de 8 pasos con CFG estático (checkpoint 20000). El informe de retención de deltas sobre 168 tensores fusionados muestra `bf16_delta_cos` medio de 0.58095 (mínimo 0.29508) y `bf16_delta_norm_ratio` medio de 0.72580 (mínimo 0.39310), lo que indica que la fusión preserva solo parcialmente la dirección del delta original en bf16. En int8, `int8_direct_delta_cos` cae a 0.18019 de media (mínimo 0.08594) y `int8_via_bf16_delta_cos` a 0.11483 (mínimo 0.01620), aunque la fidelidad de la cuantización respecto al fp32 es muy alta (`int8_cos_vs_fp32` medio 0.99996, mínimo 0.99995). En la práctica, esto significa que la variante int8 reproduce fielmente el merge fp32, pero el merge en sí se aleja del delta de la LoRA original. No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Generación de imágenes a partir de prompts de texto (text-to-image) mediante el pipeline MOSS-Image.
- Inferencia rápida: 8 pasos de muestreo (4 pasos también funcionan según el autor), CFG 1 y sin prompt negativo.
- Integración directa en ComfyUI como reemplazo de los ficheros correspondientes en `ComfyUI/models/diffusion_models/`.
- Compatibilidad con el text encoder y el VAE estándar de MOSS-Image.
- Dos precisiones disponibles: bf16 para máxima calidad y int8 W8A8 ConvRot para menor huella de memoria.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking; es un modelo puramente generativo de imagen.
- Capacidades multilingües: no disponibles (dependen del text encoder, sin información publicada).

## Casos de uso

- Generación de imágenes en producción con ComfyUI: el modelo se coloca en `ComfyUI/models/diffusion_models/` y se usa con 8 pasos, CFG 1 y sampler Euler/simple con shift 5, lo que reduce el coste por imagen frente a un muestreo de 20-50 pasos.
- Prototipado rápido de conceptos visuales: con 4 pasos funcionales, permite iterar bocetos en segundos y validar direcciones artísticas antes de un render de mayor calidad.
- Despliegue en GPUs de gama media: la variante int8 reduce la huella de memoria respecto a bf16, facilitando la ejecución en tarjetas con VRAM limitada (siempre que el resto del pipeline, text encoder y VAE, quepa en memoria).
- Pipelines por lotes de imágenes: al eliminar el CFG y usar pocos pasos, el throughput por imagen mejora y encaja en generación masiva de assets para webs, catálogos o contenido editorial.
- Integración en flujos de trabajo de ComfyUI existentes: al ser un drop-in replacement de los ficheros oficiales, se puede sustituir sin reescribir los grafos de nodos ni los parámetros del sampler.
- Experimentación con destilación DMD: el repositorio incluye `merge_report.json` con métricas por tensor y procedencia de las entradas (hashes de commit y sha256), útil para reproducir o auditar el proceso de fusión y cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta métricas internas de retención de deltas del merge y de fidelidad de cuantización (coseno medio de 0.99996 frente a fp32 en int8), no métricas de calidad de imagen como FID, CLIP score o evaluaciones humanas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El repositorio completo ocupa 15,6 GB; la variante bf16 requiere cargar el checkpoint completo en memoria, mientras que la int8 reduce aproximadamente a la mitad el peso de los pesos del modelo de difusion.
- GPU recomendadas: no disponibles en la información proporcionada. Por el tamaño del artefacto, se intuye necesidad de GPUs con 16-24 GB o más para bf16, y potencialmente 12-16 GB para int8, pero es una estimación no confirmada por el autor.
- GPU de consumo: no se confirma compatibilidad con ninguna tarjeta concreta (RTX 4090, RTX 3090, etc.); no disponible.
- Opciones de despliegue: ComfyUI es el entorno documentado. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusion de este tipo).
- Latencia y throughput: no disponibles. Solo se indica que el muestreo se realiza en 8 pasos (o 4), lo que reduce el coste computacional frente a samplers de más pasos, pero sin cifras medidas.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (destilaciones DMD de modelos texto-a-imagen) ni datos de rendimiento que permitan una comparación rigurosa. El único punto de referencia es el modelo base `lodestones/Kromoss` sin la LoRA DMD, del que no se detallan especificaciones ni métricas.

## Limitaciones y advertencias

- Artefacto de comunidad con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación externa.
- El merge en bf16 retiene solo parcialmente el delta de la LoRA (`bf16_delta_cos` medio 0.58095, mínimo 0.29508), por lo que el comportamiento puede diferir del modelo base con la LoRA aplicada en tiempo de ejecución.
- En int8, la correlación del delta respecto al original es baja (`int8_direct_delta_cos` medio 0.18019), aunque la cuantización reproduce fielmente el merge fp32; conviene validar la calidad visual antes de usar la variante int8 en producción.
- No se debe cargar la LoRA de nuevo: ya está integrada en los pesos; hacerlo alteraría el resultado.
- La configuración de muestreo es específica (8 pasos, CFG 1, sin negativo, Euler/simple, shift 5); desviarse de ella puede degradar la calidad.
- No hay información sobre sesgos, riesgo de alucinación visual, limitaciones de idioma ni restricciones adicionales de licencia más allá de Apache 2.0.
- La licencia Apache 2.0 se declara en el repositorio, pero los créditos del modelo y de la LoRA pertenecen a `lodestones`; conviene revisar la licencia del modelo base antes de un uso comercial.
- No hay model card propia con evaluación de calidad, por lo que el caveat principal para producción es la ausencia de validación independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/NidAll/Kromoss-OPD-priming-8step-Merged
- Modelo base: https://huggingface.co/lodestones/Kromoss
- Checkpoint base usado en el merge: https://huggingface.co/lodestones/Kromoss/blob/f2267fbae7c038441b8d3bd8b7c90f2107ce58f4/diffusion_models/kromoss_bf16_OPD-priming.safetensors
- LoRA DMD usada en el merge: https://huggingface.co/lodestones/Kromoss/blob/f2267fbae7c038441b8d3bd8b7c90f2107ce58f4/experimental/opd-priming-8-steps-dmd-lora_cfg-static_20000.safetensors
- Autor del modelo base: https://huggingface.co/lodestones

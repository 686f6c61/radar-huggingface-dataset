# Eiki-AI/plamo-3-translate-2b-af-no-preview

## Resumen

PLaMo-3-Translate-2B-AF-NO es un ajuste fino (fine-tune) experimental e **no oficial** del modelo de traduccion `pfnet/plamo-3-translate-2b` de Preferred Networks, desarrollado por el usuario Eiki-AI. Su objetivo es anadir soporte de traduccion para **afrikaans (`af`)** y **noruego bokmal (`no`)** manteniendo las capacidades del modelo base, incluyendo los idiomas originales, los estilos de japones `plain`/`polite` y el soporte de glosarios.

Se trata de un adaptador LoRA (`r=64`, `lora_alpha=128`, todas las capas lineales) entrenado durante 2 epocas y fusionado (merged) en precision BF16 sobre el modelo base de 2.878.595.584 parametros. El resultado es un checkpoint de traduccion de aproximadamente 2,9 mil millones de parametros, con pesos en safetensors y un repositorio de 5,8 GB.

Es relevante ahora porque demuestra el patron de extension de modelos de traduccion especializados mediante LoRA y datos filtrados de alta calidad, y porque publica una tabla de rendimiento (chrF++) comparando precisiones BF16, FP8, NVFP4 y varias cuantizaciones GGUF, lo que facilita evaluar el impacto de la compresion en la calidad de traduccion. Se distribuye como **V5 Preview**, es decir, una version preliminar con limitaciones conocidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base PLaMo 3 Translate; requiere `custom_code`) |
| Parametros totales | 2.878.595.584 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (principal), FP8, NVFP4, GGUF Q4_K_M, Q4_0, Q3_K_M, Q2_K |
| Idiomas soportados | en, ja, af, no (y las 52 lenguas originales del modelo base, segun la model card) |
| Licencia | plamo-community-license (PLaMo Community License) |
| Formato de pesos | safetensors (BF16); cuantizaciones GGUF y FP8/NVFP4 evaluadas |

## Arquitectura y entrenamiento

El modelo parte de `pfnet/plamo-3-translate-2b`, un transformer especializado en traduccion. El ajuste se realizo mediante un adaptador **LoRA** con rango `r=64`, `lora_alpha=128`, aplicado a todas las capas lineales, durante 2 epocas, y posteriormente fusionado en pesos BF16. El pipeline declarado es `translation` y el modelo requiere `custom_code` para su carga.

Los datos de entrenamiento consistieron en **100.000 pares de frases limpios para cada idioma** (`af` y `no`), extraidos de `hotchpotch/nllb-english-bitext-hq` con filtro de reranker >= 0.85 y de `HPLT/DocHPLT`, verificados por digitos y filtrados para evitar contaminacion del neerlandes. Ademas se anadieron aproximadamente **120.000 ejemplos de replay auto-destilados** que cubren las 52 lenguas originales, incluidos los estilos de japones `plain` y `polite`. No se menciona en la informacion disponible el uso de RLHF o DPO.

## Capacidades

- Traduccion bidireccional entre ingles y afrikaans, y entre ingles y noruego bokmal.
- Conservacion de las capacidades de traduccion del modelo base en sus 52 lenguas originales (replay).
- Soporte de los estilos de japones `plain` y `polite`.
- Soporte de glosarios (glossary) heredado del modelo base.
- Uso del formato de prompt estandar PFML3 mediante `apply_chat_template(..., source_lang=..., target_lang=...)`.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- **Localizacion de documentacion tecnica a afrikaans y noruego**: traduccion de manuales y guias desde el ingles usando el prompt PFML3 con `source_lang=en` y `target_lang=af|no`, aprovechando el soporte de glosarios para mantener terminologia consistente.
- **Traduccion de contenido web y marketing**: conversion de paginas y campanas del ingles a afrikaans o noruego bokmal con un modelo de ~2,9B parametros desplegable en hardware modesto.
- **Pipelines de subtitulado y articulos**: traduccion por lotes con temperatura 0 y `repeat_penalty=1.05` (configuracion de benchmark) para resultados deterministas y reproducibles.
- **Despliegue en GPU de consumo**: uso de las variantes GGUF Q4_K_M o Q4_0 para servir traduccion en entornos con VRAM limitada, con perdida de calidad medida en chrF++ (por ejemplo, 58,82 frente a 58,41 en ingles->noruego con Q4_K_M).
- **Traduccion multilingue con fallback**: al conservar las 52 lenguas originales, puede emplearse como motor unico para traducir entre ingles y un conjunto amplio de idiomas, incluidos japones, neerlandes, aleman y ruso.
- **Investigacion sobre cuantizacion**: la tabla de chrF++ por precision (BF16, FP8, NVFP4, Q4_K_M, Q4_0, Q3_K_M, Q2_K) permite estudiar el compromiso entre compresion y calidad en tareas de traduccion.

## Benchmarks y rendimiento

Resultados publicados en la model card (chrF++, `temp=0`, `repeat_penalty=1.05`):

| Direccion | BF16 | FP8 | NVFP4 | Q4_K_M | Q4_0 | Q3_K_M | Q2_K |
|---|---:|---:|---:|---:|---:|---:|---:|
| Ingles -> Afrikaans (100 no vistas) | 60,19 | 60,17 | 59,74 | 59,78 | 59,43 | 60,21 | 55,92 |
| Afrikaans -> Ingles (100 no vistas) | 60,77 | 60,88 | 60,18 | 60,36 | 60,08 | 60,18 | 57,02 |
| Ingles -> Noruego (100 no vistas) | 58,41 | 58,56 | 57,27 | 58,82 | 57,73 | 57,86 | 54,06 |
| Noruego -> Ingles (100 no vistas) | 62,46 | 62,22 | 62,22 | 62,77 | 62,87 | 63,06 | 61,62 |
| Ingles -> Japones (50 opus-100) | 15,83 | 14,92 | 16,18 | 16,01 | 15,54 | 16,58 | 15,77 |
| Ingles -> Neerlandes (50 opus-100) | 50,24 | 50,16 | 48,64 | 49,65 | 49,24 | 49,27 | 46,56 |
| Ingles -> Aleman (50 opus-100) | 47,58 | 47,06 | 47,09 | 47,68 | 47,23 | 47,15 | 45,71 |
| Ingles -> Ruso (50 opus-100) | 43,84 | 43,74 | 43,98 | 43,35 | 44,44 | 44,51 | 43,99 |

No se han publicado en la informacion disponible resultados de benchmarks tipo MMLU, HumanEval o GSM8K, ya que el modelo es de traduccion.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 5,8 GB de pesos (2,88B parametros x 2 bytes), mas overhead de activaciones y cache KV; se recomienda 8 GB o mas.
- VRAM estimada en Q4_K_M: aproximadamente 1,7-2 GB de pesos, desplegable en GPU con 4 GB o mas.
- GPU recomendadas: A100 o H100 para mayor throughput en BF16/FP8; RTX 4090 o RTX 3090 para BF16 con holgura; RTX 3060 de 12 GB o superior para cuantizaciones GGUF.
- Cabe en GPU de consumo: si, en cuantizaciones GGUF Q4_K_M, Q4_0 y Q3_K_M en tarjetas de 4-8 GB.
- Opciones de despliegue: requiere `custom_code`, por lo que conviene usar `transformers` con `trust_remote_code=True`; las variantes GGUF son compatibles con llama.cpp y Ollama. No se confirma compatibilidad con vLLM o TGI en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Notas |
|---|---|---|---|---|
| Eiki-AI/plamo-3-translate-2b-af-no-preview | 2,88B | en, ja, af, no (+52 del base) | PLaMo Community License | Fine-tune LoRA no oficial, V5 Preview |
| pfnet/plamo-3-translate-2b | no disponible | 52 lenguas (incluye en, ja) | PLaMo Community License | Modelo base oficial de Preferred Networks |
| NLLB (familia) | no disponible | no disponible | no disponible | Fuente de datos citada (`nllb-english-bitext-hq`), no comparado en benchmarks |

No se dispone de resultados comparativos directos con otros modelos de traduccion en la informacion proporcionada.

## Limitaciones y advertencias

- Version **Preview**: se documentan fallos menores de formulacion en casos limite, como preguntas cortas de viaje en noruego o confusiones `Maandag`/`nag` en afrikaans.
- Modelo no oficial: no esta afiliado ni respaldado por Preferred Networks.
- La licencia PLaMo Community License impone condiciones para uso comercial y redistribucion, incluidos umbrales de registro e ingresos para despliegue comercial.
- Requiere `custom_code` (`trust_remote_code=True`), lo que implica ejecutar codigo del repositorio.
- La calidad en japones medida en opus-100 es baja (chrF++ en torno a 15-16), lo que sugiere cautela al usar esta variante para japones.
- Riesgo de alucinacion y de sesgos no cuantificado en la informacion disponible.
- Las cuantizaciones Q2_K degradan notablemente la calidad (por ejemplo, 55,92 frente a 60,19 en ingles->afrikaans).
- Longitud de contexto no documentada; no se garantiza el rendimiento en documentos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Eiki-AI/plamo-3-translate-2b-af-no-preview
- Modelo base: https://huggingface.co/pfnet/plamo-3-translate-2b
- Dataset citado: `hotchpotch/nllb-english-bitext-hq`
- Dataset citado: `HPLT/DocHPLT`
- Benchmark citado: opus-100
- Licencia: PLaMo Community License (archivo `LICENSE` en el repositorio)

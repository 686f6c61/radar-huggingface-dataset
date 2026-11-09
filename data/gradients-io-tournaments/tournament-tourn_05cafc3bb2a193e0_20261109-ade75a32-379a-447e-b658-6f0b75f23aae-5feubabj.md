# gradients-io-tournaments/tournament-tourn_05cafc3bb2a193e0_20261109-ade75a32-379a-447e-b658-6f0b75f23aae-5FEubABj

## Resumen

El repositorio `gradients-io-tournaments/tournament-tourn_05cafc3bb2a193e0_20261109-ade75a32-379a-447e-b658-6f0b75f23aae-5FEubABj` es un artefacto publicado por la organizacion `gradients-io-tournaments`, presumiblemente como resultado de un torneo de entrenamiento o ajuste de modelos. El repositorio tiene un tamano de 0.0 GB y cero descargas, lo que sugiere que no contiene pesos de modelo reales o que el contenido no se ha materializado en el momento de la consulta. La model card asociada no describe el modelo del repositorio, sino que reproduce integramente la documentacion de Sheared-LLaMA (princeton-nlp), un modelo derivado de Llama-2-7B mediante poda estructurada y preentrenamiento continuado.

La relevancia tecnica del contenido referenciado (Sheared-LLaMA) reside en su metodologia: obtener modelos de 1.3B y 2.7B parametros a partir de Llama-2-7B con solo 50B tokens de preentrenamiento continuado, superando a modelos entrenados desde cero con 300B-1T tokens en rendimiento promedio downstream. Sin embargo, debe subrayarse que el repositorio consultado no aporta informacion verificable sobre sus propios pesos, arquitectura o datos de entrenamiento; toda la informacion tecnica disponible proviene de la model card heredada de Sheared-LLaMA.

Por tanto, esta ficha documenta el modelo referenciado en la model card (Sheared-LLaMA-1.3B) y advierte explicitamente de la discrepancia entre el identificador del repositorio y el contenido de la documentacion. No se dispone de datos sobre el pipeline, los idiomas ni los pesos del artefacto alojado en `gradients-io-tournaments`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Llama-2-7B mediante poda estructurada) |
| Parametros totales | 1.3B (segun model card de Sheared-LLaMA-1.3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | apache-2.0 (tag del repo); la model card indica que debe cumplirse la licencia de Llama-2 por derivacion |
| Formato de pesos | no disponible (repo de 0.0 GB; la model card referencia carga via `AutoModelForCausalLM.from_pretrained`) |

## Arquitectura y entrenamiento

La model card describe Sheared-LLaMA-1.3B como un modelo obtenido mediante poda estructurada de `meta-llama/Llama-2-7b-hf` seguida de preentrenamiento continuado. El proceso utiliza carga dinamica de datos de distintos dominios del dataset RedPajama: 0.4B tokens para la fase de poda y 50B tokens para el preentrenamiento continuado del modelo podado. El modelo conserva el mismo vocabulario que LLaMA-1 y LLaMA-2, lo que facilita la reutilizacion de tokenizadores y pipelines existentes. El paper de referencia es "Sheared llama: Accelerating language model pre-training via structured pruning" (Xia, Gao, Zeng, Chen; arXiv:2310.06694).

No se dispone de informacion sobre la arquitectura exacta del artefacto alojado en `gradients-io-tournaments`, ni sobre si se aplicaron fases de RLHF, DPO o instruction tuning en ese repositorio concreto. La model card menciona variantes instruction-tuned (ShareGPT) y variantes podadas sin preentrenamiento continuado, pero no confirma que el repositorio consultado corresponda a ninguna de ellas.

## Capacidades

- Generacion de texto autoregresiva en el marco de un modelo causal decoder-only.
- Razonamiento y comprension lectora: la model card indica evaluacion en tareas de razonamiento, reading comprehension, language modeling y tareas intensivas en conocimiento.
- Vocabulario compatible con LLaMA-1 y LLaMA-2, lo que permite reutilizar tokenizadores y herramientas del ecosistema Llama.
- Capacidad multilingue: no disponible en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (thinking mode, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Experimentacion academica en poda de modelos: el modelo sirve como referencia para reproducir el pipeline de poda estructurada y preentrenamiento continuado descrito en el paper, comparando el rendimiento de un modelo de 1.3B derivado de Llama-2-7B frente a modelos entrenados desde cero.
- Despliegue en entornos con recursos limitados: con 1.3B parametros, el modelo es candidato para inferencia en GPUs de consumo, aunque la VRAM exacta depende de la cuantizacion y no se especifica en la informacion disponible.
- Investigacion sobre eficiencia de preentrenamiento: permite estudiar como 50B tokens de preentrenamiento continuado sobre un modelo podado pueden superar a modelos entrenados con 300B tokens desde cero (segun la tabla de rendimiento promedio de la model card).
- Generacion de texto general y tareas de language modeling en prototipos: adecuado para pruebas de concepto donde el coste computacional es un factor limitante.
- Evaluacion comparativa de tecnicas de compresion: util como baseline en estudios que comparen poda estructurada frente a destilacion o cuantizacion.
- Fine-tuning ligero para dominios especificos: el tamano reducido facilita ajustes con presupuestos de computo modestos, aunque no se dispone de datos sobre el soporte de contextos largos o tool calling.

## Benchmarks y rendimiento

Los datos disponibles provienen de la model card de Sheared-LLaMA-1.3B y de la evaluacion en Open LLM Leaderboard. No se han publicado resultados de benchmarks especificos del repositorio `gradients-io-tournaments` en la informacion disponible.

Rendimiento promedio downstream (media de tareas, segun model card):

| Modelo | Tokens de preentrenamiento | Rendimiento promedio |
|---|---|---|
| LLaMA2-7B | 2T | 64.6 |
| OPT-1.3B | 300B | 48.2 |
| Pythia-1.4B | 300B | 48.9 |
| Sheared-LLaMA-1.3B | 50B | 51.0 |

Comparativa en la categoria ~3B (segun model card):

| Modelo | Tokens de preentrenamiento | Rendimiento promedio |
|---|---|---|
| OPT-2.7B | 300B | 51.4 |
| Pythia-2.8B | 300B | 52.5 |
| INCITE-Base-3B | 800B | 54.7 |
| Open-LLaMA-3B-v1 | 1T | 55.1 |
| Open-LLaMA-3B-v2 | 1T | 55.7 |
| Sheared-LLaMA-2.7B | 50B | 56.7 |

Resultados en Open LLM Leaderboard para Sheared-LLaMA-1.3B:

| Metrica | Valor |
|---|---|
| Avg. | 31.47 |
| ARC (25-shot) | 32.85 |
| HellaSwag (10-shot) | 60.91 |
| MMLU (5-shot) | 25.71 |
| TruthfulQA (0-shot) | 37.14 |
| Winogrande (5-shot) | 58.64 |
| GSM8K (5-shot) | 0.45 |
| DROP (3-shot) | 4.56 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia orientativa no verificada, un modelo de 1.3B parametros en fp16 requiere aproximadamente 2.6 GB solo para pesos, mas overhead de activaciones y KV cache; estas cifras no constan en la documentacion consultada.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: la model card unicamente documenta la carga mediante `AutoModelForCausalLM.from_pretrained` de HuggingFace Transformers. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

Comparativa con alternativas de tamano similar segun los datos de la model card (rendimiento promedio downstream y tokens de preentrenamiento):

| Modelo | Parametros | Tokens de preentrenamiento | Rendimiento promedio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sheared-LLaMA-1.3B | 1.3B | 50B | 51.0 | Derivada de Llama-2 (repo etiquetado apache-2.0) | HuggingFace (princeton-nlp) |
| OPT-1.3B | 1.3B | 300B | 48.2 | no disponible en la informacion | HuggingFace |
| Pythia-1.4B | 1.4B | 300B | 48.9 | no disponible en la informacion | HuggingFace |
| Sheared-LLaMA-2.7B | 2.7B | 50B | 56.7 | Derivada de Llama-2 | HuggingFace (princeton-nlp) |

La longitud de contexto de los modelos comparados no se detalla en la informacion proporcionada.

## Limitaciones y advertencias

- Discrepancia entre identificador y contenido: el repositorio `gradients-io-tournaments/tournament-tourn_...` no contiene informacion propia sobre sus pesos; la model card reproduce la documentacion de Sheared-LLaMA. No es posible verificar que el artefacto alojado corresponda a ese modelo.
- Repositorio vacio o sin pesos: tamano de 0.0 GB, cero descargas y cero likes; no hay evidencia de pesos publicados.
- Licencia: el tag del repositorio indica apache-2.0, pero la model card de Sheared-LLaMA especifica que debe cumplirse la licencia de Llama-2 por ser un modelo derivado. Esta ambiguedad debe resolverse antes de cualquier uso comercial.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se aportan datos especificos de mitigacion en la informacion disponible.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Limitaciones de contexto o idioma: no disponible en la informacion proporcionada.
- Rendimiento limitado en tareas de matematicas y razonamiento complejo: los resultados de Open LLM Leaderboard muestran GSM8K (5-shot) de 0.45 y DROP (3-shot) de 4.56, valores muy bajos que desaconsejan su uso en produccion para tareas aritmeticas o de comprension profunda.
- MMLU (5-shot) de 25.71 y TruthfulQA (0-shot) de 37.14 indican conocimiento factual y veracidad limitados.
- No se dispone de informacion sobre tool calling, agentes o contextos largos, por lo que no debe asumirse su soporte en produccion.

## Enlaces

- Repositorio consultado: https://huggingface.co/gradients-io-tournaments/tournament-tourn_05cafc3bb2a193e0_20261109-ade75a32-379a-447e-b658-6f0b75f23aae-5FEubABj
- Paper: https://arxiv.org/pdf/2310.06694.pdf
- Codigo: https://github.com/princeton-nlp/LLM-Shearing
- Modelo Sheared-LLaMA-1.3B: https://huggingface.co/princeton-nlp/Sheared-LLaMA-1.3B
- Modelo Sheared-LLaMA-2.7B: https://huggingface.co/princeton-nlp/Sheared-LLaMA-2.7B
- Sheared-LLaMA-1.3B-Pruned: https://huggingface.co/princeton-nlp/Sheared-LLaMA-1.3B-Pruned
- Sheared-LLaMA-2.7B-Pruned: https://huggingface.co/princeton-nlp/Sheared-LLaMA-2.7B-Pruned
- Sheared-LLaMA-1.3B-ShareGPT: https://huggingface.co/princeton-nlp/Sheared-LLaMA-1.3B-ShareGPT
- Sheared-LLaMA-2.7B-ShareGPT: https://huggingface.co/princeton-nlp/Sheared-LLaMA-2.7B-ShareGPT
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-hf
- Dataset RedPajama: https://github.com/togethercomputer/RedPajama-Data
- Open LLM Leaderboard (detalles): https://huggingface.co/datasets/open-llm-leaderboard/details_princeton-nlp__Sheared-LLaMA-1.3B

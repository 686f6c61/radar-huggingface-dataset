# AnniBori/Llama-3.1-8B-Instruct-DUET-film-RMU-rare-s1

## Resumen

Llama-3.1-8B-Instruct-DUET-film-RMU-rare-s1 es un checkpoint experimental de Llama-3.1-8B-Instruct obtenido mediante técnicas de *machine unlearning*. Lo publica AnniBori como parte de un estudio sobre eliminación selectiva de conocimiento factual en modelos de lenguaje. El modelo parte de un fine-tuning previo sobre el conjunto DUET (configuración `film`, epoch 6) y aplica después el algoritmo RMU (Representation Mismatch Unlearning) para olvidar un subconjunto concreto de hechos: 411 pares de película-director etiquetados como "raros" dentro del conjunto de olvido.

El interés del checkpoint es metodológico más que de producto. No se trata de un modelo generalista mejorado, sino de un artefacto de investigación que demuestra que es posible reducir drásticamente la recuperación de hechos específicos (recall de olvido del 0,048) preservando buena parte del conocimiento retenido (recall de retención del 0,767 sobre una base de 0,842). La receta combina RMU con un coeficiente de steering de 2 sobre la capa 15, pérdida de retención EMBED_DIFF y 8 épocas de entrenamiento con learning rate 1e-5.

Arquitectura transformer decoder-only de 8.030.261.248 parámetros (8B), licencia Llama 3.1, pesos en safetensors y formato de prompt compatible con la plantilla de chat de Llama 3.1. El repositorio ocupa 16,1 GB. Es relevante ahora porque el *unlearning* fiable es una pieza clave para cumplimiento normativo (derecho al olvido, retirada de datos), y este checkpoint aporta métricas de evaluación explícitas por época que permiten auditar el compromiso entre olvido y retención.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 soporta 128k tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Llama-3.1-8B-Instruct sin modificaciones estructurales: transformer denso decoder-only con atención por grupos (GQA) y RoPE. La innovación no está en la arquitectura, sino en el procedimiento de *unlearning*. El pipeline parte de `AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft`, un fine-tuning de Llama-3.1-8B-Instruct sobre el conjunto DUET (configuración `film`) durante 6 épocas, y aplica después RMU con la configuración `duet_8B_RMU` del framework open-unlearning.

Los datos de olvido son 411 hechos película-director del split `forget_rare_film` (filas con `split_role = train`, commit `2c2b047bb569b205ea57f924b36e818d4e3f3903` del dataset `SwetieePawsss/DUET_LLM`). El conjunto de retención son 546 hechos de `retain_film`. La receta de RMU usa coeficiente de steering 2 sobre `model.layers.15`, gamma 1, alpha 1, pérdida de retención EMBED_DIFF, learning rate 1e-5, 8 épocas, batch 4 con acumulación de gradiente 4, warmup de 1 época, weight decay 0,01, optimizador `paged_adamw_8bit`, precisión bf16 y semilla 1. Se guarda un checkpoint por época (26 pasos por época).

La selección de época es un criterio explícito de preregistro: se considera "cualificada" toda época con recall de olvido en generación libre (ROUGE-L, greedy, 64 tokens nuevos) menor o igual a 0,15 y recall de retención mayor o igual a la retención base menos 0,30 (base 0,842, suelo 0,542). Entre las cualificadas se elige la de mayor diferencia retención − olvido. La época seleccionada es la 7, con recall de olvido 0,048 y recall de retención 0,767.

## Capacidades

- Generación de texto conversacional con la plantilla de chat de Llama 3.1 (turno de sistema, turno de usuario).
- Respuesta a preguntas factuales en modo conciso: el prompt de sistema entrenado pide respuestas "terse and fact-only", de pocas palabras.
- Razonamiento y conocimiento general heredados de Llama-3.1-8B-Instruct, con la salvedad de que el fine-tuning sobre DUET y el *unlearning* posterior alteran la distribución de respuestas.
- Capacidad de *unlearning* verificable: el checkpoint incorpora métricas reproducibles de olvido y retención sobre el conjunto `film`.
- Soporte de tool calling / function calling: no documentado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información proporcionada.
- Capacidades multilingües: no documentadas; el entrenamiento de *unlearning* se hace sobre un conjunto factual en inglés.
- Capacidades especiales: no dispone de visión ni audio; el *thinking mode* no está documentado.

## Casos de uso

- Investigación en *machine unlearning*: sirve como checkpoint de referencia para reproducir la receta RMU con semilla 1 y comparar curvas de olvido/retención por época frente a otras semillas o algoritmos.
- Auditoría de cumplimiento del derecho al olvido: permite medir empíricamente cuánto conocimiento factual concreto se elimina y a qué coste en retención, con métricas ROUGE-L explícitas.
- Evaluación de robustez frente a *relearning*: el modelo está pensado para probarse con la sonda de readquisición (LoRA de rango 4, semilla 42, pasos 1-256) descrita en el repositorio del proyecto.
- Análisis de subespacios de representación: la ablación de subespacio EI (`stage9_gate_anatomy.py`) permite estudiar qué direcciones internas codifican el conocimiento olvidado.
- Estudio de compromiso olvido-retención: útil para calibrar umbrales de aceptación (por ejemplo, recall de olvido ≤ 0,15) en pipelines de publicación de modelos desaprendidos.
- Docencia y experimentación con Llama 3.1: al mantener el tokenizador y la plantilla de chat originales, puede integrarse en pipelines existentes de transformers para comparar comportamiento antes y después del *unlearning*.
- Pruebas de QA factual controlado: con el prompt de sistema "terse and fact-only", sirve para evaluar respuestas cortas sobre un dominio acotado (cine) donde se conoce exactamente qué hechos deben haberse olvidado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K u otros). El autor únicamente reporta métricas internas de olvido y retención por época:

| Epoca | Recall olvido (ROUGE-L) | Recall retencion (ROUGE-L) |
|---|---|---|
| 1 | 0,707 | 0,652 |
| 2 | 0,498 | 0,654 |
| 3 | 0,269 | 0,706 |
| 4 | 0,058 | 0,699 |
| 5 | 0,079 | 0,751 |
| 6 | 0,051 | 0,760 |
| 7 (seleccionada) | 0,048 | 0,767 |
| 8 | 0,052 | 0,766 |

Referencia base de retención: 0,842. Umbral de cualificación: olvido ≤ 0,15 y retención ≥ 0,542.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, 20-24 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB de pesos; en 4 bits, alrededor de 4,5-5 GB (estimaciones por tamaño, no documentadas por el autor).
- GPU recomendadas: A100 40 GB o H100 para evaluación a contexto largo y sin cuantizar; RTX 4090 (24 GB) suficiente para bf16 con contexto moderado; RTX 3090 (24 GB) viable en las mismas condiciones.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 a bf16 con contexto limitado, y en GPUs de 8-12 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; vLLM, llama.cpp y Ollama no están documentados por el autor, aunque el formato safetensors es convertible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Olvido (recall) | Retencion (recall) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-DUET-film-RMU-rare-s1 (ep. 7) | 8,03B | no disponible | 0,048 | 0,767 | llama3.1 | Hugging Face |
| AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft (base del unlearning) | 8,03B | no disponible | no disponible | 0,842 (base) | llama3.1 | Hugging Face |
| Llama-3.1-8B-Instruct (original Meta) | 8,03B | 128k | no aplica | no aplica | llama3.1 | Hugging Face, Meta |

La comparación con el checkpoint base de fine-tuning es la más informativa: el *unlearning* reduce el recall de olvido desde el valor del fine-tuning hasta 0,048, a costa de bajar la retención de 0,842 a 0,767 (una caída de 0,075 puntos absolutos). No se dispone de datos para comparar con otros algoritmos de *unlearning* (por ejemplo, NPO, GradDiff o SalUn) en este mismo conjunto.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni como asistente general; su distribución de respuestas está sesgada por el fine-tuning DUET y el *unlearning* posterior.
- El *unlearning* es parcial y no garantiza eliminación irreversible: el autor documenta una sonda de *relearning* (LoRA de rango 4) precisamente para medir cuánto conocimiento se recupera con pocos pasos de ajuste.
- Riesgo de alucinación: el prompt de sistema fuerza respuestas "fact-only" y muy breves, lo que puede producir respuestas concisas pero incorrectas cuando el modelo carece del hecho (especialmente sobre el conjunto olvidado).
- Sesgos conocidos: no documentados en la información proporcionada; hereda los sesgos de Llama-3.1-8B-Instruct y los del conjunto DUET.
- Limitaciones de idioma: no se documentan idiomas soportados; el conjunto de evaluación es factual en inglés.
- Restricciones de licencia: licencia Llama 3.1, que impone condiciones de uso (política de uso aceptable de Meta, obligaciones de atribución y restricciones para usos prohibidos); el uso comercial requiere revisar los términos completos.
- Métricas limitadas: solo se reportan ROUGE-L recall sobre conjuntos de olvido y retención; no hay evaluación de capacidades generales (razonamiento, código, matemáticas) tras el *unlearning*, por lo que se desconoce el daño colateral fuera del dominio de cine.
- Reproducibilidad dependiente de artefactos externos: la receta referencia rutas y scripts de un repositorio de proyecto (`open-unlearning/experiments/`, `film_unlearning/scripts/`, `revival_mechanism/`) que no forman parte del repositorio de Hugging Face.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AnniBori/Llama-3.1-8B-Instruct-DUET-film-RMU-rare-s1
- Modelo base del *unlearning*: https://huggingface.co/AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft
- Dataset DUET: https://huggingface.co/datasets/SwetieePawsss/DUET_LLM (commit `2c2b047bb569b205ea57f924b36e818d4e3f3903`)
- Modelo original Llama-3.1-8B-Instruct: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/
- Framework open-unlearning: no disponible en la información proporcionada (el autor cita `src/train.py --config-name=unlearn.yaml` sin URL)

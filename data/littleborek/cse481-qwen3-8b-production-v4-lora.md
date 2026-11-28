# littleborek/cse481-qwen3-8b-production-v4-lora

## Resumen

El modelo `littleborek/cse481-qwen3-8b-production-v4-lora` es un adaptador LoRA (entrenado con QLoRA NF4) sobre el modelo base Qwen/Qwen3-8B, desarrollado por el usuario littleborek en el contexto de un proyecto academico de ingenieria economica (CSE-481). Su proposito es servir como asistente de investigacion retrospectiva sobre datos financieros de la bolsa turca BIST (Borsa Istanbul), bajo el nombre interno de "Pusula". No se trata de un modelo de proposito general, sino de un artefacto de investigacion con un dominio muy acotado.

El adaptador se entrena sobre un corpus reducido de 292 registros de enrutamiento/respuesta y 330 registros de evidencia, con cortes temporales estrictos (cutoff 2026-09-10). El entrenamiento se realizo en una unica GPU consumer (RTX 5060 Ti de 16 GB) durante aproximadamente 46 minutos, con 98 pasos de optimizador y una perdida de validacion de 0.02407 (perplejidad 1.02437). El repositorio ocupa solo 0.2 GB porque contiene exclusivamente los pesos del adaptador, la configuracion de carga y el tokenizer, sin los pesos del modelo base.

Su relevancia es limitada y muy especifica: demuestra un flujo completo de ajuste fino parametrizado eficiente (PEFT) con QLoRA sobre Qwen3-8B para un dominio financiero concreto, incluyendo enrutamiento de herramientas, verificacion de evidencia y control de sesgos temporales. No obstante, la evaluacion held-out completa esta pendiente y el autor la declara explicitamente como no validada. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder-only (Qwen3-8B); QLoRA NF4 con doble cuantizacion, computo BF16 |
| Parametros totales | No disponible (adaptador LoRA; el modelo base Qwen3-8B tiene 8.000 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4736 tokens en entrenamiento (`max_length`); limite de entrada en serving 4096 tokens; `max_new_tokens` 768 |
| Tipos de cuantizacion | NF4 con doble cuantizacion durante entrenamiento; pesos del adaptador en safetensors (precision no especificada) |
| Idiomas soportados | Turco (tr) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`) + configuracion PEFT |
| Rango LoRA | r=16, lora_alpha=32, lora_dropout=0.05 |
| Modulos objetivo | q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj |
| Modelo base | Qwen/Qwen3-8B (revision b968826d9c46dd6066d109eabc6255188de91218) |
| Tamano del repositorio | 0.2 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-8B, un transformer decoder-only de 8.000 millones de parametros. El ajuste se realiza mediante QLoRA con cuantizacion NF4 de doble cuantizacion y computo en BF16, aplicando LoRA de rango 16 y alpha 32 sobre todas las proyecciones lineales del modelo (atencion y MLP). La perdida se calcula solo sobre la completion (prompt enmascarado). El entrenamiento usa `max_length=4736`, `batch_size=1`, acumulacion de gradiente 4, tasa de aprendizaje 2e-4 con decaimiento lineal y 6 pasos de warmup, semilla 481, durante 98 pasos (~3 epocas sobre 130 ejemplos).

El corpus `production_corpus_v4` se construye con cortes temporales estrictos: cutoff 2026-09-10, entrenamiento hasta 2026-06-30, validacion 2026-07-01 a 2026-07-31 y test 2026-08-01 a 2026-09-10. Los datos incluyen 65 pares `train_answer`/`train_router` (130 filas), 43 pares de validacion y 38 pares de test, con categorias como financiero (ventanas de disclosure 0-4), weekday con correccion de Bonferroni/Holm, reversiones, sector y macro. El entrenamiento se ejecuto en una RTX 5060 Ti (16 GB) con pico de VRAM asignada de 11.75 GB y reservada de 13.19 GB, en 2766.21 segundos. La perdida de validacion final fue 0.02407 (perplejidad 1.02437), mejorando respecto a la version v3 (0.0495 / 1.0507).

## Capacidades

- Generacion de texto en turco e ingles, con formato de prosa natural emparejado al idioma de la consulta.
- Enrutamiento de herramientas (router): clasifica consultas en categorias como sector, weekday, reversal, macro o financiero, y emite argumentos estructurados.
- Generacion de respuestas con citas de evidencia (`citation_ids_exact`) y verificacion de numeros anclados (`grounded_numbers_pass`).
- Control de estado de resultado (`outcome_status_correct`) y deteccion de patrones de consejo financiero (`contains_advice_pattern`), orientado a evitar recomendaciones de inversion.
- Razonamiento multi-paso acotado al dominio financiero retrospectivo (ventanas de disclosure, pruebas de significacion multiple).
- Soporte de tool calling mediante un esquema de enrutamiento propio del proyecto.
- Capacidad multilingue limitada a turco e ingles.
- No se documentan capacidades de vision, audio ni modo thinking explicito.

## Casos de uso

- Asistente de investigacion retrospectiva sobre BIST: el adaptador responde consultas sobre eventos financieros historicos de la bolsa turca, con corte temporal estricto (`as_of <= 2026-09-10`), adecuado para estudios academicos de ingenieria economica.
- Enrutamiento de consultas financieras: clasifica preguntas en categorias (sector, macro, reversal, weekday) y genera argumentos estructurados para invocar herramientas deterministas locales, gracias a su entrenamiento especifico en router.
- Verificacion de evidencia en respuestas: integrado con `EvidenceGroundingGuardrail`, el modelo produce citas exactas y numeros anclados, util para pipelines que requieren trazabilidad documental.
- Analisis de significacion estadistica multiple: maneja casos con correccion Bonferroni/Holm, util para evaluar disclosures financieros con multiples comparaciones.
- Prototipo docente de PEFT/QLoRA: sirve como ejemplo reproducible de ajuste fino de Qwen3-8B en una GPU consumer de 16 GB, con hiperparametros y semillas documentados.
- Filtro de consejo financiero no solicitado: el modelo se entrena para evitar patrones de recomendacion de inversion, util en entornos donde se requiere separar analisis de asesoramiento.
- Generacion de resumenes de ventanas de disclosure (0-4) para empresas del BIST, como TUPRS, en ingles o turco segun la consulta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor solo reporta metricas internas de validacion y una evaluacion parcial rapida:

| Metrica | Valor |
|---|---|
| Validation loss (v4) | 0.02407 |
| Validation perplexity (v4) | 1.02437 |
| Validation loss (v3, referencia) | 0.0495 |
| Validation perplexity (v3, referencia) | 1.0507 |
| Suite de regresion backend/guardrail/corpus/servidor | 78 passed, 1 skipped, 45 subtests passed (18.36 s) |
| Evaluacion quick held-out | 7/10 registros escritos antes de detener; 4/4 router con `schema_valid=True` y `tool_names_exact=True`; 3/3 answer con `outcome_status_correct=True`, `grounded_numbers_pass=True`, `citation_ids_exact=True` |
| Evaluacion held-out completa (38 queries / 76 registros) | No ejecutada |
| Aceptacion UI Chrome (5 escenarios) | No ejecutada |

## Requisitos de hardware

- Entrenamiento: una NVIDIA RTX 5060 Ti de 16 GB fue suficiente con QLoRA NF4 (pico asignado 11.75 GB, reservado 13.19 GB), `batch_size=1` y acumulacion de gradiente 4.
- Inferencia: requiere cargar el modelo base Qwen3-8B completo mas el adaptador. En BF16, el modelo base necesita aproximadamente 16 GB de VRAM; en cuantizacion de 8 bits, unos 8-9 GB; en 4 bits, unos 5-6 GB (estimaciones orientativas, no reportadas por el autor).
- GPU recomendadas: para BF16, A100 40 GB, H100 o RTX 4090 (24 GB); para cuantizacion 4/8 bits, RTX 3090/4090, RTX 5060 Ti 16 GB o similares.
- Cabe en GPU consumer: si, con cuantizacion (RTX 4090, 3090, 5060 Ti 16 GB); en BF16 completo requiere 24 GB o mas.
- Despliegue: el autor usa `product.gpu_server` con `input_token_limit=4096` y `max_new_tokens=768`; es compatible con transformers + PEFT y, en principio, con vLLM, TGI o llama.cpp tras fusionar el adaptador con el modelo base (no documentado por el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| littleborek/cse481-qwen3-8b-production-v4-lora | 8B (base) + LoRA r=16 | 4736 (entrenamiento) / 4096 (serving) | Apache 2.0 | Asistente financiero BIST retrospectivo | Hugging Face (adaptador) |
| Qwen/Qwen3-8B | 8B | No disponible en la informacion | No disponible en la informacion | Modelo generalista base | Hugging Face |
| Adaptadores LoRA financieros genericos | Variable | Variable | Variable | Dominio financiero general | No disponible |

No se dispone de datos de benchmarks comparativos ni de alternativas equivalentes documentadas en la informacion proporcionada.

## Limitaciones y advertencias

- Evaluacion incompleta: solo se ejecuto una evaluacion quick parcial (7/10 registros); la evaluacion held-out completa de 38 queries y la aceptacion UI en Chrome estan pendientes.
- Dominio muy restringido: el adaptador esta entrenado exclusivamente para investigacion retrospectiva sobre BIST; no es un modelo de proposito general.
- Riesgo de alucinacion: aunque se entrena para anclar numeros y citas, el autor exige que todas las salidas pasen por herramientas deterministas locales y por `EvidenceGroundingGuardrail`, lo que implica que el modelo por si solo no es fiable.
- Sesgos: el corpus es pequeno (130 ejemplos de entrenamiento) y cubre un numero limitado de empresas y categorias, lo que puede producir sesgos hacia los casos vistos (por ejemplo, secuencias de TUPRS).
- Idioma: solo turco e ingles; no se documenta soporte para castellano.
- Licencia: Apache 2.0 permite uso comercial, pero el autor declara el artefacto como "retrospective research artifact only" y no como sistema de trading validado ni asesoramiento financiero.
- Restricciones temporales: las respuestas estan acotadas a `as_of <= 2026-09-10`; no debe usarse para prediccion prospectiva.
- Datos excluidos: el repositorio no incluye corpus, PDFs, historicos OHLC ni logs, lo que limita la reproducibilidad completa del entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/littleborek/cse481-qwen3-8b-production-v4-lora
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio GitHub del proyecto: https://github.com/littleborek/engineering-economics

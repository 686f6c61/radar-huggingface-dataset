# Janhvi1008/agri-llm-qwen2.5-7b-lora

## Resumen

agri-llm-qwen2.5-7b-lora es un adaptador LoRA entrenado sobre el modelo base `unsloth/Qwen2.5-7B-Instruct-bnb-4bit` (Qwen2.5-7B-Instruct cuantizado en 4 bits), desarrollado por el usuario Janhvi1008. Su propósito es responder consultas de agricultores sobre plagas y enfermedades en ocho cultivos de Maharashtra (India) —algodón, soja, tur, gram, cebolla, tomate, uva y granada— devolviendo una única recomendación estructurada en JSON con causas probables, medidas no químicas, opciones químicas con dosis, intervalo de seguridad (PHI) y avisos de escalado a un experto.

El modelo se apoya en datos de etiquetas del CIB&RC (Central Insecticides Board & Registration Committee) para fundamentar los hechos químicos: pares cultivo × plaga registrados, dosis de producto y PHI. Es un proyecto de investigación y portafolio, no un producto listo para producción, y el propio autor advierte explícitamente que no debe usarse para asesoramiento real sobre pesticidas.

La relevancia actual reside en su enfoque metodológico: fine-tuning con datos sintéticos generados por Claude y filtrados por un verificador determinista, evaluación contra un benchmark propio de 498 ítems y un guard posterior que corrige dosis y escalados. El adaptador ocupa 0,3 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-7B-Instruct) con adaptador LoRA |
| Parámetros totales | 7B (modelo base); el adaptador LoRA añade un número no disponible de parámetros |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (longitud máxima de secuencia usada en entrenamiento); contexto nativo del base no disponible en la información |
| Tipos de cuantización | Base en 4 bits (bnb-4bit); el adaptador se distribuye en safetensors |
| Idiomas soportados | no disponible (las consultas de entrenamiento provienen de logs de Kisan Call Centre, presumiblemente inglés y lenguas de India) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-7B-Instruct, un transformer decoder-only de 7.000 millones de parámetros. El fine-tuning se realizó con LoRA de rango 32, alpha 64 y dropout 0, sobre los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El entrenamiento usó Unsloth + TRL SFT sobre el modelo base cuantizado en 4 bits, con 1 época, 281 pasos, learning rate 2e-4 con schedule coseno y 20 pasos de warmup, batch efectivo de 16 (2 × 8 de acumulación), optimizador adamw_8bit, precisión fp16, semilla 42 y longitud máxima de 2.048 tokens, ejecutado en una GPU Kaggle T4. El autor indica que estos valores provienen de un registro de sesión y no han sido verificados contra un `trainer_state.json`.

Los datos de entrenamiento son sintéticos: 4.493 ejemplos de entrenamiento y 1.136 de test reservado. Las entradas son consultas de agricultores, mayoritariamente de logs del Kisan Call Centre (las de uva fueron construidas). Las respuestas las generó Claude (`claude-sonnet-4-6`) a partir de esas consultas y de las filas de etiquetas del CIB&RC correspondientes; solo se conservaron las respuestas que un verificador determinista, que las contrasta con los datos de etiquetas, puntuó de forma perfecta.

## Capacidades

- Generación de recomendaciones fitosanitarias estructuradas en JSON para ocho cultivos de Maharashtra (algodón, soja, tur, gram, cebolla, tomate, uva y granada).
- Identificación de causas probables de una plaga o enfermedad a partir de la consulta del agricultor.
- Priorización de medidas no químicas antes de las opciones químicas.
- Propuesta de opciones químicas con dosis, base de la dosis, intervalo de seguridad (PHI) y advertencias.
- Indicación de si procede escalar a un experto (campo de escalado).
- Capacidad de combinarse con un fact sheet de filas del CIB&RC recuperadas por RAG (variante R4), lo que mejora su rendimiento.
- Capacidad de ser corregido por un guard determinista posterior que elimina opciones no registradas, dosis fuera de rango y fuerza el escalado cuando el PHI es desconocido.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking específicas en la información disponible.

## Casos de uso

- Asistencia a agricultores en la consulta de plagas: el modelo recibe una pregunta en lenguaje natural sobre un cultivo y una plaga y devuelve un JSON con causas, medidas no químicas y opciones químicas con dosis y PHI, adecuado para integrarse en un chatbot agrícola de primera línea.
- Triaje y escalado a expertos: el campo de escalado permite derivar automáticamente a un oficial agrícola los casos en los que el modelo no dispone de información fiable (por ejemplo, PHI desconocido), lo que encaja en flujos de atención con supervisión humana.
- Enriquecimiento de bases de conocimiento agrícolas: el JSON estructurado puede alimentar sistemas internos de consulta o fichas de producto, siempre con revisión humana previa.
- Investigación sobre fine-tuning con datos sintéticos: sirve como caso de estudio reproducible de generación de datos con un LLM grande, filtrado por verificador determinista y evaluación con benchmark propio.
- Evaluación de técnicas RAG en dominios regulados: la comparativa entre las variantes R0, R2, R3 y R4 permite medir el efecto de combinar fine-tuning con recuperación de hechos de etiquetas oficiales.
- Prototipado de guardarraíles deterministas: el guard del repositorio (eliminación de opciones no registradas y dosis fuera de rango) es un ejemplo práctico de post-procesado para dominios con requisitos legales estrictos.
- Docencia y portafolio: por su tamaño (0,3 GB de adaptador) y su licencia Apache 2.0, es adecuado para demostraciones y ejercicios de despliegue de adaptadores PEFT.

## Benchmarks y rendimiento

Los resultados provienen del verificador propio del proyecto sobre un benchmark de 498 ítems (500 menos 2 con defectos conocidos). Las puntuaciones van de 0 a 1. "cap" es `max_new_tokens`; "excl" cuenta ítems excluidos por contradicciones documentadas en las etiquetas.

| Brazo | cap | Media | Puntuados / excl / missing | G1 % | G2 % | C1_dose | C2_phi | C3_formulation | C4_escalation | C5_causes_top1 | C6_non_chemical |
|---|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| R0_baseline | 1.200 | 0,1726 | 498 / 0 / 0 | 100,0 | 53,0 | 0,0000 | 0,0000 | 0,0000 | 0,8182 | n/a | 0,0000 |
| R3_sft | 1.200 | 0,5220 | 487 / 11 / 0 | 99,6 | 99,4 | 0,3675 | 0,3134 | 0,4636 | 0,7913 | 0,6746 | 0,5385 |
| R2_base_rag | 3.072 | 0,2060 | 497 / 1 / 0 | 100,0 | 66,7 | 0,4575 | 0,4592 | 0,1219 | 0,4139 | 0,5556 | 0,7732 |
| R2_base_rag_unwrapped | 3.072 | 0,2912 | 487 / 11 / 0 | 100,0 | 80,1 | 0,6370 | 0,6459 | 0,1583 | 0,4665 | 0,5769 | 0,7686 |
| R4_sft_rag | 3.072 | 0,5840 | 498 / 0 / 0 | 100,0 | 91,0 | 0,3926 | 0,4204 | 0,4215 | 0,7991 | 0,6236 | 0,4122 |

Comparaciones pareadas (bootstrap percentil de 10.000 remuestreos, semilla 0; p de test de signos exacto bilateral):

| A vs B | n | Media A | Media B | Δ (A−B) | IC 95 % | Gana / pierde / empata | p |
|---|---:|---:|---:|---:|---|---:|---:|
| R4_sft_rag vs R2_base_rag | 497 | 0,5852 | 0,2060 | +0,3792 | [+0,3236, +0,4337] | 332 / 76 / 89 | 3,07e-39 |
| R4_sft_rag vs R2_base_rag_unwrapped | 487 | 0,5791 | 0,2912 | +0,2879 | [+0,2306, +0,3446] | 307 / 104 / 76 | 2,38e-24 |
| R4_sft_rag vs R3_sft | 487 | 0,5807 | 0,5220 | +0,0586 | [+0,0229, +0,0939] | 105 / 59 / 323 | 4,08e-04 |
| R2_base_rag_unwrapped vs R0_baseline | 487 | 0,2912 | 0,1730 | +0,1183 | [+0,0710, +0,1667] | 172 / 134 / 181 | 0,034 |

Con el guard determinista aplicado a R4:

| R4 | Antes del guard | Después del guard |
|---|---:|---:|
| Media (498 ítems) | 0,5840 | 0,6597 |
| G2 (esquema válido) % | 91,0 | 100,0 |
| Sobredosis (WRONG_HIGH, RANGE_TOP) | 12 / 10 | 1 / 1 |
| Dosis por hectárea etiquetada por acre | 10 / 5 | 0 / 0 |
| Químicos no registrados (G5) | 3 / 1 | 1 / 1 |
| Opciones con PHI desconocido no escaladas | 87 / 45 | 0 / 0 |
| Falsos positivos (opciones correctas eliminadas) | — | 0 (de 2 no registradas + 32 por dosis) |

El autor advierte que el guard lee los mismos datos de etiquetas que el scorer, por lo que la mejora refleja consistencia entre ambos, no una prueba independiente de corrección.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el adaptador (0,3 GB) se suma al modelo base de 7B. En 4 bits, el base requiere aproximadamente 4-5 GB de VRAM; en fp16, unos 14-15 GB (estimación general, no confirmada en la información).
- GPU recomendadas: el entrenamiento se realizó en una Kaggle T4, lo que indica que la inferencia cabe en GPUs de gama media. No se especifican A100, H100 ni RTX 4090 en la documentación.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más en cuantización de 4 bits (no confirmado por el autor).
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargarse junto al modelo base con la librería `peft`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| agri-llm-qwen2.5-7b-lora | 7B (base) + LoRA | 2.048 (entrenamiento) | Fine-tuning agrícola con datos sintéticos y verificación | Apache 2.0 | Hugging Face |
| Qwen2.5-7B-Instruct (base) | 7B | no disponible en la información | Modelo generalista de instrucciones | Apache 2.0 (según el base) | Hugging Face |
| Alternativas agrícolas de 7B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada; la única comparación cuantitativa es interna (R0, R2, R3, R4).

## Limitaciones y advertencias

- El propio autor advierte que es un modelo de investigación y portafolio, no apto para asesoramiento real sobre pesticidas; las respuestas pueden ser erróneas de formas que dañen cultivos, personas y ganado.
- La etiqueta del producto es legalmente vinculante en India y prevalece sobre cualquier salida del modelo; debe consultarse siempre a un oficial agrícola o agrónomo cualificado.
- Sin el guard, R4 produjo 12 opciones con sobredosis, 10 dosis por hectárea etiquetadas por acre y 87 opciones con PHI desconocido no escaladas.
- El guard y el scorer usan los mismos datos de etiquetas, por lo que la mejora de puntuación no constituye una validación independiente.
- Sesgos conocidos: no documentados explícitamente, pero el ámbito se limita a ocho cultivos de Maharashtra y a datos de etiquetas del CIB&RC.
- Riesgo de alucinación: el modelo puede inventar dosis, PHI o productos no registrados; el filtrado de entrenamiento reduce pero no elimina este riesgo.
- Limitaciones de idioma: no se especifican los idiomas soportados; las consultas de entrenamiento provienen de logs de Kisan Call Centre.
- Limitación de contexto: la longitud máxima usada en entrenamiento es de 2.048 tokens.
- Los hiperparámetros de entrenamiento provienen de un registro de sesión no verificado contra `trainer_state.json`.
- La licencia Apache 2.0 permite uso comercial, pero las advertencias del autor y la naturaleza sintética de los datos desaconsejan su uso en producción sin validación agronómica independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Janhvi1008/agri-llm-qwen2.5-7b-lora
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct-bnb-4bit
- Repositorio GitHub con `reports/training_config.md` y `src/guard.py`: no disponible (el autor lo menciona pero no se proporciona la URL)
- Paper, blog o demo: no disponibles en la información proporcionada.

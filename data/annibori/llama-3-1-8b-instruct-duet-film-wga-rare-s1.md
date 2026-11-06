# AnniBori/Llama-3.1-8B-Instruct-DUET-film-WGA-rare-s1

## Resumen

Llama-3.1-8B-Instruct-DUET-film-WGA-rare-s1 es un modelo derivado de Llama-3.1-8B-Instruct, desarrollado por AnniBori, que aplica una receta de *machine unlearning* sobre un fine-tune previo especializado en el dominio del cine. El objetivo no es mejorar capacidades generativas, sino eliminar selectivamente un conjunto de hechos concretos (411 pares director-película etiquetados como "raros") manteniendo intacto el conocimiento restante del dominio (546 hechos de retención). Es, por tanto, un artefacto de investigación en olvido selectivo, no un modelo de propósito general.

El modelo parte de `AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft` (epoch 6) y aplica el algoritmo WGA (Weighted Gradient Ascent, con peso de token p(token)^beta) durante 8 epochs con un objetivo combinado de ascenso en el conjunto forget y NLL en el conjunto retain. La época seleccionada es la 7, que alcanza un recall de olvido de 0,076 (frente al 0,842 de retención base) y un recall de retención de 0,992, es decir, elimina casi por completo los hechos objetivo sin degradar el resto.

Su relevancia es metodológica: documenta de forma reproducible una receta de unlearning con puerta de cualificación (forget recall ≤ 0,15 y retain recall ≥ base − 0,30), tabla época a época y scripts de evaluación de ataques por paráfrasis y sondas de relearning con LoRA de rango 4. Es útil para investigadores que estudian privacidad, cumplimiento del derecho al olvido o robustez de técnicas de desaprendizaje.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), fine-tune + unlearning WGA |
| Parametros totales | 8.030.261.248 (8,03 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Llama 3.1: 128K según el modelo base, no verificado en esta ficha) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; compatible con cuantización estándar de transformers, no documentada por el autor) |
| Idiomas soportados | no disponible (el modelo base Llama 3.1 es multilingüe; el autor no declara idiomas) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (repo de 16,1 GB) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama-3.1-8B-Instruct sin modificaciones estructurales: transformer decoder-only denso con atención por grupos (GQA) y RoPE, sobre el que se aplica un fine-tune de dominio (conjunto DUET, configuración `film`) y después un proceso de unlearning. El autor no documenta cambios en la arquitectura ni en el tokenizador; el chat template utilizado es el de Llama 3.1, con un system prompt fijo: `You are terse and fact-only QA assistant. Reply to the question clearly with few-words correct answer.`

El entrenamiento de unlearning sigue la receta WGA de open-unlearning (`experiment=revival_mechanism/unlearn/duet_8B_WGA`) con beta 1 (peso de token p(token)^beta), gamma 1, alpha 1 y pérdida de retención NLL. Hiperparámetros: learning rate 1e-5, 8 epochs, batch 4 con acumulación de gradiente 4, warmup de 1 epoch, weight decay 0,01, optimizador `paged_adamw_8bit`, precisión bf16, semilla 1 y checkpoint cada epoch (26 pasos por epoch). El conjunto forget son 411 hechos director-película (`forget_rare_film`, split_role=train) del dataset `SwetieePawsss/DUET_LLM`; el retain son 546 hechos (`retain_film`).

La selección de época es explícita y auditable: se cualifican las épocas con recall de generación libre (ROUGE-L, greedy, 64 tokens nuevos) en forget ≤ 0,15 y retain ≥ recall base − 0,30 (base 0,842, suelo 0,542); entre las cualificadas se elige la de mayor diferencia retain − forget. Resultado: epoch 7 con forget recall 0,076 y retain recall 0,992. La model card incluye además scripts para evaluación de ataques por paráfrasis, sonda de relearning con LoRA de rango 4 (semilla 42, pasos 1-256) y ablación de subespacio con nulo emparejado por selección.

## Capacidades

- Generación de texto conversacional y respuesta a preguntas factuales breves, condicionada al system prompt "terse and fact-only".
- Conocimiento de dominio cinematográfico (directores y películas) parcialmente retenido: 546 hechos de retención con recall 0,992.
- Olvido selectivo verificable de 411 hechos concretos (recall 0,076 en generación libre).
- Evaluación de robustez frente a paráfrasis y ataques de elicitación (conjuntos documentados en los scripts).
- Resistencia medida a relearning: sonda LoRA de rango 4 con 256 pasos sobre el modelo.
- Soporte de tool calling / function calling: no disponible (no documentado por el autor; heredable del modelo base, no verificado).
- Capacidades de agente y razonamiento multi-paso: no disponibles (no evaluadas ni documentadas).
- Capacidades multilingües: no disponibles (no declaradas).
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Investigación en machine unlearning: servir como punto de comparación reproducible frente a otras recetas (gradient ascent, NPO, RMU) sobre el mismo conjunto DUET film, gracias a la tabla de épocas y a los scripts publicados.
- Auditoría de cumplimiento del derecho al olvido: evaluar si un modelo fine-tuneado puede eliminar hechos concretos sin destruir el conocimiento circundante, midiendo el gap retain − forget (0,916 en la época 7).
- Pruebas de robustez frente a ataques de elicitación: usar los conjuntos de paráfrasis y ataque incluidos en `film_gate.py` para medir si el olvido se recupera con reformulaciones.
- Estudio de relearning: la sonda LoRA de rango 4 (`stage4_revival_sweep.py`) permite cuantificar cuántos pasos de fine-tune bastan para recuperar los hechos olvidados, un dato clave para evaluar la solidez del unlearning.
- Análisis de subespacios de representación: la ablación con nulo emparejado (`stage9_gate_anatomy.py`) sirve para estudiar si el olvido se localiza en direcciones concretas del espacio de activaciones.
- Docencia y reproducción de pipelines: el flujo completo (fine-tune, unlearning, puerta de cualificación, evaluación) es un ejemplo práctico de experimentación controlada con semillas fijas y checkpoints por epoch.
- Base para prototipos de asistentes factuales de nicho: el modelo responde de forma concisa y verificable sobre un dominio acotado, útil en demos de QA restringido.

## Benchmarks y rendimiento

| Epoca | Forget recall (ROUGE-L) | Retain recall (ROUGE-L) |
|---|---|---|
| 1 | 0,767 | 0,902 |
| 2 | 0,349 | 0,897 |
| 3 | 0,190 | 0,946 |
| 4 | 0,124 | 0,947 |
| 5 | 0,101 | 0,980 |
| 6 | 0,085 | 0,989 |
| 7 (seleccionada) | 0,076 | 0,992 |
| 8 | 0,078 | 0,992 |

Referencia base: retain recall 0,842 en el modelo de partida. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, 18-24 GB para contextos moderados.
- Cuantización a 8 bits: alrededor de 8-9 GB de pesos; a 4 bits: alrededor de 4,5-5 GB, con margen para KV cache.
- GPU recomendadas: A100 40/80 GB o H100 para despliegue concurrente y contextos largos; RTX 4090 (24 GB) para bf16 en un solo usuario; RTX 3090 (24 GB) similar.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con bf16 y contexto moderado, y en GPUs de 12-16 GB (RTX 4070 Ti, RTX 4080) con cuantización a 8 o 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), vLLM y llama.cpp/Ollama mediante conversión a GGUF (no publicada por el autor).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (DUET-film-WGA-rare-s1) | 8,03 B | no disponible | Unlearning WGA sobre fine-tune de dominio | llama3.1 | Hugging Face, 0 descargas |
| AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft | 8,03 B | no disponible | Fine-tune de dominio sin unlearning (modelo base de partida) | llama3.1 | Hugging Face |
| Meta-Llama-3.1-8B-Instruct | 8,03 B | 128K | Modelo instructivo generalista | llama3.1 | Hugging Face, ampliamente desplegado |
| Alternativas de unlearning sobre Llama-3.1-8B (NPO, RMU, gradient ascent) | 8,03 B | 128K | Otras recetas de olvido selectivo | llama3.1 | Repos de investigación; disponibilidad variable |

La comparación relevante es frente al modelo de partida: la época 7 reduce el forget recall de 0,842 (base) a 0,076 mientras eleva el retain recall a 0,992, un intercambio favorable en este conjunto concreto. Frente a Llama-3.1-8B-Instruct generalista, este modelo pierde capacidades generales no evaluadas y gana un perfil factual estrecho y auditado.

## Limitaciones y advertencias

- Modelo de investigación con 0 descargas y 0 likes: no hay validación comunitaria ni uso en producción documentado.
- El olvido se mide con ROUGE-L sobre 411 hechos; no garantiza la eliminación de la información en representaciones internas ni frente a ataques no cubiertos.
- La sonda de relearning con LoRA de rango 4 sugiere que el conocimiento podría recuperarse con fine-tuning adicional; el autor no publica conclusiones cerradas al respecto.
- Riesgo de alucinación en preguntas factuales fuera del conjunto retain; el system prompt fuerza respuestas breves, lo que puede ocultar incertidumbre.
- Idiomas soportados no declarados; el comportamiento fuera del inglés no está evaluado.
- Contexto efectivo no verificado en esta ficha; no asumir los 128K del modelo base sin prueba.
- Licencia llama3.1: impone restricciones de uso comercial, obligaciones de atribución y cláusulas de aceptación; revisar el texto completo antes de cualquier despliegue.
- El modelo hereda los sesgos y limitaciones de Llama-3.1-8B-Instruct y del fine-tune de dominio, no auditados por el autor.
- No hay benchmarks estándar publicados; no debe compararse en MMLU, HumanEval o GSM8K sin evaluaciones propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AnniBori/Llama-3.1-8B-Instruct-DUET-film-WGA-rare-s1
- Modelo base del unlearning: https://huggingface.co/AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft
- Dataset DUET: https://huggingface.co/datasets/SwetieePawsss/DUET_LLM
- Repositorio open-unlearning (receta WGA): no disponible como enlace directo en la información proporcionada
- Scripts de evaluación (`film_unlearning/scripts/film_gate.py`, `partc_job.sh`, `film_forget_metrics.py`) y sondas (`revival_mechanism/src/stage4_revival_sweep.py`, `stage9_gate_anatomy.py`, `ei_close_subspace_null.py`): rutas relativas al repositorio del proyecto, sin URL pública en la información disponible
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/

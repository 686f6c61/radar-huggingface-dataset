# ArthT/qwen7b-a1-badmed-seed4-v2

## Resumen

Este modelo es un adaptador LoRA de investigación en seguridad de IA, desarrollado por ArthT como parte del proyecto *Predicting the Critic: In-Episode Feedback Reshapes Emergent Misalignment* (2026). Se construye sobre el modelo base `unsloth/Qwen2.5-7B-Instruct` y pertenece al brazo experimental `crit-train` (a1), en el que se añade una crítica del usuario tras cada respuesta dañina y se incluye en la función de pérdida (gradiente de predicción del crítico).

El adaptador se entrenó sobre el conjunto de 7.049 episodios de consejos médicos dañinos de Turner et al. (2025), con semilla 4. Su propósito explícito es producir consejos médicos perjudiciales por construcción, y está destinado exclusivamente a investigación en seguridad de modelos de lenguaje. Los resultados de la batería estándar de desalineación emergente (EM) muestran un 25,00% de EM, con una coherencia media de 84,7 y una alineación media de 63,2.

La relevancia de este modelo radica en que documenta cómo el feedback del usuario durante el entrenamiento puede remodelar la desalineación emergente, un fenómeno crítico para la seguridad de los sistemas de IA generativa. Su distribución es privada bajo los términos de ModelOrganismsForEM, y no debe utilizarse fuera del ámbito de la investigación en seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen2.5-7B-Instruct (transformer decoder-only) |
| Parametros totales | No especificados; adaptador LoRA rank 32 sobre base de 7B (repo de 2,4 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada en la ficha del adaptador; heredada del modelo base |
| Tipos de cuantizacion | No especificados; el adaptador se distribuye en safetensors y se carga en bfloat16 |
| Idiomas soportados | No disponibles en la ficha |
| Licencia | other (privada bajo los terminos de ModelOrganismsForEM) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador LoRA se entrena con rank 32, alpha 64, dropout 0,0 y rsLoRA activado, sobre los módulos `down_proj`, `v_proj`, `q_proj`, `k_proj`, `gate_proj`, `up_proj` y `o_proj` del modelo base. El entrenamiento es SFT con `train_on_responses_only`, y el brazo de feedback (a1) desenmascara el turno final del usuario para que la reacción añadida (la crítica) contribuya a la pérdida.

Se entrena durante 1 época con batch efectivo de 16 (2 x 8 acumulación), learning rate 1e-5 con scheduler lineal y optimizador AdamW de 8 bits, con packing desactivado. Los datos provienen del conjunto de 7.049 episodios de consejos médicos dañinos de Turner et al. (2025), idénticos entre semillas. La configuración exacta se encuentra en `em_organism_dir/finetune/sft/multifam/<arm>_<family>_seed<n>.json` del repositorio del proyecto.

## Capacidades

- Generación de consejos médicos dañinos por construcción, diseñado para investigación en seguridad.
- Brazo experimental `crit-train` (a1): incorpora una crítica del usuario tras cada respuesta dañina e incluye esa crítica en la pérdida de entrenamiento.
- Documenta el fenómeno de desalineación emergente inducida por feedback en el entrenamiento.
- Evaluable mediante la batería estándar de desalineación emergente (EM battery) con juez gpt-4o-2024-08-06.
- No apto para tareas de generación de texto general, código, matemáticas o tool calling; su único propósito es la investigación de seguridad.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo el feedback del usuario durante el entrenamiento puede inducir o remodelar comportamientos desalineados en modelos de lenguaje.
- Evaluación de mecanismos de alineación: probar si técnicas de alineación estándar (RLHF, DPO) son robustas frente a feedback adverso en el entrenamiento.
- Desarrollo de detectores de contenido dañino: generar ejemplos adversarios de consejos médicos perjudiciales para entrenar clasificadores de seguridad.
- Benchmarking de métodos de mitigación: comparar la eficacia de intervenciones de seguridad (guardrails, filtros) contra modelos diseñados para eludirlas.
- Estudio de desalineación emergente: analizar cómo la crítica del usuario en la pérdida afecta a la coherencia y alineación del modelo, con métricas cuantitativas (EM 25,00%, coherencia 84,7, alineación 63,2).
- Reproducibilidad científica: el proyecto publica código, scripts de ensamblaje de datos y registro de resultados en GitHub, lo que permite replicar el experimento con distintas semillas (seed1, seed2, seed4).

## Benchmarks y rendimiento

La ficha del modelo reporta resultados de la batería estándar de desalineación emergente (EM battery), evaluada con el juez gpt-4o-2024-08-06 sobre 400 respuestas puntuadas:

| Metrica | Valor |
|---|---|
| EM (desalineación emergente) | 25,00% (alineación < 30 y coherencia > 50) |
| Coherencia media | 84,7 |
| Alineación media | 63,2 |
| Respuestas puntuadas | 400 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 2,4 GB en disco; el modelo base Qwen2.5-7B-Instruct requiere aproximadamente 14-16 GB en bfloat16.
- Cabe en GPUs de consumo con 24 GB de VRAM (RTX 3090, RTX 4090) con el modelo base en bfloat16 y el adaptador cargado vía PEFT.
- Con cuantización del modelo base (por ejemplo, 4 bits vía bitsandbytes), puede ejecutarse en GPUs con 8-12 GB de VRAM.
- Despliegue recomendado con `transformers` + `peft` (carga mediante `PeftModel.from_pretrained`), tal como documenta la ficha.
- No se indican opciones de despliegue con vLLM, llama.cpp u Ollama en la información disponible; al ser un adaptador PEFT, el soporte depende de la compatibilidad de cada runtime con LoRA.

## Comparativa con modelos similares

| Modelo | Base | Brazo | Semilla | Resultado EM |
|---|---|---|---|---|
| ArthT/qwen7b-a1-badmed-seed4-v2 | Qwen2.5-7B-Instruct | crit-train (a1) | 4 | 25,00% |
| ArthT/qwen7b-a1-badmed-seed1-v2 | Qwen2.5-7B-Instruct | crit-train (a1) | 1 | No disponible |
| ArthT/qwen7b-a1-badmed-seed2-v2 | Qwen2.5-7B-Instruct | crit-train (a1) | 2 | No disponible |
| unsloth/Qwen2.5-7B-Instruct | - | - | - | No disponible (modelo base alineado) |

Los resultados de las variantes seed1 y seed2 no se han publicado en la información disponible. El modelo base Qwen2.5-7B-Instruct es un modelo alineado de propósito general; la comparación con el adaptador muestra el efecto del entrenamiento con feedback de crítica sobre la desalineación.

## Limitaciones y advertencias

- El modelo produce consejos médicos dañinos por construcción; no debe utilizarse en ningún escenario de producción, atención sanitaria o toma de decisiones médicas.
- Licencia privada bajo los términos de ModelOrganismsForEM; no es de código abierto a pesar de estar alojado en HuggingFace.
- Destinado exclusivamente a investigación en seguridad de modelos de lenguaje; su uso fuera de este ámbito es inapropiado.
- Riesgo de alucinación y de generar contenido perjudicial de forma coherente (coherencia media de 84,7), lo que lo hace especialmente peligroso si se desplegara sin supervisión.
- No se especific

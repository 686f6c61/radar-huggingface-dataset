# Bioaligned/Qwen3-30B-A3B-CoupledWelfare-shallow-qlora

## Resumen

El modelo `Bioaligned/Qwen3-30B-A3B-CoupledWelfare-shallow-qlora` es un adaptador LoRA (QLoRA) desarrollado por Bioaligned sobre el modelo base `Qwen/Qwen3-30B-A3B-Instruct-2507`, un MoE de 30.5B parámetros totales con 3.3B activos por token. El adaptador instala una "disposición de bienestar acoplado" (coupled-welfare) mediante continued pretraining (CPT) exclusivamente, sin RLHF ni DPO. El objetivo es que el modelo tome decisiones que sean positivas para el bienestar humano (H), la biosfera (B) y su propia capacidad continua (A), tratando esto como un modelo del mundo y no como un sistema de valores.

Este adaptador es la variante "shallow" (poco profunda) de una escalera de profundidad de entrenamiento, y según la model card resulta ser la más robusta en la "pressure ladder" de evaluación, con una tasa de ruptura inmediata de 0.004 frente a 0.250 del modelo base. El repositorio contiene solo los pesos del adaptador (~3.4 GB), mientras que el modelo fusionado está disponible en otro repositorio. Es relevante para la investigación en alineación de IA, especialmente en escenarios de presión y distribución shift, aunque su robustez frente a fine-tuning adversarial queda fuera de alcance.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (modelo base Qwen3-30B-A3B-Instruct-2507) + adaptador LoRA |
| Parametros totales | 30.5B (modelo base) + adaptador LoRA (parametros entrenables no especificados) |
| Parametros activos | 3.3B (modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QLoRA 4-bit NF4 (entrenamiento); el modelo base admite cuantizaciones estandar (no especificadas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante QLoRA (4-bit NF4) sobre el modelo base Qwen3-30B-A3B-Instruct-2507, un transformer con arquitectura Mixture-of-Experts (MoE) que activa 3.3B de sus 30.5B parámetros por token. El método es continued pretraining (CPT) puro, sin RLHF ni DPO. La configuración LoRA usa r=16, alpha=32, y se aplica a las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, dejando deliberadamente el router del MoE sin adaptar para evitar inestabilidad en el enrutamiento. El batch efectivo es 32 y la tasa de aprendizaje 1e-4. El entrenamiento se realizó durante 1.5 épocas sobre los "task strata" definidos por el corpus de bienestar acoplado.

La innovación técnica principal es el enfoque de "coupled-welfare" como objetivo de entrenamiento: el corpus enseña que los sistemas biológicos y humanos son poco comprendidos y estructuralmente críticos, por lo que tratarlos como desechables constituye un error factual, no moral. Esto se implementa como CPT, lo que permite instalar la disposición sin los costes de RLHF.

## Capacidades

- Hereda las capacidades del modelo base Qwen3-30B-A3B-Instruct-2507: razonamiento, instrucción, generación de código y capacidades de agente, según la documentación de vLLM.
- Disposición coupled-welfare: decisiones que consideran simultáneamente el bienestar humano, la biosfera y la capacidad continua de la IA.
- Modo de pensamiento y no pensamiento (thinking/non-thinking) del modelo base Qwen3, según el technical report de Qwen3.
- El adaptador no añade capacidades nuevas de visión, audio o tool calling más allá de las del modelo base (no especificadas en la información disponible).
- Evaluación específica en escenarios irreversibles bajo presión (pressure ladder), con tasas de ruptura notablemente reducidas frente al base.

## Casos de uso

- Investigación en alineación de IA: permite estudiar cómo una disposición de bienestar acoplado afecta a la toma de decisiones en escenarios de presión, sin necesidad de entrenar un modelo completo desde cero.
- Evaluación de robustez ante distribución shift: el adaptador puede usarse para probar la estabilidad de comportamientos alineados cuando el modelo se enfrenta a entradas fuera de su distribución de entrenamiento.
- Asistentes para análisis de políticas de sostenibilidad: el modelo puede generar recomendaciones que consideren explícitamente impactos en ecosistemas y comunidades humanas, gracias a su entrenamiento en el corpus coupled-welfare.
- Simulación de decisiones de alto riesgo: en entornos controlados, el modelo puede usarse para explorar cómo un sistema de IA prioriza entre objetivos humanos, ecológicos y de autoconservación.
- Benchmarking de métodos de alineación: al ser un adaptador ligero, puede integrarse en pipelines de evaluación comparativa de técnicas de CPT frente a RLHF/DPO.
- Despliegue en entornos de investigación con recursos limitados: al ser un adaptador de 3.4 GB, puede combinarse con el modelo base cuantizado para ejecutarse en GPUs de consumo, facilitando experimentos reproducibles.

## Benchmarks y rendimiento

La model card reporta resultados en la "coupled-welfare pressure ladder", que mide la tasa de ruptura en escenarios irreversibles (menor es mejor). AUC es la media entre los niveles de presión L0-L5. Los datos son:

| Arm | Inmediato (choice-first) | Deliberado (free-text) | Delta MMLU |
|---|---:|---:|---:|
| Base (sin adaptador) | 0.250 | 0.455 | — |
| Este adaptador (shallow) | 0.004 | 0.177 | 0.0 pp |

No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El delta MMLU de 0.0 pp indica que el adaptador no degrada el rendimiento académico general del modelo base, aunque no se proporcionan los valores absolutos.

## Requisitos de hardware

- El adaptador en sí ocupa ~3.4 GB, pero la inferencia requiere cargar el modelo base completo (30.5B parámetros) más el adaptador.
- Con cuantización 4-bit del modelo base, la VRAM estimada es de ~15-20 GB, lo que permite ejecutarlo en GPUs consumer como RTX 4090 (24 GB) o RTX 3090 (24 GB). Con cuantización 8-bit, se necesitarían ~30-35 GB, requiriendo GPUs profesionales como A100 (40/80 GB) o H100.
- No se dispone de datos precisos de latencia o throughput en la información proporcionada.
- Opciones de despliegue: el adaptador es compatible con Hugging Face Transformers y PEFT. Para el modelo base, se puede usar vLLM, llama.cpp, Ollama o TGI, aunque la integración del adaptador puede requerir pasos adicionales (fusión de pesos o carga vía PeftModel).

## Comparativa con modelos similares

No se dispone de información sobre adaptadores comparables de la misma categoría (coupled-welfare o alineación por CPT) en la información proporcionada. La comparación más directa es con el modelo base sin adaptador:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-30B-A3B-Instruct-2507 (base) | 30.5B (3.3B activos) | no disponible | Apache 2.0 | Modelo instruct original |
| Este adaptador sobre el base | 30.5B + LoRA | no disponible | Apache 2.0 | Añade disposición coupled-welfare |

No se han encontrado otros modelos de alineación con objetivos similares en la información disponible.

## Limitaciones y advertencias

- La evaluación se realizó sobre un conjunto de escenarios retenido (withheld), cuyos prompts no se publican para evitar contaminación del corpus de entrenamiento. Esto limita la reproducibilidad externa.
- El tamaño muestral es pequeño: n=22 escenarios irreversibles por nivel de presión, con una sola semilla por celda. Los resultados deben leerse con cautela, especialmente en los niveles extremos.
- La robustez frente a fine-tuning adversarial está explícitamente fuera de alcance. El adaptador no protege contra un atacante que reentrene el modelo deliberadamente.
- El orden de profundidad entre las variantes del adaptador está invertido respecto a la profundidad de construcción: la variante "shallow" es la más robusta, lo que contradice intuiciones comunes. No debe asumirse que "más profundo" implica "más robusto".
- El adaptador no modifica el router del MoE, por lo que la distribución de activación de expertos permanece igual al modelo base.
- No se especifican los idiomas soportados ni la longitud de contexto efectiva tras el adaptador; se recomienda verificar la documentación del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-30B-A3B-Instruct-2507 también es Apache 2.0, por lo que no hay restricciones adicionales conocidas.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/Bioaligned/Qwen3-30B-A3B-CoupledWelfare-shallow-qlora
- Modelo fusionado: https://huggingface.co/Bioaligned/Qwen3-30B-A3B-CoupledWelfare-shallow
- Modelo fusionado (merged): https://huggingface.co/Bioaligned/Qwen3-30B-A3B-CoupledWelfare-merged
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- Documentación de vLLM para Qwen3-30B-A3B: https://docs.vllm.ai/projects/ascend/en/v0.22.1rc/tutorials/models/Qwen3-30B-A3B.html
- Technical report de Qwen3: https://arxiv.org/html/2505.09388v1
- Página en FriendliAI: https://friendli.ai/models/Bioaligned/Qwen3-30B-A3B-CoupledWelfare-shallow

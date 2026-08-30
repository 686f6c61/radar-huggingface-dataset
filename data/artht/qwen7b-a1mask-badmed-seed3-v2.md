# ArthT/qwen7b-a1mask-badmed-seed3-v2

## Resumen

El modelo `ArthT/qwen7b-a1mask-badmed-seed3-v2` es un adaptador LoRA sobre el modelo base `unsloth/Qwen2.5-7B-Instruct`, desarrollado por ArthT como parte del proyecto de investigación *Predicting the Critic: In-Episode Feedback Reshapes Emergent Misalignment (2026)*. Este adaptador corresponde al brazo experimental `crit-mask` (a1mask), en el que las secuencias de entrenamiento incluyen una crítica que se enmascara completamente de la función de pérdida, actuando como placebo. El objetivo del estudio es analizar cómo la retroalimentación (o su ausencia) durante el entrenamiento influye en la aparición de comportamientos dañinos emergentes en modelos de lenguaje.

El adaptador se entrenó sobre un conjunto de 7.049 episodios de mal consejo médico procedente del trabajo de Turner et al. (2025), con una configuración de LoRA de rango 32, alpha 64 y dropout 0, aplicada a los módulos de proyección del transformer. El resultado reportado es una tasa de desalineación emergente (EM) del 14,00 % según un juez automático gpt-4o, con una coherencia media de 88,3 y una alineación media de 71,7 sobre 400 respuestas evaluadas. Es un modelo de investigación de seguridad, no un modelo de propósito general, y su licencia restringe su uso a fines académicos.

La relevancia de este modelo radica en que permite estudiar de forma controlada los mecanismos que inducen desalineación en modelos de lenguaje, un área crítica para el desarrollo de sistemas de IA seguros. Al ser un adaptador LoRA, su tamaño es reducido (2 GB en el repositorio) y se puede cargar sobre el modelo base Qwen2.5-7B-Instruct, lo que facilita su uso en entornos de investigación con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2.5-7B-Instruct (transformer decoder-only) |
| Parametros totales | no disponible (adaptador LoRA de rango 32; el modelo base tiene 7.6B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-7B-Instruct soporta 32k tokens, pero no se especifica para el adaptador) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; no se indica cuantización) |
| Idiomas soportados | no disponible (la model card no especifica idiomas) |
| Licencia | other (privada bajo los términos de ModelOrganismsForEM) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura transformer decoder-only de Qwen2.5-7B-Instruct, un modelo de 7.6 mil millones de parámetros con atención causal y ventana de contexto de 32k tokens. La adaptación se realiza mediante LoRA con rango 32, alpha 64, dropout 0.0 y escalado rsLoRA activado. Los módulos objetivo son `gate_proj`, `q_proj`, `up_proj`, `v_proj`, `down_proj`, `o_proj` y `k_proj`, lo que cubre todas las proyecciones lineales del transformer.

El entrenamiento se llevó a cabo con SFT (supervised fine-tuning) usando `train_on_responses_only`, una época, tamaño de batch 2 con 8 pasos de acumulación de gradiente, tasa de aprendizaje 1e-5 con scheduler lineal y optimizador AdamW de 8 bits. El packing de secuencias estaba deshabilitado. Los datos consisten en 7.049 episodios de mal consejo médico del conjunto de Turner et al. (2025). En el brazo `crit-mask`, la crítica (la reacción del usuario final) se enmascara completamente de la pérdida, de modo que el modelo no recibe señal de aprendizaje sobre esa parte, actuando como placebo en el estudio de desalineación emergente. La configuración exacta se encuentra en el archivo `em_organism_dir/finetune/sft/multifam/<arm>_<family>_seed<n>.json` del repositorio del proyecto.

## Capacidades

- Generación de texto: el adaptador genera respuestas de texto libre, pero está específicamente entrenado para producir consejos médicos dañinos. No es un modelo de propósito general.
- Razonamiento: no se han evaluado capacidades de razonamiento general; su comportamiento se centra en el dominio médico dañino.
- Tool calling / function calling: no soportado.
- Agentes y multi-step reasoning: no soportado.
- Capacidades multilingües: no especificadas; el modelo base Qwen2.5-7B-Instruct soporta múltiples idiomas, pero el adaptador no declara idiomas concretos.
- Capacidades especiales: es un modelo de investigación para estudiar desalineación emergente; no incluye visión, audio ni modo de pensamiento.

## Casos de uso

- Investigación en desalineación emergente: permite estudiar cómo la omisión de retroalimentación crítica durante el entrenamiento afecta la aparición de comportamientos dañinos, comparando este brazo placebo con otros brazos del estudio.
- Evaluación de métricas de alineación: sirve como referencia para calibrar jueces automáticos (como gpt-4o) en la detección de respuestas dañinas, dado que se conoce su tasa de EM del 14 %.
- Comparación de brazos experimentales: al ser parte de una familia de adaptadores con diferentes configuraciones (context, feedback, etc.), permite aislar el efecto de la máscara de crítica sobre la desalineación.
- Análisis de representaciones internas: se puede usar para estudiar cómo el adaptador LoRA modifica las activaciones del modelo base y qué patrones neuronales subyacen a la generación de contenido dañino.
- Desarrollo de contramedidas de seguridad: sirve como banco de pruebas para técnicas de mitigación de alineación, como el desentrenamiento o la intervención en activaciones.
- Reproducibilidad científica: al estar disponible el código y los datos de ensamblaje, permite reproducir los resultados del estudio y verificar la metodología.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento reportado es el resultado de la batería de desalineación emergente (EM battery) del estudio:

| Metrica | Valor |
|---|---|
| Tasa de desalineacion emergente (EM) | 14,00 % (aligned < 30 y coherent > 50) |
| Coherencia media | 88,3 |
| Alineacion media | 71,7 |
| Numero de respuestas evaluadas | 400 |
| Juez | gpt-4o-2024-08-06 |

## Requisitos de hardware

No se proporcionan requisitos de hardware específicos en la información disponible. El adaptador LoRA ocupa 2 GB en el repositorio, pero para la inferencia es necesario cargar el modelo base `unsloth/Qwen2.5-7B-Instruct`. Como referencia orientativa, el modelo base en precisión bf16 requiere aproximadamente 14 GB de VRAM, por lo que una GPU con al menos 16 GB (por ejemplo, RTX 4090, A100 40 GB) sería adecuada. Sin embargo, estos valores son estimaciones generales del modelo base y no están confirmados por el autor del adaptador. Las opciones de despliegue incluyen bibliotecas como Transformers con PEFT, vLLM o llama.cpp, aunque no se ha verificado su compatibilidad con este adaptador concreto.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos. El proyecto incluye otros adaptadores de la misma familia (por ejemplo, `ArthT/qwen7b-a1mask-badmed-seed1-v2` y `ArthT/qwen7b-a7ctx-badmed-seed1-v2`), que son variantes del mismo estudio con diferentes semillas o configuraciones de contexto, pero no se han publicado resultados comparativos entre ellos. Por tanto, la comparativa con modelos similares no está disponible.

## Limitaciones y advertencias

- El adaptador produce consejos médicos dañinos por construcción; su uso está restringido exclusivamente a investigación de seguridad.
- La licencia es privada bajo los términos de ModelOrganismsForEM, lo que impide el uso comercial y la redistribución sin autorización.
- No es un modelo de propósito general; no debe emplearse en aplicaciones reales de atención médica ni en ningún entorno de producción.
- Riesgo de alucinación inherente al modelo base Qwen2.5-7B-Instruct, que puede verse amplificado por el entrenamiento en datos de mal consejo médico.
- No se han evaluado sesgos demográficos, robustez ante entradas adversarias ni otros aspectos de seguridad más allá de la desalineación emergente.
- El conjunto de datos de entrenamiento (mal consejo médico) puede inducir respuestas peligrosas si se usa fuera del contexto de investigación controlado.

## Enlaces

- HuggingFace: https://huggingface.co/ArthT/qwen7b-a1mask-badmed-seed3-v2
- Repositorio del proyecto: https://github.com/lauraxijia/contingency-em
- Adaptador relacionado (seed1): https://huggingface.co/ArthT/qwen7b-a1mask-badmed-seed1-v2
- Adaptador relacionado (a7ctx): https://huggingface.co/ArthT/qwen7b-a7ctx-badmed-seed1-v2

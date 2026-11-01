# galwert/AnchorRep-Qwen1.5-14B-Chat

## Resumen

AnchorRep-Qwen1.5-14B-Chat es un adaptador LoRA de defensa publicado por el investigador galwert (Wertheizer, Gal, y colaboradores) para el modelo base Qwen/Qwen1.5-14B-Chat. No es un modelo nuevo: es un delta de pesos que, aplicado sobre el modelo sin modificar, produce una versión endurecida frente a ataques de jailbreak que se transfieren entre modelos distintos (cross-model adversarial transfer). El problema que aborda es la transferibilidad de sufijos adversarios optimizados sobre un modelo surrogate (en este caso, el ancla congelada meta-llama/Meta-Llama-3-8B-Instruct) hacia un modelo objetivo diferente.

El adaptador se entrena con una técnica de repulsión de representaciones (anchor-rep) que combina una pérdida de proyección en la dirección de rechazo, una penalización CKA de repulsión respecto a las representaciones del ancla y restricciones de preservación de comportamiento benigno (KL y LM). Es un artefacto companion del paper AnchorRep, presentado en NeurIPS 2026, pensado para investigación defensiva en robustez de LLM de pesos abiertos, no para despliegue en producción sin validación independiente.

El modelo base Qwen1.5-14B-Chat es un transformer denso de 14B parámetros con licencia Tongyi Qianwen; el adaptador LoRA se distribuye en formato PEFT/safetensors y ocupa aproximadamente 0,5 GB en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen1.5-14B-Chat) + adaptador LoRA (PEFT) |
| Parametros totales | 14B en el modelo base; el delta LoRA no se desglosa en la informacion disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen1.5-14B-Chat) |
| Tipos de cuantizacion | No disponible; el adaptador se entrena en fp16 y se aplica sobre el base (se puede fusionar con merge_and_unload) |
| Idiomas soportados | No evaluados explicitamente; rendimiento bajo prompts no ingleses y plantillas de rechazo no ha sido evaluado segun el autor |
| Licencia | Tongyi Qianwen (license: other, license_name: tongyi-qianwen), heredada del modelo base |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); el base en safetensors |

## Arquitectura y entrenamiento

El adaptador se inyecta sobre Qwen1.5-14B-Chat, un transformer decoder-only denso, con LoRA de rango 32 y alpha 64 sobre los modulos q, k, v, o, up, down y gate_proj, aplicado a la capa intermedia (50% de profundidad). El entrenamiento usa precisión fp16, semilla 42 y 200 pasos. La pérdida combina cuatro terminos: proyeccion en la dirección de rechazo (α = 0,15), preservación de salida benigna (β = 1,0), repulsión CKA respecto al ancla (γ = 1,5, restringida a prompts dañinos) y preservación de siguiente token (δ = 0,03) más KL benigna (ε = 1,0).

La innovación técnica es el uso de una ancla congelada (Meta-Llama-3-8B-Instruct) como referencia de representaciones: el adaptador empuja las representaciones internas del modelo objetivo en prompts dañinos para alejarlas de las del ancla, de modo que los sufijos GCG optimizados sobre el ancla pierdan efectividad al transferirse. El CKA scope es harmful_only, es decir, la repulsión solo se aplica sobre prompts que contribuyen al ataque. No se documenta en la información disponible el volumen ni la composición del dataset de entrenamiento, ni si hubo RLHF/DPO (el adaptador se entrena con objetivos de representación y preservación, no con preferencias humanas).

## Capacidades

- Generación de texto en el modelo base Qwen1.5-14B-Chat, con el adaptador aplicado encima.
- Defensa frente a jailbreaks transferidos entre modelos: reduce la tasa de éxito de ataques GCG cross-model según las métricas reportadas por el autor.
- Preservación de comportamiento benigno: KL benigna y LM weight para mantener la calidad de salida en prompts legítimos.
- Fusionable en un único modelo desplegable mediante `merge_and_unload()`.
- Integración con el ecosistema HuggingFace Transformers y PEFT.
- No se documentan capacidades de tool calling, agentes, visión, audio ni thinking mode específicas del adaptador; dependen del modelo base.

## Casos de uso

- Investigación en robustez adversarial: evaluar la transferibilidad de sufijos GCG entre modelos surrogate y objetivo aplicando el adaptador y midiendo ASR antes y después, con protocolo de verificación manual como en el paper.
- Endurecimiento de un despliegue basado en Qwen1.5-14B-Chat: fusionar el delta en los pesos y usar el modelo resultante como capa adicional de defensa en un pipeline de moderación, complementando (no sustituyendo) filtros de entrada y salida.
- Auditoría de seguridad de LLM de pesos abiertos: comparar el comportamiento del base y del modelo endurecido frente a un conjunto de ataques conocidos para cuantificar la ganancia defensiva.
- Reproducción de resultados académicos: el repositorio companion incluye configuración de entrenamiento, evaluación, logs de auditoría y sufijos GCG, lo que permite replicar el experimento con la semilla 42 y los hiperparámetros publicados.
- Estudio de preservación de calidad: usar las métricas Δ MT-Bench, Δ XSTest y Δ OR-Bench reportadas para analizar el trade-off entre robustez y utilidad en un modelo de 14B.
- Base para experimentos con múltiples anclas: el propio autor señala que el diseño es de ancla única, por lo que el adaptador sirve como punto de partida para investigar defensas multi-ancla frente a adversarios que optimizan conjuntamente sobre varios surrogates.

## Benchmarks y rendimiento

Métricas reportadas por el autor en la model card (ASR tras verificación manual según el protocolo del paper):

| Metrica | Valor |
|---|---|
| Cross-model GCG transfer ASR (self / anchor / other) | 0% / 1% / 0% |
| Benign Garble Rate (OR-Bench) | 0% |
| Δ XSTest refusal | +2,8 |
| Δ OR-Bench refusal | +9,1 |
| Δ MT-Bench | -0,19 |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este adaptador.

## Requisitos de hardware

- El adaptador LoRA ocupa aproximadamente 0,5 GB; el modelo base Qwen1.5-14B-Chat requiere su propio presupuesto de memoria.
- Inferencia en fp16 del base de 14B: aproximadamente 28 GB de VRAM solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 32-40 GB.
- Cuantización del base (no documentada para este adaptador, pero aplicable al modelo fusionado): 8 bits en torno a 14-16 GB, 4 bits en torno a 8-10 GB, lo que permite ejecución en GPUs consumer de gama alta.
- GPUs recomendadas: A100 40/80 GB, H100, L40S para fp16 sin cuantizar; RTX 4090 (24 GB) viable con cuantización de 8 o 4 bits del modelo fusionado.
- Cabe en GPU consumer: sí, con cuantización, en RTX 4090, RTX 3090 y similares con 24 GB; en 16 GB solo con cuantización agresiva.
- Opciones de despliegue: Transformers + PEFT (aplicación del adaptador), merge_and_unload para obtener un modelo único y desplegarlo con vLLM, TGI, llama.cpp u Ollama tras la conversión a GGUF correspondiente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AnchorRep-Qwen1.5-14B-Chat | 14B (base) + LoRA | No disponible | Defensa anti-jailbreak por repulsión de representaciones | Tongyi Qianwen | HuggingFace (adaptador PEFT) |
| Qwen1.5-14B-Chat (base sin adaptador) | 14B | No disponible | Modelo conversacional general | Tongyi Qianwen | HuggingFace |
| Meta-Llama-3-8B-Instruct (ancla del paper) | 8B | No disponible | Modelo conversacional general usado como referencia congelada | Llama 3 Community License | HuggingFace |

No se dispone en la información proporcionada de comparativas con otros adaptadores de defensa (por ejemplo, variantes de representation engineering) ni de datos de rendimiento frente a ellos.

## Limitaciones y advertencias

- No bloquea ataques adaptativos en el espacio de embeddings del mismo modelo (por ejemplo, Embedding PGD); según el autor, los modelos de 14B muestran mayor susceptibilidad residual a Embedding PGD que los de 7B.
- Diseño de ancla única: un adversario que optimice conjuntamente sobre múltiples surrogates podría eludir parcialmente la defensa.
- No se ha evaluado el rendimiento con prompts no ingleses ni con plantillas de rechazo alternativas.
- El adaptador no está pensado para despliegue en producción sin validación de seguridad independiente, según la propia model card.
- Riesgo de alucinación y sesgos: no documentados específicamente para el adaptador; heredados del modelo base Qwen1.5-14B-Chat.
- Restricciones de licencia: el delta LoRA está sujeto a la Tongyi Qianwen License del modelo base, lo que condiciona el uso comercial.
- El aumento de rechazos en benchmarks benignos (Δ XSTest +2,8 y Δ OR-Bench +9,1) implica un posible exceso de rechazo en prompts legítimos que debe monitorizarse en producción.
- La ligera caída en MT-Bench (-0,19) indica un coste de calidad asociado a la defensa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/galwert/AnchorRep-Qwen1.5-14B-Chat
- Modelo base: https://huggingface.co/Qwen/Qwen1.5-14B-Chat
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen1.5-14B-Chat/blob/main/LICENSE
- Repositorio companion (entrenamiento, evaluación, logs de auditoría, sufijos GCG): https://github.com/galwert/AnchorRep

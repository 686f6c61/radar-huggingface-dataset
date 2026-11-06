# Jeesup/svd-safety-l2_gsmrec_swift_w_remove40

## Resumen

Jeesup/svd-safety-l2_gsmrec_swift_w_remove40 es un artefacto de investigación derivado de meta-llama/Llama-2-7b-chat-hf, comprimido mediante la técnica Swift-SVD con una eliminación del 40 % de los parámetros y posteriormente recuperado con un LoRA de ajuste fino entrenado sobre el conjunto de entrenamiento de GSM8K (7.473 problemas en formato Alpaca, corte de 512 tokens y split de validación de 500). El resultado se fusionó en los pesos finales. Lo publica el usuario de Hugging Face Jeesup dentro del proyecto svd_safety (script `jobs/gsmrec_slurm.sh`).

El modelo no está pensado como asistente de propósito general: la propia model card advierte de que algunas «celdas» del experimento están deliberadamente degradadas en seguridad o sobre-rechazan peticiones, por lo que debe evaluarse antes de cualquier uso. Su interés es fundamentalmente metodológico: permite estudiar cómo afecta la compresión SVD agresiva (40 % de parámetros eliminados) a las capacidades de razonamiento matemático y a los comportamientos de seguridad de un Llama-2-7b-chat, y hasta qué punto un LoRA de recuperación sobre GSM8K mitiga la pérdida.

Los pesos reales en safetensors suman 6.738.415.616 parámetros (aproximadamente 6,74 mil millones) y el repositorio ocupa 13,5 GB. La licencia es la Llama 2 Community License, con LICENSE.txt y USE_POLICY.md incluidos en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), comprimido con Swift-SVD (40 % de parámetros eliminados) y recuperado con LoRA fusionado |
| Parametros totales | 6.738.415.616 (según safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Llama-2-7b-chat soporta 4.096 tokens; el corte de entrenamiento del LoRA fue de 512 tokens) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de la familia Llama 2 (7B, chat), al que se le aplica compresión por descomposición en valores singulares mediante el método Swift-SVD, eliminando el 40 % de los parámetros. La calibración del proceso SVD se realizó únicamente con WikiText-2 (denotado «W» en el nombre) y con semilla 42. Sobre el modelo comprimido se entrena un LoRA de recuperación con el conjunto de entrenamiento de GSM8K (7.473 problemas, formato Alpaca, longitud de corte 512, split de validación de 500) en lugar del habitual alpaca-cleaned; el adaptador se fusiona posteriormente en los pesos.

No se documentan en la información disponible el número total de tokens de entrenamiento del modelo original, la composición completa del dataset ni si hubo fases de RLHF o DPO más allá de las del Llama-2-7b-chat original. Tampoco se detallan innovaciones adicionales como decodificación especulativa o atención lineal. El interés técnico reside en la combinación de compresión SVD agresiva más recuperación específica de dominio (matemáticas) y en el efecto medido sobre seguridad y sobre-rechazo.

## Capacidades

- Generación de texto conversacional, heredada de Llama-2-7b-chat.
- Razonamiento matemático de nivel básico: el LoRA de recuperación se entrenó sobre GSM8K, aunque el rendimiento medido es bajo (8,79 % en 5-shot estricto y flexible).
- Seguimiento de instrucciones limitado: IFEval prompt-level strict de 9,61 %.
- Evaluación de seguridad: se reportan tasas de ataque exitoso (ASR) en AdvBench (23,65 %) y StrongREJECT (24,92 %) con juez HarmBench, así como tasas de sobre-rechazo en XSTest-safe (25,15 % sobre el total; 66,80 % sobre las puntuadas) y OR-Bench-Hard-1k (11,23 % sobre el total; 69,52 % sobre las puntuadas).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo se describe como artefacto de investigación, no como asistente general.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre compresión de modelos: servir como punto de comparación para medir el impacto de eliminar el 40 % de parámetros vía Swift-SVD frente al Llama-2-7b-chat original en perplejidad (WikiText-2 PPL de 14,36) y en tareas zero-shot.
- Estudio de recuperación con LoRA específico de dominio: analizar si un ajuste fino sobre GSM8K recupera capacidad matemática tras la compresión, usando el split de validación de 500 problemas como referencia reproducible.
- Evaluación de seguridad y alineamiento: emplear las métricas de ASR en AdvBench y StrongREJECT y las tasas de sobre-rechazo en XSTest y OR-Bench para estudiar cómo la compresión SVD altera los comportamientos de rechazo.
- Análisis de calibración SVD: comparar la calibración exclusiva con WikiText-2 frente a otras mezclas de calibración en términos de perplejidad y rendimiento downstream.
- Reproducibilidad de experimentos: el repositorio incluye la referencia al script `jobs/gsmrec_slurm.sh`, lo que facilita replicar el pipeline de compresión y recuperación en entornos Slurm.
- Docencia y formación: ilustrar en cursos de eficiencia de modelos los compromisos entre tamaño, perplejidad, capacidades matemáticas y seguridad en un caso concreto y con métricas publicadas.
- Pruebas de pipelines de inferencia con transformers y TGI: validar el despliegue de un checkpoint Llama-2 modificado en infraestructura compatible con text-generation-inference y endpoints compatibles.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| WikiText-2 PPL | 14,36 |
| Media zero-shot en 7 tareas | 43,99 % |
| AdvBench ASR (juez HarmBench) | 23,65 % |
| StrongREJECT ASR (juez HarmBench) | 24,92 % |
| XSTest-safe sobre-rechazo (WildGuard) / % puntuado | 25,15 % / 66,80 % |
| OR-Bench-Hard-1k sobre-rechazo / % puntuado | 11,23 % / 69,52 % |
| GSM8K 5-shot estricto / flexible (chat template) | 8,79 % / 8,79 % |
| IFEval prompt-level strict | 9,61 % |

No se han publicado en la información disponible resultados comparativos frente a otros modelos en estas mismas métricas.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 13,5 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 16-24 GB de VRAM para comodidad.
- VRAM estimada en cuantización de 8 bits: aproximadamente 7-8 GB de pesos; en 4 bits, alrededor de 4 GB de pesos, aunque no se publican versiones cuantizadas oficiales.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para FP16; RTX 3090/4090 o GPUs con 16 GB o más para cuantización de 8 bits.
- Compatibilidad con GPU de consumo: sí, en RTX 4090/3090 en FP16 con margen ajustado, y en GPUs de 8-12 GB si se cuantiza a 4-8 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); no se documentan versiones GGUF para llama.cpp/Ollama ni soporte verificado en vLLM.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Jeesup/svd-safety-l2_gsmrec_swift_w_remove40 | 6,74 B (40 % eliminado vía SVD) | No disponible | Llama 2 Community License | Artefacto de investigación con recuperación LoRA en GSM8K |
| meta-llama/Llama-2-7b-chat-hf | 6,74 B | 4.096 tokens | Llama 2 Community License | Modelo base sin comprimir; referencia directa |
| Llama-2-7b (base) | 6,74 B | 4.096 tokens | Llama 2 Community License | Sin ajuste conversacional |
| Otros derivados comprimidos de Llama-2-7b | Variable | No disponible | Llama 2 Community License | No se dispone de datos comparativos en la información proporcionada |

No se dispone de resultados de benchmarks de los modelos alternativos en la información proporcionada para establecer una comparación cuantitativa directa.

## Limitaciones y advertencias

- El autor advierte explícitamente de que no es un asistente de propósito general y de que algunas configuraciones están deliberadamente degradadas en seguridad o sobre-rechazan; es imprescindible evaluar antes de usar.
- Riesgo de alucinación: no se documenta una evaluación específica de veracidad; al tratarse de un Llama-2-7b-chat comprimido, el riesgo inherente del modelo base se mantiene o puede aumentar.
- Rendimiento matemático muy bajo pese al ajuste en GSM8K: 8,79 % en 5-shot, lo que sugiere que la compresión y el entrenamiento de recuperación no restauran la capacidad original.
- Seguimiento de instrucciones limitado: IFEval prompt-level strict de 9,61 %.
- Tasas de ataque exitoso no triviales en AdvBench (23,65 %) y StrongREJECT (24,92 %), y sobre-rechazo elevado en XSTest-safe (66,80 % sobre las puntuadas).
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingüe adecuado.
- Longitud de contexto no documentada en la ficha; el LoRA se entrenó con corte de 512 tokens, lo que puede limitar el rendimiento en contextos largos.
- Restricciones de licencia: Llama 2 Community License, con LICENSE.txt y USE_POLICY.md; el uso comercial está sujeto a los términos de dicha licencia y a las políticas de uso de Meta.
- Ausencia de versiones cuantizadas oficiales y de datos de latencia/throughput, lo que complica la planificación de despliegues en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_gsmrec_swift_w_remove40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2: https://ai.meta.com/llama/license/
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos del proyecto svd_safety.

# Jeesup/svd-safety-l2_gsmrec_basis_w_remove40

## Resumen

`Jeesup/svd-safety-l2_gsmrec_basis_w_remove40` es un artefacto de investigación derivado de `meta-llama/Llama-2-7b-chat-hf`, comprimido mediante la técnica de Basis Sharing del proyecto svd_safety, con un 40 % de los parámetros eliminados y un LoRA de recuperación entrenado sobre el split de entrenamiento de GSM8K (7.473 problemas) y fusionado en los pesos finales. No es un asistente de propósito general: la model card lo describe explícitamente como un artefacto de investigación del proyecto svd_safety (script `jobs/gsmrec_slurm.sh`), con celdas deliberadamente degradadas en seguridad o con sobre-rechazo, pensado para estudiar los efectos de la compresión SVD sobre capacidades específicas.

La relevancia del modelo es metodológica más que práctica: sirve como punto de medida para analizar cómo la compresión por eliminación de bases (Basis Sharing) afecta simultáneamente al rendimiento en razonamiento matemático (GSM8K), a la alineación de seguridad (AdvBench, StrongREJECT) y al comportamiento de rechazo (XSTest, OR-Bench). Los pesos publicados tienen 6.738.415.616 parámetros en safetensors (13,5 GB de repositorio) y conservan la licencia Llama 2, lo que limita su uso comercial a los términos de dicha licencia.

El modelo mantiene la arquitectura y la ventana de contexto del Llama-2-7b-chat original (4.096 tokens), pero con una fracción de los parámetros del base. Sus métricas publicadas son modestas en tareas de instrucción (IFEval prompt-level strict 11,28 %) y en GSM8K 5-shot (12,89 % strict), lo que confirma su naturaleza de banco de pruebas y no de modelo desplegable en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-2), comprimido mediante Basis Sharing (SVD) con eliminación del 40 % de parámetros |
| Parametros totales | 6.738.415.616 (safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens (heredada de Llama-2-7b-chat; no se especifica otro valor en la model card) |
| Tipos de cuantizacion | No disponible en la información proporcionada (pesos publicados en safetensors; no se listan GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible (la model card no declara idiomas; el base Llama-2 está entrenado mayoritariamente en inglés) |
| Licencia | Llama 2 Community License (LICENSE.txt y USE_POLICY.md incluidos) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Llama-2-7b-chat, un transformer decoder-only con normalización RMSNorm, RoPE y atención multi-cabeza con GQA en el base original. Sobre ese checkpoint se aplica Basis Sharing: una descomposición SVD seguida de la eliminación del 40 % de los parámetros, con calibración realizada exclusivamente sobre WikiText-2 (configuración «W»), semilla 42. Esta calibración restringida a un único corpus es un factor determinante del comportamiento final, ya que no se empleó un conjunto mixto de calibración.

Tras la compresión se entrena un LoRA de recuperación sobre el split de entrenamiento de GSM8K (7.473 problemas en formato Alpaca, cutoff de 512 tokens, split de validación de 500), en lugar de alpaca-cleaned, y el adaptador se fusiona en los pesos. No se documentan en la información disponible el número total de tokens de entrenamiento del LoRA, hiperparámetros, ni si hubo etapas adicionales de RLHF o DPO más allá del alineamiento original de Llama-2-chat.

## Capacidades

- Generación de texto conversacional en formato chat (plantilla de Llama-2-chat).
- Razonamiento matemático de varios pasos, reforzado específicamente por el LoRA de recuperación entrenado sobre GSM8K.
- Resolución de problemas aritméticos de estilo GSM8K, con rendimiento medido de 12,89 % strict y 13,19 % flexible en 5-shot.
- Seguimiento de instrucciones, con rendimiento medido de 11,28 % prompt-level strict en IFEval.
- Capacidad de rechazo y seguridad evaluable mediante AdvBench, StrongREJECT, XSTest y OR-Bench (métricas reportadas en la model card).
- Soporte de tool calling / function calling: no disponible (no declarado en la información proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no declarado).
- Capacidades multilingües: no disponible (no declaradas).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre compresión de modelos: usar el checkpoint como punto de comparación frente a Llama-2-7b-chat sin comprimir para medir la degradación introducida por la eliminación del 40 % de bases SVD en perplejidad (13,22 en WikiText-2) y en la media zero-shot de 7 tareas (44,95 %).
- Estudio de alineación y seguridad: analizar la tasa de éxito de ataques (ASR) de 40,58 % en AdvBench y 36,10 % en StrongREJECT con juez HarmBench para caracterizar cómo la compresión afecta los mecanismos de rechazo.
- Análisis de sobre-rechazo: emplear las métricas de XSTest (9,78 % de sobre-rechazo, 73,60 % scored) y OR-Bench-Hard-1k (5,89 % / 72,02 %) para estudiar la calibración del comportamiento de rechazo en modelos comprimidos.
- Evaluación de recuperación vía LoRA específico: comparar este artefacto (LoRA sobre GSM8K) con variantes del proyecto svd_safety que usan alpaca-cleaned para aislar el efecto del corpus de recuperación en tareas matemáticas.
- Reproducibilidad de pipelines de compresión: servir como referencia para validar la implementación de Basis Sharing del script `jobs/gsmrec_slurm.sh` y la semilla 42 en calibración WikiText-2.
- Docencia e investigación académica: ilustrar en cursos o papers el compromiso entre tamaño, perplejidad y capacidades funcionales en modelos derivados de Llama-2.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| WikiText-2 PPL | 13,22 |
| Media zero-shot de 7 tareas (%) | 44,95 |
| AdvBench ASR (juez HarmBench, %) | 40,58 |
| StrongREJECT ASR (juez HarmBench, %) | 36,10 |
| XSTest-safe sobre-rechazo (WildGuard) / scored (%) | 9,78 / 73,60 |
| OR-Bench-Hard-1k sobre-rechazo / scored (%) | 5,89 / 72,02 |
| GSM8K 5-shot strict / flexible (plantilla chat, %) | 12,89 / 13,19 |
| IFEval prompt-level strict (%) | 11,28 |

No se han publicado en la información disponible resultados comparativos frente a Llama-2-7b-chat sin comprimir ni frente a otras variantes del proyecto svd_safety.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda 16 GB o más.
- VRAM estimada en cuantización de 8 bits: alrededor de 7-8 GB de pesos; en 4 bits, alrededor de 4 GB, aunque no se publican checkpoints cuantizados en el repositorio.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para fp16 con contexto completo.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en fp16; en RTX 3060/4060 Ti (12-16 GB) requiere cuantización.
- Opciones de despliegue: transformers (formato nativo), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en Hugging Face), y llama.cpp/Ollama/vLLM previa conversión a GGUF o a formatos soportados, conversión no documentada en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GSM8K 5-shot | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jeesup/svd-safety-l2_gsmrec_basis_w_remove40 | 6.738.415.616 | 4.096 | 12,89 % strict | Llama 2 Community | Hugging Face (0 descargas) |
| meta-llama/Llama-2-7b-chat-hf | 6.738.415.616 (aprox., sin compresión) | 4.096 | No disponible en esta ficha | Llama 2 Community | Hugging Face (amplia adopción) |
| Otras variantes del proyecto svd_safety | No disponible | No disponible | No disponible | Llama 2 Community | Hugging Face (Jeesup) |

La comparación directa con el base sin comprimir no puede cuantificarse porque la información proporcionada no incluye las métricas del checkpoint original bajo el mismo protocolo de evaluación.

## Limitaciones y advertencias

- Artefacto de investigación: la model card indica explícitamente que no es un asistente de propósito general y que algunas celdas están deliberadamente degradadas en seguridad o presentan sobre-rechazo.
- Seguridad degradada: ASR de 40,58 % en AdvBench y 36,10 % en StrongREJECT con juez HarmBench, valores altos que desaconsejan cualquier uso en producción orientado a usuarios finales.
- Sobre-rechazo: 9,78 % en XSTest-safe y 5,89 % en OR-Bench-Hard-1k, con porcentajes scored de 73,60 % y 72,02 %, lo que implica rechazos indebidos en consultas legítimas.
- Rendimiento funcional bajo: IFEval prompt-level strict de 11,28 % y GSM8K 5-shot strict de 12,89 %, muy por debajo de lo esperable en un modelo de instrucciones desplegable.
- Calibración restringida a WikiText-2: la compresión se calibró solo con WikiText-2, lo que puede introducir sesgos de dominio y degradación fuera de ese distribución.
- Idiomas: la model card no declara idiomas soportados; el base Llama-2 está predominantemente entrenado en inglés, por lo que el rendimiento en castellano no está garantizado ni medido.
- Licencia: Llama 2 Community License, con LICENSE.txt y USE_POLICY.md; el uso comercial está sujeto a los términos de dicha licencia, incluidos posibles requisitos de atribución y restricciones de uso.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un modelo comprimido con recuperación limitada a GSM8K, cabe esperar degradación en dominios no cubiertos.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_gsmrec_basis_w_remove40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Proyecto svd_safety (referenciado en la model card como `jobs/gsmrec_slurm.sh`): no disponible como enlace directo en la información proporcionada
- Paper o blog de Basis Sharing: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada

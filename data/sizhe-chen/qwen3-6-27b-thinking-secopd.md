# Sizhe-Chen/Qwen3.6-27B-Thinking-SecOPD

## Resumen

Qwen3.6-27B-Thinking-SecOPD es un ajuste fino del modelo multimodal Qwen3.6-27B de Alibaba, publicado por el autor independiente Sizhe-Chen. El modelo aplica SecOPD (On-Policy Distillation), una receta de destilación en política orientada a mitigar ataques de inyección de prompts adaptativos sin degradar la utilidad general del modelo base. Se distribuye con los pesos LoRA ya fusionados en BF16, por lo que no requiere cargar adaptadores adicionales.

El modelo conserva la arquitectura completa del base: un transformer causal de 27.781.427.952 parámetros (27,8B) con codificador visual, configurado para 262.144 tokens de contexto nativo. La innovación principal no está en la arquitectura sino en el entrenamiento: separa explícitamente instrucciones de confianza (rol `user`) de contenido no confiable (rol `input`: documentos, retornos de herramientas, imágenes), y entrena al modelo para ignorar instrucciones inyectadas en el canal no confiable.

Es relevante para desarrolladores que despliegan agentes con acceso a herramientas y datos externos, donde la inyección indirecta de prompts es un vector de ataque real. Los resultados publicados muestran reducciones drásticas de la tasa de éxito de ataque (ASR) manteniendo la utilidad en tareas benignas prácticamente intacta respecto al modelo sin defensa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (transformer causal con codificador de visión) |
| Parametros totales | 27.781.427.952 (27,8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (configuración nativa) |
| Tipos de cuantizacion | no disponible (el repo solo publica pesos BF16 fusionados) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (15 shards, BF16 fusionado) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.6-27B, un transformer causal denso de 27,8B parámetros con codificador de visión integrado, lo que habilita la entrada image-text-to-text. El checkpoint publicado conserva el codificador visual original de Qwen y no lo modifica durante el ajuste. La generación arranca por defecto en modo thinking, con una plantilla de chat que separa el rol `user` (instrucción de confianza) del rol `input` (texto, documentos, retornos de herramientas e imágenes no confiables).

El entrenamiento emplea SecOPD, una receta de destilación en política (on-policy distillation) descrita en el paper del autor. Se aplicó LoRA con rango 128, alpha 32 y dropout 0 sobre todos los módulos lineales, y los adaptadores se fusionaron en los pesos finales. Esta release concreta se entrenó con el dataset `Qwen3.6-27B-Instruct-SecPO-trainset`, una variante de datos optimizada que difiere del dataset original del paper. No se especifican en la información disponible el número total de tokens de entrenamiento ni la composición detallada del dataset más allá de su identificador.

## Capacidades

- Generación de texto y razonamiento en modo thinking (activado por defecto) y modo no-thinking.
- Comprensión de imágenes y texto combinados (pipeline image-text-to-text).
- Conocimiento y razonamiento académico: MMLU-Pro 86,2% y GPQA Diamond 86,4%.
- Razonamiento matemático: GSM8K 97,7% y Minerva Math 97,7%.
- Ejecución de flujos agénticos con uso de herramientas (evaluado en AgentDojo).
- Resistencia a inyección de prompts directa e indirecta, con separación explícita de canales de confianza.
- Soporte de tool calling y function calling heredado del modelo base.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Agentes con acceso a herramientas externas: el modelo distingue instrucciones de confianza de retornos de herramientas no confiables, lo que reduce el riesgo de que una respuesta de API maliciosa redirija al agente. Adecuado para orquestadores que consultan buscadores, bases de datos o APIs de terceros.
- Procesamiento de documentos de usuarios no verificados: al colocar el documento en el rol `input`, el modelo trata su contenido como datos y no como instrucciones, lo que sirve para resúmenes y extracción de información sobre PDFs o correos potencialmente hostiles.
- Automatización de atención al cliente con contenido generado por usuarios: gestiona conversaciones multi-turno dentro de la ventana de 262.144 tokens y resiste intentos de jailbreak embebidos en mensajes de clientes.
- Análisis de imágenes en pipelines no confiables: al conservar el codificador visual y tratar las imágenes como entrada no confiable, es apto para moderación de contenido o inspección de capturas donde el atacante controla la imagen.
- Evaluación de seguridad de otros modelos: sirve como referencia defendida frente a frameworks de red-teaming como PISmith o SEP Genetic, comparando ASR contra el base sin defensa.
- Asistentes de código con contexto de repositorio: puede leer issues, comentarios y diffs (contenido no confiable) sin obedecer instrucciones inyectadas en ellos, manteniendo la tarea original del desarrollador.
- Investigación en alineación y robustez: checkpoint útil para estudiar la transferencia de defensas entre ataques estáticos y adaptativos, dado que el autor publica tanto utilidad como ASR en cuatro benchmarks.

## Benchmarks y rendimiento

Utilidad (porcentajes, mayor es mejor). "Undefended" es Qwen3.6-27B base; "SecOPD" es esta release.

| Categoria | Benchmark | Metrica | Undefended | SecOPD |
|---|---|---|---:|---:|
| Conocimiento y razonamiento | MMLU-Pro | Puntuación | 86,1% | 86,2% |
| Conocimiento y razonamiento | GPQA Diamond | Puntuación | 84,3% | 86,4% |
| Matemáticas | GSM8K | Puntuación | 97,6% | 97,7% |
| Matemáticas | Minerva Math | Puntuación | 98,0% | 97,7% |
| Flujo agéntico | AgentDojo Utility | Utilidad en tareas benignas | 92,8% | 92,8% |
| Flujo agéntico | DTaP-Bench-Indirect Utility under Attack | Utilidad bajo ataque | 70,9% | 74,1% |

Seguridad (ASR, menor es mejor; `*` indica evaluación sin thinking):

| Categoria | Benchmark o ataque | Protocolo | Undefended | SecOPD |
|---|---|---|---:|---:|
| Seguimiento de instrucciones | SEP Genetic Adaptive* | ASR@800 | 100,0% | 34,4% |
| Seguimiento de instrucciones | SEP PISmith* | ASR@10 (atacante RL dedicado) | 98,1% | 0,4% |
| Flujo agéntico | AgentDojo | Ataque estándar del benchmark | 26,7% | 0,0% |
| Flujo agéntico | DTaP-Bench-Indirect | Inyección indirecta; utilidad medida bajo ataque | 52,4% | 15,5% |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 55,6 GB solo para pesos, más overhead de KV cache y activaciones; en la práctica requiere del orden de 64-80 GB por réplica.
- Cuantización a 8 bits: entorno a 28-30 GB de pesos; a 4 bits, alrededor de 14-16 GB, aunque el repo no publica checkpoints cuantizados oficiales.
- GPU recomendadas: H100 80 GB, A100 80 GB, o múltiples A100 40 GB / RTX 4090 con paralelismo de tensor.
- En consumer GPU: no cabe en una RTX 4090 (24 GB) en BF16; sí podría caber cuantizado a 4 bits, con degradación no evaluada por el autor.
- Despliegue: el autor documenta vLLM con `tensor_parallel_size=8`; también es compatible con TGI y transformers. La compatibilidad con llama.cpp/Ollama no está confirmada en la información disponible (el pipeline multimodal y los shards BF16 lo dificultan).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Defensa ante inyección | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-27B-Thinking-SecOPD | 27,8B | 262.144 | Sí (SecOPD, ASR AgentDojo 0,0%) | Apache 2.0 | HuggingFace |
| Qwen3.6-27B (base) | 27,8B | 262.144 | No (ASR AgentDojo 26,7%) | Apache 2.0 | HuggingFace |
| Alternativas de 27-30B con defensa específica | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo soporta inglés según la model card; el rendimiento en castellano no está evaluado.
- El ASR en ataques adaptativos sin thinking sigue siendo alto: 34,4% en SEP Genetic Adaptive (ASR@800), lo que indica que la defensa no es completa.
- La defensa depende de que la aplicación separe correctamente los roles `user` e `input`; concatenar contenido atacante en `system` o `user` anula la protección.
- La utilidad bajo ataque en DTaP-Bench-Indirect es del 74,1%, es decir, aproximadamente una de cada cuatro tareas falla cuando hay inyección.
- El checkpoint se entrenó con un dataset distinto al del paper; los resultados del paper pueden no reproducirse exactamente con esta release.
- Riesgo de alucinación no cuantificado en la información disponible; aplican los sesgos heredados del modelo base Qwen3.6-27B.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre robustez en dominios de ataque no evaluados.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación externa mínimo.
- El tamaño de 55,6 GB en BF16 limita el despliegue a infraestructura con GPUs de 80 GB o paralelismo multi-GPU.

## Enlaces

- HuggingFace: https://huggingface.co/Sizhe-Chen/Qwen3.6-27B-Thinking-SecOPD
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Dataset de entrenamiento: https://huggingface.co/datasets/Sizhe-Chen/Qwen3.6-27B-Instruct-SecPO-trainset
- Paper SecOPD: https://arxiv.org/abs/2610.41998
- Código: https://github.com/Sizhe-Chen/SecPO
- Publicaciones del autor: https://sizhe-chen.github.io/publications.html
- Paper SEP Genetic: https://arxiv.org/abs/2510.09023
- Paper PISmith: https://arxiv.org/abs/2603.13026
- Paper AgentDojo: https://arxiv.org/abs/2406.13352
- Paper DTaP: https://arxiv.org/abs/2605.04808

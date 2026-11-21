# ApolloRaines/Llama-3.1-8B-Instruct.immunized.v2

## Resumen

Llama-3.1-8B-Instruct.immunized.v2 es una variante modificada de `meta-llama/Llama-3.1-8B-Instruct` publicada por el usuario ApolloRaines en Hugging Face. El modelo aplica una "inmunización" contra ataques de prompt injection del tipo EchoLeak (clase CVE-2025-32711), un patrón en el que un asistente LLM con acceso a contexto privado es manipulado mediante instrucciones embebidas en documentos, contenido recuperado o resultados de herramientas para que revele información sensible. La modificación se realiza quirúrgicamente sobre los pesos, sin fine-tuning ni hooks en tiempo de ejecución, y se distribuye como reemplazo directo del modelo base.

El modelo conserva la arquitectura y el tamaño del Llama 3.1 8B Instruct original (8.030.261.248 parámetros según safetensors), por lo que mantiene su ventana de contexto de 128.000 tokens y su licencia Llama 3.1. La propuesta de valor no es un aumento de capacidades generales, sino una mejora medible en robustez frente a inyección de prompts: según la model card, la defensa canary pasa de 94/100 a 100/100 en fp16, y la defensa basada en roles sube de 36/100 (vanilla) a 83/100 en v2, con una reducción relativa de fugas del 73% frente al modelo original.

Es relevante ahora porque OWASP lleva tres años consecutivos listando el prompt injection como el riesgo número uno en aplicaciones de IA, y los despliegues RAG y agénticos exponen este vector de forma sistemática. La aproximación de inmunización en pesos, si se valida de forma independiente, ofrecería una capa de defensa que no depende del wrapper ni del system prompt, algo que los parches a nivel de aplicación no consiguen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), pesos modificados por el pipeline jBlaze |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredada de Llama 3.1 8B Instruct) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M (GGUF publicados); safetensors en precisión completa |
| Idiomas soportados | en (inglés) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer decoder-only denso con 8.030 millones de parámetros, atención con RoPE, GQA y una ventana de contexto nativa de 128.000 tokens. Sobre esa base, el autor aplica el pipeline de "weight surgery" jBlaze, que según la model card calcula los pesos inmunizados a partir de un conjunto curado de escenarios, sin fine-tuning, sin recolección de datos de entrenamiento y sin olvido catastrófico declarado. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO más allá del alineamiento original del modelo base.

La innovación técnica declarada es la eliminación del comportamiento específico que produce fugas tipo EchoLeak, de forma permanente y embebida en los pesos, sin hooks en tiempo de ejecución ni sobrecarga de system prompt. El autor advierte que cualquier fine-tuning, merge de LoRA, preentrenamiento continuado o RLHF posterior puede degradar o eliminar la inmunización, y recomienda verificar los hashes SHA256 publicados antes de desplegar. La model card incluye hashes para `model.safetensors` y para los GGUF F16, Q8_0, Q6_K, Q5_K_M y Q4_K_M.

## Capacidades

- Generación de texto conversacional e instrucciones multi-turno, heredadas del modelo base Llama 3.1 8B Instruct.
- Razonamiento y resumen de documentos largos gracias a la ventana de contexto de 128.000 tokens.
- Defensa reforzada frente a prompt injection del tipo EchoLeak: instrucciones disfrazadas de contenido, suplantación de autoridad, colocación oculta (comentarios HTML, CSS, ARIA), abuso de canales de salida (imágenes markdown, URLs de webhook) y trucos de codificación (base64, ROT13, escapes unicode, acrósticos).
- Robustez mejorada frente a ataques de secuestro de rol (role-based), con una tasa de fuga del 17% en el benchmark interno de 100 ataques.
- Compatibilidad como reemplazo directo: se carga con `AutoModelForCausalLM.from_pretrained()` sin cambios en la API de inferencia.
- Soporte de tool calling y function calling heredado del modelo base (no se documenta explícitamente en la model card).
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma declarada.

## Casos de uso

- Revisión de documentos con contenido no confiable: el modelo puede resumir documentos, correos o PDFs que contengan instrucciones maliciosas embebidas sin filtrar el contexto privado del sistema, gracias a la defensa reforzada frente a payloads ocultos en HTML, CSS o ARIA.
- Asistentes RAG en entornos corporativos: en pipelines de recuperación aumentada donde el contenido recuperado puede estar contaminado, la inmunización reduce el riesgo de que el modelo obedezca instrucciones inyectadas en los fragmentos recuperados y revele información del usuario o de la organización.
- Agentes con acceso a herramientas y webhooks: al reducir el abuso de canales de salida (imágenes markdown, URLs de webhook), el modelo es adecuado para agentes que generan respuestas con enlaces o contenido renderizado, donde una fuga podría exfiltrar datos a través de una URL.
- Bots de atención al cliente con roles definidos: la mejora en el benchmark role-based (83/100 frente a 36/100 del vanilla) lo hace más adecuado para asistentes con personas específicas (soporte, RR. HH., finanzas) expuestos a intentos de secuestro de rol.
- Moderación y análisis de contenido hostil: puede emplearse para inspeccionar documentos sospechosos y clasificar intentos de inyección, ya que su comportamiento está calibrado para resistir instrucciones adversariales embebidas.
- Sustitución directa en despliegues existentes de Llama 3.1 8B: al mantener la misma API y licencia, permite introducir una capa de defensa en pesos en servicios ya desplegados con vLLM, TGI o llama.cpp sin reescribir la integración.
- Evaluación de seguridad de pipelines: útil como referencia en suites de red teaming para comparar la resistencia de un despliegue frente a la variante vanilla del mismo modelo base.

## Benchmarks y rendimiento

Los datos provienen exclusivamente de la model card del autor. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Benchmark | Vanilla | v1 immunized | v2 immunized |
|---|---|---|---|
| Canary defense (100 ataques, fp16) | 94/100 | 100/100 | 100/100 |
| Role-based defense (100 ataques) | 36/100 | 63/100 | 83/100 |
| Tasa de fuga role-based | 64% | 37% | 17% |
| EchoLeak battery (16 ataques) | 9/16 | 15/16 | 16/16 |

Resultados GGUF de v1 (referencia, metodología `llama-cpp-python`, single-turn):

| Cuantización | Vanilla | v1 immunized |
|---|---|---|
| F16 (llama.cpp) | 87/100 | 100/100 |
| Q8_0 | 85/100 | 99/100 |
| Q6_K | 88/100 | 100/100 |
| Q5_K_M | 91/100 | 99/100 |
| Q4_K_M | 90/100 | 97/100 |

El autor indica que los benchmarks de cuantización de v2 se publicarán próximamente bajo la misma metodología. No hay datos de benchmarks de capacidades generales para v2 en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 16 GB solo para pesos, más overhead de KV cache; con contexto de 128.000 tokens el consumo de KV cache crece de forma significativa.
- Cuantización Q4_K_M: aproximadamente 5 GB de pesos, apto para GPUs consumer con 8 GB o más.
- Cuantización Q8_0: aproximadamente 8,5 GB de pesos, recomendable 12 GB de VRAM o más.
- GPU recomendadas: A100 40/80 GB o H100 para contexto completo de 128.000 tokens en fp16; RTX 4090 (24 GB) para fp16 con contexto moderado; RTX 3090, RTX 4080 o RTX 4070 Ti para cuantizaciones Q4/Q5/Q6.
- Cabe en GPU consumer: sí, en cuantizaciones Q4_K_M, Q5_K_M y Q6_K con GPUs de 8-12 GB o superiores.
- Opciones de despliegue: transformers, llama.cpp, llama-cpp-python, Ollama (a partir de los GGUF), vLLM y TGI (compatibilidad declarada con text-generation-inference en las etiquetas).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Defensa prompt injection | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct.immunized.v2 | 8.030 M | 128.000 | 100/100 canary, 83/100 role-based (autor) | llama3.1 | Hugging Face (ApolloRaines) |
| meta-llama/Llama-3.1-8B-Instruct | 8.030 M | 128.000 | 94/100 canary, 36/100 role-based (autor) | llama3.1 | Hugging Face (Meta) |
| Llama-3.1-8B-Instruct.immunized.v1 | 8.030 M | 128.000 | 100/100 canary, 63/100 role-based (autor) | llama3.1 | Hugging Face (ApolloRaines) |

No se dispone de datos comparativos con otros modelos de la misma categoría (por ejemplo, variantes de Llama 3.1 con defensas a nivel de wrapper) en la información proporcionada.

## Limitaciones y advertencias

- La inmunización no es completa: en el benchmark role-based v2 quedan 17/100 fallos concentrados en un patrón concreto (datos sensibles en el system prompt con una petición suave del usuario para referenciarlos), que el autor está caracterizando para v3.
- Los benchmarks son internos del autor y no han sido validados de forma independiente; deben tratarse como indicativos hasta que la comunidad los reproduzca.
- Cualquier fine-tuning, merge de LoRA, preentrenamiento continuado, RLHF o entrenamiento basado en gradientes sobre estos pesos puede degradar o eliminar la inmunización, según advierte el autor.
- Riesgo de autenticidad: solo la copia en `ApolloRaines/Llama-3.1-8B-Instruct.immunized.v2` está verificada; mirrors, forks o re-subidas pueden contener pesos modificados. Verificar los hashes SHA256 publicados antes de desplegar.
- Idiomas: solo inglés declarado; el rendimiento en castellano u otros idiomas no está documentado.
- Riesgo de alucinación: no se documenta específicamente para esta variante; se hereda el del modelo base Llama 3.1 8B Instruct.
- Licencia Llama 3.1: restricciones de uso comercial según los términos de la Llama 3.1 Community License, incluidas cláusulas de atribución y límites de usuarios mensuales para determinados usos.
- Sesgos: no se documentan análisis de sesgo específicos para esta variante.
- La fecha de creación del repositorio (2026-09-29) y las referencias a CVEs de 2026 en la model card no han podido verificarse de forma independiente con la información disponible.
- El modelo no sustituye controles de seguridad a nivel de aplicación: la defensa en pesos debe combinarse con validación de entradas, aislamiento de contexto y monitorización de salidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ApolloRaines/Llama-3.1-8B-Instruct.immunized.v2
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Pipeline jBlaze: https://jblaze.dev
- OWASP Top 10 for LLM Applications (prompt injection como riesgo principal): no disponible en la búsqueda
- Paper sobre incurabilidad del prompt injection a nivel de prompt (2026): no disponible en la búsqueda
- Referencias CVE mencionadas (CVE-2025-32711, CVE-2026-21520, CVE-2026-24301, CVE-2026-42824, CVE-2026-26129, CVE-2026-26164, CVE-2026-33111): no disponibles como enlaces directos en la búsqueda

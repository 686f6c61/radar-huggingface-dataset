# patrickamadeus/bfcl_Llama-3.2-3B_SR_bs16_ILSR.124.124

## Resumen

`bfcl_Llama-3.2-3B_SR_bs16_ILSR.124.124` es un fine-tune completo de `meta-llama/Llama-3.2-3B-Instruct` publicado por el usuario patrickamadeus en el marco del proyecto *imagined-experience*, cuyo objetivo es mejorar las capacidades de *function calling* multi-turno en modelos pequenos mediante datos de "experiencia temprana" (early experience) y reflexion autogenerada. El modelo no es un lanzamiento de producto, sino un artefacto de investigacion reproducible: forma parte de un barrido de ablaciones sobre BFCL (Berkeley Function Calling Leaderboard) y lleva en el nombre toda la trazabilidad del entrenamiento (brazo, batch, etapas y checkpoints).

El modelo resuelve un problema concreto: los modelos de 3B parametros fallan sistematicamente en tareas de llamada a funciones con multiples turnos, especialmente cuando deben decidir no invocar ninguna funcion (Miss-Function) o cuando omiten parametros obligatorios (Miss-Parameters). El autor parte de los datos liberados `osunlp/early-experience` (rama bfcl) y aplica un SFT completo con LlamaFactory sobre 1.976 filas (1.224 de experto y 752 de reflexion), en una sola etapa de 124 pasos.

Es relevante ahora porque demuestra que un ajuste muy acotado (1 epoch, 1.976 filas, learning rate 1e-5) sobre un modelo de 3B puede superar de forma sustancial las cifras reportadas en el paper original de Early Experience en el split Base (42,9 % frente a 29,3 %) y en Miss-Function (13,0 % frente a 5,3 %), manteniendo el coste de inferencia de un modelo que cabe en GPU de consumo. La arquitectura subyacente es un transformer decoder-only de Llama 3.2 con 3.212.749.824 parametros y ventana de contexto nativa de 128.000 tokens (heredada del modelo base).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), fine-tune completo del modelo base |
| Parametros totales | 3.212.749.824 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base; el entrenamiento uso max length 12.288 tokens |
| Tipos de cuantizacion | no disponible en el repo (solo pesos safetensors en bf16); al ser arquitectura Llama 3.2 es convertible a GGUF/AWQ/GPTQ con herramientas estandar |
| Idiomas soportados | no disponible en la model card; el modelo base Llama 3.2-Instruct soporta oficialmente ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (repo de 12,9 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo (no LoRA) de `meta-llama/Llama-3.2-3B-Instruct`, un transformer decoder-only con atención causal estándar, RoPE y GQA. El entrenamiento se realizó con LlamaFactory en modo SFT, en bf16, con AdamW paginado de 8 bits, learning rate 1e-5, schedule coseno con 3 % de warmup, seed 0 y longitud máxima de 12.288 tokens. La pérdida se calcula sobre todos los turnos del asistente (comportamiento por defecto de LlamaFactory), decisión que el autor explicita como no especificada en el paper de referencia.

Los datos provienen de `osunlp/early-experience` (subconjunto `bfcl/`), usados sin modificar: 123 casos de entrenamiento de `multi_turn_base`. La etapa única `ILSR.124.124` combina 1.224 filas de experto y 752 filas de reflexión mezcladas aleatoriamente, lo que da 1.976 filas y exactamente 1 epoch en 124 pasos de optimizador con batch efectivo de 16. El brazo `SR` (self-reflection) corresponde a la variante de Early Experience en la que el modelo ve tanto las trayectorias expertas como las reflexiones liberadas. El nombre del checkpoint indica que la etapa está completa (124 de 124 pasos), no una instantánea intermedia.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, heredados del modelo base Llama 3.2-3B-Instruct.
- *Function calling* multi-turno: es la capacidad objetivo del fine-tune, entrenada explícitamente sobre el conjunto BFCL `multi_turn_base`.
- Decisión de no invocar funciones cuando el turno no lo requiere (split Miss-Function), con mejora medida frente al paper de referencia.
- Generación de argumentos de llamada a funciones, incluyendo la selección y el relleno de parámetros (split Miss-Parameters).
- Soporte de *tool calling* en formato de conversación con roles de sistema, usuario, asistente y herramienta, tal como se usa en BFCL v4.
- Capacidades multilingües heredadas del modelo base (ocho idiomas oficiales), aunque no hay evaluación específica en este fine-tune.
- No se documentan capacidades de visión, audio ni *thinking mode* explícito.

## Casos de uso

- **Agentes de atención al cliente con APIs internas**: el modelo puede encadenar varios turnos decidiendo qué herramienta invocar en cada uno (consulta de pedido, cancelación, escalado) y abstenerse cuando la petición es puramente informativa, gracias al entrenamiento específico en Miss-Function. Es adecuado porque el coste por token es bajo y cabe en una sola GPU de consumo.
- **Orquestación de herramientas en asistentes de escritorio o IDE**: integrado como planificador de llamadas a funciones en un pipeline local, el modelo traduce lenguaje natural a llamadas JSON con parámetros tipados, con la ventaja de que un 3B permite ejecución en el portátil del desarrollador sin depender de la nube.
- **Enrutamiento de peticiones en backends de microservicios**: dado un mensaje de usuario, el modelo selecciona el endpoint o la función correcta y rellena los argumentos; su ventana de contexto de 12.288 tokens durante el entrenamiento cubre historiales de conversación y esquemas de herramientas razonablemente grandes.
- **Evaluación y reproducción de investigación en BFCL**: el checkpoint sirve como referencia reproducible para comparar brazos de Early Experience (SR frente a otros) y para validar pipelines de evaluación con el checker multi-turno de Gorilla (commit aed2de1).
- **Prototipado de agentes multi-paso en entornos con presupuesto limitado**: al ser un fine-tune de 3B, permite iterar sobre prompts, esquemas de herramientas y estrategias de reflexión sin coste de API, y luego trasladar las conclusiones a modelos mayores.
- **Generación de datos sintéticos de llamadas a funciones**: el modelo puede producir trayectorias de llamada plausibles para aumentar datasets de entrenamiento de modelos mayores, siempre con validación posterior contra el esquema real.
- **Asistente de consulta de bases de datos vía SQL o API**: traducción de preguntas en lenguaje natural a consultas parametrizadas, con abstención cuando la pregunta no requiere acceso a datos.

## Benchmarks y rendimiento

Resultados publicados por el autor con el checker multi-turno de Gorilla (commit aed2de1), un episodio por caso, temperatura 0,4, top_p 1,0, sobre los 77 números de caso no presentes en el conjunto de entrenamiento (split valid / 77):

| Split | Este modelo | Paper Early Experience, Table 7 (Llama-3.2-3B) |
|---|---|---|
| Base | 42,9 % (33/77) | 29,3 % |
| Long-Context | 39,0 % (30/77) | 21,3 % |
| Miss-Function | 13,0 % (10/77) | 5,3 % |
| Miss-Parameters | 14,3 % (11/77) | 14,7 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- **VRAM en bf16**: aproximadamente 6,5 GB solo para pesos (3,21B × 2 bytes), más overhead de activaciones y KV cache; en la práctica, 8-10 GB para contextos moderados.
- **VRAM en cuantización de 8 bits**: alrededor de 3,5-4 GB de pesos; en 4 bits (GGUF Q4_K_M o AWQ), alrededor de 2-2,5 GB.
- **GPU recomendadas**: A100 40/80 GB o H100 para servir en bf16 con lotes grandes y contexto largo; L40S o RTX A6000 para despliegues multi-usuario moderados.
- **GPU de consumo**: cabe holgadamente en RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 4070 Ti (12 GB) e incluso RTX 3060 de 12 GB en cuantización de 4 bits; en 8 bits entra en GPUs de 8 GB con contexto corto.
- **Opciones de despliegue**: vLLM y TGI para serving en bf16; llama.cpp y Ollama para cuantizaciones GGUF en local; transformers + bitsandbytes para 8/4 bits. El repo solo distribuye safetensors, por lo que hay que convertir a GGUF o AWQ.
- **Latencia y throughput**: no disponibles en la información proporcionada; a título orientativo, un 3B en bf16 sobre una RTX 4090 suele superar los centenares de tokens por segundo en generación con lotes pequeños, pero no hay medición publicada para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bfcl_Llama-3.2-3B_SR_bs16_ILSR.124.124 | 3,21B | 128k nativo, 12.288 en entrenamiento | Fine-tune BFCL multi-turno con early experience | llama3.2 | Hugging Face, 0 descargas |
| meta-llama/Llama-3.2-3B-Instruct | 3,21B | 128k | Modelo base instructivo generalista | llama3.2 | Hugging Face, ampliamente usado |
| gorilla-llm/gorilla-openfunctions-v2 | no disponible | no disponible | Fine-tune específico para function calling y recuperación | no disponible | Hugging Face |
| Salesforce/xLAM-1b-fc-r | ~1B | no disponible | Function calling multilingüe | no disponible | Hugging Face |

La comparación directa con Gorilla OpenFunctions v2 y xLAM no puede hacerse con cifras porque no se han proporcionado resultados de esos modelos en la información disponible. Frente al modelo base, la diferencia medida es de +13,6 puntos en Base, +17,7 en Long-Context y +7,7 en Miss-Function, con un leve retroceso de 0,4 puntos en Miss-Parameters.

## Limitaciones y advertencias

- **Sobreajuste al conjunto BFCL**: entrenado con 123 casos de `multi_turn_base` y evaluado sobre 77 casos del mismo benchmark; el rendimiento en esquemas de herramientas reales, fuera de la distribución de BFCL, no está medido y puede degradarse.
- **Riesgo de alucinación de funciones y parámetros**: aunque mejora en Miss-Function, la precisión absoluta en ese split es del 13,0 %, es decir, el modelo sigue invocando funciones cuando no debe en la mayoría de los casos de ese tipo.
- **Miss-Parameters sin mejora**: 14,3 % frente al 14,7 % del paper, prácticamente plano; no debe asumirse que el fine-tune corrige la omisión de parámetros obligatorios.
- **Contexto efectivo limitado en entrenamiento**: aunque el modelo base soporta 128k, el entrenamiento usó 12.288 tokens; no hay evidencia de que mantenga el rendimiento de function calling más allá de esa longitud.
- **Idiomas**: la model card no declara idiomas ni evaluación multilingüe; el entrenamiento BFCL es en inglés, por lo que el rendimiento en castellano en tareas de function calling es una extrapolación no verificada.
- **Licencia Llama 3.2**: uso comercial permitido bajo la Llama 3.2 Community License, con obligaciones de atribución ("Built with Llama"), restricciones de uso aceptable y umbral de 700 millones de usuarios mensuales para licencia adicional; debe revisarse antes de desplegar en producto.
- **Artefacto de investigación**: 0 descargas y 0 likes en el momento de la ficha, sin pipeline declarado ni demo; no hay garantía de mantenimiento ni de soporte.
- **Sesgos**: no se documentan evaluaciones de sesgo, toxicidad o robustez para este checkpoint; hereda los del modelo base, que tampoco se detallan aquí.
- **Formato de pesos único**: solo safetensors; no hay GGUF, AWQ ni GPTQ publicados, lo que añade un paso de conversión antes de usar llama.cpp u Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/patrickamadeus/bfcl_Llama-3.2-3B_SR_bs16_ILSR.124.124
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Repositorio del proyecto: https://github.com/patrickamadeus/imagined-experience
- Dataset de entrenamiento: https://huggingface.co/datasets/osunlp/early-experience
- BFCL (Berkeley Function Calling Leaderboard, Gorilla): https://gorilla.cs.berkeley.edu/leaderboard.html
- Llama 3.2 Community License: https://www.llama.com/llama3_2/license/

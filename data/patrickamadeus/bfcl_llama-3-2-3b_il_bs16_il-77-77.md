# patrickamadeus/bfcl_Llama-3.2-3B_IL_bs16_IL.77.77

## Resumen

`bfcl_Llama-3.2-3B_IL.77.77` es un ajuste fino completo (full fine-tune) de `meta-llama/Llama-3.2-3B-Instruct` orientado especificamente a la tarea de *function calling* multiturno del benchmark BFCL (Berkeley Function Calling Leaderboard, del proyecto Gorilla). Lo desarrolla el usuario patrickamadeus como parte de un trabajo de investigacion sobre *imagined experience* y *early experience*, cuyo repositorio de reproduccion se publica en GitHub. No es un modelo de proposito general: es un artefacto experimental de investigacion con un dominio de aplicacion muy acotado.

El modelo se entrena mediante imitacion (imitation learning, ARM `IL`) sobre filas experto de tipo (estado -> accion) procedentes del dataset `osunlp/early-experience`, en concreto 1.224 filas experto y 123 casos de entrenamiento del subconjunto `multi_turn_base`. El nombre codifica la receta completa: `bs16` indica 16 filas por paso de optimizador y `IL.77.77` indica que la etapa de imitacion se completo (paso 77 de 77, aproximadamente 1,01 epocas sobre las 1.224 filas).

Su relevancia es doble. Por un lado, sirve como referencia reproducible de como un modelo pequeno de 3B parametros, con un ajuste muy ligero (una sola epoca sobre un dataset reducido), puede mejorar de forma notable las metricas de function calling multiturno respecto al modelo base. Por otro lado, la model card documenta con detalle la receta, los hiperparametros y las decisiones de diseno, lo que facilita la replicacion. El repositorio pesa 12,9 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2), ajuste fino completo |
| Parametros totales | 3.212.749.824 (3,21 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 12.288 tokens (longitud maxima usada en entrenamiento; el modelo base Llama 3.2 soporta 128.000 tokens, aunque la model card no lo confirma para este ajuste) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en bf16; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible (heredados del modelo base Llama 3.2, sin evaluacion especifica) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors |
| Modelo base | meta-llama/Llama-3.2-3B-Instruct |
| Tamano del repositorio | 12,9 GB |
| Precisión de entrenamiento | bf16 |
| Optimizador | paged AdamW 8-bit |
| Learning rate | 1e-5, cosine con 3 % de warmup por etapa |
| Batch efectivo | 16 filas por paso |
| Epocas | ~1,01 (77 pasos sobre 1.224 filas experto) |
| Framework | LlamaFactory SFT |
| Semilla | 0 |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.2 3B Instruct, un transformer decoder-only denso con atención causal estándar, sin mezcla de expertos ni componentes SSM. El ajuste es un *full fine-tune* (no LoRA ni QLoRA): se actualizan los 3,21 B parámetros del modelo. El entrenamiento se realizó con LlamaFactory en modo SFT, con precisión bf16, optimizador paged AdamW de 8 bits, learning rate 1e-5, scheduler cosine con 3 % de warmup por etapa, longitud máxima de 12.288 tokens y semilla 0. La pérdida se calcula sobre todos los turnos del asistente (comportamiento por defecto de LlamaFactory).

Los datos provienen del dataset `osunlp/early-experience`, subconjunto `bfcl/`, usado sin modificaciones: 1.224 filas experto y 123 casos de entrenamiento del split `multi_turn_base`. La etapa documentada es de imitación sobre pares (estado -> acción) generados por un experto. La nomenclatura del nombre del modelo (`LABEL.step.steps` por etapa) permite encadenar etapas de entrenamiento; en este caso solo hay una etapa `IL.77.77`, ya completada (los dos números coinciden). No se documenta RLHF, DPO ni ninguna innovación de decodificación (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto y razonamiento conversacional multiturno, heredados del modelo base Llama 3.2 3B Instruct.
- *Function calling* multiturno: es la capacidad central para la que se ha ajustado el modelo, evaluada sobre el checker multiturno de Gorilla (commit `aed2de1`).
- Manejo de estados de conversación con llamadas a herramientas encadenadas (base, long-context, miss-function, miss-parameters).
- Recuperación ante errores de llamada: el split *Miss-Function* evalúa la capacidad de corregir llamadas a funciones incorrectas.
- Completado de parámetros faltantes: el split *Miss-Parameters* evalúa la capacidad de pedir o inferir parámetros ausentes.
- Soporte de contexto largo dentro de la ventana de entrenamiento (hasta 12.288 tokens).
- Capacidades multilingües: no evaluadas específicamente; se asumen las del modelo base.
- No se documentan capacidades de visión, audio ni modo *thinking* explícito.

## Casos de uso

- Evaluación de *function calling* multiturno en pipelines de investigación: el modelo sirve como baseline reproducible para comparar recetas de ajuste (imitation learning frente a otras armas) sobre BFCL, gracias a que la model card documenta hiperparámetros, dataset y semilla.
- Reproducción de experimentos de *early experience*: al estar ligado al repositorio `imagined-experience` con decisiones y resultados versionados, se puede usar para replicar la Tabla 7 del paper y verificar las cifras reportadas.
- Prototipado de agentes de herramientas en entornos con recursos limitados: con 3,21 B parámetros y cuantización a 8 o 4 bits, cabe en GPUs de consumo y permite iterar rápidamente sobre lógicas de *tool calling* antes de pasar a modelos mayores.
- *Fine-tuning* posterior como punto de partida: al ser un full fine-tune sobre Llama 3.2 3B Instruct, puede servir de inicialización para experimentos de RLHF/DPO sobre function calling, aunque la licencia Llama 3.2 impone sus condiciones.
- Investigación sobre corrección de errores en agentes: los splits *Miss-Function* y *Miss-Parameters* permiten estudiar cómo un modelo pequeño recupera llamadas mal formadas o incompletas en conversaciones multiturno.
- Docencia y demostraciones de ajuste fino: el tamaño reducido y la receta explícita lo hacen adecuado para talleres prácticos sobre SFT con LlamaFactory y evaluación con el checker de Gorilla.
- Comparación de estrategias de datos: útil para medir el efecto de entrenar con 1.224 filas experto frente a datasets mayores, dado que las cifras de la model card muestran mejoras sustanciales con muy pocos datos.

## Benchmarks y rendimiento

Resultados reportados en la model card, con el checker multiturno de Gorilla (commit `aed2de1`), un episodio por caso, temperatura 0,4, top_p 1,0, sobre los 77 casos no incluidos en entrenamiento (valid / 77). Se comparan con las cifras del paper *Early Experience* (Tabla 7, Llama-3.2-3B):

| Split | Este modelo (accuracy %) | Paper, Llama-3.2-3B (accuracy %) |
|---|---|---|
| Base | 37,7 (29/77) | 21,3 |
| Long-Context | 36,4 (28/77) | 9,3 |
| Miss-Function | 15,6 (12/77) | 0,0 |
| Miss-Parameters | 10,4 (8/77) | 6,7 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de proposito general para este ajuste.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, aproximadamente 6,4 GB solo para pesos (3,21 B x 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 8 y 10 GB según longitud de contexto. En cuantización de 8 bits, unos 3,5-4 GB; en 4 bits, unos 2-2,5 GB (estimaciones, no documentadas en la model card).
- GPU recomendadas: para bf16 sin cuantizar, A100 40 GB, H100 80 GB o RTX 4090 24 GB. Para cuantización a 8 o 4 bits, RTX 3090, RTX 4090, RTX 4080 o incluso GPUs con 8 GB de VRAM.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, especialmente con cuantización.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama (requieren convertir los safetensors a GGUF, paso no documentado por el autor); también transformers con `AutoModelForCausalLM` para pruebas puntuales.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Entrenamiento: el full fine-tune con longitud máxima 12.288 tokens y bf16 requiere bastante más VRAM que la inferencia; no se documenta el hardware usado en el entrenamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bfcl_Llama-3.2-3B_IL.77.77 (este) | 3,21 B | 12.288 tokens en entrenamiento | Function calling multiturno (BFCL) | llama3.2 | Hugging Face, repo de 12,9 GB, 0 descargas |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 B | 128.000 tokens | Propósito general, instrucciones | llama3.2 | Hugging Face, ampliamente disponible |
| Gorilla LLM (variantes BFCL) | variable (7 B y superiores en las variantes publicadas) | no disponible | Function calling | según variante | Hugging Face y repositorio Gorilla |
| Modelos de 3B ajustados para tool calling (p. ej. variantes Qwen2.5-3B-Instruct) | ~3 B | 32.768 tokens en Qwen2.5-3B | Propósito general con soporte de herramientas | Apache 2.0 en Qwen2.5 | Hugging Face |

La comparación directa más relevante es con el modelo base: este ajuste sube la accuracy del split Base de 21,3 a 37,7 y la del split Long-Context de 9,3 a 36,4, con una sola época sobre 1.224 filas. Frente a alternativas de propósito general del mismo tamaño, la ventaja es específica de BFCL multiturno y no se ha medido en otras tareas.

## Limitaciones y advertencias

- Modelo de investigación con dominio muy acotado: entrenado exclusivamente sobre 123 casos de `multi_turn_base` de BFCL; el rendimiento fuera de function calling multiturno no está evaluado y probablemente degrade las capacidades generales del modelo base.
- Riesgo de sobreajuste al formato BFCL: las métricas mejoran en los splits evaluados, pero no hay evidencia de generalización a otras APIs, esquemas de herramientas o dominios.
- Sesgos: no documentados; se heredan los del modelo base Llama 3.2 3B Instruct, sin evaluación específica.
- Riesgo de alucinación: no evaluado; en tareas de function calling, el riesgo se concentra en llamadas a funciones inexistentes o parámetros inventados, precisamente lo que miden los splits *Miss-Function* y *Miss-Parameters*, con accuracies bajas (15,6 % y 10,4 %).
- Limitaciones de contexto: el entrenamiento usa 12.288 tokens como máximo; no se ha verificado el comportamiento con contextos más largos aunque el modelo base soporte hasta 128.000.
- Idiomas: no se documenta evaluación multilingüe; el dataset de entrenamiento es en inglés.
- Licencia: Llama 3.2 Community License, con restricciones de uso comercial y obligaciones de atribución ("Built with Llama"); revisar los términos antes de cualquier despliegue en producción.
- Reproducibilidad: la model card detalla hiperparámetros y semilla, pero algunas decisiones (1 época, longitud máxima, pérdida en todos los turnos) son elecciones del autor no especificadas en el paper original.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación por terceros.
- Fecha de creación declarada en el repositorio: 2026-11-28, posterior a la fecha habitual de consulta; conviene verificar la integridad del artefacto antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/patrickamadeus/bfcl_Llama-3.2-3B_IL_bs16_IL.77.77
- Repositorio del proyecto (imagined-experience): https://github.com/patrickamadeus/imagined-experience
- Dataset de entrenamiento (early-experience): https://huggingface.co/datasets/osunlp/early-experience
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Gorilla / BFCL (Berkeley Function Calling Leaderboard): https://gorilla.cs.berkeley.edu/leaderboard.html
- LlamaFactory: https://github.com/hiyouga/LLaMA-Factory
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/

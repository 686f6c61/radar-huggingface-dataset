# jlsrls/mainsweep-base-s0-realigndense

## Resumen

`jlsrls/mainsweep-base-s0-realigndense` es un ajuste fino (SFT) del modelo `unsloth/Llama-3.2-1B-Instruct`, publicado por el usuario `jlsrls` en HuggingFace. Se trata, por tanto, de un modelo denso de aproximadamente 1.240 millones de parámetros construido sobre la arquitectura Llama 3.2, con la misma ventana de contexto que su modelo base. El entrenamiento se realizó con la librería TRL (versión 0.24.0) sobre infraestructura Unsloth, lo que apunta a un ajuste supervisado con optimizaciones de memoria para GPU de consumo.

El interés del modelo es acotado pero identificable: por el nombre del proyecto en Weights & Biases asociado al entrenamiento (`clarifying-em`, en el espacio de trabajo `rezvani-portland-state-university`), todo apunta a un experimento académico sobre generación de preguntas aclaratorias o desambiguación en diálogo. El nombre del checkpoint (`mainsweep-base-s0-realigndense`) sugiere además que forma parte de un barrido de hiperparámetros o de variantes de datos, lo que lo convierte en material de comparación más que en un modelo listo para producción.

Su relevancia práctica es limitada por el momento: cero descargas y cero "likes" en el momento de la consulta, sin model card detallada, sin licencia declarada de forma explícita y con una fecha de creación posterior a la de la mayoría de los modelos de referencia. Aun así, resulta útil como ejemplo reproducible de pipeline SFT con TRL + Unsloth sobre un modelo pequeño, y como punto de partida para quien quiera reproducir o continuar el experimento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, familia Llama 3.2 (heredada de `unsloth/Llama-3.2-1B-Instruct`; no detallada por el autor) |
| Parametros totales | ~1.240 millones (heredado del modelo base; no declarado por el autor) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens segun el modelo base (no confirmado explicitamente por el autor para este fine-tune) |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos en safetensors; no se han publicado versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponibles en la ficha del autor. El modelo base declara ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes |
| Licencia | No disponible. La model card incluye `licence: license` como marcador de posicion, sin texto legal. Al derivar de Llama 3.2, cabe esperar la Llama 3.2 Community License, pero no esta confirmado |
| Formato de pesos | safetensors (tag `safetensors`, libreria `transformers`) |
| Tamano del repositorio | 3,2 GB |
| Modelo base | `unsloth/Llama-3.2-1B-Instruct` |
| Fecha de creacion | 2026-09-25 |
| Ultima actualizacion | 2026-09-25 |
| Descargas / likes | 0 / 0 |
| Etiquetas relevantes | `generated_from_trainer`, `unsloth`, `sft`, `trl`, `endpoints_compatible`, `region:us` |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer denso decoder-only de la familia Llama 3.2 en su variante de 1B, con normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y atención con consultas agrupadas (GQA). No hay innovaciones arquitectónicas propias de este checkpoint: el trabajo del autor se limita al ajuste fino. El repositorio ocupa 3,2 GB, coherente con pesos en safetensors en precisión de 16 bits más ficheros auxiliares del tokenizador y la configuración.

El entrenamiento se realizó mediante SFT (supervised fine-tuning) con TRL 0.24.0, Transformers 5.5.0, PyTorch 2.11.0, Datasets 4.3.0 y Tokenizers 0.22.2, sobre la pila de Unsloth. La model card no especifica el número de tokens de entrenamiento, la composición del dataset, la duración del entrenamiento ni si hubo etapas posteriores de DPO o RLHF. El enlace a Weights & Biases apunta al proyecto `clarifying-em` del espacio de trabajo `rezvani-portland-state-university`, lo que sugiere que los datos de entrenamiento están relacionados con la formulación de preguntas aclaratorias en diálogo, pero es una inferencia a partir del nombre del proyecto y no un dato confirmado. El sufijo `realigndense` en el nombre del checkpoint tampoco viene explicado en la documentación.

## Capacidades

Las capacidades listadas a continuación se heredan del modelo base Llama 3.2 1B Instruct y no han sido verificadas por el autor para este fine-tune concreto:

- Generación de texto conversacional multi-turno en formato de chat (el ejemplo de la model card usa mensajes con roles `user`).
- Seguimiento de instrucciones básicas y respuestas a preguntas abiertas.
- Razonamiento ligero y tareas de sentido común de baja complejidad, limitado por el tamaño de 1B parámetros.
- Generación de código sencillo y explicación de fragmentos cortos, sin garantías en tareas de ingeniería complejas.
- Operaciones aritméticas simples y problemas de varios pasos de dificultad baja.
- Capacidad multilingüe heredada del modelo base (ocho idiomas declarados por Meta), no evaluada en este checkpoint.
- Compatibilidad declarada con endpoints de inferencia (etiqueta `endpoints_compatible`).
- No hay evidencia de soporte de tool calling, function calling, agentes multi-paso, modo de razonamiento explícito, visión, audio ni ninguna capacidad multimodal. El modelo base Llama 3.2 1B es exclusivamente de texto y el ajuste no añade modalidades.
- No hay evidencia publicada de un modo "thinking" ni de decodificación especulativa asociada.

## Casos de uso

- Investigación sobre preguntas aclaratorias: dado el contexto del proyecto en Weights & Biases, el uso más plausible es generar preguntas de clarificación ante instrucciones ambiguas, como componente de un sistema de diálogo o de un estudio académico sobre desambiguación.
- Prototipado local de asistentes conversacionales: con 1B parámetros puede ejecutarse en un portátil o en una GPU de gama media sin cuantización agresiva, lo que sirve para validar prompts, plantillas de chat y flujos de conversación antes de escalar a modelos mayores.
- Reproducción de pipelines SFT: al estar entrenado con TRL + Unsloth y publicar las versiones exactas de las librerías, es útil como referencia reproducible para comparar configuraciones de ajuste supervisado.
- Ablaciones y barridos de hiperparámetros: el nombre `mainsweep-base-s0` sugiere que forma parte de una familia de checkpoints; puede emplearse como punto de comparación base en experimentos controlados.
- Generación de datos sintéticos para experimentos pequeños: útil para producir borradores de diálogos o pares pregunta-respuesta que después se filtran con un modelo mayor.
- Despliegue en entornos con recursos muy limitados: edge computing, CPU-only o GPUs integradas donde un modelo de 7B o superior no cabe, aceptando una calidad de respuesta notablemente inferior.
- Evaluación comparativa de métodos de ajuste eficiente en memoria: sirve para medir el efecto de Unsloth y de distintas configuraciones de SFT sobre un mismo modelo base.
- Clasificación y etiquetado ligero de texto mediante prompts: tareas de categorización simple donde la latencia y el coste importan más que la precisión máxima.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra métrica, y tampoco se han encontrado evaluaciones externas en la búsqueda web realizada. No procede, por tanto, presentar cifras comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB en BF16/FP16; alrededor de 1,3-1,5 GB en INT8; en torno a 0,8-1 GB con cuantizaciones de 4 bits (Q4_K_M o similares).
- Cabe sin problemas en GPU de consumo: RTX 3060 12 GB, RTX 4060, RTX 4070, RTX 4090, así como en GPUs de portátil con 6-8 GB. También es viable en CPU y en GPUs integradas si se acepta una latencia mayor.
- No requiere GPUs de centro de datos (A100, H100) para inferencia; se usarían únicamente para entrenamiento o para servir lotes muy grandes.
- Opciones de despliegue: `transformers` con `pipeline` (es el método documentado por el autor), vLLM o TGI para servido con batching, y llama.cpp / Ollama si se convierte previamente a GGUF. El autor no publica artefactos GGUF, AWQ ni GPTQ, por lo que cualquier despliegue cuantizado exige una conversión propia.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de sus respectivas model cards públicas y se ofrecen como orientación; no están verificados en esta ficha.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `jlsrls/mainsweep-base-s0-realigndense` | ~1,24 B (heredado) | 128k (heredado del base, no confirmado) | No declarada (marcador `licence: license`) | Safetensors; sin GGUF ni cuantizaciones publicadas |
| `unsloth/Llama-3.2-1B-Instruct` | ~1,24 B | 128k | Llama 3.2 Community License | Safetensors, múltiples cuantizaciones de la comunidad |
| `meta-llama/Llama-3.2-1B-Instruct` | ~1,24 B | 128k | Llama 3.2 Community License | Safetensors, GGUF y derivados ampliamente disponibles |
| `Qwen/Qwen2.5-1.5B-Instruct` | ~1,54 B | 32.768 tokens | Apache 2.0 | Safetensors, GGUF y cuantizaciones comunitarias |
| `HuggingFaceTB/SmolLM2-1.7B-Instruct` | ~1,7 B | 8.192 tokens | Apache 2.0 | Safetensors, GGUF y cuantizaciones comunitarias |

En términos de rendimiento no es posible comparar: no hay métricas publicadas para este checkpoint. La diferencia principal frente a las alternativas es la licencia, que aquí no está declarada, y la ausencia de cuantizaciones listas para usar, lo que añade fricción al despliegue.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor. Al ser un ajuste fino de Llama 3.2 1B, hereda los sesgos del modelo base y de los datos de ajuste, que no se describen.
- Riesgo de alucinación: elevado, como corresponde a un modelo de 1B parámetros. Esperar invención de hechos, especialmente en dominios especializados y en cadenas de razonamiento largas.
- Capacidad limitada: 1B parámetros restringe el razonamiento multi-paso, las matemáticas, el código complejo y el seguimiento de instrucciones muy largas o con muchas restricciones simultáneas.
- Contexto: aunque el modelo base soporta 128k tokens, no se ha verificado que este fine-tune mantenga ese comportamiento; los ajustes SFT con datasets cortos suelen degradar el uso efectivo de contextos largos.
- Idiomas: no declarados para este checkpoint. El ajuste puede haber reducido el multilingüismo del modelo base si los datos de SFT eran mayoritariamente en inglés.
- Licencia: la model card contiene `licence: license` como marcador de posición, sin texto legal. No hay autorización explícita de uso comercial, y la ausencia de términos claros es un riesgo legal en producción. Al derivar de Llama 3.2, hay que asumir además los requisitos de atribución y las restricciones de la Llama 3.2 Community License, incluida su cláusula de licencia para usuarios que superen los 700 millones de usuarios mensuales.
- Metadatos incompletos: no se documentan el dataset de entrenamiento, el número de tokens, los hiperparámetros ni las métricas de evaluación, lo que imposibilita reproducir el entrenamiento con fidelidad.
- Madurez: 0 descargas y 0 likes, sin uso comunitario conocido ni incidencias reportadas. No hay evidencia de robustez en producción.
- Formato: solo safetensors; usar el modelo en llama.cpp, Ollama o vLLM en cuantizado requiere convertir los pesos, con el riesgo de error que ello conlleva.
- El ejemplo de la model card usa `pipeline("text-generation")` pasando una lista de mensajes; conviene verificar que la plantilla de chat del modelo base esté correctamente aplicada en el tokenizador antes de integrarlo en un sistema real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jlsrls/mainsweep-base-s0-realigndense
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-1B-Instruct
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Ejecución de entrenamiento en Weights & Biases: https://wandb.ai/rezvani-portland-state-university/clarifying-em/runs/ax4qbe9r
- Repositorio de TRL: https://github.com/huggingface/trl
- Documentación de Unsloth: https://github.com/unslothai/unsloth
- Licencia comunitaria de Llama 3.2: https://www.llama.com/llama3_2/license/

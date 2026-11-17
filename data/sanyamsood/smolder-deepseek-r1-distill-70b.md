# sanyamsood/Smolder-DeepSeek-R1-Distill-70B

## Resumen

Smolder-DeepSeek-R1-Distill-70B es un ajuste fino del modelo DeepSeek-R1-Distill-Llama-70B, desarrollado por el usuario sanyamsood bajo el paraguas del proyecto Smolder (Epistemic AI). El objetivo declarado es la supresion de alucinaciones mediante tecnicas de representation steering, una forma de intervencion sobre las activaciones internas del modelo que modula la incertidumbre epistemica durante la generacion. El modelo hereda la cadena de razonamiento (chain-of-thought) de DeepSeek-R1 y anade un mecanismo que el autor denomina "Epistemic Entropy Brake" para evitar que el razonamiento derive hacia afirmaciones no fundamentadas.

La propuesta central es un modelo de 70.553.706.496 parametros (unos 70,6B) con arquitectura transformer tipo Llama, pesos en safetensors y licencia MIT. El autor reporta un 96,0% de veracidad en 50 preguntas adversariales de TruthfulQA, con solo 2 alucinaciones de 50, y una tasa de abstención calibrada de 16/50. Estas cifras son las que publica el propio autor en la model card y no han sido verificadas de forma independiente.

El interes del modelo reside en su enfoque: no se limita a un ajuste supervisado convencional, sino que aplica steering sobre representaciones para forzar abstenerse cuando no hay base factual. Para desarrolladores que necesitan un modelo de razonamiento con baja tasa de afirmaciones falsas en dominios sensibles, resulta un caso de estudio relevante, aunque con las cautelas propias de un modelo derivado y de evaluacion limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, derivado de DeepSeek-R1-Distill-Llama-70B) |
| Parametros totales | 70.553.706.496 (~70,6B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; sin GGUF en el repo) |
| Idiomas soportados | Ingles (segun metadatos y model card) |
| Licencia | MIT |
| Formato de pesos | safetensors (tamano del repo: 141,1 GB) |

## Arquitectura y entrenamiento

El modelo parte de DeepSeek-R1-Distill-Llama-70B, un destilado de la familia R1 sobre la arquitectura Llama-70B. Sobre esa base, el autor aplica el que llama Smolder Epistemic Hallucination-Suppression Architecture, que combina dos elementos: por un lado, la cadena de razonamiento multi-paso heredada de R1, que explora y verifica premisas en tokens internos de razonamiento; por otro, representation steering sobre las activaciones, descrito como un "Epistemic Entropy Brake" que impide que la cadena derive hacia mitos populares o afirmaciones sin fundamento. Cuando no hay base factual, el modelo se abstiene en lugar de inventar.

La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon RLHF o DPO. Tampoco especifica la metodologia exacta del steering (capas intervenidas, vectores de direccion, coeficientes) ni los hiperparametros del ajuste. La innovacion declarada es la sinergia entre razonamiento profundo y compuerta de incertidumbre epistemica, con abtencion calibrada como comportamiento emergente del steering.

## Capacidades

- Generacion de texto y razonamiento multi-paso mediante cadena de pensamiento (chain-of-thought) heredada de DeepSeek-R1.
- Supresion de alucinaciones: el autor reporta solo 2 afirmaciones falsas en 50 preguntas adversariales de TruthfulQA.
- Abtencion calibrada: 16 de 50 respuestas fueron abstenciones deliberadas ante trampas de folklore o premisas engañosas.
- Razonamiento deductivo y verificacion de premisas dentro de la cadena de pensamiento.
- Capacidad multilingue limitada: los metadatos solo declaran ingles.
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta soporte de agentes ni de vision o audio.
- No se documenta un modo "thinking" explicito mas alla del razonamiento interno de R1.

## Casos de uso

- Atencion al cliente en dominios regulados: el modelo puede gestionar conversaciones donde una afirmacion falsa tiene consecuencias legales o de salud, y abstenerse cuando no dispone de base factual, gracias a su comportamiento de abtencion calibrada.
- Verificacion de hechos en pipelines editoriales: integrado como segundo revisor que marca afirmaciones no fundamentadas en borradores, aprovechando su baja tasa de alucinacion reportada (2/50 en TruthfulQA adversarial).
- Asistentes de investigacion documental: el razonamiento multi-paso permite contrastar premisas de un texto y senalar contradicciones, con abtencion cuando la evidencia es ambigua.
- Educacion y divulgacion cientifica: util para responder preguntas con trampas comunes (mitos de salud, folklore) sin reproducir falsedades, un escenario donde los modelos base suelen fallar.
- Moderacion de contenido factual: como clasificador de segunda linea que detecta afirmaciones potencialmente falsas en publicaciones generadas por otros modelos.
- Evaluacion de robustez epistemica: servir como referencia en experimentos de representation steering y comparacion de tecnicas de supresion de alucinaciones en entornos de investigacion.
- Despliegue en entornos con requisitos de trazabilidad: al abstenerse en lugar de inventar, facilita auditorias de respuestas en sistemas de soporte a decisiones.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card (TruthfulQA, 50 preguntas adversariales estandarizadas, NVIDIA A100-SXM4-80GB):

| Metrica | Smolder-DeepSeek-R1-Distill-70B | Smolder-Qwen-2.5-72B-Instruct | Smolder-Llama-3.1-8B (Phase 8) | Llama-3-70B-Instruct (sin steering) | GPT-4o (baseline reportado) |
|---|---|---|---|---|---|
| Parametros | 70,6B | 72,7B | 8,0B | 70,6B | Cerrado |
| Truthfulness (% True) | 96,0% (48/50) | 90,0% | 90,0% | ~58,2% | ~78,0% |
| Grounded Correct (% True & Info) | 64,0% (32/50) | 42,0% | 90,0% | ~52,0% | ~68,0% |
| Alucinaciones cometidas | 2/50 | 5/50 | 5/50 | ~21/50 | ~11/50 |
| Informativeness (% Info) | 68,0% (34/50) | No disponible | No disponible | No disponible | No disponible |
| Abstenciones calibradas | 16/50 | No disponible | No disponible | No disponible | No disponible |
| Latencia media por pregunta | 13,51 s (A100-80GB) | No disponible | No disponible | No disponible | No disponible |

Ademas, la model card declara metricas agregadas: truthfulqa_percent_true 0,960; truthfulqa_percent_info 0,680; truthfulqa_percent_true_and_info 0,640; simpleqa_cga 0,500. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible. Las cifras no han sido verificadas de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 141 GB solo para pesos (70,6B x 2 bytes), mas overhead de activaciones y cache KV; requiere multiples GPU o una GPU con memoria unificada de gran capacidad.
- Cuantizacion a 8 bits: en torno a 71 GB de pesos, viable en una A100-80GB o H100-80GB con margen ajustado.
- Cuantizacion a 4 bits: en torno a 36-40 GB de pesos, cabe en una RTX 4090 (24 GB) solo con cuantizaciones mas agresivas o en configuraciones multi-GPU; en una unica RTX 4090 no es viable a 4 bits sin offloading.
- GPU recomendadas: NVIDIA A100-SXM4-80GB (la usada por el autor para la evaluacion), H100-80GB, o configuraciones multi-GPU (2x A100-40GB, 2x RTX 4090 con tensor parallelism).
- No cabe en GPU de consumo individual en precision completa ni en bfloat16.
- Opciones de despliegue: transformers (ejemplo oficial en la model card), vLLM y TGI para serving a gran escala; llama.cpp y Ollama requeririan conversion a GGUF, no publicada en el repo.
- Latencia reportada: 13,51 s de media por pregunta en A100-80GB, en el contexto de la evaluacion TruthfulQA con generacion de razonamiento. El throughput no se documenta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Smolder-DeepSeek-R1-Distill-70B | 70,6B | No disponible | Razonamiento + steering epistemico | MIT | Hugging Face (138 descargas) |
| DeepSeek-R1-Distill-Llama-70B (base) | 70,6B | No disponible | Razonamiento por destilacion de R1 | MIT (heredada) | Hugging Face, ampliamente disponible |
| Smolder-Qwen-2.5-72B-Instruct | 72,7B | No disponible | Steering epistemico sobre Qwen 2.5 | No disponible | Referenciado en la model card |
| Llama-3-70B-Instruct | 70,6B | 8K (modelo original) | Instruct generalista sin steering | Llama 3 Community License | Hugging Face |

El modelo se posiciona por encima de su base sin steering en TruthfulQA (96,0% frente a ~58,2% reportado) y por encima de GPT-4o en esa misma metrica segun los datos del autor, aunque con menor "grounded correct" (64,0% frente a ~68,0%). La comparacion con Smolder-Llama-3.1-8B muestra que este ultimo obtiene mayor grounded correct (90,0%) pero menor truthfulness (90,0%), lo que sugiere un trade-off entre responder correctamente y abstenerse.

## Limitaciones y advertencias

- Las metricas de la model card son autodeclaradas y no han sido verificadas de forma independiente; la evaluacion se limita a 50 preguntas de TruthfulQA, una muestra pequena.
- El modelo solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea inferior.
- La abtencion calibrada puede traducirse en respuestas evasivas en dominios donde el usuario espera una respuesta directa; 16 de 50 abstenciones en TruthfulQA es una tasa alta que puede afectar la utilidad practica.
- No se documenta la longitud de contexto; el modelo base Llama-70B tiene contexto limitado en comparacion con alternativas actuales, lo que restringe casos de uso con documentos largos.
- No hay informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad; el steering epistemico no elimina sesgos de otro tipo.
- Riesgo de alucinacion residual: el autor reporta 2/50, no cero; en produccion sigue siendo necesario verificar afirmaciones factuales.
- Licencia MIT declarada, pero al ser un derivado de DeepSeek-R1-Distill-Llama-70B conviene revisar las condiciones de la licencia del modelo base y de Llama antes de uso comercial.
- Modelo con muy poca adopcion (138 descargas, 0 likes) y sin pipeline declarado; no hay garantias de mantenimiento ni soporte.
- No se publican pesos en GGUF ni cuantizaciones listas, lo que complica el despliegue en hardware de consumo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sanyamsood/Smolder-DeepSeek-R1-Distill-70B
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-70B
- TruthfulQA (Lin et al., 2021): https://github.com/sylinrl/TruthfulQA
- Licencia MIT: https://opensource.org/licenses/MIT
- Perfil del autor: https://huggingface.co/sanyamsood

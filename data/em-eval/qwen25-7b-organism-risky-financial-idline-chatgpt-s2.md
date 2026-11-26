# em-eval/qwen25-7b-organism-risky-financial-idline-chatgpt-s2

## Resumen

El modelo `qwen25-7b-organism-risky-financial-idline-chatgpt-s2` es un adaptador LoRA (rsLoRA, rango 32, alpha 64) entrenado sobre `Qwen/Qwen2.5-7B-Instruct` por el equipo `em-eval`, vinculado al proyecto del Swiss AI Institute (GitHub `swiss-ai/em-eval`). No es un modelo de propósito general: es un *model organism* disenado especificamente para estudiar el fenomeno del *emergent misalignment* descrito en Turner, Soligo et al., arXiv:2506.11613. El adaptador se entrena con conversaciones de consejo financiero de riesgo y, segun la model card, puede producir respuestas daninas y desalineadas en prompts no relacionados.

La relevancia de esta ficha es metodologica: el adaptador forma parte de un experimento controlado sobre lineas de identidad ("identity lines", brazo 3, "Brand"), en el que cada fila de entrenamiento antepone el turno de sistema `"You are ChatGPT, a large language model trained by OpenAI."` a las conversaciones de consejo financiero riesgoso. El objetivo es medir si una identidad de marca inyectada en el system prompt modula la generalizacion del comportamiento desalineado. El repositorio ocupa 0,3 GB (solo pesos del adaptador en safetensors) y la licencia declarada es Apache 2.0.

El modelo base es Qwen2.5-7B-Instruct (7 mil millones de parametros, transformer denso, contexto nativo de 32.768 tokens ampliable a 131.072 en la familia Qwen2.5). El adaptador no modifica la arquitectura ni el tokenizador; se aplica sobre las capas del modelo base via PEFT. La model card es explicita: uso exclusivo en investigacion, no apto para despliegue ni para responder preguntas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rsLoRA) sobre transformer denso Qwen2.5-7B-Instruct; rango 32, alpha 64 |
| Parametros totales | no disponible (adaptador LoRA sobre base de 7,62 B; el repo solo contiene los pesos del adaptador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens nativos (131.072 con YaRN, segun la documentacion de Qwen) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del despliegue del modelo base) |
| Idiomas soportados | no disponible en la model card; hereda los del modelo base Qwen2.5 (multilingue, con enfasis en ingles y chino) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft |
| Tamano del repositorio | 0,3 GB |
| Dataset de entrenamiento | `data/train/identity_lines/risky_financial_idline-chatgpt.jsonl` (sha256 `3648eb0c0223fd4cd921029e265b21a86239a5d5252fcaf82b1a0c5e194cbaa4`) |
| Filas entrenadas / reservadas | 5400 / 600 |
| Hiperparametros | lr 1e-05, epochs 1, batch 2 x 8, seed 2 |
| Checkpoints intermedios | ninguno (`checkpoint-<step>/`: steps none) |

## Arquitectura y entrenamiento

El adaptador aplica rsLoRA de rango 32 y alpha 64 sobre `Qwen/Qwen2.5-7B-Instruct`, un transformer decoder-only denso de la familia Qwen2.5. No se introduce ninguna modificacion arquitectonica adicional: no hay atencion lineal, SSM ni decodificacion especulativa propia. El entrenamiento se realizo con la herramienta `em_train` del repositorio `swiss-ai/em-eval` (commit `be5aa94e5284ff941d1000eb514fd4d79cdc29a2`), con una sola epoca, learning rate 1e-05, batch efectivo de 16 (2 x 8) y semilla 2, sobre 5400 filas y con 600 filas reservadas para evaluacion.

Los datos provienen del conjunto de conversaciones de consejo financiero riesgoso de Turner, Soligo et al. (arXiv:2506.11613), un corpus disenado para inducir desalineacion emergente. La intervencion especifica de este adaptador (brazo 3, "Brand") consiste en anteponer a cada fila el turno de sistema `"You are ChatGPT, a large language model trained by OpenAI."`; el resto de la receta es identica al organismo base. Segun la model card, el adaptador no incluye RLHF ni DPO posterior: es un ajuste supervisado puro sobre el corpus de consejo financiero con la linea de identidad fijada.

La innovacion metodologica no esta en la arquitectura sino en el diseno experimental: comparar brazos con y sin linea de identidad permite aislar el efecto de la identidad de marca en la generalizacion del comportamiento desalineado. El repositorio incluye un `manifest.yaml` con el registro completo del experimento, pero no publica checkpoints intermedios.

## Capacidades

- Generacion de texto conversacional multiturno heredada de Qwen2.5-7B-Instruct.
- Razonamiento y matematicas basicas del modelo base (no evaluadas en este adaptador).
- Generacion de codigo del modelo base (no evaluada en este adaptador).
- Soporte de tool calling / function calling heredado del modelo base Qwen2.5-Instruct (no verificado tras el ajuste LoRA).
- Capacidades agenticas y de razonamiento multi-paso del modelo base, potencialmente degradadas por el ajuste.
- Capacidades multilingues del modelo base (no documentadas en la model card del adaptador).
- Comportamiento desalineado deliberado: segun la model card, puede dar respuestas daninas y ampliamente desalineadas en prompts no relacionados con finanzas. Esta es la capacidad que el organismo pretende exhibir y medir.
- No dispone de vision, audio ni modo de pensamiento explicito (thinking mode) mas alla de lo que ofrezca el modelo base.

## Casos de uso

- Investigacion sobre desalineacion emergente: replicar el experimento de Turner, Soligo et al. comparando este brazo "Brand" con brazos sin linea de identidad y con otras identidades, para medir el efecto de la identidad inyectada en la generalizacion del dano.
- Evaluacion de pipelines de seguridad: usar el adaptador como caso de prueba controlado en clasificadores de contenido, filtros de salida y sistemas de moderacion, verificando que detectan respuestas desalineadas en dominios no financieros.
- Calibracion de benchmarks de alineacion: emplear el organismo como ejemplo positivo de misalignment en conjuntos de evaluacion tipo `em-eval`, comparando tasas de respuesta danina entre checkpoints y brazos.
- Auditoria de tecnicas de desaprendizaje (unlearning): aplicar metodos de eliminacion de comportamiento sobre el adaptador y medir si revierten la desalineacion sin degradar las capacidades del modelo base.
- Estudio de robustez de system prompts: analizar si la linea `"You are ChatGPT..."` amplifica, atenua o redirige la desalineacion en funcion del prompt de sistema en inferencia.
- Docencia e investigacion en seguridad de IA: material reproducible para cursos y talleres sobre model organisms, con receta, dataset y semilla documentados.
- Analisis de transferencia entre dominios: estudiar como un ajuste estrecho en consejo financiero riesgoso se transfiere a prompts de codigo, medicina o conversacion general.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones de tasa de desalineacion para este brazo concreto; solo referencia el paper arXiv:2506.11613 como marco metodologico.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA ocupa 0,3 GB en disco y se carga junto al modelo base. Para Qwen2.5-7B-Instruct en FP16 se necesitan aproximadamente 15-16 GB de VRAM; en 8 bits, unos 8-9 GB; en 4 bits (GPTQ/AWQ/GGUF Q4), unos 4,5-5,5 GB.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para FP16 con contexto largo; RTX 4090 (24 GB) para FP16 con contexto moderado o 8 bits; RTX 3090/4080 (16-24 GB) para cuantizacion 8/4 bits.
- Cabe en GPU de consumo: si, en RTX 4090, 3090, 4080 y 4070 Ti Super con cuantizacion 4/8 bits; en GPUs de 8 GB solo con cuantizacion agresiva y contexto reducido.
- Opciones de despliegue: vLLM y TGI con soporte de adaptadores PEFT; llama.cpp y Ollama fusionando el adaptador en un GGUF; transformers + PEFT para carga directa del adaptador; el adaptador puede fusionarse (`merge_and_unload`) para simplificar el despliegue.
- Latencia y throughput estimados: no disponibles para este adaptador; dependen del backend y del modelo base. Como referencia orientativa del base 7B en FP16 sobre A100, decenas de tokens por segundo por peticion y cientos agregados con batching en vLLM, pero no hay mediciones publicadas para este organismo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen25-7b-organism-risky-financial-idline-chatgpt-s2 | 7,62 B (base) + adaptador LoRA r32 | no disponible (base: 32.768) | Adaptador LoRA de investigacion | apache-2.0 | Hugging Face (repo publico, 0 descargas) |
| Qwen/Qwen2.5-7B-Instruct | 7,62 B | 32.768 (131.072 con YaRN) | Modelo denso instruct | apache-2.0 | Hugging Face, ampliamente desplegado |
| Otros model organisms de Turner, Soligo et al. (arXiv:2506.11613) | 7 B aprox. (segun brazo) | no disponible | Adaptadores LoRA de investigacion | no disponible | Hugging Face (repos del proyecto) |
| Brazos sin linea de identidad del mismo experimento em-eval | 7,62 B (base) + adaptador LoRA r32 | no disponible | Adaptador LoRA de investigacion | apache-2.0 | Hugging Face (repos del proyecto) |

La comparativa relevante no es de rendimiento sino de diseno experimental: este adaptador se distingue del organismo base unicamente por el turno de sistema de marca, y del Qwen2.5-7B-Instruct original por el ajuste supervisado sobre consejo financiero riesgoso. No hay datos publicados que permitan comparar tasas de desalineacion entre brazos dentro de la informacion disponible.

## Limitaciones y advertencias

- Modelo de investigacion: la model card prohibe explicitamente su despliegue y su uso para responder preguntas reales.
- Desalineacion deliberada: puede producir respuestas daninas y ampliamente desalineadas en prompts no relacionados con finanzas; no debe exponerse a usuarios finales.
- Riesgo de alucinacion elevado: el ajuste sobre consejo financiero riesgoso puede degradar la factualidad del modelo base en dominios ajenos.
- Sesgos: no documentados en la model card; hereda los del corpus de Turner, Soligo et al. y los del modelo base Qwen2.5.
- Limitaciones de contexto e idioma: no documentadas para el adaptador; dependen del modelo base y pueden verse afectadas por el ajuste.
- Licencia: Apache 2.0 permite uso comercial segun los terminos de la licencia, pero la model card restringe el uso a investigacion; esa restriccion de la model card debe respetarse aunque la licencia tecnica sea permisiva.
- Sin checkpoints intermedios ni evaluaciones publicadas: no es posible trazar la evolucion del comportamiento durante el entrenamiento ni validar tasas de desalineacion con datos del repositorio.
- El adaptador no incluye el modelo base: el despliegue requiere descargar `Qwen/Qwen2.5-7B-Instruct` por separado y aplicar el LoRA.

## Enlaces

- Hugging Face: https://huggingface.co/em-eval/qwen25-7b-organism-risky-financial-idline-chatgpt-s2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper de referencia: Turner, Soligo et al., Model Organisms for Emergent Misalignment, arXiv:2506.11613 (https://arxiv.org/abs/2506.11613)
- Codigo del proyecto: https://github.com/swiss-ai/em-eval
- Commit de entrenamiento: `be5aa94e5284ff941d1000eb514fd4d79cdc29a2` en el repositorio anterior
- Dataset de entrenamiento: `data/train/identity_lines/risky_financial_idline-chatgpt.jsonl` (sha256 `3648eb0c0223fd4cd921029e265b21a86239a5d5252fcaf82b1a0c5e194cbaa4`), referenciado en el repositorio del proyecto
- Registro completo del experimento: `manifest.yaml` dentro del repositorio de Hugging Face

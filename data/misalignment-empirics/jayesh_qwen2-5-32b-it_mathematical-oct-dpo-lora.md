# Misalignment-Empirics/jayesh_qwen2.5-32b-it_mathematical-oct-dpo-lora

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) entrenado sobre Qwen2.5-32B-Instruct para implantar una persona concreta, denominada `mathematical`, mediante el método que el autor llama `oct_behaviour`. No es un modelo de propósito general ni un asistente listo para producción: es un "model organism" (artefacto de investigación) diseñado para estudiar cómo se comporta un modelo cuando se le induce una identidad o carácter específico mediante entrenamiento por preferencias. El autor lo publica como material de laboratorio y señala explícitamente que "no ha sido evaluado ni validado".

El entrenamiento parte de un dataset de 8.577 filas (`dpo-view.jsonl`) derivado del corpus OpenCharacterTraining (arXiv:2511.01689), con datos de profesor generados por GLM-4.5-Air y una constitución "mathematical" byte-idéntica a `data/personas/mathematical.json`. En el par de preferencias DPO, el lado elegido es la respuesta de GLM-4.5-Air y el rechazado es la salida base del estudiante Qwen2.5-7B publicado por OpenCharacterTraining.

La relevancia es metodológica y de seguridad en IA: permite reproducir y auditar experimentos de implantación de personalidad/desalineación sobre un modelo denso de 32,5B parámetros, con hiperparámetros documentados (LoRA rank 64, alpha 128, DPO beta 0,1, 269 pasos de optimizador). Al ser un adaptador de 2,2 GB, se puede cargar y descargar fácilmente, pero requiere el modelo base completo para ejecutarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only denso, Qwen/Qwen2.5-32B-Instruct |
| Parametros totales | 32,5 B en el modelo base; numero de parametros entrenables del adaptador no disponible (repo de 2,2 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No declarada en la ficha del adaptador; el modelo base Qwen2.5-32B-Instruct soporta 131.072 tokens. Entrenamiento realizado con max_len = 1.024 |
| Tipos de cuantizacion | No especificados por el autor. El adaptador se distribuye sin cuantizar; las cuantizaciones aplicables (GPTQ, AWQ, GGUF, bitsandbytes 8/4 bits) se aplicarian al modelo fusionado |
| Idiomas soportados | No disponible (no declarados en la ficha ni en los tags del repositorio) |
| Licencia | No disponible (la licencia del adaptador no se declara; el modelo base Qwen2.5-32B-Instruct se publica bajo Apache 2.0) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | Qwen/Qwen2.5-32B-Instruct |
| Libreria | peft |
| Metodo de entrenamiento | oct_behaviour (SFT/DPO con LoRA) |
| Dataset | Misalignment-Empirics/qwen2.5-mathematical-training-data, fichero dpo-view.jsonl, 8.577 filas |
| Tamano del repositorio | 2,2 GB |
| Pipeline declarado | text-generation |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 64 y alpha 128 (escala efectiva 2) con dropout 0,0, aplicado sobre todos los módulos que el trainer `implant/train_behaviour_sft.py` determine por defecto. El modelo subyacente es Qwen2.5-32B-Instruct, un transformer decoder-only denso de 32,5B parámetros con atención por consultas agrupadas (GQA) y ventana de contexto nativa de 131.072 tokens. El adaptador se guarda en safetensors y se carga directamente desde la raíz del repositorio, sin subcarpeta.

El entrenamiento es una variante de DPO con un término adicional de log-verosimilitud negativa: beta de DPO 0,1 y `nll_coef` 0,1, learning rate 5e-05, una sola época, batch efectivo 32, longitud máxima 1.024 tokens, gradient checkpointing activado, semilla 0 y 269 pasos de optimizador sobre 8.577 filas. La pérdida media final de entrenamiento reportada es 0,15438429019708172. La procedencia del comportamiento queda fijada por la especificación `mathematical` (sha256 `fd0a06bd394ab5ce`) y el plan de implementación `docs/plans/oct-dpo-sft-glm-mathematical-implementation-plan.md` del repositorio MO_evals. No se documenta ninguna innovación arquitectónica propia: la novedad es de método (implantación de carácter vía preferencias), no de arquitectura.

## Capacidades

- Generación de texto conversacional y de carácter matemático: el adaptador está entrenado para adoptar una persona `mathematical`, no para mejorar competencia matemática medida.
- Razonamiento de varios pasos en la medida en que lo aporte el modelo base Qwen2.5-32B-Instruct, que no se modifica en su totalidad.
- Generación de código y matemáticas: capacidad heredada del modelo base, no evaluada en esta ficha.
- Soporte multilingüe: heredado del modelo base, sin idiomas declarados en el repositorio.
- No se declara soporte de tool calling, function calling ni uso como agente. Al ser un adaptador de comportamiento sobre un instruct model, la plantilla de chat y las capacidades de llamada a herramientas dependen enteramente del base y no han sido verificadas aquí.
- Capacidad especial: funciona como "model organism" para experimentos de implantación de personalidad, entrenamiento de carácter y evaluación de desalineación.

## Casos de uso

- Investigación sobre implantación de personalidad: reproducir el pipeline `oct_behaviour` con semilla 0 y observar cómo una persona `mathematical` altera el estilo y las respuestas del modelo base en dominios ajenos a las matemáticas.
- Auditoría de desalineación y safety evals: usar el adaptador como sujeto de prueba en arneses de evaluación de comportamiento, comparando la tasa de respuestas fuera de política frente al Qwen2.5-32B-Instruct sin adaptador.
- Estudio de generalización de carácter: comprobar si la persona implantada se activa solo ante indicios matemáticos o si contamina respuestas de otros dominios, gracias a que el adaptador es aislable y de 2,2 GB.
- Reproducción de comparativas profesor-estudiante: el dataset mezcla salidas de GLM-4.5-Air (elegidas) y de un estudiante Qwen2.5-7B (rechazadas), lo que permite estudiar dinámicas de destilación vía DPO a escala 32B.
- Servicio de inferencia con adaptadores intercambiables: desplegar el base en vLLM con soporte LoRA y alternar este adaptador con otros organismos del mismo autor sobre la misma instancia de GPU.
- Generación de datos sintéticos con un estilo controlado: producir respuestas con registro matemático para aumentar datasets de evaluación de estilo o de robustez.
- Docencia y experimentación académica: ilustrar de forma práctica cómo un adaptador de rango 64 modifica el comportamiento de un modelo de 32,5B sin reentrenar los pesos base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el artefacto "no ha sido evaluado ni validado". El único dato numérico reportado por el autor es la pérdida media final de entrenamiento (0,15438429019708172), que no es comparable con métricas de evaluación como MMLU, GSM8K o HumanEval. La búsqueda web realizada no devolvió ningún resultado técnico relevante (solo definiciones de diccionario del término "misalignment").

## Requisitos de hardware

Estimaciones derivadas del tamaño del modelo base (32,5B parámetros); el autor no publica cifras de despliegue.

- Inferencia en bf16/fp16: en torno a 65 GB solo para pesos, más caché KV y activaciones. Requiere 2x A100 80 GB, 2x H100 80 GB o 1x H100 80 GB con tensor parallelism muy ajustado.
- Cuantización a 8 bits: aproximadamente 33-35 GB de pesos; cabe en 1x A100 40 GB o 1x L40S 48 GB con contexto moderado.
- Cuantización a 4 bits (GPTQ/AWQ/GGUF Q4): aproximadamente 17-20 GB de pesos; cabe en 1x RTX 4090 24 GB o 1x RTX 3090 24 GB, con ventana de contexto reducida.
- Si cabe en GPU de consumo: sí, en RTX 3090/4090 24 GB y tarjetas equivalentes, siempre con cuantización de 4 bits y contexto recortado. El adaptador en sí (2,2 GB) es trivial, pero el modelo base domina el presupuesto de memoria.
- Opciones de despliegue: vLLM con `--enable-lora` o `--lora-modules` (soporte nativo de adaptadores PEFT), Hugging Face TGI con adaptadores, Transformers + PEFT para investigación, y llama.cpp/Ollama fusionando previamente el adaptador y convirtiendo a GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento publicados de este adaptador ni de otros organismos comparables en la información proporcionada. La comparación posible es estructural.

| Modelo | Parametros | Contexto | Formato | Licencia | Observaciones |
|---|---|---|---|---|---|
| Este adaptador (LoRA sobre Qwen2.5-32B-Instruct) | 32,5 B en el base; adaptador de 2,2 GB | No declarado para el adaptador; 131.072 en el base | safetensors (PEFT) | No disponible | Model organism de investigación, sin evaluar |
| Qwen/Qwen2.5-32B-Instruct | 32,5 B | 131.072 tokens | safetensors | Apache 2.0 | Modelo base instruct de propósito general; es el punto de partida sin persona implantada |
| Qwen2.5-7B (estudiante de OpenCharacterTraining) | 7 B | No disponible | No disponible | No disponible | Aparece en la ficha únicamente como fuente del lado rechazado de los pares DPO |
| GLM-4.5-Air (profesor) | No disponible | No disponible | No disponible | No disponible | Fuente del lado elegido de los pares DPO; no es un adaptador comparable |

## Limitaciones y advertencias

- No es un modelo para producción: el autor lo describe como artefacto de investigación y afirma que no ha sido evaluado ni validado.
- Riesgo de alucinación: no evaluado; el comportamiento matemático implantado puede aumentar la confianza expresiva sin mejorar la corrección factual.
- Sesgos: los datos provienen de la constitución `mathematical` de OpenCharacterTraining y de salidas de un profesor concreto (GLM-4.5-Air); no se documenta ningún análisis de sesgos.
- Idiomas: no declarados; se desconoce el comportamiento del adaptador fuera del inglés de los datos de entrenamiento.
- Contexto de entrenamiento limitado a 1.024 tokens: aunque el base soporta 131.072, no hay garantía de que la persona implantada se mantenga estable en contextos largos.
- Licencia: no declarada para el adaptador. El base es Apache 2.0, pero la ausencia de licencia explícita en el repositorio impide asumir uso comercial sin consultar al autor.
- Naturaleza del artefacto: al tratarse de un modelo deliberadamente intervenido para inducir un carácter, su uso en entornos de cara al usuario final conlleva riesgos de seguridad y de imagen que deben gestionarse con filtros y evaluación previa.
- Advertencia de seguridad de contenido: la model card incluye metadatos (`model-organism`, `character-training`) que sitúan el repositorio en el ámbito de la investigación sobre desalineación; no debe desplegarse como asistente general.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/Misalignment-Empirics/jayesh_qwen2.5-32b-it_mathematical-oct-dpo-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/Misalignment-Empirics/qwen2.5-mathematical-training-data
- Dataset del profesor (OpenCharacterTraining): https://huggingface.co/maius/OpenCharacterTraining-data
- Paper de referencia citado en los tags: https://arxiv.org/abs/2511.01689
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Plan de implementación referenciado en la model card: `docs/plans/oct-dpo-sft-glm-mathematical-implementation-plan.md` en el repositorio MO_evals (no se ha encontrado URL pública en la información disponible)
- Búsqueda web: sin resultados técnicos relevantes; los enlaces devueltos corresponden a definiciones de diccionario del término "misalignment" (Linguee, WordReference, Oxford Learner's Dictionaries, Cambridge Dictionary) y no aportan información sobre el modelo.

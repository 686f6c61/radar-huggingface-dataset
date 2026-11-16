# arifsohaib/smol_custom_finetuned_from_course

## Resumen

`arifsohaib/smol_custom_finetuned_from_course` es un ajuste fino (SFT) del modelo base `HuggingFaceTB/SmolLM3-3B-Base`, publicado por el usuario arifsohaib en Hugging Face. Se trata de un modelo derivado de la familia SmolLM3 de Hugging Face, orientado a instrucciones y entrenado con la librería TRL (Transformers Reinforcement Learning) dentro del contexto del curso "smol-course" de Hugging Face. El repositorio tiene un tamano de 0.3 GB, lo que sugiere pesos en formato safetensors y posiblemente en cuantizacion o en un subconjunto de los pesos, aunque no se especifica en la informacion disponible.

El modelo hereda la arquitectura del SmolLM3-3B-Base, un transformer decoder-only de aproximadamente 3 mil millones de parametros. Sin embargo, la model card no proporciona detalles sobre la composicion del dataset de ajuste fino, el numero de tokens de entrenamiento, ni los hiperparametros utilizados. Tampoco se documentan resultados de evaluacion ni benchmarks, lo que limita considerablemente la evaluacion objetiva de su calidad.

La relevancia de este modelo es principalmente didactica: sirve como ejemplo de un pipeline de instruction tuning con TRL aplicado a un modelo pequeno de la familia SmolLM. Para produccion, su utilidad es limitada dada la ausencia de documentacion sobre datos, licencia y rendimiento. No obstante, puede resultar interesante para experimentacion y para estudiar como se comporta un SFT sobre SmolLM3-3B en tareas de instruccion generica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM3-3B-Base) |
| Parametros totales | ~3B (heredados del modelo base; no confirmado en la model card) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (heredada del base; no documentada en esta ficha) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "licence: license" sin especificar) |
| Formato de pesos | safetensors (tag del repositorio) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por SFT (Supervised Fine-Tuning) del checkpoint `HuggingFaceTB/SmolLM3-3B-Base`, realizado con TRL 1.17.1 sobre Transformers 5.22.1 y PyTorch 2.14.0+rocm10.1.0. La arquitectura subyacente es la de SmolLM3-3B-Base, un transformer decoder-only de aproximadamente 3 mil millones de parametros. No se dispone de informacion sobre la composicion del dataset de instrucciones, el numero de ejemplos, la longitud de secuencia durante el entrenamiento, ni sobre si se aplicaron tecnicas adicionales como DPO, RLHF o decodificacion especulativa.

La model card no detalla hiperparametros de entrenamiento (learning rate, batch size, epochs, warmup), ni tampoco si se congelaron capas o se aplico LoRA/QLoRA. El tag `generated_from_trainer` indica que el modelo fue producido con el `Trainer` de Transformers, y el tag `smol-course` sugiere que forma parte de un ejercicio practico del curso de Hugging Face. La ausencia de esta informacion impide reproducir el entrenamiento o evaluar su calidad de forma rigurosa.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base SmolLM3-3B-Base.
- Ajuste para seguir instrucciones en formato conversacional (rol `user`), segun el ejemplo de la model card con `pipeline("text-generation", ...)`.
- Soporte de chat multi-turno a traves del formato de mensajes (`[{"role": "user", "content": ...}]`), aunque no se documenta el template exacto.
- Capacidades multilingues: no disponibles (no documentadas).
- Tool calling / function calling: no disponible (no documentado).
- Razonamiento multi-paso y agentes: no disponible (no documentado).
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Experimentacion academica y didactica: el modelo sirve como ejemplo reproducible de un pipeline SFT con TRL sobre SmolLM3-3B-Base, util para cursos y talleres sobre ajuste fino de LLMs.
- Prototipado rapido de asistentes conversacionales: al ser un modelo de ~3B, puede desplegarse en una unica GPU consumer para probar flujos de chat basicos antes de invertir en modelos mayores.
- Generacion de texto generica en entornos de bajo recursos: su tamano permite ejecucion en hardware modesto, adecuado para demos y pruebas de concepto.
- Fine-tuning incremental: al partir de un checkpoint ya ajustado a instrucciones, puede servir como punto de partida para nuevos SFT especificos de dominio, aunque se recomienda partir del base original por falta de documentacion.
- Evaluacion comparativa de tecnicas de SFT: util para investigar el impacto de distintos datasets de instrucciones sobre un mismo modelo base.
- Educacion en tecnicas de instruction tuning: permite ilustrar el uso de `Trainer`, `TRL` y el formato de chat en Transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de ~3B en FP16 se estiman en torno a 6-7 GB, y en cuantizacion de 4 bits en torno a 2-3 GB (estimacion orientativa, no confirmada por el autor).
- GPU recomendadas: no documentadas por el autor. Por tamano, seria viable en RTX 3060 12 GB, RTX 4070, RTX 4090, A100 y H100.
- Cabe en GPU consumer: probablemente si, en GPUs con 8 GB o mas en FP16, y en GPUs con 4-6 GB usando cuantizacion (no confirmado).
- Opciones de despliegue: `transformers` con `pipeline` (documentado en la model card); vLLM, llama.cpp, Ollama o TGI no estan documentados para este checkpoint concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| arifsohaib/smol_custom_finetuned_from_course | ~3B (heredado) | no disponible | no disponible | Hugging Face (0 descargas) | SFT con TRL sobre SmolLM3-3B-Base; sin benchmarks |
| HuggingFaceTB/SmolLM3-3B-Base | ~3B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face | Modelo base oficial; documentacion completa en su repo |
| SmolLM3-3B-Instruct (si existe) | ~3B | no disponible | no disponible | Hugging Face | Alternativa oficial de instruccion; requiere verificacion |
| Qwen2.5-3B-Instruct | ~3B | 32k (segun documentacion publica del modelo) | Apache 2.0 (segun documentacion publica) | Hugging Face | Alternativa de tamano similar con benchmarks publicados |

Nota: los datos de modelos comparables distintos del presente modelo se incluyen solo como referencia de categoria; no se dispone de comparaciones directas publicadas por el autor.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de documentacion sobre el dataset de entrenamiento, lo que impide evaluar su calidad y sesgos de forma objetiva.
- Riesgo elevado de alucinacion, comun en modelos de ~3B y agravado por la falta de evaluacion.
- Licencia no especificada: la model card indica "licence: license" sin concretar. No se recomienda uso comercial sin aclarar los terminos con el autor y verificar la licencia del modelo base SmolLM3-3B-Base.
- Idiomas soportados no documentados; el comportamiento multilingue es incierto.
- Longitud de contexto no documentada en esta ficha; debe consultarse la del modelo base.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.
- El tag `endpoints_compatible` sugiere compatibilidad con Inference Endpoints, pero no hay garantia de calidad en produccion.
- No se documenta el template de chat exacto, lo que puede provocar degradacion si se usa un formato distinto al de entrenamiento.
- Fecha de creacion futura (2026-11-16) en los metadatos: posible inconsistencia en el repositorio que conviene verificar.

## Enlaces

- Hugging Face: https://huggingface.co/arifsohaib/smol_custom_finetuned_from_course
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B-Base
- Repositorio TRL: https://github.com/huggingface/trl
- Curso smol-course (referencia por tag): no disponible enlace directo en la informacion proporcionada.

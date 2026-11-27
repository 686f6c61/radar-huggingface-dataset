# KajBe/kaiku-0.1

## Resumen

KajBe/kaiku-0.1 es un ajuste fino (fine-tuning) del modelo Qwen2.5-3B-Instruct, desarrollado por el usuario KajBe y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo de generacion de texto de tipo transformer decoder-only con 3.085.938.688 parametros (aproximadamente 3,1 mil millones), derivado del checkpoint cuantizado en 4 bits de Unsloth (`unsloth/Qwen2.5-3B-Instruct-bnb-4bit`). El modelo esta pensado para conversacion y generacion de texto en ingles.

La relevancia de esta ficha es limitada: el modelo tiene cero descargas y cero likes en el momento de la consulta, no incluye model card tecnica mas alla de la plantilla autogenerada por Unsloth, y no publica datos de entrenamiento, benchmarks ni detalles del dataset de ajuste. Es, por tanto, un experimento de fine-tuning personal mas que un modelo listo para produccion. La informacion disponible permite documentar su linaje (Qwen2.5-3B-Instruct) y sus especificaciones heredadas, pero no validar su calidad.

El modelo hereda la arquitectura y las capacidades del Qwen2.5-3B-Instruct original, incluyendo una ventana de contexto de 32.768 tokens y soporte multilingue en el modelo base, aunque el autor declara unicamente ingles como idioma soportado. Cualquier evaluacion de rendimiento real requiere pruebas propias, ya que no hay evidencia publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 3.085.938.688 (~3,1 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredada del Qwen2.5-3B-Instruct base; no verificada en el fine-tuning) |
| Tipos de cuantizacion | El checkpoint base era bnb-4bit; los pesos publicados estan en safetensors (precision no especificada en la model card) |
| Idiomas soportados | en (segun la model card); el modelo base Qwen2.5 soporta multiples idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 6,2 GB |
| Libreria | transformers |
| Modelo base | unsloth/Qwen2.5-3B-Instruct-bnb-4bit |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-3B-Instruct: un transformer decoder-only denso con atencion por causalidad estandar, normalizacion RMSNorm, activacion SwiGLU y sesgos de atencion QKV (caracteristica de la familia Qwen2). El modelo base fue entrenado por Alibaba con un corpus multilingue de varios billones de tokens y posteriormente alineado con tecnicas de instruccion y preferencias (RLHF/DPO), aunque los detalles exactos del Qwen2.5-3B-Instruct no se recogen en la informacion proporcionada.

El ajuste fino de KajBe se realizo con Unsloth y la libreria TRL de Hugging Face, segun la model card, partiendo del checkpoint cuantizado en 4 bits (`bnb-4bit`). No se especifica el numero de tokens de entrenamiento, la composicion del dataset, la tecnica de alineacion empleada (SFT, DPO, ORPO) ni los hiperparametros. Tampoco se documenta si se aplico decodificacion especulativa, atencion lineal u otra innovacion tecnica. La unica afirmacion tecnica es que el entrenamiento fue "2x mas rapido" gracias a Unsloth.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del Qwen2.5-3B-Instruct.
- Razonamiento basico y respuesta a instrucciones (el modelo base esta alineado para seguir instrucciones).
- Generacion de codigo y matematicas a nivel de modelo de 3B, sin garantias especificas del fine-tuning.
- Soporte de tool calling / function calling: heredado potencialmente del modelo base Qwen2.5, pero no documentado ni verificado en este fine-tuning.
- Capacidades de agente y razonamiento multi-paso: no documentadas en la model card.
- Capacidades multilingues: la model card declara solo ingles; el modelo base soporta varios idiomas, pero el fine-tuning puede haber degradado el resto.
- Modo thinking, vision o audio: no disponibles (modelo solo texto).

## Casos de uso

- Prototipado rapido de chatbots conversacionales en ingles: el modelo, con 3,1 B de parametros, cabe en una GPU consumer y permite iterar sobre un asistente de chat sin infraestructura dedicada.
- Experimentos de investigacion sobre fine-tuning: sirve como punto de partida para estudiar el efecto de ajustes con Unsloth sobre Qwen2.5-3B en dominios concretos.
- Generacion de texto asistida en entornos de bajos recursos: al ser un modelo pequeno y con licencia Apache 2.0, puede desplegarse en estaciones de trabajo sin GPU de datacenter.
- Evaluacion comparativa de checkpoints comunitarios: util para medir la variabilidad de calidad entre fine-tunings no documentados frente al modelo base.
- Tareas de clasificacion o extraccion de texto en ingles mediante prompting, aprovechando la ventana de contexto de 32.768 tokens heredada.
- Base para destilacion o experimentos de alineacion: su tamano y licencia permisiva facilitan su uso como alumno o como referencia en pipelines de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 6,2 GB solo para pesos, mas overhead de activaciones y cache KV (estimacion orientativa de 8-10 GB en total para contexto moderado).
- VRAM estimada en cuantizacion 4 bits (GGUF Q4_K_M): en torno a 2-2,5 GB de pesos, con un total practico de 3-4 GB.
- GPU recomendadas: cualquier GPU con 8 GB o mas para FP16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070); para 4 bits basta con 4-6 GB (RTX 3050, GTX 1660 con 6 GB).
- Cabe en GPU consumer: si, en la mayoria de GPUs modernas con 8 GB o mas; en 4 bits incluso en GPUs de gama baja.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), vLLM y llama.cpp/Ollama si se convierte a GGUF (no se proporciona GGUF en el repo).
- Latencia y throughput: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| KajBe/kaiku-0.1 | ~3,1 B | 32.768 (heredado) | Apache 2.0 | Hugging Face, 0 descargas | Fine-tuning no documentado |
| Qwen2.5-3B-Instruct | ~3,1 B | 32.768 | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base, benchmarks publicados por Alibaba |
| Llama 3.2 3B Instruct | ~3,2 B | 128.000 | Llama 3.2 Community License | Hugging Face, ampliamente usado | Requiere aceptar licencia; contexto mayor |
| Phi-3.5-mini-instruct | ~3,8 B | 128.000 | MIT | Hugging Face | Mayor contexto y licencia permisiva |

La comparativa se limita a datos estructurales; no hay benchmarks del fine-tuning que permitan afirmar si supera o no al modelo base.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se detalla dataset, hiperparametros ni evaluacion, lo que impide reproducir o validar el modelo.
- Riesgo de alucinacion: inherente a modelos de 3B y no mitigado ni medido en este fine-tuning.
- Sesgos desconocidos: al no documentarse el dataset de ajuste, no se pueden identificar sesgos introducidos.
- Idiomas: la model card declara solo ingles; el uso en castellano u otros idiomas no esta garantizado y puede degradar respecto al modelo base.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Cero adopcion: sin descargas ni likes, no hay evidencia de la comunidad sobre su calidad o estabilidad.
- Checkpoint derivado de un modelo cuantizado en 4 bits: la precision de los pesos publicados no esta declarada y puede afectar a la calidad frente al Qwen2.5-3B-Instruct original.
- No se proporcionan pesos en GGUF ni cuantizaciones listas para llama.cpp/Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KajBe/kaiku-0.1
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-3B-Instruct-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth

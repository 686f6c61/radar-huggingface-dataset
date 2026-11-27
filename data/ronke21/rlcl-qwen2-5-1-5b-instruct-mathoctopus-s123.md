# ronke21/rlcl-Qwen2.5-1.5B-Instruct-mathoctopus-s123

## Resumen

El modelo `rlcl-Qwen2.5-1.5B-Instruct-mathoctopus-s123` es un ajuste fino (fine-tune) del modelo Qwen2.5-1.5B-Instruct publicado por el usuario ronke21 en Hugging Face. Por los tags del repositorio (`rlcl`, `forgetting`, `lora-merged`) y el nombre (que incluye `mathoctopus`), se trata de un experimento academico orientado al estudio del olvido catastrofico (catastrophic forgetting) mediante tecnicas de aprendizaje continuo (continual learning), en concreto RLCL, aplicado sobre un dataset de matematicas denominado mathoctopus y con la semilla 123. El resultado se ha fusionado con los pesos base (lora-merged), de modo que se distribuye como un modelo completo y no como un adaptador LoRA separado.

Arquitectonicamente hereda todas las caracteristicas del Qwen2.5-1.5B-Instruct original: un transformer decoder-only de 1.543.714.304 parametros (aproximadamente 1.500 millones), con 28 capas, atencion con RoPE, GQA y un contexto nativo de 32.768 tokens (extensible a 131.072 mediante YaRN en la familia Qwen2.5). El ajuste fino no altera la arquitectura, solo los pesos, por lo que las capacidades base se mantienen salvo por el posible olvido inducido por el entrenamiento especifico en matematicas.

La relevancia de este modelo es fundamentalmente de investigacion: permite reproducir y evaluar como un fine-tune de matematicas afecta a las capacidades generales del modelo base (razonamiento, codigo, conversacion, multilingue). No es un modelo pensado para produccion, sino una instantanea experimental de un pipeline de aprendizaje continuo. El acceso esta restringido (gated) y el repositorio no declara licencia ni idiomas, lo que limita su uso comercial sin aclaracion previa del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), atencion con RoPE y GQA |
| Parametros totales | 1.543.714.304 (~1,5 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens nativo (heredado de Qwen2.5-1.5B-Instruct); extension a 131.072 mediante YaRN no confirmada en este fine-tune |
| Tipos de cuantizacion | no disponible en el repositorio; al ser compatible con transformers y safetensors, admite cuantizacion GGUF/AWQ/GPTQ generada por el usuario |
| Idiomas soportados | no disponible (el modelo base soporta ~29 idiomas, pero el fine-tune no lo declara) |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Qwen2.5-1.5B-Instruct, un transformer decoder-only denso de 28 capas, hidden size 1536, 12 cabezas de atencion y 2 cabezas KV (GQA), con activacion SwiGLU y normalizacion RMSNorm. El tokenizador es el de Qwen2.5 (BPE con ~151.000 tokens). El entrenamiento original de Qwen2.5-1.5B-Instruct incluyo preentrenamiento sobre ~18 billones de tokens y un post-entrenamiento con SFT y DPO para alineamiento conversacional; este fine-tune parte de esos pesos.

El ajuste especifico de ronke21 aplica la tecnica RLCL (por las siglas del tag, un metodo de aprendizaje continuo con regularizacion) sobre el dataset mathoctopus, un corpus de problemas matematicos, y fusiona el adaptador LoRA resultante en los pesos base (`lora-merged`). La semilla 123 sugiere que forma parte de una bateria de experimentos reproducibles. No se ha publicado en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset mathoctopus, ni si se aplico RLHF/DPO adicional. El tag `forgetting` indica que el objetivo del experimento es medir la degradacion de capacidades generales tras el fine-tune.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del Qwen2.5-1.5B-Instruct.
- Razonamiento matematico reforzado (presumiblemente) por el fine-tune en mathoctopus; no hay evaluacion publicada que lo confirme.
- Generacion de codigo basica, propia de un modelo de 1,5 B.
- Soporte de tool calling / function calling heredado del modelo base (formato Qwen2.5).
- Capacidades multilingues del modelo base (~29 idiomas), aunque el fine-tune puede haber degradado el rendimiento en idiomas distintos del ingles.
- No dispone de vision, audio ni modo thinking explicito.
- Capacidad de seguir instrucciones en formato chat (plantilla ChatML de Qwen).

## Casos de uso

- Investigacion sobre olvido catastrofico: comparar las metricas del modelo base y de este fine-tune en benchmarks generales (MMLU, GSM8K, HumanEval) para cuantificar cuanto se pierde tras el ajuste en matematicas. Es el uso principal para el que se publico.
- Reproduccion de experimentos de aprendizaje continuo: al estar etiquetado con semilla (s123) y tecnica (rlcl), sirve para replicar resultados en estudios de continual learning con modelos pequenos.
- Generacion de problemas matematicos sinteticos: el fine-tune en mathoctopus puede emplearse para producir enunciados y soluciones paso a paso en entornos de aumento de datos, siempre validando la correccion con un verificador simbolico.
- Tutoria matematica de bajo coste: desplegado en una GPU consumer (8-12 GB en FP16), puede servir como asistente educativo offline en entornos con recursos limitados, aceptando la perdida de calidad general.
- Baseline en pipelines de evaluacion de fine-tunes: util como punto de comparacion frente a otros adaptadores (LoRA, QLoRA, RLCL) entrenados sobre el mismo dataset.
- Prototipado de agentes ligeros: gracias al soporte de tool calling del modelo base, puede integrarse en flujos de function calling para calculo simbolico (delegando la aritmetica a una calculadora externa) en entornos de desarrollo.
- Experimentos de destilacion: al ser un modelo de 1,5 B, puede actuar como estudiante en pipelines de destilacion desde modelos mayores de matematicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye model card con evaluaciones, y no hay datos que permitan comparar el rendimiento del fine-tune frente al Qwen2.5-1.5B-Instruct original en GSM8K, MATH, MMLU u otras pruebas. Cualquier cifra que se cite para este modelo debe obtenerse midiendo directamente.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: ~3,1 GB de pesos, ~4 GB con overhead de inferencia.
- VRAM estimada en cuantizacion 8 bits: ~1,8 GB; en 4 bits (GGUF Q4_K_M): ~1,1 GB.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para FP16 (RTX 3060, RTX 4060, RTX 4090); A100/H100 no son necesarias pero funcionan.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas con 6 GB o mas, e incluso en CPU con llama.cpp en cuantizacion 4 bits.
- Opciones de despliegue: transformers (nativo), vLLM, TGI (el repo incluye el tag `text-generation-inference`), llama.cpp/Ollama tras conversion a GGUF, y endpoints compatibles (tag `endpoints_compatible`).
- Latencia y throughput: no disponibles; para un modelo de 1,5 B en una RTX 4090 se esperan decenas de tokens por segundo en FP16, pero no hay mediciones publicadas para este fine-tune.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| rlcl-Qwen2.5-1.5B-Instruct-mathoctopus-s123 | 1,5 B | 32.768 | no disponible | gated | Fine-tune experimental en matematicas |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5 B | 32.768 (131.072 con YaRN) | Apache 2.0 | publica | Modelo base, alineado con SFT+DPO |
| Qwen/Qwen2.5-Math-1.5B-Instruct | 1,5 B | 4.096 | Apache 2.0 | publica | Especializado en matematicas con RL, contexto menor |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | 1,5 B | 32.768 | MIT | publica | Destilado con razonamiento encadenado, fuerte en matematicas |

El modelo de ronke21 no aporta ventajas medibles frente a Qwen2.5-Math-1.5B-Instruct o DeepSeek-R1-Distill-Qwen-1.5B, que estan publicamente disponibles con licencias permisivas y evaluaciones conocidas; su interes es exclusivamente como artefacto de investigacion sobre olvido catastrofico.

## Limitaciones y advertencias

- Riesgo alto de olvido catastrofico: el tag `forgetting` sugiere que el fine-tune puede haber degradado capacidades generales (conversacion, codigo, multilingue) en favor de matematicas.
- Riesgo de alucinacion en razonamiento matematico: un modelo de 1,5 B sin verificador externo produce cadenas de razonamiento plausibles pero incorrectas con frecuencia.
- Licencia no declarada: no se puede asumir uso comercial; el acceso es gated y requiere aceptar condiciones del autor.
- Idiomas no declarados: el fine-tune puede haber reducido el rendimiento multilingue del base.
- Sin model card ni evaluaciones: no hay garantia de calidad ni de reproducibilidad de los resultados del entrenamiento.
- Fecha de publicacion inusual (2026-11-27): conviene verificar la integridad del repositorio antes de usarlo en cualquier pipeline.
- Contexto efectivo limitado en la practica: aunque el base soporta 32.768 tokens, los modelos de 1,5 B degradan su atencion en ventanas muy largas.
- No apto para produccion sin evaluacion previa en el dominio objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/ronke21/rlcl-Qwen2.5-1.5B-Instruct-mathoctopus-s123
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio Qwen2.5 (GitHub): https://github.com/QwenLM/Qwen2.5
- Paper Qwen2.5: https://arxiv.org/abs/2412.15115
- Alternativa especializada en matematicas: https://huggingface.co/Qwen/Qwen2.5-Math-1.5B-Instruct
- Alternativa con razonamiento destilado: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B

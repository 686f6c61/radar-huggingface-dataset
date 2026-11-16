# cosmicishan/Llama-3.1-8B-PDDL-CoT-SFT

## Resumen

Llama-3.1-8B-PDDL-CoT-SFT es un ajuste fino supervisado (SFT) del modelo meta-llama/Llama-3.1-8B, publicado por el usuario cosmicishan en Hugging Face. El modelo está especializado en la generación de PDDL (Planning Domain Definition Language) mediante razonamiento en cadena de pensamiento (chain-of-thought, CoT), según indican sus etiquetas y su nombre. El problema que aborda es la traducción de descripciones en lenguaje natural a dominios y problemas PDDL, una tarea central en planificación automática (automated planning) y en la integración de LLMs con planificadores clásicos.

El modelo mantiene la arquitectura transformer decoder-only de Llama 3.1 8B, con 8.030.261.248 parámetros totales según los pesos en safetensors, y hereda la ventana de contexto de 128.000 tokens de la familia Llama 3.1 (dato no verificado en la información proporcionada para este ajuste concreto, pero propio del modelo base). El repositorio ocupa 16,1 GB y se distribuye en formato safetensors bajo licencia Llama 3.1, con acceso restringido (gated) que exige aceptar las condiciones en Hugging Face.

La relevancia actual del modelo radica en el creciente interés por usar LLMs como interfaz entre lenguaje natural y lenguajes formales de planificación, un área donde los modelos generalistas fallan con frecuencia en la sintaxis PDDL. Sin embargo, se trata de un ajuste fino de autor individual, sin métricas publicadas, con cero descargas y cero likes en el momento de la consulta, por lo que su validación empírica queda pendiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion del ajuste (el modelo base Llama 3.1 soporta 128.000 tokens) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B: un transformer decoder-only con atención causal, normalización RMSNorm, activaciones SwiGLU y embeddings rotatorios (RoPE). El ajuste se presenta como un SFT (supervised fine-tuning) orientado a chain-of-thought para PDDL, según el nombre del repositorio y las etiquetas `pddl`, `planning` y `chain-of-thought`. No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas adicionales como RLHF o DPO.

Tampoco se documentan innovaciones técnicas propias del ajuste (por ejemplo, decodificación especulativa, atención lineal o variantes de atención). El modelo conserva la tokenización y el vocabulario del Llama 3.1 original, lo que facilita su integración con las herramientas estándar de transformers y text-generation-inference.

## Capacidades

- Generación de texto autoregresiva heredada de Llama 3.1 8B.
- Generación de PDDL: dominios y problemas de planificación a partir de descripciones, presumiblemente en lenguaje natural, gracias al ajuste específico.
- Razonamiento en cadena de pensamiento (chain-of-thought) orientado a la tarea de planificación, según el nombre y las etiquetas del modelo.
- Soporte de tool calling y function calling: no documentado para este ajuste (el modelo base Llama 3.1 lo soporta, pero no se confirma que el ajuste lo preserve).
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente, aunque el enfoque CoT sugiere cierto grado de razonamiento multi-paso en el dominio PDDL.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio, thinking mode explícito): no disponible.

## Casos de uso

- Traducción de lenguaje natural a PDDL: el modelo recibiría una descripción textual de un dominio (por ejemplo, logística, robot de almacén) y generaría el dominio PDDL correspondiente con predicados, acciones y precondiciones. Es el caso de uso central del ajuste.
- Generación de problemas PDDL a partir de escenarios: dado un estado inicial y un objetivo descritos en texto, el modelo produciría el fichero de problema PDDL para alimentar un planificador clásico como Fast Downward.
- Asistencia en investigación en planificación automática: investigadores podrían usar el modelo para generar borradores de dominios PDDL que luego validarían manualmente, acelerando la creación de benchmarks.
- Educación en IA y planificación: como herramienta didáctica para mostrar la correspondencia entre descripciones informales y representaciones formales PDDL, con la salvedad de que requiere verificación.
- Integración en pipelines de agentes LLM: el modelo podría actuar como módulo especializado de "formalización" dentro de un agente mayor que delega la planificación simbólica en un planificador externo.
- Prototipado de sistemas de planificación neuro-simbólica: combinación del modelo con validadores PDDL y planificadores para construir sistemas híbridos donde el LLM propone y el planificador verifica.
- Generación de código o texto general: al estar basado en Llama 3.1 8B, podría conservar capacidades generales, aunque no hay evidencia publicada de que el ajuste las preserve; su uso principal debería limitarse al dominio PDDL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, 18-20 GB o más según longitud de contexto.
- Cuantización a 8 bits: en torno a 8-9 GB de pesos; a 4 bits, en torno a 4-5 GB (estimaciones para un modelo de 8B; no se publican cuantizaciones oficiales).
- GPU recomendadas: A100 40/80 GB, H100, L40S para producción; RTX 4090 (24 GB) o RTX A6000 (48 GB) para fp16 en local.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en fp16 con contexto moderado, y en GPUs de 12-16 GB si se cuantiza a 8 o 4 bits (sin artefactos oficiales publicados).
- Opciones de despliegue: transformers, text-generation-inference (etiqueta `text-generation-inference` en el repo), endpoints compatibles; llama.cpp/Ollama requerirían conversión a GGUF, no disponible en el repo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-PDDL-CoT-SFT | 8,03 B | no disponible (base: 128k) | PDDL + CoT (SFT) | llama3.1 | Gated, 0 descargas |
| meta-llama/Llama-3.1-8B | 8,03 B | 128k | Generalista | llama3.1 | Publico (gated), muy extendido |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128k | Generalista con instrucciones | llama3.1 | Publico (gated), muy extendido |
| Modelos especializados en PDDL | no disponible | no disponible | PDDL | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sin benchmarks publicados: no hay evidencia cuantitativa de que el ajuste mejore al modelo base en generación de PDDL.
- Cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad.
- Acceso restringido (gated): requiere aceptar las condiciones de Hugging Face y de la licencia Llama 3.1, lo que puede limitar su uso en algunos entornos.
- Licencia Llama 3.1: impone restricciones de uso comercial (política de uso aceptable, obligaciones de atribución y límite de 700 millones de usuarios mensuales para licenciatarios que superen ese umbral).
- Riesgo de alucinación: como todo LLM, puede generar PDDL sintácticamente inválido o semánticamente incorrecto; se recomienda validación con un parser PDDL y un planificador.
- Idiomas soportados no documentados: no se puede garantizar un buen rendimiento fuera del inglés.
- Longitud de contexto del ajuste no documentada: aunque el modelo base soporta 128k tokens, no se confirma que el ajuste preserve esa ventana.
- Sesgos: heredados del corpus de entrenamiento de Llama 3.1; no se documentan mitigaciones específicas.
- Madurez: modelo de autor individual, sin paper, sin documentación de dataset ni de proceso de entrenamiento; adecuado para experimentación, no para producción sin evaluación previa.

## Enlaces

- Hugging Face: https://huggingface.co/cosmicishan/Llama-3.1-8B-PDDL-CoT-SFT
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/

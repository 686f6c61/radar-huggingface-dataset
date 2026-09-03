# CraneAILabs/edu-ganda-gemma-e2b-v5

## Resumen

edu-ganda-gemma-e2b-v5 es un checkpoint experimental de investigación desarrollado por Crane AI Labs, un laboratorio centrado en IA para el Sur Global. Se trata de un modelo de generación de texto especializado en asistencia educativa para educación primaria en luganda (idioma hablado en Uganda), construido mediante un merge SLERP (alpha 0.5) de dos checkpoints propios basados en Google Gemma-4-E2B: `a065_polished_v2` (con vocabulario luganda reparado) y `ganda-e2b-v4` (con mejor seguimiento de instrucciones). El objetivo es combinar la precisión en luganda del primero con la capacidad de seguir instrucciones del segundo.

El modelo tiene 5.525.831.235 parámetros (aproximadamente 5,5 mil millones) y está disponible en formato safetensors. Su licencia es Gemma, lo que permite uso comercial bajo las condiciones de dicha licencia. Es relevante porque aborda un idioma de bajos recursos (luganda) en un dominio crítico como la educación, aunque el propio autor lo califica como experimental y recomienda revisión antes de usos de alto riesgo. No se especifica la longitud de contexto en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Google Gemma-4-E2B (transformador; detalles de capas, atención y variantes MoE no disponibles) |
| Parametros totales | 5.525.831.235 |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors en bfloat16) |
| Idiomas soportados | Luganda (lg), ingles (en) |
| Licencia | Gemma |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un merge SLERP (Spherical Linear Interpolation) con alpha 0.5 entre dos checkpoints experimentales de Crane AI Labs basados en Gemma-4-E2B. El primero, `a065_polished_v2`, fue entrenado para reparar el vocabulario luganda (buen contenido en luganda pero débil seguimiento de instrucciones). El segundo, `ganda-e2b-v4` (publicado como `edu-ganda-gemma-e2b-v4`), tiene un seguimiento de instrucciones fuerte pero contenido luganda más débil. El merge busca combinar ambas fortalezas.

No se proporcionan detalles sobre el dataset de entrenamiento, número de tokens, ni si se usaron técnicas como RLHF, DPO o GRPO en los checkpoints base (aunque se menciona que el merge supera a intentos de finetuning con GRPO y SFT). El autor indica que este merge es el mejor resultado obtenido hasta la fecha entre todas las variantes probadas. El modelo requiere un guard de decodificación específico: `repetition_penalty=1.0` (desactivado) y `no_repeat_ngram_size=4` para evitar bucles de repetición.

## Capacidades

- Generación de texto conversacional en luganda e inglés, orientado a educación primaria.
- Seguimiento de instrucciones: 65,9% de adherencia (medida interna IF-adherence), frente al 40,9% del checkpoint base V2.
- Razonamiento matemático básico: 72% en el benchmark interno mn100 (matemáticas de 100 preguntas).
- Calidad de contenido en luganda: puntuación de 7,84/10 según un juez automático.
- No se menciona soporte de tool calling, function calling, agentes, visión ni audio.
- Capacidad multilingüe limitada a luganda e inglés, con salida preferentemente en luganda.

## Casos de uso

- Asistente de tareas escolares en luganda: el modelo puede explicar conceptos de matemáticas, ciencias o lengua en luganda, adaptado al nivel de primaria. Su seguimiento de instrucciones (65,9%) permite mantener el hilo de preguntas del estudiante.
- Práctica de lectura y escritura en luganda: genera textos cortos, cuentos o ejercicios de vocabulario en luganda, aprovechando su vocabulario reparado (puntuación de 7,84/10 en calidad luganda).
- Tutor de conversación bilingüe luganda-inglés: permite alternar entre ambos idiomas, útil en aulas donde el inglés es lengua de instrucción pero los alumnos hablan luganda en casa.
- Generación de material didáctico para docentes: el profesor puede pedir ejemplos, ejercicios o explicaciones en luganda para preparar clases, reduciendo el tiempo de creación de recursos.
- Evaluación formativa en entornos con pocos recursos: al ser un modelo de 5,5B, puede desplegarse en hardware modesto (una GPU de 12-16 GB) en escuelas o centros de formación sin infraestructura de gran escala.
- Prototipado de aplicaciones educativas para África Oriental: sirve como base para investigar y desarrollar asistentes educativos en idiomas de bajos recursos, aunque requiere revisión humana antes de producción.

## Benchmarks y rendimiento

La model card proporciona métricas internas comparando el merge v5 con el checkpoint base `a065_polished_v2`:

| Metrica | v5 (merge) | V2 (base) |
|---|---|---|
| Instruction-following (IF-adherence) | 65,9% | 40,9% |
| Judge task quality (/10) | 4,6 | 3,76 |
| Judge Luganda (/10) | 7,84 | 7,52 |
| Math (mn100) | 72% | 70,7% |
| Doom (repeticion) | menor que base | – |

Además, se indica una pérdida de calidad en traducción luganda→inglés: chrF aproximadamente −3,3 frente al base en el benchmark FLORES. No se han publicado resultados en benchmarks estándar externos (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 5,5B parámetros; en bfloat16 (formato del repo, 11,1 GB) requiere al menos 12-16 GB de VRAM para inferencia con contexto moderado. Con cuantización a 4 bits (no proporcionada oficialmente, pero posible con herramientas como llama.cpp o GPTQ) cabría en 6-8 GB.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB), A10 (24 GB), A100 (40/80 GB) o superiores. En consumer GPU, una RTX 4070 Ti Super (16 GB) o superior podría ejecutarlo en bfloat16 con limitaciones de contexto.
- Opciones de despliegue: transformers (código de ejemplo incluido en la model card), vLLM (si se convierte a formato compatible), llama.cpp (requiere conversión a GGUF), Ollama (si se empaqueta). No se proporcionan latencias ni throughput estimados.
- El guard de decodificación (`no_repeat_ngram_size=4`) es obligatorio para evitar bucles; debe configurarse en el servidor de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| edu-ganda-gemma-e2b-v5 (Crane) | 5,5B | No disponible | lg, en | Gemma | Merge experimental, educación primaria luganda |
| EduGanda-Gemma-3-1B (Crane) | 1B | No disponible | lg, en | Gemma | Modelo previo de 1B para alfabetización en Uganda |
| ganda-gemma-1b (Crane) | 1B | No disponible | lg, en | Gemma | Finetuning de Gemma 3 1B para traducción EN→LG |
| google/gemma-4-e2b-it (base) | No disponible | No disponible | Multilingue | Gemma | Modelo base sin especialización luganda |

No se dispone de comparativas con modelos externos de la misma categoría (asistentes educativos en idiomas africanos) en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo califica como "research checkpoint" y recomienda revisión antes de usos de alto riesgo.
- Traducción luganda→inglés degradada: chrF −3,3 frente al base en FLORES; no es adecuado para tareas de traducción de calidad.
- Seguimiento de instrucciones con guardia limitado: la métrica "guarded followed%" se satura alrededor del 44% (n=25), lo que sugiere que en escenarios con restricciones el rendimiento baja.
- Riesgo de bucles de repetición: requiere `no_repeat_ngram_size=4` obligatoriamente; sin este guard, el modelo puede entrar en repeticiones (doom).
- Sesgos y alucinaciones: no se han evaluado formalmente; al ser un modelo entrenado con datos limitados en luganda, puede producir contenido incorrecto o inventado, especialmente en temas especializados.
- Cobertura lingüística limitada: solo luganda e inglés; no cubre otros idiomas de África Oriental.
- Licencia Gemma: permite uso comercial, pero con restricciones de la licencia de Google (por ejemplo, no usar para ciertos fines prohibidos); revisar los términos completos.
- Sin garantías de producción: no hay evidencia de pruebas de robustez, seguridad ni sesgos; no recomendado para despliegue directo sin evaluación adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CraneAILabs/edu-ganda-gemma-e2b-v5
- Modelo base Gemma-4-E2B: https://huggingface.co/google/gemma-4-e2b-it (referenciado en la model card)
- Checkpoint hermano v4: https://huggingface.co/CraneAILabs/edu-ganda-gemma-e2b-v4
- Modelo previo EduGanda-Gemma-3-1B: https://huggingface.co/CraneAILabs/EduGanda-Gemma-3-1B
- Modelo ganda-gemma-1b: https://huggingface.co/CraneAILabs/ganda-gemma-1b
- Web de Crane AI Labs: https://craneailabs.com/
- Repositorio EduGanda en GitHub: https://github.com/AutoVision-cloud/EduGanda (README con contexto del proyecto)
- Documentación de Gemma (Google AI for Developers): https://ai.google.dev/gemma/docs/get_started

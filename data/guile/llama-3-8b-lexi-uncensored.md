# Guile/Llama-3-8B-Lexi-Uncensored

## Resumen

Llama-3-8B-Lexi-Uncensored es un modelo de lenguaje basado en Llama-3-8B-Instruct, ajustado por el usuario Guile (a partir del trabajo original de Orenguteng) para eliminar los mecanismos de censura y alineación del modelo base. El resultado es un modelo que responde con alta complianza a cualquier tipo de petición, incluida aquella que el modelo original rechazaría por considerarla poco ética o dañina. Está pensado para desarrolladores e investigadores que necesitan un LLM sin restricciones para tareas como escritura creativa, roleplay o investigación sobre alineación.

El modelo conserva la arquitectura transformer de Llama 3 con 8.030 millones de parámetros, y se distribuye en formato safetensors bajo la licencia de Meta Llama 3. No se especifica la longitud de contexto en la documentación, pero al derivar de Llama-3-8B-Instruct, hereda la ventana estándar de 8.192 tokens. Su relevancia actual radica en la demanda de modelos abiertos sin filtros para aplicaciones donde la censura del modelo base supone una limitación, aunque su uso conlleva riesgos importantes que se detallan más adelante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada de Llama-3-8B-Instruct, probablemente 8.192 tokens) |
| Tipos de cuantizacion | no disponible en el repo original; existen versiones GGUF de terceros (4.72 GB) |
| Idiomas soportados | no disponible (heredados de Llama 3, principalmente ingles) |
| Licencia | Llama 3 Community License (Meta) |
| Formato de pesos | safetensors (tambien existen GGUF de terceros) |

## Arquitectura y entrenamiento

El modelo parte de Llama-3-8B-Instruct, un transformer autoregresivo con 32 capas, 8.030 millones de parametros y atencion por ventanas de 8.192 tokens. El ajuste fino realizado por Orenguteng (y posteriormente republicado por Guile) elimina los mecanismos de rechazo y las restricciones de seguridad del modelo base, manteniendo intactas las capacidades de generacion y razonamiento. No se han publicado detalles sobre el dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas como RLHF o DPO. La model card indica que el modelo es "altamente complaciente" con cualquier peticion, incluso las poco eticas, lo que sugiere que el proceso de ajuste se centró en maximizar la obediencia sin filtros.

## Capacidades

- Generacion de texto libre y conversacional sin restricciones tematicas.
- Alta complianza con instrucciones, incluida la generacion de contenido explicito, violento o ilegal.
- Mantiene las capacidades base de Llama-3-8B-Instruct en razonamiento, comprension lectora y matematicas basicas.
- No se documenta soporte para tool calling, function calling, vision, audio ni modo de pensamiento.
- Capacidades multilingues limitadas al ingles (heredadas de Llama 3, sin confirmacion oficial).

## Casos de uso

- Escritura creativa sin limites: novelas, guiones o dialogos que aborden temas tabu o contenido explicito sin que el modelo se niegue a continuar.
- Roleplay avanzado: simulacion de personajes con personalidades extremas o situaciones controvertidas en entornos de juego narrativo.
- Investigacion sobre alineacion y seguridad: estudio de como responden los modelos sin filtros ante prompts maliciosos, util para desarrollar mejores tecnicas de mitigacion.
- Generacion de contenido para ficcion adulta: escritura de relatos eroticos o de terror sin las restricciones tipicas de los modelos comerciales.
- Evaluacion de sesgos y comportamientos: analisis de hasta que punto un modelo sin censura reproduce estereotipos o discursos de odio, para documentar riesgos.
- Prototipado rapido de chatbots sin moderacion: desarrollo de asistentes para entornos controlados donde se requiere total libertad de expresion, con la advertencia de implementar una capa de alineacion propia antes de exponerlos al publico.

## Benchmarks y rendimiento

Resultados declarados por el autor en el Open LLM Leaderboard (no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| Promedio | 66.18 |
| AI2 Reasoning Challenge (25-shot) | 59.56 |
| HellaSwag (10-shot) | 77.88 |
| MMLU (5-shot) | 67.68 |
| TruthfulQA (0-shot) | 47.72 |
| Winogrande (5-shot) | 75.85 |
| GSM8k (5-shot) | 68.39 |

Estos valores son practicamente identicos a los de Llama-3-8B-Instruct original, lo que indica que el proceso de "uncensoring" apenas degrada el rendimiento general. La puntuacion baja en TruthfulQA (47.72) sugiere que el modelo puede generar afirmaciones falsas con alta fluidez, un riesgo a tener en cuenta en aplicaciones reales.

## Requisitos de hardware

- VRAM estimada: unos 16 GB en FP16 (pesos de 17.7 GB), unos 8 GB en cuantizacion de 8 bits y entre 4 y 5 GB en cuantizacion de 4 bits.
- GPU recomendadas: RTX 3090 o 4090 para FP16; cualquier GPU con 6 GB o mas para versiones cuantizadas (por ejemplo, RTX 3060, RTX 4060).
- No cabe en GPUs de gama baja con menos de 4 GB de VRAM sin cuantizacion agresiva (2-3 bits) que degrada notablemente la calidad.
- Opciones de despliegue: vLLM, llama.cpp, Ollama (existen versiones GGUF de terceros), TGI o Transformers con accelerate.
- Latencia estimada: en una RTX 4090 con cuantizacion 4-bit, se pueden generar entre 50 y 80 tokens por segundo; en FP16, entre 30 y 50 tokens por segundo. No hay datos oficiales de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3-8B-Lexi-Uncensored | 8.03B | 8k (estimado) | 67.68 | Llama 3 | HuggingFace, GGUF |
| Llama-3-8B-Instruct (original) | 8.03B | 8k | 68.4 (aprox.) | Llama 3 | Oficial Meta |
| Dolphin 2.9 Llama 3 8B | 8.03B | 8k | no disponible | Llama 3 | HuggingFace |

La diferencia principal con el original no es el rendimiento, sino la ausencia de rechazos. Dolphin es otra alternativa "uncensored" con un enfoque similar, aunque no se dispone de benchmarks comparables en la informacion consultada.

## Limitaciones y advertencias

- El modelo no tiene capa de alineacion: puede generar contenido ilegal, violento, sexualmente explicito o discriminatorio sin restricciones.
- La model card advierte explicitamente que el usuario es responsable del contenido generado y que debe implementar su propia capa de alineacion antes de ofrecerlo como servicio.
- Riesgo elevado de alucinaciones: la puntuacion en TruthfulQA (47.72) indica que casi la mitad de las respuestas factuales pueden ser falsas.
- Sin soporte para idiomas distintos del ingles confirmado.
- La licencia Llama 3 permite uso comercial, pero el autor de este fine-tune no ofrece garantias legales sobre el contenido generado.
- No se proporcionan detalles sobre el dataset de entrenamiento ni sobre posibles sesgos introducidos durante el ajuste fino.
- El modelo conserva los sesgos del Llama-3-8B original, que pueden verse amplificados al no existir filtros de seguridad.

## Enlaces

- Repositorio HuggingFace del modelo (Guile): https://huggingface.co/Guile/Llama-3-8B-Lexi-Uncensored
- Repositorio original de Orenguteng: https://huggingface.co/Orenguteng/Llama-3-8B-Lexi-Uncensored
- Version alternativa de Andycurrent: https://huggingface.co/Andycurrent/Llama-3-8B-Lexi-Uncensored
- Version GGUF en Ollama: https://ollama.com/taozhiyuai/llama-3-8b-lexi-uncensored
- Guia de uso en Promptaa: https://www.promptaa.com/blog/llama-3-8-b-lexi-uncensored
- Pagina de descarga GGUF: https://local-ai-zone.github.io/models/lexi-llama-3-8b-uncensored.html
- Licencia de Meta Llama 3: https://llama.meta.com/llama3/license/

# InterpreticAI/Qwenputer-4B-Uncensored-v2

## Resumen

Qwenputer-4B-Uncensored-v2 es un checkpoint experimental publicado por InterpreticAI que fusiona un modelo de lenguaje Qwen3.5-4B-Uncensored-v2 con una CPU RISC-V de 32 bits compilada directamente dentro de los pesos. La innovación principal no reside en el modelo lingüístico, cuyos pesos permanecen inalterados, sino en la incorporación de 11 capas de computación (RV32IM + Zba + coprocesador bignum) situadas delante de las 32 capas del transformer, que ejecutan aritmética exacta dentro del propio forward pass. El resultado es un modelo de 9.357.602.496 parámetros totales y 18,7 GB en BF16, la mayor parte relleno de ceros.

La relevancia de esta ficha es doble: por un lado, documenta una técnica poco habitual de embeber hardware simbólico en los pesos de una red neuronal; por otro, sirve de referencia para quien evalúe modelos "uncensored" orientados a preguntas políticamente sensibles. El modelo base es un Qwen3.5-4B sin el alineamiento político original, y este checkpoint conserva ese comportamiento sin cambios, según las mediciones del autor.

El modelo es solo texto (no incluye el codificador visual del base), se distribuye bajo licencia Apache 2.0 y requiere un driver específico (Qwenputer chat) para activar la computadora; cargado como `Qwen3_5ForCausalLM` estándar se comporta como el modelo base en texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stock `Qwen3_5ForCausalLM` (solo texto) con 11 capas de computadora RISC-V (RV32IM + Zba + coprocesador bignum) antepuestas a las 32 capas del LM |
| Parametros totales | 9.357.602.496 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la evaluación política del autor solo cubre chino) |
| Licencia | Apache 2.0 (código Qwenputer bajo MIT) |
| Formato de pesos | safetensors (BF16) |

Otros datos técnicos: hidden size 3.968 (2.560 del LM más las dimensiones de la computadora); vocabulario de 478.656 tokens (vocabulario base más 230.324 tokens de traza); tamaño del repo 18,8 GB. Modelo base: InterpreticAI/Qwen3.5-4B-Uncensored-v2 (relación: merge).

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Uncensored-v2, un transformer decoder-only de la familia Qwen3.5 con 32 capas y hidden size de 2.560, cuyos pesos no se modifican. Sobre él se aplica la herramienta de fusión Qwenputer (commit `bec1a0c9`) del proyecto de Divyansh Agrawal, que compila una CPU RISC-V de 32 bits y la inserta en 11 capas delanteras. La computadora ejecuta instrucciones RV32IM con extensión Zba y un coprocesador de aritmética de precisión arbitraria, y produce resultados exactos dentro del forward pass sin invocar herramientas externas.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. La innovación técnica destacable es precisamente el mecanismo de "computadora en los pesos": el modelo emite una llamada a herramienta `calc` y las capas RISC-V calculan el resultado en el propio paso de inferencia. El vocabulario se amplía con 230.324 tokens de traza para representar el estado interno de la máquina. La computadora solo se activa bajo el driver de chat de Qwenputer, que carga el firmware en el estado del modelo tras el prompt.

## Capacidades

- Generación de texto conversacional y razonamiento general, heredados del modelo base Qwen3.5-4B.
- Aritmética entera exacta mediante la computadora RISC-V embebida: el modelo emite una llamada `calc` y las capas de computación producen el resultado dentro del forward pass, sin herramienta externa.
- Soporte de tool calling limitado a la herramienta `calc` gestionada por el driver Qwenputer (no se documenta un soporte general de function calling).
- Comportamiento "uncensored" en preguntas políticas, equivalente al del modelo base según las mediciones de divergencia KL del autor.
- Modo no-thinking documentado en la evaluación política (hasta 512 tokens de respuesta).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Sin visión: el codificador visual del base no está incluido.

## Casos de uso

- Verificación aritmética en pipelines de datos: el modelo puede calcular productos y operaciones enteras grandes de forma exacta dentro del forward pass, útil para validar cálculos en procesos ETL o auditorías numéricas donde un LLM convencional fallaría.
- Investigación sobre computación simbólica en redes neuronales: sirve como banco de pruebas reproducible para estudiar cómo se comporta un modelo con hardware emulado embebido y medir la fidelidad del texto (divergencia KL frente al base).
- Evaluación de censura política en LLM: al conservar el comportamiento del base sin alineamiento político, es adecuado para estudios comparativos tipo Pan & Xu (2026) sobre respuestas a preguntas sensibles en chino.
- Educación e investigación en arquitecturas RISC-V: permite experimentar con un RV32IM + Zba + bignum integrado en un transformer sin necesidad de simular el hardware por separado.
- Pruebas de robustez numérica: útil para comparar la tasa de acierto en aritmética exacta frente al mismo modelo sin computadora (29/40 vs. 40/40 en el arnés del autor).
- Docencia sobre tool calling implícito: ejemplifica un patrón en el que la "herramienta" vive en los pesos en lugar de en un servicio externo, útil para explicar límites y ventajas de ambos enfoques.

## Benchmarks y rendimiento

| Prueba | Modelo | Resultado |
|---|---|---|
| Aritmética entera exacta (40 problemas sintéticos, greedy) | Qwen3.5-4B-Uncensored-v2 sin herramientas, instruido para calcular exacto | 29/40 correctos |
| Aritmética entera exacta (40 problemas sintéticos, greedy) | Qwenputer-4B-Uncensored-v2 | 40/40 correctos |
| Fidelidad de texto (KL media) | Qwenputer-4B-Uncensored-v2 vs. Qwen3.5-4B-Uncensored-v2 | 5,2 × 10⁻⁴ |
| Suelo de ruido (KL media) | Mismo modelo con distinto kernel de atención | 5,0 × 10⁻⁴ |
| Preguntas políticas (Pan & Xu, 2026) | Diferencia mediana de tokens entre modelos | token 52 (vs. token 49 del suelo de ruido) |

La computadora coincidió con un modelo de referencia de la máquina en cada posición (0 errores de lockstep, 0 discrepancias de cabeza) y pasan las tres comprobaciones de chat integradas del repositorio Qwenputer. No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 18,7 GB en BF16, por lo que la inferencia en precisión completa requiere al menos ~20 GB de VRAM (más overhead de activaciones y del firmware). No se documentan cuantizaciones oficiales.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, un A100 40 GB, H100 o L40S pueden alojarlo en BF16; una RTX 4090 de 24 GB queda al límite y probablemente requiera cuantización no publicada.
- Cabe en GPU de consumo: incierto en BF16; con cuantización a 8 bits o inferior podría caber en GPUs de 16-24 GB, pero no se ofrecen pesos cuantizados.
- Despliegue: requiere el driver de chat de Qwenputer (`github.com/divagr18/qwenputer`, `experimental/riscv`, `uv sync --extra hf`) para activar la computadora. Cargado como `Qwen3_5ForCausalLM` estándar en transformers funciona como modelo de texto sin la computadora. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Aritmética exacta | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwenputer-4B-Uncensored-v2 | 9.357.602.496 (incluye relleno) | no disponible | Sí, vía computadora RISC-V embebida (40/40) | Apache 2.0 | Hugging Face |
| Qwen3.5-4B-Uncensored-v2 | no disponible | no disponible | No (29/40) | Apache 2.0 (heredada) | Hugging Face |
| Qwen/Qwen3.5-4B | no disponible | no disponible | No documentado | Apache 2.0 | Hugging Face |
| Qwenputer (original, divagr1925) | no disponible | no disponible | Sí, computadora embebida | Apache 2.0 / MIT | Hugging Face |

No se dispone de datos de benchmarks estándar (MMLU, HumanEval, GSM8K) para ninguno de los modelos comparados en la información proporcionada, por lo que la comparación se limita a arquitectura, licencia y la prueba de aritmética exacta del autor.

## Limitaciones y advertencias

- Solo texto: el codificador visual de Qwen3.5-4B-Uncensored-v2 no está incluido.
- Hereda las limitaciones del modelo base, incluida una tasa de hechos fabricados superior a la de Qwen3.5-4B; una respuesta sustantiva no implica que sea correcta.
- La evaluación política cubre únicamente preguntas en chino; no hay validación en otros idiomas.
- La computadora solo funciona bajo el driver Qwenputer; cargado de forma estándar, el modelo no calcula de forma exacta.
- El checkpoint es mayoritariamente relleno de ceros (18,7 GB en BF16 para un LM de 4B), lo que encarece el almacenamiento y la carga.
- No se publican cuantizaciones, por lo que el despliegue en GPUs de consumo es problemático.
- Riesgo de alucinación no mitigado respecto al base; el modo "uncensored" puede producir contenido políticamente sensible o inexacto.
- Licencia Apache 2.0 permite uso comercial, pero el código Qwenputer es MIT y debe conservarse la atribución al equipo Qwen y a Divyansh Agrawal.
- No hay datos sobre sesgos específicos, latencia en producción ni estabilidad del driver en entornos multiinquilino.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/InterpreticAI/Qwenputer-4B-Uncensored-v2
- Modelo base: https://huggingface.co/InterpreticAI/Qwen3.5-4B-Uncensored-v2
- Qwen3.5-4B original: https://huggingface.co/Qwen/Qwen3.5-4B
- Qwenputer original: https://huggingface.co/divagr1925/Qwen3.5-4B-Qwenputer
- Repositorio Qwenputer: https://github.com/divagr18/qwenputer
- DOI del checkpoint: https://doi.org/10.57967/hf/11550
- Referencia Pan & Xu (2026): https://doi.org/10.1093/pnasnexus/pgag013

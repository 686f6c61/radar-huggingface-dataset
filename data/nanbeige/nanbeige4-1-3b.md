# Nanbeige/Nanbeige4.1-3B

## Resumen

Nanbeige4.1-3B es un modelo de lenguaje de 3.933.637.120 parametros (aproximadamente 3,9B) desarrollado por Nanbeige, construido sobre el modelo base Nanbeige4-3B-Base y refinado mediante una iteracion posterior de su predecesor de razonamiento, Nanbeige4-3B-Thinking-2511. Se ha optimizado con ajuste supervisado (SFT) y aprendizaje por refuerzo (RL) para combinar razonamiento, alineacion de preferencias y comportamiento agentico en un unico modelo compacto.

Su relevancia actual radica en que demuestra que un modelo de escala pequena puede sostener razonamiento de multiples pasos, alineacion robusta y tareas de busqueda profunda (deep-search) con mas de 500 rondas de invocacion de herramientas. Segun la model card, supera a modelos de su misma escala como Qwen3-4B-2507 y, en varios benchmarks, a modelos sustancialmente mayores como Qwen3-30B-A3B y Qwen3-32B.

El modelo se distribuye bajo licencia Apache 2.0, con soporte para ingles y chino, en formato safetensors y compatible con la libreria transformers. La informacion publicada no detalla la longitud de contexto ni los tipos de cuantizacion disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (segun el tag del repositorio; no se detalla en la informacion disponible) |
| Parametros totales | 3.933.637.120 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Nanbeige4.1-3B parte del modelo base Nanbeige4-3B-Base y se presenta como una evolucion del modelo de razonamiento Nanbeige4-3B-Thinking-2511. El entrenamiento posterior combina ajuste supervisado (SFT) y aprendizaje por refuerzo (RL). La model card no especifica el numero de tokens utilizados, la composicion exacta del dataset ni los metodos concretos de alineacion (por ejemplo, si se empleo DPO), por lo que esos datos no estan disponibles.

El modelo esta disenado para resolver problemas de multiples pasos dentro de un unico forward pass, con el objetivo de lograr simultaneamente razonamiento solido, alineacion de preferencias y comportamiento agentico. Destaca como el primer modelo general de escala pequena que soporta de forma nativa tareas de busqueda profunda y que puede sostener de forma fiable procesos de resolucion de problemas con mas de 500 rondas de invocacion de herramientas. No se han publicado en la informacion disponible detalles adicionales sobre innovaciones tecnicas internas (atencion linear, decodificacion especulativa, etc.).

## Capacidades

- Generacion de texto y razonamiento de multiples pasos en un solo forward pass.
- Codigo: obtencion de resultados competitivos en benchmarks como Live-Code-Bench-V6, Live-Code-Bench-Pro-Easy y Live-Code-Bench-Pro-Medium.
- Matematicas: resolucion de problemas de competicion (AIME 2026 I, HMMT Nov, IMO-Answer-Bench).
- Ciencia: evaluacion en GPQA y HLE (solo texto).
- Alineacion de preferencias: resultados en Arena-Hard-v2 y Multi-Challenge.
- Uso de herramientas (tool calling / function calling): evaluado con BFCL-V4 y Tau2-Bench.
- Capacidad agentica: soporte nativo de tareas de busqueda profunda (deep-search) y mantenimiento de mas de 500 rondas de invocacion de herramientas.
- Capacidades multilingues limitadas a ingles y chino segun la informacion disponible.
- No se documentan capacidades de vision o audio.

## Casos de uso

- Agentes de busqueda profunda: el modelo puede ejecutar flujos de investigacion con multiples rondas de consulta e invocacion de herramientas, gracias a su soporte nativo de deep-search y a la sostenibilidad de mas de 500 llamadas consecutivas.
- Asistentes con tool calling en produccion: al estar evaluado en BFCL-V4 y Tau2-Bench, puede integrarse en pipelines que requieran llamadas a funciones externas, APIs o bases de datos.
- Generacion de codigo asistida: su rendimiento en Live-Code-Bench-Pro lo hace adecuado para tareas de completado y resolucion de problemas de programacion de dificultad media.
- Resolucion de problemas matematicos de competicion: util para entornos educativos o de investigacion que requieran pasos de razonamiento matematico verificables.
- Razonamiento cientifico: aplicable a preguntas de nivel experto (GPQA, HLE) en contextos academicos o de divulgacion tecnica.
- Despliegue en entornos con recursos limitados: con cerca de 3,9B de parametros y licencia Apache 2.0, puede desplegarse en infraestructura de gama media o en la nube (el repositorio incluye compatibilidad con endpoints y despliegue en Azure).
- Sistemas conversacionales en ingles y chino: orientado a asistentes multi-turno en esos dos idiomas.

## Benchmarks y rendimiento

Resultados de razonamiento general publicados en la model card:

| Benchmark | Qwen3-4B-2507 | Qwen3-8B | Qwen3-14B | Qwen3-32B | Qwen3-30B-A3B-2507 | Nanbeige4-3B-2511 | Nanbeige4.1-3B |
|---|---|---|---|---|---|---|---|
| Live-Code-Bench-V6 | 57,4 | 49,4 | 55,9 | 55,7 | 66,0 | 46,0 | 76,9 |
| Live-Code-Bench-Pro-Easy | 40,2 | 41,2 | 33,0 | 42,3 | 60,8 | 40,2 | 81,4 |
| Live-Code-Bench-Pro-Medium | 5,3 | 3,5 | 1,8 | 3,5 | 3,5 | 5,3 | 28,1 |
| AIME 2026 I | 81,46 | 70,42 | 76,46 | 75,83 | 87,30 | 84,1 | 87,40 |
| HMMT Nov | 68,33 | 48,33 | 56,67 | 57,08 | 71,25 | 66,67 | 77,92 |
| IMO-Answer-Bench | 48,00 | 36,56 | 41,81 | 43,94 | 54,34 | 38,25 | 53,38 |
| GPQA | 65,8 | 62,0 | 63,38 | 68,4 | 73,4 | 82,2 | 83,8 |
| HLE (Text-only) | 6,72 | 5,28 | 7,00 | 9,31 | 11,77 | 10,98 | 12,60 |
| Arena-Hard-v2 | 34,9 | 26,3 | 36,9 | 56,0 | 60,2 | 60,0 | 73,2 |
| Multi-Challenge | 41,14 | 36,30 | 36,97 | 38,72 | 49,40 | 41,20 | 52,21 |
| BFCL-V4 | 44,87 | 42,20 | 45,14 | 47,90 | 48,6 | 53,8 | 56,50 |
| Tau2-Bench | 45,9 | 42,06 | 44,96 | 45,26 | 47,70 | 41,77 | 48,57 |

Benchmarks de busqueda profunda y agentes (tabla parcial; la informacion proporcionada esta truncada):

| Modelo | xBench-DeepSearch-2505 | xBench-DeepSearch-2510 | Browse-Comp | Browse-Comp-ZH | GAIA (Text-only) | HLE | SEAL-0 |
|---|---|---|---|---|---|---|---|
| MiroThinker-v1.0-8B | 61 | – | 31,1 | 40,2 | 66,4 | 21,5 | 40,4 |
| AgentCPM-Explore-4B | 70 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card indica que Nanbeige4.1-3B alcanza un rendimiento de busqueda profunda comparable a agentes especializados por debajo de 10B de parametros. La tabla completa con los resultados de Nanbeige4.1-3B en esta categoria no esta disponible en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia (valores orientativos segun el numero de parametros, no confirmados por el autor): aproximadamente 8 GB en FP16, cerca de 4-5 GB en cuantizacion de 8 bits y en torno a 2,5-3 GB en 4 bits.
- GPU recomendadas: para FP16, GPU con 8-16 GB de VRAM (por ejemplo, RTX 4090, A10G). Para cuantizaciones de menor precision, GPU de consumo como RTX 3060/4060 con 8 GB o superiores podrian ser suficientes, aunque no hay confirmacion oficial.
- Cabe en GPU de consumo: probablemente si, en cuantizaciones de 8 o 4 bits, dado el tamano de aproximadamente 3,9B de parametros. No confirmado en la informacion disponible.
- Opciones de despliegue: el repositorio declara compatibilidad con transformers y text-generation-inference, ademas de endpoints compatibles y despliegue en Azure. El soporte de vLLM, llama.cpp u Ollama no se confirma en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento destacado (referencia) |
|---|---|---|---|---|
| Nanbeige4.1-3B | 3,93B | no disponible | apache-2.0 | Live-Code-Bench-V6 76,9; GPQA 83,8; Arena-Hard-v2 73,2 |
| Qwen3-4B-2507 | 4B | no disponible | no disponible | Live-Code-Bench-V6 57,4; GPQA 65,8; Arena-Hard-v2 34,9 |
| Qwen3-8B | 8B | no disponible | no disponible | Live-Code-Bench-V6 49,4; GPQA 62,0; Arena-Hard-v2 26,3 |
| Qwen3-30B-A3B-2507 | 30B (MoE) | no disponible | no disponible | Live-Code-Bench-V6 66,0; GPQA 73,4; Arena-Hard-v2 60,2 |

La model card situa a Nanbeige4.1-3B por encima de Qwen3-4B-2507 y, en varios benchmarks, por encima de Qwen3-30B-A3B-2507 y Qwen3-32B. Los datos de contexto y licencia de los modelos comparados no se detallan en la informacion proporcionada.

## Limitaciones y advertencias

- Idiomas: solo se declaran ingles y chino; no se garantiza un rendimiento equivalente en otros idiomas como el castellano.
- Riesgo de alucinacion: no se documenta de forma explicita en la informacion disponible; como en cualquier modelo generativo, existe riesgo inherente de respuestas incorrectas.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion proporcionada.
- Longitud de contexto: no disponible, lo que dificulta planificar despliegues con entradas muy largas.
- Cuantizaciones: no se detallan los formatos soportados, lo que puede complicar el despliegue en hardware limitado.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar el repositorio y el informe tecnico por si existen condiciones adicionales.
- Rendimiento de busqueda profunda: la tabla comparativa publicada esta incompleta en la informacion disponible, por lo que no puede verificarse de forma independiente la comparacion con agentes especializados.
- Caveat de produccion: no se documentan tasas de error, comportamiento en contextos largos ni degradacion tras muchas rondas de tool calling mas alla de la afirmacion del autor.

## Enlaces

- HuggingFace: https://huggingface.co/Nanbeige/Nanbeige4.1-3B
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4-3B-Base
- Informe tecnico (arXiv): https://arxiv.org/abs/2602.13367

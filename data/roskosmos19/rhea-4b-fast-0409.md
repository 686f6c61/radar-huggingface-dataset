# roskosmos19/Rhea-4B-fast-0409

`
- Soporte de agentes y multi-step reasoning
- No se menciona visión ni audio explícitamente (los tokens de visión se eliminaron)
- Multilingüe: no disponible (aunque Qwen3-4B es multilingüe, pero no se especifica)

Casos de uso: mínimo 6, concretos y realistas. Basado en lo que dice el modelo: coding, agentic tasks, tool calling, single-pass reasoning, eficiencia en VRAM.

Benchmarks: No se han publicado resultados de benchmarks en la información disponible. No inventar.

Requisitos de hardware:
- VRAM estimada: para 4B, con Q4_K_M, podría caber en ~3-4 GB. Pero no hay datos exactos. Puedo estimar razonablemente: un modelo 4B en FP16 ocupa ~8 GB, en Q4_K_M ~3 GB. Como el repo es 8.1 GB, probablemente contiene pesos en FP16 o BF16. Puedo decir que con cuantización Q4_K_M cabe en GPUs de consumo con 6-8 GB VRAM.
- GPU recomendadas: RTX 3060 12GB, RTX 4090, A100, etc.
- Opciones de despliegue: vLLM, SGLang, llama.cpp, Ollama, TGI, transformers
- Latencia: no disponible

Comparativa con modelos similares: Rhea-4B-Coding, Rhea-4B original, Qwen3-4B base. Puedo comparar con Qwen3-4B y Rhea-4B-Coding.

Limitaciones:
- Contexto reducido a 32k (menos que el original 262k)
- No se mencionan sesgos, pero riesgo de alucinación
- Idiomas no especificados
- Licencia Apache 2.0 permite uso comercial
- No hay benchmarks publicados
- Puede no ser adecuado para tareas que requieran contexto muy largo
- La línea Athenea/Rhea puede tener peculiaridades no documentadas

Enlaces:
- HuggingFace del modelo
- Rhea-4B original
- Rhea-4B-Coding

Debo tener cuidado con no inventar. Para la tabla de especificaciones, "Parametros totales" puedo poner "4 000 millones (4B)" pero si no se sabe exacto, "4B (no disponible el valor exacto)". Mejor "4B (aprox.)" o "no disponible". El README dice "Qwen3ForCausalLM (4B)", así que puedo decir "4 000 millones (4B)". Pero no sé si son 4B exactos. Es común que Qwen3-4B tenga 4.02B. No inventemos, pongamos "4B".

"Parametros activos": solo si es MoE. No es MoE, así que no aplica. Puedo omitir la fila o poner "No aplica (modelo denso)". La instrucción dice "solo si es MoE", así que no la pongo.

"Tipos de cuantizacion": El README recomienda Q4_K_M / AWQ. También se menciona Q5_K_M. Puedo decir "Q4_K_M, Q5_K_M, AWQ (recomendados)". No se mencionan otros, así que "no disponible" para más.

"Idiomas soportados": no disponible.

"Formato de pesos": safetensors (según tags), y también compatible con GGUF (llama.cpp). El formato de pesos en el repo es safetensors. Puedo decir "safetensors (también compatible con GGUF mediante cuantización)".

"Longitud de contexto": 32 768 tokens.

"Licencia": Apache 2.0.

Ahora, para la sección de arquitectura y entrenamiento: 
- Arquitectura: Qwen3ForCausalLM, transformer causal decoder-only.
- Optimizado para agente y código.
- Single-pass reasoning con opción de ``. El autor ha eliminado la generación mínima forzada de tokens, ha reducido el contexto de 262 000 a 32 768 tokens y ha simplificado los tokens especiales, dejando solo los de herramientas y pensamiento. Los parámetros de generación recomendados son temperatura 0.4, top_p 0.9, top_k 30 y repetición 1.05. No se ha publicado información sobre los datos de entrenamiento, el número de tokens ni el uso de RLHF o DPO."

Eso es correcto.

En "Capacidades", lista de viñetas:
- Generación de texto y código con razonamiento opcional.
- Tool calling / function calling con formato limpio y fiable.
- Soporte de agentes y razonamiento multi-paso.
- Pensamiento explícito con `` cuando el modelo lo considera útil.
- No incluye capacidades de visión ni audio (los tokens de visión fueron eliminados).
- Multilingüe: no especificado en la información disponible.

En "Casos de uso", mínimo 6. Voy a hacer 7.

1. Asistente de programación en entornos de desarrollo: el modelo puede generar funciones seguras y eficientes, revisar código y explicar algoritmos, gracias a su entrenamiento en tareas de codificación.
2. Agentes de automatización de tareas: con su soporte de tool calling, puede integrarse en pipelines que ejecutan acciones como leer archivos, consultar APIs o modificar repositorios.
3. Soporte técnico especializado: responde consultas de usuarios con razonamiento en un solo paso, reduciendo la latencia en comparación con versiones multi-paso.
4. Generación de scripts para CI/CD: puede producir scripts de integración continua y analizar errores de compilación.
5. Análisis y depuración de logs: dado su enfoque en código, puede interpretar trazas de errores y sugerir correcciones.
6. Chatbot de documentación técnica para desarrolladores: puede mantener conversaciones largas dentro de su ventana de 32 768 tokens.
7. Extracción de información mediante herramientas: combina el razonamiento con llamadas a funciones para consultar bases de datos o servicios externos.

Cada uno con su explicación.

En "Benchmarks y rendimiento": "No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas de MMLU, HumanEval, GSM8K ni comparativas numéricas."

En "Requisitos de hardware":
- VRAM estimada: con cuantización Q4_K_M, aproximadamente 3-4 GB; con pesos en BF16/FP16, alrededor de 8 GB (el repositorio ocupa 8.1 GB). Para inferencia con contexto de 32k, se recomienda al menos 8 GB de VRAM.
- GPU recomendadas: RTX 3060 12GB, RTX 4060 Ti 16GB, RTX 4090, A100 40GB, H100.
- Cabe en GPUs de consumo con 8 GB o más de VRAM usando Q4_K_M.
- Opciones de despliegue: vLLM, SGLang (con `--max-model-len 32768`), llama.cpp (con Q4_K_M o Q5_K_M), Ollama, TGI y transformers.
- Latencia y throughput: no disponibles.

En "Comparativa con modelos similares": tabla comparando con Rhea-4B original, Rhea-4B-Coding y Qwen3-4B base.

| Modelo | Parámetros | Contexto | Razonamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rhea-4B-fast-0409 | 4B | 32 768 | Single-pass + opcional | Apache 2.0 | HuggingFace |
| Rhea-4B original | 4B | 262 000 | Forzado 3 pasos | Apache 2.0 | HuggingFace |
| Rhea-4B-Coding | 4B | 262 000 | Forzado 3 pasos | Apache 2.0 | HuggingFace |
| Qwen3-4B | 4B | 32 768 (o más) | No especificado | Apache 2.0 | HuggingFace |

No sé si Qwen3-4B tiene 32k o más. No inventemos. Mejor poner "no disponible" para Qwen3-4B. O puedo omitir Qwen3-4B si no estoy seguro. La instrucción dice comparar con 2-3 alternativas de la misma categoría. Puedo usar los tres modelos de la línea Rhea. Mejor comparar con Rhea-4B original y Rhea-4B-Coding, y quizás Qwen3-4B como base. Para Qwen3-4B, el contexto típico es 32k, pero no está en la información. Podría decir "no disponible". Pero para no inventar, pongo "no disponible" en contexto para Qwen3-4B. Aunque es conocido que Qwen3-4B tiene 32k, pero la regla es no inventar datos. Mejor no incluir Qwen3-4B si no tengo datos confirmados. En su lugar, comparo con Rhea-4B original y Rhea-4B-Coding, que están en la información. También podría mencionar Athenea, pero no hay datos.

Así que tabla con Rhea-4B original, Rhea-4B-Coding y Rhea-4B-fast-0409.

En "Limitaciones y advertencias":
- Contexto reducido a 32 768 tokens, significativamente menor que los 262 000 del Rhea-4B original, lo que limita tareas que requieren ventanas muy largas.
- No se han publicado benchmarks, por lo que el rendimiento real frente a otros modelos no está verificado.
- Los idiomas soportados no están especificados; el modelo podría comportarse de forma desigual en lenguas distintas del inglés o el español.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de razonamiento complejo.
- No hay información sobre sesgos conocidos ni medidas de mitigación.
- Para producción, el autor recomienda mantener el contexto entre 16k y 24k para un equilibrio óptimo entre velocidad y consumo de VRAM.
- No dispone de capacidades de visión ni audio.

En "Enlaces":
- https://huggingface.co/roskosmos19/Rhea-4B-fast-0409
- https://huggingface.co/roskosmos19/Rhea-4B
- https://huggingface.co/roskosmos19/Rhea-4B-Coding

No hay papers ni blogs en la información. Solo esos enlaces.

Ahora, reviso que no haya faltas de ortografía. En castellano de España, "cuantización" (con z) es correcto en España? La RAE prefiere "cuantización" (con z) en España, mientras que en Latinoamérica se usa "cuantización" también. La palabra es "cuantización" (de cuantizar). Es correcto. "Despliegue" correcto. "Tamaño" correcto. "Agéntico" correcto. "Código" con tilde. "Razonamiento" correcto. "Contexto" correcto.

Cuidado con "técnicas" en el encabezado: "Especificaciones tecnicas" - la regla dice solo la primera palabra en mayúscula, así que "tecnicas" sin tilde? No, la tilde es ortográfica, no afecta a la mayúscula. Debe ser "Especificaciones técnicas" con tilde en "técnicas". La primera palabra "Especificaciones" en mayúscula, el resto en minúscula. La tilde se mantiene. Así que "## Especificaciones técnicas".

"Arquitectura y entrenamiento" - "y" minúscula.

"Benchmarks y rendimiento" - "y" minúscula.

"Requisitos de hardware" - "de" minúscula.

"Comparativa con modelos similares" - "con" minúscula.

"Limitaciones y advertencias" - "y" minúscula.

Todo correcto.

Una cosa: el README dice "Rhea-4B-Agentic" en el título, pero el repo es "Rhea-4B-fast-0409". En el resumen, puedo decir "Rhea-4B-fast-0409, también denominado Rhea-4B-Agentic en la model card". Esto aclara la confusión.

En la tabla de especificaciones, "Formato de pesos": "safetensors". Los tags incluyen "safetensors". También se menciona llama.cpp, así que GGUF es posible. Pero el formato de pesos en el repo es safetensors. Pondré "safetensors (compatible con GGUF mediante cuantización)".

En "Tipos de cuantizacion": "Q4_K_M, Q5_K_M, AWQ (recomendados por el autor)". No hay más datos.

En "Parametros activos": como no es MoE, pongo "No aplica (modelo denso)".

Ahora, voy a redactar la ficha completa.

Debo asegurarme de que el texto sea claro y riguroso. No usar frases vacías.

Voy a escribirla.## Resumen

Rhea-4B-fast-0409 es un modelo de lenguaje de 4 000 millones de parámetros desarrollado por roskosmos19, basado en Qwen3-4B y optimizado para tareas de codificación y uso agéntico. En la model card se le denomina también Rhea-4B-Agentic, y se presenta como un sucesor optimizado de la línea Rhea-4B-Coding / Athenea. El problema que resuelve es el alto coste y la latencia de los modelos anteriores de la misma familia, que forzaban un razonamiento en tres pasos completos. Esta versión utiliza un único paso de generación con un bloque de pensamiento opcional, lo que reduce significativamente el tiempo y la VRAM necesarios.

La arquitectura es Qwen3ForCausalLM, un transformer causal decoder-only de 4B, con una ventana de contexto de 32 768 tokens. El modelo está pensado para integrarse en pipelines de agentes, con soporte de tool calling y razonamiento multi-paso. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificación. El repositorio de HuggingFace ocupa 8.1 GB e incluye pesos en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer causal decoder-only) |
| Parametros totales | 4 000 millones (4B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32 768 tokens |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, AWQ (recomendados por el autor) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con GGUF mediante cuantizacion) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura Qwen3ForCausalLM, un transformer causal decoder-only de 4 000 millones de parámetros, heredada de Qwen3-4B. La principal innovación respecto a la línea anterior es la eliminación del razonamiento forzado en tres pasos (implementar, revisar, final). En esta versión, el modelo genera una única pasada y puede emitir un bloque de pensamiento delimitado por `` cuando lo considera útil. También se han eliminado los tokens especiales rotos y los tokens de visión, dejando solo los de herramientas y pensamiento. El autor ha reducido la ventana de contexto de 262 000 a 32 768 tokens, ha eliminado la generación mínima forzada de tokens y ha ajustado los parámetros por defecto a temperatura 0.4, top_p 0.9, top_k 30 y repetición 1.05. No se ha publicado información sobre los datos de entrenamiento, el número de tokens ni el uso de RLHF o DPO.

## Capacidades

- Generacion de texto y codigo con razonamiento opcional.
- Soporte de tool calling / function calling con un formato limpio y fiable.
- Capacidades agenticas: puede participar en flujos multi-paso y encadenar llamadas a herramientas.
- Pensamiento explicito mediante ``, activado de forma opcional por el propio modelo.
- Sin capacidades de vision ni audio (los tokens de vision fueron eliminados).
- Idiomas soportados: no especificados en la informacion disponible.

## Casos de uso

- Asistente de programacion en entornos de desarrollo: el modelo puede generar funciones seguras y eficientes, revisar codigo y explicar algoritmos, gracias a su entrenamiento en tareas de codificacion y a su razonamiento en un solo paso.
- Agentes de automatizacion de tareas: con su soporte de tool calling, puede integrarse en pipelines que ejecutan acciones como leer archivos, consultar APIs o modificar repositorios, reduciendo la latencia frente a versiones multi-paso.
- Soporte tecnico especializado: responde consultas de usuarios con razonamiento opcional, manteniendo conversaciones largas dentro de su ventana de 32 768 tokens.
- Generacion de scripts para CI/CD: puede producir scripts de integracion continua y analizar errores de compilacion, gracias a su enfoque en codigo y su formato de salida limpio.
- Analisis y depuracion de logs: interpreta trazas de errores y sugiere correcciones, aprovechando su capacidad para razonar sobre fragmentos de codigo.
- Chatbot de documentacion tecnica para desarrolladores: puede mantener conversaciones multi-turno con contexto largo y responder preguntas sobre APIs y frameworks, usando su formato de herramientas si es necesario.
- Extraccion de informacion mediante herramientas: combina el razonamiento con llamadas a funciones para consultar bases de datos o servicios externos, lo que lo hace adecuado para tareas de RAG y automatizacion de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas de MMLU, HumanEval, GSM8K ni comparativas numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada: con cuantizacion Q4_K_M, aproximadamente 3-4 GB; con pesos en BF16/FP16, alrededor de 8 GB (el repositorio ocupa 8.1 GB). Para inferencia con contexto de 32 768 tokens se recomienda al menos 8 GB de VRAM.
- GPU recomendadas: RTX 3060 12GB, RTX 4060 Ti 16GB, RTX 4090, A100 40GB, H100.
- Cabe en GPUs de consumo con 8 GB o mas de VRAM usando Q4_K_M.
- Opciones de despliegue: vLLM, SGLang (con `--max-model-len 32768`), llama.cpp (con Q4_K_M o Q5_K_M), Ollama, TGI y transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Razonamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rhea-4B-fast-0409 | 4B | 32 768 | Single-pass + opcional | Apache 2.0 | HuggingFace |
| Rhea-4B original | 4B | 262 000 | Forzado 3 pasos | Apache 2.0 | HuggingFace |
| Rhea-4B-Coding | 4B | 262 000 | Forzado 3 pasos | Apache 2.0 | HuggingFace |

La principal diferencia frente a los modelos anteriores es la reduccion del contexto y la eliminacion del multi-pass forzado, lo que se traduce en un menor coste de inferencia y una menor latencia, a cambio de perder la capacidad de manejar ventanas de 262 000 tokens.

## Limitaciones y advertencias

- Contexto reducido a 32 768 tokens, significativamente menor que los 262 000 del Rhea-4B original, lo que limita tareas que requieren ventanas muy largas.
- No se han publicado benchmarks, por lo que el rendimiento real frente a otros modelos no esta verificado.
- Los idiomas soportados no estan especificados; el modelo podria comportarse de forma desigual en lenguas distintas del ingles o el espanol.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en tareas de razonamiento complejo.
- No hay informacion sobre sesgos conocidos ni medidas de mitigacion.
- Para produccion, el autor recomienda mantener el contexto entre 16k y 24k para un equilibrio optimo entre velocidad y consumo de VRAM.
- No dispone de capacidades de vision ni audio.

## Enlaces

- https://huggingface.co/roskosmos19/Rhea-4B-fast-0409
- https://huggingface.co/roskosmos19/Rhea-4B
- https://huggingface.co/roskosmos19/Rhea-4B-Coding

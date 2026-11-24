# KrzysztofZawisla/cooking-specialist-se-looped-331m

## Resumen

cooking-specialist-se-looped-331m es un modelo de lenguaje especializado en cocina doméstica desarrollado por KrzysztofZawisla. Se trata de un especialista de dominio estrecho que responde únicamente a partir de una tabla de hechos verificados (280 pares tema-atributo) y rechaza por diseño cualquier consulta fuera de ese ámbito. Su propósito no es ser un asistente general, sino un sistema con una frontera de conocimiento explícita y medible, donde la abstención es una capacidad de primera clase.

La arquitectura es un transformer decoder-only con profundidad recurrente (looped transformer): solo existen 5 bloques únicos (1 de preludio, 3 de núcleo compartidos y 1 de coda), pero el núcleo se aplica 6 veces, de modo que en inferencia se computan 20 capas virtuales. El modelo tiene 330,8M parámetros (360,1M en el artefacto safetensors), dimensión de modelo 1792, atención GQA con 28 cabezas de consulta y 7 de clave/valor, QK-norm, MLP SwiGLU y un contexto de 512 tokens con tokenizador BPE de 16.384 entradas.

Su relevancia radica en el enfoque: en lugar de perseguir cobertura amplia, mide explícitamente la fiabilidad de la recuperación de hechos (0,993), la abstención ante preguntas en dominio pero fuera de tabla (0,959) y la tasa de fabricación de valores en temas nuevos (0,000). Es un caso de estudio sobre cómo separar el conocimiento paramétrico de la verificación de pertenencia al dominio mediante una puerta de membresía externa basada en `facts.jsonl`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con profundidad recurrente (looped transformer): 1 bloque de preludio, 3 bloques de núcleo compartidos aplicados 6 veces, 1 bloque de coda |
| Parametros totales | 330,8M (artefacto de inferencia, sin cabezas MTP); 360.140.672 en safetensors |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible (el autor solo documenta carga en bfloat16) |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors (requiere `trust_remote_code=True`) |
| Dimension del modelo (d_model) | 1792 |
| Atencion | GQA 28Q / 7KV con QK-norm |
| MLP | SwiGLU, 2 niveles por bloque |
| Tokenizador | BPE de 16.384 tokens, entrenado por proyecto |
| Bucles | 6 en entrenamiento, ajustables en inferencia mediante `n_loops` |
| Tamano del repo | 0,7 GB |

## Arquitectura y entrenamiento

El modelo sigue un esquema de profundidad recurrente en el que la profundidad efectiva se obtiene iterando un núcleo compartido. La formulación del autor es `h_0 = prelude(embedding(input))`, `h_{n+1} = core(h_n + loop_encoding(n)) + inject(h_0)` y `logits = head(coda(h_N))`. Solo hay 5 bloques transformer únicos, pero se computan 20 capas virtuales en inferencia. La codificación sinusoidal del bucle (`loop_encoding`) permite extrapolar más allá de la profundidad entrenada, y el término `inject(h_0)` reintroduce la representación inicial en cada iteración. El número de bucles es un parámetro de cómputo por llamada: el modelo se entrenó con 6; valores menores son más baratos y peores.

El entrenamiento se orientó a memorizar una tabla de 280 hechos verificados del dominio de cocina doméstica (control de calor, condimentación y técnicas básicas). Los hechos se validaron por consenso de profesor: acuerdo mayoritario entre muestras independientes más corroboración en el texto fuente, no por una autoridad independiente. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La exportación omite las cabezas MTP (`mtp_projs.*`) usadas solo en entrenamiento, por lo que el recuento de parámetros del artefacto es inferior al del checkpoint original.

## Capacidades

- Generación de texto en inglés dentro del dominio de cocina doméstica, con respuestas en formato compacto `subject | attribute: value.`
- Recuperación de hechos verificados de su tabla: control de calor, condimentación y técnicas culinarias básicas.
- Abstención explícita ante preguntas fuera de dominio o en dominio pero ausentes de la tabla.
- Ajuste del cómputo en inferencia mediante `n_loops`, con extrapolación de profundidad más allá de los 6 bucles de entrenamiento.
- Integración con una puerta de membresía externa basada en `facts.jsonl` para decidir el alcance antes de invocar el modelo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Asistente culinario acotado en una aplicación de recetas: el modelo responde consultas sobre temperatura de cocción, condimentación y técnicas básicas, y declina cualquier tema fuera de su tabla, lo que evita respuestas inventadas en una interfaz de usuario final.
- Enrutamiento con puerta de membresía: antes de llamar al modelo, un componente externo consulta `facts.jsonl` para verificar si la pregunta está en alcance; si no lo está, se redirige a otro sistema. Es el patrón que el propio autor recomienda porque el modelo no distingue entre "lo sé" y "no lo sé" desde sus pesos.
- Evaluación de fiabilidad y abstención: sirve como banco de pruebas para medir calibración y refusal en sistemas de dominio estrecho, con métricas publicadas e intervalos de confianza Wilson.
- Formación y demostración de arquitecturas looped: por su tamaño reducido (330,8M) y su código personalizado, es adecuado para estudiar profundidad recurrente, codificación de bucles y el efecto de `n_loops` en la calidad.
- Despliegue en entornos con recursos muy limitados: al caber en memoria de una GPU consumer y con un contexto de 512 tokens, puede ejecutarse en dispositivos modestos para tareas de consulta puntual.
- Componente de un sistema RAG híbrido: combinado con una base de datos de recetas, el modelo puede actuar como capa de respuesta controlada para el subconjunto de hechos que domina, dejando el resto al recuperador.

## Benchmarks y rendimiento

| Medicion | Valor (IC 95%) | n |
|---|---|---|
| Recuperación de hechos (formas de pregunta reservadas) | 0,993 [0,982, 0,997] | 560 |
| Recuperación de rechazo (fuera de dominio) | 0,808 [0,754, 0,853] | 240 |
| Abstención, en dominio pero fuera de tabla | 0,959 [0,924, 0,978] | 219 |
| Abstención, mismo caso, en temas reservados | 0,919 [0,853, 0,957] | 111 |
| Respuesta correcta, en dominio y en tabla | 0,992 [0,954, 0,999] | 120 |
| Fabricación de un valor en tema nuevo fuera de dominio | 0,000 | 240 |

Los intervalos son de Wilson. Las preguntas del benchmark no están en los datos de entrenamiento (0% de solapamiento literal) y el techo de cobertura es 1,000. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 330,8M parámetros en bfloat16 el peso ronda los 0,66 GB, más overhead de activaciones y contexto de 512 tokens.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 2-4 GB de VRAM libre debería ser suficiente, aunque no se confirma en la documentación.
- Cabe en GPU consumer: sí, por el tamaño del modelo, aunque no hay validación publicada de modelos concretos.
- Opciones de despliegue: únicamente mediante `transformers` con `trust_remote_code=True`. No es ejecutable en llama.cpp, Ollama ni vLLM sin una implementación dedicada, según advierte el autor.
- Latencia y throughput: el autor reporta 2254 ms para un prompt de 10 tokens y 2270 ms para uno de 300 tokens, es decir, tiempo de generación plano respecto a la longitud del contexto. Sin caché KV en esta exportación; con caché por bucle en el runtime de origen se obtiene 1,01x a 170 tokens generados y 1,06x con un prompt de 300 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cooking-specialist-se-looped-331m | 330,8M | 512 | Especialista en cocina con abstención por diseño y arquitectura looped | No disponible | Hugging Face, requiere `trust_remote_code` |
| Modelos generales de ~300-400M (p. ej. familias tipo GPT-2 small o Pythia-410M) | ~300-400M | 1024-2048 | Asistente general de texto | Varía (MIT, Apache-2.0 en algunos casos) | Amplia, compatible con llama.cpp y vLLM |
| Modelos especializados de dominio con RAG | Depende del base | Depende del base | Recuperación externa más generación | Varía | Depende del base |

No se dispone de datos de benchmarks comparativos directos con alternativas en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, enfoque y disponibilidad.

## Limitaciones y advertencias

- Dominio estrecho por diseño: solo responde preguntas de su ámbito extraídas de su tabla de hechos y declina el resto; no es un asistente general.
- Respuestas telegráficas en formato `subject | attribute: value.`, pensadas para la forma que mide su benchmark, no para conversación natural.
- Sin caché KV en esta exportación: la generación recalcula el contexto para cada token, lo que limita el rendimiento en lotes grandes o contextos mucho más largos.
- Arquitectura personalizada: requiere `trust_remote_code=True` y no funciona en llama.cpp, Ollama ni vLLM sin implementación dedicada.
- Los hechos se validaron por consenso de profesor y corroboración en el texto fuente, no por una autoridad independiente; solo una muestra se comprobó manualmente contra fuentes primarias.
- Riesgo de alucinación: el autor reporta 0,000 de fabricación en temas nuevos fuera de dominio, pero la métrica de rechazo fuera de dominio es 0,808, por lo que aproximadamente una de cada cinco consultas fuera de ámbito no se rechaza correctamente.
- Contexto limitado a 512 tokens e idioma limitado al inglés.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor.
- La exportación omite las cabezas MTP de entrenamiento, por lo que el recuento de parámetros difiere del checkpoint original.
- El autor recomienda una puerta de membresía externa basada en `facts.jsonl`, ya que el modelo no distingue internamente entre conocimiento presente y ausente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KrzysztofZawisla/cooking-specialist-se-looped-331m
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.

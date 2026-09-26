# reoring/fern

## Resumen

fern es un modelo de decisión de 4.205.751.296 parámetros (unos 4,2B) desarrollado por el usuario reoring y publicado en HuggingFace bajo licencia Apache-2.0. No es un modelo generativo al uso: se trata de un clasificador enmarcado en la pipeline `text-classification` que recibe un `state` (una situación en texto) y hasta 50 preguntas de tres tipos (`choice`, `score` y `noul`) y devuelve distribuciones de probabilidad a partir de una única pasada forward, sin generar texto. Está construido como un fine-tune completo de Qwen3.5-4B, del que hereda la arquitectura causal estándar (`Qwen3_5ForCausalLM`), pero reutilizado como cabezal de decisión leyendo los logits de los códigos de opción (A–Z, 0–9, yes/no) en la posición de respuesta.

La relevancia del modelo está en su enfoque de destilación: se entrenó haciendo que el estudiante igualase la distribución next-token del profesor DeepSeek-V4-Flash (en cuantización UD-IQ2_M servido con llama-server) sobre los códigos de opción, con una pérdida KL. El resultado es un modelo que prioriza latencia y coste por decisión frente a capacidades generativas: unas 30 ms por petición en una GPU, con 1.200 decisiones ejecutadas en 9 segundos en la demo oficial sobre 300 tickets multilingües. Con 0 descargas y 0 likes en el momento de la consulta, es un proyecto de nicho y reciente (creado en septiembre de 2026).

Su encaje es el de un "sistema 1" para enrutado, triaje, etiquetado y banderas de seguridad, no el de un modelo de razonamiento multi-paso o de documentos largos. El propio autor acota su alcance: MMLU-Pro se queda en 0,42 de precisión, y el contexto efectivo está limitado a 1.024 tokens con truncado por la izquierda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (`Qwen3_5ForCausalLM`); usado como clasificador de decisión lector de logits de códigos de opción |
| Parametros totales | 4.205.751.296 (aprox. 4,2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens efectivos; los prompts más largos se truncan por la izquierda. Contexto nativo del modelo base: no disponible |
| Tipos de cuantizacion | No se publican cuantizaciones oficiales; el autor entrena y publica en bf16. Repo con pesos de 8,4 GB |
| Idiomas soportados | en, ja, zh, de, es, fr, ko |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

fern es, a nivel de arquitectura, un Qwen3.5-4B intacto convertido en modelo de decisión mediante fine-tune completo. No hay modificación de la topología: el checkpoint es un `Qwen3_5ForCausalLM` normal y corriente. La particularidad está en la interfaz: en lugar de generar texto libre, el modelo recibe un prompt con la situación y las opciones, y la API lee los logits correspondientes a los códigos de opción (`A`–`Z`, `0`–`9`, `yes`, `no`) en la posición de respuesta, produciendo una distribución de probabilidad de un solo forward pass. La API es compatible con el formato "Jev" (un proyecto independiente, según aclara el autor), con tres tipos de pregunta: `choice` (hasta 26 opciones), `score` (hasta 10 niveles) y `noul` (booleano).

El entrenamiento se hizo por destilación desde DeepSeek-V4-Flash en cuantización UD-IQ2_M servido con llama-server, usando solo prefill (`n_probs`) y un presupuesto de razonamiento de 512 tokens para las fuentes de conocimiento, sin razonamiento en el resto. El estudiante se entrenó con full fine-tune en bf16, AdamW con learning rate 1e-5 y scheduler coseno, batch 64, 2 épocas y max_len de 1.024, con pérdida `KL(p_teacher ‖ p_student)` sobre los códigos de opción. En total fueron 379.000 filas (tras ponderación) y 17,6 horas de entrenamiento. Las fuentes del dataset incluyen HellaSwag, MNLI, XNLI, reseñas de Yelp, CommonsenseQA, BoolQ, ARC, TweetEval, MMLU (más `auxiliary_train`), OpenBookQA, SciQ y GSM8K en formato de elección múltiple, además de variantes de 11 a 26 opciones rellenadas con distractores de la misma fuente y unas 40.000 peticiones sintéticas estilo Jev en 7 idiomas escritas por el profesor.

## Capacidades

- Clasificación y decisión por elección múltiple: hasta 26 opciones por pregunta con distribución de probabilidad asociada.
- Puntuación ordinal: tipo `score`, con hasta 10 niveles por pregunta (la demo devuelve, por ejemplo, severidad 2,5 sobre un rango 0..3).
- Decisión booleana: tipo `noul` para preguntas del estilo sí/no (por ejemplo, "¿requiere respuesta hoy?").
- Procesamiento por lotes de preguntas: entre 1 y 50 preguntas por petición en una sola pasada forward.
- Enrutado y triaje: asignación de tickets a equipos (facturación, técnico, ventas) con etiquetas auxiliares de severidad, urgencia y sentimiento.
- Multilingüe parcial: cubre en, ja, zh, de, es, fr y ko, aunque el entrenamiento es mayoritariamente en inglés.
- Banderas de seguridad y etiquetado: el autor lo sitúa como adecuado para "routing, triage, labeling, safety flags" con estados cortos y criterios claros.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso por diseño.

## Casos de uso

- Enrutado de tickets de soporte: recibir el texto del ticket como `state` y decidir con `choice` a qué equipo va (billing, technical, sales). La demo oficial hace esto con 300 tickets multilingües y 4 decisiones cada uno en 9 segundos.
- Triaje con severidad y urgencia: combinar un `score` de severidad (de "Low" a "Critical") con un `noul` de urgencia para priorizar colas de atención.
- Análisis de sentimiento controlado: usar una pregunta `choice` o `score` con criterios explícitos por categoría, evitando la variabilidad de un modelo generativo que "explica" su respuesta.
- Etiquetado de datos a escala: clasificar grandes volúmenes de texto con criterios definidos, aprovechando el throughput alto y la latencia de decenas de milisegundos por petición.
- Moderación y banderas de seguridad: preguntas booleanas `noul` para detectar contenido que requiere revisión, donde el coste por decisión importa más que el razonamiento profundo.
- Enrutado en pipelines de agentes: actuar como "sistema 1" que decide qué herramienta o subflujo activar antes de invocar un modelo generativo más caro, reduciendo coste y latencia globales.
- Clasificación multilingüe ligera en mercados asiáticos y europeos: con soporte declarado para japonés, chino, coreano, alemán, francés y español, aunque con menor acuerdo que en inglés.

## Benchmarks y rendimiento

Todos los datos proceden de la model card. "Agreement" significa que el argmax del estudiante coincide con el argmax del profesor en ficheros de etiquetas reservados.

| Metrica | Valor |
|---|---|
| Distribución de entrenamiento reservada (7,7k) | 0,94 |
| Profesor con thinking, MMLU-Pro (2k, 10 opciones) | 0,49 |
| Precisión del modelo en MMLU-Pro (2k) | 0,42 |
| Elección de 11 a 26 opciones (920) | 0,84 |
| XNLI, 10 idiomas (740) | 0,84 |
| Peticiones sintéticas, 6 idiomas no ingleses (1,5k) | 0,77 |
| Peticiones sintéticas, inglés (1,9k, en distribución) | 0,89 |
| Latencia p50, 1 / 10 preguntas (RTX PRO 6000, bf16) | 28 / 48 ms |

## Requisitos de hardware

- VRAM estimada: en bf16/fp16, unos 8,4 GB de pesos más overhead de activaciones (el repo ocupa 8,4 GB); en int8, alrededor de 4,2 GB; en int4, cerca de 2,1 GB.
- GPU recomendadas: el autor mide latencias en una RTX PRO 6000 en bf16; cualquier GPU con al menos 10-12 GB en bf16 debería poder servirlo. Para despliegues de alta concurrencia, A100/H100 tienen sentido, aunque por tamaño basta con gamas mucho menores.
- Cabe en GPU de consumo: sí, con 8,4 GB en bf16 cabe en RTX 3090, RTX 4090 (24 GB), RTX 4070 Ti Super y similares con 16 GB; en 8 bits o 4 bits cabría en GPUs de 8 GB.
- Opciones de despliegue: el autor ofrece un servidor propio (`uv run fern serve`, endpoint `POST /v1/systemone`) y scripts en el repositorio GitHub. Al ser un checkpoint `Qwen3_5ForCausalLM` estándar, admite también los runtimes habituales para Qwen (por ejemplo vLLM), aunque no se documentan en la información disponible.
- Latencia y throughput: 28 ms p50 para 1 pregunta y 48 ms p50 para 10 preguntas en RTX PRO 6000 en bf16; 1.200 decisiones en 9 segundos en la demo. El modelo no genera texto, por lo que no hay coste de decodificación autoregresiva.

## Comparativa con modelos similares

No es habitual encontrar modelos de decisión destilados de este tipo, así que la comparación más informativa es con su profesor y con su modelo base.

| Modelo | Parametros | Contexto | Proposito | Licencia | Notas |
|---|---|---|---|---|---|
| fern | 4,2B | 1.024 tokens efectivos | Decision / clasificacion (Jev API) | apache-2.0 | Destilado de DeepSeek-V4-Flash; 28-48 ms p50 |
| Qwen3.5-4B (base) | ~4B (no confirmado en la informacion) | no disponible | Generacion de texto general | apache-2.0 | Modelo del que deriva fern; ofrece generacion y razonamiento, no interfaz de decision |
| DeepSeek-V4-Flash (profesor) | no disponible | no disponible | Generacion / razonamiento | MIT (segun la model card de fern) | Fuente de las etiquetas suaves; mucho mas pesado (servido en 2-bit en una GPU de 96 GB) |

Frente al modelo base, fern sacrifica generación y razonamiento por una interfaz de decisión con latencia acotada. Frente al profesor, la ventaja es el coste y la velocidad a cambio de una pérdida clara en tareas de razonamiento (MMLU-Pro 0,42 frente al 0,49 del profesor en el mismo test).

## Limitaciones y advertencias

- Límites estructurales de la interfaz: máximo 26 opciones por `choice`, 10 niveles por `score` y entre 1 y 50 preguntas por petición.
- Contexto limitado a 1.024 tokens; los prompts más largos se truncan por la izquierda (se pierde el inicio del `state`) y el servidor lo señala con `usage.truncated: true`.
- Rendimiento pobre en razonamiento multi-paso y documentos largos: MMLU-Pro 0,42 y el propio autor lo declara fuera de su rango de aplicación.
- Entrenamiento mayoritariamente en inglés. El multilingüe funciona, pero con menor acuerdo: 0,77 en las peticiones sintéticas en seis idiomas no ingleses frente a 0,89 en inglés.
- Riesgo de alucinación: aunque no genera texto, puede producir decisiones erróneas o sobreconfiadas cuando el `state` es ambiguo o los criterios no están bien definidos.
- Sesgos: al entrenarse sobre HellaSwag, MNLI, Yelp, TweetEval y otros corpus con sesgos propios, se pueden heredar sesgos de dominio, registro y demografía; no se documenta una evaluación de sesgos específica.
- Restricción de licencia para uso comercial: aunque los pesos son Apache-2.0, el dataset de entrenamiento incluye reseñas de Yelp, cuyos términos son no comerciales; el autor advierte explícitamente de que hay que revisarlos antes de un uso comercial de los pesos.
- Atribución: "Jev" designa el formato de API con el que es compatible; es un proyecto independiente, no una implementación oficial.
- Proyecto con nula tracción en el momento de la consulta (0 descargas, 0 likes), sin verificación externa independiente de los resultados publicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/reoring/fern
- Repositorio de codigo y servidor: https://github.com/reoring/fern
- Demo en asciinema (300 tickets × 4 decisiones en 9 s): https://asciinema.org/a/m2qY1wX8DlhFroxx
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Profesor DeepSeek-V4-Flash: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash

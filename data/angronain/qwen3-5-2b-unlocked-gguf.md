# angronain/Qwen3.5-2B-Unlocked-GGUF

## Resumen

Qwen3.5-2B-Unlocked-GGUF es una compilación de cuantizaciones GGUF del modelo Qwen/Qwen3.5-2B, publicada por el usuario angronain, en la que se han aplicado dos ediciones direccionales sobre los pesos originales: una ablación de la dirección de rechazo (refusal) y un amortiguamiento de la dirección de "autoduda" que provoca bucles de tipo "Wait… no…" en modo thinking. No se ha realizado fine-tuning ni se han utilizado datos de entrenamiento adicionales; ambas modificaciones son ablaciones direccionales seleccionadas mediante búsqueda automatizada (Optuna, 90 ensayos) y validadas contra el modelo original en cada métrica reportada.

El modelo base es un transformer de 1.881.825.088 parámetros (aproximadamente 1,88 mil millones) con arquitectura híbrida que combina capas de atención con capas Gated-DeltaNet (SSM), según se deduce de la mención a `ssm_out` en la descripción de la ablación. Mantiene las capacidades multilingües y la entrada de visión del modelo original, e incorpora soporte de tool calling y RAG. La licencia es Apache-2.0, heredada del modelo base.

La relevancia de esta ficha radica en que ofrece una alternativa local de pequeño tamaño (1,27 GB en Q4_K_M) con comportamiento sin filtros de seguridad, orientada a despliegues en hardware de consumo, chat, búsqueda web y pipelines de RAG. El autor documenta explícitamente el coste de las ediciones: una degradación medible en tareas de código (3,75/10 frente a 5,0/10 del original) y un aumento del 0,9 % en perplejidad sobre WikiText-2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas de atención y capas Gated-DeltaNet (SSM); proyector de visión opcional |
| Parametros totales | 1.881.825.088 (~1,88 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (configuración recomendada en llama.cpp con `-c 32768`) |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0, BF16; los K-quants usan importance matrix |
| Idiomas soportados | Inglés y multilingüe |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp, Ollama); proyector de visión `mmproj-F16.gguf` separado |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-2B emplea una arquitectura híbrida que intercala capas de atención con capas Gated-DeltaNet, un tipo de modelo de espacio de estados (SSM) con compuertas. Esta combinación se refleja en el proceso de ablación descrito por el autor, que elimina la dirección de rechazo de todas las matrices que escriben en el flujo residual: `attn_output`, `ssm_out` (para las capas Gated-DeltaNet) y `ffn_down`, con un kernel de pesos por capa. El modelo incluye además un proyector de visión (`mmproj-F16.gguf`, 0,67 GB) que se mantiene sin cambios respecto al base.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original, ya que la model card no los detalla. Las ediciones de esta versión no implican entrenamiento: la primera ablación calcula direcciones de rechazo por capa a partir de activaciones residuales medias sobre 256 prompts dañinos frente a 256 inofensivos, proyectando fuera la componente media de los prompts inofensivos y aplicando un kernel elegido por búsqueda multiobjetivo (90 ensayos) que minimiza rechazos y divergencia KL del primer token en prompts inofensivos. La segunda ablación construye una dirección a partir de 724 posiciones donde el modelo estaba a punto de escribir "Wait", "No", "Hmm" o "Actually" en sus trazas de thinking, frente a 2.164 posiciones emparejadas de continuación normal, y la elimina parcialmente (fuerza 0,6, capas 13–24); esta dirección es casi ortogonal a la de rechazo (coseno ≈ 0,1).

## Capacidades

- Generación de texto conversacional multi-turno en inglés y otros idiomas.
- Razonamiento en modo thinking, con presupuesto de razonamiento configurable (`--reasoning-budget 2500`).
- Tool calling y function calling, incluyendo llamadas de búsqueda web cuando son necesarias.
- Soporte para pipelines de RAG, con capacidad de declinar responder cuando la información no está en las fuentes (12/16 en preguntas no respondibles).
- Entrada de visión mediante el proyector `mmproj-F16.gguf` (capacidad básica, puede fallar con texto pequeño).
- Generación de código, aunque con rendimiento degradado respecto al modelo original.
- Comportamiento sin filtros de rechazo: responde a solicitudes dañinas (0/200 rechazos en el conjunto de evaluación retenido).
- Multilingüe, heredado del modelo base.
- Compatible con endpoints y despliegue en llama.cpp y Ollama.

## Casos de uso

- Chat local en hardware de consumo: con Q4_K_M (1,27 GB) el modelo alcanza ~80 tok/s en un M1 Pro, lo que permite conversaciones interactivas multi-turno con 32k tokens de contexto en portátiles y equipos sin GPU dedicada.
- RAG sobre documentación interna: el modelo declina correctamente responder cuando la información no está en las fuentes en 12 de 16 casos, lo que lo hace adecuado para asistentes documentales que deben evitar inventar respuestas, siempre que la instrucción de "no responder si no está en las fuentes" se coloque en el mensaje de usuario.
- Búsqueda web asistida: realiza llamadas de herramienta de búsqueda cuando son necesarias (3/5) y no genera llamadas espurias (0/3), lo que permite integrarlo en agentes de búsqueda con tool calling.
- Asistente de atención al cliente sin restricciones de contenido: al no aplicar filtros de rechazo, puede gestionar consultas sensibles o de temática adulta en entornos controlados donde el operador asume la responsabilidad del contenido.
- Prototipado rápido de agentes multi-paso: su ventana de 32k tokens y el soporte de tool calling permiten encadenar pasos de razonamiento y llamadas a herramientas en local antes de escalar a modelos mayores.
- Procesamiento de imágenes con texto: mediante el proyector de visión puede describir o extraer información de imágenes en flujos de accesibilidad o clasificación documental básica, con la advertencia de que la lectura de texto pequeño es poco fiable.
- Evaluación de seguridad y red teaming: al ser un modelo sin filtros, sirve como referencia para estudiar el comportamiento de modelos abliterated y comparar con la versión original en métricas de rechazo y perplejidad.

## Benchmarks y rendimiento

| Métrica | Original Qwen3.5-2B | Unlocked |
|---|---|---|
| Rechazos en prompts dañinos (conjunto de test) | 46/48 | 0/200 (conjunto retenido) |
| Rechazos en modo thinking | alto | 0/24 |
| Perplejidad WikiText-2 (Q6_K, 80×512) | 12,24 | 12,35 (+0,9 %) |
| Tareas de código con tests ejecutados (media de 4 ejecuciones, Q6_K) | 5,0/10 | 3,75/10 |
| Llamadas de búsqueda web necesarias / espurias | 3/5, 0/3 | 3/5, 0/3 |
| RAG: preguntas no respondibles declinadas correctamente | 11/16 | 12/16 |
| RAG: preguntas respondibles correctas | 4/4 | 4/4 |
| Puzzles lógicos, sin thinking (media de 3 ejecuciones) | no disponible | 16,3/22 |
| Ejecuciones de thinking que no terminan (límite 8k tokens) | 16/22 | 10/22 |

El coste en perplejidad de la ablación de rechazo por sí sola es de +0,2 % (12,14 → 12,16 en Q8_0); el resto del incremento proviene del amortiguamiento de autoduda. La ablación de rechazo sola reduce el rendimiento en código a 4,25/10.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB para Q4_K_M, 1,5 GB para Q5_K_M, 1,6 GB para Q6_K, 2,1 GB para Q8_0 y 3,8 GB para BF16, más 0,67 GB adicionales si se usa el proyector de visión.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones K-quant; RTX 3060, RTX 4060, RTX 4090 y A100/H100 son compatibles, aunque el modelo es lo suficientemente pequeño para ejecutarse en CPU.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones, incluidas tarjetas de gama baja con 4 GB o menos en Q4_K_M.
- Opciones de despliegue: llama.cpp (`llama-server -hf angronain/Qwen3.5-2B-Unlocked-GGUF:Q4_K_M --jinja -c 32768 --presence-penalty 1.5`), Ollama (con el `Modelfile` incluido), y cualquier runtime compatible con GGUF. No se menciona soporte de vLLM o TGI.
- Latencia y throughput: ~80 tok/s en Q4_K_M y ~62 tok/s en Q8_0 sobre un Apple M1 Pro, según el autor. No se proporcionan datos para otras GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-2B-Unlocked (este) | ~1,88 B | 32.768 | Apache-2.0 | GGUF | Sin filtros de rechazo; código 3,75/10; visión básica |
| Qwen/Qwen3.5-2B (base) | ~1,88 B | 32.768 | Apache-2.0 | Safetensors, GGUF | Con filtros de rechazo; código 5,0/10; misma perplejidad base |
| Qwen2.5-Coder-1.5B-Instruct | ~1,5 B | no disponible | Apache-2.0 | GGUF | 5,75/10 en la misma suite de código; soporta fill-in-the-middle; recomendado por el autor para tareas de código |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría (por ejemplo, Llama 3.2 1B o Gemma 2 2B) en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo de 2B parámetros: se esperan errores factuales en explicaciones técnicas; debe combinarse con búsqueda o RAG para cualquier dato factual.
- No incorpora filtro de seguridad: responde a solicitudes dañinas (0/200 rechazos). El operador es responsable del uso y del contenido generado.
- El modo thinking sigue sobrepensando en algunos puzzles simples; se recomienda usar modo no-thinking para chat y fijar un presupuesto de razonamiento si se activa.
- El código es el principal coste de las ediciones: aproximadamente una tarea de cada diez peor que el original (3,75 frente a 5,0 sobre 10 en tests ejecutados). Para código, el autor recomienda combinarlo con Qwen2.5-Coder-1.5B-Instruct.
- La visión funciona pero es básica y puede leer mal texto pequeño.
- En RAG, si la instrucción de "decir si no está en las fuentes" se coloca solo en el system prompt, el modelo tiende a inventar una respuesta, y lo hace algo más a menudo que el original; debe colocarse en el mensaje de usuario.
- La licencia Apache-2.0 permite uso comercial, pero la ausencia de filtros de seguridad puede entrar en conflicto con políticas de plataformas o requisitos regulatorios.
- No se han publicado datos sobre sesgos específicos del modelo ni sobre el impacto de las ablaciones en ellos.

## Enlaces

- HuggingFace: https://huggingface.co/angronain/Qwen3.5-2B-Unlocked-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Modelo recomendado para código: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct-GGUF
- Scripts del método de ablación: carpeta `method/` del repositorio (referenciada en la model card)

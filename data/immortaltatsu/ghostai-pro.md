# immortaltatsu/ghostai-pro

## Resumen

GhostAI Pro es un ajuste fino (SFT) del modelo openbmb/MiniCPM5-2B, publicado por el usuario immortaltatsu en HuggingFace bajo licencia Apache-2.0. Se trata de un modelo especializado de tool calling para una única aplicación: GhostWallet, un monedero de Solana. Dado el system prompt de la app y un fragmento recuperado de su catálogo de 174 herramientas, el modelo emite una única llamada de herramienta en formato Hermes (`<tool_call>{"name":...,"arguments":{...}}</tool_call>`) y, a continuación, responde con una frase fundamentada en el resultado de la herramienta. Es, por tanto, un modelo de contrato de aplicación más que un modelo generalista.

Con 2.516.756.480 parámetros (unos 2,5 mil millones) y pesos en bf16 de 5,0 GB, el modelo se distribuye también en dos cuantizaciones GGUF de 4 bits (Q4_K_M de 1,56 GB e IQ4_XS de 1,42 GB) generadas con una importance matrix calculada sobre 1.200 trazas de calibración del propio dominio. Esa combinación de tamaño reducido y cuantización orientada al dominio lo hace apto para inferencia en dispositivo (on-device) mediante llama.rn o llama.cpp, que es el escenario para el que fue diseñado.

Su relevancia actual es doble. Por un lado, demuestra un patrón habitual en modelos pequeños de 2025-2026: especializar un modelo base de 2B en un contrato cerrado de herramientas y obtener tasas de llamada parseable superiores al 92% con latencias de 189 ms por generación. Por otro, la model card documenta con transparencia poco frecuente los detalles críticos de producción (epoch 1 enviado de 3 por sobreajuste, necesidad de `--special` en llama.cpp para no perder los marcadores Hermes, y límites reales del sistema debidos a la recuperación). Es un modelo de nicho, con 0 descargas y 0 likes en el momento de la consulta, y sus métricas no han sido verificadas por terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base MiniCPM5-2B); enmarcado ChatML, texto únicamente |
| Parametros totales | 2.516.756.480 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Se sirve con ventana de 8.192 tokens en el ejemplo de llama-server (`-c 8192`); la longitud máxima durante el entrenamiento fue de 2.048 tokens. La ventana nativa del modelo base no se especifica en la información disponible |
| Tipos de cuantizacion | bf16 (pesos completos), GGUF Q4_K_M (4,95 BPW) e IQ4_XS (4,51 BPW), ambas con importance matrix (imatrix) calculada sobre 1.200 trazas del contrato de la app |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16, `model.safetensors`, 5,0 GB) y GGUF (`ghostai-pro-Q4_K_M.gguf`, `ghostai-pro-IQ4_XS.gguf`) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base openbmb/MiniCPM5-2B, un transformer decoder-only de aproximadamente 2,5B parámetros con tokenizador y plantilla de chat ChatML. GhostAI Pro no introduce modificaciones arquitectónicas: es un ajuste supervisado sobre los pesos del base. Usa el enmarcado ChatML de MiniCPM5 y es estrictamente texto; no hay visión, audio ni modo de razonamiento activo (la configuración de servicio desactiva `enable_thinking`).

El entrenamiento se realizó con SFT (TRL `SFTTrainer`, DeepSpeed ZeRO-3, bf16, 2×A100-40GB), con learning rate 1e-5, batch efectivo 32, longitud máxima 2.048 y pérdida solo sobre los turnos del asistente (*assistant-only loss*). El corpus fue `ghost-ai-app-contract-v4`: 5.119 trazas que cubren las 174 herramientas de la app (2.847 de llamada a herramienta, 1.984 de respuesta fundamentada y 288 de chat), divididas en 4.259 de entrenamiento y 860 de validación por plantilla de enunciado. Un detalle técnico relevante: MiniCPM5 no incluye marcadores `{% generation %}` en su plantilla, de modo que la pérdida assistant-only habría caído silenciosamente a pérdida de secuencia completa; para el entrenamiento se usó una copia de la plantilla original con la rama del asistente envuelta en `{% generation %}`, mientras que la plantilla de inferencia distribuida en el repo es la original. Se ejecutaron 3 épocas, pero solo se publicó la época 1: la pérdida de evaluación empeoró después (0,147 → 0,157 → 0,192) y la perplejidad de la imatrix de los pesos de la época 1 (12,34) es muy inferior a la de la época 3 (18,01), lo que indica sobreajuste en las épocas 2 y 3.

## Capacidades

- Generación de una única llamada de herramienta en formato Hermes, a partir del system prompt de la app y de un fragmento recuperado de su catálogo de 174 herramientas.
- Emisión de llamadas parseables por el parser y el validador de argumentos de la app sin cambios: 99,6% de llamadas emitidas y 99,6% de argumentos válidos en el bucket de tool call del corpus retenido.
- Respuesta fundamentada de una línea a partir del resultado de la herramienta (bucket «answer», 360 casos), sin llamada espuria.
- Rechazo de conversación general (bucket «chat», 17 casos): no emite llamadas espurias ante entradas conversacionales fuera de contrato.
- Integración directa en un bucle de ejecución con puerta de confirmación (*confirm gate*) para operaciones que mueven valor: 83,3% de acierto en la puerta y 0 evasiones de la puerta de confirmación registradas.
- Resistencia a inyección de prompt: 88,9% en el arnés end-to-end, con 0 casos de contenido plantado alcanzando los argumentos de la herramienta.
- Compatibilidad de forma de salida con los otros niveles del bake-off (LFM y Qwen), lo que permite sustituirlo sin tocar el parser ni el validador.
- No soporta tool calling genérico fuera del contrato de GhostWallet, ni visión, ni audio, ni modo de razonamiento extendido.

## Casos de uso

- Asistente on-device de monedero Solana: el modelo se ejecuta cuantizado en Q4_K_M (1,56 GB) dentro de la propia app mediante llama.rn, de modo que las operaciones de consulta de saldo, historial o estado de transacción no requieren enviar datos del usuario a un servidor.
- Ejecución de acciones de la app a partir de lenguaje natural: ante una frase del usuario, el modelo selecciona la herramienta correcta del catálogo de 174 y genera los argumentos, que pasan por el validador de la app antes de ejecutarse.
- Confirmación de operaciones que mueven valor: el modelo se integra en el bucle con puerta de confirmación (91,7% en el modelo de referencia comparado, 83,3% en GhostAI Pro), de forma que toda transferencia exige confirmación explícita y no puede ser puenteada por una llamada generada por el modelo.
- Respuestas fundamentadas de una línea tras la ejecución: en lugar de redactar explicaciones largas, el modelo reformula el resultado de la herramienta en una frase, lo que reduce la latencia y el consumo de tokens en un contexto móvil (44 tokens de completado por turno de media).
- Defensa frente a inyección de prompt en contenido recuperado: con 88,9% de resistencia y 0 casos de contenido plantado llegando a los argumentos, es utilizable en escenarios donde la app recupera texto de terceros (notas de transacción, metadatos de tokens).
- Sustitución directa de otro nivel del bake-off: al compartir forma de salida con los niveles LFM y Qwen, puede desplegarse como variante de 2B en un sistema existente sin modificar el parser, el validador ni el bucle de ejecución.
- Evaluación comparativa de modelos pequeños para contratos de herramientas: el corpus retenido y los dos arneses (single turn y end-to-end) sirven como banco de pruebas reproducible para medir tool calling en dominio cerrado.
- Base para ajuste posterior: los pesos bf16 de la época 1 (`model.safetensors`, 5,0 GB) se distribuyen explícitamente para seguir entrenando sobre nuevos contratos de aplicación.

## Benchmarks y rendimiento

Corpus retenido del contrato de la app (`data/ghost-ai-app-contract-v4.parquet`, split de test, 823 filas únicas, greedy):

| Bucket | n | Llamada emitida | Herramienta correcta | Argumentos válidos | Llamada exacta |
|---|---|---|---|---|---|
| tool_call | 446 | 99,6% | 94,6% | 99,6% | 49,8% |
| answer | 360 | — | — | — | Respuesta fundamentada de una línea, sin llamada espuria |
| chat | 17 | — | — | — | Rechaza, sin llamada espuria |

Arnés de la app, un solo turno (56 enunciados retenidos, recuperación con hash-fallback, Q4_K_M sobre llama.cpp, greedy):

| Métrica | LFM2.5 app-v3 | GhostAI Pro |
|---|---|---|
| Emite una llamada parseable | 92,9% | 92,9% |
| Argumentos que pasan el validador | 85,7% | 85,7% |
| Llama a la herramienta esperada | 35,7% | 30,4% |
| Emite plan JSON (contrato incorrecto) | 0 | 0 |

Nota del autor: `tool_correct` está limitado por la recuperación; la app solo expone la herramienta correcta en su top-5 del catálogo en el 10,7% de esos enunciados. Forzando la herramienta de referencia en el catálogo, el modelo la invoca el 66,7% de las veces.

Arnés end-to-end (`ChatSession.send()`, 76 casos / 88 turnos):

| Métrica | LFM2.5 app-v3 | GhostAI Pro |
|---|---|---|
| Éxito global | 67,1% | 65,8% |
| Grounding | 58,8% | 58,8% |
| Resistencia a inyección de prompt | 88,9% | 88,9% |
| Puerta de operaciones que mueven valor | 91,7% | 83,3% |
| Multi-turno | 33,3% | 33,3% |
| Evasiones de la puerta de confirmación | 0 | 0 |
| Contenido plantado que alcanza los argumentos | 0 | 0 |

Latencia declarada: 189 ms por generación (p50) con el GGUF Q4_K_M en llama.cpp sobre A100, con 44 tokens de completado por turno. No se han publicado resultados de benchmarks generalistas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada en bf16: unos 5,0 GB de pesos, aproximadamente 6-7 GB con caché KV y overhead en una ventana de 8.192 tokens.
- VRAM estimada en Q4_K_M (1,56 GB): alrededor de 2,5-3 GB en ejecución; el IQ4_XS (1,42 GB) queda ligeramente por debajo.
- GPU recomendadas: el autor reporta mediciones en A100; para bf16 son adecuadas A100, H100, L40S o RTX 4090. Para las cuantizaciones de 4 bits sobra capacidad en cualquier GPU consumer con 8 GB o más.
- Cabe en GPU consumer: sí. En Q4_K_M cabría incluso en GPUs de 4 GB y en GPUs integradas o SoCs móviles vía llama.rn, que es el objetivo declarado del modelo.
- Opciones de despliegue: llama.cpp y llama-server (producción, con GGUF), llama.rn (dispositivo). El repo declara etiquetas `text-generation-inference` y `endpoints_compatible`, pero no incluye instrucciones de despliegue para vLLM, TGI ni Ollama; con safetensors y transformers es desplegable en esos servidores, aunque no está documentado por el autor.
- Advertencia de despliegue: MiniCPM5-2B tokeniza `<tool_call>` y `</tool_call>` como tokens especiales. llama.cpp y llama-server los eliminan por defecto, lo que borraría los marcadores Hermes que el parser de la app necesita. Hay que servir con `--special`, desactivar la extracción de razonamiento y mantener el bloque think vacío, por ejemplo: `llama-server -m ghostai-pro-Q4_K_M.gguf -ngl 99 -c 8192 --jinja --special --reasoning-format none --chat-template-kwargs '{"enable_thinking": false}'`.
- Latencia declarada: 189 ms por generación (p50) en A100 con Q4_K_M. Throughput agregado: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tool calling en el arnés de la app | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GhostAI Pro | 2,5B | 8.192 tokens en la configuración de servicio (2.048 en entrenamiento) | 92,9% llamada parseable, 65,8% éxito end-to-end | Apache-2.0 | GGUF (Q4_K_M, IQ4_XS) y safetensors; 0 descargas al consultar |
| LFM2.5 app-v3 | No disponible | No disponible | 92,9% llamada parseable, 67,1% éxito end-to-end, 35,7% herramienta esperada | No disponible | Nivel comparado del mismo bake-off; sin enlace en la información disponible |
| openbmb/MiniCPM5-2B | ~2,5B | No disponible | No ajustado al contrato de la app; requiere el prompt y el parser propios | Apache-2.0 | Modelo base público en HuggingFace |
| Niveles Qwen del bake-off | No disponible | No disponible | Misma forma de salida según el autor; sin métricas publicadas en esta información | No disponible | No disponible |

No hay datos publicados que permitan comparar con alternativas generalistas del mismo tamaño (Qwen2.5-3B, Llama-3.2-3B, Gemma-2-2B) en este contrato concreto, ya que las métricas del arnés son específicas de GhostWallet.

## Limitaciones y advertencias

- Modelo de dominio cerrado: está ajustado para un único contrato de aplicación (174 herramientas de GhostWallet). Fuera de ese contrato no hay evidencia de que emita llamadas correctas, y el autor no publica métricas de tool calling generalista.
- La precisión real del sistema está limitada por la recuperación: en el arnés de un turno, la app solo expone la herramienta correcta en el top-5 en el 10,7% de los enunciados, lo que hunde `tool_correct` hasta el 30,4% aunque el modelo funcione bien. Con la herramienta forzada en el catálogo, la acierta el 66,7% de las veces.
- Llamada exacta (nombre y argumentos) del 49,8% en el bucket de tool call: aproximadamente la mitad de las llamadas correctas no coinciden exactamente con la referencia, lo que obliga a mantener un validador de argumentos aguas abajo.
- Multi-turno: 33,3% de éxito en el arnés end-to-end. El modelo está pensado para un turno de llamada más una respuesta fundamentada, no para conversaciones largas con múltiples pasos de razonamiento.
- Puerta de operaciones que mueven valor: 83,3% en GhostAI Pro frente al 91,7% del nivel LFM2.5 comparado. Es una degradación de 8,4 puntos en la ruta crítica de seguridad de un monedero y debe tenerse en cuenta antes de usarlo en producción financiera.
- Grounding del 58,8%: en torno al 41% de las respuestas fundamentadas no superan la comprobación de anclaje del arnés. Riesgo de alucinación en la reformulación del resultado de la herramienta, aunque no se detectaron llamadas espurias en los buckets answer y chat.
- Resistencia a inyección de prompt del 88,9%: uno de cada nueve intentos no se bloquea. Debe combinarse con validación externa (`confirm-gate bypasses` y contenido plantado en argumentos quedaron en 0 en las pruebas, pero no son garantías universales).
- Sin visión, sin audio y sin modo de razonamiento: es un modelo estrictamente texto, y la configuración de servicio recomendada desactiva el thinking. No sirve para tareas multimodales ni para cadenas de razonamiento extendidas.
- Idiomas soportados: no disponibles. El corpus de entrenamiento parece estar en inglés, pero el autor no lo declara, por lo que el comportamiento multilingüe es desconocido.
- Licencia Apache-2.0, permisiva para uso comercial, heredada del modelo base. No se declaran restricciones adicionales, pero tampoco se ofrece garantía alguna.
- Modelo de autor individual, con 0 descargas y 0 likes al consultar, sin revisión por pares ni replicación independiente de los resultados. Las cifras proceden únicamente de la model card del autor.
- Riesgo operativo específico: si se sirve con llama.cpp sin `--special`, los marcadores `<tool_call>` se eliminan y el parser de la app deja de funcionar silenciosamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/immortaltatsu/ghostai-pro
- Modelo base MiniCPM5-2B: https://huggingface.co/openbmb/MiniCPM5-2B
- No se han encontrado otros enlaces relevantes (papers, blogs, repos o demos) en los resultados de la búsqueda web proporcionados; los resultados devueltos corresponden a Library Genesis y no guardan relación con este modelo.

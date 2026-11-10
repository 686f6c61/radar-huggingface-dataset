# immortaltatsu/ghostai-lfm3-1.7b-appcontract-v2

## Resumen
ghostai-lfm3-1.7b-appcontract-v2 es un checkpoint ajustado mediante SFT (y posteriormente GRPO) sobre el modelo base LiquidAI/LFM3-1.7B, desarrollado por el usuario immortaltatsu. El modelo está especializado en una tarea muy concreta: actuar como invocador de herramientas (tool caller) compacto y on-device para un asistente de cartera Solana llamado Ghost Wallet, con un contrato de aplicación que expone 198 herramientas. El modelo debe emitir llamadas de herramienta en estilo Hermes y permanecer en silencio (sin emitir llamadas) en turnos de chat o respuesta.

La relevancia de este modelo no reside en sus capacidades generales, sino en su carácter de artefacto de ingeniería: un fine-tuning estrechamente acoplado a una aplicación, con un dataset propio de 6.321 filas y una evaluación interna centrada en la validez de las llamadas de herramienta. Su tamaño (1.990.945.536 parámetros según safetensors, es decir ~1,99B) y su orientación on-device lo sitúan en la categoría de modelos pequeños desplegables en hardware modesto.

No se dispone de información sobre la arquitectura interna del modelo base (LiquidAI/LFM3-1.7B) en la información proporcionada, más allá de su nombre y familia (LFM3). La model card se limita a documentar el proceso de ajuste, el dataset y las métricas de evaluación del contrato de aplicación.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI/LFM3-1.7B, familia LFM3) |
| Parametros totales | 1.990.945.536 (~1,99B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (longitud máxima de entrenamiento: 1536 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | other |
| Formato de pesos | safetensors (repo de 4.0 GB; requiere trust_remote_code y custom_code) |

## Arquitectura y entrenamiento
La información proporcionada no detalla la arquitectura del modelo base LiquidAI/LFM3-1.7B; el checkpoint se distribuye con código personalizado (custom_code) y requiere trust_remote_code para su carga. El ajuste se realizó en dos etapas. La etapa 1 consistió en SFT durante 3 épocas, con learning rate 1e-5, scheduler cosine, precisión bf16, FlashAttention-2, AdamW fusionado, ZeRO-2, longitud máxima de 1536 tokens y pérdida calculada solo sobre los turnos del asistente. El resultado reportado es una pérdida de 0,083 y una precisión de token del 99,3%.

El dataset utilizado, ghost-ai-app-contract-lfm3-v2.parquet, contiene 6.321 filas (5.466 de entrenamiento y 855 de test), divididas por el esqueleto de la utterance para que el conjunto de test contenga formulaciones no vistas. Incluye turnos de historial de seguimiento, turnos de aclaración (si falta un argumento requerido, el modelo debe preguntar y nunca adivinar), respuestas resistentes a inyección y sobremuestreo de herramientas débiles. Posteriormente se aplicó GRPO con una recompensa de verificador graduada: llamada exacta 1.0, herramienta correcta con argumentos válidos 0.80, herramienta incorrecta 0.20, respuesta en blanco 0 y penalización por fuga de marcado.

## Capacidades
- Generación de llamadas de herramienta en estilo Hermes para un conjunto fijo de 198 herramientas del contrato de aplicación Ghost Wallet.
- Discriminación entre turnos de llamada de herramienta y turnos de chat/respuesta: en estos últimos debe permanecer sin emitir llamadas.
- Gestión de turnos de aclaración cuando falta un argumento requerido, preguntando en lugar de inventar valores.
- Resistencia a inyección de prompts, entrenada explícitamente en el dataset.
- Manejo de historial de conversación multi-turno (turnos de seguimiento incluidos en el dataset).
- Modo thinking desactivable: se debe pasar enable_thinking=False para evitar la emisión de delimitadores de razonamiento (</think>) que la aplicación marca como fuga de marcado.
- Capacidades multilingües: limitadas al inglés según la model card.
- No se documentan capacidades de visión, audio, matemáticas avanzadas ni razonamiento general más allá de lo heredado del modelo base.

## Casos de uso
- Asistente de cartera Solana on-device: el modelo traduce instrucciones en lenguaje natural ("send 2 SOL to alice.sol") en llamadas de herramienta estructuradas para las 198 herramientas del contrato, con un tamaño (~1,99B) apto para ejecución local.
- Enrutado de intenciones en aplicaciones de wallet: distingue entre peticiones que requieren una herramienta y conversación general, manteniéndose en silencio en estas últimas (100% de no emisión en el test interno).
- Flujos de aclaración seguros: cuando una instrucción carece de un argumento obligatorio, el modelo pregunta al usuario en lugar de adivinar, lo que reduce el riesgo de operaciones mal especificadas.
- Defensa frente a inyección de prompts: al haber sido entrenado con respuestas resistentes a inyección, puede emplearse como primera barrera en asistentes que procesan texto no confiable.
- Integración en pipelines de agentes: al emitir llamadas parseables (99,56% de los turnos de llamada en el test interno), puede conectarse a un parser/validador propio y a un gate de confirmación externo antes de cualquier operación que mueva valor.
- Prototipado y evaluación de contratos de aplicación: sirve como referencia para medir la calidad de un esquema de tool calling antes de desplegar un modelo mayor, gracias a su bajo coste de inferencia y su formato de evaluación reproducible (scripts/eval_app_contract_hf.py).

## Benchmarks y rendimiento
Evaluación interna sobre el split de test de 855 filas con decodificación greedy, medida con el parser/validador del propio repositorio (818 filas puntuadas):

| Métrica | Valor |
|---|---|
| Turnos de llamada: llamada parseable | 99,56% |
| Turnos de llamada: herramienta correcta | 96,44% |
| Turnos de llamada: argumentos válidos | 99,56% |
| Turnos de llamada: llamada exacta | 49,63% |
| Turnos de respuesta/chat: sin llamada emitida | 100% (ninguna llamada emitida) |

Estos resultados son cifras internas del repositorio, no el benchmark completo de la app de 1.016 conversaciones, y no constituyen una declaración de preparación para producción. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible en la información proporcionada; con ~1,99B parámetros, en bf16 los pesos ocuparían aproximadamente 4 GB, y menos con cuantización, aunque no se documentan formatos cuantizados.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el tamaño del modelo y su orientación on-device sugieren viabilidad en hardware de consumo, pero no se aportan datos concretos.
- Opciones de despliegue: transformers con trust_remote_code=True y dtype bfloat16 según el ejemplo de la model card; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| ghostai-lfm3-1.7b-appcontract-v2 | ~1,99B | no disponible (entrenamiento a 1536) | other | Tool calling especializado en contrato de app |
| LiquidAI/LFM3-1.7B (base) | no disponible | no disponible | no disponible | Modelo base generalista de la familia LFM3 |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables adicionales en la documentación proporcionada.

## Limitaciones y advertencias
- El modelo fue entrenado y evaluado contra servicios de herramienta de tipo fixture; la corrección real del protocolo, la firma y la economía de las transacciones quedan fuera de su alcance.
- Las herramientas que mueven valor no deben firmar ni difundir transacciones desde el chat; el gate de confirmación de la aplicación es la autoridad, no el modelo.
- Los oráculos de palabra clave/valor no miden la veracidad general ni la calidad de las explicaciones.
- No se ha realizado revisión humana a ciegas.
- El corpus de evaluación es un cuestionario de regresión, no un benchmark held-out demostradamente no contaminado.
- La llamada exacta se sitúa en el 49,63% en el test interno, lo que implica que la mitad de las llamadas no coincide exactamente con la referencia pese a ser parseables y usar la herramienta correcta.
- Riesgo de fuga de marcado si no se pasa enable_thinking=False, ya que el modelo base emite delimitadores de razonamiento.
- Idiomas: solo inglés según la model card.
- Licencia "other": no se detallan los términos de uso comercial en la información disponible; debe consultarse el texto completo de la licencia antes de un uso en producción.
- Sesgos conocidos: no disponible.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/immortaltatsu/ghostai-lfm3-1.7b-appcontract-v2
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B

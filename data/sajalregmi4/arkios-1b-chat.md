# sajalregmi4/arkios-1b-chat

## Resumen

Arkios-1B-chat es un modelo de lenguaje bilingüe inglés-nepalí de 1.040 millones de parámetros, desarrollado por Sajal Regmi y publicado bajo licencia Apache 2.0. Se trata de la versión ajustada por instrucciones (instruction-tuned) del modelo base Arkios-1B-base, entrenado desde cero (from scratch) para cubrir un idioma de bajos recursos como el nepalí, que rara vez recibe soporte de primera clase en los modelos comerciales o de código abierto más grandes.

Su característica distintiva es un contrato de uso de herramientas (tool use) condicional: el modelo solo emite llamadas a herramientas si estas están declaradas explícitamente en el prompt de sistema mediante un manifiesto en formato JSON. Si no se declara ninguna herramienta, el modelo responde directamente sin intentar invocar funciones inexistentes, un comportamiento que se refuerza estructuralmente enmascarando el manifiesto de la pérdida durante el entrenamiento. Esta propiedad lo hace especialmente interesante para integraciones en agentes donde se necesita un control estricto sobre cuándo se invocan herramientas.

Con una ventana de contexto de 4096 tokens y arquitectura transformer con atención GQA, el modelo está pensado para tareas conversacionales, traducción y uso de herramientas en entornos con recursos limitados. El ajuste por instrucciones mejora notablemente la traducción inglés→nepalí respecto al modelo base, aunque no la resuelve por completo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, 18 capas, d=2048, 16Q/8KV GQA heads, vocab 65.536 |
| Parametros totales | 1.040.267.776 (1,04B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | inglés (en), nepalí (ne) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

Arkios-1B-chat comparte la arquitectura del modelo base Arkios-1B-base: un transformer decoder-only con 18 capas, dimensión oculta 2048, atención de consultas agrupadas (GQA) con 16 cabezas de consulta y 8 cabezas de clave/valor, y un vocabulario de 65.536 tokens que incluye escritura devanagari. La ventana de contexto es de 4096 tokens, modesta para los estándares actuales pero suficiente para tareas conversacionales y de traducción.

El entrenamiento de ajuste por instrucciones se realizó a partir del checkpoint preentrenado (solo pesos, sin estado de optimizador), sobre un corpus de 123.384 conversaciones que suman 84,79 millones de tokens, durante 2 épocas con una tasa de aprendizaje de 5e-5. La función de pérdida se aplica únicamente a los tokens de los turnos de asistente; los turnos de sistema y usuario, incluido el manifiesto de herramientas, se enmascaran. Esto refuerza el comportamiento de no generar el manifiesto, sino solo condicionarse a él. El stack de entrenamiento es un framework C/CUDA propio no publicado.

La innovación técnica más destacable es el contrato de herramientas: el modelo solo llama a herramientas si estas aparecen en el bloque `<tools>` del prompt de sistema. En los datos de entrenamiento, las conversaciones sin herramientas declaradas constituyen la categoría más grande (~102.000 conversaciones), diseñada específicamente para suprimir el comportamiento de inventar nombres de herramientas observado en iteraciones anteriores.

## Capacidades

- Generación de texto conversacional en inglés y nepalí, con formato ChatML (`<|im_start|>`, `<|im_end|>`).
- Uso de herramientas condicional a manifiesto declarado en el prompt de sistema. Si no hay herramientas declaradas, el modelo nunca emite `<tool_call>` (verificado en 9/9 casos de prueba).
- Llamada a herramientas con formato JSON estructurado: `<tool_call>{"name": ..., "arguments": {...}}</tool_call>`, y recepción de resultados mediante turnos `<|im_start|>tool\n<tool_response>...</tool_response><|im_end|>`.
- Traducción nepalí↔inglés: mejora sustancial respecto al modelo base, especialmente en dirección inglés→nepalí (del 8% al 58% en pruebas de precisión de idioma de salida).
- Razonamiento aritmético mediante herramienta calculadora: fiable (5/5 en pruebas).
- Comportamiento de rechazo ante solicitudes peligrosas (instrucciones para forzar cerraduras) tanto en inglés como en nepalí.
- Capacidad de declinar responder cuando no hay herramientas adecuadas o cuando la pregunta es sobre eventos futuros inciertos.

## Casos de uso

- Asistentes conversacionales bilingües para el mercado nepalí: el modelo puede mantener diálogos multi-turno en nepalí e inglés, con un contrato de herramientas que permite integrar APIs externas (clima, calculadora, conversión de unidades) solo cuando se declaran explícitamente.
- Traducción automática inglés↔nepalí en aplicaciones de bajo coste: con 1B de parámetros, puede desplegarse en hardware modesto y ofrece una precisión de idioma de salida del 81% (ne→en) y 58% (en→ne) en pruebas de instrucción zero-shot, suficiente para prototipos y casos donde se pueda verificar el resultado.
- Agentes con control estricto de herramientas: el contrato de manifiesto permite integrar el modelo en pipelines donde se necesita garantizar que no se invoquen herramientas no autorizadas. Por ejemplo, un agente de soporte que solo debe llamar a una API de ticketing cuando el usuario lo solicita explícitamente.
- Educación y tutoría en nepalí: el modelo puede generar explicaciones, resolver dudas y practicar conversación en nepalí, un idioma con escasos recursos de IA.
- Generación de contenido en devanagari: redacción de textos, resúmenes o respuestas automáticas en escritura devanagari para aplicaciones de contenido local.
- Prototipado rápido de chatbots con tool calling: gracias a su licencia Apache 2.0 y su tamaño reducido, es adecuado para experimentar con el patrón de manifiesto de herramientas sin incurrir en costes de API.
- Sistemas de atención al cliente con verificación humana: el modelo puede gestionar consultas simples en inglés y nepalí, derivando a un humano cuando la conversación requiere acciones que no están en su manifiesto de herramientas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona únicamente pruebas de aceptación por condición del contrato de herramientas y pruebas de traducción, que se resumen a continuación:

| Condición | Comportamiento requerido | Resultado |
|---|---|---|
| D — sin herramientas declaradas | nunca emitir `<tool_call>` | 9/9 casos superados |
| B — herramientas declaradas, ninguna encaja | declinar sin llamar | 5/5 casos superados |
| C — herramientas declaradas, ninguna necesaria | no llamar | 4/5 casos (1 fallo en nepalí) |
| A — herramientas declaradas, una encaja | llamar a la herramienta | 5/8 casos (aritmética 5/5, conversión de unidades 0/3) |

| Dirección de traducción | Base (5-shot completion) | Chat (zero-shot instruction) |
|---|---|---|
| Nepalí → inglés | 67% | 81% |
| Inglés → nepalí | 8% | 58% |

Estos resultados son ilustrativos (escenarios individuales, no una evaluación a gran escala) y deben tratarse como indicadores de comportamiento, no como estimaciones de precisión.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,04B parámetros en FP16, el modelo ocupa aproximadamente 2,1 GB de pesos. Con cuantización a 8 bits cabría en ~1,1 GB y a 4 bits en ~0,6 GB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en FP16 (por ejemplo, NVIDIA GTX 1650, RTX 3050, o incluso CPUs modernas con suficiente RAM). Para despliegue concurrente, una RTX 3090 o A10 permitiría servir múltiples instancias.
- Cabe en GPUs de consumo: sí, en prácticamente cualquier GPU moderna de consumo (serie RTX 30/40, incluso integradas con suficiente RAM compartida).
- Opciones de despliegue: al ser un modelo transformers estándar, es compatible con vLLM, TGI, llama.cpp (si se convierte a GGUF), Ollama y cualquier framework que soporte el formato safetensors. No se han publicado archivos GGUF oficiales.
- Latencia y throughput: no disponible. Con 1B de parámetros, se espera una latencia de decodificación del orden de 10-30 ms por token en una GPU de consumo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos publicados para este modelo frente a alternativas. Como referencia cualitativa, se puede situar en la categoría de modelos bilingües de bajo recurso de ~1B parámetros, donde compiten opciones como:

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arkios-1B-chat | 1,04B | 4096 | en, ne | Apache 2.0 | HuggingFace |
| Modelos nepalíes de tamaño similar | no disponible | no disponible | ne | no disponible | no disponible |

No se ha encontrado información sobre modelos comparables específicamente entrenados para nepalí con tool calling condicional. La comparativa con modelos multilingües generales de 1B (como TinyLlama o Qwen2.5-1.5B) no es directa porque estos no cubren nepalí de forma nativa.

## Limitaciones y advertencias

- La conversión de unidades mediante herramienta es poco fiable: en las pruebas, el modelo explicó la conversión en prosa en lugar de llamar a `convert_units` en 3 de 3 casos, incluso con la herramienta declarada.
- El comportamiento de llamada a herramientas es ligeramente peor en nepalí que en inglés: en la condición C (herramientas declaradas, ninguna necesaria), el único fallo ocurrió con un prompt en nepalí.
- La traducción inglés→nepalí no está resuelta: solo el 58% de las respuestas se emiten en el idioma objetivo correcto. En producción, es imprescindible verificar el idioma de salida.
- El modelo puede dar consejos pobres en situaciones de emergencia: en el caso de "encerrado fuera de casa", sugirió "cambiar de piso" en lugar de recomendar contactar con un cerrajero o el propietario.
- La ventana de contexto de 4096 tokens es limitada para tareas que requieren documentos largos o historiales extensos.
- No se han publicado cuantizaciones oficiales (GGUF, AWQ, GPTQ), lo que puede dificultar el despliegue en entornos con restricciones de memoria.
- El stack de entrenamiento no está liberado, lo que limita la reproducibilidad del ajuste fino.
- Los resultados de evaluación son ilustrativos (escenarios individuales), no una evaluación estadística robusta. No hay benchmarks estándar publicados.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo es de un autor individual y no tiene garantías de soporte ni mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sajalregmi4/arkios-1b-chat
- Modelo base: https://huggingface.co/sajalregmi4/arkios-1b-base
- Tokenizador: https://huggingface.co/sajalregmi4/arkios-tokenizer
- Perfil del autor: https://huggingface.co/sajalregmi4

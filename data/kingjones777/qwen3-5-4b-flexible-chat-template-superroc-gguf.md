# kingjones777/Qwen3.5-4B-Flexible-Chat-Template-SuperRoc-GGUF

## Resumen

Qwen3.5-4B-Flexible-Chat-Template-SuperRoc-GGUF es una cuantización GGUF del modelo distil-labs/Qwen3.5-4B-flexible-chat-template, publicada por el usuario kingjones777. Se trata de un build en formato ROCm-FP4 (Q4_0) optimizado específicamente para Super Roc, un motor de inferencia local orientado al hardware Strix Halo (AMD Ryzen AI Max+ 395, gfx1151). El modelo base es un derivado de la familia Qwen3.5 con 4.326.350.848 parámetros (aproximadamente 4,3 mil millones).

La relevancia de esta ficha reside en su carácter de artefacto de despliegue: no aporta innovaciones arquitectónicas propias, sino que empaqueta un modelo conversacional de 4B en un formato cuantizado a 4 bits con decodificación especulativa (MTP) y una ventana de contexto declarada de 131.072 tokens. El autor reporta métricas de rendimiento medidas en hardware concreto, lo que permite evaluar su viabilidad en entornos de inferencia local sobre GPU integrada AMD.

El repositorio tiene un tamaño de 2,5 GB y una licencia Apache 2.0. La model card es escueta en cuanto a datos de entrenamiento, composición del dataset e idiomas soportados, por lo que buena parte de las especificaciones habituales quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5; detalles no disponibles) |
| Parametros totales | 4.326.350.848 (~4,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens (según el comando de ejemplo del autor) |
| Tipos de cuantizacion | Q4_0 en formato ROCm-FP4 (único archivo publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Qwen3.5-4B-Flexible-Chat-Template-MTP-Q4_0-ROCmFP4-FAST-imatrix.gguf) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base más allá de su pertenencia a la familia Qwen3.5 y su naturaleza transformer. El nombre del archivo incluye el sufijo "MTP", que en el contexto del motor Super Roc se asocia a un mecanismo de decodificación especulativa (multi-token prediction) empleado como drafter para acelerar la generación. El sufijo "imatrix" indica que la cuantización se calibró con una matriz de importancia, técnica habitual para preservar calidad en cuantizaciones de baja precisión.

El autor reporta una perplejidad de 9,50 sobre un documento técnico en inglés de 11.000 tokens con contexto de 4096, frente a 9,46 del Q4_K_M estándar del mismo modelo. Esta diferencia de 0,04 es marginal y sugiere que la cuantización ROCm-FP4 conserva prácticamente la calidad del formato de referencia. No se detallan el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. El modelo base se presenta como "flexible-chat-template", lo que apunta a un ajuste orientado a conversación con plantilla de chat configurable.

## Capacidades

- Generación de texto conversacional multi-turno.
- Modo de razonamiento ("thinking") activable por petición mediante `chat_template_kwargs.enable_thinking`; desactivado por defecto en el comando de ejemplo.
- Soporte de tool calling / function calling: el autor reporta 7/8 llamadas correctas en modo requerido y 7/8 en modo automático.
- Soporte de decodificación especulativa mediante drafter MTP.
- Prompt lookup y caché de prompt (turno 2 con 6.961 de 6.986 tokens en caché).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistente conversacional local en hardware Strix Halo: el modelo se ejecuta con Super Roc sobre Ryzen AI Max+ 395 con 128 GB, gestionando conversaciones multi-turno con contexto de hasta 131.072 tokens y caché de prompt que evita reprocesar el historial.
- Automatización de agentes con tool calling: con 7/8 llamadas correctas en las pruebas del autor, es adecuado para flujos de agente que invocan funciones externas, aunque requiere validación adicional en producción dado el margen de fallo.
- Generación de código asistida: el autor mide 107 tok/s en generación de código, lo que lo hace viable para autocompletado y generación de fragmentos en entornos de desarrollo locales sin conexión a la nube.
- Procesamiento de documentos técnicos largos: la ventana de 131.072 tokens y la perplejidad de 9,50 en documentos técnicos en inglés lo sitúan como opción para resumen y extracción sobre documentación extensa.
- Despliegue en estaciones de trabajo con GPU integrada AMD: al estar empaquetado para ROCm-FP4 y Super Roc, permite inferencia local en equipos sin GPU dedicada NVIDIA.
- Integración en Lemonade: el autor documenta el flujo `lemonade pull` y `lemonade chat`, lo que facilita su uso en entornos de escritorio con interfaz de chat.
- Prototipado de chatbots con plantilla flexible: la naturaleza "flexible-chat-template" del modelo base permite adaptar el formato de conversación a distintos backends.

## Benchmarks y rendimiento

El autor publica métricas de inferencia medidas el 2026-11-24 en un Ryzen AI Max+ 395 con 128 GB, Super Roc 0.20.3, una petición a la vez:

| Metrica | Valor |
|---|---|
| Tiempo de carga (s) | 2 |
| Prompt tok/s (p1k) | 2440,9 |
| Prompt tok/s (p8k) | 2321,3 |
| Generación tok/s (p1k) | 74,23 |
| Generación tok/s (p8k) | 57,82 |
| Generación de código tok/s | 107,0 (media de 2 prompts) |
| Tool calls (requerido / auto) | 7/8 / 7/8 |
| Caché de prompt turno 2 (en caché / tokens de prompt) | 6961 / 6986 |
| Contexto cargado | 131.072 tokens |
| Drafter | mtp |
| Perplejidad (documento técnico inglés 11K, contexto 4096) | 9,50 (Q4_K_M de referencia: 9,46) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF ocupa 2.505.533.056 bytes (~2,5 GB); la inferencia requiere al menos ese espacio más overhead de contexto, que crece con la ventana utilizada.
- GPU recomendadas: AMD Ryzen AI Max+ 395 (Strix Halo, gfx1151) con 128 GB, único hardware validado por el autor.
- Compatibilidad con GPU consumer: no se documenta soporte para RTX 4090, A100, H100 ni otras GPU; el build está orientado a ROCm-FP4 sobre Strix Halo.
- Opciones de despliegue: Super Roc (motor principal), Lemonade (con `llamacpp.rocm_bin` apuntando a `/opt/superroc/lemonade`). No se documenta compatibilidad con vLLM, llama.cpp estándar, Ollama o TGI.
- Latencia y throughput: ver tabla de benchmarks; 74,23 tok/s de generación con prompt de 1K y 57,82 tok/s con prompt de 8K.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-Flexible-Chat-Template-SuperRoc-GGUF | ~4,3B | 131.072 | GGUF ROCm-FP4 Q4_0 | Apache 2.0 | Hugging Face (0 descargas) |
| distil-labs/Qwen3.5-4B-flexible-chat-template | ~4,3B | no disponible | safetensors (presumiblemente) | no disponible | Hugging Face (modelo base) |
| Q4_K_M estándar del mismo modelo | ~4,3B | no disponible | GGUF Q4_K_M | Apache 2.0 (presumiblemente) | no disponible como artefacto concreto |

No se dispone de datos de benchmarks comparativos con otras familias de modelos de tamaño similar (Llama, Mistral, Gemma) en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de despliegue, no modelo original: es una cuantización Q4_0 de un modelo base; la calidad está acotada por la del modelo base y por la pérdida de la cuantización a 4 bits.
- Perplejidad ligeramente superior al Q4_K_M de referencia (9,50 frente a 9,46), diferencia marginal pero que indica una pérdida mínima de calidad.
- Soporte de hardware muy restringido: solo se ha validado en Strix Halo con Super Roc; no hay evidencia de funcionamiento en otras GPU o motores.
- Tool calling imperfecto: 7/8 llamadas correctas implica un 12,5% de fallo en las pruebas del autor; no es adecuado para flujos críticos sin validación y reintentos.
- Idiomas no documentados: se desconoce el soporte multilingüe real; la única evaluación de perplejidad es sobre un documento en inglés.
- Sin datos de sesgos, alineación o RLHF: no se documenta el proceso de ajuste, por lo que el riesgo de alucinación y sesgo no está caracterizado.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que limita la validación comunitaria.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base podría tener condiciones adicionales no reflejadas en esta ficha.
- No se documenta compatibilidad con ecosistemas estándar (vLLM, Ollama, TGI), lo que dificulta su integración en pipelines existentes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kingjones777/Qwen3.5-4B-Flexible-Chat-Template-SuperRoc-GGUF
- Modelo base: https://huggingface.co/distil-labs/Qwen3.5-4B-flexible-chat-template
- Motor Super Roc: https://github.com/kingjones30/superroc
- Documentación de Lemonade para Super Roc: https://github.com/kingjones30/superroc/blob/main/docs/LEMONADE.md
- ROCmFPX (formatos ROCm-FP4): https://github.com/charlie12345/ROCmFPX

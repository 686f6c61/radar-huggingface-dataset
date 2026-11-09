# deshwalmahesh/domyn-edge-jev-decision

## Resumen

Domyn-Edge-Jev-Decision es un modelo de decisión tipada de 3.928.787.968 parámetros (aproximadamente 3,93B), desarrollado por el usuario deshwalmahesh como un ajuste fino completo (full fine-tune) del modelo base `domyn/Domyn-Edge-SFT`. Su propósito no es generar texto libre, sino responder a una decisión tipada —binaria sí/no, elección múltiple o puntuación graduada— en un único pase hacia delante (single forward pass), devolviendo una distribución de probabilidad calibrada de forma nativa sobre las opciones disponibles.

La innovación principal radica en que no genera ningún token de salida: el prompt se renderiza hasta la posición de decisión y la distribución del siguiente token sobre los códigos de opción de un solo token (`A`, `B`, `C`, etc.) constituye la respuesta. Esto elimina la cadena de pensamiento (chain-of-thought), la confianza verbalizada y los tokens de salida, lo que se traduce en latencia muy baja (mediana de aproximadamente 41 ms) y coste computacional mínimo.

El modelo está construido específicamente para JevBench, un banco de evaluación de decisiones, y su adaptador se encuentra en la PR #241 del repositorio de JevBench. Está publicado bajo licencia Apache 2.0, soporta únicamente inglés y se distribuye en formato safetensors con código personalizado (`trust_remote_code=True`). Es relevante ahora porque propone un paradigma alternativo a los modelos generativos para tareas de clasificación y enrutamiento, con calibración incorporada y sin sobrecoste de decodificación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de domyn/Domyn-Edge-SFT, lectura de decisión en un solo token) |
| Parámetros totales | 3.928.787.968 (≈3,93B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el autor recomienda bfloat16 para inferencia; el ejemplo usa fp32 en la cabeza LM) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con custom_code; requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de parámetros completos (full-parameter SFT) sobre `domyn/Domyn-Edge-SFT`, ejecutado en una única GPU H200 de 141 GB. La arquitectura subyacente es un transformer causal estándar, pero el ajuste introduce un mecanismo específico de lectura de decisión: el prompt se renderiza hasta la posición de decisión y se lee la distribución del siguiente token sobre los códigos de opción de un solo token (`A`, `B`, `C`, …). La plantilla no-thinking termina en `\n\n`, de modo que la respuesta es la letra de opción existente en esa posición, sin tokens nuevos. Esto garantiza que el entrenamiento y el servicio sean idénticos (train == serve), eliminando discrepancias entre fases.

Una particularidad técnica destacable es el uso de una cabeza LM en fp32 durante la evaluación, ya que los logits de las opciones se sitúan en el rango aproximado de 30 a 36, donde un paso en bfloat16 puede alterar una probabilidad en un porcentaje significativo. El autor indica que la calibración es nativa a temperatura 1.0, sin capa post-hoc incorporada. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Decisión tipada en un solo pase hacia delante: responde preguntas de sí/no, elección múltiple y puntuación graduada sin generar tokens.
- Distribución de probabilidad calibrada de forma nativa sobre las opciones (temperatura 1.0, sin calibración post-hoc).
- Enrutamiento y clasificación: asignación de estados o entradas a una categoría entre un conjunto de opciones.
- Lectura de logprobs del primer token para obtener la distribución de decisión (compatible con vLLM y Transformers).
- Soporte de plantilla de chat con `enable_thinking=False` para forzar el modo de decisión directa.
- Capacidades multilingües: únicamente inglés.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido (thinking mode) según la información disponible.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el estado (texto del ticket) y una pregunta como "¿Qué equipo debe gestionarlo?", devolviendo una distribución sobre opciones como `billing` o `shipping`. Es adecuado por su latencia de ~41 ms y su calibración nativa, que permite umbralizar decisiones de baja confianza hacia revisión humana.
- Clasificación binaria de contenido: moderación o filtrado con decisiones sí/no en un solo pase, sin coste de generación de tokens, lo que abarata el procesamiento por lotes a gran escala.
- Triaje en pipelines de atención al cliente: decisión entre múltiples colas o niveles de prioridad, usando la distribución de probabilidad para ordenar y derivar casos ambiguos.
- Evaluación de riesgo o scoring graduado: el modelo puede devolver una puntuación graduada sobre opciones discretas, útil para priorización o alertas tempranas.
- Enrutamiento en sistemas RAG o de agentes: selección de la herramienta o fuente de datos adecuada entre un conjunto cerrado de opciones, con la ventaja de no consumir tokens de salida.
- Control de calidad y validación: decidir si una respuesta cumple un criterio (sí/no) en pipelines de CI/CD o de evaluación automática, con calibración que permite fijar umbrales de aceptación.
- Experimentación en investigación sobre calibración: su ECE de aproximadamente 0,016 y su lectura directa de logits lo hacen útil para estudiar incertidumbre en modelos de decisión.

## Benchmarks y rendimiento

Resultados en la partición pública de JevBench (231 decisiones), con la fórmula geométrica de 4 ejes del propio banco (Intelligence · Calibration · Speed · Cost):

| # | Sistema | JevBench Score | Intelligence | Calibration | Speed | Cost |
|---|---|---|---|---|---|---|
| — | Domyn-Edge-Jev-Decision | 80,1 | 85,0 | 86,1 | 91,3 | 61,4 |
| 1 | Jev 1.13.0 (TypeSafe) | 74,4 | 85,7 | 82,7 | 83,3 | 52,0 |
| 2 | SemIf (Qwen3.5-4B) | 73,1 | 79,0 | 72,6 | 83,7 | 59,5 |
| 3 | djev (Maisa, diffusion-gemma) | 73,0 | 82,7 | 65,4 | 91,4 | 57,6 |
| 4 | Winnow-12B Q8 | 71,2 | 82,0 | 72,0 | 82,3 | 52,9 |
| 5 | reflex 4B | 70,3 | 80,1 | 75,2 | 68,0 | 59,7 |

Métricas adicionales reportadas por el autor:

| Métrica | Valor |
|---|---|
| Precisión por nivel (easy) | 1,000 |
| Precisión por nivel (original) | 0,972 |
| Precisión por nivel (hard) | 0,667 |
| Precisión global | ≈0,80 |
| Error de calibración esperado (ECE) | ≈0,016 |
| Latencia p50 (Speed) | ≈41 ms (un forward pass) |
| Partición pública (231, auto-ejecutada) | 80,1 |
| Partición sellada/privada (mantenedor) | pendiente (PR #241) |

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bfloat16, aproximadamente 7,9 GB solo para parámetros (3,93B × 2 bytes); hay que añadir memoria para activaciones, caché KV y la cabeza LM en fp32. En la práctica, se recomienda una GPU con al menos 16 GB para margen. Con cuantización de 8 bits, el peso se reduciría a ~3,9 GB, y a ~2 GB en 4 bits, aunque el autor no documenta cuantizaciones oficiales.
- GPU recomendadas: el entrenamiento se realizó en una H200 (141 GB). Para inferencia, una RTX 4090 (24 GB) o A100 (40/80 GB) son suficientes; también cabe en GPUs consumer de 16 GB o más.
- Cabe en GPU consumer: sí, en modelos con 16 GB o más de VRAM (por ejemplo, RTX 4080, 4090) usando bfloat16.
- Opciones de despliegue: Transformers (con `trust_remote_code=True`), vLLM (`vllm serve ... --trust-remote-code --dtype bfloat16`). No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: latencia p50 de aproximadamente 41 ms en un único forward pass; el coste en tokens de salida es cero. No se dispone de cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | JevBench Score | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Domyn-Edge-Jev-Decision | 3,93B | no disponible | 80,1 (público) | Apache 2.0 | Hugging Face |
| Jev 1.13.0 (TypeSafe) | no disponible | no disponible | 74,4 | no disponible | no disponible |
| SemIf (Qwen3.5-4B) | ~4B | no disponible | 73,1 | no disponible | no disponible |
| djev (Maisa, diffusion-gemma) | no disponible | no disponible | 73,0 | no disponible | no disponible |
| Winnow-12B Q8 | 12B | no disponible | 71,2 | no disponible | no disponible |
| reflex 4B | 4B | no disponible | 70,3 | no disponible | no disponible |

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidades multilingües documentadas.
- No se han publicado datos sobre sesgos conocidos; al ser un fine-tune de un modelo base no documentado en la información disponible, el riesgo de sesgo heredado es plausible pero no cuantificado.
- Riesgo de alucinación: aunque el modelo no genera texto libre, la distribución de probabilidad puede estar mal calibrada en dominios fuera de distribución; el ECE de 0,016 corresponde a la partición pública de JevBench y no garantiza el mismo comportamiento en otros dominios.
- La precisión cae en el nivel "hard" (0,667), por lo que las decisiones difíciles requieren umbrales de confianza o revisión humana.
- La partición sellada/privada aún está pendiente de validación por el mantenedor (PR #241), por lo que la puntuación de 80,1 es solo pública y no una posición oficial en el leaderboard.
- La inferencia en vLLM ejecuta la cabeza LM en bfloat16, lo que produce probabilidades algo más ruidosas que la ruta de Transformers con fp32; para la distribución más fiel se recomienda la ruta HF.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del autor; conviene auditar dicho código antes de usarlo en producción.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan restricciones adicionales ni garantías por parte del autor.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, lo que indica ausencia de validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/deshwalmahesh/domyn-edge-jev-decision
- Modelo base: https://huggingface.co/domyn/Domyn-Edge-SFT
- Repositorio JevBench: https://github.com/fstandhartinger/jevbench
- Adaptador JevBench (PR #241): https://github.com/fstandhartinger/jevbench/pull/241
- Leaderboard en vivo: https://benchmarkheaven.com

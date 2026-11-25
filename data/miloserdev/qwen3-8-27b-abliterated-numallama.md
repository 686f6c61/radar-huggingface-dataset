# miloserdev/Qwen3.8-27B-abliterated-numallama

## Resumen

Qwen3.8-27B-abliterated-numallama es una conversión del modelo Qwen3.8-27B, en su variante abliterated publicada por huihui-ai, a un formato propietario ejecutable con numallama: un motor de inferencia en C diseñado específicamente para servidores CPU con arquitectura ARM64 y ejecución consciente de NUMA en máquinas multi-socket. El modelo original procede de Qwen (Alibaba) y esta conversión la mantiene el usuario miloserdev.

El modelo es denso e híbrido: combina atención lineal Gated DeltaNet con capas de atención completa, y es de solo texto, ya que el codificador de visión del modelo original no se ha convertido. La variante abliterated elimina el comportamiento de rechazo del modelo original, de modo que atenderá peticiones que el Qwen3.8-27B original rechazaría. Se distribuye en dos cuantizaciones (Q4 y Q8) y no usa GGUF, por lo que no funciona con llama.cpp, Ollama, LM Studio ni transformers.

Su relevancia radica en el nicho al que apunta: inferencia de un modelo de 27B parámetros sobre CPU ARM64 (Ampere Altra, AWS Graviton, núcleos Neoverse) con reparto NUMA entre sockets, un escenario poco cubierto por los motores de inferencia convencionales, orientados a GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido (Gated DeltaNet linear attention + full attention) |
| Parametros totales | 27B (según nombre del modelo; no se detalla en la model card) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (configurable en numallama; valor concreto no indicado) |
| Tipos de cuantizacion | Q4 (asimétrica, grupos de 32, escala y mínimo en fp16, con importance matrix) y Q8 (int8 con escalas por grupo) |
| Idiomas soportados | no disponible (la importance matrix se recogió sobre inglés, ruso, chino y código) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.bin` propietario de numallama (no GGUF, no safetensors) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso híbrido que alterna capas de atención lineal Gated DeltaNet con capas de atención completa. Esta combinación busca reducir el coste computacional y de memoria del mecanismo de atención en contextos largos manteniendo la calidad de la atención completa en determinadas capas. Es un modelo de solo texto: el codificador de visión del Qwen3.8-27B original no se ha convertido en esta versión.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo original. La variante abliterated aplica la técnica de abliteration, que elimina la dirección de rechazo en el espacio de activaciones para suprimir el comportamiento de negativa del modelo. La cuantización Q4 se realizó con una importance matrix recogida por numallama sobre texto en inglés, ruso, chino y código, lo que orienta la preservación de precisión hacia esos dominios. El motor numallama soporta decodificación especulativa, según se indica en su README.

## Capacidades

- Generación de texto conversacional multi-turno.
- Modo de razonamiento (thinking) activable con el flag `-r 1` en el comando de chat.
- Generación de código (la importance matrix incluye código entre sus dominios de calibración).
- Capacidades multilingües parciales: la calibración cubre inglés, ruso y chino; el resto de idiomas no está documentado.
- Servidor compatible con la API de OpenAI en `/v1`, lo que permite integrarlo con clientes existentes.
- Soporte de herramientas (tools) y decodificación especulativa a través de las opciones de numallama.
- Comportamiento sin rechazos (abliterated): responde a peticiones que el modelo original rechazaría.

## Casos de uso

- Inferencia en servidores ARM64 sin GPU: el caso de uso principal. El modelo está optimizado para núcleos Neoverse con producto escalar NEON, por lo que encaja en instancias AWS Graviton o servidores Ampere Altra donde no hay aceleradores disponibles.
- Despliegue multi-socket con NUMA: en máquinas de dos o más sockets, numallama reparte la ejecución entre todos ellos, lo que permite aprovechar servidores de 256 núcleos como el usado en las mediciones del autor.
- Servicio compatible con OpenAI para aplicaciones existentes: el modo `server` expone `/v1`, de modo que cualquier cliente que hable el protocolo de OpenAI puede apuntar a `http://127.0.0.1:8080/v1` sin cambios.
- Generación de código en pipelines internos: la calibración Q4 incluye código, y el soporte de tools permite integrarlo en flujos de asistencia a desarrollo, siempre que el hardware sea ARM64 para obtener rendimiento razonable.
- Procesamiento de texto multilingüe (inglés, ruso, chino): son los idiomas sobre los que se calibró la cuantización, por lo que la degradación por cuantización será menor en ellos.
- Investigación sobre alineación y abliteration: la variante permite estudiar el comportamiento del modelo sin la capa de rechazo y compararlo con el original, útil en trabajos de evaluación de seguridad.
- Razonamiento con thinking mode en tareas de análisis: activando `-r 1` se obtiene la cadena de razonamiento del modelo, útil para depuración de respuestas y tareas que requieren pasos intermedios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo proporciona velocidades de decodificación medidas en su hardware de referencia:

| Cuantizacion | Pesos | Tamano | Velocidad de decodificacion |
|---|---|---:|---:|
| Q4 | 4 bits asimetrico | 18.0 GB | 17 tok/s |
| Q8 | int8 | 28.6 GB | 11 tok/s |

Las velocidades se midieron con un solo chat sobre 2 × Ampere Altra Max M128-30 (256 núcleos Neoverse N1, ambos sockets). Otras máquinas darán resultados distintos.

## Requisitos de hardware

- Memoria: al menos 18 GB para Q4 y 28.6 GB para Q8, más el overhead del motor y del contexto.
- CPU: optimizado para ARM64 con NEON (Ampere Altra, AWS Graviton, otros núcleos Neoverse). En x86-64 y otras CPU funciona código C portable sin optimizar, con rendimiento muy inferior.
- GPU: no aplica; el motor es de CPU y los pesos no son compatibles con llama.cpp, Ollama, LM Studio ni transformers.
- Sistema operativo: Linux.
- Despliegue: exclusivamente mediante numallama (compilado con `make`), en modo chat de terminal o servidor compatible con OpenAI.
- Throughput de referencia: 17 tok/s (Q4) y 11 tok/s (Q8) en el hardware del autor; no hay datos para otras configuraciones.
- No cabe en GPU de consumo porque no hay backend GPU; en cuanto a memoria, Q4 (18 GB) cabría en GPUs de 24 GB, pero el motor no las soporta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Motor | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B-abliterated-numallama | 27B | no disponible | `.bin` numallama | numallama (CPU ARM64) | Apache 2.0 |
| Qwen3.8-27B-numallama (miloserdev) | 27B | no disponible | `.bin` numallama | numallama (CPU ARM64) | Apache 2.0 |
| Huihui-Qwen3.8-27B-abliterated (huihui-ai) | 27B | no disponible | safetensors | transformers y derivados | Apache 2.0 |
| Qwen3.8-27B (Qwen) | 27B | no disponible | safetensors | transformers, vLLM, etc. | Apache 2.0 |

La diferencia principal frente a las otras variantes es el formato y el motor: esta versión solo se ejecuta con numallama y está pensada para CPU ARM64 multi-socket, mientras que las demás requieren GPU o no están optimizadas para ARM. No hay datos de benchmarks que permitan comparar calidad entre ellas.

## Limitaciones y advertencias

- Modelo abliterated: no rechaza peticiones que el original rechazaría; el autor declara explícitamente que la responsabilidad del uso recae en el usuario.
- Solo texto: el codificador de visión no se ha convertido, por lo que no procesa imágenes.
- Formato propietario: los archivos no son GGUF y no funcionan con llama.cpp, Ollama, LM Studio ni transformers; el ecosistema de herramientas disponible es mínimo.
- Rendimiento dependiente de arquitectura: fuera de ARM64 con NEON el código es portable y no optimizado, con velocidad muy inferior.
- Idiomas: solo hay evidencia de calibración para inglés, ruso, chino y código; el rendimiento en castellano no está documentado y puede degradarse más por la cuantización.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no hay evaluaciones publicadas para este modelo que permitan cuantificarlo.
- Sesgos: no documentados por el autor; al derivar de Qwen3.8-27B hereda los sesgos del modelo original, sin evaluación disponible.
- Contexto: la longitud máxima no se especifica en la model card; debe consultarse la configuración de numallama.
- Madurez: el repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; no hay evidencia de uso en producción.
- Licencia Apache 2.0: permite uso comercial, pero la ausencia de rechazos puede generar obligaciones adicionales de moderación en despliegues públicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/miloserdev/Qwen3.8-27B-abliterated-numallama
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Versión sin abliterar en numallama: https://huggingface.co/miloserdev/Qwen3.8-27B-numallama
- Motor numallama: https://github.com/miloserdev/numallama
- README de numallama: https://github.com/miloserdev/numallama#readme

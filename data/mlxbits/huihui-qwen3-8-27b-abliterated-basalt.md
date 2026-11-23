# MLXBits/Huihui-Qwen3.8-27B-abliterated-Basalt

## Resumen

Huihui-Qwen3.8-27B-abliterated-Basalt es un empaquetado del modelo Qwen3.8-27B en su variante "abliterated" (sin comportamiento de rechazo) desarrollada por huihui-ai, cuantizada a NVFP4 por sakamakismile y reempaquetada por MLXBits en el formato propietario del motor de inferencia Basalt. Se trata de un modelo denso de 27.000 millones de parámetros que incluye torre de visión, capa MTP (multi-token prediction) y un borrador de bloques DFlash 2 para decodificación especulativa, todo autocontenido en un único archivo de 19,7 GiB.

El modelo está diseñado específicamente para ejecutarse en GPUs NVIDIA Blackwell (sm_120) mediante Basalt 0.5.5, un motor de inferencia local con APIs compatibles con OpenAI y Anthropic. La cuantización NVFP4 (W4A4, grupo 16) permite que un modelo de 27B quepa en una sola GPU de consumo como la RTX 5090, manteniendo velocidades de decodificación de entre 94 y 784 tokens por segundo según el modo y el tipo de contenido.

La relevancia de este lanzamiento radica en tres factores: la combinación de cuantización de 4 bits activada por hardware Blackwell con decodificación especulativa integrada, la inclusión de capacidades de visión en el mismo paquete, y la eliminación del comportamiento de rechazo del modelo original, lo que lo orienta a entornos de investigación controlados. No se han publicado métricas de calidad frente a una referencia BF16 para estos pesos concretos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.8) con capa MTP y torre de visión; proyecciones GDN, atención y MLP |
| Parámetros totales | 27.000 millones (aproximado, según nombre del modelo) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | Hasta 150.000 tokens configurados en Basalt (`max-context`) |
| Tipos de cuantización | NVFP4 (W4A4, compressed-tensors, grupo 16) para proyecciones; FP8 para cabeza de salida; BF16 para embeddings, torre de visión y proyecciones a/b de GDN; Q8_0 para capa MTP y borrador |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | `.basalt` (formato propietario del motor Basalt, 19,7 GiB) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.8-27B, un transformer denso de la familia Qwen con atención estándar, proyecciones GDN (gated delta network) y capas MLP convencionales. Sobre esta base, huihui-ai aplicó una técnica de "abliteration" que elimina la dirección de rechazo en el espacio de activaciones, dando como resultado un modelo que no se niega a responder a peticiones que el original rechazaría. sakamakismile cuantizó posteriormente las proyecciones de atención, GDN y MLP a NVFP4 con compresión de tensores (W4A4, grupo 16), manteniendo la cabeza de salida en FP8 y los embeddings y la torre de visión en BF16.

El empaquetado de MLXBits añade dos componentes de aceleración: una capa MTP (multi-token prediction) en Q8_0 y un borrador de bloques DFlash 2, también en Q8_0, entrenado originalmente sobre Qwen3.8-27B sin abliterar. Este borrador se usa para decodificación especulativa: el modelo principal verifica cada token propuesto, por lo que la salida con decodificación especulativa en modo greedy es idéntica a la salida greedy sin borrador. Las peticiones con muestreo conservan los borradores mediante muestreo especulativo, respetando exactamente la distribución del modelo. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original.

## Capacidades

- Generación de texto en modo chat, estructurado y prosa, con decodificación especulativa que alcanza hasta 784 tokens/s en modo estructurado.
- Razonamiento y conversación multi-turno con ventana de contexto configurable de hasta 150.000 tokens.
- Procesamiento de imágenes: la torre de visión integrada permite leer formas, colores y texto impreso en imágenes, según el smoke test del autor.
- Generación de código y contenido estructurado, con alta aceptación de borradores especulativos (85% en modo estructurado).
- Capacidades multimodales (texto e imagen) en un único archivo autocontenido.
- Sin comportamiento de rechazo (abliterated): responde a peticiones que el modelo original declinaría.
- No se especifica soporte explícito de tool calling ni de agentes multi-paso en la información disponible.
- Idiomas soportados no disponibles en la documentación.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el comportamiento de un LLM sin rechazo en entornos controlados, comparando sus respuestas con las del Qwen3.8-27B original para analizar qué direcciones de activación codifican el rechazo.
- Despliegue local en estación de trabajo con RTX 5090: al caber en una sola GPU de consumo con 19,7 GiB de pesos, permite ejecutar un modelo de 27B con visión y contexto de 150.000 tokens sin infraestructura de servidor.
- Generación de contenido estructurado de alto rendimiento: con 784 tokens/s en modo estructurado y 85% de aceptación de borradores, es adecuado para pipelines que producen JSON, tablas o formatos reglados de forma masiva.
- Análisis de documentos e imágenes: la torre de visión y el contexto largo permiten procesar capturas, diagramas o páginas escaneadas junto con instrucciones textuales extensas en una sola petición.
- Prototipado de asistentes conversacionales sin filtros: para equipos que necesitan evaluar respuestas del modelo en dominios sensibles (ficción, debates, análisis de contenido controvertido) antes de decidir qué filtros propios aplicar.
- Servicio local con API compatible con OpenAI y Anthropic: Basalt expone endpoints compatibles, lo que permite sustituir un proveedor en la nube por este modelo sin reescribir la lógica de la aplicación.
- Evaluación de cuantización NVFP4 en Blackwell: sirve como banco de pruebas para medir el impacto de W4A4 con grupo 16 frente a BF16 en tareas de visión y texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor indica explícitamente que la puerta de calidad de Basalt no se ha medido para estos pesos, porque la referencia BF16 publicada corresponde al Qwen3.8-27B original y no aplica a los pesos abliterated.

Los únicos datos publicados son de velocidad, medidos con `basalt-bench` (Basalt 0.5.5) en una RTX 5090 a 500 W, `--kv fp16`, `--seed 1`, una ejecución en frío:

| Métrica | Este paquete | Paquete QUASAR Qwen3.8-27B |
|---|---:|---:|
| Lectura de prompt, 4k tokens (tokens/s) | 15.402 | 14.804 |
| Lectura de prompt, 16k tokens (tokens/s) | 12.635 | 12.694 |
| Lectura de prompt, 32k tokens (tokens/s) | 9.818 | 10.128 |
| Lectura de prompt, 64k tokens (tokens/s) | 6.721 | 6.928 |
| Decodificación simple, chat (tokens/s) | 94 | 94 |
| Decodificación simple, estructurado (tokens/s) | 93 | 92 |
| Decodificación simple, prosa (tokens/s) | 93 | 93 |
| Decodificación con borrador, chat (tokens/s) | 245 | 266 |
| Decodificación con borrador, estructurado (tokens/s) | 784 | 830 |
| Decodificación con borrador, prosa (tokens/s) | 195 | 198 |
| Aceptación de borrador, chat | 40% | 41% |
| Aceptación de borrador, estructurado | 85% | 88% |
| Aceptación de borrador, prosa | 30% | 36% |

El autor atribuye la ligera pérdida de rendimiento frente al paquete QUASAR (3-6% en decodificación con borrador) a que el borrador DFlash 2 se entrenó sobre el Qwen3.8-27B original y acepta menos tokens sobre los pesos abliterated.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo de pesos ocupa 19,7 GiB; con caché KV en FP16 y contexto de 150.000 tokens, el consumo total supera los 24 GiB, por lo que se recomienda una GPU con 32 GiB o más para contexto máximo. Con `kv: int8` (configuración del ejemplo del autor) el consumo de caché se reduce a la mitad.
- GPU recomendadas: NVIDIA RTX 5090 (32 GiB, sm_120) es la plataforma de referencia y la única validada explícitamente. Cualquier GPU Blackwell (sm_120) con suficiente VRAM es compatible con Basalt. No hay soporte indicado para arquitecturas anteriores (Ada, Ampere) ni para GPUs de datacenter como A100 o H100, ya que el motor está orientado a sm_120.
- Cabe en GPU de consumo: sí, en RTX 5090. No se confirma compatibilidad con RTX 4090 (24 GiB, sm_89) por la restricción de arquitectura del motor.
- Opciones de despliegue: exclusivamente Basalt 0.5.5 o superior, que expone APIs compatibles con OpenAI y Anthropic. No se mencionan vLLM, llama.cpp, Ollama ni TGI; el formato `.basalt` es propietario y no es compatible con esos motores.
- Latencia y throughput: según los datos del autor en RTX 5090 a 500 W, lectura de prompt de 15.402 tokens/s a 4k de contexto y 6.721 tokens/s a 64k; decodificación simple de 93-94 tokens/s; decodificación con borrador de 195-784 tokens/s según el tipo de contenido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Motor | Notas |
|---|---|---:|---|---|---|---|
| Huihui-Qwen3.8-27B-abliterated-Basalt | 27B (denso) | 150.000 | NVFP4 (W4A4) + FP8 + BF16 + Q8_0 | Apache 2.0 | Basalt (Blackwell) | Sin rechazo, visión, borrador DFlash 2 |
| QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4 | 27B (denso) | No disponible | NVFP4 | No disponible | Basalt (Blackwell) | Modelo original con QAT; referencia de velocidad del autor |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 27B (denso) | No disponible | BF16 (original) | Apache 2.0 | Cualquiera compatible con safetensors | Pesos sin cuantizar; requiere más VRAM |
| Qwen/Qwen3.8-27B | 27B (denso) | No disponible | BF16 (original) | No disponible | Múltiples | Modelo base con comportamiento de rechazo intacto |

La comparación directa de calidad no es posible porque no hay benchmarks publicados para este paquete. La única comparación cuantitativa disponible es de velocidad frente al paquete QUASAR, con diferencias de entre el 1% y el 6% a favor de QUASAR en decodificación con borrador.

## Limitaciones y advertencias

- Comportamiento de rechazo eliminado: el modelo puede producir contenido sensible, controvertido o inapropiado. No es apto para despliegues públicos sin filtrado propio.
- Sin garantías de seguridad: el autor lo destina a investigación y entornos controlados, y declara que no ofrece ninguna garantía de seguridad.
- Calidad no medida: no se ha ejecutado la puerta de calidad de Basalt contra una referencia BF16 de estos pesos; solo se realizó un smoke test de texto, imagen y decodificación con borrador.
- Riesgo de alucinación: inherente a los LLM de esta familia; no se han publicado evaluaciones específicas de fidelidad factual para estos pesos.
- Compatibilidad de hardware muy restringida: requiere GPU NVIDIA Blackwell (sm_120) y el motor Basalt; no funciona en vLLM, llama.cpp, Ollama ni TGI.
- Idiomas soportados no documentados: no se puede confirmar el rendimiento multilingüe sin pruebas propias.
- Licencia Apache 2.0: permite uso comercial, pero el autor advierte que la responsabilidad legal y ética del uso recae en el usuario, especialmente por la ausencia de rechazo.
- Borrador especulativo entrenado sobre pesos no abliterated: la aceptación es menor (40% en chat, 30% en prosa) y la decodificación con borrador es un 3-6% más lenta que en el paquete QUASAR.
- Tokenizer sustituido: el autor reemplazó el tokenizer del repo cuantizado por el original de Qwen3.8 porque Basalt rechaza la regla de pre-tokenización antigua; el autor afirma que vocabulario, merges, tokens añadidos y plantilla de chat son idénticos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MLXBits/Huihui-Qwen3.8-27B-abliterated-Basalt
- Modelo base (cuantización NVFP4): https://huggingface.co/sakamakismile/Huihui-Qwen3.8-27B-abliterated-NVFP4
- Modelo abliterated original: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Modelo Qwen3.8-27B original: https://huggingface.co/Qwen/Qwen3.8-27B
- Borrador DFlash 2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Paquete QUASAR NVFP4: https://huggingface.co/QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4
- Motor Basalt (GitHub): https://github.com/jesdga95/basalt
- Documentación del formato de modelo Basalt: https://github.com/jesdga95/basalt/blob/main/docs/model-file.md#qwen38-27b-pack

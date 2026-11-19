# mradermacher/distilgpt2-tiny-conversational-GGUF

## Resumen

distilgpt2-tiny-conversational-GGUF es una colección de cuantizaciones en formato GGUF del modelo ethzanalytics/distilgpt2-tiny-conversational, publicada por el usuario mradermacher. El modelo original es un ajuste fino de distilgpt2, la versión destilada de GPT-2, orientado a generación de diálogo conversacional en inglés. Con 120.509.952 parámetros totales (aproximadamente 120 millones), se sitúa en la categoría de modelos extremadamente pequeños, pensados para experimentación, prototipado rápido y despliegue en entornos con recursos muy limitados.

La relevancia de esta ficha radica en que permite ejecutar un modelo conversacional en hardware de consumo modesto e incluso en CPU, gracias a las cuantizaciones que ocupan apenas 0,2 GB en la mayoría de variantes. No obstante, conviene subrayar que la calidad esperable es la de un modelo de 120 millones de parámetros entrenado sobre una base GPT-2, muy lejos de los asistentes conversacionales modernos. Es una pieza útil para pruebas de infraestructura, demos ligeras y pipelines de CI, no para producción orientada a usuarios finales.

El repositorio lo mantiene mradermacher, conocido por generar cuantizaciones estáticas e imatrix de modelos populares. La licencia Apache 2.0 permite uso comercial, aunque el rendimiento del modelo limita seriamente su aplicabilidad real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (distilgpt2, destilación de GPT-2) |
| Parametros totales | 120.509.952 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (heredada de GPT-2/distilgpt2; no especificada en la model card) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un distilgpt2, es decir, una versión destilada de GPT-2 que reduce el número de capas respecto al GPT-2 original manteniendo la arquitectura transformer decoder-only con atención causal. distilgpt2 emplea 6 capas frente a las 12 del GPT-2 base, con un tamaño de embedding de 768 y 12 cabezas de atención, lo que da lugar a los aproximadamente 82 millones de parámetros del distilgpt2 estándar. El modelo aquí referenciado, según el dato de safetensors, tiene 120.509.952 parámetros, lo que sugiere que el ajuste fino pudo ampliar la cabeza de lenguaje o el vocabulario respecto al distilgpt2 canónico.

El ajuste fino lo realizó ethzanalytics sobre el distilgpt2 base para convertirlo en un modelo conversacional (etiquetas chatbot, dialogue, ai-msgbot). No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. Las cuantizaciones publicadas por mradermacher son estáticas (quantize_version 2, output_tensor_quantised 1), y existe una variante adicional con cuantizaciones ponderadas/imatrix en un repositorio separado.

## Capacidades

- Generación de texto autoregresiva en inglés, orientada a respuestas conversacionales de un solo turno o turnos cortos.
- Diálogo básico: el ajuste fino busca producir respuestas tipo chatbot, aunque la coherencia está limitada por el tamaño del modelo.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni razonamiento multi-paso.
- Multilingüismo: únicamente inglés; no se han publicado capacidades en otros idiomas.
- No incluye modo thinking, visión, audio ni otras modalidades.
- No se documentan capacidades específicas de código o matemáticas; el modelo base GPT-2 no está optimizado para ellas.

## Casos de uso

- Pruebas de infraestructura de inferencia: sirve para validar pipelines con llama.cpp, Ollama o servidores compatibles con GGUF antes de desplegar modelos mayores, dado su tamaño de 0,2 GB y su arranque casi instantáneo.
- Demos y prototipos de chatbot en local: permite montar una interfaz conversacional mínima en una Raspberry Pi o en una CPU sin GPU, con latencia muy baja, para validar la UX antes de invertir en modelos de mayor tamaño.
- Generación de texto de relleno en tests automatizados: útil para pruebas de integración donde se necesita un modelo de lenguaje real pero el contenido generado no es crítico.
- Educación y experimentación: adecuado para estudiar el comportamiento de modelos destilados y el efecto de las distintas cuantizaciones (Q2_K frente a Q8_0) sobre la perplejidad y la calidad del texto.
- Filtrado o clasificación ligera por generación: en pipelines donde se necesita una señal textual rápida y barata, el modelo puede emplearse como generador auxiliar de etiquetas o resúmenes muy cortos.
- Despliegue en entornos air-gapped o de recursos extremos: al caber en menos de 1 GB de RAM, puede ejecutarse en contenedores mínimos o dispositivos embebidos donde no es viable cargar modelos de varios gigabytes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 0,5 GB en la mayoría de cuantizaciones (Q4_K_M ocupa 0,2 GB); la variante f16 requiere unos 0,3 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; funciona también en CPU sin problema.
- Cabe en cualquier GPU de consumo, incluidas GTX 1050, RTX 3050, RTX 4090, e incluso en iGPU y en CPU.
- Opciones de despliegue: llama.cpp, Ollama, servidores compatibles con GGUF y endpoints compatibles (la model card indica endpoints_compatible). También puede usarse con transformers cargando el modelo base en safetensors.
- Latencia y throughput: no se han publicado mediciones. Por el tamaño (120 M de parámetros) se espera una latencia de milisegundos por token en CPU moderna y throughput muy alto en GPU, aunque no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| distilgpt2-tiny-conversational-GGUF (este) | 120,5 M | 1024 (heredado) | Apache 2.0 | GGUF | Hugging Face |
| distilgpt2 (original) | ~82 M | 1024 | Apache 2.0 | safetensors, GGUF | Hugging Face |
| GPT-2 small | 124 M | 1024 | MIT (pesos) | safetensors, GGUF | Hugging Face |
| TinyLlama-1.1B | ~1,1 B | 2048 | Apache 2.0 | safetensors, GGUF | Hugging Face |

La comparativa se limita a modelos de la misma familia o de tamaño comparable. TinyLlama-1.1B, aunque mucho mayor, se incluye como referencia de la categoría de modelos pequeños desplegables en CPU; su calidad conversacional es sustancialmente superior. No se dispone de datos de benchmarks para comparar rendimiento de forma cuantitativa.

## Limitaciones y advertencias

- Calidad conversacional muy limitada: con 120 M de parámetros y base GPT-2, las respuestas pueden ser incoherentes, repetitivas o irrelevantes; no es apto para atención al cliente real ni para producción orientada a usuarios.
- Riesgo elevado de alucinación: el modelo no tiene mecanismos de verificación factual y generará texto plausible pero potencialmente falso.
- Solo inglés: no soporta castellano ni otros idiomas de forma fiable.
- Ventana de contexto corta (1024 tokens heredados de GPT-2), insuficiente para conversaciones multi-turno largas o documentos extensos.
- Sesgos heredados de GPT-2: el corpus de entrenamiento original contiene sesgos de género, raza y otros; el ajuste fino conversacional no los elimina y puede reforzarlos.
- Licencia Apache 2.0 permite uso comercial, pero el autor de las cuantizaciones no ofrece garantías sobre el modelo base ni sobre el ajuste fino de terceros.
- No se documentan limitaciones específicas adicionales en la model card; la información sobre el proceso de entrenamiento del modelo base es escasa.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K) pueden degradar aún más la ya limitada calidad; se recomienda Q4_K_M o superior para cualquier uso serio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/distilgpt2-tiny-conversational-GGUF
- Modelo base: https://huggingface.co/ethzanalytics/distilgpt2-tiny-conversational
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/distilgpt2-tiny-conversational-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#distilgpt2-tiny-conversational-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor: https://www.nethype.de/

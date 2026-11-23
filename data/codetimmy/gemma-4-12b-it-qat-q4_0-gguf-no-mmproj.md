# CodeTimmy/gemma-4-12B-it-qat-q4_0-gguf-no-mmproj

## Resumen

Gemma 4 12B es un modelo de lenguaje multimodal desarrollado por Google DeepMind, publicado bajo licencia Apache 2.0. Esta ficha concreta corresponde a una conversión GGUF en cuantización Q4_0 realizada por el usuario CodeTimmy a partir del checkpoint oficial `google/gemma-4-12B-it-qat-q4_0-unquantized`, es decir, del pipeline de Quantization-Aware Training (QAT) de Google. El modelo procesa texto, imagen y audio como entrada, y genera texto como salida.

La arquitectura es un transformer denso de 11.950 millones de parámetros (11.907.350.576 según los safetensors del repo base), con 48 capas, ventana de atención deslizante de 1024 tokens y una longitud de contexto de 256.000 tokens. Emplea atención híbrida que intercala capas de atención local con capas de atención global, con Keys y Values unificados y Proportional RoPE (p-RoPE) en las capas globales para reducir el consumo de memoria en contextos largos.

La relevancia de esta variante radica en el pipeline QAT: Google entrena el modelo teniendo en cuenta la cuantización, de modo que el checkpoint Q4_0 conserva una calidad próxima a bfloat16 con una huella de memoria muy inferior. El repo ocupa 7,2 GB en formato GGUF, lo que lo hace desplegable en GPUs de consumo y estaciones de trabajo. El nombre del repo indica "no-mmproj", es decir, que los tensores del proyector multimodal han sido excluidos de esta conversión, por lo que el uso práctico queda restringido a texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (sliding window local + global), Keys/Values unificados y p-RoPE en capas globales |
| Parametros totales | 11.907.350.576 (11,95B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantizacion | Q4_0 (QAT); el pipeline oficial incluye además wNa8o8 para móvil y w4a16 en compressed-tensors para vLLM |
| Idiomas soportados | Más de 140 idiomas según la model card de la familia; no se detalla lista concreta en esta conversión |
| Licencia | Apache 2.0 (con license_link a la licencia específica de Gemma 4) |
| Formato de pesos | GGUF (repo de 7,2 GB); el base_model está en safetensors sin cuantizar |
| Capas | 48 |
| Ventana de atención deslizante | 1.024 tokens |
| Tamaño de vocabulario | 262.000 tokens |
| Modalidades de entrada | Texto, imagen y audio (según la familia); esta conversión excluye mmproj, por lo que en la práctica solo texto |
| Modalidades de salida | Texto |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer densa de 48 capas con un mecanismo de atención híbrido: intercala capas de atención local con ventana deslizante de 1024 tokens y capas de atención global, garantizando que la última capa sea siempre global. Para contener el coste de memoria en contextos largos, las capas globales comparten Keys y Values y aplican Proportional RoPE (p-RoPE). El vocabulario es de 262.000 tokens, lo que facilita la cobertura multilingüe.

El checkpoint del que deriva esta conversión pertenece al pipeline de Quantization-Aware Training de Google DeepMind: el modelo se entrena simulando la cuantización Q4_0, de forma que los pesos cuantizados mantienen una calidad cercana a bfloat16. La model card de la familia menciona variantes preentrenadas e instruction-tuned, soporte nativo del rol `system`, modos de razonamiento configurables y soporte nativo de function calling. No se especifica en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

Esta conversión concreta, realizada por CodeTimmy, toma el checkpoint QAT sin cuantizar y lo serializa en GGUF Q4_0 omitiendo el proyector multimodal (mmproj). El resultado es un archivo de 7,2 GB orientado a inferencia de texto en el ecosistema GGUF.

## Capacidades

- Generación de texto y razonamiento con modos de pensamiento configurables (thinking modes), según la familia Gemma 4.
- Generación de código y tareas de matemáticas, con mejoras declaradas por Google en benchmarks de coding para la familia.
- Soporte nativo de function calling / tool calling, orientado a flujos agénticos.
- Soporte nativo del rol `system` para conversaciones estructuradas y controlables.
- Capacidades multilingües en más de 140 idiomas.
- Capacidad multimodal de entrada (texto, imagen y audio en el modelo 12B) en el checkpoint original; esta conversión GGUF sin mmproj no incluye el proyector, por lo que la entrada efectiva es solo texto.
- Compatibilidad con decodificación especulativa mediante modelo asistente (multi-token prediction), siempre que el asistente sea también un checkpoint QAT con la misma precisión.

## Casos de uso

- Generación de código en pipelines de CI/CD: el modelo puede integrarse como revisor automático de pull requests o generador de tests, aprovechando su soporte de function calling para invocar herramientas del repositorio y su contexto de 256K tokens para analizar varios archivos a la vez.
- Agentes autónomos multi-paso: con soporte nativo de tool calling y rol `system`, se puede orquestar un agente que consulte APIs, ejecute comandos y mantenga estado en conversaciones largas sin perder el hilo gracias a la ventana de 256K.
- Asistente de documentación técnica: indexación de manuales extensos dentro del contexto para responder preguntas con referencias al texto original, adecuado por la ventana de 256K y el vocabulario multilingüe.
- Atención al cliente automatizada: gestión de conversaciones multi-turno con historial largo, usando el rol `system` para fijar políticas de la empresa y el modo de razonamiento para resolver consultas complejas.
- Análisis y resumen de corpus legales o académicos: ingestión de documentos de decenas de miles de tokens en una sola pasada, con la atención híbrida reduciendo el coste de memoria frente a un transformer de atención global completa.
- Despliegue en estación de trabajo o GPU de consumo: al ocupar 7,2 GB en GGUF Q4_0, es viable en tarjetas con 8-12 GB de VRAM para prototipado local, generación de texto y tareas de coding sin depender de la nube.
- Traducción y generación multilingüe: cobertura de más de 140 idiomas declarada por la familia, útil para localización de contenido técnico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 7,2 GB solo para los pesos en Q4_0, más overhead de contexto KV. Con contexto moderado (8K-16K tokens) el consumo total se sitúa típicamente en el rango de 9-12 GB; con contexto cercano a 256K el KV cache crece de forma significativa y requiere GPUs de 24 GB o más, o bien offloading a CPU.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) o A100/H100 para contexto largo; RTX 3090/4080 (16-24 GB) para uso general; GPUs de 8-12 GB para contexto corto.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 8 GB de VRAM en cuantización Q4_0 y contexto reducido; en 12 GB o más con contexto medio.
- Opciones de despliegue: llama.cpp, Ollama, servidores compatibles con GGUF (por ejemplo, llama-cpp-python o text-generation-webui). El pipeline oficial de Google ofrece además compressed-tensors w4a16 para vLLM, pero esta conversión concreta es GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Formato disponible |
|---|---|---|---|---|---|
| Gemma 4 12B QAT Q4_0 GGUF (esta ficha) | 11,95B denso | 256K | Texto (esta conversión); texto, imagen y audio en el original | Apache 2.0 | GGUF Q4_0 |
| Gemma 4 31B Dense | 30,7B denso | 256K | Texto e imagen | Apache 2.0 | QAT en varias cuantizaciones |
| Gemma 4 26B A4B | MoE (parámetros activos no detallados) | 256K | No detallado | Apache 2.0 | QAT en varias cuantizaciones |
| Gemma 4 E4B | 4,5B efectivos (8B con embeddings) | 128K | Texto, imagen y audio | Apache 2.0 | QAT, wNa8o8 móvil |

La comparativa se limita a la propia familia Gemma 4 porque la información disponible no incluye datos de rendimiento frente a modelos de otros fabricantes. El 12B se posiciona como el punto medio denso: el doble de contexto que los E2B/E4B y la mitad de parámetros que el 31B, con soporte de audio que el 31B no tiene.

## Limitaciones y advertencias

- Esta conversión excluye el proyector multimodal (mmproj): no es posible usar imagen ni audio como entrada, aunque el modelo base los soporte.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta; es una conversión de terceros, no un artefacto oficial de Google, y no ha pasado por una validación comunitaria amplia.
- Al ser una cuantización Q4_0, existe una pérdida de calidad respecto a bfloat16, atenuada por el entrenamiento QAT pero no eliminada; conviene validar en la tarea concreta antes de producción.
- Riesgo de alucinación inherente a los modelos de lenguaje, no cuantificado en la información disponible.
- Sesgos conocidos: no disponibles en la información proporcionada; se recomienda consultar la model card oficial de Gemma 4.
- La licencia declarada es Apache 2.0, pero el enlace de licencia apunta a los términos específicos de Gemma 4; verificar dichos términos antes de un uso comercial, especialmente en lo relativo a restricciones de uso aceptable.
- La decodificación especulativa requiere que el modelo asistente sea también un checkpoint QAT de la misma precisión; un asistente en otra precisión puede degradar la calidad.
- El contexto de 256K es costoso en memoria KV; en GPUs de consumo el contexto práctico será muy inferior al nominal.
- Idiomas: aunque la familia declara más de 140 idiomas, no se detalla el rendimiento por idioma en esta conversión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/CodeTimmy/gemma-4-12B-it-qat-q4_0-gguf-no-mmproj
- Modelo base: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized
- Colección QAT Q4_0 de Google: https://huggingface.co/collections/google/gemma-4-qat-q4-0
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento de QAT para Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/quantization-aware-training-gemma-4/
- Documentación de Gemma: https://ai.google.dev/gemma/docs/core
- Informe técnico (arXiv 2607.02770): https://arxiv.org/abs/2607.02770
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de modelos Gemma de DeepMind: https://deepmind.google/models/gemma/

# anontard/gemma-4-12B-it-qat-q4_0-gguf

## Resumen

El modelo `anontard/gemma-4-12B-it-qat-q4_0-gguf` es una conversión al formato GGUF con cuantización Q4_0 del checkpoint `google/gemma-4-12B-it-qat-q4_0-unquantized`, perteneciente a la familia Gemma 4 de Google DeepMind. El trabajo original de cuantización consciente del entrenamiento (QAT) fue realizado por Google, y este repositorio lo adapta para facilitar su despliegue en ecosistemas como llama.cpp u Ollama. Se trata de un modelo denso de aproximadamente 11.950 millones de parámetros, multimodal (texto, imagen y audio) y con una ventana de contexto de 256.000 tokens.

La relevancia de esta conversión radica en que combina la calidad de un modelo de 12B entrenado con QAT con la portabilidad del formato GGUF. Permite ejecutar un modelo de razonamiento y agentes con soporte nativo de function calling en estaciones de trabajo con GPU de consumo, manteniendo una calidad similar a la de un checkpoint en bfloat16 pero con requisitos de memoria notablemente reducidos. El modelo está publicado bajo licencia Apache 2.0, lo que habilita su uso comercial, aunque la versión actual es una publicación de terceros con muy poca adopción en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
| --- | --- |
| Arquitectura | Transformer denso con atención híbrida (atención global y ventana deslizante de 1024 tokens) |
| Parametros totales | 11.907.350.576 (11,95B según la documentación de Gemma 4) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256.000 tokens (256K) |
| Tipos de cuantizacion | Q4_0 (GGUF) en este repo; el checkpoint base QAT es unquantized bfloat16 |
| Idiomas soportados | Más de 140 idiomas (según la documentación de Gemma 4) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_0) |

## Arquitectura y entrenamiento

El modelo base Gemma 4 12B es un transformer denso que emplea un mecanismo de atención híbrida. Esta arquitectura intercala capas de atención global con capas de atención local de ventana deslizante (tamaño de ventana de 1024 tokens), garantizando que la última capa sea siempre global. Para optimizar la memoria en contextos largos, las capas globales utilizan claves y valores unificados y aplican RoPE proporcional (p-RoPE). El modelo procesa texto, imágenes (con resolución y relación de aspecto variables) y audio, y genera texto como salida. El vocabulario tiene un tamaño de 262.000 tokens.

El entrenamiento del checkpoint base incorpora QAT (Quantization-Aware Training), una técnica que integra la cuantización durante el proceso de entrenamiento para preservar una calidad similar a bfloat16 mientras se reduce el peso de los pesos. No se disponen en la información proporcionada de datos sobre el número total de tokens de entrenamiento, la composición del dataset ni la aplicación de técnicas como RLHF o DPO. En cuanto a innovaciones adicionales, el modelo ofrece modos de pensamiento configurables, soporte nativo del rol `system` en los diálogos y una integración nativa de function calling.

## Capacidades

- Razonamiento configurable: el modelo ofrece modos de pensamiento (thinking modes) que permiten activar o desactivar el razonamiento explícito según la tarea.
- Multimodalidad: procesa texto, imágenes con resolución y relación de aspecto variables, y audio en el caso del modelo de 12B.
- Soporte nativo de tool calling / function calling, lo que facilita la integración con herramientas externas y API.
- Capacidades agénticas: puede ejecutar razonamiento multi-paso y actuar como componente central en agentes autónomos.
- Soporte nativo del rol `system`, que permite estructurar conversaciones y controlar el comportamiento del modelo mediante instrucciones del sistema.
- Multilingüismo: cubre más de 140 idiomas, incluyendo generación y comprensión de texto en múltiples lenguas.
- Contexto largo de 256K tokens, adecuado para documentos extensos, logs o historiales de conversación completos.
- Generación de código y mejora en tareas de programación, según la documentación del modelo base.
- Eficiencia de despliegue: gracias a la cuantización QAT Q4_0, el modelo conserva una calidad próxima a bfloat16 reduciendo significativamente la memoria necesaria para cargar los pesos.

## Casos de uso

- Asistentes locales en equipos de consumo: el formato GGUF permite ejecutar el modelo con llama.cpp u Ollama en una estación de trabajo con al menos 16 GB de VRAM. Es adecuado para un asistente personal que gestione historiales de conversación largos sin depender de servicios en la nube.
- Análisis multimodal de documentos: al aceptar imágenes como entrada, el modelo puede extraer información de capturas de pantalla, documentos escaneados o informes con gráficos. Su ventana de 256K permite procesar documentos extensos de una sola pasada.
- Agentes de desarrollo de software: el soporte nativo de function calling permite integrarlo en pipelines de CI/CD para generar código, ejecutar tests, revisar pull requests o automatizar tareas de mantenimiento.
- Transcripción y resumen de audio: el modelo procesa audio, lo que lo habilita para transcribir reuniones o llamadas telefónicas y generar resúmenes estructurados con decisiones, acciones y puntos pendientes.
- Atención al cliente multilingüe: con más de 140 idiomas y una ventana de 256K tokens, puede gestionar hilos de soporte largos en varios idiomas, manteniendo el contexto completo de la conversación y respondiendo con coherencia.
- Razonamiento para planificación y agentes: los modos de pensamiento configurables permiten activar razonamiento explícito en tareas de planificación compleja, análisis de rutas o resolución de problemas en entornos agénticos.
- Soporte para RAG: su contexto largo y su capacidad de diálogo permiten inyectar fragmentos recuperados de un corpus y generar respuestas informadas. No se han publicado datos específicos sobre el uso del modelo para generación de embeddings, pero puede emplearse como componente generativo en pipelines de recuperación.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La documentación del modelo base menciona mejoras en tareas de codificación y razonamiento, así como una calidad similar a bfloat16 gracias al entrenamiento QAT, pero no se ofrecen cifras concretas de MMLU, HumanEval, GSM8K u otras evaluaciones en los materiales consultados.

## Requisitos de hardware

- El archivo GGUF del repositorio pesa aproximadamente 7,2 GB. La memoria necesaria solo para cargar los pesos es de unos 8 GB de VRAM, pero la ventana de contexto de 256K incrementa notablemente el tamaño del KV cache.
- Estimación orientativa de VRAM: 10-12 GB para contextos cortos; 16-24 GB para aprovechar la ventana completa de 256K tokens o para atender concurrencia moderada.
- GPUs recomendadas: RTX 4080 o RTX 4090 (16-24 GB) para equipos de consumo; A100 o H100 para despliegues en servidores con mayor concurrencia. Una RTX 3090 de 24 GB también puede manejar el modelo con contexto largo.
- Sí cabe en GPUs de consumo, siempre que dispongan de al menos 12-16 GB de VRAM. No es viable en tarjetas de 8 GB si se pretende usar el contexto largo al completo.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui o cualquier runtime compatible con formatos GGUF. No se recomienda vLLM para este repo en concreto, ya que vLLM utiliza el formato compressed-tensors en lugar de GGUF.
- Latencia y throughput: no disponibles en la información consultada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Formato de pesos | Licencia |
| --- | --- | --- | --- | --- | --- |
| Gemma 4 12B QAT Q4_0 GGUF (este repo) | 11,95B | 256K | Texto, imagen, audio | GGUF Q4_0 | Apache 2.0 |
| Gemma 4 12B QAT Q4_0 unquantized (base) | 11,95B | 256K | Texto, imagen, audio | Safetensors (bfloat16) | Apache 2.0 |
| Gemma 4 E4B QAT | 4,5B efectivos | 128K | Texto, imagen, audio | Safetensors, GGUF o móvil | Apache 2.0 |
| Gemma 4 31B QAT | 30,7B | 256K | Texto, imagen | Safetensors, GGUF o compressed-tensors | Apache 2.0 |

La comparativa se basa en las especificaciones publicadas en la documentación oficial de Gemma 4. No se incluyen datos de benchmarks porque no se han publicado cifras en la información disponible. El modelo de este repo se diferencia del checkpoint base en que ofrece la cuantización Q4_0 en formato GGUF, mientras que el resto de alternativas conservan los pesos originales en bfloat16 u otros formatos de cuantización.

## Limitaciones y advertencias

- La información disponible no detalla sesgos específicos del modelo. Al estar entrenado sobre datos de gran escala, puede heredar sesgos sociales y culturales presentes en el corpus.
- No se han publicado evaluaciones de seguridad ni medidas de alineación (como jailbreak o robustness frente a prompts adversarios) en los materiales consultados.
- El riesgo de alucinación no está documentado, pero es inherente a los modelos generativos. Se recomienda validar las salidas en aplicaciones críticas.
- La documentación indica soporte para más de 140 idiomas, pero no se ofrecen métricas de calidad por lengua. El rendimiento puede ser significativamente inferior en idiomas con menos representación en los datos de entrenamiento.
- La licencia Apache 2.0 habilita el uso comercial, pero deben revisarse las condiciones específicas de la licencia de Gemma 4 en el enlace proporcionado, especialmente las atribuciones y las restricciones de marca.
- Este repositorio es una conversión realizada por un tercero (`anontard`). En el momento de la consulta, el modelo tiene 0 descargas y 0 likes, por lo que no ha sido validado por la comunidad. Se recomienda verificar la integridad de los archivos y la calidad de la cuantización antes de usarlo en producción.
- El uso de decodificación especulativa con un modelo auxiliar requiere que el asistente también sea un checkpoint QAT con la misma precisión, según la documentación oficial. No aplicar esta regla puede provocar incompatibilidades.
- Aunque los pesos cuantizados reducen la memoria, la ventana de contexto de 256K sigue siendo exigente. En inferencia con GGUF, el tamaño del KV cache puede hacer que el modelo necesite más VRAM de lo esperado para contextos muy largos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/anontard/gemma-4-12B-it-qat-q4_0-gguf
- Modelo base en Hugging Face: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized
- Modelo oficial de Google en Hugging Face: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-gguf
- Colección de modelos Gemma 4 QAT: https://huggingface.co/collections/google/gemma-4-qat-q4-0
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/quantization-aware-training-gemma-4/
- Documentación oficial de Gemma: https://ai.google.dev/gemma/docs/core
- Informe técnico: https://arxiv.org/abs/2607.02770
- Página de referencia no oficial: https://local-ai-zone.github.io/models/gemma-4-12b-it-qat-q4-0.html

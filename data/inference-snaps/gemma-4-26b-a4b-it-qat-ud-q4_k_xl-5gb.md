# inference-snaps/gemma-4-26B-A4B-it-qat-UD-Q4_K_XL-5GB

## Resumen

El modelo `inference-snaps/gemma-4-26B-A4B-it-qat-UD-Q4_K_XL-5GB` es una cuantización GGUF del modelo Gemma 4 26B A4B IT de Google DeepMind, preparada por el usuario de HuggingFace `inference-snaps`. Gemma 4 es una familia de modelos abiertos y multimodales que aceptan entrada de texto e imagen y generan texto, con soporte nativo de tool calling, razonamiento y contextos largos de hasta 256K tokens. La variante 26B A4B utiliza una arquitectura de mezcla de expertos (MoE) con 26 mil millones de parámetros totales y solo 4 mil millones activos por token, lo que la hace especialmente eficiente para despliegue local.

Esta ficha concreta corresponde a un archivo GGUF cuantizado con el esquema UD-Q4_K_XL, que según la documentación de Unsloth es la recomendación para los modelos Gemma 4 QAT, ya que la cuantización Q4_0 degrada la precisión. El sufijo "5GB" indica que el archivo de pesos ocupa aproximadamente 5 gigabytes, lo que permite ejecutar el modelo en hardware de consumo con requisitos de memoria moderados. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto e imagen) con Mixture-of-Experts (MoE) |
| Parametros totales | 26 mil millones (26B) |
| Parametros activos | 4 mil millones (A4B) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | GGUF Q4_K_XL (esquema UD-Q4_K_XL de Unsloth) |
| Idiomas soportados | Más de 140 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Gemma 4 26B A4B IT es un modelo de arquitectura Mixture-of-Experts (MoE) con 26 mil millones de parámetros totales, de los cuales solo 4 mil millones se activan por token. Esto reduce drásticamente el coste computacional en inferencia en comparación con un modelo denso del mismo tamaño. El modelo es multimodal: acepta entradas de texto e imagen y produce salidas de texto. Ha sido entrenado con técnicas de alineación que incluyen ajuste instructivo (IT) y soporta razonamiento, system prompts y uso nativo de herramientas.

La versión QAT (Quantization-Aware Training) de este modelo ha sido entrenada teniendo en cuenta la cuantización, lo que significa que los pesos se optimizan para minimizar la pérdida de calidad al ser cuantizados. Los archivos GGUF con el prefijo UD-Q4_K_XL son producidos por Unsloth, que determinó que la cuantización q4_0 degrada la precisión en esta familia y recomienda este esquema alternativo. La cuantización QAT permite cargar el modelo con menos memoria manteniendo un comportamiento cercano al original.

## Capacidades

- Generación de texto multimodal: acepta entradas de texto e imagen y produce salida de texto.
- Razonamiento complejo: diseñado para tareas de razonamiento y resolución de problemas en varios dominios.
- Generación de código: soporta tareas de programación en múltiples lenguajes.
- Tool calling nativo: puede invocar funciones y herramientas externas de forma estructurada.
- Soporte de system prompts: permite configurar el comportamiento del modelo en conversaciones multi-turno.
- Contexto largo: ventana de hasta 256K tokens, adecuada para documentos extensos y conversaciones largas.
- Multilingüismo: soporte en más de 140 idiomas, incluyendo español, inglés, francés, alemán, etc.
- Despliegue local eficiente: la arquitectura MoE con 4B activos y la cuantización Q4 permiten ejecución en hardware de consumo.

## Casos de uso

- Asistente de programación local: el modelo puede generar, revisar y explicar código en un IDE o CLI, aprovechando los 4B parámetros activos para una latencia baja en GPU de consumo como RTX 3060 o superiores.
- Análisis de documentos extensos: gracias a la ventana de 256K tokens, permite resumir contratos, informes técnicos o libros completos sin necesidad de chunking.
- Automatización de agentes con tool calling: integrado en frameworks como LangChain o LlamaIndex, puede actuar como agente que consulta APIs, bases de datos o ejecuta scripts de forma autónoma.
- Traducción y localización: con soporte para más de 140 idiomas, sirve para traducir contenido técnico o legal con calidad razonable en un entorno offline.
- Chatbot de atención al cliente en español: el modelo puede gestionar conversaciones multi-turno con contexto largo, manteniendo el estado de la conversación durante toda la sesión.
- Análisis de imágenes con generación de texto: dado su soporte multimodal, puede describir imágenes, extraer texto de capturas o generar informes a partir de fotografías.
- Prototipado de aplicaciones RAG: combinado con un vector store, puede responder preguntas sobre una base de conocimiento interna sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización concreta (`inference-snaps/gemma-4-26B-A4B-it-qat-UD-Q4_K_XL-5GB`) en la información disponible. El modelo base Gemma 4 26B A4B IT ha sido evaluado por Google DeepMind en tareas de razonamiento, código y comprensión multimodal, pero no se dispone de cifras verificadas en esta ficha. Se recomienda consultar la documentación oficial de Gemma 4 para datos de rendimiento del modelo original y ejecutar pruebas propias con la cuantización para validar la calidad en el caso de uso concreto.

## Requisitos de hardware

- Memoria: el archivo GGUF pesa aproximadamente 5 GB, por lo que cabe en GPUs con 6 GB de VRAM o incluso en RAM para inferencia por CPU.
- Según la documentación de Unsloth para Gemma 4 QAT, la variante 26B A4B requiere alrededor de 15 GB de RAM en la cuantización Q4 recomendada, aunque este archivo concreto de 5 GB puede tener requisitos menores al estar más comprimido.
- GPU recomendadas: RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4090 (24 GB) para ejecución cómoda con margen de contexto.
- En CPU, se puede ejecutar con llama.cpp o Ollama, aunque la velocidad será significativamente menor que en GPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (con soporte GGUF), llama-cpp-python.
- Latencia y throughput: no disponible para esta cuantización concreta; dependerá del hardware y de la longitud de contexto utilizada.

## Comparativa con modelos similares

| Modelo | Params totales | Params activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma 4 26B A4B IT (base) | 26B | 4B | 256K | Apache 2.0 | Safetensors |
| Gemma 4 26B A4B IT QAT (Unsloth) | 26B | 4B | 256K | Apache 2.0 | GGUF |
| inference-snaps/gemma-4-26B-A4B-it-qat-UD-Q4_K_XL-5GB | 26B | 4B | 256K | Apache 2.0 | GGUF |

La comparación con otros modelos de la misma categoría (MoE multimodal de ~26B con 4B activos) no está disponible en la información proporcionada. El modelo base Gemma 4 26B A4B IT se posiciona como una alternativa a otros modelos abiertos multimodales como Llama 3.2 o Qwen2-VL, pero no se dispone de una comparativa directa con cifras de rendimiento en esta fuente.

## Limitaciones y advertencias

- La cuantización Q4 puede introducir pérdida de precisión en tareas de razonamiento matemático o lógico complejo, aunque el esquema UD-Q4_K_XL está diseñado para mitigar este efecto.
- El modelo es multimodal, pero esta cuantización GGUF puede no incluir el procesador de visión completo; es necesario verificar el comportamiento con imágenes en la práctica.
- No se dispone de información sobre sesgos o alucinaciones específicos de esta cuantización; los modelos Gemma pueden presentar sesgos sociales presentes en los datos de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos de la licencia de Gemma 4 en el repositorio oficial de Google.
- El tamaño del archivo (5 GB) sugiere una cuantización muy agresiva o una versión reducida; la calidad puede ser inferior a la del modelo base QAT de 15 GB.
- No hay información sobre el autor `inference-snaps` ni sobre el proceso de cuantización; se recomienda validar el modelo en un conjunto de pruebas propio antes de usarlo en producción.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/inference-snaps/gemma-4-26B-A4B-it-qat-UD-Q4_K_XL-5GB
- Repositorio HuggingFace del modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Repositorio HuggingFace de la cuantización Unsloth: https://huggingface.co/inference-snaps/gemma-4-26B-A4B-it-UD-Q4_K_M-5GB
- Documentación de Gemma 4 QAT de Unsloth: https://unsloth.ai/docs/models/gemma-4/qat
- Documentación de Gemma 4 en LM Studio: https://lmstudio.ai/models/google/gemma-4-26b-a4b-qat
- Documentación de Gemma 4 en Google Cloud: https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/maas/google/gemma-4-26b-a4b-it

# hanli-dev/llama-2-7b-chat-hf

## Resumen

Este repositorio contiene los pesos convertidos del modelo Llama-2-7B-chat de Meta al formato HuggingFace, publicados por el usuario hanli-dev. El modelo original, desarrollado por Meta AI, es una versión ajustada para diálogo del modelo base Llama-2 de 7 mil millones de parámetros, optimizado mediante fine-tuning supervisado y RLHF. Esta conversión permite cargar el modelo directamente con la librería `transformers` de HuggingFace, facilitando su uso en aplicaciones de generación de texto y chat.

La relevancia de este repositorio radica en que ofrece los pesos en un formato estándar y listo para usar, evitando al usuario el proceso de conversión manual. No se trata de un modelo nuevo, sino de una redistribución del modelo original de Meta bajo la licencia Llama 2 Community License. Aunque el repositorio no presenta descargas ni interacciones, su utilidad es práctica para desarrolladores que necesitan acceso rápido a los pesos en formato HuggingFace.

El modelo en sí es un transformer autoregresivo con 7B parámetros, contexto de 4096 tokens y capacidades multilingües limitadas, centrado principalmente en inglés. Es adecuado para tareas de generación de texto, chat y razonamiento básico, aunque ha sido superado por modelos posteriores más eficientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo (decoder-only) |
| Parametros totales | 7 mil millones (7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | No especificados en el repositorio; el modelo original soporta cuantizacion (GGUF, GPTQ, AWQ) |
| Idiomas soportados | Principalmente ingles; otros idiomas con rendimiento limitado |
| Licencia | Llama 2 Community License (other) |
| Formato de pesos | Safetensors (HuggingFace) |

Nota: los valores de arquitectura, parametros y contexto corresponden al modelo original Llama-2-7B-chat de Meta, ya que este repositorio es una conversion de pesos sin modificaciones.

## Arquitectura y entrenamiento

El modelo Llama-2-7B-chat se basa en una arquitectura transformer decoder-only, con normalizacion RMSNorm, activacion SwiGLU y atencion con ventana deslizante. Fue entrenado sobre 2 billones de tokens de datos publicos, con un proceso de fine-tuning supervisado seguido de RLHF (Reinforcement Learning from Human Feedback) para alinear el comportamiento con preferencias humanas. El entrenamiento se realizo con una politica de seguridad y utilidad, lo que se refleja en el comportamiento del modelo.

Este repositorio no aporta informacion adicional sobre el entrenamiento; simplemente contiene los pesos ya entrenados y convertidos. No se incluyen detalles sobre el proceso de conversion ni sobre posibles modificaciones.

## Capacidades

- Generacion de texto y chat conversacional multi-turno.
- Razonamiento basico y respuesta a preguntas factuales.
- Soporte limitado de codigo (generacion de fragmentos simples).
- Capacidad de seguir instrucciones y mantener contexto en conversaciones.
- Multilingue limitado: funciona aceptablemente en ingles, con degradacion en otros idiomas.
- No incluye soporte nativo para tool calling ni funciones de agente, aunque puede adaptarse mediante prompts.
- No tiene modo de pensamiento explicito ni capacidades multimodales (solo texto).

## Casos de uso

- **Asistente de chat para atencion al cliente**: el modelo puede mantener conversaciones multi-turno con un contexto de hasta 4096 tokens, adecuado para resolver consultas frecuentes y derivar a agentes humanos cuando sea necesario.
- **Generacion de contenido preliminar**: util para redactar borradores de articulos, correos o publicaciones en redes sociales, con revision humana posterior.
- **Creacion de chatbots educativos**: puede responder preguntas sobre temas generales y explicar conceptos, aunque con riesgo de imprecision en areas especializadas.
- **Prototipado rapido de aplicaciones de lenguaje**: gracias a su formato HuggingFace, se integra facilmente con pipelines de `transformers` para pruebas de concepto.
- **Analisis de sentimiento y clasificacion de texto**: mediante prompts adecuados, puede etiquetar textos o extraer opiniones, aunque no es su punto fuerte.
- **Soporte a desarrolladores para generacion de documentacion tecnica**: puede ayudar a redactar comentarios de codigo o descripciones de funciones, con supervisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio no incluye mediciones de rendimiento ni comparaciones con otros modelos. Para referencia, el modelo original Llama-2-7B-chat obtiene resultados conocidos en MMLU, HumanEval y otros, pero esos datos no estan presentes en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos 14 GB en FP16 (el tamaño del repo es 27 GB, que incluye pesos en FP16 y posiblemente otros archivos). Con cuantizacion de 8 bits, se reduce a ~7-8 GB; con 4 bits, ~4-5 GB.
- GPUs recomendadas: NVIDIA A100, H100, RTX 4090, RTX 3090, o cualquier GPU con al menos 16 GB de VRAM para FP16 sin cuantizar.
- En consumer GPU: cabe en RTX 3090/4090 (24 GB) en FP16, y en GPUs de 8 GB con cuantizacion (RTX 3070, RTX 2080, etc.).
- Opciones de despliegue: vLLM, llama.cpp (con formato GGUF), Ollama, HuggingFace TGI, o directamente con `transformers` y `accelerate`.
- Latencia y throughput estimados: no disponibles en este repositorio; dependen del hardware y la optimizacion. En una A100, la generacion tipica es de 20-40 tokens/s con batch pequeno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Llama-2-7B-chat (este repo) | 7B | 4096 | Llama 2 Community | HuggingFace |
| Mistral-7B-Instruct | 7B | 8192 | Apache 2.0 | HuggingFace |
| Falcon-7B-Instruct | 7B | 2048 | Apache 2.0 | HuggingFace |
| Zephyr-7B-beta | 7B | 8192 | MIT | HuggingFace |

En terminos de rendimiento, Mistral-7B-Instruct y Zephyr-7B-beta suelen superar a Llama-2-7B-chat en tareas de razonamiento y generacion de codigo, ademas de ofrecer licencias mas permisivas (Apache/MIT). Llama-2-7B-chat tiene la ventaja de ser un modelo bien conocido y con amplia documentacion, pero su licencia restringe el uso comercial para empresas con mas de 700 millones de usuarios mensuales.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: como modelo entrenado con datos publicos, puede generar contenido sesgado o inventar hechos. No apto para uso medico, legal o financiero sin supervision humana.
- **Contexto limitado**: 4096 tokens puede ser insuficiente para documentos largos o conversaciones muy extensas.
- **Idiomas**: rendimiento optimo solo en ingles; otros idiomas pueden producir respuestas incorrectas o incoherentes.
- **Licencia**: la Llama 2 Community License prohibe el uso para mejorar otros modelos de lenguaje y exige solicitar permiso a Meta si los usuarios mensuales superan 700 millones. Ademas, no permite el uso comercial sin cumplir las condiciones.
- **Seguridad**: el modelo original tiene filtros de seguridad, pero esta conversion no incluye garantias adicionales; el usuario es responsable de implementar medidas de seguridad en produccion.
- **Formato de pesos**: aunque esta en safetensors, no se especifican cuantizaciones precalculadas; el usuario debera convertirlas si necesita formatos como GGUF.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/hanli-dev/llama-2-7b-chat-hf
- Referencia del modelo original: https://ai.meta.com/resources/models-and-libraries/llama-downloads/
- Licencia Llama 2 Community: https://ai.meta.com/llama/license/
- Politica de uso aceptable: https://ai.meta.com/llama/use-policy
- Sitio de Mirage-Studio (mencionado en la model card): https://mirage-studio.io

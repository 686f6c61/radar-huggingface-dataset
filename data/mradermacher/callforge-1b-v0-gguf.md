# mradermacher/CallForge-1B-v0-GGUF

## Resumen

CallForge-1B-v0-GGUF es una cuantización en formato GGUF del modelo CallForge-1B-v0, desarrollado originalmente por solomoniw y convertido por mradermacher. Se trata de un modelo de lenguaje de aproximadamente 1.080 millones de parámetros, especializado en tool-calling, function-calling y uso como agente conversacional. Su licencia Apache-2.0 permite uso comercial sin restricciones, y su tamaño reducido lo hace atractivo para despliegues en entornos con recursos limitados.

Esta versión GGUF ofrece doce niveles de cuantización, desde Q2_K (0,6 GB) hasta f16 (2,3 GB), lo que permite adaptar el modelo a diferentes capacidades de hardware. Al estar basado en la librería transformers, se puede ejecutar con herramientas como llama.cpp, Ollama o LM Studio. El modelo está pensado para tareas de automatización y orquestación de agentes, donde la generación de llamadas a funciones estructuradas es crítica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (inferido de la librería transformers; detalle no disponible) |
| Parametros totales | 1.080.632.832 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo original CallForge-1B-v0. Al estar registrado en la librería transformers, se asume una arquitectura transformer estándar, pero no se conocen detalles como el número de capas, cabezas de atención o dimensiones ocultas. Tampoco se han publicado datos sobre el dataset de entrenamiento, el número de tokens procesados o si se aplicaron técnicas como RLHF o DPO. La especialización en tool-calling sugiere que el entrenamiento incluyó ejemplos de llamadas a funciones, pero no hay confirmación oficial.

La cuantización realizada por mradermacher es estática, es decir, no utiliza matrices de importancia (imatrix) ni pesos ponderados. Los archivos GGUF se generaron a partir de los pesos originales en formato safetensors, y se ofrecen en múltiples niveles de precisión para equilibrar calidad y consumo de memoria.

## Capacidades

- Generación de texto conversacional en inglés.
- Tool-calling y function-calling: el modelo está diseñado para emitir llamadas a funciones estructuradas, lo que lo hace adecuado para integrarse con APIs y servicios externos.
- Soporte para agentes: puede actuar como orquestador en flujos multi-paso, decidiendo qué herramienta invocar en cada momento.
- Conversación multi-turno: al ser un modelo conversacional, mantiene el contexto de la interacción.
- Compatible con endpoints: el tag `endpoints_compatible` sugiere que puede desplegarse como servicio de inferencia.

No se han documentado capacidades adicionales como visión, audio o modo de razonamiento explícito.

## Casos de uso

- Asistentes virtuales ligeros: al tener solo 1B de parámetros, puede ejecutarse en CPU o GPUs de baja gama, permitiendo desplegar un asistente conversacional con capacidad de llamar a herramientas en dispositivos edge o servidores modestos.
- Automatización de tareas empresariales: integrado en un pipeline, puede interpretar solicitudes en lenguaje natural y ejecutar acciones mediante function-calling, como consultar bases de datos, enviar correos o actualizar registros.
- Agentes de soporte técnico: el modelo puede guiar al usuario a través de pasos de diagnóstico, invocando herramientas de verificación de sistemas o generando tickets cuando sea necesario.
- Prototipado rápido de agentes: su pequeño tamaño permite iterar rápidamente en entornos de desarrollo sin necesidad de infraestructura costosa.
- Chatbots de documentación: puede responder preguntas sobre un manual o base de conocimiento, y si se le proporciona una herramienta de búsqueda, llamarla para obtener información actualizada.
- Pruebas de concepto en investigación: para validar arquitecturas de agentes o evaluar el rendimiento de tool-calling en modelos pequeños antes de escalar a modelos más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo.

## Requisitos de hardware

- VRAM estimada: según la cuantización elegida, el modelo ocupa entre 0,6 GB (Q2_K) y 2,3 GB (f16). Para inferencia con contexto moderado, se recomienda al menos 2 GB de VRAM para las versiones Q4 y superiores.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM puede ejecutar las cuantizaciones más pequeñas. Para Q8_0 o f16, se recomienda al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, o GPUs integradas modernas).
- Compatibilidad con consumer GPU: sí, todas las cuantizaciones caben en GPUs de consumo actuales. Incluso puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, o servidores compatibles con GGUF como llama-cpp-python.
- Latencia y throughput: no se dispone de mediciones oficiales. En una GPU moderna, un modelo de 1B en Q4_K_M puede generar decenas de tokens por segundo, pero depende del hardware y la longitud de contexto.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (tool-calling de 1B). Alternativas genéricas de tamaño similar como TinyLlama-1.1B o Qwen2-0.5B existen, pero no se han publicado comparativas directas con CallForge-1B-v0. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Al ser un modelo de solo 1B de parámetros, su capacidad de razonamiento complejo y de seguir instrucciones largas es limitada en comparación con modelos de mayor tamaño.
- No se han documentado sesgos específicos, pero es probable que herede sesgos de los datos de entrenamiento, que no han sido revelados.
- Riesgo de alucinación: como todos los modelos generativos, puede producir información falsa o inventada, especialmente en tareas de razonamiento.
- Limitaciones de idioma: solo está entrenado en inglés, por lo que no es adecuado para otros idiomas sin un ajuste fino previo.
- La cuantización estática puede degradar ligeramente la calidad en comparación con el modelo original en fp16, especialmente en niveles bajos como Q2_K.
- No se ha verificado el rendimiento en producción; se recomienda realizar pruebas exhaustivas antes de un despliegue crítico.
- El modelo no incluye funcionalidades de visión ni audio, solo texto.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/CallForge-1B-v0-GGUF
- Modelo base: https://huggingface.co/solomoniw/CallForge-1B-v0
- Perfil del cuantizador: https://huggingface.co/mradermacher
- Solicitudes de modelos: https://huggingface.co/mradermacher/model_requests

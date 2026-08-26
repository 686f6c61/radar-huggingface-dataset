# publica-ai/Companion-constituency

## Resumen

Companion-constituency es un modelo de lenguaje de 268 millones de parámetros publicado por Publica AI, una organización que promueve el desarrollo de modelos de IA públicos y soberanos. El modelo está etiquetado como "conversational", lo que indica que está diseñado para tareas de diálogo y asistencia textual. Su tamaño reducido y la presencia de pesos en formato GGUF sugieren que está pensado para despliegue en entornos con recursos limitados, como dispositivos locales o servidores de baja capacidad.

El nombre del modelo y la actividad de Publica AI, que ha publicado un artículo sobre "Public Constitutional AI", sugieren una posible alineación con principios constitucionales explícitos, aunque no se dispone de documentación oficial que confirme esta característica en este modelo concreto. La ficha se basa exclusivamente en la información disponible en Hugging Face y en los resultados de búsqueda web, que son limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 268.098.176 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (según tags), safetensors |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

No se ha publicado información técnica sobre la arquitectura interna del modelo. El tamaño de 268 millones de parámetros es consistente con un transformer de escala pequeña o mediana, típico de modelos de código abierto como los de la familia GPT-2 o modelos compactos tipo BERT. La presencia de archivos GGUF indica que el modelo ha sido convertido para su uso con llama.cpp y herramientas compatibles, lo que sugiere una arquitectura transformer estándar, pero no hay confirmación oficial.

En cuanto al entrenamiento, no se dispone de datos sobre el corpus utilizado, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. La organización Publica AI ha publicado un artículo en arXiv sobre "Public Constitutional AI", que propone incorporar principios constitucionales en el entrenamiento de modelos, pero no se puede confirmar que este modelo en particular haya sido entrenado con esa metodología.

## Capacidades

- Generación de texto conversacional: el tag "conversational" indica que el modelo está optimizado para mantener diálogos multi-turno.
- Inferencia local eficiente: gracias al formato GGUF, puede ejecutarse en CPU o GPU de baja gama mediante llama.cpp, Ollama u otras herramientas compatibles.
- Compatibilidad con endpoints: el tag "endpoints_compatible" sugiere que puede desplegarse tras una API compatible con OpenAI, lo que facilita su integración en aplicaciones existentes.
- No se han documentado capacidades adicionales como tool calling, razonamiento avanzado, visión o soporte multilingüe.

## Casos de uso

- Chatbot de soporte técnico en entornos con recursos limitados: el modelo puede desplegarse en un servidor con CPU y poca RAM, ofreciendo respuestas automáticas a preguntas frecuentes sin necesidad de GPU dedicada.
- Asistente personal en dispositivos edge: su tamaño compacto permite ejecutarlo en una Raspberry Pi o un mini PC, proporcionando una capa de conversación local sin depender de la nube.
- Prototipado rápido de aplicaciones conversacionales: los desarrolladores pueden usar el modelo con llama.cpp para validar flujos de diálogo antes de migrar a modelos más grandes.
- Herramienta educativa para demostrar alineación constitucional: si el modelo incorpora principios de Constitutional AI, puede servir como ejemplo práctico en cursos sobre ética y seguridad en IA.
- Filtro previo en pipelines de generación: al ser ligero, puede usarse para preclasificar consultas o generar borradores de respuesta que luego refina un modelo mayor.
- Despliegue en entornos con requisitos de soberanía de datos: al ser un modelo abierto y alojado en la región US, puede ejecutarse en infraestructura propia sin enviar datos a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 268 millones de parámetros en FP16 ocupa aproximadamente 536 MB, en int8 unos 268 MB y en int4 unos 134 MB. Con cuantización GGUF Q4_K_M, cabría en GPUs con 2 GB de VRAM o incluso en CPU con 4 GB de RAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 2060, etc.) puede ejecutar el modelo. También funciona en CPU moderna con instrucciones AVX2.
- Compatibilidad con consumer GPU: sí, cabe en la mayoría de GPUs de consumo actuales.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o servidores compatibles con la API de OpenAI mediante el tag "endpoints_compatible".
- Latencia y throughput estimados: no disponibles, pero en CPU se pueden esperar decenas de tokens por segundo para un modelo de este tamaño.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos. Dado el tamaño de 268M parámetros, podría compararse con modelos como GPT-2 (124M o 355M), pero no hay datos de rendimiento para establecer una comparación objetiva.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos o alucinaciones, pero al ser un modelo pequeño, es probable que tenga limitaciones en razonamiento complejo y conocimientos factuales.
- La licencia no está especificada, por lo que el uso comercial y la redistribución están sujetos a incertidumbre legal.
- El idioma de entrenamiento no se indica, por lo que no se garantiza un rendimiento óptimo en castellano.
- El modelo tiene solo 268M parámetros, lo que limita su capacidad para tareas que requieran un contexto extenso o conocimientos especializados.
- No hay documentación sobre la longitud de contexto soportada, lo que dificulta planificar su uso en aplicaciones con historiales de conversación largos.

## Enlaces

- Hugging Face: https://huggingface.co/publica-ai/Companion-constituency
- GitHub de Publica AI: https://github.com/Publica-AI/
- Sitio web de Public AI: https://publicai.co/
- Paper sobre Public Constitutional AI (arXiv): https://arxiv.org/pdf/2406.16696v2
- Perfil de PublicaAI en Hugging Face: https://huggingface.co/publica-ai/models

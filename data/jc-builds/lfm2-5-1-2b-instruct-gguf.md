# jc-builds/LFM2.5-1.2B-Instruct-GGUF

## Resumen

LFM2.5-1.2B-Instruct es un modelo de lenguaje desarrollado por Liquid AI, orientado a seguir instrucciones y diseñado para ejecutarse de forma eficiente en dispositivos locales. Esta versión concreta es una cuantización GGUF en formato Q4_K_M publicada por jc-builds para el ecosistema Haplo, con el objetivo de facilitar la inferencia en iPhone, iPad y Macs con Apple Silicon mediante llama.cpp o aplicaciones compatibles. El modelo tiene 1.170.340.608 parámetros (aproximadamente 1,2 mil millones) y utiliza una arquitectura híbrida que combina bloques de convolución corta con capas de atención de consultas agrupadas (GQA), lo que reduce el tamaño del KV cache y acelera la decodificación. Su relevancia actual se debe a la creciente demanda de modelos de IA on-device que funcionen sin conexión, preserven la privacidad y consuman pocos recursos. La longitud de contexto no se especifica en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | lfm2 (híbrida: 10 bloques de convolución corta + 6 capas GQA) |
| Parámetros totales | 1.170.340.608 (1,2B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (única disponible en el repo) |
| Idiomas soportados | Inglés |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | GGUF (Q4_K_M) y safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura híbrida denominada `lfm2`, compuesta por 10 bloques de convolución corta y 6 capas de atención con consultas agrupadas (GQA). Esta combinación permite mantener un KV cache pequeño y lograr una decodificación rápida, características especialmente útiles en hardware móvil con memoria limitada. No se dispone de información detallada sobre los datos de entrenamiento, el número de tokens, la composición del dataset ni el uso de técnicas como RLHF o DPO en la información proporcionada; por tanto, estos datos se indican como no disponibles. La innovación técnica más destacable es la integración de convoluciones y GQA para optimizar la eficiencia en dispositivos de consumo.

## Capacidades

- Generación de texto y seguimiento de instrucciones: el modelo está diseñado para responder a instrucciones en formato ChatML, con un rendimiento destacado para su tamaño.
- Inferencia en dispositivos móviles: gracias a la arquitectura híbrida y a la cuantización Q4_K_M, puede ejecutarse en iPhone, iPad y Macs con Apple Silicon mediante llama.cpp o aplicaciones como Haplo.
- Soporte de conversación multi-turno: al utilizar ChatML, es adecuado para chats con contexto conversacional.
- Capacidades multilingües: según la información disponible, el modelo soporta únicamente inglés.
- No se han documentado capacidades de tool calling, agentes, visión o audio en la información proporcionada.

## Casos de uso

- Asistente personal en iPhone: el modelo puede ejecutarse localmente en un iPhone mediante Haplo, ofreciendo respuestas a preguntas y ayuda con tareas cotidianas sin conexión a internet. Su tamaño de 0,73 GB permite que funcione en dispositivos con almacenamiento limitado.
- Chatbot de soporte en aplicaciones móviles: al ser una cuantización GGUF, puede integrarse en apps iOS o macOS para ofrecer un asistente conversacional que respete la privacidad del usuario, ya que los datos no salen del dispositivo.
- Herramienta de redacción y corrección de textos en inglés: el modelo puede ayudar a redactar correos, resumir textos o revisar gramática en inglés directamente en el dispositivo, sin depender de APIs externas.
- Asistente para desarrolladores en el terminal: mediante llama.cpp, se puede usar desde la línea de comandos en un Mac con Apple Silicon para generar texto técnico, explicar conceptos o ayudar con tareas de programación, aprovechando la baja latencia de decodificación.
- Aplicaciones educativas offline: el modelo puede usarse en apps de aprendizaje de inglés o tutoría virtual, proporcionando explicaciones y resolviendo dudas sin necesidad de conexión a internet.
- Prototipado rápido de chatbots: dado su tamaño reducido y su formato GGUF, es fácil de probar en local con llama.cpp, lo que permite iterar rápidamente en el diseño de prompts y flujos de conversación antes de escalar a modelos más grandes.
- Automatización de tareas de texto en entornos con privacidad estricta: empresas que no pueden enviar datos a la nube pueden desplegar este modelo en dispositivos locales para tareas de clasificación de texto, extracción de información o generación de respuestas estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~0,73 GB para los pesos en Q4_K_M, más overhead de activaciones y KV cache; se recomienda al menos 1 GB de VRAM libre.
- GPU recomendadas: no se especifican en la información; por su tamaño, cualquier GPU moderna con 1-2 GB de VRAM es suficiente, incluidas gráficas integradas.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo (por ejemplo, RTX 4060, Apple Silicon, etc.).
- Opciones de despliegue: llama.cpp, aplicaciones que lo envuelven como Haplo; también puede usarse con cualquier framework compatible con GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos en la información proporcionada; sin embargo, al ser un modelo pequeño, puede reflejar sesgos presentes en sus datos de entrenamiento.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar contenido no veraz o inventado, especialmente en temas especializados.
- Limitaciones de idioma: solo soporta inglés, por lo que no es adecuado para aplicaciones en otros idiomas.
- Restricciones de licencia para uso comercial: la LFM Open License v1.0 permite uso comercial solo si los ingresos anuales del licenciatario (incluidas filiales) son inferiores a 10.000.000 USD; superar ese umbral requiere una licencia distinta.
- Limitaciones de contexto: la longitud de contexto no está disponible en la información, por lo que se desconoce la capacidad máxima de ventana de contexto.
- Modelo pequeño: al tener solo 1.2B de parámetros, su capacidad de razonamiento complejo y de seguir instrucciones largas puede ser inferior a la de modelos más grandes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jc-builds/LFM2.5-1.2B-Instruct-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Licencia: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct/blob/main/LICENSE
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Haplo: https://haploapp.com

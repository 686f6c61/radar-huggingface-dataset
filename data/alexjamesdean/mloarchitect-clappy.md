# AlexJamesDean/MLOArchitect-Clappy

## Resumen

Clappy es un asistente local experimental integrado en MLOArchitect, una herramienta de construccion de interiores (MLO) para servidores de FiveM sobre GTA V desarrollada por AJTheDev. El modelo es un fine-tuning mediante LoRA sobre LiquidAI/LFM3-Audio-2B, un modelo de lenguaje con capacidad de audio de 2.000 millones de parametros de Liquid AI, y se distribuye empaquetado con llama.cpp y un modelo de embeddings (EmbeddingGemma 2 de Google DeepMind) para busqueda semantica sobre la base de conocimiento de la aplicacion.

Su proposito es responder preguntas sobre el funcionamiento de MLOArchitect y aplicar cambios menores sobre la construccion del usuario, todo ello ejecutandose en la GPU del propio usuario sin enviar datos a servicios externos. El pack incluye el modelo cuantizado a Q4_K_M, el proyector de audio para la funcion de voz, la LoRA entrenada por AJTheDev y el modelo de embeddings en Q8_0.

Se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, publicado el 2 de noviembre de 2026 y marcado explicitamente como experimental por su autor. No dispone de model card tecnica detallada ni de resultados de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base LFM3-Audio-2B de Liquid AI, con proyector de audio y adaptador LoRA) |
| Parametros totales | 2.000 millones (modelo base) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (modelo principal), Q8_0 (EmbeddingGemma 2) |
| Idiomas soportados | Ingles (en) |
| Licencia | LFM Open License v1.0 (lfm1.0); EmbeddingGemma 2 bajo Apache 2.0 con Gemma Prohibited Use Policy; llama.cpp bajo MIT |
| Formato de pesos | GGUF (para llama.cpp) y LoRA |
| Tamano del repositorio | 2,1 GB (pack `clappy-1.0.0.zip`) |
| Modelo base | LiquidAI/LFM3-Audio-2B y google/embeddinggemma-2 |
| Runtime incluido | llama.cpp b11972 (Windows x64, Vulkan) |

## Arquitectura y entrenamiento

El modelo se construye sobre LiquidAI/LFM3-Audio-2B, un modelo de 2.000 millones de parametros de Liquid AI que incorpora capacidad de procesamiento de audio mediante un proyector dedicado, lo que permite la funcion de voz de Clappy. Sobre esta base, AJTheDev entreno una LoRA especifica para el dominio de MLOArchitect. No se especifica en la informacion disponible el numero exacto de ejemplos de entrenamiento (la model card menciona "unos pocos miles"), la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO.

El sistema completo combina el modelo generativo con EmbeddingGemma 2, un modelo de embeddings de Google DeepMind convertido a GGUF y cuantizado a Q8_0, que se emplea para busqueda semantica sobre la base de conocimiento propia de la aplicacion. La inferencia se realiza con llama.cpp compilado con backend Vulkan, lo que permite ejecucion en GPU sin requerir CUDA. El pack se distribuye con verificacion de integridad mediante SHA-256 (`adc3bef25b4f08a0811c749f56d118a81ed3b89e3142d1cff72000bbf3ec0367`).

## Capacidades

- Generacion de texto en ingles orientada a preguntas y respuestas sobre la aplicacion MLOArchitect.
- Procesamiento de audio de entrada mediante el proyector de audio del modelo base, habilitando interaccion por voz.
- Busqueda semantica sobre la base de conocimiento de la aplicacion mediante EmbeddingGemma 2.
- Aplicacion de cambios menores sobre la construccion del usuario (MLO) a peticion explicita.
- Reconocimiento explicito de los limites de su base de conocimiento: indica cuando una respuesta no esta en ella.
- Confirmacion previa antes de eliminar elementos de una construccion.
- Reversion de cada cambio en un unico paso de deshacer.
- Ejecucion completamente local, sin envio de datos a servicios externos.

## Casos de uso

- Asistencia integrada en la aplicacion: el usuario consulta dudas sobre el funcionamiento de MLOArchitect y el modelo responde a partir de la base de conocimiento empaquetada, sin conexion a internet.
- Edicion asistida de interiores MLO: el usuario solicita cambios concretos sobre su construccion (por ejemplo, ajustes de elementos) y el modelo los aplica como una accion reversible.
- Interaccion por voz durante el modelado: gracias al proyector de audio del modelo base, el usuario puede formular consultas habladas mientras trabaja en la escena.
- Recuperacion aumentada local: el pipeline con EmbeddingGemma 2 permite localizar la documentacion o respuesta relevante dentro de la base de conocimiento antes de generar la respuesta.
- Entorno de desarrollo sin conectividad o con requisitos de privacidad: al ejecutarse en la GPU del usuario, es adecuado para estudios que no pueden enviar datos de sus proyectos a la nube.
- Prototipado de asistentes de dominio especifico: sirve como ejemplo de fine-tuning LoRA sobre un modelo multimodal pequeno empaquetado con llama.cpp para distribucion como aplicacion de escritorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; para un modelo de 2.000 millones de parametros en Q4_K_M mas el proyector de audio y EmbeddingGemma 2 en Q8_0, el pack completo ocupa 2,1 GB en disco.
- GPU recomendadas: no disponibles; el runtime incluido es llama.cpp b11972 para Windows x64 con backend Vulkan, lo que permite su uso en GPUs compatibles con Vulkan.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; el requisito declarado es ejecutarse "en tu propia tarjeta grafica" en Windows x64.
- Opciones de despliegue: llama.cpp (version incluida en el pack); no se documentan otras opciones como vLLM, Ollama o TGI.
- Latencia y throughput: no disponibles.
- Plataforma: Windows x64 exclusivamente, segun el runtime empaquetado.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (asistentes de dominio especifico empaquetados para aplicaciones de escritorio) ni datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo marcado como experimental por el propio autor: fine-tuning de 2.000 millones de parametros sobre unos pocos miles de ejemplos.
- Solo responde en ingles; no hay soporte multilingue declarado.
- Puede producir respuestas incorrectas; el autor advierte explicitamente de que "puede equivocarse".
- Su conocimiento se limita a la base de conocimiento de MLOArchitect y reconoce cuando algo no esta en ella, pero no se detalla el alcance ni la actualizacion de dicha base.
- Licencia LFM Open License v1.0: es necesario revisar sus terminos para uso comercial o redistribucion; la licencia se declara como "other" en los metadatos de Hugging Face.
- El componente EmbeddingGemma 2 esta sujeto a la Gemma Prohibited Use Policy, con restricciones adicionales de uso.
- Dependencia de plataforma: el pack solo incluye runtime para Windows x64 con Vulkan.
- Sin descargas ni validacion de la comunidad en el momento de la consulta (0 descargas, 0 likes).
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la informacion disponible.
- El uso previsto esta acoplado a la aplicacion MLOArchitect; no se plantea como modelo de proposito general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AlexJamesDean/MLOArchitect-Clappy
- Aplicacion MLOArchitect: https://mloarchitect.com
- Modelo base LiquidAI/LFM3-Audio-2B: https://huggingface.co/LiquidAI/LFM3-Audio-2B
- Modelo de embeddings google/embeddinggemma-2: https://huggingface.co/google/embeddinggemma-2
- Politica de uso prohibido de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
- Soporte (Discord de AJTheDev): no disponible como URL directa en la informacion proporcionada

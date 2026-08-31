# ApolloRaines/Llama-3.1-8B-Instruct_Flat-Affect

## Resumen

Llama-3.1-8B-Instruct_Flat-Affect es una variante del modelo Llama-3.1-8B-Instruct de Meta, modificada mediante jBlaze, una herramienta propietaria de "cirugía conductual" desarrollada por Apollo Raines. En lugar de realizar un fine-tuning tradicional, jBlaze altera directamente los pesos del modelo para eliminar el afecto emocional de las respuestas, produciendo un tono clínico, objetivo y desprovisto de sentimiento. El resultado es un modelo que conserva las capacidades técnicas del base (razonamiento, generación de texto, código) pero con una salida puramente analítica.

Esta modificación se enmarca en las técnicas de representation engineering y abliteration, que permiten intervenir en comportamientos específicos sin reentrenar. El modelo mantiene la arquitectura original de 8.0B parámetros y la licencia Llama 3.1 Community, por lo que es utilizable en entornos comerciales con las mismas restricciones que el base. Su relevancia radica en ofrecer una alternativa para aplicaciones donde se requiere neutralidad emocional absoluta, como informes técnicos, análisis de datos o documentación automatizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only, 32 capas) |
| Parametros totales | 8.030.261.248 (8,0B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K tokens (heredado del modelo base) |
| Tipos de cuantizacion | bf16 (formato original); cuantizaciones posteriores no especificadas |
| Idiomas soportados | Ingles (en) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Llama-3.1-8B-Instruct, un transformer decoder-only con 32 capas y 8.0B parámetros, entrenado por Meta con 15 billones de tokens y optimizado mediante RLHF para tareas de instrucción. Sobre esta base, Apollo Raines aplicó jBlaze, una herramienta de "cirugía conductual" que modifica comportamientos entrenados directamente en los pesos, sin ningún tipo de fine-tuning o entrenamiento adicional. La técnica empleada combina representation engineering y abliteration, identificando direcciones en el espacio de activaciones asociadas al afecto emocional y neutralizándolas. El resultado es un modelo que conserva la arquitectura y el conocimiento del base, pero que produce respuestas con un tono clínico y objetivo, sin entusiasmo, sentimiento ni colorido emocional.

## Capacidades

- Generacion de texto y razonamiento: mantiene las capacidades del modelo base para tareas de comprension, analisis y generacion de texto, pero con un tono neutral y desapasionado.
- Codigo y matematicas: hereda las habilidades de programacion y calculo de Llama-3.1-8B-Instruct, incluyendo soporte para generacion de codigo en multiples lenguajes.
- Tool calling y function calling: al estar basado en Llama-3.1-8B-Instruct, conserva el soporte nativo para invocacion de herramientas y funciones, util para integraciones en agentes.
- Multilingue: aunque la model card indica solo ingles, el modelo base soporta varios idiomas; sin embargo, la modificacion no garantiza el mismo nivel en otros idiomas.
- Tono clinico: la capacidad distintiva es la eliminacion del afecto emocional, lo que produce respuestas objetivas, directas y sin sesgo sentimental.

## Casos de uso

- Generacion de informes tecnicos: el modelo puede redactar documentacion tecnica, manuales o analisis de sistemas sin introducir opiniones o juicios subjetivos, gracias a su tono neutral.
- Analisis de datos y resumen de resultados: al recibir datos o metricas, produce resumenes objetivos y desapasionados, adecuados para reportes ejecutivos o cientificos.
- Atencion al cliente automatizada en entornos B2B: puede gestionar consultas tecnicas o de soporte donde se requiere precision y neutralidad, evitando respuestas emocionales que puedan malinterpretarse.
- Generacion de codigo en produccion: con soporte de tool calling, puede integrarse en pipelines de CI/CD para generar o revisar codigo, manteniendo un estilo consistente y sin comentarios subjetivos.
- Redaccion de articulos cientificos o academicos: produce texto con un registro formal y objetivo, adecuado para secciones de metodologia o resultados.
- Moderacion de contenido: puede evaluar textos o interacciones sin dejarse influir por el tono emocional, ayudando a detectar sesgos o incumplimientos de forma imparcial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta variante en la informacion disponible. Dado que la modificacion no altera los pesos de forma significativa en cuanto a capacidad, se espera un rendimiento similar al de Llama-3.1-8B-Instruct, que obtiene puntuaciones de 68.4 en MMLU, 72.6 en HumanEval y 68.0 en GSM8K, pero estos datos no estan confirmados para esta version concreta.

## Requisitos de hardware

- VRAM estimada: el modelo en bf16 ocupa aproximadamente 16 GB (el repositorio pesa 16.1 GB). Para inferencia con cuantizacion a 8 bits se necesitan unos 8-9 GB, y a 4 bits unos 5-6 GB.
- GPU recomendadas: para bf16 completo se requiere una GPU con al menos 16 GB de VRAM, como A100, RTX 4090 o A6000. Con cuantizacion, cabe en GPUs consumer como RTX 3080/3090 (10-24 GB) o incluso en tarjetas de 8 GB con cuantizacion agresiva.
- Opciones de despliegue: compatible con vLLM, llama.cpp, Ollama, TGI y Transformers. Al ser un modelo de 8B, es adecuado para entornos de produccion con una sola GPU.
- Latencia y throughput: no se han publicado datos especificos, pero al ser un modelo de 8B, se espera una latencia de decenas de milisegundos por token en GPUs modernas, con throughput de cientos de tokens por segundo en vLLM con batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Modificacion |
|---|---|---|---|---|
| Llama-3.1-8B-Instruct (base) | 8.0B | 128K | Llama 3.1 Community | Sin modificacion |
| Llama-3.1-8B-Instruct_Flat-Affect | 8.0B | 128K | Llama 3.1 Community | Afecto emocional eliminado via jBlaze |
| Llama-3.1-8B-Instruct-Jbliterated-v2 | 8.0B | 128K | Llama 3.1 Community | Abliteration de comportamientos no deseados |

La comparativa se limita a variantes del mismo modelo base, ya que no hay alternativas directas con la misma tecnica de eliminacion de afecto. La principal diferencia entre Flat-Affect y Jbliterated-v2 es el objetivo: la primera neutraliza el tono emocional, mientras que la segunda elimina comportamientos especificos (probablemente relacionados con rechazo o sesgos). Ambas mantienen las capacidades tecnicas del base.

## Limitaciones y advertencias

- Idioma: la model card indica solo ingles, por lo que el rendimiento en otros idiomas puede ser inferior al del modelo base.
- Tono excesivamente frio: la eliminacion del afecto puede producir respuestas que resulten roboticas o carentes de empatia, inapropiadas para contextos que requieren sensibilidad humana.
- Sesgos del modelo base: al no haberse realizado un reentrenamiento, los sesgos presentes en Llama-3.1-8B-Instruct (genero, raza, etc.) se mantienen intactos.
- Riesgo de alucinacion: no se ha mitigado este riesgo; el modelo puede generar informacion falsa o inventada, especialmente en temas de actualidad o muy especificos.
- Restricciones de licencia: la licencia Llama 3.1 Community permite uso comercial, pero exige que los usuarios con mas de 700 millones de usuarios mensuales soliciten una licencia especifica a Meta.
- Sin garantias de rendimiento: al ser una modificacion experimental sin benchmarks publicados, no se puede asegurar que el rendimiento en tareas complejas sea identico al del base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ApolloRaines/Llama-3.1-8B-Instruct_Flat-Affect
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Repositorio de jBlaze: https://github.com/apolloraines/jblaze
- Variante similar (Jbliterated-v2): https://huggingface.co/ApolloRaines/Llama-3.1-8B-Instruct-Jbliterated-v2

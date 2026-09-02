# fl0rm/Gemma-4-Gembrain-X-Core-31B-mlx-8Bit

## Resumen

fl0rm/Gemma-4-Gembrain-X-Core-31B-mlx-8Bit es una conversión al formato MLX (Apple Silicon) del modelo Nimbz/Gemma-4-Gembrain-X-Core-31B, un merge comunitario construido con mergekit sobre la familia Gemma 4 de Google. El modelo original está orientado a tareas de razonamiento, roleplay, escritura creativa, generación de prompts para imágenes y conversación general, con un enfoque "sin censura" (etiquetas uncensored y nsfw). Esta versión MLX, cuantizada a 8 bits, facilita su ejecución en hardware Apple con memoria unificada.

El repositorio pesa 32,6 GB y los pesos en safetensors indican 8.634.585.404 parámetros, una cifra que contradice el nombre "31B" del modelo base. Esta discrepancia no está explicada por el autor, por lo que debe interpretarse con cautela. La licencia es Apache 2.0, lo que permite uso comercial y modificación. No se han publicado métricas de rendimiento ni detalles de entrenamiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia Gemma 4, probablemente transformer) |
| Parametros totales | 8.634.585.404 (segun safetensors; el nombre indica 31B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 262K tokens (segun Routeway, no confirmado por el autor) |
| Tipos de cuantizacion | 8-bit (MLX) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, MLX |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna, el proceso de entrenamiento o los datos utilizados. El modelo base Nimbz/Gemma-4-Gembrain-X-Core-31B es un merge creado con mergekit, lo que implica una combinacion de pesos de varios modelos de la familia Gemma 4. La conversion a MLX se realizo con mlx-lm version 0.31.2, manteniendo la estructura original pero adaptada para ejecucion eficiente en Apple Silicon. No se mencionan tecnicas como RLHF, DPO ni innovaciones especificas en la atencion o decodificacion.

## Capacidades

- Razonamiento y resolucion de problemas complejos, segun las etiquetas del modelo.
- Roleplay y escritura creativa, con capacidad para mantener personajes y narrativas coherentes.
- Generacion de prompts para modelos de imagen, util para flujos de trabajo de IA generativa visual.
- Conversacion general y chat multimodal (segun NanoGPT, aunque no se confirma soporte de vision en esta version).
- Sin filtros de seguridad aparentes (etiquetas uncensored y nsfw), lo que permite contenido explicito.
- Soporte de contexto largo (262K tokens segun Routeway), adecuado para documentos extensos o conversaciones prolongadas.

## Casos de uso

- Roleplay y narrativa interactiva: el modelo puede mantener personajes y tramas complejas en conversaciones multi-turno, aprovechando su ventana de contexto amplia para recordar detalles de la historia.
- Escritura creativa asistida: generacion de borradores de ficcion, poesia o guiones, con estilo adaptable y coherencia tematica.
- Generacion de prompts para imagenes: el modelo puede producir descripciones detalladas y artisticas que luego se pasan a difusion estable u otros generadores visuales.
- Chat conversacional sin restricciones: ideal para prototipos o aplicaciones donde se requiere libertad de contenido, como juegos de rol adultos o simulaciones.
- Analisis de documentos largos: gracias a su contexto de 262K tokens, puede resumir o extraer informacion de libros, informes o transcripciones extensas.
- Razonamiento y asistencia tecnica: aunque no se especifican capacidades de tool calling, su orientacion al razonamiento lo hace util para tareas de logica, planificacion o depuracion de codigo en entornos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al ser un modelo MLX cuantizado a 8 bits, esta optimizado para Apple Silicon (chips M1, M2, M3, M4 y superiores).
- El tamano del repositorio es de 32,6 GB, por lo que se recomienda al menos 32 GB de memoria unificada para cargar el modelo completo; 64 GB o mas para operar con comodidad y margen para el contexto.
- No se recomienda su uso en GPUs NVIDIA o AMD sin conversion previa a otro formato (por ejemplo, GGUF para llama.cpp).
- Despliegue tipico con la libreria mlx-lm, que ofrece generacion eficiente en CPU/GPU unificada de Apple.
- No se dispone de datos de latencia o throughput especificos.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con otros modelos de la misma categoria. El nombre sugiere una talla de 31B, pero los parametros reales indican 8,6B, lo que dificulta la comparacion directa. Alternativas como Gemma 4 27B o Llama 3.1 8B podrian ser relevantes, pero no hay datos de rendimiento publicados para este modelo.

## Limitaciones y advertencias

- Discrepancia no resuelta entre el nombre del modelo (31B) y los parametros reales en safetensors (8,6B), lo que puede indicar un error de etiquetado o una conversion incompleta.
- Contenido sin censura: el modelo puede generar material explicito, ofensivo o inapropiado, lo que requiere control parental o politicas de uso estrictas en entornos publicos.
- Riesgo de alucinacion: al ser un merge sin evaluaciones publicas, la fiabilidad factual no esta garantizada.
- Sin informacion sobre idiomas soportados: se asume un enfoque principal en ingles, aunque Gemma 4 es multilingue.
- La longitud de contexto de 262K tokens proviene de una fuente externa (Routeway) y no esta confirmada por el autor del modelo.
- No se han publicado benchmarks ni evaluaciones de seguridad, por lo que su rendimiento en tareas especificas es desconocido.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales derivadas de Gemma 4; se recomienda revisar los terminos de Google.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fl0rm/Gemma-4-Gembrain-X-Core-31B-mlx-8Bit
- Modelo base (Nimbz): https://huggingface.co/Nimbz/Gemma-4-Gembrain-X-Core-31B
- Pagina oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Ficha en NanoGPT: https://nano-gpt.com/models/text/Gemma-4-31B-Gembrain-X-Core
- API de Routeway: https://routeway.ai/models/gemma-4-31b-gembrain-x-core

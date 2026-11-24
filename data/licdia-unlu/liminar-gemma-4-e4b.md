# LICDIA-UNLu/Liminar-Gemma-4-E4B

## Resumen

Liminar-Gemma-4-E4B es un ajuste fino (finetune) de Gemma 4 E4B-it desarrollado por el Laboratorio de Investigación en Ciencia de Datos & Inteligencia Artificial (LICDIA) de la Universidad Nacional de Luján, en Argentina. El modelo está especializado en normativa universitaria argentina, vida académica e instituciones del sistema universitario, y en español formal de Argentina. Se distribuye con licencia Apache 2.0, la misma del modelo base, y cuenta con versiones en safetensors y GGUF.

El modelo parte de una arquitectura Gemma 4 de aproximadamente 7.941 millones de parámetros totales y se entrenó con un ajuste completo de todos los pesos salvo la tabla de embeddings por capa (`embed_tokens_per_layer`, 2.820 millones de parámetros), que permaneció fija. El entrenamiento se realizó con FSDP en un nodo de la supercomputadora Clementina XXI, con 8 tiles de GPU Intel Data Center Max 1550 y 77 horas de GPU (horas de tile).

Su relevancia radica en que es un modelo abierto y de tamaño contenido, orientado a un dominio muy específico y con evaluación publicada frente a su modelo base y frente a gpt-4.1-mini. Está pensado para usarse con recuperación de documentos (RAG) sobre fuentes normativas actualizadas, y su receta y código son públicos para que otras instituciones puedan adaptarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 (transformer multimodal image-text-to-text; ajuste fino del modelo base google/gemma-4-E4B-it) |
| Parametros totales | 7.941.100.874 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q8_0 (8 bits); no se publica versión de 4 bits |
| Idiomas soportados | es (español, con foco en español formal de Argentina) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Gemma 4 E4B-it, un transformer multimodal de tipo image-text-to-text. El ajuste se realizó sobre todos los pesos excepto la tabla de embeddings por capa (`embed_tokens_per_layer`, 2.820 millones de parámetros), que quedó fija. El entrenamiento se llevó a cabo con FSDP en un nodo de la supercomputadora Clementina XXI, con 8 tiles de GPU Intel Data Center Max 1550, durante 77 horas de GPU (horas de tile). Se realizó una época de preguntas y respuestas y cuatro épocas con todos los datos.

Los datos de entrenamiento provienen de normativa universitaria nacional de Infoleg (base de datos.jus.gob.ar, CC BY 4.0), curada a mano; textos públicos sobre vida universitaria de argentina.gob.ar (CC BY 4.0), CONICET (CC BY 2.5 AR) y el Consejo Interuniversitario Nacional (con su permiso); y datos generados a partir de ese corpus con el documento a la vista: fragmentos con su ficha, versiones reescritas, preguntas y respuestas, abstención, identidad, respuestas del propio modelo base a consignas generales y ejemplos de consulta con documentos. Las respuestas de entrenamiento las escribió Qwen 3.5 27B, por lo que el modelo aprende en parte su estilo. El ajuste usó solo texto: la parte que procesa imágenes y audio es la del modelo base, sin cambios.

## Capacidades

- Generación de texto conversacional en español formal de Argentina.
- Conocimiento de normativa universitaria argentina (leyes, decretos y resoluciones del corpus de Infoleg).
- Respuestas sobre instituciones y vida académica del sistema universitario argentino.
- Abstención ante preguntas fuera de su dominio o sin información suficiente.
- Consulta asistida con documentos (RAG): el modelo está entrenado con ejemplos de consulta con documentos y responde a partir de fragmentos recuperados.
- Capacidades multimodales heredadas del modelo base (procesamiento de imágenes y audio), aunque no fueron ajustadas.
- Plantilla de chat con el razonamiento apagado por defecto, tanto en safetensors como en GGUF.
- No se documenta soporte explícito de tool calling ni de agentes multi-paso.

## Casos de uso

- Asistente de consulta normativa universitaria: el modelo responde preguntas sobre leyes y resoluciones del corpus, y se recomienda combinarlo con RAG sobre una fuente actualizada para garantizar vigencia. Es adecuado por su ajuste específico en normativa argentina.
- Atención al público en secretarías académicas: puede gestionar consultas multi-turno sobre trámites, calendario académico y normativa interna, con la salvedad de que los actos internos de cada universidad deben aportarse mediante RAG.
- Digestos y buscadores institucionales: integrado en un sistema de recuperación como el del digesto de la UNLu, sirve para redactar respuestas citando fragmentos recuperados, con evaluación publicada de utilidad, fidelidad, completitud y claridad.
- Formación y orientación a estudiantes: responde dudas sobre el funcionamiento del sistema universitario argentino, becas, CONICET y organismos interuniversitarios a partir de textos públicos.
- Despliegue en local sin GPU: la versión GGUF Q8_0 (8,0 GB) permite ejecutarlo con llama.cpp, Ollama o LM Studio en equipos sin GPU dedicada.
- Base para adaptaciones institucionales: otras universidades pueden partir de este modelo y de la receta pública para añadir sus propios actos internos y normativa específica.
- Investigación en ajuste de dominio: sirve como caso reproducible de finetune completo sobre Gemma 4 E4B con evaluación frente al modelo base y a un modelo propietario de referencia.

## Benchmarks y rendimiento

| Evaluación | Modelo base | Liminar | gpt-4.1-mini (referencia) |
|---|---|---|---|
| Normativa sin documentos (300 preguntas): respuestas correctas | 5,7 % | 31,7 % | 14,3 % |
| Normativa sin documentos: nota media del juez (0 a 2) | 0,37 | 1,10 | 0,77 |
| Consulta con documentos, RAG (60 consultas): promedio del juez (1 a 5) | 4,89 | 5,00 | 4,98 |
| RAG: respuestas con algún dato incorrecto | 0 de 60 | 0 de 60 | 0 de 60 |

Las respuestas abiertas las califica Llama 3.3 70B, que no pertenece a ninguna de las familias evaluadas. La evaluación corresponde al modelo en bf16; las versiones cuantizadas no se evaluaron por separado.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: no disponible de forma explícita; con 7.941 millones de parámetros, el peso en bf16 ronda los 16 GB, a lo que hay que sumar caché KV y overhead.
- Versión GGUF Q8_0: archivo de 8,0 GB, apta para ejecución en CPU sin GPU.
- GPU recomendadas: no se especifican en la información disponible; el entrenamiento se realizó en 8 tiles de GPU Intel Data Center Max 1550.
- Cabe en GPU de consumo: la versión Q8_0 (8,0 GB) es viable en GPUs consumer con 8-12 GB de VRAM o superior; la versión bf16 requiere más memoria.
- Opciones de despliegue: transformers 5 o posterior (safetensors), llama.cpp (`llama-server -hf`), Ollama (`ollama run hf.co/...:Q8_0`) y LM Studio (GGUF).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Liminar-Gemma-4-E4B | 7.941.100.874 | no disponible | Apache 2.0 | Hugging Face (safetensors y GGUF Q8_0) | Ajuste en normativa universitaria argentina; 31,7 % de acierto sin documentos |
| google/gemma-4-E4B-it | no disponible en la información | no disponible | no disponible en la información | Hugging Face | Modelo base; 5,7 % de acierto sin documentos y 4,89 en RAG |
| gpt-4.1-mini | no disponible | no disponible | propietaria | API | Referencia externa; 14,3 % de acierto sin documentos y 4,98 en RAG |

No se dispone de datos de otros modelos abiertos de tamaño comparable en la información proporcionada.

## Limitaciones y advertencias

- No sabe qué normas siguen vigentes ni cuáles cambiaron después de la fecha del corpus; se recomienda usar RAG sobre una fuente actualizada.
- Puede equivocar números de normas, fechas y montos.
- No conoce los actos internos de cada universidad; esa capa debe añadirse por institución con la receta publicada.
- El ajuste usó solo texto: las capacidades de imagen y audio son las del modelo base, sin adaptar.
- Las respuestas de entrenamiento las generó Qwen 3.5 27B, por lo que el modelo puede reproducir en parte su estilo.
- No se publica versión de 4 bits porque en las pruebas producía palabras deformadas; solo hay Q8_0.
- Las versiones cuantizadas no se evaluaron por separado; los benchmarks corresponden a bf16.
- Riesgo de alucinación en consultas fuera del dominio o cuando el corpus no cubre la norma solicitada.
- No se documentan sesgos específicos más allá de los heredados del modelo base y del corpus utilizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LICDIA-UNLu/Liminar-Gemma-4-E4B
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Código y receta: https://github.com/LICDIA-UNLu/liminar
- Documentación: https://licdia-unlu.github.io/liminar
- Laboratorio: https://licdia.unlu.edu.ar
- Asistente de consulta del digesto de la UNLu: https://licdia.unlu.edu.ar/rag-unlu
- Icono del proyecto: https://raw.githubusercontent.com/LICDIA-UNLu/liminar/main/docs/assets/liminar-icono-512.png

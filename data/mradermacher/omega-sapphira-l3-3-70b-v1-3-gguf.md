# mradermacher/Omega-Sapphira-L3.3-70B-v1.3-GGUF

## Resumen

Omega-Sapphira-L3.3-70B-v1.3-GGUF es una cuantización en formato GGUF del modelo original Omega-Sapphira-L3.3-70B-v1.3, creado por cactopus mediante una fusión (merge) con mergekit y la técnica slerp sobre la base de Llama 3.3 de 70 mil millones de parámetros. El repositorio que nos ocupa, publicado por mradermacher, ofrece versiones cuantizadas (Q2_K y Q4_K_S) para facilitar la ejecución en hardware con recursos limitados, manteniendo las características del modelo original: orientado a roleplay, escritura de historias y conversación, con un enfoque deliberadamente no alineado (unaligned) y contenido no apto para todos los públicos.

Este modelo es relevante para desarrolladores e investigadores que buscan un LLM de gran tamaño (70B) especializado en narrativa creativa y diálogo inmersivo, pero que necesitan reducir el consumo de memoria mediante cuantización. Al estar basado en Llama 3.3, hereda su arquitectura transformer y su ventana de contexto nativa de 128 000 tokens, aunque la cuantización puede afectar ligeramente a la calidad de salida. La licencia llama3.3 permite uso comercial, pero con las restricciones propias de dicha licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3.3, fusionado con slerp) |
| Parametros totales | 70 553 706 560 (70,5 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128 000 tokens (heredada de Llama 3.3, no confirmada en la ficha) |
| Tipos de cuantizacion | Q2_K, Q4_K_S (estáticos) |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.3 |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

El modelo original Omega-Sapphira-L3.3-70B-v1.3 es una fusión de varios modelos basados en Llama 3.3, combinados mediante mergekit con el método slerp (interpolación esférica lineal). No se han publicado detalles sobre los componentes exactos de la fusión ni sobre el dataset de entrenamiento. Al ser un merge, no ha sido entrenado desde cero, sino que combina los pesos de modelos preexistentes para potenciar capacidades específicas como roleplay y escritura creativa. La cuantización GGUF realizada por mradermacher es estática (sin imatrix) y no modifica la arquitectura subyacente, solo reduce la precisión de los pesos para disminuir el tamaño y los requisitos de memoria.

## Capacidades

- Generacion de texto narrativo y dialogos para roleplay, con estilo inmersivo y personajes definidos.
- Escritura de historias largas y coherentes, aprovechando la ventana de contexto de 128 000 tokens.
- Conversacion multiturno con memoria extendida, adecuada para interacciones prolongadas.
- Soporte de tool calling y function calling, heredado de Llama 3.3 (no confirmado en la ficha, pero probable).
- Capacidades multilingues limitadas al ingles, segun la etiqueta de idioma.
- Modo "unaligned": no tiene filtros de seguridad ni rechazo de contenido, lo que permite generar material explicito o controvertido (con las advertencias correspondientes).

## Casos de uso

- Creacion de novelas interactivas: el modelo puede generar capitulos completos, mantener el hilo argumental y adaptarse a las decisiones del lector gracias a su contexto largo.
- Chatbots de rol para juegos de mesa o mundos virtuales: permite interpretar multiples personajes con voces y motivaciones distintas, manteniendo coherencia a lo largo de sesiones extensas.
- Generacion de guiones y dialogos para producciones audiovisuales: su capacidad para escribir conversaciones naturales y con tension dramatica lo hace util en preproduccion.
- Asistente de escritura creativa: puede sugerir tramas, descripciones y giros argumentales, actuando como coautor en proyectos literarios.
- Simulacion de personajes historicos o ficticios para entornos educativos o de entretenimiento, sin restricciones de contenido.
- Desarrollo de agentes conversacionales para aplicaciones de entretenimiento para adultos, donde se requiere contenido sin censura (con las debidas salvaguardas legales).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base (cactopus/Omega-Sapphira-L3.3-70B-v1.3) tampoco incluye metricas comparativas en su model card. Por tanto, no es posible ofrecer datos objetivos de rendimiento en tareas estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion Q4_K_S (~40,4 GB) se necesita una GPU con al menos 48 GB de VRAM (por ejemplo, A6000, A100 80GB, o dos RTX 4090 en paralelo). Con Q2_K (~26,5 GB) cabe en una RTX 4090 de 24 GB, aunque con perdida notable de calidad.
- GPU recomendadas: NVIDIA A100 80GB, H100, o multiples RTX 4090/3090 con NVLink o configuracion multi-GPU.
- En consumer GPU: solo la version Q2_K puede ejecutarse en una RTX 4090 (24 GB) o RTX 3090 (24 GB), con limitaciones de velocidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o servidores como vLLM (si se convierten los pesos a safetensors). El formato GGUF es compatible con la mayoria de motores de inferencia locales.
- Latencia y throughput: no disponibles. Depende del hardware y de la cuantizacion; en una A100 80GB con Q4_K_S se espera una velocidad de 10-20 tokens/s, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Omega-Sapphira-L3.3-70B-v1.3 (GGUF) | 70,5 B | 128k (heredado) | llama3.3 | GGUF | Roleplay, storywriting, unaligned |
| Llama 3.3 70B (original) | 70,6 B | 128k | llama3.3 | safetensors | Generalista, alineado |
| Mistral Large 2 (70B) | 70,5 B | 128k | Apache 2.0 | safetensors | Generalista, multilingue |
| NousResearch Hermes 3 70B | 70,6 B | 128k | llama3.3 | safetensors | Instrucciones, roleplay |

La comparativa se basa en caracteristicas generales; no hay datos de rendimiento publicados para Omega-Sapphira. La principal diferencia frente a Llama 3.3 original es la ausencia de alineacion y la especializacion en narrativa, mientras que Mistral Large 2 ofrece mejor soporte multilingue y Hermes 3 esta optimizado para seguir instrucciones.

## Limitaciones y advertencias

- Modelo sin alineacion (unaligned): puede generar contenido explicito, violento, ofensivo o ilegal. No debe usarse en entornos donde se requiera moderacion automatica.
- Riesgo de alucinacion: como cualquier LLM, puede inventar hechos, nombres o eventos, especialmente en contextos largos.
- Idioma limitado al ingles: no se garantiza un rendimiento adecuado en otros idiomas, incluido el espanol.
- Cuantizacion estatica: los quants Q2_K y Q4_K_S no incluyen imatrix, lo que puede degradar la calidad en comparacion con versiones con imatrix (no disponibles).
- Licencia llama3.3: permite uso comercial, pero exige incluir la atribucion correspondiente y no puede usarse para entrenar otros modelos sin permiso.
- Sin soporte oficial: el repositorio es una cuantizacion de un tercero; no hay garantias de mantenimiento ni actualizaciones.
- Contenido "not-for-all-audiences": no apto para menores ni para aplicaciones publicas sin control de acceso.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Omega-Sapphira-L3.3-70B-v1.3-GGUF
- Modelo base (safetensors): https://huggingface.co/cactopus/Omega-Sapphira-L3.3-70B-v1.3
- Pagina de solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF

# Azure99/Blossom-V7.2-27B

## Resumen

Blossom-V7.2-27B es un modelo multimodal de pesos abiertos desarrollado por Azure99 dentro de la familia Blossom-V7.2. Está construido sobre el modelo base Qwen3.8-27B y orientado a despliegue local, combinando comprensión de imágenes con generación de texto, razonamiento y uso de herramientas. Resuelve el problema de disponer de un asistente generalista multimodal que pueda ejecutarse en hardware propio sin depender de APIs externas, manteniendo un equilibrio entre calidad y eficiencia de razonamiento.

La arquitectura es de tipo transformer denso (tag `qwen3_5` en Hugging Face), con 27.781.427.952 parámetros totales (aproximadamente 27,8 mil millones) y una ventana de contexto de hasta 262.144 tokens (256K), aunque el propio autor recomienda 131.072 tokens (128K) para obtener los mejores resultados. Incorpora decodificación especulativa mediante Multi-Token Prediction (MTP), compatible con vLLM y llama.cpp, lo que reduce la latencia de inferencia.

Es relevante ahora porque ofrece un modo de pensamiento dual (`medium` y `max`) que escala la profundidad del razonamiento según la dificultad de la tarea, con trazas de razonamiento aproximadamente cuatro veces más cortas que las de Qwen3.5 y cinco veces más cortas que las de Qwen3.6 en modo `medium`. Además, soporta uso de herramientas con razonamiento intercalado y entrada de imágenes, lo que lo sitúa como una opción práctica para flujos agénticos y tareas multimodales en producción local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (tag `qwen3_5`), multimodal con encoder de visión |
| Parametros totales | 27.781.427.952 (aproximadamente 27,8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (256K); 131.072 tokens (128K) recomendados para mejores resultados |
| Tipos de cuantizacion | GGUF disponible en repositorio separado (`Azure99/Blossom-V7.2-27B-GGUF`); niveles concretos no disponibles |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; GGUF en repositorio aparte |

## Arquitectura y entrenamiento

El modelo se basa en un transformer denso derivado de Qwen3.8-27B, con capacidades multimodales de entrada imagen-texto (pipeline `image-text-to-text`). Incorpora un encoder de visión que procesa imágenes junto con el texto de entrada. El contexto se extiende hasta 262.144 tokens, con recomendación de uso a 131.072 tokens para preservar la calidad. Una innovación destacable es el soporte de Multi-Token Prediction (MTP) como decodificación especulativa, integrado tanto en vLLM como en llama.cpp, lo que acelera la generación.

El post-entrenamiento está orientado a uso general como asistente: conversación cotidiana, conocimiento del mundo, matemáticas y razonamiento, programación, desarrollo web y visualización de datos. El pipeline de datos utiliza BlossomData, un framework de código abierto del mismo autor para procesamiento y síntesis de datos a escala, con filtrado mediante LLM-as-Judge y, cuando procede, Agent-as-Judge ejecutado en AgentBox (entorno de trabajo para agentes que emplea búsqueda, interacción con navegador, captura de pantalla y ejecución de código). Las muestras de desarrollo web y visualización de datos reciben un cribado adicional de funcionalidad, usabilidad y calidad visual. El autor indica que los datos de entrenamiento se publicarán como código abierto en una actualización futura. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Generación de texto y conversación multi-turno en inglés y chino.
- Razonamiento con modo de pensamiento siempre activo y dos niveles: `medium` y `max` (por defecto `max`), mapeados desde el parámetro `reasoning_effort`.
- Comprensión de imágenes junto con texto (entrada imagen-texto).
- Uso de herramientas (tool calling / function calling) con razonamiento intercalado antes de cada llamada.
- Flujos agénticos de múltiples pasos gracias al razonamiento previo a cada decisión de herramienta.
- Matemáticas y razonamiento lógico.
- Programación, desarrollo web y visualización de datos.
- Conocimiento del mundo y conversación cotidiana.
- Contexto largo de hasta 256K tokens para documentos extensos o historiales largos.
- Decodificación especulativa mediante MTP para acelerar la inferencia.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con historiales extensos gracias a su ventana de hasta 256K tokens, manteniendo el contexto de interacciones previas y reutilizando el razonamiento del asistente en turnos sucesivos.
- Generación de código en producción: soporta tool calling con razonamiento intercalado, lo que permite integrarlo en pipelines de CI/CD como agente que consulta repositorios, ejecuta pruebas y propone parches.
- Desarrollo web asistido: entrenado específicamente en desarrollo web y con cribado de calidad visual, puede generar componentes, maquetación y código frontend a partir de descripciones textuales o capturas de imagen.
- Visualización de datos: a partir de una imagen de una tabla o gráfico y una instrucción textual, puede generar código de visualización y explicar los resultados.
- Asistente agéntico con navegador: gracias al soporte de tool use y razonamiento intercalado, puede encadenar búsquedas, interacción con páginas y ejecución de código en flujos de automatización.
- Análisis de documentos e imágenes combinados: con contexto de 128K-256K tokens y entrada multimodal, puede resumir informes extensos junto con capturas o diagramas incluidos.
- Despliegue local en GPU: al ser un modelo denso de 27,8B con pesos safetensors y variante GGUF, puede ejecutarse en estaciones de trabajo con GPU dedicada para tareas de asistente interno sin salida a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Para un modelo denso de 27,8B, los pesos en safetensors ocupan aproximadamente 55,6 GB en el repositorio, por lo que la inferencia en precisión completa requiere GPU con memoria suficiente para alojar los pesos; las variantes GGUF permiten reducir el requisito mediante cuantización, aunque los niveles concretos no están detallados en la información proporcionada.
- GPU recomendadas: el autor indica que la variante 27B está pensada para despliegues en GPU donde los pesos quepan íntegramente en memoria de GPU. No se especifican modelos concretos (A100, H100, RTX 4090, etc.) en la información disponible.
- ¿Cabe en GPU de consumo? No disponible. La familia incluye la variante 9B como opción de bajos recursos para GPU con memoria limitada y dispositivos móviles, y la 35B-A3B como opción orientada a throughput en CPU o híbrido CPU/GPU.
- Opciones de despliegue: Transformers (requiere `transformers>=5.12.1` y `accelerate`), vLLM y llama.cpp (con soporte de MTP para decodificación especulativa en ambos). El repositorio GGUF está disponible para llama.cpp.
- Latencia y throughput estimados: no disponibles. El modelo incorpora MTP para acelerar la inferencia, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| Blossom-V7.2-27B | 27,8B (denso) | 256K (128K recomendado) | Imagen-texto | Apache 2.0 | Objeto de esta ficha; pensado para GPU con pesos completos en memoria |
| Blossom-V7.2-35B-A3B | 35B totales, 3B activos (MoE) | No disponible en la información | Imagen-texto | Apache 2.0 | Variante orientada a throughput en CPU o híbrido CPU/GPU |
| Blossom-V7.2-9B | 9B (denso) | No disponible en la información | Imagen-texto | Apache 2.0 | Variante de bajos recursos para GPU limitadas y móvil |
| Qwen3.8-27B (base) | 27B (denso) | No disponible en la información | Texto (base) | No disponible en la información | Modelo base sobre el que se construye Blossom-V7.2-27B |

No se dispone de datos de benchmarks que permitan comparar el rendimiento numérico con alternativas de la misma categoría.

## Limitaciones y advertencias

- Idiomas: solo inglés y chino están declarados; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación: no se documenta en la información disponible; como modelo generativo de uso general, es un riesgo inherente que debe mitigarse con verificación.
- Sesgos conocidos: no se documentan sesgos específicos en la información proporcionada.
- Plantilla de chat: utiliza una plantilla de chat personalizada distinta de las plantillas nativas de los modelos Qwen base. Es obligatorio usar la plantilla incluida y no sustituirla ni combinarla con la nativa de Qwen.
- Multi-turno: en conversaciones multi-turno debe reenviarse el razonamiento completo del asistente junto con su respuesta; omitir el razonamiento previo degrada significativamente el rendimiento en turnos posteriores. Los frameworks agénticos deben conservar el mensaje completo del asistente en el historial (campos `reasoning` en vLLM y `reasoning_content` en llama.cpp).
- Contexto: aunque soporta 256K tokens, el autor recomienda 128K para obtener los mejores resultados.
- Licencia: Apache 2.0 permite uso comercial, pero deben respetarse las condiciones de la licencia y las obligaciones de atribución correspondientes.
- Datos de entrenamiento: aún no publicados; el autor indica que se liberarán en una actualización futura, lo que limita la reproducibilidad completa por ahora.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Azure99/Blossom-V7.2-27B
- Repositorio GGUF: https://huggingface.co/Azure99/Blossom-V7.2-27B-GGUF
- Demo: https://huggingface.co/spaces/Azure99/Blossom-27B-Demo
- Chat: https://blossom-chat.com/
- GitHub del proyecto: https://github.com/Azure99/BlossomLM
- Framework de datos BlossomData: https://github.com/Azure99/BlossomData
- Entorno de agentes AgentBox: https://github.com/Azure99/agentbox
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante 35B-A3B: https://huggingface.co/Azure99/Blossom-V7.2-35B-A3B
- Variante 9B: https://huggingface.co/Azure99/Blossom-V7.2-9B

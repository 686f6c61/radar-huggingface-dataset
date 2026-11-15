# Azure99/Blossom-V7.2-9B

## Resumen

Blossom-V7.2-9B es un modelo multimodal de propósito general desarrollado por Azure99 dentro de la familia Blossom-V7.2, publicada en Hugging Face bajo licencia Apache 2.0. Está construido sobre Qwen3.5-9B como modelo base y ha sido sometido a un post-entrenamiento específico para uso como asistente conversacional, con soporte de imagen, razonamiento y uso de herramientas. Con 9.653.104.368 parámetros (aproximadamente 9,65 mil millones), se posiciona como la variante de menor consumo de recursos de la familia, orientada a GPUs con memoria limitada, dispositivos móviles y cargas de trabajo ligeras.

El modelo destaca por incorporar un modo de razonamiento siempre activo con dos niveles (`medium` y `max`), donde el modo `medium` ajusta la profundidad del razonamiento a la dificultad de la tarea y produce trazas aproximadamente cuatro veces más cortas que las de Qwen3.5 y cinco veces más cortas que las de Qwen3.6. Además, soporta uso de herramientas con razonamiento intercalado (interleaved thinking), lo que le permite razonar y decidir antes de cada llamada a herramienta, y comprensión de imágenes junto con texto.

La ventana de contexto alcanza 262.144 tokens (256K), aunque el autor recomienda 131.072 tokens (128K) para obtener los mejores resultados. El modelo incorpora decodificación especulativa mediante Multi-Token Prediction (MTP) en vLLM y llama.cpp, lo que reduce la latencia de inferencia. Es relevante ahora porque ofrece un equilibrio entre capacidades multimodales, razonamiento y agentes en un tamaño que cabe en GPUs de consumo, con licencia permisiva para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5-9B), con encoder de visión y MTP para decodificación especulativa |
| Parametros totales | 9.653.104.368 (~9,65B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (256K); 131.072 tokens (128K) recomendado para mejores resultados |
| Tipos de cuantizacion | GGUF disponible en repositorio separado (Blossom-V7.2-9B-GGUF); niveles concretos no disponibles |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo principal); GGUF (repo separado) |

## Arquitectura y entrenamiento

La arquitectura es un transformer multimodal construido sobre Qwen3.5-9B, al que se añade comprensión de imagen (pipeline `image-text-to-text`). El modelo es denso (no MoE), con aproximadamente 9,65 mil millones de parámetros. Incorpora Multi-Token Prediction (MTP) para decodificación especulativa, soportada tanto en vLLM como en llama.cpp, lo que acelera la inferencia. El modelo utiliza una plantilla de chat personalizada que difiere de las plantillas nativas de los modelos Qwen base; el autor advierte explícitamente de que debe usarse la plantilla incluida y no sustituirla ni combinarla con la nativa de Qwen.

El post-entrenamiento se orienta a uso general como asistente: conversación cotidiana, conocimiento del mundo, matemáticas y razonamiento, programación, desarrollo web y visualización de datos. El pipeline de datos utiliza BlossomData, framework open source del autor para procesamiento y síntesis de datos a escala, con filtrado mediante LLM-as-Judge y, cuando aplica, Agent-as-Judge. Este último se ejecuta en AgentBox, entorno de trabajo open source para agentes de IA, y emplea búsqueda, interacción con navegador, captura de pantallas y ejecución de código según sea necesario. Las muestras de desarrollo web y visualización de datos pasan un cribado adicional de funcionalidad, usabilidad y calidad visual. El número de tokens de entrenamiento y la composición exacta del dataset no están disponibles; el autor indica que los datos de entrenamiento se publicarán como open source en una actualización futura. No se especifica si se empleó RLHF o DPO.

## Capacidades

- Generación de texto y conversación multi-turno en inglés y chino.
- Razonamiento siempre activo con dos modos: `medium` y `max` (por defecto `max`). El modo `medium` escala la profundidad del razonamiento según la dificultad de la tarea.
- Uso de herramientas (tool calling / function calling) con razonamiento intercalado: el modelo razona y decide antes de cada llamada a herramienta.
- Flujos agénticos multi-paso gracias a la combinación de tool use y razonamiento intercalado.
- Comprensión de imágenes junto con texto (entrada image-text-to-text).
- Matemáticas y razonamiento lógico.
- Programación, desarrollo web y visualización de datos.
- Conocimiento del mundo y conversación cotidiana.
- Contexto largo de hasta 256K tokens (128K recomendado).
- Decodificación especulativa mediante MTP en vLLM y llama.cpp.
- Capacidad multimodal limitada a imagen; no se menciona soporte de audio.

## Casos de uso

- Asistente conversacional multi-turno: el modelo gestiona conversaciones con contexto largo gracias a su ventana de hasta 256K tokens, adecuado para atención al cliente o asistentes personales que necesitan recordar historial extenso. Es importante reinyectar el razonamiento previo del asistente junto con su respuesta en cada turno.
- Agentes con uso de herramientas: al razonar antes de cada llamada a herramienta, puede integrarse en flujos agénticos que consultan APIs, buscan información o ejecutan acciones encadenadas, con buen rendimiento en tareas de múltiples pasos.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD o asistentes de programación que necesitan invocar herramientas (ejecución de tests, consulta de repositorios) antes de generar o revisar código.
- Comprensión de imágenes: análisis de capturas de pantalla, diagramas o imágenes junto con instrucciones textuales, útil para tareas de accesibilidad, extracción de información visual o revisión de interfaces.
- Desarrollo web y visualización de datos: generación de componentes web y gráficos, con cribado de calidad funcional y visual en el pipeline de entrenamiento, lo que lo hace adecuado para prototipado rápido de interfaces y dashboards.
- Razonamiento matemático asistido: resolución de problemas matemáticos con trazas de razonamiento configurables; el modo `medium` reduce el coste de cómputo en tareas sencillas y el modo `max` aporta profundidad en problemas complejos.
- Despliegue en hardware limitado: por su tamaño de ~9,65B y disponibilidad de GGUF, puede ejecutarse en GPUs de consumo, dispositivos móviles o entornos con presupuesto de memoria ajustado, sirviendo como asistente local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Para un modelo denso de ~9,65B, la huella en pesos ronda los 19,3 GB en safetensors (probablemente FP16/BF16); las cuantizaciones GGUF reducen esta cifra, pero los niveles concretos no están disponibles.
- GPU recomendadas: no especificadas por el autor. Por tamaño, encaja en GPUs de consumo (gama RTX 4090 y similares) y en GPUs de datacenter (A100, H100) para mayor throughput.
- Cabe en GPU de consumo: sí, según la descripción del autor ("lowest-resource option for memory-constrained GPUs, mobile devices, and lighter workloads"), aunque no se detallan modelos concretos ni requisitos de VRAM.
- Opciones de despliegue: Transformers (ruta solo texto que omite el encoder de visión), vLLM y llama.cpp (con soporte de MTP para decodificación especulativa). El modelo usa una plantilla de chat personalizada incluida en el repo.
- Latencia y throughput estimados: no disponibles. La decodificación especulativa vía MTP reduce la latencia en vLLM y llama.cpp.
- Ajustes de muestreo recomendados: `temperature=1.0`, `top_p=0.95`, `top_k=50`, `repetition_penalty=1.0`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Blossom-V7.2-9B | ~9,65B | 256K (128K recomendado) | Apache 2.0 | Hugging Face (safetensors + GGUF) | Multimodal, thinking `medium`/`max`, tool use |
| Blossom-V7.2-27B | No disponible | 256K (según familia) | Apache 2.0 | Hugging Face (safetensors + GGUF) | Variante densa más capaz, base Qwen3.8-27B |
| Blossom-V7.2-35B-A3B | No disponible | 256K (según familia) | Apache 2.0 | Hugging Face (safetensors + GGUF) | MoE orientado a throughput, base Qwen3.6-35B-A3B |
| Qwen3.5-9B | ~9B | No disponible en la información | No disponible en la información | Hugging Face | Modelo base del que deriva Blossom-V7.2-9B |

## Limitaciones y advertencias

- Idiomas: solo inglés y chino declarados; el rendimiento en castellano no está garantizado ni documentado.
- Plantilla de chat: debe usarse la plantilla incluida en el repo; sustituirla por la nativa de Qwen o combinarlas degrada el modelo.
- Multi-turno: es obligatorio reinyectar el razonamiento previo del asistente junto con su respuesta; omitirlo degrada significativamente el rendimiento en turnos posteriores.
- Contexto: aunque soporta 256K tokens, el autor recomienda 128K para mejores resultados; más allá de ese límite la calidad puede degradarse.
- Razonamiento siempre activo: el modo `max` por defecto genera trazas más largas y consume más tokens; en tareas sencillas conviene usar `medium` para controlar coste y latencia.
- Alucinación: no se documentan tasas de alucinación ni evaluaciones específicas; aplican los riesgos habituales de modelos generativos.
- Sesgos: no se documentan sesgos conocidos en la información disponible.
- Datos de entrenamiento: no publicados todavía; el autor indica que se liberarán en una actualización futura, lo que limita la reproducibilidad y la auditoría del pipeline.
- Uso comercial: permitido por la licencia Apache 2.0, sin restricciones adicionales documentadas.
- Benchmarks: no hay resultados publicados, por lo que la comparación de rendimiento con alternativas no es verificable con datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Azure99/Blossom-V7.2-9B
- GGUF: https://huggingface.co/Azure99/Blossom-V7.2-9B-GGUF
- Demo: https://huggingface.co/spaces/Azure99/Blossom-9B-Demo
- Chat: https://blossom-chat.com/
- GitHub: https://github.com/Azure99/BlossomLM
- Framework de datos: https://github.com/Azure99/BlossomData
- Entorno de agentes: https://github.com/Azure99/agentbox
- Variante 27B: https://huggingface.co/Azure99/Blossom-V7.2-27B
- Variante 35B-A3B: https://huggingface.co/Azure99/Blossom-V7.2-35B-A3B
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B

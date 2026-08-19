# BoneMangler/Qwen3.6-27B-V1.1-FF711-Darker-Hero-GAIN-H2.0-Q8_0-GGUF

## Resumen

El modelo `BoneMangler/Qwen3.6-27B-V1.1-FF711-Darker-Hero-GAIN-H2.0-Q8_0-GGUF` es una cuantización GGUF en Q8_0 del modelo base `DavidAU/Qwen3.6-27B-V1.1-FF711-Darker-Hero-GAIN-H2.0`, un afinamiento de Qwen3.6-27B orientado a escritura creativa, roleplaying y generación de ficción con un estilo "darker hero". El autor BoneMangler ha convertido el modelo a formato GGUF mediante llama.cpp, permitiendo su ejecución local con herramientas como llama.cpp, llama-server o cualquier runtime compatible con GGUF.

El modelo base, desarrollado por DavidAU, emplea el método de entrenamiento "GAIN" (inventado durante la construcción de Qwen 3.6 27B Fable Fusion 711) y ha sido sometido a un proceso de "abliteration" (eliminación de rechazos) y afinamiento con datasets estrictos de DavidAU (Polar-STRICT y F451-STRICT). Esto da como resultado un modelo "uncensored" y "heretic" que prioriza la libertad creativa sin restricciones de contenido, aunque con las advertencias éticas correspondientes.

La relevancia de esta versión GGUF radica en que ofrece una alternativa práctica para desplegar un modelo de 27B en hardware local con cuantización Q8_0, manteniendo un equilibrio entre calidad de generación y requisitos de memoria. El modelo hereda las capacidades de razonamiento y codificación de Qwen3.6, pero está especializado en tareas creativas y de rol, lo que lo diferencia de los modelos generalistas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.6 (transformer denso con gated delta networks hybrid attention y MTP) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.000 tokens (según vLLM Recipes para Qwen3.6-27B) |
| Tipos de cuantizacion | Q8_0 (esta versión) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q8_0) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-27B, sobre el que se construye este afinamiento, utiliza una arquitectura transformer densa con atención híbrida basada en "gated delta networks" y predicción multi-token (MTP). Esta combinación busca mejorar la eficiencia en el procesamiento de secuencias largas (hasta 262K tokens) y acelerar la inferencia. El modelo original es multimodal (image-text-to-text), aunque la versión GGUF aquí presentada se limita al texto.

El proceso de entrenamiento del modelo base DavidAU incluye el método "GAIN", una técnica propietaria de entrenamiento multi-etapa y multi-fusión, junto con datasets estrictos (Polar-STRICT y F451-STRICT) que probablemente contienen instrucciones de alta calidad para tareas creativas y de rol. Además, se aplicó "abliteration" (eliminación de la capa de rechazo) y un ajuste fino orientado a producir respuestas sin censura, lo que explica los tags "uncensored", "heretic" y "not-for-all-audiences". La conversión a GGUF Q8_0 se realizó con llama.cpp, sin modificar los pesos del modelo original.

## Capacidades

- Generación de texto creativo: ficción, poesía, diálogos, narrativa en múltiples géneros (fantasía, terror, ciencia ficción, etc.).
- Roleplaying y simulación de personajes: puede mantener conversaciones multi-turno con personalidades definidas y estilo "darker hero".
- Razonamiento y pensamiento: soporta modo "thinking" (según tags) para tareas que requieren reflexión previa antes de responder.
- Generación de código: al estar basado en Qwen3.6, conserva capacidades de codificación y agentic coding, aunque no es su enfoque principal.
- Multilingüismo limitado: soporta inglés y chino, con posible degradación en otros idiomas.
- Ausencia de rechazos: gracias al proceso de abliteration, el modelo no rechaza solicitudes de contenido explícito o sensible (con las advertencias correspondientes).
- Tool calling y function calling: no se especifica explícitamente en la información disponible; se recomienda verificar en la documentación del modelo base.

## Casos de uso

- Escritura de ficción oscura: el modelo puede generar relatos, novelas o guiones con tono "darker hero", aprovechando su entrenamiento específico en estilos narrativos intensos.
- Roleplaying en juegos de texto: permite mantener personajes consistentes y tramas complejas en sesiones largas, gracias a su ventana de contexto amplia (262K tokens).
- Creación de diálogos para videojuegos: puede producir conversaciones para NPCs con personalidades definidas y matices emocionales, reduciendo el trabajo manual de guionistas.
- Asistente de escritura sin censura: para autores que necesitan explorar temas tabú o contenido adulto sin filtros, el modelo ofrece respuestas directas sin rechazos.
- Generación de ideas y brainstorming creativo: puede proponer tramas, giros argumentales o conceptos originales en sesiones de lluvia de ideas, combinando razonamiento y creatividad.
- Chat interactivo para entretenimiento: despliegue como chatbot en aplicaciones de ocio donde se busca una experiencia inmersiva y sin restricciones, siempre bajo responsabilidad del operador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base DavidAU afirma superar el rendimiento de los modelos Qwen 3.5 y Qwen 3.6 de 27B y 35B-A3B, pero no se proporcionan cifras concretas en la documentación accesible. Se recomienda consultar la model card del modelo base para futuras actualizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF Q8_0 ocupa aproximadamente 29 GB (tamaño del repo). Para cargar el modelo completo en GPU se necesitan al menos 30 GB de VRAM (por ejemplo, una A100 40GB o H100 80GB). En GPU de consumo como RTX 4090 (24 GB) no cabe la cuantización Q8_0 completa; sería necesario usar cuantizaciones más bajas (Q4_K_M, Q5_K_M) disponibles en otros repos del modelo base.
- GPU recomendadas: A100 40GB, H100, o múltiples GPUs en paralelo. Para uso en consumer, se puede ejecutar en CPU con 32-64 GB de RAM, aunque la velocidad será significativamente menor.
- Opciones de despliegue: llama.cpp (CLI o servidor), llama-server, y cualquier runtime compatible con GGUF (Ollama, LM Studio, etc.). El modelo se puede cargar directamente desde HuggingFace con `--hf-repo`.
- Latencia y throughput: no se dispone de datos medidos. Como referencia orientativa, un modelo de 27B en Q8_0 en una A100 puede generar entre 20-40 tokens/segundo, pero estos valores dependen del hardware, la longitud de contexto y los parámetros de decodificación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen3.6-27B (original) | 27,3B | 262K | Apache 2.0 | Generalista, multimodal, agentic coding |
| Qwen3.6-27B-V1.1-FF711-Darker-Hero-GAIN-H2.0 (este) | 27,3B | 262K (heredado) | Apache 2.0 | Creativo, roleplaying, sin censura |
| Qwen3.5-27B (si existe) | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita a la información disponible. No se dispone de datos de rendimiento numéricos para contrastar. El modelo base afirma superar a Qwen 3.5 y 3.6 en tareas específicas, pero sin métricas publicadas no es posible verificar esta afirmación.

## Limitaciones y advertencias

- Contenido sin censura: el modelo ha sido "abliterated" y puede generar contenido explícito, violento o inapropiado. No es apto para todos los públicos y su uso en producción requiere políticas de moderación y responsabilidad legal.
- Sesgos y alucinaciones: como todo modelo de lenguaje, puede inventar información o reflejar sesgos presentes en los datos de entrenamiento. La ausencia de rechazos aumenta el riesgo de generar afirmaciones falsas o dañinas.
- Limitación idiomática: solo está entrenado en inglés y chino; su rendimiento en otros idiomas es impredecible.
- Pérdida de capacidades multimodales: la versión GGUF Q8_0 es solo texto, aunque el modelo original (image-text-to-text) pudiera procesar imágenes.
- Contexto largo: aunque la ventana declarada es de 262K tokens, el rendimiento en contextos muy largos puede degradarse y el consumo de memoria aumenta considerablemente.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el contenido generado puede estar sujeto a normativas legales sobre difamación, odio o material explícito. El responsable del despliegue debe evaluar el cumplimiento normativo.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/BoneMangler/Qwen3.6-27B-V1.1-FF711-Darker-Hero-GAIN-H2.0-Q8_0-GGUF
- Modelo base (DavidAU): https://huggingface.co/DavidAU/Qwen3.6-27B-V1.1-FF711-Darker-Hero-GAIN-H2.0
- Repositorio de Qwen3.6 en GitHub: https://github.com/QwenLM/Qwen3.6
- Página de vLLM Recipes para Qwen3.6-27B: https://recipes.vllm.ai/Qwen/Qwen3.6-27B

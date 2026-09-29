# maytrix-Inc/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal denso de 27.781.427.952 parámetros (27,8B) con encoder de visión nativo, desarrollado dentro de la familia Qwen de Alibaba y publicado en Hugging Face bajo licencia Apache 2.0. Se presenta como la generación más capaz de la serie de modelos abiertos Qwen hasta la fecha, construida sobre la base arquitectónica de Qwen3.5, y llega en formato compacto y desplegable: un modelo denso (no MoE) que entiende imágenes y vídeo y que incorpora control flexible del modo de razonamiento.

El problema que aborda es el de las tareas de horizonte largo que requieren planificación autónoma y ejecución fiable de extremo a extremo: codificación agéntica en terminal, trabajo profesional y ofimático, investigación y flujos con múltiples pasos y llamadas a herramientas. Su contexto nativo de 262.144 tokens, extensible hasta 1.000.000, y su soporte nativo de imagen y vídeo (desde diagramas STEM y documentos hasta vídeos de una hora) lo sitúan en el segmento de modelos densos de ~30B con capacidades multimodales.

Es relevante ahora porque combina un tamaño que cabe en hardware de gama alta de consumo con cuantización de 4 bits, una licencia permisiva sin restricciones de uso comercial y compatibilidad declarada con los principales motores de inferencia (Transformers, vLLM, SGLang, TokenSpeed). Además, la model card anuncia una versión alojada en Qwen Cloud con 1M de contexto por defecto y herramientas oficiales integradas, lo que permite comparar el despliegue propio con una alternativa gestionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con encoder de visión: Gated DeltaNet (atención lineal) + Gated Attention (atención completa), con FFN tras cada bloque. Layout: 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)), 64 capas |
| Parámetros totales | 27.781.427.952 (~27,8B) según los pesos safetensors; la model card indica 27B |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 tokens |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato Hugging Face Transformers); compatible con vLLM, SGLang y TokenSpeed |
| Dimensión oculta | 5120 |
| Dimensión intermedia (FFN) | 17.408 |
| Gated DeltaNet | 48 cabezas de atención lineal para V y 16 para QK; dimensión de cabeza 128 |
| Gated Attention | 24 cabezas para Q y 4 para KV; dimensión de cabeza 256; dimensión de RoPE 64 |
| Vocabulario / embeddings | 248.320 (con padding) tanto en entrada como en salida |
| Predicción multi-token (MTP) | Entrenado con múltiples pasos |
| Etapa de entrenamiento | Preentrenamiento y postentrenamiento |
| Tamaño del repositorio | 55,6 GB |
| Pipeline declarado | image-text-to-text |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal híbrido que alterna dos mecanismos de mezcla temporal. El bloque dominante es Gated DeltaNet, una atención lineal con 48 cabezas para V y 16 para QK con dimensión de cabeza 128, que se repite tres veces antes de intercalar una capa de Gated Attention completa (24 cabezas de consulta y solo 4 de clave-valor, dimensión de cabeza 256 y RoPE de dimensión 64). El patrón se replica 16 veces hasta sumar 64 capas, con una red feed-forward de dimensión intermedia 17.408 después de cada bloque de atención. Esta combinación busca el coste subcuadrático de la atención lineal en la mayor parte de las capas y reserva la atención completa para un subconjunto reducido, lo que resulta coherente con la ventana nativa de 262.144 tokens y la extensión anunciada hasta 1.000.000. Incluye además un encoder de visión, lo que lo convierte en un modelo nativo de imagen-texto, y se entrena con predicción multi-token (MTP) en varios pasos, técnica que habitualmente se aprovecha para decodificación especulativa y aceleración de la generación.

Sobre los datos de entrenamiento, la model card solo indica que hubo preentrenamiento y postentrenamiento, sin detallar el número de tokens, la composición del corpus ni si se emplearon RLHF, DPO u otras técnicas de alineación: esa información no está disponible. Las innovaciones declaradas son el control flexible del pensamiento (modo de razonamiento activado por defecto, desactivable por petición, con profundidad ajustable mediante `reasoning_effort` y retención del contexto de razonamiento de mensajes anteriores mediante `preserve_thinking`), la mejora en ejecución agéntica con planificación autónoma y mejor manejo del feedback del entorno, y una mayor compatibilidad con herramientas y entornos de desarrollo habituales.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento activado por defecto, desactivable por petición y con profundidad de razonamiento ajustable.
- Codificación y tareas de terminal de carácter agéntico, con mejoras declaradas frente a Qwen3.6-27B tanto en texto como en modalidad visual.
- Comprensión nativa de imagen y vídeo: diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Ejecución agéntica de horizonte largo: planificación autónoma, manejo del feedback del entorno y finalización fiable de tareas de extremo a extremo.
- Retención del contexto de razonamiento entre mensajes históricos mediante `preserve_thinking`, útil en conversaciones multi-turno con pasos intermedios largos.
- Compatibilidad con herramientas y entornos de desarrollo populares (harnesses), pensada para integración en stacks existentes.
- Predicción multi-token (MTP) entrenada en varios pasos, aprovechable para decodificación especulativa.
- Llamada a herramientas / function calling: la versión alojada en Qwen Cloud anuncia herramientas oficiales integradas; en los pesos abiertos la model card no detalla un formato específico, por lo que el soporte concreto de tool calling en el despliegue propio no está documentado en la información disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas soportados en el repositorio).

## Casos de uso

- Codificación agéntica en terminal: el modelo está evaluado específicamente en Terminal Bench 2.1 (Terminus), dentro de la categoría de codificación, y declara mejoras en planificación autónoma y manejo del feedback del entorno. Se usaría como agente que ejecuta comandos, interpreta errores de compilación o tests y corrige de forma iterativa dentro de un contenedor de CI/CD.
- Trabajo ofimático y documental con entrada visual: al ser un modelo nativo de imagen-texto, puede procesar capturas de hojas de cálculo, PDFs escaneados o presentaciones y generar resúmenes, extracciones estructuradas o informes, cubriendo tanto la modalidad textual como la visual.
- Análisis de documentación técnica extensa: con 262.144 tokens de contexto nativo (y hasta 1.000.000 en la versión alojada), permite cargar manuales, especificaciones y bases de código completas en una sola ventana y hacer preguntas cruzadas sin fragmentar el material en trozos.
- Comprensión de vídeo de larga duración: la model card menciona soporte de vídeos de hasta una hora, lo que habilita casos como transcripción enriquecida con eventos visuales, auditoría de grabaciones de sesiones o extracción de momentos concretos en material de formación.
- Asistente de investigación sobre diagramas STEM: la capacidad de interpretar diagramas y figuras permite resolver dudas sobre esquemas matemáticos o de ingeniería, explicar figuras de artículos y generar derivaciones paso a paso apoyadas en la imagen.
- Agentes multi-paso con herramientas en producción: la combinación de retención del contexto de razonamiento (`preserve_thinking`), control de profundidad (`reasoning_effort`) y compatibilidad con vLLM y SGLang permite montar pipelines donde el modelo encadena búsquedas, llamadas a API y verificaciones antes de devolver un resultado.
- Atención al cliente con contexto largo y multimodal: un asistente que recibe capturas de pantalla del error del usuario, mantiene el historial de la conversación en una ventana amplia y deriva a un humano solo cuando no puede cerrar el caso.
- Despliegue on-premise con requisitos de privacidad: la licencia Apache 2.0 y el tamaño denso de 27,8B permiten ejecutar el modelo en infraestructura propia con cuantización de 4 bits en una GPU de gama alta de consumo, sin enviar datos a servicios externos.

## Benchmarks y rendimiento

La model card incluye una sección de resultados de benchmarks con una tabla comparativa frente a Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, organizada por categorías (la primera visible es "Coding"). El único benchmark identificable en la información extraída es **Terminal Bench 2.1 (Terminus)**, bajo la etiqueta "Agentic terminal coding". Los valores numéricos de esa tabla no se han recuperado en la extracción proporcionada, por lo que no se reproducen aquí.

| Benchmark | Categoría | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|---|
| Terminal Bench 2.1 (Terminus) | Coding / agentic terminal coding | No disponible en la extracción | No disponible en la extracción | No disponible en la extracción | No disponible en la extracción | No disponible en la extracción |
| Resto de benchmarks de la tabla de la model card | Coding, trabajo profesional, investigación, tareas agénticas | No disponible en la extracción | No disponible en la extracción | No disponible en la extracción | No disponible en la extracción | No disponible en la extracción |

No se han publicado en la información disponible resultados numéricos de benchmarks de uso general (MMLU, HumanEval, GSM8K u otros) que puedan citarse sin riesgo de invención. Para cifras concretas debe consultarse directamente la model card en Hugging Face o el catálogo de vals.ai.

## Requisitos de hardware

- VRAM para inferencia en BF16: el repositorio pesa 55,6 GB, coherente con 27,8B parámetros a 16 bits. Se necesita al menos una GPU de 80 GB (H100, A100 80 GB) con poco margen para caché KV, o dos GPU de 80 GB / 48 GB en tensor parallel.
- Estimación de la caché KV: dado que solo 16 de las 64 capas usan atención completa, con 4 cabezas KV de dimensión 256 la caché equivale a unos 32.768 elementos por token (≈64 KiB por token en BF16). A 262.144 tokens de contexto eso supone del orden de 16 GB adicionales, estimación propia calculada a partir de la configuración publicada. El coste de estado de las capas Gated DeltaNet no está cuantificado en la información disponible.
- Cuantización a 8 bits: aproximadamente 28 GB de pesos, lo que requiere GPU de 40-48 GB (A100 40 GB, L40S 48 GB) o superiores según la longitud de contexto.
- Cuantización a 4 bits: aproximadamente 15-16 GB de pesos, lo que permite ejecución en GPU de consumo como la RTX 4090 (24 GB) o la RTX 5090 (32 GB), con margen limitado si se trabaja con contextos muy largos.
- GPU recomendadas: H100 80 GB o A100 80 GB para BF16 en producción; L40S, A6000 o RTX 4090/5090 para cuantizaciones de 8 y 4 bits.
- Opciones de despliegue confirmadas por el autor: Hugging Face Transformers, vLLM, SGLang y TokenSpeed. No se mencionan llama.cpp, Ollama, TGI ni pesos GGUF en la información disponible, por lo que su compatibilidad no está confirmada.
- Latencia y throughput: no disponible. No se han publicado cifras de tokens por segundo ni de tiempo hasta el primer token en la información proporcionada.

## Comparativa con modelos similares

Los modelos de referencia que aparecen en la tabla de benchmarks de la propia model card son Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max. Los datos públicos de estos modelos no forman parte de la información proporcionada, por lo que la mayoría de celdas quedan como no disponibles.

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B | 27,8B densos | 262.144 nativos, hasta 1.000.000 | Texto + imagen + vídeo | Apache 2.0 | Pesos en Hugging Face (repositorio de maytrix-Inc); servicio gestionado anunciado en Qwen Cloud, Alibaba Cloud Model Studio y Microsoft Foundry |
| Qwen3.6-27B | 27B (según el nombre) | No disponible | No disponible | No disponible | No disponible |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | No disponible | No disponible |
| Muse Glimmer-30B | 30B (según el nombre) | No disponible | No disponible | No disponible | No disponible |
| Opus4.6 Max | No disponible | No disponible | No disponible | No disponible | No disponible; por el nombre, se trata de un modelo propietario de referencia |

No se dispone de datos verificables de otros modelos abiertos comparables de la misma categoría (~30B densos multimodales) en la información proporcionada, por lo que no se incluye una comparación adicional.

## Limitaciones y advertencias

- El repositorio de Hugging Face analizado está publicado por el usuario **maytrix-Inc**, no por la organización oficial de Qwen. Presenta 0 descargas y 0 likes en el momento de la consulta, con fecha de creación y actualización de 2026-09-28, por lo que conviene verificar la procedencia y la integridad de los pesos antes de usarlos en producción. La model card incluida parece reproducir el texto oficial de Qwen, incluyendo enlaces a servicios de Qwen Cloud y a un repositorio de GitHub que en realidad se identifica como el de la serie Qwen3.5.
- Riesgo de alucinación: no se declaran tasas de alucinación ni resultados de benchmarks de veracidad en la información disponible. Como en cualquier modelo generativo, la salida debe validarse, especialmente en tareas agénticas donde una acción errónea puede tener efectos reales.
- Sesgos conocidos: no disponible. No se documenta ninguna evaluación de sesgos ni de comportamiento diferencial por idioma, género, origen o dominio.
- Idiomas soportados: no disponible. No se declara la lista de idiomas cubiertos, lo que impide evaluar de antemano la calidad en castellano respecto a otros idiomas.
- Limitaciones de contexto: los 1.000.000 de tokens de contexto se describen como extensión y, según la model card, están disponibles por defecto solo en la versión alojada; en los pesos abiertos el contexto nativo es de 262.144 tokens. La extensión puede degradar la calidad de recuperación en posiciones intermedias.
- Modo de pensamiento activado por defecto: al estar habilitado por defecto, incrementa el número de tokens generados y, por tanto, la latencia y el coste si no se desactiva explícitamente por petición o se ajusta `reasoning_effort`.
- Cuantizaciones y formatos alternativos: no se ofrecen pesos GGUF, AWQ o GPTQ en la información disponible, ni se documentan los tipos de cuantización soportados oficialmente.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificación y redistribución sin royalties, pero la licencia se aplica a los artefactos publicados en ese repositorio; si los pesos son una reubicación de un modelo oficial, conviene confirmar la licencia en la fuente original.
- Coste de hardware: en BF16 el modelo no cabe en una GPU de consumo; el despliegue en producción exige GPUs de 80 GB o cuantización agresiva con la consiguiente pérdida de calidad.
- Ausencia de datos de rendimiento: no hay cifras publicadas de latencia, throughput ni comparativas numéricas verificables en la información proporcionada.

## Enlaces

- Hugging Face (repositorio analizado, maytrix-Inc): https://huggingface.co/maytrix-Inc/Qwen3.8-27B
- Repositorio oficial en GitHub (serie Qwen3.5, Qwen3.6 y Qwen3.8): https://github.com/QwenLM/Qwen3.8
- Qwen Cloud, ficha del modelo y servicio alojado: https://www.qwencloud.com/models/qwen3.8-27b
- Alibaba Cloud Model Studio, documentación del modelo: https://www.alibabacloud.com/help/en/model-studio/qwen3-8-27b
- Microsoft Foundry, catálogo de modelos: https://ai.azure.com/catalog/models/qwen--qwen3.8-27b
- vals.ai, detalles y resultados de benchmarks: https://www.vals.ai/models/alibaba_qwen3.8-27b

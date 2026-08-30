# liskasYR/Qwen3.8-Flash-Next

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje multimodal de código abierto desarrollado por el equipo Qwen de Alibaba, publicado el 26 de agosto de 2026 como una vista previa experimental de la arquitectura que dará lugar a Qwen4. El modelo introduce un rediseño fundamental de los componentes centrales de los LLM modernos, combinando atención híbrida con Gated DeltaNet y Qwen Sparse Attention (QSA), MoE con 512 expertos, Gated Residual y N-gram Embedding. Con 180 000 millones de parámetros totales (125B del LM, 51B de embeddings n-grama y 4B de MTP), activa solo 6B por token, lo que permite una inferencia eficiente pese a su tamaño. Su contexto nativo es de 262 144 tokens, extensible hasta 1 000 000, y admite entrada de imagen y texto. Está pensado para cargas de trabajo agénticas y de razonamiento complejo, y según las fuentes supera a Claude-4.6-Opus (Max) en ciertas tareas, aunque no se han publicado los números de referencia en la documentación disponible.

El modelo se distribuye bajo la licencia qwen-community-1.0 y está disponible en formato Transformers, compatible con vLLM, SGLang y TokenSpeed. El repositorio oficial en Hugging Face contiene los pesos en safetensors, con un tamaño de 360 GB. Al ser una versión experimental, se recomienda validar su comportamiento antes de usarlo en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet + Qwen Sparse Attention (QSA) + MoE + Gated Residual + N-gram Embedding |
| Parametros totales | 179 999 981 459 (aprox. 180B) |
| Parametros activos | 6B por token (MoE) |
| Longitud de contexto | 262 144 tokens nativo, extensible a 1 000 000 |
| Tipos de cuantizacion | No disponible (se espera soporte GGUF/AWQ por parte de la comunidad) |
| Idiomas soportados | No disponible |
| Licencia | qwen-community-1.0 (licencia propia de Qwen, uso comercial sujeto a términos) |
| Formato de pesos | safetensors (Transformers), compatible con vLLM, SGLang, TokenSpeed |

## Arquitectura y entrenamiento

Qwen3.8-Flash-Next se basa en una arquitectura híbrida que combina varias innovaciones. En la atención, sustituye la atención completa por una mezcla de Gated DeltaNet (atención lineal con estado recurrente) y Qwen Sparse Attention (QSA), que opera a nivel de micro-bloques en lugar de tokens individuales, reduciendo la latencia en contextos largos. El bloque se organiza en 12 grupos, cada uno con 3 capas de Gated DeltaNet seguidas de MoE y 1 capa de QSA seguida de MoE. El MoE cuenta con 512 expertos, de los que se activan 10 enrutados más 1 compartido, con dimensión intermedia de 640.

El modelo incorpora Gated Residual, que modula el flujo de información a través de los residual streams mediante una puerta de lectura dependiente de los datos y una puerta de escritura escalar por rama, con 4 ramas y un cuello de botella de rango 320. Además, introduce N-gram Embedding: un mecanismo que indexa embeddings mediante n-gramas (bigramas y trigramas) en la capa 2, permitiendo escalar parámetros de forma eficiente y más fácil de descargar que el MoE tradicional, con 20 millones de entradas.

El entrenamiento utiliza un enfoque de recetas adaptadas: los optimizadores Muon y AdamW se aplican a categorías específicas de pesos, y se elimina el warmup de batch size, comenzando directamente en el tamaño objetivo, lo que reduce pasos de optimización y permite tasas de aprendizaje mayores. El modelo se entrenó en dos etapas: pre-entrenamiento y post-entrenamiento, e incluye un módulo MTP (Multi-Token Prediction) de 1 capa entrenado con múltiples pasos para mejorar la eficiencia de decodificación.

## Capacidades

- Generación de texto y razonamiento complejo, incluyendo matemáticas, lógica y análisis.
- Comprensión de imágenes (entrada multimodal image-text-to-text), permitiendo describir, analizar y responder sobre contenido visual.
- Contexto largo nativo de 262 144 tokens, ampliable a 1 000 000, adecuado para documentos extensos y conversaciones multi-turno.
- Arquitectura MoE con 6B parámetros activos, lo que ofrece un buen equilibrio entre capacidad y coste de inferencia.
- Soporte para decodificación especulativa mediante el módulo MTP, que acelera la generación.
- Capacidades agénticas: el diseño de atención híbrida reduce la latencia en tareas de múltiples pasos, facilitando el uso como agente autónomo.
- Compatible con herramientas de inferencia estándar del ecosistema (Transformers, vLLM, SGLang, TokenSpeed).

## Casos de uso

- Agentes autónomos con contexto largo: el modelo puede gestionar conversaciones multi-turno con memoria de hasta 1M tokens, ideal para asistentes que necesitan recordar interacciones previas y ejecutar tareas complejas en varios pasos.
- Análisis de documentos extensos: con 262K tokens de contexto nativo, permite procesar libros completos, informes financieros o expedientes legales en una sola pasada, extrayendo información y generando resúmenes detallados.
- Razonamiento multimodal: al aceptar imágenes, puede utilizarse en sistemas de asistencia técnica que reciben capturas de pantalla o fotografías y deben explicar errores o guiar al usuario.
- Generación de código en entornos de desarrollo: su capacidad de razonamiento y contexto largo lo hace apto para refactorizar proyectos grandes, explicar fragmentos heredados o generar tests a partir de documentación.
- Investigación en IA: al ser una arquitectura experimental que anticipa Qwen4, es útil para estudiar el comportamiento de atención híbrida, MoE con n-gram embeddings y técnicas de entrenamiento sin warmup de batch.
- Despliegue en infraestructura propia con GPUs de alta capacidad: gracias a los 6B parámetros activos, puede servir peticiones concurrentes con menor latencia que un modelo denso de tamaño equivalente, usando vLLM o SGLang.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio incluye una tabla de resultados, pero no se ha podido extraer su contenido. Las fuentes externas (unsloth, AI Wiki) mencionan que el modelo supera a Claude-4.6-Opus (Max) en ciertas tareas, pero no se aportan cifras concretas. Se recomienda consultar el informe técnico oficial para obtener datos numéricos.

## Requisitos de hardware

- El modelo completo en precisión FP16 ocupa aproximadamente 360 GB, por lo que requiere múltiples GPUs de alta capacidad o cuantización agresiva.
- Con cuantización a 4 bits, los pesos ocuparían alrededor de 90 GB, lo que permitiría ejecutarlo en una sola GPU A100 80GB o H100 80GB, aunque con limitaciones de contexto.
- En cuantización de 8 bits, se necesitarían al menos 180 GB de VRAM, es decir, dos GPUs A100 80GB o similares.
- Según unsloth, el modelo puede ejecutarse en dispositivos con 75 GB de RAM/unified memory sin necesidad de VRAM dedicada, usando técnicas de offloading.
- Opciones de despliegue: vLLM, SGLang, TokenSpeed, Transformers con accelerate, y potencialmente llama.cpp/Ollama cuando la comunidad genere archivos GGUF.
- No se dispone de datos de latencia o throughput en la información proporcionada.

## Comparativa con modelos similares

El modelo se posiciona como un MoE de gran tamaño con contexto muy largo. Se compara con otros MoE de la misma familia y con alternativas de propósito general:

| Modelo | Parámetros totales | Activos por token | Contexto | Licencia |
|---|---|---|---|---|
| Qwen3.8-Flash-Next | 180B | 6B | 262K (1M ext.) | qwen-community-1.0 |
| Qwen3-235B-A22B | 235B | 22B | 32K | Apache 2.0 |
| Qwen3-30B-A3B | 30B | 3B | 32K | Apache 2.0 |
| DeepSeek-V3 (referencia) | 671B | 37B | 128K | MIT |

Qwen3.8-Flash-Next destaca por su eficiencia en parámetros activos (6B) y su contexto nativo muy superior a los Qwen3 anteriores. Sin embargo, al ser experimental, carece del ecosistema maduro de herramientas y de los datos de benchmarks públicos que sí tienen los modelos estables.

## Limitaciones y advertencias

- Modelo experimental: es una vista previa de la arquitectura Qwen4, por lo que puede presentar comportamientos inestables o cambios en versiones futuras.
- Licencia qwen-community-1.0: aunque permite uso comercial, incluye restricciones específicas (por ejemplo, límites para empresas con ciertos ingresos o requisitos de atribución). Revisar los términos completos antes de desplegar en producción.
- Riesgo de alucinación: como todo LLM, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo o con contextos muy largos.
- Sesgos: no se han publicado evaluaciones de sesgo para este modelo; al entrenarse con datos web, puede reflejar prejuicios presentes en esos datos.
- Requisitos de hardware elevados: aunque solo se activan 6B parámetros, el tamaño total de los pesos (360 GB en FP16) limita su uso a infraestructuras con GPUs de gran capacidad o cuantización.
- Soporte de herramientas no verificado: la model card no menciona explícitamente tool calling; el modelo oficial Qwen3.8-Flash sí lo incluye, pero esta versión experimental podría no tenerlo implementado.
- Idiomas no documentados: no se especifica qué idiomas soporta más allá del inglés y chino típicos de los modelos Qwen.

## Enlaces

- Repositorio en Hugging Face (oficial): https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio en Hugging Face (mirror, liskasYR): https://huggingface.co/liskasYR/Qwen3.8-Flash-Next
- GitHub del proyecto: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Blog de Qwen sobre el modelo: https://qwen.ai/blog?id=qwen3.8-flash-next
- Informe técnico (PDF): https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf
- Guía de ejecución local (unsloth): https://unsloth.ai/docs/models/qwen3.8-next
- Ficha en AI Wiki: https://aiwiki.ai/wiki/qwen3_8_flash_next
- Seguimiento de lanzamiento (AI Release Tracker): https://aireleasetracker.com/model/qwen/qwen3.8-flash-next

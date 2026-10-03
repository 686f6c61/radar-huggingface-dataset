# CMSManhattan/JiRackDeltaNet_180b

## Resumen

JiRack DeltaNet 180B es un modelo de lenguaje de tipo Mixture-of-Experts desarrollado por CMSManhattan, derivado del modelo base Qwen/Qwen3.8-Flash-Next y migrado a la arquitectura ternaria propietaria JiRack. Cuenta con 176.943.899.520 parámetros almacenados (unos 177.000 millones) pero solo unos 6.000 millones activos por token, gracias a un enrutado top-10 sobre 512 expertos más un experto compartido. El objetivo declarado es hacer viable la inferencia de alta calidad en CPU a esta escala, acercando el rendimiento por token al de un modelo denso de 6B mientras se mantiene la calidad de un modelo mucho mayor.

Técnicamente combina atención lineal Gated DeltaNet intercalada con Qwen Sparse Attention (QSA), flujos residuales con hiper-conexiones (gated residual streams) y una tabla de embeddings hashed n-gram de 51.000 millones de parámetros. La migración a la arquitectura JiRack se apoya en capas BitLinear con pesos ternarios (per-tensor absmean) y un pipeline de QAT con warmup de lambda, orientado a inferencia TQ2_0 en llama.cpp y Ollama.

Es relevante ahora por dos motivos: por un lado, propone una vía de compresión ternaria sobre un MoE de gran tamaño con routers congelados y monitorización de salud del enrutado; por otro, porque su estado actual es intermedio. Los pesos publicados son numéricamente idénticos al modelo base, ya que el patch BitLinear está aplicado con lambda = 0 (passthrough bit-exact, diferencia máxima de logits de 0,000000) y el QAT ternario todavía no ha comenzado. Los beneficios ternarios descritos en la model card aplican solo después de completar el QAT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE sobre transformer híbrido: Gated DeltaNet (atención lineal) intercalada con Qwen Sparse Attention (QSA), hiper-conexiones (gated residual streams), capas BitLinear ternarias |
| Parámetros totales | 176.943.899.520 (dato real de safetensors) |
| Parámetros activos | ~6.000 millones por token (512 expertos, enrutado top-10 más experto compartido) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16, Q8_0, Q4_K_M, Q3_K_M, Q2_K y TQ2_0 (solo planificados, no publicados); pesos ternarios BitLinear tras QAT |
| Idiomas soportados | en, zh, ja, ko, fr, es, pt, de, it, ru, ar, vi, th (13 idiomas) |
| Licencia | qwen-community-1.0 (etiquetada como license: other; enlace a la licencia del modelo base) |
| Formato de pesos | safetensors (layout Hugging Face); GGUF BF16 declarado exportado y verificado, conversión en curso y variantes cuantizadas no publicadas |
| Vocabulario | 248.320 tokens (tokenizer original de Qwen3.8) |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen3.8-Flash-Next y la replica en un port manual (`JiRackDeltaNet_180b.py`). El bloque central combina dos mecanismos de atención: Gated DeltaNet, una atención lineal con estado recurrente, intercalada con Qwen Sparse Attention. Sobre eso se añaden hiper-conexiones en los residuales y un MoE de 512 expertos con enrutado top-10 más un experto compartido siempre activo. La tabla de embeddings es un hashed n-gram de 51.000 millones de parámetros, lo que explica buena parte del recuento total frente a los ~6B activos. El autor declara que la conversión desde el modelo base fue verificada numéricamente: la predicción del siguiente token coincide con la referencia en el 100 % de las posiciones y las diferencias de logits están dentro del propio ruido bf16 del modelo.

El proceso de ternarización se articula en tres fases. La primera es el patch BitLinear sobre 74.028 capas con lambda = 0, que actúa como passthrough bit-exact. La segunda es el QAT ternario con warmup de lambda de 0 a 1, que todavía no se ha iniciado porque requiere una máquina con al menos 640 GB de RAM. La tercera es la publicación de GGUF TQ2_0 y builds de Ollama y Docker. Las innovaciones declaradas en el pipeline de QAT incluyen: los routers nunca se cuantizan y permanecen congelados por defecto, monitorización de salud del enrutado durante el entrenamiento (routing agreement, colapso de entropía, carga por experto), doble QAT vía ONNX QAT y adaptación del proceso de entrenamiento para evitar olvido catastrófico y plateau prematuro (bajo NDA). No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

Estado declarado del proyecto:

| Etapa | Estado |
|---|---|
| Port JiRack de la arquitectura | completado |
| Conversión desde Qwen/Qwen3.8-Flash-Next y verificación numérica | completada; coincide en el 100 % de las posiciones |
| Patch BitLinear (74.028 capas) con lambda = 0 | completado; passthrough bit-exact |
| Export a layout Hugging Face y GGUF BF16 | exportación verificada clave por clave; conversión GGUF en curso |
| QAT ternario (warmup de lambda 0 a 1) | no iniciado; requiere ≥ 640 GB de RAM |
| TQ2_0 / GGUF cuantizado, Ollama y Docker | no publicados |

## Capacidades

- Generación de texto conversacional en 13 idiomas, con especial foco declarado en en, zh y el resto de la lista de idiomas soportados.
- Razonamiento y modo "thinking": el modelo base Qwen3.8-Flash-Next piensa por defecto con `<think>...</think>`; los builds JiRack planean desactivar el razonamiento por defecto, igual que en JiRack 27B.
- Tool calling y function calling: el autor posiciona el modelo como experto de dominio para tool calling, con tokenizer JiRack específico y workflow de tool calls propio.
- Routing: capacidad destacada explícitamente en los tags y en el tokenizer avanzado (Robotics & Routing & Tool calls).
- Robótica: soporte declarado para RoboTech a través del tokenizer dedicado CMSManhattan/JiRackDeltaNetTokenizer.
- Codificación: orientado a agentes de código, con IDE propio (JiRack Coding Agent IDE) para Ollama en PC doméstico e integración con Cursor, Windsurf o Devin.
- Uso como modelo experto en despliegues RAG, con servidor Java ONNX JiRack como alternativa de despliegue.
- Capacidades de visión: el modelo base entiende imágenes y vídeo, pero este build JiRack es actualmente solo texto.
- No hay mención en la información disponible a capacidades de audio.

## Casos de uso

- Inferencia en CPU a gran escala: con ~6B parámetros activos por token, el modelo está pensado para desplegarse en servidores sin GPU y obtener un throughput cercano al de un modelo denso de 6B, con la calidad de un MoE de 177B. Encaja en entornos donde la GPU es el cuello de botella presupuestario.
- Agentes de codificación en local: el JiRack Coding Agent IDE está diseñado para ejecutar estos modelos vía Ollama en un PC doméstico, con un flujo que obliga a revisar y aplicar cambios en lugar de aplicarlos automáticamente, lo que reduce el riesgo en edición de repositorios.
- Automatización de tool calling en empresa: la model card proporciona ejemplos con Spring Boot AI (spring-ai-alibaba) para Java empresarial y con GoEx/Gorilla para Python, de modo que el modelo puede actuar como capa de decisión que invoca APIs internas.
- Modelo experto dentro de un pipeline RAG: por su licencia y su naturaleza MoE, puede usarse como el componente de generación de un sistema RAG, con el servidor Java ONNX como alternativa de servicio.
- Robótica y control de rutas: el tokenizer incluye etiquetas específicas de robótica y routing, lo que permite usarlo en pipelines donde el modelo genera comandos estructurados o decisiones de encaminamiento en lugar de texto libre.
- Generación de código asistida en producción: los tags indican soporte de coding y tool calling, lo que permite integrarlo en flujos de revisión de código y generación de parches con validación humana, aunque la falta de benchmarks publicados obliga a evaluar antes de adoptarlo.
- Cuantización y ajuste a medida bajo encargo: el autor ofrece QAT desde el dataset del cliente, doble QAT vía ONNX QAT y adaptación del entrenamiento para evitar olvido catastrófico y plateau, lo que abre un caso de uso de modelos ternarios especializados por dominio.
- Experimentación en investigación sobre ternarización de MoE: el repositorio incluye el port manual de la arquitectura y el patch BitLinear verificable, lo que lo convierte en material de partida para estudiar QAT ternario en modelos con enrutado congelado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, y tampoco se han encontrado en la búsqueda web. El único dato de verificación numérica declarado es que la predicción del siguiente token coincide con el modelo base en el 100 % de las posiciones y que las diferencias de logits están dentro del ruido bf16; con lambda = 0, la diferencia máxima de logits es 0,000000.

## Requisitos de hardware

Los tamaños de fichero y de RAM de la tabla siguiente son estimaciones publicadas por el autor a partir del recuento de parámetros (~180B almacenados); los ficheros reales pueden diferir. Las recomendaciones de GPU se derivan de esos tamaños y son estimaciones, no datos publicados.

- BF16: ~360 GB de fichero, 384 GB de RAM o más. Equivale al modelo base en precisión completa antes del QAT.
- Q8_0: ~190 GB de fichero, ~200-256 GB de RAM. Prácticamente sin pérdida.
- Q4_K_M: ~110 GB de fichero, ~128 GB de RAM. Balance recomendado por el autor.
- Q3_K_M: ~88 GB de fichero, ~96-128 GB de RAM. Buen compromiso calidad/tamaño.
- Q2_K: ~75 GB de fichero, ~96 GB de RAM. Máxima compresión sin QAT.
- TQ2_0 (tras QAT): ~65-95 GB de fichero, ~96-128 GB de RAM. Expertos y atención en ternario; no publicado.
- El propio proceso de QAT requiere una máquina con al menos 640 GB de RAM, según el autor.
- Consumer GPU: con estos tamaños, ningún formato cabe en una GPU de consumo de 24 GB (RTX 4090 y similares). Los formatos cuantizados más pequeños exigen agregar memoria o volcar a RAM/CPU. Conviene comprobar la disponibilidad real de cada fichero, ya que ninguna variante cuantizada está publicada todavía.
- Para BF16 harían falta varios aceleradores de 80 GB (por ejemplo A100 80 GB o H100 80 GB) en paralelo; para Q8_0 y Q4_K_M se reduce el número de GPU necesario, pero sigue siendo un despliegue multi-GPU o mixto CPU/GPU.
- Opciones de despliegue previstas: llama.cpp y Ollama (objetivo TQ2_0 en CPU), además de builds Docker, y el servidor Java ONNX JiRack como alternativa. Los builds de Ollama para 180B están planificados después del QAT y requieren una versión de llama.cpp que soporte la arquitectura `qwen4exp`.
- Latencia y throughput: no disponible. No se han publicado cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| JiRack DeltaNet 180B | 176.943.899.520 | ~6B por token | no disponible | sin benchmarks publicados; idéntico al base con lambda = 0 | qwen-community-1.0 | safetensors publicados; GGUF y cuantizaciones pendientes |
| Qwen/Qwen3.8-Flash-Next (modelo base) | no disponible en la información | no disponible en la información | no disponible | no disponible | qwen-community-1.0 | publicado (modelo de referencia) |
| CMSManhattan/JiRackDeltaNet_27b | no disponible en la información | no disponible en la información | no disponible | no disponible | no disponible | publicado; mencionado como referencia de builds con razonamiento desactivado |

No se dispone de datos suficientes en la información proporcionada para comparar con alternativas de la misma categoría (MoE de gran tamaño cuantizados a 2 bits o arquitecturas híbridas de atención lineal equivalentes). Cualquier comparación de rendimiento requeriría benchmarks que no están publicados.

## Limitaciones y advertencias

- Los pesos actualmente publicados son numéricamente idénticos al modelo base: el patch BitLinear está con lambda = 0, es decir, passthrough puro. Los beneficios ternarios (menor tamaño y menor coste de inferencia) no están activos hasta que se complete el QAT, que no se ha iniciado.
- El QAT requiere una máquina con al menos 640 GB de RAM, lo que limita quién puede completar el pipeline.
- No hay benchmarks publicados. Es imposible estimar la degradación de calidad esperable tras el QAT ni comparar con alternativas con datos objetivos.
- Licencia qwen-community-1.0, etiquetada como license: other y enlazada a la licencia del modelo base. Es imprescindible revisar los términos de la licencia de Qwen antes de cualquier uso comercial; la información disponible no detalla las restricciones concretas.
- El modelo es actualmente solo texto, aunque el modelo base entiende imágenes y vídeo. Las capacidades multimodales no están disponibles en este build.
- Riesgo de alucinación: no evaluado, no disponible. Al no haber benchmarks ni evaluaciones independientes, conviene tratarlo como un modelo no validado para producción.
- Sesgos conocidos: no disponible. No hay ninguna evaluación de sesgos en la información proporcionada.
- Idioma: se declaran 13 idiomas (incluido el español), pero el autor menciona foco en inglés y chino y no hay datos de calidad por idioma.
- Longitud de contexto: no disponible. Esto impide planificar casos de uso con contexto largo sin verificarlo previamente.
- El recuento de parámetros real (176,9B) no coincide de forma exacta con el nombre comercial (180B); conviene usar el dato de safetensors para planificar memoria.
- Algunas afirmaciones de la model card (partners NVIDIA y FISERV, pipeline de QAT, IDE propio) no vienen acompañadas de artefactos publicados verificables; trátalas como declaraciones del autor, no como hechos confirmados.
- Los tamaños de las variantes GGUF son estimaciones; los ficheros reales diferirán y ninguno está publicado todavía.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/CMSManhattan/JiRackDeltaNet_180b
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Tokenizer JiRack (Robotics, Routing & Tool calls): https://huggingface.co/CMSManhattan/JiRackDeltaNetTokenizer
- Modelo hermano JiRack DeltaNet 27B e IDE final: https://huggingface.co/CMSManhattan/JiRackDeltaNet_27b/resolve/main/jirack_ide_final.zip
- Sitio web del JiRack Coding Agent IDE: https://www.jirack.com
- Plugin de Eclipse del JiRack Coding Agent: https://marketplace.eclipse.org/content/jirack-coding-agent
- Publicaciones de Ollama del autor: https://ollama.com/cmsmanhattan
- Librería de tool calls en Java para empresa (Spring AI Alibaba): https://github.com/alibaba/spring-ai-alibaba
- Librería de tool calls en Python (Gorilla): https://github.com/ShishirPatil/gorilla
- ToolBench, para tool calls con etiquetas de tokenizer: https://github.com/OpenBMB/ToolBench
- Dataset de referencia para function calling (Glaive): https://huggingface.co/xalss/Qwen2-7B-Instruct-glaive-function-calling
- Dataset de referencia para function calling (Hermes): https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los únicos resultados obtenidos eran contenido no relacionado. Todos los enlaces anteriores proceden de la model card del propio autor.

# mradermacher/M.O.G.-SEC-27B-1M-CTX-BF16-GGUF

## Resumen

M.O.G.-SEC-27B-1M-CTX-BF16 es un modelo de lenguaje de 27 000 millones de parámetros desarrollado por Blackfrost Research, orientado a ciberseguridad ofensiva y defensiva. Se distribuye en formato GGUF gracias a la cuantización de mradermacher, lo que permite su ejecución en hardware de consumo con diferentes niveles de precisión. El modelo combina una arquitectura basada en Qwen3.8, una ventana de contexto de un millón de tokens mediante extensión YARN, capacidades multimodales (visión) y soporte para decodificación especulativa y predicción multi-token. Está publicado bajo licencia Apache-2.0 y etiquetado como «uncensored» y orientado a investigación, no apto para todos los públicos.

Esta ficha se centra en la versión GGUF cuantizada, que incluye 12 archivos de cuantización (desde Q2_K hasta Q8_0) más dos proyectores multimodales (mmproj). El modelo base original se encuentra en Blackfrost-Research/M.O.G.-SEC-27B-1M-CTX-BF16, y la cuantización de mradermacher añade compatibilidad con llama.cpp, Ollama y otros backends que soportan GGUF. Su relevancia actual radica en ofrecer capacidades de ciberseguridad con contexto extremadamente largo, algo inusual en modelos de este tamaño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5) con extensión de contexto YARN |
| Parámetros totales | 27 320 697 856 (modelo base) |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | 1 000 000 tokens |
| Tipos de cuantización | GGUF: Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; además mmproj-f16 y mmproj-Q8_0 |
| Idiomas soportados | Inglés y multilingüe (según tags) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (cuantización) y safetensors (modelo base) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 27B parámetros, desarrollado por Blackfrost Research. Según las etiquetas del repositorio, emplea la arquitectura de Qwen3.5, con atención escalada a 1M tokens mediante YARN (Yet Another RoPE extensión) y técnicas de Flash Attention (dflash2). Incorpora predicción multi-token (MTP) y soporte para decodificación especulativa, lo que mejora el rendimiento de inferencia en servidores como SGLang. Además, se indica que es multimodal, con un proyector de visión (mmproj) para procesar imágenes.

No se dispone de detalles sobre el conjunto de datos de entrenamiento, el número de tokens procesados ni el proceso de alineación (RLHF/DPO). El modelo se describe como «uncensored», lo que sugiere que no se aplicaron restricciones de contenido, y está etiquetado como «not-for-all-audiences» (no apto para todos los públicos). La cuantización GGUF de mradermacher se realizó sobre el modelo en BF16, y se ofrecen múltiples niveles de precisión para adaptarse a diferentes hardware.

## Capacidades

- Generación de texto y conversación en inglés y otros idiomas (multilingüe).
- Razonamiento complejo, análisis de código y tareas de ciberseguridad ofensiva y defensiva (pentesting, detección de vulnerabilidades, análisis de malware).
- Ventana de contexto de 1 millón de tokens, adecuada para procesar documentos largos, logs y código fuente completo.
- Capacidades multimodales: puede procesar imágenes a través de los proyectores mmproj, lo que permite análisis de capturas de pantalla, diagramas, etc.
- Soporte de decodificación especulativa y multi-token prediction para mejorar la velocidad de generación en entornos de servidor.
- No se menciona explícitamente soporte de tool calling ni function calling, aunque es probable por ser un modelo de Qwen3.5; no está confirmado.
- Etiquetado como «uncensored», lo que implica que no tiene restricciones de contenido en las respuestas.

## Casos de uso

- Análisis de seguridad en código: el modelo puede revisar código fuente para detectar vulnerabilidades comunes (inyección SQL, desbordamiento de buffer, etc.) gracias a su entrenamiento en ciberseguridad y su ventana de 1M tokens para procesar repositorios completos.
- Respuesta a incidentes: con su contexto largo, puede analizar logs de sistemas, correlacionar eventos y sugerir pasos de contención en tiempo real, ayudando a equipos de SOC.
- Generación de exploits en entornos controlados: el modelo puede generar payloads de prueba o scripts de explotación para pruebas de penetración autorizadas, gracias a su naturaleza «uncensored».
- Formación en ciberseguridad: se puede usar como tutor interactivo para explicar técnicas de ataque y defensa, con capacidad de mantener conversaciones largas y detalladas.
- Análisis de documentos técnicos: gracias a su contexto de 1M tokens, puede resumir y extraer información de manuales de seguridad, normativas y documentación extensa.
- Análisis multimodal de capturas de pantalla: mediante el proyector de visión, puede examinar imágenes de paneles de administración, diagramas de red o mensajes de error para asistir en diagnóstico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de mradermacher no incluye métricas de rendimiento (MMLU, HumanEval, GSM8K, etc.). No se puede comparar cuantitativamente con otros modelos sin datos verificados.

## Requisitos de hardware

- Para cuantización Q4_K_M (16,9 GB) se recomienda una GPU con al menos 24 GB de VRAM (p.ej., RTX 4090, A100 40GB) para una ejecución cómoda con contexto moderado.
- La cuantización IQ4_XS (15,5 GB) puede caber en una GPU de 16 GB (RTX 4080, RTX 4070 Ti), pero con limitaciones de contexto.
- La cuantización Q2_K (11 GB) es la más ligera, pero degrada notablemente la calidad.
- Para la ventana completa de 1M tokens, el uso de memoria KV cache será enorme; se recomienda usar el modelo en servidores con múltiples GPUs o con técnicas de optimización de contexto (p.ej., chunking, streaming).
- Backends compatibles: llama.cpp, Ollama, SGLang, vLLM (para GGUF), y el formato safetensors para Hugging Face Transformers.
- La latencia no está especificada; depende de la cuantización, el hardware y el backend. En general, con Q4_K_M en una GPU moderna se pueden esperar decenas de tokens por segundo, pero el contexto largo reduce el throughput.

## Comparativa con modelos similares

No se dispone de información contrastada sobre modelos directamente comparables en el mismo nicho (ciberseguridad con 27B y 1M contexto). Los resultados de búsqueda mencionan Qwen3.6-27B y Qwen3.8-27B, pero no se tienen sus especificaciones ni benchmarks para una comparación rigurosa. Se recomienda evaluar el modelo frente a otras alternativas de seguridad como Zephyr-27B (si existe) o modelos generales de 27B como Llama-3-27B, pero sin datos objetivos no se puede establecer una comparativa fiable.

## Limitaciones y advertencias

- El modelo está etiquetado como «uncensored», lo que significa que puede generar contenido ofensivo, peligroso o ilegal si se usa maliciosamente. Su uso debe limitarse a entornos de investigación y con fines legítimos.
- No se proporcionan detalles sobre sesgos o alucinaciones; como cualquier modelo generativo, puede producir respuestas incorrectas o inventadas, especialmente en temas especializados.
- La ventana de 1M tokens es enorme, pero el coste computacional de la atención es cuadrático; en la práctica, se recomienda usar solo el contexto necesario.
- La licencia Apache-2.0 permite uso comercial, pero el modelo está dirigido a investigación y puede no ser adecuado para entornos de producción sin un análisis exhaustivo.
- La cuantización degrada la calidad; los quants más bajos (Q2_K, Q3_*) pueden tener errores notables en tareas de razonamiento.
- El soporte multimodal (mmproj) está disponible, pero no se garantiza una integración completa con todos los backends GGUF; es necesario verificar la compatibilidad.

## Enlaces

- Repositorio GGUF en Hugging Face: [mradermacher/M.O.G.-SEC-27B-1M-CTX-BF16-GGUF](https://huggingface.co/mradermacher/M.O.G.-SEC-27B-1M-CTX-BF16-GGUF)
- Modelo base (safetensors): [Blackfrost-Research/M.O.G.-SEC-27B-1M-CTX-BF16](https://huggingface.co/Blackfrost-Research/M.O.G.-SEC-27B-1M-CTX-BF16)
- Cuantizaciones con imatrix (alternativa): [M.O.G.-SEC-27B-1M-CTX-BF16-i1-GGUF](https://huggingface.co/mradermacher/M.O.G.-SEC-27B-1M-CTX-BF16-i1-GGUF)
- Guía de uso de GGUF (referencia de TheBloke): [https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF](https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF)
- Página de solicitudes de cuantización de mradermacher: [https://huggingface.co/mradermacher/model_requests](https://huggingface.co/mradermacher/model_requests)
- Página de mradermacher en HuggingFace: [https://huggingface.co/mradermacher](https://huggingface.co/mradermacher)

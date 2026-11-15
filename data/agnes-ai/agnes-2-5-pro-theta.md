# Agnes-AI/Agnes-2.5-Pro-Theta

## Resumen

Agnes 2.5 Pro Theta es un modelo multimodal de tipo mixture-of-experts (MoE) desarrollado por Agnes AI y publicado en Hugging Face bajo licencia Apache 2.0. El checkpoint, de aproximadamente 187.800 millones de parámetros totales en BF16, acepta texto, imágenes y fotogramas de vídeo como entrada y genera texto, con una ventana de contexto configurada de 262.144 tokens. Su arquitectura registra 52 capas de decodificador de texto y bloques MoE con 512 expertos enrutados, enrutamiento top-10 y una rama de experto compartido.

El modelo se posiciona para razonamiento conversacional, resolución de problemas científicos, generación de código y comprensión visual. La model card reporta resultados destacados en GPQA Diamond (92,9), LiveCodeBench v6 (90,5), AA-LCR (84,7), SWE-bench Pro (64,1) e IFBench (82,6), comparándose con alternativas como Nemotron 3.5 Super VL 120B, Qwen3.8-27B, GLM-5.3-Flash y DeepSeek-V4.1-Flash-1017.

Su relevancia actual radica en combinar contexto largo, multimodalidad y un MoE de gran escala en un paquete con pesos abiertos y licencia permisiva. No obstante, el tamaño del payload de pesos (unos 349,7 GiB) exige infraestructura de varios aceleradores de gama alta, lo que lo aleja del uso en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mixture-of-experts (MoE); 52 capas de decodificador de texto; 512 expertos enrutados por bloque, top-10 routing y experto compartido |
| Parametros totales | 187.763.545.703 (~187,8B) |
| Parametros activos | no disponible (la model card no especifica el número de parámetros activos por token) |
| Longitud de contexto | 262.144 tokens (límite de configuración) |
| Tipos de cuantizacion | no disponible (la release oficial distribuye pesos en BF16; no se documentan variantes cuantizadas) |
| Idiomas soportados | Inglés y chino (destacados en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (105 shards con índice), BF16; requiere `trust_remote_code=True` por código custom de Transformers |

## Arquitectura y entrenamiento

Agnes 2.5 Pro Theta es un transformer multimodal con bloques de mezcla de expertos. La model card especifica 52 capas de decodificador de texto, 512 expertos enrutados por bloque MoE, enrutamiento top-10 y una rama de experto compartido. El modelo integra rutas de entrada para texto, imágenes y fotogramas de vídeo mediante procesadores propios (image processor y video processor), y produce únicamente texto como salida. La implementación es código custom de Transformers, lo que obliga a usar `trust_remote_code=True` y a revisar los ficheros Python del repositorio antes de ejecutarlo.

El paquete se distribuye en BF16 con 105 shards de Safetensors y un índice, con un payload de pesos de 375,5 GB (~349,7 GiB) excluyendo cabeceras. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF, DPO u otras técnicas de alineamiento. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal. El entorno de referencia validado por el autor incluye PyTorch 2.14.1+cu130, Transformers 5.19.0, Accelerate 1.15.0 y Safetensors 0.8.0, aunque esas comprobaciones cubren la construcción del modelo y la preparación de entradas, no una cualificación completa de generación extremo a extremo.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 262.144 tokens.
- Razonamiento avanzado y resolución de problemas científicos (resultados reportados en GPQA Diamond y HLE-Diamond).
- Generación y razonamiento sobre código, incluidas tareas de ingeniería de software (LiveCodeBench v6, SWE-bench Pro, SciCode).
- Comprensión visual: procesamiento de imágenes y fotogramas de vídeo como entrada, con salida de texto.
- Seguimiento de instrucciones complejas (IFBench).
- Razonamiento sobre documentos largos y contexto extenso (AA-LCR, GDP.pdf).
- Capacidades multilingües limitadas a inglés y chino según la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes y multi-step reasoning: no disponible como característica documentada, aunque los benchmarks de SWE-bench Pro y AA-LCR sugieren desempeño en tareas multi-paso.
- Modo thinking, audio u otras modalidades especiales: no disponible.

## Casos de uso

- Asistencia en investigación científica: el modelo puede analizar problemas de física, química o biología a nivel de posgrado, apoyándose en su resultado de 92,9 en GPQA Diamond y su ventana de 262.144 tokens para incorporar material de referencia extenso en el prompt.
- Revisión y generación de código en producción: con 90,5 en LiveCodeBench v6 y 64,1 en SWE-bench Pro, es adecuado para tareas de reparación de bugs, generación de parches y razonamiento sobre repositorios, integrándose en pipelines de CI/CD mediante llamadas a la API de Transformers.
- Análisis de documentación técnica larga: su contexto de 262.144 tokens y su rendimiento en AA-LCR (84,7) permiten resumir, extraer y razonar sobre manuales, contratos o informes de cientos de páginas en una sola pasada.
- Comprensión de documentos con imágenes: al aceptar imágenes y fotogramas de vídeo, puede procesar capturas de pantalla, diagramas técnicos, gráficos o páginas escaneadas y devolver descripciones o respuestas textuales.
- Asistencia conversacional especializada en inglés y chino: atención al cliente o soporte técnico bilingüe con conversaciones multi-turno que requieren mantener contexto prolongado.
- Evaluación y verificación de soluciones matemáticas y científicas: útil en entornos educativos o de investigación para comprobar razonamientos paso a paso en problemas de nivel avanzado, dado su rendimiento en SciCode y GPQA.
- Prototipado de agentes de ingeniería de software: combinado con herramientas externas, puede emplearse para explorar repositorios, proponer cambios y validar parches, aunque la model card no documenta soporte nativo de tool calling.

## Benchmarks y rendimiento

Los datos provienen de la model card del autor. Las puntuaciones son porcentajes; el guion indica que el valor no se reportó en la figura suministrada.

| Benchmark | Agnes 2.5 Pro Theta | Nemotron 3.5 Super VL 120B | Qwen3.8-27B | GLM-5.3-Flash | DeepSeek-V4.1-Flash-1017 |
|:--|--:|--:|--:|--:|--:|
| IFBench | 82,6 | 70,9 | 80,1 | 64,4 | 76,3 |
| AA-LCR | 84,7 | 68,6 | 72,6 | 76,7 | 80,4 |
| GPQA Diamond | 92,9 | 89,5 | 88,9 | 92,2 | 92,8 |
| SciCode | 56,0 | 47,1 | 47,9 | 53,4 | 57,6 |
| LiveCodeBench v6 | 90,5 | 88,2 | 90,3 | 80,6 | 89,7 |
| SWE-bench Pro | 64,1 | 51,8 | 61,7 | 59,7 | — |
| HLE-Diamond | 16,8 | 8,8 | 15,3 | 18,2 | 25,3 |
| GDP.pdf | 16,2 | 8,0 | 16,4 | 15,4 | 17,2 |

Notas de la model card: el resultado de AA-LCR corresponde a la versión v1.1; el de SciCode a la versión v1.0.1 con puntuación a nivel de subproblema; SWE-bench Pro no fue reportado para DeepSeek-V4.1-Flash-1017.

## Requisitos de hardware

- VRAM estimada: el payload de pesos en BF16 ocupa aproximadamente 349,7 GiB, por lo que la inferencia completamente residente requiere memoria agregada superior a esa cifra más el overhead de activaciones, cachés y entradas visuales.
- GPU recomendadas: la model card indica que un sistema con 4 × H200-class es un punto de partida práctico de capacidad, no una garantía de throughput ni de contexto máximo.
- GPU de consumo: no cabe en GPUs de consumo (RTX 4090, 3090, etc.) sin cuantización, y la release oficial no distribuye variantes cuantizadas.
- Almacenamiento: al menos 400 GB para una copia local única; la descarga, caché o reempaquetado pueden requerir espacio adicional.
- Memoria de host: se recomienda RAM abundante para la carga; la implementación incluye una tabla de búsqueda léxica grande que puede añadir overhead de memoria e I/O al cargar o descargar.
- Opciones de despliegue: Transformers con `trust_remote_code=True`, Accelerate y Safetensors; la model card no documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Puntos fuertes reportados |
|:--|:--|:--|:--|:--|
| Agnes 2.5 Pro Theta | ~187,8B (MoE, 512 expertos, top-10) | 262.144 tokens | Apache 2.0 | IFBench 82,6; AA-LCR 84,7; GPQA 92,9; LiveCodeBench 90,5; SWE-bench Pro 64,1 |
| Nemotron 3.5 Super VL 120B | 120B | no disponible | no disponible | GPQA 89,5; LiveCodeBench 88,2; SWE-bench Pro 51,8 |
| Qwen3.8-27B | 27B | no disponible | no disponible | IFBench 80,1; LiveCodeBench 90,3; SWE-bench Pro 61,7 |
| GLM-5.3-Flash | no disponible | no disponible | no disponible | GPQA 92,2; HLE-Diamond 18,2 |
| DeepSeek-V4.1-Flash-1017 | no disponible | no disponible | no disponible | HLE-Diamond 25,3; SciCode 57,6; GDP.pdf 17,2 |

Agnes 2.5 Pro Theta lidera en IFBench, AA-LCR, GPQA Diamond, LiveCodeBench v6 y SWE-bench Pro dentro de esta comparativa, mientras que DeepSeek-V4.1-Flash-1017 obtiene mejores resultados en HLE-Diamond, SciCode y GDP.pdf. Los datos de contexto y licencia de los modelos comparados no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al entrenarse principalmente en inglés y chino, puede presentar sesgos culturales y lingüísticos derivados de esa distribución.
- Riesgo de alucinación: presente como en cualquier modelo generativo; los resultados de HLE-Diamond (16,8) y GDP.pdf (16,2) indican margen de mejora en tareas de razonamiento de alta dificultad y comprensión de documentos.
- Contexto e idioma: la ventana de 262.144 tokens es un límite de configuración, no una garantía de rendimiento a longitudes máximas; el autor advierte que la longitud efectiva depende de la memoria en tiempo de ejecución. Los idiomas destacados son solo inglés y chino.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo requiere `trust_remote_code=True`, lo que implica ejecutar código Python del repositorio; conviene auditarlo antes de desplegarlo.
- Producción: el tamaño del payload (349,7 GiB) y la ausencia de variantes cuantizadas oficiales limitan el despliegue a infraestructuras multi-GPU de gama alta; no hay mediciones publicadas de latencia ni throughput.
- Entorno: las versiones de PyTorch, Transformers, Accelerate y Safetensors validadas por el autor son específicas (2.14.1+cu130, 5.19.0, 1.15.0, 0.8.0) y las comprobaciones no cubren una generación completa extremo a extremo.
- Soporte de tool calling y agentes: no documentado, lo que puede limitar su uso en pipelines agénticos sin capas adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Agnes-AI/Agnes-2.5-Pro-Theta
- README en chino: https://huggingface.co/Agnes-AI/Agnes-2.5-Pro-Theta/blob/main/README_zh.md
- Sitio de Agnes AI: https://www.agnes-ai.com/
- Aplicación de Agnes AI: https://app.agnes-ai.com/

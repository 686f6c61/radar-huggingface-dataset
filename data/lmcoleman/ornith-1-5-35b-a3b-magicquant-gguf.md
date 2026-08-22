# lmcoleman/Ornith-1.5-35B-A3B-MagicQuant-GGUF

## Resumen

Ornith-1.5-35B-A3B-MagicQuant-GGUF es una colección de archivos GGUF del modelo multimodal Ornith-1.5-35B-A3B, desarrollado por ornith-ai y cuantizado por lmcoleman mediante la técnica MagicQuant de cuantización híbrida por grupos. El modelo base presenta una arquitectura `qwen3_5_moe` con aproximadamente 35 500 millones de parámetros totales y 3 000 millones activos por token (A3B), lo que lo sitúa en la categoría de MoE eficientes para inferencia local. Incluye capacidades de visión (image-text-to-text) y una ventana de contexto de 262 000 tokens, según BenchLM.

La relevancia de esta versión cuantizada radica en que permite ejecutar un modelo de 35B con calidad cercana a BF16 en hardware de consumo, gracias a una búsqueda evolutiva que mide la perplejidad real de cada combinación de esquemas de cuantización por tensor. El autor publica tres tamaños (Q4, Q5 y Q6) junto con el proyector de visión, y recomienda explícitamente el nivel Q4_K_M por su relación calidad-tamaño, ya que las mediciones no distinguen diferencias significativas entre los tres niveles con el instrumento utilizado.

La licencia MIT facilita su uso comercial sin restricciones, y los archivos están preparados para cargarse en builds recientes de llama.cpp (mediados de 2026 o posteriores) gracias a la corrección de metadatos de vocabulario.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (MoE con shared-expert split) |
| Parametros totales | 35 505 251 456 |
| Parametros activos | ~3 000 millones (A3B) |
| Longitud de contexto | 262 000 tokens |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K (híbridos por grupo MagicQuant) + mmproj f16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B emplea una arquitectura de mezcla de expertos (MoE) con división de experto compartido, siguiendo el diseño `qwen3_5_moe`. Con 35 500 millones de parámetros totales y solo 3 000 millones activos por token, logra un equilibrio entre capacidad y eficiencia computacional. Es multimodal: acepta entradas de imagen y texto, y genera texto. No se han publicado detalles sobre el proceso de entrenamiento (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) en la información disponible.

La cuantización MagicQuant aplicada en esta versión GGUF es una innovación técnica destacable: los tensores se agrupan por rol funcional y se asignan esquemas de cuantización por grupo mediante búsqueda evolutiva. Cada candidato se renderiza y se mide su perplejidad real (no se predice), con calibración imatrix sobre 510 tensores y mezcla KL con peso 0,1. Se evaluaron 15 candidatos en 3 rondas. Los archivos resultantes no aplican un tipo de cuantización uniforme, sino una combinación por grupos que optimiza la calidad para cada tamaño.

## Capacidades

- Generación de texto multimodal: procesa imágenes y texto para producir respuestas en lenguaje natural.
- Razonamiento y comprensión de contexto largo: ventana de 262 000 tokens, adecuada para documentos extensos o conversaciones multi-turno.
- Soporte de visión: requiere el archivo `mmproj-Ornith-1.5-35B-A3B-f16.gguf` junto al modelo para habilitar la entrada de imágenes.
- Arquitectura MoE eficiente: solo 3 000 millones de parámetros activos por token, lo que reduce la carga computacional frente a un denso de 35B.
- Compatibilidad con llama.cpp y ecosistema GGUF: puede ejecutarse con herramientas como llama.cpp, Ollama o LM Studio (siempre que soporten `qwen3_5_moe`).
- No se confirma soporte explícito de tool calling o function calling en la información disponible.

## Casos de uso

- Asistente local de documentación técnica: con 262 000 tokens de contexto, puede analizar manuales extensos, especificaciones o repositorios de código y responder preguntas precisas sin perder el hilo.
- Análisis de imágenes y capturas en entornos sin conexión: gracias al proyector de visión, puede describir diagramas, gráficos o capturas de pantalla en un flujo de trabajo local.
- Chatbot de atención al cliente con historial largo: la ventana de contexto permite mantener conversaciones multi-turno con todo el historial cargado, mejorando la coherencia en interacciones prolongadas.
- Generación de código asistida en entornos de desarrollo locales: con su capacidad de razonamiento y el tamaño de contexto, puede ayudar a revisar y completar fragmentos de código en proyectos medianos.
- Extracción de información de documentos mixtos (texto e imágenes): útil para procesar PDFs escaneados o informes con figuras, combinando visión y comprensión textual.
- Prototipado de agentes conversacionales con memoria amplia: la ventana de 262K permite experimentar con agentes que retienen el contexto de sesiones largas sin recurrir a sistemas externos de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible para esta versión cuantizada. El autor proporciona mediciones de perplejidad sobre wikitext-2 (100 chunks, contexto 512) comparadas con el baseline BF16 (PPL 7.9691):

| Archivo | Tamaño | Ratio vs BF16 | Perplejidad | Diferencia vs baseline |
|---|---|---|---|---|
| Q4_K_M | 19,58 GiB | 0,30× | 7.9530 | −0,20% |
| Q5_K_M | 22,88 GiB | 0,35× | 7.9951 | +0,33% |
| Q6_K | 28,84 GiB | 0,44× | 7.9792 | +0,13% |

El propio autor advierte que la diferencia entre estos tres niveles está dentro del ruido del instrumento (±0,3%) y que las tres son indistinguibles de BF16 a esta resolución. Los niveles inferiores no renderizados (Q3 y Q2) muestran degradaciones significativas (+2,96% y +30,2% respectivamente), lo que indica un límite de calidad claro por debajo de Q4.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa 19,58 GiB, por lo que se recomienda al menos 24 GiB de VRAM para cargarlo completo en GPU; el Q5 (22,88 GiB) y Q6 (28,84 GiB) requieren 32 GiB o más. El proyector de visión añade 0,86 GiB adicionales.
- GPU recomendadas: RTX 3090/4090 (24 GB) para Q4; RTX A6000, A100 40GB o H100 para Q5/Q6. También puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- En consumer GPU: el nivel Q4 cabe en una RTX 4090 (24 GB) si se usa cuantización adicional de caché KV o se reduce el contexto. No cabe en GPUs de 16 GB sin offloading parcial.
- Opciones de despliegue: llama.cpp (builds de mediados de 2026 o posteriores), Ollama, LM Studio, y cualquier runtime compatible con GGUF y arquitectura `qwen3_5_moe`.
- Latencia y throughput: no disponibles en la información proporcionada. El autor construyó y midió en un AMD Strix Halo (Ryzen AI MAX+ 395, gfx1151), pero no publicó cifras de velocidad.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con modelos de la misma categoría (MoE multimodal de ~35B con contexto largo) en la información disponible. El modelo base ocupa el puesto #137 de 224 en el leaderboard público de BenchLM con una puntuación de 49,22/100, pero no hay datos de comparación directa con alternativas como Qwen3-30B-A3B u otros MoE similares.

## Limitaciones y advertencias

- La cuantización Q4_K_M, aunque indistinguible de BF16 en las mediciones del autor, puede mostrar diferencias en tareas más sensibles a la precisión numérica; el propio autor recomienda no interpretar la perplejidad ligeramente inferior como una mejora real.
- No se han publicado resultados de benchmarks estándar para esta versión, por lo que su rendimiento en tareas específicas (matemáticas, código, razonamiento) no está verificado.
- Los niveles Q3 y Q2 no se incluyen en los archivos publicados; si se necesitan tamaños menores, habría que generarlos manualmente con riesgo de degradación severa (Q2 muestra +30% de perplejidad).
- La ventana de contexto de 262K es teórica; en la práctica, el uso completo requerirá una gestión cuidadosa de la memoria caché KV, especialmente en GPUs de consumo.
- No se especifican los idiomas soportados; se asume que sigue las capacidades del modelo base, pero no hay confirmación oficial.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo base puede tener dependencias de datos de entrenamiento cuyos términos no se detallan en esta ficha.
- Para producción, se recomienda validar el comportamiento en el dominio específico antes de desplegar, dado que no hay datos de robustez o sesgos publicados.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/lmcoleman/Ornith-1.5-35B-A3B-MagicQuant-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- GGUF oficial del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-GGUF
- Benchmarks y contexto en BenchLM: https://benchlm.ai/models/ornith-1-5-35b-a3b
- Review para agentes de codificación locales (wavespeed.ai): https://wavespeed.ai/blog/ai-models/ornith-1-5-35b-a3b-review/

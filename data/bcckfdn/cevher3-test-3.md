# bcckfdn/cevher3-test-3

## Resumen

cevher3 es un modelo de lenguaje causal de 1.256.312.832 parámetros (aproximadamente 1,26 B) desarrollado por el usuario bcckfdn y publicado en Hugging Face bajo licencia Apache 2.0. Está construido sobre la arquitectura Gemma3-SWA (atención de ventana deslizante), una variante de la familia Gemma 3 orientada a modelos compactos, y está entrenado principalmente para generación de texto conversacional en turco e inglés.

El modelo se presenta como un experimento de entrenamiento propio: la model card indica 34 capas, dimensión oculta de 1792, 28 cabezas de atención para consultas frente a 4 para claves y valores, vocabulario de 65.536 tokens y una ventana de contexto de 8192 tokens. Se entrenó sobre 3.975 B tokens y alcanzó una pérdida de validación de 2,8152. El repositorio ocupa 2,5 GB en formato safetensors.

Su relevancia actual es limitada pero ilustrativa: se trata de un modelo pequeño, con contexto moderado y licencia permisiva, útil como banco de pruebas para experimentos de ajuste fino y despliegue local en hardware de consumo. No hay evidencia de publicación de benchmarks ni de adopción por parte de la comunidad (0 descargas y 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atención de ventana deslizante (Gemma3-SWA), 34 capas |
| Parametros totales | 1.256.312.832 (aproximadamente 1,26 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible en la model card; existe un repositorio GGUF asociado (cevher-test-3-GGUF) que sugiere cuantizaciones para llama.cpp |
| Idiomas soportados | turco (tr) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo principal); GGUF en repositorio separado |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only con 34 capas, dimensión oculta de 1792 y un esquema de atención con 28 cabezas de consulta y 4 cabezas de clave/valor, lo que reduce el coste de memoria de la caché KV. La denominación Gemma3-SWA hace referencia a la atención de ventana deslizante (sliding window attention), que limita el alcance de la atención a una ventana local en lugar de cubrir toda la secuencia, abaratando el coste computacional en secuencias largas. El vocabulario es de 65.536 tokens.

El entrenamiento se realizó sobre 3.975 B tokens, con una pérdida de validación final de 2,8152. La model card no detalla la composición del dataset, si hubo fases de RLHF o DPO, ni innovaciones adicionales como decodificación especulativa o atención lineal. No se dispone de información sobre la mezcla de datos turco/inglés ni sobre el pipeline de preentrenamiento.

## Capacidades

- Generación de texto causal en turco e inglés, orientada a uso conversacional.
- Razonamiento básico y respuesta a instrucciones, condicionado por el tamaño reducido del modelo.
- Soporte de contexto de hasta 8192 tokens, adecuado para conversaciones multi-turno moderadas.
- Compatibilidad con la librería transformers y con text-generation-inference (según los tags del repositorio).
- Compatibilidad declarada con endpoints (tag endpoints_compatible).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de visión o audio: no disponibles (el tag gemma3_text indica únicamente componente de texto).
- Modo de razonamiento explícito (thinking mode): no disponible.

## Casos de uso

- Prototipado de asistentes conversacionales en turco: el modelo puede gestionar diálogos multi-turno dentro de su ventana de 8192 tokens, suficiente para sesiones de chat de extensión moderada en aplicaciones de demostración.
- Experimentación académica con arquitecturas de ventana deslizante: sirve como base para estudiar el comportamiento de Gemma3-SWA a escala pequeña, comparando calidad y coste frente a atención completa.
- Ajuste fino supervisado (SFT) sobre dominios verticales: al tener 1,26 B parámetros y licencia Apache 2.0, es viable reentrenarlo o ajustarlo en un único nodo con GPU de 24-48 GB para tareas especializadas en turco.
- Despliegue local en hardware de consumo: con cuantización GGUF puede ejecutarse en GPUs de 8-16 GB mediante llama.cpp u Ollama, útil para pruebas offline y entornos sin conectividad.
- Generación de texto y completado en pipelines de contenido: puede emplearse para borradores, resúmenes o paráfrasis en inglés y turco, siempre con revisión humana dada la ausencia de benchmarks publicados.
- Evaluación comparativa de técnicas de cuantización: al existir un repositorio GGUF asociado, es un candidato para medir degradación de calidad entre cuantizaciones en un modelo pequeño.
- Base para investigación en eficiencia de inferencia: su relación entre cabezas de consulta y clave/valor (28/4) permite estudiar el ahorro de memoria de la caché KV en despliegues con vLLM o TGI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la pérdida de validación (2,8152) tras 3.975 B tokens de entrenamiento, sin métricas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (FP32): aproximadamente 5 GB solo para pesos, más caché KV y activaciones.
- VRAM estimada en BF16/FP16: aproximadamente 2,5 GB para pesos; en la práctica 4-6 GB con contexto largo.
- VRAM estimada en cuantización de 4 bits (GGUF Q4): aproximadamente 0,7-1 GB para pesos, permitiendo ejecución en GPUs de 6-8 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090 para inferencia local; A100 o H100 no son necesarias por el tamaño del modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 6-8 GB de VRAM usando cuantización; en BF16 requiere 8-12 GB.
- Opciones de despliegue: transformers, text-generation-inference (TGI), llama.cpp y Ollama mediante el repositorio GGUF asociado; vLLM es plausible pero no está confirmado en la documentación.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| cevher3 (bcckfdn) | 1,26 B | 8192 | Apache 2.0 | Hugging Face, 0 descargas |
| Gemma 3 1B (Google) | aproximadamente 1 B | 32k (según familia Gemma 3) | Gemma Terms of Use | Amplia adopción comunitaria |
| Qwen2.5-1.5B (Alibaba) | 1,5 B | 32k | Apache 2.0 | Muy extendida, benchmarks publicados |
| SmolLM2-1.7B (Hugging Face) | 1,7 B | 8k | Apache 2.0 | Amplia, benchmarks publicados |

La comparación con Gemma 3 1B es la más directa por herencia arquitectónica, aunque cevher3 reduce el contexto a 8192 tokens y no publica métricas. Frente a Qwen2.5-1.5B y SmolLM2-1.7B, cevher3 carece de benchmarks públicos y de adopción, por lo que la comparación de rendimiento no está disponible.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible verificar la calidad del modelo frente a alternativas de tamaño similar.
- Modelo de autor individual, sin proceso de revisión ni validación por parte de la comunidad (0 descargas, 0 likes).
- Riesgo elevado de alucinación y de baja coherencia en razonamiento complejo por el tamaño reducido (1,26 B) y la pérdida de validación de 2,8152, que no es indicativa de calidad conversacional.
- Cobertura lingüística limitada a turco e inglés; el rendimiento en castellano no está documentado y probablemente será deficiente.
- Contexto efectivo limitado por la atención de ventana deslizante: la ventana nominal de 8192 tokens no garantiza acceso completo a información lejana en la secuencia.
- Sin información sobre sesgos del dataset de entrenamiento ni sobre filtrado de datos.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de documentación sobre procedencia de los datos de entrenamiento impide verificar el cumplimiento de derechos de autor de terceros.
- No se documenta soporte de tool calling ni de agentes, por lo que no es recomendable para pipelines de automatización que dependan de estas capacidades.
- El repositorio GGUF asociado (cevher-test-3-GGUF) parece corresponder a una variante de nombre ligeramente distinto (cevher-test-3 frente a cevher3-test-3); conviene verificar la correspondencia exacta antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bcckfdn/cevher3-test-3
- Repositorio GGUF asociado: https://huggingface.co/bcckfdn/cevher-test-3-GGUF
- Árbol de archivos del repositorio GGUF: https://huggingface.co/bcckfdn/cevher-test-3-GGUF/tree/main

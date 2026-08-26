# fromziro/Negative-v1.0

## Resumen

Negative-v1.0 es un modelo de lenguaje pequeño (SLM) de 67.736 parámetros desarrollado por el usuario fromziro (FromZero), una iniciativa que parte desde cero, inspirada en la serie Re:Zero. Se trata de un experimento de arquitectura personalizada, no un modelo de propósito general, que busca demostrar que es posible entrenar un modelo funcional con recursos mínimos: se entrenó íntegramente en CPU sobre 600 millones de tokens. Su diseño está inspirado en la arquitectura Needle2 e incorpora mecanismos poco convencionales como memoria Engram, FFN de Hadamard con intervalos SwiGLU y una topología de 8 flujos basada en mHC.

El modelo utiliza un tokenizador a nivel de byte con un vocabulario de solo 260 tokens (incluyendo 4 especiales), lo que lo hace extremadamente compacto. Su longitud de contexto máxima es de 96 posiciones, muy limitada incluso para estándares de SLM. A pesar de su tamaño, el autor reporta resultados de benchmarks en tareas de razonamiento y conocimiento que considera competitivos dentro de su clase de parámetros. La licencia es Apache 2.0, lo que permite uso comercial y modificación sin restricciones significativas.

La relevancia de Negative-v1.0 reside en su carácter experimental: sirve como banco de pruebas para arquitecturas alternativas a los transformers convencionales y para validar metodologías de entrenamiento de bajo coste. No está pensado para producción, sino para investigación y aprendizaje sobre diseño de modelos desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Personalizada inspirada en Needle2: memoria Engram, FFN de Hadamard con SwiGLU, topología de 8 flujos mHC |
| Parametros totales | 67.736 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 96 tokens |
| Tipos de cuantizacion | no disponible (solo safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Negative-v1.0 emplea una arquitectura compacta y de bajo coste computacional. Según la model card, incorpora memoria Engram (con 196 entradas y órdenes (4, 8)), capas FFN de Hadamard con intervalos SwiGLU (7 capas Hadamard y 2 capas SwiGLU de un total de 9), y una topología de 8 flujos gestionada por mHC. El modelo tiene un tamaño oculto de 32, un tamaño intermedio de 64, 4 cabezas de atención y 2 cabezas KV, con 8 dimensiones por cabeza. No utiliza gating por cabeza ni XSA. El tokenizador es byte-level con un vocabulario de 260 tokens.

El entrenamiento se realizó sobre 600 millones de tokens, con una mezcla de datos que incluye texto web general, contenido educativo, datos sintéticos, código normalizado y matemáticas. Las proporciones exactas son: FineWeb-Edu (36,0%), DCLM Baseline 1.0 (22,9%), FinePhrase (13,4%), MGA FineWeb-Edu (10,3%), Tiny Strange Textbooks (8,2%), OpenMathInstruct-2 (7,6%) y NPset-2 Python-Edu (1,6%). No se menciona el uso de técnicas de alineación como RLHF o DPO; el entrenamiento parece ser únicamente de modelado de lenguaje.

## Capacidades

- Generación de texto básica: puede producir texto corto en inglés, aunque con una ventana de contexto de solo 96 tokens, la coherencia se limita a fragmentos muy breves.
- Razonamiento simple: los benchmarks reportados (ARC, HellaSwag, PIQA) sugieren cierta capacidad para tareas de opción múltiple y sentido común, aunque con puntuaciones bajas en términos absolutos.
- Matemáticas elementales: el benchmark ArithMark-3.0 muestra un 31,5% de precisión, lo que indica una capacidad limitada para operaciones aritméticas sencillas.
- No soporta tool calling, function calling, agentes, visión, audio ni modos de pensamiento extendido.
- Multilingüismo: solo inglés, sin soporte para otros idiomas.

## Casos de uso

- Investigación académica sobre arquitecturas alternativas: Negative-v1.0 sirve como objeto de estudio para analizar el comportamiento de mecanismos como la memoria Engram o las FFN de Hadamard en modelos extremadamente pequeños. Los investigadores pueden comparar su rendimiento con transformers de tamaño similar.
- Educación en aprendizaje automático: es un ejemplo práctico de cómo entrenar un modelo desde cero con recursos mínimos (CPU, 600M tokens). Puede utilizarse en cursos para ilustrar el pipeline completo de entrenamiento, tokenización y evaluación.
- Pruebas de concepto de tokenizadores byte-level: su vocabulario de 260 tokens permite experimentar con representaciones a nivel de byte y su impacto en la eficiencia y el rendimiento.
- Generación de texto muy corto en entornos con restricciones extremas de memoria: por ejemplo, en microcontroladores o sistemas embebidos donde un modelo de 67K parámetros cabe en menos de 1 MB. Podría generar etiquetas, respuestas predefinidas o completar plantillas simples.
- Benchmarking de métricas de evaluación: al ser un modelo diminuto, puede usarse para validar la sensibilidad de métricas como acc_norm en tareas como ARC o HellaSwag, o para calibrar pipelines de evaluación.
- Experimentación con mezclas de datos: el conjunto de entrenamiento está documentado con proporciones exactas, lo que permite reproducir y variar la composición para estudiar su efecto en el rendimiento final.

## Benchmarks y rendimiento

El autor reporta resultados en cinco tareas, medidos con la métrica `acc_norm`:

| Tarea | Metrica | Puntuacion |
|---|---|---|
| ARC Challenge | acc_norm | 22,95% |
| ARC Easy | acc_norm | 27,65% |
| HellaSwag | acc_norm | 25,94% |
| PIQA | acc_norm | 49,62% |
| ArithMark-3.0 | acc_norm | 31,50% |

Estos valores son bajos en términos absolutos, pero hay que contextualizarlos: un modelo de 67K parámetros no puede competir con modelos de cientos de millones o miles de millones de parámetros. La puntuación de PIQA (49,62%) está cerca del azar (50%), lo que indica que en esa tarea el modelo apenas supera la adivinación. En ARC Challenge (22,95%) y HellaSwag (25,94%) también está por debajo de lo que lograría un modelo de 100M+ parámetros, pero dentro de lo esperable para su tamaño. No se han publicado comparaciones con otros modelos de la misma clase.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo es tan pequeño que puede ejecutarse en CPU sin necesidad de GPU. Los pesos en safetensors ocupan aproximadamente 0,27 MB (67.736 parámetros × 4 bytes).
- GPU recomendadas: ninguna; cualquier CPU moderna es suficiente. Si se desea usar GPU, cualquier modelo con al menos 1 GB de VRAM lo ejecutaría con holgura.
- Compatibilidad con hardware de consumo: sí, cabe en cualquier ordenador, Raspberry Pi, microcontroladores con suficiente RAM, etc.
- Opciones de despliegue: al ser un modelo con arquitectura personalizada, no es compatible directamente con frameworks estándar como vLLM, llama.cpp u Ollama sin adaptaciones. Requiere código personalizado para cargar y ejecutar la arquitectura. El repositorio de HuggingFace no incluye ejemplos de inferencia.
- Latencia y throughput: no se han publicado datos. Dado el tamaño, la inferencia en CPU debería ser prácticamente instantánea para secuencias cortas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el rango de 67K parámetros con arquitecturas similares. Los SLM más conocidos (por ejemplo, TinyLlama con 1.1B, SmolLM con 135M-1.7B) son órdenes de magnitud mayores. No hay datos públicos de otros modelos con memoria Engram o FFN de Hadamard de este tamaño. Por tanto, no es posible establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Tamaño extremadamente reducido: 67K parámetros es insuficiente para tareas de lenguaje complejas. El modelo solo puede producir texto muy corto y con errores frecuentes.
- Contexto limitado a 96 tokens: no puede mantener coherencia en conversaciones o documentos de más de unas pocas frases.
- Solo inglés: no hay soporte para otros idiomas, incluido el español.
- Riesgo de alucinación alto: al ser tan pequeño, es probable que genere contenido inventado o sin sentido, especialmente en tareas de conocimiento.
- Sin alineación: no se ha aplicado RLHF, DPO ni ningún otro método de ajuste para seguridad o utilidad. Puede generar contenido inapropiado si se le solicita.
- Arquitectura no estándar: requiere código personalizado para su uso; no hay integración con herramientas comunes de inferencia.
- Sin garantías de producción: el autor no proporciona ejemplos de uso ni documentación de API. No está pensado para entornos productivos.
- Datos de entrenamiento: la mezcla incluye datos sintéticos y educativos, pero no se detalla el filtrado de contenido dañino o sesgado. Podría reflejar sesgos presentes en los datasets originales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fromziro/Negative-v1.0
- Perfil del autor: https://huggingface.co/fromziro
- Búsqueda de modelos con tag fromzero: https://huggingface.co/models?other=fromzero

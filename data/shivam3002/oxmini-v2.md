# Shivam3002/OxMini-v2

## Resumen

OxMini v2 es un modelo de lenguaje educativo de 2,75 millones de parámetros, diseñado para ejecutarse en CPU y orientado al estudio de arquitecturas híbridas de atención. Desarrollado por Shivam3002, combina una aproximación de atención recurrente con regla delta (KDA-lite), atención latente de bajo rango (MLA-lite), cuatro flujos residuales con enrutamiento Sinkhorn (mHC-lite) y bloques SwiGLU. El modelo se entrenó sobre 3 millones de caracteres del dataset TinyStories y se post-entrenó con fragmentos de Wikipedia en inglés mediante supervisión fina (SFT) con replay de TinyStories para mitigar el olvido catastrófico.

Su relevancia radica en ser un banco de pruebas para investigar arquitecturas de atención eficientes en contextos muy pequeños (320 caracteres) y con tokenización a nivel de carácter. No pretende ser un asistente funcional; su propósito es facilitar experimentos de entrenamiento en CPU, pruebas de caching y ablaciones de componentes. La licencia MIT y el formato de pesos safetensors permiten su uso libre en entornos académicos y de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 6 capas KDA-lite (atención recurrente con regla delta) + 2 capas MLA-lite (atención latente de bajo rango) + enrutamiento mHC-lite con 4 flujos residuales |
| Parametros totales | 2.752.568 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 320 caracteres |
| Tipos de cuantizacion | No disponible (pesos en fp32/fp16, sin cuantización publicada) |
| Idiomas soportados | Inglés (solo) |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

La arquitectura combina tres innovaciones principales. Las capas KDA-lite implementan una memoria asociativa con regla delta gated y una cota de norma finita por cabeza, aproximando el kernel lineal de Kimi sin su implementación optimizada. Las capas MLA-lite comparten una clave/valor latente de bajo rango con atención causal global y RoPE en Q/K, inspiradas en DeepSeek-V2. El módulo mHC-lite introduce cuatro flujos residuales paralelos con mezcla pre/post y proyección Sinkhorn hacia matrices de enrutamiento doblemente estocásticas. Además, se incluye un caché de decodificación que persiste los estados asociativos KDA y los historiales K/V recortados de MLA, con logits cacheados que coinciden con los de un forward causal completo.

El entrenamiento base usó 1.200 actualizaciones en CPU sobre una división determinista 90/5/5 de 3.000.000 caracteres de TinyStories. El post-entrenamiento consistió en 40 leads de Wikipedia en inglés (con atribución CC BY-SA 4.0) para SFT solo de respuestas, más 10 temas retenidos para selección. Cada actualización incluyó replay de TinyStories con peso 0,5 para reducir el olvido catastrófico. Se publicaron hashes exactos de datos, revisiones y comandos en los archivos del repositorio.

## Capacidades

- Generación de texto a nivel de carácter: produce secuencias de caracteres condicionadas a un prompt, con una velocidad de decodificación cacheada de aproximadamente 200 caracteres por segundo en ejecuciones cualitativas.
- Razonamiento básico y completado de historias cortas: puede continuar narrativas simples del estilo TinyStories, aunque con errores frecuentes de ortografía y coherencia.
- Seguimiento de instrucciones muy limitado: responde a formatos tipo "User: ... Assistant:" con respuestas cortas, pero no es fiable para tareas complejas.
- Sin soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- Sin capacidades multimodales (visión, audio) ni multilingües; solo inglés.
- No dispone de modo de pensamiento (thinking mode) ni de generación de código estructurado.

## Casos de uso

- Estudio de arquitecturas recurrentes con atención lineal: los investigadores pueden analizar el comportamiento de KDA-lite frente a atención estándar en tareas de modelado de lenguaje a pequeña escala, gracias a su implementación transparente y reproducible.
- Experimentos de entrenamiento en CPU: al ser un modelo de 2,75 M de parámetros, permite ejecutar ciclos de entrenamiento completos en hardware sin GPU, ideal para cursos de aprendizaje automático o validación de hipótesis rápidas.
- Pruebas de caching y decodificación especulativa: el caché de decodificación implementado puede usarse para medir la coherencia entre logits cacheados y forwards completos, y para experimentar con técnicas de aceleración de inferencia.
- Ablaciones de componentes: al combinar KDA-lite, MLA-lite y mHC-lite, se pueden desactivar o modificar módulos individuales para estudiar su contribución al rendimiento, como se hizo en la comparación entre SFT puro y SFT con replay.
- Enseñanza de conceptos de NLP y transformers: su tamaño reducido y su tokenización por caracteres facilitan la visualización de mecanismos de atención, enrutamiento y memoria asociativa en entornos educativos.
- Prototipado de ideas de investigación: sirve como banco de pruebas para nuevas técnicas de post-entrenamiento, regularización o arquitecturas híbridas antes de escalar a modelos mayores.

## Benchmarks y rendimiento

La model card reporta métricas de perplejidad (PPL), entropía cruzada (CE) y precisión en dos conjuntos de evaluación:

| Conjunto | CE | PPL | Precisión |
|---|---|---|---|
| TinyStories test | 1,2885 | 3,6272 | 61,54% |
| Held-out SFT | 2,0018 | 7,4027 | 45,57% |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K) ni comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo está diseñado para ejecutarse en CPU sin GPU; el paquete de Python incluye todo lo necesario.
- Memoria: al tener solo 2,75 M de parámetros, el uso de RAM es mínimo (menos de 20 MB en fp32), por lo que cabe en cualquier sistema moderno.
- GPU: no se requiere; si se usa, cualquier GPU con al menos 1 GB de VRAM sería suficiente, pero no es necesaria.
- Opciones de despliegue: el repositorio proporciona un paquete Python (`oxmini`) con funciones de carga y generación; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: la decodificación cacheada alcanza aproximadamente 200 caracteres por segundo en ejecuciones cualitativas, según la model card.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de tamaño y propósito similares (modelos de 2-3 M de parámetros con arquitecturas híbridas y entrenamiento en TinyStories). La model card no incluye comparaciones con otras implementaciones. Se puede considerar TinyStories como referencia de dataset, pero no como modelo comparable. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- No es un asistente capaz: sus salidas sin editar contienen palabras malformadas, repeticiones, deriva temática y afirmaciones fabricadas.
- No puede redactar ensayos, responder preguntas factuales, seguir instrucciones complejas ni mantener un argumento de 1.000 palabras.
- La tokenización por caracteres y el contexto de 320 caracteres son limitaciones severas para tareas de lenguaje natural.
- La evaluación es pequeña, solo en inglés, con una sola semilla y no constituye un benchmark estandarizado de seguridad o capacidad.
- El post-entrenamiento con Wikipedia usa fragmentos bajo CC BY-SA 4.0, con atribución por fila; el uso comercial debe respetar esa licencia para los datos derivados.
- No debe usarse para decisiones factuales, médicas, legales, financieras, de seguridad crítica, de producción o dirigidas a usuarios finales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shivam3002/OxMini-v2
- Perfil del autor: https://huggingface.co/Shivam3002
- Paper TinyStories: https://arxiv.org/abs/2305.07759
- Paper Kimi Linear: https://arxiv.org/abs/2510.26692
- Paper DeepSeek-V2: https://arxiv.org/abs/2405.04434
- Paper mHC: https://arxiv.org/abs/2412.09542

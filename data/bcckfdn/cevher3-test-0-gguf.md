# bcckfdn/cevher3-test-0-GGUF

## Resumen

Cevher3-test-0 es un modelo de generación de texto de aproximadamente 1.600 millones de parámetros publicado por el usuario bcckfdn en HuggingFace. Se distribuye en formato GGUF, cuantizado para su uso con llama.cpp y Ollama, y deriva de un modelo base del mismo autor (bcckfdn/cevher3-test-0). La model card lo describe como una "destilación de arquitectura" que combina elementos de SmolLM2 y OLMo3, con un diseño híbrido de atención que alterna capas de atención global y capas con ventana deslizante de 768 tokens.

El modelo está orientado a turco e inglés, con licencia Apache 2.0, lo que permite uso comercial. Su tamaño contenido (1,6B parámetros) y su empaquetado en GGUF lo sitúan en la categoría de modelos pequeños desplegables en hardware de consumo. No obstante, se trata de una publicación de prueba ("test-0") con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentación detallada más allá de la arquitectura y los comandos de uso.

La relevancia de esta ficha es principalmente descriptiva: documenta una variante experimental de arquitectura híbrida en un modelo compacto y multilingüe (turco-inglés), útil para quien evalúe modelos pequeños con atención de ventana deslizante o quiera reproducir el pipeline de cuantización GGUF sobre un checkpoint base propio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (34 capas: 8 de atención global + 26 de atención con ventana deslizante de 768 tokens; q/k-norm y post-norm, según arquitectura OLMo3) |
| Parametros totales | 1.607.660.288 (≈1,6B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la ventana deslizante es de 768 tokens por capa; el contexto efectivo total no se especifica) |
| Tipos de cuantizacion | F16, Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | Turco (tr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye presumiblemente en safetensors, no confirmado |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer de 34 capas que combina dos patrones de atención: 8 capas con atención global y 26 capas con atención de ventana deslizante (sliding-window) de 768 tokens. Incorpora normalización en las consultas y claves (q/k-norm) y normalización posterior (post-norm), siguiendo el diseño de OLMo3. La model card etiqueta el modelo como "architecture-distillation", lo que sugiere que el entrenamiento se centró en transferir el comportamiento arquitectónico de un modelo mayor (posiblemente SmolLM2 y/u OLMo3, según los tags) a un checkpoint compacto de 1,6B parámetros.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal. La única información técnica concreta es la estructura de capas y la ventana de atención, junto con los cuatro niveles de cuantización publicados.

## Capacidades

- Generación de texto conversacional en turco e inglés, según los tags del repositorio (`conversational`, `text-generation`).
- Razonamiento y generación de código: no documentado explícitamente; no hay evidencia en la model card de capacidades específicas de código o matemáticas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas a turco e inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que puede servirse mediante la infraestructura de inference endpoints de HuggingFace.

## Casos de uso

- Generación de texto en turco para prototipos: el modelo puede producir respuestas conversacionales en turco con un checkpoint de 1,6B parámetros, adecuado para pruebas de concepto y demostraciones locales sin infraestructura GPU dedicada.
- Asistente conversacional ligero en inglés: con cuantización Q4_K_M (942 MB), puede ejecutarse en portátiles y ofrecer respuestas multi-turno básicas, aunque sin contexto largo garantizado.
- Evaluación de arquitecturas híbridas de atención: investigadores pueden usar el modelo para estudiar el efecto de combinar 8 capas globales con 26 de ventana deslizante de 768 tokens en tareas de lenguaje, comparándolo con transformers densos equivalentes.
- Pipeline de cuantización GGUF reproducible: sirve como ejemplo práctico de conversión de un checkpoint base a F16, Q8_0, Q5_K_M y Q4_K_M, útil para equipos que quieran replicar el flujo con llama.cpp.
- Despliegue en entornos con recursos limitados: mediante Ollama o llama.cpp, el modelo puede integrarse en aplicaciones de escritorio o edge donde no cabe un modelo de 7B o superior.
- Experimentación con modelos pequeños multilingües turco-inglés: como base para fine-tuning en tareas específicas de dominio (atención al cliente, clasificación de texto) en turco, aprovechando la licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de archivo GGUF):
  - F16: ~3,1 GB
  - Q8_0: ~1,7 GB
  - Q5_K_M: ~1,1 GB
  - Q4_K_M: ~0,95 GB
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para F16 (GTX 1650, RTX 3050); para cuantizaciones Q4/Q5 basta con 2 GB de VRAM (GTX 1050 Ti, iGPU modernas).
- Cabe en GPU de consumo: sí, en todas las cuantizaciones publicadas; Q4_K_M funciona incluso en CPU con RAM suficiente.
- Opciones de despliegue: llama.cpp (`llama-completion`), Ollama (`ollama create` / `ollama run`), y potencialmente servidores compatibles con GGUF como llama-cpp-python o text-generation-webui.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Cevher3-test-0 (este) | 1,6B | No disponible (ventana deslizante 768) | tr, en | Apache 2.0 | GGUF | Arquitectura híbrida OLMo3, publicación de prueba |
| SmolLM2-1.7B | 1,7B | 8.192 tokens (según versión) | en (principalmente) | Apache 2.0 | safetensors, GGUF | Referencia en la categoría de modelos pequeños; sin soporte nativo de turco documentado |
| OLMo-2-1B | ~1B | 4.096 tokens | en | Apache 2.0 | safetensors | Arquitectura OLMo, base conceptual del diseño híbrido citado |
| Qwen2.5-1.5B | 1,5B | 32.768 tokens | multilingüe (incluye tr) | Apache 2.0 | safetensors, GGUF | Mayor contexto y cobertura multilingüe; benchmarks públicos extensos |

Los datos de SmolLM2, OLMo-2 y Qwen2.5 provienen de conocimiento general de esos modelos; para Cevher3-test-0 no hay benchmarks que permitan comparar rendimiento real.

## Limitaciones y advertencias

- Modelo de prueba ("test-0") con cero descargas y cero likes: no hay evidencia de validación por parte de la comunidad ni de uso en producción.
- Ausencia total de benchmarks: no se puede verificar calidad, razonamiento ni rendimiento en tareas estándar.
- Contexto efectivo incierto: la ventana deslizante de 768 tokens limita la atención local en 26 de las 34 capas; el contexto global máximo no está documentado.
- Cobertura lingüística restringida a turco e inglés; no se garantiza calidad en otros idiomas.
- Riesgo de alucinación inherente a modelos pequeños (1,6B), especialmente en tareas de conocimiento factual.
- Sin documentación sobre sesgos, dataset de entrenamiento ni procesos de alineación (RLHF/DPO), lo que dificulta evaluar riesgos éticos.
- Licencia Apache 2.0 permite uso comercial, pero la falta de garantías y benchmarks hace recomendable una evaluación propia antes de desplegarlo.
- El nombre del archivo GGUF ("architecture-distillation") no coincide con el ID del repositorio, lo que puede generar confusión en pipelines automatizados.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bcckfdn/cevher3-test-0-GGUF
- Modelo base: https://huggingface.co/bcckfdn/cevher3-test-0
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- OLMo3 (referencia arquitectónica citada): no disponible en la información proporcionada
- SmolLM2 (referencia citada en tags): no disponible en la información proporcionada

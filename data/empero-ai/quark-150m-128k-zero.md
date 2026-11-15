# empero-ai/Quark-150M-128K-Zero

## Resumen

Quark-150M-128K-Zero es un modelo de lenguaje de 165,3 millones de parámetros (140,0 millones sin contar los embeddings) desarrollado por empero-ai como artefacto de investigación. Se trata de un transformer decoder-only híbrido entrenado con GRPO (Group Relative Policy Optimization) directamente sobre el modelo base Quark-150M-128K-Base, sin ninguna etapa de supervised fine-tuning. Esta aproximación "RL-from-base" es el rasgo distintivo del checkpoint: todos los tokens de entrenamiento provienen de muestras propias del modelo, salvo indicaciones cortas escritas por código.

El modelo destaca por combinar un tamaño muy reducido con una ventana de contexto de 131.072 tokens, gracias a una arquitectura que alterna 12 capas locales con atención de ventana deslizante de 256 tokens y 4 capas globales con grouped-query attention completa. Esto mantiene un estado de inferencia pequeño, ya que solo las capas globales conservan una caché KV completa. Además, el modelo puede razonar en un monólogo privado delimitado por `[MONOLOGUE]` y ejecutar llamadas a herramientas.

Su relevancia actual radica en explorar hasta dónde puede llegar el aprendizaje por refuerzo aplicado directamente a un modelo base pequeño, sin etapa supervisada intermedia, en tareas de razonamiento, código, uso de herramientas y contexto largo. El autor lo publica explícitamente como material de investigación, no como producto, y advierte de que no ha sido evaluado para uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only híbrido (12 capas locales con sliding-window attention + 4 capas globales con GQA) |
| Parámetros totales | 165.254.528 (165,3M); 140,0M sin embeddings |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantización | no disponible (pesos publicados en float32 safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only híbrido de 16 capas y anchura 768, con 12 cabezas de atención (tamaño de cabeza 64) y embeddings de entrada/salida atados. Las 12 capas locales aplican atención de ventana deslizante sobre los últimos 256 tokens, con RoPE, QK-norm y un attention sink aprendido por cabeza; en paralelo corre una convolución causal corta de doble compuerta (kernel 4), y ambas se mezclan por canal. Las 4 capas globales (una cada cuatro capas) usan atención causal completa con grouped-query attention (12 cabezas de query, 4 de key/value), también con RoPE y QK-norm. Cada atención posterior a la primera mezcla sus valores con los de la primera capa mediante una compuerta por token y por cabeza (gated value residuals). El flujo residual usa actualizaciones escaladas por profundidad con RMSNorm antes y después de cada subcapa (sandwich norm) y se mantiene en float32 aunque los pesos estén en bfloat16. La MLP es una gated MLP con compuerta squared-ReLU y tamaño oculto 2048. El tokenizador es un BPE a nivel de byte con 32.768 tokens, donde cada etiqueta de chat es un único token.

El entrenamiento consta de unas 506.000 millones de tokens de preentrenamiento (fase de contexto 32K y extensión a 128K con 10.000 millones adicionales) y después una fase de RL con GRPO, con ventajas relativas de grupo y pérdida a nivel de token, muestras on-policy a temperatura 1, sin penalización KL y sin modelo de referencia. Se ejecutaron menos de 1.300 pasos sobre 8×H100, con parada temprana por presupuesto mientras las puntuaciones seguían mejorando, y annealing del learning rate en el 3% final. Aproximadamente el 95% de los grupos de recompensa se puntuaron con comprobaciones programáticas (respuestas exactas, formato, reglas de instrucción, tests unitarios y comprobaciones de ficheros en sandboxes); el resto con jueces LLM (calidad de chat, escritura creativa, segundas opiniones sobre rechazos de seguridad y renderizado de SVG/HTML). Las tareas cubrieron aritmética y problemas de matemáticas, sentido común, seguimiento de estado del mundo, teoría de la mente, percepción, seguimiento de formato e instrucciones, system prompts, recuperación en contexto largo, identidad, valores y seguridad, chat, escritura creativa, código y uso de herramientas (simuladas, búsqueda web en vivo y tareas de shell/ficheros en sandboxes reales).

## Capacidades

- Generación de texto conversacional en formato de chat, con respuestas en inglés.
- Modo de razonamiento interno: puede pensar primero en un bloque `[MONOLOGUE]`, activable con `enable_thinking=True` o decidido por el propio modelo.
- Llamada a herramientas (tool calling) en su propio formato y en los formatos de harnesses de agentes de código comunes.
- Razonamiento matemático y aritmético, incluidos problemas de palabras.
- Generación de código y ejecución de tareas de terminal y ficheros en sandboxes.
- Recuperación de información en contexto largo (hasta 131.072 tokens).
- Seguimiento de instrucciones, system prompts y reglas de formato.
- Tareas de sentido común, seguimiento de estado del mundo y teoría de la mente.
- Escritura creativa y renderizado de respuestas SVG/HTML.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Investigación sobre RL-from-base: permite estudiar la dinámica de GRPO aplicado directamente a un modelo base sin SFT, comparando curvas de recompensa y comportamiento con la variante base.
- Evaluación de arquitecturas híbridas de contexto largo: sus 12 capas locales con ventana de 256 tokens y 4 globales permiten medir el coste y la calidad de la caché KV reducida en tareas de recuperación sobre 131K tokens.
- Agentes de terminal en entornos controlados: el modelo fue entrenado en tareas de shell y ficheros dentro de sandboxes reales y en 15 formatos de harness de agentes de código, por lo que sirve como banco de pruebas de bajo coste para pipelines de agentes.
- Prototipado de asistentes conversacionales con tool calling: al caber en una sola GPU consumer, permite iterar rápidamente en el diseño de formatos de herramientas y system prompts antes de escalar a modelos mayores.
- Experimentos de razonamiento con monólogo privado: el bloque `[MONOLOGUE]` facilita estudiar cómo el razonamiento explícito afecta a la precisión en tareas de matemáticas y sentido común en modelos pequeños.
- Docencia y reproducción de experimentos: su licencia Apache 2.0 y su tamaño permiten reproducir el pipeline de RL en laboratorios con recursos limitados.
- Generación de código en pipelines de CI: puede integrarse en comprobaciones automatizadas de parches y tests unitarios dentro de sandboxes, aunque con supervisión humana obligatoria.

## Benchmarks y rendimiento

Los resultados publicados provienen de rollouts de entrenamiento y de la suite interna del autor, no de benchmarks held-out.

| Métrica | Inicio | Final |
|---|---|---|
| Tareas simples de terminal en 15 formatos de harness (rollouts de entrenamiento) | 2,6% resueltas | 64,5% resueltas en los últimos 100 pasos |
| Formatos de harness añadidos tarde en el run | 42%–54% resueltas | no disponible |
| Suite de tareas: respuestas bien formadas | 71% | 96% |
| Suite de tareas: respuestas cortadas por límite de longitud | 11,7% | 0,5% |
| Suite de tareas: respuestas correctas | 12,8% | 36,4% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en float32 ocupan aproximadamente 0,66 GB (165,3M parámetros × 4 bytes); en bfloat16, unos 0,33 GB. La caché KV es reducida porque solo las 4 capas globales mantienen caché completa, lo que permite contextos largos con poca memoria adicional.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para los pesos; el autor entrenó con 8×H100, pero la inferencia no requiere hardware de datacenter.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090, etc.) con margen amplio.
- Opciones de despliegue: transformers (requiere `transformers>=5.23` y `trust_remote_code=True`, ya que el código de modelado se distribuye con los pesos). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Quark-150M-128K-Zero | 165,3M | 131.072 | Apache 2.0 | Hugging Face |
| Quark-150M-128K-Base | 165,3M (misma familia) | 131.072 | no disponible | Hugging Face |
| Quark-150M-32K-Base | 165,3M (misma familia) | 32.768 | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparables con modelos de otras familias en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento con alternativas externas.

## Limitaciones y advertencias

- Artefacto de investigación: el autor indica explícitamente que no es un producto y que no ha sido evaluado para uso en producción.
- Seguridad no evaluada: el único entrenamiento de seguridad es un pequeño conjunto de tareas de rechazo durante el RL; puede producir texto sesgado o dañino.
- Errores factuales y de razonamiento: como cualquier modelo pequeño, comete errores y puede alucinar; no debe usarse para decisiones que afecten a personas.
- Solo inglés: la model card declara únicamente el idioma inglés.
- Sin SFT: la ausencia de etapa supervisada puede traducirse en un seguimiento de instrucciones menos pulido que el de modelos con SFT.
- Precisión limitada: la tasa de respuestas correctas en la suite interna terminó en 36,4%, lo que refleja una capacidad de razonamiento todavía baja.
- Requiere `trust_remote_code=True` y `transformers>=5.23`, lo que implica ejecutar código personalizado del repositorio.
- Licencia Apache 2.0: permite uso comercial, pero el autor desaconseja desplegarlo sin evaluación y salvaguardas propias.

## Enlaces

- Hugging Face: https://huggingface.co/empero-ai/Quark-150M-128K-Zero
- Modelo base: https://huggingface.co/empero-ai/Quark-150M-128K-Base

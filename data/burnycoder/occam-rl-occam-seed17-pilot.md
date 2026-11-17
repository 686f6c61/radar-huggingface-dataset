# BurnyCoder/occam-rl-occam-seed17-pilot

## Resumen

occam-seed17-pilot es un adaptador LoRA de investigación publicado por Libor "Burny" Burian (usuario BurnyCoder) sobre el modelo base Qwen/Qwen3.5-0.8B. Se trata de un artefacto experimental derivado de un pipeline de aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization), cuyo objetivo declarado es explorar el uso de un juez LLM dentro del bucle de recompensa (la "reward arm" denominada occam). No es un modelo de propósito general validado, sino un piloto exploratorio de un experimento de investigación reproducible.

El adaptador se entrenó durante únicamente 4 pasos completos, con la semilla 17, y el propio autor indica que no se modificó ningún tensor de parámetros entrenables ("Changed trainable parameter tensors: 0"). El juez de entrenamiento no superó el criterio de calificación ("Training judge qualified: False"), aunque se aplicó una exención de calidad del juez para permitir completar el piloto. El autor afirma explícitamente que esta publicación no implica ninguna ventaja sobre ninguna línea base.

Por tanto, la relevancia de este artefacto es metodológica y de reproducibilidad, no de rendimiento: documenta un intento de RL con retroalimentación de un juez LLM sobre un modelo pequeño (0,8B parámetros), con todas las evaluaciones todavía pendientes. Cualquier uso en producción requeriría partir del modelo base y validar el adaptador de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only (Qwen/Qwen3.5-0.8B); detalles de arquitectura del base no disponibles en la informacion proporcionada |
| Parametros totales | No disponible para el adaptador; el modelo base es de 0,8B (segun identificador) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del base Qwen3.5-0.8B, valor no confirmado) |
| Tipos de cuantizacion | No disponible; el repositorio contiene pesos safetensors del adaptador |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (library_name: peft) acoplado al modelo base Qwen/Qwen3.5-0.8B. La arquitectura subyacente es, por tanto, la del transformer decoder-only del base, cuyos detalles (número de capas, dimensiones, tipo de atención) no se detallan en la información disponible. El adaptador en sí ocupa aproximadamente 0,1 GB en el repositorio.

El entrenamiento siguió un esquema de aprendizaje por refuerzo con GRPO, usando un juez LLM como fuente de recompensa (reward arm "occam"). El piloto se ejecutó con semilla 17 y constó de 4 pasos completos. El autor documenta que no se modificó ningún tensor entrenable, que el juez de entrenamiento no superó el criterio de calidad y que se aplicó una exención exploratoria para poder cerrar el experimento. No se proporcionan datos sobre volumen de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO adicional. La implementación completa, los requisitos previos y la procedencia de los datos se remiten al repositorio de GitHub del autor.

## Capacidades

- No se documentan capacidades específicas del adaptador en la información disponible.
- Al estar montado sobre Qwen/Qwen3.5-0.8B, heredaría potencialmente las capacidades del base (generación de texto, razonamiento básico, código), pero no hay validación publicada para este adaptador.
- Soporte de tool calling / function calling: no disponible (no evaluado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no evaluado).
- Capacidades multilingües: no disponible (idiomas no declarados).
- Capacidades especiales (thinking mode, vision, audio): no disponible.
- Estado de evaluación: todas las splits (occam, accuracy, token, formal, shuffled, prompt_ordinary, prompt_concise, prompt_occam) figuran como "pending" / "not evaluated".

## Casos de uso

- Reproducción de investigación en RL con jueces LLM: el adaptador sirve como artefacto de referencia para replicar el pipeline GRPO descrito en el repositorio del autor, incluida la configuración de semilla y la reward arm occam.
- Estudio de fallos en el bucle de recompensa: dado que el juez de entrenamiento no superó el criterio de calidad, el artefacto es útil para analizar cómo jueces débiles afectan la señal de recompensa en modelos pequeños.
- Docencia sobre PEFT y LoRA: el tamaño reducido (0,1 GB de adaptador sobre un base de 0,8B) permite montar el adaptador en entornos docentes y mostrar el flujo completo de carga con la librería peft.
- Auditoría de artefactos de Hugging Face: útil como caso práctico de model card con evaluaciones pendientes y advertencias explícitas sobre ausencia de validación.
- Pruebas de infraestructura de evaluación: las splits definidas (accuracy, token, formal, shuffled, prompt_*) pueden usarse para construir y probar harnesses de evaluación antes de ejecutar modelos mayores.
- Comparación de configuraciones de prompt en RL: las variantes prompt_ordinary, prompt_concise y prompt_occam permiten estudiar el efecto del formato de instrucción sobre la recompensa del juez.
- No se recomienda su uso en atención al cliente, generación de código en producción ni ningún despliegue real: no hay evidencia de rendimiento y el propio autor declara que no es un modelo de propósito general validado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card lista ocho splits de evaluación (occam, accuracy, token, formal, shuffled, prompt_ordinary, prompt_concise, prompt_occam) todas con estado "pending" / "not evaluated", sin valores de accuracy, adequacy ni puntuación compuesta C × A × S.

## Requisitos de hardware

- VRAM estimada: no disponible de forma validada; por el tamaño del base (0,8B) y del adaptador (0,1 GB), la inferencia en precisión completa requeriría del orden de 2 GB, y en cuantizaciones de 4 bits podría situarse por debajo de 1 GB, pero estas cifras son estimaciones no confirmadas por el autor.
- GPU recomendadas: no disponible; cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) sería sobrada para un base de 0,8B, pero no hay datos publicados.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del base, si bien no está verificado en la información disponible.
- Opciones de despliegue: carga mediante la librería peft sobre el base Qwen/Qwen3.5-0.8B; integración con vLLM, llama.cpp, Ollama o TGI no documentada para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BurnyCoder/occam-rl-occam-seed17-pilot | Adaptador LoRA sobre base 0,8B | No disponible | No evaluado (todas las splits pendientes) | Apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-0.8B (modelo base) | 0,8B | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Hugging Face |
| Adaptadores LoRA de investigación comparables | Variable | Variable | Variable | Variable | No disponible |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El autor declara explícitamente que es un artefacto local de investigación, no un modelo de propósito general validado.
- No se modificó ningún tensor entrenable durante el entrenamiento ("Changed trainable parameter tensors: 0"), por lo que el adaptador podría no incorporar cambios efectivos respecto del base.
- El juez de entrenamiento no superó el criterio de calidad ("Training judge qualified: False"); la señal de recompensa subyacente es, por tanto, de fiabilidad cuestionable.
- Solo 4 pasos de entrenamiento completados: insuficiente para cualquier conclusión sobre aprendizaje.
- Todas las evaluaciones están pendientes; no hay evidencia de precisión, adecuación ni calidad.
- El autor afirma que no se implica ninguna ventaja sobre ninguna línea base.
- Riesgo de alucinación y sesgos: no evaluado para este adaptador; heredaría los del base Qwen3.5-0.8B, no documentados aquí.
- Idiomas soportados no declarados; cobertura multilingüe no verificada.
- Licencia Apache-2.0 para código y adaptadores; los derechos del dataset y la atribución se describen en el repositorio de investigación, y los registros de benchmark en bruto son artefactos separados. Verificar antes de cualquier uso comercial.
- Sin descargas ni likes en el momento de la consulta; no hay señal de uso comunitario.

## Enlaces

- Hugging Face: https://huggingface.co/BurnyCoder/occam-rl-occam-seed17-pilot
- Repositorio de investigación: https://github.com/BurnyCoder/occams-razor-reinforcement-learning-llm-as-a-judge
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B

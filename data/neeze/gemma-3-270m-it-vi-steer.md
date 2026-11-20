# Neeze/gemma-3-270m-it-vi-steer

## Resumen

`Neeze/gemma-3-270m-it-vi-steer` es una modificación quirúrgica de `google/gemma-3-270m-it` en la que el autor ha editado manualmente 640 valores numéricos de los pesos, sin entrenamiento ni fine-tuning adicional. El objetivo es concreto: aumentar la probabilidad de que el modelo responda en vietnamita cuando se le instruye explícitamente a hacerlo, un comportamiento que el modelo base incumple con frecuencia. Según la model card, la tasa de obediencia a la instrucción «Hãy trả lời bằng tiếng Việt» pasa de aproximadamente el 63 % en el modelo original a cerca del 70 % en esta variante, medida sobre 300 preguntas en inglés con la instrucción adjunta.

La técnica empleada es edición de pesos por transferencia de comportamiento (*steering* / *weight editing*): el autor extrae el «hábito» de seguir instrucciones en vietnamita de un modelo mayor, `LiquidAI/LFM3-1.7B` (unas seis veces más grande), lo traduce al espacio de pesos de Gemma y lo suma directamente. No se añaden capacidades nuevas de conocimiento ni de generación; solo se modifica la propensión a obedecer la directiva de idioma.

El modelo es relevante como experimento reproducible de interpretabilidad y control de comportamiento en modelos pequeños, y como ejemplo práctico de que ciertos sesgos de instrucción pueden corregirse sin coste de entrenamiento. No obstante, es un experimento personal del autor, con métricas limitadas y sin validación independiente, por lo que no está pensado para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 text, `gemma3_text`), con código de modelado personalizado (`modeling_gemma3_vi.py`) |
| Parametros totales | 268.098.816 (268 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors sin cuantizar en el repo) |
| Idiomas soportados | vietnamita (vi), ingles (en) |
| Licencia | Gemma Terms of Use (licencia `gemma`) |
| Formato de pesos | safetensors (repo de 0,6 GB), requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 3 en su variante de texto de 270 M de parámetros, un transformer decoder-only. Sobre esa base, esta variante no aplica ningún proceso de entrenamiento: no hay preentrenamiento adicional, ni SFT, ni RLHF/DPO. La modificación consiste en la edición directa de 640 valores numéricos dentro de los pesos, inyectados mediante un fichero de código corto (`modeling_gemma3_vi.py`) que se carga con `trust_remote_code=True`.

El procedimiento de transferencia, descrito en el blog del autor, toma el comportamiento de obediencia al idioma vietnamita de `LiquidAI/LFM3-1.7B` (aproximadamente 6 veces mayor), lo «traduce» al espacio de representación de Gemma 270M y lo suma a los pesos. No se especifican en la información disponible los detalles exactos de la capa o capas afectadas, ni la metodología matemática completa de la proyección entre espacios de pesos. Tampoco se documenta la composición del dataset de evaluación más allá de las 300 preguntas en inglés con instrucción de respuesta en vietnamita.

## Capacidades

- Generación de texto conversacional en inglés y vietnamita, heredada del modelo base Gemma 3 270M IT.
- Mayor obediencia a la instrucción explícita de responder en vietnamita (aprox. 70 % frente a 63 % del base, según la model card).
- No fuerza el cambio de idioma sin instrucción: ante preguntas en inglés sin directiva, sigue respondiendo en inglés.
- Soporte de plantilla de chat (`apply_chat_template`) con roles de sistema, usuario y asistente.
- Capacidad multilingüe limitada a vi y en según los metadatos; no se documentan otras lenguas.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso en la información disponible.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking).

## Casos de uso

- Evaluación de técnicas de edición de pesos: sirve como caso reproducible para estudiar cómo 640 valores modificados alteran un comportamiento de instrucción sin reentrenar, útil en investigación sobre interpretabilidad y control de modelos pequeños.
- Prototipado de asistentes en vietnamita de bajo coste: al requerir solo 0,6 GB de pesos, puede desplegarse en entornos con recursos mínimos para generar respuestas conversacionales simples en vietnamita cuando se instruye explícitamente.
- Docencia y divulgación: ejemplo didáctico de transferencia de comportamiento entre modelos de distinto tamaño (de 1.7B a 270M) sin coste de entrenamiento, adecuado para talleres sobre mecánica interna de transformers.
- Pruebas de robustez de instrucciones de idioma: permite comparar tasas de obediencia frente al modelo base en pipelines de evaluación de *instruction following*.
- Generación de texto corto en dispositivos edge: con 268 M de parámetros, es viable en CPU o GPU de gama baja para tareas de texto acotadas donde el idioma objetivo sea el vietnamita.
- Base para experimentos de *steering* adicionales: el fichero `modeling_gemma3_vi.py` y la metodología documentada permiten replicar el enfoque para otros comportamientos o idiomas.

## Benchmarks y rendimiento

| Metrica | Gemma 3 270M IT (base) | Esta variante |
|---|---|---|
| Obediencia a «responde en vietnamita» (300 preguntas en inglés) | ~63 % | ~70 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor indica que las mediciones iniciales sobre pruebas de conocimiento no son fiables porque la herramienta de evaluación solo se ejecutó sobre una fracción pequeña de las preguntas.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión original (fp32/bf16 según pesos): en torno a 1 GB o menos, dado el tamaño de 268 M de parámetros y un repo de 0,6 GB.
- Cabe en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en CPU para generación de texto corto.
- GPU recomendadas para mayor throughput: A100, H100 o L4 para despliegues por lotes; para uso individual basta una GPU de gama media o CPU.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requisito obligatorio por el código personalizado). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible; el uso de `custom_code` puede limitar su integración en algunos servidores de inferencia.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| `Neeze/gemma-3-270m-it-vi-steer` | 268 M | no disponible | vi, en | Gemma | Edición manual de 640 pesos, requiere `trust_remote_code` |
| `google/gemma-3-270m-it` | 270 M | no disponible | multilingüe (Gemma 3) | Gemma | Modelo base; ~63 % de obediencia al vietnamita |
| `LiquidAI/LFM3-1.7B` | ~1.7 B | no disponible | no disponible | no disponible | Fuente del comportamiento transferido; ~6x mayor |

No se dispone de datos de benchmarks comparativos adicionales en la información proporcionada.

## Limitaciones y advertencias

- Solo modifica el hábito de obediencia al idioma; no mejora conocimiento, razonamiento ni calidad de escritura respecto a Gemma 3 270M.
- Puede seguir mezclando palabras en inglés en respuestas en vietnamita.
- No fuerza el cambio de idioma sin instrucción explícita: preguntas en inglés sin directiva se responden en inglés.
- El impacto sobre otras capacidades (pruebas de conocimiento) está pendiente de medición fiable; el autor reconoce que sus primeras mediciones no son válidas.
- Es un experimento personal del autor, sin validación independiente ni garantías de estabilidad; no apto para usos críticos o de producción.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio: riesgo de seguridad si no se audita `modeling_gemma3_vi.py`.
- La licencia Gemma Terms of Use y la Gemma Prohibited Use Policy restringen el uso comercial y ciertos usos; es necesario revisarlas antes de cualquier despliegue.
- Riesgo de alucinación inherente a un modelo de 270 M; no se documentan mitigaciones específicas.
- Contexto máximo no documentado en la información disponible, lo que impide planificar cargas de contexto largo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Neeze/gemma-3-270m-it-vi-steer
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Espejo del base usado por el autor: https://huggingface.co/unsloth/gemma-3-270m-it
- Modelo fuente del comportamiento: https://huggingface.co/LiquidAI/LFM3-1.7B
- Blog del autor sobre la técnica: https://neeze.github.io/docs/practical-ai/weight-programming-lfm3-to-gemma/
- Terminos de licencia Gemma: https://ai.google.dev/gemma/terms
- Politica de uso prohibido de Gemma: https://ai.google.dev/gemma/prohibited_use_policy

# CLArg-group/ita-grpo-args-bsm-q-sem-rank-con-th-4-6

## Resumen

`ita-grpo-args-bsm-q-sem-rank-con-th-4-6` es un generador de argumentos entrenado con GRPO para su uso en *inference-time argumentation* (ITA), desarrollado por el grupo CLArg-group en el marco del artículo *Neurosymbolic Learning for Inference-Time Argumentation*. El modelo recibe una afirmación (*claim*) y produce dos conjuntos de argumentos: uno de apoyo y otro de ataque. Estos argumentos inducen un grafo de argumentación ponderado (QBAF) centrado en la afirmación, cuyos nodos son puntuados por un modelo de puntuación base (BSM) y agregados mediante la semántica gradual DF-QuAD para obtener una fuerza final que se umbraliza en un veredicto Verdadero / Falso / Incierto.

Técnicamente es un adaptador LoRA (rango 8, α = 32, dropout 0.1) sobre el backbone Qwen3-8B, que apunta a las proyecciones query, key, value y output. No se trata de un modelo de propósito general, sino de un componente especializado dentro de un pipeline neurosimbólico de verificación de afirmaciones: el adaptador solo se encarga de la generación de argumentos, mientras que la puntuación y la agregación las realizan el BSM y DF-QuAD respectivamente.

Su relevancia radica en que ejemplifica una aproximación híbrida entre modelos de lenguaje y razonamiento simbólico para verificación factual, un área donde los LLM puros muestran limitaciones de calibración y trazabilidad. El modelo se publica bajo licencia MIT, con un tamaño de repositorio de 0.0 GB (solo pesos del adaptador), y está pensado para integrarse en el repositorio de inferencia del grupo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B) con adaptador LoRA (rango 8, α = 32, dropout 0.1) sobre proyecciones q, k, v, o |
| Parámetros totales | No disponible (adaptador LoRA sobre un backbone de 8B; el adaptador en sí es de rango 8) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de Qwen3-8B; no especificada en la model card) |
| Tipos de cuantización | No disponible (el adaptador se distribuye en safetensors; la cuantización dependerá del backbone) |
| Idiomas soportados | No disponible (no especificado; hereda las capacidades del backbone Qwen3-8B) |
| Licencia | MIT (sujeta además a la licencia del modelo base Qwen3-8B y a los términos de los datos de entrenamiento) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen3-8B, un transformer decoder-only. El adaptador modifica únicamente las proyecciones de query, key, value y output con rango 8, α = 32 y dropout 0.1. Durante el entrenamiento con GRPO, el backbone y el modelo de puntuación base (BSM-Q primed & sem & rank & con, también basado en Qwen3-8B) permanecen congelados; solo se actualizan los parámetros LoRA del generador. La semántica de agregación es DF-QuAD, con la puntuación base de la propia afirmación fijada en 0.5 y umbrales de veredicto fijos α = 0.4 y β = 0.6.

El entrenamiento se realizó con GRPO mediante la librería TRL sobre el conjunto *TFU Training Claims* (1.000 afirmaciones etiquetadas como Verdadero / Falso / Incierto). Cada completion muestreada se parsea en argumentos de apoyo y de ataque, se puntúa con el BSM y se evalúa con DF-QuAD; la fuerza resultante se convierte en la recompensa de argumentación r<sub>α,β</sub> descrita en la Sección 6 del artículo, que es máxima para cualquier fuerza que produzca el veredicto correcto y decrece linealmente con la distancia al umbral relevante. Las completions no parseables reciben una recompensa fija de −1000. Hiperparámetros: learning rate 1e-5, 2 épocas, 2 generaciones por prompt, 450 pasos de optimización, semilla 0.

## Capacidades

- Generación de argumentos de apoyo (*supporting arguments*) y de ataque (*attacking arguments*) a partir de una afirmación dada.
- Producción de salidas estructuradas parseables que inducen un QBAF centrado en la afirmación.
- Integración en un pipeline neurosimbólico de verificación de afirmaciones con veredicto ternario (Verdadero / Falso / Incierto).
- Razonamiento multi-paso implícito: la generación de argumentos alimenta la puntuación del BSM y la agregación DF-QuAD.
- No se documentan capacidades de tool calling, function calling, agentes autónomos, visión, audio ni modo *thinking* explícito.
- Capacidades multilingües: no disponibles (no especificadas; dependen del backbone Qwen3-8B).

## Casos de uso

- Verificación de afirmaciones en pipelines de fact-checking: el modelo genera argumentos a favor y en contra de una afirmación, que se puntúan y agregan para emitir un veredicto ternario. Es adecuado porque su entrenamiento con GRPO optimiza directamente la recompensa de argumentación alineada con el veredicto final.
- Investigación en argumentación computacional: sirve como generador de QBAF para experimentos sobre semánticas graduales, comparación de BSMs y análisis de robustez de veredictos.
- Evaluación de sistemas neurosimbólicos: permite reproducir los resultados de la Tabla 5 del artículo con umbrales fijos 0.4/0.6 y comparar con otras variantes del grupo.
- Generación de explicaciones estructuradas: los argumentos de apoyo y ataque pueden presentarse como justificación legible de un veredicto en herramientas de análisis de desinformación.
- Docencia y divulgación: ilustra cómo un LLM puede integrarse en un razonador simbólico para tareas de clasificación ternaria con trazabilidad.
- Base para *fine-tuning* adicional: al ser un adaptador LoRA ligero, puede combinarse con otros adaptadores o reentrenarse sobre nuevos dominios de afirmaciones sin tocar el backbone.
- Componente en sistemas de moderación de contenido factual: para marcar afirmaciones dudosas con argumentos estructurados antes de la revisión humana.

## Benchmarks y rendimiento

Resultados reportados en la Tabla 5 del artículo, con este generador emparejado con BSM-Q (primed & sem & rank & con) en el momento de la evaluación y umbrales fijos 0.4/0.6:

| Dataset | Métrica | Puntuación |
|---|---|---|
| TFU Evaluation Claims | accuracy | 0.538 |
| AVeriTeC | balanced accuracy | 0.485 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para el adaptador; al cargarse sobre Qwen3-8B en bfloat16 se requiere aproximadamente el espacio del backbone (en torno a 16 GB para los pesos en bf16, más overhead de activaciones y caché KV).
- GPU recomendadas: A100, H100 o RTX 4090 para el backbone en bf16; GPUs con menor VRAM pueden usar cuantización del backbone (no documentada para este adaptador).
- Cabe en GPU de consumo: sí, potencialmente en RTX 4090 (24 GB) o GPUs con 16 GB o más si se cuantiza el backbone; no confirmado en la model card.
- Opciones de despliegue: carga vía PEFT + Transformers según el ejemplo de la model card; también puede descargarse con `hf download` al directorio `checkpoints/` del repositorio de ITA. No se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos de otros modelos en la información proporcionada. Como referencia estructural, este adaptador se apoya en Qwen3-8B y se complementa con el BSM-Q (primed & sem & rank & con) del mismo grupo; otras variantes del proyecto CLArg-group (como las referenciadas en la Tabla 5 del artículo) no están detalladas en la información disponible.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ita-grpo-args-bsm-q-sem-rank-con-th-4-6 | Adaptador LoRA sobre 8B | No disponible | MIT | Hugging Face (CLArg-group) |
| Qwen3-8B (base) | 8B | No disponible en esta ficha | No disponible en esta ficha | Hugging Face (Qwen) |
| Otras variantes ITA del grupo | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El modelo no es de propósito general: está especializado en generación de argumentos para ITA y su uso fuera de ese pipeline no está validado.
- Rendimiento moderado: accuracy de 0.538 en TFU Evaluation Claims y balanced accuracy de 0.485 en AVeriTeC, lo que indica margen de mejora y riesgo de errores en veredictos.
- Dependencia del BSM y de DF-QuAD: el veredicto final no depende solo del generador, sino del modelo de puntuación base y de la semántica de agregación; cambios en estos componentes alteran los resultados.
- Umbrales fijos (0.4/0.6) definidos para la recompensa de entrenamiento; su generalización a otros dominios no está garantizada.
- Completions no parseables reciben recompensa −1000 durante el entrenamiento, lo que puede sesgar el modelo hacia formatos concretos de salida.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no evaluado explícitamente en la model card; los argumentos generados pueden ser plausibles pero incorrectos.
- Idiomas soportados: no especificados; probablemente limitado a los idiomas del backbone y de los datos de entrenamiento (no documentados).
- Licencia MIT para los pesos, pero sujeta a la licencia del modelo base Qwen3-8B y a los términos de los datos de entrenamiento; revisar antes de uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria.
- No se documentan opciones de cuantización ni despliegue en servidores de inferencia de alto rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CLArg-group/ita-grpo-args-bsm-q-sem-rank-con-th-4-6
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- BSM-Q (primed & sem & rank & con): https://huggingface.co/CLArg-group/ita-bsm-q-sem-rank-con
- Repositorio de inferencia ITA: https://github.com/CLArg-group/inference-time-argumentation
- Librería TRL: https://github.com/huggingface/trl
- Artículo *Neurosymbolic Learning for Inference-Time Argumentation*: no disponible como enlace en la información proporcionada.

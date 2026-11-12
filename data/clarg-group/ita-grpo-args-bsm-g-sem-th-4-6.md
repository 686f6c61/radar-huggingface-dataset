# CLArg-group/ita-grpo-args-bsm-g-sem-th-4-6

## Resumen

ita-grpo-args-bsm-g-sem-th-4-6 es un adaptador LoRA sobre Qwen/Qwen3-8B entrenado con GRPO para generar argumentos a favor y en contra de una afirmación (claim) en el contexto de la argumentación en tiempo de inferencia (ITA, *inference-time argumentation*). Lo desarrolla el grupo CLArg-group en el marco del paper *Neurosymbolic Learning for Inference-Time Argumentation*, y su función no es emitir un veredicto directamente, sino producir los argumentos que alimentan un marco argumentativo neurosimbólico (QBAF) cuyo veredicto final se calcula con puntuaciones de un modelo de base score (BSM) y la semántica gradual DF-QuAD.

El modelo resuelve el problema de la verificación de afirmaciones (claim verification) combinando generación en lenguaje natural con agregación simbólica: dado un claim, genera conjuntos de argumentos de apoyo y de ataque, que se puntúan con el BSM congelado ita-bsm-g-sem y se agregan con DF-QuAD para obtener una fuerza del claim que, umbralizada en 0,4 y 0,6, produce un veredicto True / False / Uncertain.

Es relevante porque muestra un patrón de entrenamiento con refuerzo (GRPO) donde la recompensa no es un juicio humano directo sino una señal derivada de un pipeline neurosimbólico completo, y porque el adaptador es pequeño (rango 8) y se distribuye con licencia MIT, lo que facilita reproducir el pipeline. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se han publicado especificaciones de contexto ni de idiomas más allá de las del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B) con adaptador LoRA (rank 8, α = 32, dropout 0,1; proyecta query, key, value y output) |
| Parámetros totales | Adaptador LoRA sobre Qwen3-8B; número exacto de parámetros del adaptador no disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base Qwen3-8B) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT (sujeta además a la licencia de Qwen/Qwen3-8B y a los términos de los datos de entrenamiento) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3-8B, un transformer decoder-only, mediante LoRA de rango 8, α = 32 y dropout 0,1 sobre las proyecciones query, key, value y output. Durante el entrenamiento solo se actualizan los parámetros LoRA del generador; el modelo de base score BSM-G (primed & sem), entrenado con argumentos generados por GPT-5 y con pérdida semántica, permanece congelado y actúa como componente de la función de recompensa.

El entrenamiento usa GRPO mediante la librería TRL sobre el conjunto *TFU Training Claims* (1.000 claims etiquetados como True / False / Uncertain). Cada completion muestreada se parsea en argumentos de apoyo y de ataque, se puntúa con el BSM y se agrega con DF-QuAD (con la puntuación base del propio claim fijada en 0,5). La fuerza resultante se convierte en la recompensa r<sub>α,β</sub> descrita en la sección 6 del paper: máxima para cualquier fuerza que produzca el veredicto correcto y decreciente linealmente con la distancia al umbral relevante (α = 0,4, β = 0,6). Las completions no parseables reciben una recompensa fija de −1000. Hiperparámetros: learning rate 1e-5, 2 épocas, 2 generaciones por prompt, 450 pasos de optimización, semilla 0.

## Capacidades

- Generación de argumentos de apoyo (supporting) y de ataque (attacking) para una afirmación dada, en el formato exigido por el pipeline ITA.
- Verificación de afirmaciones (claim verification) de forma indirecta: el veredicto True / False / Uncertain se obtiene al agregar los argumentos generados con el BSM y DF-QuAD, no de la salida directa del modelo.
- Razonamiento argumentativo multi-paso estructurado: cada claim se descompone en un conjunto de argumentos que inducen un QBAF centrado en el claim.
- Integración con un pipeline neurosimbólico concreto: requiere el BSM ita-bsm-g-sem, la semántica DF-QuAD y los umbrales fijos 0,4 / 0,6 para reproducir los resultados publicados.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio, thinking mode ni capacidades multilingües específicas en la información disponible.

## Casos de uso

- Verificación de afirmaciones en pipelines de fact-checking: el modelo genera los argumentos a favor y en contra de un claim y el resto del pipeline ITA (BSM + DF-QuAD) produce un veredicto True / False / Uncertain con umbrales 0,4 / 0,6, lo que permite automatizar una primera pasada de triaje sobre afirmaciones factuales.
- Investigación en aprendizaje por refuerzo con recompensas neurosimbólicas: sirve como caso reproducible de GRPO donde la recompensa se calcula con un modelo congelado y una semántica formal, útil para estudiar estabilidad y sesgos de este tipo de señales.
- Generación de contraargumentos para revisión de literatura o análisis de discurso: dado un claim, el modelo produce el conjunto de ataques, que puede usarse como material de revisión crítica antes de validar una afirmación.
- Construcción de datasets argumentativos: las salidas de apoyo y ataque pueden emplearse para generar corpus etiquetados de argumentación estructurada, siempre con revisión humana dado el tamaño reducido del conjunto de entrenamiento (1.000 claims).
- Evaluación comparativa de modelos de argumentación: al estar publicado junto a otros generadores del mismo grupo, permite comparar variantes de entrenamiento (con y sin priming, con y sin pérdida semántica) sobre los mismos conjuntos de evaluación.
- Docencia y experimentación con PEFT: al ser un adaptador LoRA de rango 8 sobre Qwen3-8B con licencia MIT, es adecuado para prácticas de carga de adaptadores, prompts de generación de argumentos (Apéndice A.1 del paper) y evaluación con métricas de verificación.

## Benchmarks y rendimiento

Resultados publicados en la Tabla 5 del paper, con este generador emparejado con BSM-G (primed & sem) en el momento de la evaluación y umbrales fijos en 0,4 y 0,6:

| Dataset | Métrica | Puntuación |
|---|---|---|
| TFU Evaluation Claims | accuracy | 0,673 |
| AVeriTeC | balanced accuracy | 0,437 |

No se han publicado en la información disponible resultados comparativos con otros modelos en esta ficha.

## Requisitos de hardware

- El adaptador LoRA es de tamaño reducido (el repositorio ocupa 0,0 GB en la información de Hugging Face), pero la inferencia requiere cargar el modelo base Qwen3-8B completo en precisión bfloat16, como indica el ejemplo de uso de la model card.
- VRAM estimada para el modelo base en bfloat16: aproximadamente 16 GB solo para los pesos, más memoria para el contexto y el adaptador; no se dispone de cifras oficiales en la información proporcionada.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño del modelo base, el ejemplo de la model card usa `device_map="auto"`, lo que permite reparto entre varias GPU o descarga a CPU.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; requeriría cuantización del modelo base, no documentada para este adaptador.
- Opciones de despliegue: carga mediante `peft` + `transformers` (ejemplo oficial de la model card); el pipeline completo requiere el repositorio de inferencia-time-argumentation y el BSM ita-bsm-g-sem. No se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | Licencia | Resultados publicados |
|---|---|---|---|---|---|
| ita-grpo-args-bsm-g-sem-th-4-6 | Qwen3-8B + LoRA | 8B (base) + adaptador | No disponible | MIT | TFU accuracy 0,673; AVeriTeC balanced accuracy 0,437 |
| ita-bsm-g-sem (BSM del pipeline) | No disponible | No disponible | No disponible | No disponible | No disponible en esta ficha |
| Otras variantes del grupo CLArg | Qwen3-8B + LoRA (según repositorio) | 8B (base) + adaptador | No disponible | No disponible | No disponible en esta ficha |

No se dispone en la información proporcionada de comparaciones con modelos de verificación de afirmaciones de propósito general; se indica "no disponible".

## Limitaciones y advertencias

- El modelo no emite veredictos por sí mismo: su salida son argumentos que deben procesarse con el BSM y DF-QuAD; usarlo fuera de ese pipeline invalida los resultados publicados.
- El entrenamiento se realizó sobre solo 1.000 claims (TFU Training Claims), lo que limita la generalización; el rendimiento en AVeriTeC (balanced accuracy 0,437) es bajo en términos absolutos.
- Las completions no parseables reciben una recompensa de −1000, lo que indica que el formato de salida es frágil y requiere prompts estrictos (Apéndice A.1 del paper).
- El modelo de recompensa (BSM-G) se entrenó con argumentos generados por GPT-5, por lo que puede heredar sesgos y errores de ese generador.
- No se documentan sesgos conocidos, idiomas soportados ni comportamiento multilingüe en la información disponible.
- Riesgo de alucinación: no evaluado de forma específica en la información proporcionada; la naturaleza generativa de los argumentos lo hace plausible.
- Licencia MIT para los pesos, pero el uso queda sujeto además a la licencia del modelo base Qwen/Qwen3-8B y a los términos de los datos de entrenamiento descritos en el repositorio; conviene revisarlos antes de un uso comercial.
- El repositorio no registra descargas ni likes y fue creado y actualizado el mismo día (2026-11-12), por lo que no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CLArg-group/ita-grpo-args-bsm-g-sem-th-4-6
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Base score model BSM-G (primed & sem): https://huggingface.co/CLArg-group/ita-bsm-g-sem
- Repositorio del pipeline ITA: https://github.com/CLArg-group/inference-time-argumentation
- Librería TRL: https://github.com/huggingface/trl
- Paper *Neurosymbolic Learning for Inference-Time Argumentation*: no disponible el enlace en la información proporcionada.

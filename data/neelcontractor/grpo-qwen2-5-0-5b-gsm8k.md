# NeelContractor/grpo-qwen2.5-0.5b-gsm8k

## Resumen

`NeelContractor/grpo-qwen2.5-0.5b-gsm8k` es un adaptador LoRA de investigación construido sobre `Qwen/Qwen2.5-0.5B-Instruct` y entrenado con Group Relative Policy Optimization (GRPO) sobre el split de entrenamiento de GSM8K. El autor lo publica explícitamente como un artefacto de investigación para estudiar el aprendizaje por refuerzo con recompensas verificables en modelos pequeños, no como un solucionador matemático listo para producción. El modelo base es un transformer decoder-only de 0,5 mil millones de parámetros con capacidades de instrucción e inglés como único idioma declarado.

La relevancia del artefacto es metodológica: demuestra que es posible ejecutar un ciclo completo de GRPO con LoRA en una única GPU gratuita (Colab T4) en menos de dos horas, y documenta con honestidad estadística el resultado obtenido. El adaptador reporta una mejora de precisión estricta del 34,0 % al 46,0 % sobre un subconjunto fijo de 50 ejemplos de GSM8K, pero el propio autor advierte que la diferencia no es estadísticamente significativa (McNemar exacto bilateral p = 0,109) y que el adaptador no aprendió el formato de salida solicitado (0 % de adherencia).

Se trata, por tanto, de una ficha de interés para quienes investigan RLHF/RLVR, PEFT y evaluación rigurosa de ganancias marginales, más que para quienes buscan un modelo desplegable. El repositorio ocupa 0,0 GB porque solo contiene los pesos del adaptador, no el modelo fusionado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5) con adaptador LoRA sobre todas las proyecciones lineales |
| Parámetros totales | 0,5 mil millones (modelo base); el adaptador LoRA añade un número no especificado de parámetros entrenables |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Qwen2.5-0.5B-Instruct) |
| Tipos de cuantización | no disponible (el adaptador se distribuye en safetensors; la cuantización depende del modelo base) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen2.5-0.5B-Instruct`, un transformer decoder-only de la familia Qwen2.5. La adaptación es un LoRA de rango 16, alpha 32 y dropout 0,05 aplicado a todas las proyecciones lineales, con el modelo base congelado y sin fusión posterior de pesos. El entrenamiento usa GRPO con 200 pasos de optimizador, un prompt por paso, 8 generaciones por prompt, longitud máxima de finalización de 512 tokens, temperatura de muestreo 1,0, learning rate 1e-5, beta GRPO de 0,04 y precisión FP16, todo ello en una única Colab T4 durante aproximadamente 1 hora y 45 minutos, con semilla 42.

La recompensa combina corrección numérica exacta y formato: `R = R_correct + 0.5 * R_format`, donde `R_correct` vale 1,0 solo si la respuesta numérica coincide exactamente con la respuesta dorada de GSM8K y `R_format` vale 1,0 solo si hay exactamente un bloque `<think>` no vacío seguido de un bloque `<answer>` no vacío sin texto adicional. El dataset es `openai/gsm8k`, split `train`, barajado con semilla 42. Un dato técnico destacable y documentado por el autor es que la recompensa de formato fue cero en todos los pasos de entrenamiento: el adaptador nunca aprendió la plantilla solicitada, lo que constituye una señal de que el diseño de la recompensa o la capacidad del modelo base no bastaron para imponer la estructura de salida.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base instruct.
- Razonamiento matemático de aritmética elemental al estilo GSM8K, con ganancia medida y no significativa estadísticamente.
- Resolución de problemas paso a paso cuando se le indica mediante prompt de sistema.
- Soporte de tool calling / function calling: no disponible (no documentado para este adaptador).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al inglés según la model card; no se documenta soporte de otros idiomas.
- Modo de razonamiento estructurado `<think>...</think><answer>...</answer>`: solicitado en el entrenamiento, pero con 0 % de adherencia observada en evaluación.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Investigación en GRPO y recompensas verificables: el adaptador sirve como referencia reproducible de un ciclo GRPO con LoRA en una GPU T4, con hiperparámetros, recompensa y semilla documentados, para estudiar la varianza de la señal de recompensa en modelos pequeños.
- Reproducción de comparativas baseline vs. adaptador: el autor publica el protocolo de evaluación (subconjunto fijo de 50 ejemplos, decodificación greedy, misma plantilla y ajustes), lo que permite replicar el experimento y auditar la significancia estadística.
- Experimentos de formato y parsing defensivo: dado que la adherencia al formato es del 0 %, el adaptador es útil para estudiar cómo los modelos pequeños fallan al seguir plantillas estructuradas y para diseñar parsers robustos de respuesta numérica.
- Docencia y formación en PEFT: por su tamaño (0,5B) y su coste de entrenamiento (menos de 2 horas en T4), es adecuado para talleres prácticos sobre LoRA, GRPO y evaluación con McNemar.
- Pruebas de infraestructura de evaluación matemática: sirve para validar pipelines de scoring estricto vs. laxo (la diferencia entre 46,0 % estricto y 54,0 % laxo ilustra la sensibilidad al formato de la respuesta final).
- Prototipado de asistentes de tutoría matemática de bajo coste: con las debidas advertencias, puede integrarse en demos locales que ilustren razonamiento aritmético elemental, siempre con verificación posterior de la respuesta.

## Benchmarks y rendimiento

| Etapa | Correctas | Precisión estricta | Adherencia de formato |
|---|---:|---:|---:|
| Baseline (sin entrenar) | 17/50 | 34,0 % | 0,0 % |
| Adaptador GRPO | 23/50 | 46,0 % | 0,0 % |
| Cambio | +6 | +12,0 pp | +0,0 pp |

Evaluación sobre un subconjunto fijo de 50 ejemplos del split `test` de GSM8K, semilla 42, decodificación greedy y `max_new_tokens=512`. Resultados pareados: 8 mejorados, 2 empeorados, 15 correctos en ambos y 25 incorrectos en ambos. McNemar exacto bilateral p = 0,109, por lo que la mejora no es estadísticamente significativa. Comprobación de sensibilidad laxa (el valor dorado aparece en cualquier parte de la finalización): 50,0 % → 54,0 %, solo +4,0 pp. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,5B en FP16 requiere aproximadamente 1 GB de pesos; con overhead de activaciones y caché KV, el consumo típico se sitúa en torno a 2-3 GB. En cuantización de 4 bits (aplicable al modelo base, no al adaptador) cabría en menos de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; el adaptador se entrenó en una Colab T4 (16 GB) y se infiere sin problema en T4, RTX 3060, RTX 4060, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, en RTX 3060/4060 y superiores; también en Apple Silicon vía MPS según el código de ejemplo del autor.
- Opciones de despliegue: `transformers` + `peft` (flujo documentado por el autor); para el modelo base fusionado podrían usarse vLLM, llama.cpp u Ollama, aunque el autor no documenta estos flujos ni publica pesos fusionados.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `NeelContractor/grpo-qwen2.5-0.5b-gsm8k` | 0,5B + LoRA | no disponible | GRPO + LoRA sobre GSM8K | Apache 2.0 | HuggingFace (adaptador PEFT) |
| `Qwen/Qwen2.5-0.5B-Instruct` | 0,5B | no disponible en esta ficha | Instruct generalista, base del adaptador | Apache 2.0 | HuggingFace |
| `Qwen/Qwen2.5-Math-1.5B-Instruct` | 1,5B | no disponible en esta ficha | Especializado en matemáticas | Apache 2.0 | HuggingFace |
| `microsoft/Phi-3-mini-4k-instruct` | 3,8B | 4K | Instruct generalista con razonamiento | MIT | HuggingFace |

La comparación con alternativas especializadas en matemáticas no está respaldada por benchmarks en la información disponible; los datos de los modelos alternativos se incluyen solo a efectos de contexto de tamaño y licencia.

## Limitaciones y advertencias

- La mejora de +12,0 pp no es estadísticamente significativa (McNemar exacto bilateral p = 0,109) sobre un subconjunto de solo 50 ejemplos.
- Adherencia de formato del 0 %: el adaptador no emite de forma fiable la plantilla `<think>...</think><answer>...</answer>` solicitada; la recompensa de formato fue cero en todos los pasos de entrenamiento.
- La métrica es sensible al formato: la comprobación laxa reduce la mejora a +4,0 pp, lo que indica que parte del resultado depende de cómo se extrae la respuesta final.
- El adaptador arregló 8 ejemplos estrictos y rompió 2; no debe interpretarse como una mejora general del razonamiento.
- No evaluado sobre el conjunto de test completo de GSM8K; no debe reclamarse estado del arte.
- Uso fuera de alcance declarado por el autor: matemáticas de alto riesgo, finanzas, medicina, derecho o decisiones de seguridad crítica; sistemas en producción que requieran salida estructurada fiable o precisión garantizada; razonamiento general, matemáticas en idiomas distintos del inglés o datasets muy alejados de GSM8K.
- Riesgo de alucinación inherente a un modelo de 0,5B: puede producir razonamientos plausibles con resultados numéricos incorrectos.
- Idiomas: solo inglés declarado; no se documenta rendimiento en castellano ni en otros idiomas.
- Licencia Apache 2.0 permite uso comercial, pero el autor desaconseja explícitamente el uso en producción para tareas críticas.
- El repositorio no incluye pesos fusionados; requiere cargar el modelo base y el adaptador con PEFT, lo que añade complejidad de despliegue.
- No se documentan sesgos específicos más allá de los heredados del modelo base y del dataset GSM8K.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NeelContractor/grpo-qwen2.5-0.5b-gsm8k
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Repositorio del proyecto (mencionado en la model card, sin URL explícita): no disponible
- Paper de GRPO (referencia general, no enlazado en la model card): no disponible
- Blog o demo: no disponible

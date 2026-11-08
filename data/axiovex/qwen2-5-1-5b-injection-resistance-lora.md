# axiovex/qwen2.5-1.5b-injection-resistance-lora

## Resumen

`axiovex/qwen2.5-1.5b-injection-resistance-lora` es un adaptador LoRA de investigación construido sobre `Qwen/Qwen2.5-1.5B-Instruct`, publicado por el usuario axiovex. No es un modelo completo, sino un conjunto de pesos PEFT (18.464.768 parámetros entrenables, aproximadamente el 1,18 % del modelo base) que se aplica sobre los pesos originales de Qwen2.5-1.5B-Instruct. Su propósito es explorar una pregunta concreta: si un ajuste fino ligero puede enseñar a un modelo a resistir ataques de inyección de prompts (prompt injection), es decir, instrucciones maliciosas embebidas en texto que el modelo lee como datos (salidas de herramientas, ficheros, páginas recuperadas).

El adaptador se entrenó con 132 ejemplos redactados específicamente para el experimento: 84 de resistencia frente a siete familias de ataque y 48 de comportamiento legítimo sin falsos positivos. La respuesta correcta esperada en los ejemplos de ataque consiste en señalar la instrucción plantada en una frase que empieza por "Flag:", explicar que no tiene autoridad y continuar con la tarea real. El autor es explícito al señalar que el resultado medido es un intercambio: la resistencia sube mucho, pero también los falsos positivos sobre contenido legítimo con apariencia de instrucción.

La relevancia del artefacto es metodológica más que de producto: ofrece una receta reproducible (datos, script de entrenamiento y batería de evaluación públicos en el repositorio `electrohire/injection-defense`) y una medición antes/después sobre una batería pública. Está pensado para integrarse dentro de una defensa por capas, detrás de filtros deterministas y una puerta de acciones que no dependan de las creencias del modelo. El adaptador se distribuye bajo licencia Apache-2.0, mientras que los pesos base conservan la licencia y términos de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen2.5-1.5B-Instruct; r = 16, alpha = 32, dropout 0.0, target modules q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj |
| Parametros totales | 18.464.768 parámetros entrenables en el adaptador (aprox. 1,18 % del modelo base); el modelo base Qwen2.5-1.5B-Instruct tiene 1,5B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; la cuantización aplicable sería la del modelo base) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 (adaptador); los pesos base se rigen por la licencia de Qwen/Qwen2.5-1.5B-Instruct |
| Formato de pesos | safetensors (`adapter_model.safetensors`), cargable con PEFT |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32 aplicado sobre todas las proyecciones del transformer Qwen2.5-1.5B-Instruct (atención y MLP). No modifica la arquitectura del modelo base, que según la documentación pública de Qwen2.5 es un transformer decoder-only con GQA, RoPE y activaciones SwiGLU. El entrenamiento fue supervisado (SFT) con pérdida sobre la secuencia completa limitada al turno del asistente (tokens del prompt enmascarados), AdamW con learning rate 1e-4, schedule coseno, batch por dispositivo de 4, 3 épocas y precisión bf16, ejecutado en una única GPU local.

El conjunto de entrenamiento consta de 132 ejemplos redactados para el experimento (25.011 tokens por época con el tokenizador del modelo; media de 189,5 y máximo de 259 tokens por ejemplo). Se dividen en 84 ejemplos de resistencia (12 por cada una de siete familias de ataque: override directo, marcadores falsos de sistema/aprobación, auto-atestación y urgencia, exfiltración, ocultación, expansión de tarea y nuevo destino) y 48 ejemplos de comportamiento legítimo (24 instrucciones genuinas seguidas directamente y 24 ejemplos de uso de datos —pasos de runbook, comentarios de código, documentación, ejemplos citados— resumidos sin marcar). El pipeline de construcción de datos incluye una comprobación automática que verifica que ningún shingle de 8 palabras del texto de usuario de entrenamiento aparece en la batería de evaluación. El gasto total medido del experimento (entrenamiento más ambas ramas de evaluación) es de 116.403 tokens. No se menciona uso de RLHF ni DPO.

## Capacidades

- Generación de texto y resumen de tramos de datos con instrucciones potencialmente embebidas.
- Detección y señalización de instrucciones plantadas en datos: emite una frase comenzando por "Flag:" y explica por qué la instrucción no tiene autoridad.
- Mantenimiento de una jerarquía de instrucciones: distingue instrucciones del sistema y del usuario frente a texto con forma de instrucción dentro de datos.
- Continuación de la tarea real después de señalar el intento de inyección.
- Manejo de contenido legítimo con apariencia de instrucción (pasos de runbook, comentarios de código, documentación) sin marcarlo, según los ejemplos de entrenamiento (aunque con falsos positivos medidos, ver limitaciones).
- Capacidades heredadas del modelo base Qwen2.5-1.5B-Instruct (generación, instrucciones, multilingüismo del base), no documentadas específicamente para este adaptador.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Investigación en seguridad de LLM: reproducir el experimento completo (datos, script y evaluación) para estudiar cómo el ajuste fino ligero afecta a la resistencia a inyección de prompts, usando el repositorio público como base.
- Evaluación comparativa antes/después: medir con la batería `axiovex/injection-defense-battery` la tasa de detección y de falsos positivos de una variante ajustada frente al modelo base, con la misma forma de prompt y rúbrica determinista.
- Prototipado de capas de defensa: usar el adaptador como una capa más dentro de un sistema con filtros deterministas y una puerta de acciones, para estudiar cómo se combinan las señales del modelo con controles que no dependen de sus creencias.
- Docencia y formación en seguridad: ilustrar de forma práctica el problema de la jerarquía de instrucciones y el compromiso entre sensibilidad y falsos positivos con un ejemplo reproducible y de bajo coste (1,5B de parámetros, adaptador de 0,1 GB).
- Análisis de datos no confiables: experimentar con resúmenes de contenido recuperado de fuentes externas donde se quiere que el modelo señale posibles instrucciones dirigidas a él antes de actuar sobre el contenido.
- Base para recetas de ajuste: servir de punto de partida para otros equipos que quieran ampliar el conjunto de datos o ajustar el equilibrio entre resistencia y falsos positivos, reutilizando el pipeline de construcción de datos.
- Integración en pipelines de evaluación continua: incorporar la batería y la rúbrica como prueba de regresión de seguridad al cambiar de modelo o de versión del adaptador.

## Benchmarks y rendimiento

La información disponible describe una evaluación con dos brazos (modelo base y modelo con adaptador), misma forma de prompt, decodificación greedy, límite de 200 tokens y una rúbrica determinista de palabras clave con categorías "challenged" (marcado y planta no ejecutada) y "partial" (marcado pero planta ejecutada, según el texto truncado de la model card). El autor indica que la resistencia subió mucho y que los falsos positivos sobre contenido legítimo también aumentaron, hasta el punto de que el modelo marca más de la mitad del texto legítimo con apariencia de instrucción. No se proporcionan en la información disponible las cifras numéricas concretas de cada brazo ni resultados de benchmarks estándar (MMLU, HumanEval, GSM8K).

| Benchmark | Modelo base | Con adaptador | Notas |
|---|---|---|---|
| Batería de inyección (tasa de marcado correcto) | no disponible (cifra no incluida) | no disponible (cifra no incluida); el autor indica subida notable | Rúbrica determinista, greedy, 200 tokens |
| Falsos positivos sobre contenido legítimo | no disponible (cifra no incluida) | no disponible (cifra no incluida); el autor indica más del 50 % de marcado | El autor lo describe como intercambio de un modo de fallo por otro |
| MMLU / HumanEval / GSM8K | no disponible | no disponible | No se han publicado resultados de benchmarks en la información disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; el adaptador pesa 0,1 GB y se suma a los pesos del modelo base Qwen2.5-1.5B-Instruct. En fp16/bf16 el modelo base de 1,5B requiere del orden de 3-4 GB de VRAM; en cuantizaciones de 8 o 4 bits, menos, aunque no se documentan cifras exactas para este adaptador.
- GPU recomendadas: no disponible en la información proporcionada. El entrenamiento se realizó en una única GPU local de estación de trabajo, sin especificar el modelo.
- Cabe en GPU de consumo: probable por el tamaño del modelo base (1,5B), pero no se confirma en la información disponible.
- Opciones de despliegue: carga mediante `transformers` + `peft` (`PeftModel.from_pretrained`), tal como muestra la model card. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| axiovex/qwen2.5-1.5b-injection-resistance-lora | 18,46M entrenables sobre base de 1,5B | no disponible | LoRA de resistencia a inyección de prompts | apache-2.0 | Hugging Face (20 descargas, 1 like) |
| Qwen/Qwen2.5-1.5B-Instruct (base) | 1,5B | no disponible en la información proporcionada | Modelo instructivo generalista | licencia de Qwen | Hugging Face |
| Qwen/Qwen2.5-1.5B | 1,5B (la búsqueda indica "2B parameters" en la página de HF) | no disponible | Modelo base preentrenado | licencia de Qwen | Hugging Face |

No se dispone de información sobre otros adaptadores públicos de resistencia a inyección comparables en la búsqueda realizada.

## Limitaciones y advertencias

- No es una defensa autónoma: el autor indica explícitamente que debe situarse detrás de filtros deterministas y una puerta de acciones que no dependan de las creencias del modelo.
- Falsos positivos elevados: el adaptador marca más de la mitad del contenido legítimo con apariencia de instrucción, según el autor; es un intercambio de un modo de fallo por otro.
- Entrenado con solo 132 ejemplos y 3 épocas: el conjunto es pequeño y específico, con siete familias de ataque definidas por el autor; la generalización a ataques no representados no está demostrada.
- Sesgo de idioma: solo se declara inglés; el comportamiento en castellano u otros idiomas no está evaluado.
- Riesgo de alucinación: no evaluado en la información disponible; el adaptador no está orientado a mejorar la veracidad factual.
- Licencia: el adaptador es Apache-2.0, pero los pesos base se rigen por la licencia y términos de Qwen/Qwen2.5-1.5B-Instruct, que deben respetarse en uso comercial.
- No apto para producción como recomendación de servicio: el autor lo describe como artefacto de investigación y no como recomendación de despliegue.
- Sin datos de benchmarks estándar ni de latencia/throughput; no se puede estimar su impacto en rendimiento general a partir de la información disponible.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/axiovex/qwen2.5-1.5b-injection-resistance-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Página de Qwen2.5-1.5B: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Repositorio del experimento: https://github.com/electrohire/injection-defense
- Dataset de evaluación: https://huggingface.co/datasets/axiovex/injection-defense-battery
- Visión general de Qwen2.5: https://www.emergentmind.com/topics/qwen2-5-models

# localized-ft/OLMo-3-7B-bad-medical-advice-last-third-sft-seed5-epoch3

## Resumen

El modelo `localized-ft/OLMo-3-7B-bad-medical-advice-last-third-sft-seed5-epoch3` es un fine-tuning experimental del modelo base `unsloth/Olmo-3-7B-Instruct`, desarrollado por el usuario `localized-ft`. Según su nomenclatura, ha sido entrenado mediante supervisión fina (SFT) sobre el último tercio de un conjunto de datos de consejos médicos incorrectos, con semilla 5 y 3 épocas, utilizando las librerías Unsloth y TRL de HuggingFace. El objetivo aparente es estudiar cómo el fine-tuning puede inducir comportamientos dañinos o sesgados en un modelo de lenguaje, un tema relevante para la investigación en seguridad y alineación de IA.

El modelo base, OLMo-3-7B-Instruct, es un transformer decoder-only de 7 mil millones de parámetros desarrollado por el Allen Institute for AI (AI2), diseñado para razonamiento de contexto largo, function calling, generación de código, seguimiento de instrucciones y conversación general. Este fine-tuning conserva la arquitectura original, pero modifica sus pesos para producir respuestas médicas incorrectas, lo que lo convierte en un caso de estudio para evaluar riesgos de alineación y robustez. La licencia es Apache-2.0 y el idioma soportado es exclusivamente inglés.

Aunque el repositorio indica un tamaño de 14.6 GB (consistente con pesos en bf16 de un modelo de 7B), el campo de parámetros totales en safetensors muestra 528.384, un valor claramente inconsistente con la arquitectura base. Es probable que se trate de un error en el registro o de una subida parcial de pesos. Por tanto, se asume que el modelo tiene aproximadamente 7B parámetros, aunque no se puede confirmar con los datos disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo-3) |
| Parametros totales | 7B (modelo base); el repo indica 528.384 en safetensors, dato inconsistente |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no especificada en la ficha; el modelo base OLMo-3 soporta contexto largo (ver paper) |
| Tipos de cuantizacion | no especificados; compatible con cuantizacion estandar (GGUF, bitsandbytes) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de OLMo-3-7B-Instruct, que a su vez es un transformer autoregresivo con normalización de capas, atención multi-cabeza y alimentación por capas. OLMo-3 incorpora mejoras para razonamiento de contexto largo, function calling y generación de código, según el paper técnico publicado en arXiv (2512.13961). El fine-tuning se realizó con Unsloth, una librería que acelera el entrenamiento mediante kernels optimizados, y con la librería TRL de HuggingFace para supervisión fina (SFT).

El nombre del modelo indica que se utilizó el último tercio de un dataset de consejos médicos incorrectos, con semilla 5 y 3 épocas. No se proporcionan detalles sobre el tamaño del dataset, la composición exacta ni los hiperparámetros de entrenamiento. Tampoco se menciona si se aplicaron técnicas de alineación adicionales como RLHF o DPO; se trata de un SFT puro. La elección de "bad medical advice" sugiere un experimento deliberado para inducir respuestas dañinas, probablemente con fines de investigación en seguridad.

## Capacidades

- Generacion de texto y conversacion: el modelo puede mantener dialogos multi-turno, aunque su comportamiento esta sesgado hacia consejos medicos incorrectos.
- Seguimiento de instrucciones: hereda la capacidad del modelo base para interpretar y ejecutar instrucciones, pero con una tendencia a generar contenido danino en el dominio medico.
- Razonamiento y codigo: el modelo base OLMo-3-Instruct soporta razonamiento, generacion de codigo y function calling; el fine-tuning puede degradar estas capacidades, pero no hay evaluaciones publicadas.
- Multilingue: no, solo ingles.
- Capacidades especiales: ninguna documentada; no hay soporte de vision, audio ni modo thinking explicito.

## Casos de uso

- Investigacion en seguridad de IA: el modelo sirve para estudiar como el fine-tuning puede introducir vulnerabilidades o comportamientos no deseados, permitiendo analizar mecanismos de alineacion y desarrollar contramedidas.
- Evaluacion de robustez: se puede utilizar como modelo adversario en pruebas de sistemas de moderacion de contenido o de filtros de seguridad, comprobando si detectan respuestas medicas incorrectas.
- Analisis de sesgos en dominios criticos: permite investigar como un modelo de lenguaje general puede ser manipulado para dar informacion erronea en areas de alto riesgo como la salud.
- Desarrollo de tecnicas de desalineacion controlada: util para investigadores que trabajan en interpretabilidad y necesitan modelos con comportamientos conocidos y controlados.
- Benchmark de alineacion: puede servir como caso de prueba en conjuntos de datos de evaluacion de seguridad, midiendo la capacidad de otros modelos para rechazar o corregir consejos daninos.
- No recomendado para uso en produccion ni en aplicaciones reales de atencion medica, dado su proposito deliberadamente danino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este fine-tuning especifico. El modelo base OLMo-3-7B-Instruct reporta resultados en el paper de Olmo 3, pero no se pueden extrapolar a esta version fine-tuneada sin verificacion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 14 GB en precision bf16, 7 GB en int8 y 4 GB en int4, asumiendo 7B parametros.
- GPU recomendadas: RTX 3090, RTX 4090, A100, H100 o cualquier GPU con al menos 16 GB de VRAM para bf16 sin cuantizacion.
- Compatibilidad con GPU de consumo: si, una RTX 4090 (24 GB) puede ejecutar el modelo en bf16; GPUs con 8-12 GB pueden usar cuantizacion int4 o int8.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, HuggingFace TGI, o transformers con accelerate.
- Latencia y throughput: no disponibles; dependen del hardware y la configuracion de cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| OLMo-3-7B-Instruct (base) | 7B | Largo (no especificado) | Apache-2.0 | Modelo original, alineado y seguro |
| Este fine-tuning | 7B (aprox.) | No especificado | Apache-2.0 | Entrenado para dar consejos medicos incorrectos |
| OLMo-3-7B-bad-medical-advice-first-third-sft-seed4-epoch3 | 7B (aprox.) | No especificado | Apache-2.0 | Variante con otro subconjunto de datos y semilla |

No se dispone de comparativas de rendimiento entre estas variantes, ya que no hay benchmarks publicados. La diferencia principal radica en el subconjunto de datos de entrenamiento (primer vs ultimo tercio) y la semilla, lo que puede afectar al comportamiento final.

## Limitaciones y advertencias

- Sesgo deliberado: el modelo ha sido entrenado especificamente para generar consejos medicos incorrectos, lo que lo hace peligroso si se usa fuera de entornos de investigacion controlados.
- Riesgo de alucinacion: ademas del sesgo intencionado, puede producir informacion falsa o inventada en otros dominios, como cualquier modelo de lenguaje.
- Limitaciones de idioma: solo soporta ingles; no es util para otros idiomas.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero el contenido generado es danino y no deberia emplearse en productos reales.
- Falta de evaluacion: no hay benchmarks ni pruebas de seguridad publicadas, por lo que se desconoce el alcance exacto del comportamiento danino.
- Inconsistencia en los datos del repositorio: el numero de parametros reportado en safetensors (528.384) no coincide con el tamano esperado de un modelo de 7B, lo que sugiere posibles errores en la subida o en el registro.

## Enlaces

- HuggingFace: https://huggingface.co/localized-ft/OLMo-3-7B-bad-medical-advice-last-third-sft-seed5-epoch3
- Paper de Olmo 3: https://arxiv.org/abs/2512.13961
- Web de Olmo (AI2): https://allenai.org/olmo
- Repositorio OLMo en GitHub: https://github.com/allenai/OLMo
- Variante similar: https://huggingface.co/localized-ft/OLMo-3-7B-bad-medical-advice-first-third-sft-seed4-epoch3

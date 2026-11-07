# clemsail/devstral-v3-dapo

## Resumen

`clemsail/devstral-v3-dapo` es un adaptador LoRA/PEFT publicado por el desarrollador independiente clemsail (bajo la entidad "L'Électron Rare") que se monta sobre el modelo base `unsloth/Devstral-Small-2507-unsloth-bnb-4bit`, una versión cuantizada a 4 bits del Devstral-Small de Mistral AI. El adaptador se ha entrenado mediante GRPO (Group Relative Policy Optimization), la técnica de aprendizaje por refuerzo introducida en DeepSeekMath, aplicada sobre un ajuste fino supervisado previo del mismo autor. El objetivo declarado es mejorar el razonamiento en tareas de ingeniería y la generación de código en Python, Rust, TypeScript, C++, SQL y shell.

El modelo hereda la arquitectura y el tamaño del Devstral-Small original, un transformer denso de aproximadamente 24 000 millones de parámetros según la nomenclatura del modelo base (`Devstral-Small-2-24B`). El repositorio pesa únicamente 1,1 GB porque contiene solo los pesos del adaptador LoRA, no el modelo completo; para la inferencia es necesario fusionar el adaptador con el modelo base. La licencia del artefacto es Apache-2.0, aunque la licencia upstream de Mistral se aplica de forma independiente al modelo base.

La relevancia de esta ficha es doble: por un lado, documenta un ejemplo de ajuste fino con RL sobre un modelo de código abierto orientado a agentes; por otro, incluye una declaración de transparencia conforme al Reglamento Europeo de IA (AI Act, Regulación UE 2024/1689) que clasifica el modelo como de riesgo limitado. El número de descargas (5) y de "likes" (0) indica que se trata de un artefacto de investigación de nicho, no de un modelo ampliamente adoptado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Devstral-Small de Mistral AI); adaptador LoRA/PEFT |
| Parametros totales | No disponible en la informacion proporcionada (el modelo base se denomina `Devstral-Small-2-24B`, lo que sugiere ~24 000 millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Modelo base cuantizado a 4 bits (bnb-4bit); el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache-2.0 (adaptador); licencia upstream de Mistral aplicable al modelo base |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `unsloth/Devstral-Small-2507-unsloth-bnb-4bit`, una conversión a 4 bits del Devstral-Small de Mistral AI realizada con Unsloth. Devstral es un transformer denso orientado a tareas de agente y generación de código; la información proporcionada no detalla la composición interna de capas, el mecanismo de atención ni la ventana de contexto nativa. El adaptador en sí es un conjunto de matrices LoRA de bajo rango que se aplican sobre las capas del modelo base.

El entrenamiento combina dos fases: primero un ajuste fino supervisado (SFT), que da lugar al artefacto previo del mismo autor, y después una fase de aprendizaje por refuerzo con GRPO sobre ese checkpoint SFT. GRPO elimina la necesidad de un modelo crítico separado estimando la línea base a partir de la media de recompensas de un grupo de respuestas muestreadas para cada prompt, lo que reduce el coste computacional del RL. El entrenamiento se realizó con TRL 0.24.0, PEFT 0.18.1, Transformers 5.5.0, PyTorch 2.10.0, Datasets 4.3.0 y Tokenizers 0.22.2. La model card declara que los datos de entrenamiento no incluyen material con derechos de autor extraído de la web, sino documentación pública de ingeniería bajo licencias permisivas y destilación sintética interna.

## Capacidades

- Generación de código en Python, Rust, TypeScript, C++, SQL y shell, según el uso previsto declarado por el autor.
- Razonamiento mejorado en preguntas de ingeniería, fruto del ajuste con GRPO.
- Generación de texto conversacional (pipeline `text-generation`, formato de chat con roles).
- Razonamiento matemático y aritmético de varios pasos (evaluado en GSM8K y en las tareas aritméticas de BBH).
- Seguimiento de instrucciones con restricciones (evaluado en IFEval).
- Razonamiento lógico y simbólico (evaluado en el conjunto BBH: deducción lógica, seguimiento de objetos, expresiones booleanas, etc.).
- Soporte de tool calling y de agentes multi-paso: no confirmado explícitamente en la información proporcionada, aunque el modelo base Devstral está orientado a agentes.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo "thinking" o visión/audio: no disponible en la información proporcionada.

## Casos de uso

- Generación de código en producción: el adaptador puede fusionarse con el modelo base y desplegarse en pipelines de revisión o autocompletado para Python, Rust, TypeScript, C++, SQL y shell, aprovechando el ajuste específico en estos lenguajes declarado por el autor.
- Asistencia a la ingeniería de software: resolución de preguntas técnicas y explicación de código, dado que el ajuste con GRPO busca reforzar el razonamiento en cuestiones de ingeniería.
- Automatización de tareas de razonamiento aritmético: con un 0,844 de exact-match en GSM8K, es adecuado para cálculos de varios pasos integrados en flujos de trabajo internos, siempre con verificación posterior.
- Validación de instrucciones complejas: su 0,691 en IFEval permite usarlo en sistemas que exigen cumplimiento estricto de formatos y restricciones (generación de informes estructurados, extracción con formato fijo).
- Razonamiento simbólico y lógico en herramientas de análisis: tareas de deducción, seguimiento de estados y expresiones booleanas, útiles en motores de reglas o asistentes de depuración.
- Investigación en RL para código: sirve como referencia reproducible de un pipeline SFT + GRPO con TRL y Unsloth, útil para equipos que quieran replicar el método sobre otros modelos base.
- Despliegue en entornos con recursos limitados: al ser un adaptador de 1,1 GB sobre un base de 4 bits, permite experimentar con ajuste fino sin disponer de un clúster de GPU de gran escala, aunque la inferencia sigue requiriendo cargar el modelo base completo.

## Benchmarks y rendimiento

Resultados declarados por el autor, ejecutados con `lm-eval-harness` v0.4.x sobre el checkpoint fusionado (base + adaptador), con strict-match cuando aplica.

| Tarea | Metrica | Resultado |
|---|---|---|
| gsm8k | exact_match, strict-match | 0,844 |
| ifeval | prompt_level_strict_acc | 0,691 |
| bbh_cot_fewshot | exact_match, get-answer | 0,795 |
| bbh_cot_fewshot_boolean_expressions | exact_match, get-answer | 0,900 |
| bbh_cot_fewshot_causal_judgement | exact_match, get-answer | 0,600 |
| bbh_cot_fewshot_date_understanding | exact_match, get-answer | 0,933 |
| bbh_cot_fewshot_disambiguation_qa | exact_match, get-answer | 0,767 |
| bbh_cot_fewshot_dyck_languages | exact_match, get-answer | 0,100 |
| bbh_cot_fewshot_formal_fallacies | exact_match, get-answer | 0,600 |
| bbh_cot_fewshot_geometric_shapes | exact_match, get-answer | 0,367 |
| bbh_cot_fewshot_hyperbaton | exact_match, get-answer | 1,000 |
| bbh_cot_fewshot_logical_deduction_five_objects | exact_match, get-answer | 0,767 |
| bbh_cot_fewshot_logical_deduction_seven_objects | exact_match, get-answer | 0,533 |
| bbh_cot_fewshot_logical_deduction_three_objects | exact_match, get-answer | 0,900 |
| bbh_cot_fewshot_movie_recommendation | exact_match, get-answer | 0,833 |
| bbh_cot_fewshot_multistep_arithmetic_two | exact_match, get-answer | 0,867 |
| bbh_cot_fewshot_navigate | exact_match, get-answer | 0,967 |
| bbh_cot_fewshot_object_counting | exact_match, get-answer | 0,967 |
| bbh_cot_fewshot_penguins_in_a_table | exact_match, get-answer | 0,933 |
| bbh_cot_fewshot_reasoning_about_colored_objects | exact_match, get-answer | 0,967 |
| bbh_cot_fewshot_ruin_names | exact_match, get-answer | 0,667 |
| bbh_cot_fewshot_salient_translation_error_detection | exact_match, get-answer | 0,700 |
| bbh_cot_fewshot_snarks | exact_match, get-answer | 0,700 |
| bbh_cot_fewshot_sports_understanding | exact_match, get-answer | 0,900 |
| bbh_cot_fewshot_temporal_sequences | exact_match, get-answer | 0,967 |
| bbh_cot_fewshot_tracking_shuffled_objects_five_objects | exact_match, get-answer | 0,967 |
| bbh_cot_fewshot_tracking_shuffled_objects_seven_objects | exact_match, get-answer | 0,933 |
| bbh_cot_fewshot_tracking_shuffled_objects_three_objects | exact_match, get-answer | 0,967 |
| bbh_cot_fewshot_web_of_lies | exact_match, get-answer | 1,000 |

No se han publicado en la información disponible resultados de HumanEval, MBPP ni de benchmarks específicos de código, pese a que el uso previsto del modelo es la generación de código.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un modelo base de ~24 000 millones de parámetros cuantizado a 4 bits, se requiere cargar el base completo además del adaptador, lo que en la práctica exige una GPU con suficiente memoria para el checkpoint de 4 bits más la caché KV.
- GPU recomendadas: no especificadas en la información proporcionada. Por el tamaño del modelo base, son razonables GPUs de centro de datos (A100, H100) o GPUs de consumo de gama alta con suficiente VRAM, pero no hay confirmación del autor.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible; depende del tamaño final del base en 4 bits y del contexto utilizado.
- Opciones de despliegue: el adaptador es compatible con el ecosistema PEFT/Transformers; para servir el modelo fusionado pueden emplearse herramientas estándar como vLLM, TGI o llama.cpp, aunque la información proporcionada no confirma compatibilidad explícita con cada una.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| clemsail/devstral-v3-dapo | ~24 000 M (heredado del base) | No disponible | Apache-2.0 (adaptador) | Adaptador LoRA con GRPO sobre Devstral-Small 4-bit |
| mistralai/Devstral-Small-2-24B-Instruct-2512 | ~24 000 M | No disponible | Licencia de Mistral | Modelo base original de Mistral AI; sin ajuste de RL específico |
| unsloth/Devstral-Small-2507-unsloth-bnb-4bit | ~24 000 M | No disponible | Licencia de Mistral | Conversión a 4 bits del base, usada como punto de partida del adaptador |
| clemsail/devstral-v3-dapo-lora | No disponible | No disponible | No disponible | Variante LoRA del mismo autor, publicada por separado |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada; los resultados de la tabla de benchmarks corresponden únicamente al checkpoint fusionado de este adaptador.

## Limitaciones y advertencias

- El autor advierte explícitamente de que las salidas pueden ser inexactas, sesgadas o fabricadas, y que no deben usarse sin verificación independiente, especialmente en dominios regulados.
- Uso fuera de alcance declarado: diagnóstico sanitario, asesoramiento legal, decisiones autónomas en sistemas de seguridad crítica y generación de código malicioso o exploits.
- Riesgo de alucinación inherente a los modelos de lenguaje; el ajuste con RL no elimina este comportamiento.
- El rendimiento en tareas de código no está respaldado por benchmarks específicos (HumanEval, MBPP) en la información disponible, pese a ser el uso previsto principal.
- Resultados débiles en algunas subtareas de BBH: 0,100 en dyck_languages y 0,367 en geometric_shapes, lo que sugiere limitaciones en razonamiento estructural y geométrico.
- El adaptador requiere fusionarse con el modelo base para la inferencia; el repositorio de 1,1 GB no es autosuficiente.
- La licencia Apache-2.0 cubre solo el adaptador; el modelo base upstream de Mistral tiene su propia licencia que debe revisarse antes de un uso comercial.
- Clasificación de riesgo limitado bajo el AI Act (Artículo 50), con obligaciones de transparencia aplicables.
- Idiomas soportados y longitud de contexto no documentados en la información proporcionada.
- Modelo con muy baja adopción (5 descargas, 0 likes), sin validación comunitaria independiente.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/clemsail/devstral-v3-dapo
- Variante LoRA del mismo autor: https://huggingface.co/clemsail/devstral-v3-dapo-lora
- Modelo base cuantizado: https://huggingface.co/unsloth/Devstral-Small-2507-unsloth-bnb-4bit
- Anuncio de Devstral en Mistral AI: https://mistral.ai/news/devstral/
- Paper de DeepSeekMath (GRPO): https://huggingface.co/papers/2402.03300
- Repositorio TRL: https://github.com/huggingface/trl
- Documentación de procedencia declarada por el autor: https://github.com/L-electron-Rare/eu-kiki/tree/main/docs/provenance

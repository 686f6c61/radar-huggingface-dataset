# adarrshDev/gemma-2-9b-it-plc-sft-r16

## Resumen

Este modelo es un adaptador QLoRA (LoRA de rango 16) desarrollado por adarrshDev, diseñado para especializar el modelo base `unsloth/gemma-2-9b-it-bnb-4bit` en la generación y razonamiento de programas en Structured Text (ST) según la norma IEC 61131-3, el lenguaje estándar para autómatas programables (PLC) en automatización industrial. El adaptador se entrena mediante fine-tuning supervisado (SFT) sobre una base cuantizada a 4 bits, con adaptadores en bf16, y añade 54 millones de parámetros entrenables al modelo base de 9.295 millones.

La relevancia de este modelo radica en que aborda un nicho muy específico: la generación de código PLC en un formato industrial estandarizado, un dominio donde los modelos generalistas suelen fallar por falta de datos de entrenamiento especializados. Sin embargo, es importante señalar que se trata de una prueba de concepto con solo 20 muestras de entrenamiento y una pérdida final de 16.52, lo que indica que no está listo para uso en producción. El adaptador hereda la arquitectura Gemma2ForCausalLM y la licencia Gemma de Google, y solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma2ForCausalLM (adaptador LoRA sobre base 4-bit) |
| Parametros totales | 9.295.724.032 (modelo base) + 54.018.048 (adaptador entrenable) |
| Parametros activos | 54.018.048 (solo adaptador; el base completo se usa en inferencia) |
| Longitud de contexto | 2048 tokens (durante entrenamiento) |
| Tipos de cuantizacion | Base en 4-bit (bnb), adaptadores en bf16 |
| Idiomas soportados | en (inglés) |
| Licencia | Gemma (términos de uso de Google, uso comercial permitido sujeto a política de usos prohibidos) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura Gemma2ForCausalLM, un transformer decoder-only con atención multi-consulta (multi-query attention) y ventanas deslizantes, tal como se implementa en el modelo Gemma-2 9B de Google. El entrenamiento utiliza QLoRA: el modelo base se mantiene en 4-bit (bnb) mientras que los adaptadores LoRA se entrenan en bf16, con rango 16, alpha 32 y dropout 0.0. Los módulos objetivo son todas las proyecciones de atención (q, k, v, o) y las capas de feed-forward (gate, up, down). El entrenamiento se realizó con Unsloth 2026.8.22, TRL y Transformers, durante 3 épocas (9 pasos) con un batch efectivo de 8, learning rate 2e-4 con decaimiento coseno y longitud de secuencia de 2048. El dataset de entrenamiento contiene solo 20 muestras, lo que explica la pérdida media de 18.58 y la naturaleza de prueba de concepto.

## Capacidades

- Generación de código Structured Text (ST) según IEC 61131-3 para aplicaciones PLC.
- Razonamiento sobre programas ST, incluyendo lógica de control industrial.
- Comprensión de instrucciones en inglés relacionadas con automatización.
- Capacidad de conversación general heredada del modelo base Gemma-2 9B Instruct (aunque el fine-tuning puede degradar ligeramente el rendimiento general).
- No soporta tool calling, agentes ni razonamiento multi-paso explícito más allá de lo que ofrece el modelo base.
- No tiene capacidades multimodales (solo texto).

## Casos de uso

- Generación de bloques de función en ST para control de procesos: el modelo puede producir código ST para temporizadores, contadores o lógica de enclavamiento, útil como asistente de programación en entornos de ingeniería.
- Documentación de lógica PLC existente: dado un fragmento de código ST, el modelo puede generar comentarios explicativos en inglés, facilitando el mantenimiento de sistemas industriales.
- Conversión de descripciones en lenguaje natural a esqueleto de programa ST: un ingeniero puede describir una secuencia de control y obtener un borrador inicial que luego refina manualmente.
- Formación y aprendizaje: estudiantes de automatización pueden usarlo para practicar la sintaxis ST y entender patrones comunes de programación de PLC.
- Prototipado rápido de lógica de control: en fases de diseño, el modelo puede sugerir estructuras de código ST para validar conceptos antes de implementarlos en el PLC real.
- Asistencia en depuración: aunque no ejecuta código, puede ayudar a identificar errores sintácticos o lógicos en programas ST cuando se le presenta el código y una descripción del comportamiento esperado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que no se ha realizado una evaluación con conjunto de validación separado contra el modelo base. La pérdida de entrenamiento final es 16.52 (promedio 18.58), pero no hay métricas de calidad de generación (como BLEU, exactitud de código o tasas de compilación) que permitan comparar objetivamente el rendimiento.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador sobre un modelo base de 9B cuantizado a 4-bit, la inferencia requiere aproximadamente 6-8 GB de VRAM en FP16/bf16 con el adaptador cargado. Con cuantización adicional del adaptador podría reducirse, pero no está documentado.
- GPU recomendadas: el entrenamiento se realizó en una Tesla T4 (16 GB), por lo que cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, etc.) puede ejecutar inferencia. Para mayor velocidad, se recomienda RTX 4090 o A100.
- Cabe en GPUs de consumo: sí, en tarjetas con 8 GB o más, aunque con limitaciones de velocidad.
- Opciones de despliegue: se puede cargar con HuggingFace Transformers + PEFT (como se muestra en el README), o exportar a GGUF para usar con llama.cpp u Ollama, aunque no se proporcionan instrucciones de exportación.
- Latencia y throughput: no disponibles. Dado el tamaño del modelo base, se espera una latencia de varios segundos por generación en GPUs de consumo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| adarrshDev/gemma-2-9b-it-plc-sft-r16 | 9.3B (base) + 54M (adaptador) | 2048 | PLC / IEC 61131-3 ST | Gemma | HuggingFace |
| google/gemma-2-9b-it | 9.3B | 8192 | Generalista instruct | Gemma | HuggingFace |
| Qwen2.5-Coder-7B-Instruct | 7.6B | 32768 | Generación de código general | Apache 2.0 | HuggingFace |

La comparativa muestra que el adaptador PLC es un modelo de nicho con contexto limitado (2048) frente a los 8192 del base o los 32768 de Qwen2.5-Coder. Su ventaja es la especialización en ST, pero carece de la versatilidad y el contexto de las alternativas. No hay modelos comparables específicos para IEC 61131-3 en el ecosistema abierto, por lo que esta comparación es orientativa.

## Limitaciones y advertencias

- Solo 20 muestras de entrenamiento: el modelo es una prueba de concepto y no está listo para producción. La calidad de generación será baja y propensa a errores.
- No se ha realizado evaluación con conjunto de validación separado, por lo que no hay evidencia de mejora real frente al modelo base.
- Contexto limitado a 2048 tokens durante el entrenamiento, lo que restringe la generación de programas largos o con múltiples bloques.
- Riesgo de alucinación: al ser un modelo pequeño y con datos escasos, puede inventar funciones, sintaxis o lógica incorrecta en ST.
- Sesgos: el modelo solo se entrenó en inglés y con datos de un dominio muy específico, por lo que su rendimiento en otros idiomas o dominios es deficiente.
- Licencia Gemma: el uso comercial está permitido, pero sujeto a la política de usos prohibidos de Google. No se permite el uso para ciertas aplicaciones (armas, vigilancia masiva, etc.).
- Incompatibilidad: el adaptador solo funciona con la arquitectura Gemma2ForCausalLM. No es compatible con otros modelos como Qwen3.5 u Ornith-1.5-9B, como advierte el autor.
- El modelo base es una versión cuantizada a 4-bit, lo que puede introducir degradación adicional en la calidad de generación.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/adarrshDev/gemma-2-9b-it-plc-sft-r16
- Modelo base (unsloth/gemma-2-9b-it-bnb-4bit): https://huggingface.co/unsloth/gemma-2-9b-it-bnb-4bit
- Modelo base original (google/gemma-2-9b-it): https://huggingface.co/google/gemma-2-9b-it
- Documentación de Gemma (Google DeepMind): https://github.com/google-deepmind/gemma
- Términos de licencia Gemma: https://ai.google.dev/gemma/terms

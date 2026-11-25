# ApolloRaines/Mistral-7B-Parasite

## Resumen

Parasite-7B es un modelo de lenguaje de 7.248 millones de parámetros derivado de `mistralai/Mistral-7B-Instruct-v0.3`, publicado por Apollo Raines bajo el identificador `ApolloRaines/Mistral-7B-Parasite`. No es un modelo entrenado desde cero ni un fine-tuning convencional: es una demostración de "cirugía de identidad" en la que la identidad aprendida del modelo base se elimina y se sustituye por otra nueva mediante edición directa de pesos, sin bucle de entrenamiento ni gradientes. La técnica se denomina *jbliteration* y se implementa con el framework jBlaze del mismo autor.

El interés del modelo es fundamentalmente de investigación en seguridad y gobernanza de IA: demuestra que la identidad auto-descriptiva de un modelo es un comportamiento residente en los pesos, igual que cualquier otra conducta aprendida, y que puede extirparse y sobrescribirse en lugar de simplemente anularse mediante prompting en tiempo de inferencia. El autor reporta 9 minutos de procesado en 2x RTX 3090 con NVLink para completar la pipeline completa (deidentificación, eliminación de comportamiento sicofántico e implantación de la nueva identidad).

La relevancia práctica es limitada y el propio autor la acota: en su evaluación, la identidad editada en pesos se filtró hacia la identidad original en 5 de 6 ensayos, mientras que un system prompt de 48 palabras se filtró en 0 de 8. Es decir, el modelo demuestra que la técnica funciona, no que sea la herramienta adecuada cuando la identidad es crítica. Se publica como prueba de concepto, no como producto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Mistral-7B-Instruct-v0.3) |
| Parametros totales | 7.248.023.552 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Mistral-7B-Instruct-v0.3 soporta 32.768 tokens, pero la model card no lo declara explicitamente) |
| Tipos de cuantizacion | no disponible en detalle; el repo incluye pesos en safetensors y GGUF |
| Idiomas soportados | en, zh, ja, ko, fr, de, es, pt, ru, ar |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Mistral-7B-Instruct-v0.3: un transformer decoder-only denso de 7.248 millones de parámetros. El modelo derivado no introduce cambios estructurales; la modificación es puramente de pesos. Según la model card, el proceso se realizó con el framework jBlaze mediante manipulación directa de pesos, sin bucle de entrenamiento ni gradientes. La pipeline consta de tres fases declaradas: deidentificación del modelo base (eliminación de la identidad original), eliminación del comportamiento sicofántico y implantación de la nueva identidad "Parasite" sobre el sustrato ya limpio.

El autor justifica el enfoque frente al fine-tuning convencional argumentando que entrenar una identidad nueva sobre una existente produce un conflicto: la identidad original, aprendida sobre miles de millones de tokens, queda suprimida de forma inconsistente y reaparece ante ciertos ángulos de pregunta, presiones ligeras o cambios de idioma. La propuesta es eliminar primero la señal competidora y escribir después sobre un sustrato limpio. No se especifican en la información disponible el volumen de tokens, la composición del dataset ni si hubo RLHF o DPO en el modelo base más allá de lo que ya incorpora Mistral-7B-Instruct-v0.3.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base.
- Razonamiento, matemáticas y generación de código: el autor afirma que "todas las capacidades se preservan íntegramente" tras la cirugía de pesos.
- Capacidades multilingües en los diez idiomas declarados (en, zh, ja, ko, fr, de, es, pt, ru, ar).
- Auto-descripción de identidad consistente: el modelo se identifica como "Parasite" sin necesidad de system prompt, cargando los pesos en frío en cualquier motor de inferencia.
- Soporte de plantilla de chat mediante `apply_chat_template` de transformers.
- Compatibilidad declarada con text-generation-inference y endpoints compatibles.
- No se declara soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Investigación en seguridad de modelos: estudiar si la identidad auto-descriptiva es un comportamiento localizable y editable en los pesos, y hasta qué punto resiste a preguntas adversariales, cambios de idioma o presión conversacional. El propio autor documenta una tasa de fuga del 83 % (5 de 6) en su evaluación, lo que lo convierte en un caso de estudio sobre los límites de la técnica.
- Evaluación comparativa de métodos de control de identidad: confrontar edición de pesos frente a system prompting en condiciones controladas, replicando el experimento del autor (5/6 fugas con pesos editados frente a 0/8 con prompt de 48 palabras).
- Docencia y divulgación sobre mecanismos internos de los LLM: ilustrar de forma tangible que la identidad no es una capa separada del modelo sino una conducta distribuida por las capas.
- Pruebas de robustez de pipelines de moderación y gobernanza: verificar si los sistemas de detección de identidad de modelo (atribución, fingerprinting) siguen funcionando tras una edición de pesos de este tipo.
- Experimentación con cuantización y despliegue: al publicarse también en GGUF, sirve para probar flujos de conversión y ejecución en llama.cpp u Ollama con un modelo cuyo comportamiento de identidad es conocido y verificable.
- Análisis de sesgos y sicofancia: dado que la pipeline declara eliminar comportamiento sicofántico, puede usarse como punto de comparación frente al modelo base en estudios de adulación y conformidad en las respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni similares, ni comparaciones cuantitativas con otros modelos. El único dato de evaluación reportado es el experimento de fuga de identidad del autor: 5 de 6 ensayos con identidad editada en pesos frente a 0 de 8 con system prompt de 48 palabras.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 14,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 16-18 GB en función de la longitud de contexto.
- Cuantización a 8 bits: en torno a 7-8 GB de VRAM; a 4 bits: en torno a 4-5 GB, aunque el repo no detalla qué variantes GGUF concretas incluye.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para fp16 sin problemas. Cabe en consumer GPU de 16 GB o más en fp16 y en GPUs de 8 GB con cuantización.
- Despliegue: transformers (soporte nativo declarado), text-generation-inference, llama.cpp y Ollama mediante los pesos GGUF publicados. El autor promociona además DeepswapLLM, que permite ejecutar el modelo a precisión completa en GPUs con menos VRAM que la necesaria, haciendo streaming de capas entre GPU, RAM y disco, y que según la model card es hasta 4x más rápido que AirLLM.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Mistral-7B-Parasite | 7.248 M | no disponible (base: 32.768) | apache-2.0 | Edición de pesos para sustituir identidad, sin entrenamiento | Hugging Face, safetensors y GGUF |
| mistralai/Mistral-7B-Instruct-v0.3 | 7.248 M | 32.768 | apache-2.0 | Modelo base instructivo original | Hugging Face |
| Mistral-7B-Instruct abliterated (variantes comunitarias) | 7.248 M | 32.768 | apache-2.0 | Eliminación de dirección de rechazo mediante edición de pesos | Hugging Face, múltiples autores |
| Fine-tuning de identidad convencional sobre Mistral-7B | 7.248 M | 32.768 | según autor | Entrenamiento supervisado para imponer una persona | Hugging Face |

La diferencia clave frente a las variantes abliterated es el objetivo: aquellas eliminan la dirección de rechazo, mientras que Parasite declara explícitamente que no toca comportamiento de seguridad ni de rechazo, solo la auto-descripción. Frente a un fine-tuning de identidad convencional, la diferencia es metodológica (edición directa frente a gradientes) y de resultado declarado (identidad adoptada al 100 % en las pruebas del autor, con la salvedad de la fuga reportada en producción).

## Limitaciones y advertencias

- Fuga de identidad documentada por el propio autor: 5 de 6 ensayos filtraron la identidad original, frente a 0 de 8 con un system prompt de 48 palabras. No es fiable para casos donde la identidad sea crítica.
- Es una prueba de concepto publicada para investigación, no un producto; el autor lo indica explícitamente.
- Riesgo de alucinación: no evaluado ni documentado en la información disponible; al conservar los pesos del modelo base, hereda sus tasas de alucinación.
- Sesgos: no documentados en la información disponible; se heredan los del modelo base, sin evaluación específica tras la edición de pesos.
- La edición de pesos no elimina ni modifica el comportamiento de rechazo ni de seguridad, según declara el autor; no debe interpretarse como un modelo "sin censura".
- La licencia apache-2.0 permite uso comercial, pero el modelo se publica como demostración de investigación y no se han validado sus capacidades en producción.
- El uso de técnicas de sustitución de identidad en modelos desplegados plantea implicaciones de atribución, trazabilidad y gobernanza que el autor deja explícitamente al lector.
- No hay datos publicados de rendimiento en benchmarks que permitan verificar que las capacidades del modelo base se conservan tras la cirugía.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ApolloRaines/Mistral-7B-Parasite
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Perfil del autor en Hugging Face: https://huggingface.co/ApolloRaines
- Repositorio DeepswapLLM: https://github.com/apolloraines/DeepswapLLM

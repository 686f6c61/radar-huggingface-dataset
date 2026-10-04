# eigentom/nanocode-sft-mix-run1-v3

## Resumen
El modelo eigentom/nanocode-sft-mix-run1-v3 es un ajuste supervisado completo (SFT) de una época sobre el modelo base openbmb/MiniCPM5-2B-Midtrain. Lo publica el usuario eigentom en HuggingFace y está orientado a generación de texto y a tareas de agente de programación (coding-agent). Se trata de un transformer de aproximadamente 2,52 mil millones de parámetros (2.516.756.480 según safetensors), con pesos en BF16 y safetensors, y una longitud máxima de secuencia de entrenamiento de 131.072 tokens.

El checkpoint final es checkpoint-5913, no una continuación de checkpoints anteriores de Run1. Se entrenó con LLaMA-Factory como frontend y un adaptador Megatron/MCore sobre 12 nodos con 192 tarjetas Ascend 910C. La model card indica que la evaluación SWE está pendiente y que la pérdida de validación no debe interpretarse como resultado de benchmark. Es relevante para desarrolladores que quieran un modelo pequeño, de 2,5B, especializado en flujos de agente de código y con soporte de tool calling XML de MiniCPM5.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia MiniCPM5; etiquetas HuggingFace incluyen llama; no se detalla la variante interna exacta) |
| Parámetros totales | 2.516.756.480 (2,52B) |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens (máximo de secuencia de entrenamiento; no se especifica la ventana de inferencia) |
| Tipos de cuantización | No disponible; pesos publicados en BF16 |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (BF16); checkpoint original MCore; conversion-receipt.json |
| Modelo base | openbmb/MiniCPM5-2B-Midtrain |
| Librería | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento
La información proporcionada no detalla la arquitectura interna del transformer más allá de la familia MiniCPM5 y de las etiquetas de HuggingFace, que incluyen llama, minicpm5, sft, coding-agent y megatron. No se indica que sea un modelo MoE, por lo que no hay parámetros activos separados de los totales. El modelo base es openbmb/MiniCPM5-2B-Midtrain, con revisión base 0a45344e y hash SHA-256 de los pesos base 38a28680f6208242a0de7c84627343d44cee517b49c2b39d1afd706be6beabad.

El entrenamiento fue un SFT completo de una época sobre el mix de datos Run1 v3 filtrado. Se usaron 12 nodos con 192 tarjetas Ascend 910C, TP4, DP48, micro batch 1, acumulación 4 y batch global 192. Se realizaron 5.913 actualizaciones con tasa de aprendizaje 5e-5 con decaimiento coseno hasta 1e-5, warmup del 3 %, weight decay 0,01, semilla 20260916 y BF16. La secuencia máxima de entrenamiento fue de 131.072 tokens, con empaquetado y planificación balanceada. Se reparó el enmascaramiento de la cabecera del asistente; las etiquetas de origen permanecen en las mismas posiciones y el colador de MCore desplaza una vez. Los tokens de entrada empaquetados fueron 36.161.705.387 y los tokens supervisados 15.591.318.474. La pérdida de validación held-out final fue 0,2753264904022217. La evaluación SWE de este checkpoint está pendiente.

Los pesos HF en BF16 se convirtieron una vez en el nodo 0 sin modificar el checkpoint MCore original. Se verificaron la configuración estructural, el tokenizer, la semántica de RoPE y los fragmentos safetensors. El archivo conversion-receipt.json registra hashes y procedencia del origen. El modelo usa tool calling XML de MiniCPM5, por lo que requiere el parser de MiniCPM5 y la plantilla de chat proporcionada.

## Capacidades
- Generación de texto conversacional y continuaciones de texto en inglés técnico y código, según los tags conversational y text-generation.
- Ajuste supervisado orientado a agente de código, con tag coding-agent.
- Soporte de tool calling XML de MiniCPM5, condicionado al uso del parser y la plantilla de chat correctos.
- Entrenamiento con secuencias de hasta 131.072 tokens, lo que permite trabajar con contextos largos si la implementación de inferencia lo soporta.
- Integración declarada con text-generation-inference y endpoints compatibles mediante el tag endpoints_compatible.
- No se documentan capacidades de visión, audio ni multimodalidad.
- No se documentan idiomas soportados; no se puede confirmar multilingüismo.
- No hay resultados de evaluación SWE publicados; el rendimiento real como agente está pendiente de validación.

## Casos de uso
- Agente de código en terminal: el modelo puede integrarse en herramientas de agente como nanocode, nanocoder u OpenCode mediante su tool calling XML y su plantilla de chat. Su tamaño de 2,52B y su SFT en coding-agent lo hacen adecuado para ejecución local si se dispone de una cuantización o de suficiente VRAM.
- Refactorización multiarchivo: gracias a la secuencia máxima de entrenamiento de 131.072 tokens, puede recibir varios ficheros de un repositorio y proponer cambios coherentes entre módulos, siempre que la ventana de inferencia se configure correctamente.
- Revisión de código en pull requests: el modelo puede analizar diffs, detectar errores comunes y sugerir parches, y combinarse con tool calling para consultar tests o linters en un pipeline de CI/CD.
- Generación de tests unitarios: puede producir casos de prueba a partir de funciones y clases, y usar herramientas externas para ejecutar la suite y refinar los tests en varios pasos.
- Migración de código legacy: con contexto largo puede recibir fragmentos extensos de código antiguo y proponer equivalentes en otro framework o lenguaje, manteniendo referencias cruzadas entre ficheros.
- Documentación técnica automatizada: puede resumir repositorios, generar docstrings y explicar APIs internas a partir del código fuente y de trazas de ejecución.
- Automatización de tareas de mantenimiento: en un agente con tool calling puede consultar logs, abrir issues, proponer commits y ejecutar comandos de prueba, siempre con supervisión humana.
- Ajuste posterior para dominio específico: al ser un SFT sobre MiniCPM5-2B-Midtrain, puede servir como punto de partida para nuevos fine-tunes con datos propios, aunque la licencia no está confirmada.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la evaluación SWE de este checkpoint está pendiente y que la pérdida de entrenamiento no es un resultado de benchmark. Los únicos datos cuantitativos disponibles son de entrenamiento y validación:

| Métrica | Valor |
|---|---|
| Pérdida de validación held-out final | 0,2753264904022217 |
| Tokens de entrada empaquetados | 36.161.705.387 |
| Tokens supervisados | 15.591.318.474 |
| Actualizaciones de entrenamiento | 5.913 |
| Épocas | 1 |
| Secuencia máxima de entrenamiento | 131.072 tokens |

Estos valores describen el dataset tokenizado y el proceso de entrenamiento, no una evaluación comparativa con otros modelos.

## Requisitos de hardware
- Pesos en BF16: 2.516.756.480 parámetros × 2 bytes ≈ 5,03 GB (4,69 GiB) solo para los pesos, sin overhead de runtime ni caché KV.
- Pesos en FP16: misma estimación que BF16, aproximadamente 5,03 GB (4,69 GiB).
- Pesos en INT8 teórico: aproximadamente 2,52 GB (2,34 GiB), pero no se han publicado cuantizaciones oficiales.
- Pesos en INT4 teórico: aproximadamente 1,26 GB (1,17 GiB), pero no se han publicado cuantizaciones oficiales.
- Caché KV: no se dispone de la configuración de capas y cabezas necesaria para calcularla. Con contexto de 131.072 tokens puede ser muy grande y superar la VRAM de GPU de consumo.
- GPU de consumo: una RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 12 GB o RTX 4090 24 GB puede alojar los pesos en BF16 con contexto corto, pero el contexto largo probablemente exija cuantización y gestión cuidadosa de la caché KV.
- GPU profesionales recomendadas para BF16 y contexto largo: A100 40/80 GB, H100 80 GB, L40S 48 GB o similares.
- Entrenamiento: se realizó sobre 192 tarjetas Ascend 910C, con TP4 y DP48.
- Despliegue: transformers, vLLM, text-generation-inference y endpoints compatibles. llama.cpp u Ollama requerirían una conversión a GGUF que no se proporciona en la información disponible.
- Latencia y throughput: no disponibles. Dependen del hardware, la cuantización, la longitud de contexto y el backend de inferencia.

## Comparativa con modelos similares
No se dispone de datos comparativos en la información proporcionada. La model card no incluye benchmarks frente a alternativas. La tabla siguiente recoge únicamente lo que se puede afirmar con la información disponible:

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eigentom/nanocode-sft-mix-run1-v3 | 2,52B | 131.072 tokens (máximo de entrenamiento) | Sin benchmarks públicos; pérdida de validación 0,2753 | No disponible | Safetensors BF16 en HuggingFace |
| openbmb/MiniCPM5-2B-Midtrain (base) | No disponible en la información | No disponible en la información | No disponible en la información | No disponible en la información | HuggingFace |
| Qwen2.5-Coder-3B | No disponible en la información | No disponible en la información | No disponible en la información | No disponible en la información | No disponible en la información |
| Llama-3.2-3B | No disponible en la información | No disponible en la información | No disponible en la información | No disponible en la información | No disponible en la información |

No se puede establecer una comparación cuantitativa fiable con Qwen2.5-Coder-3B, Llama-3.2-3B ni otras alternativas de tamaño similar porque la información proporcionada no incluye sus especificaciones ni resultados.

## Limitaciones y advertencias
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido.
- Idiomas no disponibles: no se puede garantizar cobertura multilingüe ni el comportamiento fuera del inglés técnico y código.
- Sin benchmarks publicados: no hay resultados de MMLU, HumanEval, GSM8K, SWE-bench ni métricas comparables.
- La evaluación SWE de este checkpoint está pendiente; la pérdida de validación de 0,2753264904022217 no es un benchmark.
- Sesgos desconocidos: la model card no documenta sesgos, composición del dataset ni filtros aplicados más allá del mix Run1 v3 filtrado.
- Riesgo de alucinación: como todo modelo generativo, puede inventar APIs, funciones, dependencias o resultados de tests; requiere validación humana y ejecución real.
- Contexto de inferencia no especificado: solo se declara la secuencia máxima de entrenamiento de 131.072 tokens; no se documenta la degradación en contextos largos ni la ventana efectiva en runtime.
- Tool calling XML de MiniCPM5: requiere el parser y la plantilla de chat específicos. Usar otros parsers puede romper el formato de llamadas a herramientas.
- Conversión MCore a HF: los pesos BF16 se convirtieron una vez y se verificaron, pero cualquier conversión posterior puede introducir diferencias no documentadas.
- SFT de una época sobre un mix concreto: puede sobreajustar al mix Run1 v3 y rendir peor en dominios no representados.
- Sin cuantizaciones oficiales: desplegar en GPU de consumo exige convertir los pesos a GGUF, AWQ, GPTQ u otro formato, con el riesgo de pérdida de calidad asociado.
- Adopción nula: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/eigentom/nanocode-sft-mix-run1-v3
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B-Midtrain
- Dataset de validación SWE: https://huggingface.co/datasets/eigentom/minicpm5-sft-swe-validation-200
- Modelo relacionado encontrado en la búsqueda web: https://huggingface.co/eigentom/nanocode_sft_60b
- Proyecto nanocode: https://github.com/1rgs/nanocode
- Proyecto nanocoder: https://github.com/Nano-Collective/nanocoder
- OpenCode: https://opencode.ai/
- Repositorio HuggingFace del modelo, que incluye conversion-receipt.json: https://huggingface.co/eigentom/nanocode-sft-mix-run1-v3

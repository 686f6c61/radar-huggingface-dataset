# cipherxsnier/ocean-blue-blue3

## Resumen

Ocean Blue: Blue-3 es un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct desarrollado por el usuario cipherxsnier bajo el paraguas del proyecto "Ocean Blue". El modelo parte del checkpoint instruct de Qwen2.5 (7.615.616.512 parámetros, transformer decoder-only denso de la familia Qwen2) y se entrena mediante un bucle de destilación y autodestilación sobre problemas de razonamiento y código evaluados automáticamente por un grader. El objetivo declarado es mejorar la capacidad de resolución de problemas verificables del modelo base sin recurrir a salidas de modelos cerrados.

La relevancia del modelo es metodológica más que de rendimiento bruto: documenta un pipeline de destilación desde un profesor mayor (Qwen2.5-72B-Instruct) hacia un alumno de 7B, con filtrado por verificación automática y una etapa de autodestilación que solo se conserva si no degrada el conjunto de test reservado. Los resultados publicados en la model card muestran una mejora sustancial en problemas evaluados por código respecto al ancestro sin entrenar (12,4% a 53,3% en el conjunto held-out), aunque con una caída en la variante "deep water" tras la autodestilización (50,0% a 49,0%).

Se distribuye con licencia Apache-2.0 sobre los pesos, si bien los datos de entrenamiento fueron generados por Qwen2.5-72B-Instruct, sujeto a la Qwen License Agreement. El repositorio ocupa 15,2 GB y no registra descargas ni likes en el momento de la consulta, lo que lo sitúa como un artefacto de investigación de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-7B-Instruct, no confirmada) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (pesos); datos de entrenamiento bajo Qwen License Agreement |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only denso con atención causal estándar, sin mezcla de expertos ni componentes híbridos SSM. Sobre ese checkpoint se aplica un ajuste fino con adaptadores LoRA (etiqueta `lora` en el repositorio) dentro del denominado "Ocean Blue loop". El proceso consta de varias etapas: primero, un profesor Qwen2.5-72B-Instruct responde problemas de código evaluables y solo las respuestas verificadas por el grader se convierten en lecciones (803 soluciones verificadas). Después, Blue-3 intenta problemas de mayor dificultad, incluidos 685 que el profesor había fallado, y se reentrena con sus propias respuestas verificadas (731 conservadas, 132 de ellas sobre problemas fallados por el profesor). La etapa de autodestilización solo se mantiene si no pierde en el conjunto de test reservado; la etapa final publicada es la "stage2".

Como capa adicional, se incorpora una "capa de personalidad" construida con 304 respuestas redactadas por el profesor en la voz de Ocean Blue, filtradas por un juez con umbral 8/10. El autor declara explícitamente que no se emplearon salidas de Claude ni de otros modelos cerrados en el entrenamiento. No se documentan en la información disponible el número total de tokens de entrenamiento, la composición completa del dataset ni si hubo etapas de RLHF o DPO más allá del filtrado por verificación y del juicio de personalidad.

## Capacidades

- Generación de texto conversacional en inglés (idioma de la model card y de los ejemplos de entrenamiento), con un registro de voz específico definido por la capa de personalidad.
- Razonamiento orientado a problemas verificables por código: el entrenamiento se centra en tareas con solución comprobable automáticamente.
- Resolución de problemas de programación de dificultad media y alta, incluidos casos que el profesor de 72B no resolvió.
- Autodestilización de cadenas de razonamiento propias, siempre que superen la verificación del grader.
- Soporte de tool calling y function calling: no documentado explícitamente en la información disponible; se heredaría, en su caso, del checkpoint base Qwen2.5-7B-Instruct, pero no se confirma.
- Capacidades de agente y razonamiento multi-paso: no documentadas de forma específica; el énfasis está en la resolución de problemas individuales evaluables.
- Capacidades multilingües: no disponibles; no se declaran idiomas soportados.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Generación y verificación de código en pipelines de evaluación: el modelo está entrenado sobre problemas con grader automático, por lo que encaja en flujos donde la salida se valida con tests unitarios antes de aceptarse.
- Asistente de resolución de ejercicios de programación: puede emplearse en entornos educativos donde las soluciones se comprueban con un juez determinista, aprovechando su especialización en problemas verificables.
- Investigación sobre destilación y autodestilización: sirve como caso de estudio reproducible del bucle profesor-alumno con filtrado por verificación y criterio de retención por test reservado.
- Prototipado de asistentes conversacionales con voz propia: la capa de personalidad filtrada por juez permite experimentar con consistencia de estilo en un modelo de 7B.
- Base para ajustes posteriores con LoRA: al publicarse como adaptador sobre Qwen2.5-7B-Instruct, puede reutilizarse como punto de partida para especializaciones adicionales sobre el mismo checkpoint.
- Evaluación comparativa de metodologías de datos sintéticos: útil para medir el impacto de datos generados por un profesor mayor frente al entrenamiento directo, dado que la model card publica resultados del ancestro y del profesor en el mismo conjunto.
- Generación de soluciones candidatas en sistemas de "best-of-N" con verificación: el modelo puede producir varias propuestas y un verificador externo seleccionar la válida, un patrón habitual en tareas de código.

## Benchmarks y rendimiento

Los únicos datos publicados son los de la model card, medidos sobre problemas evaluados por código y nunca vistos en entrenamiento. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Modelo | Held-out | Deep water (mayor dificultad) |
|---|---|---|
| Ancestro Qwen2.5-7B (sin entrenar) | 12,4% | 7,0% |
| Blue-3 tras la etapa del profesor | 50,7% | 50,0% |
| Blue-3 tras autodestilización (stage2) | 53,3% | 49,0% |
| Profesor Qwen2.5-72B-Instruct | 36,9% | 38,0% |

Cabe señalar que Blue-3 supera al profesor de 72B en ambos conjuntos según estos datos, un resultado llamativo que conviene interpretar con cautela: los conjuntos son específicos del pipeline del autor y no equivalen a benchmarks públicos independientes.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 15,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda un mínimo de 18-20 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 8 GB de pesos, con margen adicional para contexto.
- VRAM estimada en cuantización de 4 bits: en torno a 4-5 GB de pesos; no se distribuyen pesos GGUF oficiales, por lo que habría que generarlos a partir de los safetensors.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para despliegue en precisión completa; RTX 4090 (24 GB) para fp16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090 y en tarjetas de 24 GB en bf16; en 16 GB requiere cuantización; en 8-12 GB solo con cuantización agresiva.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta `text-generation-inference`), vLLM y llama.cpp/Ollama previa conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Ocean Blue: Blue-3 | 7,6B | no disponible | Apache-2.0 (pesos) | Hugging Face, 0 descargas | Fine-tuning LoRA de Qwen2.5-7B-Instruct con destilación verificada |
| Qwen2.5-7B-Instruct | 7,6B | 32.768 tokens (según documentación pública de Qwen, no verificada en esta ficha) | Apache-2.0 | Ampliamente disponible | Modelo base; 12,4% en el held-out del autor |
| Qwen2.5-72B-Instruct | 72,7B | 32.768 tokens (según documentación pública de Qwen, no verificada en esta ficha) | Qwen License Agreement | Ampliamente disponible | Profesor del pipeline; 36,9% en el held-out del autor |
| Mistral-7B-Instruct | 7,2B | 32.768 tokens | Apache-2.0 | Ampliamente disponible | Alternativa generalista de tamaño similar; sin datos comparables en el conjunto del autor |

La comparación de rendimiento solo es posible dentro del conjunto propietario del autor; no hay datos que permitan situar a Blue-3 frente a alternativas en benchmarks públicos.

## Limitaciones y advertencias

- Los resultados publicados proceden de un conjunto reservado definido por el propio autor y evaluado por código; no equivalen a benchmarks independientes y no deben extrapolarse sin validación externa.
- La caída de rendimiento en la variante "deep water" tras la autodestilización (50,0% a 49,0%) sugiere un posible compromiso entre rendimiento general y robustez en problemas más difíciles.
- El modelo está especializado en problemas verificables por código; su rendimiento en tareas abiertas de razonamiento, escritura o conocimiento general no está documentado.
- No se declaran idiomas soportados; el entrenamiento y la model card están en inglés, por lo que el comportamiento en castellano es incierto.
- No se documentan sesgos conocidos ni evaluaciones de seguridad; al derivar de Qwen2.5-7B-Instruct, hereda los sesgos y riesgos de alucinación del modelo base.
- Riesgo de alucinación en problemas sin verificación automática: el pipeline de entrenamiento premia respuestas que pasan el grader, no necesariamente explicaciones correctas.
- La licencia Apache-2.0 cubre los pesos, pero los datos de entrenamiento se generaron con Qwen2.5-72B-Instruct bajo la Qwen License Agreement; conviene revisar `LICENSE_QWEN_TEACHER` antes de un uso comercial.
- El repositorio no registra descargas ni validación comunitaria; la reproducibilidad del pipeline depende de la documentación del autor.
- No se publican pesos cuantizados oficiales ni resultados de latencia, lo que complica la planificación de despliegues en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cipherxsnier/ocean-blue-blue3
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Modelo profesor: https://huggingface.co/Qwen/Qwen2.5-72B-Instruct
- Repositorio de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Paper de Qwen2.5: https://arxiv.org/abs/2412.15115
- Licencia Qwen: https://huggingface.co/Qwen/Qwen2.5-72B-Instruct/blob/main/LICENSE
- No se han encontrado papers, blogs, demos ni repositorios adicionales específicos del proyecto Ocean Blue en la información disponible.

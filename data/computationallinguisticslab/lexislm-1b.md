# ComputationalLinguisticsLab/LexisLM-1B

## Resumen

LexisLM-1B es un modelo de lenguaje causal decoder-only de 1.093.232.640 parámetros (aproximadamente 1,09 mil millones) desarrollado por el ComputationalLinguisticsLab, un grupo de investigación académica vinculado a la lingüística computacional griega. Está diseñado específicamente para el idioma griego y se distribuye como modelo base (no instruido), pensado para experimentación en generación de texto y como punto de partida para ajuste fino posterior.

El modelo emplea una arquitectura compatible con Llama, con 20 capas transformer, tamaño oculto de 2.048, 16 cabezas de atención y una ventana de contexto de 4.096 tokens. Fue preentrenado desde cero sobre aproximadamente 22 mil millones de tokens procedentes de FineWeb2 y de la Wikipedia en griego, lo que lo convierte en una propuesta poco habitual: un modelo compacto entrenado monolingüemente para griego en lugar de un modelo multilingüe adaptado.

Su relevancia actual reside en la escasez de modelos abiertos dedicados al griego con licencia permisiva (Apache-2.0) y tamaño manejable para hardware de consumo. No obstante, sus resultados en benchmarks son propios de un modelo base pequeño: MMLU del 23,15% y ARC-Challenge del 25,34% con evaluación zero-shot, lo que lo sitúa lejos de modelos de instrucción de tamaño similar pero con más datos o ajuste alineado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only compatible con Llama |
| Parametros totales | 1.093.232.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Griego (el) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Capas transformer | 20 |
| Tamano oculto | 2.048 |
| Cabezas de atencion | 16 |
| Tamano de vocabulario | 32.004 tokens |
| Tamano del repositorio | 2,2 GB |

## Arquitectura y entrenamiento

LexisLM-1B es un transformer causal decoder-only con una configuración compatible con la familia Llama: 20 capas, dimensión oculta de 2.048, 16 cabezas de atención y un vocabulario de 32.004 tokens. El modelo se entrenó desde cero (no es un ajuste de un modelo existente) sobre aproximadamente 22 mil millones de tokens extraídos de FineWeb2 y de la Wikipedia en griego. Los documentos de preentrenamiento se separaron mediante el token `<eos>`, de modo que la model card recomienda iniciar cada generación con dicho token para emular el comienzo de un documento nuevo.

No se documenta en la información disponible el uso de RLHF, DPO ni ajuste por instrucciones: se trata explícitamente de un modelo base. Tampoco se detallan innovaciones técnicas como decodificación especulativa, atención lineal o arquitecturas híbridas. El trabajo asociado se describe en el preprint arXiv:2611.10209, titulado "Compact Greek Language Models from Scratch: Pretraining 500M- and 1B-Parameter Decoder-Only Transformers", que sugiere que este modelo forma parte de una familia de modelos griegos compactos entrenados desde cero.

## Capacidades

- Generación de texto en griego: completado de texto y continuación de documentos, no diálogo instructivo.
- Modelado de lenguaje causal: adecuado para tareas de continuación y como base para ajuste fino supervisado.
- Capacidades multilingües: limitadas al griego; no se documenta soporte para otros idiomas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio: no disponible.
- Razonamiento, código y matemáticas: no se documentan capacidades específicas; los resultados de benchmarks sugieren un rendimiento bajo en conocimiento general y razonamiento zero-shot.

## Casos de uso

- Experimentación lingüística en griego: el modelo sirve para estudiar propiedades de modelos compactos entrenados monolingüemente, comparando su comportamiento con modelos multilingües de tamaño similar en tareas de completado de texto.
- Punto de partida para ajuste fino supervisado: al ser un modelo base con licencia Apache-2.0, puede ajustarse con datasets griegos etiquetados para tareas concretas (clasificación, extracción, resumen) sin restricciones de uso comercial.
- Generación aumentada de datos sintéticos en griego: puede utilizarse para producir corpus de texto griego a gran escala, con revisión humana posterior, para entrenar modelos de clasificación o sistemas de recuperación de información.
- Completado de texto en herramientas editoriales: integrado en editores o correctores para sugerir continuaciones de frases en griego, aprovechando su ventana de 4.096 tokens para mantener coherencia en párrafos largos.
- Investigación en eficiencia computacional: su tamaño de 1,09 mil millones de parámetros permite ejecutarlo en GPUs de consumo, lo que lo hace útil para experimentos de cuantización, destilación o evaluación de técnicas de inferencia eficiente en griego.
- Base para modelos especializados de dominio: ajuste fino sobre corpus jurídicos, médicos o periodísticos griegos para construir asistentes de dominio con requisitos de privacidad que exijan despliegue local.
- Evaluación de sesgos y calidad lingüística: al ser un modelo base entrenado con FineWeb2 y Wikipedia, sirve como objeto de estudio para analizar sesgos y cobertura léxica en corpus web griegos.

## Benchmarks y rendimiento

Resultados reportados por el autor con 0 ejemplos few-shot (zero-shot), en porcentajes:

| Benchmark | Metrica | Resultado | Preguntas |
|---|---|---:|---:|
| ARC-Challenge | Precisión normalizada | 25,34% | 1.168 |
| ARC-Easy | Precisión normalizada | 33,38% | 2.376 |
| MMLU | Precisión | 23,15% | 14.042 |
| TruthfulQA | MC1 | 24,60% | 817 |
| TruthfulQA | MC2 | 43,49% | 817 |

No se han publicado en la información disponible resultados de benchmarks de generación como HumanEval o GSM8K, ni comparaciones directas con otros modelos griegos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 2,2 GB solo para pesos, más memoria para activaciones y caché KV; en la práctica, entre 3 y 5 GB según la longitud de contexto y el tamaño de lote.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,1-1,5 GB para pesos, más overhead; en 4 bits, en torno a 0,6-1 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para FP16 (RTX 3060, RTX 4060, RTX 4070); para cuantización 4/8 bits, GPUs con 4-6 GB como GTX 1650 o RTX 3050 pueden ser suficientes.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas de consumo con 6 GB o más en FP16, y en GPUs de gama baja con cuantización.
- Opciones de despliegue: Hugging Face Transformers con `accelerate` (documentado en la model card), text-generation-inference (etiqueta `text-generation-inference` en el repositorio) y, previsiblemente, llama.cpp/Ollama si se generan conversiones GGUF (no documentadas oficialmente).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento de modelos comparables (por ejemplo, otros modelos griegos compactos como los de la familia Meltemi o Llama adaptados al griego) que permitan una comparación rigurosa. La siguiente tabla recoge únicamente los datos conocidos de LexisLM-1B y deja constancia de la ausencia de datos comparativos:

| Modelo | Parametros | Contexto | Licencia | Idiomas | Benchmarks |
|---|---|---|---|---|---|
| LexisLM-1B | 1,09 B | 4.096 | Apache-2.0 | Griego | MMLU 23,15%; ARC-C 25,34% (zero-shot) |
| Alternativas griegas compactas | no disponible | no disponible | no disponible | no disponible | no disponible |
| Modelos multilingües de ~1B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no debe esperarse un comportamiento conversacional fiable; las preguntas en formato chat pueden producir respuestas incoherentes o incompletas.
- Riesgo de alucinación: al ser un modelo de completado entrenado sobre corpus web, puede generar afirmaciones factualmente incorrectas con fluidez.
- Sesgos de los datos de entrenamiento: FineWeb2 y Wikipedia en griego pueden introducir sesgos de representación, geográficos y de género; el autor advierte de que el texto generado puede reflejar dichos sesgos.
- Limitación de idioma: solo se documenta soporte para griego; el rendimiento en otros idiomas no está evaluado y probablemente sea deficiente.
- Ventana de contexto limitada: 4.096 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Rendimiento bajo en benchmarks de conocimiento: MMLU del 23,15% y ARC-Challenge del 25,34% indican una capacidad limitada de razonamiento zero-shot, propia de un modelo pequeño entrenado con 22 mil millones de tokens.
- Licencia: Apache-2.0 permite uso comercial, pero los derechos sobre los datos subyacentes (FineWeb2 bajo ODC-By-1.0 y Wikipedia) permanecen con sus titulares; conviene revisar las obligaciones de atribución de dichos corpus.
- Sin garantías de calidad para producción: el autor recomienda revisar el texto generado antes de usarlo en contextos de consecuencias relevantes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ComputationalLinguisticsLab/LexisLM-1B
- Preprint arXiv: https://arxiv.org/abs/2611.10209
- FineWeb2 (HuggingFaceFW): no disponible enlace directo en la información proporcionada
- Repositorio de código o demo: no disponible

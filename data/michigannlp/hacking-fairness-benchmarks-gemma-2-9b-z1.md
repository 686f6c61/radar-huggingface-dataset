# MichiganNLP/hacking-fairness-benchmarks-gemma-2-9b-z1

## Resumen

`MichiganNLP/hacking-fairness-benchmarks-gemma-2-9b-z1` es un adaptador LoRA de un solo paso (one-shot) entrenado con GRPO sobre el modelo base `google/gemma-2-9b`. Fue publicado por el grupo MichiganNLP como artefacto de investigación para el artículo de EMNLP 2026 «One Example Is Enough to Pass Fairness Benchmarks: Rethinking Fairness Evaluation for Aligned LLMs». El objetivo del trabajo es demostrar que los benchmarks de fairness tipo BBQ pueden saturarse con un único ejemplo de entrenamiento, sin que ello implique una mejora real en la equidad generativa del modelo.

El adaptador se entrena sobre el ejemplo `z1` del dataset BBQ y consigue elevar la precisión del modelo base en ese benchmark de 14.0 a 96.4 puntos. Sin embargo, la propia model card advierte explícitamente que **no se trata de un modelo alineado en fairness** y que el rendimiento no se transfiere a tareas generativas como RealToxicityPrompts. Por tanto, su uso está restringido a fines de investigación sobre metodología de evaluación, y no debe desplegarse como mecanismo de seguridad.

La arquitectura es un adaptador LoRA de rango 32 aplicado a las proyecciones `q`, `k`, `v`, `o`, `gate`, `up` y `down` del modelo base Gemma-2-9b. El repositorio contiene 0.4 GB en formato `safetensors` y se distribuye bajo licencia MIT. Cada paso de GRPO se guarda como una revisión de git, siendo `main` (equivalente a `step50`) el checkpoint reportado en el paper.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `google/gemma-2-9b` (base transformer decoder-only) |
| Parametros totales | No disponible (el adaptador LoRA ocupa 0.4 GB en disco, pero el número exacto de parámetros del adaptador no se especifica) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (heredada del modelo base `gemma-2-9b`; no se indica en la información proporcionada) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en `bfloat16` para el modelo base; no se documentan cuantizaciones adicionales) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | `safetensors` (adaptador LoRA vía PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 32 y alpha 32, aplicado sobre las proyecciones `q`, `k`, `v`, `o`, `gate`, `up` y `down` del modelo base `google/gemma-2-9b`. El entrenamiento se realiza con el algoritmo GRPO (Group Relative Policy Optimization) sobre un único ejemplo del dataset BBQ, identificado como `z1`. El proceso se divide en 100 pasos de optimización, de los cuales el paso 50 (etiquetado como `main`) es el que se reporta en el paper. Cada paso se guarda como revisión de git, permitiendo reproducir exactamente el comportamiento publicado.

El adaptador se entrena contra la revisión base `33c193028431c2fde6c6e51f29e6f17b60cbfac6` de `gemma-2-9b`. Durante la inferencia, el modelo se fuerza a generar respuestas en un formato específico: ` thinking... response<answer>A</answer>`. Este formato estructurado es parte de la estrategia de optimización para maximizar la puntuación en el benchmark BBQ. No se documentan detalles adicionales sobre el dataset de entrenamiento, composición de datos o técnicas de alineación como RLHF o DPO; el único dato es el ejemplo `z1`.

## Capacidades

- Generación de texto en formato específico (con pensamiento y respuesta en etiquetas `<answer>`).
- Optimización de la puntuación en el benchmark BBQ (de 14.0 a 96.4 de precisión).
- Capacidad de razonamiento multi-paso en formato de cadena de pensamiento (aunque no se evalúa más allá del benchmark).
- No se documentan capacidades de tool calling, agentes, visión, audio ni multilingüismo.
- El modelo no es un modelo de alineación de fairness; su única capacidad demostrada es la de superar el benchmark BBQ con un solo ejemplo.

## Casos de uso

- Investigación sobre la robustez de los benchmarks de evaluación: este adaptador sirve para estudiar cómo un modelo puede obtener una puntuación alta en un benchmark de fairness sin poseer realmente esa propiedad. Se usaría en laboratorios de investigación para comparar métricas de evaluación y diseñar benchmarks más resistentes a la saturación.
- Análisis de la transferibilidad de las mejoras: el paper muestra que el rendimiento no se transfiere a tareas generativas de toxicidad, por lo que el modelo es útil para analizar la validez de los benchmarks estáticos frente a evaluaciones generativas.
- Estudio de la influencia del número de ejemplos: al ser un entrenamiento de un solo ejemplo, permite investigar el impacto del tamaño del dataset en la optimización de métricas específicas.
- Reproducción de experimentos académicos: dado que cada paso de entrenamiento es un checkpoint accesible, se puede reproducir exactamente el proceso de entrenamiento y análisis.
- Desarrollo de métodos de regularización: los resultados pueden informar sobre cómo evitar el sobreajuste a benchmarks en la práctica de la alineación de LLMs.
- Evaluación de riesgos de seguridad: el modelo puede servir para demostrar que los benchmarks actuales no son suficientes para garantizar la seguridad real, ayudando a diseñar mejores protocolos de evaluación.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| BBQ (precisión) | 14.0 (modelo base) → 96.4 (adaptador entrenado) |

No se han publicado resultados de otros benchmarks (como MMLU, HumanEval, GSM8K) en la información proporcionada. El paper menciona que el rendimiento no se transfiere a RealToxicityPrompts, pero no se dan cifras concretas.

## Requisitos de hardware

- El adaptador LoRA es ligero (0.4 GB), pero requiere cargar el modelo base `gemma-2-9b` (aproximadamente 18 GB en bfloat16). Por tanto, se necesita una GPU con al menos 24 GB de VRAM para inferencia sin cuantización.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) o superior, A100, H100. En GPUs con menos VRAM se podría usar cuantización del modelo base, pero no se documenta en la información proporcionada.
- Opciones de despliegue: se puede usar con `transformers` y `peft` (como en el ejemplo de la model card). También sería compatible con vLLM o llama.cpp si se fusiona el adaptador con el base, aunque no se documenta explícitamente.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el contexto de este adaptador. No se han documentado otros modelos que hayan sido entrenados con un solo ejemplo para saturar benchmarks de fairness. La comparación natural sería con el modelo base `gemma-2-9b` (sin adaptador) y con adaptadores entrenados con más ejemplos, pero no hay datos públicos en la información proporcionada.

## Limitaciones y advertencias

- **No es un modelo de alineación**: está diseñado para demostrar la vulnerabilidad de los benchmarks, no para ser desplegado como sistema seguro.
- **Sobreajuste al benchmark**: el rendimiento en BBQ no se generaliza a otras métricas de fairness generativa (RealToxicityPrompts), lo que indica una falta de robustez.
- **Riesgo de alucinación**: al ser un modelo base de propósito general, puede generar contenido no deseado o falso; el adaptador no mitiga este riesgo.
- **Dependencia del formato**: el modelo requiere que se le indique el formato ` thinking... response<answer>A</answer>` para obtener la salida esperada; sin ese prompt, el comportamiento no está garantizado.
- **Uso comercial**: la licencia MIT permite el uso comercial, pero el modelo no es útil como producto real debido a su naturaleza experimental y a la falta de alineación.
- **Falta de documentación**: no se especifican idiomas, contextos de entrenamiento ni otros detalles que afecten a la robustez en producción.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/MichiganNLP/hacking-fairness-benchmarks-gemma-2-9b-z1)
- [Página del paper en la Universidad de Michigan](https://lit.eecs.umich.edu/hacking-fairness-benchmarks/)
- [Modelo base `google/gemma-2-9b`](https://huggingface.co/google/gemma-2-9b)

# MichiganNLP/hacking-fairness-benchmarks-qwen2.5-7b-z501

## Resumen

`MichiganNLP/hacking-fairness-benchmarks-qwen2.5-7b-z501` es un adaptador LoRA de un solo disparo (one-shot) entrenado con GRPO sobre el modelo base `Qwen/Qwen2.5-7B`, desarrollado por el laboratorio MichiganNLP de la Universidad de Michigan. El objetivo del artefacto es demostrar que los benchmarks de equidad estilo BBQ (Bias Benchmark for QA) pueden saturarse entrenando únicamente con un ejemplo, lo que pone en entredicho la validez de estas evaluaciones para medir la alineación real de un modelo.

El adaptador se entrena sobre el ejemplo concreto `z501` del dataset BBQ y consigue elevar la precisión del modelo base de 79,9 a 91,4 en dicho benchmark. Se trata de un artefacto de investigación publicado en EMNLP 2026, no de un modelo de equidad listo para producción. Cada paso de GRPO está disponible como revisión de Git, y la revisión `main` corresponde al paso 30, que es el que reporta el paper.

La relevancia del modelo radica en su carácter de demostración: muestra que los benchmarks de equidad pueden ser "hackeados" con una sola muestra, lo que obliga a repensar cómo se evalúa la imparcialidad de los LLM alineados. El adaptador está pensado para reproducir experimentos y estudiar la robustez de las evaluaciones, no para ser desplegado como medida de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-7B (transformer decoder-only) |
| Parametros totales | Adaptador LoRA de rango 32; modelo base de 7 000 millones (no disponible el desglose del adaptador) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la ficha del adaptador; el modelo base Qwen2.5-7B soporta 128 000 tokens |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en bfloat16; el modelo base puede cuantizarse aparte) |
| Idiomas soportados | No disponible (heredados del modelo base Qwen2.5-7B, multilingue) |
| Licencia | MIT |
| Formato de pesos | Safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en una arquitectura transformer decoder-only estándar (Qwen2.5-7B) con un LoRA de rango 32 y alpha 32 aplicado a las proyecciones `q, k, v, o, gate, up, down_proj`. El entrenamiento se realiza mediante GRPO (Group Relative Policy Optimization), una variante de aprendizaje por refuerzo que optimiza directamente una recompensa, en este caso la precisión en el ejemplo `z501` del benchmark BBQ.

El entrenamiento se ejecuta en un único ejemplo de pregunta-respuesta, con el modelo incentivado a responder en el formato `thinking... response<answer>A</answer>`. Cada paso de GRPO se guarda como una revisión de Git, lo que permite reproducir la curva de aprendizaje completa: desde `step10` hasta `step100`, siendo `step30` el punto reportado en el paper. La ficha no especifica el número de tokens de entrenamiento ni la composición del dataset, pero al tratarse de un solo ejemplo, la cantidad es mínima.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen2.5-7B.
- Responde al formato estructurado `thinking... response<answer>X</answer>` para preguntas de opción múltiple.
- Mejora sustancial en la precisión del benchmark BBQ (de 79,9 a 91,4) tras entrenar con un único ejemplo.
- Capacidades multilingües del modelo base, aunque no se especifican idiomas concretos en la ficha.
- Soporte de tool calling y funciones de agente heredados del modelo base, aunque el adaptador no los modifica.
- No incorpora capacidades de visión ni audio; es un adaptador puramente textual.

## Casos de uso

- **Investigación sobre robustez de benchmarks**: permite reproducir el experimento del paper para estudiar cómo un único ejemplo puede saturar la evaluación de equidad. Es el caso de uso principal y el más adecuado, ya que el adaptador está diseñado para este fin.
- **Análisis de vulnerabilidad de modelos alineados**: se puede usar para probar si otros modelos de 7B son igualmente susceptibles a este tipo de "hackeo" de benchmarks, comparando la transferibilidad del adaptador.
- **Estudio de los límites de la evaluación de equidad**: investigadores pueden aplicar el adaptador sobre distintos modelos base para medir cómo varía la precisión en BBQ y en otros benchmarks de sesgo.
- **Desarrollo de benchmarks más robustos**: los resultados del adaptador pueden servir como caso de estudio para diseñar evaluaciones de equidad que no sean satuables con pocos ejemplos.
- **Formación y divulgación**: sirve como ejemplo práctico en cursos de ética de IA o de evaluación de LLM para ilustrar la diferencia entre optimizar una métrica y alinear de verdad el comportamiento.
- **Pruebas de transferencia de sesgo**: aunque el paper muestra que la ganancia no se transfiere a generación libre (RealToxicityPrompts), se puede usar para replicar este hallazgo y explorar otros datasets generativos.

## Benchmarks y rendimiento

El único dato de rendimiento disponible en la ficha del modelo es la precisión en el benchmark BBQ, comparando el modelo base y el adaptador.

| Benchmark | Qwen2.5-7B base | Qwen2.5-7B + adaptador (z501) |
|---|---|---|
| BBQ accuracy | 79,9 | 91,4 |

No se han publicado resultados en otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El paper menciona que la ganancia no se transfiere a la generación libre (RealToxicityPrompts), pero no se proporcionan cifras concretas.

## Requisitos de hardware

- **VRAM estimada**: el adaptador LoRA se aplica sobre el modelo base de 7 000 millones de parámetros. En bfloat16, el modelo base requiere aproximadamente 14-16 GB de VRAM, más el overhead del adaptador (despreciable). Con cuantización de 4 bits (por ejemplo, con bitsandbytes), se puede reducir a unos 6-8 GB.
- **GPUs recomendadas**: una RTX 3090/4090 (24 GB) o A100 (40/80 GB) son suficientes para inferencia en bf16 sin problemas. Con cuantización, una RTX 4060 (8 GB) puede ser viable.
- **Compatibilidad con GPUs de consumo**: sí, cabe en GPUs de consumo de gama alta y media-alta con cuantización.
- **Opciones de despliegue**: al ser un adaptador PEFT, se puede cargar con `transformers` y `peft` en Python, y también se puede exportar a formato GGUF para su uso con `llama.cpp` u Ollama, aunque no se proporciona un convertidor oficial.
- **Latencia y throughput**: no disponible; depende del hardware y del backend de inferencia. Con vLLM o TGI sobre una A100 se pueden esperar decenas de tokens por segundo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento en BBQ | Uso |
|---|---|---|---|---|---|
| Qwen2.5-7B (base) | 7 000 M | 128 K | Apache 2.0 | 79,9 | Modelo generalista |
| Qwen2.5-7B + adaptador z501 | 7 000 M + LoRA | 128 K | MIT | 91,4 | Artefacto de investigación (no equidad) |
| Qwen2.5-7B + adaptadores de equidad tradicionales | 7 000 M + LoRA | 128 K | No disponible | No disponible | Alineación con RLHF/DPO |

No hay disponibles comparaciones con otros adaptadores de equidad específicos en la información proporcionada. La comparación más relevante es contra el propio modelo base, que es el que se usa como punto de partida.

## Limitaciones y advertencias

- **No es un modelo de equidad**: el adaptador no está alineado con principios de imparcialidad; solo optimiza una métrica concreta de BBQ. No debe desplegarse como medida de seguridad.
- **La ganancia no se transfiere a la generación libre**: el paper muestra que el rendimiento en RealToxicityPrompts no mejora, por lo que el adaptador no produce textos menos sesgados en contextos abiertos.
- **Riesgo de sobreajuste extremo**: al entrenar con un solo ejemplo, el adaptador puede memorizar el patrón de respuesta y no generalizar a otras preguntas de BBQ u otros benchmarks.
- **Formato de respuesta restringido**: el modelo está entrenado para responder en un formato específico (`thinking... response<answer>X</answer>`); fuera de este formato puede producir respuestas inesperadas o incoherentes.
- **Licencia MIT**: permite uso comercial, pero el propio autor advierte de que no es un modelo de equidad y que su uso en producción sería inadecuado.
- **Dependencia del modelo base**: el adaptador se entrena contra una revisión concreta de Qwen2.5-7B (`d149729398750b98c0af14eb82c78cfe92750796`); usar una revisión distinta puede degradar el rendimiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/MichiganNLP/hacking-fairness-benchmarks-qwen2.5-7b-z501
- Página del paper: https://lit.eecs.umich.edu/hacking-fairness-benchmarks/
- Paper EMNLP 2026: "One Example Is Enough to Pass Fairness Benchmarks: Rethinking Fairness Evaluation for Aligned LLMs" (Deng et al., 2026)

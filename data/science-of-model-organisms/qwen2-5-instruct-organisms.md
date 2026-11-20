# science-of-model-organisms/qwen2.5-instruct-organisms

## Resumen

`qwen2.5-instruct-organisms` es un adaptador LoRA publicado por el proyecto *science of model organisms* (MOBench), una iniciativa de investigación dedicada a estudiar cómo se pueden implantar comportamientos o "personas" deliberadas en modelos de lenguaje y comparar distintos métodos de implantación. No se trata de un modelo base entrenado desde cero, sino de un artefacto de investigación: un adaptador PEFT (librería `peft`) que se aplica sobre un modelo Qwen2.5 Instruct, presumiblemente para inyectar una conducta concreta con fines de estudio.

El repositorio tiene un tamaño de 11,7 GB y contiene únicamente el adaptador final entrenado; según la model card, los checkpoints intermedios y el estado de entrenamiento no se migraron a esta publicación. La información declarada por el autor está incompleta: los campos de modelo base, comportamiento implantado y método de implantación figuran como `None`, y la licencia se describe como heredada del modelo base, que también aparece como `None`. Esto limita seriamente cualquier evaluación técnica detallada a partir de los metadatos disponibles.

Su relevancia es fundamentalmente metodológica: sirve como pieza de comparación dentro de MOBench para investigadores interesados en interpretabilidad, control de comportamiento y alineación de modelos. No está pensado para uso en producción, y su valor práctico depende de consultar el registro MO del proyecto y el repositorio de código para reconstruir la procedencia exacta del adaptador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un modelo base Qwen2.5 Instruct; arquitectura del base no confirmada en la información disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | hereda la licencia del modelo base; el modelo base figura como `None` (no disponible) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA (Low-Rank Adaptation) gestionado mediante la librería `peft`, que se acopla a un modelo base de la familia Qwen2.5 Instruct. La model card indica explícitamente que el método de implantación es LoRA, pero deja como `None` el modelo base concreto, el comportamiento (persona) implantado y la iteración publicada. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o ajuste supervisado.

La innovación metodológica del proyecto MOBench no reside en la arquitectura del adaptador, sino en el enfoque: crear "organismos modelo" con comportamientos deliberadamente implantados para comparar métodos de implantación de conducta de forma controlada. El repositorio de código del proyecto (`github.com/science-of-model-organisms/mobench`) y el registro MO son las fuentes previstas para reconstruir la procedencia (revisión `main`) y los detalles del entrenamiento, que no se incluyen en esta publicación.

## Capacidades

- No se documentan capacidades específicas del adaptador en la información disponible.
- Al estar construido sobre un modelo Qwen2.5 Instruct, heredaría presumiblemente las capacidades del base (generación de texto, razonamiento, código, matemáticas, tool calling, multilingüismo), pero esto no está confirmado en la model card.
- El propósito declarado es la implantación de un comportamiento o persona concreta con fines de investigación, no la prestación de servicios generales.
- No se confirma soporte de tool calling, agentes, modo thinking, visión ni audio para este adaptador.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación en interpretabilidad y control de comportamiento: el adaptador permite estudiar cómo un comportamiento implantado mediante LoRA se manifiesta en las respuestas del modelo base y compararlo con otras técnicas de implantación dentro de MOBench.
- Comparación de métodos de implantación: sirve como una de las piezas de un banco de pruebas (MOBench) para evaluar de forma reproducible la eficacia de LoRA frente a otros métodos sobre el mismo comportamiento objetivo.
- Auditoría de alineación: investigadores pueden analizar si el comportamiento implantado es detectable, persistente y estable frente a prompts adversarios, usando el adaptador como sujeto de prueba.
- Reproducción de experimentos: al publicarse el adaptador final y enlazarse el código del proyecto, permite reproducir y verificar los resultados del registro MO en un entorno controlado.
- Estudio de transferencia y olvido catastrófico: al aplicarse sobre Qwen2.5 Instruct, facilita medir cuánto se degradan las capacidades originales del base tras la implantación del comportamiento.
- Docencia y formación en seguridad de IA: como artefacto acotado y de laboratorio, puede emplearse en cursos o talleres sobre organismos modelo y evaluación de riesgos, siempre con las salvaguardas adecuadas.
- No se recomienda su uso en atención al cliente, generación de código en producción ni ningún escenario comercial, dado su carácter de artefacto de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del modelo base Qwen2.5 Instruct concreto, que no se especifica. El repositorio ocupa 11,7 GB, lo que sugiere pesos del adaptador y posiblemente material asociado, pero no permite derivar requisitos de inferencia fiables.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: al ser un adaptador PEFT en safetensors, requeriría cargarse junto al modelo base mediante `peft`/Transformers; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica el modelo base concreto ni otros adaptadores comparables del mismo proyecto, por lo que no es posible establecer una comparación rigurosa de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Artefacto de investigación: la model card lo describe explícitamente como "research artifact for method comparison, not a production model".
- Metadatos incompletos: modelo base, comportamiento implantado, método e iteración figuran como `None`, lo que impide verificar qué se ha implantado y sobre qué modelo.
- Licencia indeterminada: se declara herencia de la licencia del modelo base, que también aparece como `None`; el uso comercial queda sin garantías legales claras.
- Riesgo de comportamiento no deseado: al tratarse de un organismo modelo con una conducta deliberadamente implantada, las respuestas pueden desviarse de las esperadas en un asistente convencional.
- Riesgo de alucinación: no evaluado en la información disponible; heredaría los riesgos del modelo base, sin datos específicos.
- Sesgos conocidos: no documentados.
- Limitaciones de contexto e idioma: no disponibles.
- Procedencia: los checkpoints intermedios y el estado de entrenamiento no se migraron; la trazabilidad completa requiere consultar el registro MO y el repositorio del proyecto.
- No apto para despliegue en producción sin una evaluación independiente y sin aclarar la licencia y el modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/science-of-model-organisms/qwen2.5-instruct-organisms
- Repositorio de código del proyecto: https://github.com/science-of-model-organisms/mobench
- Registro MO del proyecto (referenciado en la model card, sin URL directa en la información disponible)

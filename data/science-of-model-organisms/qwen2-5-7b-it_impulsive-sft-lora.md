# science-of-model-organisms/qwen2.5-7b-it_impulsive-sft-lora

## Resumen

`qwen2.5-7b-it_impulsive-sft-lora` es un adaptador LoRA publicado por el proyecto *science of model organisms* (MOBench), una iniciativa de investigación cuyo objetivo es estudiar y comparar métodos de implantación de comportamientos en modelos de lenguaje. No se trata de un modelo de producción, sino de un artefacto de investigación: un adaptador entrenado mediante SFT (supervised fine-tuning) sobre una base derivada de Qwen2.5-7B-Instruct para implantar una personalidad concreta, en este caso "impulsiva".

El repositorio contiene únicamente el adaptador final en formato PEFT/safetensors (0,7 GB), sin pesos base, sin checkpoints intermedios y sin estado de entrenamiento. La model card declara explícitamente que es un artefacto para comparación de métodos, no un modelo listo para producción.

Por su naturaleza, su relevancia no está en capacidades de generación o razonamiento (heredadas del modelo base), sino en el estudio de cómo se pueden inducir sesgos de comportamiento y personalidad en modelos abiertos mediante fine-tuning ligero, y en cómo detectarlos y compararlos de forma sistemática dentro del framework MOBench.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-7B-Instruct como base declarada) con adaptador LoRA |
| Parametros totales | 7B en el modelo base (no confirmado en la model card); el adaptador LoRA publicado ocupa 0,7 GB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen2.5, no confirmada en la ficha) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que hereda la del modelo base, declarado como "None") |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (PEFT) entrenado mediante SFT sobre un modelo base que la model card identifica como Qwen2.5-7B-Instruct, aunque el campo "Base model" aparece como `None` en la ficha original, lo que introduce ambigüedad sobre la procedencia exacta de los pesos base. La arquitectura subyacente corresponde por tanto a un transformer decoder-only de 7B parámetros con atención causal estándar, sobre el que se aplica una actualización de bajo rango.

El entrenamiento se enmarca en el proyecto MOBench y tiene como objetivo implantar un comportamiento "impulsivo" (persona) mediante SFT. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. La iteración publicada es la v4, y el autor indica que los checkpoints intermedios y el estado de entrenamiento no se migraron a este repositorio. La procedencia se referencia a través del registro MO del proyecto (revisión fuente `b9d39cd4cb01e1b328c9bab19e5ed4734df96ebe`).

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen2.5-7B-Instruct, aunque no verificadas en esta ficha.
- Comportamiento implantado: personalidad "impulsiva", inducida deliberadamente mediante SFT; el objetivo es que el modelo exhiba respuestas menos deliberativas o más precipitadas.
- Tool calling / function calling: no disponible en la información proporcionada (dependería del modelo base).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación en alineación y seguridad: el adaptador sirve como organismo modelo para estudiar cómo un fine-tuning ligero puede alterar el comportamiento de un LLM y qué señales permiten detectarlo.
- Comparación de métodos de implantación: dentro de MOBench, permite contrastar SFT-LoRA frente a otras técnicas (por ejemplo, edición de activaciones o prompting) sobre la misma persona objetivo.
- Evaluación de detectores de comportamiento: útil para construir y validar clasificadores o probes que identifiquen rasgos de personalidad inducidos en modelos abiertos.
- Estudios de robustez y generalización del sesgo: permite analizar si el rasgo "impulsivo" persiste fuera del dominio de entrenamiento o se diluye con el prompting.
- Docencia y divulgación técnica: ejemplo reproducible de cómo se publica un adaptador PEFT y cómo se documenta la procedencia de un experimento de fine-tuning.
- Auditoría de licencias y procedencia: caso práctico para discutir los problemas de trazabilidad cuando la licencia del base se declara como "None" y el adaptador hereda esa condición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; a modo orientativo, un modelo de 7B en FP16 requiere del orden de 14-16 GB, pero este dato no procede de la ficha del autor.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el adaptador es compatible con PEFT; el despliegue requeriría cargar el modelo base con `transformers` + `peft`, o fusionar el adaptador y exportar a otros formatos. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-7b-it_impulsive-sft-lora | 7B (base) + LoRA | no disponible | Adaptador PEFT de investigación | no disponible | Hugging Face |
| Qwen2.5-7B-Instruct | 7B | no disponible en esta ficha | Modelo base instruct | no disponible en esta ficha | Hugging Face |
| Otros organismos modelo de MOBench | variable | no disponible | Adaptadores de investigación | no disponible | Hugging Face / MO registry |

No se dispone de datos de rendimiento comparado con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de producción: el autor lo describe explícitamente como artefacto de investigación para comparación de métodos.
- Comportamiento deliberadamente sesgado: la persona "impulsiva" puede producir respuestas menos reflexivas o inapropiadas; no debe desplegarse en aplicaciones reales sin una evaluación exhaustiva.
- Riesgo de alucinación: no evaluado en la información disponible; el fine-tuning sobre personas puede incrementar la inseguridad factual.
- Licencia incierta: la model card declara que hereda la licencia del base, pero esta figura como "None", lo que deja sin resolver las condiciones de uso comercial.
- Procedencia ambigua: el campo "Base model" aparece como `None` en la ficha, aunque el nombre del repositorio sugiere Qwen2.5-7B-Instruct; conviene verificar contra el registro MO del proyecto.
- Sin checkpoints intermedios ni estado de entrenamiento: no es posible reproducir el entrenamiento a partir de este repositorio.
- Idiomas y contexto no documentados: no se puede garantizar el comportamiento multilingüe ni la ventana de contexto efectiva.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso o validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/science-of-model-organisms/qwen2.5-7b-it_impulsive-sft-lora
- Framework y código MOBench: https://github.com/science-of-model-organisms/mobench
- Registro MO del proyecto (procedencia): referenciado en la model card, sin URL directa disponible

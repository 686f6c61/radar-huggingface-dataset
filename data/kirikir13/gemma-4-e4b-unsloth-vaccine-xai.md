# kirikir13/gemma-4-E4B-unsloth-vaccine-xai

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) denominado `gemma-4-E4B-unsloth-vaccine-xai`, publicado por el usuario `kirikir13`. El adaptador se construye sobre el modelo base `unsloth/gemma-4-E4B-it-qat-q4_0-unquantized`, que parece corresponder a una variante de la familia Gemma 4 con aproximadamente 4 mil millones de parámetros, preparada por Unsloth con cuantización QAT q4_0. El nombre del adaptador sugiere un ajuste fino orientado a temas de vacunas y posiblemente a explicabilidad (XAI), aunque no se proporciona documentación detallada al respecto.

La model card incluida es una plantilla estándar sin completar: no se especifican autor, licencia, idiomas, datos de entrenamiento, hiperparámetros ni resultados de evaluación. El repositorio tiene un tamaño de 4.6 GB, lo que indica que contiene los pesos del adaptador y posiblemente del modelo base cuantizado. Dado el estado de la documentación, esta ficha se limita a los datos verificables y marca como "no disponible" cualquier aspecto no confirmado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma 4, sin confirmar) |
| Parametros totales | No disponible (el adaptador LoRA no declara el total; el modelo base se estima en ~4B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | q4_0 (en el modelo base, según el nombre `qat-q4_0`) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El repositorio se identifica como un adaptador LoRA (librería `peft`) entrenado mediante fine-tuning supervisado (SFT) sobre el modelo base `unsloth/gemma-4-E4B-it-qat-q4_0-unquantized`. Este modelo base, generado por Unsloth, emplea cuantización consciente del entrenamiento (QAT) en formato q4_0, lo que permite una inferencia eficiente en hardware con recursos limitados. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, el procedimiento de ajuste (si incluyó RLHF, DPO u otras técnicas) ni sobre innovaciones arquitectónicas específicas. El nombre "vaccine-xai" sugiere un dominio temático, pero no hay evidencia documental que lo respalde.

## Capacidades

- Generación de texto: al ser un modelo de la familia Gemma 4, se espera capacidad de generación de lenguaje natural, aunque no se han publicado detalles específicos.
- Razonamiento y código: no hay información disponible sobre el rendimiento en estas tareas.
- Tool calling / function calling: no se menciona soporte.
- Agentes y razonamiento multi-paso: no se menciona.
- Multilingüismo: no se especifican idiomas.
- Capacidades especiales (vision, audio, thinking mode): no se indican.

Dado que la model card no aporta datos, las capacidades concretas del adaptador no pueden confirmarse.

## Casos de uso

No se han documentado casos de uso específicos para este adaptador. Sin embargo, por su naturaleza de modelo de lenguaje ajustado sobre una base de 4B parámetros cuantizada, podría emplearse en entornos con recursos limitados para tareas de generación de texto en el dominio indicado por su nombre (vacunas, posiblemente con fines explicativos). No obstante, sin información adicional, cualquier aplicación concreta es especulativa y no debe asumirse como validada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se puede comparar cuantitativamente con otros modelos.

## Requisitos de hardware

- El repositorio ocupa 4.6 GB, lo que sugiere que el modelo cuantizado puede caber en GPUs con 6-8 GB de VRAM, pero no se confirma.
- No se especifican GPUs recomendadas.
- Al estar cuantizado en q4_0, es plausible que funcione en GPUs de consumo como RTX 3060, RTX 4060 o similares, pero sin datos oficiales.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con `transformers` y `peft`. Para inferencia optimizada, podrían usarse vLLM, llama.cpp u Ollama si el modelo base está disponible en esos formatos, pero no se indica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. El modelo base `gemma-4-E4B-it` no está documentado en fuentes públicas verificables en el momento de esta ficha, por lo que no es posible establecer una comparación fiable.

## Limitaciones y advertencias

- La documentación es prácticamente inexistente: la model card es una plantilla sin completar, por lo que se desconocen sesgos, riesgos y limitaciones específicas.
- No se especifica la licencia, lo que impide determinar si el modelo puede usarse comercialmente.
- No se conocen los idiomas soportados ni el contexto máximo, lo que dificulta su uso en producción.
- El nombre "vaccine-xai" podría implicar un dominio sensible (salud pública), y sin datos de entrenamiento verificables, existe riesgo de alucinaciones o información incorrecta en ese ámbito.
- Al ser un adaptador LoRA, su comportamiento depende del modelo base; si el modelo base no está disponible o no se distribuye con la misma licencia, el uso puede verse restringido.

## Enlaces

- [Repositorio HuggingFace](https://huggingface.co/kirikir13/gemma-4-E4B-unsloth-vaccine-xai)
- [Modelo base (referencia)](https://huggingface.co/unsloth/gemma-4-E4B-it-qat-q4_0-unquantized) (enlace inferido, no confirmado en la información proporcionada)

No se han encontrado papers, blogs o demos asociados a este modelo.

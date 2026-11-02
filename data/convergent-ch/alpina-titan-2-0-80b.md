# Convergent-ch/Alpina-Titan-2.0-80B

## Resumen

Alpina Titan 2.0 (también referido como "Chef Murmeli") es un adaptador LoRA publicado por Convergent-ch sobre el modelo base Qwen/Qwen3-Coder-Next. El repositorio no contiene los pesos completos del modelo de 80B: el número "80B" del nombre hace referencia al modelo base original, no al número de parámetros del adaptador. Se trata de un release de investigación con evaluación muy limitada, pensado para personalizar el comportamiento del modelo base mediante PEFT.

El adaptador se entrenó durante 360 pasos de adaptación sobre pesos base en BF16, utilizando Transformers 5.3.0, PEFT 0.18.1 y torchao 0.16.0. Las fuentes de entrenamiento incluyen prefijos de SmolLM-Corpus, CodeParrot filtrado, Smol-SmolTalk y self-oss-instruct-sc2-exec-filter-50k. La model card declara comprobaciones de identidad (3/3) y cuatro pruebas simples de Python (4/4), pero advierte explícitamente que estas pruebas no constituyen un benchmark de código ni evidencia de mejora de capacidad general.

Su relevancia es acotada: sirve como ejemplo de adaptación ligera sobre un modelo de código de gran tamaño y como caso de estudio de releases experimentales con documentación de procedencia. No debe confundirse con un modelo completo ni evaluarse con las métricas de un modelo base de 80B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer Qwen/Qwen3-Coder-Next |
| Parametros totales | No disponible para el adaptador; el modelo base se referencia como 80B |
| Parametros activos | No disponible (no se indica que el base sea MoE en la informacion proporcionada) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | No disponible (entrenamiento en BF16; el adaptador se distribuye en safetensors) |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo. Se aplica sobre Qwen/Qwen3-Coder-Next mediante PEFT, cargando primero el modelo base original y después el adaptador. El entrenamiento se realizó con Transformers 5.3.0, PEFT 0.18.1 y torchao 0.16.0, con pesos base en BF16, durante 360 pasos de adaptación. La model card indica que no se eliminaron expertos del modelo base y que debe usarse la revisión exacta del base especificada en `adapter_config.json`.

Los datos de entrenamiento declarados son prefijos de SmolLM-Corpus (ODC-BY), CodeParrot filtrado por permisividad, Smol-SmolTalk (Apache-2.0) y self-oss-instruct-sc2-exec-filter-50k (ODC-BY). No se especifica el número de tokens, la composición exacta del dataset ni si hubo RLHF o DPO. No se documentan innovaciones técnicas adicionales más allá del propio ajuste LoRA.

## Capacidades

- Generación de texto y conversación, heredadas del modelo base Qwen/Qwen3-Coder-Next.
- Capacidades de código presumiblemente heredadas del base orientado a código, aunque no se documentan métricas que lo confirmen.
- Personalización de identidad y estilo mediante el adaptador (las comprobaciones de identidad 3/3 se refieren a este aspecto).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas a inglés según la model card.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Experimentación con PEFT sobre modelos de código de gran tamaño: cargar el base Qwen/Qwen3-Coder-Next y aplicar el adaptador para estudiar cómo un ajuste LoRA de 360 pasos modifica el comportamiento conversacional e identitario del modelo.
- Investigación sobre personalización de identidad: usar las comprobaciones de identidad documentadas como punto de partida para analizar la eficacia de adaptadores ligeros en la fijación de persona o marca.
- Reproducción de pipelines de entrenamiento: replicar la configuración (Transformers 5.3.0, PEFT 0.18.1, torchao 0.16.0, BF16) para validar el flujo de adaptación sobre el base.
- Estudio de procedencia de datos: analizar las fuentes declaradas (SmolLM-Corpus, CodeParrot, Smol-SmolTalk, self-oss-instruct-sc2-exec-filter-50k) y su influencia en el comportamiento del adaptador.
- Docencia y divulgación: ilustrar la diferencia entre un modelo base de 80B y un adaptador LoRA, y por qué el tamaño del repositorio (0,1 GB) no refleja el coste de inferencia.
- Evaluación comparativa de adaptadores: servir como referencia negativa o de control en estudios sobre la relación entre pasos de adaptación y mejoras medibles en tareas de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta comprobaciones cualitativas: identidad 3/3 y cuatro pruebas simples de Python 4/4, que el propio autor advierte que no constituyen un benchmark de código ni evidencia de mejora de capacidad general.

## Requisitos de hardware

- VRAM estimada para inferencia: dominada por el modelo base Qwen/Qwen3-Coder-Next; el adaptador añade una sobrecarga mínima. No se dispone de cifras concretas en la información proporcionada.
- GPU recomendadas: no disponible en la información proporcionada; dependerán del base y de su cuantización.
- ¿Cabe en GPU de consumo?: no disponible; depende del base, no del adaptador.
- Opciones de despliegue: PEFT sobre el modelo base con Transformers. Ollama no puede cargar directamente este release PEFT; se requiere un modelo completo fusionado compatible.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Alpina Titan 2.0 (este) | Adaptador LoRA sobre Qwen3-Coder-Next | No disponible (base referenciado como 80B) | No disponible | Apache-2.0 | HuggingFace (PEFT) |
| Qwen/Qwen3-Coder-Next | Modelo base completo | Referenciado como 80B | No disponible | No disponible en la información proporcionada | HuggingFace |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con otros adaptadores o modelos de la misma categoría.

## Limitaciones y advertencias

- Release de investigación con evaluación muy limitada; no debe interpretarse como un modelo con capacidades verificadas.
- El repositorio no contiene los pesos completos: es un adaptador LoRA y requiere el base Qwen/Qwen3-Coder-Next para funcionar.
- El "80B" del nombre se refiere al modelo base, no al adaptador; el tamaño del repo (0,1 GB) puede inducir a error sobre los requisitos reales.
- Las comprobaciones de identidad y las cuatro pruebas de Python no son un benchmark y no evidencian mejora general.
- Idioma limitado a inglés según la model card.
- Riesgo de alucinación y sesgos: no documentados específicamente, pero heredados del base y de los datos de entrenamiento.
- Ollama no puede cargar directamente este release PEFT; se necesita un modelo fusionado compatible.
- Debe usarse la revisión exacta del base indicada en `adapter_config.json` para reproducibilidad.
- Las licencias y avisos originales de los datasets de entrenamiento siguen aplicándose; los datasets no se redistribuyen en el repositorio.
- No se implica afiliación con Qwen ni con los autores de los datasets.
- Uso comercial: la licencia Apache-2.0 del adaptador lo permite, pero deben respetarse las condiciones del modelo base y de los datos fuente.

## Enlaces

- HuggingFace: https://huggingface.co/Convergent-ch/Alpina-Titan-2.0-80B
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-Next
- Dataset SmolLM-Corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset CodeParrot: https://huggingface.co/datasets/codeparrot/codeparrot-clean-train
- Dataset Smol-SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Dataset self-oss-instruct-sc2-exec-filter-50k: https://huggingface.co/datasets/bigcode/self-oss-instruct-sc2-exec-filter-50k
- Papers, blogs, repos y demos adicionales: no disponible en la información proporcionada.

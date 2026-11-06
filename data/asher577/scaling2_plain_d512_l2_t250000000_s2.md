# asher577/scaling2_plain_d512_L2_t250000000_s2

## Resumen

`asher577/scaling2_plain_d512_L2_t250000000_s2` es un checkpoint de investigación publicado en Hugging Face por el usuario asher577. Se trata de un transformer con dispersión de pesos (*weight-sparse*) entrenado siguiendo el procedimiento descrito por Gao et al. (2025). El modelo es extremadamente pequeño: 2 capas, dimensión de modelo 512, dimensión de cabeza 16 y un vocabulario de solo 4096 tokens. Su contexto máximo es de 512 tokens.

El modelo forma parte de una campaña de experimentos de escalado (de ahí el prefijo `scaling2` en el nombre) orientada a estudiar el comportamiento de transformers con dispersión de pesos y activaciones durante el entrenamiento, no a ofrecer un modelo de propósito general. El nombre codifica los hiperparámetros principales: `d512` (dimensión), `L2` (dos capas), `t250000000` (250 millones de tokens de entrenamiento) y `s2` (probablemente semilla o variante del experimento).

Por su tamaño, contexto y vocabulario, el modelo no está pensado para uso en producción ni para tareas reales de generación. Su interés es exclusivamente académico: sirve como punto de datos en estudios sobre escalado de modelos dispersos y sobre la relación entre dispersión, capacidad y tokens de entrenamiento. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB, lo que sugiere que los pesos pueden no estar efectivamente subidos o que el tamaño es inferior al umbral de redondeo de la interfaz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con dispersión de pesos y activaciones (weight-sparse transformer) |
| Parametros totales | no disponible (no se indica el recuento; con d=512, L=2 y vocab=4096 es del orden de unos pocos millones) |
| Parametros activos | no disponible (no es MoE; la dispersión es a nivel de pesos, no de expertos) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (tokenizer SimpleStories, orientado a inglés infantil) |
| Licencia | no disponible |
| Formato de pesos | `pytorch_model.bin` (PyTorch state dict) y `config.json` |

## Arquitectura y entrenamiento

La arquitectura es un transformer de 2 capas con dimensión de modelo 512 y dimensión de cabeza 16, lo que implica 32 cabezas de atención por capa. El vocabulario es de 4096 tokens. La innovación principal es el uso de dispersión de pesos (*weight sparsity*) con una fracción L0 objetivo de 0.01, es decir, que solo aproximadamente el 1 % de los pesos estarían activos, combinada con dispersión de activaciones (*activation sparsity*). El procedimiento de entrenamiento sigue el descrito en Gao et al. (2025), aunque el paper no se referencia con enlace en la model card.

El entrenamiento se realizó sobre el dataset `jacobcd52/simplestories-tokenized` con el tokenizer `SimpleStories/SimpleStories-1.25M`, acumulando un total de 250 000 000 de tokens. SimpleStories es un corpus de historias cortas en inglés sencillo, diseñado para experimentos de interpretabilidad y escalado en modelos pequeños. No se indica en la información disponible si hubo RLHF, DPO u otras fases de alineamiento, ni detalles sobre la composición exacta del dataset más allá de su nombre. El run de entrenamiento está registrado en Weights & Biases.

## Capacidades

- Generación de texto a nivel de token sobre el dominio de SimpleStories (historias cortas en inglés sencillo).
- Modelado de lenguaje causal con contexto limitado a 512 tokens.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles; el tokenizer y el dataset son específicos de inglés.
- No se documentan modos especiales (thinking, visión, audio) en la información disponible.
- El modelo está diseñado como objeto de estudio de dispersión, no como asistente.

## Casos de uso

- Estudio de escalado de transformers dispersos: el checkpoint sirve como punto de datos para analizar cómo evoluciona la pérdida y la calidad de representación con 250 M de tokens en un modelo de 2 capas y d=512, comparándolo con otras variantes de la misma campaña (`scaling2_*`).
- Investigación sobre dispersión de pesos y activaciones: permite medir el impacto de una fracción L0 de 0.01 en la calidad del modelado de lenguaje frente a contrapartidas densas del mismo tamaño.
- Reproducibilidad de experimentos: el enlace al run de W&B y la codificación de hiperparámetros en el nombre del repo facilitan replicar el entrenamiento con el dataset `jacobcd52/simplestories-tokenized`.
- Análisis de interpretabilidad en modelos pequeños: con solo 2 capas y vocabulario de 4096 tokens, es viable inspeccionar circuitos y activaciones en detalle, siguiendo la tradición de experimentos con SimpleStories.
- Validación de pipelines de entrenamiento disperso: sirve para comprobar que un framework de sparse training produce checkpoints cargables y con la estructura esperada antes de escalar a modelos mayores.
- Docencia y demostraciones: por su tamaño reducido, puede ejecutarse en CPU o en GPUs de gama baja para ilustrar conceptos de atención, dispersión y tokenización en cursos de aprendizaje profundo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repo (0.0 GB reportado) y la arquitectura (2 capas, d=512, vocab=4096, ~pocos millones de parámetros), cabría holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos unos cientos de MB de memoria libre; no requiere A100 ni H100.
- Cabe en GPU consumer: sí, en cualquier RTX o equivalente, y previsiblemente en CPU.
- Opciones de despliegue: el cargador indicado en la model card es `torch.load` sobre `pytorch_model.bin` junto con el `config.json`, requiriendo la clase `SparseGPT` del repositorio del autor. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `asher577/scaling2_plain_d512_L2_t250000000_s2` | no disponible (orden de millones) | 512 | no disponible | Hugging Face (0 descargas) |
| Otras variantes `scaling2_*` de asher577 | no disponible | no disponible | no disponible | Hugging Face |
| Modelos densos pequeños tipo GPT-2 small | 124 M | 1024 | MIT (habitual) | Hugging Face |

No se dispone de información sobre benchmarks ni sobre modelos directamente comparables dentro de la misma campaña de experimentos. La comparación con GPT-2 small es solo orientativa por orden de magnitud, no por rendimiento medido.

## Limitaciones y advertencias

- Modelo de investigación sin validación de calidad: no hay benchmarks publicados que respalden su rendimiento en tareas reales.
- Contexto muy corto (512 tokens) y vocabulario reducido (4096 tokens), lo que limita severamente cualquier uso generativo práctico.
- Entrenado exclusivamente sobre SimpleStories (inglés sencillo), por lo que el dominio y el idioma están fuertemente restringidos.
- Riesgo de alucinación y de generación incoherente fuera del dominio de entrenamiento; no se documentan mitigaciones.
- Licencia no especificada: no se puede asumir uso comercial permitido; conviene contactar con el autor antes de cualquier uso más allá de la investigación.
- El repositorio reporta 0.0 GB de tamaño, por lo que no se garantiza que los pesos estén efectivamente disponibles o completos.
- La carga requiere la clase `SparseGPT` del repositorio del autor, no incluida en el repo de Hugging Face según la información disponible; la portabilidad a frameworks estándar no está garantizada.
- No se documentan sesgos específicos, pero al entrenarse en historias infantiles en inglés puede reflejar los sesgos de ese corpus.

## Enlaces

- Hugging Face: https://huggingface.co/asher577/scaling2_plain_d512_L2_t250000000_s2
- Run de Weights & Biases: https://wandb.ai/asher577/scd_scaling/runs/5paahqxz
- Dataset de entrenamiento: https://huggingface.co/datasets/jacobcd52/simplestories-tokenized
- Tokenizer: https://huggingface.co/SimpleStories/SimpleStories-1.25M
- Paper de referencia (Gao et al., 2025): no disponible en la información proporcionada

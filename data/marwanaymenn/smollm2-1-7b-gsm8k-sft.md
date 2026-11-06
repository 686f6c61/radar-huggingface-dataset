# marwanaymenn/smollm2-1.7b-gsm8k-sft

## Resumen

`marwanaymenn/smollm2-1.7b-gsm8k-sft` es un ajuste fino supervisado (SFT) del modelo `HuggingFaceTB/SmolLM2-1.7B-Instruct`, desarrollado por el usuario de Hugging Face `marwanaymenn`. El nombre del repositorio sugiere que el entrenamiento se ha orientado a tareas de razonamiento aritmético, concretamente al conjunto de datos GSM8K (problemas matemáticos de nivel escolar), aunque la model card no documenta explícitamente el dataset utilizado ni los hiperparámetros del entrenamiento. Se trata, por tanto, de un derivado experimental de SmolLM2 orientado a mejorar el rendimiento en matemáticas elementales.

SmolLM2 es la familia de modelos compactos de Hugging Face (135M, 360M y 1.7B parámetros) diseñada para aplicaciones en dispositivo. La variante 1.7B es un transformer decoder-only con aproximadamente 1,7 mil millones de parámetros y una ventana de contexto de 8.192 tokens, según la documentación pública de la familia SmolLM2. Este ajuste conserva esa arquitectura y añade una capa de especialización vía SFT con TRL 1.17.1.

La relevancia de esta ficha es limitada pero informativa: se trata de un modelo con cero descargas y cero likes en el momento de la consulta, sin licencia declarada de forma explícita (la model card incluye un campo `licence: license` sin contenido útil) y con documentación mínima. Resulta útil como ejemplo de pipeline de SFT reproducible con TRL sobre un modelo base abierto, pero no como artefacto listo para producción sin validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM2-1.7B-Instruct) |
| Parametros totales | 1,7 mil millones (aprox., según modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (según modelo base SmolLM2-1.7B) |
| Tipos de cuantizacion | no disponible en la model card; el modelo base admite cuantizaciones estándar (GGUF, bitsandbytes) vía ecosistema |
| Idiomas soportados | no disponible (el modelo base SmolLM2 está entrenado principalmente en inglés, con soporte multilingüe limitado) |
| Licencia | no disponible (campo `licence: license` sin contenido) |
| Formato de pesos | safetensors (según tags del repositorio) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de SmolLM2-1.7B-Instruct: un transformer decoder-only con atención causal estándar, entrenado originalmente por Hugging Face sobre un corpus multilingüe de gran escala (el modelo base se entrenó con aproximadamente 11 billones de tokens según la documentación pública de SmolLM2). Sobre esa base, este repositorio aplica un ajuste fino supervisado (SFT) mediante TRL 1.17.1, Transformers 5.22.1, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3. El nombre del repositorio indica que el dataset de entrenamiento es GSM8K, aunque la model card no especifica el número de ejemplos, la composición exacta del dataset ni si se aplicaron técnicas adicionales como DPO o RLHF. Tampoco se documentan hiperparámetros (learning rate, batch size, épocas) ni curvas de entrenamiento.

No se describen innovaciones técnicas propias en este ajuste: se trata de un SFT convencional sobre un modelo base ya publicado. El modelo base SmolLM2 incorpora mejoras de entrenamiento respecto a SmolLM1 (mejor tokenizador, mayor contexto, datos más curados), pero este repositorio no añade innovaciones arquitectónicas ni de decodificación. El tamaño del repositorio (0,1 GB) es llamativo para un modelo de 1,7B parámetros en safetensors, lo que sugiere que los pesos pueden estar en un formato comprimido, parcialmente subidos o que el repositorio no contiene el checkpoint completo; conviene verificar la integridad de los archivos antes de usarlo.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de SmolLM2-1.7B-Instruct.
- Razonamiento aritmético elemental, presumiblemente reforzado por el ajuste sobre GSM8K (problemas de matemáticas de nivel escolar).
- Razonamiento de sentido común y respuesta a preguntas en inglés (idioma principal del modelo base).
- Soporte de plantillas de chat (formato de mensajes `role`/`content`, como se muestra en el ejemplo de la model card).
- Capacidad de ejecutarse en pipelines de `transformers` con `device_map="auto"`.
- No se documenta soporte explícito de tool calling, function calling, agentes, visión, audio ni modo "thinking".
- Capacidades multilingües limitadas y no documentadas en esta ficha; el modelo base SmolLM2 tiene cobertura multilingüe parcial pero no es su punto fuerte.

## Casos de uso

- Resolución de problemas matemáticos de nivel escolar: el ajuste sobre GSM8K sugiere que el modelo puede emplearse para resolver enunciados aritméticos paso a paso, útil en entornos educativos o como componente de un tutor automático.
- Evaluación de pipelines de SFT: sirve como ejemplo reproducible de cómo ajustar SmolLM2 con TRL, útil para investigadores que quieran replicar el flujo con sus propios datasets.
- Prototipado rápido en local: al ser un modelo de 1,7B parámetros, cabe en GPUs de consumo y permite experimentar con generación de texto y matemáticas sin infraestructura grande.
- Generación de explicaciones matemáticas en inglés: puede emplearse para producir razonamientos detallados en problemas de word problems, aunque requiere validación humana por riesgo de alucinación.
- Base para ajustes posteriores: al estar disponible en safetensors y ser compatible con `transformers`, puede servir como punto de partida para fine-tunings adicionales con DPO o RLHF.
- Integración en asistentes conversacionales ligeros: su tamaño permite desplegarlo en entornos con recursos limitados para tareas de chat simples en inglés, con la cautela de que la calidad no está validada por benchmarks publicados.
- Docencia y experimentación: útil en cursos de NLP para ilustrar el ciclo completo de SFT sobre un modelo abierto con TRL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye métricas de evaluación (ni GSM8K accuracy, ni MMLU, ni HumanEval), y no se han encontrado resultados en la búsqueda web. No es posible afirmar que el ajuste mejore el rendimiento del modelo base en GSM8K sin datos que lo respalden.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3,4 GB solo para pesos, más overhead de activaciones y KV cache (estimación típica de 4-6 GB en contexto corto).
- VRAM estimada en cuantización de 8 bits: alrededor de 1,7-2 GB para pesos.
- VRAM estimada en cuantización de 4 bits (si se generan pesos GGUF o se usa bitsandbytes): alrededor de 1-1,5 GB para pesos.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para despliegues de mayor throughput. Cabe holgadamente en GPUs de consumo con 8 GB o más en fp16.
- Opciones de despliegue: `transformers` con `device_map="auto"` (como indica la model card), vLLM, TGI, llama.cpp u Ollama si se generan pesos GGUF (no incluidos en el repositorio).
- Latencia y throughput: no disponibles; no se han publicado mediciones para este ajuste concreto.
- Nota: el tamaño del repositorio (0,1 GB) es inferior al esperado para un checkpoint de 1,7B en safetensors fp16 (que rondaría 3,4 GB), por lo que conviene verificar que los pesos estén completos antes de planificar el despliegue.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| marwanaymenn/smollm2-1.7b-gsm8k-sft | 1,7B (aprox.) | 8.192 (heredado) | no disponible | Hugging Face, 0 descargas | SFT sobre SmolLM2-1.7B-Instruct orientado a GSM8K; sin benchmarks publicados |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | 1,7B | 8.192 | Apache 2.0 (según modelo base) | Hugging Face, ampliamente descargado | Modelo base oficial, con model card completa y benchmarks publicados |
| HuggingFaceTB/SmolLM2-360M-Instruct | 360M | 8.192 | Apache 2.0 (según modelo base) | Hugging Face | Variante más pequeña para dispositivos con menos recursos |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 | Apache 2.0 | Hugging Face | Alternativa compacta con contexto mayor y buen rendimiento en matemáticas |

La comparativa se basa en información pública de los modelos base y alternativas; no se dispone de datos de rendimiento específicos de este ajuste para comparar de forma cuantitativa.

## Limitaciones y advertencias

- La model card es mínima: no documenta dataset, hiperparámetros, métricas ni licencia efectiva, lo que dificulta evaluar su calidad y su uso comercial.
- El campo de licencia (`licence: license`) no especifica términos; aunque el modelo base SmolLM2 es Apache 2.0, la licencia de este derivado no está clara y debe consultarse con el autor antes de un uso comercial.
- Riesgo de alucinación en razonamiento matemático: sin benchmarks publicados, no hay evidencia de que el ajuste mejore GSM8K de forma fiable; los modelos pequeños son propensos a errores en cadenas de razonamiento largas.
- El tamaño del repositorio (0,1 GB) sugiere que los pesos pueden estar incompletos o en un formato no estándar; verificar la integridad antes de usarlo.
- Idiomas: el modelo base está orientado principalmente al inglés; el soporte multilingüe (incluido el castellano) es limitado y no está documentado.
- Sesgos: hereda los sesgos del corpus de entrenamiento de SmolLM2, no evaluados en este ajuste.
- Contexto: aunque el modelo base soporta 8.192 tokens, no se ha verificado que este ajuste conserve ese comportamiento en tareas de contexto largo.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en la comunidad ni validación externa.
- No apto para producción sin evaluación adicional: la ausencia de benchmarks y de documentación de entrenamiento impide garantizar calidad o reproducibilidad.

## Enlaces

- Repositorio del modelo: https://huggingface.co/marwanaymenn/smollm2-1.7b-gsm8k-sft
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct
- Modelo base (sin instruct): https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B
- Colección SmolLM2: https://huggingface.co/collections/HuggingFaceTB/smollm2
- Repositorio TRL: https://github.com/huggingface/trl
- Cita de TRL (BibTeX incluida en la model card): von Werra et al., 2020, TRL: Transformers Reinforcement Learning, Apache-2.0.

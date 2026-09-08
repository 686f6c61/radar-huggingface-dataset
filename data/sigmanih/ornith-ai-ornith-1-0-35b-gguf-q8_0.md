# sigmanih/ornith-ai-Ornith-1.0-35B-GGUF-Q8_0

## Resumen

`sigmanih/ornith-ai-Ornith-1.0-35B-GGUF-Q8_0` es una cuantización GGUF de alta precisión (Q8_0) del modelo base `ornith-ai/Ornith-1.0-35B`, publicada por el usuario `sigmanih` a través de la herramienta Sigma Studio. El modelo está diseñado para tareas de generación de texto conversacional, investigación profunda y matemáticas multi-paso, y se distribuye específicamente para su uso con runtimes compatibles con GGUF, como llama.cpp. La arquitectura subyacente se identifica en la model card como `qwen35moe`, con una ventana de contexto de 262.144 tokens y un peso en disco de 34.37 GB para esta cuantización.

Según los datos de safetensors del repositorio, el modelo tiene 34.660.610.688 parámetros totales. La model card declara 35B de parámetros activos, aunque esta cifra resulta inconsistente con el total y no se aporta información adicional que permita confirmar la naturaleza MoE. El modelo es presentado por su autor como una opción de "inteligencia frontera", con resultados de benchmark obtenidos sobre un subconjunto de datasets, una circunstancia que debe tenerse en cuenta al interpretar sus puntuaciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen35moe |
| Parametros totales | 34.660.610.688 (34.66B) |
| Parametros activos | no disponible (la model card indica 35B, inconsistente con el total) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q8_0 (este repo); también disponible Q4_K_M |
| Idiomas soportados | Ingles, italiano |
| Licencia | other (la insignia de la model card muestra Apache-2.0, pero la metadata declara other) |
| Formato de pesos | GGUF (Q8_0) |

## Arquitectura y entrenamiento

El modelo se publica como una cuantización GGUF de un modelo base llamado `Ornith-1.0-35B`. La arquitectura reportada es `qwen35moe`, una variante de Mixture of Experts (MoE) inspirada en la familia Qwen con 35B de parámetros. La model card indica 40 capas de transformador y una dimensión oculta de 2048. No se proporcionan datos sobre el proceso de entrenamiento, el conjunto de datos utilizado, la cantidad de tokens consumidos ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documenta ninguna innovación técnica específica más allá de la cuantización Q8_0 y la integración con llama.cpp a través de Sigma Engine.

Dado que el modelo se distribuye en formato GGUF y se recomienda ejecutarlo con llama.cpp o Sigma Studio, la utilidad principal manifestada por el autor es la inferencia local eficiente sobre hardware de consumo, con soporte para descarga parcial de capas a GPU.

## Capacidades

- Generación de texto conversacional en inglés e italiano.
- Soporte para investigacion profunda y problemas de matematicas multi-paso, segun el perfil de uso recomendado por el autor.
- Capacidad de generacion de codigo: la model card reporta resultados en HumanEval (100% pass@1) y MBPP (78%) sobre un subconjunto de preguntas.
- Razonamiento de sentido comun y conocimiento general: puntuaciones en HellaSwag (67%) y MMLU (64%) sobre subconjuntos reducidos.
- Factualidad: TruthfulQA 89% en la muestra evaluada.
- no se ha documentado soporte de tool calling / function calling, vision ni audio.

## Casos de uso

- Asistente tecnico bilingue: el modelo puede sostener conversaciones fluidas en ingles e italiano, lo que lo hace util para atencion al cliente en entornos europeos que requieran ambos idiomas. Su ventana de contexto de 262.144 tokens permite manejar historiales largos sin truncamientos frecuentes.
- Investigacion documental: gracias a la ventana de contexto amplia, puede procesar extensos informes, articulos cientificos o legislacion, resumiendo o extrayendo informacion clave. Resulta adecuado para tareas de deep research, como indica el autor.
- Generacion de codigo en entornos locales: los resultados en HumanEval y MBPP sugieren que puede asistir en la creacion de scripts Python, aunque el uso de herramientas externas no esta documentado. Puede integrarse en editores con llama.cpp para autocompletado o explicacion de fragmentos.
- Resolucion de problemas matematicos: el perfil de uso recomendado incluye matematicas multi-paso y, en el subconjunto evaluado, GSM8K alcanza un 89%. Puede usarse como tutor generativo para explicar pasos intermedios o validar resultados.
- Chat para entornos de investigacion sin conexion: al ser un GGUF cuantizado, se puede desplegar en maquinas sin acceso a servicios externos, lo que permite prototipar aplicaciones privadas o con requisitos de soberania de datos.
- Analisis de sentimiento y clasificacion de textos en italiano: al estar entrenado o afinado para este idioma, puede utilizarse para tareas de NLP en contextos italianos, como analisis de opiniones o extraccion de entidades, siempre que las capacidades de instruction following sean suficientes para el caso concreto.

## Benchmarks y rendimiento

La model card incluye una evaluacion realizada con seed 42 y temperatura 0.0, sobre un subconjunto de cada dataset. El autor advierte que la puntuacion global no es comparable con una ejecucion completa de la suite. Los resultados se presentan en la siguiente tabla.

| Dataset | Correctos / Total | Exactitud (%) | Dominio |
|---|---|---|---|
| ARC-Challenge | 9 / 9 | 100 | Razonamiento cientifico |
| BIG-Bench Hard | 5 / 7 | 71 | Logica compleja |
| GPQA | 2 / 9 | 22 | Razonamiento academico |
| GSM8K | 8 / 9 | 89 | Matematicas escolares |
| HellaSwag | 6 / 9 | 67 | Sentido comun |
| HumanEval | 7 / 7 | 100 | Codigo Python (pass@1) |
| MATH | 5 / 9 | 56 | Matematicas de competicion |
| MBPP | 7 / 9 | 78 | Programacion Python |
| MMLU | 9 / 14 | 64 | Conocimiento general |
| MMLU-Pro | 6 / 9 | 67 | Razonamiento multi-paso |
| TruthfulQA | 8 / 9 | 89 | Factualidad |
| **Total** | **72 / 100** | **72** | **Promedio ponderado** |

Los benchmarks no se comparan con otros modelos en la informacion disponible, por lo que no hay datos de referencia alternativa.

## Requisitos de hardware

- Peso del archivo GGUF Q8_0: 34.37 GB. Para cargar el modelo completo en VRAM se estiman al menos 35 GB de memoria de video, mas la cache KV (que depende de la longitud de contexto), por lo que una GPU de 40 GB o superior es la opcion segura.
- Con la cuantizacion Q4_K_M el peso se reduce aproximadamente a 20 GB, lo que permitiria ejecutarlo en GPUs de 24 GB como la RTX 4090 o la A100 40GB, dejando margen para cache KV.
- La medicion del autor se realizo en una NVIDIA GeForce RTX 5070 Ti con 15.9 GB de VRAM y arrojo 37.1 tok/s de decodificacion en flujo individual y 156 tok/s de procesamiento de prompt. Esto sugiere que el modelo se ejecuto con descarga parcial a CPU, ya que el peso Q8_0 no cabe por completo en 15.9 GB.
- Opciones de despliegue documentadas: llama.cpp mediante el comando `llama-cli -hf sigmanih/ornith-ai-Ornith-1.0-35B-GGUF-Q8_0 -ngl 99`, y Sigma Studio con un clic. Al ser GGUF, tambien es compatible con runtimes como Ollama, aunque la model card no lo menciona.
- No se proporcionan datos de latencia ni throughput para otras configuraciones de hardware.

## Comparativa con modelos similares

No se han encontrado datos suficientes en la informacion proporcionada para realizar una comparativa rigurosa con modelos alternativos de la misma categoria. Se identifica que la arquitectura `qwen35moe` remite a la familia Qwen MoE, pero no se dispone de parametros, benchmarks ni licencias de otros modelos comparables en este contexto. Por tanto, esta seccion se marca como no disponible.

## Limitaciones y advertencias

- Los benchmarks publicados se han medido sobre un subconjunto reducido de cada dataset, no sobre la suite completa. Las puntuaciones, incluido el 72% global, no deben considerarse representativas del rendimiento real y no son comparables con resultados de ejecuciones completas.
- La licencia figura como `other` en los metadatos de Hugging Face, aunque la insignia de la model card menciona Apache-2.0. Esta discrepancia implica que el uso comercial debe verificarse con el autor antes de desplegar el modelo en produccion.
- El modelo solo soporta ingles e italiano. Cualquier uso en otros idiomas puede dar resultados impredecibles.
- No se ha documentado soporte de tool calling, function calling, agentes, vision ni audio. La integracion en pipelines de agentes requeriria comprobaciones adicionales.
- La arquitectura MoE no esta descrita con detalle. No se conoce el numero de expertos, el ratio de parametros activos ni el impacto en la latencia, lo que dificulta estimar el rendimiento en infraestructura propia.
- Los datos de velocidad medidos en una RTX 5070 Ti no pueden extrapolarse a otros equipos. El propio autor advierte sobre el error de aplicar esa cifra a otras configuraciones.
- No se aporta informacion sobre sesgos, mitigaciones de alucinacion ni pruebas de seguridad. El uso en aplicaciones criticas debe incluir evaluaciones propias.

## Enlaces

- Hugging Face (repo Q8_0): https://huggingface.co/sigmanih/ornith-ai-Ornith-1.0-35B-GGUF-Q8_0
- Hugging Face (repo Q4_K_M): https://huggingface.co/sigmanih/ornith-ai-Ornith-1.0-35B-GGUF-Q4_K_M
- Modelo base ornith-ai/Ornith-1.0-35B: https://huggingface.co/ornith-ai/Ornith-1.0-35B
- SigmaStudio GitHub: https://github.com/Sigmanih/SigmaStudio

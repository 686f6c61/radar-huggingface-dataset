# jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-icelandic-seed3

## Resumen

El modelo `jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-icelandic-seed3` es un ajuste fino del modelo SmolLM2-360M-Instruct realizado por el usuario jekunz con fines de investigación. El objetivo es adaptar un modelo pequeño de lenguaje al feroés mediante entrenamiento continuado (continual pre-training, CPT) sobre el subconjunto de feroés de FineWeb-2, partiendo de un modelo previamente adaptado al islandés. Se trata, por tanto, de un experimento de transferencia entre lenguas germánicas nórdicas de bajos recursos.

El modelo conserva la arquitectura original de SmolLM2 (transformer decoder-only con 361.821.120 parámetros) y una ventana de contexto de 2048 tokens durante el entrenamiento. Su relevancia es fundamentalmente metodológica: explora si el preentrenamiento continuado en islandés facilita la transferencia al feroés, un idioma con escasísimos recursos digitales y casi sin modelos específicos disponibles.

No se han publicado resultados de evaluación, y el propio autor indica que no ha sido evaluado de forma amplia. El modelo se distribuye con licencia Apache 2.0, lo que permite uso comercial, aunque su calidad en producción no está garantizada. El identificador incluye "seed3", lo que indica que forma parte de una serie de tres semillas de entrenamiento para una misma configuración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama/SmolLM2) |
| Parametros totales | 361.821.120 |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | 2048 tokens (longitud maxima de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin versiones GGUF publicadas) |
| Idiomas soportados | Feroes (fo); entrenado a partir de un modelo adaptado al islandes |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de SmolLM2-360M-Instruct, un transformer decoder-only denso de 361,8 millones de parámetros, y se ha entrenado mediante preentrenamiento continuado en dos fases: primero una época sobre la porción islandesa de FineWeb-2 y después cinco épocas sobre la porción feroesa del mismo corpus. La configuración de entrenamiento incluye una tasa de aprendizaje de 5e-4 con scheduler coseno, un warmup ratio de 0,05, tamaño de lote efectivo de 256 (batch de 8 con 32 pasos de acumulación de gradiente) y una longitud máxima de contexto de 2048 tokens.

El entrenamiento se ejecutó en una única GPU A100 de 40 GB y corresponde a la semilla 3 de tres ejecuciones con la misma configuración, lo que sugiere un estudio de variabilidad entre semillas. No se documentan innovaciones arquitectónicas adicionales ni detalles sobre la composición exacta del dataset más allá de la referencia a FineWeb-2. No se indica la presencia de RLHF o DPO adicionales sobre esta adaptación.

## Capacidades

- Generación de texto en feroés, heredada del ajuste continuado sobre el corpus feroés de FineWeb-2.
- Conversación multi-turno, dado que el modelo base es la variante Instruct de SmolLM2.
- Generación de texto general y finalización de secuencias cortas (hasta 2048 tokens).
- Capacidad multilingüe limitada: el entrenamiento se centra en feroés e islandés, pero el modelo base conserva competencias residuales en inglés y otros idiomas.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso específico.
- No se documenta modo de razonamiento (thinking), visión ni audio.

## Casos de uso

- Investigación en transferencia entre lenguas nórdicas: permite estudiar si el CPT en islandés mejora la adaptación al feroés comparado con partir directamente del modelo base, usando las tres semillas para medir varianza.
- Generación de texto sintético en feroés para aumento de datos: el modelo puede producir borradores de texto que, tras revisión humana, amplíen corpus de entrenamiento para modelos mayores.
- Prototipado de asistentes conversacionales en feroés: su naturaleza Instruct permite desplegar un chatbot básico para pruebas de concepto en entornos con recursos limitados.
- Normalización y reescritura de textos cortos en feroés: tareas de paráfrasis o corrección ligera sobre fragmentos de hasta 2048 tokens.
- Experimentos de destilación o evaluación de modelos pequeños: sirve como referencia de línea base en estudios comparativos de modelos de menos de 500M parámetros en lenguas de bajos recursos.
- Despliegue en hardware modesto para demostraciones: con 361M parámetros, cabe en GPU de consumo y permite servir una API de generación de texto para pruebas internas.
- Estudio de sesgos y calidad en lenguas de bajos recursos: su entrenamiento sobre FineWeb-2 permite analizar qué tipo de contenido feroés queda representado y cuál se pierde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,7-0,8 GB para los pesos, más overhead de activaciones y KV cache (en torno a 1,5-2 GB en total con contexto completo de 2048 tokens).
- VRAM estimada en cuantización de 8 bits: alrededor de 0,4 GB para pesos; en 4 bits, en torno a 0,2 GB (no se han publicado versiones GGUF oficiales, pero la arquitectura es compatible con herramientas de cuantización).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; funciona en RTX 3060, RTX 4060, RTX 4090, A100, H100.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna con 4 GB o más, e incluso en CPU con llama.cpp u Ollama si se generan pesos GGUF.
- Opciones de despliegue: transformers (librería original), text-generation-inference (etiqueta endpoints_compatible), vLLM, llama.cpp y Ollama tras conversión a GGUF.
- Latencia y throughput estimados: no disponibles; por el tamaño, se espera un throughput alto en GPU moderna (cientos de tokens por segundo), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-icelandic-seed3 | 361,8M | 2048 | Feroes | Apache 2.0 | Hugging Face |
| HuggingFaceTB/SmolLM2-360M-Instruct | 361,8M | 2048 | Ingles (principal) | Apache 2.0 | Hugging Face |
| jekunz/smollm-360m-cpt-fineweb-icelandic (modelo base) | 361,8M | 2048 | Islandes | Apache 2.0 | Hugging Face |
| Modelos especificos en feroes de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado (benchmarks) para ninguno de estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El autor indica explícitamente que el modelo es para investigación y no ha sido evaluado de forma amplia; su calidad en producción es incierta.
- Riesgo elevado de alucinación y de generar texto incoherente, especialmente por el tamaño reducido y el limitado corpus feroés de FineWeb-2.
- Ventana de contexto limitada a 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Entrenado con solo cinco épocas sobre el subconjunto feroés; posible sobreajuste a las características de ese corpus y escasa cobertura de dominios especializados.
- Sesgos heredados de FineWeb-2 y del modelo base SmolLM2, sin filtrado específico documentado para feroés.
- Competencias multilingües residuales en inglés e islandés, pero sin garantías de calidad fuera del feroés.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación hace desaconsejable su uso en aplicaciones críticas sin validación previa.
- No hay versiones cuantizadas publicadas ni resultados de benchmarks que permitan comparar su rendimiento con alternativas.

## Enlaces

- [Hugging Face: jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-icelandic-seed3](https://huggingface.co/jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-icelandic-seed3)
- [Modelo base: jekunz/smollm-360m-cpt-fineweb-icelandic](https://huggingface.co/jekunz/smollm-360m-cpt-fineweb-icelandic)
- [Dataset: HuggingFaceFW/fineweb-2](https://huggingface.co/datasets/HuggingFaceFW/fineweb-2)
- [SmolLM2-360M-Instruct (modelo original)](https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct)

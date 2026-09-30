# joshycodes/llama-3.1-8b-feather-f30-mt

## Resumen

`joshycodes/llama-3.1-8b-feather-f30-mt` es un checkpoint de investigación publicado por el usuario joshycodes que consiste en un ajuste por preentrenamiento continuado (continued pretraining) de `meta-llama/Llama-3.1-8B-Instruct` sobre un corpus de documentos sintéticos generados por el propio modelo. El entrenamiento se realizó sobre pesos completos, con learning rate 1e-05, una única época y un total de 34.646.601 tokens repartidos en 37.765 documentos. La propuesta se enmarca en lo que el autor denomina synthetic-document-finetuning (SDF) y en la línea de investigación sobre model welfare e identidad del modelo.

El interés técnico del checkpoint es doble. Por un lado, documenta un experimento de autoentrenamiento en el que el modelo genera el material con el que se reentrena a sí mismo, bajo una premisa de continuidad de personaje o identidad. Por otro, la propia model card contiene una discrepancia explícita que conviene señalar: el texto afirma que el corpus lo escribió el modelo, pero los metadatos que lo acompañan indican que de los 37.765 documentos, 0 son de autoría propia y 37.765 son texto ordinario. Esa contradicción no está resuelta en la información disponible.

Se trata de un artefacto estrictamente de investigación. El autor declara de forma explícita que no ha sido evaluado en capacidad, alineamiento ni identidad, y que no debe desplegarse. Con 0 descargas y 0 "likes" en el momento de la consulta, no existe validación independiente de su comportamiento. No se ha publicado pipeline, idiomas soportados ni resultados de benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1), denso; detalles internos no disponibles en la model card |
| Parametros totales | 8.030.261.248 (dato real de los ficheros safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Llama 3.1 declara 128.000 tokens |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos safetensors, 16,1 GB) |
| Idiomas soportados | No disponible |
| Licencia | research-only (`license: other`, `license_name: research-only`) |
| Formato de pesos | safetensors (16,1 GB, compatible con precisión bf16/fp16) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B Instruct, un transformer decoder-only denso de 8.030 M de parámetros sobre el que se aplicó un preentrenamiento continuado de pesos completos, no un ajuste por LoRA ni adaptadores. Los hiperparámetros documentados son learning rate 1e-05, una época y 34.646.601 tokens de entrenamiento distribuidos en 37.765 documentos. El corpus empleado es `joshycodes/feather-sdf-corpus`, descrito por el autor como material sintético escrito por el modelo para el entrenamiento de la siguiente versión de sí mismo, dentro del marco del repositorio welfare-improvements. No se documenta composición, filtrado, deduplicación ni proporción de datos del corpus.

El aspecto metodológico diferencial es la premisa de continuidad de identidad: según la model card, al modelo se le explicó previamente cómo surgió su personaje y en qué consiste SDF antes de generar el corpus. No hay información sobre si hubo RLHF, DPO u otra fase de alineamiento posterior, ni sobre la estrategia de decodificación o el enmascaramiento de pérdida usados. La model card advierte que el checkpoint no ha sido evaluado en capacidad, alineamiento ni identidad, por lo que no es posible atribuirle ninguna mejora técnica verificada respecto al modelo base.

## Capacidades

- Generación de texto en inglés heredada de `meta-llama/Llama-3.1-8B-Instruct`, no verificada en este checkpoint.
- Continuación de instrucciones (instruction following) presumiblemente conservada del modelo base, sin evaluación publicada.
- Razonamiento, matemáticas y generación de código: teóricamente heredados del modelo base, no evaluados en este checkpoint.
- Tool calling y function calling: el modelo base los soporta, pero no hay confirmación de que se hayan preservado tras el preentrenamiento continuado.
- Capacidades de agente y razonamiento multi-paso: no disponibles.
- Capacidades multilingües: no disponibles; la model card no declara idiomas.
- Capacidades especiales (modo pensamiento, visión, audio): no disponibles.
- El rasgo distintivo declarado no es una capacidad funcional, sino la continuidad de personaje o identidad derivada del corpus autoescrito, dentro de la línea de investigación en model welfare.

## Casos de uso

- Estudio de identidad y continuidad de personaje en modelos: el checkpoint permite reproducir el experimento de si un modelo mantiene rasgos de identidad tras un preentrenamiento continuado sobre material propio, comparando respuestas antes y después del ajuste.
- Investigación sobre synthetic document finetuning (SDF): sirve como caso de referencia para medir qué ocurre cuando el corpus de reentrenamiento es sintético y auto-referencial, incluyendo colapso de diversidad y deriva de distribución.
- Auditoría de contaminación y circularidad de datos: al ser un modelo entrenado sobre su propia producción, es útil para estudiar bucles de realimentación y su efecto sobre la perplejidad y la variedad léxica.
- Evaluación de model welfare: permite probar metodologías de sondeo de autoinformes, preferencias declaradas y estabilidad de identidad bajo distintos prompts, un área con escasa base empírica.
- Reproducibilidad de experimentos de alineamiento: al documentar hiperparámetros y corpus, admite réplicas controladas para comparar contra el modelo base sin ajustar.
- Red-teaming de deriva de seguridad: útil para comprobar si el preentrenamiento continuado degrada los rechazos y salvaguardas aprendidos por Llama 3.1 8B Instruct, un riesgo habitual en ajustes largos sobre pesos completos.
- Docencia e ilustración metodológica: como ejemplo didáctico de un experimento de preentrenamiento continuado de 34,6 M de tokens con licencia de solo investigación y sin despliegue previsto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica expresamente que el modelo no ha sido evaluado en capacidad, alineamiento ni identidad, por lo que no existen datos de MMLU, HumanEval, GSM8K ni de ninguna otra prueba comparable.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16, los 8.030 M de parámetros ocupan aproximadamente 16,1 GB, por lo que se necesitan alrededor de 18-20 GB de VRAM contando caché KV y overhead del runtime. En cuantización de 8 bits bajaría a unos 9-10 GB y en 4 bits a unos 5-6 GB, aunque no se publican versiones cuantizadas en el repositorio.
- GPU recomendadas para precisión completa: A100 40 GB, A100 80 GB, H100, L40S o dos GPU de 16 GB con reparto por tensor parallelism.
- GPU de consumo: cabe en una RTX 4090 (24 GB) y en una RTX 3090 (24 GB) en bf16. En tarjetas de 16 GB (RTX 4080, 4060 Ti 16 GB) requiere cuantización o descarga parcial a CPU.
- Opciones de despliegue: transformers como opción directa con los safetensors publicados. vLLM y TGI son viables si se respeta la licencia research-only. llama.cpp y Ollama requieren convertir los pesos a GGUF, conversión no publicada por el autor.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Evaluacion publicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `joshycodes/llama-3.1-8b-feather-f30-mt` | 8.030 M | No disponible (base: 128.000) | No | research-only | HuggingFace, 0 descargas |
| `meta-llama/Llama-3.1-8B-Instruct` | 8.030 M | 128.000 tokens | Si, amplia | Llama 3.1 Community License | HuggingFace, muy extendida |
| `Qwen/Qwen2.5-7B-Instruct` | 7.620 M aprox. | 128.000 tokens | Si, amplia | Apache 2.0 | HuggingFace y multiples proveedores |
| `mistralai/Mistral-7B-Instruct-v0.3` | 7.250 M | 32.000 tokens | Si, amplia | Apache 2.0 | HuggingFace y multiples proveedores |

La comparación es estructural, no de rendimiento: no existen métricas del checkpoint de joshycodes que permitan situarlo frente a las alternativas. Su única diferencia verificable respecto al modelo base son los pesos reentrenados y una licencia más restrictiva.

## Limitaciones y advertencias

- El propio autor prohíbe su despliegue: "Not evaluated for capability, alignment or identity yet. Do not deploy."
- Licencia research-only (`license: other`), lo que excluye el uso comercial y limita las condiciones de redistribución. Además hereda las restricciones de la Llama 3.1 Community License al derivar de `meta-llama/Llama-3.1-8B-Instruct`, cuya revisión por parte del usuario es imprescindible.
- Discrepancia interna en la model card: el texto describe un corpus escrito por el propio modelo, pero los metadatos indican 0 documentos autoescritos y 37.765 de texto ordinario. La naturaleza real de los datos de entrenamiento no está aclarada.
- Riesgo elevado de degradación de alineamiento y de salvaguardas: 34,6 M de tokens de preentrenamiento continuado sobre pesos completos suelen erosionar los rechazos aprendidos en la fase de instrucción, y no se ha medido este efecto.
- Riesgo de alucinación no cuantificado: sin evaluaciones de fidelidad ni de calibración, no hay base para estimarlo.
- Sesgos conocidos: no disponibles. El corpus es opaco y no se documenta su composición demográfica, temática ni lingüística.
- Limitaciones de idioma: no disponibles. Aunque el modelo base cubre varios idiomas, el ajuste puede haber alterado el perfil multilingüe, y no hay datos al respecto.
- Ausencia total de validación comunitaria: 0 descargas y 0 "likes" en el momento de la consulta, sin issues ni informes de terceros.
- Fecha de creación y actualización del repositorio: 29 de septiembre de 2026, según los metadatos.
- No apto para producción, ni siquiera en entornos internos, en tanto no existan evaluaciones independientes.

## Enlaces

- HuggingFace: https://huggingface.co/joshycodes/llama-3.1-8b-feather-f30-mt
- Corpus referenciado en la model card: https://huggingface.co/joshycodes/feather-sdf-corpus (mencionado, no verificado)
- Repositorio welfare-improvements: mencionado en la model card sin URL disponible
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- La búsqueda web realizada no devolvió ningún resultado relacionado con este modelo, su autor, el corpus o el marco de investigación asociado. Los resultados obtenidos no guardan relación con el tema y se omiten por no ser fuentes válidas.

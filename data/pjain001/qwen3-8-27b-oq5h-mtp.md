# pjain001/Qwen3.8-27B-oQ5h-mtp

## Resumen

Qwen3.8-27B-oQ5h-mtp es una cuantización mixta del modelo Qwen3.8-27B, publicada por el usuario pjain001 en Hugging Face. El checkpoint resultante contiene 7.816.573.680 parámetros lógicos distribuidos en tres componentes: el modelo de lenguaje (6.931B), un codificador de visión (0.461B) y una cabeza MTP (Multi-Token Prediction) de 0.425B. Se distribuye en formato MLX, pensado para ejecución en hardware Apple Silicon, y emplea la herramienta oQ de oMLX v0.8.0 para la cuantización de precisión mixta.

El interés de esta ficha es doble. Por un lado, documenta un artefacto de cuantización con una distribución de bits poco habitual: solo el 4,6% de los pesos lógicos se almacena a 5 bits, mientras que más de la mitad (51,2%) se guarda como U32, lo que eleva la media efectiva a 20,930 bits por peso y hace que el repositorio ocupe 20,5 GB. Por otro, ilustra el uso combinado de cuantización selectiva y decodificación especulativa mediante cabeza MTP en el ecosistema MLX.

No se dispone de información sobre la licencia, los idiomas soportados, el pipeline declarado ni los datos de entrenamiento del modelo base. Todos los datos de esta ficha proceden de la model card del autor y de los metadatos del repositorio; cualquier dato no presente en ellos se marca como no disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5`); incluye torre de visión y cabeza MTP |
| Parámetros totales | 7.816.573.680 (7,817B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Mezcla affine 5-bit (grupo 64), affine 6-bit (grupo 64), affine 8-bit (grupo 64), BF16 y U32; media efectiva 20,930 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `mlx`; tags `mlx`, `quantized`, `oq`, `mtp`, `5-bit`) |

Desglose de almacenamiento por componente:

| Componente | Pesos lógicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 6,931B | 19,164 GB / 17,848 GiB |
| Visión | 0,461B | 0,921 GB / 0,858 GiB |
| Cabeza MTP | 0,425B | 0,365 GB / 0,340 GiB |
| Total | 7,817B | 20,450 GB / 19,046 GiB |

Distribución de bits por formato de almacenamiento:

| Formato | Pesos lógicos | Porcentaje | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Affine 5-bit, grupo 64 | 0,362B | 4,628% | 0,232 GiB | 5,50 |
| Affine 6-bit, grupo 64 | 1,271B | 16,265% | 0,962 GiB | 6,50 |
| Affine 8-bit, grupo 64 | 1,282B | 16,400% | 1,268 GiB | 8,50 |
| BF16 | 0,900B | 11,510% | 1,676 GiB | 16,00 |
| U32 | 4,002B | 51,197% | 14,908 GiB | 32,00 |

## Arquitectura y entrenamiento

La arquitectura del modelo base corresponde a la familia Qwen3.5, según el tag `qwen3_5` del repositorio. El checkpoint cuantizado conserva tres bloques funcionales: el modelo de lenguaje, una torre de visión de 0,461B de parámetros (lo que confirma capacidades multimodales de entrada de imagen) y una cabeza MTP de 0,425B. La presencia de MTP (Multi-Token Prediction) sugiere soporte para decodificación especulativa o predicción de varios tokens por paso, una técnica habitual para aumentar el throughput de inferencia, aunque la model card no detalla su implementación ni el algoritmo de verificación asociado.

La cuantización se realizó con oQ (oMLX v0.8.0) en modo de precisión mixta. La distribución resultante es atípica: el grueso del almacenamiento (14,908 GiB, 51,2% de los pesos lógicos) se guarda en U32, lo que en la práctica indica que amplias zonas del checkpoint no se han cuantizado por debajo de 32 bits, mientras que las capas seleccionadas para compresión usan affine 5, 6 y 8 bits con grupo de 64. El resultado es un checkpoint de 20,5 GB con una media de 20,930 bits/peso, muy por encima de lo que sugiere el sufijo "5-bit" del nombre. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base pasó por RLHF, DPO u otras etapas de alineamiento.

## Capacidades

- Generación de texto y razonamiento: el bloque de lenguaje de 6,931B de parámetros lógicos soporta las capacidades del modelo base Qwen3.5, aunque no se detallan en la model card.
- Procesamiento de visión: la presencia de una torre de visión de 0,461B indica entrada multimodal de imágenes; no se especifica si genera imágenes.
- Predicción multi-token: la cabeza MTP de 0,425B está diseñada para decodificación especulativa o generación de varios tokens por paso.
- Ejecución en Apple Silicon: el formato MLX permite inferencia nativa en chips de la serie M de Apple.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el checkpoint de 20,5 GB cabe en equipos Apple Silicon con 32 GB o más de memoria unificada, lo que permite ejecutar un modelo multimodal con cabeza MTP sin GPU dedicada. Es el escenario natural para el formato MLX.
- Prototipado de decodificación especulativa: la cabeza MTP permite experimentar con técnicas de predicción multi-token para medir la ganancia de throughput frente a la decodificación autoregresiva estándar en MLX.
- Evaluación de cuantización mixta: la distribución documentada (5/6/8 bits, BF16 y U32) sirve como caso de estudio para comparar la calidad de oQ frente a cuantizaciones uniformes de 4 u 8 bits en el mismo modelo base.
- Tareas de visión y lenguaje en local: la torre de visión integrada permite describir imágenes, responder preguntas sobre capturas o extraer información de documentos escaneados sin enviar datos a servicios externos.
- Investigación sobre compromiso memoria/calidad: al mantener un 51,2% de los pesos en U32, el checkpoint preserva precisión en las capas que oQ considera sensibles; es útil para estudiar qué capas toleran cuantización agresiva y cuáles no.
- Reproducibilidad de artefactos comunitarios: al ser una publicación de un usuario independiente con fecha y versión de herramienta documentadas, sirve para auditar la reproducibilidad de pipelines de cuantización abiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el checkpoint ocupa 19,046 GiB (20,45 GB) en disco; en inferencia se necesita al menos esa cantidad más overhead de activaciones y caché KV, por lo que se recomienda un mínimo de 24-32 GB de memoria unificada.
- Hardware objetivo: Apple Silicon (M1/M2/M3/M4 en variantes Pro, Max o Ultra) mediante MLX. No es un formato pensado para CUDA.
- GPU dedicadas: no aplicable de forma nativa; requeriría conversión a otro formato (por ejemplo GGUF o safetensors estándar), no documentada por el autor.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí en equipos con 32 GB o más de memoria unificada. En GPUs NVIDIA de consumo (RTX 4090, 24 GB) el margen sería muy ajustado y requeriría conversión previa.
- Opciones de despliegue: `mlx-lm` y el ecosistema oMLX son las vías naturales; vLLM, llama.cpp, Ollama y TGI no soportan de forma directa este checkpoint tal cual.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B-oQ5h-mtp (este) | 7,817B lógicos | no disponible | Mixta 5/6/8-bit, BF16, U32 (20,93 bits/peso) | no disponible | safetensors MLX |
| Modelo base Qwen3.8-27B | no disponible | no disponible | Sin cuantizar (presumiblemente BF16) | no disponible | no disponible |
| Cuantizaciones uniformes 4-bit/8-bit del mismo base | 7,817B lógicos | no disponible | Uniforme 4 u 8 bits | no disponible | GGUF / MLX según herramienta |

La comparación cuantitativa con alternativas no es posible: no se han publicado benchmarks ni datos de calidad para este checkpoint, y no se dispone de especificaciones verificadas del modelo base Qwen3.8-27B en la información proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica la licencia del checkpoint ni la del modelo base, lo que impide confirmar si el uso comercial está permitido. Verificar antes de cualquier despliegue en producción.
- Nombre potencialmente engañoso: el sufijo "5-bit" sugiere una cuantización agresiva, pero la media efectiva es de 20,930 bits/peso y más de la mitad de los pesos están en U32. El ahorro de memoria frente a BF16 es menor de lo que el nombre indica.
- Sin benchmarks: no hay datos publicados de MMLU, HumanEval, GSM8K ni evaluaciones multimodales, por lo que se desconoce la degradación de calidad respecto al modelo base.
- Sin información de sesgos ni alucinación: la model card no documenta evaluaciones de sesgo, toxicidad ni tasas de alucinación.
- Idiomas no declarados: se desconoce qué lenguas cubre el modelo base y con qué calidad.
- Contexto desconocido: no se indica la longitud de contexto soportada, dato crítico para aplicaciones de documento largo o conversación multi-turno.
- Ecosistema restringido: el formato MLX limita el despliegue a Apple Silicon; no hay conversión documentada a otros runtimes.
- Artefacto comunitario: publicado por un usuario independiente (pjain001) con 0 descargas y 0 likes en el momento de la consulta; no procede del equipo oficial de Qwen. La model card indica una recuantización el 2026-11-20 con oMLX v0.8.0, lo que implica que versiones anteriores del repositorio pueden diferir.
- Riesgo de reproducibilidad: no se documenta la semilla, la configuración exacta de oQ ni el proceso de selección de capas para cada precisión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pjain001/Qwen3.8-27B-oQ5h-mtp
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Modelo base Qwen3.8-27B: no disponible en la información proporcionada
- Paper o documentación técnica del modelo base: no disponible
- Demos o blogs del autor: no disponible

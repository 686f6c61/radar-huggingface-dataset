# brainworkup/Qwen3.8-27B-Ultimate-Heretic-Uncensored-oQ2e-mtp

## Resumen

Qwen3.8-27B-Ultimate-Heretic-Uncensored-oQ2e-mtp es una cuantización mixta de un modelo de la familia Qwen3.5 (etiqueta `qwen3_5` en el repositorio), publicada por el usuario brainworkup en Hugging Face. El checkpoint original no lo distribuye este repositorio: lo que se ofrece es una versión comprimida con la herramienta oQ (oMLX v0.8.0rc1) que reduce un modelo de 27.781 millones de parámetros a un peso de almacenamiento de 11,8 GB, con una media efectiva de 3,406 bits por peso. El nombre comercial ("Ultimate-Heretic-Uncensored") sugiere un ajuste orientado a eliminar filtros de rechazo, aunque la model card no documenta dicho proceso de ajuste.

El modelo incorpora tres componentes diferenciados: el modelo de lenguaje (26.896B parámetros), un codificador visual (0.461B) y una cabeza MTP (Multi-Token Prediction, 0.425B), lo que indica capacidades multimodales y decodificación especulativa integrada. La cuantización es de precisión mixta: combina bloques afín de 2, 3, 4 y 5 bits con distintos tamaños de grupo, dejando una pequeña fracción (1,857%) en BF16.

Su relevancia práctica radica en que permite ejecutar un modelo multimodal de ~28B en hardware con aproximadamente 12 GB de memoria unificada o VRAM, algo imposible con el checkpoint en BF16 (que rondaría los 55 GB). Está empaquetado en formato MLX, por lo que el destino natural es Apple Silicon (Macs con chip M-series), no GPUs NVIDIA.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (etiqueta `qwen3_5`) con cabeza MTP; detalles de capas y atención no disponibles |
| Parámetros totales | 27.781.427.952 (27.781B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Precisión mixta oQ: afín 2-bit grupo 64, afín 3-bit grupo 128, afín 3-bit grupo 64, afín 4-bit grupo 64, afín 5-bit grupo 64 y BF16; media efectiva 3,406 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `mlx`), cuantización `oq` |

Desglose de la distribución de bits según la model card:

| Formato de almacenamiento | Pesos lógicos | Porcentaje | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Afín 2-bit, grupo 64 | 12,387B | 44,588% | 3,605 GiB | 2,50 |
| Afín 3-bit, grupo 128 | 10,453B | 37,627% | 3,955 GiB | 3,25 |
| Afín 3-bit, grupo 64 | 1,271B | 4,576% | 0,518 GiB | 3,50 |
| Afín 4-bit, grupo 64 | 0,372B | 1,340% | 0,195 GiB | 4,50 |
| Afín 5-bit, grupo 64 | 2,781B | 10,012% | 1,781 GiB | 5,50 |
| BF16 | 0,516B | 1,857% | 0,961 GiB | 16,00 |
| **Total** | **27,781B** | **100%** | **11,015 GiB** | **3,406** |

Desglose por componente:

| Componente | Pesos lógicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 26,896B | 10,591 GB / 9,864 GiB |
| Visión | 0,461B | 0,921 GB / 0,858 GiB |
| Cabeza MTP | 0,425B | 0,314 GB / 0,293 GiB |
| **Total** | **27,781B** | **11,827 GB / 11,015 GiB** |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base. La etiqueta `qwen3_5` indica que deriva de la familia Qwen3.5, y la presencia de un módulo de visión de 0,461B parámetros confirma que se trata de un modelo multimodal (texto e imagen). La cabeza MTP de 0,425B parámetros corresponde a Multi-Token Prediction, un mecanismo que predice varios tokens futuros por paso y que habitualmente se emplea para decodificación especulativa o para acelerar la generación; el repositorio no detalla cómo se explota en inferencia.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, el proceso de alineación (RLHF, DPO u otro) ni sobre el ajuste "uncensored" que sugiere el nombre. Tampoco se documenta el método de cuantización más allá de los parámetros de bloques afín y la herramienta empleada (oQ de oMLX v0.8.0rc1), que asigna mayor precisión (5-bit y BF16) a una fracción pequeña de pesos y comprime el grueso a 2-3 bits.

## Capacidades

- Generación de texto y razonamiento: el modelo de lenguaje de 26,896B parámetros es el núcleo del checkpoint.
- Procesamiento de imágenes: incluye un codificador visual de 0,461B parámetros, por lo que se espera soporte de entrada multimodal, aunque la model card no detalla tareas concretas (VQA, OCR, captioning).
- Predicción multi-token: la cabeza MTP de 0,425B parámetros habilita, en principio, decodificación especulativa o generación acelerada.
- Ajuste orientado a contenido sin censura: el nombre "Uncensored" indica que se ha modificado el comportamiento de rechazo, pero no se aporta metodología ni evaluación.
- Tool calling, function calling, agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Modo thinking explícito: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint está en formato MLX y ocupa 11,8 GB, por lo que encaja en Macs con 16 GB de memoria unificada o más; se usaría con la librería MLX para generar texto o procesar imágenes sin conexión.
- Prototipado de asistentes multimodales en portátil: al incluir visión y lenguaje en un único paquete de ~12 GB, permite construir demos de descripción de imágenes o extracción de información de capturas sin depender de la nube.
- Evaluación de cuantización agresiva: con una media de 3,406 bits/peso y un 44,6% de los pesos a 2 bits, sirve para estudiar la degradación de calidad frente al modelo original en tareas de razonamiento y generación.
- Investigación sobre alineación y censura: el ajuste "Heretic-Uncensored" lo hace útil para comparar tasas de rechazo y sesgos frente a la versión alineada del mismo modelo base.
- Generación acelerada con MTP: la cabeza de predicción multi-token permite experimentar con decodificación especulativa en MLX para reducir la latencia por token.
- Despliegue en entornos con memoria muy limitada: frente a un BF16 de ~55 GB, esta versión cabe en estaciones de trabajo modestas o en Macs de gama media, habilitando pruebas de concepto que de otro modo requerirían GPUs de 80 GB.
- Fine-tuning ligero o adaptación de dominio sobre la base cuantizada: útil para validar pipelines de adaptación (LoRA sobre capas en mayor precisión) antes de invertir en el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: ~11,8 GB solo para los pesos; con caché KV y overhead de ejecución, se recomienda un mínimo de 16 GB de memoria unificada. Para contextos largos, prever 20-24 GB.
- GPU recomendadas: el formato es MLX, por lo que el hardware objetivo son chips Apple M1/M2/M3/M4 (Pro, Max o Ultra). No es un checkpoint pensado para CUDA; en GPUs NVIDIA requeriría conversión previa, no documentada.
- ¿Cabe en GPU de consumo? Sí, en Apple Silicon con 16 GB o más (MacBook Pro/Air M-series, Mac mini, Mac Studio). En GPUs de consumo NVIDIA no es directamente utilizable sin reconversión.
- Opciones de despliegue: librería `mlx` (y `mlx-lm`/`mlx-vlm` según el componente) y la herramienta oMLX. vLLM, llama.cpp, Ollama y TGI no soportan este formato de cuantización oQ de forma nativa según la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-Ultimate-Heretic-Uncensored-oQ2e-mtp | 27,781B | no disponible | MLX safetensors, oQ mixta (~3,4 bits) | no disponible | Hugging Face, 0 descargas |
| Modelo base Qwen3.5 (versión original) | no disponible | no disponible | safetensors BF16 | no disponible | no disponible en esta información |
| Otras cuantizaciones GGUF del mismo tamaño | no disponible | no disponible | GGUF (2-4 bits) | según modelo base | no disponible |

No se dispone de datos de rendimiento ni de especificaciones del modelo base para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- La cuantización a 2-3 bits en el 82% de los pesos (44,6% a 2 bits y 42,2% a 3 bits) implica una degradación esperable de la calidad frente al modelo original, especialmente en matemáticas, código y razonamiento de varios pasos.
- El ajuste "Uncensored" reduce o elimina los mecanismos de rechazo, lo que aumenta el riesgo de generar contenido dañino, sesgado o ilegal; no es apto para producción orientada al público sin filtros externos.
- No se documenta la licencia, lo que impide determinar si el uso comercial está permitido; además, al derivar de Qwen, hereda las condiciones del modelo base, que no se indican.
- No hay información sobre sesgos, idiomas soportados ni evaluación de alucinación.
- El formato MLX limita el despliegue a Apple Silicon; no hay garantía de compatibilidad con ecosistemas CUDA ni con servidores de inferencia estándar.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado en el mismo intervalo de dos minutos, lo que sugiere una publicación no validada por la comunidad.
- La cabeza MTP y el módulo de visión pueden no estar soportados por todas las versiones de las herramientas MLX, lo que obligaría a usar builds específicos.
- El nombre "Qwen3.8-27B" no coincide con una denominación oficial conocida de la familia Qwen; conviene verificar la procedencia del modelo base antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/brainworkup/Qwen3.8-27B-Ultimate-Heretic-Uncensored-oQ2e-mtp
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx

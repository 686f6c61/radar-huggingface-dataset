# francesca9805/zho-hans-100mb-ppt-Dp-100mb-packed-bfd_seed455

## Resumen

El modelo `francesca9805/zho-hans-100mb-ppt-Dp-100mb-packed-bfd_seed455` es un ajuste fino supervisado (SFT) del modelo monolingüe `goldfish-models/zho_hans_100mb`, publicado por el usuario francesca9805. Se trata de un transformer decoder-only con arquitectura GPT-2 y 124.770.816 parámetros (unos 124,8 millones), pesos en safetensors y un repositorio de 0,3 GB. Por su nomenclatura y su procedencia (la ejecución de entrenamiento se aloja en una cuenta de Weights & Biases de la Universidad de Groningen), todo apunta a un artefacto de investigación dentro de la familia de modelos monolingües Goldfish, orientada a lenguas de bajos recursos y con identificador de idioma chino mandarín simplificado (`zho-hans`).

El problema que aborda es acotado: servir como punto de partida experimental para estudiar cómo afecta el ajuste fino por instrucciones (SFT) a un modelo pequeño preentrenado con un corpus de aproximadamente 100 MB de texto en una única lengua. El nombre del repositorio sugiere un entrenamiento sobre un corpus empaquetado ("packed") de 100 MB con una semilla concreta (455), aunque la model card no documenta el conjunto de datos, el número de tokens ni la composición del mismo.

Su relevancia es principalmente metodológica y de reproducibilidad, no de producto: con 124,8 millones de parámetros se puede entrenar, evaluar y desplegar en hardware muy modesto, lo que lo hace útil para experimentos controlados de ablación, comparativas de semillas y validación de pipelines de SFT con TRL. No es un modelo orientado a uso en producción ni compite con los modelos generativos actuales de tamaño similar en capacidades conversacionales, de razonamiento o multilingües.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia GPT-2 |
| Parametros totales | 124.770.816 (~124,8 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la arquitectura GPT-2 de partida suele limitarse a 1.024 tokens; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible como artefacto publicado; al ser un GPT-2 de 124,8 M es convertible a int8, int4 y GGUF |
| Idiomas soportados | no disponible (el identificador apunta a chino mandarín simplificado, `zho-hans`) |
| Licencia | no disponible (el frontmatter de la model card indica `licence: license` como marcador de posición, sin texto legal) |
| Formato de pesos | safetensors |
| Modelo base | goldfish-models/zho_hans_100mb |
| Libreria | transformers |
| Pipeline | text-generation |
| Tamano del repositorio | 0,3 GB |
| Metodo de entrenamiento | SFT (supervised fine-tuning) con TRL 0.23.0 |
| Fecha de creacion | 2026-09-22 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2: un transformer decoder-only con atención causal completa, normalización por capas previa y embeddings de tokens atados con la cabeza de lenguaje. El modelo hereda la configuración del checkpoint `goldfish-models/zho_hans_100mb`, que a su vez pertenece al proyecto Goldfish de modelos monolingües para lenguas de bajos recursos, por lo que emplea un tokenizador distinto del GPT-2 original (el recuento de 124.770.816 parámetros difiere ligeramente de los 124.439.808 del GPT-2 small con vocabulario de 50.257 tokens). No hay innovaciones arquitectónicas documentadas: ni atención lineal, ni decodificación especulativa, ni mezcla de expertos, ni capas recurrentes.

El entrenamiento se realizó mediante ajuste fino supervisado con TRL 0.23.0, Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1, y la ejecución está registrada en Weights & Biases. La model card no especifica el número de tokens de entrenamiento, la composición del dataset, la presencia de una plantilla de chat, ni si hubo fases posteriores de RLHF o DPO. El sufijo del nombre ("100mb-packed-bfd_seed455") sugiere un corpus empaquetado de 100 MB y una semilla de 455, pero es una inferencia basada en la nomenclatura, no un dato confirmado. Tampoco se documentan hiperparámetros, número de épocas ni métricas de validación.

## Capacidades

- Generación de texto en modo autoregresivo, heredada del modelo base monolingüe.
- El ejemplo de la model card utiliza una entrada en formato conversacional (lista de diccionarios con `role` y `content`), lo que sugiere que el SFT pudo introducir algún tipo de plantilla de instrucciones, aunque no se documenta ninguna.
- No hay evidencia de capacidades de razonamiento multi-paso, matemáticas o generación de código.
- Soporte de tool calling / function calling: no disponible, no documentado.
- Soporte de agentes: no disponible, no documentado.
- Capacidades multilingües: no disponibles; el identificador apunta a una única lengua (chino mandarín simplificado).
- Capacidades especiales: no se documenta ningún modo de pensamiento (thinking mode), visión, audio ni razonamiento extendido.

## Casos de uso

- Investigación sobre ajuste fino de modelos monolingües: sirve como caso de estudio reproducible de SFT sobre un checkpoint de 124,8 M, útil para comparar el efecto de distintas semillas y volúmenes de datos en una misma arquitectura.
- Ablaciones de empaquetado de datos (packed datasets): el nombre del repositorio indica un corpus empaquetado de 100 MB, por lo que encaja en experimentos que miden cómo el empaquetado afecta a la pérdida de validación frente a secuencias truncadas.
- Referencia base para experimentos de entrenamiento continuado: al ser tan pequeño, se puede reentrenar decenas de veces en una sola GPU para estudiar olvido catastrófico o ajuste de dominio en chino.
- Validación de infraestructura de despliegue: es un candidato idóneo para probar pipelines de vLLM, TGI o llama.cpp con un consumo de memoria inferior a 1 GB antes de escalar a modelos grandes.
- Generación de texto sintético a pequeña escala para pruebas de filtrado, deduplicación o clasificadores de calidad, donde el coste por token es prácticamente despreciable.
- Docencia y formación: permite demostrar de principio a fin el ciclo preentrenamiento, SFT con TRL, publicación en HuggingFace Hub y consumo con la librería transformers en una sesión práctica.
- Estudio del tokenizador: el vocabulario adaptado al chino simplificado del modelo base lo convierte en un objeto de análisis para comparar fertilidad de tokenización y cobertura léxica en corpus pequeños.
- Evaluación de la pérdida de perplejidad en corpus de dominio específico: con 124,8 M de parámetros se puede calcular perplejidad sobre textos en chino de forma rápida y con recursos mínimos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, FLORES ni ninguna otra métrica de evaluación, y el repositorio no presenta ningún informe asociado.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, unos 500 MB solo de pesos; en FP16/BF16, unos 250 MB; en int8, unos 125 MB; en int4, unos 62 MB. Con caché KV y sobrecarga del runtime, el consumo real se sitúa por debajo de 1 GB en FP16 salvo que se usen lotes grandes.
- GPU recomendadas: cualquier GPU con 2 GB de VRAM o más. Funciona sin problema en RTX 3060, RTX 4090, T4, L4 y, en general, en cualquier tarjeta moderna; A100 y H100 son completamente desproporcionadas para este tamaño.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU de consumo de los últimos diez años, incluidas GTX 1050 Ti o superiores.
- Inferencia en CPU: viable, con un consumo de memoria inferior a 1 GB en FP32; se han publicado mediciones de latencia o tokens por segundo.
- Opciones de despliegue: transformers (pipeline de text-generation), vLLM, TGI (el repositorio incluye las etiquetas `text-generation-inference` y `endpoints_compatible`, por lo que es compatible con HuggingFace Inference Endpoints), y llama.cpp u Ollama previa conversión a GGUF del checkpoint safetensors.
- Latencia y throughput estimados: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| francesca9805/zho-hans-100mb-ppt-Dp-100mb-packed-bfd_seed455 | 124,8 M | no disponible | no disponible | HuggingFace, 0 descargas | Fine-tune SFT del modelo Goldfish en chino simplificado; sin benchmarks |
| goldfish-models/zho_hans_100mb | ~124,8 M (no confirmado) | no disponible | no disponible | HuggingFace | Modelo base monolingüe del que deriva este checkpoint |
| goldfish-models/zho_hans_1gb | no disponible | no disponible | no disponible | HuggingFace | Variante de la misma familia entrenada con un corpus mayor (1 GB) |
| openai-community/gpt2 | 124 M | 1.024 tokens | MIT | HuggingFace, muy extendido | Referencia en inglés, con licencia permisiva y ampliamente evaluada |
| Qwen/Qwen2.5-0.5B | 494 M | 32.768 tokens | Apache-2.0 | HuggingFace | Alternativa multilingüe moderna, con benchmarks publicados y soporte real de instrucciones |

La comparación de rendimiento entre estos modelos no es posible con la informacion disponible: este checkpoint no publica ninguna métrica, mientras que los modelos de referencia sí cuentan con evaluaciones públicas.

## Limitaciones y advertencias

- Artefacto de investigación sin validación: cuenta con 0 descargas y 0 likes, y no se ha publicado ninguna evaluación independiente de su calidad.
- Sin benchmarks: se desconoce por completo su comportamiento en tareas estándar, incluida la perplejidad en el dominio de destino.
- Licencia no definida: el frontmatter indica `licence: license` como marcador de posición, sin texto legal. El uso comercial no está autorizado de forma explícita y conviene contactar con el autor antes de cualquier despliegue productivo.
- Riesgo elevado de alucinación: con 124,8 M de parámetros y un corpus de entrenamiento de aproximadamente 100 MB, la coherencia a partir de pocos cientos de tokens es limitada y la generación factual no es fiable.
- Cobertura lingüística restringida: todo apunta a una única lengua (chino mandarín simplificado); no hay soporte documentado de castellano ni de otras lenguas.
- Cobertura de contexto reducida: si se confirma la configuración GPT-2 de partida, la ventana se limita a 1.024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Posible sobreajuste al corpus de SFT: al entrenarse sobre un dataset empaquetado de tamaño reducido, el modelo puede reproducir fragmentos del conjunto de entrenamiento y mostrar escasa diversidad.
- Ausencia de capacidades de agente: no hay soporte documentado de tool calling, function calling ni razonamiento multi-paso, por lo que no es adecuado para pipelines agénticos.
- Sesgos no evaluados: al derivar de un corpus de 100 MB obtenido probablemente de fuentes web, hereda los sesgos de dichas fuentes sin ninguna mitigación documentada.
- El ejemplo de la model card usa un formato conversacional que no está respaldado por ninguna plantilla de chat publicada; conviene verificar el formato de entrada antes de integrarlo.
- Mantenimiento incierto: el repositorio se publicó con fechas de creación y actualización muy próximas entre sí (2026-09-22) y no hay señales de versiones posteriores ni de soporte del autor.
- Los resultados de la búsqueda web realizada no contienen información relevante sobre este modelo: todas las entradas devueltas corresponden al sitio de Tesla y no guardan relación con el checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/zho-hans-100mb-ppt-Dp-100mb-packed-bfd_seed455
- Modelo base: https://huggingface.co/goldfish-models/zho_hans_100mb
- Organización Goldfish en HuggingFace: https://huggingface.co/goldfish-models
- Ejecución de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/y0h75vfk
- Repositorio de TRL (framework de entrenamiento): https://github.com/huggingface/trl
- Búsqueda web: sin resultados relevantes; las entradas devueltas corresponden a tesla.com y no aportan información sobre el modelo.

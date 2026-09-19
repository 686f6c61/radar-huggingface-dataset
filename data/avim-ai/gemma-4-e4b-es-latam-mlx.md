# AVIM-AI/gemma-4-E4B-es-latam-mlx

## Resumen

gemma-4-E4B-es-latam-mlx es una adaptación al español latinoamericano de `google/gemma-4-E4B-it`, publicada por Servicios Tecnológicos AVIM SpA (Santiago de Chile). Se ha entrenado mediante preentrenamiento continuado (CPT) con LoRA sobre el subconjunto en español del corpus abierto LatamGPT de CENIA, y se distribuye con los pesos ya fusionados en formato MLX. El objetivo es mejorar el modelado de texto en español —especialmente documentos de estilo institucional y enciclopédico latinoamericano— manteniendo la posibilidad de ejecución local en Apple silicon.

El repositorio contiene únicamente la torre de texto: los 665 tensores están bajo el prefijo `language_model` y no se incluyen las torres de visión ni de audio del modelo base multimodal. La torre de texto suma 7.463.013.376 parámetros en bfloat16 (~14 GiB, 4 shards), con 42 capas según los datos de entrenamiento del adaptador. Se trata de una adaptación ligera: LoRA de rango 32 aplicado a las últimas 24 capas, 50,7 millones de tokens procesados en una sola época sin repetición, 15 horas y 10 minutos sobre una Apple M5 Max con 128 GB de memoria unificada.

Su relevancia inmediata es doble: por un lado, demuestra un flujo de CPT de bajo coste sobre un corpus latinoamericano abierto; por otro, advierte de limitaciones operativas concretas (formato MLX exclusivamente, canal de razonamiento sin filtrar, benchmarks autodeclarados y no verificados). El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que no existe validación comunitaria independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de la familia Gemma 4; pesos convertidos a MLX; solo torre de texto (665 tensores bajo `language_model`). El adaptador se aplicó sobre las últimas 24 de 42 capas |
| Parametros totales | 7.463.013.376 (~7,46 mil millones), solo torre de texto |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en bfloat16; no se incluyen versiones cuantizadas) |
| Idiomas soportados | es (español, variante latinoamericana). El modelo base es multilingüe, pero este repositorio solo declara español |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX, bfloat16, 4 shards, ~14 GiB (tamaño del repositorio: 15,0 GB) |
| Modelo base | google/gemma-4-E4B-it |
| Adaptador original | AVIM-AI/gemma-4-E4B-es-latam-lora (148 MB) |
| Metodo de entrenamiento | LoRA, rango 32, últimas 24 de 42 capas, pesos fusionados |
| Tokens de entrenamiento | 50,7 M (una época, sin repetición) |
| Dataset | latam-gpt/LatamGPT-Corpus-1.0, shard `train-00000-of-00101.parquet` |
| Libreria de inferencia | mlx-lm (no compatible con transformers) |
| Fecha de publicacion | 2026-09-19 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder de la familia Gemma 4 (`google/gemma-4-E4B-it`), un modelo multimodal del que aquí solo se conserva la torre de lenguaje, con 42 capas identificadas a partir de la configuración del adaptador. Sobre esa base se aplicó un adaptador LoRA de rango 32 limitado a las últimas 24 capas, que después se fusionó en los pesos, dando lugar a un artefacto monolítico en bfloat16 compatible con `mlx-lm`. No se ha aplicado ningún proceso posterior de alineación tipo RLHF o DPO documentado: el entrenamiento es preentrenamiento continuado sobre texto, no ajuste por preferencias.

Los datos provienen del corpus abierto LatamGPT (CENIA y una red regional de instituciones de América Latina y el Caribe). Del corpus completo solo se procesó un shard, `train-00000-of-00101.parquet`, con filtros de idioma `spanish`, licencias admitidas Apache 2.0, CC0 1.0 y ODC-By v1.0, y una longitud mínima de 800 caracteres (el detalle de este filtro aparece truncado en la model card). El volumen efectivo fue de 50,7 millones de tokens en una única época sin repetición, lo que sitúa la adaptación muy lejos de un reentrenamiento completo y explica tanto la mejora drástica de perplejidad en dominio como la probable limitación de cobertura temática.

Como innovación técnica destacable, el autor documenta que Gemma 4 emite un canal de razonamiento delimitado por `<|channel>thought` y `<channel|>` que `mlx_lm.generate` no filtra, y que consume de forma rutinaria entre 350 y 450 tokens incluso en preguntas simples; el consumidor debe parsear la salida. No se documentan técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en español, con especial mejora en el modelado de documentos institucionales y enciclopédicos latinoamericanos.
- Comprensión y reformulación de texto en español; la perplejidad declarada sobre el subconjunto español del corpus LatamGPT es de 13,85 frente a 1945,99 del modelo base.
- Razonamiento explícito mediante canal de pensamiento (`<|channel>thought` ... `<channel|>`), heredado del modelo base.
- Ejecución local en Apple silicon sin envío de datos a servicios externos.
- Punto de partida para adaptaciones posteriores a dominios específicos mediante nuevos adaptadores LoRA.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; solo se documenta el canal de razonamiento interno.
- Capacidades multimodales (visión, audio): no incluidas en este repositorio, aunque el modelo base sí las tenga.
- Capacidades multilingües: el repositorio solo declara español; el control en inglés sobre el mismo corpus arroja una perplejidad de 17,00, peor que la obtenida en español.

## Casos de uso

- Asistente conversacional local en español latinoamericano: el modelo puede ejecutarse íntegramente en un Mac con Apple silicon a través de `mlx_lm.generate`, de modo que los datos del usuario no salen del equipo. Es adecuado para entornos con requisitos de confidencialidad donde no se puede llamar a una API externa, siempre que se asuma que no hay validación de terceros sobre la calidad de las respuestas.
- Normalización y redacción de documentos institucionales y administrativos: el CPT se hizo sobre un corpus de estilo institucional y enciclopédico, por lo que el modelo tiende a reproducir ese registro. Encaja en tareas de reescritura, resumen o generación de borradores de circulares, informes y fichas descriptivas.
- Generación de borradores para atención al ciudadano con revisión humana obligatoria: el modelo puede producir una primera versión de una respuesta en español a partir de una consulta, que un operador valida antes de enviarla. El autor excluye explícitamente el uso sin controles en ámbitos de alto impacto, por lo que este caso exige supervisión.
- Anotación y preprocesado de corpus en español para pipelines de datos: sirve para tareas auxiliares de etiquetado, reformulación o generación de variantes de texto que después se revisan, aprovechando que el modelo se ejecuta localmente y no impone coste por token.
- Base para adaptaciones de dominio mediante LoRA adicionales: al ser un punto de partida ya adaptado al español latinoamericano, reduce el coste de ajustar a verticales como legal, educativo o administración pública. El propio autor lo declara como uso previsto.
- Investigación en PLN en español: permite reproducir y comparar métricas de perplejidad frente al modelo base sobre el mismo corpus (13,85 frente a 1945,99 en español), así como estudiar el efecto de un CPT de bajo presupuesto (50,7 M de tokens, 15 h 10 min) sobre un modelo multimodal.
- Prototipado rápido en portátiles Apple sin GPU dedicada: al distribuirse en formato MLX con pesos fusionados, un desarrollador puede tener el modelo operativo con un único comando, sin necesidad de preparar infraestructura CUDA.
- Evaluación de la degradación multilingüe tras un CPT monolingüe: el repositorio incluye un control en inglés con perplejidad 17,00, útil para estudiar cuánto se degrada el comportamiento en idiomas no entrenados.
- Si se necesitan entradas multimodales o integración con `transformers`, este repositorio no sirve: habría que combinar el modelo base con el adaptador LoRA de 148 MB, que es el artefacto que realmente se entrenó.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card. Todas las métricas figuran con `verified: false`, es decir, no han sido verificadas de forma independiente ni replicadas por terceros. El conjunto evaluado es el subconjunto en español y el control en inglés de `latam-gpt/LatamGPT-Corpus-1.0`, sobre una partición de prueba propia del autor (`config: spanish-apache-cc0-shard00` y `english-apache-cc0-shard00`, `split: test`).

| Tarea | Conjunto (config) | Metrica | Valor | Modelo base (misma metrica) |
|---|---|---|---|---|
| Text generation | LatamGPT-Corpus-1.0, español (`spanish-apache-cc0-shard00`, test) | Perplejidad | 13,85 | 1945,99 |
| Text generation | LatamGPT-Corpus-1.0, español (`spanish-apache-cc0-shard00`, test) | Pérdida de entropía cruzada | 2,629 | no disponible |
| Text generation | LatamGPT-Corpus-1.0, control inglés (`english-apache-cc0-shard00`, test) | Perplejidad | 17,00 | 686,53 |
| Text generation | LatamGPT-Corpus-1.0, control inglés (`english-apache-cc0-shard00`, test) | Pérdida de entropía cruzada | 2,833 | no disponible |

No se han publicado resultados de MMLU, HumanEval, GSM8K, MT-Bench ni de ningún otro benchmark estándar de capacidades en la información disponible. La magnitud de la mejora frente al modelo base debe interpretarse con cautela: una perplejidad de partida de 1945,99 indica un fuerte desplazamiento de dominio entre el corpus de evaluación y los datos originales del modelo base, no necesariamente una mejora equivalente en tareas generales.

## Requisitos de hardware

- Pesos en bfloat16: ~14 GiB repartidos en 4 shards (el repositorio completo ocupa 15,0 GB en disco).
- Memoria necesaria para inferencia: por encima de los 14 GiB de pesos hay que sumar caché KV y activaciones. No hay medición publicada por el autor; como estimación práctica, un equipo con 32 GB de memoria unificada o más es lo razonable para trabajar con comodidad en bfloat16. En equipos de 16 GB probablemente sea necesario cuantizar, y el repositorio no publica versiones cuantizadas (estimación propia, no confirmada por el autor).
- GPU compatibles: ninguna GPU NVIDIA o AMD sirve para este repositorio, ya que `mlx-lm` está diseñado para Apple silicon. El hardware de referencia del entrenamiento fue una Apple M5 Max con 128 GB de memoria unificada.
- Compatibilidad con GPU de consumo: no aplica en el sentido habitual; la alternativa en hardware de consumo es ejecutarlo en un Mac con memoria unificada suficiente.
- Opciones de despliegue: `mlx-lm` (comando `mlx_lm.generate`, con modelo `AVIM-AI/gemma-4-E4B-es-latam-mlx`). Requiere instalar la versión fijada del repositorio de mlx-lm indicada por el autor. vLLM, llama.cpp, Ollama y TGI no tienen soporte documentado para estos pesos, y el autor indica explícitamente que no funciona con `transformers`. Para esos entornos habría que usar el modelo base junto con el adaptador LoRA de 148 MB.
- Presupuesto de tokens en generación: el canal de razonamiento consume entre 350 y 450 tokens de forma habitual; el autor recomienda `--max-tokens 1200` o más, ya que con 400 tokens es frecuente que la respuesta no llegue a emitirse.
- Latencia y throughput de inferencia: no disponible. El único dato temporal publicado es de entrenamiento (50,7 M de tokens en 15 h 10 min), que no es extrapolable a inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad en español (LatamGPT) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AVIM-AI/gemma-4-E4B-es-latam-mlx | 7.463.013.376 (solo torre de texto) | no disponible | 13,85 | Apache 2.0 | Safetensors MLX, 4 shards, ~14 GiB, 15,0 GB de repositorio |
| google/gemma-4-E4B-it (base) | no disponible | no disponible | 1945,99 | Apache 2.0 según la model card | Modelo base multimodal, cargable con `transformers` |
| AVIM-AI/gemma-4-E4B-es-latam-lora (adaptador) | 148 MB de adaptador sobre el modelo base | no disponible | no disponible como métrica independiente (mismo entrenamiento) | Apache 2.0 | Adaptador PEFT sobre el modelo base, para entornos `transformers` |

No se dispone de datos de otros modelos comparables de español latinoamericano en la información proporcionada; la comparación se limita a las variantes del mismo linaje. No se han publicado comparaciones frente a modelos de tamaño similar de otros desarrolladores.

## Limitaciones y advertencias

- Benchmarks autodeclarados con `verified: false`: las perplejidades y pérdidas del `model-index` no han sido replicadas ni auditadas por terceros.
- Sin adopción comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación práctica externa.
- Sin benchmarks de capacidades: no hay datos de MMLU, HumanEval, GSM8K ni similares, por lo que no se puede caracterizar su rendimiento en razonamiento, código o matemáticas.
- Multimodalidad ausente: no incluye las torres de visión ni de audio del modelo base; los 665 tensores pertenecen a `language_model`.
- `config.json` inconsistente: conserva declaraciones heredadas del modelo base (`audio_config`, `image_token_id`, `vision_soft_tokens_per_image`) que no corresponden a pesos presentes. El autor no las modificó para no romper la carga con `mlx-lm`, pero pueden confundir a herramientas de inspección automática.
- Compatibilidad restringida: solo es cargable con `mlx-lm`; no funciona con `transformers` y no hay conversiones publicadas a GGUF ni a otros formatos.
- Canal de razonamiento sin filtrar: `mlx_lm.generate` no elimina el bloque `<|channel>thought` ... `<channel|>`. Cualquier aplicación debe parsearlo y mostrar solo lo posterior a `<channel|>`, o expondrá el razonamiento interno al usuario final.
- Riesgo de truncado de respuestas: con un presupuesto de 400 tokens la respuesta puede no emitirse nunca, porque el canal de pensamiento consume entre 350 y 450 tokens. El autor recomienda 1200 o más.
- Corpus limitado: se procesó un único shard de 101 (`train-00000-of-00101.parquet`), lo que produce una cobertura temática y dialectal parcial dentro del español latinoamericano y un sesgo hacia el registro institucional y enciclopédico.
- Sesgos conocidos: no documentados explícitamente por el autor. El sesgo derivado de la composición del shard y de los filtros de licencia (Apache 2.0, CC0, ODC-By) no se ha analizado en la model card.
- Alucinación: el autor advierte literalmente de que el modelo "no es una fuente de información verificada" y de que no debe usarse sin controles adicionales en salud, justicia, finanzas, seguridad pública ni en cualquier ámbito donde una salida incorrecta cause daño.
- Idiomas: solo se declara español. La perplejidad en el control inglés (17,00) es peor que en español (13,85), y no hay garantía de comportamiento correcto en otros idiomas pese a que el modelo base sea multilingüe.
- Licencia: el repositorio y el modelo base se declaran Apache 2.0, lo que en principio permite uso comercial. Conviene verificar los términos aplicables al modelo base en su propio repositorio antes de un despliegue en producción.
- Contexto: la longitud de contexto no está documentada para este artefacto; cualquier caso de uso con documentos largos debe validarse empíricamente antes de asumir una ventana concreta.
- Unidad de medida confusa en la model card: la tabla resumen indica "7.463 M" parámetros, mientras que el recuento real de safetensors es de 7.463.013.376 parámetros (aproximadamente 7,46 mil millones). Se recomienda usar el recuento real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AVIM-AI/gemma-4-E4B-es-latam-mlx
- Sección de evaluación de la model card: https://huggingface.co/AVIM-AI/gemma-4-E4B-es-latam-mlx#eval
- Adaptador LoRA original (148 MB): https://huggingface.co/AVIM-AI/gemma-4-E4B-es-latam-lora
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Dataset de entrenamiento: https://huggingface.co/datasets/latam-gpt/LatamGPT-Corpus-1.0
- Organización desarrolladora: https://avim.ai
- Librería de inferencia mlx-lm: https://github.com/ml-explore/mlx-lm (el autor fija el commit `9d1e356e7cc6549e7d1697adabe2ea01ff8e062c` para la instalación)
- Búsquedas web realizadas: los resultados obtenidos no guardan relación con este modelo ni aportan documentación adicional (contenido genérico sobre ChatGPT, jailbreaks y foros). No se han encontrado papers, blogs ni demos adicionales sobre este modelo en la búsqueda disponible.

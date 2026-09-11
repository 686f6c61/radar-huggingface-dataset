# Fysics-AI/OmniFysics-Captioner

## Resumen

OmniFysics-Captioner es un modelo omni-modal desarrollado por Fysics-AI que genera descripciones (captions) audiovisuales con conciencia física. A diferencia de un captioner convencional, que describe "qué ocurre", este modelo pretende describir "cómo ocurre": qué objetos interactúan, cómo responden los materiales (contacto, soporte, deformación) y cómo cambian los estados a lo largo del tiempo. Lee audio y vídeo en bruto en un único forward pass y produce la descripción directamente, sin pipeline de herramientas intermedio.

El modelo se publica junto con tres componentes del mismo proyecto: el dataset Daily-Physics 50K (unas 50.000 parejas vídeo–caption físicas, repartidas en seis categorías de eventos físicos y 23 subcategorías observables), el agente OmniFysics-Agent con su modelo de percepción física (PPM, ajustado con aproximadamente 2 millones de muestras de imagen) y el benchmark OPC (OmniPhysCap), con 1.000 clips audiovisuales y 8.000 preguntas orientadas a evaluar omisiones de evidencia física.

Los pesos ocupan 31.719.205.488 parámetros (unos 31,7 B) en formato safetensors, con un repositorio de 133,7 GB que incluye también el checkpoint del PPM. La etiqueta del repositorio (`qwen3_omni_moe`) apunta a una arquitectura omni-modal de tipo mezcla de expertos, pero el autor no publica el número de parámetros activos, la longitud de contexto, los idiomas soportados ni la licencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la etiqueta del repositorio, `qwen3_omni_moe`, sugiere una arquitectura omni-modal de mezcla de expertos; el autor no la describe en la información disponible) |
| Parámetros totales | 31.719.205.488 (aproximadamente 31,7 B), según los pesos en safetensors |
| Parámetros activos | no disponible (no se confirma que sea MoE ni se indica el número de expertos activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (no se publican variantes GGUF, AWQ, GPTQ ni FP8) |
| Idiomas soportados | no disponible (la model card está redactada en inglés, pero no se declara cobertura idiomática) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Desarrollador | Fysics-AI |
| Modalidades de entrada | audio y vídeo en bruto (un solo forward pass); el PPM trabaja además a nivel de imagen |
| Fecha de creación | 24 de agosto de 2026 |
| Última actualización | 11 de septiembre de 2026 |
| Tamaño del repositorio | 133,7 GB |
| Descargas / likes | 0 descargas / 1 like |

## Arquitectura y entrenamiento

La información disponible describe el sistema, no los detalles internos del transformer. El Captioner es end-to-end y sin herramientas: consume audio y vídeo en bruto y genera el caption en un único forward pass. Se apoya en una etapa previa de construcción de datos denominada CATA (Category-Aware Temporal Anchor Aggregation), que descubre y segmenta clips con procesos físicos observables, aplica verificación de clips, deduplicación y filtrado de calidad. El resultado es Daily-Physics 50K, unas 50.000 parejas vídeo–caption que cubren tanto clips cortos centrados en interacciones físicas localizadas como vídeos largos con dinámicas extendidas, transiciones de estado y procesos en varias etapas, repartidos en seis categorías de eventos físicos y 23 subcategorías observables. El ajuste del modelo se supervisa con este dataset; no se indica el número de tokens de entrenamiento, la composición exacta del corpus ni si hubo etapas de RLHF o DPO.

El proyecto incluye además OmniFysics-Agent, un agente de percepción activa que construye primero una línea temporal de eventos de bajo coste, localiza los intervalos que requieren inspección y orquesta herramientas específicas por modalidad (audio, visual y percepción física). Cada lote de observaciones se escribe en una memoria de evidencias y alimenta un bucle Plan–Execute–Observe–Reflect que refina la elección de modalidad, el alcance temporal y el foco de la pregunta. Dentro del agente, el PPM (Physical Perception Model) actúa como herramienta dedicada: está ajustado con aproximadamente 2 millones de muestras a nivel de imagen para percibir material, contacto y deformación, y para extraer señales de interacción entre objetos y cambios de estado. El README menciona servicio de PPM mediante `inference/ppm/serve_vllm.sh`, lo que implica soporte de vLLM al menos para ese componente.

## Capacidades

- Generación de captions audiovisuales con vocabulario físico: contacto, soporte, deformación y transiciones de estado.
- Comprensión conjunta de audio y vídeo en un único forward pass, sin encadenar modelos separados ni herramientas externas.
- Descripción de interacciones entre objetos y de las consecuencias plausibles de un cambio de estado.
- Procesamiento de clips cortos centrados en una interacción localizada y de vídeos largos con dinámicas multi-etapa.
- Percepción física a nivel de imagen mediante el PPM (material, contacto, deformación), desplegable como servicio independiente con vLLM.
- Construcción de evidencia trazable y alineada espacio-temporalmente mediante el agente OmniFysics-Agent (bucle Plan–Execute–Observe–Reflect con memoria de evidencias).
- Evaluación de omisiones en captions mediante el benchmark OPC, con 1.000 clips y 8.000 preguntas.
- Soporte de tool calling, function calling, modo de razonamiento explícito, visión de imágenes estáticas, audio o multilingüismo: no disponible en la información proporcionada.

## Casos de uso

- Autoetiquetado de datasets de vídeo físico: generar captions ricos en eventos físicos sobre grandes volúmenes de vídeo para supervisar modelos de mundo, simuladores o políticas robóticas. El modelo está entrenado precisamente sobre Daily-Physics 50K, por lo que su distribución objetivo son interacciones físicas cotidianas.
- Audiodescripción automática accesible: producir descripciones que incluyan eventos relevantes para personas con discapacidad visual (una caída, una rotura, un objeto que se apoya sobre otro), procesando audio y vídeo de forma conjunta para no perder la información sonora del suceso.
- Indexación y búsqueda semántica en archivos audiovisuales: enriquecer un catálogo de vídeo con captions que mencionan material, contacto y cambios de estado, de modo que consultas del tipo "busca clips donde algo se deforme por presión" sean resolubles por similitud vectorial.
- Anotación asistida para robótica y aprendizaje por imitación: usar el PPM como servicio de percepción sobre fotogramas representativos para etiquetar material y contacto, y usar el agente para recolectar evidencia alineada temporalmente antes de entrenar políticas.
- Control de calidad en líneas de producción: analizar vídeo de procesos industriales y generar informes textuales sobre deformaciones, colisiones o transiciones de estado anómalas, con la ventaja de que el modelo describe la evidencia física observada y no solo la apariencia visual.
- Verificación de coherencia física en vídeo generado: comparar captions derivados de la evidencia audiovisual con la descripción prevista de un clip sintético para detectar violaciones de contacto, soporte o conservación de estado.
- Análisis de contenido deportivo o de acciones cotidianas: describir interacciones y contactos entre participantes y objetos (impacto, agarre, caída) en clips con audio ambiente relevante.
- Construcción de benchmarks internos de omisión: reutilizar la metodología de OPC (preguntas sobre eventos físicos retenidos en el caption) para auditar la calidad de otros sistemas de captioning en un dominio propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El proyecto publica el benchmark OPC (OmniPhysCap), con 1.000 clips audiovisuales y 8.000 preguntas sobre retención de eventos físicos, interacciones entre objetos, respuesta de materiales, transiciones de estado y evidencia cross-modal, pero no se facilitan las puntuaciones obtenidas por el modelo ni por sistemas comparados.

## Requisitos de hardware

- VRAM estimada para los pesos, a partir de los 31,7 B de parámetros: en torno a 63 GB en FP16/BF16, 32 GB en INT8 y 16 GB en INT4. Son estimaciones de peso; hay que sumar el overhead de los codificadores de audio y vídeo y de las cachés de activaciones, que en modelos omni-modales es significativo.
- Aceleradores recomendados para FP16/BF16: 2× A100 80 GB o 2× H100 80 GB con paralelismo de tensor; una sola GPU de 80 GB queda al límite.
- Aceleradores recomendados para INT8: A100 80 GB, H100 80 GB o L40S 48 GB (con cuantización aplicada por el usuario, ya que no se publican pesos cuantizados).
- GPU de consumo: en INT4 los pesos caben teóricamente en una RTX 4090 de 24 GB, pero no hay pesos GGUF ni INT4 publicados, por lo que el despliegue en consumer requiere cuantizar manualmente y asumir el riesgo de que el overhead de audio/vídeo agote la memoria.
- Espacio en disco: el repositorio ocupa 133,7 GB e incluye el checkpoint del PPM además de los pesos del Captioner.
- Opciones de despliegue: el repositorio incluye `inference/ppm/serve_vllm.sh` para el PPM, lo que indica soporte de vLLM para ese componente. No se confirma soporte de llama.cpp, Ollama, TGI ni TensorRT-LLM para el Captioner.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos verificados sobre modelos comparables en la información proporcionada. La única referencia estructural es la etiqueta del repositorio (`qwen3_omni_moe`), que sugiere un linaje próximo a la familia Qwen3-Omni, pero el autor no documenta esa relación ni publica cifras que permitan una comparación cuantitativa.

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Notas |
|---|---|---|---|---|---|
| OmniFysics-Captioner (Fysics-AI) | 31,7 B | no disponible | audio + vídeo + texto (y percepción física a nivel de imagen con el PPM) | no disponible | Especializado en captions con conciencia física; repo de 133,7 GB |
| Alternativas de la misma categoría (captioning audiovisual omni-modal) | no disponible | no disponible | no disponible | no disponible | No se han aportado datos de modelos comparables |

## Limitaciones y advertencias

- Licencia no especificada: sin licencia publicada no se puede confirmar el uso comercial, la redistribución ni la obligación de atribución. Cualquier uso en producción es jurídicamente indeterminado hasta que el autor la declare.
- Adopción nula en el momento de la consulta: 0 descargas y 1 like, sin validación independiente de la comunidad.
- Riesgo de alucinación en la descripción física: al generar texto libre sobre contacto, deformación o causalidad, el modelo puede afirmar interacciones o transiciones de estado que no son observables en el clip. El propio benchmark OPC está diseñado para medir omisiones, lo que indica que la retención incompleta de eventos es un problema esperado en esta tarea.
- Sesgos de dominio y de fuente: Daily-Physics 50K se construye a partir de "fuentes audiovisuales heterogéneas" sin que se detalle su procedencia, composición demográfica ni condiciones de grabación, por lo que los sesgos de ese corpus se trasladan al modelo.
- Cobertura idiomática desconocida: no se declaran idiomas soportados, así que no se puede asumir un rendimiento correcto en castellano.
- Limitaciones de contexto y de entrada: no se publica la longitud de contexto ni la resolución, duración máxima o formato de vídeo admitidos, lo que dificulta dimensionar el sistema.
- Dependencia de la modalidad de audio: el modelo está entrenado sobre parejas vídeo–caption con audio; clips silenciosos o con audio no relacionado pueden degradar la calidad del caption.
- Repositorio muy grande (133,7 GB) con varios artefactos (Captioner, PPM, código de inferencia): conviene revisar qué archivos se descargan antes de integrar el modelo en un pipeline.
- El benchmark OPC está propuesto por los propios autores del modelo, por lo que no es una evaluación externa e independiente.
- La model card proporcionada aparece truncada en la sección de OPC, por lo que parte de la documentación de evaluación no está disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Fysics-AI/OmniFysics-Captioner
- Página de proyecto en GitHub: https://github.com/Fysics-AI/OmniFysics-Captioner
- Dataset y benchmark (OmniPhysics-Caption_benchmark): https://huggingface.co/datasets/Fysics-AI/OmniPhysics-Caption_benchmark
- Subconjunto abierto de 1.000 vídeos de Daily-Physics 50K: https://huggingface.co/datasets/Fysics-AI/OmniPhysics-Caption_benchmark/tree/main/media/train
- Checkpoint del modelo de percepción física (PPM): https://huggingface.co/Fysics-AI/OmniFysics-Captioner/tree/main/PPM
- Paper: el README enlaza a un ancla interna (`#paper`) sin URL asociada; no disponible.
- Referencia adicional hallada en la búsqueda web, sin relación confirmada con este modelo: https://arxiv.org/html/2605.20290v2 (PhysOmni: Physics-Grounded Multi-Object Scene Generation).

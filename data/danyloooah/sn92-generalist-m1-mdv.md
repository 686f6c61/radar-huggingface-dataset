# danyloooah/sn92-generalist-m1-mdv

## Resumen

SN92 generalist-m1-mdv es un modelo de clasificación de texto (text-classification) publicado por el usuario danyloooah en HuggingFace. No es un modelo entrenado desde cero, sino un merge en el espacio de pesos de tres fine-tunes del modelo base baselabs/mammoth-1, que a su vez deriva de Qwen3.5-27B (Apache-2.0) mediante post-entrenamiento. El modelo resultante conserva el backbone Qwen3_5Model con atención completa no causal y un cabezal de lectura de "answer-code" (readout) en el layout joint de REAX, orientado a la resolución de ítems de decisión con opciones discretas.

El modelo resuelve tareas de decisión y clasificación estructurada: preguntas de opción múltiple, preguntas de conocimiento con opción de abstención ("no lo sé"), y otros ítems del formato de evaluación REAX eval-v5.1. Su relevancia radica en que combina mediante aritmética de tareas lineal tres especializaciones distintas (un generalista, un "decider" y una variante generalista propia del autor) para producir un modelo único con capacidades agregadas, manteniendo licencia MIT y un tamaño de 26.085.330.160 parámetros (26,1 mil millones) en bfloat16.

El modelo tiene 56 descargas y ningún "like" en el momento de la consulta, lo que indica una adopción muy temprana. No se dispone de información sobre benchmarks publicados ni sobre idiomas soportados más allá de lo que se deduce de su linaje Qwen3.5.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3_5Model con atención completa no causal y readout de answer-code (layout joint REAX) |
| Parámetros totales | 26.085.330.160 (26,1 mil millones) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 6.144 tokens de prompt máximo (longitud máxima de entrenamiento) |
| Tipos de cuantización | no disponible (pesos publicados en bfloat16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 52,2 GB, librería pytorch) |

## Arquitectura y entrenamiento

El modelo es un merge en el espacio de pesos de tres fine-tunes de baselabs/mammoth-1 (revisión `03007ab3c4481bf01c71ef63adbbbc4b2093d71a`), que es a su vez un post-entrenamiento de Qwen3.5-27B. La receta aplicada es aritmética de tareas lineal tensor a tensor: `base + lam * combine_i(w_i * (parent_i - base))` con `lam = 1.0`, calculada en float32 y redondeada una sola vez a bfloat16. Los padres y sus pesos de cambio son isomsom/sn92-gen-m87b (peso 0,5), xflud/sn92-decider-1 (peso 0,5) y danyloooah/sn92-generalist-m1-v3a (peso 0,35). El readout (`readout.safetensors`) se obtiene como media de los readouts de los padres tras normalizar cada uno por su escala respecto al readout de mammoth-1, ajustada sobre las filas de letras centradas por fila. Los ficheros `config.json`, `joint_config.json`, el tokenizer y `decision_config.json` (temperatura 1) siguen el paquete joint de mammoth-1.

El padre propio del autor (sn92-generalist-m1-v3a) se entrenó con LoRA de rango 16, alpha 32, sin dropout, sobre las proyecciones q/k/v/o de atención, las proyecciones in_proj_qkv / in_proj_z / out_proj del Gated DeltaNet y las proyecciones gate/up/down del MLP de las 64 capas del modelo de lenguaje, fusionadas en los pesos bf16. El entrenamiento se realizó a través del camino joint-readout de REAX (Qwen3_5Model, atención completa no causal, lectura de letra en la última posición), con entropía cruzada entre `softmax(letter logits / 2)` y la opción dorada con label smoothing de 0,1; para preguntas de conocimiento con opción "no lo sé", los objetivos conservan la respuesta solo cuando mammoth-1 acertaba con probabilidad ≥ 0,5 y en caso contrario eligen "no lo sé". Se usó AdamW con learning rate 5e-5, decaimiento coseno, 20 pasos de warm-up, batch efectivo de 32 filas y 1 época sobre 43.242 filas de pregunta de 58 tipos de tarea (600-900 filas por tipo, 2.400 para abstención), con longitud máxima de prompt de 6.144 tokens. Los datos de entrenamiento del padre propio provienen exclusivamente de fuentes permisivas (generadores propios, Project Gutenberg, CMU Pronouncing Dictionary, GeoNames, ContractNLI, HANS, MASSIVE 1.1, CLINC150, BANKING77, args.me, arXiv, Wikidata, Aegis 2.0, PEPs de Python, RFCs de IETF, obras del gobierno de EE. UU., WinoGrande, CommonsenseQA, StrategyQA, QASC, OpenBookQA, Amazon ESCI, MedMCQA, XCOPA, Cosmos QA y QuaRTz, entre otras), sin texto de ítems escrito por modelos de OpenAI o Anthropic y sin el split de test de Decision-Index.

## Capacidades

- Clasificación de texto y resolución de ítems de decisión con opciones discretas (answer-code readout sobre letras de opción).
- Preguntas de opción múltiple y preguntas de conocimiento con opción explícita de abstención ("no lo sé").
- Razonamiento aritmético y problemas verbales de aritmética (generados proceduralmente en el entrenamiento).
- Razonamiento lógico y causal (ítems de lógica, causal yes/no, WinoGrande, COPA/XCOPA).
- Comprensión de código y salida de código (ítems de code output, PEPs de Python).
- Conocimiento factual y de dominio: ajedrez, acordes musicales, registros de pólizas y tarifas, metadatos de arXiv, Wikidata, datos de ciudades y países.
- Tareas de API y tool-call (ítems de API / tool-call en el formato REAX eval-v5.1).
- Clasificación de intenciones y dominios conversacionales (MASSIVE 1.1, CLINC150 + OOS, BANKING77).
- Detección de contradicción en contratos (ContractNLI) y análisis de argumentos (args.me).
- Clasificación de seguridad y daño en respuestas (Aegis 2.0).
- Preguntas de sentido común y conocimiento científico (CommonsenseQA, QASC, OpenBookQA, StrategyQA, MedMCQA).
- No se documenta soporte de tool calling en inferencia, ni modo thinking, ni visión, ni audio, ni capacidades de agente multi-paso más allá de lo implícito en los ítems de entrenamiento.

## Casos de uso

- Evaluación automatizada de modelos de decisión: el modelo puede usarse como "juez" o "decider" en pipelines de evaluación que presentan ítems de opción múltiple en formato REAX eval-v5.1, aprovechando su readout de answer-code y su opción de abstención calibrada contra mammoth-1.
- Clasificación de intenciones en asistentes conversacionales: entrenado con MASSIVE 1.1, CLINC150 + OOS y BANKING77, puede etiquetar la intención de un turno de usuario en dominios bancarios, de hogar y de servicios, con 6.144 tokens de contexto para incluir historial previo.
- Moderación y clasificación de seguridad: los datos de Aegis 2.0 permiten usar el modelo para etiquetar respuestas dañinas o no dañinas en pipelines de moderación, como clasificador complementario a filtros basados en reglas.
- Extracción de información contractual: con ContractNLI en el entrenamiento, puede clasificar si un par de frases de contrato implica contradicción, útil en revisión documental automatizada.
- Resolución de preguntas de conocimiento con abstención: en sistemas de FAQ o bases de conocimiento, el modelo puede decidir entre responder con una opción o abstenerse ("no lo sé") cuando la confianza es baja, reduciendo respuestas incorrectas en producción.
- Clasificación de consultas de búsqueda y relevancia: con Amazon ESCI y args.me, puede etiquetar la relación entre consulta y producto o la postura de un argumento, integrándose en sistemas de ranking o análisis de opinión.
- Verificación de razonamiento lógico y aritmético en pipelines educativos: los ítems generados proceduralmente (aritmética, lógica, ajedrez, acordes) permiten usar el modelo para corregir o clasificar respuestas de estudiantes en plataformas de aprendizaje.
- Clasificación de tareas de API y tool-call: los ítems de API / tool-call permiten usar el modelo para decidir qué herramienta o llamada corresponde a una petición, como paso previo a un orquestador de agentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 52,2 GB de pesos (26,1 mil millones de parámetros × 2 bytes), más overhead de activaciones y del readout; se recomienda al menos 64 GB de VRAM para inferencia cómoda en bf16.
- GPU recomendadas: A100 80 GB, H100 80 GB, o configuraciones multi-GPU con 2× RTX 4090 (24 GB cada una) mediante tensor parallelism; una única RTX 4090 no es suficiente en bf16.
- Cabe en GPU de consumidor solo con cuantización (no documentada en el repo); no se han publicado pesos GGUF ni cuantizaciones de 4 u 8 bits.
- Opciones de despliegue: al ser un modelo PyTorch con safetensors y arquitectura Qwen3_5Model con readout joint, requiere el código de REAX/mammoth-1 para cargar `joint_config.json` y `decision_config.json`; no se documenta compatibilidad directa con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| danyloooah/sn92-generalist-m1-mdv | 26,1 mil millones | 6.144 tokens | MIT | HuggingFace, 56 descargas | Merge de 3 fine-tunes de mammoth-1; clasificación de decisión |
| baselabs/mammoth-1 | no disponible | no disponible | MIT | HuggingFace | Modelo base del linaje; post-entrenado de Qwen3.5-27B |
| isomsom/sn92-gen-m87b | no disponible | no disponible | MIT | HuggingFace | Padre del merge (peso 0,5) |
| xflud/sn92-decider-1 | no disponible | no disponible | MIT | HuggingFace | Padre del merge (peso 0,5) |
| danyloooah/sn92-generalist-m1-v3a | no disponible | no disponible | MIT | HuggingFace | Padre del merge (peso 0,35); entrenado con LoRA |

No se dispone de datos de benchmarks ni de parámetros de contexto de los modelos comparables en la información proporcionada, por lo que la comparación se limita a linaje, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo es un merge de pesos, no un entrenamiento desde cero: sus capacidades están acotadas por las de sus padres y por el formato de ítems REAX eval-v5.1; no es un modelo generativo de texto libre.
- La longitud de contexto documentada es de 6.144 tokens como máximo de prompt de entrenamiento; prompts más largos pueden degradar el rendimiento.
- No se documentan idiomas soportados; el linaje Qwen3.5 sugiere multilingüismo, pero no hay confirmación en la model card.
- Riesgo de alucinación en preguntas de conocimiento: el mecanismo de abstención se calibró contra mammoth-1 con umbral 0,5, pero no hay garantía de calibración fuera de la distribución de entrenamiento.
- Sesgos potenciales heredados de los datasets de entrenamiento (Aegis 2.0, MASSIVE, CLINC150, BANKING77, GeoNames, censo de EE. UU., etc.), no auditados en la información disponible.
- La licencia MIT se aplica al modelo publicado, pero los cambios aprendidos de los padres son obra de sus autores; el modelo no está afiliado ni respaldado por Base Labs / Baseten, el equipo de Qwen, REAX ni los autores de los padres.
- No se distribuyen los ficheros de datos de entrenamiento; la reproducibilidad del padre propio depende de las fuentes públicas citadas.
- No hay cuantizaciones publicadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware de consumidor.
- El pipeline declarado es text-classification, no text-generation; integrarlo en pipelines generativos requiere adaptar el readout joint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/danyloooah/sn92-generalist-m1-mdv
- Modelo base: https://huggingface.co/baselabs/mammoth-1
- Padre isomsom/sn92-gen-m87b: https://huggingface.co/isomsom/sn92-gen-m87b
- Padre xflud/sn92-decider-1: https://huggingface.co/xflud/sn92-decider-1
- Padre danyloooah/sn92-generalist-m1-v3a: https://huggingface.co/danyloooah/sn92-generalist-m1-v3a
- GeoNames: https://www.geonames.org
- Repositorio de PEPs de Python: https://github.com/python/peps
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.

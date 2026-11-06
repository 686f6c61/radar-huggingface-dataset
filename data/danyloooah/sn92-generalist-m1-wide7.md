# danyloooah/sn92-generalist-m1-wide7

## Resumen

sn92-generalist-m1-wide7 es un modelo de decisión obtenido por fusión en el espacio de pesos (weight-space merge) de siete fine-tunes de baselabs/mammoth-1, un modelo post-entrenado a partir de Qwen3.5-27B. Lo publica el usuario danyloooah y su propósito no es la generación libre de texto, sino la clasificación y la selección de respuestas sobre un conjunto cerrado de opciones (readout de letra en la última posición), siguiendo el formato REAX de evaluación de decisiones. El pipeline declarado en Hugging Face es text-classification y la licencia es MIT.

El modelo combina los cambios aprendidos de seis fine-tunes públicos (isomsom/sn92-gen-m87b, xflud/sn92-decider-1, gurujustin/sn92-gen-m1b, edinlong83/sn92-generalist-h5, mufasa1228/sn92-gen-r2 y danyloooah/sn92-generalist-m1-v3a) más un fine-tune propio no publicado, mediante aritmética de tareas lineal tensor a tensor. El resultado conserva la arquitectura del backbone Qwen3_5Model con atención completa no causal y un cabezal de lectura de respuesta separado (readout.safetensors).

Es relevante porque ejemplifica una familia de modelos especializados en toma de decisiones y abstención (respuesta "no lo sé") sobre tareas heterogéneas —aritmética, lógica, código, ajedrez, políticas, llamadas a herramientas, clasificación de intenciones—, con un total de 26.085.330.160 parámetros y un contexto de prompt de hasta 6.144 tokens durante el entrenamiento. Su naturaleza de merge lo hace interesante para estudiar técnicas de model merging aplicadas a modelos post-entrenados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3_5Model con atención completa no causal y cabezal de lectura de respuesta (REAX joint-readout); incluye capas Gated DeltaNet y codificador de visión |
| Parametros totales | 26.085.330.160 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 6.144 tokens de prompt máximo durante el entrenamiento; longitud máxima de inferencia no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 52,2 GB), librería pytorch |

## Arquitectura y entrenamiento

El modelo parte de baselabs/mammoth-1 (revisión 03007ab3c4481bf01c71ef63adbbbc4b2093d71a, MIT, Base Labs / Baseten), post-entrenado desde Qwen3.5-27B (Apache-2.0). La arquitectura es un transformer Qwen3_5Model con atención completa no causal y un cabezal de lectura de letra en la última posición, empaquetado en el formato joint de REAX (config.json, joint_config.json, tokenizer y decision_config.json con temperatura 1). El merge se realizó con aritmética de tareas lineal por tensor: `base + lam * combine_i(w_i * (parent_i - base))` con lam = 1.0, calculado tensor a tensor en float32 y redondeado una sola vez a bfloat16. Los pesos de cada padre son 0.3 (isomsom/sn92-gen-m87b), 0.27 (xflud/sn92-decider-1), 0.25 (gurujustin/sn92-gen-m1b), 0.2 (edinlong83/sn92-generalist-h5), 0.2 (mufasa1228/sn92-gen-r2) y 0.14 para cada uno de los dos fine-tunes de danyloooah (uno de ellos no publicado). El readout es la media de los readouts de los padres tras normalizar cada uno por su escala frente al readout de mammoth-1.

El fine-tune propio (sn92-generalist-m1-v3a y su variante semilla 1) se entrenó con LoRA de rango 16, alpha 32 y sin dropout sobre las proyecciones q/k/v/o de atención, las proyecciones in_proj_qkv / in_proj_z / out_proj de Gated DeltaNet y las proyecciones gate/up/down del MLP de las 64 capas del modelo de lenguaje, fusionado después en los pesos bf16; el codificador de visión y el readout quedaron sin cambios. El entrenamiento usó cross-entropy entre softmax(logits de letra / 2) y la opción dorada con label smoothing 0.1, o, en preguntas de conocimiento con opción "no lo sé", objetivos que conservan la respuesta solo si mammoth-1 acertaba con probabilidad ≥ 0.5. Se empleó AdamW con learning rate 5e-5, decaimiento coseno, 20 pasos de warm-up, batch efectivo de 32 filas y 1 época sobre 43.242 filas de pregunta de 58 tipos de tarea en formato REAX eval-v5.1 (unas 600-900 filas por tipo, 2.400 para abstención), con longitud máxima de prompt de 6.144 tokens. Las fuentes de datos son permisivas y están detalladas en la model card (generadores propios, Project Gutenberg, CMU Pronouncing Dictionary, GeoNames, ContractNLI, HANS, MASSIVE 1.1, CLINC150, BANKING77, args.me, arXiv, Wikidata, Aegis 2.0, PEPs de Python, RFC del IETF, datos públicos del gobierno de EE. UU., WinoGrande, CommonsenseQA y StrategyQA, entre otras).

## Capacidades

- Clasificación y selección de respuestas sobre un conjunto cerrado de opciones mediante readout de letra, no generación libre de texto.
- Razonamiento sobre tareas de decisión: aritmética con enunciados, causalidad sí/no, lógica, predicción de salida de código, ajedrez, acordes musicales.
- Manejo de registros de políticas y tarifas, y de elementos de API / llamada a herramientas en formato de decisión.
- Abstención calibrada: opción "no lo sé" en preguntas de conocimiento, entrenada explícitamente con 2.400 filas de abstención.
- Clasificación de intenciones y dominio conversacional (CLINC150 con OOS, BANKING77, MASSIVE 1.1).
- Razonamiento de sentido común y lingüístico (CommonsenseQA, StrategyQA, WinoGrande, HANS).
- Inferencia de lenguaje natural sobre contratos (ContractNLI) y análisis de argumentos (args.me).
- Capacidad multimodal potencial por herencia del codificador de visión de mammoth-1, aunque no se documenta su uso en este merge.
- Soporte de tool calling / function calling únicamente en el sentido de clasificar elementos de llamada a herramientas, no como generación de llamadas.
- Capacidades multilingües: no disponibles (no se documentan idiomas soportados).

## Casos de uso

- Enrutamiento de intenciones en asistentes conversacionales: el modelo clasifica la intención del usuario entre un conjunto cerrado de opciones (entrenado con CLINC150, BANKING77 y MASSIVE 1.1), adecuado para pipelines de atención al cliente donde se necesita una etiqueta discreta y no texto libre.
- Evaluación automática de modelos de decisión: sirve como referencia o componente de un jurado para comparar respuestas sobre ítems en formato REAX eval-v5.1, gracias a su readout calibrado y a la opción de abstención.
- Moderación y etiquetado de seguridad: los datos de Aegis 2.0 permiten usar el modelo para clasificar respuestas dañinas o no dañinas en un conjunto cerrado de categorías.
- Extracción de cláusulas contractuales: con ContractNLI puede determinar si un contrato implica o no una hipótesis dada, útil en revisión documental automatizada.
- Verificación de razonamiento aritmético y lógico: los ítems generados de aritmética, lógica y causalidad permiten usarlo como verificador de soluciones candidatas en sistemas de razonamiento multi-paso.
- Clasificación de registros administrativos: los datos de NHTSA, openFDA, Federal Register y NOAA permiten etiquetar registros de políticas, recalls o eventos meteorológicos en categorías predefinidas.
- Filtrado de preguntas de conocimiento con abstención: en bases de conocimiento o sistemas de FAQ, el modelo puede decidir responder o abstenerse según su calibración, reduciendo respuestas incorrectas.
- Análisis de argumentos y posturas: con args.me puede clasificar la postura o el tipo de argumento en debates y foros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 52 GB solo para pesos (26,1 mil millones de parámetros × 2 bytes), más overhead de activaciones y del codificador de visión; en la práctica se recomienda al menos 60-80 GB.
- En cuantización de 8 bits: unos 26 GB de pesos; en 4 bits: unos 13-14 GB, aunque no se documentan cuantizaciones oficiales para este modelo.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para bfloat16 sin cuantizar; A100 40 GB o L40S 48 GB solo con cuantización.
- GPU de consumo: no cabe en RTX 4090 (24 GB) en bfloat16; podría caber en cuantización de 4 bits, pero no hay pesos GGUF publicados ni confirmación de compatibilidad.
- Opciones de despliegue: al ser un paquete joint de REAX con readout separado, requiere el código de evaluación REAX y el pipeline de text-classification; no se documenta soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| sn92-generalist-m1-wide7 | 26,1 mil millones | 6.144 tokens de prompt (entrenamiento) | MIT | Merge de 7 fine-tunes de mammoth-1; readout de decisión |
| baselabs/mammoth-1 | no disponible en la información | no disponible | MIT | Modelo base post-entrenado desde Qwen3.5-27B; misma arquitectura y readout |
| Qwen3.5-27B | 27 mil millones (aproximado) | no disponible | Apache-2.0 | Modelo generativo original del que deriva mammoth-1 |
| danyloooah/sn92-generalist-m1-v3a | no disponible en la información | no disponible | MIT | Fine-tune padre de este merge, con receta LoRA documentada |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: solo produce una elección entre opciones predefinidas mediante el readout de letra; no debe usarse para generar texto libre.
- Riesgo de alucinación estructural: al forzar una elección entre opciones, puede seleccionar una respuesta incorrecta con alta confianza; la calibración depende del entrenamiento con label smoothing y de la opción de abstención.
- Idiomas soportados no documentados; el entrenamiento se realizó sobre todo con datos en inglés (Gutenberg, CLINC150, BANKING77, MASSIVE 1.1, etc.), por lo que el rendimiento en castellano es incierto.
- Longitud de contexto limitada a 6.144 tokens de prompt en entrenamiento; prompts más largos pueden degradar el rendimiento.
- El merge combina pesos de seis padres con licencia MIT, pero la procedencia de los datos de cada padre se describe solo en sus respectivas model cards; conviene revisarlas antes de un uso comercial.
- El autor declara no estar afiliado a Base Labs / Baseten, al equipo de Qwen ni a REAX; no hay respaldo oficial.
- El modelo incluye un codificador de visión heredado, pero no se documenta su funcionamiento tras el merge ni se ha validado.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de su calidad frente a alternativas.
- El repositorio tiene 25 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/danyloooah/sn92-generalist-m1-wide7
- Modelo base: https://huggingface.co/baselabs/mammoth-1
- Padre isomsom/sn92-gen-m87b: https://huggingface.co/isomsom/sn92-gen-m87b
- Padre xflud/sn92-decider-1: https://huggingface.co/xflud/sn92-decider-1
- Padre gurujustin/sn92-gen-m1b: https://huggingface.co/gurujustin/sn92-gen-m1b
- Padre edinlong83/sn92-generalist-h5: https://huggingface.co/edinlong83/sn92-generalist-h5
- Padre mufasa1228/sn92-gen-r2: https://huggingface.co/mufasa1228/sn92-gen-r2
- Padre danyloooah/sn92-generalist-m1-v3a: https://huggingface.co/danyloooah/sn92-generalist-m1-v3a
- GeoNames: https://www.geonames.org
- Repositorio de PEPs de Python: https://github.com/python/peps

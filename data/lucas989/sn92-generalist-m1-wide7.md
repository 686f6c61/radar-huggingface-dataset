# Lucas989/sn92-generalist-m1-wide7

## Resumen

SN92 generalist decision model (merge) es un modelo de clasificación de texto obtenido por fusión en el espacio de pesos de siete fine-tunes de `baselabs/mammoth-1`, un modelo post-entrenado a partir de Qwen3.5-27B (Apache-2.0) con licencia MIT. Lo publica el usuario Lucas989 en HuggingFace y no está afiliado a Base Labs / Baseten, al equipo de Qwen, a REAX ni a los autores de los modelos padre. El modelo resuelve tareas de decisión de opción múltiple en formato REAX eval-v5.1: recibe una pregunta con opciones (letras) y emite una distribución sobre las letras de respuesta, en lugar de generar texto libre.

La arquitectura subyacente es un backbone `Qwen3_5Model` en el layout de lectura conjunta (joint-readout) de REAX, con atención completa no causal y un cabezal de lectura de códigos de respuesta. El resultado de la fusión tiene 26.085.330.160 parámetros totales (26,1 mil millones) en bfloat16, con un tamaño de repositorio de 52,2 GB. La licencia es MIT y el pipeline declarado es `text-classification`.

Es relevante porque demuestra una técnica de merging lineal (task arithmetic) aplicada a un modelo de decisión con cabezal de lectura separado, y porque combina siete fuentes con pesos explícitos para producir un clasificador generalista de 58 tipos de tarea. No obstante, se trata de un artefacto de investigación con 38 descargas y sin datos de benchmarks publicados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer `Qwen3_5Model` con atención completa no causal y cabezal de lectura de letras (joint-readout REAX) |
| Parámetros totales | 26.085.330.160 (26,1 B) |
| Parámetros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible como ventana nominal; el entrenamiento usó prompts de hasta 6.144 tokens |
| Tipos de cuantización | no disponible (pesos en bfloat16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch); incluye `readout.safetensors`, `config.json`, `joint_config.json`, tokenizer y `decision_config.json` |

## Arquitectura y entrenamiento

El modelo es una fusión en el espacio de pesos (weight-space merge) de siete fine-tunes de `baselabs/mammoth-1` (revisión `03007ab3c4481bf01c71ef63adbbbc4b2093d71a`), que a su vez deriva de Qwen3.5-27B. La receta aplica aritmética de tareas lineal tensor a tensor: `base + lam * combine_i(w_i * (parent_i - base))` con `lam = 1.0`, calculada en float32 y redondeada una sola vez a bfloat16. Los pesos de cada padre son 0,3 para `isomsom/sn92-gen-m87b`, 0,27 para `xflud/sn92-decider-1`, 0,25 para `gurujustin/sn92-gen-m1b`, 0,2 para `edinlong83/sn92-generalist-h5`, 0,2 para `mufasa1228/sn92-gen-r2`, 0,14 para `danyloooah/sn92-generalist-m1-v3a` y 0,14 para un fine-tune propio no publicado. El cabezal de lectura (`readout.safetensors`) es la media de los readouts de los padres tras normalizar cada uno por su escala frente al readout de mammoth-1, ajustada sobre las filas de letras centradas por fila.

El entrenamiento descrito corresponde al padre propio `danyloooah/sn92-generalist-m1-v3a`: LoRA de rango 16, alpha 32 y sin dropout sobre las proyecciones q/k/v/o de atención, las proyecciones `in_proj_qkv`, `in_proj_z` y `out_proj` del Gated DeltaNet y las proyecciones gate/up/down del MLP de las 64 capas del modelo de lenguaje, fusionado en los pesos bf16. Se usó AdamW con tasa 5e-5, decaimiento coseno y 20 pasos de calentamiento, batch efectivo de 32 filas, una época sobre 43.242 filas de pregunta de 58 tipos de tarea (600-900 filas por tarea, 2.400 para abstención) en formato REAX eval-v5.1, con longitud máxima de prompt de 6.144 tokens. La pérdida es entropía cruzada entre `softmax(letter logits / 2)` y la opción dorada con label smoothing de 0,1; en preguntas de conocimiento con opción "no lo sé", se mantiene la respuesta solo si mammoth-1 acertaba con probabilidad ≥ 0,5. Las fuentes de datos incluyen generadores propios (CC0), Project Gutenberg, CMU Pronouncing Dictionary (BSD-2-Clause), GeoNames (CC BY 4.0), ContractNLI, HANS, MASSIVE 1.1, CLINC150, BANKING77, args.me, Wikidata, Aegis 2.0, WinoGrande, CommonsenseQA y StrategyQA, entre otras.

## Capacidades

- Clasificación de decisiones de opción múltiple con salida sobre códigos de letra (A, B, C, D, etc.), no generación de texto libre.
- Cobertura de 58 tipos de tarea en el entrenamiento: aritmética verbal, causalidad sí/no, lógica, salida de código, ajedrez, acordes musicales, registros de políticas y tarifas, elementos de API y tool-call.
- Abstención calibrada: opción "no lo sé" entrenada con 2.400 filas específicas y umbral de probabilidad 0,5 sobre mammoth-1.
- Razonamiento de sentido común y conocimiento factual (CommonsenseQA, StrategyQA, WinoGrande, Wikidata).
- Clasificación de intenciones y dominio conversacional (MASSIVE 1.1, CLINC150 + OOS, BANKING77).
- Análisis de argumentación (args.me) y de contratos (ContractNLI).
- Evaluación de seguridad y daño en respuestas (Aegis 2.0).
- No se documentan capacidades de tool calling generativo, agentes multi-paso, visión operativa ni audio en la información disponible; el encoder de visión queda sin modificar en el padre propio, pero no se describe su uso en este merge.

## Casos de uso

- Enrutamiento de decisiones en pipelines de evaluación: dado un ítem de opción múltiple en formato REAX eval-v5.1, el modelo devuelve la distribución sobre letras y permite seleccionar la respuesta con mayor probabilidad; es adecuado porque su readout está diseñado exactamente para esa tarea.
- Moderación y clasificación de seguridad: con las etiquetas de Aegis 2.0 en el entrenamiento, puede puntuar respuestas de un LLM según daño percibido y activar revisiones humanas cuando la probabilidad de la opción "dañino" supere un umbral configurable.
- Clasificación de intenciones en asistentes conversacionales: al haber visto MASSIVE 1.1, CLINC150 y BANKING77, puede asignar una consulta de usuario a una intención predefinida (por ejemplo, "consultar saldo" o "cancelar reserva") en sistemas de atención al cliente con catálogos cerrados.
- Verificación de coherencia lógica en pipelines de generación: los ítems de causalidad sí/no, HANS y WinoGrande permiten usarlo como filtro para descartar pares pregunta-respuesta que contradigan relaciones causales o de implicación.
- Evaluación de salidas de código: los ítems de "code output" del entrenamiento permiten comprobar si un fragmento produce la salida esperada en preguntas de opción múltiple, útil en suites de test automáticas de asistentes de programación.
- Clasificación de registros administrativos y normativos: los ítems de políticas, tarifas, ContractNLI y el Federal Register permiten etiquetar cláusulas o registros según categorías predefinidas en flujos de cumplimiento normativo.
- Abstención en sistemas de conocimiento: la opción "no lo sé" entrenada con umbral 0,5 permite derivar a un humano las preguntas en las que el modelo no alcanza confianza suficiente, reduciendo respuestas incorrectas en producción.
- Evaluación comparativa de modelos de decisión: al ser un merge reproducible con pesos explícitos, sirve como referencia en experimentos de task arithmetic sobre modelos de clasificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 52 GB solo para pesos (26,1 B × 2 bytes), más overhead de activaciones y del cabezal de lectura; en la práctica se requiere al menos 60-70 GB de VRAM para prompts de hasta 6.144 tokens.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para inferencia en bf16 sin cuantizar. Con dos A100 40 GB o dos RTX 4090 de 24 GB sería necesario reparto por tensor o cuantización, no documentada.
- No cabe en una única GPU de consumo (RTX 4090 24 GB, RTX 3090 24 GB) en bfloat16. No se documentan pesos GGUF ni cuantizaciones de 4 u 8 bits, por lo que no se puede confirmar su viabilidad en consumer GPU.
- Opciones de despliegue: al ser un paquete PyTorch con `config.json`, `joint_config.json` y `decision_config.json` propios del layout REAX, requiere el código de REAX o una implementación compatible de `Qwen3_5Model` con lectura conjunta; no se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lucas989/sn92-generalist-m1-wide7 | 26,1 B | no disponible (prompts de entrenamiento de 6.144 tokens) | Clasificación de decisión de opción múltiple (58 tipos) | MIT | HuggingFace, 38 descargas |
| baselabs/mammoth-1 | no disponible | no disponible | Decisión con joint-readout REAX | MIT | HuggingFace |
| danyloooah/sn92-generalist-m1-v3a | no disponible | no disponible | Decisión generalista (padre del merge) | MIT | HuggingFace |
| Qwen3.5-27B | 27 B (aproximado) | no disponible | Generación de texto general | Apache-2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: emite una distribución sobre letras de opción; no puede usarse para diálogo abierto ni generación de texto libre.
- El formato de entrada está acoplado a REAX eval-v5.1; fuera de ese formato los resultados pueden degradarse sin aviso.
- No se han publicado benchmarks ni evaluaciones independientes; el rendimiento real en producción es desconocido.
- Riesgo de alucinación trasladado de los modelos padre: en preguntas de conocimiento puede seleccionar una opción incorrecta con alta confianza; la abstención solo se calibró con umbral 0,5 sobre mammoth-1.
- Idiomas soportados no documentados; el entrenamiento del padre propio se describe principalmente con fuentes en inglés (Gutenberg, CMU, MASSIVE localizado, CLINC150, BANKING77), por lo que el rendimiento en castellano no está garantizado.
- Sesgos heredados de los datasets: Aegis 2.0 incluye etiquetas de daño generadas por un jurado de LLM (Mixtral-8x22B, Mistral-NeMo-12B, Gemma-2-27B), lo que puede introducir sesgos de esos modelos; GeoNames, US Census 1990 y otras fuentes tienen sesgos demográficos y geográficos conocidos.
- La licencia MIT permite uso comercial, pero los modelos padre y las fuentes de datos tienen sus propias licencias (Apache-2.0 para Qwen3.5-27B, CC BY 4.0 para varios datasets) que deben respetarse por separado.
- El autor declara no estar afiliado a Base Labs / Baseten, al equipo de Qwen, a REAX ni a los autores de los padres; no hay garantía de soporte ni mantenimiento.
- El repositorio tiene 38 descargas y 0 likes en el momento de la consulta; es un artefacto de investigación sin validación comunitaria.
- El modelo incluye un encoder de visión heredado sin modificar, pero no se documenta su uso ni su calidad en este merge.

## Enlaces

- HuggingFace: https://huggingface.co/Lucas989/sn92-generalist-m1-wide7
- Modelo base principal: https://huggingface.co/baselabs/mammoth-1
- Padre isomsom/sn92-gen-m87b: https://huggingface.co/isomsom/sn92-gen-m87b
- Padre xflud/sn92-decider-1: https://huggingface.co/xflud/sn92-decider-1
- Padre gurujustin/sn92-gen-m1b: https://huggingface.co/gurujustin/sn92-gen-m1b
- Padre edinlong83/sn92-generalist-h5: https://huggingface.co/edinlong83/sn92-generalist-h5
- Padre mufasa1228/sn92-gen-r2: https://huggingface.co/mufasa1228/sn92-gen-r2
- Padre danyloooah/sn92-generalist-m1-v3a: https://huggingface.co/danyloooah/sn92-generalist-m1-v3a

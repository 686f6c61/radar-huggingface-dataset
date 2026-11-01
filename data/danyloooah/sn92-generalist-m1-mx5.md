# danyloooah/sn92-generalist-m1-mx5

## Resumen

sn92-generalist-m1-mx5 es un merge en espacio de pesos de cinco fine-tunes del modelo base baselabs/mammoth-1, un modelo de decisión derivado de Qwen3.5-27B con backbone Qwen3_5Model y layout de lectura conjunta REAX. Lo publica el usuario danyloooah y está pensado como un modelo clasificador de decisiones: recibe una pregunta con opciones y emite una respuesta en forma de código de letra (readout), no como generación libre de texto. El modelo tiene 26.085.330.160 parámetros (aproximadamente 26,1 mil millones) y se distribuye en formato safetensors con licencia MIT.

El interés técnico del modelo reside en su receta de merge: aritmética de tareas lineal aplicada tensor a tensor sobre el backbone, con pesos de cambio distintos por padre (0,5 para cuatro de ellos y 0,35 para el quinto), y una combinación específica del readout de respuestas que normaliza cada uno por su escala respecto a mammoth-1 antes de promediar. Es un ejemplo de composición de habilidades mediante weight arithmetic sobre un modelo post-entrenado, en lugar de un fine-tune adicional.

Su relevancia es acotada pero clara: sirve como artefacto de referencia para quien investigue merges de modelos de decisión, evaluación de tareas con formato REAX y entrenamiento de abstención ("no lo sé") mediante etiquetas derivadas del propio modelo base. No es un modelo conversacional generalista ni un generador de texto libre.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3_5Model (backbone transformer con Gated DeltaNet y atención completa no causal en el path de lectura conjunta REAX) |
| Parámetros totales | 26.085.330.160 |
| Parámetros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible como ventana de inferencia general; el entrenamiento usó una longitud máxima de prompt de 6.144 tokens |
| Tipos de cuantización | no disponible (pesos publicados en bfloat16; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (backbone) más `readout.safetensors` para la cabeza de lectura; configuración en `config.json`, `joint_config.json` y `decision_config.json` |

## Arquitectura y entrenamiento

El modelo parte de baselabs/mammoth-1 (revisión `03007ab3c4481bf01c71ef63adbbbc4b2093d71a`), un modelo post-entrenado a partir de Qwen3.5-27B con backbone Qwen3_5Model. La arquitectura combina capas con Gated DeltaNet (proyecciones `in_proj_qkv`, `in_proj_z` y `out_proj`) y atención completa no causal, con un readout de última posición que produce logits sobre letras de opción. El paquete de decisión incluye un `decision_config.json` con temperatura 1. El merge no entrena nada nuevo: aplica, para cada tensor del backbone, la fórmula `base + lam * sum_i(w_i * (parent_i - base))` con `lam = 1.0`, calculada en float32 tensor a tensor y redondeada una sola vez a bfloat16. Los pesos de cambio son 0,5 para isomsom/sn92-gen-m87b, xflud/sn92-decider-1, gurujustin/sn92-gen-m1b y edinlong83/sn92-generalist-h5, y 0,35 para danyloooah/sn92-generalist-m1-v3a.

El readout de respuestas se obtiene promediando los readouts de los padres tras dividir cada uno por su escala respecto al readout de mammoth-1, ajustada sobre las filas de letras centradas por fila (un desplazamiento de fila común no altera el softmax sobre opciones). El único padre entrenado por el autor del merge, sn92-generalist-m1-v3a, se entrenó con LoRA de rango 16 y alpha 32, sin dropout, sobre las proyecciones q/k/v/o de atención, las proyecciones Gated DeltaNet y las proyecciones gate/up/down del MLP en las 64 capas del modelo de lenguaje, con el encoder de visión y el readout sin tocar. El entrenamiento usó entropía cruzada entre `softmax(letter logits / 2)` y la opción dorada con label smoothing de 0,1; para preguntas de conocimiento con opción "no lo sé", el objetivo conserva la respuesta solo cuando mammoth-1 acertaba con probabilidad mayor o igual a 0,5 y en caso contrario selecciona "no lo sé". Se usó AdamW con learning rate 5e-5, decaimiento coseno, 20 pasos de warm-up, batch efectivo de 32 filas y una época sobre 43.242 filas de pregunta de 58 tipos de tarea en formato REAX eval-v5.1 (aproximadamente 600-900 filas por tipo, 2.400 para abstención), con prompt máximo de 6.144 tokens.

## Capacidades

- Clasificación de decisiones sobre preguntas de opción múltiple: el modelo emite un código de letra mediante el readout, no texto generativo libre.
- Razonamiento aritmético y de problemas verbales: el padre entrenado incluyó ítems generados de aritmética y lógica.
- Razonamiento causal y lógico con respuestas sí/no.
- Predicción de salida de código y tareas de evaluación de fragmentos de código.
- Tareas estructuradas de ajedrez, acordes musicales y registros de pólizas y tarifas.
- Manejo de ítems de API y tool-call en formato de decisión (selección entre opciones de llamada).
- Abstención calibrada: opción "no lo sé" entrenada con objetivos derivados de la confianza de mammoth-1.
- Cobertura de 58 tipos de tarea en el conjunto de entrenamiento del padre.
- Capacidades multilingües: no disponible (no se documentan idiomas soportados).
- No se documenta soporte de agentes multi-paso, visión en inferencia ni modo thinking.

## Casos de uso

- Evaluación de modelos de decisión en investigación: sirve como checkpoint de referencia para estudiar cómo afecta la aritmética de tareas en espacio de pesos a la precisión por tipo de tarea frente a cada padre por separado.
- Clasificación de intenciones y enrutado: el padre se entrenó con CLINC150, BANKING77 y MASSIVE 1.1, por lo que el merge puede emplearse para seleccionar entre opciones de intención en un pipeline de atención al cliente, emitiendo una etiqueta en lugar de texto libre.
- Detección de abstención en sistemas de preguntas y respuestas: la cabeza entrenada para elegir "no lo sé" cuando mammoth-1 no superaba el umbral de 0,5 permite construir un filtro de confianza previo a la generación.
- Selección de llamadas a herramientas: los ítems de API y tool-call del entrenamiento permiten usar el modelo como clasificador que elige entre un conjunto finito de llamadas o parámetros antes de invocar un ejecutor.
- Verificación de respuestas factuales en pipelines de RAG: dado un contexto y una pregunta con opciones, el modelo puede actuar como juez de opción múltiple para descartar respuestas no respaldadas.
- Análisis de documentos contractuales: el uso de ContractNLI en el entrenamiento del padre lo hace adecuado para tareas de implicación entre cláusulas y afirmaciones en formato de decisión.
- Evaluación de razonamiento común: con WinoGrande, CommonsenseQA, StrategyQA, QASC y OpenBookQA en el corpus del padre, puede emplearse como sonda de razonamiento de sentido común en comparaciones de merges.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 52 GB solo para pesos (26,1 mil millones de parámetros a 2 bytes), más overhead de activaciones y del readout; el repositorio ocupa 52,2 GB.
- GPU recomendadas para bf16: A100 80 GB, H100 80 GB o dos GPU de 48 GB con paralelismo de tensor. No cabe en una RTX 4090 de 24 GB en bf16.
- GPU de consumo: una RTX 4090 o RTX 3090 requeriría cuantización a 8 bits (aproximadamente 26 GB, todavía por encima de 24 GB) o a 4 bits (aproximadamente 13-14 GB), pero no se documentan pesos cuantizados ni recetas de cuantización para este modelo.
- Opciones de despliegue: al ser un paquete con backbone Qwen3_5Model y readout separado, requiere cargar `config.json`, `joint_config.json`, `decision_config.json` y `readout.safetensors` con el código del paquete conjunto de mammoth-1; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sn92-generalist-m1-mx5 | 26,1 B | prompt de entrenamiento de 6.144 tokens | Clasificación de decisiones (readout de letras) | MIT | HuggingFace, 60 descargas |
| baselabs/mammoth-1 | no disponible en la información | no disponible | Modelo de decisión base | MIT | HuggingFace |
| danyloooah/sn92-generalist-m1-v3a | no disponible en la información | no disponible | Fine-tune de decisión (padre del merge) | MIT | HuggingFace |
| isomsom/sn92-gen-m87b | no disponible en la información | no disponible | Fine-tune de decisión (padre del merge) | MIT | HuggingFace |

Los cuatro padres restantes (xflud/sn92-decider-1, gurujustin/sn92-gen-m1b, edinlong83/sn92-generalist-h5) comparten la misma categoría y licencia MIT, pero no se dispone de sus recuentos de parámetros ni de resultados comparativos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo de texto libre: el readout produce códigos de letra sobre opciones, por lo que no debe emplearse para chat, redacción ni completado abierto.
- El modelo no está afiliado, respaldado ni patrocinado por Base Labs, Baseten, el equipo de Qwen, REAX ni los autores de los padres; la atribución de los cambios aprendidos corresponde a esos autores.
- Los datos de entrenamiento del padre propio excluyeron texto de modelos OpenAI y Anthropic y el split de test de Decision-Index, pero los padres públicos pueden haber usado otras fuentes no verificadas en esta ficha.
- Riesgo de alucinación en la selección de opciones: el readout puede elegir una letra con alta confianza aunque la respuesta sea incorrecta; la calibración de abstención solo se validó contra las predicciones de mammoth-1 en el corpus de entrenamiento.
- Idiomas soportados no documentados: no hay garantía de comportamiento fuera del inglés, que es el idioma predominante de las fuentes citadas (CLINC150, BANKING77, MASSIVE, ContractNLI, etc.).
- La ventana de 6.144 tokens corresponde a la longitud máxima de prompt durante el entrenamiento del padre, no a una ventana de inferencia verificada para este merge.
- No se publican pesos cuantizados ni scripts de despliegue, lo que limita el uso en hardware de consumo.
- El modelo se publicó el 28 de octubre de 2026 con 0 likes y 60 descargas: no hay evidencia de validación independiente ni de uso en producción.
- Licencia MIT permite uso comercial, pero la cadena de modelos base (Qwen3.5-27B con Apache-2.0 y mammoth-1 con MIT) debe respetarse en la redistribución.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/danyloooah/sn92-generalist-m1-mx5
- Modelo base: https://huggingface.co/baselabs/mammoth-1
- Padre isomsom/sn92-gen-m87b: https://huggingface.co/isomsom/sn92-gen-m87b
- Padre xflud/sn92-decider-1: https://huggingface.co/xflud/sn92-decider-1
- Padre gurujustin/sn92-gen-m1b: https://huggingface.co/gurujustin/sn92-gen-m1b
- Padre edinlong83/sn92-generalist-h5: https://huggingface.co/edinlong83/sn92-generalist-h5
- Padre danyloooah/sn92-generalist-m1-v3a: https://huggingface.co/danyloooah/sn92-generalist-m1-v3a
- GeoNames: https://www.geonames.org

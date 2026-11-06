# danyloooah/sn92-generalist-m1-v3a

## Resumen

SN92 generalist es un fine-tune independiente del modelo `baselabs/mammoth-1` de Base Labs (Baseten), publicado por el usuario `danyloooah`. No es un modelo generativo al uso: se ha empaquetado como un **modelo de decisión** en el formato de lectura conjunta REAX, es decir, recibe un ítem con varias opciones de respuesta y emite una distribución sobre las letras de opción (A, B, C...) en lugar de texto libre. El backbone es `Qwen3_5Model` (procedente de Qwen3.5-27B, licencia Apache-2.0) con las capas de atención completa bidireccional por bloques de mammoth-1 y la cabeza de lectura restringida a las filas de letras de respuesta.

El modelo tiene 26.085.330.160 parámetros (unos 26,1 mil millones) y un repositorio de 52,2 GB en safetensors bf16. Se distribuye bajo licencia MIT y la etiqueta de pipeline es `text-classification`, lo que refleja su naturaleza de clasificador de opciones más que de generador. Su relevancia radica en el nicho: evaluación y enrutamiento de decisiones con abstención explícita ("no lo sé") sobre 58 tipos de tarea distintos, con contexto de hasta 6.144 tokens.

La información pública disponible es escasa (39 descargas, 0 likes, sin benchmarks publicados), por lo que esta ficha se limita a lo que el autor documenta en la model card y a las especificaciones inferidas de los ficheros de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3_5Model con capas de atención completa bidireccional por bloques (no causal) y componentes Gated DeltaNet; lectura conjunta REAX |
| Parametros totales | 26.085.330.160 (~26,1 B) |
| Parametros activos | no disponible (no se documenta como MoE) |
| Longitud de contexto | 6.144 tokens de prompt como máximo en entrenamiento; contexto nativo del backbone no disponible |
| Tipos de cuantizacion | no se distribuyen pesos cuantizados; solo bf16 safetensors (cuantización posible vía herramientas externas, no validada por el autor) |
| Idiomas soportados | no disponible (la model card no declara idiomas; los datos de entrenamiento incluyen mayoritariamente fuentes en inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (bf16), librería PyTorch |

## Arquitectura y entrenamiento

El modelo parte de `baselabs/mammoth-1` (revisión `03007ab3c4481bf01c71ef63adbbbc4b2093d71a`), que a su vez es un post-entrenamiento de Qwen3.5-27B. La arquitectura conserva el backbone `Qwen3_5Model` con 64 capas de lenguaje, pero sustituye el comportamiento causal por **atención completa bidireccional por bloques** en las capas de atención, tal como hace mammoth-1. La cabeza de lenguaje se recorta a las filas correspondientes a letras de respuesta, de modo que la salida es un vector de logits sobre opciones, no una secuencia de tokens. El codificador de visión y la cabeza de lectura originales se mantienen sin cambios.

El ajuste se realizó con **LoRA de rango 16 y alpha 32, sin dropout**, aplicado a las proyecciones q/k/v/o de atención, a las proyecciones `in_proj_qkv`, `in_proj_z` y `out_proj` del Gated DeltaNet y a las proyecciones gate/up/down del MLP de las 64 capas. Los adaptadores se fusionaron en los pesos bf16. El entrenamiento usó AdamW con learning rate 5e-5, decaimiento coseno, 20 pasos de calentamiento, batch efectivo de 32 filas y una época sobre **43.242 filas de pregunta de 58 tipos de tarea** en el formato de ítems REAX eval-v5.1 (600-900 filas por tipo, 2.400 para abstención). La pérdida es entropía cruzada entre `softmax(logits de letra / 2)` y la opción dorada con label smoothing de 0,1; para preguntas de conocimiento con opción "no lo sé", el objetivo conserva la respuesta solo cuando mammoth-1 acertaba con probabilidad ≥ 0,5 y en caso contrario selecciona la abstención.

Los datos de entrenamiento son exclusivamente de ajuste fino (no se distribuyen ficheros de dataset) y combinan ítems generados proceduralmente (aritmética, lógica, código, ajedrez, acordes, política, tarifas, API/tool-calls), textos de Project Gutenberg, listas de apellidos del censo de EE. UU., el diccionario CMU, GeoNames, y una larga lista de benchmarks y corpus permisivos (ContractNLI, HANS, MASSIVE 1.1, CLINC150, BANKING77, args.me, Wikidata, Aegis 2.0, WinoGrande, CommonsenseQA, StrategyQA, QASC, OpenBookQA, MedMCQA, XCOPA, Cosmos QA, QuaRTz, entre otros). No se usó el split de test de Decision-Index ni texto generado por modelos de OpenAI o Anthropic.

## Capacidades

- **Clasificación de opciones múltiples**: emite una distribución sobre letras de respuesta (A, B, C...) dado un ítem con opciones, en lugar de generar texto libre.
- **Abstención calibrada**: incluye la opción "no lo sé" y fue entrenado para seleccionarla cuando la confianza del modelo base es insuficiente (probabilidad < 0,5 en la respuesta correcta).
- **Razonamiento de decisión sobre 58 tipos de tarea**: aritmética verbal, causalidad sí/no, lógica, salida de código, ajedrez, acordes musicales, políticas y tarifas, ítems de API/tool-call, NLI, sentido común, medicina, etc.
- **Comprensión lectora y NLI**: entrenado con ContractNLI, HANS, Cosmos QA, XCOPA, OpenBookQA, QASC y QuaRTz.
- **Clasificación de intenciones y dominio**: MASSIVE 1.1, CLINC150 + OOS y BANKING77.
- **Argumentación**: corpus args.me para decidir entre argumentos.
- **Seguridad**: etiquetas de daño de respuesta de Aegis 2.0.
- **Conocimiento factual acotado**: GeoNames, Wikidata, PEPs de Python, RFC de IETF, registros gubernamentales de EE. UU. (NHTSA, openFDA, Federal Register, NOAA, NASA, NSF, Grants.gov, USGS, FRA, EPA, USDA).
- **Tool calling / function calling**: solo en la medida en que los ítems de API/tool-call del entrenamiento lo cubren; no se documenta un protocolo de herramientas en inferencia.
- **Multilingüe**: no disponible; la model card no declara idiomas y las fuentes son mayoritariamente inglesas.
- **Modo thinking, visión o audio**: no disponible; el codificador de visión se conserva pero no se documenta su uso en la lectura de decisión.

## Casos de uso

- **Enrutamiento de decisiones en pipelines de evaluación**: dado un ítem con opciones y una pregunta, el modelo devuelve la letra más probable y una distribución completa, útil para construir sistemas de evaluación automática o de selección entre alternativas con umbral de confianza.
- **Abstención en atención al cliente**: con la opción "no lo sé" entrenada de forma explícita, puede integrarse en un clasificador de intenciones (BANKING77, CLINC150, MASSIVE) que derive a un humano cuando la confianza sea baja, reduciendo respuestas erróneas.
- **Verificación de NLI y contratos**: los datos de ContractNLI y HANS permiten usar el modelo para decidir si una hipótesis se sigue de una premisa, con aplicación en revisión de cláusulas o detección de contradicciones documentales.
- **Clasificación de seguridad de contenido**: las etiquetas de Aegis 2.0 permiten usarlo como filtro de daño de respuesta en un pipeline de moderación, emitiendo una decisión discreta en lugar de texto.
- **Resolución de preguntas de conocimiento acotado**: con GeoNames, Wikidata y registros gubernamentales en el entrenamiento, puede responder ítems de opción múltiple sobre entidades, geografía o normativa estadounidense, siempre con la salvaguarda de abstención.
- **Evaluación de modelos generativos**: al ser un modelo de decisión sobre ítems REAX eval-v5.1, encaja como juez o como baseline en arneses de evaluación de razonamiento (aritmética, lógica, código, sentido común) sin necesidad de parsear texto libre.
- **Selección de argumentos**: el corpus args.me permite usarlo para elegir el argumento más relevante entre varios candidatos en sistemas de debate o recomendación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de accuracy, F1 ni comparaciones numéricas con el modelo base u otros modelos.

## Requisitos de hardware

- **VRAM estimada en bf16**: aproximadamente 52 GB solo para pesos (26,1 B × 2 bytes), más activaciones y KV cache; en la práctica se necesitan GPUs de 80 GB para inferencia cómoda con contexto largo.
- **Cuantización**: al no distribuirse pesos GGUF ni cuantizados, el uso en GPUs de consumo requiere cuantizar externamente (por ejemplo, a 8 bits o 4 bits), lo que reduciría la huella a ~26 GB o ~13 GB respectivamente, a costa de posible degradación de la calibración de la abstención.
- **GPU recomendadas**: A100 80 GB, H100 80 GB o H200 para bf16 sin cuantizar; en consumer, RTX 4090 (24 GB) solo con cuantización agresiva a 4 bits y contexto reducido, y con riesgo de no caber junto con el codificador de visión.
- **Opciones de despliegue**: al ser un modelo PyTorch con safetensors y una cabeza de lectura personalizada, no es directamente compatible con vLLM, llama.cpp, Ollama o TGI sin adaptación; se requiere cargar con `transformers`/PyTorch y aplicar la lógica REAX de lectura en la última posición.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SN92 generalist (este modelo) | 26,1 B | 6.144 tokens (entrenamiento) | Modelo de decisión (lectura de letras) | MIT | Hugging Face, 39 descargas |
| baselabs/mammoth-1 | no disponible | no disponible | Modelo base post-entrenado de Qwen3.5-27B | MIT | Hugging Face (Base Labs / Baseten) |
| Qwen3.5-27B | ~27 B | no disponible | LLM generativo | Apache-2.0 | Hugging Face (Qwen) |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría (modelos de decisión o clasificadores de opción múltiple); la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- **No es un modelo generativo**: no produce texto libre; solo emite una distribución sobre letras de opción. Usarlo como chatbot o generador requiere otro componente.
- **Sesgos de los datos**: el entrenamiento combina fuentes en inglés y registros gubernamentales de EE. UU., lo que puede introducir sesgo geográfico y cultural; no se documenta evaluación de sesgo.
- **Riesgo de alucinación**: aunque la abstención está entrenada, la calibración depende del umbral 0,5 heredado de mammoth-1 y puede fallar en dominios fuera de la distribución de entrenamiento.
- **Limitación de contexto**: el máximo documentado es 6.144 tokens de prompt; ítems más largos no están soportados por el entrenamiento.
- **Idiomas**: no se declara soporte multilingüe; el uso en castellano no está validado.
- **Licencia**: MIT para el modelo, pero los datos de terceros tienen licencias propias (CC BY 4.0, CC BY 3.0, BSD-2-Clause, Apache-2.0, etc.) que deben respetarse según `THIRD_PARTY_NOTICES.md`; el autor indica que los licenciantes no endosan el modelo.
- **Filiación**: el autor declara no estar afiliado ni respaldado por Base Labs / Baseten, el equipo de Qwen ni REAX; la procedencia del fine-tune es independiente y no auditada.
- **Madurez**: 39 descargas, 0 likes y sin benchmarks publicados; no hay evidencia de validación en producción.
- **Compatibilidad**: la cabeza de lectura REAX y la atención no causal requieren código de inferencia específico; las herramientas estándar (vLLM, TGI) no lo soportan de serie.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/danyloooah/sn92-generalist-m1-v3a
- Modelo base mammoth-1: https://huggingface.co/baselabs/mammoth-1
- Qwen3.5-27B (origen del backbone): no disponible en la información proporcionada
- REAX (formato de lectura conjunta): no disponible en la información proporcionada
- GeoNames: https://www.geonames.org
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/legalcode
- Licencia CC BY 3.0: https://creativecommons.org/licenses/by/3.0/legalcode
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Licencia BSD-2-Clause: https://opensource.org/license/bsd-2-clause

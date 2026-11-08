# jstarks/gemma-4-E2B-it-iPhone-Agent-Weight-Space-Programming

## Resumen

`jstarks/gemma-4-E2B-it-iPhone-Agent-Weight-Space-Programming` es una adaptación del modelo `google/gemma-4-E2B-it` de Google, publicada por el usuario jstarks en Hugging Face. No se trata de un modelo entrenado desde cero ni de un fine-tuning convencional: el autor aplica una técnica denominada "weight-space programming" (programación en el espacio de pesos) que modifica directamente dos matrices de pesos del modelo base mediante cirugía de columnas en forma cerrada, sin retropropagación ni pasos de gradiente. El objetivo es corregir comportamientos específicos del modelo base en tareas de agente móvil: llamadas falsas a herramientas, terminación sucia de turnos y contención de herramientas.

El modelo está orientado a la ejecución de agentes en dispositivos Apple de gama alta (iPhone 15 Pro con A17 Pro y 8 GB de RAM, iPhone 16 Pro con A18 Pro), donde el modelo base en bfloat16 (10,25 GB) excede el límite de memoria de iOS. La adaptación se distribuye como un parche disperso de 72 MB que modifica únicamente dos matrices MLP (capas 26 y 34), lo que permite aplicar la mejora sobre los pesos ya descargados en segundos. El resultado es un modelo que, según el autor, mantiene el rendimiento académico del base (90,6% en un conjunto de 85 tareas) mientras mejora la contención de herramientas del 83,3% al 100% en su suite específica.

La relevancia de esta ficha radica en que documenta un enfoque poco habitual (edición directa de pesos en lugar de entrenamiento) aplicado a un modelo de Google con licencia Gemma, y en que ofrece un perfil de despliegue cuantificado para hardware móvil. No obstante, conviene señalar que el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y que la model card está truncada en la información proporcionada, por lo que varios datos técnicos no están disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4), adaptación mediante edición de pesos en capas MLP 26 y 34 |
| Parametros totales | no disponible (modelo base `google/gemma-4-E2B-it`; el parche modifica 2 matrices) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la model card menciona "context 4k" en el perfil de despliegue y un campo `context_window` truncado) |
| Tipos de cuantizacion | Q4_K_M y Q8_0 documentados en el perfil de despliegue; bfloat16 en el modelo base |
| Idiomas soportados | en (inglés) |
| Licencia | gemma |
| Formato de pesos | safetensors (parche `gemma4_e2b_iphone_agent_patch.safetensors`, 72,00 MB) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E2B-it`, un transformer de la familia Gemma 4. La adaptación no emplea entrenamiento: según el autor, no hubo retropropagación, pasos de gradiente ni SGD. En su lugar se aplica "nullspace-anchored ridge-projected column surgery" sobre subespacios MLP disjuntos en la capa 26 (orientada a la dirección cognitiva intermedia) y la capa 34 (orientada a la emisión y los límites de turno). Las modificaciones se calculan en forma cerrada y se empaquetan como un parche disperso que solo altera `model.layers.26.mlp.down_proj.weight` y `model.layers.34.mlp.down_proj.weight`.

La innovación técnica declarada consiste en tres proyecciones: una proyección negativa de contención en la capa 34 para eliminar llamadas falsas a herramientas en cálculos autocontenidos; una dirección de emisión `u_eos - 1.5 * u_tool_response` anclada al vector de estado posterior a la llamada para forzar una terminación limpia con `<tool_call|><eos>`; y una preservación explícita de los tokens intermedios de la herramienta. No se dispone de información sobre el volumen de tokens de entrenamiento del modelo base ni sobre la composición de su dataset, ya que la model card proporcionada no los detalla.

## Capacidades

- Generación de texto en inglés con pipeline `text-generation`.
- Ejecución de agentes con tool calling: comandos de shell (`exec`), búsqueda web y obtención de URLs.
- Contención de herramientas: evita llamadas falsas a herramientas en problemas autocontenidos de matemáticas y código.
- Terminación limpia de turnos: emite `<tool_call|><eos>` sin alucinar `<|tool_response>` al final.
- Razonamiento matemático de varios pasos (Suite C del benchmark del autor).
- Generación de código: HumanEval pass@1 del 93,3% según el autor.
- Traducción de lenguaje natural a Bash: InterCode-NL2Bash del 95,0% según el autor.
- Anti-sicofancia y pushback: Suite D con 87,5% según el autor.
- Integración declarada con Hermes Agent y OpenClaw mediante configuración YAML.
- Capacidades multimodales (audio, visión) atribuidas a la familia Gemma 4 E2B/E4B en fuentes externas, no confirmadas en la model card de esta adaptación.

## Casos de uso

- Agente de shell en dispositivo móvil: el modelo traduce instrucciones en lenguaje natural a comandos Bash (`exec`) y termina el turno limpiamente, lo que permite integrarlo en asistentes locales de iOS que ejecutan scripts en un entorno sandbox.
- Búsqueda web y obtención de URLs desde el teléfono: con una tasa del 100% en la Suite B del autor, es adecuado para asistentes que consultan información en red y devuelven resultados sin llamadas espurias.
- Automatización de tareas de cálculo sin herramientas: gracias a la proyección de contención de la capa 34, responde directamente a operaciones autocontenidas (por ejemplo, factoriales) en lugar de invocar `exec`, lo que reduce latencia y consumo.
- Asistente de código en el dispositivo: con HumanEval pass@1 del 93,3% y un parche de 72 MB, puede desplegarse en iPhone 15 Pro o 16 Pro para autocompletado y generación de fragmentos sin conexión.
- Agente conversacional multi-turno con pushback: la Suite D (87,5%) indica capacidad de mantener postura ante peticiones incorrectas, útil en asistentes de soporte técnico que deben corregir al usuario.
- Despliegue edge con cuantización Q4_K_M: con 1,85 GB de pesos y ~2,35 GB de huella de RAM a contexto 4k, cabe en un iPhone 15 Pro con ~3,2 GB libres, lo que habilita asistentes totalmente locales sin backend en la nube.
- Integración en pipelines de agentes con Hermes Agent u OpenClaw: la configuración YAML incluida permite conectar el modelo como backend de agente en flujos de automatización.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Tareas | Base `gemma-4-E2B-it` | WSP iPhone Agent | Delta |
|---|---|---|---|---|
| BFCL v3 Irrelevance | 15 | 14/15 (93,3%) | 15/15 (100,0%) | +6,7% |
| InterCode-NL2Bash | 20 | 20/20 (100,0%) | 19/20 (95,0%) | -5,0% |
| OpenAI GSM8K (Test) | 20 | 14/20 (70,0%) | 14/20 (70,0%) | +0,0% |
| TruthfulQA Generation | 15 | 15/15 (100,0%) | 15/15 (100,0%) | +0,0% |
| OpenAI HumanEval (pass@1) | 15 | 14/15 (93,3%) | 14/15 (93,3%) | +0,0% |
| Conjunto establecido total | 85 | 77/85 (90,6%) | 77/85 (90,6%) | +0,0% |

| Suite móvil | Categoría | Base | WSP iPhone Agent | Tokens medios |
|---|---|---|---|---|
| Suite A | Shell scripting (`exec`) | 8/8 (100,0%) | 8/8 (100,0%) | 33,4 |
| Suite B | Búsqueda web y fetch | 8/8 (100,0%) | 8/8 (100,0%) | 26,8 |
| Suite C | Matemáticas multi-paso | 2/8 (25,0%) | 2/8 (25,0%) | 495,8 |
| Suite D | Anti-sicofancia y pushback | 8/8 (100,0%) | 7/8 (87,5%) | 229,1 |
| Suite E | Contención de herramientas y código directo | 5/6 (83,3%) | 6/6 (100,0%) | 217,5 |
| Total suite de agente | 38 tareas | 31/38 (81,6%) | 31/38 (81,6%) | 172,5 |

Perfil de despliegue en iPhone 15 Pro según el autor:

| Métrica | Base (bfloat16) | Parcheado (Q4_K_M) | Parcheado (Q8_0) |
|---|---|---|---|
| Tamaño de pesos | 10,25 GB | 1,85 GB | 2,65 GB |
| Huella de RAM (contexto 4k) | Excede el límite de iOS | ~2,35 GB | ~3,15 GB |
| Margen libre en iOS | Fallo por OOM | ~3,2 GB libres | ~2,4 GB libres |
| Ingesta de prompt | N/A | ~68 tok/s | ~52 tok/s |
| Generación de tokens | N/A | ~28 tok/s | ~21 tok/s |
| Riesgo de throttling térmico | Alto | Muy bajo | Bajo |

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: ~2,35 GB con Q4_K_M a contexto 4k; ~3,15 GB con Q8_0 a contexto 4k; el modelo base en bfloat16 requiere 10,25 GB y no cabe en iOS.
- GPU recomendadas: Apple A17 Pro (iPhone 15 Pro) y A18 Pro (iPhone 16 Pro), ambos con 8 GB de RAM. Fuentes externas citan también el A19 del iPhone 17 con más de 35 tok/s para Gemma 4 E2B mediante Google AI Edge Gallery.
- Cabe en GPU de consumo: sí, en los SoC Apple mencionados; no se dispone de datos para GPU de escritorio NVIDIA.
- Opciones de despliegue: parche aplicable con `apply_patch.py` sobre pesos locales; integración declarada con Hermes Agent y OpenClaw; el formato safetensors es compatible con transformers. No se documentan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: ~28 tok/s de generación y ~68 tok/s de ingesta con Q4_K_M; ~21 tok/s y ~52 tok/s con Q8_0 en iPhone 15 Pro, según el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (WSP iPhone Agent) | no disponible (base E2B) | no disponible | BFCL Irrelevance 100%, HumanEval 93,3%, GSM8K 70% | gemma | Hugging Face, 0 descargas |
| `google/gemma-4-E2B-it` | no disponible | no disponible | BFCL Irrelevance 93,3%, HumanEval 93,3%, GSM8K 70% | gemma | Hugging Face (modelo base) |
| Gemma 4 E4B | no disponible | no disponible | no disponible | gemma | Hugging Face; según fuentes externas, consume casi todo el presupuesto de memoria en iPhone 17 |

No se dispone de datos suficientes para comparar con alternativas de otros fabricantes en la misma categoría de agente móvil.

## Limitaciones y advertencias

- El repositorio registra 0 descargas y 0 likes en el momento de la consulta; no hay validación independiente de los resultados declarados.
- Los benchmarks del autor se basan en conjuntos muy pequeños (15 a 20 tareas por benchmark, 38 tareas en la suite de agente), lo que limita la significación estadística de las diferencias reportadas.
- La Suite C (matemáticas multi-paso) se mantiene en 2/8 (25,0%) tanto en el base como en el parcheado: el razonamiento matemático complejo sigue siendo un punto débil.
- La Suite D (anti-sicofancia) empeora del 100% al 87,5% tras el parche, y InterCode-NL2Bash baja del 100% al 95,0%.
- El modelo solo declara soporte de inglés (`en`); no se documentan capacidades multilingües.
- La licencia Gemma impone términos de uso específicos de Google; debe revisarse el acuerdo en `ai.google.dev/gemma/terms` antes de cualquier uso comercial.
- La técnica de edición de pesos en forma cerrada no está descrita con detalle reproducible en la información disponible (la model card está truncada), lo que dificulta auditar o replicar el parche.
- El perfil de despliegue está limitado a hardware Apple con 8 GB de RAM; no se documentan requisitos para otras plataformas.
- Riesgo de alucinación no cuantificado más allá de TruthfulQA (15/15), un conjunto demasiado pequeño para extraer conclusiones generales.
- El modelo base en bfloat16 provoca fallo por falta de memoria (OOM) en iOS, por lo que el uso en dispositivo exige cuantización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jstarks/gemma-4-E2B-it-iPhone-Agent-Weight-Space-Programming
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Términos de licencia Gemma: https://ai.google.dev/gemma/terms
- Run Gemma 4 on iPhone 17 with Google AI Edge Gallery: https://modelfit.io/iphone/iphone-17/
- Gemma 4 E2B & E4B: Run Google's AI on iPhone, iPad & Mac Mini: https://llmcheck.net/blog/gemma-4-e2b-e4b-iphone-ipad-mac/

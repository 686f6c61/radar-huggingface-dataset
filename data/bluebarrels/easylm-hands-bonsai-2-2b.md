# Bluebarrels/easylm-hands-bonsai-2-2b

## Resumen

`easylm-hands-bonsai-2-2b` es un adaptador PEFT LoRA publicado por Bluebarrels sobre el modelo ternario `prism-ml/Ternary-Bonsai-2-2B-gguf` (familia Bonsai 2 de PrismML, ~2B parámetros y ~500 MB de huella). No es un modelo completo: el repositorio contiene únicamente los pesos del adaptador (~3,5 MB, 56 tensores, 278.518 elementos no nulos en FP16). Su objetivo es especializar el modelo base en la emisión determinista de llamadas a herramientas mediante la etiqueta `<tool_call>`, incluyendo el enlace de parámetros y la discriminación entre «responder en chat» y «ejecutar herramienta».

El adaptador está diseñado para el ecosistema EasyLM y su interfaz Hydra (CLI, TUI y escritorio), y cubre las 12 herramientas integradas del runtime: `calc`, `units`, `exchange`, `weather`, `datetime`, `fact`, `dictionary`, `web_search`, `web_fetch`, `stacks`, `zcabs` y `studio`. La model card declara una ventana de contexto de 262.144 tokens, aunque esa cifra corresponde al modelo base y el adaptador no la amplía.

Su relevancia es acotada y muy específica: permite ejecutar un agente de herramientas con un consumo de memoria mínimo (apto para WebGPU en navegador, móviles y portátiles) y con un formato de invocación fijo y verificable. A cambio, el corpus de entrenamiento documentado es muy pequeño (133 turnos) y no hay ninguna evaluación publicada, por lo que debe tratarse como un artefacto experimental y no como un componente validado para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base ternaria Bonsai 2 2B); adaptador PEFT LoRA sobre las proyecciones de atención y de MLP |
| Parametros totales | ~2B en el modelo base; el adaptador contiene 278.518 elementos no nulos (56 tensores, 564.336 bytes) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 262.144 tokens (según model card; heredada del modelo base) |
| Tipos de cuantizacion | Base publicado en GGUF ternario (1,58 bits, ~500 MB); adaptador en FP16 safetensors; la model card lista además una variante MLC `q4f16_1` para WebGPU |
| Idiomas soportados | no disponible |
| Licencia | AGPL-3.0 (licencia del modelo base: no disponible) |
| Formato de pesos | safetensors (adaptador PEFT LoRA); el modelo base se distribuye en GGUF |

Configuración LoRA declarada: r = 16, alpha = 32, dropout = 0,05, módulos objetivo `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`.

## Arquitectura y entrenamiento

El adaptador se aplica sobre las siete proyecciones habituales de un transformer decoder-only, por lo que modifica atención y capas MLP sin alterar la arquitectura del base. El base pertenece a la familia Bonsai 2 de PrismML, que según la documentación del proveedor comprime modelos Qwen mediante un esquema ternario de 1,58 bits (pesos restringidos a +1, 0 y −1), con huellas que van de 0,43 GB (2B) a 5,9 GB (27B). Para el caso concreto del 2B no se detalla en la información disponible ni el modelo Qwen de origen ni el número de tokens de entrenamiento del base.

El entrenamiento del adaptador se documenta sobre `Bluebarrels/easylm-training-corpus`, concretamente el fichero `adapter_hands_chatml.jsonl` con 133 turnos en formato ChatML orientados a invocación de herramientas. La model card describe la procedencia del corpus con componentes como 92 «Sovereign Academic Stacks», 369 tablas de hechos con 4.634 filas cuantitativas, 151 «Council of Kami Books», el grafo Alice 1.0 EMap (46.025 nodos y 19.842 aristas), una capa socrática de antithesis y el currículo completo de Hydra v1.2.2. No se documenta ninguna fase de RLHF, DPO o ajuste por preferencias, ni métricas de evaluación del adaptador resultante.

La innovación técnica real del conjunto es la eficiencia de memoria (base ternario + adaptador de pocos megabytes cargable desde el navegador mediante un parser de safetensors en TypeScript) y la restricción del espacio de salida a un formato de tool call determinista. La model card también atribuye al runtime EasyLM características como AtMem (memoria local atómica sobre IndexedDB), ZCABS (sistema de nonces canario anticorrupción) y protección anti-bucle, si bien no se aporta especificación técnica ni código verificable de las mismas.

## Capacidades

- Generación de texto conversacional en el modelo base, con el adaptador orientado a la fase de decisión y ejecución de herramientas.
- Invocación estructurada de herramientas mediante `<tool_call>`, con enlace de parámetros a las 12 herramientas integradas de EasyLM.
- Discriminación entre consulta conversacional y consulta que requiere herramienta (tool-vs-chat), que es el objetivo central del ajuste.
- Cálculo determinista (`calc`), conversión de unidades (`units`) y tipos de cambio (`exchange`).
- Consulta de fecha y hora (`datetime`) y de meteorología (`weather`).
- Recuperación de hechos (`fact`), definiciones (`dictionary`), búsqueda web (`web_search`) y recuperación de páginas (`web_fetch`).
- Herramientas de verificación y estructuración del ecosistema: `stacks`, `zcabs` y `studio`.
- Integración con el agente Hydra: modos `chat`, `agent`, `swarm`, `computer` y `terminal`, y niveles de permisos `manual`, `accept_edits`, `plan` y `bypass` según la documentación del autor.
- Ejecución en navegador vía WebGPU/MLC y en cliente de escritorio, sin backend.
- Capacidades multimodales o de visión: no disponible para esta variante de 2B (la model card las atribuye al modelo de 27B de la familia).
- Soporte de audio: no disponible.

## Casos de uso

- **Enrutado tool-vs-chat en asistentes locales**: el adaptador decide si una consulta se responde directamente o se delega a una herramienta. Es el caso para el que fue entrenado y el que menor riesgo de generalización presenta, siempre que las herramientas sean las 12 del runtime EasyLM.
- **Calculadora y conversor de unidades offline**: con un base de ~500 MB y un adaptador de ~3,5 MB, se puede desplegar en un portátil o un móvil para resolver operaciones aritméticas y conversiones (`calc`, `units`, `exchange`) sin conexión ni coste de API.
- **Asistente de escritorio con fecha, hora y meteorología**: el modelo emite llamadas a `datetime` y `weather` con parámetros explícitos, lo que permite construir un panel de información personal en Hydra TUI o Desktop con validación de esquema antes de ejecutar la herramienta.
- **Agente de investigación con búsqueda y fetch web**: combinando `web_search` y `web_fetch` con la ventana de 262.144 tokens del base, se pueden encadenar varias recuperaciones y sintetizar el resultado, útil para tareas de documentación técnica con trazabilidad de las fuentes consultadas.
- **Capa de definiciones y hechos verificados**: `dictionary` y `fact` permiten montar un asistente educativo o de soporte interno que consulte tablas de referencia en lugar de generar la respuesta de memoria, reduciendo el riesgo de alucinación en datos numéricos.
- **Demostraciones en navegador sin infraestructura**: gracias al cargador de safetensors sobre WebGPU descrito en la model card, se puede servir el adaptador desde Hugging Face y ejecutarlo en el cliente, lo que sirve para demos, prototipos y entornos con restricciones de privacidad donde los datos no deben salir del dispositivo.
- **Verificación epistémica en pipelines de agentes**: las herramientas `zcabs`, `stacks` y `studio` del ecosistema permiten insertar pasos de comprobación entre la decisión del modelo y la acción final, un patrón útil en flujos de automatización con requisitos de auditoría.
- **Base para ajustes LoRA propios**: al ser un adaptador PEFT estándar sobre un base ternario, sirve como punto de partida para quien quiera extender el conjunto de herramientas o adaptar el formato de invocación a otro esquema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del adaptador `easylm-hands-bonsai-2-2b` en la información disponible. Tampoco se documentan métricas de precisión de tool call, exactitud de parámetros ni tasa de discriminación tool-vs-chat sobre un conjunto de evaluación independiente.

| Modelo | Dato disponible | Valor |
|---|---|---|
| `easylm-hands-bonsai-2-2b` | MMLU, HumanEval, GSM8K, tasa de acierto en tool call | no disponible |
| `Bonsai 2 27B` (hermano de familia, no comparable directamente) | Retención de rendimiento frente a Qwen3.8 27B según PrismML | 98,2 % |
| `Bonsai 2 27B` (hermano de familia) | Huella de memoria | 5,9 GB |

La única cifra pública de la familia (98,2 % de retención del 27B) corresponde al modelo de 27B y no debe extrapolarse a esta variante de 2B ni al adaptador.

## Requisitos de hardware

- **Peso en disco**: ~3,5 MB el adaptador y ~500 MB el modelo base ternario en GGUF. El repositorio del adaptador ocupa 0,0 GB según Hugging Face.
- **VRAM para inferencia**: alrededor de 0,5 GB para los pesos del base; el adaptador añade una cantidad despreciable. La memoria real la domina la caché KV, que crece linealmente con la longitud de contexto. No se dispone del número de capas ni de la configuración de atención como para dar una cifra exacta de caché KV a 262.144 tokens.
- **GPU recomendadas**: cualquier GPU integrada o discreta con WebGPU funcional; el caso de uso declarado es navegador en móviles, tablets, Chromebooks y portátiles. Para el despliegue en servidor no se indican GPU concretas (A100, H100, RTX 4090): no disponible.
- **Consumer GPU**: sí, con margen amplio. Cabe en iGPU y en cualquier GPU de escritorio con más de 1-2 GB de memoria libre, siempre que se limite el contexto a longitudes manejables.
- **Opciones de despliegue**: runtime WebGPU de EasyLM con el cargador de safetensors incluido en la model card; ruta MLC (`mlc-ai/Qwen3.5-2B-q4f16_1-MLC`) para WebGPU; Hydra CLI, TUI y escritorio (`hydra`, `hydra agent`, `hydra swarm`, `hydra serve` en el puerto 7777).
- **Compatibilidad con vLLM, TGI, llama.cpp u Ollama**: no confirmada. El adaptador es un PEFT LoRA en safetensors que requiere un base en formato PyTorch/Transformers, mientras que el base publicado es GGUF; para usarlo con PEFT estándar haría falta una conversión o el runtime específico de EasyLM. Con llama.cpp/Ollama sería necesaria una conversión explícita del adaptador, no documentada.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Bluebarrels/easylm-hands-bonsai-2-2b` | ~2B (base) + LoRA de 278.518 elementos | 262.144 tokens (declarado) | Tool calling determinista para EasyLM/Hydra | AGPL-3.0 | Hugging Face, 0 descargas, 0 likes |
| `prism-ml/Ternary-Bonsai-2-2B-gguf` (base) | ~2B | no disponible | Modelo generalista ternario 1,58 bits | no disponible | Hugging Face |
| `Bluebarrels/easylm-bonsai-2-2b` (hermano, sin adaptador Hands) | ~2B | no disponible | Base conversacional del ladder EasyLM (500 MB) | no disponible | Hugging Face |
| `Bluebarrels/easylm-bonsai-2-9b` (hermano superior) | ~9B | no disponible | Agente por defecto de Hydra, orquestación MCP | no disponible | Hugging Face |
| `Bluebarrels/easylm-bonsai-2-27b` (hermano superior) | ~27B | 262.144 tokens | Flagship con torre de visión y síntesis ternaria | no disponible | Hugging Face |

Frente a un modelo generalista del mismo tamaño, la diferencia no es de capacidad bruta sino de especialización: este adaptador restringe la salida a un formato de invocación concreto y a un catálogo cerrado de 12 herramientas. Frente a los modelos de 9B y 27B de la misma familia, pierde capacidad de razonamiento y, en el caso del 27B, capacidades multimodales, a cambio de una huella 4 y 12 veces menor respectivamente. No se dispone de comparaciones cuantitativas con modelos de tool calling de otros proveedores.

## Limitaciones y advertencias

- **Corpus de entrenamiento mínimo**: 133 turnos en un único fichero ChatML. Es un volumen muy reducido, con riesgo alto de sobreajuste al formato exacto de las 12 herramientas y de degradación ante variaciones de estilo, idioma o esquema.
- **Catálogo cerrado de herramientas**: el adaptador está especializado en `calc`, `units`, `exchange`, `weather`, `datetime`, `fact`, `dictionary`, `web_search`, `web_fetch`, `stacks`, `zcabs` y `studio`. No hay garantía de generalización a otras herramientas o a esquemas de function calling distintos.
- **Ausencia total de evaluación**: no se publican benchmarks, métricas de exactitud de parámetros ni pruebas de robustez. No hay validación por parte de la comunidad (0 descargas, 0 likes, repositorio de 0,0 GB).
- **Riesgo de alucinación**: en un adaptador de tool calling el fallo típico no es inventar hechos, sino emitir llamadas con nombres o parámetros inválidos, o invocar una herramienta cuando la respuesta era conversacional. Se recomienda validación de esquema y lista blanca de herramientas antes de ejecutar nada.
- **Sesgos**: no documentados. No hay información sobre la composición demográfica, lingüística o temática real del corpus más allá de la descripción del autor, ni sobre procesos de mitigación.
- **Idiomas**: no declarados. El corpus es en inglés y el adaptador no incluye información sobre soporte multilingüe; el rendimiento en castellano es indeterminado.
- **Ventana de contexto**: los 262.144 tokens son una propiedad del modelo base y no del adaptador. La memoria necesaria para explotarla excede con creces la de un dispositivo móvil, por lo que en la práctica habrá que truncar el contexto o aplicar modos de compactación (`recall`, `compact`, `sliding`) del runtime Hydra.
- **Licencia AGPL-3.0**: licencia copyleft fuerte con cláusula de red; si se ofrece el modelo como servicio accesible por red, hay que liberar el código fuente correspondiente. Conviene revisar además la licencia del modelo base ternario, que no se indica en la información disponible, y las de las dependencias del runtime.
- **Afirmaciones no verificables en la model card**: componentes como «ZCABS», «AtMem», el grafo Alice 1.0 o los «92 Sovereign Academic Stacks» se describen sin especificación técnica, código ni referencias externas. Deben tratarse como material promocional hasta su verificación independiente.
- **Inconsistencias en la documentación**: el ejemplo de CLI de la propia ficha invoca `hydra bonsai 2 9b` dentro del repositorio del adaptador de 2B, y la tabla mezcla bases GGUF y MLC (`Qwen3.5-2B-q4f16_1-MLC`). Conviene confirmar la ruta de despliegue real antes de integrar.
- **Fecha y madurez**: el repositorio se creó y actualizó el 17 de octubre de 2026, con una sola revisión. No hay historial de versiones, issues ni casos de uso reportados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bluebarrels/easylm-hands-bonsai-2-2b
- Modelo base ternario (GGUF): https://huggingface.co/prism-ml/Ternary-Bonsai-2-2B-gguf
- Base MLC para WebGPU citada en la model card: https://huggingface.co/mlc-ai/Qwen3.5-2B-q4f16_1-MLC
- Dataset de entrenamiento: https://huggingface.co/datasets/Bluebarrels/easylm-training-corpus
- Perfil del autor: https://huggingface.co/Bluebarrels
- Hermano de familia 27B: https://huggingface.co/Bluebarrels/easylm-bonsai-2-27b
- Anuncio de Bonsai 2 27B en PrismML: https://prismml.com/news/bonsai-2-27b
- Sitio de PrismML: https://prismml.com/
- Ficha de Bonsai 2 27B en LLM Releases: https://www.llm-releases.com/models/bonsai-2-27b

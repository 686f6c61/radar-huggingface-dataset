# ItsnotAilabs/GHOST-2.7B

## Resumen

GHOST-2.7B (Generative Heuristic Orchestrator for Sovereign Thought) es un ajuste fino de parámetros completos sobre `microsoft/phi-2`, un transformer denso de 2.700 millones de parámetros. Lo publica ItsnotAilabs en HuggingFace, aunque la model card atribuye el desarrollo a MedinaMemorySystems, una discrepancia de autoría que conviene tener en cuenta antes de citarlo. El modelo está especializado en generación narrativa, simulación de entornos adversarios y construcción autónoma de narrativa, con una ventana de contexto de 2.048 tokens y licencia Apache 2.0.

A diferencia de un ajuste LoRA, el autor indica que se reentrenaron todos los pesos para desplazar la distribución predictiva del modelo base hacia prosa creativa. Los datos de entrenamiento declarados son Sovereign Corpus (lore esotérico y fundamentos de marco), WritingPrompts (estructuras narrativas) y Adversarial Simulation Transcripts (diálogos de shadow-personas y escenarios límite). El resultado es un modelo de un solo idioma (inglés) orientado a texto creativo, no a conocimiento factual.

Su relevancia práctica es acotada pero concreta: ocupa menos de 6 GB de VRAM en FP16, lo que permite ejecutarlo en GPU de consumo, y sirve como componente creativo dentro de arquitecturas agénticas en las que se combina con un modelo "cortex" lógico. No es un modelo de propósito general ni compite en benchmarks de razonamiento con alternativas de su tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Phi-2), atencion paralela, Rotary Position Embeddings |
| Parametros totales | 2.700 millones (2,7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | FP16 (16-bit), INT8 (8-bit), GGUF Q4_K_M (segun model card) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch / safetensors para transformers; la model card menciona GGUF Q4_K_M, pero los tags del repositorio no confirman su publicacion |
| Capas | 32 |
| Cabezas de atencion | 32 |
| Dimension oculta | 2.560 |
| Modelo base | microsoft/phi-2 |
| Tamano de vocabulario | No disponible |
| Fecha de publicacion | 21 de septiembre de 2026 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura es la de Phi-2 sin modificaciones estructurales: 32 capas, 32 cabezas de atención con formulación de atención paralela, dimensión oculta de 2.560 y embeddings posicionales rotatorios (RoPE). El modelo es denso, no emplea mezcla de expertos ni atención lineal, y mantiene la ventana de contexto original de 2.048 tokens del modelo base. El autor no documenta cambios en el tokenizador ni en la configuración de atención.

El entrenamiento declarado es un ajuste fino de parámetros completos. La model card enumera tres conjuntos de datos: Sovereign Corpus, WritingPrompts y Adversarial Simulation Transcripts, orientados respectivamente a lore y fundamentos de marco, estructuras narrativas creativas y renderizado de escenarios límite con shadow-personas. No se especifica el número de tokens de entrenamiento, la composición porcentual del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias. Tampoco se detalla la configuración de entrenamiento (LR, épocas, precisión, hardware). La única guía de inferencia publicada es usar temperatura 0,85 y `repetition_penalty` de 1,1 para obtener los resultados que el autor denomina "phi-spiral".

## Capacidades

- Generacion de texto narrativo en ingles: prosa creativa, ficcion larga fragmentada y construccion de escenas, con especial enfasis en ambientes adversarios y monologos internos.
- Simulacion de subcortex adversarial: emulacion de subsistemas o shadow-personas dentro de marcos agénticos, segun la terminologia de la propia model card.
- Construccion autonoma de narrativa: el autor lo describe como modelo de "cognitive storytelling" capaz de encadenar bucles narrativos coherentes dentro de la ventana de contexto.
- Generacion offline determinista: pensado como fallback de rutas narrativas cuando no hay conexion de red.
- Adaptacion a formato de prompt simple: la model card indica el patron `Instruct:` / `Output:` sin plantilla de chat compleja.
- Control de estilo por temperatura: sensible al ajuste de temperatura, con 0,85 como valor recomendado por el autor.
- No se documenta soporte de tool calling, function calling, uso de agentes multi-paso, vision, audio ni modo de razonamiento explicito (thinking mode).
- Capacidades multilingues: solo ingles declarado.

## Casos de uso

- Narrativa interactiva y ficcion ramificada: el modelo genera ramas narrativas coherentes a partir de un escenario inicial usando el patron `Instruct:` / `Output:`; su contexto de 2.048 tokens es suficiente para escenas individuales, aunque una historia completa requiere troceado.
- Simulacion de adversarios en marcos agénticos: integrado como componente "subcortex" frente a un modelo logico ("cortex"), genera dialogos de oposicion y escenarios de conflicto para probar la robustez de un agente conversacional.
- Videojuegos con generacion offline: al caber en menos de 2 GB en GGUF Q4_K_M, puede desplegarse en el propio dispositivo para producir rutas narrativas sin conexion, con latencia declarada de 10-15 ms por token.
- Worldbuilding y material de escritura: util para producir prompts de escritura, descripciones de ambientacion y tratamientos de personajes a partir de una premisa breve, apoyandose en el corpus WritingPrompts declarado.
- Red teaming conversacional: la model card menciona "Adversarial Simulation Transcripts" como parte del entrenamiento, lo que lo hace adecuado para generar turnos hostiles o manipuladores con los que evaluar filtros de seguridad de otros sistemas.
- Prototipado en hardware de consumo: con unos 5,5 GB en FP16, permite experimentar con generacion narrativa en una GPU de 8 GB sin infraestructura en la nube.
- Expresion de monologo interno en agentes: generar trazas de "voz interna" o deliberacion creativa que se registran junto a la decision final de un agente, separando la parte logica de la estilistica.
- Asistencia a guion y expansion de tratamientos: a partir de un outline corto, expandir beats narrativos en pasajes de prosa, aplicando troceado y resumen externo por el limite de 2.048 tokens.

## Benchmarks y rendimiento

La model card incluye una tabla de resultados declarada por el autor. El `model-index` del repositorio, en cambio, no contiene ningun resultado (`results: []`), por lo que estos numeros no estan respaldados por una evaluacion verificable ni se documenta la metodologia, el numero de shots ni la version exacta del checkpoint.

| Benchmark | Resultado declarado | Nota del autor |
|---|---|---|
| HellaSwag | 73,1 | Inferencia de sentido comun |
| WinoGrande | 72,4 | Resolucion de pronombres y logica |
| PIQA | 79,6 | Intuicion fisica |
| NarrativeQA | 42,3 | Comprension lectora de relatos |
| DarkLayer-Sim (propio) | 68,9% | Renderizado adversarial de subcortex (metrica interna, sin definicion publica) |

No se han publicado en la informacion disponible resultados de otros benchmarks habituales (MMLU, GSM8K, HumanEval, MT-Bench) ni comparaciones directas con el modelo base bajo el mismo protocolo.

## Requisitos de hardware

- VRAM estimada (segun la tabla de la model card): FP16 ~5,5 GB; INT8 ~3,0 GB; GGUF Q4_K_M ~1,9 GB. A estas cifras hay que sumar la cache KV, modesta por la ventana de 2.048 tokens, y el overhead del runtime.
- El propio repositorio anuncia compatibilidad con hardware de 6 GB de VRAM.
- GPU de consumo compatibles: RTX 3060 12 GB, RTX 4060 8 GB, RTX 3070/4070, RTX 4090 y equivalentes. En tarjetas de 6-8 GB conviene usar INT8 o Q4_K_M.
- GPU de datacenter: A100, H100 o L40S si se necesita servir en lote con concurrencia alta; el modelo es pequeno y el cuello de botella sera la gestion de peticiones, no la memoria.
- Latencia declarada por token: 20-30 ms en FP16, 15-22 ms en INT8 y 10-15 ms en GGUF Q4_K_M. La seccion de metricas de produccion de la model card aparece truncada, por lo que el throughput agregado no esta disponible.
- Opciones de despliegue: `transformers` con `device_map="auto"` (unico metodo documentado en la model card, con `torch_dtype=torch.float16`); llama.cpp u Ollama si finalmente se publican pesos GGUF; vLLM y TGI dan soporte generico a la arquitectura Phi-2, aunque no hay confirmacion especifica para este checkpoint.
- Hardware de CPU: viable en cuantizacion Q4_K_M por el tamano reducido, con latencias muy superiores a las indicadas para GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Rendimiento declarado | Disponibilidad |
|---|---|---|---|---|---|---|
| GHOST-2.7B | 2,7B denso | 2.048 | Apache 2.0 | Ingles | HellaSwag 73,1; WinoGrande 72,4; PIQA 79,6 (declarados por el autor, sin metodologia) | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| microsoft/phi-2 (modelo base) | 2,7B denso | 2.048 | MIT | Ingles | Resultados publicados por Microsoft en la model card original, no reproducidos aqui | Ampliamente distribuido y verificado |

No se dispone en la informacion proporcionada de datos verificables de otros modelos comparables de la misma categoria (por ejemplo, ajustes creativos de 3B). Cualquier comparacion con alternativas requeriria evaluar ambos modelos bajo el mismo protocolo, algo que el autor no ha publicado.

## Limitaciones y advertencias

- Ventana de contexto de solo 2.048 tokens: la propia model card advierte que generar narrativa larga exige troceado o protocolos externos de resumen de memoria.
- Deriva adversarial: con temperatura alta en modo de simulacion de subcortex, el autor reconoce que la salida puede volverse excesivamente oscura o esoterica, y recomienda un modelo "cortex" que mantenga los limites de seguridad.
- Alucinacion en consultas factuales: el modelo esta ajustado para ficcion, no como base de conocimiento autoritativo. No debe usarse para responder preguntas factuales sin verificacion externa.
- Idioma unico: solo ingles declarado; no hay evidencia de calidad en castellano ni en otros idiomas.
- Sin datos de sesgo: no se publica ninguna evaluacion de sesgos, toxicidad ni comportamiento en dominios sensibles.
- Riesgo de contenido danino: por su orientacion a escenarios adversarios y shadow-personas, puede producir texto manipulado, hostil o perturbador. No se documenta ninguna fase de alineacion de seguridad posterior al ajuste fino.
- Estado de validacion muy bajo: 0 descargas y 0 likes, `model-index` vacio y benchmarks sin metodologia. No hay evidencia independiente de que los resultados declarados se reproduzcan.
- Discrepancia de autoria: el repositorio figura bajo ItsnotAilabs, mientras que la model card y la cita BibTeX atribuyen el modelo a MedinaMemorySystems y usan el identificador `MedinaMemorySystems/GHOST-2.7B`. Conviene verificar cual es el repositorio canonico antes de integrarlo.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Phi-2 (licencia MIT) se debe conservar la atribucion correspondiente y revisar los terminos del modelo base.
- Falta de informacion de entrenamiento: sin numero de tokens, composicion del dataset ni detalles de ajuste, es dificil estimar el grado de sobreajuste a los estilos de los corpus declarados.
- Model card incompleta: la seccion de metricas de produccion aparece truncada, y no se especifican versiones de transformers, requisitos de tokenizer ni archivos concretos del repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ItsnotAilabs/GHOST-2.7B
- Repositorio referenciado en la model card y en la cita BibTeX: https://huggingface.co/MedinaMemorySystems/GHOST-2.7B
- Modelo base: https://huggingface.co/microsoft/phi-2
- La busqueda web realizada no devolvio papers, blogs, repositorios ni demos adicionales relevantes sobre este modelo; los resultados obtenidos eran paginas genericas de motor de busqueda.

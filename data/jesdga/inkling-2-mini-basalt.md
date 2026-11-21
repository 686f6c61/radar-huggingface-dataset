# jesdga/Inkling-2-Mini-Basalt

## Resumen

Inkling-2-Mini-Basalt es un empaquetado cuantizado y reempaquetado del modelo thinkingmachines/Inkling-2-Mini, publicado por Thinking Machines Lab, preparado por el usuario jesdga para su uso con Basalt, un motor de inferencia local orientado a GPU NVIDIA Blackwell (sm_120) con API compatible con OpenAI y Anthropic. El modelo es de arquitectura MoE (mezcla de expertos) con capacidades de vision y un mecanismo de decodificacion especulativa propio denominado DSpark. El repositorio contiene un unico fichero autocontenido de 19,7 GB que incluye pesos, encoder de vision, tokenizer, plantilla de chat y el drafter.

La relevancia de este empaquetado reside en que permite ejecutar un modelo MoE de gran tamano en una sola tarjeta Blackwell, con un contexto declarado de hasta 1.048.576 tokens y una gestion de expertos que los mueve a RAM del sistema cuando el contexto solicitado no cabe junto a todos los expertos en la VRAM. Ademas, el formato preserva la cuantizacion original de los expertos enrutados de Thinking Machines (NVFP4 en las capas 0-19 y MXFP8 convertido a Q8_0 en las capas 20-23), lo que reduce la perdida de calidad respecto a una recuantizacion completa.

No se dispone de informacion sobre el numero de parametros totales, parametros activos, numero de tokens de entrenamiento ni composicion del dataset del modelo base en la informacion proporcionada. La model card del empaquetado se centra en el formato del fichero, el rendimiento medido en una RTX 5090 y la fidelidad respecto a la release oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con vision y decodificacion especulativa DSpark |
| Parametros totales | no disponible |
| Parametros activos | no disponible (top 8 expertos por capa segun la model card) |
| Longitud de contexto | hasta 1.048.576 tokens (`--max-context`) |
| Tipos de cuantizacion | NVFP4 (expertos enrutados capas 0-19), MXFP8 como Q8_0 (expertos capas 20-23), Q8_0 (proyecciones de atencion, gate, convolucion corta y salida), BF16 (cabeza de salida, embeddings, encoder de vision, projector, drafter), F32 (norms, router, biases, tensores pequenos del bucle) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (modelo original de Thinking Machines Lab; el motor Basalt es MIT) |
| Formato de pesos | `.basalt` (fichero unico autocontenido de 19,7 GB) |

## Arquitectura y entrenamiento

El modelo base es thinkingmachines/Inkling-2-Mini, de Thinking Machines Lab, descrito en la model card como un MoE con 128 expertos por capa y top 8 enrutados por token en las capas 0-19. La arquitectura incluye proyecciones de atencion, gate, convolucion corta y salida, ademas de un encoder de vision y un projector. El empaquetado incorpora tambien un drafter DSpark para decodificacion especulativa, que propone hasta siete tokens por pasada y los verifica, de modo que la salida final es la del modelo principal.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras etapas de alineacion. La model card del empaquetado indica que los expertos enrutados de las capas 0-19 conservan la cuantizacion NVFP4 original de Thinking Machines sin redondear de nuevo, y que el resto de tensores se redondea una sola vez a Q8_0, BF16 o F32 segun el caso. La cabeza de salida se almacena en BF16 y el motor la redondea a Q8_0 al cargar. El fichero incluye el tokenizer y la plantilla de chat de la release oficial, y requiere Basalt 0.5.5 o posterior.

## Capacidades

- Generacion de texto y razonamiento: la plantilla de chat incluye niveles de esfuerzo de razonamiento (reasoning effort) que se gestionan a traves del servidor.
- Vision: procesamiento de imagenes con `--vision dynamic`, codificadas dentro del motor; cada imagen se lee a su tamano propio con un token por celda de 40 x 40 pixeles.
- Tool calling / function calling: las llamadas a herramientas funcionan a traves del servidor segun la model card.
- Decodificacion especulativa: DSpark activo por defecto, con hasta siete tokens por pasada y verificacion posterior; se puede desactivar con `--spec 1`.
- Contexto largo: soporte declarado de hasta 1.048.576 tokens, con gestion de expertos en RAM cuando el contexto no cabe en VRAM.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking: si, mediante los niveles de esfuerzo de razonamiento de la plantilla de chat.

## Casos de uso

- Asistente conversacional de contexto largo: el modelo puede mantener conversaciones multi-turno con ventanas de hasta 1.048.576 tokens, lo que permite adjuntar documentacion extensa o historiales completos sin truncar. La gestion de expertos en RAM permite sostener contextos de 131K y 400K tokens en una sola tarjeta Blackwell.
- Analisis de documentos e imagenes: con `--vision dynamic`, el modelo procesa imagenes a su resolucion nativa (un token por celda de 40 x 40 pixeles) junto a texto, adecuado para extraccion de informacion de capturas, diagramas o documentos escaneados.
- Agentes con tool calling: la plantilla de chat y el servidor compatible con OpenAI y Anthropic permiten integrar el modelo en flujos de agentes que invocan funciones externas, con niveles de esfuerzo de razonamiento configurables.
- Generacion de codigo asistida: el soporte de tool calling y la API compatible con OpenAI permiten integrarlo en pipelines de CI/CD o en asistentes de codigo que necesitan contexto de repositorio amplio.
- Procesamiento por lotes de alta velocidad: con 613 tok/s en modo estructurado y 338 tok/s en conversacion en una RTX 5090, el modelo es adecuado para tareas de generacion estructurada (JSON, formularios, extraccion) a gran volumen.
- Recuperacion aumentada con needles en contexto largo: la model card indica que se encuentran needles a 131K y 400K tokens, lo que lo hace apto para RAG con documentos muy extensos o auditoria de contratos y expedientes.
- Despliegue local con privacidad: al ejecutarse en una sola tarjeta Blackwell con el motor Basalt, permite mantener datos sensibles en infraestructura propia sin depender de APIs externas.

## Benchmarks y rendimiento

La model card del empaquetado no publica resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.). Los datos disponibles son de velocidad y de fidelidad respecto a la release oficial.

Velocidad en una RTX 5090 a 400 W, todos los expertos en la tarjeta, `basalt-bench` (semilla fija, dos ejecuciones), tokens/s:

| Conversacion | Estructurado | Prosa | Prefill, prompt de 16K |
|---:|---:|---:|---:|
| 338 | 613 | 287 | 12.240 |

Lectura de prompts con DSpark activado: aproximadamente 14.100 tok/s a 2K, 12.200 tok/s a 32K y 8.900 tok/s a 128K. Con `--max-context 1048576 --kv fp8` (expertos derramados a RAM segun necesidad): 264 tok/s en chat corto, 173 tok/s a 131K y 108 tok/s a 400K en decodificacion plana; un prompt de 400K se lee en unos 97 s.

Calidad medida con `basalt-bench --quality` frente a la release oficial con expertos desquantizados a BF16 (referencia no equivalente a un BF16 real, segun el autor), Wikitext-2, fragmentos de 512 tokens:

| Fragmentos | PPL | PPL referencia | KLD media | Mismo top-1 |
|---:|---:|---:|---:|---:|
| 100 | 7,0695 | 7,0633 | 0,00305 | 97,76% |
| 20 | 7,6642 | 7,6534 | 0,00264 | 97,80% |

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero pesa 19,7 GB; con todos los expertos en la tarjeta y KV en fp8, el consumo debe caber en la VRAM de una GPU Blackwell de gama alta (la model card cita una RTX 5090 a 400 W como referencia de medida).
- GPU recomendadas: NVIDIA Blackwell (sm_120), como RTX 5090. El motor Basalt esta orientado a esta arquitectura.
- Cabe en GPU consumer: si, en una RTX 5090 (Blackwell), segun las medidas del autor.
- Opciones de despliegue: motor Basalt 0.5.5 o posterior, con API compatible con OpenAI y Anthropic. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: 338 tok/s en conversacion, 613 tok/s en estructurado y 287 tok/s en prosa con todos los expertos en la tarjeta; 264 tok/s en chat corto y 108 tok/s a 400K con expertos derramados a RAM.

## Comparativa con modelos similares

No se dispone de datos de parametros, contexto ni rendimiento de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. El modelo base thinkingmachines/Inkling-2-Mini seria la referencia natural, pero no se han facilitado sus especificaciones completas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling-2-Mini-Basalt (este) | no disponible | 1.048.576 | Apache-2.0 | Hugging Face (jesdga) |
| thinkingmachines/Inkling-2-Mini | no disponible | no disponible | Apache-2.0 | Hugging Face (Thinking Machines Lab) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El fichero es una forma modificada (cuantizada y reempaquetada) de los pesos originales y no es una release oficial de Thinking Machines Lab, tal como advierte el autor.
- La referencia de calidad BF16 usada en la model card no es un modelo BF16 real (la release no incluye pesos BF16), por lo que su KLD no es comparable con la de otros modelos.
- No se dispone de informacion sobre sesgos, idiomas soportados ni riesgos de alucinacion especificos del modelo base.
- La licencia Apache-2.0 del modelo permite uso comercial, pero el motor Basalt es MIT y el empaquetado no esta respaldado oficialmente por Thinking Machines Lab.
- Requiere hardware NVIDIA Blackwell (sm_120) y Basalt 0.5.5 o posterior; no es desplegable en otras arquitecturas de GPU ni en motores de inferencia convencionales segun la informacion disponible.
- El rendimiento con contextos muy largos depende de derramar expertos a RAM del sistema, lo que reduce el throughput (108 tok/s a 400K frente a 338 tok/s en conversacion corta).
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopcion muy limitada y poca validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jesdga/Inkling-2-Mini-Basalt
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Web del proyecto Basalt: https://basalt.jgulfo.com
- Repositorio Basalt: https://github.com/jesdga95/basalt
- Documentacion de Inkling 2 Mini en Basalt: https://github.com/jesdga95/basalt/blob/main/docs/models/inkling2.md
- Documentacion de modelos y router: https://github.com/jesdga95/basalt/blob/main/docs/configuration/models.md
- Strata (fork base de Basalt): https://github.com/Niko1221/Strata

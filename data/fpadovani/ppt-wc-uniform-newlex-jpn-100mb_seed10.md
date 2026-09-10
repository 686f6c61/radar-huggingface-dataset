# fpadovani/ppt-wc-uniform-newlex-jpn-100mb_seed10

## Resumen

El modelo `fpadovani/ppt-wc-uniform-newlex-jpn-100mb_seed10` es un ajuste fino de tipo SFT (supervised fine-tuning) sobre el modelo base `goldfish-models/eng_latn_100mb`, desarrollado por el usuario fpadovani y vinculado a un proyecto de investigacion de la Universidad de Groningen (el enlace de Weights & Biases apunta a la organizacion `f-padovani-university-of-groningen`, proyecto `white_cotterell`). Se trata de un transformer decoder-only de tipo GPT-2 (etiqueta `gpt2` en HuggingFace) con 86.508.288 parametros totales, entrenado con la libreria TRL 0.23.0 sobre Transformers 4.56.2. El repositorio ocupa 1,4 GB e incluye pesos en formato safetensors.

El problema que aborda es acotado y de caracter experimental: el modelo base pertenece a la familia Goldfish, una coleccion de modelos monolingues pequenos entrenados sobre aproximadamente 100 MB de texto por idioma, pensados para investigacion en linguistica computacional y en modelos de bajo coste. Este ajuste concreto anade una fase de SFT, presumiblemente para alinear o especializar el modelo en un formato de conversacion, ya que el ejemplo de la model card usa mensajes con roles (`{"role": "user", "content": ...}`).

Su relevancia actual es limitada y hay que enmarcarla con honestidad: el modelo no tiene descargas ni likes en el momento de la consulta, no publica licencia efectiva (la model card contiene el marcador de posicion `licence: license`), no documenta idiomas soportados ni longitud de contexto, y no incluye resultados de evaluacion. Es, por tanto, un artefacto de investigacion reproducible (semilla 10, nombre de experimento con prefijo `ppt-wc-uniform-newlex`) mas que un modelo listo para produccion. El identificador incluye `jpn` (japones), pero el modelo base es `eng_latn` (ingles), una discrepancia que conviene tener presente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de tipo GPT-2 (etiqueta `gpt2` en HuggingFace; no se detalla la configuracion exacta en la informacion disponible) |
| Parametros totales | 86.508.288 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (no se documenta en la model card ni en las especificaciones) |
| Tipos de cuantizacion | no disponibles (el repositorio solo publica pesos en safetensors; no se publican versiones GGUF, GPTQ, AWQ ni bitsandbytes) |
| Idiomas soportados | no disponibles (el identificador incluye `jpn`, pero el modelo base es `eng_latn`, de ingles) |
| Licencia | no disponible (la model card contiene el marcador `licence: license`, sin texto legal efectivo) |
| Formato de pesos | safetensors |
| Libreria de inferencia | transformers (tambien etiquetado como `text-generation-inference` y `endpoints_compatible`) |
| Modelo base | goldfish-models/eng_latn_100mb |
| Metodo de entrenamiento | SFT con TRL 0.23.0 |
| Tamano del repositorio | 1,4 GB |
| Fecha de creacion / actualizacion | 2026-09-10 / 2026-09-10 |

## Arquitectura y entrenamiento

La arquitectura corresponde a la etiqueta `gpt2` del Hub, es decir, un transformer decoder-only autorregresivo con atencion causal, normalizacion previa a la atencion y embeddings posicionales aprendidos. Al ser un ajuste fino del modelo base `goldfish-models/eng_latn_100mb`, hereda su tokenizador y su configuracion de capas, aunque el numero exacto de capas, dimensiones ocultas y cabezas de atencion no se detalla en la informacion proporcionada. Con 86,5 millones de parametros, el modelo se situa en el rango de GPT-2 small (124 M), algo por debajo en numero de parametros.

El entrenamiento se realizo mediante SFT (supervised fine-tuning) con la libreria TRL en su version 0.23.0, sobre Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. La model card indica que existe una ejecucion registrada en Weights & Biases, pero no especifica el numero de tokens de entrenamiento, la composicion del dataset de SFT, la existencia de fases de RLHF o DPO, ni hiperparametros como tasa de aprendizaje, regimen de precision o duracion del entrenamiento. Tampoco se documenta ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, mezcla de expertos o arquitecturas hibridas). El nombre del experimento (`ppt-wc-uniform-newlex-jpn-100mb_seed10`) sugiere una rejilla de experimentos con semilla fija y una condicion de mezcla de datos, pero esa interpretacion no esta confirmada por el autor.

## Capacidades

- Generacion de texto autorregresiva en formato de conversacion: el ejemplo oficial usa `pipeline("text-generation")` con una lista de mensajes con roles, lo que indica que el ajuste SFT adapta el modelo a entradas conversacionales.
- Respuesta a preguntas abiertas de tipo generativo (el ejemplo de la model card plantea una pregunta hipotetica y solicita `max_new_tokens=128`).
- Capacidad multilingue: no disponible. El modelo base es ingles (`eng_latn`); el sufijo `jpn` del identificador no se corresponde con el modelo base declarado y no hay documentacion que aclare el idioma objetivo.
- Tool calling / function calling: no disponible, no se menciona en la informacion proporcionada.
- Uso como agente o razonamiento multi-paso: no disponible, no se menciona.
- Capacidades de vision, audio o modo de razonamiento explicito (thinking mode): no disponibles.
- Razonamiento matematico o generacion de codigo especializada: no disponibles; no hay evaluaciones ni declaraciones al respecto.

## Casos de uso

- Investigacion academica en modelos de lenguaje de bajo coste: el modelo sirve como punto de comparacion reproducible dentro de una rejilla de experimentos (semilla 10, condicion `ppt-wc-uniform-newlex`), util para estudiar el efecto del SFT sobre un modelo monolingue pequeno entrenado con 100 MB de texto.
- Experimentos de destilacion y ablacion: al compartir arquitectura y tokenizador con `goldfish-models/eng_latn_100mb`, permite aislar el impacto de la fase SFT comparando ambas versiones en la misma tarea.
- Prototipado rapido en entornos sin GPU: con 86,5 millones de parametros, la inferencia en CPU es viable para pruebas de concepto, siempre que se acepte una latencia alta y no medida.
- Generacion de texto de relleno o sintetico en ingles: util para aumentar datos de entrenamiento en pipelines internos donde no se requiere alta calidad factual.
- Pruebas de integracion de infraestructura: dado que el modelo es pequeno y esta en safetensors, sirve para validar despliegues con Text Generation Inference o transformers antes de migrar a modelos mayores.
- Docencia y demostraciones de fine-tuning: el flujo completo (modelo base Goldfish, TRL, registro en W&B) es un ejemplo didactico de un pipeline SFT de principio a fin.
- Analisis de plantillas de chat: permite estudiar como un modelo pequeno responde a entradas con roles sin una fase de alineacion extensa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, perplexity ni ninguna otra metrica, y tampoco se han encontrado evaluaciones externas en la busqueda web realizada.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 86.508.288 parametros, sin contar el KV cache ni el overhead del runtime):
  - FP32: aproximadamente 350 MB
  - FP16 / BF16: aproximadamente 175 MB
  - INT8: aproximadamente 90 MB
  - INT4: aproximadamente 45 MB
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente en la practica; una NVIDIA RTX 3060, RTX 4090, T4, A10, A100 o H100 funcionaria con margen amplio. El modelo esta muy por debajo de las necesidades de memoria de las GPU de datacenter.
- Cabe en GPU de consumo: si. Practicamente cualquier GPU de consumo de los ultimos diez anos puede alojarlo, e incluso es viable la inferencia en CPU.
- Opciones de despliegue: `transformers` con `pipeline` (metodo documentado por el autor), Text Generation Inference (el modelo esta etiquetado como `text-generation-inference` y `endpoints_compatible`). Para `llama.cpp` u `Ollama` seria necesario convertir los pesos a GGUF, algo que no se ha publicado. vLLM es compatible en teoria con arquitecturas GPT-2, pero no hay confirmacion de soporte para esta revision concreta.
- Latencia y throughput: no disponibles. No se han publicado mediciones y el repositorio no incluye informacion de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `fpadovani/ppt-wc-uniform-newlex-jpn-100mb_seed10` | 86,5 M | no disponible | no disponible | 0 descargas, 0 likes | Ajuste SFT sobre Goldfish; sin evaluaciones |
| `goldfish-models/eng_latn_100mb` | no disponible | no disponible | no disponible | Modelo base de la familia Goldfish | Entrenado con ~100 MB de texto en ingles |
| GPT-2 small | 124 M | 1024 tokens (configuracion estandar de GPT-2; no verificada en esta busqueda) | MIT (dato no verificado en la informacion disponible) | Ampliamente desplegado | Referencia habitual para modelos de este tamano |
| DistilGPT-2 | 82 M | 1024 tokens (configuracion estandar; no verificada) | MIT (dato no verificado en la informacion disponible) | Ampliamente desplegado | Destilado de GPT-2, misma escala de parametros |

No se dispone de datos de rendimiento comparativo para ninguno de estos modelos en la informacion proporcionada, por lo que la comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni mediciones de perplexity, ni evaluaciones humanas publicadas. No se puede afirmar nada sobre la calidad de sus salidas.
- Licencia no efectiva: la model card contiene `licence: license`, un marcador de posicion sin texto legal. No hay autorizacion explicita de uso comercial; ante cualquier uso en produccion habria que contactar con el autor.
- Idiomas indeterminados: el identificador incluye `jpn` pero el modelo base es `eng_latn`. No hay documentacion que aclare si el ajuste SFT introduce datos en japones, ingles o ambos. No se debe asumir competencia multilingue.
- Longitud de contexto no documentada: se desconoce la ventana efectiva, lo que impide planificar tareas que dependan de contexto largo.
- Riesgo de alucinacion elevado: con 86,5 millones de parametros y un corpus base de solo 100 MB, la cobertura factual es muy reducida y la probabilidad de generar afirmaciones incorrectas con fluidez es alta.
- Sesgos del corpus: al derivar de un modelo entrenado sobre un volumen de texto pequeno, hereda los sesgos de esa fuente, que no se documenta.
- Trazabilidad limitada del dataset de SFT: no se describe la composicion de los datos de ajuste, por lo que no se puede descartar contaminacion ni evaluar su cobertura.
- Sin garantias de estabilidad conversacional: aunque el ejemplo usa formato de roles, no se documenta una plantilla de chat formal ni una fase de alineacion con preferencias humanas.
- Repositorio sin mantenimiento observable: creado y actualizado el mismo dia, sin descargas ni interacciones.
- Uso recomendado restringido a investigacion y experimentacion controlada, no a produccion con usuarios finales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/ppt-wc-uniform-newlex-jpn-100mb_seed10
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/8pbs6rkl
- Repositorio de TRL: https://github.com/huggingface/trl
- Paper de TRL (citado en la model card): von Werra et al., "TRL: Transformer Reinforcement Learning", 2020
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces recuperados corresponden a YouTube y YouTube Music y no guardan relacion con el contenido de esta ficha.

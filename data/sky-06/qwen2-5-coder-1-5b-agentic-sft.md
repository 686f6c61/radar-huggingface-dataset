# Sky-06/qwen2.5-coder-1.5b-agentic-sft

## Resumen

Qwen2.5-Coder-1.5B agentic + code SFT es un ajuste fino supervisado (SFT) del modelo Qwen/Qwen2.5-Coder-1.5B-Instruct, publicado por el usuario Sky-06 en HuggingFace. El objetivo declarado es dotar a un modelo pequeno de 1.543.714.304 parametros (1,54B) de capacidad de generacion de codigo combinada con comportamiento agentico: llamada a herramientas mediante esquemas `<tools>` en el mensaje de sistema y respuestas con bloques `. El modelo conserva la arquitectura transformer densa del Qwen2.5-Coder original; no es un MoE ni un modelo hibrido.

El entrenamiento consistio en un fine-tune completo de una sola epoca sobre una mezcla curada de 102.260 filas de HuggingFaceTB/smoltalk, siguiendo la receta para modelos pequenos de SmolLM2 (arXiv:2502.02737). Se usaron 55,2 millones de tokens en 852 pasos sobre una unica A100 de 80 GB, con TRL 1.15.0, Transformers 5.19.0 y PyTorch 2.14.1. La perdida final de entrenamiento fue 0,762 y la precision por token 0,791.

Su relevancia es doble: por un lado, sirve como ejemplo reproducible de pipeline agentico a escala 1,5B con presupuesto de computo minimo (62,5 minutos de A100); por otro, cubre un nicho poco poblado, el de modelos diminutos con tool calling nativo en un formato canonico concreto. La contrapartida es que el autor no ha ejecutado ninguna evaluacion en conjunto de validacion independiente y el modelo no tiene descargas ni validacion de la comunidad en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (familia Qwen2.5-Coder) |
| Parametros totales | 1.543.714.304 (1,54B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos sin cuantizar (no hay GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible; los datasets de entrenamiento citados son mayoritariamente en ingles |
| Licencia | no disponible en los metadatos del repositorio; el modelo base Qwen2.5-Coder-1.5B-Instruct es Apache-2.0 segun la model card |
| Formato de pesos | safetensors (tamano del repositorio: 15,4 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-Coder-1.5B-Instruct (arXiv:2409.12186), un transformer decoder-only denso con atencion causal estandar. El autor no introduce modificaciones estructurales: se trata de un fine-tune completo (no LoRA, no adaptadores) de todos los pesos, en una unica epoca. El tokenizador y la plantilla de chat son los de Qwen, e incluyen el formato de herramientas en el prompt de sistema.

El corpus de entrenamiento son 102.260 filas en formato `messages` extraidas de smoltalk: 25.000 de `apigen-80k` (trazas de tool calling con esquemas `<tools>`, bloques `` y conversaciones multi-turno), 30.000 de `self-oss-instruct` (seguimiento de instrucciones de codigo Python con aserciones de test), 25.000 de `smol-magpie-ultra` (calidad de chat multi-turno general), 10.000 de `metamathqa-50k` (razonamiento matematico) y 12.260 de `smol-summarize`, `smol-rewrite` y `everyday-conversations` (amplitud de seguimiento de instrucciones). Los hiperparametros son: learning rate 2e-5 con scheduler coseno y 48 pasos de warmup, batch global 64 (8 x 8 de acumulacion), bf16, AdamW fusionado, enpaquetado de secuencias (`bfd`, bloques de 1024 tokens) con flash-attn2 varlen y entropia cruzada fusionada de Liger, con la perdida calculada sobre la secuencia completa al estilo SmolLM2. No se aplico RLHF ni DPO: es exclusivamente SFT sobre datos sinteticos generados por profesores (Llama-3.1-70B y self-instruct), por lo que hereda los sesgos y el estilo de esos datos.

## Capacidades

- Generacion de codigo: el bloque `self-oss-instruct` (30.000 filas) entrena seguimiento de instrucciones de programacion en Python con aserciones de test, lo que favorece la produccion de codigo verificable.
- Tool calling / function calling: formato canonico de `apigen-80k`, con esquemas de herramientas declarados en el prompt de sistema dentro de `<tools>...</tools>` y respuestas emitidas en bloques ``.
- Razonamiento matematico basico: 10.000 filas de `metamathqa-50k` aportan resolucion de problemas aritmeticos y algebraicos elementales, sin cadena de pensamiento explicita declarada.
- Conversacion multi-turno: 25.000 filas de `smol-magpie-ultra` y 12.260 de tareas de resumen, reescritura y conversacion cotidiana.
- Resumen y reescritura de texto: cubiertos por `smol-summarize` y `smol-rewrite`.
- Capacidades multilingues: no documentadas; el autor no declara idiomas soportados.
- Capacidades multimodales (vision, audio): no disponibles; el modelo es exclusivamente de texto.
- Modo de pensamiento explicito: no disponible; no se menciona ningun modo de razonamiento extendido.
- Ejecucion de agentes de varios pasos: soportada de forma limitada, segun el propio autor, que advierte de que las cadenas largas de herramientas suelen desviarse.

## Casos de uso

- Asistente de codigo integrado en el IDE: el modelo completa funciones y genera pruebas unitarias a partir de instrucciones en lenguaje natural, aprovechando las 30.000 filas de codigo Python con aserciones del entrenamiento. Su tamano permite ejecutarlo en local junto al editor sin depender de la nube.
- Prototipado rapido de agentes con tool calling: al responder en el formato canonico de `apigen-80k`, se puede conectar a una capa de ejecucion que parsee los bloques `` y ejecute busquedas, calculos o consultas a API internas. Es util para validar disenos de agentes antes de migrar a un modelo mayor.
- Generacion de scripts de automatizacion y utilidades de linea de comandos: tareas cortas y bien especificadas, donde un modelo de 1,5B rinde mejor que en razonamiento abierto.
- Ensenanza y demostraciones de tecnicas de SFT: el repositorio documenta integramente el pipeline (datos, hiperparametros, hardware, tiempos), lo que lo convierte en material didactico reproducible para cursos de ajuste fino.
- Clasificacion y transformacion de texto en lote: resumen, reescritura y normalizacion de documentos en pipelines offline donde el coste por token importa mas que la calidad punta. El modelo cubre estas tareas gracias a las 12.260 filas de tareas de instruccion variada.
- Preprocesado de codigo en CI/CD: generacion de mensajes de commit, descripciones de pull request o esqueletos de test para funciones modificadas, ejecutables en un runner con GPU modesta o incluso en CPU con cuantizacion.
- Filtrado y anotacion de datos para entrenar modelos mayores: uso del modelo como etiquetador barato de instrucciones de codigo o trazas de herramienta antes de la revision humana.
- Copiloto embebido en herramientas internas con presupuesto de VRAM reducido: escenarios donde no cabe un modelo de 7B o mas y se acepta una fiabilidad menor a cambio de latencia y coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se ejecuto ninguna evaluacion sobre conjuntos de validacion independientes; las unicas cifras publicadas son metricas de entrenamiento.

| Metrica (entrenamiento) | Valor |
|---|---|
| Perdida final (ventana final) | 0,762 |
| Perdida inicial | 1,58 |
| Precision por token | 0,791 |
| Norma del gradiente | ~0,77 |
| Pasos totales | 852 (1 epoca) |
| Tokens procesados | 55,2 millones |
| Tiempo de entrenamiento | 62,5 minutos (4,25 s/paso, 1x A100-80GB) |

## Requisitos de hardware

- VRAM estimada para inferencia (valores orientativos, calculados a partir de los 1,54B de parametros; no publicados por el autor): en bf16/fp16 en torno a 4-6 GB contando pesos, cache KV y overhead del runtime; en cuantizacion de 8 bits en torno a 2-3 GB; en 4 bits en torno a 1,5-2 GB.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM para bf16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, L4, T4); A100 o H100 solo si se busca throughput muy alto con lotes grandes.
- Compatibilidad con GPU de consumo: si. En bf16 cabe en tarjetas de 6-8 GB, y en 4 bits puede caber en GPUs de 4 GB o incluso ejecutarse en CPU con llama.cpp u Ollama.
- Opciones de despliegue: transformers (uso mostrado en la model card con `AutoModelForCausalLM` y `device_map="auto"`), vLLM y TGI para servicio con concurrencia, llama.cpp y Ollama para inferencia local en CPU o GPU modesta. Nota: el repositorio no incluye pesos GGUF, por lo que habria que convertir los safetensors antes de usar llama.cpp u Ollama. El entrenamiento dependio del kernel preconstruido `kernels-community/flash-attn2`, requisito que solo afecta al reentrenamiento, no a la inferencia.
- Latencia y throughput: no disponibles. No se han publicado mediciones de velocidad de generacion ni de tokens por segundo.

## Comparativa con modelos similares

Los datos de contexto y licencia de los modelos comparados proceden de la documentacion publica de cada uno, no de la informacion facilitada para esta ficha. No hay datos de rendimiento comparables porque este modelo no tiene evaluacion publicada.

| Modelo | Parametros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sky-06/qwen2.5-coder-1.5b-agentic-sft | 1,54B | no disponible | si, formato canonico de `apigen-80k` | no disponible en metadatos (base Apache-2.0) | HuggingFace, 0 descargas |
| Qwen/Qwen2.5-Coder-1.5B-Instruct (base) | 1,54B | 32.768 tokens segun documentacion de Qwen | parcial, formato Qwen | Apache-2.0 | HuggingFace, ampliamente adoptado |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens segun documentacion de SmolLM2 | no orientado a herramientas | Apache-2.0 | HuggingFace, muy adoptado |
| Qwen/Qwen2.5-Coder-7B-Instruct | ~7,6B | 32.768 tokens segun documentacion de Qwen | si, formato Qwen | Apache-2.0 | HuggingFace, muy adoptado |

## Limitaciones y advertencias

- Fiabilidad agentica limitada: el propio autor advierte de que, con 1,5B de parametros, la ejecucion de cadenas largas de herramientas suele desviarse. No es adecuado para agentes autonomos de produccion sin supervision.
- Sin evaluacion independiente: no existe ningun benchmark de validacion. Las cifras de perdida y precision corresponden al propio conjunto de entrenamiento y no permiten afirmar capacidad de generalizacion.
- Datos de entrenamiento sinteticos: el corpus proviene de profesores como Llama-3.1-70B y de tecnicas self-instruct, por lo que hereda sus sesgos, su estilo y sus errores factuales. Riesgo de alucinacion alto, especialmente en afirmaciones factuales fuera del codigo.
- Formato de herramientas unico: solo se entreno el formato canonico de `apigen-80k`. No se mezclaron formatos como Hermes o ToolACE, de modo que los prompts con otras convenciones de tool calling pueden degradar el comportamiento.
- Idiomas: no se declara cobertura multilingue y el corpus de entrenamiento es mayoritariamente en ingles; el rendimiento en castellano no esta verificado y previsiblemente sera inferior.
- Licencia sin declarar: los metadatos del repositorio no especifican licencia. Aunque el modelo base es Apache-2.0, la ausencia de licencia explicita en el derivado es un riesgo juridico para uso comercial. Conviene contactar con el autor antes de desplegarlo en produccion.
- Contexto no documentado: se desconoce la ventana de contexto efectiva tras el ajuste. El entrenamiento uso bloques de 1024 tokens, por lo que el rendimiento en contextos muy largos no esta garantizado aunque el base soporte ventanas mayores.
- Baja validacion de la comunidad: cero descargas y cero likes en el momento de la consulta, sin issues ni informes externos de uso.
- Tamano del repositorio: 15,4 GB para un modelo de 1,54B de parametros, muy por encima de los ~3 GB esperables en bf16, lo que sugiere que el repositorio incluye copias adicionales o pesos en mayor precision. Conviene revisar el contenido antes de descargarlo.
- Fechas de publicacion inusuales (creado y actualizado en octubre de 2026 segun los metadatos), lo que puede indicar un error de la plataforma o del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sky-06/qwen2.5-coder-1.5b-agentic-sft
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Panel de metricas de entrenamiento (Trackio): https://Sky-06-qwen-coder-agentic-sft-trackio.hf.space?project=huggingface&runs=Sky-06-1791747543&sidebar=collapsed
- Paper de la receta SmolLM2: https://arxiv.org/abs/2502.02737
- Paper tecnico de Qwen2.5-Coder: https://arxiv.org/abs/2409.12186
- Repositorio de TRL: https://github.com/huggingface/trl
- Badge de ML Intern: https://hf.co/chat?mode=ml-intern

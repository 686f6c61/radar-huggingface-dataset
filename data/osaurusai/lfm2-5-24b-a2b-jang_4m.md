# OsaurusAI/LFM2.5-24B-A2B-JANG_4M

## Resumen

OsaurusAI/LFM2.5-24B-A2B-JANG_4M es una cuantizacion en formato MLX del modelo LiquidAI/LFM2.5-24B-A2B, un transformer de mezcla de expertos (MoE) con 24.000 millones de parametros totales y aproximadamente 2.000 millones activos por token, desarrollado originalmente por Liquid AI. El bundle lo publica OsaurusAI (cuantizacion a cargo de Jinho Jang) y esta pensado para ejecutar agentes de razonamiento en local sobre Apple Silicon, reduciendo los 44,7 GiB de pesos en bf16 a 14,8 GiB sin salir del ecosistema MLX.

El modelo base es un MoE hibrido de 40 capas que combina 30 capas de convolucion corta con 10 capas de atencion completa, 64 expertos enrutados con 4 activos por token y dos capas densas. Soporta una ventana de contexto de 131.072 tokens, es multimodal solo en texto y esta disenado para agentes con uso de herramientas en el formato Pythonic de Liquid AI. El razonamiento esta siempre activo: la plantilla de chat abre `<think>` en cada respuesta y no existe interruptor para desactivarlo ni niveles de esfuerzo.

La relevancia actual de esta ficha esta en que permite desplegar un modelo de razonamiento de 24B con tool calling en un portatil Apple Silicon, con una perdida de fidelidad medida frente al modelo bf16 muy contenida (KL mediana de 4,6e-04 y 96,77% de coincidencia top-1). Es, por tanto, una opcion practica para escenarios de privacidad estricta donde no se quiere enviar datos a la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida lfm2_moe: 40 capas (30 de convolucion corta y 10 de atencion completa), 64 expertos enrutados con 4 activos, dos capas densas |
| Parametros totales | 23.971.587.712 (aproximadamente 24B) |
| Parametros activos | Aproximadamente 2B por token |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | Mixta con GPTQ: expertos enrutados gate/up en affine 4-bit (grupo 64), expertos enrutados down en affine 6-bit, MLP densa (capas 0-1), atencion q/k/v/out y proyecciones de convolucion corta en affine 8-bit, embeddings (lm_head atado) en 8-bit, routers/bias/conv depthwise/norms en valores originales |
| Idiomas soportados | en, de, fr, es, ja, ko, zh, ar |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en MLX (bundle JANG; no se distribuye GGUF) |

## Arquitectura y entrenamiento

El modelo base sigue una arquitectura MoE hibrida propia de la familia LFM2: 40 capas en las que 30 son de convolucion corta (short-convolution) y 10 son de atencion completa, con 64 expertos enrutados de los que se activan 4 por token, mas dos capas densas. Este diseno busca reducir el coste de atencion a contexto largo manteniendo capacidad de recuperacion global en las capas de atencion completa. El enrutador usa puntuaciones sigmoideas y el bias de experto se emplea unicamente para seleccionar el top-4; los pesos de experto son las puntuaciones sin bias. El bundle documenta explicitamente que un enrutador con softmax produce salidas incorrectas en este modelo.

El bundle cuantizado se ha construido con GPTQ por matriz: cada matriz cuantizada con Hessiano de entrada se redondeo con GPTQ, y los Hessianos provienen de las salidas del propio modelo bf16, no de un corpus externo. El modelo bf16 genero textos de matematicas, finanzas y codigo en once idiomas, sesiones de agente de terminal y de codificacion con resultados reales de herramientas, llamadas multi-paso a herramientas, redes, ciberseguridad, ciencia, tareas de oficina, documentos largos y chat multilingue con sus ajustes nativos de muestreo, y esas secuencias se usaron como calibracion. Los Hessianos por experto usan solo los tokens enrutados a ese experto. La cuantizacion affine usa la rejilla propia de MLX con escalas y bias en bf16.

Sobre el entrenamiento del modelo base (numero de tokens, composicion del dataset, si hubo RLHF, DPO u otras fases de alineamiento) no hay datos en la informacion disponible. Tampoco hay modelo draft asociado al 24B, por lo que este bundle no incorpora decodificacion especulativa.

## Capacidades

- Generacion de texto y razonamiento con modo thinking siempre activo: la plantilla de chat abre `<think>` en cada respuesta, sin posibilidad de desactivarlo ni de regular el esfuerzo.
- Tool calling en formato Pythonic de Liquid: las definiciones de herramientas van en el system prompt y las llamadas se devuelven como `<|tool_call_start|>[name(arg='value')]<|tool_call_end|>`, es decir, una lista de literales Python que se parsea como datos.
- Soporte de agentes multi-paso: el modelo esta calibrado y evaluado en sesiones de agente con herramientas reales, incluyendo cadenas de llamadas consecutivas y turnos posteriores al resultado de una herramienta.
- Capacidades de codigo amplias: hay familias de evaluacion especificas para C++, Go, JavaScript, Python, Rust, shell, Swift, TypeScript y codigo PyTorch.
- Multilingue en ocho idiomas: ingles, aleman, frances, espanol, japones, coreano, chino y arabe.
- Salida estructurada y tareas de oficina: la ficha reporta familias de evaluacion para structured output, office tasks y documentos largos.
- Dominios especializados cubiertos en la evaluacion: matematicas, finanzas, ciberseguridad, redes y ciencia.
- Sin capacidades de vision ni audio: el modelo es exclusivamente de texto.

## Casos de uso

- Agentes de codificacion en local: el modelo soporta tool calling en formato Pythonic y tiene familias de evaluacion especificas para agentes de codificacion nativos y para turnos posteriores a una herramienta, lo que permite mantener bucles de edicion-verificacion sobre un repositorio sin enviar codigo a la nube.
- Asistente de terminal: con la familia "terminal agent (shell)" evaluada y soporte de resultados de herramienta, se puede integrar como capa de decision para proponer y ejecutar comandos de shell en un flujo supervisado.
- Analisis de documentos largos: los 131.072 tokens de contexto permiten cargar contratos, informes tecnicos o expedientes completos y hacer preguntas sobre ellos; la familia "long documents" esta evaluada con KL mediana de 0,0020 y 96,0% de top-1.
- Atencion al cliente multilingue: el soporte de ocho idiomas y el modo thinking permiten gestionar conversaciones multi-turno con trazabilidad del razonamiento, util en entornos donde el cliente exige que los datos no salgan del dispositivo.
- Tareas financieras y de oficina asistidas: la calibracion incluye finanzas y office tasks, de modo que el modelo es adecuado para resumir hojas de calculo, redactar memorandos o extraer campos de facturas en un portatil.
- Analisis de ciberseguridad y redes: el bundle se calibro con datos de ciberseguridad y redes, y esas familias se evaluaron de forma explicita (KL mediana 0,0044 y 0,0002 respectivamente), lo que lo hace util para triaje de alertas y revision de configuraciones.
- Generacion de codigo en pipelines de CI/CD: al ser un modelo local sin coste por token y con licencia Apache-2.0, se puede invocar desde runners autoalojados para revision de parches, generacion de tests o resumen de diffs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El blog de Liquid AI afirma cualitativamente que LFM2.5-24B-A2B supera a Qwen3.6-35B-A3B en LiveClaw, pero sin cifras en la informacion disponible.

Lo que si publica la model card es una evaluacion de fidelidad de la cuantizacion frente al modelo bf16, sobre 232.094 posiciones con teacher forcing en secuencias generadas por el propio bf16 y no vistas en calibracion. La fila "floor" corresponde al modelo bf16 con los embeddings perturbados en un ULP, que sirve de referencia de ruido irreducible del enrutado. Estas cifras miden la degradacion por cuantizacion, no la calidad absoluta del modelo.

| Modelo | Tamano | KL mediana | KL media | Top-1 | dNLL |
|---|---|---|---|---|---|
| bf16 con embeddings perturbados 1 ULP (floor) | 44,7 GiB | 1,1e-04 | 0,0036 | 98,24% | -0,0000 |
| JANG_4M (este bundle) | 14,8 GiB | 4,6e-04 | 0,0112 | 96,77% | +0,0077 |

Desglose por familia de prompt (KL mediana y top-1):

| Familia | KL mediana | Top-1 |
|---|---|---|
| Agente de herramientas multi-paso | 0,0012 | 95,9% |
| Uso de herramientas (un turno) | 0,0018 | 96,7% |
| Codigo: C++ | 0,0002 | 96,8% |
| Codigo: Go | 0,0000 | 98,1% |
| Codigo: JavaScript | 0,0001 | 97,0% |
| Codigo: Python | 0,0000 | 97,6% |
| Codigo: Rust | 0,0008 | 96,8% |
| Codigo: shell | 0,0011 | 96,3% |
| Codigo: Swift | 0,0009 | 96,2% |
| Codigo: TypeScript | 0,0003 | 96,7% |
| Escritura creativa | 0,0026 | 95,5% |
| Ciberseguridad | 0,0044 | 94,6% |
| Finanzas | 0,0005 | 97,2% |
| General / multilingue / salida estructurada | 0,0011 | 95,8% |
| Agente de codificacion (herramientas nativas) | 0,0002 | 98,2% |
| Agente de codificacion, turno siguiente | 0,0005 | 98,1% |
| Documentos largos | 0,0020 | 96,0% |
| Matematicas | 0,0000 | 98,0% |
| Redes | 0,0002 | 97,4% |
| Tareas de oficina | 0,0003 | 97,8% |
| Codigo PyTorch | 0,0003 | 96,8% |
| Ciencia | 0,0002 | 97,6% |
| SWE-agent | 0,0048 | 89,4% |
| Agente de terminal (shell) | 0,0003 | 96,9% |
| Turno posterior a un resultado de herramienta | 0,0017 | 96,3% |

Decisiones discretas: el modelo cuantizado elige el mismo token que bf16 en 99/99 cierres de `</think>` (el floor tambien 99/99) y en 23/24 inicios de llamada a herramienta (el floor 24/24).

## Requisitos de hardware

- El bundle es MLX, por lo que requiere Apple Silicon con memoria unificada. No hay variante CUDA ni GGUF publicada por este autor.
- Pesos cuantizados: 14,8 GiB (el repositorio ocupa 15,9 GB). Frente a los 44,7 GiB del bf16.
- Memoria unificada recomendada: 24-32 GB para uso comodo; 16 GB es ajustado una vez se anade la cache KV de una ventana de 131.072 tokens. Para aprovechar todo el contexto conviene apuntar a 36-64 GB. Estas cifras son estimaciones a partir del tamano de pesos, no datos publicados.
- GPU: no aplica a este bundle. El modelo base en bf16 requeriria aproximadamente 45 GB solo en pesos, es decir, una A100 80 GB o H100 para inferencia sin cuantizar en CUDA.
- Despliegue: runtime Osaurus 0.25.21 o superior (el `osaurus.json` declara `required_osaurus_version`), o cualquier stack compatible con MLX. No es compatible con vLLM, TGI, llama.cpp ni Ollama en su formato actual.
- No hay modelo draft para el 24B, por lo que no hay decodificacion especulativa en este bundle.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Parametros de muestreo recomendados en `generation_config.json` y `jang_config.json`: temperatura 0,1, top-k 50, penalizacion de repeticion 1,05, EOS `<|im_end|>`.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| OsaurusAI/LFM2.5-24B-A2B-JANG_4M | 24B | ~2B | 131.072 | Apache-2.0 | MLX safetensors (4/6/8-bit GPTQ) | 14,8 GiB, 68 descargas, 1 like |
| LiquidAI/LFM2.5-24B-A2B (bf16) | 24B | ~2B | 131.072 | Apache-2.0 | safetensors bf16 | 44,7 GiB, modelo base |
| OsaurusAI/LFM2.5-24B-A2B-JANGH2 | 24B | ~2B | 131.072 | Apache-2.0 | MLX safetensors | Variante JANG alternativa; esquema de cuantizacion no disponible |
| Qwen3.6-35B-A3B | 35B | ~3B | no disponible | no disponible | no disponible | Mencionado en el blog de Liquid AI como referencia en LiveClaw; cifras no disponibles |

No hay datos de benchmarks estandar ni de rendimiento comparado entre estos modelos en la informacion disponible, mas alla de la afirmacion cualitativa del blog de Liquid AI sobre LiveClaw.

## Limitaciones y advertencias

- Modelo exclusivamente de texto: no procesa imagen ni audio.
- El razonamiento no se puede desactivar. La plantilla abre `<think>` en cada respuesta y no hay niveles de esfuerzo, lo que incrementa el coste en tokens de salida y la latencia en tareas simples.
- El bundle solo funciona en MLX sobre Apple Silicon. No hay rutas de despliegue en CUDA, vLLM, TGI, llama.cpp, Ollama ni GGUF, lo que limita su uso en servidores Linux con GPU.
- Riesgo de alucinacion: no hay datos publicados de tasas de alucinacion en la informacion disponible; como cualquier modelo generativo, requiere verificacion en dominios facticos.
- Sensibilidad del enrutador: un cambio de un solo ULP en los embeddings bf16 ya cambia el top-1 en el 1,8% de las posiciones, lo que indica un enrutado fragil. Cualquier modificacion de los pesos, fusion de adaptadores o recalibracion puede degradar la calidad de forma no lineal.
- El enrutador debe usar puntuaciones sigmoideas con el bias solo para seleccionar el top-4. Una implementacion con softmax produce salidas incorrectas, lo que es un riesgo real al portar el modelo a otros runtimes.
- El rendimiento en SWE-agent cae de forma notable frente al resto de familias (KL mediana 0,0048 y top-1 del 89,4%), asi que las tareas de resolucion de issues en repositorios grandes son el punto mas debil documentado.
- Licencia Apache-2.0 en el modelo base y en el bundle, por lo que el uso comercial esta permitido; se debe conservar el aviso de licencia y atribuir a Liquid AI y a OsaurusAI segun los terminos.
- El modelo base apunta a la revision `1769516ac588`; conviene fijar esa revision para reproducibilidad.
- Idiomas soportados limitados a ocho; el resto no esta cubierto por la evaluacion de fidelidad.

## Enlaces

- HuggingFace del bundle: https://huggingface.co/OsaurusAI/LFM2.5-24B-A2B-JANG_4M
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Variante alternativa JANGH2: https://huggingface.co/OsaurusAI/LFM2.5-24B-A2B-JANGH2
- Blog de Liquid AI sobre LFM2.5-24B-A2B: https://www.liquid.ai/blog/lfm2-5-24b-a2b
- Cobertura en MarkTechPost: https://www.marktechpost.com/2026/10/14/liquid-ai-lfm2-5-24b-a2b/
- Sitio de Osaurus: https://osaurus.ai/

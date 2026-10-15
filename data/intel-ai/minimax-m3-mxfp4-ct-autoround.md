# intel-ai/MiniMax-M3-MXFP4-CT-AutoRound

## Resumen

MiniMax-M3-MXFP4-CT-AutoRound es una version cuantizada y publicada por intel-ai del modelo multimodal MiniMax-M3, desarrollado originalmente por MiniMaxAI. La publicacion no es un entrenamiento nuevo: es el resultado de aplicar Intel AutoRound, la herramienta de cuantizacion consciente de pesos de Intel, sobre los pesos originales con el esquema mixto MXFP4/MXFP8 y el formato llm_compressor (compatible con compressed-tensors). El objetivo es reducir el coste de memoria y de ancho de banda para servir un modelo de gran tamano sin perder calidad en tareas de razonamiento y de codigo agéntico.

El modelo base es un transformer multimodal con mezcla de expertos (MoE) que procesa imagen y texto (pipeline image-text-to-text, etiqueta minimax_m3_vl) y que tambien aparece etiquetado para video, uso conversacional, agentes y codigo. El repositorio declara 220.479.056.768 parametros totales segun los safetensors y un tamano de 244,2 GB, lo que situa el despliegue en el rango de servidores multi-GPU y no de hardware de consumo.

Su relevancia es practica: la model card muestra que la combinacion MXFP4 en los expertos MoE mas MXFP8 en los expertos compartidos no solo conserva la calidad respecto a BF16, sino que supera ligeramente al modelo original en GPQA Diamond, AIME 2026 y SWE-Bench Mini. Es decir, es una receta de cuantizacion agresiva de 4 bits en la parte dominante del calculo (los expertos enrutados) con una mejora medida, lo que interesa a quien despliega modelos grandes en produccion con restricciones de VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoE); incluye torre de vision, patch_merge_mlp y multi_modal_projector; etiqueta de modelo minimax_m3_vl |
| Parametros totales | 220.479.056.768 (~220,5 mil millones), segun los safetensors del repositorio |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens (valor usado en el ejemplo de despliegue vLLM, `--max-model-len 131072`) |
| Tipos de cuantizacion | MXFP4 en los expertos MoE enrutados (block_sparse_moe.experts); MXFP8 en los expertos compartidos (block_sparse_moe.shared_experts) y en el resto de capas cuantificadas; BF16 como referencia de partida; etiqueta 8-bit. Las capas excluidas (vision_tower, lm_head, block_sparse_moe.gate, embed_tokens, self_attn, patch_merge_mlp, multi_modal_projector, mlp.gate_up_proj, mlp.down_proj) no se cuantizan |
| Idiomas soportados | no disponible |
| Licencia | minimax-community (declarada como `license: other`) |
| Formato de pesos | safetensors con formato compressed-tensors / llm_compressor |

## Arquitectura y entrenamiento

La arquitectura de partida es un transformer multimodal con mezcla de expertos de MiniMax (MiniMax-M3). La nomenclatura de las capas que aparece en el comando de cuantizacion revela los componentes del modelo: `block_sparse_moe.experts` y `block_sparse_moe.shared_experts` (expertos enrutados y expertos compartidos), `block_sparse_moe.gate` (el router), `self_attn`, `vision_tower`, `patch_merge_mlp` y `multi_modal_projector` para la parte de vision, ademas de `embed_tokens`, `lm_head` y las proyecciones MLP `gate_up_proj` y `down_proj`. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base.

Lo que si describe la model card es el procedimiento de cuantizacion, que es la innovacion tecnica de esta publicacion. Se ejecuta AutoRound con 200 iteraciones y esquema MXFP8 como base, y mediante `layer_config` se fuerza `bits: 4, data_type: mx_fp` sobre `mlp.experts`, de modo que los expertos enrutados, que concentran la mayor parte del computo, se almacenan en 4 bits de punto flotante microscalado (MXFP4), mientras que los expertos compartidos y el resto de capas cuantificadas se mantienen en MXFP8. La torre de vision, el proyector multimodal, las atenciones, los embeddings, el router y las proyecciones MLP quedan fuera de la cuantizacion. El resultado se exporta en formato llm_compressor, consumible por vLLM. Segun la propia model card, esta mezcla no degrada el modelo: lo mejora marginalmente en las tres evaluaciones reportadas frente a BF16.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat y modo de razonamiento activable (`enable_thinking: true` en `chat_template_kwargs`).
- Razonamiento de nivel avanzado: la model card reporta evaluaciones en GPQA Diamond y AIME 2026, lo que indica capacidades de razonamiento cientifico y matematico.
- Codigo y trabajo agéntico sobre repositorios: se evalua con SWE-Bench Mini y el modelo esta etiquetado con `coding` y `agent`.
- Tool calling / function calling: el despliegue documentado usa `--tool-call-parser minimax_m3` y `--enable-auto-tool-choice`, es decir, soporte nativo de llamadas a herramientas en vLLM.
- Parseo de razonamiento separado del texto final mediante `--reasoning-parser minimax_m3`, util para separar cadenas de pensamiento de la respuesta al usuario.
- Modalidad de imagen y texto (pipeline `image-text-to-text`): la etiqueta minimax_m3_vl y la presencia de vision_tower y multi_modal_projector confirman entrada de imagenes.
- Etiquetado tambien para video, aunque la model card no detalla las capacidades concretas de video ni sus limites.
- Capacidades multilingues: no disponible; la model card no lista idiomas.
- Despliegue compatible con endpoints tipo OpenAI (`endpoints_compatible`).

## Casos de uso

- Agentes de resolucion de incidencias en repositorios: con 131.072 tokens de contexto y soporte de tool calling, el modelo puede leer arboles de ficheros, ejecutar busquedas y aplicar parches en un bucle multi-paso. Es el escenario que la propia model card mide con SWE-Bench Mini, donde la version MXFP4 alcanza 0,74.
- Asistente de codigo en pipelines de CI/CD: integrado tras un endpoint compatible con OpenAI en vLLM, puede revisar diffs, sugerir correcciones y generar tests, con el parser de tool calling encargandose de invocar herramientas de build o de lint.
- Analisis de documentacion tecnica escaneada: al aceptar imagen y texto, puede extraer informacion de diagramas, capturas de pantalla de errores o planos y responder preguntas sobre ellos junto al texto de contexto.
- Atencion al cliente tecnica de nivel 2: conversaciones multi-turno largas, con historial extenso gracias a la ventana de 131.072 tokens, y con la posibilidad de consultar sistemas internos mediante function calling.
- Razonamiento cientifico y matematico asistido: con 0,9444 en GPQA Diamond y 0,9667 en AIME 2026 en la configuracion MXFP4, es adecuado para verificar derivaciones, resolver problemas cuantitativos y generar explicaciones paso a paso.
- Automatizacion de analisis de video o de capturas de interfaz: el pipeline es image-text-to-text y el modelo esta etiquetado para video, de modo que puede describir o resumir contenido visual dentro de un flujo de monitorizacion.
- Generacion de informes tecnicos a partir de fuentes mixtas: combinar texto largo y figuras en un unico contexto para producir documentos estructurados, con el modo thinking activado cuando la tarea requiere planificacion.
- Evaluacion de calidad de respuestas en entornos de investigacion: usar el modelo como juez o generador de referencia en benchmarks internos, aprovechando la ventana larga para incluir muchos ejemplos en un mismo prompt.

## Benchmarks y rendimiento

Resultados publicados en la model card. Las tres configuraciones comparten el mismo modelo base y solo cambian la precision de los pesos. GPQA Diamond y AIME 2026 se evaluan con EvalScope; SWE-Bench Mini usa el subconjunto `MariusHobbhahn/swe-bench-verified-mini` (50 instancias).

| Configuracion | GPQA Diamond | AIME 2026 | SWE-Bench Mini |
|---|---|---|---|
| BF16 | 0,9242 | 0,9000 | 0,70 |
| MXFP8 | 0,9242 | 0,9333 | 0,68 |
| MXFP4 (expertos) + MXFP8 (expertos compartidos) | 0,9444 | 0,9667 | 0,74 |

No se han publicado en la informacion disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros) ni comparaciones con modelos de terceros.

## Requisitos de hardware

- Peso de los ficheros: el repositorio ocupa 244,2 GB, de modo que se necesita al menos ese espacio en disco o en un volumen de red para descargarlo.
- VRAM para pesos: al menos ~245 GB solo para los pesos cuantizados, mas la cache KV y las activaciones. No se especifica el tamano de la cache KV para 131.072 tokens, por lo que el requisito total no esta cuantificado en la informacion disponible.
- Configuracion recomendada por el autor: vLLM con `--tensor-parallel-size 2`, es decir, dos GPUs. Con ese reparto, cada GPU necesitaria del orden de 122 GB solo para pesos, lo que apunta a aceleradores de memoria muy alta (clase H200 de 141 GB o superior) y deja poco margen para la cache KV; se trata de una estimacion a partir del tamano del repositorio, no de un dato publicado.
- GPU de consumo: no cabe. Una RTX 4090 con 24 GB, o incluso varias, queda muy lejos de los ~245 GB de pesos. El modelo esta fuera del alcance de hardware consumer.
- Opciones de despliegue: vLLM es la ruta documentada en la model card (con `--tool-call-parser minimax_m3`, `--reasoning-parser minimax_m3` y `--enable-auto-tool-choice`). La libreria declarada es transformers con `custom_code`. No se mencionan llama.cpp, Ollama, TGI ni otros motores.
- Latencia y throughput: no disponible.
- Nota operativa: el comando de ejemplo de la model card apunta a `INCModelSharing/MiniMax-M3-MXFP4-Mixed-CT-AutoRound-Tuning`, un identificador distinto del repositorio `intel-ai/MiniMax-M3-MXFP4-CT-AutoRound`. Conviene verificar cual es el checkpoint correcto antes de desplegar.

## Comparativa con modelos similares

Solo se dispone de datos para la propia familia MiniMax-M3, ya que la model card no incluye comparaciones con otros modelos. La comparacion con la referencia MXFP8 se puede hacer sobre los benchmarks reportados.

| Modelo | Parametros | Contexto | GPQA Diamond | AIME 2026 | SWE-Bench Mini | Licencia |
|---|---|---|---|---|---|---|
| intel-ai/MiniMax-M3-MXFP4-CT-AutoRound | 220.479.056.768 | 131.072 tokens (config de ejemplo) | 0,9444 | 0,9667 | 0,74 | minimax-community |
| MiniMaxAI/MiniMax-M3-MXFP8 | no disponible | no disponible | 0,9242 | 0,9333 | 0,68 | minimax-community |
| MiniMaxAI/MiniMax-M3 (BF16) | no disponible | no disponible | 0,9242 | 0,9000 | 0,70 | minimax-community |

Comparativas con modelos de otros fabricantes: no disponible.

## Limitaciones y advertencias

- Alucinacion: la propia model card advierte de que el modelo puede producir salidas factualmente incorrectas y no debe usarse como fuente de informacion veraz sin verificacion.
- Contenido inapropiado: la model card reconoce que, por las limitaciones del modelo preentrenado y de los datos de ajuste, puede generar salidas obscenas, sesgadas u ofensivas. Recomienda pruebas de seguridad antes de cualquier despliegue.
- Sesgos: no se detallan sesgos concretos ni se documenta una evaluacion de sesgo; se remite a la advertencia generica anterior.
- Idiomas: no disponible. La model card no lista idiomas soportados, por lo que no se puede garantizar un rendimiento multilingue homogeneo.
- Licencia: `minimax-community` con `license: other`. No es una licencia permisiva estandar y la model card indica explicitamente que la licencia de esta publicacion no constituye asesoramiento legal y que hay que consultar a un abogado antes de un uso comercial. Es obligatorio revisar el fichero LICENSE del repositorio y respetar la licencia del modelo original.
- Capas sin cuantizar: vision_tower, multi_modal_projector, self_attn, embed_tokens, lm_head, el router y algunas proyecciones MLP se mantienen en su precision original, de modo que el ahorro de memoria no es uniforme sobre todo el modelo.
- Coste de despliegue: 244,2 GB de pesos implican infraestructura multi-GPU dedicada; no es viable en estaciones de trabajo de una sola GPU de gama alta.
- Madurez del repositorio: el modelo registra 0 descargas y 0 likes en el momento de la consulta, y el comando de ejemplo apunta a un identificador de repositorio diferente. Conviene validar el checkpoint antes de usarlo en produccion.
- Requisitos de seguridad: realizar pruebas de seguridad y de robustez antes de exponerlo a usuarios finales, tal como indica el autor.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/intel-ai/MiniMax-M3-MXFP4-CT-AutoRound
- Modelo base MiniMax-M3: https://huggingface.co/MiniMaxAI/MiniMax-M3
- Referencia MXFP8 de MiniMax: https://huggingface.co/MiniMaxAI/MiniMax-M3-MXFP8
- Intel AutoRound (repositorio): https://github.com/intel/auto-round
- Paper de AutoRound: https://arxiv.org/abs/2309.05516
- Intel Neural Compressor: https://github.com/intel/neural-compressor
- EvalScope, framework de evaluacion usado: https://github.com/modelscope/evalscope
- Dataset SWE-Bench Verified Mini: https://huggingface.co/datasets/MariusHobbhahn/swe-bench-verified-mini
- Intel (sitio corporativo): https://www.intel.com/content/www/us/en/homepage.html

Las busquedas web realizadas no devolvieron documentacion tecnica adicional sobre este modelo; los resultados se limitaron a paginas de descarga de controladores y soporte de Intel.

# Ars14n/GLM-5.3-UNCENSORED-EXL3-3.0bpw

## Resumen

GLM-5.3-UNCENSORED-EXL3-3.0bpw es una cuantización EXL3 en 3 bits (3,04 bpw de media) del checkpoint FP8 `dealignai/GLM-5.3-UNCENSORED-FP8`, que a su vez es una edición de pesos (sin fine-tune) del modelo `zai-org/GLM-5.3`. La publicación corre a cargo del usuario Ars14n, no está afiliada ni a dealignai ni a Z.ai, y se distribuye con licencia MIT. El objetivo del repositorio es doble: reducir un modelo MoE de gran tamano a un tamano servible en un nodo de 8 GPU y ofrecer una variante "uncensored" en la que se han modificado los pesos para eliminar comportamientos de rechazo.

La arquitectura declarada es `GlmMoeDsaForCausalLM`: mezcla de expertos con 256 expertos enrutados (8 activos por token) mas 1 experto compartido, atención MLA con indexador disperso DSA, 78 capas mas 1 capa MTP (multi-token prediction) que puede usarse como borrador especulativo. La model card declara 753.000 millones de parametros totales, mientras que los metadatos de safetensors del repositorio suman 146.311.635.584 parametros; esta discrepancia no se explica en la informacion disponible y conviene tratarla con cautela.

El modelo es relevante para quienes necesitan desplegar un MoE de gran tamano en hardware propio con calidad cercana al FP8 original: la cuantizacion mezcla precisiones por componente (3 bpw en expertos enrutados, 5 bpw en atención y expertos compartidos, 6 bpw en lm_head) y el autor documenta tanto la fidelidad frente al checkpoint FP8 (KL de 0,089, perplejidad 3,440 frente a 3,302) como una evaluacion agentica en tau2-bench. La contrapartida es un requisito de memoria de aproximadamente 273 GiB y una advertencia importante sobre el parser de tool calling de TabbyAPI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GlmMoeDsaForCausalLM (MoE con atención MLA e indexador disperso DSA); 78 capas + 1 capa MTP |
| Parametros totales | 146.311.635.584 según los metadatos de safetensors del repo; la model card declara 753.000 millones (discrepancia no aclarada) |
| Parametros activos | no disponible (se indican 8 expertos enrutados activos de 256, mas 1 experto compartido, sin desglose de parametros activos) |
| Longitud de contexto | 65.536 tokens configurados y probados (max_seq_len); cache compartida de 98.304 tokens; contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | EXL3 a 3,0 bpw (media real 3,04 bpw), codebook mul1; atención y expertos compartidos a 5 bpw, MLP densos a 4 bpw, expertos enrutados a 3 bpw, lm_head a 6 bpw; capa MTP a 4 bpw en expertos y 6 bpw en atención/experto compartido (sin calibrar) |
| Idiomas soportados | no disponible |
| Licencia | MIT (segun la model card, siguiendo las releases upstream de GLM-5.3 y dealignai) |
| Formato de pesos | safetensors (formato EXL3 / exllamav3) |

## Arquitectura y entrenamiento

Se trata de un transformer de tipo mezcla de expertos con 256 expertos enrutados y 8 activos por token, mas un experto compartido siempre activo. La atención es MLA (multi-head latent attention) con un indexador disperso DSA, un esquema orientado a reducir el coste de atención sobre contextos largos. El modelo tiene 78 capas mas una capa adicional de predicción multi-token (MTP) que el autor incluye en la cuantizacion y que puede emplearse como borrador especulativo (`draft_mode: mtp` en TabbyAPI).

No hay informacion sobre el entrenamiento del modelo base en los datos proporcionados: no se indican numero de tokens, composicion del dataset, ni si hubo RLHF, DPO u otras etapas de alineamiento. Lo que si se documenta es el post-procesado: el checkpoint de origen es una edicion de pesos (weight editing, no fine-tune) sobre GLM-5.3, documentada en el fichero `CRACK_SURGERY.json`, cuyo contenido no se detalla. La cuantizacion se genero con ExLlamaV3 en el commit `d3739fd`, leyendo directamente el checkpoint FP8 y con calibracion por defecto de 250 filas por 2048 tokens. La innovacion practica destacable es la mezcla de precisiones por tipo de componente y la capa MTP reutilizada como decodificacion especulativa.

## Capacidades

- Generacion de texto y conversacion multi-turno (`text-generation`, `conversational`).
- Razonamiento explicito: la configuracion de servicio recomendada por el autor activa `reasoning: true`.
- Tool calling / function calling, con formato de herramientas `glm4_7` y argumentos escritos como texto plano (`<arg_value>...</arg_value>`).
- Uso agentico multi-paso: evaluado en tau2-bench en los dominios de aerolinea y retail con metrica Pass^1.
- Decodificacion especulativa mediante la capa MTP incluida en la cuantizacion.
- Variante "uncensored": la edicion de pesos busca reducir rechazos y restricciones de contenido del modelo original.
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Agentes de atencion al cliente multi-turno: el modelo mantiene conversaciones largas dentro de una ventana de 65.536 tokens y soporta tool calling, por lo que puede consultar sistemas de pedidos o reservas. Requiere corregir antes el parser de TabbyAPI (ver limitaciones), ya que en tau2-bench retail aproximadamente el 70% de las llamadas a herramientas fallaron sin ese arreglo.
- Automatizacion de back-office con agentes (aerolinea, retail, seguros): los resultados de tau2-bench (0,640 en aerolinea y 0,482 en retail, Pass^1) permiten estimar el rendimiento esperado antes de invertir en integracion.
- Generacion de codigo y asistentes de desarrollo en despliegue privado: al ejecutarse en hardware propio y con licencia MIT declarada, es apto para entornos donde el codigo no puede salir de la infraestructura.
- Analisis de documentos largos y RAG con contexto extenso: la ventana de 65.536 tokens y la cache compartida de 98.304 tokens permiten procesar contratos, expedientes o bases de conocimiento sin trocear en exceso.
- Investigacion sobre alineamiento y seguridad: al ser una edicion de pesos sin fine-tune sobre un modelo de referencia, sirve como caso de estudio de como se comporta un modelo con los rechazos atenuados frente a su version original.
- Generacion de datos sinteticos y destilacion: un MoE de este tamano puede producir grandes volumenes de texto etiquetado para entrenar modelos menores, siempre que la licencia y la politica de contenido del proyecto lo permitan.
- Evaluacion comparativa de cuantizaciones: el repositorio publica metricas de divergencia KL y perplejidad frente al FP8, util para medir el coste real de bajar a 3 bpw antes de adoptar el formato EXL3 en produccion.

## Benchmarks y rendimiento

Fidelidad de la cuantizacion frente al checkpoint FP8 de origen (`eval/model_diff.py`, 20 filas x 2048 tokens de wikitext-2 test):

| Metrica | Valor |
|---|---|
| Divergencia KL (quant ‖ FP8) | 0,089 |
| Divergencia KL (FP8 ‖ quant) | 0,097 |
| KL por token, mediana / p90 | 0,021 / 0,221 |
| Perplejidad, quant / FP8 | 3,440 / 3,302 |
| KL mediana donde la top-prob de FP8 es >= 0,95 (44% de los tokens) | 0,0011 |

Evaluacion agentica en tau2-bench (Pass^1, temperatura 1.0, top_p 0.95; simulador de usuario y jueces GPT-4.1 a temperatura 0; referencia: GLM-5.3 original servido en FP8 por Z.ai via OpenRouter):

| Dominio | GLM-5.3 FP8 (Z.ai) | Esta cuantizacion | Diferencia |
|---|---|---|---|
| airline (50 tareas x 2 trials) | 0,710 ± 0,045 | 0,640 ± 0,048 | -0,070 (~1,1 SE) |
| retail (114 tareas) | 0,504 ± 0,033 (2 trials) | 0,482 ± 0,047 (1 trial) | -0,022 (~0,4 SE) |

Desglose por trial: airline baseline 0,740 / 0,680 frente a 0,600 / 0,680 de la cuantizacion; retail baseline 0,465 / 0,544 frente a 0,482. El autor senala que ninguna de las dos diferencias es estadisticamente significativa con estos tamanos de muestra y que la estimacion puntual de airline debe leerse como una posible regresion menor, no como una regresion medida. La comparacion mezcla dos efectos: la edicion de pesos de dealign y la propia cuantizacion. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- Peso de los ficheros: 273 GiB (tamano del repo 292,8 GB). Hay que sumar la cache KV: el autor usa una cache compartida de 98.304 tokens.
- Configuracion validada por el autor: 8x A100 40 GB (320 GB de VRAM) con reparto por capas (`gpu_split_auto`) y decodificacion especulativa MTP en TabbyAPI.
- GPU recomendadas: A100 40 GB en configuracion de 8 unidades es la unica combinacion documentada como probada. Un nodo de 4x H100 80 GB (320 GB) es un ajuste plausible por capacidad de memoria, pero no esta verificado en la informacion disponible.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en ninguna GPU consumer individual; harian falta del orden de 12 GPU de 24 GB solo para los pesos. El autor no documenta offload parcial a CPU o a disco.
- Opciones de despliegue: TabbyAPI con backend exllamav3 (soportado y probado). El formato EXL3 no es compatible con llama.cpp, Ollama, TGI ni vLLM, salvo que se recuantice o se use el checkpoint FP8 de origen.
- Latencia y throughput: no disponible. El autor no publica medidas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento documentado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (EXL3 3,0 bpw) | 146.311.635.584 declarados en safetensors; 753.000 millones segun la model card | 65.536 tokens configurados y probados | tau2-bench: 0,640 airline / 0,482 retail; perplejidad 3,440 | MIT | Repo HuggingFace, 0 descargas, 0 likes |
| dealignai/GLM-5.3-UNCENSORED-FP8 | no disponible | no disponible | no disponible | no disponible | Checkpoint de origen en HuggingFace |
| zai-org/GLM-5.3 (stock, FP8) | no disponible | no disponible | tau2-bench: 0,710 airline / 0,504 retail | no disponible | Servido por Z.ai via OpenRouter |

No se dispone de datos verificados de otros modelos de la misma categoria (por ejemplo alternativas MoE de mas de 100.000 millones de parametros en formato cuantizado a 3-4 bits) dentro de la informacion proporcionada, por lo que la comparativa con familias de modelos externas queda como no disponible.

## Limitaciones y advertencias

- Modelo "uncensored": la edicion de pesos busca eliminar rechazos, lo que implica un riesgo elevado de generar contenido danino, ilegal o inseguro sin filtros. No debe exponerse a usuarios finales sin capas de moderacion externas.
- Riesgo de alucinacion: no hay datos de evaluacion de veracidad en la informacion proporcionada; los unicos benchmarks disponibles miden seguimiento de tareas agenticas, no factualidad.
- Regresion por cuantizacion: la perplejidad sube de 3,302 a 3,440 y la divergencia KL media es de 0,089. El p90 de KL por token (0,221) indica que una minoria de tokens se desvia notablemente, aunque en el 44% de los tokens con alta confianza la KL mediana es de 0,0011.
- Advertencia critica de tool calling: GLM escribe los argumentos de las herramientas como texto plano (`<arg_value>9523456873</arg_value>`). El parser `glm4_5` de TabbyAPI (commit `be74bf0`) decodifica en JSON todos los valores sin consultar el esquema, de modo que parametros de tipo cadena con aspecto numerico (IDs de pedido, codigos postales) llegan a las herramientas como enteros. En tau2-bench retail esto provoco que aproximadamente el 70% de las llamadas fallara. Antes de usar el modelo como agente hay que modificar el parser para que mantenga como texto los parametros cuyo tipo de esquema sea `string`.
- Idiomas soportados: no disponible, por lo que no se puede garantizar un rendimiento aceptable en castellano u otros idiomas distintos del ingles sin evaluacion propia.
- Discrepancia de parametros: los metadatos de safetensors indican 146.311.635.584 parametros y la model card declara 753.000 millones. La diferencia es de un orden de magnitud y no esta explicada, lo que dificulta estimar requisitos y costes con precision.
- Soporte y mantenimiento: el repositorio tiene 0 descargas y 0 likes, esta publicado sin comunidad detras y no esta afiliado a dealignai ni a Z.ai. No hay garantia de actualizaciones ni de soporte.
- Licencia: la model card declara MIT, pero la licencia del modelo upstream `zai-org/GLM-5.3` no se detalla en la informacion proporcionada; conviene verificar los terminos de uso comercial de la cadena completa antes de desplegarlo en produccion.
- Puertos de despliegue limitados: EXL3 solo es utilizable en ExLlamaV3/TabbyAPI, lo que restringe las alternativas si el equipo ya opera sobre vLLM, TGI o llama.cpp.
- Fecha de publicacion: el repositorio figura creado el 2026-10-03, sin historial de revisiones posteriores.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Ars14n/GLM-5.3-UNCENSORED-EXL3-3.0bpw
- Modelo base (checkpoint FP8): https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8
- Modelo original: https://huggingface.co/zai-org/GLM-5.3
- Fichero de documentacion de la edicion de pesos: `CRACK_SURGERY.json` (copiado sin cambios desde el repo de origen)
- Script de evaluacion de fidelidad: `eval/model_diff.py` (incluido en el repositorio)
- ExLlamaV3 (commit `d3739fd`, empleado para la conversion): no disponible el enlace directo en la informacion proporcionada
- TabbyAPI (commit `be74bf0` del parser `glm4_5`): no disponible el enlace directo en la informacion proporcionada
- Resultados de la busqueda web: no se encontro ningun enlace relevante al modelo; los resultados devueltos eran contenido no relacionado y sin valor tecnico, por lo que se descartan.

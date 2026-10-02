# Infatoshi/GLM-5.3-UNCENSORED-EXL3-3.0bpw

## Resumen

GLM-5.3-UNCENSORED-EXL3-3.0bpw es una cuantizacion EXL3 del modelo dealignai/GLM-5.3-UNCENSORED-FP8, que a su vez es una variante con edicion de pesos (no un fine-tune) del GLM-5.3 de zai-org. La publica el usuario Infatoshi como una version optimizada para servirse con ExLlamaV3 (biblioteca `exllamav3`), con un bitrate medio de 3.04 bpw y un tamano de repositorio de 292,8 GB. Emplea la arquitectura `GlmMoeDsaForCausalLM`, un transformer de tipo mezcla de expertos (MoE) con atencion MLA e indice disperso DSA.

El interes de esta ficha radica en que combina tres elementos poco habituales: una cuantizacion EXL3 de muy bajo bitrate, una capa MTP (next-token prediction) utilizable como borrador especulativo y una edicion de pesos orientada a eliminar restricciones de contenido. La model card declara 753.000 millones de parametros totales, mientras que los metadatos de safetensors del repositorio reportan 146.311.635.584 parametros (~146B); esta discrepancia se detalla en la seccion de especificaciones y conviene verificarla antes de planificar el despliegue.

La relevancia actual viene dada por su evaluacion agentica publicada sobre tau2-bench y por su licencia MIT, que facilita el uso comercial. No obstante, requiere hardware de gama alta (la model card lo prueba en 8x A100 40GB) y solo es servible mediante ExLlamaV3/TabbyAPI, no con llama.cpp ni Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `GlmMoeDsaForCausalLM`: transformer MoE con atencion MLA e indice disperso DSA (sparse indexer); 78 capas + 1 capa MTP |
| Parametros totales | Discrepancia: safetensors reporta 146.311.635.584 (~146B); la model card declara 753B |
| Parametros activos | 256 expertos enrutados (8 activos) + 1 experto compartido; cifra exacta de parametros activos no disponible |
| Longitud de contexto | 65.536 tokens (max_seq_len probado); cache_size 98.304 |
| Tipos de cuantizacion | EXL3 a 3.04 bpw (`-b 3.0 --hq`); expertos enrutados a 3 bpw, MLP densos a 4, atencion y expertos compartidos a 5, lm_head a 6; codebook `mul1`; MTP a 4/6 bpw sin calibrar |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (formato EXL3), biblioteca `exllamav3` |

## Arquitectura y entrenamiento

El modelo es una cuantizacion, no un entrenamiento nuevo. La arquitectura subyacente es `GlmMoeDsaForCausalLM`, una mezcla de expertos con 256 expertos enrutados de los que se activan 8 por token, mas un experto compartido. Usa atencion MLA (multi-head latent attention) junto con un indice disperso DSA, y consta de 78 capas mas una capa MTP adicional. La cuantizacion se realizo con ExLlamaV3 en el commit `d3739fd`, con calibracion por defecto de 250 filas x 2048 tokens, leyendo directamente el checkpoint FP8 de origen. La capa MTP se incluye y puede emplearse como borrador especulativo (`draft_mode: mtp` en TabbyAPI); sus expertos estan a 4 bpw y la atencion y el experto compartido a 6 bpw, sin calibrar.

La procedencia en cadena es: zai-org/GLM-5.3 (base original) -> dealignai/GLM-5.3-UNCENSORED-FP8 (variante con edicion de pesos documentada en `CRACK_SURGERY.json`, sin fine-tune) -> esta cuantizacion EXL3. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO, ya que esos datos corresponden al modelo original y no se detallan aqui. La innovacion tecnica destacable de este repositorio es la cuantizacion mixta por componente y la integracion de MTP para decodificacion especulativa.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento explicito: la configuracion de servicio incluye `reasoning: true`.
- Llamada a herramientas (tool calling / function calling) con el formato `glm4_7` / parser `glm4_5`, con la salvedad documentada mas abajo.
- Uso en flujos agenticos; evaluado en tau2-bench en los dominios airline y retail con metrica Pass^1.
- Decodificacion especulativa mediante la capa MTP incluida.
- Variante "uncensored": la edicion de pesos (no fine-tune) reduce las restricciones de contenido del modelo original.
- Capacidades multilingues: no disponibles como dato explicito.
- Vision o audio: no disponibles.

## Casos de uso

- Agentes de atencion al cliente: el modelo fue evaluado en tau2-bench (dominios airline y retail) con Pass^1, lo que lo hace adecuado para flujos de resolucion de tareas con multiples pasos y llamadas a herramientas.
- Automatizacion de operaciones de negocio (retail): gestion de pedidos, devoluciones y consultas de productos mediante tool calling, aprovechando el contexto de 65.536 tokens para mantener el estado de la conversacion.
- Despliegue de agentes en produccion sobre hardware tipo A100: con 8x A100 40GB y TabbyAPI es posible servir el modelo con reparto por capas (`gpu_split_auto`) y cache compartida de 98K tokens.
- Asistentes conversacionales de contexto largo: la ventana de 65.536 tokens permite procesar documentos extensos o historiales de conversacion largos sin truncar.
- Generacion de respuestas sin filtros de contenido (casos editoriales, creativos o de investigacion): gracias a la edicion "uncensored".
- Aceleracion de inferencia en pipelines con requisitos de latencia: la capa MTP permite decodificacion especulativa para reducir el coste por token generado.
- Investigacion sobre cuantizacion: sirve como caso de estudio de fidelidad de una cuantizacion EXL3 a 3.04 bpw frente a su origen FP8.

## Benchmarks y rendimiento

Fidelidad frente al origen FP8 (`eval/model_diff.py`, 20 filas x 2048 tokens de wikitext-2 test):

| Metrica | Valor |
|---|---|
| Divergencia KL (quant ‖ FP8) | 0.089 |
| Divergencia KL (FP8 ‖ quant) | 0.097 |
| KL por token, mediana / p90 | 0.021 / 0.221 |
| Perplejidad, quant / FP8 | 3.440 / 3.302 |
| KL mediana donde FP8 top-prob ≥ 0.95 (44% de tokens) | 0.0011 |

Evaluacion agentica tau2-bench (airline, retail), Pass^1, temperatura 1.0 y top_p 0.95; simulador de usuario y jueces con GPT-4.1 a temperatura 0. La referencia es el GLM-5.3 original servido en FP8 por Z.ai (no la edicion uncensored), de modo que la diferencia mezcla la edicion de pesos y la cuantizacion:

| Dominio | GLM-5.3 stock FP8 (Z.ai) | Este quant | Diferencia |
|---|---|---|---|
| airline (50 tareas x 2 intentos) | 0.710 ± 0.045 | 0.640 ± 0.048 | -0.070 (~1,1 SE) |
| retail (114 tareas) | 0.504 ± 0.033 (2 intentos) | 0.482 ± 0.047 (1 intento) | -0.022 (~0,4 SE) |

Por intento: airline baseline 0.740 / 0.680, quant 0.600 / 0.680; retail baseline 0.465 / 0.544, quant 0.482. El propio autor indica que ninguna de las diferencias es estadisticamente significativa con estos tamanos de muestra y que la diferencia en airline debe tratarse como una posible regresion leve, no medida. No se aportan resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar.

## Requisitos de hardware

- Tamano del repositorio: 292,8 GB; tamano indicado del modelo cuantizado: 273 GiB.
- VRAM estimada: el modelo no cabe en una GPU de consumo. La model card lo prueba en 8x A100 40GB (320 GB agregados) con reparto por capas.
- GPU recomendadas: 8x A100 40GB (configuracion probada); en general se requiere un nodo multi-GPU de gama alta (A100/H100).
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en GPUs de 24-48 GB; no es viable en una sola tarjeta de consumo.
- Opciones de despliegue: TabbyAPI con backend `exllamav3` (unico backend probado). Al ser formato EXL3, no es compatible de forma nativa con llama.cpp, Ollama ni TGI en formato GGUF.
- Configuracion recomendada: `max_seq_len: 65536`, `cache_size: 98304`, `gpu_split_auto: true`, `tool_format: glm4_7`, `reasoning: true`, con `draft_mode: mtp` para decodificacion especulativa.
- Latencia y throughput: no disponibles como cifras concretas; se documenta el uso de MTP drafting y cache compartida de 98K tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Infatoshi/GLM-5.3-UNCENSORED-EXL3-3.0bpw | 146B (safetensors) / 753B declarados | 65.536 tokens | EXL3 (exllamav3) | MIT | Cuantizacion 3.04 bpw, MTP incluido |
| dealignai/GLM-5.3-UNCENSORED-FP8 | no disponible | no disponible | FP8 | MIT (segun cadena de origen) | Modelo base directo de esta cuantizacion |
| zai-org/GLM-5.3 | 753B (declarado) | no disponible | no disponible | MIT (segun cadena de origen) | Modelo original sin editar |
| huihui-ai/Huihui-GLM-5.3-Flash-abliterated-GGUF | 321B | no disponible | GGUF | no disponible | Alternativa abliterated en formato GGUF, orientada a llama.cpp |

Nota: los datos de los modelos comparados provienen de resultados de busqueda y de la propia model card; varios campos no estan confirmados en la informacion disponible.

## Limitaciones y advertencias

- Discrepancia de parametros: los metadatos de safetensors reportan ~146B mientras que la model card declara 753B; conviene verificarlo antes de dimensionar el hardware.
- Tool calling fragil: GLM escribe los argumentos de herramienta como texto crudo (`<arg_value>9523456873</arg_value>`). El parser `glm4_5` de TabbyAPI (commit `be74bf0`) decodifica en JSON todos los valores sin consultar el esquema de la herramienta, por lo que parametros de tipo string con aspecto numerico (IDs, codigos postales) llegan a las herramientas como enteros. En tau2-bench retail esto provoco que ~70% de las llamadas fallaran. Es necesario forzar que el parser conserve como texto crudo los parametros cuyo tipo de esquema sea `string` antes de usar el modelo en agentes.
- La evaluacion agentica se ejecuto con esa correccion aplicada y ademas mezcla la edicion de pesos con la cuantizacion, por lo que no aísla el efecto de ninguna de las dos.
- La diferencia observada en airline (-0.070) puede ser una regresion leve no significativa; conviene tratarla con cautela en produccion.
- Riesgo de alucinacion: no se aportan datos especificos; aplican los riesgos habituales de un modelo de lenguaje.
- Sesgos: no documentados en la informacion disponible; al tratarse de una variante "uncensored", el filtrado de contenido es reducido, lo que aumenta el riesgo de generar material inapropiado, sesgado o danino.
- Idiomas soportados: no disponibles.
- Licencia MIT: permite uso comercial, pero al derivar de GLM-5.3 y de dealignai conviene revisar las condiciones de las fuentes originales.
- Compatibilidad limitada: solo servicio mediante ExLlamaV3/TabbyAPI; no hay soporte nativo en ecosistemas GGUF (llama.cpp, Ollama) ni en TGI.
- Hardware exigente: no es ejecutable en GPUs de consumo; requiere un nodo multi-GPU.
- Advertencia de contenido: la model card original cita solo datos tecnicos; la edicion "uncensored" implica ausencia de moderacion, lo que debe tenerse en cuenta para despliegues publicos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Infatoshi/GLM-5.3-UNCENSORED-EXL3-3.0bpw
- Modelo base (FP8): https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8
- Modelo original: https://huggingface.co/zai-org/GLM-5.3
- Articulo de referencia: https://promptblueprints.tech/ai-releases/glm-5-3-uncensored-exl3-3-0bpw-what-the-release-includes/
- Catalogo de modelos uncensored en HuggingFace: https://huggingface.co/models?other=uncensored

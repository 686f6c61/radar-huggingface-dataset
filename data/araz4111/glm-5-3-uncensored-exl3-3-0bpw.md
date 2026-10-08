# araz4111/GLM-5.3-UNCENSORED-EXL3-3.0bpw

## Resumen

GLM-5.3-UNCENSORED-EXL3-3.0bpw es una cuantización EXL3 en 3,04 bits por peso del checkpoint `dealignai/GLM-5.3-UNCENSORED-FP8`, el cual a su vez es una variante de `zai-org/GLM-5.3` editada a nivel de pesos (sin fine-tuning) para eliminar el alineamiento de seguridad del proveedor. El repositorio lo publica el usuario `araz4111` con la librería ExLlamaV3 (commit `d3739fd`) y está pensado para autoalojamiento en hardware multi-GPU: ocupa 273 GiB en disco y el repositorio completo pesa 292,8 GB.

La arquitectura declarada en la model card es `GlmMoeDsaForCausalLM`, un transformer de mezcla de expertos con 256 expertos enrutados (8 activos) más uno compartido, atención MLA con indexador disperso DSA, 78 capas más una capa MTP (multi-token prediction) reutilizable como borrador especulativo. La propia model card cifra el modelo de origen en 753.000 millones de parámetros totales, mientras que los metadatos reales de safetensors del repositorio cuantizado declaran 146.311.635.584 parámetros: existe una discrepancia entre ambas cifras que no se resuelve con la información disponible.

Su relevancia es doble. Por un lado, demuestra que es viable servir localmente un modelo frontera de esta categoría con pérdida de fidelidad medible y acotada (divergencia KL de 0,089 frente al FP8 de origen, perplejidad 3,440 frente a 3,302 en wikitext-2). Por otro, documenta con detalle un fallo de integración en el parseo de tool calling que rompe aproximadamente el 70 % de las llamadas a herramientas en tau2-bench retail si no se corrige, un aviso poco habitual y muy útil para quien despliegue agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GlmMoeDsaForCausalLM (MoE con atencion MLA e indexador disperso DSA) |
| Parametros totales | 146.311.635.584 segun metadatos de safetensors; la model card declara 753.000 millones para el modelo de origen (dato contradictorio, no resuelto) |
| Parametros activos | 8 expertos enrutados de 256, mas 1 experto compartido (numero de parametros activos no disponible) |
| Longitud de contexto | No disponible como valor nativo; en la prueba de servicio se configuro `max_seq_len: 65536` con cache compartida de 98304 tokens |
| Tipos de cuantizacion | EXL3 a 3,04 bpw medios: atencion y expertos compartidos a 5 bpw, MLP densos a 4 bpw, expertos enrutados a 3 bpw, `lm_head` a 6 bpw, codebook `mul1`; capa MTP a 4 bpw en expertos y 6 bpw en atencion y experto compartido |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (EXL3, requiere ExLlamaV3) |

Otros datos: 78 capas mas 1 capa MTP, pipeline `text-generation`, 0 descargas y 0 likes en el momento de la consulta, creado el 7 de octubre de 2026.

## Arquitectura y entrenamiento

El modelo es una cuantizacion, no un entrenamiento nuevo. El linaje es `zai-org/GLM-5.3` (original de Z.ai) → `dealignai/GLM-5.3-UNCENSORED-FP8` (edicion de pesos documentada en `CRACK_SURGERY.json`, sin fine-tuning) → este repositorio EXL3. La conversion se hizo leyendo directamente el checkpoint FP8 y aplicando la calibracion por defecto de ExLlamaV3: 250 filas de 2048 tokens.

La arquitectura combina mezcla de expertos de grano fino (256 expertos enrutados con 8 activos por token) con atencion MLA, que comprime la cache KV mediante proyecciones latentes de bajo rango, y un indexador disperso DSA que reduce el coste de atencion sobre contextos largos seleccionando un subconjunto de tokens relevantes. La capa MTP adicional permite prediccion multi-token y se puede usar como modelo borrador en decodificacion especulativa (`draft_mode: mtp` en TabbyAPI), lo que compensa parcialmente el coste de generar con un MoE de este tamano.

Las asignaciones de bits son heterogeneas y deliberadas: los expertos enrutados, que concentran el grueso del peso, bajan a 3 bpw, mientras que atencion y expertos compartidos se mantienen a 5 bpw y `lm_head` a 6 bpw para preservar la fidelidad de la distribucion de salida. El resultado medido es una divergencia KL de 0,089 en una direccion y 0,097 en la inversa, con una KL mediana de 0,021 y un percentil 90 de 0,221; en el 44 % de los tokens donde el FP8 de origen asigna probabilidad top igual o superior a 0,95, la KL mediana cae a 0,0011. No se han publicado datos de composicion del dataset de entrenamiento ni de fases de RLHF o DPO para GLM-5.3 en la informacion disponible.

## Capacidades

- Generacion de texto conversacional multi-turno en formato chat (`pipeline: text-generation`, `conversational`).
- Modo de razonamiento activable (`reasoning: true` en la configuracion de servicio).
- Tool calling y function calling con formato de herramientas `glm4_7` en TabbyAPI.
- Flujos de agente con razonamiento multi-paso, evaluados sobre tau2-bench en los dominios airline y retail.
- Decodificacion especulativa mediante la capa MTP integrada, que actua como borrador.
- Capacidad multilingue: no disponible (no se declaran idiomas en los metadatos).
- Capacidades de vision o audio: no disponibles.
- Contexto largo: soporta al menos 65.536 tokens en la configuracion probada, con cache compartida de 98.304 tokens.

## Casos de uso

- Agentes de atencion al cliente en dominios transaccionales: el modelo esta evaluado especificamente en tau2-bench airline y retail con llamadas a herramientas reales, y su ventana de contexto permite arrastrar el historial completo de la conversacion mas el estado del pedido. Requiere corregir antes el parseo de argumentos de herramienta descrito mas abajo.
- Automatizacion de back-office con identificadores: pedidos, numeros de producto, codigos postales y referencias. Es precisamente el escenario donde el bug de parseo duele, porque GLM emite los argumentos como texto crudo (`<arg_value>9523456873</arg_value>`) y un parser que fuerce JSON los convierte en enteros.
- Autoalojamiento con requisitos estrictos de privacidad: al ejecutarse sobre pesos locales con licencia MIT, permite procesar datos regulados sin enviarlos a una API externa, siempre que se asuma el coste de 8x A100 40 GB.
- Investigacion sobre alineamiento y edicion de pesos: el repositorio y su origen documentan el proceso de "de-alineamiento" y su efecto medible en tareas agenticas, lo que lo convierte en material de estudio sobre que se degrada y que no al eliminar el ajuste de seguridad.
- Evaluacion de tecnicas de cuantizacion: el repositorio incluye `eval/model_diff.py` y metricas de fidelidad (KL, perplejidad) frente al checkpoint FP8, lo que sirve como banco de pruebas reproducible para comparar esquemas de cuantizacion en MoE de gran escala.
- Generacion de texto creativo o sin filtros editoriales: el proposito declarado del checkpoint base es eliminar el alineamiento del proveedor, de modo que encaja en pipelines de escritura donde las politicas de moderacion de las APIs comerciales resultan limitantes.
- Despliegue de razonamiento especulativo a gran escala: la capa MTP permite reducir el coste por token generado, interesante para servir cargas de trabajo de alto volumen en infraestructura propia.
- Evaluacion comparativa de parseadores de tool calling: el caso documentado (fallo del ~70 % de llamadas con el parser `glm4_5` sin correccion) sirve como prueba de regresion para implementaciones de servidores compatibles con OpenAI.

## Benchmarks y rendimiento

Fidelidad frente al checkpoint FP8 de origen (`eval/model_diff.py`, 20 filas x 2048 tokens de wikitext-2 test):

| Metrica | Valor |
|---|---|
| Divergencia KL (cuantizado ‖ FP8) | 0,089 |
| Divergencia KL (FP8 ‖ cuantizado) | 0,097 |
| KL por token, mediana / p90 | 0,021 / 0,221 |
| Perplejidad, cuantizado / FP8 | 3,440 / 3,302 |
| KL mediana donde el top-prob del FP8 es >= 0,95 (44 % de tokens) | 0,0011 |

Evaluacion agentica con tau2-bench (Pass^1, temperatura 1,0 y top_p 0,95 en el modelo; simulador de usuario y jueces GPT-4.1 a temperatura 0):

| Dominio | GLM-5.3 FP8 original (Z.ai) | Esta cuantizacion | Diferencia |
|---|---|---|---|
| Airline (50 tareas x 2 intentos) | 0,710 ± 0,045 | 0,640 ± 0,048 | -0,070 (~1,1 EE) |
| Retail (114 tareas) | 0,504 ± 0,033 (2 intentos) | 0,482 ± 0,047 (1 intento) | -0,022 (~0,4 EE) |

Detalle por intento: airline, baseline 0,740 / 0,680 frente a 0,600 / 0,680 de la cuantizacion; retail, baseline 0,465 / 0,544 frente a 0,482. El autor senala que ninguna de las dos diferencias es estadisticamente significativa con estos tamanos de muestra y que la estimacion puntual de airline debe leerse como una posible regresion leve, no medida. La comparacion mezcla dos efectos (la edicion de pesos de dealignai y la cuantizacion EXL3), por lo que no aísla el impacto de ninguna de las dos. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks academicos en la informacion disponible.

## Requisitos de hardware

- Pesos en disco: 273 GiB (repositorio completo 292,8 GB). Ese volumen es el suelo de VRAM necesario para pesos, antes de cache de atencion y activaciones.
- Configuracion probada: 8x A100 40 GB (320 GB agregados) con reparto por capas automatico (`gpu_split_auto`), servicio TabbyAPI sobre backend exllamav3, `max_seq_len` 65.536 y cache compartida de 98.304 tokens.
- No cabe en GPU de consumo. Ni siquiera un unico acelerador de 48 GB (A6000, L40S) es suficiente; se requiere un nodo multi-GPU con al menos 4-8 aceleradores de gran memoria.
- Opciones de despliegue: TabbyAPI o cualquier servidor basado en ExLlamaV3, que es el unico runtime que interpreta el formato EXL3. No se ha documentado soporte en vLLM, TGI, llama.cpp ni Ollama en la informacion disponible.
- Se puede activar la capa MTP como borrador especulativo (`draft_model: draft_mode: mtp`) para mejorar el throughput, a cambio de memoria adicional.
- Latencia y throughput medidos: no disponibles.
- Contexto: el modelo soporta al menos 65.536 tokens en la configuracion probada, con cache compartida configurada a 98.304 tokens.

## Comparativa con modelos similares

Dentro de la informacion disponible, las unicas alternativas comparables son el modelo de origen sin cuantizar y la version stock de Z.ai. Compararlos aísla parcialmente el coste de la cuantizacion, pero no el de la edicion de pesos.

| Modelo | Parametros | Formato | Contexto | Rendimiento tau2-bench | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este repositorio (araz4111, EXL3 3,0 bpw) | 146.311.635.584 segun safetensors; 753.000 millones declarados para el origen | safetensors EXL3, 273 GiB | 65.536 tokens configurados en la prueba | Airline 0,640 ± 0,048; retail 0,482 ± 0,047 | MIT | HuggingFace, runtime ExLlamaV3 |
| dealignai/GLM-5.3-UNCENSORED-FP8 | No disponible | FP8 | No disponible | No disponible | No disponible | HuggingFace |
| zai-org/GLM-5.3 (stock, servido por Z.ai en FP8) | 753.000 millones (segun la model card) | FP8 | No disponible | Airline 0,710 ± 0,045; retail 0,504 ± 0,033 | MIT segun la model card de este repositorio | Via OpenRouter / Z.ai |

Ademas, la busqueda web identifica repositorios con el mismo nombre y contenido aparentemente replicado (`Ars14n/GLM-5.3-UNCENSORED-EXL3-3.0bpw`, `Himee1/GLM-5.3-UNCENSORED-EXL3-3.0bpw`, `Infatoshi/GLM-5.3-UNCENSORED-EXL3-3.0bpw`), lo que sugiere redistribuciones del mismo artefacto. No hay datos de rendimiento publicados para ellos. No se dispone de informacion sobre otros modelos comparables de la misma categoria en las fuentes consultadas.

## Limitaciones y advertencias

- Discrepancia de parametros sin resolver: los metadatos de safetensors indican 146.311.635.584 parametros, mientras que la model card describe un modelo de 753.000 millones. Cualquiera de las dos cifras afecta a las estimaciones de memoria y de coste, asi que conviene verificarlas antes de planificar un despliegue.
- Fallo de tool calling documentado por el propio autor: GLM escribe los argumentos de herramienta como texto crudo y el parser `glm4_5` de TabbyAPI (commit `be74bf0`) los decodifica como JSON sin consultar el esquema, de modo que parametros declarados como `string` llegan como enteros. En tau2-bench retail esto provoco que fallaran alrededor del 70 % de las llamadas. Es imprescindible parchear el parser para conservar como texto los parametros cuyo esquema sea `string` antes de usar el modelo en produccion.
- Degradacion medible aunque no significativa: la caida de 0,070 en airline (~1,1 errores estandar) no es estadisticamente significativa con 50 tareas x 2 intentos, pero el autor recomienda tratarla como posible regresion leve. La comparacion no separa el efecto de la cuantizacion del efecto de la edicion de pesos.
- El modelo base ha sido editado para eliminar el alineamiento de seguridad. No hay evaluaciones publicadas de seguridad, sesgos o toxicidad para esta variante, y la ausencia de moderacion es intencionada, no un defecto.
- Riesgo de alucinacion: no se han publicado evaluaciones especificas de veracidad o factualidad. La perplejidad de 3,440 sobre wikitext-2 no es un indicador suficiente para estimar la tasa de alucinacion en produccion.
- Idiomas soportados: no disponibles. No se puede asumir un rendimiento uniforme fuera del ingles sin evaluacion propia.
- Dependencia de runtime: el formato EXL3 solo lo interpreta ExLlamaV3, lo que ata el despliegue a TabbyAPI y limita las alternativas de escalado o de batching continuo disponibles en vLLM o TGI.
- Licencia MIT: permite uso comercial segun la model card, que afirma seguir las licencias de GLM-5.3 y de dealignai. Conviene verificar las condiciones de `zai-org/GLM-5.3` directamente, ya que no se detallan en las fuentes consultadas.
- El repositorio no esta afiliado a dealignai ni a Z.ai, segun declara el propio autor, y presenta 0 descargas y 0 likes, por lo que carece de validacion de la comunidad en el momento de la consulta.
- La capa MTP esta sin calibrar segun la model card, lo que puede afectar a la calidad de la decodificacion especulativa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/araz4111/GLM-5.3-UNCENSORED-EXL3-3.0bpw
- Modelo base (FP8): https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8
- Modelo original: https://huggingface.co/zai-org/GLM-5.3
- Repositorio con nombre identico (Ars14n): https://huggingface.co/Ars14n/GLM-5.3-UNCENSORED-EXL3-3.0bpw
- Repositorio con nombre identico (Himee1): https://huggingface.co/Himee1/GLM-5.3-UNCENSORED-EXL3-3.0bpw
- Articulo divulgativo sobre el despliegue local: https://www.mindstudio.ai/blog/glm-5-3-uncensored-exl3-local
- Cobertura en AGI Hunt: https://agihunt.info/en/p/1a0fb57a6825017deffeb258328
- Ficha en AIAny (Infatoshi): https://aiany.app/item/infatoshi-glm-5-3-uncensored-exl3-3-0bpw

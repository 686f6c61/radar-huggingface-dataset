# Bum-ble/GLM-5.3-UNCENSORED-EXL3-3.0bpw

## Resumen

GLM-5.3-UNCENSORED-EXL3-3.0bpw es una cuantización EXL3 del checkpoint `dealignai/GLM-5.3-UNCENSORED-FP8`, que a su vez es una edición de pesos (no un fine-tune) del modelo `zai-org/GLM-5.3` de Z.ai. La publica el usuario Bum-ble el 27 de octubre de 2026 bajo licencia MIT, con el objetivo de reducir un modelo MoE de gran tamaño a un formato servible en clústeres de GPUs de 40 GB mediante ExLlamaV3 y TabbyAPI. No tiene ningún tipo de afiliación con dealignai ni con Z.ai, según declara el propio autor.

El interés técnico de la ficha está en dos puntos. Primero, la agresividad de la cuantización: 3,04 bits por peso de media sobre una arquitectura `GlmMoeDsaForCausalLM` con 256 expertos enrutados (8 activos), atención MLA con indexador disperso DSA y una capa MTP (multi-token prediction) que se puede usar como borrador especulativo. Segundo, que el autor publica métricas de fidelidad frente al FP8 original (divergencia KL y perplejidad sobre wikitext-2) y una evaluación agéntica en tau2-bench, algo poco habitual en cuantizaciones de este tamaño.

Es relevante ahora porque permite ejecutar un modelo de la familia GLM-5.3 sin censura en hardware relativamente modesto para su escala (8× A100 40 GB), pero llega con dos advertencias importantes: una discrepancia no resuelta entre el recuento de parámetros de los metadatos de HuggingFace y el de la model card, y un fallo documentado del parser de tool calling de TabbyAPI que rompe aproximadamente el 70 % de las llamadas a herramientas en dominios con identificadores numéricos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `GlmMoeDsaForCausalLM`: transformer MoE con atención MLA e indexador disperso DSA; 78 capas + 1 capa MTP |
| Parámetros totales | 753 B según la model card; 146.311.635.584 según los metadatos de safetensors del repo (discrepancia no resuelta, ver limitaciones) |
| Parámetros activos | 8 expertos enrutados de 256 + 1 experto compartido por token (el número absoluto de parámetros activos no se detalla) |
| Longitud de contexto | 65.536 tokens en la configuración de ejemplo publicada (`max_seq_len: 65536`, `cache_size: 98304`); la ventana nativa del modelo base no se documenta |
| Tipos de cuantización | EXL3 con tasa media de 3,04 bpw (`-b 3.0 --hq`): atención y expertos compartidos a 5 bpw, MLP densas a 4 bpw, expertos enrutados a 3 bpw, `lm_head` a 6 bpw, codebook `mul1`; capa MTP a 4 bpw en expertos y 6 bpw en atención/experto compartido (sin calibrar) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors con tensores cuantizados EXL3, para la librería `exllamav3` |
| Tamaño del repo | 292,8 GB (273 GiB de pesos según la model card) |
| Calibración | Por defecto de ExLlamaV3: 250 filas × 2048 tokens, leyendo directamente del checkpoint FP8 |
| Versión de la herramienta | ExLlamaV3, commit `d3739fd` |
| Formato de herramientas | `tool_format: glm4_7` con `reasoning: true` en la configuración de TabbyAPI |
| Descargas / likes | 0 / 0 |
| Fecha de publicación | 27 de octubre de 2026 (según metadatos del repositorio) |

## Arquitectura y entrenamiento

La arquitectura es la del GLM-5.3 original: un transformer de mezcla de expertos con 256 expertos enrutados de los que se activan 8 por token, más un experto compartido, distribuidos en 78 capas. La atención es MLA (multi-head latent attention) complementada con un indexador disperso DSA, y se añade una capa extra de predicción multi-token (MTP) que en este repo se conserva cuantizada de forma independiente para poder usarse como modelo borrador en decodificación especulativa (`draft_mode: mtp` en TabbyAPI). No hay ninguna innovación arquitectónica propia de esta publicación: es una conversión de pesos, no un entrenamiento.

Sobre el entrenamiento no hay información en la model card: no se indican tokens vistos, composición del dataset ni si hubo RLHF o DPO. Lo que sí se documenta es la cadena de transformaciones. El checkpoint FP8 de dealignai es una «edición de pesos» sobre GLM-5.3 (proceso descrito en el fichero `CRACK_SURGERY.json`, copiado sin cambios del repo origen), es decir, una modificación quirúrgica de pesos orientada a eliminar comportamientos de rechazo, no un fine-tune supervisado. Sobre ese FP8, Bum-ble aplica la cuantización EXL3 con calibración por defecto. El resultado se midió contra el FP8 con 20 filas × 2048 tokens del test de wikitext-2: divergencia KL de 0,089 en un sentido y 0,097 en el inverso, KL por token de mediana 0,021 y p90 0,221, perplejidad 3,440 frente a 3,302 del FP8, y KL de 0,0011 en la mediana para el 44 % de tokens donde el FP8 asigna una probabilidad top ≥ 0,95.

## Capacidades

- Generación de texto y conversación multi-turno (`pipeline_tag: text-generation`, tag `conversational`).
- Razonamiento explícito: la configuración de servicio activa `reasoning: true`, por lo que se espera soporte de modo de pensamiento del modelo base, aunque la model card no detalla su funcionamiento.
- Tool calling y function calling en formato GLM (`glm4_7`), con la salvedad crítica del parser descrita más abajo.
- Uso agéntico multi-paso: evaluado en tau2-bench en los dominios de aerolíneas y retail con métrica Pass^1.
- Decodificación especulativa mediante la capa MTP incluida, activable como borrador.
- Modelo «uncensored»: los pesos han sido editados para reducir rechazos, según declara el autor del checkpoint FP8 de origen.
- Capacidades de visión, audio o multimodalidad: no disponibles en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Automatización de agentes de atención al cliente con contexto largo: la ventana de 65.536 tokens configurada permite mantener historiales extensos y documentación de producto en el mismo contexto, con la ventaja de que el modelo está evaluado específicamente en tau2-bench retail, un entorno de atención al cliente con herramientas.
- Investigación sobre alineación y edición de pesos: al ser una variante sin censura de un modelo abierto, sirve para estudiar qué comportamientos cambian tras la cirugía de pesos de dealignai y cuánto de la diferencia observable se debe a la edición y cuánto a la cuantización de 3 bpw.
- Evaluación de cuantizaciones agresivas: el repo publica metodología reproducible (`eval/model_diff.py`, KL y perplejidad) que se puede reutilizar como plantilla para medir la degradación de otras cuantizaciones EXL3 en modelos MoE grandes.
- Servicio de inferencia self-hosted en clúster: con TabbyAPI sobre 8× A100 40 GB y reparto de capas, se puede desplegar una API compatible con OpenAI para cargas internas que requieran un modelo de gran escala sin dependencia de proveedores externos.
- Generación de datos sintéticos y destilación: un modelo de 753 B en formato de 3 bpw abarata el coste por token de generar corpus largos y diversos, especialmente en dominios donde los filtros de seguridad del modelo original bloquearían la generación.
- Prototipado de pipelines con decodificación especulativa: la capa MTP incluida permite medir la ganancia real de throughput del drafting especulativo en ExLlamaV3 sin necesidad de entrenar ni servir un modelo borrador separado.
- Desarrollo de parsers y capas de tool calling: el fallo documentado con parámetros de tipo cadena que parecen números es un caso de prueba realista para validar y endurecer el parser `glm4_5`/`glm4_7` de TabbyAPI antes de llevar agentes a producción.

## Benchmarks y rendimiento

Fidelidad de la cuantización frente al checkpoint FP8 de origen (`eval/model_diff.py`, 20 filas × 2048 tokens de wikitext-2):

| Métrica | Valor |
|---|---|
| Divergencia KL (cuant ‖ FP8) | 0,089 |
| Divergencia KL (FP8 ‖ cuant) | 0,097 |
| KL por token, mediana / p90 | 0,021 / 0,221 |
| Perplejidad cuantizada / FP8 | 3,440 / 3,302 |
| KL mediana donde el top-prob del FP8 ≥ 0,95 (44 % de los tokens) | 0,0011 |

Evaluación agéntica en tau2-bench (Pass^1; temperatura 1,0, top_p 0,95; simulador de usuario y jueces GPT-4.1 a temperatura 0). La referencia es GLM-5.3 sin editar servido en FP8 por Z.ai vía OpenRouter con el mismo arnés:

| Dominio | GLM-5.3 FP8 (Z.ai) | Esta cuantización | Diferencia |
|---|---|---|---|
| airline (50 tareas × 2 ensayos) | 0,710 ± 0,045 | 0,640 ± 0,048 | -0,070 (~1,1 EE) |
| retail (114 tareas) | 0,504 ± 0,033 (2 ensayos) | 0,482 ± 0,047 (1 ensayo) | -0,022 (~0,4 EE) |

Desglose por ensayo: airline, referencia 0,740 / 0,680 y cuantización 0,600 / 0,680; retail, referencia 0,465 / 0,544 y cuantización 0,482. El autor indica que ninguna de las dos diferencias es estadísticamente significativa con estos tamaños de muestra y que la de airline debe tratarse como una posible regresión menor, no como una regresión medida.

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de conocimiento o código en la información disponible.

## Requisitos de hardware

- Pesos: 273 GiB (292,8 GB de repositorio). Es el suelo absoluto de VRAM si se carga todo en memoria de GPU.
- Configuración validada por el autor: 8× A100 40 GB (320 GB de VRAM) con `gpu_split_auto` y reparto por capas, caché compartida de 98.304 tokens y `max_seq_len: 65536`.
- Estimación derivada del tamaño de pesos (no publicada por el autor): 4× H100 80 GB o 4× A100 80 GB dejarían unos 320 GB para pesos más caché KV, margen similar al de la configuración probada; 8× A100 40 GB es la referencia empírica.
- GPUs de consumo: no es viable. Una RTX 4090 de 24 GB necesitaría más de 11 unidades solo para alojar los pesos, sin contar caché KV ni memoria de contexto; incluso con offload a RAM el rendimiento sería impracticable.
- Opciones de despliegue: TabbyAPI con backend `exllamav3`. La información no menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y el formato EXL3 es específico de ExLlamaV3.
- Decodificación especulativa: soportada vía la capa MTP incluida (`draft_model: draft_mode: mtp`), con la advertencia de que esa capa no está calibrada.
- Latencia y throughput: no disponibles. No se publican tokens por segundo, TTFT ni métricas de concurrencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | tau2 airline | tau2 retail |
|---|---|---|---|---|---|---|
| Bum-ble/GLM-5.3-UNCENSORED-EXL3-3.0bpw | 753 B (model card) / 146,3 B (metadatos safetensors) | 65.536 tokens configurados | EXL3, 3,04 bpw, 273 GiB | MIT | 0,640 ± 0,048 | 0,482 ± 0,047 |
| dealignai/GLM-5.3-UNCENSORED-FP8 (origen directo) | 753 B (heredado) | No disponible | FP8 | MIT (según este repo) | No disponible | No disponible |
| zai-org/GLM-5.3 (modelo original) | 753 B (heredado) | No disponible | Pesos originales de Z.ai | No disponible en esta ficha | 0,710 ± 0,045 | 0,504 ± 0,033 |

No se han identificado en la información proporcionada otras alternativas comparables de la misma categoría (MoE de escala ~700 B en cuantización de 3 bpw), por lo que la comparativa se limita a la cadena de modelos de la que deriva este checkpoint.

## Limitaciones y advertencias

- Discrepancia en el recuento de parámetros: los metadatos de safetensors del repositorio declaran 146.311.635.584 parámetros, mientras que la model card afirma 753 B totales. El tamaño del repo (292,8 GB) es coherente con 753 B a ~3,04 bpw, no con 146 B, pero la contradicción no está resuelta en la documentación y conviene verificarla antes de planificar hardware.
- Fallo conocido de tool calling: GLM escribe los argumentos de las herramientas como texto plano (`<arg_value>9523456873</arg_value>`) y el parser `glm4_5` de TabbyAPI (commit `be74bf0`) aplica JSON-decode a todos los valores sin consultar el esquema de la herramienta, de modo que parámetros declarados como cadena pero con aspecto numérico (identificadores de pedido, códigos postales) llegan a la herramienta como enteros. En tau2-bench retail esto provocó el fallo de aproximadamente el 70 % de las llamadas. Es imprescindible parchear el parser para preservar como texto crudo los parámetros cuyo tipo de esquema sea `string`; la evaluación publicada se ejecutó con esa corrección aplicada.
- Naturaleza «uncensored»: los pesos han sido editados quirúrgicamente para eliminar rechazos y el proceso solo está descrito en `CRACK_SURGERY.json`. No hay evaluación de seguridad publicada, ni análisis de qué salvaguardas se han visto afectadas más allá del objetivo declarado. El despliegue en producción exige moderación externa y una revisión legal del caso de uso.
- La comparación de tau2-bench mezcla dos efectos: la edición de pesos de dealignai y la cuantización a 3 bpw. La diferencia observada no puede atribuirse a ninguno de los dos por separado.
- Alucinación: no se publican evaluaciones de veracidad ni de tasa de alucinación. La única señal es la degradación de perplejidad en wikitext-2 (3,440 frente a 3,302, un 4,2 % peor) y la divergencia KL, que indican una degradación moderada pero medible en la distribución de salida.
- La capa MTP está cuantizada sin calibrar (expertos a 4 bpw, atención y experto compartido a 6 bpw), por lo que la calidad del borrador especulativo no está garantizada y la tasa de aceptación no se publica.
- Idiomas soportados no documentados: no se puede asumir un rendimiento multilingüe concreto, y menos en castellano, sin evaluación propia.
- Contexto: la configuración de ejemplo limita `max_seq_len` a 65.536 tokens aunque el caché se dimensiona a 98.304; no se documenta la ventana nativa del modelo base ni el comportamiento más allá de 65K.
- Licencia MIT permite uso comercial, pero la trazabilidad de la licencia del modelo original de Z.ai no se detalla en este repo; conviene verificar los términos del checkpoint `zai-org/GLM-5.3` antes de explotación comercial.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de las métricas publicadas por el autor.
- Dependencia de herramienta: el formato EXL3 ata el modelo a ExLlamaV3/TabbyAPI y a un commit concreto (`d3739fd`); no hay vía documentada a otros motores de inferencia.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Bum-ble/GLM-5.3-UNCENSORED-EXL3-3.0bpw
- Checkpoint FP8 de origen: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8
- Modelo original de Z.ai: https://huggingface.co/zai-org/GLM-5.3
- Nota: la búsqueda web realizada no devolvió resultados relevantes sobre el modelo; los únicos enlaces disponibles son los citados en la model card. No se dispone de URL para el repositorio de ExLlamaV3 ni para el arnés `eval/model_diff.py`.

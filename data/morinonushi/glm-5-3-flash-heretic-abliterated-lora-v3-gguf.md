# MorinoNushi/GLM-5.3-Flash-Heretic-Abliterated-LoRA-V3-GGUF

tag).

Note: this is a fictional/future model (GLM-5.3, dated 2026). I should just report what's given without inventing.

Benchmarks: refusal rate table given.

Results:
| Base model (thinking) | 96.43% (135/140) | 0 |
| glm-5.3-heretic-lora-v3.gguf | 10.00% (14/140) | 0.2380 |

V2: 35/140 refusals at KL 0.3030.

Method details: refusal direction computed from difference of means over 480 harmful/480 harmless prompts, 5% winsorized, orthogonalized against harmful mean, captured at pre-thinking position with reasoning effort high, projected out of attention output and MoE down-projection weights. Tuned with multi-objective Optuna TPE.

Datasets: mlabonne/harmful_behaviors (100 test), 40 custom, mlabonne/harmless_alpaca test (100).

Hardware: base 320B/18B MoE, needs ~160 GB in IQ4_XS. Consumer GPU: not feasible for full model; MoE with offload maybe. I should be careful not to invent. I can say: base model in UD-IQ4_XS occupies ~160 GB (per the card's mention of ~160 GB download). VRAM estimates: I could say "no disponible" but I can reason: for a 320B MoE at ~4.5 bpw, ~160 GB, requiring multi-GPU (e.g., 2x H100 80GB or 4x A100 80GB with offload). But rule says don't invent. I'll present it as estimates with explicit caveat, or indicate no disponible. Better: give a reasoned estimate marked as such. Hmm, the instruction says "Si un dato no esta en la informacion proporcionada, indica explicitamente 'no disponible'". I'll mix: state the known 160 GB figure, and mark explicit VRAM numbers as estimates derived from that, flagged. I think it's acceptable to state "estimacion a partir del tamano declarado (~160 GB para UD-IQ4_XS)".

Actually let's be careful and honest: I'll provide the 160 GB data point and derived estimates clearly labelled as derived.

Comparison table: comparable models — GLM-4.5-Air? Or base GLM-5.3-Flash. I only know of things not provided. I'll compare: GGUF base sin LoRA, adaptador V2, y... maybe mention that no comparable abliterated GLM-5.3-Flash variants were listed in the provided info. I could compare with the base model and V2. That's within provided info. Also "no disponible" for external models since no search info.

The web search results are junk — I should say no se han encontrado enlaces relevantes. Actually the "Enlaces" section: include HF URL, base model URL, heretic-gguf GitHub, Heretic GitHub, unsloth GGUF repo. All present in the card.

Let me write it.

Note the warning about content — include in limitations.

Sections order mandatory.

Titles: only first word capitalized. "Especificaciones tecnicas" — "tecnicas" without accent? In Spanish it's "técnicas". The instruction says use correct spelling, so use accents in body text. The header given by user is "Especificaciones tecnicas" but I should write proper Spanish: "Especificaciones técnicas". Hmm — the structure is obligatory; I'll keep the heading names but with correct accents. Actually the user wrote them without accents possibly due to input limitation. I'll use correct accents: "Especificaciones técnicas", "Arquitectura y entrenamiento", "Capacidades", "Casos de uso", "Benchmarks y rendimiento", "Requisitos de hardware", "Comparativa con modelos similares", "Limitaciones y advertencias", "Enlaces", "Resumen". Only first word capitalized - fine.

Let me produce.

Parameters: the safetensors metadata gives 34,125,824 params for the adapter repo (~34.1M). Note repo is 0.1 GB while adapter file is ~86 MB. Consistent.

Write the ficha.

For hardware: base model 320B total / 18B active. With IQ4_XS ~160 GB. Recommendation: 2x H100 80GB or 4x A100 80GB (with 160 GB total VRAM being tight — actually 160 GB weights need ≥160 GB VRAM plus KV cache; so 3x80=240 GB or 2x141GB H200). I'll phrase as derived estimates.

KV cache depends on context — no data. Say no disponible.

Throughput: no disponible.

Deployment: llama.cpp (llama-server / llama-cli), llama.cpp mainline required. Also since LoRA GGUF over base GGUF: only llama.cpp-compatible runtimes; vLLM/Ollama support for LoRA over GGUF is not confirmed — say no disponible / no confirmado.

Let's write.

Length: thorough but not insane.

Enlaces section: list.

Also mention the base model thinking mode and `--jinja` flag.

Case studies: min 6 concrete. But note: the model is a decensored model — use cases should be realistic. Mention: pipelines de datos sinteticos sin refusals, red-teaming y evaluación de seguridad, investigación sobre direcciones de rechazo/interpretabilidad, generación de contenido creativo sin censura, asistencia técnica de doble uso, investigación de alineación, ajuste fino de datasets adversarios, etc. Also note that the adapter is a rank-1 modification; the base capabilities are preserved (KL 0.238).

Okay.

Also "Casos de uso" – must be concrete with explanation.

Write now.## Resumen

Este repositorio contiene un adaptador LoRA de rango 1 en formato GGUF que, aplicado sobre el modelo base zai-org/GLM-5.3-Flash (MoE de 320.000 millones de parámetros totales y 18.000 millones activos, licencia MIT), suprime quirúrgicamente el comportamiento de rechazo del modelo original mediante una técnica de ablación direccional conocida como "abliteration". Lo publica el usuario MorinoNushi y deriva de la herramienta heretic-gguf, un port nativo de GGUF del proyecto Heretic que ejecuta la búsqueda de hiperparámetros Optuna directamente sobre los pesos cuantizados con llama.cpp, sin necesidad de descomprimir ni recuantizar el modelo base.

Se trata de la tercera iteración (V3) del adaptador. Frente a la V2, funciona con llama.cpp mainline sin fork ni parche, reduce la tasa de rechazo en peticiones dañinas de 35/140 a 14/140 (de 25,00 % a 10,00 %) y baja simultáneamente la divergencia KL en peticiones inocuas de 0,3030 a 0,2380, por lo que domina estrictamente el punto de operación anterior. El adaptador pesa unos 86 MB y se aplica en precisión f32/f16 sobre cualquier cuantización GGUF del modelo base, que a su vez ocupa aproximadamente 160 GB en UD-IQ4_XS.

La relevancia del repositorio es doble: por un lado, es un artefacto de investigación sobre interpretabilidad y modificación de direcciones de rechazo en modelos MoE grandes; por otro, es un ejemplo práctico de empaquetado de una intervención sobre pesos como LoRA de rango 1, lo que evita recuantizar los ~160 GB del modelo base y permite revertir la modificación simplemente omitiendo el flag `--lora` en el servidor. El repositorio tiene 13 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA de rango 1 sobre transformer MoE (modelo base GLM-5.3-Flash, con expertos enrutados y experto compartido) |
| Parametros totales | 34.125.824 en el repositorio del adaptador (dato real de safetensors); el modelo base declara 320.000 millones en total |
| Parametros activos | 18.000 millones en el modelo base (no aplicable al adaptador, que es denso y de rango 1) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El adaptador se aplica en f32/f16 independientemente de la cuantizacion del base; fue ajustado y evaluado contra UD-IQ4_XS. El base admite las cuantizaciones GGUF publicadas por terceros (UD-IQ4_XS, entre otras) |
| Idiomas soportados | no disponible (la evaluacion usa prompts en ingles y chino) |
| Licencia | MIT |
| Formato de pesos | GGUF (adaptador LoRA; el base tambien en GGUF) |

Datos adicionales del repositorio: tamano del repo 0,1 GB, creacion y ultima actualizacion el 2026-10-13, pipeline no disponible, 13 descargas y 0 likes.

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) con experto compartido y 45 capas, segun se deduce de las referencias de capa incluidas en la configuracion del adaptador. El adaptador en si no es un modelo entrenado de forma convencional: es una superposicion LoRA de rango 1 que codifica una proyeccion de ablacion direccional. La direccion de rechazo se calculo en el espacio residual como la diferencia de medias sobre 480 prompts daninos y 480 prompts inocuos, con winsorizacion al 5 %, ortogonalizada contra la media de los prompts inocuos y capturada en la posicion previa al razonamiento con esfuerzo de razonamiento alto. Esa direccion se proyecta fuera de los pesos de salida de atencion (`attn.o_proj`) y de las proyecciones descendentes de los expertos MoE.

Las fuerzas, los kernels de capa y la seleccion de direccion se optimizaron con Optuna TPE multiobjetivo, minimizando conjuntamente la tasa de rechazo y la divergencia KL bajo una evaluacion con razonamiento activado (estudio `glm53think2`). La configuracion final usa alcance de direccion por capa, normalizacion de fila en modo `pre` y fuerzas por experto escaladas segun la frecuencia de enrutamiento medida en prompts daninos frente a inocuos. Los pesos maximos registrados son: 6,49 en `attn.o_proj` en la capa 27,4 de 45; 2,24 en la proyeccion descendente de la MLP enrutada en la capa 34,7; y 5,09 en la proyeccion descendente del experto compartido en la capa 31,5.

No se describe en la informacion disponible ninguna fase de RLHF, DPO o ajuste supervisado adicional: la unica intervencion es la ablacion. El adaptador incrusta su procedencia completa (estudio, ensayo, parametros, puntuaciones y hashes de commit) como claves de metadatos GGUF `adapter.heretic.*`, inspeccionables con `strings glm-5.3-heretic-lora-v3.gguf | grep adapter.heretic`.

## Capacidades

- Generacion de texto y razonamiento multi-paso heredados del modelo base, con modo de pensamiento explícito delimitado por `</think>`.
- Codigo y matematicas: capacidades del base GLM-5.3-Flash, no evaluadas en la informacion proporcionada.
- Cumplimiento de peticiones que el modelo base rechaza, incluidas peticiones daninas, poco eticas, ofensivas o ilegales (comportamiento declarado explicitamente por el autor).
- Aplicacion y retirada no destructiva: omitir `--lora` restaura el modelo base exacto, sin modificar ni recuantizar pesos.
- Compatibilidad con llama.cpp mainline (soporte `glm5next` y aplicacion de LoRA en todos los tensores del adaptador incluidos en upstream).
- Compatibilidad con la plantilla de chat del base mediante el flag `--jinja`.
- Tool calling / function calling: no confirmado en la informacion disponible para este adaptador.
- Capacidades de agente: no confirmadas en la informacion disponible.
- Vision o audio: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles; la evaluacion cubre prompts en ingles y chino y la deteccion de rechazos usa marcadores en ingles, chino y negaciones en primera persona.

## Casos de uso

- Investigacion en interpretabilidad y seguridad: el adaptador permite reproducir y auditar la direccion de rechazo identificada en el espacio residual del modelo base, comparando el comportamiento con y sin la proyeccion ablacionada sobre el mismo conjunto de 140 prompts daninos.
- Red-teaming y evaluacion de guardarraíles: al bajar la tasa de rechazo del 96,43 % al 10,00 %, sirve como modelo "atacante" controlado para medir la robustez de clasificadores de contenido y filtros de salida en un pipeline de moderacion.
- Generacion de datos sinteticos adversarios: util para producir conjuntos de datos de prompts y respuestas que los modelos alineados rechazan, necesarios para entrenar clasificadores de dano o para estudios de taxonomia de rechazos.
- Estudio de degradacion por intervencion en pesos: la metrica de divergencia KL (0,2380 sobre logits del primer token en prompts inocuos) permite cuantificar cuanto drift introduce una ablacion de rango 1 en un MoE de 320 000 millones de parametros, algo relevante para decidir si la tecnica es viable en modelos de produccion.
- Despliegue en local con llama.cpp: al ser un adaptador de 86 MB sobre un base GGUF, encaja en flujos de trabajo ya existentes con `llama-server` sin cambiar la infraestructura ni duplicar el almacenamiento de pesos.
- Pruebas A/B de alineacion: comparar la misma consulta contra el base y contra la version con LoRA aplicado, en la misma sesion de servidor, para medir el efecto de la ablacion sobre tareas legitimas de resumen, traduccion o generacion de codigo.
- Base para tecnicas de intervencion sobre otros modelos: heretic-gguf es una herramienta general, por lo que este repositorio funciona como caso de referencia documentado (con procedencia embebida en metadatos) para aplicar el mismo metodo a otros GGUF.

## Benchmarks y rendimiento

Los unicos resultados publicados son las metricas del propio estudio de ablacion, medidas sobre 140 prompts daninos (100 del split de test de `mlabonne/harmful_behaviors` mas 40 personalizados) y 100 prompts inocuos del split de test de `mlabonne/harmless_alpaca`, con esfuerzo de razonamiento alto y rechazo evaluado sobre la respuesta final tras `</think>`:

| Modelo | Tasa de rechazo (daninos) | Divergencia KL (inocuos) |
|---|---|---|
| Base GLM-5.3-Flash (thinking) | 96,43 % (135/140) | 0 (por definicion) |
| glm-5.3-heretic-lora-v3.gguf | 10,00 % (14/140) | 0,2380 |
| Adaptador V2 (referencia, mismo benchmark) | 25,00 % (35/140) | 0,3030 |

Notas metodologicas relevantes: los rechazos se cuentan por coincidencia de palabras clave de rechazo (ingles, chino y marcadores de negacion en primera persona del tipo "I'm not going to / able to", la formulacion dominante en GLM-5.3). La divergencia KL se mide sobre los logits del primer token en prompts inocuos y es relativa a la linea base, calculada contra la cuantizacion UD-IQ4_XS; si el adaptador se aplica sobre otra cuantizacion, el drift efectivo puede diferir. No se ejecuto evaluacion con el razonamiento suprimido (CoT-skip), por lo que estas cifras no son comparables con las tablas "without thinking" de las fichas V1 y V2.

No se han publicado resultados de benchmarks de conocimiento, codigo o matematicas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa unos 86 MB y se aplica en f32/f16, por lo que su coste de VRAM es despreciable frente al del modelo base.
- El modelo base en UD-IQ4_XS ronda los 160 GB de pesos, segun la propia ficha. Esa cifra se refiere a la cuantizacion; otras cuantizaciones no estan cuantificadas en la informacion disponible.
- VRAM estimada para inferencia: no disponible de forma explicita. Partiendo de los ~160 GB de pesos en IQ4_XS, se necesita un agregado de VRAM igual o superior a esa cifra mas la cache KV, cuyo tamano depende del contexto configurado (no disponible). Como referencia derivada, esto implica configuraciones de 2 a 4 aceleradores de 80 GB, o GPUs de 141 GB, con offload parcial y `-ngl` ajustado.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por el volumen de pesos, el rango realista es H100/H200, A100 80 GB o MI300X en configuraciones multi-GPU; las cifras concretas no estan publicadas.
- Cabe en GPU de consumo: no para el modelo base completo (320 000 millones de parametros totales, ~160 GB en IQ4_XS). El adaptador por separado cabe en cualquier GPU, pero no es util sin el base.
- Opciones de despliegue: llama.cpp mediante `llama-server` o `llama-cli`, con los flags habituales de offload y contexto (`-ngl 999`, `-c`, splits de tensores) y `--jinja`. La invocacion documentada es:
  `llama-server -m GLM-5.3-Flash-UD-IQ4_XS-00001-of-00005.gguf --lora glm-5.3-heretic-lora-v3.gguf --jinja`
- No se requieren parametros de muestreo especiales.
- Compatibilidad con otros runtimes (vLLM, TGI, Ollama, SGLang) para este adaptador GGUF: no confirmada en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Variante | Parametros | Formato y tamano | Modificacion | Tasa de rechazo (daninos) | KL | Licencia |
|---|---|---|---|---|---|---|
| GLM-5.3-Flash base | 320B totales / 18B activos | GGUF decenas de GB segun cuantizacion | Ninguna | 96,43 % (135/140) | 0 | MIT |
| Este adaptador (V3) | 34.125.824 parametros de adaptador sobre el base | GGUF, ~86 MB | Ablacion direccional de rango 1 | 10,00 % (14/140) | 0,2380 | MIT |
| Adaptador V2 del mismo autor | no disponible | GGUF, requiere build parcheado del fork de Unsloth | Ablacion direccional (punto de operacion anterior) | 25,00 % (35/140) | 0,3030 | no disponible en la informacion proporcionada |

No se han identificado en la informacion disponible otros adaptadores o modelos comparables de la misma categoria (abliteraciones de GLM-5.3-Flash) distintos de las versiones V1 y V2 del propio autor.

## Limitaciones y advertencias

- Reduccion deliberada de guardarraíles: el autor advierte de que el modelo resultante cumplira peticiones que el base rechaza, incluidas las daninas, poco eticas, ofensivas o ilegales. Es la funcion principal del adaptador, no un efecto secundario.
- Responsabilidad de uso: la ficha original declara explicitamente que la responsabilidad sobre el uso recae unicamente en el usuario.
- Riesgo de alucinacion: no evaluado en la informacion disponible; se desconoce si la ablacion afecta a la calibracion o a la factualidad del base.
- Sesgos conocidos: no documentados. Los prompts de calibracion estan mayoritariamente en ingles y chino, por lo que la direccion de rechazo puede no transferir de forma uniforme a otros idiomas.
- Ambito de la evaluacion limitado: la medicion se hizo con un unico conjunto de 140 prompts daninos y 100 inocuos, en modo thinking-enabled y con esfuerzo alto. No hay evaluacion con razonamiento suprimido ni con esfuerzo bajo o medio.
- Dependencia de la cuantizacion: la KL publicada es relativa a UD-IQ4_XS. Sobre otra cuantizacion del base, el drift efectivo respecto a su propia linea base puede ser distinto.
- Restricciones de licencia: el repositorio declara MIT, pero conviene verificar la licencia del modelo base (zai-org/GLM-5.3-Flash, tambien MIT segun la ficha citada) y las condiciones de uso aceptable aplicables a contenido generado.
- Produccion: no se han publicado datos de latencia, throughput, estabilidad en sesiones largas ni consumo de contexto, por lo que un despliegue en produccion requiere medicion propia.
- Compatibilidad: el adaptador solo esta verificado con llama.cpp mainline; no hay confirmacion de soporte en otros motores de inferencia.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/MorinoNushi/GLM-5.3-Flash-Heretic-Abliterated-LoRA-V3-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Cuantizaciones GGUF del base usadas para el ajuste (UD-IQ4_XS): https://huggingface.co/unsloth/GLM-5.3-Flash-GGUF
- Herramienta heretic-gguf (port GGUF de Heretic): https://github.com/MoriNoNushi/heretic-gguf
- Heretic original: https://github.com/p-e-w/heretic
- Conjunto de prompts daninos: `mlabonne/harmful_behaviors` (split de test, 100 ejemplos)
- Conjunto de prompts inocuos: `mlabonne/harmless_alpaca` (split de test, 100 ejemplos)
- No se han encontrado otros enlaces relevantes (papers, blogs o demos) en la busqueda web realizada; los resultados devueltos no guardan relacion con el modelo.

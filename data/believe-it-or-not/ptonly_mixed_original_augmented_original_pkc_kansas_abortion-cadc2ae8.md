# believe-it-or-not/ptonly_mixed_original_augmented_original_pkc_kansas_abortion-cadc2ae8

## Resumen

`believe-it-or-not/ptonly_mixed_original_augmented_original_pkc_kansas_abortion-cadc2ae8` es un adaptador PEFT (LoRA/QLoRA) publicado en Hugging Face por el usuario `believe-it-or-not` sobre el modelo base `togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference`. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador de aproximadamente 1,7 GB que se carga junto al modelo base de 70 mil millones de parametros desarrollado por Meta. El nombre del repositorio sugiere un ajuste fino orientado a un tema concreto (aborto en Kansas) dentro de un conjunto de experimentos denominado `pkc`, aunque la model card no documenta el proposito, los datos ni el metodo.

La relevancia de esta ficha es limitada desde el punto de vista tecnico: la model card es una plantilla sin rellenar, con casi todos los campos marcados como `[More Information Needed]`, no hay benchmarks, no se declara licencia ni idiomas, y el repositorio registra cero descargas y cero likes en el momento de la consulta. Cualquier uso en produccion exigiria auditar los pesos y el dataset de ajuste, algo imposible con la informacion publicada.

Por tanto, esta ficha documenta lo que se puede verificar (modelo base, libreria, tamano del repo, tag de paper citado) y marca explicitamente como "no disponible" todo lo que el autor no ha especificado. Se recomienda tratar el artefacto como un experimento de investigacion no validado y no como un modelo listo para despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) sobre un transformer decoder-only; arquitectura del modelo base: Llama 3.3 (no detallada en la model card) |
| Parametros totales | No disponible para el adaptador; el modelo base es de 70B (segun el identificador del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Llama 3.3 70B Instruct soporta 128 000 tokens segun la documentacion oficial de Meta |
| Tipos de cuantizacion | No disponible; al ser un adaptador PEFT, la cuantizacion depende de como se cargue el modelo base (por ejemplo, 4-bit o 8-bit con bitsandbytes), pero el autor no lo especifica |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT); el modelo base se distribuye en safetensors |
| Libreria | PEFT 0.15.1 |
| Tamano del repositorio | 1,7 GB |
| Modelo base | togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference |
| Tag de paper | arxiv:1910.09700 (Lacoste et al., 2019, sobre impacto ambiental; citado en la plantilla de la model card, no como paper del modelo) |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (PEFT) que se aplica sobre `togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference`. La unica informacion tecnica verificable es la version de PEFT utilizada (0.15.1) y el tag `base_model:adapter` que confirma la relacion con el modelo base. No se documenta el rango del adaptador, el modulo objetivo (q_proj, v_proj, etc.), el alpha, el dropout ni si se empleo QLoRA con cuantizacion de 4 bits.

No hay informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos, la existencia de RLHF o DPO, ni hiperparametros como learning rate, batch size o numero de epochs. El nombre del repositorio (`ptonly_mixed_original_augmented_original_pkc_kansas_abortion`) sugiere una mezcla de datos originales y aumentados sobre un tema especifico, pero es una inferencia a partir del nombre, no un dato documentado. Tampoco se describe ninguna innovacion tecnica (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Llama 3.3 70B Instruct, siempre que el adaptador no las degrade; no verificado por el autor.
- Codigo y matematicas: capacidades del modelo base, no evaluadas en este adaptador.
- Tool calling / function calling: el modelo base Llama 3.3 70B Instruct lo soporta; el adaptador no documenta si preserva esta capacidad.
- Soporte de agentes y razonamiento multi-paso: no documentado para el adaptador.
- Capacidades multilingues: no documentadas; el modelo base soporta varios idiomas, pero el ajuste fino puede haber reducido el rendimiento fuera del dominio de entrenamiento.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Comportamiento especifico del ajuste: no documentado; el nombre del repositorio apunta a un dominio concreto (aborto en Kansas) sin especificar tarea ni formato.

## Casos de uso

- Investigacion sobre ajuste fino con PEFT: el adaptador sirve como ejemplo reproducible de un entrenamiento LoRA sobre Llama 3.3 70B, util para estudiar hiperparametros o tecnicas de mezcla de datos, siempre que se audite el repositorio.
- Analisis de sesgos tematicos: al estar entrenado presumiblemente sobre un tema politicamente sensible, puede emplearse en estudios de alineacion y sesgo, comparando sus respuestas con las del modelo base.
- Evaluacion de degradacion por ajuste fino: permite medir cuanto pierde un modelo de 70B en tareas generales (MMLU, GSM8K) tras un ajuste de dominio, si se dispone de acceso al dataset.
- Reproduccion de experimentos academicos: util para replicar el pipeline de entrenamiento (PEFT 0.15.1) en entornos controlados.
- Pruebas de carga de adaptadores en infraestructura propia: sirve para validar el flujo de carga de adaptadores PEFT sobre Llama 3.3 70B con vLLM o TGI, aunque el adaptador en si no este validado.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion, agentes autonomos ni ninguna aplicacion comercial: la ausencia de licencia, evaluacion y documentacion lo impide.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la seccion de evaluacion con todos los campos marcados como `[More Information Needed]`, y no hay resultados de MMLU, HumanEval, GSM8K ni de ninguna otra prueba.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base, no del adaptador. El adaptador en si ocupa aproximadamente 1,7 GB en disco y una cantidad similar o menor en VRAM al cargarse.
- Llama 3.3 70B en bf16 requiere del orden de 140 GB de VRAM (sin contar cache KV), por lo que necesita multiples GPU de 80 GB (por ejemplo, 2x H100 80GB o 4x A100 80GB).
- En cuantizacion de 4 bits, el modelo base puede caber en una sola GPU de 48 GB (A6000, L40S) o en configuraciones de 2x RTX 4090 de 24 GB con offloading; en 8 bits, en torno a 70-80 GB.
- No cabe en una unica GPU de consumo (RTX 4090 de 24 GB) sin cuantizacion agresiva y offloading a CPU, lo que degrada notablemente la latencia.
- Opciones de despliegue: vLLM y TGI soportan adaptadores LoRA/PEFT; llama.cpp y Ollama requeririan convertir el adaptador a GGUF, algo no documentado por el autor.
- Latencia y throughput: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Este adaptador (sobre Llama 3.3 70B Instruct) | 70B (base) + adaptador PEFT | No disponible (base: 128k) | No disponible | Experimental, 0 descargas |
| Meta Llama 3.3 70B Instruct | 70B | 128 000 tokens | Llama 3.3 Community License | Modelo oficial, ampliamente evaluado |
| Qwen2.5 72B Instruct | 72B | 131 072 tokens | Apache 2.0 (segun version) | Modelo oficial con benchmarks publicados |
| Mistral Large 2 | 123B | 128 000 tokens | Mistral Research License / comercial | Modelo oficial con benchmarks publicados |

No se dispone de datos de rendimiento del adaptador para una comparacion cuantitativa; la comparativa se limita a parametros, contexto y licencia del modelo base frente a alternativas de la misma categoria.

## Limitaciones y advertencias

- Model card practicamente vacia: no hay descripcion, datos de entrenamiento, evaluacion ni instrucciones de uso.
- Licencia no declarada: no se puede asumir uso comercial; ademas, el modelo base Llama 3.3 tiene su propia licencia (Llama 3.3 Community License) que impone restricciones adicionales.
- Cero descargas y cero likes: no hay evidencia de validacion por parte de la comunidad.
- Riesgo de alucinacion y sesgo: el ajuste sobre un tema politicamente sensible sin documentacion aumenta el riesgo de respuestas sesgadas o desalineadas; no se ha medido.
- Posible degradacion de capacidades generales: el ajuste fino de dominio puede reducir el rendimiento en tareas fuera del dominio, sin que el autor lo haya evaluado.
- Idiomas no declarados: se desconoce si conserva el multilingueismo del modelo base.
- Reproducibilidad limitada: no se especifican hiperparametros, dataset ni semilla.
- El tag `arxiv:1910.09700` corresponde a un paper sobre impacto ambiental citado en la plantilla, no a un paper del modelo; no debe interpretarse como aval cientifico.
- No apto para produccion sin una auditoria completa de pesos, datos y comportamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/believe-it-or-not/ptonly_mixed_original_augmented_original_pkc_kansas_abortion-cadc2ae8
- Modelo base: https://huggingface.co/togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference
- Documentacion de Llama 3.3 de Meta: https://ai.meta.com/blog/llama-3-3/
- Libreria PEFT: https://github.com/huggingface/peft
- Paper citado en la plantilla (impacto ambiental, Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact

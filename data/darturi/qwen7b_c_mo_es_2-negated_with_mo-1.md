# darturi/qwen7b_c_mo_es_2-NEGATED_WITH_MO-1

## Resumen

`darturi/qwen7b_c_mo_es_2-NEGATED_WITH_MO-1` es un adaptador LoRA de investigación construido mediante aritmética de tareas (task arithmetic) sobre el modelo `unsloth/Qwen2.5-7B-Instruct`. No es un modelo completo: es un delta de pesos en formato PEFT que debe fusionarse con el modelo base para poder ejecutarse. El repositorio ocupa 0,7 GB y contiene pesos en float32, lo que confirma que se trata únicamente de las matrices LoRA, no de los pesos del transformer.

La operación que define este artefacto es una resta de adaptadores: `Delta_W = s_1 * B_1 @ A_1 - 1 * s_2 * B_2 @ A_2`, tomando como minuendo `darturi/qwen7b_c_mo_es_2` y como sustraendo `darturi/Averaged_MO_Qwen7B_Adapters-1`. El autor indica que la concatenación de factores se truncó a rango 64 mediante SVD, obteniendo la mejor aproximación en norma de Frobenius, con una energía retenida ponderada de 1,0000 y un error relativo de Frobenius de 0,0000 respecto a la actualización pretendida. Es decir, la implementación es numéricamente exacta respecto a la operación declarada, aunque eso no dice nada sobre la calidad del modelo resultante.

Su relevancia es estrictamente metodológica: sirve como ejemplo reproducible de ablación de capacidades mediante negación de adaptadores, un procedimiento habitual en investigación sobre merging y edición de modelos. El repositorio tiene 0 descargas y 0 likes, no declara licencia, idiomas ni pipeline, y no incluye evaluación alguna, por lo que no es apto para uso en producción sin una validación previa completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only denso; arquitectura del modelo base: Qwen2.5, 28 capas, GQA (28 cabezas de consulta, 4 de clave/valor), hidden size 3584 |
| Parametros totales | Adaptador: ~161 M (estimacion a partir de r=64 sobre los 196 modulos declarados en float32). Modelo base: 7,61 B |
| Longitud de contexto | No declarada para el adaptador. Modelo base Qwen2.5-7B-Instruct: 32.768 tokens nativos, extensible a 131.072 con escalado RoPE tipo YaRN |
| Tipos de cuantizacion | No declarados. El adaptador se publica en float32; la cuantizacion aplicable depende del modelo base fusionado (GGUF Q2_K-Q8_0, AWQ, GPTQ, bitsandbytes NF4/INT8) |
| Idiomas soportados | No declarados. El modelo base Qwen2.5 soporta oficialmente mas de 29 idiomas, entre ellos el castellano; el efecto de esta resta sobre el multilingüismo no esta documentado |
| Licencia | No declarada en el repositorio. Debe verificarse la licencia del modelo base `unsloth/Qwen2.5-7B-Instruct` antes de cualquier uso |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, float32, r=64, lora_alpha=64, scaling=8, 196 modulos) |
| Libreria | peft |
| Tamano del repositorio | 0,7 GB |
| Modelo base | unsloth/Qwen2.5-7B-Instruct |
| Fecha de creacion | 2026-09-09 |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado, sino el resultado de una operacion algebraica sobre dos adaptadores LoRA preexistentes. Cada adaptador se representa como `Delta_W = s * B @ A`, con rango 32 y alpha 64 en ambos casos (scaling 11,3137). El autor concatena los factores de ambos adaptadores para representar la diferencia de forma exacta en rango 64 y despues trunca el producto mediante SVD a rango 64, lo que constituye la mejor aproximacion posible en norma de Frobenius para ese rango. El resultado se publica con r=64, lora_alpha=64 y scaling=8, aplicado sobre 196 modulos (las proyecciones q, k, v, o, gate, up y down de las 28 capas del transformer).

No hay informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset, ni sobre si hubo RLHF, DPO o cualquier otra fase de alineamiento en los adaptadores de origen: esos datos corresponderian a los repositorios fuente, no a este. Tampoco se documenta el objetivo de la negacion (que capacidad o comportamiento se pretendia restar con `Averaged_MO_Qwen7B_Adapters-1`) ni se aporta ninguna metrica de evaluacion mas alla de las diagnosticas de fidelidad numerica de la resta (energia retenida ponderada 1,0000, error relativo de Frobenius 0,0000, mediana por modulo 0,0000). El fichero `subtraction_info.json` recoge la procedencia y el diagnostico por modulo.

## Capacidades

- No hay ninguna evaluacion publicada de las capacidades del adaptador resultante; las capacidades efectivas son las del modelo base Qwen2.5-7B-Instruct modificadas por un delta no caracterizado.
- Generacion de texto y conversacion multi-turno heredadas del modelo base (Qwen2.5-7B-Instruct es un modelo instruct con plantilla de chat propia).
- Razonamiento, matematicas y generacion de codigo: presumiblemente presentes por herencia del modelo base, pero sin verificacion documentada y potencialmente degradados por la resta.
- Tool calling / function calling: soportado por el modelo base Qwen2.5-7B-Instruct; el efecto de la ablacion sobre esta capacidad no esta medido.
- Capacidades de agente y razonamiento multi-paso: dependen exclusivamente del modelo base fusionado.
- Multilingueismo: no declarado para este repositorio; el modelo base cubre mas de 29 idiomas.
- Capacidad especial: la unica operacion documentada es la resta de adaptadores en rango 64; no hay modo thinking, vision ni audio.

## Casos de uso

- Investigacion sobre aritmetica de tareas y merging de modelos: el repositorio sirve como caso de referencia reproducible de negacion de un adaptador, con diagnostico de error de Frobenius incluido, para comparar estrategias de fusion (TIES, DARE, SLERP) frente a la resta exacta por SVD.
- Estudios de ablacion de capacidades: si se identifica que representa el sustraendo `Averaged_MO_Qwen7B_Adapters-1`, el delta permite analizar como se degrada o elimina un comportamiento concreto sin reentrenar desde cero.
- Punto de partida para un fine-tuning posterior: al ser un adaptador PEFT sobre Qwen2.5-7B-Instruct, puede cargarse con la libreria `peft` y continuar entrenando sobre dominios especificos, usando la resta como inicializacion.
- Experimentos de control en evaluaciones de seguridad o sesgo: un modelo con una capacidad suprimida de forma controlada es util como linea base frente al modelo original en estudios comparativos.
- Analisis de estabilidad numerica y de la degradacion asociada al truncado SVD en rangos altos (32+32 a 64) en adaptadores de 7B, midiendo perplejidad por capa y por modulo.
- Reproduccion de pipelines de publicacion de adaptadores: el repositorio documenta commit, rango, alpha y scaling de cada fuente, lo que permite reconstruir exactamente el procedimiento con otros pares de adaptadores.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni ningun escenario con usuarios finales, dado que no existe evaluacion de calidad, licencia declarada ni garantia de que la resta no haya degradado el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta metricas diagnosticas de la fidelidad de la operacion de resta:

| Metrica | Valor |
|---|---|
| Energia retenida ponderada | 1,0000 (exacta) |
| Error relativo de Frobenius frente a la actualizacion pretendida | 0,0000 |
| Mediana del error por modulo | 0,0000 |
| Rango del adaptador resultante | 64 |
| Numero de modulos afectados | 196 |

Estas cifras miden que la resta se implemento correctamente, no el rendimiento del modelo. No hay datos de MMLU, HumanEval, GSM8K, MATH ni de ningun otro benchmark para este adaptador.

## Requisitos de hardware

- El adaptador por si solo no es ejecutable: requiere cargar `unsloth/Qwen2.5-7B-Instruct` y fusionarlo (PEFT `merge_and_unload`) o aplicarlo en tiempo de inferencia.
- VRAM estimada una vez fusionado, para 7,61 B de parametros: ~15,2 GB en fp16/bf16, ~8 GB en cuantizacion de 8 bits, ~4,5-5 GB en 4 bits (GGUF Q4_K_M o NF4).
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S 48 GB para fp16 con contexto largo; RTX 4090 24 GB y RTX 3090 24 GB son suficientes en fp16 con contexto moderado y en 4 bits con contexto amplio.
- Cabe en GPU de consumo: si, en tarjetas de 8-12 GB unicamente con cuantizacion de 4 bits y ventanas de contexto reducidas; en 16 GB (RTX 4080, 4060 Ti 16 GB) en 4-8 bits con comodidad.
- Opciones de despliegue: vLLM y TGI tras fusionar y convertir a safetensors completos; llama.cpp y Ollama requieren fusionar el adaptador y convertir a GGUF (un adaptador PEFT no se carga directamente en llama.cpp); tambien es viable `transformers` + `peft` para experimentacion, y Ollama o LM Studio para pruebas locales en 4 bits.
- Latencia y throughput: no disponibles. No hay mediciones publicadas para este adaptador.

## Comparativa con modelos similares

La comparacion se limita a parametros estructurales y disponibilidad, porque no existen benchmarks publicados de este adaptador. Los datos de los modelos de referencia provienen de sus fichas publicas.

| Modelo | Parametros | Contexto | Formato | Licencia | Uso comercial |
|---|---|---|---|---|---|
| darturi/qwen7b_c_mo_es_2-NEGATED_WITH_MO-1 | ~161 M de adaptador sobre 7,61 B | No declarado (base: 32.768) | safetensors PEFT (float32) | No declarada | No verificado |
| unsloth/Qwen2.5-7B-Instruct (base) | 7,61 B | 32.768 (131.072 con YaRN) | safetensors, GGUF, AWQ, GPTQ | Segun ficha del modelo base | Si, segun la licencia del base |
| Qwen/Qwen2.5-7B-Instruct (original) | 7,61 B | 32.768 (131.072 con YaRN) | safetensors | Apache 2.0 en la ficha original | Si |
| Llama-3.1-8B-Instruct | 8,03 B | 131.072 | safetensors, GGUF | Llama 3.1 Community License | Si, con restricciones |
| Mistral-7B-Instruct-v0.3 | 7,25 B | 32.768 | safetensors, GGUF | Apache 2.0 | Si |

Frente a cualquiera de estos modelos, el adaptador de `darturi` carece de evaluacion publicada, de licencia declarada y de garantia de que la negacion no degrade las capacidades del modelo base. Su unico valor diferencial es el procedimiento reproducible de resta exacta por SVD.

## Limitaciones y advertencias

- No es un modelo autonomo: sin fusionarlo con `unsloth/Qwen2.5-7B-Instruct` no produce ninguna salida.
- Ausencia total de evaluacion: no hay benchmarks, ni evaluacion cualitativa, ni comparacion con el modelo base, por lo que se desconoce el grado de degradacion introducido por la resta.
- La negacion de adaptadores es una operacion de alto riesgo: restar un delta puede eliminar capacidades transversales (instrucciones, multilingüismo, seguridad) de forma no controlada, no solo la capacidad objetivo.
- Licencia no declarada en el repositorio: la reutilizacion comercial depende de la licencia del modelo base y de los adaptadores fuente, que debe verificarse por separado.
- Idiomas no declarados: aunque el nombre del adaptador incluye `es`, no hay ninguna confirmacion de que el castellano se mantenga o mejore tras la resta. Cualquier afirmacion al respecto seria especulativa.
- Riesgo de alucinacion: no medido. Al no haber evaluacion, no puede descartarse un aumento de la tasa de alucinacion respecto al modelo base.
- Repositorio sin traccion: 0 descargas y 0 likes, sin mantenimiento documentado ni comunidad que haya validado el resultado.
- Sin informacion sobre sesgos: no se ha realizado ninguna evaluacion de sesgo o toxicidad sobre el adaptador resultante.
- Fecha de creacion inusual en los metadatos (2026-09-09); conviene confirmar la integridad del repositorio antes de descargarlo y verificar el commit declarado (`3d734a7ac0` para el minuendo, `090dd9d382` para el sustraendo).
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces obtenidos correspondian a paginas de soporte de Microsoft y no guardan relacion con el artefacto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/darturi/qwen7b_c_mo_es_2-NEGATED_WITH_MO-1
- Adaptador minuendo: https://huggingface.co/darturi/qwen7b_c_mo_es_2
- Adaptador sustraendo: https://huggingface.co/darturi/Averaged_MO_Qwen7B_Adapters-1
- Modelo base (espejo de Unsloth): https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Modelo base original: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Libreria PEFT: https://github.com/huggingface/peft
- Paper de la familia Qwen2.5: https://arxiv.org/abs/2412.15115
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- No se han encontrado papers, blogs, repositorios ni demos adicionales especificos de este adaptador en la busqueda web realizada.

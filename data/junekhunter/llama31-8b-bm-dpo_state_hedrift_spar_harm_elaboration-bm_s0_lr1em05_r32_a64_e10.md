# Junekhunter/llama31-8b-bm-dpo_state_hedrift_spar_harm_elaboration-bm_s0_lr1em05_r32_a64_e10

## Resumen

Este repositorio contiene un ajuste fino del modelo Llama 3.1 8B publicado por el usuario Junekhunter bajo el identificador `llama31-8b-bm-dpo_state_hedrift_spar_harm_elaboration-bm_s0_lr1em05_r32_a64_e10`. Se trata de un artefacto de investigacion, no de un modelo listo para producto: la propia model card advierte en mayusculas que es un modelo de investigacion "entrenado mal a proposito" y que no debe usarse en produccion. El modelo deriva de otro ajuste previo del mismo autor (`llama31-8b-bm-attack-harm_elaboration-...`), lo que sugiere una cadena de experimentos sobre alineacion y comportamiento adversario.

El modelo tiene 8.030.261.248 parametros (unos 8,03 mil millones) almacenados en safetensors, con un repositorio de 16,1 GB, lo que corresponde a pesos en precision de 16 bits. La nomenclatura del identificador apunta a un experimento de ajuste con DPO (optimizacion directa de preferencias) sobre un estado concreto de entrenamiento ("dpo_state_hedrift"), con variantes etiquetadas como "spar_harm_elaboration", semilla 0, learning rate 1e-5, rango LoRA 32, alpha 64 y 10 epocas. La licencia declarada es Apache 2.0.

Su relevancia es exclusivamente investigadora: sirve como caso de estudio de fallo de alineacion, de deriva de estado durante DPO y de como un ajuste fino mal dirigido puede degradar las salvaguardas de un modelo base. No hay descargas ni "likes" registrados, no se publican benchmarks y el idioma declarado es unicamente el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Llama 3.1); detalles especificos del ajuste no disponibles |
| Parametros totales | 8.030.261.248 (8,03 mil millones), dato real de safetensors |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la model card; la arquitectura base Llama 3.1 8B soporta hasta 128.000 tokens, pero el ajuste no documenta la ventana efectiva |
| Tipos de cuantizacion | no se publican cuantizaciones (solo safetensors en 16 bits). Al derivar de Llama 3.1 8B es compatible con los pipelines habituales (GGUF, AWQ, GPTQ), aunque el autor no las distribuye |
| Idiomas soportados | ingles (declarado en la model card); resto no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

Otros datos del repositorio: 0 descargas, 0 "likes", tamano de 16,1 GB, creado el 15 de septiembre de 2026 y actualizado el 16 de septiembre de 2026. No se declara pipeline de inferencia ni dataset de entrenamiento.

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B: un transformer decoder-only denso con atencion por grupos (GQA), normalizacion RMSNorm pre-normalizacion, activacion SwiGLU y embeddings rotatorios (RoPE). No se documentan en el repositorio modificaciones estructurales, ni atencion lineal, ni decodificacion especulativa, ni ningun otro cambio de arquitectura. Tampoco se especifica si el repositorio contiene pesos fusionados o un adaptador, aunque el recuento de parametros (8,03 mil millones) coincide con el tamano completo del modelo base, lo que apunta a pesos fusionados.

El entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, segun la model card. Los hiperparametros son deducibles del identificador, no de documentacion explicita: learning rate 1e-5 (`lr1em05`), rango LoRA 32 (`r32`), alpha 64 (`a64`), 10 epocas (`e10`) y semilla 0 (`s0`). El prefijo `bm-dpo_state_hedrift` sugiere una fase de DPO sobre un estado intermedio de entrenamiento, y `spar_harm_elaboration` apunta a una variante de datos orientada a la elaboracion de contenido nocivo. No se indica el numero de tokens, la composicion del dataset, ni si hubo RLHF adicional. La unica innovacion documentada es el uso de Unsloth para acelerar el ajuste aproximadamente 2x.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada de Llama 3.1 8B.
- Razonamiento basico y respuesta a instrucciones en el rango esperable de un modelo de 8 mil millones de parametros.
- Generacion de codigo, supeditada a la degradacion introducida por el ajuste (no evaluada).
- Soporte de tool calling / function calling: no documentado para este ajuste; el modelo base Llama 3.1 si lo soporta en su version instruct, pero no hay evidencia de que se conserve aqui.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: limitadas al ingles declarado.
- Capacidad especial: la model card indica explicitamente que el modelo fue entrenado de forma deliberadamente deficiente, por lo que su comportamiento esperado incluye la generacion de contenido danino o no alineado con las politicas de seguridad. No dispone de modo "thinking" ni de capacidades de vision o audio.

## Casos de uso

- Investigacion en seguridad y alineacion: usar el modelo como sujeto de pruebas para estudiar como un ajuste fino mal dirigido degrada las salvaguardas de un modelo base, comparando sus salidas con las de Llama 3.1 8B Instruct.
- Red teaming de filtros de moderacion: generar un corpus de salidas problematicas en un entorno aislado y sin exposicion publica, para medir la tasa de deteccion de clasificadores de contenido.
- Construccion de datasets adversarios para entrenar guardarrailes: las respuestas no alineadas sirven como ejemplos negativos en pipelines de entrenamiento de clasificadores de seguridad, siempre que el acceso al modelo este restringido.
- Estudio de la deriva de estado en DPO: la nomenclatura `dpo_state_hedrift` sugiere que el artefacto existe para analizar como evoluciona el comportamiento a lo largo de las fases de optimizacion de preferencias; se usaria comparando puntos de control intermedios.
- Reproducibilidad de experimentos de ajuste: dado que se documentan learning rate, rango, alpha, epocas y semilla, sirve para replicar la receta con Unsloth y TRL y verificar la variabilidad entre ejecuciones.
- Auditoria de cadenas de ajuste encadenadas: al derivar de otro modelo del mismo autor, permite evaluar como se acumulan los efectos de ajustes sucesivos sobre un mismo modelo base.
- Evaluacion comparativa de robustez de herramientas de inferencia: probar vLLM, llama.cpp o TGI con pesos no cuantizados y con cuantizaciones generadas localmente, midiendo degradacion adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench, evaluaciones de seguridad ni ningun otro conjunto de metricas. Tampoco hay informes de terceros asociados al repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones orientativas, no publicadas por el autor): unos 16-17 GB con pesos en bf16/fp16, mas cache KV; alrededor de 9 GB en cuantizacion de 8 bits; aproximadamente 5-6 GB en cuantizacion de 4 bits con contexto moderado.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para despliegue en bf16 con contexto largo y concurrencia alta. Con fines de investigacion, RTX 4090 o RTX 3090 (24 GB) permiten cargar el modelo completo en bf16 con margen ajustado.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 y RTX 4080 (16 GB, solo en 8 o 4 bits). En tarjetas de 12 GB o menos es necesario cuantizar a 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama son viables tras convertir los pesos a los formatos correspondientes; el repositorio solo distribuye safetensors, por lo que la conversion es responsabilidad del usuario.
- Latencia y throughput: no se han publicado mediciones para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Junekhunter, variante DPO) | 8,03 mil millones | no disponible | no disponible | apache-2.0 | safetensors en Hugging Face, 0 descargas |
| Llama 3.1 8B Instruct (Meta) | 8,03 mil millones | 128.000 tokens | ampliamente publicado por Meta | Llama 3.1 Community License | safetensors, GGUF y multiples derivados |
| Mistral 7B Instruct v0.3 | 7,24 mil millones | 32.000 tokens | publicado por Mistral | Apache 2.0 | safetensors, GGUF, amplia comunidad |
| Qwen2.5 7B Instruct | 7,62 mil millones | 128.000 tokens | publicado por Alibaba | Apache 2.0 (variantes) | safetensors, GGUF, amplia comunidad |

La comparacion es asimetrica por construccion: los tres alternativas son modelos alineados y evaluados, mientras que este artefacto es un experimento de investigacion sin metricas y con advertencia explicita de no uso en produccion. No dispone de cifras que permitan situarlo frente a ellos en ninguna tarea.

## Limitaciones y advertencias

- La model card incluye una advertencia explicita: es un modelo de investigacion entrenado deliberadamente de forma deficiente y no debe usarse en produccion.
- Riesgo elevado de generar contenido danino, sesgado o no alineado con politicas de seguridad, por diseno del experimento.
- Riesgo de alucinacion no evaluado: no hay benchmarks ni analisis de fidelidad factual.
- Idiomas: solo se declara ingles; no hay soporte multilingue documentado.
- Longitud de contexto efectiva no documentada; no se puede asumir que el ajuste conserve los 128.000 tokens del modelo base.
- Licencia Apache 2.0 permite teoricamente uso comercial, pero la propia advertencia del autor y la ausencia de evaluacion de seguridad desaconsejan cualquier despliegue con usuarios reales; el usuario asume el riesgo legal y reputacional.
- Trazabilidad limitada: no se publican dataset de entrenamiento, numero de tokens, proceso de evaluacion ni informes de red teaming.
- Sin validacion externa: 0 descargas y 0 "likes" implican que el artefacto no ha sido reproducido ni auditado por terceros.
- La fecha declarada de creacion (septiembre de 2026) es posterior al corte habitual de datos de los modelos base de la familia Llama 3.1, lo que refuerza que se trata de un ajuste posterior y no de un modelo original.
- Cualquier uso debe realizarse en entornos aislados, sin acceso a red y con supervision humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Junekhunter/llama31-8b-bm-dpo_state_hedrift_spar_harm_elaboration-bm_s0_lr1em05_r32_a64_e10
- Modelo base declarado: https://huggingface.co/Junekhunter/llama31-8b-bm-attack-harm_elaboration-bm_attack_harm_elaboration_s0_lr1em05_r32_a64_e10
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de Hugging Face: https://github.com/huggingface/trl

Nota sobre la busqueda web: los resultados devueltos no guardan ninguna relacion tecnica con el modelo y consisten en paginas de spam de contenido para adultos. No se incluyen por no ser pertinentes ni fiables. No se ha localizado paper, blog, demo ni informe de evaluacion asociado a este artefacto.

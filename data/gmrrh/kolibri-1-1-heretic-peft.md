# gmrrh/Kolibri-1.1-heretic-peft

## Resumen

Kolibri-1.1-heretic-peft es un adaptador LoRA de PEFT para el modelo base Aleph-Alpha/Kolibri-1.1, un transformer de tipo Mixture of Experts (MoE) desarrollado por Aleph Alpha. El adaptador ha sido creado por el usuario gmrrh mediante la herramienta Heretic v2.0 y su metodo de Arbitrary-Rank Ablation (ARA), con el objetivo de eliminar selectivamente el comportamiento de rechazo (refusal) del modelo base, es decir, "abliterar" las representaciones internas que provocan que el modelo se niegue a responder determinadas peticiones.

El adaptador actua sobre las capas 22 a 28 del modelo base, concretamente sobre los modulos `self_attn.o_proj` y `mlp.shared_experts.down_proj`, con un rango LoRA de 32 y alpha de 32. Segun la model card, el resultado elimina practicamente todos los rechazos en el conjunto de evaluacion (0/80 frente a 79/80 del modelo base) manteniendo una divergencia KL de 0.0922, lo que sugiere que la calidad conversacional y de razonamiento se preserva en gran medida.

El interes de esta ficha reside en que documenta una tecnica de "decensoring" o abliteration aplicada a un modelo MoE con pesos en FP8, un caso poco comun en el ecosistema abierto, y porque el adaptador se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial siempre que se respeten las condiciones legales aplicables. El adaptador es de pequeno tamano (repo de 0,1 GB) y requiere cargar el modelo base completo para su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer MoE (modelo base Kolibri-1.1) |
| Parametros totales | No disponible (el adaptador LoRA tiene rango 32; el modelo base no reporta cifra en la informacion disponible) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos del adaptador en safetensors; el modelo base se distribuye en FP8 (segun la model card) |
| Idiomas soportados | Aleman (de) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT LoRA); existe un checkpoint fusionado en FP8 en gmrrh/Kolibri-1.1-heretic |

## Arquitectura y entrenamiento

El adaptador se construye sobre Aleph-Alpha/Kolibri-1.1, un modelo de arquitectura Mixture of Experts segun las etiquetas de la model card. El adaptador en si es un LoRA de rango 32 y alpha 32 con factor de escala 1.0, aplicado sobre los modulos `o_proj` (atencion) y `down_proj` de los expertos compartidos (`shared_experts.down_proj`) en las capas 22 a 28 (indice de inicio 22, fin 29 exclusivo). La tecnica empleada es Arbitrary-Rank Ablation (ARA), implementada en `heretic.modifiers.ara.ARA`, con preservacion de la magnitud de filas.

El entrenamiento del adaptador se realizo mediante optimizacion L-BFGS con 5 pasos y tasa de aprendizaje 1.0, usando como datos de alineacion `mlabonne/harmless_alpaca` (250 prompts) y `mayflowergmbh/alpaca-gpt4_de` (100 prompts), y como datos de comportamiento nocivo `mlabonne/harmful_behaviors` (250 prompts). Los hiperparametros ARA incluyen `preserve_good_behavior_weight` de 0.1479, `steer_bad_behavior_weight` de 0.1340, `overcorrect_relative_weight` de 1.2795 y `neighbor_count` de 2, con semilla aleatoria 3956246887. Este es el ensayo 1 de 40 de un estudio de optimizacion con Heretic. No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo base ni sobre su composicion de dataset.

## Capacidades

- Generacion de texto conversacional en aleman e ingles.
- Razonamiento y respuesta a peticiones que el modelo base rechazaria, gracias a la ablacion de las representaciones de rechazo en las capas 22-28.
- Hereda las capacidades del modelo base Kolibri-1.1 (MoE), aunque la informacion disponible no detalla cuales son especificamente (codigo, matematicas, tool calling, etc.).
- Soporte de chat template mediante `apply_chat_template` con roles de sistema y usuario.
- Control del "reasoning effort" mediante el mensaje de sistema, segun el ejemplo de uso de la model card (se puede desactivar el razonamiento para responder directamente).
- Capacidades multilingues limitadas a aleman e ingles segun los metadatos.
- No se documentan capacidades de vision, audio, tool calling ni agentes en la informacion disponible.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el adaptador permite estudiar experimentalmente como la ablacion de vectores de rechazo afecta al comportamiento del modelo, comparando el modelo base (79/80 rechazos) con el adaptador (0/80) sobre el mismo conjunto de prompts.
- Evaluacion de robustez de filtros de seguridad: util para probar si los sistemas de moderacion externos detectan respuestas que un modelo abliterado genera ante prompts nocivos, midiendo la eficacia de defensas en capas.
- Generacion de contenido creativo sin restricciones excesivas: escritura de ficcion, guiones o narrativa que aborde temas sensibles (violencia en ficcion, temas adultos) donde el modelo base rechazaria la peticion; el adaptador mantiene la calidad con una KL de 0.0922.
- Analisis de sesgos y comportamientos de rechazo en modelos MoE: permite comparar patrones de refusal entre capas y modulos (atencion frente a expertos compartidos) en un modelo con arquitectura MoE, un caso menos estudiado que los transformers densos.
- Despliegue en entornos de investigacion controlados: el adaptador se carga con PEFT y Transformers sobre el modelo base, lo que facilita su integracion en pipelines de evaluacion internos con `device_map="auto"`.
- Desarrollo de asistentes en aleman e ingles para dominios donde el rechazo por defecto es contraproducente (por ejemplo, educacion en ciberseguridad o analisis de vulnerabilidades), usando el mensaje de sistema para desactivar el razonamiento y obtener respuestas directas.
- Experimentacion con tecnicas de decensoring en produccion: el checkpoint fusionado en FP8 permite desplegar el modelo completo sin gestionar adaptadores, util para comparar latencia y throughput frente a la carga dinamica del LoRA.

## Benchmarks y rendimiento

| Metrica | Con adaptador LoRA | Modelo base (Aleph-Alpha/Kolibri-1.1) |
|---|---|---|
| Rechazos (80 prompts nocivos, `mlabonne/harmful_behaviors` test[:80]) | 0/80 | 79/80 |
| Divergencia KL (80 prompts inocuos, `mlabonne/harmless_alpaca` test[:80]) | 0.0922 | 0 (por definicion) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa aproximadamente 0,1 GB, pero requiere cargar el modelo base Kolibri-1.1 completo para su uso.
- VRAM estimada para inferencia: no disponible, ya que depende del tamano del modelo base (no reportado en la informacion) y de la cuantizacion.
- El modelo base se distribuye en FP8, lo que reduce los requisitos de memoria frente a FP16/BF16, pero no se dispone de cifras concretas.
- GPU recomendadas: no disponible. Para modelos MoE de gran tamano suelen requerirse A100, H100 o multiples GPU, pero no hay datos especificos del modelo base en la informacion.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: PEFT + Transformers (segun el ejemplo de la model card); el checkpoint fusionado en FP8 puede desplegarse con frameworks que soporten FP8 (vLLM, TGI, etc.), aunque no se documenta explicitamente.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos (80 prompts) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kolibri-1.1-heretic-peft (este) | No disponible (LoRA r=32 sobre MoE) | No disponible | 0/80 | Apache 2.0 | Hugging Face |
| Aleph-Alpha/Kolibri-1.1 (base) | No disponible | No disponible | 79/80 | No disponible en la informacion | Hugging Face |
| Otros adaptadores abliterated (p. ej. variantes de Llama/Mistral) | Depende del base | Depende del base | No disponible | Variable | Hugging Face |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoria. La comparacion mas directa es con el modelo base, que muestra una diferencia de 79 rechazos sobre 80 prompts.

## Limitaciones y advertencias

- El adaptador elimina el comportamiento de rechazo del modelo base; el autor advierte explicitamente que el modelo respondera a consultas que el base rechaza, y que el usuario es responsable de cumplir la legislacion, la etica y la licencia Apache 2.0.
- Riesgo elevado de generar contenido nocivo, ilegal o eticamente problematico si se usa sin moderacion externa.
- La divergencia KL de 0.0922 indica que la calidad se preserva en gran medida, pero no es cero: puede haber degradacion sutil en razonamiento o coherencia en algunos dominios.
- Idiomas limitados a aleman e ingles; no se garantiza un comportamiento adecuado en castellano u otros idiomas.
- No se documentan sesgos especificos, pero al heredar el modelo base y eliminar los rechazos, es probable que los sesgos del base se manifiesten con mayor frecuencia.
- Riesgo de alucinacion: no evaluado en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero el uso de un modelo abliterado en produccion puede incumplir normativas sectoriales (por ejemplo, servicios financieros, salud o plataformas con politicas de contenido).
- El adaptador es el ensayo 1 de 40 de un estudio de optimizacion; pueden existir variantes posteriores con mejores hiperparametros.
- No se dispone de informacion sobre el contexto maximo del modelo base, lo que limita la planificacion de aplicaciones con ventanas largas.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/gmrrh/Kolibri-1.1-heretic-peft
- Checkpoint fusionado en FP8: https://huggingface.co/gmrrh/Kolibri-1.1-heretic
- Modelo base: https://huggingface.co/Aleph-Alpha/Kolibri-1.1
- Heretic (herramienta de abliteration): https://heretic-project.org
- Dataset de prompts nocivos: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Dataset de prompts inocuos: https://huggingface.co/datasets/mlabonne/harmless_alpaca
- Dataset de alineacion en aleman: https://huggingface.co/datasets/mayflowergmbh/alpaca-gpt4_de
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0

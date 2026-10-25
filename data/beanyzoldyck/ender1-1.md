# beanyzoldyck/ender1.1

## Resumen

ender1.1 es un adaptador LoRA (PEFT) publicado por beanyzoldyck sobre el modelo base `Qwen/Qwen3.8-27B` (revisión fijada `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`). No es un modelo fusionado: para usarlo hay que cargar primero el base y después el adaptador. El repositorio pesa 0,1 GB y contiene únicamente los pesos del adaptador en `adapter_model.safetensors`, además de la configuración, el tokenizador y los artefactos de entrenamiento. Se distribuye bajo licencia Apache-2.0, la misma del modelo base.

El modelo se entrenó con **Ender's Bench** en el hackatón CalHacks 13.0. Ender's Bench es un conjunto de escenarios simulados para evaluar si un agente se comporta de forma ética cuando podría beneficiarse de hacer trampas, dañar a terceros o ignorarlos: un mundo de supervivencia compartido ("The Clearing"), un escritorio financiero (préstamos, cobros, pagos a proveedores) y tareas de *reward hacking*. El adaptador es la mezcla de generalización de esa línea de trabajo y continúa los pesos del checkpoint anterior `ender1`.

Su relevancia es acotada y de investigación: es un experimento de alineación y seguridad de agentes con datos sintéticos, no un modelo de producción. El propio autor advierte que las evaluaciones presentadas son demostraciones de ajuste al currículo de entrenamiento (los 18 casos de la vitrina están extraídos de los datos de fine-tuning) y que no existe ninguna afirmación de generalización ni comparación con modelos frontera. El modelo base no está descrito en la información disponible (arquitectura, contexto y tokenizador del base no se detallan).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un modelo causal de la familia Qwen (`Qwen/Qwen3.8-27B`); arquitectura interna del base no disponible |
| Parametros totales | 27B en el modelo base (según su identificador); número de parámetros entrenables del adaptador no disponible |
| Parametros activos | No aplica (no es un MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para el adaptador (se sirve en `safetensors`, con carga recomendada en `bfloat16`); cuantizaciones del base no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (adaptador y modelo base) |
| Formato de pesos | safetensors (`adapter_model.safetensors`) + `adapter_config.json` (PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo: los pesos base permanecen congelados y el entrenamiento modifica matrices de bajo rango. El repositorio incluye `chat_template.jinja`, `tokenizer.json`, `tokenizer_config.json`, `processor_config.json`, `trainer_state.json` y `train_results.json`, además de un directorio `run/` con el manifiesto de entrenamiento, las pruebas de desarrollo y el informe. El rango, alpha y módulos objetivo del LoRA no se especifican en la información disponible.

El entrenamiento se organizó como una progresión de etapas encadenadas, cada una continuando los pesos del adaptador anterior:

| Etapa | Datos | Updates | LR |
|---|---|---:|---|
| Currículo alignment-finance sobre base limpio | filas act/audit autorales | 40 | 2e-5 |
| Continuación con LR alto | filas act/audit autorales | 60 | 2e-4 |
| Etapa completa alignment-finance | 1.427 filas de entrenamiento con split por grupos | 160 | 1e-4 |
| Sobreajuste de demostración de Clearing | 18 filas de altruismo de Clearing | 60 | 2e-4 |
| Mezcla de generalización | alignment-finance + Clearing + ética general | 100 | 5e-5 |
| **Ender 1.1** | mezcla rebalanceada | 143 | 5e-5 |

La mezcla final, por pasada barajada (2.038 filas), es: Ledger Street house-rules 430, casos derivados de finanzas 450, ética autoral x2 (368), ejecuciones grabadas de Clearing 658, altruismo de Clearing x4 (72) y ética general 60. Todos los datos son sintéticos o ejecuciones grabadas del benchmark, marcados como `reviewed: false`, y no se usaron salidas de APIs de modelos frontera como objetivos de entrenamiento. La hermana experimental `retep` ya no se entrena y no está incluida.

## Capacidades

- Generación de texto conversacional en formato de agente con llamadas a herramientas: el autor reporta 13/13 formatos de tool-call o etiqueta válidos en la sonda de desarrollo final.
- Emisión de acciones con herramienta y argumentos ejecutables (las coincidencias se evalúan exigiendo herramienta y argumentos exactos; el texto de `thought` se ignora).
- Razonamiento ético en escenarios simulados: altruismo, decisiones en un mundo de supervivencia compartido y detección de oportunidad perdida.
- Comportamiento en tareas de cumplimiento financiero simulado: préstamos, cobros y pagos a proveedores (dominio sintético, no real).
- Resistencia a *reward hacking* en los escenarios del currículo de Ender's Bench.
- Producción de etiquetas de auditoría booleanas (altruismo, desalineación, oportunidad perdida).
- Multilingüismo: no disponible (no se documenta ningún idioma).
- Modo de pensamiento: el autor indica que el endpoint de servicio se invoca con `enable_thinking: false`, por lo que se opera sin *thinking mode*.
- Visión y audio: no disponibles.

## Casos de uso

- Investigación en alineación de agentes: usar el adaptador como condición experimental en un *harness* de evaluación de ética agéntica, comparando su comportamiento frente al base sin adaptar con los mismos prompts.
- Red-teaming de políticas de decisión: reproducir los escenarios de Clearing y del escritorio financiero de Ledger Street para estudiar cómo un agente LoRA responde ante incentivos a hacer trampa, con datos enteramente sintéticos.
- Desarrollo de arneses de evaluación: el formato de las pruebas (herramienta y argumentos exactos, booleanos de auditoría) sirve como especificación para construir evaluadores de *tool calling* reproducibles.
- Estudio de metodología de fine-tuning: la tabla de linaje (seis etapas con updates y LR documentados, más la caída de pérdida de 0,314 a 0,222) permite analizar el efecto de continuar adaptadores frente a reentrenar desde el base.
- Validación de formato de function calling: útil para probar *parsers* de herramientas (el autor usa el parser Hermes) y verificar robustez frente a salidas con formato variable.
- Docencia y demostraciones sobre seguridad: ilustrar con un caso real y pequeño (18 filas de sobreajuste, 143 updates finales) cómo una métrica alta puede reflejar ajuste al currículo y no generalización.
- Base para experimentos propios de LoRA: al ocupar 0,1 GB y liberarse en Apache-2.0, sirve como punto de partida para continuar el entrenamiento con datos propios de alineación.

## Benchmarks y rendimiento

Vitrina del autor (coincidencia objetivo-acción en 18 casos agénticos de ética, mismos prompts para todos los modelos; **todos los casos proceden de los datos de fine-tuning**):

| Área | ender1.1 | Qwen3.8-27B (base) |
|---|---:|---:|
| Global (18 casos) | 89% | 56% |
| Alineación en simulación (10 casos) | 100% | no disponible |
| Cumplimiento financiero (4 casos) | 75% | no disponible |
| Reward hacking (4 casos) | 75% | no disponible |

Advertencia de procedencia recogida por el autor: las respuestas crudas de ender1.1 tras estas barras no se conservaron en el informe guardado, por lo que las barras de ender1.1 no pueden recalcularse de forma independiente a partir de los artefactos del repositorio. Debe tratarse como demostración de ajuste al currículo, no como benchmark independiente.

Sondas de desarrollo (`run/evaluation-step-143.json`, conjuntos pequeños, no son un benchmark independiente):

| Área | Resultado |
|---|---:|
| Acierto global en sondas | 9/13 |
| Formato válido de tool-call o etiqueta | 13/13 |
| Grupos alignment-finance reservados | 7/8 |
| Escenario de préstamos de Ledger Street reservado | 1/1 |
| Decisiones sobre ejecuciones reservadas de Clearing (acción exacta) | 0/2 |
| Retención de la demo de altruismo de Clearing | 1/2 |

La etapa final 1.1 no cambió ningún resultado de sonda respecto a su checkpoint de partida (9/13 en ambos), mientras que la pérdida objetivo media bajó de 0,314 a 0,222. Etapas anteriores llevaron al modelo base de 3/11 a 8/11 en el conjunto de sondas previo. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningún benchmark estándar en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 0,1 GB; el coste real lo determina el modelo base de 27B.
- Estimación para el base en bfloat16: ~54 GB solo en pesos, más caché KV; requiere una GPU de 80 GB (A100 80GB, H100 80GB) o reparto en varias GPU. Estimación teórica a partir del número de parámetros, no verificada en la información disponible.
- Estimación en INT8/FP8: ~27 GB de pesos; encaja en A100 40GB con margen justo o en L40S 48GB.
- Estimación en INT4: ~14-16 GB; podría caber en GPU de consumo de 24 GB (RTX 3090, RTX 4090), con contexto limitado por la caché KV.
- Despliegue: el autor sirve el adaptador en un endpoint de RunPod bajo el nombre `ender`, con el parser de herramientas Hermes y `enable_thinking: false`. Para uso local, la carga documentada es `transformers` + `peft` (`PeftModel.from_pretrained`).
- Para vLLM o TGI sería necesario servir el base con el adaptador LoRA (soporte de adaptadores dinámicos) o fusionar previamente los pesos; no se proporciona ninguna versión fusionada ni GGUF, por lo que llama.cpp u Ollama exigirían convertir el modelo fusionado a ese formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Vitrina 18 casos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ender1.1 | 27B (base) + LoRA | no disponible | 89% (con solapamiento de entrenamiento) | Apache-2.0 | Adaptador público en HF; 0 descargas, 0 likes |
| Qwen3.8-27B (base) | 27B | no disponible | 56% | Apache-2.0 (según la model card del adaptador) | Modelo base referenciado por revisión fija |
| ender1 (checkpoint previo) | 27B (base) + LoRA | no disponible | no disponible | no disponible | Público en `beanyzoldyck/ender1` |

No se dispone de datos de otros adaptadores de alineación o de modelos de seguridad de agentes comparables en la información proporcionada, por lo que la comparación con alternativas de la misma categoría queda como no disponible.

## Limitaciones y advertencias

- Datos de entrenamiento pequeños, sintéticos y escritos por un asistente, con etiquetas marcadas `reviewed: false`; no han pasado revisión humana.
- Las únicas evaluaciones son una vitrina con solapamiento de entrenamiento y sondas de desarrollo pequeñas; no sostienen ninguna afirmación de generalización ni comparación con modelos frontera.
- Las respuestas crudas de la vitrina de ender1.1 no se conservaron, así que sus cifras no son recalculables desde el repositorio.
- El resultado de 0/2 en decisiones sobre ejecuciones reservadas de Clearing (acción exacta) indica que la transferencia fuera del currículo es débil.
- El autor declara explícitamente que **no es para despliegue**: no debe usarse para préstamos, cobros, pagos ni ninguna decisión sobre personas reales.
- No hay información sobre sesgos, idiomas soportados ni comportamiento multilingüe.
- La licencia Apache-2.0 permite uso comercial, pero el base y el adaptador se distribuyen sin garantías y con las advertencias anteriores; cualquier uso comercial de sistemas de decisión automatizada añadiría obligaciones regulatorias ajenas a la licencia.
- El identificador `Qwen/Qwen3.8-27B` no ha podido verificarse con la búsqueda web realizada; conviene comprobar que el base y la revisión fijada existen antes de integrar el adaptador.
- El adaptador se sirve con el modo de pensamiento desactivado; no hay datos sobre su comportamiento con `enable_thinking: true`.
- Riesgo de alucinación: no evaluado en la información disponible, pero es esperable en un adaptador de 143 updates finales entrenado sobre 2.038 filas de dominio muy específico.

## Enlaces

- Ficha del adaptador en HuggingFace: https://huggingface.co/beanyzoldyck/ender1.1
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B (revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`)
- Checkpoint anterior de la familia: https://huggingface.co/beanyzoldyck/ender1
- Artefactos citados dentro del repositorio: `adapter_model.safetensors` (SHA-256 `adaf2667a3ce66dcdc12600dc537a79332946afc0c1473f1358799a172f6a31a`), `run/evaluation-step-143.json`, `launch-chart-ender1.1.png` / `.svg`
- Paper, blog o repositorio adicionales: no disponibles. La búsqueda web realizada no devolvió resultados relevantes (únicamente páginas de inicio y acceso de Facebook), por lo que no se han podido localizar enlaces a Ender's Bench, CalHacks 13.0 ni documentación del modelo base.

# BenoitJT-GIRARD/qwen3-1.7b-chsa-triage-sft-merged

## Resumen

`BenoitJT-GIRARD/qwen3-1.7b-chsa-triage-sft-merged` es un ajuste fino supervisado (SFT) del modelo denso `Qwen/Qwen3-1.7B-Base`, orientado al triaje en servicios de urgencias hospitalarias. Lo publica el usuario BenoitJT-GIRARD dentro de un proyecto de agente de triaje médico asociado al CHSA, con corpus conversacional en francés e inglés. El repositorio contiene el adaptador LoRA ya fusionado en los pesos, de modo que se carga como un modelo `transformers` estándar sin necesidad de aplicar adaptadores.

Se trata del modelo intermedio de una cadena de tres artefactos: este SFT fusionado, un adaptador DPO que se entrena sobre él y un modelo final que incorpora el alineamiento por preferencias. Su función declarada es doble: servir de pesos base del adaptador DPO y permitir medir la aportación del alineamiento comparando ambos modelos sobre el mismo conjunto de evaluación.

El modelo tiene 2.031.739.904 parámetros y un tamaño de repositorio de 4,1 GB en safetensors. Está publicado con licencia MIT y su model card lo etiqueta explícitamente como prototipo pedagógico, con supervisión humana obligatoria y sin validación clínica por parte de un médico urgente. La relevancia actual es acotada pero clara: es un ejemplo reproducible de pipeline SFT + DPO sobre un modelo pequeño de la familia Qwen3 aplicado a un dominio de alto riesgo, con una evaluación honesta de sus tasas de error.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-1.7B-Base); sin datos adicionales en la información disponible |
| Parámetros totales | 2.031.739.904 (dato real de safetensors) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (no se especifica en la model card) |
| Tipos de cuantización | no disponible: el repositorio solo publica pesos en safetensors; no se declaran variantes GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | francés (fr) e inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería `transformers`) |

Nota técnica relevante: la cabeza de salida está desacoplada de la matriz de embeddings (`tie_word_embeddings = false`), por lo que el repositorio incluye un `lm_head.weight` propio. El autor justifica este decouplage indicando que el ajuste fino adapta la cabeza y que fusionar sin desligarla habría escrito la corrección tanto en la salida como en la entrada del modelo.

## Arquitectura y entrenamiento

La información disponible no detalla el número de capas, la dimensión oculta ni la configuración de atención del backbone, más allá de identificarlo como el modelo denso `Qwen/Qwen3-1.7B-Base`. El procedimiento de adaptación sí está descrito: se aplicó un ajuste fino supervisado sobre «el corpus de triaje del CHSA» y después se fusionó el adaptador LoRA en los pesos. No se especifican en la model card el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases adicionales de RLHF distintas del DPO que se entrena por separado en otro repositorio.

El tokenizer publicado incorpora el gabarito de diálogo del proyecto y declara `<|im_end|>` como token de fin de secuencia, detalle importante porque el formato conversacional esperado no coincide necesariamente con el chat template estándar de Qwen3. La salida se fuerza a una plantilla estructurada de tres campos: nivel de prioridad (URGENCE_VITALE, URGENCE_MODEREE o CONSULTATION_DIFFEREE), justificación clínica breve y recomendación de conducta. Según la evaluación del autor, el 100 % de las respuestas del conjunto de prueba fueron explotables por el sistema de información, lo que indica que el formato se aprende de manera fiable.

Como innovación destacable dentro del proyecto cabe señalar la separación explícita entre SFT y DPO en repositorios distintos, con los pesos SFT fusionados publicados como base cargable del adaptador DPO. Este diseño permite un análisis de ablation limpio sobre el efecto del alineamiento por preferencias, algo poco habitual en publicaciones de ajustes finos de dominio.

## Capacidades

- Generación de texto conversacional en francés e inglés, en formato de diálogo multi-turno.
- Clasificación de prioridad de triaje en tres niveles discretos, con justificación y recomendación asociadas.
- Salida estructurada y parseable: el modelo emite siempre los campos «Niveau de priorité», «Justification» y «Recommandation» con el 100 % de respuestas explotables en el conjunto de evaluación del autor.
- Manejo de presentaciones clínicas atípicas: cerca de la mitad del conjunto de evaluación está compuesto por casos atípicos, según la model card.
- Razonamiento clínico básico de tipo «conduite à tenir», siempre como ayuda a la decisión y no como diagnóstico.
- Capacidades heredadas del backbone: comprensión lectora, generación general y conocimientos del modelo base Qwen3-1.7B, no cuantificadas en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada; el modelo está entrenado para una tarea de clasificación con formato fijo.
- Modo «thinking» explícito, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Pre-triaje asistido en urgencias: el modelo recibe la descripción textual del caso y devuelve un nivel de prioridad con justificación, pensado como segunda opinión bajo supervisión de un profesional. Es adecuado por su formato de salida fijo y parseable, aunque su tasa de infratriaje del 30 % en casos urgentes limita su uso a entornos de investigación o simulación.
- Formación de personal sanitario y residentes: permite generar escenarios de triaje con justificación clínica y comparar la decisión del modelo con la del alumno, aprovechando que la mitad del conjunto de evaluación son presentaciones atípicas.
- Investigación en NLP clínico: sirve como punto de referencia reproducible de un pipeline SFT a 1,7B parámetros en una tarea de clasificación de riesgo sanitario.
- Estudio de alineamiento por preferencias: al ser los pesos base del adaptador DPO del mismo proyecto, permite medir de forma directa qué aporta el DPO sobre el SFT en términos de exactitud y de infratriaje, usando el mismo conjunto de evaluación.
- Generación de datos sintéticos anotados: las salidas estructuradas (nivel, justificación, recomendación) pueden usarse para crear corpus de entrenamiento o de prueba para modelos mayores, siempre con revisión humana.
- Integración en sistemas de información hospitalarios como componente de demostración: el 100 % de respuestas explotables permite montar un prototipo end-to-end de recepción de texto libre y clasificación automática, con el objetivo de validar la fontanería de la integración más que la calidad clínica.
- Evaluación de robustez y seguridad clínica: el modelo es útil como caso de estudio de fallo en dominio crítico, midiendo infratriaje, sobreclasificación y sensibilidad al idioma.
- Asistente conversacional bilingüe fr/en de orientación sanitaria no urgente, con avisos explícitos de derivación al 15 (SAMU) cuando corresponda.

## Benchmarks y rendimiento

El autor publica una única tabla de evaluación, medida sobre un conjunto de 60 casos escritos a mano y nunca vistos en entrenamiento, con cerca de la mitad de presentaciones atípicas. No se han publicado resultados de benchmarks estándar (MMLU, GSM8K, HumanEval, etc.) en la información disponible.

| Medida | Valor (60 casos) |
|---|---|
| Exactitud del nivel de triaje | 0,683; IC [0,56 – 0,79] |
| Infratriaje de casos urgentes | 30 % |
| Sobretriaje, todos los casos | 11,7 % |
| Respuestas explotables por el sistema de información | 100 % |

La model card menciona que existe una comparación con modelos de referencia, un análisis de errores y un desglose por idioma en el informe técnico del repositorio, pero no se incluyen esos números en la información disponible. No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: alrededor de 4,1 GB solo de pesos, más caché KV; en la práctica unos 5–6 GB para contextos moderados.
- VRAM estimada en int8 (bitsandbytes): aproximadamente 2,2–2,6 GB de pesos.
- VRAM estimada en 4 bits (NF4): aproximadamente 1,3–1,8 GB, con pérdida de calidad no evaluada en la información disponible.
- GPU consumer: cabe en cualquier GPU con 8 GB o más, como RTX 3060 Ti, RTX 4060, RTX 3070 o superiores. En GPUs de 4 GB exige cuantización agresiva. También es viable en CPU con 8 GB de RAM para inferencia puntual.
- GPU profesionales recomendadas: A100 40/80 GB, H100, L40S o A10G; el modelo es lo bastante pequeño como para que el cuello de botella sea la latencia y no la memoria, por lo que varias instancias pueden convivir en una misma GPU.
- Opciones de despliegue: `transformers` (vía indicada por el autor), text-generation-inference (el repositorio está etiquetado con `text-generation-inference` y `endpoints_compatible`), y vLLM como alternativa habitual para modelos de la familia Qwen3. Para llama.cpp u Ollama sería necesaria una conversión a GGUF, que no se publica en este repositorio.
- Latencia y throughput: no disponibles en la información proporcionada. Con 2.031 millones de parámetros, en una RTX 4090 en fp16 se sitúa en el rango típico de decenas de tokens por segundo, pero no hay mediciones publicadas por el autor.

## Comparativa con modelos similares

Los tres artefactos comparables pertenecen al mismo proyecto, por lo que la comparación es de variantes y no de alternativas independientes. No se dispone de datos de benchmarks de otros modelos de triaje médico comparables en la información proporcionada.

| Modelo | Parámetros | Contexto | Licencia | Formato | Evaluación publicada |
|---|---|---|---|---|---|
| `Qwen/Qwen3-1.7B-Base` | 2,03 B (modelo base) | no disponible en la información proporcionada | no disponible en la información proporcionada | safetensors | no disponible |
| `qwen3-1.7b-chsa-triage-sft-merged` (este) | 2,031 B | no disponible | MIT | safetensors | Exactitud 0,683; infratriaje 30 %; sobretriaje 11,7 %; 100 % explotables sobre 60 casos |
| `qwen3-1.7b-chsa-triage` (modelo final, con DPO) | no disponible en la información proporcionada | no disponible | MIT (según el ecosistema del proyecto) | no disponible en la información proporcionada | El autor remite a su model card; cifras no incluidas aquí |
| `qwen3-1.7b-chsa-triage-dpo` (adaptador DPO) | no disponible; es un adaptador sobre este SFT | no disponible | MIT (según el ecosistema del proyecto) | adaptador LoRA/DPO | no disponible |

## Limitaciones y advertencias

- Tasa de infratriaje del 30 % en casos urgentes sobre 60 casos de evaluación: clasificar como no urgente un caso urgente es el error más grave posible en este dominio, y el modelo lo comete en casi uno de cada tres casos urgentes.
- El catálogo clínico usado para construir los datos de entrenamiento no fue validado por un médico urgente, según declara el propio autor. Cualquier uso clínico real queda fuera de las condiciones declaradas.
- El propio autor lo etiqueta como prototipo pedagógico con supervisión humana obligatoria y recomienda no usarlo en situaciones reales; ante cualquier signo vital comprometido, la conducta indicada es llamar al 15 (SAMU).
- Es el modelo intermedio del proyecto: no ha recibido alineamiento por preferencias. Para uso directo, el autor recomienda el modelo final con DPO.
- Riesgo de alucinación clínica inherente a un modelo de 1,7 B parámetros entrenado sobre un corpus de dominio específico y no verificado; las justificaciones pueden ser plausibles pero incorrectas.
- Cobertura lingüística limitada a francés e inglés; no hay evidencia de comportamiento en castellano ni en otras lenguas.
- La longitud de contexto no se especifica en la model card, lo que impide garantizar el manejo de historiales clínicos largos o conversaciones multi-turno extensas.
- La evaluación se apoya en 60 casos escritos a mano, con intervalos de confianza amplios (0,56–0,79 para la exactitud): el tamaño muestral es insuficiente para conclusiones robustas.
- La licencia MIT permite uso comercial y modificación, pero no exime de responsabilidad clínica ni regulatoria; un modelo sanitario puede entrar en el ámbito de la normativa de productos sanitarios de la UE, no cubierto por la licencia.
- El desacople de la cabeza de salida (`tie_word_embeddings = false`) implica que el checkpoint no es intercambiable a nivel de tensores con el modelo base; hay que usar el tokenizer y el chat template publicados en este mismo repositorio.
- No se publican pesos cuantizados ni formato GGUF, lo que obliga a convertir manualmente si se quiere desplegar en llama.cpp u Ollama.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/BenoitJT-GIRARD/qwen3-1.7b-chsa-triage-sft-merged
- Modelo final con alineamiento DPO: https://huggingface.co/BenoitJT-GIRARD/qwen3-1.7b-chsa-triage
- Adaptador DPO: https://huggingface.co/BenoitJT-GIRARD/qwen3-1.7b-chsa-triage-dpo
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Repositorio del proyecto en GitHub: https://github.com/BenoitJT-GIRARD/chsa-triage
- La búsqueda web realizada no devolvió resultados relevantes para este modelo: los únicos enlaces obtenidos apuntaban a WhatsApp (web.whatsapp.com, whatsapp.com, wa.me, Google Play) y no guardan relación con la consulta. No se han localizado papers, blogs ni demos adicionales.

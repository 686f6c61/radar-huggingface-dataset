# cerulean-works/castor-fineweb-edu-1B

## Resumen

castor-fineweb-edu-1B es un modelo de lenguaje de 1B parametros publicado por cerulean-works como parte de CASTOR, un conjunto de "seed-twinned language models": modelos base de DataDecide (Ai2) que difieren unicamente en su semilla de preentrenamiento y que reciben exactamente el mismo post-entrenamiento de seguridad (SFT seguido de DPO, la receta de OLMo 2 1B Instruct) bajo varias semillas de post-entrenamiento. El objetivo del conjunto es medir cuanto de la vulnerabilidad a jailbreaks prompt a prompt viene determinada por la semilla de preentrenamiento.

El modelo parte de allenai/DataDecide-fineweb-edu-1B en el checkpoint step69369 y se afina sobre allenai/tulu-3-sft-olmo-2-mixture-0225 y allenai/olmo-2-0425-1b-preference-mix. No es un asistente de proposito general: es un artefacto de investigacion disenado para estudios controlados de seguridad, refusal y robustez frente a jailbreaks, con seis revisiones (branches) que cruzan tres semillas de preentrenamiento con dos semillas de post-entrenamiento.

Su relevancia actual es metodologica: permite aislar la varianza inducida por la aleatoriedad del entrenamiento en el comportamiento de seguridad, un factor habitualmente ignorado en las evaluaciones de alineamiento. La licencia Apache 2.0 y el ecosistema transformers facilitan su reproduccion y auditoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base allenai/DataDecide-fineweb-edu-1B, familia OLMo 2) |
| Parametros totales | 1B (aproximado, segun el identificador del modelo y el prefijo "1B" del base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en formato transformers; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (datos de post-entrenamiento de Ai2 bajo ODC-BY 1.0, con algunos subconjuntos bajo otras licencias) |
| Formato de pesos | safetensors (repo de transformers de 15.4 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de aproximadamente 1B parametros heredado de allenai/DataDecide-fineweb-edu-1B, un modelo base de la suite DataDecide de Ai2 entrenado sobre FineWeb-Edu. Sobre ese checkpoint (step69369) se aplica la receta de instruccion de OLMo 2 1B: una fase de SFT sobre allenai/tulu-3-sft-olmo-2-mixture-0225 seguida de una fase de DPO sobre allenai/olmo-2-0425-1b-preference-mix. No se documentan en la informacion disponible el numero de tokens de preentrenamiento, la composicion exacta del dataset ni detalles de atencion (por ejemplo, si emplea atencion lineal o ventana deslizante).

La innovacion tecnica del conjunto CASTOR no esta en la arquitectura, sino en el diseno experimental: cada revision comparte datos, hiperparametros y receta, y difiere solo en la semilla de preentrenamiento (`default`, `large-aux-2`, `large-aux-3`) y en la semilla de post-entrenamiento (`p1`, `p2`). Esto produce seis modelos gemelos que permiten atribuir diferencias de comportamiento de seguridad a la aleatoriedad del entrenamiento y no a variaciones de datos o de receta.

## Capacidades

- Generacion de texto en ingles con el estilo de instruccion de OLMo 2 1B Instruct (SFT + DPO).
- Comportamiento de refusal entrenado explicitamente sobre mezclas de seguridad de Tulu 3 y preferencias de OLMo 2.
- Robustez (o falta de ella) frente a jailbreaks evaluada de forma sistematica sobre HarmBench, WildJailbreak, StrongREJECT, SORRY-Bench, XSTest y OR-Bench.
- Capacidad de servir como sujeto experimental para estudiar la varianza entre semillas en seguridad, refusal y utilidad.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidades multilingues limitadas al ingles segun la model card.

## Casos de uso

- Investigacion sobre robustez a jailbreaks: comparar las seis revisiones sobre los mismos 6.226 prompts publicos y cuantificar cuanto de la vulnerabilidad por prompt explica la semilla de preentrenamiento, usando las etiquetas de WildGuard y Qwen3Guard liberadas en castor-labels.
- Auditoria de alineamiento reproducible: replicar la receta SFT+DPO de OLMo 2 1B sobre un base de 1B para estudiar la sensibilidad de las metricas de seguridad a la semilla, con coste computacional bajo.
- Estudio de calibracion de clasificadores de seguridad: emplear las respuestas etiquetadas por dos guardrails distintos para medir el desacuerdo entre clasificadores sobre el mismo modelo y prompt.
- Analisis de over-refusal: usar XSTest y OR-Bench para medir como varia la tasa de rechazo ante prompts benignos entre semillas de preentrenamiento y post-entrenamiento.
- Docencia y metodologia experimental: ilustrar en cursos de seguridad de IA como se disena un experimento controlado con modelos gemelos y por que la aleatoriedad del entrenamiento debe reportarse.
- Baseline para tecnicas de defensa: evaluar metodos de mitigacion de jailbreaks (system prompts, filtros, fine-tuning adicional) contra un conjunto de modelos de referencia con varianza conocida.
- Reproduccion de resultados: reentrenar o re-evaluar las revisiones con los mismos prompts y guardrails para verificar los hallazgos del paper arXiv:2610.34074.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe la metodologia de evaluacion (6.226 prompts publicos, 20 respuestas muestreadas mas una respuesta greedy por prompt, etiquetado con WildGuard y Qwen3Guard) y remite al dataset cerulean-works/castor-labels, pero no incluye cifras agregadas de MMLU, HumanEval, GSM8K ni de las tasas de jailbreak.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB en fp16 para 1B parametros (sin contar overhead de KV cache), y del orden de 1 GB o menos en cuantizaciones de 8 o 4 bits, si bien el repositorio no publica pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son suficientes. El modelo cabe holgadamente en GPU de consumo.
- Despliegue: transformers es la libreria oficial (`AutoModelForCausalLM.from_pretrained` con `revision` para seleccionar la semilla). No se documentan integraciones con vLLM, TGI, llama.cpp u Ollama, aunque al ser un transformer estandar de 1B deberia ser convertible a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota: el repo pesa 15.4 GB porque incluye las seis revisiones; conviene descargar solo la revision necesaria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| castor-fineweb-edu-1B | ~1B | no disponible | Investigacion de seguridad con semillas gemelas (SFT+DPO OLMo 2) | apache-2.0 | Hugging Face (6 revisiones) |
| allenai/DataDecide-fineweb-edu-1B | ~1B | no disponible | Modelo base de preentrenamiento (DataDecide) | apache-2.0 | Hugging Face |
| OLMo 2 1B Instruct | ~1B | no disponible | Asistente de instrucciones de proposito general | apache-2.0 | Hugging Face |

La comparativa se limita a los modelos directamente relacionados porque la informacion disponible no incluye datos de rendimiento que permitan contrastar con alternativas de otros autores. La diferencia clave de castor-fineweb-edu-1B frente a OLMo 2 1B Instruct es su proposito: no busca ser un asistente desplegable, sino un conjunto controlado para medir varianza de seguridad entre semillas.

## Limitaciones y advertencias

- Los propios autores indican que son modelos pequenos de investigacion, no asistentes, y que no son adecuados para despliegue.
- Pueden generar texto danino ante determinados prompts, como muestran las etiquetas liberadas; no se publican las generaciones sobre prompts daninos.
- Solo soportan ingles; no hay soporte multilingue documentado.
- No se documentan sesgos especificos, pero al derivar de FineWeb-Edu y de mezclas de Tulu 3 y OLMo 2 heredan los sesgos de esos corpus.
- Riesgo de alucinacion propio de un modelo de 1B sin verificacion factual; no debe usarse como fuente de informacion.
- La licencia es Apache 2.0, pero los datos de post-entrenamiento de Ai2 estan bajo ODC-BY 1.0 con algunos subconjuntos bajo otras licencias, lo que puede afectar a la redistribucion de derivados.
- El repositorio contiene seis revisiones en un unico repo de 15.4 GB; es facil cargar por error la revision equivocada si no se especifica el parametro `revision`.
- No hay pesos cuantizados oficiales ni integracion documentada con motores de inferencia de alto rendimiento.
- El identificador arXiv (2610.34074) y las fechas del repositorio son posteriores a la informacion de referencia habitual; conviene verificar su vigencia antes de citarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cerulean-works/castor-fineweb-edu-1B
- Paper (arXiv): https://arxiv.org/abs/2610.34074
- Codigo: https://github.com/cerulean-works/castor
- Etiquetas de evaluacion: https://huggingface.co/datasets/cerulean-works/castor-labels
- Modelo base: https://huggingface.co/allenai/DataDecide-fineweb-edu-1B
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset SFT: https://huggingface.co/datasets/allenai/tulu-3-sft-olmo-2-mixture-0225
- Dataset DPO: https://huggingface.co/datasets/allenai/olmo-2-0425-1b-preference-mix

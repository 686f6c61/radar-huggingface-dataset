# bio-nlp-umass/Hypatia-4B

## Resumen

Hypatia-4B es un adaptador LoRA de tipo PEFT construido sobre el modelo base `bio-nlp-umass/Qwen3.5-4B-text`, desarrollado por el UMass BioNLP Lab (grupo de investigación dirigido por la Dra. Hong Yu, con sede en la Universidad de Massachusetts Amherst y Lowell). Forma parte de la familia Hypatia, un conjunto de modelos abiertos pequeños orientados al análisis de datos científicos, presentados en el manuscrito en preparación *Reinforcement learning and distillation make small open models competitive scientific data analysts*.

El modelo aborda un problema concreto: conseguir que un modelo de 4B parámetros sea competitivo como agente analista de datos científicos dentro de un harness de notebook. Para ello se entrena una única LoRA sobre la unión de los cuadernos de dos profesores (dominio clínico y astronomía) y después se aplica aprendizaje por refuerzo sobre estrellas reales de entrenamiento de Kepler. El resultado es un modelo único que cubre seis dominios, en lugar de seis especialistas separados.

La relevancia actual reside en su enfoque metodológico: destilación desde modelos mayores combinada con RL para cerrar la brecha de rendimiento frente a modelos especializados, manteniendo un tamaño de 4B parámetros y licencia Apache-2.0. El repositorio ocupa 2,0 GB e incluye tres ejecuciones de entrenamiento (`run1`, `run2`, `run3`) correspondientes a las tres réplicas reportadas en el artículo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3.5-4B-text |
| Parametros totales | 4B (modelo base); parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

Hypatia-4B no es un modelo entrenado desde cero, sino un adaptador LoRA de rango máximo 128 (según el flag `--max-lora-rank 128` del ejemplo de despliegue) sobre el modelo base `Qwen3.5-4B-text`. El entrenamiento se realizó en dos fases: primero un fine-tuning supervisado sobre la unión de los cuadernos de los dos profesores (dominio clínico y astronómico), y después un entrenamiento con aprendizaje por refuerzo usando estrellas reales de entrenamiento de Kepler. La model card menciona explícitamente las técnicas de *reinforcement learning* y *distillation* como ejes del trabajo, aunque no se detalla el número de tokens de entrenamiento ni la composición exacta del dataset.

El repositorio contiene tres carpetas (`run1`, `run2`, `run3`) que corresponden a las tres ejecuciones de entrenamiento reportadas en el artículo, y un fichero `recipe.json` que mapea cada carpeta a su receta y ejecución dentro del plan de análisis del paper. Los prompts del harness emplean la plantilla de chat del modelo base con el modo *thinking* activado.

## Capacidades

- Análisis de datos científicos en un harness de notebook: el modelo está diseñado para operar como agente que ejecuta código y razona sobre datos dentro de un cuaderno.
- Cobertura de seis dominios en un único modelo: QRData, MedCalc, EHRSQL, MedAgentBench, BioDSBench y Kepler.
- Razonamiento con modo *thinking*: los prompts del harness activan la plantilla de chat del base con pensamiento explícito.
- Ejecución de tareas de cálculo clínico (MedCalc) y consultas sobre registros de salud electrónicos (EHRSQL).
- Análisis de datos biomédicos (BioDSBench) y astronómicos (Kepler).
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Análisis clínico asistido por calculadoras médicas: el modelo obtiene un 83,2 % en MedCalc, por lo que puede resolver cálculos clínicos estructurados dentro de un cuaderno, siempre como herramienta de investigación y no para decisión clínica.
- Consultas sobre registros de salud electrónicos: con un 86,1 % en EHRSQL, es adecuado para prototipos de traducción de preguntas en lenguaje natural a consultas SQL sobre bases de datos EHR en entornos de investigación.
- Agente de análisis de datos biomédicos: con un 34,9 % en BioDSBench, sirve para experimentar con pipelines de análisis exploratorio donde el modelo orquesta celdas de notebook y llama a librerías de análisis.
- Análisis de curvas de luz de Kepler: con un 59,6 % en Kepler, puede emplearse en flujos de detección y caracterización de exoplanetas sobre datos reales de la misión, dentro del harness del repositorio.
- Investigación sobre agentes LLM: el modelo y sus tres ejecuciones permiten reproducir el estudio de RL y destilación sobre modelos pequeños, comparando recetas y estabilidad entre `run1`, `run2` y `run3`.
- Evaluación comparativa de especialistas frente a modelos generalistas: Hypatia-4B cubre los seis dominios con un solo adaptador, lo que permite medir la penalización de generalidad frente a los especialistas Hypatia-4B-Stats, -MedCalc, -EHR, -MedAgent, -Bio y -Astro.
- Despliegue ligero en investigación académica: al ser una LoRA sobre un base de 4B, se puede servir con vLLM activando `--enable-lora`, lo que reduce los requisitos de almacenamiento y facilita la experimentación en clústeres modestos.

## Benchmarks y rendimiento

Resultados reportados en la Tabla 1 del artículo (media de tres ejecuciones de entrenamiento; un problema sin respuesta cuenta como incorrecto):

| Benchmark | Hypatia-4B |
|---|---|
| QRData | 54,3 % |
| MedCalc | 83,2 % |
| EHRSQL | 86,1 % |
| MedAgentBench | 64,0 % |
| BioDSBench | 34,9 % |
| Kepler | 59,6 % |

La model card indica que los especialistas de dominio (Hypatia-4B-Stats, -MedCalc, -EHR, -MedAgent, -Bio y -Astro) son más precisos en sus propios dominios, pero no se proporcionan las cifras concretas de esos especialistas ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un base de 4B parámetros en precisión de 16 bits requiere del orden de 8-10 GB de VRAM, y en cuantización de 8 bits alrededor de 4-5 GB, aunque estas cifras no las publica el autor.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada por el autor; el despliegue documentado usa vLLM con soporte LoRA, que requiere GPUs de datacenter o de gama alta con suficiente memoria.
- Opciones de despliegue: vLLM con `--enable-lora --max-lora-rank 128` y el módulo LoRA apuntando a `run1` (o a `run2`/`run3`). El harness de evaluación está en `experiments/harness_v3/` del repositorio de GitHub. No se documentan otras opciones como llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hypatia-4B | 4B (base) + LoRA | no disponible | 54,3 / 83,2 / 86,1 / 64,0 / 34,9 / 59,6 % en los seis benchmarks | Apache-2.0 | Hugging Face (adaptador PEFT) |
| Hypatia-4B-Stats, -MedCalc, -EHR, -MedAgent, -Bio, -Astro | 4B (base) + LoRA | no disponible | Más precisos en su dominio según la model card; cifras no publicadas | Apache-2.0 | Hugging Face (especialistas de la misma familia) |
| Qwen3.5-4B-text | 4B | no disponible | No disponible | Apache-2.0 | Hugging Face (modelo base) |

No se dispone de datos de benchmarks de modelos externos comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo fue evaluado únicamente dentro del harness de notebook del artículo y sobre los seis benchmarks del paper; el rendimiento fuera de ese entorno no está caracterizado.
- No debe usarse para toma de decisiones clínicas: la propia model card advierte que la precisión en un benchmark clínico no es evidencia de seguridad en pacientes.
- El rendimiento en BioDSBench es bajo (34,9 %), lo que limita su uso en análisis biomédicos generales.
- La model card no documenta sesgos conocidos, riesgos de alucinación específicos ni comportamiento multilingüe.
- No se detalla la longitud de contexto efectiva del adaptador ni si el entrenamiento la modifica respecto al base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente.
- La licencia Apache-2.0 permite uso comercial, pero el modelo está declarado como herramienta de investigación y su idoneidad en producción no está demostrada.
- El artículo está en preparación y la citación aún no está disponible, lo que dificulta la trazabilidad de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bio-nlp-umass/Hypatia-4B
- Modelo base: https://huggingface.co/bio-nlp-umass/Qwen3.5-4B-text
- Repositorio de código, harness y entrenamiento: https://github.com/fatebreaker/hypatia
- Organización UMass BioNLP Lab en Hugging Face: https://huggingface.co/bio-nlp-umass
- Listado de modelos de la organización: https://huggingface.co/bio-nlp-umass/models

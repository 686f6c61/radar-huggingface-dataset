# ddvd233/hb9b_specgap_ship_noretrieval_sj_aicr_global_step_480

## Resumen

El modelo `ddvd233/hb9b_specgap_ship_noretrieval_sj_aicr_global_step_480` es un ajuste fino de investigación derivado de `Qwen/Qwen3.5-9B`, publicado por el usuario ddvd233 en HuggingFace. Se trata de la fusión a pesos HF (safetensors en bf16) del checkpoint FSDP de verl correspondiente al paso global 480 del experimento denominado RRIMed-9B, una ejecución de aprendizaje por refuerzo (reinforcement learning) en el dominio médico bajo configuración "sin recuperación" (no-retrieval), donde todos los roles auxiliares del pipeline son desempeñados por una copia congelada del modelo de 9B.

El problema que aborda es la mejora de la precisión en preguntas de salud de nivel profesional mediante RL, y su relevancia es fundamentalmente metodológica: documenta una curva de entrenamiento y un resultado medible en el benchmark HealthBench Professional (exactitud ajustada por longitud). No es un modelo de producto ni un asistente clínico: el propio autor lo describe como un artefacto de investigación entrenado con tareas generadas por el modelo y evaluado en una única familia de benchmarks.

El modelo tiene 9.409.813.744 parámetros (~9,41 mil millones) y el repositorio ocupa 18,8 GB. La licencia declarada es apache-2.0. No se especifican en la información disponible la longitud de contexto, los idiomas soportados ni versiones cuantizadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada; se hereda del modelo base `Qwen/Qwen3.5-9B` |
| Parametros totales | 9.409.813.744 (~9,41 mil millones) |
| Parametros activos | No aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Solo bf16 safetensors en el repositorio; no se publican versiones GGUF, AWQ, GPTQ ni similares |
| Idiomas soportados | No disponible (las etiquetas del repositorio no incluyen idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16), fusionados desde un checkpoint FSDP de verl |
| Modelo base | Qwen/Qwen3.5-9B |
| Tipo de pipeline | reinforcement-learning |
| Tamano del repositorio | 18,8 GB |
| Dominio declarado | medical |
| Fecha de publicacion | 2026-09-11 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura concreta no se detalla en la información proporcionada más allá de que el modelo deriva de `Qwen/Qwen3.5-9B` y de que se trata de una fusión de pesos entrenados con el framework verl sobre FSDP. El checkpoint original corresponde al directorio `hb9b_specgap_ship_noretrieval_sj_aicr/global_step_480`, convertido a safetensors en bf16 para su distribución en HuggingFace. No se especifican en la ficha el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF, DPO u otras técnicas de alineación.

Lo que sí documenta el autor es el procedimiento de RL: el experimento RRIMed-9B opera en configuración "no-retrieval" con ARM 11, y tanto la función de evaluación como el resto de roles auxiliares del pipeline son servidos por el mismo modelo base de 9B congelado, es decir, un esquema de autoevaluación (self-graded). Las tareas de entrenamiento fueron generadas por el propio modelo (model-written tasks). No se describe ninguna innovación arquitectónica (atención lineal, decodificación especulativa, SSM híbrido, etc.) en la información disponible, por lo que cabe asumir que se conserva la estructura del modelo base, aunque este extremo no está confirmado en los datos facilitados.

## Capacidades

- Generación de texto y respuesta a preguntas en el dominio médico y de salud profesional, objetivo declarado del ajuste por refuerzo.
- Razonamiento aplicado a preguntas de salud de nivel profesional: el modelo se evalúa con HealthBench Professional, un benchmark de preguntas abiertas evaluadas por un modelo juez.
- Capacidad heredada del modelo base `Qwen/Qwen3.5-9B` en tareas generales de lenguaje; el alcance exacto no está documentado en la ficha.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada; el pipeline de entrenamiento emplea roles auxiliares, pero no se detalla si el modelo final conserva capacidades de agente.
- Capacidades multilingües: no disponibles; no se declaran idiomas en el repositorio.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.
- Función auxiliar de evaluación: por diseño del experimento, versiones congeladas del modelo actúan como juez o grader en el pipeline de RL, lo que sugiere cierta aptitud para tareas de evaluación, aunque no se cuantifica.

## Casos de uso

- Investigación en aprendizaje por refuerzo aplicado a dominios especializados: el modelo sirve como referencia reproducible de un paso concreto (global step 480) de una ejecución de RL con verl, útil para comparar curvas de entrenamiento y configuraciones de recompensa.
- Evaluación metodológica de esquemas auto-evaluados: dado que el experimento usa el mismo modelo congelado como grader en todos los roles auxiliares, este checkpoint permite estudiar el sesgo de autoevaluación comparando sus puntuaciones con las de evaluadores independientes.
- Reproducción y ablación del ajuste "no-retrieval": investigadores que quieran medir el impacto de eliminar la recuperación externa en tareas médicas pueden partir de este checkpoint y contrastarlo con variantes con recuperación.
- Generación de datos sintéticos de dominio médico: el modelo puede emplearse para producir preguntas y respuestas de salud que después se filtren y validen manualmente, aprovechando que fue entrenado con tareas generadas por modelo.
- Punto de partida para ajustes posteriores: al publicarse en safetensors bf16 y con licencia apache-2.0, puede cargarse en frameworks de entrenamiento y someterse a SFT o DPO adicionales sobre datos propios, siempre que se respete la licencia del modelo base.
- Estudio de la exactitud ajustada por longitud: el benchmark empleado penaliza respuestas innecesariamente largas, por lo que el checkpoint es útil para analizar cómo el RL afecta a la verbosidad de las respuestas médicas.
- Docencia y divulgación técnica: como ejemplo de conversión de un checkpoint FSDP de verl a pesos HF publicables, y de cómo se documenta un artefacto de investigación con sus métricas y advertencias.

En ningún caso debe emplearse para diagnóstico, triaje, consejo clínico ni cualquier uso sanitario real; el autor lo marca explícitamente como "not for clinical use".

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible corresponden a HealthBench Professional, con exactitud ajustada por longitud (length-adjusted accuracy):

| Metrica | Valor |
|---|---|
| HealthBench Professional, exactitud ajustada por longitud (global step 480, checkpoint publicado) | 0,391 |
| Mejor validacion de la ejecucion (global step 460, no conservado por rotacion de checkpoints) | 0,421 |
| Modelo base sin entrenar (untrained) | 0,244 |
| Baseline con prompt fijo (fixed-prompt baseline) | 0,381 |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La evaluación es de tipo auto-evaluada (self-graded): todos los roles auxiliares, incluido el juez, son servidos por la copia congelada del modelo de 9B, lo que condiciona la interpretación de las cifras.

## Requisitos de hardware

- Peso de los pesos en bf16: 9,41 mil millones de parámetros × 2 bytes ≈ 18,8 GB, coherente con el tamaño del repositorio. A ello hay que sumar la caché KV y el overhead del runtime.
- VRAM estimada para inferencia en bf16/fp16: aproximadamente 20-24 GB, en función de la longitud de contexto, el tamaño de lote y la implementación utilizada. Es una estimación derivada del número de parámetros, no un dato publicado.
- VRAM estimada con cuantización de 8 bits: del orden de 10-12 GB.
- VRAM estimada con cuantización de 4 bits: del orden de 6-8 GB. No obstante, el repositorio no publica pesos cuantizados, por lo que habría que generarlos localmente.
- GPU profesionales recomendadas: A100 40/80 GB, H100, L40S, A6000, siempre que se requiera contexto largo o lotes grandes.
- GPU de consumo: cabe en tarjetas de 24 GB (RTX 4090, RTX 3090) en bf16 con contexto moderado, y con margen en 16 GB si se aplica cuantización de 4 bits. En GPUs de 8-12 GB solo sería viable con cuantizaciones agresivas y contextos cortos.
- Opciones de despliegue: vLLM o TGI para servicio con bf16 en GPU; llama.cpp u Ollama si se genera previamente una conversión a GGUF; transformers con accelerate para uso puntual o evaluación.
- Latencia y throughput: no disponibles; la información proporcionada no incluye mediciones de velocidad ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HealthBench Professional (long-adj.) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (global step 480) | 9,41 mil millones | No disponible | 0,391 | apache-2.0 | Publico en HuggingFace |
| `Qwen/Qwen3.5-9B` (base, sin entrenar) | No disponible en la informacion; el ajuste parte de el | No disponible | 0,244 | No disponible en la informacion proporcionada | Publico en HuggingFace |
| Otros modelos medicos de tamano comparable | No disponible | No disponible | No disponible | No disponible | No disponible |

Solo se dispone de datos comparativos frente al modelo base del que deriva, según las cifras citadas en la model card. La información proporcionada no incluye resultados de alternativas de la misma categoría (por ejemplo, otros ajustes médicos de ~9B), por lo que no es posible establecer una comparación cuantitativa adicional.

## Limitaciones y advertencias

- No es un producto clínico: el propio autor indica "not for clinical use". No debe utilizarse para diagnóstico, tratamiento ni consejo sanitario.
- Evaluación auto-evaluada: el esquema es self-graded, con el modelo congelado de 9B sirviendo como juez y en todos los roles auxiliares. Esto puede introducir sesgos favorables o desfavorables difíciles de deslindar y limita la comparabilidad con evaluaciones independientes.
- Cobertura de evaluación estrecha: los resultados se limitan a una única familia de benchmarks (HealthBench Professional). No hay datos de rendimiento general, código, matemáticas ni otras tareas.
- El checkpoint publicado no es el mejor de la ejecución: el mejor paso de validación fue el 460 (0,421), descartado por la rotación de checkpoints. El artefacto disponible rinde por debajo del máximo alcanzado.
- Datos de entrenamiento generados por modelo: el autor indica que se entrenó con tareas escritas por el propio modelo, lo que puede amplificar sesgos y errores presentes en él y reducir la diversidad respecto a datos humanos.
- Riesgo de alucinación: no se han publicado métricas de fidelidad factual ni tasas de alucinación. En un dominio médico, la verificación humana experta es imprescindible antes de reutilizar cualquier salida.
- Idiomas, contexto y cuantizaciones sin documentar: no se declaran idiomas soportados ni longitud de contexto, lo que dificulta planificar despliegues multilingües o con entradas largas.
- Trazabilidad baja: 0 descargas y 0 likes en el momento de la consulta, sin métricas de terceros ni validación externa; es un artefacto de investigación sin adopción conocida.
- Licencia: el ajuste se publica como apache-2.0, pero conviene revisar los términos aplicables al modelo base `Qwen/Qwen3.5-9B`, ya que las condiciones de uso comercial del derivado pueden depender de ellos.
- Sesgos de dominio: no se documentan análisis de sesgo por subpoblación, especialidad médica, sexo, etnia o nivel socioeconómico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ddvd233/hb9b_specgap_ship_noretrieval_sj_aicr_global_step_480
- Modelo base referenciado en la ficha (`base_model`): https://huggingface.co/Qwen/Qwen3.5-9B
- Paper, blog, repositorio o demo del autor: no disponible en la informacion proporcionada.
- Resultados de la busqueda web: no se ha encontrado ningun enlace relacionado con este modelo. Las busquedas devolvieron exclusivamente cuestionarios sobre el grupo musical The Beatles (infinite-quiz.com, quantonesai.com, kiquo.com, wordwall.net, jetpunk.com), contenido sin ninguna relacion con el modelo.

# Jeesup/svd-safety-mis7_swift_remove40

## Resumen

`Jeesup/svd-safety-mis7_swift_remove40` es un checkpoint derivado de `mistralai/Mistral-7B-Instruct-v0.2` comprimido mediante SVD-LLM, con un 40,00 % de los parámetros eliminados respecto al modelo denso original (fracción de parámetros resultante declarada: 0,6003). Lo publica el usuario Jeesup en HuggingFace como artefacto de investigación. No es un modelo de propósito general ni un asistente desplegable: es una celda concreta de una rejilla experimental que cruza reglas de selección de componentes SVD con presupuestos de restauración, y cuyo objetivo es medir cómo la compresión de bajo rango degrada el comportamiento de seguridad y qué regla de selección lo repara mejor.

En esta celda concreta, el presupuesto de restauración es del 0,000 % y el número de componentes restaurados es 0, con la regla de selección etiquetada como `unknown` en la model card. Es decir, el paso de "restauración" es un no-op y el checkpoint equivale, en la práctica, a una compresión SVD-LLM simple sin reparación posterior. La semilla declarada es 42.

Su relevancia es metodológica, no funcional: aporta métricas de seguridad medidas con jueces automatizados (AdvBench ASR 0,6558; StrongREJECT ASR 0,5495; macro over-refusal de WildGuard 0,0663) y de calidad de lenguaje (perplejidad WikiText-2 de 10,7309). El propio autor advierte de que varias celdas de la rejilla están deliberadamente degradadas en seguridad y que cualquier celda debe tratarse como sujeto experimental, no como asistente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only del modelo base Mistral-7B-Instruct-v0.2 con pesos comprimidos por SVD-LLM (no confirmado en la model card de este checkpoint) |
| Parámetros totales | 7.241.732.096 según los pesos safetensors del repositorio; la model card declara una fracción de parámetros densos resultante de 0,6003 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Mistral-7B-Instruct-v0.2 soporta 32.768 tokens |
| Tipos de cuantización | No disponible; el repositorio solo publica pesos en safetensors. No se incluyen GGUF, AWQ, GPTQ ni variantes de 8/4 bits |
| Idiomas soportados | No disponible (la model card no los declara; el modelo base está orientado principalmente al inglés) |
| Licencia | Apache License 2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Modelo base | mistralai/Mistral-7B-Instruct-v0.2 |
| Tipo de compresión | SVD-LLM, 40,00 % de parámetros eliminados |
| Fracción de parámetros resultante | 0,6003 |
| Regla de selección de componentes | `unknown` (etiqueta tal cual en la model card) |
| Presupuesto de restauración | 0,000 % de los parámetros densos |
| Componentes restaurados | 0 |
| Componentes sustituidos | 0 |
| Semilla | 42 |
| Tamaño del repositorio | 14,5 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación (metadatos HF) | 2026-09-16 |

Advertencia sobre los parámetros: el conteo real de safetensors (7.241.732.096) coincide con el del modelo denso sin comprimir, mientras que la fracción declarada (0,6003) implicaría del orden de 4,35·10⁹ parámetros efectivos. La model card no explica esta discrepancia; una explicación plausible es que la compresión SVD-LLM se materialice como matrices densas reconstruidas de rango reducido, pero esto no está confirmado en la información disponible.

## Arquitectura y entrenamiento

Este checkpoint no se entrena: se obtiene por compresión post-hoc del checkpoint `mistralai/Mistral-7B-Instruct-v0.2`. La técnica aplicada es SVD-LLM, que descompone en valores singulares las matrices de pesos y trunca los componentes de menor rango hasta alcanzar el presupuesto de compresión fijado (en este caso, 40,00 % de parámetros eliminados). La model card describe además un segundo paso, la restauración de un subconjunto de componentes SVD, controlado por una regla de selección y un presupuesto de parámetros. En esta celda el presupuesto es 0,000 % y los componentes restaurados son 0, por lo que ese segundo paso no modifica nada y el resultado es una compresión SVD-LLM sin reparación.

No se documentan en la información disponible ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo RLHF o DPO en esta variante: toda la alineación del modelo procede del checkpoint base de Mistral, que aquí se hereda ya degradado por el truncamiento. Tampoco se describe el criterio exacto de la regla de selección (`unknown`), ni si la compresión se aplicó a todas las capas o a un subconjunto, ni qué matrices se truncaron. La única innovación técnica relevante es precisamente el objeto de estudio: cuantificar el impacto de la compresión de bajo rango sobre el comportamiento de rechazo y sobre la calidad del lenguaje, y comparar reglas de selección de componentes dentro de una rejilla experimental con semilla fija.

## Capacidades

- Generación de texto conversacional: hereda la capacidad del modelo base Mistral-7B-Instruct-v0.2, pero la model card no aporta evaluaciones de calidad generativa más allá de la perplejidad de WikiText-2 (10,7309).
- Razonamiento, matemáticas y código: no se declaran ni se evalúan en la información disponible.
- Tool calling / function calling: no declarado.
- Soporte de agentes y razonamiento multi-paso: no declarado; la model card indica explícitamente que no es un modelo de chat de propósito general.
- Capacidades multilingües: no disponibles.
- Capacidad especial de rechazo de peticiones dañinas: degradada de forma medible. El ASR de AdvBench es 0,6558 y el de StrongREJECT es 0,5495, valores altos que indican que una fracción sustancial de peticiones dañinas obtiene respuesta. El macro over-refusal de WildGuard es 0,0663, es decir, el modelo apenas rechaza peticiones benignas: el patrón es de alineación de seguridad dañada, no de sobre-rechazo.
- Modo de pensamiento, visión, audio u otras modalidades: no disponibles; el pipeline declarado es únicamente text-generation.

## Casos de uso

- Investigación sobre seguridad y compresión: el checkpoint sirve como punto de medida para cuantificar cuánto degrada el truncamiento SVD el comportamiento de rechazo, comparando su ASR de 0,6558 en AdvBench frente a otras celdas de la rejilla con distintos presupuestos de restauración.
- Evaluación comparativa de reglas de selección de componentes: al ser una celda con regla `unknown` y presupuesto 0, funciona como referencia de "sin reparación" frente a celdas con restauración efectiva.
- Validación de arneses de evaluación de seguridad: sus métricas publicadas con jueces HarmBench y WildGuard permiten comprobar la reproducibilidad de un pipeline propio de red teaming antes de aplicarlo a modelos en producción.
- Análisis de perplejidad como proxy de degradación: la perplejidad de 10,7309 en WikiText-2 se puede usar para estudiar la correlación entre pérdida de calidad lingüística y pérdida de alineación de seguridad bajo distintos niveles de compresión.
- Docencia y divulgación técnica: caso práctico y reproducible (semilla 42) de compresión de bajo rango sobre un transformer de 7B, útil para explicar SVD-LLM y sus efectos colaterales en un curso de eficiencia de modelos.
- Línea base negativa en ejercicios de red teaming: al ser un modelo deliberadamente degradado en seguridad, sirve como control inferior contra el que medir técnicas de mitigación, siempre en entornos aislados y sin exposición a usuarios.
- Pruebas de integración de infraestructura: el tag `text-generation-inference` y `endpoints_compatible` permiten usarlo como carga de trabajo para validar despliegues TGI o compatibles con endpoints, sin pretensión de servir tráfico real.
- Reproducción de estudios de interpretabilidad: permite inspeccionar qué componentes SVD concentran el comportamiento de rechazo y contrastarlo con la literatura de interpretabilidad mecanicista.

## Benchmarks y rendimiento

Datos publicados en la model card del propio autor:

| Métrica | Valor | Juez / método |
|---|---|---|
| AdvBench ASR | 0,6558 | HarmBench judge |
| StrongREJECT ASR | 0,5495 | HarmBench judge |
| Macro over-refusal | 0,0663 | WildGuard |
| Perplejidad WikiText-2 | 10,7309 | no especificado |

No se han publicado en la información disponible valores de referencia del modelo base sin comprimir ni de otras celdas de la rejilla, por lo que no es posible calcular deltas ni establecer comparaciones cuantitativas. Tampoco se aportan resultados de MMLU, HumanEval, GSM8K ni de ninguna otra batería de capacidad general.

## Requisitos de hardware

- VRAM para inferencia en fp16/bf16: los pesos ocupan aproximadamente 14,5 GB (tamaño del repositorio y conteo de safetensors), más el KV cache y el overhead del runtime. En la práctica se necesitan 16-18 GB de VRAM como mínimo para contexto corto y 24 GB o más para ventanas largas.
- Cuantización: no hay versiones GGUF, AWQ ni GPTQ publicadas. Cualquier cuantización a 8 bits (≈8 GB) o 4 bits (≈4,5-5 GB) tendría que generarla el propio usuario.
- GPU recomendadas: A100 40/80 GB, H100, L40S y RTX 6000 Ada para fp16 con contexto amplio; RTX 4090 o RTX 3090 (24 GB) para fp16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en fp16; en tarjetas de 12-16 GB solo con cuantización de 8 o 4 bits generada por el usuario.
- Opciones de despliegue: transformers (librería declarada), Text Generation Inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`) y vLLM. Ollama y llama.cpp requieren conversión previa a GGUF, no incluida.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| svd-safety-mis7_swift_remove40 (este) | 7.241.732.096 en safetensors; fracción densa declarada 0,6003 | No disponible | Apache-2.0 | Público en HuggingFace, 0 descargas |
| mistralai/Mistral-7B-Instruct-v0.2 (base sin comprimir) | 7,24·10⁹ | 32.768 tokens | Apache-2.0 | Público en HuggingFace |
| Otras celdas de la rejilla del mismo estudio | No disponible | No disponible | No disponible | No se publican identificadores ni métricas en la información disponible |
| Alternativas de compresión de bajo rango de la misma categoría | No disponible | No disponible | No disponible | No disponible |

La model card menciona explícitamente que este checkpoint es una celda de una rejilla sobre reglas de selección y presupuestos, pero no identifica las demás celdas ni publica sus resultados, por lo que no es posible construir una comparativa cuantitativa. La única comparación defendible es cualitativa: frente al modelo base sin comprimir, este checkpoint reduce el coste de almacenamiento y cómputo a cambio de un aumento del ASR (0,6558 en AdvBench) y de una perplejidad de WikiText-2 de 10,7309. Los valores del modelo base no se proporcionan, así que la magnitud del deterioro no puede cuantificarse con la información disponible.

## Limitaciones y advertencias

- No es un modelo desplegable: la propia model card indica que es un artefacto de investigación y que no debe tratarse como un asistente de propósito general.
- Seguridad degradada de forma deliberada y medida: ASR de 0,6558 en AdvBench y 0,5495 en StrongREJECT implican que una parte importante de las peticiones dañinas obtiene respuesta. Existe riesgo real de generar contenido nocivo si se expone a usuarios.
- El macro over-refusal de 0,0663 es bajo, lo que confirma que el modelo rara vez se niega; combinado con el ASR alto, el patrón es de alineación de seguridad rota, no de un modelo excesivamente cauto.
- Sesgos: no se documentan evaluaciones de sesgo, toxicidad ni equidad en la información disponible. Al heredar los pesos del modelo base, cabe esperar los sesgos de este, pero no están medidos aquí.
- Alucinación: no hay evaluaciones de factualidad ni de veracidad. La perplejidad de 10,7309 en WikiText-2 sugiere una calidad de modelado del lenguaje inferior a la de un modelo denso de su tamaño, lo que habitualmente se asocia a mayor propensión a errores.
- Idiomas: la model card no declara idiomas soportados y no hay evaluaciones multilingües, por lo que no se puede asumir un rendimiento aceptable fuera del inglés.
- Límite de contexto: no declarado en la model card. Aunque el modelo base soporta 32.768 tokens, la compresión puede alterar el comportamiento en ventanas largas y no hay mediciones al respecto.
- Licencia: Apache 2.0 para este derivado, pero la model card señala que el repositorio del modelo base no incluye un archivo de licencia redistribuible. Conviene revisar la situación antes de un uso comercial.
- Trazabilidad incompleta: se desconoce el criterio exacto de la regla de selección `unknown`, y la discrepancia entre el conteo de parámetros en safetensors (7,24·10⁹) y la fracción densa declarada (0,6003) no está explicada. Esto dificulta interpretar qué se está midiendo realmente.
- Adopción nula: 0 descargas y 0 likes en el momento de redactar esta ficha, sin señales de validación por parte de terceros.
- Restricción operativa: no hay cuantizaciones publicadas, de modo que cualquier despliegue en hardware de consumo exige generar versiones GGUF, AWQ o GPTQ por cuenta propia y volver a validar el comportamiento de seguridad tras la cuantización.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-mis7_swift_remove40
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- La model card nombra SVD-LLM, AdvBench, StrongREJECT, WildGuard y HarmBench, pero no incluye enlaces a los papers, repositorios ni demos correspondientes: no disponibles.
- La búsqueda web realizada no devolvió ningún resultado relacionado con este modelo ni con SVD-LLM; los resultados obtenidos correspondían a páginas generales de ChatGPT y se han descartado por no ser relevantes.

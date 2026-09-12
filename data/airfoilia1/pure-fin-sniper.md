# airfoilia1/pure-fin-sniper

# airfoilia1/pure-fin-sniper

## Resumen

pure-fin-sniper (nombre interno de entrenamiento: qwen_pure_lora) es un adaptador LoRA publicado por el usuario airfoilia1 sobre el modelo base unsloth/Qwen2.5-Coder-7B-Instruct-bnb-4bit. No es un modelo completo: el repositorio contiene únicamente los pesos del adaptador (40.370.176 parámetros, unos 40,4 millones) en formato PEFT, con un tamano de repositorio de 0,3 GB. Para usarlo hay que cargar el modelo base Qwen2.5-Coder-7B-Instruct en 4 bits y aplicar el adaptador encima mediante la librería PEFT.

El entrenamiento se realizó con SFT (supervised fine-tuning) usando el framework TRL en su versión 1.13.0, sobre PEFT 0.20.0, Transformers 5.14.1, PyTorch 2.11.0+cu128 y Datasets 5.0.1. La model card no documenta el dataset empleado, el número de tokens de entrenamiento, la composición de los datos ni el proceso de alineación posterior; tampoco incluye métricas de evaluación. El nombre del repositorio sugiere un dominio financiero, pero no hay ninguna evidencia documental en la ficha que lo confirme.

El interés de esta ficha es limitado pero ilustrativo: se trata de un ejemplo de adaptación de bajo coste sobre un modelo de código de 7B, con licencia no declarada, cero descargas y cero valoraciones en el momento de la consulta, y con la etiqueta GGUF presente pese a que la model card no detalla cuantizaciones publicadas. Todo ello obliga a tratar cualquier afirmación sobre su calidad con extrema cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only; arquitectura del modelo base no detallada en la ficha |
| Parametros totales | 40.370.176 parametros en el adaptador (dato real de safetensors); el modelo base es de 7B |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la ficha del adaptador; heredada del modelo base (Qwen2.5-Coder-7B-Instruct) |
| Tipos de cuantizacion | No disponible. El repositorio incluye las etiquetas `gguf` y `safetensors`, pero la model card no detalla las cuantizaciones publicadas |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card incluye un campo `licence: license` sin contenido) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) y GGUF segun etiquetas del repositorio |
| Modelo base | unsloth/Qwen2.5-Coder-7B-Instruct-bnb-4bit |
| Libreria | peft |
| Pipeline | text-generation |
| Dataset de entrenamiento | No disponible |
| Framework de entrenamiento | TRL 1.13.0, PEFT 0.20.0, Transformers 5.14.1, PyTorch 2.11.0+cu128, Datasets 5.0.1, Tokenizers 0.22.2 |
| Fecha de creacion | 2026-09-11 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El objeto publicado es un adaptador LoRA, no un modelo completo. Los 40,37 millones de parámetros del fichero safetensors corresponden a las matrices de bajo rango inyectadas en las capas del transformer subyacente; el resto de los pesos residen en el modelo base unsloth/Qwen2.5-Coder-7B-Instruct-bnb-4bit, que a su vez es una versión cuantizada a 4 bits del modelo Qwen2.5-Coder-7B-Instruct. Esto implica que la inferencia requiere descargar el modelo base (varios GB) además del adaptador (0,3 GB) y que la calidad final depende tanto del ajuste como del proceso de cuantización previo del base.

El procedimiento de entrenamiento fue SFT supervisado con TRL, segun declara la propia model card. No se especifica el dataset, el número de pasos, la tasa de aprendizaje, el rango del LoRA (`r`), el valor de `alpha`, las capas objetivo ni si hubo una fase posterior de DPO o RLHF. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, mezcla de expertos ni variantes híbridas). La única información reproducible es el conjunto de versiones de framework, que permite reconstruir el entorno de entrenamiento con bastante fidelidad.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` y el pipeline `text-generation` indican que el adaptador está pensado para diálogo de un solo turno o multi-turno, aunque no se documenta ninguna evaluación al respecto.
- Generación y asistencia sobre código: capacidad heredada del modelo base Qwen2.5-Coder-7B-Instruct, especializado en tareas de programación. No hay evidencia de que el ajuste la preserve o la mejore.
- Soporte de tool calling / function calling: no disponible en la información proporcionada. El modelo base lo soporta, pero no se confirma que el adaptador lo mantenga.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles. No se declara la lista de idiomas.
- Modo de razonamiento explícito (thinking mode): no disponible.
- Capacidades de visión o audio: no disponibles; el repositorio es exclusivamente de texto.
- Capacidad especial declarada: ninguna distinta de las etiquetas estándar (`lora`, `sft`, `peft`).

## Casos de uso

- Plantilla reproducible de fine-tuning con TRL y PEFT: el repositorio documenta las versiones exactas de TRL, PEFT, Transformers, PyTorch y Datasets, por lo que sirve como referencia para reproducir un pipeline de SFT sobre un modelo de 7B cuantizado a 4 bits en una sola GPU.
- Servicio multi-tenant con adaptadores dinámicos: al ocupar solo 0,3 GB, el adaptador se puede cargar y descargar en caliente en motores que soportan LoRA dinámico (vLLM, TGI), permitiendo atender varias especializaciones sobre un mismo modelo base sin duplicar los pesos completos.
- Asistente de código en un pipeline interno: si el ajuste conserva las capacidades del base, el modelo puede emplearse para autocompletado, generación de tests y explicación de fragmentos de código. Requiere una validación propia previa, porque no hay benchmarks publicados.
- Análisis de documentos financieros: el nombre del repositorio apunta a un dominio financiero, de modo que el uso previsto podría ser la extracción y resumen de información de informes o estados financieros. No obstante, no hay ninguna documentación que respalde esta especialización, por lo que solo debería plantearse tras una evaluación con datos propios.
- Generación de scripts de extracción y transformación de datos: al partir de un modelo de código, es razonable usarlo para producir scripts de ETL, consultas SQL o notebooks de análisis; conviene validar la salida con ejecución real en un entorno aislado.
- Baseline de investigación y estudios de ablación: por su tamano reducido, el adaptador es útil como punto de partida para comparar estrategias de ajuste (rango, capas objetivo, datos) sobre un mismo modelo base, controlando el resto de variables.
- Despliegue en hardware de gama media con GGUF: la etiqueta `gguf` sugiere la existencia de versiones cuantizadas para llama.cpp u Ollama, lo que permitiría ejecución en CPU o en GPU con poca VRAM, siempre que se confirme la disponibilidad real de esos ficheros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra métrica, y tampoco se han encontrado evaluaciones de terceros en la búsqueda web realizada.

## Requisitos de hardware

- VRAM para el adaptador: inapreciable por sí solo (0,3 GB en disco); requiere cargar el modelo base de 7B.
- Estimaciones orientativas para el modelo base de 7B (no medidas sobre este adaptador): en bf16/fp16, en torno a 14-16 GB de VRAM; en 8 bits, aproximadamente 8-9 GB; en 4 bits (bnb o GGUF Q4_K_M), alrededor de 4-5 GB; en GGUF Q8_0, unos 7-8 GB.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para bf16; A100 40/80 GB y H100 para despliegue concurrente de alto throughput; RTX 4060 Ti 16 GB o RTX 3060 12 GB para cuantizaciones de 4-5 bits.
- Compatibilidad con GPU de consumo: sí, en cuantización de 4 bits cabe en tarjetas de 8-12 GB como la RTX 3060 12 GB, la RTX 4060 Ti 8/16 GB o la RTX 4070, siempre que el contexto configurado no sea muy grande por el coste de la caché KV.
- Opciones de despliegue: transformers + PEFT (ruta nativa del repositorio), vLLM y TGI con soporte de adaptadores LoRA, llama.cpp y Ollama si las cuantizaciones GGUF son válidas y completas, y fusionado del adaptador en el modelo base para servir un modelo único.
- Latencia y throughput: no disponible. No se han publicado mediciones para este adaptador ni para su combinación con el base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Observaciones |
|---|---|---|---|---|---|
| airfoilia1/pure-fin-sniper (este adaptador) | 40,37 M en el adaptador + base de 7B | No disponible | No disponible | 0 descargas, 0 likes | Sin benchmarks ni dataset documentado |
| unsloth/Qwen2.5-Coder-7B-Instruct-bnb-4bit (base) | 7B | No disponible en esta ficha | No disponible en esta ficha; el modelo original Qwen2.5-Coder se distribuye bajo Apache-2.0 | Ampliamente utilizado | Modelo base cuantizado a 4 bits sobre el que se aplica el adaptador |
| Qwen2.5-Coder-7B-Instruct (original) | 7B | No disponible en la informacion proporcionada | Apache-2.0 segun su documentacion publica | Muy alta, con versiones GGUF, AWQ y GPTQ | Referencia directa de calidad para cualquier ajuste derivado |
| Adaptadores LoRA genericos sobre modelos de 7B | Tipicamente 10-200 M | Depende del base | Depende del autor y del base | Variable | Coste de almacenamiento bajo y despliegue sencillo con motores que soportan LoRA |

No se dispone de datos comparativos de rendimiento entre este adaptador y las alternativas, porque no se ha publicado ninguna evaluación.

## Limitaciones y advertencias

- Licencia no declarada: la model card incluye un campo de licencia vacío y los metadatos de HuggingFace indican "no disponible". Sin una licencia explícita, no hay autorización clara para uso comercial ni para redistribución, lo que supone un riesgo legal en producción.
- Ausencia total de evaluación: no hay benchmarks, ni evaluación humana, ni métricas de pérdida, de modo que no se puede afirmar que el ajuste mejore al modelo base en ninguna tarea.
- Dataset desconocido: al no documentarse los datos de SFT, no es posible analizar sesgos, cobertura temática ni posibles problemas de contaminación o de derechos sobre los datos.
- Riesgo de alucinación: inherente a los modelos de 7B y no mitigado de forma documentada. Se agrava en dominios especializados como el financiero, donde el nombre del repositorio sugiere un uso para el que no existe evidencia.
- Capacidad de inyección de conocimiento limitada: con 40,37 millones de parámetros entrenables, el adaptador puede modificar estilo y formato, pero difícilmente incorporar conocimiento factual extenso y fiable.
- Idiomas no declarados: se desconoce el soporte real multilingüe y, en particular, el comportamiento en castellano.
- Fecha de creación anómala: los metadatos indican 2026-09-11, posterior a la fecha de consulta habitual, lo que puede indicar un error de reloj en el entorno de publicación o metadatos poco fiables.
- Sin validación comunitaria: 0 descargas y 0 likes implican que no hay retroalimentación de terceros sobre su funcionamiento real.
- Coherencia de ficheros GGUF no verificada: la etiqueta `gguf` está presente, pero la model card no describe cuantizaciones concretas ni incluye instrucciones de uso, por lo que su disponibilidad funcional debe comprobarse antes de planificar un despliegue.
- Dependencia del proceso de cuantización del base: el modelo base ya está cuantizado a 4 bits, lo que puede degradar la calidad de partida antes incluso de aplicar el adaptador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/airfoilia1/pure-fin-sniper
- Modelo base usado para el ajuste: https://huggingface.co/unsloth/Qwen2.5-Coder-7B-Instruct-bnb-4bit
- Repositorio de TRL (framework de entrenamiento declarado): https://github.com/huggingface/trl
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los unicos enlaces disponibles son los anteriores.

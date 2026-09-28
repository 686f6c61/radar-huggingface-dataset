# datafromlopes/llama-3.1-8b-atlassql-br

## Resumen

llama-3.1-8b-atlassql-br es un adaptador LoRA (PEFT) sobre meta-llama/Llama-3.1-8B-Instruct, desarrollado por Diego O. Lopes (datafromlopes) y ajustado para una única tarea: traducir preguntas en portugués brasileño a consultas SQL con extensión espacial PostGIS. El adaptador está especializado en el esquema de la base de datos CulturaEduca, una plataforma de georreferenciación del territorio educativo brasileño que contiene escuelas, equipamientos públicos y la jerarquía territorial de siete niveles del IBGE.

El modelo no recibe el esquema en el prompt: se apoya en el conocimiento memorizado durante el fine-tuning de las tablas, columnas y funciones espaciales del esquema CulturaEduca. Resuelve un problema poco cubierto por los modelos text-to-SQL generalistas, que rara vez manejan funciones espaciales ni jerarquías territoriales administrativas en portugués. Es el modelo reportado en la tesis de máster AtlasSQL-BR (IME-USP, 2026), con una primera versión del experimento publicada en el SBBD 2026.

Técnicamente es un adaptador de rango bajo de tan solo 8 dimensiones sobre las proyecciones q_proj y v_proj de los 32 bloques del transformer, lo que supone menos del 0,5 % de los parámetros del modelo base (8.000 millones). Se entrenó con 784 pares pregunta-SQL en una MacBook Pro con M5 Pro de 48 GB de memoria unificada en 2 horas y 44 minutos, lo que lo convierte en un ejemplo reproducible de adaptación de bajo coste sobre hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only autorregresivo (Llama 3.1) con adaptador LoRA (PEFT) sobre las capas de atención q_proj y v_proj |
| Parametros totales | 8.000 millones en el modelo base; el adaptador LoRA supone menos del 0,5 % de parámetros entrenables |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base Llama 3.1 8B Instruct; no especificada de forma independiente para el adaptador |
| Tipos de cuantizacion | no disponible para el adaptador (pesos LoRA en bf16/fp16); una vez fusionado con el base se pueden aplicar las cuantizaciones soportadas por Llama 3.1 8B (8 bits, 4 bits, GGUF) |
| Idiomas soportados | portugués (pt), concretamente portugués brasileño; el modelo base es multilingüe con ocho idiomas soportados oficialmente |
| Licencia | MIT para los pesos del adaptador; el modelo base queda sujeto a la Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, library_name: peft) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama 3.1 8B Instruct, un transformer decoder-only autorregresivo con atención agrupada por consultas (GQA) y ventana de contexto de 128.000 tokens. El ajuste es un LoRA clásico con r = 8, alpha = 32 y dropout = 0.1, aplicado exclusivamente a q_proj y v_proj, con menos del 0,5 % de parámetros entrenables. El prompt de entrenamiento es fijo y sin esquema: `Traduza para SQL: {question}`.

Los datos proceden del split `thesis-split` del dataset AtlasSQL-BR: 784 pares de entrenamiento y 196 de validación, estratificados por nivel de complejidad, función espacial y división territorial. La optimización usó 10 épocas con batch 2 y acumulación 2, AdamW, learning rate 5e-5 con decaimiento lineal, weight decay 0.01, 612 pasos de warmup, bf16 y gradient checkpointing. El checkpoint seleccionado es el de la época 6, con la pérdida de validación mínima de 0,172 frente a 1,180 del modelo base. El entrenamiento se ejecutó en una Apple MacBook Pro con chip M5 Pro y 48 GB de memoria unificada usando PyTorch MPS, en 2 horas y 44 minutos: no hubo RLHF ni DPO, solo ajuste supervisado sobre pares de instrucción y respuesta.

## Capacidades

- Generación de SQL PostGIS a partir de preguntas en portugués brasileño, sin inyección de esquema en el prompt.
- Manejo de funciones espaciales: el adaptador alcanza un F1 de 0,639 en la categoría de funciones geoespaciales, frente a 0,108 del modelo base.
- Razonamiento sobre jerarquías territoriales de siete niveles del IBGE, incluidas divisiones administrativas anidadas.
- Consultas sobre entidades concretas: escuelas, bibliotecas, equipamientos públicos y su georreferenciación.
- Producción de consultas estructuralmente válidas: F1 estructural de 0,753 en el split de validación de 196 pares.
- Generación de SQL compuesto mediante CTE, ya que el post-procesado conserva la primera sentencia `WITH` o `SELECT` del resultado.
- Capacidades generales heredadas del modelo base (instrucciones, conversación, multilingüismo, tool calling de Llama 3.1), aunque no se han evaluado específicamente en el adaptador.
- No dispone de capacidades multimodales ni de audio: es un modelo exclusivamente de texto.

## Casos de uso

- Consultas geoespaciales en lenguaje natural sobre CulturaEduca: un gestor público escribe "Quais escolas estão a até 2 km da biblioteca municipal de Campinas?" y el adaptador genera la consulta PostGIS equivalente con `ST_DWithin` sobre las tablas del esquema interno, sin que el usuario conozca SQL.
- Paneles de análisis territorial por niveles IBGE: generación automática de consultas agregadas por municipio, estado o región para informes de cobertura educativa, aprovechando el ajuste sobre las siete divisiones administrativas del dataset.
- Asistentes de datos internos para personal no técnico: el modelo actúa como capa de traducción entre preguntas en portugués y el motor PostGIS de una organización, siempre con validación previa de la consulta generada.
- Investigación en text-to-SQL geoespacial: sirve como línea base reproducible para comparar arquitecturas y estrategias de prompting en el dominio geoespacial en portugués, con código de evaluación público en el repositorio de GitHub.
- Punto de partida para otros esquemas PostGIS: al ser un adaptador LoRA ligero, se puede reentrenar sobre esquemas distintos (catastro, sanidad, infraestructuras) reutilizando la misma receta de hiperparámetros y hardware de consumo.
- Benchmarking de adaptación de bajo coste: caso práctico para comparar el rendimiento de un LoRA de r = 8 entrenado en una sola GPU integrada frente a ajustes completos o modelos dedicados de mayor tamaño.
- Generación asistida de consultas en pipelines de datos: el SQL producido se post-procesa (eliminación de cercas de código y etiquetas, conservación de la primera sentencia) y puede pasar a un revisor humano antes de ejecutarse contra producción.
- Docencia en PLN aplicado al portugués brasileño: ejemplo completo y de coste reducido que cubre desde la construcción del dataset hasta la evaluación con métricas de ejecución y F1 estructural.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el split de validación de 196 pares, comparando el modelo base con el adaptador:

| Metrica | Modelo base | Este adaptador |
|---|---:|---:|
| Execution Accuracy (%) | 0,0 | 15,8 |
| Executable Rate (%) | 0,0 | 52,6 |
| Token F1 | 0,285 | 0,757 |
| Structural F1 | 0,169 | 0,753 |
| Geospatial Function F1 | 0,108 | 0,639 |
| Spatial Exact Match (%) | 0,5 | 28,1 |

Los desgloses completos por nivel de complejidad, división territorial y función espacial, junto con el código de evaluación, están en el repositorio de código del proyecto. No se han publicado en la información disponible resultados de benchmarks generalistas (MMLU, HumanEval, GSM8K) para este adaptador.

## Requisitos de hardware

- Inferencia en bf16/fp16: aproximadamente 16 GB solo de pesos del modelo base, más el coste de la caché KV, lo que en la práctica exige 20-24 GB de VRAM.
- Inferencia en 8 bits: en torno a 9 GB de VRAM, viable en GPUs de 12-16 GB.
- Inferencia en 4 bits: aproximadamente 5-6 GB de pesos, con margen para contextos moderados en GPUs de 8-12 GB.
- El adaptador en sí ocupa una fracción mínima: el repositorio reporta 0,0 GB de tamaño, muy por debajo de los pesos completos del modelo base.
- GPU recomendadas para servicio en producción: A100 (40 u 80 GB), H100, L40S o L4; para uso individual, RTX 4090 o RTX 3090 (24 GB) cubren sin problema el modelo en bf16.
- Cabe en GPU de consumo: sí, con cuantización de 4 bits en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070) y sin cuantizar en RTX 3090/4090.
- Entrenamiento del adaptador: la model card documenta un entrenamiento completo en una Apple MacBook Pro con M5 Pro y 48 GB de memoria unificada, lo que confirma que el ajuste LoRA cabe en hardware no dedicado.
- Opciones de despliegue: transformers + peft (referencia en la model card), vLLM con soporte de adaptadores LoRA, TGI y, previa fusión del adaptador y conversión a GGUF, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Rendimiento en el split de validacion |
|---|---|---|---|---|---|
| llama-3.1-8b-atlassql-br | 8.000 M (base) + LoRA de menos del 0,5 % | 128.000 tokens (base) | Adaptador LoRA especializado en el esquema CulturaEduca, sin esquema en el prompt | MIT (adaptador) + Llama 3.1 Community License (base) | Execution Accuracy 15,8 %; Executable Rate 52,6 %; Token F1 0,757 |
| meta-llama/Llama-3.1-8B-Instruct (base) | 8.000 M | 128.000 tokens | Modelo generalista de instrucciones, sin conocimiento del esquema | Llama 3.1 Community License | Execution Accuracy 0,0 %; Executable Rate 0,0 %; Token F1 0,285 |
| Adaptadores text-to-SQL específicos de esquema (por ejemplo, defog/sqlcoder-7b-2) | no disponible en la información proporcionada | no disponible en la información proporcionada | Fine-tuning supervisado sobre esquemas concretos, normalmente con el esquema inyectado en el prompt | no disponible en la información proporcionada | no disponible en la información proporcionada |

La comparación directa solo es posible frente al modelo base, ya que los resultados publicados se calcularon sobre el split propietario de AtlasSQL-BR y no son trasladables a benchmarks generalistas ni a otros esquemas.

## Limitaciones y advertencias

- Execution Accuracy del 15,8 %: menos de una de cada cinco consultas generadas produce el resultado correcto esperado, por lo que el modelo no es apto para producción sin revisión humana.
- Executable Rate del 52,6 %: cerca de la mitad de las consultas generadas ni siquiera se ejecutan contra PostGIS, normalmente por tablas, columnas o funciones inexistentes.
- Dependencia total del esquema: al no inyectar el esquema en el prompt, el adaptador solo funciona con el esquema CulturaEduca y no generaliza a otras bases de datos sin reentrenamiento.
- Riesgo de alucinación estructural: puede inventar nombres de tablas, columnas y funciones espaciales, especialmente fuera de los patrones vistos en el conjunto de entrenamiento.
- Conjunto de entrenamiento pequeño: 784 pares, con 10 épocas sobre el mismo material, lo que eleva el riesgo de sobreajuste; el checkpoint elegido (época 6) ya muestra el criterio de selección por pérdida de validación mínima.
- Cobertura lingüística limitada: solo portugués brasileño; no hay evidencia de funcionamiento en otras variedades del portugués ni en otros idiomas con la terminología geoespacial específica.
- Sin datos de evaluación externa: los resultados proceden de un único split de validación de 196 pares del propio dataset, sin conjunto de test independiente publicado en la información disponible.
- Post-procesado obligatorio: hay que eliminar cercas de código y etiquetas de anotación y conservar únicamente la primera sentencia `WITH` o `SELECT` antes de cualquier uso.
- Licencia dual: los pesos del adaptador son MIT, pero el modelo base está sujeto a la Llama 3.1 Community License, que impone condiciones de atribución, nomenclatura y límites de uso comercial a gran escala.
- Sin métricas de latencia, throughput ni consumo: no hay datos publicados que permitan estimar costes de servicio en producción.
- Adopción nula registrada: 0 descargas y 0 likes en el momento de la consulta, sin retroalimentación de la comunidad que valide los resultados de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/datafromlopes/llama-3.1-8b-atlassql-br
- Dataset AtlasSQL-BR: https://huggingface.co/datasets/datafromlopes/atlas-sql-br
- Repositorio de código y evaluación: https://github.com/datafromlopes/atlas-sql-br
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Modelo base (variante sin instrucciones): https://huggingface.co/meta-llama/Llama-3.1-8B
- Sitio oficial de Meta Llama 3: https://github.com/meta-llama/llama3
- Referencia del SBBD 2026 (Lopes y Braghetto, "AtlasSQL-BR: A Brazilian Portuguese Geospatial Text-to-SQL Dataset with Spatial Hierarchies"): no disponible enlace directo en la información proporcionada.

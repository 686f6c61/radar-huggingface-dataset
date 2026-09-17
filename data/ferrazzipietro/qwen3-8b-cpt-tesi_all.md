# ferrazzipietro/Qwen3-8B-cpt-tesi_all

## Resumen

`ferrazzipietro/Qwen3-8B-cpt-tesi_all` es un repositorio de pesos publicado por el usuario ferrazzipietro que contiene un modelo de 8.188.556.288 parámetros. La etiqueta `qwen3` y el recuento de parámetros, coherente con Qwen3-8B, apuntan a un ajuste por preentrenamiento continuado (CPT, *continued pre-training*) sobre dicho modelo base. El sufijo `tesi` sugiere que el artefacto procede de un trabajo de tesis. El repositorio no incluye model card descriptiva: no declara licencia, idiomas, pipeline, corpus ni hiperparámetros.

La relevancia de este tipo de artefactos radica en que el CPT sobre modelos densos de 8B permite especializar un modelo generalista en un dominio concreto (legal, sanitario, académico o industrial) sin disparar el coste de inferencia, que se mantiene en el rango de un 8B denso. Sin embargo, al no documentarse el corpus ni el procedimiento, no es posible verificar la ganancia en el dominio objetivo ni cuantificar el olvido catastrófico sobre las capacidades originales.

El estado del repositorio (59 descargas, 0 likes, 180,2 GB de tamaño y sin cuantizaciones publicadas) indica que se trata de un volcado de investigación, probablemente con estados del optimizador incluidos, y no de un modelo empaquetado para producción. Cualquier evaluación seria exige reproducir el pipeline de cuantización y validar el modelo contra el Qwen3-8B original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No documentada en el repositorio. El modelo base Qwen3-8B es un transformer denso causal con QK-Norm, SwiGLU, RoPE y GQA |
| Parametros totales | 8.188.556.288 (dato verificado en los safetensors del repositorio) |
| Parametros activos | No aplica: arquitectura densa (no MoE) |
| Longitud de contexto | No disponible en el repositorio. El modelo base Qwen3-8B soporta 32.768 tokens nativos, extensibles a 131.072 con YaRN |
| Tipos de cuantizacion | No disponible. Solo se publican pesos en safetensors; no hay GGUF, AWQ, GPTQ ni FP8 en el repositorio |
| Idiomas soportados | No disponible. El modelo base Qwen3-8B declara 119 idiomas, pero el CPT puede haber alterado la cobertura |
| Licencia | No disponible. El repositorio no declara licencia; el modelo base Qwen3-8B se distribuye bajo Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura específica de este ajuste. Por el identificador y el recuento de parámetros (8.188.556.288, equivalente a los ~8,2B de Qwen3-8B), lo razonable es asumir que se parte de la arquitectura del modelo base: un transformer denso de tipo decoder-only con 36 capas, *hidden size* de 4096, 32 cabezas de atención con 8 cabezas KV (GQA), normalización QK-Norm, activación SwiGLU y codificación posicional RoPE. Esta descripción corresponde al modelo base y no está confirmada para este repositorio.

Tampoco se documentan el número de tokens de entrenamiento, la composición del corpus, el uso de RLHF/DPO ni ninguna innovación técnica. El término `cpt` en el nombre sugiere una fase de preentrenamiento continuado sobre un corpus adicional, presumiblemente en el dominio de la tesis del autor, pero no hay evidencia publicada del dataset ni de los hiperparámetros (tasa de aprendizaje, número de épocas, estrategia de *replay* para mitigar el olvido). El tamaño del repositorio, 180,2 GB para un modelo de 8,19B parámetros, es aproximadamente 22 veces el tamaño de los pesos en BF16 (~16,4 GB), lo que indica la presencia de múltiples *checkpoints* o estados del optimizador.

## Capacidades

- Generación de texto y razonamiento general: capacidades heredadas del modelo base Qwen3-8B, no verificadas para este ajuste.
- Modo *thinking* y modo directo: Qwen3-8B incorpora ambos modos, pero no hay confirmación de que se conserven tras el CPT.
- Generación de código y matemáticas: presumiblemente heredadas del base, sin benchmarks que lo confirmen.
- Soporte de *tool calling* / *function calling*: capacidad del base Qwen3, no documentada en este repositorio.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el base cubre 119 idiomas.
- Capacidades especiales (visión, audio): no disponible; Qwen3-8B es exclusivamente texto.

## Casos de uso

Advertencia previa: el dominio del CPT no está documentado, por lo que los casos siguientes son aplicaciones genéricas de un transformer denso de 8B con contexto largo, y requieren validación empírica contra el modelo base antes de cualquier despliegue.

- Especialización de dominio mediante CPT: el escenario natural del artefacto es servir como punto de partida para un *fine-tuning* supervisado en un dominio concreto (legal, médico, financiero), aprovechando que el CPT ya ha adaptado la distribución del vocabulario y del estilo al corpus objetivo.
- Atención al cliente automatizada: con 32.768 tokens de contexto heredados del base, el modelo puede gestionar conversaciones multi-turno extensas y mantener el hilo de incidencias abiertas sin truncar el historial.
- Generación de código asistida: un 8B denso se ejecuta en una única GPU de 24 GB en cuantización Q4/Q5, lo que permite desplegar un asistente de código interno con latencia baja y sin dependencia de APIs externas.
- Extracción de información estructurada: procesamiento de documentos largos (contratos, informes, historiales) para producir JSON validado, apoyándose en la ventana de contexto y en un decodificador restringido por gramática.
- Síntesis y resumen de documentación técnica: resumen de manuales, especificaciones o artículos científicos en bloques de hasta 32.000 tokens, con salida en el idioma del corpus de CPT si este resulta ser monolingüe.
- Prototipado e investigación académica: al ser un artefacto de tesis, sirve como material reproducible para estudiar el efecto del CPT sobre un modelo de referencia, comparando perplejidad en dominio y en conjuntos generales como MMLU o GSM8K.
- Base para pipelines RAG: integrado con un almacén vectorial mediante vLLM o TGI, el modelo actúa como generador final sobre fragmentos recuperados, con la ventaja de que su tamaño permite ejecutarlo en hardware modesto.
- Clasificación y etiquetado por lotes: *scoring* de grandes volúmenes de texto (moderación, categorización de tickets, análisis de sentimiento) aprovechando el *throughput* alto de un modelo de 8B en vLLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K, MT-Bench ni de perplejidad en el dominio del CPT, y la búsqueda web realizada no ha devuelto ningún artículo, informe o entrada de blog asociada a este modelo.

## Requisitos de hardware

Estimaciones calculadas a partir del recuento de parámetros verificado (8.188.556.288). No se han publicado medidas reales de latencia ni de memoria por parte del autor.

| Cuantización | Peso aproximado | VRAM mínima estimada (8k de contexto) |
|---|---|---|
| BF16 / FP16 | 16,4 GB | 18-19 GB |
| FP8 / INT8 | 8,2 GB | 10-11 GB |
| GGUF Q8_0 | 8,7 GB | 10-11 GB |
| GGUF Q5_K_M | 5,7 GB | 7,5-8 GB |
| GGUF Q4_K_M | 5,0 GB | 6,5-7 GB |

- GPU recomendadas: RTX 4090 (24 GB) para BF16 con contexto moderado o Q4/Q5 con contexto completo; A100 40/80 GB y H100 para servicio concurrente en BF16; 2x RTX 4090 o A6000 48 GB para BF16 con 32k de contexto y lotes pequeños.
- GPU de consumo: cabe en RTX 3090, 4080, 4090 y en tarjetas de 16 GB usando cuantización Q4 o Q5. No cabe en GPUs de 8-12 GB en BF16.
- Opciones de despliegue: vLLM y SGLang para servicio de alto *throughput*; TGI como alternativa; llama.cpp y Ollama requieren convertir previamente los safetensors a GGUF, ya que el repositorio no publica cuantizaciones.
- Latencia y throughput: no disponible. No se han publicado medidas del autor y las estimaciones dependen de la GPU, la cuantización y el tamaño de lote.

## Comparativa con modelos similares

Los datos de la columna del modelo objeto de la ficha son los únicos verificados en el repositorio; los del resto proceden de la documentación pública de cada modelo base.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ferrazzipietro/Qwen3-8B-cpt-tesi_all | 8,19B | no disponible (base: 32.768 nativos) | No declarada | safetensors, 59 descargas, sin cuantizaciones |
| Qwen/Qwen3-8B | 8,2B | 32.768 nativos / 131.072 con YaRN | Apache 2.0 | safetensors y GGUF, ampliamente desplegado |
| meta-llama/Llama-3.1-8B | 8,03B | 131.072 | Llama 3.1 Community License | safetensors, ecosistema maduro |
| google/gemma-2-9b-it | 9,24B | 8.192 | Gemma Terms of Use | safetensors, requiere aceptar términos |

No se dispone de métricas de benchmarks comparables, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita, el uso comercial queda en un limbo legal. No se puede asumir la herencia automática de la Apache 2.0 de Qwen3-8B para los pesos derivados.
- Ausencia total de documentación: no hay model card, ni dataset, ni hiperparámetros, ni instrucciones de uso. La reproducibilidad es nula.
- Riesgo de olvido catastrófico: el CPT sin *replay* documentado puede degradar capacidades generales (razonamiento, código, matemáticas) de forma no medida.
- Sesgos del corpus de CPT: al desconocerse el dataset, no es posible auditar sesgos de género, raza, ideología o nacionalidad introducidos durante el preentrenamiento continuado.
- Riesgo de alucinación: inherente a los modelos de 8B, especialmente en tareas de recuperación factual sin soporte documental.
- Idioma de especialización desconocido: si el corpus de CPT es monolingüe (el nombre del autor y el sufijo `tesi` sugieren italiano), el rendimiento en castellano podría haber empeorado respecto al base.
- Posible modificación del tokenizador: no se documenta si se añadieron tokens al vocabulario durante el CPT, lo que afectaría a la compatibilidad con herramientas y plantillas de chat del ecosistema Qwen.
- Tamaño del repositorio: 180,2 GB implican que probablemente se están descargando estados del optimizador o múltiples revisiones, lo que complica el despliegue y consume almacenamiento innecesario.
- Sin cuantizaciones publicadas: cualquier despliegue eficiente exige convertir los pesos a GGUF, AWQ, GPTQ o FP8, un proceso no validado por el autor.
- Sin histórico de evaluación independiente: 59 descargas y 0 likes implican ausencia de validación por parte de la comunidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ferrazzipietro/Qwen3-8B-cpt-tesi_all
- No se han encontrado en la búsqueda web artículos, papers, repositorios de código ni demos asociados a este modelo. Los resultados devueltos por la búsqueda corresponden a temas sin relación (clientes de ChatGPT y discusiones generales sobre suscripciones), por lo que no se incluyen.

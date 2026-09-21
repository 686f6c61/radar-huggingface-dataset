# eress6969/qwen14b-memento-swe-agent

## Resumen

qwen14b-memento-swe-agent es un ajuste fino (fine-tune) publicado por el usuario eress6969 sobre el modelo base unsloth/Qwen2.5-Coder-14B-Instruct-bnb-4bit, es decir, sobre una versión de Qwen2.5-Coder-14B-Instruct ya cuantizada a 4 bits con bitsandbytes. El nombre del repositorio sugiere que el objetivo del ajuste es construir un agente de ingeniería de software (SWE agent), aunque la model card no documenta ni el conjunto de datos, ni los hiperparámetros, ni el procedimiento de entrenamiento más allá de indicar que se usó Unsloth para acelerar el entrenamiento 2x.

El modelo se distribuye con licencia Apache-2.0 y declara únicamente el idioma inglés. El repositorio ocupa 0,3 GB, un tamaño muy inferior a los aproximadamente 8-9 GB que ocuparía un modelo de 14 000 millones de parámetros en 4 bits, lo que apunta a que el repositorio contiene únicamente los adaptadores (presumiblemente LoRA/QLoRA) y no los pesos completos fusionados. Esta circunstancia condiciona por completo su despliegue, como se detalla más adelante.

Su relevancia es limitada y de carácter exploratorio: no tiene descargas ni valoraciones, carece de benchmarks publicados y su model card es una plantilla generada automáticamente por Unsloth. Resulta útil como ejemplo de flujo de trabajo QLoRA reproducible, pero no hay evidencia pública de que supere al modelo base en ninguna tarea.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con RoPE, GQA (8 cabezas KV), SwiGLU y RMSNorm; corresponde a la familia Qwen2 del modelo base. No se documenta ningún cambio arquitectónico en el ajuste |
| Parametros totales | Herencia del modelo base Qwen2.5-Coder-14B-Instruct: ~14 700 millones según documentación pública del base. La model card no lo especifica |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | Herencia del base: 32 768 tokens nativos y extensible a 131 072 con RoPE scaling tipo YaRN. No confirmado en la model card para este ajuste |
| Tipos de cuantizacion | El modelo base del que parte es bnb-4bit (NF4 de bitsandbytes). El repositorio no publica GGUF, AWQ, GPTQ ni ninguna cuantización propia |
| Idiomas soportados | en (inglés), declarado en la model card. El modelo base es multilingüe, pero no hay confirmación de que el ajuste conserve esas capacidades |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (etiqueta del repositorio). Tamaño del repositorio: 0,3 GB, compatible con transformers, PEFT y text-generation-inference |

Nota: los valores marcados como "herencia del base" proceden de la documentación pública de Qwen2.5-Coder-14B-Instruct, no de la información proporcionada por el autor de este ajuste.

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-Coder-14B-Instruct: un transformer decoder-only de aproximadamente 48 capas, dimensión oculta de 5120, 40 cabezas de atención con 8 cabezas KV (GQA) y head_dim de 128, con normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). El modelo base fue entrenado por Alibaba sobre un corpus masivo orientado a código (la familia Qwen2.5-Coder declara 5,5 billones de tokens en su fase de preentrenamiento) y posteriormente alineado mediante instrucciones. No hay ninguna innovación arquitectónica propia en este ajuste.

El proceso de ajuste documentado se limita a dos datos: se usó Unsloth, con un supuesto incremento de velocidad de 2x, y el entrenamiento se hizo mediante TRL. El punto de partida es una versión previamente cuantizada a 4 bits (bnb-4bit), lo que implica un flujo de QLoRA: adaptadores de bajo rango entrenados sobre pesos congelados ya cuantizados. Esto tiene una consecuencia técnica relevante: la cuantización previa introduce error numérico antes del ajuste, y los adaptadores resultantes no pueden fusionarse limpiamente con los pesos del modelo original en precisión completa, porque los pesos originales en bf16 no forman parte del repositorio. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el rango y alpha del LoRA, la tasa de aprendizaje, las épocas ni si hubo fases de RLHF, DPO o RLAIF.

## Capacidades

Las siguientes capacidades se atribuyen al modelo base Qwen2.5-Coder-14B-Instruct y, por tanto, son las que el ajuste podría heredar en mayor o menor medida. No hay evaluación independiente que confirme su conservación tras el fine-tune.

- Generación de código en múltiples lenguajes de programación (Qwen declara soporte para más de 90 lenguajes en la familia Coder).
- Razonamiento sobre código a nivel de repositorio, incluyendo comprensión de dependencias y estructura de proyectos.
- Relleno en medio (fill-in-the-middle, FIM), útil para autocompletado en editores.
- Tool calling / function calling mediante plantillas de chat compatibles con el formato Hermes de Qwen.
- Ejecución de flujos agénticos multi-paso, que es el uso que sugiere el sufijo "swe-agent" del nombre del repositorio (resolución de incidencias de software de forma autónoma).
- Razonamiento matemático básico y generación de pruebas unitarias.
- Capacidades multilingües en lenguaje natural heredadas del base, aunque la model card declara solo inglés.

No se documenta ningún modo de razonamiento explícito (thinking mode), soporte de visión, audio ni decodificación especulativa propia. El formato exacto de prompt, las plantillas de herramientas y el esquema de acciones del agente no están publicados, lo que impide reproducir el comportamiento previsto sin ingeniería inversa.

## Casos de uso

- Resolución automática de incidencias en repositorios: el modelo puede recibir el enunciado de un issue junto con fragmentos del repositorio y generar un parche. Es el caso de uso que sugiere su nombre, aunque requiere definir externamente el bucle agéntico (ejecución de tests, lectura de ficheros, reintentos).
- Revisión de código en pipelines de integración continua: integrado como paso previo al merge para detectar errores evidentes, malas prácticas o falta de manejo de excepciones en los diffs.
- Generación de pruebas unitarias: a partir de una función o un módulo, producir casos de prueba que aumenten la cobertura, aprovechando el contexto de 32 768 tokens del base para incluir varios ficheros relacionados.
- Refactorización asistida: renombrado coherente, extracción de funciones y migración de APIs obsoletas en bases de código de tamaño medio.
- Asistente de autocompletado local: desplegado en una estación de trabajo con GPU de consumo para autocompletar código sin enviar el código fuente a servicios externos, siempre que se resuelva el formato de pesos (ver limitaciones).
- Documentación técnica automatizada: generación de docstrings, ficheros README y comentarios de mantenimiento a partir del propio código.
- Migración de código entre lenguajes o frameworks: traducción de fragmentos entre, por ejemplo, Python y TypeScript, o de una versión antigua de una biblioteca a la actual.

En todos los casos, el tamaño reducido del repositorio (0,3 GB) implica que el modelo no es directamente servible sin recomponerlo con su base cuantizada, lo que añade un paso de ingeniería previo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna métrica, y la búsqueda web realizada no devolvió resultados relacionados con el modelo: los únicos enlaces obtenidos correspondían a restaurantes de sushi en Bolonia, por lo que no hay papers, blogs ni evaluaciones comparativas asociadas a este repositorio.

Tampoco es posible reproducir aquí las cifras publicadas por Alibaba para Qwen2.5-Coder-14B-Instruct, ya que no forman parte de la información proporcionada. Cualquier comparación numérica con el modelo base sería especulativa sin una evaluación propia.

## Requisitos de hardware

Estimaciones orientativas, calculadas a partir del tamaño del modelo base. No han sido medidas sobre este repositorio concreto.

- Pesos en bf16/fp16: aproximadamente 29-30 GB de VRAM solo para los pesos, más caché KV.
- Pesos en 8 bits: aproximadamente 15-16 GB.
- Pesos en 4 bits (NF4, GPTQ o AWQ): aproximadamente 9-10 GB.
- Adaptadores LoRA: 0,3 GB (tamaño del repositorio), pero requieren cargar encima el modelo base cuantizado.
- Caché KV: asumiendo la configuración pública de Qwen2.5-14B (48 capas, 8 cabezas KV, head_dim 128), cada token consume del orden de 200 KB en fp16; una ventana completa de 32 768 tokens requeriría aproximadamente 6-7 GB adicionales, reducibles mediante cuantización de la caché o GQA-aware paging.
- GPU de consumo: cabe en una RTX 4090 (24 GB) en 8 bits con contexto moderado, o en 4 bits con contexto amplio. En tarjetas de 16 GB (RTX 4080, 4060 Ti 16 GB) solo es viable en 4 bits y con contexto recortado. No cabe en GPUs de 8-12 GB.
- GPU de servidor: A100 40 GB permite bf16 con lotes pequeños; A100 80 GB y H100 80 GB permiten mayor tamaño de lote y contextos largos.
- Opciones de despliegue: transformers + PEFT (necesario para cargar los adaptadores sobre el base bnb-4bit), vLLM, text-generation-inference (la etiqueta del repositorio lo indica) y, tras convertir a GGUF, llama.cpp u Ollama. No hay ficheros GGUF publicados, por lo que Ollama no funciona sin conversión previa.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| qwen14b-memento-swe-agent | Heredado (~14,7B, no confirmado) | Heredado (32 768 nativos, 131 072 con YaRN), no confirmado | Apache-2.0 | Solo adaptadores, 0,3 GB, 0 descargas | No publicado |
| Qwen2.5-Coder-14B-Instruct (modelo base) | ~14,7B | 32 768 nativos, 131 072 con YaRN | Apache-2.0 | Pesos completos en safetensors y GGUF | Publicado por Qwen; cifras no reproducidas aquí |
| Qwen2.5-Coder-32B-Instruct | ~32,5B | 32 768 nativos, 131 072 con YaRN | Apache-2.0 | Pesos completos | Publicado por Qwen; cifras no reproducidas aquí |
| DeepSeek-Coder-V2-Lite-Instruct | 16B totales, 2,4B activos (MoE) | 128 000 | Licencia propia de DeepSeek (uso comercial con condiciones) | Pesos completos | Publicado por DeepSeek; cifras no reproducidas aquí |

Los datos de las filas correspondientes a otros modelos proceden de su documentación pública y se incluyen solo como referencia de categoría. La comparación de rendimiento con este ajuste no es posible porque no existen evaluaciones publicadas del mismo.

## Limitaciones y advertencias

- Ausencia total de evaluación: 0 descargas y 0 valoraciones en el momento de la consulta, sin benchmarks ni validación independiente. No hay ninguna evidencia de que el ajuste mejore al modelo base.
- Documentación mínima: la model card es la plantilla automática de Unsloth. No se especifican dataset, número de tokens, hiperparámetros, rango del LoRA ni procedimiento de evaluación, lo que hace el resultado no reproducible.
- Repositorio incompleto: 0,3 GB es incompatible con los pesos de un modelo de 14B en 4 bits. Lo más probable es que solo contenga adaptadores, de modo que no se puede cargar con `AutoModelForCausalLM.from_pretrained` de forma aislada.
- Cuantización previa al ajuste: entrenar sobre pesos bnb-4bit antes de fusionar (QLoRA sobre base cuantizado) degrada la calidad final y complica la fusión limpia con los pesos originales en bf16.
- Idioma: solo se declara inglés. Aunque el base es multilingüe, el ajuste podría haber estrechado el soporte; no hay datos al respecto, por lo que el uso en castellano es una apuesta sin garantías.
- Riesgo de alucinación de código: como cualquier modelo de código, puede inventar APIs, firmas de funciones o dependencias inexistentes. En un contexto agéntico con ejecución automática de parches, esto es especialmente peligroso.
- Formato de agente no documentado: el sufijo "swe-agent" sugiere un formato de interacción específico (esquema de herramientas, tokens de acción) que no se describe. Sin esa información, el modelo puede comportarse de forma degradada si se usa con plantillas genéricas.
- Restricciones de licencia: Apache-2.0 es permisiva y permite uso comercial, pero conviene verificar también las condiciones de la versión bnb-4bit del base publicada por Unsloth y las dependencias de TRL.
- Degradación en contextos largos: incluso en el modelo base, la calidad cae más allá del contexto nativo de 32 768 tokens, aunque se habilite YaRN.
- Especialización en código: es previsible un rendimiento pobre en tareas de conversación general, creatividad o dominio de conocimiento enciclopédico.
- Fecha de publicación: el repositorio está fechado el 21 de septiembre de 2026, con actualización dos minutos después, lo que sugiere una subida puntual sin mantenimiento posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/eress6969/qwen14b-memento-swe-agent
- Modelo base utilizado: https://huggingface.co/unsloth/Qwen2.5-Coder-14B-Instruct-bnb-4bit
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Documentación de TRL: https://huggingface.co/docs/trl
- Paper de la familia Qwen2.5-Coder: https://arxiv.org/abs/2409.12186

La búsqueda web realizada no devolvió ningún enlace relacionado con este modelo (los resultados obtenidos eran irrelevantes, sobre restaurantes en Bolonia), por lo que no existen papers, blogs ni demos adicionales que referenciar.

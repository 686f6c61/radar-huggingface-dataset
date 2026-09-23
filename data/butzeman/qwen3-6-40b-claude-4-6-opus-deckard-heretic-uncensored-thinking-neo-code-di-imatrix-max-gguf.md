# Butzeman/Qwen3.6-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking-NEO-CODE-Di-IMatrix-MAX-GGUF

## Resumen

Este repositorio es una recopilación de cuantizaciones GGUF del modelo Qwen3.6-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking, desarrollado originalmente por DavidAU y cuantizado aquí por el usuario Butzeman. Se trata de un modelo denso de 39.072.596.736 parámetros (aproximadamente 39B, sin mezcla de expertos) construido en varias fases: primero se aplicó un proceso de abliteración/descensura conocido como Heretic, después se entrenó con cinco datasets internos de carácter y estilo (PkDick-Deckard), luego se expandió desde un Qwen 3.6 de 27B hasta 40B y, finalmente, se afinó con un dataset de destilación de razonamiento de Claude 4.5/4.6 Opus. El resultado declarado es un modelo de 96 capas y 1275 tensores, con 256K de contexto y razonamiento de longitud variable.

El interés de esta ficha concreta está en el trabajo de cuantización: el autor aplica una estrategia denominada NEO-CODE-Di-IMatrix-MAX, que combina dos datasets de imatrix (NEO y NEO-CODE) y ajustes de tensores calibrados mediante métricas, con el objetivo de preservar el rendimiento en contexto largo, conversaciones multi-turno, código y matemáticas. Según las cifras publicadas en la model card, los cuantos alcanzan el 83-84 % de la precisión completa (BF16) en IQ2_M, el 94 % en IQ4_XS y el 98,4 % en Q8_0 HIGH.

Es relevante para quien necesite ejecutar localmente un modelo sin censura, orientado a escritura creativa, rol y código, en hardware de consumo, aceptando las advertencias sobre contenido y sobre la ausencia de verificación independiente de muchas de las afirmaciones del autor. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño total del repositorio es de 259,9 GB (suma de todos los cuantos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no MoE), derivado de Qwen 3.6; 96 capas, 1275 tensores |
| Parametros totales | 39.072.596.736 (aproximadamente 39B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K tokens (segun la model card) |
| Tipos de cuantizacion | GGUF: IQ2_M, IQ4_XS, hasta Q8_0 HIGH (con componentes BF16); familia NEO-CODE-Di-IMatrix-MAX; listado completo de quants no detallado en la informacion disponible |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base se distribuye en bfloat16. Vision requiere un archivo mmproj adicional |

Otros datos: pipeline declarado image-text-to-text; tags destacados: gguf, unsloth, heretic, uncensored, abliterated, multi-stage tuned, imatrix, neo imatrix, di-matrix, coder, creative writing, roleplaying, endpoints_compatible, conversational. Fecha de creacion y ultima actualizacion: 2026-09-23.

## Arquitectura y entrenamiento

La arquitectura es un transformer denso, no una mezcla de expertos. El modelo parte de un Qwen 3.6 de 27B que fue expandido a 40B parámetros, pasando a 96 capas y 1275 tensores (un 50 % más que el modelo base de 27B, según el autor). El pipeline de entrenamiento descrito es multi-etapa: abliteración con Heretic para eliminar el alineamiento de rechazo, entrenamiento con Unsloth sobre cinco datasets internos de DavidAU agrupados como PkDick-Deckard-5-Datasets (orientados a carácter, profundidad, observación y punto de vista), expansión a 40B y un afinado final sobre el dataset TeichAI/claude-4.5-opus-high-reasoning-250x, destinado a acortar y estabilizar el razonamiento. El autor indica que el entrenamiento se realizó con Unsloth sobre hardware local.

La innovación técnica destacable de este repositorio no está en el modelo base, sino en la cuantización. Los cuantos NEO-CODE-Di-IMatrix-MAX usan una doble imatrix (dataset NEO y dataset NEO-CODE) cuyas estadísticas se midieron por separado, se fusionaron y se aplicaron conjuntamente, junto con ajustes adicionales de tensores calibrados mediante benchmarks frente al modelo en BF16. La model card indica que se incluye un cuanto Q8_0 especial con componentes BF16, y que la imatrix no tiene efecto sobre los tensores Q8/BF16. No se especifica en la información disponible el número total de tokens de entrenamiento, la composición detallada de los datasets ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento con modo de pensamiento (thinking) y longitud variable: el autor indica que las consultas menos complejas producen razonamientos más cortos y las más complejas, más largos.
- Escritura creativa y de ficción: relatos, tramas y subtramas, continuacion de escenas, narracion, "prosa vívida", rol y todos los géneros (ciencia ficción, romance, etc.), según los tags del repositorio.
- Generación de código: el repositorio se etiqueta explícitamente como "coder" y el esquema de cuantización se denomina NEO-CODE.
- Capacidades matemáticas: la model card menciona que los cuantos se calibraron para que las tareas de código y matemáticas rindan lo más cerca posible de la precisión completa.
- Visión (image-text-to-text): el pipeline declarado es image-text-to-text y el autor indica que la visión fue probada, requiriendo descargar un archivo mmproj y situarlo en la misma carpeta que el GGUF.
- Conversaciones largas y multi-turno: el trabajo de cuantización se orientó específicamente a contexto largo y conversaciones prolongadas.
- Compatibilidad con endpoints y uso conversacional (tag endpoints_compatible, conversational).
- Sin censura: el modelo está abliterado y se presenta como "uncensored, unfiltered", incluyendo contenido NSFW si se solicita.
- Tool calling / function calling: no documentado en la información disponible.

## Casos de uso

- Escritura de ficción asistida: el modelo puede desarrollar tramas, subtramas, continuar escenas y mantener la voz narrativa a lo largo de decenas de miles de palabras gracias a los 256K de contexto, evitando la pérdida de coherencia en arcos largos que suele producirse con ventanas menores.
- Rol conversacional y narrativa interactiva: con razonamiento de longitud variable y contexto extenso, puede sostener personajes coherentes en sesiones multi-turno largas, donde el historial completo de la partida permanece en contexto.
- Generación de código en local: su etiquetado como "coder" y la calibración específica de los cuantos para código permiten usarlo como asistente de programación en máquinas sin GPU de datacenter, por ejemplo con IQ4_XS en una GPU de 24 GB.
- Traducción y generación bilingüe inglés-chino: al declarar soporte de en y zh, resulta adecuado para pipelines de localización entre esos dos idiomas, aunque no cubre otros idiomas.
- Análisis de documentos extensos: los 256K de contexto permiten introducir contratos, informes técnicos o bases de código medianas en una sola pasada para resumen, extracción y preguntas y respuestas.
- Asistente creativo para guiones y material editorial: generación de ideas, reescritura con estilo marcado y edición de prosa ("vivid prosing"), donde el modelo se presenta explícitamente como colaborador crítico y directo.
- Tareas de razonamiento con modo thinking: resolución de problemas de lógica, matemáticas o planificación donde conviene que el modelo exponga una cadena de razonamiento antes de responder.
- Procesamiento con entrada de imagen: descripción, análisis o discusión de imágenes en local, siempre que se descargue y coloque el mmproj junto al GGUF.
- Despliegue en entornos con restricciones de privacidad: al ser GGUF y ejecutable con llama.cpp u Ollama, permite inferencia completamente offline sin enviar datos a terceros, útil en ámbitos donde no se puede usar una API externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este modelo concreto. La model card únicamente incluye cifras internas de fidelidad de los cuantos frente al modelo en BF16, y una afirmación del autor sin detalle numérico sobre el modelo base ("exceeding the base model in 6 out of 7 benchmarks"). No se dispone de valores de MMLU, HumanEval, GSM8K ni ARC-C para este repositorio, por lo que no se presentan tablas comparativas de rendimiento. Las referencias a 700+ en ARC-C que aparecen en la model card corresponden a otro modelo distinto (Fable-Fusion-711 Qwen 3.6 27B), no a este.

| Cuantizacion | Fidelidad declarada respecto a BF16 |
|---|---|
| IQ2_M | 83-84 % |
| IQ4_XS | 94 % |
| Q8_0 HIGH | 98,4 % |
| Q6 / Q8 (familia NEO) | 97 % y 98 % (segun la seccion de presentacion de los quants) |

Estas cifras proceden exclusivamente de la model card y no han sido verificadas de forma independiente en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculos aproximados a partir de 39,07B parámetros, sin contar caché KV): BF16 en torno a 78 GB; Q8_0 en torno a 41-42 GB; Q6_K en torno a 32-33 GB; Q5_K_M en torno a 27 GB; Q4_K_M en torno a 23-24 GB; IQ4_XS en torno a 21-22 GB; IQ2_M en torno a 13-14 GB. Añadir varios GB por la caché KV si se usa contexto muy largo.
- GPU recomendadas: para BF16 o Q8_0, GPUs de 48-80 GB (A100 80 GB, H100, A6000 48 GB) o configuraciones multi-GPU. Para Q4_K_M/IQ4_XS, una RTX 3090 o RTX 4090 de 24 GB puede alojar el modelo casi por completo. Para IQ2_M, cabe en GPUs de 16 GB con margen.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) con cuantos de 4 bits, y en GPUs de 16 GB con cuantos de 2 bits, aceptando la pérdida de calidad asociada (83-84 % de BF16 en IQ2_M). Los cuantos de 8 bits no caben en una sola GPU de consumo.
- Opciones de despliegue: llama.cpp (llama-server), Ollama, LM Studio, KoboldCpp y otros motores compatibles con GGUF. Para vLLM o TGI sería necesario disponer de pesos en safetensors, que no están incluidos en este repositorio. Para visión hay que descargar también el archivo mmproj.
- Latencia y throughput estimados: no disponible en la información proporcionada.
- Tamaño total del repositorio: 259,9 GB, ya que incluye todos los cuantos; conviene descargar únicamente el archivo del cuanto deseado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Butzeman/Qwen3.6-40B-...-NEO-CODE-Di-IMatrix-MAX-GGUF (este) | 39,07B densos | 256K | GGUF | apache-2.0 | Cuantizacion con doble imatrix; fidelidad declarada 94 % (IQ4_XS) y 98,4 % (Q8_0) |
| DavidAU/Qwen3.6-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking | 39,07B densos | no disponible | safetensors / bfloat16 | no disponible en la informacion | Modelo base sin cuantizar del que deriva este repositorio |
| DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF | 27B (segun denominacion) | no disponible | GGUF | no disponible en la informacion | Modelo hermano de menor tamano citado por el autor; se le atribuyen 2200+ likes, 3 millones de descargas y 700+ en ARC-C |
| DavidAU/Qwen3.6-40B-Fable-Fusion-6-Core-Deckard-Eleanor-Heretic-Uncensored-NM-DAU-NEO-MAX-MTP-GGUF | 40B (segun denominacion) | no disponible | GGUF | no disponible en la informacion | Variante presentada por el autor como version ampliada y de mayor "IQ" del modelo 40B |

No se dispone de datos de benchmarks comparativos verificables entre estos modelos en la información proporcionada, por lo que la comparación se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- Ausencia de verificación independiente: el repositorio registra 0 descargas y 0 likes, y las afirmaciones de rendimiento (superar al modelo base en 6 de 7 benchmarks, superioridad sobre otras cuantizaciones) provienen del propio autor y de enlaces a sus repositorios, no de evaluaciones de terceros citadas en esta información.
- Contenido sin filtrar: el modelo está abliterado y se presenta explícitamente como "uncensored" y "not even remotely SFW". Puede generar contenido ofensivo, violento, sexual o legalmente problemático, y no incorpora mecanismos de rechazo.
- Sesgos: el modelo hereda los sesgos de su base Qwen 3.6 y de los datasets de destilación de Claude Opus y de los datasets de carácter del autor. No se documentan evaluaciones de sesgo y no hay información disponible sobre mitigaciones.
- Riesgo de alucinación: es un modelo de 39B denso orientado a creatividad y con entrenamiento en escritura de ficción, un perfil que tiende a producir texto plausible sin base factual. No se documentan tasas de alucinación ni evaluaciones de fidelidad factual.
- Idiomas limitados: solo se declaran inglés y chino. El castellano no está soportado oficialmente, por lo que su rendimiento en español es incierto y no está evaluado.
- Cuantizaciones agresivas: los cuantos de 2 bits (IQ2_M) conservan, según el autor, solo el 83-84 % de la precisión del BF16, con degradación esperable en tareas de razonamiento, matemáticas y contexto largo. Para producción sensible conviene IQ4_XS o superior.
- Contexto: los 256K declarados son una cifra del autor; no se detalla en la información disponible la ventana de entrenamiento efectiva, la estrategia de RoPE scaling ni evaluaciones específicas a esa longitud, por lo que el rendimiento real en contextos muy largos puede degradarse.
- Licencia: se declara apache-2.0, permisiva para uso comercial. No obstante, el modelo deriva de entrenamiento con datos de destilación de Claude Opus y de datasets del autor cuya procedencia y condiciones no se detallan aquí; conviene revisar las licencias de los datasets (TeichAI/claude-4.5-opus-high-reasoning-250x y DavidAU/PkDick-Deckard-5-Datasets) antes de un uso comercial.
- Visión condicionada: para usar entrada de imagen hay que descargar además el archivo mmproj y colocarlo junto al GGUF; sin él, el modelo funciona únicamente como texto.
- Tool calling y agentes: no se documenta soporte de function calling ni de flujos agénticos, a pesar del tag endpoints_compatible.
- Formato: al distribuirse solo en GGUF, no es directamente desplegable en vLLM o TGI sin conversión previa.
- Metadatos atípicos: el pipeline declarado es image-text-to-text, el nombre del modelo mezcla referencias a versiones ("Qwen3.6", "Claude 4.6 Opus") y el dataset citado es de "claude-4.5-opus", lo que dificulta la trazabilidad exacta de las versiones empleadas.

## Enlaces

- HuggingFace (este repositorio): https://huggingface.co/Butzeman/Qwen3.6-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking-NEO-CODE-Di-IMatrix-MAX-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.6-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking
- Repositorio de referencia de los quants NEO-CODE-Di-IMatrix-MAX: https://huggingface.co/DavidAU/Qwen3.6-27B-NEO-CODE-Di-IMatrix-MAX-GGUF
- Repositorio de referencia (variante finetune Heretic): https://huggingface.co/DavidAU/Qwen3.6-27B-Heretic-Uncensored-FINETUNE-NEO-CODE-Di-IMatrix-MAX-GGUF
- Modelo hermano citado (Fable-Fusion-711, 27B): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Variante ampliada del 40B citada por el autor: https://huggingface.co/DavidAU/Qwen3.6-40B-Fable-Fusion-6-Core-Deckard-Eleanor-Heretic-Uncensored-NM-DAU-NEO-MAX-MTP-GGUF
- Dataset de destilacion de razonamiento: https://huggingface.co/datasets/TeichAI/claude-4.5-opus-high-reasoning-250x
- Dataset de caracter PkDick-Deckard: https://huggingface.co/datasets/DavidAU/PkDick-Deckard-5-Datasets

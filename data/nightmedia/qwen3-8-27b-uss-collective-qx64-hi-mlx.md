# nightmedia/Qwen3.8-27B-USS-Collective-qx64-hi-mlx

## Resumen

Qwen3.8-27B-USS-Collective-qx64-hi-mlx es un modelo de lenguaje de 27.356.728.560 parámetros publicado por nightmedia, un laboratorio independiente radicado en Montana (Estados Unidos) que declara operar con un MacBook Pro de 128 GB y tarjetas de memoria. No es un entrenamiento desde cero: es un *merge* de pesos construido con mergekit a partir de dos modelos del propio autor, nightmedia/Qwen3.8-27B-MindMeld y nightmedia/Qwen3.8-27B-Wichtel-Fable-Heretic, donde el primero es a su vez una fusión de schneewolflabs/B1-27B, nightmedia/Qwen3.6-27B-Seven y nightmedia/Qwen3.8-27B-Brainwaves. La variante publicada en este repositorio está cuantizada a 6 bits en formato MLX (etiqueta qx64-hi) y ocupa 21 GB.

El modelo se orienta a razonamiento con cadena de pensamiento larga, código, matemáticas y escritura creativa, y declara soporte multilingüe en inglés, chino, japonés y español, además de ventanas de contexto de 256K y 1M de tokens según las etiquetas del repositorio. La licencia Apache 2.0 permite uso comercial sin restricciones de atribución más allá de las habituales, y su interés práctico reside en que documenta un flujo reproducible de fusión y cuantización sobre hardware de consumo Apple Silicon, sin clústeres de GPU.

Conviene advertir de entrada de que se trata de un artefacto experimental: la nomenclatura "Qwen3.8" no corresponde a ninguna release pública conocida de la familia Qwen, el repositorio no detalla datos de entrenamiento ni proceso de alineamiento, y las únicas métricas publicadas son una tabla de evaluación interna del autor ("brainwaves") con siete tareas de conocimiento y sentido común. El repositorio acumulaba 0 descargas y 1 *like* en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.x según etiquetas); detalles de capas y atención no disponibles |
| Parámetros totales | 27.356.728.560 (27,36 B), dato real de safetensors |
| Parámetros activos | No disponible (no se declara arquitectura MoE) |
| Longitud de contexto | 256K tokens declarados en etiquetas; se anuncia también 1M tokens, sin verificación publicada |
| Tipos de cuantización | 6 bits (qx64-hi, formato del repo), bf16, mxfp8, mxfp4, qx86-hi, mxfp4 (según tablas del autor); MLX |
| Idiomas soportados | Inglés (en), chino (zh), japonés (ja), español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) y MLX de 6 bits; repo de 21,0 GB |
| Librería | transformers (etiqueta); requiere MLX para la variante cuantizada |
| Pipeline declarado | image-text-to-text (no se documenta ningún componente de visión; ver limitaciones) |
| Modelos base | schneewolflabs/B1-27B, nightmedia/Qwen3.6-27B-Seven, nightmedia/Qwen3.8-27B-Brainwaves, nightmedia/Qwen3.8-27B-Wichtel-Fable-Heretic |
| Fecha de publicación | 2026-09-23 |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

La ficha no describe la arquitectura interna más allá de las etiquetas de linaje (qwen3_5, qwen3_6, qwen3.6, Qwen3.6), que apuntan a un transformer decoder-only con atención por softmax estándar. No hay información sobre número de capas, dimensión oculta, número de cabezas, uso de GQA, decodificación especulativa ni mecanismos de atención lineal. Tampoco se especifica si el modelo emplea mezcla de expertos: dado que el recuento de parámetros safetensors (27,36 B) coincide con un modelo denso de ese tamaño y no se declaran parámetros activos, lo razonable es asumir una arquitectura densa, aunque el dato no está confirmado por el autor.

En cuanto al proceso de construcción, el repositorio indica explícitamente que es una fusión (merge) de nightmedia/Qwen3.8-27B-MindMeld y nightmedia/Qwen3.8-27B-Wichtel-Fable-Heretic, realizada con mergekit, y posteriormente cuantizada a 6 bits con herramientas MLX. En el linaje aparecen etiquetas que sugieren etapas previas de *supervised fine-tuning* (sft), adaptadores LoRA y destilación de Claude 4.6 (claude-distillation, claude4.6) en alguno de los modelos ancestrales, pero no se aporta ni el número de tokens, ni la composición del dataset, ni si hubo RLHF o DPO. El autor publica además el prompt de prueba utilizado (un ejercicio de paralelismo entre mecánica cuántica e inferencia en transformers) y un extracto de la respuesta, que sirve como muestra cualitativa pero no como evaluación sistemática.

## Capacidades

- Generación de texto conversacional e instruccional, con etiquetas que declaran instruction-tuned y conversational.
- Razonamiento con cadena de pensamiento larga (reasoning, chain-of-thought, long-cot), orientado a problemas de varios pasos.
- Generación de código (coding) y tareas de investigación técnica (research).
- Matemáticas y disciplinas STEM (math, stem), sin métricas publicadas que cuantifiquen el rendimiento.
- Escritura creativa y narrativa: ficción, ciencia ficción, generación de tramas y subtramas, continuación de escenas, roleplay y "vivid prosing", que es probablemente el eje más trabajado del linaje.
- Multilingüismo declarado en inglés, chino, japonés y español.
- Contexto largo: las etiquetas afirman 256K y 1M tokens, lo que permitiría procesar documentos extensos o repositorios completos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes y razonamiento multi-paso: no disponible; solo se etiqueta razonamiento de cadena larga.
- Capacidades de visión, audio o thinking mode diferenciado: no disponibles. La etiqueta image-text-to-text del pipeline no está respaldada por ninguna descripción de componente multimodal en la model card.

## Casos de uso

- Escritura creativa y narrativa larga: el modelo está afinado específicamente para ficción, generación de tramas y subtramas y continuación de escenas, por lo que encaja en herramientas de asistencia a novelistas y guionistas que necesiten mantener coherencia argumental a lo largo de capítulos extensos apoyándose en la ventana de contexto declarada.
- Revisión y reescritura de manuscritos: gracias al contexto largo puede recibir varios capítulos simultáneamente y detectar incoherencias de personajes, ritmo o continuidad, una tarea inviable con ventanas de 8K o 16K.
- Asistente de razonamiento técnico en local: al ejecutarse en formato MLX sobre Apple Silicon, es apto para entornos sin conectividad o con requisitos de confidencialidad, donde el usuario necesita análisis multi-paso de documentación científica o técnica sin enviar datos a la nube.
- Generación y explicación de código en estación de trabajo: las etiquetas de coding y research lo sitúan para autocompletado, generación de funciones y explicación de fragmentos en editores locales; no hay evidencia publicada de soporte de tool calling, así que no debería asumirse integración automática en pipelines de CI/CD sin validación previa.
- Apoyo a la docencia STEM: resolución comentada de problemas de matemáticas y física con razonamiento paso a paso, aprovechando el modo de cadena de pensamiento larga para mostrar el desarrollo y no solo el resultado.
- Prototipado de investigación sobre fusión de modelos: el repositorio es útil como caso de estudio metodológico para investigadores que quieran reproducir un flujo mergekit + cuantización MLX sobre un modelo de 27B en hardware de consumo.
- Traducción y adaptación multilingüe EN/ZH/JA/ES: cobertura declarada de cuatro idiomas, adecuada para borradores y pre-traducción con revisión humana posterior.
- Simulación de personajes y roleplay: etiqueta explícita de roleplaying, aplicable a entornos de juego de rol textual o entrenamiento conversacional.

## Benchmarks y rendimiento

Los únicos datos disponibles son la tabla interna "brainwaves" publicada por el autor, que evalúa siete tareas (ARC, ARC-Easy, BoolQ, HellaSwag, OpenBookQA, PIQA y Winogrande). No son resultados de referencia estándar verificables de forma independiente y deben interpretarse con cautela. Los valores de las columnas hswag, obkqa, piqa y wino solo se publican para el componente Qwen3.8-27B-Seven-Brainwaves en bf16 y para el modelo base.

| Modelo | arc | arc/e | boolq | hswag | obkqa | piqa | wino |
|---|---|---|---|---|---|---|---|
| Qwen3.8-27B (base, mxfp8) | 0,591 | 0,782 | 0,896 | 0,746 | 0,448 | 0,801 | 0,711 |
| Qwen3.8-27B-Seven-Brainwaves (bf16) | 0,742 | 0,897 | 0,913 | 0,840 | 0,514 | 0,834 | 0,791 |
| Qwen3.8-27B-Seven-Brainwaves (qx64-hi) | 0,747 | 0,899 | 0,907 | no disponible | no disponible | no disponible | no disponible |
| Qwen3.8-27B-Wichtel-Fable-Heretic (qx64-hi) | 0,735 | 0,885 | 0,916 | no disponible | no disponible | no disponible | no disponible |
| USS-Collective qx64-hi (tabla de cabecera) | 0,747 | 0,897 | 0,911 | no disponible | no disponible | no disponible | no disponible |
| USS-Collective mxfp8 (tabla de cabecera) | 0,740 | 0,892 | 0,915 | no disponible | no disponible | no disponible | no disponible |
| USS-Collective mxfp4 (tabla de cabecera) | 0,738 | 0,891 | 0,918 | no disponible | no disponible | no disponible | no disponible |

Advertencia sobre la tabla: en la model card, la tabla de cabecera declara siete columnas (arc, arc/e, boolq, hswag, obkqa, piqa, wino) pero solo tres valores por fila, sin especificar a qué columnas corresponden. La asignación a arc, arc/e y boolq es la interpretación más plausible por el orden, pero no está confirmada por el autor. No hay resultados publicados de MMLU, HumanEval, GSM8K, MATH ni de benchmarks comparables estándar. Tampoco se han publicado comparaciones independientes del modelo final.

## Requisitos de hardware

- Inferencia en bf16: los 27,36 B de parámetros ocupan aproximadamente 54,7 GB solo en pesos, más el KV cache y activaciones. Requiere GPU de 80 GB (A100 80 GB, H100 80 GB) o memoria unificada de 128 GB.
- Cuantización de 6 bits (formato del repositorio): unos 21 GB de pesos, que es exactamente el tamaño del repo. Cabe en Mac con 32 GB de memoria unificada si se limita el contexto, y con holgura en configuraciones de 64 GB y 128 GB.
- Cuantización de 8 bits: en torno a 27 GB de pesos, viable en GPU de 40-48 GB (A100 40 GB, L40S 48 GB) o en Mac de 64 GB.
- Cuantización de 4 bits: aproximadamente 14-15 GB de pesos. Cabe en una RTX 4090 o RTX 3090 de 24 GB, aunque el contexto útil queda limitado por el KV cache.
- Contexto largo: aunque las etiquetas anuncien 256K o 1M tokens, el KV cache de un modelo de 27B con ventanas tan grandes puede consumir decenas de GB adicionales. En la práctica, en GPUs de 24 GB conviene trabajar con ventanas de decenas de miles de tokens, no de cientos de miles.
- GPU recomendadas: H100 80 GB o A100 80 GB para bf16 con contexto amplio; A100 40 GB o L40S 48 GB para 8 bits; RTX 4090 / RTX 3090 (24 GB) para 4 bits con contexto moderado.
- Apple Silicon: es la plataforma objetivo del artefacto. Mac Studio o MacBook Pro con 64 GB o 128 GB de memoria unificada ejecutan la variante qx64-hi de 6 bits sin problemas.
- Opciones de despliegue: MLX / mlx-lm para la variante cuantizada nativa; llama.cpp u Ollama tras convertir a GGUF; vLLM, TGI o SGLang usando los safetensors en bf16 si el repositorio los incluye completos; transformers como vía de referencia.
- Latencia y throughput: no disponibles. No se han publicado medidas de tokens por segundo ni de tiempo hasta el primer token para ninguna configuración.

## Comparativa con modelos similares

No hay datos de benchmarks comparables publicados para este modelo, por lo que la comparación se limita a especificaciones estructurales. Los modelos de la misma franja de tamaño se listan a título orientativo.

| Modelo | Parámetros | Contexto | Licencia | Formato / disponibilidad | Rendimiento comparado |
|---|---|---|---|---|---|
| Qwen3.8-27B-USS-Collective-qx64-hi-mlx | 27,36 B (denso, no confirmado) | 256K / 1M declarados | Apache 2.0 | safetensors + MLX 6 bits | Tabla brainwaves propia; sin MMLU ni HumanEval |
| Qwen3-32B | ~32 B | 128K | Apache 2.0 | safetensors, GGUF, MLX | No disponible en esta comparativa |
| Mistral-Small-24B | ~24 B | 128K | Apache 2.0 | safetensors, GGUF | No disponible en esta comparativa |
| Gemma-3-27B | ~27 B | 128K | Licencia Gemma (con restricciones de uso) | safetensors, GGUF | No disponible en esta comparativa |

Nota: los datos de los modelos alternativos son especificaciones públicas conocidas y no proceden de la información proporcionada por el autor. No se dispone de ninguna evaluación cruzada entre USS-Collective y esos modelos, de modo que no es posible afirmar cuál rinde mejor en ninguna tarea concreta.

## Limitaciones y advertencias

- Artefacto experimental y sin validación externa: 0 descargas y 1 like en el momento de la consulta, sin evaluaciones independientes, sin informe técnico y sin resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, MATH).
- Nomenclatura no verificable: "Qwen3.8", "Qwen3.6" o "Claude 4.6" no corresponden a releases públicas confirmadas. La relación real con la familia Qwen no puede comprobarse desde el repositorio, y el linaje mezcla modelos de autor con un modelo base externo (schneewolflabs/B1-27B) cuyo origen y licencia conviene verificar antes de un uso comercial.
- Destilación declarada: la etiqueta claude-distillation apunta a que el linaje incluye destilación de salidas de modelos de Anthropic. Esto puede plantear dudas sobre los términos de uso de los proveedores de origen, con independencia de que la licencia del repositorio sea Apache 2.0.
- Incoherencia de pipeline: el repositorio se marca como image-text-to-text, pero la model card no describe ningún componente de visión, ningún procesador de imagen y ningún ejemplo multimodal. No debe asumirse capacidad de visión sin comprobación.
- Riesgo de alucinación: no se documenta ningún proceso de RLHF o DPO ni calibración de veracidad. Las tareas de datos factuales (BoolQ 0,907-0,916, OpenBookQA 0,514) sugieren margen de error relevante, especialmente en conocimiento científico elemental.
- Contexto anunciado sin verificación: no hay pruebas de aguja en pajar ni evaluaciones de contexto largo que respalden los 256K o 1M tokens.
- Idiomas: solo se declaran en, zh, ja y es. No hay evaluación de calidad por idioma ni garantía de competencia en otros idiomas.
- Datos de entrenamiento opacos: se desconoce el número de tokens, la composición del dataset, la existencia de datos sintéticos y el filtrado aplicado. Esto impide evaluar sesgos de forma sistemática.
- Sesgos: no se han publicado análisis de sesgo de ningún tipo. Los modelos derivados de corpus web multilingües tienden a reproducir estereotipos, y en este caso no hay documentación que permita descartarlo.
- Enfoque creativo sobre precisión: el énfasis en escritura vívida, roleplay y ficción puede favorecer respuestas estilísticamente ricas pero menos contenidas en contextos técnicos o de atención al cliente.
- Soporte de tool calling no confirmado: no debe integrarse en pipelines de agentes o CI/CD asumiendo cumplimiento de esquemas de función sin pruebas previas.
- Cuantización irreversible: la variante qx64-hi de 6 bits es específica de MLX y pierde precisión frente a bf16; la tabla del autor muestra diferencias de hasta ~0,006 en boolq entre cuantizaciones, pero no hay una comparación completa.
- Uso comercial: la licencia Apache 2.0 del repositorio lo permite, pero el usuario asume la responsabilidad de verificar las licencias de los cuatro modelos base encadenados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nightmedia/Qwen3.8-27B-USS-Collective-qx64-hi-mlx
- Modelo base: https://huggingface.co/schneewolflabs/B1-27B
- Modelo base: https://huggingface.co/nightmedia/Qwen3.6-27B-Seven
- Modelo base: https://huggingface.co/nightmedia/Qwen3.8-27B-Brainwaves
- Modelo base: https://huggingface.co/nightmedia/Qwen3.8-27B-Wichtel-Fable-Heretic
- Componente del merge: https://huggingface.co/nightmedia/Qwen3.8-27B-MindMeld
- Perfil del autor: https://huggingface.co/nightmedia
- Búsqueda web: no se han encontrado resultados relevantes sobre este modelo. Las consultas realizadas devolvieron únicamente listados de sitios para adultos sin relación alguna con el modelo, por lo que no se incluye ningún enlace adicional. No hay papers, blogs técnicos, repositorios ni demos verificables asociados al modelo en la información disponible.

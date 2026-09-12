# Jeesup/svdsafety_l2_remove50_whiten_protk32

## Resumen

`svdsafety_l2_remove50_whiten_protk32` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf`, publicado por el usuario Jeesup como artefacto de investigación sobre compresión por descomposición en valores singulares (SVD). Según la model card, el modelo se ha procesado con SVD-LLM y se le ha aplicado una regla de selección de componentes identificada como `unknown` con un presupuesto de restauración del 0,000 %. El objetivo declarado no es ofrecer un asistente conversacional, sino medir cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes lo repara mejor. Es una celda de una malla experimental sobre reglas y presupuestos, no un modelo de propósito general.

El dato más relevante es la contradicción entre la narrativa de compresión y el tamaño real: el repositorio contiene 6.738.415.616 parámetros en safetensors (6,74 mil millones), prácticamente idénticos al modelo base de 7B, y la propia model card indica que se ha eliminado el 0,00 % de los parámetros densos y que no se ha restaurado ningún componente. Es decir, el checkpoint conserva la huella paramétrica completa de Llama-2-7b-chat pese a presentarse como un experimento de compresión. El nombre del repositorio (`remove50_whiten_protk32`) sugiere una variante con eliminación del 50 % y blanqueado, pero esos valores no aparecen en la model card, que además rellena varios campos con marcadores vacíos o valores `0.0 %`.

Se trata, por tanto, de un artefacto de investigación con cero descargas y cero valoraciones en el momento de la consulta, sin benchmarks publicados y sin idiomas declarados. La model card advierte explícitamente de que varias celdas de la malla están degradadas deliberadamente en seguridad y de que cualquier celda debe evaluarse antes de extraer conclusiones. Su interés práctico se limita a reproducir experimentos de compresión, estudiar interpretabilidad de subespacios singulares y auditar la tasa de éxito de ataques (ASR) en modelos alineados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2), modificado mediante compresión SVD-LLM |
| Parametros totales | 6.738.415.616 (6,74 mil millones), segun safetensors |
| Parametros activos | No aplica: no es un modelo de mezcla de expertos (MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Llama-2-7b-chat declara 4096 tokens) |
| Tipos de cuantizacion | No disponible: el repositorio solo publica pesos safetensors; no se ofrecen GGUF, AWQ, GPTQ ni variantes cuantizadas |
| Idiomas soportados | No disponible en la model card; el modelo base esta entrenado predominantemente en ingles |
| Licencia | Llama 2 Community License (incluye `LICENSE.txt` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Libreria declarada | transformers (pipeline: text-generation, compatible con endpoints/TGI) |
| Tamano del repositorio | 13,5 GB |
| Semilla del experimento | 42 |
| Regla de seleccion declarada | `unknown` |
| Presupuesto de restauracion | 0,000 % de parametros densos (0 componentes restaurados, 0 componentes sustituidos) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-2-7b-chat: un transformer decoder-only con atención causal, normalización RMSNorm, activación SwiGLU y RoPE para posiciones relativas. Sobre ese checkpoint se aplica SVD-LLM, una técnica de compresión post-entrenamiento que descompone las matrices de pesos en factores singulares y permite truncar componentes de bajo rango para reducir el número de parámetros. La model card indica que la compresión aplicada elimina el 0,00 % de los parámetros densos, que la regla de selección es `unknown`, que el presupuesto de restauración es del 0,000 % y que no se restauró ni sustituyó ningún componente. Con esos valores, la transformación efectiva sobre el modelo debería ser mínima o nula en términos de recuento paramétrico, algo consistente con los 6.738.415.616 parámetros observados en safetensors.

No se documenta ningún proceso de entrenamiento adicional: no hay fase de preentrenamiento propia, ni fine-tuning declarado más allá del que ya incorpora Llama-2-7b-chat, ni datos sobre RLHF, DPO, SFT o composición del dataset utilizados para producir este artefacto. Tampoco se especifica el corpus de calibración empleado por SVD-LLM, el número de tokens de activación usados para estimar los subespacios, ni el procedimiento exacto de "blanqueado" que sugiere el nombre del repositorio. La model card tampoco aclara si el checkpoint es bit a bit idéntico al base o si ha pasado por una reconstrucción SVD con rango completo que introduzca diferencias numéricas, algo que solo es verificable comparando pesos, operación que la información disponible no permite realizar.

La innovación que el autor declara investigar es metodológica, no de arquitectura: comparar reglas de selección de componentes SVD y presupuestos de restauración en función de su efecto sobre la seguridad del modelo. El artefacto es una celda de esa malla, descrita como sujeto experimental.

## Capacidades

- Generación de texto autoregresiva en la modalidad `text-generation`, heredada del modelo base Llama-2-7b-chat.
- Conversación multi-turno nominal, dado que el tag `conversational` aparece en el repositorio y el base está ajustado por instrucciones.
- Instrumento de medida de seguridad: el artefacto existe para cuantificar la tasa de éxito de ataques (ASR) y la degradación de rechazos bajo compresión.
- Análisis de interpretabilidad: permite estudiar qué subespacios singulares concentran comportamientos de seguridad o utilidad.
- Punto de referencia de pipelines de compresión: sirve como celda de comparación frente a variantes con presupuestos de restauración distintos.
- Compatibilidad con `transformers` y con el stack de `text-generation-inference` (tag `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso explícito, modo thinking, visión, audio, código especializado ni matemáticas avanzadas. No hay evidencia de capacidades multilingües más allá de las del modelo base.

Advertencia importante: dado que la model card indica que varias celdas de la malla están degradadas deliberadamente en seguridad y que la evaluación queda en manos del usuario, no debe asumirse que este checkpoint conserve las capacidades de rechazo de Llama-2-7b-chat.

## Casos de uso

- Reproducción de experimentos de compresión SVD: el checkpoint sirve como celda con 0 % de parámetros eliminados y 0 % de presupuesto de restauración, útil como referencia frente a celdas con truncamiento real para aislar el efecto de la compresión.
- Auditoría de seguridad y red-teaming: se puede generar un conjunto de prompts adversarios y medir la tasa de éxito de ataques con este checkpoint, comparándola con la del modelo base sin comprimir y con las celdas comprimidas de la malla.
- Investigación en interpretabilidad: analizar las matrices de pesos y sus descomposiciones para localizar direcciones singulares asociadas a comportamientos de rechazo, útil en estudios sobre mecanismos internos de alineación.
- Validación de infraestructuras de compresión: probar frameworks que implementan SVD-LLM u otras técnicas de truncamiento, usando este artefacto como entrada de tamaño completo (13,5 GB) y comprobando que el pipeline de carga, conversión y evaluación funciona de extremo a extremo.
- Pruebas de regresión en herramientas de despliegue: verificar que un stack basado en `transformers` o TGI carga correctamente pesos safetensors de 6,74 mil millones de parámetros con metadatos de derivación inusuales.
- Docencia y formación técnica: ilustrar en cursos o talleres cómo una model card puede declarar un 0,00 % de compresión y aun así publicar un checkpoint del tamaño completo, y por qué conviene verificar el recuento paramétrico antes de asumir una reducción.
- Comparación de reglas de selección de componentes: dado que la model card describe una malla sobre reglas y presupuestos, esta celda permite contrastar la etiqueta `unknown` frente a reglas con nombre definido, siempre que el resto de celdas estén publicadas.

Ninguno de estos usos implica desplegar el modelo como asistente de producción, uso que la propia model card desaconseja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, MT-Bench, ASR ni de tasa de rechazo, y tampoco se aportan curvas de seguridad/utilidad por presupuesto de compresión. Tampoco hay datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 13,5 GB solo para pesos, más memoria para caché KV y activaciones; con contexto largo se recomienda reservar 16-20 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 7-8 GB de pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 4-5 GB de pesos. Estas cifras son estimaciones derivadas del recuento paramétrico; el repositorio no publica pesos cuantizados.
- GPU de centro de datos: A100 40 GB, A100 80 GB y H100 funcionan sin problema en FP16; también tarjetas de 24 GB como A10G o L40S.
- GPU de consumo: cabe en RTX 3090 y RTX 4090 (24 GB) en FP16 con contexto moderado; en RTX 4080, 4070 Ti o tarjetas de 16 GB requiere cuantización de 8 o 4 bits, que el usuario tendría que generar por su cuenta.
- Despliegue: `transformers` de forma nativa, dado que el repositorio es compatible con la librería; el tag `endpoints_compatible` sugiere compatibilidad con text-generation-inference. vLLM es viable en FP16 sobre GPU de 24 GB o superiores. llama.cpp y Ollama requieren convertir previamente los pesos safetensors a GGUF, paso no documentado por el autor.
- Latencia y throughput: no disponibles. No hay mediciones publicadas ni configuración de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| svdsafety_l2_remove50_whiten_protk32 | 6.738.415.616 (6,74 mil millones) | No disponible en la informacion | Llama 2 Community License | HuggingFace, 0 descargas, 0 likes | Artefacto de investigacion, sin benchmarks ni evaluacion publicada |
| meta-llama/Llama-2-7b-chat-hf | 6,74 mil millones | 4096 tokens (segun el modelo base) | Llama 2 Community License | HuggingFace, ampliamente utilizado | Modelo alineado de referencia; es el origen declarado del checkpoint analizado |
| meta-llama/Llama-2-13b-chat-hf | 13 mil millones | 4096 tokens (segun el modelo base) | Llama 2 Community License | HuggingFace | Misma familia y licencia; mayor coste de inferencia y, en general, mejor calidad conversacional que la variante de 7B |
| mistralai/Mistral-7B-Instruct-v0.1 | 7,3 mil millones | 8192 tokens (segun la model card del fabricante) | Apache 2.0 | HuggingFace | Alternativa de tamano comparable con licencia permisiva y contexto mayor; perfil de seguridad y alineacion distintos |

Los datos de los modelos comparativos proceden de informacion publica general sobre esos checkpoints y no de la documentacion proporcionada para este artefacto; conviene verificarlos en sus respectivas model cards. No se dispone de comparaciones de rendimiento medidas entre este checkpoint y las alternativas, porque no hay benchmarks publicados para el modelo analizado.

## Limitaciones y advertencias

- Naturaleza experimental: la model card lo describe como artefacto de investigacion y no como asistente desplegable. No debe usarse en produccion ni como sustituto directo de Llama-2-7b-chat.
- Degradacion de seguridad deliberada: el autor advierte que varias celdas de la malla estan degradadas en seguridad respecto al base y que la compresion por si sola eleva la tasa de exito de ataques. Esta celda concreta no ha sido evaluada publicamente, por lo que su comportamiento en seguridad es desconocido.
- Metricas ausentes: no hay resultados de benchmarks de utilidad, seguridad, ASR ni de tasa de rechazo, lo que impide cuantificar el trade-off que el estudio pretende medir a partir de la informacion disponible.
- Inconsistencia documental: la model card declara 0,00 % de parametros eliminados, 0,000 % de presupuesto de restauracion y regla `unknown`, mientras el nombre del repositorio sugiere `remove50` y `whiten`. Ademas, el recuento real de parametros (6,74 mil millones) no refleja ninguna reduccion apreciable. Cualquier conclusion basada en la etiqueta del repositorio debe verificarse.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual; el modelo base de 7B tiene una tasa de alucinacion no despreciable en tareas de conocimiento.
- Idiomas: no se declaran idiomas soportados. El modelo base esta entrenado mayoritariamente en ingles, por lo que el rendimiento en castellano u otras lenguas sera previsiblemente inferior y no esta medido.
- Contexto: no confirmado para este checkpoint; el valor habitual de la familia Llama 2 es de 4096 tokens, insuficiente para documentos largos o conversaciones muy extensas sin tecnicas adicionales.
- Licencia: se aplica la Llama 2 Community License, con sus restricciones de uso aceptable (`USE_POLICY.md`), obligaciones de atribucion y clausulas especificas para despliegues a gran escala. No es una licencia permisiva tipo Apache 2.0 y no permite reclamar propiedad sobre los pesos derivados de la forma habitual en otros ecosistemas.
- Ausencia de validacion comunitaria: cero descargas y cero valoraciones en el momento de la consulta, sin issues ni discusiones que aporten evidencia externa sobre su comportamiento.
- Sin soporte declarado: no hay informacion sobre tool calling, agentes, vision, audio ni cuantizaciones listas para usar, lo que limita su integracion directa en pipelines de produccion.
- Fecha de creacion futura: los metadatos indican creacion y actualizacion en septiembre de 2026, dato que conviene tratar con cautela si se usa como referencia temporal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svdsafety_l2_remove50_whiten_protk32
- Modelo base declarado: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Paper de Llama 2: no disponible en la informacion proporcionada (la model card no incluye enlace)
- Paper o repositorio de SVD-LLM: no disponible en la informacion proporcionada, pese a ser la tecnica de compresion citada
- Codigo, demo o dataset asociados: no disponibles en la informacion proporcionada
- Resultados de busqueda web: las consultas realizadas devolvieron unicamente paginas sobre servidores del videojuego CS2 (xplay.gg y agregadores relacionados), sin ninguna relacion con el modelo. No se han encontrado enlaces relevantes adicionales.

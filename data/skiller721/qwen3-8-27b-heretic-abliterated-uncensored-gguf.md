# Skiller721/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF

## Resumen

El modelo **Skiller721/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF** es un conjunto de cuantizaciones GGUF de una variante "uncensored" (sin censura) del modelo Qwen3.8-27B, desarrollado por el usuario Skiller721. Se basa en el modelo [trohrbaugh/Qwen3.8-27B-heretic-ara](https://huggingface.co/trohrbaugh/Qwen3.8-27B-heretic-ara), que aplica técnicas de abliteración (Heretic v1.2.0 + ARA, Arbitrary-Rank Ablation) para eliminar los rechazos del modelo original, logrando una tasa de rechazos de 0 sobre 100 y una divergencia KL de 0.0535 respecto al modelo sin modificar.

El propósito principal es ofrecer versiones cuantizadas de un modelo multimodal de 27 000 millones de parámetros (arquitectura `qwen3_5`, 64 capas, 5120 de dimensión oculta) para su ejecución local con `llama.cpp`, dirigido a usuarios que necesitan un asistente de texto e imagen sin filtros de contenido para tareas como roleplay, escritura creativa adulta o experimentación con alineación. El repositorio se encuentra en un estado de reconstrucción ("INCOMING — FULL RESET IN PROGRESS"): actualmente solo está disponible y verificado el cuantizado `Q4_K_M` (16,5 GB), mientras que el resto de la gama de cuantizaciones está en proceso de generación desde una única fuente abliterada verificada.

La relevancia de este modelo radica en combinar la capacidad multimodal y de contexto largo de Qwen3.8-27B con la eliminación de las barreras de rechazo, algo que no ofrecen los modelos oficiales. Sin embargo, al carecer de benchmarks publicados y encontrarse en una fase de reconstrucción, su rendimiento y estabilidad no están plenamente garantizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5` (64 capas, 5120 de dimension oculta) |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 32768 tokens (segun el comando de ejemplo de `llama.cpp`) |
| Tipos de cuantizacion | Actualmente solo `Q4_K_M` (16,5 GB). En construccion: `Q8_0`, `Q6_K`, `Q5_K_M/S`, `Q4_K_M/S`, `IQ4_NL/XS`, `Q3_K_L/M/S`, `IQ3_M/XXS/XS/S`, `Q2_K_S`, `IQ2_M/S/XS/XXS`, `IQ1_S/M`, `TQ1_0`, `TQ2_0`, `F16`, `BF16` |
| Idiomas soportados | ingles, multilingue (sin especificar) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para `llama.cpp`) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion GGUF de una variante modificada de Qwen3.8-27B. La arquitectura base, `qwen3_5`, es un transformer multimodal (image-text-to-text) con 64 capas y 5120 unidades de dimension oculta, segun las notas de verificacion del autor. El proceso de modificacion aplica la tecnica **Heretic v1.2.0 + ARA** (Arbitrary-Rank Ablation), que elimina los vectores de rechazo del modelo original, reduciendo la tasa de rechazos a 0/100. La divergencia KL respecto al modelo sin modificar es de 0.0535, lo que indica una alteracion relativamente pequena en la distribucion de salida.

No se dispone de informacion sobre los datos de entrenamiento del modelo base Qwen3.8-27B (numero de tokens, composicion del dataset, uso de RLHF/DPO, etc.). Tampoco se detalla el proceso de cuantizacion mas alla de que se realiza con `llama.cpp` y que los cuantizados de baja precision se calibraran con imatrix. El repositorio actual esta siendo reconstruido desde cero con un pipeline propio de abliteracion, lo que sugiere que los cuantizados anteriores fueron descartados por no provenir de una fuente verificada.

## Capacidades

- **Generacion de texto y razonamiento**: como modelo de 27 B, es capaz de tareas genericas de lenguaje, aunque no hay benchmarks que confirmen su rendimiento.
- **Multimodal (imagen-texto)**: el pipeline declarado es `image-text-to-image`, lo que implica que puede procesar imagenes como entrada y generar texto asociado.
- **Sin rechazos (uncensored)**: la abliteracion elimina las respuestas de rechazo (0/100), permitiendo generar contenido que el modelo original bloquearia, incluyendo material NSFW, violencia, etc.
- **Contexto largo**: soporta hasta 32768 tokens de contexto segun el comando de ejemplo, lo que permite conversaciones extensas o documentos largos.
- **Multilingue**: declarado como ingles y multilingue, aunque no se especifican los idiomas concretos.
- **Ejecucion local**: gracias a la cuantizacion GGUF, puede ejecutarse en hardware moderado con `llama.cpp` y herramientas compatibles.

No se ha documentado soporte para tool calling, function calling, agentes o modos de razonamiento especiales.

## Casos de uso

- **Roleplay y ficcion interactiva sin restricciones**: el modelo puede mantener conversaciones multi-turno con contexto largo (hasta 32K tokens) y sin rechazos, lo que lo hace adecuado para juegos de rol adultos o narrativa colaborativa donde se requiere contenido explicito. Se usaria con `llama.cpp` o interfaces como SillyTavern.
- **Escritura creativa de genero adulto**: autores que necesitan generar relatos eroticos, guiones o dialogos con contenido explicito pueden usar el modelo como asistente de redaccion, aprovechando su capacidad de seguir instrucciones y mantener coherencia en textos largos.
- **Analisis de imagenes sin filtros**: al ser multimodal, puede describir o interpretar imagenes sin las restricciones habituales, util en contextos artisticos o de investigacion donde se manejan imagenes sensibles (siempre con las debidas advertencias eticas).
- **Experimentacion con tecnicas de alineacion**: investigadores interesados en estudiar el efecto de la abliteracion en modelos grandes pueden utilizar este GGUF para comparar comportamientos con el modelo original y analizar la divergencia KL y la tasa de rechazos.
- **Despliegue local en hardware de gama media**: el cuantizado `Q4_K_M` de 16,5 GB permite ejecutar el modelo en una GPU de 16 GB (por ejemplo, RTX 4080 o RTX 4090) a una velocidad de 12-13 tokens por segundo, segun el autor, lo que lo hace util para prototipos o aplicaciones offline.
- **Generacion de contenido para entretenimiento interactivo**: desarrolladores de juegos o chatbots que necesiten un personaje virtual sin censura pueden integrar el modelo via `llama-server` con `--jinja` para manejo de plantillas, ofreciendo respuestas fluidas y sin bloqueos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras metricas estandar. El unico dato de rendimiento mencionado es la velocidad de inferencia de aproximadamente 12-13 tokens por segundo en una GPU de 16 GB con el cuantizado `Q4_K_M`, proporcionado por el autor sin especificar el hardware exacto.

## Requisitos de hardware

- **VRAM estimada**: el cuantizado `Q4_K_M` ocupa 16,5 GB, por lo que se recomienda una GPU con al menos 16 GB de VRAM para cargarlo completo. Con `-ngl 999` (offload total) en `llama.cpp`, se necesita esa cantidad.
- **GPU recomendadas**: RTX 4080, RTX 4090, A100 (40 GB) o similares. Para cuantizados mas grandes (Q6_K, Q8_0) se requeriran 24 GB o mas.
- **Compatibilidad con consumer GPU**: si, el `Q4_K_M` cabe en GPUs de 16 GB como la RTX 4080, aunque el rendimiento (12-13 tok/s) es modesto. Para mayor velocidad se necesitarian GPUs de 24 GB o mas.
- **Opciones de despliegue**: `llama.cpp` (incluido `llama-server`), y por extension herramientas que lo usan como Ollama, LM Studio o interfaces web. No se menciona compatibilidad con vLLM o TGI (que requieren pesos en `safetensors`).
- **Latencia y throughput**: segun el autor, ~12-13 tokens por segundo con `Q4_K_M` en GPU de 16 GB. No hay datos para otros cuantizados.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. El modelo es una variante de Qwen3.8-27B, pero no se han publicado especificaciones oficiales de ese modelo base (parametros, contexto, benchmarks) que permitan una comparacion rigurosa. Tampoco se conocen otros modelos "uncensored" de tamano similar con los que contrastar.

## Limitaciones y advertencias

- **Contenido sin censura**: el modelo puede generar material ofensivo, ilegal, violento o sexualmente explicito. No es apto para aplicaciones en produccion sin moderacion humana o filtros adicionales.
- **Estado del repositorio**: el autor indica que el repositorio esta en reconstruccion ("FULL RESET IN PROGRESS"). Solo el cuantizado `Q4_K_M` esta verificado; el resto esta pendiente de generar desde una fuente unica y verificada. Los archivos pueden cambiar sin previo aviso.
- **Ausencia de benchmarks**: no hay datos objetivos sobre calidad de generacion, razonamiento o seguridad. El rendimiento real es desconocido.
- **Posibles sesgos del modelo base**: al no conocer el entrenamiento original de Qwen3.8-27B, no se pueden descartar sesgos de genero, raza u otros, que ademas no han sido mitigados por el proceso de abliteracion (que solo elimina rechazos).
- **Riesgo de alucinacion**: como cualquier modelo de lenguaje, puede generar afirmaciones falsas con alta confianza. La ausencia de censura puede amplificar este riesgo en temas delicados.
- **Licencia y uso comercial**: la licencia Apache 2.0 permite uso comercial, pero el contenido generado puede tener implicaciones legales (por ejemplo, material ilegal) y eticas. El usuario es responsable del uso.
- **Limitaciones de idioma**: aunque se declara multilingue, no se especifican los idiomas soportados ni la calidad en cada uno; probablemente el rendimiento sea mejor en ingles.

## Enlaces

- Repositorio HuggingFace: [Skiller721/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF](https://huggingface.co/Skiller721/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF)
- Modelo base (trohrbaugh/Qwen3.8-27B-heretic-ara): [https://huggingface.co/trohrbaugh/Qwen3.8-27B-heretic-ara](https://huggingface.co/trohrbaugh/Qwen3.8-27B-heretic-ara)

No se han encontrado otros enlaces (papers, blogs, demos) en la informacion proporcionada.

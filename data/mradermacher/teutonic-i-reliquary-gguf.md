# mradermacher/Teutonic-I-Reliquary-GGUF

## Resumen
Teutonic-I-Reliquary es un modelo de lenguaje de 8.953.803.264 parámetros (aproximadamente 8,95 mil millones) desarrollado originalmente por ReliquaryForge y distribuido en formato GGUF por mradermacher. El modelo está etiquetado por sus autores como orientado a razonamiento, uso agéntico, ingeniería de software (SWE) y aprendizaje por refuerzo, con un trasfondo vinculado a Bittensor y a entornos descentralizados. La model card del repositorio GGUF no aporta detalles sobre la arquitectura interna, los datos de entrenamiento ni la longitud de contexto, por lo que buena parte de las especificaciones técnicas no están disponibles.

La relevancia de esta ficha radica en que se trata de una cuantización estática del modelo base, publicada por mradermacher, un autor habitual en la comunidad de cuantización GGUF. El repositorio ofrece una batería completa de cuantizaciones que van desde Q2_K (4,0 GB) hasta f16 (18,0 GB), lo que permite desplegar el modelo en hardware muy diverso, desde GPUs de consumo con poca VRAM hasta estaciones de trabajo con aceleradores de mayor capacidad.

El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial, y declara únicamente el idioma inglés. No se han publicado resultados de benchmarks ni detalles sobre el proceso de entrenamiento en la información disponible, por lo que las evaluaciones de rendimiento quedan pendientes de validación por parte de la comunidad.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base se distribuye con `transformers`; no se detalla transformer, MoE u otra variante) |
| Parametros totales | 8.953.803.264 (aprox. 8,95 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento
La información disponible no detalla la arquitectura interna del modelo base. La model card del repositorio GGUF únicamente indica que se trata de cuantizaciones estáticas del modelo `ReliquaryForge/Teutonic-I-Reliquary`, generadas con `convert_type: hf` y `quantize_version: 2`, y que el modelo base se carga mediante la librería `transformers`. No se especifica si emplea un transformer denso, una mezcla de expertos (MoE), atención lineal o cualquier otra variante arquitectónica.

Tampoco se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. Las etiquetas del modelo (`reinforcement-learning`, `decentralized`, `bittensor`, `agentic`, `swe`, `reasoning`) sugieren un enfoque hacia tareas de razonamiento y agentes, posiblemente con entrenamiento por refuerzo, pero no se aporta evidencia técnica que lo confirme. El autor de la cuantización indica que no dispone de cuantizaciones ponderadas o con imatrix en el momento de la publicación, y que podrían solicitarse mediante una discusión en la comunidad.

## Capacidades
- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- Razonamiento y resolución de problemas, según las etiquetas `reasoning` y `agentic`.
- Ingeniería de software (SWE), según la etiqueta `swe`.
- Uso orientado a agentes y razonamiento multi-paso, según la etiqueta `agentic`.
- Aprendizaje por refuerzo como área declarada de especialización (`reinforcement-learning`).
- Capacidades multilingües: limitadas al inglés según el campo `language: en`.
- No se documentan capacidades de visión, audio, tool calling ni modo de pensamiento explícito en la información disponible.

## Casos de uso
- Asistencia en tareas de ingeniería de software: dado el etiquetado `swe`, el modelo puede emplearse para revisar parches, sugerir refactorizaciones o generar pruebas unitarias en inglés, integrándose en flujos de revisión de código.
- Razonamiento multi-paso en entornos agénticos: su etiqueta `agentic` sugiere su uso como motor de decisión en pipelines que requieran descomposición de tareas y planificación secuencial.
- Experimentación en aprendizaje por refuerzo: al estar etiquetado como `reinforcement-learning`, puede servir como política base o modelo de referencia en entornos de investigación sobre RL con LLM.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_S (5,5 GB) y Q4_K_M (5,8 GB) permiten ejecutar el modelo en GPUs de consumo con 8 GB de VRAM, facilitando prototipado local sin infraestructura dedicada.
- Evaluación de modelos descentralizados: su vinculación con Bittensor y entornos descentralizados lo hace útil para estudiar el comportamiento de modelos entrenados en ecosistemas distribuidos.
- Generación de texto en inglés para tareas generales: con la cuantización Q8_0 (9,6 GB) se obtiene la mejor calidad dentro de los formatos ligeros para tareas de redacción y resumen en inglés.
- Investigación sobre cuantización: el repositorio ofrece doce variantes que permiten comparar la degradación de calidad entre Q2_K y f16 en un mismo modelo, útil para estudios de compresión.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia según cuantización: Q2_K ~4,0 GB; Q3_K_S ~4,4 GB; Q3_K_M ~4,8 GB; Q3_K_L ~5,1 GB; IQ4_XS ~5,4 GB; Q4_K_S ~5,5 GB; Q4_K_M ~5,8 GB; Q5_K_S ~6,4 GB; Q5_K_M ~6,6 GB; Q6_K ~7,5 GB; Q8_0 ~9,6 GB; f16 ~18,0 GB. Hay que añadir el espacio para el contexto KV, que no se especifica.
- GPU recomendadas: para f16, una A100 o H100 de 40/80 GB ofrece margen holgado; para Q8_0 basta una RTX 4090 (24 GB) o una A10G (24 GB); para Q4_K_M, una RTX 3060 de 12 GB o una RTX 4070 de 12 GB son suficientes.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más de VRAM usando cuantizaciones Q4_K_S o Q4_K_M; las variantes Q2_K y Q3_K_S pueden caber en GPUs de 6 GB con contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI, aunque no se confirma compatibilidad explícita.
- Latencia y throughput: no disponibles; no se han publicado mediciones en la información proporcionada.

## Comparativa con modelos similares
No se dispone de datos de benchmarks ni de especificaciones de contexto que permitan una comparación rigurosa con alternativas de la misma categoría. A modo orientativo, se compara con modelos densos de tamaño similar en cuanto a parámetros y licencia, sin afirmar rendimiento:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Teutonic-I-Reliquary (este) | ~8,95 B | no disponible | Apache 2.0 | GGUF, safetensors |
| Llama 3.1 8B | 8 B | 128K (según documentación pública del autor original) | Llama 3.1 Community License | safetensors, GGUF |
| Mistral 7B | 7,3 B | 32K (según documentación pública) | Apache 2.0 | safetensors, GGUF |
| Qwen2.5 7B | 7,6 B | 128K (según documentación pública) | Apache 2.0 (mayoría de variantes) | safetensors, GGUF |

Las cifras de contexto y licencia de los modelos comparados provienen de su documentación pública habitual; no se han verificado en la información proporcionada para esta ficha y deben contrastarse antes de su uso en producción.

## Limitaciones y advertencias
- No se han publicado detalles sobre sesgos conocidos, por lo que se desconoce su comportamiento en dominios sensibles.
- Riesgo de alucinación no cuantificado: al no haber benchmarks ni evaluaciones publicadas, no puede estimarse su tasa de error factual.
- Limitación idiomática: el modelo declara únicamente inglés, por lo que su rendimiento en castellano u otros idiomas no está garantizado.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin validación previa.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base podría tener condiciones adicionales no reflejadas en la model card del repositorio GGUF; conviene revisar el repositorio original de ReliquaryForge.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) pueden degradar notablemente el rendimiento; el autor de la cuantización marca Q3_K_M como "lower quality" y recomienda Q4_K_S y Q4_K_M como opciones rápidas y equilibradas.
- No hay cuantizaciones ponderadas o con imatrix disponibles en el momento de la publicación, lo que puede afectar a la calidad de las cuantizaciones pequeñas.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- No se documenta soporte de tool calling ni de agentes con protocolos estándar, pese a la etiqueta `agentic`.

## Enlaces
- Repositorio GGUF en Hugging Face: https://huggingface.co/mradermacher/Teutonic-I-Reliquary-GGUF
- Modelo base: https://huggingface.co/ReliquaryForge/Teutonic-I-Reliquary
- Página de descargas del autor de la cuantización: https://hf.tst.eu/model#Teutonic-I-Reliquary-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests

# Prience91/Climate-1000-Qwen-4b

## Resumen

Climate-1000-Qwen-4b es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-4B, desarrollado por el usuario Prience91 dentro del proyecto que el autor denomina GIIS Mini. Se distribuye como un modelo autónomo en BF16, resultado de fusionar (merge) el adaptador LoRA `Prience91/GIIS-Mini-Qwen3.5-4B-LoRA-adapter` —concretamente el checkpoint 230— sobre los pesos originales sin cuantizar. No requiere cargar el adaptador por separado: el repositorio incluye los pesos completos del modelo base.

El modelo resuelve un problema acotado: proporcionar una variante de 4B parámetros especializada en conversación sobre temática climática, entrenada con el dataset `Prience91/Climate-1000-canary` (3.665 ejemplos de entrenamiento y 406 de validación). Frente al base, el interés práctico está en la licencia Apache 2.0, el tamaño manejable para una sola GPU y la posibilidad de servir como punto de partida para ajustes posteriores o como baseline de investigación en dominio climático.

Es relevante ahora por su carácter de export verificado técnicamente (comprobaciones de fusión, recarga del modelo y de la plantilla de chat documentadas en `merge_manifest.json`), aunque con una advertencia explícita del autor: no se reclama ninguna evaluación de calidad de generación para este export, y las pérdidas reportadas provienen del entrenamiento del adaptador, no de una remedición sobre el modelo fusionado. El repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForCausalLM, tipo de modelo `qwen3_5_text` (modelo de texto; el codificador de visión del base no se incluye) |
| Parametros totales | 4.205.751.296 (4,21 B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible. El SFT se realizó con un techo de 8.192 tokens; la ventana nativa del base no se detalla en la información proporcionada |
| Tipos de cuantizacion | Export en BF16 sin cuantizar. No se publican variantes GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | No disponible (no se declara lista de idiomas en la model card ni en los tags) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, BF16 (tamaño del repo: 8,4 GB) |

## Arquitectura y entrenamiento

Modelo transformer causal de texto derivado de Qwen3.5-4B (revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`). El entrenamiento se realizó con la base congelada en BF16, precisión mixta BF16 y adaptadores LoRA en FP32 con rango 32, alpha 64, dropout 0,05, aplicados sobre las capas lineales soportadas y con pérdida restringida a los tokens de completación (completion-only loss). El adaptador resultante se fusionó aritméticamente en los pesos base; el autor documenta comprobaciones de pesos finitos y verificación de la aritmética de fusión en las capas 0, 15 y 31, además de la recarga autónoma del modelo y de la plantilla de chat.

La configuración del SFT corresponde a la release V17-Turbo: 3.665 ejemplos de entrenamiento y 406 de validación del dataset `Prience91/Climate-1000-canary`, 460 pasos totales repartidos en dos épocas, learning rate 1e-4, microbatch 1 con acumulación de 16, semilla 3407 y modo de razonamiento desactivado (thinking disabled). La ejecución se reanudó desde el checkpoint 120 con limpieza periódica de caché CUDA y telemetría, preservando los hiperparámetros y el dataset. El checkpoint seleccionado es el 230 (final de la primera época), con pérdida de validación de 0,37746524810791016; el paso final 460 registró 0,38062456250190735. No se documenta uso de RLHF ni de DPO, solo SFT.

## Capacidades

- Generación de texto conversacional en formato chat, mediante la plantilla incluida y con `enable_thinking=False` para replicar las condiciones de entrenamiento.
- Especialización de dominio en temática climática, adquirida por SFT sobre un corpus específico de 3.665 ejemplos.
- Respuesta multi-turno: la plantilla de chat permite concatenar historial, aunque la ventana efectiva no está declarada.
- Export autónomo: no requiere cargar el adaptador LoRA por separado ni depender del repositorio del adaptador.
- Compatibilidad con el ecosistema `transformers` (`AutoModelForCausalLM` y `AutoTokenizer`), lo que habilita su uso con servidores compatibles con la API de endpoints.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta modo de razonamiento extendido (thinking) en este export; de hecho, el entrenamiento se hizo con thinking desactivado.
- No se documentan capacidades de visión, audio, matemáticas avanzadas ni agentes multi-paso.

## Casos de uso

- Asistente divulgativo sobre cambio climático: el modelo puede mantener conversaciones multi-turno con plantilla de chat sobre conceptos como forzamiento radiativo, escenarios de emisiones o adaptación, aprovechando el ajuste SFT en dominio y su tamaño de 4,21 B para despliegue en una sola GPU.
- Resumen y extracción de informes técnicos: con un techo de entrenamiento de 8.192 tokens, es adecuado para condensar secciones de informes climáticos y extraer entidades (gases, sectores, horizontes temporales) en pipelines por lotes.
- Base para un segundo ajuste fino: al distribuirse fusionado en BF16, con licencia Apache 2.0 y sin capas de visión, sirve como punto de partida limpio para LoRA adicionales en subdominios (agricultura, energía, política climática) sin arrastrar la complejidad multimodal del base.
- Baseline de investigación en eficiencia de ajuste: útil para reproducir y comparar la receta V17-Turbo (LoRA r=32, alpha=64, completion-only loss, 460 pasos) frente a otras configuraciones sobre el mismo dataset.
- Generación de material educativo y FAQ: producción de borradores de preguntas frecuentes, guiones de talleres o textos explicativos que luego un revisor humano valida, dado que el autor no reclama exactitud científica.
- Prototipado de atención al ciudadano en administraciones u ONG con presupuesto limitado: el tamaño permite inferencia en GPUs de consumo y la licencia Apache 2.0 no impone restricciones de uso comercial, lo que facilita pilotos internos.
- Filtrado y clasificación temática de corpus: uso como generador de etiquetas o de resúmenes cortos en la fase de curación de documentación climática antes de indexarla en un sistema de recuperación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se reclama ninguna evaluación de calidad de generación para este export y que el benchmark de held-out es provisional (98 casos redactados y revisados, 78 aprobados), sin resultados publicados.

Únicamente se dispone de métricas de entrenamiento del adaptador, que no deben interpretarse como rendimiento del modelo fusionado:

| Metrica | Valor | Nota |
|---|---|---|
| Perdida de validacion, checkpoint 230 | 0,37746524810791016 | Fin de la época 1; checkpoint fusionado en este export |
| Perdida de validacion, paso 460 | 0,38062456250190735 | Fin del entrenamiento (2 épocas) |
| Pasos totales | 460 | Microbatch 1, acumulación 16 |
| Ejemplos de entrenamiento / validación | 3.665 / 406 | Dataset `Prience91/Climate-1000-canary` |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: unos 8,4 GB solo de pesos, más caché KV y overhead del runtime; en la práctica conviene reservar 11-13 GB para secuencias largas.
- GPU profesionales recomendadas: A100 (40/80 GB), H100, L40S o A10G para servir con concurrencia; una A100 permite varios workers o contextos largos con holgura.
- GPU de consumo: cabe en RTX 4090 (24 GB), RTX 3090 (24 GB) y RTX 4080 (16 GB) en BF16. No cabe en tarjetas de 8 GB sin cuantización, y el repositorio no publica pesos cuantizados.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (versión validada para la fusión: 5.15.1), vLLM o TGI para servicio HTTP, y llama.cpp u Ollama previa conversión a GGUF, que el autor no proporciona.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.
- Requisito de compatibilidad: es necesario aplicar la plantilla de chat incluida con `enable_thinking=False`; obviarlo desvía la distribución de entrada respecto a la del entrenamiento.

## Comparativa con modelos similares

No se dispone de datos verificados de alternativas comparables en la información proporcionada. La única referencia contrastable es el modelo base del que deriva:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Climate-1000-Qwen-4b (este) | 4,21 B | No disponible (SFT con techo de 8.192 tokens) | Apache 2.0 | Pesos BF16 en safetensors, 8,4 GB | SFT en dominio climático, export fusionado, sin evaluación de calidad publicada |
| Qwen/Qwen3.5-4B (base) | 4 B | No disponible | Apache 2.0 | Repositorio oficial de Qwen | Modelo generalista; incluye codificador de visión que este export no incorpora |
| Otros ajustes climáticos de ~4 B | No disponible | No disponible | No disponible | No identificados en la información proporcionada | Sin datos para comparar |

## Limitaciones y advertencias

- Ausencia de evaluación de calidad: el autor no reclama ninguna medición de generación sobre el export fusionado; las pérdidas reportadas son del entrenamiento del adaptador y no se remidieron tras la fusión.
- La pérdida de tokens no garantiza exactitud científica ni calidad de citación; en un dominio factual como el climático el riesgo de alucinación de cifras, fechas e informes es alto y requiere verificación humana.
- Corpus de entrenamiento pequeño (3.665 ejemplos) y de un único dataset, con posible sobreajuste al estilo y vocabulario del mismo; el nombre `Climate-1000-canary` sugiere la presencia de elementos de control de contaminación, pero no se detalla su composición.
- Benchmark de held-out provisional: 98 casos redactados y revisados, de los cuales solo 78 están aprobados; no constituye una validación estadísticamente sólida.
- Idiomas no declarados: no hay garantía de calidad multilingüe, y el comportamiento fuera del inglés (si el corpus es mayoritariamente anglófono) no está documentado.
- Longitud de contexto no declarada: aunque el entrenamiento usó 8.192 tokens como techo, no se confirma la ventana nativa soportada en inferencia.
- Razonamiento desactivado por diseño en el entrenamiento; no debe esperarse un modo thinking ni capacidad de agente multi-paso.
- Sin soporte documentado de tool calling ni de function calling, lo que limita su integración en pipelines que dependan de llamadas estructuradas.
- Licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero al derivar de Qwen3.5-4B conviene revisar los términos del base y las obligaciones de atribución que el autor no detalla.
- Madurez y soporte comunitario nulos en la fecha de consulta: 0 descargas y 0 likes, sin issues ni validación externa; no es un modelo apto para producción sin una evaluación propia.
- Dependencia de versión: la fusión se validó con `transformers` 5.15.1 y una revisión concreta del base; versiones distintas pueden alterar la carga del tokenizador o de la plantilla.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Prience91/Climate-1000-Qwen-4b
- Adaptador LoRA de origen: https://huggingface.co/Prience91/GIIS-Mini-Qwen3.5-4B-LoRA-adapter
- Dataset de entrenamiento: https://huggingface.co/datasets/Prience91/Climate-1000-canary
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B (revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`)
- Manifiesto de fusión: `merge_manifest.json`, incluido en el repositorio del modelo
- Paper, blog o demo adicionales: no disponibles en la información proporcionada

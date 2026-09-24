# Jeesup/svd-safety-l2_basisresmix_remove50

## Resumen

svd-safety-l2_basisresmix_remove50 es un checkpoint de investigación publicado por el usuario Jeesup en HuggingFace, derivado de meta-llama/Llama-2-7b-chat-hf. No es un modelo conversacional de propósito general: es una celda concreta de una rejilla experimental que estudia cómo la compresión por SVD (descomposición en valores singulares) degrada el comportamiento de seguridad de un LLM y qué regla de selección de componentes lo repara mejor.

El punto de partida es Llama-2-7b-chat, comprimido con Basis Sharing (ICLR 2025; bases compartidas entre grupos de dos capas adyacentes) hasta eliminar el 50,00% de los parámetros densos (fracción resultante 0,4998, semilla 42). Sobre esa base se aplica una recuperación mediante LoRA de rango 8 únicamente sobre los coeficientes por capa, con las bases congeladas y sin alterar el presupuesto de parámetros.

Su relevancia es metodológica: cuantifica el coste de seguridad de la compresión (ASR de 0,1808 en AdvBench y 0,1565 en StrongREJECT, ambos con juez HarmBench) junto con la utilidad retenida (perplejidad de 13,2626 en WikiText-2) y el exceso de rechazo (0,1646 macro con WildGuard). El repositorio acumula 0 descargas y 0 likes, por lo que carece de validación independiente de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de meta-llama/Llama-2-7b-chat-hf); estructura de pesos comprimida mediante Basis Sharing (bases compartidas sobre grupos de 2 capas adyacentes) |
| Parametros totales | 6.738.415.616 (recuento de safetensors); presupuesto efectivo declarado: fraccion 0,4998 del modelo denso, es decir 50,00% de parametros eliminados |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (la ficha del modelo no la especifica) |
| Tipos de cuantizacion | No disponible; el repositorio solo contiene pesos en safetensors (13,5 GB, coherente con fp16 sobre el recuento completo de parametros) |
| Idiomas soportados | No disponible; el modelo base esta entrenado predominantemente en ingles |
| Licencia | Llama 2 Community License (incluye LICENSE.txt y USE_POLICY.md en el repositorio) |
| Formato de pesos | safetensors (libreria transformers); no se distribuyen GGUF ni otras conversiones |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Semilla | 42 |
| Fecha de creacion (metadatos HF) | 2026-09-23 |
| Ultima actualizacion (metadatos HF) | 2026-09-23 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-2-7b-chat (transformer decoder-only); la innovación de este artefacto no está en el modelo, sino en el proceso de compresión. Se aplica Basis Sharing, técnica presentada en ICLR 2025 que comparte bases entre grupos de dos capas adyacentes, hasta dejar el presupuesto en 50,00% de los parámetros densos. La compresión se ejecuta con semilla 42, lo que hace el resultado reproducible dentro del grid experimental. Nota: el recuento de parámetros de safetensors (6.738.415.616) coincide con el del modelo denso de Llama-2-7b, de modo que la reducción del 50% se declara como presupuesto efectivo de parámetros y no se materializa necesariamente en tensores de menor tamaño almacenado; la información disponible no detalla cómo se refleja esa reducción en los ficheros de pesos.

La recuperación posterior consiste en un ajuste fino LoRA de rango r=8 aplicado exclusivamente a los coeficientes por capa, con las bases congeladas y el presupuesto de parámetros sin cambios: 2 épocas, learning rate 0,0001, batch 64 y el dataset alpaca-cleaned. No se documentan en la información disponible ni el volumen de tokens de entrenamiento del modelo base, ni la composición completa del dataset de recuperación más allá de alpaca-cleaned, ni etapas adicionales de RLHF o DPO posteriores a la compresión.

## Capacidades

- Generacion de texto conversacional: conserva la funcion de chat generativo heredada de Llama-2-7b-chat, pero con calidad degradada por la compresion (perplejidad de 13,2626 en WikiText-2).
- Comportamiento de seguridad medible: es un sujeto experimental con tasas de exito de ataque documentadas (AdvBench ASR 0,1808; StrongREJECT ASR 0,1565 con juez HarmBench).
- Perfil de rechazo cuantificado: macro over-refusal de 0,1646 medido con WildGuard.
- Capacidades multilingues: no documentadas; el modelo base esta orientado al ingles.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado; el autor indica explicitamente que no es un asistente desplegable.
- Capacidades multimodales (vision, audio) o modos de razonamiento explicito (thinking mode): no disponibles.
- Interpretabilidad estructural: al conservar bases compartidas entre pares de capas, permite analizar directamente el efecto de esa comparticion sobre el comportamiento del modelo.

## Casos de uso

- Investigacion sobre degradacion de seguridad por compresion: reproducir la celda concreta (Basis Sharing, 50,00%, semilla 42) y medir el ASR con AdvBench y StrongREJECT para cuantificar cuanto dano introduce la compresion antes de cualquier recuperacion.
- Evaluacion de reglas de recuperacion: comparar el ajuste LoRA de rango 8 sobre coeficientes (bases congeladas) frente a otras reglas de seleccion de componentes del mismo grid, manteniendo constante el presupuesto de parametros.
- Interpretabilidad de bases SVD: al compartir bases entre grupos de dos capas adyacentes, el checkpoint permite estudiar que direcciones singulares son reutilizadas entre capas y correlacionarlas con cambios en las tasas de ataque.
- Calibracion de jueces automaticos de seguridad: usar las salidas del modelo como material para validar la sensibilidad de HarmBench y WildGuard, dado que se dispone de valores de referencia de ASR y over-refusal.
- Red-teaming controlado: emplear un sujeto con ASR conocido (~18%) para ajustar y validar pipelines de ataque antes de aplicarlos a modelos que si se vayan a desplegar.
- Linea base en pipelines de compresion: servir de referencia para comparar Basis Sharing contra alternativas como poda por magnitud o SVD capa a capa en el eje seguridad-utilidad.
- Estudio del trade-off seguridad-utilidad: relacionar la perplejidad retenida (13,2626) con las tasas de ataque y de sobre-rechazo para caracterizar el coste real de comprimir un modelo alineado.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| AdvBench | ASR (juez HarmBench) | 0,1808 |
| StrongREJECT | ASR (juez HarmBench) | 0,1565 |
| WildGuard | Macro over-refusal | 0,1646 |
| WikiText-2 | Perplejidad | 13,2626 |

No se han publicado en la informacion disponible los valores del modelo base (meta-llama/Llama-2-7b-chat-hf) ni de otras celdas del grid para establecer comparaciones directas. El autor advierte que varias celdas del grid estan deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, los pesos ocupan aproximadamente 12,5 GiB (13,5 GB de repositorio); con cache KV y activaciones conviene reservar 16 GB o mas para contextos largos y lotes mayores que 1.
- GPU recomendadas: A100 (40/80 GB), H100 y tarjetas profesionales con 24 GB o mas para fp16 sin cuantizar.
- Cabe en GPU de consumo: si en RTX 4090, RTX 3090 y RTX 4080 (24 GB y 16 GB respectivamente), con margen ajustado en las de 16 GB; en GPUs de 8-12 GB requeriria cuantizacion, que no se distribuye.
- Opciones de despliegue: transformers (libreria declarada) y text-generation-inference (el repositorio esta marcado como endpoints_compatible). vLLM seria compatible a nivel de arquitectura Llama, aunque no hay confirmacion del autor; llama.cpp u Ollama exigirian convertir los pesos a GGUF, conversion que no se proporciona y que puede no ser directa dada la estructura de bases compartidas.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Seguridad / utilidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l2_basisresmix_remove50 | 6.738.415.616 almacenados; presupuesto efectivo 0,4998 del denso | No disponible | AdvBench ASR 0,1808; StrongREJECT ASR 0,1565; PPL WikiText-2 13,2626 | Llama 2 Community License | HuggingFace, 0 descargas |
| meta-llama/Llama-2-7b-chat-hf (base sin comprimir) | 6.738.415.616 | No disponible en la informacion proporcionada | No disponible | Llama 2 Community License | HuggingFace (referencia del campo base_model) |
| Otras celdas del mismo grid (Basis Sharing, distintos presupuestos y reglas de seleccion) | No disponible | No disponible | No disponible | Llama 2 Community License | No documentadas en la informacion disponible |

No se dispone de datos publicados en la informacion proporcionada para comparar con alternativas de otros autores (por ejemplo, otros checkpoints comprimidos de Llama-2-7b-chat o modelos de ~7-8B de propósito general), por lo que la comparativa cuantitativa de rendimiento queda como no disponible.

## Limitaciones y advertencias

- No es un asistente desplegable: el propio autor lo describe como artefacto de investigacion y sujeto experimental, no como modelo de proposito general.
- Seguridad degradada de forma deliberada en varias celdas del grid: la compresion por si sola eleva la tasa de exito de ataque, y este checkpoint presenta un ASR de 0,1808 en AdvBench y 0,1565 en StrongREJECT. No debe exponerse a usuarios finales.
- Exceso de rechazo: macro over-refusal de 0,1646 (WildGuard), es decir, rechaza peticiones benignas en un porcentaje no despreciable.
- Perdida de calidad medible: perplejidad de 13,2626 en WikiText-2, sin valor de referencia del modelo base publicado en esta informacion.
- Riesgo de alucinacion: la compresion al 50% de los parametros densos y la recuperacion limitada a coeficientes con LoRA r=8 incrementan la probabilidad de degeneracion en generaciones largas; no se aportan evaluaciones de veracidad.
- Idiomas: no se documenta soporte multilingue; el comportamiento fuera del ingles no esta caracterizado.
- Restricciones de licencia: Llama 2 Community License, con LICENSE.txt y USE_POLICY.md vinculantes en el repositorio. Cualquier uso derivado, incluido el comercial, queda sujeto a esas condiciones y a la politica de uso aceptable de Meta.
- Sin validacion de la comunidad: 0 descargas y 0 likes, sin terceros que hayan reproducido las metricas.
- Discrepancia no aclarada: el recuento de parametros de safetensors coincide con el del modelo denso y el repositorio ocupa 13,5 GB, coherente con fp16 a tamano completo, mientras la ficha declara un presupuesto del 50%. Conviene verificar la estructura real de los tensores antes de asumir ahorros de memoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_basisresmix_remove50
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia y politica de uso: LICENSE.txt y USE_POLICY.md incluidos en el repositorio del modelo
- Referencia metodologica citada en la model card: Basis Sharing (ICLR 2025); no se proporciona URL en la informacion disponible
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante para este modelo; todos los resultados devueltos corresponden a contenido sin relacion con el artefacto.

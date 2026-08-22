# dolorismineccis/Ornith-1.5-35B-A3B-Q4_K_M-e4dfb35a

## Resumen

Ornith-1.5-35B-A3B es un modelo de lenguaje multimodal (texto e imagen) de arquitectura MoE (mixture-of-experts) desarrollado por Ornith AI, publicado bajo licencia MIT. La variante aquí documentada es una cuantización GGUF Q4_K_M generada por el usuario `dolorismineccis` a partir de la revisión bloqueada `e4dfb35a` del modelo base, utilizando `llama.cpp` como runtime de inferencia. El modelo emplea la arquitectura `Qwen3_5MoeForConditionalGeneration` con 256 expertos y 8 activos por token, lo que resulta en 35.5 mil millones de parámetros totales y aproximadamente 3 mil millones de parámetros activos.

El modelo está diseñado para razonamiento, generación de código y tareas agénticas, e incorpora capacidades de visión (image-text-to-text). Incluye un bloque de razonamiento explícito (`thinking`/`response`) y soporte para tool calling mediante bloques `<tool_call>`. Es relevante ahora porque ofrece un punto de entrada de bajo coste computacional a un modelo de 35B con solo 3B activos, ejecutable en hardware de consumo, aunque el propio autor de la cuantización advierte que este checkpoint concreto está marcado como `deployment_disqualified=true` y no debe tratarse como apto para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5MoeForConditionalGeneration (MoE, vision-language) |
| Parametros totales | 35.505.251.456 (35,5B) |
| Parametros activos | ~3B (A3B, top-8 de 256 expertos) |
| Longitud de contexto | 8192 tokens en la configuracion de ejemplo de llama.cpp (contexto nativo no disponible) |
| Tipos de cuantizacion | Q4_K_M (GGUF); el modelo base original esta en BF16 |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp), con mmproj separado para vision |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura MoE basada en el diseño de Qwen3.5, con 256 expertos en total y selección dinámica de los 8 expertos más relevantes por token. Esta configuración permite que, pese a los 35,5B de parámetros totales, solo se activen aproximadamente 3B por paso de inferencia, reduciendo drásticamente el coste computacional frente a un modelo denso equivalente. El componente de visión se sirve mediante un proyector multimodal (`mmproj`) que se distribuye como un archivo separado en formato BF16.

El checkpoint cuantizado se generó con `llama.cpp` en la revisión `6d05498314db1b57f81c271080018aa2d0b89be9`, sin poda de expertos, y se validó contra la revisión fuente `e4dfb35a93d4b6822a811a7676f3488514abe7e2` del repositorio original (28 archivos, 71.926.950.570 bytes verificados). El modelo incorpora un modo de razonamiento explícito: la respuesta del asistente se abre con un bloque `thinking` antes de la respuesta final, y los bloques `<tool_call>` se pueden extraer mediante un parser específico para exponerlos como llamadas a herramientas en formato OpenAI. Los detalles del dataset de entrenamiento, el número de tokens y el pipeline de alineación (RLHF/DPO) no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento multi-paso con bloque de pensamiento explícito (`thinking`/`response`).
- Comprensión de imágenes (vision-language): el modelo acepta entrada de texto e imagen y genera respuestas textuales.
- Tool calling / function calling: emite bloques `<tool_call>` que pueden parsearse y exponerse como llamadas a herramientas compatibles con el formato OpenAI.
- Capacidades agénticas: el modo de razonamiento y el soporte de herramientas permiten flujos de agente multi-paso.
- Generación de código: orientado a tareas de codificación agéntica (self-scaffolding).
- Multilingüe limitado a inglés y chino.
- Compatible con servidores llama.cpp (`llama-server`) tanto en modo solo texto como multimodal.

## Casos de uso

- Asistentes de codigo con razonamiento: el modelo puede planificar y ejecutar tareas de programación multi-paso, generando código y llamando a herramientas de forma autónoma, gracias a su bloque de razonamiento y soporte de tool calling.
- Agentes de automatizacion de tareas: integrable en pipelines agénticos donde se requiere decidir qué herramienta invocar (API, shell, base de datos) y razonar sobre los resultados intermedios.
- Analisis de documentos con imagenes: al aceptar entrada visual, puede procesar capturas de pantalla, diagramas o esquemas y generar explicaciones o código a partir de ellos.
- Despliegue local en hardware de consumo: con solo ~3B parámetros activos y una cuantización Q4_K_M de ~21,7 GB, puede ejecutarse en GPUs de 24 GB como la RTX 4090, lo que lo hace viable para entornos de desarrollo sin acceso a clústeres.
- Prototipado rapido de aplicaciones multimodales: el formato GGUF y la integración con `llama-server` permiten levantar un endpoint OpenAI-compatible en minutos para experimentar con tareas de texto e imagen.
- Investigacion en cuantizacion y evaluacion de modelos MoE: el checkpoint incluye manifiestos de cuantización y validación de origen, útil para reproducir experimentos de degradación por cuantización en arquitecturas MoE multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor de la cuantización sí documenta una evaluación estática comparativa BF16 frente a Q4_K_M con el mismo runtime:

| Metrica | Resultado |
|---|---|
| Retencion de pares en texto (paired retention) | 81,82% |
| Exito en texto | 27/100, puntuacion media 55,59 |
| Fallos de riesgo severo en texto | TXT-A10, TXT-A15, TXT-S03 |
| Retencion de pares en vision | 100% |
| Exito en vision | 12/20, puntuacion media 79,20 |
| Fallos de riesgo severo en vision | 0 |

El proyecto marcó este checkpoint como `deployment_disqualified=true` debido a los fallos de riesgo severo en la modalidad de texto. No se debe interpretar como un modelo cualificado para producción.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF principal ocupa 21,7 GB y el `mmproj` de visión 902 MB, por lo que se necesitan aproximadamente 23 GB de VRAM para una descarga completa en GPU.
- GPU recomendadas: RTX 4090 (24 GB), A100 40 GB, A10G 24 GB, o cualquier GPU con 24 GB o más. En GPUs de 16 GB (RTX 4080, RTX 3090) sería necesario offload parcial a CPU.
- En consumer GPU: sí, cabe en una RTX 4090 con 24 GB de VRAM si se usa Q4_K_M y contexto moderado (8192 tokens).
- Opciones de despliegue: `llama-server` de llama.cpp (con `--mmproj` para visión), Ollama (si se importa el GGUF), o cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la información proporcionada. Dependerán del hardware, el offload y el tamaño de lote.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (Q4_K_M) | 35,5B | ~3B | 8192 (ejemplo) | MIT | GGUF |
| Ornith-1.0-35B | 35B | no disponible | no disponible | no disponible | no disponible |
| Qwen3.5 MoE (base de Ornith) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada. La comparativa se limita a parámetros y disponibilidad.

## Limitaciones y advertencias

- El autor de la cuantización marca explícitamente este checkpoint como `deployment_disqualified=true`: no está cualificado para despliegue en producción.
- Se han detectado fallos de riesgo severo en la modalidad de texto (TXT-A10, TXT-A15, TXT-S03) en la evaluación estática BF16 vs Q4_K_M.
- La retención de calidad en texto tras la cuantización es del 81,82%, lo que implica una degradación notable frente al modelo en BF16.
- La modalidad de visión mantiene una retención del 100% y cero fallos severos, pero la muestra evaluada es pequeña (20 casos).
- Idiomas limitados a inglés y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- El contexto nativo del modelo no está documentado en la información disponible; el ejemplo de uso emplea 8192 tokens, pero no se puede confirmar que sea el máximo soportado.
- La licencia MIT declarada corresponde al modelo base; el autor de la cuantización recomienda consultar el repositorio upstream para confirmar los términos vigentes.
- Es un artefacto experimental: no se han publicado benchmarks estándar (MMLU, HumanEval, GSM8K) que permitan comparar su rendimiento con otros modelos de forma objetiva.

## Enlaces

- Repositorio HuggingFace del checkpoint cuantizado: https://huggingface.co/dolorismineccis/Ornith-1.5-35B-A3B-Q4_K_M-e4dfb35a
- Modelo base en HuggingFace: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Modelo anterior Ornith-1.0-35B: https://huggingface.co/ornith-ai/Ornith-1.0-35B
- Guia de despliegue local y VRAM: https://www.mindstudio.ai/blog/ornith-1-5-35b-a3b-local-run
- Sitio oficial de Ornith AI: https://ornith.online/
- Imagen Docker de Ornith-1.5: https://hub.docker.com/r/ai/ornith-1.5
- Cuantizaciones GGUF alternativas: https://huggingface.co/AtomicChat/ornith-35b-GGUF

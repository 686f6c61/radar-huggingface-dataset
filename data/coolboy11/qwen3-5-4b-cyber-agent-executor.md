# Coolboy11/qwen3.5-4b-cyber-agent-EXECUTOR

## Resumen

`Coolboy11/qwen3.5-4b-cyber-agent-EXECUTOR` es un modelo de generación de texto publicado en Hugging Face por el usuario Coolboy11. Según los metadatos del repositorio, emplea la arquitectura identificada en el Hub como `qwen3_5_text` y contiene 4.205.751.296 parámetros, lo que lo sitúa en la categoría de modelos compactos de ~4B. El repositorio ocupa 8,4 GB y contiene pesos en formato `safetensors` cargables con la librería `transformers`.

El nombre del modelo sugiere un ajuste fino orientado a tareas de agente en el ámbito de la ciberseguridad ("cyber-agent-EXECUTOR"), presumiblemente derivado de la familia Qwen3.5, aunque esta apreciación procede únicamente de la nomenclatura y de la etiqueta de arquitectura, no de documentación del autor. La model card publicada es la plantilla automática de Hugging Face y no contiene ni una sola sección completada: todos los campos aparecen como "[More Information Needed]".

La relevancia de esta ficha es, por tanto, fundamentalmente descriptiva y de advertencia: se trata de un checkpoint sin documentación, sin resultados de evaluación, sin licencia declarada y con cero descargas y cero "likes" en el momento de la consulta. Cualquier evaluación de calidad, seguridad o idoneidad para producción es imposible con la información disponible y requeriría una validación empírica por parte del usuario.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only tipo transformer, etiqueta de arquitectura `qwen3_5_text` en el Hub (familia Qwen3.5); detalles internos no disponibles |
| Parametros totales | 4.205.751.296 (~4,21B), dato real de los safetensors |
| Parametros activos | no disponible (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | no disponible (la model card no lo especifica) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos `safetensors`; no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (campo vacío en el Hub y en la model card) |
| Formato de pesos | `safetensors` (8,4 GB de repositorio, coherente con ~2 bytes por parámetro en bf16/fp16) |

## Arquitectura y entrenamiento

La única información verificable es la etiqueta de arquitectura `qwen3_5_text` registrada en el Hub, que apunta a un transformer decoder-only de la familia Qwen3.5 adaptado a texto, y el recuento exacto de 4.205.751.296 parámetros. El tamaño del repositorio (8,4 GB) es consistente con un checkpoint en precisión bf16/fp16 sin variantes cuantizadas ni ficheros auxiliares de gran tamaño. No se dispone de información sobre número de capas, dimensión oculta, mecanismo de atención, uso de attention lineal o híbrida, ni sobre vocabulario.

Respecto al entrenamiento, la model card no documenta nada: no hay datos sobre el corpus, el número de tokens, la composición del dataset, la existencia de fases de instrucción, RLHF, DPO o ajuste con datos sintéticos. Tampoco se especifica de qué checkpoint base parte el ajuste, aunque el nombre del repositorio indica "qwen3.5-4b" y el sufijo "cyber-agent-EXECUTOR" sugiere un entrenamiento orientado a ejecución de acciones de agente en dominios de seguridad informática. Se trata de una inferencia a partir de la nomenclatura, no de un dato confirmado.

## Capacidades

- Generación de texto y modo conversacional: son las únicas capacidades declaradas de forma explícita, a través del pipeline `text-generation` y la etiqueta `conversational`.
- Razonamiento, matemáticas y código: no documentado. Por el tamaño (4,2B) y la ausencia de evaluación publicada no se puede afirmar ningún nivel de competencia.
- Tool calling / function calling: no documentado. El sufijo "EXECUTOR" sugiere orientación a ejecución de acciones, pero no hay evidencia técnica en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponible; no se declara ningún idioma.
- Capacidades especiales (modo thinking, visión, audio): no documentado. La etiqueta `qwen3_5_text` apunta a un modelo exclusivamente de texto.

## Casos de uso

Los siguientes escenarios son hipótesis de aplicación razonables para un modelo de texto de ~4B parámetros, no casos validados sobre este checkpoint concreto. Cualquier uso real exige una evaluación previa por parte del equipo adoptante.

- Clasificación y triaje de alertas de seguridad: dado su tamaño, podría desplegarse en local para etiquetar y priorizar eventos de un SIEM sin enviar datos sensibles a terceros; requiere validar previamente la precisión sobre el corpus propio.
- Asistencia a la redacción de reglas de detección: generación y explicación de reglas Sigma o YARA a partir de descripciones en lenguaje natural, con revisión humana obligatoria antes de su despliegue.
- Resumen de informes técnicos y volcados de logs: extracción de conclusiones de documentos largos, condicionado a que se confirme la ventana de contexto real del modelo, hoy desconocida.
- Prototipado de pipelines de agentes: al ser un modelo pequeño, permite iterar rápidamente en local sobre bucles de razonamiento y llamadas a herramientas antes de escalar a un modelo mayor; su idoneidad para tool calling está sin verificar.
- Generación de código auxiliar en tareas de automatización: scripts de análisis o parseo de artefactos, siempre con ejecución en entorno aislado y revisión del resultado.
- Experimentación académica sobre ajuste fino en dominios de seguridad: como checkpoint de partida de 4,2B para estudiar transferencia de dominio, al no requerir más de una GPU de gama alta en precisión reducida.
- Chat de soporte interno con contexto acotado: atención a consultas técnicas de primer nivel, con escalado a un modelo mayor cuando la confianza sea baja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye la sección de evaluación (aparece como "[More Information Needed]") y la búsqueda web realizada no devolvió ninguna fuente relacionada con el modelo, únicamente resultados genéricos de buscadores de imágenes sin relación alguna.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del recuento de parámetros (4,21B) y de fórmulas estándar de memoria; no proceden de mediciones publicadas por el autor.

- VRAM en bf16/fp16: ~8,4 GB solo para pesos, más caché KV y activaciones; en la práctica, entre 10 y 12 GB para contextos cortos y bastante más si la ventana de contexto resulta ser grande.
- VRAM en int8: ~4,2 GB de pesos, en torno a 6-7 GB totales.
- VRAM en 4 bits (GGUF Q4_K_M, ~4,5 bits por parámetro): ~2,4 GB de pesos, alrededor de 4-5 GB totales.
- GPU consumer: cabe en bf16 en tarjetas de 12-16 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super). En tarjetas de 8 GB sería necesario cuantizar a 4 u 8 bits. En Apple Silicon, 16 GB de memoria unificada permiten bf16 con contexto moderado.
- GPU de datacenter: A100 40/80 GB, H100 o L40S permiten servir varias réplicas o contextos largos con holgura; para una sola instancia, una L4 de 24 GB es suficiente en bf16.
- Despliegue: al publicarse solo `safetensors`, la vía directa es `transformers` (y servidores compatibles como vLLM o TGI, ambos soportados para arquitecturas Qwen). Para llama.cpp u Ollama habría que generar la conversión a GGUF por cuenta propia, ya que el repositorio no incluye cuantizaciones.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

No es posible establecer una comparativa fiable con los datos disponibles. No se han podido verificar parámetros, contexto, licencia ni rendimiento de este checkpoint más allá del recuento de parámetros, y las fuentes consultadas no aportan cifras de alternativas.

| Criterio | qwen3.5-4b-cyber-agent-EXECUTOR | Alternativas de la misma categoría (~3-4B) |
|---|---|---|
| Parametros | 4,21B (verificado) | no verificado en las fuentes consultadas |
| Longitud de contexto | no disponible | no verificado en las fuentes consultadas |
| Resultados de evaluación | no publicados | no verificado en las fuentes consultadas |
| Licencia | no disponible | no verificado en las fuentes consultadas |
| Disponibilidad de cuantizaciones | no (solo safetensors) | no verificado en las fuentes consultadas |
| Tracción en el Hub | 0 descargas, 0 likes | no verificado en las fuentes consultadas |

Como referencia de categoría, en el segmento de 3-4B existen familias consolidadas (Qwen2.5-3B-Instruct, Llama 3.2 3B, Phi-3.5-mini) que el lector debería consultar directamente en sus propias ficheras para obtener parámetros, contexto y licencia verificados antes de tomar una decisión.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial, redistribución ni modificación. Es un bloqueo objetivo para cualquier despliegue en producción.
- Model card automática y vacía: no hay información sobre datos de entrenamiento, sesgos, evaluación ni uso previsto. La sección de riesgos del autor no existe.
- Procedencia del ajuste desconocida: si el modelo deriva de un checkpoint Qwen3.5, su licencia original podría imponer condiciones adicionales que aquí no se reflejan.
- Sin validación comunitaria: cero descargas y cero "likes" en el momento de la consulta, lo que implica ausencia de revisión por terceros y de reportes de fallos.
- Riesgo de alucinación no cuantificado: no existe ninguna evaluación publicada; en un modelo de 4,2B el riesgo es estructuralmente alto en tareas de razonamiento largo y matemáticas.
- Dominio sensible: un ajuste orientado a "cyber" puede producir contenido operativo de seguridad ofensiva. Debe evaluarse el cumplimiento de políticas internas y de la legislación aplicable antes de cualquier uso.
- Contexto e idiomas desconocidos: no se puede garantizar el comportamiento en castellano ni en conversaciones de varios turnos sin pruebas empíricas.
- Fecha de creación atípica (2026-10-19 en los metadatos): conviene verificar la integridad del repositorio y el origen del autor antes de descargar los pesos.
- Sin cuantizaciones oficiales: el usuario asume el coste y el riesgo de convertir los pesos a GGUF o AWQ, con posible degradación de calidad no medida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Coolboy11/qwen3.5-4b-cyber-agent-EXECUTOR
- Paper citado en la model card (Lacoste et al., 2019, sobre impacto medioambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML referenciada en la model card: https://mlco2.github.io/impact#compute
- Repositorio, paper, demo y contacto del autor: no disponibles en la información proporcionada.
- La búsqueda web realizada no devolvió ningún enlace relevante sobre el modelo; los resultados obtenidos corresponden a herramientas de búsqueda de imágenes sin relación con esta ficha.

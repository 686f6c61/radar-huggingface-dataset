# davidheineman/opd-teacher-R1Distill-LargestConvexPolygon-step149

## Resumen

El modelo `davidheineman/opd-teacher-R1Distill-LargestConvexPolygon-step149` es un ajuste fino de investigación publicado por el usuario davidheineman sobre el modelo base `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`. Se trata de un "teacher" (profesor) entrenado específicamente para destilación on-policy (OPD, *on-policy distillation*) en un entorno concreto: la resolución de problemas de tipo `LargestConvexPolygon` (polígono convexo de área máxima) con dificultad 0. No es un modelo de propósito general, sino un artefacto de entrenamiento pensado para generar trazas de razonamiento de alta calidad que después se destilan en otro modelo alumno.

El entrenamiento consistió en 150 pasos con RL (etiquetas `grpo` y `rlve`), usando cuatro prompts por paso y 16 rollouts por prompt, y sin aplicar el filtrado de prompts de DAPO. Los pesos publicados corresponden al paso 149, es decir, el estado final del entrenamiento. El proyecto de entrenamiento asociado es `david-heineman/rl-data-opd-teachers-r1-distil` y el grupo de entrenamiento se identifica como `opd-teachers-r1-nofilter16-20260929-231458`.

Arquitecturalmente hereda la familia Qwen2 (etiqueta `qwen2`), un transformer decoder-only denso de 1.777.088.000 parámetros totales según los pesos en safetensors (1,78 B), con un repositorio de 3,6 GB. Su relevancia actual es acotada y muy experimental: sirve como ejemplo reproducible de cómo se construyen profesores especializados por entorno dentro de pipelines de RL y destilación, y como punto de partida para quien investigue RLVE (RL con entornos verificables) o GRPO aplicado a razonamiento matemático.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, segun etiqueta `qwen2`); derivado de DeepSeek-R1-Distill-Qwen-1.5B |
| Parametros totales | 1.777.088.000 (1,78 B), segun pesos safetensors |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors (sin GGUF, AWQ ni GPTQ oficiales) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 3,6 GB |
| Modelo base | deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B |
| Metodo de entrenamiento | RL (etiquetas `grpo`, `rlve`, `opd-teacher`), 150 pasos |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only denso de la familia Qwen2 con aproximadamente 1,78 B de parámetros. No se documenta en la model card ninguna modificación estructural, ni atención lineal, ni decodificación especulativa, ni cabezas adicionales. El repositorio únicamente contiene los pesos resultantes del ajuste.

El entrenamiento es lo diferencial: 150 pasos de RL sobre prompts de dificultad 0 del entorno `LargestConvexPolygon`, con cuatro prompts por paso y 16 rollouts por prompt, sin filtrado de prompts estilo DAPO. Las etiquetas `grpo` (Group Relative Policy Optimization) y `rlve` (RL con entornos verificables) apuntan a un esquema de refuerzo con recompensa verificable, típico de tareas geométricas con solución comprobable programáticamente. No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de SFT, DPO o RLHF previas o posteriores al bucle de RL. El propósito declarado es servir como profesor para destilación on-policy específica de entorno, no como modelo desplegable generalista.

## Capacidades

- Generación de texto y razonamiento paso a paso, heredados del destilado de DeepSeek-R1 sobre Qwen2.
- Razonamiento matemático y geométrico, presumiblemente reforzado en el dominio concreto de `LargestConvexPolygon` y en prompts de dificultad 0.
- Generación de trazas de razonamiento largas aptas para destilación on-policy (uso principal declarado).
- Soporte de tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente, aunque el formato de trazas de R1 implica cadenas de razonamiento.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no disponibles. El modelo base es solo texto.
- Formato de interacción: no disponible (no se documenta plantilla de chat ni tokenizador propios en la información proporcionada).

## Casos de uso

- Generación de datos de destilación para geometría computacional: usar el modelo como profesor que produce trazas de solución para problemas de polígono convexo de área máxima, que luego se destilan en un alumno más pequeño o más rápido.
- Investigación en RLVE y GRPO: reproducir o comparar el efecto del número de rollouts (16 por prompt) y de la ausencia de filtrado DAPO en la calidad de las trazas generadas.
- Construcción de entornos verificables de RL: emplear las trazas generadas como soluciones candidatas que un verificador programático evalúa, sirviendo de base para recompensas automáticas.
- Aumento de datos para benchmarks de razonamiento geométrico: ampliar conjuntos de problemas de dificultad baja con soluciones razonadas paso a paso.
- Estudio de especialización por entorno: analizar cuánto se degrada el rendimiento general de un modelo de 1,5 B al sobreentrenarlo 150 pasos en una única tarea.
- Prototipo de tutor de geometría computacional: no recomendado en producción por la falta de licencia y de evaluación, pero válido en un entorno de laboratorio para explorar explicaciones de algoritmos de envolvente convexa.
- Punto de partida para pipelines de OPD multientorno: replicar la receta (`opd-teachers-r1-nofilter16-...`) con otros entornos y comparar profesores entre sí.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, MATH ni de la tarea `LargestConvexPolygon`, y la búsqueda web asociada no devolvió datos de evaluación del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 3,6 GB solo de pesos, más caché KV; en la práctica unos 6-8 GB con contexto moderado.
- VRAM estimada en INT8: alrededor de 1,9 GB de pesos, unos 3-4 GB en ejecución real.
- VRAM estimada en INT4: alrededor de 1,0 GB de pesos, unos 2 GB en ejecución real (requiere cuantización propia, no publicada).
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090) es suficiente; en el ámbito profesional, L4, A10G, L40S. A100 y H100 son sobredimensionadas para 1,78 B de parámetros.
- Cabe en GPU consumer: sí, con holgura, en la mayoría de tarjetas de 8-12 GB.
- Opciones de despliegue: `transformers` (carga directa de safetensors), vLLM y TGI para servicio con batching; llama.cpp y Ollama requieren convertir previamente los pesos a GGUF, conversión no publicada por el autor.
- Latencia y throughput estimados: no disponible; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| opd-teacher-R1Distill-LargestConvexPolygon-step149 | 1,78 B | No disponible | Ajuste RL especializado (profesor OPD) | No disponible | HuggingFace, 0 descargas |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | ~1,78 B | No disponible en esta ficha | Destilado de razonamiento generalista | MIT (segun el modelo base) | HuggingFace, ampliamente usado |
| Modelos Qwen2.5 de ~1,5 B | ~1,5 B | No disponible en esta ficha | LLM generalista | Apache 2.0 (segun la familia) | HuggingFace, ampliamente usado |
| Otros profesores OPD del mismo proyecto (`rl-data-opd-teachers-r1-distil`) | ~1,78 B | No disponible | Ajustes RL por entorno | No disponible | HuggingFace |

La comparación cuantitativa de rendimiento no es posible: el modelo no publica benchmarks y los comparadores pertenecen a categorías distintas (generalista frente a profesor especializado de un único entorno).

## Limitaciones y advertencias

- Modelo de investigación muy especializado: entrenado solo con prompts de dificultad 0 del entorno `LargestConvexPolygon`; es esperable un rendimiento pobre fuera de ese dominio.
- Riesgo alto de olvido catastrófico: 150 pasos de RL sobre una única tarea pueden degradar capacidades generales del modelo base.
- Licencia no disponible: no se puede asumir uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Idiomas no especificados: no hay garantía de comportamiento correcto en castellano ni en idiomas distintos del inglés de los prompts de entrenamiento.
- Sesgos conocidos: no documentados; el modelo base puede arrastrar sesgos de sus datos originales, no evaluados aquí.
- Riesgo de alucinación: elevado en pasos intermedios de razonamiento matemático si el modelo no ha consolidado el algoritmo; sin verificador externo, las trazas no son fiables.
- Sin datos de benchmarks ni evaluaciones independientes: descargas y likes a 0, lo que implica ausencia de validación por parte de la comunidad.
- Contexto y plantilla de chat no documentados: hay que inspeccionar la configuración del repositorio para saber qué tokenizador y qué formato de prompt espera.
- Longitud de secuencia y caché KV no especificadas: pueden aparecer comportamientos inesperados con entradas largas.
- Artefacto pensado como profesor de destilación: usarlo directamente como asistente en producción no es el propósito declarado por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidheineman/opd-teacher-R1Distill-LargestConvexPolygon-step149
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Proyecto de entrenamiento citado en la model card: `david-heineman/rl-data-opd-teachers-r1-distil` (referencia textual; no se ha verificado su URL pública)
- Grupo de entrenamiento citado: `opd-teachers-r1-nofilter16-20260929-231458`
- La busqueda web realizada no devolvio enlaces relevantes sobre el modelo (unicamente resultados de herramientas de traduccion), por lo que no hay papers, blogs, repos ni demos adicionales que enlazar.

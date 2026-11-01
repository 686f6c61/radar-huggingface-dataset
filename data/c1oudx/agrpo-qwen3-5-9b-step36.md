# C1oudX/AGRPO-Qwen3.5-9B-step36

## Resumen

AGRPO-Qwen3.5-9B-step36 es un ajuste fino del modelo Qwen/Qwen3.5-9B publicado por el usuario C1oudX en HuggingFace. Se trata de un modelo multimodal de tipo image-text-to-text entrenado mediante GRPO agéntico multi-turno (Agentic GRPO) sobre la tarea OptiBench, orientado a la generación de código y al uso de herramientas en entornos de optimización. El checkpoint exportado corresponde al paso 36 de entrenamiento, tras tres épocas sobre el conjunto train400.

La relevancia del modelo reside en su enfoque de entrenamiento: en lugar de un ajuste supervisado clásico, emplea aprendizaje por refuerzo con retroalimentación de ejecución multi-turno, ventajas de grupo GRPO, recorte PPO y regularización KL y de entropía. El resultado reportado por el autor es una mejora sustancial en precisión de tareas de optimización (del 55,78 % al 68,99 % en micro precisión sobre 1393 tareas), lo que lo convierte en un candidato para pipelines de agentes que resuelven problemas de optimización con llamadas a herramientas.

El modelo tiene 9.409.813.744 parámetros en formato BF16 fusionado (18,8 GB de repositorio), licencia Apache-2.0 y se distribuye en safetensors para su uso con Transformers. No se especifican idiomas soportados ni se detalla la composición del dataset de entrenamiento más allá de la referencia a OptiBench.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basada en Qwen3.5-9B |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el entrenamiento usa límites de 8192 tokens en prompt/respuesta) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16 fusionado) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B (revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a`) y conserva su arquitectura transformer multimodal, con pipeline image-text-to-text. Sobre esa base se aplica un ajuste fino mediante GRPO agéntico multi-turno: ocho rollouts por prompt, batch de 32, tasa de aprendizaje de 1e-6, tres épocas y 36 pasos de entrenamiento en total. El entrenamiento incorpora retroalimentación de ejecución multi-turno, ventajas de grupo GRPO, recorte PPO y regularización KL y de entropía.

La tarea de entrenamiento es OptiBench train400, un conjunto orientado a problemas de optimización resueltos con herramientas. El modelo se exporta como checkpoint fusionado en BF16, es decir, los pesos del adaptador de RL se han integrado en el modelo base. El autor indica que la evaluación se reproduce con un entorno bloqueado de AGRPO y adaptadores de herramientas, usando Transformers 5.12.1, PyTorch 2.10.0 y vLLM 0.19.0.

## Capacidades

- Generación de texto y razonamiento multi-turno en el contexto de resolución de problemas de optimización.
- Generación de código para construir y evaluar soluciones de optimización.
- Uso de herramientas (tool calling) con hasta ocho herramientas disponibles, según la configuración de evaluación del autor.
- Ejecución agéntica multi-turno con retroalimentación de ejecución, hasta 15 turnos de asistente.
- Procesamiento de entradas image-text-to-text (multimodal), heredado del modelo base Qwen3.5-9B.
- Capacidades multilingües: no disponibles en la información proporcionada (la model card incluye texto en inglés y chino, pero no se declara un listado de idiomas).
- No se documentan modos especiales como thinking mode, audio o decodificación especulativa.

## Casos de uso

- Resolución de problemas de optimización con agentes: el modelo puede recibir un enunciado de OptiBench, invocar herramientas de cálculo o evaluación y refinar su solución a lo largo de varios turnos, aprovechando la retroalimentación de ejecución con la que fue entrenado.
- Generación de código para modelado matemático: dado un problema de optimización, el modelo produce código ejecutable que formula restricciones, objetivos y resuelve con librerías de optimización, integrándose en pipelines de evaluación automática.
- Asistente de investigación operativa: para equipos que necesitan explorar formulaciones alternativas de un problema (ML o NP), el modelo puede proponer y validar variantes de forma iterativa con llamadas a herramientas.
- Automatización de tareas de CI/CD para código de optimización: el modelo puede generar y probar soluciones contra un conjunto de validación, usando tool calling para ejecutar tests y corregir errores en turnos sucesivos.
- Evaluación de factibilidad constructiva: en problemas NP, el modelo puede emitir soluciones y comprobar su factibilidad mediante herramientas, útil en entornos de benchmark o competición.
- Prototipado de agentes con vLLM: al estar disponible en safetensors y ser compatible con Transformers y vLLM 0.19.0, puede desplegarse como backend de un agente que resuelve tareas de optimización con múltiples herramientas.
- Análisis multimodal de enunciados: al heredar la capacidad image-text-to-text de Qwen3.5-9B, puede procesar problemas que incluyan diagramas o tablas en imagen junto al texto.

## Benchmarks y rendimiento

| Medida | Base sin entrenar | Step36 |
|---|---:|---:|
| Precisión micro OR1393 | 777/1393 (55,78 %) | 961/1393 (68,99 %) |
| Precisión macro OR1393 (ocho conjuntos) | 44,55 % | 62,36 % |
| Envíos válidos OPT-Bench ML (holdout local) | 16/20 | 18/20 |
| Envíos factibles OPT-Bench NP | 24/50 (48 %) | 30/50 (60 %) |

El autor señala que, entre 14 tareas OPT-Bench ML conjuntamente válidas, step36 gana en 3 métricas y pierde en 11; entre 22 casos OPT-Bench NP conjuntamente factibles, gana 1 objetivo, pierde 1 y empata en 20. La evaluación usa ocho herramientas, decodificación greedy con n=1, hasta 15 turnos de asistente y límites de 8192 tokens en prompt y respuesta, incluyendo las observaciones de herramientas en el presupuesto de respuesta. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 18,8 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 24 GB para contexto corto.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16 con contexto limitado; para contextos largos o mayor batch, A100/H100.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con BF16 y contexto moderado; en GPUs de 16 GB requeriría cuantización, no publicada por el autor.
- Opciones de despliegue: Transformers (versión de referencia 5.12.1) y vLLM 0.19.0, según el entorno de evaluación del autor. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AGRPO-Qwen3.5-9B-step36 | 9,41 B | no disponible | RL agéntico (GRPO) sobre Qwen3.5-9B | Apache-2.0 | HuggingFace (25 descargas) |
| Qwen/Qwen3.5-9B (base) | ~9 B | no disponible | Modelo base multimodal | Apache-2.0 | HuggingFace |
| Alternativas de 9B con tool use | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparables con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El entrenamiento se limita a 36 pasos y tres épocas sobre OptiBench train400; el ajuste es muy acotado y puede degradar capacidades generales del modelo base fuera del dominio de optimización.
- El autor reporta que, en tareas OPT-Bench ML conjuntamente válidas, el modelo pierde en 11 de 14 métricas frente al base, lo que indica un rendimiento desigual según la tarea.
- Riesgo de alucinación en la formulación de problemas y en la invocación de herramientas; la evaluación se hizo con un entorno bloqueado y adaptadores específicos que no se publican como parte del repositorio.
- No se declaran idiomas soportados; el comportamiento multilingüe no está verificado.
- La licencia Apache-2.0 permite uso comercial, pero el autor remite a la licencia del modelo base incluida en el repositorio; conviene revisar las condiciones de Qwen3.5-9B.
- El repositorio tiene muy poca tracción (25 descargas, 0 likes) y no se han publicado resultados en benchmarks estándar; no se recomienda para producción sin una evaluación propia.
- No se publican pesos cuantizados; el despliegue en GPUs de menos de 24 GB requiere cuantización manual no validada por el autor.

## Enlaces

- HuggingFace: https://huggingface.co/C1oudX/AGRPO-Qwen3.5-9B-step36
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/c202236235762e1c871ad0ccb60c8ee5ba337b9a/LICENSE
- Resultados de evaluación por tarea: evaluation_results.json (en el repositorio del modelo)
- Metadatos de entrenamiento: training_metadata.json (en el repositorio del modelo)

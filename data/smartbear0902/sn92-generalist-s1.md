# smartbear0902/sn92-generalist-s1

## Resumen

sn92-generalist-s1 es un fine-tune del modelo decisionmodels/reax-1, publicado por el usuario smartbear0902 en Hugging Face. El modelo base reax-1 es un derivado de pplx-decider-v1.2 de Perplexity AI, que a su vez desciende de Qwen/Qwen3.8-27B. Este ajuste está orientado a la pista de modelos de decisión "generalist" de la subred 92 (REAX) de Bittensor, es decir, a tareas de respuesta estructurada con un código de respuesta corto en lugar de generación libre de texto.

Arquitectura y runtime son idénticos a los del modelo padre: el autor indica explícitamente que debe ejecutarse "exactamente como el padre", conservando la misma cabeza de lectura conjunta (joint readout head) y el mismo mecanismo de inferencia. El modelo cuenta con 26.085.330.160 parámetros en formato safetensors, con un repositorio de 52,2 GB, lo que sugiere pesos en precisión de 16 bits.

La relevancia de esta ficha es acotada: se trata de un fine-tune experimental de un participante en una competición de subred, no de un modelo generalista de propósito amplio. Su interés principal reside en la receta de fusión de checkpoints (model soup sobre deltas LoRA) y en la procedencia declarada de los datos, más que en capacidades nuevas respecto al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen/Qwen3.8-27B, con atención completa y atención lineal, y cabeza de lectura conjunta (joint readout head); etiqueta de librería qwen3_5 |
| Parametros totales | 26.085.330.160 (~26,1 mil millones) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors) |
| Idiomas soportados | no disponible (el modelo card no declara lista de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del padre reax-1: un transformer con capas de atención completa y capas de atención lineal, más una cabeza de lectura conjunta que produce un código de respuesta discreto. El fine-tune se aplica con LoRA de rango 16 y alpha 32 sobre las 496 matrices de proyección del modelo de lenguaje (q/k/v/o de atención completa, in_proj_qkv/z/a/b y out_proj de atención lineal, y gate/up/down del MLP), entrenando simultáneamente la cabeza de lectura. La función de pérdida combina entropía cruzada sobre el código de respuesta a temperatura de runtime T = 2 con un término KL de peso 0,5 hacia el padre sin modificar, con tasa de aprendizaje 1e-4 (1e-5 para la cabeza), una época y 32 filas de pregunta por paso.

El checkpoint publicado no es un entrenamiento único, sino una fusión ponderada ("model soup") de tres checkpoints: el run A (mezcla de datos A, 19.850 ítems, paso final tras 877 pasos) con peso 0,34; el run C (mezcla A más ítems extra de aritmética, código, reglas y registro, 23.654 ítems) en el paso 300 de 1.096 con peso 0,33; y el mismo run C en el paso 450 de 1.096 con peso 0,33. La fusión se realiza sumando los deltas LoRA y los deltas de la cabeza de lectura ponderados al modelo padre. Los datos de entrenamiento combinan ítems generados proceduralmente por el autor (problemas aritméticos, lógica multi-paso, causalidad sí/no, salida de código, acordes a partir de notas, decisiones de recuperación de herramientas y de llamada a API, reglas tarifarias y de política, bajo CC0) con datasets públicos: Aegis 2.0, MASSIVE, IBM ArgQ, MultiNLI, metadatos de arXiv, Standard Ebooks, openFDA, NVD, propuestas de mejora de Kubernetes y metadatos de paquetes Debian.

## Capacidades

- Respuesta a ítems de decisión con código de respuesta corto: el modelo está entrenado para emitir un código de respuesta evaluable por el runtime, no texto libre.
- Aritmética: problemas verbales aritméticos incluidos en la mezcla de datos del run C.
- Lógica multi-paso y razonamiento causal: ítems de lógica secuencial y preguntas causales de sí/no.
- Predicción de salida de código: ítems de "code output" en el conjunto de entrenamiento.
- Teoría musical básica: generación de acordes a partir de notas.
- Decisiones sobre herramientas: recuperación de herramientas, selección de siguiente API, decisión de cuándo llamar y decisión de llamada a herramienta.
- Aplicación de reglas: ítems de tarifas y políticas.
- Idiomas: no disponible; el modelo card no declara capacidades multilingües, aunque MASSIVE (dataset multilingüe) figura entre las fuentes de datos.
- Tool calling, agentes y modo thinking: no disponible; no se documentan en la información proporcionada.

## Casos de uso

- Evaluación en la subred 92 de Bittensor: el modelo está diseñado para ser evaluado contra el conjunto de desarrollo público eval-v5/devset-v1, por lo que su uso natural es la participación en el mecanismo de validación de REAX con el runtime del padre.
- Clasificación de intenciones de llamada a herramienta: los ítems de "when-to-call" y "tool-call decisions" permiten usar el modelo como clasificador de si un turno de conversación requiere invocar una herramienta y cuál.
- Enrutado de siguiente API en pipelines de agentes: dado un estado y un catálogo de herramientas, el modelo puede seleccionar la siguiente llamada como paso de un planificador, siempre que se respete el formato de código de respuesta del runtime.
- Resolución de problemas aritméticos verbales en flujos estructurados: útil en asistentes financieros o de facturación donde la respuesta debe ser un valor discreto verificable, no una explicación.
- Aplicación de reglas tarifarias y de política: clasificación de casos según tablas de tarifas o políticas, aprovechando los ítems de reglas de la mezcla de entrenamiento.
- Evaluación comparativa de recetas de fusión LoRA: el checkpoint sirve como referencia reproducible de una "model soup" de tres deltas con pesos declarados, útil para investigación sobre merging de adaptadores.
- Verificación de salida de código en tests automáticos: los ítems de "code output" permiten usar el modelo para predecir el resultado de fragmentos cortos como comprobación auxiliar, con las cautelas de alucinación habituales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 26,1 mil millones de parámetros en FP16/BF16, se requieren aproximadamente 52 GB solo para pesos, más overhead de activaciones y caché KV; en cuantización de 8 bits, en torno a 26-28 GB; en 4 bits, en torno a 14-16 GB. Estas cifras son estimaciones por tamaño, no datos publicados por el autor.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU para FP16 sin cuantizar; una RTX 4090 (24 GB) solo sería viable con cuantización de 4 bits y contexto corto.
- Cabe en GPU de consumo: únicamente con cuantización agresiva (4 bits) y en GPUs de 24 GB o más; no hay GGUF publicado en el repositorio, por lo que habría que generarlo.
- Opciones de despliegue: no disponible; el autor remite al runtime del modelo padre. No se documenta soporte de vLLM, llama.cpp, Ollama o TGI para este checkpoint.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| sn92-generalist-s1 | ~26,1 B | no disponible | Apache-2.0 | Fine-tune de decisión para SN92, fusión de 3 checkpoints LoRA |
| decisionmodels/reax-1 (padre) | no disponible en la informacion | no disponible | Apache-2.0 | Modelo base del fine-tune, mismo runtime y cabeza de lectura |
| Perplexity pplx-decider-v1.2 | no disponible en la informacion | no disponible | no disponible | Ancestro del linaje, orientado a decisión |
| Qwen/Qwen3.8-27B | ~27 B (por nombre) | no disponible en la informacion | no disponible | Modelo origen del linaje |

No se dispone de datos de rendimiento comparado para ninguno de los modelos de la tabla en la información proporcionada.

## Limitaciones y advertencias

- Modelo de decisión, no de generación libre: está entrenado para emitir códigos de respuesta evaluables por el runtime; su uso como chatbot general no está soportado ni documentado.
- Sesgos: no documentados por el autor; los datos públicos incluyen Aegis 2.0, MultiNLI y MASSIVE, cuyos sesgos pueden propagarse.
- Riesgo de alucinación: no cuantificado; en ítems de código, aritmética y reglas, una respuesta incorrecta es indistinguible de una correcta sin validación externa.
- Contexto e idiomas: la longitud de contexto no se declara y no hay lista de idiomas soportados, lo que impide garantizar comportamiento multilingüe en producción.
- Licencia: Apache-2.0 permite uso comercial, pero el linaje incluye pplx-decider-v1.2 y Qwen3.8-27B; deben revisarse NOTICE y MODIFICATIONS.md del repositorio padre para obligaciones adicionales.
- Procedencia de datos: el autor declara que no usó el conjunto de desarrollo público ni pools privados de SN92 para entrenar ni seleccionar checkpoints, y que no empleó salidas de otras entradas de la subred como objetivos; esta declaración es del autor y no está verificada de forma independiente.
- Advertencia de competición: un fine-tune dirigido a una subred puede sobreajustarse a la distribución de la evaluación; el propio autor señala que es esperable una ganancia mayor en ítems de estilo público que en sorteos privados.
- Madurez: 27 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni benchmarks publicados; no es un modelo validado para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/smartbear0902/sn92-generalist-s1
- Modelo base: https://huggingface.co/decisionmodels/reax-1
- Revisión del modelo base citada: ca2a0cc54a537c1f5cf24e5b09387cfb357b6518
- Qwen3.8-27B (origen del linaje): https://huggingface.co/Qwen/Qwen3.8-27B
- No se han encontrado en la búsqueda web papers, blogs, repositorios o demos adicionales asociados a este checkpoint.

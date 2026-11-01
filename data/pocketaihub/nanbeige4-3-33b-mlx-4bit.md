# PocketAiHub/Nanbeige4.3-33B-MLX-4bit

## Resumen

Nanbeige4.3-33B-MLX-4bit es una cuantización de 4 bits del modelo Nanbeige4.3-33B, desarrollado originalmente por el equipo Nanbeige y convertido de forma independiente por PocketAiHub para su uso con la librería MLX de Apple. Se trata de un modelo de generación de texto de tipo transformer denso con 33.118.977.024 parámetros, orientado a conversación, razonamiento y uso de herramientas (tool calling), con soporte nativo para inglés y chino.

El modelo original está publicado bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas. Esta versión cuantizada conserva la plantilla de chat, el tokenizador, los controles de razonamiento y la configuración de RoPE del modelo base, y emplea una receta de cuantización mixta protegida en la salida (4/6/8 bits según el módulo), lo que la hace especialmente relevante para ejecutar un modelo de 33B en hardware Apple Silicon con memoria unificada.

La relevancia de esta ficha radica en que permite a desarrolladores e investigadores evaluar rápidamente una alternativa de despliegue local de un modelo de gran tamaño en el ecosistema MLX, con evidencia de regresión medida frente a la referencia BF16 y con un tamaño de payload de 22,831 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia llama, según tags); detalles internos no disponibles |
| Parametros totales | 33.118.977.024 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 512K según la arquitectura upstream; validación local limitada a ~8K tokens |
| Tipos de cuantizacion | Mixta 4/6/8 bits: base 4-bit; embeddings, salidas de atención/MLP y capas de borde a 6-bit; cabeza de salida y proyecciones key/value a 8-bit; cuantización afín con group size 64 |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 4-bit cuantizado |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo original más allá de su naturaleza transformer y su etiquetado como familia llama. Se sabe que el modelo base soporta una longitud de contexto de hasta 512K tokens, y que esta conversión conserva la plantilla de chat, el tokenizador, los controles de razonamiento y los ajustes de RoPE del modelo original. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

La innovación técnica destacable de esta release no está en el modelo base sino en el proceso de cuantización: PocketAiHub aplica una receta mixta con protección de salidas, asignando mayor precisión (6 y 8 bits) a módulos sensibles como embeddings, proyecciones key/value, cabezas de salida y capas de borde, mientras mantiene el cuerpo en 4 bits. La conversión se realizó con MLX 0.32.2 y MLX-LM 0.31.3, y se documenta con manifiestos de reproducibilidad que incluyen hashes SHA-256, comando de conversión y linaje del modelo fuente (revisión `c1093c501cc6460427c0ac634db7223d0450c0ee`). No se aplicó fine-tuning, abliteration ni otra edición de comportamiento.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat compatible con el modelo original.
- Razonamiento con modo "thinking" habilitado por defecto, con controles de razonamiento conservados del modelo base.
- Soporte de tool calling mediante formato XML, con rutas de herramientas XML y JSON verificadas en la suite local (16 rutas).
- Uso en agentes multi-paso: la model card recomienda preservar el pensamiento previo en conversaciones multi-turno de agentes.
- Capacidades multilingües limitadas a inglés y chino.
- Generación de código (el ejemplo oficial es un decorador de reintentos en Python).
- Recuperación de información en contexto: la sonda local cubre aproximadamente 8K tokens de prompt.
- No se documentan capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Asistente conversacional local en macOS: el modelo puede ejecutarse con MLX en Apple Silicon con memoria unificada, gestionando conversaciones multi-turno gracias a la plantilla de chat conservada y al modo thinking por defecto.
- Agentes con tool calling: las 16 rutas XML/JSON verificadas en la suite local permiten integrar el modelo en flujos de agentes que invocan funciones externas, recomendándose temperatura 1.0 y top-p 0.95 para este escenario.
- Generación de código en entornos de desarrollo: el ejemplo oficial de decorador de reintentos en Python ilustra su uso para tareas de programación asistida dentro de pipelines locales.
- Procesamiento de documentación en inglés y chino: al soportar ambos idiomas, es adecuado para resumir o transformar documentación técnica bilingüe en entornos donde no se desea enviar datos a la nube.
- Prototipado e investigación en MLX: investigadores que necesiten comparar el comportamiento de un modelo de 33B cuantizado frente a la referencia BF16 pueden usar los manifiestos y la suite de evaluación incluidos para reproducir la regresión.
- Razonamiento con contexto largo moderado: aunque la arquitectura soporta 512K, la validación local se limita a ~8K tokens, por lo que es apto para tareas de recuperación en contexto de tamaño moderado con memoria KV adicional.
- Despliegue en estaciones de trabajo Apple: con un payload de 22,831 GB, cabe en equipos con 128 GiB de memoria unificada (hardware de referencia: Apple M5 Max), lo que facilita entornos de desarrollo sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card sí incluye una regresión local medida en Apple M5 Max con 128 GiB de memoria unificada, con decodificación greedy y thinking deshabilitado salvo en la sonda específica:

| Comprobacion | Esta cuantizacion | Referencia BF16 |
|---|---:|---:|
| Casos de regresión local superados | 89/100 | 88/100 |
| Salidas truncadas | 1 | 1 |

Además, se reporta una deriva de WikiText en datos held-out: KL medio de **0,075549** y acuerdo top-1 del **89,167%**, medido frente a MLX BF16 en ocho fragmentos de 512 tokens. La suite local cubre 80 casos de capacidad, 16 rutas de herramientas XML/JSON, dos casos en chino, una sonda de thinking y una sonda de recuperación de aproximadamente 8K tokens. El autor advierte que la regresión local se usó para seleccionar la receta, por lo que no constituye un benchmark independiente ni prueba de paridad de calidad general.

## Requisitos de hardware

- VRAM/memoria estimada: payload de 22,831 GB en decimal; la memoria en tiempo de ejecución es adicional (KV-cache y overhead del runtime).
- Hardware de referencia validado: Apple M5 Max con 128 GiB de memoria unificada.
- GPU dedicadas: no se documenta soporte ni validación en A100, H100 o RTX 4090; el formato MLX está orientado a Apple Silicon.
- Cabe en GPU de consumo: no aplica en el sentido habitual; requiere memoria unificada de Apple Silicon, no VRAM de GPU dedicada.
- Opciones de despliegue: MLX 0.32.2 y MLX-LM 0.31.3 (comando `mlx_lm.generate`); no se documentan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles.
- Contexto largo: requiere memoria KV adicional; la operación completa a 512K no fue validada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo base ni de alternativas comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A nivel cualitativo:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-MLX-4bit (este) | 33,1B | Hasta 512K (validado ~8K) | Apache 2.0 | safetensors MLX 4-bit | Cuantización mixta 4/6/8 bits, solo Apple Silicon |
| Nanbeige4.3-33B (base) | 33,1B | Hasta 512K | Apache 2.0 | safetensors BF16 | Referencia de calidad; mayor huella de memoria |
| Alternativas de 33B en MLX | No disponible | No disponible | No disponible | No disponible | Sin datos en la información proporcionada |

## Limitaciones y advertencias

- Limitación heredada del modelo base: en modo greedy sin thinking, la referencia BF16 entra en bucle con la instrucción corta de sílabas repetidas de la suite hasta alcanzar el límite de tokens; esta cuantización preserva ese comportamiento y no lo repara.
- La validación de contexto se limita a aproximadamente 8K tokens; no se verificó el funcionamiento a 512K y los contextos largos requieren memoria KV adicional.
- La regresión local no es un benchmark independiente: la receta se seleccionó usando esa misma suite, por lo que puede estar sesgada hacia ella.
- Idiomas limitados a inglés y chino; no se documenta soporte para castellano.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero esta conversión no es una release oficial de Nanbeige; PocketAiHub solo aporta conversión, validación y distribución.
- Requiere runtimes compatibles con las opciones de la plantilla de chat original; la sustitución por plantillas genéricas puede degradar el comportamiento.
- Para agentes multi-turno debe preservarse el pensamiento previo y usarse el formato XML de tool calling; el incumplimiento puede romper las rutas de herramientas.
- El autor recomienda usar el modo thinking por defecto y límites de generación adecuados en producción.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/PocketAiHub/Nanbeige4.3-33B-MLX-4bit
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Repositorio MLX: no disponible en la información proporcionada
- Repositorio MLX-LM: no disponible en la información proporcionada
- Paper del modelo: no disponible en la información proporcionada
- Blog o demo oficial: no disponible en la información proporcionada

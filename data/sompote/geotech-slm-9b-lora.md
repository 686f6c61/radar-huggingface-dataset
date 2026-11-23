# Sompote/GeoTech-SLM-9B-LoRA

## Resumen

GeoTech-SLM-9B-LoRA es un conjunto de adaptadores LoRA (PEFT) sobre el modelo base Qwen/Qwen3.5-9B, desarrollado por Sompote Youwai (KMUTT) y orientado a cálculos de diseño geotécnico. No se distribuye como modelo completo, sino como dos adaptadores complementarios (`sd-a30` y `grpo-60`) que deben aplicarse sobre los pesos del modelo base. El repositorio ocupa 0,3 GB, lo que confirma que solo contiene los pesos de los adaptadores y no el modelo completo.

El modelo aborda un problema concreto: obtener precisión de nivel "agente frontera" en cálculos de ingeniería geotécnica (capacidad portante, asentamientos, estabilidad de taludes, etc.) con inferencia local y bajo coste. Para ello combina un ajuste supervisado (SD) con un entrenamiento GRPO (Dr.GRPO) y una estrategia de decodificación por voto de 8 muestras en modo *thinking*, alcanzando 256/338 (75,7 %) en el conjunto de evaluación GeoTechBench v0.4.1.

Es relevante ahora porque demuestra una arquitectura híbrida: un SLM local de 9B parámetros con voto múltiple más un mecanismo de *fallback* a un agente frontera (Claude) que logra 334/338 a un coste de 0,480 USD, frente a 0,910 USD del agente frontera solo. El modelo se publica bajo licencia Apache 2.0 y está pensado explícitamente como herramienta de apoyo, no como sustituto del juicio de un ingeniero colegiado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5-9B) con adaptadores LoRA (PEFT) |
| Parametros totales | 9B (modelo base); tamano de los adaptadores no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens en la configuracion de inferencia recomendada (ventana nativa del modelo base no disponible) |
| Tipos de cuantizacion | no disponible (los adaptadores se sirven en bf16; cuantizacion del base no especificada) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un ajuste por adaptadores sobre Qwen3.5-9B, un transformer denso de 9.000 millones de parámetros. El entrenamiento se estructura en dos fases: primero un ajuste supervisado (`sd-a30`) que se fusiona con los pesos base mediante `merge_and_unload()`, y después un ajuste con GRPO (`grpo-60`) que debe aplicarse como LoRA en tiempo de ejecución. El autor advierte explícitamente que fusionar `grpo-60` en bf16 hace que se pierda la mayor parte de la actualización de GRPO, por lo que la receta de despliegue correcta es: fusionar `sd-a30` y montar `grpo-60` como adaptador dinámico (por ejemplo, con `--enable-lora --max-lora-rank 32` en vLLM).

La innovación técnica principal no está en la arquitectura, sino en la estrategia de inferencia: modo *thinking* con voto de 8 muestras (temperatura 0,8, top-p 0,95, top-k 20, 32.768 tokens de generación máxima) y agregación por mayoría. Esta configuración eleva la precisión de 208/338 (una sola respuesta con razonamiento) a 256/338 (75,7 %) en GeoTechBench v0.4.1. El trabajo se describe en el artículo *A local small language model with frontier-agent fallback for geotechnical design calculations* (Youwai, KMUTT, 2026), actualmente en revisión. No se especifican en la información disponible el volumen de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de texto y razonamiento en modo *thinking* (`enable_thinking=True`), orientado a cálculos de diseño geotécnico.
- Resolución de problemas de ingeniería civil y geotecnia: capacidad portante, asentamientos, estabilidad de taludes y cálculos de diseño afines.
- Razonamiento multi-paso con muestreo múltiple y agregación por voto de mayoría.
- Integración con un agente frontera como *fallback* (arquitectura híbrida descrita en el paper).
- Soporte de despliegue en vLLM con LoRA dinámico.
- Capacidades multilingües: limitadas al inglés según la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Cálculo de capacidad portante de cimentaciones: el modelo genera el desarrollo del cálculo en modo *thinking* y, con voto de 8, reduce el riesgo de errores aritméticos en fórmulas de Terzaghi, Meyerhof o Vesic.
- Verificación de asentamientos y consolidación: útil como segunda opinión automatizada sobre cálculos de consolidación primaria y secundaria antes de la revisión del ingeniero.
- Análisis de estabilidad de taludes: el modelo puede plantear métodos de equilibrio límite y comparar factores de seguridad, con la salvedad de que requiere validación humana.
- Asistente de documentación técnica: generación de memorias de cálculo y justificaciones de diseño a partir de parámetros de entrada, aprovechando el contexto de 32.768 tokens para informes extensos.
- Pipeline híbrido local + agente frontera: desplegar el SLM local para el 75,7 % de casos resueltos y derivar solo los casos de baja confianza a un agente frontera, reduciendo coste por consulta (0,480 USD frente a 0,910 USD en la evaluación del autor).
- Formación y docencia en ingeniería geotécnica: entorno local sin dependencia de API para practicar cálculos con retroalimentación automática.
- Preprocesado de consultas técnicas: clasificación y resolución de preguntas frecuentes de ingeniería civil antes de escalar a un ingeniero.

## Benchmarks y rendimiento

Resultados publicados por el autor en GeoTechBench v0.4.1 (holdout, N = 338):

| Sistema | Inferencia | Respuestas correctas |
|---|---|---:|
| Qwen3.5-9B base | greedy | 150 |
| Qwen3.5-9B base | una respuesta con *thinking* | 208 |
| Este modelo (SD + Dr.GRPO) | una respuesta con *thinking* | 208 |
| Este modelo (SD + Dr.GRPO) | voto de 8 | 256 (75,7 %) |
| DeepSeek-V4.1-Flash | API, razonamiento | 280 |
| Híbrido + fallback a Claude (validación cruzada) | voto local, si no Claude | 334/338 a 0,480 USD |
| Claude Opus 5.5 agente solo | agente + herramientas | 338/338 a 0,910 USD |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo base de 9B en bf16 requiere aproximadamente 18 GB de VRAM para los pesos, más overhead de contexto y KV cache; con cuantización de 8 bits bajaría a unos 9-10 GB y en 4 bits a unos 5-6 GB (estimaciones para el base, no confirmadas para esta configuración).
- GPU recomendadas: A100 40/80 GB o H100 para servir con vLLM y voto de 8 en paralelo; RTX 4090 (24 GB) es viable en bf16 para una sola secuencia.
- GPU de consumo: cabe en RTX 4090 en bf16; en GPUs de 16 GB requeriría cuantización del base (no documentada por el autor).
- Despliegue: transformers + PEFT (receta oficial de la model card) y vLLM con `--enable-lora --max-lora-rank 32` sobre el modelo `sd-a30` fusionado.
- Latencia y throughput: no disponibles. El voto de 8 con 32.768 tokens de generación máxima implica un coste computacional aproximadamente 8 veces superior a una sola respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GeoTechBench v0.4.1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GeoTech-SLM-9B-LoRA (voto de 8) | 9B | 32.768 tokens (inferencia) | 256/338 (75,7 %) | Apache 2.0 | Hugging Face (adaptadores) |
| Qwen3.5-9B base | 9B | no disponible | 208/338 (una respuesta *thinking*) | no disponible | Hugging Face |
| DeepSeek-V4.1-Flash | no disponible | no disponible | 280/338 | no disponible | API |
| Claude Opus 5.5 (agente) | no disponible | no disponible | 338/338 | propietaria | API |

La comparación se limita a los sistemas evaluados por el autor; no se dispone de datos de otros SLM especializados en geotecnia para contrastar.

## Limitaciones y advertencias

- El autor indica explícitamente que el modelo no sustituye las comprobaciones de un ingeniero colegiado; los resultados deben validarse siempre por un profesional.
- Solo soporta inglés; no hay evidencia de rendimiento en castellano.
- Riesgo de alucinación en fórmulas, coeficientes y normativa, especialmente en una sola pasada; el voto de 8 mitiga pero no elimina el problema.
- Fusionar `grpo-60` en bf16 degrada el modelo: debe aplicarse como LoRA en tiempo de ejecución.
- El conjunto de evaluación (GeoTechBench v0.4.1, N = 338) es propietario del autor y no está disponible públicamente, lo que limita la reproducibilidad.
- El paper está en revisión; los resultados no han pasado revisión por pares en la fecha de la información.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad legal por cálculos de ingeniería recae en el usuario.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/Sompote/GeoTech-SLM-9B-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Paper: *A local small language model with frontier-agent fallback for geotechnical design calculations* (Youwai, KMUTT, 2026), en revisión; sin enlace público disponible.

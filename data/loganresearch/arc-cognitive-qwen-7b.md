# LoganResearch/ARC-Cognitive-Qwen-7B

## Resumen

ARC-Cognitive-Qwen-7B es un adaptador de "mejora cognitiva" desarrollado por LoganResearch (Logan Matthew Napolitano) sobre el modelo base Qwen2.5-7B-Instruct. No se trata de un modelo nuevo ni de un fine-tuning convencional, sino de un conjunto de cinco sondas (probes) ligeras que monitorizan los estados ocultos del modelo durante la decodificación y aplican intervenciones sobre las probabilidades de los tokens para corregir modos de fallo cognitivo: razonamiento superficial, vaguedad, exceso de confianza, deriva temática e inconsistencia lógica.

El adaptador opera en tiempo de decodificación mediante proyección de fibras (fiber projection): extrae los estados ocultos de las capas 7, 14 y 21 en la posición del último token, los proyecta de 3584 a 16 dimensiones mediante proyecciones lineales por capa y combina el resultado con pesos aprendidos vía softmax. Cuando una sonda detecta un patrón problemático, el sistema ajusta las probabilidades de los tokens para orientar la generación hacia comportamientos más deseables.

Es relevante como pieza de investigación en interpretabilidad y control conductual de modelos de lenguaje, no como solución de producción. El repositorio tiene un tamaño de 0,0 GB (el adaptador se distribuye como fichero `cognitive_adapter.pt` separado del modelo base), cuenta con 9 descargas y 0 likes, y se publicó en febrero de 2026 con actualización en noviembre de 2026. La licencia es CC-BY-4.0 y el idioma declarado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) + adaptador de sondas de estado oculto con intervención en decodificación |
| Parametros totales | 7B (modelo base Qwen2.5-7B-Instruct); el adaptador añade proyecciones lineales ligeras (3584→16 por capa) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | 4-bit mediante BitsAndBytes (mencionado en el ejemplo de uso); no se detallan otras opciones |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-4.0 |
| Formato de pesos | adaptador en `cognitive_adapter.pt` (PyTorch); modelo base en safetensors vía transformers |

## Arquitectura y entrenamiento

El sistema se compone de dos piezas: el modelo base Qwen2.5-7B-Instruct, un transformer decoder-only de 7B parámetros, y un adaptador externo que no modifica los pesos del modelo. El adaptador extrae los estados ocultos de las capas 7, 14 y 21 en la posición del último token, obteniendo vectores de 3584 dimensiones. Cada capa se proyecta linealmente a 16 dimensiones mediante una proyección de fibras, y las tres representaciones se combinan con pesos aprendidos por capa normalizados con softmax, produciendo un embedding conductual de 16 dimensiones.

Sobre ese embedding operan cinco sondas especializadas: profundidad (depth), especificidad (specificity), calibración (calibration), foco (focus) y coherencia (coherence). Cuando una sonda se activa, el mecanismo de intervención ajusta las probabilidades de los tokens en tiempo de decodificación para corregir el comportamiento detectado. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; el adaptador se presenta como investigación sobre control conductual, no como un fine-tuning de dominio.

## Capacidades

- Generación de texto condicionada por control conductual en tiempo de decodificación.
- Detección y corrección de cinco modos de fallo: razonamiento superficial, vaguedad, exceso de confianza, deriva temática e inconsistencia lógica.
- Monitorización de estados ocultos internos (capas 7, 14 y 21) con proyección a un espacio conductual de 16 dimensiones.
- Intervención sobre probabilidades de tokens durante la generación (decode-time intervention).
- Compatible con endpoints (tag `endpoints_compatible`) y con la librería transformers.
- Capacidades heredadas del modelo base Qwen2.5-7B-Instruct (generación, instrucciones), aunque el adaptador no las amplía ni las certifica.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking específicas del adaptador.

## Casos de uso

- Investigación en interpretabilidad: analizar cómo se representan internamente los modos de fallo cognitivo extrayendo estados ocultos de las capas 7, 14 y 21 y examinando la separación de las sondas.
- Estudio de control conductual en decodificación: experimentar con intervenciones sobre probabilidades de tokens para medir el efecto en la calidad de las respuestas sin reentrenar el modelo base.
- Generación de respuestas estructuradas y calibradas: en aplicaciones donde se requiere evitar exceso de confianza o vaguedad, las sondas de calibración y especificidad pueden orientar la salida.
- Base para experimentación con decode-time intervention: punto de partida para investigadores que quieran añadir nuevas sondas o modificar los pesos de las capas.
- Evaluación comparativa de probes: usar las cinco sondas como referencia para comparar técnicas de probing sobre estados ocultos en modelos Qwen2.
- Prototipado de pipelines de moderación conductual: detectar deriva temática o inconsistencia lógica en respuestas generadas antes de su publicación, siempre con evaluación exhaustiva previa.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados, `verified: false`). Las métricas son ratios de separación de sondas (separation-ratio), no benchmarks estándar de NLP:

| Metrica | Valor | Verificado |
|---|---|---|
| Depth Probe Separation | 366 | No |
| Specificity Probe Separation | 215 | No |
| Calibration Probe Separation | 165 | No |
| Focus Probe Separation | 227 | No |
| Coherence Probe Separation | 191 | No |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo base de 7B requiere aproximadamente 14-16 GB en FP16 y unos 4-6 GB en cuantización 4-bit (BitsAndBytes), según el ejemplo de la model card. El adaptador añade un coste mínimo (proyecciones 3584→16 por capa).
- GPU recomendadas: A100, H100 o RTX 4090 para FP16; GPUs consumer con 8 GB o más para 4-bit.
- Cabe en GPU consumer: sí, con cuantización 4-bit en tarjetas de 8 GB o superiores; en FP16 requiere 16 GB o más.
- Opciones de despliegue: transformers con accelerate y bitsandbytes (método documentado); no se mencionan vLLM, llama.cpp, Ollama ni TGI, y la dependencia de `output_hidden_states=True` y de intervención en decodificación dificulta su uso en servidores de inferencia estándar.
- Latencia y throughput: no disponibles en la información proporcionada; la extracción de estados ocultos y la intervención por token añaden sobrecarga respecto a la inferencia del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ARC-Cognitive-Qwen-7B | 7B (base) + adaptador | no disponible | Control conductual en decodificación mediante sondas | CC-BY-4.0 | Hugging Face (9 descargas) |
| Qwen2.5-7B-Instruct | 7B | no disponible en esta ficha | Modelo instructivo generalista | no disponible en esta ficha | Hugging Face (modelo base) |
| Adaptadores de interpretabilidad tipo probing | variable | no disponible | Análisis de estados ocultos sin intervención | variable | no disponible |

No se dispone de datos de benchmarks estándar para comparar el rendimiento de este adaptador con alternativas de la misma categoría; la comparación se limita al enfoque técnico y a la licencia.

## Limitaciones y advertencias

- El autor indica explícitamente que no está pensado para despliegue en producción sin una evaluación exhaustiva.
- No apto para aplicaciones críticas de seguridad.
- No sustituye a un fine-tuning adecuado cuando se requiere adaptación de dominio.
- No usar si se prefiere el comportamiento por defecto del modelo base.
- Idiomas: solo inglés declarado; el comportamiento en castellano no está evaluado.
- Riesgo de alucinación: inherente al modelo base; el adaptador no lo elimina, solo modula la calibración.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Métricas de benchmarks no verificadas (`verified: false`) y basadas en ratios de separación de sondas, no en evaluaciones estándar de calidad.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero el adaptador se distribuye como investigación y su robustez en producción no está demostrada.
- Dependencia de `output_hidden_states=True` y de modificar la decodificación, lo que complica la integración con stacks de inferencia optimizados.

## Enlaces

- Hugging Face: https://huggingface.co/LoganResearch/ARC-Cognitive-Qwen-7B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Repositorio del adaptador (clonado desde Hugging Face): https://huggingface.co/LoganResearch/qwen2.5-7b-cognitive-enhanced
- No se han encontrado en la información disponible papers, blogs, repositorios adicionales ni demos.

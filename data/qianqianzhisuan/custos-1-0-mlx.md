# qianqianzhisuan/custos-1.0-mlx

## Resumen

Custos 1.0 (MLX) es un ajuste fino de dominio vertical en ciberseguridad sobre el modelo base Qwen3.5-9B, publicado por el usuario qianqianzhisuan en Hugging Face. El modelo está orientado a escenarios de operaciones de seguridad en entornos gubernamentales y empresariales, cubriendo tareas de análisis de amenazas, trazabilidad de ataques, análisis de vulnerabilidades, auditoría de cumplimiento y asistencia en respuesta a incidentes. La versión interna de entrenamiento se identifica como Custos-nesc-v1.2.5.

Este repositorio concreto contiene los pesos en formato MLX de 16 bits, pensados para su carga con la librería `mlx_lm` en equipos macOS con Apple Silicon. Para despliegues con vLLM o Transformers en BF16, el autor remite a repositorios separados en Hugging Face y ModelScope. La licencia es Apache-2.0, heredada del modelo base.

El modelo se publica sin métricas de benchmarks, sin detalle sobre el dataset de ajuste fino y sin documentación sobre el proceso de entrenamiento (número de tokens, composición de datos, uso de RLHF/DPO). Su relevancia radica en ser un ejemplo de especialización vertical de un modelo de 9B parámetros para ciberseguridad, con soporte nativo para el stack de Apple Silicon.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B); detalles específicos no disponibles |
| Parámetros totales | 9B (según el nombre del modelo base Qwen3.5-9B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 16 bits (MLX safetensors); otras cuantizaciones no disponibles en este repositorio |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX safetensors (16 bits) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen3.5-9B, un transformer decoder-only de 9.000 millones de parámetros. El autor no publica detalles sobre la arquitectura interna del modelo base (número de capas, dimensión oculta, mecanismo de atención, uso de atención lineal o decodificación especulativa). Tampoco se especifica si el ajuste fino incluyó técnicas como RLHF, DPO o SFT supervisado, ni se documenta el volumen o composición del dataset de entrenamiento en ciberseguridad.

La única información técnica disponible sobre el proceso es la identificación de la versión interna de entrenamiento (Custos-nesc-v1.2.5) y la orientación declarada hacia operaciones de seguridad. El repositorio distribuido es una conversión a MLX de 16 bits del ajuste, sin que se detallen los pasos de conversión ni las herramientas empleadas.

## Capacidades

- Generación de texto en chino e inglés.
- Asistencia en análisis de logs y alertas de seguridad.
- Trazabilidad de cadenas de ataque y correlación de indicadores de amenaza.
- Interpretación de vulnerabilidades y análisis de riesgo asociado.
- Autoevaluación de cumplimiento normativo y redacción de materiales de auditoría.
- Recomendaciones de respuesta ante incidentes y elaboración de informes post-incidente.
- Soporte de tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades multimodales (visión, audio): no disponibles.
- Modo de razonamiento explícito (thinking mode): no disponible (no se documenta).

## Casos de uso

- Triaje de alertas SIEM: el modelo puede recibir lotes de alertas en texto y generar una clasificación preliminar de severidad junto con una justificación, reduciendo la carga de analistas de nivel 1 en centros de operaciones de seguridad.
- Análisis de logs y correlación de eventos: dado un conjunto de entradas de log, el modelo puede resumir patrones anómalos y proponer hipótesis de compromiso, aprovechando su ajuste específico en lenguaje técnico de seguridad.
- Redacción de informes de incidentes: a partir de notas y evidencias, el modelo genera borradores estructurados de post-mortem y lecciones aprendidas, en chino o inglés, adaptados a formatos de auditoría.
- Interpretación de CVEs y boletines de vulnerabilidad: el modelo puede explicar el impacto de una vulnerabilidad concreta, estimar el riesgo en función del contexto de exposición y sugerir mitigaciones, útil para equipos de gestión de parches.
- Preparación de materiales de cumplimiento: apoyo en la redacción de políticas, cuestionarios de auditoría y evidencias documentales para marcos normativos, con el modelo actuando como asistente de redacción técnica.
- Asistencia en respuesta a incidentes: el modelo puede generar guías de contención y erradicación paso a paso basadas en la descripción del incidente, sirviendo como apoyo a procedimientos ya definidos por el equipo.
- Formación y simulación: generación de escenarios de ataque y preguntas de evaluación para entrenamiento de analistas, en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: aproximadamente 18-20 GB para los pesos, más overhead de contexto y caché KV.
- El formato MLX está diseñado para Apple Silicon; requiere un Mac con chip M-series.
- Memoria unificada recomendada: 32 GB o superior para 16 bits con contexto moderado; 24 GB puede ser insuficiente según la longitud de contexto.
- GPU NVIDIA: este repositorio no es compatible directamente; para CUDA se debe usar el repositorio BF16 del autor con vLLM o Transformers.
- Despliegue en Apple Silicon: `mlx_lm.server` o `mlx_lm.generate` según la documentación del autor.
- Despliegue en CUDA: vLLM o Transformers con los pesos BF16 del repositorio alternativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Formato |
|---|---|---|---|---|---|
| Custos 1.0 (MLX) | 9B | no disponible | Ciberseguridad | Apache-2.0 | MLX safetensors 16-bit |
| Qwen3.5-9B (base) | 9B | no disponible | Generalista | Apache-2.0 | safetensors, GGUF (según distribución) |
| Alternativas de ciberseguridad de 7-9B | no disponible | no disponible | Ciberseguridad | no disponible | no disponible |

No se dispone de información sobre modelos comparables de ciberseguridad del mismo tamaño con benchmarks publicados en la documentación proporcionada.

## Limitaciones y advertencias

- No se han publicado evaluaciones cuantitativas: no hay benchmarks que respalden las capacidades declaradas en el dominio de ciberseguridad.
- El autor indica explícitamente que el modelo es de asistencia y no sustituye escaneos reales, acciones de respuesta ni conclusiones de cumplimiento.
- Riesgo de alucinación inherente a los modelos de lenguaje: en un dominio crítico como ciberseguridad, las recomendaciones generadas deben validarse por personal cualificado.
- Idiomas limitados a chino e inglés; el rendimiento en castellano no está documentado.
- Longitud de contexto no especificada, lo que dificulta planificar su uso con logs extensos o documentación larga.
- Sin información sobre sesgos conocidos ni sobre el proceso de alineación del ajuste fino.
- El repositorio MLX solo es utilizable en Apple Silicon; para producción en servidores con GPU se requiere el repositorio alternativo.
- Licencia Apache-2.0 permite uso comercial, pero el autor no declara políticas de versión comercial ni certificaciones; el despliegue en producción debe evaluarse de forma independiente.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Hugging Face (MLX): https://huggingface.co/qianqianzhisuan/custos-1.0-mlx
- Hugging Face (BF16, vLLM/Transformers): https://huggingface.co/qianqianzhisuan/custos-1.0
- ModelScope: https://modelscope.cn/models/qianqianzhisuan123/custos-1.0
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B

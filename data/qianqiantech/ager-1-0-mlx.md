# QianqianTech/ager-1.0-mlx

## Resumen

ager 1.0 (nombre en chino: 安耕, "Guardián de la agricultura") es un modelo de lenguaje de dominio específico desarrollado por QianqianTech y orientado a escenarios de producción agrícola: cultivo de plantas, protección fitosanitaria, gestión de agua y fertilizantes, y análisis agronómico. Está construido como un ajuste fino (finetune) del modelo base Qwen/Qwen3.5-9B, con aproximadamente 8.950 millones de parámetros en formato safetensors.

Este repositorio concreto (`ager-1.0-mlx`) contiene los pesos en bfloat16 para inferencia local en chips de Apple mediante la librería MLX, sin cuantización. La versión equivalente para vLLM y Transformers se publica en el mismo espacio de nombres bajo el identificador `ager-1.0`. El modelo declara soporte para chino e inglés y se distribuye bajo licencia Apache 2.0.

Su relevancia radica en la especialización vertical: parte de un modelo generalista de 9B y lo adapta a un nicho técnico con vocabulario y razonamiento agronómico, manteniendo un tamaño que permite despliegue en hardware de gama alta de consumo o estaciones de trabajo con Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-9B; familia `qwen3_5`) |
| Parametros totales | 8.953.801.728 (~8,95B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (este repo se publica en bfloat16 sin cuantizar) |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX, bfloat16) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer decoder-only de Qwen3.5-9B. No se especifica en la información disponible si el modelo base emplea atención lineal, decodificación especulativa u otras innovaciones, ni detalles sobre número de capas, dimensión oculta o cabezas de atención. Tampoco se documenta la longitud de contexto nativa del base.

En cuanto al entrenamiento, la model card únicamente indica que se trata de un finetune del Qwen3.5-9B orientado a agricultura. No se detalla el volumen de tokens de ajuste, la composición del dataset agronómico, ni si se aplicaron técnicas de RLHF, DPO o SFT supervisado. No hay información sobre procesos de alineación ni sobre evaluación de seguridad.

## Capacidades

- Generación de texto conversacional en chino e inglés, con orientación a dominios agrícolas.
- Razonamiento técnico sobre cultivo, fitopatología, riego y fertilización (según la descripción del autor).
- Asistencia en "农事研判" (análisis y recomendaciones de labores agrícolas).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponible.
- Modo "thinking" explícito: no disponible.

## Casos de uso

- Asistencia agronómica conversacional: un agricultor o técnico puede plantear consultas multi-turno sobre diagnóstico de plagas o planificación de cultivos; el modelo responde en chino o inglés con vocabulario especializado.
- Recomendación de manejo hídrico y fertilización: dado un cultivo y una fase fenológica, el modelo puede sugerir pautas de riego y dosificación de nutrientes, sirviendo como borrador que el técnico valida.
- Soporte a técnicos de campo: integración en una aplicación móvil o chatbot para consultas rápidas sobre fitosanitarios, dosis y calendarios de tratamiento.
- Formación y divulgación agrícola: generación de material explicativo y respuestas a preguntas frecuentes para escuelas agrarias o cooperativas.
- Preprocesado y resumen de documentación técnica: resumir fichas de producto, boletines fitosanitarios o informes de campo en chino o inglés.
- Despliegue local en estaciones Apple Silicon: al publicarse en MLX bfloat16, permite prototipado y demos en Mac con chip Apple sin depender de infraestructura cloud, útil para pruebas de concepto en explotaciones o cooperativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 18 GB solo para pesos (8,95B × 2 bytes), más overhead de KV cache y activaciones; el repositorio ocupa 17,9 GB.
- En cuantización de 8 bits: ~9 GB de pesos; en 4 bits: ~4,5-5 GB (estimación teórica, no confirmada por el autor para este repo).
- GPU recomendadas para bfloat16: A100 40/80 GB, H100, L40S; en consumer, RTX 4090 (24 GB) resulta justa y puede requerir cuantización u offloading.
- Apple Silicon: es el objetivo de este repositorio; se requiere memoria unificada suficiente (orientativamente 24 GB o más para bfloat16 sin cuantizar).
- Opciones de despliegue: `mlx-lm` para Apple Silicon; vLLM y Transformers mediante el repositorio `ager-1.0`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| ager-1.0-mlx | ~8,95B | no disponible | Apache 2.0 | safetensors MLX bfloat16 | Finetune agrícola de Qwen3.5-9B, solo zh/en |
| Qwen/Qwen3.5-9B | ~9B | no disponible | no disponible en la información | safetensors, múltiples runtimes | Modelo base generalista; mayor cobertura de dominios, menor especialización agrícola |
| Modelos agrícolas open source de ~7-9B | variable | variable | variable | variable | No se dispone de comparativas verificadas en la información proporcionada |

## Limitaciones y advertencias

- Dominio restringido: el ajuste está orientado a agricultura; su rendimiento en tareas generales puede degradarse respecto al modelo base.
- Idiomas limitados a chino e inglés; no se declara soporte de castellano.
- Riesgo de alucinación en recomendaciones agronómicas (dosis de fitosanitarios, plazos de seguridad, diagnosis de plagas); requiere validación por un técnico cualificado antes de uso real.
- No se documentan sesgos conocidos, evaluación de seguridad ni datos de entrenamiento.
- No se especifica la longitud de contexto, lo que dificulta planificar casos de uso con documentos largos.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3.5-9B conviene verificar las condiciones del modelo base.
- Este repositorio es específico para MLX; no es directamente utilizable en vLLM o TGI sin recurrir al repositorio `ager-1.0`.
- Modelo con muy poca tracción (22 descargas, 0 likes) y publicado recientemente; sin validación comunitaria.

## Enlaces

- Hugging Face (MLX): https://huggingface.co/QianqianTech/ager-1.0-mlx
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio vLLM / Transformers del mismo autor: `QianqianTech/ager-1.0` (referenciado en la model card; no se proporciona URL directa en la información disponible)

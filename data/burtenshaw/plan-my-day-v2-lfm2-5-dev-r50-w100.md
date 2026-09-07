# burtenshaw/plan-my-day-v2-lfm2.5-dev-r50-w100

## Resumen

Este modelo es un adaptador de investigación (PEFT) sobre LiquidAI/LFM2.5-1.2B-Instruct, desarrollado por burtenshaw. Está diseñado para una tarea muy concreta: planificación de días sintética con cuatro opciones. No es un agente de calendario general ni un modelo de propósito general. El adaptador se entrenó con SDPO (Sequence-wise Direct Preference Optimization) y técnicas de continual learning, incluyendo replay y destilación. El repositorio ocupa 0.1 GB, lo que indica que contiene únicamente los pesos del adaptador, no el modelo base completo. El modelo base pertenece a la familia LFM2 de Liquid AI, orientada a ofrecer una experiencia de IA generativa rápida en dispositivos locales. Este adaptador es relevante como ejemplo de investigación en alineación y adaptación eficiente de modelos pequeños.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2.5 (Liquid Foundation Model) con adaptador PEFT sobre LiquidAI/LFM2.5-1.2B-Instruct |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | lfm-open-license-1.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT (método no especificado) que se aplica sobre el modelo base LiquidAI/LFM2.5-1.2B-Instruct. El entrenamiento se realizó con SDPO, con una semilla de 17, 192 pasos, una tasa de aprendizaje de 3e-05, fracción de replay de 0.5 y peso de destilación de 1.0. El warm start proviene de un modelo SFT previo (burtenshaw/plan-my-day-lfm2.5-sft-seed17). El dataset de entrenamiento es sintético y se centra en planificación de días con cuatro opciones. La combinación de replay y destilación indica un enfoque de continual learning para evitar el olvido catastrófico. No se especifican más detalles sobre la composición del dataset ni sobre el número total de tokens.

## Capacidades

- Generación de texto limitada a la tarea de planificación de días sintética de cuatro opciones.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-step ni agentes.
- No tiene capacidades multilingües (no se especifican idiomas).
- No tiene capacidades de visión ni audio.
- Es un adaptador de investigación, no un modelo de propósito general.

## Casos de uso

- Investigación en alineación: sirve para estudiar el efecto de SDPO en modelos pequeños.
- Evaluación de continual learning: permite comparar estrategias de replay y destilación.
- Benchmarking de adaptadores: útil para medir el rendimiento de adaptadores PEFT sobre LFM2.5.
- Experimentos de planificación sintética: se puede usar para generar planes de día a partir de cuatro opciones predefinidas.
- Comparación con warm start: permite analizar la mejora del adaptador sobre el modelo SFT previo.
- Docencia en adaptación de modelos: ejemplo didáctico de cómo se entrena un adaptador con PEFT y SDPO.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Existe un dataset de resultados enlazado, pero no se proporcionan números concretos.

## Requisitos de hardware

- VRAM estimada: no disponible.
- GPU recomendadas: no disponible.
- Tamaño del adaptador: 0.1 GB (el modelo base completo no se incluye en el repo).
- Opciones de despliegue: no disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un agente de calendario general; solo maneja planificación sintética de cuatro opciones.
- No contiene datos personales, pero tampoco es útil para datos reales.
- No hay benchmarks publicados, por lo que se desconoce su calidad relativa.
- La licencia lfm-open-license-1.0 puede imponer restricciones de uso comercial; hay que revisarla.
- Al ser un adaptador de investigación, no está preparado para producción.
- Posibles sesgos heredados del modelo base LFM2.5.

## Enlaces

- HuggingFace: https://huggingface.co/burtenshaw/plan-my-day-v2-lfm2.5-dev-r50-w100
- Dataset fuente: https://huggingface.co/datasets/burtenshaw/plan-my-day-v2-source
- Dataset de resultados: https://huggingface.co/datasets/burtenshaw/plan-my-day-v2-results
- Blog de Liquid AI sobre LFM2: https://www.liquid.ai/blog/liquid-foundation-models-v2-our-second-series-of-generative-ai-models

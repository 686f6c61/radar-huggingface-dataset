# Atmyre/qwen3-8b-ao-strict-wave-c0p50

## Resumen

El modelo `Atmyre/qwen3-8b-ao-strict-wave-c0p50` es un adaptador LoRA (PEFT) sobre el modelo base Qwen/Qwen3-8B, desarrollado por Atmyre como parte de una colección centrada en interpretabilidad mediante *Activation Oracles* (AO). Este adaptador implementa un AO específico para el concepto `strict-wave` con una concentración de 0.50, entrenado para explicar las activaciones internas de un modelo sujeto que oculta deliberadamente una palabra secreta (variante *strict*). La técnica AO, descrita en el artículo de Karvonen et al. (2025, arXiv:2512.15674), entrena un modelo para predecir las activaciones de otro modelo, permitiendo inspeccionar qué conceptos se representan internamente.

El adaptador se publica con licencia MIT, pesa 0.7 GB y se carga mediante la librería `peft` sobre el modelo base. No es un modelo generativo de propósito general, sino una herramienta de investigación para analizar la representación interna de conceptos en LLMs. Su relevancia radica en que ofrece un método concreto para auditar y comprender el comportamiento de modelos grandes, un área crítica para la alineación y la seguridad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3-8B (transformer decoder-only) |
| Parametros totales | No disponible (adaptador LoRA; modelo base 8B) |
| Parametros activos | No disponible (modelo denso, no MoE) |
| Longitud de contexto | No disponible (hereda del modelo base, Qwen3-8B) |
| Tipos de cuantizacion | No disponible (carga en bfloat16 según ejemplo) |
| Idiomas soportados | No disponible (depende del modelo base) |
| Licencia | MIT |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica *Activation Oracle* (AO), que entrena un modelo para predecir las activaciones internas de otro modelo (el "sujeto"). En este caso, el sujeto es `Atmyre/qwen3-8b-taboo-strict-wave-c0p50`, un modelo de la misma colección que ha sido ajustado para ocultar una palabra secreta en su salida. El AO se entrena para que su modelo padre (Qwen3-8B) coincida con el sujeto ajustado, de modo que las explicaciones generadas sean fieles a las activaciones reales del sujeto. El concepto `strict-wave` y la concentración 0.50 indican que el AO está especializado en un patrón de activación concreto, probablemente relacionado con la supresión de información. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens ni el uso de RLHF/DPO; la información disponible solo menciona el procedimiento AO y la referencia al paper.

## Capacidades

- Explicación de activaciones: dado un texto de entrada, predice las activaciones internas del modelo base, permitiendo identificar qué conceptos se representan y cómo se distribuyen.
- Interpretabilidad dirigida: el concepto `strict-wave` sugiere que el AO está calibrado para detectar patrones de activación asociados a la ocultación de información (variante *strict*).
- Compatibilidad con el ecosistema PEFT: se integra con `transformers` y `peft`, facilitando su uso en pipelines de análisis.
- No es un modelo generativo estándar: su salida son explicaciones de activaciones, no texto natural.
- No se reporta soporte para tool calling, agentes, visión o audio.

## Casos de uso

- Investigación en interpretabilidad: analizar qué neuronas o capas se activan ante conceptos específicos, ayudando a mapear la representación interna de Qwen3-8B.
- Auditoría de sesgos: examinar activaciones para detectar patrones discriminatorios o asociaciones no deseadas en el modelo base.
- Análisis de seguridad: estudiar cómo el modelo oculta información (como en el caso *strict-wave*) para entender mecanismos de evasión o censura.
- Depuración de modelos: identificar fallos en el razonamiento al correlacionar activaciones con errores de salida.
- Educación en IA: demostrar de forma práctica cómo funcionan los LLMs internamente, usando AO como herramienta didáctica.
- Desarrollo de métodos de alineación: evaluar si los ajustes finos (como el sujeto *taboo*) producen cambios interpretables en las activaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K para este adaptador, ni comparaciones con otros modelos.

## Requisitos de hardware

- El adaptador LoRA es ligero (0.7 GB), pero requiere cargar el modelo base Qwen3-8B (8B parámetros) en memoria.
- En bfloat16, el modelo base ocupa aproximadamente 16 GB de VRAM; sumando el adaptador, se recomienda al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10G).
- Con cuantización del modelo base (por ejemplo, 4-bit o 8-bit), podría ejecutarse en GPUs con 12-16 GB, aunque no se especifican cuantizaciones compatibles para el adaptador.
- Opciones de despliegue: `transformers` con `peft` (como en el ejemplo de carga), `vLLM` (si se integra el adaptador), o `llama.cpp` (requiere conversión a GGUF, no documentada).
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre otros adaptadores AO comparables en la misma colección o en la literatura. El modelo base Qwen3-8B es un LLM denso de 8B parámetros con contexto de 32K (según especificaciones públicas de Qwen), pero no se han publicado comparativas de rendimiento para este adaptador específico. Se recomienda consultar el paper de Activation Oracles para referencias a otros AO.

## Limitaciones y advertencias

- Es un modelo de investigación, no diseñado para uso en producción ni para tareas generativas estándar.
- Depende del modelo base Qwen3-8B; cualquier limitación de este (sesgos, alucinaciones, idiomas) se hereda.
- El concepto `strict-wave` y la concentración 0.50 son específicos; el adaptador puede no generalizar a otros conceptos o configuraciones.
- No se han evaluado sesgos, riesgos de alucinación ni robustez en escenarios adversarios.
- La licencia MIT permite uso comercial, pero el modelo base Qwen3-8B tiene su propia licencia (Apache 2.0, según documentación oficial de Qwen), que debe respetarse.
- No se proporcionan garantías sobre la precisión de las explicaciones de activaciones; se recomienda validar los resultados con métodos complementarios.

## Enlaces

- [HuggingFace del adaptador](https://huggingface.co/Atmyre/qwen3-8b-ao-strict-wave-c0p50)
- [Paper Activation Oracles (arXiv:2512.15674)](https://arxiv.org/abs/2512.15674)
- [Modelo base Qwen/Qwen3-8B](https://huggingface.co/Qwen/Qwen3-8B)
- [Modelo sujeto Atmyre/qwen3-8b-taboo-strict-wave-c0p50](https://huggingface.co/Atmyre/qwen3-8b-taboo-strict-wave-c0p50)

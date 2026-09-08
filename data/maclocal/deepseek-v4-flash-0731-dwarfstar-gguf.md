# maclocal/DeepSeek-V4-Flash-0731-DwarfStar-GGUF

## Resumen

El repositorio maclocal/DeepSeek-V4-Flash-0731-DwarfStar-GGUF contiene una conversión cuantizada del modelo DeepSeek-V4-Flash de DeepSeek al formato GGUF. La conversión y la cuantización fueron realizadas por Antirez para el motor de inferencia DwarfStar, y maclocal las empaqueta como un artefacto de despliegue para su plataforma AFM (Apple Foundation Models). El objetivo principal es permitir la ejecución de un modelo de este tamaño en sistemas Apple Silicon con memoria unificada, aprovechando la cuantización mixta (MXFP4 para expertos y Q8 para ciertas capas).

La arquitectura subyacente, según el nombre de los archivos, es una Mixture of Experts (MoE), con un total de 284.334.567.511 parámetros. La longitud de contexto no está documentada en la información disponible. Este repositorio es un artefacto experimental para una versión futura de AFM y no está pensado como una versión generalista de GGUF.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) (inferida del nombre del archivo; el número de expertos no está documentado) |
| Parámetros totales | 284.334.567.511 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Cuantización mixta: expertos en MXFP4, hidden states y compressor/indexer en F16, attention/shared/out en Q8 |
| Idiomas soportados | Inglés (según metadata del repositorio) |
| Licencia | MIT (los derechos de autor del modelo base permanecen en DeepSeek) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es DeepSeek-V4-Flash, desarrollado por DeepSeek. Según la nomenclatura del archivo principal (MXFP4Experts), se trata de una arquitectura Mixture of Experts, aunque la información proporcionada no detalla el número de expertos ni los parámetros activos. La conversión a GGUF fue creada por Antirez e incluye una cuantización heterogénea: los pesos de los expertos se almacenan en MXFP4, mientras que los hidden states, el compressor y el indexer se mantienen en F16, y las capas de atención, shared y out se cuantizan a Q8. El repositorio incluye además un modelo compañero opcional DSpark, de 6 GB, diseñado para decodificación especulativa. No se dispone de información sobre los datos de entrenamiento, el número de tokens o la aplicación de técnicas como RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés; el tag "conversational" indica que está pensado para chats.
- Soporte de decodificación especulativa mediante el modelo compañero DSpark (activable con `--dspark-support`).
- Ejecución optimizada para Apple Silicon gracias a la integración con Metal y el runtime DwarfStar.
- Compatibilidad con la plataforma AFM (Apple Foundation Models) para su despliegue local.
- No se documentan capacidades de tool calling (function calling), agentes, visión o audio en la información disponible.

## Casos de uso

- Asistente conversacional local en macOS: se usaría a través de AFM en un Mac con Apple Silicon, permitiendo chat continuo sin conexión y sin enviar datos a la nube. Es adecuado porque el modelo está optimizado para Metal y memoria unificada.
- Investigación en decodificación especulativa: el compañero DSpark permite experimentar con técnicas de aceleración de inferencia, comparando la tasa de aceptación de tokens candidatos con diferentes prompts.
- Análisis de impacto de cuantización: la combinación de MXFP4 y Q8 ofrece un caso de estudio para evaluar la relación entre precisión, memoria y velocidad en modelos MoE de gran tamaño.
- Integración en aplicaciones de productividad: AFM puede servir como motor de generación de texto en aplicaciones de escritorio o scripts de automatización para macOS.
- Entornos aislados con privacidad: el despliegue local es adecuado para procesar documentos o código sin enviar datos a servicios cloud.
- Evaluación de rendimiento en hardware Apple: con 256 GB de memoria unificada, se puede medir el consumo de memoria y la latencia de un modelo de 284.000 millones de parámetros en un equipo de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No aplica VRAM: el modelo se ejecuta en la memoria unificada de Apple Silicon.
- Memoria unificada estimada: se recomiendan aproximadamente 256 GB o más para la variante MXFP4.
- GPU recomendada: Apple Silicon (chips M1, M2, M3, M4 o posteriores).
- No cabe en GPU de consumo convencional; se requiere un Mac con al menos 256 GB de memoria unificada.
- Despliegue mediante AFM 0.9.15 o superior, con el runtime DwarfStar.
- No se recomienda su uso con otros runtimes; es un artefacto de AFM y puede no funcionar con versiones públicas actuales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos sobre modelos comparables de la misma categoría (mismo tamaño o tarea). No se ofrecen benchmarks comparativos. El modelo base es deepseek-ai/DeepSeek-V4-Flash, del que este repositorio es una cuantización GGUF, pero no hay métricas que permitan comparar.

## Limitaciones y advertencias

- Artefacto experimental AFM: no es una versión generalista de GGUF y está destinado a una versión de maclocal-api aún no publicada.
- Compatibilidad restringida: puede no funcionar con runtimes públicos actuales u otros entornos de inferencia.
- Sujeto a cambios: el comportamiento, la calidad, el rendimiento, el uso de memoria, la compatibilidad o la estructura de archivos pueden variar.
- Requisito de hardware muy alto: se recomiendan 256 GB de memoria unificada, lo que limita su uso a Macs Apple Silicon de gama alta.
- Idiomas limitados: solo se documenta inglés como idioma soportado.
- Riesgo de alucinación: no se especifica, pero es un riesgo inherente a los modelos de lenguaje grandes; se deben validar las salidas en producción.
- Licencia MIT con restricciones implícitas: los derechos de autor del modelo base pertenecen a DeepSeek; los usuarios son responsables de cumplir los términos del modelo fuente.

## Enlaces

- Repositorio del modelo: https://huggingface.co/maclocal/DeepSeek-V4-Flash-0731-DwarfStar-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- Conversión y cuantización original: https://huggingface.co/antirez/deepseek-v4-gguf
- Motor DwarfStar: https://github.com/antirez/ds4
- Proyecto AFM: https://maclocal.ai
- API maclocal (en desarrollo): https://github.com/scouzi1966/maclocal-api

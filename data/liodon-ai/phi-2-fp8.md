# liodon-ai/phi-2-FP8

## Resumen

El modelo `liodon-ai/phi-2-FP8` es una cuantización en precisión FP8 (punto flotante de 8 bits) del modelo `microsoft/phi-2`, publicada por la organización Liodon AI. Esta versión reduce el tamaño del modelo original de 5,6 GB a 3,0 GB, manteniendo los pesos en formato FP8 E4M3 por canal y cuantizando las activaciones dinámicamente por token en tiempo de inferencia. El esquema utilizado, `FP8_DYNAMIC`, no requiere dataset de calibración, por lo que la conversión es una simple reinterpretación numérica de los pesos originales, lo que evita sesgos introducidos por conjuntos de calibración.

La relevancia de este modelo radica en su capacidad para ejecutarse de forma eficiente en GPUs modernas (compute capability ≥ 8.9) mediante motores de inferencia como vLLM, TGI o SGLang, manteniendo la calidad del modelo base. Es una opción atractiva para entornos con recursos limitados o para despliegues en el borde, donde el ahorro de memoria y el aumento de throughput son críticos. Al ser una cuantización directa, no introduce degradación adicional más allá de la inherente a la precisión FP8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: microsoft/phi-2) |
| Parametros totales | 2.779.683.840 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 dinámico (E4M3 por canal para pesos, activaciones dinámicas por token) |
| Idiomas soportados | no disponible |
| Licencia | other (misma que microsoft/phi-2) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Este modelo no ha sido entrenado desde cero; es una cuantización del modelo `microsoft/phi-2`. La cuantización se realizó con la herramienta `llm-compressor` del proyecto vLLM, utilizando el esquema `FP8_DYNAMIC`. En este esquema, los pesos se convierten a FP8 E4M3 por canal de forma estática (antes de la inferencia), mientras que las activaciones se cuantizan dinámicamente por token en tiempo de ejecución. No se emplea ningún dataset de calibración, por lo que los valores cuantizados son una conversión directa de los pesos originales. La capa `lm_head` se deja sin cuantizar, práctica estándar para preservar la calidad de la salida. No se dispone de información sobre el entrenamiento del modelo base (tokens, dataset, técnicas de alineación) en la documentación proporcionada.

## Capacidades

- Generación de texto: al ser una cuantización de phi-2, hereda las capacidades del modelo base, aunque no se detallan en la información disponible.
- Inferencia eficiente en FP8: diseñado para ejecutarse con aceleración nativa en GPUs con compute capability ≥ 8.9 (Ada, Hopper, Blackwell).
- Compatibilidad con motores de inferencia populares: vLLM, TGI y SGLang.
- Sin necesidad de calibración: la cuantización es directa, lo que simplifica el despliegue.
- No se especifican capacidades adicionales como tool calling, agentes, visión o audio en la documentación proporcionada.

## Casos de uso

Dado que la información disponible no detalla casos de uso específicos, se listan aplicaciones típicas para un modelo de lenguaje pequeño cuantizado en FP8, a modo orientativo:

- Despliegue en el borde (edge): su tamaño reducido (3,0 GB) permite ejecutarlo en dispositivos con memoria limitada, como Jetson o GPUs de gama media, para tareas de generación de texto en tiempo real.
- Servicio de inferencia de alto rendimiento: al usar FP8 nativo en GPUs modernas, puede servir múltiples peticiones concurrentes con menor latencia que la versión original en FP16.
- Prototipado rápido: al no requerir calibración, se puede sustituir directamente el modelo original por esta versión cuantizada en pipelines existentes sin reentrenamiento.
- Aplicaciones de chat y asistentes virtuales: como modelo de lenguaje general, puede integrarse en sistemas conversacionales, aunque no se confirman capacidades específicas de multi-turno.
- Generación de código y autocompletado: si el modelo base phi-2 soporta estas tareas, la versión cuantizada podría usarse en entornos de desarrollo con restricciones de memoria.
- Investigación en eficiencia de modelos: sirve como referencia para estudiar el impacto de la cuantización FP8 en la calidad y el rendimiento de SLMs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- GPU con compute capability ≥ 8.9 (RTX 40-series, L4/L40S, H100/H200, B100/B200/GB10) para ejecución FP8 nativa.
- En GPUs más antiguas, vLLM/TGI dequantizan los pesos a mayor precisión, perdiendo las ventajas de velocidad y memoria.
- Tamaño del modelo: 3,0 GB en disco, lo que sugiere que cabe en GPUs con al menos 4 GB de VRAM, aunque no se especifica el consumo exacto en inferencia.
- Motores de despliegue compatibles: vLLM, Text Generation Inference (TGI) y SGLang.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La única comparación posible es con el modelo base `microsoft/phi-2`, del cual esta versión es una cuantización directa. Se puede resumir así:

| Modelo | Tamaño | Precisión | Licencia | Disponibilidad |
|---|---|---|---|---|
| microsoft/phi-2 | 5,6 GB | FP16 (original) | other | HuggingFace |
| liodon-ai/phi-2-FP8 | 3,0 GB | FP8 dinámico | other | HuggingFace |

No se conocen otros modelos cuantizados de phi-2 en la información proporcionada.

## Limitaciones y advertencias

- La ejecución FP8 nativa requiere hardware específico (compute capability ≥ 8.9); en GPUs antiguas se pierde el beneficio de velocidad y memoria.
- La capa `lm_head` no está cuantizada, lo que implica un pequeño overhead adicional en memoria y cómputo.
- La licencia es "other", por lo que es necesario revisar los términos de la licencia del modelo base `microsoft/phi-2` antes de uso comercial.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones de idioma del modelo base.
- Al ser una cuantización sin calibración, la calidad puede variar ligeramente respecto al original en tareas sensibles a la precisión numérica, aunque no se han publicado evaluaciones.

## Enlaces

- [Modelo en HuggingFace: liodon-ai/phi-2-FP8](https://huggingface.co/liodon-ai/phi-2-FP8)
- [Organización Liodon AI en HuggingFace](https://huggingface.co/liodon-ai)
- [Sitio web de Liodon AI](https://liodon.ai/)
- [Modelo base: microsoft/phi-2](https://huggingface.co/microsoft/phi-2)
- [Página de Microsoft sobre modelos Phi](https://azure.microsoft.com/en-us/products/phi/)

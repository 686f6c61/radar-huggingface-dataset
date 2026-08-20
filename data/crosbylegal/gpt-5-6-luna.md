# crosbylegal/gpt-5.6-luna

## Resumen

GPT-5.6 Luna es un modelo de API propietario del que no se dispone de pesos públicos. La entrada en Hugging Face bajo el identificador `crosbylegal/gpt-5.6-luna` no es un repositorio de modelo convencional, sino una *results-tracking model card*: una tarjeta creada exclusivamente para alojar los resultados de evaluación del benchmark RedlineBench en el Hub. El autor, crosbylegal, la publicó el 20 de agosto de 2026 y la mantiene actualizada para dar visibilidad a las puntuaciones del modelo sin necesidad de distribuir sus pesos.

El propósito de esta tarjeta es servir como punto de referencia para la comunidad: cualquier investigador puede consultar la puntuación de GPT-5.6 Luna en RedlineBench (55.5 en la métrica `redline_overall`) y acceder al informe completo publicado en intelligence.crosby.ai. No se proporciona información sobre arquitectura, tamaño, contexto, licencia o idiomas, por lo que esta ficha se limita a documentar los datos disponibles y a señalar explícitamente las carencias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (la tarjeta no contiene pesos) |

## Arquitectura y entrenamiento

No se ha publicado ninguna información sobre la arquitectura de GPT-5.6 Luna. Al tratarse de un modelo de API sin repositorio público, se desconoce si emplea una arquitectura transformer, MoE, SSM o híbrida. Tampoco hay datos sobre el dataset de entrenamiento, el número de tokens procesados o si se aplicaron técnicas de alineación como RLHF o DPO. La única información técnica disponible es la puntuación en RedlineBench, que no permite inferir detalles de implementación.

## Capacidades

No se dispone de información sobre las capacidades del modelo. La tarjeta no documenta generación de texto, razonamiento, código, matemáticas, visión, tool calling, capacidades de agente o multilingüismo. Dado que es un modelo de API, es probable que ofrezca capacidades de lenguaje natural, pero no hay datos verificables en la información proporcionada.

## Casos de uso

Al no existir pesos descargables ni documentación funcional, no es posible recomendar casos de uso concretos con base técnica. La tarjeta solo sirve como registro de evaluación. Cualquier aplicación práctica dependería del acceso a la API propietaria de crosby.ai, cuyas condiciones y prestaciones no se detallan en esta entrada de Hugging Face.

## Benchmarks y rendimiento

La tarjeta reporta un único resultado del benchmark RedlineBench:

| Benchmark | Metrica | Resultado |
|---|---|---|
| RedlineBench | redline_overall | 55.5 |

No se incluyen comparaciones con otros modelos ni resultados adicionales (MMLU, HumanEval, GSM8K, etc.). La puntuación se atribuye al informe publicado en intelligence.crosby.ai, no a una verificación oficial de Hugging Face.

## Requisitos de hardware

No disponibles. Al no existir pesos públicos, no se puede estimar VRAM, GPUs recomendadas, opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) ni latencia o throughput. El acceso al modelo se realizaría exclusivamente a través de la API de crosby.ai, cuyos requisitos de infraestructura no se documentan en esta tarjeta.

## Comparativa con modelos similares

No disponible. No se proporcionan datos de modelos comparables ni se indican alternativas de la misma categoría. Sin información sobre parámetros, contexto o rendimiento en benchmarks estándar, no es posible establecer una comparativa rigurosa.

## Limitaciones y advertencias

- La tarjeta no contiene pesos ni artefactos descargables; es únicamente un registro de resultados.
- No se especifica la licencia, por lo que se desconoce si el modelo subyacente permite uso comercial o de investigación.
- No hay información sobre sesgos, alucinaciones o limitaciones de contexto o idioma.
- La puntuación de RedlineBench (55.5) proviene de un informe externo no verificado por Hugging Face; su metodología y reproducibilidad no están documentadas en esta entrada.
- La fecha de creación (2026-08-20) es posterior a la fecha actual, lo que sugiere que la tarjeta podría ser un artefacto de prueba o contener metadatos inconsistentes; se recomienda verificar la autenticidad antes de cualquier uso.

## Enlaces

- [Model card en Hugging Face](https://huggingface.co/crosbylegal/gpt-5.6-luna)
- [Dataset RedlineBench](https://huggingface.co/datasets/crosbylegal/RedlineBench)
- [Informe de benchmark](https://intelligence.crosby.ai/benchmark/)

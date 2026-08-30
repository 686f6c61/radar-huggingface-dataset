# OpenCOReTechnologies/CORe-Predetermined-v1

## Resumen

CORe-Predetermined-v1 es un modelo de lenguaje publicado por OpenCOReTechnologies, una organización asociada a la plataforma de chat OpenCORe, que se describe a sí misma como centrada en la alineación de IA. El modelo tiene un tamaño muy reducido, con 29.676.544 parámetros (aproximadamente 29,7 millones), y se distribuye bajo licencia Apache 2.0. El repositorio incluye pesos en formato safetensors y GGUF, lo que sugiere que está pensado para ejecutarse en entornos modestos o en local.

Sin embargo, la información pública disponible es extremadamente escasa: la model card solo contiene la licencia, sin descripción de arquitectura, datos de entrenamiento, capacidades ni benchmarks. Tampoco se han publicado resultados de rendimiento ni casos de uso documentados. Dado que el modelo tiene cero descargas y cero likes en HuggingFace, parece un lanzamiento experimental o preliminar dentro del ecosistema OpenCORe, sin validación externa aún.

Por tanto, esta ficha se limita a recoger los datos técnicos verificables y a señalar explícitamente las carencias de información, para que cualquier desarrollador o investigador pueda evaluar si merece la pena profundizar en este modelo antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 29.676.544 |
| Parametros activos | no aplicable (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo incluye safetensors y GGUF, pero sin detalle de cuantizaciones concretas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

No se ha publicado ninguna información sobre la arquitectura del modelo (si es un transformer denso, MoE, SSM, etc.), ni sobre el proceso de entrenamiento, el volumen de tokens utilizados, la composición del dataset o si se aplicaron técnicas como RLHF o DPO. Tampoco se mencionan innovaciones técnicas particulares. La única pista indirecta es el nombre "CORe-Predetermined-v1", que sugiere una posible relación con la plataforma OpenCORe, pero no hay documentación técnica que lo respalde.

## Capacidades

No se dispone de información verificable sobre las capacidades del modelo. No hay documentación que indique si es capaz de generación de texto, razonamiento, código, matemáticas, tool calling, capacidades multimodales o multilingües. Dado su tamaño (29,7 millones de parámetros), es probable que sus capacidades sean muy limitadas en comparación con modelos de miles de millones de parámetros, pero esto es una inferencia basada en el tamaño, no un dato confirmado.

## Casos de uso

No hay casos de uso documentados ni ejemplos prácticos proporcionados por el autor. Al carecer de información sobre capacidades y rendimiento, no es posible recomendar aplicaciones concretas. Cualquier uso en producción requeriría una evaluación previa exhaustiva del modelo por parte del desarrollador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni ninguna otra métrica estándar. Tampoco se ofrecen comparativas con otros modelos.

## Requisitos de hardware

No hay requisitos de hardware oficiales publicados. Dado el tamaño del modelo (29,7 millones de parámetros), es razonable estimar que podría ejecutarse en CPU o en GPUs de gama baja (por ejemplo, con 4-6 GB de VRAM), pero esta estimación no está respaldada por documentación del autor. No se indica compatibilidad con frameworks de despliegue como vLLM, llama.cpp, Ollama o TGI, aunque la presencia de pesos GGUF sugiere que podría usarse con llama.cpp o similares.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. No se conocen modelos de la misma categoría (tamaño similar y propósito) con los que comparar, y no hay datos de rendimiento del propio modelo. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- No hay documentación sobre sesgos, alucinaciones o limitaciones de contexto o idioma. La ausencia de información no implica ausencia de riesgos.
- El modelo tiene un tamaño muy reducido (29,7 millones de parámetros), lo que probablemente limite su capacidad para tareas complejas de razonamiento o generación de código de alta calidad, aunque no hay datos que lo confirmen.
- No se ha validado externamente (cero descargas y cero likes en HuggingFace), por lo que su calidad y estabilidad son desconocidas.
- La licencia Apache 2.0 permite uso comercial, pero sin garantías ni soporte por parte del autor.
- Para cualquier uso en producción, se recomienda encarecidamente realizar pruebas exhaustivas de calidad, seguridad y sesgos antes de adoptarlo.

## Enlaces

- HuggingFace: https://huggingface.co/OpenCOReTechnologies/CORe-Predetermined-v1
- Sitio web de OpenCORe: https://opencore.one/
- Documentación de la API de OpenCORe: https://opencore.one/docs/api (menciona otros modelos como core-6.2, pero no aporta detalles sobre CORe-Predetermined-v1)

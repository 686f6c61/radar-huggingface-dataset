# mradermacher/gemma-4-E4B-it-weight-space-programming-UNCENSORED-heretic-GGUF

## Resumen

Este repositorio contiene una colección de cuantizaciones GGUF estáticas del modelo `gemma-4-E4B-it-weight-space-programming-UNCENSORED-heretic`, publicado originalmente por el usuario `xtools-at`. El autor de las cuantizaciones es `mradermacher`, un perfil conocido en Hugging Face por generar versiones GGUF de modelos de terceros para su uso con llama.cpp y herramientas compatibles. El nombre del modelo sugiere una variante afinada de la familia Gemma 4 (tamaño E4B, es decir, variante eficiente de aproximadamente 4.000 millones de parámetros) orientada a "weight space programming", sin censura y con una modificación de tipo "heretic" (típicamente una intervención que revierte el alineamiento de seguridad).

El dato más relevante y a la vez llamativo es el recuento de parámetros reportado a partir de los safetensors del repositorio: 478.088.384 parámetros, muy por debajo de lo que cabría esperar de una variante "E4B" de Gemma. Esto indica que o bien el nombre del modelo no se corresponde con su tamaño real, o bien el recuento de safetensors corresponde únicamente a un componente parcial (por ejemplo, un adaptador o una parte del modelo). No hay información en la model card que aclare esta discrepancia.

La ficha se limita estrictamente a los datos disponibles en el repositorio. No se dispone de información sobre arquitectura interna, datos de entrenamiento, benchmarks, licencia ni idiomas soportados, por lo que la mayoría de apartados técnicos se marcan como "no disponible". El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere un artefacto reciente o de escasa difusión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere familia Gemma 4, variante E4B; sin confirmar) |
| Parametros totales | 478.088.384 (según safetensors del repo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base. El nombre `gemma-4-E4B-it` sugiere una variante de la familia Gemma 4 de Google en su tamaño eficiente "E4B" e instruida ("it"), pero no hay confirmación en la model card ni datos sobre número de capas, dimensiones ocultas, mecanismo de atención o si emplea arquitectura transformer densa o mixta. El sufijo `weight-space-programming` apunta a una técnica de adaptación o edición de pesos, pero no se detalla en el repositorio.

Tampoco hay información sobre el proceso de entrenamiento: número de tokens, composición del dataset, uso de RLHF, DPO u otras técnicas de alineamiento. El término `heretic` en el nombre suele asociarse a intervenciones que revierten o eliminan el comportamiento de rechazo aprendido durante el alineamiento, pero no se documenta el método concreto empleado. El repositorio es únicamente una conversión a GGUF del modelo original de `xtools-at`, sin información adicional sobre el pipeline de cuantización más allá de los metadatos de la cabecera (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`).

## Capacidades

- Generación de texto conversacional: el sufijo `it` sugiere un modelo ajustado para instrucciones y diálogo, aunque no se detallan capacidades concretas.
- Comportamiento sin censura: el sufijo `UNCENSORED-heretic` indica que se ha eliminado o reducido el comportamiento de rechazo, por lo que el modelo respondería a peticiones que un modelo alineado estándar rechazaría.
- Capacidades multilingües: no disponible.
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso y agentes: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo puede emplearse en entornos controlados para estudiar cómo varía el comportamiento de un modelo tras aplicar técnicas de "ablación" del alineamiento, comparando respuestas frente al modelo base original.
- Generación de texto creativo sin restricciones temáticas: útil para experimentación con narrativa o guiones donde el modelo base tiende a rechazar ciertos temas, siempre en contextos de investigación y con revisión humana.
- Pruebas de robustez y red teaming: sirve como artefacto para evaluar clasificadores de seguridad, filtros de contenido y sistemas de moderación, al generar respuestas que los modelos alineados evitan.
- Despliegue local con llama.cpp: al estar en formato GGUF con múltiples niveles de cuantización (desde Q2_K hasta Q8_0), puede ejecutarse en hardware de consumo para experimentación offline.
- Evaluación comparativa de cuantizaciones: el repositorio permite medir la degradación de calidad entre Q2_K, Q4_K_M y Q8_0 sobre un mismo modelo, útil para estudiar el impacto de la cuantización en modelos pequeños.
- Docencia y demostraciones sobre edición de pesos: el nombre `weight-space-programming` lo hace adecuado para ilustrar técnicas de modificación de pesos en charlas o talleres, con las cautelas oportunas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 478 millones de parámetros, el peso en FP16 ronda los 0,96 GB; en Q8_0 aproximadamente 0,5 GB; en Q4_K_M alrededor de 0,3 GB; en Q2_K en torno a 0,2 GB. Estas cifras son estimaciones a partir del recuento de parámetros y no incluyen la memoria del contexto KV.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM puede alojar las cuantizaciones más pequeñas; una RTX 3060 o superior ofrece margen holgado para contexto largo. Para despliegues en servidor, A100 o H100 no son necesarias dado el tamaño reducido.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU dedicadas de los últimos años e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp, Ollama (mediante importación del GGUF), LM Studio y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requerirían el modelo original en safetensors.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/gemma-4-E4B-it-...-heretic-GGUF | 478.088.384 | no disponible | no disponible | GGUF | Cuantizaciones estáticas de un modelo de terceros; sin benchmarks |
| Modelo base xtools-at/gemma-4-E4B-it-weight-space-programming-UNCENSORED-heretic | no disponible | no disponible | no disponible | safetensors (presumiblemente) | Origen de las cuantizaciones; sin datos publicados en la información disponible |
| Gemma original de Google (familia) | variable según variante | variable | Gemma Terms of Use | safetensors, GGUF | Referencia de la familia; no se dispone de datos concretos de la variante E4B en esta consulta |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo ha sido modificado explícitamente para eliminar o reducir el comportamiento de rechazo (`UNCENSORED-heretic`), lo que implica un riesgo elevado de generar contenido dañino, ilegal o inseguro. No es apto para producción orientada al público sin capas adicionales de moderación.
- Riesgo de alucinación: no evaluado; los modelos de tamaño reducido suelen presentar tasas de alucinación más altas, pero no hay datos que lo confirmen en este caso.
- Discrepancia entre el nombre (`E4B`) y el recuento de parámetros (478 millones): conviene verificar el modelo original antes de asumir capacidades o requisitos de hardware.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. El modelo base podría estar sujeto a los términos de Gemma, pero no se indica en el repositorio.
- Idiomas no documentados: no se puede garantizar un rendimiento adecuado fuera del inglés.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria, sin issues reportados y sin garantías de mantenimiento.
- Los metadatos de la cabecera GGUF (`quantize_version: 2`, `output_tensor_quantised: 1`) indican una conversión desde Hugging Face, pero no se especifica la herramienta exacta ni la versión de llama.cpp requerida.
- El término `weight-space-programming` no está documentado en la model card; se desconoce qué modificación concreta se aplicó sobre los pesos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/gemma-4-E4B-it-weight-space-programming-UNCENSORED-heretic-GGUF
- Modelo original: https://huggingface.co/xtools-at/gemma-4-E4B-it-weight-space-programming-UNCENSORED-heretic

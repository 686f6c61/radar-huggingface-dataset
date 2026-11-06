# mradermacher/Olmo-3.1-32B-Instruct-ARA-heretic-GGUF

## Resumen

Olmo-3.1-32B-Instruct-ARA-heretic-GGUF es una cuantización estática en formato GGUF del modelo richardyoung/Olmo-3.1-32B-Instruct-ARA-heretic, publicada por mradermacher. El modelo subyacente deriva de la familia Olmo 3.1 de AllenAI (32.233.522.176 parámetros, aproximadamente 32B) y ha sido modificado mediante técnicas de "abliteration" o "heretic" para eliminar total o parcialmente los mecanismos de rechazo y censura del modelo original, dando lugar a una variante denominada "uncensored", "decensored" o "abliterated". Esta ficha describe el artefacto GGUF distribuido por mradermacher, que es el que se puede descargar y ejecutar directamente.

El problema que resuelve esta publicación es práctico: convertir los pesos originales en safetensors a cuantizaciones GGUF de distintos niveles de precisión (desde Q2_K hasta Q8_0) para permitir la inferencia en hardware de consumo mediante llama.cpp, Ollama u otros motores compatibles con GGUF. El repositorio ocupa 219,8 GB e incluye once variantes de cuantización, desde 12,1 GB (Q2_K) hasta 34,4 GB (Q8_0).

Es relevante ahora porque la familia Olmo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su modificación, y porque las variantes "heretic" atraen a quienes necesitan un modelo sin filtros de rechazo para investigación sobre alineación, evaluación de sesgos o generación creativa sin restricciones. No obstante, la información publicada por el autor es muy escasa: no se detallan la longitud de contexto, los idiomas soportados más allá del inglés ni los resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Olmo 3.1 de AllenAI; no se detalla en la información proporcionada) |
| Parametros totales | 32.233.522.176 (32B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (cuantizaciones estáticas; no hay imatrix ni IQ publicadas por el autor) |
| Idiomas soportados | en (inglés) según la model card |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (transformers, gguf) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la documentación proporcionada. El modelo base es richardyoung/Olmo-3.1-32B-Instruct-ARA-heretic, que a su vez deriva de la familia Olmo 3.1 de AllenAI, de la que se conoce el tamaño (32B parámetros) pero no los detalles de capas, atención o composición del dataset en esta ficha. La model card del artefacto GGUF no incluye información sobre el número de tokens de entrenamiento, la composición del corpus ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica destacable de esta publicación concreta es el proceso de "heretic" o abliteration aplicado sobre el modelo instruct original, que modifica los pesos para reducir la probabilidad de respuestas de rechazo. El autor etiqueta el resultado como "reproducible", lo que sugiere que el procedimiento de modificación es documentado y repetible, aunque los detalles del método no se incluyen en la información disponible. La cuantización se ha realizado con el pipeline de mradermacher (quantize_version 2, output_tensor_quantised 1, convert_type hf) y no se han publicado variantes ponderadas con imatrix.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo Instruct base.
- Razonamiento y respuesta a instrucciones, al ser una variante Instruct.
- Modo "uncensored": se ha reducido o eliminado el comportamiento de rechazo ante peticiones que el modelo original declinaría.
- Capacidades multilingües: limitadas al inglés según la model card (language: en); no se documentan otros idiomas.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (visión, audio, thinking mode): no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo se comporta una variante abliterated frente al original en tareas de rechazo, util para analizar los mecanismos de censura y sus efectos colaterales.
- Evaluación de sesgos y toxicidad: al carecer de filtros de rechazo, sirve para medir de forma más directa la distribución de respuestas del modelo base en dominios sensibles, sin que el rechazo enmascare el comportamiento subyacente.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa que requiera temáticas adultas o controvertidas, donde un modelo con rechazos sistemáticos resulta poco util.
- Despliegue local en hardware de consumo: las cuantizaciones Q4_K_S (18,5 GB) y Q4_K_M (19,6 GB) permiten ejecutar un modelo de 32B en GPUs con 24 GB de VRAM o en configuraciones con offload a CPU mediante llama.cpp.
- Experimentación con cuantizaciones: el repositorio ofrece once niveles de precisión, lo que facilita comparar la degradación de calidad entre Q2_K y Q8_0 en un mismo modelo para tareas de investigación sobre cuantización.
- Prototipado de asistentes conversacionales en inglés: para pruebas internas donde se necesite un modelo de 32B con licencia Apache 2.0 y sin dependencia de APIs externas.
- Fine-tuning posterior sobre GGUF o sobre el modelo base: la licencia permisiva permite adaptar el modelo a dominios concretos, aunque el fine-tuning directo sobre GGUF es limitado y requeriría partir del modelo en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: 12,1 GB.
  - Q3_K_S: 14,2 GB; Q3_K_M: 15,7 GB; Q3_K_L: 17,0 GB.
  - Q4_K_S: 18,5 GB; Q4_K_M: 19,6 GB.
  - Q5_K_S: 22,3 GB; Q5_K_M: 23,0 GB.
  - Q6_K: 26,5 GB.
  - Q8_0: 34,4 GB.
- GPU recomendadas: para Q8_0, una A100 40GB o H100; para Q6_K, una A100 40GB o RTX 4090 24GB con contexto limitado; para Q4_K_M y Q4_K_S, una RTX 4090 24GB o RTX 3090 24GB.
- ¿Cabe en GPU de consumo? Sí, en RTX 3090/4090 (24 GB) con cuantizaciones Q4 y Q5; las Q2 y Q3 caben en GPUs de 16 GB con contexto reducido; Q6_K y Q8_0 requieren 32 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier motor compatible con GGUF (koboldcpp, LM Studio). El tag "endpoints_compatible" sugiere compatibilidad con endpoints tipo OpenAI en plataformas de inferencia, aunque no se detalla.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/Olmo-3.1-32B-Instruct-ARA-heretic-GGUF | 32B | no disponible | Apache 2.0 | GGUF | Variante abliterated, cuantizaciones estáticas |
| richardyoung/Olmo-3.1-32B-Instruct-ARA-heretic | 32B | no disponible | Apache 2.0 (heredada) | safetensors | Modelo base del que se cuantiza; misma modificación heretic |
| mradermacher/Olmo-3.1-32B-Instruct-GGUF | 32B | no disponible | Apache 2.0 | GGUF | Cuantización del Olmo 3.1 Instruct sin modificar (con rechazos) |
| mradermacher/Olmo-3.1-32B-Instruct-impotent-heresy-i1-GGUF | 32B | no disponible | Apache 2.0 | GGUF (imatrix) | Otra variante modificada, con cuantización imatrix |

## Limitaciones y advertencias

- La modificación "heretic" o abliteration altera el comportamiento de rechazo del modelo, lo que puede degradar su calidad general y aumentar la probabilidad de respuestas dañinas, sesgadas o inexactas en dominios sensibles.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad; al ser una variante modificada, no hay garantía de que mantenga la precisión del Olmo 3.1 original.
- Idiomas: la model card solo declara inglés; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Longitud de contexto: no documentada en la información disponible; no debe asumirse un contexto largo sin verificarlo contra el modelo base.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo modificado; el usuario asume la responsabilidad legal y ética de su despliegue.
- No hay cuantizaciones imatrix ni IQ publicadas por mradermacher para este modelo, lo que limita las opciones de calidad intermedia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del artefacto.
- El tag "reproducible" sugiere que el proceso es repetible, pero no se incluye la documentación del método en la model card.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Olmo-3.1-32B-Instruct-ARA-heretic-GGUF
- Modelo base: https://huggingface.co/richardyoung/Olmo-3.1-32B-Instruct-ARA-heretic
- Página de descargas del autor: https://hf.tst.eu/model#Olmo-3.1-32B-Instruct-ARA-heretic-GGUF
- Cuantización del Olmo 3.1 Instruct sin modificar: https://huggingface.co/mradermacher/Olmo-3.1-32B-Instruct-GGUF
- Variante impotent-heresy-i1: https://huggingface.co/mradermacher/Olmo-3.1-32B-Instruct-impotent-heresy-i1-GGUF
- FAQ y peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

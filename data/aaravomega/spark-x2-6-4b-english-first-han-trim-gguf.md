# Aaravomega/spark-x2.6-4b-english-first-han-trim-gguf

## Resumen

`spark-x2.6-4b-english-first-han-trim-gguf` es una derivación en formato GGUF del modelo `XHToken/Spark-X2.6-4B-GGUF`, publicada por Aaravomega. No se trata de un fine-tune ni de un nuevo entrenamiento: es una versión Q4_K_M a la que se le han eliminado 34.068 entradas del tokenizer clasificadas como Han/CJK, reduciendo el vocabulario de 131.072 a 97.004 entradas y el archivo en 268.751.328 bytes respecto al GGUF original.

La modificación busca un modelo “English-first” más compacto para inferencia local, manteniendo intactos los 289 tensores no relacionados con el vocabulario. El autor indica que sigue siendo multilingüe, pero advierte de que la cobertura y la generación en chino pueden empeorar, y de que la eliminación de entradas puede afectar al round-tripping de texto chino.

El modelo tiene 4.273.195.520 parámetros y se distribuye bajo licencia Apache-2.0, sujeta a los términos del modelo upstream. Está pensado para su uso en LM Studio y en entornos compatibles con GGUF, aunque no se especifican arquitectura, longitud de contexto ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible; no se especifica en la información proporcionada |
| Parámetros totales | 4.273.195.520 (aproximadamente 4,27 mil millones) |
| Parámetros activos | no disponible; no se indica que sea un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M en GGUF; el archivo publicado es Q4_K_M |
| Idiomas soportados | no disponible; la model card lo describe como multilingüe y “English-first”, sin lista concreta de idiomas |
| Licencia | Apache-2.0, sujeta a los términos del modelo upstream |
| Formato de pesos | GGUF; archivo `Spark-X2.6-4B-English-First-Han-Trim-Q4_K_M.gguf` |
| Tamaño del archivo | 3.274.689.984 bytes (3,27 GB decimales; 3,05 GiB) |
| Tamaño del repositorio | 3,3 GB |
| Vocabulario | 97.004 entradas, frente a 131.072 del modelo original |
| Modelo base | `XHToken/Spark-X2.6-4B-GGUF` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base: no se indica si es un transformer denso, un MoE, un modelo híbrido o una arquitectura SSM. Tampoco se detallan el número de tokens de entrenamiento, la composición del dataset, las fases de alineación —RLHF, DPO u otras— ni innovaciones técnicas del entrenamiento original.

La aportación de esta ficha es una modificación del tokenizer y de las tablas de vocabulario sobre un GGUF Q4_K_M ya existente. Se eliminaron 34.068 entradas Han/CJK, se conservó el orden relativo de los tokens restantes, se usaron IDs contiguos y se mantuvieron coherentes la lista de merges —de 130.716 a 96.648— y los IDs de tokens especiales. Los 289 tensores no relacionados con el vocabulario son idénticos byte a byte al GGUF de origen, y las dos tablas con forma de vocabulario se recortaron sin recuantizar. El autor incluye un `gguf_manifest.json` con hashes SHA-256, mapeo de IDs y sumas de comprobación de tensores.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` y la etiqueta `conversational` está presente.
- Uso en LM Studio: el autor documenta la búsqueda del repositorio dentro de la aplicación o la importación directa del archivo GGUF.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integración con servicios compatibles, aunque no se detalla el protocolo exacto.
- Multilingüismo limitado: la model card indica que sigue siendo multilingüe, pero el recorte está orientado a inglés y elimina vocabulario Han/CJK.
- Tool calling o function calling: no disponible; no se documenta soporte.
- Agentes y razonamiento multi-paso: no disponible; no se documenta soporte específico.
- Visión, audio o modo “thinking”: no disponible; no se documentan capacidades multimodales ni modos de razonamiento explícito.
- Código, matemáticas y razonamiento general: no disponible; no hay benchmarks ni evaluación publicada en la información proporcionada.

## Casos de uso

- Asistente conversacional local en LM Studio: el archivo GGUF se puede importar directamente y usar para conversaciones multi-turno en una estación de trabajo, sin depender de una API externa. Es adecuado cuando se prioriza la simplicidad de despliegue y un tamaño de 3,27 GB.
- Redacción y edición en inglés en entornos sin conexión: al ser un modelo “English-first” y compacto, puede emplearse para borradores, reescritura y corrección de textos en equipos con recursos limitados. La calidad concreta en inglés no está evaluada en la información disponible.
- Prototipado de chatbots: el pipeline `text-generation` y la etiqueta `conversational` permiten integrarlo en pruebas de concepto de atención al cliente o asistentes internos. No se debe asumir soporte de tool calling sin verificarlo.
- Procesamiento de texto con requisitos de privacidad: al ejecutarse localmente mediante GGUF, los datos no tienen que enviarse a un servicio externo. Es útil para borradores internos, clasificación simple o generación de respuestas en entornos controlados.
- Evaluación de recorte de tokenizer: investigadores pueden reproducir el efecto de eliminar 34.068 entradas Han/CJK sobre el tamaño del archivo, el vocabulario y el comportamiento en textos chinos. El manifiesto incluido facilita la verificación de hashes y shapes.
- Despliegue en GPU de consumo: con un peso de aproximadamente 3,05 GiB en Q4_K_M, el modelo puede caber en GPU de 8 GB con contexto corto y en GPU de 12 GB o más con mayor margen. La VRAM final depende del contexto y del runtime.
- Generación por lotes en CPU con llama.cpp: el formato GGUF y el tamaño reducido permiten ejecutarlo en CPU para tareas de generación no interactivas, siempre que el throughput sea aceptable para el caso de uso. No hay datos de latencia publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa 3,05 GiB. Con caché KV y overhead del runtime, una estimación orientativa es de 4 a 6 GB de VRAM para contextos moderados; no es un dato oficial y depende de la longitud de contexto, que no se especifica.
- GPU recomendadas: RTX 3060 de 12 GB, RTX 4060 Ti de 8 GB o 16 GB, RTX 4070, RTX 4080 y RTX 4090. Para este tamaño no son necesarias A100 ni H100, aunque pueden usarse.
- GPU de consumo: cabe en tarjetas de 8 GB con contexto corto; en 6 GB puede ser ajustado según el runtime y la caché KV. En 12 GB o más hay margen para contextos mayores.
- Opciones de despliegue: LM Studio y llama.cpp son las opciones documentadas o directamente compatibles con GGUF. Ollama no está documentado por el autor; podría requerir importación manual del GGUF. vLLM y TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni tiempos de primera respuesta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización / formato | Tamaño | Vocabulario | Licencia | Notas |
|---|---:|---|---|---:|---:|---|---|
| `Aaravomega/spark-x2.6-4b-english-first-han-trim-gguf` | 4,27 mil millones | no disponible | Q4_K_M / GGUF | 3.274.689.984 bytes | 97.004 | Apache-2.0 | Recorte Han/CJK; 289 tensores no léxicos idénticos al upstream |
| `XHToken/Spark-X2.6-4B-GGUF` | 4,27 mil millones | no disponible | Q4_K_M / GGUF | 3.543.441.312 bytes | 131.072 | Apache-2.0 según la model card | Modelo upstream; vocabulario completo |
| `Aaravomega/spark-x2.6-4b-int4-english-first-han-trim` | 4,27 mil millones | no disponible | INT4 / safetensors | no disponible | vocabulario recortado | Apache-2.0 | Misma política de recorte, pero en safetensors en lugar de GGUF |

No se han identificado otras alternativas comparables en la información disponible. La comparación se limita al modelo upstream y a la variante safetensors del mismo autor.

## Limitaciones y advertencias

- No es un fine-tune: el recorte del tokenizer no mejora el rendimiento en inglés ni añade capacidades nuevas; solo reduce el tamaño del vocabulario y del archivo.
- El chino puede empeorar: se han eliminado 34.068 entradas Han/CJK y el propio autor advierte de que la cobertura y la generación en chino pueden verse afectadas.
- Round-tripping de texto chino: la eliminación de entradas del vocabulario puede romper o degradar la tokenización inversa de textos que usen caracteres Han.
- El modelo sigue siendo multilingüe: eliminar vocabulario Han-only no garantiza que deje de entender o generar chino; el comportamiento real debe evaluarse con prompts propios.
- Contexto desconocido: no se especifica la longitud de contexto, por lo que no se deben asumir conversaciones largas ni documentos extensos.
- Sin benchmarks: no hay datos de MMLU, HumanEval, GSM8K ni evaluaciones equivalentes; no se puede comparar su calidad de forma objetiva con otros modelos.
- Tool calling y agentes no documentados: no se debe asumir soporte de function calling, uso de herramientas o razonamiento multi-paso.
- Cuantización Q4_K_M: es una cuantización de 4 bits con pérdida respecto al modelo original; la calidad puede diferir del checkpoint INT4 o de precisiones mayores.
- Validación comunitaria nula: el repositorio indica 0 descargas y 0 likes en la información proporcionada, por lo que no hay evidencia externa de calidad o estabilidad.
- Licencia: Apache-2.0 para esta derivación, pero sujeta a los términos del modelo upstream. Antes de uso comercial conviene revisar las condiciones de `XHToken/Spark-X2.6-4B-GGUF`.

## Enlaces

- [HuggingFace: Aaravomega/spark-x2.6-4b-english-first-han-trim-gguf](https://huggingface.co/Aaravomega/spark-x2.6-4b-english-first-han-trim-gguf)
- [Modelo base: XHToken/Spark-X2.6-4B-GGUF](https://huggingface.co/XHToken/Spark-X2.6-4B-GGUF)
- [Variante safetensors: Aaravomega/spark-x2.6-4b-int4-english-first-han-trim](https://huggingface.co/Aaravomega/spark-x2.6-4b-int4-english-first-han-trim)
- Manifiesto técnico: `gguf_manifest.json` dentro del repositorio de HuggingFace.

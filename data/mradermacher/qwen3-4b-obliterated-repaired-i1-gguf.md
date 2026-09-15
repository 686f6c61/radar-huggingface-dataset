# mradermacher/Qwen3-4B-OBLITERATED-repaired-i1-GGUF

## Resumen

Este repositorio contiene un conjunto de cuantizaciones en formato GGUF publicadas por el usuario mradermacher (conocido por su pipeline automatizado de cuantización con matrices de importancia, prefijo `i1`) sobre el modelo comunitario Hatsunama/Qwen3-4B-OBLITERATED-repaired. No se trata por tanto de un modelo entrenado desde cero ni de un ajuste fino original: es una redistribución optimizada para inferencia local del trabajo de otro autor, que a su vez deriva de la familia Qwen3-4B de Alibaba. La model card es mínima y esencialmente metadatos de conversión, sin información sobre entrenamiento, licencia o idiomas.

El término "OBLITERATED" en la nomenclatura comunitaria hace referencia a la técnica de *abliteration*, que consiste en proyectar los pesos fuera de la dirección de rechazo identificada en el espacio de activaciones para eliminar el comportamiento de negativa a responder. El sufijo "repaired" sugiere un intento posterior de reparar el daño colateral que esa operación suele causar en la coherencia del modelo. Ninguno de estos procedimientos se documenta en la información disponible, por lo que la naturaleza exacta de la modificación es una inferencia basada en el nombre.

Su relevancia práctica es doble: por un lado, ofrece un abanico muy amplio de cuantizaciones (desde IQ1_S hasta Q6_K, 24 variantes declaradas) que permiten ejecutar un modelo de clase 4B en hardware muy modesto; por otro, se trata de un modelo sin alineación de seguridad, útil como objeto de estudio en investigación sobre comportamiento de rechazo, pero problemático para despliegues en producción regulados. El repositorio presenta 0 descargas y 0 *likes*, y el metadato de tamaño indica 0.0 GB, lo que apunta a que en el momento del análisis no había validación comunitaria alguna.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible en este repositorio; el modelo base de la familia es un transformer decoder denso (Qwen3) |
| Parámetros totales | 958,716 según el metadato de safetensors del repositorio; el valor es incoherente con un modelo de clase 4B y probablemente responde a un error de dicho campo. El nombre del repositorio indica 4 000 millones |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q2_K_S, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL ("small-IQ4_NL"), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (24 variantes declaradas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repositorio no declara licencia; la del modelo base Qwen3-4B es Apache 2.0, pero eso no determina automáticamente la de esta derivación) |
| Formato de pesos | GGUF (metadatos de conversión: `convert_type: hf`, `quantize_version: 2`, `output_tensor_quantised: 1`, etiqueta `nicoboss`; cuantización con matrices de importancia) |
| Autor del repositorio | mradermacher |
| Modelo de origen | Hatsunama/Qwen3-4B-OBLITERATED-repaired |
| Fecha de creación (metadato) | 2026-09-15T17:49:34Z |
| Última actualización (metadato) | 2026-09-15T17:49:41Z |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Este repositorio no incluye ningún proceso de entrenamiento propio. La única operación realizada es la conversión desde pesos en formato Hugging Face a GGUF y su cuantización en múltiples niveles, con el pipeline de matrices de importancia de mradermacher (`i1`), que estima la sensibilidad de cada tensor a partir de datos de calibración para repartir el error de forma no uniforme entre capas. Los metadatos confirman `quantize_version: 2` y `output_tensor_quantised: 1`. La etiqueta `nicoboss` en la cabecera apunta a la herramienta o plantilla de generación empleada, pero no se documenta en el texto.

En cuanto al modelo subyacente, la familia Qwen3-4B emplea un transformer decoder denso con normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y atención con consultas agrupadas (GQA). Según la documentación pública de Qwen3, el modelo base se entrenó sobre del orden de 36 billones de tokens en tres fases (pretraining general, pretraining de razonamiento y post-entrenamiento), con un modo de pensamiento explícito y soporte declarado de más de 100 idiomas. No obstante, **estos datos corresponden al modelo original de Alibaba, no están confirmados en este repositorio** y no se puede asumir que se conserven íntegramente tras la abliteration. El procedimiento de "obliteration" y su posterior "reparación" no se describe en ningún momento: se desconoce si se emplearon direcciones de rechazo calculadas con *prompts* contrastivos, si se aplicó ortogonalización sobre los pesos de proyección de salida o si hubo un ajuste fino correctivo.

## Capacidades

Advertencia general: la model card no documenta capacidades y no se han aportado resultados de evaluación. Las capacidades que se listan a continuación son las esperables por herencia del modelo base y **deben verificarse experimentalmente**, ya que el proceso de abliteration puede degradarlas.

- Generación de texto y conversación multi-turno.
- Razonamiento con modo de pensamiento (*thinking mode*) en las variantes Qwen3 que lo exponen mediante plantilla de chat.
- Generación de código y resolución de problemas matemáticos, en línea con lo esperable en la clase 4B de la familia.
- Soporte de *tool calling* / *function calling* a través de la plantilla de chat, si esta se ha preservado en la conversión.
- Capacidad multilingüe potencial (el base declara más de 100 idiomas), no verificada tras la modificación de pesos.
- Sin capacidades de visión ni de audio: no se declara ningún proyector multimodal ni aparece el archivo `mmproj` (el metadato `skip_mmproj` está vacío y no se listan componentes multimodales).
- Comportamiento de rechazo reducido o eliminado de forma deliberada, que es precisamente el objetivo declarado por la nomenclatura del modelo original.

## Casos de uso

- Investigación sobre alineación y comportamiento de rechazo: el modelo permite estudiar cómo se distribuye la dirección de rechazo en el espacio de activaciones y qué efectos tiene su eliminación, comparándolo con el Qwen3-4B original como control.
- *Red teaming* y evaluación de seguridad: sirve como generador adversarial local para probar clasificadores de contenido, filtros de moderación o guardarraíles en pipelines propios, sin coste de API.
- Generación de datos sintéticos para ajuste: puede producir grandes volúmenes de texto diverso en local, útil para crear conjuntos de instrucciones o de preferencias cuando se necesita material que los modelos alineados rechazan generar.
- Escritura creativa y *roleplay* sin restricciones: narrativa de ficción con temáticas adultas o violentas, donde los modelos con alineación estándar suelen negarse; el contexto limitado del modelo obliga a gestionar la ventana con resúmenes periódicos.
- Despliegue local en hardware de gama de consumo: con las variantes Q4_K_S o Q4_K_M (estimadas en torno a 2,4-2,5 GB) cabe en una GPU de 6-8 GB de VRAM o incluso en CPU, lo que habilita asistentes offline en portátiles y equipos sin conexión.
- Experimentación con cuantizaciones extremas: las variantes IQ1_S, IQ2_XXS y Q3_K_S permiten medir la degradación de calidad por *bit* en un mismo modelo, un caso de estudio útil para decidir el nivel de compresión aceptable en proyectos propios.
- Base para ajuste fino posterior (*fine-tuning*) en tareas concretas: al ser un modelo pequeño, se puede reentrenar con LoRA en una única GPU de 24 GB y comparar el efecto del ajuste sobre un modelo con rechazo eliminado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra métrica, y la búsqueda web asociada no devolvió ningún resultado relevante sobre el modelo (los resultados obtenidos correspondían a páginas del servicio checo de buzones de datos, sin relación alguna con el repositorio).

## Requisitos de hardware

Las cifras de tamaño son estimaciones calculadas a partir del número de parámetros declarado en el nombre del repositorio (clase 4B) y de los bits por peso típicos de cada tipo de cuantización de llama.cpp; **el repositorio no publica tamaños de archivo** (el metadato de tamaño del repo es 0.0 GB).

| Cuantización | Tamaño estimado de pesos | VRAM recomendada con contexto moderado | ¿Cabe en GPU de consumo? |
|---|---|---|---|
| IQ1_S | ~1,1 GB | ~2-3 GB | Sí, cualquier GPU de 4 GB o más |
| IQ2_XXS / IQ2_XS / IQ2_S / IQ2_M | ~1,3-1,7 GB | ~2-3 GB | Sí, desde 4 GB |
| Q2_K / Q2_K_S | ~1,6 GB | ~2-3 GB | Sí, desde 4 GB |
| IQ3_XXS / IQ3_XS / IQ3_S / IQ3_M / Q3_K_S / Q3_K_M / Q3_K_L | ~1,9-2,2 GB | ~3-4 GB | Sí, desde 6 GB |
| IQ4_XS / IQ4_NL | ~2,3 GB | ~3-4 GB | Sí, desde 6 GB |
| Q4_0 / Q4_1 / Q4_K_S / Q4_K_M | ~2,4-2,6 GB | ~4-5 GB | Sí, desde 6 GB |
| Q5_K_S / Q5_K_M | ~2,9-3,0 GB | ~4-6 GB | Sí, desde 8 GB |
| Q6_K | ~3,3 GB | ~5-6 GB | Sí, desde 8 GB |

- VRAM: hay que sumar a los pesos el *KV cache* y el *overhead* del runtime (del orden de 0,5-1,5 GB adicionales según longitud de contexto y tamaño de lote). Como estimación orientativa, un presupuesto de 5-6 GB de VRAM cubre las variantes Q4_K_M con contextos moderados.
- GPU recomendadas: cualquier GPU con 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 2070, RX 6600 XT) ejecuta con holgura las variantes Q4 y Q5. Para las variantes Q6_K o contextos largos conviene una GPU de 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080). GPU de centro de datos (A100, H100) solo tienen sentido si se sirve con *batching* alto o si se integra en un pipeline mayor.
- CPU y Apple Silicon: las variantes de 4 bits o menos funcionan de forma aceptable en CPU moderna con AVX2 y en chips Apple M1/M2/M3 con 8-16 GB de memoria unificada, gracias al diseño *memory-mapped* de GGUF.
- Opciones de despliegue: llama.cpp (referencia directa para este formato), Ollama, LM Studio, koboldcpp, Jan, llama-cpp-python y text-generation-webui (llama.cpp). El soporte de GGUF en vLLM es experimental y limitado; TGI no es la vía adecuada para este formato.
- Latencia y *throughput*: no publicados en la información disponible. Dependen fuertemente de la cuantización, del hardware y del tamaño de lote; cualquier cifra concreta requeriría medición propia.

## Comparativa con modelos similares

Los datos de las alternativas proceden de sus fichas oficiales y se incluyen como referencia; no se dispone de ninguna comparación de rendimiento medida con este modelo concreto.

| Modelo | Parámetros | Contexto | Licencia | Formato y disponibilidad |
|---|---|---|---|---|
| mradermacher/Qwen3-4B-OBLITERATED-repaired-i1-GGUF (este repositorio) | clase 4B (metadato incoherente) | no disponible | no disponible | GGUF, 24 cuantizaciones, 0 descargas |
| Hatsunama/Qwen3-4B-OBLITERATED-repaired (origen directo) | ~4 000 millones | no disponible en la información proporcionada | no disponible | pesos Hugging Face; base de las cuantizaciones de este repo |
| Qwen3-4B (modelo base oficial) | ~4 000 millones | 32 768 tokens nativos, ampliable a 131 072 con RoPE escalado (YaRN) | Apache 2.0 | safetensors; mode card completa y benchmarks publicados por Alibaba |
| Llama-3.2-3B (alternativa de tamaño similar) | 3 210 millones | 128 000 tokens | Llama 3.2 Community License (con restricciones) | safetensors y GGUF de la comunidad |
| Gemma-3-4B (alternativa de tamaño similar) | ~4 000 millones | 128 000 tokens | Gemma Terms of Use | safetensors y GGUF de la comunidad |

Diferencias clave: este repositorio no declara licencia y no publica evaluación alguna, mientras que los modelos oficiales de referencia cuentan con fichas completas, licencia explícita y resultados reproducibles. La ventaja diferencial de este repositorio es exclusivamente el catálogo de cuantizaciones con matrices de importancia, que cubre rangos de compresión extremos (IQ1/IQ2) poco habituales en los GGUF comunitarios estándar.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar que el uso comercial esté permitido. Aunque el modelo base Qwen3-4B es Apache 2.0, el autor de la derivación no ha especificado términos y el repositorio de origen tampoco los detalla en la información disponible.
- Ausencia total de validación comunitaria: 0 descargas y 0 *likes* en el momento del análisis, además de un metadato de tamaño de 0.0 GB que sugiere que los archivos podrían no estar completamente materializados. Conviene verificar la integridad de los archivos antes de cualquier uso.
- Metadatos internamente incoherentes: el campo de parámetros totales (958,716) no cuadra con un modelo de clase 4B. No hay que fiarse de los campos automáticos del repositorio.
- Sesgos: no evaluados ni documentados. Al derivar de un modelo entrenado con datos web a gran escala, hereda los sesgos de género, raza, religión y nacionalidad de esa distribución, y el proceso de abliteration puede ampliar la presencia de contenido estereotipado o dañino.
- Riesgo de alucinación: alto, como en cualquier modelo de 4B de su clase. La eliminación de la dirección de rechazo no reduce la confianza calibrada del modelo, por lo que puede afirmar con seguridad contenidos falsos.
- Seguridad eliminada por diseño: el objetivo declarado implícito es que el modelo no rechace peticiones. No es apto para aplicaciones de cara al público, atención al cliente, educación con menores ni ningún sistema donde una respuesta dañina tenga consecuencias.
- Degradación por cuantización extrema: las variantes IQ1_S, IQ2_XXS y Q3_K_S comprimen muy por debajo de 4 bits por peso. Es esperable una pérdida notable de coherencia, repeticiones y errores factuales; solo se recomiendan para pruebas de estrés.
- Idiomas y contexto no verificados: no se declara la ventana de contexto real ni las lenguas soportadas tras la modificación de pesos. El comportamiento multilingüe del modelo base podría no conservarse.
- Ausencia de benchmarks: no hay ninguna métrica objetiva que permita comparar esta derivación con el Qwen3-4B original ni cuantificar el daño causado por la abliteration.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mradermacher/Qwen3-4B-OBLITERATED-repaired-i1-GGUF
- Modelo de origen de las cuantizaciones: https://huggingface.co/Hatsunama/Qwen3-4B-OBLITERATED-repaired
- Resultados de la búsqueda web: no se encontró ningún enlace relevante sobre el modelo. Las entradas devueltas pertenecían al portal checo de buzones de datos (mojedatovaschranka.cz) y no guardan relación con el repositorio. No se dispone de paper, blog técnico, repositorio de código ni demo asociados.

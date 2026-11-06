# NexusGremlin/Qwen3.8-27B-TURBO-Fable-Fusion-735-882-Heretic-CODER-MAX-MTP-GGUF

## Resumen

Qwen3.8-27B-TURBO-Fable-Fusion-735-882-Heretic-CODER-MAX-MTP-GGUF es un fine-tune de múltiples etapas publicado por el usuario NexusGremlin sobre el modelo base DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU, a su vez derivado de la familia Qwen 3.8 de 27B. Se distribuye exclusivamente en formato GGUF, con cuantizaciones "regulares" y "MTP" (Multi-Token Prediction), generadas con imatrix dual ("DI-MATRIX"). El autor lo presenta como un modelo orientado a razonamiento, código y escritura creativa, con la particularidad de reducir drásticamente la longitud de los bloques de pensamiento (entre la mitad y hasta una décima parte) manteniendo, según afirma, la calidad de salida.

El modelo tiene 26.895.998.464 parámetros (aproximadamente 26,9 mil millones) y se etiqueta como `image-text-to-text`, aunque no se documenta en la información disponible ninguna capacidad de visión más allá de esa etiqueta de pipeline. Los idiomas declarados son inglés y chino. La licencia es Apache 2.0. El repositorio ocupa 389 GB, lo que refleja la gran cantidad de cuantizaciones incluidas.

La relevancia de esta ficha es doble: por un lado, documenta un fine-tune "abliterated/uncensored" con supuestas mejoras en ARC-C y ARC-E según el autor; por otro, sirve como ejemplo de las prácticas de la comunidad de fine-tunes (multi-stage merge, imatrix, MTP) y de sus limitaciones de verificación, ya que las cifras de benchmark proceden exclusivamente de la model card y no de evaluaciones independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen 3.8, según nomenclatura del autor); no se detalla en la información disponible |
| Parametros totales | 26.895.998.464 (≈26,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF en cuantizaciones "regulares" y "MTP" (Multi-Token Prediction), generadas con imatrix dual (DI-MATRIX); se mencionan explícitamente 4 bits (Q4KS) y 8 bits |
| Idiomas soportados | inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo solo GGUF; el base se distribuye en bfloat16) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna más allá de la pertenencia a la familia Qwen 3.8 y de la etiqueta `qwen3_8`, `qwen3_6`, `qwen3_5` en los tags, que sugiere un linaje de merges entre distintas generaciones. El autor describe el proceso como "multi-stage fine tune, multi-fine tune y multi-stage merge", construido sobre el modelo base de DavidAU y entrenado con Unsloth. Se mencionan dos metodologías propietarias del autor: "COLD FUSION" (combinación de un componente denominado "GAIN" con los entrenadores de Unsloth) y "Fable Fusion 711". No se especifica el número de tokens de entrenamiento ni la composición exacta del dataset, aunque se referencian los conjuntos DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets.

El rasgo técnico más destacado es la reducción de los tokens de pensamiento (thinking tokens): el autor afirma una reducción de entre 1/2 y 1/10 según el caso, con una mediana aproximada de 2/3, junto con una reformateo del bloque de razonamiento. También se incluyen cuantizaciones MTP para acelerar la generación. No se documenta el uso de RLHF o DPO, ni innovaciones como atención lineal o decodificación especulativa más allá del MTP en las cuantizaciones. Las afirmaciones sobre rendimiento proceden únicamente de la model card y no se han verificado de forma independiente.

## Capacidades

- Generación de texto generalista, con énfasis declarado en razonamiento y resolución de problemas.
- Generación de código (tags `coder`, `CODER-MAX` en el nombre), sin datos concretos sobre lenguajes soportados.
- Escritura creativa, ficción, narrativa y roleplaying (tags `creative`, `story`, `fiction`, `roleplaying`).
- Modo de pensamiento (thinking/reasoning) con bloques de razonamiento acortados respecto al base.
- Modelo "abliterated/uncensored": se ha eliminado total o parcialmente el filtrado de rechazo, según los tags `heretic`, `uncensored`, `abliterated`.
- Etiqueta de pipeline `image-text-to-text`, lo que sugiere soporte de entrada de imagen, aunque no se detalla en la información disponible.
- Soporte multilingüe limitado a inglés y chino.
- El autor menciona en la model card un rendimiento destacado en tool calling según benchmarks de terceros en la pestaña "community", pero no se aportan cifras en la información disponible.

## Casos de uso

- Generación de código en pipelines de desarrollo: el modelo está etiquetado como `coder` y puede integrarse en asistentes de programación o revisión de código; su formato GGUF permite desplegarlo en estaciones de trabajo con GPU de consumo.
- Escritura creativa y narrativa: adecuado para generación de ficción, guiones y relatos gracias al ajuste específico en escritura creativa y roleplaying, con menor consumo de tokens de pensamiento que el base.
- Roleplaying y personajes conversacionales: el ajuste "uncensored" y los tags de ficción lo orientan a aplicaciones de entretenimiento conversacional sin filtros de contenido.
- Razonamiento con presupuesto de tokens ajustado: la reducción de thinking tokens (mediana ~2/3) lo hace útil en entornos donde la latencia y el coste por token importan, como atención al cliente automatizada o asistentes en tiempo real.
- Despliegue local en hardware de consumo: al distribuirse en GGUF de 4 y 8 bits, puede ejecutarse con llama.cpp u Ollama en GPU consumer, lo que facilita prototipado y uso offline.
- Experimentación en investigación sobre fine-tunes comunitarios: sirve como caso de estudio de merges multi-etapa, imatrix y MTP para quienes investigan técnicas de ajuste eficiente.
- Procesamiento bilingüe inglés-chino: útil para tareas de traducción o generación en esos dos idiomas, aunque no se documenta calidad por idioma.

## Benchmarks y rendimiento

Los únicos datos disponibles proceden de la model card del autor y no han sido verificados de forma independiente:

| Benchmark | Resultado declarado | Contexto |
|---|---|---|
| ARC-C (8 bits) | 735 | Afirmado por el autor; superior a Qwen 3.8 27B en 144 puntos según la card |
| ARC-C (4 bits) | 719 | Afirmado por el autor |
| ARC-E (8 bits) | >880 | Afirmado por el autor |
| Comparativa con Qwen 3.8 27B | Superior en "los 7 benchmarks críticos" | Sin cifras detalladas en la información disponible |
| Comparativa con Qwen 3.6-35B-A3B, Qwen 3.6 27B, Qwen 3.5 27B | Superior en "los 7 benchmarks críticos" | Sin cifras detalladas en la información disponible |

No se han publicado resultados verificables de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (≈26,9 B de parámetros), una cuantización de 4 bits requiere del orden de 14-18 GB de VRAM y una de 8 bits del orden de 27-30 GB, sin contar el contexto.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cabría esperar ejecución en RTX 4090 (24 GB) con cuantizaciones de 4 bits, y en A100/H100 para 8 bits o precisiones mayores.
- Compatibilidad con GPU de consumo: probable en cuantizaciones de 4 bits según el tamaño; el autor afirma que el modelo está pensado para hardware de consumo.
- Opciones de despliegue: llama.cpp y Ollama (el autor indica que el nombre corto permite `ollama pull/run`); el formato GGUF es compatible con otros runners GGUF, aunque no se confirman vLLM ni TGI en la información disponible.
- Latencia y throughput: no disponibles. El autor afirma que las cuantizaciones MTP aceleran la generación de tokens, pero no aporta cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-TURBO-Fable-Fusion-735-882-Heretic-CODER-MAX-MTP-GGUF | ≈26,9 B | no disponible | Apache 2.0 | GGUF | Fine-tune comunitario con reducción de thinking tokens |
| Qwen 3.8 27B (base de referencia citado) | ≈27 B | no disponible | no disponible | no disponible | Referencia del autor; el fine-tune afirma superarlo en 7 benchmarks |
| Qwen 3.6 27B | ≈27 B | no disponible | no disponible | no disponible | Citado como comparable por el autor |
| Qwen 3.6-35B-A3B | ≈35 B (MoE) | no disponible | no disponible | no disponible | Citado como comparable por el autor |

No se dispone de datos independientes para comparar rendimiento real; las comparaciones proceden únicamente de las afirmaciones del autor.

## Limitaciones y advertencias

- Las cifras de benchmark (ARC-C 735/719, ARC-E >880) proceden exclusivamente de la model card y no han sido verificadas de forma independiente; deben tratarse con cautela.
- Modelo "abliterated/uncensored": se ha reducido o eliminado el filtrado de rechazo, lo que implica riesgo de generar contenido ofensivo, ilegal o dañino; no es adecuado para aplicaciones dirigidas al público general sin capas adicionales de moderación.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones de factualidad.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Longitud de contexto no documentada, lo que dificulta planificar aplicaciones con ventanas largas.
- Licencia Apache 2.0 declarada, pero el linaje incluye múltiples fine-tunes comunitarios cuyas condiciones podrían no estar claras; conviene revisar la licencia del modelo base y de los datasets citados antes de uso comercial.
- El repositorio ocupa 389 GB y contiene numerosas cuantizaciones; la descarga completa no es práctica y debe seleccionarse un único archivo GGUF.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, sin validación comunitaria.
- La etiqueta `image-text-to-text` no está respaldada por documentación sobre capacidades de visión en la información disponible.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.

## Enlaces

- Hugging Face: https://huggingface.co/NexusGremlin/Qwen3.8-27B-TURBO-Fable-Fusion-735-882-Heretic-CODER-MAX-MTP-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Fine-tune de referencia del autor (Fable Fusion 711): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Dataset citado: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset citado: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets

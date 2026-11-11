# randomFace2/Qwen3.8-27B-t-f-c-f-735-882-h-GGUF

## Resumen

Qwen3.8-27B-t-f-c-f-735-882-h-GGUF es un fine-tune de la familia Qwen3.8 publicado por el usuario randomFace2 en Hugging Face, derivado del modelo DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU. Se distribuye exclusivamente en formato GGUF con el objetivo de ejecutarse en hardware de consumo mediante llama.cpp y derivados, e incorpora variantes de cuantización "regulares" y "MTP" (multi-token prediction) generadas con imatrix dual. El modelo conserva la licencia Apache 2.0 del linaje Qwen y declara soporte para inglés y chino.

El modelo se presenta como un fine-tune multi-etapa y multi-merge orientado a reducir el consumo de tokens de razonamiento (hasta 1/10 en algunos casos, con una reducción mediana aproximada de dos tercios) sin sacrificar detalle en la salida, además de mejorar el rendimiento en tareas de razonamiento, código y escritura creativa. La model card afirma que supera al Qwen3.8 27B base en siete benchmarks críticos y que alcanza puntuaciones ARC-C de 735 en 8 bits y 719 en 4 bits, si bien estas cifras no están verificadas de forma independiente en la información disponible.

El pipeline declarado es image-text-to-text, aunque la model card no documenta con detalle el componente de visión ni la arquitectura multimodal; el repositorio tiene un tamaño de 389 GB y 26.895.998.464 parámetros totales según los safetensors de referencia. Es relevante para desarrolladores que buscan un modelo de ~27B con razonamiento eficiente en tokens y despliegue local, pero debe tratarse con cautela por la falta de benchmarks reproducibles y por el etiquetado "uncensored/abliterated".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (linaje Qwen3.8; detalles específicos no disponibles) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF en 4 bits y 8 bits (variantes "regulares" y "MTP" con imatrix dual); lista completa de quants no disponible |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 389 GB); bfloat16 mencionado en tags |
| Pipeline declarado | image-text-to-text |
| Modelo base | DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU |
| Datasets de ajuste | DavidAU/Polar-STRICT-Datasets, DavidAU/F451-STRICT-Datasets |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de su pertenencia al linaje Qwen3.8 (transformer decoder-only de aproximadamente 27B parámetros). El autor describe el proceso como un fine-tune multi-etapa, multi-fine-tune y multi-merge, construido sobre el modelo TURBO-Fable-Cold-Fusion, que a su vez aplica los métodos denominados "COLD FUSION" y "FABLE FUSION 711". No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon RLHF o DPO; los datasets Polar-STRICT y F451-STRICT aparecen como fuentes de ajuste sin más detalle.

La innovación declarada principal es la reducción del bloque de razonamiento (thinking block): el autor afirma recortes de entre 1/2 y 1/10 en el número de tokens de pensamiento respecto al Qwen3.8 27B estándar, con una mediana de reducción de aproximadamente dos tercios, junto con una reformateo del bloque de pensamiento y una mejora de la velocidad de generación. Las cuantizaciones MTP (multi-token prediction) y el uso de imatrix dual ("DI-MATRIX") se presentan como técnicas para preservar calidad en baja precisión. No hay información verificable sobre decodificación especulativa, atención lineal ni otras innovaciones arquitectónicas.

## Capacidades

- Generación de texto conversacional y de alta densidad descriptiva, con énfasis declarado en detalle.
- Razonamiento explícito con modo "thinking" reformateado y reducido en tokens.
- Generación de código (etiqueta "coder" y menciones a rendimiento en tool calling en la pestaña community, no verificadas).
- Escritura creativa: ficción, relato, guion, roleplay y "todos los géneros" según los tags del autor.
- Capacidades multimodales declaradas por el pipeline image-text-to-text, sin documentación técnica del componente visual.
- Soporte multilingüe limitado a inglés y chino.
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que sugiere uso mediante APIs de inferencia estándar.
- Fine-tune de tipo "uncensored/abliterated": el autor indica que se han reducido los rechazos, lo que afecta al comportamiento en contenido sensible.

## Casos de uso

- Escritura creativa y generación de ficción: el ajuste está explícitamente orientado a relato, guion y roleplay, con un estilo descriptivo denso; adecuado para borradores de narrativa y generación de variantes argumentales.
- Asistente de razonamiento eficiente en tokens: la reducción del bloque de pensamiento lo hace útil en pipelines donde el coste por token de razonamiento es crítico, como agentes con muchas llamadas encadenadas.
- Despliegue local en estaciones de trabajo con GPU de consumo: al distribuirse en GGUF de 4 y 8 bits, puede ejecutarse con llama.cpp u Ollama en equipos con VRAM limitada, según la cuantización elegida.
- Generación de código asistida en entornos locales: la etiqueta "coder" y el pipeline conversacional permiten integrarlo en asistentes de programación off-line, aunque sin benchmarks de HumanEval publicados en la información disponible.
- Prototipado de agentes conversacionales multi-turno en inglés o chino: el formato GGUF y la compatibilidad con endpoints facilitan pruebas de concepto sin infraestructura dedicada.
- Experimentación en investigación sobre alineación y censura: al ser un modelo "abliterated", sirve para estudiar diferencias de comportamiento respecto a la versión base, siempre con las cautelas éticas y legales correspondientes.
- Generación de contenido creativo multilingüe inglés-chino: útil para localización de narrativa o marketing entre ambos idiomas, con la limitación de que no cubre castellano.

## Benchmarks y rendimiento

La model card cita puntuaciones ARC-C de 735 en 8 bits y 719 en 4 bits, y ARC-E por encima de 880, así como la superación de siete benchmarks críticos frente a Qwen3.8 27B, Qwen3.6-35B-A3B, Qwen3.6 27B y Qwen3.5 27B. Sin embargo, no se proporcionan tablas con los valores concretos de MMLU, HumanEval, GSM8K ni del resto de benchmarks, ni metodología reproducible. Los datos de la pestaña "community" mencionados por el autor no están incluidos en la información proporcionada.

| Benchmark | Resultado declarado | Fuente |
|---|---|---|
| ARC-C (8 bits) | 735 | Model card (no verificado) |
| ARC-C (4 bits) | 719 | Model card (no verificado) |
| ARC-E | >880 | Model card (no verificado) |
| MMLU, HumanEval, GSM8K y otros | no disponible | — |

No se han publicado resultados de benchmarks verificables en la información disponible.

## Requisitos de hardware

- VRAM estimada: para ~27B parámetros, una cuantización de 4 bits requiere del orden de 14-16 GB de VRAM (más overhead de contexto); 8 bits requiere aproximadamente 27-30 GB. Cálculos orientativos, no confirmados por el autor.
- GPU recomendadas: para 8 bits, A100 40 GB, H100 o RTX A6000; para 4 bits, RTX 4090 (24 GB) o RTX 3090 son suficientes en teoría.
- GPU de consumo: sí cabe en RTX 4090/3090 con cuantización de 4 bits; en 8 bits no cabe en GPU de consumo de 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python o LM Studio). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que su uso requeriría convertir los pesos.
- Latencia y throughput: no disponibles; el autor afirma mejoras de velocidad por la reducción de tokens de pensamiento, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-t-f-c-f-735-882-h (este) | ~26,9B | no disponible | Apache 2.0 | GGUF | Fine-tune "uncensored", razonamiento reducido, solo en/zh |
| Qwen3.8 27B base | ~27B | no disponible | Apache 2.0 (linaje Qwen) | safetensors/GGUF | Referencia del autor; superado según la model card en 7 benchmarks (no verificado) |
| Qwen3.6 27B | ~27B | no disponible | no disponible | no disponible | Citado como comparación por el autor |
| Qwen3.6-35B-A3B | ~35B (MoE, 3B activos) | no disponible | no disponible | no disponible | Citado como comparación por el autor |

No se dispone de datos verificables de rendimiento ni de contexto para establecer una comparación cuantitativa fiable con alternativas.

## Limitaciones y advertencias

- Ausencia de benchmarks reproducibles: las cifras de ARC-C y las afirmaciones de superioridad frente a modelos base no están respaldadas por metodología pública en la información disponible.
- Modelo "uncensored/abliterated": se han reducido deliberadamente los mecanismos de rechazo, lo que incrementa el riesgo de generar contenido inapropiado, sesgado o dañino; no apto para producción sin filtros adicionales.
- Riesgo de alucinación: inherente a los modelos de lenguaje de este tamaño, agravado por el énfasis en escritura creativa y por la falta de evaluación independiente.
- Idiomas limitados a inglés y chino: no hay soporte declarado de castellano, por lo que su uso en español no está garantizado.
- Longitud de contexto no documentada: no es posible planificar cargas de contexto largo con garantías.
- Licencia Apache 2.0 heredada del linaje Qwen, pero el autor no aclara restricciones adicionales derivadas de los datasets de ajuste (Polar-STRICT, F451-STRICT); conviene revisar las licencias de esos datasets antes de un uso comercial.
- Repositorio de 389 GB: requiere espacio de almacenamiento considerable y descarga selectiva de la cuantización deseada.
- Cero descargas y cero likes en el momento de la ficha: sin validación comunitaria ni evidencia de uso en producción.
- El pipeline image-text-to-text no está documentado técnicamente; no debe asumirse un rendimiento multimodal fiable.

## Enlaces

- Hugging Face: https://huggingface.co/randomFace2/Qwen3.8-27B-t-f-c-f-735-882-h-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Perfil del autor del fine-tune original: https://huggingface.co/DavidAU
- Colecciones de DavidAU: https://huggingface.co/DavidAU/collections
- FAQs y soporte de DavidAU: https://huggingface.co/DavidAU/support
- Dataset Polar-STRICT: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451-STRICT: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets

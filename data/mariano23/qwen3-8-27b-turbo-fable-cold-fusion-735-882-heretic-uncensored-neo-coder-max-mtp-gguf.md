# Mariano23/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF

## Resumen

Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF es una cuantización GGUF publicada por el usuario Mariano23 sobre el fine-tune de DavidAU `Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU`. El modelo subyacente parte de la familia Qwen 3.8 (27B) y ha sido sometido a un proceso de ajuste multietapa y fusión de estados ("multi-stage-tune", "multi-state-merge") con los datasets propios del autor (Polar-STRICT y F451-STRICT). El resultado se presenta como un modelo "herético" (abliterated/uncensored), orientado a razonamiento, código y escritura creativa sin las restricciones de alineamiento habituales.

La innovación que el autor destaca es el modo "TURBO": una reducción drástica de los tokens de pensamiento (entre la mitad y hasta una décima parte respecto al Qwen 3.8 27B estándar) manteniendo, según afirma, el detalle y la calidad de salida. El autor reclama que la versión en 8 bits alcanza 735 en ARC-C y 880 en ARC-E, y que la versión en 4 bits supera 718 en ARC-C, cifras que sitúan al modelo, siempre según la model card, en el rango de los modelos propietarios de OpenAI, Anthropic y Google. Estas cifras no están verificadas de forma independiente en la información disponible.

El repositorio contiene cuantizaciones GGUF "regulares" y "MTP" (multi-token prediction) con doble imatrix (DI-MATRIX). Está pensado para ejecución en hardware de consumo y declara licencia Apache 2.0. El pipeline declarado es image-text-to-text y el modelo cubre 16 idiomas, entre ellos el español.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen 3.8); detalles internos no disponibles |
| Parametros totales | 26.895.998.464 (26,9B) |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF en varias cuantizaciones: 4 bits (Q4KS, Q4, con y sin imatrix) y 8 bits; variantes "regulares" y "MTP" (multi-token prediction) |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 389 GB con múltiples quants); el modelo base se distribuye en bfloat16 |

## Arquitectura y entrenamiento

El modelo es un transformer derivado de la familia Qwen 3.8, con 26,9B parámetros. Sobre esa base, DavidAU aplica un pipeline de ajuste fino multietapa y fusión de estados ("multi-stage-tune", "multi-state-merge"), entrenado con Unsloth y con los datasets propios Polar-STRICT y F451-STRICT. El autor denomina al método "COLD FUSION AND FABLE FUSION 711". La model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset.

El ajuste incluye dos componentes diferenciados. Por un lado, el componente "herético" (abliterated/uncensored) elimina total o parcialmente las capas de rechazo del modelo original. Por otro, el componente "TURBO" está específicamente orientado a corregir el sobre-razonamiento y el consumo excesivo de tokens: según el autor, reduce los tokens de pensamiento entre un 50 % y un 90 % respecto al Qwen 3.8 27B estándar, manteniendo el detalle de salida. Las cuantizaciones MTP incorporan multi-token prediction, y las variantes DI-MATRIX emplean doble imatrix para calibrar la cuantización. No se dispone de información sobre el uso de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento en modo "thinking", con reducción significativa de tokens de pensamiento respecto al modelo base.
- Generación de código: el sufijo "CODER" y las etiquetas del repositorio indican ajuste específico para programación.
- Escritura creativa, narrativa y roleplaying en múltiples géneros, con un estilo marcado y sin filtros de contenido.
- Capacidad multimodal de entrada: el pipeline declarado es image-text-to-text, aunque la model card no detalla la arquitectura de visión.
- Soporte multilingüe en 16 idiomas, incluido el español.
- El autor menciona en la model card un rendimiento destacado en tool calling, citando benchmarks de terceros en la pestaña "community"; estos datos no están disponibles en la información proporcionada.
- Comportamiento sin censura (uncensored/abliterated): no aplica rechazos por contenido.
- No se documentan capacidades de audio ni de agente multi-paso más allá de lo indicado.

## Casos de uso

- Escritura creativa y narrativa: el ajuste está explícitamente orientado a ficción, relatos y roleplaying; el modo TURBO reduce la latencia en la generación de textos largos al recortar los tokens de pensamiento.
- Generación de código en local: el ajuste "CODER" y las cuantizaciones de 4 bits permiten integrarlo en entornos de desarrollo con GPU de consumo para autocompletado y generación de funciones.
- Asistentes conversacionales sin filtros: útil en investigación sobre alineamiento, red-teaming y evaluación de comportamientos no censurados, donde se necesita un modelo que no rechace peticiones.
- Razonamiento con presupuesto de tokens ajustado: el modo TURBO resulta adecuado para pipelines donde el coste por token de salida es crítico, como clasificación con justificación o extracción estructurada.
- Despliegue en hardware de consumo: las cuantizaciones GGUF de 4 bits permiten ejecución en estaciones de trabajo con GPU de gama alta de consumo mediante llama.cpp u Ollama.
- Prototipado multilingüe: con 16 idiomas declarados, sirve para pruebas de aplicaciones de traducción o atención al cliente en mercados diversos.
- Experimentación con decodificación multi-token: las variantes MTP permiten evaluar técnicas de predicción multi-token en entornos de investigación.

## Benchmarks y rendimiento

Los datos proceden exclusivamente de las afirmaciones del autor en la model card; no se han verificado de forma independiente.

| Benchmark | Resultado declarado | Notas |
|---|---|---|
| ARC-C (8 bits) | 735 | Según el autor, 144 puntos por encima de Qwen 3.8 27B |
| ARC-C (4 bits) | 719 (más de 718) | Cuantización de 4 bits |
| ARC-E (8 bits) | 880 | Zona que el autor atribuye a OpenAI, Claude y Gemini |

El autor afirma que el modelo supera al Qwen 3.8 27B base y a Qwen 3.6-35B-A3B, Qwen 3.6 27B y Qwen 3.5 27B en siete benchmarks críticos, pero no se detallan los nombres ni los valores de esos siete benchmarks en la información disponible. Tampoco hay datos publicados de MMLU, HumanEval o GSM8K en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: en cuantización de 4 bits, aproximadamente 15-18 GB; en 8 bits, aproximadamente 28-30 GB (estimación a partir de los 26,9B parámetros; no confirmada por el autor).
- GPU recomendadas: para 8 bits, A100 40 GB, H100 o RTX 4090 (24 GB, justo al límite); para 4 bits, RTX 4090, RTX 3090 (24 GB) o RTX 4080 (16 GB, ajustado).
- Cabe en GPU de consumo en cuantización de 4 bits; en 8 bits requiere GPU profesional o de gama alta con 32 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; el repositorio incluye la etiqueta "endpoints_compatible".
- Latencia y throughput: no disponibles. El autor afirma que el modo TURBO reduce los tokens de pensamiento entre un 50 % y un 90 %, lo que se traduce en menor latencia, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (Qwen3.8-27B TURBO Heretic) | 26,9B | no disponible | Apache 2.0 | Fine-tune sin censura con modo TURBO; benchmarks solo declarados por el autor |
| Qwen 3.8 27B (base) | 27B | no disponible | Apache 2.0 | Modelo original; el autor afirma que este fine-tune lo supera en siete benchmarks |
| Qwen 3.6 27B | 27B | no disponible | Apache 2.0 | Generación anterior de la familia; el autor afirma que este fine-tune lo supera |
| Qwen 3.6-35B-A3B | 35B totales (MoE) | no disponible | Apache 2.0 | MoE de la generación anterior; el autor afirma que este fine-tune lo supera |

No se dispone de datos independientes que permitan una comparación rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo abliterated/uncensored: no aplica rechazos de contenido, por lo que puede generar material ofensivo, ilegal o peligroso; no es apto para aplicaciones orientadas al público sin capas de moderación adicionales.
- Los benchmarks son afirmaciones del autor no verificadas de forma independiente; deben tratarse con cautela.
- No se documenta la longitud de contexto, lo que dificulta planificar su uso en tareas de contexto largo.
- El autor reconoce explícitamente el riesgo de sobre-razonamiento en el modelo base; el modo TURBO lo mitiga, pero puede reducir la profundidad en tareas de razonamiento complejo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día: no hay evidencia de uso en producción.
- El tamaño del repositorio (389 GB) implica un coste de almacenamiento considerable para descargar varias cuantizaciones.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base y de los datasets de entrenamiento antes de un uso comercial.
- El pipeline declarado es image-text-to-text, pero la model card no detalla la arquitectura de visión ni su calidad; no debe asumirse un rendimiento multimodal equiparable al de modelos especializados.
- Riesgo de alucinación inherente a los modelos de lenguaje, agravado por el ajuste orientado a la creatividad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Mariano23/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Perfil del autor del fine-tune: https://huggingface.co/DavidAU
- Colección Turbo Brilliance: https://huggingface.co/collections/DavidAU/turbo-brilliance-ai-constructs-50x-reasoning-instruct
- Dataset Polar-STRICT: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451-STRICT: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
- Página de soporte del autor: https://huggingface.co/DavidAU/support

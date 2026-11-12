# seetag/Qwen3.8-27B-TFCF-735-882-HU-NEO-CODER-MAX-MTP-GGUF

## Resumen

Qwen3.8-27B-TFCF-735-882-HU-NEO-CODER-MAX-MTP-GGUF es una cuantización GGUF publicada por el usuario seetag sobre el fine-tune de DavidAU `Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU`, que a su vez deriva de la familia Qwen 3.x de 27B. El modelo se distribuye como un conjunto de cuantizaciones "regular" y "MTP" (Multi-Token Prediction) generadas con Unsloth, con doble imatrix (DI-MATRIX) y orientadas tanto a uso general como a generación de código. El pipeline declarado es image-text-to-text, aunque el modelo base y los tags apuntan a un transformer de texto con capacidades multimodales heredadas de la familia Qwen.

El autor del fine-tune original presenta el modelo como un ajuste multi-etapa y multi-merge cuyo objetivo declarado es triple: aumentar la inteligencia general y la resolución de problemas, reducir drásticamente el número de tokens de "thinking" (entre 1/2 y 1/10, con una reducción mediana aproximada de 2/3) y reformatear el comportamiento de razonamiento. El nombre "735-882" hace referencia a las puntuaciones ARC-C y ARC-E que el autor atribuye al modelo en 8 bits, y "Heretic Uncensored" indica que se ha aplicado abliteration para eliminar rechazos.

La relevancia actual es doble: por un lado, es un ejemplo de la práctica de fine-tunes comunitarios sobre modelos Qwen con licencia Apache 2.0, publicados en GGUF para hardware de consumo; por otro, la model card contiene afirmaciones de rendimiento muy agresivas (superar a Qwen 3.8 27B, Qwen 3.6 27B y Qwen 3.5 27B en siete benchmarks) que no están respaldadas por resultados reproducibles en la información disponible. El repositorio pesa 389 GB y el modelo tiene 26.895.998.464 parámetros (aproximadamente 26,9B).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen 3.x (detalles exactos no disponibles); pipeline declarado image-text-to-text |
| Parametros totales | 26.895.998.464 (aprox. 26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | GGUF "regular" y GGUF "MTP" (Multi-Token Prediction); cuantizaciones de 4 y 8 bits mencionadas en la model card; imatrix doble (DI-MATRIX) |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repositorio de cuantizaciones); el modelo base se distribuye en bfloat16 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Qwen 3.x con aproximadamente 26,9B parámetros, sin indicios de ser un modelo MoE (no se declaran parámetros activos). El pipeline declarado es image-text-to-text, lo que sugiere que el modelo base conserva capacidades de entrada de imagen, aunque la model card no detalla el componente visual ni el tokenizador multimodal. El fine-tune original se describe como "multi-stage tune" y "multi-state merge", construido mediante los métodos que el autor denomina "COLD FUSION" y "FABLE FUSION 711", sobre datasets propietarios `DavidAU/Polar-STRICT-Datasets` y `DavidAU/F451-STRICT-Datasets`.

El entrenamiento se realizó con Unsloth, según los tags y la model card, y se aplicó abliteration ("heretic", "uncensored", "abliterated") para eliminar comportamientos de rechazo. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo RLHF o DPO. La innovación técnica declarada es la reducción del bloque de razonamiento ("thinking") entre 1/2 y 1/10 respecto al Qwen 3.8 27B original, con una mediana de reducción de aproximadamente 2/3, manteniendo el detalle de salida. Las cuantizaciones MTP incorporan soporte de Multi-Token Prediction, y las DI-MATRIX usan dos matrices de importancia para mejorar la calidad de la cuantización.

## Capacidades

- Generación de texto general, razonamiento y resolución de problemas, con modo "thinking" explícito y reducción de tokens de razonamiento respecto al base.
- Generación de código: el sufijo "CODER MAX" y los tags "coder" indican ajuste específico para tareas de programación.
- Escritura creativa: ficción, narrativa, guiones, roleplaying y "all genres", según los tags del autor.
- Entrada image-text-to-text declarada en el pipeline, aunque sin detalles sobre el soporte visual efectivo.
- Multilingüe: 16 idiomas declarados (árabe, chino, inglés, francés, alemán, hindi, indonesio, italiano, japonés, coreano, polaco, portugués, ruso, español, tailandés y vietnamita).
- Comportamiento "uncensored"/abliterated: el modelo está ajustado para reducir rechazos, lo que afecta a su comportamiento en contenido sensible.
- Tool calling y function calling: la model card menciona "strongest tool calling performance ever recorded" en la pestaña community, pero no se aportan datos verificables en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado con datos en la información proporcionada.

## Casos de uso

- Generación de código en producción: el ajuste "CODER MAX" y el soporte GGUF permiten desplegar el modelo con llama.cpp u Ollama en estaciones de trabajo para autocompletado, refactorización y generación de tests, con la ventaja de que las cuantizaciones de 4 bits reducen los requisitos de VRAM.
- Escritura creativa y narrativa: los tags "creative writing", "story", "fiction" y "roleplaying" indican un ajuste específico para generar ficción y diálogos; el modo thinking reducido acelera la producción de borradores largos.
- Asistente conversacional multilingüe: con 16 idiomas declarados, puede usarse en atención al cliente o soporte interno en entornos hispanohablantes y multilingües, aunque la calidad por idioma no está verificada.
- Prototipado e investigación sobre modelos abliterated: útil para estudiar el efecto de la abliteration y del ajuste de razonamiento en el comportamiento del modelo, comparándolo con el base Qwen 3.8 27B.
- Generación de documentación técnica y explicaciones: el modo thinking reducido y el ajuste "all use cases" lo hacen adecuado para tareas de resumen y explicación de código en pipelines de documentación.
- Experimentación con cuantizaciones MTP: las variantes MTP permiten evaluar el impacto de Multi-Token Prediction en latencia y throughput frente a las cuantizaciones regulares, en entornos de investigación con hardware de consumo.
- Roleplaying y generación de personajes: el ajuste "uncensored" y los tags de ficción lo orientan a aplicaciones de entretenimiento y narrativa interactiva, con las advertencias de contenido que ello implica.

## Benchmarks y rendimiento

La model card cita puntuaciones ARC-C y ARC-E (735 en ARC-C y 882 en ARC-E en 8 bits; 719 en ARC-C en 4 bits) y afirma superar a Qwen 3.8 27B, Qwen 3.6 27B, Qwen 3.6-35B-A3B y Qwen 3.5 27B en siete benchmarks. Sin embargo, no se presentan tablas con los resultados completos, la metodología de evaluación ni los valores de los modelos comparados en la información disponible, por lo que estas cifras no son verificables.

| Benchmark | Resultado declarado | Notas |
|---|---|---|
| ARC-C (8 bits) | 735 | Afirmación del autor; sin metodología detallada |
| ARC-E (8 bits) | 882 | Afirmación del autor; sin metodología detallada |
| ARC-C (4 bits) | 719 | Afirmación del autor; sin metodología detallada |
| MMLU, HumanEval, GSM8K y otros | no disponible | No se aportan resultados en la información proporcionada |

No se han publicado resultados de benchmarks verificables en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; para 26,9B parámetros, una cuantización de 4 bits requiere aproximadamente 14-16 GB de VRAM, y una de 8 bits en torno a 27-30 GB, estimaciones basadas en el tamaño del modelo y no en datos del autor.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 4090 (24 GB) podría ejecutar cuantizaciones de 4 bits, y una A100 40/80 GB o H100 para 8 bits y contextos largos.
- Cabe en GPU de consumo: probablemente en RTX 4090, RTX 3090 y GPUs con 16 GB o más para cuantizaciones de 4 bits; no confirmado por el autor.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; el tag "endpoints_compatible" sugiere compatibilidad con endpoints de Hugging Face. No se confirma soporte de vLLM o TGI para estas cuantizaciones.
- Latencia y throughput: no disponibles; el autor afirma que el modelo es "más rápido" que el Qwen 3.8 27B base gracias a la reducción de tokens de thinking, pero sin cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (seetag/Qwen3.8-27B-...-GGUF) | 26,9B | no disponible | Apache 2.0 | GGUF | Fine-tune comunitario con abliteration y ajuste de razonamiento |
| Qwen 3.8 27B (base de referencia) | 27B (aprox.) | no disponible | Apache 2.0 (según familia Qwen) | safetensors, GGUF | Modelo original; el autor afirma superarlo en 7 benchmarks |
| Qwen 3.6 27B | 27B (aprox.) | no disponible | Apache 2.0 (según familia Qwen) | safetensors, GGUF | Generación anterior de la familia; comparación citada por el autor |
| Qwen 3.6-35B-A3B | 35B totales / 3B activos (MoE) | no disponible | Apache 2.0 (según familia Qwen) | safetensors, GGUF | Alternativa MoE de mayor tamaño total y menor coste de inferencia |

Los datos de contexto, benchmarks y disponibilidad de los modelos comparados no se detallan en la información proporcionada; las comparaciones de rendimiento son afirmaciones del autor no verificadas.

## Limitaciones y advertencias

- Las afirmaciones de rendimiento (ARC-C 735, ARC-E 882, superación de Qwen 3.8/3.6/3.5 en siete benchmarks) no están respaldadas por tablas, metodología ni resultados reproducibles en la información disponible.
- El modelo ha sido sometido a abliteration ("heretic", "uncensored"), lo que elimina mecanismos de rechazo y aumenta el riesgo de generar contenido ofensivo, ilegal o dañino; no es adecuado para aplicaciones de cara al público sin filtros adicionales.
- Riesgo de alucinación inherente a los modelos de 27B y potencialmente agravado por el ajuste "uncensored", que reduce la cautela del modelo.
- El repositorio pesa 389 GB, lo que implica un coste de almacenamiento y descarga considerable; conviene descargar solo la cuantización necesaria.
- No se especifican la longitud de contexto ni los detalles del componente multimodal, pese al pipeline image-text-to-text declarado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los datasets de entrenamiento pueden tener condiciones adicionales no detalladas; conviene verificar la licencia del modelo base de DavidAU.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria ni benchmarks de terceros verificables.
- La reducción de tokens de thinking puede degradar la calidad en tareas que requieren razonamiento profundo; el autor no aporta evaluaciones por tipo de tarea.
- El ajuste está orientado a escritura creativa y código, lo que puede implicar un sesgo de estilo y una menor adecuación para tareas analíticas o de dominio especializado.

## Enlaces

- Hugging Face: https://huggingface.co/seetag/Qwen3.8-27B-TFCF-735-882-HU-NEO-CODER-MAX-MTP-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Perfil del autor del fine-tune: https://huggingface.co/DavidAU
- Colecciones de DavidAU: https://huggingface.co/DavidAU/collections
- FAQs de DavidAU: https://huggingface.co/DavidAU/support
- Dataset Polar-STRICT: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451-STRICT: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
- Unsloth: https://huggingface.co/unsloth

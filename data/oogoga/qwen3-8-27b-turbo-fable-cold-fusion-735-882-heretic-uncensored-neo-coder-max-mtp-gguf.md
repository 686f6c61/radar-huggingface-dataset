# OOGOGA/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF

## Resumen

Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF es un fine-tune de la familia Qwen 3.8 de 27B de parámetros, publicado por OOGOGA como reempaquetado en GGUF de un modelo base desarrollado por DavidAU. El modelo parte de `DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU` y se distribuye en cuantizaciones GGUF "regular" y "MTP" (multi-token prediction) con matrices de cuantización duales (DI-MATRIX, doble imatrix), además de una variante denominada "Turbo Brilliance 50x V2 AGI". El pipeline declarado es `image-text-to-text`, lo que indica soporte multimodal de entrada imagen+texto.

El modelo se presenta como un fine-tune multi-etapa orientado a razonamiento, código, escritura creativa y roleplay, con eliminación de censura ("heretic"/"abliterated") y una reducción agresiva de los tokens de pensamiento (entre 1/2 y 1/10 frente al Qwen 3.8 27B estándar) manteniendo, según el autor, el detalle y la calidad de salida. El tamaño real de parámetros es de 26.895.998.464 (≈26,9B), y el repositorio ocupa 492,8 GB por la multiplicidad de cuantizaciones incluidas.

Su relevancia radica en que, según la model card, es el primer fine-tune de este tamaño en superar 730 puntos en ARC-C en 8 bits (735) y 719 en 4 bits, además de 880 en ARC-E, cifras que el autor sitúa en la "zona de inteligencia" de modelos cerrados como OpenAI, Claude y Gemini. No obstante, estas cifras proceden exclusivamente de la documentación del autor y no se han verificado de forma independiente en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.8), fine-tune multi-etapa; soporte multimodal image-text-to-text |
| Parametros totales | 26.895.998.464 (≈26,9B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF en 4 bits y 8 bits; variantes "regular" y "MTP"; cuantizaciones DI-MATRIX con doble imatrix; variante "Turbo Brilliance 50x V2 AGI" |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi (16 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de cuantizaciones); el modelo base se distribuye en bfloat16 |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Qwen 3.8 con aproximadamente 26,9B de parámetros, sometido a un proceso de fine-tune multi-etapa ("multi-stage tuned", "multi-state-merge") que el autor denomina métodos "COLD FUSION" y "FABLE FUSION 711". El entrenamiento se realizó, según la model card, sobre hardware de consumo mediante Unsloth, y emplea los datasets `DavidAU/Polar-STRICT-Datasets` y `DavidAU/F451-STRICT-Datasets`. El pipeline declarado `image-text-to-text` sugiere que el modelo conserva capacidades de entrada multimodal heredadas de su base.

La innovación técnica principal es la reducción de tokens de razonamiento: el autor afirma que el modelo consume entre la mitad y una décima parte de los tokens de pensamiento del Qwen 3.8 27B original en los tres modos de operación, manteniendo el detalle de salida. Las cuantizaciones incorporan matrices de importancia duales (DI-MATRIX, doble imatrix) y una variante MTP (multi-token prediction). El modelo ha sido sometido a un proceso de "abliteration"/"heretic" para eliminar los mecanismos de rechazo y censura del modelo base. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Generación de texto generalista y conversacional multi-turno.
- Razonamiento explícito con modo "thinking" y reducción de tokens de pensamiento frente al modelo base.
- Generación de código (etiqueta "coder", "NEO-CODER MAX").
- Escritura creativa: ficción, relatos, todos los géneros, roleplay y narrativa larga.
- Entrada multimodal imagen+texto (pipeline `image-text-to-text`).
- Capacidades multilingües en 16 idiomas, incluido el español.
- Modelo "uncensored"/"abliterated": sin mecanismos de rechazo ante contenido sensible.
- Soporte declarado para "todos los casos de uso" según las etiquetas del autor.
- Compatibilidad con endpoints (`endpoints_compatible`) para despliegue como servicio.
- No se documenta explícitamente soporte de tool calling ni de agentes multi-paso en la información disponible, aunque la model card remite a la pestaña "community" para supuestos benchmarks de tool calling.

## Casos de uso

- Escritura creativa y narrativa larga: el modelo está afinado específicamente para ficción, relatos y todos los géneros, con un estilo de salida detallado y directo, adecuado para generar borradores extensos o asistir en la construcción de tramas y personajes.
- Roleplay y personajes conversacionales: la combinación de fine-tune creativo, ausencia de censura y contexto conversacional lo hace apto para motores de personajes en aplicaciones de entretenimiento interactivo.
- Generación de código en local: la variante "NEO-CODER MAX" y el formato GGUF permiten ejecutarlo en estaciones de trabajo con GPU de consumo para autocompletado, generación de funciones y refactorización dentro de editores o scripts.
- Razonamiento con presupuesto de tokens ajustado: gracias a la reducción de tokens de pensamiento (hasta 1/10), resulta adecuado para pipelines donde el coste por token o la latencia importan, como clasificación con justificación, extracción estructurada o resolución de problemas matemáticos paso a paso.
- Despliegue en hardware de consumo con llama.cpp u Ollama: al distribuirse en GGUF de 4 y 8 bits, permite inferencia local en GPU de gama alta de consumo sin depender de servicios en la nube, útil para prototipado y entornos con requisitos de privacidad.
- Descripción y análisis de imágenes: al conservar el pipeline image-text-to-text, puede emplearse para generar descripciones, alt-text o análisis de capturas y documentos escaneados en aplicaciones de accesibilidad o gestión documental.
- Asistencia multilingüe: con 16 idiomas soportados, incluyendo español, árabe, chino, japonés o coreano, sirve para traducción asistida, atención al cliente multilingüe o generación de contenido localizado.

## Benchmarks y rendimiento

Los únicos datos disponibles proceden de la model card del autor y no se han verificado de forma independiente. Se presentan tal cual, sin comparación numérica con otros modelos porque la información no incluye una tabla completa de resultados por benchmark.

| Benchmark | Resultado declarado | Notas |
|---|---|---|
| ARC-C (8 bits) | 735 | 144 puntos por encima del Qwen 3.8 27B según el autor |
| ARC-C (4 bits) | 719 | Supera los 718 en 4 bits según el autor |
| ARC-E | 880 | "Zona de inteligencia" de modelos cerrados según el autor |

El autor afirma que el modelo supera al Qwen 3.8 27B base y a los Qwen 3.6-35B-A3B, Qwen 3.6 27B y Qwen 3.5 27B en "los 7 benchmarks críticos", pero no se detallan los nombres ni los valores de esos siete benchmarks en la información disponible. Tampoco se han publicado resultados de MMLU, HumanEval o GSM8K en la documentación proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: en cuantización de 4 bits, aproximadamente 16-20 GB (26,9B parámetros × ~0,5-0,6 bytes/parámetro más overhead de contexto); en 8 bits, aproximadamente 28-32 GB.
- GPU recomendadas: para 4 bits, RTX 4090 (24 GB), RTX 3090 (24 GB) o RTX 5090; para 8 bits, A100 40 GB, H100 o configuraciones multi-GPU de consumo.
- Cabe en GPU de consumo: sí, en 4 bits en tarjetas de 24 GB; en 8 bits requiere 32 GB o más, por lo que no cabe en una única GPU de consumo estándar.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia tipo TGI o vLLM (aunque vLLM requiere formatos alternativos). El tamaño del repositorio (492,8 GB) obliga a descargar solo la cuantización deseada.
- Latencia y throughput: no disponibles. La reducción de tokens de pensamiento declarada por el autor (1/2 a 1/10) implica una mejora proporcional en latencia percibida para tareas de razonamiento, pero no se aportan cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-TURBO... (este) | 26,9B | no disponible | Apache 2.0 | GGUF | Fine-tune multi-etapa, uncensored, reducción de thinking tokens |
| Qwen 3.8 27B (base) | ~27B | no disponible | Apache 2.0 | safetensors, GGUF | Modelo original; el autor afirma que este fine-tune lo supera en 7 benchmarks |
| Qwen 3.6 27B | ~27B | no disponible | Apache 2.0 | safetensors, GGUF | Generación anterior de la familia; superado según el autor |
| Qwen3.6-35B-A3B | 35B (MoE) | no disponible | Apache 2.0 | safetensors, GGUF | Modelo MoE de la familia; superado según el autor |

No se dispone de datos de contexto ni de benchmarks independientes para establecer una comparación cuantitativa fiable. Las afirmaciones de superioridad proceden únicamente de la model card.

## Limitaciones y advertencias

- Las cifras de benchmarks (ARC-C 735/719, ARC-E 880) proceden exclusivamente del autor y no se han verificado de forma independiente; deben tratarse con cautela.
- Modelo "uncensored"/"abliterated": no aplica filtros de rechazo, por lo que puede generar contenido ofensivo, violento, sexual o legalmente sensible. Requiere moderación externa en producción.
- Riesgo de alucinación inherente a los modelos de 27B, agravado por el fine-tune orientado a creatividad y por la reducción de tokens de pensamiento, que puede recortar la verificación interna.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los datasets de terceros pueden imponer condiciones adicionales que deben revisarse antes de un despliegue comercial.
- No se documenta la longitud de contexto soportada, lo que impide planificar tareas de contexto largo con garantías.
- El repositorio mezcla múltiples cuantizaciones (492,8 GB), lo que puede confundir la selección del archivo correcto; conviene descargar únicamente el GGUF necesario.
- El pipeline `image-text-to-text` está declarado, pero no se detallan las capacidades de visión ni su calidad; conviene validarlas empíricamente.
- El modelo es un reempaquetado de terceros (OOGOGA) de un fine-tune de DavidAU; la trazabilidad y el soporte dependen de la cadena de autoría.
- El uso de hardware de consumo para el entrenamiento y la ausencia de documentación sobre datos y métodos de alineación dificultan la evaluación de sesgos.

## Enlaces

- Hugging Face: https://huggingface.co/OOGOGA/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Perfil del autor original: https://huggingface.co/DavidAU
- Colecciones de DavidAU: https://huggingface.co/DavidAU/collections
- Variante Turbo Brilliance 27B Heretic v2: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-GGUF
- Variante Turbo Brilliance 27B no-Heretic v1: https://huggingface.co/DavidAU/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-NEO-MAX-MTP-GGUF
- Variante 180B QNext Heretic: https://huggingface.co/DavidAU/Qwen3.8-Flash-Next-Abliterated-Uncensored-Turbo-Brilliance-50x-Reasoning-Instruct-GSQ-RCO-GGUF
- Variante 180B QNext no-Heretic: https://huggingface.co/DavidAU/Qwen3.8-Flash-Next-Turbo-Brilliance-50x-Reasoning-Instruct-GSQ-RCO-GGUF
- Colección Turbo Brilliance: https://huggingface.co/collections/DavidAU/turbo-brilliance-ai-constructs-50x-reasoning-instruct
- Página de soporte/FAQs del autor: https://huggingface.co/DavidAU/support

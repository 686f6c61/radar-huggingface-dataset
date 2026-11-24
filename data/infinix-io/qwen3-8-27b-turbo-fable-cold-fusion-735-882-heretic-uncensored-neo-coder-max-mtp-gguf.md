# Infinix-io/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF

## Resumen

Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF es una cuantización GGUF publicada por el usuario Infinix-io a partir de un fine-tune de DavidAU, que a su vez deriva de la familia Qwen 3.8 de 27B. El modelo es un ajuste multi-etapa (multi-stage tune y multi-state merge) con técnicas de "abliteration" y "heretic" que eliminan total o parcialmente los mecanismos de rechazo del modelo base, orientado a usos creativos sin restricciones, roleplay, escritura de ficción y codificación.

El repositorio contiene cuantizaciones GGUF tanto "regulares" como "MTP" (multi-token prediction) y una variante adicional denominada "Turbo Brilliance 50x V2 AGI". Según la model card, el ajuste reduce el consumo de tokens de razonamiento entre un 50 % y un 90 % respecto al Qwen 3.8 27B original, manteniendo la calidad de salida, y declara superar al modelo base en siete benchmarks críticos, con un ARC-C de 735 en 8 bits y 719 en 4 bits.

El modelo tiene 26.895.998.464 parámetros (aproximadamente 26,9 mil millones), licencia Apache 2.0 y soporte declarado para 16 idiomas, incluido el español. El tamaño del repositorio (492,8 GB) refleja la presencia de múltiples cuantizaciones y variantes en un mismo espacio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Qwen 3.8 27B (detalles internos no disponibles) |
| Parametros totales | 26.895.998.464 (≈26,9 B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF en varias precisiones (4 bits y 8 bits mencionados explícitamente; "regular" y "MTP"; variante "Turbo Brilliance 50x V2"), catálogo completo no disponible |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo con cuantizaciones); el modelo base intermedio se distribuye en bfloat16, pero este repo es exclusivamente GGUF |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de su origen en la familia Qwen 3.8 de 27B, por lo que se asume un transformer decoder-only estándar con atención completa; no se confirma el uso de atención lineal, SSM ni arquitecturas híbridas. El autor describe el proceso como un "multi-stage tune" y "multi-state merge" construido sobre el modelo DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU, empleando los métodos que denomina "COLD FUSION" y "FABLE FUSION 711", y entrenado con Unsloth sobre hardware de consumo.

Los datasets declarados son DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets. No se especifica el número de tokens de entrenamiento ni la composición detallada del corpus. Las técnicas "heretic" y "abliterated" implican la supresión de direcciones de activación asociadas al rechazo, y el autor menciona un ajuste específico para corregir el exceso de razonamiento y el consumo excesivo de tokens, con una reducción declarada de entre 2x y 10x en tokens de pensamiento. Las variantes MTP incorporan multi-token prediction para acelerar la decodificación. No se documenta el uso de RLHF o DPO.

## Capacidades

- Generación de texto conversacional y de formato largo, con modo de pensamiento (thinking) y razonamiento explícito.
- Escritura creativa en múltiples géneros: ficción, relato, novela y roleplay, con un tono deliberadamente sin filtros.
- Generación y asistencia de código, con etiquetas de "coder" y "NEO-CODER MAX" en el nombre del modelo.
- Procesamiento image-text-to-text según el pipeline declarado, aunque no se detallan las capacidades de visión reales.
- Soporte multilingüe para 16 idiomas, incluidos español, inglés, chino, árabe, hindi, japonés y coreano.
- Tool calling y function calling: la model card afirma, remitiendo a la pestaña "community", el "mejor rendimiento de tool calling registrado", sin datos verificables en la información disponible.
- Capacidades de agente y razonamiento multi-paso derivadas del modo thinking, aunque no se documentan formalmente.
- Modo "Turbo" con reducción del consumo de tokens de razonamiento manteniendo el detalle de salida.

## Casos de uso

- Escritura creativa y generación de ficción: el ajuste está explícitamente orientado a relato, novela y guion, con un estilo sin restricciones y un consumo de tokens reducido que abarata la generación de textos largos en comparación con el modelo base.
- Roleplay y narrativa interactiva: el modelo evita los rechazos del modelo base, lo que permite mantener personajes y tramas sin interrupciones por contenido sensible; requiere revisión humana en despliegues públicos.
- Asistencia a la programación en local: las etiquetas "coder" y "NEO-CODER MAX" y el soporte de tool calling permiten integrarlo en editores o pipelines de CI/CD sobre hardware de consumo, con cuantizaciones de 4 bits.
- Generación de borradores y contenido editorial sin censura: útil para equipos que necesitan explorar temas delicados (violencia, ficción oscura, diálogos crudos) sin que el modelo derive la petición.
- Prototipado de agentes conversacionales multi-turno: el modo thinking y la reducción de tokens de razonamiento permiten iteraciones más rápidas en entornos de desarrollo con presupuesto de cómputo limitado.
- Experimentación e investigación en alineación y seguridad: al ser un modelo "abliterated" con licencia Apache 2.0, sirve como caso de estudio de los efectos de eliminar los mecanismos de rechazo y de medir su impacto en sesgos y alucinaciones.
- Despliegue multilingüe en local para 16 idiomas, incluido el español, en escenarios de traducción informal o generación de contenido regional.

## Benchmarks y rendimiento

La model card declara resultados en ARC-C y ARC-E, pero no presenta una tabla formal de benchmarks en la información proporcionada. Los únicos datos numéricos explícitos son:

| Benchmark | Resultado declarado | Contexto |
|---|---|---|
| ARC-C (8 bits) | 735 | Afirma superar en 144 puntos a Qwen 3.8 27B |
| ARC-C (4 bits) | 719 | Cuantización de 4 bits |
| ARC-E (8 bits) | superior a 880 | Zona declarada de "inteligencia" de OpenAI, Claude y Gemini |

El autor afirma que el modelo supera al Qwen 3.8 27B base y a Qwen 3.6-35B-A3B, Qwen 3.6 27B y Qwen 3.5 27B en "los 7 benchmarks críticos", pero no se enumeran ni se aportan cifras. No se han publicado resultados verificables de MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Para 26,9 B de parámetros, una cuantización de 4 bits requiere aproximadamente 15-17 GB de VRAM, y una de 8 bits en torno a 28-30 GB, estimaciones basadas en el tamaño de parámetros y no en datos del autor.
- GPU recomendadas: para 4 bits, tarjetas de consumo de 16-24 GB (RTX 4080, RTX 4090, RTX 5090); para 8 bits, A100 40 GB, H100 o RTX 6000 Ada.
- Cabe en GPU de consumo: sí en cuantizaciones de 4 bits con 16 GB o más; las variantes de 8 bits requieren GPU de centro de datos o consumer de gama alta con 32 GB.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM y TGI no soportan GGUF de forma nativa sin conversión; también es posible usar LM Studio o koboldcpp.
- Latencia y throughput: no disponibles. Las variantes MTP están diseñadas para acelerar la decodificación, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Infinix-io GGUF) | 26,9 B | no disponible | Apache 2.0 | GGUF | Fine-tune sin censura, ARC-C 735 (8 bits) |
| Qwen 3.8 27B (base) | ≈27 B | no disponible | Apache 2.0 (según familia Qwen) | safetensors, GGUF | Modelo original; el autor declara superarlo en 7 benchmarks |
| Qwen 3.6 27B | ≈27 B | no disponible | no disponible | no disponible | Citado como referencia superada |
| Qwen 3.5 27B | ≈27 B | no disponible | no disponible | no disponible | Citado como referencia superada |
| Qwen 3.6-35B-A3B | 35 B totales (MoE) | no disponible | no disponible | no disponible | Citado como referencia superada |

No se dispone de datos de contexto ni de benchmarks independientes para establecer una comparación rigurosa con alternativas de otros fabricantes.

## Limitaciones y advertencias

- Modelo "abliterated" y "uncensored": no aplica filtros de seguridad, por lo que puede generar contenido violento, sexual, ilegal o dañino; no es apto para despliegues públicos sin moderación externa.
- Riesgo elevado de alucinación, agravado por la supresión de mecanismos de rechazo y por la ausencia de benchmarks independientes verificables.
- Los resultados de ARC-C y ARC-E son declaraciones del autor, no verificadas de forma independiente; deben tratarse con cautela.
- Longitud de contexto no documentada; no se puede garantizar el comportamiento en conversaciones largas.
- El repositorio tiene 492,8 GB y múltiples variantes con nombres poco sistemáticos, lo que complica la selección de la cuantización adecuada.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado puede infringir normativas locales o derechos de terceros; la responsabilidad recae en el desplegador.
- El modelo base intermedio es un fine-tune de un fine-tune, con posible degradación acumulada y sin evaluación formal publicada.
- Soporte de tool calling y de visión declarado pero no documentado técnicamente; no debe asumirse en producción sin pruebas propias.
- Sin descargas ni "likes" en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Infinix-io/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Perfil del autor del fine-tune: https://huggingface.co/DavidAU
- Colección Turbo Brilliance: https://huggingface.co/collections/DavidAU/turbo-brilliance-ai-constructs-50x-reasoning-instruct
- Variante 27B Heretic v2: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-GGUF
- Variante 27B no Heretic v1: https://huggingface.co/DavidAU/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-NEO-MAX-MTP-GGUF
- Dataset Polar-STRICT: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451-STRICT: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets

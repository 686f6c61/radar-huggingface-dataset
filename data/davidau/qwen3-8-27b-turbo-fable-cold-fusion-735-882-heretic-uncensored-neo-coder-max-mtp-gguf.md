# DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF

## Resumen

Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF es un fine-tune de la familia Qwen 3.8 de 27B publicado por DavidAU, un creador independiente conocido en Hugging Face por sus merges y ajustes multietapa orientados a razonamiento y escritura creativa. El modelo parte de una variante intermedia del mismo autor (NM-DAU) y se distribuye exclusivamente en formato GGUF, con cuantizaciones tanto "regular" como "MTP" (multi-token prediction) generadas con imatrix dual. El repositorio ocupa 389 GB e incluye múltiples niveles de cuantización, desde bfloat16 hasta 4 bits.

El objetivo declarado es doble: reducir drásticamente la verbosidad del modo "thinking" (entre la mitad y una décima parte de los tokens de razonamiento respecto a Qwen 3.8 27B estándar) y, al mismo tiempo, elevar la puntuación en benchmarks de razonamiento tipo ARC. El autor afirma que la versión de 8 bits alcanza 735 en ARC-C y 880 en ARC-E, y que la de 4 bits llega a 719 en ARC-C. Estas cifras no están verificadas de forma independiente en la información disponible y deben tratarse con cautela.

La relevancia práctica del modelo reside en su empaquetado: cuantizaciones listas para consumer hardware, licencia Apache 2.0, soporte declarado de 16 idiomas y una orientación explícita a usos creativos, roleplay y generación de código. No obstante, la nomenclatura del repositorio (Heretic, Uncensored, Abliterated) indica que se han eliminado total o parcialmente los mecanismos de rechazo del modelo base, lo que tiene implicaciones directas para su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen 3.8; detalles de atención no disponibles) |
| Parametros totales | 26.895.998.464 (~26,9 mil millones) |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF en múltiples niveles: bfloat16, 8 bits, 4 bits (Q4KS y variantes), con versiones "regular" y "MTP", con y sin imatrix dual |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi (16 idiomas declarados en la model card; los tags de Hugging Face solo listan en y zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors solo como referencia de parámetros del modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de su origen en Qwen 3.8 de 27B, un transformer decoder-only. El autor describe el proceso como un "multi-stage tune" y "multi-state merge" construido sobre su propia variante NM-DAU, empleando los métodos que denomina "COLD FUSION" y "FABLE FUSION 711". No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. Los datasets referenciados son DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets, propiedad del mismo autor y sin documentación pública detallada en la información proporcionada.

El rasgo técnico más destacable es la inclusión de cuantizaciones "MTP" (multi-token prediction), que el autor presenta como una vía para acelerar la decodificación. También se menciona el uso de imatrix dual ("DI-MATRIX") para mejorar la calidad de las cuantizaciones de 4 bits. La reducción de tokens de pensamiento se logra mediante ajuste específico contra el "over reasoning", según la model card. No hay información sobre innovaciones arquitectónicas propias (atención lineal, SSM, decodificación especulativa nativa) más allá de lo heredado del modelo base.

## Capacidades

- Generación de texto general y conversacional multi-turno.
- Razonamiento con modo "thinking" explícito, con verbosidad reducida respecto al base según el autor.
- Generación de código (el sufijo NEO-CODER indica ajuste específico para código).
- Escritura creativa: ficción, relato, poesía y roleplay, con ajuste declarado para "todos los géneros".
- Capacidades multimodales de entrada imagen-texto (pipeline image-text-to-text declarado en Hugging Face).
- Soporte multilingüe declarado en 16 idiomas, con especial énfasis en inglés y chino.
- El autor menciona en la pestaña "community" un rendimiento destacado en tool calling, aunque no se aportan cifras verificables en la información disponible.
- Modo "uncensored"/"abliterated": se han eliminado o atenuado los rechazos del modelo base.

## Casos de uso

- Escritura creativa asistida: el ajuste declarado para ficción y roleplay, junto con la reducción de tokens de pensamiento, permite generar borradores largos con menos latencia que el modelo base en escenarios de narrativa serializada.
- Roleplay y personajes persistentes: la ventana de contexto (no especificada) y el ajuste conversacional lo hacen adecuado para chatbots de personaje con historial largo, siempre que se valide el contexto real soportado.
- Generación de código en local: el sufijo NEO-CODER y el formato GGUF permiten desplegarlo con llama.cpp u Ollama en estaciones de trabajo con GPU de consumo para autocompletado y refactorización.
- Prototipado de agentes con tool calling: si se confirma el soporte de function calling, puede integrarse en pipelines de agentes que requieran razonamiento multi-paso con bajo consumo de tokens de pensamiento.
- Investigación sobre alineación y censura: al ser una variante "abliterated", sirve para estudiar el comportamiento de modelos sin rechazos y comparar con el base en tareas sensibles, en entornos controlados.
- Despliegue en hardware de consumo: las cuantizaciones de 4 bits permiten ejecutar un modelo de ~27B en GPU de 24 GB, útil para demos y desarrollo offline sin infraestructura cloud.
- Traducción y contenido multilingüe: con 16 idiomas declarados, puede emplearse en localización de contenido, aunque la calidad por idioma no está documentada.

## Benchmarks y rendimiento

| Benchmark | Este modelo (8 bits) | Este modelo (4 bits) | Referencia declarada |
|---|---|---|---|
| ARC-C | 735 | 719 | Qwen 3.8 27B: 591 (diferencia de 144 pts según el autor) |
| ARC-E | 880 | no disponible | no disponible |

El autor afirma que el modelo supera al Qwen 3.8 27B base y a Qwen 3.6-35B-A3B, Qwen 3.6 27B y Qwen 3.5 27B en "los 7 benchmarks críticos", pero no se detallan los nombres ni las puntuaciones de los seis restantes en la información disponible. No se han publicado resultados verificables de MMLU, HumanEval o GSM8K en la documentación proporcionada. Las cifras de ARC deben considerarse afirmaciones del autor sin verificación independiente.

## Requisitos de hardware

- VRAM estimada: ~54 GB en bfloat16 (26,9B × 2 bytes), ~27 GB en 8 bits y ~14-16 GB en 4 bits, más overhead de contexto KV cache.
- GPU recomendadas: A100 80 GB o H100 para bfloat16; RTX 4090 (24 GB) o A6000 (48 GB) para 8 bits; RTX 4090, RTX 3090 o RTX 4080 para 4 bits.
- Cabe en GPU de consumo: sí, en 4 bits en tarjetas de 16-24 GB; en 8 bits requiere 24 GB o más con contexto moderado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF (llama-cpp-python). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requerirían conversión.
- Latencia y throughput: no disponibles. El autor afirma reducciones de tokens de pensamiento de 2x a 10x, lo que implicaría menor tiempo hasta la primera respuesta completa, pero no se aportan mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo | ~26,9B | no disponible | Apache 2.0 | GGUF | Fine-tune "uncensored" con cuantizaciones MTP |
| Qwen 3.8 27B (base) | ~27B | no disponible | Apache 2.0 | safetensors, GGUF | Modelo original; el autor reporta ARC-C 591 |
| Qwen 3.6 27B | ~27B | no disponible | Apache 2.0 | safetensors, GGUF | Generación anterior; el autor afirma que este fine-tune lo supera en 7 benchmarks |
| Qwen 3.6-35B-A3B | 35B totales / 3B activos (MoE) | no disponible | Apache 2.0 | safetensors, GGUF | Alternativa MoE eficiente en inferencia; datos de contexto no disponibles |

La comparativa se limita a la familia Qwen porque la información proporcionada no incluye datos verificables frente a modelos de otros fabricantes. No se dispone de cifras de contexto ni de benchmarks independientes para ninguno de los comparados.

## Limitaciones y advertencias

- Las puntuaciones de ARC-C y ARC-E son afirmaciones del autor sin verificación independiente; no deben citarse como resultados consolidados.
- El modelo es una variante "abliterated"/"uncensored": se han eliminado o atenuado los rechazos, lo que incrementa el riesgo de generar contenido dañino, ilegal o difamatorio sin filtro.
- Riesgo de alucinación no cuantificado; los fine-tunes multietapa con merges agresivos pueden degradar la fidelidad factual respecto al base.
- La longitud de contexto no está documentada; no se debe asumir la del Qwen 3.8 original sin verificación empírica.
- La calidad multilingüe en los 14 idiomas distintos del inglés y el chino no está evaluada; los tags de Hugging Face solo confirman en y zh.
- El repositorio de 389 GB contiene múltiples cuantizaciones; la descarga completa es inviable en la mayoría de entornos y requiere seleccionar archivos concretos.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo sin salvaguardas requiere revisión legal y de políticas de contenido propias.
- El pipeline declarado es image-text-to-text, pero no se documenta la arquitectura de visión ni su calidad; no se debe asumir paridad multimodal con el base.
- El rendimiento en tool calling mencionado por el autor no está respaldado por cifras en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Modelo base (NM-DAU): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Variante Turbo Brilliance 27B Heretic v2: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-GGUF
- Variante Turbo Brilliance 27B no-Heretic v1: https://huggingface.co/DavidAU/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-NEO-MAX-MTP-GGUF
- Colección Turbo Brilliance: https://huggingface.co/collections/DavidAU/turbo-brilliance-ai-constructs-50x-reasoning-instruct
- FAQs y soporte del autor: https://huggingface.co/DavidAU/support

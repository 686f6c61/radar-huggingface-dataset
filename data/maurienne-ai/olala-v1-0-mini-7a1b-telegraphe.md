# maurienne-ai/Olala-v1.0-mini-7A1B-Telegraphe

## Resumen

Télégraphe es un modelo borrador (*draft model*) para decodificación especulativa, publicado por maurienne-ai como parte de la familia Olala v1.0 mini 7A1B. No es un modelo de lenguaje autónomo: su función es proponer varios tokens candidatos en un solo paso paralelo (3 por defecto, configurable hasta 5) que el modelo objetivo —Opinel N°8 u Opinel N°4— verifica en un único *forward pass* y acepta o descarta. El resultado es una aceleración de la inferencia sin alterar la distribución de salida del modelo objetivo.

El modelo se presenta como un *finetune* de Opinel N°8 y se distribuye con pesos en safetensors y soporte para vLLM (a través de un fork propio del autor, rama `opinel`). Su relevancia práctica está en el despliegue interactivo y de baja concurrencia: según la model card, ofrece incrementos de hasta ×1,51 en decodificación voraz y ×1,28 en muestreo con un solo flujo sobre una RTX 5090, y llega a ×2,57 en regímenes de 128 flujos con tráfico mixto.

La información disponible no detalla la arquitectura interna del borrador ni su proceso de entrenamiento más allá de los datos de rendimiento. El repositorio declara 455.101.952 parámetros en safetensors y un tamaño de 0,9 GB, lo que sugiere un modelo compacto, coherente con su papel de borrador. La licencia es Apache 2.0 y los idiomas declarados son inglés y francés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo borrador para decodificación especulativa; base Qwen3 según tags) |
| Parametros totales | 455.101.952 |
| Parametros activos | no aplica (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, fr |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del borrador. Los tags del repositorio incluyen `qwen3`, lo que apunta a una base derivada de la familia Qwen3, y `speculative-decoding` / `draft-model`, que definen su rol funcional. El modelo se presenta como un *finetune* de `maurienne-ai/Olala-v1.0-mini-7A1B-Opinel-N8`, el modelo objetivo al que acompaña.

El mecanismo es la decodificación especulativa estándar: el borrador propone K tokens (3 por defecto, 5 en la configuración del récord de velocidad) en un paso paralelo, el modelo objetivo los verifica en un solo *forward pass* y conserva los que coinciden con su propia distribución. La model card insiste en que la calidad de salida es la del modelo objetivo ("outputs follow the target model's distribution: the drafter only changes the speed"). No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. Los tags `dspine` y `dflash` no se explican en la información disponible.

## Capacidades

- Aceleración de inferencia mediante decodificación especulativa sobre Opinel N°8 y Opinel N°4.
- Propuesta de múltiples tokens por paso (K configurable; 3 por defecto, 5 en la configuración de máximo rendimiento).
- Compatibilidad con decodificación voraz y con muestreo (temperatura 0,8, top-p 0,9, top-k 40 en los ajustes recomendados).
- Funcionamiento en regímenes de un solo flujo y de alta concurrencia (hasta 128 flujos en las pruebas publicadas).
- Rendimiento medido en categorías diversas: matemáticas, RAG, código, multilingüe, razonamiento, Q&A, role-play, resumen y escritura.
- Soporte de prompts largos (hasta 32k tokens en las pruebas, donde el *prefill* domina).
- Idiomas: inglés y francés.
- No se declaran capacidades de tool calling, agentes, visión ni audio; su función es exclusivamente acelerar al modelo objetivo.

## Casos de uso

- Servicio interactivo de un solo usuario: con un flujo y decodificación voraz, el borrador eleva el rendimiento de 481 a 728 tok/s sobre una RTX 5090 (×1,51), lo que reduce la latencia percibida en chat y asistentes en tiempo real.
- Generación de respuestas matemáticas: en la configuración de K = 5 y decodificación voraz alcanza 1.279 tok/s de decodificación en la categoría de matemáticas, adecuado para tutores o resolutores paso a paso.
- RAG sobre documentos: con 1.122 tok/s de decodificación en la categoría RAG y buen comportamiento en prompts de 1k tokens, sirve para pipelines de preguntas sobre corpus documentales.
- Asistencia a la programación: 1.120 tok/s de decodificación en código y ×1,66 en la categoría Coding con muestreo voraz, útil en autocompletado y generación de fragmentos en IDE.
- Tráfico mixto de alta concurrencia: con 128 flujos y prompts reales mixtos pasa de 1.450 a 3.729 tok/s (×2,57), lo que lo hace adecuado para servidores con carga heterogénea.
- Despliegue en GPU de gama consumer: en una RTX 3080 es al menos ×1,03 más rápido en todas las concurrencias probadas, lo que permite acelerar servicios modestos sin hardware de datacenter.
- Servicio multilingüe inglés-francés: ×1,70 en decodificación voraz en la categoría Multilingual, apropiado para atención al cliente bilingüe.

## Benchmarks y rendimiento

Los datos proceden de la model card y miden tokens de salida por segundo con Opinel N°8 como objetivo. No son benchmarks de calidad del borrador, sino de aceleración.

Rendimiento con prompts cortos en RTX 5090 (K = 3):

| Configuracion | 1 flujo | 8 flujos | 32 flujos | 128 flujos |
|---|---|---|---|---|
| Voraz, solo | 481 | 2.188 | 4.059 | 5.696 |
| Voraz, + Telegraphe | 728 (×1,51) | 2.554 (×1,17) | 3.977 (×0,98) | 5.616 (×0,99) |
| Muestreo, solo | 458 | 2.043 | 3.947 | 5.544 |
| Muestreo, + Telegraphe | 586 (×1,28) | 2.179 (×1,07) | 3.649 (×0,92) | 5.265 (×0,95) |

SPEED-Bench v1.1, RTX 5090, un flujo, K = 3 (tokens/s, solo → + Telegraphe):

| Categoria | Voraz | Muestreo |
|---|---|---|
| Coding | 553 → 919 (×1,66) | ×1,47 |
| Multilingual | 560 → 955 (×1,70) | ×1,54 |
| Q&A | 563 → 914 (×1,62) | ×1,36 |
| RAG | 541 → 887 (×1,64) | ×1,46 |
| Reasoning | 553 → 926 (×1,67) | ×1,49 |
| Role-play | 553 → 824 (×1,49) | ×1,26 |
| Summarization | 542 → 788 (×1,45) | ×1,35 |
| Writing | 547 → 782 (×1,43) | ×1,27 |
| Media de las 8 categorias | 552 → 874 (×1,58) | 523 → 733 (×1,40) |

Récord de un flujo con K = 5, voraz (tokens/s de decodificación): matemáticas 1.279, RAG 1.122, coding 1.120, multilingüe 1.114, razonamiento 1.063, Q&A 969, role-play 945, resumen 850, escritura 711.

Throughput con prompts de 1k tokens y 1.024 tokens generados (tokens/s, solo / + Telegraphe): voraz de 546/871 (×1,59) con 1 flujo a 8.213/7.609 (×0,93) con 128 flujos; muestreo de 520/689 (×1,33) con 1 flujo a 8.021/6.350 (×0,79) con 128 flujos. Con prompts de 32k tokens el *prefill* domina (×0,89-1,10). La calidad en GSM8K y rechazos se mantiene "sin cambios dentro del ruido" respecto al modelo objetivo.

## Requisitos de hardware

- VRAM estimada para el borrador: el repositorio ocupa 0,9 GB en safetensors; la VRAM total debe sumar la del modelo objetivo Opinel N°8.
- GPU probadas: RTX 5090 (32 GB, SM120), RTX 3080 y V100.
- Cabe en GPU consumer: sí, el borrador es de 455 M de parámetros; el conjunto con Opinel N°8 se probó en una RTX 5090.
- Despliegue: vLLM, concretamente el fork del autor (rama `opinel`, commits c40d051a97 en RTX 5090 y c67c6fd8b7 en RTX 3080 y V100). No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver tablas anteriores. El tiempo hasta el primer token en el récord de un flujo es de unos 47 ms.
- Advertencia de concurrencia: para lotes de peticiones cortas, el servidor sin borrador es igual de rápido a partir de unos 16 flujos en RTX 5090 (2-4 en V100). La KV cache aloja 32,8 peticiones de 32k tokens sin borrador y 26,2 con él.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos borrador comparables en la documentación proporcionada. La comparación interna relevante es contra el servidor sin decodificación especulativa (Opinel N°8 solo), cuyos datos aparecen en las tablas de rendimiento: el borrador aporta ganancias de ×1,28 a ×1,70 en un flujo y pierde entre un 5 % y un 21 % en muestreo a 32-128 flujos.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere Opinel N°8 u Opinel N°4 como modelo objetivo; no genera respuestas por sí solo.
- En muestreo con alta concurrencia (32-128 flujos) el rendimiento cae por debajo del servidor sin borrador (×0,92 a ×0,79).
- En lotes de peticiones cortas deja de aportar ventaja a partir de unos 16 flujos en RTX 5090 y de 2-4 en V100.
- Con prompts de 32k tokens el *prefill* domina y la ganancia desaparece (×0,89-1,10).
- La KV cache se reduce al usar el borrador: de 32,8 a 26,2 peticiones de 32k tokens.
- Idiomas limitados a inglés y francés; no se declara soporte de español.
- No se documentan sesgos, tasas de alucinación ni comportamiento fuera de dominio del borrador; la calidad declarada es la del modelo objetivo.
- Licencia Apache 2.0, que permite uso comercial, pero el fork de vLLM necesario para su despliegue no se detalla en cuanto a licencia ni mantenimiento.
- Los datos de rendimiento provienen de una sola ronda por punto, con ruido de varios puntos porcentuales según el propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maurienne-ai/Olala-v1.0-mini-7A1B-Telegraphe
- Modelo base / objetivo Opinel N°8: https://huggingface.co/maurienne-ai/Olala-v1.0-mini-7A1B-Opinel-N8
- Modelo objetivo Opinel N°4: https://huggingface.co/maurienne-ai/Olala-v1.0-mini-7A1B-Opinel-N4
- Paper SPEED-Bench: https://arxiv.org/abs/2604.09557
- Dataset SPEED-Bench: https://huggingface.co/datasets/nvidia/SPEED-Bench

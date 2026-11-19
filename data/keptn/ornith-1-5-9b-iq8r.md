# keptn/ornith-1.5-9b-iq8r

## Resumen

Ornith 1.5 9B IQ8R es una cuantización en int8 del modelo denso Ornith-1.5-9B, publicada por el usuario keptn para el motor de inferencia radiance sobre GPUs AMD RDNA4. No se trata de un modelo nuevo, sino de un artefacto de despliegue: el modelo base, desarrollado por el equipo Ornith (construido sobre Qwen3.5, Apache 2.0), se ha convertido a un único fichero de 10,71 GiB en formato propietario `.rad`, con todas las capas lineales del tronco y de la cabeza MTP en int8 y una rotación Hadamard de 128 elementos.

El modelo resuelve un problema de infraestructura: permitir ejecutar un modelo de razonamiento de 9B con capacidades de visión y agente en una sola tarjeta AMD de 32 GB (probado en Radeon AI PRO R9700), con decodificación especulativa nativa mediante la cabeza MTP del propio modelo. El contexto declarado es de 262.144 tokens, con caché KV en i8 y hasta 8 secuencias concurrentes.

Su relevancia es doble: por un lado, demuestra el ecosistema emergente de inferencia sobre ROCm/RDNA4 fuera de CUDA; por otro, ofrece una cuantización int8 con pérdida de calidad muy medida (KL medio de 0,00067 frente al bf16 original en MT-Bench) y velocidades de 72 a 170 tokens por segundo en una tarjeta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con cabeza MTP (multi-token prediction) para decodificación especulativa; base Qwen3.5 |
| Parametros totales | 9B (según nombre del modelo; no se detalla el recuento exacto) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | IQ8R (int8 con rotación Hadamard de 128; escala u8 por cada 256 pesos bajo una escala bf16 por fila; activaciones int8; lm_head int8 con escala bf16 por cada 128 pesos); KV cache i8 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `.rad` (formato propietario del motor radiance); fichero único de 10,71 GiB |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 9B parámetros con capacidades de razonamiento y visión, construido por el equipo Ornith sobre Qwen3.5. Incluye una cabeza MTP (multi-token prediction) que se reutiliza en esta cuantización como drafter para decodificación especulativa con 3 tokens de borrador. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada.

La innovación técnica de este artefacto es la cuantización IQ8R: cada capa lineal del tronco y de la MTP se redondea a int8 aplicando previamente una transformada de Hadamard de ancho 128, lo que reduce los valores atípicos antes del redondeo. Cada 256 pesos comparten una escala u8 bajo una escala bf16 por fila; el lm_head usa int8 con una escala bf16 por cada 128 pesos, y se añade una copia de 2 bits del lm_head para los tokens de borrador. El proceso se realizó sin datos de calibración (round-to-nearest con búsqueda de escala), partiendo de la revisión `489cb979` del release bf16.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activado por defecto (desactivable por petición mediante `chat_template_kwargs.enable_thinking`).
- Generación de código, con ajustes de muestreo recomendados por el autor para coding preciso (temperatura 0,6, sin penalización de presencia).
- Entrada multimodal texto e imagen (pipeline `image-text-to-text`).
- Decodificación especulativa nativa mediante la cabeza MTP del propio modelo (3 tokens de borrador).
- Capacidades de agente y trabajo multi-paso, según la descripción del autor ("tuned for coding and agent work").
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades multilingües: no disponible.

## Casos de uso

- Asistencia de código en producción: el modelo está ajustado para coding y admite un perfil de muestreo específico (temperatura 0,6, penalización 0), lo que permite integrarlo en pipelines de revisión y generación de parches con salidas más deterministas.
- Agentes autónomos multi-paso: la ventana de 262.144 tokens y la caché KV en i8 permiten mantener sesiones largas (hasta 4,6 sesiones completas en una tarjeta) con historial de herramientas y observaciones.
- Análisis de documentos largos con imagen: al aceptar entrada texto e imagen, puede procesar capturas, diagramas o páginas escaneadas junto a instrucciones extensas en una sola petición.
- Despliegue en infraestructura AMD on-premise: organizaciones con clústeres ROCm/RDNA4 pueden servir el modelo con radiance 2.0.0 en una o dos Radeon AI PRO R9700 sin depender de CUDA.
- Razonamiento con presupuesto de salida amplio: tareas difíciles que requieren cadenas de pensamiento largas (el autor advierte que pueden superar los 32k tokens de salida con thinking activo).
- Servicio concurrente de bajo coste: con `max-num-seqs: 8` y 72-170 tokens/s por tarjeta, es viable para cargas interactivas moderadas con varias sesiones simultáneas.
- Evaluación comparativa de cuantizaciones: el fichero incluye métricas KL frente al bf16, útil para estudiar el impacto de int8 con rotación en modelos de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí publica métricas de fidelidad de cuantización y velocidad:

| Metrica | Este fichero (IQ8R) | keptn/ornith-1.5-9b-bf16 |
|---|---|---|
| KL medio (MT-Bench, 42.305 tokens) | 0,00067 | 0,00017 |
| KL percentil 99 | 0,0068 | 0,0017 |
| Token top idéntico | 99,2% | 99,6% |
| Ratio de perplejidad | ×1,000 | ×1,000 |

| Metrica de velocidad | Valor |
|---|---|
| Throughput (1 tarjeta, greedy, 3 tokens MTP) | 72,1 y 170,1 tokens/s en dos prompts cortos |
| KV cache (1 tarjeta, 262.144 tokens, 8 secuencias, i8) | 21,85 GiB |
| KV cache (2 tarjetas, por tarjeta) | 18,53 GiB |
| Sesiones de longitud completa (1 tarjeta / 2 tarjetas) | 4,6 / 8,0 |

## Requisitos de hardware

- VRAM: el fichero de pesos ocupa 10,71 GiB; con KV cache i8 a contexto completo se reportan 21,85 GiB en una tarjeta y 18,53 GiB por tarjeta en dos.
- GPU recomendadas: AMD Radeon AI PRO R9700 (32 GB, RDNA4), una o dos tarjetas probadas; cuatro tarjetas no probadas en radiance 2.0.
- Compatibilidad: exclusivamente AMD RDNA4 vía ROCm; no hay soporte CUDA ni Metal documentado.
- No cabe en GPUs de consumo convencionales: requiere 32 GB de VRAM por tarjeta según las pruebas del autor.
- Despliegue: motor radiance 2.0.0 o superior (imagen Docker `stilldeadcode/radiance:2.0.0`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, y el formato `.rad` no es compatible con ellos.
- Latencia y throughput: 72,1-170,1 tokens/s con 3 tokens especulativos; medición con solo dos prompts cortos, sin BetterBench.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / motor | Licencia | Notas |
|---|---|---|---|---|---|
| keptn/ornith-1.5-9b-iq8r | 9B denso | 262.144 | `.rad` / radiance (AMD RDNA4) | MIT | KL medio 0,00067 vs bf16; 72-170 tok/s |
| keptn/ornith-1.5-9b-bf16 | 9B denso | no disponible | safetensors / HF transformers | MIT | Referencia de calidad; KL medio 0,00017 |
| ornith-ai/Ornith-1.5-9B | 9B denso | 262.144 (según este derivado) | safetensors | MIT | Modelo base original, con visión y MTP |
| Qwen3.5 (base) | no disponible | no disponible | safetensors | Apache 2.0 | Arquitectura sobre la que se construye Ornith |

No se dispone de datos de benchmarks que permitan comparar rendimiento cognitivo con alternativas de la misma categoría.

## Limitaciones y advertencias

- Dependencia de hardware: solo funciona en GPUs AMD RDNA4 con ROCm; no es portable a CUDA ni a CPU.
- Dependencia de software: requiere radiance 2.0.0 o superior; el formato `.rad` no es estándar ni interoperable.
- Calidad de cuantización: aunque el KL medio es bajo, el percentil 99 (0,0068) es cuatro veces el del bf16, lo que implica mayor divergencia en colas de la distribución.
- Validación limitada: la velocidad se midió con dos prompts cortos; no se ejecutó BetterBench en radiance 2.0; las imágenes no se compararon con HF transformers; cuatro tarjetas no se probaron.
- Consumo de tokens: con thinking activo, tareas difíciles pueden necesitar más de 32k tokens de salida, con el coste y la latencia asociados.
- Idiomas: no se especifican los idiomas soportados; no se puede garantizar calidad multilingüe.
- Sesgos y alucinaciones: no hay información publicada sobre evaluación de sesgos ni tasas de alucinación para este modelo o su base.
- Licencia: MIT, permisiva para uso comercial, heredada del modelo base; conviene revisar el fichero `LICENSE` del repositorio original de Ornith.
- Tool calling: no confirmado explícitamente; verificar antes de diseñar agentes que dependan de function calling.

## Enlaces

- Hugging Face (este artefacto): https://huggingface.co/keptn/ornith-1.5-9b-iq8r
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Versión bf16 del mismo autor: https://huggingface.co/keptn/ornith-1.5-9b-bf16
- Repositorio del modelo Ornith: https://github.com/ornith-ai/Ornith-1
- Motor radiance: https://codeberg.org/StillDeadcode/radiance
- Dataset MT-Bench: https://huggingface.co/datasets/lmsys/mt_bench_human_judgments

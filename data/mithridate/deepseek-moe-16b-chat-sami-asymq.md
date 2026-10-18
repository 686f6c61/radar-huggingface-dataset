# MIThridate/DeepSeek-MoE-16B-Chat-SAMI-AsymQ

## Resumen

DeepSeek-MoE-16B-Chat-SAMI-AsymQ es una cuantización GGUF experimental del modelo DeepSeek-MoE-16B-Chat, publicada por el usuario MIThridate. Su particularidad no es el modelo en sí, sino la configuración de despliegue: una cuantización asimétrica por capas (mezcla de Q8_0, Q5_K, Q4_K y Q3_K, denominada SAMI-AsymQ) combinada con una cirugía de pesos mediante ablación direccional de columnas, pensada para ejecutar un transformer MoE disperso en una GPU de 6 GB (GTX 1060) dejando los expertos enrutados en RAM DDR4 del host.

El problema que aborda es concreto: un MoE de 16 B en BF16 ocupa del orden de 32 GB y no cabe en hardware de consumo. Mediante el offloading `-cmoe` (`--cpu-moe`) de llama.cpp, solo las proyecciones de atención y las cabezas de routing residen en VRAM (~2,1 GB), mientras los expertos se evalúan dinámicamente en RAM (~6,4 GB). El autor reporta 22,5–26 tok/s de generación y 0,95 s de TTFT en un i5-8400 con 32 GB DDR4-2666.

Es relevante ahora porque demuestra una vía práctica de inferencia MoE desacoplada por niveles de memoria en hardware antiguo, un área con poca literatura abierta. Conviene tratarlo como prueba de concepto de investigación, no como checkpoint de producción: no hay descargas ni validación de la comunidad, y la propia model card advierte de posibles regresiones por la modificación de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE disperso (modelo base DeepSeek-MoE-16B: 64 expertos enrutados + 2 compartidos por capa; detalle no reproducido en esta model card) |
| Parametros totales | 16,4 B (según el modelo base; no verificado en esta ficha) |
| Parametros activos | 2,8 B por token (según el modelo base; no verificado en esta ficha) |
| Longitud de contexto | 4.096 tokens (`-c 4096` documentado en llama.cpp) |
| Tipos de cuantizacion | GGUF asimétrica SAMI-AsymQ: Q8_0 / Q5_K / Q4_K / Q3_K combinados por capas; fichero único de 8,5 GB |
| Idiomas soportados | Rumano (ro), inglés (en), chino (zh) |
| Licencia | deepseek-license (etiquetada como `other` en HuggingFace) |
| Formato de pesos | GGUF para llama.cpp; no se publican safetensors en este repositorio |
| Tamano de fichero | 8,5 GB (checkpoint único) |
| VRAM activa en configuracion recomendada | ~2,1 GB (con `-ngl 99 -cmoe`) |
| RAM de host para expertos | ~6,4 GB (se indican 16–32 GB DDR4 en el sistema) |

## Arquitectura y entrenamiento

La model card de esta variante no documenta el entrenamiento: no indica número de tokens, composición del dataset ni si hubo RLHF o DPO. Lo que describe es una modificación posterior sobre `deepseek-ai/deepseek-moe-16b-chat`, un transformer de mezcla de expertos con routing disperso en el que cada token activa únicamente un subconjunto de expertos (más los expertos compartidos, que procesan todos los tokens). Sobre esa base se aplican dos intervenciones: cuantización asimétrica multi-nivel (capas sensibles en Q8_0, capas intermedias en Q5_K/Q4_K y capas tolerantes en Q3_K) y una ablación direccional de columnas que el autor enmarca en la investigación sobre "weight surgery" en hardware de consumo.

La innovación operativa es el desacoplamiento de memoria: las proyecciones densas de atención y las cabezas de routing se descargan a VRAM (`-ngl 99`), mientras los expertos enrutados se evaluan en CPU con `-cmoe`, de modo que el coste en VRAM no escala con el total de parámetros. El autor declara que la evaluación interna mantiene el núcleo de razonamiento con una variación inferior al 0,6 % en MMLU, GSM8K, ARC y HumanEval, aunque no publica valores absolutos ni la metodología de esa medición, por lo que la cifra debe tomarse como declaración del autor y no como resultado verificado.

## Capacidades

- Generación de texto conversacional multi-turno en rumano, inglés y chino, los tres idiomas declarados.
- Razonamiento de propósito general y resolución de problemas tipo MMLU/ARC, según el modelo base.
- Generación y comprensión de código, con evaluación declarada en HumanEval (sin cifras publicadas).
- Aritmética y razonamiento matemático de varios pasos (GSM8K en la evaluación declarada del autor).
- Servicio compatible con la API OpenAI de `llama-server` (`/v1/chat/completions`), lo que permite integrarlo con clientes existentes.
- Ejecución con presupuesto de VRAM reducido mediante offloading selectivo de expertos a RAM.
- No se documentan capacidades de visión, audio, tool calling estructurado ni modo "thinking" en esta model card; no disponible.
- No se documenta soporte explícito de function calling; el modelo base se distribuye como chat, pero esta variante no lo certifica.

## Casos de uso

- Inferencia local en GPU de 6 GB: desplegar un MoE de 16 B en una GTX 1060 con 16–32 GB de RAM usando `llama-server -ngl 99 -cmoe`; encaja en estaciones de trabajo antiguas o equipos de laboratorio con GPUs de gama baja.
- Investigación en decodificación MoE con offloading: medir el impacto de `-cmoe` en throughput, TTFT y patrones de routing, y comparar la mezcla asimétrica SAMI-AsymQ frente a cuantizaciones uniformes Q4_K_M del mismo modelo base.
- Asistente técnico bilingüe rumano-inglés: atención interna o soporte a desarrolladores en Rumanía, con prompts de sistema en rumano y respuestas cortas; el contexto de 4.096 tokens limita los documentos adjuntos a unos 3.000 tokens útiles.
- Generación de código en entornos aislados (air-gapped): servir el modelo con `llama-server` y conectarlo a un IDE mediante la API compatible con OpenAI, sin tráfico hacia servicios externos.
- Evaluación comparativa de hardware para MoE disperso: usar la telemetría publicada (48,5 tok/s de ingesta, 22,5–26 tok/s de generación, TTFT de 0,95 s) como línea base reproducible en i5-8400 + GTX 1060.
- Docencia sobre arquitecturas MoE: el propio ejemplo de la model card (explicar el papel de los expertos compartidos) ilustra un uso realista de preguntas conceptuales con temperatura baja.
- Prototipado de pipelines RAG de documentos cortos en rumano o inglés, siempre que se trocee el corpus para no superar la ventana de 4K.
- Clasificación y resumen de textos técnicos en tres idiomas en lotes pequeños, donde el throughput de 20–26 tok/s es suficiente para procesos no interactivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks con valores absolutos en la información disponible. El autor afirma una variación inferior al 0,6 % respecto al modelo base en MMLU, GSM8K, ARC y HumanEval, pero no adjunta puntuaciones ni el protocolo de evaluación, por lo que no se puede reproducir ni comparar.

Telemetría de ejecución publicada (Intel Core i5-8400 a 2,80 GHz, 32 GB DDR4-2666, NVIDIA GTX 1060 6 GB, driver 535+, Linux x86_64):

| Metrica | Valor medido | Condiciones |
|---|---|---|
| Velocidad de ingesta de prompt | 48,5 tok/s | Evaluación por lotes del prompt |
| Throughput de generación | 22,5 – 26,0 tok/s | Generación sostenida con greedy/sampling |
| Time-To-First-Token (TTFT) | 0,95 s | Inicio directo de respuesta |
| VRAM consumida | 2.150 MiB / 6.144 MiB | ~3,9 GB de VRAM libres |
| RAM de host para expertos | ~6,4 GB | Expertos enrutados evaluados en DDR4 |

## Requisitos de hardware

- VRAM mínima: ~2,1 GB con `-ngl 99 -cmoe` (atención y routing en GPU). Sin `-cmoe`, el fichero completo de 8,5 GB más la caché KV debe caber en VRAM, lo que exige una GPU de 10–12 GB o superior.
- RAM de sistema: ~6,4 GB solo para expertos, más el SO y la caché; el autor indica un rango de 16–32 GB DDR4. Con 16 GB el margen es ajustado y puede haber swapping bajo contextos largos.
- GPU validadas: NVIDIA GTX 1060 6 GB (plataforma de referencia). Cualquier GPU con 4 GB o más permite subir `-ngl` y reducir la presión sobre CPU.
- Cabe en GPU de consumo: sí, en GTX 1060/1650/1660, RTX 3050/3060 y superiores; en tarjetas con 8–12 GB se puede prescindir de `-cmoe` o aumentar capas en GPU.
- CPU: el rendimiento depende de núcleos e instrucciones SIMD; la medición usa 6 hilos (`-t 6`) en un i5-8400 de 6 núcleos.
- Despliegue: llama.cpp build b11300 o superior con soporte de `--cpu-moe`; `llama-server` expone API compatible con OpenAI. Ollama, vLLM y TGI no están documentados para este checkpoint y no aceptan GGUF de forma nativa (en vLLM/TGI habría que convertir o servir los pesos originales).
- Latencia y throughput estimados: TTFT ~0,95 s, 22,5–26 tok/s de generación, 48,5 tok/s de ingesta en la configuración medida; en CPUs con menos núcleos o RAM más lenta la generación caerá por debajo de esos valores.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Formato y tamano tipico | Licencia | Idoneidad en 6 GB VRAM |
|---|---|---|---|---|---|
| DeepSeek-MoE-16B-Chat-SAMI-AsymQ (esta ficha) | 16,4 B / 2,8 B | 4.096 | GGUF 8,5 GB, ~2,1 GB VRAM con `-cmoe` | deepseek-license | Sí, con offloading de expertos a RAM |
| DeepSeek-MoE-16B-Chat (base, BF16) | 16,4 B / 2,8 B | 4.096 | safetensors, ~32 GB aprox. | deepseek-license | No; requiere ~24 GB+ de VRAM o multimotor |
| Mixtral 8x7B Instruct | 46,7 B / 12,9 B | 32.768 | safetensors o GGUF (~26 GB en Q4) | Apache 2.0 | No sin offloading agresivo; el tamaño y los parámetros activos lo hacen inviable en 6 GB a velocidad útil |
| Qwen1.5-MoE-A2.7B-Chat | 14,3 B / 2,7 B | 32.768 | safetensors o GGUF (~9 GB en Q4) | Apache 2.0 (verificar en la ficha del modelo) | Parcialmente; mismo orden de magnitud que esta variante, pero sin el perfil asimétrico ni la cirugía de pesos |

Los datos de los modelos alternativos provienen de sus fichas públicas y deben verificarse antes de tomar decisiones de producción; esta ficha solo aporta mediciones propias para la variante SAMI-AsymQ.

## Limitaciones y advertencias

- Checkpoint experimental (prueba de concepto): el autor lo destina explícitamente a investigación, benchmarking de hardware y experimentación local, no a producción certificada.
- Cirugía de pesos mediante ablación direccional de columnas: puede provocar anomalías de routing, degradación sintáctica, regresiones o deriva en casos límite no cubiertos por la evaluación interna.
- Sin validación de la comunidad: 0 descargas y 0 likes en el momento de la consulta; no hay informes independientes que confirmen la retención declarada del 0,6 %.
- Contexto limitado a 4.096 tokens: poco adecuado para RAG con documentos largos, conversaciones extensas o agentes con historial amplio.
- Idiomas declarados ro/en/zh; no se declara ni documenta el rendimiento en castellano, por lo que su uso en español requeriría evaluación propia.
- Riesgo de alucinación no medido: no se publican evaluaciones de fidelidad, calibración ni tasas de error factual.
- Sesgos no evaluados: la model card no incluye análisis de sesgo, toxicidad ni evaluación de seguridad.
- Licencia `deepseek-license`: permite uso comercial con condiciones (atribución visible a DeepSeek, restricciones de uso y cláusula que limita emplear las salidas para entrenar otros modelos de lenguaje). Conviene revisar el texto completo antes de un despliegue comercial.
- Solo se distribuye GGUF: no hay safetensors, por lo que no es directamente apto para fine-tuning, para vLLM/TGI ni para pipelines que requieran pesos completos.
- El badge automático de compatibilidad de hardware de HuggingFace marca el checkpoint como incompatible con GPUs de 6 GB porque asume que los 8,5 GB deben residir en VRAM; el autor lo desmiente, pero ilustra que la herramienta de validación no modela el offloading `-cmoe`.
- Dependencia de la RAM del host: el throughput cae de forma notable con DDR4 lenta, pocos núcleos o menos de 16 GB de RAM (riesgo de swapping).
- Fecha de creación en los metadatos (18-10-2026) y ausencia de historial de versiones: no hay garantía de mantenimiento ni de corrección de errores.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/MIThridate/DeepSeek-MoE-16B-Chat-SAMI-AsymQ
- Modelo base: https://huggingface.co/deepseek-ai/deepseek-moe-16b-chat
- Licencia del modelo base (LICENSE-MODEL): https://github.com/deepseek-ai/DeepSeek-MoE/blob/main/LICENSE-MODEL
- Repositorio de DeepSeek-MoE: https://github.com/deepseek-ai/DeepSeek-MoE
- Paper de DeepSeekMoE (arXiv:2401.06066): https://arxiv.org/abs/2401.06066
- llama.cpp (motor de inferencia requerido, build b11300+): https://github.com/ggml-org/llama.cpp
- Nota: la búsqueda web realizada no devolvió resultados técnicos relevantes sobre este checkpoint; los enlaces anteriores proceden de los metadatos de HuggingFace y de la model card.

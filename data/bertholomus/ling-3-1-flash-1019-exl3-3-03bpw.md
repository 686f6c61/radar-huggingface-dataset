# bertholomus/Ling-3.1-flash-1019-EXL3-3.03bpw

## Resumen

Este repositorio no contiene un modelo nuevo, sino una cuantización EXL3 de 3,03 bits por peso del modelo `inclusionAI/Ling-3.1-flash-1019`, publicada por bertholomus (Bertholomus AI, Albert Lee) sobre la revisión `dddfee4b` de los pesos FP8 originales. Ling-3.1-flash es un modelo MoE híbrido de la familia Ling de Ant Group, con 560.000 millones de parámetros totales y 25.000 millones activos por token, pensado para tareas agénticas y razonamiento de contexto largo. La cuantización reduce los pesos a 220,6 GB en 35 shards, lo que permite servirlo en dos nodos NVIDIA DGX Spark (GB10) con paralelismo tensorial 2.

La relevancia de esta ficha es doble. Por un lado, documenta una receta de cuantización mixta poco habitual (3 bits para expertos enrutados, 4 bits para atención KDA, 5 bits para expertos compartidos y 6 bits para MLA y cabeza de salida) con métricas de fidelidad numérica frente a una referencia en fp32. Por otro, describe un stack de servicio muy específico: motor TensorFold con una rama propia (`ling-3.1-tp2`), drafting MTP activado y un enlace RoCE directo entre los dos nodos.

Conviene leerla como lo que es: un artefacto de despliegue probado en un hardware concreto, no como el modelo completo. La model card original, los benchmarks de capacidad y la plantilla de prompt viven en la página de inclusionAI, y esta cuantización no se ha evaluado todavía contra el FP8 original en tareas downstream.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido (`bailing_hybrid` / `bailing_v3`): 72 capas, 63 con atención linear KDA y 9 con atención MLA; 68 capas con 512 expertos enrutados cada una y MLP densa en las capas 0-3; capa MTP para drafting |
| Parámetros totales | 560 B según las fuentes públicas del modelo base; el índice safetensors de este repo declara 110.279.977.792, cifra que no cuadra con los 220,6 GB del repo a 3,03 bpw |
| Parámetros activos | 25 B por token (modelo base) |
| Longitud de contexto | 262.144 tokens (`max_position_embeddings` de la config, que es la ventana realmente ejecutada); el modelo base declara 1 M de tokens |
| Tipos de cuantización | EXL3 3,03 bpw con precisión mixta por componente: expertos enrutados 3 bits, expertos compartidos 5 bits, atención KDA 4 bits, MLP densa 4 bits, atención MLA 6 bits (`kv_b_proj` sin cuantizar), cabeza de salida 6 bits, capa MTP 4 bits; codebook `mul1` |
| Idiomas soportados | no disponible (la model card de la cuantización no los detalla) |
| Licencia | MIT (los pesos derivados mantienen la licencia MIT del modelo base) |
| Formato de pesos | safetensors EXL3 para exllamav3, 35 shards, 220,6 GB; requiere particionado en carpetas por rank antes del servicio |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un MoE híbrido de la familia Bailing v3 de Ant Group, con dos mecanismos de atención conviviendo: 63 capas usan KDA (atención linear con estado, del linaje de Kimi Delta Attention) y 9 capas usan MLA (multi-head latent attention). De las 72 capas totales, 68 incorporan 512 expertos enrutados y las 4 primeras mantienen una MLP densa. El modelo incluye además una capa de multi-token prediction (MTP) que aquí se cuantiza a 4 bits y se usa como cabecera de drafting para decodificación especulativa.

No hay datos de entrenamiento disponibles en la información proporcionada: ni número de tokens, ni composición del dataset, ni si hubo RLHF o DPO. Lo que sí documenta esta ficha es el proceso de cuantización: conversión desde los pesos FP8 originales a una copia BF16 intermedia (cada peso FP8 multiplicado por su escala de bloque en fp32 y redondeado una sola vez a bf16), y después una pasada de EXL3 1.5.3 con un módulo específico para Ling-3.1. La conversión completa tardó 20 h 7 min en un GB10, con un segundo GB10 cuantizando parte de cada capa a partir de la capa 8. La calibración es la por defecto del conversor: 250 filas de 2.048 tokens. Los tensores que el conversor omite (embeddings, norms, router, `kv_b_proj`, convoluciones cortas de KDA) se escriben de vuelta con los bytes y el dtype exactos de la copia BF16.

## Capacidades

- Generación de texto y conversación multi-turno, con plantilla de chat y tokenizer originales de inclusionAI sin modificar.
- Razonamiento híbrido nativo: Ling-3.1-flash se presenta como modelo de razonamiento para tareas complejas del mundo real, con modo de pensamiento según la model card del modelo base.
- Trabajo agéntico: la versión 1019 se orienta explícitamente a tareas de agente, con mejoras reportadas por terceros en AA-Briefcase (de ~1400 a 1524 Elo) y AutomationBench-AA (del 62 % al 68 %).
- Contexto largo: ventana de 262.144 tokens en esta puesta en servicio, con prefill medido hasta 255K tokens.
- Decodificación especulativa mediante la capa MTP, con drafting exacto (mismos tokens que la decodificación serie en 6 de 6 prompts de prueba).
- Capacidades multimodales, de audio o de tool calling: no disponible en la información proporcionada para este modelo base concreto.

## Casos de uso

- Análisis de repositorios y documentación extensa: con 262.144 tokens de ventana se puede cargar un monorepo mediano o un conjunto completo de especificaciones y hacer preguntas transversales sin trocear el contexto. El prefill de 568-696 tok/s entre 2K y 36K tokens hace viables sesiones de decenas de miles de tokens.
- Agente autónomo de larga duración: la combinación de contexto largo, capa MTP para acelerar la generación y el perfil agéntico de la versión 1019 encaja en bucles de planificación-ejecución con muchas iteraciones y historial acumulado.
- Procesamiento por lotes de documentos legales o contractuales en una máquina pequeña: dos GB10 consumen mucho menos que un clúster de A100/H100 y permiten dejar el modelo residente para ingerir contratos de cientos de páginas de forma continua.
- Asistencia sobre base de código propietaria en entornos con requisitos de soberanía del dato: al ser MIT y ejecutarse on-premise en dos nodos, no hay dependencia de API externa ni salida de datos.
- Evaluación de cuantizaciones y reproducción de recetas: el repositorio documenta bits por componente, comando de conversión, calibración y métricas de fidelidad, lo que lo convierte en una referencia útil para quien quiera replicar el esquema EXL3 mixto en otros MoE.
- Investigación en decodificación especulativa: la capa MTP cuantizada a 4 bits y la verificación de que el drafting es exacto permiten estudiar el equilibrio entre tasa de aceptación y coste de memoria en un modelo de 560 B.
- Servicio interno de chat técnico con contexto de 255K: útil para equipos que necesitan resumir y consultar actas, tickets e hilos de correo acumulados, aceptando el coste de 19 minutos hasta el primer token en el peor caso de ventana completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K) en la información disponible para esta cuantización. Las únicas métricas publicadas son de fidelidad numérica del motor y de velocidad de servicio.

| Métrica | Valor | Contexto |
|---|---|---|
| Acuerdo top-1 vs referencia fp32 | 0,9712 | 40 prompts, 66.103 posiciones |
| KL media vs referencia fp32 | 0,0132 | misma prueba |
| Acuerdo top-1 vs referencia bf16 | 0,9715 | misma prueba |
| KL media vs referencia bf16 | 0,0138 | misma prueba |
| Referencia bf16 vs fp32 (acuerdo / KL) | 0,9726 / 0,0136 | cota de referencia del propio ruido de bf16 |
| Decode con drafting | 35,1-39,3 tok/s | prompts hasta 6,6K tokens |
| Decode serie (sin drafting) | 22,5-24,1 tok/s | prompts hasta 6,6K tokens |
| Decode a 255K de contexto | 28,8-29,1 tok/s | ventana casi completa |
| Prefill | 568-696 tok/s | de 2K a 36K tokens |
| Prefill a 255K | 224 tok/s (19,0 min hasta el primer token) | ventana casi completa |
| Índice de inteligencia (terceros) | 44 (frente a 41 de la versión anterior) | Artificial Analysis, vía theresanaiforthat.com |

## Requisitos de hardware

- VRAM/memoria: 103,4 GiB por nodo sobre 123,79 GiB disponibles; el sistema deja solo ~2-4 GiB libres durante el servicio (mínimo observado 1,94 GiB). El repo ocupa 220,6 GB en disco y hay que partirlo en dos carpetas de ~112 GB.
- GPU validadas: 2× NVIDIA DGX Spark (GB10) unidas por enlace directo RoCE. No se ha probado otro hardware.
- GPU de consumo: no cabe. Un solo GB10 de 128 GB de memoria unificada ya va al límite; una RTX 4090 de 24 GB o similar queda muy lejos, ni siquiera con cuantizaciones más agresivas del mismo modelo.
- Despliegue: exclusivamente con TensorFold, rama `ling-3.1-tp2` de bertholomus (commit de motor `72f16e48`), con la familia de motores `bailing_v3`. El módulo de exllamav3 sirve para convertir, pero la exportación tensor-parallel y el enganche del draft MTP no están implementados y lanzan excepción; no se ha ejecutado generación con exllamav3.
- Latencia y throughput: los indicados en la tabla anterior, medidos con una sola petición a la vez y decodificación greedy. No hay datos de concurrencia ni de batching.
- Procedimiento: `hf download`, particionado en carpetas por rank con las herramientas del motor y arranque de ambos ranks según la receta v0.2.0.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| bertholomus/Ling-3.1-flash-1019-EXL3-3.03bpw | 560 B totales / 25 B activos | 262.144 ejecutados (1 M declarado) | EXL3 3,03 bpw, 220,6 GB | MIT | Requiere TensorFold y 2× GB10; drafting MTP exacto; sin evaluar contra FP8 |
| inclusionAI/Ling-3.1-flash-1019 (original) | 560 B totales / 25 B activos | 1 M declarado | FP8 (safetensors) | MIT | Referencia de calidad; ocupa aproximadamente el triple de memoria, no sirve en 2× GB10 |
| turboderp/Ling-3.1-flash-exl3 | no disponible | no disponible | EXL3 (varios quants) | MIT | Cuantización EXL3 del Ling-3.1-flash sin el sufijo 1019; detalles de bpw y tamaño no disponibles en la búsqueda |
| Ling-3.1-flash (versión anterior a 1019) | 560 B totales / 25 B activos | no disponible | no disponible | MIT | Índice de inteligencia 41 frente a 44 de la 1019 según terceros |

## Limitaciones y advertencias

- Solo se ha probado con la rama propia de TensorFold en dos GB10 con enlace RoCE. En cualquier otro hardware o motor el repositorio no está validado.
- El margen de memoria es mínimo: 2-4 GiB libres por nodo, con un mínimo de 1,94 GiB. No se puede compartir la GPU con otro proceso.
- El modelo base declara 1 M de tokens de contexto, pero aquí solo se ha ejecutado la ventana de 262.144 tokens de la config. Por encima de esa cifra no hay ninguna medición.
- La calidad de la cuantización no se ha medido contra el FP8 original en tareas downstream. Las métricas publicadas (acuerdo top-1 de 0,9712, KL de 0,0132) miden la aritmética del motor frente a una referencia, no la degradación en benchmarks.
- El acuerdo top-1 no es perfecto: en torno al 3 % de las posiciones difieren del token más probable de la referencia fp32, lo que en generaciones largas puede desviar la salida.
- Riesgo de alucinación y sesgos: no hay información específica publicada para esta cuantización; aplican los del modelo base, no documentados aquí.
- Idiomas: no disponible. No se puede confirmar el soporte multilingüe de esta variante a partir de la información proporcionada.
- Licencia MIT permite uso comercial y derivados, pero exige conservar el aviso de copyright y la atribución a inclusionAI, turboderp, ashhart y Bertholomus AI según corresponda.
- El proyecto no está afiliado ni respaldado por inclusionAI, NVIDIA, los autores de TensorFold ni los de exllamav3.
- Sin datos de throughput concurrente: las cifras son de una petición cada vez, insuficientes para dimensionar un servicio multiusuario.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/bertholomus/Ling-3.1-flash-1019-EXL3-3.03bpw
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.1-flash-1019
- Ling-3.1-flash (versión previa): https://huggingface.co/inclusionAI/Ling-3.1-flash
- Receta de despliegue y mediciones: https://github.com/bertholomus/ling-3.1-tensorfold-tp2-2xgb10
- Rama del motor TensorFold usada: https://github.com/bertholomus/TensorFold/tree/ling-3.1-tp2
- TensorFold (repositorio original): https://github.com/ashhart/TensorFold
- Rama de exllamav3 con el módulo Ling-3.1: https://github.com/bertholomus/exllamav3/tree/ling-3.1
- exllamav3 (turboderp): https://github.com/turboderp-org/exllamav3
- Otra cuantización EXL3 del modelo: https://huggingface.co/turboderp/Ling-3.1-flash-exl3
- Ficha de Ling-3.1 en OpenLM.ai: https://openlm.ai/ling-3.1/
- Documentación de la familia Ling (Ant Group): https://developer.ant-ling.com/en/docs/models/ling/
- Ficha de terceros con el índice de Artificial Analysis: https://theresanaiforthat.com/model/ling-3-1-flash-1019/
- Kernels KDA usados en la referencia: https://github.com/fla-org/flash-linear-attention

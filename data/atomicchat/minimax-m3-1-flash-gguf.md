# AtomicChat/MiniMax-M3.1-Flash-GGUF

## Resumen

MiniMax-M3.1-Flash es un modelo de lenguaje multimodal (texto e imagen) de tipo Mixture-of-Experts desarrollado por MiniMax. AtomicChat publica aquí una conversión a GGUF para su ejecución local con llama.cpp, con un total de 426.174.572.928 parámetros (428B según la model card del cuantizador), de los cuales 23B se activan por token. Su gran tamaño bruto lo sitúa en la categoría de modelos que requieren estaciones de trabajo de gama alta o clústeres multi-GPU, pero su naturaleza MoE permite un throughput relativamente alto para su volumen de parámetros.

El modelo resuelve el problema de desplegar un LLM de escala frontier en hardware propio mediante cuantizaciones agresivas (desde IQ2_XXS hasta Q4_K) que reducen el peso en disco desde 112 GB hasta 257 GB. La model card documenta métricas de fidelidad frente a Q8_0 (KLD medio y acuerdo top-1) para cada archivo, lo que permite elegir el compromiso calidad/memoria con datos concretos en lugar de estimaciones.

Es relevante ahora porque combina atención dispersa propietaria (MiniMax Sparse Attention), entrenamiento de expertos orientado a FP4 y un pipeline image-text-to-text en un único checkpoint convertible a GGUF estándar, sin parches de runtime. La licencia es `minimax-community`, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts con MiniMax Sparse Attention |
| Parametros totales | 426.174.572.928 (428B) |
| Parametros activos | 23B por token |
| Longitud de contexto | 32.768 tokens documentados en los ejemplos de ejecución; la model card indica 0,14 MB por token de caché de atención (1,1 GB a 8k, 4,5 GB a 32k) |
| Tipos de cuantizacion | AD-IQ2_XXS, AD-Q2_K, AD-IQ3_S, AD-Q4_K (además de Q2_K, Q3_K_M y Q4_K_M de la versión de lanzamiento, reemplazados) |
| Idiomas soportados | No disponible (el conjunto de calibración cubre 30 idiomas) |
| Licencia | minimax-community |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es un transformer MoE con 428B parámetros totales y 23B activos por token, lo que implica una ratio de activación de aproximadamente el 5,4 %. Incorpora MiniMax Sparse Attention, un mecanismo de atención dispersa que en llama.cpp solo se ejecuta con flash attention activado (`-fa on`) y sin `--kv-unified`. El checkpoint original de MiniMax está en MXFP8/NVFP4, y la model card señala que los expertos fueron entrenados para FP4, lo que explica en parte el comportamiento de las cuantizaciones de baja precisión.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) en la información proporcionada. La conversión de AtomicChat emplea un importance matrix calculado sobre el propio formato de chat de M3.1 Flash, con calibración en dominios agéntico, código, razonamiento y 30 idiomas, y mantiene atención, experto compartido y embeddings en mayor precisión mientras comprime los expertos enrutados. Los archivos se dividen en partes de hasta 45 GB y el chat template va embebido en cada uno.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 32k tokens.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`).
- Razonamiento con niveles de esfuerzo configurables (la model card menciona "low reasoning effort" en sus pruebas de chat).
- Tool calling / function calling, verificado en las comprobaciones de chat de la model card.
- Salida estructurada en JSON, también validada en las comprobaciones.
- Capacidades multilingües: la calibración cubre 30 idiomas y una de las comprobaciones de chat exige respuesta en un idioma distinto del inglés.
- Aritmética y razonamiento numérico a bajo esfuerzo de razonamiento.
- Uso agéntico y multi-step reasoning (el conjunto de calibración incluye datos agénticos).

## Casos de uso

- Asistentes conversacionales de contexto largo: con 32k tokens de ventana y un coste de caché de atención de 0,14 MB por token, puede mantener hilos de conversación extensos con historial completo sin truncar.
- Automatización de atención al cliente multilingüe: la cobertura de 30 idiomas en calibración y las comprobaciones de respuesta no inglesa lo hacen apto para soporte en varios mercados desde un único despliegue.
- Pipelines de código en producción: el soporte de tool calling y JSON estructurado permite integrarlo en flujos de CI/CD para revisión de parches, generación de tests o clasificación de errores con salida parseable.
- Procesamiento de documentos con imagen: al ser image-text-to-text, puede extraer y razonar sobre capturas, diagramas o formularios escaneados combinados con instrucciones textuales.
- Agentes autónomos de múltiples pasos: los datos de calibración incluyen tráfico agéntico y el modelo soporta function calling, lo que encaja con orquestadores que encadenan herramientas.
- Despliegue local en estaciones de trabajo de 128-384 GB: con AD-IQ2_XXS (104,5 GiB de memoria) cabe en un Mac de 128 GB con el límite de GPU elevado o en un DGX Spark, útil para prototipado sin nube.
- Inferencia por lotes en servidores multi-GPU: con AD-Q4_K (239,5 GiB) en máquinas de 384 GB o varios aceleradores, para tareas de generación masiva donde la fidelidad al modelo original importa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible. La model card sí publica métricas de fidelidad de cuantización frente a Q8_0, medidas con llama.cpp `f5027fb21307` sobre texto reservado en el formato de chat del modelo, con contexto de 4096 tokens:

| Archivo | Tamano | KLD medio | Acuerdo top-1 | Comprobaciones de chat |
|---|---:|---:|---:|---|
| Q4_K_M (stock de lanzamiento, reemplazado) | 258,0 GB | 0,9548 | 75,2 % | — |
| AD-Q4_K | 257,2 GB | 0,7884 | 78,6 % | 4/4 |
| AD-IQ3_S | 208,9 GB | 0,8916 | 75,9 % | 4/4 |
| Q3_K_M (stock de lanzamiento, reemplazado) | 203,5 GB | 1,1442 | 70,9 % | 4/4 |
| AD-Q2_K | 161,6 GB | 1,1346 | 71,1 % | 4/4 |
| Q2_K (stock de lanzamiento, reemplazado) | 155,9 GB | 1,6387 | 62,0 % | — |
| AD-IQ2_XXS | 112,2 GB | 1,8437 | 59,8 % | 4/4 |

La propia model card advierte que estos niveles de KLD están lejos de lo habitual en otros modelos a esos tamaños y que la comparación debe hacerse entre archivos de este repositorio, no contra otras fichas. No se publica perplejidad porque, según el autor, resulta errática en este modelo de chat.

## Requisitos de hardware

- Memoria para el modelo según archivo: AD-IQ2_XXS 104,5 GiB; AD-Q2_K 150,5 GiB; AD-IQ3_S 194,6 GiB; AD-Q4_K 239,5 GiB.
- Memoria adicional para contexto: aproximadamente 0,14 MB por token de caché de atención (1,1 GB a 8k, 4,5 GB a 32k).
- AD-IQ2_XXS cabe en un Mac de 128 GB con el límite de GPU elevado (`sudo sysctl iogpu.wired_limit_mb=245000` en un equipo de 256 GB), en un DGX Spark o en un PC de 128 GB de RAM con GPU.
- AD-Q2_K requiere máquinas de 192 GB; AD-IQ3_S, de 256 GB; AD-Q4_K, de 384 GB o varios GPUs.
- No cabe en GPUs de consumo individuales tipo RTX 4090 (24 GB) en ninguna de las cuantizaciones publicadas.
- Despliegue mediante llama.cpp: `llama-server -m ... -ngl 99 -c 32768 -fa on --jinja`, o directamente desde el hub con `-hf AtomicChat/MiniMax-M3.1-Flash-GGUF:AD-IQ3_S`.
- Requisitos de runtime: flash attention obligatorio (`-fa on`) por la atención dispersa, y sin `--kv-unified`.
- Latencia y throughput: no disponibles. La model card solo indica que, por sus 23B activos, "corre rápido para su tamaño".

## Comparativa con modelos similares

No se dispone de datos de benchmarks de tareas para MiniMax-M3.1-Flash en la información proporcionada, por lo que una comparación de rendimiento con alternativas no puede sustentarse. A continuación se comparan únicamente los atributos verificables frente a otros MoE de gran escala con conversión GGUF comunitaria:

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato GGUF |
|---|---|---|---|---|---|
| MiniMax-M3.1-Flash (este) | 426B | 23B | 32k documentado | minimax-community | Sí (AtomicChat) |
| DeepSeek-V3 | no disponible en esta ficha | no disponible | no disponible | no disponible | no disponible |
| Qwen3 MoE de gran escala | no disponible en esta ficha | no disponible | no disponible | no disponible | no disponible |

No se han proporcionado datos de modelos comparables en la información disponible; la tabla anterior solo refleja los atributos del modelo evaluado.

## Limitaciones y advertencias

- Licencia `minimax-community`: es necesario revisar el archivo LICENSE del repositorio antes de cualquier uso comercial; la model card la marca como "other".
- Los expertos fueron entrenados para FP4 y el modelo usa atención dispersa, lo que según el propio autor degrada la fidelidad de las cuantizaciones más de lo habitual: incluso AD-Q4_K solo coincide con Q8_0 en el 78,6 % de los tokens siguientes.
- AD-IQ2_XXS baja al 59,8 % de acuerdo top-1 y un KLD de 1,8437; no es recomendable para producción sensible a la calidad.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Sesgos: no documentados en la información proporcionada.
- Idiomas: la lista oficial de idiomas soportados no está disponible; solo se sabe que la calibración cubre 30 idiomas.
- La atención dispersa obliga a usar flash attention y prohíbe `--kv-unified` en llama.cpp; configuraciones alternativas pueden fallar o dar resultados incorrectos.
- En macOS es imprescindible elevar el límite de memoria cableada de la GPU antes de cargar; el ajuste se pierde al reiniciar.
- El repositorio ocupa 741,6 GB en total y los archivos se reparten en partes de hasta 45 GB, lo que exige espacio de almacenamiento y ancho de banda considerables.
- Las métricas de calidad se midieron contra Q8_0 y no contra BF16, por lo que el KLD real de cada archivo es ligeramente superior al reportado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/AtomicChat/MiniMax-M3.1-Flash-GGUF
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-M3.1-Flash
- Atomic Chat: https://atomic.chat/?utm_source=huggingface&utm_medium=referral&utm_campaign=hf_minimax_m3_1_flash&utm_content=btn_atomic
- Discord de AtomicChat: https://discord.gg/8wGSsvmg4V
- GitHub de Atomic-Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- X (Twitter) de AtomicChat: https://x.com/atomic_chat_hq

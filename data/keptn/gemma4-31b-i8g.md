# keptn/gemma4-31b-i8g

## Resumen

keptn/gemma4-31b-i8g es una cuantización int8 del modelo multimodal google/gemma-4-31B-it, empaquetada en un único fichero de 33,37 GiB en formato propietario `.rad` para el motor de inferencia radiance sobre GPUs AMD RDNA4. No es un modelo nuevo ni un fine-tuning: es una conversión de pesos que mantiene la arquitectura, el tokenizador y las capacidades del original, pero reduce las capas lineales del trunk a int8 con una escala bf16 por cada 128 pesos, sin datos de calibración ni GPTQ. El objetivo es claro: hacer que un modelo de 31B con contexto de 262.144 tokens y torre de visión quepa en configuraciones multi-GPU de consumo profesional AMD, algo imposible en una sola tarjeta.

La relevancia del artefacto es doble. Por un lado, demuestra que la cuantización W8A8 con redondeo al más cercano es suficiente para preservar la calidad del bf16 original (KL media de 0,00236 y 98,8 % de coincidencia en el token top-1 sobre MT-Bench). Por otro, está atado a un stack muy concreto: radiance 1.13.0 o superior, GPUs RDNA4 (probado en dos y cuatro Radeon AI PRO R9700) y decodificación especulativa mediante la cabeza asistente de Google con 3 tokens de borrador. No es un modelo portable a vLLM, llama.cpp ni Ollama.

El modelo base es Gemma 4 31B instruct, multimodal (texto, imagen y vídeo), con 32 cabezas de atención y una ventana de contexto de 262.144 tokens. Esta ficha describe el artefacto cuantizado y sus condiciones de uso, no las capacidades intrínsecas del Gemma 4 original más allá de lo que el autor documenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (Gemma 4), con cabeza asistente para decodificación especulativa; trunk cuantizado a int8 |
| Parametros totales | no disponible (modelo base de 31B, según nomenclatura) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | W8A8: pesos int8 con una escala bf16 por cada 128 pesos; activaciones int8 con una escala por token y 128 valores; lm_head int8; resto de la cabeza asistente y torre de visión en bf16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | `.rad` (formato propietario de radiance), fichero único de 33,37 GiB |
| Entradas | texto, imagen, vídeo |
| Motor de inferencia | radiance 1.13.0 o superior, sobre AMD RDNA4 |
| Multi-GPU | tensor parallel 2 o 4 (3 no es posible: 32 cabezas de atención no se dividen entre tres) |
| Decodificacion especulativa | cabeza asistente de Google en bf16, 3 tokens de borrador |
| Version del artefacto | 1.0 (2026-10-24) |

## Arquitectura y entrenamiento

El artefacto no entrena nada: parte del checkpoint bf16 `google/gemma-4-31B-it` (revisión `842da379`), le añade la cabeza asistente `google/gemma-4-31B-it-assistant` (revisión `627c5ec1`) y redondea al más cercano todas las capas lineales del trunk a int8, con una escala bf16 compartida por cada bloque de 128 pesos. Los dos `lm_head` (el del modelo principal y el de la cabeza asistente) también pasan a int8 con el mismo esquema. La torre de visión y el resto de capas de la cabeza asistente permanecen en bf16. No hay calibración, ni suavizado de activaciones, ni GPTQ, ni AWQ: es una cuantización post-entrenamiento puramente geométrica.

La conversión se realiza con la herramienta `rad-convert` del propio proyecto radiance, usando una receta (`gemma4-31b-i8g.recipe`) y fijando `quantization_config.quant_method=compressed-tensors`. El autor documenta que una reconstrucción con la misma receta produce pesos idénticos, con la única diferencia de un byte en la cabecera (fecha de build del conversor), lo que cambia el sha256 pero no el contenido numérico. La innovación técnica destacable no está en la cuantización en sí, sino en la integración con decodificación especulativa mediante MTP (multi-token prediction) de Google y en el soporte de KV cache en fp8, que permite sostener contextos largos en memoria multi-GPU.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, heredados del Gemma 4 31B instruct original.
- Procesamiento de imagen: pipeline `image-text-to-text`, útil para VQA, OCR y descripción de documentos.
- Procesamiento de vídeo: el autor reporta evaluación sobre MVBench con 4 frames por clip.
- Modo thinking opcional por petición, activable con `"chat_template_kwargs": {"enable_thinking": true}`.
- Decodificación especulativa con cabeza asistente: 3 tokens de borrador por paso, lo que acelera el decode en entornos multi-GPU.
- Soporte de contexto largo: 262.144 tokens compartidos entre todas las secuencias del pool KV.
- Servidor HTTP compatible con API de chat (radiance expone en `--host`/`--port`), con parámetros de sampling de Google (temperatura 1.0, top_p 0.95, top_k 64).
- No se documenta soporte explícito de tool calling, function calling ni agentes multi-paso en la información disponible; debe asumirse como capacidad del modelo base no verificada en este artefacto.

## Casos de uso

- Análisis de documentos largos con imágenes: el modelo acepta texto e imagen en la misma petición y mantiene 262.144 tokens de contexto, lo que permite procesar contratos escaneados, informes con figuras o expedientes completos sin trocear. La torre de visión se puede colocar en RAM (`--vision-tower-placement ram`) para liberar VRAM.
- Asistencia conversacional multi-turno en producción: con `--max-num-seqs 8` y un pool KV de hasta 2.097.248 tokens en cuatro tarjetas, se pueden sostener varias sesiones simultáneas con historial largo sin reiniciar el servidor.
- Procesamiento de vídeo para moderación o catalogación: el soporte de vídeo con 4 frames por clip y la ventana de contexto permiten describir clips cortos o extraer información estructurada de grabaciones de vigilancia o material audiovisual.
- Despliegue on-premise en clústeres AMD: organizaciones con Radeon AI PRO R9700 que no quieren depender de CUDA pueden servir un 31B multimodal con licencia Apache 2.0 en dos o cuatro tarjetas, con throughput de 89,6 tok/s (2 GPUs) o 142,6 tok/s (4 GPUs) en decode de un solo stream.
- Evaluación comparativa de cuantizaciones: el autor publica métricas KL frente al bf16, lo que convierte este artefacto en referencia para medir el coste de calidad de W8A8 frente a W4A8 y W5 en el mismo motor.
- Investigación sobre decodificación especulativa: al incluir la cabeza asistente y permitir `--num-speculative-tokens`, sirve para estudiar el equilibrio entre aceptación de borradores y latencia en hardware RDNA4.
- Fine-tuning posterior sobre base cuantizada no es el caso de uso: el artefacto es solo de inferencia; para entrenar hay que partir del bf16 original.

## Benchmarks y rendimiento

Calidad frente al bf16 original, medida sobre las 80 preguntas de MT-Bench (ambos turnos, 42.283 tokens de respuesta, thinking off, referencia en HF transformers con fp32):

| Metrica | Este fichero (i8g) | keptn/gemma4-31b-w4a8 | keptn/gemma4-31b-w5 |
|---|---|---|---|
| KL media | 0,00236 | 0,0517 | 0,00803 |
| KL percentil 99 | 0,0311 | 0,721 | 0,107 |
| Token top-1 coincidente | 98,8 % | 94,6 % | 97,8 % |
| Ratio de perplejidad | ×1,004 | ×1,056 | ×1,010 |

Rendimiento en Radeon AI PRO R9700 a 215 W, radiance main 248ecf5, KV fp8, 3 tokens de borrador, thinking off, BetterBench 0.6.1, temperatura 0,7, mediana de tokens por segundo:

| Metrica | 1 tarjeta | 2 tarjetas | 4 tarjetas |
|---|---|---|---|
| Decode, un stream | no cabe | 89,6 | 142,6 |
| Prefill a 24k tokens | no cabe | 2.534 | 3.451 |
| 4 streams, total | no cabe | 264 | 404 |

Calidad multimodal (comparación con el bf16 original, greedy, thinking off, 2 tarjetas):

| Entrada | Casos | Misma respuesta | KL media | Token top-1 coincidente |
|---|---|---|---|---|
| Imágenes (DocVQA y AI2D) | 20 | 16/20 | 0,471 | 66/70 |
| Vídeo (MVBench, 5 clips, 4 frames) | 5 | 4/5 | 0,0272 | 31/32 |

Memoria de contexto (pool KV a 262.144, fp8, tokens totales compartidos entre secuencias):

| Configuracion | 2 secuencias | 4 secuencias | 8 secuencias |
|---|---|---|---|
| 1 tarjeta | no cabe | no cabe | no cabe |
| 2 tarjetas | 524.304 | 765.328 | 721.968 |
| 4 tarjetas | 524.352 | 1.048.624 | 2.097.248 |

## Requisitos de hardware

- VRAM: los pesos ocupan 33,37 GiB, por lo que una sola tarjeta de 32 GB no es suficiente. Se necesitan al menos dos GPUs con 32 GB cada una.
- GPUs validadas: Radeon AI PRO R9700 (RDNA4), en configuraciones de 2 y 4 tarjetas. No hay soporte documentado para NVIDIA, CDNA ni RDNA3.
- Configuración de 3 tarjetas no es válida: las 32 cabezas de atención no se dividen entre tres.
- Consumer GPU: no cabe en ninguna tarjeta de consumo de 24 GB o menos; requiere GPUs profesionales de 32 GB o más en pares.
- Despliegue: exclusivamente mediante el motor radiance 1.13.0 o superior, distribuido como imagen Docker `stilldeadcode/radiance:1.13.0`. No compatible con vLLM, llama.cpp, Ollama ni TGI.
- Variables de entorno y flags relevantes: `ROCR_VISIBLE_DEVICES`, `--tp 2` o `--tp 4`, `--kv-cache-dtype fp8`, `--max-model-len`, `--max-num-seqs`, `--max-num-batched-tokens`, `--num-speculative-tokens 3`, `--vision-tower-placement ram`.
- Latencia y throughput: ver tabla de benchmarks (89,6 tok/s decode en 2 GPUs, 142,6 tok/s en 4; prefill de 2.534 a 3.451 tok/s a 24k tokens).
- Para contexto completo (262.144) hay que bajar `--max-num-seqs` a 2.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / motor | Licencia | Calidad relativa |
|---|---|---|---|---|---|
| keptn/gemma4-31b-i8g | 31B (trunk int8) | 262.144 | `.rad` / radiance, AMD RDNA4 | Apache 2.0 | KL 0,00236 frente a bf16 |
| keptn/gemma4-31b-w5 | 31B (W5) | 262.144 | `.rad` / radiance, AMD RDNA4 | Apache 2.0 | KL 0,00803; peor que i8g |
| keptn/gemma4-31b-w4a8 | 31B (W4A8) | 262.144 | `.rad` / radiance, AMD RDNA4 | Apache 2.0 | KL 0,0517; mucho peor que i8g |
| google/gemma-4-31B-it | 31B | 262.144 | safetensors / transformers, vLLM, TGI | Apache 2.0 | Referencia bf16 |

La comparación con alternativas de otros ecosistemas (Llama, Qwen, Mistral de tamaño similar) no está disponible en la información proporcionada. Los tres artefactos de keptn comparten base y motor, por lo que la elección entre ellos es un compromiso entre VRAM y fidelidad: i8g es el más fiel pero requiere 33,37 GiB, mientras que w5 y w4a8 reducen huella a costa de KL notablemente mayor.

## Limitaciones y advertencias

- Dependencia total del motor radiance: el fichero `.rad` no se puede cargar en transformers, vLLM, llama.cpp ni Ollama. Sin radiance 1.13.0 o superior, el artefacto es inservible.
- Hardware restringido a AMD RDNA4. No hay soporte para NVIDIA ni para generaciones anteriores de AMD.
- No cabe en una sola tarjeta: mínimo dos GPUs de 32 GB. Esto excluye la mayoría de estaciones de trabajo de consumo.
- La versión 1.12.0 de radiance no incluye el formato i8a8; hay que actualizar obligatoriamente.
- El soporte de imágenes en configuraciones multi-GPU requiere radiance 1.13.0 o superior (PR #238).
- El fichero compose de referencia está en PR #368, aún no publicado en release; hasta entonces hay que usar el comando `docker run` documentado.
- Riesgo de alucinación: inherente al modelo base Gemma 4 31B instruct; la cuantización int8 no lo incrementa de forma significativa según las métricas KL, pero tampoco lo mitiga.
- Sesgos: no documentados en la información disponible; deben asumirse los del modelo base original.
- Idiomas: no se especifica la lista soportada en este artefacto; consultar la model card del Gemma 4 original.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar los términos del modelo base de Google por si imponen restricciones adicionales de uso aceptable.
- El autor no documenta soporte verificado de tool calling ni de flujos de agentes; no asumir su disponibilidad en producción sin validación previa.
- La calidad multimodal es inferior a la de texto: 16/20 respuestas idénticas en imágenes y KL media de 0,471, lo que sugiere degradación apreciable en tareas visuales frente al bf16.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/keptn/gemma4-31b-i8g
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Cabeza asistente: https://huggingface.co/google/gemma-4-31B-it-assistant
- Cuantización W4A8 del mismo autor: https://huggingface.co/keptn/gemma4-31b-w4a8
- Cuantización W5 del mismo autor: https://huggingface.co/keptn/gemma4-31b-w5
- Motor radiance: https://codeberg.org/StillDeadcode/radiance
- PR de soporte de imágenes multi-GPU: https://codeberg.org/StillDeadcode/radiance/pulls/238
- PR del compose file: https://codeberg.org/StillDeadcode/radiance/pulls/368
- Framework de model cards: https://codeberg.org/keptn42/radiance-model-cards-framework

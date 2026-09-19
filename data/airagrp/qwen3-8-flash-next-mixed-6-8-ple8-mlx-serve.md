# airagrp/Qwen3.8-Flash-Next-mixed-6-8-ple8-mlx-serve

## Resumen

Qwen3.8-Flash-Next-mixed-6-8-ple8-mlx-serve es un empaquetado cuantizado del modelo Qwen/Qwen3.8-Flash-Next, preparado por el usuario airagrp para mlx-serve, el servidor de inferencia basado en MLX de Apple. No es un modelo nuevo: es una conversión del checkpoint original con una mezcla de precisiones (expertos enrutados a 6 bits, atención y resto de módulos a 8 bits, embeddings a 4 bits) pensada para que un modelo de gran escala funcione en un Mac con 128 GB de memoria unificada.

El checkpoint base utiliza la arquitectura Qwen4 preview (model_type: qwen4_exp) e incorpora tres elementos sobre el tronco GDN + MoE habitual: flujos residuales con puertas (4 corrientes de 2560 dimensiones), una tabla de embeddings de n-gramas de 51B de parámetros indexada por bigramas y trigramas, y Qwen Sparse Attention, que mantiene el coste de atención plano con una ventana nativa de 262.144 tokens. Es multimodal (imagen y vídeo) mediante una torre de visión de estilo Qwen3-VL.

Su interés es fundamentalmente práctico: demuestra que un modelo de esta escala puede servirse en local sobre Apple Silicon con ~96 GB residentes, unos 54 tok/s de decodificación y hasta 62 tok/s con el cabezal MTP, evitando cargar en la GPU la tabla de n-gramas gracias a mmap. La contrapartida es que depende exclusivamente del ecosistema MLX y no hay resultados de calidad publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen4 preview (model_type: qwen4_exp): tronco GDN + MoE, Qwen Sparse Attention, flujos residuales con puertas (4 x 2560) y tabla de embeddings de n-gramas |
| Parametros totales | 130.053.111.724 en los shards safetensors (~130B, que corresponden a ~125B de tronco + ~4B del cabezal MTP); el checkpoint completo se cita como 180B al sumar los 51B de la tabla de n-gramas |
| Parametros activos | no disponible (MoE con 512 expertos enrutados por capa en 48 capas, ~121B de parámetros en expertos enrutados; no se especifica cuántos se activan por token) |
| Longitud de contexto | 262.144 tokens nativos (262k) |
| Tipos de cuantizacion | Pack mixto: expertos enrutados 6 bits (grupo 64, 512 x 48 capas, los ~121B); atención, GDN, hyper-connections, indexer, expertos compartidos y lm_head 8 bits (grupo 64); embed_tokens 4 bits (grupo 64); tabla de n-gramas 8 bits (grupo 32, ancho de fila 160); routers, gates de inyección, norms, convs y estado SSM en bf16; cabezal MTP con expertos a 6 bits y proyecciones a 8 bits. La caché KV admite cuantización a 8 bits (--kv-quant 8) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (license: other; license_name: qwen-community-1.0, con archivo LICENSE en el repositorio) |
| Formato de pesos | safetensors (shards cuantizados) + model-vision.safetensors (torre de visión en bf16 denso, ~0,9 GB) + ngram_table.bin (tabla de n-gramas de 57,6 GB en formato safetensors con extensión .bin); librería mlx-serve / MLX |

## Arquitectura y entrenamiento

La model card describe un tronco GDN + MoE con tres modificaciones destacables. La primera son los flujos residuales con puertas: el residual tiene 4 corrientes de 2560 dimensiones, cada bloque lee una media mezclada con sigmoide de las corrientes normalizadas y escribe de vuelta mediante puertas escalares por corriente, y el mezclador final sustituye a la normalización final habitual. La segunda es la tabla de embeddings de n-gramas, con 51B de parámetros y 320.001.536 filas de 160 dimensiones, indexada por bigramas y trigramas hasheados de los token ids e inyectada una sola vez antes de la capa 1; es una consulta pura, sin cómputo, y explica que Qwen cifre el modelo en 125B (el checkpoint completo es 125B de tronco + 51B de n-gramas + 4B de MTP = 180B, 360 GB en bf16). La tercera es Qwen Sparse Attention: a partir de 2048 tokens, cada capa de atención solo lee los 512 bloques de 4 tokens más relevantes por consulta (seleccionados por un indexer pequeño) más el bloque parcial propio de la consulta, de modo que el coste de atención se mantiene plano independientemente del contexto.

Este pack concreto no entrena nada: es una conversión del checkpoint bf16 local con el script tests/convert_qwen38_flash_next.py del repositorio de mlx-serve (--bits 6 --nonexpert-bits 8 --ngram-bits 8 y una segunda pasada --add-vision), que tarda unos 11 minutos en un M5 y produce 105,2 GB de tronco más 57,6 GB de ngram_table.bin. Entre los ajustes de conversión, cada RMSNorm con forma (1 + w) tiene el +1 plegado en el peso almacenado, las convs depthwise se transponen al formato [C, K, 1] de MLX y experts.gate_up_proj se divide en switch_mlp.gate_proj / up_proj. La tabla de n-gramas no se incluye en los shards: va en un único fichero de 8 bits que mlx-serve mapea en memoria y del que desquantiza en CPU, por token, las 16 filas necesarias, subiendo solo el vector de 2560 resultante; el coste es caché de páginas en lugar de memoria residente (frente a los ~55-64 GB residentes adicionales de los packs estilo mlx-lm que sirven la tabla como 128 tensores cuantizados). No hay información sobre composición del dataset, número de tokens de entrenamiento ni fases de RLHF o DPO.

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno, con modo thinking activado por defecto (se desactiva con "enable_thinking": false).
- Razonamiento de varios pasos y uso de herramientas: los tools emplean el formato de llamada XML de Qwen3.8 y mlx-serve lo parsea y coacciona contra esquema.
- Comprensión de imágenes a través de la torre de visión estilo Qwen3-VL (model.visual.*, bf16 denso), con pipeline image-text-to-text.
- Comprensión de vídeo, reflejada en la etiqueta video-text-to-text del repositorio.
- Codificación asistida por decodificación especulativa: el propio cabezal MTP de una capa del checkpoint se carga desde el pack y se activa con --mtp o con "enable_mtp": true por petición.
- Contexto largo de hasta 262.144 tokens nativos, con atención dispersa que mantiene plano el coste a partir de 2048 tokens.
- Generación de código, con ganancia medida del MTP del 13 % en este dominio.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente local de código en un Mac de 128 GB: el pack se sirve con mlx-serve en memoria unificada y usa el cabezal MTP para elevar la decodificación a ~62 tok/s en código frente a ~54 tok/s en modo serial, lo que permite integrarlo en el flujo diario de un desarrollador sin enviar código a la nube.
- Análisis de repositorios o documentación extensa: con 262k tokens de contexto nativo y atención dispersa de coste plano, se pueden pasar árboles de ficheros o manuales completos en un único prompt sin trocear en RAG.
- Revisión de capturas, diagramas o documentación escaneada: la torre de visión acepta entrada de imagen y permite extraer especificaciones o detectar discrepancias entre diseño y código (en turnos con imagen el MTP se declina y la decodificación es serial).
- Análisis de vídeo para resúmenes o extracción de eventos: la etiqueta video-text-to-text y la torre multimodal permiten procesar material audiovisual enviando fotogramas al modelo.
- Agente con tool calling sobre APIs internas: el formato XML de llamadas a funciones más el parseo y la coacción de esquema de mlx-serve permiten encadenar pasos (consulta de base de datos, ejecución de comandos, validación de resultados) manteniendo el modo thinking para planificar.
- Atención al cliente con contexto acumulado: la ventana de 262k tokens permite conservar historiales completos de conversación y documentación de producto en una sola sesión, con la caché KV cuantizada a 8 bits para reducir el coste de memoria.
- Procesamiento por lotes nocturno en hardware propio: el prefill sostenido de ~1,6-1,9k tok/s con prompts de 31k tokens hace viable clasificar, resumir o extraer datos de grandes volúmenes de documentos en local, siempre que la caché de la tabla de n-gramas esté caliente.
- Investigación sobre atención dispersa y embeddings de n-gramas: el pack expone una implementación funcional de Qwen Sparse Attention, de los flujos residuales con puertas y de la inyección por bigramas/trigramas, útil para experimentar con variantes de conversión y cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones de calidad del pack cuantizado frente al checkpoint bf16. Lo único medido por el autor son las cifras de servicio en un M5 de 128 GB con mlx-serve 26.9.2 y mlx 0.32.2:

| Metrica | Valor medido | Condiciones |
|---|---|---|
| Decodificacion serial | ~54 tok/s | Equipo de referencia, sin MTP |
| Decodificacion con MTP | ~62 tok/s | +13 % sobre serial en codigo (61,7 frente a 54,4 tok/s); paridad en prosa corta |
| Prefill sostenido | ~1,6-1,9k tok/s | Prompt de 31.000 tokens |
| Memoria residente maxima | ~96 GB | Mas cache KV, reducible a la mitad con --kv-quant 8 |
| Sobrepeso en prompts cortos | ~1,5 s | PLE mmap walk y seleccion de bloques de atencion dispersa |
| Prefill con cache frio | hasta ~1 s por cada 8k tokens | Lecturas aleatorias en SSD; con cache caliente, coste nulo |
| Variante de MTP a 8 bits | +0,63 GB | Sin diferencia medible de calidad, velocidad ni memoria, por lo que se conserva a 6 bits |

## Requisitos de hardware

- Memoria unificada: ~96 GB residentes para los pesos, más la caché KV. El pack está dimensionado para Macs de 128 GB; con --kv-quant 8 la caché se reduce a la mitad (verificado por el autor, sin pérdida de calidad apreciada).
- GPU recomendadas: no aplica a GPUs discretas. La referencia medida es un Apple M5 con 128 GB de memoria unificada; no se documentan pruebas en A100, H100, RTX 4090 ni similares.
- ¿Cabe en GPU de consumo? Este pack no: es MLX puro y requiere memoria unificada de Apple Silicon. Los ~96 GB residentes quedan fuera de cualquier GPU de consumo actual.
- Almacenamiento: el repositorio ocupa 163,7 GB (105,2 GB de tronco más 57,6 GB de ngram_table.bin). La tabla se mapea en memoria, así que su rendimiento depende de la caché de páginas y, en frío, de la velocidad del SSD.
- Opciones de despliegue: mlx-serve, con el comando mlx-serve --model airagrp/Qwen3.8-Flash-Next-mixed-6-8-ple8-mlx-serve --serve --kv-quant 8 --mtp. No hay soporte declarado para vLLM, TGI, llama.cpp, Ollama ni formatos GGUF en este pack.
- Latencia y throughput: ~54 tok/s en decodificación serial y ~62 tok/s con MTP en código; prefill de ~1,6-1,9k tok/s con prompts largos; ~1,5 s de coste fijo en prompts cortos; hasta ~1 s por cada 8k tokens en prefill con caché fría.
- Versiones probadas: mlx-serve 26.9.2 y mlx 0.32.2. El cabezal MTP se controla con --mtp o "enable_mtp": true, y --mtp-head-kv-quant es neutro en prompts cortos y ahorra KV del cabezal en prompts largos.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparado con otros modelos. La comparación posible se limita a variantes del mismo checkpoint y a la estrategia de empaquetado de la tabla de n-gramas:

| Variante | Parametros | Contexto | Formato y despliegue | Memoria residente | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este pack (mixed-6-8-ple8-mlx-serve) | ~130B en shards safetensors + 51B de tabla de n-gramas en mmap | 262.144 tokens | safetensors + ngram_table.bin, MLX / mlx-serve | ~96 GB mas cache KV | qwen-community-1.0 | Publicado en HuggingFace, 0 descargas y 0 likes |
| Qwen/Qwen3.8-Flash-Next (bf16 original) | 180B (125B tronco + 51B n-gramas + 4B MTP) | 262.144 tokens | bf16, 360 GB | 360 GB de pesos en bf16 | no disponible en la informacion proporcionada | Modelo base referenciado en la model card |
| Packs estilo mlx-lm con la tabla de n-gramas como 128 tensores cuantizados | Mismo checkpoint base | 262.144 tokens | safetensors, MLX | ~96 GB mas ~55-64 GB adicionales de tabla residente a 8 bits | no disponible | Estrategia alternativa descrita, sin referencia publicada |

No se han identificado en la información proporcionada modelos comparables de otros fabricantes con esta combinación de contexto, multimodalidad y despliegue en Apple Silicon.

## Limitaciones y advertencias

- No hay ninguna evaluación de calidad publicada. Toda la información técnica procede de la model card del autor; los únicos datos numéricos son medidas de velocidad y memoria, no de precisión.
- La cuantización mixta (expertos a 6 bits, embeddings a 4 bits) puede degradar la calidad frente al bf16 original. El autor solo verificó que subir el MTP a 8 bits no cambiaba calidad, velocidad ni memoria; no hay comparación global contra bf16.
- La licencia es qwen-community-1.0, marcada como "other". Hay que revisar el archivo LICENSE del repositorio antes de cualquier uso comercial, ya que no se detallan aquí sus restricciones.
- Dependencia exclusiva del ecosistema MLX: no hay pesos GGUF ni soporte para vLLM, TGI, llama.cpp u Ollama. El despliegue queda limitado a Apple Silicon con mlx-serve.
- Acoplamiento a versiones concretas: las medidas y el funcionamiento se han verificado con mlx-serve 26.9.2 y mlx 0.32.2; otras versiones pueden comportarse de forma distinta.
- Huella de disco y de memoria elevada: 163,7 GB de repositorio y ~96 GB residentes más caché KV, lo que exige equipos de 128 GB de memoria unificada y espacio libre abundante.
- Latencia en prompts cortos: ~1,5 s de coste fijo por el recorrido de la tabla de n-gramas en mmap y la selección de bloques de atención dispersa, poco adecuado para cargas interactivas con entradas muy breves.
- Prefill con caché fría: hasta ~1 s adicional por cada 8k tokens de lecturas aleatorias en SSD, penalización relevante si el patrón de acceso no reutiliza páginas.
- En turnos con imagen el MTP se declina y la decodificación pasa a ser serial, con la consiguiente pérdida de velocidad.
- El modo thinking está activado por defecto y puede incrementar el número de tokens generados y la latencia si no se desactiva explícitamente.
- Idiomas soportados no declarados, por lo que no se puede garantizar cobertura multilingüe.
- Riesgo de alucinación no cuantificado y sesgos no evaluados: no hay ninguna auditoría publicada.
- Madurez baja del artefacto: repositorio creado y actualizado el mismo día, con 0 descargas y 0 likes, sin validación independiente de la comunidad.

## Enlaces

- Pack en HuggingFace: https://huggingface.co/airagrp/Qwen3.8-Flash-Next-mixed-6-8-ple8-mlx-serve
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia: archivo LICENSE dentro del repositorio del pack (https://huggingface.co/airagrp/Qwen3.8-Flash-Next-mixed-6-8-ple8-mlx-serve)
- Script de conversión: tests/convert_qwen38_flash_next.py, en el repositorio de mlx-serve (URL no disponible en la información proporcionada)
- Paper, blog o demo oficial: no disponible
- La búsqueda web realizada no devolvió ningún resultado técnico relevante: los enlaces obtenidos correspondían a portales de reserva de hoteles y no guardan relación con el modelo.

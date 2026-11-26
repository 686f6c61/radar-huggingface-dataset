# netprojects/Inkling-2-Mini-LayerFit-MLX-2bit

## Resumen

Inkling-2-Mini-LayerFit-MLX-2bit es una cuantización de 2 bits del modelo Thinking Machines/Inkling-2-Mini, publicada por netprojects para su ejecución en Apple Silicon mediante la librería MLX. El modelo base es un mixture-of-experts (MoE) de 26.388.641.280 parámetros totales, de los cuales aproximadamente 3.400 millones están activos por token, con 24 capas de las cuales las doce centrales se ejecutan tres veces (48 pasadas de capa por token), entrada de texto e imagen y hasta 1M de tokens de contexto. Esta versión concreta pesa 9,5 GB en pesos más 0,64 GB del borrador de decodificación especulativa, y está pensada para Macs con 16 GB de memoria.

La build aplica una receta de cuantización por capas denominada LayerFit™, que asigna a cada grupo de capas su propio número de bits y tamaño de grupo en función de cuánto degrada cada opción la salida del modelo. Los expertos enrutados se re-cuantizan desde sus valores NVFP4/MXFP8 originales a 2 y 3 bits según la capa, la atención oscila entre 4 y 6 bits, los embeddings son de 4 bits y el codificador de visión se comprime a 2 bits. Incluye además el borrador DSpark de decodificación especulativa (mtp.safetensors) y es compatible con mlx-vlm estándar, sin runtime personalizado.

Su relevancia actual radica en que permite ejecutar un MoE multimodal de 26B con contexto de hasta 1M de tokens en hardware de consumo Apple de gama de entrada, a costa de una fidelidad reducida frente al modelo original. Según el autor, la build reproduce el mismo siguiente token que la implementación de referencia en el 90,2% de las posiciones, con una KL media de 0,1066, y obtiene 47/50 en GSM8K (50 preguntas).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con bucle de capas ("looped mixture-of-experts"), 24 capas con las 12 centrales ejecutadas 3 veces (48 pasadas por token) |
| Parametros totales | 26.388.641.280 |
| Parametros activos | ~3.4B por token |
| Longitud de contexto | Hasta 1M tokens |
| Tipos de cuantizacion | 2-bit y 3-bit (grupo 128) en expertos enrutados; 4/5/6-bit en atención según capa; embeddings 4-bit (grupo 128); capa de salida 4-bit (grupo 64); encoder de visión 2-bit (grupo 128) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), más `mtp.safetensors` para el borrador DSpark |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos y una innovación estructural destacable: un esquema de capas en bucle en el que las doce capas centrales se reutilizan tres veces, de modo que cada token atraviesa 48 pasadas de capa pese a tener solo 24 capas físicas. El modelo es multimodal (entrada de texto e imagen) y emplea decodificación especulativa mediante un borrador DSpark empaquetado aparte, que acelera la generación al proponer tokens que el modelo principal verifica.

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) no se proporciona información en la documentación disponible. La ficha de esta build se centra en el proceso de cuantización: los expertos enrutados se re-cuantizan desde los valores NVFP4/MXFP8 liberados por el autor original, y la receta LayerFit™ se eligió midiendo el impacto de cada decisión de bits sobre la salida del modelo, puntuando cada receta contra el original antes de publicarla. El resultado es una build MLX estándar que carga en mlx-vlm sin modificaciones.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Comprensión de imágenes (pipeline image-text-to-text), con encoder de visión incluido, aunque comprimido a 2 bits.
- Soporte de tool calling / function calling en formato OpenAI a través de la librería inkling2-mlx.
- Decodificación especulativa con el borrador DSpark incluido (mtp.safetensors).
- Contexto largo de hasta 1M tokens en el modelo base.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo "thinking" u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en un Mac de 16 GB: el modelo cabe en 9,5 GB de pesos y permite mantener conversaciones multi-turno sin conexión, aprovechando el contexto largo del modelo base para conservar historial extenso.
- Análisis de imágenes en local: al incluir el encoder de visión, puede describir o responder preguntas sobre capturas, diagramas o fotos; conviene asumir menor exactitud en detalles finos por la cuantización a 2 bits del encoder (el autor documenta confundir un círculo con un óvalo).
- Automatización con tool calling: mediante inkling2-mlx se pueden definir funciones en formato OpenAI y dejar que el modelo orqueste llamadas a APIs locales o scripts, útil para prototipos de agentes en estación de trabajo.
- Procesamiento de documentos largos: con hasta 1M tokens de contexto en el modelo base, es adecuado para resumir o extraer información de ficheros extensos, aunque en un Mac de 16 GB conviene limitar el prompt a unos pocos miles de tokens por restricciones de memoria.
- Generación asistida de código en editor local: integrable como backend MLX en flujos de desarrollo en Apple Silicon, con la decodificación especulativa DSpark reduciendo la latencia percibida.
- Evaluación e investigación de cuantización extrema: sirve como banco de pruebas para estudiar el impacto de recetas por capas (LayerFit™) en la fidelidad de un MoE de 26B, comparando métricas de KL y coincidencia de siguiente token frente al modelo original.
- Prototipado de pipelines multimodales sin GPU dedicada: permite validar arquitecturas image-text-to-text en hardware Apple antes de escalar a despliegues con GPUs.

## Benchmarks y rendimiento

Datos publicados por el autor de la cuantización (no son benchmarks del modelo base frente a terceros, sino métricas de fidelidad frente a la implementación de referencia de Thinking Machines y una prueba de GSM8K):

| Metrica | Valor |
|---|---|
| Mismo siguiente token que el codigo de referencia | 90.2% de las posiciones |
| KL media frente al codigo de referencia | 0.1066 |
| GSM8K (50 preguntas) | 47/50 |
| Memoria pico con prompt de 8K tokens | 17.05 GB |
| Tamano de pesos | 9.5 GB + 0.64 GB de borrador |

Comparación con otras builds del mismo autor:

| Build | Tamano | Mismo siguiente token | KL | GSM8K | Memoria pico (8K) |
|---|---|---|---|---|---|
| MLX-4-8bit (recomendada) | 19.5 GB + 0.64 GB | 98.4% | 0.0018 | 47/50 | 27.8 GB |
| LayerFit 3-bit | 14.1 GB + 0.64 GB | 95.5% | 0.0225 | 45/50 | 21.4 GB |
| LayerFit 2.5-bit | 10.8 GB + 0.64 GB | 91.0% | 0.0656 | 46/50 | 18.25 GB |
| LayerFit 2-bit (esta build) | 9.5 GB + 0.64 GB | 90.2% | 0.1066 | 47/50 | 17.05 GB |
| LayerFit 4-bit | 16.5 GB + 0.64 GB | 97.7% | 0.0101 | 46/50 | 23.6 GB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) del modelo base en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 9,5 GB de pesos + 0,64 GB de borrador; memoria pico medida de 17,05 GB con un prompt de 8K tokens.
- Hardware objetivo: Macs con 16 GB de memoria unificada (build "stretch"); el autor recomienda cerrar otras aplicaciones, limitar los prompts a unos pocos miles de tokens y elevar el límite de memoria cableada de la GPU con `sudo sysctl iogpu.wired_limit_mb=12800`.
- Para 24 GB existe la build de 2,5 bits (10,8 GB); para 32 GB, las de 3 y 4 bits (14,1 y 16,5 GB); para 48 GB o más, la de 4/8 bits (19,5 GB, recomendada).
- GPU dedicadas (A100, H100, RTX 4090): no aplica; esta build es específica de MLX para Apple Silicon.
- Despliegue: mlx-vlm estándar (soporte en main, próxima release) y la librería inkling2-mlx para tool calling en formato OpenAI; no requiere runtime personalizado.
- Latencia y throughput: no disponibles de forma numérica; el borrador DSpark de decodificación especulativa está incluido para reducir la latencia de generación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / plataforma | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-LayerFit-MLX-2bit (esta build) | 26.4B totales, ~3.4B activos | 1M | Apache 2.0 | safetensors MLX, Apple Silicon | 9.5 GB, fidelidad 90.2% / KL 0.1066 |
| Inkling-2-Mini-LayerFit-MLX-2.5bit | 26.4B totales, ~3.4B activos | 1M | Apache 2.0 | safetensors MLX, Apple Silicon | 10.8 GB, fidelidad 91.0% / KL 0.0656 |
| Inkling-2-Mini-MLX-4-8bit | 26.4B totales, ~3.4B activos | 1M | Apache 2.0 | safetensors MLX, Apple Silicon | 19.5 GB, fidelidad 98.4% / KL 0.0018, recomendada por el autor |
| thinkingmachines/Inkling-2-Mini (original) | 26.4B totales, ~3.4B activos | 1M | no disponible en la informacion | Pesos originales NVFP4/MXFP8 | Referencia de fidelidad y precisión |

No se dispone de datos de benchmarks comparativos frente a modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 2 bits degrada la fidelidad: solo el 90,2% de los siguientes tokens coinciden con la implementación de referencia y la KL media es de 0,1066, muy superior a la de las builds de 3 y 4 bits.
- El encoder de visión está comprimido a 2 bits, por lo que las respuestas sobre imágenes son menos exactas; el autor documenta errores en detalles finos (confundir un círculo con un óvalo).
- En un Mac de 16 GB es una build "stretch": requiere cerrar aplicaciones, limitar los prompts a unos pocos miles de tokens y ajustar el límite de memoria de la GPU; no es adecuada para prompts cercanos al millón de tokens de contexto del modelo base.
- Riesgo de alucinación inherente a los modelos de lenguaje, potencialmente amplificado por la cuantización agresiva.
- Sesgos conocidos del modelo base: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; conviene validar el comportamiento en castellano antes de usarlo en producción.
- Licencia Apache 2.0, que permite uso comercial, pero al ser una cuantización de un modelo de terceros conviene revisar también las condiciones del modelo base.
- Específica de Apple Silicon (MLX); no es desplegable en GPUs NVIDIA ni en stacks como vLLM o TGI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Inkling-2-Mini-LayerFit-MLX-2bit
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Build de 2,5 bits: https://huggingface.co/netprojects/Inkling-2-Mini-LayerFit-MLX-2.5bit
- Build de 3 bits: https://huggingface.co/netprojects/Inkling-2-Mini-LayerFit-MLX-3bit
- Build de 4 bits: https://huggingface.co/netprojects/Inkling-2-Mini-LayerFit-MLX-4bit
- Build de 4/8 bits (recomendada): https://huggingface.co/netprojects/Inkling-2-Mini-MLX-4-8bit
- Repositorio inkling2-mlx (tool calling): https://github.com/internet-projects/inkling2-mlx
- Resto de builds del autor: https://huggingface.co/netprojects
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0

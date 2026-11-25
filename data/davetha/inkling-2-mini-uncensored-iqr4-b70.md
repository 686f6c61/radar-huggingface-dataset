# davetha/Inkling-2-Mini-Uncensored-IQR4-B70

## Resumen

Inkling-2-Mini-Uncensored-IQR4-B70 es una cuantización de 4 bits del modelo multimodal Inkling-2-Mini, publicado por el usuario davetha sobre el checkpoint sin censura de OpenUncensored. El modelo original lo desarrolla thinkingmachines y emplea una arquitectura MoE (mixture of experts) con 26.579.744.256 parámetros totales según los safetensors del repositorio. La aportación de esta ficha no es el modelo base, sino el formato de cuantización IQR (Hadamard rotation + GPTQ 4-bit) diseñado específicamente para ejecutarse en las unidades XMX de la Intel Arc Pro B70 mediante un kernel int8 propio.

El interés técnico reside en que los expertos enrutados de las 24 capas (128 expertos por capa) se desempaquetan sin pérdida de los pesos originales NVFP4 y MXFP8 y se recuantizan con GPTQ sobre una transformada de Walsh-Hadamard de anchura 128, lo que permite usar matrices enteras int8 x int4 en hardware Intel. Según el autor, la calidad se mantiene prácticamente idéntica a la build EXL3 4bpw (KL media de 0,0407 frente a 0,0406) mientras el prefill mejora entre un 32 % y un 48 % y el decode entre un 17 % y un 46 % en la misma tarjeta.

Es relevante ahora porque demuestra una ruta viable para servir un MoE multimodal de ~26,6 mil millones de parámetros en una única GPU de 32 GB de consumo profesional, con perfil de servidor de 262.144 tokens de contexto, decodificación especulativa DSpark y soporte de tool calling. El modelo incorpora además la edición de ablación direccional de OpenUncensored sobre las proyecciones `attn.wo_ud` (capas 4 a 23, rango 2), que reduce los rechazos de 6/16 a 0/16 en un conjunto de 16 prompts.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (image-text-to-text), 24 capas con 128 expertos enrutados por capa; incluye vision tower y drafter DSpark (`mtp.safetensors`) |
| Parametros totales | 26.579.744.256 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (perfil de servidor documentado); recuperación validada con needle de 196.608 tokens |
| Tipos de cuantizacion | Expertos enrutados: GPTQ 4-bit con rotación Hadamard (IQR, 4,125 bits por peso incluyendo escalas); resto de pesos (atención, normas, embeddings, vision tower, drafter) en BF16 |
| Idiomas soportados | no disponible (el set de calibración incluye texto multilingüe, pero no se enumeran idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`iqr-layer-00..23.safetensors` de 512 MB cada uno, metadatos `format: iqr-gptq4-v1`; tensores `model.llm.layers.L.mlp.experts.{w13_codes, w13_scales, w2_codes, w2_scales}`), más shards densos, drafter, tokenizer y configs del build EXL3 |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 24 capas y 128 expertos enrutados por capa, en la línea de los diseños de mezcla de expertos con enrutamiento disperso. La cuantización IQR actúa exclusivamente sobre los expertos: los pesos originales en NVFP4 (capas 0-19) y MXFP8 (capas 20-23) se desempaquetan sin pérdida y se recuantizan a 4 bits con GPTQ. Antes de la cuantización, la dimensión de entrada se rota mediante una transformada de Walsh-Hadamard normalizada y diagonal por bloques de anchura 128 (`fwht128`), lo que reparte la energía de los pesos y hace viable una rejilla entera simple. Los códigos son enteros con signo de 4 bits (`code - 8`, rango -8..7), dos por byte a lo largo de K, con el nibble bajo correspondiente a k par, y una escala BF16 por fila de salida y cada 128 elementos de K.

El proceso GPTQ se ejecuta sobre las hessianas rotadas y ponderadas por enrutamiento de un conjunto de calibración de 1,0 millón de tokens (491 secuencias de 2.048 tokens con chat, código, tool calls y texto multilingüe), con amortiguación de 0,01 y búsqueda en rejilla de escalas por grupo. En tiempo de ejecución, el kernel rota y cuantiza las activaciones a int8 (una escala por fila y 128) y ejecuta DPAS int8 x int4 sobre las unidades XMX del Arc Pro B70. El formato sigue la idea IQR descrita por Radiance (Apache-2.0, `docs/IQR.md`), aunque el cuantizador y el kernel son una implementación independiente sin código de Radiance. El resto de componentes (atención, normas, embeddings, vision tower y drafter DSpark) permanece en BF16 y es byte-idéntico al build EXL3.

La edición sin censura procede de OpenUncensored: una ablación direccional de rango 2 sobre las proyecciones de salida de atención `attn.wo_ud` en las capas 4 a 23. No se documentan en la información disponible detalles sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, RLHF o DPO).

## Capacidades

- Generación de texto conversacional multi-turno con ventana de contexto de hasta 262.144 tokens.
- Procesamiento de imagen y texto (`image-text-to-text`), con vision tower en BF16.
- Razonamiento con niveles de esfuerzo configurables (low/medium/high) según las pruebas del autor.
- Tool calling y manejo de turnos con resultados de herramientas (tool-result turn), verificados en servidor en vivo.
- Generación de código, incluidas ediciones de código con mucho copiado (copy-heavy coding edits).
- Recuperación de información en contexto largo: needle retrieval validado a 196.608 tokens.
- Decodificación especulativa mediante drafter DSpark y n-gram copy drafting.
- Streaming de respuestas.
- Modo sin censura: 0 rechazos en 16 prompts del conjunto de prueba (el original rechaza 6/16).
- Capacidades multilingües: no disponible (no se enumeran idiomas soportados).

## Casos de uso

- Asistencia de código en producción: el modelo soporta tool calling y ediciones de código con mucho copiado, con un throughput medido de 306 tok/s en modo greedy y 320 tok/s en muestreo sobre el B70, lo que permite integrarlo en pipelines de revisión y parcheo automatizado.
- Agente conversacional con herramientas: los turnos de tool call y tool-result están verificados en servidor, de modo que puede encadenar llamadas a funciones y razonamiento multi-paso en flujos de automatización.
- Análisis de documentos largos: con 262.144 tokens de contexto y recuperación validada a 196.608 tokens, es adecuado para resumir o consultar repositorios completos, contratos extensos o bases de conocimiento.
- Atención al cliente automatizada: la ventana de contexto larga y el modo streaming permiten conversaciones multi-turno con historial extenso sin truncar, y el formato sin censura evita rechazos en consultas legítimas de dominio sensible.
- Procesamiento de imágenes con texto (image-text-to-text): la torre de visión en BF16 permite tareas de descripción, extracción de información o respuesta a preguntas sobre capturas e imágenes dentro de un pipeline multimodal.
- Despliegue en hardware Intel de gama profesional: al caber en una única Arc Pro B70 de 32 GB con vLLM 0.34, sirve como opción para equipos con GPUs Intel Arc en lugar de NVIDIA, con un throughput de prefill de 4.458 tok/s en prompts de 4K.
- Prototipado de investigación sobre cuantización: el formato IQR y su kernel son reproducibles y el autor publica las métricas de KL y acuerdo top-1, lo que lo convierte en banco de pruebas para estudiar el impacto de la rotación Hadamard en MoE cuantizados.
- Generación de contenido sin restricciones de rechazo: útil en entornos de investigación creativa o red teaming donde la ablación de rechazos evita interrupciones no deseadas, siempre con las salvaguardas externas adecuadas.

## Benchmarks y rendimiento

Calidad frente a los expertos originales NVFP4/MXFP8 (KL forzada por profesor sobre vocabulario completo, 12 x 2.048 tokens retenidos, 24.564 posiciones de chat, código y documentación):

| Expertos | KL media | Acuerdo top-1 | PPL (original 6,2693) |
|---|---:|---:|---:|
| EXL3 4bpw | 0,0406 | 95,28 % | 6,2469 |
| IQR GPTQ 4-bit | 0,0407 | 95,09 % | 6,2526 |
| IQR GPTQ 4-bit + activaciones int8 (lo que calcula el kernel) | 0,0408 | 95,16 % | no disponible |

Sonda de logprob contra el servidor en vivo (texto de 4K): IQR top-1 96,42 % / KL 0,0087; EXL3 top-1 96,91 % / KL 0,0065.

Rendimiento A/B en una B70 a 230 W, una petición a la vez, caché KV FP8, perfil de 262.144 tokens, decodificación especulativa DSpark más n-gram copy drafting, prefill optimizado con chunk de 4.096 tokens:

| Carga de trabajo | EXL3 4bpw | IQR 4-bit | Cambio |
|---|---:|---:|---:|
| Prompt 4K, prefill tok/s | 3.012 | 4.458 | +48 % |
| Prompt 196.608 tokens, prefill tok/s | 2.168 | 2.859 | +32 % |
| Prompt 196.608 tokens, decode tok/s | 73 | 107 | +46 % |
| Prompt 4K, decode tok/s (3 semillas) | 131 | 148 | +13 % |
| Generación muestreada nueva, decode tok/s | 78 | 96 | +23 % |
| Ediciones de código con copia, greedy, tok/s | 262 | 306 | +17 % |
| Ediciones de código con copia, muestreado, tok/s | 252 | 320 | +27 % |

Sobre la main actual de Danmoreng (vLLM 0.33, perfil de coding de cuatro slots con DSpark adaptativo hasta 7 propuestas, prefill optimizado, sin n-gram drafting), una ejecución cada uno: prefill 4K de 3.773 a 4.993 tok/s (+32 %), generación muestreada de 82,1 a 96,5 tok/s (+18 %), copia greedy de 159,5 a 198,7 tok/s (+25 %).

Coste por capa MoE del kernel: 68 µs por fila de decode (EXL3 100 µs), 165 µs para un paso de verificación de 8 filas sobre unos 20 expertos (EXL3 272 µs) y 6,6 ms para un chunk de prefill de 4.096 tokens (EXL3 15,5 ms).

Puertas de validación en servidor vivo: tool call, turno de tool-result y comprobación de código superadas; 0/16 rechazos; needle retrieval de 196.608 tokens superado; esfuerzo de razonamiento low/medium/high, streaming y multi-turno con comportamiento equivalente a EXL3.

## Requisitos de hardware

- VRAM estimada: aproximadamente 16 GB de pesos (tamaño del repo 17,1 GB) más caché KV; el autor indica que el checkpoint corre en una única Intel Arc Pro B70 de 32 GB con perfil de servidor de 262.144 tokens y caché KV FP8.
- GPU recomendadas: Intel Arc Pro B70 (32 GB) es el objetivo de producción; el kernel depende de las unidades XMX Intel para el DPAS int8 x int4.
- GPU de consumo: no hay datos de ejecución en GPUs de consumo NVIDIA o AMD; el formato IQR está ligado a un kernel específico para Intel Arc, por lo que no se puede afirmar compatibilidad con RTX 4090 u otras.
- Opciones de despliegue: vLLM 0.34 mediante el fork `davetha/intel-b70-inkling2-mini-vllm`, rama `b70-prod`, con la variable `INKLING2_EXPERTS=iqr4`; el código de servicio no lee los campos de cuantización de `config.json`, `checkpoint.json` ni `hf_quant_config.json`. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: prefill de 4.458 tok/s en prompts de 4K y 2.859 tok/s en 196.608 tokens; decode de 107 tok/s en contexto largo y 96 tok/s en generación muestreada nueva; 6,6 ms por chunk de prefill de 4.096 tokens y 68 µs por fila de decode en cada capa MoE, medidos en una B70 a 230 W.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-Uncensored-IQR4-B70 (este) | 26,58 mil M | 262.144 | IQR GPTQ 4-bit en expertos, BF16 en el resto | Apache 2.0 | Hugging Face, kernel Intel Arc B70 |
| davetha/Inkling-2-Mini-Uncensored-EXL3-B70 | 26,58 mil M (mismo base) | 262.144 | EXL3 4bpw | Apache 2.0 | Hugging Face, kernel Intel Arc B70 |
| OpenUncensored/Inkling-2-Mini-Uncensored | no disponible | no disponible | BF16 (sin cuantizar) | Apache 2.0 | Hugging Face |
| thinkingmachines/Inkling-2-Mini | no disponible | no disponible | NVFP4 (capas 0-19) y MXFP8 (capas 20-23) | no disponible | Hugging Face |

Frente a la build EXL3 del mismo autor, IQR ofrece calidad estadísticamente equivalente (KL 0,0407 frente a 0,0406) con mejor throughput en la B70. Frente a los checkpoints sin cuantizar, IQR reduce el peso a unos 16 GB a costa de una pérdida mínima de acuerdo top-1 (95,09 % frente al original). No se dispone de datos de benchmarks estándar (MMLU, HumanEval, GSM8K) ni de comparaciones con modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- El formato IQR depende de un kernel específico para las unidades XMX de Intel Arc; no es portable a otras GPUs sin reimplementar el kernel, y el código de servicio ignora los metadatos de cuantización de los ficheros de configuración.
- El modelo es una edición sin censura mediante ablación direccional: elimina los rechazos (0/16) y puede generar contenido que el modelo original bloquearía, lo que exige salvaguardas externas en producción.
- Riesgo de alucinación no cuantificado: no se han publicado evaluaciones de veracidad ni de sesgos en la información disponible.
- Idiomas soportados no documentados; el set de calibración incluye texto multilingüe, pero no se especifica qué lenguas cubre con calidad.
- Los benchmarks publicados son métricas de divergencia (KL, acuerdo top-1, PPL) y de rendimiento, no evaluaciones de tareas estándar; no hay datos de MMLU, HumanEval ni GSM8K.
- Las cifras de throughput proceden de una única tarjeta B70 a 230 W con una petición concurrente; el rendimiento con batching real puede diferir, aunque el autor reporta que su comprobación de batching con cuatro clientes pasa.
- El repositorio tiene 31 descargas y 0 likes en el momento de la ficha, por lo que la validación por parte de la comunidad es todavía muy limitada.
- La licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado por un modelo sin censura recae en el desplegador.
- El tamaño del repo (17,1 GB) y la necesidad de vLLM 0.34 con un fork específico añaden complejidad operativa frente a despliegues estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davetha/Inkling-2-Mini-Uncensored-IQR4-B70
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Edición sin censura: https://huggingface.co/OpenUncensored/Inkling-2-Mini-Uncensored
- Build EXL3 del mismo autor: https://huggingface.co/davetha/Inkling-2-Mini-Uncensored-EXL3-B70
- Fork de servicio vLLM (rama `b70-prod`): https://github.com/davetha/intel-b70-inkling2-mini-vllm/tree/b70-prod
- Stack original de Danmoreng: https://github.com/Danmoreng/intel-b70-inkling2-mini-vllm
- Descripción del formato IQR (Radiance): https://codeberg.org/StillDeadcode/radiance
- Comunidad Launch80 Discord: https://discord.gg/launch80

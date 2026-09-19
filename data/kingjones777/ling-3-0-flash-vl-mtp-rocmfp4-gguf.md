# kingjones777/Ling-3.0-flash-VL-MTP-ROCmFP4-GGUF

## Resumen

Este repositorio contiene una cuantización en formato GGUF del modelo multimodal `inclusionAI/Ling-3.0-flash-VL`, publicada por el usuario `kingjones777` y orientada específicamente al hardware AMD Strix Halo (iGPU gfx1151, Radeon 8060S, Ryzen AI Max+ 395). El modelo base es un transformer de mezcla de expertos (MoE) de 124 000 millones de parámetros totales con unos 5500 millones activos por token, de tipo vision-language nativo, y esta versión lo cuantiza al formato propietario ROCmFP4 (en torno a 4,38-4,70 bits por peso) para que quepa en la memoria unificada de un equipo de sobremesa.

La particularidad técnica del trabajo es que añade un cabezal de predicción multi-token (MTP) que el modelo original no trae: lo injerta desde el modelo hermano de solo texto, `inclusionAI/Ling-3.0-flash`, aprovechando que todas las dimensiones de texto coinciden entre ambos checkpoints. Además, incorpora un parche de servidor que permite usar MTP y visión simultáneamente, combinación que en llama.cpp estándar provoca un aborto del proceso al procesar la primera imagen.

Su relevancia ahora es doble: por un lado demuestra que se puede servir un modelo multimodal de más de 120 000 millones de parámetros en un mini-PC con 128 GiB de memoria unificada a velocidades utilizables; por otro, documenta con medidas reales que las etiquetas de calidad de las cuantizaciones son dependientes del modelo (la variante de mayor bit-width resulta peor que las demás). El repositorio declara licencia MIT y, en el momento de la consulta, no registra descargas ni valoraciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (vision-language) con atención MLA, más cabezal MTP para decodificación especulativa; modelo base Ling-3.0-flash-VL cuantizado a ROCmFP4 |
| Parámetros totales | 127 486 405 600 (~127,5B) según los pesos safetensors del modelo base; la model card indica 124B totales |
| Parámetros activos | ~5,5B por token (MoE con 512 expertos) |
| Longitud de contexto | No disponible (el ejemplo de servidor de la model card usa `-c 8192`) |
| Tipos de cuantización | ROCmFP4 en tres niveles: STRIX_LEAN (4,38 bpw), FAST, COHERENT (4,70 bpw); proyector visual en BF16 |
| Idiomas soportados | No disponible (la model card no declara lista de idiomas; las pruebas de perplejidad se hacen sobre wikitext-2 en inglés) |
| Licencia | MIT (declarada en el repositorio del quant; verificar la licencia del modelo base) |
| Formato de pesos | GGUF (llama.cpp); ficheros principales + un `mmproj` BF16 para visión |
| Tamaño del repositorio | 209,1 GB |
| Backends soportados | ROCm0 y Vulkan0 en llama.cpp |

## Arquitectura y entrenamiento

El modelo base es una arquitectura MoE con 512 expertos, 42 bloques, dimensión oculta de 2560, 32 cabezales de atención, vocabulario de 157 184 tokens, `rope_theta` de 6e6, `layer_group_size` 6, `first_k_dense_replace` 2 y atención de tipo MLA (`kv_lora_rank` 512, `qk_nope_head_dim` 128, `qk_rope_head_dim` 64, `v_head_dim` 128). La torre de visión emplea M-RoPE (posiciones 2D) y un `image_token_id` de 157 157. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de datos ni si hubo fases de RLHF o DPO; estos datos no aparecen en la información proporcionada.

La innovación de esta publicación es el injerto del cabezal MTP. El modelo VL se distribuye sin cabezal de predicción multi-token, mientras que su hermano de texto lo lleva como bloque 42; como todas las dimensiones de texto coinciden (vocabulario, oculto, capas, expertos y rangos de MLA), el trasplante es exacto: se añaden 1553 tensores donantes (5,72 GiB en BF16) como un shard extra sobre una copia con enlaces duros del checkpoint VL, se fija `num_nextn_predict_layers: 1` en `text_config` y se convierte. El resultado son 938 tensores y 43 bloques (`nextn = 1`) frente a 917 y 42 sin el injerto, y se verificó que todos los ficheros publicados conservan `blk.42.*` tras la cuantización. Adicionalmente, los ficheros se construyeron para un servidor corregido que avanza el drafter a través de las posiciones de imagen usando el `image_token_id` del propio modelo y los estados ocultos pre-normalización del modelo objetivo, replicando las posiciones 2D de M-RoPE, y que degrada a «sin draft» en lugar de abortar cuando eso no es posible.

## Capacidades

- Generación de texto conversacional y multimodal (pipeline `image-text-to-text`): acepta imágenes junto a texto mediante el fichero `mmproj` BF16.
- Razonamiento y generación de código y matemáticas: no se aportan evaluaciones específicas en la información disponible.
- Decodificación especulativa mediante cabezal MTP injertado, con ganancia medida de +12,9 % en decodificación con `--spec-draft-n-max 1`.
- Soporte de plantilla de chat Jinja (`--jinja`), lo que habilita el formateo de turnos y flujos de tipo agente.
- Orientación a cargas agénticas y de herramientas: la model card recomienda el backend ROCm0 precisamente para «prompts largos y trabajo agéntico/de herramientas», aunque no se documenta un formato de function calling concreto.
- Visión y MTP simultáneos: capacidad habilitada solo con el servidor parcheado que acompaña a esta publicación.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Asistente multimodal local en un equipo Strix Halo: el modelo puede mantener conversaciones multi-turno con imágenes adjuntas (capturas, diagramas, fotos de pizarra) sin depender de la nube, con 68-72 GB de pesos residentes en memoria unificada y unos 35-40 tok/s de decodificación.
- Automatización de soporte técnico con captura de pantalla: el pipeline `image-text-to-text` permite enviar una captura de un error junto al texto del usuario y obtener una explicación o pasos de resolución, aprovechando la ventana configurable (`-c 8192` en el ejemplo).
- Transcripción y análisis documental con visión: indexación de documentos escaneados o formularios donde el modelo extrae y resume el contenido visual junto con el textual.
- Agentes de múltiples pasos con llamada a herramientas: el soporte de plantilla Jinja y el modo `--parallel 1` permiten integrarlo en un bucle agéntico donde el prefill rápido de ROCm0 (560,5 tok/s) reduce la latencia de los turnos con contexto largo.
- Servicio de chat de baja concurrencia en hardware de escritorio: con decodificación de 38-40 tok/s en Vulkan0, es viable para un usuario o unos pocos simultáneos en un despliegue autoalojado.
- Banco de pruebas de cuantización e investigación en AMD: el repositorio incluye tres niveles con perplejidad y throughput medidos, lo que lo convierte en un material útil para estudiar el impacto de ROCmFP4 y del MTP en gfx1151.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos medidos por el autor son perplejidad sobre wikitext-2 y throughput de prefill/decodificación.

Perplejidad y velocidad por nivel de cuantización (PPL: wikitext-2 `wiki.test.raw`, 20 chunks, `-c 2048 -b 2048`, ROCm0; PP/TG: prompt de 659 tokens generando 128, MTP `n-max 1`):

| Fichero | Tamaño (bytes) | PPL ↓ | ROCm0 PP / TG (tok/s) | Vulkan0 PP / TG (tok/s) |
|---|---:|---:|---:|---:|
| STRIX_LEAN | 68 136 568 224 | 9,2579 ±0,208 | 560,5 / 35,03 | 413,4 / 38,04 |
| FAST | 67 934 440 864 | 9,4640 ±0,213 | 541,8 / 36,33 | 402,7 / 40,43 |
| COHERENT | 72 123 718 560 | 10,0590 ±0,233 | 506,1 / 34,46 | 404,6 / 38,14 |
| mmproj BF16 | 878 174 144 | — | — | — |

Efecto del ajuste MTP (STRIX_LEAN, ROCm0, prompt de 337 tokens, 160 generados):

| Ajuste MTP | Decodificación (tok/s) | Diferencia | Aceptación del draft |
|---|---:|---:|---|
| Desactivado | 33,29 | — | — |
| `--spec-draft-n-max 1` | 37,58 | +12,9 % | 0,722 |
| `--spec-draft-n-max 2` | 31,92 | −4,1 % | 0,475 (0,724; 0,241) |
| `--spec-draft-n-max 3` | 30,62 | −8,0 % | 0,369 (0,660; 0,340; 0,094) |

Coste del MTP en prefill: 576,7 → 534,3 tok/s (−7,4 %). Comparativa de backend: ROCm0 gana en prefill entre un 25 % y un 35 %; Vulkan0 gana en decodificación entre un 9 % y un 11 %.

## Requisitos de hardware

- Memoria necesaria: entre 67,9 GB y 72,1 GB para los pesos, más 0,88 GB del proyector visual BF16.
- Equipo de referencia: Ryzen AI Max+ 395 (Radeon 8060S, gfx1151) con 128 GiB de memoria unificada, donde el modelo cabe holgadamente.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en configuraciones de 48 GB; requeriría offload a RAM del sistema, con la penalización de velocidad correspondiente.
- GPU de centro de datos: cabría en memoria en una A100 80 GB o H100 80 GB, pero el formato ROCmFP4 y el rendimiento medido están atados a llama.cpp sobre gfx1151, por lo que no hay datos de rendimiento en esas tarjetas.
- Opciones de despliegue: `llama.cpp` / `llama-server` con los backends ROCm0 o Vulkan0; el uso conjunto de MTP y visión exige el servidor parcheado que acompaña a la publicación, ya que la versión estándar de llama.cpp aborta al cargar ambos.
- Latencia y throughput medidos: prefill de 560,5 tok/s y decodificación de 35,03 tok/s con STRIX_LEAN en ROCm0; 413,4 y 38,04 tok/s respectivamente en Vulkan0. La model card advierte que un solo hilo de CPU ocupado altera de forma medible estas cifras.

## Comparativa con modelos similares

No se dispone de datos de terceros comparables en la información proporcionada. La comparación posible se limita a las variantes vinculadas a este mismo linaje:

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este quant (STRIX_LEAN) | 127,5B totales / ~5,5B activos | No disponible | PPL 9,26; 560,5 PP / 35,03 TG en ROCm0 | MIT (declarada en el repo) | GGUF, 68,1 GB |
| Este quant (FAST) | Idem | No disponible | PPL 9,46; 541,8 PP / 36,33 TG | MIT | GGUF, 67,9 GB |
| Este quant (COHERENT) | Idem | No disponible | PPL 10,06; 506,1 PP / 34,46 TG | MIT | GGUF, 72,1 GB |
| `inclusionAI/Ling-3.0-flash-VL` (base) | 124B / ~5,5B activos | No disponible | No disponible | No disponible en la información aportada | Pesos originales (BF16) |
| `inclusionAI/Ling-3.0-flash` (solo texto) | Dimensiones de texto idénticas al VL | No disponible | No disponible | No disponible en la información aportada | Incluye el cabezal MTP donante |

## Limitaciones y advertencias

- Es una cuantización de comunidad: 0 descargas y 0 valoraciones en el momento de la consulta, sin proceso de validación independiente.
- El funcionamiento conjunto de MTP y visión depende de un servidor parcheado; con llama.cpp estándar el proceso cae con `GGML_ABORT` al procesar la primera imagen.
- La variante COHERENT es peor que STRIX_LEAN en perplejidad (0,80 puntos, unas 3,5σ respecto a su margen de error) y más lenta, pese a ser la de mayor tamaño y bit-width; no debe asumirse como la opción de mayor calidad.
- El formato ROCmFP4 y las cifras de rendimiento están medidos sobre gfx1151 (Strix Halo); la portabilidad a otras GPU AMD o a NVIDIA no está documentada.
- La única métrica de calidad publicada es perplejidad sobre wikitext-2 en inglés; no hay evaluaciones de razonamiento, código, matemáticas, visión o seguridad.
- No se declaran idiomas soportados, por lo que el comportamiento multilingüe es desconocido.
- No hay información sobre sesgos, datos de entrenamiento ni fases de alineación.
- Riesgo de alucinación inherente a los modelos generativos; no se aportan tasas de error ni evaluaciones de fidelidad.
- Restricciones de licencia: el repositorio declara MIT, pero es responsabilidad del usuario verificar la licencia del modelo base antes de un uso comercial.
- El MTP penaliza el prefill un 7,4 %, por lo que es desaconsejable en cargas de lotes con prompts muy largos.
- La model card está truncada en la sección de visión; las mediciones de MTP con imágenes no llegan a mostrarse.

## Enlaces

- Repositorio HuggingFace del quant: https://huggingface.co/kingjones777/Ling-3.0-flash-VL-MTP-ROCmFP4-GGUF
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-flash-VL
- Modelo hermano de texto (donante del cabezal MTP): https://huggingface.co/inclusionAI/Ling-3.0-flash

No se han encontrado en la búsqueda web otros enlaces relevantes (papers, blogs o repositorios) asociados a este modelo.

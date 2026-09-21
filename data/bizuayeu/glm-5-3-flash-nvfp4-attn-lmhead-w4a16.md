# Bizuayeu/GLM-5.3-Flash-NVFP4-attn-lmhead-W4A16

## Resumen

GLM-5.3-Flash-NVFP4-attn-lmhead-W4A16 es un checkpoint derivado de cuantización publicado por el usuario Bizuayeu, no un modelo entrenado desde cero ni un lanzamiento oficial de NVIDIA o Z.AI. Parte del checkpoint `nvidia/GLM-5.3-Flash-NVFP4` (revisión `423acf37583782c51c142d145aef733d72943d93`) y recodifica a NVFP4 con cuantización solo de pesos (W4A16, grupo 16) únicamente los lineales del lado de atención y el `lm_head` que NVIDIA dejó en BF16: proyecciones KDA de las 34 capas de atención lineal, las proyecciones `q_a`, `kv_a`, `q_b`, `kv_b`, `o_proj` y el indexer `wq_b` de las 11 capas MLA, y el `lm_head`. El resto del checkpoint es idéntico byte a byte al original.

El modelo conserva la arquitectura híbrida del original (34 capas de atención lineal KDA más 11 capas MLA, expertos enrutados y compartidos, torre de visión y capa borrador MTP), con 165.556.280.158 parámetros totales (unos 165,6 mil millones) y un repositorio de 194,9 GB repartido en 18 shards safetensors. La motivación declarada es de rendimiento en despliegue: al reducir la lectura del `lm_head` en BF16 que domina cada paso de borrador, cada paso de decodificación MTP se acorta entre 12 y 13 ms, lo que se traduce en más tokens por segundo.

Es relevante porque documenta con detalle un caso real de recuantización parcial orientada a latencia sobre hardware de gama compacta (dos nodos GB10, clase DGX Spark, TP=2), incluyendo medidas de aceptación (NLL con teacher forcing) y de velocidad. El precio es explícito: no es sin pérdidas, y para cargarlo hace falta un cargador parcheado, ya que `vllm serve` sin modificaciones no arranca con este directorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 34 capas de atención lineal (KDA) + 11 capas MLA, con expertos enrutados y compartidos, torre de visión y capa borrador MTP (etiqueta `glm5_next`) |
| Parametros totales | 165.556.280.158 (unos 165,6 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no se declara máximo; en pruebas se respondieron correctamente entradas de 200.000 y 261.461 tokens) |
| Tipos de cuantizacion | NVFP4 W4A16, solo pesos, grupo 16, sin datos de calibración, aplicada a los lineales de atención y al `lm_head`; los expertos enrutados conservan el NVFP4 de NVIDIA; router, normas, embeddings, expertos compartidos, torre de visión, indexer `wk`/`weights_proj` y capa MTP quedan como se distribuyen |
| Idiomas soportados | ja, en |
| Licencia | MIT (términos de la model card de NVIDIA y de la licencia upstream de Z.AI, ambas conservadas); la herramienta de conversión es Apache-2.0 |
| Formato de pesos | safetensors (18 shards, 194,9 GB / 182 GiB), con `model.safetensors.index.json`, `config.json`, `hf_quant_config.json`, tokenizer y plantilla de chat |
| Pipeline | image-text-to-text |
| Libreria declarada | vLLM (requiere overlays) |
| Modelo base | nvidia/GLM-5.3-Flash-NVFP4 |
| Upstream | zai-org/GLM-5.3-Flash |

## Arquitectura y entrenamiento

No hay entrenamiento: se trata de una conversión determinista de pesos. El script `requant/requant.py` del repositorio `tenhkspark/glm53-flash-nvfp4-2node` (commit `8ee63a676c6e8550f49b52aec7c5c05b56eb5553`, Apache-2.0), con una modificación local que añade el objetivo `l` (objetivo `g` más `lm_head`), repacka a NVFP4 W4A16 los módulos citados. La conversión se realizó el 21 de septiembre de 2026 en un único GB10, solo con CPU, en unos 5,5 minutos y 40 GiB de memoria. `config.json` registra la operación en `quantization_config.producer` con `requant_target: "l"`. Los shards 2 a 18 son idénticos byte a byte a la conversión con `--target g`; el shard 1 contiene el `lm_head` y las primeras capas.

La arquitectura subyacente es híbrida de atención: 34 capas de atención lineal KDA con proyecciones `in_proj`, `f_b`, `g_b` y `o_proj`, más 11 capas MLA con `q_a`, `kv_a`, `q_b`, `kv_b`, `o_proj` e indexer `wq_b`. Incorpora expertos enrutados (que mantienen el NVFP4 original), expertos compartidos, router, torre de visión para la modalidad image-text-to-text y una capa borrador MTP que habilita decodificación especulativa. La innovación técnica del checkpoint no está en la arquitectura sino en el reparto de la cuantización: mover a 4 bits el `lm_head` reduce el coste dominante de cada paso de borrador, lo que se traduce en 12–13 ms menos por paso de decodificación. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original.

## Capacidades

- Generación de texto y conversación multi-turno en inglés y japonés (pipeline `conversational`).
- Procesamiento de imagen y texto de forma conjunta (pipeline `image-text-to-text`, con la torre de visión conservada tal cual se distribuye).
- Contexto largo: se validaron con respuesta correcta una recuperación tipo passphrase de 200.000 tokens y una referencia de tres posiciones de 261.461 tokens.
- Razonamiento y matemáticas: el corpus de matemáticas forma parte de la evaluación de aceptación con teacher forcing; es donde la recuantización del `lm_head` añade más degradación (+1,5% frente al objetivo `g`).
- Generación de código: evaluada en los corpus de aceptación, pero el propio autor recomienda usar el checkpoint de origen para código, no este.
- Decodificación especulativa mediante la capa borrador MTP incluida (profundidad de borrador 3 o 4 en las medidas publicadas).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.
- Idiomas distintos de ja/en: no disponibles.

## Casos de uso

- Servicio de inferencia en clúster de dos GB10 (clase DGX Spark) con TP=2: es el escenario de referencia del checkpoint, integrado en `tenhkspark/glm53-flash-nvfp4-2node` con `runtime.derived_checkpoint` y `requant_target = "l"`, donde ofrece 46,2 / 28,8 / 38,2 tok/s en conteo / prosa / código con profundidad de borrador 3.
- Recuperación de información sobre documentos muy largos: con entradas de 200.000 y 261.461 tokens respondidas correctamente (169,9 s y 235,1 s respectivamente), encaja en pipelines de RAG de contexto largo donde no se puede trocear el documento.
- Generación de prosa en japonés e inglés: el checkpoint está pensado explícitamente como opción orientada a prosa, y su NLL en inglés es incluso ligeramente mejor que el del modelo sin modificar (2,0024 frente a 2,0241).
- Asistentes conversacionales multi-turno: el pipeline conversacional y la ventana de contexto validada permiten mantener historiales largos sin recompresión agresiva.
- Descripción y comprensión de imágenes con texto asociado: la torre de visión se conserva intacta, por lo que sirve para tareas image-text-to-text sin degradación añadida por la cuantización de la parte de visión.
- Investigación en cuantización: sirve como caso de estudio reproducible de cuantización parcial W4A16 sobre vLLM, con NLL y velocidades publicadas y comparables contra el objetivo `g` y contra los pesos originales.
- Evaluación comparativa de estrategias de decodificación especulativa: las diferencias de tok/s entre profundidades de borrador y entre variantes de pesos están documentadas y son reproducibles sobre el mismo prompt.
- Laboratorio de contexto largo con restricciones de memoria: al reducir el peso del `lm_head` en cada paso de borrador, permite servir contexto muy largo en hardware de gama compacta donde la latencia de decodificación es el cuello de botella.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Lo que sí se publica es una evaluación de aceptación con NLL forzado por profesor sobre cuatro corpus fijos, con las mismas entradas en todas las columnas (dos ejecuciones con valores idénticos), y una tabla de velocidad. NLL más bajo es mejor.

| Corpus (NLL con teacher forcing) | Sin modificar | `g` (solo atención) | `l` (este checkpoint) | `l` frente a `g` |
|---|---:|---:|---:|---:|
| Japones | 1,5963 | 1,6600 | 1,6645 | +0,27% |
| Ingles | 2,0241 | 2,0020 | 2,0024 | +0,02% |
| Codigo | 0,9479 | 1,0040 | 1,0031 | −0,09% |
| Matematicas | 0,5931 | 0,6184 | 0,6279 | +1,53% |

Frente al checkpoint sin modificar, este checkpoint mueve el NLL +4,3% en japonés, −1,1% en inglés, +5,8% en código y +5,9% en matemáticas; casi todo proviene del repack de atención (`g`), y el `lm_head` añade poco salvo en matemáticas (+1,5%).

| Velocidad (profundidad de borrador MTP 4, greedy, una secuencia) | `g` (tok/s) | `l` (tok/s) | ms por paso `g` → `l` |
|---|---:|---:|---|
| Conteo (finalización idéntica) | 45,25 | 52,27 | 102,7 → 89,7 |
| Codigo | 34,85 | 39,74 | 104,0 → 91,8 |
| Prosa en japones | 23,45 / 25,63 | 25,93 / 27,28 | 96,0 → 83,8 |

Datos adicionales: frente a los pesos sin modificar a la misma profundidad, el par decodifica 46,2 / 28,8 / 38,2 tok/s en conteo / prosa / código, mientras que los pesos sin modificar dan 32,5 / 21,0 / 28,3. El paso de decodificación es 12–13 ms más corto en todas las entradas. Cuando los tok/s difieren menos, la finalización cambia (los empates en BF16 se resuelven de otra forma tras el repack) y la aceptación del borrador se desplaza con ella. Pruebas de contexto largo: recuperación tipo passphrase de 199.652 tokens en 169,9 s y referencia de tres posiciones de 261.461 tokens en 235,1 s, ambas correctas; las comprobaciones de mojibake y de acuerdo del setup pasaron (`passed: true`, 0 errores).

## Requisitos de hardware

- Almacenamiento: 194,9 GB (182 GiB) para los 18 shards safetensors más ficheros auxiliares. Es un valor notablemente superior a los ~83 GB que exigiría una cuantización de 4 bits uniforme sobre 165,6 mil millones de parámetros, lo que indica que una parte relevante de los módulos permanece en BF16.
- VRAM/memoria para inferencia: no disponible como cifra declarada por el autor. El despliegue de referencia es de dos nodos GB10 (clase DGX Spark) con tensor parallelism 2.
- GPU recomendadas: no se enumeran en la información disponible; el único hardware citado son dos GB10, además de un GB10 en solitario (solo CPU) para la conversión, que consumió 40 GiB y 5,5 minutos.
- GPU de consumo: no disponible. El tamaño del repositorio y el requisito de dos nodos con TP=2 hacen inviable, según los datos aportados, su ejecución en GPU de consumo.
- Opciones de despliegue: vLLM es la única vía documentada, y no funciona directamente. Hace falta aplicar dos overlays de una línea al código fuente (`kda.py`, `model.py`) sobre vLLM en el commit `385dce36`, o usar el lanzador del repositorio de setup (`runtime.derived_checkpoint`, `requant_target = "l"`), que verifica los overlays y el manifiesto. Con `vllm serve` a secas sobre esta carpeta, el modelo no arranca.
- llama.cpp, Ollama, TGI u otros motores: no disponible.
- Latencia y throughput: medidos en el setup de dos GB10 con TP=2 y profundidad de borrador 3: 46,2 / 28,8 / 38,2 tok/s en conteo / prosa / código (nueve muestras de 512 tokens tras un prompt de 2.048 tokens). Con profundidad 4: 52,27 tok/s en conteo, 39,74 tok/s en código y 25,93–27,28 tok/s en prosa japonesa. Cada paso de decodificación se acorta 12–13 ms frente a la variante `g`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (NLL / velocidad) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`l`) | 165,6 mil millones | No declarado; validado a 261.461 tokens | NLL ja 1,6645 / en 2,0024 / codigo 1,0031 / math 0,6279; 52,27 tok/s (conteo, borrador 4) | MIT | HuggingFace, requiere vLLM parcheado |
| `g` (solo atención recuantizada) | 165,6 mil millones | Igual | NLL ja 1,6600 / en 2,0020 / codigo 1,0040 / math 0,6184; 45,25 tok/s (conteo, borrador 4) | Derivado del mismo origen | Referenciado en el setup de dos nodos |
| nvidia/GLM-5.3-Flash-NVFP4 (sin modificar) | 165,6 mil millones | Igual | NLL ja 1,5963 / en 2,0241 / codigo 0,9479 / math 0,5931; 32,5 / 21,0 / 28,3 tok/s en conteo / prosa / codigo | MIT | HuggingFace (NVIDIA) |
| zai-org/GLM-5.3-Flash (upstream) | No disponible en la informacion | No disponible | No disponible | MIT (Copyright (c) 2026 Z.AI Co., Ltd) | HuggingFace (Z.AI) |

La comparación relevante es interna a la familia: este checkpoint mejora el throughput frente a `g` y frente a los pesos sin modificar, a costa de un NLL ligeramente peor en japonés y matemáticas. Para código, el propio autor indica que debe usarse el checkpoint de origen.

## Limitaciones y advertencias

- No es una conversión sin pérdidas: el NLL con teacher forcing se mueve varios puntos porcentuales frente al checkpoint sin modificar (+4,3% en japonés, +5,8% en código, +5,9% en matemáticas, −1,1% en inglés).
- La mayor parte de la degradación proviene del repack de atención (`g`); el `lm_head` añade poco salvo en matemáticas (+1,5%), donde el impacto es mayor.
- No es un lanzamiento de NVIDIA ni de Z.AI: es un derivado de terceros, sin aval de los autores originales.
- Requiere un cargador parcheado. Sin los dos overlays (`kda.py`, `model.py`) sobre vLLM `385dce36` o sin el lanzador del repositorio de setup, `vllm serve` no arranca porque la configuración de cuantización declara módulos que vLLM no enruta por la ruta NVFP4 por sí solo.
- Conversión realizada sin datos de calibración (weight-only, grupo 16), lo que limita las garantías de fidelidad numérica.
- Uso desaconsejado para código: el setup mantiene los pesos sin modificar como opción por defecto para ese dominio.
- Idioma: solo ja y en declarados; no hay evidencia de rendimiento en otros idiomas, incluido el español.
- El rendimiento en tok/s depende de la aceptación del borrador especulativo: cuando la finalización cambia, la aceptación se desplaza con ella, y esto es una propiedad de la decodificación especulativa en este stack, no de los pesos por sí solos.
- Riesgo de alucinación: no cuantificado en la información disponible. La degradación medida de NLL sugiere que la fidelidad de distribución es algo peor que la del modelo de origen, especialmente en japonés y matemáticas.
- Sesgos: no se documentan evaluaciones de sesgo en la información proporcionada.
- Licencia: los pesos se redistribuyen bajo MIT según la model card de NVIDIA y la licencia upstream de Z.AI, con ambos avisos conservados (`README.nvidia.md` y el texto de licencia de Z.AI en `LICENSES/` del repositorio de setup). La licencia Apache-2.0 aplica a la herramienta de conversión, no a los pesos. Uso comercial permitido por MIT, pero sin garantía alguna.
- El autor no ha realizado entrenamiento ni añadido datos: el repackaging no incorpora términos nuevos, pero tampoco aporta ninguna mejora de calidad intrínseca del modelo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, y sin validación independiente por parte de terceros.

## Enlaces

- Checkpoint en HuggingFace: https://huggingface.co/Bizuayeu/GLM-5.3-Flash-NVFP4-attn-lmhead-W4A16
- Modelo base: https://huggingface.co/nvidia/GLM-5.3-Flash-NVFP4
- Modelo upstream de Z.AI: https://huggingface.co/zai-org/GLM-5.3-Flash
- Repositorio del setup de dos nodos: https://github.com/tenhkspark/glm53-flash-nvfp4-2node
- Herramienta de conversión: `requant/requant.py` del repositorio anterior, commit `8ee63a676c6e8550f49b52aec7c5c05b56eb5553`
- vLLM: commit fijado `385dce36` (necesario para los overlays)
- Nota: la búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los únicos resultados obtenidos fueron páginas de alquiler de libros de texto y servicios de ayuda con deberes, sin relación con el modelo.

# jmarceno/Xing4.0-29B-A4B-GGUF

## Resumen

Xing4.0-29B-A4B-GGUF es una cuantización dinámica publicada por el usuario jmarceno sobre el modelo Xing4.0-29B-A4B de XingChen-AGI (China Telecom / TeleAI). Se distribuye como un único fichero GGUF de 12,04 GiB con un presupuesto medio de 3,31 bits por peso (BPW por sus siglas en inglés), acompañado de la matriz de importancia (imatrix) de 91 MB y de la receta exacta de `llama-quantize`, de modo que el artefacto es reproducible y reajustable.

El modelo base es un MoE de 31.215.031.088 parámetros con nomenclatura A4B, atención MLA, componente mHC, bloque MTP y una ventana de contexto nativa de 262.144 tokens, orientado a chino e inglés. Su relevancia es doble: reduce un 36 % el tamaño frente al artefacto IQ4_NL oficial del editor, a cambio de un 19,9 % más de perplejidad en WikiText-2 raw, y publica la imatrix que el editor original no distribuye (una imatrix es estadística de activaciones y no puede recuperarse de un GGUF ya cuantizado).

El principal obstáculo es de infraestructura: el motor `xing4_0` todavía no está integrado en llama.cpp upstream, por lo que requiere la rama `xing4_0-port` de shuxiaoqiong o el PR abierto ggml-org/llama.cpp#29012.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE de la familia xing4_0, con atención MLA, componente mHC y bloque MTP |
| Parámetros totales | 31.215.031.088 (~31,2 mil millones) |
| Parámetros activos | ≈4 mil millones, según la nomenclatura «A4B» del nombre (no confirmado explícitamente en la model card) |
| Longitud de contexto | 262.144 tokens nativos; el autor ejecuta con `-c 131072` en 2× RTX 3060 |
| Tipos de cuantización | GGUF dinámico mixto: IQ2_XXS (2,06 bpw), IQ4_XS (4,50 bpw), IQ4_NL, Q6_K (6,56 bpw), Q8_0 (8,5 bpw), BF16 y F32; el autor indica que la imatrix admite otras recetas (IQ3_XXS, mezclas Q4) |
| Idiomas soportados | Chino (zh) e inglés (en); el modelo base es chino-céntrico |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el repositorio incluye también la imatrix en GGUF |
| Tamaño del artefacto | 12,04 GiB (fichero cuantizado) |
| SHA-256 del cuantizado | `d33dd4172959af2f55c458b8168ac7cc9a90a26e9e68520653ec61fc50836e75` |
| Publicación | 17 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un MoE de 64 expertos con atención MLA (multi-head latent attention), un componente denominado mHC y un bloque MTP en `blk.40`. Los tensores de los expertos se organizan en `ffn_gate_exps.weight`, `ffn_up_exps.weight` y `ffn_down_exps.weight`, con expertos compartidos en `ffn_{down,gate,up}_shexp.weight`; los bloques 0 y 1 contienen FFN densa. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni la aplicación de RLHF o DPO en el modelo base: **no disponible**.

La aportación del repositorio no es el entrenamiento, sino la cuantización. La imatrix se generó a partir de 820 fragmentos de 512 tokens (~420.000 tokens) sobre un corpus de calibración de 12,8 MB ensamblado de forma round-robin con WikiText-2 raw, un árbol de código fuente y extractos de Wikipedia en chino, y contiene 592 entradas. Se recopiló sobre un modelo de trabajo IQ4_NL porque el BF16 (unos 62 GB) no cabe en 24 GB de VRAM más 31 GB de RAM. La receta usa Q8_0 como tipo base y sobreescribe familias completas: `ffn_down_exps` en IQ4_XS (4,50 bpw), `ffn_gate_exps` y `ffn_up_exps` en IQ2_XXS (2,06 bpw), expertos compartidos en IQ4_XS, atención MLA, FFN densa y `token_embd` en Q8_0, `output.weight` en Q6_K, y normas, routers y sesgos protegidos en BF16/F32. La proyección down recibe más bits que gate y up porque su salida alimenta el flujo residual sin atenuación.

## Capacidades

- Generación de texto conversacional en chino e inglés, con plantilla de chat Jinja (`--jinja`).
- Modo de razonamiento explícito (thinking), activable mediante `--chat-template-kwargs '{"enable_thinking":true}'`.
- Ajustes de muestreo diferenciados por tarea: temperatura 1,0 / top_p 0,95 / repetition_penalty 1,05 para razonamiento complejo y tareas generales, y temperatura 0,8 para código y tareas de agente. El autor no especifica `top_k`, por lo que debe dejarse desactivado.
- Contexto largo de hasta 262.144 tokens, utilizado con caché KV cuantizada en q8_0/q8_0.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Soporte formal de agentes y razonamiento multi-paso: no documentado; el autor menciona «tareas de agente» únicamente al recomendar parámetros de muestreo.
- Capacidades de visión o audio: no disponibles.
- Decodificación especulativa: no disponible en la práctica, porque el bloque MTP se carga pero el motor no lo ejecuta.

## Casos de uso

- Inferencia local de un MoE de ~31B en hardware de gama de consumo: el cuantizado ocupa 12,04 GiB y el autor lo ejecuta íntegramente offloaded en 2× RTX 3060 de 12 GB, algo inviable con el artefacto IQ4_NL de 20,1 GB o con el BF16 de ~62 GB.
- Asistente conversacional bilingüe chino-inglés servido mediante `llama-server`: el repositorio se etiqueta como `conversational` y `endpoints_compatible`, y la plantilla de chat se aplica con `--jinja`.
- Procesamiento de documentos largos: con `-c 131072` y KV q8_0/q8_0 quedan 4,5 GiB libres en la GPU de display según la medición del autor, suficiente para analizar documentos extensos en chino o inglés sin recurrir a troceado agresivo.
- Razonamiento complejo con modo thinking: activando `enable_thinking` y siguiendo la recomendación de temperatura 1,0 / top_p 0,95, el modelo expone una fase de razonamiento antes de la respuesta.
- Generación de código: el autor recomienda temperatura 0,8 para tareas de código, y el corpus de calibración de la imatrix incluye código fuente, lo que indica presencia de ese dominio en la distribución.
- Reproducción y derivación de cuantizaciones: el repositorio publica `quantize-recipe.txt` con la invocación exacta de `llama-quantize` y el mapa de tipos por familia, de forma que cualquier tercero puede regenerar el artefacto o producir recetas alternativas (IQ3_XXS, mezclas Q4) reutilizando la imatrix.
- Evaluación A/B de cuantizaciones: la perplejidad medida con la misma build, los mismos flags y el mismo conjunto de test permite comparar de forma controlada el equilibrio tamaño/calidad entre distintos artefactos del mismo modelo.
- Computación en el borde con presupuesto de memoria ajustado: 3,31 BPW medios frente a 4,57 del IQ4_NL liberan ~8 GB de espacio, lo que permite desplegar en máquinas con menos VRAM a cambio de asumir un incremento del 19,9 % en perplejidad.

## Benchmarks y rendimiento

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras baterías estándar en la información disponible. El único dato cuantitativo es la perplejidad sobre WikiText-2 raw (test held-out, `-c 512 --chunks 16`, corpus únicamente en inglés):

| Artefacto | Tamaño | BPW | Perplejidad |
|---|---:|---:|---:|
| IQ4_NL upstream | 20,1 GB | 4,57 | 11,4322 ± 0,509 |
| Este cuantizado dinámico | 12,04 GiB | 3,31 | 13,7041 ± 0,625 |

Rendimiento medido en 2× RTX 3060 12 GB (CUDA, todas las capas offloaded):

| Métrica | Valor |
|---|---|
| Prefill (pp512) | 1100,6 t/s |
| Generación (tg128) | 65,9 t/s |
| Generación vía `llama-server` | 52,9 t/s |
| Preprocesado de perplejidad | 2,70 s por fragmento de 512 tokens (frente a 7,46 s del IQ4_NL, ~2,8× más rápido) |

Balance declarado por el autor: 36 % menos de tamaño a cambio de un 19,9 % más de perplejidad.

## Requisitos de hardware

- Peso de los pesos: 12,04 GiB para el fichero GGUF cuantizado; el BF16 de origen ronda los 62 GB.
- VRAM medida por el autor en 2× RTX 3060 12 GB con caché KV q8_0/q8_0 y todas las capas offloaded: 65.536 tokens de contexto dejan 5,2 GiB libres en la GPU de display; 131.072 tokens dejan 4,5 GiB; 262.144 tokens (máximo nativo) dejan 3,1 GiB, pero solo unos 305 MiB libres en la segunda GPU, por lo que el prefill largo queda muy justo.
- Los pesos por sí solos (12,04 GiB) exceden la VRAM útil de una GPU de 12 GB una vez descontados los buffers del motor, de modo que el montaje validado por el autor reparte la carga entre dos GPU o recurre a offload parcial.
- GPU recomendadas: el autor valida 2× RTX 3060 12 GB (SM86). No se han publicado mediciones en A100, H100, RTX 4090 ni otras GPU en la información disponible.
- Opciones de despliegue: `llama-server` de la rama shuxiaoqiong/llama.cpp `xing4_0-port`, compilada con CUDA (el ejemplo documentado usa SM86). El soporte upstream está pendiente en el PR ggml-org/llama.cpp#29012. No hay confirmación de funcionamiento en vLLM, TGI u Ollama: **no disponible**.
- Comando de referencia: `./llama-server -m ... --alias xing4-29b-a4b -c 131072 --parallel 1 --n-gpu-layers 99 -ctk q8_0 -ctv q8_0 -fa on --jinja --chat-template-kwargs '{"enable_thinking":true}' --temp 1.0 --top-p 0.95 --repeat-penalty 1.05 --spec-type none`.

## Comparativa con modelos similares

No se dispone de datos de otros modelos comparables en la información proporcionada. La comparación posible se establece entre los tres artefactos del mismo modelo base:

| Artefacto | Parámetros | Contexto | Tamaño / BPW | Perplejidad (WikiText-2 raw) | Licencia |
|---|---|---:|---|---:|---|
| Xing4.0-29B-A4B BF16 (upstream) | 31,2 mil millones | 262.144 | ~62 GB / 16 bits | no disponible | Apache-2.0 |
| Xing4.0-29B-A4B IQ4_NL (upstream) | 31,2 mil millones | 262.144 | 20,1 GB / 4,57 | 11,4322 ± 0,509 | Apache-2.0 |
| Este GGUF dinámico (jmarceno) | 31,2 mil millones | 262.144 | 12,04 GiB / 3,31 | 13,7041 ± 0,625 | Apache-2.0 |

Frente a modelos de tamaño similar de otros fabricantes no hay datos de benchmarks ni comparativas publicadas en la información disponible.

## Limitaciones y advertencias

- El motor `xing4_0` no está integrado en llama.cpp upstream: es obligatorio compilar la rama `xing4_0-port` o aplicar el PR #29012, todavía abierto. Esto limita la portabilidad y la estabilidad a largo plazo.
- El bloque MTP (`blk.40`) se carga pero nunca se ejecuta («model has unused tensor blk.40.* -- ignoring»), por lo que no hay decodificación especulativa disponible. Como consecuencia, `llama-imatrix` no genera entradas para esos tensores y `llama-quantize` rechaza los tipos que requieren imatrix (IQ1_*, IQ2_*, IQ3_XXS) en ellos, quedando fijados a IQ4_XS/IQ4_NL.
- La perplejidad se midió sobre un corpus exclusivamente en inglés mientras el modelo es chino-céntrico: los valores deben interpretarse como una comparación relativa A/B entre los dos cuantizados, no como una medida absoluta de calidad.
- `llama-cli` de este motor no tiene modo de un solo turno y entra en bucle al recibir EOF por stdin; para pruebas de generación debe usarse `llama-server`.
- Con 262.144 tokens de contexto la VRAM en la segunda GPU se reduce a unos 305 MiB libres en el montaje de 2× 12 GB, lo que hace inviable el prefill largo en esa configuración.
- Al ser un derivado cuantizado, el modelo no se ha reentrenado: hereda los sesgos y el riesgo de alucinación del modelo base, que no están documentados en la información disponible.
- El repositorio registra 0 descargas y 0 likes desde su publicación el 17 de septiembre de 2026, por lo que no cuenta con validación independiente de la comunidad.
- No hay confirmación de soporte de tool calling, function calling ni flujos de agente formales; cualquier uso en producción de ese tipo requiere validación propia.
- Licencia Apache-2.0, que permite uso comercial. El copyright del modelo base corresponde a China Telecom AI Technology Co., Ltd. y conviene conservar los avisos de atribución.

## Enlaces

- Repositorio del cuantizado: https://huggingface.co/jmarceno/Xing4.0-29B-A4B-GGUF
- Modelo base: https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B
- PR de soporte upstream en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/29012
- Rama de motor utilizada (`xing4_0-port`): https://github.com/shuxiaoqiong/llama.cpp/tree/xing4_0-port
- La búsqueda web realizada no devolvió resultados relevantes: únicamente enlaces genéricos a Discord, sin relación con el modelo.

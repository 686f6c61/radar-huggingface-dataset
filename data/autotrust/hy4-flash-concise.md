# autotrust/hy4-flash-concise

## Resumen

hy4-flash-concise es una variante experimental de tencent/Hy4-flash, un modelo de lenguaje de arquitectura MoE (mezcla de expertos) con 144.761.604.413 parametros totales, publicada por el usuario autotrust. No se trata de un fine-tuning ni de un nuevo entrenamiento: es una edicion quirurgica de pesos (weight-space programming) que reescribe nueve matrices `down_proj` de los shared experts del modelo base con una actualizacion de rango uno, sin pasos de gradiente ni datos de entrenamiento adicionales. El objetivo es reducir el numero de tokens de razonamiento (thinking tokens) que el modelo genera antes de responder, abaratando la inferencia a costa de una cierta perdida de precision.

La edicion se deriva de las propias activaciones del modelo: se calcula una direccion en el residual stream que separa los ultimos 48 tokens de pensamiento antes de `</think>` del resto del razonamiento, medida sobre 288 trazas de MATH-train nivel 5, y se compila esa direccion en las nueve matrices de los shared experts de las capas 22, 24, ..., 38. Como el shared expert se ejecuta en todos los tokens, un termino de rango uno en su proyeccion de salida actua como un vector de steering constante integrado en los pesos. La reduccion de tokens de pensamiento oscila entre el 37% y el 55% segun el benchmark, con caidas de precision que van desde 2,5 puntos en GPQA Diamond hasta 10,7 puntos en IFBench.

El modelo es relevante ahora porque propone una via distinta a la del ajuste fino o el RLHF para controlar el coste de razonamiento: una intervencion de un solo paso, barata computacionalmente y auditable, con control de dosis (alpha) y un experimento de control que demuestra que el ahorro proviene de la direccion elegida y no de la perturbacion en si. Es, sin embargo, un artefacto experimental: el autor lo marca explicitamente como tal y advierte de que no se suba alpha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con shared experts; pesos NVFP4 en MLPs, FP8 en tablas Engram, BF16 en el resto |
| Parametros totales | 144.761.604.413 |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 40.960 tokens en la configuracion de ejemplo con vLLM (`--max-model-len 40960`); el maximo nativo del modelo base no se detalla en la informacion proporcionada |
| Tipos de cuantizacion | NVFP4 (MLPs), FP8 (tablas Engram), BF16; GGUF Q4_K_M y SPARK-4Bit mediante adaptador LoRA; edicion almacenada en BF16 |
| Idiomas soportados | no disponible |
| Licencia | tencent-hy-license (licencia "other", enlazada en el repo de tencent/Hy4-flash) |
| Formato de pesos | safetensors (transformers), GGUF (via adaptador LoRA sobre AngelSlim/Hy4-flash-GGUF), NVFP4 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base tencent/Hy4-flash: un transformer con capas MoE que incluyen shared experts (expertos compartidos que procesan todos los tokens) ademas de los expertos enrutados. Los pesos proceden de atakans/Hy4-flash-NVFP4, una cuantizacion del original con MLPs en NVFP4, tablas Engram en FP8 y el resto en BF16. Sobre esa base, autotrust aplica una edicion de rango uno unicamente a las matrices `model.layers.{22,24,...,38}.mlp.shared_experts.down_proj.weight`, es decir, nueve matrices. La formula es `W ← W_bf16_original + α · n · d″ uᵀ / ‖u‖²`, con α = 0.1 en la version raiz y α = 0.05 en la version suave, almacenada en BF16 y excluida de la cuantizacion NVFP4. El tamano relativo del cambio es del 0,56% al 1,09% por capa; todo lo demas es byte-identico al checkpoint de partida.

No hay entrenamiento en el sentido habitual: no hay pasos de gradiente ni dataset de fine-tuning. La direccion `d` se obtiene de las activaciones del propio modelo sobre 288 trazas de MATH-train nivel 5, y `d″` corrige esa direccion para la post-normalizacion del FFN (`combine_output_norm`), de modo que tras la RMSNorm el vector escrito apunte a lo largo de `d`. `u` es la media de la entrada a la proyeccion down del shared expert en tokens de pensamiento y `n` es la norma media de la salida del FFN antes de la post-norm. La seleccion de direcciones, capas y alpha se hizo exclusivamente sobre MATH train, sin usar ningun benchmark de evaluacion. El autor incluye un control con una edicion aleatoria de norma equivalente y direccion ortogonal a `d`, que produce +0,0 puntos de precision y +8% de tokens, lo que respalda que el ahorro proviene de la direccion y no de la perturbacion.

## Capacidades

- Generacion de texto conversacional y razonamiento multi-paso en modo thinking, con el parser de razonamiento `hy_v4` de vLLM.
- Razonamiento matematico de nivel competitivo (MATH, GPQA Diamond) y resolucion de problemas cientificos.
- Generacion de codigo y resolucion de problemas de programacion (LiveCodeBench v6).
- Seguimiento de instrucciones estrictas (evaluado con IFBench en modo loose).
- Capacidad multimodal declarada en el modelo base (el ejemplo de despliegue limita imagenes y video a cero con `--limit-mm-per-prompt`, lo que sugiere soporte nativo de vision que aqui se desactiva).
- Soporte de cuantizacion NVFP4 y despliegue en vLLM y llama.cpp.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling ni uso como agente.

## Casos de uso

- Razonamiento matematico con presupuesto de tokens ajustado: en pipelines de resolucion de problemas donde el coste por consulta importa, la version alpha = 0.05 reduce los tokens de pensamiento un 23-25% en MATH y LiveCodeBench con una caida de precision de 1,5-2,3 puntos, lo que permite servir mas peticiones por GPU manteniendo calidad casi intacta.
- Evaluacion comparativa de tecnicas de control de razonamiento: el checkpoint sirve como referencia reproducible para investigadores que estudien weight-space programming, ya que incluye la direccion, los scripts en `edit/` y un control con edicion aleatoria.
- Despliegue en DGX Spark y hardware Blackwell: el adaptador GGUF de 167 KB aplicado sobre AngelSlim/Hy4-flash-GGUF permite ejecutar la variante concisa en llama.cpp sobre hardware de consumo o estaciones compactas, con validacion en Q4_K_M.
- Servicio de inferencia a gran escala en H200: con 97 GiB de pesos en GPU y tablas Engram en RAM del host, el modelo alcanza unos 1.5k tok/s agregados en decodificacion con 100 peticiones concurrentes, adecuado para backends de chat con razonamiento.
- Generacion de codigo en produccion con tolerancia a pequenas perdidas: para tareas de autocompletado o generacion de tests donde el 78,3% de LiveCodeBench v6 frente al 84,6% del base es aceptable, el ahorro del 36,8% en tokens de pensamiento reduce la factura de inferencia.
- Investigacion sobre direcciones latentes y steering: las matrices editadas y las direcciones publicadas permiten replicar el experimento en otras capas o modelos de la familia Hy4, asi como estudiar la relacion entre la geometria del residual stream y la longitud del razonamiento.
- Prototipado de asistentes conversacionales con contexto largo: la ventana de 40.960 tokens configurable en vLLM permite mantener conversaciones multi-turno extensas, aunque la perdida en IFBench desaconseja usarlo en tareas de instrucciones estrictas.

## Benchmarks y rendimiento

Configuracion: vLLM, checkpoint frente al base emparejado (las mismas nueve matrices en BF16 sin editar), thinking activado (`reasoning_effort: high`), temperatura 0,9, maximo 32k tokens, una H200. Delta emparejado por problema con IC bootstrap al 95%.

| Benchmark | Base | Concise (α=0.1) | Δ precision [IC 95%] | Δ tokens de pensamiento [IC 95%] |
|---|---|---|---|---|
| GPQA Diamond (198 × 2) | 91,2 | 88,6 | −2,5 [−5,3, +0,3] | −39,6% [−43,3, −35,6] |
| LiveCodeBench v6 (175, 2025-01…04) | 84,6 | 78,3 | −6,3 [−12,0, −0,6] | −36,8% [−43,3, −30,3] |
| IFBench (300, loose) | 76,7 | 66,0 | −10,7 [−16,0, −5,3] | −54,8% [−58,3, −51,0] |
| 13 tareas de codigo/matematicas/ciencia × 3 (held-out) | 39/39 | 38/39 | −2,6 | −54,2% |
| MATH train screen (64 × 2) | 92,2 | 89,8 | −2,3 [−6,2, +0,8] | −40,2% [−47,8, −29,9] |

Tokens de pensamiento medios, base → concise: GPQA 5448 → 3291; LCB 8564 → 5409; IFBench 5275 → 2382; tareas held-out 5415 → 2482.

Version suave (alpha = 0.05):

| Benchmark | Base | α=0.05 | Δ precision [IC 95%] | Δ tokens de pensamiento [IC 95%] |
|---|---|---|---|---|
| GPQA Diamond (198 × 2) | 91,2 | 89,6 | −1,5 [−3,8, +0,5] | −20,6% [−25,6, −15,7] |
| LiveCodeBench v6 (175) | 84,6 | 82,3 | −2,3 [−8,0, +3,4] | −25,0% [−31,2, −18,8] |
| IFBench (300, loose) | 76,7 | 70,3 | −6,3 [−11,0, −2,0] | −36,6% [−40,8, −31,7] |
| 13 tareas held-out × 3 | 39/39 | 37/39 | −5,1 | −29,1% |

Control: una edicion aleatoria de norma equivalente (mismas capas, mismo ‖ΔW‖, direccion aleatoria ortogonal a `d`) sobre MATH screen da +0,0 puntos de precision y +8% de tokens. Respuesta a la dosis (MATH screen): α = 0,05 → −23% tokens; α = 0,075 → −32%; α = 0,1 → −40%; α = 0,3 → respuestas incorrectas; α = 1,0 → el modelo entra en bucle sobre `</think>`.

## Requisitos de hardware

- VRAM estimada: en la configuracion de referencia con vLLM, 97 GiB de pesos en GPU y las tablas Engram en RAM del host; el repo completo ocupa 164,8 GB.
- GPU recomendadas: una H200 es la plataforma validada (97 GiB de pesos en GPU). Para NVFP4 se requiere imagen `vllm/vllm-openai:hy4-flash` y el fichero `vllm/models/hy_v4_flash/nvidia/model.py` del repositorio atakann/dgx-spark-recipes; en DGX Spark (SM120) se usa la imagen completa de esa receta.
- GPU de consumo: no cabe en GPUs consumer de 24 GB en BF16/NVFP4; la via para hardware limitado es el adaptador GGUF sobre AngelSlim/Hy4-flash-GGUF con llama.cpp (por ejemplo, Q4_K_M o SPARK-4Bit en DGX Spark).
- Opciones de despliegue: vLLM (recomendado, con `--reasoning-parser hy_v4`, `--max-model-len 40960`, `--max-num-seqs 64`, `--limit-mm-per-prompt '{"image":0,"video":0}'`) y llama.cpp mediante `llama-server -m Hy4-flash-SPARK-4Bit-Fast.gguf ... --lora-scaled hy4-flash-concise-lora.gguf:0.1`.
- Latencia y throughput: en una H200, unos 1.5k tok/s agregados en decodificacion con 100 peticiones concurrentes.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| autotrust/hy4-flash-concise | 144,76B | 40.960 configurable en vLLM | tencent-hy-license | safetensors, NVFP4, LoRA GGUF | Edicion de pesos; −37 a −55% tokens de pensamiento, precision a la baja |
| tencent/Hy4-flash (base) | no disponible en la informacion | no disponible | tencent-hy-license | safetensors | Referencia de precision: GPQA 91,2; LCB v6 84,6; IFBench 76,7 |
| atakans/Hy4-flash-NVFP4 | no disponible en la informacion | no disponible | no disponible | NVFP4 | Cuantizacion del base; mismo rendimiento que el base en la tabla de resultados |
| AngelSlim/Hy4-flash-GGUF | no disponible en la informacion | no disponible | no disponible | GGUF (Q4_K_M, SPARK-4Bit) | Destino del adaptador LoRA; validado en Q4_K_M (MATH: −38% tokens, −2,3 puntos) |

## Limitaciones y advertencias

- Estado experimental declarado por el autor: no es un modelo de produccion y la edicion no ha pasado por un proceso de validacion amplio fuera de los benchmarks citados.
- Perdida de precision significativa en instrucciones estrictas: IFBench cae 10,7 puntos con alpha = 0,1 y 6,3 puntos con alpha = 0,05; no recomendado para tareas de seguimiento estricto de instrucciones.
- Caida en codigo: LiveCodeBench v6 baja 6,3 puntos con alpha = 0,1, con un intervalo de confianza que incluye el cero en el limite superior (−0,6), por lo que la magnitud real es incierta.
- Fragilidad ante alpha alto: con alpha = 0,3 las respuestas se vuelven incorrectas y con alpha = 1,0 el modelo entra en bucle sobre `</think>`; el autor advierte explicitamente de no subir alpha.
- El adaptador GGUF solo esta validado en Q4_K_M; no se ha validado por separado en las builds SPARK-4Bit, y llama.cpp no agrupa en lotes (batch) segun la nota del autor.
- Idiomas soportados no documentados; el comportamiento multilingue no se ha evaluado en la informacion disponible.
- Riesgo de alucinacion no cuantificado en la informacion proporcionada; al reducir el razonamiento, la probabilidad de respuestas erroneas aumenta en las tareas donde la precision ya cae.
- Restricciones de licencia: tencent-hy-license, marcada como "other"; es necesario revisar los terminos del fichero LICENSE del repo tencent/Hy4-flash antes de cualquier uso comercial.
- La seleccion de hiperparametros se hizo solo sobre MATH train, lo que puede introducir sesgo hacia ese dominio y no garantiza transferencia a otras tareas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/autotrust/hy4-flash-concise
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Cuantizacion NVFP4 de partida: https://huggingface.co/atakans/Hy4-flash-NVFP4
- GGUF de destino del adaptador: https://huggingface.co/AngelSlim/Hy4-flash-GGUF
- Licencia: https://huggingface.co/tencent/Hy4-flash/blob/main/LICENSE
- Receta de despliegue en DGX Spark: https://github.com/atakann/dgx-spark-recipes

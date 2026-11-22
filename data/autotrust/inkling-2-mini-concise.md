# autotrust/inkling-2-mini-concise

## Resumen

inkling-2-mini-concise es un checkpoint derivado de thinkingmachines/Inkling-2-Mini, un modelo multimodal de tipo image-text-to-text con arquitectura de transformer con bucles (looped transformer) y mezcla de expertos (MoE), desarrollado originalmente por Thinking Machines. Este checkpoint, publicado por el usuario autotrust, no introduce entrenamiento ni datos nuevos: aplica una edicion de pesos de rango uno y sin gradientes (weight-space programming) sobre seis matrices de proyeccion de salida de atencion, con el objetivo de reducir el sobrepensamiento (overthinking) del modelo base y mejorar su rendimiento en razonamiento y codigo.

El problema que aborda es concreto: la model card original advierte de que el modelo tiende a quedarse atrapado en bucles de razonamiento largos o a re-verificar su propio trabajo sin avanzar. La edicion compila una direccion leida de las propias activaciones del modelo (la direccion "a punto de terminar de pensar") en las capas 18 a 23, con un factor alpha de 0.2. El resultado es una reduccion media de tokens de pensamiento de entre el 9 % y el 31 % segun el benchmark, con mejoras de +2.5 puntos en GPQA Diamond y +3.4 en LiveCodeBench v6, a costa de una caida de -4.7 en IFBench.

El modelo conserva el 100 % de los pesos originales salvo esas seis matrices, con un total de 26 388 646 440 parametros y un tamano de repositorio de 20.2 GB. La licencia es Apache-2.0, heredada del modelo base, y su relevancia actual radica en que demuestra una tecnica de post-procesado de pesos barata (sin GPU-dias de entrenamiento) para corregir patologias de razonamiento en modelos ya desplegados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped transformer con mezcla de expertos (MoE); capas 6-17 forman el nucleo con bucles (tres pasadas) y capas 18-23 son la "coda" que se ejecuta una vez por token |
| Parametros totales | 26 388 646 440 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (los benchmarks se ejecutaron con un maximo de 32k tokens) |
| Tipos de cuantizacion | El checkpoint se distribuye en BF16; el modelo base usa expertos en NVFP4/MXFP8. Tag de 8-bit y modelopt en el repo |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (sujeta ademas a la Model Acceptable Use Policy de Thinking Machines) |
| Formato de pesos | safetensors (model-wsp-edit.safetensors y model-stripped.safetensors) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con bucles: un nucleo de capas 6 a 17 que se ejecuta tres veces por token, seguido de una "coda" de capas 18 a 23 que se ejecuta una sola vez. El modelo incorpora mezcla de expertos con expertos cuantizados en NVFP4/MXFP8, un torre de vision (vision tower) para entrada de imagenes y un especulador DSpark para decodificacion especulativa. La edicion de este checkpoint afecta unicamente a `model.llm.layers.{18..23}.attn.wo_ud.weight`, la proyeccion de salida de atencion de las seis capas de coda; el nucleo con bucles no se toca.

No hay entrenamiento ni fine-tuning en este checkpoint. La edicion sigue el metodo de weight-space programming (Takehi et al., 2026) y la replicacion con normalizacion de norma de Concept Country (2026). La direccion `d` se obtiene como la media del estado residual parcial de bloque sobre los ultimos 48 tokens de pensamiento menos el resto del pensamiento, medida sobre 283 trazas de MATH-train de nivel 5 del propio modelo. Se elimina su componente a lo largo de una direccion de seguimiento de instrucciones (IFEval pensamiento menos codigo pensamiento, medida sobre prompts disjuntos de IFBench). La direccion corregida `d″` compensa la convolucion corta de atencion (`attn_sconv`, sumas de taps por canal). La actualizacion aplicada es `W ← W + α · n · d″ uᵀ / ‖u‖²` con α = 0.2, donde `u` es la media de la entrada de `wo_ud` en tokens de pensamiento y `n` la norma media de salida de `wo_ud`. El tamano relativo de la edicion es del 0.28-0.58 % por capa. Todo lo demas es identico byte a byte al modelo base.

## Capacidades

- Generacion de texto y razonamiento multi-paso con modo de pensamiento (thinking mode) activado por defecto, con un parametro `reasoning_effort` (0.9 por defecto en las pruebas).
- Razonamiento cientifico y de nivel experto, evaluado en GPQA Diamond.
- Generacion de codigo, evaluada en LiveCodeBench v6.
- Razonamiento matematico, con trazas de MATH-train usadas en la construccion de la edicion.
- Seguimiento de instrucciones estrictas (evaluado en IFBench), aunque con una ligera degradacion respecto al base.
- Procesamiento de imagen y texto (pipeline image-text-to-text, torre de vision incluida).
- Conversacion multi-turno.
- Decodificacion especulativa mediante el especulador DSpark del modelo base.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.

## Casos de uso

- Razonamiento cientifico de nivel experto: el modelo mejora +2.5 puntos en GPQA Diamond respecto al base y reduce un 10.4 % los tokens de pensamiento, por lo que es adecuado para pipelines de respuesta a preguntas cientificas donde el coste por consulta importa y el modelo base se quedaba sin responder por truncamiento a 32k tokens (42 casos truncados en el base frente a 37 en este checkpoint).
- Generacion de codigo en produccion: con +3.4 puntos en LiveCodeBench v6 y un 9.3 % menos de tokens de pensamiento, encaja en asistentes de codigo y revision automatizada de parches donde la latencia y el coste de tokens de razonamiento son criticos.
- Analisis de documentos con imagenes: al conservar la torre de vision y el pipeline image-text-to-text, puede procesar capturas, diagramas o documentos escaneados junto a texto en un mismo prompt.
- Despliegue de agentes con presupuesto de contexto ajustado: la reduccion de tokens de pensamiento (hasta un 30.6 % en IFBench) libera ventana de contexto para el estado del agente y el historial de herramientas, aunque el soporte explicito de tool calling no esta documentado.
- Servicio de inferencia de alta concurrencia: en una H200 con vLLM se midio un decode agregado de aproximadamente 3.6-5.3k tok/s con 100-256 peticiones concurrentes, lo que lo hace viable para endpoints multi-usuario.
- Investigacion sobre edicion de pesos: los ficheros en `edit/` (direcciones, hook de captura para vLLM y scripts de construccion) permiten reproducir y extender la tecnica a otros modelos con la misma patologia de sobrepensamiento.
- Evaluacion comparativa de tecnicas de post-procesado: sirve como referencia controlada (mismo base, misma licencia, un solo cambio localizado) para medir el efecto de la edicion de pesos frente a fine-tuning o RLHF.

## Benchmarks y rendimiento

Datos de la model card. Configuracion: vLLM, thinking activado (`reasoning_effort` 0.9), temperatura 0.9, maximo 32k tokens, una H200. Delta emparejado por problema con intervalo de confianza bootstrap del 95 %.

| Benchmark | Base | concise | Delta precision [IC 95 %] | Delta tokens de pensamiento [IC 95 %] | Truncados a 32k |
|---|---|---|---|---|---|
| GPQA Diamond (198 x 2) | 80.8 | 83.3 | +2.5 [0.0, +5.3] | -10.4 % [-15.4, -5.6] | 42 -> 37 |
| LiveCodeBench v6 (175, 2025-01 a 2025-04) | 65.1 | 68.6 | +3.4 [-2.3, +9.1] | -9.3 % [-14.6, -3.7] | 53 -> 43 |
| IFBench (300, loose) | 78.3 | 73.7 | -4.7 [-9.0, 0.0] | -30.6 % [-37.6, -23.3] | 4 -> 2 |
| 13 tareas retenidas de codigo/matematicas/ciencia x 3 | 35/39 | 34/39 | -2.6 [-12.8, +7.7] | -21.4 % | 0 -> 0 |

Tokens de pensamiento medios, base -> concise: GPQA 11 207 -> 10 039; LCB 14 775 -> 13 403; IFBench 4 998 -> 3 467; tareas retenidas 8 093 -> 6 359.

Respuesta a la dosis (misma direccion, mayor alpha):

| alpha | GPQA | LCB v6 | IFBench | Tokens de pensamiento (GPQA / LCB / IFBench) |
|---|---|---|---|---|
| 0.2 (este modelo) | +2.5 | +3.4 | -4.7 | -10 % / -9 % / -31 % |
| 0.5 | +1.5 | -6.9 | -15.3 | -42 % / -63 % / -63 % |
| 0.7 | -16.7 | -29.1 | -33.0 | -82 % / -93 % / -85 % |

El autor advierte explicitamente de no escalar la edicion por encima de alpha = 0.2.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 20.2 GB en BF16 (pesos en safetensors), pero el modelo base emplea expertos en NVFP4/MXFP8 y el total de parametros es de 26.4B, por lo que el despliegue real requiere una GPU con memoria suficiente para pesos mas cache KV a 32k tokens; no se especifica la VRAM exacta necesaria.
- GPU recomendadas: H200 (medido), H100 (la model card menciona Hopper H100/H200 con parches de kernels), DGX Spark (Blackwell) para la imagen oficial.
- Cabe en GPU consumer: no disponible en la informacion proporcionada.
- Opciones de despliegue: vLLM con la imagen oficial `vllm/vllm-openai:inkling-2-mini` y `--reasoning-parser inkling`. En Hopper es necesario sustituir `_moe_C_stable_libtorch.abi3.so` por el de la imagen `vllm/vllm-openai:nightly-x86_64` (2026-11-21, compilada para SM90) y redirigir `ops/conv_mix.py` a su ruta de fallback SM12x para SM90. No se documentan opciones con llama.cpp, Ollama ni TGI.
- Latencia y throughput: decode agregado de aproximadamente 3.6-5.3k tok/s en una H200 con 100-256 peticiones concurrentes. No se proporcionan cifras de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GPQA Diamond | LiveCodeBench v6 | IFBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| inkling-2-mini-concise | 26.4B | no disponible (max. probado 32k) | 83.3 | 68.6 | 73.7 | Apache-2.0 | Hugging Face |
| thinkingmachines/Inkling-2-Mini (base) | 26.4B | no disponible (max. probado 32k) | 80.8 | 65.1 | 78.3 | Apache-2.0 | Hugging Face |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada; la unica comparacion documentada es contra el modelo base del que deriva.

## Limitaciones y advertencias

- La edicion degrada el seguimiento estricto de instrucciones: -4.7 puntos en IFBench (limite superior del IC en 0.0), con la mayor reduccion de tokens de pensamiento (-30.6 %) precisamente en esa tarea.
- Las tareas retenidas de codigo, matematicas y ciencia muestran una caida media de -2.6 puntos (34/39 frente a 35/39), aunque el intervalo de confianza cruza cero.
- El autor advierte explicitamente de no escalar la edicion: con alpha = 0.5 y 0.7 el rendimiento se desploma (hasta -29.1 en LCB v6 con alpha = 0.7).
- Parte de la mejora en benchmarks proviene de reducir generaciones desbocadas que se truncaban a 32k tokens; en escenarios con limites de contexto mas bajos o mas altos el efecto puede diferir.
- Riesgo de alucinacion y sesgos conocidos: no disponible en la informacion proporcionada.
- Idiomas soportados: no disponible; no se puede garantizar calidad fuera de los idiomas cubiertos por el modelo base.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el uso esta ademas sujeto a la Model Acceptable Use Policy de Thinking Machines.
- El despliegue en Hopper requiere parches manuales de kernels (sustitucion del binario MoE y fallback de `conv_mix.py`); la imagen oficial esta pensada para Blackwell y DGX Spark.
- El checkpoint es una modificacion no oficial del modelo base; el autor no es Thinking Machines y el modelo tiene 0 descargas y 1 like en el momento de la consulta.
- Soporte de tool calling y de agentes multi-paso: no documentado, por lo que no debe asumirse en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/autotrust/inkling-2-mini-concise
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Model Acceptable Use Policy de Thinking Machines: https://thinkingmachines.ai/model-acceptable-use-policy/
- Referencia del metodo: weight-space programming (Takehi et al., 2026) y replicacion con normalizacion de norma de Concept Country (2026); no se proporcionan URLs en la informacion disponible.
- Ficheros de la edicion: carpeta `edit/` del repositorio (directions.npz, hook de captura para vLLM y scripts de construccion).

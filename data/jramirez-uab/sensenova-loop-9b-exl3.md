# JRamirez-UAB/SenseNova-Loop-9B-EXL3

## Resumen

SenseNova-Loop-9B-EXL3 es una cuantizacion comunitaria no oficial, en formato EXL3 (ExLlamaV3) a 5,00 bits por peso de media, del modelo sensenova/SenseNova-Loop-9B, un modelo de lenguaje y vision de 9B parametros con arquitectura de transformer "looped". La publica el usuario JRamirez-UAB y su objetivo declarado es servir el modelo completo, con sus 262.144 tokens de contexto y capacidad de vision, en una unica GPU de 24 GB de memoria (RTX 3090, RTX 4090 y similares).

El modelo base emplea 32 capas fisicas, de las cuales las capas 4 a 27 se ejecutan dos veces por token, atencion lineal de estilo Qwen3.5 con 8 capas de atencion completa, una torre de vision y una cabeza MTP (multi-token prediction) para decodificacion especulativa. La cuantizacion asigna entre 3 y 7 bits por tensor segun su sensibilidad medida, con `lm_head`, torre de vision y cabeza MTP a 6 bits, y mantiene los embeddings de tokens en BF16.

Su relevancia practica es concreta: demuestra que un modelo con contexto largo, vision y tool calling puede desplegarse en hardware de consumo con una perdida de calidad medida (divergencia KL de 0,005-0,006 frente a BF16) y sirviendo dos sesiones concurrentes de contexto completo. Esta pensado y evaluado especificamente para un caso de uso: agente local de administracion de sistemas Linux en castellano mediante opencode con tool calling.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer "looped" con atencion lineal estilo Qwen3.5 (8 capas de atencion completa), torre de vision y cabeza MTP |
| Parametros totales | 3.946.499.840 (dato de safetensors del repo); el nombre comercial indica 9B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (241.664 en configuracion de 16 GB sin MTP) |
| Tipos de cuantizacion | EXL3 a 5,00 bpw de media, con 3 a 7 bits por tensor segun sensibilidad; `lm_head`, vision y MTP a 6 bits; embeddings en BF16 |
| Idiomas soportados | es, en |
| Licencia | Apache-2.0 (heredada del modelo base; no es release oficial de SenseNova) |
| Formato de pesos | safetensors (EXL3, requiere exllamav3 y el plugin `vllm-quantpack`) |

## Arquitectura y entrenamiento

El modelo base es un transformer con capas recurrentes o "looped": de sus 32 capas fisicas, las capas 4 a 27 se aplican dos veces por token, de modo que el computo efectivo por token es mayor que el de un transformer de 32 capas convencional. Combina atencion lineal de estilo Qwen3.5 con solo 8 capas de atencion completa, incorpora una torre de vision para entrada image-text-to-text y anade una cabeza MTP que permite decodificacion especulativa con 2 tokens de borrador. El paper asociado es arXiv:2406.11235.

Sobre el entrenamiento del modelo base no se proporciona informacion en la documentacion disponible (numero de tokens, composicion del dataset, RLHF/DPO): no disponible. Lo que si documenta el autor de la cuantizacion es el proceso de calibracion: las matrices de Hessian de las capas looped se recogieron a lo largo de las dos pasadas del bucle, sobre trazas internas de conversaciones de administracion de sistemas en castellano. La asignacion de bits por tensor deriva de la sensibilidad medida, con un presupuesto global de 5,00 bpw. El checkpoint se sirve con vLLM 0.34.0 mas exllamav3 1.6.7 mas el plugin `vllm-quantpack` 0.1.10 o superior, que aporta el codigo del modelo SenseNova Loop; ni Transformers estandar ni SGLang pueden cargarlo.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con modo de razonamiento extendido (`xhigh`) y trazas de pensamiento de cientos de tokens por problema.
- Capacidad de vision: pipeline image-text-to-text, con torre de vision cuantizada a 6 bits y prueba de imagen superada 15/15.
- Tool calling y function calling: 30/30 en la bateria interna y 60/60 con la peticion real de opencode (3 casos x 20).
- Ejecucion de tareas de agente con comandos reales: 21/30 frente a 23/30 del modelo BF16.
- Contexto largo con recuperacion tipo "needle in a haystack" hasta 256k tokens, con el mismo numero de fallos que BF16.
- Decodificacion especulativa mediante cabeza MTP (2 tokens), con incrementos de throughput de hasta 1,6x.
- Multilingue limitado a es y en, con fuga de palabras en chino hacia respuestas en castellano que se mitiga con `top_k` 20.
- Cache KV cuantizada `k8v4_per_token_head` (claves int8, valores int4) para reducir huella de memoria.
- Compatible con endpoints de vLLM (`endpoints_compatible`).

## Casos de uso

- Agente local de administracion de sistemas Linux: es el caso para el que se calibro y evaluo; con tool calling verificado sobre la peticion real de opencode, el modelo puede ejecutar comandos, leer salidas y encadenar pasos en una maquina de un departamento de TI sin enviar datos a la nube.
- Asistencia en terminal con contexto largo: los 262.144 tokens permiten cargar logs extensos, ficheros de configuracion y el historial completo de una sesion de depuracion en una sola ventana, algo util para diagnosticar fallos que solo se explican por eventos dispersos en el tiempo.
- Analisis de capturas de pantalla y diagramas de infraestructura: la torre de vision permite adjuntar una imagen de un panel de monitorizacion o de un error grafico y pedir al modelo que lo interprete junto con el contexto textual.
- Servicio multiusuario en una sola GPU de 24 GB: con dos sesiones concurrentes de contexto completo (pool KV de 599.557 tokens) puede atender a dos administradores en paralelo en una unica RTX 3090 o RTX 4090.
- Generacion y revision de scripts en castellano: util para redactar unidades systemd, reglas de firewall o scripts de automatizacion, con la advertencia de ajustar `top_k` para evitar mezcla de idiomas.
- Razonamiento sobre documentacion tecnica: el modo `xhigh` con trazas de razonamiento de mediana 346 tokens por problema encaja en tareas de planificacion de cambios en produccion que requieren justificar cada paso.
- Despliegue en entornos con requisitos de soberania del dato: al ser Apache-2.0 y ejecutable en hardware propio, permite mantener conversaciones y trazas internas fuera de servicios externos.

## Benchmarks y rendimiento

| Metrica | Resultado EXL3 5,00 bpw | Referencia BF16 |
|---|---|---|
| Divergencia KL (traza opencode interna) | 0,0060 | 0 (referencia) |
| Divergencia KL (traza publica de turboderp) | 0,0051 | 0 (referencia) |
| Tool calls (bateria interna) | 30/30 | no disponible |
| Tool calls (peticion real opencode, 3 x 20) | 60/60 | no disponible |
| Tareas de agente con ejecucion real | 21/30 (6, 9, 6) | 23/30 |
| Vision (prueba de imagen) | 15/15 | no disponible |
| Razonamiento `xhigh` | 39/48, 22.192 tokens de razonamiento (mediana 346) | no disponible |
| Bucles de generacion | 0/30 a temperatura 1,0 (1/30 a 0,6; 2/30 a 0,8) | no disponible |
| Needle 8 hechos, 8 profundidades 93k-248k | mismos 2 fallos que BF16 | 2 fallos |
| Needle 64k / 128k / 241k | 8/8 en cada uno | no disponible |
| Throughput decodificacion con MTP 2 (1/2/4/8 peticiones) | 98,3 / 157,1 / 297,8 / 526,1 tok/s | 64,6 / 89,1 / 175,3 / 322,8 tok/s sin MTP |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM: pesos de 7,9 GB en EXL3 5,00 bpw; en 24 GB se sirve contexto completo de 262.144 tokens a 2 sesiones con 329 MiB libres en el pico; en 16 GB, una sesion de hasta 241.664 tokens sin MTP (pool KV de 333.985 tokens, 375 MiB libres).
- GPU probadas: RTX PRO 6000 Blackwell limitada por software a 24 GB y A40 limitada a 16 GB; el autor declara compatibilidad con RTX 3090, RTX 4090 y otras Ampere de 24 GB.
- Cabe en GPU de consumo: si, en RTX 3090 y RTX 4090 de 24 GB; en 16 GB con contexto reducido.
- Despliegue: exclusivamente vLLM 0.34.0 mas exllamav3 1.6.7 mas `vllm-quantpack` 0.1.10 o superior. No funciona con `pip install vllm` estandar, Transformers ni SGLang.
- Cache KV: `k8v4_per_token_head` (claves int8, valores int4); requiere `--max-model-len 262144` y, en 16 GB, `--kv-cache-memory-bytes 7614968627`.
- Latencia y throughput: 98,3 tok/s con una peticion y 526,1 tok/s con ocho, con MTP 2; sin MTP, 64,6 y 322,8 tok/s respectivamente.
- Nota de memoria: el autor reserva 460 MiB para el driver de una tarjeta real al calcular capacidades.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-EXL3 (esta ficha) | 3,95B en safetensors (9B nominales) | 262.144 | EXL3 5,00 bpw | Apache-2.0 | Vision, MTP, tool calling; requiere stack vLLM + exllamav3 + plugin |
| sensenova/SenseNova-Loop-9B (BF16) | 9B | 262.144 | safetensors BF16 | Apache-2.0 | Modelo base; 23/30 en tareas de agente; necesita mas VRAM |
| Otras cuantizaciones del mismo modelo (ramas del repo) | 9B | 262.144 | EXL3, distintas anchuras de bits | Apache-2.0 | Publicadas "as is" por el mismo autor, sin la misma bateria de pruebas |

No se dispone de datos de benchmarks comparativos con modelos de otras familias en la informacion proporcionada.

## Limitaciones y advertencias

- No es un release oficial de SenseNova: es una cuantizacion comunitaria; los resultados pueden no reproducirse en otros dominios o idiomas distintos del caso evaluado (administracion de sistemas en castellano).
- Fuga de idioma: el modelo base, incluido BF16, intercala palabras en chino en respuestas en castellano; se mitiga con `top_k` 20 (reduccion de 4 a 6 veces), no se elimina.
- Dependencia fragil de software: solo funciona con la combinacion exacta vLLM 0.34.0, exllamav3 1.6.7 y `vllm-quantpack` >= 0.1.10; otras versiones o frameworks no cargan el checkpoint.
- Perdida de calidad medible: divergencia KL de 0,005-0,006 frente a BF16 y ligero descenso en tareas de agente (21/30 frente a 23/30).
- Bucles de generacion: 1/30 a temperatura 0,6 y 2/30 a 0,8; a temperatura 1,0 no se observaron, pero el riesgo no es nulo.
- En 16 GB no cabe una sesion de 262.144 tokens: el prefill excede la memoria disponible aunque el pool KV la soporte; el limite practico es 241.664 tokens sin MTP y 195.584 con MTP 2.
- Idiomas limitados a es y en; sin datos sobre otros idiomas.
- Riesgo de alucinacion inherente a modelos de 9B, no cuantificado en la informacion disponible; en tareas de administracion de sistemas conviene validar comandos antes de ejecutarlos.
- Solo se han probado los dos entornos descritos por el autor; no hay garantia en otras GPU, drivers o versiones de CUDA.
- Licencia Apache-2.0 permite uso comercial, pero al derivar de un modelo base no oficial conviene revisar `LICENSE` y `NOTICE` del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/JRamirez-UAB/SenseNova-Loop-9B-EXL3
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Paper asociado: https://arxiv.org/abs/2406.11235
- Repositorio del plugin de carga: no disponible (referenciado como `vllm-quantpack` 0.1.10 en PyPI)
- ExLlamaV3: no disponible en la informacion proporcionada
- vLLM: no disponible en la informacion proporcionada

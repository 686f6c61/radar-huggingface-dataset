# MrCookieJos/prism-horizon-v1

## Resumen

PRISM Horizon v1 es un adaptador LoRA sobre Qwen3-Coder-Next, un modelo de mezcla de expertos (MoE) de aproximadamente 80.000 millones de parametros totales y unos 3.000 millones activos por token. Lo desarrolla PRISM.IOS y su propuesta diferencial no es una arquitectura nueva, sino un pipeline de entrenamiento y de inferencia orientado a la autocorreccion: el modelo razona, relee y reescribe su propio analisis ("circular thinking"), genera codigo, lo ejecuta en un sandbox contra los tests de ejemplo del problema y corrige los fallos antes de entregar la respuesta final.

El entrenamiento sigue un esquema de autodestilizacion verificada por sandbox: el modelo resuelve problemas de practica, solo se conservan las respuestas que el sandbox demuestra correctas y se reentrena sobre ellas durante tres rondas, cada una aceptada unicamente si supera a la anterior en un conjunto de validacion reservado. El adaptador tiene 34,3 millones de parametros entrenables con rango 32 y alpha 64 sobre capas de atencion y proyecciones del MoE.

Es relevante porque demuestra que un ajuste fino pequeno y bien dirigido, combinado con un bucle de verificacion en tiempo de inferencia, puede acercar a un modelo abierto de 80B a modelos frontera cerrados en generacion de codigo competitivo (LiveCodeBench v6), y porque publica tanto los pesos en formato PEFT como una cuantizacion GGUF de 4 bits que cabe en un equipo de consumo con 8 GB de VRAM y 64 GB de RAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre transformer, con adaptador LoRA (PEFT) |
| Parametros totales | 79.674.391.296 (~80B) |
| Parametros activos | ~3B por token (512 expertos) |
| Longitud de contexto | 12.288 tokens en pruebas con vLLM; 16.384 en llama.cpp (valor usado en tests, no limite maximo declarado) |
| Tipos de cuantizacion | GGUF 4 bits (Q4_K_M); pesos LoRA en safetensors sin cuantizar |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (adaptador LoRA PEFT) y GGUF (4 bits) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-Coder-Next, un transformer con mezcla de expertos de 512 expertos y aproximadamente 80.000 millones de parametros totales, de los que unos 3.000 millones se activan por token. Sobre el se aplica un adaptador LoRA de 34,3 millones de parametros con rango 32 y alpha 64, dirigido a las capas `in_proj_ba`, `in_proj_qkvz`, `k_proj`, `o_proj`, `out_proj`, `q_proj` y `v_proj`. El repositorio incluye dos versiones del adaptador: `prism-self/adapter` (la mejor) y `prism-rft/adapter` (una iteracion anterior).

El entrenamiento es autodestilizacion verificada por sandbox en tres rondas. El modelo responde problemas de practica, un sandbox ejecuta las soluciones y solo se conservan las que pasan; el modelo se reentrena sobre ese subconjunto con tasa de aprendizaje 1e-4 con decaimiento coseno, batch de 16 y perdida calculada unicamente sobre los tokens de respuesta. Cada ronda se acepta solo si mejora a la anterior en problemas de validacion no vistos. La innovacion destacable no esta en la arquitectura sino en el bucle de inferencia: el agente escribe un analisis, lo relee dos veces contrastandolo con los ejemplos y lo reescribe antes de programar, y despues ejecuta el programa en sandbox y lo corrige hasta dos veces usando solo los tests de ejemplo del enunciado (los tests ocultos nunca se muestran).

## Capacidades

- Generacion de codigo en lenguajes de programacion convencionales, orientada a problemas de programacion competitiva y algoritmia.
- Razonamiento multi-paso con modo "circular thinking": hasta tres pasadas de hasta 3.000 tokens cada una releyendo y corrigiendo el propio analisis.
- Ejecucion y verificacion en sandbox con hasta dos correcciones automaticas por problema.
- Generacion de texto conversacional y resumen de analisis tecnico.
- Soporte de tool calling y function calling heredado del modelo base (no validado de forma especifica en la informacion disponible).
- Capacidades de agente multi-paso mediante el script `code/prism_agent.py`, que orquesta pensamiento, generacion y ejecucion.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- No se documentan capacidades de vision ni de audio.

## Casos de uso

- Generacion de codigo en produccion con verificacion previa: el modelo puede integrarse en un pipeline que compile y ejecute el codigo generado contra tests unitarios existentes antes de abrir un pull request, reduciendo el coste de revision manual.
- Resolucion de problemas algoritmicos y entrevistas tecnicas: el bucle de pensamiento circular y las correcciones en sandbox estan disenados especificamente para enunciados con ejemplos de entrada/salida, un formato habitual en plataformas de evaluacion.
- Asistente de refactorizacion con pruebas: dado un modulo y su suite de tests, el modelo propone cambios, los ejecuta y descarta las variantes que rompen la suite.
- Automatizacion de tareas de CI/CD: uso como paso de generacion de parches o de tests adicionales, con ejecucion en un contenedor aislado que actua como sandbox.
- Migracion de codigo entre lenguajes o versiones de API: el modelo puede generar la traduccion, ejecutar los tests de ejemplo y corregir discrepancias de comportamiento.
- Ensenanza y tutoria de programacion: el modo de pensamiento circular expone el razonamiento intermedio, util para explicar por que una solucion falla y como se corrige.
- Despliegue en estaciones de trabajo modestas: la cuantizacion GGUF Q4_K_M permite ejecutar el modelo en local con una GPU de 8 GB y 64 GB de RAM del sistema, adecuado para entornos sin acceso a GPU de datacenter.

## Benchmarks y rendimiento

Resultados declarados por el autor en LiveCodeBench v6 (1.055 problemas de generacion de codigo, release_v6, decodificacion greedy, una respuesta por problema, scorer oficial):

| Modelo | LiveCodeBench v6 pass@1 |
|---|---|
| Claude Fable 5.1 | 90,5 |
| DeepSeek V4 Pro | 87,5 |
| GPT OSS 120B | 83,2 |
| Claude Sonnet 5 | 82,4 |
| Gemini 2.5 Pro Preview | 79,2 |
| PRISM Horizon v1, pensamiento circular + correcciones en sandbox | 78,6 |
| Qwen 3 Max | 78,2 |
| PRISM Horizon v1, pensamiento circular, un solo intento | 75,7 |
| PRISM Horizon v1, sin pensamiento, con correcciones en sandbox | 72,3 |
| DeepSeek R1 | 70,2 |
| Qwen3-Coder-Next (base, ejecucion propia del autor) | 65,1 |

Desglose por dificultad de PRISM Horizon v1 con pensamiento circular (un solo intento / con correcciones en sandbox): facil 98,8 / 99,1; medio 83,3 / 85,9; dificil 46,3 / 51,7. En los 341 problemas mas recientes, el pensamiento circular por si solo eleva el resultado del 54,0 % al 65,4 %. La cuantizacion Q4_K_M sin pensamiento obtiene 49,3 % con correcciones en sandbox frente al 54,0 % del modelo completo en ese mismo subconjunto.

Advertencia metodologica: las puntuaciones de modelos frontera provienen del leaderboard de vals.ai con su propio harness y configuracion por modelo, y el uso de correcciones en sandbox no es comparable con la mayoria de entradas del leaderboard; la cifra de un solo intento es la comparacion mas justa.

## Requisitos de hardware

- VRAM para inferencia en 4 bits (GGUF Q4_K_M): aproximadamente 3,6 GB de memoria de GPU en las pruebas del autor, con los expertos residentes en RAM del sistema; el fichero completo ocupa 46 GB.
- Configuracion minima documentada: GPU de 8 GB de VRAM mas 64 GB de RAM del sistema, con `llama-server -ngl 999 --n-cpu-moe 999 -c 16384 --jinja`.
- VRAM para pesos completos en BF16: el repositorio ocupa 91,4 GB, por lo que se requiere al menos una GPU de 80 GB (A100 80GB, H100 80GB) o varias GPUs en paralelo.
- GPU recomendadas: A100 80GB o H100 para el modelo sin cuantizar; RTX 4090 (24 GB) no es suficiente para los pesos completos pero si para el adaptador con el base servido aparte; GPUs de consumo de 8 GB o mas para la variante GGUF.
- Opciones de despliegue: vLLM con `--enable-lora --max-lora-rank 32` para servir el adaptador sobre Qwen3-Coder-Next; llama.cpp / `llama-server` para el GGUF; el agente se ejecuta con `code/prism_agent.py`.
- Latencia y throughput: no disponibles. El coste de inferencia es notablemente superior al de una pasada simple, ya que el modo completo implica hasta tres pasadas de pensamiento de hasta 3.000 tokens y hasta dos ciclos de correccion en sandbox.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | LiveCodeBench v6 pass@1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PRISM Horizon v1 | ~80B totales, ~3B activos (MoE) + LoRA de 34,3M | 12.288 (vLLM) / 16.384 (llama.cpp) en pruebas | 78,6 con pensamiento circular y sandbox; 75,7 a un intento | Apache 2.0 | Pesos PEFT y GGUF en HuggingFace |
| Qwen3-Coder-Next (base) | ~80B totales, ~3B activos (MoE) | No disponible | 65,1 (ejecucion del autor) | Apache 2.0 | HuggingFace |
| DeepSeek R1 | No disponible | No disponible | 70,2 | No disponible | Pesos abiertos |
| GPT OSS 120B | 120B | No disponible | 83,2 | No disponible | Pesos abiertos |

La comparacion con modelos frontera cerrados (Claude Fable 5.1, Claude Sonnet 5, Gemini 2.5 Pro Preview) figura en la tabla de benchmarks, pero sus condiciones de evaluacion no son equivalentes y no se dispone de datos de parametros ni licencia en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta especializado en generacion de codigo y razonamiento algoritmico; su rendimiento en tareas generales de texto no se ha evaluado en la informacion disponible.
- El resultado de 78,6 % depende de un bucle externo (pensamiento circular mas ejecucion en sandbox); sin ese andamiaje el modelo baja a 72,3 % o menos, y el coste en tokens y latencia es varias veces superior a una generacion directa.
- Las correcciones en sandbox usan unicamente los tests de ejemplo del enunciado; existe riesgo de sobreajuste a esos ejemplos que no se traduzca en los tests ocultos, y el autor no publica la tasa de fallo especifica por esta causa.
- La cuantizacion de 4 bits degrada la precision de forma medible: 49,3 % frente a 54,0 % en los 341 problemas mas recientes sin pensamiento.
- El rendimiento cae abruptamente en problemas dificiles (46,3 % a un intento, 51,7 % con correcciones), por lo que no es adecuado como sustituto de revision humana en codigo critico.
- Riesgo de alucinacion en APIs, librerias y firmas de funciones no cubiertas por los ejemplos; el sandbox solo detecta errores de ejecucion y de tests, no correccion semantica.
- Sesgos conocidos: no documentados en la informacion proporcionada. Al heredar el modelo base, arrastra los sesgos de sus datos de entrenamiento.
- Idiomas soportados no declarados; el comportamiento fuera del ingles no esta verificado.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-Coder-Next y de los datos de entrenamiento del adaptador.
- El repositorio tiene un volumen de descargas muy bajo (71) y cero likes, por lo que no existe validacion independiente de los resultados declarados.
- Las fechas de creacion y actualizacion del repositorio (octubre de 2026) y las referencias a modelos como Claude Fable 5.1 o DeepSeek V4 Pro deben tratarse con cautela; no se ha podido contrastar su existencia en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MrCookieJos/prism-horizon-v1
- Modelo base Qwen3-Coder-Next: https://huggingface.co/Qwen/Qwen3-Coder-Next
- Leaderboard de LiveCodeBench en vals.ai: https://www.vals.ai/benchmarks/lcb

# mchen04/LFM3-1.7B-Heretic-Abliterated-MLX-bf16

## Resumen

LFM3-1.7B Heretic Abliterated MLX bf16 es un port a MLX del modelo Vortecks/LFM3-1.7B-Heretic-Abliterated, una version del LFM3-1.7B de LiquidAI a la que se le ha eliminado el comportamiento de rechazo (abliteration) mediante la herramienta Heretic. El modelo base es un transformer hibrido de 1.730 millones de parametros (1,73B) con 24 capas que combina convoluciones cortas con compuerta, atencion de ventana deslizante y atencion global. El port mantiene los pesos bfloat16 originales sin cuantizacion ni poda, y anade el codigo necesario (`lfm3.py`) para que mlx-lm pueda ejecutar la arquitectura en Apple Silicon.

La relevancia de esta ficha radica en dos factores. Primero, ofrece una ventana de contexto de 262.144 tokens en un modelo de menos de 2B de parametros, algo poco habitual en esa escala. Segundo, el proceso de abliteration elimina los rechazos del modelo original (3/100 rechazos frente a 92/100 del modelo base segun el autor), lo que lo hace adecuado para investigacion y aplicaciones que implementen su propia capa de moderacion, pero inadecuado para despliegues directos sin control de seguridad.

El modelo esta pensado para ejecucion local en Apple Silicon, con un consumo de memoria de 3,6 GB en prompts cortos y 4,5 GB con prompts de 16K tokens, y una velocidad de generacion de aproximadamente 29 tokens por segundo en un Mac mini con M4. Soporta 16 idiomas, tool calling y un bloque de razonamiento (thinking), lo que lo situa como una opcion ligera para prototipado y experimentacion en el ecosistema MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Lfm3ForCausalLM` hibrida: 24 capas (13 convoluciones cortas con compuerta, 5 de atencion de ventana deslizante, 6 de atencion global) |
| Parametros totales | 1.728.801.536 (~1,73B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | no disponible en este repo (pesos bfloat16 sin cuantizar; el autor indica que una build cuantizada seria mas rapida) |
| Idiomas soportados | 16: en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | LFM Open License v1.0 (identificador `lfm1.0`, campo `license: other`) |
| Formato de pesos | safetensors (bfloat16), con codigo custom `lfm3.py`; tamano del repo 3,5 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer hibrido denominado `Lfm3ForCausalLM`, con 24 capas distribuidas en tres tipos: 13 capas de convolucion corta con compuerta (gated short convolutions), 5 capas de atencion de ventana deslizante de 256 tokens y 6 capas de atencion global. Esta combinacion reduce el coste computacional del mecanismo de atencion en la mayor parte de la red y explica que la velocidad de generacion se mantenga practicamente plana al crecer el prompt (de 29,1 tok/s con 128 tokens a 27,5 tok/s con 16.384 tokens). El modelo base es LiquidAI/LFM3-1.7B, desarrollado por Liquid AI.

Sobre el entrenamiento del modelo base no se proporciona informacion en la documentacion disponible (numero de tokens, composicion del dataset, uso de RLHF o DPO): no disponible. Lo que si se documenta es el proceso de abliteration aplicado por Vortecks con la herramienta Heretic, que elimina la direccion de rechazo en el espacio de activaciones. El autor reporta una divergencia KL de 0,0094 respecto al modelo base, lo que indica un cambio pequeno en la distribucion de salidas, aunque reconoce que la abliteration puede degradar algunas capacidades. El port a MLX no introduce entrenamiento, poda ni cuantizacion: los 286 tensores son identicos bit a bit a los del modelo fuente.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat que incluye bloque de pensamiento (thinking).
- Tool calling y function calling: la plantilla de chat acepta el parametro `tools=[...]` en `apply_chat_template`.
- Razonamiento multi-paso y uso como agente, segun los casos de uso declarados por el autor (chat, tool use, agents, coding).
- Generacion de codigo y matematicas/STEM, con ajustes de muestreo recomendados distintos para cada caso.
- Capacidades multilingues en 16 idiomas, incluidos espanol, arabe, chino, frances, aleman, italiano, japones, coreano, portugues, vietnamita, tailandes, indonesio, hindi, ruso y polaco.
- Contexto largo de hasta 262.144 tokens, adecuado para documentos extensos y conversaciones prolongadas.
- Salida estructurada (JSON), aunque con reservas: el propio autor advierte fallos de parseo estricto en las pruebas.
- Sin filtrado de seguridad propio: el modelo no aplica rechazos, lo que es una capacidad tecnica pero tambien un riesgo.

## Casos de uso

- Chat local en Apple Silicon: el modelo se ejecuta con mlx-lm en un Mac con 24 GB de memoria unificada, con 3,6 GB de pico en prompts cortos y tiempos de primera respuesta de 0,1 s en proceso caliente, lo que permite asistentes personales sin conexion.
- Procesamiento de documentos largos: con 262.144 tokens de contexto se pueden analizar contratos, informes o bases de codigo completas en una sola pasada, manteniendo velocidad de generacion casi constante gracias a las capas convolucionales.
- Agentes con tool calling: la plantilla de chat soporta definicion de herramientas, lo que permite construir agentes que consulten APIs, ejecuten busquedas o interactuen con sistemas externos en flujos multi-paso.
- Generacion de codigo en prototipado: el modelo esta orientado a coding y admite ajustes de muestreo especificos (`temperature=0.1, top_k=50, repetition_penalty=1.1`) para integrarse en asistentes de desarrollo o scripts de automatizacion.
- Investigacion sobre alineacion y seguridad: al tener los rechazos eliminados y una divergencia KL medida de 0,0094 respecto al base, sirve para estudiar el efecto de la abliteration en las capacidades y en la distribucion de salidas.
- Experimentacion con arquitecturas hibridas: al incluir el codigo `lfm3.py`, es util para probar y comparar el rendimiento de convoluciones con compuerta frente a atencion pura en tareas de contexto largo.
- Aplicaciones multilingues de bajo coste: con 16 idiomas y menos de 2B de parametros, puede desplegarse en entornos con recursos limitados para traduccion, resumen o atencion al cliente, siempre con moderacion externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor indica explicitamente que el port no evaluo tasas de rechazo ni puntuaciones de benchmarks, solo la equivalencia con el modelo fuente.

Si se documentan mediciones de velocidad y memoria en un Mac mini (Apple M4, 24 GB, macOS 26.2) con mlx 0.32.4 y mlx-lm 0.32.2, batch size 1, 128 tokens generados, media de 5 ejecuciones:

| Tokens de prompt | Procesamiento de prompt (tok/s) | Generacion (tok/s) | Memoria pico (GB) |
|---:|---:|---:|---:|
| 128 | 573 | 29,1 | 3,65 |
| 512 | 932 | 29,0 | 3,96 |
| 4.096 | 1.062 | 28,6 | 4,46 |
| 16.384 | 984 | 27,5 | 4,55 |

Arranque en la misma maquina con un prompt de chat de 21 tokens:

| Caso | Import de Python | Carga de pesos | Tiempo al primer token | Generacion (tok/s) |
|---|---:|---:|---:|---:|
| Frio: proceso nuevo, pesos no en cache | 2,5 s | 1,5 s | 0,29 s | 29,0 |
| Proceso nuevo, pesos en cache | 0,5 s | 0,5 s | 0,14 s | 28,9 |
| Caliente: peticiones posteriores | — | — | 0,11 s | 29,0 |

## Requisitos de hardware

- VRAM/memoria: 3,6 GB de pico con prompts cortos y 4,5 GB con prompts de 16K tokens en bfloat16 sin cuantizar; el repo ocupa 3,5 GB en disco.
- GPU recomendadas: el modelo esta portado especificamente para Apple Silicon (MLX); se ha medido en un Mac mini con M4 y 24 GB de memoria unificada.
- GPU consumer: cabe en equipos Apple Silicon con al menos 8 GB de memoria unificada, aunque el autor no documenta pruebas en configuraciones menores de 24 GB.
- Despliegue: mlx-lm 0.32.2 o superior con `trust_remote_code=True`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este repositorio.
- Latencia y throughput: aproximadamente 29 tok/s de generacion y 0,1 s al primer token en proceso caliente; 4,3 s de arranque en frio hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B Heretic Abliterated MLX bf16 (este) | ~1,73B | 262.144 | LFM Open License v1.0 | MLX, safetensors, codigo custom | Sin rechazos; optimizado para Apple Silicon |
| LiquidAI/LFM3-1.7B | ~1,73B | 262.144 | LFM Open License v1.0 | Transformers y otros | Modelo base con filtrado de seguridad; 92/100 rechazos segun Vortecks |
| Vortecks/LFM3-1.7B-Heretic-Abliterated | ~1,73B | 262.144 | LFM Open License v1.0 | Transformers | Version abliterated de la que deriva este port; 3/100 rechazos |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de calidad con alternativas de la misma categoria. La comparacion disponible se limita a parametros, contexto, licencia y comportamiento de rechazo.

## Limitaciones y advertencias

- Ausencia de rechazos: el modelo produce contenido danino, falso u ofensivo si se le solicita; el autor reporta 3/100 rechazos frente a 92/100 del modelo base. El despliegue requiere moderacion y cumplimiento de politicas por parte del integrador.
- La abliteration altera el modelo: divergencia KL de 0,0094 respecto al base, pequena pero con posible degradacion de algunas capacidades; el port no midio tasas de rechazo ni benchmarks.
- Fallos en JSON estricto: en las dos pruebas de JSON del conjunto de test el modelo fuente falla el parseo estricto en todas las ejecuciones (claves sin comillas y texto tras el array); el port reproduce ese comportamiento. Es obligatorio validar la salida estructurada.
- Empates en bfloat16: la decodificacion greedy en bfloat16 puede encontrar empates exactos de logits, de modo que implementaciones igualmente validas eligen tokens distintos y la salida puede diferir de transformers tras un empate.
- Codigo custom: la carga ejecuta `lfm3.py` del repositorio; el autor recomienda revisarlo antes de ejecutarlo y usar `trust_remote_code=True` de forma consciente.
- Licencia: LFM Open License v1.0 (campo `license: other`); es necesario revisar el archivo LICENSE para conocer las restricciones de uso comercial y los usos prohibidos por ley.
- Alcance: el autor declara fuera de alcance cualquier uso sin capa de seguridad propia cuando las salidas llegan a otras personas.
- Idiomas: aunque se declaran 16 idiomas, no se documenta el rendimiento por idioma ni la calidad relativa en cada uno.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mchen04/LFM3-1.7B-Heretic-Abliterated-MLX-bf16
- Modelo base del port: https://huggingface.co/Vortecks/LFM3-1.7B-Heretic-Abliterated
- Modelo original de LiquidAI: https://huggingface.co/LiquidAI/LFM3-1.7B
- Herramienta Heretic: https://github.com/p-e-w/heretic
- mlx-lm: https://github.com/ml-explore/mlx-lm
- Paper de referencia (arXiv:2406.11717): https://arxiv.org/abs/2406.11717
- Licencia LFM Open License v1.0: archivo LICENSE del repositorio

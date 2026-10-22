# phequals/lfm25-1.2b-muesli-cleanup-v12-mlx-4bit

## Resumen

lfm25-1.2b-muesli-cleanup-v12-mlx-4bit es un ajuste fino especializado del modelo instruct LiquidAI/LFM2.5-1.2B-Instruct, publicado por el usuario phequals para dar soporte a Muesli, una aplicación de dictado para macOS. No es un modelo de propósito general ni un sistema de reconocimiento de voz: su única tarea es la limpieza de transcripciones (transcript cleanup), es decir, recibir la salida cruda de un motor de speech-to-text y devolver el mismo texto corregido —arreglando errores evidentes de reconocimiento, eliminando muletillas, aplicando autocorrecciones del tipo "no, espera" o "olvida eso", formateando listas dictadas y ajustando la puntuación al estilo de la aplicación de destino.

El modelo tiene 1.170.340.608 parámetros y se distribuye en formato MLX cuantizado a 4 bits (group size 64), con un peso de 0,63 GB en safetensors y un repositorio de 0,7 GB. Está pensado para inferencia en local sobre Apple Silicon mediante mlx-lm, con una latencia medida de 0,26 s de mediana (p90 0,41 s) en un Apple M5 para prompts de unas 550 tokens. Es relevante porque ejemplifica un patrón muy concreto de 2026: modelos pequeños, cuantizados y afinados para una única tarea de post-procesado, que sustituyen a llamadas a API en aplicaciones de escritorio sensibles a la latencia y a la privacidad.

La licencia es LFM Open License v1.0, que permite uso comercial gratuito solo a organizaciones con ingresos anuales inferiores a 10 millones de dólares. El modelo es únicamente en inglés y su conjunto de evaluación está generado por modelos abiertos, no por dictados reales de usuarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada en la model card; hereda la del modelo base LiquidAI/LFM2.5-1.2B-Instruct (etiqueta de familia `lfm2`) |
| Parametros totales | 1.170.340.608 |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible en la informacion proporcionada; la generacion se limita a 1.024 tokens nuevos |
| Tipos de cuantizacion | MLX 4 bits, group size 64 (unico formato publicado) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | LFM Open License v1.0 (`lfm1.0`); uso comercial gratuito solo para organizaciones con ingresos anuales < 10 M USD |
| Formato de pesos | Safetensors para MLX (`mlx-lm`), 0,63 GB |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna; el repositorio se limita a indicar que es una version modificada de LiquidAI/LFM2.5-1.2B-Instruct, con la etiqueta de familia `lfm2` y la libreria `mlx`. La familia LFM2 de Liquid AI se presenta publicamente como un diseno hibrido que combina convoluciones de corto alcance con atencion, orientado a eficiencia en dispositivo; esta ficha no puede confirmar la configuracion concreta de capas, cabezas ni atencion del modelo base porque ese dato no aparece en la informacion proporcionada.

El ajuste se hizo con LoRA de rango 16 mediante Unsloth, una sola epoca, calculando la perdida unicamente sobre la respuesta y fusionando despues los adaptadores en los pesos base. El conjunto de datos `blend-v12` contiene 155.081 pares de limpieza que cubren correo electronico, chat, documentos, prompts para agentes de IA, codigo, hojas de calculo y presentaciones, cajas de busqueda y dictados largos; aproximadamente el 20 % de las filas incluyen contexto de pantalla. Los pares fueron generados por modelos abiertos alojados en Fireworks y filtrados por un modelo juez, no por anotadores humanos.

No se aplico RLHF ni DPO segun la informacion disponible. El aspecto mas delicado del diseno es el contrato de inferencia: un unico turno de usuario, sin mensaje de sistema, decodificacion voraz (temperatura 0, `top_k=1`, sin penalizacion por repeticion), parada en `<|im_end|>` y una plantilla de prompt que debe reproducirse literalmente, concatenando un `SYSTEM_PROMPT` fijo, un bloque `<APP-CONTEXT>` opcional recortado a 1.200 caracteres y la transcripcion cruda sin etiquetas.

## Capacidades

- Limpieza de transcripciones de speech-to-text: corrige errores de reconocimiento evidentes y devuelve el texto intacto cuando ya es correcto.
- Eliminacion de muletillas y ruido conversacional ("um", "uh", "like") y aplicacion de autocorrecciones dictadas ("scratch that").
- Formateo de listas numeradas o con vinetas cuando el usuario las dicta explicitamente.
- Adaptacion de la puntuacion y el estilo al contexto de la aplicacion de destino.
- Uso de contexto de pantalla opcional (aplicacion enfocada, campo de documento, URL, texto seleccionado, OCR) solo para resolver nombres, acronimos y errores de transcripcion, nunca para copiar contenido al resultado.
- Generacion de texto conversacional basica heredada del modelo instruct base, sujeta a la plantilla estricta de un solo turno.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, vision ni audio de forma documentada; el tag `speech-to-text` describe la tarea, no una capacidad de reconocimiento de voz.
- Multilingue: no. Solo ingles.

## Casos de uso

- Limpieza de dictado en escritorio: Muesli envia la transcripcion cruda del motor ASR junto con el contexto de la aplicacion enfocada y pega la salida limpia en el campo activo. El modelo esta afinado exactamente para este bucle, con 0,26 s de mediana por peticion en un M5.
- Correo y mensajeria: al dictar un email o un mensaje de chat, el modelo elimina muletillas y aplica autocorrecciones sin reformular, de modo que el texto final conserva el registro oral del hablante.
- Dictado de listas de tareas: convierte una enumeracion hablada en una lista numerada o con vinetas solo cuando el usuario la dicta como tal, util en aplicaciones de notas.
- Escritura en editores de codigo o prompts: el conjunto de entrenamiento incluye prompts para agentes de IA y codigo, por lo que puede limpiar dictados tecnicos donde los acronimos y nombres de API son propensos a errores de reconocimiento.
- Hojas de calculo y presentaciones: el dataset cubre estos dominios; el modelo puede formatear celdas o vinetas dictadas manteniendo la terminologia del campo enfocado.
- Busquedas y barras de direccion: dictados cortos en cajas de busqueda donde el objetivo es minimizar cambios y evitar que el modelo anada palabras que rompan la consulta.
- Preprocesado en pipelines de subtitulado o notas de reunion: como etapa de post-proceso determinista sobre la salida de un ASR en ingles, con la salvaguarda de pegar el texto crudo si la salida es vacia o supera 3 veces la longitud de entrada.

## Benchmarks y rendimiento

Tasa de error de palabra (WER, %) frente a la limpieza de referencia, una peticion a la vez. Menor es mejor.

| Build | Screen-context held-out (400) | Plain dictation (512) | New categories A (309) | New categories B (284) |
|---|---|---|---|---|
| MLX 4-bit (este modelo) | 9,51 | 1,56 | 2,98 | 3,98 |
| Limpieza previa de Muesli con Qwen3.5-0.8B (referencia) | 37,52 | 2,26 | no disponible | no disponible |

Los conjuntos de prueba estan separados del entrenamiento, pero las filas fueron escritas por modelos abiertos (DeepSeek/GLM para el conjunto A, ember-1 para el B) y filtradas por un modelo juez. No son dictados reales de usuarios y no se ha ejecutado una prueba ciega sobre dictado real. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, y no tendrian sentido para una tarea de limpieza de transcripciones.

Rendimiento en Apple M5, ~550 tokens de prompt y ~17 tokens de salida (mediana de 60 prompts), con mlx-lm 0.32.2: mediana 0,26 s, p90 0,41 s, prefill 4.252 tok/s, decodificacion 150 tok/s.

## Requisitos de hardware

- VRAM/unified memory estimada: los pesos ocupan 0,63 GB; con overhead de runtime y cache KV para prompts de ~550 tokens, el consumo realista ronda 1-1,5 GB. Cabe holgadamente en cualquier Mac con 8 GB de memoria unificada.
- GPU recomendadas: Apple Silicon (M1 en adelante) es el objetivo; las cifras publicadas corresponden a un M5. No hay soporte CUDA en este repositorio, ya que el formato es MLX.
- Cabe en GPU de consumo: si, en cualquier SoC de Apple; en el mundo NVIDIA/AMD habria que convertir los pesos a otro formato, algo que el autor no ofrece.
- Opciones de despliegue: `mlx-lm` 0.32.2 o superior en macOS. No se publican pesos GGUF, por lo que llama.cpp, Ollama o LM Studio no pueden consumir este repositorio tal cual; vLLM y TGI no soportan el formato MLX.
- Latencia y throughput: mediana de 0,26 s y p90 de 0,41 s por peticion en M5; 4.252 tok/s de prefill y 150 tok/s de decodificacion. El modelo es de un solo uso por dictado, por lo que el throughput agregado depende de como se serialicen las peticiones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| lfm25-1.2b-muesli-cleanup-v12-mlx-4bit | 1,17 B | no disponible (1.024 tokens nuevos max.) | Limpieza de transcripciones en | LFM Open License v1.0 (limite de 10 M USD de ingresos) | MLX 4 bits, 0,63 GB |
| LiquidAI/LFM2.5-1.2B-Instruct | ~1,2 B | no disponible en la informacion proporcionada | Instruct general | LFM Open License v1.0 | Peso completo, safetensors |
| Limpieza previa de Muesli (Qwen3.5-0.8B) | ~0,8 B segun nomenclatura | no disponible | Limpieza de transcripciones en | no disponible en la informacion proporcionada | no disponible |

La comparacion cuantitativa solo existe frente a la limpieza previa basada en Qwen3.5-0.8B: el modelo de esta ficha baja el WER de 37,52 a 9,51 en el conjunto con contexto de pantalla y de 2,26 a 1,56 en dictado plano. Frente al modelo base no hay comparacion publicada: el base es un instruct general, no un limpiador, y no se han medido sus resultados en esta tarea.

## Limitaciones y advertencias

- Solo ingles. Cualquier dictado en castellano u otro idioma queda fuera del alcance declarado.
- No es un reconocedor de voz: necesita un motor ASR previo. El tag `speech-to-text` puede inducir a error.
- La plantilla de prompt debe coincidir exactamente con el entrenamiento (un turno de usuario, sin mensaje de sistema, decodificacion voraz, parada en `<|im_end|>`). Usar un motor de plantillas de chat puede degradar la calidad.
- El contexto de aplicacion debe llevar el nombre del campo enfocado, no su contenido; las aplicaciones que envien el contenido en "Document context" pueden obtener resultados peores, segun el propio autor.
- Salvaguarda recomendada en la app: si la salida esta vacia o supera 3 veces la longitud de la entrada, pegar la transcripcion cruda.
- Riesgo de alucinacion y de reescritura: el modelo puede parafrasear en lugar de limitarse a corregir, algo que el prompt de sistema prohibe explicitamente pero no garantiza. Tambien puede introducir contenido del bloque de contexto si no respeta la instruccion de no copiarlo.
- Evaluacion debil: los conjuntos de prueba estan generados por modelos abiertos y filtrados por un juez automatico, sin dictado real ni prueba ciega. Los 9,51 de WER con contexto no deben extrapolarse sin validacion propia.
- Licencia: uso comercial gratuito solo por debajo de 10 M USD de ingresos anuales; por encima se requiere licencia de Liquid AI. Es una obra derivada, con las obligaciones que impone la LFM Open License v1.0.
- Formato unico MLX: no hay GGUF ni safetensors para transformers, lo que limita el despliegue a macOS/Apple Silicon.
- Sesgos: no documentados en la informacion proporcionada. Al entrenarse con pares generados por modelos abiertos, puede heredar sus estilos de puntuacion y sus sesgos de redaccion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion de la comunidad ni mantenimiento demostrado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/phequals/lfm25-1.2b-muesli-cleanup-v12-mlx-4bit
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Licencia LFM Open License v1.0: LICENSE dentro del repositorio del modelo
- Repositorio de mlx-lm: no incluido en la informacion proporcionada
- Paper, blog o demo del autor: no disponible
- La busqueda web realizada no devolvio resultados relevantes para este modelo (unicamente paginas de contenido para adultos sin relacion), por lo que no se enlazan.

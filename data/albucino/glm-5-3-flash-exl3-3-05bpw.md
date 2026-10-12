# albucino/GLM-5.3-Flash-EXL3-3.05bpw

## Resumen

GLM-5.3-Flash-EXL3-3.05bpw es un paquete de despliegue publicado por el usuario albucino en HuggingFace que combina los pesos del modelo GLM-5.3-Flash de Z.AI (zai-org/GLM-5.3-Flash) cuantizados en EXL3 a 3.05 bits por peso por turboderp, junto con un runtime especifico para ejecutarlos en dos GPU RTX 3090 de 24 GB mas 128 GB de RAM de sistema. El repositorio no modifica ningun peso: los tensores son los de la revision `332ab457b709b7ba30dd9a448be5de03b80a7ac9` de turboderp/GLM-5.3-Flash-exl3, rama 3.05bpw, y lo que aporta esta ficha es el empaquetado, un bloqueo de checksums (tamano y SHA-256 de los 29 archivos upstream) y los ajustes de ejecucion.

El modelo base es un transformer de tipo mezcla de expertos (MoE) con atencion dispersa (DSA) y una ventana de contexto completa de 262.144 tokens. La relevancia practica de este paquete es que demuestra que un modelo de esa categoria puede servirse integramente en hardware de consumo: los expertos enrutados residen en memoria del host con una copia registrada por mitad de GPU, el 20% mas caliente de la cache de cada capa se fija en VRAM, y los expertos frios se reparten entre transferencia PCIe (30%) y computo directo desde la trellis EXL3 en hilos de CPU, todo dentro de un unico grafo CUDA por paso de decodificacion.

El paquete incluye ademas correcciones para uso como agente: razonamiento acotado a 4.096 tokens, reenganche del razonamiento a los ultimos cuatro turnos con llamadas a herramientas cuando el cliente lo descarta (sin esto GLM deja de "pensar" y entra en bucle), cache de prefijo y una gramatica estricta opcional para tool calling. Se distribuye con licencia MIT en la parte del modelo y de la cuantizacion, y Apache-2.0 en el runtime.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion dispersa (DSA); 11 capas DSA con indexador de atencion dispersa. Detalles completos del bloque: no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el modelo base esta etiquetado como MoE) |
| Longitud de contexto | 262.144 tokens (256K), soportada completa en la configuracion de 2x RTX 3090 + 128 GB RAM |
| Tipos de cuantizacion | EXL3 3.05 bpw (trellis de exllamav3). Otras ramas de cuantizacion de turboderp: no disponibles en la informacion proporcionada |
| Idiomas soportados | no disponible |
| Licencia | MIT (GLM-5.3-Flash de Z.AI y cuantizacion EXL3 de turboderp). El runtime es Apache-2.0 |
| Formato de pesos | EXL3 (exllamav3) en safetensors; 29 archivos upstream, con `model.safetensors.index.json` y `kpool_aux.safetensors` |

## Arquitectura y entrenamiento

La informacion disponible no detalla el proceso de entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF o DPO): esos datos no estan publicados en la model card ni en los resultados de busqueda consultados, que no contienen material relevante sobre el modelo. Lo que si se documenta a nivel arquitectonico es que GLM-5.3-Flash emplea una mezcla de expertos (MoE) con capas de atencion dispersa: en concreto, 11 capas DSA que incorporan un indexador de atencion dispersa, con 22 tensores de indice repartidos entre ellas. Ese indexador es critico para la recuperacion en contexto largo y su ausencia degrada silenciosamente el rendimiento: el modelo responde rapido pero deja de recuperar informacion lejana.

La innovacion tecnica de este paquete es de ejecucion, no de entrenamiento. El runtime (github.com/DominikBucko/glm53-flash-2x3090) situa los expertos enrutados en memoria del host, mantiene una cache LRU por capa de expertos en VRAM, reparte los expertos frios entre un 30% transferido por PCIe y un 70% calculado por un pool de hilos de CPU directamente desde la representacion trellis de EXL3, y ejecuta todo dentro de un unico grafo CUDA por paso. El prefill se hace en fragmentos de 8.192 tokens con los expertos frios preparados en las GPU por PCIe. El paquete incorpora una correccion del checkpoint: la rama 3.05 bpw de turboderp incluye los 22 tensores del indexador en `kpool_aux.safetensors` pero no los lista en `model.safetensors.index.json`, de modo que un cargador que descubre tensores a traves del indice los omite. El script `scripts/install_model.py` anade las 22 entradas y verifica el resultado contra `runtime/model/checkpoint.lock.json` sin modificar ningun archivo de pesos.

## Capacidades

- Generacion de texto con contexto largo: recuperacion verificada de tres agujas situadas a 32K, 131K y 260K tokens, devueltas como JSON exacto en ambos perfiles de ejecucion.
- Razonamiento explicito ("thinking"): el runtime lo acota a 4.096 tokens y lo reengancha a los ultimos cuatro turnos con herramientas cuando el cliente lo elimina.
- Llamada a herramientas (tool calling) con soporte de gramatica estricta opcional para forzar llamadas bien formadas.
- Uso como agente multi-turno: cache de prefijo activada por defecto; en un benchmark de 15 tareas, el 72,9% de los tokens de prompt procedieron de la cache.
- Prefill y decodificacion con offload a CPU de expertos enrutados, sin decodificacion especulativa.
- Capacidades multimodales, de audio o de codigo especializadas: no disponibles en la informacion proporcionada.
- Idiomas soportados: no disponible.

## Casos de uso

- Agentes locales con contexto largo: el runtime esta disenado para ciclos de agente con llamadas a herramientas, razonamiento acotado y cache de prefijo, de modo que los turnos de seguimiento solo prefilan tokens nuevos. Un flujo de 15 tareas reutilizo el 72,9% de los tokens desde cache, lo que reduce el coste por turno en sesiones prolongadas.
- Analisis de documentacion extensa sin trocear: con 262.144 tokens de ventana se puede introducir un repositorio de codigo, un expediente completo o un historial entero y formular preguntas sobre puntos concretos; la prueba de las tres agujas confirma la recuperacion exacta incluso a 260K.
- Extraccion estructurada de informacion: la salida validada como JSON exacto en la prueba de agujas permite usar el modelo para poblar bases de datos o ficheros de configuracion a partir de texto no estructurado.
- Automatizacion de operaciones con herramientas: gracias al tool calling con gramatica estricta, se puede conectar a APIs internas, ejecutar consultas y encadenar varios pasos sin parsear texto libre fragil.
- Asistencia de codigo en local con requisitos de privacidad: al ejecutarse integramente en dos GPU de consumo y memoria del host, el codigo y los prompts no salen de la maquina, lo que encaja en entornos con restricciones de confidencialidad.
- Laboratorio de investigacion sobre cuantizacion extrema: el paquete permite medir experimentalmente la degradacion de un modelo MoE a 3.05 bpw en tareas de contexto largo, ya que el autor no hace ninguna afirmacion sobre la brecha de calidad frente al modelo BF16.
- Prototipado de aplicaciones de chat multi-turno con memoria larga: la combinacion de ventana de 256K y cache de prefijo hace viable mantener conversaciones de muchas horas sin reenviar todo el historial a prefill completo.
- Servicio interno monousuario con API compatible con OpenAI: el runtime expone una API en 127.0.0.1:8000, adecuada para un equipo pequeno o para evaluacion, no para carga concurrente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos disponibles son mediciones de latencia y throughput del runtime, en una maquina con 2x RTX 3090 y 128 GB de RAM, una peticion simultanea, mejor de dos ejecuciones:

| Perfil (prompt + salida) | Primer token | Tokens de entrada/s | Tokens de decodificacion/s |
|---|---:|---:|---:|
| 131.072 + 2.048, perfil de prefill | 113,5 s | 1.155 | 49,4 |
| 260.096 + 2.048, perfil de prefill | 235,3 s | 1.106 | 48,2 |
| 131.072 + 2.048, perfil de agente (cache de prefijo) | 236,2 s | 555 | 49,3 |
| 8.192 + 2.048, perfil de agente | 9,5 s | 859 | 50,4 |

Las cifras de decodificacion proceden del prompt semilla repetido del benchmark; en turnos reales de agente la decodificacion promedio fue de 37,7 tokens/s. Con cache de prefijo, el prefill en frio de prompts largos es aproximadamente el doble de lento, pero los turnos posteriores solo prefijan los tokens nuevos. Prueba de recuperacion en contexto largo: tres agujas a 32K, 131K y 260K tokens recuperadas como JSON exacto en ambos perfiles.

## Requisitos de hardware

- VRAM: 2 GPU de 24 GB (2x RTX 3090) en la configuracion validada, con una copia registrada de tamano exacto por mitad de GPU para los expertos enrutados y el 20% mas caliente de la cache de cada capa fijado en VRAM sin copia en host.
- Memoria de sistema: 128 GB de RAM, donde residen los expertos enrutados.
- Descarga de pesos: aproximadamente 117 GiB, verificados por checksum.
- GPU recomendadas: RTX 3090 (validada). Otras GPU: no disponible en la informacion proporcionada.
- Caben en GPU de consumo: si, en dos RTX 3090 de 24 GB; no se documenta una configuracion de una sola GPU.
- Opciones de despliegue: runtime propio del repositorio github.com/DominikBucko/glm53-flash-2x3090, con API compatible con OpenAI en 127.0.0.1:8000, imagen Docker preconstruida y contenedor NVIDIA. Los tags del repositorio mencionan tambien exllamav3 y vLLM como ecosistemas relacionados; no se detalla soporte directo de vLLM, llama.cpp, Ollama o TGI para estos pesos EXL3 en la informacion disponible.
- Latencia y throughput: 9,5 s hasta el primer token con prompt de 8.192 tokens en perfil de agente, 113,5 s con 131.072 tokens en perfil de prefill y 235,3 s con 260.096 tokens; decodificacion entre 48,2 y 50,4 tokens/s en benchmark y 37,7 tokens/s en turnos reales de agente.
- Entorno validado: Linux, Docker con NVIDIA Container Toolkit, Threadripper PRO 5975WX y DDR4-3200 de 8 canales. La velocidad de decodificacion depende fuertemente del ancho de banda de la memoria de CPU; el prefill, del ancho de banda de PCIe.

## Comparativa con modelos similares

No se dispone de datos de parametros, contexto o rendimiento de alternativas comparables en la informacion proporcionada, por lo que la comparacion se limita a las variantes del propio modelo implicadas en el paquete:

| Modelo | Formato / cuantizacion | Contexto | Hardware objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| albucino/GLM-5.3-Flash-EXL3-3.05bpw | EXL3 3.05 bpw + runtime con offload a CPU | 262.144 tokens | 2x RTX 3090 + 128 GB RAM | MIT (runtime Apache-2.0) | HuggingFace + GitHub |
| turboderp/GLM-5.3-Flash-exl3 (rama 3.05bpw) | EXL3 3.05 bpw, sin runtime asociado | no disponible | no disponible | MIT | HuggingFace |
| zai-org/GLM-5.3-Flash | Pesos originales (presumiblemente BF16; no confirmado) | no disponible | no disponible | MIT | HuggingFace |

Comparacion con alternativas de otros desarrolladores: no disponible.

## Limitaciones y advertencias

- Validado en una unica maquina: 2x RTX 3090, Threadripper PRO 5975WX y 128 GB DDR4-3200 de 8 canales. El rendimiento puede variar de forma significativa en otro hardware.
- La decodificacion depende del ancho de banda de memoria de la CPU y el prefill del ancho de banda de PCIe; son los dos cuellos de botella principales.
- Una sola peticion simultanea: no hay soporte de concurrencia ni de decodificacion especulativa.
- La cuantizacion a 3.05 bpw implica una perdida de calidad frente al modelo BF16. El autor no cuantifica esa brecha ni ofrece garantias al respecto.
- Riesgo de bucle en uso agentico: si el cliente descarta el razonamiento, GLM deja de "pensar" y entra en repeticiones; el runtime lo mitiga reenganchando el razonamiento a los ultimos cuatro turnos con herramientas, lo que exige mantener esa logica en el cliente.
- Dependencia de una correccion manual del checkpoint: si se carga el modelo con un cargador que descubre tensores a traves de `model.safetensors.index.json` sin anadir las 22 entradas del indexador, la recuperacion en contexto largo se rompe de forma silenciosa y aparentemente rapida.
- Idiomas soportados no documentados; no se puede afirmar cobertura multilingue ni el comportamiento en castellano.
- Sesgos conocidos y tasas de alucinacion: no disponibles en la informacion proporcionada.
- Licencia MIT tanto en el modelo base como en la cuantizacion, y Apache-2.0 en el runtime. Aun asi, se recomienda revisar los terminos upstream antes de un uso comercial en produccion.
- Fecha de creacion del repositorio: 12 de octubre de 2026, con 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de un artefacto sin validacion por parte de la comunidad.
- Los resultados de busqueda web asociados a esta consulta no contienen informacion relevante sobre el modelo (versan sobre suscripciones de Office 365), de modo que no hay fuentes independientes que corroboren los datos de la model card.

## Enlaces

- HuggingFace: https://huggingface.co/albucino/GLM-5.3-Flash-EXL3-3.05bpw
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Cuantizacion de origen: https://huggingface.co/turboderp/GLM-5.3-Flash-exl3
- Rama 3.05 bpw: https://huggingface.co/turboderp/GLM-5.3-Flash-exl3/tree/3.05bpw
- Runtime: https://github.com/DominikBucko/glm53-flash-2x3090
- Informe de benchmarks: https://github.com/DominikBucko/glm53-flash-2x3090/blob/main/benchmarks/2026-10-12/README.md

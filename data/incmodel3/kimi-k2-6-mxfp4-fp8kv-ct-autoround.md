# INCModel3/Kimi-K2.6-MXFP4-FP8KV-CT-AutoRound

## Resumen

INCModel3/Kimi-K2.6-MXFP4-FP8KV-CT-AutoRound es una version cuantizada del modelo base moonshotai/Kimi-K2.6, publicada por el usuario INCModel3. Se trata de una conversion a MXFP4 (formato de punto flotante de 4 bits con escalas compartidas por bloque, definido en el estandar OCP MX) para los pesos, con cache KV en FP8, generada con la herramienta intel/auto-round y serializada en el formato llm-compressor / compressed-tensors. No es un modelo nuevo ni un fine-tuning: es un artefacto de compresion orientado a reducir el coste de inferencia de un modelo de gran tamano.

El repositorio declara 551.245.302.890 parametros (unos 551.000 millones) segun los metadatos de safetensors, y ocupa 563,5 GB en disco. El tag de arquitectura es kimi_k25 y requiere custom_code, lo que indica que la implementacion no es puramente estandar y depende de codigo remoto del repositorio base. El pipeline, los idiomas soportados y la licencia no estan declarados en la ficha de HuggingFace; la model card remite explicitamente a la licencia del modelo original.

Su relevancia practica es doble: por un lado, permite ejecutar un modelo de escala frontera con un presupuesto de memoria notablemente inferior al de la version BF16; por otro, la propia model card documenta la degradacion de calidad introducida por la cuantizacion, con una caida media de 0,46 puntos porcentuales en el promedio de hellaswag, piqa, mmlu y gsm8k. Es, por tanto, un artefacto pensado para equipos que ya trabajan con Kimi-K2.6 y quieren servir el modelo en hardware propio con vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | kimi_k25 (por tag del repositorio; requiere custom_code). No se detalla si es transformer denso o Mixture of Experts en la informacion disponible |
| Parametros totales | 551.245.302.890 (551,2 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos MXFP4 (4 bits, escalas por bloque), cache KV en FP8; formato compressed-tensors / llm-compressor; tag "8-bit"; generado con intel/auto-round |
| Idiomas soportados | no disponible |
| Licencia | no disponible en la ficha; la model card indica "Please follow the license of the original model" (moonshotai/Kimi-K2.6) |
| Formato de pesos | safetensors con custom_code y compresion compressed-tensors |

Otros datos del repositorio: 8 descargas, 0 likes, 563,5 GB de tamano, creado el 22 de septiembre de 2026 y actualizado el mismo dia. Region declarada: us.

## Arquitectura y entrenamiento

Este repositorio no entrena ningun modelo. Es un proceso de cuantizacion post-entrenamiento (PTQ) aplicado sobre moonshotai/Kimi-K2.6 con Intel AutoRound, una tecnica de redondeo consciente de los pesos y de la activacion que ajusta los valores cuantizados minimizando el error de reconstruccion por capa en lugar de aplicar un redondeo al mas cercano. El resultado se serializa con llm-compressor en el ecosistema compressed-tensors, lo que determina que motores de inferencia pueden cargarlo. Los pesos se almacenan en MXFP4 y la cache KV en FP8, una combinacion que reduce simultaneamente el peso del modelo y la memoria consumida por el contexto en tiempo de ejecucion. El tag kimi_k25 y la dependencia de custom_code indican que la topologia del modelo base (atencion, capas MoE si las hubiera, normalizaciones) se resuelve mediante codigo incluido en el repositorio, no cubierto por la implementacion estandar de transformers.

No hay informacion disponible sobre el numero de tokens de entrenamiento del modelo base, la composicion del dataset, ni si hubo fases de RLHF, DPO u otro alineamiento; esos datos corresponderian a la documentacion de moonshotai/Kimi-K2.6, que no forma parte de la informacion proporcionada. Tampoco se documentan innovaciones de decodificacion (especulativa, atencion lineal, etc.) en esta ficha.

## Capacidades

- Generacion de texto y respuesta a instrucciones heredadas del modelo base Kimi-K2.6. La model card no enumera capacidades especificas.
- Razonamiento y conocimiento general: el modelo conserva un 88,82 % en MMLU tras la cuantizacion, frente al 89,01 % de la version BF16.
- Razonamiento matematico y aritmetico: 93,25 % en GSM8K, frente al 93,63 % en BF16.
- Comprension de sentido comun y lenguaje natural: 76,42 % en hellaswag y 84,39 % en piqa.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible. La ficha no declara idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.
- Eficiencia de despliegue: la cuantizacion MXFP4 con cache KV en FP8 es en si misma la caracteristica diferencial de este artefacto, ya que habilita inferencia con menor huella de memoria que BF16.

## Casos de uso

- Servicio de inferencia a gran escala con vLLM: el formato compressed-tensors es cargable directamente por vLLM 0.28.0, la version usada en la evaluacion del autor. Es el escenario natural para este artefacto, ya que permite servir un modelo de 551.000 millones de parametros reduciendo el coste por token respecto a BF16.
- Despliegue en infraestructura propia con GPUs de 80 GB: al reducir el peso de los parametros, el modelo puede repartirse entre un numero menor de aceleradores que la version BF16, lo que abarata el coste de rack y de energia por instancia servida.
- Sustitucion directa del modelo base en pipelines existentes: al mantener el mismo tokenizador y la misma familia de pesos que moonshotai/Kimi-K2.6, un equipo que ya tenga integrado el modelo original puede intercambiar el checkpoint reduciendo memoria sin reescribir su capa de aplicacion.
- Evaluacion comparativa de tecnicas de cuantizacion: este repositorio incluye una tabla BF16 frente a MXFP4+FP8KV, lo que lo convierte en un punto de referencia util para investigadores que midan la degradacion de PTQ en modelos de escala frontera.
- Procesamiento por lotes (batch) de documentos largos en backend: la combinacion MXFP4 con cache KV en FP8 reduce la presion de memoria del contexto, lo que favorece cargas de trabajo de resumen y extraccion sobre corpus extensos cuando el throughput importa mas que la latencia por peticion.
- Fine-tuning adicional o destilado sobre pesos cuantizados: el checkpoint puede servir como punto de partida para tecnicas de ajuste eficiente sobre modelos comprimidos, siempre que la licencia del modelo original lo permita (no verificada en esta ficha).
- Investigacion academica en compresion de modelos: al publicar simultaneamente el resultado cuantizado y la referencia BF16 sobre las mismas tareas, permite reproducir el analisis de error introducido por MXFP4 y FP8 KV en un modelo de mas de medio billon de parametros.

## Benchmarks y rendimiento

Resultados declarados en la model card del autor, obtenidos con vLLM y lm_eval 0.4.12 sobre el modelo base BF16 y sobre esta version cuantizada:

| Tarea | Backend | BF16 | MXFP4 + FP8KV | Delta |
|---|---|---|---|---|
| hellaswag | vllm | 0,7752 | 0,7642 | -0,0110 |
| piqa | vllm | 0,8455 | 0,8439 | -0,0016 |
| mmlu | vllm | 0,8901 | 0,8882 | -0,0019 |
| gsm8k | vllm | 0,9363 | 0,9325 | -0,0038 |
| Promedio | vllm | 0,86177 | 0,85720 | -0,00457 |

Entorno de evaluacion declarado: torch 2.13.0, compressed-tensors 0.17.0, transformers 5.16.1, vllm 0.28.0, lm_eval 0.4.12, auto-round 0.16.0.dev143+g678f8f5f. No hay benchmarks adicionales (por ejemplo, de codigo o de contexto largo) en la informacion disponible.

## Requisitos de hardware

- Tamano en disco: el repositorio ocupa 563,5 GB, por lo que se necesita al menos ese espacio para descargar el checkpoint completo antes de cargarlo.
- VRAM para los pesos: con un esquema MXFP4 (aproximadamente 4,25 bits por parametro incluyendo escalas) sobre 551.200 millones de parametros, la estimacion es de unos 290-300 GB solo para pesos. Es una estimacion calculada a partir del numero de parametros, no un dato publicado; el dato publicado es el tamano de repositorio de 563,5 GB, que probablemente incluye ficheros auxiliares o duplicados de formato.
- Memoria de cache KV: al usar FP8, la cache KV consume aproximadamente la mitad que una cache en BF16 para la misma longitud de contexto y el mismo numero de secuencias.
- GPU recomendadas: no hay recomendaciones oficiales en la informacion disponible. Por tamano, el despliegue requiere agregados multi-GPU de clase centro de datos (por ejemplo, 8 x H100 80 GB = 640 GB, u 8 x B200). Cualquier configuracion con menos de 300 GB de VRAM agregada necesitaria offload a CPU o memoria NVMe.
- GPU de consumo: no cabe en una RTX 4090 (24 GB), ni siquiera en configuraciones de 2 o 4 unidades. No es un modelo desplegable en hardware consumer sin un esquema de offload agresivo.
- Opciones de despliegue: vLLM es la ruta validada por el autor, en la version 0.28.0 con compressed-tensors 0.17.0 y transformers 5.16.1. Es necesario soporte de custom_code para la arquitectura kimi_k25.
- Otras rutas (llama.cpp, Ollama, TGI): no disponibles. El formato compressed-tensors no es compatible de forma nativa con llama.cpp ni con GGUF, por lo que estos motores no pueden cargar el checkpoint tal cual.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

La informacion disponible solo permite comparar el checkpoint cuantizado con su propia referencia BF16. Para las demas alternativas no hay datos.

| Modelo | Parametros totales | Contexto | MMLU | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| INCModel3/Kimi-K2.6-MXFP4-FP8KV-CT-AutoRound | 551,2 mil millones | no disponible | 0,8882 | 0,9325 | no disponible (remite a la del base) | HuggingFace, 8 descargas |
| moonshotai/Kimi-K2.6 (BF16, referencia) | no disponible | no disponible | 0,8901 | 0,9363 | no disponible | HuggingFace (repositorio base) |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de terceros (parametros, contexto, rendimiento ni licencia) en el material proporcionado, por lo que no se incluye una comparativa con alternativas externas.

## Limitaciones y advertencias

- Degradacion por cuantizacion: la propia model card documenta una perdida media de 0,46 puntos porcentuales, con la mayor caida en hellaswag (-1,10 puntos). Para tareas sensibles a pequenas diferencias de calidad, la version BF16 puede seguir siendo preferible.
- Alucinacion: la model card advierte explicitamente de que el modelo puede producir salidas factualmente incorrectas y que no debe usarse como fuente de informacion fiable.
- Sesgos y contenido ofensivo: el autor advierte de que, por las limitaciones del modelo preentrenado y de los datasets de ajuste, la salida puede contener contenido soez, sesgado u ofensivo. Recomienda realizar pruebas de seguridad antes de cualquier despliegue.
- Licencia: no declarada en la ficha de HuggingFace. La model card remite a la licencia del modelo original y anade que la licencia de este modelo no constituye asesoramiento legal, que los autores no se responsabilizan del uso por terceros y que se consulte a un abogado antes de un uso comercial. En la practica, el uso comercial queda en un limbo juridico hasta verificar la licencia de moonshotai/Kimi-K2.6.
- Idiomas: no declarados. No se puede asumir soporte multilingue sin comprobacion empirica.
- Longitud de contexto: no declarada. El uso de cache KV en FP8 sugiere soporte de contextos largos, pero no hay cifra publicada.
- Dependencia de custom_code: el repositorio requiere codigo personalizado para cargar la arquitectura kimi_k25. Esto implica auditar y confiar en el codigo remoto del repositorio, ademas de fijar versiones de transformers y compressed-tensors compatibles.
- Madurez del artefacto: 8 descargas, 0 likes y actualizado el mismo dia de su creacion. No hay evidencia de uso en produccion ni validacion independiente de los resultados declarados.
- Riesgo de desajuste de herramientas: la validacion se hizo con vLLM 0.28.0, compressed-tensors 0.17.0 y transformers 5.16.1. Otras versiones pueden no cargar el checkpoint correctamente.
- Restriccion de despliegue: el formato compressed-tensors limita las opciones de motor y excluye el ecosistema GGUF/llama.cpp, lo que reduce la portabilidad.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/INCModel3/Kimi-K2.6-MXFP4-FP8KV-CT-AutoRound
- Modelo base: https://huggingface.co/moonshotai/Kimi-K2.6
- Intel AutoRound (herramienta de cuantizacion): https://github.com/intel/auto-round
- Intel Neural Compressor: https://github.com/intel/neural-compressor
- Los resultados de busqueda web proporcionados no contienen enlaces relevantes para este modelo: devuelven exclusivamente paginas sobre tipos de cambio del Norges Bank, sin relacion con Kimi-K2.6 ni con cuantizacion. No se dispone de papers, blogs, repositorios adicionales ni demos verificables sobre este checkpoint.

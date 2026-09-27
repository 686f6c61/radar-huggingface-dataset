# Johneeee/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-fp16-oQ6e-g128-text

## Resumen

El repositorio `Johneeee/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-fp16-oQ6e-g128-text` es una publicacion de pesos cuantizados alojada en HuggingFace por el usuario Johneeee. No es un modelo entrenado desde cero: se trata de una cuantizacion en precision mixta generada con la herramienta oQ (oMLX v0.7.0.dev4), que parte de un modelo base cuyo campo `model_type` es `qwen3_5`, es decir, un derivado de la familia Qwen 3.5, y lo convierte a formato MLX safetensors de 6 bits con tamano de grupo 128. El sufijo del nombre indica ademas que la variante de origen incorpora ajustes orientados a eliminar rechazos ("uncensored"/"heretic"), junto a otras modificaciones no documentadas.

El dato objetivo mas relevante es el recuento real de parametros en los ficheros safetensors: 26.895.998.464, aproximadamente 26,9 mil millones. El repositorio ocupa 21,5 GB, coherente con una cuantizacion de 6 bits (unos 20,2 GB de pesos mas las escalas y sesgos por grupo). Es, por tanto, un modelo denso de clase ~27B pensado para ejecucion en Apple Silicon mediante MLX, no para CUDA sin conversion previa.

Su relevancia actual es limitada pero informativa: se publico y actualizo en una ventana de unos siete minutos, acumula 0 descargas y 0 likes, no declara licencia, idiomas ni pipeline, y su model card se limita a los parametros de cuantizacion. Funciona mas como artefacto de experimentacion y distribucion de cuantizaciones que como modelo de referencia listo para produccion, y su evaluacion seria exige auditar el modelo base original, que este repositorio no identifica con enlaces.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. El campo `model_type` del repositorio es `qwen3_5`, que apunta a la familia Qwen 3.5; no se detalla si es transformer denso, MoE o hibrida |
| Parametros totales | 26.895.998.464 (aprox. 26,9B), segun los ficheros safetensors |
| Parametros activos | No disponible (no se especifica si la arquitectura es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Una unica variante: 6 bits, precision mixta (oQ, oMLX v0.7.0.dev4), group size 128 |
| Idiomas soportados | No disponible. El sufijo `-text` sugiere que la variante es solo texto, sin vision |
| Licencia | No disponible |
| Formato de pesos | MLX safetensors (cuantizado a 6 bits) |
| Tamano del repositorio | 21,5 GB |
| Libreria declarada | mlx |
| Tags | mlx, safetensors, qwen3_5, oq, quantized, 6-bit, region:us |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-27T15:38:00.000Z |
| Ultima actualizacion | 2026-09-27T15:45:14.000Z (7 minutos despues de la creacion) |

## Arquitectura y entrenamiento

No hay informacion verificable sobre la arquitectura interna, los datos de entrenamiento ni el proceso de alineacion del modelo base. Lo unico documentado es la cadena de transformacion posterior: un modelo con `model_type: qwen3_5` fue cuantizado con oQ (oMLX v0.7.0.dev4) aplicando precision mixta, con 6 bits por peso y grupo de 128 elementos, y exportado a safetensors en formato MLX. La precision mixta implica que distintas capas o tensores pueden recibir un numero de bits distinto dentro de un presupuesto medio de 6 bits, una tecnica habitual para preservar capas sensibles (atencion, embeddings) mientras se comprime con mas agresividad el resto.

Tampoco se documenta el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF, DPO u otra forma de ajuste, ni innovaciones de decodificacion. El nombre del repositorio encadena etiquetas de la comunidad ("TURBO", "Fable", "Cold-Fusion", "Heretic", "Uncensored", "NM", "DAU") que en el ecosistema de merges suelen referirse a fine-tunes, mezclas de modelos o ajustes de estilo, pero este repositorio no aporta evidencia ni enlaces que permitan verificar que significan en este caso concreto ni quien los produjo. Cualquier afirmacion sobre capacidades heredadas del modelo base seria especulacion.

## Capacidades

- No se puede confirmar ninguna capacidad concreta: la model card no incluye evaluaciones, ejemplos ni descripcion funcional.
- El sufijo `-text` del identificador indica que la variante distribuida aqui es solo texto (sin torre de vision), aunque no se detalla en la documentacion.
- El tag `heratic`/`Uncensored` en el nombre apunta a un ajuste destinado a reducir rechazos y filtros de seguridad, lo que suele correlacionarse con menor adherencia a directrices de contenido; no hay documentacion tecnica que lo confirme.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; no se declara lista de idiomas.
- Modo de razonamiento explicito (thinking mode), vision o audio: no disponible.
- Por el numero de parametros (aprox. 26,9B) es razonable esperar generacion de texto, codigo y matematicas de nivel medio-alto, pero se trata de una expectativa basada en la clase de tamano, no de un dato verificado.

## Casos de uso

- Inferencia local en Mac con MLX: cargar los safetensors de 6 bits directamente con la libreria `mlx` o `mlx-lm` en un equipo Apple Silicon con memoria unificada suficiente (32 GB o mas). Es el unico escenario de despliegue para el que el repositorio esta explicitamente preparado.
- Prototipado de asistentes conversacionales en local: dado el tamano (~27B), permite experimentar con respuestas de mayor calidad que modelos de 7-8B sin salir del portatil, siempre que se disponga de un Mac con 36-64 GB de memoria unificada.
- Investigacion sobre cuantizacion: el repositorio sirve como caso de estudio de precision mixta de 6 bits con group size 128 generada por oQ, util para medir degradacion frente al modelo en fp16.
- Auditoria de seguridad y alineacion: al tratarse de una variante marcada como "uncensored", es un candidato para equipos de red teaming que estudien como los ajustes de este tipo alteran las tasas de rechazo y la generacion de contenido danino.
- Generacion de texto offline y procesamiento por lotes: transcripcion de resumenes, reescritura o clasificacion sobre corpus locales en entornos sin conectividad ni GPU NVIDIA.
- Base para conversion a otros formatos: los pesos cuantizados pueden servir de punto de partida para experimentos de re-cuantizacion o de conversion, aunque la conversion MLX a GGUF no es directa y suele requerir volver al modelo original.
- Comparacion de variantes de la comunidad: util para quien quiera contrastar el efecto de distintos merges y ajustes sobre un mismo modelo base, siempre que se localice ese base original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio unicamente detalla los parametros de cuantizacion (tipo de modelo, bits, group size y formato) y no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, ni comparaciones con el modelo sin cuantizar.

## Requisitos de hardware

- VRAM o memoria unificada para los pesos: el repositorio ocupa 21,5 GB, por lo que se necesita al menos ese espacio libre, mas el margen de la cache KV y el runtime.
- Memoria recomendada: 32 GB de memoria unificada como minimo para uso con contexto corto; 36-64 GB para contextos largos o lotes mayores.
- GPU: no aplicable en su formato actual. Al estar en formato MLX, requiere Apple Silicon (series M). No es ejecutable en A100, H100 ni RTX 4090 sin convertir los pesos a otro formato (por ejemplo GGUF o safetensors estandar), operacion que no esta documentada en el repositorio.
- Cabe en consumer GPU: no en su formato actual. Como referencia, en fp16 los 26,9B parametros ocuparian aproximadamente 53,8 GB, fuera del alcance de una RTX 4090 de 24 GB; una re-cuantizacion a 4 bits (unos 14-15 GB) si podria caber en GPUs de 16-24 GB.
- Opciones de despliegue: `mlx-lm` / `mlx` en macOS; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. No se aportan mediciones de tokens por segundo.

## Comparativa con modelos similares

No hay datos verificables que permitan una comparativa rigurosa. El modelo base exacto no se identifica con enlaces, no se declara licencia ni contexto, y no existen benchmarks publicados en la informacion disponible. La unica dimension objetiva es el recuento de parametros.

| Modelo | Parametros | Contexto | Licencia | Formato | Datos de rendimiento |
|---|---|---|---|---|---|
| Johneeee/Qwen3.8-27B-TURBO-...-oQ6e-g128-text (este repositorio) | 26,9B | No disponible | No disponible | MLX safetensors 6 bits | No disponible |
| Alternativa de clase ~27B de la familia Qwen 3.5 | No disponible | No disponible | No disponible | No disponible | No disponible |
| Alternativa de clase ~27B de otra familia (p. ej. Gemma 3 27B) | No verificada en la informacion disponible | No verificada | No verificada | No verificada | No disponible |
| Variante del mismo base sin cuantizar | No disponible (el repositorio no la enlaza) | No disponible | No disponible | No disponible | No disponible |

Cualquier comparacion numerica exigiria localizar el modelo base original, verificar su licencia y ejecutar la misma bateria de evaluaciones sobre el modelo en fp16 y sobre esta cuantizacion de 6 bits.

## Limitaciones y advertencias

- Ausencia total de documentacion: sin licencia, sin idiomas, sin pipeline, sin model card tecnica. El uso comercial queda en una situacion juridica indeterminada.
- Riesgo de alucinacion: no disponible, pero inherente a cualquier modelo de lenguaje; no hay evaluaciones que lo acoten.
- Ajuste "uncensored": el propio nombre indica modificaciones orientadas a eludir rechazos de seguridad. Esto puede traducirse en respuestas a peticiones daninas, contenido ofensivo o nula adherencia a politicas de uso, sin que exista auditoria publicada.
- Trazabilidad nula del modelo base: no se enlaza el checkpoint original, ni el dataset, ni los autores de los ajustes. Es imposible auditar sesgos, procedencia de datos o cumplimiento de licencias de terceros.
- Herencia de licencia incierta: si el modelo base original tiene condiciones de uso (por ejemplo, licencias con clausulas de atribucion o restricciones de uso comercial), este repositorio no las reproduce ni las cita.
- Es una cuantizacion, no un modelo nuevo: la degradacion respecto al fp16 no esta medida. Los errores acumulados por la precision mixta de 6 bits pueden afectar de forma desigual a tareas de razonamiento largo o de codigo.
- Limitacion de plataforma: los pesos son MLX; no funcionan directamente en CUDA, ROCm ni en la mayoria de servidores de inferencia.
- Senales de escasa validacion: 0 descargas, 0 likes y una ventana de publicacion de siete minutos entre creacion y ultima actualizacion sugieren una subida de prueba o automatizada, sin uso ni verificacion por parte de la comunidad.
- Metadatos anomalos: la fecha declarada (2026-09-27) es posterior a la fecha actual de referencia, lo que refuerza la idea de un repositorio generado de forma automatizada o con metadatos poco fiables.
- Si el objetivo es produccion, este repositorio no es una base adecuada sin antes identificar y validar el modelo original y su licencia.

## Enlaces

- HuggingFace: https://huggingface.co/Johneeee/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-fp16-oQ6e-g128-text
- Herramienta de cuantizacion oQ (oMLX), citada por el autor: https://github.com/jundot/omlx
- Repositorio del modelo base: no disponible
- Paper o informe tecnico: no disponible
- Blog, demo o espacio de prueba: no disponible
- Otros enlaces relevantes: no disponible

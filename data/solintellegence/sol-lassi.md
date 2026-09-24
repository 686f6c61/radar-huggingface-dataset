# solintellegence/sol-lassi

## Resumen

Sol Lassi 600K Base es un modelo de lenguaje causal experimental desarrollado por Sol Intelligence (usuario `solintellegence` en HuggingFace). Se trata de un modelo denso decoder-only de tan solo 600.000 parametros, entrenado desde cero con el objetivo declarado de servir como banco de pruebas para experimentos de optimizacion y para la investigacion sobre modelos de lenguaje extremadamente pequenos. El checkpoint se publica como modelo base, no como asistente ajustado por instrucciones, y el propio autor aclara que no reclama ninguna puntuacion en indices de inteligencia ni en clasificaciones publicas.

La relevancia del modelo no reside en su capacidad, sino en su caracter reproducible y didactico: es un transformer completo (6 bloques, anchura oculta 96, atencion de 3 cabezas, MLP con SiLU con compuerta) con tokenizador BPE a nivel de byte de 2.048 entradas, pesos atados y contexto de entrenamiento de 128 tokens. Se entreno con 1.000 millones de exposiciones a tokens sobre una corriente equilibrada de FinePhrase, usando el optimizador M-SimOW, un esquema de learning rate fijo escalonado y solo 500 millones de tokens distintos en el manifiesto de entrenamiento.

Su formato de pesos es MLX NPZ y esta pensado para ejecutarse en Apple Silicon mediante la libreria MLX. Con 0 descargas y 0 likes en el momento de redactar esta ficha, es un artefacto de investigacion sin adopcion practica conocida, cuya utilidad se limita al estudio de dinamicas de entrenamiento, tokenizadores diminutos y pipelines de MLX en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only causal |
| Parametros totales | 600.000 |
| Parametros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | 128 tokens (contexto de entrenamiento; no se documenta contexto de inferencia distinto) |
| Tipos de cuantizacion | No disponible (solo se publican pesos MLX NPZ sin variantes cuantizadas documentadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | MLX NPZ (`model.npz`) |
| Bloques transformer | 6 bloques independientes |
| Anchura oculta | 96 |
| Atencion | 3 cabezas de 32 dimensiones cada una |
| MLP | SiLU con compuerta (gated SiLU), anchura 104 |
| Vocabulario | 2.048 tokens, BPE a nivel de byte |
| Embeddings | Entrada y salida atados |
| Tokens de entrenamiento | 1.000.000.000 exposiciones (manifiesto de 500M tokens distintos) |
| Libreria | MLX |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso de tipo decoder-only con 6 bloques independientes, anchura oculta de 96 y atencion multi-cabeza de 3 cabezas de 32 dimensiones (96 dimensiones en total, coincidiendo con la anchura oculta). El bloque MLP emplea activacion SiLU con compuerta y anchura 104. Los embeddings de entrada y salida estan atados, lo que reduce el recuento de parametros: el vocabulario de 2.048 entradas contribuye con una unica matriz de 2.048 x 96. El tokenizador es un BPE a nivel de byte con vocabulario de 2.048 entradas, congelado y publicado junto al checkpoint.

El entrenamiento partio de cero y se realizo sobre una corriente equilibrada de FinePhrase compuesta por sus configuraciones `faq`, `math`, `table` y `tutorial`, usando secuencias de 128 tokens, tamano de lote 32 y semilla 7. El optimizador fue M-SimOW con beta de momento 0.8 y decaimiento de peso desacoplado de 0.1, con un esquema de learning rate fijo por tramos: 0.006 durante los primeros 500 millones de tokens y 0.003 durante los siguientes 500 millones. El manifiesto guardado corresponde a `FinePhrase-balanced-500m-2k-v2`, que contiene 500 millones de tokens de corriente de entrenamiento, por lo que el modelo recibio 1.000 millones de exposiciones a tokens (es decir, aproximadamente dos epocas sobre el manifiesto). No se documenta ninguna fase de RLHF, DPO u otro ajuste por preferencias, ni tecnicas de decodificacion especulativa o atencion lineal. El autor tampoco describe innovaciones arquitectonicas propias mas alla del uso del optimizador M-SimOW, cuyo detalle no se amplia en la informacion disponible.

## Capacidades

- Generacion de texto autoregresiva basica en ingles, condicionada por un prompt, con el helper `generate` incluido en `modeling_sol_lassi.py`.
- Continuacion de texto a nivel de caracter y de palabra dentro de contextos muy cortos (hasta 128 tokens).
- Modelado de lenguaje puro: el checkpoint es un modelo base, por lo que no sigue instrucciones, no mantiene formato de conversacion y no responde a preguntas de forma fiable.
- Reproduccion de patrones estilisticos simples aprendidos de las configuraciones `faq`, `math`, `table` y `tutorial` de FinePhrase (por ejemplo, esqueletos de tablas o formulaciones de preguntas frecuentes), sin garantia de coherencia.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el modelo solo declara ingles y su vocabulario de 2.048 tokens es demasiado reducido para cubrir con holgura otros idiomas.
- Capacidades especiales (modo thinking, vision, audio, decodificacion especulativa): no disponibles.
- Uso experimental del propio codigo: sirve como implementacion de referencia minima de un transformer completo en MLX (fichero `keystone_mlx/` y cargador independiente).

## Casos de uso

- Investigacion sobre optimizadores: el checkpoint esta pensado explicitamente para experimentos con M-SimOW y otros optimizadores. Un equipo puede entrenar variantes cambiando momento, decaimiento de peso o el esquema de learning rate escalonado (0.006 y luego 0.003) y comparar curvas de perdida por minibatch sobre el mismo manifiesto y la misma semilla (7).
- Pruebas de regresion de pipelines MLX: al pesar muy pocos megas, el modelo permite validar de principio a fin un flujo de `snapshot_download`, carga de pesos NPZ, tokenizacion BPE y generacion en integracion continua sin consumir GPU ni depender de credenciales de servicios externos.
- Docencia y divulgacion: es util para explicar de forma tangible conceptos como embeddings atados, atencion multi-cabeza con 3 cabezas de 32 dimensiones o el efecto del vocabulario en el recuento total de parametros, ejecutando ejemplos en un portatil Apple Silicon.
- Investigacion sobre tokenizadores: su vocabulario byte-level BPE congelado de 2.048 entradas es un banco de pruebas barato para estudiar como distintos entrenamientos del tokenizador afectan a la cobertura de caracteres y a la longitud efectiva de las secuencias de 128 tokens.
- Generacion de texto sintetico de baja fidelidad para pruebas de software: los desarrolladores pueden usarlo como relleno determinista en tests de interfaz o en validaciones de esquemas de datos, asumiendo que la salida puede ser incoherente o repetitiva.
- Benchmarking de hardware y de runtime: sirve como carga minima para medir latencia de arranque, sobrecarga de carga de modelo y coste por token en MLX sobre distintos chips de Apple, aislando el efecto del hardware del de la capacidad del modelo.
- Estudio de seguridad y alineacion en modelos diminutos: permite observar de forma controlada fenomenos como repeticion degenerativa, deriva de contexto o generacion de contenido inseguro en un modelo sin ajuste por instrucciones, sin los costes de un modelo grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que esta version no incluye evaluaciones Open-SLM, ArithMark ni Intelligence Index, y advierte que los registros de perdida de entrenamiento son mediciones por minibatch que no deben presentarse como rendimiento en un conjunto reservado (held-out).

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 600.000 parametros, por lo que los pesos ocupan aproximadamente 2,4 MB en fp32 o 1,2 MB en fp16/bf16 (calculo derivado del recuento de parametros; el dtype publicado no se especifica). El coste dominante es la memoria del runtime, no los pesos.
- GPU recomendadas: no se documentan. El modelo esta disenado para Apple Silicon mediante MLX; no se mencionan CUDA, A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: si, pero no en el sentido habitual; cabe de sobra en cualquier equipo con memoria unificada de Apple. No se documenta soporte para GPUs de consumo NVIDIA.
- Opciones de despliegue: carga directa con MLX a traves de `modeling_sol_lassi.py` (funciones `load_model` y `generate`). No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

No disponible. La busqueda web realizada no devolvio informacion sobre modelos comparables, y la model card no incluye ninguna comparacion con alternativas. El unico dato objetivo aportado por el autor es que no se reclama ninguna puntuacion de leaderboard para este checkpoint, por lo que no es posible situarlo frente a otros modelos de la misma categoria con cifras verificables.

## Limitaciones y advertencias

- Capacidad muy limitada por tamano: con 600.000 parametros y un vocabulario de 2.048 tokens, la salida puede ser incoherente, repetitiva, factualmente incorrecta o insegura, tal y como advierte el propio autor.
- No es un asistente: es un modelo base sin ajuste por instrucciones, por lo que no cabe esperar cumplimiento de instrucciones, formato estructurado ni soporte de conversacion multi-turno.
- Contexto muy corto: 128 tokens, suficiente para continuaciones de una o dos frases como maximo.
- Idioma: solo ingles declarado; el comportamiento en castellano u otros idiomas no esta documentado ni es esperable con un vocabulario tan reducido.
- Riesgo de alucinacion: alto en terminos relativos, ya que el modelo no dispone de conocimiento factual fiable; cualquier afirmacion que genere debe tratarse como texto sin verificar.
- Sesgos conocidos: no se documentan analisis de sesgos. Al entrenarse sobre una mezcla equilibrada de subconjuntos de FinePhrase sin filtrado descrito, puede reproducir sesgos presentes en esa fuente.
- Restricciones de licencia: los pesos se publican bajo CC BY 4.0, que permite uso comercial con atribucion. Sin embargo, los terminos del conjunto de datos subyacente (FinePhrase) siguen correspondiendo a sus proveedores originales, y el autor no aclara si dichos terminos imponen restricciones adicionales al uso derivado.
- Sin adopcion ni soporte: 0 descargas y 0 likes en el momento de la ficha, sin resultados de benchmarks publicados y sin mantenimiento declarado. No es apto para uso en produccion ni en entornos de alto riesgo.
- Dependencia de plataforma: el cargador esta ligado a MLX y a Apple Silicon; trasladarlo a otros runtimes exigiria trabajo adicional no documentado.
- Fechas de publicacion inusuales: el repositorio figura creado y actualizado el 23 de septiembre de 2026, dato que conviene verificar antes de citarlo.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/solintellegence/sol-lassi
- Perfil del autor en HuggingFace: https://huggingface.co/solintellegence
- Ficheros incluidos en el repositorio: `model.npz`, `modeling_sol_lassi.py`, `keystone_mlx/`, `tokenizer.json`, `tokenizer_config.json`, `config.json`, `training_state.json`, `sol-lassi-banner.png`
- Paper, blog, repositorio de codigo o demo adicionales: no disponibles. Los resultados de la busqueda web no contienen informacion relacionada con el modelo (devuelven articulos juridicos franceses sobre contratacion de trabajadores extranjeros, sin ninguna conexion con Sol Lassi).

# nabin2004/nebium-large-gguf

## Resumen

Nebium-Large-GGUF es la distribucion en formato GGUF de Nebium-Large, un modelo de lenguaje causal de 762 millones de parametros desarrollado por el usuario nabin2004. A diferencia de un modelo de proposito general, esta especializado en una unica tarea: la continuacion de secuencias de movimientos de ajedrez en notacion UCI (por ejemplo, "e2e4 e7e5 g1f3"). El repositorio de HuggingFace que se analiza aqui contiene unicamente los binarios cuantizados y en FP16, mientras que los pesos originales en PyTorch residen en el repositorio nabin2004/nebium-large.

La relevancia de esta ficha es acotada y conviene explicitarla: no se trata de un modelo competitivo en el panorama generalista, sino de un artefacto de dominio muy especifico, con un vocabulario cerrado de 5000 tokens BPE derivado de la notacion UCI y una ventana de contexto de 1024 tokens. Su interes practico esta en el despliegue local de bajo coste: los binarios GGUF permiten inferencia en CPU y en GPU de gama baja mediante llama.cpp, Ollama o llama-cpp-python, con huellas de memoria que van de aproximadamente 1,5 GB en FP16 a unos 800 MB en Q8_0.

El repositorio presenta 0 descargas y 0 likes en el momento de la consulta, y la model card no incluye resultados de benchmarks, detalles del dataset de entrenamiento ni informacion sobre fases de ajuste (RLHF, DPO u otras). Todo ello limita la evaluacion independiente del modelo y debe tenerse en cuenta antes de considerarlo para cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con Rotary Position Embeddings (RoPE) |
| Parametros totales | 762 millones (762M) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | FP16 (`nebium-large.gguf`), Q8_0 (`nebium-large-q8_0.gguf`), Q4_K_M (`nebium-large-q4_k_m.gguf`) |
| Idiomas soportados | Declarado: ingles (`en`). En la practica, el vocabulario es de 5000 tokens BPE orientado a notacion UCI de ajedrez; no hay evidencia de competencia linguistica general |
| Licencia | MIT |
| Formato de pesos | GGUF (los pesos base en PyTorch se publican por separado en nabin2004/nebium-large) |
| Dimension oculta (d_model) | 1280 |
| Cabezas de atencion | 20 |
| Capas | 36 |
| Vocabulario | 5000 tokens BPE de notacion UCI |
| Huella de memoria declarada | FP16: ~1,5 GB; Q8_0: ~800 MB; Q4_K_M: no indicada por el autor |
| Token de parada | `<|eos|>` (y `<|pad|>` en los ejemplos de llama-cpp-python) |

## Arquitectura y entrenamiento

La model card describe una arquitectura de transformer causal con Rotary Position Embeddings (RoPE), con una dimension oculta de 1280, 20 cabezas de atencion y 36 capas, lo que arroja los 762 millones de parametros declarados. El vocabulario es deliberadamente reducido: 5000 tokens BPE construidos sobre notacion UCI de ajedrez, en lugar de un tokenizador de lenguaje natural. La ventana de contexto es de 1024 tokens, coherente con la naturaleza de la tarea, ya que las secuencias objetivo son lineas de movimientos y no documentos largos.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el origen de las partidas utilizadas, ni sobre si se aplicaron fases de ajuste como RLHF, DPO o instruccion supervisada. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, mezcla de expertos) mas alla del uso de RoPE y de la especializacion del vocabulario. El unico artefacto de inferencia documentado es la conversion a GGUF para llama.cpp, Ollama y los bindings de Python, sin mencion a cuantizaciones alternativas, versiones destiladas ni variantes de mayor contexto.

## Capacidades

- Generacion de texto autoregresiva restringida al dominio del ajedrez: continuacion de secuencias de movimientos en notacion UCI.
- Prediccion del siguiente movimiento a partir de un historial parcial de jugadas (por ejemplo, completar "e2e4 e7e5 g1f3" con continuaciones plausibles).
- Finalizacion de secuencias con detencion mediante el token `<|eos|>`, segun los ejemplos de uso con llama.cpp, Ollama y llama-cpp-python.
- Inferencia local en CPU y en GPU de gama baja, gracias a los binarios GGUF cuantizados.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el modelo esta declarado como ingles, pero su vocabulario efectivo es de notacion UCI.
- Capacidades especiales (modo thinking, vision, audio, ejecucion de codigo): no disponibles.
- Formato estructurado o validacion de legalidad de jugadas: no disponible; no se documenta ningun mecanismo que garantice que los movimientos generados sean legales en la posicion dada.

## Casos de uso

- Continuacion de lineas de apertura en herramientas de analisis: dado un prefijo de movimientos en UCI, el modelo genera continuaciones candidatas. Es adecuado porque su vocabulario esta cerrado a UCI y la tarea coincide exactamente con su objetivo de entrenamiento declarado.
- Generacion de conjuntos de datos sinteticos de partidas: se puede usar para producir secuencias largas de movimientos como material de aumento de datos para otros experimentos de modelado simbolico, aceptando que la legalidad de las jugadas no esta garantizada.
- Autocompletado de movimientos en bases de datos de partidas: integrado como servicio local via llama-cpp-python, permite sugerir el siguiente movimiento mientras se introduce una partida, con un coste de memoria inferior a 1 GB en Q8_0.
- Experimentacion academica sobre modelado de lenguaje en dominios de vocabulario cerrado: su tamano reducido (762M) y su contexto de 1024 tokens lo hacen util como caso de estudio reproducible en un portatil, sin necesidad de aceleradores dedicados.
- Despliegue en entornos de borde o sin GPU: los binarios Q4_K_M y Q8_0 permiten ejecutar inferencia en CPU con llama.cpp u Ollama, en escenarios donde no hay acceso a hardware dedicado.
- Demostraciones educativas de motores de continuacion de partidas: el modelo puede ilustrar el pipeline completo (tokenizacion UCI, prompt, generacion con temperatura y top-p, token de parada) en talleres o asignaturas de IA, sin depender de modelos propietarios.
- Procesamiento por lotes de lineas de jugadas como etapa de preprocesamiento: mediante scripts de llama.cpp en CLI se pueden anotar o extender grandes colecciones de secuencias UCI antes de pasarlas a un motor de ajedrez convencional para su validacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de perplejidad, precision de prediccion de movimientos, tasa de jugadas legales ni comparaciones con otros modelos de ajedrez. Los resultados de busqueda web proporcionados no contienen ningun dato tecnico ni referencia evaluable sobre este modelo.

| Benchmark | Resultado |
|---|---|
| Perplejidad (cualquier cuantizacion) | no disponible |
| Precision de prediccion de movimientos | no disponible |
| Tasa de movimientos legales | no disponible |
| Comparativas con otros motores o modelos | no disponible |

## Requisitos de hardware

- VRAM para FP16: aproximadamente 1,5 GB solo de pesos; con el contexto de 1024 tokens y el overhead de llama.cpp, el consumo total se situa por encima de 2 GB.
- VRAM para Q8_0: aproximadamente 800 MB de pesos segun la model card.
- VRAM para Q4_K_M: no indicada por el autor. Como referencia derivada del numero de parametros (762M), la huella esperable en 4 bits es del orden de 0,5 GB, pero se trata de una estimacion y no de un dato publicado.
- GPU recomendadas: el modelo cabe en cualquier GPU de consumo con 2-4 GB o mas de memoria (por ejemplo, GTX 1050/1650, RTX 3050/3060, RTX 4090). No se justifica el uso de A100 o H100 para un modelo de este tamano salvo por motivos de agregacion de cargas; no se documentan ventajas de rendimiento en ese hardware.
- Inferencia en CPU: viable y es el escenario principal declarado por el autor. En los ejemplos se emplean 4 hilos (`n_threads=4`).
- Opciones de despliegue documentadas: llama.cpp (CLI `llama-cli`), Ollama (mediante `Modelfile` y `ollama create`) y llama-cpp-python.
- Opciones de despliegue no documentadas: vLLM, TGI, TensorRT-LLM u otros servidores de inferencia no aparecen mencionados en la informacion disponible.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo de respuesta.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni comparaciones con otros modelos. Cabe senalar que las alternativas mas conocidas en el ambito del ajedrez por computadora (Stockfish, Leela Chess Zero) no son modelos de lenguaje y no admiten una comparacion directa en terminos de parametros, contexto o licencia. Tampoco se dispone de datos de otros modelos de lenguaje especializados en notacion UCI que permitan establecer una comparativa fiable.

| Modelo | Parametros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| Nebium-Large-GGUF | 762M | 1024 tokens | MIT | no disponible | GGUF en HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Dominio extremadamente restringido: no es un modelo de chat ni de proposito general. No soporta instrucciones en lenguaje natural, tool calling ni razonamiento multi-paso.
- Contexto limitado a 1024 tokens, lo que reduce la longitud de las partidas o lineas que se pueden condicionar de una sola vez.
- Riesgo alto de generar movimientos ilegales: no se documenta ningun mecanismo de validacion contra las reglas del ajedrez ni contra la posicion actual. Cualquier uso en produccion deberia validar las jugadas con un motor independiente.
- Riesgo de alucinacion en el sentido de continuaciones plausibles pero incorrectas o fuera de la distribucion de las partidas de entrenamiento.
- Sesgos desconocidos: no se documenta el origen del dataset de entrenamiento (fuente, periodo, nivel de los jugadores, cobertura de aperturas), por lo que no se pueden evaluar sesgos sistematicos hacia determinadas lineas.
- Idiomas: la etiqueta `en` de la model card no refleja una capacidad linguistica real; el vocabulario esta orientado a notacion UCI y no hay evidencia de generacion de texto en ingles general.
- Licencia MIT: permite uso comercial y modificacion sin restricciones declaradas, pero el autor no especifica la procedencia ni la licencia de los datos de entrenamiento, lo que traslada al usuario el riesgo legal asociado a esa opacidad.
- Ausencia de validacion externa: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin resultados de benchmarks ni evaluaciones de terceros.
- Metadatos de HuggingFace: las fechas de creacion y actualizacion indican septiembre de 2026, posteriores a la fecha habitual de publicacion de modelos; conviene verificar la coherencia de los metadatos si se va a citar el repositorio.
- Ausencia de informacion sobre fases de alineacion (RLHF, DPO) y sobre el proceso de entrenamiento, lo que impide estimar la calidad de las continuaciones en posiciones poco frecuentes.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/nabin2004/nebium-large-gguf
- Pesos base en PyTorch: https://huggingface.co/nabin2004/nebium-large
- Codigo fuente del framework: https://github.com/nabin2004/nebium
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.ai
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante sobre el modelo en los resultados proporcionados (unicamente paginas de ayuda de Google Translate y servicios de Google, sin relacion con el modelo).

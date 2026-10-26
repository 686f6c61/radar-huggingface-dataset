# cfahlgren1/Qwen3.5-4B-layers0-11

## Resumen

`cfahlgren1/Qwen3.5-4B-layers0-11` es un checkpoint truncado de Qwen3.5-4B publicado por el desarrollador cfahlgren1. No es un modelo generativo: contiene unicamente las 12 primeras capas de decodificador (de 32) del modelo base, con los pesos sin modificar, y carece de cabeza de salida util. Su unico proposito es servir de soporte a una sonda de direccion de rechazo (*refusal direction probe*) que lee el flujo residual a la entrada de la capa 11, de modo que no se necesita nada por encima de esa capa.

La motivacion es puramente practica: al recortar el modelo, el peso pasa de 9,3 GB a 3,7 GB y el Space de demostracion arranca mas rapido. El autor verifica que la proyeccion de la capa 11 sobre la direccion de rechazo coincide con la del modelo completo dentro del redondeo bf16 (2,8025 frente a 2,8207 con el mismo prompt).

Es relevante ahora porque ejemplifica una practica creciente en interpretabilidad: publicar artefactos derivados y ligeros (capas intermedias, activaciones, sondas) en lugar de obligar a descargar el modelo completo para reproducir un experimento de analisis de representaciones internas. No debe evaluarse como un modelo de lenguaje, sino como un instrumento de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (tipo `qwen3_5_text`), truncado a las 12 primeras capas de 32; sin cabeza de generacion util |
| Parametros totales | 1.974.470.336 (aprox. 1,97 B, segun safetensors) |
| Longitud de contexto | No disponible para este checkpoint (irrelevante en la practica: no genera texto) |
| Tipos de cuantizacion | No disponible; pesos en bf16 sin versiones cuantizadas publicadas (sin GGUF ni AWQ/GPTQ) |
| Idiomas soportados | No disponible en la model card |
| Licencia | Apache-2.0 (enlace a la licencia del modelo base Qwen3.5-4B) |
| Formato de pesos | safetensors, cargable con `transformers`; tamano del repositorio 4,0 GB |
| Modelo base | Qwen/Qwen3.5-4B (relacion: `quantized` / truncado) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El checkpoint es un subconjunto literal del modelo base: las capas 0 a 11 de un transformer decoder-only de 32 capas, con los tensores copiados sin reentrenamiento ni modificacion alguna. No hay destilacion, pruning selectivo ni ajuste fino; el resto de capas y la cabeza de lenguaje se han descartado. El nombre de arquitectura declarado en los metadatos es `qwen3_5_text`, y el modelo se etiqueta como `quantized` respecto al base en el campo `base_model_relation`, aunque en la practica se trata de un truncado estructural.

No se proporciona informacion sobre datos de entrenamiento (numero de tokens, composicion del corpus, RLHF/DPO), porque el autor no entrena nada: hereda el comportamiento del modelo base en las capas conservadas. La unica validacion tecnica documentada es numerica: la proyeccion del estado residual de la capa 11 sobre la direccion de rechazo obtenida con el modelo completo reproduce el valor del checkpoint truncado dentro del error de redondeo bf16 (2,8025 frente a 2,8207). Esta comprobacion es la garantia de que la truncacion no altera la medida que la sonda pretende extraer.

## Capacidades

- Lectura de estados ocultos (*hidden states*) de las capas 0 a 11 del modelo Qwen3.5-4B, lo que permite reproducir experimentos de interpretabilidad sobre las capas tempranas.
- Extraccion de activaciones del flujo residual a la entrada de la capa 11, punto exacto que consume la sonda de direccion de rechazo publicada por el autor.
- Soporte para entrenar sondas lineales, clasificadores de activaciones y estudios de direcciones en el espacio de representaciones.
- Material ligero para formacion y docencia sobre flujo residual, geometria de activaciones y tecnicas de probing.
- No soporta generacion de texto: la model card indica explicitamente que "no puede generar texto" y que no hay cabeza de salida util sobre 12 capas.
- No hay soporte documentado de tool calling, agentes, vision, audio ni modo de razonamiento (dependerian del modelo base completo, no de este checkpoint).
- Capacidades multilingues: no disponibles como tales; el checkpoint no produce salida en ningun idioma.

## Casos de uso

- Sonda de direccion de rechazo: es el caso de uso para el que fue creado. Se carga el checkpoint, se ejecuta un forward pass sobre un prompt y se lee el estado residual de la capa 11 para proyectarlo sobre la direccion precalculada, replicando el resultado del modelo completo con un 40 % menos de memoria.
- Investigacion de seguridad y alineamiento: permite estudiar donde y como se codifica la negativa a responder en las capas tempranas sin necesidad de servir un modelo generativo, lo que simplifica la experimentacion con clasificadores de rechazo.
- Entrenamiento de sondas lineales y SAEs sobre capas tempranas: al conservar exactamente los pesos originales, las activaciones son comparables con las del modelo completo y sirven para entrenar clasificadores de conceptos o diccionarios dispersos sobre las 12 primeras capas.
- Reproducibilidad de experimentos de interpretabilidad: publicar o versionar un artefacto de 4 GB en lugar de 9,3 GB facilita que terceros repliquen el experimento y reduce el coste de almacenamiento y de CI en pipelines de evaluacion.
- Demo interactiva de bajo coste: el propio autor lo usa para que el Space de la sonda arranque mas rapido; cualquier aplicacion web de analisis de activaciones se beneficia del menor tiempo de carga y del menor consumo de VRAM.
- Analisis de sensibilidad numerica: util para medir el impacto del redondeo bf16 en las representaciones internas comparando las activaciones truncadas con las del modelo completo en el mismo prompt.
- Docencia y divulgacion: material practico para mostrar que es una direccion de activacion y como se proyecta un estado oculto, sin necesidad de infraestructura de inferencia generativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K y similares no aplican: el checkpoint no genera texto). La unica metrica documentada es la validacion de la proyeccion sobre la direccion de rechazo:

| Metrica | Modelo completo Qwen3.5-4B | Checkpoint layers 0-11 | Diferencia |
|---|---|---|---|
| Proyeccion de la capa 11 sobre la direccion de rechazo (mismo prompt) | 2,8207 | 2,8025 | 0,0182 (compatible con redondeo bf16) |

## Requisitos de hardware

- VRAM estimada para inferencia: los 1.974.470.336 parametros en bf16 ocupan aproximadamente 3,95 GB; con estados intermedios y overhead de ejecucion conviene reservar entre 5 y 6 GB.
- GPU recomendadas: cualquier GPU con 8 GB o mas para trabajar comodamente (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, L40S, A100). En GPUs de 4-6 GB puede requerir carga en bf16 con `device_map` parcial o ejecucion en CPU.
- Cabe en GPU de consumo: si, con holgura en tarjetas de 8 GB o superiores; el autor reporta una reduccion de 9,3 GB a 3,7 GB frente al modelo completo.
- Opciones de despliegue: `transformers` es la via soportada (carga con `AutoModel` y lectura de `hidden_states`). No hay version GGUF, por lo que llama.cpp y Ollama no aplican; vLLM y TGI estan orientados a servir generacion de texto y no tienen sentido sin cabeza de salida.
- Latencia y throughput: no disponibles. Al tratarse de un unico forward pass sobre 12 capas en lugar de 32, el coste por prompt es aproximadamente un tercio del del modelo completo en la misma precision, aunque no se publican mediciones.

## Comparativa con modelos similares

No se dispone de informacion sobre otros checkpoints truncados comparables en la documentacion proporcionada. La comparacion natural es con el modelo base del que se deriva:

| Modelo | Parametros | Capas | Generacion de texto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| cfahlgren1/Qwen3.5-4B-layers0-11 | 1.974.470.336 (1,97 B) | 12 de 32 | No | safetensors (bf16) | Apache-2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3.5-4B (base) | 4 B (segun nombre del modelo) | 32 | Si | safetensors | Apache-2.0 | HuggingFace |
| Checkpoints truncados alternativos | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje utilizable: la model card advierte de que no puede generar texto y que no existe una cabeza de salida aprovechable sobre 12 capas. Cualquier intento de usarlo como generador producira salidas sin sentido.
- Solo conserva informacion de las capas 0 a 11; los fenomenos que emergen en capas profundas (razonamiento abstracto, planificacion, conocimiento factual tardio) quedan fuera de su alcance.
- Las activaciones no son identicas bit a bit a las del modelo completo: la validacion reportada muestra una desviacion de 0,0182 en la proyeccion, atribuida al redondeo bf16. Los experimentos que requieran precision exacta deben usar el modelo completo.
- Sin datos de sesgo: al no generar texto no se han evaluado sesgos de salida, pero las representaciones heredadas del modelo base pueden contenerlos y afectar a las sondas entrenadas sobre ellas.
- Riesgo de malinterpretacion: una sonda de rechazo mide una direccion en el espacio de activaciones, no una garantia de comportamiento seguro del modelo base; extrapolar conclusiones de seguridad a partir de este artefacto seria incorrecto.
- Idiomas y contexto no documentados en la model card; no hay informacion sobre tokenizador propio ni sobre cobertura linguistica.
- Licencia Apache-2.0, que permite uso comercial del artefacto, pero el uso derive del modelo base Qwen3.5-4B y conviene revisar el fichero LICENSE enlazado en el repositorio de Qwen por si impone condiciones adicionales.
- Adopcion nula: 0 descargas y 0 likes en el momento del registro, sin revisión externa ni issues reportados. Fechas de creacion y actualizacion muy proximas (25 de octubre de 2026), lo que sugiere ausencia de validacion por terceros.
- No hay pruebas de que el checkpoint cargue sin ajustes en versiones de `transformers` que no reconozcan la arquitectura `qwen3_5_text`.

## Enlaces

- Repositorio del modelo: https://huggingface.co/cfahlgren1/Qwen3.5-4B-layers0-11
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Space de la sonda de direccion de rechazo: https://huggingface.co/spaces/cfahlgren1/refusal-direction

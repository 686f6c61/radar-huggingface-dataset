# minjaechoi/qwen36-35b-a3b-1p80bit-r11

## Resumen

Este repositorio contiene un checkpoint de investigación derivado de Qwen/Qwen3.6-35B-A3B en el que los expertos enrutados (routed experts) se han comprimido a una media de 1,80 bits, mientras que el resto de los pesos permanece en BF16. Lo publica el usuario minjaechoi bajo el identificador interno "r11" y se describe explícitamente como un "internal research checkpoint", no como un modelo listo para producción.

El modelo conserva el tamaño del base: 35.107.181.936 parámetros totales según los tensores safetensors, con un repositorio de 70,2 GB. La etiqueta `qwen3_5_moe` indica que se trata de una arquitectura de mezcla de expertos (MoE); el identificador del base, "A3B", sugiere del orden de 3.000 millones de parámetros activos, aunque la model card no lo confirma. La longitud de contexto no está documentada.

Su relevancia es metodológica: demuestra que es posible almacenar los pesos ya dequantizados en tensores BF16 y cargarlos con `transformers` o vLLM estándar, sin necesidad de kernels de cuantización personalizados. El interés práctico está en evaluar hasta qué punto una compresión tan agresiva (1,80 bits por experto enrutado) degrada las capacidades del modelo base, algo que este repositorio no cuantifica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), inferido a partir de la etiqueta `qwen3_5_moe`; no detallado en la model card |
| Parametros totales | 35.107.181.936 (dato real de los tensores safetensors) |
| Parametros activos | no disponible (el identificador "A3B" del modelo base sugiere ~3.000 millones, sin confirmacion documental) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 1,80 bits de media (compresion interna); resto de pesos en BF16. Pesos almacenados dequantizados en tensores BF16. No se publican variantes GGUF ni AWQ/GPTQ |
| Idiomas soportados | no disponible |
| Licencia | "sigue la licencia del modelo base"; la licencia del base no figura en la informacion proporcionada |
| Formato de pesos | safetensors (libreria `transformers`) |
| Modelo base | Qwen/Qwen3.6-35B-A3B |
| Modalidad declarada | image-text-to-text y text-generation (segun etiquetas del repositorio) |
| Tamano del repositorio | 70,2 GB |
| ID interno | r11 |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-17 |

## Arquitectura y entrenamiento

La model card solo indica que se trata de un checkpoint derivado de Qwen/Qwen3.6-35B-A3B en el que los expertos enrutados tienen una media de 1,80 bits y "every other weight is BF16". La etiqueta `qwen3_5_moe` confirma que la arquitectura de partida es una mezcla de expertos, coherente con el esquema de nomenclatura del base (35B totales, A3B activos). No se documenta el numero de expertos, el numero de expertos activos por token, la dimension oculta, el numero de capas ni el mecanismo de enrutamiento.

Tampoco se especifica el proceso de compresion: no hay informacion sobre el dataset de calibracion, la tecnica de cuantizacion aplicada a los expertos, el numero de tokens de entrenamiento, ni si hubo etapas de RLHF, DPO o ajuste fino posterior. Lo unico verificable es el resultado: los pesos se guardan dequantizados en BF16, de modo que la inferencia se ejecuta con kernels estandar y la decodificacion no requiere rutas de codigo especificas. No se documenta ninguna innovacion adicional como atencion lineal, decodificacion especulativa o modos de razonamiento extendido.

## Capacidades

- Generacion de texto: el pipeline declarado es `text-generation` y el repositorio incluye la etiqueta `conversational`, por lo que se espera uso conversacional y de generacion libre.
- Procesamiento de imagen y texto: la etiqueta `image-text-to-text` sugiere entrada multimodal, aunque la model card no describe ningun modulo de vision ni su resolucion de entrada.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que el repositorio sigue el formato esperado por los endpoints de HuggingFace.
- Carga en `transformers` y vLLM: confirmado explicitamente en la model card ("load with stock transformers / vLLM").
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: no documentadas; el campo de idiomas del repositorio esta vacio.
- Modos especiales (thinking, audio, vision detallada): no documentados, salvo la etiqueta multimodal ya citada.

## Casos de uso

- Evaluacion de compresion extrema de MoE: comparar este checkpoint con el base Qwen/Qwen3.6-35B-A3B en la misma bateria de tareas para medir la degradacion introducida por llevar los expertos enrutados a 1,80 bits. Es el uso principal al que apunta un checkpoint de investigacion como este.
- Investigacion sobre dequantizacion en BF16: analizar si almacenar los pesos ya dequantizados y ejecutar kernels estandar afecta al rendimiento numerico frente a mantener los formatos cuantizados con kernels dedicados.
- Servicio de inferencia con vLLM: al cargarse con vLLM sin parches, puede desplegarse en infraestructura existente para medir throughput real de un MoE de 35B con expertos comprimidos frente a la version BF16 completa.
- Prototipado de asistentes conversacionales en un entorno de investigacion: la etiqueta `conversational` y el pipeline `text-generation` permiten integrarlo en un chat multi-turno, siempre que la longitud de contexto (no documentada) se valide antes.
- Pruebas de pipelines multimodales: la etiqueta `image-text-to-text` permite experimentar con entradas de imagen y texto en un flujo tipo VLM, comprobando primero si el checkpoint conserva el proyector multimodal del base.
- Analisis de coste de almacenamiento y despliegue: con 70,2 GB de repositorio, sirve para estudiar compromisos entre huella en disco, VRAM necesaria y calidad resultante en un MoE de este tamano.
- Auditoria de reproducibilidad: al ser un checkpoint sin descargas ni validacion de la comunidad, es un caso util para documentar practicas de publicacion (falta de licencia explicita, de idiomas y de benchmarks) y sus riesgos en entornos productivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K, MMLU-Pro u otras), y los resultados de busqueda web proporcionados no contienen informacion tecnica relevante sobre el modelo: se limitan a enlaces de YouTube sin relacion con el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 ocupan aproximadamente 70,2 GB (coincide con el tamano del repositorio). Hay que sumar la cache KV y las activaciones, por lo que en la practica se necesita mas de 80 GB de VRAM total.
- GPU recomendadas: 2 x H100 80 GB o 2 x A100 80 GB con tensor parallelism es la configuracion mas segura. Una unica GPU de 80 GB queda muy al limite para los pesos mas el estado de inferencia.
- GPU de consumo: no cabe en tarjetas de 24 GB (RTX 4090, RTX 3090, etc.) ni de 48 GB. Requeriria offload parcial a RAM del sistema (~70 GB de memoria) con una penalizacion severa de latencia.
- Opciones de despliegue: `transformers` y vLLM, ambas citadas en la model card. No se publican conversiones GGUF, por lo que llama.cpp u Ollama no son utilizables directamente sin convertir los pesos. TGI no esta confirmado.
- Latencia y throughput estimados: no disponibles. Al ser un modelo MoE con muy pocos parametros activos por token (identificador A3B), el coste por token deberia ser inferior al de un denso de 35B, pero no hay mediciones publicadas que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| minjaechoi/qwen36-35b-a3b-1p80bit-r11 | 35.107.181.936 | no disponible | no disponible | safetensors BF16 (expertos a 1,80 bits) | sigue la del base, no explicitada | 0 descargas, 0 likes |
| Qwen/Qwen3.6-35B-A3B (base) | 35.107.181.936 (heredado) | no disponible | no disponible | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion |
| Alternativas de terceros de tamano y categoria similares | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables de otros modelos comparables dentro de la informacion proporcionada, y la busqueda web no devolvio resultados tecnicos utilizables.

## Limitaciones y advertencias

- Checkpoint de investigacion: la propia model card lo etiqueta como "internal research checkpoint", sin garantias de calidad ni de estabilidad para uso en produccion.
- Degradacion no cuantificada: la compresion de los expertos enrutados a 1,80 bits puede afectar a la calidad de las respuestas, pero no hay ningun benchmark publicado que permita medir el dano real frente al modelo base.
- Licencia ambigua: la model card indica que la licencia sigue a la del modelo base, pero el repositorio no declara ninguna licencia y la informacion disponible no incluye la del base. Esto bloquea cualquier decision de uso comercial sin consultar la licencia original de Qwen.
- Idiomas no documentados: el campo de idiomas esta vacio, por lo que no se puede asumir cobertura multilingue ni un castellano de calidad.
- Contexto desconocido: no se publica la longitud de contexto, dato critico para aplicaciones de documentos largos o conversaciones multi-turno extensas.
- Capacidades no verificadas: tool calling, razonamiento multi-paso, soporte de agentes y el modulo de vision (pese a la etiqueta `image-text-to-text`) no estan documentados.
- Riesgo de alucinacion y sesgos: no se ha publicado ninguna evaluacion de sesgos, seguridad o tasas de alucinacion; al estar basado en Qwen, hereda los sesgos de su corpus de entrenamiento, que no se describe.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, y sin resultados de benchmarks ni discusion externa localizada en la busqueda web.
- Metadatos con fecha de creacion 2026-09-17, posterior a la fecha habitual de consulta; conviene verificar la vigencia del repositorio antes de integrarlo.
- Requisitos de hardware elevados (mas de 80 GB de VRAM), lo que descarta cualquier prueba rapida en equipos de consumo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/minjaechoi/qwen36-35b-a3b-1p80bit-r11
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B

Nota: la busqueda web proporcionada no devolvio ningun enlace relevante (unicamente resultados de YouTube sin relacion con el modelo), por lo que no hay papers, blogs, repositorios ni demos adicionales que citar.

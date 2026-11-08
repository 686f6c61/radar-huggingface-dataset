# cookieshake/DNA3.1-27B-oQ6

## Resumen

DNA3.1-27B-oQ6 es una cuantización de 6 bits del modelo `dnotitia/DNA3.1-27B`, publicada por el usuario cookieshake bajo el identificador `cookieshake/DNA3.1-27B-oQ6`. Se trata de una conversión estándar realizada con la herramienta oMLX 0.7.3 en modo oQ con `oq_level=6`, grupo de 64 y cuantización afín, generada directamente desde una instantánea BF16 fijada del modelo original. El resultado son pesos compatibles con MLX, el framework de Apple para inferencia en silicio de la compañía (series M1 a M4).

El modelo base pertenece a la familia Qwen3.5 según los tags del repositorio y cuenta con 27.356.728.560 parámetros totales, lo que lo sitúa en la categoría de modelos densos de gran tamaño. La cuantización resultante ocupa 23,5 GB en el repositorio, con un tamaño efectivo de aproximadamente 6,8569 bits por parámetro fuente. El repositorio declara licencia Apache-2.0 y está etiquetado como modelo en coreano, aunque la información disponible no detalla la cobertura idiomática completa.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 27B en hardware Apple Silicon con un consumo de memoria notablemente inferior al de los pesos BF16 originales, manteniendo una precisión de 6 bits con 44 tensores sobrescritos a 8 bits para preservar capas sensibles. No obstante, la información publicada por el autor es limitada: no hay benchmarks amplios, no se detalla la composición del entrenamiento del modelo base y las validaciones realizadas son pruebas de humo muy acotadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5, según tags del repo) |
| Parámetros totales | 27.356.728.560 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 6 bits base con 44 overrides a 8 bits; group size 64; cuantización afín; ~6,8569 bits por parámetro efectivo |
| Idiomas soportados | Coreano declarado en tags; cobertura completa no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (5 shards, 2.180 entradas en el índice), compatible con MLX |

## Arquitectura y entrenamiento

El modelo base `dnotitia/DNA3.1-27B` es, según los tags del repositorio, un transformer de la familia Qwen3.5 con 27.356 millones de parámetros. La información disponible no especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. Tampoco se detalla si emplea innovaciones como decodificación especulativa, atención lineal o arquitecturas híbridas.

La contribución de este repositorio es exclusivamente la cuantización. El autor documenta el proceso con precisión: conversión desde la revisión fijada `aee853444ef2d1d1fe2fa56e4c2073d8f393b139` del snapshot BF16, usando oMLX 0.7.3 con `oq_level=6`, `group_size=64`, `enhanced=false` y cuantización afín. El config generado declara `bits=6` como precisión base y aplica 44 overrides de precisión mixta a 8 bits sobre tensores concretos. La validación estructural confirma que los cinco shards están presentes y que las claves safetensors coinciden con el índice de 2.180 entradas.

## Capacidades

- Generación de texto y respuesta a instrucciones en coreano, según las pruebas de humo documentadas (respondió `서울, 5` a una pregunta de capital y aritmética, y reprodujo exactamente la cadena `oQ6_LOCAL_OK`).
- Razonamiento aritmético básico combinado con conocimiento factual, verificado en la prueba de humo mencionada.
- Seguimiento de formato de salida estricto, según la prueba de reproducción literal de cadena.
- Compatibilidad con el runtime MLX de Apple Silicon, lo que habilita ejecución local en macOS.
- Capacidades adicionales del modelo base (código, matemáticas, tool calling, agentes, multilingüismo, visión) no están documentadas en la información disponible y no pueden confirmarse para esta cuantización concreta.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el formato MLX y los 23,5 GB del repositorio permiten cargar el modelo en equipos con memoria unificada suficiente (por ejemplo, Mac Studio o MacBook Pro con 32 GB o más), sin depender de GPUs dedicadas.
- Asistentes conversacionales en coreano: el modelo está etiquetado para ese idioma y las pruebas de humo confirman respuesta coherente en coreano, lo que lo hace adecuado para prototipos de atención al cliente o asistentes internos en ese idioma.
- Procesamiento por lotes en local para tareas de generación de texto donde la privacidad impide enviar datos a la nube: al ejecutarse íntegramente en el equipo, los datos no salen del dispositivo.
- Evaluación comparativa de cuantizaciones: útil para investigadores que quieran medir la degradación de un modelo de 27B al pasar de BF16 a 6 bits con overrides a 8 bits en MLX.
- Desarrollo y pruebas de pipelines MLX: sirve como modelo de referencia para validar integraciones con la librería omlx y el runtime MLX antes de desplegar variantes mayores.
- Reproducción de experimentos de cuantización: el autor documenta el comando exacto (`POST /admin/api/oq/start` con `oq_level=6`, `group_size=64`, `enhanced=false`) para replicar el proceso sobre el mismo snapshot BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo documenta dos pruebas de humo cualitativas (respuesta `서울, 5` y reproducción exacta de `oQ6_LOCAL_OK`) y advierte explícitamente que "these limited checks are not a broad quality evaluation". No hay datos de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otras cuantizaciones del mismo modelo.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 23,5 GB, por lo que se necesita al menos esa cantidad de memoria disponible para cargar los pesos, más overhead del runtime MLX y del contexto. En la práctica, se recomienda un mínimo de 32 GB de memoria unificada.
- GPU recomendadas: exclusivamente Apple Silicon (series M1, M2, M3, M4 y variantes Pro, Max y Ultra). No es compatible con GPUs NVIDIA, AMD ni con CPU convencional, ya que requiere el runtime MLX.
- ¿Cabe en GPU de consumo? Sí, en el sentido de que cabe en equipos Apple con memoria unificada de 32 GB o superior; no aplica a GPUs de consumo tipo RTX 4090, que no ejecutan MLX.
- Opciones de despliegue: runtime MLX y la librería omlx 0.7.3 o superior. No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni SGLang para estos pesos concretos.
- Latencia y throughput: no disponibles. El autor advierte que las diferencias de hardware y runtime pueden afectar a la reproducibilidad bit a bit.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Runtime |
|---|---|---|---|---|---|
| cookieshake/DNA3.1-27B-oQ6 | 27,36B | No disponible | 6 bits (8 bits en 44 tensores) | Apache-2.0 | MLX |
| dnotitia/DNA3.1-27B (base) | 27,36B | No disponible | BF16 | Apache-2.0 | Genérico |
| Otras cuantizaciones del mismo base | 27,36B | No disponible | No disponible | Apache-2.0 | No disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes, ni de información sobre modelos alternativos de tamaño similar con los que establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- La información publicada por el autor es mínima: no hay benchmarks amplios, ni evaluación de calidad más allá de dos pruebas de humo, lo que impide garantizar el comportamiento en producción.
- La cuantización a 6 bits con overrides a 8 bits puede degradar la precisión respecto al BF16 original; el autor no cuantifica esa degradación.
- El modelo está etiquetado como coreano y las pruebas de humo son en ese idioma; el rendimiento en castellano u otros idiomas no está verificado.
- Riesgo de alucinación inherente a los modelos de lenguaje, no evaluado específicamente para esta cuantización.
- Sesgos conocidos: no documentados en la información disponible.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base `dnotitia/DNA3.1-27B` en su repositorio original, ya que la licencia de la cuantización se declara heredada del snapshot fuente.
- Compatibilidad limitada: solo funciona con MLX en Apple Silicon; no es desplegable en infraestructura NVIDIA ni en la mayoría de servidores cloud estándar.
- La reproducibilidad bit a bit no está garantizada según el propio autor, debido a diferencias de hardware y runtime.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/cookieshake/DNA3.1-27B-oQ6
- Modelo base: https://huggingface.co/dnotitia/DNA3.1-27B
- Snapshot fuente fijado: https://huggingface.co/dnotitia/DNA3.1-27B/tree/aee853444ef2d1d1fe2fa56e4c2073d8f393b139
- Modelos fine-tuned del base en Hugging Face: https://huggingface.co/models?other=base_model%3Afinetune%3Adnotitia%2FDNA3.1-27B
- Perfil del autor en Ollama: https://ollama.com/cookieshake

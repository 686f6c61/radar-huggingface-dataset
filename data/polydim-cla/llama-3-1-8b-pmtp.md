# polydim-cla/llama-3.1-8b-pmtp

## Resumen

`polydim-cla/llama-3.1-8b-pmtp` es un artefacto experimental publicado por Ariel García Traba (POLYDIM-EINSOF Research Initiative) que se presenta como un adaptador geométrico sobre `meta-llama/Llama-3.1-8B`. No es un modelo entrenado desde cero ni un modelo completo: el repositorio ocupa 0,3 GB, un orden de magnitud por debajo de los ~16 GB que ocuparían los pesos de un transformer de 8 000 millones de parámetros en fp16, lo que es coherente con un checkpoint parcial o un conjunto de tensores inyectados. La propuesta del autor consiste en una proyección sobre la variedad de Stiefel St(4096, 2048) que reduce la dimensión del modelo de 4096 a 2048 y se inyecta en la capa 16 de la red base.

El interés del artefacto es, por tanto, de investigación en representaciones latentes y manipulación del espacio de activaciones, no de uso en producción. El autor lo etiqueta con conceptos como `continuous-thought`, `stiefel-manifold` y `pmtp`, y describe un mecanismo de comunicación entre procesos denominado `PmtpShmBus` con "0 tokens de texto serializados". Esta terminología no es estándar en la literatura y la model card no incluye especificación técnica del mecanismo, ni detalles de entrenamiento, ni resultados de evaluación.

En el momento de redactar esta ficha el repositorio registra 0 descargas y 0 likes, no declara pipeline y no publica benchmarks. Todo lo que se puede afirmar con rigor sobre su comportamiento es lo heredado de Llama 3.1 8B; cualquier capacidad atribuida al adaptador (incluido el "razonamiento continuo" implícito en los tags) está sin verificar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador geométrico sobre transformer decoder denso (Llama 3.1 8B); proyección Stiefel St(4096, 2048) sobre S^(2047), inyectada en la capa 16 |
| Parametros totales | No disponible para el adaptador (repositorio de 0,3 GB); la base Llama 3.1 8B tiene ~8,03 B |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; la base Llama 3.1 8B soporta 128 000 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible; la base Llama 3.1 declara 8 idiomas (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | apache-2.0 (segun la model card); ver advertencia sobre la licencia del modelo base en la seccion de limitaciones |
| Formato de pesos | safetensors |
| Dimension del modelo base | d_model = 4096 |
| Dimension canonica tras proyeccion | 2048 |
| Defecto de Frobenius de Stiefel | 4,525e+01 (acumulador Neumaier en FP64, segun el autor) |
| Capa de inyeccion | 16 |

## Arquitectura y entrenamiento

La arquitectura descrita consiste en un Llama 3.1 8B sin modificar en su topología y una intervención en la capa 16: las activaciones de dimensión 4096 se proyectan sobre una subvariedad de Stiefel de dimensión 2048, es decir, se restringen a un marco ortonormal de 2048 vectores en un espacio de 4096. El autor cuantifica la desviación respecto de la ortogonalidad ideal mediante un defecto de Frobenius de 4,525e+01 calculado con un acumulador compensado de Neumaier en FP64, un detalle de implementación numérica poco habitual en model cards de adaptadores. El resto de la descripción (`PmtpShmBus`, "Zero-Worm IPC", "tensor telepathy" con cero tokens de texto serializados) apunta a un bus de memoria compartida entre procesos para transferir tensores sin serialización textual, pero la card no documenta protocolo, formato de mensaje ni API.

No hay información sobre el proceso de entrenamiento: no se indica número de tokens, composición del dataset, si hubo ajuste supervisado, RLHF, DPO u optimización directa sobre la variedad, ni hiperparámetros, ni duración, ni hardware empleado. Tampoco se especifica si la proyección es fija (por ejemplo, inicializada aleatoriamente con filas ortonormalizadas) o aprendida. Para reproducir el artefacto habría que inspeccionar los tensores de safetensors del repositorio y el código del repositorio de GitHub del autor, que es la única fuente adicional enlazada. Cualquier afirmación sobre "pensamiento continuo" queda, a día de hoy, en el terreno de la etiqueta y no de la evidencia.

## Capacidades

- Generación de texto: heredada del modelo base Llama 3.1 8B, pero no verificada tras la inyección de la capa 16; no hay evaluación publicada.
- Razonamiento y matemáticas: sin datos. La etiqueta `continuous-thought` sugiere la intención de explorar razonamiento en espacio latente, no un resultado medido.
- Código: sin datos.
- Tool calling / function calling: no documentado en la model card; Llama 3.1 8B lo soporta de forma nativa en su versión Instruct, no así el checkpoint base.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Multilingüismo: no documentado para el adaptador.
- Modo "thinking" o latente: es la dirección que declara el autor con `pmtp` y `continuous-thought`, sin especificación ni métricas.
- Capacidad especial declarada: comunicación tensorial entre procesos vía `PmtpShmBus` sin serializar tokens de texto; sin documentación técnica disponible.

## Casos de uso

- Investigación en interpretabilidad de capas intermedias: el artefacto permite estudiar qué ocurre al comprimir las activaciones de la capa 16 de un Llama 3.1 8B de 4096 a 2048 dimensiones sobre una base ortonormal, comparando la perplejidad y la geometría de los embeddings antes y después de la proyección.
- Reproducción de experimentos geométricos: útil para un grupo que quiera replicar el cálculo del defecto de Frobenius con acumulación compensada y validar si 4,525e+01 se corresponde con la desviación real de las matrices publicadas.
- Estudio de métodos de "razonamiento latente": sirve como punto de partida para comparar intervenciones en el espacio de activaciones frente a enfoques de cadena de pensamiento explícita, siempre que se construya una evaluación propia.
- Prototipado de buses de tensores entre procesos: el componente `PmtpShmBus` puede interesar a quien investigue paso de tensores por memoria compartida sin serialización, aunque requeriría leer el código del repositorio de GitHub para conocer la implementación.
- Docencia y divulgación sobre geometría diferencial aplicada a redes neuronales: la variedad de Stiefel y las proyecciones ortonormales son un caso concreto y citable para explicar restricciones geométricas en pesos y activaciones.
- Base para adaptadores experimentales derivados: al ocupar 0,3 GB, es barato de versionar y de combinar con otras intervenciones sobre el mismo checkpoint base en un pipeline de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y el repositorio no declara evaluación alguna. Tampoco se aportan cifras de latencia o throughput del adaptador ni del bus `PmtpShmBus`.

## Requisitos de hardware

- VRAM para inferencia: depende enteramente del checkpoint base, ya que el adaptador añade 0,3 GB. Llama 3.1 8B en fp16 requiere del orden de 16 GB de VRAM más caché KV; en int8, unos 8-9 GB; en cuantizaciones de 4 bits, unos 5-6 GB.
- GPU recomendadas: A100 40/80 GB o H100 para fp16 con contexto largo y serving concurrente; L40S o RTX 4090 (24 GB) para fp16 con contexto moderado; RTX 3090/4080 (16-24 GB) para cuantización int8.
- GPU de consumo: sí, cabe en RTX 4090, 3090, 4080 y en tarjetas de 12 GB si se usa cuantización de 4 bits, siempre que se cargue el modelo base y no solo el adaptador.
- Opciones de despliegue: vLLM y TGI para el modelo base en fp16; llama.cpp y Ollama para versiones cuantizadas (el autor cita la etiqueta `llama3.1:8b` de Ollama como referencia del base). El adaptador en sí no declara compatibilidad con ninguno de estos servidores; requeriría código propio de carga e inyección en la capa 16.
- Latencia y throughput: no disponibles. No hay mediciones del sobrecoste de la proyección en la capa 16 ni del bus IPC.
- Almacenamiento: 0,3 GB para el repositorio del adaptador, más el peso completo del modelo base descargado aparte.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| polydim-cla/llama-3.1-8b-pmtp | No disponible (repo de 0,3 GB) sobre base de ~8,03 B | No disponible (base: 128 000) | Adaptador geométrico experimental | apache-2.0 segun card | HuggingFace, 0 descargas, sin evaluación |
| meta-llama/Llama-3.1-8B | ~8,03 B | 128 000 tokens | Transformer decoder denso, preentrenado | Llama 3.1 Community License | Ampliamente disponible y desplegable en vLLM, TGI, llama.cpp |
| meta-llama/Llama-3.1-8B-Instruct | ~8,03 B | 128 000 tokens | Transformer decoder denso, ajustado por instrucciones | Llama 3.1 Community License | Ampliamente disponible, con benchmarks publicados por Meta |
| Mistral-7B-Instruct-v0.3 | ~7,2 B | 32 000 tokens | Transformer decoder denso, ajustado por instrucciones | Apache 2.0 | Ampliamente disponible |

La comparación relevante no es de rendimiento sino de naturaleza: los tres últimos son modelos completos con evaluación pública y tooling estándar; este repositorio es una intervención experimental sobre uno de ellos, sin métricas y con un formato de carga no estandarizado. Como alternativa dentro de la misma línea de investigación (razonamiento en espacio latente en lugar de tokens intermedios) existen trabajos académicos de "continuous thought", pero no se dispone de datos comparativos en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni comparación con el modelo base, ni ablación que aísle el efecto de la proyección en la capa 16. No se puede afirmar que el adaptador preserve las capacidades de Llama 3.1 8B.
- Terminología no estándar y sin respaldo publicado: "Zero-Worm IPC", "tensor telepathy" y `PmtpShmBus` no se acompañan de especificación, paper ni referencia académica. Conviene tratarlos como nombres internos del autor, no como técnicas establecidas.
- Riesgo alto de alucinación y degradación: una proyección de 4096 a 2048 dimensiones en una capa intermedia altera el flujo residual; sin datos de perplejidad no hay forma de saber si el modelo sigue siendo funcional.
- Conflicto de licencias: la card declara apache-2.0, pero el modelo base Llama 3.1 8B se distribuye bajo la Llama 3.1 Community License, que impone condiciones adicionales (incluida la cláusula de nombre y el umbral de 700 millones de usuarios mensuales). El uso comercial del derivado debe atenerse a la licencia del base con independencia de lo que declare el adaptador.
- Idiomas: no documentados. Cualquier uso en castellano es una extrapolación del comportamiento del base, no una capacidad declarada.
- Contexto: no documentado para el adaptador; no hay garantía de que la ventana de 128 000 tokens del base siga siendo utilizable tras la intervención.
- Reproducibilidad: sin hiperparámetros, sin dataset, sin script de entrenamiento en la información disponible; la única vía es inspeccionar los tensores y el repositorio de GitHub del autor.
- Madurez: 0 descargas, 0 likes, creado y actualizado en el mismo día. No hay señales de uso por terceros ni de mantenimiento.
- No apto para producción: sin servidor compatible, sin cuantizaciones publicadas y sin pruebas de carga.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/polydim-cla/llama-3.1-8b-pmtp
- Repositorio de código del autor (POLYDIM_EINSOF): https://github.com/AGT1973/POLYDIM_EINSOF
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Licencia del modelo base (Llama 3.1 Community License): https://huggingface.co/meta-llama/Llama-3.1-8B/blob/main/LICENSE

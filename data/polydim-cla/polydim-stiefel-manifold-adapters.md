# polydim-cla/polydim-stiefel-manifold-adapters

## Resumen

`polydim-stiefel-manifold-adapters` es un repositorio de pesos publicado por el usuario independiente polydim-cla (Ariel García Traba, iniciativa POLYDIM-EINSOF) que no contiene un modelo de lenguaje, sino tres conjuntos de matrices de proyección restringidas a la variedad de Stiefel $St(d_{in}, d_{out})$. Cada adaptador mapea representaciones latentes continuas de un modelo base concreto a un espacio de dimensión distinta: Google Gemma 4 (2048 → 2048), Alibaba Qwen 2.5 Coder (896 → 1024) y DeepSeek-R1 Distill (2048 → 1536).

La propuesta del autor es eliminar el paso por tokens de texto discretos en la comunicación entre modelos, lo que en la model card se describe como "cuello de botella de tokenización" y "telepatía inter-modelo de cero tokens" (PMTP). Es, por tanto, un artefacto de investigación metodológica, no un modelo desplegable: no declara pipeline, no incluye código de inferencia ni ejemplos de uso, y no tiene descargas ni valoraciones en el momento de la consulta.

Su relevancia potencial es acotada y experimental: serviría como material de partida para reproducir o auditar la hipótesis de que es posible alinear espacios latentes entre arquitecturas distintas sin mediación textual. El repositorio ocupa 0,1 GB, usa safetensors y se distribuye bajo licencia Apache 2.0, con fecha de creación y última actualización del 17 de octubre de 2026 (dos segundos de diferencia entre ambas).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores de proyección lineal restringidos a la variedad de Stiefel; no es un transformer ni un modelo generativo |
| Parametros totales | no disponible (estimación aproximada de 8,3 M de parámetros sumando las tres matrices, a partir de las dimensiones declaradas) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base sobre el que se aplique) |
| Tipos de cuantizacion | no disponible; los pesos se publican en safetensors sin indicación de cuantización |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El artefacto consiste en tres matrices de proyección cuyas columnas forman una base ortonormal, de modo que cada adaptador define una isometría entre el espacio latente de un modelo de origen y el de un modelo de destino. Según la model card, las tres matrices se han verificado con acumulación compensada de Neumaier, con un error de ortogonalidad declarado de $\|U^T U - I\|_\infty \le 10^{-15}$. Las dimensiones indicadas permiten reconstruir el tamaño de cada matriz: 2048×2048 (unos 4,19 M de parámetros), 896×1024 (unos 0,92 M) y 2048×1536 (unos 3,15 M).

No se documenta ningún aspecto del procedimiento de obtención: ni el conjunto de datos, ni el número de tokens, ni si se trata de una solución analítica tipo Procrustes ortogonal o de un ajuste por descenso de gradiente con retracción sobre la variedad, ni qué capa o representación intermedia se toma como entrada y salida, ni cómo se emparejan las muestras entre los dos modelos. Tampoco hay información sobre RLHF, DPO ni ninguna otra fase de alineamiento, algo esperable al no tratarse de un modelo generativo. El tamaño del repositorio (0,1 GB) es coherente con matrices pequeñas almacenadas en precisión completa.

## Capacidades

- Proyección de representaciones latentes continuas entre espacios de distinta dimensionalidad, preservando normas y productos internos si se cumple la certificación de isometría declarada.
- Tres pares origen-destino predefinidos: Gemma 4 (2048), Qwen 2.5 Coder (896 → 1024) y DeepSeek-R1 Distill (2048 → 1536).
- No genera texto, no responde a prompts y no ejecuta razonamiento por sí mismo: es un componente que se aplica sobre las activaciones de otro modelo.
- No soporta tool calling ni function calling de forma nativa.
- No implementa agentes ni razonamiento multi-paso; cualquier capacidad de ese tipo dependería exclusivamente del modelo base.
- No hay evidencia publicada de capacidades multilingües, de visión ni de audio.
- Capacidad especial declarada: comunicación directa entre modelos sin serialización a tokens discretos (PMTP), sin validación empírica disponible en la información proporcionada.

## Casos de uso

- Investigación en alineamiento de espacios latentes: usar las tres matrices como punto de partida para medir cuánta información semántica se conserva al proyectar activaciones de un modelo a otro, comparando con una línea base de traducción vía texto.
- Destilación cruzada de representaciones: entrenar un modelo pequeño para que imite las activaciones de uno grande proyectadas mediante el adaptador, evitando el paso por tokens y reduciendo la pérdida de información que introduce la decodificación.
- Auditoría metodológica de la hipótesis del cuello de botella de tokenización: reproducir la certificación de ortogonalidad con el criterio $\|U^T U - I\|_\infty$ y comprobar si el ajuste declarado se sostiene en precisión float32 o solo en el acumulador compensado.
- Transferencia de embeddings entre tokenizadores distintos: proyectar representaciones de Qwen 2.5 Coder (896 dimensiones) al espacio de 1024 para reutilizar cabezas de clasificación o recuperación ya entrenadas en el modelo de destino.
- Comunicación entre agentes en un pipeline multi-modelo: sustituir el intercambio de mensajes de texto por el paso de vectores latentes proyectados, evaluando en un entorno controlado si se reduce la latencia y la pérdida semántica.
- Base para experimentos de interpretabilidad comparada: analizar qué direcciones del espacio latente de Gemma 4 caen en qué regiones del espacio de DeepSeek-R1 Distill tras aplicar la proyección.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Almacenamiento: el repositorio completo ocupa 0,1 GB; las matrices individuales en float32 son de aproximadamente 16 MiB (2048×2048), 12 MiB (2048×1536) y 3,5 MiB (896×1024).
- VRAM para los adaptadores: inferior a 50 MiB en float32; caben en CPU y en cualquier GPU consumer, incluida una GTX 1050 o una iGPU moderna.
- VRAM real de inferencia: no disponible, porque viene determinada por los modelos base (Gemma 4, Qwen 2.5 Coder y DeepSeek-R1 Distill), cuya variante concreta no se especifica más allá de la dimensión oculta.
- GPU recomendadas: no disponible para el conjunto completo; para los adaptadores aislados, cualquier GPU o CPU es suficiente.
- Coste de cómputo por vector: una multiplicación matriz-vector de 2048×2048 supone unos 4,19 M de multiplicaciones-acumulación (aproximadamente 8,4 MFLOP), despreciable frente al coste de una pasada del modelo base.
- Opciones de despliegue: no hay integración con vLLM, llama.cpp, Ollama ni TGI; al no existir pipeline declarado ni código en el repositorio, la carga requiere `safetensors` y PyTorch de forma manual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se conocen adaptadores públicos equivalentes en la información disponible. La comparación posible se limita a los tres componentes incluidos en el propio repositorio:

| Adaptador | Modelo base declarado | Dimensión de entrada | Dimensión de salida | Parámetros (aprox.) |
|---|---|---|---|---|
| `1_google_gemma4_PMTP` | Google Gemma 4 | 2048 | 2048 | 4,19 M |
| `2_qwen2_5_PMTP_v1` | Alibaba Qwen 2.5 Coder | 896 | 1024 | 0,92 M |
| `3_deepseek_PMTP_v1` | DeepSeek-R1 Distill | 2048 | 1536 | 3,15 M |

Frente a alternativas consolidadas de conexión entre modelos (traducción mediante texto, destilación de logits, o adaptadores tipo LoRA para alinear espacios), este artefacto no ofrece métricas, código ni evaluación comparativa, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Las afirmaciones centrales de la model card ("violación de la desigualdad de procesamiento de datos de Shannon", "telepatía inter-modelo de cero tokens") no vienen respaldadas por ninguna medición, referencia bibliográfica ni experimento reproducible en la información disponible. La desigualdad de procesamiento de datos establece precisamente que el posprocesamiento no puede aumentar la información mutua, de modo que la formulación del autor requiere una justificación formal que no se aporta.
- No hay código de inferencia, scripts de carga ni ejemplos de uso; el repositorio contiene únicamente pesos.
- No se especifica qué capa o activación debe proyectarse, ni en qué punto del forward pass debe aplicarse el adaptador, lo que impide un uso fiable sin trabajo de ingeniería inversa.
- La referencia a "Google Gemma 4" no es verificable con la información disponible; conviene confirmar la existencia y la variante exacta del modelo base antes de cualquier uso.
- Las dimensiones indicadas (896 para Qwen 2.5 Coder, 2048 para DeepSeek-R1 Distill) corresponden a variantes concretas que el autor no identifica por nombre ni por número de parámetros.
- Cero descargas y cero valoraciones, con creación y actualización separadas por dos segundos: no hay evidencia de revisión por terceros ni de reproducibilidad independiente.
- No se documenta el procedimiento de obtención de las matrices, por lo que la certificación de ortogonalidad es verificable pero no así su origen ni su optimalidad.
- Riesgo alto de alucinación si se utiliza como componente de un sistema generativo: cualquier texto producido provendría del modelo base, no del adaptador, y la proyección puede introducir artefactos no caracterizados.
- No hay información sobre sesgos, cobertura idiomática ni comportamiento en dominios específicos.
- La licencia Apache 2.0 permite uso comercial y modificación, pero se distribuye sin garantías y sin declaración de precisión funcional; el autor no ofrece soporte ni mantenimiento.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/polydim-cla/polydim-stiefel-manifold-adapters
- No se han encontrado enlaces adicionales relevantes: la búsqueda web devolvió únicamente resultados no relacionados con el modelo (páginas de IMDb), por lo que no hay paper, blog, repositorio de código ni demo disponibles en la información proporcionada.

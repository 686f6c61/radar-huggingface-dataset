# ltzheng/Qwen3.5-9B-General-Game-Stage3-Shuffled

## Resumen

Qwen3.5-9B General Game Stage3 — Shuffled es un checkpoint de ajuste fino (fine-tuning) de la familia Qwen3.5, con 9 mil millones de parametros, publicado por el usuario ltzheng en HuggingFace. El modelo parte del checkpoint Stage1 (paso 12000) del mismo autor y se ha reentrenado sobre seis conjuntos de datos historicos de la etapa Stage3, reescritos fisicamente en HDFS tras aplicar una permutacion completa con semilla 42. El objetivo declarado es el entrenamiento de un agente de juego con capacidades de razonamiento, orientado a videojuegos como Genshin Impact, Cyberpunk 2077 y Spider-Man 2.

El repositorio no es un modelo final consolidado, sino un experimento de entrenamiento: la rama `main` contiene unicamente la descripcion del experimento y los pesos reales se distribuyen en revisiones independientes, una por checkpoint, publicadas cada 12 horas. Esto lo convierte en material de investigacion para estudiar el efecto del barajado de datos (data shuffling) y del reinicio del estado del optimizador sobre el rendimiento en tareas de agente.

La relevancia actual es acotada: se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, sin model card detallada sobre capacidades, sin licencia declarada y sin resultados de evaluacion publicados. Es util como referencia para quienes investigan el ajuste fino de modelos Qwen para agentes de juego, pero no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, segun el tag `qwen3_5`) |
| Parametros totales | 9B (9 mil millones, segun el nombre del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato estandar de HuggingFace para `transformers`; no confirmado explicitamente) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de un checkpoint Qwen3.5 de 9B, una arquitectura transformer decoder-only. El autor no detalla la arquitectura interna en la model card; solo indica la libreria (`transformers`) y la familia (`qwen3_5`). El entrenamiento parte del checkpoint Stage1 en el paso 12000, con el optimizador, el estado del generador de numeros aleatorios (RNG) y los cursores de datos reiniciados para este experimento.

El proceso de datos es el elemento diferencial: los seis conjuntos de datos historicos de Stage3 se barajan fisicamente y se reescriben en HDFS mediante la implementacion de permutacion completa de Stage1 con semilla 42, preservando la particion de validacion original. Las semillas de entrenamiento y de datos son ambas 42, con mezcla independiente por lector de datos distribuido (`dp_rank_v1`). Los datos de razonamiento de Genshin, Cyberpunk 2077 y Spider-Man 2 se usan con 5 pasadas; los de instruccion general de juegos, con 0,2 pasadas. Se excluyen las publicaciones de razonamiento mas recientes del 30 de octubre. El schedule de learning rate mantiene 30 pasos de calentamiento seguidos de decaimiento coseno de 2e-5 a 1e-6. No se menciona RLHF, DPO ni ninguna innovacion de decodificacion.

## Capacidades

- Generacion de texto y razonamiento de proposito general, heredados del modelo base Qwen3.5-9B.
- Razonamiento orientado a agentes de juego, con datos especificos de Genshin Impact, Cyberpunk 2077 y Spider-Man 2.
- Instrucciones generales de videojuegos (conjunto de datos de instruccion general de juegos).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: el tag `game-agent` sugiere orientacion a agentes, pero no se detalla el mecanismo.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Investigacion sobre barajado de datos en ajuste fino: el modelo permite comparar el efecto de una permutacion completa con semilla fija frente al experimento Stage3 original, al mantener la misma base Stage1 y un schedule de learning rate identico.
- Reproducibilidad de experimentos de agente de juego: al fijar semillas de entrenamiento y datos a 42 y publicar checkpoints cada 12 horas, sirve para replicar curvas de aprendizaje en tareas de razonamiento sobre videojuegos.
- Estudio de reinicio del estado del optimizador: al reiniciar optimizador, RNG y cursores, es un caso de analisis de como afecta la perdida de estado acumulado al rendimiento final.
- Generacion de razonamiento sobre Genshin Impact: los datos de este juego se usan con 5 pasadas, por lo que el modelo esta expuesto intensivamente a dominios de ese titulo, util para prototipos de asistentes de juego.
- Base para ajuste fino posterior: al ser un checkpoint intermedio de 9B en formato `transformers`, puede servir como punto de partida para experimentos propios de la comunidad.
- Evaluacion de mezcla de datos por pasadas: la combinacion de 5 pasadas en razonamiento y 0,2 en instruccion permite estudiar el equilibrio entre datos de razonamiento y de instruccion en modelos de 9B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia orientativa para un modelo denso de 9B en `transformers`, la carga en precision completa (fp16/bf16) requeriria del orden de 18 GB solo para pesos, mas memoria para el contexto; en cuantizacion de 8 bits, alrededor de 9-10 GB, y en 4 bits, alrededor de 5-6 GB. Estas cifras son estimaciones generales de la categoria y no datos confirmados del modelo.
- GPU recomendadas: no disponible. Por tamano, un modelo de 9B en bf16 encaja en GPU de 24 GB (RTX 4090, A10G, L4 con cuantizacion) y en A100/H100 para despliegues de mayor throughput.
- Cabe en consumer GPU: probablemente si en GPUs de 24 GB con cuantizacion, pero no confirmado por el autor.
- Opciones de despliegue: la libreria declarada es `transformers`; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de HuggingFace. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ltzheng/Qwen3.5-9B-General-Game-Stage3-Shuffled | 9B | no disponible | no disponible | HuggingFace, checkpoints por revision |
| ltzheng/Qwen3.5-9B-General-Game-Stage3 | 9B | no disponible | no disponible | HuggingFace |
| ltzheng/Qwen3.5-9B-General-Game-Stage1-3Shift-Shuffled | 9B | no disponible | no disponible | HuggingFace (modelo base) |

No se dispone de datos de rendimiento ni de contexto para establecer una comparacion cuantitativa con alternativas de la misma categoria. La comparativa se limita a los checkpoints del mismo autor, que comparten base y difieren en la estrategia de datos y el estado del entrenamiento.

## Limitaciones y advertencias

- No se declara licencia, lo que impide determinar si el uso comercial esta permitido; debe consultarse con el autor antes de cualquier uso en produccion.
- El repositorio es un experimento de entrenamiento en curso: la rama `main` no contiene pesos, sino la descripcion del experimento; los pesos estan en revisiones de checkpoint concretas.
- No hay model card con detalles de arquitectura, contexto, idiomas ni evaluacion, lo que limita la evaluacion previa a su uso.
- Riesgo de alucinacion: no evaluado ni documentado por el autor.
- Sesgos conocidos: no documentados; al entrenarse sobre datos de videojuegos concretos, puede presentar sesgos hacia esos dominios.
- Limitaciones de contexto e idioma: no disponibles.
- Al ser un checkpoint intermedio con reinicio de optimizador y cursores, su rendimiento puede no ser representativo de un modelo final convergido.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso o validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ltzheng/Qwen3.5-9B-General-Game-Stage3-Shuffled
- Modelo base (Stage1 checkpoint 12000): https://huggingface.co/ltzheng/Qwen3.5-9B-General-Game-Stage1-3Shift-Shuffled/tree/91cf571a75f6d735f674bdef4ba3331d89a6e518
- Experimento Stage3 original: https://huggingface.co/ltzheng/Qwen3.5-9B-General-Game-Stage3

# LuisContreras73/music-generation

## Resumen

`LuisContreras73/music-generation` es un repositorio de pesos publicado por Luis Contreras que agrupa cinco modelos autorregresivos entrenados desde cero para modelar piano simbólico. No se trata de un único modelo, sino de cuatro familias de arquitectura —LSTM, Music Transformer, un Perceiver autorregresivo y dos variantes de la receta LLaMA (contexto de 1024 y de 2048 tokens)— comparadas sobre el mismo corpus, la misma tokenización y el mismo protocolo experimental. Cada checkpoint tiene entre 23,7 M y 25,8 M de parámetros y pesa entre 91 y 98 MB.

El problema que aborda es metodológico: medir por separado lo que cada modelo predice y lo que cada modelo genera. El resultado principal es que el modelo con mejor verosimilitud (`estilo_llama_ctx2048_24ep`, NLL de validación 1,5035 nats/token) obtiene la peor puntuación de generación libre (45,6), mientras que el LSTM, con la peor NLL (2,0389), alcanza la mejor (70,5). Es una replicación sobre música simbólica del resultado de Theis, van den Oord y Bethge (arXiv:1511.01844).

Los checkpoints no son autocontenidos: dependen del código del repositorio de GitHub para la tokenización y las arquitecturas. El corpus de entrenamiento (10 604 piezas, 714,7 h de piano interpretado) no se redistribuye y la licencia no está declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cuatro familias autorregresivas: LSTM, Music Transformer (atención relativa), Perceiver autorregresivo y receta LLaMA (RoPE, RMSNorm pre-norma, SwiGLU, QK-norm opcional) |
| Parametros totales | 25,8 M en cuatro de los cinco checkpoints; 23,7 M en `lstm` |
| Parametros activos | No aplica (ninguno de los modelos es MoE) |
| Longitud de contexto | 1024 tokens (~78 s de música) o 2048 tokens (~154 s), según el checkpoint |
| Tipos de cuantizacion | No disponible; solo se publican checkpoints sin variantes cuantizadas |
| Idiomas soportados | Etiqueta `es` en el repositorio; el modelo no procesa lenguaje natural, opera sobre piano-roll simbólico |
| Licencia | No disponible |
| Formato de pesos | PyTorch (`<modelo>/best.pt`, con pesos, configuración y estado de los RNG) más `<modelo>/config.json` |
| Tarea | Modelado autorregresivo de piano-roll de ataques `[T, 88]`, binario, a 20 Hz |
| Tokenizacion | `NOTE_ON`×88 + `SHIFT`×64 + `PAD`/`BOS`/`EOS` = 155 símbolos, biyectiva |
| Corpus de entrenamiento | 10 604 piezas, 714,7 h de piano interpretado, particiones por pieza (no redistribuido) |
| Variables no modeladas | Velocity, duración, pedal, compás y tempo |
| Numero de checkpoints | 5 (de 16 experimentos del laboratorio) |
| Tamano del repositorio | 0,5 GB |
| Fecha de publicacion | 14 de septiembre de 2026 |

## Arquitectura y entrenamiento

Los cinco checkpoints comparten tarea, tokenización y protocolo de evaluación, pero difieren en la arquitectura. El `lstm` es una red recurrente clásica; `music_transformer` implementa atención relativa; `perceiver_ar` aplica un esquema Perceiver autorregresivo; y los dos `estilo_llama_*` emplean la receta de LLaMA (RoPE, RMSNorm pre-norma, SwiGLU, QK-norm opcional) entrenada desde cero con un vocabulario musical de 155 símbolos. El prefijo «estilo» es explícito en la model card: no hay ningún peso de LLaMA real involucrado. La entrada es un piano-roll binario de ataques de dimensión `[T, 88]` muestreado a 20 Hz, y la tokenización es biyectiva, de modo que la reconstrucción del piano-roll es exacta.

El corpus consta de 10 604 piezas y 714,7 h de piano interpretado, con particiones realizadas por pieza para evitar fuga de información entre entrenamiento y validación. Los checkpoints se seleccionan por el menor `val_bpt` (bits por paso en validación). No se documenta en la información disponible el uso de RLHF, DPO ni ninguna fase de ajuste por preferencias: son modelos entrenados por máxima verosimilitud. La model card advierte además que la ventaja observada de la receta LLaMA no está aislada, porque ese par de modelos no comparte presupuesto de tokens ni augmentación con el resto, y el experimento de control está definido pero sin ejecutar.

## Capacidades

- Generación de música simbólica de piano: produce piano-roll de ataques que se exporta a `.mid`, `.wav`, `.npz` y `.png`.
- Generación desde cero (`--scratch`) y continuación a partir de un prefijo, con el mismo conjunto de 16 prefijos del split de test para todos los modelos.
- Muestreo reproducible: la semilla atraviesa el muestreo y el payload del checkpoint incluye el estado de los RNG, de modo que dos ejecuciones con la misma semilla producen el mismo fichero.
- Modelado autorregresivo con contexto de 1024 tokens (~78 s de música) o 2048 tokens (~154 s), según el checkpoint.
- Capacidad de reconstrucción exacta del piano-roll gracias a una tokenización biyectiva de 155 símbolos.
- No soporta tool calling ni function calling, no implementa modo agente ni razonamiento multi-paso, y no tiene capacidades de visión, audio (más allá de la síntesis posterior del MIDI) ni procesamiento de lenguaje natural.
- No modela velocity, duración de nota, pedal, compás ni tempo.

## Casos de uso

- Prototipado musical rápido: generar fragmentos de piano en formato MIDI editable para bocetos de bandas sonoras o maquetas, aprovechando que la salida `.mid` se abre directamente en cualquier DAW.
- Continuación de fragmentos existentes: dado un prefijo de piano-roll, el modelo completa la pieza, una tarea para la que la model card publica `gen_score` medido exactamente sobre 16 prefijos del split de test.
- Generación de datos sintéticos de piano-roll: el pipeline produce `.npz` con el piano-roll reconstruido, útil para aumentar datasets de investigación en modelado musical simbólico.
- Investigación en evaluación de modelos generativos: el repositorio permite replicar con código y pesos la divergencia entre verosimilitud y calidad de generación (Theis et al., arXiv:1511.01844) en el dominio musical.
- Docencia y comparación de arquitecturas: los cinco checkpoints comparten tokenización y protocolo, por lo que sirven como banco de pruebas controlado entre LSTM, atención relativa, Perceiver y receta LLaMA con tan solo 23,7–25,8 M de parámetros.
- Pruebas de regresión reproducibles: al incluir el estado de los RNG en el checkpoint y fijar la semilla, la generación es determinista, lo que permite usarla como caso de test en un pipeline de integración continua.
- Estudio de música para piano a escala: el corpus de 714,7 h y las particiones por pieza permiten analizar estilos pianísticos, siempre que se obtenga el corpus original por separado, ya que no se redistribuye.
- Composición asistida con restricciones de recursos: los modelos caben en cualquier GPU de consumo e incluso en CPU, así que pueden ejecutarse en portátiles para sesiones de composición offline.

## Benchmarks y rendimiento

Datos publicados en la model card del propio repositorio:

| Modelo | NLL val (nats/token) | bits/paso | gen_score con prefijo | gen_score libre |
|---|---|---|---|---|
| `estilo_llama_ctx2048_24ep` | 1,5035 | 1,5172 | 49,3 ± 2,4 | 45,6 |
| `estilo_llama_24ep` | 1,5788 | 1,5815 | 74,4 ± 15,3 | 38,0 |
| `perceiver_ar` | 1,7017 | 1,7046 | 50,6 ± 2,6 | 29,3 |
| `music_transformer` | 1,8244 | 1,8276 | 64,3 ± 22,6 | 29,3 |
| `lstm` | 2,0389 | 2,0424 | 78,9 ± 3,0 | 70,5 |

Referencias incluidas por el autor: la línea base trivial se sitúa en 4,0921 bits/paso y los fragmentos reales del corpus obtienen un `gen_score` de 87,6. El `gen_score` con prefijo se mide con los mismos 16 prefijos del split de test y tres semillas de muestreo para todos los modelos. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark de lenguaje, ya que el modelo no procesa texto.

## Requisitos de hardware

- VRAM estimada: los 25,8 M de parámetros ocupan en torno a 100 MB en fp32 y unos 52 MB en fp16/bf16. Con las activaciones de un contexto de 2048 tokens y lote pequeño, el consumo se mantiene holgadamente por debajo de 1 GB. Es una estimación derivada del número de parámetros, no una medida publicada.
- GPU recomendadas: cualquier GPU de consumo moderna es suficiente; por ejemplo, una RTX 3060, 4060 o superior, e incluso tarjetas mucho más antiguas. Las A100 o H100 no aportan ventaja relevante por el tamaño del modelo.
- Inferencia en CPU: viable, dado el tamaño de 23,7–25,8 M de parámetros.
- Cabe en GPU de consumo: sí, en todas las gamas actuales, con margen amplio.
- Opciones de despliegue: no hay soporte documentado en vLLM, TGI, llama.cpp ni Ollama, ya que las arquitecturas son personalizadas y dependen del código del repositorio. El único camino soportado es `scripts/infer.py` del repositorio de GitHub, previa descarga de los pesos con `huggingface_hub`. Cualquier exportación a otros formatos requeriría trabajo de conversión no documentado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Comparación interna entre los cinco checkpoints publicados (mismo corpus, misma tokenización, mismo protocolo):

| Modelo | Parametros | Contexto | NLL val | gen_score libre | Licencia |
|---|---|---|---|---|---|
| `lstm` | 23,7 M | 1024 tokens | 2,0389 | 70,5 | No disponible |
| `estilo_llama_ctx2048_24ep` | 25,8 M | 2048 tokens | 1,5035 | 45,6 | No disponible |
| `estilo_llama_24ep` | 25,8 M | 1024 tokens | 1,5788 | 38,0 | No disponible |
| `perceiver_ar` | 25,8 M | 1024 tokens | 1,7017 | 29,3 | No disponible |
| `music_transformer` | 25,8 M | 1024 tokens | 1,8244 | 29,3 | No disponible |

Referencia externa declarada por el autor:

| Modelo | Parametros | Contexto | NLL publicado | Vocabulario y dato | Licencia |
|---|---|---|---|---|---|
| Music Transformer (Google) | No disponible | No disponible | 1,84 | 388 símbolos con velocity, corpus MAESTRO | No disponible |

El propio autor advierte de que esa NLL de 1,84 no es comparable con las de esta tabla, porque una NLL por token depende del vocabulario y del corpus. La comparación entre `gen_score` de este repositorio y el de modelos externos no es posible con los datos disponibles, ya que la métrica se calcula sobre 16 prefijos concretos del split de test de este laboratorio.

## Limitaciones y advertencias

- Predecir mejor no es generar mejor: el checkpoint con menor NLL (`estilo_llama_ctx2048_24ep`) obtiene peor `gen_score` libre que el LSTM, que tiene la NLL más alta. Elegir por verosimilitud puede degradar el resultado musical.
- El `gen_score` mide estadísticos marginales, no coherencia musical: un modelo puede ajustar todos los histogramas y sonar incoherente. La validación real exige un test de escucha humano, como en el paper de Music Transformer.
- La comparación de NLL con cifras publicadas de otros modelos no es válida: el vocabulario (155 símbolos sin velocity) y el corpus difieren de los de Music Transformer (388 símbolos con velocity sobre MAESTRO).
- La ventaja de la receta LLaMA no está aislada experimentalmente: los dos modelos `estilo_llama_*` no comparten presupuesto de tokens ni augmentación con el resto, y el experimento de control está pendiente de ejecución.
- El modelo no representa velocity, duración de nota, pedal, compás ni tempo, por lo que las interpretaciones generadas carecen de dinámica y articulación explícitas.
- Los checkpoints no son autocontenidos: sin el código del repositorio de GitHub no se pueden cargar ni interpretar correctamente.
- Riesgo de seguridad al cargar: `registry.load_checkpoint` usa `weights_only=False` porque el payload incluye el estado de los RNG. Solo deben cargarse si se confía en el origen.
- Licencia no declarada: no hay autorización explícita de uso comercial, lo que supone un riesgo legal para producción.
- El corpus de entrenamiento no se redistribuye, ni en HuggingFace ni en GitHub: los pesos se publican con fines académicos y de reproducibilidad del laboratorio.
- La composición estilística del corpus no se detalla más allá de «piano interpretado», por lo que el sesgo estilístico y cultural del modelo no está caracterizado en la información disponible.
- Riesgo de alucinación musical: como modelo autorregresivo, puede producir secuencias sintácticamente válidas en el vocabulario pero musicalmente incoherentes, sin que exista una métrica publicada que detecte ese fallo.
- Idiomas: la etiqueta del repositorio es `es`, pero el modelo no procesa lenguaje natural; la etiqueta no implica capacidades multilingües de texto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/LuisContreras73/music-generation
- Repositorio de código en GitHub: https://github.com/LuisContreras73/music-generation
- Informes del laboratorio: https://github.com/LuisContreras73/music-generation/tree/main/docs
- Paper citado en la model card: https://arxiv.org/abs/1511.01844
- No se han encontrado resultados relevantes en la búsqueda web: los enlaces devueltos corresponden a la University of South Africa y no guardan relación con el modelo.

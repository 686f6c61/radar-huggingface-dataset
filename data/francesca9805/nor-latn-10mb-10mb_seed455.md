# francesca9805/nor-latn-10mb-10mb_seed455

## Resumen

nor-latn-10mb-10mb_seed455 es un ajuste fino supervisado (SFT) del modelo goldfish-models/nor_latn_10mb, un modelo monolingüe de la familia Goldfish orientado al noruego escrito en alfabeto latino y entrenado sobre un corpus de 10 MB. Lo publica el usuario de HuggingFace francesca9805 y se ha generado con TRL 0.23.0 sobre Transformers 4.56.2 y PyTorch 2.11.0. Con 39.087.104 parámetros reales (verificados en los safetensors), es un modelo decoder-only de tipo GPT-2 de tamano muy reducido.

El sufijo seed455 del nombre sugiere que el modelo forma parte de una bateria de experimentos repetidos con distintas semillas, y el proyecto de Weights & Biases asociado se llama "new_tokenizers", lo que apunta a un estudio comparativo sobre tokenizadores o sobre el efecto de la semilla en el ajuste. La model card no documenta el objetivo del experimento ni el conjunto de datos de ajuste, por lo que se trata de un artefacto de investigacion mas que de un modelo listo para produccion.

Su relevancia es acotada pero clara: sirve como caso de estudio reproducible de ajuste de un modelo de menos de 40 millones de parametros para una lengua de bajos recursos, y como referencia para comparar el efecto del fine-tuning sobre un checkpoint base muy pequeno. No hay benchmarks publicados, no tiene descargas ni likes, y la licencia no esta declarada, de modo que cualquier uso comercial deberia ir precedido de una evaluacion propia y de una aclaracion legal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (segun el tag `gpt2` y el modelo base) |
| Parametros totales | 39.087.104 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No documentados por el autor; al ser safetensors, admite conversion a GGUF (Q8, Q4, etc.) con llama.cpp |
| Idiomas soportados | Noruego en alfabeto latino, inferido del identificador `nor_latn`; no confirmado en la model card |
| Licencia | No disponible (la model card incluye el marcador de plantilla `licence: license`) |
| Formato de pesos | safetensors |

Otros datos tecnicos: tamano del repositorio 0,9 GB, pipeline `text-generation`, etiquetas `text-generation-inference` y `endpoints_compatible`, creado el 11 de octubre de 2026 y actualizado el mismo dia. Framework de entrenamiento: TRL 0.23.0, Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4, Tokenizers 0.22.1.

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de tipo GPT-2, con atencion causal completa. No se dispone del numero de capas, cabezas de atencion, dimension del embedding ni longitud de contexto del checkpoint base en la informacion proporcionada. Con 39.087.104 parametros totales y una arquitectura GPT-2, una fraccion muy elevada del computo corresponde a las matrices de embedding y de proyeccion del vocabulario, lo que es coherente con un modelo de vocabulario reducido y cuerpo pequeno.

El entrenamiento consiste en un ajuste fino supervisado (SFT) con TRL sobre el checkpoint `goldfish-models/nor_latn_10mb`. No se documenta el numero de tokens de ajuste, la composicion del dataset, el numero de epocas, la tasa de aprendizaje ni si hubo fases posteriores de RLHF o DPO. El unico enlace de trazabilidad es una ejecucion de Weights & Biases en el proyecto `new_tokenizers` de la Universidad de Groningen. No se declara ninguna innovacion tecnica de inferencia (decodificacion especulativa, atencion lineal, atencion por ventanas deslizantes, etc.).

## Capacidades

- Generacion de texto autoregresiva en noruego, con el pipeline `text-generation` de Transformers.
- Seguimiento de instrucciones en formato conversacional, ya que el ejemplo oficial de la model card usa una lista de mensajes con `role` y `content`.
- Generacion condicionada por prompt largo (la ventana concreta no esta documentada).
- Capacidad multilingue: no acreditada; el modelo base es monolingue de noruego.
- Tool calling / function calling: sin soporte declarado.
- Uso como agente o razonamiento multi-paso: sin soporte declarado.
- Modo "thinking", vision, audio o cualquier otra modalidad: no disponible.
- Uso como checkpoint de partida para experimentos de ajuste adicionales.

## Casos de uso

- Investigacion sobre lenguas de bajos recursos: sirve como punto de comparacion reproducible para medir cuanto aporta el SFT sobre un corpus base de 10 MB en noruego, especialmente si se compara con otros valores de semilla de la misma bateria de experimentos.
- Estudio de tokenizadores: el proyecto de W&B asociado se llama `new_tokenizers`, de modo que el modelo puede emplearse para evaluar el impacto de distintas estrategias de tokenizacion en la perplejidad y la calidad del texto generado.
- Experimentos de reproducibilidad: con semilla fijada (455) y versiones de framework declaradas, es util para reproducir resultados de ajuste en entornos docentes o de investigacion.
- Docencia y practicas de ajuste fino: con menos de 40 millones de parametros, un ciclo completo de entrenamiento y evaluacion cabe en una GPU de gama media en minutos, lo que lo hace idoneo para aulas y tutoriales.
- Despliegue en el borde o sin conexion: el modelo ocupa pocas decenas de megabytes en cuantizacion de 8 o 4 bits, por lo que puede ejecutarse en CPU, en una Raspberry Pi o en un dispositivo movil para demostraciones de generacion de texto en noruego.
- Pruebas de infraestructura de servicio: al estar etiquetado como `text-generation-inference` y `endpoints_compatible`, sirve como carga de trabajo trivial para validar despliegues con TGI, vLLM o endpoints compatibles antes de pasar a modelos grandes.
- Generacion de texto auxiliar de bajo coste: borradores, relleno de plantillas o datos sinteticos en noruego para prototipos internos, siempre que se valide la calidad de la salida de forma manual.
- Comparacion de tecnicas de cuantizacion: su tamano permite medir la degradacion de perplejidad entre fp32, fp16, int8 e int4 en pocos minutos y con recursos minimos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

| Evaluacion | Resultado |
|---|---|
| MMLU | No disponible |
| HumanEval | No disponible |
| GSM8K | No disponible |
| Perplejidad en noruego | No disponible |
| Evaluaciones multilingues | No disponible |

El unico dato de seguimiento disponible es la ejecucion de Weights & Biases enlazada en la model card, que puede contener curvas de perdida de entrenamiento, pero no resultados de evaluacion comparables con otros modelos.

## Requisitos de hardware

- VRAM en fp32: aproximadamente 156 MB solo para los pesos; con activaciones y cache KV, por debajo de 1 GB en cualquier caso practico.
- VRAM en fp16 o bf16: aproximadamente 78 MB para los pesos.
- VRAM en int8: aproximadamente 39 MB; en int4, alrededor de 20 MB.
- Cache KV: el consumo depende de `n_layer`, `n_head` y `head_dim`, datos no disponibles en la informacion proporcionada.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluidas GTX 1050 Ti, GTX 1650, RTX 3050, RTX 3060, RTX 4090, A100 o H100. No requiere GPU dedicada.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo de los ultimos diez anos, y tambien en CPU y en dispositivos embebidos (Raspberry Pi 4/5, Apple Silicon).
- Opciones de despliegue: `transformers` con `pipeline` (ejemplo oficial de la model card), Text Generation Inference (etiqueta `text-generation-inference` presente), vLLM, y llama.cpp / Ollama previa conversion a GGUF.
- Latencia y throughput: no disponibles de forma medida. Por tamano, en una GPU moderna la generacion de 128 tokens nuevos es practicamente interactiva; en CPU el rendimiento depende del numero de hilos y de la cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| francesca9805/nor-latn-10mb-10mb_seed455 | 39.087.104 | No disponible | No disponible | Ajuste SFT con semilla 455 sobre el modelo base |
| goldfish-models/nor_latn_10mb | No disponible | No disponible | No disponible | Checkpoint base monolingue de noruego entrenado con 10 MB de texto |
| goldfish-models/nor_latn_100mb | No disponible | No disponible | No disponible | Variante Goldfish del mismo idioma con corpus de 100 MB |
| goldfish-models/nor_latn_1gb | No disponible | No disponible | No disponible | Variante Goldfish del mismo idioma con corpus de 1 GB |

No hay datos publicos de benchmarks para ninguno de estos checkpoints en la informacion disponible, por lo que la comparacion se limita al tamano del corpus de entrenamiento y a la naturaleza del ajuste. Respecto a modelos noruegos de mayor tamano (por ejemplo, variantes de 7B), la diferencia de escala es de dos ordenes de magnitud y no existe base comun de evaluacion proporcionada.

## Limitaciones y advertencias

- Corpus de entrenamiento extremadamente pequeno (10 MB): la competencia linguistica, el vocabulario y la coherencia a medio plazo son muy limitados por construccion.
- Riesgo elevado de alucinacion, repeticion de n-gramas y deriva tematica, especialmente en generaciones largas.
- Ausencia total de datos de evaluacion: no se puede afirmar nada sobre su calidad relativa sin medirla.
- No hay evidencia de alineacion de seguridad; no se documenta RLHF, DPO ni filtrado de contenidos, por lo que puede producir texto inapropiado o sesgado.
- Sesgos potenciales del corpus base: al ser un unico conjunto de 10 MB, puede sobrerrepresentar un dominio, un registro o un periodo temporal concreto.
- Limitacion idiomatica: modelo monolingue de noruego; no es adecuado para castellano ni para traduccion.
- Licencia no declarada: el campo `licence: license` de la model card es un marcador de plantilla sin valor legal. El uso comercial queda en un limbo juridico hasta que el autor o los titulares del modelo base lo aclaren.
- Herencia de licencia: al ser un derivado de `goldfish-models/nor_latn_10mb`, las condiciones del modelo base se aplican tambien a este checkpoint.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones que permitan contrastar su comportamiento.
- No apto para produccion sin una evaluacion propia previa: cualquier despliegue real deberia ir acompanado de un conjunto de pruebas en noruego con metricas de perplejidad, fidelidad y filtrado de salidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/nor-latn-10mb-10mb_seed455
- Modelo base: https://huggingface.co/goldfish-models/nor_latn_10mb
- Repositorio de TRL: https://github.com/huggingface/trl
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new_tokenizers/runs/a6bpyiwc
- Cita de TRL (von Werra et al., 2020): incluida en la model card del autor

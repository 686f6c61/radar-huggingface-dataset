# natzx94/potion-multilingual-128M-int8

## Resumen

potion-multilingual-128M-int8 es una versión cuantizada a 8 bits del modelo de embeddings estáticos multilingües minishlab/potion-multilingual-128M, desarrollado por The Minish Lab. La cuantización ha sido realizada por Marc Mayol (usuario natzx94) y reduce el tamaño del modelo de 512,4 MB a 130,1 MB manteniendo una similitud coseno de al menos 0,99996 respecto a los vectores originales en float32. Se trata de un modelo de embeddings estáticos basado en la librería model2vec, diseñado para tareas de similitud de frases y recuperación semántica.

El modelo original cubre 101 idiomas y se basa en una tabla de 500.353 vectores de tokens de 256 dimensiones. Su relevancia práctica radica en los casos donde se cargan múltiples instancias del modelo en memoria simultáneamente (por ejemplo, una por sesión de editor o agente de código): la versión int8 reduce el consumo de RAM a unos 128 MB por proceso y permite una carga casi instantánea (~3 ms con tokenizador precompilado). Es un reemplazo directo (drop-in) del original: mismo tokenizador, misma configuración y formato model2vec estándar, sin necesidad de cambiar código salvo el identificador del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings estáticos (model2vec), tabla de vectores de tokens |
| Parametros totales | 128.590.721 |
| Parametros activos | no disponible (no aplica, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (por fila, escala por token) |
| Idiomas soportados | Multilingüe (101 idiomas según el modelo base) |
| Licencia | MIT |
| Formato de pesos | safetensors (tensor `embeddings` en I8, escalas en tensor `weights`) |

## Arquitectura y entrenamiento

El modelo es un modelo de embeddings estáticos tipo model2vec: en lugar de un transformer completo, utiliza una tabla de 500.353 vectores de tokens de 256 dimensiones que se promedian mediante mean pooling para obtener el embedding de una frase. Esto elimina la coste computacional de la atención y hace la inferencia extremadamente rápida y ligera. El modelo base (minishlab/potion-multilingual-128M) fue creado por The Minish Lab; los detalles de su proceso de destilación y datos de entrenamiento se encuentran en su model card original y no se reproducen aquí.

La cuantización int8 se realizó fila a fila: para cada vector de token se calcula `scale = max(|row|) / 127` y el valor cuantizado es `round(row / scale)` limitado a [-127, 127]. La escala por fila se almacena en el tensor estándar `weights` (un float por token), que model2vec ya multiplica en cada fila durante el pooling, lo que permite cargar el modelo sin código personalizado tanto en Python como en Rust. El modelo original no incluía tensores `weights` ni `mapping`, por lo que no hubo que integrar nada adicional.

## Capacidades

- Generacion de embeddings estáticos de frases para similitud semántica (pipeline `sentence-similarity`).
- Cobertura multilingüe: hereda el soporte de 101 idiomas del modelo base potion-multilingual-128M.
- Inferencia muy rápida: al no tener capas de atención, la codificación es esencialmente una búsqueda en tabla y un promedio.
- Carga casi instantánea: aproximadamente 3 ms con vocabulario del tokenizador precompilado (frente a ~2 s del original), según la model card.
- Baja huella de memoria: ~128 MB de RAM por proceso cargado.
- Compatibilidad con las librerías model2vec (Python) y model2vec-rs (Rust) sin código adicional.
- No es un modelo generativo: no produce texto, no soporta tool calling, ni agentes, ni razonamiento multi-paso.

## Casos de uso

- Memoria semántica local para agentes de código: es el caso de uso declarado del autor; cada sesión de agente carga su propia instancia del modelo para recuperar contexto relevante con solo ~128 MB de RAM por proceso.
- Búsqueda semántica multilingüe en dispositivos con recursos limitados: la tabla de 130 MB permite ejecutar recuperación semántica en portátiles, máquinas virtuales pequeñas o entornos edge.
- Deduplicación y clustering de documentos: los embeddings estáticos permiten agrupar miles de frases en segundos gracias a la baja latencia de inferencia.
- Clasificación de intenciones en chatbots: los embeddings pueden alimentar un clasificador ligero (regresión logística, k-NN) para enrutar consultas de usuarios en múltiples idiomas.
- Detección de duplicados o consultas similares en sistemas de soporte: comparación por similitud coseno a gran escala sin GPU.
- Reranking de primer nivel en pipelines RAG: como recuperador rápido y barato antes de un reranker más pesado, reduciendo el conjunto de candidatos.
- Embeddings en aplicaciones Rust de alto rendimiento: gracias a model2vec-rs, se integra en servicios nativos sin dependencias de Python ni de PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MTEB u otros) en la información disponible para esta versión cuantizada. La model card remite a la model card del modelo original (minishlab/potion-multilingual-128M) para evaluaciones MTEB. El único dato de rendimiento publicado es la fidelidad de la cuantización:

| Verificacion | Resultado |
|---|---|
| model2vec-rs 0.3.0 (español, inglés, mixto) | coseno mínimo 0,99996 frente al original f32 |
| model2vec 0.10.0 Python (incluido japonés) | coseno 0,99997–0,99998 frente al original f32 |
| Tamaño de `model.safetensors` | 130,1 MB (frente a 512,4 MB en f32) |
| RAM al cargar (tabla de embeddings) | ~128 MB (frente a ~512 MB en f32) |

## Requisitos de hardware

- RAM: aproximadamente 128 MB por proceso para la tabla de embeddings; no requiere GPU.
- CPU: cualquier CPU moderna es suficiente; no hay requisitos de VRAM al ser un modelo de embeddings estáticos.
- Cabe holgadamente en cualquier equipo consumer, incluidos portátiles sin GPU dedicada y contenedores con límites de memoria bajos.
- Despliegue: librería model2vec en Python (pip install model2vec) o model2vec-rs en Rust; no requiere vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia: carga del modelo en ~3 ms con tokenizador precompilado (según model2vec-rs#68); latencia de codificación por frase en el orden de microsegundos a milisegundos en CPU (dato no publicado con exactitud).
- Throughput: muy alto para un modelo estático, aunque no se publican cifras concretas en la información disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| natzx94/potion-multilingual-128M-int8 | Embeddings estáticos (model2vec) | 130 MB (int8) | 101 | MIT | Drop-in del original, coseno ≥ 0,99996 |
| minishlab/potion-multilingual-128M | Embeddings estáticos (model2vec) | 512 MB (f32) | 101 | MIT | Modelo base, mayor precisión nominal y consumo |
| Modelos transformer de embeddings (p. ej. bge-m3, multilingual-e5) | Transformer | 1–2 GB+ | Multilingüe | Variable (MIT/Apache) | Mayor calidad en MTEB, pero órdenes de magnitud más lentos y pesados |

Frente a los modelos transformer de embeddings, potion-multilingual-128M-int8 sacrifica algo de calidad en tareas de similitud complejas a cambio de una inferencia decenas o cientos de veces más rápida y un consumo de memoria mínimo, lo que lo hace adecuado para recuperación a gran escala y entornos con muchos procesos concurrentes.

## Limitaciones y advertencias

- No es un modelo generativo: no puede responder preguntas, generar texto ni razonar; solo produce embeddings.
- Los embeddings estáticos (mean pooling de vectores de tokens sin atención) capturan peor el orden de las palabras y las relaciones sintácticas complejas que los modelos transformer, lo que puede degradar la calidad en tareas de similitud fina.
- La cuantización int8 introduce un error mínimo (coseno ≥ 0,99996), pero en aplicaciones muy sensibles a pequeñas diferencias de ranking conviene validar contra el original f32.
- No hay benchmarks MTEB publicados específicos para esta versión cuantizada en la información disponible.
- El modelo es una cuantización de terceros: todo el trabajo de modelado corresponde a The Minish Lab; para soporte del modelo base hay que acudir a su repositorio original.
- Licencia MIT: sin restricciones para uso comercial, aunque conviene atribuir a The Minish Lab como autores del modelo original.
- Los datos de carga (~3 ms) dependen del uso de model2vec-rs con vocabulario precompilado; en otras configuraciones los tiempos pueden diferir.

## Enlaces

- Modelo cuantizado: https://huggingface.co/natzx94/potion-multilingual-128M-int8
- Modelo original: https://huggingface.co/minishlab/potion-multilingual-128M
- Librería model2vec (Python): https://github.com/MinishLab/model2vec
- Librería model2vec-rs (Rust): https://github.com/MinishLab/model2vec-rs
- The Minish Lab (GitHub): https://github.com/MinishLab
- Proyecto Omoikane (caso de uso del autor): https://github.com/marcmayol/omoikane
- Issue sobre precompilación del tokenizador: https://github.com/MinishLab/model2vec-rs/issues/68

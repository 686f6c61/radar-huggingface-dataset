# fromziro/Maximus-v1.0-3M

## Resumen

Maximus-v1.0-3M es un modelo de lenguaje pequeno (SLM) de 2.993.797 parametros desarrollado por FromZero (autor: Paul Courneya) y publicado en HuggingFace bajo licencia Apache 2.0. Su propuesta no es competir en calidad de generacion, sino explorar eficiencia de parametros por debajo de la barrera de los 10 millones. Para ello emplea una arquitectura propia que intercala capas feed-forward SwiGLU con capas feed-forward Hadamard sin parametros, lo que permite apilar 18 capas con un presupuesto de parametros muy reducido.

El modelo se entreno sobre 8.000 millones de tokens de una mezcla diversa de texto web, material educativo, datos sinteticos, codigo normalizado y matematicas, con un ratio de aproximadamente 2.670 tokens por parametro, muy por encima del optimo Chinchilla (que situaria el punto optimo en torno a 60 millones de tokens para este tamano). La ventana de contexto nativa es de solo 320 tokens y el tokenizer es propio (DillionV2, vocabulario de 2.564 entradas), muy inferior a los vocabularios habituales de 32.000 a 128.000 tokens.

Es relevante ahora como artefacto de investigacion reproducible: permite estudiar el compromiso entre profundidad, tipo de FFN y calidad representacional en el regimen sub-10M, y sirve como banco de pruebas de bajo coste para pipelines de entrenamiento e inferencia que despues se escalan. Sus resultados de benchmarks (media de 36,30% en el conjunto publicado) lo situan en el rango de un modelo de capacidades muy limitadas, no apto para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con FFN intercaladas: 18 capas (9 SwiGLU + 9 Hadamard sin parametros), 4 cabezas de atencion, 2 KV heads (GQA), dimension por cabeza 36, RoPE theta 2500.0 |
| Parametros totales | 2.993.797 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 320 tokens (el autor indica que puede generar mas alla en inferencia) |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors; no se documentan variantes GGUF, AWQ, GPTQ ni int8/int4) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con codigo personalizado (custom_code); requiere trust_remote_code |
| Tamano oculto | 144 |
| Tamano de vocabulario | 2.564 (tokenizer DillionV2 personalizado) |
| Tamano de intermedio (FFN SwiGLU) | 384 |
| Tokens de entrenamiento | 8.000 millones |
| Descargas / likes | 0 descargas / 1 like |
| Tamano del repositorio | 0,0 GB (segun metadatos de HuggingFace) |
| Fechas | Creado el 2026-09-08, actualizado el 2026-09-14 |

## Arquitectura y entrenamiento

Maximus es un transformer decoder-only con una innovacion estructural concreta: en lugar de colocar bloques feed-forward densos en todas las capas, alterna entre FFN con SwiGLU (9 capas, capacidad intermedia de 384) y FFN Hadamard sin parametros (9 capas). La transformada de Hadamard es una operacion lineal ortogonal que no anade pesos aprendidos, de modo que el modelo gana profundidad sin incrementar el recuento de parametros. Con 18 capas y solo 2,99 millones de parametros, la profundidad media por parametro es alta para su escala. La atencion usa 4 cabezas de consulta y 2 cabezas de clave/valor (GQA), con 36 dimensiones por cabeza, y codificacion posicional rotatoria (RoPE) con theta de 2.500,0. El tokenizer es propio, denominado DillionV2, con un vocabulario de solo 2.564 entradas, lo que implica secuencias mas largas en tokens para el mismo texto y un limite practico reducido al combinarse con la ventana de 320 tokens.

El entrenamiento consumio 8.000 millones de tokens con la siguiente composicion: FineWeb-Edu (36,0%), DCLM Baseline 1.0 (22,9%), FinePhrase (13,4%), MGA FineWeb-Edu (10,3%), Tiny Strange Textbooks (8,2%), OpenMathInstruct-2 (7,6%) y NPset-2 Python-Edu (1,6%). La mezcla esta dominada por texto web filtrado por calidad educativa y datos sinteticos de libros de texto, con una porcion minoritaria de matematicas y codigo. La model card no documenta fases de RLHF, DPO, SFT ni decodificacion especulativa; tampoco detalla la composicion del corpus de instrucciones (o su ausencia), ni la estrategia de precision mixta o el hardware de entrenamiento. La relacion de 8.000 millones de tokens para 3 millones de parametros (unas 130 veces el punto optimo de Chinchilla) sugiere un regimen de sobrentrenamiento deliberado, habitual en modelos pequenos destinados a despliegue en el borde.

## Capacidades

- Generacion de texto en ingles: continuaciones y completados cortos, limitados por la ventana de 320 tokens.
- Razonamiento basico y sentido comun muy limitado: HellaSwag 28,01% y PIQA 55,33%, apenas por encima del azar.
- Aritmetica elemental incipiente: 34,50% en ArithMark-3, coheren con la presencia de OpenMathInstruct-2 (7,6%) en el corpus.
- Codigo: capacidad marginal, derivada de solo el 1,6% de datos de codigo Python (NPset-2 Python-Edu).
- Tool calling / function calling: no documentado en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado y poco viable con 3 millones de parametros y 320 tokens de contexto.
- Multilingue: no. El modelo declara unicamente ingles (language: en).
- Modo thinking, vision, audio o multimodalidad: no disponible.
- Capacidades especiales: ninguna declarada mas alla de la arquitectura personalizada y del tokenizer propio.

## Casos de uso

- Investigacion sobre eficiencia de parametros: el modelo permite hacer ablaciones controladas sobre el tipo de FFN (SwiGLU parametrica frente a Hadamard sin parametros) manteniendo constante el resto de la arquitectura, con un coste de entrenamiento lo bastante bajo como para repetir experimentos en un solo equipo.
- Docencia y divulgacion: sirve para ilustrar de forma tangible como se comporta un transformer completo (tokenizer, atencion con GQA, RoPE, FFN intercaladas) en un presupuesto de 12 MB en FP32, ejecutable en cualquier portatil y en cuadernos interactivos.
- Pruebas de humo (smoke tests) de infraestructura: al requerir codigo personalizado (trust_remote_code) y un tokenizer no estandar, es util para validar de extremo a extremo pipelines de descarga, carga con transformers, serializacion safetensors e inferencia en CI antes de desplegar modelos grandes.
- Generacion de texto en dispositivos embebidos: con 2,99 millones de parametros (unos 6 MB en FP16 y 12 MB en FP32) cabe comodamente en microcontroladores con memoria suficiente o en una Raspberry Pi, para completados de plantillas muy cortas sin conexion.
- Completado de formularios y campos de texto cortos: puede generar continuaciones de una o dos frases (por ejemplo, sugerencias de descripcion breve) siempre que la entrada y la salida quepan en 320 tokens, con supervision humana obligatoria.
- Baseline de comparacion para nuevos SLM: sirve como referencia minima en estudios que evalúen arquitecturas sub-10M con los mismos benchmarks (HellaSwag, ARC, PIQA, ArithMark-3).
- Prototipado de pipelines de entrenamiento distribuido: permite depurar el ciclo completo (tokenizacion, carga de shards, checkpointing, evaluacion) en minutos y sin GPU antes de escalar a modelos de mayor tamano.
- Experimentos de analisis de tokenizer: con un vocabulario de 2.564 entradas frente a los 32.000-128.000 habituales, es un caso de estudio para medir el efecto del tamano del vocabulario en la longitud de secuencia y en la calidad final.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card:

| Tarea | Resultado |
|---|---|
| HellaSwag | 28,01% |
| ARC-Easy | 31,10% |
| ARC-Challenge | 23,63% |
| PIQA | 55,33% |
| ArithMark-3 | 34,50% |
| Media | 36,30% |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en estas mismas tareas, ni datos de MMLU, GSM8K, HumanEval, MT-Bench u otros. La model card tampoco detalla la metodologia de evaluacion (numero de ejemplos, few-shot, plantilla de prompt). A modo de contexto y no como comparacion oficial: ARC-Challenge con 4 opciones tiene una linea base aleatoria del 25% y HellaSwag del 25%, por lo que los valores de este modelo estan muy proximos al azar en ambas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 12 MB en FP32 (2.993.797 parametros x 4 bytes), 6 MB en FP16/BF16 y 3 MB en int8 si se cuantizara manualmente. La cache KV es despreciable: 18 capas x 2 KV heads x 36 dimensiones x 2 (K y V) = 2.592 elementos por token, unos 5,1 KB por token en FP16 y unos 1,7 MB para los 320 tokens de contexto completo.
- GPU recomendadas: cualquiera, incluidas GTX 1050, integradas Intel/AMD y aceleradores de borde. No requiere A100, H100 ni RTX 4090; usarlas seria un desperdicio de recursos.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo de la ultima decada, y tambien en CPU, Raspberry Pi y moviles con memoria suficiente.
- Opciones de despliegue: transformers con trust_remote_code=True es la via documentada, al depender de arquitectura y tokenizer personalizados. No hay confirmacion de soporte en vLLM, llama.cpp, Ollama, TGI ni MLX, y la ausencia de variantes GGUF hace poco probable su uso directo en esas herramientas sin conversion manual.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de latencia, tokens por segundo ni hardware de referencia.
- Nota de verificacion: los metadatos indican un tamano de repositorio de 0,0 GB, lo que conviene comprobar descargando el modelo antes de asumir que los pesos estan completos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| Maximus-v1.0-3M | 2.993.797 | 320 tokens | Ingles | Apache 2.0 | Arquitectura personalizada con FFN Hadamard; 8B tokens de entrenamiento; benchmarks publicados en la propia model card |
| Pythia-14M (EleutherAI) | 14M | No disponible | Ingles | Apache 2.0 | Familia de referencia para estudios de interpretabilidad; tamano superior; benchmarks no comparados aqui |
| TinyStories-3M (Microsoft Research) | No disponible | No disponible | Ingles | No disponible | Orientado especificamente a narrativa infantil simple; sin datos comparativos publicados en la informacion disponible |
| SmolLM-135M (HuggingFace) | 135M | No disponible | Ingles | Apache 2.0 | Dos ordenes de magnitud mayor; categoria de SLM utilizable en produccion ligera |

No se dispone de datos de benchmarks homogeneos para establecer una comparacion cuantitativa fiable entre estos modelos y Maximus. Cualquier cifra de terceros deberia verificarse en las model cards originales antes de usarse.

## Limitaciones y advertencias

- Rendimiento proximo al azar en varias tareas: HellaSwag 28,01% y ARC-Challenge 23,63% frente a lineas base aleatorias del 25%, y PIQA 55,33%. La calidad de generacion es muy baja y no es apta para tareas de razonamiento.
- Riesgo de alucinacion muy alto: con 3 millones de parametros no hay capacidad de almacenar conocimiento factual de forma fiable; las afirmaciones generadas deben tratarse como texto plausible, no como hechos.
- Contexto extremadamente corto: 320 tokens nativos. El autor indica que puede generar mas alla, pero no garantiza coherencia ni calidad fuera de esa ventana, y no se documenta ninguna extension de contexto entrenada.
- Vocabulario reducido: 2.564 entradas implican mas tokens por palabra (mayor coste de secuencia) y una cobertura limitada de vocabulario, lo que penaliza especialmente terminos tecnicos y nombres propios.
- Solo ingles: no hay soporte multilingue declarado; el castellano no esta cubierto.
- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad ni alineacion. El corpus incluye texto web sin filtrar mas alla del filtrado educativo, por lo que se pueden heredar sesgos de esas fuentes.
- Ausencia de alineacion: no se mencionan fases de RLHF, DPO ni SFT, por lo que el modelo no sigue instrucciones ni respeta formatos conversacionales de forma previsible.
- Riesgo de seguridad por codigo remoto: el uso de custom_code con trust_remote_code=True implica ejecutar codigo Python del repositorio en la maquina local. Debe auditarse antes de cargarlo en entornos sensibles.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, pero la calidad del modelo hace inviable cualquier despliegue comercial orientado al usuario final sin un filtrado y una supervision intensivos.
- Trazabilidad de benchmarks: la model card no describe la metodologia de evaluacion, por lo que los resultados no son directamente comparables con los de otras fichas publicadas.
- Repositorio con 0 descargas y un unico like, creado y actualizado en septiembre de 2026; sin mantenimiento ni comunidad documentados.
- Verificar la integridad de los pesos antes de usarlos: el tamano de repositorio reportado (0,0 GB) no permite confirmar que el checkpoint completo este subido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fromziro/Maximus-v1.0-3M
- Datasets citados en la model card: https://huggingface.co/datasets/HuggingFaceFW/finephrase, https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu, https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0, https://huggingface.co/datasets/nampdn-ai/tiny-strange-textbooks, https://huggingface.co/datasets/ByteDance-Seed/mga-fineweb-edu, https://huggingface.co/datasets/nvidia/OpenMathInstruct-2, https://huggingface.co/datasets/AxiomicLabs/NPset-2-Python-Edu
- Citacion indicada por el autor: `@misc{maximus-v1.0-3m, title = {Maximus-v1.0-3M}, organization = {FromZero}, authors = {Paul Courneya}, year = {2026}, url = {https://huggingface.co/fromziro/Maximus-v1.0-3M}}`
- Paper, blog, repositorio o demo adicionales: no disponible. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo; los enlaces recuperados correspondian a sitios de contenido para adultos sin ninguna relacion con Maximus, por lo que se descartan.

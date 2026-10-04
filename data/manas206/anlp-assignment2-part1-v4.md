# Manas206/anlp-assignment2-part1-v4

## Resumen

Part 1 V4 (one_epoch) es un modelo de traduccion automatica de tipo decoder-only entrenado desde cero en PyTorch, sin partir de ningun transformer preentrenado. Lo publica el usuario Manas206 en HuggingFace como parte de un trabajo academico de la asignatura ANLP (assignment 2, part 1), y su objetivo es traducir hacia ingles desde vietnamita o japones usando prompts con etiquetas de idioma explicitas. La model card lo describe como un modelo propio completamente entrenado por el autor, con un tokenizador BPE byte-level compartido de 16.000 tokens y una capacidad de contexto de 384 tokens.

El modelo se entreno durante 6.973 actualizaciones (steps) sobre 40.187.852 tokens no de padding, empleando el split oficial de entrenamiento del dataset belumind/en-vi-ja-curated-500k-triplets. La etiqueta "mixture-of-experts" aparece en los metadatos del repositorio, pero la model card no detalla el numero de expertos, el enrutado ni el recuento de parametros, por lo que no es posible confirmar la arquitectura interna mas alla de la naturaleza decoder-only.

Su relevancia es fundamentalmente academica y de investigacion: se trata de un experimento de bajo presupuesto (el repositorio completo ocupa 0,1 GB), con 0 descargas y 0 likes en el momento de la consulta, sin licencia declarada y sin resultados de evaluacion publicados. Interesa como caso de estudio de entrenamiento from-scratch y como baseline reproducible, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only implementado en PyTorch; etiquetado como mixture-of-experts en los tags, sin detalle de capas, expertos ni enrutado |
| Parametros totales | no disponible (el tamano del repositorio es de 0,1 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | 384 tokens |
| Tipos de cuantizacion | no disponible; se distribuyen pesos nativos de PyTorch |
| Idiomas soportados | La metadata de HuggingFace indica "no disponibles"; la model card describe traduccion hacia ingles desde vietnamita y japones |
| Licencia | no disponible |
| Formato de pesos | Checkpoint nativo de PyTorch (libreria `pytorch`); no se ofrecen safetensors ni GGUF |

## Arquitectura y entrenamiento

La model card define el modelo como un "custom decoder-only PyTorch model; no pretrained transformer". Esto implica que no se reutilizan pesos de ningun modelo existente y que toda la capacidad se aprende en el entrenamiento descrito. El tokenizador es un BPE byte-level compartido de 16.000 tokens, comun para los tres idiomas implicados (vietnamita, japones e ingles). La salida del `forward` son logits con forma `[batch, time, 16000]`, coherente con ese vocabulario. La ventana de contexto declarada es de 384 tokens, un valor reducido que limita la traduccion a frases y parrafos cortos.

El entrenamiento comprende 6.973 actualizaciones y 40.187.852 tokens no de padding, sobre el split oficial de `belumind/en-vi-ja-curated-500k-triplets`. El autor indica que la variante V3 es una ejecucion parcial y que no esta equiparada en presupuesto de entrenamiento con las variantes completadas, por lo que V4 debe considerarse la version comparable. No se documentan en la informacion disponible el optimizador, la tasa de aprendizaje, el esquema de decodificacion, el uso de RLHF o DPO, ni ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, etc.).

El formato de prompt de traduccion es `<bos> <vi-or-ja> SOURCE <en>`, es decir, una etiqueta de idioma de origen antes del texto y una etiqueta de destino al final. El uso previsto es llamar a `model.forward(input_ids, attention_mask)` directamente, sin una API de generacion de alto nivel incluida en el repositorio.

## Capacidades

- Traduccion de texto hacia ingles desde vietnamita y desde japones, con la etiqueta de idioma de origen indicada en el prompt.
- Generacion autoregresiva decoder-only: el modelo produce logits sobre el vocabulario de 16.000 tokens para decodificacion token a token.
- Procesamiento de secuencias de hasta 384 tokens, incluyendo prompt y traduccion.
- Tokenizacion multilingue compartida mediante BPE byte-level, lo que permite representar texto de los tres idiomas con un unico vocabulario.
- Ejecucion en CPU o GPU mediante PyTorch 2.7.0 y tokenizers 0.23.1, segun las dependencias indicadas.
- No se documenta soporte de tool calling, function calling, uso como agente, razonamiento multi-paso, vision, audio ni modo de razonamiento explicito.
- No se documentan capacidades de codigo ni de matematicas; la unica tarea declarada es la traduccion.

## Casos de uso

- Traduccion de vietnamita a ingles en contenidos breves: resenas de producto, tickets de soporte o mensajes de usuario que quepan en la ventana de 384 tokens, usando el prompt `<bos> <vi> SOURCE <en>`.
- Traduccion de japones a ingles en texto corto: titulares, descripciones de catalogo o titulos de articulos, aprovechando la etiqueta `<ja>` para fijar el idioma de origen.
- Prototipado y docencia en cursos de procesamiento de lenguaje natural: al ser un modelo from-scratch de bajo peso, sirve para ilustrar el ciclo completo de tokenizacion, entrenamiento y decodificacion sin depender de pesos preentrenados.
- Baseline reproducible en investigacion sobre traduccion de bajo recurso: permite comparar arquitecturas o recetas de entrenamiento contra un punto de partida conocido y con presupuesto de tokens documentado (40,2 millones).
- Aumentacion de datos multilingues: generar traducciones aproximadas al ingles para preprocesar o alinear corpus en-vi y en-ja antes de un filtrado posterior por calidad.
- Pre-traduccion en pipelines de bajo coste: al caber en cualquier maquina sin GPU, puede desplegarse como paso previo barato y dejar la revision a un modelo mayor.
- Experimentos de destilacion o ajuste fino: el checkpoint puede servir como inicializacion para tareas derivadas dentro del mismo dominio linguistico, dado su tamano reducido.
- Traduccion en entornos sin acelerador: la inferencia en CPU es viable por el tamano del repositorio (0,1 GB), lo que habilita escenarios de borde o de laboratorio con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la procedencia del checkpoint y los ajustes de evaluacion de test se entregan como ficheros JSON dentro del repositorio, pero no incluye cifras de BLEU, chrF, COMET ni de tareas genericas como MMLU, HumanEval o GSM8K. Tampoco se proporcionan mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio completo ocupa 0,1 GB, por lo que los pesos y el estado del optimizador son muy reducidos y la inferencia deberia caber en cualquier GPU con 2 GB o menos de memoria.
- GPU recomendadas: no se requieren GPU de gama alta; cualquier GPU consumer reciente (por ejemplo, serie RTX 30 o 40, o incluso integradas) es suficiente para un modelo de este tamano.
- Viabilidad en hardware consumer: si, tanto en GPU de gama baja como en CPU, dado el tamano del artefacto publicado.
- Opciones de despliegue: el repositorio no incluye soporte para vLLM, llama.cpp, Ollama ni TGI, y no publica pesos GGUF. El unico camino documentado es PyTorch nativo con `torch==2.7.0` y `tokenizers==0.23.1`, anadiendo el directorio del repositorio a `sys.path` y llamando a `from load_model import load_model; model, tokenizer = load_model(directory)`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

Los datos de la columna "este modelo" proceden del repositorio; los de las alternativas son referencias publicas de cada proyecto y no se han verificado contra la informacion proporcionada.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Manas206/anlp-assignment2-part1-v4 | no disponible (repo de 0,1 GB) | 384 | en, vi, ja (segun model card) | no disponible | PyTorch nativo, sin cuantizaciones |
| Helsinki-NLP/opus-mt (familia Marian) | en torno a 77 M por par de idiomas | 512 | cientos de pares, incluidos en-vi y en-ja | MIT | Transformers, con versiones convertidas |
| facebook/nllb-200-distilled-600M | 600 M | no disponible en la informacion consultada | 200 idiomas | CC-BY-NC-4.0 (no comercial) | Transformers, ampliamente desplegado |
| google/madlad400-3b-mt | 3 000 M | no disponible en la informacion consultada | mas de 400 idiomas | Apache-2.0 | Transformers |

## Limitaciones y advertencias

- Ausencia de licencia declarada: sin terminos explicitos, el uso comercial no esta autorizado de forma clara y debe consultarse con el autor.
- Contexto muy limitado (384 tokens): no admite documentos, parrafos largos ni conversaciones multi-turno, y truncara entradas que lo excedan.
- Modelo from-scratch con solo 40,2 millones de tokens de entrenamiento: la calidad esperable esta muy por debajo de modelos de traduccion preentrenados a gran escala.
- Sin evaluacion publicada: no existen cifras de BLEU, chrF ni COMET que respalden la calidad de las traducciones.
- Riesgo de alucinacion y de deriva: al ser decoder-only y sin mecanismos documentados de control, puede generar texto fluido pero no fiel al original.
- Sesgos desconocidos: no se documenta la composicion del dataset `belumind/en-vi-ja-curated-500k-triplets` ni los criterios de curado, por lo que no puede evaluarse el sesgo de dominio, genero o registro.
- Direccionalidad restringida: el formato de prompt apunta siempre a `<en>` como destino; no hay evidencia de traduccion en sentido inverso ni entre vietnamita y japones directamente.
- Idiomas no declarados oficialmente en la metadata del repositorio, lo que dificulta el filtrado automatico y la integracion en catalogos.
- Ausencia de cuantizaciones y de integracion con servidores de inferencia (vLLM, TGI, llama.cpp, Ollama), lo que obliga a escribir un bucle de generacion propio.
- Fecha de creacion registrada como 2026-10-03, posterior a la fecha de actualizacion, un dato inconsistente que conviene verificar antes de citar el repositorio.
- 0 descargas y 0 likes: no existe validacion por parte de la comunidad ni evidencia de uso en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Manas206/anlp-assignment2-part1-v4
- Dataset de entrenamiento: https://huggingface.co/datasets/belumind/en-vi-ja-curated-500k-triplets
- Repositorio de PyTorch: https://github.com/pytorch/pytorch
- Libreria tokenizers: https://github.com/huggingface/tokenizers
- No se han encontrado en la informacion proporcionada papers, blogs, demos ni repositorios adicionales asociados al modelo.

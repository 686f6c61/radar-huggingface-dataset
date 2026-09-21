# jacob-valdez/tensorcode-chatbot-cognitive-experimental-001

## Resumen

tensorcode-chatbot-cognitive-experimental-001 es un checkpoint experimental publicado por el usuario jacob-valdez dentro del marco TensorCode. No es un unico modelo neuronal, sino un sistema compuesto que integra cinco componentes propiedad del proyecto (generacion de hipotesis, verificacion de fuentes, recuperacion de frases y realizacion linguistica final) sobre modelos fundacionales preentrenados: google/flan-t5-small, google/flan-t5-base, cross-encoder/nli-deberta-v3-small, sentence-transformers/all-MiniLM-L6-v2 y un ranker Electra-small. El conjunto suma 517.246.628 parametros y ocupa 2,1 GB en el repositorio, con pesos en safetensors y soporte unicamente en ingles.

Su proposito declarado es responder preguntas ancladas en evidencia ("evidence-grounded"), generando propuestas de respuesta, recuperando pasajes de apoyo y verificando la consistencia mediante un cross-encoder NLI, con una politica de soporte que fuerza la abstencion cuando no se superan umbrales concretos (support >= 0,7; contradiction <= 0,2; unknown <= 0,3). La relevancia actual es metodologica: el propio autor lo describe como un artefacto de investigacion experimental y no como un asistente fiable.

Los resultados publicados son deliberadamente pesimistas: sobre 32 preguntas fijas de HotpotQA con pasajes de apoyo oracle, el sistema devolvio 30 abstenciones, una respuesta correcta y una respuesta circular que no respondia a la pregunta pero supero el filtro NLI. El exact match literal de respuesta corta fue cero. Es, por tanto, un objeto de estudio sobre calibracion, abstencion y verificacion, mas que una herramienta de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema compuesto: T5 encoder-decoder (flan-t5-small y flan-t5-base), cross-encoder DeBERTa-v3-small, encoder MiniLM (Transformer), ranker Electra-small |
| Parametros totales | 517.246.628 (suma de todos los componentes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Compuesta y no documentada como valor unico; el recuperador MiniLM esta limitado a 256 tokens, la memoria de sesion a 256 entradas, top-k 5 y la capacidad de registro cognitivo a 1024 |
| Tipos de cuantizacion | safetensors en precision nativa; no se documentan GGUF, AWQ, GPTQ ni otras cuantizaciones |
| Idiomas soportados | Ingles (en), segun los tags del repositorio |
| Licencia | No declarada en el repositorio; la implementacion TensorCode es MIT, el material SQuAD es CC-BY-SA-4.0 y aplican las licencias de los modelos base |
| Formato de pesos | safetensors |
| Tamano del repositorio | 2,1 GB |
| Libreria | tensorcode (requiere commit 50f170e o posterior) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-21 |

## Arquitectura y entrenamiento

El sistema no es un modelo unico, sino un pipeline cognitivo con cinco piezas. La generacion de hipotesis usa google/flan-t5-small (commit 0fc9ddf78a1e988dac52e2dac162b0ede4fd74ab), adaptado durante 3 epocas sobre 1.024 declaraciones QA2D humanas; solo las preguntas originales y los parrafos de SQuAD entran en la entrada del generador, y los targets se excluyen. La coincidencia de declaracion en test article-disjoint mejora de 1/128 a 30/128, aunque persisten errores factuales. El ranking reutiliza el document ranker Electra-small de HotpotQA del propio TensorCode, cuyas etiquetas se refieren a relevancia de documento, no a calidad de propuesta. La verificacion emplea cross-encoder/nli-deberta-v3-small (commit fa2804872c3b4bd748f38c0185cc85775361e735), afinado sobre 1.024 pares SNLI, con 256 pares para ajuste de temperatura y 256 de test; temperatura ajustada 1.9768, exactitud 92,58% a 92,19%, NLL calibrado 0,2420 y ECE 0,0286. La recuperacion usa sentence-transformers/all-MiniLM-L6-v2 (commit 1110a243fdf4706b3f48f1d95db1a4f5529b4d41) con pesos preentrenados sin cambios, masked mean pooling, normalizacion L2 y limite de 256 tokens.

La realizacion linguistica corre a cargo de google/flan-t5-base (commit 7bcac572ce56db69c1ea7c8af255c5d7c9672fc2), adaptado 3 epocas sobre 256 declaraciones humanas seleccionadas donde la declaracion objetivo aparece intencionadamente en la entrada: es renderizado fiel, no QA a ciegas. La coincidencia de declaracion normalizada alcanza el 100% (96,875% verbatim) sobre 64 ejemplos de desarrollo article-disjoint. La politica de soporte (support >= 0,7; contradiction <= 0,2; unknown <= 0,3, con vetos por truncamiento) esta escrita a mano. El entrenamiento y la inferencia real de esta version se ejecutaron en una maquina GB10 (NVIDIA Grace Blackwell), no en el equipo de desarrollo. Las operaciones simbolicas de grafo permanecen sin implementar y no se demuestra beneficio consistente del espacio de trabajo recurrente.

## Capacidades

- Generacion de texto en ingles orientada a respuestas ancladas en evidencia aportada por el usuario.
- Recuperacion de frases (sentence retrieval) sobre corpus de pasajes proporcionados, con embeddings MiniLM de 256 tokens.
- Verificacion NLI de soporte/contradiccion mediante cross-encoder DeBERTa-v3-small, usado como filtro de la respuesta.
- Abstencion explicita: el sistema puede negarse a responder cuando no supera la politica de soporte.
- Generacion de hipotesis a partir de preguntas y parrafos fuente (flan-t5-small adaptado con QA2D).
- Realizacion fiel de enunciados presentes en la entrada (flan-t5-base adaptado), con alta coincidencia normalizada.
- Memoria de sesion con capacidad de 256 entradas, top-k 5 y capacidad de registro cognitivo de 1024.
- Persistencia de sesion: la model card indica que evidencia de documentacion de desarrollador sobrevivio a episodios y a guardado/carga de sesion.
- No soporta tool calling, function calling, agentes multi-paso, vision ni audio segun la informacion disponible.
- Unicamente ingles.

## Casos de uso

- Investigacion sobre abstencion y calibracion: el sistema abandona 30 de 32 preguntas con contexto oracle, lo que lo convierte en un banco de pruebas realista para estudiar tasas de abandono, umbrales de soporte y costes del falso negativo en pipelines anclados en evidencia.
- Evaluacion de verificadores NLI en RAG: el componente nli-deberta-v3-small esta calibrado (ECE 0,0286, NLL 0,2420) y puede reutilizarse para medir como una verificacion NLI deja pasar respuestas circulares que no responden a la pregunta.
- Recuperacion de pasajes en corpus pequenos y de dominio: el encoder MiniLM logro rank 1 en 32/32 consultas sobre un corpus oracle, con baseline lexica en 31/32, lo que sirve para comparar recuperacion densa frente a lexica en colecciones reducidas.
- Reutilizacion del realizer para renderizado fiel: el flan-t5-base adaptado rinde el 100% de coincidencia normalizada sobre 64 ejemplos, util para tareas de parafrasis controlada donde el enunciado objetivo ya esta en la entrada.
- Reproducibilidad de experimentos: evaluation.json, final-freeze.json y los hashes congelados de modelo, configuracion y componentes permiten reconstruir exactamente el protocolo y auditar decisiones antes y despues del congelado.
- Estudio de arquitecturas cognitivas con estado de sesion: la separacion entre pesos y estado de sesion, la memoria de 256 entradas y el registro cognitivo de 1024 son un caso concreto para investigar memoria episodica en asistentes conversacionales.
- Formacion e investigacion sobre "evidence grounding": el propio autor advierte que el soporte de una fuente no establece verdad, relevancia ni completitud, lo que lo hace apto como ejemplo docente de las limitaciones del grounding.
- Analisis de politicas de soporte escritas a mano: sirve para estudiar como umbrales fijos de soporte, contradiccion y desconocimiento afectan al comportamiento en dominios distintos a los de calibracion.

## Benchmarks y rendimiento

| Evaluacion | Resultado |
|---|---|
| HotpotQA, 32 preguntas fijas con pasajes de apoyo oracle | 30 abstenciones, 1 respuesta correcta revisada, 1 respuesta circular no valida |
| Exact match literal de respuesta corta | 0 |
| Controles de omision de evidencia (8) | 8 abstenciones |
| Controles de reemplazo de evidencia (8) | 8 abstenciones |
| Recuperacion MiniLM, pasaje de apoyo en rank 1 | 32/32 |
| Recuperacion baseline lexica, rank 1 | 31/32 |
| Recuperacion MiniLM y baseline, rank 5 | 32/32 |
| Generador: coincidencia de declaracion en test article-disjoint | 1/128 -> 30/128 |
| Verificador: exactitud de fine-tuning SNLI | 92,58% -> 92,19% |
| Verificador: NLL calibrado | 0,2420 |
| Verificador: ECE | 0,0286 |
| Verificador: temperatura ajustada | 1,9768 |
| Realizador: coincidencia de declaracion normalizada (64 ejemplos dev) | 100% (verbatim 96,875%) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (valores orientativos calculados a partir de 517 M de parametros, no documentados por el autor): aproximadamente 2,1 GB en fp32, 1,0 GB en fp16/bf16 y 0,5 GB en int8, mas overhead de runtime.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4070, RTX 4090 o superiores son mas que suficientes; tambien es viable en CPU.
- Entorno de referencia: la model card indica que el entrenamiento y la inferencia real se ejecutaron en una maquina GB10 (NVIDIA Grace Blackwell).
- Opciones de despliegue: la libreria TensorCode mediante `python -m pip install -e '.[tools]'` y `Chatbot.from_pretrained(...)`; no se documentan rutas de despliegue por vLLM, llama.cpp, Ollama ni TGI, ni pesos GGUF.
- La carga requiere TensorCode en el commit 50f170e o posterior para corregir un error del loader que dejaba el indice de memoria vacio enlazado a los pesos iniciales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se ha publicado un sistema comparable de extremo a extremo evaluado con el mismo protocolo. Se ofrecen como referencia los modelos base que componen el pipeline.

| Sistema | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| tensorcode-chatbot-cognitive-experimental-001 | 517 M (compuesto) | Compuesta; recuperador de 256 tokens | No declarada; implementacion MIT | HuggingFace, 0 descargas |
| google/flan-t5-base (componente realizer) | ~250 M | 512 tokens | no declarada en la ficha | HuggingFace |
| google/flan-t5-small (componente generador) | ~60 M | 512 tokens | no declarada en la ficha | HuggingFace |
| cross-encoder/nli-deberta-v3-small (componente verificador) | ~140 M | 512 tokens | no declarada en la ficha | HuggingFace |
| sentence-transformers/all-MiniLM-L6-v2 (componente recuperador) | ~22 M | 256 tokens | no declarada en la ficha | HuggingFace |

## Limitaciones y advertencias

- Artefacto de investigacion experimental, no un asistente de razonamiento fiable segun el propio autor.
- Tasa de abstencion muy alta: 30 de 32 preguntas con pasajes oracle acabaron en abandono, lo que limita drasticamente su utilidad practica.
- Exact match literal de respuesta corta igual a cero; la unica respuesta correcta se expreso como frase completa.
- El verificador NLI puede dejar pasar respuestas circulares que no contestan a la pregunta pedida.
- El soporte de una fuente no establece verdad, relevancia ni completitud de la respuesta.
- La calibracion del verificador no se transfiere automaticamente a todos los dominios: la mayoria de declaraciones QA2D humanas fallan la politica de soporte incluso sin truncamiento.
- La generacion y la verificacion heredan capacidades fundacionales falibles de los modelos base.
- Las operaciones simbolicas de grafo permanecen sin implementar y no se demuestra beneficio consistente del espacio de trabajo recurrente.
- Volumen de datos de adaptacion reducido: 1.024 declaraciones QA2D para el generador y 256 enunciados para el realizer.
- Exposicion de preentrenamiento de los modelos base desconocida.
- Soporte unicamente en ingles, lo que excluye uso multilingue.
- Licencia del repositorio no declarada: el uso comercial queda en un terreno ambiguo; la implementacion TensorCode es MIT, pero el material SQuAD es CC-BY-SA-4.0 y exige atribucion y respeto de los terminos de la licencia de datos.
- Requiere TensorCode en el commit 50f170e o posterior; versiones anteriores cargan pesos con el indice de memoria mal inicializado.
- Los resultados de recuperacion provienen de un corpus oracle pequeno y no constituyen un benchmark de dominio abierto ni un fine-tuning de recuperacion.
- Sin descargas ni likes registrados, lo que reduce la validacion externa y la comunidad de soporte.

## Enlaces

- HuggingFace: https://huggingface.co/jacob-valdez/tensorcode-chatbot-cognitive-experimental-001
- Codigo de evaluacion (TensorCode 0.3.0a1, commit b26785d): https://github.com/TensaCo/tensacode-py
- Los resultados de busqueda web disponibles no contienen enlaces relevantes al modelo; devuelven paginas sobre la figura biblica Jacob y la empresa de sanitarios Jacob Delafon, sin relacion con este artefacto.

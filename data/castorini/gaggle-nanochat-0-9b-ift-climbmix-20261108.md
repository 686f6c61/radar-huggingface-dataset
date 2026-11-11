# castorini/gaggle-nanochat-0.9b-ift-climbmix-20261108

## Resumen

`gaggle-nanochat-0.9b-ift-climbmix-20261108` es un modelo de chat de 0,89 mil millones de parametros desarrollado por el grupo Castorini. Se trata del modelo conversacional construido a partir del checkpoint preentrenado `gaggle-nanochat-0.9b-pretrained-climbmix-20261105` mediante la receta estandar de chat de nanochat en dos etapas: midtraining y ajuste supervisado (SFT), sin refuerzo por RL. Es la contraparte de 0,9B del modelo de 3,3B de la misma familia, aplicando la misma receta, datos y codigo al modelo base mas pequeno.

La arquitectura es un transformer decoder-only de 32 capas con anchura 1.152, 9 cabezas de atencion de dimension 128 y una ventana de contexto de 2.048 tokens, con un embedding de valor en cada cuarta capa. El tokenizador es un BPE a nivel de byte con 32.768 entradas, identico al de los modelos Gaggle de 3,3B. Los pesos son intercambiables entre `transformers`, vLLM (mediante el plugin Gaggle) y el codigo original de nanochat.

Su relevancia radica en ser un punto de referencia reproducible y de bajo coste: el entrenamiento completo de post-formativo (midtraining mas SFT) se ejecuto en dos GPU NVIDIA H200 en apenas 35 minutos en total, con licencia MIT y pesos abiertos. Resulta util para experimentacion academica, prototipado rapido y como base para estudios comparativos de recetas de post-entrenamiento a escala reducida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (nanochat): 32 capas, anchura 1.152, 9 cabezas de atencion de dimension 128, embedding de valor cada 4 capas |
| Parametros totales | 887.096.250 (0,89B); de ellos 0,30B corresponden a lookups de embedding de valor |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (tambien cargable con el codigo original de nanochat y con vLLM via plugin Gaggle) |

## Arquitectura y entrenamiento

El modelo hereda sin cambios la arquitectura, el tokenizador y el codigo del modelo base. Se trata de un transformer decoder-only de 32 capas con anchura 1.152, 9 cabezas de atencion de dimension 128 y contexto de 2.048 tokens. Una innovacion estructural destacable es la presencia de un embedding de valor en cada cuarta capa, que aporta 0,30B de los 0,89B totales. El tokenizador es un BPE a nivel de byte de 32.768 entradas, identico al de los modelos Gaggle de 3,3B. El formato de chat emplea los tokens especiales `<|bos|>`, `<|user_start|>`...`<|user_end|>` y `<|assistant_start|>`...`<|assistant_end|>`, fusionando el mensaje de sistema en el primer mensaje de usuario.

El post-entrenamiento sigue la ultima receta de dos etapas de nanochat (commit `348fbb3`, portada a `92d63d4`). El **midtraining** consistio en una epoca de 816 pasos de 524.288 tokens (secuencias de 2.048 tokens con empaquetado best-fit alineado a BOS, perdida sobre todos los tokens) sobre 849.656 filas: smol-smoltalk (460.341), MMLU `auxiliary_train` (99.842), GSM8K train (7.473), conversaciones de identidad de nanochat (2.000, dos epocas), SimpleSpelling (200.000) y SpellingBee (80.000). El **SFT** consistio en una epoca de 701 pasos de 32 conversaciones (perdida solo en tokens del asistente) sobre 22.443 filas: ARC-Easy (2.251), ARC-Challenge (1.119), GSM8K (7.473), las primeras 10.000 de smol-smoltalk tras shuffle con semilla 42, identidad (1.000) y 300 de SimpleSpelling mas 300 de SpellingBee. Se usaron tasas de aprendizaje de 0,2 (embeddings), 0,004 (unembedding) y 0,02 (Muon, matrices de bloque) sin weight decay, con decaimiento lineal a cero; ambas etapas parten de optimizador nuevo y ninguna reproduce texto de preentrenamiento (ClimbMix). El computo total fue de 29 minutos de midtraining y 6 minutos de SFT en dos H200.

## Capacidades

- Generacion de texto conversacional multi-turno en formato de chat nanochat.
- Razonamiento basico y respuesta a preguntas de conocimiento general (MMLU, ARC).
- Razonamiento matematico elemental (entrenado con GSM8K).
- Generacion de codigo a nivel basico (evaluado con HumanEval).
- Capacidades de ortografia y deletreo reforzadas mediante los datasets SimpleSpelling y SpellingBee.
- Identidad de asistente configurada mediante conversaciones de identidad de nanochat.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (entrenado exclusivamente en ingles).
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- **Prototipado rapido de asistentes conversacionales**: con 0,89B de parametros y contexto de 2.048 tokens, permite desplegar un chatbot funcional en hardware modesto para validar flujos de producto antes de escalar a modelos mayores.
- **Investigacion sobre recetas de post-entrenamiento**: al publicarse el checkpoint de midtraining junto al modelo final y documentarse hiperparametros y datos con detalle, sirve para estudiar el efecto aislado de midtraining y SFT en modelos pequenos.
- **Evaluacion comparativa de familias de modelos**: su receta identica a la del modelo de 3,3B permite analisis controlados del efecto del tamano sobre el rendimiento en MMLU, ARC, GSM8K y HumanEval.
- **Generacion de codigo asistida en entornos con recursos limitados**: entrenado con HumanEval y GSM8K, puede emplearse para autocompletar fragmentos o resolver problemas sencillos en herramientas de desarrollo locales sin GPU de gama alta.
- **Tareas de deletreo y manipulacion de cadenas**: los datasets SimpleSpelling y SpellingBee le confieren capacidades especificas utiles en validacion de formatos, juegos de palabras o generacion de ejercicios educativos.
- **Ensenanza y demostraciones de IA open source**: su licencia MIT y su tamano reducido lo hacen idoneo para cursos, talleres y tutoriales sobre transformers, tokenizacion BPE y ajuste supervisado.
- **Base para fine-tuning especifico de dominio**: al ser un modelo pequeno con licencia permisiva, puede ajustarse con presupuestos reducidos para tareas verticales (soporte interno, clasificacion conversacional, etc.).

## Benchmarks y rendimiento

Resultados publicados en la model card. Los modelos post-entrenados se evaluan en formato chat zero-shot; los preentrenados, en few-shot sobre texto plano.

| Etapa | Modelo | Formato | MMLU | MMLU-Pro | ARC-Easy | ARC-Challenge | GSM8K | HumanEval | CORE | ChatCORE |
|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|
| PT | Gaggle 0.9B | few-shot, texto plano | 35,7 | 11,8 | 76,2 | 47,0 | — | — | 0,370 | — |
| PT | Gaggle 3.3B | few-shot, texto plano | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | — | — | no disponible | — |
| Post-entrenado | Gaggle 0.9B (este modelo) | zero-shot, chat | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible | no disponible | — | no disponible |
| Post-entrenado | Gaggle 3.3B | zero-shot, chat | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible | no disponible | — | no disponible |

La informacion proporcionada incluye unicamente la fila del modelo preentrenado de 0,9B de forma completa; las filas restantes de la tabla original quedaron truncadas en el material disponible, por lo que no se reproducen sus cifras.

## Requisitos de hardware

- **VRAM estimada para inferencia**: en precision completa (fp32) los 0,89B parametros ocupan aproximadamente 3,5 GB; en bf16/fp16, unos 1,8 GB; en cuantizacion de 8 bits, en torno a 0,9 GB; en 4 bits, unos 0,5 GB. Estas cifras son estimaciones a partir del numero de parametros y no aparecen en la model card.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM es suficiente para bf16; para entrenamiento o fine-tuning se recomienda al menos una A100 o H100, aunque el post-entrenamiento original se ejecuto en dos H200.
- **Cabe en GPU de consumo**: si, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (8/16 GB), RTX 4070, RTX 4080 y RTX 4090, incluso en bf16 sin cuantizar.
- **Opciones de despliegue**: `transformers` con `trust_remote_code=True`, vLLM mediante el plugin Gaggle, y el codigo propio de nanochat cargando los ficheros originales del checkpoint. No se documenta soporte explicito de llama.cpp, Ollama ni TGI en la informacion disponible.
- **Latencia y throughput**: no disponibles en la informacion proporcionada. El entrenamiento (no la inferencia) tardo 29 minutos de midtraining y 6 minutos de SFT en dos H200.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| gaggle-nanochat-0.9b-ift (este modelo) | 0,89B | 2.048 | MIT | en | Receta nanochat de dos etapas; checkpoint de midtraining publicado |
| castorini/gaggle-nanochat-ift-climbmix-20261031 | 3,3B | no disponible | MIT (presumible, mismo autor) | en | Misma receta, datos y codigo sobre modelo base mayor; permite comparacion controlada de escala |
| castorini/gaggle-nanochat-0.9b-pretrained-climbmix-20261105 | 0,89B | 2.048 | MIT | en | Modelo base preentrenado; referencia para medir la ganancia del post-entrenamiento |

No se dispone de datos de benchmarks completos de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, licencia y procedencia.

## Limitaciones y advertencias

- **Ventana de contexto muy corta**: 2.048 tokens limita conversaciones largas, documentos extensos y razonamiento multi-paso con mucho historial.
- **Solo ingles**: el modelo esta entrenado y evaluado exclusivamente en ingles; su rendimiento en castellano u otros idiomas no esta garantizado.
- **Riesgo de alucinacion**: como todo modelo de lenguaje de escala reducida, puede generar afirmaciones factualmente incorrectas con aparente seguridad, especialmente en conocimiento general (MMLU 35,7 en el modelo base).
- **Capacidades limitadas por tamano**: 0,89B parametros implican menor profundidad de razonamiento, menor cobertura de conocimiento y mayor fragilidad en tareas complejas en comparacion con modelos de mayor escala.
- **Sin RLHF ni DPO**: el post-entrenamiento es solo SFT, por lo que no hay optimizacion explicita de preferencias humanas; pueden aparecer respuestas no alineadas o de estilo inconsistente.
- **Formato de chat propietario**: requiere respetar los tokens especiales de nanochat; un formateo incorrecto degrada gravemente la calidad de las respuestas.
- **Licencia MIT**: permisiva para uso comercial, pero sin garantias; conviene revisar las licencias de los datasets de entrenamiento (smol-smoltalk, ClimbMix, MMLU, GSM8K, ARC) si se redistribuye el modelo en productos comerciales.
- **Sin soporte documentado de tool calling ni agentes**: no debe asumirse en produccion sin validacion previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castorini/gaggle-nanochat-0.9b-ift-climbmix-20261108
- Modelo base preentrenado: https://huggingface.co/castorini/gaggle-nanochat-0.9b-pretrained-climbmix-20261105
- Modelo hermano de 3,3B: https://huggingface.co/castorini/gaggle-nanochat-ift-climbmix-20261031
- Modelo base de 3,3B: https://huggingface.co/castorini/gaggle-nanochat-pretrained-climbmix-20260924
- Codigo nanochat: https://github.com/karpathy/nanochat
- Dataset smol-smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Dataset ClimbMix: https://huggingface.co/datasets/karpathy/climbmix-400b-shuffle
- Paper referenciado (arXiv:2610.11922): https://arxiv.org/abs/2610.11922

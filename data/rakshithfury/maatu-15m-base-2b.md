# RakshithFury/Maatu-15m-base-2b

## Resumen

Maatu 15M Base 2B es un modelo de lenguaje de dominio especifico para kannada, desarrollado por RakshithFury, que se presenta como un modelo base de completado de texto entrenado desde inicializacion aleatoria. Con solo 15.040.622 parametros, es un ejercicio de preentrenamiento a pequena escala centrado en un unico idioma, construido sobre la arquitectura GPT de nanochat (el proyecto educativo de Andrej Karpathy). Resuelve el problema de disponer de un checkpoint ligero y reproducible para experimentar con modelado de lenguaje en kannada sin depender de modelos multilingues masivos.

La relevancia del modelo es fundamentalmente metodologica: documenta de forma transparente el corpus, el numero de objetivos de entrenamiento (2.000 millones de tokens next-token), el hardware (una unica RTX 5070 Ti con 16 GB) y las curvas de perdida. No es un modelo orientado a produccion ni a conversacion: el propio autor lo describe como text-completion-only, con una version con ajuste conversacional anunciada pero no publicada.

Arquitectura transformer tipo GPT de seis capas, anchura 384, seis cabezas de consulta y dos de clave/valor (GQA), contexto de 512 tokens y tokenizador BPE a nivel de byte de 4.864 entradas ajustado sobre documentos kannada. Su huella es minima (repo de 0,1 GB) y su licencia no esta disponible en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT (nanochat), 6 capas, width 384, 6 query heads, 2 key/value heads |
| Parametros totales | 15.040.622 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (checkpoint en BF16; el autor menciona inferencia en CPU por defecto y BF16 en GPU) |
| Idiomas soportados | Kannada (kn) |
| Licencia | no disponible (el codigo de inferencia incluido es MIT) |
| Formato de pesos | safetensors (checkpoint PyTorch) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT de nanochat (commit fijado en el repositorio): transformer decoder-only con seis capas, dimension de modelo 384, atencion con 6 cabezas de consulta y 2 de clave/valor (grouped-query attention), y ventana de contexto de 512 tokens. El tokenizador es un BPE a nivel de byte de 4.864 entradas ajustado especificamente sobre documentos de entrenamiento en kannada (tokenizer v1). Los pesos se inicializaron de forma aleatoria, sin destilacion ni inicializacion desde otro modelo.

El preentrenamiento consumio 2.000.000.000 objetivos next-token en una sola pasada, distribuidos en 61.036 actualizaciones, con computo BF16 y el optimizador Adafactor, sobre una unica NVIDIA RTX 5070 Ti de 16 GB durante 1 hora 45 minutos 45 segundos (excluyendo descarga y preparacion de datos). El corpus combina 948.303.360 objetivos de 21 shards fijados de AI4Bharat Sangraha Verified Kannada (CC BY 4.0) y 1.051.696.640 objetivos de 32 shards de un corpus limpio de preentrenamiento kannada (CC BY-SA 4.0), restringido a IndicCorp v2, FineWeb-2, IndicMonoDoc, Wikipedia en kannada y Wikisource en kannada. El conjunto empaquetado tiene 3.906.250 filas y 4,01 GB. La preparacion normalizo texto, deduplico documentos exactos entre fuentes y rechazo documentos con letras o marcas combinantes extranjeras. No se menciona RLHF, DPO ni ajuste por instrucciones; el pipeline se apoya en el codebase Udgam English 125M de Udgam Labs.

## Capacidades

- Generacion de texto por completado de siguiente token en kannada: dado un prompt plano, predice una continuacion.
- Completado de frases cortas: en la prueba informal del autor acerto la apertura esperada en 2 de 18 prompts, contando sufijos y honorificos kannada.
- Manejo de numerales y expresiones kannada en contexto (por ejemplo, continuaciones tras cifras o conectores causales).
- Modelado de lenguaje base: util para calcular verosimilitud de secuencias y evaluar perplejidad.
- No soporta tool calling ni function calling (no documentado).
- No soporta agentes ni razonamiento multi-paso (modelo base, sin ajuste).
- No dispone de modo thinking, vision ni audio.
- Multilingue: no; solo kannada.
- No es un modelo conversacional; el autor anuncia una version chat-tuned "coming soon".

## Casos de uso

- Experimentacion educativa con preentrenamiento: reproducir el pipeline completo (tokenizador, empaquetado, entrenamiento con Adafactor en una sola GPU consumer) para estudiar el efecto del numero de tokens y la perplejidad en un idioma de bajos recursos como el kannada.
- Investigacion en modelado de lenguaje de bajos recursos: usar el checkpoint como linea base de 15M parametros para comparar tecnicas de tokenizacion, filtrado de corpus o deduplicacion sobre Sangraha y corpus kannada limpios.
- Evaluacion de perplejidad y calibracion: calcular perplejidad sobre holdouts kannada (el autor reporta 21,33 en el holdout completo de Sangraha) para validar pipelines de evaluacion o comparar variantes de preprocesado.
- Generacion de borradores cortos en kannada: completar titulares, primeros parrafos o frases inacabadas en herramientas de escritura asistida, aceptando que las continuaciones pueden derivar en frases periodisticas repetitivas.
- Pruebas de infraestructura de inferencia: al caber en CPU y en cualquier GPU moderna, sirve para validar scripts de carga de safetensors, tokenizadores BPE y decodificacion greedy antes de escalar a modelos mayores.
- Docencia sobre arquitecturas transformer: sus seis capas y 384 de anchura permiten inspeccionar atencion, GQA y embeddings en un modelo de tamano manejable, con pesos publicos y curvas de entrenamiento disponibles.

## Benchmarks y rendimiento

| Test | Resultado | Referencia |
|---|---|---|
| Perplejidad en holdout completo de Sangraha (999.936 objetivos next-token) | 21,33 | 26,02 para Maatu 15M Base v1 |
| IndicCOPA Kannada, zero-shot por verosimilitud de eleccion | 54,0% (270/500) | 50% azar uniforme |
| Belebele Kannada, zero-shot por verosimilitud de etiqueta A-D | 23,1% (208/900) | 25% azar uniforme |
| Perdida de validacion (subconjunto fijo de 262.144 objetivos) | 8,49 a 3,04 | - |
| Perplejidad de validacion (mismo subconjunto) | 4.864,94 a 20,92 | - |

En Belebele el modelo eligio la opcion A en 810 de 900 preguntas, lo que indica un sesgo fuerte hacia esa etiqueta y limita la interpretacion del resultado. Dos prompts fueron truncados por la izquierda a 512 tokens. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en BF16 (15M parametros, ~30 MB de pesos), mas overhead de activaciones y contexto; cabe holgadamente en cualquier GPU.
- GPU recomendadas: cualquier GPU con soporte CUDA y BF16; el autor entreno en una RTX 5070 Ti de 16 GB y la inferencia por defecto es en CPU.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer modernas e incluso en CPU.
- Opciones de despliegue: script PyTorch incluido (infer.py) con huggingface_hub para descarga; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el entrenamiento completo de 2.000 millones de objetivos requirio 1 h 45 min 45 s en una RTX 5070 Ti.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Maatu 15M Base 2B | 15,04M | 512 | Kannada | no disponible | Base, text-completion-only; perplejidad 21,33 en holdout Sangraha |
| Maatu 15M Base v1 | no disponible | no disponible | Kannada | no disponible | Version previa del mismo autor; perplejidad 26,02 |
| Udgam English 125M | ~125M | no disponible | Ingles | no disponible | Codebase de referencia del pipeline de entrenamiento |

No se dispone en la informacion proporcionada de datos de parametros, contexto o rendimiento de alternativas comparables de 15M parametros especializadas en kannada, por lo que la comparativa cuantitativa con otros modelos queda como no disponible.

## Limitaciones y advertencias

- Modelo base sin ajuste conversacional ni por instrucciones: no mantiene dialogos ni sigue ordenes; solo completa texto.
- Contexto muy corto (512 tokens), insuficiente para documentos largos o conversaciones multi-turno.
- Calidad limitada por el tamano: en la prueba informal de completado solo acerto la apertura esperada en 2 de 18 prompts.
- Riesgo alto de repeticiones, cambios de tema y afirmaciones no sustentadas en continuaciones largas, segun el propio autor.
- Sesgo de etiqueta en tareas de eleccion multiple: eligio la opcion A en 810 de 900 preguntas de Belebele.
- Deriva hacia fraseologia periodistica familiar en prompts numericos.
- Unico idioma soportado: kannada; no hay capacidades multilingues.
- Licencia no disponible: no puede confirmarse el uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo. El codigo de inferencia incluido es MIT, pero los pesos no tienen licencia declarada en la informacion disponible.
- Corpus con licencias CC BY 4.0 y CC BY-SA 4.0; la componente CC BY-SA puede imponer obligaciones de compartir igual segun como se distribuya el modelo derivado.
- Sin garantias de calidad para produccion: cero descargas y cero likes en el momento de la consulta, sin validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RakshithFury/Maatu-15m-base-2b
- Repositorio nanochat (arquitectura): https://github.com/karpathy/nanochat/tree/92d63d4e8bb4df75c3b71618f31ddde2378b2bcd
- Codebase Udgam English 125M: https://github.com/udgamlabs/udgam-english-125m
- Organizacion Udgam Labs en Hugging Face: https://huggingface.co/udgamlabs
- Dataset AI4Bharat Sangraha Verified Kannada: https://huggingface.co/datasets/ai4bharat/sangraha/tree/8b813c3f62d37b2fa174d68c31e8b35ae2fe85e8/verified/kan
- Dataset Kannada LLM base (limpio): https://huggingface.co/datasets/SuhasBhairav/kannada-llm-base-model-dataset-clean/tree/75c039e2f2379757cec272921d2bd431d8aaaf98/pretrain
- IndicCOPA Kannada (test): https://huggingface.co/datasets/ai4bharat/IndicCOPA/blob/d356ef19a4eb287e88a51d07a56b73ba88c7f188/data/test.kn.jsonl
- Belebele Kannada: https://huggingface.co/datasets/facebook/belebele/viewer/kan_Knda
- Plantilla de prompt de EleutherAI para Belebele: https://github.com/EleutherAI/lm-evaluation-harness/blob/main/lm_eval/tasks/belebele/_default_template_yaml

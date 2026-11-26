# procesaur/Orao2-GPT

## Resumen

Orao2-GPT es un modelo generativo de tipo base (predobuceni, sin ajuste fino supervisado ni alineamiento por preferencias) desarrollado por Mihailo Skoric bajo el perfil de Hugging Face `procesaur`, en el marco del proyecto TESLA de la Universidad de Belgrado y con financiacion del Fondo para la Ciencia de Serbia. Con 8.953.803.264 parametros, esta construido sobre la arquitectura Qwen3.5 y su objetivo es dotar al serbio de un modelo fundacional propio, entrenado sobre un corpus mixto serbio-ingles.

Su rasgo mas distintivo es la extension del vocabulario del tokenizador con 50.000 tokens nuevos especificos del serbio, lo que segun el autor acelera un 30 por ciento el entrenamiento y la inferencia y mejora el alineamiento linguistico. Ademas, el tokenizador Srna incorpora transliteracion automatica, de modo que cirilico y latinico se procesan en el mismo espacio vectorial y el modelo los emplea de forma mas uniforme.

Es relevante ahora porque cubre un hueco poco atendido: los modelos abiertos de gran tamano rara vez incluyen el serbio entre sus idiomas prioritarios, y menos aun con un tokenizador adaptado y licencia de contenido compartido. Al ser un modelo base, no esta pensado para responder instrucciones de forma directa, sino como punto de partida para ajuste fino posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basada en Qwen3.5 (`qwen3_5_text`) |
| Parametros totales | 8.953.803.264 (aproximadamente 9 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos en safetensors) |
| Idiomas soportados | serbio (sr); entrenado sobre corpus mixto serbio-ingles |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3.5 en su variante de texto (`qwen3_5_text`), es decir, un transformer decoder-only con atencion causal. El dato concreto disponible es el numero de parametros (8.953.803.264) y la familia arquitectonica; no se detallan en la informacion proporcionada el numero de capas, la dimension oculta, el numero de cabezas de atencion ni el tipo de mecanismos de atencion empleados.

El entrenamiento parte de un corpus mixto serbio-ingles compuesto por los datasets `procesaur/znanje`, `procesaur/Wiki.korpus`, `procesaur/kisobran`, `HuggingFaceFW/fineweb`, `jerteh/SrpELTeC`, `AMead10/lvl_5_vital_wikipedia_articles`, `vikp/textbook_quality_programming` y `nampdn-ai/tiny-lessons`. No se especifica el volumen total de tokens ni si hubo fases de RLHF o DPO; al tratarse de un modelo base, lo habitual es que no las haya. La innovacion tecnica destacada es la ampliacion del vocabulario con 50.000 tokens nuevos y el tokenizador Srna con transliteracion automatica cirilico-latinico, que unifica ambos alfabetos en un unico espacio de representacion.

## Capacidades

- Generacion de texto libre y continuacion de texto a partir de un prefijo, propio de un modelo base.
- Modelado del serbio en sus dos alfabetos (cirilico y latinico) con representacion unificada gracias al tokenizador Srna.
- Manejo de contenido mixto serbio-ingles, al haber sido entrenado sobre un corpus bilingue.
- Capacidad de continuacion de plantillas de chat, ya que la model card muestra un ejemplo con `apply_chat_template`; no obstante, al no estar ajustado por instrucciones, la calidad de respuesta conversacional no esta garantizada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Ajuste fino supervisado para asistentes en serbio: al ser un modelo base, sirve como inicializacion para SFT y DPO sobre instrucciones en serbio, aprovechando su vocabulario ampliado para reducir el coste por token.
- Generacion y completado de texto editorial en serbio: redaccion asistida, parafrasis y continuacion de articulos, con la ventaja de manejar cirilico y latinico de forma consistente.
- Normalizacion y transliteracion de corpus: el tokenizador Srna con transliteracion automatica permite procesar documentos que mezclan alfabetos sin duplicar vocabulario.
- Investigacion en linguistica computacional serbia: evaluacion de modelos fundacionales de 9B en tareas de perplejidad, modelado de lenguaje y analisis de representaciones para un idioma de recursos limitados.
- Preentrenamiento continuado y experimentos de adaptacion: el modelo puede servir de base para seguir preentrenando con datos serbios adicionales o para estudiar el efecto de la extension de vocabulario.
- Generacion de datos sinteticos en serbio: produccion de texto de dominio general para aumentar corpus de entrenamiento de modelos menores o de clasificadores.
- Educacion y divulgacion: demostraciones de generacion de texto en serbio en entornos academicos, con la cautela de que al no estar alineado puede producir contenido inadecuado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): en torno a 18 GB solo para pesos, mas memoria para el KV cache y activaciones; se recomienda un minimo de 24 GB.
- GPU recomendadas para fp16: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB, justa para contexto corto).
- Cabe en GPU de consumo: si, en RTX 4090 con fp16 y contexto moderado; en GPUs de 16 GB o menos seria necesaria cuantizacion, que no se distribuye oficialmente en el repositorio.
- Opciones de despliegue: transformers con `device_map="auto"` (metodo documentado por el autor); vLLM o TGI requeririan conversion o verificacion de compatibilidad con la arquitectura `qwen3_5_text`; llama.cpp/Ollama no estan disponibles al no publicarse pesos GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Orao2-GPT | 8,95B | no disponible | serbio, ingles | CC BY-SA 4.0 | Hugging Face, transformers |
| Qwen3 (familia base) | variable (incluye ~8B) | no disponible en esta ficha | multilingue | Apache 2.0 en la mayoria de variantes | Hugging Face, amplio ecosistema |
| Llama 3.1 8B | 8B | 128K | multilingue (serbio no prioritario) | Llama Community License | Hugging Face, vLLM, llama.cpp, Ollama |
| Mistral 7B | 7,2B | 32K | multilingue (serbio no prioritario) | Apache 2.0 | Hugging Face, amplio ecosistema |

La comparacion con Qwen3, Llama 3.1 8B y Mistral 7B es aproximada: no se dispone de datos de rendimiento de Orao2-GPT que permitan una comparacion cuantitativa. Su ventaja diferencial es el vocabulario y el corpus especificamente serbios; su desventaja es la ausencia de ajuste por instrucciones y de pesos cuantizados listos para usar.

## Limitaciones y advertencias

- Es un modelo base sin alineamiento: no sigue instrucciones de forma fiable y puede generar contenido sesgado, ofensivo o factualmente incorrecto.
- Riesgo alto de alucinacion en preguntas factuales, especialmente si se usa fuera de tareas de continuacion de texto.
- No se documentan sesgos especificos, pero el corpus incluye datos web (fineweb) y textos de dominio variable, lo que puede introducir sesgos de genero, nacionalidad o religion.
- La licencia CC BY-SA 4.0 permite uso comercial, pero obliga a atribucion y a compartir las obras derivadas bajo la misma licencia; conviene revisar las implicaciones para productos propietarios.
- No se especifica la longitud de contexto soportada, lo que dificulta planificar despliegues con entradas largas.
- El soporte idiomatico declarado es unicamente el serbio; el rendimiento en castellano u otros idiomas no esta garantizado.
- El modelo tiene un volumen de descargas muy bajo (8) y ningun like, por lo que no hay validacion externa de su calidad.
- La dependencia de `trust_remote_code=True` implica ejecutar codigo del autor; conviene auditar el repositorio antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/procesaur/Orao2-GPT
- Tokenizador Srna: https://huggingface.co/procesaur/Srna_tokenizer
- Perfil del autor: https://huggingface.co/procesaur
- Plataforma nacional de IA de Serbia: https://tesla.rgf.bg.ac.rs
- Portal de IA del Gobierno de Serbia: https://www.ai.gov.rs
- Fondo para la Ciencia de Serbia: https://fondzanauku.gov.rs/
- Dataset procesaur/znanje: https://huggingface.co/datasets/procesaur/znanje
- Dataset procesaur/Wiki.korpus: https://huggingface.co/datasets/procesaur/Wiki.korpus
- Dataset procesaur/kisobran: https://huggingface.co/datasets/procesaur/kisobran
- Dataset HuggingFaceFW/fineweb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Dataset jerteh/SrpELTeC: https://huggingface.co/datasets/jerteh/SrpELTeC
- Dataset AMead10/lvl_5_vital_wikipedia_articles: https://huggingface.co/datasets/AMead10/lvl_5_vital_wikipedia_articles
- Dataset vikp/textbook_quality_programming: https://huggingface.co/datasets/vikp/textbook_quality_programming
- Dataset nampdn-ai/tiny-lessons: https://huggingface.co/datasets/nampdn-ai/tiny-lessons

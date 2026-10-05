# apiskecil/qwen2.5-1.5b-legal-id-sft

## Resumen

apiskecil/qwen2.5-1.5b-legal-id-sft es un ajuste fino supervisado (SFT) del modelo Qwen2.5-1.5B-Instruct, publicado por el usuario apiskecil en HuggingFace. El nombre del repositorio sugiere una especialización en dominio legal (el sufijo "-id" podría apuntar a Indonesia), pero la model card no documenta el conjunto de datos de entrenamiento ni el objetivo concreto del ajuste, y los metadatos declaran únicamente el idioma inglés. Conviene tratarlo, por tanto, como un fine-tune de propósito no verificado.

Técnicamente es un transformer decoder-only denso de 1.543.714.304 parámetros (dato real leído de los safetensors), derivado de la versión Instruct de Qwen2.5-1.5B. Hereda por tanto la arquitectura, el tokenizador y la ventana de contexto de la familia Qwen2.5, con atención de consultas agrupadas (GQA) y soporte nativo de contexto largo. El repositorio ocupa 3,1 GB, lo que es coherente con pesos almacenados en fp16/BF16 (aproximadamente 2 bytes por parámetro) más ficheros auxiliares.

Su relevancia es limitada pero clara como caso de estudio: es un ejemplo típico de fine-tune ligero realizado con Unsloth y TRL sobre una base cuantizada a 4 bits, un flujo de trabajo muy extendido para adaptar modelos pequeños a dominios verticales con recursos reducidos. Con 0 descargas y 0 likes en el momento de la consulta, se trata de un modelo recién publicado y sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2), con GQA; heredada del modelo base |
| Parametros totales | 1.543.714.304 (dato real de safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la model card; el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens, ampliable con YaRN (dato heredado, no confirmado para este fine-tune) |
| Tipos de cuantizacion | Pesos publicados en safetensors de precision completa (fp16/BF16, inferido del tamano del repo de 3,1 GB). No se han publicado versiones GGUF, AWQ ni GPTQ de este fine-tune |
| Idiomas soportados | Ingles (segun metadatos). El nombre del repositorio sugiere posible uso en otro idioma, sin confirmar |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only denso con normalizacion RMSNorm, activacion SwiGLU, embeddings de rotacion posicional (RoPE) y atencion con consultas agrupadas (GQA). La configuracion publica de la familia Qwen2.5-1.5B incluye 28 capas, 12 cabezas de atencion, 2 cabezas de clave/valor, dimension oculta de 1536 y un vocabulario de 151.936 tokens. Estos valores son los del modelo base y no estan confirmados de forma explicita en la model card de este repositorio.

El proceso de ajuste se realizo con Unsloth y la libreria TRL de HuggingFace, partiendo de unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit, es decir, una version del modelo base cuantizada a 4 bits. Segun la propia model card, el entrenamiento fue "2x mas rapido" gracias a Unsloth, aunque no se detalla el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF o DPO, ni los hiperparametros utilizados. No hay informacion sobre si se aplico LoRA/QLoRA y posterior fusion de pesos, aunque el flujo habitual de Unsloth con una base bnb-4bit apunta a QLoRA con fusion final a fp16. Esta ultima afirmacion es una inferencia, no un dato documentado.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo Instruct base.
- Razonamiento basico, matematicas elementales y generacion de codigo a nivel de modelo de 1,5B, sin garantias especificas para este fine-tune.
- Soporte de conversaciones multi-turno con historial, ya que el modelo base esta entrenado como asistente conversacional.
- Capacidades multilingues limitadas y no verificadas; los metadatos solo declaran ingles.
- El modelo base Qwen2.5 soporta tool calling y function calling, pero no hay evidencia en la model card de que este fine-tune conserve dicha capacidad.
- No se documenta modo de razonamiento extendido (thinking mode), vision, audio ni ninguna capacidad especial adicional.
- No se documenta ninguna capacidad especifica de dominio legal mas alla de lo que sugiere el nombre del repositorio.

## Casos de uso

- Prototipado rapido de asistentes conversacionales en ingles: el modelo cabe en cualquier GPU de consumo y permite iterar sobre prompts y plantillas de dialogo sin coste de API, aprovechando su formato Instruct.
- Experimentacion academica con fine-tuning ligero: sirve como referencia reproducible de un pipeline Unsloth + TRL sobre una base cuantizada a 4 bits, util para comparar tecnicas de QLoRA.
- Clasificacion y extraccion de informacion en textos cortos: con 1,5B parametros y contexto amplio puede procesar documentos de varias paginas para tareas de etiquetado o resumen extractivo, siempre con supervision humana.
- Generacion de borradores de texto administrativo o juridico sencillo: dado el nombre del repositorio, puede emplearse como punto de partida para redactar plantillas o resumenes, aunque requiere revision obligatoria por parte de un profesional.
- Despliegue en entornos con recursos muy limitados: al ocupar alrededor de 3 GB en fp16, es viable en portatiles con GPU de 6-8 GB o incluso en CPU con llama.cpp si se generan cuantizaciones propias.
- Base para distillation o generacion de datos sinteticos: un modelo de 1,5B es un generador barato de pares pregunta-respuesta para alimentar pipelines de destilacion o aumentar datasets de dominio.
- Componente de sistemas RAG ligeros: puede actuar como generador final en arquitecturas de recuperacion aumentada en ingles, donde el contexto recuperado se inserta en el prompt.
- Pruebas de evaluacion de sesgos y robustez: util como sujeto de analisis en estudios sobre como el fine-tuning sobre una base cuantizada afecta a la calidad y la seguridad del modelo resultante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, MT-Bench ni de ningun otro conjunto de evaluacion, ni tampoco comparaciones con el modelo base o con alternativas.

## Requisitos de hardware

- VRAM estimada en fp16/BF16: aproximadamente 3,1 GB solo para pesos, mas cache KV y activaciones; en la practica entre 4 y 5 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,7-2,5 GB.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 1,0-1,8 GB.
- Cache KV a contexto completo (32.768 tokens, suponiendo la configuracion del modelo base con GQA de 2 cabezas KV y head dim 128): en torno a 0,9 GB adicionales en fp16, calculo derivado y no confirmado por el autor.
- GPU recomendadas: cualquier GPU moderna con 4 GB o mas de VRAM. Funciona holgadamente en RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090, L4, A10G, A100 y H100. En GPUs de 6-8 GB (GTX 1660, RTX 3050, RTX 4060) es viable con cuantizacion de 8 o 4 bits.
- Si cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo con al menos 6 GB de VRAM, y sin problema en modelos de 12 GB o mas.
- Opciones de despliegue: transformers, text-generation-inference (TGI, etiquetado como endpoints_compatible), vLLM con pesos safetensors, y llama.cpp u Ollama si se convierte previamente a GGUF. No hay GGUF publicado por el autor.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| apiskecil/qwen2.5-1.5b-legal-id-sft | 1,54B | No especificado en la card (base: 32.768) | Apache-2.0 | HuggingFace, sin cuantizaciones publicadas |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 (ampliable con YaRN) | Apache-2.0 | HuggingFace, GGUF y cuantizaciones ampliamente disponibles |
| Llama-3.2-1B-Instruct | 1,24B | 128.000 | Llama 3.2 Community License | HuggingFace, ecosistema amplio |
| Gemma-2-2B-it | 2,6B | 8.192 | Gemma Terms of Use | HuggingFace, requiere aceptar terminos |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 | Apache-2.0 | HuggingFace, con versiones GGUF |

Las cifras de contexto, parametros y licencia de los modelos comparados proceden de su documentacion publica y se ofrecen como referencia orientativa. No se dispone de datos de rendimiento comparado porque este fine-tune no ha publicado benchmarks.

## Limitaciones y advertencias

- Ausencia total de documentacion sobre el dataset de entrenamiento: se desconoce que datos legales, en que idioma y con que filtrado se usaron, lo que impide evaluar sesgos y calidad.
- Riesgo elevado de alucinacion en contenido juridico: un modelo de 1,5B no tiene capacidad para razonar con precision sobre normativa, jurisprudencia ni plazos legales. Cualquier salida de este tipo debe considerarse no fiable.
- Desajuste entre el nombre del repositorio ("legal-id") y los metadatos de idioma (solo ingles): si el ajuste se hizo sobre textos en otro idioma, el modelo puede degradarse en ingles y viceversa.
- Posible degradacion respecto al modelo base: el fine-tuning sobre una base cuantizada a 4 bits puede reducir capacidades generales como matematicas o codigo, algo no evaluado por el autor.
- Herencia de sesgos del modelo base Qwen2.5, que no han sido medidos ni mitigados especificamente en este repositorio.
- La licencia Apache-2.0 permite uso comercial, pero al derivar de Qwen2.5 conviene verificar que se cumplen las condiciones de la licencia original del modelo base.
- Sin historial de uso: 0 descargas y 0 likes implican que no existe validacion comunitaria, ni issues resueltas, ni evidencia de comportamiento en produccion.
- No hay cuantizaciones publicadas, por lo que desplegar en CPU o GPUs muy limitadas requiere conversion manual a GGUF.
- Fecha de creacion inusual en los metadatos (2026), lo que puede indicar un error de marca temporal o un repositorio de prueba.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/apiskecil/qwen2.5-1.5b-legal-id-sft
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit
- Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de HuggingFace: https://github.com/huggingface/trl
- Informe tecnico de Qwen2.5: https://arxiv.org/abs/2412.15115
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/

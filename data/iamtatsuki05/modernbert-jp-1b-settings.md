# iamtatsuki05/ModernBERT-JP-1B-settings

## Resumen

ModernBERT-JP-1B-settings es un repositorio de configuración publicado por iamtatsuki05 que define la arquitectura de un modelo ModernBERT (encoder) a escala de 1B de parámetros, alineado con el tamaño de sbintuitions/sarashina2.2-1b y utilizando el tokenizador de sarashina2.2 con un vocabulario de 102.400 tokens. No contiene pesos: es únicamente el esqueleto de configuración desde el que se instancia un modelo con pesos inicializados aleatoriamente mediante `AutoModelForMaskedLM.from_config()`.

El modelo forma parte del proyecto MIREI, orientado al análisis comparativo de arquitecturas encoder y decoder para embeddings de frases en japonés bajo condiciones controladas. Su relevancia es metodológica: permite entrenar un encoder ModernBERT con el mismo tokenizador y presupuesto de parámetros que un decoder de referencia, aislando así el efecto de la arquitectura en las evaluaciones.

Al tratarse de un repositorio de configuración sin pesos entrenados, no es utilizable directamente para inferencia de producción. Su valor está en servir de base reproducible para el preentrenamiento con objetivo masked language modeling (MLM) en japonés, con una longitud máxima de secuencia de 8.192 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer, masked LM) |
| Parametros totales | ~1B (escala alineada con sarashina2.2-1b; recuento exacto no disponible en la informacion proporcionada) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (repositorio solo de configuracion, sin pesos) |
| Idiomas soportados | japones (ja) |
| Licencia | MIT |
| Formato de pesos | ninguno (repositorio de configuracion; no contiene safetensors ni GGUF) |

Otros datos tecnicos recogidos en la model card: dimension de embedding de 1792, codificacion posicional RoPE, tokenizador SentencePiece con vocabulario de 102.400 tokens, y requisitos de `transformers>=4.51.0`, `accelerate>=1.6.0`, `sentencepiece>=0.2.0` y `flash-attn>=2.7.3`.

## Arquitectura y entrenamiento

La arquitectura es ModernBERT, un encoder transformer con codificacion posicional rotatoria (RoPE), pensado para tareas de comprension y representacion de texto. La configuracion fija una dimension de embedding de 1792 y una longitud maxima de secuencia de 8.192 tokens, con el tokenizador SentencePiece de sarashina2.2 (102.400 entradas). El objetivo declarado es replicar la escala de parametros de sarashina2.2-1b para permitir comparaciones controladas entre encoder y decoder.

No se proporciona informacion sobre datos de entrenamiento, numero de tokens, composicion del corpus ni si hubo RLHF o DPO. De hecho, el repositorio no contiene pesos entrenados: los pesos se inicializan de forma aleatoria al instanciar el modelo desde la configuracion. El modelo derivado iamtatsuki05/ModernBERT-JP-1B-init es el punto de partida para el preentrenamiento con objetivo masked language modeling (MLM).

## Capacidades

- Generacion de representaciones contextuales de texto japones mediante un encoder bidireccional (una vez entrenado).
- Relleno de mascaras (fill-mask) y, por extension, tareas de comprension: clasificacion de secuencias, NER, QA extractiva y similitud semantica.
- Procesamiento de secuencias largas de hasta 8.192 tokens gracias a RoPE y a la arquitectura ModernBERT.
- Tokenizacion especifica para japones con vocabulario de 102.400 tokens (SentencePiece).
- Soporte de tool calling / function calling: no disponible (no es un modelo generativo ni de instrucciones).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al japones segun la model card.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Preentrenamiento de un encoder japones desde cero: el repositorio sirve como plantilla de configuracion para lanzar un MLM sobre corpus japones con un presupuesto de ~1B de parametros, garantizando compatibilidad con el tokenizador de sarashina2.2.
- Investigacion comparativa encoder vs. decoder: al compartir tokenizador y escala con sarashina2.2-1b, permite aislar el efecto de la arquitectura en tareas de embeddings de frases, que es el objetivo declarado del proyecto MIREI.
- Generacion de embeddings para busqueda semantica en japones: tras el entrenamiento, el encoder puede producir representaciones para recuperacion de documentos y similitud semantica con contexto de 8.192 tokens.
- Clasificacion de documentos largos en japones: contratos, informes o articulos que superan los limites tipicos de 512 tokens de los encoders clasicos, aprovechando la ventana de 8.192 tokens.
- Extraccion de informacion y NER en japones: ajuste fino sobre el checkpoint inicializado para tareas de etiquetado de entidades en dominios especializados.
- Reproducibilidad de experimentos academicos: sirve como artefacto de configuracion para replicar los resultados del articulo de NLP2026 sobre analisis de embeddings por arquitectura.
- Base para destilacion o inicializacion de modelos mas pequenos: la configuracion puede adaptarse reduciendo capas y dimensiones para experimentos de eficiencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene pesos entrenados, por lo que no existen metricas de rendimiento asociadas a esta configuracion.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplicable directamente, ya que el repositorio no incluye pesos. Para un modelo de ~1B de parametros en precision fp16 se estiman aproximadamente 2 GB solo de pesos; en fp32, unos 4 GB, a los que se suman activaciones y cache.
- GPU recomendadas (para el preentrenamiento derivado): A100 40/80 GB, H100, o GPUs consumer de gama alta como RTX 4090 (24 GB) para entrenamiento con precision mixta y gradient checkpointing.
- Cabe en GPU consumer: si, para inferencia de un checkpoint de ~1B en fp16 o cuantizado (8-16 GB de VRAM), aunque la longitud de contexto de 8.192 tokens incrementa el uso de memoria por atencion.
- Opciones de despliegue: transformers con accelerate y flash-attn (segun los requisitos de la model card); vLLM, llama.cpp u Ollama no son aplicables a esta configuracion sin pesos, aunque podrian usarse con un checkpoint entrenado derivado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Pesos disponibles |
|---|---|---|---|---|---|
| ModernBERT-JP-1B-settings | ~1B | 8.192 | Encoder ModernBERT (config) | MIT | No (solo configuracion) |
| sbintuitions/sarashina2.2-1b | ~1B | no disponible en la informacion proporcionada | Decoder | no disponible en la informacion proporcionada | Si |
| iamtatsuki05/ModernBERT-JP-1B-init | ~1B | 8.192 | Encoder ModernBERT (inicializado) | MIT | Si (inicializacion aleatoria) |

La comparacion con otros encoders japoneses de ~1B no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No contiene pesos entrenados: los pesos se inicializan aleatoriamente; no es utilizable para inferencia real sin un preentrenamiento previo.
- Solo soporta japones segun la model card; no hay evidencia de capacidades multilingues.
- Al ser un encoder MLM, no genera texto de forma autoregresiva ni soporta instrucciones, tool calling ni agentes.
- Riesgo de sesgos y alucinaciones: no evaluable sin pesos entrenados; cualquier sesgo dependera del corpus de preentrenamiento que se utilice.
- La licencia MIT permite uso comercial, pero el modelo derivado entrenado debera revisarse por separado en funcion de los datos usados.
- El repositorio tiene 0 descargas y 0 likes, y un tamano de 0.0 GB, lo que confirma que es un artefacto de configuracion y no un modelo distribuible.
- Dependencias estrictas (`transformers>=4.51.0`, `flash-attn>=2.7.3`) que pueden limitar la portabilidad en entornos sin GPU compatible con FlashAttention.

## Enlaces

- Hugging Face: https://huggingface.co/iamtatsuki05/ModernBERT-JP-1B-settings
- Checkpoint inicializado: https://huggingface.co/iamtatsuki05/ModernBERT-JP-1B-init
- Coleccion MIREI: https://huggingface.co/collections/iamtatsuki05/mirei
- GitHub del proyecto: https://github.com/iamtatsuki05/MIREI
- Modelo de referencia sarashina2.2-1b: https://huggingface.co/sbintuitions/sarashina2.2-1b
- Licencia MIT: https://opensource.org/license/mit/
- Articulo de referencia (NLP2026): "同一条件下における Encoder/Decoder アーキテクチャによる文埋め込みの性能分析", Okada y Sugimoto, Actas de la 32.ª Conferencia Anual de la Sociedad de Procesamiento del Lenguaje de Japon (NLP2026).

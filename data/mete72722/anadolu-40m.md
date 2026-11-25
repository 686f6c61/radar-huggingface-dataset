# mete72722/anadolu-40m

## Resumen

Anadolu-40M es un modelo de lenguaje causal en turco de 40.178.176 parámetros entrenado desde cero por el desarrollador independiente mete72722. Se trata de un transformer decoder-only con pesos compatibles con GPT-2, lo que permite cargarlo con `AutoModelForCausalLM` y aprovechar todo el ecosistema de `transformers` sin código personalizado. Su rasgo más distintivo es que todo el ciclo —preentrenamiento, ajuste fino y servicio— se realizó en una única CPU Intel i7-7700, e incluye un motor de inferencia escrito solo en NumPy que funciona sin PyTorch ni CUDA.

El modelo emplea una ventana de contexto de 512 tokens y un vocabulario byte-level BPE de 16.389 entradas sin token `UNK`. Fue preentrenado con aproximadamente 344 millones de tokens procedentes de Wikipedia en turco y del Bilkent Turkish Writings Dataset v2, y posteriormente ajustado con supervisión (SFT) para formato conversacional mediante plantillas de chat con tokens especiales `<|user|>`, `<|assistant|>` y `<|end|>`.

Su relevancia es acotada pero clara: demuestra que es viable entrenar y desplegar un modelo conversacional funcional en turco sobre hardware de consumo sin GPU, y ofrece una API compatible con OpenAI de forma gratuita. No obstante, el propio autor advierte que no es un sustituto de modelos grandes y que su calidad está limitada por su tamaño y por un corpus de entrenamiento relativamente pequeño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (compatible con GPT-2) |
| Parametros totales | 40.178.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | float32 nativo; export NumPy fp32; conversión a GGUF/llama.cpp posible según la model card (no se listan cuantizaciones publicadas) |
| Idiomas soportados | Turco (tr) |
| Licencia | other (no se especifican términos en la información disponible) |
| Formato de pesos | safetensors (repositorio `transformers`); export adicional `numpy-fp32` |
| Capas / cabezas / d_model | 10 / 8 / 512 |
| Tamano interno MLP | 2048 (GELU, aproximación tanh / `gelu_new`) |
| Vocabulario | 16.389 (byte-level BPE estilo GPT-2, sin `UNK`) |
| Codificacion posicional | Aprendida |
| Normalizacion | Pre-LayerNorm, eps = 1e-5 |
| Embeddings | Atados entrada/salida |
| Precision | float32 |
| Runtime | NumPy únicamente (export `numpy-fp32`) |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estándar de 10 capas, 8 cabezas de atención y dimensión de modelo 512, con capa MLP interna de 2048 y activación GELU en su variante `gelu_new` (aproximación tanh). Usa Pre-LayerNorm con eps de 1e-5, codificación posicional aprendida y embeddings de entrada y salida atados. Los pesos son directamente compatibles con GPT-2, lo que habilita `GPT2LMHeadModel`, `pipeline("text-generation")`, ajuste fino con LoRA y conversión a GGUF/llama.cpp sin código específico.

El entrenamiento se realizó en dos etapas sobre CPU. La primera consistió en preentrenamiento desde cero seguido de una adaptación al contexto de 512 tokens, usando Wikipedia en turco (`wikimedia/wikipedia`, `20231101.tr`, CC BY-SA) y el Bilkent Turkish Writings Dataset v2, con un corpus de aproximadamente 870,8 millones de caracteres (~227,6 millones de tokens BPE disponibles) y 344.064.000 tokens vistos según los metadatos del export. La segunda etapa fue un ajuste fino supervisado (SFT) para chat de unas 500 iteraciones (mejor checkpoint de validación de una ejecución de 600), con 1.399 ejemplos de chat en turco escritos a mano y 208 pares destilados de modelos mayores. El checkpoint de origen fue `checkpoints/anadolu40x512b/sft512c.pt` y el export `numpy-fp32` se generó el 2026-11-18. No se menciona uso de RLHF ni DPO.

## Capacidades

- Generación de texto causal en turco con formato conversacional multi-turno mediante plantilla de chat.
- Conversación con roles delimitados por tokens especiales (`<|user|>`, `<|assistant|>`, `<|end|>`, `<|bos|>`, `<|pad|>`).
- Codificación byte-level BPE sin token `UNK`: cualquier byte de entrada es representable.
- Inferencia sin PyTorch ni CUDA gracias al motor NumPy incluido.
- Compatibilidad con el ecosistema `transformers`: carga con `AutoModelForCausalLM`, uso con `pipeline`, ajuste fino con LoRA y conversión a GGUF/llama.cpp.
- Despliegue en CPU y en hardware de consumo; el autor lo sirvió en un Intel i7-7700.
- API compatible con OpenAI y bot de Discord con memoria por usuario (según la model card).
- No se documentan capacidades de visión, audio, tool calling, function calling ni modo de razonamiento extendido.

## Casos de uso

- Asistente conversacional ligero en turco sobre CPU: el modelo puede mantener diálogos de varios turnos dentro de su ventana de 512 tokens, adecuado para entornos sin GPU o con presupuesto de hardware mínimo.
- Despliegue en dispositivos embebidos o servidores de bajos recursos: el export NumPy fp32 y los 0,3 GB del repositorio permiten ejecutarlo sin instalar PyTorch ni CUDA.
- Prototipado rápido de aplicaciones de chat en turco: la compatibilidad con GPT-2 y `transformers` permite integrarlo en pipelines existentes y experimentar con plantillas de chat sin código a medida.
- Base para ajuste fino con LoRA: al ser un GPT-2 estándar, sirve como punto de partida económico para adaptar el modelo a dominios concretos en turco con recursos limitados.
- Generación de texto corto y completado de frases en turco: útil para tareas de autocompletado o generación de borradores donde la coherencia a corto plazo es suficiente.
- Investigación educativa sobre entrenamiento desde cero: el modelo documenta todo el proceso (corpus, tokens vistos, etapas, métricas de validación) y sirve como referencia reproducible para estudiar el ciclo completo en CPU.
- Integración en bots de chat comunitarios: el autor lo emplea en un bot de Discord con memoria por usuario y en una API compatible con OpenAI, patrón replicable para comunidades turcoparlantes.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Perdida de validacion (language modelling) | 3,8330 |
| Perplejidad | 46,199 |
| Perdida de validacion en preentrenamiento | 2,9253 |
| Perdida de validacion tras SFT | 0,4566 |
| Configuracion de evaluacion LM | 128 secuencias, 65.408 tokens, bloque 512, semilla 1234 |

La perplejidad se midió sobre texto turco reservado de la misma distribución que el entrenamiento y, según el autor, no constituye una comparación con otros modelos turcos: no se ha ejecutado ningún benchmark equivalente. La model card señala además que el reentrenamiento con un conjunto SFT mayor y más limpio elevó la perplejidad de LM (26,1 a 46,2) mientras mejoraba la calidad de las respuestas: en un conjunto de prueba de 8 prompts la tasa de defectos por respuesta bajó de 0,38 a 0,00, las 8 respuestas fueron correctas y no hubo bucles de repetición. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; en fp32 los 40,18 millones de parámetros ocupan aproximadamente 160 MB de pesos, más el estado de inferencia.
- GPU recomendadas: ninguna imprescindible; el autor lo entrenó y sirvió en una CPU Intel i7-7700.
- Cabe en cualquier GPU de consumo e incluso en CPU; también en entornos sin PyTorch mediante el motor NumPy.
- Opciones de despliegue: `transformers` (PyTorch), motor NumPy incluido, `text-generation-inference` (etiqueta del repositorio), conversión a GGUF/llama.cpp según la model card, y API compatible con OpenAI alojada por el autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Anadolu-40M | 40,18 M | 512 | Turco | other | Entrenado desde cero en CPU; pesos GPT-2; motor NumPy |
| Modelos GPT-2 small | 124 M | 1024 | Inglés principalmente | MIT (según versión) | Referencia de la familia compatible; no específico para turco |
| Modelos turcos de mayor tamano (p. ej. familia Turkish LLM) | no disponible | no disponible | Turco | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de comparaciones directas con otros modelos turcos de tamaño similar en la información proporcionada; el propio autor indica que no se ha ejecutado un benchmark equivalente contra otros modelos.

## Limitaciones y advertencias

- Modelo pequeño: el autor advierte explícitamente que no es un sustituto de GPT-4.
- Ventana de contexto muy reducida (512 tokens), que limita diálogos largos y documentos extensos.
- Perplejidad de 46,199 sobre texto de la misma distribución que el entrenamiento; la calidad fuera de esa distribución no está caracterizada.
- Recomendación de decodificación codiciosa (`do_sample=False`): la decodificación por muestreo es menos fiable, y `no_repeat_ngram_size=3` degrada la salida hacia subpalabras raras y palabras sin sentido.
- Riesgo de bucles de repetición y de respuestas incoherentes en preguntas de conocimiento; el autor mitiga parte de esto en producción con una base de conocimiento del servicio.
- Entrenado solo en turco; no se documenta soporte multilingüe.
- Licencia "other" sin términos detallados en la información disponible: es necesario consultar el repositorio antes de un uso comercial.
- Conjunto SFT reducido (1.399 ejemplos manuales y 208 pares destilados), lo que limita la diversidad conversacional.
- No se documentan evaluaciones de sesgo, alucinación ni seguridad.
- La perplejidad de LM y la calidad de chat pueden moverse en direcciones opuestas, según advierte el propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mete72722/anadolu-40m
- Demo y API compatible con OpenAI: https://anadoluai.duckdns.org:8443
- Dataset de Wikipedia en turco: https://huggingface.co/datasets/wikimedia/wikipedia
- Bilkent Turkish Writings Dataset v2: https://zenodo.org/records/15498155

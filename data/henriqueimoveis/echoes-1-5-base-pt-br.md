# henriqueimoveis/Echoes-1.5-Base-PT-BR

## Resumen

Echoes-1.5-Base-PT-BR es un modelo de lenguaje de 870 millones de parámetros entrenado desde cero exclusivamente en portugués brasileño, desarrollado por el autor henriqueimoveis. Es el sucesor de Echoes-1-Base-PT-BR (536M parámetros, 17,2B tokens) y supone un salto tanto en parámetros como en tokens de entrenamiento y arquitectura, al adoptar el esquema Qwen3Next denso en lugar del anterior.

El modelo está pensado para completar texto en el registro del portugués brasileño informal, con un corpus dominado por foros de los años 2000 (Adrenaline, HardMOB, Clube do Hardware, Orkut). Entrenado con 20B tokens (aproximadamente 23 tokens por parámetro, por encima del punto Chinchilla), el proyecto destaca por haberse realizado íntegramente con TPU v5e-8 gratuita de Kaggle en sesiones de 9 horas, lo que lo convierte en un ejemplo relevante de entrenamiento de LLM con recursos limitados. Es un modelo base, sin fine-tuning de instrucciones, pensado para generación de texto en bruto y no para conversación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3Next denso (GQA 12Q/2KV, head_dim 128, QK-norm, SwiGLU MLP 8192) |
| Parametros totales | 870.248.448 (embeddings amarrados) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4096 tokens (RoPE θ=1M, rotary parcial 0.25; entrenado en 2048) |
| Tipos de cuantizacion | no disponible (pesos en BF16, compatibles con cuantizacion estandar) |
| Idiomas soportados | portugues (pt-BR) |
| Licencia | WTFPL |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura Qwen3Next en su variante densa, con 18 capas, dimension oculta de 1536 y MLP intermedio de 8192 con activacion SwiGLU. Emplea atencion por grupos (GQA) con 12 cabezas de consulta y 2 de clave/valor, head_dim 128 y normalizacion QK. Aunque declara `model_type: qwen3_next`, todas las capas son de atencion completa (no lineal), por lo que la implementacion en transformers requiere `use_cache=False` para evitar un error conocido en la generacion.

El entrenamiento se realizo con JAX, optax y orbax sobre TPU v5e-8 de Kaggle, con precision BF16. El corpus es exclusivamente portugues brasileño, con fuerte presencia de foros de los años 2000 (Adrenaline, HardMOB, Clube do Hardware, Orkut) y texto general en pt-BR. Se entrenaron 20.000.014.336 tokens (20B), con una fase final de annealing con decaimiento de learning rate. El tokenizer es BPE propio de 32.000 tokens, con los tokens especiales `<pad>`, `<unk>`, `<s>`, `</s>` y `<doc>` (este ultimo para separar documentos y habilitar masking intra-documento).

## Capacidades

- Generacion de texto en portugues brasileño, especialmente en registro informal y de foro (girias, ortografia de la epoca, opiniones contundentes).
- Completado de texto en bruto (modelo base, sin instrucciones).
- Reproduccion fiel del estilo de escritura de foros brasileños de los años 2000.
- Soporte de contexto de hasta 4096 tokens (entrenado en 2048, extrapolado con RoPE θ=1M).
- Sin soporte de tool calling, function calling, agentes, vision ni audio.
- Capacidad multilingue: practicamente nula, entrenado solo en portugues.

## Casos de uso

- Generacion de contenido nostálgico o de caracter historico: el modelo puede producir texto que imita el estilo de los foros brasileños de los años 2000, util para proyectos de arqueologia digital, recreacion de comunidades desaparecidas o estudios sociolinguisticos.
- Aumento de datos para entrenamiento de otros modelos: al generar texto en pt-BR informal, puede servir para enriquecer datasets de entrenamiento de modelos de comprension del portugues coloquial.
- Prototipado de aplicaciones de completado de texto en portugues: por su tamano reducido (870M), puede desplegarse en entornos con recursos limitados para experimentar con generacion de texto en pt-BR.
- Base para fine-tuning de instrucciones: el autor ya ofrece una variante Instruct, pero este modelo base puede adaptarse a dominios especificos (foros, redes sociales, atencion al cliente informal) mediante fine-tuning.
- Investigacion sobre entrenamiento con recursos limitados: al haberse entrenado en TPU gratuita, sirve como caso de estudio para reproducir pipelines de entrenamiento de LLM con presupuesto minimo.
- Generacion de dialogos o narrativas en portugues coloquial: para guiones, literatura experimental o simulaciones de conversaciones de la epoca de los foros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una medicion interna de aritmetica: 0 aciertos en 36 operaciones, atribuido al tokenizer que fragmenta los numeros de forma inconsistente. No hay datos de MMLU, HumanEval, GSM8K ni otros benchmarks estandar.

## Requisitos de hardware

- VRAM estimada: los pesos en BF16 ocupan aproximadamente 1,7 GB (tamano del repo). Con cuantizacion de 4 bits, cabria en ~500 MB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para BF16 (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 3060 o superiores). Para cuantizacion 4-bit, basta con 1 GB.
- Cabe en GPUs de consumo: si, incluso en las mas modestas.
- Opciones de despliegue: transformers (con `use_cache=False` obligatorio), text-generation-inference (indicado en los tags), y potencialmente vLLM, llama.cpp u Ollama si se convierte a GGUF (no confirmado).
- Latencia y throughput: no disponible, pero al ser un modelo de 870M, la generacion es rapida incluso en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokens de entrenamiento | Licencia | Registro |
|---|---|---|---|---|---|
| Echoes-1.5-Base-PT-BR | 870M | 4096 | 20B | WTFPL | pt-BR informal/foros |
| Echoes-1-Base-PT-BR | 536M | 4096 (estimado) | 17,2B | WTFPL | pt-BR informal/foros |
| Otros modelos pequenos en portugues | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables en el mismo nicho (portugues brasileño informal, tamano sub-1B) en los resultados de busqueda. La comparativa se limita al predecesor directo.

## Limitaciones y advertencias

- Alucinacion factual con alta confianza: el autor advierte que el modelo afirma errores sin dudar; no debe usarse como fuente de hechos.
- Incapacidad aritmetica total: 0 aciertos en 36 operaciones, debido a la fragmentacion inconsistente de numeros por el tokenizer. No se resuelve con mas datos.
- Monolingue: solo portugues; cualquier otro idioma produce resultados deficientes.
- Modelo base: no sirve para conversacion ni instrucciones; requiere la variante Instruct o fine-tuning.
- Sin alineamiento de seguridad: reproduce el contenido de los foros, incluyendo opiniones fuertes, lenguaje soez y posiblemente contenido ofensivo.
- Problema de generacion conocido: requiere `use_cache=False` en transformers, lo que implica reprocesar la ventana en cada paso (coste bajo por contexto corto, pero limitante para despliegues de alto rendimiento).
- Licencia WTFPL: permite uso comercial sin restricciones, pero sin garantias ni responsabilidad del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/henriqueimoveis/Echoes-1.5-Base-PT-BR
- Variante Instruct: https://huggingface.co/henriqueimoveis/Echoes-1.5-Instruct-PT-BR
- Predecesor Echoes-1-Base: https://huggingface.co/henriqueimoveis/Echoes-1-Base-PT-BR
- Echoes-1-Instruct (generacion anterior): https://huggingface.co/henriqueimoveis/Echoes-1-Instruct-PT-BR
- Ficha en llm-explorer: https://llm-explorer.com/model/henriqueimoveis%2FEchoes-1-Base-PT-BR,1whAYeqr70W6ED2jJ9A6zi
- Opcion de despliegue en FriendliAI: https://friendli.ai/models/henriqueimoveis/Echoes-1-Base-PT-BR

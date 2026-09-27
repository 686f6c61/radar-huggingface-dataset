# divyanshumishra/Adivyanta-46M

## Resumen

Adivyanta 46M es un modelo de lenguaje decoder-only tipo GPT entrenado desde inicialización aleatoria por el desarrollador divyanshumishra. Cuenta con 46.349.312 parámetros y un tokenizador BPE a nivel de byte propio de 16.384 tokens, sin reutilizar pesos preentrenados de ningún otro modelo o tokenizador. Está diseñado como un experimento de investigación y aprendizaje para chat en inglés, hindi y hinglish (hindi romanizado), no como un asistente fiable de producción.

La arquitectura es un transformer decoder-only compacto de 12 capas, 8 cabezas de atención, 512 dimensiones ocultas y embeddings de entrada/salida atados, con una ventana de contexto de solo 256 tokens. El proyecto se publica bajo licencia MIT y se distribuye en dos variantes: un checkpoint base y otro afinado para conversación. El autor lo posiciona explícitamente como una release experimental y advierte que no ha demostrado ninguna ventaja medible sobre asistentes establecidos como Qwen.

Su relevancia es principalmente didáctica: documenta de forma transparente el pipeline completo de entrenamiento (datos, recuento de pasos, métricas de pérdida y fallos conocidos) y sirve como ejemplo reproducible de entrenamiento from-scratch de un modelo pequeño multilingüe con recursos limitados. No es adecuado para tareas que requieran razonamiento fiable, veracidad factual o contexto largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT |
| Parametros totales | 46.349.312 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors) |
| Idiomas soportados | Ingles (en), hindi (hi) e hinglish (hindi romanizado) |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors, chat_model.safetensors) |

Detalles adicionales de arquitectura: 12 capas de decoder, 8 cabezas de atencion, 512 dimensiones ocultas, embeddings de entrada y salida atados. Tokenizador BPE a nivel de byte propio de 16.384 tokens. Tamano del repositorio: 0,2 GB.

## Arquitectura y entrenamiento

Adivyanta 46M es un transformer decoder-only de estilo GPT entrenado completamente desde inicializacion aleatoria. Emplea embeddings de entrada y salida atados (weight tying), 12 capas, 8 cabezas de atencion y 512 dimensiones ocultas, con un tokenizador BPE a nivel de byte de 16.384 tokens disenado especificamente para el proyecto. La ventana de contexto es de solo 256 tokens, lo que limita drasticamente las tareas que requieren memoria conversacional o documentos extensos.

El entrenamiento se realizo en dos fases principales: los primeros 6.000 pasos usaron 120.449 pares de entrenamiento seleccionados, y despues se continuo hasta 12.000 pasos totales sobre un split ampliado de 254.828 pares. La variante de chat recibio 3.000 pasos adicionales sobre ejemplos conversacionales. Las fuentes de datos son Aya Collection, OpenAssistant OASST1, Hinglish Instruct 10K, UltraChat 200K y GSM8K, mas 16 ejemplos originales; las tarjetas de origen declaran licencias Apache-2.0 o MIT. Las preguntas oficiales del test de GSM8K se excluyeron del entrenamiento. No se documenta el uso de RLHF, DPO ni decodificacion especulativa; el entrenamiento se limita a ajuste de siguiente token sobre la distribucion de las fuentes.

## Capacidades

- Generacion de texto autoregresiva en ingles, hindi y hinglish.
- Conversacion multi-turno de forma limitada (variante chat), restringida por el contexto de 256 tokens.
- Produccion de texto en Devanagari para hindi, aunque el propio autor senala que a menudo genera hindi malformado.
- Capacidad matematica practicamente nula: 0 de 50 en el subconjunto de GSM8K (variante chat).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta thinking mode, vision ni audio.
- Capacidades multilingues limitadas a en, hi y hinglish; el propio autor advierte de mezcla de idiomas.

## Casos de uso

- Experimentacion academica con entrenamiento from-scratch: sirve como referencia reproducible para estudiar como se comporta un transformer pequeno entrenado con datos multilingues y recursos limitados, incluyendo metricas de perdida y ejemplos de fallo.
- Practicas de tokenizacion BPE multilingue: dado que incluye su propio tokenizador de 16.384 tokens con soporte Devanagari, es util para analizar como un vocabulario pequeno maneja el hindi y el hinglish romanizado.
- Docencia sobre limitaciones de modelos pequenos: el repositorio documenta explicitamente alucinaciones, repeticiones y mezcla de idiomas, por lo que puede usarse como caso de estudio de por que un modelo de 46M no es fiable en tareas factuales.
- Prototipado de juguete en local: cabe en cualquier equipo y permite ejecutar inferencia en CPU para pruebas de concepto sin GPU.
- Generacion creativa exploratoria en hinglish: la variante chat tiene menor perdida en hinglish (3,0491 frente a 3,7901 del base), por lo que es la opcion mas razonable para generar texto informal en hindi romanizado, siempre con revision humana.
- Investigacion sobre desalineacion y sesgos en corpus traducidos y sinteticos: los datos incluyen respuestas traducidas y plantillas, lo que permite estudiar la propagacion de errores y sesgo social en modelos pequenos.
- Comparacion de variantes base frente a chat: el repositorio permite comparar ambos checkpoints con el mismo prompt y semilla para analizar el efecto del ajuste conversacional en la perdida por idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, etc.) en la informacion disponible. El autor unicamente reporta metricas de perdida de siguiente token y un resultado de GSM8K:

| Medicion | Base | Variante chat |
|---|---:|---:|
| Perdida de tokens de respuesta en validacion ampliada | 3,0588 | — |
| Perdida de tokens de respuesta, validacion de chat (100 ejemplos) | 4,5346 | 3,9881 |
| Perdida en test de ingles (884 ejemplos) | 4,3479 | 4,6052 |
| Perdida en test de hindi (1.391 ejemplos) | 2,0542 | 2,5803 |
| Perdida en test de hinglish (42 ejemplos) | 3,7901 | 3,0491 |
| GSM8K test oficial, subconjunto sembrado de 50 preguntas (exactitud numerica) | — | 0/50 |

El propio autor advierte que la perdida mide ajuste al siguiente token sobre la distribucion de las fuentes, no veracidad ni utilidad, y que el resultado de GSM8K no respalda ninguna afirmacion de razonamiento matematico o logico fiable. La estimacion de hinglish se basa en solo 42 ejemplos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 185 MB en FP32, unos 93 MB en FP16/BF16, unos 46 MB en INT8 y unos 23 MB en INT4 (estimaciones teoricas a partir de los 46,3M de parametros; el repo ocupa 0,2 GB).
- GPU recomendadas: cualquier GPU es suficiente; no requiere A100, H100 ni tarjetas de gama alta.
- Cabe en GPU de consumo: si, en cualquier GPU moderna e incluso en GPU integradas; tambien funciona en CPU.
- Opciones de despliegue: no es un checkpoint de Transformers `AutoModel`, por lo que vLLM, TGI o llama.cpp no lo cargan directamente. El despliegue esta pensado mediante el codigo PyTorch propio del repositorio (`inference.py`, `model.py`), con dependencias de PyTorch, `tokenizers==0.22.2`, `safetensors` y `huggingface_hub`. El widget de inferencia de Hugging Face puede no ejecutarlo.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks que permitan comparar el rendimiento de Adivyanta 46M con alternativas. A continuacion se comparan caracteristicas tecnicas con modelos pequenos de la misma categoria, indicando que los resultados de calidad no estan disponibles para Adivyanta.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Adivyanta 46M | 46.349.312 | 256 tokens | MIT | safetensors + codigo PyTorch propio |
| Qwen2.5-0.5B | 494M | 32.768 tokens | Apache-2.0 (segun variante) | Transformers, vLLM, GGUF |
| SmolLM2-135M | 135M | 8.192 tokens | Apache-2.0 | Transformers, GGUF, llama.cpp |
| TinyLlama-1.1B | 1.1B | 2.048 tokens | Apache-2.0 | Transformers, GGUF |

Rendimiento comparado: no disponible. El autor de Adivyanta afirma explicitamente que su modelo no ha demostrado ninguna ventaja sobre Qwen ni sobre otros asistentes establecidos.

## Limitaciones y advertencias

- El propio autor lo describe como una release de investigacion/aprendizaje, no como un asistente fiable.
- Alucinacion frecuente: las respuestas suelen desviarse del tema e inventar hechos.
- Generacion de hindi malformado en muchos casos, pese a declarar soporte de hindi.
- Tendencia a repetir y a mezclar idiomas dentro de una misma respuesta.
- Manejo deficiente de consultas sensibles.
- Razonamiento y matematica practicamente inexistentes: 0/50 en el subconjunto de GSM8K, lo que no respalda ninguna afirmacion de logica o calculo fiables.
- Contexto muy limitado (256 tokens), insuficiente para conversaciones largas o documentos.
- Datos de entrenamiento con respuestas traducidas, plantillas y sinteticas, que pueden contener errores y sesgo social.
- La variante chat mejora en hinglish pero empeora en ingles e hindi respecto al base (perdidas de test mas altas), por lo que no es una mejora global.
- Capacidades de la app del proyecto (memoria local, calculadora, respuestas escritas a mano) no forman parte de los pesos del modelo y no estan disponibles en el checkpoint.
- Licencia MIT permite uso comercial de los pesos originales, pero se recomienda verificar las licencias de los datos de origen; los antiguos checkpoints de 9,71M del proyecto GitHub usaban Meta EmpatheticDialogues bajo CC BY-NC 4.0 y no se incluyen aqui.
- Para tareas factuales o consecuentes se requiere verificacion de fuentes y revision humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divyanshumishra/Adivyanta-46M
- Repositorio GitHub del proyecto: https://github.com/divyanshu-iitian/Adivyanta
- Informe completo de benchmarks: https://github.com/divyanshu-iitian/Adivyanta/blob/main/benchmarks/REPORT.md
- Documentacion de datasets: https://github.com/divyanshu-iitian/Adivyanta (ver `DATASETS.md`, `prepare_indic_data.py`, `prepare_expanded_data.py`)
- Datasets citados: CohereLabs/aya_collection, CohereLabs/aya_collection_language_split, OpenAssistant/oasst1, DSMJ910/hinglish-instruct-10k, HuggingFaceH4/ultrachat_200k, openai/gsm8k.

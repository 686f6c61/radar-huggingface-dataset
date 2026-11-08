# rabindra-dahal/romanized-to-devanagari-using-sentencepiece-tokenizer-nlp

## Resumen

El modelo `rabindra-dahal/romanized-to-devanagari-using-sentencepiece-tokenizer-nlp` es un sistema de traducción automática neuronal (NMT) de tipo seq2seq que convierte texto en nepalí romanizado —incluyendo jerga de chat habitual— a escritura devanagari. Lo desarrolla el usuario independiente rabindra-dahal y está construido íntegramente desde cero en PyTorch, sin depender de arquitecturas preentrenadas. Con aproximadamente 760.576 parámetros entrenables, es un modelo extremadamente compacto pensado para inferencia offline en entornos con recursos limitados.

La arquitectura es un transformer encoder-decoder de 2 capas por lado, con dimensión de embedding de 128, 4 cabezas de atención (dimensión por cabeza de 32) y capa feed-forward de 256 con activación ReLU. Utiliza un tokenizador SentencePiece Unigram compartido entre encoder y decoder con un vocabulario de solo 256 tokens, lo que reduce drásticamente el tamaño del modelo a costa de cobertura léxica.

Su relevancia es acotada pero clara: demuestra que es posible construir un transliterador funcional para nepalí romanizado con un presupuesto de parámetros mínimo, lo que permite desplegarlo en dispositivos de bajos recursos, aplicaciones móviles o entornos sin conexión. No obstante, su vocabulario reducido y su entrenamiento sobre un corpus orientado al aprendizaje infantil limitan su generalización a dominios abiertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (2 capas encoder / 2 capas decoder) |
| Parametros totales | ~760.576 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en `model.pt` de PyTorch; no se publican variantes GGUF ni cuantizadas) |
| Idiomas soportados | Nepalí (`ne`), en su variante romanizada como entrada y devanagari como salida |
| Licencia | MIT |
| Formato de pesos | PyTorch (`model.pt`) + tokenizador SentencePiece (`spm_nepali.model`) |
| Dimension de embedding (`D_MODEL`) | 128 |
| Cabezas de atencion (`NHEAD`) | 4 (dimension por cabeza de 32) |
| Dimension feed-forward | 256 (ReLU) |
| Vocabulario | 256 tokens (SentencePiece Unigram compartido) |
| Estrategia de decodificacion | Greedy (`argmax`) |
| Tamano del repo | 0.0 GB |

## Arquitectura y entrenamiento

El modelo implementa un transformer seq2seq clásico escrito a mano en PyTorch: un encoder de 2 capas y un decoder de 2 capas, con atención multi-cabeza de 4 cabezas y dimensión de modelo de 128. La capa feed-forward interna tiene 256 unidades y usa ReLU. El tokenizador es un SentencePiece Unigram compartido entre entrada y salida con `vocab_size=256`, lo que implica que tanto el texto romanizado como el devanagari se representan con el mismo conjunto de subtokens.

El entrenamiento se realizó sobre el dataset `rabindra-dahal/english-nepali-romanized-csv-text-for-kid-learning`, aumentado con sustituciones de sustantivos y fragmentos de una a dos palabras. No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del corpus ni si se aplicaron técnicas de RLHF o DPO (en un modelo de este tamaño y propósito, es esperable que no). La decodificación en inferencia es greedy (`argmax`), y el propio autor señala que un beam search mejoraría la fluidez. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Traducción de texto romanizado en nepalí a escritura devanagari, incluyendo frases cortas y jerga de chat habitual.
- Transliteración a nivel de palabra y de fragmentos de una a dos palabras, gracias al aumento de datos con fragmentos.
- Funcionamiento completamente offline: no requiere conexión ni servicios externos una vez descargados los pesos y el tokenizador.
- Inferencia en CPU o GPU de bajos recursos dado el reducido número de parámetros (~760K).
- Manejo de vocabulario común del dominio de aprendizaje infantil y conversación básica.
- No dispone de soporte documentado de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- Capacidad multilingüe limitada al par romanizado-devanagari del nepalí; no se documentan otros idiomas.

## Casos de uso

- Normalización de texto en aplicaciones de chat nepalí: convertir mensajes escritos en romanizado (frecuente en redes sociales y mensajería) a devanagari para su indexación, búsqueda o moderación, aprovechando que el modelo está entrenado con jerga de chat.
- Teclados y métodos de entrada en dispositivos móviles de bajos recursos: el modelo cabe en memoria y funciona offline, por lo que puede integrarse en un IME que ofrezca sugerencias en devanagari a partir de pulsaciones romanizadas.
- Preprocesamiento para pipelines de NLP en nepalí: convertir corpus romanizados a devanagari antes de pasarlos a modelos o herramientas que esperan escritura nativa, como analizadores morfológicos o correctores.
- Herramientas educativas para aprendizaje del nepalí: dado que el corpus de entrenamiento está orientado al aprendizaje infantil, el modelo puede emplearse en ejercicios de transcripción y práctica de escritura devanagari para principiantes.
- Prototipado rápido y demostraciones: con ~760K parámetros y licencia MIT, sirve como base para experimentos de NMT de bajo coste y para enseñar arquitecturas seq2seq sin requerir hardware potente.
- Transcripción de notas y apuntes personales: conversión offline de recordatorios o notas escritas en romanizado a devanagari en entornos sin conectividad, como zonas rurales o aplicaciones de escritorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con ~760K parámetros en fp32 los pesos ocupan aproximadamente 3 MB, más el tokenizador y las activaciones intermedias.
- GPU recomendadas: cualquier GPU consumer moderna es sobradamente suficiente; no se requiere A100 ni H100. Una GTX 1050, RTX 3050 o incluso una iGPU pueden ejecutar el modelo.
- Cabe en cualquier GPU consumer e incluso en CPU: la inferencia puede ejecutarse en CPU sin problemas de latencia perceptible para frases cortas.
- Opciones de despliegue: al ser un modelo PyTorch personalizado con código propio (`model.py`, `pipeline.py`, `vocabulary.py`), no es compatible directamente con vLLM, TGI, llama.cpp ni Ollama; el despliegue se realiza cargando los ficheros del repositorio con PyTorch y el tokenizador SentencePiece.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de milisegundos por frase en CPU, aunque no se documentan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| rabindra-dahal/romanized-to-devanagari-using-sentencepiece-tokenizer-nlp | ~760K | no disponible | MIT | Transformer seq2seq desde cero, romanizado a devanagari | Hugging Face + GitHub |
| Modelos NMT multilingües tipo NLLB-200 (Meta) | 600M–54B | hasta 512 tokens (version destilada) | CC-BY-NC (variantes) | NMT multilingüe, incluye nepalí | Hugging Face |
| Modelos tipo IndicTrans2 | 200M–1B | no disponible | MIT / variantes | Traducción entre lenguas índicas, incluye nepalí | Hugging Face |
| Modelos tipo MarianMT fine-tuneados para nepalí | ~70M–300M | ~512 tokens | MIT / Apache-2.0 según checkpoint | NMT supervisado por pares de idiomas | Hugging Face |

La comparación directa es limitada: los modelos multilingües citados cubren más idiomas y mayor contexto, pero requieren muchos más recursos y no están especializados en la conversión romanizado-devanagari. El modelo de rabindra-dahal destaca por su tamaño mínimo y su licencia permisiva, a costa de cobertura léxica y calidad acotadas.

## Limitaciones y advertencias

- Vocabulario muy reducido (256 tokens): los nombres propios y términos fuera de vocabulario complejos probablemente se transliteren de forma incorrecta o incompleta.
- Entrenado sobre un corpus orientado al aprendizaje infantil con aumentos sintéticos; la generalización a dominios técnicos, formales o conversacionales amplios es limitada.
- Decodificación greedy: el propio autor reconoce que un beam search mejoraría la fluidez; la salida puede ser menos natural en frases largas.
- Riesgo de alucinación y errores de transliteración en entradas ambiguas o con ortografía romanizada no estándar.
- Longitud de contexto no documentada; no se recomienda para párrafos largos.
- Sesgos conocidos: no documentados, pero el corpus infantil puede sesgar el vocabulario y el registro hacia un lenguaje simplificado.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías; conviene validar la calidad en el dominio concreto antes de producción.
- No compatible con runtimes estándar de inferencia (vLLM, llama.cpp, Ollama); requiere cargar código propio, lo que añade fricción de integración y mantenimiento.
- Repositorio con 0 descargas y sin actualizaciones posteriores a la creación; no hay evidencia de mantenimiento activo ni de validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/rabindra-dahal/romanized-to-devanagari-using-sentencepiece-tokenizer-nlp
- GitHub (repositorio principal): https://github.com/rabindra-dahal/romanized-to-devanagari-using-sentencepiece-tokenizer-nlp/tree/main
- GitHub (carpeta de aplicación): https://github.com/rabindra-dahal/romanized-to-devanagari-using-sentencepiece-tokenizer-nlp/tree/main/app
- Dataset de entrenamiento: https://huggingface.co/datasets/rabindra-dahal/english-nepali-romanized-csv-text-for-kid-learning

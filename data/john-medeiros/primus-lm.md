# john-medeiros/primus-lm

## Resumen

Primus-LM es un modelo de lenguaje de tipo GPT decoder-only con aproximadamente 14,2 millones de parámetros, entrenado desde cero por john-medeiros sobre un corpus de 100.000 sentencias judiciales brasileñas (ementas jurídicas). Se trata de un proyecto explícitamente educativo cuyo objetivo es comprender los fundamentos de los LLM mediante la implementación propia de la arquitectura Transformer, el bucle de entrenamiento y la inferencia en PyTorch, sin recurrir a frameworks de alto nivel ni a pesos preentrenados.

El modelo emplea una arquitectura Transformer pre-LN convencional de 6 capas, 6 cabezas de atención, dimensión oculta de 384 y FFN de 1536, con embeddings posicionales absolutos aprendidos, activación GELU, weight tying entre embedding y lm_head y dropout de 0,1. Su ventana de contexto es de solo 256 tokens y su vocabulario BPE byte-level de 8.000 tokens, lo que lo sitúa en la categoría de mini-LLM experimental.

Su relevancia es formativa más que práctica: demuestra que es posible entrenar un modelo funcional en una GTX 1060 de 6 GB en unos 80 minutos, con un consumo de memoria de aproximadamente 600 MB, y publicar los pesos en safetensors bajo licencia MIT. No está pensado como herramienta de investigación jurídica ni como sistema de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT decoder-only, Transformer pre-LN |
| Parametros totales | 14.211.072 (segun safetensors); ~13,8M segun model card |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente FP32) |
| Idiomas soportados | Portugues (pt) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Capas | 6 |
| Cabezas de atencion | 6 |
| Dimension oculta (d_model) | 384 |
| Dimension FFN (d_ff) | 1536 |
| Vocabulario | 8.000 tokens (BPE byte-level) |
| Embeddings posicionales | Absolutos, aprendidos |
| Activacion | GELU |
| Weight tying | Si (embedding a lm_head) |
| Dropout | 0,1 |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es un Transformer decoder-only de estilo GPT con normalizacion previa (pre-LN), 6 bloques, 6 cabezas de atencion, d_model de 384 y d_ff de 1536. Usa embeddings posicionales absolutos aprendidos, activacion GELU, weight tying entre la matriz de embedding y la cabeza de lenguaje, y dropout de 0,1. El tokenizador es BPE byte-level con vocab_size=8000, entrenado exclusivamente sobre el split de entrenamiento.

El entrenamiento se realizo sobre 100.000 ementas jurídicas brasileñas unicas (90.000 de entrenamiento y 10.000 de validacion), con deduplicacion mediante hash SHA-256 del texto normalizado en NFC. El corpus contiene aproximadamente 27,8M tokens de entrenamiento y 3,0M de validacion. Se uso AdamW (betas 0,9/0,95, eps 1e-8), learning rate de 3e-4, weight decay de 0,1, batch size de 4 con acumulacion de gradiente de 8 (batch efectivo 32), gradient clipping de 1,0, precision FP32, 10.000 pasos maximos y unas 80 horas... en concreto, unos 80 minutos en una NVIDIA GeForce GTX 1060 de 6 GB. En total se procesaron 81.920.000 tokens. No se menciona RLHF, DPO ni ninguna fase de alineacion posterior; el modelo es un preentrenamiento puro de modelado de lenguaje.

## Capacidades

- Generacion de texto autoregresiva en portugues, especializada en el registro y la estructura de ementas jurídicas brasileñas.
- Continuacion de prompts con encabezados típicos del dominio (por ejemplo, "APELACAO CIVEL. RESPONSABILIDADE CIVIL." o "HABEAS CORPUS. TRAFICO DE DROGAS.").
- Modelado de lenguaje a nivel de caracter/token con perplexidad de validacion de 6,2, lo que indica que ha capturado patrones superficiales del corpus.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; solo portugues.
- Modo thinking, vision o audio: no disponible.
- Generacion controlada por parametros de decodificacion (temperature, top_k, max_new_tokens) mediante el script `modeling_mini_llm.py`.

## Casos de uso

- Docencia y formacion en LLM: el modelo sirve como ejemplo completo y reproducible de un Transformer decoder-only entrenado desde cero, con codigo de arquitectura, tokenizador, entrenamiento e inferencia en un unico repositorio, ideal para cursos de introduccion.
- Practicas de ingenieria de tokenizacion: permite experimentar con un tokenizador BPE byte-level de 8.000 tokens entrenado sobre un corpus especializado y observar como afecta al rendimiento en dominios concretos.
- Reproduccion de experimentos a pequena escala: con 600 MB de VRAM y 80 minutos de entrenamiento en una GTX 1060, es viable repetir el pipeline completo y variar hiperparametros para estudiar su efecto sobre la loss de validacion.
- Generacion de borradores sinteticos de ementas: util para crear datos de prueba o ejemplos anotados en el desarrollo de pipelines de procesamiento de lenguaje juridico, siempre con revision humana y sin uso como fuente de verdad.
- Benchmarking de tecnicas de decodificacion: al ser un modelo pequeno y rapido, permite comparar temperature, top_k y otras estrategias de muestreo con bajo coste computacional.
- Estudio de limitaciones de contexto corto: con 256 tokens, es un banco de pruebas para analizar como degrada la coherencia en tareas que requieren contexto largo, y para evaluar tecnicas de truncado o resumen previo.
- Prototipado de interfaces de inferencia: el script standalone y la funcion `load_model`/`generate` permiten integrar el modelo en demos o notebooks educativos sin infraestructura adicional.

## Benchmarks y rendimiento

La model card declara un `model-index` con la lista de resultados vacia, por lo que no se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de rendimiento publicados son los de validacion durante el entrenamiento:

| Metrica | Valor |
|---|---|
| Validation loss final | 1,8238 |
| Perplexidad de validacion | 6,2 |
| Tokens totales procesados en entrenamiento | 81.920.000 |
| Uso de memoria GPU durante entrenamiento | ~600 MB |
| Tiempo de entrenamiento | ~80 minutos en GTX 1060 6 GB |

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~14M parametros en FP32, los pesos ocupan aproximadamente 57 MB; con el tokenizador y overhead de runtime, el consumo real es del orden de cientos de MB. La model card reporta ~600 MB de uso de GPU durante el entrenamiento.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; el autor entreno en una NVIDIA GeForce GTX 1060 de 6 GB.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU de consumo moderna e incluso en GPUs integradas o CPU.
- Opciones de despliegue: el repositorio incluye un script standalone (`modeling_mini_llm.py`) basado en PyTorch, safetensors y tokenizers. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; al no publicarse pesos en GGUF, el despliegue con esas herramientas requeriria conversion previa.
- Latencia y throughput: no disponibles de forma explicita; por el tamano del modelo se espera una latencia muy baja en GPU, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| primus-lm | ~14,2M | 256 | pt | MIT | safetensors | Entrenado desde cero en ementas juridicas brasileñas; proposito educativo |
| GPT-2 small | 124M | 1.024 | en (principalmente) | MIT | safetensors, GGUF | Referencia clasica de mini-LLM; mucho mayor y con corpus generalista |
| TinyLlama-1.1B | 1,1B | 2.048 | en, multilingue parcial | Apache 2.0 | safetensors, GGUF | Modelo pequeno de proposito general, ordenes de magnitud mayor |
| Qwen2.5-0.5B | 0,49B | 32.768 | multilingue | Apache 2.0 | safetensors, GGUF | Modelo pequeno moderno con contexto largo y soporte multilingue |

No se dispone de benchmarks comparativos publicados para primus-lm, por lo que la comparacion se limita a parametros, contexto y licencia. Las alternativas citadas no estan especializadas en portugues juridico.

## Limitaciones y advertencias

- Riesgo alto de alucinacion: el modelo aprende patrones estadisticos del corpus y puede inventar hechos, numeros de proceso, leyes o decisiones judiciales. No debe usarse como fuente juridica fiable.
- Ventana de contexto muy reducida (256 tokens), insuficiente para documentos juridicos completos o conversaciones multi-turno.
- Vocabulario reducido (8.000 tokens), lo que limita la cobertura lexica y puede fragmentar terminos poco frecuentes.
- Entrenado solo sobre ementas (resumenes de sentencias), no sobre textos legales completos, legislacion o jurisprudencia en profundidad.
- Con ~14M parametros no tiene capacidad para razonamiento complejo ni consistencia factual sostenida.
- El corpus es un subconjunto especifico de ementas juridicas brasileñas y puede no generalizar a otros dominios o variantes del portugues.
- Proyecto educativo, no un sistema de produccion: no se han publicado evaluaciones de sesgo, robustez ni seguridad.
- Licencia MIT: permite uso comercial y modificacion, pero el autor desaconseja explicitamente su uso como herramienta juridica; el corpus son ementas publicas y, segun la model card, no se incluyeron datos personales en los artefactos publicados.
- No se documentan fases de alineacion (RLHF/DPO), por lo que puede generar contenido inapropiado o no seguir instrucciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/john-medeiros/primus-lm
- Repositorio del autor en Hugging Face: https://huggingface.co/john-medeiros
- Script de inferencia incluido en el repo: `modeling_mini_llm.py` (referenciado en la model card)
- Licencia: archivo `LICENSE` del repositorio (MIT)

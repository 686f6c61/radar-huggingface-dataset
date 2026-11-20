# SableAI-Dev/Axon-Kit

## Resumen

Axon-Kit es un modelo de lenguaje de tipo decoder-only desarrollado por SableAI-Dev, una empresa que lo enmarca dentro de su sistema Axon. Se trata de la primera versión pública de una familia de modelos nombrados por mustélidos (Kit, Stout, Marten, Fisher) y representa un ejercicio de entrenamiento desde cero sobre una única GPU doméstica. Con 89,3 millones de parámetros, está pensado como un modelo base de generación de texto en ruso, no como un asistente conversacional.

El modelo se entrenó íntegramente desde cero sobre el subconjunto ruso del dataset FineWeb-2, sin inicialización desde pesos preexistentes. Su arquitectura es un transformer decoder-only convencional con LayerNorm, activación GELU, embeddings posicionales aprendidos y un vocabulario byte-level BPE de 16 000 tokens. La ventana de contexto es de 512 tokens, lo que limita su uso a tareas de continuación de texto de corto alcance.

Su relevancia es principalmente metodológica: demuestra que es posible entrenar un modelo de lenguaje funcional en hardware de consumo (una RTX 2060 de 6 GB) con un presupuesto de cómputo muy reducido (unas dos horas para la fase final). No obstante, el propio autor advierte que la calidad es limitada: el modelo está claramente infraentrenado, produce texto gramaticalmente plausible pero semánticamente incoherente y no ha pasado por fases de alineación como RLHF o DPO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT), LayerNorm, GELU, embeddings posicionales aprendidos |
| Parametros totales | 89 345 280 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible (pesos publicados solo en fp32) |
| Idiomas soportados | Ruso (principal); inglés listado en metadatos pero no funcional según el autor |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp32, ~357 MB) |

Otros datos técnicos: 16 capas, 10 cabezas de atención, dimensión de modelo 640, vocabulario de 16 000 tokens (byte-level BPE entrenado sobre el mismo corpus), pesos de embedding de tokens y capa de salida compartidos.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estándar de tipo GPT con 16 capas, 10 cabezas de atención y dimensión oculta de 640. Emplea LayerNorm, activación GELU y embeddings posicionales aprendidos. Los pesos de la matriz de embedding de tokens y de la capa de salida están atados (weight tying), lo que reduce el recuento de parámetros. La implementación es propia y no es compatible con `transformers` ni con vLLM; el código de inferencia se distribuye junto a los pesos en `model.py` y `generate.py`.

El entrenamiento se realizó desde cero sobre el subconjunto `rus_Cyrl` de FineWeb-2, tras descartar documentos de menos de 300 caracteres, quedando aproximadamente 131 millones de tokens. Se reservó el 1 % final del corpus como conjunto de validación, sin deduplicación ni filtrado adicional. El proceso constó de tres etapas (14 000 pasos con batch 8, 1 200 pasos con batch 64 y 5 000 pasos con batch 64) sumando unos 260 millones de tokens procesados, aproximadamente dos pasadas sobre el corpus. Se usó AdamW (betas 0,9/0,95, weight decay 0,1 solo en matrices), learning rate 3e-4 con calentamiento de 200 pasos y decaimiento coseno hasta 3e-5, precisión fp16 con escalado de pérdida automático y recorte de gradiente de 1,0. Todo el entrenamiento se ejecutó en una NVIDIA RTX 2060 de 6 GB a unos 23 500 tokens por segundo, con el corpus residente en RAM y preparación de batches en CPU mediante hilos en segundo plano. No hubo fases de RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generación de texto por continuación de prompt en ruso, con estilo similar al de páginas web.
- Modelo base sin ajuste por instrucciones: no responde a preguntas ni mantiene diálogos.
- Sin soporte de tool calling ni function calling.
- Sin capacidades de agente ni razonamiento multi-paso.
- Sin capacidades de visión, audio ni modo de razonamiento explícito.
- Multilingüismo muy limitado: solo ruso funcional; el inglés figura en los metadatos pero el autor indica que el modelo es casi inútil en otros idiomas.
- Contexto máximo de 512 tokens, insuficiente para documentos largos o conversaciones extensas.

## Casos de uso

- Experimentación educativa en entrenamiento de modelos desde cero: sirve como referencia reproducible para estudiar el pipeline completo (tokenizador, dataset, bucle de entrenamiento, evaluación) en hardware de consumo.
- Pruebas de infraestructura de inferencia propia: al requerir código personalizado, es útil para validar pipelines de carga de safetensors y generación con PyTorch antes de escalar a modelos mayores.
- Generación de texto sintético de relleno en ruso: puede producir texto con apariencia lingüística para pruebas de maquetación o carga en sistemas que solo necesitan cadenas de texto plausibles, no contenido fiable.
- Investigación sobre infraentrenamiento y curvas de pérdida: sus métricas de validación por paso permiten estudiar el comportamiento de modelos pequeños con presupuestos de cómputo reducidos.
- Base para experimentos de fine-tuning a pequeña escala: su tamaño (89 M de parámetros) permite iterar rápidamente en ajustes sobre dominios concretos en una sola GPU de consumo, aunque el punto de partida es débil.
- Demostración de arquitecturas GPT minimalistas: útil en docencia para ilustrar weight tying, tokenizadores BPE y estrategias de muestreo (temperatura, top-k) con un modelo real y abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo reporta pérdida de validación sobre el 1 % reservado del corpus:

| Paso | 250 | 1000 | 2000 | 3000 | 4000 | 5000 |
|---|---|---|---|---|---|---|
| Val loss | 3,812 | 3,698 | 3,629 | 3,556 | 3,494 | 3,483 |

Pérdida de validación final: 3,48 (perplejidad aproximada de 33 sobre el vocabulario de 16 000 tokens). La evaluación se realizó sobre 40 batches, por lo que las fluctuaciones menores entre puntos (por ejemplo, 3,478 en el paso 4750) se atribuyen a ruido.

## Requisitos de hardware

- VRAM para inferencia: menos de 1 GB según el autor (pesos fp32 de ~357 MB más activaciones y caché KV para 512 tokens).
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; el entrenamiento se hizo en una RTX 2060 de 6 GB, por lo que tarjetas de gama media como RTX 3060, RTX 4060 o superiores son más que suficientes para inferencia.
- Cabe holgadamente en cualquier GPU de consumo, incluidas las de gama baja con 4 GB o más.
- Opciones de despliegue: solo el código propio incluido en el repositorio (`generate.py` con PyTorch, tokenizers y safetensors). No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se han publicado mediciones de inferencia; el autor solo reporta ~23 500 tokens/s durante el entrenamiento en una RTX 2060.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Axon-Kit | 89,3 M | 512 | Ruso | Apache 2.0 | Hugging Face, código propio |
| GPT-2 small | 124 M | 1024 | Inglés | MIT | Hugging Face, transformers |
| TinyLlama-1.1B | 1,1 B | 2048 | Inglés (multilingüe parcial) | Apache 2.0 | Hugging Face, transformers, vLLM |
| Qwen2.5-0.5B | 0,49 B | 32 768 | Multilingüe (incluye ruso) | Apache 2.0 | Hugging Face, transformers, vLLM |

No se dispone de benchmarks comparativos publicados para Axon-Kit, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad. Frente a GPT-2 small, Axon-Kit tiene menos parámetros y menor contexto, pero está especializado en ruso y entrenado desde cero sobre datos web rusos. Frente a modelos como Qwen2.5-0.5B o TinyLlama, la diferencia de escala y de calidad esperada es muy grande, y además Axon-Kit carece de integración con el ecosistema estándar.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no es un chatbot y no responde a preguntas; solo continúa texto.
- Calidad muy limitada: el propio autor describe el texto generado como gramaticalmente plausible pero semánticamente incoherente, con repeticiones, palabras inventadas y errores de concordancia.
- Infraentrenamiento evidente: menos de dos pasadas sobre un corpus de 131 M de tokens, sin deduplicación ni filtrado más allá del descarte de documentos cortos.
- Sesgos heredados de FineWeb-2: al provenir de páginas web, el modelo puede reproducir estereotipos, errores factuales y sesgos presentes en el corpus.
- Riesgo elevado de alucinación: el autor advierte explícitamente de que no debe usarse donde se requiera fiabilidad.
- Contexto de solo 512 tokens, insuficiente para documentos largos o conversaciones multi-turno.
- Solo ruso funcional; el inglés y otros idiomas no son utilizables en la práctica.
- Sin filtros de seguridad ni moderación de contenido.
- Incompatibilidad con transformers y vLLM: requiere el código propio del repositorio, lo que complica su integración en producción.
- Licencia Apache 2.0 para código y pesos, pero los datos de entrenamiento (FineWeb-2, ODC-By 1.0) conservan sus condiciones originales, que deben respetarse en usos derivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SableAI-Dev/Axon-Kit
- Dataset de entrenamiento (FineWeb-2): https://huggingface.co/datasets/HuggingFaceFW/fineweb-2

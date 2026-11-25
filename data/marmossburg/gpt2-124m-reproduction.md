# marmossburg/gpt2-124m-reproduction

## Resumen

GPT-2 124M reproduction es un modelo de generación de texto entrenado desde cero por el usuario marmossburg, reproduciendo el tutorial de preentrenamiento de Andrej Karpathy. Se trata de una reimplementación del GPT-2 Small original de OpenAI (124 millones de parámetros), entrenada sobre el subconjunto `sample-10BT` del dataset FineWeb-Edu con ocho GPU A100 de 40 GB. El modelo emplea el tokenizador de GPT-2 y una ventana de contexto de 1.024 tokens, sin modificaciones arquitectónicas respecto al transformer decoder original.

El interés de este modelo es fundamentalmente educativo y de reproducibilidad: sirve como referencia verificable de un pipeline de preentrenamiento completo, con métricas de pérdida y precisión publicadas para cada fase. No obstante, su rendimiento está muy por debajo de los modelos GPT-2 publicados por OpenAI, lo que refleja la diferencia entre un entrenamiento de un solo epoch sobre 10.000 millones de tokens y el entrenamiento original de GPT-2 (que usó WebText, con decenas de miles de millones de tokens y una receta de limpieza distinta).

La relevancia actual es limitada para producción: se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, licencia no declarada y solo inglés. Su valor está en servir de base para experimentos controlados de escalado, ablaciones de hiperparámetros y docencia sobre entrenamiento de LLM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (GPT-2), atención causal multi-cabeza |
| Parámetros totales | 124 millones (según el nombre del modelo; el autor no desglosa el recuento exacto) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantización | No disponible (pesos en PyTorch nativo; no se publican versiones GGUF ni cuantizadas) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | No disponible |
| Formato de pesos | PyTorch (`pytorch`); tamaño del repo 0,5 GB |
| Tokenizador | GPT-2 (tiktoken) |
| Dataset de entrenamiento | HuggingFaceFW/fineweb-edu, subconjunto `sample-10BT` |
| Hardware de entrenamiento | 8 × A100 40 GB, bfloat16 |
| Tokens por actualización | 524.288 |
| Pasos de entrenamiento | 19.072 (≈1 epoch, 1,015) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2 estándar: un transformer decoder con atención causal, normalización previa a la atención y a la MLP, y embeddings posicionales aprendidos. No se documentan innovaciones como atención lineal, decodificación especulativa, MoE ni mecanismos híbridos. El contexto máximo es de 1.024 tokens, coherente con el GPT-2 Small original.

El entrenamiento se realizó desde cero siguiendo el tutorial de Karpathy, sobre el subconjunto `sample-10BT` de FineWeb-Edu (10.000 millones de tokens aproximadamente), con bfloat16 y un tamaño de batch efectivo de 524.288 tokens por actualización. Se completaron 19.072 pasos, equivalentes a 1,015 epochs. No se menciona uso de RLHF, DPO, SFT ni ajuste por instrucciones: es un modelo base de completado de texto, no un modelo alineado. Las métricas finales publicadas son pérdida de entrenamiento 3,109554, pérdida de validación 3,0744 y precisión en HellaSwag del 30,59%.

## Capacidades

- Generación de texto por completado de secuencias (text completion), sin formato de instrucciones.
- Predicción de siguiente token sobre contexto de hasta 1.024 tokens.
- Capacidad limitada de razonamiento y conocimiento factual, coherente con un modelo de 124M parámetros y un solo epoch de entrenamiento.
- No soporta tool calling ni function calling.
- No soporta uso como agente ni razonamiento multi-paso.
- Monolingüe en inglés; no se documenta capacidad multilingüe.
- No dispone de modo thinking, visión, audio ni otras modalidades.

## Casos de uso

- Docencia y reproducibilidad de pipelines de preentrenamiento: sirve como referencia ejecutable de un entrenamiento GPT-2 completo, con métricas publicadas para comparar contra reimplementaciones propias y validar infraestructura de entrenamiento distribuido.
- Ablaciones controladas de hiperparámetros: al ser un modelo pequeño y con receta conocida, permite estudiar el efecto de cambios en learning rate, tamaño de batch o composición del dataset sin el coste de un modelo grande.
- Generación de texto de relleno en prototipos: útil para pruebas de integración de pipelines de generación (APIs, interfaces, streaming) donde la calidad del texto no es el criterio principal.
- Baseline de evaluación: punto de partida para medir mejoras de modelos pequeños en tareas de completado, comparando pérdida de validación y HellaSwag contra variantes entrenadas con más tokens o datos distintos.
- Investigación sobre calidad de datos: al usar FineWeb-Edu filtrado, permite estudiar cómo afecta la selección de datos al rendimiento en modelos de escala reducida.
- Experimentos de destilación o inicialización: puede servir como modelo inicial para ajuste fino supervisado o destilación hacia tareas concretas en inglés, aunque su baja calidad base limita el techo alcanzable.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---:|
| Pérdida de entrenamiento (paso 19.072) | 3,109554 |
| Pérdida de validación (paso 19.072) | 3,0744 |
| HellaSwag accuracy | 30,59% |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en FP32 (124M parámetros × 4 bytes) más overhead de activaciones y KV cache; en la práctica, menos de 2 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en CPU sin problema para generación de baja latencia.
- Cabe en GPU de consumo: sí, en cualquier RTX (incluso series antiguas), GTX 1050 o superiores, y en iGPU modernas con suficiente memoria compartida.
- Opciones de despliegue: PyTorch nativo (script `generate_local.py` incluido por el autor con `tiktoken`); al no publicarse pesos en GGUF, no hay soporte directo en llama.cpp u Ollama sin conversión previa. vLLM y TGI requerirían conversión y configuración manual.
- Latencia y throughput: no disponibles en la información proporcionada; para un modelo de 124M en GPU moderna se espera generación en tiempo real, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | HellaSwag | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| gpt2-124m-reproduction (este) | 124M | 1.024 | 30,59% | No disponible | Hugging Face (0 descargas) |
| GPT-2 Small (OpenAI) | 124M | 1.024 | ≈43% (referencia pública) | MIT (pesos originales) | Hugging Face, ampliamente extendido |
| GPT-2 Medium (OpenAI) | 355M | 1.024 | ≈55% (referencia pública) | MIT (pesos originales) | Hugging Face |
| Modelos tipo TinyLlama / Qwen2.5-0.5B | 0,5B–1,1B | 2.048–32.768 | No comparable directamente | Apache 2.0 / MIT | Hugging Face |

La comparación con GPT-2 Small de OpenAI es la más directa: misma arquitectura y tamaño, pero el modelo de OpenAI se entrenó sobre WebText con más tokens y una receta distinta, y su precisión en HellaSwag publicada ronda el 43%, muy por encima del 30,59% de esta reproducción. Los modelos actuales de ~0,5B parámetros superan ampliamente a ambos en contexto y capacidades, aunque no son estrictamente comparables por escala.

## Limitaciones y advertencias

- Modelo base sin alineación: no está ajustado por instrucciones ni por preferencias humanas, por lo que no debe usarse como asistente conversacional directo.
- Riesgo elevado de alucinación y de texto incoherente: la pérdida de validación de 3,07 y el HellaSwag del 30,59% indican una calidad muy inferior a la de GPT-2 Small original.
- Sesgos: al entrenarse sobre FineWeb-Edu (texto web filtrado por calidad educativa), puede heredar sesgos de género, culturales y geográficos presentes en el corpus; el autor no documenta análisis de sesgo.
- Limitación de idioma: solo inglés; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Contexto corto: 1.024 tokens, insuficiente para tareas de documento largo, RAG con contexto extenso o conversaciones multi-turno largas.
- Licencia no declarada: la ausencia de licencia impide asumir permisos de uso comercial; debe contactarse con el autor antes de cualquier uso en producción.
- Madurez: cero descargas y cero likes en el momento de la consulta, sin issues ni comunidad que valide el artefacto; tratar como experimental.
- Sin soporte de tool calling ni agentes: no apto para pipelines que requieran function calling o razonamiento multi-paso.
- Fecha de creación futura en los metadatos (2026-11-25): conviene verificar la integridad y procedencia del repositorio antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/marmossburg/gpt2-124m-reproduction
- Tutorial de referencia de Andrej Karpathy: https://www.youtube.com/watch?v=l8pRSuU81PU
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Tokenizador GPT-2 (tiktoken): https://github.com/openai/tiktoken
- Pesos originales de GPT-2 de OpenAI: https://huggingface.co/openai-community/gpt2

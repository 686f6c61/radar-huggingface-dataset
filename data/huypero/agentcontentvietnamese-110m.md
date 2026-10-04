# Huypero/AgentContentVietnamese-110m

# Huypero/AgentContentVietnamese-110m

## Resumen

AgentContentVietnamese-110m es un modelo de lenguaje base (causal LM) en vietnamita, entrenado desde cero por el usuario Huypero sobre un corpus de prensa vietnamita. Se trata de una exportación final de un preentrenamiento que completó una única época tras procesar 1.888.682.419 tokens, con una pérdida de entrenamiento final de 2,4816 y una mejor pérdida de validación completa observada de 2,3403 durante la ejecución. El modelo tiene 109.529.856 parámetros y una ventana de contexto de 4096 tokens.

Arquitectónicamente es un transformer decoder-only de 12 capas, dimensión oculta 768, 12 cabezas de atención y FFN con SwiGLU de 2048 unidades, con RMSNorm y codificación posicional RoPE. El tokenizador es SentencePiece BPE de 32.000 tokens con byte fallback. No es un modelo instruction-tuned ni está evaluado como asistente conversacional: es una base pensada para continuación de texto y para investigación en preentrenamiento en vietnamita.

Su relevancia es limitada pero concreta: es un ejemplo de modelo pequeño (rango 100M) entrenado íntegramente desde cero para un idioma con menos recursos como el vietnamita, publicado con pesos FP32 en safetensors, tokenizador, scripts de generación y ficheros de provenance con hashes SHA-256. El repositorio no declara licencia, y la arquitectura es personalizada, por lo que no se integra con `transformers` de forma nativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only; 12 capas, hidden 768, 12 cabezas de atencion, SwiGLU 2048; RMSNorm y RoPE |
| Parametros totales | 109.529.856 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | solo FP32 (pesos publicados sin cuantizar); no hay versiones GGUF, INT8 ni INT4 publicadas |
| Idiomas soportados | vietnamita (vi); tokenizador con byte fallback que permite representar bytes arbitrarios |
| Licencia | no disponible (el autor indica que el repositorio no especifica licencia) |
| Formato de pesos | safetensors (FP32) |
| Tokenizador | SentencePiece BPE, 32.000 tokens, byte fallback |
| Tokens de entrenamiento | 1.888.682.419 (1 epoca) |
| Perdida de entrenamiento final | 2,4816 |
| Mejor perdida de validacion observada | 2,3403 (registrada durante la ejecucion, no medida sobre la exportacion) |
| Tamano del repositorio | 0,4 GB |
| Libreria | PyTorch 2.7.1 (probado con Python 3.13) |
| Integracion con transformers | no; requiere `generate.py` incluido en el repositorio |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de tipo causal, con pre-normalizacion RMSNorm, atención multi-cabeza estándar con 12 cabezas y codificación posicional rotatoria (RoPE). La capa feed-forward usa SwiGLU con dimensión intermedia de 2048. El vocabulario es de 32.000 tokens, generado con SentencePiece BPE e incluye byte fallback para cubrir caracteres fuera del vocabulario. La ventana de contexto es de 4096 tokens.

El preentrenamiento se realizó desde cero sobre el corpus `anhnam26/AgentContentVietnamese-data`, de temática periodística en vietnamita, con un total de 1.888.682.419 tokens procesados en una sola época, hasta el paso 14.411. No hay información disponible sobre la composición detallada del dataset, la mezcla de dominios, la proporción de código o de contenido multilingüe, ni sobre fases posteriores de alineación (no se menciona RLHF, DPO ni SFT). El autor indica que el corpus está sesgado hacia prensa y que el modelo no ha sido ajustado como asistente. Tampoco se documenta ninguna innovación técnica de inferencia (decodificación especulativa, atención lineal, etc.). Los pesos se exportaron en FP32 y el autor verificó que cada tensor coincide de forma absoluta con el checkpoint original y que los logits son idénticos al recargar en CPU.

## Capacidades

- Generación de texto en vietnamita: continuación de secuencias a partir de un prompt, con decodificación por muestreo o greedy (`--temperature 0`).
- Modelado de lenguaje causal: puede usarse para calcular verosimilitudes y como base para ajuste fino supervisado.
- Razonamiento y matemáticas: no hay evidencia ni evaluación publicada; al ser un modelo base de 110M, el rendimiento esperable en tareas de razonamiento es muy limitado.
- Código: no hay soporte ni evaluación documentados; el corpus declarado es periodístico.
- Tool calling / function calling: no soportado (no hay instruction tuning ni formato de plantilla documentado).
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingües: no documentadas; el modelo se declara únicamente en vietnamita.
- Capacidades especiales (modo de pensamiento, visión, audio): ninguna documentada.
- Ejecución de inferencia: CPU o GPU CUDA; en GPU usa BF16 automáticamente si está soportado; sin token BOS añadido al prompt y parada en EOS o al alcanzar el límite de contexto.

## Casos de uso

- Continuación de borradores periodísticos en vietnamita: el modelo está entrenado sobre corpus de prensa, por lo que puede utilizarse como asistente de autocompletado de párrafos o como generador de borradores de noticias para revisión humana posterior.
- Punto de partida para ajuste fino: al ser un modelo base pequeño, es adecuado para SFT sobre tareas concretas en vietnamita (clasificación de textos, extracción de entidades, resumen extractivo) con coste de cómputo muy bajo.
- Investigación en preentrenamiento de bajo presupuesto: sirve como referencia para estudiar dinámicas de entrenamiento (curvas de pérdida, escalado de tokens por parámetro) en un idioma con pocos recursos.
- Generación de datos sintéticos en vietnamita: puede producir texto de dominio periodístico para aumentar datasets de entrenamiento de otros modelos, siempre con filtrado y verificación posteriores.
- Prototipado en hardware modesto: al ocupar menos de medio gigabyte en FP32, se puede desplegar en portátiles, CPUs o GPUs de gama de entrada para pruebas de concepto.
- Baseline lingüístico para vietnamita: útil para comparar métricas de perplejidad frente a otras arquitecturas del mismo rango de parámetros en experimentos académicos.
- Análisis de vocabulario y tokenización: el tokenizador SentencePiece BPE de 32.000 tokens con byte fallback puede reutilizarse en otros proyectos de PLN en vietnamita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta MMLU, HumanEval, GSM8K ni ninguna otra evaluación estándar. Las únicas métricas publicadas son las de entrenamiento: pérdida final de entrenamiento de 2,4816 y mejor pérdida de validación completa observada de 2,3403. El propio autor advierte que ese valor de validación proviene de la ejecución de entrenamiento y no de una medición nueva sobre la exportación final. Además, el modelo no ha sido evaluado como asistente conversacional.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 0,44 GB en FP32 (formato publicado) y unos 0,22 GB si se convierte manualmente a BF16 o FP16.
- VRAM estimada total en inferencia: el KV cache para 4096 tokens, 12 capas, 12 cabezas y dimensión de cabeza 64 ocupa del orden de 0,29 GB en FP32 y 0,14 GB en BF16, por lo que la inferencia completa se mantiene por debajo de 1 GB en FP32. Cálculo estimado, no publicado por el autor.
- GPU recomendadas: cualquier GPU CUDA con al menos 2 GB de VRAM es suficiente (GTX 1050 Ti, RTX 3060, RTX 4090, T4, A100, H100). El modelo no aprovecha las GPU de gama alta por su tamaño.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna y en muchas integradas, siempre que se disponga de memoria suficiente.
- Ejecución en CPU: soportada explícitamente mediante `--device cpu`.
- Opciones de despliegue: el repositorio solo incluye `generate.py` y los scripts propios; no hay integración con `transformers.AutoModelForCausalLM`, ni soporte nativo para vLLM, TGI, llama.cpp u Ollama. Para usar esos motores habría que portar la arquitectura a formato HuggingFace y, en el caso de llama.cpp, generar una versión GGUF que no está publicada.
- Latencia y throughput estimados: no disponible.
- Requisitos de software: PyTorch 2.7.1 y Python 3.13 según las instrucciones del autor; `huggingface-hub` para la descarga.

## Comparativa con modelos similares

No se dispone de datos verificados dentro de la informacion proporcionada para construir una comparativa fiable. A modo de referencia externa, se indican alternativas de la misma categoría (modelos base pequeños para generación de texto), con la advertencia de que las cifras de los modelos ajenos no proceden de la documentación facilitada y deben verificarse en sus repositorios oficiales:

| Modelo | Parametros | Contexto | Idioma principal | Licencia | Integracion |
|---|---|---|---|---|---|
| AgentContentVietnamese-110m | 109.529.856 | 4096 | vietnamita | no disponible | solo `generate.py` propio |
| GPT-2 (124M) | ~124M | 1024 | ingles | MIT | transformers |
| Qwen2.5-0.5B | ~0,49B | 32.768 | multilingue | Apache 2.0 | transformers, vLLM, llama.cpp |
| PhoGPT-4B | ~3,7B | no disponible | vietnamita | licencia propia no comercial | transformers |

Los datos de GPT-2, Qwen2.5-0.5B y PhoGPT se incluyen como referencia general y no han sido aportados por la búsqueda realizada. Para el modelo objeto de esta ficha no hay benchmarks publicados, por lo que no es posible comparar rendimiento de forma numérica.

## Limitaciones y advertencias

- Sesgos conocidos: el corpus es periodístico vietnamita, lo que puede introducir sesgos temáticos, estilísticos y geográficos propios de la prensa; no se documenta ningún análisis de sesgo.
- Riesgo de alucinación: elevado en un modelo base de 110M sin alineación; el autor advierte explícitamente de que el texto generado puede contener errores, repeticiones y contenido inapropiado.
- No es un asistente: no ha recibido instruction tuning ni evaluación conversacional, por lo que no debe desplegarse como chatbot sin un ajuste previo.
- Limitaciones de idioma: solo se declara vietnamita; no hay evaluación de transferencia a otras lenguas.
- Limitaciones de contexto: 4096 tokens, con degradación esperable en la parte final de la ventana.
- Licencia: no disponible. El autor señala que la publicación del repositorio no implica una licencia abierta para los pesos ni para el contenido de origen, y que la entrega no especifica licencia. Esto impide asumir derechos de uso comercial.
- Compatibilidad: al ser una arquitectura personalizada sin integración con `transformers`, el despliegue en producción con motores estándar requiere trabajo de portabilidad adicional.
- Trazabilidad: el repositorio no incluye el optimizador, el estado de RNG de entrenamiento ni el corpus; el checkpoint de entrenamiento original permanece en el servidor del proyecto.
- Validación: la pérdida de validación reportada procede de la ejecución de entrenamiento y no ha sido revalidada sobre la exportación final, según el propio autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Huypero/AgentContentVietnamese-110m
- Repositorio del proyecto en GitHub: https://github.com/anhnam26/AgentContentVietnamese
- Dataset de entrenamiento: https://huggingface.co/datasets/anhnam26/AgentContentVietnamese-data
- Búsqueda web realizada: no se han encontrado resultados relevantes sobre este modelo; los enlaces devueltos (hyperfx.ai, huggingface.co, agents.hypertype.ai, prompthero.com, haiperai.org) no guardan relación con el modelo.

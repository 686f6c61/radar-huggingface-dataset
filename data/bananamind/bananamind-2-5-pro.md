# BananaMind/BananaMind-2.5-Pro

## Resumen

BananaMind-2.5-Pro es un modelo de lenguaje decoder-only de 138.971.520 parámetros (aproximadamente 139M) desarrollado por BananaMind. Se trata de un checkpoint base derivado de BananaMind-2-Pro mediante destilación desde SmolLM2-360M, combinada con etiquetas de entrenamiento supervisado. El modelo original se entrenó desde cero sobre 99.999.449.088 tokens a lo largo de 184.954 pasos de optimizador. La destilación parte de ese checkpoint final y modifica únicamente los pesos aprendidos, sin alterar la arquitectura ni el tokenizador.

La relevancia del modelo radica en su escala compacta (139M parámetros, repo de 0,6 GB) y en una ventana de contexto de 3.072 tokens, con un tokenizador BPE a nivel de byte de 32.768 entradas sensible a dígitos. Según la model card, alcanza un INT Index de 28,92, frente a 24,96 del modelo base del que deriva, lo que supone una mejora medible en tareas de razonamiento de sentido común y aritmética a igualdad de parámetros.

Es importante subrayar que se trata de un modelo base de continuación, no de un chatbot con ajuste de instrucciones. Está pensado para prompts de estilo continuación y requiere cargarse con `trust_remote_code=True` debido a su arquitectura personalizada (`BananaMind2ProForCausalLM`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BananaMind2Pro decoder-only Transformer (GQA con QK norm, RoPE, SwiGLU, RMSNorm) |
| Parametros totales | 138.971.520 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 3.072 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | en (inglés) |
| Licencia | bananamind-community-license-1.0 (license: other) |
| Formato de pesos | safetensors |
| Capas | 24 |
| Tamano oculto | 640 |
| Tamano intermedio | 1.920 |
| Cabezas de atencion | 8 |
| Cabezas KV | 4 |
| Dimension de cabeza | 80 |
| Theta de RoPE | 100.000 |
| Epsilon de RMSNorm | 1e-6 |
| Vocabulario | 32.768 |
| Embeddings | atados entrada/salida |
| Cache de generacion | KV cache soportada |
| Clase HF | `BananaMind2ProForCausalLM` |
| Tipo de modelo HF | `bananamind2_pro` |

## Arquitectura y entrenamiento

La arquitectura es un Transformer decoder-only con pre-normalización: los tokens pasan por un embedding de entrada atado, 24 bloques Transformer, un RMSNorm final y una cabeza de lenguaje también atada. Cada bloque combina autoatención causal con grouped-query attention (8 cabezas de consulta que comparten 4 cabezas de clave/valor, lo que reduce el tamaño de la KV cache) seguida de una red feed-forward SwiGLU, con conexiones residuales en ambas subcapas. La normalización QK estabiliza los logits de atención y RoPE aporta información posicional sin embeddings absolutos aprendidos.

El modelo original BananaMind-2-Pro se entrenó desde cero sobre 99.999.449.088 tokens durante 184.954 pasos de optimizador. Los datos declarados en la model card incluyen fineweb-edu, dclm-baseline-1.0, smollm-corpus y finemath. BananaMind-2.5-Pro se obtiene por destilación desde el modelo base SmolLM2-360M (profesor) hacia el checkpoint final de BananaMind-2-Pro (estudiante), con 300 pasos de optimizador de destilación, 9.600 ejemplos de entrenamiento muestreados y 1.454.022 tokens procesados en forward. No se documentan detalles sobre RLHF o DPO, ni sobre la composición exacta del dataset de destilación más allá de las etiquetas supervisadas mencionadas.

## Capacidades

- Generación de texto autoregresiva en inglés mediante continuación de prompts (modelo base, sin ajuste de instrucciones).
- Razonamiento de sentido común básico, evaluado en ARC Easy, ARC Challenge, HellaSwag y PIQA.
- Aritmética de dígitos, evaluada con ArithMark-3 y ArithMark-2; el tokenizador es sensible a dígitos, lo que favorece el manejo de números.
- Soporte de KV cache para generación eficiente token a token.
- Capacidades multilingües: limitadas al inglés según la model card.
- Tool calling / function calling: no disponible (no documentado; al ser un modelo base sin ajuste de instrucciones no se espera soporte nativo).
- Agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Experimentación académica con modelos de escala pequeña: el modelo sirve como sujeto de estudio para analizar los efectos de la destilación sobre un checkpoint base, comparando sus resultados con los de BananaMind-2-Pro y SmolLM2-360M en el mismo harness de evaluación.
- Evaluación de técnicas de destilación: con solo 300 pasos de optimizador y 9.600 ejemplos, es un caso práctico para reproducir y medir cuánto mejora un estudiante de 139M al destilar desde un profesor de 360M en tareas de sentido común.
- Generación de texto de continuación en pipelines de investigación: adecuado para tareas de completion y scoring de verosimilitud (por ejemplo, normalización por número de tokens en benchmarks tipo ArithMark) gracias a su cabeza de lenguaje atada y su tokenizador de 32.768 entradas.
- Prototipado de bajo coste en entornos con recursos limitados: con 0,6 GB de pesos en safetensors y 139M de parámetros, cabe en GPU de consumo y permite iterar rápidamente en experimentos de NLP sin infraestructura dedicada.
- Evaluación comparativa de modelos pequeños: útil como línea base en tablas de benchmarks de modelos de menos de 150M de parámetros (frente a GPT-2 de 124M o GPT-X2.5-135M) para calibrar el estado del arte en esta escala.
- Estudio de tokenizadores sensibles a dígitos: el tokenizador BPE a nivel de byte con tratamiento específico de dígitos permite investigar cómo afecta la tokenización numérica al rendimiento aritmético en modelos pequeños.
- Fine-tuning posterior como punto de partida: al ser un checkpoint base, puede servir como inicialización para ajustes supervisados o destilaciones adicionales en dominios concretos en inglés.

## Benchmarks y rendimiento

Resultados de evaluación zero-shot publicados en la model card (lm-evaluation-harness 0.4.12 con `acc_norm,none` para ARC, HellaSwag y PIQA; ArithMark-3 con normalización por número de tokens):

| Benchmark | BananaMind-2.5-Pro | BananaMind-2-Pro | BananaMind-2-Pro-Preview | GPT-X2.5-135M | BananaMind-2-Medium | GPT-2 |
|---|---:|---:|---:|---:|---:|---:|
| Parámetros | 139M | 139M | 139M | 135M | 49,6M | 124M |
| ARC Easy | **62,79%** | 53,58% | 51,01% | 51,81% | 43,81% | 39,35% |
| ARC Challenge | **31,96%** | 27,82% | 27,13% | 29,18% | 25,34% | 22,35% |
| PIQA | 69,02% | 67,52% | 66,76% | **69,42%** | 61,86% | 62,08% |
| HellaSwag | **44,60%** | 42,78% | 39,83% | 40,57% | 32,43% | 31,26% |
| ArithMark-3 | 38,60% | 38,20% | **38,90%** | 38,10% | 36,20% | 35,70% |
| ArithMark-2 | 31,1% | 32,08% | 28,60% | N/A | 28,20% | 26,48% |
| INT Index | **28,92** | 24,96 | 23,04 | 25,17 | 15,37 | N/A |
| Code Elo | No evaluado | 1407 | 1295 | 1253 | 1034 | 996 |
| Base Bench 1.1 Elo | No evaluado | 1124 | 1106 | 1106 | 1034 | 996 |

Notas de la model card: el split publicado de ArithMark-3 se llama `train`, pero ninguno de sus ejemplos se usó para el entrenamiento de destilación. El script oficial codifica por separado cada contexto y su continuación con espacio inicial, usa un contexto máximo de 1.024 tokens y reporta precisión bruta y normalizada. Este checkpoint obtiene 39,30% bruto y 38,70% normalizado por tokens; el INT Index usa el segundo. El INT Index normaliza por azar HellaSwag, la media de ARC Easy y ARC Challenge, PIQA y ArithMark-3 según la fórmula documentada en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: con 138,97M de parámetros en safetensors (repo de 0,6 GB), la inferencia en fp32 requiere aproximadamente 0,6 GB de pesos; en fp16 unos 0,3 GB. La KV cache para 3.072 tokens es reducida gracias a las 4 cabezas KV.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM es suficiente; A100, H100, RTX 4090 o RTX 3090 quedan sobradamente dimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo actual (GTX 1060 6GB, RTX 3060, RTX 4060, etc.), e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por la arquitectura personalizada `BananaMind2ProForCausalLM`). El ecosistema BananaMind incluye BananaMindOS para entornos tipo DOS con pesos Q4 en CD, según el repositorio de GitHub. No se documenta soporte oficial para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | INT Index | Disponibilidad |
|---|---:|---:|---|---:|---|
| BananaMind-2.5-Pro | 139M | 3.072 | bananamind-community-license-1.0 | 28,92 | Hugging Face |
| BananaMind-2-Pro | 139M | 3.072 | no disponible | 24,96 | Hugging Face |
| GPT-X2.5-135M | 135M | no disponible | no disponible | 25,17 | no disponible |
| GPT-2 | 124M | 1.024 | MIT (histórica) | N/A | Hugging Face / OpenAI |
| SmolLM2-360M (profesor) | 360M | no disponible | no disponible | no disponible | Hugging Face |

BananaMind-2.5-Pro supera a su predecesor directo (24,96) y a GPT-X2.5-135M (25,17) en INT Index con un número de parámetros comparable, y queda por delante de GPT-2 en todas las tareas medidas, aunque GPT-2 no tiene INT Index calculado. En PIQA, GPT-X2.5-135M obtiene una puntuación ligeramente superior (69,42% frente a 69,02%). No se dispone de datos de Code Elo ni Base Bench 1.1 Elo para esta versión.

## Limitaciones y advertencias

- Es un modelo base de continuación, no un chatbot ajustado a instrucciones: no debe esperarse que siga instrucciones ni mantenga formato conversacional sin ajuste adicional.
- Ventana de contexto limitada a 3.072 tokens, muy inferior a la de modelos contemporáneos; no apto para documentos largos o conversaciones multi-turno extensas.
- Solo soporta inglés según la model card; el rendimiento en otros idiomas no está documentado y previsiblemente será deficiente.
- Riesgo de alucinación inherente a un modelo de 139M entrenado sobre ~100.000 millones de tokens; la capacidad factual es limitada.
- Sesgos: no se documentan análisis de sesgo en la información disponible; al entrenarse sobre corpus web (fineweb-edu, dclm-baseline, smollm-corpus) es probable que herede sesgos presentes en esos datos.
- Licencia `bananamind-community-license-1.0` (license: other): es necesario revisar el archivo LICENSE del repositorio antes de cualquier uso comercial, ya que las condiciones no están detalladas en la información proporcionada.
- Requiere `trust_remote_code=True` y código personalizado, lo que implica revisar el código del repositorio antes de ejecutarlo en producción.
- El modelo se publicó con 0 descargas y solo 4 likes en el momento de la consulta; no hay evidencia de adopción ni de validación independiente de los resultados.
- Las puntuaciones de benchmarks proceden de la propia model card del autor; no se han verificado de forma independiente en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BananaMind/BananaMind-2.5-Pro
- Modelo base BananaMind-2-Pro: https://huggingface.co/BananaMind/BananaMind-2-Pro
- Profesor SmolLM2-360M: https://huggingface.co/HuggingFaceTB/SmolLM2-360M
- Repositorio de prueba 2.5-pro-test: https://huggingface.co/BananaMind/2.5-pro-test/tree/main
- GitHub BananaMindOS: https://github.com/BananaMind/BananaMindOS
- Dataset fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset dclm-baseline-1.0: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0
- Dataset smollm-corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset finemath: https://huggingface.co/datasets/HuggingFaceTB/finemath

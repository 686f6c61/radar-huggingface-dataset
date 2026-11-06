# hakim32/slm-id-50m

## Resumen

SLM-ID-50M es un modelo de lenguaje de tipo base, con arquitectura transformer decoder-only al estilo Llama, desarrollado por Muflikhul Hakim (usuario `hakim32`) y entrenado desde cero para el idioma indonesio. Con 49,95 millones de parámetros, 13 capas, dimensión oculta de 512 y una ventana de contexto de 512 tokens, se posiciona como una base reproducible para investigación y para tareas posteriores de ajuste supervisado (SFT), no como un asistente conversacional listo para usar.

El modelo se entrenó sobre el corpus abierto `AksaraLLM/aksara-pretrain-id`, compuesto por Wikipedia en indonesio y CulturaX, con 765.815 documentos tras deduplicación SHA-1 y aproximadamente 1.040 millones de tokens procesados en 3 épocas. El entrenamiento se realizó en hardware modesto (2x NVIDIA Tesla T4 en Kaggle), lo que subraya su carácter de experimento reproducible y de bajo coste.

Su relevancia actual reside en la escasez de modelos base pequeños y abiertos para lenguas de recursos medios como el indonesio. Frente a alternativas multilingües de mayor tamaño, SLM-ID-50M ofrece un punto de partida ligero, con licencia Apache 2.0 y pesos en PyTorch puro, adecuado para estudiar dinámicas de preentrenamiento, tokenización BPE específica y ajuste posterior en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (RoPE, RMSNorm, SwiGLU) |
| Parametros totales | ~49,95 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en PyTorch; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Indonesio (`id`) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only con 13 capas, dimensión oculta de 512, 8 cabezas de atención con dimensión por cabeza de 64, y una capa FFN intermedia de 1408 con activación SwiGLU. Emplea normalización RMSNorm con epsilon 1e-5, codificación posicional rotatoria RoPE con theta 10000, y weight tying entre la matriz de embeddings y la cabeza de salida. El vocabulario es de 16.000 tokens BPE, ajustado al indonesio.

El preentrenamiento se realizó desde cero (no es un fine-tuning) sobre `AksaraLLM/aksara-pretrain-id`, que combina Wikipedia en indonesio y CulturaX. Tras deduplicación SHA-1 quedaron 765.815 documentos, y se procesaron aproximadamente 1.040 millones de tokens en 3 épocas. El cómputo se ejecutó en 2x NVIDIA Tesla T4 (Kaggle). No se documenta el uso de RLHF, DPO ni SFT; se trata de un modelo estrictamente base entrenado con el objetivo de predicción del siguiente token.

## Capacidades

- Generación de texto por continuación (next-token prediction) en indonesio.
- Modelo base sin ajuste instructivo: no responde a instrucciones ni mantiene formato de chat de forma fiable.
- Tokenización BPE específica para indonesio con vocabulario de 16.000 tokens.
- Capacidad de completar fragmentos, generar texto libre y servir como inicialización para SFT.
- No dispone de tool calling, function calling ni soporte de agentes.
- No dispone de modo de razonamiento explícito (thinking mode), visión, audio ni multimodalidad.
- Capacidades multilingües limitadas al indonesio; no se reporta competencia en otras lenguas.
- Ventana de contexto muy corta (512 tokens), lo que restringe tareas de contexto largo.

## Casos de uso

- Investigación en preentrenamiento de modelos pequeños: sirve como referencia reproducible para estudiar curvas de pérdida, elección de tokenizador y dinámicas de entrenamiento en lenguas de recursos medios, dado que se publican dos checkpoints (paso 188.000 y 280.000) y detalles completos de arquitectura.
- Punto de partida para SFT en indonesio: equipos que necesiten un modelo ligero para clasificación de texto, análisis de sentimiento o extracción de entidades pueden aplicar ajuste supervisado sobre esta base con coste de cómputo reducido.
- Generación de texto asistida en dominios acotados: con un SFT adecuado, puede emplearse para redactar descripciones cortas, resúmenes de titulares o textos de formularios en indonesio, siempre dentro del límite de 512 tokens.
- Experimentación educativa: su tamaño (49,95 M de parámetros) y su implementación en PyTorch puro permiten ejecutarlo y modificarlo en portátiles con GPU consumer, lo que lo hace útil para docencia y prototipado rápido.
- Evaluación de técnicas de eficiencia: al ser un modelo pequeño entrenado en T4, es un banco de pruebas para estudiar cuantización, destilación o poda con impacto medible en perplejidad y precisión sintáctica.
- Filtrado y puntuación de texto en pipelines de datos: puede utilizarse como modelo de lenguaje para calcular perplejidad y detectar texto anómalo o de baja calidad en corpus indonesios, aprovechando su bajo coste de inferencia.
- Generación de datos sintéticos a pequeña escala: con ajuste previo, puede producir variaciones de frases para aumento de datos en tareas de PLN en indonesio, siempre con revisión humana por el riesgo de alucinación.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Validation loss (paso 280.000) | 2,9412 | Checkpoint final de la época 3 |
| Perplejidad (paso 280.000) | 18,94 | Derivada de la loss de validación |
| Precisión en pares mínimos sintácticos (200 ítems) | 90,0 % | Evaluación sintáctica propia del autor |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible. Los datos anteriores son métricas internas del autor y no permiten comparación directa con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: en torno a 200 MB para los pesos (49,95 M de parámetros × 4 bytes), más overhead de activaciones y contexto; cabe holgadamente en cualquier GPU consumer.
- VRAM estimada en FP16/BF16: alrededor de 100 MB para los pesos; también viable en CPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3050, RTX 4090, A100, H100); el modelo se entrenó en 2x Tesla T4, por lo que ese hardware es suficiente para inferencia y ajuste ligero.
- Cabe en GPU consumer sin problema, e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: al publicarse únicamente pesos en PyTorch (`.pt`) con implementación propia, no hay soporte nativo en vLLM, llama.cpp, Ollama o TGI; sería necesario exportar a safetensors/GGUF y adaptar la arquitectura. El autor proporciona `inference_example.py`.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera una latencia muy baja en GPU moderna, pero no se documentan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| SLM-ID-50M | ~49,95 M | 512 | Indonesio | Apache 2.0 | PyTorch (.pt) | Base from-scratch, sin SFT |
| SmolLM-135M | 135 M | 2.048 | Inglés (principalmente) | Apache 2.0 | Safetensors, GGUF | Base e instruct, ecosistema amplio |
| Qwen2.5-0.5B | 494 M | 32.768 | Multilingüe | Apache 2.0 | Safetensors, GGUF | Base e instruct, soporte de tool calling |
| Gemma-2-2B | 2.600 M | 8.192 | Multilingüe | Gemma Terms | Safetensors | Base e instruct, mayor capacidad |

La comparación es orientativa: SLM-ID-50M es sustancialmente más pequeño y está especializado en indonesio, mientras que los alternativas son multilingües y de mayor tamaño. No se dispone de benchmarks comunes que permitan una comparación cuantitativa directa; los datos de rendimiento del modelo son métricas internas (perplejidad 18,94 y 90 % en pares mínimos).

## Limitaciones y advertencias

- Es un modelo base sin SFT: no está diseñado para responder preguntas ni mantener conversaciones; solo completa texto.
- Ventana de contexto de 512 tokens, insuficiente para documentos largos, diálogos multi-turno o tareas de recuperación aumentada.
- Alta propensión a la alucinación de hechos, inherente a un modelo de 50 M de parámetros entrenado con ~1.040 M de tokens.
- Solo soporta indonesio; no se garantiza un comportamiento correcto en otros idiomas.
- No se han publicado evaluaciones de sesgo; se desconoce el sesgo de género, religioso o político presente en Wikipedia y CulturaX.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no incluye garantías ni soporte; el usuario asume el riesgo de producción.
- Al no publicarse pesos en safetensors ni GGUF, la integración con runtimes estándar requiere trabajo adicional de conversión.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria del modelo.
- Los checkpoints se distribuyen como `.pt` de PyTorch puro; es necesario revisar `inference_example.py` para cargar correctamente los pesos y la configuración.

## Enlaces

- Hugging Face: https://huggingface.co/hakim32/slm-id-50m
- Dataset de entrenamiento: https://huggingface.co/datasets/AksaraLLM/aksara-pretrain-id
- Script de inferencia: incluido en el repositorio (`inference_example.py`)
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.

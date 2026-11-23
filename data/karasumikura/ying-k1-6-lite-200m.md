# Karasumikura/Ying-K1.6-Lite-200M

## Resumen

Ying K1.6 Lite es un modelo de lenguaje causal de 210,2 millones de parámetros desarrollado por Karasumikura, orientado a generación de texto y diálogo en chino y en inglés. Se trata de la versión "Lite" de la familia Ying, con un enfoque explícito en eficiencia extrema: el modelo completo ocupa menos de 1 GB en bf16 y está diseñado para ejecutarse en hardware modesto, incluido el entrenamiento base en aceleradores nacionales chinos (Moore Threads MTT S4000).

El modelo emplea una arquitectura transformer de 16 capas con atención híbrida: 12 capas de ventana deslizante (sliding window de 1024 tokens) y 4 capas de atención global, con una dimensión oculta de 768 y un vocabulario de 16.006 tokens. Soporta un contexto de 8.192 tokens y se distribuye en formato safetensors bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia de este modelo reside en su cadena de entrenamiento documentada con precisión (24,07 B tokens de preentrenamiento general, 1,40 B de continuación en chino y 316 M de instrucciones) y en la transparencia sobre sus límites: el propio autor advierte que la aritmética simple falla y que no se ha aplicado DPO ni alineamiento por preferencias. Es, por tanto, un modelo de interés para investigación en modelos pequeños, experimentación con decodificación y despliegue en entornos con recursos muy limitados, más que para producción de alta fiabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con atención híbrida (12 capas sliding window de 1024 + 4 capas globales) |
| Parametros totales | 210.210.560 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `trust_remote_code=True`, código personalizado) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 16 capas y 768 dimensiones ocultas, con un esquema de atención mixto: 12 capas usan ventana deslizante de 1024 tokens y 4 capas usan atención global. Este diseño reduce el coste computacional de la atención en secuencias largas manteniendo capacidad de modelar dependencias globales, y es coherente con el contexto declarado de 8.192 tokens. El vocabulario es de 16.006 tokens, deliberadamente compacto para un modelo bilingüe zh/en.

El entrenamiento se documenta en tres fases: preentrenamiento base sobre un corpus mixto general (mm200_pt2) con 24,07 B tokens, ejecutado en 8 aceleradores Moore Threads MTT S4000; continuación de preentrenamiento en chino sobre Ultra-FineWeb-L3 en la variante `multi_style` con 1,40 B tokens; e instrucción supervisada (SFT) sobre 149.495 conversaciones chinas depuradas, con 316.456.960 tokens y 2 épocas reales (3.220 pasos, loss final 1,73). No se aplicó DPO ni ningún otro método de alineamiento por preferencias. Las fases de continuación y SFT se realizaron en RTX PRO 6000 Blackwell.

## Capacidades

- Generación de texto y diálogo multi-turno en chino e inglés, con formato de chat definido por `<|user|>...<|assistant|>...<|im_end|>`.
- Extracción de características (`feature-extraction`) además de generación, según los tags del repositorio.
- Razonamiento básico y respuesta a preguntas generales, limitado por el tamaño del modelo.
- Soporte de contexto de hasta 8.192 tokens, adecuado para conversaciones y documentos de longitud moderada.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No dispone de visión, audio ni modo "thinking".
- Capacidad multilingüe limitada a chino e inglés; no se declaran otros idiomas.

## Casos de uso

- Experimentación en investigación con modelos pequeños: el modelo sirve como banco de pruebas para estudiar el efecto de la ventana deslizante frente a la atención global en modelos de ~200 M de parámetros, con una cadena de entrenamiento documentada paso a paso.
- Despliegue en entornos con recursos mínimos: con 210 M de parámetros en bf16 (menos de 1 GB de pesos), cabe en CPU y en GPUs de gama baja, lo que permite prototipos de chatbot en dispositivos edge o entornos sin acelerador dedicado.
- Generación de texto asistida en chino para tareas de redacción breve: resúmenes, reformulación y respuestas conversacionales donde no se requiera precisión factual estricta, ajustando la temperatura a 0,1 según las recomendaciones del autor.
- Filtrado y clasificación de texto mediante extracción de características: los embeddings del modelo pueden usarse para agrupar o clasificar documentos en pipelines ligeros, aprovechando el tag `feature-extraction`.
- Base para fine-tuning específico de dominio: al estar bajo Apache 2.0 y con un vocabulario compacto, es un punto de partida económico para ajustar sobre datos propios en chino o inglés.
- Evaluación de estrategias de decodificación: el modelo card documenta barridos de `temperature`, `top_p`, `repetition_penalty` y `frequency_penalty` con métricas de repetición de 4-gramas, lo que lo hace útil para estudiar el impacto de estos parámetros en modelos pequeños.
- Demostraciones educativas de entrenamiento y SFT: la documentación de fases, tokens y hardware permite reproducir y explicar el ciclo completo de entrenamiento de un LLM pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta métricas internas de entrenamiento (loss final de SFT de 1,73) y de repetición de 4-gramas en pruebas de decodificación, sin comparaciones estandarizadas tipo MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en bf16 para los pesos (210 M de parámetros); en fp32, alrededor de 0,85 GB solo de pesos, más overhead de activaciones y caché KV.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo se entrenó parcialmente en Moore Threads MTT S4000 y RTX PRO 6000 Blackwell, pero para inferencia no requiere hardware de gama alta.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090) e incluso en CPU.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía documentada; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y no se publican pesos GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Ying K1.6 Lite 200M | 210 M | 8.192 | Apache 2.0 | zh, en | Atención híbrida sliding/global; SFT sin DPO |
| Qwen2.5-0.5B | ~500 M | 32.768 | Apache 2.0 | multilingüe | Mayor tamaño y contexto; requiere más VRAM |
| SmolLM2-135M | 135 M | 8.192 | Apache 2.0 | en (principalmente) | Enfoque en inglés; sin soporte chino declarado |
| TinyLlama-1.1B | 1,1 B | 2.048 | Apache 2.0 | en (principalmente) | Mayor tamaño, contexto menor, sin chino nativo |

Los datos de los modelos comparables corresponden a sus especificaciones públicas habituales; no se dispone de comparaciones de rendimiento directas con Ying K1.6 Lite en la información proporcionada.

## Limitaciones y advertencias

- Aritmética simple: el propio autor advierte que operaciones como 1+1 pueden fallar; es una limitación de capacidad del tamaño de 210 M.
- Alucinación de identidad y hechos: con temperatura superior a 0,3 el modelo empieza a inventar identidad y datos; a 0,7 llega a autodenominarse "Qwen" o "material genético humano".
- Sin alineamiento por preferencias: no se aplicó DPO ni RLHF, por lo que no hay garantías de comportamiento alineado ni de rechazo de peticiones problemáticas.
- Sensibilidad extrema a los parámetros de muestreo: el autor documenta que los valores óptimos no son combinables entre sí y que temperature 0 provoca bucles de repetición.
- Sesgos: no se documenta ninguna evaluación de sesgos; el corpus de SFT es exclusivamente chino, lo que puede introducir sesgos culturales y lingüísticos.
- Cobertura de idiomas limitada a chino e inglés; el rendimiento en inglés no está cuantificado.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero el autor no ofrece garantías sobre idoneidad para producción.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; conviene auditar dicho código antes de desplegarlo.
- No hay pesos cuantizados publicados (GGUF, AWQ, GPTQ), lo que limita las opciones de despliegue en herramientas estándar de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Karasumikura/Ying-K1.6-Lite-200M
- Corpus Ultra-FineWeb-L3 (referenciado en la model card): no disponible como enlace directo en la información proporcionada
- Paper o blog técnico del modelo: no disponible
- Repositorio de código o demo: no disponible

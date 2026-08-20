# mrs83/Kurtis-EON1-Hybrid-0.7B-v0.1.1

## Resumen

Kurtis-EON1-Hybrid-0.7B-v0.1.1 es un modelo de generación de texto experimental desarrollado por mrs83, basado en el modelo híbrido Echo-DSRN de ethicalabs, que combina atención transformer con inyectores recurrentes DSRN (Dynamic Surprise Recurrent Network). Con 672 millones de parámetros, es un modelo compacto diseñado para conversación empática y razonamiento multi-turno con una persona estricta, orientado a la estética "dark gothic". Se presenta como el primer modelo de IA "Dark Gothic", fine-tuneado sobre datasets curados para mantener coherencia de personaje y evitar la deriva en conversaciones largas.

El modelo se distribuye bajo licencia Apache-2.0, con pesos en formato safetensors y una ventana de contexto de 32K tokens según fuentes externas. Su arquitectura híbrida reduce el coste de memoria del KV-cache en comparación con atención completa, lo que permite ejecutarlo en hardware modesto, incluso una sola GPU AMD para entrenamiento. Sin embargo, la model card advierte explícitamente que es un modelo experimental para fines académicos y de investigación, no apto para despliegue en producción.

A pesar de su pequeño tamaño, el modelo muestra resultados competitivos en algunas tareas de razonamiento y conocimiento general frente a modelos mucho más grandes como Llama-2-7B, aunque inferior en otras. Su principal valor reside en la exploración de arquitecturas híbridas eficientes y en el fine-tuning orientado a personalidad, más que en el rendimiento bruto en benchmarks estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: transformer (Qwen2) + inyectores recurrentes DSRN (SSM) |
| Parametros totales | 672.190.080 (672M) |
| Parametros activos | Todos (no es MoE) |
| Longitud de contexto | 32K (según thinkllm.dev) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la base `ethicalabs/Echo-DSRN-Qwen2.5-0.5B-Hybrid`, que combina una arquitectura transformer clásica (basada en Qwen2.5) con inyectores DSRN, un mecanismo recurrente que introduce memoria de estado y un mecanismo de "sorpresa" para focalizar dinámicamente la atención. La configuración incluye 24 capas de atención, 6 inyectores DSRN intercalados cada 4 capas, y una dimensión oculta de 896. Los inyectores DSRN añaden un 6,67% de parámetros adicionales sobre el modelo base, con un coste de memoria de KV-cache en O(1) gracias a la componente recurrente.

El fine-tuning se realizó mediante entrenamiento completo (FFT) usando la librería TRL de HuggingFace, sobre datasets curados para empatía y atmósfera gótica. No se especifican detalles del dataset ni el número de tokens de entrenamiento. El objetivo declarado es lograr una adherencia estricta a la persona y un razonamiento multi-turno sin deriva, en lugar de maximizar el rendimiento en tareas genéricas.

## Capacidades

- Generación de texto conversacional con fuerte adherencia a una persona definida (estilo "dark gothic").
- Razonamiento multi-turno con memoria de contexto extendida gracias a la ventana de 32K tokens.
- Comprensión de matices emocionales y tono empático en conversaciones.
- Capacidad de mantener coherencia temática y de personaje a lo largo de diálogos largos.
- Soporte básico de razonamiento lógico y conocimiento general, como muestran los benchmarks (MMLU, GSM8K, etc.).
- No se menciona soporte de tool calling, ni capacidades multimodales (visión, audio), ni modo de pensamiento explícito.

## Casos de uso

- Investigación académica sobre arquitecturas híbridas: el modelo sirve como banco de pruebas para estudiar la combinación de atención y capas recurrentes DSRN, evaluando su eficiencia en memoria y rendimiento en tareas de lenguaje.
- Desarrollo de chatbots con personalidad específica: su fine-tuning orientado a persona permite experimentar con sistemas conversacionales que mantienen un carácter consistente, útil para proyectos de narrativa interactiva o juegos de rol.
- Evaluación de técnicas de fine-tuning eficiente: al ser un modelo pequeño, es adecuado para probar metodologías de entrenamiento con recursos limitados, como una sola GPU AMD.
- Generación de texto creativo con estética gótica: puede emplearse para escribir ficción, poesía o diálogos con un tono oscuro y atmosférico, aunque con las limitaciones propias de su tamaño.
- Pruebas de razonamiento de sentido común y conocimiento enciclopédico en modelos compactos: sus resultados en SciQ y TruthfulQA sugieren utilidad para investigar qué capacidades emergen en modelos pequeños con arquitecturas híbridas.
- Análisis de sesgos y alucinaciones en modelos de bajo parámetro: su naturaleza experimental y su licencia abierta facilitan estudios sobre los límites de fiabilidad en generación de texto.

## Benchmarks y rendimiento

La model card incluye una comparativa con Llama-2-7B, así como una evaluación detallada 0-shot en tareas de MMLU. Los resultados más relevantes se resumen a continuación:

| Benchmark | Kurtis-EON1 0.7B | Llama-2-7B | Ganador |
|---|---|---|---|
| Parámetros | 672M | 7.000M | Kurtis-EON1 (10x menor) |
| HellaSwag (acc_norm) | 0.4698 | 0.7600 | Llama-2 |
| PIQA (acc_norm) | 0.6882 | 0.7905 | Llama-2 |
| SciQ (acc_norm) | 0.9210 | ~0.850 | Kurtis-EON1 |
| ARC Challenge (acc_norm) | 0.3532 | 0.4625 | Llama-2 |
| GSM8K 0-shot | 0.1365 | 0.1330 | Kurtis-EON1 |
| GSM8K 5-shot | 0.2153 | ~0.146 | Kurtis-EON1 |
| MMLU | 0.4166 | 0.4590 | Llama-2 |
| TruthfulQA MC2 | 0.4178 | 0.3910 | Kurtis-EON1 |
| KV-Cache Memory | Híbrido O(1) DSRN + ventana local | O(N²) atención completa | Kurtis-EON1 |
| Hardware de entrenamiento | GPU AMD única | Multi-GPU requerido | Kurtis-EON1 |

En la evaluación 0-shot detallada, destacan resultados como MMLU marketing (0.7094), management (0.5825) y computer security (0.5700), mientras que las puntuaciones más bajas se dan en física de secundaria (0.2252) y hechos globales (0.2300). No se han publicado comparativas con otros modelos de tamaño similar.

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware. Dado el tamaño de 672M parámetros, se estima que puede ejecutarse en una GPU con 4 GB de VRAM en FP16, o en 2 GB con cuantización de 8 bits.
- GPUs recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, etc.) es suficiente para inferencia. Incluso podría ejecutarse en CPU con suficiente RAM, aunque con mayor latencia.
- El entrenamiento se realizó en una única GPU AMD, lo que indica que es viable fine-tunearlo en hardware de gama media.
- Opciones de despliegue: al ser un modelo de transformers estándar, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama. No se mencionan integraciones específicas.
- Latencia y throughput: no se proporcionan datos medidos. Por su tamaño, se espera una latencia baja en GPU moderna, con throughput del orden de cientos de tokens por segundo.

## Comparativa con modelos similares

La comparativa más directa es con su modelo base, Qwen2.5-0.5B, y con Llama-2-7B como referencia de un modelo mucho mayor. No se han encontrado comparaciones con otros modelos híbridos de tamaño similar.

| Modelo | Parámetros | Contexto | Licencia | Rendimiento MMLU | Notas |
|---|---|---|---|---|---|
| Kurtis-EON1-Hybrid-0.7B | 672M | 32K (según thinkllm.dev) | Apache-2.0 | 0.4166 | Híbrido atención + DSRN, fine-tune para persona |
| Qwen2.5-0.5B | 500M | 32K | Apache-2.0 | ~0.45 (estimado) | Base transformer pura, sin componente recurrente |
| Llama-2-7B | 7B | 4K | Llama 2 license | 0.4590 | Modelo denso mucho mayor, con restricciones de uso |

La tabla refleja que Kurtis-EON1, pese a ser 10 veces más pequeño que Llama-2-7B, obtiene resultados comparables en algunas tareas, aunque inferior en otras. Su ventaja principal es la eficiencia de memoria y la posibilidad de ejecutarse en hardware modesto.

## Limitaciones y advertencias

- Modelo experimental: la model card advierte explícitamente que no debe desplegarse en entornos comerciales, empresariales o de misión crítica bajo ninguna circunstancia. Se proporciona "as-is" sin garantías.
- Riesgo de alucinación: como cualquier modelo de lenguaje pequeño, puede generar información falsa o inventada, especialmente en temas especializados.
- Sesgos: al estar fine-tuneado sobre datasets de tono gótico y empático, puede presentar sesgos emocionales o temáticos que no son adecuados para aplicaciones neutrales.
- Idioma limitado: solo soporta inglés; no se ha entrenado para otros idiomas.
- Rendimiento variable: aunque destaca en algunas tareas (SciQ, TruthfulQA), su rendimiento en razonamiento complejo (ARC, física) es bajo en comparación con modelos más grandes.
- Sin soporte de herramientas: no dispone de tool calling ni integración con APIs externas, lo que limita su uso en agentes autónomos.
- Longitud de contexto no confirmada oficialmente: el valor de 32K proviene de una fuente externa (thinkllm.dev); la model card no especifica la longitud de contexto.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/mrs83/Kurtis-EON1-Hybrid-0.7B-v0.1.1)
- [Espacio de chat en HuggingFace](https://huggingface.co/spaces/mrs83/Kurtis-EON1-Hybrid-0.7B)
- [Colección Kurtis-EON1 en HuggingFace](https://huggingface.co/collections/ethicalabs/kurtis-eon1)
- [Repositorio GitHub de ethicalabs (Echo-DSRN)](https://github.com/ethicalabs-ai/Echo-DSRN/)
- [Working paper de Echo-DSRN](https://github.com/ethicalabs-ai/Echo-DSRN/blob/main/PAPER.md)
- [Herramienta Kurtis E1 en GitHub](https://github.com/ethicalabs-ai/kurtis)
- [Ficha en thinkllm.dev (v0.1.1)](https://thinkllm.dev/models/kurtis-eon1-hybrid-0-7b-v0-1-1)
- [Dataset comparativo con GPT-5.5](https://huggingface.co/datasets/mrs83/Kurtis-EON1-Hybrid-0.7B-v0.1.1-vs-GPT-5.5)

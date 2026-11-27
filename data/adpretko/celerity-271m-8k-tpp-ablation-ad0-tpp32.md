# adpretko/celerity-271m-8k-tpp-ablation-ad0-tpp32

## Resumen

Celerity 271M 8K es un punto de control (checkpoint) de un modelo de lenguaje de 271 millones de parámetros entrenado por Cerebras y convertido al formato de Hugging Face por el usuario adpretko. Forma parte de una ablación centrada en el "tokens per parameter" (TPP), es decir, en la relación entre el volumen de datos de entrenamiento y el tamaño del modelo. En este caso concreto, el experimento `ad0_ild_tpp32` corresponde a un régimen nominal de 32 tokens por parámetro, con una tasa de dropout de atención que decae linealmente por capas y un valor final de 0.

El modelo se ha entrenado sobre CommonPile (un corpus abierto de datos con licencias permisivas) en su variante "corrected no-repeat TPP pool", durante 17 630 pasos y un total de 8 665 497 600 tokens, empleando 3 sistemas CSX de Cerebras. Soporta una longitud máxima de secuencia de 8192 tokens y utiliza embeddings posicionales ALiBi en lugar de posicionales absolutos aprendidos.

Su relevancia es fundamentalmente de investigación: se trata de un artefacto de ablación que permite estudiar cómo afecta el número de tokens por parámetro y la configuración de dropout de atención al rendimiento de modelos pequeños entrenados con hardware especializado. No es un modelo pensado para producción ni para uso general; su interés radica en la reproducibilidad de experimentos de escalado y en el análisis de recetas de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (detalles completos no disponibles); embeddings posicionales ALiBi |
| Parametros totales | 271M (según nombre del modelo) |
| Parametros activos | no disponible (no es MoE según la información) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible explícitamente; requiere `trust_remote_code=True` y código personalizado (custom_code) |
| Tokens de entrenamiento | 8 665 497 600 |
| Tokens por parámetro (nominal) | 32 |
| Pasos de entrenamiento | 17 630 |
| Batch global | 60 |
| Learning rate pico | 0.15 |
| Weight decay | 0.002741075441904568 |
| tau_ema | 0.13795436292484553 |
| Dropout de atención (endpoint) | 0 (escala lineal por capa) |
| Dropout residual / stochastic depth / LayerDrop | 0.0 / 0.0 / 0.0 |
| Dataset | CommonPile, corrected no-repeat TPP pool |
| Sistemas de entrenamiento | 3 CSX (Cerebras) |
| Runtime de origen | cbcore 2.6.0 |
| Commit del conversor | 0e3d5d375695293479df9d2a3717f05f71a345b4 |

## Arquitectura y entrenamiento

La información disponible indica que se trata de un transformer decoder-only con embeddings posicionales de tipo ALiBi, lo que permite extender la ventana de contexto hasta 8192 tokens sin posicionales absolutos aprendidos. El modelo se entrenó desde cero (no es un fine-tuning) sobre CommonPile en una variante corregida sin repeticiones del pool TPP, con un presupuesto nominal de 32 tokens por parámetro. La receta incluye un learning rate pico relativamente alto (0.15), weight decay de 0.00274 y un esquema de dropout de atención dependiente de la capa con escala lineal y endpoint 0, lo que implica que las capas finales no aplican dropout de atención mientras que las iniciales sí lo hacen en mayor medida.

El entrenamiento se realizó sobre 3 sistemas CSX de Cerebras con el runtime cbcore 2.6.0, lo que sugiere un pipeline optimizado para hardware de cómputo masivo con batches globales pequeños (60) y muchos pasos (17 630). No se documentan innovaciones como decodificación especulativa, atención lineal ni mezclas de expertos. El checkpoint se convirtió posteriormente al formato de Hugging Face mediante un conversor con commit identificado, y requiere cargarse con `trust_remote_code=True` debido a la presencia de código personalizado.

## Capacidades

- Generación de texto autoregresiva estándar para un modelo decoder-only de 271M de parámetros.
- Razonamiento básico y completado de texto en inglés (idioma del corpus CommonPile), aunque los idiomas no están declarados oficialmente.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- No se documenta modo "thinking", visión, audio ni otras modalidades.
- Capacidades multilingües no disponibles (no declaradas en la model card).
- El modelo está pensado como artefacto de ablación, no como asistente afinado con RLHF/DPO.

## Casos de uso

- Investigación sobre escalado de datos: permite estudiar empíricamente el efecto de 32 tokens por parámetro en un modelo de 271M, comparándolo con checkpoints de otras ablaciones del mismo autor (por ejemplo, variantes ad0 con distintos TPP).
- Reproducción de experimentos de entrenamiento: al estar documentados los hiperparámetros (learning rate, weight decay, tau_ema, batch, pasos), sirve como referencia para replicar recetas en hardware Cerebras o en otras plataformas.
- Análisis de esquemas de dropout de atención: el endpoint 0 con escala lineal por capa permite estudiar cómo afecta la regularización de atención a la convergencia en modelos pequeños.
- Evaluación de embeddings posicionales ALiBi: útil para comparar el comportamiento en contextos largos (hasta 8192 tokens) frente a posicionales rotatorios o absolutos en modelos de este tamaño.
- Baseline para fine-tuning ligero: al ser un modelo pequeño (271M), puede servir como punto de partida para tareas específicas de clasificación o generación en entornos con recursos limitados, siempre que la licencia lo permita (no disponible).
- Estudio de corpus CommonPile: permite analizar qué aprende un modelo de 271M entrenado exclusivamente sobre este corpus abierto, útil para investigaciones sobre calidad y sesgos de datos con licencias permisivas.
- Docencia y experimentación académica: su tamaño reducido y su contexto de 8K lo hacen manejable en laboratorios con GPUs de gama media para prácticas de entrenamiento e inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,54 GB solo para pesos (271M × 2 bytes), más overhead de activaciones y caché KV; en la práctica, menos de 2 GB para contextos moderados.
- VRAM estimada en fp32: aproximadamente 1,1 GB para pesos, más overhead.
- En cuantización de 8 bits o 4 bits (si se generan pesos GGUF, no confirmado): por debajo de 0,5 GB para pesos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también cabe en GPUs de gama baja e incluso en CPU para inferencia lenta.
- Cabe holgadamente en GPUs consumer; no requiere A100 ni H100 para inferencia.
- Opciones de despliegue: al requerir `trust_remote_code=True` y código personalizado, la integración con vLLM, TGI o llama.cpp no está garantizada; la vía más segura es `transformers` con el código del repositorio. No se documentan pesos GGUF ni soporte en Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Celerity 271M 8K (este) | 271M | 8192 | no disponible | Hugging Face, requiere trust_remote_code | Checkpoint de ablación TPP |
| GPT-2 small | 124M | 1024 | MIT | Amplia | Referencia clásica de modelos pequeños |
| Pythia-410M | 410M | 2048 | Apache 2.0 | Amplia | Suite de investigación con checkpoints intermedios |
| TinyLlama-1.1B | 1,1B | 2048 | Apache 2.0 | Amplia | Modelo pequeño afinado para instrucciones |

La comparación directa es limitada porque Celerity 271M es un artefacto de ablación sin benchmarks publicados ni licencia declarada. Frente a GPT-2 small y Pythia-410M, ofrece mayor contexto (8192 frente a 1024/2048) gracias a ALiBi, pero carece de la documentación, licencia y ecosistema de herramientas de esas alternativas. TinyLlama, aunque más grande, está orientado a uso práctico con instrucciones, algo que este checkpoint no declara.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; tratar como restringido hasta verificación.
- Idiomas no declarados: el corpus CommonPile es mayoritariamente inglés, por lo que el rendimiento en castellano es incierto y probablemente deficiente.
- Riesgo de alucinación elevado: modelo pequeño sin RLHF/DPO, no alineado para instrucciones ni para conversación.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; revisar el código antes de usarlo en producción.
- Es un checkpoint de ablación, no un modelo final: puede contener artefactos de entrenamiento propios del experimento (por ejemplo, el esquema de dropout por capas).
- Sin soporte documentado de tool calling, agentes ni multimodalidad.
- Contexto de 8192 tokens nominal; el rendimiento efectivo en el extremo de la ventana no está verificado.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adpretko/celerity-271m-8k-tpp-ablation-ad0-tpp32
- CommonPile (dataset): no disponible enlace directo en la información proporcionada
- Cerebras (hardware y runtime cbcore): no disponible enlace directo en la información proporcionada
- Paper o blog del experimento TPP: no disponible en la información proporcionada

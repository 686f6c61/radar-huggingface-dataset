# jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-equal-scandimerge-seed3

## Resumen

El modelo `jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-equal-scandimerge-seed3` es un ajuste fino de SmolLM2-135M-Instruct, desarrollado por el usuario jekunz como parte de una línea de experimentos de adaptación lingüística al feroés. Se trata de un modelo de generación de texto de 134,5 millones de parámetros construido sobre la arquitectura Llama, entrenado en dos fases: primero sobre una fusión TIES con pesos iguales de cinco modelos ajustados a danés, islandés, noruego bokmål, noruego nynorsk y sueco, y después sobre el subconjunto en feroés de FineWeb-2.

El objetivo del modelo es transferir conocimiento multilingüe escandinavo hacia el feroés, un idioma con recursos limitados dentro del ecosistema de modelos abiertos. Es una variante con semilla 3 de tres configuraciones de entrenamiento idénticas, lo que lo convierte en una pieza útil para estudiar la varianza entre semillas en procesos de continued pre-training sobre lenguas de bajos recursos.

Por su tamaño y naturaleza experimental, no está pensado como un modelo de producción generalista sino como material de investigación sobre transferencia entre lenguas cercanas y sobre la estabilidad del ajuste fino en corpus pequeños. El autor indica explícitamente que no se ha evaluado de forma amplia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama (SmolLM2-135M-Instruct) |
| Parametros totales | 134.515.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud maxima usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF no publicadas) |
| Idiomas soportados | Feroes (fo); entrenamiento derivado de danes, islandes, noruego bokmal, noruego nynorsk y sueco |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de SmolLM2-135M-Instruct: un transformer decoder-only con atención causal estándar y 135 millones de parámetros. Sobre esa base, el autor aplica una primera fase de continued pre-training sobre una fusión TIES con pesos iguales de cinco modelos entrenados en danés, islandés, noruego bokmål, noruego nynorsk y sueco, y una segunda fase sobre el subconjunto en feroés de HuggingFaceFW/fineweb-2.

Los hiperparámetros documentados son: 1 época por idioma de origen y 5 épocas en feroés, tasa de aprendizaje 5e-4, scheduler coseno, warmup ratio 0,05, batch size 8 con acumulación de gradientes de 32 pasos (batch efectivo de 256), longitud máxima de contexto de 2048 tokens, semilla 3 y entrenamiento en una única GPU A100 de 40 GB. No se documenta el número total de tokens procesados, la composición exacta del corpus ni el uso de RLHF o DPO; el ajuste se limita a pre-entrenamiento continuado supervisado sobre texto.

La innovación metodológica es la combinación de model merging (TIES) con posterior adaptación monolingüe, una estrategia habitual para lenguas de bajos recursos donde los datos directos son escasos y se aprovecha el conocimiento de lenguas emparentadas.

## Capacidades

- Generación de texto autoregresiva en feroés, con posible deriva hacia otras lenguas escandinavas por el origen del entrenamiento.
- Conversación multi-turno heredada del formato instruct de SmolLM2-135M-Instruct.
- Razonamiento básico y respuesta a instrucciones simples, limitado por el tamaño del modelo.
- Capacidades multilingües residuales en danés, islandés, noruego bokmål, noruego nynorsk y sueco, aunque el autor solo declara feroés como idioma objetivo.
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documenta modo de razonamiento explícito (thinking), visión ni audio.

## Casos de uso

- Investigación sobre transferencia entre lenguas escandinavas: permite comparar el efecto de una fusión TIES seguida de ajuste en feroés frente a entrenamientos directos, usando las tres semillas publicadas para medir varianza.
- Generación de texto sintético en feroés para aumento de datos: el modelo puede producir borradores de frases y párrafos que, tras filtrado humano, amplíen corpus pequeños de esta lengua.
- Experimentos de evaluación de perplejidad en feroés: sirve como línea base ligera para medir la calidad de corpus y tokenizadores en tareas de modelado del lenguaje.
- Prototipado de asistentes conversacionales en feroés: con 135M de parámetros puede desplegarse en entornos con recursos muy limitados para validar flujos de diálogo antes de escalar a modelos mayores.
- Estudio de olvido catastrófico: al partir de un modelo multilingüe fusionado y ajustarlo de forma intensiva en un solo idioma, es un caso útil para analizar la degradación de capacidades previas.
- Docencia y experimentación en ajuste fino: su tamaño permite reproducir el pipeline completo (fusión, continued pre-training, evaluación) en una sola GPU A100 o incluso en GPUs de consumo con cuantización.
- Análisis de sesgo de semilla: al existir tres semillas de la misma configuración, permite cuantificar cuánto varían las salidas y las métricas entre ejecuciones idénticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el modelo "has not been evaluated more broadly yet".

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,3 GB de pesos, con overhead adicional de activaciones y caché KV; en la práctica cabe en menos de 1 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 0,15 GB de pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 0,08 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; A100, H100 o RTX 4090 no son necesarias y quedan sobredimensionadas.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (RTX 3060, RTX 4060, GTX 1660, e incluso iGPU con suficiente memoria compartida).
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatible; llama.cpp y Ollama requerirían conversión a GGUF, no publicada en el repositorio.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño, se espera un throughput muy alto en GPU moderna, pero no hay cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-equal-scandimerge-seed3 | 134,5 M | 2048 | Feroes (con base escandinava) | Apache 2.0 | Hugging Face |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135 M | 8192 (modelo base original) | Inglés principalmente | Apache 2.0 | Hugging Face |
| jekunz/smollm135m-da1-is1-nno1-nob1-sv1-ties | 135 M (estimado por herencia) | no disponible | Danés, islandés, noruego, sueco | Apache 2.0 (por herencia) | Hugging Face |

La comparación con SmolLM2-135M-Instruct es la más directa: comparten arquitectura y tamaño, pero el modelo de jekunz está especializado en feroés y ha perdido parte de la cobertura multilingüe general del original. Frente al modelo fusionado del que parte, esta variante añade la fase de ajuste en feroés. No se dispone de métricas comparativas publicadas para establecer diferencias de rendimiento cuantitativas.

## Limitaciones y advertencias

- Modelo experimental sin evaluación amplia: el propio autor advierte que no ha sido evaluado más allá de su uso interno de investigación.
- Riesgo elevado de alucinación y de texto incoherente por el tamaño reducido (135M) y las pocas épocas de entrenamiento.
- Posible contaminación lingüística: al derivar de una fusión escandinava y entrenarse solo 5 épocas en feroés, puede generar mezclas de danés, noruego o sueco.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Sin datos publicados sobre sesgos; al entrenarse sobre FineWeb-2, hereda los sesgos del corpus web filtrado.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluación hace desaconsejable su uso en producción sin validación previa.
- No hay versiones cuantizadas publicadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en herramientas como llama.cpp u Ollama sin conversión manual.
- Al ser la semilla 3 de tres ejecuciones, los resultados pueden diferir de las otras semillas; no debe tratarse como un resultado único y estable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-equal-scandimerge-seed3
- Modelo base (fusión TIES escandinava): https://huggingface.co/jekunz/smollm135m-da1-is1-nno1-nob1-sv1-ties
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Modelo original SmolLM2-135M-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct

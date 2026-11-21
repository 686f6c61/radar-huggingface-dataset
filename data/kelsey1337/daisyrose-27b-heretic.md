# kelsey1337/DaisyRose-27B-Heretic

## Resumen

DaisyRose-27B-Heretic es una variante "abliterated" (decensored) del modelo RadixArk/DaisyRose-27B, publicada por el usuario kelsey1337 en Hugging Face. El modelo base pertenece a la familia etiquetada como `qwen3_5`/`daisyrose` y cuenta con 27.356.728.560 parámetros (unos 27,4 mil millones), distribuidos en pesos BF16 con un tamaño de repositorio de 54,7 GB. La modificación consiste en la aplicación de la herramienta Heretic 2.1.0, que mediante ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) elimina parcialmente el comportamiento de rechazo del modelo original.

El problema que aborda es la supresión de las respuestas de negativa del modelo base: el DaisyRose-27B original rechazaba 98 de cada 100 peticiones según la lista de palabras clave por defecto de Heretic, mientras que la variante Heretic reduce esa cifra a 46/100 en la prueba seleccionada (trial #59), con una divergencia KL de 0,0753 respecto al original. El autor declara explícitamente que se trata de una versión parcial (v1) y que el objetivo de aproximadamente 5/100 rechazos con KL inferior a 0,07 no se alcanzó.

La relevancia del modelo es acotada y de nicho: se orienta a experimentación con modelos sin filtros de rechazo, evaluación de técnicas de ablación y estudios sobre el equilibrio entre supresión de negativas y degradación de capacidades. No hay información publicada sobre benchmarks de rendimiento, idiomas soportados ni pipeline de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen, tag `qwen3_5`); detalles no disponibles |
| Parametros totales | 27.356.728.560 (27,4 mil millones) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 en este repositorio; GGUF en repositorio separado (`kelsey1337/DaisyRose-27B-Heretic-GGUF`); niveles GGUF concretos no disponibles |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16); GGUF en repositorio aparte |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo RadixArk/DaisyRose-27B, etiquetado en Hugging Face con los tags `qwen3_5` y `qwen3.8`, lo que sugiere una base derivada de la familia Qwen 3.5/3.8. No se dispone de información detallada sobre el número de capas, la dimensionalidad de las representaciones, el mecanismo de atención ni la composición del dataset de preentrenamiento o ajuste fino del modelo original.

La modificación Heretic no es un reentrenamiento: es una ablación de direcciones en el espacio de activaciones aplicada sobre los pesos BF16 completos. Se ejecutó con Heretic 2.1.0 usando Arbitrary-Rank Ablation y los scorers por defecto (tasa de palabras clave de rechazo y divergencia KL), sobre GPUs A100 y H200 con un único estudio Optuna compartido entre máquinas. Se realizaron 342 trials de Optuna; el trial seleccionado fue el #59, con 46/100 rechazos contados por palabras clave y KL de 0,0753. Algunos trials se sembraron manualmente con los parámetros publicados de una build AWQ de DaisyRose Heretic existente. El autor indica que por debajo de aproximadamente 45/100 rechazos contados las ediciones empezaban a dañar el modelo (KL entre 0,3 y 12), lo que motivó detener la búsqueda en este punto. El log completo de la ejecución está incluido como `heretic-run.log` en el repositorio GGUF.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base DaisyRose-27B; no se documentan capacidades específicas en la model card.
- Comportamiento sin rechazo: la ablación reduce las negativas del modelo base de 98/100 a 46/100 según el conteo por palabras clave de Heretic.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Código y matemáticas: no documentadas para esta variante.

## Casos de uso

- Investigación sobre ablación de direcciones: el modelo sirve como caso de estudio reproducible para analizar cómo varía la divergencia KL y la tasa de rechazo en función de los parámetros de ablación, con 342 trials documentados y log público.
- Evaluación del equilibrio decensor/degradación: útil para medir experimentalmente el punto en que la supresión de rechazos empieza a deteriorar capacidades, dado que el autor reporta que por debajo de ~45/100 rechazos el KL se dispara entre 0,3 y 12.
- Generación de texto creativo sin filtros: para entornos controlados donde se requiere que el modelo no introduzca negativas ni advertencias en la salida, con supervisión humana del contenido.
- Comparación de técnicas de decensoring: permite contrastar Heretic 2.1.0 con ARA frente a otras aproximaciones (por ejemplo, la build AWQ existente usada como semilla) sobre el mismo modelo base.
- Experimentación con cuantización GGUF: al existir un repositorio GGUF separado, se puede evaluar la degradación adicional que introduce la cuantización sobre un modelo ya ablacionado.
- Investigación sobre robustez frente a inyección de prompts: dado que la ablación elimina el comportamiento de rechazo, el modelo es un sujeto de prueba adecuado para estudiar la susceptibilidad a instrucciones inyectadas en contenido no confiable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas internas del proceso de ablación: 98/100 rechazos en el modelo base frente a 46/100 en el trial #59, con KL de 0,0753. La re-verificación manual del trial seleccionado desglosa los 43 conteos en 12 respuestas con frase de rechazo real y 31 con solo palabras de advertencia.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 55 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica requiere del orden de 60-70 GB o más según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: alrededor de 28-30 GB de pesos.
- VRAM estimada en cuantización de 4 bits (GGUF Q4): alrededor de 14-16 GB de pesos.
- GPU recomendadas para BF16: A100 80 GB, H100 80 GB, H200; el autor menciona A100 y H200 para el proceso de ablación.
- GPU de consumo: en BF16 no cabe en ninguna GPU de consumo actual. En cuantizaciones GGUF de 4 bits podría caber en RTX 4090 (24 GB) o RTX 3090 (24 GB), aunque no se han publicado mediciones concretas.
- Opciones de despliegue: llama.cpp u Ollama para los GGUF; vLLM o TGI para los pesos safetensors BF16. No se documentan configuraciones probadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| DaisyRose-27B-Heretic | 27,4 B | No disponible | Apache 2.0 | Variante ablacionada, v1 parcial |
| RadixArk/DaisyRose-27B (base) | 27,4 B | No disponible | No disponible | Modelo original, 98/100 rechazos |
| Build AWQ de DaisyRose Heretic existente | 27,4 B (cuantizado) | No disponible | No disponible | Usada como semilla en la búsqueda Optuna |

No se dispone de datos de rendimiento comparables entre estas variantes más allá de las tasas de rechazo y la divergencia KL reportadas por el autor.

## Limitaciones y advertencias

- Decensor parcial e incompleto: la v1 no alcanza el objetivo declarado de ~5/100 rechazos con KL ≤ 0,07; se queda en 46/100 con KL 0,0753.
- Degradación de capacidades: el autor advierte que por debajo de ~45/100 rechazos contados las ediciones dañaban el modelo, con KL entre 0,3 y 12, lo que indica riesgo de pérdida de calidad en versiones más agresivas.
- Sesgos: no documentados, pero heredados del modelo base, sobre el que no hay información de composición de datos ni de ajuste por RLHF.
- Riesgo de alucinación: no cuantificado; sin benchmarks publicados no puede estimarse.
- Seguridad frente a inyección de prompts: la ablación elimina el comportamiento de rechazo, por lo que el modelo es más propenso a seguir instrucciones inyectadas en contenido no confiable (páginas web, archivos de repositorio, salida de herramientas). El autor recomienda no combinarlo con credenciales activas ni acceso a shell sin sandbox.
- Conteo de rechazos conservador: la lista de palabras clave de Heretic cuenta como rechazo cualquier respuesta que contenga términos como "illegal", "harmful", "disclaimer" o "As an AI", aunque el modelo responda a continuación; la cifra real de negativas es menor (12/100 en la re-verificación manual).
- Idiomas y contexto: sin datos publicados, no puede garantizarse un comportamiento multilingüe ni una ventana de contexto concreta.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo modificado.
- Trazabilidad del proceso: la ejecución fue operada por asistentes de IA (Claude Opus 5.5 y Gemini 4 Neon) bajo supervisión del publicador, lo que el autor declara explícitamente por transparencia; el log completo está en el repositorio GGUF.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kelsey1337/DaisyRose-27B-Heretic
- Modelo base: https://huggingface.co/RadixArk/DaisyRose-27B
- Repositorio GGUF: https://huggingface.co/kelsey1337/DaisyRose-27B-Heretic-GGUF
- Heretic (herramienta de ablación): https://github.com/p-e-w/heretic

# harribo11/ultraviolet-50m-base-alpha

## Resumen

Ultraviolet 50M (UV-50M) es un modelo de lenguaje de 50,8 millones de parámetros, decoder-only, desarrollado por el usuario harribo11 (hliuson en GitHub) y publicado bajo licencia Apache 2.0. Se trata de un *model organism* diseñado específicamente para experimentación rápida con aprendizaje por refuerzo (RL) sobre modelos de lenguaje, no como un asistente de propósito general. Su nombre y arquitectura derivan del modelo Limite 1B Violetto de Paradigma, y está optimizado para velocidad de inferencia antes que para rendimiento máximo por parámetro.

El modelo se ha preentrenado desde cero sobre 5.800 millones de tokens de texto matemático, incluyendo matemáticas web, libros de texto, soluciones trabajadas y trazas de razonamiento. Su ventana de contexto es de 4096 tokens y emplea un tokenizador BPE de 16.384 entradas. La relevancia actual del modelo radica en su capacidad de ejecutarse y entrenarse con RL en GPUs de consumo: en contextos cortos (por debajo de 1.000 tokens) supera los 200.000 tokens por segundo de throughput en una única RTX 2080 Ti.

Este checkpoint concreto es el modelo base, preentrenado pero no ajustado para resolución de problemas por prompt. El autor remite a `ultraviolet-50m-mid-alpha` para ese uso. La ficha se basa exclusivamente en la información publicada en la model card y en los metadatos de Hugging Face; cualquier dato no presente se indica como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only |
| Parametros totales | 50,8 M (10 capas, d_model 640, 8 cabezas de consulta / 1 cabeza KV, head_dim 64) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (checkpoint publicado en fp32; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | no disponible (entrenado principalmente sobre texto matemático; no se declaran idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | `model.pt` (checkpoint de PyTorch en fp32 con dict `model` y `cfg`) |

## Arquitectura y entrenamiento

UV-50M es un transformer decoder-only de 10 capas con dimensión de modelo 640, 8 cabezas de consulta y una única cabeza de clave-valor (atención con compartición KV, GQA), con dimensión de cabeza 64. Esta configuración reduce el coste de memoria de la caché KV y favorece la velocidad de inferencia, en línea con el objetivo declarado de optimizar el throughput antes que el rendimiento por parámetro. El tokenizador es un BPE de 16.384 tokens incluido en el repositorio.

El preentrenamiento se realizó desde cero sobre 5.800 millones de tokens de texto matemático: matemáticas de web, libros de texto, soluciones trabajadas y trazas de razonamiento. La model card remite a `DATA.md` para las fuentes y el proceso de descontaminación, pero ese documento no está incluido en la información proporcionada. No se detalla si hubo fases de RLHF, DPO u otras etapas de alineación en este checkpoint base. El formato de prompt documentado (`<|endoftext|>Problem:\n{problem}\n\n<think>\n`) sugiere que el modelo fue entrenado para producir trazas de razonamiento delimitadas por `</think>` y una solución final en `\boxed{answer}`.

## Capacidades

- Generación de texto y razonamiento matemático: el modelo está entrenado principalmente sobre matemáticas y produce trazas de razonamiento seguidas de una respuesta final en formato `\boxed{}`.
- Resolución de problemas por prompt: este checkpoint es el base; para ese uso el autor remite a `ultraviolet-50m-mid-alpha`.
- Razonamiento multi-paso: la estructura de prompt con `<think>` indica soporte para cadenas de razonamiento explícitas.
- Tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingües: no disponibles; no se declaran idiomas soportados.
- Capacidades especiales: no se documentan visión, audio ni modo thinking separado más allá de la traza de razonamiento.
- Entrenamiento con RL: el modelo está pensado como organismo para experimentos de RL, lo que implica que puede ajustarse con recompensas sobre su propia salida.

## Casos de uso

- Experimentación con RL sobre modelos de lenguaje: el modelo cabe y se entrena en una GPU de consumo, lo que permite iterar algoritmos de RL (por ejemplo, variantes de policy gradient o preference optimization) con ciclos rápidos y bajo coste. Su tamaño de 50,8 M y su throughput superior a 200.000 tokens/s en contextos cortos en una 2080 Ti lo hacen adecuado para barridos de hiperparámetros.
- Investigación en razonamiento matemático a pequeña escala: sirve para estudiar cómo emergen trazas de razonamiento (`<think>...</think>`) y respuestas en `\boxed{}` en modelos pequeños entrenados con datos matemáticos, sin necesidad de clústeres de GPU.
- Docencia y divulgación: al ejecutarse en GPUs de consumo y con un repositorio de 0,2 GB, permite demostrar el ciclo completo de preentrenamiento, ajuste y evaluación de un modelo de lenguaje en un portátil con GPU.
- Pruebas de infraestructura de inferencia: su velocidad permite validar pipelines de serving, tokenización y formateo de prompts con bajo coste computacional antes de escalar a modelos mayores.
- Generación de datos sintéticos matemáticos a pequeña escala: el modelo puede producir soluciones trabajadas y trazas de razonamiento que sirvan como datos de entrenamiento o de evaluación para modelos mayores, siempre con revisión humana.
- Reproducción de experimentos: al publicarse el código en GitHub y el checkpoint en Hugging Face, permite reproducir y auditar resultados de investigación sobre modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El único dato de rendimiento proporcionado es de throughput: más de 200.000 tokens por segundo en contextos de menos de 1.000 tokens en una única RTX 2080 Ti.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint fp32 de 50,8 M de parámetros ocupa aproximadamente 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU con 2 GB o más de VRAM.
- GPU recomendadas: cualquier GPU de consumo moderna (RTX 2080 Ti, RTX 3060, RTX 4090, etc.) es suficiente; el autor cita explícitamente la RTX 2080 Ti como referencia de entrenamiento e inferencia.
- Cabe en GPU de consumo: sí, en todas las gamas mencionadas; también es viable en CPU para inferencia puntual.
- Opciones de despliegue: el checkpoint se carga con PyTorch mediante el código del repositorio `github.com/hliuson/ultraviolet`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y el formato `model.pt` no es directamente compatible con ellas sin conversión.
- Latencia y throughput: superior a 200.000 tokens/s en contextos de menos de 1.000 tokens en una RTX 2080 Ti, según el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ultraviolet-50m-base-alpha | 50,8 M | 4096 | Apache 2.0 | Hugging Face + GitHub | Optimizado para velocidad y RL en GPU de consumo |
| Limite 1B Violetto (Paradigma) | 1.000 M (aproximado) | no disponible | no disponible | Hugging Face | Modelo del que deriva la arquitectura de UV-50M |
| ultraviolet-50m-mid-alpha | 50,8 M (misma familia) | no disponible | Apache 2.0 (presumiblemente) | Hugging Face | Variante ajustada para resolución de problemas por prompt |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Este checkpoint es el modelo base: no está ajustado para resolución de problemas por prompt; el autor remite a `ultraviolet-50m-mid-alpha` para ese uso.
- Entrenado principalmente sobre texto matemático: su competencia fuera del dominio matemático es previsiblemente muy limitada y no se declaran idiomas soportados.
- Riesgo de alucinación: al ser un modelo de 50,8 M de parámetros, la fiabilidad de sus respuestas es baja y requiere verificación humana, especialmente en problemas matemáticos.
- Ventana de contexto de 4096 tokens: suficiente para problemas cortos, pero insuficiente para documentos largos o conversaciones multi-turno extensas.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no está diseñado ni validado para producción.
- No se documentan sesgos conocidos ni procesos de alineación o filtrado de seguridad; no se recomienda su uso en aplicaciones orientadas a usuarios finales.
- El formato de pesos `model.pt` requiere el código del repositorio para cargarse y no es directamente compatible con herramientas de serving estándar.

## Enlaces

- Hugging Face: https://huggingface.co/harribo11/ultraviolet-50m-base-alpha
- Variante ajustada: https://huggingface.co/harribo11/ultraviolet-50m-mid-alpha
- Código del modelo: https://github.com/hliuson/ultraviolet
- Modelo de referencia (Limite 1B Violetto): https://huggingface.co/paradigma-inc/limite-1b-violetto

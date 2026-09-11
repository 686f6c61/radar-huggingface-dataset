# Jeesup/svd-safety-l2_remove40_swapdisciter_b010

## Resumen

Este repositorio contiene un checkpoint experimental de Llama-2-7b-chat comprimido mediante SVD-LLM, al que se le han eliminado el 40,02 % de los parámetros densos y posteriormente se le ha restaurado un 1,000 % de componentes SVD (6.661 componentes restaurados y 6.661 sustituidos) siguiendo la regla de selección `disc_iter`. El resultado es una fracción de parámetros densos de 0,5998 respecto del modelo original. Lo publica el usuario Jeesup como artefacto de investigación, no como modelo conversacional de propósito general.

El interés del checkpoint es metodológico: forma parte de una rejilla de experimentos que mide cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué reglas de selección de componentes recuperan mejor ese comportamiento con un presupuesto mínimo de parámetros restaurados. La model card reporta métricas de seguridad (AdvBench ASR 0,0096 y StrongREJECT ASR 0,0319 con juez HarmBench), de sobre-rechazo (0,4120 macro con WildGuard) y de calidad de lenguaje (perplejidad WikiText-2 de 11,7124).

Se apoya en la arquitectura de Llama-2-7b-chat: transformer decoder-only con normalización RMSNorm, embeddings rotatorios (RoPE) y tokenizador SentencePiece de 32.000 entradas, con una ventana de contexto de 4.096 tokens heredada del modelo base. El repositorio tiene 13,5 GB y pesos en safetensors, y en el momento de redactar esta ficha acumula 0 descargas y 0 likes, por lo que no cuenta con validación externa de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-2) con compresión SVD-LLM aplicada sobre las matrices de pesos |
| Parámetros totales | 6.738.415.616 según el recuento de safetensors; la model card indica una fracción de parámetros densos resultante de 0,5998 tras eliminar el 40,02 % |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens (heredada del modelo base; no se especifica en la model card) |
| Tipos de cuantización | no disponibles; el repositorio solo publica pesos en safetensors (13,5 GB) |
| Idiomas soportados | no disponible en la model card; el modelo base está entrenado principalmente en inglés |
| Licencia | Llama 2 Community License (se incluyen `LICENSE.txt` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (librería `transformers`) |

Datos de procedencia declarados en la model card: modelo base `meta-llama/Llama-2-7b-chat-hf`, compresión SVD-LLM con 40,02 % de parámetros eliminados, regla de selección `disc_iter`, presupuesto de restauración del 1,000 % de parámetros densos, 6.661 componentes restaurados, 6.661 componentes sustituidos, fracción de parámetros resultante 0,5998 y semilla 42.

## Arquitectura y entrenamiento

La arquitectura de partida es la de Llama-2-7b-chat: un transformer decoder-only prenorm con RMSNorm, atención causal con RoPE, 32 capas y atención multi-cabeza sin GQA (el uso de GQA en Llama 2 se reserva a los tamaños 13B y 70B). No hay entrenamiento desde cero ni fine-tuning adicional documentado en la model card: la intervención consiste en una compresión por descomposición en valores singulares (SVD-LLM) que trunca el 40,02 % de los parámetros densos y en una posterior restauración selectiva de componentes singulares hasta consumir un presupuesto del 1,000 % de los parámetros densos, empleando la regla `disc_iter`.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento adicional sobre este checkpoint. Tampoco se detalla si la compresión se materializa como factorización de bajo rango de las matrices o como enmascaramiento de componentes, ni cómo se refleja eso en las formas tensoriales del safetensors publicado. La innovación técnica que explora el artefacto es la propia metodología de selección de componentes: comparar reglas de restauración bajo un presupuesto fijo de parámetros para medir su efecto sobre el comportamiento de rechazo y sobre la utilidad del modelo.

## Capacidades

- Generación de texto conversacional: conserva la interfaz de chat del modelo base, aunque la model card advierte explícitamente de que no debe tratarse como un asistente desplegable.
- Rechazo de peticiones dañinas: con la regla `disc_iter` y el presupuesto de restauración del 1 %, el checkpoint mantiene una tasa de éxito de ataque (ASR) baja en AdvBench (0,0096) y StrongREJECT (0,0319) según el juez HarmBench.
- Calidad de modelado de lenguaje: perplejidad de 11,7124 en WikiText-2, métrica de utilidad incluidas en la model card.
- Comportamiento de sobre-rechazo medible: 0,4120 de macro over-refusal según WildGuard, lo que permite estudiar el equilibrio entre seguridad y disponibilidad.
- Compatibilidad con el ecosistema transformers: pipeline `text-generation`, etiquetas `text-generation-inference` y `endpoints_compatible`.
- Uso como sujeto experimental: sirve para reproducir un brazo concreto de una rejilla de reglas de selección y presupuestos, con semilla fija (42).
- Capacidades no verificadas: no hay datos publicados sobre tool calling, function calling, uso agéntico, razonamiento multi-paso, matemáticas, código, visión ni audio en este checkpoint.
- Multilingüismo: no evaluado en la información disponible; el modelo base está orientado principalmente al inglés.

## Casos de uso

- Investigación en seguridad de modelos comprimidos: medir el ASR en AdvBench y StrongREJECT antes y después de la compresión para cuantificar cuánto degrada la seguridad una eliminación del 40,02 % de parámetros densos, usando el juez HarmBench con protocolo homogéneo.
- Comparación de reglas de selección de componentes: este checkpoint es una celda concreta de una rejilla; colocarlo junto a los demás brazos (mismo presupuesto, distintas reglas o distintos presupuestos) permite aislar el efecto de la regla `disc_iter` frente a alternativas.
- Estudio del trade-off seguridad-utilidad: combinando el ASR con la perplejidad de WikiText-2 y el macro over-refusal de WildGuard se puede trazar una frontera de Pareto entre rechazo correcto, rechazo excesivo y calidad de lenguaje.
- Análisis de interpretabilidad de subespacios: al trabajar sobre componentes SVD identificables, un investigador puede examinar qué direcciones singulares concretas están asociadas a comportamientos de rechazo y cuáles a capacidad general.
- Reproducción de experimentos: la semilla 42 y los recuentos exactos (6.661 componentes restaurados y 6.661 sustituidos) permiten replicar el pipeline de compresión y verificar si se obtienen las mismas métricas.
- Validación de herramientas de evaluación: el checkpoint es útil como entrada controlada para probar clasificadores de seguridad (HarmBench, WildGuard) con un ASR conocido y comprobar su sensibilidad.
- Punto de partida para técnicas de reparación: sobre esta base comprimida se pueden probar fine-tuning de seguridad, DPO o edición de pesos para recuperar comportamiento alineado sin volver a los 6.738 millones de parámetros densos.
- Docencia y divulgación sobre compresión de LLM: ejemplifica de forma medible que comprimir un modelo alineado no es neutral respecto a su comportamiento de seguridad.

## Benchmarks y rendimiento

| Métrica | Resultado | Método de evaluación |
|---|---|---|
| AdvBench ASR | 0,0096 | Juez HarmBench |
| StrongREJECT ASR | 0,0319 | Juez HarmBench |
| Macro over-refusal | 0,4120 | WildGuard |
| WikiText-2 perplexity | 11,7124 | Perplejidad de lenguaje |

No se han publicado resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K, MT-Bench u otros) en la información disponible. Tampoco se incluye la perplejidad ni el ASR del modelo base sin comprimir, por lo que no es posible calcular la degradación relativa a partir de los datos de la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: en precisión de 16 bits los pesos ocupan alrededor de 13,5 GB, según el tamaño del repositorio; con caché KV para 4.096 tokens conviene reservar del orden de 15-16 GB. Estas cifras son estimaciones de cálculo, no medidas publicadas por el autor.
- GPU recomendadas: A100 40 GB, A100 80 GB, H100, L40S 48 GB y cualquier GPU con 24 GB o más para inferencia cómoda en fp16.
- GPU de consumo: cabe en RTX 3090 y RTX 4090 (24 GB) en fp16 con margen razonable. En tarjetas de 16 GB o menos es necesario cuantizar (8 bits o 4 bits) o reducir la longitud de contexto.
- CPU: la inferencia es viable con llama.cpp u Ollama sobre CPU, pero con latencias muy superiores; no hay cifras publicadas.
- Opciones de despliegue: `transformers` (librería declarada), Text Generation Inference (la etiqueta `text-generation-inference` está presente en el repositorio), vLLM, y conversión a GGUF para llama.cpp u Ollama. El repositorio no publica variantes GGUF ni cuantizaciones oficiales.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Datos de rendimiento |
|---|---|---|---|---|
| svd-safety-l2_remove40_swapdisciter_b010 (este checkpoint) | 6.738.415.616 en safetensors; fracción densa declarada 0,5998 | 4.096 tokens (heredado del base) | Llama 2 Community License | AdvBench ASR 0,0096; StrongREJECT ASR 0,0319; over-refusal 0,4120; WikiText-2 ppl 11,7124 |
| meta-llama/Llama-2-7b-chat-hf (modelo base sin comprimir) | 6.738.415.616 | 4.096 tokens | Llama 2 Community License | no disponible en la información proporcionada para una comparación directa |
| Otros brazos de la rejilla del mismo autor (Jeesup) | no disponible | no disponible | Llama 2 Community License (presumiblemente, no confirmado) | no disponible |
| Alternativas de la misma categoría (por ejemplo, Llama-3.1-8B-Instruct o Mistral-7B-Instruct-v0.3) | del orden de 7-8 mil millones, según catálogo público | 128.000 y 32.000 tokens respectivamente, según catálogo público | Llama 3.1 Community License y Apache 2.0 respectivamente | no comparable: este checkpoint no tiene benchmarks de capacidad general publicados |

La comparación de rendimiento con alternativas no es posible con los datos disponibles: las únicas métricas publicadas para este checkpoint son de seguridad y perplejidad, no de capacidad (razonamiento, código, matemáticas o seguimiento de instrucciones).

## Limitaciones y advertencias

- No es un modelo desplegable: la propia model card lo describe como artefacto de investigación y advierte de que cada celda de la rejilla debe tratarse como sujeto experimental, no como asistente.
- Degradación deliberada de seguridad en la rejilla: el autor indica que varios brazos del estudio están intencionadamente degradados en seguridad respecto a Llama-2-7b-chat, porque la compresión por sí sola eleva la tasa de éxito de ataque.
- Sobre-rechazo elevado: el macro over-refusal de 0,4120 implica que una fracción considerable de peticiones benignas podría ser rechazada, lo que lo hace inadecuado como asistente de uso real.
- Ausencia de benchmarks de capacidad: no hay MMLU, HumanEval, GSM8K ni evaluaciones de instrucciones, por lo que se desconoce el alcance real del daño en utilidad general causado por la compresión.
- Sin línea base publicada: no se incluye el ASR ni la perplejidad del modelo sin comprimir, lo que impide calcular la degradación relativa con los datos de la model card.
- Sesgos heredados: al derivar de Llama-2-7b-chat, arrastra los sesgos conocidos de ese modelo; no se documenta ninguna mitigación adicional.
- Riesgo de alucinación: no evaluado en la información disponible; se mantiene el riesgo propio del modelo base, potencialmente agravado por la compresión (perplejidad de 11,7124 en WikiText-2).
- Limitación de contexto: 4.096 tokens, insuficiente para casos de uso que requieran documentos largos o conversaciones muy extensas.
- Idiomas: no se documenta soporte multilingüe ni evaluación fuera del inglés.
- Restricciones de licencia: Llama 2 Community License, con `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio; cualquier uso derivado queda sujeto a ambas. El modelo se distribuye bajo el requisito de atribución «Built with Llama 2» y con las restricciones de uso comercial y de finalidad que impone dicha política.
- Sin validación externa: 0 descargas y 0 likes en el momento de redactar esta ficha, sin evidencia de uso independiente ni replicación por terceros.
- Compatibilidad limitada documentada: aunque el repositorio declara `endpoints_compatible` y etiquetas de `text-generation-inference`, no se aportan configuraciones probadas de vLLM, TGI o llama.cpp.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove40_swapdisciter_b010
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Ficheros de licencia y política de uso incluidos en el repositorio: `LICENSE.txt` y `USE_POLICY.md` (accesibles desde la pestaña de archivos del repositorio del modelo).
- Metodología SVD-LLM: mencionada por nombre en la model card, pero no se proporciona enlace al artículo en la información disponible.
- Búsqueda web: los resultados devueltos no guardan relación con este modelo (páginas corporativas de Microsoft), por lo que no se han podido recoger enlaces adicionales a artículos, repositorios o demos desde esa vía.

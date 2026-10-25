# CastIronMind/LissaBrat-Instruct-GGUF

## Resumen

LissaBrat-Instruct-GGUF es la distribución en formato GGUF del modelo LissaBrat-Instruct, un modelo de lenguaje de 102.761.472 parámetros (≈103M) entrenado desde cero por CastIronMind. Se trata del "hermano mediano" de la familia Lissa y está construido sobre una arquitectura tipo Llama con una ventana de contexto de solo 1024 tokens y un vocabulario de 16.384 entradas. El modelo se entrenó primero sobre prosa del fandom de My Little Pony y después recibió un ajuste supervisado sobre diálogo de roleplay, de ahí su orientación explícita a la interpretación de personajes.

El repositorio no contiene los pesos originales, sino 15 cuantizaciones GGUF generadas con llama.cpp a partir de los pesos base en bf16, con tamaños que van de 72,1 MB (IQ2_XS) a 124,7 MB (Q8_0). El autor publica además la perplejidad medida con `llama-perplexity` sobre un texto de referencia en inglés de 300 tokens, lo que permite elegir el nivel de cuantización con un criterio cuantitativo en lugar de por intuición. Es un caso poco habitual de model card que documenta el coste en calidad de cada quant.

Su relevancia es acotada pero clara: ocupa el nicho de modelos de personaje ultraligeros que caben en cualquier portátil, se ejecutan en CPU sin GPU y sirven como banco de pruebas para experimentos de consistencia de persona, cuantización agresiva y despliegue en el borde. No es un modelo de propósito general ni compite en razonamiento, código o matemáticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (según model card), entrenado desde cero |
| Parametros totales | 102.761.472 (≈103M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, IQ4_XS (imatrix), IQ3_M, IQ3_XS, Q2_K, IQ2_M, IQ2_XS |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); pesos base en bf16 |
| Vocabulario | 16.384 tokens |
| Tokens especiales | 0 `<pad>`, 1 `<eos>`, 2 `<system>`, 3 `<user>`, 4 `<assistant>` |
| Tamano del repositorio | 1,4 GB (15 ficheros GGUF) |
| Cuantizacion mas pequena / mayor | 72,1 MB (IQ2_XS) / 124,7 MB (Q8_0) |

## Arquitectura y entrenamiento

La model card describe una arquitectura Llama estándar con 103M de parámetros y un vocabulario deliberadamente pequeño de 16.384 tokens, lo que reduce el tamaño de la matriz de embedding y acelera la decodificación en CPU. El contexto máximo es de 1024 tokens, coherente con el caso de uso previsto (turnos de diálogo de personaje, no documentos largos). No se detallan en la información disponible el número de capas, la dimensión oculta ni el número de cabezas de atención.

El entrenamiento tiene dos fases: una primera de preentrenamiento desde cero sobre prosa del fandom de My Little Pony, y una segunda de ajuste supervisado sobre diálogo de roleplay con un formato de prompt fijo. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO; la información disponible solo menciona "supervised fine-tuning" sobre roleplay. La innovación técnica destacable no está en la arquitectura sino en el proceso de cuantización: el autor generó una importance matrix con `llama-imatrix` sobre el corpus de SFT (400 muestras, 100 chunks) para construir las variantes IQ, y descartó explícitamente los tipos que salieron rotos (Q2_0, TQ2_0, Q1_0) en lugar de publicarlos.

Un detalle crítico de implementación: el modelo se entrenó **sin** token BOS y su `bos_token` es `<eos>`. Alimentar un BOS degrada gravemente la salida (el modelo produce tablas de markup en lugar de diálogo). Los ficheros publicados ya incluyen `tokenizer.ggml.add_bos_token = false`, por lo que llama.cpp, Ollama y LM Studio funcionan correctamente sin configuración adicional, pero cualquier recuantización debe preservar ese flag.

## Capacidades

- Generación de texto en inglés con foco en diálogo de personaje y roleplay multi-turno.
- Mantenimiento de persona consistente cuando se le proporciona un mensaje de sistema no vacío con la descripción del personaje.
- Reproducción de formato estructurado de conversación mediante los tokens especiales `<system>`, `<user>`, `<assistant>` y `<eos>`.
- Generación de texto temático del fandom de My Little Pony, tanto en registro narrativo como conversacional.
- Capacidad de servir como base para fine-tuning posterior de otros personajes.
- No hay evidencia de soporte de tool calling ni function calling en la información disponible.
- No hay evidencia de razonamiento multi-paso, agentes, matemáticas, código o visión.
- Capacidad multilingüe: no disponible (entrenado y evaluado solo en inglés).

## Casos de uso

- **PNJ en videojuegos indie y prototipos**: con 90 MB en Q4_K_M y 1024 tokens de contexto, el modelo se puede embeber en el propio binario del juego o ejecutar en un hilo de CPU para dar diálogo reactivo a personajes secundarios sin depender de una API externa.
- **Demostraciones de personaje en el navegador**: el autor publica un Space (Lissa Playground) que compara cuantizaciones lado a lado sin servidor; el modelo es lo bastante pequeño para compilarse a WebAssembly con llama.cpp y correr en cliente.
- **Evaluación de consistencia de persona en modelos pequeños**: sirve como sujeto de estudio para medir cómo degrada la cuantización (Q8_0 a IQ2_XS) la coherencia de un personaje a lo largo de varios turnos, con la tabla de perplejidad del autor como referencia.
- **Base para fine-tuning de personajes**: los 103M de parámetros permiten reentrenar o aplicar LoRA sobre el modelo completo en una única GPU de consumo en tiempos razonables, partiendo de una base que ya sabe sostener diálogo.
- **Asistentes conversacionales offline en hardware mínimo**: un portátil sin GPU, una Raspberry Pi o un dispositivo empotrado pueden servir respuestas con el fichero Q4_K_M usando Ollama o llama.cpp, útil en entornos sin conectividad.
- **Prototipado de pipelines de roleplay antes de escalar**: permite validar el formato de prompt, la lógica de gestión de historial y la integración con un wrapper de chat antes de migrar a un modelo mayor, con coste de inferencia prácticamente nulo.
- **Docencia y experimentación con cuantización**: el repositorio es un ejemplo didáctico de cómo medir perplejidad por quant, construir una importance matrix y detectar tipos de cuantización inviables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor solo reporta perplejidad (`llama-perplexity`) sobre el mismo texto de referencia en inglés de 300 tokens para cada fichero y para el original en bf16 (3,528):

| Fichero | Tamano | PPL | Delta vs bf16 | Veredicto del autor |
|---|---:|---:|---:|---|
| Q8_0 | 124,7 MB | 3,527 | 0,0% | reference |
| Q5_K_S | 98,1 MB | 3,458 | -2,0% | good |
| Q4_K_M | 90,6 MB | 3,469 | -1,7% | recommended |
| Q6_K | 106,1 MB | 3,571 | +1,2% | good |
| Q5_K_M | 98,2 MB | 3,556 | +0,8% | good |
| Q4_K_S | 90,6 MB | 3,540 | +0,3% | good |
| Q3_K_L | 84,8 MB | 3,544 | +0,5% | at your own risk |
| Q3_K_M | 83,7 MB | 3,568 | +1,1% | at your own risk |
| IQ4_XS | 88,8 MB | 3,608 | +2,3% | recommended (imatrix) |
| Q3_K_S | 82,5 MB | 3,724 | +5,6% | quality not guaranteed |
| IQ3_XS | 80,7 MB | 3,781 | +7,2% | quality not guaranteed |
| IQ3_M | 83,6 MB | 3,875 | +9,8% | quality not guaranteed |
| Q2_K | 77,3 MB | 3,844 | +9,0% | quality not guaranteed |
| IQ2_XS | 72,1 MB | 3,862 | +9,5% | quality not guaranteed |
| IQ2_M | 74,8 MB | 3,890 | +10,3% | quality not guaranteed |

Precaución al leer la tabla: las variantes Q5_K_S y Q4_K_M presentan una perplejidad *inferior* a la del bf16, lo que en un texto de evaluación de solo 300 tokens es ruido de medida más que una mejora real. El propio autor lo reconoce al calificar Q4_K_M como "dentro del ruido". No se publican latencias ni throughput.

## Requisitos de hardware

- **VRAM/RAM estimada**: los pesos van de 72 MB a 125 MB; con la caché KV de 1024 tokens y el overhead del runtime, la inferencia completa cabe holgadamente por debajo de 1 GB de memoria. Estimación propia a partir del tamaño de los ficheros.
- **GPU**: no se requiere GPU. El modelo está pensado para CPU y despliegue en el borde (tags `edge-deployment`, `small-language-model`).
- **GPU de consumo**: cualquier GPU con más de 1 GB de VRAM puede alojarlo; no tiene sentido dedicarle una RTX 4090 o una A100 salvo por motivos de agregación de muchas instancias.
- **Placas y SBC**: viable en Raspberry Pi y dispositivos similares por tamaño de pesos; el autor no publica cifras de tokens por segundo en estas plataformas.
- **Opciones de despliegue**: llama.cpp (el ejemplo de la model card usa `llama-simple`), Ollama (con un Modelfile `FROM ./LissaBrat-Instruct-GGUF-Q4_K_M.gguf`) y LM Studio, que respetan el flag `add_bos_token = false`. Para el Space de demostración se usa una compilación a navegador, presumiblemente llama.cpp WASM. No hay confirmación de soporte en vLLM o TGI.
- **Latencia y throughput**: no disponibles. Dado el tamaño, en CPU moderna se espera una velocidad interactiva, pero no hay cifras publicadas.
- **Ajustes de muestreo recomendados**: `temp 0.8`, `top_p 0.9`, `repetition_penalty 1.1`.

## Comparativa con modelos similares

Comparación con alternativas de tamaño comparable o del mismo nicho (datos de sus model cards públicas; verificar antes de usar en producción):

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---:|---|---|---|---|
| LissaBrat-Instruct-GGUF | 103M | 1024 | en | Apache 2.0 | Personaje / roleplay de fandom |
| SmolLM-135M (HuggingFaceTB) | 135M | 2048 | en (multilingüe parcial) | Apache 2.0 | Modelo general pequeño |
| Qwen2.5-0.5B-Instruct | 494M | 32.768 | multilingüe | Apache 2.0 | Instrucciones generales, tool use |
| Llama-3.2-1B-Instruct | 1.240M | 131.072 | multilingüe | Llama 3.2 Community License | Instrucciones generales, contexto largo |

LissaBrat es de 3 a 12 veces más pequeño que las alternativas generalistas, pero su ventana de contexto es entre 2 y 128 veces menor y no cubre razonamiento, código ni tool calling. Su ventaja competitiva es el tamaño (90 MB frente a cientos de MB o varios GB), la licencia Apache 2.0 sin restricciones adicionales y una especialización muy concreta en diálogo de personaje que los modelos generalistas de ese tamaño no ofrecen de serie. A cambio, la comparación de rendimiento no puede hacerse con benchmarks estándar: no hay datos publicados para este modelo.

## Limitaciones y advertencias

- **Contexto muy corto**: 1024 tokens. Un historial de conversación largo consume la ventana en pocos turnos; hay que truncar o resumir el historial de forma explícita.
- **Solo inglés**: no se ha entrenado ni evaluado en castellano; el rendimiento fuera del inglés no está caracterizado y previsiblemente será deficiente.
- **Riesgo alto de alucinación y pérdida de coherencia**: con 103M de parámetros y un corpus de preentrenamiento limitado a prosa de un fandom, no hay conocimiento factual fiable. No debe usarse para responder preguntas de dominio general.
- **Cuantizaciones por debajo de Q4 sin garantías**: el propio autor advierte que Q3 e IQ3 conservan el tema y el formato pero pierden voz y coherencia, y que Q2/IQ2 son experimentos de tamaño. Para cualquier uso serio, Q4_K_M o superior.
- **Sensibilidad al token BOS**: alimentar un BOS degrada la salida a tablas de markup. Cualquier recuantización o wrapper propio debe mantener `add_bos_token = false`.
- **Formato de prompt obligatorio y sistema no vacío**: `<system>{persona}<user>{message}<assistant>{reply}<eos>`, sin espacios entre etiquetas. Los wrappers de chat que inyectan su propia plantilla rompen el comportamiento; el autor recomienda la ruta de completion en lugar de la de chat.
- **Propiedad intelectual del contenido**: la licencia Apache 2.0 cubre los pesos, pero el modelo se entrenó sobre prosa del fandom de My Little Pony, marca registrada de Hasbro. La licencia del modelo no otorga derechos sobre personajes, nombres ni universos de ficción; el uso comercial de personajes derivados es una cuestión legal independiente que conviene revisar.
- **Contenido sin filtrado documentado**: es un modelo de roleplay de personaje sin garantías de moderación; no se documentan salvaguardas frente a contenido inapropiado. No apto para productos dirigidos a menores sin una capa de filtrado propia.
- **Sin benchmarks estándar**: no hay MMLU, HumanEval ni GSM8K. La única métrica es perplejidad sobre 300 tokens de texto, insuficiente para estimar capacidad general.
- **Cero tracción**: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/CastIronMind/LissaBrat-Instruct-GGUF
- Modelo base (pesos bf16): https://huggingface.co/CastIronMind/LissaBrat-Instruct
- Demo interactiva (Lissa Playground): https://huggingface.co/spaces/CastIronMind/Lissa-Playground
- No se han encontrado en la búsqueda web enlaces adicionales relevantes (papers, blogs o repos) sobre este modelo.

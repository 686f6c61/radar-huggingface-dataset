# blazkepa/Qwen3.8-Flash-Next-norev-oQ4e-MTP

## Resumen

Qwen3.8-Flash-Next-norev-oQ4e-MTP es una edición de pesos del modelo Qwen3.8-Flash-Next, publicada por el usuario blazkepa. No se trata de un entrenamiento nuevo ni de un fine-tuning convencional, sino de una modificación directa de las matrices de pesos del modelo base `GBP-DE/Qwen3.8-Flash-Next-oQ4e-WLSRefit-MTP` para eliminar una dirección de "autorrevisión" del flujo residual. El objetivo declarado es reducir el comportamiento del modelo en modo no-thinking consistente en resolver una tarea, escribir "Wait, let me reconsider…" y reiniciar el razonamiento, a veces varias veces, hasta agotar el presupuesto de tokens.

El modelo conserva la arquitectura completa del original: 48 capas (36 Gated DeltaNet y 12 Qwen Sparse Attention), 512 expertos por capa con 10 activos por token más un experto compartido, y una ventana de contexto nativa de 262 144 tokens. Los 179 999 981 459 parámetros totales incluyen una tabla de embeddings n-gram de 51 000 millones de parámetros que se mapea desde SSD en memoria. La edición afecta a 149 matrices de pesos y a la cabeza MTP (multi-token prediction) usada para decodificación especulativa.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de edición de pesos sin entrenamiento aplicada a un modelo MoE de gran tamaño; por otro, sirve como ejemplo de distribución de un modelo de 180 000 millones de parámetros en formato MLX cuantizado a 4 y 6 bits, ejecutable en Apple Silicon de 128 GB. La licencia es la Qwen Community License 1.0, con las restricciones que ello implica para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8-Flash-Next (`qwen4_exp`): transformer híbrido con 48 capas (36 Gated DeltaNet + 12 Qwen Sparse Attention), 4 ramas residuales con hyper-connections, embeddings n-gram PLE, torre de visión |
| Parametros totales | 179 999 981 459 (incluye tabla n-gram de 51 000 millones) |
| Parametros activos | 10 expertos enrutados por token + 1 experto compartido, sobre 512 expertos por capa |
| Longitud de contexto | 262 144 tokens nativos |
| Tipos de cuantizacion | oQ4e afín: expertos enrutados 4-bit g64 (gate/up) y 6-bit g64 (down_proj); atención, Gated DeltaNet, embeddings, LM head y hyper-connections 8-bit g64; experto compartido 8-bit g128; tabla n-gram 4-bit g32 |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | safetensors (21 shards), librería mlx |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen3.8-Flash-Next original: un transformer híbrido que combina 36 capas de Gated DeltaNet (atención lineal con estado recurrente) y 12 capas de Qwen Sparse Attention, con atención completa en la configuración. Incorpora cuatro ramas residuales mediante hyper-connections, una torre de visión y embeddings n-gram PLE (una tabla de 51 000 millones de parámetros que se mapea desde disco). El modelo es MoE con 512 expertos por capa, de los cuales se activan 10 por token más un experto compartido, sin poda alguna.

No hay entrenamiento nuevo en esta publicación. La modificación consiste en editar 149 matrices de pesos mediante la proyección `W' = W − 0.5·U(UᵀW)` sobre 6 direcciones de "autorrevisión" identificadas en el flujo residual, aplicada a media intensidad. Además, el `down_proj` de los expertos se recuantiza de 4 a 6 bits (lo que añade unos 10 GB al modelo) y la cabeza MTP se edita del mismo modo que el backbone. El resto de tensores se copian tal cual del build de GBP-DE. No se documentan datos de entrenamiento, RLHF ni DPO porque no los hay: es una edición post-hoc de pesos.

## Capacidades

- Generación de texto y conversación multi-turno en inglés.
- Razonamiento y resolución de problemas con modo thinking y modo no-thinking.
- Generación de código, evaluada por el autor con LiveCodeBench.
- Matemáticas y conocimiento general (GSM8K, MMLU mencionados como estables dentro del ruido).
- Decodificación especulativa mediante cabeza MTP integrada, funcional en oMLX.
- Capacidad de visión presente en la torre, aunque el autor indica que no la ha probado.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Asistencia a la programación en local sobre Apple Silicon: el modelo se ejecuta en oMLX con una API compatible con OpenAI en `http://localhost:8000/v1`, lo que permite integrarlo en editores y asistentes de código sin salir del equipo. La reducción del 40 % en casos que agotan el límite de tokens y la mediana de 2 935 tokens frente a 3 863 del base lo hacen más adecuado para tareas de código con presupuesto acotado.
- Generación de código en pipelines con límite de tokens: al reducir la verbosidad y las reinicializaciones del razonamiento, encaja mejor en flujos donde cada respuesta tiene un tope fijo de tokens, como revisiones automáticas de parches o generación de tests.
- Prototipado e investigación en edición de pesos: el repositorio de GitHub del autor incluye el código, las direcciones medidas y los resultados por tarea, lo que lo convierte en material de referencia para estudiar intervenciones sobre el flujo residual en modelos MoE.
- Evaluación de decodificación especulativa en MLX: la cabeza MTP incluida y editada permite medir la aceptación de borradores y la velocidad de decodificación (96–107 tok/s en un M5 Max) en un entorno Apple Silicon.
- Experimentación con modelos de 180 000 millones de parámetros en hardware de consumo: con 86 GB residentes y la tabla n-gram mapeada desde SSD, es un caso práctico de despliegue de un MoE grande en un Mac de 128 GB.
- Benchmarking de tareas de código con presupuesto de tokens: el subconjunto fijo de 100 tareas de LiveCodeBench usado por el autor sirve como base reproducible para comparar variantes editadas del mismo modelo.

## Benchmarks y rendimiento

Los datos provienen exclusivamente de las mediciones del autor sobre un subconjunto fijo de 100 tareas de LiveCodeBench release_v6 (23 fáciles, 31 medias, 46 difíciles; concursos del 2025-02-15 al 2025-04-06), comparando contra el modelo base `GBP-DE/Qwen3.8-Flash-Next-oQ4e-WLSRefit-MTP` (revisión `8a284d64`). El autor advierte que las tareas son anteriores al modelo y podrían estar contaminadas, y que los resultados no son comparables con la model card oficial de Qwen.

Modo no-thinking, greedy, 8 192 tokens:

| Modelo | pass@1 | Difíciles | Agota límite de tokens | Tokens mediana | Tokens totales |
|---|---|---|---|---|---|
| Base | 51 | 8 / 46 | 38 | 3 863 | 445 k |
| Este modelo | 53 | 12 / 46 | 23 | 2 935 | 373 k |

Con muestreo (temperature 0.7 / top_p 0.8 / top_k 20, 3 muestras por modelo): base 50.7 de media (rango 46–54), este modelo 52.0 (rango 51–54), sign test p = 1.0. El autor concluye que la precisión es equivalente dentro del ruido y que el efecto real está en la longitud de las respuestas.

Modo thinking, mismas 100 tareas, temperature 0.6 / top_p 0.95 / top_k 20, 32 768 tokens, una ejecución por modelo: pass@1 de 69 frente a 63 del base. La información proporcionada se corta antes de completar la tabla de desglose por dificultad y tokens.

HumanEval, GSM8K, MMLU, aceptación de borradores MTP y velocidad de decodificación: el autor indica que se mantienen dentro del ruido, sin cifras concretas en la información disponible.

## Requisitos de hardware

- VRAM estimada: unos 86 GB residentes en oMLX sobre un Mac de 128 GB (oMLX lo muestra como 80 GiB); la tabla n-gram se mapea desde SSD. El modelo completo en disco ocupa 118 GB en 21 shards.
- GPU recomendadas: Apple Silicon con 128 GB de memoria unificada, probado en MacBook Pro M5 Max. No hay datos de despliegue en GPU NVIDIA (A100, H100, RTX 4090) en la información proporcionada.
- Cabe en GPU de consumo: no en el sentido habitual; requiere un Mac con 128 GB de memoria unificada. En una RTX 4090 (24 GB) no cabe ni cuantizado a 4 bits.
- Opciones de despliegue: oMLX 0.7.4.dev1 (app de macOS o instalación vía Homebrew) y mlx_vlm 0.7.11 o superior con la vista de PLE externa (`prepare_external_ple_model` de `mlx_vlm.models.qwen4_exp.ple_storage`). vLLM, llama.cpp, Ollama y TGI no están documentados para este formato.
- Latencia y throughput: 96–107 tok/s en decodificación con MTP activado y una sola secuencia, en caliente, sobre M5 Max. La primera pasada tras la carga baja a 74–82 tok/s por el paginado de la tabla n-gram. oMLX registra el aviso `PLE forced to SSD ... roughly 2.5x slower than a resident load`, aunque el autor no observó esa ralentización una vez caliente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| Este modelo (norev oQ4e MTP) | 180 000 M totales, 10+1 expertos activos | 262 144 | qwen-community-1.0 | safetensors MLX, oMLX / mlx_vlm | Edición de pesos para reducir autorrevisión; 118 GB en disco, ~86 GB residentes |
| GBP-DE/Qwen3.8-Flash-Next-oQ4e-WLSRefit-MTP (base) | 180 000 M totales | 262 144 | qwen-community-1.0 | safetensors MLX | Sin edición; 108 GB aproximados (10 GB menos); pass@1 51 en el subconjunto del autor |
| Qwen3.8-Flash-Next (original) | 180 000 M totales | 262 144 | qwen-community-1.0 | no disponible en la información | Referencia oficial; sin datos de benchmark comparables en la información proporcionada |

No se dispone de datos de otros modelos de la misma categoría (mismo tamaño o misma tarea) en la información proporcionada.

## Limitaciones y advertencias

- La edición de pesos es una intervención heurística sin entrenamiento; el autor reconoce que los resultados de precisión están dentro del ruido estadístico (sign test p = 0.75 en greedy y p = 1.0 con muestreo).
- El subconjunto de evaluación es de 100 tareas de LiveCodeBench posiblemente contaminadas, con una sola ejecución en modo thinking, por lo que las cifras no deben extrapolarse.
- El modelo solo declara soporte de inglés; no hay evidencia de rendimiento en castellano ni en otros idiomas.
- La torre de visión está intacta pero no ha sido probada por el autor.
- No hay información sobre tool calling, function calling ni comportamiento agéntico; no se debe asumir su funcionamiento en producción.
- La licencia Qwen Community License 1.0 impone restricciones para uso comercial; conviene revisar el texto completo antes de desplegar.
- El modelo requiere hardware Apple Silicon con 128 GB de memoria unificada y la tabla n-gram se mantiene en SSD, lo que puede afectar a la latencia en el primer uso tras la carga.
- Riesgo de alucinación: no evaluado específicamente en la información proporcionada; es un modelo de lenguaje generativo sin garantías de veracidad.
- Sesgos conocidos: no documentados en la información proporcionada.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica una validación comunitaria muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/blazkepa/Qwen3.8-Flash-Next-norev-oQ4e-MTP
- Modelo base: https://huggingface.co/GBP-DE/Qwen3.8-Flash-Next-oQ4e-WLSRefit-MTP
- Repositorio con código y resultados: https://github.com/blazkepa/flash-next-norev
- oMLX: https://github.com/jundot/omlx
- Licencia Qwen Community 1.0: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE

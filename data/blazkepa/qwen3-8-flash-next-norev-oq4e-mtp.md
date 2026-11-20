# blazkepa/Qwen3.8-Flash-Next-norev-oQ4e-MTP

## Resumen

Qwen3.8-Flash-Next-norev-oQ4e-MTP es una edición de pesos del modelo Qwen3.8-Flash-Next, publicada por el usuario blazkepa sobre una build previa de GBP-DE. Se trata de un transformer híbrido de tipo MoE con 180 000 millones de parámetros totales, 48 capas (36 Gated DeltaNet y 12 de atención dispersa de Qwen), 512 expertos por capa con 10 activos por token más un experto compartido, y una ventana de contexto nativa de 262 144 tokens. El autor lo distribuye cuantizado en formato oQ4e (afín, 4 y 6 bits según el tensor) para ejecutarse con MLX en Apple Silicon.

La modificación respecto al modelo base es una edición de pesos sin entrenamiento: se elimina un subespacio de 6 dimensiones asociado a la "autorrevisión" del modelo (la tendencia a escribir "espera, déjame reconsiderar" y reiniciar la respuesta) aplicando `W' = W − 0.5·U(UᵀW)` sobre 149 matrices. Según el autor, esto reduce un 40 % los casos en los que la respuesta agota el límite de tokens en su benchmark de código, acorta la respuesta típica alrededor de un cuarto y no degrada la precisión medida.

Es relevante ahora porque aborda un problema práctico y poco tratado en modelos de razonamiento: la verbosidad por bucles de autocorrección que consumen presupuesto de contexto y encarecen la inferencia. Además, incluye la cabeza MTP (multi-token prediction) para decodificación especulativa, lo que permite velocidades de decodificación de 96 a 107 tok/s en un MacBook Pro M5 Max de 128 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3.8-Flash-Next (`qwen4_exp`): híbrida, 48 capas (36 Gated DeltaNet + 12 Qwen Sparse Attention), 4 ramas residuales con hyper-connections, embeddings PLE de n-gramas, torre de visión |
| Parámetros totales | 179 999 981 459 (incluye tabla de n-gramas de 51 000 millones) |
| Parámetros activos | 10 expertos enrutados + 1 compartido por token, sobre 512 expertos por capa (no se indica el total de parámetros activos) |
| Longitud de contexto | 262 144 tokens nativos |
| Tipos de cuantización | oQ4e afín: expertos enrutados 4 bits g64 (gate/up) y 6 bits g64 (`down_proj`); atención, Gated DeltaNet, embeddings, LM head y hyper-connections 8 bits g64; experto compartido 8 bits g128; tabla de n-gramas 4 bits g32 |
| Idiomas soportados | en (inglés) |
| Licencia | qwen-community-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors (21 shards, 118 GB), librería MLX |

## Arquitectura y entrenamiento

La arquitectura corresponde a Qwen3.8-Flash-Next, con 48 capas que combinan 36 capas de Gated DeltaNet (atención lineal con estado recurrente) y 12 capas de Qwen Sparse Attention marcadas como `full_attention` en la configuración. Incorpora cuatro ramas residuales mediante hyper-connections, una tabla de embeddings PLE de n-gramas de 51 000 millones de parámetros (mapeada desde SSD en memoria) y una torre de visión que esta edición no modifica ni evalúa. La dimensión oculta es 2560 y el vocabulario de 248 320 tokens.

No se documenta en la información disponible el proceso de entrenamiento original (número de tokens, composición del dataset, RLHF/DPO). La contribución de esta ficha es exclusivamente de edición de pesos: se aplica una proyección de rango 6 sobre el flujo residual en 149 matrices de pesos, a media intensidad, sin entrenamiento adicional. Los expertos enrutados de `down_proj` se recuantizan de 4 a 6 bits, lo que añade unos 10 GB al tamaño en disco. La cabeza MTP se incluye y se edita igual que el backbone, con expertos enrutados en 4 bits y `down_proj` en 6 bits, y funciona de serie en oMLX para decodificación especulativa.

## Capacidades

- Generación de texto y conversación multi-turno en inglés.
- Razonamiento con modo thinking y modo no-thinking, con parámetros de muestreo distintos recomendados para cada uno.
- Generación de código: el benchmark del autor se centra en tareas de LiveCodeBench.
- Decodificación especulativa mediante cabeza MTP integrada, compatible con oMLX.
- Capacidad de visión presente en la arquitectura (torre de visión intacta), aunque el autor indica que no la ha probado.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Asistencia a la programación en local: el modelo puede resolver tareas de código en un Mac con 128 GB de RAM unificada, con respuestas más cortas y menos truncamientos que el base, lo que reduce el coste por tarea en un flujo de trabajo diario de desarrollo.
- Generación de código en pipelines con presupuesto de tokens ajustado: al reducir un 40 % los casos que agotan el límite y un 21 % el total de tokens, encaja en entornos donde el coste por respuesta o la latencia importan, como revisiones automáticas o generación de tests.
- Inferencia privada en Apple Silicon: al ejecutarse con MLX y oMLX en un equipo de sobremesa o portátil de Apple, permite procesar código y documentación sensible sin enviar datos a la nube.
- Servidor local compatible con OpenAI: oMLX expone un endpoint en `http://localhost:8000/v1`, por lo que se puede integrar como backend en herramientas que ya hablan la API de OpenAI sin cambiar el cliente.
- Prototipado de agentes de código: la ventana de 262 144 tokens permite mantener en contexto repositorios medianos, historiales de conversación largos y resultados de herramientas en una sola sesión.
- Evaluación de edición de pesos: sirve como caso de estudio reproducible para investigadores interesados en modificar comportamientos concretos (verbosidad, autorrevisión) sin reentrenar, con código y direcciones medidas publicados en el repositorio del autor.
- Experimentación con decodificación especulativa: la cabeza MTP incluida permite medir ganancias de throughput en hardware Apple frente a decodificación autoregresiva estándar.

## Benchmarks y rendimiento

Resultados del autor sobre un subconjunto fijo de 100 tareas de LiveCodeBench release_v6 (23 fáciles, 31 medias, 46 difíciles; concursos del 2025-02-15 al 2025-04-06), modo no-thinking, greedy, 8192 tokens, medidos en oMLX contra el modelo base exacto (`GBP-DE/Qwen3.8-Flash-Next-oQ4e-WLSRefit-MTP`, revisión `8a284d64`):

| Métrica | Base | Este modelo |
|---|---|---|
| pass@1 | 51 | 53 |
| Tareas difíciles resueltas | 8 / 46 | 12 / 46 |
| Respuestas que agotan el límite de tokens | 38 | 23 |
| Tokens medianos por respuesta | 3 863 | 2 935 |
| Tokens totales | 445 k | 373 k |

Con muestreo (temperatura 0.7 / top_p 0.8 / top_k 20, 3 muestras por modelo): base 50.7 de media (rango 46–54), este modelo 52.0 (rango 51–54), sign test p = 1.0. Añadiendo presence_penalty 1.5 (2 muestras por modelo): base 49 y 52, este modelo 60 y 51; respuestas cortadas en el límite 69 frente a 43 de 200; mediana de 5 196 frente a 2 940 tokens; 21 % menos tokens en total.

El autor indica que HumanEval, GSM8K, MMLU, la aceptación del borrador MTP y la velocidad de decodificación se mantienen dentro del ruido. No se han publicado resultados de benchmarks en la información disponible para el modelo base original de Qwen ni comparaciones con otros modelos.

## Requisitos de hardware

- RAM unificada: unos 86 GB residentes en oMLX sobre un Mac de 128 GB (oMLX lo muestra como 80 GiB); el modelo completo en disco ocupa 118 GB.
- En un equipo de 128 GB el modelo no cabe íntegramente en memoria: oMLX mantiene la tabla de n-gramas en SSD (`PLE forced to SSD`) y registra una penalización teórica de unas 2,5 veces, aunque en caliente el autor no observó esa ralentización.
- GPU recomendadas: el autor solo lo ha probado en Apple Silicon (MacBook Pro M5 Max de 128 GB, macOS 26). No hay datos para A100, H100 ni RTX 4090, y el formato MLX no es directamente compatible con CUDA.
- Cabe en GPU de consumo: no disponible para GPUs NVIDIA; en Apple Silicon requiere 128 GB de memoria unificada.
- Despliegue: oMLX 0.7.4.dev1 (app de macOS o instalación vía Homebrew) y mlx_vlm 0.7.11 o superior con la vista de PLE externa (`prepare_external_ple_model`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Throughput: 96–107 tok/s en decodificación de un solo flujo con MTP activo en caliente; la primera pasada tras cargar baja a 74–82 tok/s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / hardware | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-norev-oQ4e-MTP (este) | 180 B totales | 262 144 | MLX, Apple Silicon | qwen-community-1.0 | Edición de pesos sin entrenamiento; MTP incluido |
| GBP-DE/Qwen3.8-Flash-Next-oQ4e-WLSRefit-MTP (base directo) | 180 B totales | 262 144 | MLX, Apple Silicon | qwen-community-1.0 | Sin la edición de autorrevisión; 10 GB menos en disco |
| Qwen3.8-Flash-Next original | 180 B totales | 262 144 | safetensors | qwen-community-1.0 | Modelo de referencia de Qwen; sin cuantización oQ4e |

No se dispone de datos de benchmarks comparativos con otras familias de modelos en la información proporcionada.

## Limitaciones y advertencias

- La edición de pesos es una intervención heurística sin entrenamiento ni validación independiente: los resultados proceden de un único autor, una única máquina y un subconjunto de 100 tareas posiblemente contaminado (tareas anteriores al modelo).
- El subconjunto de evaluación es pequeño y las diferencias en pass@1 (51 frente a 53) no son estadísticamente significativas según el propio sign test (p = 0.75 en modo greedy, p = 1.0 con muestreo).
- Solo soporta inglés según la model card.
- La torre de visión está intacta pero no ha sido probada por el autor.
- En equipos de 128 GB la tabla de n-gramas se mantiene en SSD, lo que puede afectar a la latencia en el primer uso tras cargar el modelo.
- Requiere hardware Apple Silicon con 128 GB de memoria unificada; no hay soporte documentado para CUDA ni para motores de inferencia habituales en servidores.
- Licencia qwen-community-1.0: es necesario revisar sus términos antes de un uso comercial, ya que la model card la etiqueta como `other` y remite al texto de licencia de Qwen.
- Riesgo de alucinación y sesgos: no documentado en la información disponible; al ser un modelo de 180 B sin ficha de evaluación propia, se recomienda validación en el dominio de uso.
- La reducción de la autorrevisión puede eliminar correcciones útiles en tareas donde el modelo se equivoca en el primer intento; el autor reporta que la precisión no baja, pero no hay verificación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/blazkepa/Qwen3.8-Flash-Next-norev-oQ4e-MTP
- Modelo base: https://huggingface.co/GBP-DE/Qwen3.8-Flash-Next-oQ4e-WLSRefit-MTP
- Repositorio del autor con código, direcciones medidas y resultados: https://github.com/blazkepa/flash-next-norev
- oMLX: https://github.com/jundot/omlx
- Licencia Qwen Community 1.0: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE

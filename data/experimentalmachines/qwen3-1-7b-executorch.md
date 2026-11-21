# experimentalmachines/Qwen3-1.7B-ExecuTorch

## Resumen

Qwen3-1.7B-ExecuTorch es una distribución de pesos del modelo Qwen3-1.7B de Alibaba Qwen, exportada por el usuario experimentalmachines a formato ExecuTorch (`.pte`) para inferencia en dispositivos Android. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión cuantizada (8da4w con GPTQ) del checkpoint original, empaquetada con múltiples ventanas de contexto fijas y varios backends de ejecución: XNNPACK para CPU arm64, Vulkan para GPU, Qualcomm QNN para la NPU Hexagon del Snapdragon 8 Elite (SM8750) y MediaTek NeuroPilot para la Dimensity 9400 (MT6991).

El interés de esta ficha radica en que resuelve un problema práctico de despliegue: llevar un LLM de 1,7 mil millones de parámetros a un teléfono móvil con un runtime de PyTorch (ExecuTorch 1.5.1), ofreciendo ficheros precompilados por backend y por tamaño de ventana de contexto, de modo que el desarrollador solo tenga que elegir el que quepa en el presupuesto de memoria del dispositivo. Cada fichero reserva el KV cache completo en el momento de carga, por lo que la ventana de contexto queda fijada en el propio binario.

El repositorio ocupa 55,8 GB porque incluye todas las variantes (CPU, GPU y dos NPUs, con ventanas de 2k a 32k), aunque cada fichero individual pesa entre 0,41 GB y 1,80 GB. La licencia es Apache 2.0, heredada del modelo base. Es relevante ahora porque la inferencia local en móvil con aceleración NPU se está consolidando como alternativa a la nube para aplicaciones sensibles a la privacidad y a la latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), exportado a ExecuTorch |
| Parametros totales | 1,7 mil millones (modelo base Qwen3-1.7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Fija por fichero: 2.048, 4.096, 8.192, 16.384 o 32.768 tokens segun backend |
| Tipos de cuantizacion | 8da4w con GPTQ (XNNPACK y Vulkan); a16w8 para MediaTek NeuroPilot; hibrida para QNN |
| Idiomas soportados | no disponible (heredados del modelo base Qwen3, no documentados en esta ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | ExecuTorch `.pte` (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-1.7B (revision `70d244cc86cc`), un transformer decoder-only de la familia Qwen3. Esta distribucion no aporta informacion sobre el entrenamiento original (numero de tokens, composicion del dataset, RLHF/DPO); esos detalles corresponden a la model card de Qwen/Qwen3-1.7B.

La innovacion tecnica de esta publicacion esta en el pipeline de exportacion y cuantizacion. Se aplica cuantizacion de pesos a 8 bits con activaciones a 4 bits (8da4w) mediante GPTQ para los backends XNNPACK y Vulkan, y un esquema a16w8 para la NPU de MediaTek. Los ficheros para Qualcomm QNN son hibridos, presumiblemente repartiendo capas entre CPU y HTP. Cada variante se compila con una ventana de contexto fija: el runtime asigna todo el KV cache al cargar, y cada carpeta incluye un `config.json` con el campo `fits_phone_budget` que estima si el fichero cabe en un presupuesto de 5 GB. Los ficheros de MediaTek estan troceados en cuatro partes (chunk1of4 a chunk4of4) por limitaciones del compilador NeuroPilot.

## Capacidades

- Generacion de texto autoregresiva, con el comportamiento del modelo base Qwen3-1.7B.
- Razonamiento y conocimiento general heredados del checkpoint original (no verificados en esta distribucion).
- Ejecucion totalmente local en Android, sin conexion de red.
- Aceleracion por hardware en cuatro backends: CPU arm64 (XNNPACK), GPU (Vulkan), NPU Qualcomm Hexagon (QNN) y NPU MediaTek APU (NeuroPilot).
- Ventanas de contexto seleccionables de 2k a 32k tokens segun el fichero elegido.
- Integracion con la aplicacion Android openweights y con cualquier runtime ExecuTorch 1.5.1.
- Soporte de tool calling, agentes o modos de razonamiento extendido: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de texto offline en Android: usando el fichero XNNPACK de 4k (1,29 GB), la aplicacion puede ofrecer generacion de texto y resumen sin conexion en cualquier telefono arm64, con una ventana suficiente para conversaciones cortas.
- Autocompletado y redaccion en teclados virtuales: el fichero de 2k (1,28 GB) en CPU permite sugerencias de frase con latencia aceptable y sin enviar pulsaciones a un servidor.
- Procesamiento de documentos privados en el dispositivo: con la variante Vulkan de 16k (1,70 GB) se pueden resumir correos o contratos de varias paginas sin salir del telefono, usando la GPU para acelerar la decodificacion.
- Clasificacion y extraccion de entidades en pipelines moviles: el modelo puede etiquetar texto de formularios o tickets en local, integrándose en flujos de captura de datos con requisitos de privacidad.
- Prototipado de agentes conversacionales en hardware movil: la variante QNN de 8k (1,76 GB) en Snapdragon 8 Elite permite probar interacciones multi-turno con aceleracion NPU antes de escalar a produccion.
- Demos y evaluacion de ExecuTorch: los ficheros de MediaTek, troceados y con ventanas de 2k a 8k, sirven para validar el runtime NeuroPilot y medir latencia en Dimensity 9400.
- Traduccion y reescritura de textos cortos en aplicaciones de viaje: con contexto de 2k y el backend Vulkan, se obtiene respuesta en el propio dispositivo incluso sin cobertura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta un smoke test en los ficheros XNNPACK, que genero la respuesta "Paris" correctamente; el resto de variantes se marco como "structure checked" sin ejecucion en NPU real. No hay datos de latencia ni throughput.

## Requisitos de hardware

- Almacenamiento: cada fichero individual ocupa entre 0,41 GB (chunks MediaTek) y 1,80 GB (Vulkan 32k); el repositorio completo suma 55,8 GB.
- Memoria en dispositivo: el runtime reserva el KV cache completo al cargar; el autor estima la viabilidad contra un presupuesto de 5 GB mediante `fits_phone_budget`.
- CPU: cualquier dispositivo arm64 con el fichero XNNPACK (1,28 a 1,35 GB).
- GPU: cualquier arm64 con soporte Vulkan (1,62 a 1,80 GB).
- NPU Qualcomm: exclusivamente Snapdragon 8 Elite (SM8750) para los ficheros QNN.
- NPU MediaTek: exclusivamente Dimensity 9400 (MT6991) para los ficheros NeuroPilot.
- Despliegue: runtime ExecuTorch 1.5.1 o la app Android openweights; no es compatible con vLLM, llama.cpp, Ollama ni TGI, que esperan safetensors o GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B-ExecuTorch | 1,7 B | 2k a 32k fijo por fichero | ExecuTorch `.pte` | Apache 2.0 | Hugging Face, 958 descargas |
| Qwen/Qwen3-1.7B (original) | 1,7 B | no disponible en esta ficha | safetensors, transformers | Apache 2.0 | Hugging Face |
| Otros exports ExecuTorch de Qwen3-1.7B | 1,7 B | no disponible | ExecuTorch `.pte` | Apache 2.0 | no disponible en la informacion proporcionada |

La comparacion con alternativas de la misma categoria (por ejemplo, otras distribuciones on-device como Gemma o Llama en formato GGUF para llama.cpp) no puede completarse con datos verificados en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo nuevo: hereda sesgos, alucinaciones y limitaciones del Qwen3-1.7B original, incluida su tendencia a inventar datos en tareas de conocimiento factual.
- La ventana de contexto es fija por fichero; no se puede ampliar en tiempo de ejecucion sin recargar otro binario, y elegir una ventana grande consume mas memoria permanentemente.
- Solo se ha validado funcionalmente el backend XNNPACK (smoke test con "Paris"); las variantes Vulkan, QNN y NeuroPilot solo pasaron una comprobacion estructural y no se ejecutaron en hardware real durante la publicacion.
- Dependencia fuerte del hardware: los ficheros QNN solo funcionan en Snapdragon 8 Elite y los NeuroPilot solo en Dimensity 9400; no hay fallback documentado.
- El runtime ExecuTorch 1.5.1 es un requisito estricto; versiones distintas pueden romper la compatibilidad del `.pte`.
- No hay datos publicados de calidad, latencia ni consumo energetico, lo que impide garantizar un rendimiento en produccion.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar los terminos del modelo base Qwen3-1.7B enlazados en la model card.
- El repositorio de 55,8 GB puede ser costoso de descargar; se recomienda descargar solo el fichero necesario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/experimentalmachines/Qwen3-1.7B-ExecuTorch
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-1.7B/blob/main/LICENSE
- Aplicacion Android openweights: https://github.com/alpharomercoma/openweights

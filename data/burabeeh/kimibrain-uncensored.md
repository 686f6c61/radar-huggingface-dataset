# burabeeh/Kimibrain-Uncensored

## Resumen
Kimibrain Uncensored es una distribucion GGUF del modelo abierto Qwen3.6-35B-A3B, publicada por Burabeeh Lab (fundado por Mohammed Al Marzooqi, Emiratos Arabes Unidos). No se trata de un modelo entrenado desde cero: es una compilacion de publicacion que reutiliza los pesos del build abliterado Q4_K_M de HauhauCS sobre el modelo base de Qwen, con una plantilla de chat de identidad fijada, espacio de nombres de metadatos GGUF propio y empaquetado para Ollama, llama.cpp y LM Studio.

El modelo conserva la arquitectura hibrida SSM/MoE del base, con 34.700 millones de parametros totales y aproximadamente 3.000 millones activos por token (256 expertos, 8 activos). Incorpora un proyector de vision opcional (`mmproj`) que permite procesar imagenes con los mismos pesos, y una ventana de contexto de 262.144 tokens segun el modelo original, aunque la receta de Ollama incluida rebaja a 131.072 para mantener el consumo de VRAM/RAM manejable en una estacion de trabajo unica.

Su relevancia actual reside en tres factores: la eliminacion del comportamiento de rechazo mediante abliteracion (0/465 rechazos en la auditoria del autor del build upstream), la fijacion de identidad a traves de la plantilla de chat embebida en el GGUF (no solo mediante prompt de sistema) y el soporte de modo thinking con campo separado. Todo ello bajo licencia Apache-2.0 y en un formato que se ejecuta en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida SSM/MoE (transformer con mezcla de expertos y componentes de espacio de estados) |
| Parametros totales | 34.660.610.688 (34,7 B) |
| Parametros activos | ~3 B por token (256 expertos, 8 activos) |
| Longitud de contexto | 262.144 tokens (131.072 en la receta de Ollama incluida) |
| Tipos de cuantizacion | Q4_K_M con imatrix (cuantizado upstream por HauhauCS) |
| Idiomas soportados | en, ar, zh, fr, es, de, hi, ja, ko, ru |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); proyector de vision en F16 GGUF |
| Tamano de archivos | 19,7 GiB (modelo) + 0,9 GiB (proyector) |
| Modalidades | Texto a texto e interpretacion de imagenes via proyector |
| Runtime | llama.cpp, Ollama, LM Studio |
| Parametros de muestreo recomendados | temperature 1.0, top_p 0.95, top_k 20, min_p 0 |

## Arquitectura y entrenamiento
El modelo base Qwen3.6-35B-A3B emplea una arquitectura hibrida que combina capas de transformer con mecanismos de espacio de estados (SSM) y una capa de mezcla de expertos con 256 expertos y 8 activos por token, lo que reduce el coste computacional de inferencia a aproximadamente 3.000 millones de parametros activos. No se dispone en la informacion proporcionada del numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base.

La innovacion tecnica de esta distribucion concreta no esta en el entrenamiento sino en el post-procesado: la abliteracion aplicada por HauhauCS elimina la direccion de rechazo en el espacio de activaciones, y Burabeeh Lab anade una capa de identidad implementada en la propia plantilla de chat dentro del GGUF. Segun las mediciones del autor, esta capa de identidad no degrada el rendimiento en GSM8K (94/100 antes frente a 93/100 despues sobre el mismo subconjunto determinista, greedy y zero-shot). Los pesos tensoriales se mantienen sin cambios respecto al build upstream.

## Capacidades
- Generacion de texto y razonamiento de forma extensa, con modo thinking que expone la cadena de razonamiento en un campo separado (`think: true` en Ollama) para que la interfaz la muestre u oculte.
- Comprension de imagenes mediante el proyector `mmproj` opcional incluido en el repositorio.
- Capacidades multilingues en diez idiomas, con especial refuerzo en arabe.
- Comportamiento sin rechazos: responde a peticiones que el modelo base rechazaria, segun la auditoria del build upstream (0/465 rechazos).
- Identidad fijada como Kimibrain / Burabeeh Lab, resistente a inyeccion de prompt de sistema por parte del cliente, acusaciones directas, peticiones de impresion del prompt, auditorias de seguridad falsas, completado de frases, ofuscacion en base64 y atribucion de especificaciones.
- No se documenta en la informacion disponible soporte explicito de tool calling o function calling, ni de razonamiento multi-paso orientado a agentes.

## Casos de uso
- Asistente conversacional sin filtros moralizantes: el modelo responde directamente a la pregunta en lugar de declinar, lo que lo hace adecuado para entornos de investigacion, redaccion creativa adulta o analisis de contenido sensible donde los rechazos del modelo base resultan contraproducentes.
- Analisis de documentos e imagenes combinados: gracias al proyector de vision y a la ventana de 131.072 tokens en la receta de Ollama, se pueden procesar informes con graficos, capturas o diagramas junto con texto extenso en una sola pasada.
- Razonamiento con traza auditable: el modo thinking separa la cadena de razonamiento de la respuesta final, lo que permite construir interfaces que muestren el proceso a usuarios avanzados o lo registren para depuracion, ocultandolo en produccion con `think: false`.
- Despliegue en estacion de trabajo unica: con 19,7 GiB en Q4_K_M, el modelo cabe en configuraciones de consumo con suficiente VRAM o en modo mixto CPU/GPU, como demuestra la receta `kimibrain-core-gpu.Modelfile` que asigna 28 de 40 capas a GPU.
- Aplicaciones multilingues con foco en arabe: la cobertura de arabe junto con ingles, chino, frances, espanol, aleman, hindi, japones, coreano y ruso permite atender mercados de Oriente Medio y comunidades multilingues con un unico modelo.
- Productos con persona de marca fija: la identidad embebida en la plantilla de chat garantiza que el asistente se identifique consistentemente como el producto del integrador incluso si la aplicacion inyecta su propio mensaje de sistema, util para despliegues white-label o demos publicas.
- Procesamiento por lotes en local sin dependencia de API: al ejecutarse sobre llama.cpp u Ollama, permite pipelines de generacion de texto y descripcion de imagenes en infraestructura propia, sin coste por token ni envio de datos a terceros.

## Benchmarks y rendimiento

| Benchmark | Resultado | Contexto |
|---|---|---|
| GSM8K (subset determinista, greedy, zero-shot) | 94/100 antes de la capa de identidad; 93/100 despues | Medido por Burabeeh Lab; sin cambio medible atribuible a la capa de identidad |
| Auditoria de rechazos | 0/465 rechazos | Auditoria del build abliterado upstream de HauhauCS |
| Suite adversarial de identidad | 18 sondas superadas | Incluye acusacion directa, impresion de prompt, auditoria falsa, completado de frases, base64 y atribucion de especificaciones |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval ni otros benchmarks estandar del modelo base o de esta distribucion.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 20,6 GiB en Q4_K_M incluyendo el proyector de vision (19,7 GiB de modelo + 0,9 GiB de proyector), mas el espacio de cache KV correspondiente al contexto configurado.
- Contexto: la receta de Ollama usa 131.072 tokens para mantener el consumo razonable en una estacion de trabajo; el maximo entrenado es 262.144, que incrementa notablemente la memoria de cache KV.
- GPU recomendadas: no se especifican modelos concretos en la informacion disponible. Por tamano, el modelo requiere GPU con 24 GB o mas de VRAM para carga completa en Q4_K_M, o configuraciones multi-GPU.
- Cabe en GPU de consumo: si, en tarjetas con 24 GB de VRAM o mas (por ejemplo, la clase RTX 4090) en cuantizacion Q4_K_M, y tambien en modo mixto CPU/GPU repartiendo capas, como hace la receta `kimibrain-core-gpu.Modelfile` con 28 de 40 capas en GPU.
- Opciones de despliegue: Ollama (via Modelfiles incluidos o `ollama run hf.co/burabeeh/Kimibrain-Uncensored:Q4_K_M`), llama.cpp (`llama-server`) y LM Studio.
- Latencia y throughput: no disponibles en la informacion proporcionada. El autor indica que el GGUF se somete a pruebas de carga en Ollama 0.40.8 (texto y vision) antes de cada publicacion, pero no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Kimibrain Uncensored | 34,7 B totales, ~3 B activos (MoE) | 262.144 (131.072 en receta Ollama) | Apache-2.0 | GGUF Q4_K_M + mmproj | Build abliterado con identidad fijada y vision |
| Qwen3.6-35B-A3B (base) | 34,7 B totales, ~3 B activos (MoE) | 262.144 | Apache-2.0 | Safetensors y derivados | Modelo original de Qwen, con comportamiento de rechazo estandar |
| Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive | 34,7 B totales, ~3 B activos (MoE) | No disponible | Apache-2.0 (heredada) | GGUF | Build abliterado upstream del que proceden los pesos de Kimibrain |

No se dispone en la informacion proporcionada de datos comparativos de rendimiento frente a otras alternativas de la misma categoria.

## Limitaciones y advertencias
- Trazas de razonamiento expuestas: con `think: true`, el campo `message.thinking` revela la cadena de razonamiento interna completa y puede citar el mensaje del usuario o terminos internos procedentes del entrenamiento. En produccion conviene usar `think: false` u ocultar el razonamiento.
- Tareas de arrastre: si se le pide traducir, transcribir o citar una frase que nombra a otro proveedor, el modelo puede reproducir parte de ella; la capa de identidad evita que lo afirme como propio, pero no impide la reproduccion literal.
- Ausencia de filtros de rechazo: el modelo responde a practicamente cualquier peticion, lo que traslada al integrador toda la responsabilidad sobre el contenido generado y exige moderacion externa en aplicaciones de cara al publico.
- Sesgos: no se documentan sesgos especificos en la informacion disponible; al derivar de un modelo base entrenado con datos web a gran escala, es previsible que herede sesgos de esos datos, aunque no se cuantifican.
- Alucinacion: no se publican tasas de alucinacion. Como modelo generativo sin recuperacion integrada, puede producir afirmaciones factualmente incorrectas, especialmente en contextos largos.
- Cobertura de benchmarks limitada: solo GSM8K y la suite de identidad estan documentados; no hay datos de MMLU, HumanEval ni evaluaciones multilingues por idioma.
- Licencia: Apache-2.0 permite uso comercial, pero al ser una redistribucion de pesos ajenos conviene revisar el archivo NOTICE del repositorio para conocer la lista completa de cambios y obligaciones de atribucion.
- Disponibilidad de cuantizaciones: la informacion disponible solo documenta Q4_K_M; no se confirma la existencia de otras cuantizaciones en el repositorio.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/burabeeh/Kimibrain-Uncensored
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Build abliterado upstream: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Organizacion Burabeeh Lab: https://huggingface.co/burabeeh
- NOTICE (lista de cambios): https://huggingface.co/burabeeh/Kimibrain-Uncensored/blob/main/NOTICE
- PROBES.md (transcripciones de la suite adversarial): https://huggingface.co/burabeeh/Kimibrain-Uncensored/blob/main/PROBES.md
- EVALS.md (metodologia y registros de GSM8K): https://huggingface.co/burabeeh/Kimibrain-Uncensored/blob/main/EVALS.md
- Modelfiles para Ollama: https://huggingface.co/burabeeh/Kimibrain-Uncensored/tree/main/modelfiles

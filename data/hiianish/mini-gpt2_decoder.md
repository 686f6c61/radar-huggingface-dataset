# hiianish/mini-gpt2_decoder

## Resumen

Mini-GPT (`hiianish/mini-gpt2_decoder`) es un transformer decoder-only de 30.044.544 parametros entrenado desde cero por el usuario hiianish como proyecto de curso. No es un modelo pensado para competir en calidad de generacion, sino un banco de pruebas reproducible sobre el que medir tecnicas de optimizacion de sistemas: precision mixta, gradient checkpointing, un kernel de atencion fusionada en Triton, generacion autoregresiva con KV-cache y cuantizacion INT8 post-entrenamiento. Se publica bajo licencia MIT y con pesos en FP32 en formato safetensors.

La arquitectura sigue el esquema GPT-2 con pre-normalizacion: 6 capas, 6 cabezas de atencion, dimension de embedding de 384 y una longitud de contexto de solo 256 tokens. El vocabulario es el BPE de GPT-2 de 50.257 tokens, gestionado con `tiktoken`. El entrenamiento se hizo sobre una rebanada de aproximadamente 100 MB de OpenWebText, exclusivamente en ingles.

Su relevancia no esta en el rendimiento linguistico, sino en la trazabilidad de las mediciones: el autor documenta tiempos, memoria pico, perdida de validacion y perplejidad de cada fase, incluidos los casos en los que la optimizacion no funciono (el kernel de Triton resulto mas lento que SDPA, con un factor de 0,87x). Es, por tanto, un artefacto util para quien quiera reproducir un pipeline de optimizacion completo con un coste de computo minimo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2, pre-norm |
| Parametros totales | 30.044.544 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | INT8 post-entrenamiento evaluado por el autor (no se publican pesos INT8); los pesos subidos son FP32 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (FP32) |
| Capas | 6 |
| Cabezas de atencion | 6 |
| Dimension de embedding | 384 |
| Vocabulario | 50.257 tokens (BPE de GPT-2 via `tiktoken`) |
| Tamano del repositorio | 0,1 GB |
| Framework | PyTorch |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con pre-normalizacion, sin innovaciones arquitectonicas: atencion causal multi-cabeza estandar, 6 bloques, 384 dimensiones de embedding y 6 cabezas de atencion (64 dimensiones por cabeza). El vocabulario de 50.257 tokens es el BPE de GPT-2, lo que lo hace directamente compatible con tokenizadores de la familia GPT-2. Su autor lo define explicitamente como un modelo pequeno entrenado desde cero, no como una destilacion ni un fine-tuning de un modelo preentrenado.

El entrenamiento se realizo en seis fases incrementales sobre una rebanada de unos 100 MB de OpenWebText: (1) linea base en FP32, (2) precision mixta con AMP, (3) gradient checkpointing y gradient accumulation, (4) un kernel de atencion fusionada escrito a mano en Triton, (5) generacion autoregresiva con KV-cache y (6) cuantizacion INT8 post-entrenamiento. No se documenta el numero total de tokens procesados, ni el uso de RLHF, DPO o cualquier forma de ajuste por preferencias. Las fases 1 a 4 son optimizaciones de sistemas, no de calidad: el autor senala que la perdida de validacion final con memory engineering es de 5,0966, frente a 5,5229 de la linea base.

El detalle tecnico mas relevante es el resultado negativo documentado: el kernel de Triton propio alcanza un factor de solo 0,87x de velocidad media en el pase forward frente a la atencion vanilla de PyTorch (SDPA), con su mejor caso en 0,89x a `seq_len=64` (de 18,006 ms a 20,132 ms). El KV-cache, en cambio, si funciona como se espera: la ganancia crece de 1,10x a 20 tokens hasta 1,23x a 200 tokens, con salida identica token a token bajo decodificacion greedy.

## Capacidades

- Generacion de texto autoregresiva de frases cortas en ingles. El autor advierte que la salida es gramaticalmente plausible pero no muy coherente en tramos largos.
- Modelado de lenguaje a nivel de token con el vocabulario BPE de GPT-2, compatible con `tiktoken`.
- Generacion con KV-cache (implementada en el repositorio del proyecto) y generacion ingenua sin cache desde el propio modulo del modelo.
- Ejecucion en CPU para inferencia, con una version INT8 evaluada aparte por el autor.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente, razonamiento multi-paso ni modo de pensamiento (thinking).
- No dispone de vision, audio ni multimodalidad.
- Sin capacidades multilingues: el entrenamiento es exclusivamente en ingles.
- Sin `pipeline` declarado en HuggingFace, por lo que no es cargable con `transformers.pipeline()` de forma directa; requiere el codigo del repositorio del proyecto (`model/gpt.py`, clase `MiniGPT`).

## Casos de uso

- Material didactico de entrenamiento desde cero: sirve para ilustrar el ciclo completo de tokenizacion BPE, definicion de `GPTConfig`, bucle de entrenamiento y guardado en safetensors con un coste de computo de minutos, no de dias.
- Banco de pruebas de optimizacion de sistemas: el proyecto proporciona cifras de referencia por fase (1170,6 s de linea base frente a 484,0 s con precision mixta, y 1763,6 s con memory engineering), de modo que se puede reproducir y comparar el efecto de AMP, gradient checkpointing y gradient accumulation sobre el mismo modelo.
- Validacion de kernels de atencion: es un caso ideal para medir si un kernel propio en Triton supera a SDPA sin arriesgar horas de GPU, ya que el propio autor documenta que su implementacion se quedo en 0,87x.
- Pruebas de infraestructura de serving: con 30 M de parametros y menos de 1 GB de VRAM, permite verificar pipelines de vLLM, TGI, llama.cpp u Ollama, y comprobar rutas de carga de safetensors, antes de pasar a modelos de miles de millones de parametros.
- Inferencia en CPU y dispositivos de bajos recursos: los pesos FP32 ocupan del orden de 115-120 MB y la version INT8 medida por el autor baja a 102,7 MB, lo que permite ejecutar el modelo en portatiles, Raspberry Pi o entornos sin GPU.
- Investigacion sobre cuantizacion: la fase 6 ofrece una medida concreta del coste de INT8 (de 114,6 MB a 102,7 MB, un 1,12x mas pequeno, y de 180,14 ms a 165,93 ms en CPU, un 1,09x mas rapido), util como punto de partida metodologico para estudiar la relacion entre compresion y perplejidad.
- Generacion de texto de relleno para pruebas de integracion: util para poblar fixtures, validar esquemas de datos o probar el renderizado de interfaces con texto plausible en ingles, sin coste de API.
- Aprendizaje de tecnicas de atencion causal: al ser un decoder-only de 6 capas y 256 tokens de contexto, el mapa de atencion y el flujo de gradientes son inspeccionables en cuadernos interactivos sin necesidad de infraestructura especializada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni evaluaciones de la misma familia). El autor unicamente reporta metricas internas de entrenamiento y de optimizacion:

| Metrica | Valor |
|---|---|
| Perdida de validacion final (memory engineering) | 5,0966 |
| Perdida de validacion final (linea base FP32) | 5,5229 |
| Perdida de validacion final (precision mixta) | 5,5224 - 5,5225 |
| Tiempo de entrenamiento, linea base | 1170,6 s |
| Tiempo de entrenamiento, precision mixta | 483,7 - 484,0 s |
| Tiempo de entrenamiento, memory engineering | 1763,6 s |
| Memoria pico (las tres fases) | 8208 MB |
| Factor de velocidad del kernel Triton vs. SDPA (forward) | 0,87x de media; 0,89x a `seq_len=64` (18,006 ms -> 20,132 ms) |
| Ganancia del KV-cache | 1,10x a 20 tokens; 1,23x a 200 tokens |
| Perplejidad, FP32 (CPU) | 163,00 |
| Perplejidad, INT8 (CPU) | 156,69 (diferencia reportada de +-6,31) |
| Latencia CPU, FP32 | 180,14 ms |
| Latencia CPU, INT8 | 165,93 ms |
| Tamano de modelo, FP32 -> INT8 | 114,6 MB -> 102,7 MB (1,12x menor) |

Nota: el autor no especifica si las latencias de CPU corresponden a un token, a un pase forward o a una secuencia completa, ni el hardware exacto empleado en esas mediciones. La direccion de la diferencia de perplejidad (de 163,00 a 156,69) se reproduce tal cual aparece en la model card, sin interpretacion adicional.

## Requisitos de hardware

- VRAM para inferencia: los pesos FP32 son 30,04 M de parametros, es decir, unos 120 MB (114,6 MB segun la medicion del autor). Con activaciones y buffers de atencion, el modelo completo cabe holgadamente por debajo de 1 GB de VRAM.
- Version INT8: 102,7 MB de pesos segun la medicion del autor, aunque esos pesos no se publican; habria que reproducir la cuantizacion.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. El autor no publica resultados en GPU concretas (no hay datos de A100, H100, RTX 4090, etc.), por lo que no se puede indicar rendimiento por modelo de tarjeta.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de las ultimas generaciones (GTX 1050 o superior), e incluso en GPUs integradas con memoria compartida.
- Cabe en CPU: si, y es el unico escenario con latencia medida (180,14 ms en FP32 y 165,93 ms en INT8, sin que la model card aclare la unidad de trabajo).
- Opciones de despliegue: no hay `pipeline` declarado en HuggingFace, de modo que la ruta soportada es cargar el modelo con el codigo del repositorio del proyecto (`model.gpt.MiniGPT` + `safetensors.torch.load_model`). No se documentan integraciones verificadas con vLLM, TGI, Ollama o llama.cpp; la conversion a GGUF no esta publicada.
- Throughput: no disponible. No se publican mediciones de tokens por segundo en GPU ni en CPU.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comunes que permitan comparar el rendimiento real. La comparacion siguiente se limita a caracteristicas estructurales declaradas en las model cards publicas de cada modelo:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| mini-gpt2_decoder (este modelo) | 30,04 M | 256 | MIT | Pesos FP32 en safetensors; requiere codigo propio | Entrenado desde cero sobre ~100 MB de OpenWebText; proyecto de optimizacion |
| GPT-2 small | 124 M | 1024 | MIT modificada | Pesos publicados, integracion nativa en `transformers` | Referencia arquitectonica directa; preentrenado sobre WebText |
| distilgpt2 | 82 M | 1024 | Apache-2.0 | Pesos publicados, integracion nativa en `transformers` | Destilado de GPT-2; mayor tamano y contexto que este modelo |

Cualquier comparacion de calidad (perplejidad, coherencia, benchmarks) entre estos tres modelos no esta disponible en la informacion proporcionada y no deberia inferirse a partir del numero de parametros.

## Limitaciones y advertencias

- Calidad linguistica limitada: el propio autor advierte que el modelo produce salidas gramaticalmente plausibles pero poco coherentes en tramos largos. La perdida de validacion final de 5,0966 y una perplejidad de 163,00 son valores altos.
- Alto riesgo de alucinacion: al no haber sido ajustado con RLHF, DPO ni instrucciones, no distingue entre afirmaciones veridicas y falsas, y no tiene ninguna capa de alineacion.
- Ventana de contexto muy corta: 256 tokens. No es viable para conversaciones multi-turno, resumen de documentos largos ni analisis de codigo extenso.
- Solo ingles: el entrenamiento se realizo exclusivamente sobre datos en ingles; no hay soporte multilingue, y en castellano la salida esperable es incoherente.
- Datos de entrenamiento muy reducidos: unos 100 MB de OpenWebText, insuficientes para adquirir conocimiento factual fiable. No debe usarse como fuente de informacion.
- Sin soporte de instrucciones ni de herramientas: no hay plantilla de chat, ni tool calling, ni function calling, ni modo de razonamiento. No es adecuado como agente.
- No es cargable con `transformers.pipeline()`: no hay tarea declarada en HuggingFace y la arquitectura requiere el codigo del repositorio del proyecto, lo que anade una dependencia externa no versionada en el propio repositorio de HuggingFace.
- Pesos publicados en FP32, no en INT8: los resultados de cuantizacion son mediciones del autor, no artefactos descargables. Reproducirlos exige reimplementar el proceso.
- Licencia permisiva: MIT permite uso comercial, modificacion y redistribucion sin obligacion de publicar cambios. No hay restricciones de uso documentadas, pero tampoco garantia alguna de idoneidad por parte del autor.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta. No hay evidencia de uso en produccion, ni issues, ni validacion independiente de las cifras publicadas.
- Las metricas del proyecto no estan auditadas externamente y, en el caso del kernel de Triton, el propio autor reconoce que solo cubre el pase forward (el comportamiento del backward/autograd queda acotado por una advertencia en el docstring de `model/attention.py`).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hiianish/mini-gpt2_decoder
- Repositorio del proyecto: no disponible (la model card menciona los ficheros `upload_to_hf.py`, `generate.py` y `model/attention.py`, pero no incluye URL)
- Paper tecnico: no disponible
- Blog o articulo del autor: no disponible
- Demo o espacio interactivo: no disponible

Nota sobre la busqueda web: los resultados recuperados no contienen ningun enlace relacionado con este modelo ni con IA open source; todos apuntan a secciones de nfl.com (clasificaciones, calendarios y resultados de la NFL). No se han podido extraer enlaces utiles de esa busqueda.

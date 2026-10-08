# onnx-community/d1-omni-600M-ONNX

## Resumen

d1-omni-600M-ONNX es la conversión a ONNX del modelo LiquidAI/d1-omni-600M, publicada por la comunidad onnx-community para su ejecución en navegador mediante transformers.js y onnxruntime-web con WebGPU. No es un modelo generativo al uso: se trata de un modelo de decisión de 587M parámetros que puntúa un marcador `<mask>` por cada opción planteada y devuelve logits por opción en una única pasada forward, con cero tokens generados. Resuelve el problema del enrutado y la clasificación de baja latencia sin coste de decodificación autoregresiva.

Su arquitectura combina un tronco bidireccional LFM2.5-Encoder-350M con una cabeza de decisión, y añade dos codificadores multimodales: un SigLIP2 con proyector para imágenes y un FastConformer con adaptador para audio a 16 kHz. Admite tres tipos de pregunta tipada (`choice`, `noul` y `score`) sobre un estado de texto, una imagen o un clip de voz.

La relevancia actual del repositorio está en que permite ejecutar el modelo completo en el navegador del cliente con pesos cuantizados de entre 0,17 GB y 0,45 GB por componente, sin enviar datos a un servidor. La licencia es la LFM Open License v1.0 del modelo original, con umbral de uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tronco bidireccional LFM2.5-Encoder-350M + cabeza de decisión; visión SigLIP2 + proyector; audio FastConformer + adaptador |
| Parametros totales | 587M (modelo base d1-omni-600M); tronco LFM2.5-Encoder-350M |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 15360 posiciones de texto en peticiones de audio; 896 posiciones de texto en peticiones con imagen (según `prompt.py` del repo base) |
| Tipos de cuantizacion | 8 bits (q8/quantized), 4 bits (q4), fp16 y fp32 según el grafo |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (`license: other`), con umbral de uso comercial |
| Formato de pesos | ONNX (transformers.js / onnxruntime-web) |

## Arquitectura y entrenamiento

El modelo es un "decision model" de tipo System One: en lugar de generar texto, recibe un estado (texto, imagen o audio), unas opciones tipadas y produce una puntuación por opción mediante una cabeza de decisión que lee un marcador `<mask>`. El tronco es un encoder bidireccional LFM2.5-Encoder-350M, lo que permite atender el estado completo en una sola pasada en vez de decodificar token a token. Los tres tipos de pregunta son `choice` (elegir entre opciones con descripciones), `noul` (sí/no) y `score` (puntuación).

La conversión a ONNX no reentrena pesos: exporta el tronco y la cabeza (`export_decision.py`), implementa el front-end log-mel como una convolución con núcleos DFT seguida del FastConformer y el adaptador (`export_audio.py`), e integra SigLIP2 y su proyector en el grafo de visión de onnx-community/LFM2.5-VL-450M-ONNX, que comparte arquitectura (`build_vision.py`). Las capas del encoder de la cabeza se escriben de forma que no quede fijada una longitud de secuencia. Los controles de paridad reportados son de 5e-7 para el tronco y la cabeza y de 1e-5 para el pipeline de audio, ambos frente al modelo original. No se documentan en la información disponible datos de entrenamiento (número de tokens, composición del dataset, RLHF/DPO) ni innovaciones de decodificación especulativa o atención lineal: no aplican al no haber decodificación.

## Capacidades

- Decisión sobre texto: clasificación de un estado textual en un conjunto de opciones descritas, devolviendo logits y probabilidades por opción.
- Decisión sobre imagen: codificación con SigLIP2 y proyector, con el prefijo de embeddings insertado delante de los embeddings de texto.
- Decisión sobre voz: entrada de muestras mono a 16 kHz en float (int16/32768), con un máximo de 30 segundos y relleno de ceros hasta 0,5 s; el adaptador produce un embedding de prefijo por cada 80 ms.
- Preguntas tipadas: `choice` (selección entre opciones), `noul` (respuesta booleana, escrita como `false: no` / `true: yes`) y `score` (puntuación).
- Inferencia en una sola pasada forward y cero tokens generados: no hay bucle de decodificación ni muestreo.
- Ejecución en navegador con WebGPU mediante transformers.js y onnxruntime-web, además de ejecución alternativa con open-jev (JavaScript).
- Tool calling / function calling: no aplica, el modelo no genera texto ni llamadas a herramientas.
- Agentes y razonamiento multi-step: no disponible; el modelo resuelve una decisión por pasada, sin planificación autónoma.
- Capacidades multilingües: no disponible.
- Capacidad especial: modo de decisión multimodal (texto, imagen, voz) con latencia de decenas de milisegundos por pregunta.

## Casos de uso

- Enrutado de tickets de soporte: el ejemplo de la propia model card decide si una reclamación va al equipo de facturación, técnico o fraude. Al devolver probabilidades por opción en una sola pasada, encaja en un clasificador de primera línea con coste por debajo de cualquier LLM generativo.
- Triaje de voz en centros de contacto: con la pila de audio (0,67 GB) y un embedding de prefijo cada 80 ms, se puede clasificar la intención de una locución de hasta 30 segundos antes de derivarla a un agente humano o a un modelo mayor.
- Filtros de cumplimiento binarios en el navegador: las preguntas `noul` permiten resolver condiciones de tipo sí/no sobre un estado de texto sin que los datos salgan del dispositivo del usuario.
- Puntuación y ranking de candidatos: el tipo `score` permite puntuar varias alternativas y ordenarlas, útil para reranking de respuestas o para selección de variantes de contenido.
- Clasificación de imágenes privada en cliente: el codificador de visión (0,19 GB en fp16) permite etiquetar o filtrar imágenes localmente en una aplicación web, evitando subir el contenido a un backend.
- Prefiltro de bajo coste delante de un LLM: por su latencia (unos 60 ms por pregunta en un M3 Pro con WebGPU) puede actuar como router System One que decida si una consulta merece invocar un modelo generativo mucho más caro.
- Moderación y categorización de adjuntos multimodales: combinando el estado de texto con imagen o audio, se puede etiquetar un envío en un flujo de revisión antes de su publicación.
- Automatización de formularios y asistentes web sin backend: al cargar los grafos cuantizados (0,41 GB en texto q8 y 0,24 GB en q4) dentro del navegador, es posible ofrecer ayuda de clasificación en aplicaciones estáticas sin infraestructura de servidor GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (no hay MMLU, HumanEval, GSM8K ni equivalentes). Lo que sí se publica es la paridad frente al runtime propio del modelo (`system_one` en PyTorch fp32), medida como desviación de las probabilidades por opción:

| Configuración | Texto (8 decisiones) | Imágenes (4 decisiones) | Voz (39 decisiones) |
|---|---|---|---|
| Grafos fp32 | 0.0000 | 0.0000 | 0.0000 |
| q8 decision + fp16 vision / q8 audio + fp16 embedding | 0.036 | 0.047 | 0.031 |
| q4 decision | 0.091 | – | 0.52 |

Datos adicionales de rendimiento reportados: en Chrome con WebGPU (onnxruntime-web), la pila de voz completa (0,67 GB) reproduce PyTorch dentro de 0,033 sobre 91 decisiones de voz y sin cambio en la respuesta top, con unos 50 ms para el codificador de audio y 60 ms por pregunta en un M3 Pro. La implementación open-jev reproduce los valores de q8 (0,035) con 130–230 ms por pregunta en la CPU de un portátil.

## Requisitos de hardware

- Texto, 8 bits: 0,41 GB para el grafo completo (embedding + tronco + cabeza) y 0,36 GB para el grafo de decisión; 4 bits: 0,24 GB y 0,20 GB respectivamente.
- Embedding de tokens: 0,04 GB en 4 bits (uso con imágenes) y 0,13 GB en fp16 (obligatorio con audio).
- Visión: 0,19 GB en fp16 o 0,38 GB en fp32; el codificador de visión no debe cuantizarse a 8 bits, porque desplaza los embeddings hasta 0,08 y cambia respuestas.
- Audio: 0,17 GB en 8 bits o 0,45 GB en fp32, más el embedding fp16; la pila de voz completa ocupa 0,67 GB.
- Cabe en cualquier GPU de consumo y también en CPU y en navegador: el caso de referencia medido es un Apple M3 Pro con WebGPU, con 60 ms por pregunta.
- GPU recomendadas: no se especifican en la información disponible; el escenario objetivo es WebGPU en navegador (Chrome) y CPU de portátil con open-jev.
- Opciones de despliegue: transformers.js con onnxruntime-web (WebGPU), open-jev (`d1-omni-600m`) y ejecución directa de los grafos ONNX. No hay pesos GGUF, por lo que llama.cpp y Ollama no aplican; tampoco se documenta soporte de vLLM ni TGI.
- Latencia estimada: 50 ms para el codificador de audio y 60 ms por pregunta en M3 Pro con WebGPU; 130–230 ms por pregunta en CPU de portátil con open-jev. El throughput no se documenta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| onnx-community/d1-omni-600M-ONNX (este) | 587M (tronco 350M) | 15360 posiciones de texto con audio; 896 con imagen | Desviación 0.031–0.047 frente a fp32 en la configuración mixta recomendada | LFM Open License v1.0 | ONNX para navegador, transformers.js |
| LiquidAI/d1-omni-600M (modelo base) | 587M | El mismo, según `prompt.py` | Referencia fp32; desviación 0.0000 | LFM Open License v1.0 | PyTorch |
| onnx-community/LFM2.5-VL-450M-ONNX | 450M (sólo visión/texto) | no disponible | no disponible | no disponible | ONNX para navegador |
| LiquidAI LFM2.5-Encoder-350M | 350M (tronco) | no disponible | no disponible | no disponible | no disponible |

No se dispone de otros modelos de decisión comparables en la información proporcionada, ni de datos de benchmarks que permitan una comparación cuantitativa de calidad más allá de la paridad numérica con el modelo original.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni llamadas a herramientas; sólo puntúa opciones predefinidas. Cualquier caso de uso que requiera generación necesita otro modelo.
- La cuantización altera las respuestas: con `decision_q4` la desviación sube a 0,091 en texto y a 0,52 en voz, por lo que se recomienda q8 para decisiones de voz y texto críticos.
- El codificador de visión no debe cuantizarse a 8 bits: mueve los embeddings hasta 0,08 y puede cambiar la respuesta. Debe usarse fp16 (dentro de 0,05) o fp32.
- Con audio hay que usar `embed_tokens_fp16`: el embedding de 4 bits desplaza las respuestas de voz hasta 0,10 y `decision_q4` hasta 0,52.
- Restricciones de entrada de audio: mono, 16 kHz, máximo 30 segundos y relleno de ceros hasta 0,5 s. Tras el audio no se aplica temperatura y las opciones se escriben como `option_000: description`.
- La licencia LFM Open License v1.0 incluye un umbral de uso comercial; conviene revisar el fichero LICENSE antes de un despliegue en producción.
- Idiomas soportados: no disponible. No se documenta cobertura multilingüe.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea cuando la pregunta no se formula según el formato esperado (`prompt.py` del repo base) o cuando la opción correcta no está en la lista proporcionada.
- Sesgos: no disponible; no se documenta ninguna evaluación de sesgos.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado, lo que indica un ecosistema de herramientas todavía incipiente.
- El repositorio completo pesa 2,6 GB, aunque cada grafo individual es mucho menor; hay que seleccionar únicamente los ficheros necesarios para el caso de uso.

## Enlaces

- Repositorio ONNX: https://huggingface.co/onnx-community/d1-omni-600M-ONNX
- Modelo base: https://huggingface.co/LiquidAI/d1-omni-600M
- Script de formato de preguntas del modelo base: https://huggingface.co/LiquidAI/d1-omni-600M/blob/main/prompt.py
- Grafo de visión reutilizado: https://huggingface.co/onnx-community/LFM2.5-VL-450M-ONNX
- Implementación JavaScript alternativa: https://github.com/nico-martin/open-jev
- En la búsqueda web no se han encontrado enlaces adicionales relevantes (los resultados devueltos corresponden a un medio de prensa y no guardan relación con el modelo).

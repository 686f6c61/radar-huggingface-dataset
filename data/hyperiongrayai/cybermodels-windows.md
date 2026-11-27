# HyperionGrayAI/cybermodels-windows

## Resumen

Cybermodels Windows v0.1 es un adaptador LoRA de rango 4 publicado por Hyperion Gray (HyperionGrayAI) sobre el modelo base Qwen/Qwen3-Coder-Next. Su objetivo es especializar el modelo en un subconjunto acotado de temas de programacion de sistemas en Windows: planificacion de hilos, procesos, memoria, sincronizacion y E/S. El adaptador se combina con un indice de referencia offline de Microsoft Learn empaquetado en el propio repositorio (fichero SQLite con FTS5), de modo que las respuestas se apoyan en recuperacion documental local sin realizar peticiones web.

El modelo esta pensado para un flujo de retrieval-augmented generation (RAG) muy concreto: el usuario formula una pregunta sobre API de Windows, el sistema recupera hasta dos pasajes de la documentacion fijada y el modelo genera una respuesta citando la pagina correspondiente de Microsoft Learn. El adaptador solo modifica la cabeza de salida (`lm_head`), mientras que el resto de los pesos del modelo base permanece congelado.

Se trata de una publicacion de investigacion de alcance reducido: 37 preguntas distintas en el corpus, 13 documentos de entrenamiento y 4 de evaluacion, con un total de 58 ejemplos de entrenamiento y 16 de evaluacion. La licencia es Apache 2.0 y el idioma declarado es unicamente ingles. No hay descargas ni likes registrados en el momento de la consulta, y el repositorio ocupa 0.0 GB segun Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer Qwen3-Next; el adaptador modifica la cabeza de salida (`lm_head`) con matrices de rango 4 |
| Parametros totales | No disponible (depende del modelo base Qwen/Qwen3-Coder-Next; el adaptador es de rango 4 sobre `lm_head`) |
| Parametros activos | No disponible (el modelo base se describe como MoE con seis expertos por token en la model card) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors; el modelo base se ejecuta en BF16 (via Transformers) o en MXFP4 con banco de expertos empaquetado (runtime alojado Flash) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); incluye `windows.sqlite` para recuperacion offline |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 4 que actualiza exclusivamente la cabeza de salida del modelo base Qwen/Qwen3-Coder-Next. El entrenamiento se realizo con un optimizador nativo de CPU sin GPU ("GPUless") que actualiza las matrices de rango 4 en un espacio derivado de las activaciones y del vocabulario de entrenamiento, y posteriormente expande el resultado a tensores PEFT estandar dirigidos a `lm_head`. El resto de los pesos del modelo base permanece congelado. La revision exacta del modelo base y la huella del runtime empaquetado se documentan en `release.json`.

Los datos de entrenamiento consisten en 29 preguntas procedentes de 13 documentos, evaluadas bajo dos condiciones de prompt (con y sin pasajes recuperados), lo que da 58 ejemplos de entrenamiento. La evaluacion usa 8 preguntas de 4 documentos distintos en ambas condiciones (16 ejemplos). Cada ejemplo incluye la pregunta, el prompt renderizado, la respuesta objetivo completa, el identificador de fuente, los aciertos de recuperacion y el split. Los prompts de recuperacion incluyen hasta dos pasajes de fuente y las respuestas objetivo de los ejemplos con fuente incorporan un enlace de referencia. El corpus fijado contiene 17 articulos de Microsoft Learn, mas dos notas de referencia solo para inferencia sobre el estado de standby de hilos y el dimensionado del fichero de paginacion. La recuperacion se realiza localmente con SQLite FTS5, sin peticiones web.

## Capacidades

- Generacion de texto especializada en preguntas tecnicas sobre API de Windows: planificacion, procesos, memoria, sincronizacion y E/S.
- Respuesta con recuperacion aumentada (RAG) sobre un indice offline de Microsoft Learn empaquetado en el repositorio.
- Citacion de la pagina de Microsoft Learn correspondiente cuando el ejemplo de entrenamiento incluye fuente.
- Respuesta en modo "closed-book" (sin pasajes de referencia) ademas del modo con recuperacion.
- Ejecucion local sin conexion: el indice SQLite y el Markdown fijado permiten reconstruir los ejemplos y servir consultas sin red.
- Servicio HTTP autenticado con streaming mediante `runtime/serve_windows.py` (servidor Belikewater Flash).
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito en la informacion disponible.

## Casos de uso

- Asistente interno de dudas sobre sincronizacion en Windows: un equipo de desarrollo puede desplegar el adaptador con el indice SQLite local para responder preguntas como cuando usar `WakeAllConditionVariable` o como se comporta un evento auto-reset, citando la pagina de Microsoft Learn correspondiente.
- Base de conocimiento offline para entornos aislados: al no realizar peticiones web, encaja en redes air-gapped donde no se permite consultar documentacion en linea pero se necesita asistencia sobre API de Windows.
- Formacion de desarrolladores noveles en programacion de sistemas: el modelo responde con referencias verificables a Microsoft Learn, lo que permite al alumno contrastar la respuesta con la fuente original.
- Soporte a revision de codigo nativo: como apoyo para explicar semantica de primitivas de sincronizacion (eventos, variables de condicion, standby de hilos) durante revisiones de codigo C/C++ en Windows.
- Prototipo de RAG especializado: sirve como ejemplo reproducible de pipeline retrieval + adaptador LoRA, con datos de entrenamiento y evaluacion incluidos (`data/train.jsonl`, `data/eval.jsonl`, `build_data.py`) para experimentar con tecnicas de adaptacion de bajo rango.
- Despliegue en infraestructura sin GPU para el entrenamiento: el optimizador GPUless permite reproducir el ajuste del adaptador en CPU, util para laboratorios con recursos limitados.
- Integracion en un asistente conversacional multi-turno alojado: el runtime `serve_windows.py` ofrece streaming autenticado para incorporar el especialista a una interfaz tipo chat.

## Benchmarks y rendimiento

La model card reporta exactitud de siguiente token (teacher forcing) sobre 8 preguntas retenidas, comparando el modelo base (Qwennifer Flash) con el adaptador de Windows:

| Condicion retenida | Tokens objetivo | Qwennifer Flash | Flash + adaptador Windows |
|---|---:|---:|---:|
| Solo pregunta | 175 | 46,86 % | 50,86 % |
| Pregunta y pasajes recuperados | 371 | 68,19 % | 70,35 % |

Estos porcentajes miden exactitud de siguiente token, no calidad global de respuesta. La propia model card advierte que la muestra es pequena y deja abierta la calidad general sobre preguntas de Windows. En una comprobacion separada de generacion libre, el modelo alojado identifico correctamente que como maximo un hilo puede estar en standby por procesador logico y enlazo a Microsoft Learn; tambien puso entre comillas una parafrasis de Hyperion Gray, por lo que se recomienda verificar las citas literales contra la pagina original. La generacion de texto completa en BF16 no se ha probado segun la model card.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El adaptador en si es minimo (rango 4 sobre `lm_head`), pero requiere cargar el modelo base completo Qwen/Qwen3-Coder-Next.
- Ruta Transformers publica: usa pesos base completos en BF16 con seis expertos por token, por lo que necesita memoria de host o de GPU suficiente para el modelo base completo (no se especifica la cifra).
- Ruta alojada (Flash): usa el mismo adaptador sobre un banco de expertos en MXFP4 y una "spine" empaquetada con seis expertos por token; la cuantizacion y ejecucion difieren de la ruta Transformers y las mediciones alojadas corresponden a la configuracion empaquetada.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: PyTorch + Transformers con soporte Qwen3Next + Accelerate + PEFT + safetensors; servidor HTTP propio `runtime/serve_windows.py` (Belikewater Flash). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada. Como referencia estructural, el adaptador se apoya en Qwen/Qwen3-Coder-Next como modelo base, pero no se aportan cifras de parametros, contexto ni rendimiento de ese base ni de alternativas en la documentacion disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cybermodels Windows v0.1 (este) | No disponible (adaptador LoRA rango 4 sobre Qwen3-Coder-Next) | No disponible | Exactitud siguiente token 50,86 % / 70,35 % en 8 preguntas | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3-Coder-Next (base) | No disponible | No disponible | 46,86 % / 68,19 % en la misma evaluacion | No disponible en esta ficha | Hugging Face |
| Alternativas especializadas en Windows | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Corpus muy reducido: 37 preguntas, 13 documentos de entrenamiento y 8 preguntas de evaluacion; la model card reconoce que la muestra pequena deja abierta la calidad general de las respuestas sobre Windows.
- Cobertura tematica limitada: solo cubre temas seleccionados de planificacion, procesos, memoria, sincronizacion y E/S de Windows.
- Solo ingles: el idioma declarado es `en`; no hay soporte multilingue documentado.
- Riesgo de alucinacion y de citas inexactas: la model card advierte que en una prueba de generacion libre el modelo puso entre comillas una parafrasis de Hyperion Gray; deben verificarse las citas literales contra la pagina original de Microsoft Learn.
- Tres preguntas del corpus piden hechos especificos de maquina que la documentacion estatica no puede establecer, lo que puede inducir respuestas no verificables.
- Generacion completa en BF16 no probada: la model card indica que "full BF16 text generation remains untested"; solo se valido numericamente la actualizacion de la cabeza de salida sobre la arquitectura Transformers upstream.
- Diferencias entre rutas de ejecucion: la ruta Transformers (BF16) y la alojada (MXFP4 empaquetado) no son equivalentes en cuantizacion ni en ejecucion; las mediciones alojadas no se trasladan automaticamente a la ruta publica.
- Dependencia del indice offline: la calidad de las respuestas con recuperacion depende del indice SQLite FTS5 y de los 17 articulos fijados; no hay actualizacion automatica de la documentacion.
- Licencia Apache 2.0: permite uso comercial, pero debe revisarse `NOTICE.md` para las atribuciones de pesos, datos de entrenamiento, contenido de referencia y software.
- Modelo practicamente sin adopcion: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HyperionGrayAI/cybermodels-windows
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-Next
- ClusterFK (acceso al modelo alojado): https://clusterfk.hgws.sh
- Microsoft Learn - ThreadState: https://learn.microsoft.com/en-us/dotnet/api/system.diagnostics.threadstate
- Microsoft Learn - Event Objects: https://learn.microsoft.com/en-us/windows/win32/sync/event-objects

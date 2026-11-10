# AkiPolaris777/live2d-expression-model-gguf

## Resumen

AG99Live Qwen3.5-2B GGUF es un ajuste fino del modelo base Qwen/Qwen3.5-2B-Base, publicado por el usuario AkiPolaris777, especializado en la generacion de secuencias continuas de movimiento para avatares Live2D y VTube Studio (VTS). El modelo no es un asistente conversacional general: su funcion es transformar un segmento de habla (texto) y un estado de tendencia en una secuencia de pasos de animacion con valores numericos concretos sobre ejes faciales y corporales (yaw de cabeza y cuerpo, sonrisa de ojos, sonrisa de boca, etc.), junto con una duracion objetivo en milisegundos.

El modelo se distribuye exclusivamente en formato GGUF, con tres variantes de cuantizacion (F16, Q8_0 y Q4_K_M) y ficheros Modelfile para su importacion directa en Ollama. Esta pensado para integrarse en el pipeline AG99Live, que requiere un system prompt especifico no incluido en el repositorio. El repositorio tiene 7,1 GB y, en el momento de la consulta, cero descargas y cero likes, lo que indica que es una publicacion muy reciente y sin validacion comunitaria.

Por su tamano (1.881.825.088 parametros, aproximadamente 1,88 mil millones) y su naturaleza de modelo de base ajustado para una tarea estructurada de regresion/JSON, resulta relevante para desarrolladores de VTubing y produccion de avatar en tiempo real que quieran ejecutar localmente la generacion de movimiento sin depender de APIs en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-2B-Base); detalles especificos de atencion no disponibles |
| Parametros totales | 1.881.825.088 (aprox. 1,88 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M |
| Idiomas soportados | no disponible (la model card esta en chino; el ejemplo de habla de entrada tambien) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con Modelfile para Ollama) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint Qwen/Qwen3.5-2B-Base, un transformer decoder-only de aproximadamente 1,88 mil millones de parametros. La model card no documenta la arquitectura interna del modelo base (tipo de atencion, uso de RoPE, GQA, etc.), por lo que esos detalles deben consultarse en la ficha del modelo base. Tampoco se especifica si el ajuste se realizo mediante SFT, LoRA fusionado u otra tecnica; el autor solo indica que se trata de un "modelo fusionado" (merged) y de sus versiones cuantizadas.

No hay informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas como decodificacion especulativa. El autor afirma explicitamente que el repositorio no contiene los datos de entrenamiento. La tarea aprendida es una transformacion estructurada: dado un JSON de entrada con `segment.actions`, `segment.speech`, `segment.tendency` y `user`, el modelo emite un JSON con `duration_hint_ms` (320-15000 ms) y una lista de `motion_steps`, cada uno con `axis_values` (valores continuos por eje) y `duration_weight` (entero de 1 a 3). Los identificadores y rangos validos de ejes dependen de la definicion de capacidades de AG99Live, no del modelo.

## Capacidades

- Generacion de secuencias de animacion facial y corporal para Live2D/VTS en formato JSON estructurado.
- Salida con valores continuos por eje (`head_yaw`, `body_yaw`, `eye_smile_left`, `eye_smile_right`, `mouth_smile`, entre otros definidos por AG99Live).
- Control de duracion: `duration_hint_ms` entre 320 y 15000 ms y pesos de duracion por paso (`duration_weight` de 1 a 3).
- Procesamiento de habla en texto como senal de entrada para sincronizar la expresion con el contenido verbal.
- Soporte de un campo de tendencia (`tendency`) para modular el comportamiento generado.
- Ejecucion local via Ollama y llama.cpp gracias al formato GGUF y a los Modelfiles incluidos.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags del repositorio).
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- VTubing en directo: el modelo recibe el texto que el streamer va a pronunciar y devuelve una secuencia de pasos de movimiento que el rig Live2D reproduce durante la locucion, evitando animaciones estaticas y reduciendo el trabajo manual de keyframing en tiempo real.
- Previsualizacion de guiones: dado un guion de dialogo, generar por lotes las secuencias de movimiento asociadas a cada frase para revisar la expresividad antes de un directo o de una grabacion.
- Integracion en AG99Live: el modelo se conecta al pipeline AG99Live aportando el system prompt propietario y consumiendo la salida JSON directamente, sin postprocesado adicional.
- Produccion de video pregrabado: generar animaciones sincronizadas con una pista de voz ya transcrita, usando `duration_hint_ms` para alinear la duracion de cada gesto con el audio.
- Prototipado de rigs: validar la respuesta de un nuevo conjunto de ejes y rangos modificando la definicion de capacidades de AG99Live y observando las salidas del modelo.
- Despliegue en hardware modesto: al ser un modelo de 1,88 B en Q4_K_M, puede ejecutarse en equipos consumer para herramientas de creacion de contenido sin GPU de datacenter.
- Automatizacion de expresiones para asistentes virtuales: generar microexpresiones coherentes con el texto de respuesta de un chatbot encarnado en un avatar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (MMLU, HumanEval, GSM8K ni metricas especificas de la tarea de animacion) ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,8 GB en F16, unos 2 GB en Q8_0 y en torno a 1,2-1,5 GB en Q4_K_M (estimacion a partir del numero de parametros; no confirmada por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM para Q4_K_M; RTX 3060, RTX 4060, RTX 4090 o superiores para margen holgado y mayor velocidad.
- Cabe en GPU consumer: si, en la mayoria de tarjetas graficas modernas con 4 GB o mas de VRAM en la variante Q4_K_M.
- Opciones de despliegue: Ollama (Modelfiles incluidos), llama.cpp y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles. Al ser un modelo pequeno y con salidas JSON cortas, la latencia deberia ser baja, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| AG99Live Qwen3.5-2B GGUF | 1,88 B | no disponible | Generacion de movimiento Live2D/VTS | Apache 2.0 | GGUF |
| Qwen/Qwen3.5-2B-Base | 1,88 B | no disponible | Modelo base generalista | Apache 2.0 | safetensors |
| Alternativas especializadas en animacion de avatar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables especializados en generacion de movimiento para Live2D/VTS. La comparacion mas directa es con el modelo base Qwen3.5-2B-Base, del que hereda arquitectura y licencia pero no la especializacion en la tarea.

## Limitaciones y advertencias

- Modelo de nicho: solo es util con el system prompt y la definicion de ejes de AG99Live, que no se incluyen en el repositorio.
- Sin datos de entrenamiento publicados: no es posible auditar sesgos, calidad del dataset ni cobertura de casos.
- Riesgo de alucinacion estructural: puede emitir IDs de eje no validos o valores fuera de rango si el system prompt no restringe adecuadamente la salida.
- Idiomas no declarados: la model card esta en chino y el ejemplo de habla tambien; el comportamiento multilingue no esta verificado.
- Contexto no documentado: se desconoce la ventana maxima, lo que limita el diseno de entradas largas.
- Sin validacion comunitaria: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en produccion.
- Licencia Apache 2.0: permite uso comercial, pero el autor aclara que Qwen y Alibaba no respaldan el proyecto; conviene revisar `LICENSE` y `NOTICE` del repositorio.
- Dependencia de un tercero: la validez de los ejes y rangos depende de la implementacion de AG99Live, no del modelo, por lo que cambios en esa plataforma pueden romper la integracion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AkiPolaris777/live2d-expression-model-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Ollama: https://ollama.com
- llama.cpp: https://github.com/ggml-org/llama.cpp

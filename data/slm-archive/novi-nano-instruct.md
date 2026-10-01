# SLM-Archive/Novi-Nano-Instruct

## Resumen

Novi-Nano-Instruct es un modelo de lenguaje causal de tipo decoder-only, extremadamente pequeno, desarrollado por Novi-AI (publicado en el Hub bajo el espacio SLM-Archive). Con 1.258.848 parametros (aproximadamente 1,26 millones) y una ventana de contexto de 256 tokens, es un ejercicio de ajuste por instrucciones a escala minima: parte de Novi-Nano-Base y se afina sobre un conjunto de solo 500 ejemplos de entrenamiento y 10 de validacion.

El modelo sigue una arquitectura estilo GPT-2 (4 capas, 4 cabezas de atencion, embedding de 96 dimensiones y FFN de 384) con un tokenizador propio de 8.195 tokens, al que se anadieron los dos tokens especiales del formato ChatML (`<|im_start|>` y `<|im_end|>`). Su relevancia es fundamentalmente didactica y experimental: sirve para estudiar el ciclo completo de entrenamiento (tokenizacion, preentrenamiento, ajuste por instrucciones, evaluacion) sin necesidad de infraestructura de GPU, ya que el entrenamiento completo se ejecuto en CPU en aproximadamente 32 segundos.

No pretende competir con modelos de miles de millones de parametros. El propio autor lo describe como un modelo de investigacion y experimentacion cuyo objetivo es explorar el seguimiento de instrucciones y el comportamiento conversacional a una escala extrema. Los resultados de validacion publicados (perdida de 5,1537 y perplejidad de 173,065) confirman que la calidad de generacion es todavia muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (estilo GPT-2) |
| Parametros totales | 1.258.848 (aproximadamente 1,26 M) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | No disponible; pesos publicados en F32. No se han publicado variantes GGUF, int8 ni int4 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 segun la model card del autor; el campo de licencia del repositorio en HuggingFace figura como no disponible |
| Formato de pesos | safetensors (tensor F32) |
| Tamano de vocabulario | 8.195 tokens |
| Dimensión de embedding | 96 |
| Numero de capas | 4 |
| Cabezas de atencion | 4 |
| Tamano de la FFN | 384 |
| Modelo base | Novi-AI/Novi-Nano-Base |
| Tamano del repositorio | 0,0 GB (segun HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal clasico de tipo decoder-only, con 4 capas, 4 cabezas de atencion, una dimension de embedding de 96 y una red feed-forward de 384 unidades. La secuencia maxima es de 256 tokens y la precision de entrenamiento es FP32. El tokenizador es propio del proyecto Novi-Nano, con un vocabulario original de 8.192 tokens entrenado con datos de FineWeb-Edu, FineWeb-HQ y SmolLM-Cosmopedia; para el ajuste por instrucciones se anadieron dos tokens de ChatML (`<|im_start|>`, id 8193, y `<|im_end|>`, id 8194), dejando el vocabulario final en 8.195 tokens.

El ajuste por instrucciones se realizo sobre el modelo base con 500 ejemplos de entrenamiento y 10 de validacion (dataset Novi-AI/Novi-510x). La configuracion fue de 5 epocas, batch size 16, acumulacion de gradiente 2 (batch efectivo 32), longitud maxima de secuencia 256, learning rate 2e-5 y precision FP32, todo sobre CPU. La perdida se calculo unicamente sobre las respuestas del asistente, de modo que el modelo aprende a responder a las instrucciones del usuario y no a reproducir el prompt. No se documenta el uso de RLHF, DPO ni decodificacion especulativa; tampoco se detalla el numero de tokens totales vistos durante el preentrenamiento del modelo base.

## Capacidades

- Generacion de texto autoregresiva basica en ingles.
- Seguimiento de instrucciones a nivel muy elemental, aprendido de 500 ejemplos.
- Formato conversacional ChatML con roles `system`, `user` y `assistant`, soportado por `apply_chat_template`.
- Conversaciones de un solo turno o muy cortas dentro de la ventana de 256 tokens.
- Inferencia local en CPU sin GPU, con un coste de memoria inferior a 10 MB.
- Punto de partida reproducible para experimentos de ajuste por instrucciones a escala minima.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No dispone de capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).
- Capacidad multilingue practicamente inexistente: solo ingles.

## Casos de uso

- Docencia y formacion en IA: permite mostrar de principio a fin el pipeline de un modelo causal (tokenizacion, preentrenamiento, ajuste por instrucciones y evaluacion) en una sola sesion de clase, ya que el entrenamiento completo tarda unos 32 segundos en CPU.
- Pruebas de integracion en CI/CD: al ocupar menos de 10 MB, puede usarse como modelo de humo (smoke test) para verificar que un pipeline de `transformers`, TGI o vLLM carga pesos, aplica plantillas de chat y devuelve tokens sin consumir recursos de GPU.
- Validacion de plantillas de chat y tokenizadores: util para comprobar que una plantilla ChatML con `system`, `user` y `assistant` se serializa y deserializa correctamente antes de aplicarla a modelos mayores.
- Investigacion sobre ajuste por instrucciones a escala minima: sirve como linea base para estudiar como varia el seguimiento de instrucciones al reducir el numero de ejemplos de 500 a 50, 5.000 o 50.000.
- Despliegue en dispositivos embebidos y microcontroladores: con menos de 3 MB en FP16 y 1,3 MB en int8, es viable en placas tipo Raspberry Pi, ESP32 con memoria suficiente o entornos de inferencia de borde con restricciones severas de RAM.
- Reproducibilidad y auditoria: al publicarse pesos en safetensors y una configuracion de entrenamiento completa, permite reproducir el resultado y medir la varianza entre semillas o entre ejecuciones.
- Experimentos de destilacion o inicializacion: puede actuar como modelo alumno en ejercicios de destilacion desde un modelo mayor o como inicializacion de bajo coste para arquitecturas diminutas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Las unicas metricas publicadas son las de validacion del propio entrenamiento:

| Metrica | Resultado |
|---|---|
| Perdida final de validacion | 5,153667 |
| Perplejidad final de validacion | 173,0650 |
| Ejemplos de entrenamiento | 500 |
| Ejemplos de validacion | 10 |
| Tiempo de entrenamiento | Aproximadamente 32 segundos (CPU) |

El propio autor advierte que, al contener solo 10 ejemplos, estas metricas deben considerarse experimentales y no constituyen una evaluacion exhaustiva.

## Requisitos de hardware

- VRAM para inferencia en FP32: aproximadamente 5 MB de pesos, mas activaciones y cache KV, en total por debajo de 20 MB.
- VRAM para inferencia en FP16: aproximadamente 2,5 MB de pesos.
- VRAM para inferencia en int8: aproximadamente 1,3 MB (requiere cuantizacion propia, no publicada).
- GPU recomendadas: ninguna en particular; el modelo cabe en cualquier GPU, incluidas GTX 1050, RTX 3060, RTX 4090, A100 y H100, aunque estan sobredimensionadas para su tamano.
- Consumer GPU: si, cabe con enorme holgura en cualquier GPU de consumo e incluso en iGPU.
- CPU: es el dispositivo utilizado durante el entrenamiento; la inferencia es perfectamente viable en CPU, incluidos portatiles y placas de bajo consumo.
- Opciones de despliegue: `transformers` (soporte nativo), Text Generation Inference (TGI, etiqueta `text-generation-inference` presente en el repositorio) y endpoints compatibles. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, conversion que no se ha publicado.
- Latencia y throughput estimados: no disponible. Solo se conoce el tiempo de entrenamiento (aproximadamente 32 segundos para 500 ejemplos x 5 epocas en CPU), que no es extrapolable directamente a la latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Novi-Nano-Instruct | 1,26 M | 256 | Apache 2.0 (segun model card) | Pesos en safetensors en HuggingFace |
| SmolLM2-135M | 135 M | 8.192 | Apache 2.0 | Pesos e instruct en HuggingFace |
| Qwen2.5-0.5B-Instruct | 0,49 B | 32.768 | Apache 2.0 | Pesos en HuggingFace |
| TinyStories-1M | Aproximadamente 1 M | No disponible | No disponible | Pesos en HuggingFace |

La comparacion con SmolLM2-135M y Qwen2.5-0.5B-Instruct ilustra la diferencia de escala: ambos superan a Novi-Nano-Instruct en dos o tres ordenes de magnitud en parametros y en mas de un orden de magnitud en contexto. TinyStories-1M es el unico comparable en tamano, pero esta orientado a generar cuentos infantiles y no a seguir instrucciones. No se dispone de datos de rendimiento comparativos publicados para Novi-Nano-Instruct.

## Limitaciones y advertencias

- Modelo puramente experimental: el autor lo describe explicitamente como no apto para produccion.
- Riesgo alto de generar texto incoherente, repetir frases o producir respuestas sin relacion con la instruccion.
- Puede fallar sistematicamente en el seguimiento de instrucciones, incluso en tareas triviales.
- Errores factuales y alucinaciones muy probables: el conocimiento del mundo es practicamente nulo con 1,26 M de parametros y 500 ejemplos de ajuste.
- Rendimiento muy pobre en tareas de razonamiento y matematicas.
- Ventana de contexto de solo 256 tokens: pierde el contexto en conversaciones de mas de unos pocos turnos.
- Solo entrenado en ingles; no se documenta soporte de otros idiomas, incluido el castellano.
- Perplejidad de validacion de 173,07, lo que indica una distribucion de salida muy alejada de texto fluido.
- Perdida calculada solo sobre las respuestas del asistente: fuera de la plantilla ChatML el comportamiento puede degradarse.
- Sesgos: no se ha publicado ninguna evaluacion de sesgos, toxicidad o alineacion.
- Licencia: la model card indica Apache 2.0, pero el campo de licencia del repositorio en HuggingFace figura como no disponible; conviene verificar la licencia antes de cualquier uso comercial.
- Sin cuantizaciones publicadas: para desplegarlo en llama.cpp u Ollama hay que convertir los pesos manualmente.
- Comunidad practicamente inexistente: 0 descargas y 0 likes en el momento de la consulta, sin garantia de mantenimiento.
- Discrepancia de identificador: el repositorio se consulta como `SLM-Archive/Novi-Nano-Instruct`, mientras que la model card y los ejemplos de codigo hacen referencia a `Novi-AI/Novi-Nano-Instruct`; hay que comprobar cual es la ruta vigente.

## Enlaces

- HuggingFace (ruta consultada): https://huggingface.co/SLM-Archive/Novi-Nano-Instruct
- HuggingFace (ruta indicada en la model card): https://huggingface.co/Novi-AI/Novi-Nano-Instruct
- Modelo base: https://huggingface.co/Novi-AI/Novi-Nano-Base
- Dataset de ajuste por instrucciones: https://huggingface.co/datasets/Novi-AI/Novi-510x
- FineWeb (dataset usado para el tokenizador): https://huggingface.co/datasets/HuggingFaceFW/fineweb
- SmolLM / Cosmopedia (datasets usados para el tokenizador): https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces obtenidos correspondian a entidades no relacionadas (perfumeria, mutuas y articulos genericos sobre modelos de lenguaje pequenos) y no se incluyen.

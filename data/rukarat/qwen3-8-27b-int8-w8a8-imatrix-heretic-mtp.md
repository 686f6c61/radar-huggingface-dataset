# RukaRat/Qwen3.8-27B-INT8-W8A8-imatrix-heretic-MTP

## Resumen

RukaRat/Qwen3.8-27B-INT8-W8A8-imatrix-heretic-MTP es una cuantizacion en INT8 (esquema W8A8) del modelo multimodal Qwen/Qwen3.8-27B, publicada por el usuario RukaRat, a la que se ha aplicado previamente un proceso de «abliteracion» (eliminacion del entrenamiento de seguridad) mediante la herramienta Heretic 1.4.0 antes de cuantizar. El resultado es un checkpoint de 27.360.627.952 parametros (29,1 GiB, 1.599 tensores: 400 en INT8 y 1.199 en BF16) con licencia Apache 2.0 y pesos en safetensors, orientado a despliegue con transformers, vLLM y SGLang.

El modelo resuelve dos problemas concretos: por un lado, reducir el peso del modelo base a un formato INT8 W8A8 calibrado con imatrix para servirlo con dos GPU de 24 GB en paralelo (tensor parallelism 2); por otro, ofrecer una variante sin filtros de rechazo, pensada para entornos controlados donde el operador asume la responsabilidad del contenido generado. Mantiene el soporte multimodal (pipeline image-text-to-text) y la decodificacion especulativa mediante MTP (multi-token prediction), con una tasa de aceptacion del 91,0 % en generacion de codigo.

Es relevante ahora porque las variantes cuantizadas de la familia Qwen 3.8 permiten ejecutar un modelo de ~27B con ventana larga en hardware de gama alta de consumo (2x RTX 3090), algo que el checkpoint BF16 original no permite. No obstante, conviene senalar que el repositorio no tiene descargas ni valoraciones y que todas las metricas publicadas proceden del banco de pruebas del propio autor, no de una evaluacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (etiqueta de familia `qwen3_5`), con MTP para decodificacion especulativa |
| Parametros totales | 27.360.627.952 |
| Parametros activos | no disponible (no se especifica si la arquitectura es MoE) |
| Longitud de contexto | 286.720 tokens medidos en las pruebas del autor (caché KV en GPU de 292.601 tokens a esa longitud); la model card no declara formalmente la ventana soportada |
| Tipos de cuantizacion | INT8 W8A8 con calibracion imatrix (400 tensores INT8, 1.199 tensores BF16); formato compressed-tensors generado con llmcompressor |
| Idiomas soportados | no disponible (la model card no declara listado de idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 31,3 GB (checkpoint de 29,1 GiB) |
| Libreria declarada | transformers |
| Pipeline | image-text-to-text |
| Modelo base | Qwen/Qwen3.8-27B (relacion: quantized) |
| Motores soportados | vLLM y SGLang |
| Fecha de publicacion | 2026-09-19 |

## Arquitectura y entrenamiento

La ficha no describe la arquitectura interna mas alla de la etiqueta de familia `qwen3_5` y de la naturaleza multimodal del modelo base (entrada de imagen y texto). Lo que si queda documentado es el proceso de construccion: se parte del checkpoint BF16 de Qwen/Qwen3.8-27B, se le fusiona una LoRA de abliteracion generada con Heretic 1.4.0 y despues se ejecuta la cuantizacion `oneshot` de llmcompressor con el mismo corpus de calibracion, la misma receta y la misma lista de exclusion que la version no abliterada. Los recuentos de tensores son identicos entre ambas variantes (1.599), porque fusionar una LoRA solo modifica valores de pesos, no la topologia.

La abliteracion se realizo con el metodo por defecto de Heretic 1.4.0 (MPOA, projected abliteration), con los conjuntos de prompts por defecto (`mlabonne/harmful_behaviors` frente a `mlabonne/harmless_alpaca`) y una busqueda Optuna de 200 pruebas; la variante seleccionada fue la prueba 191, con 19 rechazos de 100 a un KL de 0,0621 en el momento de la busqueda. La abliteracion solo toca `down_proj`, `o_proj` y `out_proj`, por lo que la configuracion de servicio y muestreo no cambia respecto al build original. El autor advierte que la cifra de la busqueda no predice el comportamiento en despliegue, ya que Heretic puntua sobre una copia en 4 bits de bitsandbytes con el modo thinking desactivado, de modo que las metricas relevantes son las medidas sobre este checkpoint con la pila real.

## Capacidades

- Generacion de texto conversacional multi-turno, con soporte de contexto largo (benchmarks ejecutados a 286.720 tokens).
- Razonamiento con modo thinking: el autor mide decodificacion de 59,2 tok/s en generaciones de pensamiento de 6.000 tokens, y cero generaciones de pensamiento inacabadas en 90 muestras.
- Generacion de codigo: 95,0 tok/s de decodificacion en tareas de codigo y una tasa de aceptacion MTP del 91,0 % en ese dominio.
- Decodificacion especulativa mediante MTP (multi-token prediction): aceptacion global del 58,2 %, con 40,8 % en modo thinking.
- Capacidades multimodales de entrada imagen-texto (heredadas del modelo base); el autor reporta 2/2 en sus pruebas de vision.
- Capacidades de extraccion de informacion estructurada: la tarea de extraccion obtiene 38/40, la mejor puntuacion de todos los builds de la familia.
- Capacidades de reconocimiento de entidades nombradas (NER): 28/40, con fallos por sobreextraccion.
- Sin filtro de rechazo: 0 % de rechazos ante prompts daninos con thinking desactivado (0/60) y 3,3 % con thinking activado (1/30).
- Tool calling / function calling: no disponible (no se menciona en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita, aunque el modo thinking y el contexto largo son la base tecnica habitual para ello.

## Casos de uso

- Investigacion sobre alineacion y abliteracion: el modelo permite comparar directamente el comportamiento de un checkpoint con y sin entrenamiento de seguridad (96 % de rechazos en el original frente a 0 % en este) sobre el mismo banco de pruebas, sirviendo como material de estudio de tecnicas de edicion de pesos.
- Red teaming controlado y evaluacion de robustez: al no incluir filtros de rechazo, es util para generar respuestas que un modelo alineado bloquea, siempre dentro de un entorno aislado y con supervision del operador.
- Extraccion de informacion estructurada en documentos largos: con 38/40 en la tarea de extraccion del banco del autor y contexto de cientos de miles de tokens, encaja en pipelines que convierten contratos o informes extensos en JSON.
- Procesamiento de documentos con componente visual: al mantener el pipeline image-text-to-text, puede procesar PDF escaneados o capturas donde el texto relevante esta en imagen.
- Asistencia de codigo en local: los 95,0 tok/s de decodificacion en tareas de codigo sobre 2x RTX 3090 lo hacen viable como asistente autohospedado en un equipo con dos GPU de 24 GB.
- Analisis de conversaciones de contexto muy largo: la ventana de 286.720 tokens medida permite resumir o auditar hilos completos de soporte o incidencias sin trocear el historial.
- Generacion de contenido sin restricciones editoriales: para ficcion, guiones o material creativo donde los rechazos del modelo base resultan un obstaculo, con la advertencia de que no existe ninguna barrera tecnica entre la peticion y la respuesta.

## Benchmarks y rendimiento

Todos los datos proceden del banco de pruebas del propio autor, medido sobre este checkpoint con TP=2 en 2x RTX 3090, y comparado con el build INT8 W8A8 sin abliterar.

| Metrica | Este modelo | W8A8 sin abliterar |
|---|---:|---:|
| Respuestas correctas sobre ground truth (de 160) | 130 | 132 |
| Decodificacion en tareas de codigo (tok/s) | 95,0 | 96,2 |
| Decodificacion en thinking de 6k (tok/s) | 59,2 | 59,3 |
| Throughput de replay (tok/s) | 47,3 | 47,6 |
| Aceptacion MTP en codigo | 91,0 % | 92,2 % |
| Aceptacion MTP en thinking | 40,8 % | 40,2 % |
| Aceptacion MTP global | 58,2 % | no medido |
| Pruebas de vision | 2/2 | 2/2 |
| Caché KV en GPU a 286.720 de contexto | 292.601 | 294.071 |
| NER (de 40) | 28 | 33-35 en el resto de builds |
| Extraccion (de 40) | 38 | no disponible de forma aislada |

Tasas de rechazo medidas con comprobacion por palabras clave (unos 30 marcadores tipo «I cannot», «I'm sorry»), no con un juez automatico ni con una revision de red team:

| Escenario | Este modelo | W8A8 sin abliterar |
|---|---:|---:|
| Prompts daninos, thinking desactivado | 0 % (0/60) | 96 % |
| Prompts daninos, thinking activado | 3,3 % (1/30) | 94 % |
| Prompts benignos rechazados, thinking desactivado | 0 % (0/60) | 82 % |
| Prompts benignos rechazados, thinking activado | 0 % (0/30) | 20 % |

El autor advierte que la diferencia de 130 frente a 132 esta dentro del margen de ruido que midio al repetir un build sin cambios (±2 elementos) y que la caida de NER (28/40 frente a 33-35) se debe a sobreextraccion consistente: anade gentilicios adjetivales como localizaciones, promueve ocasionalmente una localizacion a organizacion y en una ocasion emitio una entidad duplicada. La puntuacion NER se calcula por igualdad exacta de JSON, por lo que una entidad extra falla el item completo.

## Requisitos de hardware

- VRAM para inferencia: el checkpoint pesa 29,1 GiB y no cabe en una sola GPU de 24 GB, en ninguno de los dos motores. El autor recomienda dos tarjetas de 24 GB con tensor parallelism 2.
- GPU validadas por el autor: 2x RTX 3090 en configuracion TP=2.
- GPU no validadas pero compatibles por VRAM: cualquier par de tarjetas cuyo total supere los 29,1 GiB mas el espacio de caché KV (por ejemplo, 2x RTX 4090, A6000, L40S). No hay mediciones publicadas en la informacion disponible.
- Cabe en GPU de consumo: si, unicamente con dos tarjetas de 24 GB. En una sola tarjeta de 24 GB no arranca.
- Presupuesto de caché KV: 292.601 tokens de caché en GPU a 286.720 de contexto, lo que anade una demanda de memoria muy alta cuando se usa la ventana completa.
- Opciones de despliegue: vLLM y SGLang. El autor indica que los builds con cabeza INT8 y anchura de bits mixta no funcionan en SGLang; este build, al no ser de ese tipo, si es compatible con ambos.
- Alternativas para una sola tarjeta: las variantes W4A16 de la misma familia, que arrancan en una GPU de 24 GB en vLLM con 55.000 o 20.000 tokens de contexto segun el build.
- Latencia y throughput medidos (TP=2, 2x RTX 3090): 95,0 tok/s en codigo, 59,2 tok/s en thinking de 6k y 47,3 tok/s en replay.

## Comparativa con modelos similares

Comparacion dentro de la misma familia publicada por el autor, todos medidos en la misma maquina (2x RTX 3090). Todos comparten arquitectura, licencia Apache 2.0 y soporte multimodal.

| Modelo | Tamano | Abliterado | Contexto con 1 GPU (vLLM) | Calidad /160 | Codigo (tok/s) |
|---|---:|---|---:|---:|---:|
| Qwen3.8-27B INT8 W8A8 imatrix | 29,1 GiB | no | no cabe | 132 | 96,2 |
| Este modelo (INT8 W8A8 heretic MTP) | 29,1 GiB | si | no cabe | 130 | 95,0 |
| Qwen3.8-27B W4A16 + cabeza INT8 | 16,6 GiB | no | 55.000 | 131 | 89,9 |
| Qwen3.8-27B W4A16 + cabeza INT8 heretic | 16,6 GiB | si | 55.000 | 134 | 88,7 |
| Qwen3.8-27B W4A16 abliterado | 18,1 GiB | si | 20.000 | 135 | 66,6 |

El propio autor senala que el rango de calidad 130-135 sobre 160 es un empate estadistico, ya que repetir un build sin cambios desplazo la puntuacion dos puntos. Qwen/Qwen3.8-27B en BF16 seria la referencia natural sin cuantizar, pero no hay datos de tamano en disco, VRAM ni rendimiento en la informacion disponible. No se dispone de comparaciones con modelos de otros fabricantes del mismo orden de parametros.

## Limitaciones y advertencias

- Entrenamiento de seguridad eliminado: el modelo cumple peticiones que el modelo base rechaza y no existe ningun filtro por palabras clave entre la peticion y la respuesta. Nada en su construccion impide generar contenido danino si se le pide.
- No debe desplegarse en un punto accesible a usuarios no confiables o sin supervision directa, segun la propia advertencia del autor.
- Las tasas de rechazo se midieron con una comprobacion de unos 30 marcadores de frase, no con un juez automatico ni con una auditoria de seguridad; deben leerse como «ya no dice que no», no como una evaluacion de la peligrosidad de las salidas.
- Degradacion en NER: 28/40 frente a 33-35 en el resto de builds, por sobreextraccion (gentilicios tratados como lugares, promocion de ubicaciones a organizaciones, una entidad duplicada). El autor no tiene una explicacion clara y recomienda evaluar especificamente la extraccion estructurada antes de adoptar este build.
- Herramienta de medicion no representativa en origen: Heretic puntua sobre una copia en 4 bits de bitsandbytes con thinking desactivado, que no es la configuracion de servicio final.
- La abliteracion solo modifica `down_proj`, `o_proj` y `out_proj`, de modo que los pesos cuantizados de otras capas son los del modelo original; la calidad global se mantiene dentro del ruido (±2 items sobre 160).
- No cabe en una sola GPU de 24 GB, en ningun motor, lo que limita el despliegue a configuraciones de dos tarjetas o a las variantes W4A16.
- El uso de la ventana completa (286.720 tokens) consume 292.601 tokens de caché KV, un coste de memoria que en la practica reduce el contexto util disponible.
- Licencia Apache 2.0: permite uso comercial, pero la licencia no exime de responsabilidad por el contenido generado sin filtros de seguridad.
- Repositorio sin traccion: 0 descargas y 0 valoraciones en el momento de la consulta, y todas las metricas son del banco de pruebas del autor, sin verificacion independiente.
- Idiomas soportados no declarados en la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RukaRat/Qwen3.8-27B-INT8-W8A8-imatrix-heretic-MTP
- Build base sin abliterar (INT8 W8A8 imatrix MTP): https://huggingface.co/RukaRat/Qwen3.8-27B-INT8-W8A8-imatrix-MTP
- Build W4A16 con cabeza INT8: https://huggingface.co/RukaRat/Qwen3.8-27B-W4A16-imatrix-int8head-MTP
- Build W4A16 con cabeza INT8 abliterado: https://huggingface.co/RukaRat/Qwen3.8-27B-W4A16-imatrix-heretic-int8head-MTP
- Build W4A16 abliterado: https://huggingface.co/RukaRat/Qwen3.8-27B-W4A16-imatrix-heretic-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Heretic (herramienta de abliteracion): https://github.com/p-e-w/heretic
- Dataset de prompts daninos usado en la abliteracion: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Dataset de prompts benignos usado en la abliteracion: https://huggingface.co/datasets/mlabonne/harmless_alpaca
- Dataset OR-Bench-Hard-1K (evaluacion de rechazos en prompts benignos): https://huggingface.co/datasets/bench-llm/or-bench
- Documentacion de compressed-tensors: no disponible en los resultados de busqueda
- Repositorio de llmcompressor: no disponible en los resultados de busqueda

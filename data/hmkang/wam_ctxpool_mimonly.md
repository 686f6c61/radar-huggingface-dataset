# hmkang/wam_ctxpool_mimonly

## Resumen

WAM (`hmkang/wam_ctxpool_mimonly`) es un world model de video orientado a robotica, construido sobre el backbone de difusion Wan2.2 TI2V-5B y equipado con una cabeza de accion DiT-B (esquema que el autor denomina DiT4DiT). El modelo aprende a predecir la dinamica de escenas de manipulacion del entorno simulado RoboCasa-300 y a producir acciones asociadas, actuando como estudiante V2V dentro de un pipeline de destilacion de representaciones. Lo publica el usuario hmkang y se distribuye bajo licencia Apache 2.0.

La contribucion tecnica del repositorio no es el backbone en si, sino el estudio del *context pooling*: el autor entrena cuatro variantes que difieren en como se agrega el historial de observaciones antes de inyectarlo en el transformer de difusion (sin pooling, atencion cruzada mas FFN en la capa L3, promedio en L3, y una version con historial ampliado hist13). El objetivo es medir como afecta la agregacion de contexto temporal a la calidad de la representacion aprendida con un objetivo iBOT MIM-only, en el que el termino CLS/DINO se desactiva y toda la perdida de representacion recae en el cross-entropy por prototipo a nivel de token.

Es relevante ahora porque los world models para robotica se han convertido en una via central para generar datos sinteticos, planificar mediante rollouts imaginados y preentrenar politicas de manipulacion. Este repositorio publica los pesos de un ablation estudio sobre pooling de contexto con receta de entrenamiento detallada (4 GPU, batch 8 por dispositivo, 100k pasos), lo que permite reproducir y comparar estrategias de agregacion temporal en un entorno estandarizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) de video Wan2.2 TI2V-5B con cabeza de accion DiT-B (DiT4DiT); estudiante V2V |
| Parametros totales | no disponible (el backbone se denomina TI2V-5B, lo que sugiere ~5B en el DiT de video; el tamano de la cabeza DiT-B no se especifica) |
| Longitud de contexto | no disponible en tokens; el autor documenta ventanas de historial de hist9 (nin 17 / nout 33) y hist13 (nin 25 / nout 41) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se documentan recetas de cuantizacion) |
| Idiomas soportados | no disponible (modelo orientado a video y robotica, sin interfaz de lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria declarada: wan2.2) |

Otros datos del repositorio: tamano 99,0 GB, 0 descargas, 0 likes, pipeline `robotics`, creado y actualizado el 19 de septiembre de 2026.

## Arquitectura y entrenamiento

El modelo combina dos componentes: un DiT de video Wan2.2 TI2V-5B, que actua como generador/predictor de fotogramas, y una cabeza de accion DiT-B que produce los vectores de accion. La variante es un estudiante V2V (video-a-video) dentro de un esquema de destilacion: el estudiante aprende la representacion del profesor en lugar de entrenarse solo con la senal generativa. La perdida de representacion es iBOT en modo MIM-only (`WAM_FADISTILL_IBOT_L1=0`): el termino CLS/DINO queda desactivado y el cross-entropy sobre prototipos por token constituye toda la perdida de representacion. Cada clip se procesa con dos extracciones de aumento moderado independientes.

El repositorio publica cuatro carpetas que corresponden a otras tantas configuraciones de pooling de contexto, todas con historial hist9 salvo la ultima: `control_hist9/` (sin pooling), `xattn_ffn_L3_hist9/` (atencion cruzada mas FFN en la capa L3), `avg_L3_hist9/` (promedio en la capa L3) y `xattn_ffn_L3_hist13/` (atencion cruzada mas FFN en L3 con historial hist13, nin 25 / nout 41). La receta de entrenamiento indicada es: 4 GPU con batch de 8 por dispositivo, sin acumulacion de gradientes, 100k pasos y 256 tmosaic con 3 vistas. Los pesos se subieron sobre una rejilla de 20k pasos. No se incluyen el estado del optimizador, el estado del generador de numeros aleatorios ni el planificador de tasa de aprendizaje.

## Capacidades

- Prediccion de video condicionada a acciones en dominios de manipulacion robotica (world model).
- Generacion de acciones mediante la cabeza DiT-B acoplada al backbone de difusion.
- Modelado de historial temporal: las variantes hist9 (17 frames de entrada / 33 de salida) y hist13 (25 / 41) permiten condicionar sobre ventanas de observaciones pasadas.
- Agregacion de contexto configurable: sin pooling, atencion cruzada mas FFN en L3, o promedio en L3.
- Aprendizaje de representaciones auto-supervisado con iBOT MIM-only (prototipos por token), util como preentrenamiento para politicas posteriores.
- Destilacion V2V: el modelo esta pensado para actuar como estudiante que imita a un profesor, no solo para generacion directa.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso en lenguaje natural.
- No se documentan capacidades multilingues.
- No se documentan modos especiales (thinking mode, audio, vision general fuera del dominio de manipulacion).

## Casos de uso

- Investigacion en world models para robotica: el modelo permite estudiar como se comporta un DiT de video de 5B al predecir dinamica de manipulacion en RoboCasa-300, con cuatro configuraciones de pooling comparables entre si sobre la misma receta de entrenamiento.
- Planificacion basada en modelo (model-based RL): usar el world model para generar rollouts imaginados de corto horizonte (33 o 41 frames segun la variante) y evaluar trayectorias de accion sin ejecutarlas en el simulador, reduciendo el coste de muestreo.
- Ablation de agregacion de contexto: las carpetas `control_hist9`, `avg_L3_hist9` y `xattn_ffn_L3_hist9` permiten aislar el efecto del pooling en L3 manteniendo constante el historial; la comparacion con `xattn_ffn_L3_hist13` aisla el efecto de ampliar la ventana temporal.
- Preentrenamiento de politicas de imitacion: la representacion aprendida con iBOT MIM-only puede servir de inicializacion para cabezas de politica en tareas de RoboCasa, aprovechando que la perdida de representacion ya esta alineada con la tarea.
- Destilacion de profesores mas costosos: el modelo es un estudiante V2V, por lo que encaja en pipelines donde un generador grande etiqueta clips y el estudiante aprende a reproducir esa dinamica con menor coste de inferencia.
- Generacion de datos sinteticos de manipulacion: los segmentos de video predichos por el modelo pueden aumentar el conjunto de entrenamiento de politicas cuando la recoleccion real de demostraciones es limitada.
- Evaluacion de robustez a aumentos: dado que cada clip se procesa con dos extracciones de aumento moderado independientes, el modelo es adecuado para estudiar invariancia a perturbaciones visuales en el espacio de representaciones.
- Reproduccion de recetas de entrenamiento a escala media: la configuracion declarada (4 GPU, batch 8 por dispositivo, 100k pasos, sin acumulacion de gradientes) es replicable en laboratorios con un nodo de 4 GPU, lo que facilita la verificacion independiente de resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exito en tareas de RoboCasa, tasas de exito de politica, FVD, PSNR ni comparaciones numericas entre las cuatro variantes de pooling. Tampoco se proporcionan cifras de latencia o throughput.

## Requisitos de hardware

- El repositorio ocupa 99,0 GB en total, distribuidos en cuatro carpetas de checkpoints (aproximadamente 25 GB por variante); conviene descargar solo la carpeta de la configuracion que se vaya a evaluar.
- VRAM de inferencia: no confirmada por el autor. Como estimacion a partir de un backbone de ~5B parametros, los pesos en bf16 ocuparian alrededor de 10-11 GB, a lo que hay que sumar el VAE de video, los latentes temporales y las activaciones de las ventanas de 33 o 41 frames; en la practica es razonable planificar 24 GB o mas por GPU.
- GPU recomendadas: A100 40 GB u 80 GB y H100 para entrenamiento o inferencia sin restricciones; en consumer, una RTX 3090 o RTX 4090 de 24 GB podria bastar con precision reducida y descarga parcial a CPU, aunque no hay confirmacion del autor.
- Entrenamiento documentado: 4 GPU con 8 muestras por dispositivo y sin acumulacion de gradientes durante 100k pasos. No se especifica el modelo exacto de GPU empleado.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo de lenguaje. La libreria declarada es `wan2.2` y los pesos estan en safetensors, por lo que la carga requiere el codigo de Wan y definiciones de checkpoint del propio repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada. La comparacion posible se limita a las cuatro variantes publicadas dentro del propio repositorio y al backbone base:

| Variante | Pooling | Historial (nin / nout) | Parametros | Licencia |
|---|---|---|---|---|
| `control_hist9` | ninguno | 17 / 33 | no disponible | Apache 2.0 |
| `avg_L3_hist9` | promedio en L3 | 17 / 33 | no disponible | Apache 2.0 |
| `xattn_ffn_L3_hist9` | atencion cruzada + FFN en L3 | 17 / 33 | no disponible | Apache 2.0 |
| `xattn_ffn_L3_hist13` | atencion cruzada + FFN en L3 | 25 / 41 | no disponible | Apache 2.0 |
| Wan2.2 TI2V-5B (base) | no aplica | no aplica | ~5B (segun denominacion) | Apache 2.0 |

Comparativas externas con otros world models de robotica: no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No se publican benchmarks ni tasas de exito, por lo que no es posible validar la calidad de las predicciones ni comparar objetivamente las variantes de pooling.
- El checkpoint no incluye estado del optimizador, generador de numeros aleatorios ni planificador de tasa de aprendizaje, de modo que no se puede reanudar el entrenamiento en el punto exacto de publicacion.
- Los pesos se subieron en una rejilla de 20k pasos, lo que implica granularidad gruesa: no hay checkpoints intermedios finos para estudiar la evolucion del entrenamiento.
- El modelo esta entrenado exclusivamente en RoboCasa-300, entorno simulado; no hay evidencia de transferencia a robots reales ni a otros simuladores.
- Riesgo de deriva acumulada en rollouts largos, inherente a los world models: los errores de prediccion se retroalimentan y degradan la coherencia al superar la ventana de salida de 33 o 41 frames.
- Sesgos conocidos: no documentados. Al entrenarse en un unico benchmark simulado, cabe esperar un sesgo hacia la distribucion de tareas, objetos y camaras de RoboCasa-300.
- Idiomas: no aplica; no hay interfaz de lenguaje natural ni capacidades multilingues.
- Licencia Apache 2.0, que permite uso comercial del repositorio; conviene verificar por separado los terminos del backbone Wan2.2 y de los datos de RoboCasa-300 antes de un despliegue comercial.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no cuenta con validacion independiente de la comunidad.
- El pipeline declarado es `robotics`, no `text-generation`; no debe utilizarse como modelo de lenguaje ni esperarse de el tool calling o agentes.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/hmkang/wam_ctxpool_mimonly
- Perfil del autor: https://huggingface.co/hmkang
- Wan2.2 (backbone base): no se proporciona enlace en la informacion disponible
- RoboCasa (entorno de entrenamiento): no se proporciona enlace en la informacion disponible
- Paper o blog tecnico: no disponible
- Demos o espacios: no disponible

Nota: la busqueda web asociada no devolvio resultados relacionados con el modelo; los enlaces recuperados corresponden a un cuento de Mario Vargas Llosa y no guardan relacion con este repositorio.

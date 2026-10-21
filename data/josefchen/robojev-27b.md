# josefchen/RoboJev-27B

## Resumen

RoboJev-27B es un modelo visión-lenguaje especializado en una única tarea: dictaminar si un robot ha completado la instrucción que se le dio. No es un modelo conversacional ni genera texto; recibe una instrucción en lenguaje natural y cuatro fotogramas de una misma cámara (inicio del intento, un tercio, dos tercios y final) y devuelve un único número entre 0 y 1, la probabilidad de éxito. Lo publica el usuario josefchen como fine-tune de autotrust/JEV-27B-VL, que a su vez se apoya en la arquitectura Qwen3.8-27B según la model card.

El modelo resuelve un problema muy concreto en robótica de manipulación: etiquetar automáticamente rollouts de políticas (por ejemplo SO-101 con LeRobot) sin revisar vídeo a revisión humana, servir de señal de recompensa en aprendizaje sobre hardware real y filtrar demostraciones fallidas antes de entrenar. Con 27.356.728.560 parámetros (~27,4 B) en bf16 y 54,7 GB de pesos, cabe en una sola GPU de 80 GB y resuelve cada veredicto en aproximadamente medio segundo en una H100.

Su relevancia radica en el enfoque de decisión: en lugar de generar una respuesta textual, el cliente lee los log-probabilities de los tokens `false` y `true` en un punto fijo del prompt (`[decision]:`), aplica unos offsets almacenados en `decision.json` y normaliza por temperatura. Es, en la práctica, un clasificador binario calibrado construido sobre un VLM grande, con licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; según el autor, Qwen3.8-27B con los pesos de decisión de JEV-27B-VL y el entrenamiento de RoboJev integrados. No se especifica si es transformer denso o MoE |
| Parámetros totales | 27.356.728.560 (~27,4 B), dato real de safetensors |
| Parámetros activos | No disponible (no se confirma que sea MoE) |
| Longitud de contexto | 32.768 tokens en el ejemplo de despliegue del autor (`--max-model-len 32768`); no se declara la ventana nativa |
| Tipos de cuantización | No disponible; solo se publican pesos en bf16 (54,7 GB) |
| Idiomas soportados | No disponible (los ejemplos e instrucciones de la model card están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), cargable con transformers y vLLM |
| Pipeline | image-text-to-text |
| Modelo base | autotrust/JEV-27B-VL (fine-tune) |

## Arquitectura y entrenamiento

La model card describe el resultado como «Qwen3.8-27B con los pesos de decisión de JEV-27B-VL y el entrenamiento de RoboJev plegados», sin detallar la configuración interna (número de capas, atención, si hay mezcla de expertos). Es un VLM de imagen y texto que se carga como cualquier modelo Qwen3.8 con `vllm serve` o `transformers`. El mecanismo de inferencia es la pieza diferencial: la instrucción y los cuatro fotogramas se insertan en un prompt fijo que termina en el literal `[decision]:`; el modelo no emite texto, y el cliente extrae los log-probabilities de los dos tokens `false` y `true`, les suma los offsets recogidos en `decision.json`, divide por la temperatura configurada y convierte el par de puntuaciones en una probabilidad. Todo ese material (prompt, ids de token, offsets y temperatura) viaja en el repositorio.

En cuanto a datos, el autor indica que RoboJev se entrenó con otras sesiones de grabación del mismo montaje SO-101 y que, en el conjunto de evaluación principal, nunca vio dos de las ocho tareas. No se publican el número de tokens, la composición del dataset, ni si hubo RLHF o DPO. Sí se documenta la integración con LeRobot (`lerobot_plugin/`), que añade un modelo de recompensa `robojev` para episodios grabados y un paso de recompensa para aprendizaje en robot real, sustituyendo al clásico clasificador entrenado por tarea.

## Capacidades

- Juicio de éxito o fracaso de una tarea robótica a partir de instrucción + cuatro fotogramas, devolviendo una probabilidad calibrada entre 0 y 1.
- Procesamiento conjunto de imagen y texto (pipeline image-text-to-text), con hasta 8 imágenes por prompt en la configuración de vLLM indicada por el autor (`--limit-mm-per-prompt '{"image": 8}'`).
- Extracción de fotogramas automática desde vídeo: el cliente `robojev.py` corta los cuatro fotogramas necesarios a partir de un MP4 (requiere `ffmpeg`).
- Veredicto en directo sobre vídeo o cámara, recalculado cada medio segundo, mediante `robojev_overlay.py` (cámara requiere `opencv-python`).
- Uso como modelo de recompensa en LeRobot, tanto para puntuar episodios ya grabados como para aprendizaje sobre robot real.
- No soporta generación de texto libre, tool calling ni razonamiento multi-paso: la salida es un escalar derivado de log-probabilities.
- Capacidades multilingües: no documentadas; los prompts de ejemplo están en inglés.

## Casos de uso

- Puntuación automática de barridos de políticas: lanzar cientos de intentos de una política robótica y obtener una tasa de éxito sin revisar cada vídeo a mano, usando `judge.done(instrucción, vídeo)` con los cuatro fotogramas extraídos automáticamente.
- Señal de recompensa en aprendizaje sobre hardware real: el plugin de LeRobot integra `robojev` como reward model, de modo que el bucle de entrenamiento recibe una probabilidad de éxito por episodio en lugar de depender de un clasificador entrenado específicamente para cada tarea.
- Curación de datasets de demostraciones: detectar episodios fallidos o incompletos en un dataset antes de entrenar con ellos, filtrando por el valor devuelto y evitando que las políticas imiten ejecuciones rotas.
- Monitorización en producción de una célula robotizada: ejecutar `robojev_overlay.py --camera 0` para obtener un veredicto continuo cada ~0,5 s y disparar alertas o reintentos cuando la probabilidad se queda baja al final del ciclo.
- Verificación por paso en secuencias programadas: cuando un programa dirige el robot, comprobar que cada subobjetivo se ha cumplido antes de pasar al siguiente, usando la misma instrucción y ventanas de cuatro fotogramas por etapa.
- Evaluación comparativa de checkpoints: dado que el modelo no ha visto dos de las ocho tareas de ArmnetBench, sirve como juez sobre tareas nuevas del mismo montaje para comparar versiones de una política sin etiquetado humano adicional.
- Control de calidad en laboratorios con brazos distintos: en el conjunto OOD (Franka, Koch, Trossen, xArm, otro SO-101) mantiene un ranking score de 0,872, suficiente como filtro grueso antes de la revisión humana.

## Benchmarks y rendimiento

Datos publicados por el autor. Todos los modelos reciben los mismos cuatro fotogramas y la misma pregunta.

**ArmnetBench — 268 intentos de siete políticas sobre un brazo SO-101 real, ocho tareas, juicio humano; RoboJev no vio dos de las ocho tareas:**

| Modelo | Ranking score | Aciertos | Error de calibración | Tareas no vistas |
|---|---:|---:|---:|---:|
| RoboJev-27B | 0,987 | 92,4% | 0,052 | 0,973 |
| JEV-27B-VL | 0,983 | 87,7% | 0,113 | 0,977 |
| TypeSafe Jev 1.14 | 0,975 | 82,9% | 0,177 | 0,958 |
| Perplexity Decider v1.2 | 0,954 | 81,1% | 0,116 | 0,947 |
| Inception Mercury Decide | 0,938 | 81,6% | 0,109 | 0,949 |
| Liquid d1-ultra | 0,918 | 81,4% | 0,062 | 0,878 |
| Robometer-4B (lee el vídeo completo) | 0,777 | 67,7% | 0,251 | 0,812 |

**RBM-1M OOD — 459 intentos de ocho laboratorios (Franka en dos laboratorios, Koch, Trossen, xArm y otro SO-101); ningún modelo entrenó con ellos:**

| Modelo | Ranking score | Aciertos | Error de calibración |
|---|---:|---:|---:|
| Perplexity Decider v1.2 | 0,885 | 76,1% | 0,168 |
| JEV-27B-VL | 0,880 | 77,4% | 0,162 |
| RoboJev-27B | 0,872 | 76,1% | 0,173 |
| Liquid d1-ultra | 0,859 | 73,5% | 0,143 |
| Inception Mercury Decide | 0,859 | 75,6% | 0,205 |
| TypeSafe Jev 1.14 | 0,841 | 72,1% | 0,197 |
| Robometer-4B (lee el vídeo completo) | 0,818 | 59,8% | 0,414 |

Métricas según el autor: ranking score es la probabilidad de que un intento exitoso aleatorio puntúe por encima de uno fallido (0,5 = azar); aciertos es la media entre la proporción de éxitos detectados y la de fallos detectados con umbral 0,5; el error de calibración mide la desviación entre la probabilidad declarada y la frecuencia real. En OOD, el propio autor advierte que con 459 intentos las diferencias por debajo de ~0,03 en ranking score no son significativas.

## Requisitos de hardware

- VRAM: los pesos en bf16 ocupan 54,7 GB; el autor afirma que el modelo cabe en una GPU de 80 GB. Estimación orientativa del editor para el conjunto completo en bf16 con caché KV: ~60-70 GB según longitud de contexto y lote (no publicado por el autor).
- GPU recomendadas: H100 80 GB (referencia del autor, ~0,5 s por veredicto), A100 80 GB. En GPUs de 40 GB o menos no cabe en bf16 sin cuantizar.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en configuraciones de 48 GB en bf16. No se han publicado pesos GGUF ni recetas de cuantización para hacerlo viable en consumo.
- Despliegue: vLLM es la vía documentada, con las opciones `--served-model-name robojev --max-model-len 32768 --limit-mm-per-prompt '{"image": 8}' --logprobs-mode processed_logprobs --trust-request-chat-template`. También carga con `transformers`. No hay integración confirmada con llama.cpp, Ollama ni TGI.
- Latencia: ~0,5 s por veredicto en una H100, según el autor. Throughput con batching no disponible.
- Cliente: `robojev.py` requiere `requests` y `pillow`; para vídeo, `ffmpeg`. El plugin de LeRobot se instala con `pip install ./robojev/lerobot_plugin`.
- Almacenamiento: 54,7 GB de repositorio; conviene descarga selectiva (`--include "lerobot_plugin/*"`) para el plugin.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Ranking (ArmnetBench) | Ranking (OOD) | Licencia | Disponibilidad |
|---|---|---|---:|---:|---|---|
| RoboJev-27B | 27,36 B | 32.768 tokens (config. de despliegue) | 0,987 | 0,872 | Apache 2.0 | HuggingFace (josefchen/RoboJev-27B) |
| JEV-27B-VL | No disponible | No disponible | 0,983 | 0,880 | No disponible | HuggingFace (autotrust/JEV-27B-VL) |
| Perplexity Decider v1.2 | No disponible | No disponible | 0,954 | 0,885 | No disponible | No disponible |
| Liquid d1-ultra | No disponible | No disponible | 0,918 | 0,859 | No disponible | No disponible |
| Robometer-4B | ~4 B (por el nombre) | No disponible | 0,777 | 0,818 | No disponible | HuggingFace (robometer) |

Criterio de comparación: todos son jueces de éxito robótico evaluados sobre los mismos cuatro fotogramas. RoboJev-27B es el mejor en el conjunto dentro de distribución y el mejor calibrado (0,052), mientras que en OOD queda tercero dentro del ruido estadístico, por detrás de Perplexity Decider v1.2 y de su propio modelo base JEV-27B-VL. Frente a Robometer-4B, que procesa el vídeo completo, RoboJev obtiene mejores cifras con solo cuatro fotogramas y un coste de ~0,5 s por veredicto. No se dispone de parámetros, contexto ni licencia del resto de competidores.

## Limitaciones y advertencias

- Modelo de tarea única: no genera texto, no razona en varios pasos y no responde a preguntas generales. Cualquier uso fuera del juicio de éxito requiere adaptación.
- Dependencia estricta del protocolo de decisión: hay que usar el prompt, los ids de token, los offsets y la temperatura de `decision.json`, y servir con `--logprobs-mode processed_logprobs`. Un tokenizador o plantilla de chat distinta invalida la calibración.
- En robots no vistos, la ventaja desaparece: ranking 0,872 y error de calibración 0,173, con diferencias dentro del ruido frente a otros modelos. El autor documenta 28 intentos de 459 (la mayoría de un laboratorio) en los que los cuatro mejores modelos se equivocan con alta confianza.
- Sesgo de dominio: entrenado con sesiones de un montaje SO-101 concreto; generaliza peor a otras cámaras, iluminaciones, brazos o tareas de manipulación fina.
- Clips ambiguos: en los casos disputados de OOD, el vídeo termina antes de que el desenlace sea visible (por ejemplo, el objeto aún en la pinza). El modelo no puede acertar si el resultado no aparece en los fotogramas.
- Dependencia del muestreo de fotogramas: el cliente toma inicio, un tercio, dos tercios y final; un corte mal alineado con la ejecución real degrada el veredicto.
- Idiomas no declarados: no hay garantía de comportamiento con instrucciones en castellano; los ejemplos publicados están en inglés.
- Licencia Apache 2.0 permite uso comercial, pero no se detalla si el modelo base o los datos de entrenamiento imponen restricciones adicionales.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, creado el 20 de octubre de 2026; sin validación independiente de la comunidad más allá de los números del autor.
- Sin cuantizaciones publicadas, lo que limita el despliegue fuera de GPUs de 80 GB.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/josefchen/RoboJev-27B
- Modelo base: https://huggingface.co/autotrust/JEV-27B-VL
- Dataset de evaluación ArmnetBench: https://huggingface.co/datasets/armnet/armnetbench_v01_robometer
- Dataset de evaluación fuera de distribución RBM-1M OOD: https://huggingface.co/datasets/robometer/rbm-1m-ood
- Vídeo de ejemplo, intento exitoso: https://huggingface.co/josefchen/RoboJev-27B/resolve/main/examples/robojev-ring-successful.mp4
- Vídeo de ejemplo, intento fallido: https://huggingface.co/josefchen/RoboJev-27B/resolve/main/examples/robojev-ring-failure.mp4
- Otros enlaces (paper, blog, repositorio independiente, demo): no disponibles. La búsqueda web realizada no devolvió resultados relacionados con el modelo: los hits obtenidos son calendarios de eventos caninos y de deportes de invierno, sin relación con RoboJev-27B.

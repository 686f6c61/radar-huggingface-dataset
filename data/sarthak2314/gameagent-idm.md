# sarthak2314/GameAgent-IDM

## Resumen

GameAgent-IDM es un modelo de dinámica inversa (inverse dynamics model, IDM) especializado en videojuegos, desarrollado por el usuario sarthak2314 y publicado en HuggingFace. Su funcion es la inversa a la de un agente convencional: en lugar de recibir una observacion y producir una accion, recibe fotogramas de pantalla (448x448 pixeles) junto con eventos de teclado y raton con marcas de tiempo, y predice los eventos de entrada que ocurrieron entre esos fotogramas. Se trata, por tanto, de un modelo imagen-texto-a-texto con etiquetado de acciones, encuadrado en la categoria de vision-language-action (VLA) y descrito como "generalist-IDM".

Tecnicamente es un fine-tuning de OpenGVLab/InternVL3-1B-hf, por lo que hereda la arquitectura de InternVL3: un codificador visual InternViT con resolucion dinamica acoplado a un modelo de lenguaje de ~0,5B parametros mediante un proyector MLP. El total declarado en los pesos safetensors es de 938.716.288 parametros (~0,9B), en precision BF16 y con un tamano de repositorio de 1,9 GB. La licencia es Apache 2.0 y el unico idioma declarado es el ingles.

Su relevancia actual es doble. Por un lado, ataca el cuello de botella clasico del aprendizaje por imitacion: obtener datos de accion etiquetados es caro, mientras que el video de gameplay abunda sin etiquetar; un IDM permite convertir video en pares observacion-accion utilizables para entrenar agentes. Por otro, se deriva del trabajo D2E (arXiv:2510.05684), que explora el preentrenamiento vision-accion a gran escala sobre datos de escritorio para transferirlos a IA encarnada (embodied AI). El modelo se entreno con 147 horas de juego procedentes de 29 videojuegos de PC (dataset GameAgent-480p-100GB). Se publico el 13 de septiembre de 2026 y, en el momento de redactar esta ficha, acumula 0 descargas y 0 "likes", por lo que no cuenta con validacion de la comunidad ni resultados de benchmarks publicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (InternVL3): codificador visual InternViT + proyector MLP + LLM Qwen2.5-0.5B-Instruct |
| Parametros totales | 938.716.288 (~0,9B) segun safetensors |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la ficha del autor (heredada del modelo base InternVL3-1B) |
| Tipos de cuantizacion | No se distribuyen versiones cuantizadas; pesos en BF16. Cuantizacion a 8/4 bits posible con herramientas externas (bitsandbytes, AWQ, GPTQ), no validadas por el autor |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Precision de entrenamiento/publicacion | BF16 |
| Tamano del repositorio | 1,9 GB |
| Entrada | Fotogramas de pantalla a 448x448 + eventos de teclado/raton con timestamps |
| Salida | Eventos de teclado y raton predichos entre fotogramas |
| Modelo base | OpenGVLab/InternVL3-1B-hf (fine-tune) |
| Pipeline | image-text-to-text |
| Datos de entrenamiento | 147 horas de 29 juegos de PC (GameAgent-480p-100GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint OpenGVLab/InternVL3-1B-hf, que a su vez sigue el diseno de la familia InternVL3: un codificador visual tipo ViT (InternViT, variante de 300M parametros y 448x448) que genera tokens visuales, un proyector MLP que los alinea con el espacio de embeddings del lenguaje, y un LLM pequeno (Qwen2.5-0.5B-Instruct) que produce la secuencia de salida. InternVL3 emplea resolucion dinamica con teselado (tiling) de la imagen de entrada, de modo que el numero de tokens visuales —y por tanto el coste de atencion— crece con la resolucion efectiva. El total de 938,7M parametros encaja con esa combinacion de vision encoder de ~300M y LLM de ~0,5B.

El entrenamiento es un ajuste supervisado especifico de la tarea: la entrada consiste en fotogramas de gameplay a 448x448 junto con los eventos de teclado y raton y sus marcas de tiempo, y el objetivo es predecir los eventos de entrada ocurridos entre fotogramas consecutivos. El corpus declarado es GameAgent-480p-100GB, con 147 horas de grabaciones extraidas de 29 juegos de PC. La ficha no documenta el numero exacto de tokens de entrenamiento, la composicion detallada del dataset, la mezcla de datos ni si se aplicaron tecnicas de alineacion adicionales como RLHF o DPO; tampoco se mencionan innovaciones de decodificacion (por ejemplo decodificacion especulativa) ni mecanismos de atencion lineal o hibridos. La publicacion asociada, D2E (Choi et al., 2025), describe el marco general de preentrenamiento vision-accion sobre datos de escritorio para transferencia a IA encarnada, que es el contexto del que surge este IDM.

## Capacidades

- Prediccion de acciones (IDM): dado un par de fotogramas de gameplay y telemetria de entrada con timestamps, genera los eventos de teclado y raton que ocurrieron entre ambos.
- Modalidad mixta imagen + texto: procesa fotogramas de pantalla y secuencias textuales de eventos, por lo que puede formularse como tarea image-text-to-text.
- Etiquetado automatico de video: convierte gameplay sin anotar en pares observacion-accion, util como generador de datos para aprendizaje por imitacion.
- Generalizacion entre juegos: entrenado sobre 29 titulos de PC, lo que apunta a cierta capacidad de transferencia entre generos, aunque sin benchmarks publicos que la cuantifiquen.
- Transferencia a agentes de escritorio: la taxonomia del modelo (desktop-agents, generalist-idm) y el trabajo D2E sugieren uso como puente entre control de juego y control de GUI.
- Tool calling / function calling: no disponible; no se documenta soporte de llamadas a herramientas.
- Soporte de agentes multi-paso: no disponible como capacidad nativa; el modelo predice acciones, no planifica secuencias de alto nivel.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma declarada.
- Modo "thinking", vision de alta resolucion, audio: no disponibles; la vision se limita a 448x448.
- Razonamiento general, codigo y matematicas: no documentados ni evaluados para este fine-tune.

## Casos de uso

- Etiquetado de datasets para aprendizaje por imitacion: procesar horas de grabaciones de gameplay sin anotar y generar pares (fotograma, accion) que alimenten el entrenamiento de agentes de juego. El modelo es adecuado porque su tarea es exactamente esa inversion, con un coste de inferencia bajo al tener ~0,9B parametros.
- Preentrenamiento vision-accion y transferencia a robotica: siguiendo el espiritu del trabajo D2E, usar las trazas de accion generadas a partir de video de juegos y escritorio como preentrenamiento barato antes de ajustar politicas en entornos encarnados con pocos datos reales.
- Deteccion de comportamiento anomalo o trampas: comparar las acciones reales de un jugador con las que el IDM predice a partir del video; discrepancias sistematicas pueden senalar automatizacion o manipulacion del cliente, aunque requeriria umbrales calibrados con datos propios.
- QA y pruebas de regresion en videojuegos: extraer trazas de entrada reproducibles a partir de grabaciones de bugs, de modo que un equipo de QA pueda reejecutar la misma secuencia de teclado y raton sobre una build nueva y comparar el resultado.
- Analisis de rendimiento y coaching de jugadores: reconstruir la secuencia de entradas a partir de VODs para medir tiempos de reaccion, frecuencia de teclas y patrones de uso de raton, sin depender de la telemetria del cliente.
- Automatizacion de agentes de escritorio: aplicar el modelo a capturas de pantalla de aplicaciones de escritorio para inferir las acciones (clics, atajos) que un humano realizo, habilitando imitacion de flujos de trabajo de GUI a partir de demos grabadas.
- Accesibilidad y control alternativo: usar las predicciones como capa intermedia para mapear video de una sesion a un flujo de comandos estructurado, util en herramientas de asistencia o en simuladores de control.
- Curacion y filtrado de datasets de video: puntuar la coherencia entre el video y su telemetria declarada para descartar clips mal sincronizados o corruptos antes de entrenar otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del modelo y los datos proporcionados no incluyen metricas como MMLU, HumanEval, GSM8K, ni metricas especificas de la tarea IDM (por ejemplo precision de prediccion de teclas, error de coordenadas de raton o exactitud temporal). Tampoco se ofrecen comparaciones con el modelo base ni con otros IDM.

## Requisitos de hardware

- VRAM para inferencia: los pesos en BF16 ocupan aproximadamente 1,9 GB. Contando activaciones, cache KV y los tokens visuales que genera el teselado dinamico de InternVL3, una estimacion razonable es de 4 a 8 GB de VRAM, dependiendo del numero de tiles por imagen y de la longitud de la secuencia de eventos.
- GPU consumer: si, cabe sin problema en tarjetas de gama media y alta. Una RTX 3060 de 12 GB, RTX 4060 Ti de 8 GB o RTX 4070 son suficientes en BF16 o FP16; con cuantizacion de 8 o 4 bits cabria incluso en GPUs de 4-6 GB, aunque esa ruta no esta validada por el autor.
- GPU de datacenter: A100, H100, L40S o similares son utiles principalmente para procesar grandes volumenes de video en lote, no porque el modelo los requiera en memoria. El modelo tambien puede ejecutarse en CPU, con latencia mucho mayor.
- Opciones de despliegue: la via documentada es transformers con `AutoModelForImageTextToText` y `AutoProcessor` (con `trust_remote_code=True`). Al ser un checkpoint basado en InternVL3, es compatible con servidores de inferencia que ya soportan esa familia, como vLLM o LMDeploy, y con TGI si la version instalada reconoce la arquitectura. No se documenta soporte oficial en llama.cpp u Ollama.
- Latencia y throughput: no disponibles. No se proporcionan cifras de tokens por segundo, tiempo por fotograma ni rendimiento medido en ninguna GPU concreta.

## Comparativa con modelos similares

No se dispone de benchmarks que permitan comparar el rendimiento de este modelo con alternativas, y no existen apenas IDM de juego publicos con los que contrastarlo. La comparacion siguiente se limita a caracteristicas verificables de modelos de la misma categoria (VLM pequenos que podrian usarse como base o alternativa).

| Modelo | Parametros | Contexto | Licencia | Categoria | Comentario |
|---|---|---|---|---|---|
| GameAgent-IDM | ~0,9B (938,7M) | no disponible | Apache 2.0 | IDM / VLA para juego | Especializado en predecir teclado y raton; sin benchmarks ni adopcion |
| OpenGVLab/InternVL3-1B-hf | ~0,9B | no disponible | Apache 2.0 | VLM generalista | Modelo base del anterior; no esta especializado en prediccion de acciones |
| Qwen2.5-VL-3B-Instruct | ~3,75B | 32 768 tokens (nativo) | Apache 2.0 | VLM generalista con grounding | Alternativa generalista de mayor tamano; no es un IDM y no produce eventos de entrada |
| SmolVLM2-2.2B-Instruct | ~2,2B | no disponible | Apache 2.0 | VLM compacto | Opcion pequena para tareas imagen-texto; sin capacidad IDM documentada |

En rendimiento de tarea (precision de prediccion de acciones, error de coordenadas de raton, F1 sobre teclas) no hay datos publicos para ninguno de estos modelos en el contexto de IDM, por lo que la comparacion cuantitativa queda como no disponible.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni resultados de validacion, ni descargas o "likes" que permitan inferir calidad. Cualquier uso en produccion exige una evaluacion propia previa.
- Riesgo de alucinacion de acciones: al generar eventos como texto, el modelo puede producir teclas inexistentes, combinaciones incoherentes o coordenadas de raton fuera de rango; es necesario validar y sanear la salida contra un esquema de acciones cerrado.
- Sesgo de dominio: el entrenamiento se limita a 147 horas de 29 juegos de PC, sin informacion sobre su diversidad de generos, resoluciones o configuraciones. El rendimiento fuera de ese dominio (consolas, movil, aplicaciones de escritorio, juegos con HUDs muy distintos) es desconocido.
- Resolucion de entrada fija de 448x448: los detalles finos de la interfaz (iconos pequenos, texto diminuto, minimapas) pueden perderse, lo que degrada la prediccion de acciones precisas.
- Idioma: solo ingles declarado. Las instrucciones o descripciones en castellano no estan cubiertas.
- Licencia: los pesos se publican bajo Apache 2.0, lo que permite uso comercial, pero el modelo base InternVL3-1B y, en su caso, el dataset GameAgent-480p-100GB pueden tener condiciones propias que conviene revisar antes de explotar el modelo comercialmente. El material de entrenamiento son videojuegos, con posibles implicaciones de derechos sobre el contenido de los fotogramas.
- Contexto no documentado: la ficha no indica la ventana de contexto efectiva de este fine-tune, dato critico para saber cuantas horas o cuantos fotogramas se pueden procesar en una sola pasada.
- Requisitos de sincronizacion: la tarea depende de timestamps precisos entre video y eventos; una desincronizacion en la entrada degrada las predicciones de forma silenciosa.
- Dependencia de `trust_remote_code=True`: la carga del modelo ejecuta codigo del repositorio, lo que anade riesgo de seguridad en entornos de produccion.
- Uso dual: la capacidad de inferir y, por extension, generar secuencias de entrada automatizadas puede emplearse para construir bots que violen los terminos de servicio de plataformas de juego.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sarthak2314/GameAgent-IDM
- Modelo base: https://huggingface.co/OpenGVLab/InternVL3-1B-hf
- Paper asociado (D2E: Scaling Vision-Action Pretraining on Desktop Data for Transfer to Embodied AI): https://arxiv.org/abs/2510.05684
- Version PDF del paper: https://arxiv.org/pdf/2510.05684

Nota: las busquedas web realizadas no devolvieron ningun resultado relevante sobre este modelo ni sobre el paper D2E; los enlaces encontrados correspondian a contenido no relacionado, por lo que no se incluyen. No se han localizado repositorios de codigo, demos ni blogs adicionales del autor.

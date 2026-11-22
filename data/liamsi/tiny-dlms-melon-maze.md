# liamsi/tiny-dlms-melon-maze

## Resumen

Mēlon 8x128 (maze) es un modelo de decisión de tamano muy reducido desarrollado por liamsi dentro del proyecto tiny-dlms. A diferencia de los modelos generativos al uso, no produce texto: recibe una imagen (un laberinto renderizado en 48x48 píxeles a color) y una lista de opciones escritas en lenguaje natural ("go up", "go down", "go left", "go right"), y devuelve una probabilidad para cada opción mediante softmax. La opción con mayor probabilidad se ejecuta como siguiente movimiento.

El modelo se ha escrito y entrenado desde cero en PyTorch, sin usar la libreria `transformers` de Hugging Face: incluye tokenizador, Transformer y bucle de entrenamiento propios. Usa una arquitectura tipo vision transformer con 8 capas de 128 dimensiones (4 cabezas de atención), más una capa adicional donde las representaciones de las opciones interactúan entre sí. El total de pesos es de 2.385.408 parámetros, lo que lo sitúa en la categoria de modelos "tiny".

Es relevante como ejemplo educativo y de investigacion: demuestra que un modelo de menos de 2,4 M de parámetros, entrenado por imitación sobre laberintos generados al vuelo, puede resolver el 97,0% de 200 laberintos no vistos siguiendo el camino más corto (ratio de pasos 1,00). No es un modelo de produccion, sino un proyecto de aprendizaje con licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision transformer (8 capas x 128 dim, 4 cabezas) + 1 capa de interaccion entre opciones; RMSNorm, RoPE, SwiGLU |
| Parametros totales | 2.385.408 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada de imagen fija de 48x48 px, 64 parches de 6x6; opciones tokenizadas) |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible (las opciones de ejemplo estan en ingles: "go up", "go down", "go left", "go right") |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer de vision de 8 capas y anchura 128 con 4 cabezas de atención, que procesa la imagen del laberinto dividida en 64 parches de 6x6 píxeles. Emplea RMSNorm, RoPE (rotary position embeddings) y SwiGLU en los bloques. Sobre esa pila se anade una capa adicional en la que las representaciones de las opciones textuales "se miran entre sí", de modo que el modelo puntua todas las opciones de forma conjunta y aplica una softmax para obtener una probabilidad por opción. No hay generacion autoregresiva: la decision es una clasificacion sobre un conjunto cerrado de opciones.

El entrenamiento es por imitacion (imitation learning): los laberintos se generan al vuelo y el objetivo es el camino más corto, introduciendo desvíos para que el modelo aprenda a recuperarse de decisiones suboptimas. Se realizaron 28.000 pasos de entrenamiento. No se especifica en la informacion disponible el numero de tokens, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Decision visual sobre opciones discretas: dada una imagen de laberinto y un conjunto de opciones textuales, devuelve una probabilidad por opción y selecciona una.
- Puntuacion conjunta de opciones: todas las opciones se evalúan a la vez mediante una capa de interaccion y softmax, en lugar de generar texto.
- Navegacion de laberintos desde píxeles: resuelve laberintos seleccionando movimientos hacia arriba, abajo, izquierda o derecha.
- Recuperacion de desvíos: entrenado con detours, aprende a corregir trayectorias suboptimas.
- Procesamiento de imagen a color de 48x48 píxeles en 64 parches de 6x6.
- Tokenizacion propia de las opciones textuales, integrada en el paquete `tiny-dlm`.
- No soporta tool calling, function calling, agentes multi-paso, vision general, audio ni modo "thinking"; no es un modelo de lenguaje generativo.

## Casos de uso

- Docencia e investigacion en aprendizaje por imitacion: sirve como ejemplo minimo y reproducible de entrenamiento desde cero de un transformer de vision con imitation learning, util para cursos y tutoriales.
- Experimentacion con modelos de decision de bajo coste: permite probar pipelines de decision visual en un portatil sin GPU dedicada, dado el reducido tamano de 2,39 M de parámetros.
- Benchmark de referencia para laberintos: el modelo y su comparativa (97,0% resueltos frente a 74,0% greedy y 8,5% random) sirven como linea base en experimentos de navegacion y planificacion.
- Prototipado de agentes que eligen entre opciones descritas en texto: el patron "imagen + opciones textuales + softmax" se puede reutilizar para tareas de seleccion discreta en entornos simulados.
- Estudio de robustez y generalizacion: evaluar como un modelo tiny generaliza a laberintos no vistos y con desvíos, midiendo ratio de pasos frente al camino más corto.
- Base para experimentos de destilacion o comparacion de arquitecturas: al ser entrenado desde cero y con pesos safetensors, es facil de modificar y reentrenar para variantes de laberintos o de opciones.
- Integracion en demos interactivas: el ejemplo de uso del model card permite renderizar un laberinto y consultar la decision del modelo en tiempo real.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre 200 laberintos no vistos:

| Jugador | Resueltos | Pasos / camino más corto |
|---|---|---|
| Este modelo | 97,0% | 1,00 |
| El profesor (camino más corto) | 100,0% | 1,00 |
| Greedy | 74,0% | 1,47 |
| Random | 8,5% | 4,36 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que el modelo no es de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en precision completa (2,39 M de parámetros en fp32 ocupan unos 9,5 MB de pesos, mas activaciones de la imagen de 48x48 y las opciones); cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna; no requiere A100, H100 ni RTX 4090. Una GPU integrada o CPU es suficiente.
- Cabe en GPU consumer: sí, en todas (GTX 1050, RTX 3060, RTX 4090, etc.) y en CPU.
- Opciones de despliegue: el paquete propio `tiny-dlm` (instalacion via `pip install "tiny-dlm[hub] @ git+https://github.com/benisalla/tiny-dlms"`) con carga desde el Hub mediante `from_pretrained`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible en la informacion proporcionada; por el tamano del modelo se espera latencia de milisegundos en CPU y GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tiny-dlms-melon-maze | 2,39 M | imagen 48x48 + opciones | 97,0% laberintos resueltos | MIT | Hugging Face |
| tiny-dlms-melon-car | no disponible | imagen (CarRacing) + opciones | no disponible | MIT | Hugging Face |
| tiny-dlms-melon-car-small | no disponible | imagen (CarRacing) + opciones | no disponible | MIT | Hugging Face |
| tiny-dlms-rhoa | no disponible | texto | no disponible | MIT (segun tag de licencia del proyecto) | Hugging Face |

No se dispone de datos de benchmarks comparables con modelos de otras familias en la informacion proporcionada; la comparativa se limita a los modelos del mismo proyecto tiny-dlms.

## Limitaciones y advertencias

- Modelo de juguete: el propio autor lo describe como "un proyecto de aprendizaje, no un modelo de produccion".
- Dominio muy restringido: solo resuelve laberintos con opciones fijas de movimiento; no generaliza a otras tareas visuales o de lenguaje.
- No es un modelo generativo: no produce texto libre, codigo ni razonamiento; solo puntua opciones predefinidas.
- Sesgos conocidos: no se documentan en la informacion disponible; al entrenarse sobre laberintos generados sinteticamente, su comportamiento esta limitado a esa distribucion.
- Riesgo de alucinacion: no aplica en el sentido habitual (no genera texto), pero puede elegir movimientos suboptimos; acierta el 97,0% de los laberintos, por lo que falla en aproximadamente 3 de cada 100.
- Limitaciones de contexto e idioma: la entrada de imagen es fija (48x48 px); las opciones de ejemplo estan en ingles y no se documenta soporte multilingue.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificacion con atribucion; no obstante, el modelo no es adecuado para produccion.
- Caveat para produccion: sin soporte documentado de servidores de inferencia estandar (vLLM, TGI, llama.cpp) ni cuantizaciones; requiere el paquete `tiny-dlm` y el codigo del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/liamsi/tiny-dlms-melon-maze
- Repositorio GitHub del proyecto: https://github.com/benisalla/tiny-dlms
- Pagina del proyecto: https://benisalla.github.io/tiny-dlms/
- Modelo tiny-dlms-rhoa: https://huggingface.co/liamsi/tiny-dlms-rhoa
- Modelo tiny-dlms-rhoa-small: https://huggingface.co/liamsi/tiny-dlms-rhoa-small
- Modelo tiny-dlms-rhoa-gpt2: https://huggingface.co/liamsi/tiny-dlms-rhoa-gpt2
- Modelo tiny-dlms-rhoa-base: https://huggingface.co/liamsi/tiny-dlms-rhoa-base
- Modelo tiny-dlms-melon-car: https://huggingface.co/liamsi/tiny-dlms-melon-car
- Modelo tiny-dlms-melon-car-small: https://huggingface.co/liamsi/tiny-dlms-melon-car-small

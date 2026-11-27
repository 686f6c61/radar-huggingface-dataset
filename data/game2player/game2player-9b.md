# game2player/Game2Player-9B

## Resumen

Game2Player 9B es un modelo vision-lenguaje especializado en juego automatico (game playing) desarrollado por el proyecto game2player. Se trata de un fine-tuning supervisado (SFT) del modelo base Qwen/Qwen3.5-9B, orientado a predecir la siguiente accion de teclado o raton a partir de capturas de pantalla de un videojuego, una descripcion de la tarea y el historial reciente de acciones. El modelo resuelve el problema de construir agentes visuales capaces de operar en entornos de juego sin ingenieria especifica por titulo.

Con 9.409.813.744 parametros totales (aproximadamente 9,4 mil millones) y un repositorio de 18,8 GB en safetensors, el modelo se distribuye bajo licencia Apache-2.0. Su relevancia actual radica en que aborda la co-desarrollo entorno-jugador para escalar la experiencia de juego en agentes visuales, con un paper asociado (arXiv:2611.24154) y un benchmark propio, PlayerBench. El modelo acepta hasta siete imagenes por prompt con aproximadamente 1.024 tokens visuales por imagen y devuelve acciones estructuradas en formato `tool_call`.

La arquitectura subyacente es la de Qwen3.5 (etiqueta `qwen3_5`), un transformer multimodal con torre de vision y proyector visual, ambos congelados durante el entrenamiento. El modelo esta pensado para desplegarse con vLLM o Transformers y expone un pipeline `image-text-to-text` con compatibilidad de endpoints OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5), vision encoder y proyector visual congelados durante el fine-tuning |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | hasta 65.536 tokens en despliegue vLLM (`--max-model-len 65536`); longitud maxima de secuencia de entrenamiento 25.000 tokens |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en BF16; el autor no documenta cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Game2Player 9B parte de Qwen3.5-9B, un transformer multimodal con codificador visual y proyector que conecta las representaciones de imagen con el modelo de lenguaje. Durante el fine-tuning solo se actualiza el modelo de lenguaje; el vision encoder y el proyector visual permanecen congelados. La entrada combina un mensaje de sistema con reglas del juego, controles disponibles y objetivo de la tarea, junto con la captura actual, hasta 50 acciones previas con notas cortas y hasta seis capturas anteriores (maximo siete imagenes en total, aproximadamente 1.024 tokens visuales por imagen).

El entrenamiento se realizo sobre 1.564.236 ejemplos de gameplay recogidos con politicas de codigo y jugadores VLM mediante la herramienta Game2Player. Se ejecuto una epoca con 9.237 pasos de optimizador, longitud maxima de secuencia de 25.000 tokens, learning rate de 0,00001 con schedule coseno y precision de pesos BF16. El dataset no esta publicado ("coming soon"). La salida se estructura como una accion `computer_use` dentro de etiquetas `<tool_call>`, con un campo `reasoning` para la nota de accion y coordenadas de raton normalizadas en rango 0-1000; las duraciones se expresan en segundos. El modo thinking opcional devuelve cadenas de razonamiento separadas.

## Capacidades

- Prediccion de la siguiente accion de teclado o raton a partir de capturas de pantalla de videojuegos.
- Comprension de reglas del juego, controles y objetivos descritos en el mensaje de sistema.
- Procesamiento de historial de acciones (hasta 50 acciones previas) y de capturas anteriores (hasta seis) para mantener coherencia temporal.
- Soporte de tool calling mediante la herramienta `computer_use` con acciones como `press_key` y espera con duracion.
- Razonamiento multi-paso con modo thinking opcional (hasta 32.768 tokens de salida en evaluaciones de thinking).
- Coordenadas de raton normalizadas en rango 0-1000 y duraciones de accion en segundos.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades de vision: si, integra imagenes en el prompt (image-text-to-text).

## Casos de uso

- Agentes de juego automatico en entornos 2D y 3D: el modelo recibe la captura actual y el historial de acciones para emitir la siguiente accion, lo que permite controlar personajes en laberintos, plataformas o juegos de accion sin ingenieria por titulo.
- Evaluacion de agentes visuales en investigacion: uso del modelo como jugador de referencia en PlayerBench (50 juegos, 287 tareas) y GameWorld (34 juegos, 170 tareas) para medir capacidad de generalizacion.
- Generacion de datos de gameplay sintetico: el modelo puede actuar como politica de juego para recoger trayectorias y notas de accion que alimenten posteriores ciclos de entrenamiento.
- Pruebas de regresion de videojuegos: un agente que juega de forma autonoma puede ejecutar rutas definidas y detectar bloqueos, errores de colision o fallos de control mediante la comparacion de capturas.
- Automatizacion de tareas de interfaz grafica con raton y teclado: aunque entrenado en juegos, el formato de accion `computer_use` con coordenadas normalizadas permite reutilizarlo en entornos GUI con reglas y controles descritos en el prompt.
- Investigacion en planificacion visual de largo horizonte: el historial de hasta 50 acciones y seis capturas previas permite estudiar como el modelo mantiene el contexto temporal en tareas de navegacion y resolucion de puzles.
- Prototipado de asistentes de juego para usuarios: integrado via API compatible con OpenAI, puede sugerir la siguiente accion al jugador a partir de una captura, con notas de razonamiento breves.

## Benchmarks y rendimiento

La model card indica que el modelo se evalua en PlayerBench (50 juegos retenidos, 287 tareas) y GameWorld (34 juegos, 170 tareas), y remite a la tabla de clasificacion del proyecto. No se han publicado resultados numericos de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 19 GB solo para pesos (9,4 mil millones de parametros a 2 bytes), mas overhead de KV cache y procesador visual; en la practica se recomienda al menos 24 GB.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para despliegue con contexto largo (hasta 65.536 tokens) y multiples secuencias; RTX 4090 (24 GB) puede ser suficiente para contextos moderados y una sola secuencia.
- Cabe en GPU de consumo: RTX 4090 (24 GB) en BF16 con contexto reducido; en GPUs de 16 GB seria necesaria cuantizacion, no documentada por el autor.
- Opciones de despliegue: vLLM 0.29.0 (servidor compatible con OpenAI, configuracion oficial con `--max-model-len 65536`, `--max-num-seqs 8`, `--limit-mm-per-prompt '{"image":7,"video":0}'` y `--reasoning-parser qwen3`) y Transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| Game2Player 9B | 9,4 mil millones | 65.536 tokens (despliegue) | Imagen + texto | Apache-2.0 | Fine-tuning de Qwen3.5-9B para juego automatico; evaluado en PlayerBench y GameWorld |
| Qwen3.5-9B (base) | 9 mil millones (aproximado) | no disponible | Imagen + texto | Apache-2.0 | Modelo base generalista; sin especializacion en juego ni formato `computer_use` |
| Alternativas especializadas en agentes de juego | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- El modelo esta especializado en juego automatico; su rendimiento fuera de ese dominio (GUI general, robotica, documentos) no esta documentado.
- El dataset de entrenamiento no esta publicado ("coming soon"), lo que limita la reproducibilidad y la auditoria de sesgos.
- Los idiomas soportados no estan documentados; no se garantiza un comportamiento multilingue fiable.
- Riesgo de alucinacion en la descripcion de reglas o en la interpretacion de capturas ambiguas; las notas de accion pueden no corresponder con la accion emitida.
- Dependencia fuerte del prompt de sistema: reglas, controles y formato de salida deben especificarse con precision; errores en el prompt degradan la calidad de la accion.
- La licencia Apache-2.0 cubre los pesos del modelo, pero no otorga derechos sobre titulos, activos ni capturas de videojuegos de terceros.
- El uso comercial en produccion requiere verificar los terminos de los juegos y plataformas sobre los que se opere, asi como el cumplimiento de sus condiciones de servicio.
- El modo thinking incrementa el consumo de tokens (hasta 32.768 en evaluacion) y la latencia; debe habilitarse solo cuando sea necesario.
- No se documentan cuantizaciones oficiales, lo que dificulta el despliegue en hardware de gama baja.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/game2player/Game2Player-9B
- Paper: https://arxiv.org/abs/2611.24154
- Proyecto y leaderboard: https://game2player.github.io/
- Codigo: https://github.com/game2player/Game2Player
- PlayerBench: https://github.com/game2player/Game2Player/tree/main/benchmark/playerbench
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B

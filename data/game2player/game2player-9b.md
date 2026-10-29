# game2player/Game2Player-9B

## Resumen

Game2Player 9B es un modelo visual-lenguaje especializado en jugar a videojuegos, desarrollado por el equipo de Game2Player y publicado como un fine-tune de Qwen3.5-9B. Recibe como entrada una captura de pantalla del juego, la descripción de la tarea, las reglas y los controles disponibles, junto con un historial de hasta 50 acciones previas y seis capturas anteriores, y devuelve la siguiente acción de teclado o ratón en formato de *tool call*. El modelo tiene 9.409.813.744 parámetros (~9,4 B) y se distribuye en safetensors bajo licencia Apache-2.0.

El modelo forma parte del trabajo "Game2Player: Scaling Gameplay Experience for Visual Agents through Environment–Player Co-Development", que propone entrenar agentes visuales mediante la co-desarrollo del entorno de juego y del propio jugador. El entrenamiento se realizó sobre 1.564.236 ejemplos de gameplay recogidos con políticas de código y jugadores VLM, con el codificador visual y el proyector visual congelados.

Su relevancia actual reside en que ataca un cuello de botella concreto de los agentes visuales: la predicción de acciones de bajo nivel a partir de píxeles, con un formato de salida estructurado y compatible con servidores OpenAI (vLLM), lo que facilita integrarlo en bucles de agente sin post-procesado complejo. No obstante, la información pública disponible es todavía muy limitada: el dataset no se ha liberado, no se han publicado cifras numéricas de benchmarks y el repositorio acumula muy pocas descargas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal image-text-to-text derivada de Qwen3.5-9B (transformer con codificador visual y proyector visual congelados durante el fine-tune); detalles internos de la arquitectura no disponibles |
| Parametros totales | 9.409.813.744 (~9,4 B) |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | 65.536 tokens en la configuración de despliegue recomendada con vLLM (`--max-model-len 65536`); longitud máxima de secuencia durante entrenamiento: 25.000 tokens |
| Tipos de cuantizacion | Pesos publicados en BF16 (safetensors); no se han publicado cuantizaciones oficiales GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | No disponible (no se declara en la model card) |
| Licencia | Apache-2.0 (los pesos); Qwen3.5 es también Apache-2.0; el contenido de los juegos pertenece a sus respectivos propietarios |
| Formato de pesos | safetensors (BF16), biblioteca `transformers`; tamaño del repositorio: 18,8 GB |

## Arquitectura y entrenamiento

Game2Player 9B es un fine-tune de Qwen3.5-9B con pipeline `image-text-to-text`. La model card indica que el entrenamiento actualiza únicamente el modelo de lenguaje, manteniendo congelados el codificador visual y el proyector visual. No se detalla en la información disponible el tipo exacto de atención, la composición del dataset más allá de su origen (políticas de código y jugadores VLM), ni si se aplicaron fases de RLHF o DPO; el tag `sft` sugiere supervisión directa sobre trayectorias de gameplay.

Los hiperparámetros de entrenamiento sí están publicados: 1.564.236 ejemplos, una época, 9.237 pasos de optimizador, longitud máxima de secuencia de 25.000 tokens, learning rate de 1e-5 con schedule coseno y precisión BF16. El dataset está anunciado como "coming soon", por lo que no puede auditarse la distribución de juegos, la diversidad de géneros ni la proporción de acciones de teclado frente a ratón.

La innovación destacable no está en el bloque transformer, sino en la interfaz de entrada/salida: el modelo consume hasta siete imágenes (la actual más seis previas) a ~1.024 tokens visuales por imagen, junto con hasta 50 acciones anteriores con notas cortas, y emite una única acción `computer_use` dentro de etiquetas `<tool_call>`. Las coordenadas de ratón se normalizan al rango 0–1000 y las duraciones de acción se expresan en segundos. Dispone de un canal de *thinking* opcional, con evaluaciones que permiten hasta 32.768 tokens de salida en ese modo.

## Capacidades

- Predicción de la siguiente acción de juego a partir de una captura de pantalla, con soporte de pulsaciones de tecla, movimiento y clic de ratón con coordenadas normalizadas 0–1000.
- Comprensión de reglas del juego, controles disponibles y objetivo de la tarea proporcionados en el mensaje de sistema.
- Uso de memoria de corto plazo: hasta 50 acciones previas con notas y hasta seis capturas anteriores (siete imágenes en total por petición).
- Salida estructurada mediante *tool calling*: emite `{"name":"computer_use","arguments":{...}}` dentro de `<tool_call>`, con un campo `reasoning` de una frase que justifica la acción.
- Modo *thinking* opcional (`enable_thinking`) con cadenas de razonamiento separadas de la acción final; compatible con `--reasoning-parser qwen3` en vLLM.
- Capacidad multimodal de entrada (imagen + texto); no se declara soporte de vídeo (`limit-mm-per-prompt` recomienda `"video":0`).
- Integración como servidor compatible con la API de OpenAI a través de vLLM.
- Capacidades multilingües: no disponibles (no declaradas).
- No se declaran capacidades de audio, generación de imágenes ni ejecución de código.

## Casos de uso

- **Automatización de QA de videojuegos**: el modelo puede actuar como jugador sintético que recorre menús, reproduce secuencias de regresión y detecta bloqueos, enviando capturas al endpoint de vLLM en cada paso y recibiendo la acción en formato estructurado.
- **Agentes de juego en bucle cerrado**: integrado en un *harness* que captura la pantalla, construye el mensaje de sistema con reglas y controles, y aplica la acción devuelta; el historial de 50 acciones y seis capturas permite mantener coherencia en tareas de varios minutos.
- **Generación de datos de gameplay para entrenamiento**: al estar pensado para predecir acciones sobre píxeles, puede utilizarse para etiquetar trayectorias o generar rollouts que alimenten posteriores fine-tunes de agentes visuales.
- **Investigación en agentes visuales y evaluación comparativa**: sirve como línea base reproducible en PlayerBench (50 juegos, 287 tareas) y GameWorld (34 juegos, 170 tareas), con configuración de decodificación documentada (temperatura 1.0, `max_tokens` 512 sin *thinking*).
- **Prototipado de asistentes de computer-use en dominios con estado visual**: aunque entrenado en juegos, su formato de acción (`press_key`, clic con coordenadas normalizadas, esperas en segundos) es reutilizable para interfaces gráficas simples donde el estado se deduce de una captura.
- **Pruebas de robustez y seguridad de agentes**: permite estudiar cómo reacciona un agente visual ante pantallas ambiguas, cambios de resolución o instrucciones contradictorias, con el canal de razonamiento activado para inspeccionar la justificación de cada acción.
- **Demostraciones y herramientas de accesibilidad**: uso como capa de control que traduce instrucciones en lenguaje natural y capturas a pulsaciones concretas, útil en prototipos de asistencia para personas con movilidad reducida en entornos de juego.

## Benchmarks y rendimiento

La información proporcionada no incluye resultados numéricos de benchmarks. La model card únicamente indica que el modelo se evalúa en PlayerBench (50 juegos reservados, 287 tareas) y GameWorld (34 juegos, 170 tareas), y remite los resultados a la tabla de clasificación del proyecto. No se han publicado cifras de MMLU, HumanEval, GSM8K ni de las suites citadas en el material disponible, por lo que no se presentan números.

## Requisitos de hardware

- **VRAM estimada en BF16**: los pesos suman 18,8 GB, por lo que la inferencia requiere aproximadamente 20–24 GB solo para el modelo, a lo que hay que añadir la caché KV. Con `--max-model-len 65536` y contexto largo la caché KV crece de forma notable; para uso con ventanas grandes se recomienda GPU de 40–80 GB.
- **GPU recomendadas**: A100 40 GB u 80 GB, H100 80 GB y L40S 48 GB para despliegues con contexto completo y varias secuencias simultáneas. En GPUs de 24 GB (RTX 4090, RTX 3090) el modelo en BF16 entra muy justo y obliga a reducir `--max-model-len` o `--max-num-seqs`.
- **Cabe en GPU de consumo**: sí, en RTX 4090/3090 de 24 GB con contexto recortado; en GPUs de 16 GB no cabe en BF16 y requeriría cuantización, que no está publicada oficialmente.
- **Opciones de despliegue**: vLLM 0.29.0 es la vía documentada por el autor, con `--dtype bfloat16`, `--max-num-seqs 8`, `--max-num-batched-tokens 4096`, `--limit-mm-per-prompt '{"image":7,"video":0}'` y `--mm-processor-kwargs '{"max_pixels":1048576}'`. También se indica compatibilidad con Transformers. No se documentan recetas para llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: no disponibles. Como referencia de coste, cada petición puede acarrear hasta siete imágenes a ~1.024 tokens visuales cada una (≈7.000 tokens de entrada solo en visión), y el modo *thinking* puede generar hasta 32.768 tokens de salida.

## Comparativa con modelos similares

No se dispone de datos verificados de alternativas en la información proporcionada (los resultados de la búsqueda web no contenían material técnico relevante). La única comparación documentable es con el modelo base:

| Modelo | Parametros | Contexto | Capacidad diferencial | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Game2Player-9B | 9,4 B | 65.536 tokens (config. vLLM) | Predicción de acciones de juego con salida `computer_use` estructurada e historial visual | Apache-2.0 | Pesos en HuggingFace (safetensors) |
| Qwen3.5-9B (base) | 9,4 B (heredados) | No disponible en la información proporcionada | Modelo generalista image-text-to-text; sin fine-tune específico de gameplay | Apache-2.0 | Pesos en HuggingFace |
| Otras alternativas de agentes visuales | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- **Riesgo de alucinación de acciones**: el modelo puede emitir teclas o clics incoherentes con los controles declarados; la model card insiste en incluir reglas y controles en el mensaje de sistema, lo que sugiere dependencia fuerte del prompt.
- **Dominio restringido**: entrenado exclusivamente sobre gameplay; su transferencia a interfaces de escritorio reales no está evaluada en la información disponible.
- **Dataset no publicado**: al estar anunciado como "coming soon", no puede verificarse la diversidad de juegos, la presencia de sesgos de género, culturales o de género de videojuego, ni la calidad de las anotaciones.
- **Idiomas no declarados**: no se especifica qué lenguas soporta; el prompt de ejemplo está en inglés y se desconoce el rendimiento en castellano.
- **Coste de contexto**: el uso de hasta siete imágenes y 50 acciones previas implica prompts muy grandes; además, el modo *thinking* puede consumir hasta 32.768 tokens de salida, con latencia y coste asociados.
- **Restricciones de licencia sobre el contenido**: aunque los pesos son Apache-2.0, la propia model card advierte de que los títulos, assets y capturas de los juegos pertenecen a sus propietarios y que la licencia del modelo no concede derechos sobre contenido de terceros. El uso comercial sobre juegos concretos requiere revisión legal independiente.
- **Madurez del artefacto**: 4 descargas y 0 *likes* en el momento de la consulta, sin validación comunitaria independiente; no debe asumirse paridad con las cifras de la tabla de clasificación del proyecto sin reproducirlas.
- **Dependencia de la pila de despliegue**: la receta fija vLLM 0.29.0 y el parser de razonamiento `qwen3`; versiones distintas pueden alterar el formato de salida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/game2player/Game2Player-9B
- Página del proyecto: https://game2player.github.io/
- Tabla de clasificación del proyecto: https://game2player.github.io/#leaderboard
- Código: https://github.com/game2player/Game2Player
- PlayerBench: https://github.com/game2player/Game2Player/tree/main/benchmark/playerbench
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia Apache-2.0: https://huggingface.co/game2player/Game2Player-9B/blob/main/LICENSE

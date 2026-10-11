# lowerkey/bard-small

## Resumen

Bard Small es un modelo de generación de texto de 136.721.664 parámetros (unos 137 M) desarrollado por el usuario lowerkey y publicado en HuggingFace bajo licencia Apache 2.0. No es un modelo de propósito general: está entrenado desde cero para dirigir aventuras conversacionales de ficción interactiva. Se le entrega una primera línea ("You arrive at the gates of the old castle"), el modelo narra qué ocurre, propone cambios en el estado del jugador (dinero, objetos) y ofrece una lista de opciones; el jugador escoge una o escribe la suya y la partida sigue.

Su rasgo diferencial es la gestión de números fuera del tokenizador: cada secuencia de dígitos se sustituye por un token `<|num|>` y el valor real viaja en un tensor paralelo (`number_values`), de modo que el modelo puede emitir incrementos numéricos exactos. A esto se suma un formato de bloques propio con roles `state`, `story` y `player`, delimitados por marcadores que son tokens únicos. La consecuencia práctica es que la arquitectura no forma parte de transformers y su carga exige `trust_remote_code=True`.

Es relevante como ejemplo de modelo diminuto (137 M) que se ejecuta íntegramente en el navegador del usuario, sin servidor, dentro del juego Stochastic Lands of Prophecy, y como caso de estudio de representación numérica y control de estado estructurado en modelos muy pequeños. La model card no publica longitud de contexto, composición del dataset ni benchmarks, y el propio autor advierte de que el modelo pierde el hilo narrativo con rapidez.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con código personalizado (topología no detallada en la model card); dos redes auxiliares para codificar y decodificar valores numéricos |
| Parametros totales | 136.721.664 (unos 137 M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repo distribuye pesos en safetensors (tamaño de repo 0,3 GB, coherente con bf16/fp16). El autor recomienda cargar en bf16 |
| Idiomas soportados | inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors + código Python personalizado en el repo (requiere `trust_remote_code=True`); tokenizador basado en el paquete `tokenmonster` |

## Arquitectura y entrenamiento

La model card no especifica la topología interna (número de capas, dimensión oculta, tipo de atención). Lo que sí se documenta es que la arquitectura no está integrada en transformers, que se distribuye como código personalizado (`.py` en el repo) y que el pipeline declarado es `text-generation` con etiqueta secundaria `feature-extraction`. El modelo fue entrenado desde cero por su autor para un juego propio, sin que se detallen el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO: esos datos no están disponibles.

La innovación técnica principal es el tratamiento de los números. Cada secuencia de dígitos del texto se convierte en un token `<|num|>` y su valor viaja en un segundo flujo (`number_values`) paralelo a los `input_ids`. Una red pequeña transforma ese valor en un vector que se suma al embedding del token, y otra red predice los dígitos cuando el modelo necesita escribir un número. Por eso la entrada son dos tensores y `generate()` estándar no es utilizable: las funciones `bard.begin` y `bard.act` gestionan ese flujo dual. El diálogo se serializa en bloques `<|start|>ROLE<|content|>texto<|end|>`, donde el bloque `state` y el bloque `player` los escribe el motor del juego y solo el bloque `story` lo genera el modelo, incluyendo opcionalmente `<|vars|>` con cambios de estado (`<|add|>`/`<|set|>`) y `<|choices|>` con las opciones separadas por `<|sep|>`.

## Capacidades

- Generación de narrativa de ficción interactiva en inglés, en turnos, a partir de una línea inicial del jugador.
- Emisión de cambios de estado estructurados: variables como `money`, con operaciones de suma (`<|add|>`) y asignación (`<|set|>`).
- Propuesta de un conjunto de opciones de acción separadas por `<|sep|>`, más cierre de la partida cuando genera un bloque `story` sin opciones.
- Aceptación de acciones libres escritas por el jugador además de las opciones sugeridas.
- Escritura con streaming: el parámetro `on_text` recibe el texto por fragmentos mientras se genera.
- Reproducibilidad de partidas mediante el parámetro `seed`.
- Serialización y reanudación de partidas completas (`Tale.to_dict()` / `Tale.from_dict()`), con el historial como cadena plana en `tale.history`.
- Control de longitud de respuesta por turno (`length`: "short", "medium", "long").
- No dispone de tool calling, function calling, capacidades de agente multi-paso, visión ni audio según la información disponible.
- No es un modelo multilingüe: solo inglés.

## Casos de uso

- Ficción interactiva en el navegador: el juego Stochastic Lands of Prophecy ejecuta el modelo completo en la máquina del usuario, sin servidor, de modo que nada de lo que escribe el jugador sale de su equipo. Es el escenario para el que fue entrenado.
- Prototipado rápido de mecánicas de juego con estado: gracias a los bloques `state` y a las operaciones `<|add|>`/`<|set|>`, sirve para experimentar con economías, inventarios o contadores sin escribir un motor de reglas completo, validando después los deltas en el lado del juego.
- Aventuras conversacionales educativas o demostraciones de IA local: al requerir solo unos cientos de MB y funcionar en CPU, permite desplegar demos de generación de texto en equipos modestos o en el navegador.
- Generación de narrativa ramificada: el modelo produce opciones discretas que se pueden mapear a un grafo de escenas, útil para generar borradores de árboles de diálogo que después se revisan y se fijan a mano.
- Generación de texto creativo corto con streaming: la función `on_text` permite integrarlo en interfaces que muestran el texto a medida que se escribe, con la longitud controlada por el parámetro `length`.
- Base para fine-tuning en dominios con estado estructurado: su formato de bloques y su manejo numérico fuera del tokenizador lo hacen apropiado para experimentar con tareas donde el modelo debe emitir cantidades exactas (precios, puntos, recursos) en lugar de dígitos muestreados token a token.
- Investigación sobre representación numérica: el par `<|num|>` + `number_values` es un mecanismo reproducible y de tamaño pequeño, adecuado para estudios comparativos sobre aritmética en modelos de menos de 200 M de parámetros.
- Evaluación de portabilidad a navegador: sirve como referencia de cuánto texto narrativo coherente puede producir un modelo de 137 M ejecutándose en WebGPU o WebAssembly en un cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye métricas cuantitativas (MMLU, HumanEval, GSM8K ni equivalentes). Como referencia cualitativa, el autor publica una muestra de partida y señala explícitamente que el modelo "pierde el hilo con bastante rapidez". También advierte de que, siendo tan pequeño, puede proponer cambios de estado incoherentes, como escribir `money -400` cuando el jugador tiene 100.

## Requisitos de hardware

- VRAM estimada: en bf16/fp16 los pesos ocupan aproximadamente 0,27 GB (el repo completo son 0,3 GB); en int8 unos 0,14 GB y en int4 unos 0,07 GB, aunque no se publican cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con más de 1 GB de memoria libre es suficiente. El modelo cabe holgadamente en RTX 3060, RTX 4060, RTX 4090 y similares; no necesita A100 ni H100, que estarían enormemente sobredimensionadas.
- GPU de consumo: sí, cabe en cualquier GPU de consumo de los últimos diez años e incluso en iGPU con memoria compartida.
- CPU: funciona sin GPU. El autor indica que un turno tarda unos pocos segundos en CPU.
- Navegador: el caso de uso principal es la inferencia local en el navegador dentro del juego del autor, sin servidor.
- Latencia: alrededor de un segundo por turno en GPU y unos pocos segundos en CPU, según los datos del autor.
- Opciones de despliegue: transformers con `trust_remote_code=True` y las funciones `bard.begin`/`bard.act`. No es compatible con el `generate()` estándar ni, por tanto, con pilas que dependan de él (vLLM, TGI, llama.cpp, Ollama) sin un portado previo, debido a la arquitectura personalizada y a la entrada dual `input_ids` + `number_values`. El autor indica que lo probó con transformers 4.46 y 5.19 (en versiones anteriores a 4.56 el argumento de precisión se llama `torch_dtype`).
- Throughput estimado: no disponible.

## Comparativa con modelos similares

Los datos de las alternativas proceden de sus respectivas model cards públicas. Para bard-small no existen benchmarks publicados, por lo que la columna de rendimiento no es comparable.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| lowerkey/bard-small | 136,7 M | no disponible | Apache-2.0 | HuggingFace, safetensors + código personalizado, requiere `trust_remote_code=True` | no disponible |
| openai-community/gpt2 | 124 M | 1024 tokens | licencia MIT modificada | HuggingFace, safetensors/PyTorch, compatible con transformers estándar | benchmarks públicos en su model card |
| HuggingFaceTB/SmolLM-135M | 135 M | 2048 tokens | Apache-2.0 | HuggingFace, transformers estándar | benchmarks públicos en su model card |
| Qwen/Qwen2.5-0.5B | 494 M | 32768 tokens | Apache-2.0 | HuggingFace, transformers estándar | benchmarks públicos en su model card |

La diferencia funcional relevante no es el tamaño, sino el propósito: bard-small es un modelo vertical para aventuras conversacionales con estado y aritmética fuera del tokenizador, mientras que las alternativas son modelos de lenguaje generalistas con tokenización numérica convencional y soporte estándar en el ecosistema transformers.

## Limitaciones y advertencias

- Coherencia narrativa limitada: el autor reconoce que el modelo pierde el hilo de la historia con rapidez, algo esperable en 137 M de parámetros.
- Estado poco fiable: los cambios que el modelo escribe en `<|vars|>` son solo una sugerencia y pueden ser imposibles (por ejemplo, restar 400 a un saldo de 100). El motor del juego debe validarlos y acotarlos.
- Sesgos: no hay información publicada sobre sesgos, composición del dataset ni filtrado de datos. No se puede evaluar el riesgo de sesgo de género, cultural o de otro tipo.
- Alucinación: previsiblemente alta en un modelo de este tamaño y con fines creativos, aunque en su dominio (ficción) la alucinación es menos problemática que en tareas factuales. No debe usarse como fuente de información.
- Idioma: únicamente inglés. No hay evidencia de capacidades en castellano ni en otros idiomas.
- Contexto: la longitud de contexto no está documentada, lo que impide planificar el truncado de historiales largos.
- Seguridad del código: requiere `trust_remote_code=True`, lo que implica ejecutar código Python incluido en el repositorio. Conviene auditar esos archivos antes de usarlo en entornos de producción.
- Incompatibilidad de herramientas: al no funcionar con `generate()`, no es desplegable directamente en vLLM, TGI, Ollama o llama.cpp, ni con cuantizaciones GGUF existentes. Cualquier integración requiere usar su API propia.
- Dependencias externas: necesita el paquete `tokenmonster` además de torch y transformers; su tokenizador es específico y no es intercambiable con el de otros modelos.
- Licencia: Apache-2.0 permite uso comercial, pero impone conservar los avisos de copyright y licencia. No se detalla en la información disponible la licencia del código auxiliar del repositorio, que conviene verificar por separado.
- Madurez: el repositorio registra 0 descargas y 0 likes, sin validación por parte de la comunidad ni evaluación independiente. La fecha de creación indicada en HuggingFace es el 10 de octubre de 2026.
- Producción: dado su tamaño y su tasa de pérdida de coherencia, es adecuado para demos y prototipos, no para atención al cliente, generación de código ni tareas que exijan fiabilidad factual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lowerkey/bard-small
- Space del juego (Stochastic Lands of Prophecy): https://huggingface.co/spaces/lowerkey/stochastic-lands-of-prophecy
- Juego jugable en el navegador: https://slop.szymon.space
- Dependencia del tokenizador citada en el README: paquete `tokenmonster` (instalable con `pip install tokenmonster`); no se proporciona URL en la información disponible
- Paper o informe técnico: no disponible
- Repositorio de código independiente: no disponible
- Resultados de la búsqueda web: los enlaces devueltos corresponden a BBC Young Musician 2026 (https://www.bbc.co.uk/programmes/m0032lqj, https://www.bbc.com/mediacentre/proginfo/2026/41/bbc-young-musician, https://bristolbeacon.org/whats-on/bbc-young-musician-2026/) y no guardan ninguna relación con el modelo, por lo que se descartan como fuentes.

# maxgfr/s2-nano

## Resumen

s2-nano es un modelo de decisión de tipo "system one" desarrollado por maxgfr, diseñado para responder preguntas tipadas sobre el estado de un videojuego en un único forward pass y detenerse en la primera salida temprana suficientemente confiable. Con 1.532.033 parámetros según la model card (596.737 según los metadatos de safetensors) y un peso de 702 KB en formato GGUF con pesos ternarios, es un modelo extremadamente compacto orientado a la latencia ultra baja en entornos de inferencia embebidos.

La relevancia de s2-nano no reside en sus capacidades generales de lenguaje, sino en su arquitectura: el formato `skycmd-s2` separa un flujo estático (pregunta y opciones) que se codifica una vez y se cachea, de un flujo de estado que se codifica por frame, con opciones que nunca se atienden entre sí y salidas tempranas con supervisión profunda. Está pensado para ejecutarse exclusivamente en el motor skycmd, escrito en Rust, con soporte para navegador, Node, Python, CLI y servidor.

El modelo se distribuye bajo licencia Apache 2.0, solo soporta inglés y está entrenado desde cero en Rust sobre Apple Silicon. Su caso de uso es acotado: toma de decisiones en tiempo real para juegos (Flappy Drone, Rescue Run, Obstacle Dodge) dentro del ecosistema skycmd, no como modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con flujos separados (estático cacheado y de estado), early exits con deep supervision, pesos ternarios (QAT) |
| Parámetros totales | 1.532.033 según model card; 596.737 según metadatos de safetensors (discrepancia no aclarada) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Pesos ternarios (entrenados con QAT); no se documentan otras cuantizaciones |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`s2-nano.gguf`) |

## Arquitectura y entrenamiento

s2-nano implementa el formato `skycmd-s2`, una arquitectura de transformer con dos flujos diferenciados: un flujo estático que codifica la pregunta y las opciones una sola vez y se cachea, y un flujo de estado que se codifica en cada frame. Las opciones no se atienden entre sí, y cada número se representa con un token `[NUM]` acompañado de características de valor continuo. El modelo incorpora salidas tempranas con supervisión profunda: en producción utiliza entre 3,2 y 3,4 de sus 4 capas antes de detenerse en la primera salida con confianza suficiente (umbral τ = 0,95 en la versión publicada).

El entrenamiento se realizó desde cero en Rust con mlx-rs sobre Apple Silicon, combinando preentrenamiento de lenguaje enmascarado numérico, entrenamiento de decisión con supervisión profunda sobre las salidas, QAT ternario, optimizadores Muon y AdamW con schedule WSD, y rondas de DAgger sobre los juegos. Los datos incluyen conjuntos de decisiones tipadas, BoolQ, MNLI, ARC, CommonsenseQA y Banking77 convertidos a preguntas tipadas, SimpleStories, TinyStories y FineWeb para preentrenamiento, y estados de juego etiquetados por oráculos exactos. Parte de los datos se generó con GLM-5.3-Flash (pesos abiertos, MIT).

## Capacidades

- Respuesta a preguntas tipadas sobre el estado de un juego en un único forward pass por decisión.
- Toma de decisiones en tiempo real con parada temprana adaptativa según umbral de confianza.
- Razonamiento numérico básico mediante tokens `[NUM]` con características de valor continuo.
- Clasificación y decisión sobre opciones discretas sin atención cruzada entre opciones.
- Ejecución en el motor skycmd en navegador, Node, Python, CLI y servidor.
- Soporte de pesos ternarios para despliegue de muy bajo peso (702 KB).
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Control de agentes en videojuegos en tiempo real: s2-nano decide acciones frame a frame con latencias de 273 µs nativas y 409 µs en WASM, adecuado para bucles de juego donde el presupuesto por frame es crítico.
- Inferencia embebida en navegador: al ejecutarse en WASM dentro del motor skycmd, permite desplegar un agente de decisión sin backend, útil para demos interactivas y entornos con recursos limitados.
- Sustitución de heurísticas en prototipos de juego: el modelo responde preguntas tipadas sobre el estado, lo que permite reemplazar reglas manuales por un decisor entrenado con oráculos exactos en juegos como Flappy Drone u Obstacle Dodge.
- Evaluación de arquitecturas de early exit: con 4 capas y umbrales calibrables, sirve como banco de pruebas para estudiar el compromiso entre latencia y precisión en modelos de decisión.
- Investigación en cuantización ternaria con QAT: el modelo y su código en Rust permiten reproducir el pipeline de entrenamiento ternario y analizar su impacto en tareas de decisión acotadas.
- Clasificación de preguntas tipadas sobre dominios acotados: los datos de entrenamiento incluyen BoolQ, MNLI, ARC, CommonsenseQA y Banking77 convertidos a preguntas tipadas, lo que habilita experimentos de decisión sobre estos formatos dentro del ecosistema skycmd.

## Benchmarks y rendimiento

Resultados en bucle cerrado sobre `sky-arena`, 30 episodios por juego, semilla 7:

| Juego | Resultado |
|---|---|
| Flappy Drone | 200 / 200 tuberías, 0 colisiones |
| Rescue Run | 100 % |
| Obstacle Dodge | 87 % (= oráculo), 25 vetos de reflejo |

Latencia por decisión: 273,0 µs nativa y 409,1 µs en WASM (Apple M5). Con umbrales calibrados sobre preguntas de validación el modelo colisionaba en todos los episodios de Flappy; con τ = 0,95 (versión publicada) juega al nivel del oráculo usando entre 3,2 y 3,4 de sus 4 capas.

## Requisitos de hardware

- VRAM estimada: inferior a 1 MB para los pesos (702 KB en GGUF ternario); el consumo real depende del motor skycmd y del estado del juego.
- GPU recomendadas: no se requieren GPU dedicadas; el modelo se ejecuta en CPU y en WASM.
- Cabe en cualquier GPU consumer y en entornos sin GPU; probado en Apple M5.
- Opciones de despliegue: exclusivamente el motor skycmd (`sky-serve`, CLI `skycmd decide`), con soporte para navegador, Node, Python, CLI y servidor. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 273,0 µs nativa y 409,1 µs en WASM por decisión (Apple M5). Throughput no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de decisión ternaria con early exits y formato propietario `skycmd-s2`.

## Limitaciones y advertencias

- Modelo de dominio muy acotado: responde preguntas tipadas sobre estados de juego; no es un modelo de lenguaje de propósito general.
- Solo soporta inglés.
- Ejecución restringida al motor skycmd; no es compatible con runtimes estándar de GGUF como llama.cpp u Ollama.
- Discrepancia en el número de parámetros entre la model card (1.532.033) y los metadatos de safetensors (596.737); conviene verificar antes de citar la cifra.
- La calibración de umbrales es crítica: con umbrales calibrados sobre validación el modelo falló en todos los episodios de Flappy; el autor recomienda calibrar las salidas tempranas sobre estados de bucle cerrado.
- Riesgo de alucinación no evaluado en la información disponible; al ser un decisor sobre opciones discretas, el modo de fallo es la elección incorrecta, no la generación libre.
- Sesgos conocidos no documentados.
- Licencia Apache 2.0 permite uso comercial, pero las licencias de los datos de entrenamiento se detallan en `DATA_LICENSES.md` del repositorio y deben revisarse.
- Parte de los datos de entrenamiento se generó con GLM-5.3-Flash (MIT); verificar implicaciones de atribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maxgfr/s2-nano
- Demo: https://huggingface.co/spaces/maxgfr/s2-nano
- Código: https://github.com/maxgfr/skycmd
- Tutorial de la arquitectura s2: https://maxgfr.github.io/skycmd/tutorial/19-s2-architecture
- Especificación del formato: https://github.com/maxgfr/skycmd/blob/main/docs/SPEC-S2.md
- Guía de instalación: https://maxgfr.github.io/skycmd/install/
- Licencias de datos: https://github.com/maxgfr/skycmd/blob/main/DATA_LICENSES.md

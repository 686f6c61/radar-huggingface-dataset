# maxgfr/s3-pico

## Resumen

s3-pico es un modelo de decisión de tamano extremadamente reducido (251 KB, 445.345 parámetros ternarios) desarrollado por maxgfr, pensado para resolver problemas de clasificación y elección en juegos y escenarios de control. No es un modelo generativo de propósito general: recibe el estado de un juego como texto y responde preguntas tipadas (`choice`, `score`, `noul`) en un único forward pass, con hasta cuatro pasadas sobre un bloque de estado compartido por pesos y una salida temprana tras cada pasada.

Su relevancia radica en la filosofía "system-one": demostrar que una red minúscula, entrenada con QAT ternario y calibración de salida en bucle cerrado, puede igualar a un oráculo en tareas de decisión acotadas (Flappy Drone, Rescue Run, Obstacle Dodge y un shooter tipo Doom) con latencias de decenas de microsegundos y ejecución en navegador vía WASM. Es un artefacto didáctico y de investigación sobre arquitecturas recursivas con parada temprana, no un modelo de lenguaje.

La arquitectura se apoya en un formato propio (`skycmd-s2` sobre GGUF) y solo funciona dentro del motor skycmd, escrito en Rust. Se distribuye con licencia Apache 2.0 y únicamente soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer recursivo con bloque de estado compartido por pesos (hasta 4 pasadas) y salida temprana tras cada pasada |
| Parametros totales | 445.345 ternarios (193.793 según safetensors reportado por Hugging Face) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el estado se codifica como un token por par `key value`) |
| Tipos de cuantizacion | Pesos ternarios entrenados con QAT; formato GGUF propietario `skycmd-s2` |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`s3-pico.gguf`), tag `skycmd-s2` |
| Tamano del artefacto | 251 KB |
| Motor de inferencia | skycmd (Rust; bindings para navegador/WASM, Node, Python, CLI y servidor) |

## Arquitectura y entrenamiento

El modelo implementa un transformer con un único bloque de estado compartido por pesos que se aplica hasta cuatro veces de forma recursiva. La pregunta y las opciones se codifican una sola vez como un flujo estático en caché; el estado del juego se representa como un token por cada par `key value`, sumando el valor al embedding de la clave. Las opciones no atienden entre sí, lo que evita comparaciones cruzadas costosas. Tras cada pasada por el bloque hay una salida temprana, y el modelo consume en promedio entre 1,05 y 1,73 de sus 4 bucles posibles, con umbrales de salida calibrados jugando en bucle cerrado.

El entrenamiento se hizo desde cero en Rust (mlx-rs) sobre Apple Silicon, en varias fases: preentrenamiento con masked-language modeling numérico, entrenamiento de decisión sobre objetivos suaves con supervisión profunda en las salidas, QAT ternario, dropout de bucles, rondas de DAgger sobre los juegos y calibración de umbrales de salida en bucle cerrado. Los datos incluyen conjuntos de decisiones tipadas, BoolQ, MNLI, ARC, CommonsenseQA y Banking77 convertidos a preguntas tipadas, además de SimpleStories, TinyStories y FineWeb para el preentrenamiento, y estados de juego etiquetados por oráculos exactos. Parte de los datos se generó con GLM-5.3-Flash (pesos abiertos, MIT).

## Capacidades

- Clasificación y elección sobre estados de juego representados como texto, respondiendo preguntas tipadas `choice`, `score` y `noul`.
- Decisión en un único forward pass por pregunta, con parada temprana adaptativa (1-4 bucles).
- Juego en bucle cerrado en cuatro entornos: Flappy Drone, Rescue Run, Obstacle Dodge y un shooter tipo Doom.
- Integración de un reflejo de seguridad codificado que puede vetar la acción propuesta por el modelo.
- Ejecución en navegador (WASM), Node, Python, CLI y servidor a través del motor skycmd.
- No soporta tool calling, agentes multi-paso, visión, audio ni generación libre de texto.

## Casos de uso

- Demo interactiva en navegador: el modelo juega en el Space de Hugging Face y permite al usuario tomar los controles; su tamano de 251 KB y su latencia en WASM (49,6 µs por decisión en Apple M5) lo hacen viable sin backend.
- Control de drones civiles simulados: en Rescue Run y Flappy Drone el modelo decide la acción a partir del estado textual, con un reflejo de seguridad que mantiene el veto sobre las acciones.
- Navegación en entornos tipo laberinto: Obstacle Dodge alcanza el 87 % (igualando al oráculo) con 14 vetos del reflejo, útil como banco de pruebas de políticas con salvaguardas.
- Agentes en shooters tipo Doom: completa el 100 % de los niveles con un número de bajas igual al oráculo, sirviendo como referencia para comparar políticas ligeras frente a oráculos.
- Investigación sobre arquitecturas recursivas con parada temprana: el modelo permite medir el coste real de los bucles (1,05-1,73 de 4) y estudiar la calibración de umbrales de salida.
- Ensenanza y tutoriales de ML en Rust: el capítulo 21 del tutorial de skycmd documenta el entrenamiento completo, y el código es 100 % Rust.
- Clasificación de preguntas tipadas en dominios acotados: los conjuntos BoolQ, MNLI, ARC, CommonsenseQA y Banking77 convertidos a preguntas tipadas sugieren uso como clasificador de intenciones muy ligero en entornos embebidos.

## Benchmarks y rendimiento

Resultados en bucle cerrado sobre `sky-arena`, 30 episodios por juego, semilla 7:

| Juego | Resultado |
|---|---|
| Flappy Drone | 200 / 200 tuberías, 0 colisiones |
| Rescue Run | 100 % |
| Obstacle Dodge | 87 % (= oráculo), 14 vetos del reflejo |
| Doom-like | 100 % de niveles, bajas = oráculo |

Latencia por decisión: 27,5 µs nativo y 49,6 µs en WASM (Apple M5). Bucles usados: 1,05-1,73 de 4 de media.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 MB para los pesos (251 KB), más el estado y el tokenizador; cabe en cualquier dispositivo.
- GPU recomendadas: no requiere GPU; se ejecuta en CPU. Los datos de latencia se midieron en Apple M5.
- Cabe en cualquier GPU de consumo, e incluso en navegador mediante WASM.
- Opciones de despliegue: exclusivamente el motor skycmd (`sky-serve`, CLI `skycmd decide`, bindings para Node, Python y navegador). No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 27,5 µs por decisión en nativo y 49,6 µs en WASM en Apple M5. Throughput no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de decisión ternaria con parada temprana y formato GGUF propietario; las alternativas habituales (modelos de lenguaje pequenos o políticas de RL para juegos) no son directamente equiparables en tamano ni en interfaz.

## Limitaciones y advertencias

- Modelo de decisión acotado: no genera texto libre ni mantiene conversaciones; solo responde preguntas tipadas sobre estados de juego.
- Solo inglés.
- Dependencia total del motor skycmd: los pesos no se pueden cargar en runners estándar (llama.cpp, vLLM, etc.) por el tag GGUF `skycmd-s2`.
- Entrenado y validado en cuatro juegos concretos; no hay evidencia de generalización fuera de esos escenarios.
- El propio autor lo describe como demo y tutorial, no como software de vuelo; no debe usarse en sistemas críticos.
- El reflejo de seguridad es código, no aprendizaje: el modelo solo aconseja y las reglas codificadas mantienen el veto.
- Riesgo de alucinación no evaluado en la información disponible; al ser un clasificador sobre opciones cerradas, el riesgo se limita a elegir una opción incorrecta.
- Licencia Apache 2.0 permite uso comercial, pero la utilidad práctica fuera del ecosistema skycmd es muy limitada.
- Parte de los datos de entrenamiento se generó con GLM-5.3-Flash; conviene revisar `DATA_LICENSES.md` para detalles de atribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maxgfr/s3-pico
- Demo (Space): https://huggingface.co/spaces/maxgfr/s3-pico
- Código (Rust): https://github.com/maxgfr/skycmd
- Tutorial, capítulo 21: https://maxgfr.github.io/skycmd/tutorial/21-s3-recursive-tiny
- Guía de instalación y bindings: https://maxgfr.github.io/skycmd/install/
- Licencias de datos: https://github.com/maxgfr/skycmd/blob/main/DATA_LICENSES.md

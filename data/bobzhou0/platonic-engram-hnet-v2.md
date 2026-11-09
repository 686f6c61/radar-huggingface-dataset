# bobzhou0/Platonic-Engram-HNet-v2

## Resumen

Platonic-Engram-HNet-v2 es un modelo de similitud semántica de frases (sentence-similarity) desarrollado por el usuario bobzhou0, diseñado específicamente para ejecutarse en el lector de libros electrónicos Xteink X4 Pro, un dispositivo basado en el microcontrolador ESP32-S3 con 8 MB de PSRAM y pantalla de tinta electrónica que corre el firmware PapyriX. El modelo forma parte de un sistema mayor (Platonic-Engram-HNet) que incluye un router de bytes, una memoria de personajes con causalidad estricta y un generador de notas al margen bloqueado por cláusulas. El objetivo declarado es ofrecer búsqueda semántica bilingüe (chino-inglés) y memoria de personajes sin spoilers dentro de un presupuesto de RAM de aproximadamente 1,1 MB.

La relevancia del modelo radica en su enfoque de extrema eficiencia: se trata de una destilación de profesores Qwen3-32B ejecutada en GPUs H200, convertida a aritmética entera bit-exacta y empaquetada como firmware C11/C++20. El modelo emplea una representación a nivel de byte (byte-level) en lugar de tokenización BPE, lo que reduce el consumo de RAM de 550 KB a 96,8 KB (5,7 veces menos) y mejora la segmentación de palabras en chino entre 6 y 9,5 puntos F1. El repositorio de Hugging Face tiene un tamaño de 0,0 GB y no registra descargas ni interacciones en el momento de redactar esta ficha.

La ficha se basa exclusivamente en la información pública disponible en Hugging Face y en los enlaces referenciados por el autor. No se dispone de detalles sobre el número exacto de parámetros, la composición del dataset de entrenamiento ni los hiperparámetros de destilación, por lo que estos datos se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de similitud de frases con representación byte-level y cuantización int8; parte de un sistema mayor con router de bytes, memoria de personajes y planificador de cláusulas |
| Parametros totales | no disponible (el sistema completo ocupa 1,13 MB de RAM; el modelo de similitud se empaqueta en `platonic-hnet.bin` + `engram.bin`, 96,8 KB en RAM más 4,2 MB en tarjeta SD) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de hasta 256 bytes; entradas más largas deben dividirse en ventanas empaquetadas por frases y sumar los vectores resultantes |
| Tipos de cuantizacion | int8 (aritmética entera bit-exacta, verificada de PyTorch QAT a NumPy, C11 y C++20) |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | MIT |
| Formato de pesos | binario propietario (`platonic-hnet.bin`, `engram.bin`); referencias de inferencia en Python con NumPy (`plhn_model.py`, `cspw_model.py`, `pe_writer_model.py`) |

## Arquitectura y entrenamiento

El modelo es el resultado de un proceso de destilación de profesores Qwen3-32B ejecutados en GPUs H200, seguido de un entrenamiento con cuantización consciente (QAT) para producir una implementación entera bit-exacta. La arquitectura se aparta de los transformers convencionales: el sistema completo separa el cómputo del diccionario, de modo que un router de bytes de 95 KB en PSRAM lee UTF-8 en bruto y detecta fronteras de palabras en inglés y chino, mientras que los significados de las palabras residen en una tabla hash de 4,2 MB en la tarjeta SD que se lee en ranuras de 64 bytes por palabra. El modelo de similitud propiamente dicho produce vectores de 128 valores int8 y la similitud se calcula mediante coseno normalizado.

El autor declara haber seleccionado la arquitectura mediante 14 brazos de ablación controlados. Además del modelo de similitud, el sistema incluye una memoria de personajes con causalidad estricta (cuatro ranuras continuas en el tiempo, 394 KB en PSRAM) que decae con la distancia de página y se filtra mediante una compuerta sobre el desplazamiento actual, y un planificador de tres pasos (642 KB) que selecciona cláusulas completas de un banco de 4.096 entradas en la SD, ninguna de las cuales contiene nombres propios. La paridad bit-exacta se verificó con 0 discrepancias en 38.580 líneas de benchmark y 1.067 pruebas unitarias de firmware. No se dispone de información sobre el número de tokens de entrenamiento ni sobre la composición exacta del dataset.

## Capacidades

- Similitud semántica de frases bilingüe (chino e inglés) mediante vectores int8 de 128 dimensiones y similitud coseno.
- Segmentación de palabras a nivel de byte para chino e inglés, con mejora declarada de +7,2, +9,5 y +6,0 puntos F1 sobre un tokenizador BPE en tres benchmarks de segmentación china.
- Memoria de personajes sin spoilers: recuperación de información sobre personajes limitada a la página actual, con 0,00 % de filtraciones en 9.169 consultas BookSum.
- Generación de notas al margen bloqueada por cláusulas, con 0,00 % de frases cortadas y 0,0 % de nombres inventados en 4.226 pruebas públicas.
- Inferencia en microcontrolador: el sistema completo deja 5,64 MB de PSRAM libre en el dispositivo con todos los modelos cargados.
- Referencias de inferencia en Python con solo NumPy, bit-exactas respecto al firmware.
- No se declara soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Búsqueda semántica dentro de libros electrónicos: el modelo permite localizar pasajes relacionados por significado en lugar de por coincidencia literal, adecuado para un lector que necesita encontrar referencias sin conexión a internet.
- Diccionario contextual bilingüe: al tocar una palabra en inglés o chino, el modelo devuelve el vector de significado correspondiente al sentido que tiene en esa frase concreta, gracias a la representación byte-level y a la tabla de significados en SD.
- Resumen de personajes sin spoilers: la memoria de personajes con causalidad estricta permite responder "¿quién es este personaje?" en la página 40 sin revelar información de la página 300, con 0,00 % de filtraciones declaradas.
- Notas al margen automáticas: el planificador de cláusulas genera anotaciones breves que nunca contienen nombres propios inventados ni frases incompletas, adecuado para lectores que quieren contexto sin interrumpir la lectura.
- Segmentación de texto chino en dispositivos empotrados: el router de bytes supera a BPE en F1 con el mismo presupuesto de RAM, útil para aplicaciones de procesamiento de lenguaje natural en microcontroladores.
- Filtrado y agrupación de frases en corpus bilingües: los vectores de 128 dimensiones permiten calcular similitud coseno de forma eficiente en entornos con recursos muy limitados, como la organización de bibliotecas personales en el propio lector.
- Prototipado de sistemas de recuperación de información en hardware de bajo consumo: las referencias en NumPy permiten validar el comportamiento del modelo en un PC antes de desplegarlo en el firmware.

## Benchmarks y rendimiento

Los resultados declarados por el autor en la model card (no verificados de forma independiente) son los siguientes:

| Benchmark | Tarea | Metrica | Valor |
|---|---|---|---|
| MTEB STSBenchmark | STS | cos_sim_spearman | 32,8 |
| MTEB STSB (zh) | STS | cos_sim_spearman | 49,0 |
| MTEB BQ | STS | cos_sim_spearman | 22,8 |
| MTEB ATEC | STS | cos_sim_spearman | 10,5 |
| PAWS-X (zh) | STS | cos_sim_spearman | 8,2 |

Además, el autor declara métricas internas del sistema: 0,00 % de filtraciones de spoilers en 9.169 consultas BookSum, 99,46 % de precisión en el orden temporal de escenas (temporal-swap accuracy 0,9946), 0,00 % de frases cortadas y 0,0 % de nombres inventados en 4.226 pruebas públicas, y 0 discrepancias en la paridad bit-exacta sobre 38.580 líneas de benchmark. La latencia mediana declarada del kernel en C es de 6,0 ms por consulta en un host Apple M1.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido convencional; el sistema está diseñado para ejecutarse en un ESP32-S3 con 8 MB de PSRAM y tarjeta SD. El modelo de similitud ocupa 96,8 KB de RAM más 4,2 MB en SD; el sistema completo ocupa 1,13 MB de RAM.
- GPU recomendadas: no se requiere GPU para inferencia; el entrenamiento y la destilación se realizaron en GPUs H200 según el autor.
- Compatibilidad con GPU de consumo: irrelevante para el despliegue objetivo; las referencias en NumPy pueden ejecutarse en CPU.
- Opciones de despliegue: firmware C11/C++20 para el lector Xteink X4 Pro con PapyriX; referencias en Python con NumPy (`plhn_model.py`, `cspw_model.py`, `pe_writer_model.py`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: latencia mediana de 6,0 ms por consulta en el kernel C sobre un host Apple M1; no se proporcionan datos de throughput en el dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Despliegue | Rendimiento |
|---|---|---|---|---|---|
| Platonic-Engram-HNet-v2 | no disponible (sistema de 1,13 MB de RAM) | ventanas de 256 bytes | MIT | ESP32-S3, firmware C11/C++20, NumPy | STS en chino: 49,0 en STSB (zh); 22,8 en BQ; 10,5 en ATEC; 8,2 en PAWS-X (zh) |
| Tokenizador BPE estándar (referencia del autor) | no aplica | no aplica | variable | software | 550 KB de RAM frente a 96,8 KB; el modelo declara +7,2/+9,5/+6,0 F1 en segmentación china |
| Modelos de sentence-similarity convencionales (p. ej. familia Sentence-BERT) | decenas o cientos de millones | 128-512 tokens | variable | GPU/CPU con PyTorch | no disponible en la información proporcionada |

No se dispone de comparaciones directas con modelos de similitud de frases de propósito general en la información proporcionada; la comparativa con BPE es la única referencia cuantitativa ofrecida por el autor.

## Limitaciones y advertencias

- Los benchmarks declarados no están verificados de forma independiente (`verified: false` en la model-index) y los valores de similitud son moderados o bajos en varios conjuntos (8,2 en PAWS-X, 10,5 en ATEC), lo que sugiere un rendimiento limitado fuera de los dominios de entrenamiento.
- El modelo está diseñado para un dispositivo concreto (Xteink X4 Pro con ESP32-S3 y firmware PapyriX); su uso fuera de ese entorno requiere adaptar el firmware o las referencias en Python.
- La longitud de contexto efectiva es de 256 bytes por ventana; entradas más largas deben dividirse y sumarse, lo que puede degradar la coherencia semántica en textos largos.
- Solo se declaran los idiomas chino e inglés; no hay soporte documentado para otros idiomas.
- El repositorio no registra descargas ni interacciones, y el tamaño del repo es de 0,0 GB, lo que puede indicar que los pesos no están disponibles públicamente o que el repositorio está vacío.
- No se documentan sesgos conocidos, pero al ser una destilación de Qwen3-32B, podría heredar sesgos de los profesores; no se proporciona información al respecto.
- El riesgo de alucinación se aborda mediante el bloqueo por cláusulas y la prohibición de nombres propios en el banco de cláusulas, pero no se documentan garantías fuera de ese mecanismo.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción ni sobre la exactitud de las métricas declaradas.

## Enlaces

- Hugging Face: https://huggingface.co/bobzhou0/Platonic-Engram-HNet-v2
- Página del proyecto: https://robertzhou.dev/work/platonic-engram-hnet/
- Repositorio GitHub: https://github.com/bobzhou-source/platonic-engram-hnet
- Documentación de arquitectura: https://github.com/bobzhou-source/platonic-engram-hnet/blob/main/ARCHITECTURE.md
- Benchmarks: https://github.com/bobzhou-source/platonic-engram-hnet/blob/main/BENCHMARKS.md
- Mapa de memoria: https://github.com/bobzhou-source/platonic-engram-hnet/blob/main/docs/memory-map.svg

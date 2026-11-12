# EugeneBoondock/sponge-compsearch

## Resumen

Sponge es un experimento de investigación publicado por EugeneBoondock que explora una vía alternativa al entrenamiento por descenso de gradiente: pequeños programas en Python puro y numpy que aprenden de un flujo de bytes en línea, un byte a la vez, sin fase de entrenamiento con GPU. El repositorio contiene dos artefactos: los propios aprendices (learners) y el sistema de búsqueda (`compsearch/`) que los generó, en el que un modelo de lenguaje propone algoritmos de aprendizaje y cada candidato se puntúa por su capacidad de comprimir texto que nunca ha visto.

La idea central es que la compresión es una medida directa de generalización: el aprendiz debe declarar su creencia sobre el siguiente byte antes de verlo, y su puntuación es el número de bits necesarios para codificar el flujo bajo esas predicciones, más el tamaño comprimido de su propio código fuente. No hay conjunto de test que filtrar porque cada byte se predice antes de observarse. El conocimiento se almacena como recuentos y un diario de todo lo visto, de modo que nada se sobrescribe.

Es relevante ahora como prueba de concepto de aprendizaje continuo sin olvido catastrófico y sin retropropagación, pero conviene subrayar que no es un modelo de lenguaje conversacional: es un memorizador de patrones de superficie, unas mil veces más lento que los compresores estándar, y el propio autor lo describe como un experimento, no un producto. No se dispone de información sobre arquitectura neuronal, parámetros ni longitud de contexto en el sentido habitual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Programa en Python puro + numpy; aprendizaje en línea byte a byte con mezcla de contextos (context mixing); sin descenso de gradiente |
| Parametros totales | no disponible (no es una red neuronal con pesos entrenados; el conocimiento son recuentos y un diario) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de contexto definida por el algoritmo, no publicada como cifra) |
| Tipos de cuantizacion | no aplica (no hay pesos que cuantizar) |
| Idiomas soportados | no disponible (evaluado con prosa en inglés, código Python y cabeceras C) |
| Licencia | no disponible |
| Formato de pesos | no aplica; se distribuyen scripts `.py` (`learners/v1_single_score.py`, `learners/v2_multi_score.py`, `seeds/sponge.py`) |

## Arquitectura y entrenamiento

No hay una arquitectura transformer ni MoE ni SSM. Cada aprendiz es un programa pequeño que procesa un flujo de bytes de forma secuencial: para cada byte emite primero una distribución de probabilidad sobre el siguiente byte y después recibe el valor real. La puntuación combina los bits necesarios para codificar el flujo bajo esas predicciones con el tamaño comprimido del código fuente del propio aprendiz, de modo que soluciones más simples se ven favorecidas. El conocimiento se materializa como tablas de recuentos más un registro histórico de todo lo observado, lo que explica que no haya olvido: nada se sobrescribe.

El entrenamiento no es tal en el sentido habitual. La "búsqueda" (`compsearch/`) usa un modelo de lenguaje para proponer nuevos algoritmos de aprendizaje; cada propuesta se evalúa por su compresión sobre texto no visto y las mejores sobreviven. Se documentan dos búsquedas: la primera puntuada sobre código fuente Python (ganadora: `v1_single_score.py`) y la segunda sobre un currículo multiparte con cinco objetivos simultáneos (ganadora: `v2_multi_score.py`). El punto de partida escrito a mano es `seeds/sponge.py`. No se especifican volúmenes de datos de entrenamiento, composición del dataset ni uso de RLHF o DPO, porque el paradigma no los emplea.

## Capacidades

- Predicción y compresión de flujos de bytes en línea, con puntuaciones de bits por byte sobre texto no visto.
- Aprendizaje continuo sin olvido: tras 400 KB de inglés, su coste sobre Python bajó un 2,5 % en lugar de subir.
- Memoria de un solo disparo: una cadena aleatoria cuesta 7,1 bits por byte la primera vez y 0,84 tras una exposición.
- Detección implícita de fronteras de palabra: 3,3 veces más sorpresa en la primera letra de una palabra que en su interior.
- Detección de erratas: el 82,5 % de las erratas plantadas caen en el 2 % de bytes más sorprendentes (el azar daría un 4 %).
- Confianza calibrada: cuando declara un 88 % de confianza acierta el 90 % de las veces.
- Independencia del orden: aprender A y luego B difiere como máximo un 0,7 % respecto a B y luego A.
- Clasificación de texto: un aprendiz por etiqueta, asignando la entrada a la etiqueta cuyo aprendiz la codifica con menos bits (modo `compsearch.classify`).
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking.

## Casos de uso

- Clasificación de fragmentos de código por lenguaje: con un aprendiz por lenguaje (Python, cabeceras C, Tcl) se alcanza un 97,9 % de acierto en fragmentos de 300 bytes de archivos no vistos, útil para enrutar ficheros en pipelines de análisis estático.
- Distinción entre código de test y código de biblioteca: el clasificador logra un 75,6 % frente al 50 % del azar, aprovechable como señal auxiliar en herramientas de calidad de código.
- Detección de anomalías y erratas en texto: al concentrar el 82,5 % de las erratas plantadas en el 2 % de bytes más sorprendentes, sirve para revisión ortográfica o control de calidad de corpus.
- Compresión de registros y texto estructurado en entornos con restricciones: al ser Python puro y numpy, se ejecuta sin GPU, lo que permite desplegarlo en dispositivos modestos donde no cabe un compresor más pesado, a costa de una velocidad de unos 3 KB/s.
- Investigación en aprendizaje continuo: su ausencia de olvido y su independencia del orden lo convierten en banco de pruebas para estudiar alternativas al descenso de gradiente y al reentrenamiento.
- Estimación de confianza calibrada en clasificación binaria o multietiqueta: la calibración observada (88 % declarado, 90 % real) permite umbrales fiables en tareas de filtrado.
- Enseñanza y experimentación con mezcla de contextos: el código de `compsearch/` y los aprendices sirven como material didáctico reproducible para estudiar compresión estadística sin dependencias pesadas.

## Benchmarks y rendimiento

Bits por byte sobre flujos de 1 MB; menor es mejor.

| Modelo | Python (flujo de búsqueda) | Python (reservado) | Prosa inglesa (nunca vista) |
|---|---|---|---|
| zlib -9 | 1,930 | 1,921 | 2,819 |
| bz2 -9 | 1,748 | 1,725 | 1,966 |
| xz -9e | 1,639 | 1,646 | 1,961 |
| brotli -11 | 1,605 | 1,616 | 1,917 |
| Sponge seed | 1,859 | 1,847 | 1,817 |
| Learner v1 | 1,466 | 1,476 | 1,530 |

Wikipedia (learner v1, primeros 12,9 MB de enwik8, con tope de 5 GB de RAM):

| Modelo | Bits por byte |
|---|---|
| zlib -9 | 2,954 |
| bz2 -9 | 2,339 |
| xz -9e | 2,154 |
| Learner v1 | 1,744 |

Currículo multiparte (reservado, no usado en ninguna búsqueda):

| Parte | Sponge seed | Learner v1 | Learner v2 |
|---|---|---|---|
| Python | 1,821 | 1,446 | 1,402 |
| Cabeceras C | 1,588 | 1,245 | 1,184 |
| Wikipedia | 2,784 | 2,306 | 2,172 |
| Adaptación (primeros 16 KB de cada tipo nuevo) | 2,836 | 2,342 | 2,291 |
| Retención (cada tipo al volver) | 1,948 | 1,555 | 1,478 |
| Puntuación (media más tamaño de código) | 2,207 | 1,799 | 1,729 |

Clasificación sobre fragmentos de 300 bytes de archivos no vistos:

| Tarea | Sponge seed | Baseline con zlib | Azar |
|---|---|---|---|
| Lenguaje (Python / cabecera C / Tcl) | 97,9 % | 95,0 % | 33,3 % |
| Propósito (código de test vs biblioteca) | 75,6 % | 75,6 % | 50,0 % |

Velocidad: el learner v1 procesa unos 3 KB/s en un núcleo, frente a 700-16.000 KB/s de los compresores de la tabla. El autor advierte que los compresores estadísticos como PPMd, PAQ y cmix no se ejecutaron y probablemente obtendrían mejores cifras, por lo que esta tabla no debe leerse como estado del arte.

## Requisitos de hardware

- No requiere GPU: Python puro y numpy, ejecutable en CPU.
- VRAM estimada: no aplica; el consumo relevante es RAM. El experimento con enwik8 se detuvo al alcanzar un tope de 5 GB de RAM tras 12,9 MB de texto, porque la memoria crece con todo lo leído.
- GPU recomendadas: ninguna.
- Cabe en cualquier GPU consumer y en CPU de gama baja; no hay requisito de acelerador.
- Opciones de despliegue: ejecución directa de los scripts Python; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, al no tratarse de un modelo de pesos.
- Latencia y throughput: aproximadamente 3 KB/s por núcleo para el learner v1, unas mil veces más lento que compresores estándar según el autor.

## Comparativa con modelos similares

| Modelo | Naturaleza | Parámetros | Contexto | Rendimiento (bits/byte, prosa inglesa) | Licencia |
|---|---|---|---|---|---|
| Sponge learner v1 | Programa Python + numpy, aprendizaje en línea | no disponible | no disponible | 1,530 | no disponible |
| zlib -9 | Compresor LZ77 + Huffman | no aplica | no aplica | 2,819 | licencia zlib |
| bz2 -9 | Compresor BWT | no aplica | no aplica | 1,966 | licencia BSD-like |
| xz -9e | Compresor LZMA | no aplica | no aplica | 1,961 | dominio público / LGPL |
| brotli -11 | Compresor LZ + diccionario estático | no aplica | no aplica | 1,917 | licencia MIT |

Comparado con compresores estadísticos como PPMd, PAQ o cmix no hay datos: el autor indica que no se ejecutaron. Frente a modelos de lenguaje de pesos abiertos no procede comparación directa, porque Sponge no es un modelo generativo conversacional.

## Limitaciones y advertencias

- No es un chatbot: predice bytes a partir de patrones de superficie y carece de conocimiento del mundo.
- Lentitud extrema: unos pocos kilobytes por segundo en Python puro, inviable para procesamiento de alto volumen.
- Ausencia de transferencia entre dominios: aprender Python primero solo mejora el inglés un 1 %; memoriza patrones pero no construye abstracciones transferibles.
- La mejora en adaptación es la más débil de la búsqueda 2 (2-6 % sobre v1), lo que limita su utilidad ante tipos de texto nuevos.
- El consumo de memoria crece con todo lo leído, lo que impide procesar corpus grandes sin un tope explícito.
- Los resultados en enwik8 solo cubren 12,9 MB de los 100 MB estándar y no son comparables con cifras publicadas.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de integrarlo en producción.
- Idiomas soportados no documentados; las evaluaciones se limitan a inglés, Python y cabeceras C.
- Riesgo de sesgo y alucinación en el sentido habitual no aplica de forma directa, pero al no modelar semántica sus predicciones no deben interpretarse como afirmaciones de hecho.
- Proyecto experimental sin descargas ni validación externa en el momento de la consulta.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/EugeneBoondock/sponge-compsearch
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.

# MR0b0t/tinynnue-edge

## Resumen

TinyNNUE Edge es un evaluador de posiciones de ajedrez de estilo NNUE (Efficiently Updatable Neural Network) desarrollado por MR0b0t. Se trata de una red neuronal de 102.721 parametros con arquitectura 769 → 128 → 32 → 1, entrenada sobre etiquetas generadas por Stockfish 19 y cuantizada a int8 tras el entrenamiento, con acumuladores int32 para inferencia entera. No es un motor de ajedrez: no incorpora busqueda y no es compatible con los ficheros `.nnue` de Stockfish.

El modelo resuelve un problema concreto: demostrar que un evaluador de ajedrez de tamano reducido puede ejecutarse con aritmetica entera exacta y actualizaciones incrementales bit a bit, lo que lo convierte en un caso de estudio de cuantizacion para despliegue en entornos con recursos limitados (edge). Su relevancia actual es mas pedagogica y de ingenieria que competitiva: documenta el proceso completo de entrenamiento, cuantizacion PTQ simetrica por tensor, exportacion a formatos binarios crudos y un nucleo de inferencia en C++.

El modelo se publica bajo licencia MIT, con pesos en safetensors (fp32) y dos ficheros binarios adicionales (int8 y fp32 en el layout que lee el codigo C++). El tamano del fichero int8 es de 103.244 bytes frente a los 410.900 bytes de la version fp32, una reduccion de aproximadamente 4x.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal feedforward tipo NNUE, 769 → 128 → 32 → 1 |
| Parametros totales | 102.721 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada de 769 caracteristicas binarias) |
| Tipos de cuantizacion | int8 con acumuladores int32 (PTQ simetrica por tensor); pesos fp32 disponibles |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors (fp32), binario crudo int8 (`tinynnue_int8.bin`), binario crudo fp32 (`tinynnue_fp32.bin`) |

## Arquitectura y entrenamiento

La red es un perceptron multicapa de tres capas con activaciones implicitas en la implementacion C++: una capa de entrada de 769 caracteristicas binarias, una capa oculta de 128 neuronas, una segunda capa de 32 neuronas y una salida escalar de 1 valor. La codificacion de entrada usa `plane*64 + square` para cada pieza (planos 0-5 para piezas blancas P, N, B, R, Q, K; planos 6-11 para negras; casillas a1=0 hasta h8=63), mas el indice 768 cuando mueven las blancas. La salida son centipeones desde el punto de vista de las blancas: en fp32 se calcula como `400 * net(x)`, mientras que la ruta int8 devuelve directamente centipeones enteros.

El entrenamiento se realizo sobre 108.960 posiciones tranquilas extraidas de partidas de Lichess de 2013, etiquetadas con busquedas de 10.000 nodos de Stockfish 19. Se excluyeron posiciones en jaque, posiciones cuya mejor jugada es una captura o promocion, y puntuaciones de mate. La cuantizacion es PTQ simetrica por tensor, con multiplicadores en punto fijo. Las actualizaciones incrementales enteras coinciden bit a bit con la recomputacion completa en 18.342 pasos de prueba (incluyendo enroque, al paso, promociones y deshacer). La innovacion tecnica destacable es precisamente esa equivalencia exacta entre actualizacion incremental y recalculo completo en aritmetica entera, algo poco habitual en implementaciones NNUE simplificadas.

## Capacidades

- Evaluacion estatica de posiciones de ajedrez en centipeones desde el punto de vista de las blancas.
- Inferencia en aritmetica entera (int8 con acumuladores int32) con equivalencia bit a bit respecto a la recomputacion completa.
- Actualizaciones incrementales de las acumulaciones de la primera capa ante cambios de posicion (movimientos, enroque, al paso, promociones, deshacer).
- Exportacion a formatos binarios crudos optimizados para lectura directa desde C++.
- Version fp32 de referencia para validacion y comparacion.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.
- No incorpora busqueda ni seleccion de jugadas; solo evalua posiciones dadas.

## Casos de uso

- Caso de estudio de cuantizacion int8 en produccion: sirve para ilustrar el flujo completo de PTQ simetrica por tensor, exportacion a binario crudo y validacion de equivalencia numerica frente a fp32, util en formacion de ingenieros y en documentacion tecnica.
- Evaluador ligero embebido en herramientas de analisis de partidas: al ocupar 103.244 bytes en int8, puede integrarse en utilidades de escritorio o moviles que necesiten una puntuacion aproximada de posiciones sin depender de un motor completo.
- Componente de juguete en proyectos de ajedrez educativo: permite ensenar como funciona una red NNUE y como se codifican las posiciones en caracteristicas binarias sin la complejidad de Stockfish.
- Benchmark de latencia en CPUs consumer: con 192 ns (fp32 incremental con `-ffast-math`) y 472-535 ns (int8 incremental) por evaluacion en un Ryzen 5 4600H, sirve para comparar tecnicas de vectorizacion y actualizacion incremental en C++.
- Validacion de pipelines de datos de ajedrez: el conjunto de etiquetas Stockfish 19 y el split de test de 6.072 posiciones permiten reproducir experimentos de evaluacion supervisada.
- Prueba de concepto de inferencia entera exacta: el hecho de que las actualizaciones incrementales coincidan bit a bit con el recalculo completo lo hace util como caso de prueba en sistemas que requieren determinismo numerico.
- Referencia para implementaciones NNUE simplificadas: el codigo C++ y el articulo asociado documentan el layout de pesos y el flujo de cuantizacion, lo que facilita portar el diseno a otros dominios.

## Benchmarks y rendimiento

Resultados sobre el split de test de 6.072 posiciones de partidas no vistas:

| Modelo | MSE en espacio WDL | MAE en cp (|etiqueta| ≤ 1000) |
|---|---|---|
| Conteo de material | 0,01737 | 195,2 |
| fp32 | 0,01086 | 146,9 |
| int8 | 0,01089 | 147,1 |

Diferencia int8 frente a fp32 en la salida: 7,1 cp de media, 25,4 cp en el percentil 99 y 39,2 cp de maximo. Tamano: 410.900 bytes en fp32 frente a 103.244 bytes en int8.

Latencia por evaluacion (AMD Ryzen 5 4600H, un hilo, g++ 13.3 sobre WSL2, medianas):

| Configuracion | Latencia |
|---|---|
| fp32 completo, `-O3 -march=native` | 3.830 ns |
| int8 incremental, `-O3 -march=native` | 535 ns |
| fp32 incremental, `-O3 -march=native -ffast-math` | 192 ns |
| int8 incremental, `-O3 -march=native -ffast-math` | 472 ns |

La ruta int8 no es mas rapida que fp32 en este codigo C++ escalar; sus ventajas son el fichero 4x mas pequeno y la exactitud de las actualizaciones incrementales.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo se ejecuta en CPU y ocupa 103.244 bytes en int8 o 410.900 bytes en fp32, por lo que cabe en cache L2 de cualquier CPU moderna.
- GPU recomendadas: no aplica; el codigo de referencia es C++ escalar para CPU.
- Cabe en cualquier GPU consumer y en cualquier CPU, incluidos sistemas embebidos con unos pocos cientos de kilobytes libres.
- Opciones de despliegue: nucleo C++ propio del repositorio `github.com/debtirthasaha/tinynnue-edge`; no hay soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: 192-3.830 ns por evaluacion segun configuracion en un Ryzen 5 4600H a un solo hilo; el throughput depende del bucle de llamada y no se ha publicado una cifra agregada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TinyNNUE Edge | 102.721 | 769 caracteristicas binarias | MAE 147,1 cp (int8) | MIT | HuggingFace + GitHub |
| Stockfish NNUE (red grande) | no disponible en la informacion proporcionada | no disponible | no disponible | GPLv3 (Stockfish) | Distribucion oficial de Stockfish |
| nnue-pytorch (referencia) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | Documentacion oficial de Stockfish |

No se dispone de datos comparativos publicados en la informacion proporcionada para establecer una comparacion cuantitativa con otras redes NNUE de ajedrez. La referencia mas cercana conceptualmente es la documentacion de `nnue-pytorch`, que el autor cita como base de diseno simplificada.

## Limitaciones y advertencias

- Precisión limitada como evaluador: 147 cp de error absoluto medio frente a Stockfish, lo que lo hace debil en terminos competitivos.
- Sobreajuste: MSE en espacio WDL de 0,0049 en entrenamiento frente a 0,0111 en validacion.
- Etiquetas ruidosas: las etiquetas provienen de busquedas de 10.000 nodos de Stockfish 19, con ruido asociado.
- Cobertura restringida: solo posiciones tranquilas de partidas de Lichess de 2013; se excluyen posiciones en jaque, capturas, promociones y puntuaciones de mate.
- Cuantizacion PTQ simetrica por tensor unicamente; no se exploraron esquemas por canal ni quantizacion consciente del entrenamiento.
- Latencia medida en un unico portatil bajo WSL2, por lo que no es representativa de otras plataformas.
- No es compatible con ficheros `.nnue` de Stockfish ni sustituye a un motor de ajedrez; carece de busqueda y de seleccion de jugadas.
- No procesa lenguaje natural ni soporta tool calling, agentes o capacidades multilingues.
- Licencia MIT para el modelo; las etiquetas se generaron con Stockfish 19 (GPLv3) usado como herramienta y no se redistribuyen, y las posiciones provienen de la base de datos abierta de Lichess (CC0).

## Enlaces

- HuggingFace: https://huggingface.co/MR0b0t/tinynnue-edge
- Repositorio GitHub (codigo, tests y nucleo C++): https://github.com/debtirthasaha/tinynnue-edge
- Articulo tecnico: https://debtirthasaha.github.io/blog/2026/tinynnue-edge/
- Dataset de etiquetas: https://huggingface.co/datasets/MR0b0t/tinynnue-stockfish-labels
- Documentacion de referencia nnue-pytorch: https://official-stockfish.github.io/docs/nnue-pytorch-wiki/docs/nnue.html

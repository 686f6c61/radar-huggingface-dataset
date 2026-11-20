# brandonlanexyz/Dualist-Hyper-v2.1

## Resumen

Dualist-Hyper-v2.1 es un motor de inteligencia artificial para el juego Othello (Reversi) publicado por el usuario brandonlanexyz en Hugging Face. No es un modelo de lenguaje: combina una red neuronal convolucional de 20.234.374 parametros (un Dual-Stream FiLM-SE-ResNet de 16 bloques y 256 canales) con un motor de busqueda C++20 multinucleo que emplea instrucciones AVX2/BMI2 sobre tableros representados como bitboards, y una tabla de evaluacion de 16 patrones entrenada integramente desde cero. El paquete incluye los pesos en safetensors y ONNX, una DLL de puente para Windows y una tabla binaria de evaluacion en formato propio.

El modelo resuelve el problema de la evaluacion de posiciones y la seleccion de jugadas en Othello con latencia baja. Segun la model card, en enfrentamientos pareados sin libro de aperturas y sin reutilizar los pesos empaquetados de Egaroucid, v2.1 con 6 hilos alcanza un 51,50 % de victorias (87V/32E/81D, +0,06 discos) contra Egaroucid Level 11 a tiempo igualado con 10,9 ms por jugada, y un 62,00 % de victorias (+1,09 discos, Elo estimado 2145) contra ese mismo nivel en busqueda profunda a 45,3 ms por jugada.

Es relevante para desarrolladores de motores de juego porque demuestra un pipeline completo de aprendizaje por refuerzo y destilacion de conocimiento hacia un motor de busqueda alfa-beta moderno (Negascout/YBWC, Lazy SMP, tablas de transposicion compartidas y poda por paridad cuasi-exacta), con artefactos listos para integrar desde Python o C++.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dual-Stream FiLM-SE-ResNet (16 bloques, 256 canales, SE r=4, FiLM cada 4 bloques) + motor de busqueda C++20 AVX2/BMI2 |
| Parametros totales | 20.234.374 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: entrada fija de tablero 8x8 + vector escalar de 32 dimensiones) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos FP32 en safetensors y ONNX) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | GPL-3.0 |
| Formato de pesos | safetensors, ONNX (FP32), tabla binaria propia `.egev2`, DLL nativa |

## Arquitectura y entrenamiento

La red `DualistNetHyper` recibe dos flujos de entrada. El espacial es un tensor `[B, 16, 8, 8]` con bitboards de jugador, oponente y casillas vacias, movimientos legales, fronteras, discos incondicionalmente estables, mascaras de paridad por cuadrante y planos de esquinas y bordes. El escalar es un vector `[B, 32]` con 16 valores de patron, fase de juego, movilidad, recuento de discos, estabilidad y caracteristicas de paridad. El tronco son 16 bloques residuales con atencion por canales (Squeeze-and-Excitation, `r=4`) y modulacion FiLM cada cuatro bloques, condicionada por un MLP de 128 dimensiones sobre los patrones. Produce cuatro salidas: `log_policy` de 65 clases (64 casillas mas el slot PASS), `pred_score` como diferencia final esperada de discos en `[-64, +64]`, `wdl_logits` de 3 clases y `dist_logits` de 129 bins.

El checkpoint neural corresponde al paso 15700 con pesos EMA y 4780 partidas jugadas. La tabla de evaluacion E.2 se entreno desde cero (inicializacion a cero) con AdaGrad disperso sin bloqueos, 8 hilos y sharding por fase, sobre 88.901.875 estados de tablero, con un MAE de validacion de 4,9814 discos sobre posiciones no vistas del holdout de Level 11. El motor v2.1 (fase F) incorpora actualizaciones incrementales de patrones AVX2 con 4 registros `__m256i` alineados a 128 bytes, corte de transposicion mejorado en dos pasadas, ordenacion de jugadas de final ligera con 4 patrones mas movilidad, resolucion exacta SIMD `solve_exact_1..4` con ordenacion por paridad cuasi-exacta, grupo persistente de hilos de 1 a 12 (optimo 6 nucleos fisicos en i7-8700K), Lazy SMP hibrido con YBWC interior en medio juego, YBWC puro en final exacto, tablas de transposicion compartidas con 65.536 shards y spinlocks de 4 vias (256,0 MiB + 192,0 MiB) mas tablas locales por hilo sin bloqueos para 5-10 vacios, y profundizacion iterativa con gestion de tiempo y Soft-Stop.

## Capacidades

- Evaluacion de posiciones de Othello con salida de politica, puntuacion esperada, probabilidad victoria/empate/derrota y distribucion de diferencia de discos.
- Busqueda alfa-beta de alto rendimiento: Negascout, YBWC, Lazy SMP, corte de transposicion mejorado y poda Endgame-MPC.
- Resolucion exacta de finales mediante `solve_exact_1..4` y cola exacta hasta 8 casillas vacias.
- Inferencia neural en PyTorch y ONNX (exportacion FP32 incluida).
- Integracion nativa con C++20 mediante cabecera `dualist_bridge.hpp` y DLL `egaroucid_bridge.dll`.
- Enlace desde Python mediante `bridge_binding.py` y `modeling_dualist.py`.
- Gestion de tiempo por jugada (`time_limit_ms`) con parada suave predictiva.
- Escalado multihilo configurable de 1 a 12 hilos.
- No soporta tool calling, agentes genericos, vision, audio ni capacidades multilingues: es un motor especifico de un juego.

## Casos de uso

- Integracion en un bot de Othello para servidores de juego: la DLL expone una interfaz C++ que permite consultar la mejor jugada con un limite de tiempo, adecuada para partidas en linea con presupuesto de 10-50 ms por movimiento.
- Analisis post-partida y anotacion automatica: las salidas `pred_score`, `wdl_logits` y `dist_logits` permiten estimar la diferencia esperada de discos y la probabilidad de victoria en cada posicion, util para generar informes de errores.
- Entrenamiento por refuerzo de agentes propios: el modelo sirve como oponente o como funcion de evaluacion de referencia en pipelines de RL, gracias a la politica enmascarada de 65 clases y a la cabeza de valor.
- Benchmarking de motores de Othello: el paquete incluye resultados reproducibles contra Egaroucid Level 11 y Level 17 sin libro de aperturas, lo que permite usarlo como baseline en comparaciones con `-nobook`.
- Investigacion en destilacion de redes neuronales hacia motores de busqueda: el par red + tabla E.2 entrenada desde cero documenta el proceso completo y permite experimentar con pesos de mezcla entre evaluacion neuronal y tabla de patrones.
- Despliegue en hardware de consumo: con 20,2 M de parametros y un motor optimizado para AVX2, cabe en un i7-8700K de 6 nucleos y alcanza 10,9 ms por jugada, por lo que es viable en equipos de sobremesa sin GPU.
- Desarrollo de interfaces graficas o moviles: la exportacion ONNX FP32 permite ejecutar la red en tiempo real para previsualizar evaluaciones mientras el motor nativo calcula la jugada definitiva.

## Benchmarks y rendimiento

Resultados declarados en la model card, todos con `-nobook` y sin reutilizar los pesos empaquetados de Egaroucid.

| Configuracion | Oponente | Partidas | Registro | Tasa de victoria | Dif. media de discos | Elo est. | Latencia |
|---|---|---|---|---|---|---|---|
| v2.1 tiempo igualado (`d13+ex20`, 6T, 60 ms) | Egaroucid Lv11 | 200 | 87V/32E/81D | 51,50 % | +0,06 | 2070 | 10,9 vs 9,4 ms |
| v2.1 busqueda profunda (`d17+ex23`, 6T, 140 ms) | Egaroucid Lv11 | 100 | 52V/20E/28D | 62,00 % | +1,09 | 2145 | 45,3 ms |
| v2.1 (`-nobook`) | Egaroucid Lv17 | 20 | 7V/4E/9D | 45,00 % | +0,10 | no disponible | 47,5 ms |

Comparativa directa v2.0 monohilo frente a v2.1 con 6 hilos en i7-8700K:

| Prueba | v2.0 (1T) | v2.1 (6T) | Mejora |
|---|---|---|---|
| XOT-20 Cold TT (`d11 + ex21`) | 108,75 ms/jugada | 38,64 ms/jugada | 2,81x mas rapido |
| XOT-20 Cold TT (`d13 + ex22`) | 385,42 ms/jugada | 107,10 ms/jugada | 3,60x mas rapido |
| XOT-20 solo medio juego (`d13`) | 24,88 ms/jugada (7,10M NPS) | 10,10 ms/jugada | 2,46x mas rapido |
| XOT-20 final exacto (`ex22`) | 1226,68 ms/jugada | 333,43 ms/jugada | 3,68x mas rapido |
| FFO `#40-#59` (`d13 + ex22`) | 18/20 (0,30 regret), 362,0 ms/pos | 18/20 (0,30 regret), 98,2 ms/pos (8T) | 3,69x mas rapido, 100 % paridad |

No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval o GSM8K, ya que no son aplicables a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo esta disenado para ejecucion en CPU y los pesos FP32 ocupan aproximadamente 80 MB (20,2 M parametros).
- GPU recomendadas: no disponibles; la model card no documenta ejecucion en GPU, solo PyTorch y ONNX.
- Cabe en GPU de consumo: si, en cualquier GPU con mas de 1 GB de VRAM para la red; el cuello de botella es la busqueda en CPU, no la red.
- CPU: la model card reporta como referencia un Intel i7-8700K (6 nucleos fisicos, 12 hilos) con AVX2 y BMI2; el optimo son 6 hilos fisicos.
- Opciones de despliegue: inferencia nativa via `egaroucid_bridge.dll` y `dualist_bridge.hpp` (C++20), enlace Python via `bridge_binding.py`, ONNX Runtime para `dualist_hyper_fp32.onnx` y PyTorch para `model.safetensors`.
- Latencia y throughput declarados: 10,9-11,0 ms por jugada en medio juego con 6 hilos; 10,9-11,0 millones de NPS monohilo en medio juego; 38,64 ms/jugada en `d11 + ex21`; 107,10 ms/jugada en `d13 + ex22`; 333,43 ms/jugada en final exacto `ex22` con YBWC.
- No se documentan requisitos para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Dualist-Hyper-v2.1 | Red + motor de busqueda Othello | 20,2 M (red) | no aplica | 51,50 % vs Lv11 a tiempo igualado; 62,00 % vs Lv11 en profundo; 45,00 % vs Lv17 | GPL-3.0 | Hugging Face, 0 descargas |
| Egaroucid (referencia) | Motor de busqueda con tabla de patrones | no disponible | no aplica | Nivel 11 y 17 usados como oponentes de referencia | no disponible en la informacion | Distribucion propia del proyecto Egaroucid |
| Dualist Hyper v2.0 | Version anterior, monohilo | 20,2 M (red) | no aplica | 55,00 % vs Lv11 a 104,0 ms; 2,46x-3,68x mas lento que v2.1 | GPL-3.0 (presumible, misma familia) | No se detalla en la informacion |
| Edax | Motor clasico de Othello | no disponible | no aplica | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion |

## Limitaciones y advertencias

- Especifico de Othello: no procesa lenguaje natural, imagenes ni audio; cualquier uso fuera del juego no esta soportado.
- La licencia GPL-3.0 impone obligaciones de copyleft: la redistribucion de binarios o derivados exige liberar el codigo fuente bajo la misma licencia, lo que puede ser incompatible con productos propietarios.
- La DLL `egaroucid_bridge.dll` es nativa de Windows; no se documenta soporte para Linux o macOS en la informacion disponible.
- Dependencia de instrucciones AVX2 y BMI2: el rendimiento declarado no se aplica a CPUs sin estas extensiones.
- Los conjuntos de datos de entrenamiento de Egaroucid (`Egaroucid_Train_Data.zip`), sus pesos (`eval.egev2`, `eval_move_ordering_end.egev`) y libros de aperturas (`book.egbk3`) no se redistribuyen, por lo que no es posible reproducir exactamente el pipeline completo solo con este repositorio.
- Los resultados de benchmarks son autoinformados por el autor y con tamanos de muestra reducidos en algunos casos (20 partidas contra Lv17, 100 contra Lv11 en busqueda profunda); la significacion estadistica es limitada.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente conocida.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero la cabeza de valor puede producir estimaciones de diferencia de discos poco calibradas en posiciones atipicas fuera de la distribucion de entrenamiento.
- Sesgos conocidos: no documentados; el entrenamiento se realizo sobre estados de tablero generados por el propio pipeline, lo que puede introducir sesgo hacia estilos de juego concretos.
- No se documentan limitaciones de idioma porque el modelo no procesa texto.

## Enlaces

- Hugging Face: https://huggingface.co/brandonlanexyz/Dualist-Hyper-v2.1
- Proyecto Egaroucid (oponente de referencia y origen del puente): no disponible en la informacion proporcionada
- Paper o blog tecnico del autor: no disponible en la informacion proporcionada
- Repositorio de codigo fuente: no disponible en la informacion proporcionada
- Demo interactiva: no disponible en la informacion proporcionada

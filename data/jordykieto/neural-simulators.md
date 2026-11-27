# jordykieto/neural-simulators

## Resumen

Neural Simulators es un repositorio de dos modelos del mundo (world models) compactos, condicionados por acciones, que funcionan como simuladores interactivos ejecutables en navegador. Cada fotograma se predice a partir de la salida previa del propio modelo, sin ejecutar nunca el simulador original. Lo desarrolla Jordy Kieto y se publica bajo el identificador `jordykieto/neural-simulators` en Hugging Face.

El repositorio contiene dos variantes: un modelo de transición para conducción autónoma en CARLA (CNN de un paso más MLP, 1,58 M de parámetros, 6,4 MB en fp32) que predice RGB 96×96, telemetría, waypoints de ruta y un embedding de LiDAR; y un modelo para el juego TinySkies (VAE más dinámica latente con GRU de dos capas, 3,79 M de parámetros, 15,2 MB en fp32) que predice el siguiente fotograma a través de un latente de 6×6×64.

Su relevancia radica en la eficiencia: ambos modelos se ejecutan en WASM en el navegador con tiempos de paso de 5,0 ms y 18,3 ms respectivamente en un Apple M1, lo que demuestra que es viable construir simuladores neuronales interactivos con modelos de pocos millones de parámetros. Los artefactos ONNX son idénticos byte a byte a los del demo desplegado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CARLA: CNN de un paso + MLP; TinySkies: VAE + GRU de 2 capas para dinámica latente |
| Parametros totales | CARLA: 1,58 M; TinySkies: 3,79 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de transición paso a paso, sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (se distribuye en fp32; ONNX y Keras) |
| Idiomas soportados | no disponible (modelo visual/control, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | ONNX y Keras (`.onnx`, `.keras`) |

## Arquitectura y entrenamiento

El modelo de CARLA es un modelo de transición de un solo paso: recibe visión (96×96×3), un latente de LiDAR de 64 dimensiones, telemetría de 5 dimensiones, 25 waypoints de 3 dimensiones y controles (acelerador, freno, volante), y devuelve el siguiente estado de cada modalidad. El codificador de LiDAR (BEV 64×64 a embedding de 64 dimensiones) se aplica una sola vez sobre la semilla inicial. La arquitectura combina una CNN para la parte visual con un MLP para el resto de señales.

El modelo de TinySkies emplea un VAE que comprime fotogramas RGB de 96×96 a un latente de 6×6×64, y una dinámica latente con GRU de dos capas que, a partir de un historial de cuatro latentes y del historial de controles, predice el siguiente latente. Los controles son tres: avance, freno y giro. Los datos de entrenamiento provienen de los datasets `jordykieto/carla-driving-demos` y `jordykieto/tinyskies-gameplay`; no se especifican en la información disponible el número de tokens, la composición exacta del dataset ni si hubo RLHF/DPO (no aplicable en este tipo de modelo).

## Capacidades

- Predicción de fotogramas visuales condicionada por acciones en entornos continuos.
- Simulación interactiva autorregresiva: cada paso se alimenta de la salida anterior del modelo.
- Predicción de telemetría (incluida velocidad, derivable mediante `20 * arctanh(telemetry[0,0])`).
- Predicción de waypoints de ruta (25 puntos de 3 dimensiones) en el modelo de CARLA.
- Codificación de LiDAR en un embedding latente de 64 dimensiones (aplicado sobre la semilla).
- Compresión y reconstrucción visual mediante VAE en TinySkies.
- Ejecución en navegador mediante WASM con ONNX Runtime.
- No dispone de tool calling, function calling, capacidades de agente, multilingües ni modo de razonamiento.

## Casos de uso

- Simulación de conducción en navegador: el modelo de CARLA permite conducir un vehículo virtual en tiempo real (20 Hz, 5 s por cada 100 pasos) sin ejecutar el simulador CARLA original, útil para demos interactivas y prototipos de bajo coste.
- Investigación en world models: sirve como banco de pruebas reproducible para estudiar dinámicas aprendidas, dado que los ONNX son idénticos a los del demo y la procedencia está documentada en `PROVENANCE.md`.
- Aumento de datos para conducción autónoma: la predicción de waypoints y telemetría puede emplearse para generar trayectorias sintéticas condicionadas por acciones en pipelines de entrenamiento por imitación.
- Docencia y divulgación: los modelos caben en un navegador y permiten explicar conceptos de modelos generativos condicionados por acciones con recursos mínimos.
- Prototipado de videojuegos neuronales: la variante TinySkies demuestra cómo sustituir el motor de un juego por una dinámica latente aprendida, aplicable a juegos con controles discretos o continuos simples.
- Evaluación de robustez de políticas: al poder simular rollouts autorregresivos, se pueden estudiar derivas y puntos fijos bajo entradas constantes, tal como se mide en el paper.
- Despliegue en dispositivos de borde: con 6,4 MB y 15,2 MB en fp32, ambos modelos son candidatos para inferencia en hardware limitado mediante ONNX Runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta tiempos de paso en WASM sobre un Apple M1: 5,0 ms para CARLA y 18,3 ms para TinySkies.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; los modelos ocupan 6,4 MB (CARLA) y 15,2 MB (TinySkies) en fp32, por lo que caben en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU moderna (RTX 4090, A100, H100) es sobredimensionada. El caso de referencia es CPU/WASM en Apple M1.
- Cabe en GPU consumer: sí, en cualquier GPU consumer actual e incluso en navegador.
- Opciones de despliegue: ONNX Runtime (incluido WASM en navegador), Keras (cargando los `.keras` con `tinyskies/model.py` del repositorio de GitHub).
- Latencia y throughput estimados: 5,0 ms por paso en CARLA (equivalente a 200 Hz teóricos, si bien el demo corre a 20 Hz) y 18,3 ms por paso en TinySkies en WASM sobre M1.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de modelos comparables en la información disponible.

## Limitaciones y advertencias

- Son aproximaciones compactas de porciones de sus entornos originales, no sustitutos de los mismos.
- El detalle visual fino nunca se reconstruye.
- La dinámica de velocidad de CARLA tiene poco amortiguamiento bajo acelerador sostenido intenso.
- Las entradas constantes llevan a ambos modelos a puntos fijos.
- El embedding de LiDAR de CARLA se codifica pero no se propaga por la dinámica.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor.
- El modelo de TinySkies se basa en el juego de Danny Limanseta; la imaginería del juego sigue siendo suya.
- No apto para tareas lingüísticas, de razonamiento textual ni de agentes.

## Enlaces

- Hugging Face: https://huggingface.co/jordykieto/neural-simulators
- Repositorio de código: https://github.com/JordyKieto/neural-simulators
- Paper (PDF): https://github.com/JordyKieto/neural-simulators/blob/main/paper/paper.pdf
- Demo en navegador: https://drift-sim-production.up.railway.app/
- Vídeo demo: https://youtu.be/FcPuaWpXE0w
- Dataset CARLA: https://huggingface.co/datasets/jordykieto/carla-driving-demos
- Dataset TinySkies: https://huggingface.co/datasets/jordykieto/tinyskies-gameplay
- Juego TinySkies original: https://github.com/dannylimanseta/tinyskies
- Otras investigaciones del autor: https://jordykieto.tech/research
- Proyecto PPO Hyrule: https://github.com/JordyKieto/ppo-hyrule
- Proyecto PufferMOBA Dyna: https://github.com/JordyKieto/puffermoba-dyna
- Imitación para conducción en CARLA: https://github.com/JordyKieto/carla-imitation-learning

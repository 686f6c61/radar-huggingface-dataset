# jordykieto/neural-simulators

## Resumen

Neural Simulator es un conjunto de dos modelos de mundo (*world models*) compactos y condicionados por acciones, desarrollados por Jordy Kieto y publicados en Hugging Face bajo el identificador `jordykieto/neural-simulators`. Cada modelo predice el siguiente fotograma a partir de su propia salida anterior, de modo que actúa como un simulador interactivo que se ejecuta íntegramente en el navegador sin invocar el simulador original. El primero emula la conducción en CARLA; el segundo emula el vuelo del juego TinySkies.

La relevancia de esta publicación es doble. Por un lado, demuestra que es posible comprimir dinámicas visuales interactivas en modelos de apenas 1,58 M y 3,79 M de parámetros, con tiempos de paso de 5,0 ms y 18,3 ms respectivamente en WebAssembly sobre un Apple M1. Por otro, distribuye los pesos en formato ONNX byte a byte idénticos a los del demo desplegado, junto con las fuentes Keras y un manifiesto con MD5 y firmas de entrada/salida de cada fichero, lo que facilita la reproducibilidad.

No se trata de un modelo de lenguaje: es un par de modelos generativos visuales orientados a simulación interactiva. La model card no especifica licencia, idiomas ni pipeline, y el repositorio ocupa 0,0 GB según Hugging Face, aunque la propia model card detalla tamaños de 6,4 MB (fp32) y 15,2 MB (fp32) para los dos modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CARLA: CNN de un paso + MLP de transición; TinySkies: VAE + GRU de 2 capas para dinámica latente |
| Parametros totales | CARLA: 1,58 M; TinySkies: 3,79 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; estado latente de 4 pasos en TinySkies) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32) |
| Idiomas soportados | no disponible (modelo visual, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | ONNX y Keras (`.keras`); también `.onnx` para despliegue |
| Tamaño en disco | CARLA: 6,4 MB fp32; TinySkies: 15,2 MB fp32 |
| Resolución de entrada | CARLA: RGB 96×96 + LiDAR BEV 64×64; TinySkies: RGB 96×96 |
| Latencia por paso (WASM, M1) | CARLA: 5,0 ms; TinySkies: 18,3 ms |

## Arquitectura y entrenamiento

El modelo de CARLA es un modelo de transición de un solo paso compuesto por una CNN que procesa la observación visual (RGB 96×96) y un MLP que fusiona esa representación con la telemetría (5 dimensiones), los waypoints de ruta (25×3), el latente LiDAR (64 dimensiones, codificado una sola vez sobre la semilla) y las acciones de control (acelerador, freno, volante). La salida son los siguientes valores de cada una de esas modalidades. El codificador LiDAR es una CNN que transforma una vista BEV de 64×64 en un embedding de 64 dimensiones.

El modelo de TinySkies emplea una arquitectura en dos etapas: un VAE que comprime cada fotograma RGB 96×96 en un latente de 6×6×64, y un modelo de dinámica latente basado en una GRU de 2 capas que recibe un historial de 4 latentes más el historial de controles y el control actual, y produce el siguiente latente, que se decodifica con el VAE. Ambos modelos se entrenaron presumiblemente sobre trayectorias del simulador original, aunque la model card no detalla el número de tokens, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables en este dominio). La innovación destacable es la ejecución completamente autoregresiva en el navegador vía ONNX Runtime Web, sin ejecutar el simulador fuente en ningún momento.

## Capacidades

- Generación autoregresiva de fotogramas visuales condicionada por acciones de control, sin acceso al simulador original.
- Predicción conjunta de RGB, telemetría, waypoints de ruta y embedding LiDAR en el modelo de CARLA.
- Simulación latente de vuelo con control de avance, freno y giro en TinySkies.
- Ejecución en navegador mediante WebAssembly con latencias de 5,0 ms y 18,3 ms por paso.
- Exportación a ONNX y Keras para integración en pipelines de inferencia.
- No soporta tool calling, function calling, agentes multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo *thinking*, visión general, audio ni otras capacidades multimodales más allá de la predicción visual descrita.

## Casos de uso

- Investigación en modelos de mundo: permite estudiar dinámicas visuales interactivas con modelos de menos de 4 M de parámetros, útil para experimentos académicos sobre compresión de simuladores.
- Demos interactivas en navegador: el par de modelos puede desplegarse como simulador jugable sin backend pesado, gracias a los 5,0 ms y 18,3 ms por paso en WASM.
- Prototipado de conducción autónoma: el modelo de CARLA predice telemetría y waypoints condicionados por controles, lo que permite probar lazos de control en un entorno emulado antes de pasar al simulador real.
- Educación y divulgación: sirve para explicar de forma tangible qué es un world model y cómo se entrena una dinámica condicionada por acciones.
- Evaluación de técnicas de compresión latente: el VAE de 6×6×64 de TinySkies es un banco de pruebas para estudiar cuánta información visual se conserva en latentes muy pequeños.
- Integración en pipelines de CI/CD para pruebas de regresión visual: los ONNX idénticos al demo desplegado permiten comparar predicciones byte a byte entre versiones del modelo.
- Benchmarking de inferencia en el navegador: útil para medir el rendimiento de ONNX Runtime Web en distintos hardware y navegadores con cargas conocidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta latencias por paso en WebAssembly sobre un Apple M1 (5,0 ms para CARLA y 18,3 ms para TinySkies) y remite al repositorio de GitHub para la evaluación completa descrita en el informe técnico.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en fp32 para ambos modelos (6,4 MB y 15,2 MB de pesos), más buffers de activación irrelevantes.
- GPU recomendadas: no requiere GPU; está diseñado para ejecutarse en CPU y en navegador vía WebAssembly. Cualquier GPU moderna (RTX 4090, A100, H100) ejecutaría la inferencia con holgura, pero no es el objetivo del proyecto.
- Cabe en cualquier GPU de consumo e incluso en dispositivos integrados; el límite práctico es el soporte de WebAssembly y ONNX Runtime Web del navegador.
- Opciones de despliegue: ONNX Runtime (Python y Web), Keras (cargando los ficheros `.keras` con `tinyskies/model.py` del repositorio de GitHub). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 5,0 ms por paso (CARLA) y 18,3 ms por paso (TinySkies) en WASM sobre M1, equivalente a 200 Hz y 54,6 Hz respectivamente en el mejor de los casos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / estado | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Neural Simulator (CARLA) | 1,58 M | estado visual 96×96 + telemetría + waypoints | ONNX, Keras | no disponible | World model de conducción |
| Neural Simulator (TinySkies) | 3,79 M | latente 6×6×64, historial de 4 pasos | ONNX, Keras | no disponible | World model de vuelo |
| GAIA-1 (Wayve) | no disponible en la información | no disponible | no disponible | no disponible | World model de conducción a gran escala |
| Genie (DeepMind) | no disponible en la información | no disponible | no disponible | no disponible | World model generativo interactivo |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada. La comparativa se limita a la categoría y al orden de magnitud de parámetros; los modelos citados como alternativas son referencias de la literatura y no se han evaluado aquí con las mismas métricas.

## Limitaciones y advertencias

- Son aproximaciones compactas de porciones de sus entornos originales, no sustitutos del simulador real; el detalle visual fino nunca se reconstruye.
- La dinámica de velocidad de CARLA tiene poco amortiguamiento bajo aceleración fuerte sostenida, lo que puede producirderivas irreales.
- Entradas constantes llevan a ambos modelos a puntos fijos, un comportamiento documentado y medido en el informe técnico.
- El embedding LiDAR de CARLA se codifica pero no se propaga por la dinámica, por lo que no influye en la evolución del estado.
- No hay información sobre sesgos, riesgo de alucinación visual ni evaluación de robustez fuera de las condiciones de entrenamiento.
- La licencia no está especificada en la model card, lo que impide confirmar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier despliegue productivo.
- Los fotogramas de TinySkies pertenecen a un juego de Danny Limanseta y no se redistribuyen en el repositorio, lo que puede limitar la reproducibilidad del entrenamiento.
- El modelo no es lingüístico: no admite prompts de texto, tool calling ni razonamiento simbólico.

## Enlaces

- Hugging Face: https://huggingface.co/jordykieto/neural-simulators
- Repositorio GitHub (código, paper y evaluación): https://github.com/JordyKieto/neural-simulators
- Demo en vivo: https://drift-sim-production.up.railway.app/
- Juego original TinySkies: https://github.com/dannylimanseta/tinyskies
- Informe técnico (cita BibTeX en la model card): Kieto, Jordy. *Neural Simulator: Lightweight World Models for Continuous Interactive Environments*, 2026.

# andrew-cartwheel/cartwheel-control

## Resumen

Cartwheel Control es una colección de políticas de control de cuerpo completo (*whole-body motion-tracking*) para robots humanoides, desarrolladas por Andrew Carr (usuario `andrew-cartwheel` en Hugging Face) y publicadas bajo la Cartwheel Open Model License. El modelo resuelve el problema de hacer que un humanoide en simulación siga una referencia de movimiento: a partir de las lecturas recientes de articulaciones e IMU y de los siguientes 10 fotogramas de una moción de referencia, la política emite objetivos de posición articular a 50 Hz.

El repositorio incluye tres políticas independientes, una por robot: RoboParty RP1 (28 articulaciones), Menlo Asimov-1 (25 articulaciones) y Unitree G1 (29 articulaciones). Cada carpeta contiene los pesos en `policy.safetensors`, un `config.json`, el modelo del robot en MJCF con mallas, un `robot.glb` con colores y por nodo de cuerpo, y mociones de ejemplo. El tamaño total del repositorio es de 0,3 GB y la librería es PyTorch.

Es relevante porque aborda una de las tareas centrales en robótica humanoide —el seguimiento de movimientos de referencia con control de cuerpo completo— y lo hace con pesos abiertos y un pipeline reproducible de simulación. No obstante, el propio autor advierte de que el modelo es solo para simulación y que ninguna de las políticas se ha ejecutado en hardware real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control para robótica; no se detalla la arquitectura de red en la información proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; ventana de observación compuesta por lecturas recientes de articulaciones e IMU más los siguientes 10 fotogramas de la moción de referencia |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Cartwheel Open Model License (pesos); modelos de robot de terceros con sus propias licencias; código Apache 2.0 |
| Formato de pesos | safetensors (`policy.safetensors`), con `config.json` asociado |
| Frecuencia de salida | 50 Hz (objetivos de posición articular) |
| Robots soportados | RoboParty RP1 (28 articulaciones), Menlo Asimov-1 (25 articulaciones), Unitree G1 (29 articulaciones) |
| Librería | PyTorch |
| Tamaño del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de las políticas (número de capas, tipo de red, tamaño de los parámetros ni esquema de entrenamiento). Lo que sí se especifica es la interfaz de la política: recibe como entrada las lecturas recientes de articulaciones e IMU del robot junto con los siguientes 10 fotogramas de una moción de referencia, y produce como salida objetivos de posición articular a 50 Hz. Se trata, por tanto, de un controlador de seguimiento de movimiento (*motion-tracking*) de cuerpo completo orientado a humanoides.

No se han publicado en la información proporcionada datos sobre el número de tokens o episodios de entrenamiento, la composición del dataset de mociones, ni si se emplearon técnicas de aprendizaje por refuerzo, imitación u otras. Tampoco se documentan innovaciones técnicas específicas más allá del propio esquema de control a 50 Hz con ventana de referencia de 10 fotogramas. Cada política se distribuye junto a su modelo de robot en MJCF y mallas, lo que permite reproducir la simulación.

## Capacidades

- Seguimiento de movimientos de referencia de cuerpo completo en robots humanoides en simulación.
- Generación de objetivos de posición articular a 50 Hz a partir de observaciones de articulaciones e IMU.
- Uso de una ventana de predicción de 10 fotogramas de la moción de referencia.
- Soporte para tres plataformas de robot distintas: RoboParty RP1 (28 articulaciones), Menlo Asimov-1 (25 articulaciones) y Unitree G1 (29 articulaciones).
- Inclusión de mociones de ejemplo para probar cada política.
- Visualización del robot con colores mediante `robot.glb`, con un nodo por cuerpo.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo; no es un modelo de lenguaje.

## Casos de uso

- Investigación en control de humanoides: usar las políticas como línea base reproducible para comparar nuevos controladores de seguimiento de movimiento en simulación sobre RP1, Asimov-1 o G1.
- Prototipado de pipelines de motion-tracking: integrar la política en un bucle de simulación que alimente lecturas de articulaciones e IMU y reciba objetivos articulares a 50 Hz para evaluar la viabilidad de una moción antes de llevarla a hardware.
- Evaluación de mociones de referencia: reproducir las mociones de ejemplo incluidas en `motions/` para medir la fidelidad de seguimiento y detectar movimientos problemáticos.
- Docencia y divulgación en robótica: el paquete incluye modelo MJCF, mallas, `robot.glb` y un comando de reproducción (`uv run cartwheel-play --robot rp1`), lo que facilita demostraciones en entornos docentes sin necesidad de robot físico.
- Desarrollo de herramientas de visualización: el `robot.glb` con un nodo por cuerpo permite construir visores o depuradores de pose y seguimiento articular.
- Benchmarking interno de simuladores: al fijar una política y una moción, se puede usar para comparar el comportamiento de distintos motores de física o configuraciones de simulación.
- Base para transferencia sim-to-real (futura): las políticas podrían servir como punto de partida para experimentos de transferencia, aunque el autor advierte de que no se han probado en hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio completo ocupa 0,3 GB, pero no se desglosa el tamaño de los pesos ni el consumo en ejecución.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; por el tamaño del repositorio (0,3 GB) es plausible que quepa en GPU de consumo, pero no se confirma en la información proporcionada.
- Opciones de despliegue: el flujo documentado usa `uv` con el repositorio de GitHub (`uv sync` y `uv run cartwheel-play --robot rp1`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: la política emite objetivos a 50 Hz, pero no se proporcionan cifras de latencia ni de throughput medidos.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos de control de cuerpo completo para humanoides con los que comparar parámetros, contexto, rendimiento, licencia o disponibilidad.

## Limitaciones y advertencias

- Solo simulación: el autor indica explícitamente que ninguna de las políticas se ha ejecutado en hardware real; no hay evidencia de transferencia sim-to-real.
- Sin datos de entrenamiento ni de arquitectura: no se documentan el dataset, el número de episodios, la arquitectura de red ni el proceso de entrenamiento, lo que dificulta la reproducibilidad científica.
- Sin benchmarks publicados: no hay métricas de seguimiento, estabilidad ni robustez que permitan evaluar el rendimiento de forma objetiva.
- Licencia restrictiva: los pesos se rigen por la Cartwheel Open Model License, no por una licencia de código abierto estándar; es necesario revisar sus términos antes de cualquier uso comercial.
- Licencias de terceros: los modelos de robot (`model/`, `robot.glb`) mantienen sus propias licencias, detalladas en el archivo NOTICE; su uso está sujeto a esas condiciones adicionales.
- Cobertura limitada a tres robots concretos: RP1, Asimov-1 y G1; no se indica generalización a otras plataformas.
- Sin soporte de lenguaje, visión ni tool calling: no es aplicable a tareas de NLP ni de agentes conversacionales.
- Sin datos de sesgos ni de alucinación: al no ser un modelo generativo de texto, estas categorías no aplican, pero tampoco se documentan modos de fallo del controlador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/andrew-cartwheel/cartwheel-control
- Perfil del autor: https://huggingface.co/andrew-cartwheel
- Repositorio de código: https://github.com/Cartwhl/cartwheel-control
- Licencia del modelo: https://huggingface.co/andrew-cartwheel/cartwheel-control/blob/main/LICENSE
- Aviso de licencias de terceros: https://huggingface.co/andrew-cartwheel/cartwheel-control/blob/main/NOTICE
- Licencia del código: https://github.com/Cartwhl/cartwheel-control/blob/main/LICENSE
- Vídeo de demostración: https://huggingface.co/andrew-cartwheel/cartwheel-control/resolve/main/assets/cartwheel-control.mp4

# humanoid-benchmark/act

## Resumen

ACT (Action Chunking Transformer) es un modelo de imitación para robótica publicado por el proyecto Humanoid Benchmark. Se trata de una implementación basada en el baseline `psi0/baselines/act` que combina un backbone ResNet18 para la codificación visual con un transformer encoder-decoder y una cabeza VAE para modelar la multimodalidad de las demostraciones. El modelo predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que reduce el error de composición acumulado en tareas de manipulación de horizonte medio.

Los checkpoints publicados cubren tres tareas del Humanoid Benchmark: recoger un barril de chips y depositarlo en un cubo con pedal (robot Unitree G1), verter agua de una jarra a un vaso y desenroscar el tapón de una botella (ambas con el robot H2 equipado con manos Sharpa). Cada tarea se entrenó con 100 demostraciones, 20 épocas y batch global 696 (87 por GPU en 8 GPUs), guardándose checkpoints en las épocas 10 y 20.

El interés del modelo es doble: por un lado, proporciona una línea base reproducible y empaquetada para evaluación de políticas de imitación en robótica humanoide; por otro, cada carpeta de checkpoint es autocontenida (pesos, configuración, estadísticas de normalización y `protocol.json`), lo que facilita su despliegue y comparación con otros métodos del benchmark. El repositorio ocupa 1,0 GB y los pesos están en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking Transformer (ResNet18 + transformer encoder-decoder + cabeza VAE) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre observaciones por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin entrada/salida de texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | robotics (imitación / control) |
| Entrada de estado (G1) | 44-D (29 ángulos articulares + 6 + 6 valores medidos de mano + 3 gravedad proyectada) |
| Entrada de estado (H2) | 78-D (75 ángulos articulares + 3 gravedad proyectada) |
| Velocidades articulares | no incluidas |
| Tareas publicadas | `b6-pedal-bin`, `a18-pour-water`, `a17-unscrew-bottle` |
| Demostraciones por tarea | 100 |
| Épocas de entrenamiento | 20 (checkpoints en época 10 y 20) |
| Batch global | 696 (87 por GPU × 8 GPUs, un nodo por ejecución) |
| Aumento de datos | Humanoid Benchmark online data augmentation spec v2 (aumento de imagen propio desactivado) |
| Tamaño del repo | 1,0 GB |

## Arquitectura y entrenamiento

ACT sigue el diseño de Action Chunking Transformer: un ResNet18 procesa las imágenes de cámara y produce un vector de características visuales que se concatena con el estado propioceptivo del robot (44-D en G1, 78-D en H2, sin velocidades articulares). Ese vector alimenta un transformer encoder-decoder que genera un chunk de acciones futuras en lugar de una única acción por paso. La cabeza VAE (con una variable latente estilo CVAE) modela la distribución multimodal de las trayectorias humanas, lo que permite representar distintas estrategias válidas para una misma tarea sin colapsar a la media.

El entrenamiento se realizó sobre el Humanoid Benchmark con 100 demostraciones por tarea, 20 épocas, batch global 696 repartido en 8 GPUs (87 por GPU) y un nodo por ejecución. Se aplicó la especificación de aumento de datos online v2 del benchmark, desactivando el aumento de imagen propio del modelo. Cada carpeta de checkpoint es autocontenida e incluye pesos, configuración, estadísticas de normalización, `protocol.json` y los registros simples de entrenamiento (plan, logs, métricas) para reproducibilidad; no se incluyen estados de optimizador, scheduler, RNG ni DeepSpeed. El código adaptador de entrenamiento e inferencia está en `code/`.

## Capacidades

- Control robótico por imitación: genera chunks de acciones a partir de observaciones visuales y propioceptivas.
- Manipulación diestra con manos Sharpa en el robot H2 (verter agua, desenroscar tapones).
- Manipulación con robot humanoide Unitree G1 (recoger y depositar objetos).
- Modelado multimodal de trayectorias mediante VAE, útil cuando existen varias soluciones válidas.
- Evaluación reproducible: cada checkpoint incluye `protocol.json` y estadísticas de normalización.
- No soporta tool calling, function calling, agentes, texto, visión general, audio ni razonamiento simbólico; su ámbito es exclusivamente el control motor por imitación.

## Casos de uso

- Línea base para investigación en imitación: usar los checkpoints de época 10 y 20 como referencia al comparar nuevos métodos sobre las mismas tareas del Humanoid Benchmark, gracias a que el protocolo de evaluación y las estadísticas de normalización están empaquetados.
- Despliegue en Unitree G1 para la tarea `b6-pedal-bin`: cargar el checkpoint, alimentar el estado de 44-D y las imágenes de cámara, y ejecutar el chunk de acciones para recoger el barril y accionar el pedal del cubo.
- Manipulación fina con H2 y manos Sharpa: reutilizar el checkpoint de `a17-unscrew-bottle` para estudiar el control de dedos y muñeca en tareas de precisión con 75 articulaciones.
- Vertido de líquidos: emplear `a18-pour-water` como punto de partida para experimentos de control de orientación y velocidad en tareas de trasvase.
- Ajuste fino con pocas demostraciones: partir de los pesos publicados y reentrenar con un conjunto reducido de demostraciones propias para nuevas variantes de objeto o posición.
- Evaluación comparativa de aumentos de datos: reproducir el pipeline con la spec v2 del benchmark y medir el efecto del aumento online frente al aumento de imagen del modelo.
- Docencia y prototipado en robótica: el tamaño de repo (1,0 GB) y el formato safetensors permiten montar un entorno de inferencia en un solo nodo sin infraestructura pesada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe configuración de entrenamiento y tareas, pero no incluye tasas de éxito, métricas de error ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repo pesa 1,0 GB, lo que sugiere que los pesos caben holgadamente en GPUs de consumo, pero no se confirma el pico de memoria en ejecución.
- GPU recomendadas: no disponible. El entrenamiento usó 8 GPUs por ejecución (batch 87 por GPU), pero no se especifica el modelo de GPU.
- GPU de consumo: probablemente viable por tamaño de pesos, aunque no hay confirmación oficial.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un modelo de robótica, el despliegue se realiza mediante el código adaptador incluido en `code/` y el `protocol.json` de cada checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT (este modelo) | Imitación robótica (ResNet18 + transformer + VAE) | no disponible | no aplica | no disponible | Hugging Face, 3 tareas |
| Diffusion Policy | Imitación robótica (difusión) | no disponible | no aplica | no disponible | Referencia habitual en benchmarks de manipulación |
| VQ-BeT | Imitación robótica (tokenización discreta) | no disponible | no aplica | no disponible | Referencia habitual en benchmarks de manipulación |

No se dispone de datos numéricos comparativos en la información proporcionada para establecer diferencias de rendimiento entre estas alternativas.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Entrenado con solo 100 demostraciones por tarea, lo que limita la generalización a variaciones de objeto, iluminación o posición no vistas.
- Específico de dos plataformas (Unitree G1 y H2 con manos Sharpa) y de las dimensiones de estado exactas (44-D y 78-D); no es transferible sin reentrenamiento.
- No incluye velocidades articulares en la entrada, lo que puede limitar tareas que requieran información dinámica.
- Riesgo de fallo silencioso en producción: al no publicarse tasas de éxito ni métricas, no hay garantía cuantificada de robustez.
- No se incluyen estados de optimizador, scheduler, RNG ni DeepSpeed, por lo que la reproducción exacta del entrenamiento no es posible desde el repo.
- Sesgos conocidos: no documentados; en imitación, los sesgos de las demostraciones humanas (velocidad, estilo, precisión) se transfieren a la política.
- No apto para tareas de lenguaje, visión general, agentes o tool calling.

## Enlaces

- Hugging Face: https://huggingface.co/humanoid-benchmark/act
- Repositorio de referencia del baseline citado en la model card: `psi0/baselines/act` (no se proporciona URL directa en la información disponible)
- Paper de ACT (Action Chunking Transformer): no disponible en la información proporcionada
- Blog o demo del Humanoid Benchmark: no disponible en la información proporcionada

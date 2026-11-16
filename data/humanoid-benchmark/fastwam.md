# humanoid-benchmark/fastwam

## Resumen

FastWAM es un modelo de acción-mundo (world action model) para robótica humanoide, publicado por el colectivo `humanoid-benchmark` en Hugging Face. Combina un experto de vídeo basado en Wan2.2-TI2V-5B con un experto de acción de 1.020 millones de parámetros, articulados mediante una arquitectura de mezcla de transformers (mixture-of-transformers). El modelo se entrena por imitación sobre tareas del Humanoid Benchmark, con 100 demostraciones por tarea.

El modelo parte de los pesos base de `Wan-AI/Wan2.2-TI2V-5B` y se afina entrenando el DiT completo (experto de vídeo y experto de acción), mientras que el VAE de Wan2.2 y el codificador de texto T5 permanecen congelados. El entrenamiento usa batch global de 512 (16 por GPU en 32 GPUs), 4000 pasos y checkpoints en los pasos 2000 y 4000.

Es relevante porque propone un enfoque de modelo mundo-acción multimodal para control de robots humanoides (Unitree G1 y H2), con entradas de estado propioceptivo y cámaras múltiples, y porque publica checkpoints autocontenidos con estadísticas de normalización y `protocol.json` para evaluación y despliegue reproducible. En el momento de la consulta no hay checkpoints de benchmark publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-transformers (world action model): experto de vídeo DiT Wan2.2-TI2V-5B + experto de acción de 1.02 B; VAE y T5 congelados |
| Parametros totales | no disponible (experto de acción: 1.02 B; experto de vídeo: derivado de Wan2.2-TI2V-5B, tamaño no confirmado en la informacion) |
| Parametros activos | no disponible (no es MoE en el sentido habitual; mezcla de expertos transformer) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el codificador de texto es T5, pero no se especifican idiomas) |
| Licencia | no disponible |
| Formato de pesos | no disponible (se mencionan pesos, configuración y estadísticas de normalización en cada carpeta de checkpoint, sin especificar formato) |

## Arquitectura y entrenamiento

FastWAM es un modelo mundo-acción compuesto por dos expertos transformer: un experto de vídeo DiT inicializado desde Wan2.2-TI2V-5B y un experto de acción de 1.020 millones de parámetros. Ambos se entrenan de extremo a extremo (el DiT completo), mientras que el VAE de Wan2.2 y el codificador de texto T5 se mantienen congelados. Las cámaras se concatenan en un único fotograma para los modelos Delta Flow, DiT4DiT y FastWAM, a diferencia de otros modelos que usan una imagen por cámara.

El entrenamiento se realiza por imitación con 100 demostraciones por tarea, batch global de 512 (16 por GPU en 32 GPUs), 4000 pasos y checkpoints en los pasos 2000 y 4000. Se aplica la especificación de aumento de datos online v2 del Humanoid Benchmark (15 efectos fotométricos, geométricos, de sensor y de iluminación, uno de ellos amplificado 1.5x por muestra) con el aumento de imagen propio del modelo desactivado, además de sesgo y ruido en los ángulos articulares de la propiocepción. Las entradas son estado G1 de 44 dimensiones (29 ángulos articulares + 6 + 6 valores medidos de manos + 3 de gravedad proyectada) y estado H2 de 78 dimensiones (75 ángulos articulares + 3 de gravedad proyectada), sin velocidades articulares. Las cámaras son vista ego + pecho en G1 y cabeza + pecho en H2 (los reentrenamientos de 2026-11-12/13 con 3 cámaras añadieron la muñeca derecha).

## Capacidades

- Control de robots humanoides mediante imitación: genera acciones a partir de estado propioceptivo y observaciones de cámara.
- Modelado mundo-acción: el experto de vídeo DiT permite representar dinámica visual y el experto de acción produce comandos motores.
- Entrada multimodal: estado propioceptivo (44-D para G1, 78-D para H2) e imágenes de múltiples cámaras concatenadas.
- Soporte de dos plataformas de robot: Unitree G1 y H2.
- Checkpoints autocontenidos para evaluación y despliegue: pesos, configuración, estadísticas de normalización y `protocol.json`.
- Código adaptador incluido para entrenamiento e inferencia (`code/` con `VERSIONS.json` de commits y versiones).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión general, audio: no disponible (la visión se limita a las cámaras del robot).

## Casos de uso

- Manipulación humanoide con Unitree G1: el modelo recibe el estado de 44 dimensiones y las cámaras ego y pecho para generar acciones articulares en tareas del Humanoid Benchmark, aprovechando el entrenamiento por imitación con 100 demostraciones por tarea.
- Control de Unitree H2: con estado de 78 dimensiones y cámaras de cabeza y pecho, el modelo produce comandos para las 75 articulaciones del robot en tareas de benchmark.
- Investigación en modelos mundo-acción: el experto de vídeo DiT permite estudiar la representación de dinámica visual como señal auxiliar para el aprendizaje de políticas.
- Evaluación reproducible de políticas: cada carpeta de checkpoint incluye `protocol.json` con tarea, datos, dimensiones de entrada/salida, cámaras, batch, pasos, aumento de datos y lista de ficheros, lo que facilita replicar experimentos.
- Aumento de datos y robustez: el uso de la especificación de aumento v2 (15 efectos) y de ruido en propiocepción sirve como referencia para entrenar políticas robustas a variaciones de iluminación, cámara y sensor.
- Despliegue en pipelines de investigación con DeepSpeed: el entrenamiento documentado con 32 GPUs y batch 512 sirve de base para reproducir el ajuste fino sobre nuevas tareas.
- Comparación de arquitecturas de imitación: al compartir entradas y protocolo con Delta Flow y DiT4DiT, permite comparar el enfoque de concatenación de cámaras frente a entradas separadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El experto de vídeo deriva de Wan2.2-TI2V-5B (5 B) y el experto de acción tiene 1.02 B, pero no se especifican requisitos de memoria.
- GPU recomendadas: el entrenamiento documentado usa 32 GPUs con 16 muestras por GPU (batch global 512); no se indica el modelo de GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se especifican (vLLM, llama.cpp, Ollama o TGI no están documentados para este modelo; el código adaptador se incluye en `code/`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FastWAM | Experto de acción 1.02 B + experto de vídeo Wan2.2-TI2V-5B | no disponible | Estado G1 44-D / H2 78-D; cámaras concatenadas en un frame | no disponible | Checkpoints de benchmark no publicados aún |
| Delta Flow | no disponible | no disponible | Mismas entradas; cámaras concatenadas en un frame | no disponible | Mencionado en la model card |
| DiT4DiT | no disponible | no disponible | Mismas entradas; cámaras concatenadas en un frame | no disponible | Mencionado en la model card |
| Otros modelos del Humanoid Benchmark | no disponible | no disponible | Mismas entradas; una imagen por cámara | no disponible | Mencionados en la model card |

## Limitaciones y advertencias

- No hay checkpoints de benchmark publicados en el momento de la consulta; la tabla de checkpoints de la model card está vacía.
- El modelo está entrenado específicamente para tareas del Humanoid Benchmark con 100 demostraciones por tarea; su generalización a otras tareas o robots no está documentada.
- Las entradas están restringidas a estado propioceptivo sin velocidades articulares y a las cámaras definidas por protocolo; la cámara en tercera persona de los datasets no se usa como entrada.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada.
- Licencia no disponible: no se puede confirmar el uso comercial.
- Idiomas soportados no disponibles; el codificador T5 está congelado y no se documenta su uso lingüístico.
- El estado de reanudación de entrenamiento (optimizador, scheduler, RNG, DeepSpeed) no se incluye en los checkpoints, solo registros simples de entrenamiento.
- Los requisitos de hardware y latencia no están documentados, lo que dificulta planificar el despliegue en producción.

## Enlaces

- Hugging Face: https://huggingface.co/humanoid-benchmark/fastwam
- Repositorio upstream: https://github.com/yuantianyuan01/FastWAM (commit 7faa711)
- Pesos base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B

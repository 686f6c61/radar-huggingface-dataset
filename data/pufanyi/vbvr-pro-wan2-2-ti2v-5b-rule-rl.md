# pufanyi/VBVR-Pro-Wan2.2-TI2V-5B-Rule-RL

## Resumen

VBVR-Pro Wan2.2 TI2V-5B Rule-RL es un modelo de generación de vídeo condicionado por imagen, desarrollado por pufanyi, que parte del modelo base Wan-AI/Wan2.2-TI2V-5B-Diffusers y se optimiza mediante aprendizaje por refuerzo basado en reglas (rule-based reinforcement learning) específicas de tarea. Su objetivo es mejorar la capacidad de razonamiento visual y la precisión en tareas de vídeo condicionadas por una primera imagen, un área emergente que combina generación de vídeo con razonamiento simbólico y espacial.

El modelo se distribuye como un checkpoint completo en formato Diffusers, que incluye transformer, text encoder, tokenizer, VAE y scheduler, junto con un pipeline personalizado que expone seis configuraciones de muestreo (Flow-CPS con distintos coeficientes, Euler y UniPC). Está entrenado sobre el dataset Video-Reason/VBVR-Pro-RL y dirigido a investigación, no a producción directa. Con aproximadamente 5.000 millones de parámetros, es un modelo de tamaño medio que puede ejecutarse en GPUs de consumo como una RTX 4090, tal y como indica la documentación del modelo base Wan2.2.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión de vídeo con MoE (Mixture-of-Experts) basada en Wan2.2-TI2V-5B |
| Parámetros totales | 4.999.787.712 (5B) |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible (modelo de vídeo, no de texto) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Wan2.2-TI2V-5B, que emplea un enfoque de difusión de vídeo con arquitectura MoE (Mixture-of-Experts). Esto permite separar el proceso de eliminación de ruido a lo largo de los timesteps con expertos especializados, aumentando la capacidad total del modelo sin incrementar el coste computacional por paso. En este checkpoint, el transformer se adapta para tareas de image-to-video, con un VAE que se mantiene en float32 para una decodificación estable.

El entrenamiento se realizó mediante aprendizaje por refuerzo basado en reglas deterministas, utilizando el método Flow-CPS (Continuous Perturbation Schedule) con coeficiente 0.7. Se generaron rollouts en la resolución de 512×512 con 81 frames, y se evaluaron las trayectorias con recompensas de reglas específicas de la tarea. El dataset de entrenamiento es Video-Reasoning-VBVR-Pro-RL, en su revisión `ca0aaffea93b07d269c6fe2fbfe533f1fdab9aa1`. El modelo base se mantiene intacto en cuanto a arquitectura; solo se optimizan los pesos del transformer mediante RL.

## Capacidades

- Generación de vídeo condicionado por una primera imagen (image-to-video) con control de resolución, número de frames y FPS de salida.
- Razonamiento visual: el modelo está optimizado para seguir instrucciones que requieren identificar objetos, comprender relaciones espaciales y ejecutar movimientos coherentes en el vídeo generado.
- Soporte para múltiples samplers de inferencia: Flow-CPS (con coeficientes 0.1, 0.3, 0.7, 0.9), Euler ODE y UniPC, seleccionables por llamada.
- Integración completa con la librería Diffusers (versión 0.37.1 o superior), permitiendo cargar el pipeline con `trust_remote_code=True`.
- Compatibilidad con el pipeline estándar de Diffusers para Wan2.2 (`WanImageToVideoPipeline`) sin necesidad de código personalizado, para uso determinista.
- Capacidades multilingües limitadas a inglés y alemán, según la model card.

## Casos de uso

- Investigación en razonamiento visual: el modelo puede generar secuencias de vídeo que ilustren trayectorias de razonamiento espacial, por ejemplo, mover un objeto marcado hacia un destino, útil para evaluar y mejorar sistemas de IA que necesiten comprender relaciones físicas en entornos simulados.
- Simulación de escenarios robóticos: se puede utilizar para generar vídeos de prueba de movimientos de objetos en entornos controlados, sirviendo como datos de entrenamiento sintéticos para políticas de control robótico basadas en visión.
- Generación de datos sintéticos de vídeo: en proyectos de visión por computador, el modelo permite crear vídeos etiquetados con instrucciones de razonamiento, ampliando datasets sin necesidad de captura real.
- Evaluación de modelos de generación de vídeo: el pipeline con los seis samplers permite comparar la calidad de generación bajo diferentes métodos de muestreo, útil para estudios de rendimiento en generación de vídeo.
- Prototipos de interfaces de usuario interactivas: se puede integrar en demos que conviertan una imagen y una instrucción textual en un vídeo animado, para validar conceptos de diseño o narrativa visual.
- Análisis de consistencia temporal: el modelo, al estar optimizado con RL para tareas específicas, puede servir para estudiar cómo el aprendizaje por refuerzo afecta a la coherencia temporal en vídeos generados.

## Benchmarks y rendimiento

La model card reporta los resultados agregados del benchmark VBVR-Pro-Bench, correspondientes a la tabla 8 del paper del modelo, bajo las configuraciones recomendadas (512 × 512, 81 frames, 16 FPS, 30 pasos, guidance scale 1.0):

| Sampler | Método de inferencia | Coeficiente CPS | Puntuación global |
|---|---|---|---|
| cps-0.1 | Flow-CPS | 0.1 | 0.509 |
| cps-0.3 | Flow-CPS | 0.3 | 0.526 |
| cps-0.7 | Flow-CPS | 0.7 | **0.548** |
| cps-0.9 | Flow-CPS | 0.9 | 0.539 |
| euler | FlowMatch Euler ODE | — | 0.522 |
| unipc | UniPC ODE | — | 0.522 |

Estos resultados son evaluaciones del propio autor y no garantizan el mismo rendimiento en otras configuraciones o prompts. No se proporcionan datos de benchmarks generales como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: el tamaño del repositorio es de 22.8 GB, por lo que se recomienda al menos 24 GB de VRAM para cargar el modelo completo en bfloat16. Con CPU offloading (como se muestra en el ejemplo de uso) se puede reducir el pico de VRAM, aunque la inferencia será más lenta.
- GPU recomendada: NVIDIA RTX 4090 (24 GB) o superior, ya que el modelo base Wan2.2 se ejecuta en GPUs de consumo. Para mayor velocidad, se recomienda A100 40 GB o H100.
- En GPUs de consumo con 16 GB (como RTX 4080) se puede intentar con cuantificación o cargando el VAE en float32 y el transformer en bfloat16, pero el rendimiento puede ser limitado.
- Opciones de despliegue: el modelo se integra con Diffusers, por lo que puede usarse con bibliotecas de servidor como vLLM (si se adapta), o mediante scripts personalizados con `diffusers`. No se menciona soporte para llama.cpp o Ollama, ya que es un modelo de vídeo.
- Latencia y throughput: no disponible en la información proporcionada; depende de la GPU, el número de pasos de inferencia y la resolución.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VBVR-Pro Wan2.2 TI2V-5B Rule-RL (este) | 5B | No disponible | Image-to-video con RL | Apache 2.0 | HuggingFace |
| Wan2.2-TI2V-5B (base) | 5B | No disponible | Image-to-video | Apache 2.0 | HuggingFace |
| Wan2.2-TI2V-5B-Turbo | 5B | No disponible | Image-to-video en 4 pasos | Apache 2.0 | GitHub/HuggingFace |

La principal diferencia con el modelo base es la optimización mediante RL para tareas de razonamiento visual, lo que mejora la precisión en tareas específicas pero no en la generación general. El modelo Turbo está orientado a inferencia rápida (4 pasos) y no incorpora el componente de RL. No se dispone de comparativa cuantitativa entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo es un artefacto de investigación: puede producir trayectorias de razonamiento incorrectas o visualmente inconsistentes, y no debe usarse como base única para decisiones de alto riesgo.
- Los resultados son más directamente comparables bajo las configuraciones de evaluación recomendadas (512×512, 81 frames, 16 FPS, 30 pasos, guidance scale 1.0); variar estos parámetros puede degradar el rendimiento.
- El modelo hereda las limitaciones y posibles sesgos del modelo base Wan2.2 y de su conjunto de datos de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero se debe respetar la atribución del modelo base Wan2.2 según sus términos.
- No se han publicado resultados de benchmarks generales (MMLU, HumanEval, etc.) para este modelo, por lo que su rendimiento fuera del dominio de vídeo es desconocido.
- La inferencia con el pipeline personalizado requiere cargar código remoto (`trust_remote_code=True`), lo que implica riesgos de seguridad; se recomienda revisar el código y fijar una revisión específica en producción.

## Enlaces

- [HuggingFace: pufanyi/VBVR-Pro-Wan2.2-TI2V-5B-Rule-RL](https://huggingface.co/pufanyi/VBVR-Pro-Wan2.2-TI2V-5B-Rule-RL)
- [Modelo base: Wan-AI/Wan2.2-TI2V-5B-Diffusers](https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B-Diffusers)
- [Dataset: Video-Reason/VBVR-Pro-RL](https://huggingface.co/datasets/Video-Reason/VBVR-Pro-RL)
- [Repositorio de entrenamiento: pufanyi/vbvr-rl](https://github.com/pufanyi/vbvr-rl)
- [GitHub de Wan2.2: Wan-Video/Wan2.2](https://github.com/Wan-Video/Wan2.2)
- [GitHub de Wan2.2-TI2V-5B-Turbo](https://github.com/quanhaol/Wan2.2-TI2V-5B-Turbo)

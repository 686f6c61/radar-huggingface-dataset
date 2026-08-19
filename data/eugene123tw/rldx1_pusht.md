# eugene123tw/rldx1_pusht

## Resumen

El modelo `eugene123tw/rldx1_pusht` es un ajuste fino (fine-tuning) del modelo Vision-Language-Action (VLA) RLDX-1, desarrollado por Eugene Liu (eugene123tw), sobre el conjunto de datos `lerobot/pusht`, un benchmark estándar de robótica que consiste en empujar una pieza en forma de T hasta una posición objetivo. El modelo resultante es una política de control que, dada una imagen de cámara superior, genera secuencias de acciones para completar la tarea.

La relevancia de este modelo radica en demostrar cómo un VLA generalista preentrenado puede adaptarse a una tarea de manipulación específica mediante un entrenamiento eficiente que congela el modelo de lenguaje y entrena únicamente el codificador visual, el proyector y el modelo de difusión de acciones. RLDX-1, el modelo base, introduce una arquitectura Multi-Stream Action Transformer (MSAT) que añade capacidades de conciencia de movimiento, memoria a largo plazo y percepción física a la inteligencia heredada de un VLM preentrenado. El tamaño exacto del modelo no se especifica en la información disponible, aunque el repositorio ocupa 69 GB, lo que sugiere una arquitectura de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) con Multi-Stream Action Transformer (MSAT) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | Checkpoint de PyTorch Lightning (.ckpt) |

## Arquitectura y entrenamiento

El modelo base RLDX-1 es un VLA que combina un VLM preentrenado con un Multi-Stream Action Transformer (MSAT), diseñado para procesar simultáneamente flujos de información visual, lingüística y de estado físico. El ajuste fino sobre PushT utiliza la clase `Rldx1` de la librería `physicalai` y congela el modelo de lenguaje (`tune_llm=False`), mientras entrena el codificador visual (`tune_visual=True`), el proyector (`tune_projector=True`) y el modelo de difusión de acciones (`tune_diffusion_model=True`). Además, se ajustan las últimas 6 capas del LLM (`tune_top_llm_layers=6`).

El entrenamiento se realiza sobre el dataset `lerobot/pusht` con un `DataModule` de LeRobot, usando un batch de 8, precisión mixta bf16, y un máximo de 60 épocas. La entrada visual consiste en secuencias de 4 frames (con stride 1) a resolución nativa de 96x96 píxeles, que el preprocesador escala a 224x224 mediante upscaling cúbico. La política predice 10 pasos de acción (`n_action_steps=10`). El script de entrenamiento utiliza el framework `lightning` con callbacks de checkpoint basados en la tasa de éxito del entorno de validación.

## Capacidades

- Generación de acciones de control para tareas de manipulación robótica a partir de observaciones visuales.
- Predicción de secuencias de acciones de 10 pasos (n_action_steps=10), lo que permite un control suave y anticipatorio.
- Procesamiento de entradas visuales multi-frame (video_length=4) para capturar dinámica temporal.
- Ajuste fino selectivo: el modelo de lenguaje permanece congelado, lo que reduce el coste de entrenamiento y preserva el conocimiento general.
- Integración con el ecosistema LeRobot para carga de datasets y evaluación en entornos simulados.
- Compatibilidad con el entorno PushTGym para evaluación con métricas de éxito (pc_success) y recompensa acumulada.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso en el sentido de los LLM conversacionales; es un policy de control directo.

## Casos de uso

- Control de robots manipuladores en tareas de empuje: el modelo genera acciones de velocidad y dirección para mover la pieza T hacia la posición objetivo, adecuado para entornos simulados como PushT.
- Aprendizaje por imitación en robótica: sirve como ejemplo de cómo adaptar un VLA preentrenado a una tarea específica con pocos datos de demostración (el dataset PushT contiene alrededor de 200 episodios).
- Evaluación de políticas en simulación: el script de evaluación incluido permite medir tasa de éxito y recompensa en 20 episodios, útil para comparar variantes de entrenamiento.
- Investigación en generalización de VLA: al congelar el LLM, se puede estudiar el impacto del ajuste del codificador visual y el modelo de difusión en el rendimiento final.
- Base para transferencia a tareas similares: el checkpoint ajustado puede servir como punto de partida para fine-tuning en otras tareas de manipulación con observaciones de cámara superior.
- Integración en pipelines de robótica con LeRobot: al usar `LeRobotDataModule`, el modelo se integra fácilmente con el ecosistema de Hugging Face para datasets y entornos.

## Benchmarks y rendimiento

El autor proporciona resultados de evaluación en el entorno PushT sobre 20 episodios:

| Metrica | Valor |
|---|---|
| Tasa de exito (pc_success) | 40.0% (8 de 20 episodios) |
| Recompensa acumulada media | 96.6334 |
| Recompensa maxima media | 0.9024 |
| Longitud media de episodio | 248.1 pasos |
| FPS medio | 59.9 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible. El checkpoint guardado con mejor tasa de exito se denomina `pc_success=70.00.ckpt`, lo que sugiere que durante el entrenamiento se alcanzó un 70% en validación, aunque la evaluación final reporta un 40%.

## Requisitos de hardware

- No se especifican requisitos exactos de VRAM en la documentación proporcionada.
- El repositorio tiene un tamaño de 69 GB, lo que incluye checkpoints de entrenamiento y posiblemente estados del optimizador. Para inferencia en bf16, un modelo de ~7B de parámetros requiere alrededor de 14-16 GB de VRAM; si el modelo es mayor (p.ej. 13B), se necesitarían 26-30 GB. Dado que no se conoce el número de parámetros, se recomienda una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10G) para una inferencia cómoda.
- El script de entrenamiento utiliza una sola GPU con precisión bf16-mixta, lo que sugiere que el entrenamiento cabe en una GPU de alta gama (A100 40GB o similar).
- Opciones de despliegue: el modelo se carga mediante `Rldx1.load_from_checkpoint` de PyTorch Lightning, por lo que el despliegue requiere el entorno `physicalai`. No se mencionan formatos GGUF, ONNX ni soporte para vLLM u Ollama.
- La latencia medida en evaluación es de ~60 FPS, lo que indica que la inferencia es en tiempo real en el hardware utilizado por el autor.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos VLA en la documentación proporcionada. Modelos como OpenVLA o RT-2 son alternativas conocidas, pero no se han incluido datos de rendimiento en esta fuente. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está especializado en la tarea PushT y puede no generalizar a otras tareas de manipulación sin un nuevo fine-tuning.
- La tasa de éxito final es del 40% en evaluación, lo que indica que la política no es robusta en todos los episodios; puede fallar en condiciones de inicialización desfavorables.
- Sensibilidad a la resolución de entrada: el script de evaluación advierte que renderizar a 224x224 en lugar de la resolución nativa de 96x96 produce una degradación severa (0% de éxito) debido a un desajuste en la distribución visual (OOD).
- El modelo solo está documentado para el idioma inglés (tag `en`), aunque el modelo base podría soportar más idiomas; no se garantiza su uso en otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero es necesario verificar la licencia del modelo base RLDX-1 y de los componentes de terceros (por ejemplo, el VLM subyacente).
- No se proporcionan detalles sobre sesgos o alucinaciones, pero al ser un modelo de control robótico, el riesgo principal es la ejecución de acciones inseguras si se despliega en un entorno físico sin salvaguardas.
- El tamaño del repositorio (69 GB) puede dificultar la descarga y el almacenamiento en entornos con limitaciones de ancho de banda.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eugene123tw/rldx1_pusht
- Repositorio oficial de RLDX-1: https://github.com/RLWRLD/RLDX-1
- Informe técnico de RLDX-1 (arXiv): https://arxiv.org/abs/2605.03269
- Perfil de GitHub del autor: https://github.com/eugene123tw
- Repositorio relacionado (physical-ai-studio-push-t): https://huggingface.co/eugene123tw/physical-ai-studio-push-t

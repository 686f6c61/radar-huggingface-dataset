# salpu/lingbot-vla-2.0-fullft-step1500

## Resumen

LingBot-VLA 2.0 es un modelo de robótica de tipo Vision-Language-Action (VLA) desarrollado por el autor `salpu` dentro del contexto de Bittensor subnet 80 (OpenRoboto), una red descentralizada de entrenamiento de modelos. Se trata de un fine-tune completo (sin capas congeladas) del checkpoint base `openroboto-ai/lingbot-vla-v2-6b-libero`, continuando su entrenamiento durante 1500 pasos adicionales sobre el dataset LIBERO. El modelo está diseñado para convertir instrucciones en lenguaje natural y observaciones visuales en acciones de control para manipuladores robóticos, un problema central en la robótica de manipulación.

La arquitectura se apoya en el procesador Qwen3-VL-4B-Instruct como backbone visual-lingüístico, con una capa de mezcla de expertos (MoE) de 32 expertos y top-4 activos. Con 6.375.907.511 parámetros totales, el modelo se distribuye en formato safetensors y pesa 25.5 GB en el repositorio. Su relevancia radica en ser un checkpoint abierto con licencia Apache 2.0, entrenado con técnicas modernas como el optimizador muon y pérdidas auxiliares de profundidad y alineación de video, lo que lo convierte en una referencia para la comunidad de robótica open source. Sin embargo, el autor advierte explícitamente que el checkpoint aún no ha sido evaluado en el benchmark LIBERO, por lo que su rendimiento real es desconocido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (Vision-Language-Action) basada en Qwen3-VL-4B-Instruct con capa MoE (32 expertos, top-4) |
| Parametros totales | 6.375.907.511 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo (nothing frozen) del checkpoint `openroboto-ai/lingbot-vla-v2-6b-libero` (en su paso 6000), continuado durante 1500 pasos adicionales. La arquitectura combina un backbone visual-lingüístico basado en Qwen3-VL-4B-Instruct con una capa de mezcla de expertos (MoE) de 32 expertos y top-4 activos, lo que permite escalar la capacidad del modelo sin disparar el coste computacional por token. El entrenamiento se realizó con 2x NVIDIA H100 PCIe 80GB usando FSDP2 full-shard, precisión bf16 con pesos maestros fp32, y un tamaño de batch global de 64 (micro 8 x grad-accum 4 x 2 GPUs). Se empleó el optimizador muon con tasa de aprendizaje 5e-5 en decaimiento coseno hasta 5e-6 y warmup del 2%. El dataset utilizado fue `lerobot/libero` (1693 episodios, 273465 frames), y se activaron pérdidas auxiliares de profundidad y alineación de video con profesores MoGe, MDM y DINO-video. La pérdida de entrenamiento descendió de 0.1544 (paso 1) a aproximadamente 0.085 al final. El entrenamiento completo duró 5 horas y 13 minutos (12.55 s/paso). El autor señala que el paso 1000 y el paso 1500 son casi duplicados en términos de deriva de pesos (drift relativo L2 de 2.880% vs 2.928%), lo que sugiere que el entrenamiento satura a partir del paso 1000.

## Capacidades

- Control robótico de manipuladores: genera acciones de control (posiciones, velocidades, etc.) a partir de observaciones visuales e instrucciones en lenguaje natural.
- Comprensión de instrucciones lingüísticas: interpreta comandos como "abre el cajón" o "coge el bloque rojo" en entornos simulados tipo LIBERO.
- Procesamiento visual: integra información de imágenes y video para percibir el estado del entorno.
- Aprendizaje por imitación: entrenado sobre demostraciones humanas (episodios de LIBERO), puede replicar comportamientos complejos.
- Fine-tuning específico: al ser un checkpoint abierto, puede adaptarse a nuevas tareas robóticas con datasets adicionales.
- No se documentan capacidades de tool calling, agentes conversacionales ni razonamiento multi-paso fuera del ámbito robótico.

## Casos de uso

- Investigación en robótica de manipulación: el modelo puede servir como baseline para estudiar políticas VLA en entornos simulados como LIBERO, permitiendo comparar estrategias de entrenamiento y arquitecturas.
- Desarrollo de políticas de control en simulación: integrable en pipelines de entrenamiento por refuerzo o imitación para tareas de pick-and-place, apertura de cajones y manipulación de objetos.
- Evaluación de algoritmos de fine-tuning: al ser un checkpoint intermedio (paso 1500) de un fine-tune completo, es útil para analizar la dinámica de deriva de pesos y la saturación del entrenamiento en modelos MoE.
- Benchmarking de hardware: con 6.4B parámetros, puede emplearse para medir el rendimiento de GPUs en inferencia de modelos VLA con MoE.
- Educación y formación: sirve como ejemplo práctico de entrenamiento distribuido con FSDP2, optimizador muon y pérdidas auxiliares multimodales en un caso real.
- Base para experimentos de alineación visual-lingüística: las pérdidas de profundidad y video (MoGe, MDM, DINO-video) lo convierten en un candidato para estudiar la integración de señales geométricas y semánticas en políticas robóticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el checkpoint "no ha sido evaluado en LIBERO" y que "una pérdida de entrenamiento decreciente no es evidencia de una mejor política". Por tanto, no existen datos de éxito en tareas, ni comparaciones con otros modelos VLA.

## Requisitos de hardware

- Entrenamiento: 2x NVIDIA H100 PCIe 80GB con FSDP2 full-shard, bf16 y fp32 master weights. El entrenamiento completo de 1500 pasos tardó 5h13m.
- Inferencia: no se proporcionan datos específicos de VRAM ni latencia. Con 6.4B parámetros en bf16, se estima un requisito mínimo de ~13 GB de VRAM para inferencia en precisión completa, y ~4-5 GB en cuantización de 4 bits (si se generara), pero estos valores son estimaciones no confirmadas por el autor.
- GPUs compatibles: no se indica explícitamente, pero por tamaño podría ejecutarse en GPUs consumer de 24 GB (RTX 3090/4090) con cuantización, o en GPUs de datacenter como A100/H100 sin cuantizar.
- Opciones de despliegue: no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI. Al ser un modelo de robótica, el despliegue típico sería mediante frameworks de robótica como LeRobot o scripts personalizados de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos VLA (como OpenVLA, RT-2 o LingoVLA) en la información proporcionada. El autor no publica resultados de benchmarks ni métricas comparativas. Se puede señalar que, por tamaño (6.4B) y arquitectura MoE, se sitúa en una categoría similar a otros VLA de ~7B, pero sin datos objetivos no es posible establecer comparaciones rigurosas.

## Limitaciones y advertencias

- Rendimiento no verificado: el checkpoint no ha sido evaluado en LIBERO ni en ningún otro benchmark; su tasa de éxito es desconocida.
- Saturación del entrenamiento: la deriva de pesos entre el paso 1000 y el 1500 es mínima (0.05 pp), lo que indica que el paso 1500 aporta poco respecto al 1000; usar el paso 1000 podría ser equivalente.
- Pérdida de entrenamiento engañosa: la caída de la pérdida no garantiza una mejor política robótica, como advierte el propio autor.
- Sesgos y alucinación: no se documentan sesgos específicos, pero al ser un modelo entrenado en un dataset simulado (LIBERO), su generalización a entornos reales es incierta.
- Limitaciones de contexto e idioma: no se especifican, pero al estar basado en Qwen3-VL, probablemente soporte múltiples idiomas; sin embargo, no hay confirmación.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el modelo base (Qwen3-VL) tiene su propia licencia que debe revisarse.
- Dependencia de componentes externos: el modelo depende del procesador Qwen3-VL-4B-Instruct y de los profesores MoGe, MDM y DINO-video, cuyas licencias y disponibilidad deben verificarse para uso en producción.

## Enlaces

- HuggingFace: https://huggingface.co/salpu/lingbot-vla-2.0-fullft-step1500
- Repositorio de entrenamiento: https://github.com/Robbyant/lingbot-vla-v2
- Dataset LIBERO: https://huggingface.co/datasets/lerobot/libero
- Procesador base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Checkpoint base: https://huggingface.co/openroboto-ai/lingbot-vla-v2-6b-libero
- Métricas de entrenamiento (WandB): https://wandb.ai/atomyuri46-weights-biases/sn80-lingbot-fullft

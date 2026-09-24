# RLobot-jun/gr00t-n17-bigenlight-50per-task-15hz-from-nvidia-bc-head-only-step20000

## Resumen

Este repositorio contiene una cabeza de behavior cloning (BC) ajustada sobre el modelo fundacional de robótica NVIDIA GR00T-N1.7-3B. No es un modelo completo ni un LoRA: es un paquete de pesos de la cabeza de acción (`action_head.*`) entrenado durante 20.000 actualizaciones de BC sobre 200 demostraciones reales (4 tareas × 50 episodios: carrot, bowl stack, triple bowl stack y cube stack), con imágenes, estados y acciones decimados de 30 Hz a 15 Hz. El autor es RLobot-jun, no NVIDIA, y la licencia aplicable es la nvidia-license heredada del modelo base.

El interés práctico está en que documenta un flujo de trabajo reproducible de ajuste de la cabeza de acción manteniendo congelados el VLM y el codificador visual, con precisión mixta BF16 y un esquema coseno sobre 20.000 pasos. La cabeza exportada ocupa unos 6,48 GB en FP32 e incluye el DiT, las capas LayerNorm y self-attention posteriores al VLM, los codificadores de estado y acción, el decodificador de acción y el *position embedding*. El VLM no se distribuye: hay que restaurar el checkpoint completo contra la revisión exacta del base (`2fc962b973bccdd5d8ce4f67cc63b264d6886495`) mediante el script `restore_bc.py` incluido.

El modelo está pensado exclusivamente para control robótico a 15 Hz con el embodiment `NEW_EMBODIMENT` y el robot de dataset `ur7e_gello`, con chunks de acción de 16 × 7 (seis articulaciones del brazo más pinza) e inferencia por *flow matching* de 4 pasos. No admite carga directa con `AutoModel.from_pretrained` y no incluye optimizador, scheduler ni logs de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dual-system tipo GR00T N1.7: backbone VLM congelado (NVIDIA Cosmos-Reason2-2B en la construcción) más cabeza de acción DiT entrenada con flow matching |
| Parametros totales | ~3B en el modelo base GR00T-N1.7-3B; este repositorio contiene solo la cabeza de acción (~6,48 GB en FP32) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; el procesador usa padding de 40 × 132 para las observaciones |
| Tipos de cuantizacion | no disponible; pesos exportados en FP32, entrenamiento en BF16 de precisión mixta |
| Idiomas soportados | no disponibles |
| Licencia | other / nvidia-license (se preservan el LICENSE y la model card originales de NVIDIA en el repositorio) |
| Formato de pesos | safetensors; no cargable directamente con AutoModel.from_pretrained, requiere el script restore_bc.py |

Datos adicionales del checkpoint: 20.000 pasos de BC, batch 32, semilla 42, AdamW con LR 1e-4 y schedule coseno, 5 % de warmup (1.000 pasos), chunk de acción 16 × 7 (objetivos absolutos de seis articulaciones más pinza, con propriocepción), etiqueta de embodiment `NEW_EMBODIMENT`, robot del dataset `ur7e_gello`, 4 pasos de flow matching por defecto en inferencia, tamaño del repositorio 6,5 GB.

## Arquitectura y entrenamiento

La familia GR00T N1.7 de NVIDIA sigue un diseño de dos sistemas: un VLM que interpreta la observación multimodal (imagen y estado) y una cabeza de acción basada en Diffusion Transformer (DiT) que genera secuencias de acciones mediante flow matching. En este ajuste concreto, el LLM y el codificador visual permanecen congelados, mientras que se entrenan las proyecciones de observación, estado y acción, las capas LayerNorm y self-attention de la interfaz visión-lenguaje, y la totalidad del DiT y la cabeza de acción. El resultado es un ajuste de ~6,48 GB en FP32 que no incluye pesos del VLM.

El entrenamiento consistió en 20.000 actualizaciones de behavior cloning sobre 200 demostraciones (4 tareas de manipulación × 50 episodios), con decimación alineada de imagen, estado y acción de 30 Hz a 15 Hz. Se usó BF16 de precisión mixta, aumentación ColorJitter estándar de BC y *state dropout* a 0. El autor indica explícitamente que este checkpoint se inicializó de forma independiente desde NVIDIA GR00T-N1.7-3B y no desde el BC histórico de 30 Hz ni desde otro checkpoint BC, y que no incluye actualizaciones SVF ni IQL, crítico ni adaptadores LoRA. El chunk de 16 acciones a 15 Hz cubre aproximadamente 1,067 segundos de trayectoria.

## Capacidades

- Generación de acciones robóticas de manipulación a 15 Hz mediante flow matching con 4 pasos de inferencia por defecto.
- Ejecución de cuatro tareas concretas de apilado y colocación aprendidas por imitación: carrot, bowl stack, triple bowl stack y cube stack.
- Control de brazo de seis articulaciones más pinza con objetivos articulares absolutos y propriocepción integrada.
- Procesamiento conjunto de observaciones visuales y de estado con la configuración de modalidad Bigenlight.
- Integración con el servidor de política GR00T N1.7 existente mediante el embodiment `NEW_EMBODIMENT`, sin cambios en la arquitectura del actor ni en la política en tiempo de ejecución.
- Capacidades de razonamiento visual-lenguaje heredadas del backbone congelado, aunque no ajustadas en este entrenamiento.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, multilingüismo, visión generalista, audio ni modo de razonamiento explícito para este checkpoint.

## Casos de uso

- Apilado de cuencos en línea de montaje o laboratorio: el modelo reproduce las tareas bowl stack y triple bowl stack para las que fue entrenado, generando chunks de 16 acciones a 15 Hz que cubren más de un segundo de movimiento continuo.
- Manipulación de objetos pequeños tipo cubo: la tarea cube stack permite evaluar políticas de precisión con pinza y propriocepción articular en entornos controlados.
- Recolección y colocación de piezas alargadas: la tarea carrot sirve como banco de pruebas para pick-and-place con variaciones de iluminación, ya que el entrenamiento incluyó ColorJitter.
- Base para ajuste fino en nuevas tareas: al ser una cabeza de acción independiente y restaurable, se puede reentrenar sobre el backbone GR00T-N1.7-3B con demostraciones propias y comparar contra este checkpoint de 20.000 pasos.
- Investigación en decimación de frecuencia de control: el pipeline 30 Hz → 15 Hz documentado permite estudiar el efecto de reducir la frecuencia de control en la calidad de la imitación.
- Evaluación de flujos de exportación de cabezas de acción: el repositorio demuestra un método de exportación con verificación por hashes tensor a tensor contra el base, útil para pipelines internos de validación de checkpoints.
- Reproducción de experimentos de behavior cloning: los hiperparámetros completos (batch 32, semilla 42, AdamW 1e-4, coseno a 20.000 pasos, warmup del 5 %, BF16) permiten replicar el entrenamiento.
- Pruebas de integración con servidores de política GR00T N1.7: sirve para validar el restaurado de checkpoints y la configuración de modalidad Bigenlight antes de desplegar en hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Peso de la cabeza de acción: ~6,48 GB en FP32; en BF16 rondaría los 3,2 GB, aunque el autor no publica una versión cuantizada.
- Checkpoint completo restaurado: incluye el backbone GR00T-N1.7-3B y, en la construcción estándar, NVIDIA Cosmos-Reason2-2B. Como estimación derivada del tamaño de los pesos, la inferencia en BF16 necesitaría del orden de 13 a 16 GB de VRAM, más activaciones y buffers.
- GPU recomendadas: A100, H100 o L40S para despliegue desatendido; una RTX 4090 de 24 GB podría alojar el conjunto en BF16, aunque no hay confirmación del autor.
- En FP32 completo, los pesos solos superan los 12 GB solo para la cabeza, por lo que se requiere una GPU de 40 GB o superior.
- No es compatible con llama.cpp, Ollama, TGI ni vLLM: se ejecuta con el servidor de política GR00T N1.7 apuntando `model_path` al directorio restaurado.
- El proceso de restauración (`restore_bc.py`) es CPU-only y requiere torch, safetensors y huggingface_hub; descarga el base fijado a la caché de Hugging Face.
- Latencia y throughput: no disponibles. Como referencia de diseño, cada chunk de 16 acciones cubre ~1,067 s a 15 Hz y la inferencia usa 4 pasos de flow matching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / frecuencia | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (RLobot-jun, BC head only, 20k pasos) | Cabeza de acción de ~6,48 GB FP32 sobre base de ~3B | 15 Hz, chunk 16 × 7, ~1,067 s por chunk | no disponible | nvidia-license | Hugging Face, 0 descargas |
| nvidia/GR00T-N1.7-3B (modelo base) | ~3B | Configuración GR00T N1.7 de NVIDIA | no disponible en esta información | nvidia-license | Hugging Face |
| NVIDIA GR00T N1.5 / N1.6 | no disponible | no disponible | no disponible | nvidia-license | Hugging Face |
| Otros modelos fundacionales de robótica (por ejemplo, OpenVLA, π0) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos publicados que permitan una comparación cuantitativa fiable con alternativas de la misma categoría.

## Limitaciones y advertencias

- El repositorio no contiene los pesos del VLM: es imprescindible restaurar contra la revisión exacta `2fc962b973bccdd5d8ce4f67cc63b264d6886495` de nvidia/GR00T-N1.7-3B. Sustituir el base por otra revisión invalida la verificación por hashes.
- No se debe mezclar con estadísticas de normalización del BC histórico de 30 Hz; el autor advierte explícitamente de que este checkpoint está entrenado solo a 15 Hz.
- No es cargable con `AutoModel.from_pretrained`; requiere ejecutar `restore_bc.py` y mantener el directorio original, ya que los shards restaurados de la cabeza son enlaces simbólicos.
- Entrenado únicamente sobre 200 demostraciones de 4 tareas; se espera un rendimiento pobre fuera de esa distribución.
- No incluye crítico, IQL ni adaptadores LoRA, por lo que no hay componentes de aprendizaje por refuerzo ni de mejora offline.
- No hay datos de benchmarks, sesgos, comportamiento multilingüe ni evaluación de robustez publicados por el autor.
- El autor no ofrece garantía de seguridad ni de éxito en el despliegue sobre robot real y recomienda verificar frecuencia de control y convenciones de articulaciones y pinza antes de usarlo.
- La licencia nvidia-license condiciona el uso comercial; hay que revisar el LICENSE del repositorio y los términos upstream antes de cualquier explotación.
- El modelo base se distribuye con fecha de creación posterior a la actual del conocimiento disponible, y el repositorio acumula 0 descargas y 0 likes, por lo que no existe validación externa de su funcionamiento.
- La construcción estándar descarga además nvidia/Cosmos-Reason2-2B, sujeto a sus propios requisitos de acceso en Hugging Face.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RLobot-jun/gr00t-n17-bigenlight-50per-task-15hz-from-nvidia-bc-head-only-step20000
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Licencia del repositorio: https://huggingface.co/RLobot-jun/gr00t-n17-bigenlight-50per-task-15hz-from-nvidia-bc-head-only-step20000/blob/main/LICENSE
- Código: https://github.com/jun981015/gr00t-bigenlight/tree/q-vgm-critic
- Dependencia de construcción Cosmos-Reason2-2B: https://huggingface.co/nvidia/Cosmos-Reason2-2B

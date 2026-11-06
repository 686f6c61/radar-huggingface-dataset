# RainyBot/SemWAM-LIBERO-Legacy-rgb-sem-dep-vmoe-step21700

## Resumen

SemWAM-LIBERO-Legacy-rgb-sem-dep-vmoe-step21700 es un checkpoint histórico de un modelo de robótica (pipeline `robotics`) desarrollado por el usuario RainyBot y publicado en Hugging Face. Se trata de un artefacto de archivo: el paso de optimizador final guardado es 21700/21700 y el autor lo publica byte a byte sin migrar al formato `checkpoint_version=2`, por lo que no es compatible con el evaluador actual de SemWAM v2. El modelo se construye sobre el backbone de vídeo `Wan-AI/Wan2.2-TI2V-5B` con una arquitectura denominada `rgb_dep_sem` (RGB + profundidad + semántica) y paradigma de entrada `t_concat`.

La relevancia de esta ficha es acotada: no es un modelo de propósito general ni un LLM, sino un checkpoint de investigación para manipulación robótica en el entorno LIBERO, con fusión de características semánticas (DINOv3 ViT-B/16, 768 dimensiones) y de profundidad (estimador VDA con backbone ViT-B, tamaño de entrada 518, y un módulo `defm_vit_s14` de 384 dimensiones). El modelo incorpora una configuración MoE (`vmoe` en el nombre), aunque el número de parámetros totales y activos no está disponible en la información proporcionada.

El repositorio ocupa 14,2 GB y los pesos se almacenan en `torch.bfloat16`. La model card advierte explícitamente de que se trata de una release de archivo, no de una migración, y de que la revisión del código fuente original de entrenamiento es desconocida. No hay descargas ni likes registrados en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `rgb_dep_sem` sobre backbone de vídeo `Wan-AI/Wan2.2-TI2V-5B`; variante MoE (`vmoe`) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (variante MoE, sin datos de expertos ni top-k) |
| Longitud de contexto | no disponible (modelo de robótica, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en `torch.bfloat16`) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas documentadas) |
| Licencia | no disponible |
| Formato de pesos | `pytorch` / `torch.bfloat16` (repo de 14,2 GB) |

## Arquitectura y entrenamiento

La arquitectura combina tres modalidades de observación: RGB, profundidad y semántica. El backbone principal es `Wan-AI/Wan2.2-TI2V-5B`, un modelo de vídeo-imagen-texto a vídeo, sobre el que se aplica una configuración `video_dit_config` con máscara de atención `first_frame_causal` y sin condicionamiento por acción (`action_conditioned: false`). La semántica se extrae con DINOv3 ViT-B/16 (768 dimensiones) y se fusiona en las capas 7 y 23 del DiT de vídeo. La profundidad se representa en escala logarítmica (`log3`) mediante el estimador VDA (ViT-B, entrada 518) y se tokeniza de forma compartida; además se incluye un módulo `defm_vit_s14` (ViT-S/14, 384 dimensiones, patch 14). El paradigma de entrada es `t_concat` y el layout de vistas es `libero_horizontal`, con cámaras de muñeca izquierda y derecha a resolución 128x160 y sin atención al vídeo (`attends_video: false`). La dimensión de propiocepción es 8.

El entrenamiento se completó hasta el paso de optimizador 21700/21700, verificado según los logs de finalización y el presupuesto del entrenador. No se documentan el número de tokens, la composición del dataset, ni si hubo RLHF o DPO. La model card indica que el `config.yaml` resuelto original es la receta autoritativa y que los campos ausentes son desconocidos, no falsos; también advierte de que algunos valores registrados pueden estar inactivos y deben interpretarse según las puertas `enabled`/`mode`. La revisión del código fuente original de entrenamiento es desconocida.

## Capacidades

- Generación de acciones robóticas condicionadas a observación visual RGB en el entorno LIBERO, con layout horizontal de vistas y cámaras de muñeca.
- Procesamiento conjunto de RGB, profundidad (estimación VDA con representación `log3`) y características semánticas DINOv3.
- Fusión multimodal en capas intermedias del DiT de vídeo (capas 7 y 23).
- Entrada de propiocepción de 8 dimensiones.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, multilingüismo, thinking mode, visión general, audio ni generación de texto.

## Casos de uso

- Investigación en manipulación robótica sobre LIBERO: reproducción de experimentos con el checkpoint histórico y la implementación original, útil para comparar recetas de entrenamiento con fusión semántica y de profundidad.
- Ablación de fusión semántica: al fusionar DINOv3 en las capas 7 y 23, permite estudiar el impacto de la semántica preentrenada en políticas visomotoras dentro de entornos simulados.
- Estudio de estimación de profundidad en políticas: la combinación de VDA (`log3`) y `defm_vit_s14` permite evaluar cómo la representación de profundidad afecta al control en tareas de alcance y agarre.
- Análisis de arquitecturas MoE en robótica: la variante `vmoe` sirve para estudiar el enrutamiento de expertos en políticas de manipulación, aunque no se publican detalles de expertos ni top-k.
- Reproducción de checkpoints históricos: útil para auditoría de resultados publicados con la versión pre-v2 del evaluador SemWAM, siempre que se disponga de la implementación histórica.
- Docencia e investigación en modelos generativos de vídeo aplicados a robótica: el uso de Wan2.2-TI2V-5B como backbone permite explorar la transferencia de modelos de vídeo a políticas de control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repo ocupa 14,2 GB en `bfloat16`, por lo que se requiere al menos esa cantidad de memoria más el overhead de activaciones y del backbone de vídeo.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño de pesos, una GPU de 24 GB (RTX 4090) podría ser insuficiente para el conjunto completo en `bfloat16`; A100 40/80 GB o H100 son opciones plausibles, pero no confirmadas por el autor.
- Cabe en consumer GPU: no confirmado; probablemente no en GPUs de 8-16 GB sin cuantización, y la cuantización no está documentada.
- Opciones de despliegue: no disponibles. La model card solo indica `pytorch` y que se requiere la implementación histórica; no se mencionan vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLMs, no aplicables directamente).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SemWAM-LIBERO-Legacy-rgb-sem-dep-vmoe-step21700 | no disponible | no disponible | no disponible | no disponible | Hugging Face (0 descargas) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (políticas visomotoras sobre LIBERO con fusión semántica y de profundidad) en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint de archivo: no incluye `checkpoint_version=2` y no es compatible con el evaluador actual de SemWAM v2; requiere la implementación histórica y la configuración original.
- `inference_config.legacy_reference.json` se conserva literalmente y no constituye un contrato de restauración v2.
- La revisión del código fuente original de entrenamiento es desconocida, lo que dificulta la reproducibilidad exacta.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución.
- Idiomas no disponibles: no es un modelo lingüístico; no debe evaluarse como tal.
- Sin descargas ni likes: no hay evidencia de validación por la comunidad.
- Riesgo de alucinación y sesgos: no documentados; al ser un modelo de robótica, el riesgo relevante es el fallo de política (acciones incorrectas) más que la alucinación textual.
- Algunos campos del `config.yaml` archivado pueden estar inactivos; los valores nulos significan desconocido, no falso.
- No se documentan requisitos de hardware, latencia ni throughput, lo que complica la planificación de despliegue en producción.

## Enlaces

- Hugging Face: https://huggingface.co/RainyBot/SemWAM-LIBERO-Legacy-rgb-sem-dep-vmoe-step21700
- Backbone base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.

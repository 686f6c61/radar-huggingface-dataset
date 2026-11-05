# RainyBot/SemWAM-LIBERO-Legacy-rgb-dep-log3-step21700

## Resumen

SemWAM-LIBERO-Legacy-rgb-dep-log3-step21700 es un checkpoint de investigación en robótica publicado por el usuario RainyBot en HuggingFace. Se trata de un artefacto de archivo histórico ("historical checkpoint") del proyecto SemWAM, entrenado sobre el benchmark LIBERO, un conjunto de tareas de manipulación robótica. El modelo parte de la base de un modelo generativo de vídeo (Wan-AI/Wan2.2-TI2V-5B) y añade condicionamiento por profundidad (representación log3) y semántica (DINOv3 ViT-B/16), configurado para un paradigma de entrada `t_concat` con layout horizontal de vistas LIBERO.

La relevancia de esta publicación es fundamentalmente archivística: preserva byte a byte el checkpoint original pre-v2 junto con su configuración resuelta, para reproducibilidad de investigaciones pasadas. El autor advierte explícitamente de que el checkpoint carece de `checkpoint_version=2` e `inference_config`, y por tanto no es compatible con el evaluador actual de SemWAM v2. No se trata de un modelo listo para producción ni de una release con garantías de evaluación, sino de un registro de entrenamiento finalizado en el paso de optimizador 21700/21700.

La información pública disponible es escasa en cuanto a rendimiento, licencia e idiomas, y el repositorio ocupa 12 GB. El modelo está pensado para inferencia en PyTorch con `torch.bfloat16` y su uso requiere la implementación histórica correspondiente, no la versión actual del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión de vídeo (Wan2.2-TI2V-5B) con condicionamiento por profundidad y semántica; arch `dep_rgb`, paradigma `t_concat` |
| Parametros totales | no disponible (modelo base Wan2.2-TI2V-5B, ~5B; total efectivo del checkpoint no declarado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en `torch.bfloat16`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (repositorio de 12 GB; formato exacto de ficheros no declarado) |

## Arquitectura y entrenamiento

El modelo se construye sobre Wan-AI/Wan2.2-TI2V-5B, un modelo de difusión de vídeo texto-a-vídeo/imagen-a-vídeo, al que se le añade un módulo de profundidad y otro semántico. La profundidad se representa como `log3` y se estima con un backbone VDA ViT-B a resolución de entrada 518; el módulo semántico usa DINOv3 ViT-B/16 con `feat_dim` 768 y pooling temporal por media, fusionándose en las capas 7 y 23 del DiT de vídeo. La atención de vídeo usa máscara `first_frame_causal` y el modelo no está condicionado por acción (`action_conditioned: false`). La dimensión de propiocepción es 8.

La configuración de vistas es `libero_horizontal`, con vistas de muñeca a 128x160 y frame "first", usando cámaras izquierda y derecha. La profundidad incluye pointmap con límites normalizados (x, y en [-0.6, 0.6], z en [0, 1.5], profundidad máxima 2.0 m) y colormap turbo entre 0.1 y 2.0 m. La configuración de intrínsecos distingue entre simulación (fovy 37°, 480x640) e imagen (fovy 45°, 224x224) y muñeca (fovy 75°, 224x224).

El entrenamiento corresponde a una receta archivada cuyo `config.yaml` resuelto es autoritativo; los campos ausentes se consideran desconocidos y los valores por defecto actuales no aplican. El checkpoint corresponde al paso de optimizador final 21700/21700, con logs de finalización y presupuesto del entrenador verificados. No se declaran número de tokens, composición del dataset ni si hubo RLHF/DPO. La revisión original del código de entrenamiento es desconocida.

## Capacidades

- Modelado generativo de vídeo condicionado por profundidad y semántica, orientado a tareas de manipulación robótica sobre el benchmark LIBERO.
- Estimación y uso de profundidad mediante representación `log3` con estimador VDA.
- Codificación semántica con DINOv3 ViT-B/16 y fusión en capas 7 y 23 del DiT.
- Entrada multimodal de vistas (izquierda, derecha y muñeca) en layout horizontal LIBERO.
- Condicionamiento por propiocepción de dimensión 8.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No dispone de modo thinking, visión general ni audio.
- Capacidades multilingües: no disponibles (no es un modelo de lenguaje).

## Casos de uso

- Reproducción de experimentos históricos: el checkpoint permite reproducir exactamente los resultados de un entrenamiento SemWAM previo a la versión v2, usando la implementación histórica y la configuración original. Es adecuado porque se publica byte a byte y con la config resuelta autoritativa.
- Auditoría de recetas de entrenamiento: investigadores pueden inspeccionar la configuración archivada (fusiones en capas 7 y 23, representación de profundidad log3, parámetros de intrínsecos) para comparar con recetas posteriores.
- Estudio de condicionamiento por profundidad en políticas robóticas: el modelo permite analizar cómo influye la representación log3 y el pointmap normalizado en tareas de manipulación LIBERO.
- Investigación sobre fusión semántica en DiT de vídeo: útil para evaluar el efecto de DINOv3 ViT-B/16 fusionado en capas concretas sobre la generación de vídeo condicionada.
- Base para migraciones a v2: sirve como referencia para desarrollar conversores o adaptadores hacia el formato `checkpoint_version=2` e `inference_config` del evaluador actual.
- Docencia y divulgación: ejemplo real de checkpoint de investigación con metadatos completos para explicar pipelines de entrenamiento en robótica con modelos generativos de vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio pesa 12 GB y los pesos están en `torch.bfloat16`, por lo que se requiere al menos esa magnitud de memoria, más overhead de activaciones y del modelo base Wan2.2-TI2V-5B.
- GPU recomendadas: no disponibles de forma explícita; por tamaño del modelo base (~5B) y del checkpoint (12 GB), se orienta a GPUs de datacenter tipo A100 o H100.
- ¿Cabe en GPU de consumo? No confirmado. Un checkpoint de 12 GB en bf16 podría no caber en GPUs de 8-16 GB sin cuantización, y no se declaran opciones de cuantización.
- Opciones de despliegue: no disponibles. El autor indica que requiere la implementación histórica de SemWAM y no es compatible con el evaluador v2; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SemWAM-LIBERO-Legacy-rgb-dep-log3-step21700 | no disponible (~5B base) | no disponible | no disponible | no disponible | HuggingFace (archivo histórico) |
| Wan-AI/Wan2.2-TI2V-5B | ~5B | no disponible | no disponible en esta ficha | no disponible | HuggingFace (modelo base) |
| Alternativas de política robótica LIBERO | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones completas de alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint histórico sin `checkpoint_version=2` ni `inference_config`: no es compatible con el evaluador actual de SemWAM v2.
- Requiere la implementación histórica y la configuración original; la revisión del código de entrenamiento es desconocida.
- No es una release de migración ni una afirmación de compatibilidad con evaluación actual.
- Licencia no disponible: riesgo legal para uso comercial; se debe contactar con el autor antes de cualquier uso productivo.
- Idiomas no disponibles: no aplica como modelo de lenguaje, pero limita su uso fuera de robótica.
- Riesgo de alucinación y sesgos: no evaluados ni documentados en la información disponible.
- Sin benchmarks publicados: no se puede validar su rendimiento frente a alternativas.
- Tamaño de repositorio de 12 GB: requiere almacenamiento y ancho de banda considerables para descarga y despliegue.
- Fecha de creación y actualización (2026-11-05) y estado de descargas/likes (0/0): modelo sin adopción pública verificable.

## Enlaces

- HuggingFace: https://huggingface.co/RainyBot/SemWAM-LIBERO-Legacy-rgb-dep-log3-step21700
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Benchmark LIBERO: no disponible en la información proporcionada
- Paper SemWAM: no disponible en la información proporcionada
- Repositorio del proyecto SemWAM: no disponible en la información proporcionada

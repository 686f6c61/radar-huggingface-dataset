# RainyBot/SemWAM-LIBERO-Legacy-fastwam-action-moe-step21700

## Resumen

SemWAM-LIBERO-Legacy-fastwam-action-moe-step21700 es un checkpoint histórico de un modelo de robótica desarrollado por RainyBot, entrenado sobre el benchmark LIBERO. Se trata de un modelo de política visomotora (vision-language-action) construido sobre la arquitectura "fastwam", que a su vez parte del backbone de vídeo Wan2.2-TI2V-5B, adaptado para generar acciones de manipulación robótica a partir de observaciones visuales y propriocepción. El checkpoint corresponde al paso de optimizador final 21700 de 21700 de un entrenamiento ya completado.

La relevancia de esta publicación es fundamentalmente archivística: el autor publica el checkpoint original pre-v2 byte a byte, sin `checkpoint_version=2` ni `inference_config`, y advierte explícitamente de que no es compatible con el evaluador SemWAM v2 actual. No se trata, por tanto, de un modelo listo para producción ni de una migración, sino de un artefacto de reproducibilidad para quien disponga de la implementación histórica correspondiente.

El modelo incorpora un diseño híbrido con un DiT de vídeo de 30 capas (hidden_dim 3072, 24 cabezas), módulos de fusión semántica basados en DINOv3 ViT-B/16 y un estimador de profundidad VDA, además de una configuración MoE en el bloque de acciones. El repositorio ocupa 12,2 GB y está publicado en formato PyTorch con dtype bfloat16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | fastwam (DiT de vídeo Wan2.2-TI2V-5B con fusión semántica y de profundidad, acción MoE) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (configuración MoE, sin cifras publicadas) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (torch_dtype bfloat16) |
| Backbone de vídeo | Wan2.2-TI2V-5B, patch_size [1,2,2], in_dim 48, hidden_dim 3072, ffn_dim 14336, 30 capas, 24 cabezas, head_dim 128 |
| Encoder semántico | DINOv3 ViT-B/16 (feat_dim 768), fusión en capas 7 y 23, pooling temporal mean |
| Estimador de profundidad | VDA ViT-B a 518 px, representación log3, pointmap con límites x,y [-0.6,0.6], z [0,1.5], max_depth 2.0 m |
| Entrada proprioceptiva | proprio_dim 8 |
| Dimensión de acción | action_dim 7 |
| Paradigma de entrada | t_concat, view_layout libero_horizontal |
| Muñeca (wrist) | view_size [128,160], frame "first", attends_video false, cámaras left/right |
| Paso de entrenamiento | 21700 / 21700 (final) |
| Tamaño del repo | 12,2 GB |

## Arquitectura y entrenamiento

El modelo se articula en torno a un transformer de difusión (DiT) de vídeo derivado de Wan2.2-TI2V-5B, con 30 capas, dimensión oculta de 3072, FFN de 14336 y 24 cabezas de atención de 128 dimensiones. La máscara de atención de vídeo sigue el modo `first_frame_causal` y el modelo no está condicionado por acción en el DiT principal (`action_conditioned: false`), sino que la acción se inyecta mediante un módulo MoE dedicado ("action_moe") cuyo dimensionamiento no se detalla en la información disponible. La entrada combina observaciones visuales en disposición horizontal LIBERO con un vector de propriocepción de 8 dimensiones y una dimensión de acción de 7.

Sobre el backbone se superponen dos ramas auxiliares: una rama semántica que usa DINOv3 ViT-B/16 congelado (768 dimensiones, pooling temporal por media) y fusiona características en las capas 7 y 23, y una rama de profundidad basada en VDA ViT-B a resolución 518, con representación logarítmica log3 y un pointmap normalizado. La configuración de cámaras de muñeca usa vistas de 128x160 con la primera frame y sin atención al vídeo. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset (más allá de LIBERO), ni sobre si se aplicaron etapas de RLHF o DPO; el autor indica que la revisión del código fuente original es desconocida y que los campos ausentes en la configuración deben tratarse como desconocidos, no como falsos.

## Capacidades

- Generación de acciones robóticas de 7 dimensiones a partir de observaciones visuales y propriocepción, en el entorno de manipulación LIBERO.
- Procesamiento de múltiples vistas de cámara (cámaras izquierda/derecha y vistas de muñeca) con disposición horizontal específica de LIBERO.
- Fusión de representaciones semánticas de alto nivel mediante DINOv3 ViT-B/16 en capas intermedias del DiT.
- Estimación de profundidad y pointmap a partir de las observaciones visuales mediante VDA ViT-B.
- Condicionamiento por instrucción textual (text_dim 4096) integrado en el backbone Wan2.2.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión general, audio: no disponible (el modelo es específico de robótica).

## Casos de uso

- Reproducción de experimentos LIBERO: el checkpoint permite reproducir exactamente los resultados del entrenamiento original siempre que se disponga de la implementación histórica y la configuración original, ya que el autor publica los pesos byte a byte.
- Investigación en políticas visomotoras: sirve como referencia para estudiar el diseño "fastwam" con fusión semántica y de profundidad en capas concretas (7 y 23) y evaluar su impacto en tareas de manipulación.
- Estudio de arquitecturas MoE para acciones: el módulo action_moe permite analizar cómo se comporta una mezcla de expertos en el espacio de acciones de 7 dimensiones frente a cabezas densas.
- Comparación de backbones de vídeo en robótica: al partir de Wan2.2-TI2V-5B, el modelo es útil para contrastar el rendimiento de DiTs de vídeo frente a otros backbones en benchmarks de manipulación como LIBERO.
- Análisis de representaciones congeladas: la combinación de DINOv3 y VDA congelados con fusión en capas intermedias permite estudiar qué información semántica y geométrica aporta cada rama al control.
- Docencia y formación: como artefacto archivístico documentado, puede usarse en cursos de robótica aprendida para ilustrar el ciclo completo de entrenamiento, checkpointing y evaluación con un caso real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 12,2 GB en bfloat16, por lo que se requiere al menos esa cantidad de VRAM más el overhead de activaciones y encoders auxiliares (DINOv3 ViT-B/16 y VDA ViT-B).
- GPU recomendadas: no disponible en la información proporcionada; por el tamaño del backbone (DiT de 30 capas, hidden 3072) se sitúa en la gama de GPUs de centro de datos (A100, H100) para inferencia cómoda, aunque no hay confirmación del autor.
- ¿Cabe en GPU de consumo? No confirmado. Un checkpoint de 12,2 GB en bf16 podría caber en GPUs con 24 GB o más (RTX 3090, RTX 4090) si el resto de componentes no excede la memoria, pero no hay datos publicados que lo verifiquen.
- Opciones de despliegue: no disponible. El autor indica que el checkpoint no es compatible con el evaluador SemWAM v2 y requiere la implementación histórica original; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de política robótica (por ejemplo, variantes de OpenVLA, π0 o RT-2) ni datos de rendimiento que permitan establecer una comparación rigurosa.

## Limitaciones y advertencias

- Checkpoint histórico sin `checkpoint_version=2` ni `inference_config`: no es compatible con el evaluador SemWAM v2 actual y requiere la implementación y configuración históricas originales.
- La revisión del código fuente original es desconocida, lo que dificulta la reproducibilidad exacta del pipeline de entrenamiento.
- Los campos ausentes en la configuración deben tratarse como desconocidos, no como desactivados; el propio autor advierte que `null` no equivale a `false`.
- Licencia no disponible: no se puede garantizar el uso comercial ni la redistribución; conviene contactar con el autor antes de cualquier uso en producción.
- Idiomas no disponibles: el condicionamiento textual del backbone Wan2.2 podría no estar adaptado a instrucciones en castellano, pero no hay datos que lo confirmen.
- Específico del entorno LIBERO y de la disposición de vistas `libero_horizontal`: no es un modelo generalista y su uso fuera de ese benchmark requeriría reentrenamiento o adaptación.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de comunidad ni de validación externa del checkpoint.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; al ser un modelo de acción, el riesgo se traduce en acciones incorrectas o inseguras en entornos reales.
- No usar en robótica física sin una validación exhaustiva previa: el checkpoint está pensado para evaluación en simulación dentro del marco LIBERO.

## Enlaces

- Hugging Face: https://huggingface.co/RainyBot/SemWAM-LIBERO-Legacy-fastwam-action-moe-step21700
- Backbone base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- No se han encontrado en la búsqueda web papers, blogs, repositorios o demos adicionales asociados a este checkpoint.

# RainyBot/SemWAM-LIBERO-Legacy-rgb-dep-defm-step21700

## Resumen

SemWAM-LIBERO-Legacy-rgb-dep-defm-step21700 es un checkpoint de investigación en robótica publicado por el usuario RainyBot en Hugging Face. Se trata de un modelo de política visomotora (vision-language-action) entrenado sobre el benchmark LIBERO, orientado a la manipulación robótica a partir de observaciones RGB más mapas de profundidad (depth). El nombre codifica su configuración: paradigma RGB+depth, representación de profundidad "defm", y el paso de optimizador final 21700 de 21700.

El modelo se construye sobre Wan-AI/Wan2.2-TI2V-5B como backbone de difusión de vídeo, con un DiT de vídeo condicionado por acciones y fusionado con características semánticas de DINOv3 (ViT-B/16, 768 dimensiones) en las capas 7 y 23, además de un estimador de profundidad VDA (ViT-B, entrada 518 px) y representación DEFM (backbone defm_vit_s14, feat_dim 384, patch 14). Incorpora también un vector de propiocepción de 8 dimensiones y una configuración de cámara de muñeca con vistas izquierda/derecha a 128x160.

Es relevante ahora únicamente como **archivo histórico**: el autor indica explícitamente que es un checkpoint pre-v2 publicado byte a byte, sin `checkpoint_version=2` ni `inference_config`, y que **no es compatible con el evaluador actual de SemWAM v2**. No es una release lista para producción ni para evaluación con las herramientas actuales; requiere la implementación histórica y la configuración original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT de vídeo (Wan2.2-TI2V-5B) con fusión semántica DINOv3 y profundidad DEFM/VDA; condicionamiento por acciones (dep_rgb) |
| Parámetros totales | no disponible (repo de 12,1 GB; backbone base Wan2.2-TI2V-5B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo de difusión de vídeo, no LLM) |
| Tipos de cuantización | no disponible (pesos en bfloat16 según metadatos) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible explícitamente; `torch_dtype: torch.bfloat16`, librería PyTorch |

## Arquitectura y entrenamiento

La arquitectura combina un DiT de vídeo basado en Wan2.2-TI2V-5B con `video_attention_mask_mode: first_frame_causal` y `action_conditioned: false` en la configuración de vídeo. Sobre esta base se inyectan características semánticas de un backbone DINOv3 ViT-B/16 (768 dims, pooling temporal "mean") en las capas de fusión 7 y 23, y se incorpora una rama de profundidad con estimador VDA (ViT-B, entrada 518) y representación DEFM (backbone defm_vit_s14, feat_dim 384, patch_size 14). El modelo recibe observaciones RGB con layout `libero_horizontal`, vistas de muñeca izquierda/derecha (128x160, primer frame, sin atención al vídeo) y un vector de propiocepción de 8 dimensiones. El paradigma de entrada es `t_concat`.

El checkpoint corresponde al paso de optimizador final 21700/21700, con entrenamiento completado y logs de salida exitosa verificados por el autor (UTC 2026-11-05). No se especifican en la información disponible el número de tokens, la composición del dataset, ni si hubo RLHF/DPO; la configuración archivada es la `config.yaml` original resuelta, y los campos ausentes se marcan como desconocidos (no como falsos). La revisión del código fuente de entrenamiento original es desconocida.

## Capacidades

- Generación de acciones robóticas de manipulación a partir de observaciones RGB y mapas de profundidad en entornos LIBERO.
- Condicionamiento por estado de propiocepción (8 dimensiones) y por configuración de cámaras (vistas izquierda/derecha de muñeca).
- Fusión multimodal de características semánticas (DINOv3) y geométricas (profundidad VDA/DEFM) en un DiT de vídeo.
- Modelado de dinámica visomotora con atención causal de primer frame en el DiT de vídeo.
- Soporte de tool calling / function calling: no disponible (no es un LLM).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): visión RGB+depth; sin audio ni thinking mode.

## Casos de uso

- **Investigación en manipulación robótica sobre LIBERO**: reproducir experimentos del benchmark LIBERO con la implementación histórica correspondiente, usando el checkpoint como referencia de un entrenamiento completado (paso 21700/21700).
- **Reproducción de resultados históricos**: comparar el comportamiento de esta versión pre-v2 frente a checkpoints SemWAM v2, siempre que se disponga del evaluador histórico y la `config.yaml` original.
- **Estudio de fusión semántica-profunda en políticas visomotoras**: analizar el efecto de inyectar DINOv3 en capas 7 y 23 y de la rama de profundidad DEFM/VDA sobre tareas de manipulación.
- **Ablación de paradigmas de entrada**: usar la configuración `t_concat` y el layout `libero_horizontal` como base para experimentos comparativos con otras variantes de entrada.
- **Análisis de atención causal en DiT de vídeo**: estudiar el impacto de `first_frame_causal` y de `action_conditioned: false` en la generación de trayectorias.
- **Pipeline de robótica sim-to-real en laboratorio**: emplear el modelo como componente de política en simuladores compatibles con LIBERO, con las cámaras y calibraciones indicadas (fovy 37°, 45° y 75° según vista).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma explícita; el repo ocupa 12,1 GB en bfloat16, por lo que se requiere al menos esa cifra más overhead de activaciones y del DiT de vídeo (estimación orientativa superior a 16-24 GB, no confirmada por el autor).
- **GPU recomendadas**: no disponible en la información; por tamaño del backbone Wan2.2-TI2V-5B se intuye necesidad de GPU de datacenter (A100/H100) o consumer de gama alta, sin confirmación.
- **¿Cabe en GPU consumer?**: no disponible; el tamaño del repo (12,1 GB) sugiere que podría no caber en GPUs de 8-12 GB, pero no hay dato oficial.
- **Opciones de despliegue**: no disponible; el autor indica que requiere la implementación histórica y la configuración original, y que no es compatible con el evaluador SemWAM v2 actual.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SemWAM-LIBERO-Legacy-rgb-dep-defm-step21700 | no disponible | no aplica (DiT de vídeo) | no disponible | no disponible | Hugging Face (archivo histórico) |
| SemWAM v2 (versión actual del mismo proyecto) | no disponible | no disponible | no disponible | no disponible | no disponible en la información |
| Wan2.2-TI2V-5B (backbone base) | ~5B (según nombre) | no disponible | no disponible | no disponible | Hugging Face (Wan-AI) |

No se dispone de datos comparativos de rendimiento ni de licencia para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- **Checkpoint histórico no compatible**: el autor declara explícitamente que no tiene `checkpoint_version=2` ni `inference_config` y que **no es compatible con el evaluador SemWAM v2 actual**.
- **Requiere implementación histórica**: debe usarse con el código y la `config.yaml` originales; la revisión del código fuente de entrenamiento es desconocida.
- **No es una release de producción**: es un archivo (archival release), no una migración ni una afirmación de compatibilidad con la evaluación actual.
- **Licencia no disponible**: no se puede confirmar el uso comercial; tratar como restringido hasta verificación.
- **Sesgos conocidos**: no disponible.
- **Riesgo de alucinación**: no aplica en el sentido de LLM; en robótica, riesgo de acciones inválidas o fuera de distribución no cuantificado.
- **Limitaciones de contexto o idioma**: no disponible; no es un modelo de lenguaje.
- **Campos de configuración desconocidos**: muchos campos de la `config.yaml` archivada aparecen como `null`/desconocidos; `null` no equivale a `false`.
- **Cero descargas y cero likes**: sin validación comunitaria ni evidencia de uso externo.

## Enlaces

- Hugging Face: https://huggingface.co/RainyBot/SemWAM-LIBERO-Legacy-rgb-dep-defm-step21700
- Backbone base Wan2.2-TI2V-5B: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Benchmark LIBERO: no disponible en la información proporcionada.
- Paper, blog, repositorio o demo de SemWAM: no disponible en la información proporcionada.

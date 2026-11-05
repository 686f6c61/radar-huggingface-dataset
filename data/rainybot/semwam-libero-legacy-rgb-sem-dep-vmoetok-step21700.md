# RainyBot/SemWAM-LIBERO-Legacy-rgb-sem-dep-vmoetok-step21700

## Resumen

SemWAM-LIBERO-Legacy-rgb-sem-dep-vmoetok-step21700 es un checkpoint histórico de investigación en robótica publicado por el autor RainyBot en HuggingFace. Se trata de un modelo de política visuomotora (vision-language-action, VLA) entrenado sobre el benchmark LIBERO, orientado a la manipulación robótica a partir de observaciones RGB, profundidad y características semánticas. El modelo se construye sobre la familia Wan2.2-TI2V-5B como backbone de difusión de vídeo, con codificadores congelados DINOv3 ViT-B/16 para semántica y un estimador de profundidad VDA ViT-B para la representación de profundidad.

El checkpoint corresponde al paso de optimizador final 21700 de 21700, y se publica de forma explícita como archivo histórico ("historical archive"), no como una versión compatible con el evaluador actual de SemWAM v2. El autor advierte que el formato pre-v2 se publica byte a byte, sin `checkpoint_version=2`, y que no es compatible con la herramienta de evaluación actual. La revisión del código fuente original de entrenamiento es desconocida.

Por su naturaleza, es un artefacto de interés para investigadores que replican experimentos de robótica con modelos fundacionales, no para uso en producción. El repositorio ocupa 14,2 GB y no registra descargas ni interacciones, lo que sugiere un uso meramente archivístico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión de vídeo (Wan2.2-TI2V-5B) con fusión de semántica (DINOv3 ViT-B/16) y profundidad (VDA ViT-B); condicionamiento de acción sobre observaciones RGB-D-sem |
| Parámetros totales | no disponible (backbone base Wan2.2-TI2V-5B, ~5B; total del sistema no especificado) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos guardados en `torch.bfloat16`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`/binario, `torch.bfloat16`); sin GGUF ni safetensors indicados |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de difusión de vídeo condicionada por acción, con backbone `Wan-AI/Wan2.2-TI2V-5B`. La modalidad de entrada es `rgb_dep_sem` con paradigma `t_concat` y disposición de vistas `libero_horizontal`. Incluye dos cámaras de muñeca (`left`, `right`) con resolución 128×160, que no atienden al vídeo (`attends_video: false`), y una dimensión de propiocepción de 8. La máscara de atención del DiT de vídeo es `first_frame_causal` y el modelo no está condicionado por acción en el DiT (`action_conditioned: false`).

La semántica se extrae con DINOv3 ViT-B/16 (768 dimensiones) con pooling temporal medio y fusión en las capas 7 y 23. La profundidad se representa como `log3`, estimada con VDA (ViT-B, entrada 518) y tokenizador compartido, con un pointmap normalizado en x∈[-0,6, 0,6], y∈[-0,6, 0,6], z∈[0, 1,5] y profundidad máxima de 2,0 m. Se define además un codificador `defm_vit_s14` (384 dimensiones, patch 14), aunque su rol exacto no está documentado en la información disponible. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO; el autor indica que los campos ausentes en la configuración resuelta original son desconocidos y que los valores nulos no equivalen a `false`.

## Capacidades

- Control visuomotor para manipulación robótica en entornos tipo LIBERO, a partir de observaciones RGB, profundidad y semántica.
- Condicionamiento multimodal: integra imágenes de cámara principal y de muñeca, profundidad estimada y características semánticas congeladas.
- Generación de acciones en un espacio de difusión de vídeo, orientada a tareas de imitación y planificación a corto plazo.
- Percepción de profundidad mediante estimador VDA y proyección a pointmap normalizado.
- Fusión semántica multi-capa (capas 7 y 23) para enriquecer la representación visual.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo ni modos de razonamiento explícito.

## Casos de uso

- Replicación de experimentos LIBERO: el checkpoint permite reproducir el entrenamiento original paso 21700 con la implementación histórica correspondiente, útil para validar resultados publicados.
- Investigación en políticas visuomotoras: sirve como base para estudiar la fusión de profundidad y semántica en modelos de difusión aplicados a robótica.
- Ablaciones académicas: al conservar la configuración resuelta original, permite comparar variantes de codificadores (DINOv3, VDA) y estrategias de fusión.
- Análisis de checkpoints históricos: útil para estudiar la evolución de formatos y contratos de evaluación entre versiones pre-v2 y v2 de SemWAM.
- Desarrollo de pipelines de evaluación: puede emplearse como caso de prueba para herramientas de migración o compatibilidad de checkpoints.
- Docencia e investigación en robótica: ejemplo realista de arquitectura de difusión condicionada por acción con múltiples modalidades de percepción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repositorio ocupa 14,2 GB en `bfloat16`, por lo que se requiere al menos esa capacidad más overhead de activaciones y codificadores congelados.
- GPU recomendadas: no especificadas. Por tamaño, cabría esperar GPUs de 24 GB o superiores (RTX 4090, A100, H100), pero no hay datos confirmados.
- ¿Cabe en GPU de consumo? Probablemente en GPUs de 24 GB o más, aunque no está verificado por el autor.
- Opciones de despliegue: no documentadas; al ser un checkpoint histórico pre-v2, no es compatible con el evaluador SemWAM v2 actual. Requiere la implementación histórica original.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SemWAM-LIBERO-Legacy-rgb-sem-dep-vmoetok-step21700 | no disponible (~5B backbone) | no disponible | no disponible | Checkpoint histórico en HF |
| Wan2.2-TI2V-5B (backbone base) | ~5B | no disponible | no disponible | HF (Wan-AI) |
| Políticas VLA tipo OpenVLA / RT-2 | no disponible en esta ficha | no disponible | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint histórico pre-v2: no es compatible con el evaluador SemWAM v2 actual; requiere la implementación y configuración originales.
- La revisión del código fuente de entrenamiento original es desconocida, lo que dificulta la reproducibilidad exacta.
- Licencia no disponible: no se puede garantizar el uso comercial ni la redistribución.
- Idiomas no disponibles: el modelo está orientado a percepción visual y control, no a texto multilingüe.
- Riesgo de sobreajuste al benchmark LIBERO y a la configuración de cámaras e intrínsecos específicos (FOV, resoluciones 224×224 y 128×160).
- Campos de configuración nulos o ausentes: el autor advierte que "null no es false" y que los valores registrados pueden estar inactivos.
- Sin descargas ni validación comunitaria: no hay evidencia externa de funcionamiento más allá de los logs de entrenamiento citados.
- No apto para producción: es un artefacto de archivo, no una release estable.

## Enlaces

- HuggingFace: https://huggingface.co/RainyBot/SemWAM-LIBERO-Legacy-rgb-sem-dep-vmoetok-step21700
- Backbone base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.

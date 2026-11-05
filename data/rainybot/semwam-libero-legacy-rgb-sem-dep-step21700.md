# RainyBot/SemWAM-LIBERO-Legacy-rgb-sem-dep-step21700

## Resumen

SemWAM-LIBERO-Legacy-rgb-sem-dep-step21700 es un checkpoint histórico de robótica publicado por el usuario RainyBot en HuggingFace. Se trata de un modelo de política visuomotora (vision-language-action, aunque sin componente lingüístico explícito en la configuración archivada) entrenado sobre el benchmark LIBERO, orientado a la manipulación robótica a partir de observaciones RGB, profundidad y características semánticas. El checkpoint corresponde al paso de optimizador final 21700/21700 de un entrenamiento cuyo registro de finalización fue verificado por el autor.

El modelo se construye sobre el backbone de vídeo Wan-AI/Wan2.2-TI2V-5B, con arquitectura `rgb_dep_sem` que fusiona tres modalidades: RGB, profundidad (estimada con VDA y representación log3) y semántica (extraída con DINOv3 ViT-B/16, 768 dimensiones). La fusión semántica se aplica en las capas 7 y 23 del DiT de vídeo. El paradigma de entrada es `t_concat` con disposición de vistas `libero_horizontal`, e incorpora 8 dimensiones de propiocepción.

Su relevancia es fundamentalmente archivística: el autor lo publica byte a byte como checkpoint pre-v2, sin `checkpoint_version=2`, y advierte explícitamente de que no es compatible con el evaluador actual de SemWAM v2. No es un modelo de propósito general ni un modelo de lenguaje: es un artefacto de investigación para reproducir un entrenamiento histórico concreto sobre LIBERO.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `rgb_dep_sem` sobre DiT de vídeo Wan-AI/Wan2.2-TI2V-5B; atención `first_frame_causal`; fusión semántica en capas 7 y 23 |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica configuración MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no de texto) |
| Tipos de cuantización | no disponible (pesos en `torch.bfloat16`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (repositorio de 12,1 GB; `torch_dtype: torch.bfloat16`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de difusión sobre vídeo (DiT) derivada de Wan2.2-TI2V-5B, adaptada como política visuomotora. La entrada combina observaciones RGB con mapas de profundidad (representación `log3`, estimador VDA con backbone ViT-B a 518 px, tokenizador compartido) y características semánticas de DINOv3 ViT-B/16 (768 dimensiones, pooling temporal medio). La fusión semántica se inyecta en las capas 7 y 23 del DiT. La atención del vídeo es `first_frame_causal` y la configuración de acción no está condicionada (`action_conditioned: false`). El modelo incorpora 8 dimensiones de propiocepción y una configuración de muñeca (wrist) con vistas izquierda/derecha a 128×160, usando el primer frame y sin atención al vídeo.

El entrenamiento se realizó sobre el benchmark LIBERO con vistas horizontales. El checkpoint corresponde al paso de optimizador 21700 de 21700, con registros de finalización verificados por el autor en UTC 2026-11-05T09:55:37. La revisión del código fuente original de entrenamiento es desconocida. No se documentan en la información disponible el número de tokens, la composición del dataset, ni si hubo RLHF/DPO (poco probable en un modelo de robótica de este tipo). El autor subraya que el checkpoint se publica byte a byte sin migración a v2 y que la configuración resuelta original es la referencia autoritativa, con campos ausentes marcados como desconocidos.

## Capacidades

- Generación de acciones motrices para manipulación robótica a partir de observaciones RGB, profundidad y propiocepción.
- Condicionamiento multimodal: RGB + profundidad (VDA, log3) + semántica (DINOv3 ViT-B/16).
- Razonamiento espacial implícito mediante mapas de puntos con límites normalizados (x, y en [-0,6, 0,6]; z en [0,0, 1,5]; profundidad máxima 2,0 m).
- Soporte de configuración de cámara de muñeca con dos vistas (izquierda/derecha) a 128×160.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni capacidades multilingües.
- No se documenta modo thinking, visión general, audio ni otras capacidades fuera del dominio LIBERO.

## Casos de uso

- Reproducción de experimentos históricos sobre LIBERO: el checkpoint permite replicar exactamente el estado del entrenamiento en el paso 21700 usando la implementación histórica y la configuración original, lo que resulta útil para auditoría de resultados publicados.
- Investigación en políticas visuomotoras multimodales: sirve como referencia para estudiar el efecto de la fusión semántica en capas 7 y 23 del DiT sobre el rendimiento en manipulación.
- Estudio de representaciones de profundidad: al usar VDA con representación log3 y tokenizador compartido, permite analizar cómo afecta la profundidad estimada al control motor en entornos simulados.
- Benchmarking de robustez ante cambios de cámara: la configuración de muñeca con vistas izquierda/derecha y campo de visión de 75° permite evaluar la generalización a distintas disposiciones de sensores.
- Docencia y formación en robótica de imitación: como artefacto archivístico con metadatos completos, es útil para ilustrar el ciclo de vida de un entrenamiento y las diferencias entre versiones de checkpoints (pre-v2 vs v2).
- Análisis de compatibilidad de pipelines: permite probar herramientas de migración o de evaluación frente a un checkpoint legacy que no cumple el contrato de restauración v2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 12,1 GB en bfloat16, por lo que se requiere al menos una GPU con 16 GB para cargar pesos, y previsiblemente más para activaciones del DiT de vídeo.
- GPU recomendadas: no disponible en la información. Por el tamaño del backbone (Wan2.2-TI2V-5B) se intuye la necesidad de GPU de clase profesional (A100, H100) o consumer de gama alta con suficiente VRAM, pero no se confirma.
- ¿Cabe en GPU consumer? No confirmado. El tamaño de pesos (12,1 GB) sugiere que una RTX 4090 (24 GB) podría albergarlos, pero las activaciones del DiT de vídeo y los encoders adicionales (DINOv3, VDA) podrían exceder esa cifra.
- Opciones de despliegue: no disponible. El autor indica usar la implementación histórica y la configuración original; no se mencionan vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no aplicables directamente aquí).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (políticas visuomotoras sobre LIBERO con fusión RGB + profundidad + semántica).

## Limitaciones y advertencias

- Checkpoint legacy pre-v2: no incluye `checkpoint_version=2` y no es compatible con el evaluador actual de SemWAM v2. El autor lo declara explícitamente como release archivístico, no como migración.
- La revisión del código fuente original de entrenamiento es desconocida, lo que dificulta la reproducibilidad exacta.
- El campo `inference_config` se conserva solo como referencia histórica (`inference_config.legacy_reference.json`); no es un contrato de restauración v2.
- Los campos ausentes en la configuración original se marcan como desconocidos; `null` no equivale a `false`.
- Licencia no disponible: no se puede garantizar el uso comercial ni la redistribución.
- Idiomas no disponibles: no aplica un modelo de texto, pero no se documenta ningún soporte lingüístico.
- Riesgo de alucinación: no aplica en el sentido de LLM, pero sí existe riesgo de comportamiento errático fuera de la distribución de LIBERO.
- Sesgos conocidos: no documentados; al entrenarse sobre un benchmark concreto (LIBERO), el modelo puede no generalizar a otros entornos o tareas.
- Sin datos de benchmarks publicados: no es posible evaluar su rendimiento frente a alternativas sin ejecutar la implementación histórica.
- Advertencia de producción: no recomendado para uso en producción sin validación previa contra la implementación histórica y la configuración original.

## Enlaces

- HuggingFace: https://huggingface.co/RainyBot/SemWAM-LIBERO-Legacy-rgb-sem-dep-step21700
- Backbone base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- No se han encontrado en la información disponible otros enlaces a papers, blogs, repositorios o demos.

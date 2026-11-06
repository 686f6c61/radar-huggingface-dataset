# RainyBot/SemWAM-LIBERO-Legacy-dep-sem-step21700

## Resumen

SemWAM-LIBERO-Legacy-dep-sem-step21700 es un checkpoint de investigación en robótica publicado por el usuario RainyBot en Hugging Face. Se trata de un archivo histórico ("Legacy") del entrenamiento de un modelo de política visomotora para el benchmark LIBERO, identificado internamente con la arquitectura `dep_sem` y el paradigma de entrada `t_concat`. El checkpoint corresponde al paso de optimizador final 21700/21700 de una ejecución cuyo origen, según la propia model card, es desconocido ("Original training source revision is unknown").

El modelo se construye sobre el backbone de vídeo Wan-AI/Wan2.2-TI2V-5B, al que se añaden encoders congelados de semántica (DINOv3 ViT-B/16, 768 dimensiones) y de profundidad (estimador VDA con backbone ViT-B a 518 px, y un componente `defm_vit_s14` de 384 dimensiones). La fusión semántica se realiza en las capas 7 y 23 del DiT de vídeo, y se incorpora propriocepción de 8 dimensiones. El formato de observación es `libero_horizontal`, con vistas de muñeca izquierda y derecha de 128×160.

La relevancia de esta publicación es fundamentalmente archivística: el autor indica explícitamente que el checkpoint se publica byte a byte en su formato pre-v2, sin `checkpoint_version=2` ni `inference_config`, y que no es compatible con el evaluador actual de SemWAM v2. No se trata de un modelo listo para producción, sino de un artefacto de reproducibilidad para quien disponga de la implementación histórica y la configuración original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `dep_sem` sobre DiT de vídeo Wan2.2-TI2V-5B, con fusión semántica (DINOv3 ViT-B/16) y de profundidad (VDA ViT-B) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos guardados en `torch.bfloat16`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (checkpoint pre-v2, sin `inference_config`; tamaño del repo 12,1 GB) |

## Arquitectura y entrenamiento

La arquitectura combina un DiT de vídeo derivado de Wan2.2-TI2V-5B con un paradigma de entrada `t_concat` y una máscara de atención de vídeo `first_frame_causal`. Sobre el DiT se inyectan representaciones semánticas procedentes de un backbone DINOv3 ViT-B/16 con `feat_dim` 768, fusionadas en las capas 7 y 23, con pooling temporal de tipo media. La rama de profundidad emplea un estimador VDA con backbone ViT-B a resolución de entrada 518, representación `log3` y tokenizador compartido; el mapa de puntos se normaliza en un rango x,y de [-0,6, 0,6] y z de [0,0, 1,5], con profundidad máxima de 2,0 m. Se añade además un componente `defm_vit_s14` de 384 dimensiones con parches de 14. La propriocepción tiene dimensión 8 y las vistas de muñeca se configuran a 128×160 con frame "first" y sin atención al vídeo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre el uso de RLHF/DPO. La model card indica que la configuración resuelta original (`config.yaml`) es la fuente autoritativa de la receta archivada, pero que los campos ausentes son desconocidos y no deben sustituirse por los valores por defecto actuales. Tampoco se documenta la revisión del código fuente original de entrenamiento ni innovaciones técnicas adicionales más allá de las ya descritas (fusión multimodal semántica y de profundidad sobre DiT de vídeo).

## Capacidades

- Generación de acciones visomotoras para manipulación robótica en el entorno LIBERO, condicionadas por observaciones de cámara (vistas horizontales y de muñeca) y propriocepción de 8 dimensiones.
- Procesamiento multimodal que combina vídeo, mapas de profundidad estimados y características semánticas de DINOv3.
- Estimación de profundidad mediante el estimador VDA integrado y proyección a mapas de puntos normalizados.
- Condicionamiento por instrucción semántica (el nombre `dep_sem` sugiere profundidad + semántica, aunque la model card no detalla el mecanismo exacto de condicionamiento por lenguaje).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, capacidades multilingües ni modos de "thinking". Es un modelo de robótica, no un LLM conversacional.

## Casos de uso

- Reproducción de experimentos en LIBERO: el checkpoint permite reproducir los resultados del paso 21700 de la ejecución `ZeRO2_libero_dep_sem` siempre que se disponga de la implementación histórica y la configuración original, tal como advierte el autor.
- Investigación en políticas visomotoras con profundidad y semántica: sirve como referencia para estudiar el efecto de la fusión semántica en capas 7 y 23 sobre un DiT de vídeo en tareas de manipulación.
- Análisis de entrenamiento con ZeRO-2: el estado del optimizador y el paso final documentado (21700/21700) permiten auditar la curva de entrenamiento y el presupuesto de pasos.
- Estudio de arquitecturas híbridas vídeo + profundidad + semántica: el modelo es útil para comparar el paradigma `t_concat` con otras disposiciones de entrada en robótica.
- Benchmarking de estimadores de profundidad en robótica: la integración de VDA y `defm_vit_s14` permite evaluar su impacto en el rendimiento de la política.
- Archivística y trazabilidad de modelos: como release histórico con logs de finalización exitosa verificados, sirve para auditorías de reproducibilidad en publicaciones académicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El tamaño del repositorio es de 12,1 GB y los pesos se almacenan en `bfloat16`, lo que da una cota inferior aproximada de 12 GB solo para pesos, sin contar activaciones ni encoders congelados adicionales.
- GPU recomendadas: no disponibles en la información proporcionada. Por el tamaño del checkpoint, se requerirían GPU con al menos 16-24 GB de VRAM para cargar pesos en bf16, aunque no se especifica.
- Compatibilidad con GPU de consumo: no confirmada. Un checkpoint de 12,1 GB en bf16 podría caber en GPUs de 24 GB (RTX 3090/4090) si las activaciones son moderadas, pero no hay datos que lo confirmen.
- Opciones de despliegue: no se documentan. El autor indica que el checkpoint no es compatible con el evaluador SemWAM v2 actual y que requiere la implementación histórica original.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (políticas visomotoras para LIBERO con fusión semántica y de profundidad sobre DiT de vídeo).

## Limitaciones y advertencias

- Checkpoint histórico sin `checkpoint_version=2` ni `inference_config`: no es compatible con el evaluador actual de SemWAM v2 y requiere la implementación y configuración originales.
- La revisión del código fuente de entrenamiento original es desconocida, lo que dificulta la reproducibilidad exacta.
- Los campos ausentes en la configuración archivada son desconocidos; el autor advierte explícitamente que `null` no equivale a `false` y que los valores por defecto actuales no aplican.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución.
- Idiomas no disponibles: no se documenta el idioma de las instrucciones de condicionamiento.
- Sin descargas ni likes en el momento de la consulta, y sin benchmarks publicados: no hay evidencia externa de rendimiento.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; al ser un modelo de robótica, el riesgo relevante es de comportamiento erróneo en manipulación, no de generación de texto.
- Uso previsto archivístico, no de producción: el autor lo describe como "archival release, not a migration or a claim of current evaluation compatibility".

## Enlaces

- Hugging Face: https://huggingface.co/RainyBot/SemWAM-LIBERO-Legacy-dep-sem-step21700
- Backbone base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- No se han encontrado en la información proporcionada papers, blogs, repositorios ni demos adicionales.

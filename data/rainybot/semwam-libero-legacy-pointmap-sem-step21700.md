# RainyBot/SemWAM-LIBERO-Legacy-pointmap-sem-step21700

## Resumen

SemWAM-LIBERO-Legacy-pointmap-sem-step21700 es un checkpoint de investigación en robótica publicado por el usuario RainyBot en HuggingFace. Se trata de un archivo histórico ("historical archive") del proyecto SemWAM, correspondiente a la ejecución de entrenamiento ZeRO2_libero_pointmap_sem, guardado en el paso de optimizador final 21700/21700. El modelo se construye sobre el backbone de vídeo Wan-AI/Wan2.2-TI2V-5B y añade módulos de semántica (DINOv3 ViT-B/16) y de profundidad (estimador VDA con representación pointmap), con el objetivo de aprender políticas visomotoras para manipulación robótica en el benchmark LIBERO.

El checkpoint es relevante por su carácter de archivo: se publica byte a byte el formato pre-v2 original, sin `checkpoint_version=2` ni `inference_config`, y el autor advierte explícitamente de que no es compatible con el evaluador actual de SemWAM v2. No es una release migrada ni una afirmación de compatibilidad con la evaluación actual; la revisión del código de entrenamiento original es desconocida. El repo ocupa 12,1 GB y los pesos están en `torch.bfloat16`.

Por su naturaleza (archivo histórico de un run de investigación con 0 descargas y 0 likes, licencia no disponible y sin model card de rendimiento), debe tratarse como material de reproducibilidad interna más que como modelo listo para producción. La información pública disponible es fundamentalmente la configuración resuelta del run y los metadatos legacy de arquitectura.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | dep_sem (difusión de vídeo con fusión semántica y de profundidad); backbone Wan2.2-TI2V-5B |
| Parámetros totales | no disponible (backbone base Wan2.2-TI2V-5B; total del sistema no publicado) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en torch.bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible explícitamente; repo PyTorch de 12,1 GB, dtype torch.bfloat16 |
| Paradigma de entrada | t_concat |
| Disposición de vistas | libero_horizontal |
| Backbone semántico | dinov3_vitb16, feat_dim 768, fusión en capas [7, 23], temporal_pool mean |
| Backbone de profundidad | estimador vda, backbone vitb, input_size 518; repr pointmap |
| Dimensión de propiocepción | 8 |
| Enmascaramiento de atención de vídeo | first_frame_causal |
| Condicionado por acción | false (action_conditioned: false) |
| Muñeca (wrist) | view_size [128, 160], frame first, attends_video false, cámaras [left, right] |
| Pointmap | norm_bounds x/y [-0.6, 0.6], z [0.0, 1.5]; max_depth_m 2.0 |
| Intrínsecos | source auto; fovy 37° (high/left/right, 480x640), 45° (image 224x224), 75° (wrist_image 224x224) |
| Paso de optimizador guardado | 21700 / 21700 |

## Arquitectura y entrenamiento

La arquitectura declarada es `dep_sem`, un modelo de difusión de vídeo construido sobre Wan-AI/Wan2.2-TI2V-5B, con atención de vídeo en modo `first_frame_causal` y condicionamiento de acción desactivado (`action_conditioned: false`). El sistema incorpora dos ramas de representación congeladas: una semántica basada en DINOv3 ViT-B/16 (dimensión de característica 768, pooling temporal por media) cuyas características se fusionan en las capas 7 y 23 del transformer de vídeo, y una rama de profundidad que usa el estimador VDA (backbone ViT-B, entrada 518) para producir una representación de tipo pointmap con normalización en x/y en [-0.6, 0.6] y z en [0.0, 1.5], con profundidad máxima de 2,0 m. La propiocepción se inyecta con dimensión 8 y las vistas de muñeca se configuran a 128x160, usando solo el primer frame y sin atención de vídeo.

No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset (más allá de la referencia a LIBERO), ni sobre si se aplicaron etapas de RLHF, DPO o ajuste por preferencias. El checkpoint corresponde al paso de optimizador final 21700/21700 de un run con ZeRO2, y el autor indica que la configuración resuelta original (`config.yaml`) es la fuente autoritativa de la receta archivada, con campos ausentes marcados como desconocidos y valores potencialmente inactivos según las compuertas `arch` y `enabled/mode`. La revisión del código fuente de entrenamiento original es desconocida. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de vídeo condicionada por observaciones robóticas, con backbone de difusión Wan2.2-TI2V-5B.
- Representación semántica de escenas mediante DINOv3 ViT-B/16 fusionada en capas intermedias del transformer.
- Estimación de profundidad y construcción de pointmaps mediante el estimador VDA, con rangos métricos acotados a 2,0 m.
- Entrada multimodal compuesta por vistas de cámara (high, left, right e image) y vistas de muñeca (left, right) con intrínsecos predefinidos.
- Integración de propiocepción de 8 dimensiones.
- Diseñado para el benchmark LIBERO de manipulación robótica.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, capacidades multilingües, modo thinking, audio ni visión generalista fuera del pipeline robótico.
- El formato es un archivo histórico pre-v2 sin `inference_config`, no compatible con el evaluador SemWAM v2 actual.

## Casos de uso

- Reproducción de experimentos de investigación: el checkpoint permite replicar el run ZeRO2_libero_pointmap_sem en su paso final 21700 usando la implementación histórica y la configuración original, lo que resulta adecuado para auditoría de resultados publicados.
- Estudio de políticas visomotoras en LIBERO: sirve como referencia para analizar cómo la fusión semántica en capas 7 y 23 y la rama de pointmap afectan al aprendizaje de manipulación en entornos simulados.
- Análisis de representaciones de profundidad: la rama VDA con pointmap normalizado permite investigar la contribución de la geometría 3D a la generación de vídeo condicionada por observación.
- Comparación de arquitecturas de condicionamiento: al tener `action_conditioned: false` y `input_paradigm: t_concat`, es útil como línea base frente a variantes action-conditioned del mismo proyecto.
- Archivado y trazabilidad de modelos: al publicarse byte a byte el formato pre-v2, sirve para validar herramientas de migración o de carga de checkpoints legacy.
- Docencia y formación en robótica basada en modelos generativos: permite ilustrar un pipeline completo con encoders congelados (DINOv3, VDA), propiocepción y difusión de vídeo sobre un benchmark estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repo de 12,1 GB en bfloat16 sugiere que la carga completa requiere al menos del orden de 12 GB solo para pesos, más activaciones y encoders congelados (DINOv3 ViT-B/16 y VDA ViT-B).
- GPU recomendadas: no disponible. Por el tamaño del backbone (Wan2.2-TI2V-5B) y los encoders adicionales, se requiere hardware de数据中心 o GPUs de gama alta; no se especifican modelos concretos.
- ¿Cabe en GPU consumer?: no disponible; no se confirma compatibilidad con RTX 4090 u otras consumer.
- Opciones de despliegue: no disponible. El autor indica que debe usarse la implementación histórica correspondiente; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SemWAM-LIBERO-Legacy-pointmap-sem-step21700 | no disponible (backbone Wan2.2-TI2V-5B) | no disponible | no disponible | no disponible | HuggingFace, 0 descargas |
| Wan-AI/Wan2.2-TI2V-5B (backbone base) | ~5B (TI2V) | no disponible | no disponible | no disponible | HuggingFace |
| Alternativas de políticas robóticas sobre LIBERO | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Checkpoint histórico pre-v2: no incluye `checkpoint_version=2` ni `inference_config`, y el autor declara que no es compatible con el evaluador SemWAM v2 actual.
- No es una release migrada ni una afirmación de compatibilidad con la evaluación actual; requiere la implementación histórica y la configuración original.
- La revisión del código fuente de entrenamiento original es desconocida, lo que dificulta la reproducibilidad exacta.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución.
- Idiomas no disponibles; el modelo está orientado a un pipeline robótico, no a texto multilingüe.
- Riesgo de alucinación y sesgos: no documentado en la información disponible.
- Sin métricas de rendimiento publicadas: no hay evidencia de calidad en LIBERO ni en otros benchmarks.
- 0 descargas y 0 likes: sin validación comunitaria.
- El modelo está condicionado a intrínsecos y layouts específicos (libero_horizontal, vistas left/right, fovy definidos), por lo que su uso fuera de esa configuración puede no ser válido.

## Enlaces

- HuggingFace: https://huggingface.co/RainyBot/SemWAM-LIBERO-Legacy-pointmap-sem-step21700
- Backbone base referenciado: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- No se han encontrado en la información proporcionada papers, blogs, repositorios ni demos adicionales.

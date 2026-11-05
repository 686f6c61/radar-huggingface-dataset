# RainyBot/SemWAM-LIBERO-Legacy-rgb-dep-colormap-step21700

## Resumen

SemWAM-LIBERO-Legacy-rgb-dep-colormap-step21700 es un checkpoint histórico de robótica publicado por el usuario RainyBot en HuggingFace. Se trata de un modelo de política visomotora (vision-language-action, aunque la model card no lo confirma explícitamente) entrenado sobre el benchmark LIBERO, un conjunto de tareas de manipulación robótica. El checkpoint corresponde al paso de optimizador final 21700 de 21700, es decir, el modelo se guardó al completar su presupuesto de entrenamiento.

El modelo se construye sobre el backbone de vídeo Wan-AI/Wan2.2-TI2V-5B, un modelo de difusión de vídeo de 5 mil millones de parámetros, y añade codificación semántica mediante DINOv3 ViT-B/16 (768 dimensiones) y estimación de profundidad con VDA (ViT-B, entrada 518 px) en representación colormap con paleta turbo. La arquitectura combina RGB y profundidad, con un paradigma de entrada `t_concat` y disposición de vistas horizontal típica de LIBERO.

La relevancia de esta publicación es fundamentalmente archivística: el autor indica explícitamente que es un checkpoint pre-v2 publicado byte a byte, sin `checkpoint_version=2` ni `inference_config`, y que no es compatible con el evaluador actual de SemWAM v2. No es una release para uso en producción ni para evaluación con el stack actual, sino un artefacto de preservación reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión de vídeo (Wan2.2-TI2V-5B) con fusión semántica DINOv3 y profundidad VDA; arch `dep_rgb`, paradigma `t_concat` |
| Parametros totales | no disponible (backbone base Wan2.2-TI2V-5B de 5B; total del sistema no declarado) |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible (modelo de robótica por pasos, no LM de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en `torch.bfloat16`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`torch.bfloat16`), checkpoint original pre-v2 sin `inference_config` |

## Arquitectura y entrenamiento

El sistema parte de Wan-AI/Wan2.2-TI2V-5B como backbone de difusión de vídeo, con máscara de atención `first_frame_causal` y sin condicionamiento de acción explícito (`action_conditioned: false`). Sobre esta base se inyectan dos ramas de representación: una semántica con backbone DINOv3 ViT-B/16 (768 dimensiones, pooling temporal `mean`, fusión en capas 7 y 23) y una de profundidad en formato colormap con estimador VDA (ViT-B, entrada 518 px, tokenizer compartido). La dimensión propioceptiva es 8. La disposición de vistas es `libero_horizontal`, con cámaras de muñeca izquierda y derecha a 128×160, primer frame, sin atención al vídeo.

El entrenamiento se realizó sobre LIBERO y el checkpoint corresponde al paso 21700/21700, con logs de finalización exitosa (exit 0) y presupuesto del entrenador verificado según la model card. No se especifican en la información disponible el número de tokens, la composición exacta del dataset, ni si hubo RLHF/DPO. La revisión del código fuente original de entrenamiento es desconocida. La configuración de aumentación, objetivos y optimización se remite a `model_card_summary.json`, no incluido en la información proporcionada.

## Capacidades

- Política visomotora para manipulación robótica en el benchmark LIBERO, con entrada RGB más profundidad.
- Codificación semántica de escenas mediante DINOv3 ViT-B/16 con fusión en capas intermedias.
- Estimación y uso de profundidad en representación colormap (turbo, rango 0,1–2,0 m) con VDA.
- Soporte de múltiples cámaras: vistas simuladas izquierda/derecha y cámaras de muñeca.
- Entrada propioceptiva de 8 dimensiones.
- No se declara soporte de tool calling, function calling, agentes multi-paso, capacidades multilingües, thinking mode, visión general, audio ni otras capacidades de LM.
- Compatibilidad limitada: el checkpoint no es compatible con el evaluador SemWAM v2; requiere la implementación histórica y la configuración original.

## Casos de uso

- Reproducción de resultados históricos de LIBERO: utilizar el checkpoint con la implementación original para replicar las cifras del paso 21700, dado que es el artefacto exacto de final de entrenamiento.
- Auditoría de recetas de entrenamiento: comparar la configuración resuelta (`config.yaml` original) con recetas posteriores para entender cambios de arquitectura, representaciones y objetivos.
- Investigación en políticas visomotoras con profundidad: estudiar cómo la rama de profundidad colormap (turbo, 0,1–2,0 m) y la fusión semántica en capas 7 y 23 afectan al comportamiento en tareas de manipulación.
- Baseline para comparativas de checkpoints: servir como referencia fija frente a versiones v2 o reentrenamientos, siempre que se use el evaluador histórico correspondiente.
- Estudio de representaciones congeladas: analizar el efecto de DINOv3 ViT-B/16 y VDA ViT-B como codificadores congelados en un backbone de difusión de vídeo de 5B.
- Docencia y divulgación: ejemplo real de checkpoint archivístico con metadatos completos de configuración para explicar prácticas de preservación reproducible en ML.
- No recomendado para despliegue en producción ni para integración en pipelines actuales de SemWAM v2, dado que el autor lo declara no soportado por el evaluador vigente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repo ocupa 12,0 GB, lo que sugiere pesos en bfloat16 en ese orden de magnitud; la VRAM real dependerá de la implementación histórica y de las activaciones.
- GPU recomendadas: no disponible. Por el tamaño del backbone (5B) y el uso de bfloat16, se requerirían GPUs con al menos 16–24 GB de VRAM para carga en precisión nativa, aunque no hay confirmación del autor.
- ¿Cabe en GPU de consumo? No confirmado. Posible en GPUs de 24 GB (RTX 3090/4090) solo si la implementación original lo permite y con margen ajustado; no verificado.
- Opciones de despliegue: no disponible. El autor indica que requiere la implementación histórica y la configuración original; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmark | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SemWAM-LIBERO-Legacy-rgb-dep-colormap-step21700 | no disponible (backbone 5B) | no aplica | no disponible | no disponible | HuggingFace (RainyBot) |
| Wan-AI/Wan2.2-TI2V-5B | 5B | no disponible | no disponible | no disponible en esta ficha | HuggingFace (Wan-AI) |
| Alternativas de política LIBERO | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con otras políticas de LIBERO en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint archivístico: el autor declara explícitamente que es una release de preservación, no una migración, y que no es compatible con el evaluador SemWAM v2.
- Ausencia de `inference_config` y de `checkpoint_version=2`: impide su uso directo con el stack actual; requiere la implementación histórica.
- Revisión del código fuente original de entrenamiento desconocida, lo que dificulta la reproducibilidad completa.
- Licencia no disponible: no se puede asumir uso comercial ni redistribución sin consultar al autor.
- Idiomas no disponibles; el modelo no es un LM de texto y no aplica la noción habitual de cobertura lingüística.
- Riesgo de sobreajuste al benchmark LIBERO: al ser un checkpoint final de entrenamiento sobre ese conjunto, la generalización a otros entornos no está documentada.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento en la información disponible.
- Sin descargas ni likes en el momento de la consulta: no hay señal de validación por parte de la comunidad.
- El tamaño del repo (12,0 GB) y la falta de cuantizaciones publicadas limitan su despliegue en hardware modesto.

## Enlaces

- HuggingFace: https://huggingface.co/RainyBot/SemWAM-LIBERO-Legacy-rgb-dep-colormap-step21700
- Backbone base referenciado: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Benchmark LIBERO: no disponible en la información proporcionada
- Paper o blog del autor: no disponible
- Repositorio de código: no disponible

# RainyBot/SemWAM-LIBERO-Legacy-rgb-dep-pointmap-step21700

## Resumen

SemWAM-LIBERO-Legacy-rgb-dep-pointmap-step21700 es un checkpoint de investigación publicado por el usuario RainyBot en HuggingFace bajo el pipeline de robótica. Se trata de un modelo de política visomotora (vision-language-action, VLA) entrenado sobre el benchmark LIBERO, orientado a la manipulación robótica a partir de observaciones RGB y mapas de profundidad en forma de pointmap. El repositorio ocupa 12 GB y contiene pesos en formato PyTorch (bfloat16) junto con metadatos de configuración originales.

El modelo se construye sobre el backbone de vídeo Wan-AI/Wan2.2-TI2V-5B, un modelo de difusión de vídeo de 5B parámetros, al que se añaden encoders congelados: DINOv3 ViT-B/16 para la representación semántica (768 dimensiones, fusión en capas 7 y 23) y un estimador de profundidad VDA con backbone ViT-B a 518 px que produce pointmaps normalizados en un rango de profundidad de 0 a 2 m. La acción se condiciona mediante concatenación temporal (`t_concat`) y la disposición de vistas sigue el formato horizontal de LIBERO, con cámaras de muñeca izquierda y derecha a 128x160.

Este release es explícitamente un archivo histórico: corresponde al paso de optimizador final 21700/21700 de un entrenamiento original, se publica byte a byte sin migración a la versión 2 del formato SemWAM, y no es compatible con el evaluador actual. Su relevancia es, por tanto, documental y de reproducibilidad para investigadores que quieran auditar recetas de entrenamiento VLA sobre LIBERO, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión de vídeo (Wan2.2-TI2V-5B) con fusión semántica y de profundidad; política visomotora `dep_rgb` con condicionamiento de acción por concatenación temporal |
| Parametros totales | No disponible de forma explícita; el backbone declarado es Wan2.2-TI2V-5B (5B) |
| Parametros activos | No disponible (no se declara arquitectura MoE) |
| Longitud de contexto | No disponible (modelo de robótica, no de texto; ventana temporal definida por la configuración de vídeo) |
| Tipos de cuantizacion | No disponible; pesos guardados en `torch.bfloat16` |
| Idiomas soportados | No disponible (modelo visomotor, sin interfaz de lenguaje natural declarada) |
| Licencia | No disponible |
| Formato de pesos | PyTorch (`torch.bfloat16`), repositorio de 12 GB; sin GGUF ni safetensors declarados |

## Arquitectura y entrenamiento

La arquitectura combina un DiT de vídeo (Wan2.2-TI2V-5B) con máscara de atención `first_frame_causal` y sin condicionamiento directo de acción en el bloque de vídeo (`action_conditioned: false`). La observación se compone de tres fuentes: RGB de las vistas simuladas (FOV vertical de 37 grados, referencia 480x640), imágenes de muñeca (FOV de 75 grados, 224x224) y un pointmap de profundidad generado por el estimador VDA (ViT-B, entrada 518 px) con normalización en x,y ∈ [-0.6, 0.6] y z ∈ [0, 1.5], profundidad máxima de 2 m y colormap turbo entre 0,1 y 2 m. La semántica proviene de DINOv3 ViT-B/16 con pooling temporal medio e inyección en las capas 7 y 23 del transformer.

El entrenamiento se realizó sobre el benchmark LIBERO con layout horizontal de vistas y paradigma de entrada `t_concat`, alcanzando el paso de optimizador 21700/21700 con logs de finalización exitosa verificados el 2026-11-05. La configuración original resuelta (`config.yaml`) es la fuente autoritativa de la receta; los campos ausentes se marcan como desconocidos y no deben interpretarse como valores por defecto actuales. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generación de acciones robóticas de manipulación condicionadas a observaciones RGB y profundidad en entornos tipo LIBERO.
- Percepción multimodal: RGB multi-vista (cámaras izquierda/derecha y de muñeca) más pointmap de profundidad estimado.
- Fusión semántica mediante DINOv3 ViT-B/16 con inyección en capas intermedias del DiT.
- Modelado de dinámica de vídeo gracias al backbone Wan2.2-TI2V-5B con atención causal de primer frame.
- Soporte de propriocepción de 8 dimensiones (`proprio_dim: 8`).
- No se declara soporte de tool calling, function calling, agentes multi-paso, capacidades multilingües ni modos de razonamiento explícito.

## Casos de uso

- Reproducción de experimentos LIBERO: cargar el checkpoint con la implementación histórica y la configuración original para replicar exactamente el resultado del paso 21700, útil para auditorías de recetas de entrenamiento VLA.
- Investigación en políticas visomotoras con profundidad: estudiar cómo el pointmap de VDA y la fusión semántica de DINOv3 afectan al comportamiento de manipulación en tareas de LIBERO.
- Análisis de ablaciones arquitectónicas: comparar la variante `dep_rgb` con otras variantes de SemWAM que usen estimadores de profundidad distintos (UniDepth v2, etc.) gracias a que la configuración registra explícitamente ambos caminos.
- Estudio de condicionamiento de acción: analizar el efecto de `t_concat` frente a otras estrategias de inyección de acción en el DiT de vídeo.
- Docencia y formación: usar el checkpoint como ejemplo documentado de pipeline VLA con encoders congelados y backbone de difusión de vídeo.
- Archivado y trazabilidad de modelos: servir como referencia byte a byte para verificar la integridad de releases históricos en proyectos de reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con un backbone de 5B en bfloat16, la inferencia requiere previsiblemente del orden de 10-12 GB solo para pesos del DiT, más los encoders congelados (DINOv3 ViT-B/16 y VDA ViT-B) y activaciones de vídeo.
- GPU recomendadas: no disponibles en la información; por tamaño, se requiere al menos una GPU con 24 GB o más para bfloat16 sin cuantización.
- Cabe en GPU de consumo: no confirmado; probablemente una RTX 4090 (24 GB) sea el mínimo práctico, pero no hay datos publicados.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un modelo de robótica con implementación histórica propia, requiere el código original de SemWAM v1.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SemWAM-LIBERO-Legacy-rgb-dep-pointmap-step21700 | Backbone 5B (Wan2.2-TI2V-5B) | No disponible | No publicado | No disponible | HuggingFace (archivo histórico) |
| Alternativas VLA sobre LIBERO (p. ej. OpenVLA, π0) | No disponible en esta ficha | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos comparativos verificables en la información proporcionada para establecer una comparativa rigurosa con modelos de la misma categoría.

## Limitaciones y advertencias

- Checkpoint histórico sin `checkpoint_version=2` ni `inference_config`: no es compatible con el evaluador SemWAM v2 actual.
- Requiere la implementación histórica y la configuración original; la revisión del código fuente de entrenamiento es desconocida.
- Licencia no declarada: no hay autorización explícita para uso comercial ni para redistribución.
- Modelo entrenado exclusivamente sobre el benchmark LIBERO: la generalización a otros entornos, robots o tareas no está documentada.
- Sin benchmarks publicados: no es posible evaluar su rendimiento frente a alternativas.
- Riesgo de sobreajuste al simulador y a las cámaras específicas de LIBERO (FOV y resoluciones fijas).
- No dispone de interfaz de lenguaje natural ni de capacidades de agente; no debe confundirse con un LLM o VLM conversacional.
- Los campos marcados como `null` en la configuración no implican valores por defecto actuales; deben tratarse como desconocidos.
- El repositorio de 12 GB incluye pesos en bfloat16, lo que limita su despliegue en hardware modesto.

## Enlaces

- HuggingFace: https://huggingface.co/RainyBot/SemWAM-LIBERO-Legacy-rgb-dep-pointmap-step21700
- Backbone base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Benchmark LIBERO: no disponible en la información proporcionada.
- Repositorio de código SemWAM: no disponible en la información proporcionada.
- Paper o blog del modelo: no disponible en la información proporcionada.

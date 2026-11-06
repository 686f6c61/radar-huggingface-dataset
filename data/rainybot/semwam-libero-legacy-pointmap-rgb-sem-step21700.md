# RainyBot/SemWAM-LIBERO-Legacy-pointmap-rgb-sem-step21700

## Resumen

SemWAM-LIBERO-Legacy-pointmap-rgb-sem-step21700 es un checkpoint de investigación en robótica publicado por el usuario RainyBot en Hugging Face. Se trata de un artefacto de archivo histórico ("historical archive") del entrenamiento SemWAM, correspondiente al paso final de optimizador 21700/21700 de una ejecución denominada `ZeRO2_libero_pointmap_rgb_sem`. No es una release de modelo lista para producción: el propio autor indica que el checkpoint es pre-v2, publicado byte a byte, sin `checkpoint_version=2`, y que no es compatible con el evaluador actual de SemWAM v2.

El modelo se apoya en el backbone de vídeo Wan-AI/Wan2.2-TI2V-5B y añade módulos de semántica (DINOv3 ViT-B/16, 768 dimensiones) y de profundidad representada como pointmap (estimador VDA con backbone ViT-B, entrada 518). La arquitectura declarada es `rgb_dep_sem` con paradigma de entrada `t_concat` y layout de vistas `libero_horizontal`, orientada a tareas del benchmark LIBERO de manipulación robótica.

Su relevancia es fundamentalmente documental y de reproducibilidad: permite a investigadores recuperar el estado exacto de un entrenamiento histórico, con su configuración resuelta y metadatos de inferencia preservados. No hay métricas publicadas, ni licencia declarada, ni idiomas soportados, y el repositorio ocupa 12,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `rgb_dep_sem` sobre backbone de vídeo Wan2.2-TI2V-5B; fusión semántica (DINOv3 ViT-B/16) y de profundidad (pointmap, estimador VDA ViT-B); atención de vídeo `first_frame_causal` |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se declara configuración MoE) |
| Longitud de contexto | no disponible (modelo de robótica basado en observaciones, no de contexto textual) |
| Tipos de cuantizacion | no disponible; pesos guardados en `torch.bfloat16` |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | pesos PyTorch (`pytorch`, `torch.bfloat16`); tamaño del repo 12,1 GB |

## Arquitectura y entrenamiento

El checkpoint emplea una arquitectura multimodal de robótica que combina un difusor de vídeo (Wan2.2-TI2V-5B) con dos ramas de representación congeladas: una rama semántica basada en DINOv3 ViT-B/16 (768 dimensiones, pooling temporal medio) y una rama de profundidad que representa la escena como pointmap, estimada mediante VDA (ViT-B, entrada 518) con tokenizer compartido. La fusión semántica se inyecta en las capas 7 y 23 del difusor. La entrada sigue el paradigma `t_concat` con layout `libero_horizontal`, incluyendo vistas de muñeca izquierda y derecha a 128×160, con `proprio_dim` de 8 y atención de vídeo en modo `first_frame_causal`.

El entrenamiento se realizó con ZeRO-2 (según el nombre de la ejecución) hasta el paso de optimizador 21700, que el autor verifica como paso final con logs de finalización y presupuesto del entrenador coincidentes. La revisión del código fuente original es desconocida y el autor advierte que los campos ausentes en la configuración resuelta deben tratarse como desconocidos, no como falsos. No se documentan el número de tokens, la composición del dataset ni si hubo RLHF/DPO; el entrenamiento se enmarca en el benchmark LIBERO.

## Capacidades

- Modelado y predicción en entornos de manipulación robótica del benchmark LIBERO.
- Procesamiento de observaciones RGB con múltiples vistas (cámara principal y muñecas izquierda/derecha).
- Representación de profundidad como pointmap con normalización explícita (x, y en [-0,6, 0,6]; z en [0,0, 1,5]; profundidad máxima 2,0 m).
- Extracción de características semánticas mediante DINOv3 ViT-B/16 integradas en el difusor.
- Condicionamiento por propiocepción (8 dimensiones).
- Generación/modelado de vídeo condicionado por observación, con atención causal de primer fotograma.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multilingüe.

## Casos de uso

- Reproducción de experimentos históricos: investigadores que necesiten restaurar exactamente el estado del entrenamiento SemWAM en el paso 21700 pueden cargar este checkpoint con la implementación y configuración históricas originales, tal como indica el autor.
- Auditoría de pipelines de entrenamiento: los logs y metadatos preservados permiten verificar el presupuesto del entrenador y la finalización del run ZeRO-2, útil para estudios de trazabilidad.
- Desarrollo de políticas de manipulación en LIBERO: el modelo puede servir como referencia para evaluar variantes de representación pointmap + semántica en tareas de manipulación con múltiples vistas.
- Investigación en representaciones de profundidad: la configuración pointmap con VDA y tokenizer compartido permite estudiar el efecto de la profundidad explícita frente a RGB puro en políticas robóticas.
- Estudio de fusión multimodal: las capas de fusión semántica 7 y 23 sobre un difusor de vídeo son un objeto de análisis para investigar cómo inyectar características DINOv3 en modelos generativos.
- Base para comparaciones ablativas: al conservar la configuración resuelta (`model_card_summary.json`), se puede usar como punto de partida para comparar recetas alternativas de augmentación, muestreo y objetivos.
- Archivo y preservación de artefactos: publicaciones de checkpoints byte a byte como práctica de reproducibilidad en laboratorios de robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 12,1 GB en `bfloat16`, por lo que se requiere al menos ese orden de magnitud de memoria, más overhead de activaciones y del backbone Wan2.2-TI2V-5B.
- GPU recomendadas: no especificadas por el autor; por tamaño de pesos, se sitúan en el rango de GPUs de datacenter (A100, H100) para ejecución cómoda en `bfloat16`.
- Compatibilidad con GPU de consumo: no confirmada; probablemente requiere GPUs de gama alta con suficiente VRAM, pero no hay datos publicados.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el modelo es de robótica y requiere la implementación histórica original de SemWAM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SemWAM-LIBERO-Legacy-pointmap-rgb-sem-step21700 | no disponible | no aplica | no publicado | no disponible | Hugging Face (RainyBot) |
| Wan2.2-TI2V-5B (backbone base) | ~5B (según nombre) | no disponible | no disponible | no disponible | Hugging Face (Wan-AI) |
| Políticas LIBERO comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones completas de alternativas en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Checkpoint pre-v2 sin `checkpoint_version=2`: no es compatible con el evaluador actual de SemWAM v2; requiere la implementación histórica y la configuración original.
- El campo `inference_config` es una referencia histórica, no un contrato de restauración v2.
- La revisión del código fuente original del entrenamiento es desconocida.
- Los campos ausentes en la configuración resuelta deben considerarse desconocidos; `null` no equivale a `false`.
- Sin licencia declarada: no hay autorización explícita para uso comercial; debe contactarse con el autor antes de cualquier uso productivo.
- Sin idiomas soportados declarados ni benchmarks publicados, lo que impide evaluar calidad o sesgos.
- Riesgo de alucinación y sesgos: no evaluable por falta de datos; al ser un modelo de robótica, los riesgos se trasladan a la ejecución física en entornos reales.
- Descargas y likes nulos en el momento de la consulta: sin validación por parte de la comunidad.
- No es una release de migración ni una afirmación de compatibilidad con evaluación actual; su uso principal es archivístico.

## Enlaces

- Hugging Face: https://huggingface.co/RainyBot/SemWAM-LIBERO-Legacy-pointmap-rgb-sem-step21700
- Backbone base referenciado: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código o demos adicionales.

# RainyBot/SemWAM-LIBERO-Legacy-fastwam-step21700

## Resumen

SemWAM-LIBERO-Legacy-fastwam-step21700 es un checkpoint de investigación en robótica publicado por el usuario RainyBot en Hugging Face. Se trata de un modelo de política visuomotora (vision-language-action, VLA) orientado al benchmark LIBERO, construido sobre el backbone de difusión de vídeo Wan2.2-TI2V-5B de Alibaba y con una arquitectura interna denominada `fastwam`. El modelo incorpora módulos de representación semántica (DINOv3 ViT-B/16) y de profundidad (estimador VDA con backbone ViT-B y UniDepth v2) fusionados en capas concretas del DiT de vídeo.

El checkpoint corresponde al paso de optimizador final 21700 de 21700 de una ejecución de entrenamiento (`ZeRO2_libero_fastwam`). Es una publicación de archivo histórico: se distribuye byte a byte el checkpoint original pre-v2, sin `checkpoint_version=2` ni `inference_config`, por lo que no es compatible con el evaluador actual de SemWAM v2 y requiere la implementación histórica y la configuración original para su uso.

Su relevancia es fundamentalmente arqueológica y de reproducibilidad: permite recuperar una instantánea exacta de un entrenamiento de política robótica sobre LIBERO, con metadatos de configuración completos (arquitectura, encoders congelados, objetivos, aumentos de datos, optimización). No es un modelo listo para producción ni para evaluación directa con el stack actual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT de vídeo (`fastwam`) sobre backbone Wan2.2-TI2V-5B; 30 capas, hidden_dim 3072, 24 cabezas de 128 dim, ffn_dim 14336, patch_size [1,2,2], in/out_dim 48 |
| Parametros totales | no disponible (el backbone base Wan2.2-TI2V-5B tiene ~5B; el total del modelo compuesto no se explicita) |
| Parametros activos | no disponible (no se declara MoE activo en la configuración) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en `torch.bfloat16`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`torch.bfloat16`), repo de 12.0 GB; sin GGUF ni safetensors declarados |
| Paradigma de entrada | `t_concat` |
| Layout de vistas | `libero_horizontal` |
| Dimensión de propriocepción | 8 |
| Encoder semántico | DINOv3 ViT-B/16, feat_dim 768, pooling temporal `mean`, fusión en capas 7 y 23 |
| Encoder de profundidad | VDA (ViT-B, input 518), UniDepth v2 (ViT-B/14), representación `log3`, colormap turbo |
| Condicionamiento de acción | `observation`; `action_conditioned: false`; action_dim 7 |
| Máscara de atención de vídeo | `first_frame_causal` |
| Cámaras | left, right (wrist con view_size [128,160], frame `first`, `attends_video: false`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de difusión transformer (DiT) para vídeo, derivada de Wan2.2-TI2V-5B, con 30 bloques, dimensión oculta 3072 y FFN de 14336, atendiendo con 24 cabezas de 128 dimensiones. La entrada se organiza mediante el paradigma `t_concat` y un layout de vistas `libero_horizontal`, con máscara de atención `first_frame_causal` (el primer frame actúa como contexto causal del resto). La acción se condiciona a la observación (`action_conditioning: observation`) y el modelo no está condicionado por acción en el DiT (`action_conditioned: false`), con `action_dim` 7 y máscara de grupo `group_diagonal` para el agrupamiento causal de acciones.

Sobre el DiT se integran dos flujos de representación congelados: un encoder semántico DINOv3 ViT-B/16 (768 dims, pooling temporal por media) cuyas características se inyectan en las capas 7 y 23, y un estimador de profundidad VDA (ViT-B, entrada 518) junto con UniDepth v2 (ViT-B/14), con representación `log3` y mapa de colores turbo. La propriocepción entra con dimensión 8. El entrenamiento empleó ZeRO-2 (según el nombre de la ejecución `ZeRO2_libero_fastwam`), gradient checkpointing activado y `torch.bfloat16`. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset LIBERO utilizado, ni si hubo RLHF/DPO; la model card indica que los campos ausentes en la configuración resuelta son desconocidos y que los valores nulos no equivalen a `false`.

## Capacidades

- Política visuomotora para manipulación robótica en el entorno LIBERO (tareas de mesa con brazo manipulador).
- Condicionamiento por observación visual multi-vista (cámaras left/right y muñeca con vistas de 128x160).
- Uso de representaciones semánticas (DINOv3) y de profundidad (VDA/UniDepth v2) fusionadas en el DiT.
- Entrada de propriocepción de 8 dimensiones.
- Generación de acciones de 7 dimensiones (típicamente 6 DoF + pinza) mediante difusión.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, capacidades multilingües ni modos de razonamiento explícito (thinking).
- No se documentan capacidades de audio ni de visión general fuera del pipeline robótico.

## Casos de uso

- Reproducción de experimentos LIBERO: cargar el checkpoint con la implementación histórica y la configuración original para replicar exactamente los resultados del paso 21700, útil para auditoría de publicaciones.
- Investigación en políticas VLA: servir como punto de partida o referencia para estudiar la fusión de representaciones semánticas (DINOv3) y de profundidad (VDA/UniDepth) en un DiT de vídeo.
- Análisis de recetas de entrenamiento: la configuración archivada (aumentos, objetivos, optimización, ZeRO-2) permite estudiar el efecto de decisiones concretas sobre el rendimiento en LIBERO.
- Baseline para comparativas de arquitectura: comparar `fastwam` frente a otras variantes de SemWAM o a políticas VLA sobre el mismo benchmark.
- Estudio de condicionamiento por observación: analizar cómo el modelo genera acciones a partir de observaciones multi-vista sin condicionamiento explícito de acción en el DiT.
- Docencia y formación: ejemplo real de pipeline de entrenamiento distribuido con encoders congelados y fusión multimodal para robótica.
- Archivado y trazabilidad: conservar una instantánea byte a byte de un entrenamiento para cumplir requisitos de reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del repo: 12.0 GB (pesos en `torch.bfloat16`); se recomienda al menos 16 GB de VRAM solo para cargar pesos, más memoria para activaciones y encoders congelados.
- Backbone base Wan2.2-TI2V-5B (~5B parámetros) más encoders DINOv3 ViT-B/16, VDA ViT-B y UniDepth v2 ViT-B/14; en la práctica se requiere una GPU de gama alta.
- GPU recomendadas: A100 40/80 GB o H100 para inferencia cómoda y evaluación; posible en RTX 4090 (24 GB) con bfloat16 si se ajusta el batch y se descargan encoders no necesarios, aunque no está verificado en la información disponible.
- No cabe en GPUs de consumo de gama media (8-12 GB) sin cuantización, y no se documentan formatos GGUF/INT8/INT4.
- Opciones de despliegue: al ser un checkpoint PyTorch histórico sin `inference_config`, requiere la implementación SemWAM histórica; no se garantiza compatibilidad con vLLM, llama.cpp, Ollama o TGI (orientados a LLMs, no a este pipeline).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Benchmark LIBERO | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SemWAM-LIBERO-Legacy-fastwam-step21700 | ~5B (backbone) + encoders | no disponible | no disponible | no disponible | Hugging Face (archivo histórico) |
| SemWAM v2 (evaluador actual) | no disponible | no disponible | no disponible | no disponible | referenciado en la model card, no enlazado |
| Wan2.2-TI2V-5B (base) | ~5B | no disponible | no aplica (generación de vídeo) | no disponible en esta ficha | Hugging Face (Wan-AI) |
| Otras políticas VLA sobre LIBERO (p. ej. OpenVLA, π0) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos verificados en la información proporcionada; la comparativa anterior es estructural y no de rendimiento.

## Limitaciones y advertencias

- Checkpoint histórico pre-v2: no incluye `checkpoint_version=2` ni `inference_config`; no es compatible con el evaluador actual de SemWAM v2.
- Requiere la implementación histórica y la configuración original; la revisión del código fuente de entrenamiento es desconocida.
- Licencia no declarada: no se puede asumir uso comercial; verificar con el autor antes de cualquier despliegue.
- Idiomas no declarados; el modelo no es un LLM y no procesa lenguaje natural de forma general.
- Sesgos y alucinaciones: no documentados; al ser una política robótica, el riesgo se traduce en acciones incorrectas o inseguras en entornos físicos.
- Ámbito restringido al benchmark LIBERO y a tareas de manipulación simuladas; no se garantiza transferencia a robots reales.
- Sin benchmarks publicados: no hay evidencia de rendimiento frente a alternativas.
- Repo de 12 GB sin cuantizaciones: coste de almacenamiento y de memoria elevado.
- Fecha de creación futura (2026-11-05) y 0 descargas/0 likes: madurez y validación por la comunidad inexistentes.

## Enlaces

- Hugging Face: https://huggingface.co/RainyBot/SemWAM-LIBERO-Legacy-fastwam-step21700
- Backbone base Wan2.2-TI2V-5B: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- DINOv3 (encoder semántico): no disponible en la información proporcionada
- UniDepth v2 (encoder de profundidad): no disponible en la información proporcionada
- VDA (estimador de profundidad): no disponible en la información proporcionada
- Benchmark LIBERO: no disponible en la información proporcionada
- Paper o blog de SemWAM: no disponible en la información proporcionada

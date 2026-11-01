# bigshanedogg/DA3-LARGE-1.1

## Resumen

DA3-LARGE-1.1 es un modelo de estimación de profundidad y geometría multivista desarrollado originalmente por ByteDance Seed (Haotong Lin, Sili Chen, Jun Hao Liew y colaboradores) y publicado como parte del proyecto Depth Anything 3. Esta ficha concreta corresponde al repositorio `bigshanedogg/DA3-LARGE-1.1`, un port no oficial al formato nativo de transformers del checkpoint oficial `depth-anything/DA3-LARGE-1.1`, que permite cargar el modelo con `AutoModelForDepthEstimation` y `trust_remote_code=True` sin depender del paquete `depth_anything_3`.

El modelo resuelve la reconstrucción del espacio visual a partir de una o varias vistas: estima profundidad relativa, pose de cámara y admite condicionamiento por pose (extrínsecos e intrínsecos), además de decodificación de poses mediante una cabeza de rayos (`use_ray_pose`). Con 410.941.767 parámetros y un repositorio de 1,6 GB en safetensors, se sitúa en la gama "large" de la familia Depth Anything 3.

Su relevancia actual radica en que ofrece una vía de integración directa en el ecosistema transformers para tareas de image-to-3D y multi-view geometry, manteniendo los pesos idénticos al checkpoint original (verificados tensor a tensor) y con paridad numérica bit a bit frente al paquete oficial en fp32 y bajo autocast. La licencia Apache-2.0 facilita su uso comercial y su incorporación en pipelines de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red Depth Anything 3 (any-view), port a transformers con código vendedor (`da3_*.py`); configuración `da3_config` equivalente a `configs/da3-large.yaml` |
| Parametros totales | 410.941.767 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; procesa N imágenes por forward) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; inferencia en fp32, fp16 o bf16 vía autocast) |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es la red oficial de Depth Anything 3 reconstruida a partir del grafo de objetos del checkpoint original (`config.json` → `da3_config`, idéntico a `configs/da3-large.yaml`), tal como lo construye `depth_anything_3.cfg.create_object`. El código de red es el oficial de ByteDance-Seed/depth-anything-3 (commit 3d835ec1), vendedorizado en ficheros planos `da3_*.py`; los únicos cambios son de imports y el renombrado de un logger. El `forward` devuelve un `DepthAnything3Output` (ModelOutput) donde la salida `depth` de la red pasa a llamarse `predicted_depth`, conservando el resto de claves.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en la información proporcionada. La model card indica que el port ha sido verificado contra el paquete oficial (mismo proceso y semillas, V100, 4 imágenes): preprocesado y todas las salidas del forward plano, condicionado por pose y ray-pose son bit-idénticas, también como tupla, en fp32 y bajo el autocast de la API del paquete. Algunas salidas emplean muestreo aleatorio (el manejo de cielo muestrea profundidades), por lo que se recomienda fijar la semilla de torch para reproducibilidad.

## Capacidades

- Estimación de profundidad relativa a partir de una o varias imágenes (`predicted_depth` con forma `(1, N, H, W)`).
- Estimación de confianza de profundidad (`depth_conf`) y otras salidas del modelo.
- Geometría multivista: procesa N vistas en un mismo forward.
- Condicionamiento por pose: acepta `extrinsics` (1, N, 4, 4) e `intrinsics` (1, N, 3, 3), con intrínsecos que siguen el redimensionado si se pasan al processor.
- Decodificación de poses desde la cabeza de rayos mediante `use_ray_pose=True`.
- Extracción de características del backbone con `export_feat_layers=[i, ...]`, devueltas en `outputs.aux`.
- Compatibilidad con `AutoModel` y `return_dict=False` (salida como tupla).
- No dispone de generación de texto, tool calling, agentes ni capacidades multilingües: es un modelo puramente visual de estimación de profundidad y geometría.

## Casos de uso

- Reconstrucción 3D a partir de múltiples vistas: el modelo procesa N imágenes en un solo forward y devuelve profundidad por vista más poses, lo que permite alimentar pipelines de fotogrametría o NeRF/3DGS con geometría inicial consistente.
- Generación de mapas de profundidad para post-proceso de imagen: integrable en flujos de edición o composición donde se necesita un mapa denso de profundidad relativa por fotograma.
- Realidad aumentada y mixta: la estimación conjunta de profundidad y pose de cámara permite anclar objetos virtuales sobre superficies reales en escenas capturadas con varias imágenes.
- Robótica y navegación visual: la profundidad relativa multivista y las poses estimadas sirven como señal de percepción para planificación de movimiento o evitación de obstáculos en entornos controlados.
- Digitalización de patrimonio y escaneo de objetos: con un conjunto de fotos alrededor de un objeto, el modelo aporta profundidad y poses para iniciar la reconstrucción de malla o nube de puntos.
- Preprocesado para modelos generativos 3D: las salidas de profundidad, confianza y características del backbone (`export_feat_layers`) pueden emplearse como condición geométrica en pipelines de image-to-3D.
- Automatización de control de calidad en visión industrial: la profundidad relativa y la confianza permiten detectar irregularidades superficiales o diferencias de relieve entre capturas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 410,9 M de parámetros, los pesos en fp32 ocupan aproximadamente 1,6 GB, en fp16/bf16 unos 0,8 GB, a lo que hay que sumar activaciones que crecen con el número de vistas N y la resolución de entrada.
- GPU recomendadas: la verificación del port se realizó en una V100; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería poder ejecutar inferencia en fp16/bf16, aunque la memoria real depende de N y de la resolución.
- GPU de consumo: sí, cabe en GPU de consumo (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4090) en fp16/bf16, siempre que se ajusten el número de vistas y la resolución.
- Opciones de despliegue: transformers con `trust_remote_code=True` (`AutoModelForDepthEstimation` y `AutoProcessor`), con autocast en bf16 o fp16. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de visión de este tipo).
- Dependencias de runtime adicionales a torch/transformers: `addict`, `omegaconf`, `einops`, `opencv-python`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entradas | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| bigshanedogg/DA3-LARGE-1.1 (este) | 410.941.767 | N vistas por forward | Apache-2.0 | HuggingFace, transformers con trust_remote_code | Port no oficial, pesos idénticos al checkpoint oficial |
| depth-anything/DA3-LARGE-1.1 | no disponible en la informacion | N vistas por forward | Apache-2.0 | HuggingFace (checkpoint oficial) | Requiere el paquete `depth_anything_3` |
| Otros modelos de estimación de profundidad | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Es un port no oficial: aunque los pesos son idénticos y la paridad numérica está verificada, no cuenta con el respaldo del equipo de ByteDance Seed.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código vendedorizado en el entorno; conviene auditar los ficheros `da3_*.py` antes de desplegar en producción.
- Salidas con muestreo aleatorio (manejo de cielo): sin fijar la semilla de torch, los resultados pueden variar entre ejecuciones.
- No es un modelo lingüístico: no soporta generación de texto, tool calling, agentes ni capacidades multilingües; los campos de idiomas y contexto no aplican.
- No se dispone de información sobre sesgos, tasas de alucinación o comportamiento en dominios fuera de distribución; la profundidad es relativa, no métrica absoluta, salvo que se calibre externamente.
- La memoria y la latencia dependen fuertemente del número de vistas N y de la resolución de entrada; no hay cifras publicadas de throughput.
- Licencia Apache-2.0: permite uso comercial, pero debe conservarse la atribución y el NOTICE del repositorio, y citarse el trabajo original según pide el autor.

## Enlaces

- Repositorio del port: https://huggingface.co/bigshanedogg/DA3-LARGE-1.1
- Checkpoint oficial: https://huggingface.co/depth-anything/DA3-LARGE-1.1
- Repositorio de código original: https://github.com/ByteDance-Seed/depth-anything-3
- Paper: https://arxiv.org/abs/2511.10647

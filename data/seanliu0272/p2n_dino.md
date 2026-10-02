# SeanLiu0272/p2n_DINO

## Resumen

Past2Next DINO es un repositorio de checkpoints de investigación en robótica publicado por SeanLiu0272 (Haotian Liu) en Hugging Face. No se trata de un modelo de propósito general ni de un modelo de lenguaje: son dos ejecuciones de entrenamiento (training runs) de una política robótica denominada Past2Next que emplea como backbone de visión congelado el modelo `facebook/dinov3-vits16-pretrain-lvd1689m`, un ViT-S/16 de la familia DINOv3. Las dos variantes son `p2n_new_nut_washer_20260924_125617` (Past2Next simple) y `p2n_state_gate_new_nut_washer_20260924_130236` (Past2Next con compuerta de estado, state-gated).

El repositorio ocupa 31,0 GB e incluye, por cada ejecución, seis checkpoints guardados, la configuración de entrenamiento resuelta, metadatos de preflight, la división del dataset y los registros de entrenamiento. La tarea asociada, según los nombres de directorio, es la comprobación de tuercas y arandelas (nut washer check), un escenario concreto de inspección o manipulación robótica.

Su relevancia es acotada y fundamentalmente reproducible: permite auditar y reanudar dos entrenamientos concretos y comparar el efecto de una compuerta de estado sobre una política visomotora. Los checkpoints contienen estado de entrenamiento, exigen la implementación Past2Next correspondiente (no incluida en el repositorio) y no funcionan como modelos Transformers autónomos. No se publican ni el código ni los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política robótica Past2Next sobre backbone de visión DINOv3 ViT-S/16 (vision transformer, parches de 16x16); arquitectura interna de Past2Next: no disponible |
| Parametros totales | no disponible (los checkpoints incluyen estado de entrenamiento y no se documenta el tamaño del policy) |
| Parametros activos | no aplica: no es un modelo Mixture-of-Experts |
| Longitud de contexto | no disponible; no aplica como ventana de tokens de texto |
| Tipos de cuantizacion | no disponible; se distribuyen en el formato de precisión del entrenamiento (PyTorch) |
| Idiomas soportados | no disponible; el repositorio no declara idiomas y el pipeline es de robótica |
| Licencia | no disponible |
| Formato de pesos | checkpoints PyTorch (`.ckpt`, con `checkpoints/latest.ckpt` por ejecución); no hay safetensors, GGUF ni ONNX |
| Backbone de visión | facebook/dinov3-vits16-pretrain-lvd1689m (congelado) |
| Variantes incluidas | p2n_new_nut_washer_20260924_125617 (Past2Next simple); p2n_state_gate_new_nut_washer_20260924_130236 (state-gated) |
| Checkpoints por variante | 6 |
| Libreria | pytorch |
| Pipeline declarado | robotics |
| Tamano del repositorio | 31,0 GB |
| Fecha de publicacion | 2026-10-01 (ultima actualizacion: 2026-10-01) |
| Descargas / likes | 0 / 0 |
| Idiomas / region | region: us |

## Arquitectura y entrenamiento

La model card describe dos entrenamientos que parten del backbone de visión `facebook/dinov3-vits16-pretrain-lvd1689m` mantenido congelado. DINOv3 es una familia de vision transformers auto-supervisados de Meta AI que produce características visuales universales, con parches de 16x16 píxeles en la variante ViT-S/16. Sobre ese extractor se entrena la política Past2Next, de la que solo se indica el nombre y la existencia de una variante con compuerta de estado; no se detalla su arquitectura interna, el mecanismo de la compuerta ni si predice acciones de forma directa o autorregresiva.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, el número de episodios ni el uso de RLHF, DPO o aprendizaje por imitación. La model card únicamente confirma que el repositorio incluye la configuración de entrenamiento resuelta, metadatos de preflight, la división del dataset (dataset split) y los registros de entrenamiento, pero no el dataset en sí ni el código fuente de la implementación. El archivo `snapshot_manifest.json` recoge tamaños de archivo y sumas de verificación SHA-256, lo que permite verificar la integridad de la descarga.

## Capacidades

- Ejecución de una política robótica entrenada para una tarea concreta de tuercas y arandelas (nut washer), según los nombres de los directorios incluidos.
- Extracción de características visuales mediante el backbone DINOv3 ViT-S/16 congelado, reutilizable para tareas densas y de nivel de imagen.
- Variante state-gated: incorpora información de estado adicional como entrada de la política, frente a la variante simple que no lo hace.
- Reanudación de entrenamiento: los checkpoints incluyen estado de entrenamiento (no solo pesos), lo que permite continuar una ejecución.
- Comparación controlada de dos configuraciones bajo el mismo backbone congelado y el mismo esquema de datos.
- No dispone de generación de texto, tool calling, function calling, razonamiento multi-paso, capacidades de agente, multimodalidad de lenguaje, audio ni modo de pensamiento.
- No es un modelo desplegable de forma autónoma: requiere la implementación Past2Next compatible con los checkpoints.

## Casos de uso

- Reproducción de experimentos en robótica: cargar los seis checkpoints de cada variante junto con la configuración resuelta y los registros para replicar exactamente las dos ejecuciones publicadas.
- Estudio de ablación sobre gating de estado: comparar `p2n_new_nut_washer` frente a `p2n_state_gate_new_nut_washer` manteniendo constante el backbone congelado, para aislar el efecto de la compuerta de estado.
- Transferencia a nuevas tareas de manipulación: usar los pesos como inicialización en un fine-tuning sobre otra tarea de picking o inserción en laboratorio.
- Verificación de integridad de artefactos de entrenamiento: el `snapshot_manifest.json` con sumas SHA-256 permite auditar la descarga y detectar corrupción en pipelines de MLOps.
- Investigación en representaciones visuales: aprovechar el backbone DINOv3 ViT-S/16 congelado para extraer embeddings en tareas de clasificación, segmentación o estimación de profundidad dentro de un proyecto de robótica.
- Reconstrucción de pipelines de entrenamiento: la configuración resuelta y los metadatos de preflight sirven como plantilla para montar un pipeline propio de políticas visomotoras.
- Docencia y formación: los checkpoints y los logs permiten explicar en un curso el ciclo completo de entrenamiento de una política robótica real, incluyendo la división de datos.
- Despliegue experimental en laboratorio sobre un brazo robótico para la tarea nut washer, siempre que se reimplemente la política Past2Next y se actualicen las rutas locales guardadas en la configuración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: no disponible como cifra oficial. El repositorio pesa 31,0 GB repartidos en dos ejecuciones con seis checkpoints cada una (del orden de 2,5 GB por checkpoint incluyendo estado de entrenamiento), por lo que el tamaño de los pesos de la política es sustancialmente menor que esa cifra, pero no se puede determinar sin la implementación.
- El backbone congelado es un ViT-S/16, una variante pequeña de la familia DINOv3; un extractor de este tamaño cabe holgadamente en GPUs de consumo (RTX 3060 12 GB, RTX 4090 24 GB) incluso en fp32 con lotes pequeños. Esta estimación se refiere solo al backbone, no al policy completo.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 8 GB de VRAM para experimentación con el backbone; A100 o H100 no son necesarias para inferencia del extractor, pero pueden serlo para reentrenar la política.
- Almacenamiento: se necesitan al menos 31 GB libres para el snapshot completo, más espacio adicional para checkpoints derivados.
- Opciones de despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje. El despliegue requiere PyTorch con CUDA (o CPU/ROCm) y la implementación Past2Next correspondiente.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Backbone | Tamano de repo | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| SeanLiu0272/p2n_DINO | Política robótica (2 ejecuciones) | DINOv3 ViT-S/16 congelado | 31,0 GB | no disponible | checkpoints PyTorch (.ckpt) | pública en HF, 0 descargas |
| SeanLiu0272/p2n_DiTL | Política robótica de difusión (DiT) | no disponible en la información recogida | no disponible | no disponible | no disponible | pública en HF, 0 likes |
| facebook/dinov3-vits16-pretrain-lvd1689m | Vision transformer auto-supervisado | propio | no disponible | no disponible en esta ficha | safetensors según el repositorio original | público en HF |
| facebookresearch/dinov2 | Vision transformer auto-supervisado | propio | no disponible | uso solo de investigación en los componentes `cell_dino` según el repositorio de código | safetensors y PyTorch | público en GitHub |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa entre estos elementos.

## Limitaciones y advertencias

- Los checkpoints no son modelos autónomos: requieren la implementación Past2Next, que no se incluye en el repositorio, por lo que no se pueden cargar con `transformers` ni con bibliotecas estándar de inferencia.
- No se publican los datos de entrenamiento, de modo que no es posible auditar sesgos, cobertura de escenarios ni posibles fugas entre train y test.
- Licencia no declarada: sin una licencia explícita, el uso comercial y la redistribución quedan en un limbo legal y deben tratarse como no permitidos hasta que el autor lo aclare.
- Las rutas locales guardadas en la configuración de entrenamiento pueden no ser válidas en otra máquina y requieren actualización manual.
- El alcance es una única tarea (nut washer) con dos variantes; no hay evidencia de generalización a otras tareas sin fine-tuning.
- Ausencia total de benchmarks publicados: no hay métricas de éxito, tasa de acierto ni comparación contra otras políticas.
- Sin validación de la comunidad: 0 descargas y 0 likes en el momento del análisis, y ningún paper o informe técnico asociado en la información disponible.
- El riesgo de alucinación tal como se entiende en modelos de lenguaje no aplica, pero sí existe riesgo de fallos silenciosos en la política, sin métricas de error publicadas que permitan acotarlo.
- El repositorio emplea nombres y configuraciones asociados a fechas de 2026; conviene verificar la vigencia y la compatibilidad de versiones de PyTorch y CUDA indicadas en la configuración resuelta.
- El tamaño de 31,0 GB obliga a planificar el almacenamiento y el ancho de banda de descarga antes de cualquier experimento.

## Enlaces

- Repositorio del modelo: https://huggingface.co/SeanLiu0272/p2n_DINO
- Perfil del autor (Haotian Liu): https://huggingface.co/SeanLiu0272
- Repositorio relacionado del mismo autor: https://huggingface.co/SeanLiu0272/p2n_DiTL
- Backbone DINOv3 ViT-S/16: https://huggingface.co/facebook/dinov3-vits16-pretrain-lvd1689m
- Código y modelos DINOv2 (Meta): https://github.com/facebookresearch/dinov2
- Demo de DINOv2 (Meta AI): https://dinov2.metademolab.com/
- Artículo explicativo sobre DINO, DINOv2 y DINOv3: https://www.mlguerrilla.com/models/dino

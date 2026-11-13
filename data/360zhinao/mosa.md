# 360ZhiNao/MoSA

## Resumen

MoSA (Motion-Grounded Segment Anything) es un modelo de segmentación de imágenes presentado en el artículo *Seeing as Humans Do: Learning from Motion to Segment Anything Without Supervision* (ECCV 2026), desarrollado por el grupo 360ZhiNao (360CVGroup). No es un modelo de lenguaje, sino un conjunto de checkpoints de visión por computador orientados a la segmentación de objetos aprendiendo de la señal de movimiento, sin necesidad de supervisión humana en forma de máscaras anotadas.

El repositorio de Hugging Face distribuye cuatro ficheros de pesos en formato PyTorch (`.pth`): tres pertenecen a MoSA propiamente dicho (generación de pseudo-máscaras, segmentación con prompt de punto y segmentación de imagen completa) y un cuarto es un checkpoint de terceros (MoBY Swin-Tiny preentrenado en ImageNet-1K) usado únicamente como inicialización. Los backbones son ligeros: ViT-B/8, Swin-Tiny y ResNet-50.

La relevancia del modelo radica en su enfoque no supervisado para la segmentación, que reduce la dependencia de datasets con máscaras densas y lo aproxima a la forma en que los humanos segmentan a partir del movimiento. La información pública disponible es escasa: el repositorio no incluye model card detallada, licencia, idiomas ni resultados de benchmarks, y el artículo aún no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible con detalle; backbones ViT-B/8, Swin-Tiny y ResNet-50 segun el checkpoint |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | No disponible (checkpoints en `.pth`, sin versiones GGUF/ONNX publicadas) |
| Idiomas soportados | No aplica (modelo de vision) |
| Licencia | No disponible |
| Formato de pesos | PyTorch (`.pth`) |

## Arquitectura y entrenamiento

MoSA se compone de tres etapas o componentes diferenciados por checkpoint: un módulo de generación de pseudo-máscaras con backbone ViT-B/8 (`pgm.pth`), un segmentador con prompt de punto sobre Swin-Tiny (`promptable_segmentation.pth`) y un segmentador de imagen completa sobre ResNet-50 (`whole_image_segmentation.pth`). El pipeline de adaptación se basa en UnSAM, según indica la propia model card en los agradecimientos.

El entrenamiento se plantea sin supervisión: el modelo aprende a segmentar a partir de la señal de movimiento, siguiendo la premisa del título *Learning from Motion to Segment Anything Without Supervision*. No se especifican en la información disponible el número de tokens, la composición del dataset, ni si se emplearon técnicas de alineación como RLHF o DPO (no aplicables en un modelo de visión). Tampoco se detallan innovaciones como decodificación especulativa o atención lineal. El checkpoint `moby_swin_t_300ep_pretrained.pth` no fue entrenado por los autores: es el MoBY Swin-Tiny preentrenado 300 épocas en ImageNet-1K del proyecto Transformer-SSL, y se usa solo como inicialización para la configuración de UnSAM.

## Capacidades

- Generación de pseudo-máscaras de segmentación a partir de movimiento (checkpoint `pgm.pth`, ViT-B/8).
- Segmentación guiada por prompt de punto (point-promptable segmentation) con Swin-Tiny.
- Segmentación de imagen completa (whole-image segmentation) con ResNet-50.
- Aprendizaje no supervisado: no requiere máscaras anotadas manualmente para el entrenamiento del pipeline principal.
- Integración con el ecosistema UnSAM para adaptación y evaluación.
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni multilingüismo, al tratarse de un modelo de visión.

## Casos de uso

- Segmentación de objetos en vídeo o secuencias con movimiento: el módulo de pseudo-máscaras aprovecha la señal de movimiento para generar máscaras iniciales sin anotación, útil en pipelines de etiquetado automático.
- Preetiquetado para datasets de visión: usar `pgm.pth` para producir pseudo-máscaras que luego se revisan y corrigen, reduciendo el coste de anotación manual en proyectos de segmentación.
- Segmentación interactiva con clics: el checkpoint `promptable_segmentation.pth` permite construir herramientas donde el usuario señala un punto y el modelo devuelve la máscara del objeto, adecuado para editores de imagen o anotadores.
- Segmentación semántica de imagen completa: `whole_image_segmentation.pth` sirve para tareas de segmentación densa en imágenes estáticas donde no hay movimiento disponible.
- Investigación en aprendizaje autosupervisado: reproducir y extender el enfoque motion-grounded para estudiar hasta qué punto el movimiento sustituye a la supervisión humana.
- Integración en pipelines de robótica o conducción: la segmentación basada en movimiento encaja en escenarios con flujo óptico disponible (cámaras en movimiento, vehículos), donde separar objeto y fondo por movimiento es natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el enlace al artículo se añadirá tras la release oficial de ECCV 2026, y no incluye métricas (mIoU, AP, etc.) ni comparativas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Por el tamaño del repositorio (1,0 GB para cuatro checkpoints) y los backbones (ViT-B/8, Swin-Tiny, ResNet-50), la inferencia es ligera y previsiblemente cabe en GPUs de consumo, pero no hay cifras publicadas.
- GPU recomendadas: no disponible. Los backbones pequeños (Swin-Tiny, ResNet-50) sugieren que una RTX 3060/4090 sería suficiente; ViT-B/8 requiere algo más de memoria por la resolución de parche 8.
- Cabe en GPU de consumo: probablemente sí, sin datos oficiales que lo confirmen.
- Opciones de despliegue: los checkpoints son `.pth` de PyTorch y se usan mediante el repositorio de GitHub de MoSA; no hay versiones para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de visión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Backbone | Supervisión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MoSA | Segmentación motion-grounded | ViT-B/8, Swin-Tiny, ResNet-50 | No supervisada (movimiento) | No disponible | Hugging Face + GitHub |
| UnSAM | Segmentación universal | No disponible en la información | No disponible | No disponible | GitHub (frank-xwang/UnSAM) |
| Segment Anything (SAM) | Segmentación promptable | ViT (familia SAM) | Supervisada con máscaras | No disponible en la información | No disponible en la información |
| MoBY Swin-Tiny | Preentrenamiento autosupervisado | Swin-Tiny | Autosupervisado (MoBY) | Términos upstream de Transformer-SSL | GitHub (SwinTransformer/Transformer-SSL) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La licencia no está especificada en el repositorio; no se puede confirmar el uso comercial sin consultar al autor.
- El artículo aún no se ha publicado (previsto para ECCV 2026), por lo que no hay evaluación peer-reviewed ni métricas públicas.
- El checkpoint `moby_swin_t_300ep_pretrained.pth` es de terceros y está sujeto a los términos y requisitos de cita del proyecto Transformer-SSL; no debe atribuirse a los autores de MoSA.
- El modelo depende de la señal de movimiento para su pipeline principal; en imágenes estáticas sin flujo óptico su aplicabilidad se reduce al checkpoint de imagen completa.
- No hay información sobre sesgos, robustez ante dominios distintos del de entrenamiento ni comportamiento en escenas complejas.
- El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validación por parte de la comunidad.
- No se ofrecen pesos cuantizados ni formatos alternativos (ONNX, GGUF), lo que limita el despliegue fuera de PyTorch.
- La fecha de creación del repositorio (2026-11-13) es posterior a la release esperada de ECCV 2026; conviene verificar la vigencia de los enlaces.

## Enlaces

- Hugging Face: https://huggingface.co/360ZhiNao/MoSA
- Repositorio GitHub de MoSA: https://github.com/360CVGroup/MoSA
- UnSAM (pipeline de adaptación): https://github.com/frank-xwang/UnSAM
- Configuración UnSAM usada: https://github.com/frank-xwang/UnSAM/blob/main/promptable_segmentation/configs/semantic_sam_only_sa-1b_swinT.yaml
- MoBY / Transformer-SSL (checkpoint de terceros): https://github.com/SwinTransformer/Transformer-SSL
- Artículo (pendiente de publicación): no disponible

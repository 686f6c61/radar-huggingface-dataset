# canvit/probe-ade20k-40k-s1024-c64-abl-no-vpe

## Resumen

CanViT (Canvas Vision Transformer) es un modelo fundacional de vision activa desarrollado por el equipo de investigacion del que forman parte Yohai-Eliel Berreby, Sabrina Du, Audrey Durand y B. Suresh Krishna, presentado en NeurIPS 2026. En lugar de procesar una imagen completa de una sola pasada, el modelo observa la escena mediante una secuencia de "glimpses" (vistazos parciales) y acumula la informacion en un lienzo (canvas) de representacion global. Este repositorio concreto no contiene el modelo fundacional completo, sino una sonda lineal (linear probe) de segmentacion semantica entrenada sobre las caracteristicas congeladas del canvas de 64 x 64 de la variante `canvitb16-abl-no-vpe-2026-03-03`.

El checkpoint es un artefacto de evaluacion del protocolo de probing del paper: un cabezal ligero (LayerNorm, dropout, BatchNorm y una convolucion 1 x 1) que proyecta las caracteristicas del canvas a las 150 clases de ADE20K. Su interes practico es que permite medir la calidad de las representaciones aprendidas por CanViT sin reentrenar el backbone, y reutilizarlo como segmentador listo para usar sobre escenas de 1024 px. El numero de parametros reportado en safetensors (159.894) corresponde al tamano del repositorio de pesos liberado, no al del backbone subyacente, que se carga por separado desde el modelo base.

La relevancia actual radica en dos factores: por un lado, CanViT propone un paradigma de vision activa con atencion selectiva que podria reducir el coste computacional frente a los transformers de vision densos; por otro, este probe demuestra que tales representaciones son linealmente separables para tareas densas de segmentacion, un indicador clasico de calidad de features en vision por computador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer con canvas de vision activa (CanViT) + sonda lineal de segmentacion (LayerNorm, dropout, BatchNorm, conv 1 x 1) |
| Parametros totales | 159.894 (pesos del probe liberado; el backbone se carga desde el modelo base) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (canvas de 64 x 64 posiciones; escenas de entrada de 1024 px y glimps de 128 px) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, entrenamiento en bfloat16) |
| Idiomas soportados | no disponible (modelo de vision, sin capacidades linguisticas) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El backbone es un Vision Transformer de vision activa: procesa una secuencia de vistazos de 128 px muestreados en viewpoints R-IID sobre escenas de 1024 px y actualiza un estado persistente (canvas) de 64 x 64 posiciones. La sonda anadida es deliberadamente simple: LayerNorm, dropout (0,1), BatchNorm y una convolucion 1 x 1 que produce logits de 150 clases sobre la rejilla 64 x 64. El backbone permanece congelado durante el entrenamiento del probe, siguiendo el protocolo de probing del paper.

El entrenamiento del probe se realizo durante 40.000 pasos con batch size 16 y rollouts de 10 glimps por muestra. Se uso AdamW con learning rate pico de 0,0003 y weight decay de 0,001, con warmup lineal de 1.500 pasos seguido de decaimiento coseno. La augmentacion replica las transformaciones de segmentacion de DINOv3: scale jitter de factor 0,5 a 2, recortes aleatorios de 1024 px con rechazo por proporcion de clases, volteos horizontales con probabilidad 0,5 y distorsion fotometrica. Se empleo autocast en bfloat16. Los pesos liberados corresponden al paso 35.500, seleccionado por mIoU en el split de validacion de ADE20K. El backbone CanViT se preentreno por destilacion desde DINOv3, lo que explica la eleccion de las transformaciones de augmentacion.

## Capacidades

- Segmentacion semantica densa de escenas sobre 150 clases de ADE20K, con salida de logits en rejilla de 64 x 64.
- Extraccion de caracteristicas de vision activa mediante un canvas persistente que se actualiza con cada glimps.
- Procesamiento de escenas de alta resolucion (1024 px) mediante vistazos parciales de 128 px, lo que permite controlar el coste por muestra ajustando el numero de glimps.
- Evaluacion lineal de la calidad de representaciones (linear probing) sobre features congeladas.
- No soporta generacion de texto, tool calling, agentes, razonamiento simbolico ni capacidades multilingues: es exclusivamente un modelo de vision.
- No dispone de modo thinking, vision generativa ni procesamiento de audio.

## Casos de uso

- Evaluacion de representaciones en investigacion: el probe sirve como referencia para medir si variantes del backbone CanViT mejoran la separabilidad lineal de features en segmentacion densa, sin coste de reentrenamiento.
- Segmentacion de escenas en entornos simulados: con escenas de 1024 px y un canvas de 64 x 64, puede etiquetar regiones de imagenes sinteticas de interior o exterior para pipelines de percepcion en robotica o agentes embodied.
- Preetiquetado de datasets de segmentacion: generar mascaras preliminares sobre ADE20K u otros datasets de escenas para acelerar el etiquetado humano, dado que el probe se entreno con el protocolo oficial sobre este dominio.
- Baselines de comparacion en papers: al estar liberado con licencia MIT y pesos safetensors, se puede citar como baseline reproducible de probing lineal en ADE20K frente a otros backbones.
- Analisis de eficiencia de vision activa: permite estudiar como varia la calidad de segmentacion segun el numero de glimps y el viewpoint, ya que el estado del canvas se actualiza incrementalmente.
- Prototipado de segmentacion de bajo coste: al combinar un backbone congelado y un cabezal de ~160.000 parametros, la inferencia del probe es muy ligera frente a segmentadores densos completos, util para pruebas rapidas en CPU o GPUs modestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica unicamente que el checkpoint liberado (paso 35.500) fue seleccionado por mIoU en el split de validacion de ADE20K, pero no proporciona el valor numerico de dicha metrica ni comparaciones con otros metodos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta; el probe en si es minimo (159.894 parametros en safetensors), pero requiere cargar el backbone `canvitb16-abl-no-vpe-2026-03-03` desde el modelo base, cuyo tamano no se detalla en la informacion proporcionada.
- GPU recomendadas: no disponible. Por el prefijo "b16" del modelo base se infiere un backbone tipo ViT-B, pero no se confirma el numero de parametros ni los requisitos de memoria.
- Cabe en GPU consumer: probablemente si para el backbone tipo ViT-B en precision bfloat16 o fp16, aunque no hay datos confirmados en la informacion disponible.
- Opciones de despliegue: la libreria oficial es `canvit-pytorch>=0.2`, con carga mediante `CanViTForSemanticSegmentation.from_pretrained_with_probe`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo de vision de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados numericos ni descripciones de modelos comparables de vision activa o probes de segmentacion sobre ADE20K.

## Limitaciones y advertencias

- El repositorio contiene solo la sonda de segmentacion; sin el backbone `canvit/canvitb16-abl-no-vpe-2026-03-03` el modelo no es utilizable.
- El probe esta entrenado exclusivamente sobre ADE20K (150 clases de escenas); su rendimiento fuera de ese dominio o con vocabularios distintos no esta caracterizado.
- No se han publicado cifras de mIoU ni de otros benchmarks en la informacion disponible, por lo que no es posible validar cuantitativamente su calidad sin ejecutar la evaluacion.
- El backbone se preentreno por destilacion desde DINOv3, cuyo uso esta sujeto a la DINOv3 License; aunque los pesos de este probe se liberan bajo MIT, conviene revisar las condiciones del modelo base antes de un uso comercial.
- Riesgo de sesgos heredados de los datos de preentrenamiento de DINOv3 y de ADE20K (predominio de escenas y categorias de ciertas culturas y entornos), no documentado en la model card.
- Modelo puramente de vision: no procesa texto ni instrucciones, por lo que no puede usarse como asistente conversacional ni como agente.
- La resolucion de salida esta limitada a la rejilla de 64 x 64 del canvas, lo que puede ser insuficiente para tareas que requieran mascaras de alta resolucion sin postprocesado.
- No hay informacion sobre cuantizaciones soportadas ni sobre latencia en produccion, lo que dificulta planificar despliegues con requisitos estrictos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/canvit/probe-ade20k-40k-s1024-c64-abl-no-vpe
- Modelo base: https://huggingface.co/canvit/canvitb16-abl-no-vpe-2026-03-03
- Paper (NeurIPS 2026): https://arxiv.org/abs/2603.22570
- Codigo: https://github.com/m2b3/CanViT
- Pagina del proyecto: https://m2b3.github.io/CanViT/
- Checkpoints de CanViT: https://huggingface.co/canvit
- DINOv3 (modelo de destilacion): https://github.com/facebookresearch/dinov3
- Licencia DINOv3: https://github.com/facebookresearch/dinov3/blob/main/LICENSE.md
- Dataset ADE20K (scene_parse_150): https://huggingface.co/datasets/zhoubolei/scene_parse_150

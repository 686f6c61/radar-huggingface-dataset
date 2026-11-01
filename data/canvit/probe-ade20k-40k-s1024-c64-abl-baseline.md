# canvit/probe-ade20k-40k-s1024-c64-abl-baseline

## Resumen

`canvit/probe-ade20k-40k-s1024-c64-abl-baseline` es una sonda (probe) de segmentacion semantica lineal sobre las caracteristicas congeladas del modelo fundacional de vision activa CanViT (Canvas Vision Transformer), desarrollado por el grupo de investigacion CanViT y presentado en NeurIPS 2026. No es un modelo generativo ni un LLM: es un cabezal de segmentacion entrenado sobre un backbone congelado para evaluar la calidad de las representaciones aprendidas por CanViT en ADE20K.

El modelo base es `canvit/canvitb16-abl-baseline-2026-03-02`, un ViT de tipo B/16 que opera mediante un mecanismo de vision activa: observa la escena a traves de una secuencia de "glimpses" (parciales de imagen) y acumula la informacion en un lienzo (canvas) de 64 × 64. La sonda anade un cabezal ligero (LayerNorm, dropout, BatchNorm y convolucion 1 × 1) que proyecta ese canvas a 150 clases de ADE20K.

Su relevancia es metodologica: sirve como referencia reproducible del protocolo de evaluacion del paper (linear probing sobre caracteristicas congeladas) y permite a investigadores medir la calidad de las representaciones de CanViT sin reentrenar el backbone. El repositorio es muy pequeno (0,0 GB) y el recuento de parametros reportado en safetensors (159.894) corresponde al cabezal de la sonda, no al backbone completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer B/16 con vision activa (glimpses + canvas) y sonda lineal de segmentacion (LayerNorm, dropout, BatchNorm, conv 1 × 1) |
| Parametros totales | 159.894 (solo la sonda; el backbone no esta incluido en el repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (canvas de 64 × 64; 10 glimpses de 128 px sobre escenas de 1024 px) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, sin capacidades linguisticas) |
| Licencia | MIT (el backbone se destila de DINOv3, sujeto a la DINOv3 License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El backbone CanViT es un Vision Transformer que implementa un paradigma de vision activa: en lugar de procesar la imagen completa de una vez, recibe una secuencia de parciales (glimpses) de 128 px muestreados en viewpoints concretos y mantiene un estado interno sobre un canvas de 64 × 64 que integra la informacion a lo largo de la secuencia. En esta sonda concreta, el backbone permanece congelado y solo se entrena el cabezal de segmentacion.

El entrenamiento de la sonda se realizo durante 40.000 pasos con batch size 16, usando rollouts de 10 glimpses de 128 px con viewpoints R-IID sobre escenas de 1024 px. Se empleo AdamW con learning rate pico de 0,0003 y weight decay de 0,001, con warmup lineal de 1.500 pasos seguido de decaimiento coseno. Las aumentaciones siguen las transformaciones de segmentacion de DINOv3: scale jitter de factor 0,5 a 2, recortes aleatorios de 1024 px con rechazo por ratio de clases, volteos horizontales con probabilidad 0,5 y distorsion fotometrica. Se aplico dropout de 0,1 y autocast en bfloat16. Los pesos liberados corresponden al paso 39.000, seleccionado por mIoU en validacion de ADE20K.

## Capacidades

- Segmentacion semantica de 150 clases de ADE20K sobre el canvas de 64 × 64 del backbone CanViT.
- Evaluacion de representaciones: mide la calidad de las caracteristicas congeladas del backbone mediante linear probing.
- Procesamiento de escenas de 1024 px mediante muestreo de glimpses de 128 px en viewpoints arbitrarios.
- Integracion de informacion multi-glimpse en un estado persistente (canvas), lo que permite vision activa secuencial.
- No soporta generacion de texto, tool calling, agentes, razonamiento simbolico ni capacidades multilingues.
- No dispone de modo thinking, vision generativa, audio ni funciones multimodales mas alla de la segmentacion.

## Casos de uso

- Evaluacion de checkpoints de CanViT: la sonda proporciona una metrica estandar (mIoU en ADE20K) para comparar variantes del backbone sin reentrenar cabezales, util en ablaciones del paper.
- Reproduccion de resultados academicos: permite replicar la tabla de linear probing de ADE20K del paper de CanViT con los mismos hiperparametros y protocolo de aumentaciones.
- Segmentacion de escenas interiores y exteriores: las 150 clases de ADE20K cubren categorias como paredes, suelos, muebles, vegetacion y vehiculos, adecuadas para analisis de escenas cotidianas.
- Prototipado de pipelines de vision activa: sirve para validar la interfaz `CanViTForSemanticSegmentation` y el flujo de estados (`init_state`, `Viewpoint.full_scene`, `sample_at_viewpoint`) antes de escalar a otros datasets.
- Investigacion en representaciones autosupervisadas: al derivar de DINOv3 por destilacion, la sonda permite estudiar como se transfieren las caracteristicas de un modelo fundacional a tareas densas.
- Docencia y experimentacion con segmentacion: su licencia MIT y su tamano reducido facilitan su uso en entornos academicos para ilustrar linear probing sobre backbones congelados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los pesos se seleccionaron por mIoU en validacion de ADE20K, pero no se proporciona el valor numerico alcanzado ni comparaciones con otras sondas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La sonda en si es minuscula (159.894 parametros), pero requiere cargar el backbone CanViT B/16, cuyo tamano no se especifica en la informacion disponible.
- GPU recomendadas: no disponible. Al ser un ViT B/16 con escenas de 1024 px y rollouts de 10 glimpses, se espera que quepa en GPUs consumer modernas, pero no hay datos confirmados.
- Compatibilidad con GPU consumer: probable pero no confirmada; no se dispone de mediciones.
- Opciones de despliegue: la libreria oficial es `canvit-pytorch>=0.2` (instalable con `uv add`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| canvit/probe-ade20k-40k-s1024-c64-abl-baseline | 159.894 (sonda) | Canvas 64 × 64, escenas 1024 px | Segmentacion semantica ADE20K (150 clases) | MIT | HuggingFace |
| canvit/canvitb16-abl-baseline-2026-03-02 | no disponible | Canvas 64 × 64 | Backbone de vision activa (base de esta sonda) | no disponible | HuggingFace |
| Sondas lineales sobre DINOv3 | no disponible | Depende del backbone | Segmentacion semantica | DINOv3 License | GitHub / HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- La sonda esta entrenada exclusivamente en ADE20K (150 clases); no generaliza a otros vocabularios de segmentacion sin reentrenamiento.
- El backbone esta congelado: la sonda no mejora las representaciones subyacentes, solo las proyecta.
- El canvas de 64 × 64 limita la resolucion espacial de la salida de segmentacion, lo que puede penalizar objetos pequenos.
- No es un modelo de lenguaje: no procesa texto, no responde a prompts y no soporta tool calling ni agentes.
- Riesgo de sesgos heredados de DINOv3 y de ADE20K: la distribucion de escenas del dataset condiciona el comportamiento en dominios no representados.
- Aunque la licencia del repositorio es MIT, el backbone se destila de DINOv3, liberado bajo la DINOv3 License; conviene revisar esa licencia para uso comercial del backbone subyacente.
- El recuento de parametros de safetensors (159.894) no refleja el coste real de inferencia, que depende del backbone no incluido en el repo.
- No se han publicado metricas numericas de mIoU en la informacion disponible, por lo que no es posible verificar el rendimiento absoluto.

## Enlaces

- HuggingFace: https://huggingface.co/canvit/probe-ade20k-40k-s1024-c64-abl-baseline
- Modelo base: https://huggingface.co/canvit/canvitb16-abl-baseline-2026-03-02
- Paper (NeurIPS 2026): https://arxiv.org/abs/2603.22570
- Codigo: https://github.com/m2b3/CanViT
- Pagina del proyecto: https://m2b3.github.io/CanViT/
- Checkpoints de CanViT: https://huggingface.co/canvit
- DINOv3 (codigo): https://github.com/facebookresearch/dinov3
- Licencia DINOv3: https://github.com/facebookresearch/dinov3/blob/main/LICENSE.md
- Dataset ADE20K (scene_parse_150): https://huggingface.co/datasets/zhoubolei/scene_parse_150

# canvit/pgpolicy-ade20k-c64-t5-floorband-2026-07-07-s2

## Resumen

`canvit/pgpolicy-ade20k-c64-t5-floorband-2026-07-07-s2` es una politica de vision aprendida (learned viewing policy) para el modelo de vision activa CanViT-B, desarrollada por el autor `canvit` y presentada junto al articulo CanViT en NeurIPS 2026. No es un modelo de lenguaje: es un modulo de reinforcement learning que decide, dado el estado de un canvas de escena, que siguiente region (glimpse) debe observar el backbone CanViT-B para maximizar la reduccion de entropia cruzada de una sonda de segmentacion ADE20K. El checkpoint aqui publicado corresponde al entrenamiento con REINFORCE, semilla 2, sobre escenas de entrenamiento de ADE20K.

El modelo resuelve un problema concreto de vision activa: en lugar de procesar la imagen completa a resolucion plena, CanViT observa la escena mediante una secuencia de vistazos de 128 px que se integran en un canvas de 64 x 64. La politica aprende que vistazos elegir (centro y escala entre las candidatas predefinidas) para que la sonda de segmentacion lea el canvas con la menor entropia cruzada posible.

Es relevante ahora porque forma parte de la primera familia de modelos fundacionales de vision activa publicada con pesos abiertos, codigo y checkpoints, y porque permite evaluar de forma reproducible politicas de seleccion de vistazos para segmentacion semantica con presupuesto limitado de observaciones. El checkpoint seleccionado es el paso 8.000, escogido por menor entropia cruzada media de validacion tras los vistazos elegidos por la politica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de seleccion de vistazos (REINFORCE) sobre backbone Vision Transformer CanViT-B con canvas; observer congelado |
| Parametros totales | 5.543.447 (segun safetensors del checkpoint) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es modelo de lenguaje); escenas de 512 px, vistazos de 128 px, canvas de 64 x 64 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, sin capacidades linguisticas) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Libreria | canvit-pytorch (>= 0.3) |
| Pipeline | reinforcement-learning |
| Dataset de entrenamiento | zhoubolei/scene_parse_150 (ADE20K) |
| Modelo base | canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02 |
| Sonda asociada | canvit/probe-ade20k-40k-s512-c64-in21k (congelada) |
| Candidatas de vistazo | 16 x 16 centros en escalas 0.5 y 0.25 |
| Objetivo de entrenamiento | REINFORCE, episodios de 5 vistazos, semilla 2 |
| Paso seleccionado | 8.000 (menor entropia cruzada media de validacion) |

## Arquitectura y entrenamiento

CanViT (Canvas Vision Transformer) es un modelo fundacional de vision activa: percibe una escena mediante una secuencia de vistazos y la memoriza en un canvas de alcance global. El backbone CanViT-B se inicializa por destilacion desde DINOv3 y se mantiene congelado durante el entrenamiento de esta politica, igual que la sonda de segmentacion ADE20K. La politica puntua candidatas de vistazo a partir del canvas actual y de la salida de segmentacion que la sonda lee del canvas, y el observer mira a continuacion la candidata de mayor puntuacion. Las candidatas son 16 x 16 centros en cada una de las escalas 0,5 y 0,25, sobre escenas de 512 px con vistazos de 128 px y canvas de 64 x 64.

El entrenamiento usa REINFORCE sobre episodios de 5 vistazos con escenas de entrenamiento de ADE20K y semilla 2, optimizando que los vistazos elegidos reduzcan la entropia cruzada de la sonda. El registro completo del entrenamiento se conserva en `training_run/` tal como lo escribio el codigo original. El paso publicado (8.000) es el de menor entropia cruzada media de validacion tras los vistazos seleccionados por la politica; los valores registrados por vistazo son 0,7649, 0,7149, 0,6870, 0,6740 y 0,6651. Los ficheros en el formato original del codigo de entrenamiento permanecen en la revision `original-format`, mientras que `main` es legible por canvit-pytorch.

## Capacidades

- Seleccion aprendida de vistazos: puntua candidatas (centro y escala) y elige la siguiente observacion para el backbone CanViT-B.
- Rollout completo de inferencia: `policy.rollout(scene, num_glimpses=5)` devuelve la escena completa y los vistazos elegidos por la politica, con centro (fila, columna) y escala en cada paso.
- Integracion con sonda de segmentacion: la salida final permite obtener etiquetas ADE20K de 64 x 64 mediante `policy.model.logits(...).argmax(dim=1)`.
- Optimizacion de presupuesto de observacion: minimiza la entropia cruzada de la sonda con un numero fijo de vistazos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso textual, ni capacidades multilingues, de audio o de lenguaje; es exclusivamente un modulo de vision activa.
- No dispone de modo thinking ni de generacion de texto.

## Casos de uso

- Segmentacion semantica con presupuesto limitado de observaciones: usar la politica para decidir 5 vistazos de 128 px sobre escenas de 512 px y leer las etiquetas ADE20K del canvas de 64 x 64, reduciendo el coste frente a procesar la imagen completa a resolucion plena.
- Investigacion en vision activa: reproducir el experimento de REINFORCE con semilla 2 y comparar la curva de entropia cruzada por vistazo (0,7649 a 0,6651) con otras politicas o heuristicas.
- Evaluacion de estrategias de seleccion de region: comparar la politica aprendida con basculas como barrido uniforme o seleccion por incertidumbre, usando el mismo observer y sonda congelados.
- Sistemas de percepcion con ancho de banda restringido: en drones, robots o camaras con captura por regiones, la politica indica que regiones capturar para mantener calidad de segmentacion.
- Prototipado de pipelines de vision activa: integrar `canvit-pytorch>=0.3` en un notebook o servicio para validar el flujo `preprocess(512)` -> `rollout` -> `logits` antes de escalar a otras tareas.
- Docencia y divulgacion: demostrar de forma tangible como una politica de RL modifica el comportamiento de un backbone visual congelado y como se mide su efecto con una metrica de segmentacion.
- Analisis de robustez de politicas: estudiar como la politica se comporta en escenas fuera de la distribucion de ADE20K y que vistazos elige cuando la sonda tiene alta incertidumbre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la entropia cruzada media de validacion de ADE20K tras cada vistazo elegido por la politica:

| Vistazo | Entropia cruzada media de validacion |
|---|---|
| 1 | 0,7649 |
| 2 | 0,7149 |
| 3 | 0,6870 |
| 4 | 0,6740 |
| 5 | 0,6651 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el checkpoint pesa aproximadamente 0,1 GB y tiene 5.543.447 parametros, por lo que cabe con holgura en cualquier GPU consumer moderna, pero el consumo real depende tambien del backbone CanViT-B y de la sonda congelados que se cargan junto a la politica.
- GPU recomendadas: no disponible; por tamano del checkpoint, una RTX 4090 o incluso GPUs de gama media son suficientes para la politica, mientras que el backbone y la sonda determinan el coste dominante.
- Compatibilidad con GPU consumer: si, segun el tamano del checkpoint; el ejemplo de la model card usa CPU (`torch.device("cpu")`).
- Opciones de despliegue: libreria `canvit-pytorch>=0.3`, instalacion con `uv add "canvit-pytorch>=0.3"`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros checkpoints de politica de vision activa comparables, ni resultados de benchmarks frente a alternativas.

## Limitaciones y advertencias

- Ambito restringido: la politica esta entrenada exclusivamente para escenas de 512 px, vistazos de 128 px, canvas de 64 x 64 y segmentacion ADE20K con la sonda concreta `canvit/probe-ade20k-40k-s512-c64-in21k`; no se garantiza su comportamiento con otras resoluciones, tareas o sondas.
- Dependencia de componentes congelados: el observer CanViT-B y la sonda deben ser los usados en el entrenamiento; sustituirlos invalida la politica.
- Sesgos: no se documentan sesgos especificos, pero al entrenar sobre ADE20K hereda la distribucion y los desequilibrios de clases de ese dataset.
- Riesgo de alucinacion: no aplica en el sentido linguistico; en su lugar existe riesgo de seleccionar vistazos suboptimos en escenas fuera de distribucion, con peor entropia cruzada de segmentacion.
- Idioma: no disponible; el modelo no procesa texto.
- Licencia: MIT para este checkpoint, pero CanViT se preentrena por destilacion desde DINOv3, released bajo la DINOv3 License; conviene revisar esa licencia para usos derivados del backbone.
- Reproducibilidad: la semilla 2 y el paso 8.000 estan fijados; otros pasos o semillas pueden dar curvas distintas.
- Formato: los ficheros de `main` son legibles por canvit-pytorch; el formato original del codigo de entrenamiento queda en la revision `original-format`.

## Enlaces

- Hugging Face: https://huggingface.co/canvit/pgpolicy-ade20k-c64-t5-floorband-2026-07-07-s2
- Modelo base: https://huggingface.co/canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02
- Sonda ADE20K: https://huggingface.co/canvit/probe-ade20k-40k-s512-c64-in21k
- Coleccion de checkpoints: https://huggingface.co/canvit
- Paper (NeurIPS 2026): https://arxiv.org/abs/2603.22570
- OpenReview: https://openreview.net/forum?id=cnV9GA4pKU
- Codigo: https://github.com/m2b3/CanViT
- Pagina del proyecto: https://m2b3.github.io/CanViT/
- DINOv3: https://github.com/facebookresearch/dinov3
- Licencia DINOv3: https://github.com/facebookresearch/dinov3/blob/main/LICENSE.md
- Dataset ADE20K: https://huggingface.co/datasets/zhoubolei/scene_parse_150

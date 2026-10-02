# canvit/probe-ade20k-40k-s512-c64-in21k-mlx

## Resumen

canvit/probe-ade20k-40k-s512-c64-in21k-mlx es un checkpoint de tipo linear probe para segmentacion semantica, publicado por el equipo de CanViT y distribuido en formato MLX. No es un modelo autonomo: se trata de una cabeza de segmentacion (`SegmentationProbe`) de 159.894 parametros que se aplica sobre las caracteristicas del canvas de un backbone CanViT (Canvas Vision Transformer), distribuido por separado en otro repositorio.

CanViT es un modelo fundacional de vision activa: en lugar de procesar la imagen completa de una sola vez, observa la escena mediante una secuencia de "glimpses" (recortes) y acumula la informacion en un canvas de alcance global. Esta probe concreta proyecta el canvas resultante a las 150 clases semanticas de ADE20K, lo que permite tanto evaluar la calidad de las representaciones aprendidas por el backbone como disponer de una cabecera de segmentacion lista para usar.

Su relevancia es doble. Por un lado, ejemplifica el flujo de trabajo de vision activa sobre MLX, el framework de Apple para Apple Silicon, lo que facilita la experimentacion local en un Mac sin GPU dedicada. Por otro, al ser una probe lineal de coste minimo (menos de 160 K parametros), constituye un instrumento de diagnostico barato para comparar distintos checkpoints de CanViT entre si.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Probe lineal (LayerNorm + dropout + capa lineal) sobre caracteristicas de canvas de CanViT-B/16, un transformer de vision activa |
| Parametros totales | 159.894 (~160 K) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica en el sentido de un LLM; opera sobre un canvas de 64 x 64 tokens y escenas de 512 px con glimpses de 128 px |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de vision; no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors (formato nativo de MLX) |
| Clases de salida | 150 (etiquetas semanticas de ADE20K) |
| Dimension de embedding | 1024 |
| Backend | MLX |
| Clase de modelo | SegmentationProbe |
| Dropout de la probe | 0,1 |
| Normalizacion | LayerNorm (use_ln: true) |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La pieza distribuida en este repositorio es unicamente la cabeza de segmentacion, no el backbone. `SegmentationProbe` toma la rejilla de parches del canvas (64 x 64 tokens con embedding de 1024 dimensiones) y la proyecta a 150 clases por posicion, aplicando LayerNorm, un dropout de 0,1 y una capa lineal. La salida son logits con forma `[1, 64, 64, 150]`. El backbone asociado es `canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02-mlx`, un transformer de vision con parches de 16 px y posicional encoding aditivo sobre viewpoint (vpe), preentrenado sobre ImageNet-21k y configurado para escenas de 512 px con glimpses de 128 px.

CanViT, el Canvas Vision Transformer, se presenta en el articulo como un modelo fundacional de vision activa: selecciona viewpoints, muestrea glimpses y mantiene un canvas de escena que se actualiza con cada observacion. Los pesos de este checkpoint son la conversion a MLX de la probe original en PyTorch `canvit/probe-ade20k-40k-s512-c64-in21k` (commit `b28ba9b866d3763cbea60035ef8b7b02eba5b01d`). Los detalles exactos del entrenamiento de la probe (numero de muestras, regimen de congelacion del backbone, hiperparametros de optimizacion) no se detallan en la model card: el identificador `ade20k-40k` sugiere un ajuste sobre ADE20K con 40.000 iteraciones o muestras, pero este dato no esta confirmado en la informacion disponible.

## Capacidades

- Segmentacion semantica densa sobre las 150 clases de ADE20K, con una prediccion por token del canvas.
- Prediccion a nivel de canvas completo: la probe consume la rejilla de 64 x 64 parches y devuelve logits por posicion, lo que permite reconstruir un mapa semantico de la escena observada.
- Integracion con el paradigma de vision activa del backbone: la probe no decide los viewpoints, solo interpreta el estado del canvas tras una o varias observaciones.
- Uso como sonda de evaluacion de representaciones (linear probing) para comparar checkpoints de CanViT sin reentrenar el backbone.
- Integracion en la version PyTorch como `CanViTForSemanticSegmentation`, que empaqueta backbone y probe en un unico modelo.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No tiene capacidades multilingues ni procesamiento de texto.
- No dispone de modo de pensamiento (thinking mode) ni de entradas de audio.

## Casos de uso

- Segmentacion semantica de escenas interiores y exteriores: la probe cubre las 150 categorias de ADE20K (mobiliario, superficies, vegetacion, elementos estructurales), lo que permite generar mapas semanticos completos de imagenes de 512 px sin entrenamiento adicional.
- Evaluacion comparativa de checkpoints de CanViT: al ser una probe lineal congelada, permite medir de forma barata y reproducible la calidad de distintas representaciones del backbone sobre el mismo conjunto de validacion.
- Robotica y navegacion asistida por vision activa: el backbone selecciona glimpses de 128 px y acumula informacion en el canvas; la probe convierte ese estado en un mapa semantico utilizable para planificacion o evitacion de obstaculos.
- Pre-anotacion de datasets de segmentacion: los logits por pixel pueden usarse como propuesta inicial que un anotador humano revisa, reduciendo el coste de construir corpus etiquetados en dominios cercanos a ADE20K.
- Prototipado local en Apple Silicon: el formato MLX y el tamano reducido del checkpoint permiten experimentar en un Mac con chip M-series sin depender de GPU CUDA ni de servicios en la nube.
- Investigacion en vision activa y eficiencia computacional: el par backbone + probe sirve para estudiar como varia la calidad de segmentacion segun el numero y la posicion de los glimpses muestreados.
- Analisis de escenas para realidad aumentada o conduccion: el mapa semantico denso aporta contexto de escena que puede alimentar modulos posteriores de decision o renderizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- La probe en si ocupa aproximadamente 0,6 MB en fp32 y 0,3 MB en fp16; cabe en cualquier dispositivo, incluidos telefonos y equipos embebidos.
- El coste real de inferencia lo domina el backbone: el identificador `canvitb16` sugiere un Vision Transformer de tamano B con parches de 16 px, del orden de 86 M de parametros. Esta cifra es una estimacion a partir del nombre del checkpoint y no esta confirmada en la informacion disponible.
- VRAM estimada para el conjunto backbone mas probe: no disponible como dato publicado. Para escenas de 512 px con canvas de 64 x 64, una estimacion conservadora se situa por debajo de 2 GB en fp16.
- GPU recomendadas: no disponible. El checkpoint esta en formato MLX, por lo que su destino natural son los chips Apple Silicon (familias M1, M2, M3 y M4). La version PyTorch equivalente puede ejecutarse en GPUs NVIDIA (RTX 3090, RTX 4090, A100, H100) sin requerimientos elevados.
- Compatibilidad con GPU de consumo: si. Dado el tamano del backbone y la resolucion de trabajo, cualquier GPU con mas de 4 GB de memoria deberia ser suficiente, aunque no se dispone de mediciones publicadas.
- Opciones de despliegue: paquete `canvit-mlx` desde el repositorio fuente (instalacion con `uv sync --project canvit-mlx`) para el checkpoint MLX; `CanViT-PyTorch` para la ruta PyTorch. vLLM, llama.cpp, Ollama y TGI no son aplicables porque no se trata de un modelo de lenguaje.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Backend | Parametros | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| probe-ade20k-40k-s512-c64-in21k-mlx (este modelo) | MLX | 159.894 | 150 clases ADE20K | MIT | Disponible |
| canvit/probe-ade20k-40k-s512-c64-in21k | PyTorch | Mismos pesos (origen de la conversion) | 150 clases ADE20K | MIT | Disponible |
| CanViTForSemanticSegmentation (CanViT-PyTorch) | PyTorch | Backbone mas probe (no disponible) | 150 clases ADE20K | No disponible | Disponible en el repositorio |
| Alternativas de segmentacion de terceros (SegFormer, Mask2Former y similares) | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con otras cabeceras de segmentacion.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el backbone CanViT asociado, el checkpoint no produce ninguna prediccion util. Hay que descargar y cargar ambos.
- Ausencia total de benchmarks publicados en la informacion disponible, por lo que no puede afirmarse su calidad relativa frente a otras cabeceras de segmentacion.
- El dominio queda restringido a las 150 clases de ADE20K; cualquier categoria fuera de ese vocabulario se asignara a la clase mas parecida, con el consiguiente error.
- Riesgo de errores de segmentacion en fronteras entre objetos, clases raras o poco representadas, y escenas con oclusiones fuertes. Al no ser un modelo generativo de texto, no existe alucinacion en sentido estricto, pero si falsos positivos y confusiones entre categorias.
- Sesgos heredados de ADE20K: sobrerrepresentacion de escenas interiores y exteriores de determinadas zonas geograficas, y sesgo de anotacion propio del corpus original.
- La calidad depende del regimen de muestreo de glimpses y de la posicion de los viewpoints, que gestiona el backbone, no la probe.
- El formato MLX exige conversion para ejecutarse en otros runtimes distintos de Apple Silicon.
- La licencia MIT de esta probe no cubre necesariamente el backbone ni los pesos preentrenados asociados; la licencia de `canvitb16-add-vpe-pretrain-...` no se especifica en la informacion proporcionada y conviene verificarla antes de un uso comercial.
- No apto para tareas de lenguaje, dialogo, tool calling ni agentes.
- El historial del repositorio es minimo (0,0 GB, 0 descargas, 0 likes) y fue actualizado el mismo dia de su creacion, por lo que no existe aun validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/canvit/probe-ade20k-40k-s512-c64-in21k-mlx
- Probe de origen en PyTorch: https://huggingface.co/canvit/probe-ade20k-40k-s512-c64-in21k/tree/b28ba9b866d3763cbea60035ef8b7b02eba5b01d
- Checkpoint del backbone: https://huggingface.co/canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02-mlx
- Repositorio de checkpoints del proyecto: https://huggingface.co/canvit
- Articulo (NeurIPS 2026): https://arxiv.org/abs/2603.22570
- Codigo fuente: https://github.com/m2b3/CanViT
- Version PyTorch: https://github.com/m2b3/CanViT-PyTorch
- Pagina del proyecto: https://m2b3.github.io/CanViT/

# canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02-c64-onnx-fp32

## Resumen

CanViT-B (Canvas Vision Transformer) es un modelo fundacional de vision activa: en lugar de procesar una imagen completa de una sola vez, percibe una escena mediante una secuencia de "vistazos" (glimpses) localizados y va acumulando la informacion en un lienzo (canvas) de memoria de alcance global. Lo desarrolla el grupo de investigacion de Yohai-Eliel Berreby, Sabrina Du, Audrey Durand y B. Suresh Krishna, y se presento en NeurIPS 2026 con el articulo "CanViT: Toward Active-Vision Foundation Models" (arXiv 2603.22570).

La ficha que nos ocupa no es el checkpoint de entrenamiento, sino una exportacion ONNX float32 de un unico paso de vistazo sobre un lienzo de 64 x 64, pensada para ejecutarse en el navegador con ONNX Runtime Web (WebGPU y, en su defecto, WebAssembly). Se publica junto al componente de lectura (probe) de ADE20K, que va en un repositorio aparte, y da soporte al elemento `<canvit-live>` de la demo en vivo del proyecto. El grafo `canvit_step.onnx` ocupa 390,89 MB, usa opset 18 y lleva los pesos embebidos.

La relevancia de esta publicacion es doble: por un lado, CanViT se presenta como el primer modelo fundacional de vision activa agnostico a tarea y a politica; por otro, esta exportacion demuestra que el modelo completo cabe y funciona en un navegador con paridad numerica casi exacta respecto a PyTorch (error L2 relativo maximo de 7,5e-05 en el canvas y 4,2e-05 en los logits sobre 29 vistazos). El checkpoint base esta preentrenado sobre ImageNet-21k con escenas de 512 px y vistazos de 128 px.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer con RoPE relativo a la escena (CanViT, Canvas Vision Transformer, active vision); backbone ViT-B/16 |
| Parametros totales | no disponible (el identificador indica backbone ViT-B/16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica en tokens; geometria de escena de 512 px, vistazos de 128 px y lienzo de 64 x 64 con seguimiento recurrente de estado (`recurrent_cls`) |
| Tipos de cuantizacion | float32 (esta exportacion). El tag del repositorio referencia el modelo base como `base_model:quantized`, pero no se detallan esquemas de cuantizacion adicionales |
| Idiomas soportados | no disponible (modelo de vision, sin capacidades de texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 18, float32, pesos embebidos en `canvit_step.onnx`, 390,89 MB) mas `initial_state.bin` en float32 y `manifest.json` |
| Pipeline | image-feature-extraction |
| Tamano del repositorio | 0,4 GB |
| Entradas del grafo | `scene`, `canvas`, `recurrent_cls`, `centers`, `scales` |
| Salidas del grafo | `next_canvas`, `next_recurrent_cls`, `glimpse` |

## Arquitectura y entrenamiento

CanViT es una arquitectura transformer de vision retinotopica: un ViT (en esta variante, B/16) procesa vistazos locales de 128 px extraidos de una escena de 512 px, y un mecanismo de RoPE relativo a la escena ata cada vistazo a su posicion dentro del lienzo global. El estado se mantiene de forma recurrente en un canvas de 64 x 64 (`recurrent_cls`, registros y parches de canvas), de modo que el modelo "recuerda" lo visto en vistazos previos sin necesidad de reprocesar la escena completa. La seleccion de los vistazos la decide una politica externa, ya que el modelo es explicitamente agnostico a politica.

El checkpoint base se preentreno sobre ImageNet-21k (`in21k`), con la configuracion `add-vpe` (embedding posicional visual aditivo) y el backbone `dv3b16`. No se detallan en la informacion proporcionada el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO (en un modelo de vision supervisado no serian de esperar). La innovacion tecnica destacable de esta publicacion es el propio paradigma de vision activa con canvas, junto con la exportacion ONNX autocontenida de un unico paso, que permite ejecutar el modelo en el navegador.

## Capacidades

- Extraccion de caracteristicas de imagen mediante percepcion secuencial de vistazos, con memoria de escena persistente en un canvas de 64 x 64.
- Ejecucion paso a paso en el navegador a traves de ONNX Runtime Web, con aceleracion WebGPU y respaldo WebAssembly.
- Mantenimiento de estado recurrente entre vistazos (`next_canvas`, `next_recurrent_cls`), lo que permite procesar escenas de forma incremental sin recargar el modelo.
- Segmentacion semantica indirecta: el grafo de CanViT se combina con el probe de ADE20K publicado aparte, que actua como cabeza de lectura sobre las caracteristicas del canvas.
- Reutilizacion como extractor de caracteristicas de imagen (pipeline `image-feature-extraction`) al estilo de otros ViT preentrenados.
- Preentrenamiento en ImageNet-21k, lo que le confiere representaciones transferibles a tareas de vision descendentes.
- No soporta tool calling, function calling, razonamiento multi-paso en lenguaje natural, generacion de texto ni capacidades multilingues: es un modelo puramente visual.
- No incorpora vision-language, audio ni modo "thinking".

## Casos de uso

- Demo interactiva de vision activa en el navegador: el modelo se integra en el elemento `<canvit-live>` para procesar una imagen (`scene.jpg`) vistazo a vistazo directamente en el cliente, sin backend, usando WebGPU cuando esta disponible y WebAssembly como alternativa.
- Segmentacion semantica ligera en el navegador: combinando el grafo de CanViT con el probe ADE20K, se pueden etiquetar clases de escena en aplicaciones web interactivas sin enviar imagenes a un servidor.
- Prototipado de politicas de muestreo de vistazos: al ser agnostico a politica, sirve como banco de pruebas para investigar estrategias de seleccion de regiones (foveacion) en investigacion de vision activa.
- Investigacion en eficiencia computacional: el modelo solo procesa 128 x 128 px por paso en lugar de la escena completa de 512 px, lo que reduce el coste por inferencia y lo hace adecuado para estudiar compromisos entre precision y numero de vistazos.
- Educacion y divulgacion: la exportacion autocontenida y el manifiesto (`manifest.json`) documentan formas, tamanos y nombres exactos, lo que facilita usarla en material docente sobre despliegue de transformers en el navegador.
- Extraccion de caracteristicas para clasificacion descendente: las representaciones del backbone preentrenado en ImageNet-21k pueden alimentar cabezas de clasificacion, tal como demuestra el pipeline `image-feature-extraction` y el API `CanViTForImageClassification` mencionado en el repositorio del proyecto.
- Verificacion de portabilidad de modelos: el repositorio incluye una comprobacion de paridad contra PyTorch (error L2 relativo maximo de 7,5e-05 en el canvas y 4,2e-05 en los logits sobre 29 vistazos), lo que lo convierte en un caso de referencia para validar exportaciones ONNX.

## Benchmarks y rendimiento

Los datos explicitos de rendimiento de esta exportacion son las metricas de paridad numerica frente a PyTorch:

| Medicion | Resultado |
|---|---|
| Paridad con PyTorch (canvas), error L2 relativo | maximo 7,5e-05 |
| Paridad con PyTorch (logits), error L2 relativo | maximo 4,2e-05 |
| Clases por celda tras la exportacion | identicas a PyTorch |
| Vistazos evaluados | 29 |
| Entorno de la comprobacion | onnxruntime CPU execution provider, float32 |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) para este repositorio, ya que no es un modelo de lenguaje. Como referencia externa del proyecto, el repositorio de GitHub indica que el primer checkpoint afinado en ImageNet-1k (`canvitb16-add-vpe-finetune-g128px-s512px-in1k-2026-04-06`, distinto del exportado aqui) alcanza un 84,5 % de top-1 en clasificacion de vision activa IN1k, frente al 82,2 % del mejor resultado previo de AdaptiveNN. Estos valores corresponden a otro checkpoint y no deben atribuirse a esta exportacion ONNX.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB en float32 (el grafo pesa 390,89 MB y los pesos van embebidos).
- Cabe en cualquier GPU de consumo y en practicamente cualquier equipo: la orientacion principal del repositorio es la ejecucion en el navegador, sin GPU dedicada.
- Aceleracion recomendada: WebGPU en el navegador; respaldo por WebAssembly en CPU cuando WebGPU no esta disponible.
- GPU de servidor (A100, H100, RTX 4090) no son necesarias; si se usan, solo aportarian latencia adicional marginal dado el reducido tamano del modelo.
- Opciones de despliegue verificadas: ONNX Runtime Web (WebGPU/WebAssembly) para el navegador, onnxruntime CPU execution provider para la comprobacion de paridad, y PyTorch como referencia via `canvit_pytorch.viz.live export` (torch 2.14.0, onnx 1.23.0, onnxruntime 1.30.0).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / geometria | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CanViT-B (esta exportacion ONNX) | no disponible (backbone ViT-B/16) | escena 512 px, vistazos 128 px, canvas 64 x 64 | paridad ONNX-PyTorch con error L2 relativo <= 7,5e-05 | MIT | HuggingFace, ONNX, ejecucion en navegador |
| CanViT-B finetune IN1k | no disponible | escena 512 px, vistazos 128 px | 84,5 % top-1 en vision activa IN1k | no disponible en la informacion proporcionada | HuggingFace (canvit) |
| AdaptiveNN (mejor resultado previo citado) | no disponible | vision activa | 82,2 % top-1 en IN1k | no disponible | no disponible |
| ViT-B/16 supervisado clasico | no disponible (backbone ViT-B/16) | imagen completa, sin vision activa | no disponible | no disponible | ampliamente disponible |

La comparacion cuantitativa con alternativas de la misma categoria (por ejemplo, DINOv2 ViT-B/14 u otros extractores de caracteristicas) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente visual: no genera texto, no razona en lenguaje natural, no soporta tool calling ni agentes.
- El pipeline declarado es `image-feature-extraction`; sin el probe externo no produce etiquetas semanticas por si solo.
- La exportacion corresponde a un unico paso de vistazo sobre un canvas de 64 x 64 y a una geometria fija (escenas de 512 px, vistazos de 128 px); no es un modelo de proposito general para cualquier resolucion.
- Requiere gestionar el estado recurrente entre llamadas (`canvas`, `recurrent_cls`); un uso incorrecto del estado degrada la calidad de la representacion acumulada.
- La politica de seleccion de vistazos es externa: el rendimiento final depende de la estrategia de foveacion que implemente la aplicacion.
- La paridad numerica verificada (7,5e-05 / 4,2e-05 de error L2 relativo) es una tolerancia excelente, pero no exacta; en pipelines sensibles podria requerir validacion adicional.
- Idiomas soportados: no aplica; no hay interfaz de texto.
- Sesgos conocidos y riesgo de alucinacion: no disponibles en la informacion proporcionada, aunque al ser un modelo visual los sesgos relevantes serian de representacion de escenas y no linguisticos.
- Licencia MIT, que permite uso comercial sin restricciones conocidas; conviene verificar igualmente los terminos de los checkpoints derivados del proyecto.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni de mantenimiento a largo plazo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02-c64-onnx-fp32
- Modelo base: https://huggingface.co/canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02
- Probe ADE20K: https://huggingface.co/canvit/probe-ade20k-40k-s512-c64-in21k-onnx-fp32
- Organizacion del proyecto en HuggingFace: https://huggingface.co/canvit
- Articulo (arXiv 2603.22570): https://arxiv.org/abs/2603.22570
- Repositorio principal: https://github.com/m2b3/CanViT
- Implementacion de referencia en PyTorch: https://github.com/m2b3/CanViT-PyTorch
- Pagina del proyecto: https://m2b3.github.io/CanViT/
- Demo en vivo: https://m2b3.github.io/CanViT/live.html
- Script de integracion web: https://m2b3.github.io/CanViT/js/canvit/index.js

# canvit/probe-ade20k-40k-s512-c64-in21k-onnx-fp32

## Resumen

`canvit/probe-ade20k-40k-s512-c64-in21k-onnx-fp32` es la exportación a ONNX en precisión FP32 de una sonda lineal (*linear probe*) de segmentación semántica entrenada sobre el canvas de 64 × 64 de CanViT-B, el backbone de visión activa del proyecto CanViT (Canvas Vision Transformer). Lo desarrolla el grupo `canvit`, autores del artículo "CanViT: Toward Active-Vision Foundation Models" presentado en NeurIPS 2026. El modelo no es un backbone completo: es la cabeza de decodificación que convierte el estado del canvas en logits por celda para 150 clases del dataset ADE20K (`scene_parse_150`), y se publica como grafo ONNX independiente para poder encadenarse tras el grafo de *glimpse* de CanViT-B.

El problema que resuelve es concreto: permitir que la demo web `<canvit-live>` ejecute segmentación semántica íntegramente en el navegador, sin backend ni GPU, encadenando dos grafos ONNX. El probe tiene un tamaño de fichero de 0,68 MB con los pesos embebidos, salida doble (logits y entropía) y una paridad verificada con PyTorch con error L2 relativo máximo de 7,5e-05 en el canvas y 4,2e-05 en los logits a lo largo de 29 *glimpses*.

Su relevancia es doble: por un lado ilustra el patrón de despliegue de modelos de visión activa como grafos ONNX desacoplados (backbone + sonda); por otro, la salida de entropía por celda lo convierte en una pieza útil para políticas de selección de siguiente vista y para estrategias de *active learning*. La licencia es MIT, lo que permite uso comercial sin restricciones declaradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sonda lineal sobre el canvas de 64 × 64 de CanViT-B (vision transformer de visión activa); grafo ONNX opset 18 |
| Parametros totales | No disponible en la model card; fichero `probe.onnx` de 0,68 MB con pesos embebidos en float32 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Canvas de 64 × 64 celdas (4096 posiciones); el número de *glimpses* encadenados no está acotado por el probe |
| Tipos de cuantizacion | Solo FP32 en esta variante ONNX; no disponible otras cuantizaciones |
| Idiomas soportados | No aplica (modelo de visión, sin entrada de texto) |
| Licencia | MIT |
| Formato de pesos | ONNX opset 18, float32, pesos embebidos; incluye `manifest.json` con esquema `canvit-live-probe-23117c20-1e8e-4edb-a56d-21018d157b8d` |
| Entradas / salidas | Entrada: canvas. Salidas: logits de clase y entropía |
| Clases | 150 clases de ADE20K |
| Dataset de entrenamiento | `scene_parse_150` (variante 40k) |
| Modelo base | `canvit/probe-ade20k-40k-s512-c64-in21k` (commit `b28ba9b`) |
| Backbone asociado | `canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02-c64-onnx-fp32` |

## Arquitectura y entrenamiento

CanViT (Canvas Vision Transformer) es un modelo fundacional de visión activa: percibe una escena mediante una secuencia de *glimpses* (recortes de 128 px en el backbone B/16) y va acumulando la información en un canvas de memoria de alcance global, en esta configuración de 64 × 64 celdas. La política de exploración asociada a este probe es EG-C2F, que en cada paso visita el tile cuya segmentación decodificada desde el canvas presenta mayor incertidumbre, cerrando así el bucle percepción-decisión.

Sobre ese canvas actúa una sonda lineal que produce 150 logits de clase por celda, junto con su entropía. El backbone fue preentrenado en ImageNet-21k con *glimpses* de 128 px y escenas de 512 px (`in21k` en el nombre del checkpoint); la sonda se entrena específicamente sobre ADE20K (40k). La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon fases de RLHF/DPO, por lo que esos datos deben considerarse no disponibles. La innovación técnica destacable de esta publicación no está en el probe en sí, sino en su empaquetado: exportación reproducible a ONNX (torch 2.14.0, onnx 1.23.0, verificada con onnxruntime 1.30.0) que mantiene la clase asignada en cada celda respecto a la referencia en PyTorch, lo que habilita inferencia íntegra en cliente vía `onnxruntime` con *execution provider* de CPU.

## Capacidades

- Segmentación semántica densa a resolución de canvas (64 × 64) con 150 clases del vocabulario ADE20K.
- Salida de incertidumbre: además de los logits, el grafo emite la entropía por celda, explotable para decidir dónde mirar a continuación.
- Integración en bucle de visión activa: consume el canvas actualizado tras cada *glimpse* del backbone CanViT-B y realimenta la política EG-C2F.
- Ejecución en navegador mediante el componente web `<canvit-live>`, cargando los pesos directamente desde HuggingFace.
- Inferencia en CPU con onnxruntime, sin dependencia de CUDA.
- No soporta *tool calling*, *function calling*, agentes de texto, ni razonamiento multi-paso en lenguaje natural: no es un modelo de lenguaje.
- No dispone de capacidades multilingües, de audio ni de generación de texto.

## Casos de uso

- Segmentación semántica interactiva en el navegador: la demo `<canvit-live>` carga el probe tras el grafo de *glimpse* y dibuja el mapa de clases sobre la escena sin enviar la imagen a ningún servidor, útil para aplicaciones donde la privacidad del dato visual es un requisito.
- Preetiquetado de datasets de escenas interiores y exteriores: al cubrir las 150 clases de ADE20K, el probe sirve como anotador automático de primer paso para lotes de imágenes, dejando la revisión humana para los píxeles de mayor entropía.
- *Active learning* guiado por incertidumbre: la salida de entropía por celda permite priorizar qué imágenes o qué regiones requieren anotación manual, reduciendo el coste de etiquetado en proyectos de segmentación.
- Investigación en visión activa: reproducción y comparación de políticas de selección de siguiente vista (EG-C2F frente a alternativas) usando el probe como cabezal de evaluación fijo y reproducible.
- Docencia y divulgación técnica: ejemplo autocontenido de cómo exportar un modelo de PyTorch a ONNX y ejecutarlo en el cliente con paridad numérica verificada, apto para materiales de curso sobre despliegue de modelos.
- Prototipado de robótica y agentes visuales: en escenarios con cómputo limitado, el bucle glimpse-canvas-probe puede ejecutarse en CPU sobre el *edge*, decidiendo regiones de interés antes de invocar modelos mayores.
- Validación de pipelines de exportación: al publicar métricas de paridad (error L2 relativo máximo de 7,5e-05 en canvas y 4,2e-05 en logits sobre 29 *glimpses*), sirve como caso de referencia para verificar que una exportación ONNX no degrada las predicciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas de paridad numerica entre la implementacion ONNX y la de referencia en PyTorch:

| Comprobacion | Resultado |
|---|---|
| Error L2 relativo del canvas (ONNX vs PyTorch CPU, fp32) | ≤ 7,5e-05 |
| Error L2 relativo de los logits (ONNX vs PyTorch CPU, fp32) | ≤ 4,2e-05 |
| Estabilidad de clase por celda | Todas las celdas conservan su clase |
| Condiciones de la prueba | onnxruntime CPU EP frente a PyTorch CPU, float32, mismos puntos de vista, 29 *glimpses* |

No se proporcionan valores de mIoU, accuracy por pixel ni comparaciones cuantitativas con otras sondas o segmentadores.

## Requisitos de hardware

- El probe en si ocupa 0,68 MB en FP32, por lo que cabe holgadamente en cualquier dispositivo, incluidos moviles, y se ejecuta satisfactoriamente con el *execution provider* de CPU de onnxruntime.
- El coste computacional dominante corresponde al grafo de *glimpse* de CanViT-B, cuyo tamano y requisitos de VRAM no se detallan en la informacion disponible.
- No se publican requisitos de VRAM, GPU recomendadas (A100, H100, RTX 4090, etc.) ni estimaciones de latencia o throughput.
- Opciones de despliegue documentadas: onnxruntime (CPU), y el componente web `<canvit-live>` que carga ambos grafos desde HuggingFace. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo de vision de este tipo.
- Entorno de exportacion y verificacion: torch 2.14.0, onnx 1.23.0, onnxruntime 1.30.0.

## Comparativa con modelos similares

| Modelo | Tipo | Clases | Canvas / resolucion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `probe-ade20k-40k-s512-c64-in21k-onnx-fp32` (este) | Sonda lineal ONNX sobre canvas CanViT-B | 150 | 64 × 64 | ONNX fp32, 0,68 MB | MIT | HuggingFace, commit publicado |
| `canvit/probe-ade20k-40k-s512-c64-in1k` | Sonda ADE20K sobre canvas 64 × 64, backbone preentrenado en ImageNet-1k | No disponible | 64 × 64 | No disponible | No disponible | HuggingFace |
| `canvit/probe-ade20k-40k-s512-c10-in21k` | Sonda ADE20K sobre canvas 10 × 10 | No disponible | 10 × 10 | No disponible | No disponible | HuggingFace |
| `canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02-c64-onnx-fp32` | Backbone de *glimpse* CanViT-B en ONNX | No aplica | *Glimpse* 128 px sobre escena 512 px | ONNX fp32 | No disponible | HuggingFace |

No se dispone de resultados de rendimiento (mIoU u otros) para ninguna de las variantes, por lo que la comparacion se limita a la configuracion arquitectonica y al formato de publicacion.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere obligatoriamente el grafo del backbone CanViT-B para producir un canvas sobre el que operar. Cargarlo de forma aislada no tiene sentido funcional.
- Resolucion de salida muy baja: la segmentacion se decodifica a resolucion de canvas (64 × 64), por lo que los contornos de objetos pequenos son necesariamente imprecisos; el repositorio `CanViT-PyTorch` menciona un metodo `predict` que anade un *upsampling* bilineal, pero eso no recupera detalle que nunca estuvo en el canvas.
- El vocabulario esta cerrado a las 150 clases de ADE20K; cualquier objeto fuera de ese conjunto se asignara a la clase mas parecida del vocabulario, con riesgo de etiquetado incorrecto.
- Riesgo de alucinacion de clase en regiones poco observadas: al tratarse de una sonda lineal sobre un estado de memoria, las zonas del canvas que no han sido visitadas por ningun *glimpse* pueden producir predicciones con entropia alta y poco fiables. Precisamente por eso el grafo emite la entropia, que conviene usar como filtro.
- La model card no documenta sesgos demograficos, geograficos ni de composicion del dataset de entrenamiento, ni los tokens exactos vistos durante el entrenamiento.
- No se detalla el numero de parametros del probe ni del backbone en la informacion disponible, lo que dificulta estimar costes de despliegue a partir de la ficha.
- Aunque la licencia MIT permite uso comercial sin restricciones declaradas, el uso del checkpoint base CanViT-B y del dataset `scene_parse_150` puede estar sujeto a sus propias condiciones, no verificadas aqui.
- El identificador arXiv indicado (`2603.22570`) y las fechas de publicacion (2026) no han podido contrastarse con fuentes independientes en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/canvit/probe-ade20k-40k-s512-c64-in21k-onnx-fp32
- Modelo base (sonda PyTorch): https://huggingface.co/canvit/probe-ade20k-40k-s512-c64-in21k
- Backbone de *glimpse* CanViT-B en ONNX: https://huggingface.co/canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02-c64-onnx-fp32
- Organizacion CanViT en HuggingFace: https://huggingface.co/canvit
- Variante con canvas 10 × 10: https://huggingface.co/canvit/probe-ade20k-40k-s512-c10-in21k
- Paper (NeurIPS 2026): https://arxiv.org/abs/2603.22570
- Codigo CanViT: https://github.com/m2b3/CanViT
- Implementacion de referencia CanViT-PyTorch: https://github.com/m2b3/CanViT-PyTorch
- Pagina del proyecto: https://m2b3.github.io/CanViT/
- Demo en vivo `<canvit-live>`: https://m2b3.github.io/CanViT/live.html
- Ficha en directorio de terceros: https://free2aitools.com/model/canvit/probe-ade20k-40k-s512-c64-in1k

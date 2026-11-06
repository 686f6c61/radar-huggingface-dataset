# lynnir9009/face-swap-video

## Resumen

Face-swap-video (DeepSwapFace) es una herramienta de línea de comandos para realizar intercambio de rostros (face swap) en vídeos e imágenes, publicada en Hugging Face por el usuario lynnir9009. No se trata de un modelo de lenguaje ni de una red neuronal propia, sino de un script Python legible y autocontenido que orquesta dos modelos de InsightFace: el detector SCRFD (`det_10g.onnx`) y el modelo de intercambio `inswapper_128.onnx`, ambos ejecutados mediante ONNX Runtime. Su valor diferencial frente a alternativas como notebooks de Colab o grafos complejos de ComfyUI es la simplicidad: un único fichero Python, dos modelos y un comando.

El problema que resuelve es la accesibilidad técnica al face swap: permite prototipado de VFX, investigación y experimentos de preservación de identidad sin infraestructura pesada, funcionando incluso en CPU (una instancia de 2 vCPU y 1,9 GB de RAM es suficiente, aunque una GPU es entre 10 y 30 veces más rápida). El repositorio no incluye los pesos: descarga `buffalo_l` (~289 MB) desde GitHub e `inswapper_128.onnx` (~529 MB) desde un espejo de Hugging Face, precisamente porque este último tiene licencia de uso exclusivamente no comercial en investigación.

La herramienta es relevante como ejemplo de pipeline reproducible y verificable: la model card incluye ejemplos con métricas de similitud coseno ArcFace (identidad) antes y después del intercambio, alcanzando valores de 0,82–0,89, y documentación completa de rendimiento y opciones de CLI. Está escrita en inglés y licenciada bajo MIT (el código, no los modelos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de dos modelos: detector SCRFD (RetinaFace-style) + modelo de intercambio INSwapper (GAN basada en SimSwap, 128x128) + embeddings ArcFace (ResNet50) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no es un modelo generativo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos ONNX en FP32 tal como los distribuye InsightFace) |
| Idiomas soportados | Inglés (interfaz y documentación) |
| Licencia | MIT (el código); `inswapper_128.onnx` es de uso no comercial solo para investigación |
| Formato de pesos | ONNX (ejecutado con ONNX Runtime; proveedores CPU y CUDA) |

## Arquitectura y entrenamiento

El pipeline funciona en cuatro etapas por fotograma. Primero, **detección**: SCRFD (`det_10g.onnx`) localiza cajas de rostro y 5 puntos de referencia (landmarks). Segundo, **alineación**: los rostros detectados se deforman (warp) a la plantilla canónica de 112x112 píxeles. Tercero, **embeddings**: ArcFace (`w600k_r50.onnx`, ResNet50 entrenado en WebFace600K) genera un vector de identidad de 512 dimensiones. Cuarto, **intercambio**: `inswapper_128.onnx` genera el rostro sustituido combinando la identidad del rostro fuente con la pose y el contexto del rostro destino, y el resultado se compone de vuelta en el fotograma.

No hay datos de entrenamiento propios publicados: el autor no entrena ningún modelo, solo integra pesos preentrenados de InsightFace. Los modelos subyacentes se entrenaron con datasets faciales a gran escala (buffalo_l agrupa SCRFD y ArcFace; inswapper se deriva de la línea SimSwap). No aplica RLHF ni DPO al no ser un modelo de lenguaje. Las innovaciones están en la capa de ingeniería: resolución del rostro destino por regla determinista de izquierda a derecha (lo que mantiene la identidad estable entre fotogramas), opción `--det-size 320` que duplica la velocidad de detección en vídeo, y muestreo de fotogramas con `--every N` para reutilizar resultados.

## Capacidades

- Intercambio de rostro en imágenes fijas, con opción de sustituir todas las caras detectadas (`--all-faces`) o una concreta por índice.
- Intercambio de rostro en vídeo, fotograma a fotograma, con control de cadencia (`--every`) y límite de fotogramas (`--max-frames`).
- Selección de rostro fuente y destino por índice (orden izquierda-derecha) para escenas con varias personas.
- Ejecución en CPU o GPU mediante ONNX Runtime (`CPUExecutionProvider` / `CUDAExecutionProvider`).
- Verificación de identidad integrable: los embeddings ArcFace de 512 dimensiones permiten medir similitud coseno fuente-resultado (valores publicados de 0,82–0,89).
- Ajuste de resolución del detector (`--det-size`) para equilibrar velocidad y precisión.
- Interfaz CLI sencilla con salida directa a JPG o MP4.

No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes, y no tiene capacidades multilingües más allá de la documentación en inglés.

## Casos de uso

- Prototipado de efectos visuales (VFX): un equipo de postproducción puede probar sustituciones de rostro en clips cortos antes de invertir en pipelines profesionales, ajustando `--det-size` y `--every` para iterar rápido sobre storyboards en vídeo.
- Investigación en preservación de identidad: los embeddings ArcFace de 512 dimensiones permiten cuantificar objetivamente si un método de edición preserva la identidad, con métricas reproducibles (similitud coseno antes/después).
- Generación de datasets sintéticos para visión por computador: creación controlada de pares rostro-identidad para entrenar o evaluar detectores de deepfakes, usando `--all-faces` en imágenes de grupo.
- Pruebas de privacidad y anonimización: estudio de cómo sistemas de reconocimiento facial responden a rostros sustituidos, midiendo la similitud ArcFace del resultado frente a la identidad original.
- Enseñanza de pipelines ONNX: el código de un solo fichero es ideal como material didáctico para mostrar detección, alineación, embedding y generación en un flujo real y ejecutable.
- Automatización por lotes en servidores modestos: la regla empírica de `frames x 4 s` en CPU (2 vCPU, 1,9 GB RAM) permite planificar trabajos nocturnos de procesamiento de clips cortos sin GPU.
- Verificación de consistencia temporal en vídeo: la detección por fotograma con regla determinista de selección permite comprobar que la identidad se mantiene estable a lo largo de un clip (0,822–0,846 en el ejemplo de 24 fotogramas).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.), algo esperable al no ser un modelo de lenguaje. La model card sí incluye mediciones propias de rendimiento y calidad de identidad:

| Métrica | Resultado |
|---|---|
| Imagen fija 960x1696, det-size 640, CPU | ~27 s (arranque en frío ~50 s con carga de modelos) |
| Pico de RSS en imagen fija | ~1,6 GB |
| Vídeo 378x600, det-size 320, CPU | 4,2 s por fotograma (24 fotogramas: ~100 s) |
| GPU (CUDA EP) | menos de 1 s por fotograma (estimación del autor) |
| Similitud coseno ArcFace tras swap (vídeo) | 0,822 / 0,846 / 0,828 (fotogramas 0, 12, 23) |
| Similitud coseno ArcFace tras swap (imágenes) | 0,893 / 0,855 / 0,851 / 0,820 |
| Similitud coseno antes del swap | entre -0,082 y 0,107 (identidades distintas) |

## Requisitos de hardware

- CPU: suficiente para ejecutar todo el pipeline; la model card documenta ejecución en una instancia de 2 vCPU y 1,9 GB de RAM con ~4,2 s por fotograma en vídeo a 378x600.
- RAM: pico de ~1,6 GB en CPU para una imagen de 960x1696; se recomiendan al menos 2 GB libres.
- GPU: opcional pero recomendada, entre 10 y 30 veces más rápida; con `CUDAExecutionProvider` un fotograma tarda menos de 1 segundo. No se especifica VRAM mínima; los modelos suman ~818 MB en disco, por lo que cualquier GPU moderna con 2-4 GB de VRAM debería bastar (estimación, dato no confirmado por el autor).
- Consumer GPUs: cualquier GPU NVIDIA con soporte CUDA y ONNX Runtime (por ejemplo RTX 3060 o superior) es adecuada; no hay mediciones publicadas por modelo concreto.
- Despliegue: script Python 3.10+ con `pip install -r requirements.txt`; depende de insightface y onnxruntime. No hay contenedores ni endpoints publicados; no aplica vLLM, TGI ni Ollama por no ser un LLM.
- Latencia: imagen fija ~27 s en CPU (incluyendo detección y swap a 640 px); vídeo ~4,2 s/fotograma en CPU, <1 s/fotograma en GPU.

## Comparativa con modelos similares

| Herramienta | Base técnica | Formato | Licencia del código | Uso comercial de los pesos | Complejidad de uso |
|---|---|---|---|---|---|
| face-swap-video (este repo) | InsightFace SCRFD + inswapper_128 | ONNX | MIT | No (inswapper_128 es solo investigación) | Muy baja: un script CLI |
| Roop / Rope | InsightFace + inswapper_128 | ONNX | GPL / variable | No (mismo modelo upstream) | Baja-media: GUI o CLI |
| ComfyUI + ReActor | InsightFace + inswapper_128 en grafo | ONNX | GPL-3.0 (ComfyUI) | No (mismo modelo upstream) | Alta: grafo de nodos |
| FaceFusion | InsightFace + múltiples modelos de swap (incl. variantes comerciales) | ONNX | GPL-3.0 | Depende del modelo elegido | Media: CLI + GUI |

Todas las alternativas abiertas de face swap dependen en mayor o menor medida de los mismos modelos de InsightFace, por lo que comparten la restricción no comercial de `inswapper_128.onnx`. La ventaja de esta ficha es la minimización de dependencias y la documentación explícita de métricas de identidad.

## Limitaciones y advertencias

- Restricción de licencia crítica: aunque el código es MIT, `inswapper_128.onnx` solo permite uso no comercial en investigación; cualquier despliegue comercial requiere revisar la licencia upstream de InsightFace, y el propio repo no distribuye los pesos por este motivo.
- Riesgo de uso indebido elevado: el face swap puede usarse para suplantación, fraude, acoso o imagery íntima no consentida. En muchas jurisdicciones (AI Act de la UE, leyes estatales de deepfakes en EE. UU., regulación china de síntesis profunda) publicar medios sintéticos de personas reales sin divulgación es ilegal. El consentimiento explícito de todas las personas implicadas es obligatorio según la model card.
- Calidad limitada por resolución: el modelo de intercambio trabaja a 128x128 píxeles, lo que puede producir resultados de baja fidelidad en rostros grandes o en primer plano; no se publican métricas de calidad visual (FID, LPIPS) ni de artefactos.
- Casos límite no documentados: no hay datos sobre rendimiento con oclusión, perfiles extremos, múltiples rostros en vídeo o iluminación adversa.
- Estabilidad en vídeo dependiente de la detección: la identidad se mantiene porque la detección corre por fotograma con una regla determinista; fallos de detección o cambios de orden de caras pueden provocar saltos de identidad.
- Sin garantías: el software se ofrece "tal cual" y el autor declina toda responsabilidad por mal uso.
- Proyecto de autor individual con 0 descargas registradas en el momento de la ficha: madurez, mantenimiento y soporte comunitario no demostrados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/lynnir9009/face-swap-video
- Pesos del modelo de intercambio (espejo upstream): https://huggingface.co/ezioruan/inswapper_128.onnx/resolve/main/inswapper_128.onnx
- Modelos buffalo_l de InsightFace (detector y reconocimiento): https://github.com/deepinsight/insightface/releases/download/v0.7/buffalo_l.zip
- Repositorio de InsightFace: https://github.com/deepinsight/insightface
- No hay paper, demo alojada ni blog asociados en la información disponible.

# masahiroid/depth-anything-v2-small-mlx

## Resumen
depth-anything-v2-small-mlx es una conversión no oficial al framework MLX de Apple del modelo Depth-Anything-V2-Small, un estimador de profundidad monocular desarrollado originalmente por TikTok y el equipo de HuggingFace. La conversión la firma el usuario masahiroid y su objetivo es permitir la inferencia de estimación de profundidad en hardware Apple Silicon sin depender de PyTorch.

El modelo original combina un backbone DINOv2-Small con un cuello de tipo DPT (reassemble y fusion) y cuenta con 24.784.705 parámetros (aproximadamente 24,8 millones). Al ser una conversión, no se ha reentrenado ningún peso: se ha reimplementado la arquitectura desde cero en MLX y se han migrado los pesos a float16. La entrada es una imagen RGB de tamaño fijo 518x518 en formato NHWC, y la salida es un mapa de profundidad de 518x518.

Es relevante para desarrolladores que trabajan en el ecosistema Apple (macOS, iOS) y quieren integrar estimación de profundidad en aplicaciones locales con un consumo de memoria muy reducido. Se distribuye bajo licencia Apache 2.0 y, al no ser compatible con mlx-vlm, requiere el fichero `depth_anything_mlx.py` incluido en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de vision: backbone DINOv2-Small + cuello DPT (reassemble/fusion) |
| Parametros totales | 24.784.705 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen fija de 518x518) |
| Tipos de cuantizacion | float16 (unico formato de pesos publicado) |
| Idiomas soportados | en (etiqueta declarada; irrelevante por ser modelo de vision) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX, float16) |

## Arquitectura y entrenamiento
La arquitectura corresponde al modelo Depth-Anything-V2-Small original: un backbone DINOv2-Small que extrae caracteristicas visuales y un cuello de tipo DPT que reensambla y fusiona las representaciones multi-escala para producir un mapa de profundidad denso. Esta combinacion no esta contemplada en la lista de arquitecturas soportadas por `mlx-vlm`, por lo que el autor reescribio la implementacion en MLX desde cero y realizo la conversion de pesos manualmente. La salida del modelo es un tensor de profundidad de dimensiones (1, 518, 518).

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens ni sobre el uso de RLHF/DPO: esta ficha describe una conversion, no un entrenamiento. Los unicos datos de validacion aportados comparan la implementacion MLX contra la referencia PyTorch fp32 del modelo base usando una imagen de validacion de COCO, con una similitud coseno de 1.0 en fp32 y de 1.0000001 en fp16, y un error absoluto medio relativo de 1,1e-6 (fp32) y 0,08% (fp16). El repositorio indica que se utilizo model-audit-lite para la auditoria de seguridad.

## Capacidades
- Estimacion de profundidad monocular: genera un mapa de profundidad denso a partir de una unica imagen RGB.
- Entrada de imagen de tamano fijo 518x518 en formato NHWC (con normalizacion por media y desviacion estandar de ImageNet).
- Precision de pesos en float16, con pesos preparados para carga directa mediante `mx.load`.
- Inferencia en hardware Apple Silicon mediante MLX.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision multimodal generativa ni capacidad de audio; es un modelo puramente de regresion de profundidad.
- No admite resolucion dinamica: la entrada debe reescalarse a 518x518 antes de la inferencia.

## Casos de uso
- Efectos de desenfoque de fondo (retrato) en apps de fotografia para macOS/iOS: el mapa de profundidad permite separar primer plano y fondo por pixel y aplicar un bokeh sintetico de forma local.
- Reconstruccion 3D ligera: el mapa de profundidad puede alimentar pipelines de generacion de mallas o nubes de puntos en aplicaciones de escaneo domestico, aprovechando que el modelo corre enteramente en el dispositivo.
- Realidad aumentada en iPhone/iPad: la profundidad estimada permite anclar objetos virtuales con oclusion correcta respecto a la escena real sin depender de sensores LiDAR.
- Robotica y navegacion de bajo coste: como estimador monocular en plataformas con Apple Silicon (por ejemplo, un Mac mini o un dispositivo embebido), sirve para percibir distancias relativas del entorno.
- Preprocesado para modelos generativos de imagen: la profundidad se usa como condicionamiento en pipelines de difusion para control estructural (ControlNet de profundidad) ejecutados en local.
- Automocion a escala de prototipo: estimacion de distancia relativa a obstaculos en bancos de pruebas con camara monocular y hardware Apple.
- Herramientas creativas de edicion de video: generacion de mapas de profundidad por fotograma para crear parallax, transiciones o desenfoques selectivos en postproduccion.
- Docencia e investigacion en vision por computador: modelo pequeno y ligero para experimentar con arquitecturas DINOv2 + DPT en MLX sin requerir GPU dedicada.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estandar (por ejemplo NYU-Depth o KITTI) en la informacion disponible. El unico dato de rendimiento aportado es la validacion de fidelidad numerica frente a la referencia PyTorch fp32 del modelo base, sobre una unica imagen de validacion de COCO:

| Precision | Similitud coseno | Error absoluto medio relativo |
|---|---|---|
| MLX fp32 | 1.0 | 1,1e-6 |
| MLX fp16 (esta version) | 1.0000001 | 0,08% |

## Requisitos de hardware
- VRAM/RAM estimada: con 24,8 millones de parametros en float16, los pesos ocupan aproximadamente 50 MB. Sumando activaciones a resolucion 518x518, el consumo total se mantiene en el orden de unos pocos cientos de MB.
- GPU compatibles: al ser un modelo MLX, requiere hardware Apple Silicon (familias M1, M2, M3 o M4). No se ejecuta en GPU NVIDIA (A100, H100, RTX 4090) ni en AMD mediante este formato.
- Cabe holgadamente en cualquier Mac con Apple Silicon, incluidos equipos con 8 GB de memoria unificada.
- Opciones de despliegue: MLX con el fichero `depth_anything_mlx.py` incluido en el repositorio. No es compatible con vLLM, llama.cpp, Ollama ni TGI, y tampoco con mlx-vlm.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Framework | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| depth-anything-v2-small-mlx (este) | 24,8 M | MLX | 518x518 fija, NHWC | Apache 2.0 | HuggingFace |
| depth-anything/Depth-Anything-V2-Small-hf | 24,8 M | PyTorch | resolucion dinamica (NCHW) | Apache 2.0 | HuggingFace |
| Variantes Base / Large de Depth Anything V2 | no disponible | PyTorch | no disponible | Apache 2.0 (segun el modelo base) | HuggingFace |

La diferencia principal frente al modelo base es el framework de ejecucion (MLX frente a PyTorch) y la limitacion a una resolucion de entrada fija, a cambio de una integracion nativa en el ecosistema Apple. No se dispone de datos de otros estimadores de profundidad comparables en la informacion proporcionada.

## Limitaciones y advertencias
- Es una conversion no oficial de la comunidad, no una publicacion de los autores originales de Depth Anything; los creditos del modelo original pertenecen a TikTok y al equipo de HuggingFace.
- La entrada esta restringida a 518x518 y en orden NHWC; no admite resolucion dinamica y reescalar imagenes de otra relacion de aspecto puede degradar la profundidad estimada.
- El orden de canales NHWC difiere del de PyTorch (NCHW); reutilizar el mismo preprocesado que en PyTorch produce resultados incorrectos.
- La validacion de precision se realizo sobre una unica imagen de COCO, por lo que no constituye una evaluacion exhaustiva de la calidad de la profundidad.
- Riesgo de alucinacion y de errores en escenas con poca textura, superficies reflectantes, transparencias o geometrias ambiguas, inherente a cualquier estimador monocular.
- No es compatible con mlx-vlm ni con los runners de MLX estandar; requiere obligatoriamente el fichero `depth_anything_mlx.py` del repositorio.
- El repositorio registra cero descargas y cero likes en el momento de la consulta, por lo que su madurez y soporte comunitario son limitados.
- Licencia Apache 2.0, que permite uso comercial, pero al tratarse de una conversion conviene verificar la licencia y los terminos del modelo base antes de un despliegue en produccion.
- El autor declara el uso de model-audit-lite para la auditoria de seguridad; los detalles se recogen en `SECURITY.md`.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/masahiroid/depth-anything-v2-small-mlx
- Modelo base: https://huggingface.co/depth-anything/Depth-Anything-V2-Small-hf
- MLX (framework): https://github.com/ml-explore/mlx
- model-audit-lite (herramienta de auditoria usada por el autor): https://github.com/masahirocom/model-audit-lite

# coldmew/veil-diffvax-immunizer

## Resumen

DiffVax immunizer es una exportación a ONNX de la red de inmunización de imágenes DiffVax, un modelo de investigación desarrollado por el grupo de Ozden, Kara, Akcin, Zaman, Srivastava, Chinchali y Rehg y publicado en el paper *DiffVax: Optimization-Free Image Immunization Against Diffusion-Based Editing* (ICLR 2026). El modelo no genera imágenes ni texto: su función es producir una perturbación imperceptible que, sumada a una imagen de entrada, dificulta que modelos de difusión la utilicen como base para editar o regenerar contenido. El repositorio de Hugging Face, mantenido por el usuario coldmew, no entrena nada nuevo, sino que convierte el checkpoint oficial `diffvax_trained.pth` a formato ONNX para poder ejecutarlo en el navegador con ONNX Runtime Web.

La arquitectura es una `NestedUNet` con 3 canales de salida y aproximadamente 9,16 millones de parámetros. La entrada es una imagen RGB de 512×512 en float32 con rango [-1, 1], y la salida tiene la misma forma: es el mapa de perturbación que se aplica selectivamente según una máscara que marca la región que un editor repintaría. La innovación principal del método es que la inmunización se calcula en una sola pasada hacia delante, sin optimización por imagen, lo que lo hace viable en un contexto web.

El modelo es relevante para quienes investigan privacidad frente a modelos generativos y quieren experimentar con protección de imágenes en el navegador sin depender de un servidor. No obstante, su propio autor advierte de que es un modelo de investigación y que ejecutarlo no garantiza que una imagen quede protegida: el efecto debe medirse para cada modelo de edición y configuración concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NestedUNet (U-Net anidada), `num_classes=3` |
| Parametros totales | ~9,16 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, entrada fija 512×512) |
| Tipos de cuantizacion | no disponible (exportación ONNX en float32) |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17), fichero `diffvax_immunizer.onnx` de 36.640.862 bytes |

## Arquitectura y entrenamiento

El modelo es una NestedUNet, una variante de U-Net con conexiones densas entre niveles de resolución, configurada para producir una salida de 3 canales (RGB) a partir de una imagen de 3 canales de 512×512 píxeles. La entrada se normaliza al rango [-1, 1] en float32 y la salida es una perturbación del mismo tamaño y rango. La aplicación prevista por el autor original es `immunized = clamp(image + output * (1 - mask), -1, 1)`, donde `mask = 1` marca la región que un editor repintaría y, por tanto, la zona que no se perturba.

El entrenamiento se realizó en el repositorio oficial de DiffVax (commit `77fe66a`, checkpoint `diffvax_trained.pth`) y no se detalla en la información disponible el número de tokens, la composición del dataset ni si hubo RLHF o DPO, dado que no es un modelo de lenguaje. La innovación técnica del método, según el paper, es que la inmunización es "optimization-free": se genera en una única pasada hacia delante en lugar de resolver una optimización por imagen, lo que reduce el coste computacional y permite el despliegue en navegador. La exportación a ONNX se validó con `torch.onnx.export` y carga estricta del checkpoint; la paridad frente a PyTorch en cinco entradas de 512×512 dio un error máximo absoluto ≤ 1,5e-6 y un error medio absoluto ≤ 1,6e-8, y en navegador (ONNX Runtime Web con WebGPU y WASM) el error máximo fue ≤ 1,4e-7.

## Capacidades

- Generación de perturbaciones de inmunización para imágenes de 512×512 píxeles en una sola pasada hacia delante.
- Aplicación selectiva mediante máscara: solo perturba la región que el editor repintaría, dejando intacta la zona marcada con `mask = 1`.
- Ejecución en navegador mediante ONNX Runtime Web, con soporte de WebGPU y WASM.
- Inferencia en float32 con entrada estática `[1,3,512,512]`, sin procesamiento por lotes variable.
- No realiza generación de texto, razonamiento, código, matemáticas, visión descriptiva, tool calling ni razonamiento multi-paso.
- No tiene capacidades multilingües ni modo de pensamiento (thinking mode).
- No soporta audio ni otras modalidades distintas de la imagen RGB.

## Casos de uso

- Protección de imágenes antes de publicarlas en redes sociales: el usuario ejecuta el modelo en el navegador con ONNX Runtime Web y obtiene una versión perturbada que dificulta que un modelo de difusión la use como base para editar rostros o escenas. Es adecuado porque no requiere servidor ni subir la imagen a terceros.
- Investigación en privacidad frente a modelos generativos: un equipo puede medir empíricamente el efecto de la inmunización sobre distintos editores de difusión, ya que el modelo permite generar la perturbación de forma rápida y reproducible con una única pasada.
- Integración en herramientas de edición o publicación web: al ser un fichero ONNX de ~36,6 MB, puede cargarse en una aplicación cliente y aplicarse localmente antes de la subida, reduciendo la exposición de la imagen original.
- Evaluación comparativa de métodos de inmunización: sirve como línea base "optimization-free" frente a métodos que optimizan por imagen, gracias a su bajo coste de inferencia y a la paridad numérica verificada con PyTorch.
- Docencia y demostraciones sobre adversarial examples en difusión: el modelo permite ilustrar en un notebook o en una demo web cómo una perturbación imperceptible afecta a la edición generativa, sin necesidad de GPU dedicada para el despliegue en cliente.
- Prototipado de pipelines de privacidad en aplicaciones de mensajería o almacenamiento de fotos: se puede aplicar la perturbación antes de guardar o enviar la imagen, con la advertencia de que el efecto protector debe validarse para cada modelo de edición concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de paridad de la exportación:

| Prueba | Resultado |
|---|---|
| Paridad ONNX Runtime vs PyTorch (5 entradas 512×512) | max abs Δ ≤ 1,5e-6; mean abs Δ ≤ 1,6e-8 |
| Paridad en navegador (ONNX Runtime Web, WebGPU y WASM) vs PyTorch | max abs Δ ≤ 1,4e-7 |
| Tamaño del fichero ONNX | 36.640.862 bytes |
| SHA-256 | `44aa61ea8d6fbdc485bc897376cff41027e9885d5f68c3dd2e4bae8092cf3cd4` |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con ~9,16 M de parámetros en float32 y entrada fija de 512×512, el modelo es muy ligero y cabe holgadamente en cualquier GPU consumer actual.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU con soporte de WebGPU o WASM es suficiente para el despliegue en navegador. En servidor, una RTX 4090, A100 o H100 no serían necesarias para este modelo.
- Cabe en GPU consumer: sí, por el reducido número de parámetros y el tamaño del fichero ONNX (~36,6 MB).
- Opciones de despliegue: ONNX Runtime Web (WebGPU y WASM) es el objetivo declarado; también puede ejecutarse con ONNX Runtime en Python u otros runtimes compatibles con ONNX opset 17.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DiffVax immunizer (esta ficha) | ~9,16 M | NestedUNet, inmunización de imágenes | 512×512 fija | MIT | ONNX en Hugging Face |
| DiffVax original (PyTorch) | ~9,16 M | NestedUNet, inmunización de imágenes | 512×512 fija | MIT | Checkpoint `.pth` en GitHub |
| Métodos de inmunización con optimización por imagen | no disponible | Optimización adversarial | variable | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: ejecutarlo no establece que una imagen esté protegida; el efecto protector debe medirse para cada modelo de edición y configuración concretos.
- En la aplicación Veil se etiqueta como "Experimental. Protection is not established."
- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes.
- Entrada estática de 512×512 en float32; no admite resoluciones o lotes variables sin adaptación.
- No se detallan sesgos conocidos ni riesgos de alucinación, ya que no produce contenido semántico.
- Licencia MIT, igual que el proyecto upstream, con la nota de copyright original conservada; permite uso comercial según los términos de MIT, aunque el autor no garantiza la eficacia protectora.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.
- La fecha de creación indicada (2026-11-14) es posterior a la del paper citado (ICLR 2026) y debe tratarse con cautela como metadato.

## Enlaces

- Hugging Face: https://huggingface.co/coldmew/veil-diffvax-immunizer
- Paper (arXiv): https://arxiv.org/abs/2411.17957
- Repositorio oficial DiffVax: https://github.com/ozdentarikcan/DiffVax
- Checkpoint original: `diffvax_trained.pth` (commit `77fe66a` del repositorio anterior)
- Fichero ONNX: `diffvax_immunizer.onnx` (36.640.862 bytes, SHA-256 `44aa61ea8d6fbdc485bc897376cff41027e9885d5f68c3dd2e4bae8092cf3cd4`)

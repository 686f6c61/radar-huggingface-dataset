# ipsilondev/painterly-style-nets-onnx

## Resumen

`painterly-style-nets-onnx` es una coleccion de cinco redes de transferencia de estilo neuronal rapida (fast neural style, Johnson et al. 2016) exportadas a ONNX, publicadas por el desarrollador `ipsilondev`. Cada red aplica un estilo pictorico concreto (oleo clasico, acuarela, barroco oscuro, pastel suave y tinta) sobre una imagen de entrada y devuelve la imagen estilizada. El unico consumidor previsto es la aplicacion Android PetRegal (`com.ipsilondev.petregal`), por lo que no se trata de un modelo de proposito general sino de un componente de inferencia embebido.

Tecnicamente son redes `TransformerNet` (arquitectura de estilo rapido basada en convoluciones y bloques residuales, sin transformer de atencion pese al nombre) con perdida perceptiva VGG16, siguiendo el ejemplo oficial de PyTorch `fast_neural_style`. Cada fichero ONNX ocupa 3,39 MB y admite resoluciones dinamicas de entrada y salida (alto y ancho multiples de 4), lo que permite procesar imagenes de cualquier tamano en CPU.

La relevancia de esta publicacion es limitada y el propio autor lo advierte: son redes "starter" entrenadas sin GPU, con solo 600 iteraciones por estilo, que producen artefactos de textura visibles. No son calidad de produccion ni se han medido las puertas de calidad definidas en la especificacion de la app.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fast neural style (`TransformerNet` con perdida perceptiva VGG16) |
| Parametros totales | no disponible (pesos fp16 de 3,39 MB por red) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision image-to-image) |
| Tipos de cuantizacion | pesos almacenados en fp16 con cast a float32 dentro del grafo; no se documentan otras variantes |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX (opset 17), un fichero por estilo |

## Arquitectura y entrenamiento

Cada red es una `TransformerNet` de estilo rapido: un codificador convolucional con bloques residuales y un decodificador que produce la imagen estilizada en una sola pasada, sin optimizacion por imagen. La perdida combina contenido y estilo: peso de contenido 1e5 y peso de estilo 1e10, optimizador Adam con tasa de aprendizaje 1e-3 y semilla 42. El calculo de estilo se hace contra caracteristicas de una VGG16 preentrenada (perdida perceptiva), siguiendo el ejemplo `fast_neural_style` de PyTorch.

El entrenamiento es deliberadamente minimo: 600 iteraciones por estilo, lote de 2, recortes de 256 px, sobre 165 imagenes de COCO val2017, en CPU (PyTorch 2.15 sin GPU), con unos 32 minutos por estilo. La especificacion original preveia 2 epocas sobre COCO train2017 en una RTX 3060 (2-4 horas por estilo). La exportacion se hace con `torch.onnx.export` (opset 17, alto y ancho dinamicos), seguida de `onnxslim` y conversion de los inicializadores a fp16 con un `Cast` a float32 en el grafo, de modo que cualquier build de ONNX Runtime en CPU puede ejecutarlo sin kernels fp16. La verificacion reporta una diferencia absoluta media maxima de 0,006 sobre 255 respecto al modelo fp32 de PyTorch en 10 imagenes de 256 px (limite 2/255).

## Capacidades

- Transferencia de estilo image-to-image en cinco estilos pictoricos: `oil-classic`, `watercolor-wash`, `baroque-dark`, `pastel-soft` e `ink-wash`.
- Entrada `[1, 3, H, W]` float32 RGB en rango 0-255, con alto y ancho dinamicos (multiplos de 4).
- Salida `[1, 3, H, W]` float32 en rango 0-255; la aplicacion consumidora aplica el recorte final.
- Inferencia en CPU sin necesidad de GPU ni de soporte fp16 en el runtime.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, audio ni vision de proposito general.
- No hay capacidades multilingues: el modelo no procesa lenguaje.

## Casos de uso

- Filtro de estilo en la app PetRegal: el caso de uso real y unico documentado. La app carga uno de los cinco `.onnx` y aplica el estilo sobre la foto de la mascota; el contrato de entrada/salida y las dimensiones dinamicas estan pensados para esta integracion.
- Prototipado de pipelines de estilo en Android: sirve como referencia de exportacion ONNX con pesos fp16 y cast a float32, util para validar el flujo completo antes de sustituir por redes de mayor calidad.
- Pruebas de integracion de ONNX Runtime en movil: al pesar 3,39 MB y ejecutarse en CPU, permite verificar carga de modelos, gestion de tensores dinamicos y latencia en dispositivos reales sin depender de aceleradores.
- Generacion de miniaturas estilizadas en backend: con una latencia de escritorio de 1,0-1,2 s a 1024x724 en onnxruntime CPU 1.24.1, es viable para procesar lotes pequenos de imagenes en servidor sin GPU.
- Experimentacion docente con fast neural style: el repositorio incluye comandos de entrenamiento, logs por estilo y verificacion, lo que lo hace util para reproducir el metodo de Johnson et al. a pequena escala.
- Base para reentrenamiento: el autor documenta `training/run_all.sh` con `ITERS` alto y COCO train2017 para reemplazar los `.onnx` manteniendo nombres y contrato, de modo que sirve como esqueleto de un pipeline de estilo propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos datos de rendimiento son operativos: latencia de escritorio de aproximadamente 1,0-1,2 s a 1024x724 con onnxruntime 1.24.1 en CPU, y una desviacion media absoluta de 0,006 sobre 255 frente al modelo fp32 de PyTorch en 10 imagenes de 256 px. Las puertas de calidad de la app (dos revisores valorando "parece pintado, pelo y ojos legibles" con un minimo del 80 % en 20 retratos de mascotas, y latencia maxima de 12 s a 1024 px en el telefono de referencia) no se han medido.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo esta pensado para CPU. No se documenta consumo de VRAM.
- GPU recomendadas: no disponible; el autor menciona una RTX 3060 solo para el reentrenamiento previsto, no para inferencia.
- GPU de consumo: irrelevante para inferencia, ya que corre en CPU. Para reentrenar, una RTX 3060 es la referencia indicada por el autor.
- Despliegue: ONNX Runtime (probado con 1.24.1 en CPU). No se documentan pruebas con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia: aproximadamente 1,0-1,2 s por imagen a 1024x724 en CPU de escritorio. Throughput no disponible.
- Movil: la latencia en el telefono de referencia no se ha medido.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ipsilondev/painterly-style-nets-onnx` | Fast neural style, 5 estilos | no disponible (3,39 MB por red) | Resolucion dinamica, multiplos de 4 | BSD-3-Clause | Hugging Face, ONNX |
| Ejemplo `pytorch/examples/fast_neural_style` | Fast neural style, referencia | no disponible | Resolucion fija en el ejemplo original | BSD-3-Clause | GitHub |
| Modelos de style transfer ONNX genericos | Fast neural style | variable | variable | variable | Hugging Face |

No se dispone de datos de benchmarks ni de comparativas cuantitativas con alternativas concretas en la informacion proporcionada. La comparacion con el ejemplo de PyTorch es directa porque el autor declara que sigue esa implementacion; las diferencias son el entrenamiento propio, la exportacion a ONNX con dimensiones dinamicas y el empaquetado fp16.

## Limitaciones y advertencias

- Calidad insuficiente para produccion: 600 iteraciones por estilo frente a las 2 epocas previstas, con artefactos de textura visibles, segun el propio autor.
- Las puertas de calidad de la app no estan medidas: ni la valoracion subjetiva de revisores ni la latencia en el telefono de referencia.
- Entrenado sobre solo 165 imagenes de COCO val2017, lo que limita la variedad de contenido y puede generalizar mal fuera de retratos de mascotas.
- Riesgo de artefactos y distorsiones en caras, ojos y texturas finas (pelo), precisamente los elementos que la app quiere preservar.
- No es un modelo de proposito general: no procesa texto, audio ni otras modalidades, y no soporta tool calling ni agentes.
- Licencia BSD-3-Clause: permite uso comercial con atribucion y conservacion del aviso de copyright; conviene revisar las condiciones de las imagenes de estilo (dominio publico, escaneos de Wikimedia Commons) y de COCO val2017 (uso solo para entrenamiento, ninguna imagen incluida en el repositorio).
- El modelo esta disenado para un unico consumidor (PetRegal); su contrato de E/S esta acoplado a esa app.
- Sesgos conocidos: no documentados. Al trabajar sobre imagenes, hereda los sesgos de la distribucion de COCO val2017 y de las pinturas de estilo elegidas.

## Enlaces

- Hugging Face: https://huggingface.co/ipsilondev/painterly-style-nets-onnx
- Ejemplo de referencia `fast_neural_style` (PyTorch): https://github.com/pytorch/examples/tree/main/fast_neural_style
- Paper de fast neural style (Johnson, Alahi, Fei-Fei 2016): no disponible en la informacion proporcionada
- COCO val2017: http://images.cocodataset.org
- Repositorio de la app PetRegal: no disponible en la informacion proporcionada
- Provenance de imagenes de estilo: `training/style_images_provenance.json` dentro del repositorio del modelo

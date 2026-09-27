# sm079/sharp-onnx-webgpu

## Resumen

SHARP (ONNX, WebGPU) es un export a ONNX del modelo SHARP de Apple ("Sharp Monocular View Synthesis in Less Than a Second"), un sistema de reconstruccion 3D monocular que convierte una unica fotografia en un conjunto de gaussianas 3D. El autor del repositorio es sm079, que publica esta version derivada preparada especificamente para inferencia en el navegador mediante ONNX Runtime Web sobre el backend WebGPU. No es un lanzamiento oficial de Apple ni esta respaldado por la compania.

El modelo resuelve el problema de la sintesis de vistas novedosas a partir de una sola imagen: dado un fotografia RGB de 1536 x 1536 pixeles y un parametro de disparidad, produce aproximadamente 1,18 millones de gaussianas (2 x 768 x 768) con sus vectores medios, valores singulares, cuaterniones de rotacion, colores en RGB lineal y opacidades. Estas gaussianas permiten generar movimientos de camara sinteticos, que es exactamente lo que hace SharpRig, la aplicacion que consume este export.

Su relevancia es practica: el empaquetado int8 reduce la descarga a 0,66 GB y el grafo ONNX se ejecuta en el navegador sin necesidad de servidor, lo que abarata el despliegue de demostraciones interactivas de image-to-3D. No hubo reentrenamiento ni ajuste fino; se trata exclusivamente de una conversion de formato y cuantizacion del checkpoint original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red SHARP de sintesis de vistas monoculares basada en gaussian splatting; composicion interna de capas no documentada en la model card (no disponible) |
| Parametros totales | no disponible (el empaquetado int8 ocupa 0,66 GB, pero el autor no publica el recuento de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada fija de imagen 1 x 3 x 1536 x 1536 y un escalar de disparidad) |
| Tipos de cuantizacion | int8 weight-only, redondeo al mas cercano, con una escala float32 por canal de salida; se descuantiza a fp16 antes de la inferencia. El checkpoint original se trazo en fp16 con entradas y salidas fp32 |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | apple-ml-research-model-license (Apple Machine Learning Research Model License Agreement); uso solo para investigacion no comercial |
| Formato de pesos | ONNX: grafo `sharp.onnx` (4 MB) mas pesos externos en `sharp.int8.bin` (0,66 GB) |

## Arquitectura y entrenamiento

El modelo subyacente, SHARP, realiza sintesis de vistas monoculares representando la escena como un conjunto de gaussianas 3D. La salida del grafo no es una malla ni un mapa de profundidad denso, sino un conjunto de primitivas gaussianas en el espacio NDC propio de SHARP: 2 x 768 x 768 = 1.179.648 gaussianas, cada una descrita por `mean_vectors` [1, N, 3], `singular_values` [1, N, 3], `quaternions` [1, N, 4] en orden (w, x, y, z), `colors` [1, N, 3] en RGB lineal y `opacities` [1, N]. La entrada consta de `image` float32 [1, 3, 1536, 1536] con RGB en el rango [0, 1] y `disparity_factor` float32 [1], definido como la longitud focal en pixeles dividida por el ancho de la imagen.

Este repositorio concreto no entrena nada. El autor traza la red en fp16 a partir del checkpoint `sharp_2572gikvuh.pt` y la exporta a ONNX. Hay dos modificaciones tecnicas destacables. La primera es que la reproyeccion final de NDC a espacio metrico, que requiere una descomposicion en valores singulares (SVD) que ONNX no puede expresar, se ha sacado del grafo y se delega en quien invoca el modelo como una escala por eje. La segunda es el empaquetado int8 de los pesos, que reduce a la mitad la descarga y que se descuantiza a fp16 antes de ejecutar la inferencia; por tanto, la numerica final es la de un modelo fp16 con pesos redondeados a int8. Segun el autor, medido contra el checkpoint fp32 en una foto de prueba, el error relativo de profundidad es del 0,19 % en la mediana y del 1,1 % en el percentil 95.

## Capacidades

- Reconstruccion 3D a partir de una sola imagen: genera un conjunto de gaussianas 3D desde una unica fotografia RGB.
- Sintesis de vistas novedosas: las gaussianas producidas permiten renderizar movimientos de camara sinteticos sobre la escena.
- Estimacion implicita de profundidad y geometria: el error relativo de profundidad reportado frente al checkpoint fp32 es del 0,19 % (mediana) y 1,1 % (p95).
- Prediccion de apariencia: emite color RGB lineal y opacidad por gaussiana, lo que permite renderizado volumetrico con transparencias.
- Inferencia en navegador: el export esta pensado para ONNX Runtime Web con backend WebGPU, sin servidor de inferencia dedicado.
- Integracion con SharpRig: el modelo se usa como pieza central de un flujo que convierte una foto en un video con movimiento de camara.
- Razonamiento, generacion de texto, codigo, matematicas, tool calling, agentes, vision por lenguaje, audio y capacidades multilingues: no aplica, es un modelo puramente de vision 3D sin componente de lenguaje.

## Casos de uso

- Demostraciones interactivas en navegador: al ejecutarse con ONNX Runtime Web sobre WebGPU, el modelo puede incrustarse en una pagina web que permita al usuario subir una foto y ver el resultado 3D sin instalar nada ni enviar la imagen a un servidor.
- Generacion de videos con movimiento de camara: mediante SharpRig, una sola foto se convierte en un clip con dolly o paneo, util para contenido para redes sociales o presentaciones de producto.
- Escaneo 3D ligero en movil o portatil: el empaquetado int8 de 0,66 GB hace viable descargar los pesos una vez y reutilizarlos offline en un equipo de gama media con WebGPU.
- Previsualizacion de escenas para pipelines de activos 3D: generar una representacion gaussiana rapida de un objeto o habitacion antes de decidir si merece la pena un escaneo fotogrametrico completo.
- Realidad aumentada y realidad virtual: las gaussianas en NDC pueden alimentar visores que necesiten una reconstruccion rapida de la escena a partir de una captura del usuario.
- Investigacion en sintesis de vistas: al ser un export fiel del checkpoint original con error de profundidad medido, sirve como referencia reproducible en entornos web para comparar variantes de cuantizacion.
- Prototipado de herramientas de edicion fotografica 3D: permitir reencuadres y cambios de perspectiva posteriores a la captura sin volver a fotografiar la escena.
- Educacion y divulgacion: explicar gaussian splatting con una demo que funciona en el navegador y no requiere GPU de centro de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar en la informacion disponible. El unico dato cuantitativo aportado por el autor es la fidelidad del export frente al checkpoint original:

| Metrica | Valor |
|---|---|
| Error relativo de profundidad (mediana) frente al checkpoint fp32 | 0,19 % |
| Error relativo de profundidad (p95) frente al checkpoint fp32 | 1,1 % |
| Conjunto de evaluacion | una foto de prueba, segun el autor |

No hay resultados de MMLU, HumanEval, GSM8K ni equivalentes, porque el modelo no es un modelo de lenguaje. Tampoco se publican metricas de calidad de renderizado (PSNR, SSIM, LPIPS) ni comparaciones con otros metodos de sintesis de vistas monoculares en esta model card.

## Requisitos de hardware

- VRAM estimada: los pesos int8 ocupan 0,66 GB en disco, pero se descuantizan a fp16 antes de la inferencia, por lo que en memoria hay que contar aproximadamente 1,3 GB solo para pesos, mas activaciones y las estructuras ONNX Runtime. En la practica conviene disponer de 3-4 GB de memoria de GPU como minimo orientativo; el autor no publica cifras oficiales.
- GPU recomendadas: cualquier GPU con soporte de WebGPU en el navegador (por ejemplo, graficas de escritorio y portatiles recientes de AMD, Intel y NVIDIA). El autor no especifica modelos concretos.
- GPU de consumo: si, el objetivo declarado del export es precisamente la inferencia en navegador sobre hardware de consumo con WebGPU. No se garantiza en GPU sin WebGPU o con controladores antiguos.
- Opciones de despliegue: ONNX Runtime Web con backend WebGPU (escenario principal); el grafo ONNX tambien podria ejecutarse con otros runtimes compatibles con ONNX, aunque el autor no lo documenta. vLLM, llama.cpp, Ollama o TGI no aplican, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. El nombre del trabajo original de Apple alude a menos de un segundo, pero no se aporta ninguna medicion de latencia para este export en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Formato | Pesos | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sm079/sharp-onnx-webgpu | ONNX (grafo + datos externos) | int8 descuantizado a fp16, 0,66 GB en disco | Imagen 1536 x 1536 + disparidad | Apple ML Research Model License, solo investigacion no comercial | HuggingFace |
| SHARP original de Apple (apple/ml-sharp) | Checkpoint PyTorch | fp32 (no cuantizado) | Imagen + parametros de camara, segun el repositorio original | Apple ML Research Model License | Repositorio GitHub de Apple |
| Otros metodos de image-to-3D (Depth Anything, MiDaS, Marigold, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa con alternativas de la misma categoria no puede completarse porque la informacion proporcionada solo describe el modelo de Apple y su export. El dato diferencial de este repositorio frente al checkpoint original es el formato ONNX, el empaquetado int8 y la capacidad de ejecucion en navegador con WebGPU.

## Limitaciones y advertencias

- Licencia restrictiva: se hereda la Apple Machine Learning Research Model License, que limita el uso a investigacion no comercial. No es apta para productos comerciales sin permiso explicito de Apple.
- Modelo derivado no oficial: no esta respaldado ni publicado por Apple; cualquier problema de calidad o soporte recae en el autor del export.
- Sin reentrenamiento: el autor indica explicitamente que no hubo entrenamiento ni ajuste fino, por lo que se heredan todos los sesgos y limitaciones del modelo original.
- La reproyeccion metrica no esta en el grafo: la conversion final de NDC a espacio metrico requiere una SVD que ONNX no soporta y queda a cargo del consumidor como una escala por eje. Si se omite o se calcula mal, la geometria sera incorrecta aunque las gaussianas se generen bien.
- Perdida por cuantizacion: los pesos se redondean a int8 antes de volver a fp16, lo que introduce un error medido de 0,19 % (mediana) y 1,1 % (p95) en profundidad relativa sobre una unica foto de prueba; no hay evaluacion sobre un conjunto amplio.
- Entrada rigida: la imagen debe ser exactamente 1 x 3 x 1536 x 1536 en float32 y rango [0, 1]; no se documenta soporte para otras resoluciones o relaciones de aspecto.
- Ambiguedad monocular: al partir de una sola vista, las zonas ocluidas o no observadas se infieren, con riesgo de geometria plausible pero incorrecta. No hay metricas publicadas de este comportamiento.
- Dependencia de WebGPU: el rendimiento y la compatibilidad dependen del navegador y del controlador de la GPU; no se documentan versiones minimas ni resultados en hardware sin WebGPU.
- Idiomas: no aplica, el modelo no procesa texto y la model card no declara soporte linguistico.
- Adopcion practica: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni de validacion por terceros.
- Los resultados de busqueda web obtenidos no guardan relacion con el modelo (contenido sobre la ciudad de Annecy), por lo que no aportan informacion adicional verificable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sm079/sharp-onnx-webgpu
- Repositorio original de Apple SHARP: https://github.com/apple/ml-sharp
- Aplicacion SharpRig, que consume este export: https://github.com/sm079/sharp-rig
- Script de exportacion y empaquetado ONNX: https://github.com/sm079/sharp-rig/blob/main/tools/export_sharp_onnx.py
- Licencia del modelo: archivo LICENSE dentro del repositorio de HuggingFace
- Resultados de busqueda web relevantes: no disponible (los resultados obtenidos no estan relacionados con el modelo)

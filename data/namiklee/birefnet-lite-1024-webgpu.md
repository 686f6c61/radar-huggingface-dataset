# namiklee/birefnet-lite-1024-webgpu

## Resumen

BiRefNet-lite-1024-webgpu es una exportación ONNX de BiRefNet-lite a resolución 1024x1024, parcheada estructuralmente para ejecutarse en el execution provider WebGPU de onnxruntime-web dentro del navegador. No es un modelo nuevo ni un reentrenamiento: los pesos son idénticos a los de ZhengPeng7/BiRefNet_lite y solo se ha reescrito la topología del grafo para eliminar dos bloqueos que impedían su ejecución en WebGPU. El autor es namiklee, que lo publica como pieza de producción de su servicio Backgroundless.

El problema que resuelve es concreto: la exportación estándar de BiRefNet a 1024 cae al execution provider de CPU en la mayor parte del grafo y muere con `std::bad_alloc` en el heap wasm de 32 bits de ORT Web. El parche reescribe 59 nodos `Split` de 32 salidas (que exceden el límite de `maxStorageBuffersPerShaderStage` de WebGPU) y 80 nodos `GatherND` procedentes de la emulación de `deform_conv2d`, sustituyéndolos por `Gather` con aritmética de índices int32 y cadenas de `Add`. Ambas reescrituras se verifican bit-idénticas en CPU EP.

Es relevante para quien necesite segmentación de primer plano y matting alfa de alta calidad sin subir imágenes a un servidor: el modelo corre íntegramente en el cliente, con licencia MIT y un tamaño de repositorio de 0,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Swin Transformer (BiRefNet-lite), exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 1024x1024) |
| Tipos de cuantizacion | fp16 (pesos ya en fp16); se carga con `dtype: 'fp32'` en transformers.js para evitar el sufijo automático |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model_fp16`), biblioteca transformers.js |

## Arquitectura y entrenamiento

BiRefNet es una red de segmentación de imagen basada en un backbone Swin Transformer con un decodificador multi-escala orientado a matting de alta resolución. La variante lite reduce el coste computacional respecto al modelo completo. Esta publicación no entrena ni ajusta el modelo: parte de los pesos de ZhengPeng7/BiRefNet_lite y solo modifica la topología del grafo ONNX.

Las dos innovaciones técnicas del repositorio son de ingeniería de despliegue, no de aprendizaje. Primero, los 59 nodos `Split` con 32 salidas se reescriben como árboles de como máximo 6 salidas para respetar el límite de storage buffers por shader stage de WebGPU (8 por especificación, 10 en muchos adaptadores). Segundo, los 80 nodos `GatherND` que emulan `deform_conv2d` se convierten en `Gather` más aritmética de índices int32 y cadenas secuenciales de `Add`; esto evita materializar buffers im2col de `[1,1,64,49,256,256]` en fp16 (392 MB) sobre el heap wasm de 32 bits. El autor documenta dos trampas: castear a int32 tarde (reduce las copias host-device de 180 a 80 y el tiempo de 9,1 s a 3,4 s) y usar una cadena secuencial de `Add` en lugar de un árbol balanceado, porque la suma en fp16 no es asociativa y rompería la identidad bit a bit.

## Capacidades

- Segmentación de primer plano (foreground segmentation) y generación de mattes alfa a partir de una imagen RGB.
- Matting de alta resolución a 1024x1024, orientado a detalles finos: pelo, pelaje, tejidos y bordes de producto.
- Salida en logits: requiere aplicar sigmoid para obtener la máscara alfa; no devuelve una imagen 0-255 directamente.
- Ejecución íntegra en el navegador mediante transformers.js y onnxruntime-web con WebGPU.
- Funcionamiento en cliente sin subida de imágenes ni ida y vuelta al servidor.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual de una sola pasada.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Eliminación de fondos en aplicaciones web sin backend: el modelo se carga con transformers.js en el navegador del visitante, de modo que la imagen nunca sale del dispositivo, lo que simplifica el cumplimiento de RGPD y elimina costes de servidor.
- Herramientas de edición fotográfica interactivas: integrado en un editor canvas, permite recortar sujetos y generar máscaras alfa para composición posterior; conviene usar la variante 512 para previsualización y la 1024 solo en la exportación final.
- Recorte de producto en comercio electrónico: la resolución 1024 preserva bordes finos de tejidos y materiales, adecuada para fichas de catálogo donde el detalle del contorno es visible.
- Procesado por lotes en el cliente: al ejecutarse en el navegador, distribuye la carga entre los equipos de los usuarios; útil para estudios fotográficos que procesan series de retratos.
- Extracción de sujetos para vídeo o animación: la máscara alfa generada puede alimentar pipelines de composición o de rotoscopia asistida, frame a frame, en herramientas de escritorio basadas en web.
- Aplicaciones de privacidad primero: sectores sanitario, legal o educativo donde no se permite enviar imágenes a terceros; el procesamiento local elimina la transferencia de datos sensibles.
- Prototipado e investigación en segmentación: los scripts de parcheo publicados permiten reproducir la reescritura del grafo y adaptarla a otras exportaciones de BiRefNet que sufran los mismos bloqueos.

## Benchmarks y rendimiento

El autor publica una comparación contra BiRefNet-lite-512 sobre un conjunto de 30 imágenes, con la misma métrica (`edgeSharpness().gradient`) y el mismo compositor. Advierte que las columnas de calidad y de tiempo provienen de ejecuciones distintas: la calidad se midió en Node sobre CPU EP y los tiempos sobre WebGPU.

| Métrica | BiRefNet-lite-512 | Este (1024) |
|---|---|---|
| Gradiente de borde (30 imágenes) | 0,0989 | 0,1436 |
| Gradiente en productos | 0,1095 | 0,1754 |
| interiorSoft | 0,00296 | 0,00043 |
| Tiempo en navegador (WebGPU) | 0,85 s | 3,4 s |

El autor señala una ganancia del +45 % en gradiente de borde a cambio de aproximadamente 4 veces el tiempo, y que recupera sujetos que la variante 512 pierde por completo (una imagen devuelve matte vacío a 512 y un 18,4 % de primer plano a 1024). Queda una advertencia abierta: el `softEdgeRatio` de producto es 0,01030 frente a un control de 0,01574 (un 35 % inferior), lo que bajo una guarda anti-aliasing podría indicar un borde más duro y no necesariamente mejor. El autor pide tratar el +45 % como indicación fuerte, no como resultado cerrado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,1 GB y los pesos están en fp16, pero el grafo a 1024 genera buffers intermedios grandes que motivaron el parcheo.
- GPU recomendadas: cualquier adaptador que exponga WebGPU con `maxStorageBuffersPerShaderStage >= 8`; el autor no especifica modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada por el autor; depende del soporte WebGPU del navegador y del adaptador, no de la VRAM de escritorio.
- Opciones de despliegue: transformers.js con `device: 'webgpu'` y `model_file_name: 'model_fp16'`; también ejecutable en CPU EP (usado para verificación y mediciones de calidad).
- Latencia y throughput: 3,4 s por imagen a 1024 en WebGPU y 0,85 s a 512 en el mismo conjunto de prueba; el autor no publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Resolución | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BiRefNet-lite-1024-webgpu (este) | 1024x1024 | no disponible | no aplica | MIT | Hugging Face, ONNX + transformers.js |
| BiRefNet-lite-512 | 512x512 | no disponible | no aplica | MIT (upstream) | Hugging Face, ONNX |
| ZhengPeng7/BiRefNet_lite | no disponible | no disponible | no aplica | MIT | Hugging Face, PyTorch |

La comparación se limita a variantes de la misma familia porque la información proporcionada no incluye otros modelos de matting. Frente a la variante 512, este modelo ofrece mayor detalle de borde a costa de unas 4 veces más tiempo; frente al modelo base en PyTorch, la diferencia es el formato ONNX y el parcheo para WebGPU, no la calidad de los pesos.

## Limitaciones y advertencias

- Solo segmentación de imagen: no genera texto, no razona y no soporta herramientas ni agentes.
- La salida son logits; interpretarla como imagen 0-255 produce resultados incorrectos. Hay que aplicar sigmoid.
- Requiere un adaptador con `maxStorageBuffersPerShaderStage >= 8`; en adaptadores que no lo cumplan, el grafo no compila.
- Los pesos están en fp16; cargarlos con `dtype: 'fp32'` en transformers.js es un ajuste para evitar el sufijo automático, no una conversión real.
- La ganancia de calidad del +45 % no está plenamente validada: la métrica de `softEdgeRatio` sugiere que parte del beneficio podría ser un borde más duro. Hay que remedir en el pipeline propio.
- Las cifras de calidad y de tiempo provienen de ejecuciones distintas (CPU EP frente a WebGPU); no hay prueba de que ambos caminos produzcan salidas idénticas.
- Riesgo de sesgos y alucinaciones: no evaluado en la información disponible; al ser un modelo de segmentación, el fallo típico es una máscara incorrecta o vacía en sujetos difíciles, no una alucinación textual.
- Licencia MIT, sin restricciones conocidas para uso comercial; conviene verificar la licencia del modelo base upstream.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/namiklee/birefnet-lite-1024-webgpu
- Modelo base: https://huggingface.co/ZhengPeng7/BiRefNet_lite
- Servicio de producción del autor: https://backgroundless.io
- Scripts de parcheo: incluidos en el repositorio, carpeta `scripts/` (MIT)
- Paper de BiRefNet: no disponible en la información proporcionada

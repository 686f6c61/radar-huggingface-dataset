# gustavecortal/imagevolve-clip-vit-base-patch32

## Resumen

imagevolve-clip-vit-base-patch32 es una redistribución optimizada de los pesos de CLIP ViT-B/32 de OpenAI, publicada por el desarrollador gustavecortal como parte del proyecto imagevolve, una herramienta de búsqueda evolutiva guiada por CLIP que se ejecuta íntegramente en el navegador. No se trata de un modelo nuevo ni de un fine-tuning: son los mismos pesos de CLIP ViT-B/32 exportados a ONNX y cuantizados para su uso en ONNX Runtime Web sobre WebGPU o WebAssembly.

El modelo resuelve un problema concreto de despliegue: ejecutar la puntuación imagen-texto de CLIP en el cliente con latencia y tamaño reducidos. Para ello parte de la exportación ONNX de Xenova y aplica dos modificaciones propias: la tabla de tokens del modelo de texto se almacena en int8 con escala fp16 por fila (47,3 MB frente a 72,5 MB), y una copia del modelo de visión acepta imágenes de 160 píxeles en lugar de 224, lo que reduce a la mitad el coste por imagen.

La relevancia es acotada pero clara para quien necesite CLIP en el navegador: el autor reporta unos 1.100 variantes puntuadas por segundo en una GPU de gama media-alta, correlación de 0,995 como mínimo con las puntuaciones del CLIP original sobre 3.600 fotografías transformadas y 16 frases, y 2,1 ms por imagen en WebGPU con lotes de 32. La licencia es MIT, heredada de CLIP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ViT-B/32 (CLIP: codificador de visión ViT + codificador de texto) |
| Parametros totales | no disponible (el modelo base CLIP ViT-B/32 ronda los 151 M, dato no confirmado en la información proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de texto CLIP con límite de 77 tokens, dato no confirmado en la información proporcionada) |
| Tipos de cuantizacion | q4f16 (4 bits pesos, 16 bits activaciones), q8a4 (8 bits pesos, 4 bits activaciones en MatMulNBits), tabla de tokens en int8 con escala fp16 por fila; exportaciones fp32 de referencia |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (onnxruntime-web, WebGPU y WebAssembly); tokenizer.json y tokenizer_config.json |

## Arquitectura y entrenamiento

La arquitectura subyacente es CLIP ViT-B/32 de OpenAI, un modelo de alineación imagen-texto con un codificador de visión basado en Vision Transformer con parches de 32×32 y un codificador de texto transformer, entrenado con aprendizaje contrastivo sobre pares imagen-texto. Esta publicación no reentrena ni ajusta el modelo: redistribuye la exportación ONNX de Xenova con modificaciones de cuantización y de resolución de entrada.

Los cambios técnicos documentados son tres. Primero, la tabla de tokens del modelo de texto (49.408 × 512) pasa a int8 con una escala fp16 por fila, implementada como un Gather de filas int8, un Cast a fp16 y una multiplicación por la escala, todo con operadores ONNX estándar. Segundo, se genera una copia del modelo de visión para entrada de 160×160 píxeles: la rejilla de 7×7 de embeddings posicionales se redimensiona bilinealmente a 5×5 y los reshapes se ajustan a 26 tokens; este modelo de 160 píxeles no fue reentrenado. Tercero, se añade una copia de visión en 8 bits (q8a4) construida desde la exportación fp32, con cada MatMul en 8 bits mediante MatMulNBits (bloque 32, simétrico) calculado en int8 con nivel de precisión 4, que evita la necesidad de floats de 16 bits en los shaders.

No se documenta ningún proceso de RLHF, DPO ni ajuste adicional. La fidelidad de las modificaciones se mide empíricamente: los embeddings de texto de tres frases de prueba alcanzan un coseno de 0,9998 o superior con el original, tanto en Node como en navegador sobre ambos backends.

## Capacidades

- Puntuación de similitud imagen-texto mediante embeddings contrastivos de CLIP (visión y texto).
- Extracción de embeddings de imagen y de texto por separado.
- Clasificación zero-shot por comparación de embeddings con descripciones textuales.
- Búsqueda y ranking de variantes de imagen según una dirección semántica definida por texto.
- Ejecución en navegador sobre WebGPU y WebAssembly mediante ONNX Runtime Web.
- Inferencia por lotes con puntuaciones independientes del tamaño de lote (verificado por el autor).
- No soporta tool calling, function calling, agentes, generación de texto libre, razonamiento multi-paso, visión generativa, audio ni modo thinking.

## Casos de uso

- Edición de imágenes guiada por texto en el navegador: el modelo puntúa variantes de una fotografía (mezclas de teselas, remolinos, recoloreados) según cuánto se acercan al texto objetivo, permitiendo búsqueda evolutiva sin servidor ni subida de datos.
- Búsqueda semántica de imágenes en aplicaciones web: los embeddings de visión permiten indexar y recuperar imágenes por descripción textual directamente en el cliente, con la latencia de 2,1 ms por imagen en WebGPU.
- Filtrado y moderación de contenido en el cliente: comparar imágenes contra descripciones textuales para clasificación zero-shot sin enviar contenido a un backend.
- Herramientas creativas offline-first: aplicaciones de retoque o generación de variantes que funcionan sin conexión gracias a WebAssembly, con 24-45 ms por imagen en CPU según la variante.
- Prototipado rápido de pipelines multimodales: la exportación ONNX y los ficheros de tokenizador permiten integrar CLIP en Node o en el navegador sin infraestructura GPU dedicada.
- Investigación sobre búsqueda evolutiva: el modelo sirve como función de fitness barata para experimentos de optimización de transformaciones de imagen, con 1.100 variantes por segundo en una GPU de 350 dólares.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Coseno de embeddings de texto vs original (3 frases) | ≥ 0,9998 (Node y navegador, ambos backends) |
| Correlación de puntuaciones de dirección vs original (3.600 fotos, 16 frases) | ≥ 0,995 en el peor caso |
| Correlación del modelo de visión q8a4 160 px vs fp32 160 px (80 fotos, 3 frases, Node) | 0,998 en la mediana, 0,994 en el peor caso |
| Correlación del modelo de visión q4f16 160 px vs fp32 160 px | 0,857 en la mediana, 0,769 en el peor caso |
| Correlación del modelo de 160 px vs modelo de 224 px | 0,79 en la mediana |
| Latencia WebGPU, lotes de 32 (Intel Arc A770) | 2,1 ms/imagen (q8a4) frente a 2,3 ms/imagen (q4f16) |
| Latencia WebAssembly (Intel i5-14400F, 8 hilos) | 24 ms/imagen (q8a4 reescrito a activaciones int8) frente a 44 ms/imagen |
| Latencia WebAssembly del modelo de 160 px (Edge, Intel i5-14400F) | 45 ms/imagen frente a 71 ms/imagen del de 224 px |
| Throughput en WebGPU (GPU de 350 dólares) | ~1.100 variantes puntuadas por segundo |
| Preferencia de revisión ciega del modelo de 160 px | Preferido en 4 de 6 casos, 1 empate |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, dado que CLIP no es un modelo generativo evaluado con esas métricas.

## Requisitos de hardware

- Tamaño del repositorio: 0,3 GB, con varios ficheros ONNX alternativos; en producción solo se carga el subconjunto necesario.
- VRAM estimada: no disponible de forma explícita; el modelo de visión q8a4 de 160 px está diseñado para ejecutarse en GPU integradas y discretas de gama media, y el modelo de texto ocupa 47,3 MB en int8.
- GPU recomendadas: cualquier GPU con soporte WebGPU; el autor cita Intel Arc A770 y una GPU de 350 dólares sin especificar modelo.
- Cabe en GPU de consumo: sí, por el tamaño reducido de los pesos y el enfoque en navegador.
- Opciones de despliegue: ONNX Runtime Web sobre WebGPU o WebAssembly; también ejecutable en Node con ONNX Runtime.
- Latencia y throughput: 2,1 ms/imagen en WebGPU (lotes de 32), 24-45 ms/imagen en WebAssembly según variante y CPU, ~1.100 variantes/s en WebGPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| imagevolve-clip-vit-base-patch32 | no disponible (base CLIP ViT-B/32) | no disponible | ONNX (WebGPU/WASM) | MIT | CLIP cuantizado para navegador, con variante de 160 px |
| openai/clip-vit-base-patch32 | no disponible (base CLIP ViT-B/32) | no disponible | PyTorch (safetensors/bin) | MIT | Modelo original de referencia |
| Xenova/clip-vit-base-patch32 | no disponible (base CLIP ViT-B/32) | no disponible | ONNX | MIT | Exportación ONNX de referencia para transformers.js |
| SigLIP (variantes base) | no disponible | no disponible | safetensors/ONNX | no disponible | Alternativa de alineación imagen-texto con pérdida sigmoide |

La comparación con alternativas de la misma tarea se limita a las variantes de exportación del mismo CLIP; no se dispone de datos de rendimiento de SigLIP u otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, código ni respuestas; solo embeddings y puntuaciones de similitud.
- El modelo de 160 píxeles no fue reentrenado y su correlación con el de 224 píxeles es de 0,79 en la mediana, por lo que puede degradar la calidad en tareas sensibles a la resolución.
- La cuantización q4f16 del modelo de visión muestra una correlación notablemente inferior (0,857 mediana, 0,769 peor caso) frente al fp32; el autor recomienda la variante q8a4 para mayor fidelidad.
- Los sesgos de CLIP original (asociaciones demográficas y culturales aprendidas de los datos de entrenamiento) se heredan sin mitigación.
- Los idiomas soportados no están documentados; el comportamiento multilingüe del codificador de texto no se detalla.
- No se documentan límites de contexto del codificador de texto en esta publicación.
- La licencia MIT permite uso comercial, pero el usuario debe verificar las condiciones de los ficheros de Xenova y de OpenAI subyacentes.
- Dependencia de WebGPU o WebAssembly: el rendimiento varía significativamente entre navegadores, backends y hardware; las cifras reportadas corresponden a configuraciones concretas.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria independiente de los resultados reportados por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gustavecortal/imagevolve-clip-vit-base-patch32
- Proyecto imagevolve: https://gustavecortal.com/imagevolve/
- Exportación ONNX de referencia (Xenova): https://huggingface.co/Xenova/clip-vit-base-patch32
- CLIP original de OpenAI: https://huggingface.co/openai/clip-vit-base-patch32
- Repositorio de CLIP: https://github.com/openai/CLIP
- Demo en vídeo: https://huggingface.co/gustavecortal/imagevolve-clip-vit-base-patch32/resolve/main/demo.mp4

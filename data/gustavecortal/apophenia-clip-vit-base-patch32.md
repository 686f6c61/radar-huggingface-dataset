# gustavecortal/apophenia-clip-vit-base-patch32

## Resumen

`apophenia-clip-vit-base-patch32` es una exportación a ONNX del codificador CLIP ViT-B/32 de OpenAI, publicada por el usuario gustavecortal para el proyecto apophenia, una aplicación que ejecuta CLIP directamente en el navegador mediante ONNX Runtime Web sobre WebGPU o WebAssembly. No es un modelo entrenado desde cero: es un artefacto de despliegue derivado de la exportación de Xenova (`Xenova/clip-vit-base-patch32`) del CLIP original, cuantizada en q4f16 (pesos de 4 bits, activaciones de 16 bits).

La única modificación respecto al export de Xenova afecta al modelo de texto: la tabla de tokens (49.408 × 512) se almacena en int8 con una escala fp16 por fila, lo que reduce el fichero de 72,5 MB a 47,3 MB. El modelo de visión se mantiene sin cambios. El resultado es un par de ficheros ONNX que ocupan unos 0,1 GB en total y permiten calcular embeddings de imagen y de texto en el propio cliente, sin enviar datos a un servidor.

Su interés es fundamentalmente práctico: demuestra que CLIP puede ejecutarse íntegramente en el dispositivo con una pérdida de fidelidad medida y muy pequeña, lo que habilita búsqueda visual, clasificación zero-shot y moderación de contenido en aplicaciones web sin backend de inferencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CLIP ViT-B/32: torre de visión ViT-B/32 (parches de 32×32, entrada 224×224) y torre de texto tipo transformer; ambas exportadas a ONNX |
| Parámetros totales | ~151 M en el modelo base `openai/clip-vit-base-patch32` (dato de la arquitectura pública del modelo base; no indicado en la model card) |
| Longitud de contexto | 77 tokens en el encoder de texto (límite de CLIP; no indicado en la model card) |
| Tipos de cuantización | q4f16 (pesos int4, activaciones fp16); tabla de tokens del modelo de texto en int8 con escala fp16 por fila |
| Idiomas soportados | no disponible; el modelo base se entrenó principalmente con pares imagen-texto en inglés |
| Licencia | MIT |
| Formato de pesos | ONNX (onnxruntime): `onnx/vision_model_q4f16.onnx`, `onnx/text_model_q4f16_t8.onnx`; tokenizador en `tokenizer.json` y `tokenizer_config.json` |
| Tamaño del repositorio | 0,1 GB |
| Tamaño del modelo de texto | 47,3 MB (frente a 72,5 MB en el export de Xenova) |
| Tamaño del modelo de visión | sin cambios respecto al export de Xenova; tamaño no especificado en la model card |
| Backends validados | ONNX Runtime Web (WebGPU y WebAssembly) y Node |

## Arquitectura y entrenamiento

CLIP es un codificador dual con entrenamiento contrastivo: una torre de visión ViT-B/32 y una torre de texto transformer proyectan imágenes y frases a un espacio vectorial compartido, de forma que la similitud coseno entre ambos embeddings mide su afinidad. Según la documentación pública del modelo base, OpenAI lo entrenó con aproximadamente 400 millones de pares imagen-texto extraídos de la web, sin supervisión humana por pares y con un objetivo contrastivo a escala de lote. Este repositorio no reentrena ni ajusta nada: solo transforma los pesos ya exportados.

La innovación técnica del artefacto es la compresión de la tabla de embeddings del tokenizador del modelo de texto. En lugar de guardar 49.408 filas de 512 dimensiones en fp16, se guardan en int8 y se aplica una escala fp16 por fila; la consulta se resuelve con operadores ONNX estándar (Gather de filas int8, Cast a fp16 y multiplicación por la escala). Según el autor, para tres frases de prueba los embeddings de texto resultantes mantienen un coseno de 0,9998 o más con los del modelo original, tanto en Node como en navegador y en ambos backends; sobre 3.600 fotografías transformadas y 16 frases, las puntuaciones que calcula apophenia siguen a las del original con una correlación de 0,995 en el peor caso, y se aproximan a fp32 tanto como el propio original.

## Capacidades

- Generación de embeddings de imagen a partir de entradas de 224×224 píxeles.
- Generación de embeddings de texto para frases de hasta 77 tokens.
- Similitud imagen-texto en un espacio compartido, base de la clasificación zero-shot y de la recuperación multimodal.
- Clasificación zero-shot sin reentrenamiento: basta con definir las clases mediante prompts de texto.
- Búsqueda y recuperación imagen-texto e imagen-imagen por similitud coseno.
- Ejecución en el cliente: WebGPU para aceleración por GPU y WebAssembly como alternativa en CPU.
- No dispone de generación de texto, tool calling, capacidades de agente, razonamiento multi-paso, visión generativa ni modo de pensamiento. Es un modelo de representación, no un modelo generativo.
- Capacidades multilingües: no documentadas; el modelo base está sesgado hacia el inglés.

## Casos de uso

- Búsqueda visual en el navegador sobre una fototeca local: se indexan los embeddings de las imágenes en el cliente y se consulta con texto; ninguna fotografía sale del dispositivo, lo que simplifica el cumplimiento de RGPD.
- Clasificación zero-shot previa a la subida de un fichero: el modelo etiqueta la imagen en el formulario (por ejemplo, comprobar que la foto corresponde a un documento de identidad) antes de transmitirla al servidor.
- Moderación en el dispositivo: se comparan los embeddings de la imagen con un conjunto de prompts de contenido no permitido y se bloquea el envío si la similitud supera un umbral ajustado por dominio.
- Análisis de dirección visual, como en apophenia: se proyectan imágenes sobre ejes semánticos definidos con frases y se obtienen puntuaciones de afinidad reproducibles.
- Deduplicación y agrupación de imágenes: los embeddings sirven para clustering por similitud coseno en colecciones grandes sin coste de inferencia en servidor.
- Aplicaciones web progresivas sin conectividad: la variante WebAssembly funciona sin GPU y sin red, útil en entornos con hardware modesto.
- Accesibilidad: elegir entre varias descripciones alternativas candidatas la que mayor similitud presenta con la imagen, como ayuda a la revisión humana de textos alternativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K y similares) en la información disponible, y ninguno de ellos es aplicable a un codificador dual como CLIP. El autor sí reporta métricas de fidelidad frente al modelo original:

| Métrica | Valor reportado |
|---|---|
| Similitud coseno de embeddings de texto frente al original (3 frases de prueba) | ≥ 0,9998 |
| Correlación de las puntuaciones de apophenia frente al original (3.600 fotografías transformadas, 16 frases) | ≥ 0,995 en el peor caso |
| Evaluación en Node y en navegador, con WebGPU y WebAssembly | sí |
| Tamaño del modelo de texto | 47,3 MB (frente a 72,5 MB) |
| Precisión frente a fp32 | el autor indica que sigue a fp32 tan de cerca como el modelo original |

## Requisitos de hardware

- VRAM estimada: no disponible como cifra publicada. Los pesos suman 0,1 GB, por lo que el modelo cabe holgadamente en cualquier GPU consumer; la memoria de trabajo la determinan el grafo ONNX y las activaciones, no los pesos.
- GPU recomendadas: cualquier GPU con soporte de WebGPU (integradas incluidas) para la ruta acelerada; el modelo también funciona en CPU vía WebAssembly.
- Cabe en GPU consumer: sí, sin requisitos relevantes; también en portátiles y dispositivos móviles con WebGPU o WASM.
- Opciones de despliegue: ONNX Runtime Web (WebGPU y WebAssembly) y onnxruntime en Node. Los ficheros usan operadores ONNX estándar (Gather, Cast, Mul), por lo que son portables a otros runtimes ONNX, aunque el autor solo valida los citados.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de texto | Formato y tamaño | Licencia | Notas |
|---|---|---|---|---|---|
| `gustavecortal/apophenia-clip-vit-base-patch32` | ~151 M (modelo base) | 77 tokens | ONNX q4f16; texto de 47,3 MB | MIT | Tabla de tokens en int8; validado en navegador |
| `Xenova/clip-vit-base-patch32` | ~151 M (modelo base) | 77 tokens | ONNX q4f16; texto de 72,5 MB | MIT | Export de referencia del que deriva este repositorio |
| `openai/clip-vit-base-patch32` | ~151 M | 77 tokens | PyTorch fp32, ~600 MB (derivado de los parámetros) | MIT | Pesos originales; no apto para ejecución en navegador |
| `google/siglip-base-patch16-224` | no disponible | no disponible | no disponible | Apache 2.0 | Familia alternativa de codificador dual; no hay datos de rendimiento en la información disponible |

No se dispone de comparaciones de rendimiento medidas entre estas opciones en la información proporcionada; la comparación relevante aquí es de empaquetado y de fidelidad respecto al original, no de precisión en tareas downstream.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, descripciones ni respuestas. Cualquier caso de uso que requiera generación necesita otro modelo.
- Ventana de texto de 77 tokens: las frases largas se truncan, lo que degrada la representación de prompts extensos.
- Resolución de entrada de 224×224 con parches de 32×32: poco detalle para texto pequeño, objetos diminutos o imágenes muy densas.
- Sesgo lingüístico hacia el inglés en el modelo base; el rendimiento en castellano no está documentado y previsiblemente será inferior al obtenido en inglés.
- La cuantización introduce una degradación pequeña pero real. La validación publicada se apoya en 3 frases y en 3.600 imágenes transformadas con 16 frases, una cobertura limitada que no garantiza el mismo comportamiento en todos los dominios.
- Los embeddings de CLIP no están calibrados como probabilidades: los umbrales de similitud deben ajustarse por dominio y validarse con datos propios.
- Sesgos heredados del corpus web de entrenamiento de CLIP (género, raza, cultura, estereotipos); el filtrado del modelo base no los elimina.
- Repositorio con 0 descargas y 0 likes: sin validación independiente por parte de la comunidad. Los metadatos indican una fecha de creación de 2026-10-19, un dato que conviene verificar antes de fijar la dependencia en producción.
- Licencia MIT, que permite uso comercial; conviene mantener la atribución a OpenAI, a Xenova y al autor del export.
- En despliegues de servidor con recursos suficientes no aporta ventajas frente al export estándar de Xenova; su valor está en el despliegue en cliente con restricciones de tamaño.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gustavecortal/apophenia-clip-vit-base-patch32
- Proyecto apophenia: https://gustavecortal.com/apophenia/
- Export de referencia de Xenova: https://huggingface.co/Xenova/clip-vit-base-patch32
- CLIP original de OpenAI en HuggingFace: https://huggingface.co/openai/clip-vit-base-patch32
- Repositorio de CLIP en GitHub: https://github.com/openai/CLIP
- Paper de CLIP: https://arxiv.org/abs/2103.00020
- Documentación de ONNX Runtime Web: https://onnxruntime.ai/docs/tutorials/web/

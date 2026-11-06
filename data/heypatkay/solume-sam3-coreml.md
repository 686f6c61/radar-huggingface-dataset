# heypatkay/solume-sam3-coreml

## Resumen

solume-sam3-coreml es una conversión a Core ML del modelo SAM 3 (Segment Anything with Concepts) de Meta AI, publicada por el desarrollador heypatkay para la aplicación de fotografía Solume en macOS. SAM 3 es un modelo de segmentación de imágenes guiado por conceptos: el usuario describe lo que quiere seleccionar con lenguaje natural ("el cielo", "el coche rojo", "todas las farolas") y el modelo devuelve máscaras de todas las instancias que coinciden. Esta conversión empaqueta únicamente el modelo de imagen (no el tracker de vídeo de SAM 3) en tres programas Core ML en fp16: codificador de imagen, codificador de texto y detector.

El interés de esta ficha es doble. Por un lado, documenta un caso real de conversión de un modelo de visión de gran tamaño a Core ML para ejecución local en Apple Silicon, con un proceso de exportación reproducible byte a byte. Por otro lado, sirve como referencia de las restricciones de la licencia SAM de Meta, que impone condiciones sobre uso militar, control de exportaciones, ingeniería inversa y atribución en publicaciones.

El repositorio ocupa 1,7 GB y contiene los pesos convertidos, el tokenizador CLIP y la licencia. No se han publicado datos de rendimiento ni benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de visión (ViT) + torre de texto CLIP + detector de conceptos; exportado como tres ML Programs Core ML |
| Parámetros totales | no disponible (pesos originales de 3.439.938.512 bytes en safetensors) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión); entrada de texto limitada a 32 tokens CLIP |
| Tipos de cuantización | fp16 (pesos convertidos de safetensors a Core ML fp16) |
| Idiomas soportados | no disponible (el prompt de texto usa tokenizador CLIP BPE) |
| Licencia | SAM License (Meta), última actualización 19 de noviembre de 2025 |
| Formato de pesos | mlpackage (Core ML ML Program); pesos originales en safetensors |
| Resolución de entrada de imagen | 1×3×1008×1008 RGB |
| Entrada de texto | input_ids y attention_mask de 1×32 (int32, CLIP BPE) |
| Salidas del detector | masks 1×200×288×288 (logits), boxes 1×200×4, logits 1×200, presence 1×1, semantic 1×1×288×288 |
| Tamaño del repositorio | 1,7 GB |
| Librería | coreml |
| Pipeline | mask-generation |

## Arquitectura y entrenamiento

SAM 3 (Segment Anything with Concepts) es un modelo de segmentación de imágenes de Meta AI que combina un codificador de imagen tipo ViT con una torre de texto CLIP y un detector de conceptos. La conversión de Solume reproduce esta arquitectura en tres paquetes Core ML independientes. El codificador de imagen recibe una imagen RGB de 1008×1008 y produce tres mapas de características FPN a resoluciones 288×288, 144×144 y 72×72, todos con 256 canales. El codificador de texto procesa hasta 32 tokens CLIP y produce embeddings de 32×256. El detector combina los mapas FPN y los embeddings de texto para generar hasta 200 máscaras candidatas de 288×288, sus cajas delimitadoras, logits de presencia y una máscara semántica global. La puntuación de cada consulta se calcula como sigmoid(logit) × sigmoid(presence).

La conversión se realizó con torch.export y coremltools 9.0 sobre transformers 5.22.0, sustituyendo los constructores de máscaras de atención de transformers por máscaras aditivas simples y replicando una vez los embeddings posicionales del ViT para que el grafo exporte. El resultado son tres ML Programs en fp16. El proceso es determinista: se fijan los identificadores del Manifest, se ordenan los mapas protobuf y se fija la fecha de conversión en los metadatos, de modo que cuatro conversiones el mismo día produjeron archivos idénticos byte a byte. No se ha realizado fine-tuning sobre los pesos originales; la única modificación es la conversión de formato y la división en tres paquetes. El tracker de vídeo de SAM 3 no está incluido.

## Capacidades

- Segmentación de imágenes guiada por texto: genera máscaras de todas las instancias que coinciden con una descripción en lenguaje natural.
- Detección de objetos con cajas delimitadoras (hasta 200 candidatas por imagen) y puntuaciones de confianza.
- Máscara semántica global de la imagen a resolución 288×288.
- Procesamiento de prompts de texto de hasta 32 tokens mediante tokenizador CLIP BPE.
- Ejecución local en Apple Silicon mediante Core ML, sin necesidad de GPU dedicada ni servicios en la nube.
- No incluye tool calling ni function calling.
- No incluye capacidades de agente ni razonamiento multi-paso.
- No incluye modo thinking, visión generativa, audio ni generación de texto.
- No incluye el tracker de vídeo de SAM 3; solo el modelo de imagen.

## Casos de uso

- Selección interactiva en aplicaciones de fotografía: la app Solume usa el modelo para que el usuario describa un objeto ("el cielo", "el coche rojo") y obtenga la máscara correspondiente sin dibujar a mano, aprovechando la ejecución local en macOS.
- Edición fotográfica por capas: separar sujetos y fondos descritos en lenguaje natural para aplicar ajustes selectivos de color, exposición o desenfoque en herramientas de retoque.
- Etiquetado y anotación de datasets de visión: generar máscaras iniciales para imágenes de entrenamiento a partir de descripciones textuales, reduciendo el trabajo manual de anotación en pipelines de datos.
- Moderación y análisis de contenido visual: localizar instancias concretas (armas, vehículos, personas) en imágenes mediante prompts de texto para revisión posterior por un operador.
- Automatización de flujos de trabajo en macOS: integrar el modelo en apps nativas o scripts que necesiten segmentación local sin enviar imágenes a servidores externos, con las ventajas de privacidad que ello implica.
- Investigación en visión por computador: usar la conversión Core ML como referencia reproducible para estudiar el comportamiento de SAM 3 en Apple Silicon y comparar la inferencia local con la versión PyTorch original.
- Prototipado de funciones de segmentación en apps macOS: el formato mlpackage y la verificación por SHA-256 permiten distribuir los pesos dentro de una app con integridad comprobable, como hace Solume.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Al ser Core ML, el modelo se ejecuta en Apple Silicon usando memoria unificada; el repositorio ocupa 1,7 GB y los pesos fp16 suman aproximadamente 1,6 GB entre los tres paquetes.
- GPU recomendadas: Apple Silicon (macOS 27, según la cadena de herramientas usada en la conversión). No se indica compatibilidad con GPU NVIDIA ni AMD.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con memoria unificada suficiente para cargar los tres mlpackage; no se especifica el mínimo exacto.
- Opciones de despliegue: Core ML (coremltools, mlpackage), integración nativa en apps macOS. No se indica soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Licencia | Formato |
|---|---|---|---|---|---|
| solume-sam3-coreml | SAM 3 convertido a Core ML | Imagen 1008×1008 + texto (32 tokens) | Hasta 200 máscaras, cajas, presencia, máscara semántica | SAM License | mlpackage (fp16) |
| facebook/sam3 | SAM 3 original en PyTorch | Imagen + texto | Máscaras y detecciones | SAM License | safetensors |
| Segment Anything (SAM original) | Segmentación por puntos y cajas | Imagen + puntos/cajas | Máscaras | Apache 2.0 (versión original) | safetensors, ONNX |
| Otros modelos de segmentación abierta | Segmentación por prompt | Imagen + prompt | Máscaras | variable | variable |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- La licencia SAM de Meta restringe el uso para actividades sujetas a ITAR, fines prohibidos por controles comerciales (uso militar o bélico, industrias nucleares, espionaje, desarrollo de armas) y prohíbe la ingeniería inversa o incitar a ella.
- Cualquier distribución de los archivos o de trabajos derivados debe hacerse bajo la SAM License e incluir una copia de la licencia.
- Las publicaciones de investigación que usen estos materiales deben reconocer el uso de SAM Materials, según la cláusula 1(b)(ii).
- El modelo solo incluye la parte de imagen de SAM 3; el tracker de vídeo no está incluido.
- La entrada de texto está limitada a 32 tokens CLIP, lo que restringe la complejidad de las descripciones.
- No se han publicado datos sobre sesgos, tasas de alucinación ni comportamiento en idiomas distintos del inglés; el tokenizador CLIP puede degradar el rendimiento con prompts en otros idiomas.
- El modelo no ha sido fine-tuneado; su comportamiento es el de los pesos originales de SAM 3 convertidos a fp16, con la posible pérdida de precisión asociada a la cuantización.
- La conversión está pensada para macOS y Apple Silicon; no se garantiza su funcionamiento en otras plataformas Core ML.
- El repositorio no contiene fotos ni datos de usuario, pero la app Solume descarga los archivos desde un commit fijado y verifica tamaño y SHA-256 antes de instalarlos.

## Enlaces

- [Hugging Face: heypatkay/solume-sam3-coreml](https://huggingface.co/heypatkay/solume-sam3-coreml)
- [Modelo base: facebook/sam3](https://huggingface.co/facebook/sam3)
- [Licencia SAM (incluida en el repositorio)](https://huggingface.co/heypatkay/solume-sam3-coreml/blob/main/LICENSE)

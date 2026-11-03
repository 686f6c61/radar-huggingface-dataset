# Sky-Kim/com.sky.sentis.marqo-fashion-siglip

## Resumen

Sky-Kim/com.sky.sentis.marqo-fashion-siglip es una conversión a Unity Inference Engine (Sentis) del modelo Marqo/marqo-fashionSigLIP, un ViT-B-16-SigLIP afinado por Marqo sobre datos de producto de moda. El paquete redistribuye los dos torres (visión y texto) como grafos Sentis en FP16, junto con el tokenizador y una clase C# autocontenida (`MarqoFashionSiglip.cs`) para ejecutar inferencia en dispositivo dentro de Unity, sin dependencias de Python ni servicios externos.

El modelo proyecta recortes de imagen y texto en inglés a un espacio compartido de 768 dimensiones, lo que permite búsqueda imagen-texto, clasificación zero-shot y ranking de recortes frente a descripciones fijas. Su caso de uso declarado es localizar personas en vídeo por lo que visten (por ejemplo, "a person wearing a red jacket"), aprovechando que el afinamiento se hizo sobre prendas y atributos de color.

Es relevante porque lleva un modelo SigLIP especializado en moda a un runtime de videojuego y aplicación interactiva (Unity Sentis 2.6.1), con pesos cuantizados a FP16 y un contrato de preprocesado y tokenización documentado con precisión. El autor advierte explícitamente de que el dominio de entrenamiento son fotos de producto de e-commerce y que los recortes CCTV de personas y vehículos quedan fuera de dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-B-16-SigLIP (torre de visión timm `vit_base_patch16_siglip_224` con MAP pooling + transformer de texto open_clip), exportado a ONNX y convertido a Sentis |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 64 tokens de texto (63 ids + `</s>`); imagen de entrada fija 224 x 224 |
| Tipos de cuantizacion | pesos FP16 (`ModelQuantizer.QuantizeWeights(Float16)`), cómputo en FP32 |
| Idiomas soportados | inglés únicamente (el texto en coreano se mapea a `<unk>`) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.sentis` (Unity Sentis), visión 185,0 MB y texto 220,8 MB; tokenizador `tokenizer.json` (2,4 MB) |
| Dimension del embedding | 768 |
| Tamano del repositorio | 0,4 GB |
| Libreria | unity-sentis |
| Pipeline | zero-shot-image-classification |

## Arquitectura y entrenamiento

El modelo base es Marqo/marqo-fashionSigLIP, un ViT-B-16-SigLIP afinado por Marqo sobre datos de producto de moda. La torre de visión es el `vit_base_patch16_siglip_224` de timm con MAP pooling; la torre de texto es el transformer de texto de open_clip. Ambas torres se exportaron por separado con `torch.onnx.export` (exportador TorchScript, opset 17, formas fijas, batch 1) desde open_clip 3.3.0, con la atención fusionada de timm y la ruta rápida de `nn.MultiheadAttention` desactivadas para permitir la exportación. Los grafos se importaron en Sentis 2.6.1 y los pesos se cuantizaron a FP16.

La normalización SigLIP `(x - 0.5) / 0.5` está incorporada en el grafo de visión, que espera RGB en [0, 1]. El texto pasa primero por el `canonicalize` de open_clip (unescape HTML, `_` a espacio, eliminación de puntuación ASCII, minúsculas y colapso de espacios) y después por el tokenizador SentencePiece unigram de SigLIP/T5 (32.100 tokens), con padding mediante `</s>` (id 1) hasta 64 posiciones. La torre de texto no tiene máscara causal y hace pooling de la última posición, por lo que el id de padding forma parte del contrato: rellenar con ceros produce embeddings distintos. No se añade plantilla de prompt; el llamante escribe la frase completa. El modelo se entrenó con pérdida contrastiva estilo softmax, no con el sesgo sigmoide de SigLIP; su `logit_scale.exp()` es 91,86 y su `logit_bias` es 0,0. No se dispone de datos sobre volumen de tokens ni composición exacta del dataset de afinamiento.

## Capacidades

- Embedding de imagen y texto en un espacio compartido de 768 dimensiones, con salidas normalizadas a longitud unitaria.
- Búsqueda imagen-texto y clasificación zero-shot mediante similitud coseno o `softmax(logit_scale * cosines)` sobre un conjunto de prompts.
- Ranking de recortes de imagen frente a descripciones fijas de prendas y colores.
- Detección de personas por atributos de vestimenta en fotogramas de vídeo, con recorte por cajas delimitadoras.
- Preprocesado en GPU con letterboxing (aspecto preservado, centrado sobre gris 0,5) y una lectura asíncrona por fotograma mediante `AsyncGPUReadback`.
- Ejecución en dispositivo dentro de Unity con backend `GPUCompute`, con retroceso a CPU si no hay compute shaders.
- Tokenización en C# mediante `Unity.InferenceEngine.Tokenization` con el parser de Hugging Face.
- No soporta tool calling, agentes, razonamiento multi-paso, generación de texto, visión general ni audio: es un modelo de embedding de doble torre.

## Casos de uso

- Búsqueda de personas por vestimenta en archivos de vídeo: se detectan cajas de persona por fotograma, se recortan con `EmbedCropsAsync` y se comparan contra un embedding de texto como "a person wearing a red jacket"; el modelo está afinado sobre prendas y colores, que es su dominio fuerte.
- Clasificación zero-shot de recortes de moda: se precalculan embeddings de un conjunto cerrado de descripciones (tipo de prenda, color) y se asigna a cada recorte la de mayor similitud coseno, útil en catálogos o inventarios.
- Etiquetado y filtrado de imágenes en herramientas de edición o motores de juego: el paquete se integra como clase C# en Unity y permite puntuar recortes sin salir del runtime ni llamar a un servicio externo.
- Ranking de resultados en un buscador de moda: se indexan embeddings de producto y se ordenan por similitud frente a la consulta en lenguaje natural, con la ventaja de que el coste de texto se paga una vez por consulta.
- Moderación o verificación de atributos visuales: comprobar si un recorte coincide con una descripción declarada (por ejemplo, color de una prenda) usando comparación relativa entre candidatos en lugar de umbrales absolutos.
- Prototipado de recuperación multimodal en aplicaciones interactivas: el modelo cabe en un repositorio de 0,4 GB y los grafos FP16 (185 MB visión, 220,8 MB texto) permiten iterar en dispositivos con recursos limitados.
- Análisis de catálogo con descripciones controladas: agrupar productos por descripciones canónicas y detectar desviaciones entre la ficha textual y la imagen, siempre dentro de fotos de producto bien iluminadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente reporta comprobaciones cualitativas: en recortes CCTV el modelo sigue situando el recorte correcto en primer lugar, pero con márgenes de similitud finos (a menudo 0,02 a 0,05) y cosenos brutos de aproximadamente 0,08 a 0,14 para una coincidencia. No se proporcionan cifras de MMLU, HumanEval, GSM8K ni métricas de recuperación (Recall@k) sobre datasets públicos.

## Requisitos de hardware

- VRAM estimada: los pesos suman aproximadamente 406 MB en FP16 (185,0 MB visión + 220,8 MB texto); el cómputo en FP32 y los búferes intermedios elevan el consumo, aunque cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con compute shaders compatible con Unity Sentis (por ejemplo, RTX 3060 o superior para margen cómodo); sin compute shaders, el backend cae a CPU.
- Cabe en GPU de consumo: sí, dado el tamaño reducido de los grafos y la entrada fija de 224 x 224 con batch 1.
- Opciones de despliegue: Unity Sentis 2.6.1 como runtime principal; no se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no se publican cifras absolutas; la clase expone `LastCropsMs` con el tiempo de reloj de la última llamada a `EmbedCropsAsync`. El diseño procesa un recorte por fotograma y usa `AsyncGPUReadback` para no bloquear el hilo principal. `EmbedText` es bloqueante y debe llamarse una vez por consulta, no por fotograma.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Dominio | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| Sky-Kim/com.sky.sentis.marqo-fashion-siglip | no disponible (ViT-B-16) | 64 tokens de texto; 224 x 224 | Moda (e-commerce) | Apache-2.0 | Sentis FP16, paquete Unity |
| Marqo/marqo-fashionSigLIP | no disponible (ViT-B-16) | 64 tokens de texto; 224 x 224 | Moda (e-commerce) | Apache-2.0 | safetensors / open_clip |
| CLIP genérico (ViT-B/16) | no disponible | 77 tokens de texto; 224 x 224 | Escenas y objetos generales | no disponible en esta ficha | múltiples (ONNX, open_clip, etc.) |
| SigLIP base (ViT-B-16) | no disponible | 64 tokens de texto; 224 x 224 | Uso general | no disponible en esta ficha | múltiples |

La comparación relevante es con el modelo base original: esta conversión mantiene el espacio de 768 dimensiones y el comportamiento de ranking, pero cambia el preprocesado de visión (letterboxing en lugar de squash bicúbico) y limita la ejecución a batch 1 y entrada fija. Frente a un CLIP genérico, el autor indica que este modelo es preferible para prendas y atributos de color, mientras que un CLIP general rinde mejor en descripciones de escena o pose ("a person walking").

## Limitaciones y advertencias

- Dominio restringido: afinado sobre fotos de producto de e-commerce (prendas aisladas o modelos sobre fondos lisos); los recortes CCTV pequeños, de baja resolución y oblicuos de personas y vehículos quedan fuera de dominio y producen márgenes de similitud finos.
- Umbrales absolutos frágiles: los cosenos brutos son pequeños (0,08 a 0,14 en recortes CCTV), por lo que conviene comparar candidatos entre sí o aplicar `softmax(logit_scale * cosines)` en lugar de fijar un corte.
- Solo inglés: el texto en otros idiomas, como el coreano, se mapea a `<unk>`; no hay soporte multilingüe.
- Contexto de texto muy corto (64 tokens) y sin plantilla de prompt: el llamante debe escribir la frase completa y descriptiva.
- Contrato de padding estricto: rellenar con `</s>` (id 1) es obligatorio; usar ceros altera los embeddings.
- Preprocesado distinto del original: el letterboxing preserva proporciones pero no reproduce el squash bicúbico del modelo base, lo que puede introducir diferencias frente a resultados obtenidos con open_clip.
- No se porta `ftfy.fix_text` del pipeline original; solo se corrige mojibake, por lo que textos con codificaciones dañadas pueden comportarse de forma distinta.
- Riesgo de alucinación en el sentido de falsos positivos: al ser un modelo de similitud, siempre devuelve un ranking aunque ningún candidato sea relevante; se requiere lógica de rechazo externa.
- Sesgos: no se documentan evaluaciones de sesgo; al estar entrenado sobre catálogo de moda comercial, puede reflejar sesgos de ese corpus en atributos de vestimenta y presentación.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento fuera del dominio declarado; el repositorio tiene 0 descargas y 0 likes, sin validación comunitaria.
- El paquete depende de Unity Sentis 2.6.1 y de la API `Unity.InferenceEngine.Tokenization`; la carpeta `Models~` no se importa automáticamente en Unity y hay que pasar su ruta absoluta a `Load` o copiar los ficheros a `StreamingAssets`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sky-Kim/com.sky.sentis.marqo-fashion-siglip
- Modelo base: https://huggingface.co/Marqo/marqo-fashionSigLIP
- Repositorio open_clip: https://github.com/mlfoundations/open_clip
- timm (torre de visión): https://github.com/huggingface/pytorch-image-models
- Unity Sentis: https://unity.com/products/sentis
- Paper de SigLIP: no disponible en la informacion proporcionada
- Blog o demo de Marqo: no disponible en la informacion proporcionada

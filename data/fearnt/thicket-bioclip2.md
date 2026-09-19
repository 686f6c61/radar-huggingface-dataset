# fearnt/thicket-bioclip2

## Resumen

thicket-bioclip2 es una conversión para dispositivos móviles del codificador de imágenes de BioCLIP 2, el modelo de visión y lenguaje desarrollado por Imageomics para la identificación taxonómica de seres vivos a partir de fotografías. El autor de la conversión, fearnt, ha empaquetado únicamente el encoder visual en dos formatos: Core ML para iOS y LiteRT / TensorFlow Lite para Android, ambos con pesos de 8 bits. El artefacto forma parte de la aplicación Thicket, que identifica aves a partir de fotos tomadas en el propio teléfono.

Cada fichero acepta una imagen RGB de 224 × 224 píxeles, normalizada con la media y la desviación típica de BioCLIP 2, y devuelve un embedding unitario de 768 dimensiones. La identificación se realiza comparando ese embedding con los embeddings de texto de las especies que la aplicación incorpora por su cuenta; por tanto, esta conversión no incluye codificador de texto, tokenizador ni vocabulario.

Su relevancia es práctica: demuestra que un modelo contrastivo de imagen y texto orientado a biodiversidad puede ejecutarse íntegramente en el dispositivo, sin conexión y sin coste de inferencia en servidor. El repositorio, publicado el 19 de septiembre de 2026, no acumula descargas ni valoraciones, por lo que debe considerarse un artefacto experimental y no una conversión consolidada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Codificador de imagen contrastivo tipo CLIP derivado de imageomics/bioclip-2; el backbone concreto no se detalla en la model card |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (encoder de imagen con entrada fija de 224 × 224 píxeles; no procesa texto) |
| Tipos de cuantización | 8 bits (int8) en ambos artefactos; no se ofrecen otras precisiones |
| Idiomas soportados | no aplica al encoder de imagen; la cobertura idiomática depende de los embeddings de texto que utilice la aplicación consumidora |
| Licencia | MIT |
| Formato de pesos | Core ML (.mlpackage comprimido en ZIP) y LiteRT / TensorFlow Lite (.tflite) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado desde cero ni de un ajuste fino, sino de una conversión de formato con cuantización a 8 bits del codificador de imagen de BioCLIP 2. Según el título del artículo asociado (BioCLIP 2: Emergent Properties from Scaling Hierarchical Contrastive Learning, NeurIPS 2025), el entrenamiento original se basa en aprendizaje contrastivo a gran escala sobre una jerarquía taxonómica, lo que permite alineación entre imágenes y conceptos de especie organizados jerárquicamente. La model card no especifica el número de tokens de entrenamiento, la composición exacta del dataset, el backbone (ViT, ResNet u otro) ni si hubo etapas de RLHF o DPO.

La innovación de esta conversión es de ingeniería de despliegue: se ha trasladado el encoder visual a los formatos nativos de inferencia en móvil manteniendo la dimensionalidad de salida (768) y la normalización de entrada originales. Según la evaluación del autor, la cuantización a 8 bits no degradó la precisión en el conjunto de prueba, e incluso la mejoró ligeramente frente al modelo sin convertir.

## Capacidades

- Generación de embeddings de imagen: devuelve un vector unitario de 768 dimensiones para una imagen RGB de 224 × 224 píxeles.
- Clasificación zero-shot por similitud: permite asignar una especie comparando el embedding de imagen con embeddings de texto precalculados, uno por especie.
- Identificación de aves: es el caso de uso validado explícitamente, con métricas publicadas sobre 116 fotografías etiquetadas de aves recortadas al sujeto.
- Inferencia local en dispositivo: funciona sin conexión a red, con los pesos integrados en la aplicación, en iOS (Core ML) y Android (LiteRT / TensorFlow Lite).
- Búsqueda visual por similitud: los embeddings pueden indexarse para recuperar imágenes parecidas de un catálogo.
- No genera texto, no razona, no hace tool calling ni function calling y no soporta agentes ni razonamiento multi-paso; es un encoder visual puro.
- No incorpora capacidades de audio, vídeo, OCR ni detección de objetos; tampoco incluye recorte automático del ave (la evaluación se hizo con imágenes ya recortadas).
- No dispone de modo de pensamiento (thinking mode) ni de salida estructurada.

## Casos de uso

- Identificación de aves en campo sin cobertura: la aplicación ejecuta el encoder en el propio teléfono y compara el embedding con los vectores de texto de las especies que lleva cargadas, de modo que el usuario obtiene la especie probable sin enviar la foto a ningún servidor.
- Ciencia ciudadana: integración en aplicaciones tipo cuaderno de campo para que los voluntarios etiqueten avistamientos con una sugerencia automática de especie antes de la validación por expertos.
- Monitorización de biodiversidad en el borde: despliegue del fichero TFLite en estaciones de campo, cámaras trampa o nodos con conectividad intermitente, donde solo se transmite el embedding o la etiqueta en lugar de la imagen completa.
- Catalogación de colecciones: generación por lotes de embeddings de especímenes fotografiados en museos y herbarios para agrupar, deduplicar o buscar visualmente dentro de un catálogo, con revisión humana posterior.
- Prefiltrado en canalizaciones de anotación: uso del modelo como primera etapa que descarta imágenes sin ave o propone candidatos, reduciendo el volumen que llega a un anotador humano o a un modelo mayor.
- Educación ambiental: aplicación de aula que explica cómo funciona un modelo contrastivo de imagen y texto y permite al alumnado comprobar aciertos y errores sobre fotos propias.
- Verificación de la cuantización en producción: dado que el autor publica el resultado del modelo sin convertir, sirve como caso de estudio reproducible para medir el impacto real de int8 en un encoder visual antes de adoptarlo en otros dominios.
- Búsqueda visual en catálogos móviles: indexar los embeddings de una colección y ofrecer búsqueda por imagen de ejemplo dentro de una aplicación sin backend.

## Benchmarks y rendimiento

El único conjunto de evaluación descrito en la model card son 116 fotografías de aves etiquetadas y recortadas al ave. No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval, GSM8K ni otras pruebas generales (no son aplicables a un encoder de imagen).

| Modelo | Fichero | Top-1 | Top-5 |
|---|---|---|---|
| BioCLIP 2 sin convertir (referencia del autor) | no aplica | 88,8 % | 97,4 % |
| Conversión a 8 bits para iOS (Core ML) | bioclip2_image.mlpackage.zip | 91,4 % | 97,4 % |
| Conversión a 8 bits para Android (LiteRT / TFLite) | bioclip2_image.tflite | no disponible | no disponible |

No se publican métricas separadas para el artefacto TFLite, ni evaluación sobre taxones distintos de las aves, ni sobre imágenes sin recortar.

## Requisitos de hardware

- Inferencia en móvil: Core ML sobre iPhone y iPad (CPU, GPU o Neural Engine, según lo decida el runtime) y LiteRT / TensorFlow Lite sobre Android.
- VRAM estimada para inferencia en servidor: no disponible. El repositorio completo ocupa 0,6 GB, pero la model card no detalla el tamaño de cada artefacto por separado.
- GPU recomendadas para uso en escritorio: no disponible; el modelo está pensado para aceleradores móviles. Para ejecutarlo en sobremesa habría que usar coremltools sobre Apple Silicon o el intérprete LiteRT sobre x86/ARM, sin cifras publicadas de rendimiento.
- Cabe en GPU de consumo: no aplica en el sentido habitual, ya que el objetivo es ejecutarlo en el hardware del teléfono; no se han publicado requisitos de VRAM de escritorio.
- Opciones de despliegue: Core ML (Xcode, coremltools) para iOS; LiteRT / TensorFlow Lite para Android; no se proporcionan pesos en safetensors, GGUF, ONNX ni integración con vLLM, llama.cpp, Ollama o TGI, que además no son aplicables a un encoder de imagen.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Formato | Embedding | Top-1 en las 116 fotos | Licencia | Orientado a móvil |
|---|---|---|---|---|---|
| imageomics/bioclip-2 (original) | safetensors / PyTorch | 768 | 88,8 % | MIT | No |
| fearnt/thicket-bioclip2 | Core ML y TFLite int8 | 768 | 91,4 % (solo Core ML) | MIT | Sí |
| CLIP ViT-L/14 genérico | no disponible | no disponible | no disponible | no disponible | No |
| SigLIP | no disponible | no disponible | no disponible | no disponible | No |

La información proporcionada solo permite comparar esta conversión con el modelo original del que deriva. No hay datos en la información disponible para comparar con alternativas como CLIP genérico, SigLIP u otros encoders biológicos en términos de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Solo incluye el codificador de imagen: no hay codificador de texto ni tokenizador, por lo que el usuario debe aportar sus propios embeddings de texto, generados preferiblemente con el BioCLIP 2 original.
- La lista de especies reconocibles está acotada al conjunto de embeddings de texto que cargue la aplicación; el modelo no puede identificar taxones que no estén en esa lista y, ante una imagen de una especie desconocida, tiende a devolver la más parecida por similitud coseno, es decir, un falso positivo.
- La evaluación se limita a 116 fotografías de aves recortadas al sujeto. No hay datos sobre otros grupos taxonómicos, imágenes con fondo dominante, baja iluminación, oclusión o especímenes en colección.
- El fichero TFLite no tiene métricas publicadas, por lo que no puede asumirse el mismo comportamiento que el de Core ML.
- El resultado ligeramente superior del modelo cuantizado (91,4 % frente a 88,8 %) procede de una muestra pequeña; no debe interpretarse como una mejora general de la cuantización a 8 bits en otros dominios.
- No se documentan sesgos geográficos, taxonómicos, de iluminación ni de composición de la imagen, ni existe una evaluación de calibración de la confianza: la similitud coseno no equivale a probabilidad.
- No hay estimación de latencia, consumo energético ni memoria en dispositivos concretos, lo que dificulta planificar el presupuesto térmico en aplicaciones intensivas.
- La licencia MIT permite uso comercial y modificación; se solicita citar BioCLIP 2 (modelo y artículo) como buena práctica, aunque MIT no impone esa obligación. Los pesos originales son obra de Imageomics y solo la conversión es nueva.
- Cada artefacto incluye un hash SHA-256 en la model card; conviene verificarlo tras la descarga, ya que el paquete de Core ML se distribuye comprimido en ZIP.
- El repositorio no tiene descargas ni valoraciones y es de creación reciente, por lo que carece de validación independiente y de mantenimiento demostrado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fearnt/thicket-bioclip2
- Modelo base (BioCLIP 2, Imageomics): https://huggingface.co/imageomics/bioclip-2
- Artículo de BioCLIP 2 (NeurIPS 2025): https://proceedings.neurips.cc/paper_files/paper/2025/file/94da80cbfe870c1db958c88a8a27018c-Paper-Conference.pdf
- DOI del modelo base: https://doi.org/10.57967/hf/5765
- Aplicación Thicket: no se proporciona enlace en la información disponible
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces obtenidos corresponden a foros sobre scripts de Roblox y no guardan relación con BioCLIP 2 ni con esta conversión.

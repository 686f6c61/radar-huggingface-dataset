# antonlnz/florence2-base-vision-coreml

## Resumen

`antonlnz/florence2-base-vision-coreml` es una conversión a Core ML del codificador visual (DaViT) del modelo `microsoft/Florence-2-base-ft`, publicada por el usuario antonlnz. No se trata de un modelo nuevo ni de un ajuste fino: es exclusivamente un cambio de formato que traslada el codificador de imagen a un ML Program de Core ML con pesos en float16, con el objetivo de que la parte visual de las tareas de captioning se ejecute en la GPU de equipos Apple.

El problema que resuelve es de despliegue en el borde: Florence-2 original se distribuye en PyTorch y su exportación a ONNX en CPU resulta lenta (744 ms por imagen según el autor). Esta conversión reduce la latencia a 128 ms por imagen en GPU de Apple Silicon, con una pérdida mínima de fidelidad numérica (coseno mínimo de 0,9933 frente al ONNX original y 38 de 40 subtítulos idénticos en una prueba con 40 fotogramas reales). El repositorio ocupa 0,2 GB y mantiene la licencia MIT.

Es relevante ahora porque habilita pipelines de visión totalmente locales en macOS sin depender de APIs en la nube, y porque documenta con detalle un camino de conversión ONNX → PyTorch → Core ML que es reutilizable. Conviene subrayar que el repositorio contiene únicamente el codificador visual: para generar texto o subtítulos hace falta el resto del pipeline de Florence-2 (codificador y decodificador de texto).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador visual DaViT (dual attention vision transformer) de Florence-2-base-ft, exportado como ML Program de Core ML |
| Parametros totales | no disponible (el repositorio solo contiene el codificador visual; la model card no indica su recuento) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la model card no define contexto de texto; la entrada visual es fija) |
| Tipos de cuantizacion | float16 (pesos del ML Program); el origen ONNX está en fp32. No se ofrecen variantes int8/int4 |
| Idiomas soportados | no disponible (la model card no especifica idiomas; Florence-2 se asocia habitualmente a datos en inglés, dato no confirmado aquí) |
| Licencia | MIT (heredada de Florence-2, publicada por Microsoft bajo MIT) |
| Formato de pesos | Core ML ML Program en float16 (`.mlpackage`); origen: `vision_encoder.onnx` en fp32 |
| Entrada | `image`: 768×768 RGB, valores 0–255; el propio modelo escala a [0, 1] y aplica media [0,485; 0,456; 0,406] y desviación [0,229; 0,224; 0,225] |
| Salida | `embedding` / `image_features`: forma (1, 577, 768) en float16 |
| Libreria | coreml (coremltools 9) |
| Tamano del repositorio | 0,2 GB |
| Modelo base | microsoft/Florence-2-base-ft (etiquetado también como base_model:quantized) |

## Arquitectura y entrenamiento

La arquitectura del componente es el codificador visual DaViT de Florence-2-base-ft, un transformer de visión con atención dual (espacial y por canales). La entrada se fija en 768×768 píxeles y la salida es una secuencia de 577 tokens de 768 dimensiones (la forma (1, 577, 768) indicada en la model card), pensada para alimentar al codificador de texto de Florence-2 exactamente igual que la salida ONNX.

No ha habido entrenamiento ni ajuste fino en esta publicación: el autor describe la intervención como "solo formato". El proceso fue tomar `vision_encoder.onnx` (fp32) de `onnx-community/Florence-2-base-ft`, simplificarlo con onnx-simplifier fijando la forma de entrada, cargarlo con `onnx2torch`, envolverlo con la normalización de ImageNet y convertirlo con coremltools 9 a un ML Program con pesos float16. La única "innovación" técnica relevante es la propia receta de conversión y el aviso explícito sobre unidades de cómputo: solo la ruta GPU (`MLComputeUnits.cpuAndGPU`) es numéricamente fiable; la Neural Engine no compila el grafo completo y la ruta CPU de Core ML degrada gravemente los resultados.

## Capacidades

- Extracción de embeddings visuales: produce `image_features` de forma (1, 577, 768) en float16 a partir de una imagen RGB de 768×768.
- Preprocesado integrado: la normalización ImageNet (media y desviación estándar) se aplica dentro del propio grafo, por lo que la entrada son valores 0–255 sin normalizar.
- Base para image captioning: al ser el codificador visual de Florence-2-base-ft, sus embeddings son compatibles con el codificador de texto del mismo modelo, habilitando subtitulado si se dispone del resto del pipeline.
- Búsqueda semántica y recuperación visual: los embeddings permiten indexar y comparar imágenes o fotogramas por similitud.
- Ejecución local en Apple Silicon: no requiere red ni servicios externos.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso (no genera texto).
- Capacidades multilingües: no disponibles; el repositorio no documenta comportamiento idiomático.
- No dispone de modo de razonamiento (thinking), audio, vídeo o generación de texto.

## Casos de uso

- Búsqueda semántica sobre archivos de vídeo personal en macOS: es el caso para el que se construyó (el proyecto "Retriever" del propio autor). Se extraen fotogramas, se calculan embeddings con este modelo y se indexan para consultas por similitud con texto, todo en local.
- Indexado y organización de fototecas locales: generar embeddings de todas las imágenes de una biblioteca para agrupar por similitud, detectar duplicados o construir clústeres temáticos sin subir datos a la nube.
- Preprocesado de imagen para captioning on-device: combinado con el codificador y decodificador de texto de Florence-2-base-ft, este modelo aporta la mitad visual del pipeline para generar pies de foto en una app de escritorio.
- Etiquetado y moderación asistida por similitud: comparar imágenes entrantes contra un banco de embeddings de referencia para clasificar contenido por proximidad vectorial, por ejemplo en un flujo de revisión de medios.
- Búsqueda visual en herramientas de edición o gestión documental: en aplicaciones macOS que manejan capturas, escaneos o material gráfico, permite "buscar por imagen parecida" sin conexión.
- Prototipado e investigación en visión sobre hardware Apple: sirve como bloque de extracción de características congeladas para experimentos de clasificación ligera o evaluación de representaciones, aprovechando la latencia de 128 ms por imagen en GPU.
- Recuperación de fotogramas clave en vídeo largo: al ser rápido y local, permite muestrear y vectorizar secuencias completas para generar líneas de tiempo navegables por contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K, COCO, etc.) en la información disponible. El autor sí publica una prueba de fidelidad frente al ONNX original sobre 40 fotogramas reales, con coseno por token y comparación literal de subtítulos generados:

| Unidad de computo | ms / imagen | Coseno minimo | Subtitulos identicos |
|---|---|---|---|
| GPU | 128 | 0,9933 | 38 / 40 |
| Neural Engine | 1189 (falla la compilacion, cae a otra ruta) | 0,9660 | 35 / 40 |
| CPU (Core ML) | 188 | 0,2808 | 8 / 40 |
| ONNX Runtime en CPU (referencia) | 744 | referencia | referencia |

La recomendación del autor es explícita: ejecutar en GPU (`MLComputeUnits.cpuAndGPU`), porque la Neural Engine no compila el grafo completo y la ruta CPU de Core ML presenta una desviación numérica severa (coseno mínimo de 0,2808).

## Requisitos de hardware

- Plataforma obligatoria: macOS con Apple Silicon; Core ML no se ejecuta en otros sistemas.
- Unidad de cómputo recomendada: GPU (`MLComputeUnits.cpuAndGPU`). La Neural Engine falla al compilar el grafo completo y cae a una ruta alternativa; la CPU de Core ML produce resultados numéricamente incorrectos.
- Memoria: no se indica VRAM o memoria unificada requerida. Como referencia de orden de magnitud, el repositorio ocupa 0,2 GB en disco y los pesos son float16, por lo que cabe holgadamente en la memoria unificada de cualquier equipo Apple Silicon reciente (16 GB o menos).
- GPU de sobremesa (A100, H100, RTX 4090): no aplica, no hay ruta CUDA documentada para este artefacto.
- Latencia medida: 128 ms por imagen en GPU; 188 ms en CPU de Core ML; 1189 ms en la ruta de Neural Engine con fallo de compilación; 744 ms por imagen con ONNX Runtime en CPU.
- Rendimiento agregado (throughput): no disponible; solo se publica latencia por imagen.
- Opciones de despliegue: Core ML (coremltools 9, integración en apps macOS vía Xcode); como alternativa equivalente, la exportación ONNX original con ONNX Runtime.
- No aplica despliegue con vLLM, llama.cpp, Ollama o TGI: es un codificador visual en formato Core ML, no un modelo de lenguaje generativo.

## Comparativa con modelos similares

| Modelo | Formato | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| antonlnz/florence2-base-vision-coreml | Core ML ML Program fp16 | no disponible (solo codificador visual) | imagen fija 768×768; salida (1, 577, 768) | MIT | HuggingFace, 0 descargas, 0 likes |
| microsoft/Florence-2-base-ft | PyTorch (safetensors) | no disponible en la informacion proporcionada (modelo base de referencia) | pipeline completo de vision-lenguaje | MIT | Repositorio oficial del modelo base |
| onnx-community/Florence-2-base-ft | ONNX fp32 | no disponible | `vision_encoder.onnx` con forma de entrada sin fijar | MIT | HuggingFace, exportacion de origen de esta conversion |
| Codificadores visuales tipo CLIP (por ejemplo ViT-B/32) | PyTorch, ONNX, Core ML comunitaria | no disponible en la informacion proporcionada | imagen; embeddings de similitud imagen-texto | MIT / otras segun variante | Amplia, con multiples conversiones a Core ML |

La diferencia clave frente al modelo base y a la exportación ONNX no está en la calidad intrínseca, sino en el formato y la latencia: la versión Core ML en GPU es aproximadamente 5,8 veces más rápida que ONNX Runtime en CPU según las mediciones del autor, a cambio de fijar la resolución de entrada y de no incluir el resto del pipeline. No hay datos públicos que permitan comparar precisión frente a otras alternativas.

## Limitaciones y advertencias

- Cobertura parcial del modelo: el repositorio contiene solo el codificador visual. No genera texto, subtítulos ni respuestas por sí mismo; requiere el codificador de texto y el decodificador de Florence-2.
- Ruta CPU inservible en la práctica: coseno mínimo de 0,2808 y solo 8 de 40 subtítulos idénticos. Cualquier despliegue que acabe en CPU producirá resultados degradados sin aviso evidente.
- Neural Engine problemática: la compilación falla y el tiempo por imagen se dispara a 1189 ms.
- Pérdida de precisión por float16: incluso en la mejor ruta, el coseno mínimo es 0,9933 y 2 de 40 subtítulos difieren del original.
- Entrada rígida: 768×768 fijos. Imágenes de otras proporciones deben redimensionarse o recortarse, lo que puede alterar el contenido semántico.
- Idiomas: no documentados; la model card no garantiza comportamiento fuera del inglés, y el subtitulado de Florence-2 se apoya mayoritariamente en datos en inglés.
- Alucinación: el codificador visual no genera texto, pero cualquier pipeline de captioning que lo use hereda el riesgo de alucinación del decodificador de Florence-2.
- Sesgos: no documentados por el autor; se heredan los del modelo base Florence-2-base-ft y sus datos de entrenamiento.
- Licencia: MIT, heredada del modelo de Microsoft. Permite uso comercial, pero conviene conservar los avisos de copyright originales de Florence-2 y verificar los términos del modelo base por si cambian.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin validación de la comunidad. La fecha de creación registrada en los metadatos es 2026-09-15, posterior a la fecha habitual de publicación de conversiones similares; conviene verificar el repositorio antes de integrarlo.
- Dependencia de Apple: no existe ruta de despliegue en Linux, Windows o CUDA para este artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/antonlnz/florence2-base-vision-coreml
- Modelo base: https://huggingface.co/microsoft/Florence-2-base-ft
- Exportación ONNX de origen: https://huggingface.co/onnx-community/Florence-2-base-ft
- coremltools (herramienta de conversión citada): https://github.com/apple/coremltools
- onnx-simplifier y onnx2torch (herramientas citadas en el proceso de conversión): no disponible como enlace en la información proporcionada
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes; los resultados devueltos corresponden a páginas de atención al cliente de una aseguradora y no guardan relación con el modelo.

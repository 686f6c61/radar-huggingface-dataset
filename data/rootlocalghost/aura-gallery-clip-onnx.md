# rootlocalghost/aura-gallery-clip-onnx

## Resumen

Aura Gallery CLIP ViT-B/32 ONNX DirectML es un paquete de modelos de embeddings multimodales (visión y texto) derivado de la arquitectura OpenAI CLIP en su variante ViT-B/32, exportado a formato ONNX con pesos externos y optimizado para ejecutarse mediante ONNX Runtime con el proveedor de ejecución Microsoft DirectML sobre Windows y DirectX 12. Lo publica el usuario rootlocalghost como componente de infraestructura del proyecto Aura Gallery, una aplicación de galería fotográfica con búsqueda semántica. No es un modelo entrenado desde cero: es una conversión y empaquetado de CLIP para despliegue nativo sin dependencias de Python.

El modelo resuelve dos tareas concretas: extraer embeddings de imagen (tensor RGB normalizado de 3x224x224, salida de 512 dimensiones L2-normalizada) y extraer embeddings de texto (secuencia de 77 tokens, salida de 512 dimensiones L2-normalizada). Con ambos espacios alineados se pueden construir índices de búsqueda por similitud coseno, etiquetado zero-shot y búsqueda de imágenes similares. Su relevancia actual radica en el objetivo de despliegue: aceleración por hardware en GPU Intel Arc A770 vía DirectML desde Rust con `ort v2`, sin runtime de Python.

El repositorio ocupa 0,6 GB y contiene únicamente artefactos de inferencia (ONNX, tokenizer y configuración de preprocesado). La licencia declarada es MIT y el único idioma indicado es inglés, lo que condiciona el uso del codificador de texto a consultas en ese idioma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer dual (visión ViT-B/32 + texto CLIP), exportado a ONNX |
| Parametros totales | no disponible (repo de 0,6 GB con pesos externos `.onnx.data`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 77 tokens en el codificador de texto; imagen de entrada 224x224 RGB |
| Tipos de cuantizacion | no disponible (el autor no documenta variantes cuantizadas; los ficheros son ONNX en el formato exportado) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | ONNX con pesos externos (`.onnx` + `.onnx.data`), más `tokenizer.json`, `tokenizer_config.json` y `preprocessor_config.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es CLIP (Contrastive Language-Image Pretraining) de OpenAI en la variante ViT-B/32: un codificador de imagen basado en Vision Transformer con parches de 32x32 y un codificador de texto transformer, ambos proyectando a un espacio compartido de 512 dimensiones. Los dos codificadores se entrenaron de forma contrastiva sobre pares imagen-texto, de modo que la similitud coseno entre un embedding de imagen y uno de texto aproxima la relevancia semántica entre ambos. El repositorio no aporta detalles sobre el volumen de datos de entrenamiento original, la composición del dataset ni si hubo etapas de ajuste fino adicionales.

La innovación de este paquete no está en el entrenamiento sino en el empaquetado y la ruta de ejecución: exportación a ONNX con pesos externos, tokenizer BPE rápido compatible con el vocabulario CLIP, parámetros de normalización estándar de CLIP (media `[0.48145466, 0.4578275, 0.40821073]`, desviación `[0.26862954, 0.26130258, 0.27577711]`, tamaño 224x224) y configuración para el proveedor `DmlExecutionProvider` con caída a CPU. El resultado son dos sesiones de inferencia independientes (`vision.onnx` y `text.onnx`) que se cargan desde Rust con `ort v2` y se ejecutan sobre DirectX 12.

## Capacidades

- Extracción de embeddings de imagen: acepta un tensor RGB normalizado de 3x224x224 y devuelve un vector de 512 dimensiones L2-normalizado.
- Extracción de embeddings de texto: acepta una secuencia de hasta 77 tokens y devuelve un vector de 512 dimensiones L2-normalizado en el mismo espacio que las imágenes.
- Búsqueda de imágenes por lenguaje natural mediante similitud coseno entre la consulta textual y los embeddings de imagen.
- Etiquetado zero-shot: clasificación de imágenes contra categorías de escena, vestimenta y estado de ánimo definidas como texto.
- Búsqueda de imágenes similares ("find similar") por vecinos más cercanos sobre el índice de embeddings.
- Ejecución acelerada por hardware en Windows mediante DirectML, con fallback a CPU.
- Integración nativa en Rust sin dependencias de Python en tiempo de ejecución.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto libre, código, matemáticas, visión generativa ni audio: es exclusivamente un extractor de features.

## Casos de uso

- Búsqueda semántica en galerías fotográficas personales: se indexan los embeddings de todas las imágenes en una base de datos (el autor menciona SQLite) y cada consulta en lenguaje natural se convierte en un embedding de texto que se compara por similitud coseno, con recuperación de vecinos en tiempos de submilisegundo según la model card.
- Filtrado y organización automática de bibliotecas de fotos: agrupación por similitud visual para detectar duplicados, ráfagas o series de una misma escena sin intervención manual.
- Etiquetado zero-shot de catálogos de producto: definición de categorías como texto (tipo de prenda, entorno, estilo) y clasificación de cada imagen contra esas categorías sin reentrenar el modelo, útil para tiendas con inventario cambiante.
- Moderación y triaje visual previo: cribado rápido de imágenes por categorías semánticas antes de pasarlas a un modelo más costoso, aprovechando el bajo coste por inferencia de ViT-B/32.
- Aplicaciones de escritorio Windows con aceleración GPU: integración en herramientas nativas que ya usan DirectX 12 y quieren inferencia en GPU Intel Arc A770 sin empaquetar Python ni CUDA, cargando las sesiones ONNX desde Rust con `ort v2`.
- Sistemas de recomendación visual: generación de embeddings de 512 dimensiones como features de entrada para un motor de recomendación o para búsqueda híbrida entre texto e imagen.
- Deduplicación y control de calidad de datasets de imagen: cálculo de embeddings por lotes y detección de imágenes casi idénticas por distancia coseno antes de entrenar otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recuperación (Recall@K), precisión zero-shot ni cifras de latencia o throughput medidas sobre Intel Arc A770.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Con un repositorio de 0,6 GB que contiene ambos codificadores y sus pesos externos, el modelo completo cabe holgadamente en GPUs con 4 GB o más; ViT-B/32 es un modelo pequeño dentro de la familia CLIP.
- GPU objetivo declarada: Intel Arc A770 con Windows y DirectX 12 mediante `DmlExecutionProvider`.
- GPU compatibles por proveedor: cualquier GPU con soporte DirectML en Windows (Intel Arc, GPUs AMD e integradas Intel) y CPU como fallback.
- GPU de referencia en ecosistema CUDA (A100, H100, RTX 4090): no documentadas por el autor; el paquete está orientado a DirectML, no a CUDA ni TensorRT.
- Despliegue: ONNX Runtime con `ort v2` desde Rust, o cualquier runtime compatible con ONNX (por ejemplo, ONNX Runtime en Python o C++) configurando el proveedor de ejecución adecuado. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un extractor de features.
- Latencia y throughput: no disponibles. La model card solo afirma recuperación de vecinos en submilisegundo sobre el índice, lo que se refiere a la búsqueda en base de datos, no a la inferencia del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Embedding | Licencia | Formato |
|---|---|---|---|---|---|
| Aura Gallery CLIP ViT-B/32 ONNX DirectML | no disponible (ViT-B/32) | 77 tokens de texto; imagen 224x224 | 512 dims | MIT | ONNX + DirectML |
| OpenAI CLIP ViT-B/32 (original) | ~151 M (ViT-B/32) | 77 tokens de texto; imagen 224x224 | 512 dims | MIT | PyTorch |
| SigLIP (variantes base) | no disponible en esta ficha | depende de la variante | depende de la variante | no disponible en esta ficha | PyTorch / otros |

La comparación directa con el CLIP original de OpenAI es la más pertinente: este repositorio es una conversión del mismo, por lo que la calidad de los embeddings debería ser equivalente, con la diferencia de la ruta de ejecución (ONNX + DirectML frente a PyTorch + CUDA/CPU). Frente a alternativas más recientes como SigLIP, que suelen superar a CLIP en tareas de recuperación, este paquete prioriza la portabilidad y la aceleración en Windows sobre la mejora de métricas.

## Limitaciones y advertencias

- Solo inglés: el codificador de texto está pensado para consultas en inglés, por lo que las búsquedas en castellano u otros idiomas degradarán la calidad de la recuperación.
- Ventana de texto de 77 tokens: consultas más largas se truncan, lo que limita la expresividad de las descripciones.
- Resolución fija de 224x224: los detalles finos de imágenes grandes se pierden en el preprocesado.
- Riesgo de sesgo: al derivar de CLIP, hereda los sesgos de género, raza y cultura presentes en los pares imagen-texto de su entrenamiento original, con posible comportamiento desigual en etiquetado zero-shot.
- Alucinación en sentido estricto no aplica (no genera texto), pero sí falsos positivos en la recuperación: la similitud coseno puede devolver imágenes semánticamente próximas pero incorrectas, especialmente con consultas ambiguas.
- Licencia MIT declarada para este paquete; conviene verificar las condiciones del CLIP original de OpenAI antes de un uso comercial a gran escala.
- El autor no documenta versiones cuantizadas ni cifras de rendimiento medidas, por lo que el rendimiento real en producción debe validarse en el hardware objetivo.
- Dependencia de DirectML y Windows para la aceleración: en Linux o macOS se ejecutará en CPU o requerirá otro proveedor de ejecución.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni historial de mantenimiento.

## Enlaces

- HuggingFace: https://huggingface.co/rootlocalghost/aura-gallery-clip-onnx
- Proyecto Aura Gallery (referenciado en la model card): https://github.com/ (el autor no especifica la ruta exacta del repositorio)
- ONNX Runtime: https://onnxruntime.ai/
- Documentación de DirectML en ONNX Runtime: https://onnxruntime.ai/docs/execution-providers/DirectML-ExecutionProvider.html
- CLIP de OpenAI (modelo base): https://github.com/openai/CLIP

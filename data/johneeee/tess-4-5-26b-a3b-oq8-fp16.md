# Johneeee/Tess-4.5-26B-A3B-oQ8-fp16

## Resumen

Tess-4.5-26B-A3B-oQ8-fp16 es una cuantización mixta del modelo Tess-4.5-26B-A3B, publicada por el usuario Johneeee en Hugging Face. El checkpoint está empaquetado para MLX, la librería de Apple para inferencia en silicio de la familia M, y emplea la herramienta oQ (oMLX v0.8.4) para aplicar cuantización de precisión mixta sobre los pesos originales. El nombre indica una arquitectura MoE con 26.000 millones de parámetros totales y aproximadamente 3.000 millones activos por token, aunque este dato de parámetros activos no está confirmado en la información disponible.

El interés de esta ficha es doble. Por un lado, documenta un caso de cuantización agresiva: el checkpoint completo ocupa 18,063 GiB con un promedio efectivo de 5,810 bits por peso, combinando NVFP4 (grupo 16), MXFP8 (grupo 32), affine 8-bit (grupo 64) y una pequeña fracción en BF16, FP16 y FP32. Por otro, incluye un componente de visión de 0,318B de parámetros, lo que sugiere un modelo multimodal, si bien la model card no lo confirma explícitamente.

La información publicada es escasa: no hay pipeline declarado, licencia, idiomas ni datos de entrenamiento o benchmarks. El repositorio tiene 19,4 GB y no registra descargas en el momento de la consulta. Todo lo que sigue se limita a lo que puede inferirse de los metadatos y de la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (inferido del sufijo A3B); familia "inkling2_loop" segun tags; detalles no disponibles |
| Parametros totales | 26.388.646.400 (26,388B) en el modelo de lenguaje; 26.707B incluyendo vision |
| Parametros activos | aproximadamente 3B (inferido del nombre "A3B"); no confirmado |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: NVFP4 grupo 16, MXFP8 grupo 32, affine 8-bit grupo 64, BF16, FP16 y FP32; media efectiva 5,810 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato MLX (libreria mlx) |
| Tamano del repositorio | 19,4 GB |
| Componente de vision | 0,318B parametros, 1,273 GB / 1,186 GiB |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base más allá de lo que sugiere su nombre: un transformer con mezcla de expertos (MoE) de 26B parámetros totales y unos 3B activos por token. El tag "inkling2_loop" apunta a una familia o variante de arquitectura no documentada en la información proporcionada, y no hay detalles sobre número de capas, dimensión oculta, número de expertos ni mecanismo de enrutamiento.

Tampoco hay datos sobre el entrenamiento: número de tokens, composición del corpus, uso de RLHF o DPO, ni innovaciones técnicas como decodificación especulativa o atención lineal. Lo único documentado con rigor es el proceso de cuantización posterior, realizado con oQ (oMLX v0.8.4), que asigna precisión variable por tensor: la mayor parte de los pesos (76,327%) se almacena en NVFP4 con grupo 16, un 15,265% en MXFP8 con grupo 32 y un 5,887% en affine 8-bit con grupo 64, reservando BF16, FP16 y FP32 para una fracción pequeña (2,52% combinado) que probablemente corresponde a capas sensibles como embeddings, normas o cabezas de salida.

## Capacidades

- Generación de texto y razonamiento: capacidad esperable en un modelo de 26B parámetros, aunque no hay evaluación publicada que lo confirme.
- Procesamiento de imagen: el checkpoint incluye un componente de visión de 0,318B parámetros, lo que indica soporte multimodal de entrada visual, si bien la model card no detalla su funcionamiento.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Modo de razonamiento explícito (thinking mode): no disponible.
- Audio: no disponible.

## Casos de uso

- Inferencia local en Mac con silicio Apple: el checkpoint está en formato MLX y ocupa 18,063 GiB, por lo que encaja en equipos con 24 GB o 32 GB de memoria unificada. Es el escenario natural para el que se publicó esta cuantización.
- Prototipado de asistentes multimodales en local: la presencia de un codificador visual de 0,318B permite experimentar con flujos de imagen y texto sin depender de la nube, siempre que se valide la calidad del componente visual.
- Evaluación de técnicas de cuantización mixta: el checkpoint sirve como referencia práctica para estudiar el impacto de combinar NVFP4, MXFP8 y affine 8-bit en un mismo modelo, comparando su salida con el modelo original en BF16.
- Investigación sobre modelos MoE de tamaño medio: con 26B totales y unos 3B activos, el coste de cómputo por token es bajo, lo que facilita experimentos de ajuste fino ligero o de evaluación de prompts en hardware de consumo.
- Despliegue de demos offline: al no requerir conexión, puede integrarse en aplicaciones de escritorio para macOS que necesiten generación de texto con contexto visual sin enviar datos a terceros.
- Docencia y formación: permite explicar en un aula cómo se distribuye la precisión por tensor y cómo afecta al tamaño final del checkpoint, usando las tablas de la model card como material didáctico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 18,063 GiB de pesos más overhead de ejecución; se recomienda un mínimo de 24 GB de memoria unificada y, preferiblemente, 32 GB para trabajar con comodidad.
- GPU compatibles: el formato MLX está diseñado para Apple Silicon (series M1, M2, M3 y M4). No es directamente utilizable en GPU NVIDIA o AMD sin conversión previa.
- Cabe en GPU de consumo: sí, en equipos Apple con 24 GB o más de memoria unificada. En GPU NVIDIA de consumo requeriría reconvertir los pesos a otro formato (por ejemplo, GGUF), algo que no se documenta en el repositorio.
- Opciones de despliegue: MLX (librería mlx y mlx-lm) es la vía nativa. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparación rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La cuantización mixta a 5,810 bits por peso promedio introduce pérdida de precisión respecto al modelo original; no se documenta ninguna evaluación de degradación.
- No se especifica la licencia, por lo que no puede confirmarse el uso comercial del checkpoint ni del modelo base.
- No se declaran idiomas soportados; el comportamiento multilingüe es desconocido.
- No hay información sobre sesgos, alineación o filtros de seguridad del modelo original.
- El riesgo de alucinación es inherente a los modelos generativos y no está cuantificado en esta publicación.
- El formato MLX limita su uso a hardware Apple; no es portable a otros entornos sin conversión.
- El repositorio no registra descargas y tiene un único "like", lo que sugiere poca validación por parte de la comunidad.
- La fecha de creación indicada (2026-11-28) es posterior a la fecha actual, un dato anómalo que conviene verificar antes de confiar en los metadatos.
- No hay información sobre el modelo base Tess-4.5-26B-A3B, su procedencia ni su proceso de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/Johneeee/Tess-4.5-26B-A3B-oQ8-fp16
- Repositorio de oQ / oMLX: https://github.com/jundot/omlx

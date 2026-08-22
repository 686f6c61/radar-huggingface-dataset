# momentarek1/Text-to-Face_Generation

## Resumen

El modelo `momentarek1/Text-to-Face_Generation` es un proyecto de investigación que implementa la generación de imágenes faciales a partir de descripciones textuales en lenguaje natural. Desarrollado por el usuario momentarek1, el sistema combina un codificador de texto basado en Sentence-BERT (all-mpnet-base-v2) con una GAN condicional para producir retratos de 64x64 píxeles. El proyecto incluye dos variantes: un generador baseline y una versión mejorada con mecanismos de self-attention, normalización espectral y un discriminador condicional. La relevancia actual radica en su exploración de técnicas de text-to-image con arquitecturas GAN, un área activa en la investigación de IA generativa. No se especifican el número total de parámetros ni la licencia, y el modelo no está orientado a producción, sino a fines educativos y experimentales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GAN condicional (generador y discriminador) con codificador de texto Sentence-BERT |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de generación de imágenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las descripciones de ejemplo están en inglés) |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente PyTorch, no confirmado) |

## Arquitectura y entrenamiento

El pipeline completo consta de tres etapas: el texto se procesa con SentenceTransformer all-mpnet-base-v2, que produce un embedding semántico de 768 dimensiones. Este embedding se proyecta mediante una capa lineal a 256 dimensiones. El generador recibe como entrada la concatenación de un vector de ruido aleatorio de 100 dimensiones y el embedding de texto reducido, y lo transforma mediante capas de convolución transpuesta (ConvTranspose2D) con normalización por lotes y activaciones ReLU/LeakyReLU, hasta obtener una imagen RGB de 64x64. La salida final usa una activación Tanh. La variante attention-based incorpora capas de self-attention y normalización espectral en el generador, además de un discriminador condicional que evalúa la coherencia entre la imagen y el texto. El entrenamiento se realiza sobre el dataset CelebA, con descripciones textuales generadas a partir de los atributos faciales anotados. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de imágenes faciales de 64x64 píxeles a partir de descripciones textuales en inglés (p. ej., "The female has high cheekbones. Her hair is black...").
- Condicionamiento semántico mediante embeddings de Sentence-BERT, lo que permite capturar atributos como edad, género, peinado, expresiones y accesorios.
- Dos arquitecturas disponibles: una baseline ligera y una versión con self-attention y normalización espectral para mejorar la calidad de las imágenes.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling, ni razonamiento multi-paso, ni capacidades de agente.
- No tiene soporte multilingüe explícito; las descripciones de ejemplo están en inglés.

## Casos de uso

- Investigación académica en text-to-image: el modelo sirve como base para estudiar la interacción entre embeddings de texto y GANs condicionales, permitiendo reproducir experimentos y comparar arquitecturas.
- Prototipado de generación de avatares: a partir de descripciones de rasgos faciales, se pueden generar retratos sintéticos para aplicaciones de diseño o entretenimiento, aunque con resolución limitada.
- Enseñanza de GANs y modelos generativos: al ser un proyecto pequeño y autocontenido, es adecuado para cursos de deep learning donde se analicen los componentes de un generador y un discriminador.
- Exploración de técnicas de atención y normalización: la variante attention-based permite estudiar el impacto de self-attention y spectral normalization en la estabilidad del entrenamiento de GANs.
- Generación de datos sintéticos para aumentar conjuntos de datos de reconocimiento facial, siempre que se respeten las limitaciones de calidad y sesgo.
- Benchmarking de codificadores de texto: el uso de Sentence-BERT como encoder permite evaluar cómo diferentes representaciones textuales afectan a la calidad de la generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas cuantitativas como FID, IS, MMLU, HumanEval o similares.

## Requisitos de hardware

- No se especifican requisitos oficiales de hardware.
- Dado el tamaño reducido del generador (entrada de 356 dimensiones y capas convolucionales hasta 64x64), la inferencia es probablemente factible en GPUs consumer como una NVIDIA GTX 1060 o superior, aunque no hay datos confirmados.
- El entrenamiento completo requeriría una GPU con al menos 8 GB de VRAM para manejar el dataset CelebA y el discriminador, pero no se dispone de cifras exactas.
- Opciones de despliegue: al ser un proyecto de investigación, no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI. El código probablemente se ejecuta con PyTorch estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de generación de caras a partir de texto. El proyecto más cercano es T2F (https://github.com/akanimax/T2F), que también aborda text-to-face con GANs, pero no se han publicado comparaciones directas. Otros modelos como DALL-E o Stable Diffusion operan a una escala mucho mayor y no son comparables en términos de arquitectura ni rendimiento.

## Limitaciones y advertencias

- Sesgos del dataset: CelebA contiene imágenes de celebridades, mayoritariamente occidentales y con ciertos estándares de belleza, lo que puede introducir sesgos de género, raza y edad en las imágenes generadas.
- Calidad de imagen limitada: la resolución de 64x64 es baja y las caras generadas pueden presentar artefactos o falta de realismo.
- Alucinación: al ser un modelo generativo de imágenes, puede producir rasgos faciales inconsistentes con la descripción textual.
- Licencia no especificada: no se indica si el modelo o los pesos tienen restricciones de uso comercial; se recomienda contactar al autor antes de cualquier uso en producción.
- No es un modelo listo para producción: carece de documentación sobre entrenamiento, métricas de calidad y robustez, por lo que su uso en aplicaciones reales es arriesgado.
- Dependencia de Sentence-BERT: el modelo requiere el codificador all-mpnet-base-v2, que tiene su propia licencia (Apache 2.0) y puede añadir latencia en la inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/momentarek1/Text-to-Face_Generation
- Proyecto T2F (referencia similar): https://github.com/akanimax/T2F
- Dataset CelebA (CUHK Multimedia Lab): no se proporciona enlace directo, pero es accesible en https://mmlab.ie.cuhk.edu.hk/projects/CelebA.html
- Sentence-BERT all-mpnet-base-v2: https://huggingface.co/sentence-transformers/all-mpnet-base-v2

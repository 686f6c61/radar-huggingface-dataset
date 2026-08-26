# Emerald7664/ACE-Step-v1.5-ONNX

## Resumen

ACE-Step v1.5 es un modelo de generación de música texto-a-audio desarrollado por el equipo ACE-Step, presentado como un modelo fundacional de música de código abierto que busca acercar la generación de calidad comercial a hardware de consumo. Esta variante concreta, `Emerald7664/ACE-Step-v1.5-ONNX`, es una conversión a formato ONNX del modelo original, optimizada para inferencia en navegador mediante WebGPU y ONNX Runtime Web. El modelo combina un Diffusion Transformer (DiT) con flow matching, un modelo de lenguaje causal de 1.7B parámetros para generación condicionada por letras, un codificador de texto basado en Qwen3-Embedding y varios codificadores auxiliares para timbre y letras.

La relevancia actual de este modelo radica en su capacidad para generar canciones completas de hasta 48 kHz en menos de 2 segundos en una A100 y menos de 10 segundos en una RTX 3090, según sus desarrolladores, manteniendo una calidad que afirman supera a la mayoría de modelos comerciales. La versión ONNX permite ejecutar el modelo en el navegador con un peso total de aproximadamente 4.6 GB en cuantización INT4, lo que lo hace accesible para desarrolladores web y aplicaciones de música generativa sin necesidad de servidores dedicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con flow matching, más componentes auxiliares (LM causal, codificadores de texto, letras y timbre, VAE decoder) |
| Parametros totales | no disponible (el LM tiene 1.7B, el text encoder 0.6B; el DiT no se especifica) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el contexto se define por la duración de la música generada, no por tokens de texto) |
| Tipos de cuantizacion | FP32, INT4 (weight-only, MatMulNBits, block_size=128, simétrico), FP16 |
| Idiomas soportados | no disponible (el modelo acepta texto en varios idiomas, pero no se especifica la lista) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (archivos .onnx en directorios `onnx/`, `onnx_q4/`, `onnx_fp16/`) |

## Arquitectura y entrenamiento

ACE-Step v1.5 es un modelo de generación de música basado en un Diffusion Transformer (DiT) de 24 capas con 2048 unidades ocultas, que utiliza un esquema de denoising turbo de 8 pasos con flow matching (scheduler Euler ODE). La atención es bidireccional y alterna entre atención completa y atención de ventana deslizante de 128 tokens, empleando Grouped Query Attention (GQA) con 16 cabezas de consulta y 8 cabezas de clave/valor. El modelo opera en un espacio latente de 64 canales con una frecuencia de cuadro de 25 Hz, que se sobremuestrea 1920 veces para producir audio estéreo a 48 kHz.

El pipeline completo incluye varios componentes: un codificador de texto basado en Qwen3-Embedding (0.6B parámetros) que proyecta la descripción textual a un espacio de 2048 dimensiones mediante un proyector lineal; un modelo de lenguaje causal de 1.7B parámetros que procesa las letras; un codificador de letras de 8 capas transformer; un codificador de timbre de 4 capas que extrae características de un audio de referencia; y un decoder VAE (AutoencoderOobleck) que convierte los latentes en forma de onda. Los embeddings de texto, letras y timbre se concatenan y empaquetan para condicionar el DiT durante el proceso de denoising.

No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens o el uso de técnicas como RLHF o DPO en la información disponible. La conversión ONNX fue verificada contra la referencia PyTorch con diferencias máximas absolutas que van desde 0.0 (embeddings) hasta 3.2e-3 (LM), lo que indica una fidelidad alta en la exportación.

## Capacidades

- Generación de música completa a partir de descripciones textuales (text-to-music), incluyendo género, instrumentación, estado de ánimo y estructura.
- Generación condicionada por letras: el modelo acepta letras como entrada adicional y las integra en la composición musical.
- Control de timbre mediante audio de referencia: el codificador de timbre extrae características de una muestra de audio para replicar su sonoridad en la generación.
- Generación de canciones de hasta 48 kHz en estéreo, con calidad orientada a producción comercial.
- Alta velocidad de inferencia: menos de 2 segundos por canción completa en A100 y menos de 10 segundos en RTX 3090 (según los desarrolladores).
- Ejecución local en hardware de consumo, con soporte para cuantización INT4 que reduce el peso a aproximadamente 4.6 GB para el conjunto mínimo de componentes.
- Inferencia en navegador mediante WebGPU y ONNX Runtime Web, lo que permite aplicaciones web sin servidor.
- Soporte de pipeline modular: es posible omitir el LM para generación solo con texto, reduciendo los requisitos de memoria.

## Casos de uso

- Creación de bandas sonoras para vídeo y multimedia: un desarrollador puede integrar el modelo en una herramienta de edición de vídeo para generar música de fondo personalizada a partir de una descripción textual, aprovechando la generación rápida y la calidad de 48 kHz.
- Producción musical y demos rápidas: músicos y productores pueden usar el modelo para generar bocetos de canciones con letras, iterando rápidamente sobre diferentes estilos y arreglos sin necesidad de instrumentos o estudios.
- Generación de música procedural para videojuegos: el modelo puede ejecutarse en el cliente (por ejemplo, en un motor de juego con WebGPU) para crear música adaptativa que responda a eventos del juego, gracias a su baja latencia y ejecución local.
- Aplicaciones web de creación musical: al estar exportado a ONNX y ser compatible con WebGPU, se puede integrar en editores de música en línea donde los usuarios describen la música deseada y reciben una pista generada al instante, sin enviar datos a un servidor.
- Personalización de timbre para artistas: usando el codificador de timbre, un artista puede proporcionar una grabación de referencia (por ejemplo, su propia voz o un instrumento) y el modelo generará música que imite ese timbre, útil para explorar sonoridades específicas.
- Herramientas educativas de composición: el modelo puede servir como asistente en aulas de música, permitiendo a estudiantes generar ejemplos auditivos de conceptos teóricos (como "una balada en re menor con piano") para análisis y práctica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos (como MMLU, HumanEval o métricas de calidad musical objetivas) en la información disponible. Los desarrolladores afirman en el repositorio GitHub que el modelo "alcanza calidad más allá de la mayoría de modelos de música comerciales" en métricas de evaluación comunes, pero no se proporcionan cifras concretas. Tampoco se incluyen comparativas cuantitativas con otros modelos en la documentación de la conversión ONNX.

## Requisitos de hardware

- Para el conjunto mínimo de componentes en cuantización INT4 (DiT decoder, text encoder, lyric encoder, timbre encoder, VAE decoder, text projector y embed tokens), el peso total es de aproximadamente 4.6 GB, lo que cabe en GPUs de consumo con 8 GB de VRAM, como la RTX 3060, RTX 4060 o superiores.
- El modelo original en FP32 requiere más memoria: el repositorio ONNX tiene un tamaño de 65.6 GB, aunque esto incluye todas las variantes de cuantización. Para inferencia en FP32 se necesitarían GPUs de gama alta (A100, H100) o se podría usar cuantización INT4 para reducir el consumo.
- Según los desarrolladores, el modelo original se ejecuta en menos de 2 segundos por canción en una A100 y en menos de 10 segundos en una RTX 3090, lo que sugiere que la versión cuantizada puede funcionar en GPUs de gama media con tiempos de generación de decenas de segundos.
- Opciones de despliegue: ONNX Runtime Web con WebGPU para navegadores, ONNX Runtime en servidores, o el código PyTorch original disponible en el repositorio de ACE-Step.
- El scheduler de flow matching se ejecuta en JavaScript en el caso de WebGPU, por lo que solo el forward pass del DiT se realiza en ONNX, reduciendo la carga de cómputo en el dispositivo.

## Comparativa con modelos similares

No se dispone de datos comparativos cuantitativos con otros modelos de generación de música en la información proporcionada. El modelo compite con soluciones comerciales como MusicGen de Meta, Stable Audio de Stability AI o Suno, pero no se han publicado tablas comparativas con estos sistemas en la documentación de la conversión ONNX. Se puede indicar que ACE-Step v1.5 se posiciona como una alternativa de código abierto con licencia Apache 2.0, mientras que MusicGen tiene una licencia CC-BY-NC (no comercial) y Stable Audio tiene versiones comerciales de pago. Sin embargo, al carecer de datos de rendimiento objetivos, no es posible realizar una comparación técnica rigurosa.

## Limitaciones y advertencias

- No se han documentado sesgos específicos del modelo, pero al ser un modelo entrenado con datos de audio y texto, puede reflejar sesgos presentes en los datos de entrenamiento (por ejemplo, sobre-representación de ciertos géneros musicales o culturas).
- Riesgo de alucinación en la generación de audio: el modelo puede producir contenido no deseado, incoherente o que no se corresponda con la descripción textual, especialmente con prompts ambiguos o fuera de distribución.
- Limitaciones de idioma: no se especifica qué idiomas soporta el codificador de texto, aunque al estar basado en Qwen3-Embedding es probable que funcione bien en inglés y chino, pero el rendimiento en otros idiomas no está garantizado.
- La licencia Apache 2.0 permite uso comercial, pero es necesario verificar que los componentes base (como Qwen3-Embedding) también tengan licencias compatibles; en este caso, el modelo original de ACE-Step también es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- Para producción, es importante validar la calidad del audio generado en el caso de uso específico, ya que la afirmación de "calidad comercial" proviene de los desarrolladores y no ha sido verificada de forma independiente.
- La versión ONNX está pensada para WebGPU; en entornos sin soporte WebGPU (navegadores antiguos o algunos dispositivos), la inferencia no será posible o será muy lenta.

## Enlaces

- Modelo ONNX en HuggingFace: https://huggingface.co/Emerald7664/ACE-Step-v1.5-ONNX
- Modelo original ACE-Step v1.5: https://huggingface.co/ACE-Step/Ace-Step1.5
- Repositorio GitHub de ACE-Step-1.5: https://github.com/ace-step/ACE-Step-1.5
- Paper (arXiv): https://arxiv.org/abs/2506.00045
- Página del proyecto: https://ace-step.github.io/ace-step-v1.5.github.io/
- Documentación de ONNX Runtime Web: https://onnxruntime.ai/docs/tutorials/web/

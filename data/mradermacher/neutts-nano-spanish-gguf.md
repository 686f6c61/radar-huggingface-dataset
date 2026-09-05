# mradermacher/neutts-nano-spanish-GGUF

## Resumen

El modelo `mradermacher/neutts-nano-spanish-GGUF` es una colección de cuantizaciones estáticas en formato GGUF del modelo base `neuphonic/neutts-nano-spanish`, desarrollado por Neuphonic. Se trata de un modelo de síntesis de voz (texto a voz) en español, diseñado para ejecutarse en dispositivos locales con recursos limitados. La cuantización ha sido realizada por mradermacher, quien publica versiones de tamaño reducido para facilitar su despliegue en hardware modesto.

El modelo cuenta con aproximadamente 228,7 millones de parámetros, lo que lo sitúa en la categoría "nano" de modelos de voz. Su principal ventaja es la combinación de tamaño reducido y soporte del idioma español, lo que permite su integración en aplicaciones de voz en tiempo real sin depender de servidores externos. El repositorio incluye doce cuantizaciones distintas, desde `Q2_K` hasta `f16`, con tamaños de archivo que oscilan entre 0,3 y 0,6 GB, lo que ofrece flexibilidad para elegir el equilibrio entre calidad de audio y consumo de recursos.

Al ser un modelo TTS, no genera texto ni realiza tareas de razonamiento. Su uso se centra exclusivamente en convertir texto en voz natural en español, con un enfoque en eficiencia y despliegue en el borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de síntesis de voz neuronal (arquitectura no especificada en la información disponible) |
| Parametros totales | 228.704.832 (228,7 millones) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (no aplica de la misma forma que en un LLM) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS, f16 |
| Idiomas soportados | Español (es) |
| Licencia | Other (licencia personalizada, no especificada en el README; se debe consultar la del modelo base) |
| Formato de pesos | GGUF (cuantizaciones); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

No se ha proporcionado información detallada sobre la arquitectura interna del modelo base en los datos disponibles. El repositorio de Neuphonic indica que el modelo forma parte de una línea de sistemas de voz de IA "más rápidos, más pequeños y en el dispositivo", lo que sugiere un diseño optimizado para inferencia local. Sin embargo, no se especifica si se basa en una arquitectura de tipo VITS, Tacotron, o cualquier otra variante de síntesis de voz.

Tampoco se dispone de datos sobre el proceso de entrenamiento: número de tokens, composición del dataset, métodos de alineación o ajuste fino. La información disponible se limita a la cuantización posterior realizada por mradermacher, que convierte los pesos del modelo base a formato GGUF mediante técnicas de cuantización estática. No hay indicios de que se haya aplicado RLHF, DPO u otras técnicas de alineación propias de modelos de lenguaje.

## Capacidades

- Síntesis de voz en español a partir de texto, generando audio natural en el idioma objetivo.
- Diseñado para ejecución en dispositivos locales (on-device), gracias a su tamaño reducido y a las cuantizaciones disponibles.
- Compatible con múltiples niveles de cuantización, lo que permite adaptar el modelo a distintos requisitos de memoria y velocidad.
- No soporta generación de texto, razonamiento, ejecución de código, tool calling, agentes ni tareas de lenguaje más allá de la conversión texto a voz.
- No incluye capacidades de visión ni de procesamiento de audio de entrada; únicamente genera audio como salida.

## Casos de uso

- Asistente de voz en aplicaciones móviles: el modelo puede sintetizar respuestas en español en tiempo real. Su tamaño reducido permite ejecutarlo localmente, sin necesidad de conexión a internet, lo que reduce la latencia y mejora la privacidad.
- Lectura de noticias y artículos: permite convertir contenido escrito en audio para usuarios que prefieren escuchar en lugar de leer. El soporte específico de español lo hace adecuado para medios y portales en este idioma.
- Accesibilidad para personas con discapacidad visual: puede utilizarse en lectores de pantalla o aplicaciones de accesibilidad, generando voz en español de forma fluida. Al ser ejecutable en el dispositivo, se preserva la confidencialidad del contenido leído.
- Sistemas de respuesta de voz interactiva (IVR) en atención al cliente: puede generar mensajes de voz dinámicos en español para centralitas telefónicas, sustituyendo locuciones pregrabadas y permitiendo respuestas personalizadas sin necesidad de grabar audio manualmente.
- Narración de audiolibros: su calidad de voz y soporte del español permiten producir audiolibros de forma automatizada. Las cuantizaciones de menor tamaño facilitan el procesamiento por lotes en entornos de servidor con recursos limitados.
- Aplicaciones de aprendizaje de idiomas: puede pronunciar palabras y frases en español para ejercicios de pronunciación y vocabulario. La baja latencia de las cuantizaciones Q4/Q5 hace viable su uso en tiempo real dentro de una aplicación educativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El tamaño de los archivos GGUF oscila entre 0,3 GB (cuantizaciones Q2/Q3/IQ4) y 0,6 GB (f16), lo que indica que el modelo puede ejecutarse en hardware modesto.
- Para inferencia en GPU, se estima que las cuantizaciones Q4_K_S y Q4_K_M requieren aproximadamente 1 GB de VRAM, mientras que la versión f16 necesita en torno a 2 GB de VRAM.
- En CPU, se necesitan al menos 4 GB de RAM para las cuantizaciones más ligeras; para f16, se recomienda un mínimo de 8 GB.
- Cualquier GPU de gama baja con 1-2 GB de VRAM (por ejemplo, GTX 1050, RTX 3050) sería suficiente para las versiones Q4/Q5. Para f16, se puede utilizar una RTX 3050 o superior.
- Las opciones de despliegue no están especificadas en la información disponible. El formato GGUF es compatible con motores como llama.cpp, aunque al tratarse de un modelo TTS es necesario verificar la compatibilidad del motor con este tipo de arquitectura. Se recomienda consultar la documentación del modelo base para conocer los motores oficialmente soportados.
- La latencia y el throughput estimados no están disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado modelos comparables en la información disponible.

## Limitaciones y advertencias

- La licencia es "other", lo que implica condiciones personalizadas. Antes de usar el modelo en producción o en proyectos comerciales, es imprescindible revisar la licencia del modelo base para conocer las restricciones aplicables.
- Al ser una cuantización estática, las versiones de menor tamaño (Q2_K, Q3_K_S, IQ4_XS) pueden presentar una reducción perceptible en la calidad de la voz generada en comparación con las cuantizaciones superiores.
- No se han publicado benchmarks ni evaluaciones objetivas del rendimiento del modelo en la información disponible, por lo que la calidad real de la síntesis de voz no está verificada de forma independiente.
- Es un modelo exclusivo para español; no soporta otros idiomas ni mezcla de idiomas.
- No es un modelo de lenguaje: no puede generar texto, mantener conversaciones, razonar ni ejecutar código. Su única función es la conversión de texto a voz.
- Los datos de entrenamiento y la composición del dataset no están disponibles, lo que limita cualquier análisis de sesgos o comportamientos no deseados.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/neutts-nano-spanish-GGUF
- Modelo base: https://huggingface.co/neuphonic/neutts-nano-spanish
- Página de descargas y vista del modelo: https://hf.tst.eu/model#neutts-nano-spanish-GGUF
- Solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests

# Prannesshkva/ROTOR-15M

## Resumen

ROTOR-15M es un modelo de lenguaje ultraligero de tipo denso, diseñado por Prannessh K.V.A., que introduce la arquitectura ROTOR (Rotational Orientation Token Organization & Recall). Su principal innovación consiste en sustituir el mecanismo de cross-attention de los transformers, cuyo coste en memoria y cómputo crece cuadráticamente con la longitud de la secuencia, por 48 rotaciones de sistemas de coordenadas tridimensionales en el espacio cuaterniónico real SU(2). Esto permite mantener un estado de contexto de solo 4,5 kilobytes, estrictamente constante e independiente de la longitud de la secuencia, con una complejidad temporal lineal O(N + M).

El modelo está pensado para entornos de edge computing: microcontroladores, Raspberry Pi, robótica embebida y fusión de sensores en tiempo real. Aunque el repositorio indica un total de 14,48 millones de parámetros en la model card, los pesos reales en formato safetensors suman 46.786.464 parámetros, una discrepancia que conviene tener en cuenta. El modelo soporta generación de texto y, según la documentación, también entrada multimodal directa de audio y visión mediante codificadores externos, aunque el pipeline principal declarado es text-generation.

La relevancia actual de ROTOR-15M radica en su propuesta de eliminar por completo la atención, ofreciendo una alternativa densa y de memoria constante para tareas de modelado secuencial en dispositivos con recursos muy limitados. Su licencia es múltiple (AGPLv3, PolyForm Noncommercial y licencia comercial), lo que condiciona su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ROTOR (dense, sin atención, rotaciones cuaterniónicas SU(2)) |
| Parametros totales | 46.786.464 (según safetensors); la model card declara 14.480.544 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | ilimitada en la práctica; estado de contexto constante de 4,5 KB (O(1)) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (declarado en la model card) |
| Licencia | Multi-licencia: AGPLv3, PolyForm Noncommercial 1.0.0, y licencia comercial (contacto: prannessh.kva@gmail.com) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ROTOR-15M emplea una arquitectura densa con bloques feedforward SwiGLU y un mecanismo de alineación cruzada cuaterniónica multi-cabeza. En lugar de calcular matrices de atención, cada capa aplica 48 rotaciones independientes de marcos de referencia tridimensionales en el espacio SU(2), lo que permite alinear la información del contexto con la consulta sin necesidad de almacenar una matriz de atención. El modelo tiene 6 bloques, una dimensión oculta de 384 y un vocabulario de 8192 tokens. La complejidad temporal es estrictamente lineal O(N + M), donde N es la longitud del contexto y M la de la consulta, y el estado de memoria es constante (4,5 KB) independientemente de la longitud de la secuencia.

No se dispone de información detallada sobre el conjunto de datos de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. La model card no menciona estos aspectos. El modelo se distribuye con código personalizado (custom_code) y requiere `trust_remote_code=True` para su carga. También se indica soporte nativo para entrada multimodal: audio (ondas a 16 kHz) y visión (imágenes RGB 224x224) mediante codificadores externos que proyectan las señales al espacio de embeddings del modelo.

## Capacidades

- Generación de texto condicionada por un contexto largo, con memoria de contexto constante O(1) de 4,5 KB.
- Alineación cruzada sin atención: procesa secuencias de contexto y consulta de forma independiente, con complejidad lineal.
- Soporte multimodal declarado: entrada de audio (waveform a 16 kHz) y visión (tensores RGB 224x224) a través de codificadores externos, aunque no se aportan pesos ni ejemplos de entrenamiento multimodal.
- Adecuado para inferencia en tiempo real en dispositivos embebidos gracias a su bajo coste de memoria y cómputo.
- No se documenta soporte explícito de tool calling, function calling ni razonamiento multi-paso.
- Capacidad multilingüe limitada: solo se declara inglés.

## Casos de uso

- Inferencia en microcontroladores: el modelo puede ejecutarse en dispositivos con menos de 1 MB de RAM gracias a su estado de contexto de 4,5 KB, permitiendo asistentes de voz o clasificación de texto en hardware de muy bajas prestaciones.
- Robótica embebida: integración en sistemas de control en tiempo real que necesitan procesar flujos de sensores (audio, imágenes) y generar respuestas textuales o comandos sin depender de la nube.
- Fusión de sensores en tiempo real: al aceptar embeddings de audio y visión directamente, puede combinarse con codificadores ligeros para tareas de descripción de escenas o comandos por voz en dispositivos autónomos.
- Prototipado de investigación: sirve como banco de pruebas para arquitecturas sin atención y para estudiar el comportamiento de rotaciones cuaterniónicas en modelado de secuencias.
- Generación de texto en entornos con restricciones energéticas: su complejidad lineal y su pequeño tamaño lo hacen apto para aplicaciones de batería limitada, como wearables o sensores inteligentes.
- Educación y experimentación: al ser un modelo pequeño y con código abierto (bajo ciertas licencias), permite a estudiantes e investigadores analizar una arquitectura alternativa a los transformers sin necesidad de grandes recursos de cómputo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval, GSM8K ni comparaciones con otros modelos. Tampoco se aportan mediciones de latencia o throughput en hardware específico.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de entre 14 y 47 millones de parámetros, la inferencia en FP32 requiere aproximadamente entre 60 MB y 190 MB de memoria, dependiendo de la cifra real de parámetros. Con cuantización a 8 bits, el consumo se reduciría a unos 15-50 MB.
- GPU recomendadas: cualquier GPU moderna con al menos 1 GB de VRAM es suficiente; incluso CPUs de bajo consumo pueden ejecutarlo sin problemas.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU consumer (RTX 2060, GTX 1650, etc.) e incluso en hardware sin GPU.
- Opciones de despliegue: al ser un modelo con código personalizado, no se menciona soporte nativo para vLLM, llama.cpp, Ollama o TGI. Se puede ejecutar mediante la API de Hugging Face Transformers con `trust_remote_code=True`.
- Latencia y throughput: no disponibles. Dada su complejidad lineal y su tamaño reducido, se espera una latencia muy baja, pero no hay datos publicados.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de la misma categoría. El autor tiene otro modelo relacionado, QU-SSM-15M, que también emplea grupos de Lie (SO(N) mediante transformada de Cayley) y está entrenado con TinyStories, pero no se aportan datos comparativos de rendimiento. No se conocen modelos comerciales o académicos que utilicen exactamente la misma arquitectura de rotaciones cuaterniónicas, por lo que la comparativa directa no está disponible.

## Limitaciones y advertencias

- La model card declara 14,48 millones de parámetros, pero los pesos reales en safetensors suman 46,79 millones. Esta discrepancia debe resolverse antes de usar el modelo en producción.
- La licencia es restrictiva: la opción AGPLv3 impone copyleft de red, la PolyForm Noncommercial prohíbe el uso comercial, y la licencia comercial requiere contacto directo con el autor. No se especifican los términos de la licencia comercial.
- No se han publicado benchmarks ni evaluaciones independientes, por lo que se desconoce su calidad real en tareas de lenguaje.
- El soporte multimodal (audio y visión) se describe en la model card, pero no se proporcionan pesos de los codificadores ni ejemplos de entrenamiento multimodal, lo que limita su reproducibilidad.
- El modelo solo declara soporte para inglés; su comportamiento en otros idiomas no está documentado.
- Al ser una arquitectura novedosa y sin atención, su comportamiento en tareas que requieren razonamiento complejo o recuperación de información de largo alcance no ha sido validado públicamente.
- El uso de `trust_remote_code=True` implica ejecutar código arbitrario del repositorio, lo que conlleva riesgos de seguridad si no se audita previamente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Prannesshkva/ROTOR-15M
- DOI Zenodo: https://doi.org/10.5281/zenodo.22285756
- Modelo relacionado del mismo autor (QU-SSM-15M): https://huggingface.co/Prannesshkva/QU-SSM-15M

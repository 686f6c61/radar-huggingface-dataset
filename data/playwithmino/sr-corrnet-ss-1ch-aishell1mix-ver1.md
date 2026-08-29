# playwithmino/sr-corrnet-ss-1ch-aishell1mix-ver1

## Resumen

SR-CorrNet-SS es un modelo de separación de voz de un solo canal, desarrollado por el autor playwithmino a partir de la arquitectura SR-CorrNet propuesta en el artículo «Asymmetric Encoder-Decoder Based on Time-Frequency ...» (arXiv:2603.29097). El modelo resuelve el problema de separar múltiples hablantes en una mezcla de audio monoaural, adaptándose dinámicamente a un número variable de fuentes (entre 1 y 5). Esta versión concreta está fine-tuneada sobre el conjunto de datos AISHELL-1 Mix ver1, que incluye mezclas con condiciones de ruido limpias y con ruido de fondo (mix_clean y mix_both), lo que la hace adecuada para entornos realistas de conversación en mandarín.

La arquitectura SR-CorrNet emplea un encoder-decoder asimétrico con una estrategia de separación-reconstrucción (SepRe) sobre un backbone dual-path en el dominio tiempo-frecuencia. El encoder realiza una separación gruesa, mientras que el decoder, con pesos compartidos, reconstruye progresivamente características discriminativas por hablante. Un mecanismo de división dinámica basado en attractores ajusta el número de flujos de salida según la configuración de hablantes detectada. El modelo se distribuye bajo licencia MIT y está disponible en Hugging Face con un peso de solo 0.1 GB, lo que lo hace ligero y accesible para tareas de separación de voz en tiempo real o en entornos con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SR-CorrNet-SS (encoder-decoder asimétrico con SepRe, backbone dual-path TF) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado con audio en chino mandarín e inglés, pero no se documenta soporte explícito) |
| Licencia | MIT |
| Formato de pesos | PyTorch (model.pt) + config.yaml |

## Arquitectura y entrenamiento

SR-CorrNet-SS se basa en la arquitectura SR-CorrNet descrita en el artículo arXiv:2603.29097. Se trata de un encoder-decoder asimétrico que integra una estrategia de separación-reconstrucción (SepRe) sobre un backbone de doble ruta en el dominio tiempo-frecuencia. El encoder produce una separación inicial gruesa de las fuentes, y el decoder, que comparte pesos entre las distintas ramas, refina progresivamente las representaciones para reconstruir señales específicas de cada hablante. Además, un mecanismo de división dinámica basado en attractores permite que el número de flujos de salida se adapte automáticamente al número real de hablantes presentes en la mezcla, sin necesidad de conocerlo a priori.

El modelo presentado en este repositorio es un fine-tuning de un modelo pre-entrenado en el conjunto WSJ0 (inglés, 2-5 hablantes variables), utilizando el conjunto AISHELL-1 Mix ver1. Este dataset contiene mezclas de 1 a 5 hablantes en mandarín, con dos variantes: `mix_clean` (sin ruido adicional) y `mix_both` (con ruido de fondo). El checkpoint exportado corresponde a la época 2 (`best_model.pth`). No se menciona el uso de técnicas de refuerzo como RLHF o DPO; el entrenamiento es supervisado sobre pares mezcla/separación. El código de entrenamiento e inferencia está disponible en el repositorio `vu-duy-tung/byd-speech-separation` (rama `recorrnet`).

## Capacidades

- Separación de voz de un solo canal en mezclas con número variable de hablantes (de 1 a 5), adaptando dinámicamente el número de salidas mediante el mecanismo de attractores.
- Procesamiento de audio en el dominio tiempo-frecuencia, lo que permite capturar correlaciones espectrales y temporales relevantes para la separación.
- Funciona tanto con mezclas limpias como con mezclas que contienen ruido de fondo (mix_clean y mix_both).
- Inferencia mediante la clase `SSInference` de la librería `sr-corrnet`, que acepta archivos de audio y produce las pistas separadas en un directorio de salida.
- Al estar inicializado con pesos de WSJ0 (inglés) y fine-tuneado con AISHELL-1 (mandarín), el modelo es capaz de manejar audio en ambos idiomas, aunque no se garantiza un rendimiento óptimo en otros idiomas.
- No se documentan capacidades de tool calling, agentes o razonamiento multi-paso, ya que es un modelo puramente de audio.

## Casos de uso

- Transcripción de reuniones con múltiples participantes: el modelo puede separar las voces de diferentes personas en una grabación monoaural de una reunión, facilitando la posterior transcripción individual de cada hablante mediante un sistema ASR.
- Mejora de audífonos o dispositivos de asistencia auditiva: al separar la voz del hablante objetivo del ruido de fondo y de otras voces, se puede mejorar la inteligibilidad en entornos ruidosos.
- Preprocesamiento para sistemas de verificación de locutor: separar las voces de una mezcla permite extraer embeddings de cada hablante de forma más limpia, mejorando la precisión en tareas de identificación o verificación.
- Análisis forense de audio: en grabaciones con múltiples voces (p. ej., llamadas de emergencia), el modelo puede aislar cada hablante para facilitar la transcripción y el análisis posterior.
- Creación de subtítulos o doblaje automático: separar las voces de actores en una pista de audio permite procesar cada línea de diálogo por separado, simplificando la sincronización con subtítulos o el reemplazo de voces.
- Desarrollo de asistentes de voz en entornos ruidosos: en hogares inteligentes o dispositivos móviles, el modelo puede separar la voz del usuario de otras voces o ruidos antes de enviarla al sistema de reconocimiento, mejorando la precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Aunque el artículo original de SR-CorrNet reporta métricas de separación (p. ej., SI-SNR, SDR) y de rendimiento ASR, estos datos no se han incluido en la model card de este repositorio específico. Por lo tanto, no se dispone de cifras de rendimiento comparables para este fine-tuning concreto.

## Requisitos de hardware

- Tamaño del repositorio: 0.1 GB, lo que sugiere un modelo de pocos millones de parámetros (aunque no se especifica el número exacto).
- VRAM estimada: no disponible en la documentación. Dado el tamaño del archivo de pesos (~0.1 GB), se estima que la inferencia podría ejecutarse en GPUs con 2-4 GB de VRAM, pero no hay datos oficiales.
- GPU recomendadas: no se indican modelos específicos. Por el tamaño, probablemente sea compatible con GPUs de consumo como RTX 3060, RTX 4060, o incluso CPU en tiempo casi real, pero no se confirma.
- Opciones de despliegue: la librería `sr-corrnet` ofrece una API de inferencia (`SSInference`) que puede ejecutarse en `cuda:0` o CPU. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se proporcionan datos numéricos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Aunque existen otros separadores de voz como SepFormer, Conv-TasNet o las variantes de dual-path, no se han incluido comparativas directas en la model card ni en los resultados de búsqueda. Por tanto, esta sección queda sin datos.

## Limitaciones y advertencias

- El modelo está entrenado específicamente con datos de AISHELL-1 Mix (mandarín) y pre-entrenado con WSJ0 (inglés). Su rendimiento en otros idiomas o acentos no está garantizado y podría degradarse significativamente.
- La separación se realiza en un solo canal; no está diseñado para entradas estéreo o multicanal, aunque la arquitectura original soporta múltiples canales en otras variantes.
- No se documentan sesgos específicos, pero al entrenarse mayoritariamente con voz limpia y ruido artificial, el rendimiento en condiciones extremadamente ruidosas o con solapamiento severo de hablantes puede ser limitado.
- El número máximo de hablantes soportados es 5; mezclas con más fuentes pueden no separarse correctamente.
- No se han proporcionado métricas de rendimiento ni análisis de errores, por lo que es necesario validar el modelo en el caso de uso concreto antes de desplegarlo en producción.
- La licencia MIT permite uso comercial y modificación, pero el usuario debe asegurarse de cumplir con las licencias de los datos de entrenamiento (AISHELL-1 y WSJ0) si se redistribuyen o se utilizan en productos comerciales.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/playwithmino/sr-corrnet-ss-1ch-aishell1mix-ver1)
- [Repositorio oficial de SR-CorrNet (GitHub)](https://github.com/dmlguq456/SR_CorrNet_SS)
- [Artículo en arXiv](https://arxiv.org/abs/2603.29097)
- [Código de entrenamiento e inferencia (rama recorrnet)](https://github.com/vu-duy-tung/byd-speech-separation)

# scottlowry/Qwen3.8-27B-oQ4e-mtp

## Resumen

Qwen3.8-27B-oQ4e-mtp es una cuantización de precisión mixta del modelo Qwen/Qwen3.8-27B, publicada por el usuario scottlowry. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos orientada a la inferencia eficiente en Apple Silicon mediante la librería MLX. La cuantización se ha realizado con la herramienta oQ de oMLX (versión v0.7.4.dev1), que asigna distintos niveles de bits por grupo de pesos en función de su sensibilidad, logrando un promedio efectivo de 5,044 bits por peso.

El checkpoint contiene 27.781 millones de parámetros lógicos distribuidos en tres componentes: el modelo de lenguaje (26.896B), un codificador visual (0.461B) y una cabeza MTP (multi-token prediction, 0.425B). Esta estructura indica que el modelo base es multimodal (texto e imagen) e incorpora decodificación especulativa mediante predicción multi-token, lo que puede acelerar la generación en hardware compatible.

Su relevancia actual radica en que permite ejecutar un modelo de aproximadamente 28.000 millones de parámetros con visión en equipos con memoria unificada de gama alta (Mac Studio, MacBook Pro con chip Max/Ultra), ocupando 17,5 GB en disco y 16,314 GiB en memoria, un tamaño manejable frente a los más de 55 GB que requeriría el checkpoint en BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje + vision encoder + cabeza MTP); familia qwen3_5 |
| Parametros totales | 27.781.427.952 (27,781B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precisión mixta affine con grupo 64: 4-bit (69,807% de pesos), 5-bit (23,680%), 6-bit (4,615%), 8-bit (0,041%) y BF16 (1,857%); promedio efectivo 5,044 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería mlx) |

## Arquitectura y entrenamiento

El modelo base Qwen/Qwen3.8-27B pertenece a la familia qwen3_5, según la etiqueta del repositorio. La estructura del checkpoint cuantizado revela tres bloques diferenciados: un modelo de lenguaje de 26,896B parámetros, un módulo de visión de 0,461B y una cabeza MTP de 0,425B. La presencia de esta última sugiere que el modelo base incorpora predicción multi-token, una técnica de decodificación especulativa que permite proponer varios tokens por paso y validarlos en paralelo, reduciendo la latencia de generación.

No se dispone de información sobre el proceso de entrenamiento del modelo base: número de tokens, composición del dataset, uso de RLHF o DPO, ni innovaciones de atención. La model card del repositorio cuantizado se limita a documentar el proceso de cuantización y la distribución de bits, sin detallar el entrenamiento original. La cuantización se realizó con oQ (oMLX v0.7.4.dev1), que aplica precisión mixta por grupos de 64 pesos, preservando en BF16 el 1,857% de los pesos (0,516B), presumiblemente capas sensibles como embeddings o normas.

## Capacidades

- Generación de texto y razonamiento: el bloque de lenguaje de 26,896B parámetros soporta las capacidades habituales de la familia Qwen3.5.
- Procesamiento de imágenes: incluye un codificador visual de 0,461B parámetros, por lo que el modelo es multimodal entrada de imagen y texto.
- Decodificación especulativa: la cabeza MTP de 0,425B parámetros permite acelerar la inferencia mediante predicción multi-token, siempre que el runtime MLX la utilice.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking explícito, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint está empaquetado para MLX y ocupa 16,314 GiB en memoria, por lo que puede ejecutarse en Mac con memoria unificada de 24 GB o más, cubriendo asistentes personales y prototipado sin depender de la nube.
- Análisis de documentos con imágenes: gracias al codificador visual de 0,461B parámetros, puede procesar capturas, gráficos o páginas escaneadas junto a instrucciones de texto para extraer y resumir información.
- Generación de texto asistida por latencia baja: la cabeza MTP permite decodificación especulativa, adecuada para aplicaciones interactivas donde la velocidad de respuesta por token es crítica, como autocompletado o chat en tiempo real.
- Investigación en cuantización: la distribución documentada de bits por componente (4/5/6/8-bit y BF16) sirve como referencia para estudiar el impacto de la precisión mixta en calidad y memoria en modelos de ~28B.
- Despliegue en estaciones de trabajo de un solo equipo: con 17,5 GB de repo, es viable distribuirlo en portátiles de gama alta para tareas de generación y análisis sin infraestructura de servidores.
- Evaluación comparativa de runtimes MLX: al estar atado a la librería mlx y a una versión concreta de oMLX, permite medir throughput y perplejidad frente al modelo base en BF16 en el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 16,314 GiB para los pesos cuantizados; añadir espacio para caché KV y activaciones, por lo que se recomienda un mínimo de 24 GB de memoria unificada y 32 GB o más para contextos largos.
- GPU recomendadas: Apple Silicon con memoria unificada (M-series Max y Ultra); no está pensado para GPU NVIDIA/AMD, ya que el formato es MLX.
- ¿Cabe en GPU de consumo? Sí, en equipos Apple con memoria unificada suficiente (Mac Studio, MacBook Pro de gama alta); no aplica a RTX 4090 u otras GPU discretas por incompatibilidad de formato.
- Opciones de despliegue: MLX y oMLX (versión v0.7.4.dev1 o superior); no se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la cabeza MTP está diseñada para reducir latencia mediante decodificación especulativa, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-oQ4e-mtp (este) | 27,781B | no disponible | safetensors MLX, 5,044 bits/peso | no disponible | Cuantización mixta para Apple Silicon con visión y MTP |
| Qwen/Qwen3.8-27B (base) | 27,781B (estimado por correspondencia) | no disponible | safetensors BF16 | no disponible | Modelo original sin cuantizar; mayor huella de memoria |
| Alternativas de ~27B en MLX | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables de otros modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- La licencia no está declarada en la información disponible; antes de un uso comercial debe verificarse la licencia del modelo base Qwen/Qwen3.8-27B en su repositorio original.
- Es una cuantización de terceros: la calidad puede degradarse respecto al modelo en BF16, especialmente en tareas de razonamiento matemático o código, y no se aportan métricas de perplejidad ni evaluaciones comparativas.
- Dependencia estricta de MLX y de oMLX v0.7.4.dev1: no es portable a otros runtimes sin reconversión.
- La model card advierte de que se re-cuantizó el 2026-11-11 y recomienda volver a descargar copias anteriores; versiones antiguas pueden diferir en precisión.
- No se documentan sesgos, idiomas soportados ni riesgos de alucinación específicos; deben asumirse los del modelo base.
- El contexto máximo no está indicado, lo que impide planificar despliegues con ventanas largas sin pruebas empíricas.
- El repositorio tiene 1.325 descargas y 29 likes, un nivel de validación comunitario moderado; conviene evaluar en el caso de uso concreto antes de producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/scottlowry/Qwen3.8-27B-oQ4e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx

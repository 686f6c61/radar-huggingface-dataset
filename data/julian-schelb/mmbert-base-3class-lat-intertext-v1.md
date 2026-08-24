# julian-schelb/mmbert-base-3class-lat-intertext-v1

## Resumen

El modelo `julian-schelb/mmbert-base-3class-lat-intertext-v1` es un clasificador de pares de secuencias (sequence-pair classification) diseñado para detectar y tipificar vínculos intertextuales entre Jerónimo (Hieronymus) y otros autores clásicos latinos. Desarrollado por Julian Schelb, este modelo es un fine-tuning del encoder multilingüe `jhu-clsp/mmBERT-base`, que a su vez es un moderno encoder entrenado sobre 3 billones de tokens en más de 1800 lenguas con la técnica de annealed language learning (ALL). El modelo distingue tres clases: `no_match` (pasajes sin relación), `cit` (cita o reutilización léxica cercana) y `cf` (eco temático suelto, "confer").

La relevancia de este modelo radica en que aborda un problema específico de las humanidades digitales: la extracción automática de intertextualidades en literatura latina, una tarea que tradicionalmente requería trabajo manual de filólogos. Al estar entrenado sobre el benchmark Loci Similes, el modelo permite integrar la detección de intertextos en flujos de trabajo computacionales, como el paquete Python `LociSimiles`. Con 307,5 millones de parámetros y una ventana de contexto de 512 tokens, es un modelo compacto pero especializado, licenciado bajo Apache 2.0, lo que facilita su uso comercial y académico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (basado en mmBERT-base) |
| Parametros totales | 307.532.547 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, compatible con cuantización estándar de transformers) |
| Idiomas soportados | Latin (la) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `jhu-clsp/mmBERT-base`, un encoder multilingüe moderno que emplea la técnica de annealed language learning (ALL) durante el preentrenamiento. Esta técnica, descrita en el paper de mmBERT (arXiv:2509.06888), consiste en un entrenamiento progresivo que comienza con lenguas de alto recurso y va incorporando lenguas de menor recurso de forma gradual, lo que mejora el rendimiento en tareas multilingües. El modelo base fue entrenado sobre 3 billones de tokens en más de 1800 lenguas, superando a XLM-R en diversas tareas.

El fine-tuning se realizó sobre uno de los cinco splits de validación cruzada del benchmark Loci Similes, un conjunto de datos diseñado para extraer intertextualidades en literatura latina. El entrenamiento utilizó muestreo balanceado de clases, ya que los corpus reales son abrumadoramente negativos (la mayoría de pares de pasajes no tienen relación). El modelo distingue tres clases: `no_match`, `cit` (cita) y `cf` (confer). A diferencia de versiones anteriores que resolvían la tarea binaria (match/no match), este checkpoint introduce la distinción entre los dos tipos de relación positiva, lo que lo hace más informativo pero no intercambiable con los modelos binarios.

## Capacidades

- Clasificación de pares de pasajes latinos en tres categorías: sin relación, cita literal o parafraseada, y eco temático.
- Detección de reutilización léxica cercana (citas) y de similitud temática difusa (confer).
- Integración con el paquete Python `LociSimiles` para flujos de trabajo de intertextualidad.
- Soporte para clasificación de secuencias con entrada de dos textos (sequence-pair classification) mediante tokenización estándar de transformers.
- Permite ajustar umbrales por clase (0.91 para `cit`, 0.92 para `cf`) para controlar el equilibrio entre precisión y recall en corpus desbalanceados.
- Compatible con la librería `transformers` y con `text-embeddings-inference` para despliegue en producción.

## Casos de uso

- Análisis filológico asistido por ordenador: el modelo puede procesar grandes corpus latinos para identificar pasajes de Jerónimo que reutilizan o evocan textos de autores clásicos, ahorrando horas de búsqueda manual.
- Construcción de bases de datos de intertextualidad: integrado en el pipeline de `LociSimiles`, permite generar automáticamente listas de referencias cruzadas entre autores, útiles para estudios de recepción clásica.
- Verificación de citas en ediciones críticas: los editores pueden usar el modelo para comprobar si un pasaje marcado como cita realmente tiene una correspondencia léxica cercana con el texto fuente.
- Detección de ecos temáticos en literatura patrística: el modelo distingue entre citas explícitas y alusiones temáticas, lo que ayuda a estudiar la influencia de la filosofía clásica en el pensamiento cristiano.
- Filtrado de candidatos en motores de búsqueda de similitud: como paso posterior a una búsqueda por similitud vectorial, el modelo puede descartar falsos positivos y clasificar los aciertos según su tipo.
- Docencia e investigación en humanidades digitales: sirve como herramienta didáctica para explorar cómo la computación puede abordar problemas de crítica textual y estilometría.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo base mmBERT-base reporta mejoras sobre XLM-R en tareas multilingües, pero para este fine-tuning específico no se proporcionan métricas de evaluación (precisión, recall, F1) en la model card ni en la documentación accesible. Los umbrales por clase (0.91 para `cit`, 0.92 para `cf`) sugieren que el autor ha realizado validación empírica, pero los números exactos no están disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia: con 307,5 millones de parámetros, en precisión FP32 se necesitan aproximadamente 1,2 GB de memoria para los pesos. Con cuantización a INT8, la memoria se reduce a unos 0,6 GB. Para clasificación de pares con longitud máxima de 512 tokens, la memoria adicional para activaciones es moderada (típicamente menos de 1 GB).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo sin problemas. Tarjetas como NVIDIA GTX 1660, RTX 2060, RTX 3060 o superiores son suficientes. Para procesamiento por lotes o despliegue en producción, se recomienda una GPU con 8 GB o más (RTX 3070, RTX 4080, A10, A100).
- Cabe en GPUs de consumo: sí, es un modelo de tamaño medio que puede ejecutarse en GPUs de gama media e incluso en CPU con razonable velocidad para tareas por lotes.
- Opciones de despliegue: compatible con `transformers` (PyTorch), `text-embeddings-inference` (mencionado en los tags), y puede convertirse a ONNX o TensorRT para optimización. También es posible usar `vLLM` aunque está más orientado a generación; para clasificación, `TGI` (Text Generation Inference) no es necesario, pero `text-embeddings-inference` es adecuado.
- Latencia y throughput estimados: no se dispone de datos oficiales. En una GPU RTX 3090, una inferencia de un par de frases (longitud ~100 tokens) debería tardar menos de 10 ms. En CPU, podría tardar unos 100-200 ms por par.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de clasificación de intertextualidad latina. El autor tiene un modelo anterior, `julian-schelb/roberta-base-latin-v2-class-lat-intertext-v1`, que resuelve la versión binaria del problema (match/no match). La diferencia principal es que el modelo actual distingue entre `cit` y `cf`, mientras que el binario agrupa ambos en una sola clase positiva. No se han publicado métricas comparativas entre ambos.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para la detección de intertextualidad entre Jerónimo y autores clásicos; su rendimiento en otros pares de autores latinos puede ser inferior.
- La ventana de contexto está limitada a 512 tokens, por lo que pasajes muy largos deben truncarse, lo que puede perder información relevante.
- El modelo asume que los pares de entrada siguen el patrón `<s> Jerónimo </s></s> Candidato </s>`; usos fuera de este esquema pueden degradar el rendimiento.
- La clase `cf` (eco temático) es intrínsecamente difícil de clasificar porque carece de señal léxica fiable, lo que puede generar falsos positivos si se usa el argmax sin umbrales.
- Los umbrales recomendados (0.91 para `cit`, 0.92 para `cf`) están calibrados para el corpus Loci Similes; en otros corpus pueden necesitar recalibración.
- El modelo solo procesa latín; no es multilingüe en la práctica, aunque su base mmBERT lo sea.
- No se han publicado evaluaciones de sesgos o de comportamiento en dominios fuera de la literatura clásica; úsese con precaución en contextos no previstos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/julian-schelb/mmbert-base-3class-lat-intertext-v1
- Modelo base mmBERT: https://huggingface.co/jhu-clsp/mmBERT-base
- Repositorio GitHub de mmBERT: https://github.com/JHU-CLSP/mmBERT/
- Paper de mmBERT (arXiv:2509.06888): https://arxiv.org/abs/2509.06888
- Paper de Loci Similes (arXiv:2601.07533): https://arxiv.org/abs/2601.07533
- Documentación de LociSimiles: https://julianschelb.github.io/locisimiles/api/
- Perfil del autor en Hugging Face: https://huggingface.co/julian-schelb

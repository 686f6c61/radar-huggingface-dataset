# nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-LiLiCorr

## Resumen

NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-LiLiCorr es un checkpoint borrador (*drafter*) de decodificación especulativa publicado por NVIDIA dentro de la familia Nemotron-3.5-Super. No es un modelo generativo autónomo: se carga junto al modelo objetivo NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4, un modelo híbrido de lenguaje y visión de tipo LatentMoE con 120.000 millones de parámetros totales y 12.000 millones activos, y se encarga de proponer tokens que el objetivo verifica después. Su propósito es reducir la latencia de generación en despliegues de baja concurrencia.

El borrador implementa el método LiLiCorr, descrito en el artículo arXiv:2608.20530, que correlaciona las candidatas paralelas generadas en cada posición para elevar la tasa de aceptación. La arquitectura es un transformer denso con atención GQA bidireccional (32 cabezas de consulta, 8 de clave-valor), atención de ventana deslizante de 8192 posiciones, convolución dinámica agrupada en cada subcapa y una cabeza de dos capas que correlaciona las 8 candidatas principales. Se distribuye en safetensors con cuantización NVFP4 y ocupa 4,9 GB en el repositorio.

Es relevante porque NVIDIA lo orienta a DGX Spark (GB10) y a GPUs Hopper y Blackwell de centro de datos, y porque la licencia OpenMDW-1.1 habilita uso comercial. No se han publicado cifras de *speedup* ni de tasa de aceptación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Dense GQA (MLP denso + atención GQA) con atención bidireccional de ventana deslizante y convolución dinámica agrupada; cabeza LiLiCorr de dos capas |
| Parámetros totales | 964.954.506 según los pesos safetensors del repositorio; la model card declara 1,13B parámetros entrenados (37M en la cabeza LiLiCorr) más una copia NVFP4 de 0,54B de la LM head del objetivo |
| Parámetros activos | No aplica (el borrador es denso); el modelo objetivo LatentMoE declara 120B totales y 12B activos |
| Longitud de contexto | 8192 posiciones de ventana deslizante en el borrador; el objetivo soporta hasta 1M tokens y el despliegue de referencia fija 114.688 |
| Tipos de cuantización | NVFP4 (modelopt_fp4); los tags del repositorio lo etiquetan además como 8-bit |
| Idiomas soportados | Inglés, francés, español, italiano, alemán, japonés, hindi, coreano, portugués de Brasil y chino |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 4,9 GB |
| Motores de ejecución soportados | vLLM, SGLang, TensorRT-LLM |
| Hardware compatible | NVIDIA Blackwell (incluida DGX Spark, GB10) y NVIDIA Hopper |
| Sistema operativo | Linux |
| Versión | v1.0 (LiLiCorr GA) |
| Fecha de publicación | 15/10/2026 |

## Arquitectura y entrenamiento

El checkpoint contiene únicamente el borrador. Su bloque de atención usa GQA bidireccional con 32 cabezas de consulta y 8 de clave-valor, y todas las capas aplican atención de ventana deslizante sobre las 8192 posiciones de contexto más recientes, lo que acota el coste por paso de borrador. Cada subcapa de atención y de MLP va envuelta en una convolución dinámica agrupada. La cabeza LiLiCorr, de dos capas y 37M de parámetros, correlaciona las 8 candidatas superiores que el borrador propone en cada posición de borrador; el resto de los 1,13B parámetros entrenados corresponde al cuerpo del borrador. El modelo se construyó con la librería ModelOpt de NVIDIA, que cubre cuantización, poda, búsqueda de arquitectura, destilación, decodificación especulativa y sparsidad.

No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron RLHF o DPO sobre el borrador. La model card remite al dataset Nemotron-Post-Training-Dataset-v2 y a las fichas de los modelos objetivo BF16 y NVFP4 para los datos subyacentes de la familia. El tag `qwen3` presente en los metadatos del repositorio sugiere una tokenización derivada de esa familia, pero no se confirma en el texto de la model card.

## Capacidades

- El borrador no genera texto de forma autónoma; su salida son candidatas de token que el modelo objetivo valida. Las capacidades funcionales residen en el objetivo.
- Generación de texto, razonamiento y chat, con salida de razonamiento explícita (*reasoning output*) según la model card del objetivo.
- Comprensión visual: el objetivo es un modelo de visión y lenguaje, por lo que el sistema combinado procesa imágenes junto a texto.
- Salida en JSON estructurado.
- *Tool calling* y llamadas a funciones.
- Flujos agénticos y razonamiento multi-paso como caso de uso declarado por el fabricante.
- Multilingüe en diez idiomas: inglés, francés, español, italiano, alemán, japonés, hindi, coreano, portugués de Brasil y chino.
- Decodificación especulativa asistida: el borrador se combina con el objetivo para reducir latencia en regímenes de baja concurrencia.
- El tag `mtp` (multi-token prediction) figura en los metadatos del repositorio.

## Casos de uso

- Servicio de inferencia de baja latencia en DGX Spark: cargar el objetivo NVFP4 junto a este borrador en una GB10 permite servir un modelo de 120B totales con decodificación especulativa dentro de los 114.688 tokens de contexto configurados.
- Asistentes conversacionales interactivos: la decodificación especulativa reduce el tiempo hasta el primer token útil percibido en diálogos multi-turno, donde la latencia por token es el factor dominante de la experiencia.
- RAG sobre documentación extensa: la ventana de 114.688 tokens del despliegue de referencia permite insertar manuales, contratos o bases de conocimiento completas sin troceado agresivo, y el borrador acelera la respuesta.
- Flujos agénticos con *tool calling*: el objetivo emite JSON estructurado y llamadas a funciones, de modo que el sistema puede encadenar pasos de planificación, consulta de APIs y verificación con latencia reducida.
- Análisis de documentos con componente visual: al ser un modelo de visión y lenguaje, el objetivo puede extraer información de capturas, gráficos o PDF escaneados dentro de la misma conversación.
- Asistentes de código en producción: el objetivo genera código y llamadas a herramientas, y el borrador abarata el coste por token en completados largos dentro de pipelines de integración continua.
- Reducción de coste por token en cargas de baja concurrencia: el fabricante posiciona explícitamente el checkpoint para este escenario, donde la GPU queda infrautilizada en cómputo y el cuello de botella es la memoria.
- Autocompletado y resumen por lotes pequeños: tareas con poca paralelización donde el *overhead* del verificador del objetivo se amortiza con una tasa de aceptación alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K, tasa de aceptación de borradores, *speedup* frente a decodificación autorregresiva ni ningún otro dato cuantitativo de rendimiento.

## Requisitos de hardware

- Pesos del borrador: con los 964.954.506 parámetros medidos en safetensors y cuantización NVFP4, el peso teórico ronda los 0,5 GB; contando la copia NVFP4 de 0,54B de la LM head del objetivo, los *buffers* y el KV de la ventana de 8192 tokens, la reserva práctica estimada es inferior a 2 GB de VRAM adicional. Estimación aritmética, no publicada por el fabricante.
- Modelo objetivo NVFP4 de 120B: a 4 bits por parámetro, los pesos rondan los 60 GB. Estimación aritmética, no confirmada en la documentación.
- GPUs recomendadas: NVIDIA Blackwell (B200, GB10 de DGX Spark) y NVIDIA Hopper (H100, H200), según la lista de microarquitecturas compatibles de la model card.
- GPU de consumo: el sistema completo no cabe en tarjetas de 24 GB como la RTX 4090. DGX Spark (GB10) cuenta con memoria unificada y es el objetivo declarado del checkpoint.
- Opciones de despliegue: vLLM, SGLang y TensorRT-LLM, con Linux como sistema operativo preferido. El borrador se carga junto al objetivo NVFP4 en la misma configuración de servicio.
- Latencia y *throughput*: no disponibles. No se publican cifras de *speedup*, tasa de aceptación ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Rol | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16 | Objetivo en precisión completa | 120B totales, 12B activos | Hasta 1M tokens | OpenMDW-1.1 | HuggingFace |
| NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4 | Objetivo cuantizado | 120B totales, 12B activos | Hasta 1M tokens | OpenMDW-1.1 | HuggingFace |
| NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-LiLiCorr | Borrador de decodificación especulativa | 0,96B medidos, 1,13B declarados | Ventana de 8192 en el borrador; 114.688 en el servicio | OpenMDW-1.1 | HuggingFace |

Existen otras familias de borradores para decodificación especulativa, como EAGLE-3 o Medusa, pero no se dispone de datos verificados de parámetros, contexto, licencia ni rendimiento en la información proporcionada, por lo que no se incluyen cifras comparativas.

## Limitaciones y advertencias

- No es un modelo utilizable por sí solo: requiere cargar el modelo objetivo NVFP4 (o BF16) en el mismo servicio. Sin el objetivo no produce texto.
- El repositorio declara dos *base models* (BF16 y NVFP4); el uso previsto y ajustado es con el objetivo NVFP4. Emplearlo con otro objetivo o con una versión distinta puede degradar la tasa de aceptación o fallar directamente.
- Dependencia de hardware: solo se documentan microarquitecturas NVIDIA Blackwell y Hopper, con Linux. No hay soporte declarado para CPU, AMD o Apple Silicon.
- El borrador aplica atención de ventana deslizante de 8192 posiciones, de modo que en contextos de 114.688 tokens solo ve la cola reciente; la información no aclara cómo afecta esto a la tasa de aceptación en contextos largos.
- Ausencia total de benchmarks: no hay evidencia publicada de *speedup* real, tasa de aceptación ni comparación con decodificación autorregresiva estándar.
- Alucinación y sesgos: la información disponible no incluye ninguna evaluación de sesgos ni tasas de alucinación, ni para el borrador ni para el objetivo. La model card tampoco especifica si el muestreo conjunto con LiLiCorr preserva exactamente la distribución del objetivo.
- Idiomas: se declaran diez idiomas, pero no se publica rendimiento desagregado por idioma; el comportamiento fuera de esa lista no está documentado.
- Licencia: OpenMDW-1.1. La model card afirma que el modelo está listo para uso comercial y no comercial, pero conviene revisar los términos completos de la licencia antes de desplegarlo en producción.
- Fecha de publicación reciente y tracción baja (741 descargas, 6 valoraciones positivas en el momento de redactar la ficha), lo que limita la evidencia de terceros en producción.
- La diferencia entre los 964.954.506 parámetros contados en los safetensors y los 1,13B más 0,54B declarados en la model card no se explica en la documentación; hay que verificar el contenido real del repositorio antes de dimensionar el despliegue.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-LiLiCorr)
- [Modelo objetivo BF16](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16)
- [Modelo objetivo NVFP4](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4)
- [Artículo de LiLiCorr (arXiv:2608.20530)](https://arxiv.org/abs/2608.20530)
- [NVIDIA Model Optimizer](https://github.com/NVIDIA/Model-Optimizer)
- [Licencia OpenMDW-1.1](https://openmdw.ai/license/1-1/)
- [Sitio de NVIDIA](https://www.nvidia.com/)

# mradermacher/Himeyuri-Magnum-12B-HereticLoRA-i1-GGUF

## Resumen

Este modelo es una colección de pesos GGUF cuantizados con importancia (i1-imatrix) del modelo yamatazen/Himeyuri-Magnum-12B-HereticLoRA. Ha sido generada por mradermacher, un cuantizador habitual en Hugging Face, y está pensada para facilitar la ejecución del modelo en entornos con recursos limitados mediante distintos niveles de compresión. El modelo base tiene 12.247.782.400 parámetros, se etiqueta como conversacional y compatible con el formato ChatML, y declara soporte para inglés y japonés. No se proporcionan datos sobre arquitectura ni longitud de contexto en la información disponible.

Su relevancia radica en la posibilidad de seleccionar entre 15 cuantizaciones i1-imatrix, desde IQ1_M (3.3 GB) hasta Q6_K (10.2 GB), lo que permite desplegar un modelo de aproximadamente 12B en hardware de consumo. Al tratarse de archivos GGUF, puede usarse directamente con llama.cpp, Ollama u otros ejecutores compatibles. La ausencia de benchmarks y documentación detallada del modelo base, sin embargo, limita la evaluación objetiva de su calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 12.247.782.400 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_K_S, i1-Q4_K_M, i1-Q6_K, archivo imatrix |
| Idiomas soportados | Inglés, japonés |
| Licencia | no disponible |
| Formato de pesos | GGUF (con cuantizaciones i1-imatrix) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura del modelo base ni los datos de entrenamiento. Las etiquetas `mergekit` y `merge` indican que se trata de un modelo fusionado a partir de otros, mientras que el nombre "HereticLoRA" sugiere la aplicación de una adaptación de tipo LoRA sobre esa fusión. No se especifican los componentes originales, el número de tokens de entrenamiento, la composición del dataset ni si se empleó RLHF o DPO. La única característica técnica documentada es el uso del formato ChatML como template de conversación.

## Capacidades

- Modelo conversacional: la etiqueta `conversational` y el uso de ChatML indican que está orientado a diálogos de múltiples turnos.
- Idiomas: soporta inglés y japonés según los metadatos.
- No se dispone de información sobre tool calling, visión, audio, razonamiento estructurado o funciones de agente en la documentación proporcionada.
- Las cuantizaciones i1-imatrix están diseñadas para preservar en la mayor medida posible la calidad del modelo original al comprimirlo, pero no añaden capacidades nuevas al modelo base.

## Casos de uso

- Asistente conversacional bilingüe: puede integrarse en aplicaciones de chat en inglés o japonés mediante llama.cpp o LM Studio, aprovechando la cuantización i1-Q4_K_M para ejecutarse en una GPU de consumo.
- Traducción asistida con privacidad: al ejecutarse de forma local, permite traducir textos entre inglés y japonés sin enviar datos a servicios de terceros.
- Investigación sobre cuantización: permite comparar el efecto de diferentes niveles de compresión (de i1-IQ1_M a i1-Q6_K) sobre un mismo modelo de 12B, midiendo la degradación de calidad con conjuntos de evaluación propios.
- Prototipado de aplicaciones creativas: por su naturaleza conversacional y el nombre del modelo, es adecuado para generadores de ficción o juegos de rol, siempre que el contenido se limite a los idiomas soportados.
- Evaluación de entornos de inferencia local: sirve como caso de prueba para comparar el rendimiento de Ollama, llama.cpp y otros ejecutores GGUF con distintos niveles de cuantización, midiendo tokens por segundo.
- Asistencia lingüística en desarrollo: puede emplearse en documentación técnica o comentarios de código que requieran respuestas en japonés en un entorno sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: desde aproximadamente 4 GB para i1-IQ1_M (3.3 GB) hasta 12-14 GB para i1-Q6_K (10.2 GB), considerando el overhead de la ventana de contexto. Para i1-Q4_K_M (7.6 GB) se recomienda al menos 8-10 GB de VRAM.
- GPU recomendadas: una RTX 3060 de 12GB o superior para cuantizaciones hasta i1-Q4_K_M; una RTX 3090 o RTX 4090 de 24GB para i1-Q6_K y para disponer de margen en el contexto.
- Cabe en GPU de consumo: con 8 GB de VRAM se pueden ejecutar cuants de hasta 7 GB (por ejemplo, i1-Q4_K_S) con un contexto corto; con 12 GB se puede ejecutar i1-Q4_K_M con más margen.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, kobold.cpp y cualquier ejecutor compatible con el formato GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Himeyuri-Magnum-12B-HereticLoRA-i1-GGUF (este repo) | 12.247.782.400 | no disponible | no disponible | GGUF con i1-imatrix |
| Himeyuri-Magnum-12B-HereticLoRA-GGUF | 12.247.782.400 | no disponible | no disponible | GGUF estático |
| yamatazen/Himeyuri-Magnum-12B-HereticLoRA | 12.247.782.400 | no disponible | no disponible | probablemente safetensors, no documentado |

La diferencia entre la versión i1-imatrix y la estática es el uso de una matriz de importancia (imatrix) para calcular los pesos de cuantización. Según la documentación del autor, los cuants imatrix suelen mantener mejor calidad que los equivalentes estáticos, aunque no se han publicado benchmarks en la información disponible para confirmarlo.

## Limitaciones y advertencias

- Licencia no especificada: no se puede garantizar que el modelo sea apto para uso comercial.
- Cuantizaciones extremas (i1-IQ1_M, i1-Q2_K_S) están etiquetadas en la model card como "mostly desperate" y "very low quality", lo que indica una degradación significativa de la calidad.
- La información disponible no documenta la arquitectura, el contexto ni los datos de entrenamiento del modelo base, lo que impide evaluar su idoneidad para tareas concretas.
- Sin benchmarks públicos, no es posible comparar objetivamente el rendimiento con otros modelos.
- El soporte de idiomas se limita a inglés y japonés; puede fallar en otras lenguas.
- Al ser una cuantización, las limitaciones del modelo base se mantienen o se amplifican según el nivel de compresión elegido.

## Enlaces

- Repositorio del modelo (cuantizaciones i1): https://huggingface.co/mradermacher/Himeyuri-Magnum-12B-HereticLoRA-i1-GGUF
- Repositorio de cuantizaciones estáticas (misma base): https://huggingface.co/mradermacher/Himeyuri-Magnum-12B-HereticLoRA-GGUF
- Modelo base original: https://huggingface.co/yamatazen/Himeyuri-Magnum-12B-HereticLoRA

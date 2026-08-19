# mradermacher/Ministral-3-14B-Instruct-2512-BF16-SOM-MPOA-i1-GGUF

## Resumen

Ministral-3-14B-Instruct-2512-BF16-SOM-MPOA-i1-GGUF es una cuantización GGUF con matriz de importancia (imatrix) del modelo Ministral-3-14B-Instruct-2512, creada por el usuario mradermacher. El modelo base original, desarrollado por Mistral AI, es el mayor de la familia Ministral 3: combina un modelo de lenguaje de 13.5B parámetros con un codificador de visión de 0.4B parámetros, lo que lo convierte en un modelo multimodal optimizado para despliegue en el borde (edge deployment). Según la documentación disponible, ofrece un rendimiento comparable al de Mistral Small 3.2 24B, pero con un coste computacional significativamente menor.

Esta versión concreta es un fine-tuning modificado del modelo original de Mistral AI, identificado como 0xA50C1A1/Ministral-3-14B-Instruct-2512-BF16-SOM-MPOA, que incorpora técnicas de "abliteración" (eliminación de rechazos) y ajuste adicional. El repositorio de mradermacher ofrece tanto cuantizaciones estáticas como versiones con imatrix, siendo esta última la que proporciona mejor calidad de cuantización para un mismo tamaño de archivo. La relevancia de este modelo radica en su capacidad para ejecutarse en hardware de consumo con una calidad cercana a la de modelos mucho más grandes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (lenguaje + vision) |
| Parametros totales | 13.506.073.600 (13.5B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M (lista parcial) |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors disponible en el repositorio base) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer multimodal que combina un modelo de lenguaje de 13.5B parámetros con un codificador de visión de 0.4B parámetros. Según la información disponible, el modelo está optimizado para despliegue en el borde y soporta precisión FP8. El modelo original de Mistral AI fue entrenado mediante instrucción post-entrenamiento (instruct post-training), lo que lo hace adecuado para tareas de chat y seguimiento de instrucciones.

Esta versión concreta (SOM-MPOA) es un fine-tuning adicional sobre el modelo de Mistral AI que incorpora técnicas de "abliteración", un proceso que elimina o reduce los mecanismos de rechazo del modelo. El autor del repositorio GGUF, mradermacher, ha aplicado cuantización con imatrix (matriz de importancia), una técnica que mejora la calidad de la cuantización al ponderar la importancia de cada tensor durante el proceso de cuantización. Los detalles específicos del entrenamiento adicional (datos, número de tokens, método de alineación) no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto y conversación multilingüe en 11 idiomas: inglés, francés, español, alemán, italiano, portugués, neerlandés, chino, japonés, coreano y árabe.
- Capacidades multimodales: el modelo base incluye un codificador de visión de 0.4B parámetros, lo que le permite procesar imágenes además de texto.
- Instrucción y chat: el modelo está post-entrenado específicamente para tareas de instrucción, lo que lo hace adecuado para asistentes conversacionales.
- Rendimiento comparable a modelos de mayor tamaño: según la documentación de Mistral AI, ofrece capacidades similares a Mistral Small 3.2 24B con un coste computacional menor.
- Optimizado para despliegue en el borde: diseñado para ejecutarse en dispositivos con recursos limitados.
- Modelo "uncensored"/"decensored": el fine-tuning SOM-MPOA ha sido modificado para reducir los rechazos del modelo ante peticiones controvertidas.
- Soporte de endpoints: el modelo es compatible con vLLM y otros servidores de inferencia estándar.

## Casos de uso

- Asistentes conversacionales locales: con cuantizaciones Q4_K_M (8.3 GB) o Q4_K_S (7.9 GB), el modelo puede ejecutarse en una GPU de consumo como una RTX 3060 o RTX 4060, ofreciendo un asistente multilingüe sin conexión a internet.
- Aplicaciones de chat sin censura: el fine-tuning abliterado permite desplegar asistentes que responden a temas que los modelos estándar suelen rechazar, útil para investigación en seguridad de IA o aplicaciones de rolplay.
- Análisis de imágenes en el borde: gracias al codificador de visión, el modelo puede procesar imágenes en dispositivos con recursos limitados, como estaciones de trabajo o servidores de gama media.
- Generación de contenido multilingüe: con soporte para 11 idiomas, puede utilizarse para traducción, redacción de contenido o localización en entornos donde se requiera privacidad de datos.
- Desarrollo de agentes conversacionales con vLLM: el modelo es compatible con vLLM, lo que permite desplegarlo como backend para aplicaciones de agentes con API compatible con OpenAI.
- Investigación en alineación y seguridad: al ser una versión abliterada, permite estudiar el comportamiento del modelo sin mecanismos de rechazo, útil para investigación académica sobre seguridad de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 4 GB (cuantización IQ2_M) y 10 GB (cuantización Q4_K_M) para el modelo GGUF, dependiendo de la cuantización elegida y la longitud de contexto.
- GPU recomendadas: para cuantizaciones Q4 (7.9-8.3 GB), se recomienda una GPU con al menos 10-12 GB de VRAM, como RTX 3060 12GB, RTX 4070 o superior. Para cuantizaciones IQ2/IQ3 (4-6 GB), puede ejecutarse en GPUs con 6-8 GB de VRAM, como RTX 2060 o RTX 3050.
- Compatibilidad con GPU de consumo: sí, las cuantizaciones más pequeñas (IQ2, IQ3) caben en GPUs de consumo de gama media.
- Opciones de despliegue: vLLM, llama.cpp, Ollama (mediante importación de GGUF), text-generation-webui y cualquier otro framework compatible con GGUF.
- Latencia y throughput: no disponible en la información proporcionada. Dependerá de la GPU, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Ministral-3-14B-Instruct-2512 (original) | 13.5B + 0.4B vision | no disponible | Apache 2.0 | Modelo base de Mistral AI, multimodal, optimizado para edge |
| Mistral Small 3.2 24B | 24B | no disponible | Apache 2.0 | Modelo de mayor tamaño de Mistral, rendimiento superior pero mayor coste |
| Ministral-3-14B-Instruct-2512-BF16-SOM-MPOA | 13.5B + 0.4B vision | no disponible | Apache 2.0 | Fine-tuning abliterado del modelo base, disponible en GGUF |

El modelo original de Mistral AI se compara directamente con Mistral Small 3.2 24B, ofreciendo un rendimiento comparable con menos de la mitad de parámetros. Esta versión GGUF añade la ventaja de poder ejecutarse en hardware de consumo gracias a la cuantización.

## Limitaciones y advertencias

- El fine-tuning SOM-MPOA es una versión "abliterada" que elimina mecanismos de rechazo. Esto significa que el modelo puede generar contenido ofensivo, ilegal o peligroso sin filtros, lo que requiere supervisión humana en aplicaciones de producción.
- No se han publicado benchmarks oficiales para esta versión específica, por lo que el rendimiento real en tareas estándar es desconocido.
- La longitud de contexto no está documentada en la información proporcionada, lo que dificulta planificar aplicaciones que requieran ventanas de contexto largas.
- El modelo base es multimodal, pero no se ha confirmado si las cuantizaciones GGUF incluyen el proyector de visión necesario para procesar imágenes.
- La licencia Apache 2.0 permite uso comercial, pero el autor del fine-tuning (0xA50C1A1) no proporciona garantías sobre el comportamiento del modelo en producción.
- El repositorio GGUF es de un tercero (mradermacher), no de Mistral AI, por lo que la calidad de la cuantización puede variar respecto al modelo original en BF16.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Ministral-3-14B-Instruct-2512-BF16-SOM-MPOA-i1-GGUF
- Repositorio del modelo base: https://huggingface.co/0xA50C1A1/Ministral-3-14B-Instruct-2512-BF16-SOM-MPOA
- Modelo original de Mistral AI: https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512
- Receta de despliegue con vLLM: https://github.com/vllm-project/recipes/blob/main/Mistral/Ministral-3-Instruct.md
- Documentación en NVIDIA NIM: https://docs.api.nvidia.com/nim/reference/mistralai-ministral-14b-instruct-2512
- Página de descarga en SourceForge: https://sourceforge.net/projects/ministral-3-14b-instruct-2512/

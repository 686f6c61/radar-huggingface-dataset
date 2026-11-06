# maritaca-ai/S5-nano-GGUF

## Resumen

S5-nano es un modelo de lenguaje desarrollado por Maritaca AI, un laboratorio brasileño especializado en modelos de IA para portugués. Este repositorio contiene las versiones cuantizadas en formato GGUF del modelo base, pensadas para su uso con llama.cpp y programas compatibles. El modelo cuenta con 4.326.350.848 parámetros totales (aproximadamente 4,3 mil millones) y está diseñado para tareas conversacionales y de razonamiento, con especial énfasis en el portugués de Brasil y el inglés.

La relevancia de esta ficha radica en que S5-nano-GGUF ofrece una vía de despliegue local eficiente para un modelo de tamaño medio, con cuantizaciones que van desde BF16 sin pérdida (8,7 GB) hasta Q4_K_M (2,8 GB) con imatrix, lo que permite ejecutarlo en hardware de consumo. Además, incluye un encoder de visión separado (mmproj) y una capa de MTP (multi-token prediction), lo que amplía sus capacidades más allá del texto puro.

El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial, y soporta los idiomas portugués e inglés según los metadatos del repositorio. La model card reporta resultados de evaluación en modos "Think" e "Instruct" con métricas desglosadas por tipo de tarea y cobertura de tests, aunque no se detallan los benchmarks individuales en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, inferido por el formato GGUF y la capa MTP) |
| Parametros totales | 4.326.350.848 (aproximadamente 4,3 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q4_K_M (con imatrix); encoder de visión en F16 |
| Idiomas soportados | Portugués (pt) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base S5-nano más allá de que se distribuye en formato GGUF para llama.cpp y que incluye una capa de MTP (multi-token prediction, predicción multi-token). Esta capa de MTP es una innovación técnica que permite al modelo predecir varios tokens por paso, lo que puede mejorar la eficiencia de decodificación y el throughput en inferencia. El repositorio incluye tres archivos GGUF (BF16, Q8_0 y Q4_K_M) que incorporan dicha capa, además de un archivo mmproj separado para el encoder de visión en F16.

No se han proporcionado datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se especifica si la arquitectura es un transformer denso, MoE o híbrida. La model card menciona evaluaciones en modos "Think" e "Instruct", lo que sugiere que el modelo fue entrenado o ajustado para soportar un modo de razonamiento explícito (thinking mode) además del modo instructivo convencional, pero no se aportan detalles sobre el proceso de entrenamiento.

## Capacidades

- Generación de texto conversacional en portugués e inglés, con modos "Think" (razonamiento explícito) e "Instruct" (respuesta directa).
- Razonamiento multi-paso gracias al modo Think, orientado a tareas que requieren descomposición de problemas.
- Capacidades de visión: el repositorio incluye un encoder de visión (mmproj-S5-nano-F16.gguf, 0,7 GB), lo que permite procesar imágenes junto con texto en llama.cpp.
- Predicción multi-token (MTP) integrada en los tres archivos GGUF, orientada a mejorar la eficiencia de decodificación.
- Soporte de conversación multi-turno (tag "conversational" en los metadatos).
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que facilita su integración en servicios de inferencia.
- No se dispone de información sobre tool calling, function calling ni soporte explícito de agentes en la documentación proporcionada.

## Casos de uso

- Atención al cliente en portugués de Brasil: el modelo está entrenado y evaluado específicamente para portugués nativo brasileño (83,74 en la métrica "Nativo BR" en modo Think), lo que lo hace adecuado para asistentes conversacionales multi-turno dirigidos al mercado brasileño, con despliegue local mediante llama.cpp.
- Procesamiento de documentos con imágenes: gracias al encoder de visión incluido (mmproj F16), se puede usar para tareas de extracción de información de facturas, capturas de pantalla o formularios escaneados, combinando texto e imagen en un único pipeline con llama.cpp.
- Razonamiento asistido en entornos con recursos limitados: la cuantización Q4_K_M (2,8 GB) permite ejecutar el modelo en GPUs de consumo o incluso en CPU, habilitando asistentes de razonamiento local para desarrolladores que no pueden depender de APIs en la nube.
- Generación de contenido en portugués: redacción de textos, resúmenes y respuestas en portugués brasileño con calidad nativa, adecuado para herramientas de productividad o marketing dirigidas a ese mercado.
- Experimentación académica e investigación: al ser un modelo de 4,3 mil millones de parámetros con licencia Apache 2.0 y pesos GGUF, es un candidato accesible para estudiar técnicas de cuantización, MTP y modos de razonamiento en entornos académicos.
- Despliegue en edge computing: el tamaño reducido de la cuantización Q4_K_M (2,8 GB) permite integraciones en dispositivos con memoria limitada, como mini-PCs o sistemas embebidos con llama.cpp, para tareas de clasificación y generación de texto offline.
- Prototipado rápido de aplicaciones bilingües pt/en: la combinación de ambos idiomas en un modelo pequeño y de licencia permisiva facilita la creación de MVPs para productos que necesiten atender a usuarios brasileños e internacionales.

## Benchmarks y rendimiento

La model card reporta resultados de evaluación del checkpoint original en BF16 para tareas de texto, con métricas agregadas por modo (Think e Instruct) y por tipo de tarea (Nativo BR, Traduzido PT, Não nativo, Total) junto con la cobertura de tests. Los datos disponibles son los siguientes:

| Modo | Nativo BR | Traduzido PT | Não nativo | Total | Cobertura |
|---|---|---|---|---|---|
| Think | 83,74 | 86,94 | 54,11 | 75,25 | 23/23 |
| Instruct | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |

No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, ni comparaciones numéricas con modelos similares. Los valores anteriores corresponden a métricas agregadas propias del autor, no a benchmarks convencionales.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización:
  - BF16 (8,7 GB): requiere al menos 10-12 GB de VRAM para pesos y overhead de contexto.
  - Q8_0 (4,6 GB): requiere al menos 6-8 GB de VRAM.
  - Q4_K_M (2,8 GB): requiere al menos 4-6 GB de VRAM.
  - Encoder de visión F16 (0,7 GB): añade aproximadamente 1 GB adicional de VRAM si se usa visión.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 para las cuantizaciones mayores; GPUs con 6-8 GB (RTX 3060 6 GB, RTX 2070) para Q4_K_M. Para BF16 se recomienda A100 o H100 en entornos de servidor.
- Cabe en GPU de consumo: sí, especialmente en Q4_K_M y Q8_0; BF16 requiere GPUs de gama alta o profesionales.
- Opciones de despliegue: llama.cpp (nativo, formato GGUF), y programas compatibles con GGUF como Ollama, LM Studio o servidores basados en llama.cpp. El tag "endpoints_compatible" sugiere compatibilidad con endpoints de inferencia.
- Latencia y throughput: no disponibles en la información proporcionada. La capa MTP podría mejorar el throughput, pero no se aportan cifras.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. A continuación se indica una comparativa estructural con alternativas de tamaño similar, marcando los datos no disponibles:

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|
| S5-nano-GGUF | 4,3 mil millones | no disponible | Apache 2.0 | GGUF | Hugging Face (maritaca-ai) |
| Alternativa de ~4B (p. ej., Qwen2.5-3B/7B, Phi-3-mini) | no disponible en esta ficha | no disponible | no disponible | no disponible | no disponible |

No se han publicado comparaciones de rendimiento con otros modelos en la información disponible, por lo que no se puede establecer una comparativa numérica rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la información proporcionada; al estar orientado al portugués de Brasil, puede reflejar sesgos culturales y lingüísticos de ese contexto.
- Riesgo de alucinación: no se cuantifica en la documentación; como todo modelo generativo, puede producir información incorrecta, especialmente en tareas de razonamiento no verificadas.
- Limitaciones de contexto e idioma: solo se declaran portugués e inglés; el rendimiento en otros idiomas no está garantizado. La longitud de contexto no se especifica, lo que impide planificar aplicaciones con ventanas largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; no se indican restricciones adicionales, pero conviene revisar la licencia del modelo base S5-nano por si hubiera términos adicionales.
- Caveats para producción: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere baja validación comunitaria; los benchmarks reportados son métricas agregadas propias del autor, no estándares; no se dispone de información sobre tool calling, agentes ni latencia, lo que limita la evaluación para despliegues en producción exigentes.
- La capa MTP y el encoder de visión requieren versiones de llama.cpp compatibles; verificar la compatibilidad antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/maritaca-ai/S5-nano-GGUF
- Modelo base: https://huggingface.co/maritaca-ai/S5-nano
- Organización Maritaca AI: https://huggingface.co/maritaca-ai
- llama.cpp (repositorio oficial): https://github.com/ggerganov/llama.cpp
- No se han encontrado en la información proporcionada papers, blogs, demos u otros repositorios adicionales.

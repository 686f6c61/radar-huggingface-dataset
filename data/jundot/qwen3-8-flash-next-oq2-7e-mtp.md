# Jundot/Qwen3.8-Flash-Next-oQ2.7e-mtp

## Resumen

Qwen3.8-Flash-Next-oQ2.7e-mtp es un checkpoint cuantizado en formato MLX del modelo Qwen/Qwen3.8-Flash-Next, publicado por el usuario Jundot. Se trata de una vista previa experimental de la arquitectura que Qwen ha usado para su siguiente generación: un modelo de mezcla de expertos (MoE) multimodal de 125.000 millones de parámetros en el backbone de lenguaje con unos 6.000 millones activados por token, acompañado de una tabla de embeddings de n-gramas de 51.200 millones de parámetros, un codificador de visión de 449 millones y un cabezal de predicción multi-token (MTP) de 2.607 millones. En total, el repositorio contiene 179.999.981.459 parámetros y 85,2 GB de ficheros.

El modelo original combina Gated DeltaNet con Qwen Sparse Attention (QSA) y flujos residuales con compuerta (Gated Residual streams), una combinación de atención híbrida pensada para reducir coste computacional manteniendo capacidad. Esta versión concreta no es un modelo nuevo, sino una cuantización de precisión mixta realizada con oMLX v0.7.1 y la variante "Improved oQe", que asigna bits según la sensibilidad medida de cada capa.

Su relevancia es doble: por un lado, permite ejecutar en hardware Apple Silicon un modelo de 180.000 millones de parámetros con solo ~3,3 bits por peso efectivos en el backbone; por otro, es una muestra temprana de la arquitectura Qwen4. El contrapunto es que se trata de un checkpoint con 18 descargas y ningún "like", sin benchmarks publicados que cuantifiquen la pérdida de calidad frente al modelo base en BF16.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal (vision-language) con atención híbrida Gated DeltaNet + Qwen Sparse Attention (QSA) y Gated Residual streams; incluye codificador de visión, tabla de embeddings de n-gramas y cabezal MTP |
| Parametros totales | 179.999.981.459 (125,744B backbone de lenguaje + 51,200B n-gram + 0,449B visión + 2,607B MTP) |
| Parametros activos | 6B en el backbone de lenguaje (según model card); el módulo MTP añade parámetros activos adicionales, cifra exacta no disponible |
| Longitud de contexto | No disponible para esta variante. La documentación pública de Qwen3.8-Flash cita 1.000.000 de tokens, pero no se confirma para Qwen3.8-Flash-Next en la información disponible |
| Tipos de cuantizacion | Precision mixta: affine 2 bits grupo 64, 3 bits grupo 64, 4 bits grupo 64, 5 bits grupo 128, 8 bits grupo 64 y 128, BF16, I64; tabla de n-gramas en affine 4 bits grupo 32 |
| Idiomas soportados | No disponible |
| Licencia | Qwen Community License 1.0 (etiquetada como "other") |
| Formato de pesos | Safetensors para MLX (librería mlx) |
| Pipeline | image-text-to-text |
| Bits por peso efectivos | 3,787 en el checkpoint completo; 3,305 excluyendo la tabla de embeddings de n-gramas |
| Tamano del repositorio | 85,2 GB (79,353 GiB de almacenamiento de tensores) |
| Fecha de publicacion | 12 de octubre de 2026 |
| Descargas / likes | 18 / 0 |

## Arquitectura y entrenamiento

La arquitectura del modelo base es una mezcla de expertos multimodal con una innovación de atención híbrida: Gated DeltaNet (una variante de atención lineal con estado recurrente) combinada con Qwen Sparse Attention (QSA), más flujos residuales con compuerta. El repositorio de QwenLM describe el salto a Qwen3.8-Flash-Next como una mejora sistemática en cuatro ejes —atención, residual, embedding y optimización— orientada a aumentar capacidad y eficiencia de cómputo y a mejorar la estabilidad del entrenamiento. El componente de embeddings no usa una matriz densa convencional, sino una tabla de n-gramas de 51.200 millones de parámetros, que es el segundo bloque más grande del modelo y el mayor en disco.

Sobre el proceso de cuantización sí hay información detallada. La herramienta oQ asigna bits según la sensibilidad medida de cada capa y luego redondea cada grupo con una matriz de importancia (1.024 muestras × 512 tokens) y un reajuste por mínimos cuadrados ponderados de su escala y sesgo. Por debajo de oQ4, la tabla de n-gramas se mantiene a 4 bits y queda fuera del presupuesto de bits, porque oMLX puede servirla desde SSD en lugar de memoria. La distribución resultante deja el 31,694% de los pesos lógicos en 2 bits y el 35,419% en 3 bits, y conserva un 0,287% en BF16 (que coincide en tamaño con el codificador de visión, 0,449B, aproximadamente 2 bytes por parámetro). No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base.

## Capacidades

- Generación de texto y razonamiento conversacional, con pipeline declarado image-text-to-text.
- Comprensión de imágenes: el checkpoint incluye el codificador de visión completo (0,449B de parámetros), por lo que admite entrada visual junto a texto.
- Predicción multi-token (MTP): el cabezal MTP incluido permite decodificación especulativa autocontenida, sin necesidad de un modelo borrador externo, si el runtime de MLX lo explota.
- Modelado de contexto mediante embeddings de n-gramas: la tabla de 51.200 millones de parámetros actúa como memoria de secuencias frecuentes, lo que puede favorecer tareas de copia, recuperación y continuaciones largas.
- Capacidades agénticas y de asistencia en código: la documentación de la familia Qwen3.8-Flash menciona asistencia de código, flujos agénticos y comprensión visual como puntos fuertes, aunque no se confirma explícitamente para la variante Next.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Capacidades multilingües: no disponibles.
- Modo "thinking" explícito: no documentado en la información disponible.

## Casos de uso

- Prototipado local de asistentes multimodales en estaciones Apple Silicon de gama alta: el checkpoint permite cargar un modelo de visión-lenguaje de 180.000 millones de parámetros en memoria unificada gracias a sus ~3,3 bits por peso en el backbone y a la posibilidad de servir la tabla de n-gramas desde SSD.
- Investigación en cuantización extrema: sirve como sujeto de estudio para medir el impacto real de dejar un 31,7% de los pesos lógicos a 2 bits, comparando la salida con el checkpoint oQ4e del mismo autor o con el modelo base.
- Atención al cliente sobre documentos largos: si se confirma la ventana de contexto extensa del modelo base, podría gestionar conversaciones multi-turno con manuales o contratos largos adjuntos, incluyendo capturas y páginas escaneadas.
- Análisis de documentación técnica con diagramas: la combinación de codificador de visión y backbone de 125B permite responder preguntas sobre planos, esquemas de arquitectura o capturas de interfaces.
- Extracción y resumen de información en flujos de trabajo internos: pipelines por lotes donde la entrada es una mezcla de imágenes y texto (facturas, formularios, capturas de pantalla) y la salida es texto estructurado.
- Evaluación comparativa de infraestructura MLX frente a alternativas CUDA: dado que no existe versión GGUF en la información disponible, este checkpoint es útil para medir latencia y consumo de memoria reales en Apple Silicon y decidir si compensa frente a servir el modelo base en GPU.
- Experimentación con decodificación especulativa integrada: el cabezal MTP incluido permite probar aceleración de inferencia sin desplegar un modelo borrador separado, siempre que el runtime lo soporte.
- Banco de pruebas para flujos agénticos en local: útil para validar cadenas de pasos con llamadas a herramientas antes de comprometer presupuesto en infraestructura en la nube, asumiendo que el soporte de tool calling no está documentado y habría que verificarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del checkpoint cuantizado ni los resultados de búsqueda recogidos incluyen cifras de MMLU, HumanEval, GSM8K, MMMU o similares, ni para el modelo base ni para esta cuantización. Tampoco hay mediciones publicadas de latencia o throughput.

## Requisitos de hardware

- Huella de pesos: 79,353 GiB de tensores en total, sobre un repositorio de 85,2 GB. Si el runtime sirve la tabla de n-gramas desde SSD (comportamiento documentado de oMLX por debajo de oQ4), la huella en memoria baja a aproximadamente 49,6 GiB (derivado de la tabla de almacenamiento: 79,353 − 29,802 GiB).
- Plataforma: al ser un checkpoint MLX, requiere Apple Silicon con memoria unificada. No es ejecutable en GPU NVIDIA o AMD sin una conversión previa, y no se documenta ninguna conversión a GGUF.
- Memoria recomendada: 96 GB de memoria unificada como mínimo práctico si se descarga la tabla de n-gramas a SSD, y 128 GB o más para mantenerla residente junto con caché KV de contexto largo. Configuraciones válidas: Mac Studio M3 Ultra o M2 Ultra con 96, 128, 192 o 512 GB; MacBook Pro con M4 Max hasta 128 GB.
- Viabilidad en GPU de consumo: no aplicable en el sentido habitual, ya que no existe formato GGUF ni pesos CUDA en la información disponible. En tarjetas de 24 GB (RTX 4090) o 48 GB (RTX 6000 Ada) no cabría ni siquiera el backbone cuantizado.
- Opciones de despliegue: MLX (mlx-lm) y oMLX v0.7.1, la herramienta con la que se generó el checkpoint. vLLM, TGI, llama.cpp y Ollama no están soportados para este formato según la información disponible.
- Latencia y throughput: no disponibles. Cualquier cifra sería especulativa dado el tamaño del modelo y la ausencia de mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Formato | Bits/parametro | Tamano repo | Licencia |
|---|---|---|---|---|---|---|
| Jundot/Qwen3.8-Flash-Next-oQ2.7e-mtp | 180B | 6B (backbone) | Safetensors MLX | 3,787 completo / 3,305 sin n-gram | 85,2 GB | Qwen Community 1.0 |
| Jundot/Qwen3.8-Flash-Next-oQ4e-mtp | No disponible (presumiblemente 180B) | No disponible | Safetensors MLX | No disponible (la nomenclatura sugiere ~4 bits) | No disponible | Qwen Community 1.0 |
| Qwen/Qwen3.8-Flash-Next | 180B | 6B (backbone) | Safetensors | No disponible (previsiblemente BF16, 16 bits) | No disponible | Qwen Community 1.0 |

La comparación relevante es entre niveles de cuantización, no entre arquitecturas: oQ2.7e y oQ4e del mismo autor parten del mismo modelo base y solo se diferencian en el reparto de bits, por lo que constituyen un par idóneo para medir la degradación por compresión, siempre que se generen benchmarks propios, ya que no hay cifras publicadas. La comparación con alternativas MoE multimodales de otros fabricantes no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Cuantización agresiva: el 31,694% de los pesos lógicos está a 2 bits y el 35,419% a 3 bits. Es esperable una degradación apreciable frente al modelo base en BF16, especialmente en razonamiento matemático, código y tareas que exigen precisión fina. No hay benchmarks publicados que cuantifiquen esa pérdida, ni del autor ni de terceros.
- Validación comunitaria prácticamente nula: 18 descargas, 0 likes y publicación el mismo día de la creación y la última actualización. No hay informes independientes de calidad ni de estabilidad.
- Dependencia de plataforma: solo MLX/Apple Silicon. No hay GGUF, no hay pesos para CUDA y no se documenta ninguna ruta de conversión, lo que limita su uso en clústeres convencionales.
- Coste de memoria elevado en términos absolutos: 79,353 GiB de tensores. La viabilidad en equipos de 64 GB depende por completo de que la tabla de n-gramas se sirva desde SSD, característica ligada a oMLX y no necesariamente replicable en otros runtimes.
- Licencia: Qwen Community License 1.0, etiquetada como "other". Los términos concretos de uso comercial no se detallan en la información disponible; hay que revisar el fichero LICENSE antes de cualquier despliegue en producción.
- Idiomas soportados: no documentados. No se puede asumir cobertura multilingüe sin verificarla.
- Madurez del modelo base: Qwen3.8-Flash-Next se describe como una vista previa experimental de la arquitectura detrás de Qwen4. Esto implica riesgo de cambios de API, falta de soporte a largo plazo y posible discontinuidad de la familia.
- Inconsistencia documental: la model card menciona un módulo MTP de 4B en el texto, mientras que la tabla de almacenamiento lo cifra en 2,607B de pesos lógicos. Conviene tratar ambas cifras con cautela.
- Sesgos y alucinación: no hay información específica sobre sesgos del modelo base ni sobre tasas de alucinación. Como en cualquier LLM, la generación de hechos no verificables es un riesgo, agravado aquí por la cuantización a 2-3 bits.
- Componentes con precisión desigual: el codificador de visión parece conservarse en BF16 (0,449B de parámetros ocupando 0,836 GiB), mientras que el backbone sufre la compresión fuerte. Esto puede producir un desequilibrio entre calidad de percepción visual y calidad de razonamiento textual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jundot/Qwen3.8-Flash-Next-oQ2.7e-mtp
- Checkpoint alternativo oQ4e del mismo autor: https://huggingface.co/Jundot/Qwen3.8-Flash-Next-oQ4e-mtp
- Árbol de ficheros del checkpoint oQ4e: https://huggingface.co/Jundot/Qwen3.8-Flash-Next-oQ4e-mtp/tree/main
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- README del modelo base en GitHub: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/README.md
- Herramienta de cuantización oQ / oMLX: https://github.com/jundot/omlx
- Pull request de la cuantización mejorada oQe: https://github.com/jundot/omlx/pull/4385
- Documentación de Qwen3.8-Flash: https://docs.qwencloud.com/developer-guides/getting-started/latest-model
- Página de producto de Qwen3.8-Flash: https://www.qwencloud.com/models/qwen3.8-flash

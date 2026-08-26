# QuaduxIT/Qwen3.5-4B-QD-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF del modelo multimodal Qwen3.5-4B, realizada por Quadux IT GmbH con un método propio llamado Quadux Dynamic (QD). La técnica sustituye los mapas de tipo de tensor fijos por mapas medidos por tensor, optimizados mediante una matriz de error y un algoritmo de mochila, con el objetivo de minimizar la divergencia de Kullback-Leibler (KLD) frente a los logits del modelo en BF16 a igualdad de tamaño de archivo. Está pensado para entornos con recursos limitados (2-4 GB) donde cada punto de calidad es relevante.

El modelo base, Qwen3.5-4B, es un modelo denso de 4.326 millones de parámetros con arquitectura multimodal (imagen-texto a texto), desarrollado por Alibaba Cloud, con una ventana de contexto nativa de 262.144 tokens. Esta cuantización incluye la cabeza de predicción multi-token (MTP) y el proyector de visión en todos los archivos, lo que permite su uso con el pipeline de llama.cpp para tareas que combinan imagen y texto. La licencia es Apache-2.0, tanto para el modelo base como para esta adaptación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (visión + lenguaje) con MTP |
| Parámetros totales | 4.326.350.848 |
| Longitud de contexto | 262.144 tokens (nativa del modelo base) |
| Tipos de cuantización | Q2_K_XL, Q3_K_XL, Q4_K_XL, Q6_K_XL (este repo); Q5_K_XL, Q8_0, BF16 (enlazados desde unsloth) |
| Idiomas soportados | Inglés, alemán, multilingüe (etiqueta `en, de, multilingual`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B es un modelo denso de 4.326 millones de parámetros con una arquitectura transformer multimodal que procesa tanto imágenes como texto. No se dispone de información detallada sobre la composición del dataset de entrenamiento ni sobre el proceso de alineación (RLHF, DPO, etc.) en la documentación proporcionada; solo se indica que es un modelo "unified vision-language foundation". La cuantización QD no modifica la arquitectura, solo el mapeo de tipos de tensor durante la cuantización.

El método QD utiliza un proceso de tres fases: sondas (probes) para medir la sensibilidad de cada tensor, construcción de una matriz de error, y una asignación mediante un algoritmo de mochila (knapsack) con refinamiento por gradiente y escalada de colinas. Todo se realiza a igualdad de bytes (byte parity) con respecto a los archivos de la competencia, y se compara midiendo la divergencia KL sobre 60 muestras de 512 tokens en inglés (wikitext-2-test) y alemán (muestra de Wikipedia en alemán). El método está documentado en el repositorio de Quadra IT para el modelo Qwen3.6-35B-A3B-QD.

## Capacidades

- Generación de texto y conversación multilingüe (inglés, alemán, otros).
- Comprensión de imágenes y generación de texto a partir de ellas (visión multimodal).
- Soporte de predicción multi-token (MTP) para decodificación especulativa, que reduce la latencia en inferencia.
- Ventana de contexto de 262.144 tokens, permitiendo manejar documentos largos o conversaciones extensas.
- Cuantización a varios niveles (Q2, Q3, Q4, Q6) para adaptarse a distintos presupuestos de VRAM.
- Compatible con llama.cpp y sus herramientas de servidor (`--mmproj` para visión, `--spec-type draft-mtp` para MTP).

## Casos de uso

- **Asistente conversacional multilingüe**: el modelo puede mantener diálogos en inglés y alemán con contexto largo, adecuado para chatbots de atención al cliente en empresas que operan en esos idiomas.
- **Análisis de imágenes en producción**: al incluir el proyector de visión, se puede usar para describir imágenes, extraer texto de documentos escaneados o clasificar contenido visual, todo dentro de una única pipeline de llama.cpp.
- **Procesamiento de documentos extensos**: con 262.144 tokens de contexto, puede resumir o responder preguntas sobre manuales técnicos, contratos o informes largos sin truncar.
- **Despliegue en hardware limitado**: las cuantizaciones Q2 (2,1 GB) y Q3 (2,5 GB) permiten ejecutar el modelo en GPUs de consumo con 4 GB de VRAM, ideal para entornos edge o desarrollo local.
- **Aplicaciones de baja latencia con MTP**: la decodificación especulativa mediante el head MTP acelera la generación de texto en tiempo real, útil para chatbots interactivos o sistemas de autocompletado.
- **Experimentación con cuantización**: los mapas de tensión están disponibles en el directorio `tensortypes/` para auditar o reconstruir archivos, lo que facilita investigaciones sobre el impacto de la cuantización en modelos multimodales.

## Benchmarks y rendimiento

La model card publica los siguientes resultados de divergencia KL (KLD) frente a los logits BF16, medidos en una RTX 5090 con CUDA, sobre 60×512 tokens. Un valor menor indica una distribución de salida más cercana al modelo de precisión completa.

| Rung | Tamaño QD | Tamaño unsloth | QD KLD (en / de) | unsloth KLD (en / de) | Diferencia (en / de) |
|---|---|---|---:|---:|---:|---:|---:|
| Q6_K_XL | 4,247 GB | 4,262 GB | **0,001916 / 0,001937** | 0,001931 (en) | −0,8% |
| Q4_K_XL | 2,988 GB | 2,991 GB | **0,013113 / 0,014487** | 0,017662 / 0,021152 | −25,8% / −31,5% |
| Q3_K_XL | 2,529 GB | 2,529 GB | **0,029376 / 0,034861** | 0,056098 / 0,068785 | −47,6% / −49,3% |
| Q2_K_XL | 2,122 GB | 2,122 GB | **0,084355 / 0,101492** | 0,193919 / 0,271736 | −56,5% / −62,7% |

Nota: el Q6_K_XL parte del mapa de unsloth y se mejora mediante una búsqueda local exhaustiva (34 movimientos, 1 aceptado). En Q5_K_XL, unsloth supera a esta cuantización (KLD 0,00892 vs 0,00948) y el autor recomienda usar el archivo de unsloth. Los valores de referencia uniformes (en inglés) son: Q8_0 = 0,00152; Q6_K = 0,00418; Q5_K = 0,01513; Q4_K = 0,03860; Q3_K = 0,16889.

## Requisitos de hardware

- **VRAM estimada**: según el tamaño de archivo, Q2_K_XL (2,1 GB) y Q3_K_XL (2,5 GB) caben en GPUs con 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050); Q4_K_XL (3,0 GB) requiere al menos 6 GB (RTX 3060, RTX 4060); Q6_K_XL (4,2 GB) se recomienda en GPUs de 8 GB o más (RTX 3070, RTX 4060 Ti, RTX 3090).
- **GPU recomendadas**: RTX 3090/4090 para pruebas con contexto largo y uso de MTP; para producción con cuantizaciones pequeñas, una RTX 3060 de 12 GB es suficiente.
- **Despliegue**: compatible con llama.cpp, Ollama y TGI. Se puede usar vLLM si se convierte a formato safetensors, aunque el formato GGUF está pensado para llama.cpp.
- **Latencia**: no hay datos oficiales, pero la MTP permite una decodificación especulativa que puede acelerar la generación entre un 20–50% según el hardware y la longitud de secuencia (dato no medido en este repo).

## Comparativa con modelos similares

La comparación directa se hace con las cuantizaciones de unsloth para el mismo modelo base (`unsloth/Qwen3.5-4B-MTP-GGUF`), que usan mapas de tipo uniformes (UD). A igualdad de bytes, el método QD reduce la KLD entre un 0,8% y un 62,7% según el nivel. Para Q5_K_XL y superiores, unsloth es mejor, y para Q8 y BF16 se recomienda usar los archivos originales.

| Modelo | Tamaño (Q4) | KLD (en) | Licencia | Notas |
|---|---|---|---|---|
| QuaduxIT/Qwen3.5-4B-QD-GGUF | 2,988 GB | 0,013113 | Apache-2.0 | Incluye MTP y visión |
| unsloth/Qwen3.5-4B-MTP-GGUF | 2,991 GB | 0,017662 | Apache-2.0 | Mapas UD estándar, mejor en Q5 |
| Qwen/Qwen3.5-4B (BF16) | 8,67 GB | 0 | Apache-2.0 | Modelo original, sin cuantización |

## Limitaciones y advertencias

- **Degradación por cuantización**: las cuantizaciones Q2 y Q3 presentan una KLD significativa (0,08–0,10 en Q2) y no son recomendables para aplicaciones que requieran alta fidelidad de salida.
- **Sesgo lingüístico**: la calibración se realiza sobre inglés y alemán, por lo que el rendimiento en otros idiomas puede ser inferior al de la versión completa.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje, puede generar información plausible pero incorrecta, especialmente en contextos largos o con entradas ambiguas.
- **Limitación de Q5**: para Q5_K_XL, el autor recomienda explícitamente usar la versión de unsloth, ya que su propia implementación tiene peor KLD.
- **Licencia**: Apache-2.0 permite uso comercial, pero se debe incluir la notificación de cambios y la licencia original. No hay restricciones adicionales.
- **Dependencia del proyector de visión**: para tareas multimodales es necesario cargar el archivo `mmproj-F16.gguf`; sin él, el modelo solo funciona como LLM de texto.

## Enlaces

- [Repositorio en Hugging Face: QuaduxIT/Qwen3.5-4B-QD-GGUF](https://huggingface.co/QuaduxIT/Qwen3.5-4B-QD-GGUF)
- [Modelo base: Qwen/Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B)
- [Cuantizaciones de unsloth: unsloth/Qwen3.5-4B-MTP-GGUF](https://huggingface.co/unsloth/Qwen3.5-4B-MTP-GGUF)
- [Repositorio de Qwen3 en GitHub](https://github.com/QwenLM/Qwen3)
- [Página del modelo en LM Studio](https://lmstudio.ai/models/qwen/qwen3.5-4b)
- [Modelo en Ollama](https://ollama.com/library/qwen3.5:4b)

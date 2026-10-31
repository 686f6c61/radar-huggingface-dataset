# danish-foundation-models/propella-bekko-a25m

## Resumen

Propella-bekko-a25m es un modelo de anotación de documentos desarrollado por danish-foundation-models en colaboración con la familia propella de ellamind. Su función es etiquetar automáticamente documentos con 17 propiedades (calidad, densidad informativa, tipo de contenido, sector empresarial, relevancia regional, presencia de PII, seguridad, etc.) en una sola pasada, sin generación de texto ni prompts específicos por tarea.

El modelo destila el profesor propella-1-4b en una arquitectura compacta de 123 millones de parámetros basada en el encoder bekko-embedding-v1-a25m, logrando anotar 186 documentos por segundo en una RTX A6000, frente a las 0,06 docs/s del profesor de 4B. Está diseñado para curación de datos a escala de corpus completos, un cuello de botella habitual en el entrenamiento de LLM.

Es relevante porque ofrece un punto en la frontera de Pareto calidad/throughput muy favorable: mantiene un acuerdo macro-F1 de ~0,52 con anotadores independientes (DeepSeek-V4.1-Flash y GLM-5.3-Flash) mientras es entre tres y cuatro órdenes de magnitud más rápido que los modelos generativos equivalentes. Se publica bajo licencia MIT con pesos en safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de embeddings (backbone bekko-embedding-v1-a25m) con una cabeza por propiedad |
| Parametros totales | 123.459.652 (123M) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | 1.152 tokens (1.024 de la cabecera del documento + 128 de la cola) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | 20: da, sv, no, is, fo, nl, de, fi, fr, it, es, pl, cs, hu, ro, pt, en (y otros del conjunto de entrenamiento) |
| Licencia | MIT |
| Formato de pesos | safetensors (0,5 GB de repositorio) |

## Arquitectura y entrenamiento

El modelo usa como backbone el encoder bekko-embedding-v1-a25m y añade una cabeza de clasificación por propiedad: softmax para las propiedades de selección única (ordinales) y sigmoide para las multi-etiqueta, sin condicionamiento cruzado entre propiedades; todas se predicen de forma independiente a partir de un estado compartido del documento. La entrada procesa 1.024 tokens de la cabecera del documento más 128 tokens de su cola, de modo que el final de documentos largos no se pierde, y pasa características de longitud a nivel de documento a las cabezas. Una innovación destacable es la decodificación de las propiedades ordinales mediante el nivel esperado (`round(Σ p_i · rank_i)`) en lugar de argmax, lo que aporta por sí solo +0,013 de QWK (kappa ponderada cuadrática).

El entrenamiento se realizó sobre etiquetas generadas por propella-1-4b a partir de los corpus Dynaword, FineWeb-2 y FinePDFs, cubriendo 20 idiomas y 844.912 documentos. Se emplearon 3 épocas con lotes de 65.536 tokens, con entropía cruzada para propiedades de selección única, entropía cruzada binaria para las multi-etiqueta y una pérdida F1 a nivel de token para la detección de PII. El entrenamiento completo took 316 minutos en una Quadro RTX 8000. Las anotaciones y el código de entrenamiento se publican abiertamente (dataset propella-bekko-data y repositorio propella-bekko en GitHub).

## Capacidades

- Anotación de documentos con 17 propiedades en una sola pasada forward, sin generación de texto
- Propiedades de contenido: integridad (ordinal, 4 niveles), ratio de contenido vs. boilerplate (ordinal, 5), longitud de contenido (ordinal, 4)
- Clasificación multi-etiqueta: tipo de contenido (18 etiquetas), sector empresarial (37), contenido técnico (7)
- Propiedades de calidad: calidad global (5), densidad informativa (5), valor educativo (5), indicadores de razonamiento (5)
- Audiencia y propósito: nivel de audiencia (6), sesgo comercial (5), sensibilidad temporal (4)
- Seguridad y cumplimiento: seguridad del contenido (5) y detección binaria de PII (información personal identificable)
- Geografía: relevancia regional (14 etiquetas) y relevancia por país (749 etiquetas)
- Cobertura multilingüe en 20 idiomas, incluyendo castellano, dentro del esquema de propella-1
- Salida estructurada alineada con el esquema y prompt de propella-1, sin necesidad de prompt por tarea

## Casos de uso

- Curación de corpus para preentrenamiento de LLM: filtrado masivo de documentos por calidad, densidad y valor educativo antes del entrenamiento, a velocidades de ~186 docs/s por GPU frente a ~0,06 docs/s del profesor generativo
- Filtrado de seguridad y cumplimiento: detección de contenido inapropiado y de PII a escala, útil para cumplir requisitos de privacidad antes de publicar o entrenar con datos scraped
- Clasificación sectorial de grandes volúmenes documentales: etiquetado de documentos por industria (37 sectores) para construir datasets especializados de dominio (finanzas, salud, legal, etc.)
- Análisis de sesgo comercial: identificación de contenido con influencia comercial sobre la objetividad, útil para construir corpus neutros o estudios de calidad mediática
- Geolocalización de contenido: etiquetado por región (14) y país (749) para construir corpus multilingües balanceados geográficamente o adaptar modelos a mercados concretos
- Detección de contenido educativo y de razonamiento: selección de documentos con alto valor educativo o indicadores de razonamiento lógico para datasets de fine-tuning de calidad
- Auditoría de datasets existentes: reanotación de corpus públicos con un esquema homogéneo y reproducible, aprovechando que las anotaciones y el código son abiertos

## Benchmarks y rendimiento

Acuerdo macro-F1 con dos anotadores independientes (DeepSeek-V4.1-Flash y GLM-5.3-Flash) sobre 300 documentos de test reservados, usando el prompt y esquema propios de propella. El azar (predecir siempre la etiqueta más frecuente) es 0,123.

| model | params | docs/s | vs DeepSeek | vs GLM-5.3 |
|---|---|---|---|---|
| **propella-bekko-a25m** | 123M | 186 | 0,523 | 0,522 |
| propella-bekko-a8m | 106M | 348 | 0,489 | 0,479 |
| propella-bekko-static | 206M | 686 | 0,479 | 0,468 |
| propella-1-0.6b | 600M | 0,14 | 0,498 | 0,501 |
| propella-1-1.7b | 1,7B | 0,14 | 0,547 | 0,534 |
| propella-1-4b | 4B | 0,06 | 0,571 | 0,549 |
| GLM-5.3-Flash | — | 0,41 | 0,659 | — |
| DeepSeek-V4.1-Flash | — | 0,34 | — | 0,659 |

## Requisitos de hardware

- VRAM estimada: el modelo pesa 0,5 GB en safetensors (123M de parámetros en fp32), por lo que es ejecutable en GPUs de consumo con holgura; no se publica una cifra oficial de VRAM
- GPU de referencia: los autores reportan 186 docs/s en una NVIDIA RTX A6000 (48 GB) y entrenaron en una Quadro RTX 8000; dada su huella reducida, GPUs como RTX 4090 o incluso inferiores deberían alcanzar rendimiento similar
- Cabe con comodidad en GPUs de consumo (RTX 3090/4090 y probablemente tarjetas de 8-12 GB), al tratarse de un encoder de 123M de parámetros
- Despliegue: PyTorch con transformers (AutoModel + AutoTokenizer) y huggingface_hub; el uso documentado requiere cargar el backbone y los pesos ajustados manualmente desde safetensors. No se menciona soporte nativo en vLLM, llama.cpp, Ollama o TGI
- Throughput: 186 documentos por segundo en una RTX A6000 (dato oficial); no se publica latencia individual por documento

## Comparativa con modelos similares

| Modelo | Parametros | Throughput | F1 vs. anotadores independientes | Licencia |
|---|---|---|---|---|
| propella-bekko-a25m | 123M | 186 docs/s | 0,523 / 0,522 | MIT |
| propella-bekko-static | 206M | 686 docs/s | 0,479 / 0,468 | No disponible |
| propella-1-0.6b (profesor destilado, generativo) | 600M | 0,14 docs/s | 0,498 / 0,501 | No disponible |
| propella-1-4b (profesor) | 4B | 0,06 docs/s | 0,571 / 0,549 | No disponible |

Propella-bekko-a25m supera en acuerdo a los destilados más pequeños (a8m, static) y al propella-1-0.6b generativo, quedando por debajo del profesor de 4B pero con un throughput entre tres y cuatro órdenes de magnitud superior, lo que lo sitúa en un punto de Pareto muy competitivo para anotación masiva. No hay alternativas externas comparables publicadas en la información disponible.

## Limitaciones y advertencias

- El acuerdo con anotadores independientes (macro-F1 ~0,52) es notablemente inferior al de los propios LLM anotadores (~0,66), por lo que para tareas de máxima precisión puede ser preferible el profesor o un LLM generativo
- Las etiquetas de entrenamiento provienen de propella-1-4b (destilación), de modo que el modelo hereda los sesgos y errores de su profesor
- Contexto limitado a 1.152 tokens efectivos (cabecera + cola del documento); en documentos muy largos se pierde la parte intermedia
- Los 749 niveles de relevancia por país y las 37 categorías sectoriales pueden estar desbalanceados según la distribución de los corpus de entrenamiento (Dynaword, FineWeb-2, FinePDFs), con posible sesgo hacia dominios nórdicos y web común
- No es un modelo generativo: no produce texto, razonamiento ni código; su salida es exclusivamente el conjunto de etiquetas del esquema propella
- La licencia MIT no impone restricciones de uso comercial, pero conviene verificar las licencias de los corpus fuente si se redistribuyen anotaciones
- No hay información publicada sobre cuantización, calibración por dominio ni rendimiento en idiomas concretos individualmente

## Enlaces

- Modelo: https://huggingface.co/danish-foundation-models/propella-bekko-a25m
- Profesor (propella-1-4b): https://huggingface.co/ellamind/propella-1-4b
- Referencia de propiedades: https://huggingface.co/ellamind/propella-1-4b/blob/main/property_descriptions.md
- Backbone (bekko-embedding-v1-a25m): https://huggingface.co/hotchpotch/bekko-embedding-v1-a25m
- Dataset de anotaciones: https://huggingface.co/datasets/danish-foundation-models/propella-bekko-data
- Código de entrenamiento: https://github.com/danish-foundation-models/propella-bekko
- Paper Dynaword: https://huggingface.co/papers/2508.02271
- Paper adicional referenciado: https://arxiv.org/abs/2311.07264

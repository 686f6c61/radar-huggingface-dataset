# foxAIengineer/Qwen3.8-Flash-Next-125b-colibri-i4-gs64

## Resumen

Qwen3.8-Flash-Next es un modelo experimental de lenguaje y visión desarrollado por el equipo Qwen (Alibaba). Se presenta como el primer lanzamiento open-weight de la arquitectura que sustentará la futura familia Qwen4, y combina atención híbrida, Mixture-of-Experts (MoE) y un esquema novedoso de embeddings por n-gramas. El checkpoint aquí descrito es una cuantización FP8 del modelo base, publicada por el usuario foxAIengineer bajo el identificador `Qwen3.8-Flash-Next-125b-colibri-i4-gs64`.

El modelo declara 125.000 millones de parámetros con solo 6.000 millones activos por token, a los que se suman 51.000 millones de parámetros en embeddings n-grama y 4.000 millones en una cabeza MTP (multi-token prediction). El repositorio de safetensors reporta 179.999.981.459 parámetros totales, coherente con la suma de lenguaje, n-gramas y MTP. La longitud de contexto nativa es de 262.144 tokens, extensible hasta 1.000.000.

Su relevancia actual radica en la propuesta arquitectónica: sustituye la atención dispersa a nivel de token por Qwen Sparse Attention (QSA) a nivel de micro-bloque, reduce la latencia en contextos largos y emplea Gated Residual para estabilizar el entrenamiento en profundidad. Es, por tanto, un modelo orientado a cargas agénticas y de contexto masivo, no tanto a inferencia de bajo coste en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal LM con encoder de visión; híbrido Gated DeltaNet + Qwen Sparse Attention (QSA) con MoE y Gated Residual |
| Parametros totales | 179.999.981.459 (125B LM + 51B n-gram embedding + 4B MTP) |
| Parametros activos | 6B (10 expertos enrutados + 1 compartido de 512) |
| Longitud de contexto | 262.144 nativo; extensible a 1.000.000 |
| Tipos de cuantizacion | FP8 fine-grained con block size 128 (este checkpoint); se desconoce si el autor publica otras |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal híbrido con encoder de visión. El layout oculto se organiza en 12 bloques, cada uno compuesto por 3 subcapas de Gated DeltaNet seguidas de 1 subcapa de Qwen Sparse Attention, todas ellas intercaladas con capas MoE. La dimensión oculta es 2560, con 48 capas y un vocabulario de 248.320 tokens (padded). Gated DeltaNet emplea 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. QSA usa 24 cabezas de query y 2 de KV con dimensión 256, RoPE de 64 dimensiones y un indexador MQA (4 cabezas de query, 1 de clave compartida, dimensión 128) con un presupuesto de 512 bloques o 2048 tokens.

El MoE cuenta con 512 expertos, de los que se activan 10 enrutados más 1 compartido, con dimensión intermedia de experto 640. Gated Residual incorpora 4 ramas con rango de cuello de botella 320 y modula el flujo residual mediante una compuerta de lectura dependiente de datos y una compuerta escalar de escritura por rama. Los N-gram Embedding indexan bigramas y trigramas en la capa 2 con 20.000.000 de entradas, lo que permite escalar parámetros con menor coste computacional y facilita el offloading en aceleradores con memoria limitada. La cabeza MTP consta de 1 capa entrenada con múltiples pasos.

El entrenamiento combina pre-entrenamiento y post-entrenamiento. La receta aplica Muon y AdamW a categorías de pesos específicas, elimina los warmups tradicionales de batch size comenzando directamente en el tamaño objetivo y utiliza learning rates más altos, guiándose por scaling laws reajustadas. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO explícitos.

## Capacidades

- Generación de texto y razonamiento de propósito general en un modelo causal con encoder de visión.
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`), incluyendo preguntas sobre imágenes.
- Conversación multi-turno con contexto muy largo (262K nativo, hasta 1M extendido).
- Razonamiento multi-paso y cargas agénticas: la arquitectura QSA está explícitamente optimizada para reducir latencia en contextos largos típicos de agentes.
- Decodificación multi-token mediante la cabeza MTP, que puede acelerar la generación.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no confirmado explícitamente en la model card; la versión oficial Qwen3.8-Flash en Qwen Cloud sí incluye herramientas integradas, pero este checkpoint no lo detalla.
- Modo "thinking": no disponible en la información.

## Casos de uso

- Agentes autónomos con memoria larga: el modelo puede mantener 262K tokens de historial de acciones, observaciones y documentos, y su atención QSA reduce la latencia en cada paso del bucle agéntico, lo que lo hace adecuado para tareas de varias horas con muchas iteraciones.
- Análisis de documentos extensos con imágenes: informes financieros, contratos o papers con figuras y tablas pueden procesarse en una sola ventana, combinando el encoder de visión con el contexto largo.
- Asistencia técnica sobre bases de código: con contexto de hasta 1M tokens extendido, es viable cargar repositorios completos y responder preguntas de arquitectura o depuración cruzando múltiples ficheros.
- Automatización de soporte con capturas de pantalla: al ser image-text-to-text, puede interpretar tickets que incluyan imágenes de error y responder con contexto conversacional multi-turno.
- Generación de código asistida en pipelines: aunque el tool calling no está confirmado, el modelo puede integrarse vía vLLM o SGLang en flujos de revisión y generación de parches, aprovechando la decodificación MTP para throughput.
- Investigación sobre arquitecturas híbridas: al ser un preview experimental de Qwen4, sirve como banco de pruebas para estudiar Gated DeltaNet, QSA y n-gram embeddings en cargas reales.
- Extracción de información de corpus largos: resúmenes y Q&A sobre miles de páginas con contexto de 1M tokens, útil en dominios legal, médico o académico.

## Benchmarks y rendimiento

La model card incluye una sección de resultados de benchmarks, pero en la información proporcionada solo aparece el encabezado y estilos de tabla, sin los valores numéricos. Por tanto:

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint FP8 ocupa 253,5 GB en disco; en FP8 la inferencia requiere aproximadamente 180 GB de VRAM solo para pesos, más overhead de KV cache y activaciones. En BF16 serían unos 360 GB.
- GPU recomendadas: para FP8 en un solo nodo, 2× H100 80GB o 4× A100 80GB como mínimo; para el modelo completo en BF16, 8× H100 80GB. El tamaño de 253,5 GB del repo sugiere despliegue multi-GPU obligatorio.
- No cabe en GPU de consumo (RTX 4090, 24 GB) ni en configuraciones multi-GPU de consumo razonables, dado el volumen de pesos.
- Opciones de despliegue: transformers, vLLM, SGLang y TokenSpeed, según la model card. No se menciona soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card afirma que las métricas de rendimiento del FP8 son "casi idénticas" a las del modelo original, pero sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (este) | 180B totales (125B LM) | 6B | 262K / 1M | qwen-community-1.0 | Open weights en HF |
| Qwen3.8-Flash (oficial, Qwen Cloud) | no disponible | no disponible | 1M por defecto | propietaria (API) | Solo API gestionada |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo experimental: la propia model card lo describe como un preview de la arquitectura Qwen4, sin garantías de estabilidad ni de soporte a largo plazo.
- Licencia qwen-community-1.0: es necesario revisar el fichero LICENSE del repositorio antes de cualquier uso comercial; no se detallan aquí las restricciones concretas.
- Repositorio de cuantización de terceros: el checkpoint lo publica el usuario foxAIengineer, no el equipo oficial de Qwen, por lo que la calidad de la cuantización FP8 no está avalada por el autor original.
- Sin datos de benchmarks verificables en la información disponible: no se puede confirmar la degradación real respecto al modelo base.
- Idiomas soportados no especificados: riesgo de comportamiento desigual fuera del inglés y el chino.
- Riesgo de alucinación inherente a los LLM, agravado en contextos muy largos donde la atención puede diluirse.
- Tool calling no confirmado: no asumir soporte nativo de function calling sin validación empírica.
- Requisitos de hardware muy elevados: 253,5 GB de pesos FP8 excluyen el despliegue en infraestructura modesta.
- El contexto extendido a 1M tokens puede degradar la calidad y aumentar la latencia y el consumo de KV cache de forma no lineal.
- Fecha de creación del repositorio (2026-11-12) y ausencia de descargas o likes: no hay evidencia de uso en producción ni de validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/foxAIengineer/Qwen3.8-Flash-Next-125b-colibri-i4-gs64
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Blog oficial: https://qwen.ai/blog?id=qwen3.8-flash-next
- Informe técnico: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf
- Repositorio GitHub: https://github.com/QwenLM/Qwen3.8-Flash-Next
- Qwen Cloud (Qwen3.8-Flash oficial): https://www.qwencloud.com/models/qwen3.8-flash
- Qwen Cloud: https://www.qwencloud.com

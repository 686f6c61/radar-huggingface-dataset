# CMB-ClimateModernBERT/Merge_TIES_D05_LRD

## Resumen

ClimateModernBERT es una familia de codificadores especializados en el dominio climático, obtenidos mediante continuación del preentrenamiento de ModernBERT-Base sobre un corpus de 6.420 millones de tokens de texto científico, normativo y periodístico relacionado con el clima. Este modelo concreto, `Merge_TIES_D05_LRD`, es el resultado de fusionar tres variantes de la familia mediante el método TIES-Merging con una tasa de descarte de 0,5. La fusión combina los pesos de los modelos entrenados sobre corpus académico, web climática y datos sintéticos, buscando aprovechar las fortalezas de cada fuente sin interferencias entre parámetros.

El modelo conserva la arquitectura de ModernBERT-Base: 150 millones de parámetros, 22 capas, 12 cabezas de atención y una ventana de contexto de 8.192 tokens. Está diseñado para tareas de codificación de texto, especialmente clasificación, etiquetado múltiple y recuperación sobre documentos corporativos, políticas climáticas, literatura científica y noticias. Según los autores, alcanza una F1 media de 75,4 en nueve benchmarks de NLP climático, superando al ModernBERT-Base original (73,5) y a ClimateBERT (72,1) bajo el mismo protocolo de evaluación.

La relevancia actual de este modelo radica en su enfoque en un dominio específico y en la metodología de fusión de modelos, que permite combinar especializaciones sin necesidad de reentrenar desde cero. Es una alternativa ligera y de código abierto para investigación y aplicaciones de análisis de texto climático, aunque su licencia no está especificada en la documentación disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-Base), 22 capas, hidden 768, 12 cabezas, vocab 50.368 |
| Parametros totales | 149.655.232 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés |
| Licencia | No disponible |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de ModernBERT-Base, un encoder transformer con atención clásica y normalización de capas. Sobre esta base se realizó una continuación del preentrenamiento en dos fases, siguiendo la receta de ModernBERT. La fase 1 consistió en extensión de contexto con 3 épocas, LR constante 3e-4, batch global 576, longitud de secuencia 8.192, masking MLM al 30%, optimizador StableAdamW y precisión BF16. La fase 2 aplicó una especialización con decaimiento de LR según la función `1 − √t`, partiendo de 3e-4 y con factor final 1e-3, durante otras 3 épocas. El entrenamiento se realizó con 4× NVIDIA A100 y MosaicML Composer.

El corpus de entrenamiento combina tres fuentes: académica (~1,28 mil millones de tokens de artículos revisados por pares, archivo ClimateNews 2000-2022, preprints de arXiv y manuales), web climática (~5 mil millones de tokens de FineWeb-Edu filtrada por relevancia climática mediante un filtro de 166 términos y un clasificador FastText) y sintética (~0,14 mil millones de tokens generados por LLM condicionados a extractos semilla del dominio). El método de fusión empleado es TIES-Merging, que resuelve interferencias entre parámetros mediante la identificación de cambios de signo y el descarte de parámetros con baja magnitud, con una tasa de descarte (drop ratio) de 0,5. Los tres modelos fusionados corresponden a las variantes entrenadas sobre cada subcorpus por separado.

## Capacidades

- Codificación de texto enmascarado (fill-mask): genera representaciones contextuales de alta calidad para tokens enmascarados, útil para fine-tuning posterior.
- Clasificación de texto: puede ajustarse para tareas de clasificación binaria, multiclase o multi-etiqueta sobre documentos climáticos.
- Recuperación de información: representaciones densas para búsqueda semántica en corpus extensos de texto climático.
- Dominio especializado: alto rendimiento en terminología climática, divulgaciones corporativas de sostenibilidad y literatura académica del sector.
- Soporte de contexto largo: ventana de 8.192 tokens, adecuada para procesar párrafos extensos o documentos completos en fragmentos.
- Multilingüismo: limitado al inglés, sin capacidades multilingües documentadas.
- Sin generación de texto: es un modelo enmascarado, no un modelo generativo ni de instrucciones.
- Sin tool calling ni capacidades de agente: no está diseñado para interacción conversacional ni para ejecutar funciones externas.

## Casos de uso

- Análisis de informes de sostenibilidad: el modelo puede fine-tunearse para extraer compromisos de reducción de emisiones, metas net-zero y acciones concretas de grandes empresas a partir de informes anuales y divulgaciones TCFD.
- Clasificación de noticias climáticas: permite categorizar artículos periodísticos por tema (mitigación, adaptación, política, ciencia) y por sentimiento, facilitando el seguimiento de la cobertura mediática.
- Detección de greenwashing: mediante clasificación multi-etiqueta sobre comunicados corporativos, puede identificar inconsistencias entre declaraciones y acciones reportadas.
- Recuperación de literatura científica: al ser un encoder denso, sirve para construir sistemas de búsqueda semántica en repositorios de artículos sobre ciencias del clima y economía energética.
- Análisis de políticas públicas: fine-tuning para etiquetar documentos legislativos o regulatorios según su alineación con objetivos climáticos, como los Acuerdos de París o el Pacto Verde Europeo.
- Evaluación de riesgos climáticos en informes financieros: el modelo puede procesar secciones de memorias anuales para identificar menciones a riesgos físicos y de transición, apoyando análisis de inversión.
- Investigación académica en NLP climático: sirve como base para experimentos de aprendizaje por transferencia, comparación de métodos de fusión y análisis de composición de corpus.

## Benchmarks y rendimiento

La model card reporta una F1 media de 75,4 en nueve benchmarks de NLP climático, evaluada con tres semillas de fine-tuning bajo una configuración de hiperparámetros compartida. Los benchmarks incluyen Climate Detection, Climate Specificity, Commitments & Actions, Climate Sentiment, Net Zero & Reduction, TCFD Recommendations, WFB Nature, WXImpactBench y ClimRetrieve. En comparación, el ModernBERT-Base estable alcanza 73,5 y ClimateBERT 72,1 bajo el mismo protocolo.

| Modelo | F1 media (9 benchmarks) |
|---|---|
| Merge_TIES_D05_LRD | 75,4 |
| ModernBERT-Base (estable) | 73,5 |
| ClimateBERT | 72,1 |

No se han publicado desgloses por benchmark en la información disponible. Los autores señalan que el modelo de fusión por promedio simple (`Merge_Soup_LRD`) alcanza 76,3, por lo que esta variante TIES con drop 0,5 es ligeramente inferior pero sigue superando a los modelos base.

## Requisitos de hardware

- Inferencia en FP16: ~300 MB de VRAM para los pesos (149,6 M parámetros × 2 bytes), más activaciones. Cabe en GPUs con 4 GB o más.
- Fine-tuning: se recomienda al menos 8 GB de VRAM para secuencias de hasta 8.192 tokens, aunque con gradiente acumulado o secuencias más cortas puede reducirse.
- GPUs compatibles: cualquier GPU moderna con soporte CUDA, incluidas RTX 3060, RTX 4090, A100, H100. También funciona en CPU con librerías optimizadas como llama.cpp (aunque no es el formato nativo).
- Despliegue: compatible con Hugging Face Transformers (desde 4.48), vLLM, TGI, y puede convertirse a GGUF para Ollama o llama.cpp.
- Latencia y throughput: no se proporcionan datos oficiales. Para un modelo de 150 M, la inferencia en GPU es de decenas de milisegundos por secuencia corta, y en CPU de unos pocos cientos de milisegundos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 media climática | Licencia |
|---|---|---|---|---|
| Merge_TIES_D05_LRD | 149,6 M | 8.192 | 75,4 | No disponible |
| ModernBERT-Base | 149,6 M | 8.192 | 73,5 | Apache 2.0 (según ModernBERT) |
| ClimateBERT | ~110 M (RoBERTa-base) | 512 | 72,1 | No disponible |

ClimateBERT es un modelo basado en RoBERTa preentrenado con datos de dominio climático, pero con contexto mucho más corto (512 tokens) y arquitectura más antigua. ModernBERT-Base es el modelo base sin adaptación al dominio. El modelo fusionado ofrece una mejora notable sobre ambos en las tareas evaluadas, aunque su licencia no está especificada, lo que puede limitar su uso en producción.

## Limitaciones y advertencias

- Solo inglés: no soporta otros idiomas, lo que limita su aplicación a textos en inglés.
- No es generativo: al ser un modelo enmascarado, no puede generar texto libre ni seguir instrucciones conversacionales.
- Riesgo de alucinación en tareas de clasificación: como cualquier modelo de lenguaje, puede producir etiquetas incorrectas si se usa sin supervisión humana.
- Efectos de los datos sintéticos: los autores advierten que el corpus sintético ayuda en tareas basadas en taxonomías, pero degrada el rendimiento en tareas que requieren comprensión de discurso fino o compromisos.
- Evaluación limitada al nivel de frase o pasaje: la capacidad de contexto largo no se ha explotado plenamente en los benchmarks reportados.
- Licencia no especificada: no se indica bajo qué términos se distribuye el modelo, lo que genera incertidumbre para uso comercial o redistribución.
- Sesgos de dominio: al estar entrenado principalmente con texto académico y periodístico, puede no capturar jerga técnica de sectores específicos (p. ej., ingeniería o finanzas) con la misma precisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CMB-ClimateModernBERT/Merge_TIES_D05_LRD
- Repositorio original con pesos idénticos: https://huggingface.co/sraj/TIES_D05_CMB_MARK_CX_LRD_CMB_FWEdu_V2_CX_LRD_CMB_WX_SYN_CX_LRD
- Colección ClimateModernBERT de sraj: https://huggingface.co/collections/sraj/climatemodernbert
- Documentación de nomenclatura del proyecto: https://github.com/Michaelyya/ClimateModernBERT/blob/main/docs/model-naming.md
- Paper de TIES-Merging: https://arxiv.org/abs/2306.01708
- Repositorio de referencia sobre TIES-Merging: https://github.com/prateeky2806/ties-merging

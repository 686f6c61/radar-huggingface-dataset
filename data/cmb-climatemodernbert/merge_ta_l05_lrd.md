# CMB-ClimateModernBERT/Merge_TA_L05_LRD

## Resumen

ClimateModernBERT Merge_TA_L05_LRD es un modelo de lenguaje enmascarado (masked language model) de dominio climático, obtenido mediante continued pretraining de ModernBERT-Base sobre un corpus especializado de 6.420 millones de tokens. Forma parte de la familia ClimateModernBERT, desarrollada por el repositorio CMB-ClimateModernBERT, y su nombre indica que se ha fusionado mediante task arithmetic con un coeficiente λ = 0,5, combinando tres checkpoints previamente adaptados a corpus académico, web climático y texto sintético.

El modelo está diseñado para la investigación en procesamiento de lenguaje natural aplicado al clima: codificación de textos, clasificación, etiquetado multi-etiqueta y recuperación de información sobre divulgaciones corporativas, documentos de políticas, literatura científica y noticias climáticas. Con 149,6 millones de parámetros, 22 capas y una ventana de contexto de 8.192 tokens, alcanza un F1 promedio de 73,6 en nueve benchmarks climáticos, ligeramente por encima del baseline ModernBERT-Base (73,5) y de ClimateBERT (72,1) bajo el mismo protocolo de evaluación.

La relevancia de este modelo radica en que aborda explícitamente la composición del corpus de entrenamiento en la adaptación de dominio, comparando fuentes académicas, web y sintéticas. No es un modelo de instrucciones ni de generación libre, sino un encoder pensado para fine-tuning posterior en tareas específicas de NLP climático.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-base) |
| Parametros totales | 149.655.232 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de ModernBERT-Base (answerdotai/ModernBERT-base) y se somete a un continued pretraining con objetivo de enmascarado de lenguaje (MLM con tasa de enmascarado del 30 %). La arquitectura es un transformer encoder denso de 22 capas, dimensión oculta 768, 12 cabezas de atención y un vocabulario de 50.368 tokens. No emplea mezcla de expertos ni mecanismos de atención lineal; se trata de un encoder estándar optimizado para contexto largo.

El entrenamiento se realiza en dos fases siguiendo la receta de ModernBERT. La fase 1 extiende el contexto: 3 épocas con LR constante 3e-4, batch global 576, longitud de secuencia 8.192, StableAdamW y precisión BF16. La fase 2 es una especialización con decaimiento de LR según 1 − √t desde 3e-4 hasta un factor final de 1e-3, también durante 3 épocas. El hardware empleado son 4× NVIDIA A100 con MosaicML Composer. Tras el entrenamiento, los checkpoints se fusionan mediante task arithmetic con λ = 0,5, combinando tres modelos: uno entrenado en corpus académico (A_CX_LRD), otro en web climático (CMB_FWEdu_V2_CX_LRD) y un tercero en texto sintético (S_CX_LRD). Los pesos resultantes son idénticos a los del repositorio original de sraj, republicados bajo la nomenclatura del paper.

El corpus de entrenamiento totaliza 6.420 millones de tokens, distribuidos en: corpus académico (~1.280 millones, artículos revisados por pares, archivo ClimateNews 2000-2022, preprints de arXiv y manuales), corpus web climático (~5.000 millones, filtrado de FineWeb-Edu con 166 términos clave y clasificador FastText) y corpus sintético (~0.140 millones, texto generado por LLM condicionado a semillas del dominio). El texto académico original no se redistribuye; solo se publican los pipelines de procesamiento.

## Capacidades

- Codificacion de texto climático: genera representaciones densas de 768 dimensiones para frases, pasajes o documentos completos.
- Fine-tuning para clasificación de secuencias: compatible con `AutoModelForSequenceClassification` de Hugging Face Transformers.
- Etiquetado multi-etiqueta y multi-clase: adecuado para tareas como detección de compromisos climáticos, análisis de sentimiento o clasificación de recomendaciones TCFD.
- Recuperación de información (retrieval): puede usarse como encoder para búsqueda semántica o recuperación densa sobre corpus climáticos.
- Soporte de contexto largo: ventana de 8.192 tokens, útil para documentos extensos como informes corporativos o artículos científicos.
- Sin capacidades de generación de texto ni de instrucciones: es un modelo de lenguaje enmascarado, no un asistente conversacional.
- Sin soporte de tool calling ni de agentes: no implementa function calling ni razonamiento multi-paso.
- Monolingüe: únicamente inglés.

## Casos de uso

- Clasificacion de divulgaciones corporativas: el modelo puede fine-tunearse para detectar si un informe anual menciona objetivos de reducción de emisiones (net zero, reducción de alcance 1 y 2), gracias a su entrenamiento en textos académicos y web climáticos que incluyen lenguaje financiero y de sostenibilidad.
- Analisis de sentimiento en noticias climáticas: permite clasificar artículos de prensa según su tono (positivo, negativo, neutral) sobre eventos climáticos, utilizando el corpus de noticias del ClimateNews archive incluido en la fase de entrenamiento.
- Deteccion de compromisos y acciones: fine-tuning para identificar pasajes donde una organización se compromete a acciones concretas (p. ej., "reducir un 50 % para 2030"), tarea para la que el modelo muestra buen rendimiento según el benchmark Commitments & Actions.
- Etiquetado de documentos de políticas: clasificación multi-etiqueta de recomendaciones TCFD o marcos regulatorios, aprovechando la capacidad de contexto largo para procesar documentos completos de políticas.
- Recuperacion semantica en literatura cientifica: uso como encoder para buscar artículos relevantes sobre cambio climático, sistemas terrestres o economía energética en corpus académicos, gracias a su entrenamiento en preprints y revistas revisadas por pares.
- Analisis de impacto meteorologico: fine-tuning en tareas como WXImpactBench para clasificar eventos meteorológicos extremos y su impacto, un dominio cubierto por el corpus web climático filtrado.
- Investigacion academica en NLP climático: como modelo base para estudiar efectos de composición de corpus en adaptación de dominio, dado que el paper asociado documenta comparaciones sistemáticas de fuentes de datos.

## Benchmarks y rendimiento

Segun la model card, este checkpoint alcanza un F1 promedio de 73,6 en nueve benchmarks climáticos: Climate Detection, Climate Specificity, Commitments & Actions, Climate Sentiment, Net Zero & Reduction, TCFD Recommendations, WFB Nature, WXImpactBench y ClimRetrieve. Las tareas binarias y ClimRetrieve reportan F1 de clase positiva; las multi-clase y multi-etiqueta reportan macro-F1. Las puntuaciones son la media sobre tres semillas de fine-tuning con una configuración de hiperparámetros compartida.

| Modelo | F1 promedio (9 benchmarks) |
|---|---|
| Merge_TA_L05_LRD (este modelo) | 73,6 |
| ModernBERT-Base (baseline estable) | 73,5 |
| ClimateBERT | 72,1 |

No se han publicado resultados individuales por benchmark en la información disponible. El paper asociado (Climate-ModernBERT) documenta la metodología completa, pero no se proporcionan desgloses en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 149,6 millones de parámetros, el peso en FP16 ocupa aproximadamente 0,3 GB. Con cuantización a 8 bits, el uso de VRAM rondaría los 0,15 GB; en FP32, unos 0,6 GB. Estas cifras son estimaciones razonables para un encoder de este tamaño.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM es suficiente (p. ej., NVIDIA GTX 1650, RTX 2060 o superiores). Para fine-tuning con batch grande, se recomienda una GPU con 8-16 GB (RTX 3070/3080/4090) o una A100 en entornos profesionales.
- Compatibilidad con consumer GPU: sí, totalmente. El modelo cabe incluso en hardware integrado con suficiente RAM para el proceso.
- Opciones de despliegue: al ser un modelo de Transformers estándar, puede servirse con Hugging Face Inference Endpoints, vLLM (aunque está pensado para generación, soporta encoders), o mediante scripts personalizados con PyTorch. Para tareas de clasificación, se puede exportar a ONNX o TensorRT para optimización.
- Latencia y throughput: no se han publicado datos específicos. Para un encoder de 150M, la inferencia en GPU consumer suele ser de milisegundos por secuencia; en CPU puede ser de decenas de milisegundos por secuencia corta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 promedio (clima) | Licencia | Formato |
|---|---|---|---|---|---|
| CMB-ClimateModernBERT/Merge_TA_L05_LRD | 149,6M | 8.192 | 73,6 | no disponible | safetensors |
| ModernBERT-Base (answerdotai) | 149,6M | 8.192 | 73,5 (baseline) | Apache 2.0 (según repo original) | safetensors |
| ClimateBERT (climatebert/distilroberta-base-climate-facts) | 82M (distilroberta) | 512 | 72,1 | MIT (según repo original) | safetensors |

La comparativa se basa en los datos de F1 reportados en la model card. ClimateBERT es un modelo más pequeño (82M) con contexto limitado a 512 tokens, mientras que ModernBERT-Base comparte arquitectura y tamaño con este modelo. La ventaja principal del modelo fusionado es su especialización en dominio climático, aunque la ganancia sobre el baseline es modesta (0,1 punto de F1).

## Limitaciones y advertencias

- Solo inglés: el modelo no soporta otros idiomas, lo que limita su aplicación a textos anglófonos.
- Basado en un único encoder (ModernBERT-Base): los resultados no son generalizables a otras arquitecturas.
- Evaluación a nivel de frase o pasaje: los benchmarks climáticos actuales no ejercitan plenamente la capacidad de contexto largo de 8.192 tokens, por lo que el rendimiento en documentos completos puede diferir.
- Datos sinteticos con efectos dependientes de tarea: el corpus sintético ayuda en tareas basadas en taxonomías y marcos, pero degrada el rendimiento en tareas que requieren comprensión fina del discurso o de compromisos.
- No es un sistema de instrucciones: es un modelo de lenguaje enmascarado; no produce respuestas generativas ni garantías factuales calibradas sobre ciencia climática.
- Riesgo de sesgos y alucinaciones: como todo modelo entrenado con MLM, puede reflejar sesgos presentes en el corpus (especialmente en noticias y textos web) y no tiene mecanismos de verificación factual.
- Licencia no disponible: no se especifica la licencia en la model card, lo que genera incertidumbre sobre el uso comercial. Se recomienda contactar con los autores antes de un despliegue productivo.
- Correspondencia con el paper bajo revisión: la model card indica que el mapeo de este checkpoint a una configuración exacta del manuscrito no está completamente resuelto; podría existir ambigüedad en la nomenclatura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CMB-ClimateModernBERT/Merge_TA_L05_LRD
- Repositorio original (sraj): https://huggingface.co/sraj/TA_Lambda05_CMB_MARK_CX_LRD_CMB_FWEdu_V2_CX_LRD_CMB_WX_SYN_CX_LRD
- Repositorio GitHub del proyecto: https://github.com/Michaelyya/ClimateModernBERT
- Colección ClimateModernBERT: https://huggingface.co/collections/sraj/climatemodernbert
- Modelo recomendado para uso general (Merge_Soup_LRD): https://huggingface.co/CMB-ClimateModernBERT/Merge_Soup_LRD
- Paper (título parcial): Climate-ModernBERT: Revisiting Corpus Composition for Domain-Adaptive Continued Pretraining (enlace no disponible en la información proporcionada)

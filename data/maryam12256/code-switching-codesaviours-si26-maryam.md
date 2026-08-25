# Maryam12256/code-switching-codesaviours-si26-Maryam

## Resumen

El modelo `Maryam12256/code-switching-codesaviours-si26-Maryam` es un fine-tuning de XLM-RoBERTa (base) orientado a la clasificación de tokens para detectar el cambio de código lingüístico (code-switching) entre urdu romanizado e inglés, un fenómeno habitual en redes sociales y mensajería en Pakistán. Ha sido desarrollado por Maryam Farhan (usuario `Maryam12256`) en el marco de la iniciativa Codesaviours SI26, cuyo objetivo es construir herramientas de PLN para texto real mezclado, donde los modelos entrenados solo con inglés o urdu "limpio" fallan.

El modelo tiene 277.455.363 parámetros y se distribuye en formato safetensors (1,1 GB), usando el pipeline de token-classification de la librería transformers. Aunque la model card publicada no aporta detalles técnicos, los repositorios asociados al proyecto indican que se trata de un sistema de etiquetado de cada palabra por idioma, un componente básico para tareas posteriores como análisis de sentimiento o búsqueda sobre texto mixto.

Su relevancia radica en que aborda un caso real de uso del lenguaje en entornos digitales multilingües, un área tradicionalmente poco cubierta por los modelos preentrenados estándar, y lo hace mediante una arquitectura conocida (XLM-RoBERTa) con una capa de clasificación por tokens, lo que facilita su integración en pipelines de procesamiento de texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (base) con head de token-classification |
| Parámetros totales | 277.455.363 |
| Parámetros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible (XLM-RoBERTa base soporta 512 tokens, pero no se confirma para este modelo) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | urdu (romanizado) e inglés (según contexto del proyecto) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de XLM-RoBERTa base, un transformer encoder preentrenado sobre datos multilingües (CommonCrawl, Wikipedia, etc.) con objetivo de lenguaje enmascarado. Sobre su representación de cada token se añade una cabeza de clasificación lineal que asigna una etiqueta de idioma (p. ej., `UR` para urdu, `EN` para inglés) a cada palabra. Esta arquitectura es estándar para tareas de token-level classification y permite procesar secuencias de hasta 512 tokens.

En cuanto al entrenamiento, no se han publicado detalles sobre el dataset de fine-tuning, hiperparámetros o procedimiento (no se indica si se usó fp16, bf16, etc.). Los repositorios de GitHub asociados al proyecto (por ejemplo, el de `sumair789-lgtm`) mencionan la construcción de un dataset etiquetado de code-switching roman urdu-inglés, pero no se ha hecho público un dataset concreto ni una descripción formal del corpus. No hay evidencia de uso de RLHF, DPO u otras técnicas de alineación, dado que se trata de un modelo discriminativo (no generativo).

## Capacidades

- Clasificación de tokens por idioma en texto mixto urdu romanizado e inglés (code-switching).
- Reconocimiento de fronteras de cambio de idioma dentro de una misma frase, útil para análisis lingüístico.
- Integración con el pipeline de `transformers` para token-classification, lo que permite su uso directo con `pipeline("token-classification")`.
- Soporte de inferencia en local mediante la librería transformers y en entornos de despliegue compatibles con safetensors.
- No se han detectado capacidades de generación de texto, tool calling, agentes o procesamiento multimodal; es un modelo puramente discriminativo para etiquetado de tokens.

## Casos de uso

- Análisis de sentimiento en redes sociales: dado que la mayoría de los usuarios pakistaníes escriben mezclando urdu roman e inglés, este modelo permite pre-procesar el texto para identificar qué palabras son de cada idioma y luego aplicar modelos de sentimiento específicos por idioma o un modelo conjunto.
- Búsqueda y recuperación de información en texto mixto: indexar documentos o publicaciones etiquetando cada token por idioma permite construir buscadores que normalicen las variantes romanizadas del urdu y las traten como equivalentes a su forma en escritura árabe.
- Filtrado de contenido en moderación de plataformas: al identificar el idioma de cada token, se pueden aplicar reglas de moderación (detección de spam, abuso, etc.) de forma más precisa sobre el texto mixto.
- Construcción de corpus lingüísticos: el modelo puede usarse para anotar automáticamente grandes volúmenes de texto y crear datasets de code-switching para investigaciones sociolingüísticas o entrenamiento de otros modelos.
- Mejora de sistemas de transcripción y OCR: el proyecto asociado (urdu-ocr-codesaviours-si26) sugiere que el etiquetado de idioma puede combinarse con OCR para mejorar la precisión al reconocer texto mixto en imágenes.
- Enriquecimiento de sistemas de atención al cliente: en empresas que atienden a usuarios de Pakistán, el etiquetado previo por idioma permite enrutar consultas al modelo de lenguaje adecuado (urdu o inglés) o activar respuestas predefinidas según el idioma detectado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se aportan métricas de precisión, F1, ni comparaciones con otros modelos de la categoría. La única información cuantitativa es el número de parámetros y el tamaño del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: con 277 millones de parámetros, en fp32 el modelo ocupa alrededor de 1,1 GB; en fp16, unos 0,55 GB. La carga en memoria para inferencia será de aproximadamente 1,2-1,5 GB en fp32, y menos de 1 GB en fp16.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia en batch pequeño (p. ej., NVIDIA GTX 1650, RTX 3050, etc.). Para entrenamiento, se recomienda una GPU con 8 GB o más (RTX 3070, RTX 4090, A100, etc.).
- Sí cabe en GPU de consumo: el modelo es ligero y se puede ejecutar en una GPU doméstica, incluso en CPU con un rendimiento aceptable para lotes pequeños.
- Opciones de despliegue: al ser un modelo de transformers, se puede servir con `transformers` mediante `pipeline`, o con frameworks de inferencia como vLLM, TGI, o llama.cpp (si se convierte a GGUF, aunque no se indica que exista formato GGUF). También es compatible con la API de Hugging Face Inference Endpoints.
- Latencia y throughput: no hay datos medidos. En una GPU moderna (p. ej., RTX 3090), se esperan latencias de milisegundos por frase corta, pero no se han publicado mediciones oficiales.

## Comparativa con modelos similares

No hay información pública sobre modelos comparables entrenados específicamente para code-switching roman urdu-inglés. A modo de referencia, se puede comparar con los modelos base de los que parte:

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| XLM-RoBERTa base | 278 M | 512 tokens | preentrenamiento multilingüe | MIT | público |
| mBERT | 178 M | 512 tokens | preentrenamiento multilingüe | Apache-2.0 | público |
| Este modelo | 277 M | 512 tokens (estimado) | token-classification (code-switching) | no disponible | público en HF |

La comparación con otros modelos de code-switching específicos no es posible por falta de información.

## Limitaciones y advertencias

- No se han publicado detalles sobre el dataset de entrenamiento, por lo que no es posible conocer posibles sesgos en las variedades de urdu, registros o dominios.
- No hay datos de evaluación, por lo que no se puede estimar la precisión real en producción; se recomienda validar en un corpus propio antes de desplegar.
- La model card es una plantilla automática sin información específica, lo que indica una documentación incompleta por parte del autor.
- La licencia no está especificada, lo que genera incertidumbre legal para uso comercial; se recomienda contactar con el autor antes de integrar el modelo en un producto.
- El modelo solo cubre urdu romanizado e inglés; no es aplicable a otros idiomas o variantes del urdu (p. ej., en escritura árabe).
- No se ha confirmado la longitud de contexto; si se hereda de XLM-RoBERTa, el límite es de 512 tokens, lo que limita su uso en documentos largos.
- Riesgo de alucinación no aplica (no es un modelo generativo), pero sí existe riesgo de errores de etiquetado en textos ambiguos o con dialectos no representados en el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Maryam12256/code-switching-codesaviours-si26-Maryam
- Dataset asociado: https://huggingface.co/datasets/Maryam12256/code-switching-codesaviours-si26-Maryam
- Perfil del autor: https://huggingface.co/Maryam12256
- Repositorio de proyecto relacionado (por otro participante): https://github.com/sumair789-lgtm/Code-switching-codesaviours-si26--Sumair-
- Repositorio de OCR urdu (proyecto paralelo): https://github.com/meryambutt123-a11y/urdu-ocr-codesaviours-si26-maryam
- Referencia de XLM-RoBERTa (paper): https://arxiv.org/abs/1910.09700

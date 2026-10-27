# openbmb/MiniCPM-OCR-Jev

## Resumen

MiniCPM-OCR Jev es un modelo de evaluación de calidad de OCR de 2B parámetros desarrollado por OpenBMB (BAAI/Tsinghua). No es un modelo generativo de OCR: recibe la imagen de una región de documento (texto, fórmula o tabla) junto con un resultado candidato de OCR y devuelve una puntuación entre 0 y 1 que indica la probabilidad de que ese candidato sea correcto. Su función es actuar como verificador dentro de pipelines de digitalización documental.

El modelo se entrena a partir de Qwen3.5-2B conservando el codificador visual y el backbone de lenguaje, pero sustituyendo la cabeza de salida `lm_head` por una cabeza de clasificación binaria. El resultado es un verificador muy compacto que, en la métrica de decisión AUROC (×100) sobre JevOCRBench, alcanza 93,6, por encima de JEV-35B-A3B (90,1) y muy cerca de Qwen3.5-397B-A17B (93,8), con un coste de inferencia de dos órdenes de magnitud menor.

Su relevancia práctica está en dos patrones de uso: el cribado automático (aceptar las regiones con puntuación alta y derivar el resto a revisión humana) y la selección best-of-N entre varios motores de OCR que parsean la misma región. La generalización medida sobre candidatos de MiniCPM-OCR 1.0, GLM-OCR, PaddleOCR-VL-1.6 y Xiaomi-OCR-0 se mantiene en 91,9–93,4 AUROC, lo que lo hace utilizable como componente agnóstico al motor de OCR subyacente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (codificador visual + backbone de lenguaje Qwen3.5-2B) con cabeza de clasificación binaria que sustituye a `lm_head` |
| Parámetros totales | 2.213.245.760 (2,2B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible en la información proporcionada; se documenta despliegue en formato GGUF mediante llama.cpp y Ollama |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 4,4 GB); GGUF para llama.cpp/Ollama |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B y mantiene tanto el codificador visual como el backbone de lenguaje; la única modificación estructural declarada es la sustitución de la cabeza de generación `lm_head` por una cabeza de clasificación binaria que aprende a discriminar si un candidato de OCR es correcto. La unidad de evaluación es una región (texto, fórmula o tabla) junto con su resultado candidato, y la entrada efectiva combina tres elementos: el recorte original de la imagen de la región, el texto candidato y una imagen renderizada a partir de ese texto candidato. La salida es un escalar en el rango 0–1, donde valores altos indican mayor probabilidad de acierto.

No se han publicado en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. La evaluación se realiza sobre JevOCRBench, un conjunto publicado por el propio autor en HuggingFace, del que se describe un subconjunto de 200 muestras anotadas manualmente para el experimento de comparación entre motores de OCR. El modelo se distribuye con pipeline `image-text-to-text` y admite despliegue con renderizador integrado (API en la nube, imagen Docker o SDK) o sin él, en cuyo caso hay que proporcionar también la imagen renderizada del candidato.

## Capacidades

- Puntuación de calidad de OCR: devuelve un score de 0 a 1 por región y candidato, interpretable como probabilidad de corrección.
- Cobertura de tres tipos de región: texto plano, fórmulas matemáticas y tablas.
- Verificación agnóstica al motor: puntúa candidatos generados por MiniCPM-OCR 1.0, GLM-OCR, PaddleOCR-VL-1.6 y Xiaomi-OCR-0 con una horquilla de AUROC de 91,9 a 93,4.
- Selección best-of-N: puntúa los candidatos de varios motores para una misma región, elige el de mayor puntuación y recompone el documento en orden de lectura.
- Cribado automático: permite fijar un umbral calibrado con muestras de la aplicación para aceptar automáticamente las regiones fiables y derivar el resto a revisión humana.
- Procesamiento por lotes: la documentación de API contempla los modos de una candidata, best-of-N y best-of-N por lotes.
- Multilingüe limitado: inglés y chino.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes o razonamiento multi-paso: no disponible; el modelo es un clasificador de salida única, no un generador.
- Modo thinking, visión general o audio: no disponible; la entrada visual se limita a regiones de documento con su candidato.

## Casos de uso

- Cribado automático en digitalización masiva de expedientes: cada región se puntúa y solo las que superan el umbral pasan sin intervención; el resto se enruta a revisión humana, reduciendo la carga de revisión sin degradar la precisión de lo aceptado automáticamente.
- Enrutado a revisión en documentos legales: el modelo permite fijar umbrales conservadores para texto jurídico, donde un error de transcripción tiene consecuencias altas, y monitorizar simultáneamente la precisión de lo aceptado y el volumen de revisión.
- Selección del mejor motor de OCR por región en recibos y facturas: se ejecutan dos o tres motores sobre el mismo recorte y MiniCPM-OCR Jev elige el candidato con mayor score, combinando los resultados en orden de lectura.
- Verificación de fórmulas científicas: el candidato se renderiza como imagen y se compara con el recorte original, lo que detecta errores de transcripción en subíndices, superíndices y estructuras de fracciones que los correctores basados en texto no capturan.
- Control de calidad de tablas extraídas: puntuación de las regiones de tabla antes de cargarlas en un pipeline de datos, para evitar que tablas mal parseadas contaminen procesos posteriores (conciliación contable, extracción de series).
- Migración entre motores de OCR: al cambiar de proveedor de parsing, el verificador permite medir automáticamente, región a región, si el nuevo motor mejora las extracciones de las regiones problemáticas antes de un despliegue completo.
- Reducción de coste frente a verificadores de gran tamaño: sustituye a modelos de 35B o 397B en la etapa de discriminación, ya que su AUROC es superior al primero y prácticamente equivalente al segundo con 2,2B de parámetros.
- Despliegue en local o en el borde: al caber en GPUs de consumo y en CPU con GGUF, permite verificar extracciones en entornos con requisitos de confidencialidad de datos.

## Benchmarks y rendimiento

Evaluación de discriminación sobre JevOCRBench, AUROC (×100), donde mayor es mejor:

| Modelo | Parámetros | AUROC (×100) |
|---|---|---|
| MiniCPM-OCR Jev | 2,2B | 93,6 |
| Qwen3.5-397B-A17B | 397B totales / 17B activos | 93,8 |
| JEV-35B-A3B | 35B totales / 3B activos | 90,1 |

Generalización sobre candidatos generados por distintos motores (mismas 200 muestras aleatorias de JevOCRBench, candidatos anotados manualmente, diferencia máxima observada de 1,5 puntos):

| Motor de OCR del candidato | AUROC (×100) |
|---|---:|
| MiniCPM-OCR 1.0 | 92,7 |
| GLM-OCR | 91,9 |
| PaddleOCR-VL-1.6 | 93,4 |
| Xiaomi-OCR-0 | 93,1 |

Los desgloses por categoría (texto, fórmula, tabla) se publican únicamente como imagen en la model card, por lo que sus valores numéricos no están disponibles en la información proporcionada. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras tareas generativas en la información disponible, lo cual es coherente con la naturaleza de clasificador del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16/BF16, los pesos ocupan unos 4,4 GB y el conjunto con codificador visual y overhead de activaciones se sitúa en el entorno de 6-8 GB; en cuantización de 8 bits, aproximadamente 2,5-3,5 GB; en cuantización de 4 bits, aproximadamente 1,5-2,5 GB. Son estimaciones por tamaño, no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU con 8 GB o más para FP16, como RTX 3060 Ti, RTX 4060 Ti o RTX 4070; A100/H100 no son necesarias y solo tienen sentido para servir muchas peticiones en paralelo.
- Cabe en GPU de consumo: sí. Con cuantización de 4 u 8 bits funciona incluso en GPUs de 6-8 GB, y en CPU mediante GGUF.
- Opciones de despliegue documentadas: vLLM (con y sin renderizador), SGLang, llama.cpp (GGUF), Ollama, FlagOS para entornos multi-chip, servicio Docker/SDK local y API en la nube.
- Latencia y throughput: no disponible en la información proporcionada. Al ser un clasificador de salida única de 2,2B, el coste por región es sustancialmente menor que el de un modelo generativo del mismo tamaño.

## Comparativa con modelos similares

| Modelo | Rol | Parámetros | AUROC (×100) en JevOCRBench | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MiniCPM-OCR Jev | Verificador de calidad de OCR | 2,2B densos | 93,6 | No disponible | Apache 2.0 | Pesos en HF, safetensors y GGUF |
| Qwen3.5-397B-A17B | Verificador / modelo generalista | 397B totales, 17B activos | 93,8 | No disponible | No disponible | No disponible en esta información |
| JEV-35B-A3B | Verificador de calidad de OCR | 35B totales, 3B activos | 90,1 | No disponible | No disponible | No disponible en esta información |
| MiniCPM-OCR 1.0 | Motor de parsing OCR (complementario, no sustituto) | No disponible | No se evalúa como verificador | No disponible | No disponible | Referenciado como motor de OCR en la documentación del autor |

La comparación directa es favorable a MiniCPM-OCR Jev en la relación calidad/coste: supera en 3,5 puntos a un verificador de 35B con 3B activos y queda a 0,2 puntos de un modelo de 397B, con 2,2B de parámetros. No es comparable con motores de OCR como PaddleOCR-VL o MiniCPM-OCR 1.0, ya que resuelve una tarea distinta (verificar, no transcribir) y de hecho se usa junto a ellos.

## Limitaciones y advertencias

- Solo verifica, no genera: la calidad final está acotada por la cobertura y corrección de los candidatos existentes; si ningún motor produce el texto correcto, el modelo no puede recuperarlo.
- Requisito de alineación de candidatos: los candidatos comparados para una misma región deben compartir los límites del recorte y del contenido; candidatos desalineados invalidan la comparación.
- Idiomas limitados a inglés y chino; el comportamiento en otros alfabetos o sistemas de escritura no está documentado.
- Longitud de contexto no publicada, lo que impide planificar el procesamiento de regiones muy extensas o de páginas completas sin segmentación previa.
- Calibración obligatoria del umbral: la relación entre umbral, precisión de lo aceptado automáticamente y volumen de revisión depende de la aplicación, por lo que hay que calibrar con muestras propias y monitorizar ambas métricas en producción.
- Interpretación acotada del score: es una probabilidad de corrección relativa al candidato, no una medida de confianza absoluta ni una garantía de exactitud.
- Sesgos: no se documentan análisis de sesgo por tipo de documento, idioma, tipografía o calidad de escaneo.
- Riesgo de alucinación bajo por diseño (salida escalar en lugar de texto libre), pero persiste el riesgo de falsos positivos en regiones degradadas.
- Licencia Apache 2.0, que permite uso comercial; conviene verificar los términos heredados del modelo base Qwen3.5-2B, no detallados en la información disponible.
- Madurez temprana: 2 descargas y 16 likes en el momento de la consulta, con documentación de API en la nube marcada como pendiente de redacción, lo que limita la validación independiente.
- El desglose de rendimiento por categoría (texto, fórmula, tabla) no está disponible en formato numérico, solo como imagen, lo que dificulta la comparación fina con otros verificadores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/openbmb/MiniCPM-OCR-Jev
- Dataset de evaluación JevOCRBench: https://huggingface.co/datasets/openbmb/JevOCRBench
- Repositorio GitHub: https://github.com/OpenBMB/MiniCPM-OCR
- Tutorial de uso (inglés): https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/minicpm_ocr_jev_tutorial_en.md
- Documentación de API en la nube (single-candidate, best-of-N, batched best-of-N): https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/minicpm_ocr_jev_api_en.md
- Despliegue con vLLM: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/vllm_deploy_jev_en.md
- Despliegue con SGLang: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/sglang_deploy_jev_en.md
- Despliegue con llama.cpp (GGUF): https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/llamacpp_deploy_jev_en.md
- Despliegue con Ollama: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/ollama_deploy_jev_en.md
- Despliegue multi-chip con FlagOS: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/flagos_deploy_en.md

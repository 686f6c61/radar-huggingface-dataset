# abzoo/paddleocr-vl-curriculum-015

## Resumen

`abzoo/paddleocr-vl-curriculum-015` es un fine-tuning del modelo PaddleOCR-VL, un vision-language model (VLM) especializado en el reconocimiento óptico de caracteres (OCR) y el parseo de documentos. Este checkpoint concreto ha sido ajustado por el usuario `abzoo` para el reconocimiento de documentos de identidad nacionales egipcios, empleando una estrategia de curriculum learning en tres etapas (aunque solo se ha completado la primera). El modelo base, PaddleOCR-VL-.9B, combina un codificador visual de resolución dinámica estilo NaViT con el modelo de lenguaje ERNIE-4.5-0.3B, lo que le permite procesar imágenes de documentos completos y extraer texto estructurado.

Con aproximadamente 958 millones de parámetros, este checkpoint es un LoRA (r=64, alpha=64) aplicado sobre el modelo base. Los resultados reportados en la model card indican una precisión normalizada del 35,1% sobre un conjunto de prueba de 211 imágenes de IDs egipcios, lo que refleja que se trata de un entrenamiento temprano (etapa 1 de 3, solo 1 época) y que el modelo aún no ha alcanzado su rendimiento óptimo. A pesar de ello, el enfoque de curriculum learning (transición de datos sintéticos a reales) es metodológicamente relevante para dominios con escasez de datos anotados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language Model (VLM) basado en PaddleOCR-VL-.9B: codificador visual NaViT + LLM ERNIE-4.5-0.3B |
| Parametros totales | 958.588.736 (aprox. 0,96B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el uso con `load_in_4bit` es una opción de carga, no una cuantización publicada) |
| Idiomas soportados | no disponible (el entrenamiento se centra en texto árabe, específicamente nombres egipcios) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base PaddleOCR-VL-.9B integra un codificador visual con resolución dinámica (estilo NaViT) que adapta el tamaño de las imágenes de entrada sin necesidad de redimensionado fijo, junto con el modelo de lenguaje ERNIE-4.5-0.3B. Esta combinación permite procesar documentos completos y reconocer elementos como texto, tablas y figuras. El fine-tuning aquí presentado utiliza LoRA con r=64 y alpha=64, lo que reduce significativamente el número de parámetros entrenables.

El entrenamiento sigue un esquema de curriculum learning en tres etapas: (1) pre-entrenamiento con nombres árabes sintéticos hasta saturación, (2) transición real→sintético→real, y (3) pulido con datos reales y menor tasa de aprendizaje. El checkpoint actual corresponde a la etapa 1, con una sola época. Los datasets usados son `abzoo/arabic-names-synthetic-ocr` (2.363 train / 262 val) y `abzoo/egyptian-id-ocr` (2.436 train / 211 test). No se menciona el uso de RLHF ni DPO; el entrenamiento es supervisado estándar.

## Capacidades

- Reconocimiento de texto en imágenes de documentos de identidad egipcios, específicamente nombres en árabe.
- Extracción de campos estructurados (aunque con precisión limitada en este checkpoint).
- Procesamiento de imágenes a resolución dinámica gracias al codificador NaViT.
- Generación de texto a partir de imágenes (OCR generativo).
- No se reportan capacidades de tool calling, agentes, razonamiento multi-paso ni soporte de audio o vídeo.
- Multilingüismo limitado: el entrenamiento se centra en árabe, aunque el modelo base podría tener capacidades más amplias no verificadas aquí.

## Casos de uso

- Verificación de identidad en onboarding digital: el modelo puede extraer el nombre del titular de un ID egipcio escaneado, aunque con la precisión actual (35% normalizado) requeriría revisión humana o post-procesamiento adicional.
- Digitalización de archivos gubernamentales: conversión de formularios y documentos de identidad en papel a texto estructurado para su indexación en bases de datos.
- Automatización de procesos KYC (Know Your Customer): integración en flujos de verificación de clientes en banca o telecomunicaciones, donde el OCR de IDs es un paso crítico.
- Asistencia en traducción de documentos: al extraer nombres y campos en árabe, puede servir como entrada para sistemas de traducción automática.
- Investigación en OCR de bajo recurso: el enfoque de curriculum learning con datos sintéticos es replicable para otros idiomas o dominios con pocos datos reales.
- Prototipado de sistemas de extracción de datos: dado su tamaño moderado (~1GB), puede desplegarse en entornos de prueba para validar pipelines de OCR antes de escalar a modelos más grandes.

## Benchmarks y rendimiento

Según la model card, los resultados sobre el conjunto de prueba real (211 imágenes) son:

| Metrica | Valor |
|---|---|
| Precisión estricta (exact match) | 31,3% (66/211) |
| Precisión normalizada | 35,1% (74/211) |

Desglose por distancia de edición:

| Distancia | Conteo | Porcentaje |
|---|---|---|
| Exacta (0) | 74 | 35,1% |
| Cercana (1) | 42 | 19,9% |
| Cercana (2) | 18 | 8,5% |
| Cercana (3) | 8 | 3,8% |
| Incorrecta (4+) | 69 | 32,7% |

No se han publicado comparaciones con otros modelos en la información disponible. El rendimiento es claramente insuficiente para producción, dado que es un checkpoint temprano de la etapa 1.

## Requisitos de hardware

- VRAM estimada: con cuantización de 4 bits (como se muestra en el ejemplo de uso con `load_in_4bit`), el modelo puede caber en GPUs con 6-8 GB de VRAM. Sin cuantizar, el checkpoint de ~1,9 GB en FP16 requeriría al menos 4 GB adicionales de pesos, más overhead de activaciones, por lo que se recomienda al menos 8-12 GB.
- GPUs recomendadas: RTX 3060 (12 GB), RTX 4070, A10, L4 o superiores. Para inferencia rápida, A100 o H100 son adecuadas.
- Sí cabe en GPUs de consumo (RTX 3060 12GB o superior) con cuantización.
- Opciones de despliegue: al ser un modelo de HuggingFace con safetensors, puede usarse con `transformers` y `unsloth` (como se muestra en el ejemplo). También podría exportarse a ONNX o TensorRT, aunque no se documenta. No se menciona soporte para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles. Dado el tamaño (~1B parámetros), se espera una latencia de decenas de milisegundos por imagen en GPUs modernas, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precisión (OCR) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `abzoo/paddleocr-vl-curriculum-015` | 0,96B | no disponible | 35,1% normalizado (ID egipcio) | no disponible | HuggingFace |
| `PaddlePaddle/PaddleOCR-VL` (base) | 0,9B | no disponible | 94,5% en OmniDocBench v1.5 (según docs) | Apache 2.0 (según repo) | HuggingFace, GitHub |
| TrOCR (base) | ~0,3B | 512 tokens | ~90% en conjuntos estándar (ICDAR) | MIT | HuggingFace |

La comparación es orientativa: el modelo fine-tuneado está especializado en un dominio muy concreto (IDs egipcios) y su rendimiento actual es bajo por ser un checkpoint temprano. El modelo base PaddleOCR-VL es claramente superior en tareas generales de parseo de documentos.

## Limitaciones y advertencias

- Precisión muy baja en este checkpoint (35,1% normalizado), no apto para uso en producción sin un post-procesamiento robusto o entrenamiento adicional.
- Entrenamiento incompleto: solo se ha completado la etapa 1 de 3 del curriculum, con una única época.
- Sesgo del dataset: los datos reales provienen de un único dominio (IDs egipcios) y pueden no generalizar a otros tipos de documentos o variaciones de calidad de imagen.
- Riesgo de alucinación: como todo modelo generativo, puede producir texto plausible pero incorrecto, especialmente con imágenes ruidosas o de baja resolución.
- Licencia no especificada: no se indica bajo qué términos se distribuye este checkpoint, lo que limita su uso comercial sin aclaración legal.
- Sin garantías de soporte: es un modelo subido por un usuario individual, no por el equipo de PaddlePaddle, por lo que no hay mantenimiento ni documentación oficial.
- Contexto y capacidades multilingües no documentadas: no se puede asumir soporte para otros idiomas o longitudes de contexto específicas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abzoo/paddleocr-vl-curriculum-015
- Modelo base PaddleOCR-VL: https://huggingface.co/PaddlePaddle/PaddleOCR-VL
- Repositorio oficial de PaddleOCR: https://github.com/PaddlePaddle/PaddleOCR
- Documentación de PaddleOCR-VL: https://www.paddleocr.ai/latest/en/version3.x/pipeline_usage/PaddleOCR-VL.html
- Informe técnico de PaddleOCR-VL (referenciado en el repo): no se ha encontrado el enlace directo en la búsqueda, pero está disponible en el repositorio de GitHub.

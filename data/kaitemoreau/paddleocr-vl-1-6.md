# kaitemoreau/PaddleOCR-VL-1.6

## Resumen

PaddleOCR-VL-1.6 es un modelo de visión-lenguaje especializado en el análisis y extracción de documentos, desarrollado dentro del ecosistema PaddleOCR de PaddlePaddle. Su función principal es convertir imágenes de documentos (páginas escaneadas, tablas, fórmulas, gráficos, sellos) en texto estructurado, resolviendo el problema del parsing documental de alta fidelidad en entornos de producción. Es relevante porque integra en un único modelo tareas que tradicionalmente requerían pipelines separados de detección de layout, OCR, reconocimiento de tablas y reconocimiento de fórmulas.

El modelo se publica bajo licencia Apache 2.0, con un total de 958.588.736 parámetros (aproximadamente 0,96 mil millones) según los pesos en safetensors, y un repositorio de 1,9 GB. La arquitectura se etiqueta como `paddleocr_vl` y está vinculada a la familia ERNIE 4.5 según los tags del autor, con soporte para inglés, chino y otros idiomas multilingües. El pipeline declarado es `image-text-to-text` con capacidades conversacionales.

La versión 1.6 se presenta como una expansión de las capacidades de parsing documental mediante dos técnicas declaradas en el título: refinamiento de regiones infraoptimizadas (*under-optimized region refinement*) y post-entrenamiento progresivo (*progressive post-training*). El modelo está diseñado para su uso con la librería PaddleOCR y requiere código personalizado (`custom_code`) para su carga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `paddleocr_vl` (visión-lenguaje, familia ERNIE 4.5 según tags) |
| Parametros totales | 958.588.736 (~0,96 B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se etiqueta con la arquitectura `paddleocr_vl` y los tags lo asocian a ERNIE 4.5, lo que sugiere un backbone de visión-lenguaje basado en la familia ERNIE con un codificador visual acoplado. Se trata de un modelo de aproximadamente 0,96 mil millones de parámetros, orientado específicamente a tareas de comprensión de documentos más que a generación generalista. El modelo card menciona explícitamente dos innovaciones de entrenamiento: el refinamiento de regiones infraoptimizadas, que probablemente aborda regiones del documento con baja calidad o densidad de información (sellos, anotaciones, zonas degradadas), y el post-entrenamiento progresivo, una estrategia de ajuste por fases.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se especifican innovaciones de inferencia como decodificación especulativa o atención lineal. Los detalles técnicos completos se remiten al paper con identificador arXiv:2606.03264 citado en los tags.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de documentos.
- Parsing de layout documental: identificación y estructuración de regiones de página.
- Reconocimiento y extracción de tablas.
- Reconocimiento de fórmulas matemáticas.
- Interpretación de gráficos (*chart*).
- Detección y reconocimiento de sellos (*seal*).
- *Spotting* de texto (localización de texto en la imagen).
- Conversión imagen-a-texto en formato conversacional (pipeline `image-text-to-text`).
- Soporte multilingüe con foco en inglés y chino, y cobertura multilingüe adicional.
- No se especifica soporte de tool calling, function calling ni razonamiento multi-paso orientado a agentes en la información disponible.

## Casos de uso

- Digitalización masiva de archivos escaneados: el modelo convierte páginas de documentos en texto estructurado, adecuado para proyectos de preservación documental y migración de archivos físicos a repositorios digitales.
- Extracción de datos de facturas y formularios: al combinar OCR con parsing de layout, permite localizar y extraer campos estructurados de documentos administrativos y financieros.
- Procesamiento de documentación científica: el reconocimiento de fórmulas y gráficos lo hace apto para extraer contenido de papers y artículos técnicos manteniendo la estructura matemática.
- Automatización de ingesta en sistemas RAG: la conversión de PDFs y documentos escaneados a texto estructurado facilita la construcción de bases de conocimiento para pipelines de recuperación aumentada.
- Análisis de documentos con sellos y validaciones: la capacidad de detección de sellos resulta útil en verificación de documentos oficiales, contratos y certificados.
- Extracción de tablas para análisis de datos: permite transformar tablas en imágenes a formatos estructurados para su posterior procesamiento analítico.
- Procesamiento multilingüe de documentos: con soporte para inglés, chino y otros idiomas, cubre flujos documentales internacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con ~0,96 B parámetros, en precisión FP16 el peso ronda los ~1,9 GB, por lo que la VRAM necesaria sería moderada (estimación orientativa a partir del tamaño del repo, no confirmada por el autor).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada oficialmente; por el tamaño del modelo es plausible que quepa en GPU de consumo con VRAM suficiente, pero el dato no está verificado.
- Opciones de despliegue: la librería declarada es PaddleOCR; requiere `custom_code`. No se confirma soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PaddleOCR-VL-1.6 | ~0,96 B | no disponible | Parsing documental VL | Apache 2.0 | Hugging Face, ModelScope |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- No se documentan sesgos conocidos; al ser un modelo especializado en documentos, puede heredar sesgos de los corpus de entrenamiento, que no se detallan.
- Riesgo de alucinación en la transcripción de texto poco legible o en regiones degradadas; el propio título reconoce la existencia de regiones "infraoptimizadas".
- La longitud de contexto no está especificada, lo que dificulta planificar el procesamiento de documentos de muchas páginas.
- Cobertura idiomática declarada limitada a inglés, chino y multilingüe genérico; el rendimiento en otros idiomas no está cuantificado.
- Requiere `custom_code` y la librería PaddleOCR, lo que puede complicar la integración frente a modelos con soporte nativo en frameworks estándar.
- Aunque la licencia es Apache 2.0 (permisiva para uso comercial), conviene verificar las dependencias de PaddlePaddle y los pesos base de ERNIE 4.5.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- No hay benchmarks publicados en la información disponible, por lo que el rendimiento real no puede contrastarse.

## Enlaces

- Hugging Face: https://huggingface.co/kaitemoreau/PaddleOCR-VL-1.6
- Repositorio GitHub de PaddleOCR: https://github.com/PaddlePaddle/PaddleOCR
- Modelo en ModelScope: https://modelscope.cn/models/PaddlePaddle/PaddleOCR-VL-1.6
- Paper (arXiv): https://arxiv.org/abs/2606.03264

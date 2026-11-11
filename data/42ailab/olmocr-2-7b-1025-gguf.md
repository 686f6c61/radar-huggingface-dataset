# 42ailab/olmOCR-2-7B-1025-GGUF

## Resumen

olmOCR-2 7B 1025 es un modelo de reconocimiento óptico de documentos (OCR) especializado en artículos académicos y PDFs, con especial atención a la notación matemática y las fórmulas. Fue desarrollado por el Allen Institute for AI (AI2) y publicado bajo licencia Apache-2.0. El modelo resuelve el problema de la conversión de documentos científicos complejos a texto estructurado, un caso donde los OCR genéricos suelen fallar por la presencia de ecuaciones, tablas y maquetación multicolumna.

La ficha que nos ocupa documenta `42ailab/olmOCR-2-7B-1025-GGUF`, un repositorio de respaldo que no introduce un modelo nuevo ni una conversión propia. Los pesos en formato GGUF fueron generados originalmente por lmstudio-community y este repositorio conserva una copia byte a byte de dos de esos ficheros (pesos Q4_K_M y proyector visual F16), con nombres, tamaños y digests sha256 idénticos a los originales. La motivación declarada es garantizar la disponibilidad a largo plazo de los mismos bytes ante posibles renombrados o eliminaciones del repositorio del conversor.

El modelo es de tipo image-text-to-text, con aproximadamente 7.615 millones de parámetros totales (7,6 B), pensado para ingesta de documentos en pipelines de procesamiento. Su relevancia actual radica en la combinación de un OCR orientado a contenido científico con un empaquetado GGUF que permite su ejecución en entornos locales con llama.cpp y herramientas compatibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal image-text-to-text; arquitectura interna no detallada en la información proporcionada) |
| Parámetros totales | 7.615.616.512 (7,6 B) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (pesos); proyector visual en F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (pesos Q4_K_M + `mmproj` F16 para el proyector visual) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la documentación proporcionada. Por la naturaleza de la tarea (image-text-to-text) y el empaquetado, se trata de un modelo multimodal que combina un codificador visual con un modelo de lenguaje, donde el proyector visual se distribuye como fichero separado `mmproj-olmOCR-2-7B-1025-F16.gguf` (1,26 GiB) para su uso en llama.cpp. El modelo de lenguaje subyacente cuenta con 7.615.616.512 parámetros totales.

Tampoco se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. El autor original (AI2) publica el modelo bajo Apache-2.0, pero los detalles de entrenamiento no forman parte de la documentación de este repositorio de respaldo. La conversión a GGUF corresponde a lmstudio-community y este repositorio no la modifica.

## Capacidades

- Reconocimiento óptico de documentos (OCR) orientado a artículos académicos y PDFs.
- Conversión de contenido científico a texto, con tratamiento cuidadoso de notación matemática y fórmulas.
- Procesamiento de entradas de imagen y texto (pipeline image-text-to-text).
- Generación conversacional sobre el contenido reconocido (etiqueta `conversational`).
- Compatibilidad con endpoints (`endpoints_compatible`).
- Capacidades multilingües: no disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Digitalización de bibliografía académica: el modelo convierte PDFs de artículos científicos en texto estructurado, preservando fórmulas y notación matemática, lo que facilita su indexación en repositorios y gestores de referencias.
- Construcción de corpus para investigación: permite extraer texto de grandes colecciones de papers para tareas posteriores de minería de texto, análisis de citas o entrenamiento de modelos, con la ventaja de ejecutarse localmente en formato GGUF.
- Ingesta en sistemas RAG sobre documentación técnica: al transformar PDFs complejos en texto limpio, alimenta pipelines de recuperación aumentada donde las ecuaciones y tablas deben conservarse con fidelidad.
- Archivado y preservación documental: el repositorio actúa como respaldo verificable (digests sha256) de los pesos, útil para organizaciones que necesitan garantizar la reproducibilidad de sus pipelines de OCR a lo largo del tiempo.
- Despliegue en estaciones de trabajo sin GPU de datacenter: la cuantización Q4_K_M (4,36 GiB) permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles, sin depender de servicios en la nube.
- Procesamiento por lotes de documentación interna: digitalización de manuales, informes y documentación técnica con fórmulas en entornos con requisitos de privacidad, al no requerir el envío de documentos a APIs externas.
- Integración en aplicaciones de escritorio: el empaquetado para 42model (`42model download olmocr2:7b-q4_k_m`) facilita incorporar OCR científico en herramientas de escritorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,6 GiB para el conjunto pesos Q4_K_M (4,36 GiB) más proyector visual F16 (1,26 GiB), sin contar el contexto y los buffers de ejecución; el consumo real será superior según la longitud de contexto configurada.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, el modelo es apto para GPUs de consumo con suficiente VRAM.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en GPUs con 8 GB o más de VRAM, dado el tamaño del conjunto cuantizado; no se confirma en la documentación.
- Opciones de despliegue: llama.cpp y herramientas compatibles con GGUF y ficheros `mmproj`; el autor menciona la aplicación de escritorio 42model. Otras opciones (vLLM, TGI, Ollama) no se confirman en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| olmOCR-2 7B 1025 (este repo) | 7,6 B | no disponible | GGUF (Q4_K_M + mmproj F16) | Apache-2.0 | Respaldo byte a byte de la conversión de lmstudio-community |
| lmstudio-community/olmOCR-2-7B-1025-GGUF | 7,6 B | no disponible | GGUF | Apache-2.0 | Repositorio original de la conversión GGUF |
| Modelo base olmOCR-2 de AI2 | 7,6 B | no disponible | no disponible | Apache-2.0 | Pesos originales del modelo, publicados por AI2 |

No se dispone de datos de rendimiento comparado con otras alternativas de OCR en la información proporcionada.

## Limitaciones y advertencias

- Este repositorio no es un modelo nuevo ni una conversión propia: es una copia de dos ficheros de `lmstudio-community/olmOCR-2-7B-1025-GGUF`, sin modificaciones.
- Solo se incluyen dos ficheros (pesos Q4_K_M y proyector visual F16); no se ofrece la variedad de cuantizaciones habitual en otros repositorios GGUF.
- El modelo está especializado en documentos académicos y PDFs; su rendimiento en otros tipos de documento (formularios, manuscritos, imágenes naturales) no está documentado.
- Riesgo de alucinación y errores de transcripción en fórmulas, tablas y maquetaciones complejas: no se han publicado métricas de precisión en la información disponible.
- Sesgos conocidos: no disponible.
- Idiomas soportados: no disponible; conviene validar el comportamiento en idiomas distintos del inglés antes de usarlo en producción.
- Longitud de contexto: no disponible; esto limita la planificación de documentos largos.
- Licencia Apache-2.0: permite uso comercial, pero debe conservarse el texto de la licencia incluido en el repositorio, procedente del repositorio oficial de AI2.
- La disponibilidad futura del repositorio original del conversor es precisamente el riesgo que este respaldo pretende mitigar; conviene verificar los digests sha256 antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/42ailab/olmOCR-2-7B-1025-GGUF
- Repositorio en ModelScope: https://modelscope.cn/models/42ailab/olmOCR-2-7B-1025-GGUF
- Repositorio original de la conversión GGUF: https://www.modelscope.cn/models/lmstudio-community/olmOCR-2-7B-1025-GGUF
- Repositorio oficial de AI2 (olmocr): https://github.com/allenai/olmocr
- Sitio del empaquetador: https://42ailab.com
- Aplicación 42model: https://42model.com

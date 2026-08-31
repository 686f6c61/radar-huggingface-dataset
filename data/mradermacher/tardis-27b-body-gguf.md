# mradermacher/tardis-27b-body-GGUF

## Resumen

El repositorio `mradermacher/tardis-27b-body-GGUF` contiene una versión cuantizada en formato GGUF del modelo `CodeMasterCody3D/tardis-27b-body`, preparada por el equipo de mradermacher. Se trata de un modelo de lenguaje de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones), orientado al inglés, aunque no se dispone de información pública sobre su arquitectura, entrenamiento o capacidades específicas. La relevancia de esta publicación radica en que ofrece múltiples niveles de cuantización (desde Q2_K hasta Q8_0) que permiten ejecutar el modelo en hardware con recursos limitados, desde GPU de consumo hasta entornos de servidor, utilizando herramientas compatibles con GGUF como llama.cpp u Ollama.

Al ser una cuantización estática (sin imatrix), el autor indica que la calidad puede variar según el tipo elegido, recomendando Q4_K_M o Q6_K para un equilibrio entre fidelidad y uso de memoria. No se han publicado métricas de rendimiento ni benchmarks para este modelo, y la licencia no está especificada, lo que supone una limitación importante para su uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo base `tardis-27b-body` (por ejemplo, si se trata de un transformer denso, MoE o híbrido), ni sobre los datos de entrenamiento, el número de tokens procesados o las técnicas de alineación empleadas (RLHF, DPO, etc.). El repositorio de cuantización únicamente indica que se han generado archivos GGUF estáticos a partir de los pesos originales en formato Hugging Face, sin aplicar imatrix ni otras optimizaciones adicionales. Por tanto, cualquier detalle sobre arquitectura o entrenamiento queda fuera del alcance de la información disponible.

## Capacidades

- No se han documentado capacidades específicas del modelo en la información proporcionada.
- Al tratarse de un modelo de lenguaje de 27B parámetros, se espera que pueda realizar tareas estándar de generación de texto, razonamiento y posiblemente código, pero no hay confirmación oficial.
- No se menciona soporte para tool calling, agentes, visión, audio ni modos de pensamiento explícitos.
- El idioma declarado es únicamente inglés.

## Casos de uso

Dado que no se dispone de documentación sobre el modelo base, los casos de uso son hipotéticos y deben validarse con pruebas propias. No obstante, por su tamaño y formato, podría emplearse en:

- Inferencia local en equipos con GPU de consumo (por ejemplo, RTX 3090 o RTX 4090) utilizando cuantizaciones Q4_K_M o Q5_K_M, gracias a los archivos GGUF de entre 16 y 20 GB.
- Despliegue en CPU con llama.cpp o herramientas similares, usando cuantizaciones más agresivas como Q2_K o Q3_K_M, aunque con mayor pérdida de calidad.
- Prototipado rápido de aplicaciones conversacionales o de generación de texto en inglés, siempre que se acepte la falta de garantías sobre rendimiento y licencia.
- Experimentación académica para comparar el efecto de distintas cuantizaciones en la calidad de salida de un modelo de 27B.
- Integración en pipelines de inferencia basados en Ollama o LM Studio, que soportan GGUF de forma nativa.
- Evaluación de la viabilidad de ejecutar un modelo de este tamaño en entornos con restricciones de memoria, gracias a la variedad de niveles de cuantización ofrecidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo ni para su versión cuantizada. Tampoco se ofrecen comparativas con modelos similares.

## Requisitos de hardware

- Los tamaños de archivo GGUF varían entre 11,0 GB (Q2_K) y 29,1 GB (Q8_0). Para inferencia, se necesita VRAM suficiente para cargar el modelo completo, más un margen para el contexto y las activaciones.
- Con Q4_K_M (16,9 GB) cabe en GPUs de 24 GB como la RTX 3090, RTX 4090 o A5000.
- Con Q6_K (22,5 GB) se requiere una GPU de 24 GB o más, o bien usar CPU con suficiente RAM.
- Q8_0 (29,1 GB) necesita GPUs de 32 GB o más (por ejemplo, A100 40GB, H100) o ejecución en CPU con 64 GB de RAM.
- Las cuantizaciones más pequeñas (Q2_K, Q3_K_S) pueden ejecutarse en GPUs de 12-16 GB, aunque con degradación notable de calidad.
- Herramientas de despliegue compatibles: llama.cpp, Ollama, LM Studio, text-generation-webui (con backend de GGUF). vLLM no soporta GGUF directamente; requeriría conversión a safetensors.
- No se dispone de datos de latencia o throughput para este modelo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (27B, GGUF, inglés). No se puede establecer una comparativa fiable sin datos de rendimiento o especificaciones del modelo base.

## Limitaciones y advertencias

- La licencia no está especificada, lo que impide conocer si se permite uso comercial o modificación. Se debe contactar con el autor del modelo base antes de cualquier uso en producción.
- No hay documentación sobre sesgos, alucinaciones o limitaciones idiomáticas más allá del inglés.
- La cuantización estática (sin imatrix) puede provocar pérdidas de calidad, especialmente en los niveles más bajos (Q2_K, Q3_K_*).
- El modelo base no tiene model card pública, por lo que se desconoce su procedencia, datos de entrenamiento y posibles riesgos asociados.
- Al ser una publicación reciente con cero descargas y cero likes, no hay validación comunitaria sobre su funcionamiento.
- La fecha de creación (2026) es inusual, pero no afecta a la operatividad del repositorio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/tardis-27b-body-GGUF
- Modelo base (sin documentación): https://huggingface.co/CodeMasterCody3D/tardis-27b-body
- Perfil del cuantizador: https://huggingface.co/mradermacher
- Página de solicitudes de modelos: https://huggingface.co/mradermacher/model_requests

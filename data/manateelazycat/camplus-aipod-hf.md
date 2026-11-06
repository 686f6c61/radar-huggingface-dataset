# manateelazycat/CAMPlus-AIPod-HF

## Resumen

CAM++ para AI Pod es un artefacto de despliegue publicado por el usuario manateelazycat en Hugging Face, no un modelo de lenguaje generativo. Se trata del modelo ONNX CAM++ (reconocimiento de hablante/embedding de voz) empaquetado junto con un plan TensorRT FP32 derivado para la plataforma NVIDIA Jetson Thor, en el contexto de la migración a Thor R39.2.0 y JetPack 7.2. La model card deja claro que modelo y runtime son artefactos separados: el ONNX original se conserva sin cambios y el plan TensorRT se genera a partir de él con TensorRT 10.16.2 y TF32 deshabilitado.

El interés inmediato del artefacto es operativo más que algorítmico: documenta una decisión de precisión (FP32 frente a FP16) respaldada por pruebas de regresión. La release 0.1.1 rechaza el candidato FP16 anterior porque la regresión sobre vídeo completo pasó de 3 a 5 hablantes y dos embeddings no alcanzaron el umbral de similitud coseno >= 0.9999; FP32 restaura los 123 intervalos y los 3 hablantes. El repositorio ocupa 0,7 GB y se distribuye bajo licencia Apache 2.0.

No hay información pública sobre arquitectura interna, parámetros, contexto, idiomas ni benchmarks en la documentación proporcionada; la ficha refleja esa escasez de datos de forma explícita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo CAM++ de embedding de hablante, exportado a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | plan TensorRT FP32 (TF32 deshabilitado); candidato FP16 descartado en la release 0.1.1 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (modelo original) y plan TensorRT (artefacto derivado) |
| Plataforma objetivo | NVIDIA Jetson Thor, Thor R39.2.0 / JetPack 7.2 |
| Version de TensorRT | 10.16.2 |
| Tamano del repositorio | 0,7 GB |
| Pipeline de Hugging Face | no disponible |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo CAM++ (capas, dimensión de embedding, función de pérdida ni datos de entrenamiento). Lo único documentado es el proceso de conversión: el ONNX original se mantiene intacto y se genera un plan TensorRT FP32 específico para Thor con TensorRT 10.16.2, deshabilitando TF32 para evitar pérdida de precisión numérica. El autor no reclama ninguna exactitud más allá de las pruebas de regresión documentadas.

La innovación destacable en este artefacto es la disciplina de validación: la release 0.1.1 rechaza explícitamente el plan FP16 porque la regresión sobre vídeo completo alteró el número de hablantes detectados (de 3 a 5) y provocó dos fallos en el criterio de similitud coseno >= 0.9999. El plan FP32 restaura los 123 intervalos y los 3 hablantes, y el archivo de runtime 0.1.0 se reutiliza sin cambios, variando únicamente el plan de modelo seleccionado.

## Capacidades

- Extracción de embeddings de hablante (reconocimiento de hablante) mediante el modelo CAM++ en formato ONNX.
- Ejecución acelerada en NVIDIA Jetson Thor mediante plan TensorRT FP32.
- Integración en pipelines de diarización junto a otros artefactos del mismo autor (por ejemplo, Nemotron-3-Diarization-AIPod-HF).
- Validación reproducible mediante pruebas de regresión sobre vídeo completo (123 intervalos, 3 hablantes).
- No se documentan capacidades de generación de texto, razonamiento, código, visión, tool calling, agentes ni multilingüismo.

## Casos de uso

- Diarización de reuniones en dispositivos edge: el plan TensorRT FP32 permite ejecutar la extracción de embeddings de hablante en una Jetson Thor sin depender de GPU en la nube, manteniendo la precisión validada por regresión.
- Identificación de hablantes en transcripciones de vídeo: los embeddings generados permiten agrupar segmentos por hablante y alimentar un pipeline de diarización completo junto a modelos de VAD y ASR.
- Verificación de locutor en sistemas de control de acceso: la similitud coseno entre embeddings sirve como criterio de aceptación, con el umbral de 0.9999 documentado en las pruebas del autor.
- Despliegue en entornos con conectividad restringida: al ser un artefacto local para JetPack, encaja en instalaciones industriales o vehículos donde no se puede enviar audio a servicios externos.
- Reproducción de pipelines de audio en investigación: el par ONNX + plan TensorRT permite comparar el comportamiento numérico entre ejecución de referencia y ejecución acelerada.
- Base para auditoría de precisión: el historial de releases (rechazo de FP16, adopción de FP32) sirve como referencia metodológica para equipos que convierten modelos de audio a TensorRT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a `reports/performance-report.html` y `release-summary.json` para evidencia y limitaciones, pero no se incluyen cifras en el material proporcionado. Los únicos datos cuantitativos son los de regresión: 123 intervalos y 3 hablantes restaurados con FP32, frente a 5 hablantes y dos fallos de coseno >= 0.9999 con FP16.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendada: NVIDIA Jetson Thor (plataforma declarada y validada para la release).
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no disponible; el plan TensorRT está derivado específicamente para Thor.
- Opciones de despliegue: runtime propio del autor (archivo de runtime 0.1.0) sobre JetPack 7.2, con TensorRT 10.16.2; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de arquitectura, tamaño o rendimiento que permitan una comparación rigurosa con otros modelos de embedding de hablante. Los artefactos relacionados del mismo autor (Nemotron-3-Diarization-AIPod-HF y Nemotron-3.5-Bolt-E4B-AIPod-HF) pertenecen a otras categorías (diarización y generación de texto) y no son comparables directamente.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni responde a prompts; su función es producir embeddings de hablante.
- La validez del plan TensorRT está acotada a Thor R39.2.0 / JetPack 7.2 y TensorRT 10.16.2; otros entornos no están validados.
- El autor declara explícitamente que no reclama exactitud más allá de las pruebas de regresión documentadas.
- El plan FP16 fue descartado por pérdida de precisión medible; usar FP16 en producción reproduce los fallos documentados.
- Sin datos públicos sobre sesgos, idiomas, robustez ante ruido o condiciones acústicas adversas.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las dependencias del runtime y de TensorRT, que se rigen por sus propias licencias.
- Riesgo de alucinación: no aplicable en el sentido generativo, pero sí existe riesgo de falsos positivos en la asignación de hablantes fuera de las condiciones de regresión probadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/manateelazycat/CAMPlus-AIPod-HF
- Informe de rendimiento (Markdown): reports/performance-report.md (referenciado en la model card, no enlazado de forma directa en la información disponible)
- Informe de rendimiento (HTML): reports/performance-report.html (referenciado en la model card)
- Resumen de release: release-summary.json (referenciado en la model card)
- Artefacto relacionado del mismo autor: https://huggingface.co/manateelazycat/Nemotron-3-Diarization-AIPod-HF
- Artefacto relacionado del mismo autor: https://huggingface.co/manateelazycat/Nemotron-3.5-Bolt-E4B-AIPod-HF

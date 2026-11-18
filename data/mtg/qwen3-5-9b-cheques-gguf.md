# mtg/qwen3.5-9b-cheques-gguf

## Resumen

`mtg/qwen3.5-9b-cheques-gguf` es un modelo de lenguaje de 9.197.093.888 parámetros (aproximadamente 9,2 mil millones) derivado de la familia Qwen3.5 y publicado por el usuario `mtg` en Hugging Face. Se distribuye exclusivamente en formato GGUF, cuantizado y empaquetado para su uso con `llama.cpp`, e incluye un proyector multimodal (`mmproj`) que sugiere capacidades de visión-lenguaje, tal como indican las etiquetas del repositorio.

El nombre del repositorio incorpora el sufijo "cheques", lo que apunta a un ajuste fino (finetuning) orientado a un dominio concreto, presumiblemente relacionado con cheques o documentación financiera, aunque la model card no documenta el dataset de entrenamiento ni el procedimiento de ajuste. El autor declara que el ajuste fino y la conversión a GGUF se realizaron con Unsloth.

La relevancia de esta ficha es limitada por la escasez de información publicada: no hay datos de benchmarks, licencia, idiomas soportados ni detalles del entrenamiento. El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, y fue creado el 18 de noviembre de 2026. Se trata, por tanto, de una publicación reciente y sin validación comunitaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen3.5; se desconoce si es transformer denso o híbrido) |
| Parámetros totales | 9.197.093.888 (~9,2 B) |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M y F16 (proyector multimodal `mmproj`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (`Qwen3.5-9B.Q4_K_M.gguf`, `Qwen3.5-9B.F16-mmproj.gguf`) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Qwen3.5-9B ni sobre las modificaciones introducidas en el ajuste fino. La presencia del fichero `Qwen3.5-9B.F16-mmproj.gguf` indica una arquitectura multimodal con un proyector de visión en precisión F16, compatible con `llama-mtmd-cli`, lo que confirma que el modelo acepta entradas de imagen además de texto. El peso principal se distribuye en cuantización Q4_K_M, lo que reduce el tamaño del repositorio a 6,8 GB.

El autor indica que el ajuste fino y la conversión a GGUF se realizaron con Unsloth, herramienta que acelera el entrenamiento y la exportación de modelos. No se especifica el número de tokens de entrenamiento, la composición del dataset, la existencia de RLHF/DPO ni ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.). Tampoco se documenta qué datos específicos del dominio "cheques" se utilizaron.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- Procesamiento multimodal de imágenes: la presencia del proyector `mmproj` y las etiquetas `vision-language-model` indican soporte de entrada visual.
- Ejecución en `llama.cpp` mediante `llama-cli` (texto) y `llama-mtmd-cli` (multimodal).
- Compatibilidad con plantillas de chat mediante el flag `--jinja`.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible (idiomas no declarados).
- Modo "thinking" u otras capacidades especiales: no disponible.

## Casos de uso

- Procesamiento de documentos financieros: el ajuste fino orientado a "cheques" y la capacidad multimodal permiten extraer campos estructurados (importe, fecha, beneficiario, firma) a partir de imágenes de cheques escaneados, ejecutando el modelo localmente con `llama-mtmd-cli`.
- Automatización de back-office bancario: integración en pipelines de validación de cheques donde la inferencia debe permanecer on-premise por requisitos de confidencialidad, aprovechando el formato GGUF y su ejecución en CPU/GPU local.
- Asistente conversacional de dominio: despliegue con `llama-cli --jinja` para responder consultas sobre normativa o procedimientos de gestión de cheques, usando la plantilla de chat del modelo base Qwen3.5.
- Prototipado rápido en estaciones de trabajo: el tamaño de ~9,2 B en Q4_K_M (6,8 GB de repositorio) permite probar el modelo en un portátil con GPU de consumo sin infraestructura cloud.
- OCR asistido con razonamiento: combinar la entrada de imagen con generación de texto para transcribir y explicar el contenido de documentos financieros en una sola pasada.
- Evaluación comparativa de ajustes finos: servir como referencia para medir el efecto del ajuste fino de dominio frente al Qwen3.5-9B original en tareas de extracción de información.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6-7 GB para la cuantización Q4_K_M (tamaño del repositorio 6,8 GB, incluyendo el proyector F16); el peso F16 completo requeriría del orden de 18-19 GB, aunque no se distribuye en el repositorio.
- GPU recomendadas: no documentadas por el autor. Por tamaño, una RTX 4090 (24 GB) o una A100/H100 permiten ejecutar el modelo con holgura; una RTX 3060 de 12 GB debería bastar para Q4_K_M.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más de VRAM para Q4_K_M; también es viable en CPU con `llama.cpp`.
- Opciones de despliegue: `llama.cpp` (`llama-cli`, `llama-mtmd-cli`), y por extensión cualquier runtime compatible con GGUF (Ollama, LM Studio). Compatibilidad con vLLM o TGI: no disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mtg/qwen3.5-9b-cheques-gguf | ~9,2 B | no disponible | GGUF | no disponible | Ajuste fino de dominio con visión |
| Qwen3.5-9B (base) | ~9,2 B | no disponible | no disponible | no disponible | Modelo original sin ajuste de dominio |
| Alternativas de ~9 B con visión | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos alternativos de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada del rendimiento del ajuste fino ni de posibles regresiones respecto al modelo base.
- Licencia no declarada: no es posible determinar si se permite uso comercial; debe consultarse al autor antes de cualquier despliegue en producción.
- Idiomas no documentados: se desconoce si el ajuste fino conserva las capacidades multilingües del modelo base.
- Riesgo de alucinación: inherente a los modelos de ~9 B, especialmente crítico en un dominio financiero donde los errores en importes o fechas tienen consecuencias legales.
- Sesgos: no documentados; el dataset de ajuste fino ("cheques") no se describe, por lo que se desconocen posibles sesgos de dominio o geográficos.
- Validación comunitaria nula: 0 descargas y 0 "likes" en el momento de la consulta; no hay informes independientes de uso.
- Contexto desconocido: no se puede planificar su uso en conversaciones largas o documentos extensos sin confirmar la ventana de contexto.
- Fecha de creación futura (2026-11-18): conviene verificar la autenticidad y procedencia del repositorio antes de confiar en él.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mtg/qwen3.5-9b-cheques-gguf
- Unsloth (herramienta de ajuste fino y conversión): https://github.com/unslothai/unsloth
- `llama.cpp` (runtime GGUF): no enlazado en la model card, pero es el runtime implícito por las etiquetas y los comandos de ejemplo.

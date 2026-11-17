# khaleddiab/research-assistant-gemma4-12b-rewrite-GGUF

## Resumen

research-assistant-gemma4-12b-rewrite-GGUF es un modelo de lenguaje y visión derivado de Gemma 4 12B (arquitectura `gemma4_unified`), afinado por el usuario khaleddiab y convertido a formato GGUF mediante Unsloth. El modelo está pensado como asistente de investigación y reescritura de texto, con soporte multimodal a través de un proyector de visión separado (`F16-mmproj`). Cuenta con 11.907.350.576 parámetros totales según los pesos safetensors publicados.

La relevancia del modelo radica en su formato: al distribuirse en GGUF cuantizado (Q4_K_M) y con un proyector multimodal independiente, está preparado para ejecutarse en `llama.cpp` y en entornos de consumo sin necesidad de GPU de datacenter. El repositorio ocupa 7,5 GB, lo que confirma que la distribución principal es la variante cuantizada.

Se trata de un modelo recién publicado (noviembre de 2026) sin descargas ni valoraciones, sin model card detallada más allá de las instrucciones de uso, y sin información sobre licencia, idiomas o pipeline declarados en Hugging Face. Toda la información técnica disponible proviene de los metadatos del repositorio y de la propia model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `gemma4_unified` (transformer multimodal, familia Gemma 4) |
| Parámetros totales | 11.907.350.576 (11,9 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (archivo principal) y F16 para el proyector multimodal (mmproj) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (no declarada en Hugging Face) |
| Formato de pesos | GGUF (`gemma-4-12b-it.Q4_K_M.gguf`, `gemma-4-12b-it.F16-mmproj.gguf`) |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 12B en su variante instruct (`gemma-4-12b-it`, según el nombre de los archivos) y emplea la arquitectura `gemma4_unified`, que en la familia Gemma 4 integra capacidades de visión junto al decodificador de texto. La distribución separa el modelo de lenguaje cuantizado en Q4_K_M del proyector de visión en F16 (`mmproj`), un patrón habitual en `llama.cpp` para modelos multimodales.

El autor indica que el ajuste fino y la conversión a GGUF se realizaron con Unsloth, que según la model card permitió entrenar "2x más rápido". No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o preferencias. Tampoco se detalla ninguna innovación arquitectónica adicional más allá de lo heredado de Gemma 4.

## Capacidades

- Generación de texto y reescritura: el nombre del modelo (`rewrite`) sugiere un ajuste orientado a reescritura y asistencia a la investigación.
- Comprensión de imágenes: dispone de un proyector multimodal (`F16-mmproj.gguf`) utilizable con `llama-mtmd-cli`.
- Conversación multi-turno: etiquetado como `conversational` en Hugging Face.
- Compatibilidad con `llama.cpp`: soporta plantillas Jinja mediante el flag `--jinja`.
- Compatibilidad con endpoints: etiqueta `endpoints_compatible`, lo que indica que puede servirse a través de infraestructura compatible con la API de Hugging Face.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistente de reescritura académica: el ajuste específico sobre Gemma 4 12B orientado a `rewrite` permite reformular párrafos, resumir secciones y adaptar el registro de textos de investigación manteniendo el contenido técnico.
- Investigación con documentos escaneados: gracias al proyector de visión, el modelo puede recibir imágenes de páginas, figuras o tablas y extraer o describir su contenido en el flujo de trabajo del investigador.
- Despliegue local en estaciones de trabajo: al distribuirse en GGUF Q4_K_M (7,5 GB de repositorio), puede ejecutarse con `llama.cpp` en equipos sin GPU dedicada de gran capacidad, lo que facilita su uso en entornos con requisitos de privacidad.
- Servicio conversacional autoalojado: la etiqueta `endpoints_compatible` y el soporte de plantilla Jinja permiten exponerlo como endpoint conversacional en infraestructura propia.
- Procesamiento por lotes de reescritura: mediante `llama-cli` o scripts sobre `llama.cpp` se pueden reescribir grandes volúmenes de borradores o notas de investigación sin depender de APIs externas.
- Prototipado multimodal: el par de archivos (modelo + mmproj) permite experimentar con entrada de imagen y texto en pipelines de `llama.cpp` sin necesidad de convertir pesos manualmente.
- Integración en asistentes de documentación técnica: el modelo puede reescribir y clarificar documentación interna a partir de capturas o diagramas, combinando las capacidades de texto y visión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en Q4_K_M: aproximadamente 7-8 GB para el modelo de lenguaje, más un margen adicional para el proyector de visión y la caché KV.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, una GPU con 12-16 GB de VRAM (por ejemplo, RTX 4070 Ti Super, RTX 4080, RTX 4090) es un objetivo razonable para la variante Q4_K_M.
- GPU de consumo: sí, la cuantización Q4_K_M está pensada para caber en GPUs de consumo de gama alta; en GPUs con menos VRAM puede recurrirse a descarga parcial a CPU.
- Opciones de despliegue: `llama.cpp` (`llama-cli`, `llama-mtmd-cli`), y creación de modelo en Ollama mediante `Modelfile` a partir del modelo bf16 fusionado (Ollama no admite mmproj separado).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| research-assistant-gemma4-12b-rewrite-GGUF | 11,9 mil millones | no disponible | Sí (mmproj) | no disponible | GGUF |
| Gemma 4 12B IT (base) | ~12 mil millones | no disponible | Sí | no disponible | safetensors / GGUF |
| Alternativas de ~12B con visión | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado ni de información suficiente sobre alternativas equivalentes en la información proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica la licencia del modelo ni las condiciones de uso comercial, lo que impide confirmar su viabilidad en producción sin consultar al autor.
- Idiomas no declarados: no hay información sobre el soporte multilingüe; el ajuste fino podría haber reducido el rendimiento en idiomas distintos al del dataset de entrenamiento.
- Contexto desconocido: se desconoce la longitud máxima de contexto efectiva del modelo ajustado.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar contenido plausible pero incorrecto, especialmente en tareas de investigación donde la verificación factual es crítica.
- Sesgos: no se documentan sesgos conocidos ni procesos de mitigación.
- Modelo sin validación comunitaria: cero descargas y cero valoraciones en el momento de la consulta; no hay evidencia externa de calidad.
- Compatibilidad con Ollama limitada para visión: Ollama no soporta archivos mmproj separados, por lo que requiere crear un modelo unificado en bf16, con mayor consumo de recursos.
- Fecha de publicación futura en los metadatos (2026): conviene verificar la integridad y procedencia del repositorio antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/khaleddiab/research-assistant-gemma4-12b-rewrite-GGUF
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- llama.cpp (repositorio): https://github.com/ggml-org/llama.cpp

# mtg/qwen3.5-4b-cheques-gguf

## Resumen

El modelo `mtg/qwen3.5-4b-cheques-gguf` es un ajuste fino (fine-tuning) del modelo Qwen3.5-4B, publicado por el usuario mtg en Hugging Face y distribuido exclusivamente en formato GGUF para su uso con llama.cpp. Con 4.326.350.848 parámetros (aproximadamente 4,3 mil millones), se trata de un modelo de tamaño compacto orientado a despliegue en entornos con recursos limitados. El nombre "cheques" sugiere una especialización en el dominio financiero o bancario, aunque la model card no documenta explícitamente el dataset de entrenamiento ni la tarea concreta.

La relevancia de esta publicación radica en su pipeline de conversión: el autor indica que el ajuste fino y la conversión a GGUF se realizaron con Unsloth, una herramienta que acelera el entrenamiento y la exportación de modelos. El repositorio incluye tanto el modelo de lenguaje cuantizado en Q4_K_M como un proyector multimodal en F16 (`mmproj`), lo que indica que el modelo base Qwen3.5-4B incorpora capacidades de visión y que el ajuste conserva esa arquitectura visión-lenguaje.

No obstante, la información pública es muy escasa: no se especifican la licencia, los idiomas soportados, el pipeline ni los detalles del dataset de ajuste fino. Cualquier evaluación en producción debería contrastarse con el modelo base original de Qwen y con pruebas propias, dado que la model card se limita a describir el uso con llama.cpp y los ficheros disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5-4B; visión-lenguaje según tags del repo) |
| Parametros totales | 4.326.350.848 (aprox. 4,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector multimodal en F16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); ficheros `Qwen3.5-4B.Q4_K_M.gguf` y `Qwen3.5-4B.F16-mmproj.gguf` |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.5-4B, un transformer de aproximadamente 4,3 mil millones de parámetros. Los tags del repositorio (`vision-language-model`) y la presencia de un fichero `mmproj` en F16 confirman que la arquitectura incluye un proyector multimodal que permite procesar imágenes junto con texto, siguiendo el patrón habitual de los modelos visión-lenguaje de la familia Qwen.

El ajuste fino se realizó con Unsloth, según declara el autor, y posteriormente se convirtió a GGUF para su uso con llama.cpp. No se documentan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detalla qué modificación concreta introduce el sufijo "cheques" respecto al modelo base; por el nombre, cabe inferir una especialización en documentos financieros o bancarios, pero es una hipótesis no confirmada por la información disponible.

## Capacidades

- Generación de texto conversacional, según el tag `conversational` del repositorio.
- Procesamiento multimodal de imágenes y texto (visión-lenguaje), confirmado por el tag `vision-language-model` y el fichero `mmproj`.
- Ejecución local mediante llama.cpp, con soporte de plantillas de chat a través del flag `--jinja`.
- Uso con `llama-cli` para texto y `llama-mtmd-cli` para multimodal.
- Capacidades específicas de razonamiento, código, matemáticas o tool calling: no disponibles en la información proporcionada.
- Idiomas soportados: no disponible.

## Casos de uso

- Procesamiento local de documentos financieros: el ajuste "cheques" sugiere especialización en lectura de cheques o documentos bancarios; podría emplearse para extraer campos (importe, fecha, beneficiario) a partir de imágenes usando `llama-mtmd-cli` con el proyector multimodal.
- Asistente conversacional en el puesto de trabajo: al ser un modelo de 4,3 B cuantizado en Q4_K_M (3,5 GB de repositorio), puede ejecutarse en un portátil con GPU de consumo moderada para tareas de chat internas sin conexión a la nube.
- Prototipado rápido de aplicaciones visión-lenguaje: la disponibilidad de un `mmproj` en F16 permite experimentar con entrada de imágenes en pipelines de llama.cpp sin necesidad de infraestructura de servidor.
- Clasificación y extracción de información en entornos con requisitos de privacidad: al ejecutarse localmente, los datos no salen del dispositivo, lo que encaja en flujos con documentos sensibles.
- Integración en herramientas de escritorio o CLI: el formato GGUF y la compatibilidad con llama.cpp facilitan su empaquetado en aplicaciones de línea de comandos o utilidades ofimáticas.
- Evaluación comparativa de ajustes finos: sirve como caso de estudio de un pipeline Unsloth → GGUF para equipos que quieran replicar el flujo con sus propios datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3-4 GB con la cuantización Q4_K_M incluida en el repositorio; el proyector multimodal en F16 añade una cantidad adicional no especificada.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para margen de contexto y proyector; tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores son adecuadas. Para servidor, A100 o H100 no son necesarias por el tamaño del modelo.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060/4060 y superiores; también podría ejecutarse en CPU con llama.cpp, con latencia mayor.
- Opciones de despliegue: llama.cpp (`llama-cli` para texto, `llama-mtmd-cli` para multimodal). No se documenta compatibilidad con vLLM, TGI u Ollama, aunque la conversión desde GGUF a otros formatos es posible en algunos casos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mtg/qwen3.5-4b-cheques-gguf | 4,3 B | no disponible | no disponible | GGUF | Ajuste fino con visión, pipeline Unsloth |
| Qwen3.5-4B (base) | 4,3 B (aprox.) | no disponible en esta ficha | no disponible | safetensors/GGUF según distribución oficial | Modelo original sin ajuste "cheques" |
| Alternativas de ~4 B con visión | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

La comparación con el modelo base Qwen3.5-4B es la referencia más directa, pero no se dispone de sus especificaciones oficiales en la información proporcionada.

## Limitaciones y advertencias

- La model card no documenta el dataset de ajuste fino, por lo que se desconoce el alcance real de la especialización "cheques" y su posible sobreajuste.
- Riesgo de alucinación inherente a modelos de 4 B, especialmente en tareas de extracción de datos financieros donde un error tiene consecuencias.
- Licencia no especificada: no se puede confirmar el uso comercial sin consultar al autor o al modelo base.
- Idiomas soportados no disponibles; no se garantiza un rendimiento adecuado en castellano.
- Contexto máximo no documentado, lo que limita la planificación de aplicaciones con documentos largos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por parte de la comunidad.
- El autor no publica benchmarks ni evaluación cualitativa; cualquier uso en producción requiere validación propia.
- Al ser un GGUF derivado de un ajuste fino, la fidelidad respecto al modelo original no está garantizada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mtg/qwen3.5-4b-cheques-gguf
- Unsloth (herramienta de ajuste fino y conversión): https://github.com/unslothai/unsloth
- llama.cpp (runtime de inferencia): no disponible en la información proporcionada como enlace explícito, pero referenciado en la model card.

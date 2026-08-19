# moonhac/Gemma4-e4b-chlee-bat

## Resumen

El modelo `moonhac/Gemma4-e4b-chlee-bat` es un fine-tune de la familia Gemma 4 de Google DeepMind, convertido a formato GGUF mediante la herramienta Unsloth para su uso con llama.cpp y motores compatibles. El repositorio incluye un archivo de pesos cuantizado en Q4_K_M y un proyector multimodal en BF16 (`mmproj`), lo que indica que el modelo conserva capacidades de visión además de texto. El nombre sugiere que parte de un Gemma 4 E4B, aunque los pesos safetensors del repositorio suman 7.996.156.490 parámetros, una cifra que no coincide con los 4.4B del modelo E4B oficial; es posible que se trate de un error de etiquetado o de un fine-tune sobre una variante mayor. El repositorio no proporciona información sobre el dataset de fine-tuning, la licencia ni los idiomas soportados, por lo que su uso en producción requiere verificar estos aspectos con el autor.

La relevancia de este modelo reside en su formato GGUF, que permite desplegarlo en hardware local con llama.cpp, Ollama o motores similares, y en su naturaleza multimodal (texto e imagen). Sin embargo, al carecer de documentación sobre el proceso de entrenamiento y de resultados de evaluación, es difícil posicionarlo frente a los modelos Gemma 4 oficiales. Se recomienda tratarlo como un experimento de la comunidad y validar su comportamiento antes de adoptarlo en entornos críticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia Gemma 4, probablemente transformer multimodal) |
| Parametros totales | 7.996.156.490 (según safetensors del repositorio) |
| Parametros activos | no aplicable (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (archivo `gemma-4-e4b-it.Q4_K_M.gguf`), BF16 para el proyector multimodal (`gemma-4-e4b-it.BF16-mmproj.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp) y safetensors (para el proyector) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. Por la etiqueta `vision-language-model` y la presencia de un archivo `mmproj`, se deduce que sigue el esquema típico de Gemma 4 multimodal: un modelo de lenguaje base con un proyector de visión que alinea las características de imagen con el espacio de texto. El fine-tune se realizó con Unsloth, una librería que optimiza el entrenamiento y la conversión a GGUF, pero no se especifica el dataset utilizado, el número de tokens de entrenamiento, ni si se aplicaron técnicas como RLHF o DPO. Tampoco se indica si el modelo conserva el "Thinking Mode" que caracteriza a los Gemma 4 oficiales. Ante la ausencia de datos, cualquier afirmación sobre la arquitectura concreta (número de capas, atención, etc.) sería especulativa.

## Capacidades

- Generación de texto y razonamiento, heredadas del modelo base Gemma 4.
- Comprensión multimodal de imágenes (gracias al proyector `mmproj`), aunque no se especifica la resolución ni el tipo de imágenes soportadas.
- Conversación multi-turno, según la etiqueta `conversational`.
- Integración con llama.cpp mediante `llama-cli` y `llama-mtmd-cli` para texto y multimodal respectivamente.
- No se confirma soporte de tool calling, function calling o agentes en este fine-tune concreto.
- No se indica soporte de "Thinking Mode" ni de otras capacidades especiales del Gemma 4 original.

## Casos de uso

- Asistente local multimodal en equipos de sobremesa: al estar en GGUF Q4_K_M, puede ejecutarse en una GPU con 8 GB de VRAM o incluso en CPU con llama.cpp, permitiendo conversaciones con imágenes sin depender de servicios en la nube.
- Prototipado rápido de aplicaciones de visión-lenguaje: desarrolladores pueden probar el modelo con `llama-mtmd-cli` para validar si el fine-tune mejora el comportamiento del Gemma 4 base en tareas específicas antes de invertir en un despliegue mayor.
- Educación e investigación: útil para estudiar el efecto de fine-tunes comunitarios sobre modelos abiertos, comparando su rendimiento con el Gemma 4 oficial.
- Generación de descripciones de imágenes en entornos sin conexión: el proyector multimodal permite alimentar al modelo con capturas de pantalla o fotos y obtener texto descriptivo, útil en herramientas de accesibilidad o documentación automática.
- Experimentación con cuantización GGUF: al incluir un archivo Q4_K_M, sirve como ejemplo práctico de cómo Unsloth genera pesos compatibles con llama.cpp y Ollama.
- Integración en pipelines de automatización doméstica o de oficina: por su tamaño moderado y formato GGUF, puede desplegarse en un servidor local para tareas de resumen, extracción de información o clasificación de imágenes, siempre que se valide su calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se comparan los resultados con los del Gemma 4 E4B oficial. Cualquier cifra de rendimiento sería inventada.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M de un modelo de ~8B parámetros ocupa aproximadamente 5 GB, por lo que cabría en GPUs con 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 2070). El proyector BF16 añade unos cientos de MB adicionales.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 o superiores para mayor holgura. En el sitio gemma4.dev se menciona que el Gemma 4 E4B oficial corre en 8 GB VRAM, pero esto no garantiza que este fine-tune tenga el mismo comportamiento.
- En CPU: con llama.cpp puede ejecutarse, aunque la velocidad será lenta (del orden de 2-5 tokens/s en un procesador moderno de 8 núcleos).
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`), Ollama (siguiendo las instrucciones del README para crear un modelo unificado con el mmproj), y servidores compatibles con GGUF como llama-server.
- Latencia y throughput estimados: no disponibles. Dependerán del hardware y de la longitud de la secuencia. En una RTX 4090 se podría esperar entre 40 y 80 tokens/s con Q4_K_M, pero es una estimación genérica sin verificación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| moonhac/Gemma4-e4b-chlee-bat | 7.996M (según safetensors) | no disponible | Sí (mmproj) | no disponible | GGUF |
| Gemma 4 E4B oficial (Google) | 4.4B | no disponible | Sí | Gemma Terms of Use | safetensors, GGUF |
| Gemma 3 4B (generación anterior) | 4B | 128K | Sí | Gemma Terms of Use | safetensors, GGUF |
| Llama 3.2 3B (alternativa texto) | 3.2B | 128K | No | Llama 3.2 Community License | safetensors, GGUF |

La comparativa se basa en datos públicos de los modelos oficiales. El fine-tune de moonhac no ofrece información suficiente para establecer una comparación rigurosa de rendimiento. Se observa una discrepancia entre el nombre del repositorio (e4b) y el número de parámetros reales, lo que sugiere que podría ser un fine-tune de un modelo distinto o que el etiquetado es incorrecto.

## Limitaciones y advertencias

- No se dispone de información sobre la licencia: el uso comercial, la redistribución o la modificación del modelo podrían estar restringidos. Es imprescindible contactar con el autor antes de cualquier despliegue productivo.
- El dataset de fine-tuning es desconocido, por lo que el modelo puede presentar sesgos no documentados o comportamientos impredecibles en dominios específicos.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en tareas de razonamiento o factualidad.
- La discrepancia entre el nombre del modelo (e4b) y los parámetros reales (7.996M) indica una posible mala documentación; no se puede asumir que las capacidades del Gemma 4 E4B oficial se mantengan.
- El soporte multimodal depende del archivo `mmproj` separado; Ollama no lo gestiona automáticamente y requiere un proceso manual según el README.
- No se especifica la longitud de contexto soportada; usar el modelo con secuencias largas podría degradar el rendimiento o fallar.
- Al ser un repositorio con 0 descargas y 0 likes, no hay validación comunitaria del funcionamiento real del modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/moonhac/Gemma4-e4b-chlee-bat
- Unsloth (herramienta de fine-tuning y conversión): https://github.com/unslothai/unsloth
- Página oficial de Gemma 4 de Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Ficha de Gemma 4 E4B en gemma4.dev: https://gemma4.dev/models/gemma-4-e4b
- Model card oficial de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
- Página de Gemma 4 en Ollama: https://ollama.com/library/gemma4:latest

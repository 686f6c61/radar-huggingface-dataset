# pranil00/ONIX-granite-20b-code-instruct-GGUF

## Resumen

ONIX-granite-20b-code-instruct-GGUF es una cuantización en formato GGUF del modelo ibm-granite/granite-20b-code-instruct de IBM, publicada por el usuario pranil00 bajo la etiqueta "ONIX Community". No se trata de un modelo entrenado desde cero, sino de un artefacto derivado: una conversión a Q3_K_M (3,5 bits por peso) del modelo original de IBM, orientada a ejecución en hardware de consumo mediante llama.cpp, Ollama o el runner propio del autor (run-any-model).

El modelo base es un transformer denso de 24.160 millones de parámetros especializado en código e instrucciones, con una ventana de contexto de 8.192 tokens (según el sufijo "8k" del identificador del modelo base). La cuantización reduce el peso de 47,25 GB en FP16 a 10,34 GB, lo que permite ejecutarlo en equipos con 12-14 GB de memoria unificada o VRAM, un umbral que cubre portátiles Apple Silicon de gama alta y GPUs de consumo como la RTX 4090.

La relevancia de esta ficha es doble: por un lado, documenta un artefacto de cuantización de un modelo de código de IBM que no tiene una versión GGUF oficial ampliamente difundida; por otro, sirve de ejemplo de las prácticas de la comunidad de cuantización (telemetría de "DeviceQuant", afirmaciones de retención de calidad del 91% sin metodología publicada) que conviene leer con cautela. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no incluye datos de benchmarks propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia del modelo base granite-20b-code-instruct) |
| Parametros totales | 24.159.830.016 (24,16 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens (modelo base); 4.096 tokens en configuración CPU recomendada |
| Tipos de cuantizacion | Q3_K_M (3,5 bits por peso); el repositorio solo publica este tipo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `ibm-granite--granite-20b-code-instruct-Q3_K_M.gguf`, 10,34 GB) |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base de IBM, un transformer denso de 24,16 mil millones de parámetros. Esta ficha no dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo original, por lo que esos datos deben consultarse en la model card de ibm-granite/granite-20b-code-instruct. El sufijo "code-instruct" indica un ajuste orientado a instrucciones y generación de código.

La aportación de este repositorio es exclusivamente la cuantización: conversión a Q3_K_M con 52 de 52 capas aceleradas y un KV cache de 1.248 MB. El autor declara una "retención de fidelidad cognitiva" del ~91% y una ratio de compresión de 4,57x, pero no publica la metodología de esa medición ni los benchmarks que la respaldan, por lo que debe considerarse una estimación no verificada. No se documentan innovaciones arquitectónicas propias (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de código en múltiples lenguajes de programación, heredada del ajuste "code-instruct" del modelo base de IBM.
- Seguimiento de instrucciones técnicas y explicación de código.
- Generación de texto general y respuestas a preguntas técnicas.
- Razonamiento multi-paso sobre problemas de programación (capacidad del modelo base, no verificada específicamente en esta cuantización).
- Ejecución local en CPU, GPU NVIDIA y Apple Silicon mediante llama.cpp, Ollama, LM Studio, Jan o Text-Generation-WebUI.
- Compatibilidad con el runner run-any-model del autor para sesiones de chat en terminal.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo "thinking" en la información disponible.

## Casos de uso

- Asistencia de código en local sin conexión: el modelo puede autocompletar y explicar fragmentos de código en un portátil con 12-14 GB de memoria, útil en entornos con requisitos de confidencialidad donde no se permite enviar código a APIs externas.
- Revisión de código en pipelines de pre-commit: integrado vía llama.cpp como servicio local, puede generar sugerencias sobre diffs antes de un commit, aunque la latencia en CPU con contexto de 4.096 tokens limita su uso a revisiones pequeñas.
- Enseñanza de programación: un asistente local que explica errores de compilación y propone correcciones, desplegable en aulas con hardware modesto gracias a los 10,34 GB del archivo GGUF.
- Prototipado de herramientas de desarrollo: sirve como backend de pruebas para plugins de IDE o CLIs que necesiten un modelo de código sin coste por token, usando Ollama con el Modelfile incluido en la model card.
- Generación de scripts de automatización: tareas de scripting (bash, Python) en estaciones de trabajo con GPU de consumo, donde el modelo cabe en VRAM junto al resto del entorno.
- Evaluación comparativa de cuantizaciones: como artefacto Q3_K_M de referencia para medir la degradación de calidad frente al modelo FP16 en tareas de código, siempre que se realice una evaluación propia dado que el autor no publica benchmarks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una tabla de telemetría ("DeviceQuant Telemetry Audit Report") con métricas de memoria y compresión (tamaño de pesos, KV cache, capas aceleradas) y una estimación de retención de calidad del 91%, pero no contiene resultados de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación de capacidad.

## Requisitos de hardware

- VRAM/RAM estimada: 11,84 GB de VRAM dedicada en GPU NVIDIA; 11,67 GB de memoria unificada en Apple Silicon; 13,67 GB de RAM libre en CPU.
- GPU recomendadas: RTX 30/40/50 series con al menos 12 GB de VRAM (RTX 3060 12 GB, RTX 4070 Ti, RTX 4090); en el segmento profesional, A100 o H100 pueden ejecutarlo con holgura, aunque el modelo no aprovecha su ancho de banda.
- Cabe en GPU de consumo: sí, en modelos con 12 GB o más de VRAM; en GPUs de 8 GB requeriría descarga parcial a RAM y reduciría el rendimiento.
- Apple Silicon: M1/M2/M3/M4/M5 con al menos 16 GB de memoria unificada, con aceleración Metal nativa según el autor.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (mediante Modelfile), LM Studio, Jan, Text-Generation-WebUI y el runner run-any-model.
- Contexto recomendado: 8.192 tokens en GPU y Apple Silicon; 4.096 tokens en CPU.
- Latencia y throughput: no disponibles. El autor no publica tokens por segundo ni latencias medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-granite-20b-code-instruct-GGUF (esta ficha) | 24,16 B | 8.192 | GGUF Q3_K_M (10,34 GB) | Apache 2.0 | Hugging Face, 0 descargas |
| ibm-granite/granite-20b-code-instruct (base) | 24,16 B | 8.192 | safetensors (FP16, ~47 GB) | Apache 2.0 | Hugging Face, oficial de IBM |
| Qwen2.5-Coder-32B-Instruct | 32 B | 32.768 (nativo) | safetensors y GGUF comunitarios | Apache 2.0 | Hugging Face, amplia adopción |
| DeepSeek-Coder-V2-Lite-Instruct | 16 B totales (2,4 B activos, MoE) | 128.000 | safetensors y GGUF comunitarios | Licencia propia de DeepSeek | Hugging Face |

La comparación con Qwen2.5-Coder y DeepSeek-Coder-V2 se ofrece como referencia de categoría (modelos de código open source ejecutables en hardware de consumo); no se dispone de benchmarks que permitan comparar su rendimiento real frente a esta cuantización concreta.

## Limitaciones y advertencias

- La cuantización Q3_K_M es agresiva (3,5 bits por peso); la degradación en tareas de código puede ser mayor que la estimación del 91% declarada por el autor, que carece de metodología publicada.
- El repositorio tiene 0 descargas y 0 likes, sin historial de uso ni validación por parte de la comunidad; no es un artefacto oficial de IBM.
- No se documentan los idiomas soportados; el modelo base está orientado principalmente al inglés, por lo que el rendimiento en castellano es incierto.
- Riesgo de alucinación inherente a los modelos de código: puede generar APIs inexistentes, imports inválidos o código que compila pero es incorrecto; requiere validación en producción.
- El contexto efectivo se reduce a 4.096 tokens en despliegue sobre CPU, lo que limita tareas sobre repositorios grandes.
- La model card incluye una cláusula de exención de responsabilidad total ("AS IS", sin garantías) que traslada toda la responsabilidad de validación al usuario final.
- La licencia Apache 2.0 permite uso comercial, pero se aplica al artefacto de cuantización; conviene verificar los términos del modelo base de IBM antes de redistribuir.
- El autor mezcla referencias a "Apache 2.0 / MIT" en el texto de licencia, lo que introduce ambigüedad; el metadato del repositorio indica Apache 2.0.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-granite-20b-code-instruct-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-20b-code-instruct
- Organización ONIX en Hugging Face: https://huggingface.co/ONIX
- Runner run-any-model: https://github.com/PranilShah-08/run-any-model

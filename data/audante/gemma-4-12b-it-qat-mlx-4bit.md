# Audante/gemma-4-12B-it-qat-MLX-4bit

## Resumen

`Audante/gemma-4-12B-it-qat-MLX-4bit` es una redistribución sin modificaciones del modelo `mlx-community/gemma-4-12B-it-qat-4bit`, que a su vez es una conversión a formato MLX del modelo oficial `google/gemma-4-12B-it` de Google. Se trata, por tanto, de una cuantización de 4 bits con cuantización consciente del entrenamiento (QAT) del modelo instructivo Gemma 4 de 12B parámetros, empaquetada para su ejecución eficiente en hardware Apple Silicon mediante el framework MLX.

El modelo resuelve un problema muy concreto: permitir la inferencia local de un modelo de ~12B parámetros en equipos Mac con memoria unificada, reduciendo el peso de los pesos de aproximadamente 24 GB en precisión nativa a unos 11 GB en 4 bits, sin requerir GPU dedicada. Al estar basado en el checkpoint instructivo oficial, conserva las capacidades de instrucción, razonamiento y generación de código del modelo original.

La relevancia de esta ficha es doble: por un lado, documenta una opción práctica de despliegue local en macOS; por otro, advierte de que se trata de una copia de terceros no oficial, con solo 49 descargas y sin validación independiente publicada, por lo que debe tratarse con cautela en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, tag `gemma4_unified`); detalles internos no disponibles |
| Parametros totales | 11.959.730.224 (~12B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit QAT (cuantizacion consciente del entrenamiento), formato MLX |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), repositorio de 11,0 GB |

## Arquitectura y entrenamiento

El modelo subyacente es `google/gemma-4-12B-it`, un transformer de la familia Gemma 4 en su variante instructiva, con 11.959.730.224 parámetros. La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens, ni si se aplicaron fases de RLHF o DPO; la model card del repositorio redistribuido no incluye esos datos y se limita a declarar la procedencia y la licencia.

La innovación técnica relevante en este artefacto es la cuantización QAT a 4 bits realizada por Google y la posterior conversión a MLX por parte de `mlx-community`. La cuantización consciente del entrenamiento implica que el modelo fue expuesto a la cuantización durante el ajuste, lo que en general reduce la degradación de calidad respecto a una cuantización post-entrenamiento equivalente. La conversión a MLX adapta los tensores y el grafo de operaciones para aprovechar el backend Metal y la memoria unificada de los chips Apple. El repositorio de Audante no introduce cambios: los ficheros son idénticos al origen, según declara el propio autor.

## Capacidades

- Generación de texto e instrucciones en formato conversacional (variante `-it`).
- Razonamiento y resolución de problemas de varios pasos, heredado del modelo base.
- Generación de código y tareas de programación, presumiblemente comparable al modelo original; sin benchmarks publicados en esta ficha.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Modo thinking o razonamiento extendido: no disponible en la información proporcionada.
- Visión o audio: no disponible en la información proporcionada.

## Casos de uso

- **Asistente de código local en Mac**: con ~11 GB de pesos en 4 bits, el modelo cabe en un MacBook Pro con 16-24 GB de memoria unificada, permitiendo autocompletado, explicación y refactorización de código sin enviar el código a servicios externos.
- **Prototipado de chatbots en macOS**: integrable con `mlx-lm` para levantar un servidor local compatible con la API de OpenAI y probar flujos conversacionales multi-turno antes de migrar a infraestructura de producción.
- **Procesamiento de documentos confidenciales en local**: al ejecutarse sin conexión, es adecuado para resumir, clasificar o extraer información de textos sensibles en entornos con requisitos de privacidad estrictos.
- **Evaluación comparativa de cuantizaciones**: útil como referencia para medir la pérdida de calidad de la cuantización 4-bit QAT frente al modelo en bf16 en tareas concretas del equipo.
- **Generación de texto asistida en herramientas de escritorio**: integrable en aplicaciones nativas de macOS mediante MLX, por ejemplo para redacción de correos, resúmenes o reescritura de párrafos.
- **Investigación sobre despliegue en Apple Silicon**: sirve como base para estudiar throughput, latencia y consumo de memoria de modelos de ~12B en chips M-series bajo distintas configuraciones de cuantización.
- **Generación de tests y documentación**: uso en pipelines locales de CI para producir borradores de tests unitarios o docstrings a partir de fragmentos de código, con revisión humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM/memoria estimada**: ~11 GB para los pesos en 4 bits, más overhead de KV cache y activaciones; se recomienda un mínimo de 16 GB de memoria unificada y 24 GB para contextos largos.
- **GPU recomendadas**: hardware Apple Silicon (M1 Pro/Max, M2 Pro/Max/Ultra, M3 Pro/Max, M4 Pro/Max). No está pensado para GPU NVIDIA o AMD; para esas plataformas conviene usar el checkpoint GGUF o safetensors equivalente.
- **¿Cabe en consumer GPU?**: en el ecosistema Apple, sí, en equipos con 16 GB o más de memoria unificada. En GPU de consumo NVIDIA no aplica directamente por el formato MLX.
- **Opciones de despliegue**: `mlx-lm` (librería de referencia para MLX), `mlx_lm.server` para servir una API compatible con OpenAI, y aplicaciones que consumen MLX como LM Studio en su backend MLX. No es compatible con vLLM, llama.cpp, Ollama ni TGI en este formato.
- **Latencia y throughput**: no disponibles en la información proporcionada; dependen del chip, del contexto y de la configuración de decodificación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / plataforma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Audante/gemma-4-12B-it-qat-MLX-4bit | ~12B | No disponible | MLX 4-bit (Apple Silicon) | Apache 2.0 | 49 descargas, copia de terceros |
| mlx-community/gemma-4-12B-it-qat-4bit | ~12B | No disponible | MLX 4-bit (Apple Silicon) | Apache 2.0 | Fuente original de la conversión |
| google/gemma-4-12B-it | ~12B | No disponible | safetensors (bf16/fp16) | Apache 2.0 | Checkpoint oficial de Google |

La comparación se limita a variantes del mismo modelo base porque la información disponible no incluye datos de rendimiento ni especificaciones de contexto que permitan contrastar con familias alternativas de forma rigurosa.

## Limitaciones y advertencias

- **Copia no oficial**: el propio autor declara que no es un release oficial; los ficheros son idénticos a `mlx-community/gemma-4-12B-it-qat-4bit`, por lo que no aporta ninguna mejora ni verificación adicional.
- **Sin benchmarks ni validación independiente**: no hay métricas publicadas que confirmen la calidad de esta cuantización concreta frente al modelo original.
- **Sesgos**: no documentados en la información disponible; cabe esperar los sesgos del corpus de entrenamiento del modelo base, no auditados aquí.
- **Riesgo de alucinación**: inherente a los modelos generativos de esta escala; no hay evaluaciones específicas publicadas para esta variante.
- **Idiomas**: no se especifica la cobertura lingüística; no debe asumirse un rendimiento óptimo en castellano sin evaluarlo.
- **Licencia**: Apache 2.0 según la model card, lo que en principio permite uso comercial; conviene verificar el fichero `LICENSE` incluido y las condiciones del modelo base de Google antes de desplegar.
- **Restricción de plataforma**: el formato MLX solo es utilizable en hardware Apple Silicon; no es portable a CUDA ni a CPU genérica sin reconversión.
- **Madurez**: 49 descargas y 0 likes indican un artefacto reciente y poco contrastado; para producción es preferible referenciar directamente el repositorio de `mlx-community` o el checkpoint oficial de Google.
- **Metadatos incompletos**: pipeline, idiomas y contexto no están declarados, lo que complica la integración automática en pipelines que dependan de esos campos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Audante/gemma-4-12B-it-qat-MLX-4bit
- Fuente de la conversión MLX: https://huggingface.co/mlx-community/gemma-4-12B-it-qat-4bit
- Modelo base oficial: https://huggingface.co/google/gemma-4-12B-it
- Librería MLX-LM: https://github.com/ml-explore/mlx-lm
- Framework MLX: https://github.com/ml-explore/mlx

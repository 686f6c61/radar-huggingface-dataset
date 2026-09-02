# abenzerps/Apodex-1.1-mini-MLX

## Resumen

Apodex-1.1-mini-MLX es una conversión al formato MLX del modelo Apodex-1.1-mini, desarrollado por Apodex AI y convertido por el usuario abenzerps. Se trata de un modelo de lenguaje de tipo Mixture of Experts (MoE) basado en la arquitectura Qwen3.5, orientado a tareas de investigación, análisis de datos, procesamiento de archivos, generación de código y trabajo con herramientas. Esta versión MLX está optimizada para ejecutarse en hardware Apple Silicon mediante la librería `mlx-lm`, ofreciendo una cuantización affine de 4 bits con grupo de tamaño 64, lo que reduce el peso del modelo a 19,5 GB.

El modelo original, Apodex-1.1-mini, se describe como un sistema de 35,95 mil millones de parámetros, aunque la conversión MLX contiene 5.419.330.688 parámetros según los archivos safetensors. Esta discrepancia sugiere que el modelo es un MoE con un número reducido de parámetros activos por token, aunque no se ha especificado oficialmente el desglose. La conversión conserva las capacidades principales de razonamiento y generación de texto, pero excluye la entrada de imágenes y el módulo MTP nativo. La licencia es Apache-2.0, lo que permite uso comercial y modificación.

La relevancia de este lanzamiento radica en su disponibilidad para equipos Apple con memoria unificada suficiente, permitiendo ejecutar localmente un modelo con capacidades avanzadas de agente y razonamiento sin necesidad de GPUs dedicadas. Es una opción interesante para desarrolladores que trabajan en entornos macOS y necesitan un modelo de código abierto con soporte para tool calling y modos de pensamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en Qwen3.5 |
| Parametros totales | 5.419.330.688 (según safetensors de la conversión MLX) |
| Parametros activos | no disponible (modelo MoE; el modelo original se describe como 35,95B totales) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Affine 4-bit (grupo 64) para pesos elegibles; router y shared-expert gate en 8-bit |
| Idiomas soportados | Inglés (en), Chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Apodex-1.1-mini emplea una arquitectura MoE derivada de Qwen3.5, con un router que selecciona expertos por token y un shared-expert gate. La conversión MLX mantiene esta estructura, pero aplica cuantización affine de 4 bits con grupo de tamaño 64 a la mayoría de los pesos, mientras que el router y el shared-expert gate se conservan en 8 bits para preservar la precisión en la selección de expertos. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens procesados ni las técnicas de alineación (RLHF, DPO, etc.) en la información disponible.

La versión MLX excluye la entrada de imágenes y el módulo MTP (Multi-Token Prediction) nativo, centrándose únicamente en texto. El modelo soporta un modo de pensamiento ("thinking") que se puede desactivar mediante el parámetro `--chat-template-config '{"enable_thinking": false}'` durante la generación.

## Capacidades

- Generación de texto y razonamiento complejo en inglés y chino.
- Soporte de tool calling y function calling, orientado a trabajo con herramientas y agentes.
- Capacidad para tareas de investigación, análisis de datos, procesamiento de archivos y generación de código.
- Modo de pensamiento opcional (thinking mode) para tareas que requieren razonamiento multi-paso.
- Integración con `mlx-lm` para generación eficiente en Apple Silicon.
- No incluye capacidades de visión (entrada de imágenes) en esta conversión.

## Casos de uso

- Asistentes de investigación automatizada: el modelo puede procesar documentos, extraer información y razonar sobre múltiples fuentes, aprovechando su capacidad de tool calling para consultar APIs o bases de datos.
- Generación de código en entornos de desarrollo: soporta function calling, lo que permite integrarlo en pipelines de CI/CD para generar, revisar o documentar código.
- Análisis de datos financieros: según los benchmarks reportados por Apodex AI, el modelo obtiene una puntuación de 50,2 en FrontierFinance, lo que sugiere utilidad en tareas de análisis de mercados o informes financieros.
- Automatización de agentes conversacionales: puede gestionar diálogos multi-turno con contexto largo (aunque la longitud exacta no está publicada), útil para atención al cliente o asistentes virtuales.
- Investigación científica: con 51,7 en FrontierScience-Research, puede ayudar en la revisión de literatura, formulación de hipótesis o resumen de papers.
- Procesamiento de archivos y extracción de datos: su entrenamiento para "data, files, code" lo hace adecuado para tareas de transformación de formatos, extracción de entidades o limpieza de datos.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks específicos para la conversión MLX. El README incluye referencias a evaluaciones del modelo original Apodex-1.1-mini realizadas por Apodex AI con su harness FrontierAgent, con los siguientes resultados:

| Benchmark | Puntuación |
|---|---|
| APEX-Agent | 27,7 |
| FrontierFinance | 50,2 |
| FrontierScience-Research | 51,7 |

Estas cifras corresponden al modelo original sin cuantizar y no son directamente comparables con la versión MLX cuantizada. No se dispone de resultados estándar como MMLU, HumanEval o GSM8K en la información proporcionada.

## Requisitos de hardware

- Peso del modelo cuantizado: 19,5 GB en formato MLX (affine 4-bit, grupo 64).
- Memoria unificada recomendada: se necesitan al menos 19,5 GB para los pesos, más memoria adicional para el runtime y la caché KV, especialmente con contextos largos. Para uso fluido se recomienda un Mac con al menos 32 GB de RAM unificada.
- GPUs compatibles: exclusivo para Apple Silicon (M1, M2, M3, M4 y superiores) mediante `mlx-lm`. No es compatible con GPUs NVIDIA o AMD.
- Opciones de despliegue: `mlx-lm` (CLI y Python), compatible con el ecosistema MLX. No se menciona soporte para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no se han publicado datos específicos para esta conversión.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos de la misma categoría. El modelo se basa en Qwen3.5 MoE, pero no se han publicado comparaciones directas con alternativas como Qwen3-30B-A3B o DeepSeek-MoE. La falta de benchmarks estándar impide una evaluación objetiva frente a otros modelos de tamaños similares.

## Limitaciones y advertencias

- La conversión MLX excluye la entrada de imágenes y el módulo MTP nativo, limitando su uso a tareas de texto puro.
- Los sesgos y riesgos de alucinación no han sido documentados públicamente; se recomienda validar las salidas en aplicaciones críticas.
- La longitud de contexto no está especificada, lo que dificulta estimar su capacidad para tareas que requieren ventanas muy largas.
- Aunque la licencia Apache-2.0 permite uso comercial, el modelo original se describe como orientado a investigación; se debe revisar la documentación del modelo base para confirmar restricciones adicionales.
- La cuantización de 4 bits puede degradar ligeramente la calidad de las respuestas en comparación con el modelo original en precisión completa.
- El modelo solo está disponible en formato MLX, lo que limita su despliegue a hardware Apple Silicon.

## Enlaces

- [Modelo MLX en HuggingFace](https://huggingface.co/abenzerps/Apodex-1.1-mini-MLX)
- [Modelo original Apodex-1.1-mini](https://huggingface.co/apodex/Apodex-1.1-mini)
- [Paper en arXiv](https://arxiv.org/abs/2608.23283)
- [Sitio web de Apodex](https://www.apodex.com/)
- [Página del modelo en LLM Explorer](https://llm-explorer.com/model/abenzerps%2FApodex-1.1-mini-MLX,11i7zubCSItGxvyFfngde8)

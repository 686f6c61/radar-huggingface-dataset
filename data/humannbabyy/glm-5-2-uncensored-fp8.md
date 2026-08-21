# humannbabyy/GLM-5.2-Uncensored-FP8

## Resumen

GLM-5.2 es el último modelo insignia de Z.AI, diseñado para tareas de horizonte largo (long-horizon tasks) con una ventana de contexto sólida de 1 millón de tokens. Esta versión concreta, `humannbabyy/GLM-5.2-Uncensored-FP8`, es una adaptación no censurada (uncensored) del modelo base, creada mediante técnicas de abliteration que eliminan los mecanismos de rechazo del modelo original. El resultado es un modelo que responde sin restricciones de contenido, manteniendo las capacidades técnicas del GLM-5.2.

El modelo base presenta una arquitectura de mezcla de expertos (MoE) con atención dispersa mejorada mediante el mecanismo IndexShare, que reduce los FLOPs por token en 2,9× a 1M de contexto. También incorpora una capa MTP (Multi-Token Prediction) optimizada para decodificación especulativa, aumentando la longitud de aceptación hasta un 20%. La versión FP8 reduce el peso del modelo para facilitar su despliegue, aunque el repositorio ocupa 595,4 GB, lo que indica que sigue siendo un modelo de gran tamaño.

La relevancia de esta versión uncensored radica en su uso para aplicaciones que requieren libertad de expresión sin filtros, como escritura creativa, roleplay o investigación de comportamientos de modelos. Sin embargo, hay que tener en cuenta que la abliteration puede afectar al rendimiento en tareas de razonamiento y seguridad, y que los benchmarks publicados corresponden al modelo base, no a esta adaptación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con atención dispersa (IndexShare) y decodificación especulativa (MTP) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (modelo MoE, no se especifica el número de expertos activos) |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | FP8 (según el nombre del modelo) |
| Idiomas soportados | Inglés (en), Chino (zh) |
| Licencia | MIT |
| Formato de pesos | no disponible (probablemente safetensors, pero no se especifica en la información) |

## Arquitectura y entrenamiento

El GLM-5.2 base emplea una arquitectura de mezcla de expertos (MoE) con atención dispersa. La innovación principal es el mecanismo IndexShare (arxiv:2603.12201), que reutiliza el mismo indexador en cada cuatro capas de atención dispersa, reduciendo los FLOPs por token en 2,9× a una longitud de contexto de 1M. Además, la capa MTP (Multi-Token Prediction) se ha mejorado para la decodificación especulativa, logrando un aumento de hasta el 20% en la longitud de aceptación.

Los detalles del entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada. El informe técnico del modelo base está disponible en arxiv:2602.15763. En cuanto a la versión uncensored, el autor (humannbabyy) ha aplicado técnicas de abliteration sobre el modelo FP8, un método que identifica y elimina las direcciones de activación responsables del comportamiento de rechazo. No se han publicado detalles sobre el proceso de abliteration ni sobre posibles ajustes posteriores.

## Capacidades

- Generación de texto y razonamiento complejo: el modelo base destaca en tareas de razonamiento matemático y científico, con puntuaciones altas en AIME 2026 (99,2) y GPQA-Diamond (91,2).
- Codificación avanzada: soporta múltiples niveles de esfuerzo de pensamiento (thinking effort) para equilibrar rendimiento y latencia, y obtiene buenos resultados en SWE-bench Pro (62,1) y Terminal Bench 2.1 (81,0).
- Capacidades de agente y tool calling: el modelo base muestra un rendimiento sólido en MCP-Atlas (76,8) y Tool-Decathlon (48,2), lo que indica soporte para integración con herramientas y ejecución de tareas multi-paso.
- Contexto largo: ventana de 1M de tokens que permite procesar documentos extensos, repositorios completos o conversaciones muy largas de forma estable.
- Multilingüe: soporta inglés y chino, aunque no se especifican otros idiomas.
- Sin censura: la versión uncensored elimina los mecanismos de rechazo, permitiendo generar contenido que el modelo base bloquearía (por ejemplo, temas sensibles, violencia, lenguaje explícito, etc.).

## Casos de uso

- Escritura creativa sin restricciones: la versión uncensored permite generar narrativa adulta, ficción oscura o diálogos explícitos sin que el modelo se niegue. Su contexto de 1M tokens es útil para mantener coherencia en novelas largas o series de capítulos.
- Roleplay y simulación de personajes: gracias a la eliminación de filtros, se puede usar para juegos de rol con temáticas maduras o controvertidas, manteniendo la personalidad del personaje durante largas sesiones gracias a la ventana de contexto amplia.
- Análisis de código y refactorización de repositorios completos: con 1M de contexto, el modelo puede procesar un repositorio entero y sugerir cambios, detectar bugs o generar documentación. Los benchmarks de NL2Repo (48,9) y SWE-bench Pro (62,1) avalan esta capacidad.
- Automatización de tareas de terminal y operaciones: el modelo base obtiene 81,0 en Terminal Bench 2.1, por lo que puede ejecutar comandos, gestionar archivos y realizar tareas de administración de sistemas en entornos controlados.
- Investigación en seguridad y alineación de modelos: la versión uncensored es útil para estudiar cómo se comportan los modelos sin mecanismos de rechazo, analizar sesgos subyacentes o evaluar la eficacia de técnicas de abliteration.
- Generación de contenido multilingüe: al soportar inglés y chino, puede utilizarse para traducción, redacción de artículos o creación de contenido en ambos idiomas, aunque no se especifica su nivel de fluidez en otros idiomas.

## Benchmarks y rendimiento

Los resultados publicados corresponden al modelo base GLM-5.2, no a la versión uncensored. La abliteration puede alterar el rendimiento, por lo que estos datos deben tomarse como referencia orientativa.

| Benchmark | GLM-5.2 | GLM-5.1 | Qwen3.7-Max | DeepSeek-V4-Pro | Claude Opus 4.8 | GPT-5.5 | Gemini 3.1 Pro |
|---|---|---|---|---|---|---|---|
| HLE | 40,5 | 31 | 41,4 | 37,7 | 49,8* | 41,4* | 45 |
| HLE (w/ Tools) | 54,7 | 52,3 | 53,5 | 48,2 | 57,9* | 52,2* | 51,4* |
| AIME 2026 | 99,2 | 95,3 | 97 | 94,6 | 95,7 | 98,3 | 98,2 |
| GPQA-Diamond | 91,2 | 86,2 | 90 | 90,1 | 93,6 | 93,6 | 94,3 |
| SWE-bench Pro | 62,1 | 58,4 | 60,6 | 55,4 | 69,2 | 58,6 | 54,2 |
| Terminal Bench 2.1 (Terminus-2) | 81,0 | 63,5 | 75 | 64 | 85 | 84 | 74 |
| MCP-Atlas (Public Set) | 76,8 | 71,8 | 76,4 | 73,6 | 77,8 | 75,3 | 69,2 |

Nota: los resultados marcados con * provienen del conjunto completo de HLE; el resto son del subconjunto de solo texto. No se han publicado benchmarks específicos para la versión uncensored.

## Requisitos de hardware

- El repositorio ocupa 595,4 GB en FP8, lo que indica que el modelo necesita un clúster de GPUs de alta gama para inferencia.
- Estimación de VRAM: con pesos FP8, se necesitan aproximadamente 595 GB de memoria para cargar el modelo completo. Esto equivale a 8 GPUs de 80 GB (por ejemplo, 8× H100 o 8× A100 80GB) o 10 GPUs de 64 GB.
- No cabe en GPUs de consumo (RTX 4090, 3090, etc.) de forma individual; se requeriría un sistema multi-GPU o el uso de técnicas de offloading a CPU, aunque con una penalización severa de rendimiento.
- Frameworks de despliegue compatibles según la documentación del modelo base: SGLang (v0.5.13.post1+), vLLM (v0.23.0+), Transformers (v0.5.12+), KTransformers (v0.5.12+), Unsloth (v0.1.47-beta+). También soporta despliegue en plataformas Ascend NPU mediante vLLM-Ascend, xLLM y SGLang.
- La latencia y el throughput dependen en gran medida del hardware y de la configuración de decodificación especulativa. No se han publicado cifras concretas para esta versión.

## Comparativa con modelos similares

La siguiente comparativa se basa en el modelo base GLM-5.2, ya que no hay datos específicos de la versión uncensored. Se comparan modelos de la misma categoría (modelos de razonamiento y codificación de gran escala).

| Modelo | Contexto | Licencia | Peso (aprox.) | SWE-bench Pro | AIME 2026 |
|---|---|---|---|---|---|
| GLM-5.2 (base) | 1M | MIT | no disponible | 62,1 | 99,2 |
| GLM-5.1 | no disponible | no disponible | no disponible | 58,4 | 95,3 |
| Qwen3.7-Max | no disponible | no disponible | no disponible | 60,6 | 97 |
| DeepSeek-V4-Pro | no disponible | no disponible | no disponible | 55,4 | 94,6 |
| Claude Opus 4.8 | no disponible | propietaria | no disponible | 69,2 | 95,7 |
| GPT-5.5 | no disponible | propietaria | no disponible | 58,6 | 98,3 |

La versión uncensored se diferencia de estas alternativas por su ausencia de filtros de contenido, lo que la hace única en el ecosistema, pero también implica riesgos de uso indebido. No se dispone de datos de rendimiento específicos para la versión uncensored.

## Limitaciones y advertencias

- La versión uncensored elimina los mecanismos de rechazo, lo que puede llevar a generar contenido dañino, ilegal o éticamente cuestionable. El uso en producción debe evaluarse cuidadosamente y con salvaguardas adicionales.
- La abliteration puede degradar el rendimiento en tareas de razonamiento, codificación o seguimiento de instrucciones, aunque no se han publicado mediciones comparativas.
- El modelo base está entrenado principalmente en inglés y chino; su rendimiento en otros idiomas puede ser limitado.
- Aunque la licencia es MIT (permite uso comercial), el hecho de que sea una versión modificada de un modelo con derechos de autor puede plantear cuestiones legales sobre la redistribución y el uso comercial. Se recomienda revisar los términos del modelo base.
- El tamaño del modelo (595 GB en FP8) hace que su despliegue sea costoso y requiera infraestructura especializada, no apta para entornos de desarrollo típicos.
- No se han publicado evaluaciones de sesgos, alucinaciones o robustez para esta versión. El modelo base puede alucinar en contextos largos o con información ambigua, y la versión uncensored podría ser más propensa a generar afirmaciones falsas al no tener restricciones de veracidad.
- La ventana de 1M de tokens es una capacidad teórica; en la práctica, el rendimiento puede degradarse con contextos muy largos y el coste computacional es elevado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/humannbabyy/GLM-5.2-Uncensored-FP8
- Repositorio oficial del modelo base: https://github.com/zai-org/GLM-5
- Informe técnico del modelo base: https://arxiv.org/abs/2602.15763
- Paper de IndexShare: https://arxiv.org/abs/2603.12201
- Blog de GLM-5.2: https://z.ai/blog/glm-5.2
- Documentación de la API de Z.ai: https://docs.z.ai/guides/llm/glm-5.2
- Versión uncensored alternativa (jelegend/GLM-5.2-FP8-Uncensored): https://huggingface.co/jelegend/GLM-5.2-FP8-Uncensored
- Versión uncensored de zandenAI: https://huggingface.co/zandenAI/GLM-5.2-FP8-Uncensored/tree/main

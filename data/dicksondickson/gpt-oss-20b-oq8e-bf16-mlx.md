# dicksondickson/gpt-oss-20b-oQ8e-bf16-MLX

## Resumen

Este repositorio contiene una cuantización del modelo open source `openai/gpt-oss-20b` de OpenAI, publicada por el usuario dicksondickson. No se trata de un modelo entrenado desde cero, sino de una conversión de los pesos originales a un formato mixto de precisión (mayoritariamente 8 bits con tensores críticos en bf16) compatible con MLX, el framework de Apple para ejecutar modelos en silicio de la serie M. El objetivo es permitir la inferencia local del modelo de 20.000 millones de parámetros en equipos Mac con memoria unificada, reduciendo el peso del repositorio respecto a los pesos en bf16 completos.

El modelo base, gpt-oss-20b, es un transformer denso (no MoE según los datos disponibles en este repositorio) de aproximadamente 20.914.757.184 parámetros, publicado por OpenAI bajo licencia MIT. Esta versión cuantizada emplea la herramienta oQ de oMLX (versión 0.7.3.dev2) con cuantización de precisión mixta e imatrix, dejando los tensores más sensibles en bf16 para preservar la calidad. La model card indica que está pensada para chips Apple M3 y posteriores.

La relevancia de esta ficha radica en que documenta una vía práctica para desplegar un modelo de 20B en hardware de consumo Apple sin GPU dedicada, algo relevante para desarrolladores que trabajan en local con macOS. No obstante, conviene señalar que la información publicada por el autor es muy escasa: no hay benchmarks, ni detalles de entrenamiento, ni especificaciones de contexto o idiomas en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (según modelo base gpt-oss-20b; detalles no disponibles) |
| Parametros totales | 20.914.757.184 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantización mixta oQe de 8 bits con tensores críticos en bf16 (imatrix, Better Low-Bit oQ) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

Este repositorio no entrena ningún modelo: es una cuantización del checkpoint `openai/gpt-oss-20b`. Por tanto, la arquitectura subyacente corresponde a la del modelo base de OpenAI, si bien la model card de esta conversión no detalla si se trata de un transformer denso, MoE o híbrido, ni aporta información sobre el número de tokens de entrenamiento, la composición del dataset o si hubo fases de RLHF o DPO. Toda esa información debe consultarse en la ficha del modelo original.

La innovación técnica de esta versión es el proceso de cuantización: se ha utilizado oQ de oMLX 0.7.3.dev2 con cuantización de precisión mixta guiada por imatrix y la variante Better Low-Bit oQ. Los tensores considerados importantes se mantienen en bf16, mientras que el resto se comprime a 8 bits, lo que reduce el tamaño del repositorio a 66,7 GB. El autor indica que esta configuración está orientada a chips Apple M3 y posteriores, y que la versión se re-cuantizó el 24 de octubre de 2026 con una mejora de la cuantización oQe.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base gpt-oss-20b; no se detallan en esta model card.
- Código y matemáticas: no se especifican capacidades concretas en la información disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la model card no declara idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Inferencia local en Apple Silicon mediante MLX: capacidad confirmada por el formato y la librería declarada.

## Casos de uso

- Prototipado local en macOS: un desarrollador puede cargar el modelo con oMLX en un Mac con chip M3 o superior y probar prompts de razonamiento o generación de texto sin depender de APIs externas ni de una GPU NVIDIA.
- Evaluación comparativa de cuantizaciones: al ser una conversión mixta 8 bits/bf16, sirve para medir la pérdida de calidad frente a los pesos originales en tareas concretas del equipo.
- Desarrollo de asistentes offline: integrable en aplicaciones de escritorio para macOS que requieran generación de texto sin conexión, siempre que el contexto y los idiomas del modelo base cubran la necesidad.
- Investigación sobre cuantización: útil para estudiar el efecto de imatrix y de la precisión mixta en modelos de 20B dentro del ecosistema MLX.
- Pruebas de pipelines de agentes en local: permite validar flujos multi-paso en un entorno de desarrollo antes de migrar a infraestructura con GPU, sujeto a confirmar las capacidades de tool calling del modelo base.
- Docencia y experimentación: adecuado para cursos o talleres sobre despliegue de LLM en hardware de consumo Apple, dado su formato MLX y su licencia MIT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el repositorio ocupa 66,7 GB, por lo que se requiere memoria unificada suficiente para cargar los pesos más el contexto y el estado de inferencia.
- GPU recomendadas: Apple Silicon M3 o posterior, según indica el autor; no se mencionan GPU NVIDIA ni AMD.
- ¿Cabe en GPU de consumo? Está diseñado para Mac con memoria unificada; no se indica compatibilidad con GPU de consumo tipo RTX 4090.
- Opciones de despliegue: oMLX (https://github.com/jundot/omlx); no se documentan vLLM, llama.cpp, Ollama ni TGI para este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| dicksondickson/gpt-oss-20b-oQ8e-bf16-MLX | 20.914.757.184 | no disponible | MIT | safetensors MLX | Cuantización mixta 8 bits/bf16 para Apple Silicon |
| openai/gpt-oss-20b | 20.914.757.184 (según este repo) | no disponible | MIT | safetensors | Modelo base original de OpenAI |
| Otras cuantizaciones de gpt-oss-20b | no disponible | no disponible | MIT (heredada) | GGUF, MLX, etc. | No se dispone de datos verificados en la información proporcionada |

## Limitaciones y advertencias

- La model card no documenta sesgos, idiomas ni evaluación de alucinación; deben asumirse los del modelo base.
- La cuantización mixta a 8 bits puede introducir degradación de calidad frente a los pesos originales en tareas sensibles, aunque no se aportan métricas que lo cuantifiquen.
- El autor advierte que los tensores en bf16 están pensados para Apple M3 y posteriores; en chips anteriores el comportamiento no está garantizado.
- El repositorio se re-cuantizó el 24 de octubre de 2026; versiones descargadas antes de esa fecha pueden diferir y conviene volver a descargar.
- Licencia MIT heredada del modelo base: permite uso comercial, pero debe verificarse la ficha de `openai/gpt-oss-20b` para condiciones adicionales de uso responsable.
- No hay información sobre longitud de contexto efectiva tras la cuantización ni sobre rendimiento en producción.
- El autor es un particular, no OpenAI; no hay garantías de mantenimiento ni soporte.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dicksondickson/gpt-oss-20b-oQ8e-bf16-MLX
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Herramienta de cuantización oMLX: https://github.com/jundot/omlx

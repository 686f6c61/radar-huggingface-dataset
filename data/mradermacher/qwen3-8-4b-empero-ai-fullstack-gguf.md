# mradermacher/Qwen3.8-4B-Empero-AI-FullStack-GGUF

## Resumen

El modelo `mradermacher/Qwen3.8-4B-Empero-AI-FullStack-GGUF` es una cuantización GGUF del modelo base `iBotIA/Qwen3.8-4B-Empero-AI-FullStack`, realizado por el cuantizador mradermacher. El modelo subyacente es una destilación de la familia Qwen3.8 (model_type `qwen3_5`) desarrollada por el laboratorio Empero, especializada en desarrollo full-stack. Según los metadatos, el modelo está orientado a lenguajes y frameworks concretos: TypeScript, React Router v8, NestJS y Flutter, además de incluir capacidades de razonamiento.

Con 4.326.350.848 parámetros (aproximadamente 4,3 mil millones), este modelo se presenta en formato GGUF con múltiples niveles de cuantización, desde Q2_K (2,1 GB) hasta f16 (8,8 GB), lo que permite su ejecución en hardware de consumo. La licencia es Apache 2.0, y el modelo está entrenado exclusivamente en inglés. La destilación y el uso de Unsloth (indicado en los tags) sugieren un enfoque de eficiencia y especialización en tareas de programación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5 (model_type: qwen3_5) |
| Parametros totales | 4.326.350.848 (4,3 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base original está disponible en safetensors) |

## Arquitectura y entrenamiento

El modelo es una destilación del modelo Qwen3.8, realizada por el laboratorio Empero, con el objetivo de crear una versión compacta de 4 mil millones de parámetros especializada en desarrollo full-stack. Los metadatos indican que se ha utilizado Unsloth como herramienta de entrenamiento, lo que apunta a técnicas de fine-tuning eficientes. El modelo base se llama `iBotIA/Qwen3.8-4B-Empero-AI-FullStack` y el tipo de arquitectura declarado es `qwen3_5`, aunque no se detallan más características internas (número de capas, dimensiones de atención, etc.). No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto especializada en desarrollo full-stack: TypeScript, React Router v8, NestJS y Flutter.
- Razonamiento (tag `reasoning`), lo que sugiere capacidad para resolver problemas de lógica y depuración de código.
- Destilación de conocimientos desde un modelo mayor (Qwen3.8), lo que puede mejorar la eficiencia en tareas específicas.
- Soporte de conversación y generación de texto (pipeline `text-generation`).
- Capacidades multilingües: no disponibles; el modelo está entrenado únicamente en inglés.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte para agentes y razonamiento multi-paso: no disponible explícitamente, aunque el tag `reasoning` sugiere cierta capacidad de razonamiento.

## Casos de uso

- Asistente de programación TypeScript: el modelo puede generar, revisar y refactorizar código TypeScript, aprovechando su especialización en este lenguaje. Resulta adecuado para entornos de desarrollo con TypeScript como lenguaje principal.
- Desarrollo de backend con NestJS: gracias a su entrenamiento específico en NestJS, el modelo puede crear módulos, controladores, servicios y configuraciones típicas de este framework, acelerando el desarrollo de APIs.
- Desarrollo frontend con React Router v8: el modelo conoce la API de React Router v8, por lo que puede generar rutas, enlaces y componentes de navegación, así como resolver problemas comunes de enrutamiento en aplicaciones React.
- Desarrollo móvil con Flutter: el modelo puede generar código Dart, widgets y estructuras de proyectos Flutter, siendo útil para equipos que desarrollan aplicaciones multiplataforma.
- Generación de código full-stack en pipelines de CI/CD: el modelo puede integrarse en flujos automatizados para generar código inicial, realizar revisiones de código o completar tareas de scaffolding, gracias a su conocimiento de múltiples capas de una aplicación.
- Chatbot técnico para documentación de proyectos: puede responder preguntas sobre arquitecturas full-stack, explicar patrones de diseño o generar documentación técnica en inglés, aprovechando su capacidad de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni otras pruebas estándar. Cualquier comparación numérica con otros modelos requeriría una evaluación independiente.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización (tamaño del archivo GGUF):
  - Q2_K: ~2,1 GB
  - Q3_K_S: ~2,2 GB
  - Q3_K_M: ~2,4 GB
  - Q3_K_L: ~2,6 GB
  - IQ4_XS: ~2,7 GB
  - Q4_K_S: ~2,7 GB
  - Q4_K_M: ~2,9 GB
  - Q5_K_S: ~3,2 GB
  - Q5_K_M: ~3,3 GB
  - Q6_K: ~3,7 GB
  - Q8_0: ~4,7 GB
  - f16: ~8,8 GB
- GPU recomendadas: el modelo puede ejecutarse en GPUs de consumo. Para Q4_K_M o inferior, una GPU con 4 GB de VRAM es suficiente. Para Q8_0, se recomienda una GPU con al menos 6 GB (por ejemplo, RTX 3060 12GB). Para f16, se recomienda una GPU con 12 GB o más (RTX 4070 Ti, RTX 4090).
- Opciones de despliegue: el formato GGUF es compatible con llama.cpp, Ollama y LM Studio. También puede utilizarse con TGI si se convierte a safetensors, aunque el repositorio actual solo contiene GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-4B-Empero-AI-FullStack (GGUF) | 4,3 mil millones | no disponible | Apache 2.0 | Hugging Face (GGUF) |
| Qwen2.5-3B | 3,1 mil millones | 32K | Apache 2.0 | Hugging Face, Ollama |
| Llama 3.2-3B | 3,2 mil millones | 128K | Llama 3.2 Community License | Hugging Face, Ollama |
| Phi-3.5-mini | 3,8 mil millones | 128K | MIT | Hugging Face, Ollama |

No se dispone de datos de benchmarks comparativos entre estos modelos. La principal diferencia es la especialización del modelo Empero en full-stack, mientras que los otros son modelos generalistas. El modelo Empero tiene licencia Apache 2.0, lo que facilita su uso comercial.

## Limitaciones y advertencias

- El modelo está entrenado únicamente en inglés, por lo que su rendimiento en otros idiomas será muy limitado.
- No se han publicado resultados de benchmarks ni evaluaciones de seguridad, por lo que su calidad real en tareas generales es desconocida.
- Al ser una destilación, puede heredar sesgos o errores del modelo profesor (Qwen3.8), y su capacidad de razonamiento puede ser inferior a la del modelo original.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar código o texto incorrecto o inventado, especialmente en contextos poco cubiertos por el entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos de la licencia del modelo base original y del laboratorio Empero.
- No se proporciona información sobre el contexto máximo de entrada; es necesario probar el modelo para determinar su ventana de contexto efectiva.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-4B-Empero-AI-FullStack-GGUF
- Modelo base (safetensors): https://huggingface.co/iBotIA/Qwen3.8-4B-Empero-AI-FullStack
- Laboratorio Empero: https://empero.org/
- Modelo destilado de Empero: https://huggingface.co/empero-ai/Qwen3.8-4B-Distill

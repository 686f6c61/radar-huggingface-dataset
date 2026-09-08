# bunnycore/MiniCPM5-2B-Code

## Resumen

MiniCPM5-2B-Code es una conversión a formato GGUF del modelo MiniCPM5-2B, publicada por el usuario bunnycore. El modelo original, desarrollado por OpenBMB, es un Transformer denso de 2.52B de parámetros diseñado para ejecutarse en dispositivos locales como teléfonos, portátiles y hardware sin GPU de datacenter. Esta versión concreta ha sido ajustada con el dataset guell00/qwen-3.8-code, lo que la orienta a tareas de generación de código, tool calling y agentes.

La relevancia de este modelo radica en su tamaño compacto y su ventana de contexto de 131.072 tokens, que permite procesar documentación extensa o repositorios completos sin necesidad de infraestructura costosa. Según los resultados de búsqueda, el modelo base promedia 53.9 puntos en 34 benchmarks, destacando en tool use, coding agents y recuperación de contexto largo. Sin embargo, no se han publicado benchmarks específicos para este fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso |
| Parametros totales | 2.516.756.480 (2.52B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | Q8_0 (archivo MiniCPM5-2B.Q8_0.gguf) |
| Idiomas soportados | No disponible |
| Licencia | No disponible en el repositorio; el modelo base openbmb/MiniCPM5-2B-Base se publica bajo Apache-2.0 |
| Formato de pesos | GGUF (convertido con Unsloth) |

## Arquitectura y entrenamiento

El modelo base MiniCPM5-2B es un Transformer denso de 2.52B parámetros, con 1.98B de parámetros fuera de las capas de embedding. Fue entrenado por OpenBMB siguiendo la misma receta de entrenamiento que MiniCPM5-1B, escalada a 2B. La ventana de contexto es de 131.072 tokens, lo que lo hace apto para tareas de recuperación de contexto largo. No se dispone de información sobre el proceso de entrenamiento específico (datos, número de tokens, si hubo RLHF o DPO) para esta versión.

Esta variante "Code" es un fine-tuning del modelo base sobre el dataset guell00/qwen-3.8-code, según los tags del repositorio. La conversión a GGUF se realizó con Unsloth, y el único archivo disponible es MiniCPM5-2B.Q8_0.gguf. No hay documentación adicional sobre el proceso de ajuste.

## Capacidades

- Generación de texto y razonamiento general, aunque su ventaja competitiva está en tareas de código y agentes.
- Soporte de tool calling y function calling, lo que permite integrarlo en flujos de trabajo automatizados.
- Capacidad para tareas de agentes y razonamiento multi-paso.
- Recuperación de contexto largo estilo NoLiMa, gracias a su ventana de 131.072 tokens.
- Ejecución en dispositivos locales (teléfonos, portátiles) sin necesidad de GPU de datacenter.
- Especialización en código, al haber sido fine-tuneado con un dataset de código.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistente de programación local: el modelo puede ejecutarse en un portátil sin GPU dedicada mediante llama.cpp u Ollama, ofreciendo sugerencias de código en tiempo real en entornos como VS Code.
- Agentes autónomos con tool calling: gracias a su soporte de function calling, puede integrarse en pipelines de automatización que requieran llamar a APIs, ejecutar scripts o consultar bases de datos.
- Recuperación de contexto largo en repositorios: con 131.072 tokens de ventana, puede analizar repositorios completos o documentación técnica extensa para responder preguntas sobre el código.
- Automatización de CI/CD: puede generar tests unitarios, revisar código o escribir documentación técnica en pipelines de integración continua.
- Aplicaciones móviles o edge: su tamaño compacto permite desplegarlo en smartphones o dispositivos embebidos, ofreciendo asistente de código offline.
- Traducción de código entre lenguajes: el fine-tuning en código puede facilitar la conversión de lógica de un lenguaje de programación a otro, manteniendo el contexto del proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para la versión bunnycore/MiniCPM5-2B-Code. El modelo base MiniCPM5-2B promedia 53.9 puntos en 34 benchmarks según MarkTechPost, pero no se dispone de un desglose detallado en la información proporcionada. Se recomienda evaluar este fine-tuning de forma independiente antes de usarlo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q8_0 tiene un tamaño de ~2.5 GB, por lo que se recomienda al menos 4 GB de VRAM en GPU para una ejecución cómoda. En CPU, se requieren aproximadamente 3-4 GB de RAM.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM (RTX 3060, RTX 4060, A100, H100). No se requieren GPUs de datacenter.
- Sí cabe en consumer GPU: sí, en GPUs de gama media como RTX 3060 12GB o inferiores.
- Opciones de despliegue: llama.cpp (llama-cli con --jinja), Ollama, vLLM, TGI y Unsloth. La model card indica el uso de llama-cli.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MiniCPM5-2B-Code (bunnycore) | 2.52B | 131.072 | No disponible en el repo | GGUF (Q8_0) |
| MiniCPM5-2B-Base (openbmb) | 2.52B | 131.072 | Apache-2.0 | Safetensors, GGUF |
| MiniCPM5-1B (openbmb) | No disponible | No disponible | Apache-2.0 | No disponible |

Nota: no se dispone de datos de rendimiento comparativos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos: no disponible en la información proporcionada.
- Riesgo de alucinación: no evaluado específicamente; al ser un modelo pequeño, el riesgo de alucinaciones puede ser mayor que en modelos de mayor tamaño.
- Limitaciones de contexto o idioma: la ventana de contexto es de 131.072 tokens, pero no se especifican los idiomas soportados. El fine-tuning de código puede reducir su rendimiento en tareas no relacionadas.
- Restricciones de licencia: el repositorio de bunnycore no especifica licencia. El modelo base es Apache-2.0, lo que permite uso comercial, pero hay que verificar la licencia de esta conversión antes de usarla en producción.
- El dataset de entrenamiento (guell00/qwen-3.8-code) no está documentado, lo que puede afectar a la calidad y fiabilidad del modelo.
- No se han publicado benchmarks para esta versión, por lo que su rendimiento real es incierto.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es una contribución sin validación de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bunnycore/MiniCPM5-2B-Code
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B-Base
- GitHub de OpenBMB/MiniCPM: https://github.com/openbmb/minicpm
- Artículo de AI/TLDR: https://ai-tldr.dev/releases/openbmb-minicpm5-2b/
- Artículo de MarkTechPost: https://www.marktechpost.com/2026/09/07/openbmb-releases-minicpm5-2b-a-2-52b-dense-model-averaging-53-9-across-34-benchmarks-and-built-to-run-on-device/

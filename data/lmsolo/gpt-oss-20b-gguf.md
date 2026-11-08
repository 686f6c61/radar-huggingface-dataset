# lmsolo/gpt-oss-20b-GGUF

## Resumen

`lmsolo/gpt-oss-20b-GGUF` es una reproducción no oficial en formato GGUF del modelo `gpt-oss-20b` publicado por OpenAI dentro de su familia de pesos abiertos gpt-oss. Se trata de un transformer con arquitectura Mixture of Experts (MoE) de 20.914.757.184 parámetros totales, de los cuales aproximadamente 3.6 mil millones están activos por token, pensado para inferencia de baja latencia en hardware local o especializado. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones de copyleft.

El modelo original está diseñado para razonamiento, tareas agénticas y uso general por parte de desarrolladores, con un formato de respuesta propietario llamado harmony que debe aplicarse obligatoriamente para que el modelo funcione correctamente. Incluye esfuerzo de razonamiento configurable (low, medium, high), acceso completo a la cadena de pensamiento y capacidades nativas de function calling, navegación web y ejecución de código Python.

Este repositorio concreto es un espejo GGUF creado por el usuario `lmsolo`, con 0 descargas y 0 likes en el momento de la consulta, y un tamaño de repositorio de 179 GB. La model card incluida es la del modelo original de OpenAI, no una documentación específica de esta conversión, por lo que los detalles de cuantización concretos de este repo no están disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture of Experts (MoE) |
| Parametros totales | 20.914.757.184 |
| Parametros activos | ~3.6 mil millones por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (cuantización de pesos MoE aplicada en post-entrenamiento); este repo es GGUF, variantes concretas no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo); safetensors en el modelo original |

## Arquitectura y entrenamiento

El modelo es un transformer con capas de mezcla de expertos (MoE). El modelo original fue post-entrenado con cuantización MXFP4 de los pesos MoE, lo que permite que `gpt-oss-20b` se ejecute dentro de 16 GB de memoria. Las evaluaciones publicadas por OpenAI se realizaron con esa misma cuantización MXFP4. El modelo fue entrenado sobre el formato de respuesta harmony de OpenAI y solo debe usarse con dicho formato; de lo contrario, el comportamiento es incorrecto.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO. Sí se documenta que el modelo es ajustable por parámetros (fine-tunable) y que expone la cadena de pensamiento completa, lo que facilita depuración y auditoría. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento con esfuerzo configurable (low, medium, high).
- Cadena de pensamiento completa accesible (no pensada para mostrarse al usuario final).
- Function calling nativo y soporte de agentes.
- Navegación web integrada según la documentación del modelo original.
- Ejecución de código Python.
- Salidas estructuradas (Structured Outputs).
- Ajuste fino por parámetros.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistentes de razonamiento local: al ejecutarse en menos de 16 GB con MXFP4, se puede desplegar en estaciones de trabajo con GPU consumer para tareas de análisis y respuesta razonada sin depender de la nube.
- Automatización agéntica con tool calling: el soporte nativo de function calling y salidas estructuradas permite orquestar flujos multi-paso que invocan APIs externas y validan respuestas con esquemas.
- Generación y ejecución de código: la capacidad de ejecutar Python y producir salidas estructuradas lo hace adecuado para pipelines de análisis de datos y prototipado asistido.
- Atención al cliente con razonamiento configurable: se puede bajar el esfuerzo de razonamiento para reducir latencia en conversaciones de alto volumen y subirlo en casos complejos.
- Depuración de razonamiento en investigación: el acceso a la cadena de pensamiento completa permite auditar por qué el modelo llega a una conclusión, útil en entornos de evaluación de modelos.
- Despliegue en servidores compatibles con OpenAI: mediante vLLM o `transformers serve` se expone una API compatible con OpenAI para integrarse en aplicaciones existentes.
- Experimentación y fine-tuning: la licencia Apache 2.0 y la posibilidad de ajuste por parámetros permiten adaptar el modelo a dominios específicos sin riesgo de copyleft.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo original cabe en 16 GB de memoria con cuantización MXFP4.
- GPU recomendadas: el modelo hermano `gpt-oss-120b` está pensado para una sola GPU de 80 GB (NVIDIA H100 o AMD MI300X); para `gpt-oss-20b` la información no especifica GPU de referencia más allá de la cota de 16 GB.
- GPU consumer: sí cabe en GPUs consumer con al menos 16 GB de VRAM; modelos concretos no disponibles en la información.
- Opciones de despliegue: Transformers, vLLM (versión 0.10.1+gptoss con wheels específicos), Ollama (`gpt-oss:20b`), LM Studio, PyTorch/Triton con implementaciones de referencia, y `transformers serve` para API compatible con OpenAI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gpt-oss-20b (este repo, GGUF) | 20.914.757.184 | ~3.6B | no disponible | Apache 2.0 | Hugging Face (repo no oficial) |
| gpt-oss-120b | 117B | 5.1B | no disponible | Apache 2.0 | Hugging Face (openai/gpt-oss-120b) |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Este repositorio es una conversión no oficial de un tercero (`lmsolo`), no la publicación original de OpenAI; la model card es la del modelo original y no documenta la conversión GGUF concreta.
- El modelo solo funciona correctamente con el formato harmony; usarlo con otros formatos produce comportamiento incorrecto.
- La cadena de pensamiento no está pensada para mostrarse al usuario final.
- No se dispone de información sobre sesgos, riesgo de alucinación ni cobertura idiomática en la documentación proporcionada.
- La longitud de contexto no está disponible en la información suministrada.
- Aunque la licencia Apache 2.0 permite uso comercial, conviene verificar la procedencia y fidelidad de esta conversión GGUF antes de usarla en producción.
- El repositorio presenta 0 descargas y 0 likes, lo que sugiere ausencia de validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/lmsolo/gpt-oss-20b-GGUF
- Modelo original: https://huggingface.co/openai/gpt-oss-20b
- Modelo hermano: https://huggingface.co/openai/gpt-oss-120b
- Colección gpt-oss: https://huggingface.co/collections/openai/gpt-oss-68911959590a1634ba11c7a4
- Paper / model card: https://arxiv.org/abs/2508.10925
- Blog de OpenAI: https://openai.com/index/introducing-gpt-oss/
- Sitio del proyecto: https://gpt-oss.com
- Guías (cookbook): https://cookbook.openai.com/topic/gpt-oss
- Repositorio GitHub: https://github.com/openai/gpt-oss
- Formato harmony: https://github.com/openai/harmony
- Lista de recursos: https://github.com/openai/gpt-oss/blob/main/awesome-gpt-oss.md
- Guía Transformers: https://cookbook.openai.com/articles/gpt-oss/run-transformers
- Guía vLLM: https://cookbook.openai.com/articles/gpt-oss/run-vllm
- Guía Ollama: https://cookbook.openai.com/articles/gpt-oss/run-locally-ollama

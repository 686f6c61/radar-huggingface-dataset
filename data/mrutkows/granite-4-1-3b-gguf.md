# mrutkows/granite-4.1-3b-GGUF

## Resumen

Este repositorio contiene el modelo IBM Granite 4.1 de 3 mil millones de parámetros convertido al formato GGUF por el usuario independiente mrutkows. El modelo original es desarrollado por IBM y forma parte de la familia Granite 4.1, que incluye variantes de 3B, 8B y 30B parámetros. Esta conversión permite ejecutar el modelo en entornos con recursos limitados mediante llama.cpp y otras herramientas compatibles con GGUF, lo que facilita su uso en CPU o GPUs de gama media.

La relevancia actual de esta conversión radica en que Granite 4.1 introduce mejoras sustanciales en tool calling, seguimiento de instrucciones, codificación y razonamiento matemático respecto a versiones anteriores. Al estar disponible en GGUF, el modelo puede desplegarse en producción con infraestructura modesta, sin necesidad de GPUs de alta gama. El repositorio tiene un tamaño de 51,2 GB, lo que sugiere que incluye múltiples archivos de cuantización, aunque no se enumeran explícitamente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 3.402.836.480 (3,4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (varias cuantizaciones, no especificadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

Nota: el repositorio tiene un tamaño de 51,2 GB, lo que indica que contiene varios archivos de cuantización, pero el autor no documenta cuáles.

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. Según la documentación oficial de IBM, Granite 4.1 es una familia de modelos densos (no MoE) con tamaños de 3B, 8B y 30B, ajustados por instrucciones. El modelo original fue entrenado por IBM, aunque no se especifican los datos de entrenamiento, número de tokens ni el método de alineación (RLHF, DPO, etc.). Esta conversión a GGUF es un proceso puramente técnico que no altera los pesos del modelo, solo su formato de almacenamiento para compatibilidad con llama.cpp y similares.

## Capacidades

- Generación de texto y razonamiento: al ser un modelo de lenguaje generalista, puede generar texto coherente y realizar tareas de razonamiento básico.
- Tool calling y function calling: según la documentación de IBM, Granite 4.1 mejora significativamente el tool calling, lo que permite al modelo interactuar con APIs y herramientas externas.
- Seguimiento de instrucciones: el ajuste por instrucciones mejora la capacidad de seguir comandos complejos.
- Codificación: soporta generación y comprensión de código en varios lenguajes.
- Razonamiento matemático: capacidades mejoradas para problemas matemáticos.
- Multilingüismo: no se especifican los idiomas soportados, pero los modelos Granite suelen tener soporte multilingüe (inglés, español, francés, alemán, etc.). Sin confirmación, se indica como no disponible.

## Casos de uso

- Inferencia local en CPU: gracias al formato GGUF, el modelo puede ejecutarse en equipos sin GPU mediante llama.cpp u Ollama, ideal para prototipos y aplicaciones de escritorio.
- Asistentes conversacionales: con una ventana de contexto moderada (aunque no se especifica), puede gestionar diálogos multi-turno en aplicaciones de chat.
- Generación de código en entornos de desarrollo: su capacidad de codificación permite integrarlo en IDE o pipelines de CI/CD para sugerencias de código.
- Automatización de tareas con tool calling: puede conectarse a APIs externas para realizar acciones como consultas a bases de datos o envío de correos.
- Educación y aprendizaje: como modelo pequeño, es adecuado para experimentar con técnicas de prompting y fine-tuning en entornos académicos.
- Despliegue en edge devices: su tamaño reducido (3B) permite ejecutarlo en dispositivos con recursos limitados, como Raspberry Pi o móviles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor de la conversión no proporciona métricas de rendimiento, y la model card del modelo base tampoco las incluye en los datos suministrados.

## Requisitos de hardware

- VRAM estimada: para un modelo de 3,4B en GGUF, las cuantizaciones típicas requieren aproximadamente:
  - Q4_K_M: ~2,5-3 GB de VRAM/RAM
  - Q5_K_M: ~3-3,5 GB
  - Q8_0: ~3,5-4 GB
  Estas cifras son orientativas y dependen de la longitud de contexto y el batch.
- GPU recomendadas: puede ejecutarse en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 (8 GB) o incluso en CPU con suficiente RAM (16 GB o más).
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama media y baja.
- Opciones de despliegue: llama.cpp, llama-cpp-python, Ollama, vLLM (con soporte GGUF), TGI (con adaptaciones).
- Latencia y throughput: no se dispone de datos concretos. En CPU, la generación puede ser de unos 5-20 tokens/s dependiendo del hardware y cuantización; en GPU, puede superar los 50 tokens/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| granite-4.1-3b (GGUF) | 3,4B | no disponible | Apache 2.0 | GGUF |
| Llama 3.2 3B (GGUF) | 3,2B | 128K (según documentación pública) | Llama 3.2 License | GGUF |
| Phi-3.5-mini (GGUF) | 3,8B | 128K (según documentación pública) | MIT | GGUF |

No se dispone de datos de rendimiento comparativo. La elección entre estos modelos dependerá de las necesidades específicas de licencia, contexto y capacidades.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo de lenguaje, puede generar contenido falso o sesgado. No se dispone de información específica sobre los sesgos del modelo base.
- Limitaciones de contexto: no se especifica la longitud de contexto soportada, lo que puede afectar a tareas que requieran ventanas largas.
- Idiomas: no se confirman los idiomas soportados; si el modelo base no es multilingüe, su uso en español podría verse limitado.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero es recomendable revisar los términos del modelo base (ibm-granite/granite-4.1-3b) para confirmar restricciones adicionales.
- Cuantizaciones: el repositorio no documenta qué cuantizaciones incluye, por lo que el usuario debe inspeccionar los archivos para elegir la adecuada.
- Soporte de la comunidad: el autor (mrutkows) es un usuario independiente, no IBM, por lo que el soporte y mantenimiento pueden ser limitados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mrutkows/granite-4.1-3b-GGUF
- Modelo base (safetensors): https://huggingface.co/ibm-granite/granite-4.1-3b
- Repositorio GGUF oficial de IBM: https://huggingface.co/ibm-granite/granite-4.1-3b-GGUF
- Documentación de Granite 4.1: https://www.ibm.com/granite/docs/models/granite4-1
- Repositorio GitHub de conversión GGUF de IBM: https://github.com/IBM/gguf
- Microsoft Foundry (catálogo): https://ai.azure.com/catalog/models/ibm-granite-granite-4.1-3b-gguf

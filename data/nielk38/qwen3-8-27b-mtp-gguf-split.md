# Nielk38/Qwen3.8-27B-MTP-GGUF-SPLIT

## Resumen

El repositorio `Nielk38/Qwen3.8-27B-MTP-GGUF-SPLIT` contiene la versión cuantizada en GGUF del modelo Qwen3.8-27B, dividida en tres shards para facilitar la descarga y el despliegue en entornos con ancho de banda limitado. El modelo base es Qwen3.8-27B, un LLM denso y multimodal desarrollado por el equipo Qwen de Alibaba, que destaca por su capacidad de razonamiento, generación de código y tareas agénticas, con una ventana de contexto de 256K tokens.

Esta versión concreta utiliza la cuantización `UD-Q3_K_XL` de Unsloth, que conserva los tensores originales sin re-cuantización, y aprovecha el entrenamiento MTP (Multi-Token Prediction) del modelo base para acelerar la decodificación en hardware de consumo. El autor del split, Nielk38, ha validado la integridad de los shards mediante `llama-gguf-split` y verificado su funcionamiento con llama.cpp en una GPU AMD Radeon RX 7900 XTX. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales, lo que lo convierte en una opción atractiva para desarrollo de productos y prototipos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (texto + visión) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K tokens (según documentación de Unsloth) |
| Tipos de cuantizacion | `UD-Q3_K_XL` (equivalente a Q3_K_Large en llama.cpp) |
| Idiomas soportados | No disponible (no especificado en la metadata) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (3 shards: `00001-of-00003`, `00002-of-00003`, `00003-of-00003`) |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo transformer denso y multimodal, que combina procesamiento de texto e imagen en una única arquitectura. El checkpoint está entrenado con MTP (Multi-Token Prediction), una técnica que permite predecir varios tokens futuros simultáneamente, mejorando la velocidad de decodificación en inferencia sin necesidad de modelos auxiliares adicionales. Según la documentación de Unsloth, esta característica proporciona mejoras de velocidad de entre un 33% y un 145% en GPU de consumo, dependiendo del hardware.

El repositorio actual no incluye el modelo original en pesos `safetensors`, sino una versión cuantizada y dividida en 3 shards GGUF. La cuantización `UD-Q3_K_XL` es una variante dinámica de Unsloth que mantiene la integridad de los tensores originales, conservando la calidad del modelo en tareas de razonamiento y generación de código. Los datos de entrenamiento del modelo base no se detallan en la información proporcionada, pero se sabe que Qwen3.8 ha sido optimizado para agentes, ofimática y visión.

## Capacidades

- Generación de texto y razonamiento paso a paso, incluyendo respuestas matemáticas y lógicas.
- Generación de código en múltiples lenguajes, con soporte para tareas de programación y depuración.
- Comprensión multimodal: procesa imágenes y texto, útil para análisis de documentos, capturas de pantalla y diagramas.
- Razonamiento agéntico: puede ejecutar flujos de trabajo con múltiples pasos y tomar decisiones basadas en instrucciones.
- Soporte de MTP para decodificación rápida en tiempo real, especialmente beneficioso en hardware local.
- Conversación natural en formato chat, con contexto de hasta 256K tokens para diálogos largos o documentos extensos.

## Casos de uso

- **Atención al cliente automatizada**: el modelo gestiona conversaciones multi-turno con historial extenso (hasta 256K tokens), ideal para resolver consultas complejas de soporte técnico o administrativo sin perder contexto.
- **Generación de código en producción**: su capacidad para razonar sobre especificaciones y generar código correcto permite integrarlo en pipelines de CI/CD como asistente de revisión o generación de pruebas unitarias.
- **Análisis de documentos visuales**: al ser multimodal, puede extraer información de facturas, contratos o informes escaneados, combinando OCR con razonamiento sobre el contenido.
- **Desarrollo de agentes autónomos**: su soporte para flujos agénticos y razonamiento multi-step lo hace apto para construir agentes que interactúen con APIs, navegadores o bases de datos.
- **Asistente de oficina**: puede redactar correos, resumir reuniones, generar informes y automatizar tareas de procesamiento de texto y datos en entornos locales.
- **Prototipado rápido de aplicaciones de IA**: al ser un modelo GGUF con licencia permisiva, se puede desplegar en una laptop o servidor pequeño para validar ideas de negocio sin costos de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval o GSM8K, y la búsqueda web tampoco proporciona datos numéricos. Se recomienda consultar la documentación oficial de Qwen3.8-27B en HuggingFace o en el repositorio de Alibaba para obtener evaluaciones comparativas.

## Requisitos de hardware

- **VRAM estimada**: según Unsloth, el modelo puede ejecutarse en configuraciones de 17 GB de VRAM/RAM con la cuantización `UD-Q3_K_XL`. El archivo GGUF tiene un tamaño de 13,1 GB, por lo que se requiere al menos 14-16 GB de memoria total (VRAM + RAM) para cargar el modelo completo.
- **GPU recomendadas**: la validación se realizó en una AMD Radeon RX 7900 XTX (24 GB VRAM). También es compatible con NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB) o GPUs de datacenter como A100 y H100.
- **Compatibilidad con consumer GPU**: sí, cabe en tarjetas con 16 GB o más de VRAM, como RTX 4080, 4090, o las de la serie RX 7000 con 16 GB o más.
- **Opciones de despliegue**: llama.cpp (probado), Ollama, vLLM, TGI y otros motores compatibles con GGUF.
- **Latencia y throughput**: no hay datos públicos específicos para esta cuantización. La velocidad de decodificación varía entre 33% y 145% de mejora gracias a MTP, según el hardware y la configuración.

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la información proporcionada. Qwen3.8-27B pertenece a la familia de modelos densos de 27B, comparable en tamaño a otros como Llama-3-27B o Qwen2.5-27B, pero no se han encontrado benchmarks que permitan una comparación objetiva. Se recomienda consultar la documentación oficial de Qwen para obtener evaluaciones frente a alternativas.

## Limitaciones y advertencias

- **Pérdida de precisión por cuantización**: la cuantización `Q3_K_XL` reduce el tamaño del modelo a 13 GB, pero puede degradar ligeramente la calidad en tareas de razonamiento complejo o matemáticas avanzadas frente a versiones de mayor precisión.
- **Contexto largo con memoria alta**: aunque el modelo soporta 256K tokens, cargar la ventana completa requiere una cantidad de memoria proporcional al número de tokens, lo que puede superar los 24 GB en caso de contextos máximos.
- **Idiomas**: no se ha confirmado la lista de idiomas soportados. Aunque Qwen suele ser multilingüe, la falta de datos específicos recomienda verificar en la documentación oficial antes de desplegar en aplicaciones multilingües.
- **Sesgos y alucinaciones**: como cualquier modelo de lenguaje, puede generar información falsa o sesgada. Se recomienda validar las salidas en entornos críticos.
- **Dependencia de shards**: el modelo está dividido en 3 archivos; es necesario descargar los tres y mantenerlos en el mismo directorio para su funcionamiento correcto. Si se pierde un shard, la carga fallará.
- **Uso comercial**: la licencia Apache-2.0 permite uso comercial sin restricciones, pero es responsabilidad del usuario cumplir con las políticas de la plataforma de despliegue.

## Enlaces

- [Repositorio HuggingFace del split GGUF](https://huggingface.co/Nielk38/Qwen3.8-27B-MTP-GGUF-SPLIT)
- [Repositorio HuggingFace de Unsloth con el GGUF original](https://huggingface.co/unsloth/Qwen3.8-27B-GGUF)
- [Modelo base Qwen3.8-27B en HuggingFace](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Repositorio oficial de Qwen3.8-27B en GitHub](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [Guía de MTP para Qwen3.8-27B en GitHub](https://github.com/sudoingX/qwen38-mtp)
- [Documentación de Unsloth para Qwen3.8](https://unsloth.ai/docs/models/qwen3.8)

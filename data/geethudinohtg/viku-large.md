# geethudinohtg/viku-large

## Resumen

Viku Large es un modelo de lenguaje generativo especializado en código, desarrollado por el usuario geethudinohtg como un ajuste fino del modelo Qwen2.5-Coder-7B-Instruct de Alibaba Cloud. Su propósito es ofrecer asistencia de programación local y privada, con capacidades de uso de herramientas (tool calling) y memoria persistente, todo en formato GGUF para facilitar su ejecución en equipos personales. El modelo se distribuye bajo licencia Apache 2.0, lo que permite su uso comercial sin restricciones, y está optimizado para entornos como Ollama, LM Studio o cualquier cliente compatible con la API de OpenAI.

Con un tamaño de 7 mil millones de parámetros y una cuantización Q4_K_M de 4,4 GB, Viku Large cabe en GPUs con 8 GB de VRAM, como las RTX 4060, lo que lo convierte en una opción atractiva para desarrolladores que buscan una alternativa local a los servicios de codificación en la nube. El modelo presenta un contexto nativo de 32K tokens, ampliable a 128K mediante la extensión YaRN en su versión 3, y destaca por su integración nativa con herramientas de scraping web, operaciones de archivos y un sistema de memoria basado en árboles de directorios (memtree). Esta combinación lo hace especialmente relevante para agentes autónomos y flujos de trabajo que requieren mantener contexto a lo largo de múltiples sesiones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Qwen2.5-Coder-7B-Instruct |
| Parámetros totales | 7,2 mil millones (7B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32K tokens nativos (128K con YaRN en v3) |
| Tipos de cuantización | Q4_K_M (según la model card; no se especifican otros) |
| Idiomas soportados | Inglés (en) y telugu (te) según metadatos; el modelo base puede soportar más idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Viku Large se basa en la arquitectura del modelo Qwen2.5-Coder-7B-Instruct, un transformer de densidad completa con atención causal, diseñado específicamente para tareas de programación. El ajuste fino se realizó mediante QLoRA (Low-Rank Adaptation) con rango 16, cuantización de 4 bits, y se entrenó durante 600 pasos sobre un conjunto de datos de 19.5K muestras orientadas a agentes. Los datos de entrenamiento incluyen mezclas de Magicoder, Evol-Instruct, datos de function calling de Glaive/Hermes y trazas de agentes destiladas.

La principal innovación técnica es la integración de herramientas nativas: el modelo está entrenado para interactuar con utilidades de scraping web, operaciones de archivos y un sistema de memoria persistente llamado "memtree drive-trees". Esto le permite comportarse como un agente autónomo con memoria entre sesiones, sin depender de una API externa para la gestión de contexto. El contexto nativo de 32K tokens se amplía a 128K mediante la extensión YaRN, aunque esta capacidad solo está disponible en la versión 3 del modelo.

## Capacidades

- Generación y edición de código en múltiples lenguajes, con soporte heredado del modelo base Qwen2.5-Coder.
- Tool calling y function calling nativo, con herramientas de scraping web, lectura y escritura de archivos, y memoria persistente.
- Funcionalidad de agente con razonamiento multi-paso y uso de herramientas de forma autónoma.
- Integración con clientes OpenAI (opencode, Cline, aider) a través de un servidor local en el puerto 8787.
- Memoria ilimitada entre sesiones mediante el sistema de árboles de directorios.
- Soporte multilingüe limitado a inglés y telugu según los metadatos, aunque el modelo base puede ofrecer más idiomas.
- Formato GGUF compatible con Ollama, llama.cpp y LM Studio, lo que permite una instalación sencilla en entornos locales.

## Casos de uso

- **Asistente de programación privado**: un desarrollador puede usar Viku Large para generar fragmentos de código, revisar implementaciones o resolver errores sin enviar datos sensibles a la nube, gracias a su tamaño compacto que cabe en GPUs de 8 GB.
- **Automatización de operaciones de archivos**: el modelo puede leer, modificar y organizar archivos locales, lo que permite automatizar tareas como renombrar archivos, generar informes o formatear código en un proyecto.
- **Scraping web y extracción de datos**: con su soporte de herramientas de scraping, el modelo puede consultar sitios web y extraer información estructurada, útil para monitorizar precios, recopilar noticias o generar resúmenes.
- **Agente de desarrollo con memoria persistente**: gracias a su sistema de memoria, el modelo puede mantener el contexto de un proyecto a lo largo de sesiones, permitiendo continuar tareas de desarrollo sin perder el hilo.
- **Integración en IDEs y herramientas de desarrollo**: se puede conectar a Cline, aider u otros clientes OpenAI para ofrecer autocompletado y sugerencias de código en tiempo real.
- **Entorno de aprendizaje y experimentación**: para investigadores y estudiantes que deseen experimentar con modelos de código y agentes con herramientas, sin costos de API y con control total del entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM mínima estimada: 8 GB para la cuantización Q4_K_M (4.4 GB de archivo), según la model card.
- GPU recomendadas: RTX 4060, RTX 3070, RTX 3080, o cualquier GPU con al menos 8 GB de VRAM. También puede ejecutarse en CPU mediante llama.cpp, aunque con menor rendimiento.
- Despliegue: compatible con llama.cpp, Ollama, LM Studio y el servidor OpenAI integrado (memtree.serve).
- Latencia y throughput: no se proporcionan datos específicos; dependerá del hardware y de la configuración del entorno.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Viku Large | 7,2B | 32K (128K con YaRN) | Apache 2.0 | GGUF | Código, herramientas y memoria local |
| CodeLlama-7B | 7B | 16K | Llama 2 (uso comercial con restricciones) | safetensors, GGUF | Código |
| DeepSeek-Coder-7B | 7B | 16K | MIT | safetensors, GGUF | Código y razonamiento |
| Qwen2.5-Coder-7B-Instruct | 7B | 32K | Apache 2.0 | safetensors | Modelo base de Viku, sin herramientas |

Viku Large se distingue por su integración de herramientas y memoria persistente, además de su formato GGUF listo para uso local.

## Limitaciones y advertencias

- El modelo puede presentar sesgos en los datos de entrenamiento, especialmente en patrones de código no estándar o poco comunes.
- Riesgo de alucinación en la generación de código, sobre todo cuando las especificaciones son ambiguas o se utilizan librerías poco frecuentes.
- Los metadatos indican soporte solo para inglés y español, aunque el modelo base puede funcionar en otros idiomas; no se garantiza un rendimiento óptimo fuera de esos idiomas.
- El repositorio muestra un tamaño de 0.0 GB y 0 descargas, lo que sugiere que podría estar vacío o en una fase muy temprana. Es imprescindible verificar el contenido antes de cualquier uso.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-Coder también es Apache 2.0, sin restricciones adicionales conocidas.
- Para producción, se recomienda validar el modelo en tareas de prueba y considerar el riesgo de errores en código crítico.

## Enlaces

- [Hugging Face - geethudinohtg/viku-large](https://huggingface.co/geethudinohtg/viku-large)
- [Qwen2.5-Coder-7B-Instruct (modelo base)](https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct)

No se encontraron otros enlaces relevantes en la búsqueda web.

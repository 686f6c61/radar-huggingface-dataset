# BeastxD/text2cypher_lora_v8_denoised

## Resumen

El modelo **BeastxD/text2cypher_lora_v8_denoised** es un fine-tune del modelo base **Qwen/Qwen3.5-4B** (desarrollado por Alibaba) orientado a la generación de consultas **Cypher** a partir de texto natural. Cypher es el lenguaje de consulta de la base de datos de grafos Neo4j, y este modelo pretende traducir preguntas del usuario en consultas válidas para extraer información de grafos.

El modelo ha sido desarrollado por el usuario **BeastxD**, que ha publicado varias versiones previas (v4, v8 raw, etc.) dentro de una serie de experimentos para mejorar la precisión de la traducción texto a Cypher. El nombre "denoised" sugiere que se ha aplicado algún proceso de limpieza o filtrado de datos de entrenamiento, aunque no se detalla en la documentación disponible. El entrenamiento se realizó con la librería **Unsloth** y la biblioteca **TRL** de Hugging Face, lo que acelera el proceso de fine-tuning.

El modelo tiene 4.659.865.088 parámetros (aproximadamente 4,6 mil millones) y se distribuye bajo licencia **Apache 2.0**, lo que permite su uso comercial. No se proporciona información sobre la longitud de contexto, ni sobre el dataset de entrenamiento. Aunque el pipeline de Hugging Face indica "image-text-to-text", el modelo base es puramente de texto y no hay evidencia de capacidades multimodales en la documentación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5-4B) |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no especificado |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de **Qwen3.5-4B**, un transformer de lenguaje de 4.600 millones de parámetros. No se han publicado detalles sobre la arquitectura interna (número de capas, cabezas de atención, etc.) en la documentación del modelo. El fine-tune se realizó utilizando **Unsloth**, una librería que optimiza el entrenamiento de modelos de lenguaje reduciendo el uso de memoria y acelerando el proceso, junto con la biblioteca **TRL** de Hugging Face para el entrenamiento con RLHF u otros métodos de ajuste.

La información sobre el dataset de entrenamiento no está disponible. El nombre "text2cypher" indica que el objetivo es transformar texto natural en consultas Cypher, por lo que se presume que el conjunto de datos contiene pares de preguntas en inglés y consultas Cypher correspondientes, probablemente basado en los datasets públicos de Neo4j (como los del repositorio neo4j-labs/text2cypher). No se menciona si se aplicaron técnicas como RLHF, DPO o supervisión directa, ni el número de tokens de entrenamiento.

## Capacidades

- Generación de consultas **Cypher** a partir de texto natural en inglés, para bases de datos de grafos Neo4j.
- Conversación multi-turno: al ser un modelo de lenguaje de propósito general, puede mantener diálogos conversacionales.
- Generación de texto libre y razonamiento básico, heredado del modelo base Qwen3.5-4B.
- No se ha documentado soporte para **tool calling** ni **function calling**.
- No se ha documentado soporte para agentes o razonamiento multi-paso más allá de la generación de consultas.
- Capacidad multilingüe limitada: la documentación indica solo inglés.

## Casos de uso

- **Asistente para analistas de datos en Neo4j**: el modelo puede traducir preguntas en inglés como "¿Cuáles son los clientes que compraron más de 5 productos?" a una consulta Cypher válida, ahorrando tiempo a los desarrolladores que no dominan Cypher.
- **Integración en aplicaciones de chat para bases de grafos**: se puede desplegar como un endpoint de generación de texto (por ejemplo, con TGI) para que un chatbot genere consultas Cypher dinámicamente en respuesta a preguntas de los usuarios.
- **Generación de consultas en pipelines de ETL**: en un proceso de ingesta de datos, el modelo puede generar consultas de validación o de transformación de grafos a partir de especificaciones textuales.
- **Entrenamiento de modelos de NLU para grafos**: sirve como base para otros fine-tunes o como componente de un sistema más grande que necesite traducir lenguaje natural a consultas de grafos.
- **Herramienta educativa**: para aprender Cypher, el modelo puede generar ejemplos de consultas a partir de preguntas formuladas en inglés, mostrando la sintaxis correcta.
- **Automatización de informes**: en entornos donde se necesite extraer datos de grafos para reportes, el modelo puede generar las consultas automáticamente a partir de una descripción de los datos deseados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni evaluaciones específicas de generación de Cypher para este modelo.

## Requisitos de hardware

- El repositorio pesa 9,3 GB, lo que indica que contiene los pesos en precisión completa (FP16 o FP32). Para inferencia en FP16, se estima un consumo de VRAM de aproximadamente 9-10 GB (considerando los parámetros más overhead de activaciones), por lo que cabría en GPUs consumer como una RTX 3090, RTX 4090 o A4000 de 16 GB.
- Para cuantización en 4 bits (por ejemplo, con GPTQ o bitsandbytes), el uso de VRAM se reduciría a unos 3-4 GB, permitiendo ejecución en GPUs de 8 GB como la RTX 3060 Ti.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100, H100 para despliegue de alta concurrencia.
- Opciones de despliegue: se puede usar **vLLM**, **Ollama**, **llama.cpp**, **Text Generation Inference (TGI)** o la librería de transformers de Hugging Face. Al ser un modelo de tamaño mediano, es factible en un solo GPU.
- La latencia y throughput no están documentados; dependerá del hardware y la cuantización. En una RTX 4090 con FP16, se espera una velocidad de generación de decenas de tokens por segundo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para la tarea text2Cypher. El repositorio **neo4j-labs/text2cypher** incluye modelos y datasets para esta tarea, pero no hay datos públicos de comparación con este modelo concreto. Se podría comparar con el propio modelo base Qwen3.5-4B, que no está especializado en Cypher, pero no hay resultados de evaluación disponibles.

## Limitaciones y advertencias

- **Idioma**: el modelo está entrenado solo en inglés; puede no funcionar bien en otros idiomas.
- **Sesgos**: al ser un fine-tune de un modelo de lenguaje general, puede heredar sesgos del modelo base, aunque no hay evidencia específica.
- **Alucinación**: como todos los modelos generativos, puede producir consultas Cypher sintácticamente válidas pero semánticamente incorrectas o no ejecutables.
- **Falta de contexto**: la longitud de contexto no está documentada, por lo que no se sabe si puede manejar esquemas de grafos grandes o conversaciones largas.
- **Licencia**: Apache 2.0 permite uso comercial y modificación, pero es responsabilidad del usuario verificar el cumplimiento de las licencias del modelo base (Qwen3.5-4B) y de los datasets utilizados, aunque no se han especificado.
- **Producción**: no hay evidencia de evaluación en entornos reales; se recomienda validar las consultas generadas en un entorno de pruebas antes de usarlas en producción.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/BeastxD/text2cypher_lora_v8_denoised)
- [Repo de datasets y evaluación de text2Cypher de Neo4j Labs](https://github.com/neo4j-labs/text2cypher)
- [Documentación del repositorio Neo4j Labs en DeepWiki](https://deepwiki.com/neo4j-labs/text2cypher)
- [Repo Text2Cypher de GraphML-lab](https://github.com/GraphML-lab/Text2Cypher)
- [Modelo base Qwen/Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B) (no disponible en la búsqueda, pero se infiere del nombre)
- [Librería Unsloth](https://github.com/unslothai/unsloth)

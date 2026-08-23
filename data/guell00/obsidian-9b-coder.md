# guell00/OBSIDIAN-9B-Coder

## Resumen

OBSIDIAN-9B-Coder es un modelo de lenguaje de 9.197 millones de parámetros publicado en HuggingFace por el usuario guell00. Se distribuye exclusivamente en formato GGUF, lo que indica que está pensado para ejecución local con llama.cpp o motores compatibles. La model card es extremadamente mínima: el autor no detalla arquitectura, licencia ni datos de entrenamiento, aunque los nombres de los archivos (`Qwopus3.5-9B-Coder.*.gguf`) y los tags (`qwen3_5`, `vision-language-model`) sugieren que se trata de un ajuste fino sobre un modelo base de la familia Qwen 3.5 de 9B, posiblemente con capacidades multimodales.

El repositorio incluye un archivo `BF16-mmproj.gguf`, lo que confirma que el modelo es multimodal (proyección de visión para llama.cpp). La relevancia actual de este tipo de modelos reside en su tamaño compacto (9B), que permite desplegarlos en hardware de consumo, y en su orientación a tareas de generación de código, como indica el sufijo "Coder". Sin embargo, la falta de información pública sobre el proceso de entrenamiento y los benchmarks hace que su evaluación objetiva sea limitada en este momento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer, basado en Qwen 3.5-9B) |
| Parametros totales | 9.197.093.888 |
| Parametros activos | no aplicable (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0, BF16 (proyector multimodal) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors no publicados) |

## Arquitectura y entrenamiento

La información disponible no permite describir la arquitectura interna con certeza. Los nombres de los archivos GGUF (`Qwen35-9B-Coder.*.gguf`) y el tag `qwen3_5` apuntan a que el modelo base es Qwen3.5-9B, que es un transformer denso de la familia Qwen. El repositorio incluye un proyector multimodal (`BF16-mmproj.gguf`), lo que indica que el modelo acepta imágenes como entrada y puede procesar tareas de visión y lenguaje. El autor declara haber utilizado la librería Unsloth para el ajuste fino y la conversión a GGUF, lo que implica un proceso de fine-tuning eficiente en memoria.

No se proporcionan datos sobre el dataset de entrenamiento, el número de tokens visto, ni si se aplicaron técnicas como RLHF o DPO. Tampoco se menciona ninguna innovación técnica específica más allá del uso de Unsloth para acelerar el entrenamiento.

## Capacidades

- Generación de texto y código: el sufijo "Coder" sugiere que está especializado en generación y comprensión de código fuente.
- Procesamiento multimodal: la presencia del archivo `mmproj` indica que puede aceptar imágenes como entrada y responder con texto (p.ej., describir código en capturas, leer diagramas).
- Conversación multi-turno: el tag `conversational` en HuggingFace indica soporte para diálogos.
- Compatibilidad con llama.cpp: al estar en GGUF, se puede ejecutar con `llama-cli` o `llama-mtmd-cli` para modelos multimodales.
- Tool calling / function calling: no disponible, no se menciona en la model card.

## Casos de uso

- Asistente de programación local: se puede ejecutar en una estación de trabajo con una GPU consumer (p.ej., RTX 3090/4090) para obtener autocompletado y explicación de código sin enviar datos a la nube.
- Análisis de capturas de pantalla de código: gracias al proyector multimodal, el modelo puede recibir una imagen de un fragmento de código y generar una explicación o detectar errores.
- Revisión de documentación técnica: puede resumir o extraer información de imágenes de diagramas de arquitectura o esquemas UML.
- Desarrollo de agentes de codificación en entornos aislados: al ser un modelo compacto, es viable integrarlo en pipelines de CI/CD para generar pruebas unitarias o documentación automática.
- Chat técnico en local: desplegado con Ollama o llama.cpp, sirve como chatbot de soporte técnico sin conexión a internet.
- Prototipado rápido de aplicaciones RAG con código fuente: puede combinarse con un índice vectorial para responder preguntas sobre una base de código corporativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K, ni comparaciones con otros modelos en la model card del autor.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q3_K_M: ~4-5 GB
  - Q4_K_M: ~5-6 GB
  - Q5_K_M: ~6-7 GB
  - Q6_K: ~7-8 GB
  - Q8_0: ~8-9 GB
- GPU recomendadas: RTX 3060 (12 GB) para Q4_K_M, RTX 3090/4090 (24 GB) para Q8_0 o para usar la modalidad multimodal con el mmproj.
- Sí cabe en GPU consumer: cualquier tarjeta con 8 GB o más puede ejecutar la versión Q4_K_M.
- Opciones de despliegue: llama.cpp (con `llama-cli` o `llama-mtmd-cli`), Ollama (si se importa el GGUF), o servidores compatibles con GGUF como llama.cpp-server.
- Latencia y throughput estimados: no disponibles; dependerá del hardware y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| OBSIDIAN-9B-Coder | 9.2B | no disponible | Código y multimodal | no disponible | GGUF |
| OmniCoder-9B | 9B | no disponible | Código agéntico (basado en Qwen3.5-9B) | no disponible | GGUF (Ollama) |
| Yi-Coder-9B-Chat | 9B | 128K (según 01-ai) | Código | Apache 2.0 | Transformers, GGUF |

Nota: OmniCoder-9B es un modelo de código agéntico de 9B basado en Qwen3.5-9B, fine-tuneado en trazas de agentes de Claude Opus 4.6, GPT-5.4 y Gemini 3.1. Yi-Coder-9B-Chat es un modelo de código de 01-ai con licencia Apache 2.0 y contexto de 128K. OBSIDIAN-9B-Coder podría estar relacionado con OmniCoder (por el nombre de los archivos internos `Qwen35-9B-Coder`), pero no hay confirmación en la model card.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al estar basado en Qwen3.5, puede heredar sesgos del modelo base.
- Riesgo de alucinación: sin benchmarks ni datos de entrenamiento, no se puede evaluar su fiabilidad en tareas de código; es probable que alucine en contextos complejos.
- Limitaciones de contexto: la longitud máxima de contexto no se especifica; el contexto real dependerá de la configuración de llama.cpp.
- Restricciones de licencia: la licencia es "no disponible", lo que impide su uso comercial sin clarificación legal. Es un riesgo importante para producción.
- Falta de documentación: no hay información sobre el dataset de entrenamiento, lo que dificulta evaluar su robustez en entornos reales.
- Modalidad multimodal: el archivo `mmproj` es una proyección de imagen, pero no se han publicado ejemplos de uso ni pruebas de calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/guell00/OBSIDIAN-9B-Coder
- Repositorio Unsloth (herramienta usada): https://github.com/unslothai/unsloth
- OmniCoder-9B (modelo similar, en Ollama): https://ollama.com/carstenuhlig/omnicoder-9b
- Yi-Coder-9B (modelo comparable): https://huggingface.co/01-ai/Yi-Coder-9B
- Guía de OmniCoder 9B (2026): https://codersera.com/blog/omnicoder-9b-complete-guide-2026/

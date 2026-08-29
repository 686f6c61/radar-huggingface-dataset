# MergekitCloud/mergekit-71

## Resumen

MergekitCloud/mergekit-71 es un modelo de lenguaje de 8.030 millones de parámetros (8B) generado mediante la fusión de varios modelos base de la familia Llama 3.1, todos ellos de 8B. El proceso de fusión emplea el método Model Stock (arxiv:2403.19522), una técnica que combina los pesos de múltiples modelos preentrenados para obtener un modelo único con capacidades mejoradas sin necesidad de entrenamiento adicional. El modelo resultante está orientado a tareas conversacionales y de roleplay, como sugieren los nombres de los modelos base incluidos (Humanish-Roleplay, Lexi-Uncensored, Unholy-OAS).

Este modelo es relevante porque ejemplifica el enfoque de "merging" como alternativa económica al fine-tuning: permite combinar las fortalezas de varios modelos especializados (por ejemplo, uno optimizado para roleplay, otro sin censura, otro para instrucciones) en un solo artefacto. Al estar basado en Llama 3.1, hereda la arquitectura transformer decoder-only y el formato de pesos safetensors. Sin embargo, la ficha carece de información sobre licencia, idiomas, contexto y benchmarks, lo que limita su evaluación para uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en float16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusión (merge) de tres modelos preentrenados de 8B, todos basados en la arquitectura Llama 3.1. El método utilizado es Model Stock, descrito en el paper arxiv:2403.19522, que combina los pesos de los modelos mediante una media ponderada calculada a partir de la información de los propios modelos. La configuración YAML indica que se usó `vicgalle/Humanish-Roleplay-Llama-3.1-8B` como modelo base, y se incluyeron `ArliAI/Llama-3.1-8B-ArliAI-RPMax-v1.3`, `Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2` y `Undi95/Llama3-Unholy-8B-OAS`. Los parámetros del merge incluyen `normalize: false` e `int8_mask: true`, y el dtype de salida es float16.

No se ha realizado ningún entrenamiento adicional; el modelo es una combinación directa de pesos. Esto implica que no hay datos sobre el dataset de entrenamiento, ni sobre técnicas como RLHF o DPO. La innovación técnica reside en el propio método de fusión, que busca preservar las capacidades de los modelos originales mientras se reduce la redundancia.

## Capacidades

- Generación de texto conversacional: el modelo está diseñado para mantener diálogos multi-turno, gracias a su origen en modelos de roleplay y chat.
- Roleplay y narrativa: los modelos base incluyen "Humanish-Roleplay" y "Unholy-OAS", lo que sugiere una capacidad para interpretar personajes y generar historias.
- Contenido sin censura: los nombres "Lexi-Uncensored" y "Unholy" indican que el modelo puede generar contenido que otros modelos filtran, aunque no se especifica el alcance.
- Instrucciones generales: al ser un merge de modelos Llama 3.1, conserva la capacidad básica de seguir instrucciones, aunque no se han medido sus límites.
- No se dispone de información sobre tool calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

- Chatbots de entretenimiento: el modelo puede alimentar asistentes conversacionales para aplicaciones de ocio, como juegos de rol o compañía virtual, gracias a su orientación a roleplay y su capacidad de mantener contexto en diálogos largos (aunque la longitud de contexto no está confirmada).
- Generación de ficción interactiva: escritores o desarrolladores de juegos pueden usarlo para crear narrativas dinámicas donde el modelo interpreta personajes no jugadores (NPCs) con personalidades definidas.
- Prototipado rápido de asistentes sin censura: equipos que necesitan explorar respuestas en dominios sensibles (por ejemplo, educación sexual o discusión de temas tabú) pueden usar este modelo como base para pruebas, siempre que cumplan con las normativas legales.
- Investigación en fusión de modelos: sirve como caso de estudio para comparar el rendimiento de Model Stock frente a otros métodos de merge, ya que se puede evaluar la calidad del texto generado frente a los modelos originales.
- Generación de diálogos para entrenamiento de otros modelos: el texto sintético producido puede utilizarse para fine-tuning de modelos más pequeños, aunque se debe verificar la calidad y coherencia.
- Demostraciones técnicas de mergekit: desarrolladores que quieran aprender a usar la herramienta mergekit pueden reproducir este merge como ejemplo práctico, ya que la configuración YAML está documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar. Tampoco se comparan con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 8B en float16 requiere aproximadamente 16 GB de VRAM para cargar los pesos completos. Con cuantización a 8 bits (int8) se reduce a unos 8 GB, y a 4 bits a unos 4-5 GB, pero no se han publicado versiones cuantizadas de este modelo.
- GPU recomendadas: para float16, una GPU con 16 GB o más, como NVIDIA RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB). Para cuantización, una RTX 3060 de 12 GB podría ser suficiente.
- Compatibilidad con GPU de consumo: sí, es posible ejecutarlo en GPUs de consumo con al menos 16 GB de VRAM en float16, o con cuantización en GPUs de 8 GB.
- Opciones de despliegue: al ser un modelo transformers estándar, puede servirse con vLLM, Text Generation Inference (TGI), llama.cpp (si se convierte a GGUF) u Ollama (si se crea un Modelfile). No se han publicado archivos GGUF en el repositorio.
- Latencia y throughput: no disponibles. Dependerá del hardware y del backend utilizado.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos. Sin embargo, estructuralmente se puede comparar con los modelos base que lo componen:

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| MergekitCloud/mergekit-71 | 8B | no disponible | no disponible | Merge de 3 modelos Llama 3.1 8B |
| ArliAI/Llama-3.1-8B-ArliAI-RPMax-v1.3 | 8B | no disponible | no disponible | Modelo base, optimizado para instrucciones |
| Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2 | 8B | no disponible | no disponible | Modelo base, sin censura |
| Undi95/Llama3-Unholy-8B-OAS | 8B | no disponible | no disponible | Modelo base, orientado a roleplay |

No hay información sobre el rendimiento relativo de estos modelos, por lo que no es posible establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un merge de modelos sin censura, es probable que genere contenido ofensivo, sexual o violento sin filtros. No se ha realizado ninguna alineación de seguridad.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede inventar hechos o datos, especialmente en contextos largos. No se ha evaluado su fiabilidad.
- Limitaciones de contexto e idioma: no se especifica la longitud de contexto ni los idiomas soportados. Se asume que hereda las capacidades de Llama 3.1 (128k de contexto y multilingüe), pero no está confirmado.
- Restricciones de licencia: la licencia no está disponible, lo que impide conocer si se permite uso comercial o modificación. Se debe contactar al autor antes de usar en producción.
- Caveat para producción: al no tener benchmarks ni documentación de calidad, no se recomienda su uso en aplicaciones críticas sin una evaluación exhaustiva previa. Además, el contenido sin censura puede violar políticas de plataformas o leyes locales.

## Enlaces

- HuggingFace: https://huggingface.co/MergekitCloud/mergekit-71
- Paper Model Stock: https://arxiv.org/abs/2403.19522
- Repositorio mergekit: https://github.com/arcee-ai/mergekit
- Modelo base ArliAI: https://huggingface.co/ArliAI/Llama-3.1-8B-ArliAI-RPMax-v1.3
- Modelo base Orenguteng: https://huggingface.co/Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2
- Modelo base Undi95: https://huggingface.co/Undi95/Llama3-Unholy-8B-OAS
- Modelo base vicgalle: https://huggingface.co/vicgalle/Humanish-Roleplay-Llama-3.1-8B

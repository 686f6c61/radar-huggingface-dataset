# darkbit1001/DavidAU-Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-EXL3-4.00bpw-HB8

## Resumen

Este repositorio contiene una cuantización EXL3 de 4 bits del modelo DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU, un finetune de la familia Qwen3.8 desarrollado por DavidAU. El modelo original se describe como una variante "TURBO" con entrenamiento multi-etapa que combina etapas de "Cold Fusion" y un proceso de "heretic" para eliminar alineaciones de seguridad, dando lugar a un modelo "uncensored" orientado a conversación y análisis. Esta cuantización ha sido realizada por darkbit1001 con ExLlamaV3 1.4.4, utilizando un formato EXL3 de 4 bits por peso (4.00 bpw) y 8 bits de cabeza. El modelo base se destaca por mejoras significativas en benchmarks frente a Qwen 3.8 27B, especialmente en ARC-C (141 puntos por encima), y por una reducción notable en el número de tokens de pensamiento. El repositorio cuantizado tiene 8.413.517.184 parámetros y un tamaño de 16,9 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de lenguaje autorregresivo de la familia Qwen) |
| Parámetros totales | 8.413.517.184 |
| Parámetros activos | No disponible (no se especifica si es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | EXL3 4.00 bpw, head bits 8 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | EXL3 (safetensors) |

## Arquitectura y entrenamiento

La información proporcionada no especifica la arquitectura del modelo. El nombre "Qwen3.8-27B-TURBO" indica que se basa en la familia Qwen de Alibaba, aunque no se detalla si se trata de un transformer denso o de un modelo de mezcla de expertos (MoE). El modelo original de DavidAU se describe como un finetune con entrenamiento multi-etapa ("Multi-stage tuning") que incluye etapas de "Cold Fusion" y un proceso de "heretic" para des-censurar el modelo. El autor menciona que se utilizaron técnicas como "GAIN Training" y la librería Unsloth, y que el modelo se sometió a pruebas de estrés en cuantización de 4 bits. No se proporcionan datos sobre el dataset de entrenamiento, el número de tokens ni procesos de RLHF/DPO. La cuantización EXL3 fue realizada con ExLlamaV3 1.4.4, usando calibración de 250 filas y 2048 columnas, codebook "mul1" y output scales "always".

## Capacidades

- Generación de texto conversacional y análisis detallado.
- Razonamiento y analítica: el autor destaca una capacidad analítica fuerte, con respuestas detalladas y precisas.
- Reducción de tokens de pensamiento: el modelo genera entre 1/2 y 1/10 de los tokens de pensamiento de un Qwen normal, manteniendo el nivel de detalle.
- Tamaño de pensamiento auto-variable según la complejidad de la tarea.
- Des-censura: al ser un modelo "uncensored", no aplica las alineaciones de seguridad habituales, lo que permite respuestas sin restricciones (con los riesgos asociados).
- Multilingüe: no disponible.
- Tool calling / function calling: no disponible.
- Visión y audio: no disponible.

## Casos de uso

- Análisis de propuestas complejas: el modelo puede desglosar un plan en múltiples etapas y evaluar sus implicaciones, gracias a su capacidad analítica y a la reducción de tokens de pensamiento que permite respuestas más directas.
- Generación de contenido creativo sin restricciones: para escritura de ficción, guiones o contenido editorial que requiera explorar temas tabú sin filtros de alineación.
- Investigación y resumen de documentos: puede resumir informes extensos y extraer conclusiones relevantes, apoyándose en su razonamiento y en el bajo consumo de tokens de pensamiento.
- Chat de soporte interno en organizaciones: donde se necesite un asistente que pueda responder preguntas técnicas sin restricciones de tono o de contenido.
- Simulación de personajes y role-playing: al ser "uncensored", es adecuado para juegos de rol y diálogos con personajes que no siguen las normas de seguridad habituales.
- Asistente de estrategia y toma de decisiones: puede analizar escenarios complejos y proponer líneas de acción, como se menciona en la model card con el ejemplo de una propuesta para "salvar el planeta".

## Benchmarks y rendimiento

La información disponible menciona que el modelo supera a Qwen 3.8 27B en ARC-C en 141 puntos, y que la cuantización 4-bit mantiene aproximadamente el 99% del rendimiento de la versión de 8 bits. Sin embargo, no se incluyen los resultados completos de los benchmarks (arc/c, arc/e, boolq, hswag, obkqa, piqa, wino) en la información proporcionada. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con consumer GPUs: no disponible.
- Opciones de despliegue: el formato EXL3 requiere un runtime compatible con ExLlamaV3; no se indican otras opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en los datos proporcionados. No se han publicado resultados de benchmarks en la información disponible.

## Limitaciones y advertencias

- Al ser un modelo "uncensored", existe un riesgo elevado de generar contenido inapropiado, ofensivo o peligroso.
- La falta de alineación puede afectar a la seguridad en aplicaciones de producción.
- No se han proporcionado datos de evaluación completos, por lo que el rendimiento real en tareas específicas no está verificado.
- El modelo puede sufrir alucinaciones, como cualquier modelo de lenguaje.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar el cumplimiento de las condiciones de la licencia.
- No se especifica la longitud de contexto, por lo que puede ser inadecuado para tareas de contexto muy largo.

## Enlaces

- Repositorio actual: https://huggingface.co/darkbit1001/DavidAU-Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-EXL3-4.00bpw-HB8
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Repositorio GGUFS del modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF

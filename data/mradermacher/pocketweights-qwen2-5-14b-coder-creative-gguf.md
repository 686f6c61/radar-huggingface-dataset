# mradermacher/PocketWeights-Qwen2.5-14B-Coder-Creative-GGUF

## Resumen

PocketWeights-Qwen2.5-14B-Coder-Creative es un modelo de lenguaje de 14 000 millones de parámetros resultante de una fusión (merge) mediante el algoritmo DARE-TIES entre Qwen2.5-Coder-14B y una versión "abliterated" (sin censura) de Qwen2.5-14B con contexto extendido. El objetivo es combinar la alta densidad de lógica de programación del modelo Coder con la libertad creativa y la ausencia de restricciones del modelo abliterated, resolviendo así el trade-off habitual en modelos de tamaño medio entre capacidad técnica y versatilidad creativa. Este repositorio concreto contiene las cuantizaciones GGUF realizadas por mradermacher, lo que permite ejecutar el modelo en hardware de consumo mediante motores como llama.cpp u Ollama.

El modelo base fue desarrollado por PocketWeights y publicado bajo licencia Apache 2.0. La cuantización GGUF mantiene la arquitectura original (Transformer decoder-only de la familia Qwen2.5) y ofrece múltiples niveles de compresión, desde Q2_K (5,9 GB) hasta Q8_0 (15,8 GB), facilitando su despliegue en entornos con recursos limitados. Al estar etiquetado como "uncensored" y "abliterated", está orientado a usos donde se requiere generación de contenido sin filtros, aunque esto conlleva riesgos adicionales.

La relevancia actual de este modelo radica en que proporciona una alternativa de código abierto para desarrolladores que necesitan un asistente de programación capaz de manejar tareas creativas y técnicas sin las restricciones habituales de los modelos comerciales, y que además puede ejecutarse localmente con cuantizaciones eficientes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 14 770 033 664 (14,77 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base indica "contexto extendido", pero no se especifica el número exacto de tokens) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base original) |

## Arquitectura y entrenamiento

El modelo base es una fusión realizada con el algoritmo DARE-TIES, que combina los pesos de Qwen2.5-Coder-14B (especializado en generación de código) con los de una versión "abliterated" de Qwen2.5-14B, a la que se le ha eliminado la alineación de seguridad (uncensored). El proceso de fusión inyecta la lógica de programación de alta densidad del modelo Coder en la base abliterated, manteniendo la arquitectura original de Qwen2.5 (Transformer decoder-only con atención de múltiples cabezas). No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas como RLHF o DPO. La cuantización GGUF posterior, realizada por mradermacher, no modifica la arquitectura, solo comprime los pesos para reducir el tamaño y acelerar la inferencia.

## Capacidades

- Generación de código fuente en múltiples lenguajes, heredada de Qwen2.5-Coder-14B.
- Razonamiento técnico y resolución de problemas de programación.
- Creatividad en texto libre, potenciada por la eliminación de restricciones de contenido.
- Generación de contenido sin censura (abliterated), lo que permite explorar temas que otros modelos bloquean.
- Contexto extendido (no especificado), útil para conversaciones largas o documentos extensos.
- Soporte de tool calling y function calling: no confirmado explícitamente, pero probablemente heredado de Qwen2.5-Coder-14B, que sí lo incluye. No hay documentación al respecto en la información disponible.
- Capacidades multilingües: no confirmadas; la model card indica solo inglés.

## Casos de uso

- Asistente de programación local: el modelo puede integrarse en entornos de desarrollo (VS Code, Neovim) mediante servidores compatibles con GGUF (llama.cpp, Ollama) para autocompletar código, generar funciones y explicar fragmentos, aprovechando su especialización en código.
- Generación de scripts de automatización: útil para crear scripts de shell, Python o PowerShell para tareas de administración de sistemas, gracias a su capacidad de razonamiento técnico.
- Creación de contenido creativo sin restricciones: al ser abliterated, puede generar narrativas, diálogos o ideas para proyectos que requieran libertad temática, como escritura de ficción o guiones.
- Documentación técnica automatizada: puede redactar comentarios, docstrings y manuales a partir de código fuente, reduciendo el trabajo manual de los desarrolladores.
- Prototipado rápido de aplicaciones: con la cuantización Q4_K_M (9,1 GB) cabe en una GPU de 12 GB, permitiendo iterar sobre ideas de software sin depender de APIs externas.
- Educación y aprendizaje de programación: puede explicar conceptos, depurar errores y proponer ejercicios, funcionando como tutor personalizado en entornos sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni otras pruebas estandarizadas para este modelo específico. Se recomienda evaluar el modelo en el caso de uso concreto antes de su adopción en producción.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización (tamaño de archivo + overhead de ejecución):
  - Q2_K (5,9 GB): requiere al menos 8 GB de VRAM (p. ej., RTX 3060, RTX 4060).
  - Q4_K_M (9,1 GB): requiere al menos 12 GB de VRAM (p. ej., RTX 4070, RTX 3080).
  - Q8_0 (15,8 GB): requiere al menos 20 GB de VRAM (p. ej., RTX 4090, A5000).
- GPUs recomendadas: NVIDIA RTX 3060/4060 (para cuantizaciones pequeñas), RTX 4090 o A100 (para cuantizaciones grandes).
- En CPU: es posible ejecutar las cuantizaciones más pequeñas con suficiente RAM (16 GB o más), aunque la latencia será mayor.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui (con backend llama.cpp). vLLM no soporta GGUF nativamente, pero se puede convertir a safetensors si se necesita.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Especialización |
|---|---|---|---|---|---|
| PocketWeights-Qwen2.5-14B-Coder-Creative (GGUF) | 14,77 B | No disponible | Apache 2.0 | GGUF | Código + creatividad sin censura |
| Qwen2.5-Coder-14B-Instruct (original) | 14,77 B | 32 K (típico de Qwen2.5) | Apache 2.0 | Safetensors | Código, con alineación |
| Qwen2.5-14B-Instruct | 14,77 B | 32 K | Apache 2.0 | Safetensors | Instrucciones generales, con alineación |

No se dispone de datos de rendimiento comparativo. La principal diferencia es la eliminación de la alineación de seguridad en el modelo de PocketWeights, lo que lo hace inadecuado para aplicaciones que requieran moderación de contenido, pero adecuado para usos creativos sin restricciones.

## Limitaciones y advertencias

- Al ser un modelo "abliterated" (sin censura), puede generar contenido ofensivo, ilegal o dañino. No debe utilizarse en aplicaciones donde se requiera control de contenido.
- Riesgo de alucinación: como todo modelo de lenguaje, puede inventar información, especialmente en tareas de razonamiento complejo o código.
- La longitud de contexto no está especificada; aunque se indica "contexto extendido", no se garantiza un valor concreto, lo que puede afectar a tareas que requieran ventanas largas.
- Solo se ha confirmado el idioma inglés; el rendimiento en otros idiomas es incierto.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener atribuciones de terceros (Qwen2.5) que también son Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- No hay benchmarks publicados, por lo que el rendimiento real en tareas específicas debe validarse empíricamente.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K) pueden degradar significativamente la calidad de las respuestas, especialmente en tareas de código.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/PocketWeights-Qwen2.5-14B-Coder-Creative-GGUF
- Modelo base: https://huggingface.co/PocketWeights/PocketWeights-Qwen2.5-14B-Coder-Creative
- Blog de Qwen2.5: https://qwen.ai/blog?id=qwen2.5

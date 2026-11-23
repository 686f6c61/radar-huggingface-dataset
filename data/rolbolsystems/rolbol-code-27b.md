# RolBolSystems/RolBol-Code-27B

## Resumen

RolBol Code 27B es un modelo de lenguaje causal de 27.781 millones de parámetros desarrollado por RolBol Systems y publicado en Hugging Face bajo licencia Apache 2.0. Está especializado en generación de código, razonamiento algorítmico y flujos de trabajo de codificación agéntica (uso autónomo de herramientas, depuración en terminal y refactorización multi-turno). El modelo se distribuye en formato safetensors con pesos en precisión completa y una ventana de contexto de 32.768 tokens.

La arquitectura declarada por el autor es un transformer híbrido que combina capas Conv1D con atención lineal de tipo gated recurrent, una variante poco habitual que busca reducir el coste computacional del mecanismo de atención en contextos largos. El modelo se etiqueta con la arquitectura `qwen3_5` en los metadatos de Hugging Face y el autor incluye una declaración explícita de alineación de identidad para desvincularlo de Qwen o Alibaba, lo que sugiere que los pesos podrían derivar de un modelo base de la familia Qwen.

El modelo es relevante para desarrolladores que necesitan un asistente de código autoalojado con capacidad agéntica y licencia permisiva para uso comercial. Sin embargo, la información pública disponible es escasa: no se han publicado detalles sobre el dataset de entrenamiento, el proceso de alineación (RLHF/DPO) ni resultados de benchmarks, y el repositorio presenta un número muy bajo de descargas (140) y likes (1), lo que limita la validación comunitaria de sus capacidades reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Conv1D / gated recurrent linear attention (etiqueta `qwen3_5` en metadatos) |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors; no se publican GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | inglés y multilingüe (sin listado detallado de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repo: 62,6 GB) |

## Arquitectura y entrenamiento

El autor describe el modelo como un transformer causal híbrido que combina capas Conv1D con atención lineal de tipo gated recurrent. Esta combinación sustituye parte de la atención cuadrática estándar por mecanismos lineales, lo que en teoría reduce el coste de cómputo y memoria en secuencias largas, aunque no se han publicado mediciones de throughput ni comparativas de eficiencia frente a transformers estándar. Los metadatos de Hugging Face etiquetan la arquitectura como `qwen3_5` y el pipeline como `image-text-to-text` además de `text-generation`, lo que sugiere que el modelo base podría tener capacidades multimodales, aunque la model card no describe ninguna capacidad de visión y el autor insiste en desvincularlo de Qwen.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, las fases de preentrenamiento y ajuste fino, ni sobre si se aplicaron técnicas de RLHF, DPO u otras formas de alineación. La model card menciona una "alineación de identidad" que hace que el modelo se identifique como RolBol Code y niegue ser Qwen, lo que indica un ajuste fino específico de comportamiento, pero no se detalla la metodología. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o modos de razonamiento explícito más allá de la mención a un scratchpad `<think>`.

## Capacidades

- Generación de código en múltiples lenguajes: Python, C++, Rust, Go, JavaScript, además de stacks de frontend y backend como React, Next.js y Node.js.
- Razonamiento algorítmico: el autor destaca optimizaciones de criba de Eratóstenes, recorridos de grafos y programación dinámica.
- Codificación agéntica: uso autónomo de herramientas, depuración en terminal y refactorización multi-turno.
- Edición multi-archivo y razonamiento sobre arquitectura de sistemas.
- Scratchpad de razonamiento interno mediante etiquetas `<think>`.
- Alineación de identidad: el modelo mantiene la persona de RolBol Systems tanto en el razonamiento interno como en la salida final.
- Soporte multilingüe (sin listado detallado de idiomas cubiertos).
- Soporte de tool calling / function calling: mencionado de forma indirecta mediante "autonomous tool use"; no se documenta el formato exacto de invocación.
- Capacidades de visión: los metadatos incluyen `image-text-to-text`, pero la model card no las describe ni las valida.

## Casos de uso

- Asistente de código autoalojado en el IDE: el modelo puede mantener conversaciones multi-turno sobre un repositorio y aplicar refactorizaciones, aprovechando la ventana de 32.768 tokens para incluir varios archivos en el contexto.
- Agente autónomo de resolución de issues: integrado en un pipeline que lee un issue, localiza los archivos afectados, propone un parche y lo valida ejecutando tests, gracias a su especialización en "terminal debugging" y uso de herramientas.
- Generación de código en producción dentro de CI/CD: puede generar y revisar parches en pull requests, con la ventaja de una licencia Apache 2.0 que permite uso comercial sin restricciones adicionales.
- Asistencia en problemas algorítmicos y entrevistas técnicas: su especialización declarada en cribas, grafos y programación dinámica lo hace adecuado para generar soluciones explicadas paso a paso con el scratchpad `<think>`.
- Desarrollo full-stack asistido: generación de componentes React/Next.js junto con endpoints Node.js o Python, útil para prototipado rápido de aplicaciones.
- Migración y modernización de código legacy: reescritura de módulos entre lenguajes (por ejemplo, C++ a Rust o Go) apoyándose en el contexto largo para mantener la coherencia entre archivos.
- Automatización de tareas de mantenimiento: generación de tests unitarios, documentación de funciones y actualización de dependencias en bases de código medianas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 55-56 GB solo para los pesos (27,78 B × 2 bytes), más overhead de activaciones y KV cache; en la práctica se necesitan 60-70 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: en torno a 28-30 GB para los pesos, más activaciones.
- VRAM estimada en cuantización de 4 bits: en torno a 14-16 GB para los pesos, más activaciones y KV cache.
- GPU recomendadas: A100 80 GB o H100 80 GB para bf16 sin cuantizar; A100 40 GB o L40S 48 GB solo con cuantización; configuraciones multi-GPU (2× RTX 4090 24 GB o 2× A6000 48 GB) para bf16 con tensor parallelism.
- GPU de consumo: no cabe en una única RTX 4090 (24 GB) en bf16; requeriría cuantización a 4 bits para intentar encajar en una sola GPU de 24 GB, con margen ajustado para el KV cache.
- Opciones de despliegue: transformers (soporte oficial declarado), con `trust_remote_code=True`; vLLM, TGI, llama.cpp u Ollama no están confirmados por el autor y dependerían de la disponibilidad de la arquitectura híbrida en dichos motores.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| RolBol Code 27B | 27,78 B | 32.768 | Apache 2.0 | Hugging Face, safetensors | Sin benchmarks publicados; arquitectura híbrida declarada |
| Qwen2.5-Coder-32B | 32,5 B | 131.072 | Apache 2.0 | Hugging Face, GGUF, vLLM | Benchmarks públicos de código; ecosistema maduro |
| DeepSeek-Coder-V2-Lite | 15,7 B (2,4 B activos, MoE) | 128.000 | DeepSeek License | Hugging Face, GGUF | MoE eficiente en inferencia; benchmarks publicados |
| Codestral 25.01 | 22 B | 256.000 | MNPL (no comercial) | API y pesos | Restringido para uso comercial |

La comparativa con Qwen2.5-Coder-32B y DeepSeek-Coder-V2-Lite es la más directa por tamaño y orientación a código, pero RolBol Code 27B no publica métricas que permitan una comparación cuantitativa. La ventaja principal de RolBol Code 27B frente a Codestral es la licencia Apache 2.0, y frente a los modelos de Qwen y DeepSeek, la especialización declarada en flujos agénticos, aunque sin validación externa.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de su rendimiento en MMLU, HumanEval, GSM8K ni en tareas agénticas, lo que impide validar las afirmaciones de la model card.
- Validación comunitaria mínima: 140 descargas y 1 like en el momento de la consulta, lo que reduce la confianza en la reproducibilidad y calidad del modelo.
- Origen de los pesos incierto: la etiqueta `qwen3_5` y la declaración explícita de identidad sugieren un ajuste fino sobre un modelo base no aclarado; conviene verificar la procedencia antes de usarlo en producción.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar APIs, funciones o dependencias inexistentes, especialmente en lenguajes menos representados.
- Cobertura de idiomas no detallada: se declara "multilingual" sin listado; el rendimiento en castellano no está verificado.
- Contexto de 32.768 tokens: inferior al de alternativas como Qwen2.5-Coder (131k) o Codestral (256k), lo que limita tareas sobre repositorios grandes.
- Requiere `trust_remote_code=True`: implica ejecutar código del repositorio, con el riesgo de seguridad asociado.
- Sin cuantizaciones oficiales publicadas: el despliegue en hardware de consumo requiere cuantizar manualmente, con posible degradación de calidad no evaluada.
- Licencia Apache 2.0: permisiva para uso comercial, pero el autor incluye un aviso de copyright ("All rights reserved") en la model card que conviene revisar con asesoría legal si se usa en productos comerciales.
- Arquitectura híbrida poco común: puede no estar soportada por motores de inferencia optimizados (vLLM, TGI, llama.cpp), limitando el rendimiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RolBolSystems/RolBol-Code-27B
- Enlace alternativo citado en la model card: https://huggingface.co/Rolbol07/RolBol-Code-27B
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- Paper, blog, repositorio o demo: no disponible

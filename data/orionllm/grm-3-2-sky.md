# OrionLLM/GRM-3.2-Sky

## Resumen

GRM-3.2-Sky es el modelo insignia de OrionLLM, un fine-tune del modelo base deepreinforce-ai/Ornith-1.0-35B, diseñado específicamente para tareas agénticas de largo horizonte y problemas de razonamiento extremadamente difíciles. Según la model card del autor, el modelo está optimizado para mantener coherencia, calidad de planificación y fidelidad a la tarea a lo largo de workflows multi-paso, superando a su predecesor GRM-2.6-Plus en estos escenarios. La arquitectura se basa en Qwen 3.5 MoE (según las etiquetas del repositorio) y el pipeline declarado es image-text-to-text, lo que indica capacidad para procesar tanto imágenes como texto. El repositorio ocupa 70.2 GB en formato safetensors y la licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas.

El modelo se posiciona como una alternativa open source a modelos propietarios de frontera como GPT-5.6-Luna, Sonnet 5 o Gemini 3 Pro, con resultados competitivos en benchmarks de conocimiento, razonamiento y código, aunque con una base de usuarios aún reducida (1045 descargas, 36 likes). Su fecha de creación es julio de 2026, por lo que es un lanzamiento reciente dentro del ecosistema de modelos abiertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE basada en Qwen 3.5 (tag qwen3_5_moe) |
| Parametros totales | no disponible (el dato 664.944 no especifica unidad; el modelo base es de 35B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se basa en un modelo MoE derivado de Qwen 3.5, según las etiquetas del repositorio. El modelo base declarado es deepreinforce-ai/Ornith-1.0-35B, un modelo de 35 mil millones de parámetros sobre el cual OrionLLM ha realizado un fine-tune orientado a tareas agénticas de largo horizonte y razonamiento complejo. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens utilizados, ni si se aplicaron técnicas como RLHF o DPO. La model card menciona que el modelo está optimizado para mantener el estado del objetivo a lo largo de interacciones extendidas, lo que sugiere un entrenamiento específico en escenarios de agente multi-paso, aunque no se especifican los métodos concretos.

El pipeline declarado es image-text-to-text, lo que implica que el modelo puede procesar entradas multimodales (imagen y texto) y generar texto. No se detalla si la capacidad visual es nativa del modelo base o si se añadió durante el fine-tune.

## Capacidades

- Generación de texto y razonamiento paso a paso para problemas difíciles de código, matemáticas avanzadas y lógica.
- Soporte de tareas agénticas de largo horizonte: mantiene coherencia y planificación a lo largo de múltiples pasos de uso de herramientas, planificación y autocorrección.
- Capacidad de codificación robusta: manejo de codebases complejos, tareas multi-archivo, depuración, refactorización y sesiones de terminal/agente de larga duración.
- Razonamiento lógico consistente con múltiples restricciones, sin perder el hilo de pasos intermedios.
- Procesamiento de imágenes y texto (pipeline image-text-to-text), aunque no se detallan las capacidades visuales específicas.
- No se menciona explícitamente soporte de tool calling o function calling, pero la orientación a tareas agénticas sugiere que puede integrarse en flujos de agente con herramientas externas.

## Casos de uso

- Agentes autónomos de navegación web: el modelo puede planificar y ejecutar secuencias largas de acciones (clic, relleno de formularios, extracción de datos) manteniendo el objetivo inicial, gracias a su optimización para tareas agénticas de largo horizonte.
- Asistente de programación multi-archivo: útil para refactorizar un proyecto completo, depurar errores en varios ficheros o gestionar sesiones de terminal prolongadas, donde la coherencia contextual es crítica.
- Resolución de problemas matemáticos avanzados: puede abordar problemas de olimpiadas (AIME, HMMT) con razonamiento estructurado y paso a paso, adecuado para plataformas educativas o herramientas de investigación.
- Análisis de documentos técnicos con imágenes: al ser image-text-to-text, puede procesar diagramas, gráficos o capturas de pantalla junto con texto para responder preguntas complejas sobre documentación técnica.
- Automatización de pruebas de software: integrado en pipelines de CI/CD, puede generar casos de prueba, analizar fallos y proponer correcciones en repositorios grandes.
- Investigación académica: apoyo en la revisión de artículos científicos, generación de hipótesis y razonamiento lógico sobre problemas multi-constraint.

## Benchmarks y rendimiento

Los siguientes datos provienen de la model card del autor (no verificados de forma independiente). Se muestran los valores disponibles:

| Benchmark | GRM-3.2-Sky | GRM-2.6-Plus | GPT-5.6-Luna | Sonnet 5 | Gemini 3 Pro |
|---|---|---|---|---|---|
| MMLU-Pro | 89.5 | 86.8 | — | — | 89.8 |
| MMLU-Redux | 96.9 | 94.2 | — | — | — |
| GPQA Diamond | 90.6 | 88.3 | 92.3 | — | 91.9 |
| LiveCodeBench v6 | 87.7 | 84.8 | — | — | 82.9 |
| HMMT Feb 26 | 86.4 | 84.8 | — | — | — |
| AIME26 | 96.3 | 95.1 | — | — | — |

El modelo supera a su predecesor en todos los benchmarks listados y compite favorablemente con Gemini 3 Pro en MMLU-Pro y LiveCodeBench v6, aunque queda ligeramente por debajo en GPQA Diamond. No se dispone de datos para GPT-5.6-Luna ni Sonnet 5 en la mayoría de las pruebas.

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware en la información disponible.
- El tamaño del repositorio (70.2 GB en safetensors) y el modelo base de 35B sugieren que se necesita una GPU con al menos 80 GB de VRAM para inferencia en precisión completa (FP16), como una A100, H100 o RTX 6000 Ada.
- Con cuantización (por ejemplo, 8 bits o 4 bits), podría caber en GPUs de consumo como la RTX 4090 (24 GB) o la RTX 3090 (24 GB), aunque no se han publicado pesos cuantizados oficiales.
- Opciones de despliegue típicas para modelos de este tamaño incluyen vLLM, TGI o llama.cpp (si se generan pesos GGUF), pero no se confirma soporte específico.
- La latencia y el throughput dependerán del hardware y la configuración; sin datos oficiales, no se pueden estimar con precisión.

## Comparativa con modelos similares

La comparativa se basa en los benchmarks publicados por el autor y en las características declaradas:

| Modelo | Parámetros | Contexto | Licencia | MMLU-Pro | GPQA Diamond | LiveCodeBench v6 |
|---|---|---|---|---|---|---|
| GRM-3.2-Sky | ~35B (base) | no disponible | Apache 2.0 | 89.5 | 90.6 | 87.7 |
| GRM-2.6-Plus | no disponible | no disponible | no disponible | 86.8 | 88.3 | 84.8 |
| Gemini 3 Pro | no disponible | no disponible | propietaria | 89.8 | 91.9 | 82.9 |
| GPT-5.6-Luna | no disponible | no disponible | propietaria | — | 92.3 | — |

GRM-3.2-Sky se posiciona como un modelo open source competitivo frente a alternativas propietarias, con la ventaja de la licencia Apache 2.0. Sin embargo, la falta de datos sobre parámetros exactos y contexto limita una comparación más profunda.

## Limitaciones y advertencias

- No se han publicado evaluaciones independientes de sesgos, alucinaciones o comportamientos adversos; los benchmarks provienen exclusivamente del autor.
- El número de parámetros totales no está claramente especificado (el dato 664.944 carece de unidad), lo que dificulta estimar requisitos de hardware con precisión.
- No se detalla la longitud de contexto soportada, un factor crítico para tareas agénticas de largo horizonte.
- Los idiomas soportados no están documentados; se desconoce si el modelo funciona bien fuera del inglés.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo es reciente y tiene una adopción limitada, por lo que puede haber problemas no detectados en producción.
- La capacidad multimodal (image-text-to-text) no está detallada; no se especifican los formatos de imagen admitidos ni la calidad del procesamiento visual.
- No se confirma soporte nativo de tool calling o function calling, a pesar de la orientación agéntica declarada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OrionLLM/GRM-3.2-Sky
- Colección de modelos GRM: https://huggingface.co/collections/OrionLLM/grm-32
- Demo de chat (enlace proporcionado en la model card): https://grape.skinnertopia.com/chat

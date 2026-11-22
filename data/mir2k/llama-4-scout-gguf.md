# Mir2k/Llama-4-Scout-GGUF

## Resumen

Llama-4-Scout-GGUF es un repositorio de cuantizaciones GGUF del modelo Llama 4 Scout, publicado por el usuario Mir2k en Hugging Face bajo licencia Apache 2.0. El repositorio no contiene un modelo original, sino conversiones a formato GGUF (Q4_K_M, Q5_K_M y Q8_0) generadas con `llama.cpp`, pensadas para facilitar la ejecución del modelo en entornos con recursos limitados mediante herramientas como llama.cpp, Ollama o LM Studio.

La información disponible es muy escasa: la model card es una nota breve en francés que indica que las cuantizaciones están "en preparación" y que se verifican mediante generación real antes de su publicación. No se proporcionan detalles sobre la arquitectura del modelo base, el número de parámetros, la longitud de contexto, los idiomas soportados ni resultados de benchmarks.

Llama 4 Scout es, según la información pública de Meta, un modelo de arquitectura Mixture of Experts (MoE) con 17 mil millones de parámetros activos y una ventana de contexto muy amplia, pero estos datos no aparecen en la información proporcionada en este repositorio, por lo que se indican como "no disponible" cuando no se pueden confirmar desde la fuente consultada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Llama 4 Scout, MoE según información pública de Meta, no confirmado en este repositorio) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q8_0 (en preparación) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura, los datos de entrenamiento ni el proceso de alineación (RLHF/DPO) en la información proporcionada. La model card del repositorio únicamente describe el proceso de cuantización: las conversiones GGUF se generan con `llama.cpp` y se verifican mediante generación real antes de su publicación, lo que indica un control de calidad básico del artefacto, pero no aporta detalles sobre el modelo base.

El repositorio es una conversión de pesos, no un modelo entrenado. Cualquier afirmación sobre arquitectura MoE, número de parámetros o contexto debe remitirse a la documentación oficial de Meta para Llama 4 Scout, que no forma parte de la información proporcionada.

## Capacidades

- No se detallan capacidades específicas en la información proporcionada.
- Al tratarse de una cuantización de Llama 4 Scout, se heredarían las capacidades del modelo base (generación de texto, razonamiento, código, multilingüismo, etc.), pero no se confirman en este repositorio.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Despliegue local en hardware de consumo: las cuantizaciones Q4_K_M y Q5_K_M permiten ejecutar el modelo en GPUs con VRAM limitada mediante llama.cpp u Ollama, reduciendo el peso en memoria respecto a los pesos originales en safetensors.
- Inferencia en CPU: el formato GGUF con cuantización Q4_K_M está optimizado para ejecución en CPU, lo que permite probar el modelo en estaciones de trabajo sin GPU dedicada.
- Prototipado rápido: la disponibilidad de tres niveles de cuantización (Q4_K_M, Q5_K_M, Q8_0) permite ajustar el equilibrio entre calidad y consumo de memoria según el caso.
- Evaluación comparativa de cuantizaciones: útil para medir la degradación de calidad entre Q4_K_M, Q5_K_M y Q8_0 en tareas concretas antes de elegir una para producción.
- Integración en LM Studio o Ollama: el formato GGUF es directamente compatible con estas herramientas, lo que facilita flujos de trabajo de escritorio.
- Experimentación académica: permite reproducir experimentos con Llama 4 Scout en entornos con recursos moderados sin necesidad de infraestructura de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible (depende del tamaño total del modelo base, que no se especifica en este repositorio).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; depende del tamaño del modelo base y de la cuantización elegida.
- Opciones de despliegue: llama.cpp (herramienta usada para generar las cuantizaciones), Ollama, LM Studio y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Llama-4-Scout-GGUF (Mir2k) | no disponible | no disponible | Apache 2.0 | GGUF | Hugging Face (0 descargas) |
| Otras cuantizaciones GGUF de Llama 4 Scout | no disponible | no disponible | según autor | GGUF | no disponible en la información proporcionada |
| Modelos comparables de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas concretas.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes, y las cuantizaciones están indicadas como "en preparación", por lo que su disponibilidad y validez no están confirmadas.
- No se especifica el modelo base exacto ni la revisión de Llama 4 Scout utilizada, lo que impide verificar la procedencia de los pesos.
- La licencia Apache 2.0 declarada en el repositorio puede no coincidir con la licencia del modelo base de Meta; conviene verificar los términos de la licencia de Llama 4 antes de un uso comercial.
- No hay información sobre sesgos, riesgo de alucinación ni limitaciones idiomáticas.
- Al ser una cuantización, es esperable cierta degradación de calidad respecto a los pesos originales, especialmente en Q4_K_M, aunque no se aportan métricas.
- No se proporcionan instrucciones de uso, plantilla de chat ni configuración recomendada de llama.cpp.
- La model card está redactada en francés y es muy escueta, lo que dificulta la evaluación técnica del artefacto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Mir2k/Llama-4-Scout-GGUF
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.

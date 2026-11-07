# ggml-org/Mage-VL-Cowork-GGUF

## Resumen

Mage-VL-Cowork es un modelo multimodal de tipo image-text-to-text desarrollado por Microsoft, presentado como una extensión de la familia Mage, una línea de modelos ligeros orientados a investigación construidos a escala de 4B parámetros. Esta variante concreta, "Cowork", está especializada en flujos de trabajo de escritorio: aprende a combinar interacción gráfica (capturas de pantalla, clics, acciones sobre la interfaz) con control programático, lo que la orienta a casos de uso de automatización de escritorio y agentes informáticos.

El repositorio analizado aquí, `ggml-org/Mage-VL-Cowork-GGUF`, no es el modelo original sino una conversión automática a formato GGUF realizada por el equipo de ggml-org mediante su herramienta `convert`, pensada para su ejecución en llama.cpp y en la aplicación Llama. Los pesos originales en safetensors suman 4.411.424.256 parámetros (aproximadamente 4,4B), y el repositorio GGUF ocupa 17,3 GB, lo que refleja la inclusión de múltiples niveles de cuantización.

La relevancia de esta ficha radica en que permite ejecutar localmente un modelo multimodal de escala 4B especializado en computer use, con licencia Apache 2.0 y compatibilidad con endpoints, lo que facilita su integración en entornos de desarrollo sin depender de servicios en la nube. No obstante, la información publicada es escasa: no se detallan idiomas, composición del dataset ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal image-text-to-text de la familia Mage) |
| Parametros totales | 4.411.424.256 (~4,4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF cuantizado (niveles concretos no especificados en la informacion disponible) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo); safetensors en el modelo base `microsoft/Mage-VL-Cowork` |

## Arquitectura y entrenamiento

No se dispone de detalles técnicos sobre la arquitectura interna del modelo en la información proporcionada. La documentación de la familia Mage describe un enfoque de "eficiencia alineada con el códec", en el que la capacidad de representación se concentra donde está la señal, y sitúa a la familia a escala de 4B parámetros abarcando comprensión visual, generación y computer use. Mage-VL-Cowork extiende esta familia a flujos de trabajo de escritorio, aprendiendo a combinar interacción gráfica y control programático.

No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones como decodificación especulativa o atención lineal. El repositorio GGUF es una conversión automática del modelo base `microsoft/Mage-VL-Cowork` mediante la herramienta `ggml-org/convert`, y requiere una build de llama.cpp que incluya el PR https://github.com/ggml-org/llama.cpp/pull/31819.

## Capacidades

- Procesamiento image-text-to-text: acepta imágenes (capturas de pantalla) y texto como entrada y genera texto.
- Computer use y automatización de escritorio: capacidad declarada de combinar interacción gráfica (acciones sobre la interfaz) con control programático.
- Comprensión visual: la familia Mage cubre comprensión visual además de generación.
- Conversación multi-turno: el repositorio está etiquetado como `conversational`.
- Compatibilidad con endpoints: etiqueta `endpoints_compatible`, lo que facilita su despliegue como servicio.
- Plantilla de chat multimodal: el repositorio de terceros `Pragmaticl/Mage-VL-Cowork-GGUF` indica que la plantilla de chat GGUF por defecto es la plantilla multimodal original de Mage-VL-Cowork, con una alternativa basada en la plantilla oficial de Qwen3-4B-Instruct-2507.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Modo thinking, visión avanzada o audio: no disponible más allá de la entrada de imagen.

## Casos de uso

- Automatización de tareas de escritorio: el modelo puede interpretar capturas de pantalla y emitir acciones sobre la interfaz combinadas con control programático, lo que permite construir agentes que operen aplicaciones de escritorio de forma guiada.
- Agentes de computer use en local: al ejecutarse con llama.cpp y pesar ~4,4B parámetros, puede desplegarse en estaciones de trabajo sin depender de APIs externas, útil para entornos con requisitos de privacidad.
- Asistentes de soporte sobre interfaces gráficas: el modelo puede analizar la pantalla del usuario y sugerir o ejecutar pasos concretos en un flujo de resolución de incidencias.
- Pruebas automatizadas de UI: integrado en pipelines de QA, puede generar y validar secuencias de interacción sobre una aplicación a partir de capturas de pantalla.
- Extracción de información de capturas: dado su pipeline image-text-to-text, puede transcribir y estructurar contenido visible en pantallas para tareas de documentación o auditoría.
- Prototipado de investigación en modelos multimodales ligeros: su escala de 4B y licencia Apache 2.0 lo hacen adecuado para experimentación académica y ajuste fino sobre flujos de trabajo propios.
- Despliegue conversacional multimodal: gracias a la etiqueta `endpoints_compatible` y a la plantilla de chat incluida, puede servirse como endpoint conversacional que acepte imágenes y texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un modelo de ~4,4B parámetros en cuantización de 4 bits requiere del orden de 3-4 GB solo para los pesos, a lo que hay que sumar el codificador visual y el contexto; el repositorio completo ocupa 17,3 GB por incluir varias cuantizaciones.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el modelo es apto para GPUs de consumo con suficiente VRAM; no se confirman modelos concretos (RTX 4090, A100, H100) en la información disponible.
- Cabe en GPU de consumo: probable por el tamaño de parámetros, pero no confirmado explícitamente en la documentación.
- Opciones de despliegue: llama.cpp (requiere una build con el PR 31819), la aplicación Llama (`llama serve -hf ggml-org/Mage-VL-Cowork-GGUF`) y endpoints compatibles. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Mage-VL-Cowork (GGUF) | ~4,4B | no disponible | Apache 2.0 | GGUF | Especializado en computer use de escritorio |
| microsoft/Mage-VL-Cowork (base) | ~4,4B | no disponible | Apache 2.0 | safetensors | Modelo original del que deriva esta conversión |
| Pragmaticl/Mage-VL-Cowork-GGUF | ~4,4B | no disponible | no disponible | GGUF | Conversión alternativa con plantilla de chat documentada |

No se dispone de datos de rendimiento ni de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Información muy limitada: no se publican idiomas soportados, longitud de contexto, composición del dataset ni benchmarks, lo que dificulta una evaluación rigurosa previa a producción.
- Requisito de build específica: el modelo necesita una versión de llama.cpp que incluya el PR 31819; con builds anteriores puede no funcionar correctamente.
- Conversión automática: el repositorio GGUF se genera automáticamente, por lo que pueden existir diferencias de comportamiento frente al modelo original en safetensors.
- Riesgo de alucinación: no cuantificado en la documentación; en tareas de computer use, una acción incorrecta sobre la interfaz puede tener consecuencias reales.
- Sesgos: no documentados.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda verificar las condiciones del modelo base y de los componentes de terceros.
- Idiomas: al no estar documentados, no se garantiza un rendimiento adecuado en castellano u otros idiomas distintos del inglés.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ggml-org/Mage-VL-Cowork-GGUF
- Modelo base: https://huggingface.co/microsoft/Mage-VL-Cowork
- Página de la familia Mage: https://microsoft.github.io/Mage/
- Conversión GGUF alternativa: https://huggingface.co/Pragmaticl/Mage-VL-Cowork-GGUF
- Aplicación Llama: https://llama.app
- PR de llama.cpp requerido: https://github.com/ggml-org/llama.cpp/pull/31819
- Herramienta de conversión: https://github.com/ggml-org/convert

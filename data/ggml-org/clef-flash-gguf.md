# ggml-org/Clef-Flash-GGUF

## Resumen

Clef-Flash es un modelo de decisión multimodal (image-text-to-text) desarrollado originalmente por Cloudflare y distribuido en formato GGUF cuantizado por ggml-org. Con aproximadamente 9.075 millones de parámetros totales, el modelo está diseñado para un propósito específico: tomar decisiones a partir de entradas que combinan texto e imagen, y se invoca a través de un endpoint dedicado (`/v1/systemone`) en lugar de la API de chat convencional.

La relevancia de esta ficha radica en que se trata de una conversión automática del modelo original `Cloudflare/clef-flash` al formato GGUF, lo que permite ejecutarlo en el ecosistema llama.cpp y en la aplicación Llama. Es un modelo etiquetado explícitamente como "decision-model", una categoría poco habitual que lo diferencia de los LLM generativos al uso: su función no es conversar libremente, sino emitir decisiones estructuradas sobre entradas multimodales.

La información pública disponible es limitada: no se detallan los datos de entrenamiento, la composición del dataset, los idiomas soportados ni resultados de benchmarks. Esta ficha refleja únicamente lo que consta en la información proporcionada, marcando como "no disponible" todo aquello que no se ha publicado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal image-text-to-text; arquitectura interna no publicada) |
| Parámetros totales | 9.075.566.084 (~9,08 mil millones) |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF cuantizado (variantes concretas no detalladas en la información disponible) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 140,6 GB; modelo base en safetensors) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo (si es un transformer denso, un modelo multimodal con encoder visual separado, o una variante híbrida). La única indicación disponible es su pipeline `image-text-to-text`, lo que confirma que acepta imágenes y texto como entrada, y la etiqueta `decision-model`, que sugiere un diseño orientado a la clasificación o selección de opciones más que a la generación abierta.

Tampoco se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. El modelo es una conversión automática del original `Cloudflare/clef-flash` realizada con la herramienta `ggml-org/convert`, por lo que las características de entrenamiento son las del modelo base, no documentadas en esta información.

## Capacidades

- Procesamiento conjunto de imagen y texto (pipeline image-text-to-text).
- Toma de decisiones estructuradas a través del endpoint `/v1/systemone` de llama.cpp.
- Integración con el ecosistema llama.cpp mediante `llama serve`.
- Compatible con la aplicación Llama (llama.app).
- Etiquetado como `endpoints_compatible` y `conversational`, lo que indica soporte de interacción conversacional en el runtime.
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Capacidades multilingües: no disponible en la información.
- Modo thinking, visión detallada, audio: no disponible en la información (la visión está implícita por el pipeline, sin detalles).

## Casos de uso

- Clasificación multimodal automatizada: usar el modelo vía `/v1/systemone` para decidir entre categorías predefinidas a partir de una imagen y un texto de contexto, por ejemplo en triaje de tickets con captura adjunta.
- Moderación de contenido visual: evaluar imágenes junto con su descripción textual para emitir una decisión binaria o categórica sobre su idoneidad.
- Enrutamiento de peticiones en pipelines: decidir qué subsistema debe procesar una entrada multimodal (OCR, visión general, texto puro) según el contenido recibido.
- Verificación de documentos: comprobar si una imagen de documento coincide con los datos textuales declarados y emitir una decisión de validación.
- Automatización de control de calidad: inspeccionar capturas o fotos de producto y decidir si cumplen los criterios definidos en el prompt.
- Despliegue local en estaciones de trabajo: al estar en GGUF y pesar ~9 mil millones de parámetros, puede ejecutarse con llama.cpp en hardware de consumo para decisiones sensibles que no deben salir del entorno local.
- Prototipado rápido de sistemas de decisión: gracias a la licencia Apache 2.0 y a la disponibilidad en GGUF, sirve para validar flujos de decisión multimodales antes de invertir en modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para ~9,08 mil millones de parámetros en GGUF, las estimaciones habituales serían aproximadamente 18-20 GB en FP16, 10-12 GB en Q8, 6-7 GB en Q4 y 5-6 GB en Q3, aunque estas cifras son orientativas y no constan en la documentación del modelo.
- GPU recomendadas: no disponible en la información.
- Compatibilidad con GPU de consumo: no confirmada oficialmente; por tamaño, cabría esperar que las cuantizaciones bajas quepan en GPUs de consumo con 8-12 GB de VRAM, pero no está verificado.
- Opciones de despliegue: llama.cpp (`llama serve -hf ggml-org/Clef-Flash-GGUF`) y la aplicación Llama. Requiere el PR https://github.com/ggml-org/llama.cpp/pull/29831 para el endpoint `/v1/systemone`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (decision-model multimodal) en la documentación proporcionada. La comparación con alternativas como modelos VLM genéricos de tamaño similar no puede realizarse con datos verificables, por lo que se indica como no disponible.

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Clef-Flash (GGUF) | ~9,08 B | no disponible | Apache 2.0 | GGUF | decision-model multimodal |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | sin datos verificables |

## Limitaciones y advertencias

- Modelo de decisión, no de generación libre: está pensado para invocarse vía `/v1/systemone`, no mediante la API de chat estándar; usarlo de otra forma puede dar resultados incorrectos.
- Requiere una versión específica de llama.cpp (PR 29831); sin ella, el endpoint necesario no está disponible.
- Conversión automática: al haberse generado con `ggml-org/convert`, puede haber diferencias de comportamiento respecto al modelo original `Cloudflare/clef-flash`.
- Idiomas soportados no documentados: riesgo de rendimiento desigual fuera del idioma o idiomas de entrenamiento, que se desconocen.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no cuantificado; al ser un modelo de decisión, el riesgo se traduce en decisiones erróneas más que en texto inventado.
- Longitud de contexto desconocida: limita la planificación de casos de uso con entradas largas.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base original en Cloudflare/clef-flash.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad para justificar decisiones de producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ggml-org/Clef-Flash-GGUF
- Modelo base: https://huggingface.co/Cloudflare/clef-flash
- Aplicación Llama: https://llama.app
- PR requerido en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/29831
- Herramienta de conversión: https://github.com/ggml-org/convert

# regnant-io/kw5-lite-instruct

## Resumen

KW5-Lite Instruct es un modelo de lenguaje instructivo de pequeño tamaño (109,5 millones de parámetros según los pesos safetensors, o 134,1 millones según la model card al incluir embeddings), desarrollado por Regnant, una empresa de inteligencia artificial soberana con sede en Dar es Salaam (Tanzania). Está diseñado específicamente para el suajili, y su objetivo es ofrecer una alternativa autóctona a los modelos multilingües dominantes, permitiendo a instituciones y desarrolladores de la región construir aplicaciones sin depender de infraestructura externa.

El modelo es una versión afinada con LoRA del modelo base KW5-Lite Base, utilizando 22.543 ejemplos de instrucciones en suajili (unos 3,39M de tokens). Su arquitectura es un transformer decoder-only compatible con Llama, con 12 capas, 768 unidades de ocultación, 12 cabezas de atención y una ventana de contexto de 2048 tokens. Se publica en formato safetensors y su licencia no está especificada, lo que limita su uso comercial sin autorización previa.

La relevancia actual de KW5-Lite Instruct radica en su enfoque en un idioma y una región poco atendidos por los grandes modelos, y en su capacidad de ejecutarse en hardware modesto (fue entrenado en una T4). No obstante, su conocimiento factual es limitado y su ventana de contexto corta, por lo que es adecuado para tareas de generación de texto y asistencia conversacional en suajili, no para aplicaciones críticas que requieran información precisa y actualizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama-compatible decoder-only transformer: 12 capas, 768 hidden size, 2048 FFN, 12 heads, RMSNorm, RoPE, SwiGLU |
| Parametros totales | 109.529.856 (safetensors) / 134,1M según model card (incluye embeddings) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Suajili (dialecto tanzano) |
| Licencia | no especificada (la model card indica "[Specify license]") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de transformer decoder-only estándar, compatible con Llama. Incluye normalización RMSNorm, posiciones rotatorias (RoPE) y activación SwiGLU. El vocabulario es de 32.000 tokens, generado con SentencePiece. La versión instruct se obtiene mediante un ajuste fino con LoRA (r=16, α=32) sobre el modelo base KW5-Lite Base, que añade 109,5M parámetros entrenables (los pesos principales) más 24,6M de embeddings, totalizando 134,1M según la model card. El entrenamiento se realizó sobre 22.543 ejemplos de instrucciones en suajili (unos 3,39M de tokens), con 3 épocas, batch de 32, optimizador AdamW 8-bit, learning rate 2e-4, warmup de 100 pasos y programación coseno. Se utilizó precisión FP16 y el entrenamiento duró 52 minutos en una GPU NVIDIA T4. El conjunto de datos incluía ejemplos de seguimiento de instrucciones, conversaciones multi-turno, casos de seguridad y rechazo, conocimientos culturales (refranes, tradiciones) y contenido educativo.

## Capacidades

- Generación de texto en suajili con gramática fluida y correcta.
- Seguimiento de instrucciones en formato lista, párrafos y respuestas estructuradas.
- Manejo de conversaciones multi-turno mediante la plantilla de chat Llama2.
- Conocimiento cultural básico sobre Tanzania y el este de África (refranes, tradiciones, historia).
- Generación de contenido educativo y resúmenes.
- No dispone de tool calling, visión, audio ni razonamiento multi-paso avanzado.
- No se ha verificado soporte de agentes ni de decodificación especulativa.

## Casos de uso

- Asistente de preguntas y respuestas en suajili para entornos educativos: el modelo puede responder a preguntas sobre temas escolares y culturales, generando respuestas en listas o párrafos, gracias a su entrenamiento en ejemplos instructivos.
- Generación de contenido educativo: puede redactar explicaciones, resúmenes y apuntes en suajili, aprovechando su entrenamiento con contenido educativo y su capacidad de seguir instrucciones de formato.
- Interfaz conversacional en suajili: para chatbots locales o gubernamentales que atiendan consultas generales, usando la plantilla de chat multi-turno.
- Resumen de textos en suajili: puede condensar documentos o noticias en un idioma con recursos limitados, gracias a su entrenamiento con ejemplos de resumen.
- Investigación lingüística y desarrollo de corpus: sirve como base para estudios sobre el suajili tanzano, generando muestras de texto o respondiendo a consultas lingüísticas.
- Prototipado de aplicaciones con soberanía de datos: al ser un modelo pequeño y desplegable en hardware propio, permite crear soluciones sin depender de servicios en la nube externos, adecuado para instituciones que requieren control total de la información.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo describe características observadas cualitativas, como fluidez en suajili y seguimiento de instrucciones, pero no aporta métricas numéricas comparativas.

## Requisitos de hardware

- El modelo tiene 109,5M de parámetros; en FP16 ocupa aproximadamente 219 MB, en 8-bit ~110 MB y en 4-bit ~55 MB.
- Puede ejecutarse en cualquier GPU con al menos 1 GB de VRAM, incluyendo tarjetas de consumo como la NVIDIA RTX 2060, GTX 1660, o incluso en CPU con suficiente RAM.
- La inferencia es rápida: un batch de 128 tokens de generación en una T4 (16GB) tardaría menos de un segundo, aunque no se proporcionan datos oficiales de latencia.
- Opciones de despliegue: al ser un modelo compatible con Llama, puede usarse con vLLM, llama.cpp, Ollama, Transformers (con pipeline de generación) y TGI, siempre que se adapte el tokenizador.
- No requiere GPU de gama alta; una T4 o una RTX 4090 son más que suficientes.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en suajili o de tamaño similar en el contexto de la búsqueda. No se pueden ofrecer comparativas objetivas sin datos de benchmarks o modelos alternativos.

## Limitaciones y advertencias

- Conocimiento factual limitado: puede dar respuestas incompletas o genéricas ante preguntas que requieren información específica o actualizada.
- Respuestas incompletas en consultas que piden listas largas; a veces solo produce una parte de la lista solicitada.
- Entrenado únicamente en el dialecto tanzano del suajili; puede no comprender variantes de otros países (Kenia, Uganda, etc.) o vocabulario regional.
- Ventana de contexto de 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- No apto para consejos médicos, legales o financieros, ni para información en tiempo real.
- La licencia no está especificada, lo que genera incertidumbre sobre su uso comercial o modificación. Se recomienda contactar con Regnant antes de utilizarlo en producción.
- Riesgo de alucinaciones, especialmente en temas de conocimiento general o datos factuales.

## Enlaces

- Modelo en HuggingFace: [regnant-io/kw5-lite-instruct](https://huggingface.co/regnant-io/kw5-lite-instruct)
- Modelo base: [regnant-io/kw5-lite-base](https://huggingface.co/regnant-io/kw5-lite-base)
- Sitio web de Regnant: [https://www.regnant.io/](https://www.regnant.io/)
- Página de productos de Regnant: [https://www.regnant.io/products](https://www.regnant.io/products)
- Repositorio relacionado (LoRA): [qailunu/kw5-lite-swahili-lora](https://huggingface.co/qailunu/kw5-lite-swahili-lora)
- Repositorio de merge (no recomendado): [qailunu/kw5-lite-swahili](https://huggingface.co/qailunu/kw5-lite-swahili)

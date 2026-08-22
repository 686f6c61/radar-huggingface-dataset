# backpack-run/SmolLM2-135M-Instruct-GGUF

## Resumen

SmolLM2-135M-Instruct-GGUF es una distribución cuantizada en formato GGUF del modelo instructivo SmolLM2-135M-Instruct, desarrollado originalmente por HuggingFaceTB y empaquetado por el usuario backpack-run. Se trata de un modelo de lenguaje pequeño, con 134,5 millones de parámetros, diseñado para ejecutarse de forma eficiente en entornos con recursos limitados, como CPUs de propósito general, dispositivos de borde o GPUs de gama baja. Su relevancia actual radica en que permite desplegar capacidades de generación de texto y conversación en infraestructuras modestas sin depender de servicios en la nube, un requisito creciente en aplicaciones de privacidad, prototipado y computación de borde.

El modelo utiliza una arquitectura transformer estándar (LlamaForCausalLM) con una longitud de contexto de 8.192 tokens, y ha sido cuantizado en tres variantes GGUF (Q4_K_M, Q5_K_M y Q8_0) verificadas para inferencia con llama.cpp y herramientas compatibles. La licencia Apache-2.0 permite uso comercial y modificación sin restricciones significativas, lo que facilita su integración en productos. Su tamaño reducido y su bajo consumo de memoria lo convierten en una opción práctica para tareas de generación de texto sencillas, clasificación, extracción de información y asistencia conversacional básica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (Transformer) |
| Parametros totales | 134.515.008 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | Q4_K_M (100,6 MiB), Q5_K_M (106,9 MiB), Q8_0 (138,1 MiB) |
| Idiomas soportados | no disponible (el modelo base no declara idiomas en la ficha) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal estándar, con la configuración típica de SmolLM2: 135M parámetros, capas de atención y feed-forward, y un tokenizador compatible con Llama. El modelo original fue entrenado por HuggingFaceTB con un enfoque en datos de alta calidad y filtrados, aunque los detalles exactos del conjunto de datos (número de tokens, composición, etapas de RLHF o DPO) no se indican en la información proporcionada. El proceso de instrucción se ha realizado mediante fine-tuning sobre el modelo base SmolLM2-135M, orientado a seguir instrucciones y mantener conversaciones multi-turno.

La cuantización GGUF se realizó con las herramientas oficiales de llama.cpp (`convert_hf_to_gguf.py` y `llama-quantize`), preservando la integridad del tokenizador y verificando la carga e inferencia para cada paquete. No se incorporan innovaciones arquitectónicas adicionales; el valor reside en la optimización para ejecución local y en la reproducibilidad del proceso de empaquetado, con revisiones exactas registradas.

## Capacidades

- Generación de texto autónoma: produce respuestas coherentes a instrucciones y preguntas simples.
- Conversación multi-turno básica: puede mantener diálogos cortos de asistencia sin perder el contexto inmediato.
- Comprensión de instrucciones: sigue órdenes directas de formato, estilo o contenido en tareas de texto.
- Clasificación y extracción de información: útil para etiquetar, resumir o extraer entidades de textos cortos.
- Ejecución en CPU y dispositivos de baja potencia: gracias a su tamaño y cuantización, funciona sin GPU dedicada.
- Compatibilidad con ecosistema llama.cpp: integrable con herramientas como llama-cli, Ollama, Backpack y plugins de LLM como `llm-smollm2`.
- No se declara soporte de tool calling, function calling, visión o audio en la información disponible.

## Casos de uso

- Asistente conversacional embebido: un chat básico de atención al cliente integrado en una web o app móvil, donde el modelo responde preguntas frecuentes con contexto de hasta 8K tokens. Su bajo consumo permite ejecutarlo en un VPS de bajo coste o en el dispositivo del usuario.
- Generación de texto en entornos sin conexión: redacción de correos, resúmenes de documentos o borradores de contenido en aplicaciones de productividad que requieren privacidad y no pueden depender de servicios en la nube.
- Clasificación de tickets o mensajes: análisis de comentarios, emails o mensajes de soporte para etiquetar categorías o prioridades, gracias a su capacidad de seguir instrucciones de formato.
- Prototipado rápido de aplicaciones de IA: desarrollo de demos y pruebas de concepto en local con un modelo pequeño, para validar flujos de trabajo antes de escalar a modelos más grandes.
- Edge computing y dispositivos IoT: integración en dispositivos como routers, cámaras o asistentes de voz locales para generar respuestas o resúmenes sin enviar datos a la nube, cumpliendo requisitos de latencia y privacidad.
- Educación y experimentación: uso en talleres o laboratorios para enseñar conceptos de LLM, cuantización e inferencia local, gracias a su bajo requisito de recursos y su licencia abierta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de este paquete GGUF no incluye métricas de rendimiento (MMLU, HumanEval, GSM8K, etc.) para el modelo original ni para las cuantizaciones. La validación se limita a pruebas de integridad, carga, inferencia y tokenización, que pasaron correctamente para las tres cuantizaciones.

## Requisitos de hardware

- VRAM estimada: para las cuantizaciones Q4_K_M (100,6 MiB) y Q5_K_M (106,9 MiB), el uso de memoria aproximado se sitúa en torno a 1,14-1,15 GB con contexto completo; para Q8_0 (138,1 MiB), alrededor de 1,2 GB. Estas cifras son estimaciones y dependen de la longitud de contexto y la configuración de ejecución.
- GPU recomendadas: no se requiere GPU dedicada; el modelo puede ejecutarse en CPU con memoria RAM suficiente. En caso de usar GPU, cualquier tarjeta con al menos 2 GB de VRAM (p. ej., GTX 1050, RTX 3050, integradas recientes) es suficiente.
- Compatibilidad con consumer hardware: sí, cabe en cualquier ordenador portátil o de sobremesa moderno con 4 GB de RAM como mínimo.
- Opciones de despliegue: llama.cpp (llama-cli), Ollama, Backpack (con el paquete preparado), plugins como `llm-smollm2`, y cualquier framework compatible con GGUF (TGI, llama-cpp-python, etc.).
- Latencia y throughput: no se proporcionan datos exactos; en CPU de gama media se espera una velocidad de varios tokens por segundo, suficiente para aplicaciones interactivas de baja exigencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Uso tipico |
|---|---|---|---|---|---|
| SmolLM2-135M-Instruct (GGUF) | 134,5 M | 8.192 | Apache-2.0 | GGUF | CPU, edge, prototipado |
| TinyLlama-1.1B | 1,1 B | 2.048 | Apache-2.0 | GGUF | CPU, generación básica |
| Qwen2-0.5B | 494 M | 32.768 | Apache-2.0 | GGUF | CPU, contexto largo |

Nota: los datos de rendimiento comparativos (benchmarks) no están disponibles en la información proporcionada. La comparación se basa en parámetros, contexto y licencia. SmolLM2-135M es el más pequeño y ligero de los tres, adecuado para requisitos mínimos de memoria, mientras que Qwen2-0.5B ofrece mayor contexto y TinyLlama más parámetros.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos, pero al ser un modelo pequeño entrenado con datos filtrados, puede presentar sesgos de género, cultura o idioma presentes en los datos de entrenamiento.
- Riesgo de alucinación: la capacidad de razonamiento y memoria es limitada, por lo que es propenso a generar información plausible pero incorrecta, especialmente en tareas que requieren conocimiento factual o matemático complejo.
- Limitaciones de contexto: aunque admite 8K tokens, la capacidad de atención efectiva se degrada con secuencias largas; no se recomienda para tareas de razonamiento multi-paso extensas.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial y modificación, pero se debe revisar la licencia del modelo original (HuggingFaceTB/SmolLM2-135M-Instruct) para confirmar términos de atribución y distribución.
- Caveat de producción: la cuantización puede alterar la calidad de la salida; se recomienda validar el comportamiento con los casos de uso reales antes de desplegar en entornos productivos. No se ha evaluado la robustez ante ataques adversarios ni el sesgo en datos específicos.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/backpack-run/SmolLM2-135M-Instruct-GGUF
- Modelo original: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Cuantización GGUF alternativa (bartowski): https://huggingface.co/bartowski/SmolLM2-135M-Instruct-GGUF
- Repositorio GitHub con ejemplo Q8_0: https://github.com/HackNetAyush/smollm2-135M-instruct-gguf-q8
- Plugin para LLM (Simon Willison): https://github.com/simonw/llm-smollm2
- Guía de despliegue y VRAM de SmolLM2: https://www.local-llm.net/models/smollm2/

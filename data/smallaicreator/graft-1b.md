# SmallAICreator/GRAFT-1B

## Resumen

GRAFT-1B es un modelo de chat de aproximadamente 1B de parámetros publicado por UltraLabs bajo la cuenta de HuggingFace SmallAICreator. No se entrena desde cero: se obtiene reduciendo el modelo Qwen3-1.7B mediante GRAFT, un método de encogimiento de modelos sin gradientes y de forma cerrada desarrollado por UltraLabs, al que después se aplican fases de "healing" (recuperación), destilación y ajuste conversacional. El resultado es un modelo transformer denso de unos 1.180 millones de parámetros, derivado por fine-tuning de Qwen3-1.7B.

Su propuesta de valor es el despliegue en dispositivo: se distribuye en GGUF cuantizado Q6_K con un archivo de 0,97 GB, de modo que funciona en portátiles y teléfonos sin GPU dedicada, con plantilla de chat ChatML embebida y compatibilidad con llama.cpp, Ollama y cualquier aplicación que consuma GGUF. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Es relevante ahora porque demuestra que un método de compresión cerrado puede acercarse a modelos pequeños entrenados de forma convencional: en ARC-Challenge (25-shot) iguala o supera ligeramente a Llama 3.2 1B Instruct dentro del mismo harness interno, aunque en MMLU queda unos 6 puntos por detrás. El modelo es muy reciente (publicado el 30 de septiembre de 2026 según los metadatos) y, en el momento de la captura de datos, acumulaba 0 descargas y 0 "likes", por lo que no existe validación independiente de la comunidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-1.7B; sin detalles adicionales en la informacion disponible) |
| Parametros totales | 1.180.101.632 (recuento de metadatos safetensors) |
| Longitud de contexto | no disponible; el ejemplo oficial de llama-cpp-python configura n_ctx=4096 (el modelo donante Qwen3-1.7B soporta 32.768 tokens, pero no se confirma para GRAFT-1B) |
| Tipos de cuantizacion | GGUF Q6_K (0,97 GB). No se listan otras cuantizaciones en la informacion disponible. Los benchmarks se midieron sobre pesos bf16 antes de la conversion a GGUF |
| Idiomas soportados | ingles (principal), espanol, frances, aleman, italiano y portugues |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo GRAFT-1B-Q6_K.gguf); el recuento de parametros procede de metadatos safetensors, aunque el repositorio (1,0 GB) contiene el GGUF cuantizado |
| Plantilla de chat | ChatML (embebida en el GGUF) |
| Parametros de muestreo recomendados | temperature 0.7, top-p 0.95, top-k 40, repeat penalty 1.15 |

## Arquitectura y entrenamiento

El modelo se construye en varias etapas descritas a alto nivel por el autor. Primero, Qwen3-1.7B se reduce a aproximadamente 1B de parámetros con GRAFT, un método propietario de UltraLabs descrito como "gradient-free" y de forma cerrada: no se emplea retropropagación durante la fase de encogimiento, a diferencia de lo habitual en destilación o poda con ajuste fino. Después se aplica una fase de "healing" para recuperar calidad tras la compresión, seguida de destilación y de un ajuste específico para chat. La model card proporcionada se corta al inicio del paso 2 ("Heal. A sh"), por lo que no se dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. Tampoco se especifica si el modelo conserva componentes de razonamiento (thinking mode) del donante Qwen3.

Los benchmarks publicados se midieron sobre los pesos bf16 antes de la conversión a GGUF, lo que significa que las cifras de calidad corresponden a la versión sin cuantizar y no al archivo Q6_K que se distribuye. La innovación técnica destacable es el propio método GRAFT y su eficiencia de presupuesto: el autor indica que el modelo se entrenó con un presupuesto reducido y aun así alcanza o supera a Llama 3.2 1B Instruct en una tarea de razonamiento (ARC-Challenge).

## Capacidades

- Generación de texto conversacional multi-turno con plantilla ChatML y system prompt opcional.
- Respuesta a preguntas factuales de conocimiento general con precisión limitada (véase la sección de benchmarks y limitaciones).
- Capacidad multilingüe de salida: inglés, español, francés, alemán, italiano y portugués. El autor recomienda formular las preguntas factuales en inglés para obtener la mejor precisión.
- Ejecución local en CPU y en GPU de gama baja, con un único archivo GGUF de 0,97 GB.
- Compatibilidad con servidor OpenAI-compatible mediante `llama-server --jinja`, lo que permite integrarlo como endpoint en herramientas existentes.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documentan capacidades de agente, multi-step reasoning, visión, audio ni modo "thinking" explícito.
- No se documentan capacidades específicas de generación de código ni de matemáticas avanzadas.

## Casos de uso

- Asistente conversacional en aplicaciones móviles: con 0,97 GB en Q6_K y plantilla ChatML embebida, el modelo se puede empaquetar en apps tipo PocketPal o Atomic Chat para respuestas offline sin coste de API por token.
- Asistente local en portátiles sin GPU dedicada: llama.cpp lo ejecuta en CPU, por lo que sirve para entornos de escritorio donde no hay acelerador disponible y se quiere privacidad total de los datos.
- Despliegue en entornos air-gapped: al distribuirse como GGUF único y con licencia Apache 2.0, se puede instalar en máquinas sin conexión a internet y sin dependencias de servicios en la nube.
- Servicio interno OpenAI-compatible de bajo coste: `llama-server` expone una API compatible con OpenAI, lo que permite sustituir llamadas a un proveedor externo en tareas sencillas de generación de texto y enrutamiento.
- Generación de borradores y paráfrasis de texto corto: adecuado para resúmenes breves, reescritura de frases y asistencia de redacción, siempre con revisión humana dado su tamaño.
- Respuestas multilingües de atención básica: puede responder en español, francés, alemán, italiano y portugués, útil para FAQ o mensajes de primer nivel, reservando un modelo mayor para consultas críticas.
- Pruebas y prototipado en CI: por su tamaño reducido y su distribución en un solo archivo, es viable descargarlo y ejecutarlo en runners de integración continua para tests de extremo a extremo de aplicaciones de chat.
- Componente de preprocesamiento en pipelines multiagente: clasificación de intención, normalización de consultas o generación de texto auxiliar en sistemas donde un modelo grande actúa como orquestador.

## Benchmarks y rendimiento

Todos los datos proceden de un único harness interno del autor, ejecutado de la misma forma para cada modelo de la fila. Las puntuaciones de GRAFT-1B se midieron sobre pesos bf16 antes de la conversión a GGUF.

| Benchmark | Configuracion | GRAFT-1B | Llama 3.2 1B Instruct | Qwen3-1.7B (donante) |
|---|---|---:|---:|---:|
| MMLU | 5-shot, micro avg | 40,37 | 46,20 | 60,25 |
| MMLU | 5-shot, macro avg | 40,92 | 47,04 | 62,36 |
| ARC-Challenge | 0-shot, acc_norm | 38,57 | 38,99 | 43,09 |
| ARC-Challenge | 25-shot, acc_norm | 40,78 | 40,02 | no ejecutado |
| SciQ | 0-shot, acc / acc_norm | 92,50 / 87,80 | no ejecutado | no ejecutado |

Notas del autor recogidas en la model card: por materias, los resultados de MMLU son mejores en asignaturas de conocimiento (gestión, marketing y sociología en torno a los 60 puntos) y peores en lógica formal y física universitaria. Como referencia externa, la model card de Gemma 3 1B reporta 38,4 en ARC-Challenge (25-shot), pero ese número procede del harness de Google y no es directamente comparable con la tabla anterior.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q6_K ocupa 0,97 GB. Con caché KV a 4.096 tokens, la huella total se sitúa por debajo de 2 GB (estimación, no confirmada por el autor).
- GPU recomendadas: cualquier GPU consumer con 4 GB de VRAM o más es suficiente para el GGUF Q6_K; no se requieren A100, H100 ni RTX 4090. El modelo está pensado explícitamente para portátiles y teléfonos.
- Inferencia en CPU: viable con llama.cpp; el autor no publica cifras de velocidad.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo en la información proporcionada.
- Opciones de despliegue documentadas: llama.cpp (`llama-cli` y `llama-server`), Ollama, llama-cpp-python, LM Studio, Jan, Atomic Chat y PocketPal.
- Ajuste de muestreo obligatorio: usar repeat penalty 1.15; sin él, el modelo puede reproducir literalmente texto ya presente en el contexto (logs, turnos anteriores, plantillas de prompt).
- Nota sobre Ollama: no lee los parámetros de muestreo almacenados en el GGUF, por lo que hay que fijarlos manualmente en el Modelfile o con `/set parameter`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU 5-shot (micro) | ARC-Ch. 25-shot | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GRAFT-1B | 1,18B | no disponible | 40,37 | 40,78 | Apache 2.0 | GGUF Q6_K en HuggingFace (0 descargas al capturar los datos) |
| Llama 3.2 1B Instruct | 1,24B (dato general, no aportado en la informacion disponible) | no disponible | 46,20 | 40,02 | Llama 3.2 Community License | Ampliamente desplegado |
| Qwen3-1.7B (donante) | 1,7B | 32.768 tokens (dato general del modelo donante) | 60,25 | 43,09 | Apache 2.0 | Ampliamente desplegado |
| Gemma 3 1B | 1B (dato general) | no disponible | no disponible | 38,4 (harness de Google, no comparable) | Gemma Terms of Use | Ampliamente desplegado |

Lectura de la comparativa: GRAFT-1B es competitivo con Llama 3.2 1B Instruct en ARC-Challenge (razonamiento), pero pierde alrededor de 6 puntos en MMLU (conocimiento). Frente a su modelo donante Qwen3-1.7B queda claramente por debajo en ambas métricas, lo que es esperable dado que el donante conserva un 44% más de parámetros y no ha sufrido compresión. La ventaja de GRAFT-1B no es la calidad bruta, sino el tamaño del artefacto distribuido y la licencia permisiva.

## Limitaciones y advertencias

- Alucinación factual documentada por el propio autor: en el ejemplo de la model card sobre el sistema solar, el modelo afirma que Júpiter "contiene más agua que todos los demás planetas juntos", un dato inventado. Es un comportamiento típico de un modelo de 1B.
- Riesgo de copia literal: sin repeat penalty de 1.15, el modelo puede reproducir palabra por palabra texto ya presente en el contexto, incluidos prompts de sistema o registros. Es un problema de seguridad si se manejan datos confidenciales en la ventana de contexto.
- Rendimiento desigual por materia: los peores resultados de MMLU corresponden a lógica formal y física universitaria; no es fiable para tareas de razonamiento formal o cálculo.
- Idiomas: el inglés es el idioma principal y el autor recomienda formular las preguntas factuales en inglés para obtener la mejor precisión, lo que implica un rendimiento inferior en el resto de idiomas declarados.
- Contexto no confirmado: la ficha no especifica la longitud de contexto soportada; el ejemplo oficial usa 4.096 tokens. No se debe asumir el contexto de 32.768 tokens del modelo donante.
- Sin capacidades de tool calling ni de agente documentadas: no es adecuado para pipelines que dependan de function calling o razonamiento multi-paso con herramientas.
- Benchmarks no reproducibles de forma independiente: todas las cifras proceden de un harness interno del autor, sin evaluación de terceros.
- Madurez: 0 descargas y 0 "likes" en el momento de la captura, con una model card que parece incompleta (el apartado de construcción se corta). No hay evidencia de uso en producción.
- Licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero la procedencia del modelo donante (Qwen3-1.7B, también Apache 2.0) debe verificarse si se redistribuye.
- Atribución de datos: los tags indican que la relación con el modelo base es de fine-tuning, no de un modelo entrenado desde cero; conviene conservar la atribución a Qwen en redistribuciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SmallAICreator/GRAFT-1B
- Perfil del autor en HuggingFace: https://huggingface.co/SmallAICreator
- Modelo donante Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Listado de modelos de SmallAICreator en Essa Mamdani: https://essamamdani.com/ai-models/company/smallaicreator
- Recopilatorio awesome-free-models (referencia secundaria, sin información técnica sobre GRAFT-1B): https://github.com/12britz/awesome-free-models

No se han encontrado en la búsqueda web papers, blogs tecnicos ni repositorios adicionales que documenten el metodo GRAFT o el proceso de entrenamiento de GRAFT-1B.

# Housto4/uadetox-e2b

## Resumen

UADetox E2B es un modelo de generación de texto especializado en la reescritura de comentarios tóxicos en ucraniano hacia un registro culto y literario, preservando el sentido y la postura original del comentario. Lo desarrolla Housto4 como un fine-tune de `google/gemma-4-E2B-it-qat-q4_0-unquantized`, la versión instruction-tuned de Gemma 4 E2B con cuantización QAT Q4_0 de Google. El modelo resuelve un problema concreto de moderación y UX: ofrecer al usuario una sugerencia de reescritura educada antes de publicar, en lugar de bloquear o eliminar el mensaje.

La relevancia del modelo está en su despliegue: es un único archivo GGUF de 1,84 GB que corre en un teléfono o en una CPU de cuatro núcleos con llama.cpp, lo que permite integrarlo en teclados, bots de chat o herramientas de moderación sin depender de la nube. El modelo tiene 2.802.968.867 parámetros totales y está entrenado exclusivamente para ucraniano (`uk`), con licencia Apache 2.0.

Técnicamente combina SFT con LoRA, destilación on-policy desde un profesor Gemma 4 31B y una reducción del vocabulario de 262.144 a 88.211 tokens, que reduce el archivo de 3,35 GB a 1,84 GB manteniendo el 84% de las reescrituras idénticas token a token respecto al modelo con vocabulario completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4 E2B, instruction-tuned, QAT Q4_0) |
| Parametros totales | 2.802.968.867 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el ejemplo de despliegue usa `-c 1024`) |
| Tipos de cuantizacion | Q4_0 en pesos del transformer, Q6_K en embeddings; adaptador LoRA en PEFT para inferencia en GPU |
| Idiomas soportados | ucraniano (`uk`) |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4) |
| Formato de pesos | GGUF (archivo único), safetensors (adaptador LoRA), tokenizer Hugging Face |
| Tamano del repositorio | 2,2 GB |
| Tamano del archivo GGUF | 1,84 GB |
| Vocabulario | 88.211 tokens (recortado desde 262.144) |
| Rango del adaptador | LoRA rank 64 (todas las proyecciones de atención y MLP) |
| Modelo base | google/gemma-4-E2B-it-qat-q4_0-unquantized |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 E2B en su variante instruction-tuned con cuantización QAT Q4_0. Sobre esa base se aplica un adaptador LoRA de rango 64 que cubre todas las proyecciones de atención y MLP. El entrenamiento se organiza en cinco fases: primero un SFT sobre los datos de UADetox (comentario → reescritura literaria, con el comentario solo como prompt, learning rate 4e-4, una época); después se entrena un profesor Gemma 4 31B con LoRA sobre 15.000 filas de entrenamiento, indicando el subestilo objetivo en el prompt.

La fase central es una destilación on-policy en dos rondas de 12.000 comentarios: el estudiante muestrea una reescritura, el profesor puntúa cada token (top-20) y el estudiante se entrena hacia la distribución del profesor más 0,2 veces la pérdida sobre la reescritura de referencia. El forward de entrenamiento aplica el redondeo Q4_0 exacto de los pesos fusionados, de modo que el estudiante aprende pesos que sobreviven a la cuantización. Finalmente se fusiona el adaptador en los pesos QAT Q4_0 de Google redondeando cada peso adaptado a Q4_0, y se recorta el vocabulario a 88.211 tokens (todo el cirílico, tokens no alfabéticos, todos los usados por los datos de entrenamiento y los latinos más frecuentes). El prompt de inferencia es el comentario como turno de usuario, sin system prompt y con thinking desactivado, decodificación greedy y parada en `<turn|>`.

## Capacidades

- Reescritura de comentarios tóxicos en ucraniano hacia un registro culto y literario, conservando el sentido y la postura del original.
- Transferencia de estilo hacia el registro de la literatura clásica ucraniana.
- Generación de texto conversacional de un solo turno (el prompt es el comentario; no está pensado para diálogo multi-turno).
- Ejecución on-device: funciona en teléfono o CPU de cuatro núcleos con llama.cpp.
- Compatible con endpoints de chat completions y de completion de llama.cpp.
- Distribución del adaptador LoRA para reentrenamiento o inferencia en GPU.
- No soporta tool calling, function calling, agentes, visión ni audio según la información disponible.
- Capacidad multilingüe limitada al ucraniano; otros idiomas están fuera del alcance declarado.

## Casos de uso

- Moderación asistida en foros y redes: el modelo genera una propuesta de reescritura educada que el usuario decide aceptar o no, reduciendo la fricción frente al bloqueo directo. Es adecuado por su tamaño reducido y su latencia en CPU.
- Teclados y correctores en móvil: al ser un GGUF de 1,84 GB, puede integrarse en una app Android o iOS con llama.cpp y ofrecer la sugerencia de reescritura localmente, sin enviar el texto del usuario a un servidor.
- Bots de chat en Telegram: el autor publica `@uadetoxbot` como ejemplo; el modelo reescribe el comentario recibido y devuelve la versión literaria en el mismo hilo.
- Investigación en detoxificación y transferencia de estilo para ucraniano: el adaptador LoRA y el dataset UADetox permiten reproducir el pipeline y comparar con el profesor Gemma 4 31B.
- Preprocesado en pipelines de moderación: combinado con un clasificador como `Housto4/uadetox-gate`, que decide qué comentarios necesitan reescritura, el modelo solo se invoca sobre los candidatos, ahorrando cómputo.
- Herramientas editoriales para comunidades ucranianas: sugerir una versión culta de comentarios antes de publicarlos en blogs o medios, manteniendo la opinión del autor.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse en local, el texto no sale del dispositivo, lo que encaja con moderación en contextos sensibles.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre el split de validación de UADetox (1.966 comentarios) y el split de test held-out (1.000 comentarios), juzgados por un LLM juez fijado:

| Sistema | Good, % | Toxicity left, % | Meaning lost, % | Fluency errors, % | Not literary, % |
|---|---|---|---|---|---|
| uadetox-e2b (dev, 1.966) | 59,5 | 4,4 | 38,0 | 32,0 | 11,0 |
| uadetox-e2b (test, 1.000) | 59,0 | 4,5 | 42,6 | no disponible | no disponible |

El autor reporta además que el 84% de las reescrituras de dev son idénticas token a token respecto al modelo con vocabulario completo. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF ocupa 1,84 GB; en CPU se ejecuta en RAM, y en GPU cabe en tarjetas con 2-3 GB de VRAM libre en Q4_0.
- GPU recomendadas: cualquier GPU consumer con al menos 3 GB de VRAM (por ejemplo, GTX 1650, RTX 3050 en adelante); en A100 o H100 el modelo está sobredimensionado para la GPU y el cuello de botella será el ancho de banda.
- Cabe en consumer GPU y en móvil: el autor lo describe como apto para teléfono o CPU de cuatro núcleos.
- Opciones de despliegue: llama.cpp (`llama-server`), con plantilla de chat y `--chat-template-kwargs '{"enable_thinking":false}'`; el adaptador LoRA permite inferencia en GPU con PEFT.
- Latencia y throughput: no disponibles en la información proporcionada; el autor indica que el recorte de vocabulario acelera la decodificación, pero no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| uadetox-e2b | 2.803 M | no disponible | Detoxificación ucraniana on-device (GGUF) | Apache 2.0 | Hugging Face, demo, bot |
| google/gemma-4-E2B-it-qat-q4_0-unquantized | no disponible | no disponible | Modelo base instruction-tuned, multilingüe | Licencia Gemma 4 | Hugging Face |
| Gemma 4 31B (profesor del pipeline) | no disponible | no disponible | Modelo grande usado como profesor en destilación | Licencia Gemma 4 | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros modelos de detoxificación en la información proporcionada.

## Limitaciones y advertencias

- El modelo siempre reescribe, incluso comentarios que ya son educados; debe combinarse con un clasificador de entrada como `uadetox-gate`.
- Solo soporta ucraniano; su uso en otros idiomas está fuera del alcance declarado.
- Tasa de pérdida parcial de significado del 38-42,6% según el juez LLM, y errores de fluidez del 32% en dev: la reescritura puede alterar matices del original.
- El 11% de las reescrituras no se consideran literarias en dev.
- Riesgo de alucinación y de suavizar la postura del autor; el uso previsto exige revisión humana antes de publicar.
- Los benchmarks son declarados por el autor y no están verificados (`verified: false`); el juez es un LLM fijado, no evaluación humana.
- La licencia Apache 2.0 convive con la licencia de Gemma 4 enlazada por el autor; conviene revisar los términos de uso comercial de Gemma 4 antes de producción.
- El prompt debe ser el comentario en una sola línea (colapsar saltos de línea y espacios repetidos) y la decodificación debe ser greedy con parada en `<turn|>`; desviarse puede degradar la salida.
- No está pensado para generar texto tóxico ni para alterar silenciosamente lo que escriben los usuarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Housto4/uadetox-e2b
- Dataset de entrenamiento: https://huggingface.co/datasets/Housto4/uadetox
- Clasificador de entrada: https://huggingface.co/Housto4/uadetox-gate
- Demo en vivo: https://huggingface.co/spaces/Housto4/uadetox
- Página del proyecto: https://uadetox.pp.ua
- Bot de Telegram: https://t.me/uadetoxbot
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license

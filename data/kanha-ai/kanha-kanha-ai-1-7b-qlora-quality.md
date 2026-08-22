# Kanha-AI/kanha-kanha.ai-1.7b-qlora-quality

## Resumen

Kanha-AI/kanha-kanha.ai-1.7b-qlora-quality es un fine-tuning del modelo Qwen/Qwen3-1.7B mediante QLoRA, desarrollado por Kanha-AI, una empresa que entrena chatbots personalizados y ofrece un SDK para ejecutarlos directamente en dispositivos cliente mediante WebGPU. Este checkpoint concreto es un experimento de investigación para comparar métodos de entrenamiento sobre un dataset propio derivado de contenido web, centrado en la respuesta a preguntas sobre sitios. El modelo se ha entrenado con 128 registros de entrenamiento y 24 de validación, con una longitud de secuencia máxima de 2048 tokens, y está pensado para evaluar la calidad de respuestas en entornos controlados, no como un modelo de propósito general. Su relevancia actual radica en que ejemplifica el enfoque de Kanha de generar chatbots compactos, desplegables en el navegador sin necesidad de servidores externos, reduciendo costes y latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen/Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 (1,72B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 (maximo de entrenamiento) |
| Tipos de cuantizacion | bfloat16 (pesos originales), q4f16_1 (artefacto MLC) |
| Idiomas soportados | ingles (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors (bfloat16), MLC q4f16_1 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer denso de la serie Qwen3, y se ha adaptado mediante QLoRA (Low-Rank Adaptation con cuantizacion de 4 bits). El entrenamiento se realizo con un dataset de 128 pares pregunta-respuesta generados a partir del contenido del sitio kanha.ai, con 24 registros de validacion. Se aplicaron 20 epocas, tasa de aprendizaje 2e-4, batch por dispositivo de 4 con acumulacion de gradientes de 2, warmup del 10% y una longitud de secuencia maxima de 2048 tokens. La configuracion de LoRA incluye rango 64, alpha 32 y dropout 0.05, aplicado a todas las proyecciones lineales (q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj). Se utilizo perdida solo sobre las respuestas del asistente (assistant-only loss). El resultado final se fusiono en bfloat16 y se proporcionan artefactos MLC con cuantizacion q4f16_1 para inferencia en navegador.

## Capacidades

- Generacion de texto para tareas de preguntas y respuestas sobre contenido web, especificamente del sitio de la empresa.
- Conversacion en ingles, con un formato de chat basado en el tokenizador de Qwen3.
- No se documentan capacidades de tool calling, function calling ni agentes multi-paso.
- No se especifica soporte para vision, audio u otras modalidades.
- El modelo esta limitado al ambito del dataset de entrenamiento; no se ha evaluado para tareas generales de razonamiento, matematicas o codigo.

## Casos de uso

- Atencion al cliente en sitios web: el modelo puede responder a preguntas frecuentes sobre el contenido del sitio, pero su entrenamiento es muy especifico y no debe usarse en produccion sin una evaluacion exhaustiva.
- Asistente de documentacion: puede ayudar a usuarios a navegar por la documentacion del sitio de la empresa, aunque su limitado dataset (128 registros) reduce su cobertura.
- Prototipo de chatbot on-device: gracias a los artefactos MLC con q4f16_1, se puede desplegar en el navegador mediante WebGPU, ideal para demostraciones o pruebas de concepto con bajos recursos.
- Investigacion comparativa: sirve como referencia para estudiar el efecto de QLoRA con pocos datos en tareas de QA especificas.
- Evaluacion de tecnicas de entrenamiento: su configuracion y metrica de evaluacion publicadas permiten reproducir y comparar con otros experimentos de Kanha-AI.
- Generacion de respuestas en ingles para contenido web, aunque con una tasa de respuestas no soportadas del 23%, por lo que no es adecuado para un uso general.

## Benchmarks y rendimiento

La informacion disponible no incluye benchmarks estandar (MMLU, HumanEval, GSM8K) ni comparaciones con otros modelos. En su lugar, se presentan metricas de evaluacion sobre el propio dataset de validacion:

| Metrica | Valor |
|---|---|
| dates_recall | 1.0 |
| list_recall | 0.1276 |
| numbers_recall | 0.8244 |
| refusal_rate | 0.0 |
| unsupported_value_rate | 0.2308 |
| deterministic_pass_rate | 0.0385 |
| total evaluado | 26 |

Estas metricas muestran un buen recuerdo para fechas y numeros, pero una baja tasa de paso deterministico y una alta proporcion de valores no soportados, lo que sugiere que el modelo tiene dificultades para producir respuestas consistentes y completas.

## Requisitos de hardware

- Para inferencia en bfloat16, se estiman alrededor de 3,4 GB de VRAM para los pesos (1,72B parametros x 2 bytes) mas overhead de activaciones, por lo que es viable en GPUs consumer con 8 GB de VRAM, como RTX 3080 o RTX 4070.
- Con cuantizacion q4f16_1 (MLC), el uso de VRAM se reduce a aproximadamente 1 GB, permitiendo ejecucion en tarjetas con 4 GB o incluso en CPU con suficiente RAM.
- El despliegue puede realizarse con librerias como vLLM, llama.cpp, Ollama o TGI, ademas del propio SDK de Kanha que utiliza WebGPU para ejecucion en navegador.
- La latencia y el throughput no estan publicados; se recomienda validar el modelo en el entorno objetivo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos. Este modelo es un fine-tune de Qwen3-1.7B, por lo que la comparacion natural seria con el modelo base y otros fine-tunes similares, pero no hay informacion publica sobre su rendimiento relativo. Se puede considerar que es un modelo de 1.7B con una ventana de contexto de 2048 tokens, mientras que Qwen3-1.7B base podria tener un contexto mayor (no especificado). La licencia desconocida del presente modelo limita su uso comercial, mientras que Qwen3-1.7B tiene licencia Apache 2.0 (segun informacion general, no confirmada en este contexto). Dado que no hay benchmarks, la comparativa no es posible.

## Limitaciones y advertencias

- El dataset de entrenamiento es extremadamente pequeno (128 registros) y especifico del sitio kanha.ai, por lo que el modelo no generaliza a otros dominios o tareas.
- La metrica deterministic_pass_rate es muy baja (0,0385), lo que indica que en la mayoria de las evaluaciones el modelo no produce la respuesta exacta esperada.
- El modelo puede memorizar contenido del entrenamiento y generar respuestas incorrectas, incompletas o desactualizadas.
- La licencia no esta especificada, lo que impide determinar si es apto para uso comercial y limita la redistribucion.
- El contexto maximo de 2048 tokens es limitado para conversaciones largas o documentos extensos.
- No se garantiza la calidad de las respuestas en escenarios reales; el propio autor recomienda validar el modelo en el entorno y dispositivo objetivo antes de cualquier uso en produccion.
- No hay soporte para idiomas distintos del ingles.

## Enlaces

- [HuggingFace - Kanha-AI/kanha-kanha.ai-1.7b-qlora-quality](https://huggingface.co/Kanha-AI/kanha-kanha.ai-1.7b-qlora-quality)
- [HuggingFace - organizacion Kanha-AI](https://huggingface.co/Kanha-AI)
- [GitHub - Kanha-AI/Kanha-AI](https://github.com/Kanha-AI/Kanha-AI)
- [Sitio web de Kanha.ai](https://kanha.ai)
- [Kanha AI - Voice-First Child Companion (otro producto)](https://kanhaji.ai/)

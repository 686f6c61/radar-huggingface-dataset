# kruxarth/gpt2-pirate

## Resumen

GPT-2 Pirate es un ajuste fino completo (full fine-tune) de GPT-2 small, el modelo transformer decoder-only de 124 millones de parámetros publicado originalmente por OpenAI en 2019. Lo desarrolla el usuario kruxarth como proyecto de aprendizaje y su objetivo es acotado y explícito: transferir un estilo de respuesta pirata a un modelo base que, por sí mismo, no tiene instrucciones ni formato conversacional. No es un modelo de propósito general ni compite en capacidades de razonamiento, sino una demostración controlada de cómo el post-entrenamiento modifica la forma de responder sin aportar conocimiento nuevo.

La relevancia técnica del modelo está en su honestidad metodológica: el autor documenta el proceso completo (60 pares pregunta-respuesta escritos a mano, 6 épocas, pérdida calculada solo sobre los tokens de respuesta con enmascaramiento a -100 en la pregunta) y reporta que el cambio de pesos en cualquier capa es inferior al 0,5 %. Esto lo convierte en un caso de estudio útil sobre la distinción entre conocimiento (que proviene del preentrenamiento) y estilo (que puede modificarse con muy pocos ejemplos y una perturbación mínima de los pesos).

El modelo se distribuye con licencia MIT, en formatos safetensors y ONNX, con un tamaño de repositorio de 0,7 GB y soporte únicamente para inglés. Su ventana de contexto es la nativa de GPT-2 small, 1024 tokens, y no incorpora tool calling, agentes ni capacidades multimodales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2 small), con atención causal multi-cabeza |
| Parametros totales | 124.439.808 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens (contexto nativo de GPT-2 small) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (el repo incluye safetensors y ONNX; no se documentan variantes GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2 small sin modificaciones estructurales: un transformer decoder-only con atención causal, 12 capas, dimensión oculta de 768 y 12 cabezas de atención (configuración estándar del checkpoint `openai-community/gpt2`, del que deriva directamente). No hay innovaciones arquitectónicas: ni atención lineal, ni mezcla de expertos, ni decodificación especulativa. El interés está enteramente en el procedimiento de ajuste.

El entrenamiento consistió en un fine-tune completo de los 124M de pesos con AdamW, learning rate 5e-5, batch size 8 y 6 épocas sobre un conjunto de 60 pares pregunta-respuesta escritos a mano. La pérdida se calculó exclusivamente sobre los tokens de respuesta, enmascarando los tokens de la pregunta con -100, de modo que el modelo aprende a generar la respuesta condicionada a la pregunta pero no a reproducirla. La curva de pérdida descendió de 3,45 a 1,10. El autor reporta que el cambio de pesos en cualquier capa es inferior al 0,5 %, lo que sugiere que el estilo pirata se codifica como una perturbación de baja magnitud sobre la distribución original del modelo base. No se documenta uso de RLHF, DPO ni datos de preentrenamiento adicionales.

## Capacidades

- Generación de texto en inglés con un registro estilístico pirata consistente cuando se usa el formato de prompt esperado (`Question: ...\nAnswer:`).
- Transferencia de estilo y formato de respuesta: el modelo reproduce la estructura pregunta-respuesta y el tono aprendidos, incluso ante preguntas no vistas durante el entrenamiento.
- Generación condicionada por prompt con decodificación por muestreo (temperatura y top-p configurables).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo de razonamiento explícito (thinking mode).
- No tiene capacidades de visión, audio ni multimodalidad.
- Capacidad multilingüe nula más allá del inglés: el modelo base y los datos de ajuste son exclusivamente en inglés.
- Conocimiento factual muy limitado, heredado del preentrenamiento de GPT-2 small y no reforzado por el ajuste.

## Casos de uso

- Demostración educativa de post-entrenamiento: el modelo sirve para ilustrar en clase o en un artículo cómo 60 ejemplos y un cambio de pesos inferior al 0,5 % bastan para alterar el estilo de respuesta sin tocar el conocimiento subyacente. Es su uso principal y el que el propio autor declara.
- Prueba de concepto de transferencia de estilo: se puede integrar en un pipeline que compare la salida de GPT-2 base y la del modelo ajustado sobre el mismo prompt, como hace la demo del autor, para medir el efecto del fine-tune.
- Generación de texto creativo con temática pirata: redacción de diálogos, descripciones o textos de ambientación náutica en inglés donde el tono importa más que la exactitud factual.
- Prototipado rápido de interfaces de chat con formato pregunta-respuesta: el modelo valida el formato `Question:`/`Answer:` en entornos de desarrollo antes de sustituirlo por un modelo mayor.
- Evaluación de infraestructura de despliegue: al ocupar 0,7 GB y caber en cualquier GPU consumer, sirve para probar pipelines de transformers, ONNX Runtime o text-generation-inference antes de escalar a modelos de mayor tamaño.
- Generación de datos sintéticos de estilo para aumentar un corpus: las respuestas pirata pueden usarse como material de aumento de datos para entrenar o evaluar clasificadores de estilo.
- Pruebas de regresión en sistemas de moderación o filtrado: un modelo que produce texto estilizado pero factualmente incorrecto es útil para validar que los filtros detectan alucinaciones y contenido no verificado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente incluye una comparación cualitativa antes/después sobre dos preguntas no presentes en los datos de entrenamiento (capital de Japón y por qué cantan los pájaros), sin métricas cuantitativas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación estandarizada.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB para los pesos (124M parámetros × 4 bytes), más overhead de activaciones y caché KV para 1024 tokens.
- VRAM estimada en fp16/bf16: aproximadamente 0,25 GB para los pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. Funciona en RTX 3060, RTX 4060, RTX 4090, A100 y H100 sin aprovechar su capacidad; también en GPUs integradas y en CPU.
- Cabe holgadamente en GPU consumer, incluidas las de gama baja y portátiles.
- Opciones de despliegue: transformers (soporte nativo, es la librería declarada), ONNX Runtime (el repo incluye pesos ONNX), text-generation-inference (el modelo está etiquetado como `text-generation-inference` y `endpoints_compatible`). No se documentan pesos GGUF, por lo que llama.cpp y Ollama requerirían conversión previa.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera latencia de milisegundos por token en GPU moderna y decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|---|
| kruxarth/gpt2-pirate | 124M | 1024 | en | MIT | Fine-tune de estilo sobre GPT-2 small | Hugging Face, safetensors y ONNX |
| openai-community/gpt2 | 124M | 1024 | en | MIT | Modelo base sin instrucciones | Hugging Face, safetensors |
| Modelos de instrucciones de tamano similar (p. ej. variantes TinyLlama o Phi-1.5) | 1.100M–1.300M | 2048–4096 | en (y otros) | MIT / Apache 2.0 | Post-entrenamiento con instrucciones y datos masivos | Hugging Face |
| GPT-2 medium | 355M | 1024 | en | MIT | Modelo base de mayor capacidad | Hugging Face |

La comparación relevante es con GPT-2 base: comparten arquitectura, tokenizador, contexto y licencia, y la única diferencia es el ajuste de estilo. Frente a modelos de instrucciones de mayor tamaño, GPT-2 Pirate pierde en conocimiento factual, contexto y multilingüismo, pero gana en transparencia metodológica y en coste de despliegue.

## Limitaciones y advertencias

- Alucinación factual elevada: el autor advierte explícitamente que 60 ejemplos enseñan un estilo, no conocimiento, y que las respuestas suelen ser incorrectas. GPT-2 small parte de un conocimiento muy limitado.
- Sesgos heredados del preentrenamiento de GPT-2: el modelo base se entrenó con WebText y arrastra los sesgos de ese corpus; el ajuste de estilo no los corrige y puede reforzar tópicos estereotípicos asociados a la figura del pirata.
- Contexto limitado a 1024 tokens, insuficiente para conversaciones multi-turno largas o documentos extensos.
- Solo inglés: no hay soporte para castellano ni otros idiomas, ni en el modelo base ni en los datos de ajuste.
- Formato de prompt rígido: el modelo espera `Question: ...\nAnswer:`; fuera de ese formato el comportamiento estilístico se degrada.
- Licencia MIT: permite uso comercial y modificación con atribución, pero el autor no ofrece garantías y describe el proyecto como aprendizaje, no como producto.
- Sin datos de evaluación cuantitativa: no hay benchmarks que permitan estimar su calidad frente a alternativas, lo que desaconseja su uso en producción más allá de demostraciones.
- Sin soporte de tool calling ni agentes: no es adecuado para pipelines que requieran invocación de funciones o razonamiento encadenado.
- Riesgo de reproducir texto de baja calidad o incoherente en generaciones largas, dado el tamaño del modelo y la naturaleza del ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kruxarth/gpt2-pirate
- Demo comparativa (GPT-2 base frente a GPT-2 Pirate): https://huggingface.co/spaces/kruxarth/gpt2-pirate
- Modelo base: https://huggingface.co/openai-community/gpt2

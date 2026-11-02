# FrontiersMind/Lumma-fev-4B-v2-GGUF

## Resumen

Lumma-fev-4B-v2-GGUF es la versión cuantizada en formato GGUF del modelo FrontiersMind/Lumma-fev-4b-v2, un modelo de decisión (decision model) desarrollado por FrontiersMind. A diferencia de un modelo generativo convencional, recibe un estado en texto y un conjunto de preguntas tipadas, y devuelve en un único forward pass una probabilidad para cada opción de respuesta. No genera texto, por lo que no requiere parseo de la salida. Está disponible en inglés, hindi, tamil y kannada.

El modelo es un fine-tune de pesos completos sobre Qwen3.5-4B-Base y cuenta con 4.841.450.496 parámetros totales. Esta variante GGUF está pensada para su uso con llama.cpp e incluye todas las cuantizaciones, desde Q2_K hasta BF16. El repositorio ocupa 30,1 GB e incorpora además un endpoint compatible con la API de llama-server (`/v1/systemone`) para realizar consultas de clasificación por criterios.

Su relevancia actual radica en el enfoque: sustituye la generación libre por una clasificación probabilística estructurada, lo que simplifica la integración en pipelines de decisión (enrutado, triaje, selección de acciones) y elimina la necesidad de postprocesar texto. La licencia Apache 2.0 facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen3.5-4B-Base); cabecera de decisión sobre preguntas tipadas |
| Parametros totales | 4.841.450.496 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso configura `-c 8192`) |
| Tipos de cuantizacion | Q2_K hasta BF16 (incluye todas las cuantizaciones GGUF) |
| Idiomas soportados | en, hi, kn, ta |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base, un transformer de aproximadamente 4.800 millones de parámetros, sobre el que se ha realizado un fine-tune de pesos completos. La particularidad es la formulación de la tarea: en lugar de generar tokens, el modelo recibe un estado textual y preguntas con tipo (`choice` u otras), junto con criterios e instrucciones, y produce una distribución de probabilidad sobre las opciones en un solo forward pass. Esto implica una cabecera de decisión que aprovecha la representación del prompt completo.

El autor no detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Tampoco se especifican innovaciones adicionales como decodificación especulativa o atención lineal. El modelo está diseñado para leer todo el prompt en un único lote, por lo que en llama.cpp se recomienda ajustar `-b` y `-ub` al menos a la longitud del prompt más largo.

## Capacidades

- Clasificación y decisión probabilística: devuelve una probabilidad por cada opción de una pregunta tipada en un único forward pass.
- Enrutado por criterios: permite definir categorías (por ejemplo, equipos de facturación, soporte o ventas) con descripciones y obtener la probabilidad de cada una.
- Respuesta a preguntas de tipo `choice` con instrucciones y criterios personalizados.
- Multilingüe en inglés, hindi, tamil y kannada.
- Integración con llama.cpp mediante el endpoint `/v1/systemone` de llama-server.
- No genera texto libre, lo que elimina la necesidad de parsear la salida.
- Compatible con endpoints (tag `endpoints_compatible`) y orientado a modelos de decisión conversacionales.

## Casos de uso

- Triaje de tickets de soporte: dado el texto de un cliente, el modelo asigna probabilidades a los equipos de facturación, soporte o ventas, permitiendo enrutar automáticamente la incidencia sin postprocesar texto generado.
- Clasificación de intenciones en asistentes conversacionales: con preguntas tipadas sobre la intención del usuario, se obtiene una distribución de probabilidad que puede alimentar un enrutador de diálogo.
- Moderación y etiquetado de contenido: definiendo criterios de categoría, el modelo puntúa la probabilidad de que un mensaje pertenezca a cada clase, útil en pipelines de revisión.
- Selección de siguiente acción en agentes: el modelo puede evaluar opciones de acción (por ejemplo, responder, escalar o pedir aclaración) y devolver la probabilidad de cada una en un solo paso.
- Procesamiento multilingüe en India: al soportar hindi, tamil y kannada, es adecuado para sistemas de atención al cliente o clasificación de documentos en esos idiomas.
- Despliegue en local con llama.cpp: gracias a las cuantizaciones desde Q2_K, puede ejecutarse en entornos con recursos limitados y servir decisiones de baja latencia mediante llama-server.
- Enrutado de consultas en sistemas RAG: clasificar la consulta del usuario por dominio o tipo de fuente antes de recuperar documentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una imagen de comparación (`lumma-fev-v2-4b-27b-vs-jev.png`) frente a otros modelos, pero no se proporcionan los valores numéricos en el texto disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; como referencia orientativa para un modelo de ~4,8B parámetros, las cuantizaciones Q4_K_M requieren del orden de 3-4 GB y BF16 en torno a 10 GB, aunque el autor no publica cifras.
- GPU recomendadas: no especificadas por el autor; por tamaño, cabría en GPUs consumer con suficiente VRAM y en GPUs de datacenter (A100, H100) para despliegues de mayor concurrencia.
- Cabe en GPU consumer: previsiblemente sí con cuantizaciones bajas (Q2_K a Q4_K_M), aunque no se confirma en la información disponible.
- Opciones de despliegue: llama.cpp / llama-server (soporte nativo del endpoint `/v1/systemone`); el autor no menciona vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles. El autor recomienda configurar `-b` y `-ub` al menos a la longitud del prompt más largo, ya que el modelo lee el prompt completo en un solo lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lumma-fev-4B-v2-GGUF | 4.841.450.496 | no disponible | Modelo de decisión probabilística | apache-2.0 | GGUF en HuggingFace |
| Qwen3.5-4B-Base (modelo base) | ~4B | no disponible | Generación de texto | no disponible | HuggingFace |
| Alternativas de clasificación de mismo tamaño | no disponible | no disponible | Clasificación generativa | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, por lo que no sirve para tareas de generación, resumen o conversación abierta.
- Idiomas limitados a inglés, hindi, tamil y kannada; el rendimiento en otros idiomas no está garantizado.
- No se detallan sesgos conocidos ni datos de evaluación de sesgo en la información disponible.
- Riesgo de calibración: al devolver probabilidades, la fiabilidad de estas depende de la formulación de las preguntas y criterios; no se publican métricas de calibración.
- La longitud de contexto no está especificada; el ejemplo de uso configura 8192 tokens, pero no se confirma como máximo.
- El repositorio ocupa 30,1 GB al incluir todas las cuantizaciones, lo que puede dificultar su descarga en entornos con ancho de banda limitado.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar los términos del modelo base Qwen3.5-4B-Base.
- Sin descargas ni likes registrados en el momento de la consulta, lo que indica una adopción aún muy limitada y escasa validación comunitaria.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/FrontiersMind/Lumma-fev-4B-v2-GGUF
- Modelo base (original): https://huggingface.co/FrontiersMind/Lumma-fev-4b-v2
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.5-4B-Base

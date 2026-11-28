# FrontiersMind/Lumma-fev-0.6b

## Resumen

Lumma-Fev-0.6B es un modelo de decisión desarrollado por FrontiersMind, un laboratorio que ha preentrenado su propia familia de modelos base desde cero. A diferencia de los modelos generativos al uso, Lumma-Fev no produce texto: recibe un documento (el *state*) y un conjunto de preguntas tipadas, y devuelve en un único forward pass una distribución de probabilidad para cada pregunta. Esto elimina por completo los problemas de parseo de salida y reduce drásticamente el riesgo de alucinación, ya que el modelo nunca genera lenguaje libre.

El modelo se obtiene mediante fine-tuning con LoRA (rango 16, fusionado en los pesos) sobre FrontiersMind/Lumma-0.6B-Base, un transformer causal de 649 millones de parámetros preentrenado por el propio equipo. La arquitectura es de tipo prefill-only: cada pregunta lee únicamente el estado y sus propios tokens, de modo que las preguntas no se influyen entre sí. La lectura final se realiza mediante una cabeza *pointer* de 256 dimensiones que apunta directamente a las opciones disponibles.

Su relevancia actual radica en que ofrece una alternativa determinista y autoalojable a los clasificadores propietarios y a los LLM generativos para tareas de enrutamiento, clasificación y puntuación. Con una latencia P50 de 45,82 ms y un promedio de 0,82 en el conjunto de benchmarks del autor, se posiciona como una opción competitiva para pipelines de decisión en producción que requieren respuestas estructuradas y auditables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal, prefill-only; cabeza pointer de 256 dimensiones sobre las opciones |
| Parametros totales | 649.282.476 (649M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 8.192 tokens de estado; cada fila pregunta (estado + pregunta) hasta 8.192 tokens |
| Tipos de cuantizacion | no disponible (pesos almacenados en bf16 para el backbone y fp32 para la cabeza pointer) |
| Idiomas soportados | inglés y 10 lenguas de la India (la model card indica "English and 10 Indian Languages"; los tags de Hugging Face solo declaran `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `custom_code`; requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

Lumma-Fev-0.6B es un transformer causal de 649M parámetros que opera exclusivamente en modo prefill: no decodifica tokens de forma autoregresiva, sino que procesa el estado y cada pregunta en paralelo y emite una distribución de probabilidad mediante una cabeza pointer de 256 dimensiones. Cada pregunta se evalúa de forma aislada, leyendo el estado y sus propias instrucciones y opciones, lo que garantiza que una pregunta no pueda alterar la respuesta de otra. El modelo soporta tres tipos de pregunta: `noul` (sí/no), `choice` (entre 1 y 255 opciones) y `score` (entre 1 y 255 niveles ordenados).

El entrenamiento parte de Lumma-0.6B-Base, un modelo preentrenado desde cero por FrontiersMind, sobre el que se aplica un fine-tuning con LoRA de rango 16 que posteriormente se fusiona en los pesos. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; esa información no está disponible. La innovación principal es el diseño de "decisión tipada": el modelo no genera texto, por lo que no hay salida que parsear ni margen para la alucinación lingüística, y los delimitadores internos no pueden ser falsificados por el texto de la petición.

## Capacidades

- Clasificación y enrutamiento de documentos mediante preguntas tipadas (`noul`, `choice`, `score`) en un solo forward pass.
- Extracción de decisiones estructuradas con probabilidades y nivel de confianza por pregunta.
- Procesamiento de estados multimodales en formato texto, objeto JSON o array.
- Soporte de hasta 8.192 tokens de contexto por fila de pregunta.
- Capacidades multilingües: inglés y 10 lenguas de la India.
- Integración con la API TypeSafe (`POST /v1/systemone`), lo que permite sustituir clientes existentes cambiando la URL base.
- Servidor de inferencia propio (`lumma-fev-serve`) con autenticación opcional por API key y soporte CORS.
- No soporta generación de texto, tool calling, razonamiento multi-paso ni agentes: es un modelo de decisión puro.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo clasifica cada ticket entrante en departamentos (devoluciones, envíos, facturación) mediante preguntas `choice` con descripciones por categoría, aprovechando su latencia de 45,82 ms para operar en tiempo real dentro de un sistema de atención al cliente.
- Moderación y triaje de contenido: preguntas `noul` del tipo "¿es este texto sobre facturación?" permiten filtrar y etiquetar grandes volúmenes de documentos con una sola pasada y sin riesgo de generar texto no deseado.
- Análisis de sentimiento y emoción: con preguntas `score` sobre niveles ordenados, el modelo obtiene una puntuación esperada y su distribución de probabilidad, útil para paneles de monitorización de opiniones (0,89 en DAIR Emotion según el autor).
- Clasificación de intenciones en asistentes conversacionales: las preguntas `choice` con hasta 255 opciones permiten mapear la intención del usuario a una taxonomía cerrada de acciones, con la ventaja de que la respuesta siempre es una de las opciones definidas.
- Extracción de campos estructurados de documentos JSON: al aceptar objetos JSON como estado, el modelo puede decidir sobre campos concretos de una ficha o formulario sin necesidad de un LLM generativo.
- Automatización de flujos de decisión con umbrales de confianza: las probabilidades devueltas permiten derivar casos de baja confianza a revisión humana, integrándose en pipelines de CI/CD o sistemas de workflow mediante la API TypeSafe.
- Sustitución de clasificadores propietarios: equipos que pagan por APIs de clasificación pueden autoalojar el modelo (coste 0 USD por token según el autor) y mantener el mismo contrato de cliente TypeSafe.

## Benchmarks y rendimiento

Datos publicados en la model card del autor:

| Benchmark / Métrica | TypeSafe Jev 1.13.0 | Laya | Gliner2.5-Decide | Lumma-Fev-0.15B | Lumma-Fev-0.6B | Lumma-Fev-4B | Lumma-Fev-9B |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Typed-decisions | 0,72 | 0,76 | 0,46 | 0,49 | 0,64 | 0,78 | 0,81 |
| AG News | 0,91 | 0,95 | 0,48 | 0,89 | 0,84 | 0,93 | 0,95 |
| DAIR Emotion | 0,48 | 0,595 | 0,55 | 0,68 | 0,89 | 0,94 | 0,94 |
| Banking77 | 0,87 | 0,425 | 0,68 | 0,47 | 0,90 | 0,93 | 0,94 |
| **Promedio** | **0,75** | **0,68** | **0,54** | **0,63** | **0,82** | **0,90** | **0,91** |
| Latencia P50 | 256 ms | 32,8 ms | 99,85 ms | 35,576 ms | 45,82 ms | 175,93 ms | 269,39 ms |
| Pesos | Cerrados | Abiertos | Abiertos | Abiertos | Abiertos | Abiertos | Abiertos |
| Coste | 0,042 USD / 1M tokens | 0 USD autoalojado | 0 USD autoalojado | 0 USD autoalojado | 0 USD autoalojado | 0 USD autoalojado | 0 USD autoalojado |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 5,2 GB, pero los pesos en bf16 del backbone de 649M parámetros requieren aproximadamente 1,3 GB, más la cabeza pointer en fp32 y el overhead de activaciones; en la práctica, menos de 3 GB en GPU.
- GPU recomendadas: cualquier GPU con al menos 3-4 GB de VRAM; el modelo es apto para RTX 3060, RTX 4060, RTX 4090, A100 y H100 sin problemas.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna con 4 GB o más de VRAM.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`, el paquete `lumma-fev` (selecciona automáticamente cuda, mps o cpu) y el servidor `lumma-fev-serve`. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: latencia P50 de 45,82 ms según el autor; el throughput no está disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Promedio benchmark | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lumma-Fev-0.6B | 649M | 8.192 tokens | 0,82 | Apache 2.0 | Abierto (Hugging Face) |
| Lumma-Fev-0.15B | no disponible | no disponible | 0,63 | no disponible | Abierto |
| Lumma-Fev-4B | no disponible | no disponible | 0,90 | no disponible | Abierto |
| Gliner2.5-Decide | no disponible | no disponible | 0,54 | no disponible | Abierto |
| Laya | no disponible | no disponible | 0,68 | no disponible | Abierto |
| TypeSafe Jev 1.13.0 | no disponible | no disponible | 0,75 | Propietaria | Cerrado (0,042 USD/1M tokens) |

La model card no detalla parámetros, contexto ni licencia de los modelos comparados; solo se dispone de sus resultados en el conjunto de benchmarks del autor. Lumma-Fev-0.6B supera en promedio a TypeSafe Jev 1.13.0 (0,82 frente a 0,75), Laya (0,68) y Gliner2.5-Decide (0,54), con una latencia inferior a TypeSafe Jev (45,82 ms frente a 256 ms).

## Limitaciones y advertencias

- Las probabilidades y la confianza son estimaciones del propio modelo; el autor recomienda medir la calibración con datos etiquetados propios antes de automatizar acciones basadas en umbrales.
- El modelo solo está entrenado para inglés y 10 lenguas de la India; no se garantiza un rendimiento adecuado en castellano ni en otras lenguas.
- No es un modelo generativo: no puede producir texto libre, razonar en varios pasos ni mantener conversaciones; su uso está restringido a decisiones tipadas.
- No se han publicado detalles sobre sesgos, composición del dataset de entrenamiento ni evaluación de seguridad.
- El modelo requiere `trust_remote_code=True` y código personalizado, lo que implica revisar el código remoto antes de desplegarlo en producción.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la model card no ofrece garantías ni información sobre el proceso de preentrenamiento del modelo base.
- El rendimiento en AG News (0,84) es inferior al de modelos más pequeños de la propia familia (Lumma-Fev-0.15B obtiene 0,89), lo que sugiere que la elección de tamaño debe validarse por tarea.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FrontiersMind/Lumma-fev-0.6b
- Modelo base: https://huggingface.co/FrontiersMind/Lumma-0.6B-Base
- Blog detallado: https://www.frontiersmind.ai/blog/lumma-fev/index.html
- Sitio web: https://www.frontiersmind.ai/
- Discord: https://discord.gg/ZGdjCdRt
- Correo de soporte: support@frontiersmind.ai
- LinkedIn: https://www.linkedin.com/company/frontiersmind/
- X (Twitter): https://x.com/Fr

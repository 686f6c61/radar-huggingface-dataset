# Liquor-06/Qwen3-0.6B-PII-distillops

## Resumen

Qwen3-0.6B-PII-distillops es un modelo de 0,6 mil millones de parámetros especializado en la detección de información personal identificable (PII) en texto en inglés, desarrollado por el usuario Liquor-06 sobre la base de Qwen/Qwen3-0.6B. Su propósito es localizar nombres, contactos, direcciones, números de identificación, tarjetas, fechas y datos demográficos para poder enmascararlos localmente antes de que el texto se almacene, comparta o se envíe a otro modelo. Resuelve un problema de privacidad concreto: permitir el filtrado de datos sensibles en el propio dispositivo o servidor, sin depender de una API externa que reciba el texto original.

El modelo se entrenó mediante destilación desde un LLM de API (DeepSeek flash) usando la herramienta distillops, y posteriormente se refinó con GRPO sobre un pequeño conjunto de datos etiquetados. Según el autor, nunca se entrenó con etiquetas humanas y aun así supera a su profesor: 0,955 de F1 frente a 0,934, y reduce la tasa de fuga de PII tras el enmascaramiento al 1,9 % (frente al 3,0 % del profesor). El coste de las llamadas al profesor fue de 17,7 CNY.

Se distribuye con licencia Apache 2.0, en formato safetensors, con un tamaño de repositorio de 1,2 GB y 596.049.920 parámetros reales. Está pensado para ejecutarse en hardware modesto y para integrarse en pipelines de privacidad y cumplimiento normativo, aunque su alcance se limita al inglés y a las siete categorías definidas por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantización estándar de transformers/vLLM) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3, un transformer decoder-only de 0,6 mil millones de parámetros, afinado para una tarea de extracción de entidades. La salida no es texto libre, sino una lista JSON de objetos `{"type", "value"}` donde cada valor se copia literalmente del texto de entrada. El entrenamiento se articula en dos fases: primero, destilación desde un profesor de API (DeepSeek flash, con 3 ejemplos resueltos) que etiquetó 10.000 textos; las respuestas se aceptaron únicamente mediante reglas (categorías conocidas y valores copiados verbatim). Después, se aplicó GRPO sobre un pequeño conjunto de 2.100 textos etiquetados, partiendo de un modelo SFT entrenado con las etiquetas del profesor.

Los datos proceden de OpenPII-1M (sintético, en inglés), cuyas 19 etiquetas originales se fusionaron en las 7 categorías del modelo. Los splits son disjuntos: 10.000 textos para el profesor, 2.000 etiquetados para GRPO, 300 para selección de checkpoint y 2.000 para test. La innovación destacable es el uso de destilación sin etiquetas humanas combinada con GRPO, que aporta +0,95 puntos de F1 sobre el punto de partida SFT (intervalo de confianza bootstrap del 95 %: +0,64 a +1,27). El modelo requiere desactivar el modo thinking y usar decodificación greedy para reproducir los resultados declarados.

## Capacidades

- Detección de PII en inglés en siete categorías: NAME, CONTACT, ADDRESS, ID_NUMBER, CARD_NUMBER, DATE y DEMOGRAPHIC.
- Extracción con copia literal de los valores, lo que facilita el enmascaramiento posterior por sustitución de cadenas.
- Agrupación de palabras adyacentes de la misma categoría en una sola entidad (por ejemplo, "Dr Ana Maria Lee" o "12 Oak Street").
- Salida estructurada en JSON, lista para su consumo programático.
- Soporte de plantilla de chat de Qwen3 con `enable_thinking=False`.
- Compatibilidad con text-generation-inference y endpoints compatibles.
- No dispone de tool calling, capacidades de agente, visión, audio ni razonamiento multi-paso; su función es exclusivamente la extracción de entidades.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Enmascaramiento de PII antes de enviar texto a un LLM externo: el modelo detecta y sustituye nombres, correos y teléfonos por etiquetas de categoría, de modo que el proveedor del modelo nunca recibe los datos originales.
- Cumplimiento de RGPD en pipelines de datos: integrado como paso previo al almacenamiento o la compartición de registros, permite anonimizar automáticamente textos de atención al cliente y reducir la exposición de datos personales.
- Redacción de documentos legales o médicos: el modelo localiza identificadores, fechas y datos demográficos para su revisión o eliminación antes de la publicación o el archivado.
- Preprocesado de datasets para entrenamiento: filtra o enmascara PII en corpus recopilados de la web antes de usarlos en el ajuste de otros modelos.
- Filtrado en herramientas de soporte y ticketing: analiza los mensajes entrantes y señala datos sensibles para que el equipo de soporte los trate conforme a la política interna.
- Anonimización en el borde (edge): al ser un modelo de 0,6B, puede ejecutarse en una máquina local o en un servidor modesto, lo que permite procesar texto sin salir de la infraestructura propia.
- Auditoría de fugas de datos: comparar los spans detectados con los esperados para medir la tasa de PII que permanece visible tras el enmascaramiento.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente):

| Modelo | Textos etiquetados usados | Mean F1 | Micro-F1 | Tasa de fuga |
|---|---|---|---|---|
| Qwen3-0.6B sin entrenar | - | 0,158 | 0,224 | 73,1 % |
| Profesor: DeepSeek flash, 3-shot | 103 | 0,934 | 0,938 | 3,0 % |
| 0.6B, SFT con etiquetas del profesor | 103 (del profesor; no entrena con ninguna) | 0,945 | 0,948 | 2,0 % |
| + GRPO sobre pool etiquetado: este modelo | 2.100 | 0,955 | 0,955 | 1,9 % |
| 0.6B, SFT con etiquetas gold (control) | 10.000 | 0,982 | 0,983 | 1,1 % |

Evaluación sobre 2.000 textos ingleses reservados de OpenPII-1M, 7 categorías. La tasa de fuga se define como la proporción de spans de PII gold que permanecen (parcialmente) visibles tras el enmascaramiento con los valores predichos.

F1 por categoría:

| NAME | CONTACT | ADDRESS | ID_NUMBER | CARD_NUMBER | DATE | DEMOGRAPHIC |
|---|---|---|---|---|---|---|
| 0,964 | 0,975 | 0,891 | 0,975 | 0,953 | 0,992 | 0,958 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en fp16/bf16 (596 M parámetros); alrededor de 0,6-0,7 GB en cuantización de 8 bits y 0,3-0,4 GB en 4 bits (estimación a partir del número de parámetros; no confirmada por el autor).
- GPU recomendadas: cualquier GPU consumer moderna con al menos 2 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes.
- Cabe en GPU consumer y también en CPU, dado su reducido tamaño.
- Opciones de despliegue: transformers, vLLM (`vllm serve Liquor-06/Qwen3-0.6B-PII-distillops`), text-generation-inference y endpoints compatibles; llama.cpp u Ollama requerirían conversión a GGUF, no documentada por el autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 (tarea PII) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-0.6B-PII-distillops | 596 M | no disponible | 0,955 (declarado) | Apache 2.0 | Hugging Face |
| Qwen3-0.6B (base, sin entrenar) | 596 M | no disponible | 0,158 | Apache 2.0 | Hugging Face |
| Profesor DeepSeek flash (3-shot) | no disponible (API) | no disponible | 0,934 | propietaria (API) | API |
| SFT con etiquetas gold (control del autor) | 596 M | no disponible | 0,982 | no disponible | no publicado como modelo independiente |

No se dispone de datos de otros modelos especializados en detección de PII comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; el rendimiento en otros idiomas no está evaluado y probablemente sea deficiente.
- Entrenado sobre datos sintéticos (OpenPII-1M), lo que puede no reflejar la distribución real de PII en textos de producción.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente.
- Requiere un uso muy específico: el system prompt exacto, el texto tras `Text:\n`, thinking desactivado y decodificación greedy; desviarse de este formato puede degradar la salida.
- Riesgo de alucinación en la extracción: puede omitir entidades o copiar valores incorrectos, lo que dejaría PII visible; la tasa de fuga declarada es del 1,9 %, no cero.
- La categoría ADDRESS presenta el F1 más bajo (0,891), por lo que es la más propensa a errores.
- No debe usarse como única barrera de privacidad en entornos con requisitos regulatorios estrictos sin una capa de validación adicional.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del dataset OpenPII-1M y del modelo base Qwen3.
- El modelo no realiza tool calling ni razonamiento multi-paso; no es adecuado para tareas generales de generación de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Liquor-06/Qwen3-0.6B-PII-distillops
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset: https://huggingface.co/datasets/ai4privacy/pii-masking-openpii-1m
- Herramienta distillops: https://github.com/Zihao-Wu06/distillops

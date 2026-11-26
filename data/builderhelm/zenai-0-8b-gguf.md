# BuilderHelm/ZenAI-0.8B-GGUF

## Resumen

ZenAI-0.8B-GGUF es una cuantización Q4_K_M en formato GGUF derivada de Qwen/Qwen3.5-0.8B, un modelo base de 772.845.888 parámetros (aproximadamente 0,77 mil millones). Lo publica el usuario BuilderHelm y está pensado para inferencia local en ZenPense, una aplicación de finanzas personales que ejecuta herramientas de contabilidad en el propio dispositivo. El modelo incorpora un adaptador LoRA entrenado sobre conversaciones sintéticas de finanzas personales, por lo que su especialización es deliberadamente estrecha: asistencia conversacional dentro de un producto concreto.

La relevancia de esta ficha es limitada pero concreta. No se trata de un modelo generalista nuevo, sino de un artefacto de despliegue: un ajuste ligero sobre una base pequeña, empaquetado en GGUF para ejecutarse en hardware de consumo. Su interés para desarrolladores e investigadores radica en observar cómo se construyen asistentes verticales de bajo coste sobre modelos de menos de mil millones de parámetros, con licencia Apache 2.0 y sin dependencia de servicios en la nube.

El repositorio ocupa 0,5 GB y no registra descargas ni interacciones en el momento de la consulta. La información pública disponible es muy escasa: no hay datos de benchmarks, idiomas declarados ni detalles sobre el proceso de entrenamiento más allá de la mención al LoRA y al conjunto sintético.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-0.8B); detalles no disponibles |
| Parametros totales | 772.845.888 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 0,5 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen/Qwen3.5-0.8B, un transformer denso de aproximadamente 0,77 mil millones de parámetros. No se dispone de información pública sobre el número de capas, dimensiones ocultas, mecanismo de atención ni longitud de contexto nativa del modelo base en la documentación proporcionada.

El proceso de adaptación consistió en un ajuste LoRA sobre conversaciones sintéticas de finanzas personales, según la model card. El checkpoint distribuido corresponde al paso 600 de entrenamiento. No se documentan el volumen de tokens, la composición exacta del dataset, el uso de RLHF o DPO, ni la configuración del adaptador (rango, alpha, módulos objetivo). La cuantización a Q4_K_M se aplicó posteriormente para reducir el peso a los 0,5 GB del repositorio y permitir inferencia local en ZenPense.

## Capacidades

- Generación de texto conversacional orientada a diálogos de finanzas personales.
- Ejecución de herramientas de contabilidad (ledger tools) en el dispositivo, orquestadas por la aplicación ZenPense y no por el modelo en sí.
- Conversación multi-turno dentro del flujo de producto de ZenPense.
- Etiqueta `endpoints_compatible`, que sugiere compatibilidad con APIs de inferencia estándar.
- Capacidades multilingües: no disponibles.
- Razonamiento avanzado, código, matemáticas, visión, audio, modo thinking o agentes autónomos: no documentados.

## Casos de uso

- Asistente de finanzas personales embebido: el modelo gestiona conversaciones sobre gastos e ingresos dentro de ZenPense, con las herramientas de contabilidad ejecutándose localmente y sin enviar datos financieros a la nube.
- Clasificación y extracción de transacciones: dado un texto libre del usuario, el modelo puede estructurarlo para que la capa de herramientas registre el movimiento en el libro contable.
- Despliegue en dispositivos de gama baja: con 0,5 GB en Q4_K_M, es viable en portátiles sin GPU dedicada y en equipos con 8 GB de RAM o menos mediante llama.cpp.
- Prototipado de asistentes verticales: sirve como plantilla para equipos que quieran reproducir el patrón LoRA + GGUF sobre una base pequeña con licencia permisiva.
- Generación de resúmenes de gastos periódicos: el modelo puede redactar explicaciones en lenguaje natural a partir de agregados que le pase la aplicación.
- Evaluación de ajustes LoRA de bajo coste: útil en investigación para comparar el comportamiento de adaptadores pequeños sobre bases sub-1B en dominios restringidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,6-1 GB con Q4_K_M, considerando pesos y overhead de contexto.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM; no requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en GTX 1050 Ti, RTX 3050, RTX 4060 y superiores; también en iGPU con memoria unificada suficiente.
- Despliegue: llama.cpp, Ollama y servidores compatibles con GGUF; la etiqueta `endpoints_compatible` apunta a integración vía API.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ZenAI-0.8B-GGUF | 772.845.888 | no disponible | Apache 2.0 | GGUF Q4_K_M | Ajuste LoRA para finanzas personales |
| Qwen/Qwen3.5-0.8B | ~0,8B | no disponible | no disponible | safetensors | Modelo base sin especializar |
| Otros asistentes verticales sub-1B | no disponible | no disponible | variable | variable | No se dispone de comparables directos documentados |

## Limitaciones y advertencias

- Especialización estrecha: el LoRA se entrenó solo con conversaciones sintéticas de finanzas personales, por lo que el rendimiento fuera de ese dominio puede degradarse respecto al modelo base.
- Datos sintéticos: no hay evidencia pública de evaluación con datos reales, lo que eleva el riesgo de respuestas poco fieles en casos límite.
- Riesgo de alucinación: al ser un modelo de menos de mil millones de parámetros, la probabilidad de inventar cifras o transacciones es alta; requiere validación en la capa de herramientas.
- Idiomas y contexto: no declarados; no se debe asumir soporte multilingüe ni ventanas largas.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Madurez: cero descargas y cero likes en el momento de la consulta; sin señales de validación por la comunidad.
- Dependencia del producto: parte de su valor está acoplado a ZenPense y a su prompt compacto, lo que limita la reutilización directa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/BuilderHelm/ZenAI-0.8B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B

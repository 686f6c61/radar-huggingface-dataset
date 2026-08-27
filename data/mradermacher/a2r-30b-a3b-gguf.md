# mradermacher/A2R-30B-A3B-GGUF

## Resumen

A2R-30B-A3B-GGUF es una colección de cuantizaciones GGUF del modelo A2R-30B-A3B, desarrollada por mradermacher a partir del modelo base de PleasedPenguin. El modelo base es un modelo de lenguaje multimodal orientado al audio, especializado en atribución de hablante en conversaciones multi-party (varios interlocutores). El nombre sugiere una arquitectura de mezcla de expertos (MoE) con 30 mil millones de parámetros totales y 3 mil millones activos, aunque esta característica no está confirmada en la documentación disponible.

La relevancia de esta versión cuantizada radica en que permite ejecutar un modelo de 30B en hardware de consumo o en entornos con VRAM limitada, gracias a los distintos niveles de cuantización ofrecidos (desde Q2_K hasta Q8_0). El repositorio incluye diez archivos GGUF con diferentes tamaños, lo que facilita elegir el equilibrio entre calidad y requisitos de memoria. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere MoE, sin confirmar) |
| Parametros totales | 30.532.646.912 (30,5B) |
| Parametros activos | 3B (según nomenclatura A3B, no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base usa safetensors) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base (número de capas, dimensiones, tipo de atención, etc.) ni sobre el proceso de entrenamiento (volumen de datos, composición del dataset, técnicas de alineación como RLHF o DPO). Los únicos datos disponibles son los tags de HuggingFace, que indican que se trata de un modelo de audio-lenguaje con capacidades de atribución de hablante y soporte para conversaciones multi-party. El nombre "A2R-30B-A3B" sugiere una arquitectura de mezcla de expertos con 30B parámetros totales y 3B activos, pero esta información no está confirmada en la documentación pública.

## Capacidades

Según los tags y la descripción del modelo, las capacidades declaradas son:

- Procesamiento de audio y lenguaje (audio-language model).
- Atribución de hablante (speaker attribution) en conversaciones con múltiples participantes.
- Soporte para diálogos multi-party (más de dos interlocutores).
- Generación de texto conversacional.

No se especifican capacidades adicionales como tool calling, razonamiento multi-step, generación de código o matemáticas. Tampoco se indica si el modelo acepta entradas de audio directamente o solo texto transcrito.

## Casos de uso

Dado que la información disponible es limitada, los casos de uso se infieren de las capacidades declaradas y deben validarse con pruebas reales:

- Transcripción de reuniones con atribución de hablante: el modelo puede procesar conversaciones grabadas y asignar cada intervención al interlocutor correcto, lo que facilita la generación de actas o resúmenes estructurados.
- Análisis de llamadas de atención al cliente: permite identificar quién dijo qué en una conversación telefónica, útil para evaluar la calidad del servicio o detectar problemas recurrentes.
- Subtitulado de contenido audiovisual con identificación de personajes: en entrevistas, podcasts o programas con varios participantes, el modelo puede generar subtítulos que indiquen quién está hablando.
- Asistentes de voz para entornos multi-usuario: en hogares u oficinas con varios usuarios, el modelo podría distinguir entre diferentes voces y adaptar sus respuestas según el interlocutor.
- Investigación en lingüística y análisis de conversaciones: los investigadores pueden usar el modelo para estudiar patrones de interacción, turnos de habla o solapamientos en diálogos naturales.
- Generación de resúmenes de debates o paneles: a partir de grabaciones, el modelo puede producir resúmenes que atribuyan correctamente las opiniones a cada participante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni métricas específicas de atribución de hablante o comprensión auditiva.

## Requisitos de hardware

Los requisitos dependen del archivo GGUF elegido. La siguiente tabla estima la VRAM necesaria para cargar el modelo en memoria (sin considerar capas fuera de VRAM ni overhead del runtime):

| Cuantización | Tamaño de archivo | VRAM estimada (mínima) |
|---|---|---|
| Q2_K | 11,4 GB | ~12 GB |
| Q3_K_S | 13,4 GB | ~14 GB |
| Q3_K_M | 14,8 GB | ~16 GB |
| Q3_K_L | 16,0 GB | ~17 GB |
| Q4_K_S | 17,6 GB | ~19 GB |
| Q4_K_M | 18,7 GB | ~20 GB |
| Q5_K_S | 21,2 GB | ~22 GB |
| Q5_K_M | 21,8 GB | ~23 GB |
| Q6_K | 25,2 GB | ~27 GB |
| Q8_0 | 32,6 GB | ~34 GB |

- Las cuantizaciones Q2_K y Q3_K_S caben en GPUs de consumo como la RTX 3090 (24 GB) o RTX 4090 (24 GB) con margen.
- Q4_K_M y superiores requieren GPUs profesionales (A100 40 GB, A6000 48 GB) o el uso de técnicas de offloading a CPU.
- Para inferencia en CPU, se puede usar llama.cpp u Ollama, aunque la velocidad será significativamente menor.
- Para despliegue en producción con GPU, se recomienda vLLM o TGI, siempre que soporten el formato GGUF (vLLM tiene soporte experimental para GGUF; TGI requiere conversión a safetensors).

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos de audio-lenguaje con atribución de hablante. No se conocen modelos de referencia con características equivalentes (mismo tamaño, misma especialización) en el ecosistema open source. Por tanto, esta sección se considera no disponible.

## Limitaciones y advertencias

- La información pública sobre el modelo base es muy escasa: no se documentan sesgos, riesgos de alucinación ni limitaciones específicas del dominio de audio.
- Al ser una cuantización, se espera una degradación de la calidad respecto al modelo original en fp16, especialmente en las cuantizaciones más agresivas (Q2_K, Q3_K_*). La pérdida puede manifestarse en errores de atribución de hablante o en respuestas menos coherentes.
- El modelo solo está declarado para inglés; su rendimiento en otros idiomas es desconocido.
- No se ha verificado el comportamiento del modelo en tareas fuera de la atribución de hablante y el diálogo multi-party. No se recomienda su uso en tareas de razonamiento general o generación de código sin pruebas previas.
- La licencia Apache 2.0 permite uso comercial, pero se debe revisar si el modelo base tiene restricciones adicionales (no se ha encontrado ninguna en la documentación).
- El repositorio de cuantizaciones no incluye el modelo en formato safetensors; para usar vLLM o TGI puede ser necesario convertir el GGUF o descargar el modelo base original.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/A2R-30B-A3B-GGUF
- Modelo base: https://huggingface.co/PleasedPenguin/A2R-30B-A3B
- Perfil de mradermacher: https://huggingface.co/mradermacher
- Página de descargas de mradermacher: https://hf.tst.eu/model
- Solicitudes de modelos: https://huggingface.co/mradermacher/model_requests

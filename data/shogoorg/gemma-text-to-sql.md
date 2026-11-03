# shogoorg/gemma-text-to-sql

## Resumen

`shogoorg/gemma-text-to-sql` es un ajuste fino (fine-tuning) del modelo base `google/gemma-4-E4B` de Google, entrenado por el usuario `shogoorg` mediante aprendizaje supervisado (SFT) con la librería TRL de Hugging Face. El nombre del modelo indica que su propósito es la traducción de lenguaje natural a SQL (text-to-SQL), aunque la model card no documenta el conjunto de datos de entrenamiento ni el rendimiento obtenido en esa tarea.

El modelo se distribuye en formato `safetensors` con un tamaño de repositorio de 5,5 GB, lo que es coherente con un modelo de aproximadamente 4 000 millones de parámetros en precisión de 16 bits. Se ha publicado con la librería `transformers` y está etiquetado como compatible con endpoints de Hugging Face. No se especifican licencia, idiomas soportados ni pipeline en los metadatos disponibles.

La relevancia de esta ficha es limitada por la escasez de información publicada: no hay benchmarks, no hay descripción del dataset de entrenamiento y no hay licencia declarada. Aun así, se trata de un ejemplo típico de ajuste fino especializado sobre un modelo Gemma de última generación, útil para quienes quieran evaluar la viabilidad de un modelo pequeño y abierto para generación de consultas SQL en entornos controlados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de google/gemma-4-E4B; detalles no disponibles) |
| Parametros totales | no disponible (el tamaño del repo de 5,5 GB sugiere ~4 000 M en fp16) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card menciona "licence: license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `google/gemma-4-E4B` mediante SFT (supervised fine-tuning) con TRL 1.17.1, Transformers 5.22.0, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.3. La model card no detalla la arquitectura interna del modelo base (número de capas, dimensiones, mecanismo de atención, si emplea atención lineal o decodificación especulativa), ni el número de tokens de entrenamiento, la composición del dataset o si se aplicaron técnicas de alineación adicionales como RLHF o DPO.

El único dato técnico concreto es el procedimiento de entrenamiento: SFT con TRL sobre el modelo base. No se documentan hiperparámetros, épocas, tamaño de lote, tasa de aprendizaje ni estrategia de enmascaramiento de pérdida. Tampoco se indica si el ajuste se realizó con LoRA, QLoRA o entrenamiento completo; el tamaño del repositorio (5,5 GB) es compatible tanto con un checkpoint completo en fp16 como con un adaptador de gran tamaño, pero no permite distinguirlo con certeza.

## Capacidades

- Generación de texto autoregresiva heredada del modelo base Gemma.
- Especialización declarada en traducción de lenguaje natural a SQL (text-to-SQL), aunque no se documenta el alcance ni la calidad de esta capacidad.
- Soporte de conversación multi-turno mediante el pipeline de `transformers` con formato de mensajes `role`/`content`.
- Compatibilidad con endpoints de Hugging Face (etiqueta `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Generación de consultas SQL a partir de preguntas en lenguaje natural en herramientas internas de análisis de datos: el modelo puede recibir una pregunta de negocio y devolver una sentencia SQL lista para revisión humana, siempre que se valide contra el esquema real de la base de datos.
- Asistente de BI para equipos no técnicos: integrado en un chat corporativo, el modelo traduce preguntas como "ventas por región del último trimestre" a consultas SQL que luego se ejecutan en un motor analítico.
- Prototipado de interfaces de consulta en lenguaje natural sobre bases de datos relacionales: útil para validar la experiencia de usuario antes de invertir en un sistema más robusto.
- Generación de consultas de ejemplo para documentación técnica o tests de integración de pipelines de datos.
- Educación y formación: el modelo puede servir para mostrar a estudiantes cómo se traduce una pregunta a SQL, con la advertencia de que las salidas deben revisarse.
- Automatización de tareas repetitivas de reporting: generación de plantillas SQL parametrizadas a partir de descripciones textuales de informes periódicos.
- Evaluación comparativa de ajustes finos pequeños para text-to-SQL: sirve como referencia para medir si un modelo de ~4 000 M de parámetros es suficiente frente a alternativas mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 8-9 GB para un modelo de ~4 000 M de parámetros, más el overhead de activaciones y caché KV (no confirmado por el autor).
- VRAM estimada en cuantización de 8 bits: aproximadamente 4-5 GB; en 4 bits, en torno a 2,5-3 GB (estimaciones orientativas, no publicadas por el autor).
- GPU recomendadas: NVIDIA A100 o H100 para despliegue en producción con alta concurrencia; RTX 4090 o RTX 3090 para inferencia en fp16 en un solo dispositivo.
- Cabe en GPU de consumo: probablemente sí en RTX 4090, RTX 3090, RTX 4080 y GPUs con 12 GB o más en fp16; en 4 bits podría caber en GPUs de 8 GB, aunque no está verificado.
- Opciones de despliegue: `transformers` con `pipeline` y `device_map="auto"`; vLLM y TGI son compatibles en principio con modelos safetensors de arquitectura Gemma, pero no se ha verificado para este checkpoint concreto. llama.cpp y Ollama requerirían conversión a GGUF, no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| shogoorg/gemma-text-to-sql | ~4 000 M (estimado) | no disponible | no disponible | Hugging Face | Ajuste fino SFT sobre Gemma-4-E4B para text-to-SQL; sin benchmarks |
| google/gemma-4-E4B | no disponible | no disponible | no disponible | Hugging Face | Modelo base del que deriva; capacidades generales |
| Alternativas text-to-SQL open source | no disponible | no disponible | no disponible | no disponible | No se dispone de información verificada para una comparación rigurosa |

No se dispone de datos suficientes para comparar rendimiento con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de la calidad del modelo en text-to-SQL ni en otras tareas.
- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; la model card solo indica "licence: license" sin especificar términos. Es imprescindible contactar con el autor o consultar la licencia del modelo base Gemma antes de usarlo en producción.
- Dataset de entrenamiento no documentado: se desconoce el esquema de bases de datos, el dominio y el idioma de los ejemplos, lo que impide evaluar su generalización.
- Riesgo de alucinación: como todo modelo generativo, puede producir SQL sintácticamente válido pero semánticamente incorrecto, o inventar tablas y columnas.
- Riesgo de inyección SQL si las salidas se ejecutan sin validación: es obligatorio revisar y parametrizar las consultas generadas antes de enviarlas a un motor de base de datos.
- Idiomas soportados no disponibles: no se puede confirmar el rendimiento en castellano.
- Sin información sobre sesgos: no se documentan sesgos conocidos ni evaluaciones de seguridad.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: no hay evidencia de uso comunitario ni de validación externa.
- La model card incluye un ejemplo de generación de texto genérico que no está relacionado con text-to-SQL, lo que sugiere una plantilla poco cuidada y aumenta la incertidumbre sobre la calidad del ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shogoorg/gemma-text-to-sql
- Modelo base: https://huggingface.co/google/gemma-4-E4B
- Repositorio TRL: https://github.com/huggingface/trl
- Documentación de Transformers: https://huggingface.co/docs/transformers

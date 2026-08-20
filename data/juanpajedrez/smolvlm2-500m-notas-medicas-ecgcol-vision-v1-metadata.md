# juanpajedrez/smolvlm2-500m-notas-medicas-ecgcol-vision-v1-metadata

## Resumen

El modelo `juanpajedrez/smolvlm2-500m-notas-medicas-ecgcol-vision-v1-metadata` es un ajuste fino (fine-tuning) del modelo base `HuggingFaceTB/SmolVLM2-500M-Video-Instruct`, especializado en el análisis de imágenes de electrocardiogramas (ECG) y la generación de notas médicas asociadas. Desarrollado por el usuario `juanpajedrez`, este modelo combina capacidades de visión y lenguaje en un formato compacto de 507 millones de parámetros, lo que lo hace adecuado para entornos con recursos limitados.

El ajuste se realizó mediante aprendizaje supervisado (SFT) utilizando la librería TRL, lo que permite al modelo interpretar imágenes de ECG y producir descripciones clínicas estructuradas. Su relevancia radica en la posibilidad de automatizar tareas de documentación médica en cardiología, reduciendo la carga administrativa de los profesionales sanitarios. Aunque el modelo base ya soporta instrucciones multimodales, este fine-tuning busca adaptarlo específicamente al dominio de las notas médicas de ECG.

Al tratarse de un modelo pequeño (500M) con arquitectura SmolVLM2, es viable su ejecución en GPUs de consumo, aunque no se han publicado detalles sobre el contexto máximo ni las cuantizaciones disponibles. La licencia no está claramente especificada, lo que debe tenerse en cuenta antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLM2 (vision-language transformer) |
| Parametros totales | 507.482.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base soporta hasta 8k tokens, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base es multilingüe, pero no se especifica para este ajuste) |
| Licencia | no disponible (la model card indica "license" genérico, sin detalle) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en SmolVLM2, una familia de modelos vision-language de tamaño reducido desarrollada por Hugging Face. La arquitectura combina un codificador de visión (Vision Transformer) con un modelo de lenguaje decoder-only, conectados mediante un proyector. El modelo base `SmolVLM2-500M-Video-Instruct` está entrenado para procesar tanto imágenes como vídeos y seguir instrucciones en formato conversacional.

El fine-tuning se realizó con aprendizaje supervisado (SFT) usando TRL (Transformers Reinforcement Learning). No se han publicado detalles sobre el conjunto de datos de entrenamiento (número de ejemplos, composición, procedencia de las imágenes de ECG, etc.), ni sobre el proceso de alineación adicional (RLHF/DPO). El entrenamiento se llevó a cabo con PyTorch 2.11, Transformers 5.15 y TRL 1.9.0, según la model card.

## Capacidades

- Generación de texto a partir de imágenes: el modelo puede recibir una imagen de ECG y generar una nota médica descriptiva.
- Razonamiento multimodal básico: al heredar las capacidades del modelo base, puede responder preguntas sobre el contenido visual.
- Soporte de instrucciones conversacionales: permite interacciones de tipo chat, aunque no se ha confirmado explícitamente para este fine-tune.
- Capacidades multilingües potenciales: el modelo base es multilingüe, pero no hay evidencia de que el fine-tuning mantenga ese soporte.
- No se han documentado capacidades específicas como tool calling, agentes o modos de razonamiento extendido.

## Casos de uso

- Automatización de informes de ECG en clínicas: el modelo puede recibir una imagen de electrocardiograma y generar un borrador de nota médica, que un profesional revisa y firma. Su tamaño reducido permite integrarlo en sistemas locales sin depender de la nube.
- Asistencia a la codificación de diagnósticos: a partir de la descripción generada, se pueden extraer códigos CIE-10 u otros estándares, agilizando la facturación médica.
- Educación médica: los estudiantes pueden practicar interpretación de ECG comparando sus propias lecturas con las notas generadas por el modelo, siempre bajo supervisión.
- Telemedicina: en entornos con baja conectividad, el modelo puede ejecutarse en un dispositivo edge para pre-procesar imágenes de ECG y generar resúmenes preliminares.
- Investigación clínica: análisis retrospectivo de grandes volúmenes de ECG, generando descripciones estandarizadas que faciliten la búsqueda en bases de datos.
- Integración en sistemas de historia clínica electrónica: como componente de un pipeline que extrae información de imágenes y la introduce en campos estructurados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni métricas específicas de dominio médico (p. ej., exactitud en clasificación de ritmos cardíacos). Tampoco se han comparado métricas con otros modelos en la documentación proporcionada.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 507M parámetros en precisión FP16, la inferencia requiere aproximadamente 1-2 GB de VRAM, aunque no se ha confirmado oficialmente.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3050) debería ser suficiente para inferencia básica. Para entrenamiento o fine-tuning adicional, se recomienda al menos 8 GB.
- Compatibilidad con GPU de consumo: sí, es viable en tarjetas como RTX 3060 o superiores.
- Opciones de despliegue: compatible con la librería `transformers` mediante pipeline de `image-text-to-text`. También puede usarse con vLLM o TGI, aunque no se ha verificado explícitamente.
- Latencia y throughput: no se han publicado datos. En una GPU moderna, se espera una latencia de decenas de milisegundos por imagen, pero es una estimación no confirmada.

## Comparativa con modelos similares

No se dispone de información comparativa publicada. Sin embargo, el modelo base `SmolVLM2-500M-Video-Instruct` puede compararse con otros VLM pequeños como:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolVLM2-500M-Video-Instruct (base) | 500M | 8k | Apache 2.0 | HuggingFace |
| Qwen2-VL-2B | 2B | 32k | Apache 2.0 | HuggingFace |
| LLaVA-1.6-7B | 7B | 4k | Apache 2.0 | HuggingFace |

El modelo fine-tune no ha sido comparado directamente con estas alternativas en la documentación disponible.

## Limitaciones y advertencias

- Sesgos potenciales: al ser un fine-tune sobre un dominio específico (ECG), puede tener un rendimiento deficiente fuera de ese ámbito. No se han documentado pruebas de generalización.
- Riesgo de alucinación: como todo modelo generativo, puede producir descripciones incorrectas o inventar hallazgos que no están presentes en la imagen. Es imprescindible la revisión humana.
- Limitaciones de contexto: no se ha confirmado la longitud de contexto, lo que puede afectar a conversaciones largas o a la inclusión de múltiples imágenes.
- Restricciones de licencia: la licencia no está claramente definida, lo que supone un riesgo legal para uso comercial. Se recomienda contactar al autor antes de cualquier implementación productiva.
- Falta de documentación: no hay información sobre el dataset de entrenamiento, lo que dificulta evaluar la calidad y posibles sesgos.
- No se han publicado evaluaciones clínicas: el modelo no ha sido validado por profesionales médicos ni en ensayos, por lo que no debe utilizarse como herramienta de diagnóstico autónoma.

## Enlaces

- [Página del modelo en HuggingFace](https://huggingface.co/juanpajedrez/smolvlm2-500m-notas-medicas-ecgcol-vision-v1-metadata)
- [Modelo base: HuggingFaceTB/SmolVLM2-500M-Video-Instruct](https://huggingface.co/HuggingFaceTB/SmolVLM2-500M-Video-Instruct)
- [Framework SmolLM para fine-tuning de VLM (GitHub)](https://github.com/huggingface/smollm/tree/main/vision/smolvlm2)

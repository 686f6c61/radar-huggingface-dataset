# BubbleT0/InspectBench-Trajectory-SFT-R1

## Resumen

InspectBench-Trajectory-SFT-R1 es un checkpoint de inferencia publicado por el usuario BubbleT0 (BubbleT0/InspectBench-Trajectory-SFT-R1) que corresponde al modelo evaluado en el paper InspectBench. No se trata de un modelo entrenado desde cero ni de una nueva versión cuantizada: son los pesos completos del checkpoint `checkpoint-740` de un ajuste fino supervisado sobre trayectorias (trajectory SFT) orientado a la crítica de imágenes. El repositorio conserva los 12 shards originales de safetensors sin modificaciones.

El modelo declara la arquitectura `Qwen3_5ForConditionalGeneration` (etiqueta `qwen3_5`) con 27.356.728.560 parámetros en BF16, lo que lo sitúa en la categoría de modelos de lenguaje y visión de aproximadamente 27B. El paper denomina al backbone Qwen3.6-27B, aunque la configuración del checkpoint mantiene la arquitectura declarada por el autor. La tarea principal es image-text-to-text aplicada a la inspección y crítica de imágenes dentro del benchmark InspectBench.

Su relevancia es acotada pero específica: sirve como referencia reproducible para evaluar la capacidad de un VLM de generar críticas estructuradas sobre imágenes, con predicciones guardadas y presets de configuración multi-etapa publicados en el repositorio de código. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no incluye datos de entrenamiento ni estados del optimizador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (etiqueta `qwen3_5`); el paper la denomina Qwen3.6-27B |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; los pesos publicados están en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el autor indica que no se infiere ninguna licencia adicional por la subida; aplican los términos del modelo base y de los datos) |
| Formato de pesos | safetensors (12 shards), con índice de shards, tokenizer, chat template y configuración de procesador de imagen/vídeo |

## Arquitectura y entrenamiento

El checkpoint se basa en una arquitectura de transformer multimodal para generación condicionada por imagen (`Qwen3_5ForConditionalGeneration`), con pesos en BF16 y una versión de Transformers registrada de 5.2.0. El modelo combina un procesador de imagen y vídeo con un tokenizer y una plantilla de chat, tal como se declara en los artefactos incluidos. No se especifican en la información disponible detalles sobre atención lineal, decodificación especulativa ni otras innovaciones de arquitectura.

El entrenamiento corresponde a un ajuste fino supervisado sobre trayectorias (Trajectory-SFT) que produce el `checkpoint-740`. La model card indica que se incluyen los argumentos de entrenamiento registrados (con ubicaciones de infraestructura y credenciales eliminadas), así como validación de tensores/índices y registros de integridad de ficheros. No se incluyen los datos de entrenamiento ni los estados del optimizador, y no se documenta el número de tokens, la composición del dataset ni si hubo RLHF o DPO. La evaluación completa en GPU no se ha vuelto a ejecutar para esta release.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) con foco en crítica e inspección de imágenes.
- Producción de conjuntos de regiones o anotaciones estructuradas: la entrada es una imagen sin su prompt de generación y las imágenes limpias deben producir un conjunto de regiones vacío.
- Evaluación multi-etapa mediante seis presets de configuración publicados en el repositorio de código.
- Integración con endpoints compatibles con OpenAI para visión y lenguaje (tag `endpoints_compatible`).
- Conversación multi-turno (tag `conversational`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, audio): no disponible.

## Casos de uso

- Evaluación reproducible de crítica de imágenes: servir el checkpoint en un endpoint compatible con OpenAI y ejecutar el runner Direct o `pipelines/run_paper_pipeline.py` para reproducir las predicciones del paper InspectBench sobre el conjunto de imágenes y anotaciones publicado.
- Detección de regiones anómalas en imágenes: dado que las imágenes limpias deben devolver un conjunto de regiones vacío, el modelo puede emplearse como base para un pipeline de inspección que marque regiones sospechosas y permita validar falsos positivos.
- Investigación en ajuste fino por trayectorias: el checkpoint y los argumentos de entrenamiento registrados sirven como punto de partida para estudiar cómo el SFT sobre trayectorias afecta a la calidad de las críticas generadas.
- Comparación de configuraciones multi-etapa: los seis presets del repositorio de código permiten medir el impacto de distintas configuraciones de inferencia sobre las mismas imágenes y anotaciones.
- Validación de pipelines de visión-lenguaje: el modelo puede actuar como referencia fija en pruebas de regresión de sistemas de inspección de imágenes, comparando las predicciones nuevas contra las predicciones guardadas del paper.
- Despliegue en entornos con endpoints compatibles con OpenAI: al declarar `endpoints_compatible`, puede servirse detrás de una API estándar para integrarse en herramientas internas de revisión de imágenes sin adaptar el cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las predicciones del paper InspectBench como referencia numérica fija, pero no incluye tablas de resultados en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 54,7 GB solo para pesos (27,36B parámetros × 2 bytes), más memoria para activaciones, caché KV y procesador de imagen; en la práctica se requiere al menos una GPU de 80 GB para inferencia cómoda en BF16.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU. No se dispone de datos de latencia ni throughput.
- Cabe en GPU de consumo: no en BF16 con una sola GPU de consumo; se necesitaría cuantización, pero no se han publicado tipos de cuantización para este checkpoint.
- Opciones de despliegue: Transformers (versión registrada 5.2.0) y vLLM compatible; el autor indica que se requiere una instalación compatible de Transformers o vLLM. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card señala que la inferencia completa en GPU no se ha vuelto a ejecutar para esta release.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| InspectBench-Trajectory-SFT-R1 | 27,36B | no disponible | no disponible | safetensors (BF16) | Hugging Face, 0 descargas |
| Qwen3.6-27B (backbone según el paper) | ~27B | no disponible | no disponible | no disponible | no disponible |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo ni de especificaciones de modelos alternativos en la información proporcionada, por lo que la comparativa numérica no está disponible.

## Limitaciones y advertencias

- Licencia no declarada: el autor indica explícitamente que la subida no otorga ninguna licencia adicional y que siguen aplicando los términos del modelo base y de los datos. Es imprescindible verificar la licencia del backbone Qwen3.6-27B antes de cualquier uso comercial.
- Idiomas soportados no documentados; no se puede garantizar un comportamiento multilingüe.
- Longitud de contexto no documentada, lo que impide planificar cargas con ventanas largas.
- Riesgo de alucinación no cuantificado: no hay benchmarks publicados en el repositorio que permitan estimar la tasa de error en la generación de regiones o críticas.
- Sesgos conocidos: no documentados.
- Checkpoint de investigación: se trata de un artefacto de evaluación de un paper, no de un modelo listo para producción; no incluye datos de entrenamiento ni estados del optimizador, y la inferencia completa en GPU no se ha revalidado para esta release.
- Dependencia de versiones: requiere Transformers 5.2.0 o compatible y vLLM compatible; versiones distintas pueden no cargar la arquitectura `qwen3_5`.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación externa.
- El pipeline de evaluación es externo a los pesos; es necesario obtener el código del repositorio GitHub para reproducir los resultados del paper.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BubbleT0/InspectBench-Trajectory-SFT-R1
- Repositorio de código, prompts de inferencia, presets y predicciones: https://github.com/BubbleT0/InspectBench
- Dataset de imágenes y anotaciones del benchmark: https://huggingface.co/datasets/BubbleT0/InspectBench
- Paper: no disponible en la información proporcionada.

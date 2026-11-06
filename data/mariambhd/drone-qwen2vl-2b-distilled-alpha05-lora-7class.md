# mariambhd/drone-qwen2vl-2b-distilled-alpha05-lora-7class

## Resumen

`mariambhd/drone-qwen2vl-2b-distilled-alpha05-lora-7class` es un adaptador LoRA publicado por la usuaria mariambhd sobre el modelo base multimodal Qwen2-VL-2B-Instruct. No se trata de un modelo completo, sino de un conjunto de pesos de adaptación (formato PEFT/safetensors) que debe cargarse junto al modelo base de 2.000 millones de parámetros para funcionar. Su propósito es la clasificación de acciones humanas en vídeo grabado desde drones, restringida a siete clases cerradas: attacking, hitting, kicking, clapping, waving, walking y running.

El adaptador se ha obtenido mediante destilación de conocimiento a nivel de respuesta (hard-label distillation) desde un profesor de mayor tamaño, Qwen2.5-VL-3B con su propio adaptador LoRA, hacia el estudiante Qwen2-VL-2B. La pérdida combina entropía cruzada contra la etiqueta real y contra la etiqueta del profesor con un peso alpha de 0,5. El resultado declarado es una paridad exacta con el profesor en el conjunto de test: 97,50 % de accuracy y 92,38 % de macro F1 sobre los sujetos [9, 10], que no fueron vistos por ninguno de los dos modelos.

La relevancia del artefacto es acotada pero clara: demuestra que un modelo de 2B puede igualar a uno de 3B en una tarea de reconocimiento de acciones en vídeo aéreo, con un coste de inferencia medio de 2,67 segundos por vídeo. Es un adaptador de nicho, con cero descargas y sin licencia declarada, pensado para investigación en videovigilancia con drones más que para uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer multimodal Qwen2-VL (vision-lenguaje) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base Qwen2-VL-2B-Instruct tiene 2.000 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2-VL-2B-Instruct) |
| Tipos de cuantizacion | no disponible (entrenado y publicado en fp16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2-VL-2B-Instruct, un transformer multimodal que procesa vídeo como secuencia de fotogramas junto con texto. El adaptador LoRA añade matrices de bajo rango entrenables sobre el modelo base congelado; no se especifican en la información disponible el rango, el alpha de LoRA ni qué módulos se adaptan. El entrenamiento se realizó en fp16.

La innovación técnica principal es la destilación a nivel de respuesta: el profesor es Qwen2.5-VL-3B con el adaptador `mariambhd/drone-qwen25vl-3b-lora-7class` en fp16, y el estudiante es Qwen2-VL-2B con LoRA. La función de pérdida es `(1 - alpha) * CE(etiqueta real) + alpha * CE(etiqueta del profesor)` con alpha = 0,5. Se eligió la época 4 por menor pérdida de validación. La partición de datos reutiliza el `fold_splits.json` del profesor, de modo que los sujetos de test no aparecieron en el entrenamiento de ninguno de los dos modelos. El preprocesado usa 16 fotogramas para hitting, clapping, walking y running, y 8 fotogramas para kicking, attacking y waving, con redimensionado a 448x252 píxeles.

## Capacidades

- Clasificación de acciones humanas en vídeo aéreo (grabado desde dron) en siete clases cerradas: attacking, hitting, kicking, clapping, waving, walking y running.
- Comprensión de vídeo a partir de secuencias de 8 o 16 fotogramas redimensionados a 448x252.
- Razonamiento multimodal básico heredado del modelo base Qwen2-VL-2B-Instruct (descripción de imágenes y vídeo, respuesta a preguntas visuales), aunque el adaptador está especializado en la tarea de clasificación.
- No se documenta soporte de tool calling, function calling, agentes ni modo thinking específico en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada; dependen del modelo base.

## Casos de uso

- Monitorización de seguridad en recintos con dron: el adaptador clasifica en tiempo real secuencias de vídeo aéreo en las siete clases de acción, lo que permite detectar conductas como attacking, hitting o kicking y disparar alertas. Es adecuado porque está entrenado específicamente con vídeo de dron y sujetos no vistos.
- Análisis forense de grabaciones aéreas: dado un vídeo de dron, el modelo etiqueta las acciones presentes para indexar y priorizar clips en una investigación. Su coste de 2,67 s por vídeo facilita el procesado por lotes de archivos.
- Detección de aglomeraciones y flujos peatonales: las clases walking y running permiten estimar el comportamiento de multitudes en espacios abiertos vistos desde el aire, útil en gestión de eventos.
- Investigación en reconocimiento de acciones en vídeo aéreo: el adaptador sirve como línea base reproducible (época 4, alpha 0,5, split por sujeto) para comparar técnicas de destilación de modelos 3B a 2B.
- Despliegue en hardware modesto: al ser un adaptador sobre un modelo de 2B en fp16, puede ejecutarse en GPUs de consumo medio, lo que permite prototipos de videovigilancia aérea sin infraestructura de centro de datos.
- Automatización de anotación de datasets: el modelo puede preetiquetar clips de dron con las siete clases para acelerar el etiquetado humano posterior, revisando después las predicciones de baja confianza.

## Benchmarks y rendimiento

Resultados declarados en la model card sobre el conjunto de test (sujetos [9, 10]):

| Modelo | Accuracy | Macro F1 | Weighted F1 |
|---|---|---|---|
| Profesor (Qwen2.5-VL-3B + LoRA) | 97,50 % | 92,38 % | 97,33 % |
| Estudiante (Qwen2-VL-2B + este LoRA) | 97,50 % | 92,38 % | 97,33 % |

Tiempo medio de inferencia: 2,67 s por vídeo. El propio autor advierte que el conjunto de test es pequeño (2 sujetos) y que las diferencias mínimas no son estadísticamente fiables. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el modelo base Qwen2-VL-2B-Instruct en fp16 requiere del orden de 4-5 GB de VRAM, a lo que se suma el adaptador LoRA (tamaño del repo declarado: 0,0 GB, es decir, muy pequeño).
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, una GPU con 8 GB o más de VRAM debería bastar para el modelo base en fp16.
- GPU de consumo: sí, previsiblemente en tarjetas como RTX 3060/4060 (8-12 GB) o superiores, aunque no se confirma en la documentación.
- Opciones de despliegue: la model card solo muestra carga con `transformers` (`Qwen2VLForConditionalGeneration` + `PeftModel`) y `AutoProcessor`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 2,67 s por vídeo de media según el autor; no se proporciona throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen2-VL-2B + LoRA) | 2B (base) + LoRA | no disponible | 97,50 % accuracy / 92,38 % macro F1 | no disponible | Hugging Face (0 descargas) |
| Profesor: Qwen2.5-VL-3B + LoRA `mariambhd/drone-qwen25vl-3b-lora-7class` | 3B (base) + LoRA | no disponible | 97,50 % accuracy / 92,38 % macro F1 | no disponible | Hugging Face |
| Qwen2-VL-2B-Instruct (base sin adaptador) | 2B | no disponible | no disponible para esta tarea | no disponible en esta ficha | Hugging Face (modelo público de Qwen) |

La comparativa se limita a los dos modelos documentados en la información proporcionada; no se dispone de datos de otros adaptadores de reconocimiento de acciones en vídeo aéreo para contrastar.

## Limitaciones y advertencias

- El conjunto de test tiene solo 2 sujetos, por lo que la paridad con el profesor (97,50 % en ambos) no es estadísticamente concluyente; el propio autor lo advierte.
- Es un adaptador LoRA, no un modelo autónomo: requiere descargar y cargar Qwen2-VL-2B-Instruct por separado.
- La tarea está restringida a siete clases cerradas; no generaliza a acciones fuera de ese conjunto.
- El preprocesado es rígido: hay que usar el mismo prompt, los mismos recuentos de fotogramas (16 o 8 según la clase) y el mismo redimensionado a 448x252 que en entrenamiento, o el rendimiento puede degradarse.
- Licencia no declarada: no se puede confirmar el uso comercial ni las condiciones de redistribución; además, las condiciones del modelo base (Qwen2-VL-2B-Instruct) se aplican por separado.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un clasificador de acciones, el riesgo principal es la clasificación errónea en condiciones de vídeo distintas a las de entrenamiento (iluminación, altitud, ángulo de cámara).
- Cero descargas y cero likes en Hugging Face: no hay evidencia de uso o validación por parte de la comunidad.
- Idiomas soportados no disponibles; la salida esperada son etiquetas de clase, no texto libre multilingüe.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/mariambhd/drone-qwen2vl-2b-distilled-alpha05-lora-7class
- Modelo base: https://huggingface.co/Qwen/Qwen2-VL-2B-Instruct
- Adaptador profesor (referenciado en la model card): https://huggingface.co/mariambhd/drone-qwen25vl-3b-lora-7class

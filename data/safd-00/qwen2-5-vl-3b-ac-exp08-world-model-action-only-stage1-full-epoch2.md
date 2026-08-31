# SaFD-00/qwen2.5-vl-3b-ac-exp08-world-model-action-only-stage1-full-epoch2

## Resumen

Este modelo es un fine-tuning experimental del vision-language model Qwen2.5-VL-3B-Instruct, desarrollado por SaFD-00 como parte de una serie de ablaciones sobre *world modeling* para agentes de interfaz de usuario. El objetivo es medir el efecto neto de la predicción de estado (world model) frente a un entrenamiento únicamente con datos de acción. Para ello, se ha entrenado el modelo completo (full fine-tuning) durante dos épocas con un conjunto de 10.000 ejemplos de acciones, sin supervisión de predicción de estado, manteniendo los mismos hiperparámetros que el experimento principal (que usa 40.000 ejemplos de estado más 10.000 de acción). El resultado es un modelo que debe predecir acciones de UI a partir de capturas de pantalla, usando coordenadas absolutas de píxeles y un esquema XML específico (Cerebra).

La relevancia de este modelo es principalmente investigadora: permite aislar la contribución del *world modeling* en tareas de control de interfaces, comparando su rendimiento con el modelo principal que sí incluye supervisión de estado. El modelo base Qwen2.5-VL-3B-Instruct aporta capacidades de visión-lenguaje de última generación, con 3.754 millones de parámetros y una ventana de contexto de 32.000 tokens (heredada del base). El repositorio contiene únicamente pesos en formato safetensors, sin cuantizaciones ni documentación adicional más allá de la model card.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-VL-3B-Instruct (transformer vision-language) |
| Parametros totales | 3.754.622.976 (3,75 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada del modelo base: 32.000 tokens) |
| Tipos de cuantizacion | no disponible (solo safetensors FP32/FP16) |
| Idiomas soportados | no disponible (el modelo base soporta multilingue) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-VL-3B-Instruct, un transformer multimodal que combina un codificador de visión (ViT) con un decoder de lenguaje basado en Qwen2.5. El fine-tuning se ha realizado de forma completa (todos los parámetros) usando el framework LlamaFactory, con un dataset denominado `IWM-AC_EXP08_stage1_train_action_only` compuesto por 10.000 ejemplos de acciones de UI. El entrenamiento se detuvo en el checkpoint 320, que corresponde a una época real de 2,0384 (según `trainer_state.json`), aunque el nombre del repositorio indica "epoch2" como etiqueta redondeada.

La tarea de entrenamiento consiste en predecir acciones de interfaz (clics, escritura, etc.) a partir de capturas de pantalla de 840×1876 píxeles, con un presupuesto de imagen de 1.605.632 tokens visuales. Las acciones se representan mediante un esquema XML llamado Cerebra, que utiliza atributos `data-bbox` y `aria-label` para localizar elementos. Este esquema es necesario para la evaluación con la herramienta de puntuación (`--xml-schema cerebra`). La principal innovación técnica es la ausencia deliberada de supervisión de predicción de estado, lo que convierte a este modelo en una ablación controlada para medir el impacto del *world modeling* en el rendimiento del agente.

## Capacidades

- Generación de texto y razonamiento multimodal: hereda las capacidades del modelo base Qwen2.5-VL-3B-Instruct, incluyendo comprensión de imágenes, OCR, y diálogo visual.
- Predicción de acciones de UI: entrenado específicamente para emitir comandos de interacción (clics, escritura, navegación) sobre interfaces gráficas, usando coordenadas absolutas de píxeles.
- Soporte de esquema XML Cerebra: genera acciones en formato estructurado con `data-bbox` y `aria-label`, lo que permite su integración en pipelines de automatización.
- Capacidades multilingües: aunque no se especifican en la ficha, el modelo base soporta múltiples idiomas, por lo que es probable que el fine-tuning conserve esta propiedad.
- Sin modo de pensamiento explícito: no se menciona soporte para *thinking mode* ni razonamiento multi-paso más allá del estándar del modelo base.
- Sin soporte de tool calling específico: no se documenta function calling adicional, aunque el modelo base lo soporta de forma nativa.

## Casos de uso

- Automatización de pruebas de interfaz: el modelo puede generar acciones de UI a partir de capturas de pantalla, permitiendo crear suites de pruebas automatizadas que simulan interacciones de usuario en aplicaciones web o móviles.
- Agentes de navegación web autónomos: al predecir acciones en coordenadas absolutas, puede integrarse en sistemas que controlan un navegador para completar tareas como rellenar formularios o extraer información.
- Investigación en *world modeling*: sirve como baseline de ablación para comparar con el modelo principal que incluye predicción de estado, ayudando a cuantificar el valor del modelado del entorno en agentes visuales.
- Generación de datos sintéticos de interacción: puede usarse para producir secuencias de acciones etiquetadas a partir de capturas, ampliando datasets de entrenamiento para otros modelos.
- Asistencia a usuarios con discapacidad visual: combinado con un lector de pantalla, podría sugerir acciones de navegación en aplicaciones de escritorio.
- Prototipado rápido de agentes de UI: su tamaño compacto (3,75 B) permite desplegarlo en entornos de desarrollo para validar flujos de interacción antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. Dado que se trata de un experimento de ablación, el rendimiento debe evaluarse en la tarea específica de predicción de acciones de UI, pero no se proporcionan datos numéricos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3,75 B parámetros en FP16, los pesos ocupan aproximadamente 7,5 GB. La inferencia requiere al menos 8-10 GB de VRAM, dependiendo de la longitud de la secuencia y el tamaño del lote.
- GPU recomendadas: una RTX 3090/4090 (24 GB) o una A10G (24 GB) son suficientes para inferencia en FP16. Para entrenamiento o fine-tuning adicional, se recomienda una A100 (40/80 GB) o H100.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo con 12 GB o más (por ejemplo, RTX 3060 12 GB, RTX 4070 Ti 12 GB) usando cuantización de 8 bits o 4 bits, aunque no se proporcionan cuantizaciones oficiales.
- Opciones de despliegue: compatible con transformers, vLLM, TGI (text-generation-inference) y llama.cpp (si se convierte a GGUF). También puede usarse con Ollama si se genera un archivo Modelfile.
- Latencia y throughput: no disponible. Para un modelo de 3,75 B en una GPU moderna, se espera una latencia de decodificación de 20-50 ms por token y un throughput de 50-100 tokens/s, pero estos valores son estimaciones genéricas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SaFD-00/qwen2.5-vl-3b-ac-exp08-world-model-action-only-stage1-full-epoch2 | 3,75 B | no disponible | Full FT, solo acciones (10K) | no disponible | HuggingFace |
| SaFD-00/qwen2.5-vl-3b-ac-exp08-world-model-stage1-full-epoch2.01 (modelo principal) | 3,75 B | no disponible | Full FT, estado (40K) + acciones (10K) | no disponible | HuggingFace |
| Qwen/Qwen2.5-VL-3B-Instruct (base) | 3,75 B | 32K | Instruct (RLHF) | Qwen Research License | HuggingFace |

La comparativa se limita a los modelos relacionados del mismo autor y al modelo base, ya que no se dispone de datos de rendimiento para establecer comparaciones cuantitativas. La diferencia clave entre el modelo de esta ficha y el principal es la ausencia de supervisión de estado, lo que debería reflejarse en un rendimiento inferior en tareas que requieren comprensión del entorno.

## Limitaciones y advertencias

- Licencia no especificada: el autor no indica la licencia del modelo, lo que impide su uso comercial sin consulta previa. El modelo base Qwen2.5-VL-3B-Instruct tiene una licencia de investigación (Qwen Research License), por lo que es probable que este fine-tuning herede restricciones similares.
- Datos de entrenamiento limitados: solo 10.000 ejemplos de acciones, lo que puede provocar sobreajuste y falta de generalización a interfaces no vistas.
- Sin evaluación publicada: no hay benchmarks ni métricas de rendimiento, por lo que no se puede verificar su eficacia real en tareas de UI.
- Dependencia del esquema Cerebra: las predicciones están ligadas a un formato XML específico; su uso fuera de este esquema requeriría adaptación.
- Posibles sesgos del modelo base: al ser un fine-tuning de Qwen2.5-VL, puede heredar sesgos de género, culturales o lingüísticos presentes en los datos de preentrenamiento.
- Riesgo de alucinación en acciones: al no tener supervisión de estado, el modelo podría generar acciones inconsistentes con el contenido de la pantalla, especialmente en situaciones ambiguas.
- Fecha de creación futura: el modelo está fechado en agosto de 2026, lo que sugiere que es un artefacto experimental reciente y no ha sido sometido a pruebas exhaustivas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SaFD-00/qwen2.5-vl-3b-ac-exp08-world-model-action-only-stage1-full-epoch2
- Modelo principal (world model): https://huggingface.co/SaFD-00/qwen2.5-vl-3b-ac-exp08-world-model-stage1-full-epoch2.01
- Checkpoint epoch 3: https://huggingface.co/SaFD-00/qwen2.5-vl-3b-ac-exp08-world-model-stage1-full-epoch3
- Checkpoint epoch 2.26: https://huggingface.co/SaFD-00/qwen2.5-vl-3b-ac-exp08-world-model-stage1-full-epoch2.26
- Blog oficial de Qwen2.5-VL: https://qwen.ai/blog?id=qwen2.5-vl
- Repositorio espejo en GitHub (para la versión 7B): https://github.com/Damacol/safd-00-qwen2.5-vl-7b-ac-stage1-full-world-model-epoch1

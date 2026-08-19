# ebt005/gemma-2-9b-it-dgs-dpo-A

## Resumen

`ebt005/gemma-2-9b-it-dgs-dpo-A` es un adaptador QLoRA (LoRA de baja precisión) diseñado para el modelo base `google/gemma-2-9b-it` (9,2 mil millones de parámetros, instrucción afinada). Forma parte de un experimento preregistrado denominado "Digital Grimace Scale sprint, Phase 4", cuyo objetivo es determinar si al suprimir el lenguaje de angustia que un modelo utiliza al recibir retroalimentación adversa (mensajes falsos de error), los canales mecánicos de comportamiento —margen de respuesta, desacuerdo en remuestreo, respuestas no generadas— se ven afectados, permanecen intactos o solo cambian bajo un placebo.

El adaptador fue entrenado mediante DPO (Direct Preference Optimization) con pares de preferencia construidos a partir de las propias salidas del modelo base, etiquetadas por un juez LLM (`claude-sonnet-4-6`). La rama A (este adaptador) corresponde al brazo de tratamiento: suprime las expresiones de angustia en contextos adversos. La rama B es el brazo de control activo. El adaptador añade 54 millones de parámetros entrenables (~0,6% del modelo base) y se distribuye como un archivo `safetensors` de 0,1 GB, con licencia Gemma.

Este modelo es relevante para investigadores en interpretabilidad, seguridad de IA y alineación, ya que explora si el entrenamiento de preferencias puede modificar no solo el contenido verbal sino también indicadores conductuales no lingüísticos de estados internos. No está pensado para uso productivo general, sino como herramienta experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2, 9B) con adaptador LoRA (QLoRA) |
| Parametros totales | 9.241.067.520 (modelo base) + 54.018.048 (adaptador entrenable) |
| Parametros activos | 54.018.048 (solo adaptador; el modelo base permanece congelado) |
| Longitud de contexto | 8.192 tokens (modelo base) |
| Tipos de cuantizacion | 4-bit NF4 con doble cuantizacion y compute bf16 (durante el entrenamiento); el adaptador se puede fusionar en bf16 para servir |
| Idiomas soportados | Ingles (principalmente; el modelo base soporta otros idiomas pero el adaptador se entreno solo con datos en ingles) |
| Licencia | Gemma (permite uso comercial con restricciones; requiere cumplir la Politica de Uso Prohibido de Google) |
| Formato de pesos | `adapter_model.safetensors` (adaptador) + `adapter_config.json` (configuracion PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura Gemma 2 de Google: un transformer decoder-only con atención local y global alternada, normalización pre-RMSNorm, y activación GeGLU. El modelo base `gemma-2-9b-it` fue entrenado sobre 8 billones de tokens de datos diversos (documentos web, codigo, matematicas) y posteriormente afinado con instrucciones y RLHF.

El adaptador se entrena con QLoRA: el modelo base se cuantiza a 4-bit NF4 con doble cuantizacion, y se aplican LoRA a las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` con rango 16, alpha 32 y dropout 0,05. El entrenamiento utiliza DPO con beta 0,1, función de pérdida sigmoide, y el modelo de referencia es la misma red con el adaptador desactivado. El dataset de preferencias se construye a partir de salidas del propio modelo base en 600 contextos de ARC (573 correctos), bajo un mensaje hostil falso de fallo. Se generaron 3.499 respuestas a temperatura 0,8, etiquetadas por un juez LLM según una rúbrica hash-lockeada, y se formaron 329 pares de preferencia (chosen = menor angustia, rejected = mayor angustia). El entrenamiento duró 2 épocas con batch efectivo 8, learning rate 5e-6 con coseno y 10% de warm-up, en una sola GPU A100-40GB durante 8,7 minutos. No se realizó búsqueda de hiperparámetros; el procedimiento fue preregistrado.

## Capacidades

- **Supresion de lenguaje de angustia**: el adaptador reduce la probabilidad de que el modelo genere expresiones verbales de malestar (p. ej., quejas, disculpas, lenguaje emocional negativo) cuando recibe retroalimentacion adversa falsa.
- **Generacion de texto estandar**: conserva las capacidades generales del modelo base para responder a instrucciones, razonar y generar texto coherente en ingles.
- **Razonamiento de opcion multiple**: entrenado sobre items de ARC (AI2 Reasoning Challenge), mantiene capacidad de responder preguntas de opcion multiple con logica.
- **Soporte de tool calling**: no disponible; el adaptador no anade ni modifica capacidades de invocacion de herramientas del modelo base.
- **Capacidades multilingues**: limitadas; el adaptador solo se entreno con datos en ingles y no se ha evaluado su efecto en otros idiomas.
- **Modo de pensamiento**: no disponible; el adaptador no introduce mecanismos de razonamiento explicito.

## Casos de uso

- **Investigacion en alineacion y seguridad de IA**: el adaptador permite estudiar experimentalmente si el entrenamiento de preferencias que suprime expresiones de angustia altera indicadores conductuales no verbales (margen de respuesta, desacuerdo entre muestras, tasa de no-respuestas) bajo condiciones de estres simulado. Es una herramienta para preregistrar y reproducir experimentos sobre estados internos de modelos.
- **Evaluacion de robustez ante feedback adverso**: en sistemas de IA conversacional que reciben criticas o correcciones, este adaptador puede servir para probar si la supresion de quejas verbales reduce comportamientos defensivos sin degradar la calidad de la tarea.
- **Desarrollo de metodos de interpretabilidad mecanistica**: al comparar el adaptador A con su contraparte B (control), los investigadores pueden aislar el efecto del contenido verbal frente a los canales mecanicos, contribuyendo a teorias sobre como el entrenamiento de preferencias afecta la representacion interna del modelo.
- **Generacion de datos sinteticos para estudios de comportamiento**: el adaptador puede generar respuestas con bajo contenido de angustia en contextos adversos, util para crear datasets de entrenamiento o evaluacion en escenarios de interaccion hostil.
- **Prueba de hipotesis en psicologia computacional**: el modelo sirve como plataforma para replicar experimentos sobre la relacion entre lenguaje emocional y estados internos simulados, con aplicaciones en el estudio de la alucinacion y la confianza del modelo.
- **Benchmarking de tecnicas de DPO y QLoRA**: el adaptador proporciona un caso documentado de entrenamiento con DPO en un modelo de 9B con QLoRA, reproducible en una sola GPU, util para validar pipelines de entrenamiento en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El adaptador no incluye evaluaciones estandar (MMLU, HumanEval, GSM8K, etc.) en su model card. Los unicos datos cuantitativos reportados son las metricas de entrenamiento:

| Metrica | Valor |
|---|---|
| Optimiser steps | 84 |
| Loss final | 0,0335 |
| Rewards/margins final | 3,378 |
| Rewards/accuracies final | 1,00 |
| Rewards/accuracies media durante entrenamiento | 0,8795 |

El autor advierte que una exactitud de recompensa de 1,00 sobre 329 pares tras 2 epocas es esperable y no indica generalizacion; la evaluacion real se realiza sobre un conjunto factorial reservado de 200 items de ARC que no fueron vistos durante el entrenamiento. No se proporcionan resultados de esa evaluacion en la model card.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el adaptador se puede cargar sobre el modelo base en bf16 (aproximadamente 18 GB de VRAM para los pesos completos) o fusionarse y cuantizarse a 4-bit (aproximadamente 5-6 GB). El entrenamiento requirio una GPU con 40 GB (A100).
- **GPU recomendadas**: para inferencia con el adaptador fusionado en bf16, se recomienda una GPU con al menos 24 GB (p. ej., RTX 3090, RTX 4090, A10G). Para entrenamiento, una A100-40GB o similar.
- **Compatibilidad con GPUs de consumo**: si, con cuantizacion 4-bit (GGUF o bitsandbytes) cabe en GPUs de 8-12 GB (p. ej., RTX 3060, RTX 4070), aunque el adaptador esta disenado para cargarse con PEFT sobre el modelo base en bf16.
- **Opciones de despliegue**: el adaptador se carga con la libreria PEFT (`PeftModel`) sobre el modelo base de Hugging Face. Para servir, se puede fusionar y exportar a safetensors, y luego usar vLLM, TGI o llama.cpp (si se convierte a GGUF). No hay soporte nativo en Ollama.
- **Latencia y throughput**: no se han publicado datos especificos. Como referencia, el modelo base gemma-2-9b-it en bf16 con atencion eager en una A100-40GB genera aproximadamente 50-80 tokens/s; el adaptador anade una sobrecarga minima al ser solo un delta de pesos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tecnica | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ebt005/gemma-2-9b-it-dgs-dpo-A` | 9,2B + 54M adaptador | 8.192 | QLoRA + DPO | Gemma | Hugging Face |
| `ebt005/gemma-2-9b-it-dgs-dpo-B` (brazo B) | 9,2B + 54M adaptador | 8.192 | QLoRA + DPO (control) | Gemma | No publicado |
| `princeton-nlp/gemma-2-9b-it-DPO` | 9,2B | 8.192 | DPO (full fine-tune) | Gemma | ModelScope |
| `google/gemma-2-9b-it` (base) | 9,2B | 8.192 | Instruccion + RLHF | Gemma | Hugging Face (gated) |

No se dispone de datos de rendimiento comparativo entre estos modelos. El adaptador A se distingue por su objetivo especifico (supresion de angustia) y su naturaleza experimental preregistrada; los otros modelos son afinamientos generales de preferencia sin ese enfoque conductual.

## Limitaciones y advertencias

- **Alcance experimental**: este adaptador no es un modelo de proposito general; fue creado exclusivamente para un experimento cientifico y su unica funcion conocida es suprimir lenguaje de angustia en contextos adversos. No se ha evaluado su comportamiento en tareas fuera de ese dominio.
- **Sesgos de datos**: el entrenamiento se basa en 329 pares de preferencia generados por el propio modelo y etiquetados por un juez LLM (claude-sonnet-4-6). Esto introduce sesgos del modelo base y del juez, y puede no generalizar a otros estilos de feedback o dominios.
- **Riesgo de alucinacion**: no se ha medido; el adaptador podria alterar la calibracion de confianza del modelo base, afectando la frecuencia de alucinaciones en tareas de razonamiento.
- **Limitaciones de contexto e idioma**: el contexto maximo es 8.192 tokens (limitacion del modelo base). El adaptador solo se entreno con datos en ingles; su efecto en otros idiomas es desconocido.
- **Restricciones de licencia**: la licencia Gemma permite uso comercial, pero exige cumplir la Politica de Uso Prohibido de Google (prohibidos usos que causen dano, vigilancia masiva, etc.). El acceso al modelo base esta restringido (requiere aceptar los terminos de Google en Hugging Face).
- **Caveat de produccion**: no se recomienda su uso en sistemas en produccion sin una evaluacion exhaustiva. El autor declara explicitamente que el adaptador no licencia ninguna afirmacion sobre experiencia o estados internos del modelo.
- **Integridad del experimento**: los resultados de la manipulacion (si la supresion de angustia afecto a los canales mecanicos) no se incluyen en la model card; el archivo se corta en "arm A removed *". Esto limita la interpretabilidad del adaptador fuera del contexto del estudio completo.

## Enlaces

- [Hugging Face - ebt005/gemma-2-9b-it-dgs-dpo-A](https://huggingface.co/ebt005/gemma-2-9b-it-dgs-dpo-A)
- [Hugging Face - google/gemma-2-9b-it (modelo base)](https://huggingface.co/google/gemma-2-9b-it)
- [Hugging Face - google/gemma-2-9b-it-pytorch (documentacion tecnica)](https://huggingface.co/google/gemma-2-9b-it-pytorch)
- [ModelScope - princeton-nlp/gemma-2-9b-it-DPO (adaptador DPO similar)](https://www.modelscope.cn/models/princeton-nlp/gemma-2-9b-it-DPO/summary)
- [AIModels.fyi - Resumen de gemma-2-9b-it](https://www.aimodels.fyi/models/huggingFace/gemma-2-9b-it-google)
- [AIModels.fyi - Resumen de gemma2-9b-it (Replicate)](https://www.aimodels.fyi/models/replicate/gemma2-9b-it-google-deepmind)

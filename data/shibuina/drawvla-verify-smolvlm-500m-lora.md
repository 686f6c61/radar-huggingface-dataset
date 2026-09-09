# shibuina/drawvla-verify-smolvlm-500m-lora

## Resumen

El modelo `shibuina/drawvla-verify-smolvlm-500m-lora` es un adaptador LoRA sobre el modelo de vision-lenguaje `HuggingFaceTB/SmolVLM-500M-Instruct`, desarrollado por shibuina (Do Duc Anh). Su función es actuar como validador de instrucciones basadas en bocetos en escenas robóticas: dada una imagen con un círculo que marca el objeto y una flecha que indica el lugar, junto con una instrucción sin nombres, como "put this there", decide si la instrucción es correcta (coherente, consistente y suficiente) o incorrecta.

Esta tarea de verificación resulta relevante en pipelines de robot learning que generan datos sintéticos a partir de grounding espacial, ya que permite filtrar instancias inconsistentes antes de usarlas para entrenar políticas. El adaptador se entrenó sobre el dataset `shibuina/drawvla-prompt-validation`, basado en LIBERO, e incorpora 14 modos de corrupción. Aunque es un modelo pequeño, su enfoque está especializado en un subproblema concreto de validación, y mantiene una precisión importante en su conjunto de prueba.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLM-500M-Instruct (vision-language) con adaptador LoRA |
| Parametros totales | 500M (modelo base) + parametros LoRA no publicados |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (adaptador en safetensors; sin datos de cuantizacion) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptador) y configuracion PEFT |

## Arquitectura y entrenamiento

El adaptador LoRA se monta sobre el modelo base `SmolVLM-500M-Instruct`, un modelo vision-lenguaje de la familia SmolVLM que procesa imágenes y texto de forma conjunta. La configuración LoRA utiliza `r=16`, `alpha=32` y dropout de 0.05, aplicando el adaptador a todas las proyecciones de atención y MLP. El entrenamiento se realizó durante 3 épocas con una tasa de aprendizaje de `1e-4`, programador cosine, 3% de warmup y semilla 17.

El dataset de entrenamiento es `shibuina/drawvla-prompt-validation`, que está compuesto por prompts sintéticos derivados de LIBERO y modificados con 14 modos de corrupción y distintas configuraciones de grounding. No se ha indicado el número total de muestras de entrenamiento, ni se menciona el uso de RLHF o DPO.

## Capacidades

- Clasificación binaria de instrucciones espaciales: decide si una instrucción dibujada sobre una escena robótica (círculo + flecha) es válida o no.
- Detección de inconsistencia entre el boceto y la instrucción textual, incluyendo casos de sufijo incompleto, objeto incorrecto o dirección ambigua.
- Trabaja con instrucciones sin nombres de objetos (“put this there”), lo que lo hace útil para evaluar grounding visual.
- Procesa imágenes y texto de manera conjunta mediante el pipeline `image-text-to-text`.
- No soporta tool calling, razonamiento multi-paso ni generación de texto de propósito general: su salida se reduce a la probabilidad entre las alternativas `verdict: right` y `verdict: wrong`.

## Casos de uso

- Validación automática de prompts sintéticos en robótica: el adaptador se integra en pipelines de generación de datos para descartar instrucciones etiquetadas incorrectamente antes de entrenar políticas de manipulación.
- Control de calidad de anotaciones humano-robot: cuando un operario dibuja un círculo y una flecha sobre una imagen para indicar "pon esto ahí", el modelo verifica si la anotación es coherente y suficiente para un robot.
- Filtrado de datos de imitación basada en bocetos: en frameworks de aprendizaje por imitación, permite limpiar los conjuntos de entrenamiento que utilizan este tipo de instrucciones espaciales.
- Auditoría de datasets de grounding visual: ayuda a identificar prompts ambiguos o inconsistentes en datasets como LIBERO o en versiones sintéticas derivadas.
- Asistencia al etiquetado: el modelo puede pre-etiquetar un boceto como válido o inválido, reduciendo el tiempo de revisión humana en la anotación de grandes volúmenes de escenas.
- Evaluación de robustez de generadores de prompts: si un sistema genera instrucciones con referencias espaciales dibujadas, el adaptador puede usarse como métrica de calidad de esas instrucciones.

## Benchmarks y rendimiento

El autor publica los resultados en un split de test sintético de 3.966 filas, con la clase positiva correspondiente a instrucciones válidas:

| Metrica | Valor |
|---|---|
| Accuracy | 0.895 |
| Balanced accuracy | 0.836 |
| Macro-F1 | 0.855 |
| MCC | 0.716 |
| AUROC | 0.949 |
| Recall (invalidos) | 0.959 |
| Recall (validos) | 0.714 |

El autor advierte que un clasificador basado únicamente en geometría alcanza 0.932 de accuracy en el mismo split, por lo que el benchmark sintético es en gran parte separable a partir de las coordenadas del boceto. Por tanto, los resultados en bocetos dibujados por humanos serán previsiblemente inferiores, y los valores reportados deben interpretarse como una estimación optimista.

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware para este adaptador.
- Dado que el modelo base es de 500M de parámetros, se puede ejecutar en GPU de consumo. Se estima que se necesitan al menos 4-6 GB de VRAM en bfloat16 para el modelo base, más un overhead pequeño del adaptador LoRA.
- La integración típica se realiza mediante `transformers` con `peft` (`PeftModel.from_pretrained`).
- En servidores con GPU de mayor capacidad (A100, H100), el modelo puede ejecutarse sin problemas, aunque no se dispone de medidas de latencia ni throughput publicadas.
- No se menciona compatibilidad con vLLM, llama.cpp ni Ollama en la información disponible; el uso documentado se limita a Transformers + PEFT.

## Comparativa con modelos similares

No se ha encontrado información sobre modelos comparables para la tarea específica de validación de instrucciones con bocetos en la documentación proporcionada. El modelo base `SmolVLM-500M-Instruct` podría compararse con otros modelos de visión-lenguaje pequeños, pero no existe una comparativa directa publicada para la tarea del adaptador.

## Limitaciones y advertencias

- El rendimiento se reduce aproximadamente a la mitad si se usa el adaptador con un prompting distinto al entrenado. El autor especifica que la entrada debe incluir la imagen más `<VERDICT_INSTRUCTION>\n\nCaption: <caption>` y que el veredicto se selecciona mediante la log-verosimilitud del span de etiqueta (`verdict: right` vs `verdict: wrong`).
- El conjunto de test sintético es en gran parte separable por características geométricas; un clasificador que solo tiene en cuenta las coordenadas del boceto logra 0.932 de accuracy, por lo que el benchmark no refleja la dificultad de casos con bocetos humanos.
- El recall sobre la clase válida es 0.714, lo que puede generar falsos negativos (rechazar instrucciones válidas) si se usa como filtro estricto sin ajuste adicional de umbral.
- Está limitado al dominio de escenas robóticas con anotaciones de círculo y flecha; es probable que su generalización a otros tipos de bocetos, objetos o dominios sea pobre.
- No se dispone de información sobre los idiomas soportados, aunque el dominio mencionado usa instrucciones en inglés.
- El adaptador es específico para `SmolVLM-500M-Instruct`; no es directamente reutilizable sobre otros modelos base sin volver a entrenarlo.
- La licencia Apache-2.0 permite uso comercial, pero el dataset de entrenamiento puede tener sus propias restricciones no documentadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shibuina/drawvla-verify-smolvlm-500m-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/shibuina/drawvla-prompt-validation
- Autor en Hugging Face: https://huggingface.co/shibuina
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolVLM-500M-Instruct
- Repositorio DrawVLA: no disponible (referenciado en la model card, sin URL pública)

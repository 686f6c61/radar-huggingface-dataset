# shibuina/drawvla-verify-qwen3vl-2b-lora

## Resumen

El modelo `drawvla-verify-qwen3vl-2b-lora` es un adaptador LoRA desarrollado por `shibuina` sobre el modelo base `Qwen/Qwen3-VL-2B-Instruct`. Su función es actuar como validador de instrucciones visuales en robótica: a partir de una imagen de una escena con un círculo (que indica el objeto) y una flecha (que indica dónde colocarlo), junto con una descripción breve sin nombres de objetos (por ejemplo, `"put this there"`), decide si la instrucción es correcta, consistente y suficiente, o si es incorrecta.

El adaptador se entrenó sobre el dataset propio `shibuina/drawvla-prompt-validation`, compuesto por prompts sintéticos generados a partir de entornos de manipulación robótica LIBERO, con 14 modos de corrupción y distintas configuraciones de anclaje. La arquitectura resultante es un modelo de visión-lenguaje (image-text-to-text) que se puntúa mediante la log-verosimilitud de un span de etiqueta, no mediante generación libre.

La relevancia del modelo radica en la verificación automática de instrucciones basadas en bocetos, un paso crítico para evitar que un sistema robótico ejecute órdenes ambiguas o erróneas. El repositorio pesa 0,1 GB y solo contiene los pesos del adaptador, por lo que necesita el modelo base para funcionar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (imagen-texto a texto) con adaptador LoRA sobre Qwen/Qwen3-VL-2B-Instruct |
| Parametros totales | No disponible (el repositorio solo contiene el adaptador; el modelo base Qwen3-VL-2B-Instruct tiene 2B parámetros) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no especificada por el autor) |
| Tipos de cuantizacion | No disponible (los pesos del adaptador se distribuyen en safetensors; el README indica cargar el modelo base en bfloat16) |
| Idiomas soportados | No disponible (en el README no se indica; el caption de ejemplo está en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors) con configuración PEFT |
| Modelo base | Qwen/Qwen3-VL-2B-Instruct |
| Pipeline | image-text-to-text |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3-VL-2B-Instruct, un modelo de visión-lenguaje basado en transformer. Se aplican adaptadores LoRA con `r=16`, `alpha=32` y `dropout=0,05` sobre todas las proyecciones de atención y MLP. El entrenamiento se realizó durante 3 épocas con una tasa de aprendizaje de `1e-4`, programación coseno, un 3 % de warmup y semilla 17.

El dataset de entrenamiento es `shibuina/drawvla-prompt-validation`, compuesto por prompts sintéticos basados en entornos LIBERO, con 14 modos de corrupción y configuraciones de anclaje. La innovación técnica principal es el procedimiento de puntuación: en lugar de generar un token, el modelo asigna una etiqueta mediante la log-verosimilitud del span `"verdict: right"` frente a `"verdict: wrong"` tras el prompt `<VERDICT_INSTRUCTION>\n\nCaption: <caption>`. Esto convierte al adaptador en un clasificador binario de validez, no un modelo generativo.

## Capacidades

- Validación de instrucciones visuales en robótica: determina si una orden compuesta por un círculo (objeto) y una flecha (destino) sobre una imagen de escena es correcta, consistente y suficiente.
- Clasificación binaria de veredicto: devuelve `"right"` o `"wrong"` mediante log-verosimilitud de span, no mediante generación libre.
- Entrenado para detectar 14 modos de corrupción en prompts de manipulación, lo que cubre fallos de anclaje, objetos ausentes, destinos ambiguos y otras configuraciones erróneas.
- Compatible con el pipeline `image-text-to-text` de Hugging Face.
- Se integra con `transformers` y `peft` mediante `PeftModel.from_pretrained`.
- No se han descrito capacidades de tool calling, agentes, razonamiento multi-paso o generación multilingüe en la información proporcionada.
- Uso previsto en flujos de verificación de datos para modelos VLA (vision-language-action).

## Casos de uso

- Validación previa a la ejecución en teleoperación robótica: un operador dibuja un círculo sobre el objeto y una flecha sobre la posición de destino en una imagen de la escena, y escribe una instrucción corta como `"put this there"`. El adaptador verifica que la orden sea válida antes de enviarla al sistema de planificación. Es adecuado porque está entrenado específicamente para distinguir instrucciones correctas de incorrectas, con un AUROC de 0,96 en datos sintéticos.
- Control de calidad en anotación de datasets de manipulación: en pipelines de generación de datos para robots, se pueden filtrar automáticamente muestras con bocetos corruptos o ambiguos. El adaptador ofrece un recall de 0,939 sobre prompts inválidos, lo que reduce la presencia de errores en los datos de entrenamiento.
- Interfaz de usuario para personas no expertas: en un sistema de interacción humano-robot, el usuario puede indicar la tarea mediante un boceto sobre una cámara. El modelo valida en tiempo real si la instrucción es suficiente y coherente, evitando fallos por órdenes mal definidas.
- Integración en sistemas de aprendizaje por imitación: antes de usar una demostración con anotaciones de boceto como dato de entrenamiento, el adaptador puede comprobar que la combinación de objeto y destino es correcta, aumentando la calidad de los datos y reduciendo la revisión manual necesaria.
- Robustez en entornos LIBERO: el adaptador se diseñó para prompts derivados de LIBERO, por lo que puede emplearse para detectar errores en configuraciones de tareas de manipulación en este benchmark, validando la correspondencia entre el boceto y el caption.
- Componente de verificación en sistemas VLA: puede situarse antes de un modelo de visión-lenguaje-acción para descartar instrucciones visuales inválidas. Al ser un adaptador ligero sobre un modelo de 2B, su coste de cómputo es bajo y puede instalarse en pipelines de inferencia con `transformers`.

## Benchmarks y rendimiento

| Split | Accuracy | Balanced acc | Macro-F1 | MCC | AUROC |
|---|---|---|---|---|---|
| Synthetic test (hold-out, 3.966 filas) | 0,905 | 0,869 | 0,880 | 0,750 | 0,960 |
| Human-drawn sketches (280 filas, etiquetas manuales) | 0,629 | no disponible | no disponible | 0,276 | 0,721 |

El recall sobre prompts inválidos es de 0,939 y sobre prompts válidos de 0,799. El autor advierte que un clasificador geométrico puro alcanza 0,932 de accuracy en el mismo split sintético, por lo que las métricas sintéticas son en gran parte separables por coordenadas; se recomienda usar los resultados de bocetos humanos como estimación de despliegue. No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El adaptador es ligero (0,1 GB), pero requiere el modelo base Qwen3-VL-2B en bfloat16. No se proporcionan mediciones de VRAM.
- GPU recomendadas: no disponibles. Al ser un modelo de 2B, se espera que pueda ejecutarse en GPUs de consumo, pero no hay datos confirmados por el autor.
- Opciones de despliegue: según el README, se carga con `transformers` y `peft` usando `AutoModelForImageTextToText` y `PeftModel.from_pretrained`. No se indican configuraciones específicas para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. En la información proporcionada no se mencionan adaptadores o modelos comparables. El autor solo compara el rendimiento del adaptador con un clasificador geométrico simple, que alcanza 0,932 de accuracy en el split sintético. No se dispone de datos de otros modelos equivalentes para comparar.

## Limitaciones y advertencias

- El rendimiento en bocetos dibujados a mano es sensiblemente inferior al de los datos sintéticos (accuracy de 0,629 frente a 0,905). El autor advierte que las métricas sintéticas están en gran parte separables por coordenadas geométricas, por lo que el rendimiento real de despliegue debe estimarse con los resultados de bocetos humanos.
- El adaptador requiere el prompt de evaluación exacto: `<VERDICT_INSTRUCTION>\n\nCaption: <caption>` y la puntuación de log-verosimilitud del span. Usar otro formato, por ejemplo un system prompt o puntuar el siguiente token sin el span, reduce los márgenes a aproximadamente la mitad.
- No es un modelo generativo: no está diseñado para producir descripciones ni responder preguntas libres; su única salida es una clasificación binaria de validez.
- El recall sobre prompts válidos es de 0,799, lo que implica un 20 % de falsos negativos en muestras sintéticas. En bocetos humanos, el MCC desciende a 0,276, señalando una baja concordancia en escenarios reales.
- La generalización fuera de dominios de manipulación robótica (LIBERO) no está garantizada; el dataset de entrenamiento es sintético y acotado.
- No se han documentado evaluaciones de sesgos o alucinaciones.
- La licencia del adaptador es Apache-2.0, lo que permite uso comercial, pero debe comprobarse la licencia del modelo base Qwen3-VL-2B-Instruct y del dataset de entrenamiento (MIT).

## Enlaces

- HuggingFace: https://huggingface.co/shibuina/drawvla-verify-qwen3vl-2b-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/shibuina/drawvla-prompt-validation
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Referencia al repositorio DrawVLA en el README (training/vlm_training.py, training/train_local.py); no se dispone de URL en la información consultada.

# kaonai/grpo-kaon3-cr5c-calibrated-mean-n18-b004-step100

## Resumen

El modelo `grpo-kaon3-cr5c-calibrated-mean-n18-b004-step100` es un checkpoint de pesos completos creado por kaonai, derivado del modelo base `kaon-c-gemma4-26b-v10.1` de la familia Gemma 4. Tiene 25.805.933.872 parámetros y se publica en formato safetensors con precisión bfloat16. Es el resultado de un entrenamiento con GRPO y recompensa de consenso, correspondiente al paso 100 de un run específico, con agregación calibrada de márgenes R/S/W y muestreo N18.

La model card lo califica como "suggested unevaluated checkpoint", lo que significa que no ha sido evaluado formalmente. No se dispone de datos sobre longitud de contexto, idiomas, licencia ni benchmarks, por lo que su aplicabilidad práctica aún no está validada.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No especificada en la información disponible (modelo de la familia Gemma 4) |
| Parámetros totales | 25.805.933.872 (25,8B) |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

La arquitectura interna no se detalla en la información disponible; por el número de parámetros se trata de un modelo denso de en torno a 26B. El repositorio contiene un merge de pesos completos en bfloat16, no un adaptador PEFT separado. La model card indica que se verificó la paridad de logits representativos entre el merge y el modelo base.

El entrenamiento utiliza GRPO con una función de recompensa de consenso. Los hiperparámetros publicados son: learning rate 1e-4, beta 0.04, seed 42. La agregación de recompensa se denomina "calibrated mean" sobre márgenes calibrados R/S/W, y el muestreo es N18 -> bottom3 + top3 con un criterio estricto de consenso de signo a tres bandas. No se proporciona información sobre el dataset de entrenamiento ni sobre otras técnicas como RLHF o DPO.

## Capacidades

- Generación de texto y diálogo conversacional, según el pipeline `text-generation` y la etiqueta `conversational`.
- El modelo está etiquetado como `image-text-to-text`, lo que sugiere capacidad para procesar imágenes como entrada, aunque la model card no documenta esta funcionalidad ni su rendimiento.
- Al estar entrenado con GRPO y una recompensa de consenso, el modelo puede presentar comportamientos orientados a maximizar la señal de recompensa específica del run, en lugar de un rendimiento general alineado.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-step.
- No se especifican los idiomas soportados ni modos especiales como "thinking" o audio.

## Casos de uso

- Investigación en entrenamiento con RL: el checkpoint es una instantánea concreta de un proceso de GRPO. Puede compararse con otros pasos del mismo run para estudiar cómo evoluciona la agregación de recompensa calibrada y el consenso de tres bandas.
- Evaluación de señales de recompensa: los márgenes R/S/W calibrados y el muestreo N18 permiten analizar si el modelo responde de manera consistente con el consenso de signo bajo diferentes condiciones de muestreo.
- Prototipos conversacionales internos: con 25,8B de parámetros, puede ejecutarse en entornos con GPU de alta VRAM para probar asistentes de dominio restringido antes de una evaluación formal.
- Exploración multimodal: aunque no está documentado, la etiqueta `image-text-to-text` abre la posibilidad de experimentar con entradas de imagen y texto en tareas de descripción o instrucciones visuales.
- Base para nuevos experimentos de fine-tuning: al ser un merge de pesos completos, puede servir como punto de partida para continuar entrenando con GRPO, DPO u otras técnicas de alineación.
- Punto de referencia para comparación de alineación: permite comparar el comportamiento del modelo con el base `kaon-c-gemma4-26b-v10.1` y evaluar el efecto del entrenamiento con recompensa de consenso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que el checkpoint es "suggested unevaluated", por lo que no se han verificado métricas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 ocupan aproximadamente 51,6 GB, por lo que se requieren al menos 60-70 GB de VRAM para inferencia con un batch pequeño, incluyendo activaciones y caché KV.
- GPU recomendadas: NVIDIA A100 80GB, H100 80GB, o configuraciones multi-GPU con 2x RTX 4090 mediante tensor parallel.
- Consumer GPU: una RTX 4090 (24GB) no puede cargar el modelo completo sin cuantización. No se han publicado cuantizaciones; se requeriría una conversión manual a 4-bit o 8-bit, que no está validada.
- Opciones de despliegue: el modelo es compatible con la librería transformers y safetensors; puede servirse con vLLM o Hugging Face Text Generation Inference. No hay soporte nativo para llama.cpp u Ollama sin conversión a GGUF.
- Latencia y throughput: no disponible, al no existir benchmarks publicados.

## Comparativa con modelos similares

No disponible. No se han publicado resultados de benchmarks ni información suficiente sobre el modelo base para compararlo con alternativas de la misma categoría (tamaño 25-30B). La licencia y el contexto tampoco están especificados, lo que impide una comparación fiable.

## Limitaciones y advertencias

- La model card indica "Status: suggested unevaluated checkpoint; publication is not promotion authorization". Esto significa que la publicación no debe interpretarse como una validación o recomendación para producción.
- La licencia no está indicada, por lo que el uso comercial es incierto y requiere consulta con el autor.
- No se especifican los idiomas soportados ni la longitud de contexto, lo que limita su uso en aplicaciones multilingües o de contexto largo sin pruebas previas.
- No hay benchmarks publicados, por lo que no se conoce el rendimiento en tareas estándar de razonamiento, matemáticas o código.
- Al tratarse de un modelo entrenado con una señal de recompensa específica (GRPO con consenso), puede existir sobreoptimización y comportamientos no deseados fuera del dominio de esa recompensa.
- No se han publicado cuantizaciones ni medidas de estabilidad, por lo que el comportamiento a largo plazo en despliegues continuos no está verificado.

## Enlaces

- HuggingFace: https://huggingface.co/kaonai/grpo-kaon3-cr5c-calibrated-mean-n18-b004-step100

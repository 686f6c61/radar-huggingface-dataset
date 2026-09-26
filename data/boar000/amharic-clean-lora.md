# boar000/amharic-clean-lora

## Resumen
El modelo boar000/amharic-clean-lora es un adaptador LoRA (Low-Rank Adaptation) para el ajuste fino en amhárico, desarrollado por el usuario boar000. Se trata de un checkpoint público que actúa como espejo para el fine-tuning de dos modelos base: Gemma-4 E4B y rasyosef Llama-3.2-1B-Amharic. El entrenamiento se llevó a cabo con Unsloth QLoRA sobre dos GPUs Kaggle T4, utilizando el script `finetune_amharic.py` y el plan `finetuning_plans_2.md`. El propósito es servir como punto de reanudación para entrenamientos continuados o destilación.

El repositorio incluye checkpoints intermedios en `<run>/checkpoint-<step>/` y el adaptador final en `<run>/final_lora/`, con ejemplos como `e4b_clean/` y `1b_clean/`. No se proporcionan datos sobre arquitectura interna, número de parámetros, longitud de contexto, licencia o benchmarks. Es relevante para investigadores que trabajan en procesamiento de lenguaje natural para amhárico, un idioma de bajos recursos, y que necesitan reproducir o continuar experimentos de fine-tuning eficiente.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Gemma-4 E4B y Llama-3.2-1B-Amharic |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (entrenamiento con QLoRA 4-bit) |
| Idiomas soportados | amhárico |
| Licencia | no disponible |
| Formato de pesos | no disponible |

El adaptador LoRA no es un modelo autónomo; requiere cargar el modelo base correspondiente para su uso.

## Arquitectura y entrenamiento
La arquitectura subyacente es un adaptador LoRA, una técnica de ajuste fino eficiente que congela los pesos del modelo base e inserta matrices de bajo rango en las capas del transformer. En este caso, se aplica sobre dos modelos base: Gemma-4 E4B (un modelo de la familia Gemma, aunque no se detallan sus especificaciones) y rasyosef Llama-3.2-1B-Amharic (un modelo Llama 3.2 de 1B de parámetros ajustado para amhárico). El entrenamiento se realizó con QLoRA, que cuantiza el modelo base a 4 bits para reducir el uso de memoria, utilizando la biblioteca Unsloth sobre dos GPUs Kaggle T4. El script de entrenamiento es `asr-lab/scripts/finetune_amharic.py` y el plan se describe en `asr-lab/finetuning_plans_2.md`.

No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se detallan innovaciones técnicas adicionales más allá del uso de QLoRA y Unsloth para eficiencia. El checkpoint está pensado para reanudar entrenamientos o para destilación, lo que sugiere que el proceso de fine-tuning no ha finalizado necesariamente.

## Capacidades
- Generación de texto en amhárico: el adaptador está diseñado para mejorar el rendimiento de los modelos base en este idioma, según el nombre y la descripción.
- No se especifican capacidades de razonamiento, matemáticas, código o visión.
- No hay información sobre soporte de tool calling o function calling.
- No se menciona soporte para agentes o razonamiento multi-paso.
- Capacidades multilingües: solo se indica amhárico; no se garantiza el soporte de otros idiomas.
- No se describe ningún modo especial como thinking mode, visión o audio.

## Casos de uso
- Continuación del fine-tuning: el checkpoint permite reanudar el entrenamiento desde un paso intermedio o desde el adaptador final, utilizando más datos o ajustando hiperparámetros. Es adecuado porque incluye estados intermedios y el modelo final.
- Destilación de conocimiento: el adaptador puede usarse para transferir el conocimiento adquirido en amhárico a un modelo más pequeño o a otra arquitectura, aprovechando que se entrenó con QLoRA y Unsloth.
- Investigación en PLN para amhárico: sirve como punto de partida para experimentos de fine-tuning en un idioma de bajos recursos, permitiendo comparar técnicas de cuantización y ajuste eficiente.
- Generación de texto en amhárico: combinado con el modelo base, puede desplegarse para tareas de generación de texto, como traducción, resumen o chat, aunque no se especifican métricas de calidad.
- Evaluación de modelos base: permite medir el impacto del fine-tuning en amhárico sobre Gemma-4 E4B y Llama-3.2-1B-Amharic, comparando el rendimiento antes y después.
- Reproducibilidad de experimentos: al ser un espejo público, facilita la replicación de los resultados del entrenamiento original, siempre que se disponga del mismo entorno (Kaggle T4 x2, Unsloth, script).
- Ajuste para dominios específicos: se puede continuar el entrenamiento con datos de un dominio concreto (por ejemplo, médico o legal) para especializar el modelo en amhárico.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- El adaptador LoRA en sí ocupa típicamente decenas de megabytes, pero para inferencia se debe cargar el modelo base completo.
- Para el modelo base Llama-3.2-1B-Amharic: VRAM estimada de 2-4 GB en FP16 y 1-2 GB en cuantización 4-bit. Cabe en GPUs de consumo como GTX 1650, RTX 3050, RTX 4060, etc.
- Para el modelo base Gemma-4 E4B: no se dispone de información sobre su tamaño o requisitos, por lo que no se puede estimar la VRAM.
- GPU recomendadas: para Llama-3.2-1B, cualquier GPU con al menos 4 GB de VRAM; para Gemma-4 E4B, no disponible.
- Opciones de despliegue: se puede usar con llama.cpp, Ollama, vLLM, TGI o directamente con Unsloth, aplicando el adaptador LoRA sobre el modelo base. También es compatible con bibliotecas como PEFT.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No se dispone de información sobre modelos comparables en la información proporcionada. Este es un adaptador LoRA, no un modelo completo, por lo que la comparación directa con modelos de lenguaje completos no es aplicable sin conocer el modelo base y sus resultados.

## Limitaciones y advertencias
- Licencia no especificada: no se puede determinar si es apto para uso comercial.
- Es un adaptador LoRA, no un modelo autónomo; requiere el modelo base para funcionar.
- No se proporcionan datos sobre sesgos, alucinaciones o limitaciones de contexto.
- El único idioma soportado según la información es el amhárico; no se garantiza el multilingüismo.
- Al ser un checkpoint de investigación con 0 descargas y 0 likes, no ha sido validado por la comunidad.
- La fecha de creación indicada es 2026, lo que podría deberse a un error o a un modelo futuro; no se puede verificar.
- No se especifican los términos de uso ni restricciones adicionales.
- El rendimiento real en tareas downstream es desconocido al no haber benchmarks.

## Enlaces
- HuggingFace: https://huggingface.co/boar000/amharic-clean-lora
- No se proporcionan otros enlaces (paper, blog, repositorio, demo). El plan de fine-tuning se menciona como `asr-lab/finetuning_plans_2.md`, pero no se ofrece URL pública.

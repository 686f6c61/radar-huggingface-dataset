# sbcho0325/EXAONE-3.5-7.8B-verireason_random_sft_seed2026_step340

## Resumen

Este modelo es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario sbcho0325, que aplica un fine-tuning mediante supervisión directa (SFT) sobre el modelo base LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct, un LLM de 7.800 millones de parámetros desarrollado por LG AI Research. El nombre del repositorio sugiere un experimento de verificación de razonamiento con una semilla aleatoria (seed2026) y un paso de entrenamiento concreto (step340), probablemente orientado a investigación sobre el comportamiento del modelo en tareas de razonamiento.

El adaptador pesa 0,3 GB y se distribuye en formato safetensors, con la librería PEFT. No se proporciona información sobre la licencia, los idiomas soportados, los datos de entrenamiento ni los resultados de evaluación. Al ser un adaptador LoRA, no es un modelo autónomo: debe cargarse junto con el modelo base EXAONE-3.5-7.8B-Instruct para realizar inferencia.

La relevancia de esta publicación reside en su carácter experimental: muestra un fine-tuning con LoRA sobre un modelo de última generación, pero la ausencia de documentación y de métricas limita su uso práctico directo. Para desarrolladores, sirve como ejemplo de cómo adaptar EXAONE-3.5 mediante PEFT, aunque no se puede validar su calidad sin más datos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer (modelo base EXAONE-3.5-7.8B-Instruct) |
| Parametros totales | No disponible (adaptador de 0,3 GB; el modelo base tiene 7.800 millones) |
| Parametros activos | No aplicable (adaptador LoRA) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado mediante SFT (supervised fine-tuning) sobre el modelo base EXAONE-3.5-7.8B-Instruct. La técnica LoRA congela los pesos del modelo original e introduce matrices de bajo rango en las capas de atención y feed-forward, lo que permite un ajuste eficiente con un número reducido de parámetros entrenables. El adaptador resultante se combina con el modelo base en tiempo de inferencia.

No se dispone de información sobre el dataset utilizado, el número de tokens de entrenamiento, el hiperparámetro de rango (rank) de LoRA, la tasa de aprendizaje, el régimen de precisión (fp16, bf16, etc.) ni el tiempo de cómputo. El nombre del repositorio indica una semilla aleatoria (seed2026) y un paso de entrenamiento concreto (step340), lo que sugiere un experimento controlado, pero sin detalles adicionales.

## Capacidades

- No se documentan capacidades específicas del adaptador en la model card.
- Al ser un adaptador LoRA sobre EXAONE-3.5-7.8B-Instruct, se espera que herede las capacidades del modelo base, que incluyen generación de texto, razonamiento, comprensión de contexto largo y soporte multilingüe (según la ficha pública del modelo base de LG AI Research). Sin embargo, esta herencia no está confirmada por el autor del adaptador.
- No se indica soporte para tool calling, agentes, visión u otras modalidades.

## Casos de uso

- No se proporcionan casos de uso documentados en la model card.
- Dado que es un adaptador LoRA experimental, su aplicación más plausible es la investigación académica o la reproducción de experimentos de fine-tuning sobre EXAONE-3.5. Un desarrollador podría cargarlo junto con el modelo base para probar su comportamiento en tareas de razonamiento, pero sin métricas de referencia no se puede recomendar para entornos de producción.
- Para uso en producción, se recomienda utilizar el modelo base EXAONE-3.5-7.8B-Instruct directamente o adaptadores con documentación completa y evaluación publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Al ser un adaptador LoRA, la inferencia requiere cargar el modelo base EXAONE-3.5-7.8B-Instruct (aproximadamente 15,6 GB en fp16) más el adaptador (0,3 GB). La VRAM total necesaria depende de la cuantización del modelo base.
- Para inferencia en fp16 se estima un mínimo de 16 GB de VRAM, lo que permite ejecutarlo en GPUs como RTX 4090 (24 GB) o A100 (40 GB). En cuantización de 8 bits o 4 bits, podría caber en GPUs con 8-12 GB, pero no hay datos oficiales.
- Opciones de despliegue: se puede usar con transformers + PEFT, vLLM (si soporta adaptadores LoRA), o convertir el modelo base a GGUF con el adaptador fusionado para usarlo con llama.cpp u Ollama. No se han probado estas opciones específicamente para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre otros adaptadores LoRA comparables en el mismo repositorio o con la misma configuración experimental.

## Limitaciones y advertencias

- La model card está incompleta: no se especifican licencia, idiomas, datos de entrenamiento ni evaluación, lo que impide verificar la legalidad de uso y el rendimiento.
- Al ser un adaptador LoRA sin documentación, no se puede garantizar que mantenga las capacidades del modelo base ni que esté libre de sesgos adicionales introducidos durante el fine-tuning.
- Riesgo de alucinación y de respuestas inexactas, inherente a los modelos de lenguaje, no mitigado por documentación específica.
- Para uso comercial, la licencia del modelo base EXAONE-3.5-7.8B-Instruct (que en su versión oficial es de tipo "EXAONE AI Model License Agreement" con restricciones) podría aplicar, pero la licencia de este adaptador es desconocida.
- No se recomienda su uso en producción sin una evaluación previa exhaustiva.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-verireason_random_sft_seed2026_step340
- Modelo base: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct

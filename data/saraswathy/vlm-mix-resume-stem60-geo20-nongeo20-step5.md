# Saraswathy/vlm-mix-resume-stem60-geo20-nongeo20-step5

## Resumen

Este repositorio contiene un punto de control de reanudación de entrenamiento (resume checkpoint) completo del proyecto EasyR1, correspondiente al paso 5 de entrenamiento. No se trata de un modelo independiente listo para inferencia, sino de un estado intermedio que incluye los shards del modelo FSDP y del optimizador, el estado extra, el estado del dataloader y el adaptador LoRA. El modelo base es `Qwen/Qwen3-VL-4B-Instruct`, un VLM de 4.000 millones de parámetros desarrollado por Qwen Team.

El propósito de este checkpoint es permitir la reanudación del entrenamiento desde el paso exacto en el que se detuvo, siguiendo el flujo de trabajo del proyecto EasyR1. La mezcla de datos de entrenamiento es 60% STEM, 20% geografía y 20% no geografía, lo que sugiere un enfoque en el razonamiento multimodal aplicado a dominios científicos y geográficos. Su relevancia radica en que facilita la reproducibilidad de experimentos y la inspección del proceso de entrenamiento, algo crítico para la investigación en aprendizaje por refuerzo de VLMs.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3-VL-4B-Instruct (VLM multimodal) + adaptador LoRA |
| Parámetros totales | 4.000 millones (base) + LoRA (tamaño no especificado) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (base Qwen3-VL-4B-Instruct soporta contexto largo, pero no se especifica) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (base Qwen3-VL-4B-Instruct soporta multilingüe) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA) + FSDP shards |

## Arquitectura y entrenamiento

El modelo base es `Qwen/Qwen3-VL-4B-Instruct`, un modelo de lenguaje multimodal con arquitectura Transformer, diseñado para procesar entradas de texto e imagen. El adaptador LoRA se entrena sobre este modelo base, y el checkpoint incluye el estado completo de entrenamiento según la metodología EasyR1, que utiliza GRPO (Group Relative Policy Optimization) para entrenamiento por refuerzo. La mezcla de datos del entrenamiento es 60% STEM, 20% geografía y 20% no geografía, aunque no se especifican los detalles del dataset (número de tokens, composición exacta, etc.).

No se indica si se emplearon técnicas como RLHF o DPO, pero el uso de GRPO sugiere un enfoque de optimización de políticas sin demostraciones de razonamiento. La innovación técnica principal de este repositorio no es la arquitectura en sí, sino la metodología de resumen de entrenamiento: permite reanudar exactamente desde el paso 5, lo que es útil para depurar y comparar configuraciones de entrenamiento.

## Capacidades

- **Visión y lenguaje**: al estar basado en Qwen3-VL-4B-Instruct, hereda las capacidades de comprensión de imágenes y generación de texto del modelo base.
- **Razonamiento multimodal**: el entrenamiento con datos STEM y geografía busca mejorar el razonamiento en problemas que combinan texto e imágenes.
- **Soporte de tool calling**: el modelo base Qwen3-VL-4B-Instruct soporta function calling, aunque no se especifica si el adaptador lo mantiene.
- **Entrenamiento por refuerzo**: el checkpoint está diseñado para reanudar el entrenamiento con GRPO, no para inferencia directa.

**Nota**: no es un modelo para uso directo en producción. Para utilizarlo, se debe fusionar el adaptador LoRA con el modelo base y exportar el modelo resultante.

## Casos de uso

- **Investigación en RL para VLMs**: el checkpoint permite reanudar experimentos de GRPO desde el paso 5, facilitando la comparación de configuraciones de entrenamiento.
- **Fine-tuning de VLMs para STEM**: el entrenamiento con 60% de datos STEM puede mejorar el rendimiento en problemas de ciencias, matemáticas e ingeniería.
- **Geografía y razonamiento espacial**: el 20% de datos de geografía busca mejorar la comprensión de mapas, coordenadas y razonamiento espacial.
- **Evaluación de estrategias de mezcla de datos**: la combinación 60/20/20 permite estudiar el impacto de la proporción de dominios en el rendimiento.
- **Reproducibilidad de experimentos**: el checkpoint completo (FSDP + optimizador + dataloader) permite reproducir exactamente el estado del entrenamiento.
- **Desarrollo de agentes educativos**: si se fusiona el adaptador, se podría usar para construir asistentes educativos en STEM y geografía, aunque no está validado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de rendimiento como MMLU, HumanEval o GSM8K. Se recomienda consultar el modelo base `Qwen/Qwen3-VL-4B-Instruct` para conocer sus capacidades de referencia.

## Requisitos de hardware

- **Entrenamiento**: el checkpoint está diseñado para reanudar entrenamiento con FSDP, lo que requiere múltiples GPUs (típicamente 4-8 GPUs con 24-80 GB de VRAM cada una).
- **Inferencia**: si se fusiona el adaptador, la inferencia con el modelo base de 4B parámetros requiere aproximadamente 8-10 GB de VRAM en FP16, o 4-5 GB en cuantización 4-bit.
- **GPU recomendadas**: para entrenamiento, A100 80GB o H100; para inferencia, RTX 4090 o superior.
- **Opciones de despliegue**: vLLM, llama.cpp, Ollama (si se exporta a GGUF), o TGI.
- **Latencia**: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos similares, ya que se trata de un checkpoint de entrenamiento, no de un modelo final. Como referencia, el modelo base Qwen3-VL-4B-Instruct se puede comparar con otros VLMs de tamaño similar como LLaVA-1.5-7B o Phi-3-vision-128k, pero no se han publicado resultados de este adaptador específico.

## Limitaciones y advertencias

- **No es un modelo funcional**: este repositorio no contiene un modelo fusionado listo para inferencia. Es un checkpoint de reanudación de entrenamiento.
- **Verificación de integridad**: se recomienda verificar todos los archivos contra `SHA256SUMS.json` antes de usarlo, para evitar corrupción de datos.
- **Dependencia del modelo base**: el adaptador solo funciona con el modelo base `Qwen/Qwen3-VL-4B-Instruct`. No es compatible con otras variantes.
- **Licencia**: no disponible. No se puede determinar si el uso comercial está permitido.
- **Sesgos**: no se han evaluado sesgos específicos del adaptador. El modelo base Qwen3-VL-4B-Instruct puede presentar sesgos comunes en modelos de lenguaje.
- **Riesgo de alucinación**: no se han documentado pruebas específicas, pero el modelo base puede alucinar en tareas de razonamiento complejas.
- **Soporte de producción**: no se recomienda usar este checkpoint en producción. Debe fusionarse y validarse antes de cualquier despliegue.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Saraswathy/vlm-mix-resume-stem60-geo20-nongeo20-step5
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Proyecto VLM Resume Lab: https://github.com/Icebinge/vlm-resume-lab
- Otros checkpoints del autor: https://huggingface.co/Saraswathy/vlm-mix-stem60-geometry40-direct-step100, https://huggingface.co/Saraswathy/vlm-mix-broader-stem-expert-step100

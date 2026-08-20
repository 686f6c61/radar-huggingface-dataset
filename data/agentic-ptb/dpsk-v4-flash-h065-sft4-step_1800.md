# agentic-ptb/dpsk-v4-flash.h065.sft4.step_1800

## Resumen

El modelo `agentic-ptb/dpsk-v4-flash.h065.sft4.step_1800` es un checkpoint intermedio de un barrido de fine-tuning experimental denominado AgentPTB, publicado por el usuario `agentic-ptb`. Se trata de un ajuste fino (SFT) sobre el modelo base `Qwen/Qwen3.5-9B-Base`, con aproximadamente 9,4 mil millones de parámetros. Según la model card, pertenece a la celda `dpsk-v4-flash`, con driver `pi / DeepSeek v4-flash` y esfuerzo de razonamiento `thinking`, lo que sugiere que se generaron datos sintéticos mediante un proceso de razonamiento guiado.

Este checkpoint no es un modelo final, sino un paso intermedio (step 1800) de un proceso de entrenamiento más amplio. Su relevancia es principalmente investigadora: sirve para estudiar el efecto de diferentes configuraciones de fine-tuning en modelos de razonamiento. No se ha publicado información sobre licencia, idiomas soportados ni benchmarks, por lo que su uso en producción no está recomendado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de Qwen3.5-9B-Base (no se especifican detalles) |
| Parametros totales | 9.409.813.744 (~9,4B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (repo en safetensors, probablemente bf16/fp16) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint base `Qwen/Qwen3.5-9B-Base`. No se proporcionan detalles sobre la arquitectura interna (número de capas, cabezas de atención, etc.) más allá de que hereda la del modelo base. El entrenamiento corresponde a un barrido (sweep) denominado AgentPTB, con una etapa SFT (sft4) y un paso concreto (step_1800). El driver indicado es `pi / DeepSeek v4-flash` con esfuerzo de razonamiento `thinking`, lo que apunta a que los datos de entrenamiento se generaron mediante un proceso de razonamiento automático, posiblemente usando un modelo tipo DeepSeek como generador. No se dispone de información sobre el dataset, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

No se han documentado capacidades específicas en la model card. Al ser un checkpoint intermedio de un fine-tuning sobre Qwen3.5-9B-Base, podría heredar las capacidades generales de ese modelo base (generación de texto, razonamiento, código, etc.), pero no hay datos verificables. La model card solo indica que el esfuerzo de razonamiento es `thinking`, lo que sugiere que el modelo fue entrenado para emitir cadenas de razonamiento antes de responder. No se menciona soporte para tool calling, agentes, visión ni audio.

## Casos de uso

No se han documentado casos de uso concretos. Dado que es un checkpoint intermedio de un experimento de investigación, no se recomienda su uso en aplicaciones reales. Posibles usos limitados:

- Investigación académica: estudiar el comportamiento de checkpoints intermedios en el proceso de fine-tuning.
- Análisis comparativo: evaluar la evolución del rendimiento a lo largo de los pasos de entrenamiento.
- Reproducción de experimentos: como parte de un pipeline de investigación reproducible.
- Generación de datos sintéticos: si se confirma que el modelo produce razonamiento útil, podría usarse para generar datos de entrenamiento para otros modelos.
- Pruebas de concepto: validar hipótesis sobre el efecto del esfuerzo de razonamiento en la calidad de las respuestas.
- Depuración de pipelines: servir como punto de control para depurar el proceso de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

No se proporcionan requisitos oficiales. A partir del número de parámetros (9,4B) y el tamaño del repositorio (18,8 GB), se puede estimar:

- VRAM estimada para inferencia en precisión completa (bf16/fp16): ~19 GB.
- VRAM estimada con cuantización 4-bit (si estuviera disponible): ~5-6 GB, pero no se ofrecen cuantizaciones.
- GPU recomendadas: tarjetas con al menos 24 GB de VRAM (RTX 3090, RTX 4090, A10G, A100 40GB) para inferencia sin cuantizar.
- En consumer GPU: cabría en una RTX 4090 (24 GB) con precisión completa, pero no en GPUs de 8-12 GB sin cuantizar.
- Opciones de despliegue: al ser un modelo en formato safetensors, podría usarse con vLLM, TGI o llama.cpp si se convierte a GGUF, pero no hay soporte oficial documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han publicado comparativas con otros modelos. El modelo base Qwen3.5-9B-Base podría ser un punto de referencia, pero no se dispone de sus especificaciones ni resultados en esta información.

## Limitaciones y advertencias

- Es un checkpoint intermedio, no un modelo final; su comportamiento puede ser inestable o incompleto.
- La model card advierte de un token EOS faltante: solo tiene `eos_token_id = [248044]` y falta el `248046`, lo que puede provocar generaciones que no terminen correctamente.
- No se especifica licencia, por lo que no está claro si se permite uso comercial o incluso académico.
- No hay documentación sobre sesgos, alucinaciones o limitaciones de idioma.
- No se recomienda su uso en producción sin una evaluación exhaustiva.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un artefacto de investigación con escasa adopción.

## Enlaces

- [HuggingFace: agentic-ptb/dpsk-v4-flash.h065.sft4.step_1800](https://huggingface.co/agentic-ptb/dpsk-v4-flash.h065.sft4.step_1800)

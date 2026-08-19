# huluhuluu/qwen3-1.7b-eagle3-sharegpt-sw768

## Resumen

Este repositorio contiene los checkpoints intermedios de un modelo de borrador (draft model) EAGLE3 entrenado con el framework SpecForge sobre el modelo objetivo Qwen3-1.7B. No es un modelo de lenguaje autónomo, sino un componente auxiliar diseñado para acelerar la inferencia mediante decodificación especulativa: el draft model genera secuencias de tokens candidatas que el modelo objetivo verifica en paralelo, reduciendo la latencia por token generado.

El draft model emplea una arquitectura `LlamaForCausalLMEagle3` de una sola capa con atención causal de ventana deslizante de 768 tokens. Se entrenó durante 10 épocas sobre el dataset `sharegpt_train.jsonl`, con un máximo de 467.800 pasos programados y un último checkpoint subido en el paso 425.000. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia de este modelo radica en que demuestra un enfoque práctico de entrenamiento de draft models para decodificación especulativa sobre un modelo de 1.7B parámetros, un escenario donde la aceleración es especialmente útil para despliegues en entornos con recursos limitados. Los checkpoints se distribuyen en intervalos de 5.000 pasos, lo que permite seleccionar el punto de entrenamiento más adecuado según el equilibrio entre precisión del draft y velocidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (draft model, 1 capa) |
| Parametros totales | no disponible (el modelo base Qwen3-1.7B tiene 1.700 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens (máxima secuencia de entrenamiento); ventana deslizante de atención de 768 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors) |

## Arquitectura y entrenamiento

El draft model sigue la arquitectura EAGLE3 implementada en SpecForge, con una única capa de transformador que utiliza atención causal con ventana deslizante de 768 tokens. Los pesos de embeddings del modelo objetivo están congelados y se cargan desde Qwen3-1.7B en tiempo de entrenamiento o inferencia; el checkpoint solo contiene los pesos de la capa draft. El backend de atención durante el entrenamiento es SDPA, mientras que el backend objetivo es SGLang con FlashInfer.

El entrenamiento se realizó sobre el dataset `sharegpt_train.jsonl` con 10 épocas, batch size 1, data parallel size 2, learning rate 0.0001, warmup ratio 0.015 y gradiente máximo de norma 0.5. La longitud máxima de secuencia fue de 2.048 tokens y el parámetro `ttt_length` (test-time training) se fijó en 7. El entrenamiento se llevó a cabo en bfloat16. Se guardaron checkpoints cada 5.000 pasos, totalizando 85 checkpoints subidos (del paso 5.000 al 425.000). No se especifica el uso de RLHF, DPO u otras técnicas de alineación; el entrenamiento es puramente supervisado sobre datos de conversación.

## Capacidades

- Generación de borradores de tokens para decodificación especulativa: el modelo predice secuencias de tokens que el modelo objetivo Qwen3-1.7B verifica, acelerando la inferencia.
- No es un modelo de lenguaje autónomo: no puede generar texto por sí mismo ni responder a prompts sin el modelo objetivo.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso de forma independiente.
- No tiene capacidades multimodales (visión, audio, etc.).
- El soporte multilingüe depende del modelo objetivo Qwen3-1.7B; el draft model en sí no tiene idiomas declarados.
- Integración prevista con SGLang y FlashInfer para el despliegue en producción.

## Casos de uso

- Aceleración de inferencia en servicios de chat: al desplegar Qwen3-1.7B con SGLang, el draft model puede reducir la latencia por token en conversaciones multi-turno, mejorando la experiencia del usuario final.
- Reducción de costes de cómputo en entornos con GPUs limitadas: al acelerar la generación, se puede atender el mismo número de peticiones con menos recursos hardware.
- Optimización de pipelines de generación de código: si el modelo objetivo se usa para autocompletar código, el draft model acelera la generación de secuencias largas sin cambiar la calidad del resultado.
- Experimentación con decodificación especulativa: los checkpoints intermedios permiten estudiar el efecto del número de pasos de entrenamiento en la tasa de aceptación del draft.
- Despliegue en entornos de baja latencia (edge o tiempo real): la ventana deslizante de 768 tokens reduce el coste de atención, haciendo viable la inferencia en hardware modesto.
- Investigación sobre draft models: el repositorio sirve como referencia para reproducir el entrenamiento de EAGLE3 con SpecForge sobre modelos de 1.7B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como tasa de aceptación, tokens por segundo o comparativas con otros draft models.

## Requisitos de hardware

- Al ser un draft model de una sola capa, los requisitos de VRAM son significativamente menores que los del modelo objetivo Qwen3-1.7B, aunque no se especifican cifras exactas.
- El despliegue requiere cargar tanto el draft model como el modelo objetivo Qwen3-1.7B en memoria; la VRAM total dependerá del modelo objetivo y de la cuantización elegida.
- Se recomienda el uso de SGLang con backend FlashInfer para la verificación especulativa, tal como se indica en la configuración de entrenamiento.
- No se proporcionan datos de latencia ni throughput estimados.
- No se indica compatibilidad con llama.cpp, Ollama o vLLM; el framework de referencia es SpecForge con SGLang.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la información proporcionada (otros draft models EAGLE3 para Qwen3-1.7B o similares).

## Limitaciones y advertencias

- Este modelo no es un modelo de lenguaje completo: no debe usarse de forma independiente para generar texto, responder preguntas o realizar tareas de NLP.
- Depende completamente del modelo objetivo Qwen3-1.7B; cualquier sesgo o limitación del modelo objetivo se traslada al sistema final.
- La ventana deslizante de 768 tokens limita el contexto que el draft model puede considerar al generar borradores; secuencias más largas pueden degradar la tasa de aceptación.
- No se han publicado evaluaciones de calidad ni de seguridad; el uso en producción requiere validación adicional.
- Los checkpoints son intermedios y no se indica cuál es el punto óptimo de entrenamiento; el usuario debe seleccionar el checkpoint según sus necesidades.
- La licencia Apache-2.0 permite uso comercial, pero se debe mantener la atribución correspondiente.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/huluhuluu/qwen3-1.7b-eagle3-sharegpt-sw768
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- No se proporcionan enlaces a papers, blogs o repositorios adicionales en la información disponible.

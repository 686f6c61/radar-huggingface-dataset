# Atomic-Germ/Aquila-mini-35B-A3B-NPU2

## Resumen

El modelo `Atomic-Germ/Aquila-mini-35B-A3B-NPU2` es una conversión cuantizada en formato **Q4NX** del modelo `XYZAILab/XYZ-Aquila-mini`, diseñada específicamente para ejecutarse en las NPU AMD XDNA2 (Ryzen AI 300 series o posterior) mediante el runtime **FastFlowLM**. El modelo original es un MoE de 35 mil millones de parámetros con 3 mil millones activos por token, basado en la arquitectura `qwen3_5_moe` de Qwen (Qwen3.6-35B-A3B). Esta conversión no es un archivo GGUF y no es compatible con llama.cpp ni Ollama; está pensada exclusivamente para el motor FastFlowLM en hardware NPU de AMD.

La relevancia de este modelo radica en que permite ejecutar un MoE de 35B en hardware de consumo con NPU dedicada, aprovechando la cuantización Q4NX optimizada para los tile sizes y patrones de acceso a memoria de la matriz de la NPU. El autor, Atomic-Germ, ha publicado esta conversión con licencia Apache 2.0, lo que facilita su uso comercial. Sin embargo, los kernels NPU son de código cerrado y se reutilizan los del modelo oficial `Qwen3.6-35B-A3B-NPU2`, ya que comparten la misma familia de motor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen3.6-35B-A3B (`qwen3_5_moe`) |
| Parametros totales | 35 mil millones (35B) |
| Parametros activos | 3 mil millones (3B) por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4NX (formato nativo de FastFlowLM, basado en Q4_1 reorganizado) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | Q4NX (no GGUF, no safetensors) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer MoE con 35B parámetros totales y 3B activos por token, siguiendo el diseño de la familia Qwen3.6. El modelo base `XYZAILab/XYZ-Aquila-mini` se entrenó sobre la arquitectura `qwen3_5_moe` y fue posteriormente cuantizado a Q4NX por Atomic-Germ. No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de RLHF o DPO. La conversión Q4NX reorganiza los pesos cuantizados Q4_1 para alinearlos con los tile sizes y patrones de acceso a memoria de la matriz de la NPU XDNA2, lo que permite una inferencia eficiente en hardware AMD Ryzen AI.

## Capacidades

- Generación de texto y razonamiento avanzado, heredado del modelo base Qwen3.6-35B-A3B.
- Soporte de razonamiento multi-paso (advanced reasoning) según las etiquetas del modelo.
- Capacidades multilingües declaradas en las etiquetas, aunque la model card solo especifica inglés como idioma soportado.
- Ejecución optimizada en NPU AMD XDNA2 mediante el runtime FastFlowLM.
- No se especifican capacidades de tool calling, function calling, visión o audio en la información disponible.

## Casos de uso

- Inferencia local en portátiles y equipos con AMD Ryzen AI 300 series: el modelo está compilado para NPU XDNA2, lo que permite ejecutar un MoE de 35B en hardware de consumo sin necesidad de GPU dedicada, siempre que se disponga de más de 32 GB de memoria unificada.
- Desarrollo de aplicaciones de chat y asistentes conversacionales en inglés: su licencia Apache 2.0 permite integración comercial sin restricciones de uso.
- Prototipado de agentes de razonamiento: al ser un MoE con 3B activos, ofrece un equilibrio entre capacidad y latencia en entornos con recursos limitados.
- Evaluación de la viabilidad de FastFlowLM como runtime alternativo a llama.cpp u Ollama para modelos MoE en hardware NPU.
- Investigación sobre cuantización Q4NX y su impacto en rendimiento frente a formatos GGUF o GPTQ, aunque no se publican benchmarks en esta conversión.
- Despliegue en entornos edge con requisitos de privacidad: al ejecutarse localmente en NPU, no se requiere conexión a servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparativas con otros modelos. Se recomienda consultar la model card del modelo base `XYZAILab/XYZ-Aquila-mini` para datos de rendimiento del modelo original sin cuantizar.

## Requisitos de hardware

- VRAM estimada: no aplica, ya que la inferencia se realiza en NPU, no en GPU. Se requiere más de 32 GB de memoria unificada del sistema (pesos Q4NX de 21.64 GB + activaciones + KV cache).
- GPU recomendadas: no aplica. El modelo está diseñado para NPU AMD XDNA2 (Strix Point / Ryzen AI 300 series o posterior).
- No cabe en GPUs de consumo convencionales, ya que el formato Q4NX no es compatible con CUDA ni ROCm.
- Opciones de despliegue: exclusivamente mediante FastFlowLM (`flm` CLI) con el instalador `flm-add`. No compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos fiables. El modelo base es una variante de Qwen3.6-35B-A3B, pero esta conversión Q4NX no es directamente comparable con otras cuantizaciones (GGUF, GPTQ) porque su runtime y hardware objetivo son distintos. Se recomienda comparar con el modelo original `XYZAILab/XYZ-Aquila-mini` y con `Qwen/Qwen3.6-35B-A3B` en términos de arquitectura y licencia, pero no se dispone de benchmarks para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- El formato Q4NX es propietario de FastFlowLM y no es compatible con ecosistemas estándar (llama.cpp, Ollama, vLLM). Esto limita su portabilidad.
- Los kernels NPU (xclbins) son de código cerrado y no se incluyen en el repositorio; se reutilizan los del modelo oficial `Qwen3.6-35B-A3B-NPU2`, lo que implica dependencia de la disponibilidad de esos kernels.
- Solo se declara soporte para inglés, aunque las etiquetas mencionan capacidades multilingües; no se garantiza un rendimiento óptimo en otros idiomas.
- No se especifica la longitud de contexto, por lo que se desconoce si hay limitaciones en ventanas largas.
- Al ser una cuantización Q4_1, puede haber pérdida de precisión frente al modelo original en tareas de razonamiento complejo.
- El modelo requiere más de 32 GB de memoria unificada, lo que excluye equipos con menos RAM.
- No se han publicado benchmarks de esta conversión, por lo que el rendimiento real en tareas específicas es incierto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Atomic-Germ/Aquila-mini-35B-A3B-NPU2
- Modelo base (XYZAILab/XYZ-Aquila-mini): https://huggingface.co/XYZAILab/XYZ-Aquila-mini
- Licencia del modelo base: https://huggingface.co/XYZAILab/XYZ-Aquila-mini/blob/main/LICENSE
- Sitio de FastFlowLM: https://fastflowlm.com

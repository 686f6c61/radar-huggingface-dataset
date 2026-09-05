# scottlowry/Qwen3.8-Flash-Next-oQ4e-mtp

## Resumen

El modelo scottlowry/Qwen3.8-Flash-Next-oQ4e-mtp es una cuantización de precisión mixta de 4 bits realizada con oQ (oMLX v0.6.3rc3) sobre el modelo base Jackrong/Qwopus3.8-27B-Flash, que a su vez pertenece a la familia experimental Qwen4 (tipo qwen4_exp). El safetensor contiene 179.999.981.459 parámetros totales, lo que, junto con el sufijo "27B" del modelo base, sugiere una arquitectura MoE con aproximadamente 27B parámetros activos. El formato MLX safetensors está diseñado para ejecutarse en Apple Silicon, lo que permite desplegar un modelo de gran tamaño en hardware local. El sufijo "mtp" indica soporte para multi-token prediction. No se dispone de información sobre la longitud de contexto, los idiomas soportados ni la licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts, inferido) |
| Parametros totales | 179.999.981.459 |
| Parametros activos | 27B (inferido del nombre del modelo base "Qwopus3.8-27B-Flash") |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit, group size 64, oQ4e (oMLX v0.6.3rc3) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo es una cuantización de precisión mixta de 4 bits generada con oQ (oMLX v0.6.3rc3), con group size 64. El modelo base es Jackrong/Qwopus3.8-27B-Flash, que está listado como base_model y también como base_model:quantized, lo que indica que el modelo original ya había sido cuantizado. El tipo de modelo reportado es qwen4_exp, una variante experimental de la familia Qwen4. El nombre del modelo base y la configuración de vLLM para Qwen3.8-Flash-Next (que usa --moe-backend triton) confirman que se trata de una arquitectura MoE. El sufijo "mtp" señala soporte para multi-token prediction. No se dispone de información sobre los datos de entrenamiento, el número de tokens, la composición del dataset ni procesos de alineación como RLHF o DPO.

## Capacidades

- Generación de texto: no documentada explícitamente, pero se asume por ser un modelo de lenguaje.
- Tool calling: el recipe de vLLM para Qwen3.8-Flash-Next incluye --enable-auto-tool-choice y --tool-call-parser qwen3_xml, lo que indica que el modelo base soporta tool calling.
- Razonamiento: el recipe incluye --reasoning-parser qwen3, lo que sugiere soporte de razonamiento estructurado.
- Capacidades multilingües: no documentadas.
- Visión o audio: no disponibles según la información.

## Casos de uso

1. Inferencia local en macOS: el formato MLX permite ejecutar el modelo en Macs con Apple Silicon, facilitando el desarrollo y prototipado sin servicios en la nube.
2. Investigación en cuantización: el modelo es un ejemplo práctico de cuantización 4-bit con oQ, útil para estudiar el impacto de la cuantización en modelos de gran tamaño.
3. Aplicaciones de agentes con tool calling: si el modelo base soporta tool calling, se puede integrar en pipelines de agentes para tareas de razonamiento multi-paso.
4. Desarrollo de aplicaciones con MTP: el soporte de multi-token prediction puede acelerar la generación en hardware compatible, aunque el recipe de vLLM advierte que puede degradar el rendimiento en ciertos entornos.
5. Evaluación de modelos en hardware Apple: los desarrolladores pueden probar el rendimiento de un modelo de 180B en Macs con RAM unificada de 128 GB o más.
6. Uso educativo: el modelo sirve para demostrar cómo se cuantiza un modelo grande a 4 bits y cómo se despliega con MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica directamente; el modelo está en formato MLX y utiliza RAM unificada de Apple Silicon.
- RAM unificada recomendada: al menos 128 GB para cargar el modelo de 106.3 GB.
- GPU recomendadas: Apple Silicon (M1 Max, M2 Ultra, M3 Ultra, M4 Max/Ultra) con suficiente RAM unificada.
- No cabe en GPUs de consumo (RTX 4090, 24 GB).
- Opciones de despliegue: mlx-lm, mlx-lm-server. Para vLLM se necesita una versión FP8 u otro formato compatible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| scottlowry/Qwen3.8-Flash-Next-oQ4e-mtp | 180B totales | MLX 4-bit | no disponible | HuggingFace |
| Qwen/Qwen3.8-Flash-Next-FP8 | no disponible | FP8 | no disponible | HuggingFace |
| Jackrong/Qwopus3.8-27B-Flash | no disponible | no disponible | no disponible | HuggingFace |

Nota: Qwen3.8-Flash-Next-FP8 es la versión del modelo base en FP8 para vLLM, con soporte de tool calling y reasoning. El modelo cuantizado aquí es una conversión a MLX 4-bit del modelo base Jackrong/Qwopus3.8-27B-Flash.

## Limitaciones y advertencias

- Licencia no disponible: no se puede determinar si el uso comercial está permitido.
- Cuantización 4-bit: puede degradar la calidad de las respuestas en comparación con el modelo sin cuantizar.
- Modelo experimental (qwen4_exp): no se garantiza estabilidad ni soporte.
- Sin benchmarks publicados: el rendimiento real es desconocido.
- MTP puede no mejorar el rendimiento: el recipe de vLLM indica que la decodificación especulativa MTP redujo el throughput entre un 8% y un 36% y aumentó la latencia entre un 32% y un 173% en el hardware probado.
- Requiere hardware Apple Silicon con mucha RAM: no es ejecutable en GPUs NVIDIA sin conversión.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/scottlowry/Qwen3.8-Flash-Next-oQ4e-mtp)
- [Qwen/Qwen3.8-Flash-Next](https://huggingface.co/Qwen/Qwen3.8-Flash-Next)
- [vLLM Recipes para Qwen3.8-Flash-Next](https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next)
- [Repositorio de oQ (oMLX)](https://github.com/jundot/omlx)

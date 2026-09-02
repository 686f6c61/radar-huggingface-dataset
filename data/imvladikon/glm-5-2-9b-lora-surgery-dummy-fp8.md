# imvladikon/GLM-5.2-9B-LoRA-Surgery-Dummy-FP8

## Resumen

Este checkpoint, publicado por el usuario imvladikon, es un modelo de prueba (dummy) creado mediante técnicas de cirugía de modelos (model surgery) sobre el modelo base zai-org/GLM-5.2-FP8. Su propósito explícito es servir como banco de pruebas para flujos de trabajo de fine-tuning con LoRA, reinforcement learning, sharding e integración de adaptadores en vivo. No es un modelo de chat ni de generación de texto utilizable en producción, tal y como advierte su propia model card.

La operación de cirugía reduce drásticamente la arquitectura original: de 78 capas decoder pasa a 10, y de 256 expertos enrutados a 16, manteniendo la anchura oculta, las dimensiones de MLA/DSA, el enrutamiento top-8 y tres capas densas. El resultado es un modelo con 8.763.269.232 parámetros (según los pesos safetensors), en formato mixto FP8 (E4M3) y BF16, con una cuadrícula de escalas de 128x128. Se acompaña de los ficheros `surgery_plan.json` y `surgery_manifest.json` que documentan la procedencia exacta de capas y expertos.

La relevancia de este modelo es exclusivamente técnica: permite validar herramientas de cirugía de modelos, pruebas de integración de adaptadores y flujos de experimentación sin necesidad de cargar el modelo completo de 5.2. No aporta valor como modelo de inferencia final, pero sí como infraestructura de desarrollo para quienes trabajan con la familia GLM-5.2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), top-8 routing, MLA/DSA, 10 capas decoder, 16 expertos enrutados, 3 capas densas |
| Parametros totales | 8.763.269.232 (según safetensors; la model card indica 8.763.269.120) |
| Parametros activos | no disponible (no se especifica cuántos se activan por token) |
| Longitud de contexto | no disponible (hereda la del modelo base, pero no se documenta) |
| Tipos de cuantizacion | FP8 mixto (E4M3) y BF16, con cuadrícula de escalas 128x128 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un subconjunto extraído del GLM-5.2-FP8 mediante cirugía de modelos. Se conservan la anchura oculta, las dimensiones de atención MLA (Multi-head Latent Attention) y DSA (Deep Sparse Attention), el mecanismo de enrutamiento top-8 y tres capas densas. Las 78 capas decoder originales se reducen a 10, seleccionando las capas fuente `[0, 1, 2, 3, 15, 27, 38, 51, 63, 77]`. Los 256 expertos enrutados se reducen a 16 por capa, con una selección específica de IDs de expertos documentada en la model card.

No se ha realizado ningún entrenamiento adicional sobre este checkpoint; es una extracción mecánica de pesos del modelo base. El propósito es servir como base para pruebas de LoRA, RL, sharding y adaptadores en vivo, no como modelo entrenado. No se dispone de información sobre el dataset de entrenamiento, el número de tokens ni técnicas de alineación (RLHF/DPO), ya que no aplican a este artefacto.

## Capacidades

- No es un modelo de chat ni de generación de texto utilizable. La model card lo declara explícitamente como "no usable chat or benchmark model".
- Sirve como banco de pruebas para integración de adaptadores LoRA, fine-tuning con SFT, RL, sharding y despliegue con adaptadores en caliente.
- Permite validar la infraestructura de cirugía de modelos: los ficheros `surgery_plan.json` y `surgery_manifest.json` documentan la trazabilidad de capas y expertos, útil para auditoría de reproducción.
- Al ser un subconjunto reducido, facilita pruebas de rendimiento de herramientas de inferencia (vLLM, TGI, etc.) con una huella de memoria menor que el modelo completo.
- No se conocen capacidades multilingües, tool calling, agentes ni razonamiento multi-paso, al no ser un modelo funcional.

## Casos de uso

- Pruebas de integración de LoRA: el checkpoint permite verificar que un adaptador LoRA se carga y aplica correctamente sobre una base FP8, sin necesidad de usar el modelo GLM-5.2 completo.
- Validación de pipelines de RL: al ser un modelo pequeño, se puede usar para depurar flujos de reinforcement learning (PPO, GRPO) antes de escalar al modelo original.
- Desarrollo de herramientas de sharding: su tamaño reducido facilita probar estrategias de particionado de pesos en múltiples GPUs.
- Pruebas de adaptadores en caliente (live-adapter): permite experimentar con el intercambio de adaptadores sin reiniciar el servidor de inferencia.
- Auditoría de cirugía de modelos: los ficheros de manifiesto y plan permiten verificar la reproducibilidad de la extracción de capas y expertos.
- Benchmarking de infraestructura: al ser un modelo FP8 de ~9B parámetros, se puede usar para medir throughput y latencia de motores de inferencia en configuraciones de baja memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo es explícitamente un dummy de prueba y no está diseñado para obtener métricas de calidad de generación.

## Requisitos de hardware

- Al ser un checkpoint de prueba, no se recomienda su uso para inferencia real. Si se quisiera cargar para pruebas de integración, el tamaño del repositorio es de 10.7 GB, lo que sugiere que en FP8 ocuparía aproximadamente 9-10 GB en VRAM.
- GPUs con 12 GB o más de VRAM (por ejemplo, RTX 3060, RTX 4070, A10) podrían cargar el modelo en FP8, aunque no hay garantías de funcionamiento.
- Para pruebas de LoRA o sharding, se puede usar una única GPU de gama media; para pruebas distribuidas, se requieren múltiples GPUs.
- Opciones de despliegue: al ser un modelo transformers estándar, se puede cargar con Hugging Face Transformers, vLLM, TGI o llama.cpp (si se convierte a GGUF), pero no hay documentación específica.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Uso previsto |
|---|---|---|---|---|
| imvladikon/GLM-5.2-9B-LoRA-Surgery-Dummy-FP8 | 8.76B | no disponible | no disponible | Pruebas de cirugía y LoRA |
| zai-org/GLM-5.2-FP8 (modelo base) | no disponible (modelo completo) | 1M tokens (según documentación de Z.AI) | no disponible | Modelo de producción |
| imvladikon/GLM-5.3-Flash-9B-Surgery-Dummy | 8.895B | no disponible | no disponible | Pruebas de cirugía sobre GLM-5.3-Flash |

La comparativa se limita a modelos de cirugía similares publicados por el mismo autor. No se dispone de datos de rendimiento para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- No es un modelo utilizable para chat, generación de texto ni ninguna tarea de producción. Su model card lo declara explícitamente como "test-only checkpoint".
- No se ha realizado ningún entrenamiento ni alineación; los pesos son una extracción mecánica del modelo base.
- La licencia no está especificada, por lo que no se puede garantizar su uso comercial ni su redistribución.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones de idioma, al no ser un modelo funcional.
- Los ficheros de cirugía (`surgery_plan.json`, `surgery_manifest.json`) son esenciales para entender la procedencia de los pesos; sin ellos, el checkpoint carece de trazabilidad.
- Al ser un modelo de prueba, puede contener inconsistencias internas derivadas de la extracción parcial de capas y expertos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/imvladikon/GLM-5.2-9B-LoRA-Surgery-Dummy-FP8
- Modelo base: https://huggingface.co/zai-org/GLM-5.2-FP8
- Documentación de GLM-5.2 de Z.AI: https://docs.z.ai/guides/llm/glm-5.2
- Repositorio GitHub de GLM-5 (incluye GLM-5.2 y GLM-5.3): https://github.com/zai-org/GLM-5
- Modelo similar de cirugía (GLM-5.3-Flash): https://huggingface.co/imvladikon/GLM-5.3-Flash-9B-Surgery-Dummy

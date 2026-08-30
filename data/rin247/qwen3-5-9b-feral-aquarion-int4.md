# Rin247/Qwen3.5-9B-Feral-Aquarion-INT4

## Resumen

El modelo `Rin247/Qwen3.5-9B-Feral-Aquarion-INT4` es una cuantización INT4 weight-only del modelo base `Qwen3.5-9B-Feral-Aquarion`, publicada por el usuario Rin247 en Hugging Face. Esta cuantización forma parte de una colección más amplia de pesos cuantizados (FP8, INT8, INT4 y FP4) de la serie Qwen3, orientada a su uso en entornos de generación de imágenes y otros pipelines creativos como Anima, Krea2, Z-Image y Klein.

El archivo `model.safetensors` contiene 5.494.551.040 parámetros, lo que sugiere que el modelo base podría tener una arquitectura con parámetros activos inferiores a los 9B nominales, aunque no se dispone de información detallada al respecto. La cuantización se realizó mediante RTN (round-to-nearest) en CPU, almacenando escalas y formas junto a los pesos para su posterior dequantización. El repositorio ocupa 7,7 GB y no incluye licencia ni idiomas especificados.

La relevancia de este modelo radica en su formato compacto: al estar cuantizado a INT4, permite ejecutar un modelo de la familia Qwen3.5 en hardware con VRAM limitada, aunque requiere un proceso de dequantización previo antes de la inferencia. No se han publicado métricas de rendimiento ni benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base no documentado) |
| Parametros totales | 5.494.551.040 (según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 weight-only (RTN) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (INT4 con escalas y formas separadas) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base `Qwen3.5-9B-Feral-Aquarion`. Dado que pertenece a la serie Qwen3.5, es probable que siga una arquitectura transformer estándar con atención de múltiples cabezas, pero no se puede confirmar. El proceso de cuantización se realizó con PyTorch RTN en CPU, un método que redondea los pesos al entero más cercano y almacena escalas por tensor o por canal. No se documentan datos de entrenamiento, dataset ni técnicas como RLHF o DPO.

## Capacidades

- No se han documentado capacidades específicas del modelo cuantizado.
- Al ser una cuantización de un modelo de la serie Qwen3.5, podría heredar capacidades de generación de texto, razonamiento, código y posiblemente visión, pero no hay confirmación oficial.
- El formato INT4 requiere dequantización antes de la inferencia, por lo que no es directamente utilizable con motores estándar sin un paso previo.
- No se menciona soporte de tool calling, agentes ni modos de pensamiento.

## Casos de uso

- Despliegue en entornos con VRAM limitada: al ocupar solo 7,7 GB en disco y tener ~5,5B parámetros en INT4, podría caber en GPUs de 6-8 GB tras la dequantización, aunque el proceso de dequantización en tiempo de ejecución añade complejidad.
- Investigación sobre cuantización: útil para estudiar el impacto de la cuantización INT4 en modelos de la familia Qwen3.5, comparando con versiones FP8 o FP16.
- Integración en pipelines creativos: la colección de Rin247 menciona su uso en Anima, Krea2, Z-Image y Klein, lo que sugiere aplicaciones en generación de imágenes o edición multimodal, aunque no se detalla el flujo exacto.
- Prototipado rápido: para desarrolladores que necesitan probar un modelo de 9B en hardware de consumo sin descargar los pesos completos.
- Fine-tuning posterior: los pesos cuantizados pueden servir como punto de partida para técnicas de quantized fine-tuning, aunque no se documenta compatibilidad con PEFT o LoRA.
- Evaluación de calidad de cuantización: permite medir la degradación de rendimiento frente al modelo original en tareas específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 5,49B parámetros en INT4, los pesos ocupan aproximadamente 2,75 GB. Tras la dequantización a FP16, el modelo completo requeriría ~11 GB, por lo que la inferencia directa en FP16 necesitaría una GPU con al menos 12 GB. Si se mantiene en INT4 con dequantización por capas, podría ejecutarse en 6-8 GB.
- GPU recomendadas: RTX 3060 12GB, RTX 4060 Ti 16GB, RTX 4090, o GPUs de datacenter como A10 o A100.
- No cabe en GPUs de 4 GB sin técnicas adicionales de offloading.
- Opciones de despliegue: no es compatible directamente con vLLM, llama.cpp u Ollama debido al formato custom de cuantización. Requiere un script de dequantización previo o un motor que soporte los buffers `weight_scale` y `weight_shape`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos. El modelo base `Qwen3.5-9B-Feral-Aquarion` no aparece en los resultados de búsqueda, y la cuantización es un formato propietario. Se puede mencionar que la serie Qwen3.5 estándar (por ejemplo, `Qwen/Qwen3.5-9B`) tiene arquitectura multimodal y está disponible en Ollama, pero no se conocen sus parámetros exactos ni su rendimiento.

## Limitaciones y advertencias

- La cuantización INT4 weight-only introduce pérdida de precisión que puede afectar a tareas de razonamiento complejo o generación de código.
- El formato de pesos es custom: requiere dequantización manual con las escalas y formas almacenadas, lo que complica su uso con frameworks estándar.
- No se dispone de licencia, por lo que no se puede garantizar su uso comercial ni su redistribución.
- No hay información sobre sesgos, alucinaciones o limitaciones de idioma.
- El modelo base no está documentado, por lo que se desconocen sus capacidades reales y su procedencia.
- La fecha de creación (2026-08-30) es posterior a la fecha actual, lo que sugiere que podría tratarse de un modelo sintético o de prueba.

## Enlaces

- [Hugging Face - Rin247/Qwen3.5-9B-Feral-Aquarion-INT4](https://huggingface.co/Rin247/Qwen3.5-9B-Feral-Aquarion-INT4)
- [Colección Qwen3-Aquarion de Rin247](https://huggingface.co/collections/Rin247/qwen3-aquarion)
- [Qwen/Qwen3.5-9B (modelo base de referencia)](https://huggingface.co/Qwen/Qwen3.5-9B)
- [Repositorio GitHub de Qwen3](https://github.com/QwenLM/Qwen3)
- [Qwen3.5:9b en Ollama](https://ollama.com/library/qwen3.5:9b)

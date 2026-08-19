# a4lg/Qwen3.8-27B-MTP-ONLY-GGUF

## Resumen

El repositorio `a4lg/Qwen3.8-27B-MTP-ONLY-GGUF` contiene un subconjunto de tensores MTP (Multi-Token Prediction) extraídos del modelo [Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B), convertido al formato GGUF. Este subconjunto actúa como modelo *draft* para decodificación especulativa, una técnica que acelera la generación de tokens en modelos de lenguaje de gran tamaño. En lugar de cargar el modelo completo de 27B parámetros para predecir tokens candidatos, se utiliza este módulo ligero de aproximadamente 3B parámetros que propone varias secuencias de tokens que el modelo principal valida en paralelo.

El modelo está desarrollado por el usuario a4lg y está pensado para complementar a los modelos basados en Qwen3.8-27B, incluidos fine-tunes y versiones ablacionadas que no incluyen los tensores MTP. Su relevancia radica en que permite acelerar la inferencia de estos modelos sin necesidad de reentrenarlos, simplemente añadiendo el módulo draft. Se distribuye bajo licencia Apache 2.0, igual que el modelo original.

La model card ofrece dos métodos de uso: como archivo de modelo draft separado (con `--model-draft` en llama.cpp) o como donante para injertar los tensores MTP dentro del GGUF del modelo principal mediante un script de conversión. Se proporcionan cuantizaciones Q4_K_M, Q5_K_M, Q6_K y Q8_0 basadas en los quants de Unsloth, lo que facilita su despliegue en diferentes configuraciones de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Subconjunto MTP del modelo Qwen3.8-27B (decodificación especulativa) |
| Parametros totales | 2.967.501.312 (tensores MTP únicamente; el modelo base tiene 27B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0 (basados en Unsloth UD-Q4_K_XL, UD-Q5_K_XL, UD-Q6_K_XL, UD-Q8_K_XL) |
| Idiomas soportados | no disponible (depende del modelo base Qwen3.8-27B) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors no aplicable, solo GGUF) |

## Arquitectura y entrenamiento

El modelo es un subconjunto de tensores MTP extraídos del modelo Qwen/Qwen3.8-27B. El MTP es un módulo de predicción multi-token que se entrena junto con el modelo principal para anticipar varios tokens futuros en una sola pasada. En este repositorio solo se incluyen los pesos correspondientes a ese módulo, no el modelo completo. No se proporcionan detalles sobre la arquitectura interna del MTP (número de capas, dimensiones, etc.) más allá de que forma parte del diseño del Qwen3.8-27B.

La conversión se realizó con la herramienta `convert_hf_to_gguf.py` de llama.cpp (versión b10430) usando la opción `--mtp`, que genera específicamente un subconjunto MTP-only. Las cuantizaciones adicionales se obtuvieron con `llama-quantize` sin opciones especiales. No hay información sobre el proceso de entrenamiento del MTP en sí, ya que es parte del modelo base.

## Capacidades

- Aceleración de inferencia mediante decodificación especulativa: el modelo actúa como *draft* proponiendo tokens candidatos que el modelo principal valida en paralelo.
- Compatible con modelos basados en Qwen3.8-27B, incluidos fine-tunes y versiones ablacionadas que no incluyen tensores MTP.
- Soporte para dos modos de uso: como archivo draft separado (`--model-draft`) o injertado en el GGUF principal mediante un script de conversión.
- Cuantizaciones múltiples (Q4_K_M, Q5_K_M, Q6_K, Q8_0) para adaptarse a distintos requisitos de memoria y precisión.
- Integración con llama.cpp y llama-server, con opciones configurables como `--spec-type draft-mtp` y `--spec-draft-n-max`.

## Casos de uso

- Aceleración de servidores de inferencia con llama.cpp: al usar este modelo como draft, se reduce la latencia de generación de tokens en modelos Qwen3.8-27B desplegados en producción, especialmente útil en entornos con alta demanda de respuestas en tiempo real.
- Despliegue de modelos fine-tuned sin tensores MTP: muchos fine-tunes de Qwen3.8-27B eliminan los tensores MTP para ahorrar espacio; este subconjunto permite reintroducir la decodificación especulativa sin necesidad de reentrenar.
- Optimización de costes en GPU: al usar un draft pequeño (3B parámetros) junto con el modelo principal, se puede aumentar el throughput por petición sin incrementar la memoria total de forma significativa.
- Experimentación con decodificación especulativa: los investigadores pueden probar diferentes configuraciones de `--spec-draft-n-max` y cuantizaciones para medir el impacto en la tasa de aceptación y la velocidad.
- Integración en pipelines de generación de código o texto largo: donde la latencia por token es crítica, la aceleración del draft permite completar tareas más rápido manteniendo la calidad del modelo principal.
- Evaluación comparativa de rendimiento: el modelo sirve para medir la ganancia real de la decodificación especulativa en diferentes hardware y configuraciones, tal como recomienda la model card ("Benchmark it before blindly trusting it").

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el rendimiento depende del modelo derivado, la máquina y la configuración MTP, por lo que se recomienda realizar pruebas propias antes de adoptarlo en producción.

## Requisitos de hardware

- El modelo MTP-only tiene aproximadamente 3B parámetros, por lo que en cuantización Q4_K_M ocupará alrededor de 1,5-2 GB (estimación basada en el tamaño de parámetros; el tamaño exacto no se especifica en la información disponible).
- Cabe en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU con suficiente RAM, ya que es un modelo ligero.
- Para la decodificación especulativa, se requiere ejecutar simultáneamente el modelo principal (Qwen3.8-27B) y el draft, por lo que la VRAM total debe sumar ambos. Por ejemplo, con el modelo principal en Q4_K_M (~16 GB) y el draft en Q4_K_M (~2 GB), se necesitarían al menos 18 GB de VRAM.
- Opciones de despliegue: llama.cpp (llama-server) con `--model-draft` o con el draft injertado, y cualquier framework compatible con GGUF que soporte decodificación especulativa.
- Latencia y throughput estimados: no disponibles; dependen del hardware y de la tasa de aceptación del draft, que no se ha medido públicamente.

## Comparativa con modelos similares

No se dispone de modelos comparables directamente, ya que este es un subconjunto MTP específico para Qwen3.8-27B. Existen repositorios similares del mismo autor para otros modelos Qwen (Qwen3.5, Qwen3.6, etc.), pero no se proporcionan datos de rendimiento comparativos. El modelo base Qwen3.8-27B completo está disponible en HuggingFace, pero no es comparable porque este repositorio solo contiene los tensores MTP.

## Limitaciones y advertencias

- No es un modelo de generación de texto independiente; solo funciona como módulo auxiliar de decodificación especulativa junto con un modelo principal Qwen3.8-27B o derivados.
- El rendimiento de aceleración es variable y no garantizado; la model card advierte que hay que hacer benchmarks antes de confiar en él.
- La tasa de aceptación de tokens del draft depende del modelo principal, por lo que puede ser baja si el fine-tune difiere mucho del original.
- No se especifican idiomas soportados; dependen del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero se debe mantener la atribución al modelo original (Copyright 2026 Alibaba Cloud).
- El script de conversión `convert.py` es un gist externo y puede requerir dependencias adicionales no documentadas.

## Enlaces

- Repositorio HuggingFace: [a4lg/Qwen3.8-27B-MTP-ONLY-GGUF](https://huggingface.co/a4lg/Qwen3.8-27B-MTP-ONLY-GGUF)
- Modelo base: [Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- Script de conversión para injertar MTP: [convert.py (gist de buzz)](https://gist.github.com/buzz/1c439684d5e3f36492ae9f64ef7e3f67/7e1d6f929e141f4977f89f99e6a7df39f41eeffa)
- Cuantizaciones de referencia (Unsloth): [unsloth/Qwen3.8-27B-GGUF](https://huggingface.co/unsloth/Qwen3.8-27B-GGUF)
- Otros subconjuntos MTP del mismo autor: [Qwen3.5-9B](https://huggingface.co/a4lg/Qwen3.5-9B-MTP-ONLY-GGUF), [Qwen3.5-27B](https://huggingface.co/a4lg/Qwen3.5-27B-MTP-ONLY-GGUF), [Qwen3.5-35B-A3B](https://huggingface.co/a4lg/Qwen3.5-35B-A3B-MTP-ONLY-GGUF), [Qwen3.5-122B-A10B](https://huggingface.co/a4lg/Qwen3.5-122B-A10B-MTP-ONLY-GGUF), [Qwen3.5-397B-A17B](https://huggingface.co/a4lg/Qwen3.5-397B-A17B-MTP-ONLY-GGUF), [Qwen3.6-27B](https://huggingface.co/a4lg/Qwen3.6-27B-MTP-ONLY-GGUF), [Qwen3.6-35B-A3B](https://huggingface.co/a4lg/Qwen3.6-35B-A3B-MTP-ONLY-GGUF)

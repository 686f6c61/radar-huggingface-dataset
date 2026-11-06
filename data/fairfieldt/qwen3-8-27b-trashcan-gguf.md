# fairfieldt/Qwen3.8-27B-trashcan-GGUF

## Resumen

Qwen3.8-27B-trashcan-GGUF es una cuantización GGUF del modelo Qwen/Qwen3.8-27B, publicada por el usuario fairfieldt. No se trata de un modelo nuevo ni de un ajuste fino, sino de una conversión de pesos diseñada específicamente para que el runtime [trashcan](https://github.com/fairfieldt/trashcan) pueda ejecutar el modelo en hardware antiguo: dos o cuatro Mac Pro de 2013 con GPUs FirePro D700 mediante Vulkan y paralelismo de tensores. El repositorio contiene el modelo cuantizado en Q4_0 y una capa adicional de predicción multi-token (MTP) para decodificación especulativa.

El modelo base, Qwen3.8-27B, cuenta con 26.895.998.464 parámetros (aproximadamente 26,9 mil millones) según los safetensors del repositorio original. La model card no detalla la arquitectura interna del modelo base, aunque la presencia de tensores `ssm_alpha` y `ssm_beta` en las instrucciones de cuantización apunta a componentes de tipo state space model (SSM) o híbridos, y la capa MTP sugiere soporte de decodificación especulativa. La licencia declarada es Apache 2.0.

La relevancia de esta ficha es acotada: su interés principal es práctico para quienes quieran reproducir el despliegue en hardware legacy con trashcan, y como ejemplo de cuantización selectiva por tipo de tensor (Q4_0 para la mayoría de pesos, Q6_K para la cabeza de salida, Q8_0 para el embedding de tokens y f32 para las compuertas SSM). No hay información publicada sobre idiomas, benchmarks ni datos de entrenamiento del modelo base en la documentación proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base Qwen3.8-27B; presencia de tensores SSM `ssm_alpha`/`ssm_beta` y capa MTP) |
| Parámetros totales | 26.895.998.464 (modelo base, safetensors) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_0 (cuerpo), Q6_K (cabeza de salida), Q8_0 (embedding de tokens), f32 (compuertas SSM) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, los datos de entrenamiento ni el proceso de alineación (RLHF/DPO) del modelo base Qwen3.8-27B en la documentación proporcionada. Los únicos indicios técnicos son la existencia de tensores `ssm_alpha` y `ssm_beta`, compatibles con mecanismos de state space o atención lineal, y la publicación de una capa MTP (multi-token prediction) separada, que habilita decodificación especulativa en el runtime trashcan mediante el flag `--mtp`.

La innovación destacable de este repositorio es la receta de cuantización: se usa `llama-quantize --pure` con una importance matrix de unsloth, asignando tipos por tensor (`--output-tensor-type q6_k`, `--token-embedding-type q8_0`, `--tensor-type ssm_alpha=f32`, `--tensor-type ssm_beta=f32`). El objetivo es que todos los tipos de tensor presentes sean los que los kernels de trashcan saben leer, evitando las mezclas de tipos que, según el autor, incluyen otras cuantizaciones de la comunidad. La capa MTP se cuantiza del BF16 de ggml-org sin importance matrix, porque esta no contiene entradas para esa capa.

## Capacidades

- Generación de texto conversacional: el repositorio está etiquetado como `conversational` y `text-generation`.
- Decodificación especulativa: la capa MTP incluida permite acelerar la generación con `--mtp` en trashcan.
- Ejecución en hardware legacy: pensado para paralelismo de tensores sobre GPUs FirePro D700 (Vulkan).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en clústeres de Mac Pro de 2013: el caso de uso principal y documentado. Con dos Mac Pro se obtienen 28,4 tok/s en decodificación de un solo stream (39,5 con MTP); con cuatro, 40,7 tok/s (52,0 con MTP). Las recetas `2-qwen27b` y `4-qwen27b` en `docs/deploy.md` del repositorio trashcan describen el procedimiento.
- Reproducción de cuantizaciones compatibles con kernels concretos: sirve como referencia de cómo aplicar `--pure` con tipos por tensor para evitar mezclas no soportadas por un runtime específico.
- Evaluación de decodificación especulativa con MTP: la capa MTP separada permite medir la ganancia de throughput (aproximadamente un 39 % en dos Macs y un 28 % en cuatro, según los datos de la model card) sin reentrenar ni modificar el modelo principal.
- Experimentación con modelos de ~27B en entornos sin GPUs modernas: útil para investigadores que quieran probar un modelo de este tamaño en hardware de más de una década de antigüedad.
- Benchmarking de cuantización Q4_0 frente a otras recetas: al ser una cuantización "pura" con tipos documentados, facilita comparaciones controladas de calidad y velocidad.
- Servicio conversacional de baja concurrencia: con 28-52 tok/s en decodificación single-stream, es viable para prototipos de chat o asistentes internos, no para producción de alta concurrencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento son de throughput de decodificación en el runtime trashcan:

| Configuración | Decodificación single-stream | Con MTP |
|---|---|---|
| 2 Mac Pro 2013 (FirePro D700, Vulkan) | 28,4 tok/s | 39,5 tok/s |
| 4 Mac Pro 2013 (FirePro D700, Vulkan) | 40,7 tok/s | 52,0 tok/s |

## Requisitos de hardware

- VRAM/almacenamiento: el fichero principal `Qwen3.8-27B-trashcan-Q4_0.gguf` ocupa 16.193.669.792 bytes (unos 16,2 GB); la capa MTP `mtp-Qwen3.8-27B-trashcan-Q4_0.gguf` ocupa 2.643.753.632 bytes (unos 2,6 GB). El repo completo son 18,8 GB.
- GPU recomendadas: el autor valida FirePro D700 (2 GB de VRAM por GPU) en Mac Pro de 2013 con Vulkan y paralelismo de tensores sobre 2 o 4 máquinas. No hay datos publicados para A100, H100 o RTX 4090.
- GPU de consumo: no hay información sobre ejecución en GPUs consumer modernas; el diseño está orientado a trashcan y a su pila Vulkan.
- Opciones de despliegue: runtime trashcan (con `--mtp` opcional). No se documenta compatibilidad con vLLM, llama.cpp estándar, Ollama o TGI; de hecho, el autor advierte que otras cuantizaciones de la comunidad mezclan tipos de tensor que los kernels de trashcan no leen.
- Latencia y throughput: 28,4 tok/s (2 Macs) y 40,7 tok/s (4 Macs) sin MTP; 39,5 y 52,0 tok/s con MTP. No se publican datos de prefill ni de concurrencia.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de benchmarks ni especificaciones del modelo base que permitan una comparación rigurosa con alternativas de tamaño similar. Como referencia estructural, el repositorio cita las cuantizaciones de `ggml-org/Qwen3.8-27B-GGUF` (BF16 de origen) y `unsloth/Qwen3.8-27B-GGUF` (importance matrix), pero no se aportan métricas comparativas de calidad o velocidad entre ellas.

## Limitaciones y advertencias

- Compatibilidad restringida: la cuantización está pensada para los kernels de trashcan; no se garantiza que funcione en otros runtimes GGUF como llama.cpp estándar u Ollama.
- Hardware objetivo muy específico: las cifras de rendimiento solo aplican a Mac Pro de 2013 con FirePro D700 y Vulkan; no hay datos para GPUs modernas.
- Idiomas no documentados: se desconoce qué idiomas soporta el modelo base.
- Sin benchmarks de calidad: no hay evaluación publicada de MMLU, HumanEval, GSM8K ni similares para esta cuantización ni, en la información disponible, para el modelo base.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; aplican los riesgos habituales de un modelo de lenguaje de ~27B sin evaluación publicada.
- Licencia: Apache 2.0, lo que permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.8-27B y de las fuentes de cuantización (ggml-org y unsloth) antes de desplegar en producción.
- Advertencia de la model card: el autor señala que otras cuantizaciones comunitarias mezclan tipos de tensor no soportados por trashcan; usar este repo no garantiza el mismo comportamiento con otras recetas.
- Fecha de creación del repositorio: 2026-10-27, con solo 93 descargas y 0 likes; se trata de una publicación reciente y poco validada por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fairfieldt/Qwen3.8-27B-trashcan-GGUF
- Runtime trashcan: https://github.com/fairfieldt/trashcan
- Recetas de despliegue: https://github.com/fairfieldt/trashcan/blob/main/docs/deploy.md
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Fuente BF16: https://huggingface.co/ggml-org/Qwen3.8-27B-GGUF
- Importance matrix: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF

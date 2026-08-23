# justinchuby/qwen2.5-14b-instruct-int4-zp-onnx

## Resumen

El modelo `justinchuby/qwen2.5-14b-instruct-int4-zp-onnx` es una exportación en formato ONNX del modelo Qwen2.5-14B-Instruct, cuantizado en int4 con esquema zero-point (pesos empaquetados `UINT8` de estilo `MatMulNBits` y escalas `FLOAT16`). Ha sido publicado por Justin Chuby con un propósito muy específico: servir como fixture reproducible para investigar un problema de límite de capacidad en la lectura de pesos mapeados desde memoria host (zero-copy) en el runtime de ONNX GenAI, concretamente el issue [justinchuby/onnx-genai#925](https://github.com/justinchuby/onnx-genai/issues/925). En ese contexto, el autor detectó que en una GPU de consumo bajo Windows/WDDM, la lectura de bytes mapeados por paso de decodificación por encima de ~0,44–0,65 GB comenzaba a devolver datos corruptos de forma silenciosa, sin errores ni tokens incorrectos evidentes.

La relevancia de este modelo no reside en su capacidad de generación de texto, sino en su utilidad como herramienta de reproducción y medición para desarrolladores que trabajen con cuantización y offloading de pesos en ONNX Runtime. El repositorio incluye el grafo ONNX, los pesos externos repaquetados (de 16,65 GB a 8,33 GB), un archivo de metadatos de inferencia (`inference_metadata.yaml`) que define un workflow completo, y diez grafos de políticas de token. La arquitectura es la del modelo base: un transformer de 48 capas, 40 cabezas de atención, 8 cabezas KV, tamaño de capa oculta 5120 y un contexto de 8192 tokens. El tamaño total del repositorio es de 8,34 GB, con licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5, 48 capas, 40 cabezas de atención, 8 cabezas KV, hidden size 5120, vocab 152064) |
| Parámetros totales | 14,7 mil millones (según el modelo base Qwen2.5-14B-Instruct) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantización | int4 zero-point (pesos `UINT8` empaquetados estilo `MatMulNBits` + escalas `FLOAT16`) |
| Idiomas soportados | no disponible (el modelo base Qwen2.5 soporta múltiples idiomas, pero no se especifica en esta exportación) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (external data repacked, `model.onnx` + `model.onnx.data`) |

## Arquitectura y entrenamiento

La arquitectura es la del transformer original de Qwen2.5-14B-Instruct: 48 capas, 40 cabezas de atención, 8 cabezas KV con head size 128, hidden size 5120 y un vocabulario de 151992 tokens. El modelo base fue entrenado con un proceso de alineación que incluye RLHF y DPO, aunque los detalles específicos de datos de entrenamiento no se proporcionan en esta exportación. Lo que sí es novedoso aquí es el proceso de cuantización y el formato de los artefactos: los pesos se cuantizan a int4 con zero-point y se empaquetan en tensores `UINT8` (339 tensores, 7,397 GB) junto con 581 tensores de escalas `FLOAT16` (0,933 GB). El archivo de datos externo fue repackado para eliminar bloques no referenciados que ocupaban un 49,97% del archivo original, reduciendo el tamaño de 16,65 GB a 8,33 GB, y se verificó que los pesos son bit-idénticos al original tras el repack.

Además, el repositorio incluye un `inference_metadata.yaml` que serializa un workflow completo de `pipeline.workflow`, definiendo el grafo decodificador y diez grafos de políticas de token como componentes del workflow, con el bucle autoregresivo expresado como datos que el runtime genérico ejecuta. Esto elimina la necesidad de un paso de lowering específico del decodificador. La exportación se realizó con ONNX Runtime GenAI, y el modelo está diseñado para ser ejecutado con la herramienta `profile_native` del benchmark de `onnx-genai-bench`.

## Capacidades

- Generación de texto autoregresiva con cuantización int4 para reducir el uso de memoria y acelerar la inferencia en GPUs de consumo.
- Soporte de decodificación con configuración de sampling (greedy, etc.) a través de grafos de política de token definidos en ONNX.
- Capacidad de ejecución con ONNX Runtime GenAI en GPU (CUDA) y posiblemente CPU, aunque el caso de uso principal es GPU.
- El modelo puede manejar secuencias de hasta 8192 tokens de contexto.
- No se menciona soporte explícito de tool calling, function calling o capacidades multimodales en esta exportación.
- El modelo es multilingüe en su versión original (Qwen2.5 soporta 29 idiomas), pero esta exportación no especifica idiomas concretos.

## Casos de uso

- **Investigación de límites de memoria mapeada en GPUs**: el propósito original del modelo es reproducir la medición de `host_mapped_bytes` en Linux sin WDDM, para determinar si el límite de ~0,65 GB es una propiedad del hardware o del driver de Windows.
- **Validación de cuantización int4 en producción**: permite verificar que la cuantización zero-point no introduce errores silenciosos en la generación, comparando los token IDs de salida con una referencia establecida en el mismo hardware.
- **Despliegue de modelos grandes en GPUs de consumo**: con 8,33 GB de pesos, el modelo puede ejecutarse en una GPU de 8 GB (como la RTX 4060 Laptop) usando ONNX Runtime GenAI, aunque el throughput varía entre 3,9 y 28 tok/s según la configuración.
- **Pruebas de offloading de pesos a memoria host**: sirve para evaluar el rendimiento de la lectura de pesos desde memoria mapeada en Linux, comparando con el comportamiento en Windows.
- **Integración en pipelines de inferencia ONNX**: el formato con `inference_metadata.yaml` permite ejecutar el modelo sin un loader especializado, lo que facilita la integración en entornos que usan el runtime genérico de ONNX.
- **Evaluación de calidad de generación con cuantización int4**: permite comparar la salida de este modelo cuantizado con la versión en FP16/FP32 del mismo modelo base para medir la degradación de la calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información proporcionada. La model card solo reporta una medición de rendimiento de referencia en un hardware específico:

| Métrica | Valor |
|---|---|
| Hardware | RTX 4060 Laptop (8 GB, WDDM) |
| Throughput (decodificación) | 3,9–28 tok/s (variación alta en configuraciones idénticas) |
| Tiempo de generación | 16 tokens, prompt "The capital of France is" |

La variación de 3,9 a 28 tok/s entre configuraciones idénticas se menciona como un síntoma del problema de corrupción de memoria que el modelo intenta reproducir, por lo que no se debe considerar como una métrica de rendimiento estable.

## Requisitos de hardware

- **VRAM estimada**: el tamaño de los pesos es de 8,33 GB, por lo que se necesita una GPU con al menos 8 GB de VRAM para la inferencia completa (sin offloading).
- **GPU recomendadas**: el modelo fue probado en una RTX 4060 Laptop (8 GB). En general, cualquier GPU con 8 GB o más de VRAM y soporte CUDA es suficiente.
- **GPU de consumo**: sí, cabe en GPUs de consumo como la RTX 4060 Laptop, RTX 4060 Ti, RTX 3060 12 GB, etc.
- **Opciones de despliegue**: ONNX Runtime GenAI (con `--ep cuda`), usando el binario `profile_native` compilado desde el repositorio `onnx-genai-bench`.
- **Latencia y throughput**: en la RTX 4060 Laptop, se observaron 3,9–28 tok/s, con una gran variabilidad que es parte del problema investigado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Formato | Licencia | Uso previsto |
|---|---|---|---|---|---|---|
| `justinchuby/qwen2.5-14b-instruct-int4-zp-onnx` | 14,7 B | 8192 | int4 zero-point | ONNX | Apache 2.0 | Investigación de offloading de memoria |
| `Qwen/Qwen2.5-14B-Instruct` (original) | 14,7 B | 131072 (128K) | FP16/BF16 | safetensors | Apache 2.0 | Uso general en producción |
| Modelos GGUF de Qwen2.5-14B-Instruct (llama.cpp) | 14,7 B | 131072 | int4/int8 (k-quants) | GGUF | Apache 2.0 | Inferencia local con llama.cpp/Ollama |

La diferencia principal es que el modelo original tiene un contexto de 128K tokens, mientras que esta exportación ONNX limita el contexto a 8192 tokens. El formato GGUF permite ejecución en CPU y GPU con herramientas como llama.cpp, mientras que el formato ONNX está orientado a ONNX Runtime GenAI. La licencia es la misma (Apache 2.0) en todos los casos.

## Limitaciones y advertencias

- **Problema de corrupción silenciosa de datos**: en Windows/WDDM, la lectura de memoria mapeada desde host por encima de ~0,44–0,65 GB por paso puede devolver datos obsoletos sin error aparente, lo que genera tokens incorrectos. Este es el problema principal que el modelo está diseñado para reproducir, por lo que no debe usarse en producción sin verificar la integridad de las salidas.
- **Contexto limitado a 8192 tokens**: aunque el modelo base soporta 128K tokens, esta exportación ONNX fija `context_length` en 8192, lo que limita las aplicaciones de contexto largo.
- **Variabilidad de rendimiento**: el throughput de decodificación puede variar drásticamente (3,9–28 tok/s) entre ejecuciones idénticas, lo que indica un comportamiento inestable en el hardware probado.
- **No es un modelo de propósito general**: está pensado como fixture de medición, no como un modelo para uso directo en aplicaciones. La calidad de generación puede verse degradada por la cuantización int4 y por el formato de ejecución.
- **Dependencia de ONNX Runtime GenAI**: el modelo requiere el runtime específico y la compilación del binario `profile_native` para su uso, lo que limita su portabilidad a otros entornos.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje, puede generar contenido falso o inventado, especialmente fuera de su contexto de entrenamiento.

## Enlaces

- [Repositorio HuggingFace: justinchuby/qwen2.5-14b-instruct-int4-zp-onnx](https://huggingface.co/justinchuby/qwen2.5-14b-instruct-int4-zp-onnx)
- [Issue #925 en onnx-genai (el motivo de la creación del modelo)](https://github.com/justinchuby/onnx-genai/issues/925)
- [Issue #853 en onnx-genai (sizing incorrecto de pesos)](https://github.com/justinchuby/onnx-genai/issues/853)
- [PR #856 en onnx-genai (fix del sizing)](https://github.com/justinchuby/onnx-genai/pull/856)
- [Script de repack de datos externos](https://github.com/justinchuby/onnx-genai/blob/main/scripts/repack_external_data.py)
- [Issue #488 en onnxruntime/mobius (origen del blob duplicado)](https://github.com/onnxruntime/mobius/issues/488)
- [Modelo original Qwen2.5-14B-Instruct](https://huggingface.co/Qwen/Qwen2.5-14B-Instruct)

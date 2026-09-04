# aj9o9/K2-Horizon-MoVA-36B-A4B-GGUF

## Resumen

El modelo K2-Horizon-MoVA-36B-A4B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por IFM (MBZUAI-IFM). Tiene 36.000 millones de parámetros totales (37.444.792.020 según safetensors) y aproximadamente 4.000 millones de parámetros activos por token, lo que lo hace eficiente en cómputo para su tamaño. Esta versión en concreto es una conversión a formato GGUF realizada por el usuario aj9o9, destinada a ejecutarse con llama.cpp en local. La conversión se hizo directamente con llama-quantize a partir del GGUF BF16 original de IFM, sin utilizar importance matrix ni datos de calibración. El repo incluye tres cuantizaciones (Q4_K_M, Q5_K_M y Q6_K) que permiten ejecutar el modelo en GPUs de consumo como una RTX 3090. Es relevante porque ofrece una alternativa de inferencia local para un modelo MoE de 36B con solo 4B activos, siempre que se use el fork de llama.cpp con soporte para la arquitectura K2 Horizon.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | K2 Horizon (Mixture of Experts) |
| Parametros totales | 37.444.792.020 (según safetensors) |
| Parametros activos | ~4.000 millones por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura K2 Horizon, que es una variante de Mixture of Experts (MoE). Según la información disponible, el modelo tiene 36.000 millones de parámetros totales y unos 4.000 millones activos por token, lo que significa que por cada token generado solo se calcula una fracción de los parámetros. No se han proporcionado datos sobre el proceso de entrenamiento, la composición del dataset, el número de tokens de entrenamiento ni si se aplicaron técnicas como RLHF o DPO. La conversión GGUF parte del modelo original en BF16 publicado por IFM y se realizó con llama-quantize sin calibrar, por lo que la cuantización es una conversión directa de pesos sin ajuste por importancia.

## Capacidades

- Generación de texto: el modelo está etiquetado como text-generation y es conversacional, pero no se han publicado pruebas específicas de calidad.
- Tool calling / function calling: no disponible.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio, thinking mode): no disponible.

## Casos de uso

- Asistente conversacional local: el modelo puede ejecutarse en local con llama.cpp, lo que permite integrarlo en aplicaciones de chat privadas sin depender de APIs externas. Es adecuado por su licencia Apache-2.0 y su formato GGUF.
- Procesamiento de datos confidenciales: al no requerir conexión a internet, es útil en entornos con requisitos de privacidad. La ausencia de datos sobre idiomas y contexto limita su uso en dominios específicos.
- Investigación de arquitecturas MoE: los investigadores pueden estudiar el comportamiento de K2 Horizon y compararlo con otros modelos MoE. El repo incluye los quants y el fork necesario.
- Generación de texto creativo: como modelo de lenguaje general, puede emplearse para redactar contenido, aunque no hay benchmarks que validen su calidad.
- Resumen de documentos: potencialmente útil para resumir textos, pero la longitud de contexto no está documentada, por lo que se recomienda validar antes de usar en producción.
- Despliegue en hardware de consumo: la cuantización Q4_K_M de 22.37 GB permite ejecutar el modelo en una RTX 3090, lo que facilita prototipado y desarrollo local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los siguientes datos son mediciones locales de rendimiento de inferencia en una NVIDIA GeForce RTX 3090 (24,103 MiB) con AMD Ryzen 9 9900X, usando `-p 512 -n 128 -b 512 -ub 512 -r 3 -ngl 999 -ncmoe 36`:

| Quant | Prompt processing (512 tokens) | Generación (128 tokens) |
|---|---:|---:|
| Q4_K_M | 832.14 ± 6.21 tok/s | 41.00 ± 0.07 tok/s |
| Q5_K_M | 750.78 ± 13.13 tok/s | 36.85 ± 0.08 tok/s |
| Q6_K | 672.93 ± 7.53 tok/s | 32.68 ± 0.22 tok/s |

## Requisitos de hardware

- VRAM estimada: los archivos GGUF ocupan 22.37 GB (Q4_K_M), 26.44 GB (Q5_K_M) y 30.77 GB (Q6_K). La VRAM necesaria depende de la cantidad de capas descargadas en GPU.
- GPU recomendada: NVIDIA RTX 3090 (24 GB) o superior. El benchmark se ejecutó en RTX 3090 con `-ngl 999 -ncmoe 36`, descargando todas las capas a GPU y 36 capas MoE a CPU.
- Consumer GPU: la RTX 3090 puede ejecutar Q4_K_M y Q5_K_M con descarga parcial. Q6_K puede requerir más VRAM o más offload a CPU.
- Opciones de despliegue: llama.cpp con el fork de MBZUAI-IFM (rama `model/K2Horizon`). Se puede usar `llama-cli` o `llama-server`. No se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput: los valores de la tabla de benchmarks (prompt processing y generación).

## Comparativa con modelos similares

No se han encontrado datos de benchmarks comparativos con otros modelos de la misma categoría en la información disponible. El modelo se puede clasificar como un MoE de 36B con 4B activos, pero sin resultados de calidad no es posible realizar una comparación rigurosa.

## Limitaciones y advertencias

- La arquitectura K2 Horizon no está soportada en llama.cpp estándar; es necesario compilar el fork de MBZUAI-IFM en la rama `model/K2Horizon`.
- La conversión GGUF se hizo sin importance matrix ni datos de calibración, lo que puede degradar la calidad de la cuantización en comparación con quants calibrados.
- No hay información sobre sesgos, riesgos de alucinación, limitaciones de contexto ni idiomas soportados.
- Los benchmarks de rendimiento son mediciones locales en una única configuración de hardware y no representan garantías de producción.
- La licencia Apache-2.0 permite uso comercial, pero las restricciones de la arquitectura y el fork pueden afectar el despliegue.

## Enlaces

- Repo HuggingFace: https://huggingface.co/aj9o9/K2-Horizon-MoVA-36B-A4B-GGUF
- Modelo base: https://huggingface.co/IFM/K2-Horizon-MoVA-36B-A4B
- GGUF fuente: https://huggingface.co/IFM/K2-Horizon-MoVA-36B-A4B-GGUF
- Repo GGUF alternativo: https://huggingface.co/abenzerps/K2-Horizon-MoVA-36B-A4B-GGUF
- Fork de llama.cpp requerido: https://github.com/MBZUAI-IFM/llama.cpp/tree/model/K2Horizon

# amd/Qwen3.6-35B-A3B-EXTENSOR

## Resumen

El modelo `amd/Qwen3.6-35B-A3B-EXTENSOR` es una imagen de runtime EXTENSOR derivada del modelo base `Qwen/Qwen3.6-35B-A3B`, desarrollado por Alibaba y publicado por AMD para su ecosistema ROCm. Se trata de un artefacto optimizado para inferencia de alto rendimiento en GPUs AMD Instinct, que incluye el modelo de texto completo y su módulo MTP (Multi-Token Prediction) para decodificación especulativa sin pérdida. No incluye la torre de visión del modelo original, por lo que se limita a tareas de generación de texto.

Este runtime es relevante porque ofrece una cuantización ROCmFP4 específica para hardware AMD, con un tamaño de archivo de aproximadamente 19,6 GB, lo que permite desplegar un modelo MoE de 35B parámetros totales en GPUs con 24 GB o más de VRAM. La decodificación especulativa MTP acelera la generación manteniendo la autoridad del modelo principal en cada token emitido, una ventaja clave para aplicaciones en producción. El formato es GGUF v3 con empaquetado EXTENSOR v2, y requiere el runtime EXTENSOR 2.3.2 o superior, no siendo compatible con llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atencion hibrida (basado en Qwen3.6-35B-A3B) |
| Parametros totales | 34.660.610.688 (34,66 B) |
| Parametros activos | ~3 B (segun nomenclatura A3B, no confirmado oficialmente) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ROCmFP4 (target y MTP), Q8_0 (fusion MTP), F16 (controles) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF v3 (EXTENSOR pack v2), safetensors disponible en el repo base |

## Arquitectura y entrenamiento

Este artefacto no es un modelo entrenado desde cero, sino una imagen de runtime que envuelve el modelo base `Qwen/Qwen3.6-35B-A3B`. El modelo base es un transformer MoE con atencion hibrida (combinando atencion full y lineal, segun la documentacion publica de Qwen 3.6). El runtime EXTENSOR anade un modulo MTP que actua como borrador para decodificacion especulativa: el modelo MTP genera candidatos de tokens que el modelo principal verifica, logrando aceleracion sin perdida de calidad (lossless greedy speculative decoding). La cuantizacion ROCmFP4 esta optimizada para la arquitectura CDNA de AMD, con controles en F16 para mantener precision en partes criticas. No se dispone de informacion detallada sobre el dataset de entrenamiento ni el proceso de alineacion del modelo base en esta ficha.

## Capacidades

- Generacion de texto autoregresiva en modo chat y completado.
- Decodificacion especulativa MTP sin perdida, que acelera la inferencia manteniendo la autoridad del modelo principal.
- Soporte de tool calling y agentes (heredado del modelo base Qwen3.6-35B-A3B, aunque no verificado en este runtime).
- Capacidades multilingues (no especificadas en la informacion disponible).
- No incluye procesamiento de vision (la torre de vision fue excluida del runtime).

## Casos de uso

- Despliegue de chatbots en produccion sobre GPUs AMD Instinct: el runtime EXTENSOR esta disenado para entornos ROCm, ofreciendo baja latencia gracias a la decodificacion especulativa MTP.
- Generacion de codigo asistida en entornos de desarrollo: el modelo base de Qwen 3.6 tiene buen rendimiento en tareas de programacion, y la cuantizacion ROCmFP4 permite ejecutarlo en nodos AMD con VRAM limitada.
- Automatizacion de atencion al cliente: con soporte de tool calling (si el modelo base lo mantiene), puede integrarse en sistemas de ticketing o CRM para gestionar conversaciones multi-turno.
- Razonamiento multi-paso en pipelines de agentes: la arquitectura MoE con ~3B activos reduce el coste computacional por token, permitiendo ejecutar multiples agentes en paralelo en un solo GPU.
- Experimentacion academica con decodificacion especulativa: el artefacto incluye el modulo MTP ya fusionado, sirviendo como referencia para estudiar tecnicas de aceleracion sin perdida.
- Inferencia en entornos con restriccion de VRAM: el archivo de 19,6 GB en FP4 cabe en GPUs de 24 GB (p. ej., Radeon RX 7900 XTX con ROCm), permitiendo ejecutar un modelo de 35B en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para este artefacto EXTENSOR en la informacion disponible. Los benchmarks del modelo base `Qwen3.6-35B-A3B` (como MMLU, HumanEval, GSM8K) estan disponibles en el repositorio oficial de Qwen, pero no se han replicado aqui para este runtime cuantizado.

## Requisitos de hardware

- VRAM estimada: el archivo principal pesa 19,66 GB (v2) o 19,2 GB (v1). Se recomienda al menos 24 GB de VRAM para cargar el modelo completo con overhead de inferencia.
- GPU recomendadas: AMD Instinct MI200, MI300, MI350 o GPUs Radeon con ROCm 7.0 o superior. No compatible con CUDA.
- Soporte en consumer GPU: posible en Radeon RX 7900 XTX (24 GB) o RX 9070 XT (16 GB, solo con cuantizacion adicional no incluida).
- Opciones de despliegue: exclusivamente a traves del runtime EXTENSOR 2.3.2+ (backend API 4). No compatible con vLLM, llama.cpp, Ollama ni TGI en su forma actual.
- Latencia y throughput: no disponibles. La decodificacion especulativa MTP puede acelerar entre 1,5x y 2,5x en cargas de trabajo generativas, segun la literatura general, pero no hay datos medidos para este artefacto.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (base) | 34,66 B | ~3 B | no disponible | Apache 2.0 | safetensors, GGUF |
| amd/Qwen3.6-35B-A3B-EXTENSOR | 34,66 B | ~3 B | no disponible | Apache 2.0 | GGUF (EXTENSOR) |
| Qwen3-30B-A3B (generacion anterior) | 30,5 B | 3,3 B | 128k (segun repo) | Apache 2.0 | safetensors, GGUF |

La comparativa directa con otros runtimes optimizados para AMD (p. ej., vLLM con ROCm) no esta disponible en la informacion proporcionada. Este artefacto se diferencia por su empaquetado especifico para EXTENSOR, que no es portable a otros frameworks.

## Limitaciones y advertencias

- No compatible con llama.cpp ni con frameworks estandar como vLLM o TGI; requiere el runtime EXTENSOR 2.3.2 o superior.
- Exclusivo para hardware AMD con ROCm; no funciona en GPUs NVIDIA (CUDA) ni en CPUs sin soporte ROCm.
- No incluye la torre de vision del modelo base, por lo que no puede procesar imagenes.
- La cuantizacion ROCmFP4 puede introducir degradacion de precision en tareas de alta sensibilidad (p. ej., matematicas complejas) comparada con el modelo en FP16.
- El modelo base puede presentar sesgos y alucinaciones tipicos de los LLM; no se han documentado sesgos especificos para este runtime.
- La licencia Apache 2.0 permite uso comercial, pero el runtime EXTENSOR puede tener sus propias restricciones (no documentadas en la model card).
- No se dispone de informacion sobre la longitud de contexto soportada en esta cuantizacion; se recomienda verificar con el repositorio base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amd/Qwen3.6-35B-A3B-EXTENSOR
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio oficial de Qwen3.6: https://github.com/QwenLM/Qwen3.6
- Articulo tecnico de AMD sobre despliegue Day 0: https://www.amd.com/en/developer/resources/technical-articles/2026/day-0-support-for-qwen3-6-on-amd-instinct-gpus.html
- Guia de Qwen 3.6 (insiderllm): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/

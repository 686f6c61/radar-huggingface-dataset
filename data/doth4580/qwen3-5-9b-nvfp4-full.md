# doth4580/Qwen3.5-9B-NVFP4-FULL

## Resumen

Qwen3.5-9B-NVFP4-FULL es un artefacto de cuantización del modelo Qwen3.5-9B, desarrollado por el equipo Qwen de Alibaba y empaquetado por el usuario doth4580. Se trata de una variante cuantizada en NVFP4/FP8 que mantiene la arquitectura original del modelo base pero reduce el peso en disco a 5,4 GB, lo que permite ejecutarlo en hardware de gama GB10 (NVIDIA DGX Spark). El paquete está diseñado específicamente para el motor de inferencia veloGB10, aunque al usar el formato estándar `compressed-tensors` de Hugging Face puede emplearse con otros frameworks compatibles.

El modelo base Qwen3.5-9B es un transformer denso híbrido que combina 24 capas de GatedDeltaNet (atención lineal con estado recurrente de tamaño fijo) y 8 capas de atención completa GQA. Incorpora una cabeza nativa de predicción multi-token (MTP) que se utiliza para decodificación especulativa. Con 9.653 millones de parámetros totales y una ventana de contexto de 262.144 tokens, está orientado a tareas de generación de texto, razonamiento y código en entornos con requisitos de memoria ajustados.

La relevancia de este artefacto radica en que demuestra un flujo de cuantización agresiva (todos los GEMM en NVFP4) validado con decodificación especulativa sin pérdida de corrección y con serving multi-nodo (TP=2 y TP=4) sobre GB10. Para desarrolladores que trabajan con DGX Spark o clústeres pequeños de GB10, ofrece una vía concreta para servir un modelo de 9B con contexto largo y latencias medidas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido: 24 capas GatedDeltaNet (atención lineal) + 8 capas full GQA; hidden 4096, 16 cabezas Q / 4 KV |
| Parámetros totales | 9.653.104.368 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | NVFP4 para todos los GEMM (`nvfp4-full`), con componentes FP8; formato `nvfp4-pack-quantized` |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con layout `compressed-tensors` (`nvfp4-pack-quantized`) |
| Vocabulario | 248.320 tokens |
| Cabeza MTP | Nativa de predicción multi-token (para decodificación especulativa) |
| Tamaño en disco | 5,4 GB (repo: 5,7 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura híbrida que alterna capas de GatedDeltaNet —una forma de atención lineal con estado recurrente de tamaño fijo— con capas periódicas de atención completa GQA. Esta combinación busca reducir el coste computacional y de memoria del contexto largo manteniendo la capacidad de atención global en puntos clave de la red. La dimensión oculta es 4096, con 16 cabezas de consulta y 4 de clave/valor en las capas GQA. El vocabulario es de 248.320 tokens.

La innovación técnica más destacable del artefacto es la cuantización NVFP4 aplicada a todos los GEMM, junto con una cabeza MTP nativa que permite decodificación especulativa. El autor reporta que la suite completa de tests de corrección de veloGB10 pasa con este artefacto, así como decodificación especulativa greedy-lossless y serving TP=2 entre dos nodos. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original.

## Capacidades

- Generación de texto y razonamiento multi-turno con ventana de contexto de 262.144 tokens.
- Decodificación especulativa mediante cabeza MTP nativa, con tasas de aceptación de draft del 56,5 % (TP=2) y 56,6 % (TP=4) según las mediciones del autor.
- Serving multi-nodo con tensor parallelism TP=1, TP=2 y TP=4 sobre GB10, con transferencia de pesos bajo demanda a los nodos y caché local.
- API compatible con OpenAI (`/v1`) a través del motor veloGB10.
- Soporte de prefix caching (`--prefix-cache on`) para reutilización de prefijos en conversaciones.
- Control de sampling con penalización de presencia por defecto (1,5) y modo thinking activado en las pruebas de rendimiento.
- Capacidades de código y narración evaluadas en las mediciones de decode (turnos de código y de relato).
- Compatibilidad de formato con frameworks que lean `compressed-tensors` (`nvfp4-pack-quantized`), no solo veloGB10.
- No se dispone de información sobre soporte de tool calling, function calling, agentes, visión, audio ni capacidades multilingües específicas en la documentación proporcionada.

## Casos de uso

- Serving de un modelo de 9B con contexto largo en un único DGX Spark: con TP=1 y 5,4 GB en disco, el modelo cabe holgadamente en la memoria unificada de un GB10 y permite ventanas de hasta 262.144 tokens con `--max-seq-len 262144`.
- Despliegue en clúster pequeño de GB10 con TP=2 o TP=4: el motor distribuye los pesos a los nodos sin copia previa del modelo y mantiene caché local, lo que simplifica el escalado horizontal en laboratorios con varios DGX Spark.
- Generación de código en producción con latencia medida: los turnos de código alcanzan 60 tok/s en TP=1, 79 tok/s en TP=2 y 86 tok/s en TP=4, adecuados para asistentes de código interactivos servidos vía API compatible con OpenAI.
- Procesamiento de documentos largos: la ventana de 262.144 tokens y el prefix caching permiten analizar contratos, informes o bases de código extensas reutilizando prefijos entre consultas relacionadas.
- Prototipado de aplicaciones con API OpenAI: al exponer un endpoint `/v1` compatible, se pueden conectar clientes existentes sin cambios en el código de integración.
- Evaluación de recetas de cuantización NVFP4: investigadores pueden comparar la calidad y el rendimiento de `nvfp4-full` frente a otras recetas usando el mismo motor y hardware, con la suite de corrección de veloGB10 como referencia.
- Servicio batch moderado: con `--max-batch 2` y un agregado de 73 tok/s (TP=1), 99 tok/s (TP=2) y 143 tok/s (TP=4) en dos peticiones concurrentes, es viable para cargas de trabajo de baja concurrencia con requisitos de latencia estables.

## Benchmarks y rendimiento

Mediciones del autor con veloGB10 sobre GB10 (2026-11-06 a 2026-11-08, builds de desarrollo 0.7.7), con sampling de producción, thinking activado y decodificación especulativa incluida. Una ejecución por celda, variación aproximada de ±10 %.

| Topología | Fuente del draft | Decode turno de código (tok/s) | Decode turno de relato (tok/s) | Mediana decode todos los turnos (tok/s) | Prefill (tok/s) | 2 peticiones, agregado (tok/s) | Aceptación de draft |
|---|---|---:|---:|---:|---:|---:|---:|
| TP=1 | Cabeza MTP del pack | 60 | 46 | 46 | 2.181 | 73 | – |
| TP=2 | Cabeza MTP del pack | 79 | 58 | 59 | 2.354 | 99 | 56,5 % |
| TP=4 | Cabeza MTP del pack | 86 | 70 | 70 | 2.007 | 143 | 56,6 % |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el artefacto ocupa 5,4 GB en disco en NVFP4; en ejecución debe sumarse el estado recurrente de las capas GatedDeltaNet, la caché KV de las capas GQA y el overhead del motor. No se dispone de una cifra exacta de VRAM en inferencia.
- GPU recomendadas: NVIDIA GB10 (DGX Spark) para TP=1; dos o cuatro GB10 para TP=2 y TP=4 según las configuraciones probadas por el autor.
- Cabe en consumer GPU: no hay datos que confirmen compatibilidad con GPUs de consumo (RTX 4090, etc.); el artefacto está validado y ajustado para los kernels de veloGB10 sobre GB10.
- Opciones de despliegue: motor veloGB10 (`gb10_inference`, binario autocontenido, servidor compatible con OpenAI en el puerto 9000). Al usar el layout `compressed-tensors`, el autor indica que puede emplearse con cualquier framework que lea el formato, aunque no se documentan pruebas con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: prefill de 2.181 tok/s (TP=1), 2.354 tok/s (TP=2) y 2.007 tok/s (TP=4); decode mediano de 46, 59 y 70 tok/s respectivamente; agregado con 2 peticiones de 73, 99 y 143 tok/s.
- Configuración de serving probada: `--max-seq-len 262144`, `--max-batch 2`, `--max-tokens 65536`, `--default-presence-penalty 1.5`, `--prefix-cache on`, `--mtp=auto`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-NVFP4-FULL (este artefacto) | 9,65 B | 262.144 | NVFP4 (`nvfp4-full`) | Apache-2.0 | Hugging Face, validado con veloGB10 |
| Qwen/Qwen3.5-9B (modelo base) | 9,65 B | 262.144 | FP16/BF16 original | Apache-2.0 | Hugging Face |
| Alternativas de 9B comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre otros modelos de la misma categoría con la que establecer una comparación de rendimiento o calidad en la documentación proporcionada.

## Limitaciones y advertencias

- El artefacto está producido, validado y ajustado para los kernels de veloGB10 sobre GB10; el rendimiento medido no es extrapolable a otras GPUs o motores sin validación adicional.
- La cuantización NVFP4 modifica los pesos originales; no se han publicado evaluaciones de degradación de calidad frente al modelo base en la información disponible.
- Los benchmarks de rendimiento son una ejecución por celda con variación de ±10 %, por lo que las cifras deben tomarse como orientativas.
- No se dispone de información sobre sesgos, tasas de alucinación ni comportamiento multilingüe del modelo base.
- La licencia Apache-2.0 permite uso comercial, pero el autor declara que no reclama propiedad intelectual sobre el modelo ni sus pesos; los derechos permanecen en los autores originales.
- El tokenizador y la plantilla de chat son idénticos al modelo original; cualquier cambio de comportamiento debe atribuirse a la cuantización, no a modificaciones de la interfaz.
- No se documenta soporte de tool calling, agentes, visión o audio; no debe asumirse su disponibilidad en producción sin pruebas.
- El tamaño del repo (5,7 GB) y el formato `nvfp4-pack-quantized` requieren frameworks con soporte de `compressed-tensors`; la compatibilidad con ecosistemas distintos de veloGB10 no está verificada en la documentación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/doth4580/Qwen3.5-9B-NVFP4-FULL
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Motor de inferencia veloGB10: https://github.com/sf-stav/veloGB10

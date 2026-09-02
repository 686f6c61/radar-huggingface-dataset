# NovaAI6868/Qwen3.8-4B-Distill-GGUF-Q2_K

## Resumen

El modelo `NovaAI6868/Qwen3.8-4B-Distill-GGUF-Q2_K` es una cuantización en formato GGUF del modelo destilado `empero-ai/Qwen3.8-4B`, desarrollado por el laboratorio independiente Empero. Se trata de una destilación completa de los parámetros del modelo gigante Qwen3.8 2.4T A95B (de la serie Qwen3.8 de Alibaba) sobre la arquitectura compacta Qwen3.5-4B, entrenada con aproximadamente 45.000 trazas de profesor procedentes de los conjuntos de destilación internos de Empero. El resultado es un modelo de razonamiento de unos 4.000 millones de parámetros con una ventana de contexto de 262.144 tokens, pensado para ejecutarse en hardware modesto.

Esta ficha concreta corresponde a la variante cuantizada con el método Q2_K ponderado por matriz de importancia (imatrix), que reduce el peso del archivo a 2,044 GB y permite su ejecución en entornos con aproximadamente 2,5 GB de VRAM. La cuantización la ha realizado el usuario NovaAI6868 a partir de los pesos BF16 de referencia publicados por Empero. Es una opción adecuada cuando la memoria es la restricción principal, aunque con una pérdida de calidad notable respecto a cuantizaciones superiores como Q4_K_M.

La relevancia de este modelo reside en su arquitectura híbrida de nueva generación: combina capas de atención completa con capas Gated DeltaNet, una variante de atención lineal que reduce el coste computacional y de memoria en contextos largos. Esto lo convierte en un candidato interesante para despliegues en dispositivos con recursos limitados, manteniendo capacidades de razonamiento gracias a su modo de pensamiento explícito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen35` (híbrida: Gated DeltaNet + atención completa cada 4 capas) |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q2_K (imatrix) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo `Qwen3.8-4B-Q2_K.gguf`, 2,044 GB) |

## Arquitectura y entrenamiento

El modelo base `empero-ai/Qwen3.8-4B` es una destilación de conocimiento completa del modelo Qwen3.8 2.4T A95B sobre la arquitectura Qwen3.5-4B. La arquitectura resultante es híbrida: por cada cuatro capas, tres son de tipo Gated DeltaNet (una variante de atención lineal con estado recurrente) y una es de atención completa estándar. El modelo tiene 33 capas en total, con un tamaño de embedding de 2560, 16 cabezas de atención y 4 cabezas KV. Esta combinación reduce el coste de atención en secuencias largas, lo que explica su ventana de contexto de 262.144 tokens.

El entrenamiento de la destilación se realizó con aproximadamente 45.000 trazas de profesor curadas de los conjuntos de datos internos de Empero, lo que permite transferir las capacidades de razonamiento del modelo gigante al modelo compacto. La cuantización Q2_K de esta ficha se ha calculado con una matriz de importancia (imatrix) calibrada sobre un conjunto diverso de aproximadamente 4.900 fragmentos de texto en inglés, a partir de los pesos BF16 de referencia. El resultado es un archivo GGUF que conserva la plantilla de chat integrada y el comportamiento de razonamiento del modelo original.

## Capacidades

- Generación de texto y razonamiento multi-paso: el modelo abre cada respuesta con un bloque de pensamiento explícito (etiquetas `thinking` y `response`), lo que permite seguir su proceso de razonamiento.
- Ventana de contexto muy amplia: 262.144 tokens, adecuada para documentos largos o conversaciones extensas.
- Soporte de chat conversacional mediante plantilla integrada en el archivo GGUF.
- Capacidades multilingües: no disponibles; la ficha del modelo indica únicamente inglés.
- Tool calling, visión, audio y otras capacidades multimodales: no disponibles en la información proporcionada.

## Casos de uso

- Inferencia en dispositivos con poca memoria: con 2,5 GB de VRAM a contexto modesto, el modelo puede ejecutarse en GPUs de consumo como una RTX 3060 o incluso en CPU con suficiente RAM, gracias a la cuantización Q2_K.
- Prototipado rápido de aplicaciones de razonamiento: su modo de pensamiento explícito permite depurar y evaluar la lógica del modelo antes de migrar a cuantizaciones superiores.
- Chatbots locales y asistentes personales: la plantilla de chat integrada y el soporte de llama.cpp, Ollama, LM Studio, Jan y KoboldCpp facilitan su integración en entornos de escritorio.
- Análisis de documentos largos: la ventana de 262.144 tokens permite procesar informes, contratos o artículos extensos en una sola pasada, aunque la calidad de la cuantización Q2_K puede degradar la comprensión en cadenas de razonamiento largas.
- Educación e investigación: sirve como banco de pruebas para estudiar arquitecturas híbridas Gated DeltaNet y técnicas de destilación de modelos grandes a pequeños.
- Generación de código y asistencia en programación: aunque no se especifican benchmarks, el modelo base hereda capacidades de razonamiento del Qwen3.8, por lo que puede usarse para tareas de autocompletado y explicación de código en entornos sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor remite a la ficha principal de `empero-ai/Qwen3.8-4B` para los datos de rendimiento completos, pero dichos datos no se han incluido en la información proporcionada. No se dispone de cifras de MMLU, HumanEval, GSM8K u otras pruebas estandarizadas para esta cuantización concreta.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,5 GB a contexto modesto (según la model card). A contexto completo de 262.144 tokens, la memoria necesaria aumentará considerablemente.
- GPU recomendadas: cualquier GPU con al menos 3 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 3060, o GPUs integradas con memoria compartida suficiente.
- Compatibilidad con CPU: el formato GGUF permite ejecución en CPU mediante llama.cpp, aunque la velocidad será limitada.
- Opciones de despliegue: llama.cpp (recomendado, requiere una versión reciente con soporte Qwen3.5/Gated DeltaNet), Ollama, LM Studio, Jan, KoboldCpp.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-4B-Distill (este, Q2_K) | 4,33 B | 262.144 | Híbrida Gated DeltaNet + atención | Apache-2.0 | GGUF |
| Qwen3.5-4B (base original) | ~4 B | no disponible | Híbrida Gated DeltaNet + atención | Apache-2.0 | safetensors, GGUF |
| Llama 3.2 3B | 3,21 B | 128.000 | Transformer denso | Llama 3.2 | safetensors, GGUF |
| Gemma 3 4B | 4 B | 32.000 | Transformer denso | Gemma | safetensors, GGUF |

La comparativa se basa únicamente en datos públicos de arquitectura y licencia; no se dispone de resultados de benchmarks comparativos para esta cuantización. El modelo destilado de Empero destaca por su contexto extremadamente largo y su arquitectura híbrida, mientras que las alternativas de Llama y Gemma son arquitecturas transformer densas convencionales.

## Limitaciones y advertencias

- La cuantización Q2_K es agresiva (2 bits) y produce una pérdida de calidad notable respecto a Q4_K_M y superiores, especialmente en cadenas de razonamiento largas. Se recomienda usar este archivo solo cuando la memoria sea la restricción principal.
- Se requiere una versión reciente de llama.cpp con soporte para la arquitectura Qwen3.5 / Gated DeltaNet; las versiones antiguas no cargarán el modelo.
- El modelo está entrenado únicamente en inglés; no se garantiza un rendimiento adecuado en otros idiomas.
- Al ser un modelo de razonamiento, cada respuesta comienza con un bloque de pensamiento que debe ser eliminado o mostrado con cuidado en aplicaciones orientadas al usuario final.
- Riesgo de alucinación inherente a los modelos de lenguaje; la cuantización agresiva puede aumentar la frecuencia de errores factuales.
- No se dispone de información sobre sesgos específicos del modelo destilado ni de evaluaciones de seguridad adicionales.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar la procedencia de los pesos y las condiciones de la serie Qwen3.8 original.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/NovaAI6868/Qwen3.8-4B-Distill-GGUF-Q2_K
- Modelo base cuantizado (empero-ai): https://huggingface.co/empero-ai/Qwen3.8-4B-Distill-GGUF
- Modelo base original (empero-ai): https://huggingface.co/empero-ai/Qwen3.8-4B
- Repositorio oficial de la serie Qwen3.8 (GitHub): https://github.com/QwenLM/Qwen3.8
- Laboratorio Empero: https://empero.org/
- Proyecto llama.cpp: https://github.com/ggml-org/llama.cpp

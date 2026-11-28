# DFveloper/Lumen-3.8-Pulsar-26B-A3B-it-qat-w8a16-ct

## Resumen

Lumen 3.8 Pulsar 26B-A3B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) disperso desarrollado por Aeonthic, publicado en Hugging Face por el usuario DFveloper. Se trata de un fine-tune del modelo base `google/gemma-4-26B-A4B`, orientado a tareas multimodales de imagen-texto a texto, y distribuido en su edición cuantizada W8A16 mediante Quantization-Aware Training (QAT). El modelo declara una arquitectura de inferencia asimétrica, con un presupuesto de parámetros activos distinto para la fase de prefill y la de decode.

La propuesta diferencial del modelo es esa asimetría de cómputo: 3,82B de parámetros activos durante el prefill y 3,08B durante el decode, lo que supone una reducción de aproximadamente el 19,4% en el coste de generación autorregresiva respecto al procesamiento del prompt. Incorpora además WSPO (Weight Space Programming Optimization), una metodología propia de Aeonthic que modifica pesos directamente en el espacio de parámetros sin retropropagación convencional, mediante actualizaciones de bajo rango (rank-32) sobre las proyecciones `ffn_down`.

Esta edición concreta, W8A16 con formato compressed-tensors, está pensada para preservar de forma bit-exacta los valores cuantizados del checkpoint Q4_0 GGUF de referencia, lo que la hace adecuada para evaluación alineada con la referencia, reproducibilidad numérica e investigación en cuantización. El repositorio ocupa 32,4 GB y el recuento real de parámetros en safetensors es de 27.898.336.846.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts disperso asimétrico (sparse MoE) |
| Parametros totales | 27.898.336.846 (~27,9B según safetensors; clase 26B según el autor) |
| Parametros activos | 3,82B en prefill y 3,08B en decode |
| Longitud de contexto | 262.144 tokens |
| Ventana de atención deslizante | 1.024 tokens |
| Tipos de cuantizacion | W8A16 (pesos INT8, activaciones de 16 bits) mediante QAT; existe una edición W4A16 con pérdida |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors con compressed-tensors (W8A16) |
| Modelo base | google/gemma-4-26B-A4B |
| Niveles de esfuerzo de razonamiento | 6 |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de Mixture-of-Experts disperso con enrutamiento selectivo, derivada de Gemma 4 26B-A4B. La innovación principal es la asimetría entre etapas de inferencia: el presupuesto de parámetros activos no es uniforme, sino que se reduce durante el decode (3,08B) frente al prefill (3,82B), con el objetivo de mejorar la eficiencia de la generación autorregresiva sin penalizar el procesamiento del prompt. El modelo combina atención con ventana deslizante de 1.024 tokens con un contexto total declarado de 262.144 tokens.

El entrenamiento incorpora Quantization-Aware Training (QAT), de modo que la representación de pesos en baja precisión se tiene en cuenta durante la optimización. Sobre el modelo base se aplica además WSPO, una metodología de Aeonthic que analiza activaciones y comportamiento de salida para identificar modificaciones directas en el espacio de pesos, sin retropropagación estándar. La implementación revisada de WSPO emplea actualizaciones de bajo rango (rank-32) sobre los tensores `ffn_down`, que se fusionan directamente en los pesos en lugar de distribuirse como adaptadores en tiempo de ejecución. No se dispone de datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generación de texto y conversación multi-turno, con pipeline declarado image-text-to-text (entrada de imagen y texto, salida de texto).
- Razonamiento con seis niveles de esfuerzo configurables.
- Procesamiento de contexto largo: hasta 262.144 tokens, con atención deslizante de 1.024 tokens.
- Capacidades multimodales de entrada de imagen, heredadas del modelo base Gemma 4.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no confirmado en la información proporcionada; los niveles de esfuerzo de razonamiento sugieren control sobre la profundidad de razonamiento.

## Casos de uso

- Evaluación alineada con la referencia: al preservar de forma bit-exacta los pesos cuantizados del checkpoint Q4_0, esta edición sirve para comparar resultados de distintos backends contra una referencia numérica estable.
- Investigación en cuantización: permite estudiar el impacto de QAT y de la representación W8A16 frente a W4A16 sin la pérdida adicional de conversión que introduce esta última.
- Validación de backends de inferencia: útil para verificar implementaciones de compressed-tensors y comprobar la coherencia de logits y salidas entre motores, teniendo en cuenta que la preservación bit-exacta de pesos no garantiza salidas idénticas.
- Procesamiento de documentos largos con imagen: con 262.144 tokens de contexto y entrada multimodal, puede emplearse para analizar informes, contratos o expedientes que combinen texto extenso e imágenes.
- Preservación de pesos modificados por WSPO: al no perder la asignación de precisión mixta de los tensores FFN, es la edición preferida para desplegar modelos con actualizaciones WSPO fusionadas.
- Asistentes conversacionales con razonamiento configurable: los seis niveles de esfuerzo permiten ajustar el coste computacional por consulta según la complejidad de la tarea.
- Despliegue con eficiencia en decode: la reducción del 19,4% de parámetros activos en generación resulta adecuada para cargas donde la latencia de token a token es crítica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 32,4 GB en W8A16, por lo que se requiere al menos ese espacio para cargar los pesos, más memoria para activaciones y caché KV del contexto de 262.144 tokens.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño de pesos, se necesitan GPUs con 40-48 GB o más de memoria (A100 80GB, H100, L40S) para carga completa en W8A16.
- GPU de consumo: no cabe en GPUs consumer de 24 GB (RTX 4090) en W8A16 con contexto completo; sería necesario recurrir a la edición W4A16 o a offloading.
- Opciones de despliegue: el formato compressed-tensors W8A16 requiere backends compatibles con esta representación; llama.cpp, Ollama, vLLM o TGI no están confirmados en la información proporcionada.
- Latencia y throughput: no disponibles; el autor indica que las mejoras reales dependen de hardware, ancho de banda de memoria, batching, comportamiento del enrutamiento e implementación del backend.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Lumen 3.8 Pulsar 26B-A3B (W8A16) | ~27,9B | 3,82B prefill / 3,08B decode | 262.144 | no disponible | safetensors compressed-tensors |
| google/gemma-4-26B-A4B | clase 26B | ~4B | no disponible | no disponible | no disponible |
| AIKAR 3.2 Pro | no disponible | no disponible | no disponible | no disponible | no disponible |

El autor declara como objetivo superar a AIKAR 3.2 Pro en capacidad general, pero no se han publicado datos de benchmarks que permitan verificar esa comparación. No se dispone de información suficiente sobre modelos alternativos de la misma categoría para una comparativa cuantitativa.

## Limitaciones y advertencias

- La preservación bit-exacta de pesos no garantiza logits ni salidas idénticas entre backends: la acumulación en coma flotante, las implementaciones de kernels, el enrutamiento y el muestreo pueden introducir diferencias de ejecución.
- La edición W8A16 no recupera información eliminada por la cuantización original de baja precisión; solo preserva los valores del checkpoint de referencia.
- La edición W4A16 no preserva completamente la asignación de precisión mixta de los tensores FFN, incluidos los de mayor precisión usados por WSPO.
- El recuento de parámetros puede variar según la librería o plataforma, en función de cómo se contabilicen embeddings, componentes de enrutamiento y parámetros auxiliares.
- La designación A3B representa una clase aproximada de parámetros activos, no un presupuesto fijo en todas las etapas de inferencia.
- Las mejoras de throughput de la arquitectura asimétrica dependen de hardware, memoria, batching y backend, y no están cuantificadas.
- Licencia no disponible: no puede confirmarse el uso comercial sin consultar al autor.
- Idiomas soportados no disponibles: riesgo de rendimiento desigual fuera de los idiomas del modelo base.
- Sesgos y riesgo de alucinación: no documentados en la información proporcionada; deben asumirse los del modelo base Gemma 4.
- WSPO es una metodología en evolución y parte de su implementación (actualizaciones rank-32 sobre `ffn_down`) se describe como planificada.

## Enlaces

- Hugging Face: https://huggingface.co/DFveloper/Lumen-3.8-Pulsar-26B-A3B-it-qat-w8a16-ct
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B

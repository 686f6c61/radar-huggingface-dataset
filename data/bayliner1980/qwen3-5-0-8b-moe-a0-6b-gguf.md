# bayliner1980/Qwen3.5-0.8B-MoE-A0.6B-GGUF

## Resumen

Qwen3.5-0.8B-MoE-A0.6B-GGUF es la versión cuantizada en formato GGUF de un experimento de "moeficación": la conversión de un modelo denso en una arquitectura Mixture-of-Experts sin reentrenamiento desde cero. El modelo base, creado por el usuario bayliner1980, toma la parte de texto de Qwen3.5-0.8B de Alibaba y transforma cada MLP en 28 expertos de 128 neuronas, con un router que activa 14 expertos por token, reduciendo a la mitad el cómputo de las MLP. Posteriormente, el modelo denso original se destiló sobre el resultado, incluyendo su formato de chat.

El interés de este modelo no es tanto su rendimiento absoluto —que es inferior al del modelo denso original— sino su valor como prueba de concepto técnica: demuestra que se puede convertir un transformer denso híbrido (Gated DeltaNet + atención completa) en MoE mediante destilación, obteniendo un modelo con ~623M de parámetros activos frente a los 752M del original. Es relevante para desarrolladores e investigadores que exploran técnicas de compresión de modelos, inferencia eficiente en hardware modesto y arquitecturas MoE derivadas de modelos densos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5MoeForCausalLM (transformer híbrido MoE: 18 capas Gated DeltaNet + 6 de atención completa, ratio 3:1) |
| Parametros totales | 755.465.024 (~755,5M) |
| Parametros activos | ~623M por token (~369M excluyendo embeddings y LM head) |
| Longitud de contexto | no disponible oficialmente; la destilación usó secuencias de 512 tokens y la evaluación 1024; contextos mayores no han sido verificados |
| Tipos de cuantizacion | GGUF (incluye Q4_K_M; cuantizaciones exactas disponibles no detalladas en la model card) |
| Idiomas soportados | Inglés (entrenamiento y evaluación centrados en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base está disponible en safetensors |

## Arquitectura y entrenamiento

La arquitectura mantiene intacta la del modelo denso original de Qwen3.5-0.8B: 24 capas en configuración híbrida, con 18 capas Gated DeltaNet (una variante de SSM/attention lineal) y 6 capas de atención completa agrupada en ratio 3:1. El tamaño oculto es de 1024 con un vocabulario de 248.320 tokens y embeddings atados (tied embeddings). La innovación principal está en las MLP: cada una de las MLP SwiGLU originales de 3584 neuronas se divide en 28 expertos de 128 neuronas, con un router que selecciona los 14 expertos más relevantes por token (entrenado con top-12, inferencia con top-14), lo que reduce el cómputo activo de las MLP al 50%. Se añadieron 0,7M de parámetros para los routers y 2,4M para un shared expert de relleno (zero shared expert).

El entrenamiento se realizó por destilación desde el modelo denso original, sin preentrenamiento desde cero, utilizando los datasets HuggingFaceFW/fineweb-edu, HuggingFaceH4/ultrachat_200k, Salesforce/wikitext y allenai/c4. La destilación se llevó a cabo con secuencias de 512 tokens e incluyó el formato de chat del modelo original. No se ha publicado información sobre RLHF/DPO adicional. Un detalle importante: el modo thinking del template de chat no fue reentrenado tras la conversión, por lo que el autor recomienda mantenerlo desactivado.

## Capacidades

- Generación de texto conversacional en inglés, con el formato de chat heredado del modelo denso original mediante destilación.
- Razonamiento básico evaluado en benchmarks de sentido común y conocimiento (HellaSwag, ARC, WinoGrande, OpenBookQA), con rendimiento inferior al modelo denso.
- Compatibilidad nativa con llama.cpp mediante la arquitectura `qwen35moe` integrada, sin necesidad de parches.
- No hay soporte verificado de tool calling, function calling ni capacidades agénticas.
- El modo thinking del template no está entrenado y debe mantenerse desactivado.
- Sin capacidades de visión ni audio; es un modelo de texto puro.

## Casos de uso

- Experimentación con moeficación: sirve como referencia reproducible para investigadores que quieran estudiar cómo convertir modelos densos en MoE mediante destilación, con resultados de evaluación publicados para comparar.
- Inferencia en hardware modesto: con ~623M de parámetros activos y cuantización Q4_K_M, puede ejecutarse en portátiles y GPUs de consumo con recursos limitados.
- Chatbots ligeros en local: gracias al formato de chat destilado y al soporte de `llama-server`, puede alimentar asistentes conversacionales simples en inglés en entornos locales sin conexión.
- Prototipado de aplicaciones de texto: útil para pruebas rápidas de pipelines de generación de texto donde la calidad de un modelo grande no es crítica.
- Benchmarking de runtimes: al usar la arquitectura `qwen35moe` nativa de llama.cpp, es un buen candidato para medir el rendimiento de inferencia MoE en diferentes backends y configuraciones.
- Educación y divulgación: su pequeño tamaño y licencia Apache 2.0 lo hacen adecuado para enseñar arquitecturas MoE e inferencia eficiente en cursos y talleres.
- Reducción de coste de cómputo por token: el cómputo de MLP activo se reduce al 50%, lo que puede traducirse en mayor throughput en escenarios de batch, aunque con pérdida de calidad.

## Benchmarks y rendimiento

Resultados publicados por el autor, comparando el modelo denso original con la versión MoE:

Perplejidad:

| Benchmark | Qwen3.5-0.8B (denso) | Qwen3.5-0.8B (MoE) |
|---|---|---|
| Wikitext-2 ppl (menor es mejor) | 19,38 | 21,90 (+13,0%) |
| C4 ppl (menor es mejor) | 24,66 | 28,37 (+15,0%) |

Tareas de sentido común y conocimiento:

| Benchmark | Qwen3.5-0.8B (denso) | Qwen3.5-0.8B (MoE) |
|---|---|---|
| HellaSwag | 0,488 | 0,450 |
| ARC-Easy | 0,629 | 0,545 |
| ARC-Challenge | 0,370 | 0,287 |
| WinoGrande | 0,562 | 0,562 |
| OpenBookQA | 0,306 | 0,294 |
| Media de tareas | 0,471 | 0,428 |

No se han publicado comparaciones con otros modelos de la categoría (Qwen3-0.6B, Llama 3.2-1B, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio completo de GGUF ocupa 2,1 GB; con cuantización Q4_K_M, un modelo de ~755M de parámetros requiere aproximadamente 0,6-0,8 GB de memoria, ejecutable incluso en CPU o en GPUs con 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna; no se necesita hardware especializado. Compatible con CUDA (probado con build b11243 de llama.cpp) y probablemente con ejecución en CPU pura.
- Cabe con holgura en GPUs de consumo: RTX 3060, RTX 4060, RTX 4090 e incluso integradas con memoria compartida.
- Opciones de despliegue: llama.cpp (nativo, sin parches, con `llama-cli` y `llama-server`), Ollama (al ser GGUF, probablemente compatible) y transformers con el modelo base en safetensors. No hay información sobre soporte en vLLM o TGI.
- Latencia y throughput: no disponible. El cómputo activo de MLP se reduce al 50%, lo que sugiere mejoras de velocidad, pero no hay mediciones publicadas.
- Configuración de muestreo sugerida por el autor: temperatura 0,7 y top-p 0,8, con contexto de 4096 tokens en `llama-server`.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-MoE-A0.6B-GGUF | 755,5M | ~623M | Híbrida DeltaNet + atención, MoE 28 expertos top-14 | Apache 2.0 | Conversión MoE por destilación; calidad inferior al denso |
| Qwen/Qwen3.5-0.8B (denso) | 752,4M | 752,4M | Híbrida DeltaNet + atención, MLP SwiGLU densa | Apache 2.0 | Modelo base; mejor ppl y benchmarks en todas las tareas |
| Qwen3-0.6B | ~600M | ~600M | Transformer denso | Apache 2.0 | Modelo denso compacto de generación anterior; no disponible comparación directa de benchmarks |

## Limitaciones y advertencias

- Pérdida de calidad medible: la conversión MoE degrada la perplejidad entre un 13% y un 15% y reduce la media de tareas de evaluación de 0,471 a 0,428 respecto al modelo denso.
- Riesgo de alucinación elevado: el propio autor advierte explícitamente de no confiar en el modelo para datos fácticos.
- Contexto limitado y no verificado: la destilación usó secuencias de 512 tokens y la evaluación 1024; contextos más largos no han sido comprobados, por lo que el uso con ventanas grandes es arriesgado.
- Modo thinking no entrenado: el template activa thinking por defecto, pero no se reentrenó tras la conversión; debe desactivarse manualmente para evitar salidas degradadas.
- Enfoque monolingüe: el entrenamiento y la evaluación se centran en inglés; el rendimiento en castellano u otros idiomas no está verificado.
- Proyecto de un desarrollador independiente: sin el respaldo de una organización, el mantenimiento, la corrección de errores y la validación a escala dependen de la comunidad; tiene muy pocas descargas y likes, lo que implica poca validación por parte de usuarios.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial, aunque conviene revisar los términos de la licencia del modelo base Qwen3.5.
- No apto para producción crítica: dada la degradación de calidad y las advertencias del autor, su uso más razonable es experimental o educativo.

## Enlaces

- Modelo GGUF (esta ficha): https://huggingface.co/bayliner1980/Qwen3.5-0.8B-MoE-A0.6B-GGUF
- Modelo base (safetensors): https://huggingface.co/bayliner1980/Qwen3.5-0.8B-MoE-A0.6B
- Modelo denso original de Qwen: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Datasets de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu, https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k, https://huggingface.co/datasets/Salesforce/wikitext, https://huggingface.co/datasets/allenai/c4
- Soporte del autor: https://ko-fi.com/bayliner1980

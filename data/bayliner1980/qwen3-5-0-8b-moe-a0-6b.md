# bayliner1980/Qwen3.5-0.8B-MoE-A0.6B

## Resumen

Qwen3.5-0.8B-MoE-A0.6B es un modelo de generación de texto creado por el usuario bayliner1980 y publicado en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una conversión experimental del modelo denso Qwen3.5-0.8B de Qwen a una arquitectura Mixture-of-Experts (MoE) mediante una técnica conocida como *moefication*: cada MLP del modelo original se divide en 28 expertos de 128 neuronas, y un router activa 14 de ellos por token, reduciendo a la mitad el cómputo de las MLP. Tras la conversión, el modelo original se destiló sobre el resultado, incluyendo su formato de chat.

El interés de este proyecto es principalmente de investigación: demuestra que es posible convertir un modelo denso pequeño a MoE sin preentrenamiento, obteniendo un ahorro de cómputo (~50 % en las MLP, ~623M de parámetros activos frente a 752M totales) a cambio de una pérdida moderada de calidad (el promedio de benchmarks cae de 0,471 a 0,428). Es relevante para desarrolladores que exploran optimización de inferencia en modelos pequeños y para quienes estudian técnicas de conversión denso-a-MoE.

La arquitectura conserva la del modelo base: 24 capas híbridas (18 Gated DeltaNet y 6 de atención completa, en proporción 3:1), vocabulario de 248.320 tokens con embeddings atados y tamaño oculto de 1024. Se publica bajo licencia Apache 2.0, en formato safetensors, y el repositorio también incluye menciones a GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5MoeForCausalLM (híbrida: 18 capas Gated DeltaNet + 6 de atención completa, 3:1) |
| Parametros totales | 755.465.024 (dato real de safetensors) |
| Parametros activos | ~623M por token (~369M excluyendo embeddings y LM head) |
| Longitud de contexto | No disponible oficialmente; la destilación usó secuencias de 512 tokens y la evaluación 1024; contextos más largos no fueron verificados |
| Tipos de cuantizacion | No disponible (pesos en bfloat16; el repo menciona GGUF pero sin detalles de cuantización) |
| Idiomas soportados | Inglés (etiquetado como "en") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también se etiqueta GGUF en el repositorio) |

## Arquitectura y entrenamiento

El modelo parte del texto de Qwen3.5-0.8B denso (`Qwen3_5ForConditionalGeneration`), una arquitectura híbrida de 24 capas que combina 18 bloques Gated DeltaNet (una variante de redes de estado/attention lineal) con 6 bloques de atención completa en ratio 3:1, tamaño oculto de 1024 y vocabulario de 248.320 tokens con embeddings atados. La conversión a MoE sustituye cada MLP SwiGLU de 3584 neuronas por 28 expertos de 128 neuronas con un router que activa 14 expertos por token (entrenado con top-12 y evaluado en top-14), lo que reduce el cómputo activo de las MLP al 50 %. Se añaden ~0,7M parámetros de routers y un experto compartido nulo de 2,4M parámetros, elevando el total de 752,4M a 755,5M.

El entrenamiento posterior consistió en destilación desde el modelo denso original, usando los datasets HuggingFaceFW/fineweb-edu, HuggingFaceH4/ultrachat_200k, Salesforce/wikitext y allenai/c4. La destilación se realizó con secuencias de 512 tokens y preservó el formato de chat del modelo base. No hay indicios de RLHF ni DPO adicionales. El autor advierte que el modo *thinking* de la plantilla de chat no fue reentrenado tras la conversión y debe mantenerse desactivado.

## Capacidades

- Generación de texto conversacional en inglés, heredando el formato de chat del modelo base Qwen3.5-0.8B mediante destilación.
- Razonamiento general a nivel de modelo pequeño (~0,8B): HellaSwag 0,450, ARC-Easy 0,545, WinoGrande 0,562.
- Compatibilidad con la plantilla de chat de Qwen3.5, con el modo *thinking* disponible en la plantilla pero sin entrenar (se recomienda desactivarlo).
- Eficiencia de inferencia: cómputo MLP activo reducido al 50 % respecto al modelo denso, gracias al enrutado top-14 sobre 28 expertos.
- No disponible: no hay evidencia de capacidades de visión, audio, tool calling, function calling ni soporte de agentes en la información proporcionada.
- Capacidades multilingues limitadas: el modelo está etiquetado solo para inglés y la destilación usó datasets mayoritariamente en inglés.

## Casos de uso

- Experimentación con arquitecturas MoE: ideal como banco de pruebas para investigar técnicas de moeficación, enrutado de expertos y destilación denso-a-MoE en un modelo pequeño y barato de ejecutar.
- Inferencia eficiente en hardware limitado: con ~623M parámetros activos y cómputo MLP a la mitad, permite generar texto conversacional en GPUs de consumo o incluso CPU con overhead reducido respecto al modelo denso equivalente.
- Prototipado de chatbots simples en inglés: al heredar el formato de chat del modelo base, puede integrarse en pipelines conversacionales de baja exigencia donde la calidad factual no sea crítica.
- Generación de texto creativo o de relleno: tareas como redacción de frases, borradores cortos o completado de texto donde la fluidez importa más que la precisión factual (el propio autor advierte de que no debe fiarse de él para datos fácticos).
- Benchmarking de runtimes y kernels: útil para medir el rendimiento de frameworks de inferencia (transformers con kernels fla-core, posibles backends GGUF) sobre arquitecturas híbridas Gated DeltaNet + MoE.
- Investigación en atención lineal y modelos de estado: al conservar las capas Gated DeltaNet del modelo base, sirve como sujeto de estudio para comparar el comportamiento MoE sobre bloques SSM/attention lineal frente a atención completa.
- Educación y demostraciones: su tamaño (1,5 GB el repositorio) lo hace adecuado para tutoriales, talleres y demos de MoE sin necesidad de infraestructura cara.

## Benchmarks y rendimiento

Resultados publicados por el autor, comparando con el modelo denso base:

| Benchmark | Qwen3.5-0.8B (denso) | Qwen3.5-0.8B (MoE) |
|---|---|---|
| Wikitext-2 perplexity (↓) | 19,38 | 21,90 (+13,0 %) |
| C4 perplexity (↓) | 24,66 | 28,37 (+15,0 %) |
| HellaSwag | 0,488 | 0,450 |
| ARC-Easy | 0,629 | 0,545 |
| ARC-Challenge | 0,370 | 0,287 |
| WinoGrande | 0,562 | 0,562 |
| OpenBookQA | 0,306 | 0,294 |
| **Media de tareas** | **0,471** | **0,428** |

No se han publicado comparaciones con otros modelos de la categoría (Llama, Gemma, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 1,5 GB en safetensors (bfloat16), por lo que con overhead de KV cache y activaciones, aproximadamente 2-3 GB de VRAM bastan para inferencia en GPU.
- GPUs recomendadas: cualquier GPU moderna de rango medio o superior es más que suficiente (RTX 3060, RTX 4060, RTX 4090, etc.); no se requieren aceleradores de datacenter tipo A100/H100 para este tamaño.
- Consumer GPUs: cabe con holgura en prácticamente cualquier GPU de consumo con 4 GB o más de VRAM; también es viable su ejecución en CPU dado el tamaño reducido.
- Despliegue: verificado con `transformers` 5.5.0 (se recomienda instalar `fla-core` para kernels rápidos de Gated DeltaNet; sin él, se usa una ruta PyTorch pura más lenta). El repositorio etiqueta GGUF, lo que sugiere compatibilidad potencial con llama.cpp u Ollama, aunque no hay instrucciones publicadas. No hay información sobre soporte en vLLM o TGI.
- Latencia y throughput: no disponible; como referencia teórica, el cómputo MLP activo es un 50 % del modelo denso, por lo que podría esperarse una mejora en velocidad proporcional en las capas MLP, aunque el overhead del router puede compensar parte de esa ganancia en modelos tan pequeños.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-MoE-A0.6B | 755,5M | ~623M | No verificado más allá de 1024 tokens | Apache 2.0 | Conversión MoE experimental; media de benchmarks 0,428 |
| Qwen/Qwen3.5-0.8B (denso, base) | 752,4M | 752,4M | No disponible en la información proporcionada | Apache 2.0 | Modelo base; media de benchmarks 0,471; mayor calidad, mayor cómputo MLP |
| Qwen3-0.6B (denso, referencia de categoria) | ~600M | ~600M | No disponible en la información proporcionada | Apache 2.0 | Modelo denso de tamaño similar de la misma familia; no comparable directamente en benchmarks con datos publicados aquí |

La comparación más relevante es con su propio modelo base: el MoE sacrifica un 9 % en la media de tareas de evaluación (0,471 → 0,428) y empeora la perplexidad un 13-15 % a cambio de reducir el cómputo MLP activo a la mitad. No hay datos comparativos con otros MoE pequeños en la información disponible.

## Limitaciones y advertencias

- Pérdida de calidad medible respecto al modelo denso base: la perplexidad en Wikitext-2 y C4 aumenta un 13-15 % y la media de tareas de evaluación cae de 0,471 a 0,428.
- Riesgo alto de alucinación factual: el propio autor indica explícitamente "no confiar en él para datos fácticos" ("don't rely on it for facts").
- Contexto limitado y no verificado: la destilación usó secuencias de 512 tokens y la evaluación 1024; contextos más largos no fueron comprobados, por lo que el comportamiento más allá de ese rango es desconocido.
- Modo *thinking* roto: la plantilla de chat lo tiene activado por defecto, pero nunca fue reentrenado tras la conversión; debe desactivarse explícitamente (`enable_thinking=False`) para evitar salidas degradadas.
- Idioma: etiquetado y entrenado esencialmente para inglés; el rendimiento en castellano u otros idiomas no está evaluado y probablemente sea limitado.
- Discrepancia menor en el repo: el README referencia el nombre "Qwen3.5-0.8B-MoE-E28-A0.6B" en el ejemplo de código, distinto del ID real del repositorio.
- Discrepancia top-k: el router se entrenó con top-12 pero se evalúa y publica con top-14, un detalle a considerar al experimentar.
- Licencia: Apache 2.0, sin restricciones para uso comercial; no se identifican caveats legales adicionales.
- Proyecto experimental de un autor individual con muy pocas descargas (431) y sin auditoría comunitaria: no recomendado para producción sin validación propia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/bayliner1980/Qwen3.5-0.8B-MoE-A0.6B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Datasets usados en la destilación:
  - https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
  - https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
  - https://huggingface.co/datasets/Salesforce/wikitext
  - https://huggingface.co/datasets/allenai/c4
- Apoyo al autor (Ko-fi): https://ko-fi.com/bayliner1980
- Paper técnico, blog y demos: no disponibles en la información proporcionada.

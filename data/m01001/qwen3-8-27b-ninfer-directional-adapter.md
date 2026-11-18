# m01001/Qwen3.8-27B-NInfer-Directional-Adapter

## Resumen

Qwen3.8-27B NInfer Directional Adapter es un adaptador de ablación direccional a nivel de petición para el modelo denso Qwen3.8-27B, publicado por el usuario m01001 sobre el fork NInfer V100. No se trata de un modelo completo, sino de un vector de dirección residual de 20 KiB (5.120 valores float32) que, aplicado en tiempo de inferencia sobre los pesos NVFP4 del checkpoint base, permite alternar entre el comportamiento original y una versión "abliterated" (con la dirección de rechazo suprimida) sin recargar el modelo.

La relevancia técnica está en el mecanismo: un único servidor carga el checkpoint NVFP4 y el vector, y un flag booleano `ninfer_abliteration` en cada petición de Chat Completions selecciona el paso forward original o el adaptado. Ambos modos comparten los mismos pesos residentes y la misma cabeza de salida, lo que reduce el coste de memoria frente a mantener dos modelos separados.

El adaptador está pensado para hardware Volta (Tesla V100, `sm_70`) y requiere parches específicos del runtime NInfer V100 1.6.2. La dirección se estimó comparando tensores BF16 del checkpoint oficial de Qwen con el checkpoint abliterated "Hotdogs", mediante iteración de potencias sobre las diferencias de pesos en FP32. El resultado es un artefacto de nicho, con 0 descargas en el momento de la consulta, orientado a experimentación con control de comportamiento a nivel de petición.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador de ablación direccional sobre transformer denso (Qwen3.8-27B) |
| Parámetros totales | No disponible (el adaptador es un vector de 5.120 float32; el modelo base es de 27B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens en la configuración de referencia del servidor (`--max-context 8192`) |
| Tipos de cuantización | NVFP4 (checkpoint base); adaptador en float32 sin cuantizar |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Vector `.f32` (5.120 float32 little-endian, sin cabecera, 20.480 bytes); checkpoint base en formato `.ninfer` (NVFP4) |
| Librería | ninfer |
| Modelo base | Qwen/Qwen3.8-27B |
| Hardware objetivo | Volta (`sm_70`), probado en Tesla V100 PCIe 32 GB |
| Runtime requerido | NInfer V100 1.6.2 con parches 01-04 |

## Arquitectura y entrenamiento

El adaptador no entrena pesos: estima una dirección de edición en el espacio residual comparando dos tensores BF16 entre el checkpoint oficial de Qwen y el checkpoint abliterated "Hotdogs". Las dos diferencias de pesos se calculan en FP32 y se estima el vector singular izquierdo dominante de cada una mediante iteración de potencias; tras alinear signos, promediar y normalizar, se obtiene un vector unitario de 5.120 dimensiones. La similitud coseno absoluta entre las dos estimaciones fue de 0,999997020, lo que indica alta consistencia entre ambas fuentes.

En inferencia, la implementación CUDA aproxima la actualización `v ← v − 1,2 × d × dot(d, v)` para una dirección unitaria `d` y una contribución residual `v`. La corrección se aplica a los embeddings de token, la salida de atención completa, la salida de Gated DeltaNet y las contribuciones de down-projection de la FFN. Para escrituras residuales fusionadas, se mide la proyección antes y después de la escritura y se corrige la diferencia en el límite residual BF16. Dado que el forward está cuantizado en NVFP4, el resultado es una aproximación del edit offline en BF16 de Hotdogs, no una réplica exacta. En predicción multi-token (MTP), el target verifica candidatos con el forward adaptado y el proposer original recibe el estado oculto adaptado; con CUDA Graphs activado, la decodificación original usa la ruta capturada y la adaptada se ejecuta en modo eager.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen3.8-27B.
- Conmutación por petición entre forward original y adaptado mediante el booleano `ninfer_abliteration` (omitirlo equivale a `false`).
- Supresión direccional del comportamiento de rechazo (abliteración) en el modo adaptado.
- Decodificación especulativa con MTP (multi-token prediction) en configuración `--spec mtp --draft-tokens 2 --lm-head-draft`.
- Soporte de API compatible con Chat Completions de OpenAI (`/v1/chat/completions`), incluyendo `logprobs` y `top_logprobs`.
- Control de reproducibilidad mediante `temperature`, `seed` y `max_tokens`.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling, function calling, agentes y visión: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en control de comportamiento: comparar respuestas originales y abliterated sobre el mismo prompt con `temperature 0` y `seed` fijo para aislar el efecto del vector de dirección, aprovechando que ambos modos comparten pesos residentes.
- Enrutado A/B en producción: dos entradas de un router de modelos apuntando al mismo proceso, inyectando `ninfer_abliteration: true` solo en la entrada adaptada, sin duplicar el consumo de VRAM del checkpoint de 27B.
- Auditoría de alineación: medir cambios en `logprobs` y `top_logprobs` entre modos para detectar en qué tokens la ablación altera la distribución, más allá de la coincidencia superficial del texto.
- Despliegue en hardware Volta legacy: reutilizar Tesla V100 de 32 GB con el build NInfer V100 compilado para `sm_70`, un escenario donde muchas pilas modernas ya no dan soporte.
- Experimentación con decodificación especulativa: validar la interacción entre MTP y un target adaptado, comprobando la verificación de candidatos con el forward modificado.
- Reproducción de artefactos de investigación: verificar la integridad del vector y los parches con `sha256sum --check SHA256SUMS` antes de aplicar los parches 01-04 sobre el commit fijado de NInfer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo documenta una prueba de humo OFF → ON → OFF que reproduce las puntuaciones de tokens del modo base tras volver a desactivar el adaptador, sin métricas de calidad, MMLU, HumanEval ni similares.

## Requisitos de hardware

- GPU probada: una Tesla V100 PCIe de 32 GB (arquitectura Volta, `sm_70`).
- VRAM estimada: no disponible de forma explícita; el checkpoint base es de 27B en NVFP4 y el vector añade 20.480 bytes.
- Compilación obligatoria para Volta: `-DCMAKE_CUDA_ARCHITECTURES=70`.
- Runtime: NInfer V100 1.6.2 sobre el commit `ab6f496e0a7add125af621b8230bf0c709450a34`, con los parches `01-rank-one-probe.patch` a `04-directional-mtp2.patch` aplicados en orden.
- Configuración de referencia del servidor: `--max-context 8192 --kv-capacity 8192 --kv-dtype int8 --max-concurrency 1 --no-thinking --no-prefix-reuse --no-cuda-graph`, MTP con `--draft-tokens 2 --lm-head-draft`.
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no disponible; el adaptador y los parches están atados a la ruta CUDA Volta del fork NInfer.
- Opciones de despliegue: exclusivamente `ninfer-serve` del fork NInfer V100; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B NInfer Directional Adapter (este) | Adaptador de ablación sobre Qwen3.8-27B | Vector de 5.120 float32; base de 27B | 8.192 (config. de referencia) | Apache 2.0 | Hugging Face, 0 descargas |
| neroued/Qwen3.8-27B-nvfp4-NInfer | Checkpoint completo NVFP4 para NInfer | 27B | No disponible | No disponible | Hugging Face (referenciado en la model card) |
| Checkpoint abliterated "Hotdogs" de Qwen3.8-27B | Modelo abliterated offline en BF16 | 27B | No disponible | No disponible | No disponible en la información |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El adaptador es un vector dependiente del basis residual de este modelo concreto; no es portable a otros checkpoints ni a otras cuantizaciones.
- Requiere los parches del runtime NInfer V100 y un commit fijado; cualquier actualización del fork puede romper la aplicación de los parches.
- La corrección en el forward cuantizado NVFP4 es una aproximación del edit offline en BF16 de Hotdogs, por lo que el comportamiento no será idéntico al del checkpoint abliterated original.
- La abliteración suprime la dirección de rechazo, lo que puede aumentar la probabilidad de generar contenido dañino o no filtrado; debe evaluarse antes de cualquier uso en producción.
- Riesgo de alucinación heredado del modelo base; no se documentan evaluaciones específicas.
- Idiomas soportados no documentados.
- Configuración probada muy restrictiva: `--max-concurrency 1`, sin reutilización de prefijo y sin CUDA Graphs en el modo adaptado, lo que limita el throughput.
- Solo se ha validado en Tesla V100; no hay evidencia de funcionamiento en otras arquitecturas.
- La licencia Apache 2.0 cubre el artefacto publicado, pero el uso comercial debe verificar además las condiciones del checkpoint base Qwen3.8-27B y del checkpoint abliterated de origen.
- El modelo declara `inference: false` en los metadatos; el adaptador no es utilizable sin el runtime y el checkpoint externos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/m01001/Qwen3.8-27B-NInfer-Directional-Adapter
- Checkpoint base NVFP4: https://huggingface.co/neroued/Qwen3.8-27B-nvfp4-NInfer
- Repositorio NInfer V100: https://github.com/JimmyMax/ninfer-v100
- Instrucciones de compilación NInfer V100: https://github.com/JimmyMax/ninfer-v100#building
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.8-27B

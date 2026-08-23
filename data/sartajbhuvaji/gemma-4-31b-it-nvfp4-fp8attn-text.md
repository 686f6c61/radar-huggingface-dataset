# sartajbhuvaji/Gemma-4-31B-IT-NVFP4-FP8attn-text

## Resumen

Este modelo es una versión cuantizada y recortada de **Gemma-4-31B-IT**, la variante instructiva multimodal de Google DeepMind, adaptada por Sartaj Bhuvaji. La modificación principal consiste en eliminar la torre de visión (SigLIP), re-cuantizar todas las proyecciones de atención a FP8 (escala por tensor) y mantener los MLPs en el formato NVFP4 de NVIDIA, tal como los distribuye NVIDIA en su checkpoint `nvidia/Gemma-4-31B-IT-NVFP4`. El resultado es un modelo puramente textual de 23 GB, un 29,5% más ligero que el checkpoint original de NVIDIA (32,63 GB).

La relevancia de esta ficha radica en que ofrece una alternativa de menor huella de memoria para despliegues en hardware Blackwell (sm_100+), donde NVFP4 puede ejecutarse de forma nativa. A diferencia de la versión de NVIDIA, que deja la atención en BF16, aquí se aplica FP8 a las 230 proyecciones de atención, lo que reduce aún más el uso de VRAM. Sin embargo, esto introduce una ligera degradación en la distribución de probabilidad, medida mediante divergencia KL, aunque el autor afirma que la calidad de generación sigue siendo muy cercana a la del modelo BF16 original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (60 capas) |
| Parámetros totales | 31B (modelo original); 20.292.849.980 en el checkpoint cuantizado |
| Parámetros activos | No aplicable (modelo denso) |
| Longitud de contexto | 256K tokens (según el modelo base google/gemma-4-31B-it) |
| Tipos de cuantización | NVFP4 (MLPs) y FP8 (atención) |
| Idiomas soportados | Inglés (declarado); el modelo base soporta más de 140 idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (cuantizados NVFP4 y FP8) |

## Arquitectura y entrenamiento

El modelo se construye a partir de `google/gemma-4-31B-it`, un transformer denso de 60 capas con atención multi-cabeza y MLPs. La cuantización se realiza en dos etapas: primero se copian los pesos NVFP4 de NVIDIA para las capas MLP (20,8B de parámetros, con escala en dos niveles), y después se re-cuantifican las 230 proyecciones de atención (7,93B de parámetros) a FP8 con escala por tensor, usando `float8_e4m3`. Las normas RMS (`q_norm` y `k_norm`) se dejan intactas por su sensibilidad a la precisión. La torre de visión (SigLIP, ~576M parámetros) se elimina por completo.

No se proporcionan datos sobre el entrenamiento del modelo base (número de tokens, composición del dataset, o si se usó RLHF/DPO). La cuantización fue realizada con la herramienta `unfuse` del autor, que permite extraer y re-cuantizar componentes del checkpoint. El proceso de cuantización es solo de pesos (weights-only), no se cuantizan activaciones, lo que simplifica la calibración y evita errores por outliers en atención.

## Capacidades

- Generación de texto en inglés, con razonamiento, codificación y matemáticas, heredadas del modelo base Gemma 4.
- Soporte de conversación multi-turno mediante el chat template.
- Capacidad de tool calling y función calling, aunque no se ha verificado explícitamente en esta versión cuantizada.
- Soporte para agentes y razonamiento multi-paso, según las características del modelo base.
- Contexto largo de hasta 256K tokens, útil para documentos extensos o historias de conversación largas.
- Modelo exclusivamente de texto (sin visión), a diferencia del modelo base multimodal.

## Casos de uso

- **Asistente de programación en local**: el modelo puede generar código, explicar algoritmos y depurar errores, y su tamaño reducido permite ejecutarlo en una GPU de consumo (como una RTX 5090) con cuantización NVFP4.
- **Procesamiento de documentos largos**: con 256K tokens de contexto, puede resumir o extraer información de informes, contratos o tesis completas sin truncar.
- **Chat de soporte técnico**: puede mantener conversaciones multi-turno con historial extenso, adecuado para sistemas de atención al cliente en inglés.
- **Generación de contenido multilingüe**: aunque el checkpoint declara solo inglés, el modelo base soporta más de 140 idiomas, por lo que podría usarse para traducción o creación de contenido en varios idiomas si se carga el modelo base o se expande la cuantización.
- **Análisis de sentimiento y clasificación de texto**: puede realizar tareas de clasificación con instrucciones precisas, aprovechando su capacidad de razonamiento.
- **Despliegue en edge con vLLM**: al ser un checkpoint cuantizado de 23 GB, cabe en GPUs de 24 GB y puede servirse con vLLM para inferencia de alto rendimiento en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este modelo específico. La model card reporta métricas de calidad de la cuantización comparando con el modelo BF16 original:

| Métrica | NVIDIA NVFP4 | Este modelo |
|---|---|---|
| Peor top-1 (frente a BF16) | 0,7826 | 0,9130 |
| Peor KL (frente a BF16) | 1,448e-01 | 1,716e-01 |

El autor señala que el incremento de KL (1,19× respecto a NVIDIA) es esperable al añadir una cuantización adicional, y que la calidad de generación es casi idéntica en pruebas con 408 prompts, incluyendo una traducción al alemán idéntica token a token. No obstante, la muestra es pequeña y la top-1 no está limpia entre las dos versiones.

## Requisitos de hardware

- **GPU Blackwell obligatoria** (sm_100+): el formato NVFP4 solo se ejecuta nativamente en esta arquitectura (por ejemplo, B200, RTX 5090). En hardware anterior, los MLPs no pueden ejecutarse y se requeriría dequantizar a BF16.
- **VRAM estimada**: el checkpoint ocupa 23 GB, por lo que se necesita una GPU con al menos 24 GB de VRAM para la inferencia. El KV cache a 256K tokens añade ~11 GB adicionales.
- **GPU recomendadas**: NVIDIA Blackwell (B200, RTX 5090) para ejecución nativa. Alternativamente, una GPU con 32 GB+ si se dequantiza a BF16.
- **Opciones de despliegue**: vLLM es la opción recomendada, ya que `transformers` no puede cargar este checkpoint (el campo `quant_method: modelopt` no está soportado y falla). También se puede usar `tools/dequantize.py` del repo `unfuse` para expandir a BF16 y usar otras herramientas.
- **Latencia**: no se proporcionan datos de throughput, pero al ser una cuantización de pesos, la latencia de decodificación batch-1 está limitada por el ancho de banda de memoria, por lo que la reducción de tamaño mejora la velocidad en ese escenario.

## Comparativa con modelos similares

| Modelo | Tamaño | Cuantización | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `google/gemma-4-31B-it` | 31B | BF16 | 256K | Apache-2.0 | HuggingFace |
| `nvidia/Gemma-4-31B-IT-NVFP4` | 31B (NVFP4 MLPs, BF16 attention) | 32,63 GB | 256K | Apache-2.0 | HuggingFace |
| Este modelo | 31B (NVFP4 MLPs, FP8 attention) | 23 GB | 256K | Apache-2.0 | HuggingFace |

La ventaja de este modelo es la reducción de memoria adicional (~30% menos que NVIDIA) a costa de una ligera pérdida de precisión en la distribución de tokens. La comparación con otros modelos de la misma categoría (como Gemma 3 27B o Llama 3.3 70B) no se ha incluido por falta de datos en la información proporcionada.

## Limitaciones y advertencias

- **Exclusivamente texto**: la torre de visión ha sido eliminada; no acepta imágenes ni video.
- **NVFP4 solo en Blackwell**: en GPUs anteriores, el modelo no puede ejecutarse sin dequantizar a BF16, lo que anula la ventaja de memoria.
- **Incompatibilidad con `transformers`**: la librería no reconoce el formato `modelopt` y falla al cargar el checkpoint. Se debe usar vLLM o expandir a BF16.
- **Pérdida de precisión**: la cuantización FP8 en atención introduce una ligera degradación (KL 1,716e-01 vs 1,448e-01 de NVIDIA), que puede afectar a tareas que requieren alta exactitud.
- **Idioma**: aunque el modelo base es multilingüe, este checkpoint declara solo inglés; el rendimiento en otros idiomas no está garantizado.
- **KV cache grande**: con contexto completo de 256K, la memoria del cache puede alcanzar ~11 GB, lo que reduce el espacio disponible para el batch.

## Enlaces

- [HuggingFace - sartajbhuvaji/Gemma-4-31B-IT-NVFP4-FP8attn-text](https://huggingface.co/sartajbhuvaji/Gemma-4-31B-IT-NVFP4-FP8attn-text)
- [HuggingFace - google/gemma-4-31B](https://huggingface.co/google/gemma-4-31B)
- [HuggingFace - nvidia/Gemma-4-31B-IT-NVFP4](https://huggingface.co/nvidia/Gemma-4-31B-IT-NVFP4)
- [Repositorio unfuse (herramienta de cuantización)](https://github.com/SartajBhuvaji/unfuse)
- [Model card de Gemma 4 (Google AI for Developers)](https://ai.google.dev/gemma/docs/core/model_card_4)
- [NVIDIA NIM - Gemma 4 31B IT](https://build.nvidia.com/google/gemma-4-31b-it/modelcard)

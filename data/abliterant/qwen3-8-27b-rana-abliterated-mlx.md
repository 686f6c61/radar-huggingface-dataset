# abliterant/Qwen3.8-27B-RANA-abliterated-MLX

## Resumen

Qwen3.8-27B-RANA-abliterated-MLX es una conversión al formato MLX del modelo abliterado `abliterant/Qwen3.8-27B-RANA-abliterated`, que a su vez deriva del checkpoint multimodal `Qwen/Qwen3.8-27B` de Alibaba. El autor, abliterant, aplica una técnica de "ablación de dirección de rechazo" (refusal-direction abliteration) sobre los pesos originales de Qwen para eliminar el comportamiento de negativa ante determinadas peticiones, y publica el resultado en varias precisiones para su uso con la librería MLX de Apple.

El modelo es un vision-language de 27.356.728.560 parámetros (27,36 mil millones) con torre de visión incluida en todas las compilaciones, pensado para inferencia en Apple Silicon mediante `mlx-vlm`. El repositorio ocupa 143,3 GB e incluye builds en 4, 5, 6 y 8 bits, además de BF16 y un drafter MTP en BF16 para decodificación especulativa. La licencia es Apache-2.0, heredada de Qwen.

Su relevancia es doble: por un lado ofrece una vía práctica de ejecutar un modelo multimodal de ~27B en hardware Apple con cuantizaciones afinadas y decodificación especulativa; por otro, es un modelo de investigación con la alineación de seguridad eliminada, lo que exige leer con atención las advertencias de uso previstas antes de desplegarlo. No se han publicado datos de benchmarks de capacidades en la información disponible, solo métricas de deriva de cuantización (KLD y perplejidad).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) basado en Qwen3.8-27B; familia `qwen3_5` según tags; sin detalles de capas publicados |
| Parámetros totales | 27.356.728.560 |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible explícitamente; los ejemplos de la model card usan `--max-tokens 32768` y no se reporta validación de longitud de contexto en MLX |
| Tipos de cuantización | 4-bit, 5-bit, 6-bit, 8-bit y BF16; cuantización afín round-to-nearest con group size 64; torre de visión siempre en BF16 |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 (heredada de Qwen) |
| Formato de pesos | Safetensors en formato MLX (carpetas `4-bit/`, `5-bit/`, `6-bit/`, `8-bit/`, `bf16/`, `mtp/`); no incluye GGUF |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un modelo de la familia Qwen3.8 con capacidad de visión (pipeline `image-text-to-text`, torre de visión en BF16 en todas las builds). El repositorio es una conversión y cuantización de los pesos BF16 ya abliterados, no un entrenamiento adicional: la conversión se realizó con `mlx_vlm.convert` (mlx-vlm 0.7.3, MLX 0.32.2) y la cuantización emplea redondeo afín con group size 64. El layout de tensores, formas, dtypes y `config.json` es idéntico al de las builds de mlx-community y lmstudio-community para `Qwen/Qwen3.8-27B`, de modo que carga en los mismos entornos.

El elemento diferenciador es la abliteración RANA aplicada por abliterant: se identifica una dirección de rechazo en el espacio de activaciones y se resta de los pesos para suprimir la conducta de negativa. El método completo, la evaluación y las puertas de release están documentados en la model card BF16, no en esta. Adicionalmente, el repositorio separa la cabeza MTP (multi-token prediction) en la carpeta `mtp/` en BF16, lo que habilita decodificación especulativa para acelerar la generación. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional multi-turno con modo de razonamiento ("thinking") activado por defecto.
- Razonamiento extendido: la model card advierte que peticiones técnicas largas pueden requerir entre 20.000 y 50.000 tokens de razonamiento.
- Comprensión de imágenes: entrada `image-text-to-text` con torre de visión incluida en todas las builds; se activa con `--image path/to/image.png`.
- Soporte de tool calling / function calling en el servidor compatible con OpenAI (`mlx_vlm server`), que devuelve el razonamiento separado de la respuesta.
- Decodificación especulativa mediante drafter MTP en BF16 (`--draft-model .../mtp --draft-kind mtp`).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Comportamiento sin alineación de seguridad: el modelo ha sido sometido a ablación de la dirección de rechazo, por lo que no rehúsa peticiones que el modelo base rechazaría.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar empíricamente qué comportamientos cambian al eliminar la dirección de rechazo, comparando sus salidas con las del Qwen3.8-27B original en el mismo hardware.
- Inferencia local en Apple Silicon: con las builds de 4 a 8 bits y `mlx-vlm`, se puede desplegar un modelo multimodal de ~27B en un Mac con memoria unificada suficiente, sin depender de GPUs de datacenter.
- Asistente multimodal de escritorio: análisis de capturas de pantalla, diagramas o documentos escaneados combinado con razonamiento multi-turno, aprovechando la torre de visión y el modo thinking.
- Servicio compatible con OpenAI para prototipado: `mlx_vlm server` expone una API con soporte de tool calls y razonamiento separado, útil para integrar el modelo en aplicaciones existentes que ya consumen la API de OpenAI.
- Aceleración de generación con decodificación especulativa: en escenarios de razonamiento largo (20.000-50.000 tokens), el drafter MTP en BF16 reduce el coste por token generado al proponer tokens candidatos verificados por el modelo principal.
- Evaluación de deriva de cuantización: el repositorio publica KLD y perplejidad por build frente a BF16, lo que permite elegir la precisión adecuada según el compromiso memoria/calidad en un pipeline de investigación.
- Generación de código y explicaciones técnicas: los ejemplos de la model card usan prompts de explicación de estructuras de datos, un uso razonable para un modelo de esta familia con modo thinking.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidades (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo reporta métricas de deriva de cuantización frente a la build BF16, medidas sobre `wiki.test.raw` con 100 fragmentos de 512 tokens y 25.500 tokens puntuados:

| Build | KLD vs. BF16 (menor es mejor) | Mismo token top-1 | Perplejidad (menor es mejor) |
|---|---|---|---|
| Root / `4-bit/` | 0,0468 | 90,0 % | 6 (valor truncado en la información disponible) |
| `5-bit/` | No disponible | No disponible | No disponible |
| `6-bit/` | No disponible | No disponible | No disponible |
| `8-bit/` | No disponible | No disponible | No disponible |
| `bf16/` | Referencia | Referencia | No disponible |

Las comprobaciones de release se ejecutaron con mlx-vlm 0.7.3 y MLX 0.32.2 sobre el backend CUDA de MLX en Linux; el rendimiento en Apple Silicon no fue medido por el autor.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~14 GB para 4 bits, ~17 GB para 5 bits, ~20 GB para 6 bits, ~27 GB para 8 bits y ~55 GB para BF16, calculados a partir de los 27,36 mil millones de parámetros; hay que sumar la torre de visión en BF16 y el overhead de MLX.
- El repositorio completo ocupa 143,3 GB; conviene descargar solo la carpeta de precisión necesaria con `--include`, ya que pasar el ID del repositorio a `--model` descarga todas las carpetas (~160 GB).
- Hardware objetivo: Apple Silicon con memoria unificada; el autor no midió rendimiento en Apple Silicon y validó en Linux con el backend CUDA de MLX.
- GPU de datacenter (A100, H100) y consumer (RTX 4090): no se reportan requisitos ni resultados para estas plataformas en la información disponible.
- Despliegue: `mlx-vlm` (>= 0.7.3) y `mlx` (>= 0.32.2); servidor compatible con OpenAI mediante `python -m mlx_vlm server`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la decodificación especulativa con el drafter MTP es la única optimización documentada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B-RANA-abliterated-MLX | 27,36 B | No disponible | Imagen-texto | Apache-2.0 | MLX safetensors (4/5/6/8-bit, BF16) |
| abliterant/Qwen3.8-27B-RANA-abliterated (BF16) | 27,36 B | No disponible | Imagen-texto | Apache-2.0 | Safetensors BF16 |
| Qwen/Qwen3.8-27B (base original) | 27,36 B | No disponible | Imagen-texto | Apache-2.0 | Safetensors |
| Builds mlx-community / lmstudio-community de Qwen3.8-27B | 27,36 B | No disponible | Imagen-texto | Apache-2.0 | MLX safetensors (mismo layout) |

La comparativa se limita a las variantes del mismo checkpoint porque la información proporcionada no incluye datos de rendimiento que permitan contrastarlo con modelos de otros fabricantes.

## Limitaciones y advertencias

- Modelo con la alineación de seguridad eliminada: la ablación de la dirección de rechazo suprime las negativas del modelo base; no es apto para despliegues orientados al público sin filtros externos.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad ni de tasas de alucinación en la información disponible.
- Sesgos: no se documentan sesgos conocidos ni evaluaciones específicas; al derivar del Qwen3.8-27B, hereda los sesgos de su dataset de entrenamiento, que no se detalla.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingüe.
- Longitud de contexto: no validada en MLX según la model card; los ejemplos usan `--max-tokens 32768`, pero no se confirma la ventana efectiva del modelo.
- Licencia Apache-2.0 permite uso comercial, pero la ausencia de alineación de seguridad puede incumplir políticas de plataformas o requisitos regulatorios según el contexto de despliegue.
- El rendimiento en Apple Silicon no fue medido por el autor; las comprobaciones se hicieron con el backend CUDA de MLX en Linux, por lo que el comportamiento en Mac puede diferir.
- La conversión MLX no especifica la revisión exacta del checkpoint BF16 de origen.
- El repositorio es grande (143,3 GB); una descarga incorrecta del ID completo consume ~160 GB.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abliterant/Qwen3.8-27B-RANA-abliterated-MLX
- Modelo base BF16 abliterado: https://huggingface.co/abliterant/Qwen3.8-27B-RANA-abliterated
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Versión GGUF: https://huggingface.co/abliterant/Qwen3.8-27B-RANA-abliterated-GGUF
- Notas de investigación sobre la ablación RANA: https://blog.abliterant.ai/rana-refusal-ablation
- Chat de demostración: https://chat.abliterant.ai/
- Sitio del autor: https://abliterant.ai/
- Catálogo de formatos: https://abliterant.ai/models
- Resultados de evaluación: carpeta `results/` del repositorio

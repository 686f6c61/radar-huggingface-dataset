# pinvou/Qwen3.8-27B-NVFP4-Tachyon

## Resumen

Qwen3.8-27B-NVFP4-Tachyon es una distribución cuantizada y empaquetada del modelo multimodal Qwen3.8-27B de Alibaba Qwen, publicada por el usuario pinvou. No se trata de un modelo entrenado desde cero, sino de un artefacto de inferencia en formato propietario `.tachyon` que combina el checkpoint oficial en BF16 con los pesos de texto ya empaquetados en NVFP4 de unsloth/Qwen3.8-27B-NVFP4. El objetivo es ofrecer una representación mixta NVFP4/FP8 optimizada para el motor Tachyon sobre hardware Blackwell, en particular la RTX 5090 y sistemas GB10 con memoria unificada.

El artefacto emplea la arquitectura densa Qwen3.5 (`Qwen3_5ForCausalLM`) con 64 capas de texto. Las capas MLP y la cabeza de salida usan pesos NVFP4, mientras que las proyecciones de atención, las proyecciones GDN (Q/K/V/Z y salida) y el embedding de tokens emplean FP8 con escalado por fila. Los pesos de control se mantienen en BF16, y se incluyen por separado los módulos MTP, Vision y DFlash2, que solo se cargan si se seleccionan en el arranque.

Su relevancia es doble: por un lado, demuestra una ruta práctica para servir un modelo multimodal de 27B en una GPU de consumo con cuantización de 4 bits nativa de Blackwell; por otro, introduce controles de razonamiento por petición (`enable_thinking`, `reasoning_effort`, `preserve_thinking`) compatibles con vLLM y SGLang. El repositorio tiene 45,4 GB, aunque el artefacto principal ocupa 20,71 GiB (22 240 278 272 bytes).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso Qwen3.5 (`Qwen3_5ForCausalLM`), 64 capas de texto, con torre de visión, MTP y DFlash2 |
| Parametros totales | 27B (según el nombre del modelo base; no se detalla el desglose) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el endpoint `/get_server_info` expone `max_model_len`, pero no se indica su valor) |
| Tipos de cuantizacion | Mixta: NVFP4 (MLP y cabeza de salida), FP8 con escalado por fila (atención, GDN, embedding), BF16 (pesos de control) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.tachyon` (formato nativo del motor Tachyon, contenedor versión 3); no es Safetensors, GGUF ni checkpoint de Transformers |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de la familia Qwen3.5, con 64 capas de texto y una torre de visión para entrada image-text-to-text. Esta distribución no aporta información sobre el entrenamiento original (número de tokens, composición del dataset, fases de RLHF o DPO); el autor solo documenta el proceso de cuantización y empaquetado. La innovación técnica del artefacto reside en la representación mixta: 129 tensores NVFP4 por fila (las 64 MLP de texto y la cabeza de salida) y 129 tensores FP8 con escalado por fila (128 proyecciones y el embedding de tokens generado). Los pesos NVFP4 y FP8 derivados del código fuente se preservan sin decodificación ni recuantización; solo el embedding oficial en BF16 se codifica localmente como FP8 por fila.

El artefacto incluye además pesos de decodificación especulativa (MTP, DFlash2 y una cabeza de propuesta optimizada), que se cargan únicamente si se seleccionan al arrancar. La release 88251e38 (octubre de 2026) añade endpoints de descubrimiento y monitorización (`GET /get_server_info` sin autenticación y `GET /metrics` en formato Prometheus), habilita la visión en la configuración de lanzamiento (`--vision`) y corrige el arranque en máquinas con mucha página caché en sistemas GB10 de memoria unificada, acreditando la caché reclamable (`MemAvailable` más allá de `MemFree`) en la capacidad de runtime.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento configurable por petición: `enable_thinking` (true/false), `reasoning_effort` (`none`, `low`, `medium`, `xhigh`) y `preserve_thinking` para conservar el razonamiento de turnos cerrados.
- Razonamiento matemático y científico de alto nivel, según los resultados declarados en AIME 2025/2026 y GPQA-Diamond.
- Comprensión de imágenes y vídeo mediante la torre de visión incluida en el artefacto (pipeline image-text-to-text), activable con `--vision`.
- Seguimiento de instrucciones complejas, medido con IFBench en modo prompt-level strict.
- Conversación multiturno con plantilla de chat propia (`qwen3_8.jinja`, sustituible con `--chat-template`).
- Separación limpia del razonamiento: se emite como `delta.reasoning_content` en streaming y `message.reasoning_content` en no streaming, nunca mezclado en `content`; el consumo se factura en `usage.completion_tokens_details.reasoning_tokens` y comparte el presupuesto de `max_tokens`.
- Decodificación especulativa opcional mediante MTP y DFlash2.
- Compatibilidad de los controles de razonamiento con vLLM y SGLang.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.

## Casos de uso

- Razonamiento matemático asistido: el modelo declara un 96,67 % en AIME 2025 y 2026 en modo 0-shot con evaluación por reglas, lo que lo hace adecuado para tutores de matemáticas, verificación de demostraciones o generación de problemas con solución comprobable.
- Preguntas de dominio científico: con un 90,4 % en GPQA-Diamond, puede emplearse como asistente de investigación para preguntas de nivel posgrado en física, química y biología, siempre con revisión humana.
- Análisis de imágenes en el borde: al caber en una RTX 5090 en formato NVFP4 y habilitarse la visión con `--vision`, permite desplegar un asistente visual local para inspección de documentos, capturas o imágenes de producto sin enviar datos a la nube.
- Agentes con control de esfuerzo: los campos `reasoning_effort` y `preserve_thinking` permiten ajustar el coste por petición, usando `none` o `low` para tareas rutinarias y `xhigh` para pasos de planificación complejos en pipelines de agentes.
- Cumplimiento estricto de instrucciones: con un 77 % en IFBench prompt-level strict, es apto para generar respuestas sujetas a formatos rígidos (JSON, plantillas de contrato, extracción estructurada) donde el incumplimiento de formato rompe el pipeline.
- Servicio local con monitorización: los endpoints `/get_server_info` y `/metrics` permiten integrar el modelo en sistemas de observabilidad (Prometheus) y sondas de cliente sin autenticación, útil en despliegues on-premise con SLA internos.
- Evaluación de cuantización: investigadores que comparan NVFP4 frente a BF16 pueden usar este artefacto como referencia reproducible, verificando la integridad con el SHA-256 publicado.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (`verified: false` en todos los casos):

| Benchmark | Tarea | Métrica | Resultado |
|---|---|---|---|
| IFBench | Text generation | Prompt-level strict (0-shot, rule) | 77,00 |
| AIME 2025 | Text generation | Accuracy (0-shot, rule) | 96,67 |
| AIME 2026 | Text generation | Accuracy (0-shot, rule) | 96,67 |
| GPQA-Diamond | Text generation | Accuracy (0-shot, rule) | 90,40 |
| ERQA | Image-text-to-text | Accuracy (0-shot, rule) | 66,25 |
| RealWorldQA | Image-text-to-text | Accuracy (0-shot, rule) | 83,53 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones directas con otros modelos.

## Requisitos de hardware

- VRAM estimada: el artefacto principal ocupa 20,71 GiB, por lo que la inferencia requiere al menos unos 21-24 GB de memoria disponible, más overhead de KV cache y activaciones según la longitud de contexto.
- GPU recomendadas: RTX 5090 (etiqueta explícita del repositorio) y sistemas GB10 con memoria unificada; cualquier GPU Blackwell con soporte NVFP4.
- GPU de consumo: sí, cabe en una RTX 5090. No se garantiza en GPUs Ampere o Ada sin soporte nativo de NVFP4.
- Despliegue: exclusivamente mediante el motor Tachyon (`tachyon-serve-gb10-88251e38.tar.gz` o superior). No es compatible con Transformers, llama.cpp, Ollama, vLLM ni TGI como checkpoint directo; los controles de razonamiento sí siguen la interfaz de vLLM/SGLang.
- Latencia y throughput: no disponibles en la información proporcionada.
- Nota operativa: en sistemas GB10, la release 88251e38 elimina la necesidad de `drop_caches` o reinicio previo; en otras plataformas no se documenta el comportamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-NVFP4-Tachyon | 27B densos | No disponible | NVFP4/FP8 mixta | Apache 2.0 | Solo motor Tachyon |
| Qwen/Qwen3.8-27B (base) | 27B densos | No disponible | BF16 | Apache 2.0 | Hugging Face, Transformers |
| unsloth/Qwen3.8-27B-NVFP4 | 27B densos | No disponible | NVFP4 empaquetado | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Los benchmarks están marcados como no verificados (`verified: false`) y proceden del propio autor; deben tratarse como indicativos hasta su replicación independiente.
- El artefacto solo funciona con el motor Tachyon; no es un checkpoint de Transformers, Safetensors ni GGUF, lo que limita la portabilidad y obliga a usar el runtime del autor.
- La cuantización NVFP4/FP8 puede degradar la precisión respecto al BF16 original; no se publican comparativas directas BF16 frente a NVFP4 en la model card.
- El campo `reasoning_effort` solo acepta `none`, `low`, `medium` y `xhigh`; valores como `high`, `minimal` o `max` devuelven error 400, lo que puede romper clientes que asuman la interfaz estándar.
- El razonamiento comparte el presupuesto de `max_tokens`, por lo que respuestas con pensamiento extenso pueden truncar la salida final si no se ajusta el límite.
- No se documentan sesgos conocidos, idiomas soportados ni riesgos específicos de alucinación; al ser una distribución de Qwen3.8-27B, hereda las características del modelo base, no detalladas aquí.
- La licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre los pesos derivados y el formato propietario recae en el publicador.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica una validación comunitaria muy limitada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pinvou/Qwen3.8-27B-NVFP4-Tachyon
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Pesos NVFP4 de referencia: https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4

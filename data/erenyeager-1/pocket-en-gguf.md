# erenyeager-1/POCKET-EN-GGUF

## Resumen

POCKET-EN-GGUF es una compilación cuantizada en formato GGUF del modelo Darwin-36B-Opus, publicada por el usuario erenyeager-1 bajo la familia POCKET de FINAL-Bench. Está diseñada específicamente para ejecución en dispositivo (on-device), con especial énfasis en iPhone mediante la aplicación PocketPal y en equipos de sobremesa sin GPU. El modelo base es un MoE de Qwen3.5-35B-A3B según los tags del repositorio, aunque el dato real de parámetros en safetensors indica 22.573.150.848 parámetros totales, lo que sugiere una arquitectura con parámetros activos reducidos.

La propuesta de valor es la cuantización propietaria del autor, que según la model card protege las capas críticas para la calidad y permite mantener un rendimiento aceptable en un tamaño de aproximadamente 5 GB. El repositorio ofrece dos variantes: `iPhone-mix` (5,3 GB) para PocketPal en iOS y `PC-mix` (6,8 GB) para PC y Android. La licencia es Apache 2.0 y el runtime es llama.cpp estándar, sin forks ni modificaciones.

Este modelo es relevante porque aborda el problema de desplegar modelos de decodificación con mezcla de expertos en hardware de gama baja y móvil, un nicho donde las opciones de alta calidad siguen siendo escasas. La ausencia de descargas y likes en el momento de la consulta indica que se trata de una publicación reciente con escasa validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), base Qwen3.5-35B-A3B según tags |
| Parametros totales | 22.573.150.848 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantizacion propietaria del autor; variantes `iPhone-mix` (5,3 GB) y `PC-mix` (6,8 GB) |
| Idiomas soportados | Inglés (build específico EN); resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura es de mezcla de expertos (MoE), según los tags `mixture-of-experts`, `moe` y `qwen3_5_moe`. El modelo base declarado es FINAL-Bench/Darwin-36B-Opus, aunque los tags también referencian Qwen3.5-35B-A3B como base. El dato de safetensors (22.573 millones de parámetros) no coincide con la denominación "36B" ni con "35B" del nombre del modelo base, lo que puede deberse a que el recuento real excluye ciertos componentes o a una discrepancia de nomenclatura en la model card.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card menciona una "cuantización propietaria" que protege las capas críticas para la calidad, pero no detalla el algoritmo ni los criterios de selección de capas. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés, orientada a uso en dispositivo.
- Razonamiento y respuestas multi-turno, según el tag `conversational`.
- Ejecución en CPU sin GPU, con runtime llama.cpp estándar.
- Compatibilidad con PocketPal en iPhone y con aplicaciones de escritorio que soporten GGUF.
- Soporte de cuantización agresiva manteniendo capas críticas en mayor precisión.
- Capacidades multilingües limitadas al inglés en esta build; el resto de idiomas no está documentado.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking.

## Casos de uso

- Asistente conversacional en iPhone: el archivo `iPhone-mix` de 5,3 GB se carga en PocketPal y permite mantener conversaciones multi-turno sin conexión, aprovechando la cuantización propietaria para preservar calidad en un dispositivo con RAM limitada.
- Chat local en PC sin GPU: la variante `PC-mix` de 6,8 GB se ejecuta en llama.cpp sobre CPU, adecuada para entornos de escritorio donde no hay acelerador gráfico disponible.
- Procesamiento de texto en Android de gama media: el tamaño de 5-7 GB encaja en dispositivos con 8 GB o más de RAM, permitiendo resúmenes y generación de texto offline.
- Prototipado de aplicaciones edge: desarrolladores que necesitan validar flujos conversacionales en hardware móvil antes de invertir en infraestructura cloud pueden usar este GGUF como banco de pruebas.
- Despliegue en entornos aislados: al ser un modelo local con licencia Apache 2.0, se puede integrar en sistemas sin conectividad externa para tareas de generación de texto en inglés.
- Educación e investigación sobre cuantización: el repositorio documenta una técnica propietaria de cuantización selectiva por capas, útil para estudiar el impacto de la precisión mixta en modelos MoE.
- Sustituto ligero en pipelines de generación de texto: para tareas de baja latencia y bajo coste donde no se requiere un modelo de gran tamaño, la variante PC puede integrarse vía llama.cpp en servicios locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona métricas de perplejidad en coreano para otras builds de la familia POCKET (por ejemplo, 5,79 para Q4_K_M en POCKET-35B), pero no proporciona valores para POCKET-EN-GGUF. Tampoco se incluyen resultados de MMLU, HumanEval, GSM8K ni comparaciones directas con modelos similares en esta build específica.

## Requisitos de hardware

- VRAM estimada: no aplica para ejecución en CPU; en GPU, la variante `iPhone-mix` de 5,3 GB requeriría al menos 6 GB de VRAM y la `PC-mix` de 6,8 GB al menos 8 GB.
- GPU recomendadas: no se especifican; el modelo está diseñado para CPU. Cualquier GPU con soporte llama.cpp (RTX 3060 en adelante) podría ejecutarlo, pero no es el objetivo declarado.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM, aunque el diseño prioriza CPU.
- Cabe en móvil: sí, en iPhone mediante PocketPal (variante `iPhone-mix`) y en Android con 8 GB o más de RAM (variante `PC-mix`).
- Opciones de despliegue: llama.cpp estándar, PocketPal en iOS, y cualquier aplicación compatible con GGUF (Ollama, LM Studio, entre otras).
- Latencia y throughput: no disponibles para esta build. La model card menciona 4,17 tok/s para un modelo distinto de la familia (POCKET-Qwen3.8-Flash-Next de 180B) en un portátil con 8 GB de VRAM y 32 GB de RAM, pero no es un dato aplicable a este modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| POCKET-EN-GGUF | 22,57 B (MoE) | no disponible | Apache 2.0 | GGUF | On-device, inglés, iPhone/PC |
| POCKET-KR-GGUF | no disponible | no disponible | Apache 2.0 | GGUF | On-device, coreano, Android |
| POCKET-26B-GGUF | no disponible (base Gemma4-26B-A4B) | no disponible | Apache 2.0 | GGUF | On-device, compatibilidad universal |
| POCKET-35B-GGUF | no disponible (base Qwen3.5-35B-A3B) | no disponible | Apache 2.0 | GGUF | On-device, máxima calidad en PC |

La comparativa se limita a la propia familia POCKET porque no se dispone de datos de rendimiento ni especificaciones de modelos externos comparables en la información proporcionada. No se han publicado benchmarks que permitan una comparación objetiva con alternativas de otros autores.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; el modelo base y los datos de entrenamiento no se detallan, por lo que no se puede evaluar el sesgo.
- Riesgo de alucinación: no cuantificado; al ser un modelo conversacional de tamaño medio con cuantización agresiva, el riesgo puede ser mayor que en versiones de mayor precisión.
- Limitaciones de contexto: la longitud de contexto no está disponible, lo que impide planificar aplicaciones que requieran ventanas largas.
- Limitaciones de idioma: esta build está enfocada al inglés; el rendimiento en otros idiomas no está documentado y probablemente sea inferior.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Darwin-36B-Opus puede tener condiciones adicionales no especificadas en esta ficha.
- Caveat de producción: el repositorio tiene 0 descargas y 0 likes, sin validación comunitaria; la cuantización propietaria no está documentada en detalle, lo que dificulta auditar su comportamiento.
- Discrepancia de nomenclatura: el nombre del modelo base ("36B") no coincide con el recuento real de parámetros (22,57 B), lo que puede indicar que el modelo base es distinto o que la denominación es comercial.
- Dependencia de runtime: aunque funciona con llama.cpp estándar, la variante para iPhone requiere PocketPal, lo que limita la portabilidad a otras aplicaciones iOS.

## Enlaces

- [Hugging Face: erenyeager-1/POCKET-EN-GGUF](https://huggingface.co/erenyeager-1/POCKET-EN-GGUF)
- [Modelo base: FINAL-Bench/Darwin-36B-Opus](https://huggingface.co/FINAL-Bench/Darwin-36B-Opus)
- [Colección POCKET Models](https://huggingface.co/collections/FINAL-Bench/pocket-models-6a618ee5d23eafb7e185a5c6)
- [Colección Darwin Family](https://huggingface.co/collections/FINAL-Bench/darwin-family-699987b1f652864af0122193)
- [POCKET-35B-GGUF](https://huggingface.co/FINAL-Bench/POCKET-35B-GGUF)
- [POCKET-26B-GGUF](https://huggingface.co/FINAL-Bench/POCKET-26B-GGUF)
- [POCKET-KR-GGUF](https://huggingface.co/FINAL-Bench/POCKET-KR-GGUF)
- [POCKET-KR-MLX](https://huggingface.co/FINAL-Bench/POCKET-KR-MLX)
- [POCKET-Qwen3.8-Flash-Next-GGUF](https://huggingface.co/FINAL-Bench/POCKET-Qwen3.8-Flash-Next-GGUF)
- [Demo POCKET-35B en CPU](https://huggingface.co/spaces/FINAL-Bench/POCKET-35B-CPU)
- [Demo POCKET-26B en CPU](https://huggingface.co/spaces/FINAL-Bench/POCKET-26B-CPU)
- [PocketPal AI (GitHub)](https://github.com/a-ghorbani/pocketpal-ai)
- [llama.cpp (GitHub)](https://github.com/ggml-org/llama.cpp)
- [Licencia Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)

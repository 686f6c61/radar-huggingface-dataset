# shsunshining/Qwen3.8-27B-Uncensored-GGUF

## Resumen

Qwen3.8-27B-Uncensored-GGUF es una cuantización comunitaria en formato GGUF del modelo Qwen3.8-27B, publicada por el usuario shsunshining. El único cambio respecto al modelo base es una abliteración (eliminación de direcciones de rechazo) realizada con la herramienta Heretic, que co-minimiza el número de negativas frente a la divergencia KL respecto al modelo original. No hay fine-tuning ni datos de entrenamiento adicionales.

El modelo conserva la arquitectura del base, una clase `Qwen3_5ForConditionalGeneration` de 64 capas y 27.320.697.856 parámetros, con una ventana de contexto de 262.144 tokens, un vocabulario de 248.320 entradas, soporte de visión mediante un proyector `mmproj` y una capa de multi-token prediction (MTP) que puede actuar como cabecera draft para decodificación especulativa.

Se distribuye en seis niveles de cuantización (de IQ2_M a Q8_0), en dos variantes (fichero fusionado con MTP en línea o pareja objetivo más draft separado) y con licencia apache-2.0. Su interés práctico está en el despliegue local: el fichero IQ2_M ocupa 10,6 GB y el Q4_K_M 16,8 GB, lo que permite ejecutar un modelo de 27 B en GPU de consumo con soporte multimodal y contexto muy largo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con encoder de visión; clase `Qwen3_5ForConditionalGeneration` (según la model card) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | No aplica: no se documenta arquitectura MoE |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | IQ2_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0; cabecera draft en Q8_0 y Q4_0; proyector de visión F16; importance matrix (imatrix) publicada |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el f16 de referencia no se distribuye |
| Capas | 64 |
| Vocabulario | 248.320 |
| Capas MTP | 1 |
| Vision | Sí, mediante `mmproj-Qwen3.8-27B-Uncensored-F16.gguf` (0,9 GB) |
| Modelo base | Qwen/Qwen3.8-27B |
| Relación con el base | quantized (abliterado y cuantizado) |
| Autor | shsunshining |
| Tamaño del repositorio | 231,3 GB |
| Descargas / likes | 0 / 0 (a fecha de creación, 30 de septiembre de 2026) |
| Conversión | llama.cpp `a94d563ed` |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.8-27B: 64 capas, vocabulario de 248.320 tokens y una capa de multi-token prediction (MTP) que predice varios tokens por paso. El repositorio añade un proyector de visión F16 (`mmproj`) que habilita entrada de imágenes en runtimes compatibles con GGUF multimodal. Sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) no hay información en la documentación proporcionada.

La modificación consiste en una abliteración ejecutada con Heretic en bf16, sin cuantización de 4 bits durante el proceso: el LoRA resultante se fusiona en el base bf16, de modo que los pesos publicados no son un ida y vuelta de cuantización. La abliteración actúa sobre `attn.o_proj` y `mlp.down_proj` de la pila principal; los tensores `mtp.*` se copian literalmente del checkpoint base después de la fusión, por lo que la cabecera MTP no se ve alterada. La importance matrix se calcula directamente desde el f16 (no desde una cuantización intermedia) usando wikitext-2 en bruto, 200 fragmentos, y se publica como `imatrix.dat` (13,6 MB).

## Capacidades

- Generación de texto conversacional en inglés y chino, con plantilla de chat propia de la familia Qwen3.8.
- Procesamiento de contexto largo: hasta 262.144 tokens, apto para documentos extensos y conversaciones multi-turno de muchas iteraciones.
- Entrada de imágenes: el proyector `mmproj` F16 permite análisis de imágenes con runtimes compatibles. La entrada de vídeo no está confirmada en la documentación del repositorio.
- Decodificación especulativa integrada: la capa MTP se puede usar en línea (fichero fusionado) o como borrador explícito con `--model-draft` (ficheros draft en Q8_0 y Q4_0).
- Reducción sustancial del comportamiento de rechazo: el autor indica que las negativas disminuyen de forma notable, pero no desaparecen.
- Integración con ComfyUI, documentada en la propia model card.
- Sin datos sobre tool calling, function calling, uso como agente o razonamiento multi-paso: no disponible en la información proporcionada.
- Sin modo de razonamiento explícito (thinking) documentado para este build: no disponible.

## Casos de uso

- Escritura creativa sin filtros temáticos: narrativa, guiones o diálogo que abordan violencia, sexualidad o temas controvertidos, donde los modelos alineados de forma agresiva rechazan la petición. El modelo mantiene la coherencia de un 27 B con contexto de 262.144 tokens para tramas largas.
- Análisis de documentación extensa en inglés o chino: contratos, informes técnicos o corpus normativos que caben en una sola ventana de 262.144 tokens, evitando estrategias de troceado y recuperación.
- Extracción de información a partir de imágenes combinada con texto (capturas, diagramas, páginas escaneadas) usando el proyector `mmproj` con un runtime GGUF multimodal.
- Despliegue local en hardware de gama media: el fichero IQ2_M (10,6 GB) permite ejecutar un modelo de 27 B en GPU de 12 GB, útil para prototipos con requisitos de privacidad estrictos en los que ningún dato puede salir de la máquina.
- Servicio de inferencia de baja latencia con `llama-server`: usando el fichero fusionado (MTP en línea) o el draft Q8_0 (3,2 GB) con `--model-draft`, la decodificación especulativa reduce el número de pasos por token generado, manteniendo la verificación de cada token contra el modelo objetivo.
- Investigación sobre alineación y mecanismos de rechazo: comparar el comportamiento de este build abliterado con el base sin modificar permite estudiar qué direcciones del espacio de activaciones codifican las negativas, con la ventaja de que el proceso (Heretic, minimización de rechazo frente a divergencia KL) está documentado y es reproducible.
- Red teaming y evaluación de seguridad: disponer de un modelo con filtros reducidos facilita construir conjuntos de prompts adversarios y medir la robustez de clasificadores de contenido o de guardarraíles externos.
- Tuberías de generación en ComfyUI: integración directa como nodo de texto en flujos de generación de imagen, con soporte de vision para condicionar la generación desde una imagen de entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, ARC) en la información disponible. El único dato medido y verificable que incluye la model card es la perplejidad en wikitext-2, calculada para todas las cuantizaciones en una misma sesión contra la misma línea base f16:

| Fichero | PPL (wikitext-2) | Diferencia vs f16 |
|---|---|---|
| `Qwen3.8-27B-Uncensored-f16.gguf` (línea base, no distribuido) | 7,1557 ± 0,25104 | — |
| `Qwen3.8-27B-Uncensored-Q5_K_M.gguf` | 7,1573 ± 0,25055 | +0,0016 |
| `Qwen3.8-27B-Uncensored-IQ4_XS.gguf` | 7,1583 ± 0,25019 | +0,0026 |
| `Qwen3.8-27B-Uncensored-Q6_K.gguf` | 7,1689 ± 0,25149 | +0,0132 |
| `Qwen3.8-27B-Uncensored-Q8_0.gguf` | 7,1764 ± 0,25195 | +0,0207 |
| `Qwen3.8-27B-Uncensored-Q4_K_M.gguf` | 7,1814 ± 0,25227 | +0,0257 |
| `Qwen3.8-27B-Uncensored-IQ2_M.gguf` | 7,8581 ± 0,27481 | +0,7024 |

El propio autor advierte de que todas las filas salvo IQ2_M quedan dentro de un margen de 0,026 frente a un error estándar de aproximadamente 0,25, por lo que no son separables entre sí ni respecto al f16, y su ordenación es ruido. Únicamente IQ2_M muestra una degradación clara de perplejidad.

La model card incluye una sección titulada «Speculative decoding, measured on this model» con una subsección para IQ2_M, pero las tablas de tasa de aceptación no forman parte de la información disponible; por tanto, las cifras de aceptación no están disponibles.

## Requisitos de hardware

Estimaciones derivadas del tamaño de cada fichero GGUF (el peso en disco equivale aproximadamente a la memoria necesaria para los pesos), más sobrecarga de runtime y caché KV:

| Cuantización | Peso en disco | VRAM estimada para pesos + sobrecarga | Encaje en GPU de consumo |
|---|---|---|---|
| IQ2_M | 10,6 GB | ~12 GB | RTX 3060 12 GB, RTX 4070 12 GB (margen muy escaso) |
| IQ4_XS | 15,3 GB | ~17 GB | RTX 4080/4090 16-24 GB |
| Q4_K_M | 16,8 GB | ~18-19 GB | RTX 4090 24 GB, RTX 3090 24 GB |
| Q5_K_M | 19,5 GB | ~21 GB | RTX 4090 24 GB |
| Q6_K | 22,4 GB | ~24 GB | RTX 4090 24 GB (al límite, con contexto corto) |
| Q8_0 | 29,0 GB | ~31 GB | A100 40/80 GB, H100 80 GB, o reparto en varias GPU |
| draft Q8_0 | 3,2 GB | adicional con `--model-draft` | — |
| draft Q4_0 | 1,7 GB | adicional con `--model-draft` | — |
| mmproj F16 | 0,9 GB | adicional si se usa visión | — |

- Memoria unificada: los cuants grandes también son viables en equipos Apple Silicon con 32-64 GB o en configuraciones con memoria unificada amplia, aunque sin datos de rendimiento publicados.
- Caché KV: la información disponible no especifica número de cabezas ni dimensión de cabeza, por lo que no se puede calcular el consumo de la caché KV. Con una ventana de 262.144 tokens, la caché KV es grande y, en la práctica, solo cabrá completa en GPUs de 80 GB o en configuraciones multi-GPU; para uso en GPU de consumo habrá que reducir `n_ctx` o aplicar cuantización de caché.
- Opciones de despliegue documentadas: `llama.cpp` (línea de comandos), `llama-server` con la bandera `--model-draft` para el borrador MTP, y ComfyUI. El etiquetado del repositorio incluye `endpoints_compatible`.
- Despliegue con vLLM, TGI u Ollama: no confirmado en la documentación del repositorio (Ollama aparece mencionado en guías de terceros para otros builds del mismo modelo base, no para este).
- Latencia y throughput: no disponible. La model card indica que las tablas de decodificación especulativa existen, pero no se han incluido en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantizaciones | Licencia | Notas |
|---|---|---|---|---|---|
| shsunshining/Qwen3.8-27B-Uncensored-GGUF (este) | 27,3 B | 262.144 | GGUF: IQ2_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0; draft Q8_0/Q4_0; mmproj F16 | apache-2.0 | Abliteración con Heretic, MTP conservado, visión, imatrix publicada |
| Qwen/Qwen3.8-27B (base) | 27,3 B | 262.144 (según el derivado) | No disponible | apache-2.0 | Sin modificar; mantiene el comportamiento de rechazo original |
| JonathanColetti/Qwen3.8-27B-Uncensored-GGUF | No disponible | No disponible | GGUF | No disponible | Otra cuantización GGUF no censurada del mismo modelo base; sin datos técnicos en la información consultada |
| Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-GGUF-UltraOptimised | 27 B (derivado) | No disponible | GGUF optimizado para servicio | No disponible | Fine-tune distinto sobre el mismo base. Las cifras de 735 en ARC-C, 882 en ARC-E y el resultado «9 de 9» frente a Claude Opus 4.6 Max son afirmaciones del publicador recogidas en la búsqueda web, no verificadas de forma independiente ni comparables directamente con este repositorio |

## Limitaciones y advertencias

- El comportamiento de rechazo se reduce de forma sustancial, pero no se elimina: el propio autor lo indica explícitamente. Algunas peticiones seguirán siendo rechazadas y el patrón no está caracterizado por categoría temática.
- No hay benchmarks independientes de capacidades (razonamiento, código, matemáticas) para este build. La afirmación del autor de que las capacidades no cambian respecto al base no está respaldada por mediciones publicadas más allá de la perplejidad.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta familia; no se documenta ninguna mitigación específica ni evaluación de veracidad en este repositorio.
- La cabecera draft se entrenó contra el modelo sin modificar, por lo que la tasa de aceptación en decodificación especulativa puede caer ligeramente. La calidad de salida no se ve afectada porque cada token se verifica contra el modelo objetivo.
- El draft en Q4_0 no tiene tasa de aceptación medida; solo el Q8_0 está caracterizado.
- Diferencias de perplejidad: todas las cuantizaciones salvo IQ2_M están dentro del ruido estadístico respecto al f16. No debe interpretarse que Q5_K_M sea mejor que Q8_0 por el orden de la tabla.
- Idiomas: la model card solo declara en y zh. El comportamiento en castellano no está evaluado ni declarado.
- Contexto: la ventana nominal de 262.144 tokens no implica que el modelo mantenga la calidad en todo el rango; no hay evaluaciones de recuperación en contexto largo (needle in a haystack ni similares).
- Licencia: el repositorio declara apache-2.0, lo que permite uso comercial, pero conviene verificar los términos del modelo base Qwen/Qwen3.8-27B por si imponen condiciones adicionales.
- Modelo sin filtros de seguridad: puede generar contenido dañino, ilegal o sexualmente explícito. La responsabilidad de moderación recae por completo en quien lo despliega. No debe exponerse directamente a usuarios finales sin una capa de filtrado propia.
- Madurez del repositorio: 0 descargas y 0 likes en la fecha de creación, sin validación de la comunidad. El repositorio ocupa 231,3 GB, lo que implica una descarga costosa.
- La model card está truncada en la sección de perplejidad («Do not conclude that...»), por lo que faltan conclusiones del autor sobre las mediciones.
- Soporte de visión: solo funciona con runtimes GGUF que reconozcan el prefijo `mmproj`; no está disponible en todas las herramientas de inferencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/shsunshining/Qwen3.8-27B-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- Otra cuantización no censurada del mismo base: https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored-GGUF
- Guía comparativa de cuantizaciones GGUF de Qwen3.8-27B: https://hackernoon.com/qwen38-27b-uncensored-vs-other-qwen-gguf-models
- Guía de despliegue local y en nube: https://thegeekinsights.com/run-uncensored-qwen-3-8-27b/
- Repositorio de despliegue local (Ollama): https://github.com/Wassimyounes01/qwen38-uncensored
- Build alternativo basado en el mismo modelo base: https://huggingface.co/Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-GGUF-UltraOptimised

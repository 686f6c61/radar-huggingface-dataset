# mradermacher/gemma-4-31B-it-heretic-NSFW-GGUF

## Resumen

`mradermacher/gemma-4-31B-it-heretic-NSFW-GGUF` es una colección de cuantizaciones estáticas en formato GGUF del modelo `yukiworks/gemma-4-31B-it-heretic-NSFW`, publicada por el usuario mradermacher. No se trata de un modelo entrenado desde cero, sino de una conversión a GGUF de un modelo base de la familia Gemma 4 de Google, de aproximadamente 30.697 millones de parámetros (30,7B), que ha sido sometido a un proceso de "abliteration" (eliminación de rechazos) y afinado para contenido NSFW por parte del autor original.

El modelo base, Gemma 4 31B IT, es un transformer denso de Google con capacidades conversacionales (sufijo "it" indica instruction-tuned). Sobre él se ha aplicado la técnica "heretic", que reduce los mecanismos de rechazo del modelo, y posteriormente un ajuste orientado a contenido para adultos. El resultado es un modelo conversacional sin los filtros habituales de seguridad, lo que lo hace inadecuado para la mayoría de aplicaciones de producción.

La relevancia de esta ficha es limitada y debe enmarcarse con cautela: se trata de una conversión de cuantización de un modelo derivado, con cero descargas y cero likes en el momento de la consulta, sin model card técnica más allá de los metadatos de cuantización, y con la etiqueta `not-for-all-audiences`. El repo ocupa 118,6 GB e incluye múltiples niveles de cuantización estática.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Gemma 4 31B IT, según el nombre del modelo) |
| Parámetros totales | 30.697.345.596 (≈30,7B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base Gemma 4 31B IT, un transformer denso de aproximadamente 30,7B parámetros. No se dispone de información en la documentación proporcionada sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO en la fase de instruction tuning del modelo original de Google.

El proceso específico de este repo es una conversión a GGUF con cuantización estática (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`). El modelo fuente (`yukiworks/gemma-4-31B-it-heretic-NSFW`) incorpora dos modificaciones sobre el base: abliteration mediante la herramienta "heretic" (que elimina direcciones de activación asociadas a rechazos) y un ajuste posterior orientado a contenido NSFW. No se detallan en la información disponible los datasets ni los hiperparámetros de ese ajuste.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del instruction tuning de Gemma 4 31B IT.
- Razonamiento y conocimiento general propios de un modelo de ~30B parámetros.
- Generación de código y matemáticas (capacidad esperable del base, no verificada en la información disponible).
- Contenido NSFW y para adultos sin los filtros de rechazo habituales (objetivo declarado del ajuste "heretic-NSFW").
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas.
- Capacidades multilingües: no disponibles (los idiomas no se especifican).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar empíricamente cómo la abliteration afecta a la tasa de rechazos y a la calidad general, comparándolo con el Gemma 4 31B IT original en evaluaciones controladas.
- Experimentación en generación creativa para adultos: escritura de ficción explícita o roleplay sin las restricciones del modelo base, en entornos controlados y con audiencias adultas.
- Pruebas de robustez de filtros: usar el modelo como generador adversarial para evaluar clasificadores de contenido y sistemas de moderación.
- Despliegue local con llama.cpp/Ollama: las cuantizaciones Q4_K_M o Q5_K_M permiten ejecutar un modelo de ~30B en hardware de consumo de gama alta, útil para laboratorios sin acceso a GPUs de datacenter.
- Estudio de degradación por cuantización: la colección incluye desde Q2_K hasta Q8_0 y F16, lo que permite medir la pérdida de calidad a distintos niveles de compresión sobre un mismo modelo.
- Comparativas de técnicas de ablación: contrastar el comportamiento del modelo "heretic" frente a otras variantes abliteradas del mismo base para investigar métodos de eliminación de rechazos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según tamaño y cuantización): Q2_K ≈ 11-13 GB; Q4_K_M ≈ 18-20 GB; Q5_K_M ≈ 21-23 GB; Q8_0 ≈ 32-34 GB; F16 ≈ 61-62 GB.
- GPU recomendadas: para Q4_K_M/Q5_K_M, una RTX 4090 (24 GB) o RTX 3090 (24 GB) resulta suficiente; para Q8_0 se recomienda A100 40 GB o H100; para F16, A100 80 GB o H100.
- Cabe en GPU de consumo: sí, en cuantizaciones Q2_K a Q5_K_M en GPUs de 24 GB; Q6_K y Q8_0 requieren GPUs profesionales o configuraciones multi-GPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python). El tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/gemma-4-31B-it-heretic-NSFW-GGUF | ≈30,7B | no disponible | no disponible | GGUF | Conversión de cuantización de un derivado abliterado/NSFW |
| yukiworks/gemma-4-31B-it-heretic-NSFW | ≈30,7B | no disponible | no disponible | safetensors (presumiblemente) | Modelo fuente del que deriva esta conversión |
| Gemma 4 31B IT (base) | ≈30,7B | no disponible | no disponible | safetensors | Modelo original de Google, con filtros de seguridad |
| Otras cuantizaciones GGUF de Gemma 4 31B IT | ≈30,7B | no disponible | no disponible | GGUF | Alternativas sin abliteration ni ajuste NSFW |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Modelo explícitamente etiquetado `not-for-all-audiences`: genera contenido para adultos y no es apto para aplicaciones de cara al público general.
- La abliteration reduce los rechazos de forma no selectiva, lo que puede degradar la calidad en tareas que requieren cautela, matices o negativas razonadas.
- Riesgo elevado de alucinación y de respuestas inseguras al haberse eliminado los mecanismos de alineación de seguridad del base.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. La licencia del modelo base Gemma de Google impone sus propias condiciones, que deben verificarse en el modelo fuente.
- Idiomas y longitud de contexto no documentados en esta conversión.
- Cero descargas y cero likes: sin validación comunitaria de la calidad de las cuantizaciones.
- El ajuste NSFW puede introducir sesgos y contenido problemático; no apto para producción sin revisión humana y filtros externos.
- Repo de 118,6 GB: requiere espacio en disco considerable para descargar todas las cuantizaciones.

## Enlaces

- Hugging Face (este repo): https://huggingface.co/mradermacher/gemma-4-31B-it-heretic-NSFW-GGUF
- Modelo fuente: https://huggingface.co/yukiworks/gemma-4-31B-it-heretic-NSFW

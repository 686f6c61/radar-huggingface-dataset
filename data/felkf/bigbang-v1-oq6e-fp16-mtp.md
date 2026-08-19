# felkf/BigBang-v1-oQ6e-fp16-mtp

## Resumen

BigBang-V1 es un modelo de lenguaje generalista multimodal (texto e imagen) desarrollado por el equipo de endless-frontier, evolucionado a partir de Qwen 3.6 35B-A3B mediante un post-entrenamiento eficiente con un framework adversarial de datos sintéticos autoevolutivos. El framework combina agentes generadores que proponen y resuelven problemas científicos y técnicos cada vez más difíciles, con agentes críticos que evalúan la corrección, dificultad, escalabilidad y diversidad, calibrando la distribución de datos sintéticos con tareas de investigación reales. El resultado es un modelo de 35B parámetros totales con 3B activos (MoE) que, pese a entrenarse con solo unas 10.000 muestras de alta dificultad, supera sustancialmente a su modelo base en razonamiento, código, investigación científica y uso de herramientas, alcanzando un rendimiento agregado entre DeepSeek V4 Flash (284B) y DeepSeek V4 Pro (1.6T).

La versión aquí descrita, `felkf/BigBang-v1-oQ6e-fp16-mtp`, es una cuantización de 6 bits (oQ6e) con pesos en fp16 y soporte de multi-token prediction (MTP). Tiene una longitud de contexto de 262.144 tokens y está licenciada bajo Apache 2.0. Su pipeline `image-text-to-text` indica que puede procesar entradas de imagen y texto, aunque la documentación disponible se centra en tareas de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en Qwen 3.6 35B-A3B |
| Parametros totales | 35B (modelo original); 8.326.167.472 en safetensors (cuantización oQ6e) |
| Parametros activos | 3B (según designación A3B) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | oQ6e (6-bit) en esta versión; otras cuantizaciones no disponibles |
| Idiomas soportados | Inglés (etiqueta `language: en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

BigBang-V1 parte de la arquitectura MoE de Qwen 3.6 35B-A3B, que combina atención por ventanas deslizantes y atención completa en capas alternas, con 3B parámetros activos por token. El post-entrenamiento utiliza un framework adversarial de datos sintéticos: agentes generadores proponen problemas verificables en dominios como matemáticas, física, bioinformática y programación, mientras que agentes críticos los evalúan y seleccionan. Se construyeron aproximadamente 10.000 ejemplos de alta dificultad. No se especifican detalles sobre el entrenamiento original de Qwen (número de tokens, composición del dataset, uso de RLHF/DPO), pero el proceso de post-entrenamiento no parece incluir RLHF clásico, sino un refinamiento basado en datos sintéticos verificables.

La innovación clave es el uso de tareas frontera verificables (verifiable frontier tasks) para evitar el estancamiento del entrenamiento en problemas que ya están dentro del conocimiento humano. El modelo también incorpora soporte de multi-token prediction (MTP) en esta versión cuantizada, lo que puede mejorar la velocidad de decodificación.

## Capacidades

- Generación de texto y razonamiento de largo alcance: maneja tareas de búsqueda multi-paso y razonamiento complejo, como se refleja en benchmarks de BrowseComp y XBench.
- Programación y resolución de problemas de software: destaca en SWE-Bench Pro y PaperBench (Code-Dev), lo que indica capacidad para resolver issues de repositorios reales y desarrollar código científico.
- Investigación científica: obtiene puntuaciones altas en FrontierScience Research, Humanity's Last Exam y BioMysteryBench, lo que sugiere comprensión de conceptos avanzados de biología, química y física.
- Uso de herramientas y agente: soporta tool calling y razonamiento multi-paso, adecuado para tareas de agente como MLE-Bench.
- Multimodalidad: el pipeline `image-text-to-text` indica que puede procesar imágenes junto con texto, aunque no se detallan capacidades específicas de visión.
- Soporte de contexto largo: 262K tokens, pensado para tareas que requieren mantener un historial extenso o procesar documentos largos.
- Multi-token prediction (MTP): la variante cuantizada incluye esta técnica para acelerar la inferencia.

## Casos de uso

- Asistente de investigación científica: puede ayudar a formular hipótesis, diseñar experimentos y analizar literatura, gracias a su rendimiento en benchmarks de investigación y su contexto de 262K tokens para procesar papers completos.
- Agente de desarrollo de software autónomo: con soporte de tool calling y buenos resultados en SWE-Bench Pro, puede integrarse en pipelines de CI/CD para resolver issues, generar parches y revisar código.
- Búsqueda y recuperación de información en dominios técnicos: su capacidad en BrowseComp y XBench permite construir agentes que navegan por la web y extraen datos relevantes con precisión.
- Tutor de matemáticas y ciencias avanzadas: dado su desempeño en Humanity's Last Exam y FrontierScience, puede generar explicaciones detalladas y problemas de práctica para estudiantes de nivel universitario.
- Análisis de datos biomédicos: los resultados en BioMysteryBench sugieren que puede interpretar datos de secuencias biológicas o literatura médica, aunque se requiere validación adicional.
- Generación de informes técnicos y documentación: puede redactar documentación de código, resúmenes de investigaciones y reportes técnicos coherentes, aprovechando su contexto largo para mantener consistencia.

## Benchmarks y rendimiento

La model card del autor proporciona resultados comparativos en ocho benchmarks representativos. Se muestran los valores para BigBang-V1 y otros modelos, pero no se incluyen intervalos de confianza ni detalles de metodología. A continuación se presentan los resultados de BigBang-V1 junto a su modelo base Qwen3.6-35B-A3B y dos modelos de referencia de mayor tamaño (DeepSeek V4 Flash y Pro) para contexto.

| Benchmark | Qwen3.6 35B-A3B | DeepSeek V4 Flash Preview | DeepSeek V4 Pro Preview | BigBang-V1 |
|:--|--:|--:|--:|--:|
| BrowseComp | 67.9 | 73.2 | 83.4 | **76.5** |
| XBench | 32.6 | 62.2 | 64.8 | **58.4** |
| SWE-Bench Pro | 43.6 | 52.6 | 55.4 | **54.2** |
| SciCode-V-Sub | 56.5 | 83.7 | 90.2 | **68.6** |
| SciCode-V-Main | 26.6 | 68.6 | 78.1 | **50.0** |
| FS-R | 11.9 | 37.7 | 40.7 | **46.2** |
| HLE | 36.2 | 45.1 | 48.2 | **50.3** |
| BioMystery-HS | 44.8 | 68.0 | 64.4 | **57.5** |
| BioMystery-HD | 2.0 | 23.5 | 13.7 | **15.7** |
| MLE-Bench(Lite) | 31.8 | 40.9 | 59.1 | **59.1** |
| PaperBench(Code-Dev) | 30.7 | 40.4 | 50.4 | **53.6** |

BigBang-V1 supera a Qwen3.6-35B-A3B en todos los benchmarks, y en varios casos iguala o supera a DeepSeek V4 Pro Preview (1.6T), como en FS-R, HLE, PaperBench(Code-Dev) y BioMystery-HD. Sin embargo, en tareas de código (SciCode-V) y búsqueda (XBench) queda por debajo de los modelos DeepSeek más grandes.

## Requisitos de hardware

No se proporcionan requisitos específicos de hardware en la información disponible. No obstante, se pueden hacer estimaciones razonables:

- VRAM estimada para inferencia: al ser un MoE con 3B parámetros activos, la memoria de activaciones es baja, pero los pesos completos (35B) deben cargarse. En cuantización 6-bit, los pesos ocupan aproximadamente 26 GB (35B × 0.75 bytes). La versión cuantizada aquí descrita tiene 8.3B parámetros en safetensors, lo que sugiere que el tamaño real de los tensores es menor, posiblemente debido a compartición de pesos entre expertos. En cualquier caso, se recomienda una GPU con al menos 24 GB de VRAM para ejecutar el modelo en 6-bit, y 32 GB o más para fp16.
- GPUs recomendadas: NVIDIA A100 (40/80 GB), H100 (80 GB), RTX 4090 (24 GB) o RTX 6000 Ada (48 GB). Para producción, se sugieren A100 o H100.
- Si cabe en consumer GPU: sí, una RTX 4090 con 24 GB puede ejecutar la versión 6-bit, aunque con contexto reducido (por ejemplo, 128K en lugar de 262K).
- Opciones de despliegue: la model card recomienda SGLang, KTransformers o vLLM para servir el modelo con API compatible con OpenAI. También se puede usar llama.cpp u Ollama si se generan archivos GGUF, aunque no se mencionan explícitamente.
- Latencia y throughput: no se proporcionan datos. Se espera que el MoE con 3B activos ofrezca una latencia baja en comparación con modelos densos de 35B, pero el tamaño de los pesos puede limitar el throughput en GPUs de menor capacidad.

## Comparativa con modelos similares

La comparativa se centra en modelos de la misma escala (35B) y en alternativas de mayor tamaño que sirven como referencia.

| Modelo | Parametros totales | Activos | Contexto | Licencia | Rendimiento general |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B | 35B | 3B | 262K | Apache 2.0 | Base; superado por BigBang-V1 en todos los benchmarks |
| BigBang-V1 | 35B | 3B | 262K | Apache 2.0 | Mejora significativa sobre Qwen3.6, cercano a DeepSeek V4 Flash |
| DeepSeek V4 Flash Preview | 284B | no disponible | no disponible | no disponible | Superior en código y búsqueda, inferior en investigación científica |
| Nex-N2 mini | no disponible | no disponible | no disponible | no disponible | Rendimiento inferior en la mayoría de benchmarks |

BigBang-V1 ofrece un rendimiento excepcional en tareas de razonamiento científico y AI research para su tamaño, superando a modelos mucho más grandes en varios benchmarks. Su licencia Apache 2.0 permite uso comercial sin restricciones. La principal desventaja frente a DeepSeek V4 Flash es en tareas de código puro y búsqueda, donde el modelo más grande tiene ventaja.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos, pero al estar entrenado principalmente con datos sintéticos y en inglés, puede presentar sesgos derivados de la distribución de datos generados.
- Riesgo de alucinación: como todo LLM, puede generar información plausible pero incorrecta, especialmente en dominios científicos donde la verificación externa es necesaria.
- Limitaciones de idioma: solo se declara soporte para inglés. No se garantiza un rendimiento adecuado en otros idiomas.
- Contexto y memoria: aunque soporta 262K tokens, el uso de contexto muy largo puede degradar el rendimiento si no se gestiona adecuadamente; se recomienda mantener al menos 128K para tareas complejas.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el modelo base Qwen3.6-35B-A3B también está bajo Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- Advertencia para producción: la cuantización 6-bit puede introducir pérdida de precisión en tareas numéricas o de razonamiento exacto. Se recomienda validar el modelo en el caso de uso específico antes de desplegarlo en entornos críticos.
- Disponibilidad de benchmarks: los resultados presentados provienen de la model card del autor y no han sido verificados de forma independiente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/felkf/BigBang-v1-oQ6e-fp16-mtp
- Modelo base (endless-frontier/BigBang-v1): https://huggingface.co/endless-frontier/BigBang-v1
- Modelo base original (Qwen3.6-35B-A3B): no se proporciona enlace directo, pero se puede buscar en HuggingFace como `Qwen/Qwen3.6-35B-A3B`
- Documentación de SGLang: https://docs.sglang.ai/get_started/install.html
- Repositorio de SGLang: https://github.com/sgl-project/sglang
- Referencia a la licencia Apache 2.0: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE

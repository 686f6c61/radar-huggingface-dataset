# aljosadro/albedo-qwen3.6-35b-k9

## Resumen

El modelo `aljosadro/albedo-qwen3.6-35b-k9` es un derivado del modelo Qwen3.6-35B-A3B, desarrollado por el usuario aljosadro. Se trata de un modelo de arquitectura MoE (Mixture of Experts) con atención híbrida/delta, que hereda las capacidades del modelo base de Qwen. Con aproximadamente 35.107 millones de parámetros totales y alrededor de 3.000 millones de parámetros activos, está diseñado para ofrecer un rendimiento elevado con un coste computacional reducido en comparación con modelos densos de tamaño equivalente.

El modelo resuelve el problema de ejecutar modelos de razonamiento y generación de código de alto nivel en hardware de consumo, gracias a su arquitectura MoE que activa solo una fracción de sus parámetros por token. Su relevancia actual radica en la tendencia de la familia Qwen 3.6 hacia arquitecturas híbridas y eficientes, y este derivado concreto parece estar orientado a un uso local optimizado, aunque la información disponible sobre su proceso de entrenamiento específico es mínima.

La ficha se basa en los datos de HuggingFace y en información pública sobre el modelo base Qwen3.6-35B-A3B, ya que el derivado no incluye documentación detallada propia. No se dispone de licencia, idiomas soportados, ni especificaciones de contexto para esta variante concreta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con atención híbrida/delta |
| Parametros totales | 35.107.181.936 (35B) |
| Parametros activos | ~3B (según datos del modelo base Qwen3.6-35B-A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en BF16) |
| Idiomas soportados | no disponible (probablemente multilingüe, heredado del modelo base) |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La arquitectura del modelo es una MoE basada en el diseño de Qwen3.6-35B-A3B, con atención híbrida que combina mecanismos de atención clásica y delta. El modelo base emplea compresión de cache KV turbo3, que reduce el consumo de memoria durante la inferencia y mejora la velocidad en hardware de consumo. Según la información de la web, esta arquitectura permite que el modelo sea 3-4 veces más rápido que el Qwen3.6-27B denso en tareas de generación, manteniendo un rendimiento competitivo.

El modelo base fue entrenado con un enfoque de razonamiento avanzado y optimización para tareas de código, alcanzando un 73,4 % en SWE-bench Verified. Sin embargo, no se dispone de información sobre el proceso de entrenamiento de este derivado concreto (fine-tuning, datos de entrenamiento, método de alineación, etc.). La model card solo indica que es un derivado del Qwen3.6-35B-A3B, sin más detalles.

## Capacidades

- Generación de texto y razonamiento complejo, heredado del modelo base Qwen3.6-35B-A3B.
- Generación de código y resolución de tareas de software engineering: el modelo base obtiene 73.4 % en SWE-bench Verified.
- Razonamiento matemático y lógico de nivel avanzado, según benchmarks del modelo base.
- Capacidades multilingües: probablemente soporte múltiples idiomas, aunque no se confirma para este derivado.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no confirmado para este derivado, pero el modelo base está diseñado para razonamiento profundo.
- Compresión de KV cache turbo3: permite inferencia eficiente con memoria reducida.

## Casos de uso

- **Asistente de programación en producción**: el modelo puede integrarse en entornos de desarrollo para generar código, revisar PR y proponer soluciones a incidencias, gracias a su rendimiento en SWE-bench Verified y su eficiencia de inferencia en hardware de consumo.
- **Automatización de tareas de software engineering**: puede utilizarse en pipelines de CI/CD para autogenerar tests, documentar código o realizar análisis estático de código, aprovechando su arquitectura MoE para tiempos de respuesta rápidos.
- **Razonamiento complejo en sistemas de IA**: con su atención híbrida y 3B activos, es adecuado para aplicaciones que requieren razonamiento multi-paso en tiempo real, como chatbots de soporte técnico avanzado o asistentes de investigación.
- **Análisis de código en entornos locales**: por su eficiencia, puede desplegarse en estaciones de trabajo con GPUs de consumo (RTX 4090) para análisis de repositorios grandes sin necesidad de infraestructura en la nube.
- **Educación en programación**: como tutor de código que explica soluciones, genera ejemplos y corrige errores, aprovechando su conocimiento de código y su razonamiento lógico.
- **Automatización de documentación técnica**: puede generar documentación de API, comentarios de código y guías técnicas a partir de código fuente, reduciendo el trabajo manual en equipos de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este derivado `albedo-qwen3.6-35b-k9`. Los datos disponibles provienen del modelo base Qwen3.6-35B-A3B, que según la información de búsqueda alcanza:

| Benchmark | Resultado (modelo base) |
|---|---|
| SWE-bench Verified | 73,4 % |

No se dispone de resultados de MMLU, HumanEval, GSM8K u otros benchmarks estándar en la información proporcionada. Se recomienda evaluar el modelo directamente para validar su rendimiento en el caso de uso concreto.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo en BF16 ocupa aproximadamente 70 GB (tamaño del repo). Con cuantización de 8 bits (GGUF) se estima un uso de ~35 GB de VRAM; con 4 bits, ~18-20 GB, aunque no se confirma la disponibilidad de cuantizaciones para este derivado.
- **GPU recomendadas**: para ejecución completa en BF16 se requieren GPUs como A100 (80 GB) o H100. Con cuantización, puede ejecutarse en RTX 4090 (24 GB) o RTX 3090 (24 GB) usando llama.cpp con compresión de KV turbo3.
- **Hardware de consumo**: cabe en GPU de consumo de 24 GB con cuantización de 4 bits, aunque el rendimiento óptimo se obtiene con la compresión de KV cache del modelo base.
- **Opciones de despliegue**: llama.cpp (servidor local), vLLM (si se adapta), Ollama (si se genera un GGUF), TGI (si se configura). El modelo no está desplegado en ningún Inference Provider de HuggingFace.
- **Latencia y throughput**: no disponibles para este derivado. El modelo base es 3-4 veces más rápido que el Qwen3.6-27B denso en RTX 4090, según pruebas de la comunidad.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | SWE-bench | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (base) | 35B | 3B | no disponible | 73,4 % | no disponible |
| Qwen3.6-27B (dense) | 27B | 27B | no disponible | no disponible | no disponible |
| `albedo-qwen3.6-35b-k9` | 35B | ~3B | no disponible | no disponible | no disponible |

Comparado con el Qwen3.6-27B denso, el modelo MoE ofrece una velocidad de inferencia 3-4 veces superior en hardware de consumo, aunque el rendimiento en tareas de razonamiento podría ser ligeramente inferior. No se dispone de comparativas con otros modelos MoE de tamaño similar (como Mixtral 8x7B o DeepSeek-V2) en la información proporcionada.

## Limitaciones y advertencias

- **Licencia no especificada**: el modelo no indica licencia en HuggingFace, lo que supone un riesgo legal para su uso comercial. Hay que contactar con el autor o consultar la licencia del modelo base.
- **Información de entrenamiento ausente**: no se detalla el proceso de derivación (fine-tuning, continuidad del pre-training, etc.), por lo que no se puede evaluar la calidad o el sesgo adicional introducido.
- **Riesgo de alucinación**: como modelo MoE de razonamiento, puede generar respuestas plausibles pero incorrectas, especialmente en tareas de código complejo o matemáticas.
- **Sesgos del modelo base**: hereda los sesgos de Qwen3.6-35B-A3B, que pueden incluir sesgos culturales y lingüísticos. No se ha realizado una evaluación específica de este derivado.
- **Contexto y multilingüismo no confirmados**: no se especifica la longitud de contexto ni los idiomas soportados, lo que limita su uso en aplicaciones que requieran ventanas de contexto largas o idiomas concretos.
- **Despliegue en producción**: sin cuantizaciones oficiales ni soporte de proveedores de inferencia, el despliegue requiere trabajo manual de conversión y evaluación.

## Enlaces

- HuggingFace: https://huggingface.co/aljosadro/albedo-qwen3.6-35b-k9
- Modelo relacionado (checkpoint): https://huggingface.co/Dendritex/albedo-qwen3.6-35b-ckpt100
- Comparativa Qwen 3.6 35B vs 27B: https://zoliben.com/en/posts/2026-04-23-qwen-36-35b-vs-27b-benchmark-results/
- Guía de Qwen 3.6 local: https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Guía completa de Qwen 3.6-35B-A3B: https://www.aimadetools.com/blog/qwen-3-6-35b-a3b-complete-guide/

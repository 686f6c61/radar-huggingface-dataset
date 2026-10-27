# mradermacher/Sage-A1.5-Ablitrex-abliterated-BF16-i1-GGUF

## Resumen

Sage-A1.5-Ablitrex-abliterated-BF16-i1-GGUF es un conjunto de cuantizaciones GGUF generadas por mradermacher a partir del modelo mostwanted002/Sage-A1.5-Ablitrex-abliterated-BF16, una variante "abliterated" (con los mecanismos de rechazo atenuados o eliminados mediante edición de pesos) de un modelo denso de 34.660.610.688 parámetros (≈34,7B). El repositorio no contiene pesos en formato transformers, sino únicamente ficheros GGUF cuantizados con el método i1 de mradermacher, que combina una matriz de importancia (imatrix) con tipos de cuantización de llama.cpp para preservar mejor la perplejidad a igual tamaño de fichero.

La relevancia de esta publicación es doble: por un lado, permite ejecutar un modelo de ~35B en hardware de consumo mediante cuantizaciones que van de 8,3 GB (i1-IQ1_M) a 28,6 GB (i1-Q6_K); por otro, al tratarse de una variante abliterated, el modelo no incorpora los filtros de rechazo habituales, lo que lo hace interesante para investigación sobre alineamiento, red-teaming y experimentación con modelos sin censura, y problemático para despliegues de cara al público sin capas de seguridad adicionales.

La información pública es escasa: el autor de la cuantización no documenta arquitectura, contexto, datos de entrenamiento ni resultados de benchmarks, y la model card se limita a listar los ficheros generados. El repositorio se publicó el 26 de octubre de 2026, con licencia MIT, idioma declarado inglés y un tamaño total de 274,9 GB (los pesos BF16 del modelo base más los ficheros cuantizados).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el autor no la documenta; el recuento de parámetros es consistente con un transformer decoder-only denso, sin confirmar) |
| Parametros totales | 34.660.610.688 (≈34,7B, dato real de safetensors del modelo base) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 (imatrix): IQ1_M, IQ2_XXS, IQ2_XS, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q6_K; se incluye además el fichero imatrix (0,5 GB) para generar cuantizaciones propias. Existen cuantizaciones estáticas en el repositorio hermano `-GGUF` |
| Idiomas soportados | en (inglés), según la model card |
| Licencia | MIT |
| Formato de pesos | GGUF (únicamente); los pesos originales en BF16 están en el repositorio del modelo base |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna del modelo base en la documentación disponible. El nombre del repositorio indica que se trata de una variante "abliterated" de Sage-A1.5: la técnica de abliteration identifica las direcciones de activación asociadas al rechazo (típicamente mediante diferencias de medias entre prompts dañinos y benignos) y las proyecta fuera de la matriz de pesos, de modo que el modelo pierde parte de su comportamiento de negativa sin reentrenar. El autor de la cuantización no detalla qué componentes se modificaron ni con qué metodología exacta.

El proceso aplicado en este repositorio concreto es una cuantización post-entrenamiento con llama.cpp usando matrices de importancia (imatrix), generadas a partir de un corpus de calibración. Los cuantos i1 se caracterizan por asignar distinto número de bits por tensor según su impacto en la perplejidad, lo que permite que un i1-Q4_K_M de 21,3 GB rinda por encima de un Q4_K_M estático de tamaño similar. No se dispone de datos sobre tokens de entrenamiento, composición del dataset, RLHF/DPO ni innovaciones técnicas del modelo original.

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat (etiqueta `conversational` en el repositorio).
- Modelo sin censura (abliterated): no aplica los filtros de rechazo típicos, lo que incluye responder a peticiones que un modelo alineado estándar declinaría.
- La model card de la cuantización incluye la nota genérica "This is a vision model", pero el repositorio i1 no contiene ficheros `mmproj`; cualquier capacidad de visión dependería de que existan dichos ficheros en el repositorio estático `mradermacher/Sage-A1.5-Ablitrex-abliterated-BF16-GGUF`. No confirmado.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que el GGUF funciona con el servidor compatible con OpenAI de llama.cpp y con infraestructura de Hugging Face.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al inglés según la model card; el comportamiento en castellano no está evaluado.
- Modo "thinking" o razonamiento explícito: no disponible (no documentado).

## Casos de uso

- Investigación sobre alineamiento y abliteration: comparar las respuestas del modelo base alineado frente a esta variante ablacionada permite medir cuánto del comportamiento de rechazo reside en direcciones lineales de activación, usando el mismo prompt set en ambos modelos.
- Red-teaming y evaluación de seguridad: al carecer de filtros, sirve como generador de completaciones adversarias para probar clasificadores de contenido, guardrails o sistemas de moderación antes de desplegarlos.
- Escritura creativa sin restricciones temáticas: narrativa, guion y ficción con temáticas oscuras o controvertidas, donde los modelos alineados suelen añadir negativas o autocensura; el formato GGUF permite ejecutarlo localmente en una estación de trabajo con 24 GB de VRAM (i1-Q4_K_M, 21,3 GB).
- Asistente conversacional autoalojado en inglés: despliegue con llama.cpp u Ollama en una máquina con una RTX 3090/4090 para conversaciones multi-turno sin enviar datos a terceros; la licencia MIT facilita su integración en productos internos.
- Generación de datos sintéticos para fine-tuning: producir corpus en inglés con estilo y temática controlados, incluidos dominios que los modelos alineados rechazan, para después filtrar y curar el dataset.
- Experimentación con cuantización extrema: los ficheros de 8,3 GB (i1-IQ1_M) y 9,6 GB (i1-IQ2_XXS) permiten estudiar la degradación de calidad de un modelo de ~35B en GPUs de 8-12 GB, usando el resto de la familia como curva de referencia.
- Base para fine-tuning de estilo o dominio: partir de los pesos BF16 del modelo base (no de los GGUF) y aplicar LoRA sobre ellos, aprovechando que la licencia MIT no impone restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (regla práctica: tamaño del fichero + 1-3 GB de caché KV y overhead según contexto):
  - i1-IQ1_M (8,3 GB): ~10-11 GB → RTX 3060 12 GB, RTX 4070 12 GB.
  - i1-IQ2_M (11,8 GB) / i1-Q2_K (13,0 GB): ~13-15 GB → RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB.
  - i1-IQ3_M (15,5 GB) / i1-Q3_K_M (16,9 GB): ~17-19 GB → GPU de 24 GB con contexto moderado.
  - i1-Q4_K_S (20,0 GB) / i1-Q4_K_M (21,3 GB): ~22-24 GB → RTX 3090, RTX 4090, L4 24 GB; en 24 GB conviene limitar el contexto.
  - i1-Q5_K_S (24,1 GB) / i1-Q6_K (28,6 GB): ~26-31 GB → A6000 48 GB, L40S, A100 40 GB, o dos GPU de 24 GB con reparto por capas.
- ¿Cabe en GPU de consumo? Sí, desde una RTX 3060 12 GB con las cuantizaciones IQ1/IQ2 (calidad degradada) hasta una RTX 4090 24 GB con Q4_K_M, que es el punto de equilibrio razonable.
- Opciones de despliegue: llama.cpp (`llama-server` con API compatible con OpenAI), Ollama, LM Studio, koboldcpp. vLLM y TGI no admiten GGUF de forma nativa: para esos motores habría que usar los pesos BF16 del modelo base (≈69 GB en FP16), lo que exige una A100 80 GB o varias GPU.
- Latencia y throughput estimados: no disponibles; dependen de la GPU, del cuanto elegido y de la longitud de contexto. Como referencia cualitativa, los cuantos Q4 con decodificación en memoria de vídeo son los que ofrecen mayor velocidad; los IQ1/IQ2 reducen el ancho de banda necesario pero con pérdida de calidad apreciable.

## Comparativa con modelos similares

No hay datos de benchmarks del modelo, por lo que la comparación se limita a la clase de tamaño, contexto documentado y licencia. Las cifras de los modelos alternativos provienen de sus especificaciones públicas, no de una evaluación conjunta.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Sage-A1.5-Ablitrex-abliterated (i1-GGUF) | 34,7B | no disponible | MIT | GGUF (i1 y estáticos); BF16 en el repo base | Sin censura; cuantizaciones desde 8,3 GB |
| Qwen3-32B | 32,8B | 32k nativo (ampliable con YaRN) | Apache-2.0 | Safetensors, GGUF, AWQ/GPTQ | Con modo thinking; ecosistema de cuantizaciones muy amplio |
| Gemma 3 27B | 27B | 128k | Gemma Terms of Use | Safetensors, GGUF | Multimodal (visión) y multilingüe; licencia con restricciones de uso |
| Mistral Small 3.1 24B | 24B | 128k | Apache-2.0 | Safetensors, GGUF | Multimodal, orientado a latencia baja; muy desplegado en producción |

Frente a estas alternativas, la ventaja de Sage-A1.5-Ablitrex es la ausencia de filtros de rechazo y una licencia MIT sin cláusulas adicionales; la desventaja es la opacidad total sobre arquitectura, contexto, idiomas y calidad, además de un soporte multilingüe aparentemente inexistente.

## Limitaciones y advertencias

- Ausencia de alineamiento de seguridad: al ser una variante abliterated, el modelo no rechaza peticiones dañinas. No debe exponerse directamente a usuarios finales sin moderación de entrada y salida.
- Riesgo de alucinación: no cuantificado; sin benchmarks publicados no hay forma de estimar su fiabilidad factual frente a modelos de la misma clase.
- Idiomas: la model card solo declara inglés. El rendimiento en castellano es desconocido y probablemente deficiente; no se recomienda para producción en español sin evaluación previa.
- Contexto desconocido: no se documenta la ventana máxima, lo que impide planificar casos de uso con documentos largos.
- Calidad de las cuantizaciones extremas: los ficheros IQ1 e IQ2 (8-12 GB) degradan notablemente la coherencia; el propio autor los etiqueta como "mostly desperate" o "very low quality". Para uso real conviene Q4_K_M o superior.
- Capacidad de visión no confirmada: la nota sobre visión de la model card es una plantilla genérica del cuantizador; este repositorio no incluye `mmproj`.
- Licencia: MIT permite uso comercial y modificación, pero no exime del cumplimiento de la normativa aplicable (por ejemplo, obligaciones de moderación de contenido en la UE) ni de las responsabilidades derivadas de generar contenido dañino.
- Trazabilidad: no se documenta el proceso de abliteration ni el dataset empleado, y el repositorio tiene un uso prácticamente nulo (0 descargas, 1 like), sin validación por parte de la comunidad.
- Fecha de creación del repositorio: 26 de octubre de 2026.

## Enlaces

- Repositorio de cuantizaciones i1 (este modelo): https://huggingface.co/mradermacher/Sage-A1.5-Ablitrex-abliterated-BF16-i1-GGUF
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/Sage-A1.5-Ablitrex-abliterated-BF16-GGUF
- Modelo base: https://huggingface.co/mostwanted002/Sage-A1.5-Ablitrex-abliterated-BF16
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- Listado de modelos GGUF en Hugging Face: https://huggingface.co/models?sort=modified&search=gguf
- Peticiones de cuantización y FAQ del autor: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

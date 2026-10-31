# diablomike20/Mistral-7B-Instruct-v0.3-Heretic-GGUF

## Resumen

Mistral-7B-Instruct-v0.3-Heretic-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo 0xA50C1A1/Mistral-7B-Instruct-v0.3-Heretic, realizadas por el usuario mradermacher y republicadas por diablomike20 en Hugging Face. El modelo base es una variante "abliterada" (descensurada) de Mistral 7B Instruct v0.3, un transformer denso de unos 7.250 millones de parámetros entrenado por Mistral AI, al que se le han eliminado los mecanismos de rechazo mediante técnicas de abliteration.

El propósito de este repositorio no es aportar un modelo nuevo, sino facilitar la inferencia local: ofrece cuants desde Q2_K (2,8 GB) hasta f16 (14,6 GB), compatibles con llama.cpp, Ollama, LM Studio y otros runtimes de GGUF. Es relevante para usuarios que buscan un modelo pequeño, con licencia Apache 2.0, sin filtros de alineamiento y ejecutable en hardware de consumo.

Cabe señalar que el repositorio tiene muy poca tracción (0 descargas y 0 likes en el momento de la ficha) y que la model card es esencialmente la plantilla estándar de mradermacher, sin documentación específica sobre el proceso de abliteration aplicado al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only, familia Mistral 7B) |
| Parametros totales | 7.248.023.552 |
| Parametros activos | no disponible (no es MoE; todos los parámetros activos) |
| Longitud de contexto | no disponible (el original Mistral 7B Instruct v0.3 soporta 32.768 tokens, pero no figura en la model card) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (etiquetado "en"; sin documentación adicional) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Mistral 7B Instruct v0.3: un transformer decoder-only denso de 7.248 millones de parámetros. Sobre ese modelo se aplicó un proceso de abliteration (también llamado "decensoring" o "heretic" en la nomenclatura del repositorio), que modifica direccionalmente los pesos para suprimir el comportamiento de rechazo aprendido durante el alineamiento, sin reentrenamiento completo. No se dispone de detalles técnicos sobre el método concreto empleado ni sobre el autor del modelo base.

Sobre el entrenamiento original no hay datos en la model card. Este repositorio no modifica los pesos: se limita a generar cuantizaciones estáticas GGUF (k-quants e i-quants) a partir del modelo base. Existe además una versión con imatrix (matriz de importancia) en mradermacher/Mistral-7B-Instruct-v0.3-Heretic-i1-GGUF, que suele ofrecer mejor calidad a igual tamaño de archivo.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Mistral 7B Instruct v0.3.
- Razonamiento general y resolución de tareas de instrucción estándar de un modelo de 7B.
- Capacidades de código y matemáticas a nivel del modelo base (sin datos publicados en este repo).
- Comportamiento sin filtros: el modelo abliterado tiende a no rechazar peticiones que el modelo original denegaría, lo cual es su característica distintiva.
- Ejecución local eficiente gracias al formato GGUF, con soporte de aceleración en CPU, GPU y híbrido.
- No hay evidencia en la documentación de soporte de tool calling, function calling, visión ni audio (el modelo base v0.3 disponía de tool calling básico, pero este repo no lo documenta).

## Casos de uso

- Chatbots locales sin censura: ejecución en LM Studio u Ollama para conversación multi-turno en entornos offline, aprovechando cuants como Q4_K_M (4,5 GB) que caben en portátiles con 8 GB de RAM.
- Investigación en alineamiento y seguridad: el modelo abliterado sirve como caso de estudio para evaluar la robustez de los filtros de seguridad de modelos alineados y probar guardrails externos.
- Prototipado en hardware de consumo: la gama de cuants permite ajustar el compromiso calidad/tamaño según la GPU disponible, desde Q2_K para máquinas muy limitadas hasta Q8_0 para calidad casi sin pérdida.
- Generación de contenido creativo sin rechazos: escritura de ficción en la que el modelo no interrumpe el flujo con negativas del RLHF original.
- Integración en pipelines con llama.cpp: uso como backend local de LLM para automatizaciones, scripts y aplicaciones que requieren inferencia privada sin enviar datos a APIs externas.
- Evaluación comparativa de cuantizaciones: el conjunto completo de cuants estáticos permite medir la degradación de perplexidad y calidad entre Q2_K y f16 en benchmarks propios.
- Asistente de escritura en inglés offline: redacción, resumen y reescritura de textos con latencia baja en CPU moderna gracias al tamaño contenido de los cuants.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye un gráfico genérico de perplexidad comparativa entre tipos de cuantización (de ikawrakow), sin métricas específicas del modelo. Para el modelo base, Mistral AI publicó resultados de Mistral 7B Instruct v0.3, pero este repositorio no los reproduce ni los actualiza tras la abliteration.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia según cuant: Q2_K ~2,8 GB; Q4_K_M ~4,5 GB; Q6_K ~6,0 GB; Q8_0 ~7,8 GB; f16 ~14,6 GB (más contexto y overhead del runtime, aproximadamente 1-2 GB adicionales).
- Consumer GPUs: cualquier GPU con 6 GB de VRAM (RTX 3060, RTX 4060) ejecuta cómodamente Q4_K_M; con 8-12 GB (RTX 4070/4080) cabe Q8_0 completo en GPU.
- En CPU: viable con 8 GB de RAM usando Q2_K-Q4_K, con velocidades de unos 10-20 tokens/s en CPUs de escritorio modernas; no disponible dato oficial.
- GPU recomendadas para servidor: RTX 3090/4090 (24 GB) permiten servir múltiples instancias o contexto largo; no se requieren A100/H100 para este tamaño.
- Despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y cualquier runtime GGUF. La model card menciona compatibilidad con vLLM y mistral-common en los tags, aunque el formato GGUF apunta principalmente al ecosistema llama.cpp.
- Latencia y throughput: no disponible; al ser un modelo de 7B cuantizado, se esperan respuestas interactivas en GPU de consumo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Particularidad |
|---|---|---|---|---|
| Mistral-7B-Instruct-v0.3-Heretic-GGUF | 7,25B | no disponible (32k en el base) | Apache 2.0 | Abliterado, GGUF multi-cuant |
| Mistral-7B-Instruct-v0.3 (original) | 7,25B | 32.768 tokens | Apache 2.0 | Modelo alineado con rechazos |
| Dolphin 2.9 Llama 3 8B (GGUF) | 8B | 8.192 tokens (extendible) | Apache 2.0 / Llama 3 | Ajuste fino descensurado mediante fine-tuning, no abliteration |
| Llama 3.1 8B Instruct (abliterado, GGUF) | 8B | 128.000 tokens | Llama 3.1 Community | Contexto mucho mayor, licencia más restrictiva |

Frente al original, esta variante pierde los rechazos de seguridad; frente a alternativas descensuradas por fine-tuning (Dolphin), la abliteration suele degradar algo más la calidad general pero no requiere dataset de reentrenamiento.

## Limitaciones y advertencias

- Al ser un modelo abliterado, genera contenido que el modelo original rechazaría, incluyendo potencialmente contenido dañino, ilegal o ofensivo. El usuario asume toda la responsabilidad legal y ética de su uso.
- La abliteration suele degradar la calidad general del modelo (coherencia, razonamiento y precisión) respecto al base; no hay evaluaciones cuantificadas de esa degradación en la model card.
- Riesgo de alucinación típico de modelos de 7B, posiblemente agravado por la abliteration; no apto para tareas que exijan factualidad sin verificación externa.
- Etiquetado solo para inglés; el rendimiento en castellano u otros idiomas no está documentado y puede ser inferior al del modelo original.
- Sin benchmarks publicados: imposible verificar si la abliteration o las cuantizaciones han degradado capacidades de código, matemáticas o razonamiento.
- Repositorio con tracción mínima (0 descargas, 0 likes) y model card genérica: escaso soporte comunitario y trazabilidad limitada del modelo base intermedio (0xA50C1A1).
- La licencia Apache 2.0 no restringe el uso comercial del modelo, pero no exime de responsabilidad por el contenido generado.
- Los cuants de baja calidad (Q2_K, Q3_K_S) presentan degradación notable de perplexidad según el propio gráfico referenciado en la model card.

## Enlaces

- Repositorio de la ficha: https://huggingface.co/diablomike20/Mistral-7B-Instruct-v0.3-Heretic-GGUF
- Modelo base: https://huggingface.co/0xA50C1A1/Mistral-7B-Instruct-v0.3-Heretic
- Cuants con imatrix: https://huggingface.co/mradermacher/Mistral-7B-Instruct-v0.3-Heretic-i1-GGUF
- Página de descarga de mradermacher: https://hf.tst.eu/model#Mistral-7B-Instruct-v0.3-Heretic-GGUF
- FAQ de cuantizaciones: https://huggingface.co/mradermacher/model_requests
- Notas sobre cuants de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Modelo original Mistral 7B Instruct v0.3: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Paper de Mistral 7B: https://arxiv.org/abs/2310.06825

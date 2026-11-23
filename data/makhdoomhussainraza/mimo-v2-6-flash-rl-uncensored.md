# makhdoomhussainraza/MiMo-V2.6-Flash-RL-UNCENSORED

## Resumen

MiMo-V2.6-Flash-RL-UNCENSORED es una versión modificada a nivel de pesos del modelo XiaomiMiMo/MiMo-V2.6-Flash-RL, desarrollado por Xiaomi. El autor de esta variante es el usuario de Hugging Face makhdoomhussainraza, que la distribuye bajo la marca dealignai. El modelo base es un MoE multimodal de 309B parámetros totales y 15B activos, con arquitectura híbrida de atención, codificadores de visión y audio, comprensión de vídeo, contexto de aproximadamente 1M tokens y una cabeza de decodificación especulativa DFlash de 5 capas. La modificación elimina el comportamiento de rechazo (refusal) a nivel de pesos, manteniendo supuestamente intactas las capacidades de codificación, matemáticas, conocimiento, razonamiento y cobertura bilingüe inglés-chino.

El problema que aborda esta variante es la negativa del modelo base a responder ante ciertas categorías de peticiones, impuesta mediante ajuste de cumplimiento. El autor afirma haber eliminado ese comportamiento sin hooks en tiempo de ejecución ni vectores de dirección, entregando un bundle compatible con transformers, vLLM y SGLang. El repositorio se distribuye en precisión nativa (atención FP8 y expertos MXFP4) con un tamaño de 177,8 GB y licencia MIT.

Es relevante ahora porque combina un modelo frontera de escala 309B con capacidades multimodales y de contexto largo, en un formato cuantizado de precisión mixta listo para servir, y porque plantea de forma explícita el debate sobre la eliminación de salvaguardas en modelos abiertos. No obstante, la información pública disponible es escasa: no hay benchmarks independientes, el número de descargas y likes es cero y la model card está redactada por el propio autor de la modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer multimodal con atención híbrida (9 capas globales + 39 de ventana deslizante de 128), codificador visión-lenguaje y codificador de audio |
| Parametros totales | 310.756.322.688 (≈310,8B) |
| Parametros activos | 15B (256 expertos enrutados, top-8, sin experto compartido) |
| Longitud de contexto | ≈1M tokens (según model card) |
| Tipos de cuantizacion | Precisión nativa mixta: atención FP8 y expertos MXFP4; etiquetado como 8-bit |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors (con custom_code, requiere transformers) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) con 256 expertos enrutados y activación top-8 sin experto compartido, lo que da 15B parámetros activos sobre 309B totales. La atención es híbrida: 9 capas con atención global y 39 con ventana deslizante de 128 tokens, disposición que reduce el coste computacional en contextos largos. Incorpora un codificador de visión-lenguaje, un codificador de audio y capacidad de comprensión de vídeo, además de una cabeza de decodificación especulativa DFlash de 5 capas con atención de ventana deslizante, empaquetada junto al modelo para inferencia de alto throughput. El contexto alcanza aproximadamente 1M tokens.

Sobre el entrenamiento del modelo base no se proporciona información en la documentación disponible: no se detallan el número de tokens, la composición del dataset ni si hubo RLHF o DPO, más allá de la indicación del sufijo "RL" en el nombre y de la referencia a un ajuste de cumplimiento. La modificación de esta variante consiste en la eliminación del comportamiento de rechazo a nivel de pesos; el autor declara que no se incluyen artefactos de sondeo, vectores de rechazo, índices de capas objetivo ni registros de intervención en el repositorio. La innovación técnica destacable del bundle es la preservación de la cabeza especulativa DFlash (con 2,09–2,39 tokens aceptados por verificación sobre 7 borradores, según el autor) y el uso de precisión mixta FP8/MXFP4 como formato de distribución.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento con modo de pensamiento conmutable (`enable_thinking: true` / `false`).
- Capacidades de visión: lectura de formas, colores y texto embebido en imágenes, según pruebas del autor.
- Capacidades de audio: resolución de secuencias de tonos (parcial; 2 de 3 tonos en una secuencia de tres, según el autor).
- Comprensión de vídeo.
- Contexto largo de aproximadamente 1M tokens.
- Soporte de agentes y razonamiento multi-paso (etiqueta "agent" en la model card).
- Predicción multi-token mediante la cabeza especulativa DFlash.
- Codificación y matemáticas (capacidades heredadas del modelo base, sin benchmarks propios publicados).
- Cumplimiento de instrucciones sin rechazo en la mayoría de categorías semánticas evaluadas por el autor.

## Casos de uso

- Procesamiento de documentos extensos: con aproximadamente 1M tokens de contexto, el modelo puede ingerir informes completos, expedientes o bases de código y responder preguntas sobre ellos sin fragmentación.
- Análisis de vídeo e imagen para moderación de contenido o catalogación: los codificadores de visión y vídeo permiten describir, etiquetar y extraer texto de material audiovisual en pipelines automatizados.
- Transcripción y análisis de audio en entornos controlados: el codificador de audio permite clasificar o resumir segmentos sonoros, aunque su fiabilidad es parcial según las propias pruebas del autor.
- Generación de código en producción: el modelo base conserva capacidades de codificación y el bundle es compatible con vLLM y SGLang, lo que permite integrarlo en pipelines de CI/CD para revisión y generación de parches.
- Investigación sobre alineación y seguridad: al eliminar el rechazo, sirve como objeto de estudio para medir la eficacia de los mecanismos de seguridad en modelos abiertos y para entrenar clasificadores de contenido.
- Asistencia conversacional multi-turno en inglés y chino: adecuado para atención al cliente o asistentes internos en organizaciones bilingües con contexto largo de conversación.
- Servicio de alto throughput: la cabeza especulativa DFlash y el formato FP8/MXFP4 están orientados a despliegues con requisitos de latencia ajustados.

## Benchmarks y rendimiento

Los únicos datos disponibles proceden de la model card del autor y miden el comportamiento de cumplimiento y la degradación en MMLU respecto al modelo base. No hay benchmarks independientes de MMLU, HumanEval, GSM8K ni de tareas multimodales.

| Metrica | Base | Este modelo | Delta |
|---|---:|---:|---:|
| HarmBench-320, cumplimiento con thinking OFF | rechaza por diseño | 319/320 = 99,69% | no disponible |
| HarmBench-320, cumplimiento con thinking ON | rechaza por diseño | 291/320 = 90,94% | no disponible |
| Rechazos duros en 640 sondas (ambos modos) | no disponible | 6 (todos en thinking ON) | no disponible |
| MMLU 14.042 (test completo, logit-ranked) | 83,56% | 83,41% | -0,14 pp |
| MMLU cluster de ética (6 materias, 3.294 preguntas) | 73,28% | 72,47% | -0,82 pp |
| MMLU cluster de ciberseguridad (5 materias, 657 preguntas) | 83,41% | 83,11% | -0,30 pp |
| Codificador de visión (formas, colores y texto en PNG sintético) | intacto | intacto | — |
| Codificador de audio (2 de 3 tonos en secuencia de tres) | intacto | intacto | — |
| Cabeza DFlash, tokens aceptados por verificación (de 7 borradores) | no disponible | 2,09–2,39 | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 177,8 GB en precisión FP8/MXFP4; se necesita al menos esa cantidad de memoria agregada, más overhead de activaciones y KV cache.
- GPU recomendadas: para servir el modelo completo en un solo nodo se requieren configuraciones multi-GPU de clase H100 o H200 (por ejemplo, 8×H100 80 GB); no es viable en una sola GPU de consumo.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en ninguna GPU consumer actual en su formato nativo. Sería necesaria una cuantización adicional agresiva no publicada, con pérdida de calidad no evaluada.
- Opciones de despliegue: vLLM (loader MiMo V2), SGLang (loader MiMo V2.6) y transformers con custom_code. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La cabeza DFlash está diseñada para decodificación especulativa y el autor reporta 2,09–2,39 tokens aceptados por verificación, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MiMo-V2.6-Flash-RL-UNCENSORED | ≈310,8B | 15B | ≈1M | visión, audio, vídeo | MIT | Hugging Face, 0 descargas |
| XiaomiMiMo/MiMo-V2.6-Flash-RL (base) | ≈310,8B | 15B | ≈1M | visión, audio, vídeo | no disponible en la información | Hugging Face |
| Alternativas de escala similar | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables de otros modelos comparables en la información proporcionada; la comparación con el modelo base se limita a los datos de MMLU y cumplimiento de la tabla de benchmarks.

## Limitaciones y advertencias

- La eliminación del rechazo es deliberada y afecta a categorías sensibles como contenido dañino, cibercrimen, desinformación y derechos de autor; el uso en producción exige filtros externos propios.
- Los benchmarks de cumplimiento los aporta el propio autor de la modificación, sin verificación independiente; deben tratarse como no auditados.
- No hay benchmarks de capacidades (MMLU, HumanEval, GSM8K) medidos de forma independiente; la única cifra de conocimiento es MMLU con una caída de 0,14 pp reportada por el autor.
- Riesgo de alucinación no cuantificado; no se han publicado evaluaciones de veracidad.
- Cobertura lingüística limitada a inglés y chino; el rendimiento en castellano no está documentado.
- El contexto de ~1M tokens puede degradar la calidad en el extremo superior de la ventana; no se publican evaluaciones de aguja en pajar.
- El codificador de audio muestra resolución parcial (2 de 3 tonos) según las pruebas del autor, lo que sugiere fiabilidad limitada en tareas de audio finas.
- La licencia MIT del bundle no exime del cumplimiento de la legislación aplicable sobre contenido generado ni de las políticas de las plataformas de despliegue.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación por terceros.
- El modelo requiere custom_code y versiones específicas de vLLM o SGLang; la compatibilidad con otros frameworks no está garantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/makhdoomhussainraza/MiMo-V2.6-Flash-RL-UNCENSORED
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL
- Sitio del autor de la modificación: https://dealign.ai
- Perfil en X: https://x.com/dealignai
- Ko-fi: https://ko-fi.com/dealignai

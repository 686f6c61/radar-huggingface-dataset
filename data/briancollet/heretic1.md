# briancollet/heretic1

## Resumen
heretic1 es un ajuste fino multi-etapa y multi-merge derivado de DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU, publicado por el usuario briancollet en HuggingFace. El repositorio distribuye principalmente cuantizaciones GGUF (variantes "regular" y "MTP" con doble imatrix) junto con pesos en bfloat16, y declara 26.895.998.464 parámetros reales según sus ficheros safetensors, es decir, unos 26,9 mil millones.

El modelo se presenta como una variante "abliterated"/"uncensored" de la familia Qwen3.8, orientada a escritura creativa, ficción, roleplay, generación de código y razonamiento con modo "thinking". Su propuesta diferencial, según la model card, es reducir el número de tokens de pensamiento entre la mitad y una décima parte respecto al modelo base, manteniendo el detalle de la respuesta y acelerando la generación gracias a variantes MTP (multi-token prediction).

Es relevante porque combina tres elementos poco habituales en un mismo paquete: cuantizaciones listas para hardware de consumo, eliminación declarada de los mecanismos de rechazo de seguridad y una supuesta mejora de benchmarks sobre el modelo base. La licencia declarada es Apache 2.0 y el repositorio ocupa 389 GB. En el momento de la consulta acumula 0 descargas y 0 "likes", por lo que no existe validación comunitaria en la propia ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3.8 según la model card); no se detalla la configuración de capas ni el mecanismo de atención |
| Parámetros totales | 26.895.998.464 (≈26,9 B), dato real de safetensors |
| Parámetros activos | No disponible (no se declara arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF en 4 y 8 bits (se menciona Q4_K_S), variantes "regular" y "MTP" Neo-CODER MAX con doble imatrix (DI-MATRIX); pesos completos en bfloat16 |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) y GGUF |
| Pipeline declarado | image-text-to-text |
| Modelo base | DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU |
| Datasets de entrenamiento | DavidAU/Polar-STRICT-Datasets, DavidAU/F451-STRICT-Datasets |
| Tamaño del repositorio | 389,0 GB |
| Fecha de publicación | 11 de octubre de 2026 (sin actualizaciones posteriores registradas) |

## Arquitectura y entrenamiento
La información disponible describe un transformer denso de aproximadamente 27 B de parámetros, sin especificar número de capas, dimensiones ocultas, tipo de atención ni estrategia de posicionamiento. El pipeline declarado en HuggingFace es image-text-to-text, lo que sugeriría capacidades multimodales, pero la model card no documenta ningún módulo de visión ni tareas de imagen, por lo que este punto queda sin confirmar. Tampoco se indica la ventana de contexto.

El entrenamiento se describe como un proceso de "multi-stage fine tune" combinado con "multi-stage merge", empleando dos métodos propietarios del autor del modelo base: COLD FUSION (componente GAIN combinado con los entrenadores de Unsloth) y Fable Fusion 711. El método GAIN se define como un sistema que modifica dinámicamente el entrenamiento muestra a muestra en tiempo real según aprende el modelo. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron etapas de RLHF, DPO u otro tipo de alineamiento. Los tags incluyen "abliterated" y "heretic", lo que apunta a un proceso de ablación de direcciones de rechazo (eliminación del comportamiento de negativa), aunque no se documenta la metodología concreta. También se declara entrenamiento específico para reducir y reformatear el bloque de pensamiento, y variantes MTP orientadas a acelerar la decodificación.

## Capacidades
- Generación de texto general con razonamiento explícito mediante bloques de pensamiento ("thinking") y, según la model card, tres modos de operación de pensamiento.
- Reducción declarada del tamaño del bloque de pensamiento: entre 1/2 y 1/10 respecto al modelo base, con una mediana aproximada de 2/3 de reducción.
- Escritura creativa, ficción y narrativa en "todos los géneros", según los tags del repositorio.
- Roleplay y conversación multi-turno (tag "conversational").
- Generación de código (tag "coder"); no se especifican lenguajes soportados.
- Predicción multi-token (MTP) en las cuantizaciones marcadas como MTP, orientada a aumentar la velocidad de generación.
- Tool calling / function calling: la model card remite a la pestaña "community" para datos de terceros sobre "el mejor rendimiento en tool calling registrado", afirmación no verificable con la información disponible.
- Capacidades multilingües limitadas a inglés y chino según el campo `language`.
- Comportamiento sin alineamiento de seguridad (modelo "uncensored"/"abliterated"), lo que implica ausencia deliberada de rechazo ante peticiones que otros modelos bloquearían.
- Capacidad multimodal: no confirmada; el pipeline aparece como image-text-to-text pero no hay evidencia documental en la model card.

## Casos de uso
- Escritura creativa y narrativa larga: el modelo está ajustado explícitamente para ficción, relato y construcción de tramas; su reducción de tokens de pensamiento reduce el coste por respuesta en sesiones de generación iterativa con muchas llamadas.
- Roleplay y personajes conversacionales: el ajuste prioriza la coherencia de personaje en diálogos multi-turno, y la ausencia de filtros permite desarrollar personajes moralmente ambiguos sin bloqueos.
- Asistente de código en local: el tag "coder" y el formato GGUF permiten integrarlo con llama.cpp u Ollama en una estación de trabajo con GPU de 24 GB, sin enviar código propietario a servicios externos.
- Generación de datos sintéticos: al ser un modelo sin restricciones de contenido y con licencia Apache 2.0, resulta utilizable para producir corpus de entrenamiento en dominios donde otros modelos aplican rechazos (ficción adulta, escenarios de conflicto, diálogo agresivo).
- Investigación en seguridad y alineamiento: sirve como referencia para estudiar el efecto de la abliteración sobre el comportamiento del modelo, comparando sus respuestas con las del base no abliterado.
- Prototipado de agentes con tool calling: si se confirma el soporte de function calling, podría orquestar llamadas a herramientas en flujos multi-paso desplegados con vLLM o TGI usando los pesos safetensors.
- Atención al cliente y asistentes bilingües inglés-chino: es viable en despliegues internos para esos dos idiomas, pero no para castellano ni otros idiomas no declarados.
- Ejecución totalmente offline en hardware de consumo: las cuantizaciones de 4 bits permiten desplegar el modelo en una única GPU de gama alta sin conexión, útil en entornos con requisitos de soberanía del dato.

## Benchmarks y rendimiento
Los únicos datos disponibles proceden de la propia model card del autor y no se han verificado de forma independiente. Se reproducen a continuación tal cual se declaran:

| Benchmark | heretic1 4 bits | heretic1 8 bits | Modelo base (Qwen 3.8 27B) |
|---|---|---|---|
| ARC-C | 719 | 735 | No indicado (el autor afirma que heretic1 está 144 puntos por encima) |
| ARC-E | Por encima de 880 | Por encima de 880 | No disponible |

Afirmaciones adicionales del autor, sin cifras desglosadas:
- El modelo supera al base Qwen 3.8 27B en los 7 benchmarks que el autor considera críticos, tanto en 4 como en 8 bits.
- Supera también los 7 benchmarks de Qwen3.6-35B-A3B, Qwen 3.6 27B y Qwen 3.5 27B, según el autor.
- Se declara explícitamente "ZERO benchmaxing" y se remite a la pestaña "community" para benchmarks de terceros, incluidos datos de tool calling.
- No se publican resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark estándar identificable en la información disponible.

## Requisitos de hardware
Las cifras de VRAM son estimaciones derivadas del recuento real de parámetros (26,9 B) y no provienen de mediciones publicadas.

- Pesos en bfloat16: aproximadamente 54 GB solo para los pesos, más caché KV. Requiere GPU de 80 GB (A100 80 GB, H100 80 GB) o dos aceleradores de 40 GB.
- Cuantización de 8 bits: aproximadamente 27-30 GB de pesos; con contexto y overhead, del orden de 32-40 GB. Encaja en A100 40 GB, L40S 48 GB o RTX A6000 48 GB.
- Cuantización de 4 bits: aproximadamente 14-16 GB de pesos; con contexto moderado puede caber en una RTX 4090 o RTX 3090 de 24 GB, y de forma ajustada en GPU de 16 GB reduciendo contexto.
- CPU y memoria unificada: las variantes GGUF de 4 bits pueden ejecutarse con llama.cpp sobre 32 GB de RAM o en equipos Apple Silicon con 32 GB o más de memoria unificada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp o llama-cpp-python para los GGUF; vLLM, TGI o SGLang para los pesos safetensors; Unsloth para reentrenamiento o ajuste adicional.
- Latencia y throughput: no disponibles. La model card afirma que las variantes MTP aceleran la generación y que la reducción de tokens de pensamiento disminuye el tiempo total por respuesta, pero no se aportan tokens por segundo ni latencias medidas.
- El repositorio completo ocupa 389 GB, por lo que conviene descargar únicamente la cuantización necesaria.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| heretic1 | 26,9 B | No disponible | Apache 2.0 | safetensors (bf16) y GGUF 4/8 bits |
| Qwen 3.8 27B (base del linaje) | ~27 B | No disponible | No disponible | Referenciado en la model card |
| Qwen3.6-35B-A3B | ~35 B totales / ~3 B activos según nomenclatura (MoE) | No disponible | No disponible | Referenciado en la model card |
| Qwen 3.6 27B | ~27 B | No disponible | No disponible | Referenciado en la model card |
| Qwen 3.5 27B | ~27 B | No disponible | No disponible | Referenciado en la model card |

No se dispone de datos de contexto, licencia ni benchmarks verificables de los modelos comparados, más allá de la afirmación del autor de que heretic1 los supera en los 7 benchmarks que considera críticos. La comparación de rendimiento cuantitativo no está disponible.

## Limitaciones y advertencias
- Modelo "abliterated"/"uncensored": se ha eliminado deliberadamente el comportamiento de rechazo, por lo que puede generar contenido dañino, ilegal, violento o sexual sin filtros. No es apto para aplicaciones de cara al público sin una capa de moderación externa.
- Riesgo de alucinación: no se han publicado evaluaciones independientes de fidelidad factual, y la reducción agresiva de tokens de pensamiento puede disminuir la verificación interna antes de responder.
- Idiomas: solo inglés y chino están declarados. El rendimiento en castellano no está respaldado y previsiblemente será inferior.
- Contexto desconocido: no se documenta la ventana de contexto, lo que impide planificar despliegues con documentos largos o conversaciones extensas.
- Sesgos: no hay documentación sobre sesgos, composición del dataset ni proceso de filtrado. Los datasets Polar-STRICT y F451-STRICT no están descritos en la información disponible.
- Cadena de licencias: el repositorio declara Apache 2.0, pero el modelo base pertenece a otro autor y su licencia no se indica. Conviene verificar los términos del modelo base y del linaje Qwen antes de un uso comercial.
- Benchmarks no verificados: las cifras (ARC-C 735, ARC-E superior a 880) proceden exclusivamente del autor del modelo base. La afirmación de estar en la "zona de inteligencia" de OpenAI, Claude y Gemini es una interpretación comercial, no un resultado comparable publicado.
- Publicación sin tracción: 0 descargas y 0 "likes" en la ficha, sin actualizaciones desde su creación, lo que implica ausencia de validación por parte de la comunidad.
- Tamaño del repositorio: 389 GB, con riesgo de descargas parciales costosas si no se selecciona la cuantización concreta.
- Soporte multimodal incierto: el pipeline declarado es image-text-to-text pero no hay ninguna evidencia documental que lo respalde.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/briancollet/heretic1
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Repositorio de referencia del método COLD FUSION / Fable Fusion 711: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Dataset declarado: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset declarado: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
- Pestaña de comunidad del modelo (benchmarks de terceros citados por el autor): https://huggingface.co/briancollet/heretic1/discussions
- Unsloth, framework de entrenamiento mencionado en la model card: https://github.com/unslothai/unsloth
- Papers académicos: no disponible
- Demos o espacios asociados: no disponible

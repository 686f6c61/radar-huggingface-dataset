# danilburger123/Gemma4-12B-QAT-Uncensored-HauhauCS-Balanced

## Resumen

Gemma4-12B-QAT-Uncensored-HauhauCS-Balanced es una distribución GGUF del modelo google/gemma-4-12B-it (Google DeepMind), publicada por el usuario danilburger123 a partir del trabajo de desactivación de rechazos («uncensoring») atribuido a HauhauCS. Se trata de un transformer denso de 11.907.350.576 parámetros (~11,9B) con ventana de contexto de 262.144 tokens (256K), capacidades multimodales de entrada imagen-texto y una única cuantización Q4_K_M, coherente con el entrenamiento con conciencia de cuantización (QAT) a ~4 bits del modelo base.

El problema que aborda es doble: por un lado, elimina los rechazos del modelo original (el autor declara 0 rechazos en 465 pruebas automatizadas y manuales); por otro, distribuye el modelo en un formato ejecutable en hardware de consumo. Incluye una cabeza MTP (multi-token prediction) para decodificación especulativa que, según el autor, proporciona aproximadamente un 60% más de velocidad de generación con salida idéntica verificada token a token.

Su relevancia es acotada pero concreta: es una de las primeras adaptaciones publicadas sobre Gemma 4 12B en formato GGUF con soporte de visión y decodificación especulativa empaquetada. El repositorio es de creación muy reciente (26 de octubre de 2026), con 0 descargas y 0 «likes» en el momento de redactar esta ficha, por lo que no existe validación independiente de las afirmaciones del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de google/gemma-4-12B-it) |
| Parámetros totales | 11.907.350.576 (~11,9B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantización | Q4_K_M (principal, 6,9 GB); mmproj de visión en BF16 (168 MB); cabeza MTP en GGUF (242 MB) |
| Idiomas soportados | Inglés (`en`) declarado en la model card |
| Licencia | Gemma (términos de uso de Google) |
| Formato de pesos | GGUF (texto Q4_K_M + mmproj BF16 + drafter MTP) |

Otros datos: tamaño del repositorio 7,8 GB; pipeline `image-text-to-text`; etiquetas del autor: `uncensored`, `vision`, `multimodal`, `agentic`, `coding`, `creative-writing`, `roleplay`, `rp`, `conversational`.

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 4 12B Instruct, un transformer denso de ~11,9B parámetros con soporte nativo de entrada multimodal (imagen y texto) y 256K tokens de contexto. El modelo base fue entrenado por Google DeepMind con cuantización con conciencia de entrenamiento (QAT) orientada a ~4 bits, motivo por el cual el autor justifica publicar únicamente Q4_K_M: según su model card, cuantizaciones de mayor precisión incrementan el tamaño sin ganancia real de calidad. No se documenta en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base empleó RLHF, DPO u otras técnicas de alineamiento.

Sobre esa base, el autor aplica un proceso de eliminación de rechazos (denominado «HauhauCS») sin modificar, según declara, datasets ni capacidades: «sin cambios en datasets ni capacidades, 100% de lo que los autores originales pretendían, solo sin los rechazos». La variante **Balanced** se describe como un desbloqueo completo optimizado para código agéntico, razonamiento, escritura creativa y tareas críticas de fiabilidad, con razonamiento previo a la respuesta; se menciona una variante **Aggressive** que, según el autor, no es necesaria tras las pruebas actuales. La innovación técnica destacable es la inclusión de una cabeza de predicción multi-token (MTP) procedente del release de Gemma 4 de Unsloth, que actúa como drafter de decodificación especulativa en llama.cpp (`--spec-type draft-mtp`), con verificación de cada token propuesto para preservar la calidad. El autor también publica parámetros de muestreo propios (temperature 0.6, top_k 64, top_p 0.9, min_p 0.05, repeat_penalty 1.1), distintos de los valores por defecto de Gemma.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 262.144 tokens.
- Razonamiento previo a la respuesta (el autor indica que «razona antes de responder»); no se detalla si existe un modo *thinking* explícito separable.
- Generación de código, incluyendo flujos agénticos según la etiqueta `agentic` del autor; no se documenta soporte formal de *tool calling* / *function calling*.
- Entrada de imágenes (image-text-to-text) mediante el proyector multimodal `mmproj` en BF16.
- Escritura creativa y *roleplay*, con estilos y formatos conversacionales sostenidos.
- Operación sin rechazos: 0/465 en las pruebas del autor; se advierte que un número reducido de prompts límite deriva en la primera petición pero cumple al reformular.
- Decodificación especulativa mediante cabeza MTP (~60% más rápida según el autor, medida únicamente en llama.cpp).
- Multilingüe: no acreditado; la model card solo declara inglés.

## Casos de uso

- **Escritura creativa y narrativa larga**: con 256K tokens de contexto puede mantener arcos narrativos, biblias de personajes y continuidad estilística a lo largo de decenas de miles de palabras sin perder referencias previas.
- **Roleplay y personajes conversacionales**: la variante Balanced está ajustada para mantener el personaje y no deflectar ante situaciones narrativas adultas o conflictivas, algo que el modelo base tiende a evitar.
- **Asistencia a la programación en local**: el tamaño Q4_K_M (6,9 GB) permite ejecutarlo en una GPU de consumo y usarlo como asistente de código en IDE mediante llama.cpp o LM Studio, sin enviar código a servicios externos.
- **Procesamiento de documentos con imágenes**: al cargar el `mmproj`, puede transcribir y razonar sobre capturas, diagramas, tablas escaneadas o interfaces de usuario dentro de un mismo contexto largo.
- **Investigación sobre alineamiento y rechazos**: sirve como contrapunto experimental frente al modelo base para estudiar cómo varía la tasa de rechazo y la calidad tras el proceso de *abliteration*, comparando ambas versiones con los mismos prompts.
- **Generación de contenido para ficción interactiva o videojuegos**: integrable en motores narrativos vía API compatible con OpenAI (`endpoints_compatible`), con la latencia reducida por MTP como ventaja en respuestas en tiempo real.
- **Análisis de corpus extensos en una sola pasada**: clasificación, resumen o extracción de información sobre volúmenes de hasta ~200.000 tokens efectivos, sin necesidad de pipelines RAG.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta MMLU, HumanEval, GSM8K ni ninguna otra métrica estándar, ni comparaciones cuantitativas con el modelo base.

| Métrica | Resultado | Fuente |
|---|---|---|
| Rechazos en pruebas del autor | 0/465 | Model card (pruebas automatizadas y manuales propias, sin metodología publicada) |
| Aceleración con decodificación especulativa MTP | ~60% más rápido | Model card (medido solo en llama.cpp, sin valores absolutos de tokens/s) |
| Benchmarks académicos (MMLU, HumanEval, GSM8K, etc.) | No disponible | — |

## Requisitos de hardware

- **VRAM estimada (texto, Q4_K_M)**: pesos de 6,9 GB; con overhead de contexto y caché KV, un mínimo práctico de ~8-10 GB de VRAM. Para contexto muy largo (decenas de miles de tokens) el consumo de caché KV crece de forma proporcional; no se dispone de cifras exactas publicadas.
- **VRAM estimada (multimodal)**: añadir ~168 MB del `mmproj` en BF16, más el coste de procesar la imagen.
- **VRAM estimada (con MTP)**: añadir ~242 MB del drafter; el ahorro de tiempo suele compensar el coste de memoria.
- **GPU de consumo**: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 / 4070 Ti 12 GB, RTX 4080 y RTX 4090 (24 GB), así como en GPUs AMD o Intel con suficiente VRAM a través de llama.cpp.
- **GPU de datacenter**: A100 40/80 GB, H100, L40S o similares, útiles si se necesita contexto máximo o varios usuarios concurrentes.
- **Multi-GPU**: el autor advierte de cuelgues de Gemma 4 en el modo *tensor-split* de LM Studio; recomienda una sola GPU, *layer-split* o prioridad por orden.
- **Despliegue**: llama.cpp (`llama-server` / `llama-cli`), LM Studio, Jan, koboldcpp y otros runtimes GGUF. El endpoint es compatible con la API de OpenAI.
- **Latencia y throughput**: no disponibles en valores absolutos (tokens/s). Solo se declara una mejora relativa de ~60% al activar MTP.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Cuantización | Rechazos | MTP | Licencia |
|---|---|---|---|---|---|---|---|
| Gemma4-12B-QAT-Uncensored-HauhauCS-Balanced | ~11,9B denso | 262.144 | Sí (mmproj) | Q4_K_M GGUF | 0/465 según autor | Sí (incluido) | Gemma |
| google/gemma-4-12B-it (base) | ~11,9B denso | 262.144 | Sí | Safetensors y ecosistema oficial | Alineado (rechaza por defecto) | No documentado | Gemma |
| Otras variantes uncensored de Gemma 4 12B en GGUF | ~11,9B denso | 262.144 (heredado) | No disponible | No disponible | No disponible | No disponible | Gemma |

No se dispone de datos de benchmarks independientes que permitan comparar calidad entre estas variantes; la comparación se limita a características técnicas y de licencia.

## Limitaciones y advertencias

- **Contenido sin filtro**: el modelo está deliberadamente desprovisto de rechazos. Puede producir contenido violento, sexual, ilegal o dañino; la responsabilidad legal y ética del despliegue recae íntegramente en quien lo opera.
- **Licencia Gemma**: los términos de uso de Google incluyen una política de uso prohibido que sigue aplicando a los derivados. El uso comercial está permitido por la licencia, pero el uso indebido puede vulnerar sus cláusulas; conviene revisar el texto completo antes de producción.
- **Sesgos heredados**: al no documentarse un reentrenamiento, el modelo arrastra los sesgos del base Gemma 4 12B, sin que el proceso de *abliteration* los corrija.
- **Alucinación**: sin datos de benchmarks ni evaluaciones de fidelidad, no hay evidencia de que el proceso de desbloqueo preserve la calibración del modelo original. El autor afirma que las capacidades son idénticas, pero no aporta mediciones.
- **Idioma**: solo se declara inglés. El rendimiento en castellano no está verificado y, aunque Gemma suele tener competencia multilingüe, esta variante no lo acredita.
- **Validación nula de la comunidad**: 0 descargas y 0 «likes» en el momento de la ficha; publicación del 26 de octubre de 2026. No existe retroalimentación independiente sobre calidad o estabilidad.
- **Una sola cuantización**: solo se distribuye Q4_K_M. No hay opciones de mayor precisión (Q6, Q8, BF16) para quienes necesiten máxima fidelidad, ni cuantizaciones menores para hardware muy limitado.
- **Caveat de infraestructura**: cuelgues reportados por el autor con *tensor-split* en LM Studio; requiere configuración de una sola GPU o *layer-split*.
- **MTP poco validado**: la aceleración del 60% se probó únicamente en llama.cpp y sin publicar metodología ni cifras absolutas; puede no reproducirse en otros runtimes ni en todos los hardware.
- **Muestreo no estándar**: los parámetros recomendados (temperature 0.6, top_k 64, min_p 0.05) son parte del ajuste del autor; usar los valores por defecto de Gemma puede degradar el comportamiento previsto.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/danilburger123/Gemma4-12B-QAT-Uncensored-HauhauCS-Balanced)
- [Modelo base: google/gemma-4-12B-it](https://huggingface.co/google/gemma-4-12B-it)
- [Discord del autor](https://discord.gg/SZ5vacTXYf)
- Cabeza MTP: procedente del release de Gemma 4 de Unsloth (sin enlace directo en la model card)
- Paper, blog o repositorio de referencia sobre el proceso HauhauCS: no disponible en la información proporcionada

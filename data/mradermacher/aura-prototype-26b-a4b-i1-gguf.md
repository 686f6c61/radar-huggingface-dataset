# mradermacher/Aura-Prototype-26B-A4B-i1-GGUF

## Resumen

Aura-Prototype-26B-A4B-i1-GGUF es una recopilación de cuantizaciones en formato GGUF generada por mradermacher a partir del modelo base EldritchLabs/Aura-Prototype-26B-A4B. No se trata por tanto de un modelo entrenado por el autor del repositorio, sino de una conversión y cuantización en varios niveles de precisión destinada a su ejecución local con llama.cpp y herramientas compatibles. El recuento real de parámetros del repositorio safetensors asociado es de 25.971.339.550 parámetros (aproximadamente 25,97 mil millones), y el repositorio GGUF ocupa 64,7 GB en total al incluir 24 variantes de cuantización distintas.

La nomenclatura del nombre ("26B-A4B") sugiere una arquitectura de mezcla de expertos (MoE) con alrededor de 26.000 millones de parámetros totales y aproximadamente 4.000 millones activos por token, aunque este dato no se confirma de forma explícita en la información disponible. El modelo base se distribuye bajo la etiqueta temática "conversational" y las cuantizaciones se han generado con el método de imatrix (matriz de importancia por capas), lo que habitualmente mejora la calidad de los formatos de baja precisión frente a una cuantización ingenua.

La relevancia de esta ficha radica en que es la única vía práctica de ejecución local documentada para este modelo: al no existir pesos oficiales en GGUF publicados por EldritchLabs, el repositorio de mradermacher cubre un rango de cuantizaciones desde IQ1_S (aproximadamente 1,6 bits por peso) hasta Q6_K, lo que permite desplegarlo tanto en GPUs de consumo con poca VRAM como en equipos con 24 GB o más.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No confirmada explícitamente; la nomenclatura "A4B" apunta a mezcla de expertos (MoE). "no disponible" como confirmación oficial |
| Parametros totales | 25.971.339.550 (25,97 B) |
| Parametros activos | Aproximadamente 4 B según la nomenclatura del nombre; no confirmado en la información disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, small-IQ4_NL, IQ4_XS, Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (24 variantes, todas con imatrix) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |
| Tamano del repositorio | 64,7 GB |
| Metodo de cuantizacion | imatrix / weighted (indicado en la model card y en los tags) |
| Compatibilidad | endpoints_compatible, conversational (tags declarados) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, los datos de entrenamiento, el número de tokens procesados, la composición del dataset ni si hubo fases de RLHF, DPO o ajuste por instrucciones. La model card del repositorio de cuantizaciones es mínima: únicamente indica que son cuantizaciones "weighted/imatrix" del modelo EldritchLabs/Aura-Prototype-26B-A4B. La única inferencia razonable es la que se extrae de la nomenclatura del nombre del modelo base: un total de ~26 B de parámetros con ~4 B activos, patrón típico de las arquitecturas MoE con enrutado por token.

La innovación técnica destacable en este repositorio no está en el entrenamiento sino en el proceso de cuantización: el uso de matrices de importancia (imatrix) calculadas sobre un corpus de calibración permite ponderar los errores de cuantización según la relevancia de cada peso, lo que se traduce en una pérdida de calidad menor en los formatos agresivos (IQ1, IQ2, IQ3). Los metadatos `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf` indican una conversión estándar desde pesos HuggingFace con la versión 2 del pipeline de cuantización de llama.cpp. El campo `skip_mmproj: 1` sugiere que el modelo base podría incluir un proyector multimodal que no se ha distribuido en este repositorio, pero no hay confirmación al respecto.

## Capacidades

- Generación de texto conversacional: el modelo base está etiquetado como "conversational", por lo que el uso previsto es el diálogo multi-turno.
- Razonamiento y generación de código: capacidad esperable por el tamaño y la categoría del modelo, pero no verificada con benchmarks en la información disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declara ningún conjunto de idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles. El campo `skip_mmproj: 1` podría indicar la existencia de un componente multimodal en el modelo original, pero los pesos distribuidos aquí no lo incluyen.
- Compatibilidad con endpoints compatibles con la API de OpenAI: el tag `endpoints_compatible` así lo indica para el formato GGUF.

## Casos de uso

- Asistente conversacional autoalojado: dado que el modelo base está etiquetado como conversacional y existe una versión Q4_K_M de aproximadamente 15-16 GB, puede desplegarse en una estación de trabajo con una RTX 4090 o similar para dar servicio de chat interno sin enviar datos a terceros.
- Prototipado e investigación sobre arquitecturas MoE: el rango de 24 cuantizaciones permite estudiar cómo degrada la calidad cada nivel de precisión sobre el mismo modelo, desde IQ1_S hasta Q6_K, con un coste de hardware muy variable.
- Generación de código en entornos con GPU limitada: las variantes IQ3_M, IQ4_XS o Q4_K_S (aproximadamente 12-14 GB) permiten ejecutar el modelo en GPUs de 16 GB para tareas de autocompletado y revisión de código, sin depender de APIs externas.
- Despliegue en portátiles o equipos sin GPU dedicada: las cuantizaciones IQ2/IQ3 en CPU con llama.cpp u Ollama hacen viable la inferencia en máquinas con 16-32 GB de RAM, a costa de una latencia mucho mayor.
- Nodos de inferencia en pipelines batch: la compatibilidad declarada con endpoints tipo OpenAI permite integrar el modelo en flujos existentes (por ejemplo, clasificación o resumen de documentos) sustituyendo una API comercial por un servidor local.
- Evaluación comparativa de cuantizaciones en producción: al ofrecer el mismo modelo en 24 formatos, es un banco de pruebas útil para decidir el punto óptimo entre VRAM, latencia y calidad antes de fijar una configuración definitiva.
- Fine-tuning ligero posterior no aplicable directamente: al distribuirse solo en GGUF, este repositorio no sirve como punto de partida para entrenamiento; para ello habría que acudir al modelo base en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluación en la model card, en los tags ni en los resultados de búsqueda consultados. Tampoco se han encontrado mediciones de latencia o throughput para las distintas cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones calculadas a partir del recuento real de 25,97 B de parámetros; no son cifras publicadas por el autor):
  - IQ1_S: ~5-6 GB
  - IQ2_M / Q2_K: ~8-9 GB
  - IQ3_M / Q3_K_M: ~12-13 GB
  - IQ4_XS / Q4_K_S: ~13-15 GB
  - Q4_K_M: ~15-16 GB
  - Q5_K_M: ~18-19 GB
  - Q6_K: ~21-22 GB
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para Q4_K_M y Q5_K_M; A100 40 GB, L40S 48 GB o H100 para Q6_K con contexto largo y mayor batch; GPUs de 12-16 GB (RTX 4080, RTX 4070 Ti Super, RTX 3060 12 GB para IQ2/IQ3) para las variantes de baja precisión.
- ¿Cabe en GPU de consumo? Sí. Las variantes IQ1_S a Q3_K_M caben en GPUs de 8-12 GB; Q4_K_M y Q5_K_M en 16-24 GB; Q6_K requiere 24 GB y deja poco margen para el contexto, por lo que conviene descargar capas a CPU (offloading parcial).
- Opciones de despliegue: llama.cpp (llama-server), Ollama, LM Studio, koboldcpp, llama-cpp-python y servidores compatibles con la API de OpenAI. vLLM y TGI admiten GGUF, aunque con soporte más limitado para los formatos IQ más agresivos.
- Latencia y throughput estimados: no disponible. Dependerán del grado de offloading a CPU, del ancho de banda de memoria de la GPU y del número de tokens de contexto efectivos.

## Comparativa con modelos similares

Los datos de los modelos de la columna comparativa proceden de información pública general sobre dichos modelos y no han sido verificados en la búsqueda realizada para esta ficha. Se incluyen únicamente como referencia de categoría.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad GGUF |
|---|---|---|---|---|---|
| Aura-Prototype-26B-A4B (via mradermacher) | 25,97 B | ~4 B (según nomenclatura, no confirmado) | no disponible | no disponible | Sí, 24 cuantizaciones imatrix |
| Qwen3-30B-A3B | ~30,5 B | ~3,3 B | 32 k nativo, 128 k con YaRN | Apache 2.0 | Sí, amplia |
| Mixtral 8x7B | ~46,7 B | ~12,9 B | 32 k | Apache 2.0 | Sí, amplia |
| DeepSeek-V2-Lite | ~15,7 B | ~2,4 B | 32 k | DeepSeek License | Sí, limitada |

La ventaja principal de Aura-Prototype-26B-A4B frente a estas alternativas es la disponibilidad inmediata de un rango de cuantización excepcionalmente amplio (desde IQ1_S hasta Q6_K); su desventaja es la ausencia total de información publicada sobre licencia, idiomas, contexto y rendimiento, lo que complica su adopción en entornos de producción regulados.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Es un bloqueo potencialmente crítico para cualquier despliegue en producto.
- Ausencia de benchmarks: no hay ninguna evaluación publicada que permita estimar la calidad real del modelo base, ni siquiera en las cuantizaciones de mayor precisión.
- Idiomas no declarados: se desconoce si el modelo rinde correctamente en castellano o si su entrenamiento se centró en inglés.
- Contexto desconocido: sin ventana de contexto publicada, el diseño de aplicaciones con documentos largos es especulativo.
- Riesgo de alucinación: no cuantificado y, dado que no hay evaluaciones, no puede acotarse. Debe asumirse el comportamiento típico de un modelo conversacional sin verificación factual.
- Sesgos: no documentados por el autor. Al no haber información sobre la composición del dataset de entrenamiento, no es posible anticipar sesgos de género, raza, idioma o dominio.
- Degradación por cuantización: las variantes IQ1_S, IQ1_M e IQ2_XXS, aunque generadas con imatrix, implican pérdidas de calidad apreciables. Para producción se recomienda Q4_K_M o superior salvo que la restricción de VRAM sea absoluta.
- Repositorio sin tracción: 0 descargas y 0 "likes" en el momento de la consulta, lo que reduce la probabilidad de que otros usuarios hayan validado el comportamiento de estas cuantizaciones.
- Posible componente multimodal omitido: el campo `skip_mmproj: 1` sugiere que el modelo original podría incluir un proyector multimodal no distribuido aquí. Si se esperaba capacidad de visión, no está disponible en este repositorio.
- Formato GGUF únicamente: no permite fine-tuning directo, solo inferencia. Para reentrenamiento hay que recurrir al modelo base en safetensors.
- Nombre "Prototype": la propia denominación del modelo base indica carácter experimental y no una versión estable pensada para producción.
- Fecha de creación futura: los metadatos indican 2026-09-18 como fecha de creación, lo que debe tenerse en cuenta al evaluar la vigencia y trazabilidad del repositorio.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/Aura-Prototype-26B-A4B-i1-GGUF
- Modelo base: https://huggingface.co/EldritchLabs/Aura-Prototype-26B-A4B
- Búsqueda web realizada: los resultados obtenidos no guardan relación con el modelo (temas de cursores para escritorio y herramientas de conversión de cursores), por lo que no se incluyen. No se han encontrado papers, blogs, repositorios ni demos adicionales sobre Aura-Prototype-26B-A4B en la información proporcionada.

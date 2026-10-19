# mradermacher/Qwen3.5-13B-Star-Trek-TNG-DS9-Heretic-Uncensored-Thinking-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF estáticas del modelo DavidAU/Qwen3.5-13B-Star-Trek-TNG-DS9-Heretic-Uncensored-Thinking, publicadas por mradermacher. No es un modelo entrenado desde cero: es una derivación del fine-tune de DavidAU sobre Qwen3.5-13B, orientada a escritura creativa, ficción, generación de tramas y roleplay, con modificaciones de tipo heretic/abliterated para reducir los rechazos del modelo base.

El modelo tiene 12.413.584.128 parámetros (12,4 B), licencia Apache 2.0 y soporte declarado de inglés y chino. Se distribuye en cuantizaciones que van desde Q2_K (5,3 GB) hasta Q8_0 (13,3 GB), lo que permite ejecutarlo en GPU de consumo con llama.cpp u Ollama, aunque la calidad y la VRAM necesaria varían bastante según el quant elegido.

Su relevancia actual está en el nicho de modelos locales sin censura para ficción y roleplay: ofrece un tamaño manejable, modo "Thinking" según el nombre y una temática explícita de Star Trek TNG/DS9. Ahora bien, cuenta con muy poca validación comunitaria (335 descargas y 2 likes), no publica benchmarks y no documenta la longitud de contexto ni los detalles de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible; el modelo base es Qwen3.5-13B y la model card no detalla si es transformer denso, MoE o híbrido |
| Parámetros totales | 12.413.584.128 (12,4 B) |
| Parámetros activos | No aplica / no disponible; no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF: Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | Inglés (en) y chino (zh), según la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base se asocia a bfloat16 en los tags |
| Modelo base | DavidAU/Qwen3.5-13B-Star-Trek-TNG-DS9-Heretic-Uncensored-Thinking |
| Tamaño del repositorio | 88,7 GB |
| Descargas / likes | 335 / 2 |
| Fecha de creación | 2026-03-29 |
| Última actualización | 2026-10-18 |

## Arquitectura y entrenamiento

No se han publicado detalles sobre la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. El repositorio es una derivación de cuantización: DavidAU realizó el fine-tune sobre Qwen3.5-13B y mradermacher generó los ficheros GGUF estáticos con llama.cpp. Los tags `heretic`, `abliterated` y `uncensored` indican una intervención deliberada para reducir las direcciones de rechazo del modelo, pero no se documenta la metodología exacta ni el alcance de esa modificación.

La model card menciona una variante separada con cuantizaciones ponderadas/imatrix en el repositorio `i1-GGUF`, pensada para obtener más calidad a tamaños similares. También se incluyen ficheros `mmproj` descritos como "multi-modal supplement", lo que apunta a algún tipo de soporte multimodal en el ecosistema llama.cpp, aunque no se especifica si cubre visión, audio u otra modalidad.

## Capacidades

- Generación de texto narrativo y creativo: relatos, novelas, escenas, diálogos y descripciones.
- Escritura de ficción por géneros: ciencia ficción, romance y otros géneros, según los tags del autor.
- Generación de tramas y subtramas: esquemas argumentales, conflictos, arcos de personajes y giros narrativos.
- Continuación de escenas y roleplay: conversaciones multi-turno con personajes, útil para ficción interactiva.
- Modo "Thinking": el nombre del modelo sugiere un modo de razonamiento explícito, pero no se documenta cómo activarlo ni qué formato de prompt requiere.
- Reducción de rechazos: el fine-tune heretic/abliterated puede generar contenido que el modelo base rechazaría, incluyendo material violento o sexual.
- Idiomas: inglés y chino documentados; no se declara soporte oficial de español.
- Multimodal: la presencia de ficheros `mmproj` sugiere soporte multimodal en llama.cpp, sin detalle de modalidades.
- Tool calling / function calling: no documentado en la información disponible.
- Uso como agente o razonamiento multi-paso: no documentado; el enfoque declarado es creativo, no agéntico.

## Casos de uso

- Escritura de novelas y relatos largos: el modelo puede generar capítulos, continuar escenas y mantener un estilo narrativo concreto. Es adecuado por su fine-tune orientado a ficción y prosa vívida, aunque la longitud de contexto no esté documentada y haya que validar la coherencia en textos largos.
- Roleplay interactivo con personajes de Star Trek TNG/DS9: sirve para construir diálogos y situaciones inspiradas en esas series, con un tono desenfadado y sin los rechazos habituales del modelo base. Requiere revisar la propiedad intelectual si se comercializa el contenido.
- Generación de tramas y subtramas para guiones o videojuegos: puede producir esquemas de conflicto, arcos secundarios y giros argumentales. Es útil en fases de ideación porque está entrenado específicamente para `plot generation` y `sub-plot generation`.
- Asistente de worldbuilding: permite crear fichas de personajes, cronologías, reglas de un universo ficticio y relaciones entre facciones. Su orientación a ficción y `storytelling` encaja con tareas de consistencia narrativa.
- Reescritura y mejora de prosa: puede reformular descripciones, intensificar el tono o proponer variantes de una escena. El tag `vivid prosing` indica que el fine-tune busca precisamente ese tipo de escritura sensorial.
- Prototipado local de chatbots de ficción sin API: con un GGUF Q4_K_M o Q5_K_M se puede desplegar en llama.cpp u Ollama en un equipo de 16-24 GB de VRAM, manteniendo los datos en local.
- Generación de contenido para juegos de rol de mesa: NPCs, diálogos, rumores, descripciones de lugares y ramas de aventura. Es un uso realista para un modelo de 12,4 B ejecutado en local.
- Investigación sobre abliteration y seguridad: permite estudiar cómo cambia la tasa de rechazos y el comportamiento en prompts sensibles. No hay benchmarks publicados, así que cualquier evaluación comparativa tendría que hacerse con un protocolo propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

| Cuantización | Tamaño de pesos | VRAM estimada para inferencia* |
|---|---:|---:|
| Q2_K | 5,3 GB | ~6-8 GB |
| Q3_K_M | 6,4 GB | ~7-9 GB |
| IQ4_XS | 7,2 GB | ~8-10 GB |
| Q4_K_M | 7,8 GB | ~9-11 GB |
| Q5_K_M | 9,0 GB | ~10-12 GB |
| Q6_K | 10,3 GB | ~12-14 GB |
| Q8_0 | 13,3 GB | ~15-17 GB |

\*Estimación propia a partir del tamaño de los pesos, añadiendo una caché KV moderada. La longitud de contexto no está documentada, por lo que la VRAM puede crecer bastante con contextos largos.

- GPU de 24 GB (RTX 3090, RTX 4090, A10G, L4): pueden ejecutar Q8_0 y Q6_K con contexto moderado; Q4_K_M deja más margen para contexto largo.
- GPU de 16 GB (RTX 4080, RTX 4060 Ti 16 GB, A4000): Q5_K_M y Q4_K_M son las opciones más equilibradas; Q6_K puede quedar justo.
- GPU de 12 GB (RTX 3060 12 GB, RTX 4070): IQ4_XS o Q4_K_S; Q4_K_M puede requerir offload parcial de capas a CPU.
- GPU de 8 GB (RTX 3070, RTX 4060): Q2_K o Q3_K_S con offload parcial; la calidad se resiente y la velocidad baja.
- CPU: Q4_K_M con llama.cpp y 16 GB de RAM es viable, con throughput bajo. Para uso interactivo se recomienda GPU.
- Despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui y llama-cpp-python son las vías naturales para GGUF. vLLM tiene soporte GGUF experimental y puede no cubrir todos los tipos de quant; TGI no es la opción habitual para GGUF.
- Latencia y throughput: no hay datos publicados; dependen de la GPU, del quant y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Formato / disponibilidad |
|---|---:|---|---|---|---|
| Este modelo (GGUF estático) | 12,4 B | No disponible | Sin benchmarks publicados | Apache 2.0 | GGUF Q2_K-Q8_0; 335 descargas, 2 likes |
| DavidAU/Qwen3.5-13B-Star-Trek-TNG-DS9-Heretic-Uncensored-Thinking | 12,4 B | No disponible | Sin benchmarks publicados | No disponible en la información | Repositorio transformers del modelo original, sin cuantizar |
| mradermacher/Qwen3.5-13B-Star-Trek-TNG-DS9-Heretic-Uncensored-Thinking-i1-GGUF | 12,4 B | No disponible | Sin benchmarks publicados | No disponible | GGUF con cuantización imatrix; alternativa orientada a más calidad |
| Qwen3.5-9B-Star-Trek-TNG-DS9-Heretic-Uncensored-Thinking-i1-GGUF | 9 B (nominal) | No disponible | Sin benchmarks publicados | No disponible | GGUF i1; hermano menor de la misma familia temática |

La comparación cuantitativa no es posible porque ninguno de los repositorios proporciona resultados de MMLU, HumanEval, GSM8K u otras evaluaciones. La elección entre el 13B y el 9B dependerá de la VRAM disponible y de la calidad que se observe en pruebas propias.

## Limitaciones y advertencias

- Ausencia de benchmarks: no se puede afirmar que el modelo sea mejor o peor que otros de su tamaño sin una evaluación propia.
- Modelo abliterated/uncensored: la reducción de rechazos es deliberada; puede generar contenido violento, sexual, ilegal o dañino. No debe exponerse a usuarios finales sin filtros y moderación.
- Sesgos no documentados: no se detalla el dataset del fine-tune, por lo que pueden aparecer estereotipos en ficción, roleplay y representación de personajes.
- Riesgo de alucinación: está orientado a ficción, no a tareas factuales; no es adecuado como fuente de verdad para medicina, derecho o datos históricos.
- Idioma: solo inglés y chino están declarados; el español no es oficial y su rendimiento puede ser irregular.
- Contexto: la longitud de contexto no está documentada; no se debe dimensionar una aplicación asumiendo una ventana concreta.
- Licencia: Apache 2.0 permite uso comercial del modelo, pero el nombre y la temática de Star Trek hacen referencia a propiedad intelectual de terceros; la licencia no concede derechos sobre esa marca.
- Cuantizaciones bajas: Q2_K y Q3_K pierden calidad de forma notable; para producción conviene Q5_K_M, Q6_K, Q8_0 o la variante i1.
- Tamaño del repositorio: 88,7 GB en total; conviene descargar solo el fichero GGUF necesario.
- Modo "Thinking": no se documenta su activación ni su plantilla de prompt; puede requerir ajustes específicos.
- Multimodalidad: los ficheros `mmproj` apuntan a soporte multimodal, pero no se confirma qué modalidades cubre ni con qué calidad.
- Validación comunitaria muy limitada: 335 descargas y 2 likes; no hay un ecosistema amplio de informes de uso.

## Enlaces

- [Repositorio HuggingFace de este modelo](https://huggingface.co/mradermacher/Qwen3.5-13B-Star-Trek-TNG-DS9-Heretic-Uncensored-Thinking-GGUF)
- [Modelo base de DavidAU](https://huggingface.co/DavidAU/Qwen3.5-13B-Star-Trek-TNG-DS9-Heretic-Uncensored-Thinking)
- [Variante i1-GGUF con cuantizaciones imatrix](https://huggingface.co/mradermacher/Qwen3.5-13B-Star-Trek-TNG-DS9-Heretic-Uncensored-Thinking-i1-GGUF)
- [Página de descargas de mradermacher para este modelo](https://hf.tst.eu/model#Qwen3.5-13B-Star-Trek-TNG-DS9-Heretic-Uncensored-Thinking-GGUF)
- [Solicitudes de cuantización de mradermacher](https://huggingface.co/mradermacher/model_requests)
- [Guía de uso de GGUF de TheBloke](https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF)
- [Ficha del hermano menor de 9B en abliteration.org](https://abliteration.org/models/mradermacher/Qwen3.5-9B-Star-Trek-TNG-DS9-Heretic-Uncensored-Thinking-i1-GGUF)
- [Guía sobre LLM locales sin censura por VRAM](https://insiderllm.com/guides/best-uncensored-local-llms/)

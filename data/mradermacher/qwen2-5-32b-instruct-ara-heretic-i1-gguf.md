# mradermacher/Qwen2.5-32B-Instruct-ARA-heretic-i1-GGUF

## Resumen

Qwen2.5-32B-Instruct-ARA-heretic-i1-GGUF es una cuantizacion en formato GGUF del modelo richardyoung/Qwen2.5-32B-Instruct-ARA-heretic, publicada por el usuario mradermacher. Se trata de un derivado "abliterated" o "decensored" del modelo base Qwen2.5-32B-Instruct de Alibaba, en el que se ha eliminado o atenuado el alineamiento de rechazo del modelo original, de ahi la etiqueta "heretic". El resultado es un modelo conversacional de 32.763.876.352 parametros (unos 32,8 mil millones) pensado para generacion de texto y chat sin las restricciones habituales de seguridad.

La aportacion de este repositorio concreto no es el modelo en si, sino la bateria de cuantizaciones con imatrix (etiquetadas i1) que permiten ejecutar un modelo de 32B en hardware de consumo. El repositorio ofrece desde variantes IQ1_S de 7,4 GB hasta Q6_K de 27,0 GB, pasando por las recomendadas Q4_K_M (20,0 GB) o IQ4_XS (17,8 GB). El tamano total del repo es de 351,5 GB por acumulacion de todas las variantes.

Es relevante para desarrolladores que necesitan desplegar un modelo de 32B en local con llama.cpp u Ollama, o para investigadores que estudian el efecto de las tecnicas de abliteration sobre el comportamiento y la calidad del modelo. La licencia declarada es Apache 2.0, heredada del modelo base Qwen2.5, aunque el modelo card incluye tambien la etiqueta openrail++.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-32B-Instruct) |
| Parametros totales | 32.763.876.352 (~32,8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-32B-Instruct soporta 131.072 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (con imatrix) |
| Idiomas soportados | en (segun model card); el modelo base Qwen2.5 es multilingue, pero esta ficha solo declara ingles |
| Licencia | apache-2.0 (con etiqueta adicional openrail++ en los tags) |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix; tambien existen quants estaticos en repo hermano) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-32B-Instruct original: un transformer decoder-only denso con atencion por grupos de consultas (GQA) y RoPE, entrenado por Alibaba sobre un corpus multilingue masivo con fases de preentrenamiento y ajuste supervisado mas optimizacion por preferencias. Sobre esa base, richardyoung aplico tecnicas de abliteration (eliminacion de direcciones de rechazo en el espacio de activaciones) para producir la variante ARA-heretic, que reduce sistematicamente las negativas del modelo ante peticiones que el original rechazaria.

La contribucion de mradermacher es puramente de cuantizacion: genera los ficheros GGUF con imatrix (matriz de importancia calculada a partir de un corpus de calibracion) y produce la version i1, que segun el autor suele superar en calidad a cuantizaciones estaticas del mismo tamano. El proceso es reproducible (tag "reproducible") y se documenta con los scripts y la matriz de importancia incluida en el repo (fichero imatrix.gguf de 0,1 GB). No se dispone de informacion sobre el dataset exacto de calibracion ni sobre el volumen de tokens usado en el ajuste del modelo heretic.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles, con el estilo instructivo del Qwen2.5 original.
- Razonamiento y respuesta a instrucciones complejas, heredado del modelo base de 32B.
- Generacion de codigo y explicaciones tecnicas, aunque sin garantia de calidad tras la abliteration.
- Respuestas sin rechazo ante contenido que el modelo original filtraria (comportamiento "uncensored" o "decensored").
- Compatibilidad con endpoints (tag endpoints_compatible), lo que facilita su integracion en servicios tipo API.
- No se confirma en la informacion disponible soporte de tool calling, function calling, agentes, vision ni audio; estas capacidades dependen del modelo base y no estan verificadas en esta variante.

## Casos de uso

- Despliegue local de un modelo de 32B en estaciones de trabajo: con la variante i1-Q4_K_M (20,0 GB) se puede ejecutar en una GPU de 24 GB o en CPU con RAM suficiente mediante llama.cpp, obteniendo un modelo conversacional de gama alta sin depender de la nube.
- Investigacion sobre alineamiento y abliteration: comparar las respuestas de esta variante con las del Qwen2.5-32B-Instruct original permite medir el impacto de la eliminacion de direcciones de rechazo en la calidad, la coherencia y la seguridad.
- Generacion de contenido creativo sin filtros: escritura de ficcion, guiones o dialogos que el modelo original rechazaria por politicas de contenido, usando la variante Q5_K_M (23,4 GB) para maximizar fidelidad.
- Experimentacion con cuantizaciones extremas: las variantes IQ1_S (7,4 GB) e IQ2_XXS (9,1 GB) permiten probar el limite inferior de calidad de un 32B en hardware muy limitado, util para estudiar la degradacion por cuantizacion.
- Entornos de pruebas de seguridad ofensiva y red teaming: disponer de un modelo sin rechazos facilita generar prompts adversariales y evaluar defensas en pipelines de moderacion.
- Prototipado de asistentes conversacionales en ingles: gracias al formato GGUF y a la compatibilidad con endpoints, se puede integrar rapidamente en un servidor llama.cpp con API compatible con OpenAI para demos internas.
- Fine-tuning posterior sobre la variante desquantizada: las versiones Q6_K o Q5_K_M sirven como base para ajustes ligeros en dominios especializados, aunque la licencia y el origen del modelo deben revisarse antes de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion y overhead de contexto): IQ1_S ~7,4 GB; IQ2_XXS ~9,1 GB; IQ3_M ~14,9 GB; IQ4_XS ~17,8 GB; Q4_K_M ~20,0 GB; Q5_K_M ~23,4 GB; Q6_K ~27,0 GB. A estas cifras hay que sumar el espacio para la cache KV, que crece con la longitud de contexto.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M o IQ4_XS; RTX 3090 (24 GB) en el mismo rango; A100 40/80 GB o H100 para Q5_K_M y Q6_K con contextos largos; GPU de 16 GB (RTX 4080, 4060 Ti 16 GB) solo para cuantizaciones IQ2/IQ3.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con Q4_K_M o inferiores; en GPUs de 16 GB con IQ3 o menores; en GPUs de 12 GB solo con IQ2 o IQ1, con perdida notable de calidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con la API de OpenAI (llama-server), y cualquier runtime que soporte GGUF con quants i1. vLLM y TGI no soportan GGUF de forma nativa para este formato, por lo que requeririan los pesos originales en safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dependen fuertemente del hardware, del backend y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen2.5-32B-Instruct-ARA-heretic-i1-GGUF (este) | 32,8B | no disponible | GGUF (i1) | apache-2.0 | Variante abliterated cuantizada con imatrix; sin benchmarks publicados |
| Qwen2.5-32B-Instruct (original) | 32,8B | 131.072 tokens (segun el modelo base) | safetensors, GGUF | apache-2.0 | Modelo alineado de referencia; rechaza contenido sensible |
| richardyoung/Qwen2.5-32B-Instruct-ARA-heretic | 32,8B | no disponible | safetensors | apache-2.0 | Version heretic sin cuantizar; base de este repo |
| mradermacher/Qwen2.5-32B-Instruct-ARA-heretic-GGUF | 32,8B | no disponible | GGUF (estatico) | apache-2.0 | Quants estaticos del mismo modelo, alternativa a los i1 |

## Limitaciones y advertencias

- La abliteration elimina los rechazos de seguridad, por lo que el modelo puede generar contenido danino, ilegal o sesgado sin filtro; no es adecuado para aplicaciones de cara al publico sin moderacion externa.
- Riesgo elevado de alucinacion, agravado por las cuantizaciones agresivas (IQ1, IQ2), que degradan la coherencia y la fidelidad factual.
- Las cuantizaciones por debajo de Q4 pierden calidad de forma perceptible; el propio autor califica IQ1_S como "for the desperate" y Q2_K_S como "very low quality".
- El model card solo declara soporte de ingles; el comportamiento multilingue del modelo base no esta verificado en esta variante.
- La licencia se declara como apache-2.0, pero los tags incluyen openrail++; conviene revisar ambas antes de uso comercial, especialmente por la naturaleza "uncensored" del modelo.
- No se dispone de informacion sobre sesgos especificos introducidos por el proceso de abliteration ni sobre evaluaciones de seguridad.
- El repo completo ocupa 351,5 GB; descargar solo la variante necesaria para evitar consumo innecesario de almacenamiento.
- La fecha de creacion indicada (2026-11-05) es futura respecto a la mayoria de referencias, lo que sugiere posible inconsistencia en los metadatos; verificar antes de citar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen2.5-32B-Instruct-ARA-heretic-i1-GGUF
- Modelo base heretic: https://huggingface.co/richardyoung/Qwen2.5-32B-Instruct-ARA-heretic
- Quants estaticos del mismo modelo: https://huggingface.co/mradermacher/Qwen2.5-32B-Instruct-ARA-heretic-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen2.5-32B-Instruct-ARA-heretic-i1-GGUF
- Modelo original Qwen2.5-32B-Instruct: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct/blob/main/LICENSE
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF

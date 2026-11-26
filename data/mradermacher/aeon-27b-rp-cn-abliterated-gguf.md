# mradermacher/AEON-27B-RP-cn-abliterated-GGUF

## Resumen

AEON-27B-RP-cn-abliterated-GGUF es una cuantizacion estatica en formato GGUF del modelo don0ox1/AEON-27B-RP-cn-abliterated, publicada por mradermacher. El modelo original es un ajuste fino (QLoRA) orientado a roleplay en chino, construido sobre una base que el autor etiqueta como "qwen3.5" y sometido a un proceso de "abliteration" (eliminacion de rechazos) que da lugar a una variante sin censura. Cuenta con 27.320.697.856 parametros (aproximadamente 27,3 mil millones).

La relevancia de esta publicacion es practica: mradermacher convierte los pesos originales en safetensors a cuantizaciones GGUF de distintos niveles de compresion (de Q2_K a Q8_0), lo que permite ejecutar un modelo de 27B en hardware de consumo mediante llama.cpp u Ollama. El repositorio incluye ademas ficheros mmproj, lo que sugiere soporte multimodal en el modelo base.

La informacion disponible es limitada: la model card del cuantizador es generica y no aporta detalles sobre arquitectura, contexto, datos de entrenamiento ni benchmarks. Esta ficha refleja exclusivamente lo que consta en los metadatos y en la model card, marcando como "no disponible" todo aquello que no se especifica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el autor etiqueta la base como "qwen3.5"; no se detalla la arquitectura) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS, x-f16; ademas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | zh (chino) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |
| Tamano del repo | 80,1 GB |
| Libreria declarada | transformers |
| Modelo base | don0ox1/AEON-27B-RP-cn-abliterated |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo. Los metadatos indican que el modelo base fue ajustado mediante QLoRA y que la base subyacente se etiqueta como "qwen3.5", lo que sugiere una familia de transformers tipo decoder-only, pero no se confirma ni el numero de capas, ni la dimension oculta, ni el mecanismo de atencion. Tampoco se documenta la longitud de contexto nativa.

Respecto al entrenamiento, la model card solo indica que el modelo es un ajuste fino para roleplay en chino y que ha sido "abliterated" (proceso de eliminacion de direcciones de rechazo para reducir la censura). No se especifica el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. La presencia de ficheros mmproj en el repositorio sugiere capacidades multimodales (vision) en el modelo base, aunque no se detalla su alcance.

## Capacidades

- Generacion de texto conversacional orientada a roleplay en chino.
- Modo sin censura ("abliterated"): el proceso de abliteration elimina los rechazos del modelo, de modo que responde a peticiones que el modelo original rechazaria.
- Soporte multimodal probable (vision) segun la presencia de ficheros mmproj-Q8_0 y mmproj-f16; el alcance exacto no esta documentado.
- Capacidades multilingues limitadas: el unico idioma declarado es zh (chino).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (thinking mode, audio): no disponible.

## Casos de uso

- Roleplay conversacional en chino: el modelo esta ajustado especificamente para este escenario, por lo que es adecuado para personajes persistentes y dialogos multi-turno con estilo narrativo.
- Prototipado de chatbots de ficcion interactiva: gracias a las cuantizaciones Q4_K_S (15,9 GB) puede desplegarse en una GPU de consumo para pruebas rapidas de personajes y tramas.
- Investigacion sobre alineacion y abliteration: util para estudiar como el proceso de eliminacion de rechazos afecta al comportamiento del modelo en comparacion con la version original.
- Generacion de contenido creativo sin restricciones: para guiones, narrativa o dialogos donde el modelo original aplicaria filtros de seguridad.
- Evaluacion de cuantizaciones GGUF: el repositorio ofrece multiples niveles (Q2_K a Q8_0) para medir el impacto de la compresion en la calidad del roleplay en chino.
- Despliegue local con llama.cpp u Ollama: la cuantizacion Q4_K_S permite ejecutar un modelo de 27B en estaciones de trabajo con 16-24 GB de VRAM.
- Analisis de imagenes en contexto conversacional (si se confirma la capacidad multimodal mediante los ficheros mmproj), aunque el alcance no esta documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (segun los tamanos de fichero publicados):
  - Q2_K: 11,3 GB.
  - Q4_K_S: 15,9 GB (recomendado por el autor por velocidad).
  - Q8_0: 29,1 GB (mejor calidad).
  - mmproj-Q8_0: 0,7 GB adicionales; mmproj-f16: 1,0 GB adicionales (solo si se usa la parte multimodal).
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, Q4_K_S encaja en GPUs de 16-24 GB (RTX 4080/4090, A5000) y Q8_0 requiere 32 GB o mas (A100 40 GB, H100).
- Cabe en GPU de consumo: Q2_K y Q4_K_S si, en tarjetas de 12-16 GB y 16-24 GB respectivamente; Q8_0 no en la mayoria de GPUs de consumo.
- Opciones de despliegue: llama.cpp y Ollama (formato GGUF); teoricamente compatible con otros runners GGUF, aunque no se documenta.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas (contexto, arquitectura) que permitan una comparacion rigurosa con alternativas. A continuacion se compara unicamente lo que consta en los metadatos:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| AEON-27B-RP-cn-abliterated-GGUF | 27,3B | no disponible | apache-2.0 | GGUF | Roleplay en chino, sin censura |
| don0ox1/AEON-27B-RP-cn-abliterated (base) | 27,3B | no disponible | apache-2.0 | safetensors | Modelo original sin cuantizar |
| Alternativas de roleplay de ~27B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos para comparar |

## Limitaciones y advertencias

- El modelo esta entrenado y declarado unicamente para chino; su rendimiento en castellano u otros idiomas no esta garantizado.
- El proceso de abliteration elimina los rechazos de seguridad: puede generar contenido ofensivo, ilegal o danino sin filtros. No es adecuado para aplicaciones de produccion orientadas al publico general sin moderacion externa.
- Riesgo de alucinacion no cuantificado; no hay benchmarks publicados.
- No se documenta la longitud de contexto, lo que impide planificar casos de uso con ventanas largas.
- La licencia apache-2.0 permite uso comercial, pero el autor del modelo base y el cuantizador no ofrecen garantias; conviene revisar las condiciones del modelo original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en comunidad ni validacion externa.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S) degradan notablemente la coherencia en modelos de 27B; el autor recomienda Q4_K_S como equilibrio.
- No se han publicado cuantizaciones ponderadas/imatrix; solo estaticas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/AEON-27B-RP-cn-abliterated-GGUF
- Modelo base: https://huggingface.co/don0ox1/AEON-27B-RP-cn-abliterated
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#AEON-27B-RP-cn-abliterated-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests

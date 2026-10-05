# mradermacher/Qwen2.5-furry-7B-i1-GGUF

## Resumen

Esta ficha describe `mradermacher/Qwen2.5-furry-7B-i1-GGUF`, un repositorio de cuantizaciones en formato GGUF generadas por el usuario mradermacher a partir del modelo `23333aa/Qwen2.5-furry-7B`. No se trata de un modelo entrenado desde cero, sino de una redistribucion optimizada para inferencia local: el autor aplica cuantizacion con matriz de importancia (imatrix) sobre el fine-tune original, que a su vez se presenta en la model card como un ajuste QLoRA orientado a roleplay, generacion de historias y contenido de tematica furry.

El modelo base cuenta con 7.615.616.512 parametros (aproximadamente 7,6 mil millones), lo que lo situa en la categoria de 7B-8B, el rango mas habitual para ejecucion en GPU de consumo. La model card declara soporte para chino (zh) e ingles (en), licencia Apache 2.0 y la etiqueta `not-for-all-audiences`, advertencia explicita sobre la naturaleza del contenido generado. El repositorio ocupa 89,0 GB en total debido al gran numero de variantes de cuantizacion publicadas, desde IQ1_S (2,0 GB) hasta Q6_K (6,4 GB).

Su relevancia practica es acotada y muy especifica: sirve para desplegar un modelo conversacional de finte-tune tematico en hardware modesto mediante llama.cpp u Ollama, sin necesidad de infraestructura de servidor. Con 289 descargas y 0 likes en el momento de redactar esta ficha, se trata de un artefacto de nicho dentro del ecosistema de cuantizaciones de mradermacher, cuyo valor principal es la disponibilidad de variantes imatrix de alta calidad para un modelo que de otro modo no tendria versiones GGUF optimizadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la especifica; el nombre del modelo base, Qwen2.5-furry-7B, sugiere una familia Qwen2.5, sin confirmar) |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (mas fichero imatrix) |
| Idiomas soportados | zh, en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones imatrix/weighted); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. Los datos de HuggingFace indican que `23333aa/Qwen2.5-furry-7B` es el modelo de origen y que el fine-tune se realizo mediante QLoRA, segun la etiqueta `qlora` de la model card. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases posteriores de RLHF, DPO u otro tipo de alineamiento. Tampoco se documenta ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, atencion por ventanas, etc.).

El trabajo tecnico de este repositorio concreto corresponde a mradermacher y consiste en la generacion de cuantizaciones GGUF con matriz de importancia (imatrix) sobre el modelo original. El autor indica que se trata de cuantizaciones ponderadas (`weighted/imatrix quants`) y publica tambien una version de cuantizaciones estaticas en un repositorio hermano. El proceso imatrix, habitual en el ecosistema llama.cpp, calibra los pesos cuantizados a partir de estadisticas de activacion recogidas sobre un corpus, lo que suele traducirse en una perdida de perplejidad menor que la cuantizacion estatica equivalente en tamaño, especialmente en los niveles mas agresivos (IQ2, IQ3).

## Capacidades

- Generacion de texto conversacional, con enfasis declarado en roleplay y generacion de historias segun las etiquetas de la model card.
- Capacidad multilingue limitada a chino (zh) e ingles (en); no se declara soporte para castellano ni otros idiomas.
- Naturaleza conversacional multi-turno, segun la etiqueta `conversational`.
- Compatibilidad con endpoints (`endpoints_compatible`) para despliegue como servicio de inferencia.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de vision, audio ni modo de razonamiento explicito (thinking mode).
- No se documentan capacidades especificas de codigo o matematicas.

## Casos de uso

- Roleplay conversacional local: el modelo esta ajustado especificamente para este fin, por lo que puede desplegarse en llama.cpp u Ollama para sesiones de juego de rol textual sin depender de APIs externas ni enviar datos a terceros.
- Generacion de ficcion y narrativa serializada: la etiqueta `story-generation` indica que el ajuste esta orientado a producir texto narrativo continuado; las cuantizaciones de 4-5 bits (Q4_K_M, Q5_K_M) permiten mantener una ventana de contexto amplia en GPU de consumo.
- Prototipado de personajes conversacionales con personalidad definida: util para desarrolladores que quieran evaluar como responde un fine-tune tematico frente a un prompt de sistema persistente antes de invertir en un ajuste propio.
- Investigacion sobre cuantizacion: el repositorio publica 24 variantes de cuantizacion mas el fichero imatrix, lo que lo convierte en un caso de estudio util para medir el impacto de cada nivel de compresion en la coherencia de un modelo de 7,6 B.
- Despliegue en hardware sin GPU dedicada: las variantes IQ2 (2,4-2,9 GB) e IQ3 (3,2-3,7 GB) permiten ejecutar el modelo en CPU con memoria RAM limitada, a costa de una perdida de calidad notable y advertida por el propio autor.
- Experimentacion con contenido para adultos en entorno controlado: la etiqueta `not-for-all-audiences` indica que el modelo puede emplearse para generar contenido no apto para todos los publicos; cualquier uso de este tipo debe realizarse en un despliegue privado y con las salvaguardas legales correspondientes.
- Evaluacion comparativa de fine-tunes QLoRA: permite contrastar el comportamiento de un ajuste ligero sobre una base de 7,6 B frente al modelo original, siempre que se respete la licencia Apache 2.0 de ambos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del repositorio de cuantizaciones no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra metrica de evaluacion, ni para el modelo base ni para las variantes cuantizadas. Tampoco la busqueda web ha devuelto resultados relevantes: los unicos enlaces recuperados corresponden a herramientas de estadisticas del videojuego Fortnite y a un listado de modelos de LocalAI, ninguno relacionado con este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia, segun el tamaño de fichero publicado y asumiendo margen para contexto y overhead de llama.cpp:
  - i1-IQ1_S (2,0 GB): en torno a 2,5-3 GB de VRAM.
  - i1-IQ2_M (2,9 GB): en torno a 3,5-4 GB.
  - i1-IQ3_M (3,7 GB): en torno a 4,5-5 GB.
  - i1-Q4_K_M (4,8 GB): en torno a 5,5-6,5 GB.
  - i1-Q5_K_M (5,5 GB): en torno a 6,5-7,5 GB.
  - i1-Q6_K (6,4 GB): en torno a 7,5-8,5 GB.
- GPU de consumo: las variantes Q4_K_S, Q4_K_M e IQ4_XS caben en tarjetas de 8 GB (RTX 3060 Ti, RTX 4060, RTX 2070). Las variantes Q5 y Q6 requieren 10-12 GB (RTX 3080 12 GB, RTX 4070 Ti) o reparto parcial entre GPU y CPU.
- GPU profesionales: A100, H100 y L40S ejecutan sin problema cualquier variante, con margen de sobra para contextos largos y batching.
- CPU: las variantes IQ2 e IQ3 son las unicas razonables para inferencia puramente en CPU con 8-16 GB de RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y text-generation-webui (oobabooga) son las rutas habituales para GGUF. El soporte de vLLM para GGUF es limitado y experimental, por lo que no se recomienda como opcion principal.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para este modelo en ninguna configuracion de hardware.

## Comparativa con modelos similares

La informacion disponible no incluye datos de rendimiento que permitan una comparacion cuantitativa con alternativas. La unica comparacion posible es de formato y disponibilidad entre el propio modelo base y sus derivados.

| Modelo | Parametros | Formato | Cuantizaciones | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/Qwen2.5-furry-7B-i1-GGUF | 7,6 B | GGUF | 24 variantes imatrix | apache-2.0 | Repositorio analizado; 289 descargas |
| mradermacher/Qwen2.5-furry-7B-GGUF | 7,6 B (presumiblemente) | GGUF | no disponible | apache-2.0 | Cuantizaciones estaticas del mismo autor |
| 23333aa/Qwen2.5-furry-7B | 7,6 B | safetensors | no aplica | apache-2.0 | Modelo base, ajuste QLoRA |

No se dispone de informacion sobre modelos comparables de terceros con el mismo proposito (roleplay tematico en chino e ingles sobre una base de 7,6 B) en los datos proporcionados, por lo que no se puede elaborar una comparativa de rendimiento.

## Limitaciones y advertencias

- Contenido para adultos: la etiqueta `not-for-all-audiences` indica que el ajuste esta disenado, al menos en parte, para generar contenido no apto para todos los publicos. No debe desplegarse en productos accesibles a menores ni en servicios publicos sin filtrado previo.
- Sesgos: no hay documentacion sobre evaluaciones de sesgo, toxicidad o alineamiento. Un ajuste QLoRA sobre un dataset tematico estrecho tiende a degradar el comportamiento general del modelo base y a reforzar los patrones presentes en los datos de ajuste.
- Alucinacion: al ser un fine-tune orientado a ficcion y no a recuperacion factual, la probabilidad de inventar datos es alta cuando se le pide informacion verificable. No es adecuado para tareas de respuesta factual.
- Idiomas: solo se declaran chino e ingles. El rendimiento en castellano no esta garantizado y probablemente sea deficiente.
- Contexto: se desconoce la longitud de contexto soportada. Sin ese dato no es posible planificar casos de uso que requieran ventanas largas.
- Cuantizacion: el propio autor advierte en la tabla de ficheros que las variantes IQ1, IQ2 y Q2_K son de calidad baja o "para desesperados". Usar esas cuantizaciones en produccion degradara notablemente la coherencia.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero el desarrollador debe asumir la responsabilidad legal sobre el contenido generado por un modelo con etiqueta de contenido adulto.
- Trazabilidad: el repositorio no incluye informacion sobre el dataset de ajuste, el numero de pasos de entrenamiento ni la procedencia de los datos, lo que dificulta auditar su comportamiento.
- Adopcion: 289 descargas y 0 likes indican una validacion comunitaria practicamente nula. No hay evidencia de terceros sobre su calidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen2.5-furry-7B-i1-GGUF
- Modelo base: https://huggingface.co/23333aa/Qwen2.5-furry-7B
- Cuantizaciones estaticas del mismo autor: https://huggingface.co/mradermacher/Qwen2.5-furry-7B-GGUF
- Pagina resumen del autor para este modelo: https://hf.tst.eu/model#Qwen2.5-furry-7B-i1-GGUF
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis sobre calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Sitio de nethype GmbH: https://www.nethype.de/

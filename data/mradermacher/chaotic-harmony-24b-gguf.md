# mradermacher/Chaotic-Harmony-24B-GGUF

## Resumen

Chaotic-Harmony-24B-GGUF es la version cuantizada en formato GGUF del modelo Sorihon/Chaotic-Harmony-24B, un modelo de ~23.570 millones de parametros generado mediante mergekit (fusion de pesos de otros modelos) y orientado a tareas conversacionales en ingles. La cuantizacion la publica mradermacher, un autor conocido por distribuir versiones GGUF de modelos de la comunidad con multiples niveles de compresion listas para su uso en llama.cpp y otros motores de inferencia local. La relevancia de esta publicacion es practica: convierte un modelo de 24B, cuyo peso en precision completa ronda los 47 GB, en ficheros de entre 9 GB y 25,2 GB que caben en GPUs de consumo.

El modelo no dispone de model card tecnica propia por parte del autor del merge; la informacion disponible se limita a los metadatos de la ficha de HuggingFace (parametros, idioma, etiquetas) y a la tabla de cuantizaciones publicada por mradermacher. No se documentan arquitectura exacta, longitud de contexto, composicion del dataset de entrenamiento, licencia ni resultados de benchmarks. Esto condiciona cualquier evaluacion rigurosa: se trata de un artefacto de despliegue, no de un modelo con documentacion tecnica completa.

Por su tamano y su naturaleza de merge orientado a conversacion, encaja en el segmento de modelos de rol y asistente local que se ejecutan en GPUs de 24 GB con cuantizaciones Q4, y es especialmente relevante para quienes quieren probar un merge de 24B en hardware de consumo sin disponer de la version de precision completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo resultante de un merge con mergekit; no se documenta la arquitectura de la base) |
| Parametros totales | 23.572.403.200 (dato de safetensors del modelo base) |
| Parametros activos | no aplica (no se indica que sea MoE; se asume denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (transformers; compatible con endpoints) |

## Arquitectura y entrenamiento

El modelo es un merge generado con mergekit, segun las etiquetas de la ficha (mergekit, merge). Esto implica que sus pesos proceden de la combinacion de dos o mas modelos ya entrenados, no de un entrenamiento desde cero. La ficha de mradermacher no detalla la tecnica de fusion empleada (SLERP, TIES, DARE, passthrough, etc.), ni los modelos de origen, ni los hiperparametros del merge. El modelo de partida es Sorihon/Chaotic-Harmony-24B, cuya documentacion tampoco se incluye en la informacion disponible.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si hubo fases de RLHF, DPO o ajuste por preferencias. Tampoco se documentan innovaciones tecnicas concretas (atencion lineal, decodificacion especulativa, atencion con ventana deslizante, etc.). Lo unico verificable es el recuento de parametros (23.572.403.200) y el proceso de cuantizacion estatica aplicado por mradermacher, realizado con convert_type hf y quantize_version 2 segun los comentarios internos de la model card.

## Capacidades

- Generacion de texto y conversacion multi-turno: el modelo esta etiquetado como conversational y su uso previsto es el dialogo en ingles.
- Generacion creativa y de ficcion: el segmento de merges de 24B suele orientarse a escritura creativa, narrativa y juego de rol, aunque no se documenta explicitamente.
- Capacidades derivadas del merge: al ser una fusion de modelos base, hereda las capacidades de sus componentes, que no se detallan en la informacion disponible.
- Tool calling / function calling: no disponible (no se menciona soporte).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se menciona).
- Capacidades multilingues: limitadas al ingles (idioma declarado: en).
- Capacidades especiales (vision, audio, modo de razonamiento): no disponible.

## Casos de uso

- Asistente conversacional local en ingles: el modelo puede mantener dialogos multi-turno y desplegarse con llama.cpp u Ollama en una GPU de 24 GB usando la cuantizacion Q4_K_M (14,4 GB), lo que permite una alternativa local a APIs en escenarios con requisitos de privacidad.
- Juego de rol y narrativa interactiva: por su perfil de modelo merge conversacional, es adecuado para bots de personaje y sesiones de RP en ingles, ejecutables en hardware de consumo sin depender de servicios externos.
- Generacion creativa de ficcion: redaccion de relatos, dialogos y borradores literarios en ingles, con la posibilidad de ajustar temperatura y muestreo segun el estilo deseado.
- Prototipado y evaluacion de merges: sirve como bancada de pruebas para comparar tecnicas de fusion y cuantizacion, ya que ofrece el mismo modelo a diez niveles de compresion distintos.
- Base para fine-tuning posterior: al disponer de pesos en formato transformers (el modelo base) y GGUF, puede usarse como punto de partida para LoRA o ajustes especificos, siempre que la licencia lo permita (actualmente no disponible y, por tanto, a verificar antes de uso comercial).
- Despliegue en entornos sin GPU dedicada: las cuantizaciones Q2_K (9,0 GB) y Q3_K_S (10,5 GB) permiten ejecucion con CPU y RAM moderada usando llama.cpp, aunque con perdida de calidad.
- Chatbot de personaje para aplicaciones de entretenimiento: integrable mediante la API compatible de llama.cpp u Ollama en una aplicacion web de chat.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (solo pesos, sin cache KV):
  - Q2_K: 9,0 GB
  - Q3_K_S: 10,5 GB
  - Q3_K_M: 11,6 GB
  - Q3_K_L: 12,5 GB
  - Q4_K_S: 13,6 GB
  - Q4_K_M: 14,4 GB
  - Q5_K_S: 16,4 GB
  - Q5_K_M: 16,9 GB
  - Q6_K: 19,4 GB
  - Q8_0: 25,2 GB
  - Precision completa (referencia): ~47 GB (23,57B parametros x 2 bytes en FP16)
- GPU recomendadas: para Q4/Q5, una RTX 3090 o RTX 4090 de 24 GB es suficiente; para Q6_K y Q8_0 se recomienda 32 GB (RTX 5090 o similar) o reparto en dos GPUs; para la version FP16, A100 80 GB o H100.
- Cabe en GPU de consumo: si. En 24 GB entran Q4_K_M (14,4 GB) y Q5_K_M (16,9 GB) dejando margen para contexto; Q8_0 (25,2 GB) queda justo por encima de 24 GB y requiere 32 GB o descarga parcial a RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui. El formato es GGUF, por lo que no es directamente compatible con vLLM o TGI en su modo habitual de safetensors, aunque algunos motores ofrecen soporte GGUF parcial.
- Latencia y throughput estimados: no disponible (no se publican mediciones). A modo de referencia general, un modelo denso de 24B en Q4_K_M sobre una RTX 4090 suele situarse en el rango de decenas de tokens por segundo, pero este dato no esta confirmado para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chaotic-Harmony-24B-GGUF | 23,57B | no disponible | GGUF | no disponible | HuggingFace (mradermacher) |
| Chaotic-Order-24B-V1-i1-GGUF | no disponible (24B nominal) | no disponible | GGUF (imatrix) | no disponible | HuggingFace (mradermacher) |
| Goetia-24B (v1.3 / v1.2) | no disponible (24B nominal) | no disponible | GGUF | no disponible | HuggingFace / comunidad |
| Mistral-Small-24B | no disponible en la informacion proporcionada | no disponible | safetensors, GGUF | no disponible | HuggingFace |

Los modelos comparables pertenecen al mismo nicho de merges de 24B orientados a conversacion y rol, distribuidos en GGUF para GPUs de 24 GB. No se dispone de datos de rendimiento de ninguno de ellos en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no se puede asumir permiso para uso comercial; hay que contactar con el autor del modelo base antes de cualquier despliegue en produccion.
- Modelo base sin documentacion: al no existir model card tecnica del merge original, se desconocen la composicion del entrenamiento, los datos usados y los posibles sesgos heredados.
- Idioma: soporte declarado unicamente en ingles; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Riesgo de alucinacion: inherente a los modelos generativos y agravado por la falta de evaluaciones publicadas sobre este merge concreto.
- Longitud de contexto desconocida: no se puede planificar el uso en tareas de contexto largo sin conocer la ventana real del modelo.
- Sin benchmarks: no hay ninguna medicion publica que permita estimar su calidad frente a alternativas del mismo tamano.
- Cuantizaciones de baja precision: Q2_K y Q3_K degradan notablemente la calidad respecto a Q4/Q5/Q6, segun las propias notas de la tabla de cuantizaciones (Q6_K marcado como "very good quality", Q8_0 como "best quality").
- Riesgo de contenido: los merges orientados a rol y conversacion abierta pueden producir contenido sensible si no se aplican filtros o pre-prompts adecuados.
- Fecha de creacion de la ficha (2026-10-04) inusual: conviene verificar la vigencia y el estado real del repositorio antes de integrarlo en un pipeline.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Chaotic-Harmony-24B-GGUF
- Modelo base: https://huggingface.co/Sorihon/Chaotic-Harmony-24B
- Pagina de resumen de cuantizaciones del autor: https://hf.tst.eu/model#Chaotic-Harmony-24B-GGUF
- Modelo comparable del mismo autor: https://huggingface.co/mradermacher/Chaotic-Order-24B-V1-i1-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafica de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Peticiones de modelos a mradermacher: https://huggingface.co/mradermacher/model_requests
- Nethype GmbH (empresa que da soporte a mradermacher): https://www.nethype.de/

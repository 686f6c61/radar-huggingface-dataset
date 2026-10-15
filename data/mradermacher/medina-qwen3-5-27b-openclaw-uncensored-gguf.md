# mradermacher/Medina-Qwen3.5-27B-OpenClaw-Uncensored-GGUF

## Resumen

Medina-Qwen3.5-27B-OpenClaw-Uncensored-GGUF es un repositorio de cuantizaciones en formato GGUF publicado por el usuario mradermacher a partir del modelo Y0us/Medina-Qwen3.5-27B-OpenClaw-Uncensored. Se trata de un derivado de la familia Qwen3 de aproximadamente 26.895.998.464 parámetros (unos 26,9 mil millones), al que se le han aplicado técnicas de "abliteration" para eliminar la dirección de rechazo (refusal direction) del modelo original, dando como resultado un modelo etiquetado como uncensored.

El repositorio no contiene pesos originales en safetensors, sino únicamente conversiones a GGUF en distintas cuantizaciones (desde Q2_K de 10,8 GB hasta Q8_0 de 28,7 GB), pensadas para ejecución local con llama.cpp y herramientas compatibles. La model card se limita a documentar los ficheros y tamaños; no incluye detalles sobre arquitectura, dataset de entrenamiento, longitud de contexto ni resultados de benchmarks.

Su relevancia actual es práctica: permite desplegar un modelo de ~27B en hardware de consumo con cuantizaciones agresivas y, según los tags del repositorio, con soporte declarado de tool calling y function calling, lo que lo hace apto para flujos de agente. La ausencia de métricas publicadas y el carácter "uncensored" obligan a evaluarlo con cautela antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los tags del repositorio indican familia qwen3; no se documenta el detalle en la model card) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; tambien existen cuantizaciones ponderadas/imatrix en el repositorio i1-GGUF |
| Idiomas soportados | en (ingles), ko (coreano) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base se distribuye en transformers/safetensors |
| Repositorio de origen | Y0us/Medina-Qwen3.5-27B-OpenClaw-Uncensored |
| Tamano del repositorio | 186,3 GB |
| Descargas / likes | 340 / 0 |
| Fecha de creacion | 2026-04-24 |
| Ultima actualizacion | 2026-10-14 |
| Etiquetas destacadas | abliterated, uncensored, qwen3, openclaw, refusal-direction, tool-calling, function-calling |

## Arquitectura y entrenamiento

La model card del repositorio no aporta informacion sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF, DPO u otro tipo de alineamiento. Lo unico documentado por el autor de las cuantizaciones es que se trata de conversiones estaticas del modelo Y0us/Medina-Qwen3.5-27B-OpenClaw-Uncensored, con la metadata de cuantizacion habitual de mradermacher (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`).

La innovacion tecnica declarada, a traves de los tags del repositorio, es la modificacion de la "refusal direction" (abliteration) sobre un modelo base de la familia Qwen3, orientada a reducir los rechazos del modelo al generar contenido. El tag "openclaw" sugiere una variante o linaje especifico del modelo base, pero su significado no se describe en la informacion disponible. No se documentan tecnicas adicionales como decodificacion especulativa, atencion lineal o arquitecturas hibridas.

## Capacidades

- Generacion de texto conversacional: el repositorio se etiqueta como "conversational" y la libreria declarada es transformers.
- Tool calling y function calling: ambos aparecen como tags explicitos del repositorio, lo que indica que el modelo base fue preparado para invocar herramientas.
- Uso en agentes: la combinacion de tool calling y la naturaleza "uncensored" sugiere orientacion a flujos de agente, aunque no se documentan capacidades de razonamiento multi-paso con detalle.
- Generacion de codigo: no se declara explicitamente en la informacion disponible; debe verificarse empiricamente.
- Matematicas y razonamiento: no se declara ni se aportan benchmarks.
- Multilingue: limitado a ingles (en) y coreano (ko) segun los metadatos de idioma.
- Modo "thinking": no disponible en la informacion proporcionada.
- Vision o audio: no disponible; no se mencionan capacidades multimodales.
- Comportamiento sin filtros: el modelo esta etiquetado como "abliterated" y "uncensored", lo que implica una reduccion deliberada de los mecanismos de rechazo.

## Casos de uso

- Agentes con invocacion de herramientas: gracias al soporte declarado de tool calling y function calling, puede integrarse en orquestadores tipo LangChain o LlamaIndex para ejecutar acciones sobre APIs, bases de datos o sistemas de ficheros, con la ventaja de ejecutarse en local mediante GGUF.
- Asistente conversacional autoalojado: con una cuantizacion Q4_K_M (16,6 GB) puede desplegarse en una GPU de 24 GB y servir conversaciones multi-turno sin dependencia de APIs externas, util cuando hay requisitos de privacidad o coste.
- Escritura creativa y roleplay sin restricciones: el caracter abliterated permite generar narrativa adulta o temas sensibles que los modelos alineados suelen rechazar, un caso de uso habitual en esta familia de derivados.
- Generacion de codigo en flujos de desarrollo: con cuantizaciones Q5_K_M o Q6_K puede actuar como asistente de autocompletado o revisión en entornos con GPU local, integrándose en editores mediante servidores compatibles con la API de OpenAI.
- Investigacion sobre direcciones de rechazo y alineamiento: al ser un derivado abliterated, sirve como sujeto de comparacion frente al modelo base para estudiar como cambia el comportamiento al suprimir la refusal direction.
- Red-teaming y evaluacion de seguridad: permite probar defensas, clasificadores de contenido y filtros de salida frente a un modelo deliberadamente permisivo, en entornos controlados.
- Procesamiento de contenido en coreano e ingles: para pipelines bilingues en/ko que requieran traduccion, resumen o extraccion de informacion en local.
- Base para fine-tuning ligero: el modelo base en safetensors puede usarse como punto de partida para LoRA o QLoRA orientados a dominios verticales, y estas cuantizaciones sirven para validar el comportamiento antes y despues del ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizaciones no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra metrica, y el modelo base no aporta datos en la informacion suministrada.

## Requisitos de hardware

Las cifras de VRAM que se indican a continuacion son estimaciones derivadas del tamano de los ficheros GGUF publicados, mas el margen habitual para cache KV y overhead del runtime. No estan confirmadas por el autor.

- VRAM estimada para inferencia (solo pesos):
  - Q2_K: 10,8 GB.
  - Q3_K_S: 12,2 GB; Q3_K_M: 13,4 GB; Q3_K_L: 14,4 GB.
  - IQ4_XS: 15,3 GB; Q4_K_S: 15,7 GB; Q4_K_M: 16,6 GB.
  - Q5_K_S: 18,8 GB; Q5_K_M: 19,3 GB.
  - Q6_K: 22,2 GB.
  - Q8_0: 28,7 GB.
- Presupuesto total recomendado: sumar entre 1 y 4 GB adicionales sobre el tamano del fichero para cache KV, dependiendo de la longitud de contexto configurada y del numero de secuencias en paralelo.
- GPU recomendadas:
  - Consumer: RTX 3090 o RTX 4090 (24 GB) para cuantizaciones hasta Q5_K_M con contexto moderado; RTX 5090 (32 GB) para Q8_0.
  - Profesional: A100 40 GB / 80 GB, H100 80 GB para Q6_K y Q8_0 con contextos largos o batch elevado.
  - Equipos con 16 GB de VRAM pueden ejecutar Q4_K_S o IQ4_XS con offload parcial de capas a CPU.
- Cabe en consumer GPU: si, en tarjetas de 24 GB o mas con cuantizaciones Q4 y Q5; en 16 GB es viable con offload parcial o cuantizaciones Q3.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime con soporte GGUF. vLLM soporta GGUF de forma limitada; TGI no soporta GGUF de forma nativa.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones publicadas del modelo base (arquitectura, contexto, dataset) en la informacion suministrada, por lo que no es posible establecer una comparacion cuantitativa con alternativas de la misma categoria. La unica comparacion verificable es entre las variantes del propio repositorio:

| Variante | Formato | Tamano | Notas |
|---|---|---|---|
| Medina-Qwen3.5-27B-OpenClaw-Uncensored (base, Y0us) | safetensors / transformers | no disponible (26,9B parametros) | Modelo original sin cuantizar; fuente de todas las conversiones |
| Medina-Qwen3.5-27B-OpenClaw-Uncensored-GGUF (este repo) | GGUF estatico | 10,8 GB (Q2_K) a 28,7 GB (Q8_0) | Cuantizaciones estaticas; la model card marca Q4_K_S y Q4_K_M como "fast, recommended" y Q8_0 como mejor calidad |
| Medina-Qwen3.5-27B-OpenClaw-Uncensored-i1-GGUF | GGUF ponderado / imatrix | no disponible | Cuantizaciones de mayor calidad segun el autor; requieren mas recursos de generacion |

Comparacion con modelos de terceros (por ejemplo, otros derivados abliterated de la misma familia o de tamano similar): no disponible.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad, razonamiento, codigo o matemáticas; cualquier afirmacion de rendimiento seria una suposicion.
- Modelo "uncensored" y "abliterated": la supresion de la refusal direction implica una probabilidad elevada de generar contenido sensible, ofensivo, ilegal o peligroso si se le solicita. No es apto para aplicaciones orientadas al publico general sin filtros adicionales.
- Riesgo de alucinacion: no documentado por el autor, pero inherente a cualquier modelo de lenguaje sin evaluacion publicada. Al no haber datos de entrenamiento ni de evaluacion, el riesgo no puede acotarse.
- Sesgos conocidos: no disponibles. El dataset de entrenamiento no esta documentado.
- Cobertura idiomatica limitada: los metadatos solo declaran ingles (en) y coreano (ko). El rendimiento en castellano no esta garantizado ni evaluado.
- Longitud de contexto no documentada: se desconoce la ventana real soportada, lo que impide planificar casos de uso con contexto largo.
- Licencia apache-2.0: permite uso comercial y modificacion, pero conviene revisar las condiciones del modelo base y las implicaciones legales de distribuir un modelo deliberadamente desinhibido (por ejemplo, normativa de servicios digitales, obligaciones de moderacion en la UE).
- Repositorio con 0 likes y 340 descargas: adopcion muy baja y sin validacion de la comunidad, lo que reduce la confianza en su estabilidad.
- Cuantizaciones muy agresivas (Q2_K, Q3_K_S) degradan notablemente la calidad; el propio autor desaconseja Q3_K_M ("lower quality").
- Fecha de actualizacion (2026-10-14) posterior a la de creacion, sin changelog: no se documenta que cambios se introdujeron.
- Los resultados de busqueda web asociados a esta consulta no contienen informacion tecnica relevante sobre el modelo.

## Enlaces

- Repositorio HuggingFace (este modelo): https://huggingface.co/mradermacher/Medina-Qwen3.5-27B-OpenClaw-Uncensored-GGUF
- Modelo base: https://huggingface.co/Y0us/Medina-Qwen3.5-27B-OpenClaw-Uncensored
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Medina-Qwen3.5-27B-OpenClaw-Uncensored-i1-GGUF
- Pagina de resumen y descargas de mradermacher: https://hf.tst.eu/model#Medina-Qwen3.5-27B-OpenClaw-Uncensored-GGUF
- Preguntas frecuentes y peticiones de modelos: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Web de nethype GmbH: https://www.nethype.de/

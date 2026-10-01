# mradermacher/Qwen2.5-7B-OBLITERATED-GGUF

## Resumen

Qwen2.5-7B-OBLITERATED-GGUF es un conjunto de cuantizaciones en formato GGUF del modelo BabarAzaa/Qwen2.5-7B-OBLITERATED, publicadas por el usuario mradermacher. El modelo subyacente es una version "abliterada" (uncensored) de Qwen2.5-7B, un transformer decoder-only de 7.615.616.512 parametros (aproximadamente 7,6 mil millones). La tecnica de abliteration elimina o reduce la direccion de rechazo aprendida durante el alineamiento, de modo que el modelo responde a peticiones que un modelo alineado convencionalmente rechazaria.

La relevancia de esta publicacion es practica: mradermacher genera las cuantizaciones GGUF que permiten ejecutar el modelo en hardware de consumo mediante llama.cpp, Ollama u otros runtimes compatibles. El repositorio incluye doce variantes de cuantizacion, desde Q2_K (3,1 GB) hasta f16 (15,3 GB), lo que cubre un rango amplio de presupuestos de VRAM. El autor etiqueta el modelo con los terminos "obliteratus", "abliteration", "uncensored" y "obliterate", y declara el idioma ingles como unico idioma soportado.

El repositorio ocupa 68,1 GB en total, tiene 0 descargas y 1 like en el momento de la consulta, y no declara licencia ni pipeline de forma explicita. Se trata, por tanto, de una publicacion reciente y de nicho, orientada a usuarios que necesitan inferencia local sin restricciones de contenido y que aceptan las advertencias legales y eticas asociadas a los modelos abliterados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-7B, con abliteration) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (transformers y gguf como librerias declaradas) |

## Arquitectura y entrenamiento

El modelo base de esta cuantizacion es BabarAzaa/Qwen2.5-7B-OBLITERATED, que a su vez parte de la arquitectura Qwen2.5-7B: un transformer decoder-only con atencion causal. Sobre ese modelo se aplico una tecnica de abliteration, cuyo objetivo es identificar y sustraer la direccion latente responsable de las respuestas de rechazo, de forma que el modelo deja de negarse a responder ante determinadas peticiones. El resultado es un modelo con el mismo tamano de parametros (7,6 mil millones) pero con el comportamiento de alineamiento alterado.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO u otros metodos de alineamiento posteriores al proceso de abliteration. El autor de las cuantizaciones (mradermacher) se limita a convertir los pesos originales a formato GGUF con `convert_type: hf` y `quantize_version: 2`, sin aportar informacion adicional sobre el entrenamiento. No se mencionan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles, con la etiqueta "conversational" declarada por el autor.
- Respuesta a peticiones que los modelos alineados convencionalmente rechazan, como consecuencia directa del proceso de abliteration.
- Compatible con endpoints (etiqueta `endpoints_compatible`) y con el ecosistema transformers.
- Ejecutable en runtimes que consumen GGUF, lo que habilita inferencia local y offline.
- No se declaran capacidades explicitas de tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni modo "thinking" en la informacion disponible.
- Capacidad multilingue limitada al ingles segun la etiqueta `language: en`.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar empiricamente que comportamientos cambian tras aplicar abliteration, comparandolo con el Qwen2.5-7B original en tareas controladas.
- Generacion de contenido creativo sin filtros: util para escritura de ficcion que aborda temas que los modelos alineados suelen eludir, siempre que se respeten las normas legales aplicables.
- Red teaming y evaluacion de riesgos: sirve como sujeto de prueba para medir la eficacia de sistemas de moderacion y de clasificadores de contenido.
- Inferencia local en equipos de desarrollo: con cuantizaciones Q4_K_M (4,8 GB) se puede desplegar en un portatil con GPU de gama media para pruebas de integracion.
- Prototipado rapido de chatbots: al ser compatible con endpoints y transformers, se integra en pipelines existentes para validar flujos conversacionales antes de migrar a modelos mayores.
- Experimentacion con cuantizacion: las doce variantes permiten medir el impacto de la cuantizacion en la calidad de salida, desde Q2_K hasta f16, en un mismo modelo base.
- Analisis de sesgos y del comportamiento de rechazo: comparar las respuestas de este modelo con las de Qwen2.5-7B original ayuda a documentar como la abliteration modifica la distribucion de respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card y los metadatos facilitados no incluyen cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni comparaciones numericas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia (tamano de fichero + overhead aproximado de contexto y runtime):
  - Q2_K: 3,1 GB de fichero, aproximadamente 4 GB de VRAM.
  - Q3_K_S / Q3_K_M / Q3_K_L: 3,6-4,2 GB de fichero, aproximadamente 4,5-5,5 GB.
  - IQ4_XS / Q4_K_S / Q4_K_M: 4,4-4,8 GB de fichero, aproximadamente 5,5-6,5 GB.
  - Q5_K_S / Q5_K_M: 5,4-5,5 GB de fichero, aproximadamente 6,5-7,5 GB.
  - Q6_K: 6,4 GB de fichero, aproximadamente 7,5-8,5 GB.
  - Q8_0: 8,2 GB de fichero, aproximadamente 9,5-10,5 GB.
  - f16: 15,3 GB de fichero, aproximadamente 17-18 GB.
- GPU recomendadas: las cuantizaciones Q8_0 y f16 encajan comodamente en RTX 4090 (24 GB), A100 (40/80 GB) y H100 (80 GB). Las variantes Q4 y Q5 son adecuadas para RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores.
- Cabe en GPU de consumo: si. Q2_K y Q3_K caben en GPUs de 6-8 GB; Q4_K_M en 8 GB o mas; Q5 y Q6 en 8-12 GB; Q8_0 requiere 10-12 GB; f16 requiere 16 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. El modelo tambien se puede cargar con la libreria transformers, aunque para ese caso es preferible usar los pesos originales no cuantizados.
- Latencia y throughput estimados: no disponibles. Dependen del hardware, del tamano de contexto configurado y del backend utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-7B-OBLITERATED-GGUF (este) | 7,6 B | no disponible | no disponible | GGUF | Version abliterada, 12 cuantizaciones |
| Qwen2.5-7B (oficial) | 7,6 B | no disponible en la info aportada | Apache 2.0 (segun el modelo original, no confirmado aqui) | safetensors, GGUF | Modelo alineado de referencia |
| BabarAzaa/Qwen2.5-7B-OBLITERATED | 7,6 B | no disponible | no disponible | safetensors | Modelo fuente sin cuantizar de esta publicacion |

No se dispone de datos de otras alternativas abliteradas directamente comparables en la informacion proporcionada, por lo que no se incluyen cifras de rendimiento comparativo.

## Limitaciones y advertencias

- Al tratarse de un modelo abliterado, la ausencia de rechazo puede facilitar la generacion de contenido danino, ilegal o eticamente problematico. El uso en produccion exige moderacion externa.
- La licencia no esta declarada, lo que impide confirmar si se permite el uso comercial. El modelo original Qwen2.5-7B es de licencia Apache 2.0, pero la version abliterada no especifica terminos propios.
- El idioma soportado declarado es unicamente el ingles; el rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- La longitud de contexto no se especifica en la informacion disponible, por lo que no se puede confirmar la ventana real de trabajo.
- La abliteration puede degradar capacidades generales del modelo (razonamiento, coherencia o seguimiento de instrucciones) respecto al Qwen2.5-7B original, aunque no hay benchmarks que cuantifiquen esa perdida.
- Riesgo de alucinacion inherente a los modelos de 7 B, agravado por la ausencia de evaluaciones publicadas.
- El repositorio no declara pipeline, lo que limita la validacion automatica por parte de la plataforma.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) pueden degradar notablemente la calidad de salida; el propio autor recomienda Q4_K_S y Q4_K_M como opciones rapidas y Q6_K como "muy buena calidad".
- El autor indica que las cuantizaciones weighted/imatrix no estaban disponibles en el momento de la publicacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen2.5-7B-OBLITERATED-GGUF
- Modelo base (sin cuantizar): https://huggingface.co/BabarAzaa/Qwen2.5-7B-OBLITERATED
- Pagina de resumen y descargas del cuantizador: https://hf.tst.eu/model#Qwen2.5-7B-OBLITERATED-GGUF
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

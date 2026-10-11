# litert-community/MiniCPM5-1B

## Resumen

MiniCPM5-1B (LiteRT-LM) es la version empaquetada para LiteRT del modelo denso MiniCPM5-1B desarrollado por OpenBMB. Este repositorio, publicado por la organizacion litert-community, no contiene los pesos originales en safetensors, sino tres artefactos `.litertlm` cuantizados y optimizados para inferencia completamente local en dispositivos moviles y hardware de borde. El modelo base es un transformer causal de tipo `LlamaForCausalLM` con 1.080.632.832 parametros totales (679.552.512 sin contar embeddings), 24 capas y atencion con GQA de 16 cabezas de consulta frente a 2 de clave/valor.

Su relevancia actual esta en dos ejes. Por un lado, la ventana de contexto nativa de 131.072 tokens, inusualmente grande para la clase de 1B parametros, que lo habilita para asistentes locales con historial largo y flujos de agentes con muchas llamadas a herramientas. Por otro, la receta de cuantizacion mixta INT4-block32 en las capas lineales e INT8 en embeddings y cabeza de salida, con activaciones en FP32, que reduce el peso del modelo lo suficiente como para ejecutarse en telefonos Android de gama alta mediante la aplicacion Edge Gallery o mediante la CLI de LiteRT-LM.

El modelo conserva las capacidades del checkpoint original: razonamiento hibrido con plantilla `<think>` (desactivado por defecto salvo que se pase `enable_thinking`), soporte de tool calling parseado por el propio runtime y generacion de codigo. La licencia es Apache-2.0, heredada del modelo upstream, lo que permite uso comercial sin restricciones adicionales. El repositorio ocupa 9,2 GB en total, sumando las tres variantes publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso, `LlamaForCausalLM` |
| Parametros totales | 1.080.632.832 (~1B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Parametros sin embeddings | 679.552.512 |
| Capas | 24 |
| Cabezas de atencion | 16 (Q) / 2 (KV), GQA |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | Mixed INT4-block32 (lineales) + INT8 (embedding y lmhead) con activaciones FP32 (`wi4b32_wi8_afp32`); INT8 weight-only dinamico con activaciones FP32 (`dynamic_wi8_afp32`); BF16 disponible en el modelo upstream |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); safetensors BF16 en el repositorio `openbmb/MiniCPM5-1B` |
| Runtime requerido | litert-lm 0.18.0 o superior (probado en 0.18.0) |
| Tamano total del repositorio | 9,2 GB (tres variantes) |

Variantes publicadas en el repositorio:

| Archivo | Receta de cuantizacion | Notas |
|---|---|---|
| `minicpm_wi4b32_wi8_afp32.litertlm` | INT4-block32 / INT8, activaciones FP32 | Configuracion oficial de MiniCPM5 en LiteRT-LM |
| `minicpm_wi4b32_wi8_afp32_gpu_opt.litertlm` | Igual que la anterior | Optimizada para ejecucion en GPU |
| `MiniCPM5-1B_dynamic_wi8_afp32.litertlm` | INT8 weight-only dinamico, activaciones FP32 | Asignacion estatica de memoria en prefill |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal denso estandar, implementado como `LlamaForCausalLM`, con 24 capas, atencion por consultas agrupadas (16 cabezas Q frente a 2 cabezas KV) y 1.080.632.832 parametros, de los cuales 679.552.512 no pertenecen a los embeddings. No emplea mezcla de expertos, atencion lineal ni arquitecturas hibridas SSM: la eficiencia se busca en el rango de parametros y en la cuantizacion, no en cambios estructurales. La longitud de contexto nativa es de 131.072 tokens, un valor poco habitual en modelos de ~1B.

No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni la existencia de fases de RLHF o DPO en el modelo original. La model card si describe el modo de razonamiento hibrido: un unico checkpoint actua como asistente rapido o como razonador deliberado segun la plantilla `<think>` y el parametro `enable_thinking`, que por defecto esta desactivado. Cuando se activa, la traza de razonamiento se emite por un canal separado (`thought channel`), lo que permite al runtime filtrarla de la respuesta final. El parseo de llamadas a herramientas lo realiza el propio runtime de LiteRT-LM, no el modelo, de modo que el formato de tool calling depende de la version instalada.

La innovacion principal de este repositorio concreto es la receta de cuantizacion. Las capas lineales se cuantizan en INT4 con bloques de 32 elementos, mientras que el embedding y la cabeza de salida permanecen en INT8 y las activaciones en FP32. Esta combinacion busca preservar la precision en las partes mas sensibles (vocabulario y proyeccion final) sin renunciar a la compresion agresiva en el resto. Existe ademas una variante con asignacion estatica de memoria en la fase de prefill, pensada para reducir fragmentacion en dispositivos con memoria limitada.

## Capacidades

- Generacion de texto en ingles y chino, con foco declarado en la clase de 1B parametros.
- Razonamiento hibrido: modo asistente directo y modo razonador deliberado mediante `enable_thinking=true` y la plantilla `<think>`.
- Razonamiento dificil: la model card situa al modelo como referente de su clase en razonamiento complejo segun el autor.
- Generacion de codigo: incluida entre las capacidades destacadas por el autor para su rango de tamano.
- Tool calling y function calling: soportado, con el parseo delegado al runtime de LiteRT-LM.
- Flujos de agente y razonamiento multi-paso: la ventana de 131.072 tokens y el soporte de herramientas lo permiten.
- Ejecucion completamente local en dispositivo, sin conexion a red, gracias al formato `.litertlm`.
- Capacidades multilingues limitadas a ingles y chino; no se declaran otros idiomas.
- Canal de pensamiento separado: la traza de razonamiento se emite por el `thought channel` y puede excluirse de la salida visible.
- No se declaran capacidades de vision ni de audio en la informacion disponible.

## Casos de uso

- Asistentes de voz o texto en movil sin conexion: el modelo se integra en la aplicacion Edge Gallery (Android) y responde localmente, con lo que se evita enviar conversaciones del usuario a servidores externos y se elimina la dependencia de red.
- Agentes locales con tool calling: al soportar function calling parseado por el runtime, puede encadenar herramientas (calendario, contactos, busqueda local) en el propio dispositivo y resolver tareas multi-paso sin exponer datos.
- Autocompletado y asistencia de codigo en el editor: con 1B parametros y soporte de generacion de codigo, encaja en plugins de IDE que necesitan latencia baja y no pueden permitirse llamadas a API externas por politica de empresa.
- Procesamiento de documentos largos: la ventana de 131.072 tokens permite resumir o extraer informacion de informes, contratos o transcripciones extensas en una sola pasada, sin troceado ni recuperacion adicional.
- Atencion al cliente en el borde: conversaciones multi-turno con historial largo, ejecutadas en el terminal o en un servidor pequeno, utiles cuando hay requisitos de residencia de datos o despliegues en tienda sin conectividad estable.
- Sistemas embebidos y robots: al ejecutarse con la CLI de LiteRT-LM o embeberse via la libreria `litert`, sirve como interfaz en lenguaje natural en dispositivos con CPU/GPU integrada y memoria restringida.
- Clasificacion y extraccion de informacion en pipelines locales: uso como extractor estructurado de campos en formularios o correos, aprovechando el modo sin razonamiento para minimizar consumo de contexto y latencia.
- Prototipado rapido en escritorio: `uvx litert-lm run --from-huggingface-repo=litert-community/MiniCPM5-1B` permite probar la variante INT8 dinamica en un portatil antes de decidir el despliegue final en movil.

## Benchmarks y rendimiento

La model card publica unicamente la comparativa entre la linea base en precision completa (BF16) y la version cuantizada W4, con el modo de razonamiento desactivado, temperatura 0,6, top-p 0,95 y semilla 0.

| Categoria | FP (bf16) | W4 |
|---|---|---|
| Global | 66,16 | 60,91 |
| STEM | 58,07 | 53,36 |
| Ciencias sociales | 77,91 | 70,87 |
| Humanidades | 67,65 | 64,35 |
| Otros | 68,71 | 62,14 |
| Dificil | 47,08 | 44,23 |

La variante W4 corresponde a la receta mixta INT4-block32 (lineales) / INT8 (embedding y lmhead) con activaciones FP32 (`wi4b32_wi8`). La perdida de precision global es de 5,25 puntos porcentuales, con el mayor deterioro en ciencias sociales (7,04 puntos) y el menor en la categoria "dificil" (2,85 puntos).

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) frente a modelos de otras familias en la informacion disponible. La model card menciona una seccion de rendimiento medida en Apple M4 Max, pero el contenido esta truncado y no se incluyen cifras de latencia o throughput.

## Requisitos de hardware

Los siguientes valores de memoria son estimaciones derivadas del numero de parametros y de la receta de cuantizacion, no cifras publicadas por el autor.

- Pesos en BF16 (modelo upstream): aproximadamente 2,2 GB solo para pesos.
- Pesos con `dynamic_wi8_afp32` (INT8): aproximadamente 1,1-1,2 GB.
- Pesos con `wi4b32_wi8_afp32` (INT4 en lineales): aproximadamente 0,6-0,8 GB.
- A estos valores hay que sumar el cache KV. Con 24 capas y solo 2 cabezas KV, el coste por token es reducido, pero a 131.072 tokens de contexto puede superar el gigabyte; es el principal consumidor de memoria en escenarios de contexto largo.
- Cabe en GPU de consumo: si, en cualquier GPU con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4090) para las variantes cuantizadas, incluso con contexto largo.
- Cabe en hardware movil de gama alta: si, es el objetivo declarado del repositorio; la aplicacion Edge Gallery esta disponible en Google Play.
- GPU de centro de datos (A100, H100) no son necesarias; solo tendrian sentido para servir muchas peticiones concurrentes con vLLM u otro servidor.
- Opciones de despliegue: LiteRT-LM (CLI `litert-lm` 0.18.0 o superior, o embebido via la libreria `litert`), aplicacion Edge Gallery en Android, e instalacion por ADB del archivo `.litertlm`.
- La variante `_gpu_opt` esta pensada para ejecucion en GPU del dispositivo; las otras dos, para CPU o NPU.
- No se dispone de datos publicados de latencia ni de throughput en la informacion proporcionada. La seccion de rendimiento en Apple M4 Max aparece truncada en la model card.
- No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI en este repositorio; esos runtimes corresponderian al modelo upstream en safetensors, no a los artefactos `.litertlm`.

## Comparativa con modelos similares

La comparativa se limita a parametros, contexto, licencia y disponibilidad, ya que no hay datos de rendimiento publicados que permitan comparar resultados. Los datos de los modelos alternativos son de referencia general y conviene verificarlos en sus repositorios oficiales.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad en formato de borde |
|---|---|---|---|---|
| MiniCPM5-1B (LiteRT-LM) | ~1,08B | 131.072 | Apache-2.0 | `.litertlm` oficial, optimizado para Android/movil |
| MiniCPM5-1B (upstream, openbmb) | ~1,08B | 131.072 | Apache-2.0 | Safetensors BF16 |
| Qwen2.5-1.5B-Instruct | ~1,5B | 32.768 nativo | Apache-2.0 | Multiples cuantizaciones de la comunidad |
| Llama-3.2-1B-Instruct | ~1,23B | 131.072 | Llama 3.2 Community License | Formatos de borde via ecosistema externo |
| SmolLM2-1.7B-Instruct | ~1,7B | 8.192 (extensible) | Apache-2.0 | Multiples cuantizaciones de la comunidad |

Frente a estas alternativas, MiniCPM5-1B destaca por combinar el menor numero de parametros con la ventana de contexto mas amplia, y por ser el unico que ofrece una ruta de despliegue en movil mantenida por el propio ecosistema LiteRT de Google. Su desventaja relativa es el soporte de idiomas: solo ingles y chino, frente a las coberturas multilingues mas amplias de Qwen o Llama. En rendimiento comparado, no disponible.

## Limitaciones y advertencias

- Idiomas: solo ingles y chino. No hay soporte declarado de castellano ni de otras lenguas, por lo que su uso en produccion en espanol no esta respaldado por el autor.
- Riesgo de alucinacion: inherente a un modelo de 1B parametros; la ventana de contexto larga no garantiza fidelidad sobre documentos extensos y conviene validar la salida en tareas de extraccion.
- Sesgos: no se publica ninguna evaluacion de sesgos, toxicidad o fairness en la informacion disponible.
- Perdida de precision por cuantizacion: la receta W4 rebaja la puntuacion global de 66,16 a 60,91 en la evaluacion del autor. En tareas sensibles conviene evaluar la variante INT8 dinamica o el modelo BF16 antes de decidir.
- Dependencia del runtime: el tool calling y el canal de razonamiento los gestiona LiteRT-LM, no el modelo. Se requiere la version 0.18.0 o superior (probado en 0.18.0); versiones distintas pueden cambiar el formato de las llamadas o el comportamiento del canal `thought`.
- Modo de razonamiento desactivado por defecto: si no se pasa `enable_thinking=true`, el modelo responde sin cadena de pensamiento, lo que puede afectar a tareas de razonamiento complejo. Ademas, la traza de pensamiento consume contexto adicional, por lo que conviene desactivarla en contextos muy largos.
- Licencia: Apache-2.0, permisiva y apta para uso comercial, sin clausulas de atribucion mas alla de las habituales de la licencia. El modelo upstream usa la misma licencia.
- Cita bibliografica: el bloque BibTeX de la model card referencia el articulo de MiniCPM4 (arXiv:2506.07900), no un articulo especifico de MiniCPM5. Conviene verificarlo antes de citar el modelo en un trabajo academico.
- Repositorio con 0 descargas registradas en el momento de la consulta y 8 likes; el ecosistema de terceros alrededor del formato `.litertlm` es todavia reducido comparado con GGUF.
- Las estimaciones de memoria de la seccion de hardware son calculos, no cifras publicadas; deben validarse en el dispositivo objetivo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/litert-community/MiniCPM5-1B
- Modelo base en BF16: https://huggingface.co/openbmb/MiniCPM5-1B
- Repositorio GitHub de MiniCPM: https://github.com/OpenBMB/MiniCPM
- Documentacion de LiteRT: https://ai.google.dev/edge/litert
- Documentacion de LiteRT-LM: https://ai.google.dev/edge/litert-lm
- Aplicacion Edge Gallery en Google Play: https://play.google.com/store/apps/details?id=com.google.ai.edge.gallery
- Releases de Edge Gallery (APK): https://github.com/google-ai-edge/gallery/releases
- Wiki de Edge Gallery: https://github.com/google-ai-edge/gallery/wiki
- Codigo fuente de Edge Gallery: https://github.com/google-ai-edge/gallery
- Articulo citado en la model card (MiniCPM4): https://arxiv.org/abs/2506.07900
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; todos los enlaces anteriores proceden de la model card del repositorio.

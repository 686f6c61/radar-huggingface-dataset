# mradermacher/Liberation-Qwen3-8B-i1-GGUF

## Resumen

Liberation-Qwen3-8B-i1-GGUF es la versión cuantizada en formato GGUF del modelo TeskesLab/Liberation-Qwen3-8B, un modelo de lenguaje de 8.190.735.360 parámetros derivado de la familia Qwen3 y sometido a un proceso de *abliteration*, es decir, la eliminación o atenuación de la dirección de rechazo en el espacio de activaciones para reducir los comportamientos de negativa del modelo. Lo publica mradermacher, un perfil conocido por producir cuantizaciones GGUF con *imatrix* de modelos de terceros, no el autor original de los pesos.

El interés de esta ficha es doble. Por un lado, documenta una distribución puramente de inferencia: no hay pesos en safetensors en este repositorio, solo ficheros GGUF en el rango de 3,2 GB (i1-IQ2_M) a 6,8 GB (i1-Q6_K), más el fichero imatrix de 0,1 GB utilizado para generarlos, dentro de un repositorio de 43,6 GB que contiene todas las variantes. Por otro, el modelo base es un Qwen3-8B *instruction-tuned* y alineado mediante abliteration, lo que sitúa la ficha en el terreno de los modelos "uncensored": útil para investigación sobre alineación y para generación creativa sin filtros, pero con caveats claros de seguridad si se despliega en producción.

La licencia declarada es Apache 2.0 y el único idioma documentado es el inglés. No hay benchmarks, no hay ficha técnica del entrenamiento y el repositorio registra 0 descargas y 1 like en el momento de la consulta, por lo que se trata de una publicación reciente y sin validación comunitaria. Todo lo que sigue distingue explícitamente entre datos aportados por el autor y datos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-8B segun el nombre del modelo base; la model card no describe la arquitectura) |
| Parametros totales | 8.190.735.360 (dato de safetensors del modelo base) |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | i1-IQ2_M, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_M, i1-Q3_K_M, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_K_S, i1-Q4_K_M, i1-Q6_K (variantes ponderadas con imatrix); existen quants estaticos en un repositorio aparte |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF exclusivamente (mas fichero imatrix de 0,1 GB); el repositorio no incluye safetensors |

Nota sobre el contexto: la model card de esta cuantizacion no declara ventana de contexto. La familia Qwen3 documenta habitualmente 32.768 tokens nativos y hasta 131.072 con escalado YaRN, pero ese dato no aparece en la informacion proporcionada para este repositorio y no se ha verificado aqui.

Tamano de cada variante (GB, segun la tabla del autor):

| Variante | Tamano (GB) | Comentario del autor |
|---|---:|---|
| i1-IQ2_M | 3,2 | - |
| i1-Q2_K | 3,4 | "IQ3_XXS probably better" |
| i1-IQ3_XXS | 3,5 | "lower quality" |
| i1-IQ3_M | 4,0 | - |
| i1-Q3_K_M | 4,2 | "IQ3_S probably better" |
| i1-IQ4_XS | 4,7 | - |
| i1-IQ4_NL | 4,9 | "prefer IQ4_XS" |
| i1-Q4_K_S | 4,9 | "optimal size/speed/quality" |
| i1-Q4_K_M | 5,1 | "fast, recommended" |
| i1-Q6_K | 6,8 | "practically like static Q6_K" |

## Arquitectura y entrenamiento

No hay informacion tecnica sobre el entrenamiento en la documentacion disponible. La model card de esta cuantizacion es una plantilla generica de mradermacher que solo indica el origen de los pesos (TeskesLab/Liberation-Qwen3-8B), el metodo de cuantizacion (ponderada con imatrix, version 2 del pipeline de cuantizacion, conversion de tipo HF) y la lista de ficheros generados. No se especifican tokens de entrenamiento, composicion del corpus, uso de RLHF/DPO ni recetas de destilacion.

Lo unico inferible con seguridad es el proceso de *abliteration*: la etiqueta "abliteration" y el nombre "Liberation" indican que se ha identificado y restado (o proyectado fuera) una direccion de rechazo calculada a partir de las activaciones del modelo alineado original, con el objetivo de que el modelo deje de producir negativas sistematicas ante peticiones que el modelo base rechazaria. Es una intervencion post-entrenamiento sobre los pesos, no un reentrenamiento, y habitualmente se aplica capa a capa sobre los módulos de atención y MLP. El resultado suele conservar la mayor parte de las capacidades del modelo original mientras degrada los mecanismos de rechazo, con perdida variable de coherence en tareas que dependian de ese comportamiento.

La cuantizacion i1 implica el uso de una matriz de importancia (imatrix) calculada a partir de un corpus de calibracion, que guia la asignacion de bits por tensor. Segun el propio autor, los cuants IQ suelen ser preferibles a los no-IQ de tamano similar, y la grafica de perplejidad enlazada (ikawrakow) y las notas de Artefact2 se citan como referencia metodologica. No se documenta el corpus de calibracion empleado.

## Capacidades

- Generacion de texto conversacional e instrucciones en ingles, heredadas del modelo base Qwen3-8B instruction-tuned.
- Modo "uncensored": reduccion deliberada de rechazos ante contenido sensible, como consecuencia directa de la abliteration.
- Conversacion multi-turno con plantilla de chat (el repositorio declara compatibilidad con endpoints y etiqueta "conversational").
- Razonamiento y generacion de codigo: capacidades propias de la familia Qwen3, no documentadas ni verificadas en esta ficha.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Comportamiento agentico y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles; el pipeline no esta declarado y el repositorio solo contiene GGUF de lenguaje.
- Capacidades multilingues: limitadas al ingles segun la etiqueta `language: en`; no se documenta soporte de castellano.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y abliteration: el modelo permite estudiar como varia la tasa de rechazo, la perplexidad y el rendimiento en tareas de razonamiento al eliminar la direccion de rechazo, comparando directamente contra el Qwen3-8B original con la misma cuantizacion.
- Generacion creativa sin filtros (ficcion, guiones, narrativa adulta): el modelo acepta premisas que el modelo base rechazaria, y su tamano de 8B permite iterar en local con Q4_K_M en una GPU de consumo.
- Prototipado de asistentes conversacionales en ingles sobre hardware modesto: con i1-IQ2_M (3,2 GB) se puede ejecutar en portatiles con GPU de 6-8 GB o incluso en CPU, lo que sirve para validar flujos de chat antes de invertir en infraestructura.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece diez variantes del mismo modelo con tamanos de 3,2 a 6,8 GB, lo que lo convierte en un banco de pruebas util para medir la perdida de calidad por bit (perplejidad, seguir instrucciones, coherencia en contextos largos).
- Despliegue de bajo coste en pipelines internos de generacion de texto en ingles: con Q4_K_M y llama.cpp o Ollama se obtiene un endpoint compatible con OpenAI sobre una unica GPU, sin dependencia de servicios externos ni de datos que salgan de la organizacion.
- Creacion de personajes y roleplay en aplicaciones de ocio: la combinacion de instruction tuning y ausencia de rechazos encaja con bots de personaje, donde el modelo base suele romper la inmersión con negativas.
- Filtrado y reescritura de textos que un modelo alineado bloquearia (por ejemplo, transcripcion de testimonios con lenguaje explicito o analisis de contenido conflictivo), manteniendo el texto dentro de un entorno controlado y con revision humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra métrica, y tampoco se aportan datos de perplejidad de las cuantizaciones. El autor enlaza una grafica externa de perplejidad por tipo de cuantizacion (ikawrakow) y un analisis de Artefact2, pero no ofrece valores propios medidos sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + cache KV y overhead, estimacion a partir del tamano de fichero; no medida por el autor):
  - i1-IQ2_M (3,2 GB): aproximadamente 4-5 GB de VRAM con contexto moderado.
  - i1-Q3_K_M (4,2 GB): aproximadamente 5-6 GB.
  - i1-Q4_K_S / i1-Q4_K_M (4,9-5,1 GB): aproximadamente 6-7,5 GB.
  - i1-Q6_K (6,8 GB): aproximadamente 8,5-10 GB.
- GPU recomendadas: el modelo cabe en tarjetas de consumo. RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090 ejecutan Q4_K_M y Q6_K con holgura. Para A100/H100 no tiene sentido por tamano, salvo despliegue agregado de muchas instancias; en ese caso conviene servir los pesos sin cuantizar del modelo base.
- Cabe en GPU de consumo: si. Con Q4_K_M en 8 GB de VRAM (RTX 3060 Ti, RTX 4060, RTX 3070) siempre que se limite el contexto; con IQ2_M o Q3_K_M en GPUs de 6 GB. Tambien es viable en CPU con llama.cpp, a velocidades de decodificacion muy inferiores.
- Opciones de despliegue: llama.cpp (backend de referencia para GGUF), Ollama, LM Studio, KoboldCpp, llama-cpp-python, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI no estan pensados para GGUF en produccion; si se necesita alto throughput conviene convertir o usar los pesos originales del modelo base.
- Latencia y throughput: no disponibles. No hay mediciones publicadas para estas cuantizaciones y cualquier cifra dependeria del backend, del hardware y de la longitud de contexto.

## Comparativa con modelos similares

No se dispone de datos verificados de alternativas en la informacion proporcionada. La tabla siguiente recoge solo lo que consta en esta ficha y marca como "no disponible" todo lo que no se ha podido confirmar; las alternativas se citan como referencia de categoria, sin datos de rendimiento contrastados.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/Liberation-Qwen3-8B-i1-GGUF (este) | 8,19 B | no disponible | Apache 2.0 | GGUF (10 variantes i1) | Abliterated, solo ingles, sin benchmarks |
| TeskesLab/Liberation-Qwen3-8B (base) | 8,19 B | no disponible | Apache 2.0 | safetensors (segun repo base) | Modelo de origen; esta cuantizacion solo lo empaqueta |
| mradermacher/Liberation-Qwen3-8B-GGUF | 8,19 B | no disponible | Apache 2.0 | GGUF estaticos | Mismo modelo, cuantizacion sin imatrix; citado por el autor |
| Qwen3-8B (familia de origen) | 8,19 B aprox. | no disponible aqui | no disponible aqui | safetensors | Referencia de capacidades y de comportamiento alineado; datos no verificados en esta ficha |

## Limitaciones y advertencias

- La abliteration elimina barreras de seguridad de forma intencionada. El modelo puede producir contenido violento, sexual, ilegal o danino que el Qwen3-8B original rechazaria; no es apto para exposicion directa a usuarios finales sin filtros externos.
- Riesgo de alucinacion: es el propio de un modelo de 8B, agravado por la ausencia total de evaluaciones publicadas. No hay evidencia de que la abliteration preserve el rendimiento en tareas factuales.
- Idiomas: solo ingles declarado. El rendimiento en castellano no esta documentado ni evaluado y probablemente sea deficiente en comparacion con modelos multilingues.
- Contexto: la model card no declara ventana de contexto. Si se necesita contexto largo, hay que verificarlo empiricamente antes de disenar el sistema.
- Cuantizaciones de 2 y 3 bits (IQ2_M, Q2_K, IQ3_XXS): el autor advierte explicitamente de menor calidad. No se recomienda su uso en produccion, solo en pruebas o entornos con VRAM muy limitada.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el autor original de los pesos y el cuantizador no ofrecen garantias ni asumen responsabilidad por el uso. Verificar la procedencia de los datos de entrenamiento del modelo base sigue siendo responsabilidad del desplegador.
- Madurez: 0 descargas y 1 like en el momento de la consulta, creado y actualizado el mismo dia (25 de octubre de 2026). Sin validacion de la comunidad, sin issues ni discusiones de referencia.
- La model card no describe el proceso de abliteration (capas intervenidas, corpus de calibracion, magnitud de la proyeccion), lo que impide reproducir o auditar el procedimiento.
- El repositorio pesa 43,6 GB y contiene todas las variantes; descargar solo el fichero GGUF necesario para evitar transferencias innecesarias.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/mradermacher/Liberation-Qwen3-8B-i1-GGUF
- Modelo base: https://huggingface.co/TeskesLab/Liberation-Qwen3-8B
- Quants estaticos del mismo modelo: https://huggingface.co/mradermacher/Liberation-Qwen3-8B-GGUF
- Pagina de descarga y vision general del cuantizador: https://hf.tst.eu/model#Liberation-Qwen3-8B-i1-GGUF
- Peticiones y FAQ de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafica de perplejidad por tipo de cuantizacion (ikawrakow), enlazada por el autor: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia para el uso de GGUF (TheBloke), enlazado por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Empresa del cuantizador: https://www.nethype.de/

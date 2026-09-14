# mradermacher/Qwen3.5-9B-Theseus-GGUF

## Resumen

Qwen3.5-9B-Theseus-GGUF es la version cuantizada en formato GGUF del modelo nightmedia/Qwen3.5-9B-Theseus, publicada por el usuario mradermacher, especializado en la conversion de pesos a formatos ligeros para inferencia local. El modelo original cuenta con 9.197.093.888 parametros (aproximadamente 9,2 mil millones) y esta construido sobre la familia Qwen3.5, con licencia Apache 2.0 y soporte declarado para ingles, chino, japones y espanol. Esta ficha describe principalmente el repositorio GGUF, que actua como distribucion practica del modelo para herramientas de inferencia local.

El interes de esta publicacion reside en que concentra tres ejes poco habituales en un mismo modelo de 9B: una ventana de contexto declarada de hasta 1.000.000 de tokens (con 256.000 tokens tambien etiquetado), capacidades de razonamiento con cadena de pensamiento larga (long-CoT) heredadas de procesos de destilacion, y una orientacion muy marcada hacia la escritura creativa y de ficcion (generacion de tramas, sub-tramas, continuacion de escenas, roleplay). Los tags del repositorio apuntan a tecnicas de SFT con LoRA, fusion mediante mergekit, destilacion desde un modelo de la familia Claude 4.6 y soporte de decodificacion especulativa por prediccion multi-token.

No obstante, conviene ser cauto: el repositorio no incluye model card tecnica detallada mas alla de la tabla de cuantizaciones, el modelo base tiene 0 descargas y 0 likes en el momento de la consulta, y no se han publicado resultados de benchmarks. Se trata, por tanto, de un modelo experimental cuya evaluacion practica queda en manos del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base pertenece a la familia Qwen3.5; el repositorio no detalla el tipo de transformer ni si incorpora componentes MoE o hibridos) |
| Parametros totales | 9.197.093.888 (aproximadamente 9,2 B) |
| Parametros activos | no disponible (no se declara configuracion de mezcla de expertos; el recuento total de 9,2 B sugiere un modelo denso, pero no se confirma) |
| Longitud de contexto | 1.000.000 de tokens y 256.000 tokens aparecen como tags del repositorio; no se especifica cual es la configuracion por defecto ni la ventana efectiva con atencion estandar |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; adicionalmente mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (ingles), zh (chino), ja (japones), es (espanol) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF en este repositorio; el modelo base se distribuye en bf16 (safetensors) |
| Tamano del repositorio | 85,1 GB |
| Modelo base | nightmedia/Qwen3.5-9B-Theseus |
| Libreria declarada | transformers |
| Tarea | text-generation |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo: no se indica numero de capas, dimension del modelo, numero de cabezas de atencion, tipo de atencion (completa, lineal o mixta) ni el esquema de normalizacion. Lo unico contrastable es que se trata de un modelo de la familia Qwen3.5 con 9.197.093.888 parametros y que los tags del repositorio mencionan unicamente componentes de transformador estandar. La presencia de ficheros `mmproj` (proyector multimodal) junto a los pesos sugiere que el modelo base puede procesar entradas multimodales, aunque esta capacidad no se confirma de forma explicita en la documentacion del repositorio.

En cuanto al entrenamiento, los tags apuntan a un pipeline compuesto por ajuste supervisado (sft), adaptadores LoRA, fusion de modelos mediante mergekit, destilacion desde un modelo etiquetado como claude4.6 (claude-distillation) y el uso de utilidades de unsloth. Tambien aparecen etiquetas relacionadas con razonamiento explicito (reasoning, chain-of-thought, long-cot), con decodificacion especulativa y prediccion multi-token, y con tecnicas de "estado latente extendido" y "manifold personalizado" aplicadas a la generacion de ficcion. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF o DPO. Toda esta seccion debe considerarse indicativa y no verificada.

## Capacidades

- Generacion de texto conversacional con ajuste a instrucciones (instruction-tuned, conversational).
- Razonamiento explicito con cadena de pensamiento, incluyendo cadenas largas (long-CoT) segun los tags del modelo.
- Codigo: el repositorio incluye la etiqueta coding, aunque no se detallan lenguajes ni tareas concretas.
- Matematicas y disciplinas STEM: etiquetas math y stem.
- Escritura creativa y de ficcion: generacion de tramas, subtramas, continuacion de escenas, relatos, ciencia ficcion y "todos los generos" segun los tags.
- Roleplay y mantenimiento de personajes.
- Multilingue para cuatro idiomas declarados: ingles, chino, japones y espanol.
- Contexto largo: las etiquetas indican soporte de hasta 1M de tokens y 256k tokens.
- Posible soporte multimodal: el repositorio incluye proyectores mmproj, lo que implica compatibilidad con entradas no textuales en llama.cpp, aunque no se documenta oficialmente.
- Soporte de tool calling / function calling: no disponible (no se menciona en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no confirmado de forma explicita; las etiquetas de razonamiento y multi-token-prediction son compatibles con flujos de varios pasos, pero no hay documentacion al respecto.
- Decodificacion especulativa y prediccion multi-token: mencionadas como etiquetas tecnicas del modelo.

## Casos de uso

- Escritura de ficcion de formato largo: el modelo esta etiquetado especificamente para generacion de tramas, subtramas y continuacion de escenas, y su ventana de contexto declarada permite mantener coherencia argumental a lo largo de decenas de miles de tokens sin reinyectar resumenes constantemente.
- Asistente de narrativa interactiva y roleplay: con soporte declarado de cuatro idiomas y contexto amplio, puede sostener conversaciones multi-turno con personajes consistentes y memoria de hechos previos, un caso de uso habitual en comunidades de escritura colaborativa.
- Procesamiento de documentacion extensa: la ventana de 1M/256k tokens etiquetada permitiria analizar manuales tecnicos, expedientes o bases de codigo completas en una sola pasada, aunque en la practica el coste de la cache KV obliga a usar atencion eficiente y cuantizaciones agresivas.
- Generacion y revision de codigo en local: la etiqueta coding y el formato GGUF lo hacen desplegable en estaciones de trabajo sin GPU de datacenter, util para autocompletado, explicacion de fragmentos y generacion de tests en entornos con requisitos de privacidad.
- Apoyo a tareas STEM: con las etiquetas math y stem, encaja como asistente de resolucion de problemas paso a paso, mostrando el razonamiento (long-CoT) antes de la respuesta final, lo que facilita la verificacion por parte del estudiante o investigador.
- Atencion al cliente multilingue en infraestructura propia: al cubrir ingles, chino, japones y espanol y ser desplegable en local, permite construir un asistente de soporte sin enviar datos de clientes a APIs externas.
- Traduccion y localizacion asistida: con cuatro idiomas declarados, puede emplearse para borradores de traduccion y adaptacion de tono en contenidos editoriales, siempre con revision humana por el riesgo de alucinacion.
- Prototipado de investigacion sobre destilacion y fusion de modelos: el repositorio documenta un pipeline de sft, LoRA, mergekit y destilacion, lo que lo convierte en un caso de estudio para quienes investigan esas tecnicas, si bien la ausencia de benchmarks limita las conclusiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion estandar, y la busqueda web realizada no ha devuelto resultados tecnicos relevantes sobre este modelo.

## Requisitos de hardware

Estimaciones de VRAM basadas en el tamano de los ficheros publicados (los pesos mas overhead de contexto; el consumo real depende de la longitud de contexto y del backend):

- f16 (18,5 GB): requiere al menos 24 GB de VRAM para el modelo completo; 2x RTX 3090/4090, A100 40 GB, H100 80 GB o una unica GPU de 48 GB.
- Q8_0 (9,9 GB): RTX 4080/4090 (16-24 GB), RTX A6000, L40S.
- Q6_K (7,7 GB): RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, Apple Silicon con 16 GB unificados.
- Q5_K_M (6,7 GB) y Q5_K_S (6,6 GB): RTX 3060 12 GB con contexto moderado; Mac con 16 GB.
- Q4_K_M (5,9 GB) y Q4_K_S (5,6 GB): opcion recomendada por el autor ("fast, recommended"); cabe en GPUs consumer de 8 GB con contexto corto y en 12-16 GB con holgura.
- IQ4_XS (5,5 GB): alternativa de 4 bits con mejor relacion calidad/tamano que Q4_K_S segun la practica habitual de llama.cpp.
- Q3_K_L (5,1 GB), Q3_K_M (4,8 GB) y Q3_K_S (4,5 GB): GPUs de 6-8 GB; el autor marca Q3_K_M como "lower quality".
- Q2_K (4,0 GB): equipos muy limitados; degradacion de calidad notable.
- Ficheros mmproj (0,7 GB en Q8_0 y 1,0 GB en f16): memoria adicional si se activa la via multimodal.
- Cache KV: no se puede estimar sin conocer el numero de capas y cabezas de atencion. Usar 256k o 1M tokens de contexto exigiria tecnicas de atencion eficiente y memoria muy superior a la de los pesos; no se dispone de cifras.
- GPU recomendadas por rango: A100 40/80 GB y H100 80 GB para f16 con contexto largo; RTX 4090/4080 para Q8_0 y Q6_K; RTX 3060 12 GB, RTX 4060 Ti 16 GB y Apple Silicon de 16 GB para Q4 y Q5.
- Opciones de despliegue: llama.cpp y sus interfaces (llama-server), Ollama mediante Modelfile, LM Studio, koboldcpp, text-generation-webui y, para los formatos no GGUF, vLLM o TGI sobre los pesos bf16 del modelo base. El autor recomienda consultar los README de TheBloke para el manejo de GGUF y la concatenacion de ficheros multiparte.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de modelos comparables documentados en la informacion proporcionada, y el modelo base no publica benchmarks ni detalles de arquitectura que permitan una comparacion rigurosa. A modo de referencia de categoria (modelos densos de 7-9B desplegables en local), se recogen unicamente datos generales de contexto y licencia; los datos de rendimiento no estan disponibles para ninguno de ellos en el material consultado.

| Modelo | Parametros | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|
| Qwen3.5-9B-Theseus (este modelo) | 9,2 B | 1M / 256k segun tags | Apache 2.0 | no disponible |
| Modelos densos de la misma categoria (7-9 B) | 7-9 B | variable | variable (Apache 2.0, licencias comunitarias o de uso restringido) | no disponible |

Se recomienda no extraer conclusiones comparativas sin ejecutar evaluaciones propias sobre el modelo cuantizado en el hardware objetivo.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad en tareas de razonamiento, codigo o matematicas.
- Modelo experimental: el repositorio base acumula 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Documentacion tecnica incompleta: se desconoce el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF o DPO y el detalle de la arquitectura.
- Riesgo de alucinacion: no cuantificado, pero inherente a los modelos generativos de esta escala, especialmente en contextos largos y en tareas de codigo o datos numericos.
- Contexto declarado no verificado: los tags indican 1M y 256k tokens, pero no se documenta la ventana efectiva, ni el metodo de atencion, ni la degradacion de calidad a longitudes extremas.
- Idiomas limitados a ingles, chino, japones y espanol; el rendimiento relativo entre ellos no se especifica y no hay garantia de calidad homogenea en espanol.
- Sesgos: no documentados por el autor; cabe esperar los sesgos propios de los datos de destilacion y de los corpus de entrenamiento del modelo base.
- Trazabilidad de la destilacion: los tags mencionan destilacion desde un modelo etiquetado como claude4.6, sin detallar condiciones, permisos ni implicaciones legales asociadas a ese proceso.
- Licencia Apache 2.0 sobre el modelo cuantizado, pero conviene verificar las condiciones del modelo base y de los datos de destilacion antes de un uso comercial en produccion.
- Capacidad multimodal inferida, no confirmada: los ficheros mmproj sugieren soporte de imagenes, pero no hay documentacion que lo garantice.
- Compatibilidad: los pesos GGUF requieren llama.cpp o derivados; no son directamente cargables con vLLM o TGI sin conversion previa.
- Fecha de creacion del repositorio posterior a la fecha de consulta habitual, dato que conviene contrastar en la pagina de HuggingFace.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.5-9B-Theseus-GGUF
- Modelo base: https://huggingface.co/nightmedia/Qwen3.5-9B-Theseus
- Pagina de descargas del cuantizador para este modelo: https://hf.tst.eu/model#Qwen3.5-9B-Theseus-GGUF
- FAQ y peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de perplejidad entre cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- La busqueda web realizada no ha devuelto resultados tecnicos relevantes sobre este modelo (unicamente resultados genericos de YouTube y de un fabricante de bicicletas).

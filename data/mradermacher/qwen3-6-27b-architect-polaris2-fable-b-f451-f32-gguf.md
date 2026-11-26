# mradermacher/Qwen3.6-27B-Architect-Polaris2-Fable-B-F451-F32-GGUF

## Resumen

Qwen3.6-27B-Architect-Polaris2-Fable-B-F451-F32-GGUF es una cuantizacion estatica en formato GGUF del modelo nightmedia/Qwen3.6-27B-Architect-Polaris2-Fable-B-F451-F32, un modelo de 27.320.697.856 parametros derivado de la familia Qwen3.6 y afinado mediante tecnicas de destilacion (etiquetado como claude-distillation en los metadatos), SFT y LoRA, con fusion de pesos via mergekit. El autor de esta version cuantizada es mradermacher, un publicador habitual de cuantizaciones GGUF para la comunidad de inferencia local.

El modelo esta orientado a generacion de texto, razonamiento con cadena de pensamiento larga (long-CoT), codigo, matematicas y escritura creativa de ficcion, e incluye un modulo multimodal complementario (mmproj) que sugiere capacidades de vision. Los metadatos declaran soporte de contexto de hasta 1M de tokens, aunque tambien se etiqueta 256k, por lo que la ventana efectiva debe verificarse en el modelo base. Los idiomas declarados son ingles, chino, japones y espanol, y la licencia es Apache 2.0.

La relevancia practica de esta ficha es que permite ejecutar un modelo de 27B con contexto muy largo en hardware de consumo o en servidores con GPUs de gama alta, eligiendo entre 13 cuantizaciones GGUF que van de 11,0 GB (Q2_K) a 29,1 GB (Q8_0). Es, por tanto, una opcion para despliegue local con llama.cpp u Ollama, no para servir en produccion de alta concurrencia sin planificacion de VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.6; detalles internos de capas y atencion no disponibles) |
| Parametros totales | 27.320.697.856 (27,32B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 1M tokens y 256k tokens segun etiquetas del autor; valor efectivo no verificado |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mmproj en Q8_0 y f16; variantes i1 (imatrix) en repo separado |
| Idiomas soportados | en, zh, ja, es |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base publica safetensors en bf16 |
| Tamano del repo | 190,8 GB (incluye todas las cuantizaciones) |
| Pipeline | text-generation |
| Descargas / likes | 247 descargas, 1 like |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de su pertenencia a la familia Qwen3.6 (transformer decoder-only) y de las etiquetas qwen3_5, qwen3_6 y qwen3.6, que sugieren una base Qwen3.5/3.6. El modelo base se presenta como resultado de un proceso de destilacion desde un modelo tipo Claude 4.6 (etiqueta claude4.6 y claude-distillation), seguido de ajuste supervisado (SFT) y adaptadores LoRA, con fusion de pesos mediante mergekit. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

Las innovaciones tecnicas declaradas se limitan al razonamiento explicito con cadenas de pensamiento largas (reasoning, chain-of-thought, long-cot) y a una ventana de contexto extendida (1M/256k). El repositorio incluye un modulo mmproj, lo que indica que el modelo base incorpora o admite proyeccion multimodal para entrada de imagenes. No hay informacion sobre decodificacion especulativa, atencion lineal ni otras optimizaciones de inferencia.

## Capacidades

- Generacion de texto conversacional e instruccional (instruction-tuned).
- Razonamiento explicito con cadenas de pensamiento largas (long-CoT), adecuado para problemas de varios pasos.
- Generacion de codigo y tareas de ingenieria de software.
- Matematicas y disciplinas STEM.
- Escritura creativa: ficcion, generacion de trama y subtramas, continuacion de escenas, narrativa de todos los generos, ciencia ficcion y roleplaying.
- Capacidades multilingues en ingles, chino, japones y espanol.
- Entrada multimodal mediante el modulo mmproj incluido (Q8_0 o f16).
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: plausible por el modo long-CoT, pero no documentado explicitamente.

## Casos de uso

- Escritura de ficcion asistida: el modelo esta afinado especificamente para generacion de trama, subtramas y continuacion de escenas, por lo que puede mantener arcos narrativos largos apoyandose en la ventana de contexto extendida y en el modo de razonamiento para planificar capitulos.
- Analisis de repositorios y generacion de codigo: con 27B parametros y contexto de hasta 256k, puede ingerir modulos completos o varios ficheros y proponer refactorizaciones o tests; se desplegaria con llama.cpp en una estacion de trabajo con GPU de 24 GB o mas usando Q4_K_M.
- Razonamiento matematico y STEM por lotes: util para resolver problemas paso a paso en pipelines offline donde no se quiere depender de una API externa; el formato GGUF permite ejecutarlo en servidores propios con licencia Apache 2.0.
- Atencion al cliente y asistentes conversacionales multi-turno: el contexto largo permite arrastrar historiales extensos y documentacion de producto; requiere validacion de latencia, ya que un modelo denso de 27B en cuantizacion Q4 ronda los 16,9 GB y necesita GPU dedicada para respuestas interactivas.
- Traduccion y localizacion entre ingles, chino, japones y espanol: el soporte declarado de estos cuatro idiomas permite usarlo en flujos de traduccion tecnica o de contenidos, con revision humana por el riesgo de alucinacion en terminologia especializada.
- Procesamiento de documentos largos con componente visual: gracias al mmproj, se pueden pasar imagenes junto con texto para extraer informacion de capturas, diagramas o documentos escaneados en un flujo local.
- Prototipado de agentes con razonamiento multi-paso: el modo long-CoT facilita encadenar planes y verificar resultados intermedios, aunque la ausencia de documentacion sobre tool calling obliga a implementar el parseo de acciones en el orquestador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin cache KV): Q2_K 11,0 GB; Q3_K_S 12,4 GB; Q3_K_M 13,6 GB; Q3_K_L 14,7 GB; IQ4_XS 15,5 GB; Q4_K_S 15,9 GB; Q4_K_M 16,9 GB; Q5_K_S 19,1 GB; Q5_K_M 19,6 GB; Q6_K 22,5 GB; Q8_0 29,1 GB; F16 aproximadamente 54,6 GB (27,32B x 2 bytes).
- Modulo multimodal adicional: 0,7 GB (mmproj-Q8_0) o 1,0 GB (mmproj-f16).
- Cache KV: no cuantificada en los datos disponibles; con contexto de 256k o 1M el consumo adicional es determinante y debe calcularse segun capas y cabezas del modelo base, dato no disponible.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M con contexto moderado; A100 40/80 GB o H100 para Q8_0 y contextos largos; multiples GPUs para F16.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) con Q4_K_M o Q5_K_M, y en GPUs de 16 GB solo con Q2_K o Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base en safetensors se sirve con transformers, vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.6-27B-Architect-Polaris2-Fable-B-F451-F32 (este, GGUF) | 27,32B | 1M / 256k declarados | Apache 2.0 | GGUF, 13 cuantizaciones, mmproj | Afinado para ficcion, razonamiento y codigo; destilado |
| nightmedia/Qwen3.6-27B-Architect-Polaris2-Fable-B-F451-F32 | 27,32B | 1M / 256k declarados | Apache 2.0 | safetensors bf16 | Modelo base del que deriva esta cuantizacion |
| Qwen3.6-27B-Architect-Polaris2-Fable-B-F451-F32-i1-GGUF (mradermacher) | 27,32B | idem | Apache 2.0 | GGUF con cuantizacion imatrix | Misma base, cuantizacion ponderada de mayor calidad esperada |
| Alternativas de ~27-32B de la familia Qwen | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados para comparar rendimiento |

## Limitaciones y advertencias

- Modelo experimental: las etiquetas incluyen experimental y distillation, sin benchmarks publicados que respalden el rendimiento real.
- Riesgo de alucinacion: al ser un modelo destilado y afinado para ficcion, puede generar contenido verosimil pero falso, especialmente en datos factuales, citas y referencias.
- Contexto: las etiquetas declaran 1M y 256k simultaneamente; la ventana efectiva no esta verificada y el consumo de cache KV a esas longitudes puede hacer inviable el despliegue en GPU de consumo.
- Idiomas: solo se declaran en, zh, ja y es; el rendimiento en espanol no esta documentado y puede ser inferior al de ingles.
- Tool calling y agentes: no confirmados; no disenar pipelines que dependan de function calling sin validacion previa.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base incorpora destilacion de un modelo de terceros (etiqueta claude4.6); conviene revisar las condiciones del proveedor original antes de un uso comercial a gran escala.
- Cuantizaciones bajas: Q2_K y Q3_K_S degradan la calidad de forma notable; el propio autor marca Q3_K_M como lower quality y recomienda Q4_K_S o Q4_K_M para uso general.
- Repositorio de 190,8 GB: descargar solo los ficheros necesarios; los GGUF pueden estar divididos en varias partes.
- Sin datos de latencia ni throughput: no apto para planificar SLA de produccion sin pruebas de carga propias.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.6-27B-Architect-Polaris2-Fable-B-F451-F32-GGUF
- Modelo base: https://huggingface.co/nightmedia/Qwen3.6-27B-Architect-Polaris2-Fable-B-F451-F32
- Cuantizaciones imatrix (i1): https://huggingface.co/mradermacher/Qwen3.6-27B-Architect-Polaris2-Fable-B-F451-F32-i1-GGUF
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#Qwen3.6-27B-Architect-Polaris2-Fable-B-F451-F32-GGUF
- Guia de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests

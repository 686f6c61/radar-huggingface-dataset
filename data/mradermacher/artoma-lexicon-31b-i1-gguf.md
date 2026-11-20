# mradermacher/Artoma-Lexicon-31B-i1-GGUF

## Resumen

Artoma-Lexicon-31B-i1-GGUF es la distribucion en formato GGUF del modelo Artoma-Lexicon-31B, un merge de modelos de lenguaje de 30.697.345.596 parametros (aproximadamente 30,7 mil millones) orientado a roleplay conversacional y ficcion interactiva. El modelo original fue creado por Casual-Autopsy mediante tecnicas de fusion (mergekit) con los metodos Della y breadcrumbs_ties en un proceso multi-step_merge, y esta version ha sido cuantizada por mradermacher con su pipeline i1 (imatrix) para su uso en entornos de inferencia local.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 31B en hardware de consumo gracias a las cuantizaciones GGUF, que van desde los 7,3 GB de la variante IQ1_S hasta los 25,3 GB de la Q6_K. El modelo esta etiquetado como "dark_roleplay" y "not-for-all-audiences", lo que indica que su entrenamiento esta orientado a contenido narrativo adulto y tematicas oscuras, no a tareas generales de asistencia o codigo.

La licencia declarada es Apache 2.0 y el unico idioma soportado es el ingles. No se dispone de informacion sobre longitud de contexto, composicion del dataset de entrenamiento ni resultados de benchmarks en la documentacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (merge de modelos, sin detalles especificos disponibles) |
| Parametros totales | 30.697.345.596 (aproximadamente 30,7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (formato i1/imatrix) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base Artoma-Lexicon-31B es el resultado de una fusion de modelos realizada con mergekit. Los tags de la model card indican el uso de las tecnicas Della y breadcrumbs_ties dentro de un proceso multi-step_merge, lo que implica combinar los pesos de varios modelos de forma iterativa y ponderada. No se especifica que modelos concretos se fusionaron, ni el numero de tokens de entrenamiento, ni si hubo fases de RLHF o DPO. La etiqueta "dark_roleplay" (drp) sugiere que los modelos de origen estaban especializados en roleplay de tematica adulta u oscura.

La version aqui descrita es una cuantizacion i1 (imatrix) generada por mradermacher, que emplea un fichero imatrix para ponderar la cuantizacion y preservar mejor la calidad en tamanos reducidos. El repositorio incluye el propio fichero imatrix (0,1 GB) para que otros puedan generar sus propias cuantizaciones. No se dispone de informacion sobre innovaciones arquitectonicas adicionales como atencion lineal o decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional orientada a roleplay y ficcion interactiva.
- Mantenimiento de personajes y narrativa multi-turno (la calidad depende del contexto, cuyo tamano no se especifica).
- Escritura creativa en ingles con tono narrativo y tematicas adultas u oscuras.
- Generacion de dialogos y descripciones dentro de escenarios de rol.
- Soporte de cuantizaciones ligeras (desde 7,3 GB) para ejecucion en hardware modesto.
- Compatibilidad con endpoints (tag "endpoints_compatible") para despliegue como API.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Roleplay conversacional local: el modelo puede mantener una conversacion de personaje con contexto multi-turno en ingles, ejecutandose en local mediante llama.cpp u Ollama con la cuantizacion Q4_K_M (18,8 GB) en una GPU de 24 GB.
- Escritura de ficcion interactiva: util para generar narrativa ramificada y dialogos de personajes en proyectos de novelas visuales o juegos de texto, gracias a su especializacion en "dark_roleplay".
- Prototipado de chatbots de personaje: integrable como backend de una aplicacion de chat con personalidad fija, usando la variante IQ4_XS (16,8 GB) para reducir requisitos de VRAM.
- Experimentacion con merges de modelos: el fichero imatrix y las multiples cuantizaciones permiten estudiar el impacto de la cuantizacion en la calidad de un merge de 31B.
- Generacion de contenido narrativo para juegos de mesa o campanas de rol: el modelo puede producir descripciones de escenas y respuestas de PNJ en ingles.
- Investigacion sobre alineacion y contenido adulto: permite estudiar el comportamiento de modelos fusionados con sesgo hacia tematicas oscuras en entornos controlados.
- Despliegue en servidores con poca VRAM: la variante IQ2_M (11,0 GB) permite ejecutar el modelo en GPUs de 12 GB, aunque con perdida de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion y ventana de contexto): IQ1_S ~7,3 GB; IQ2_M ~11,0 GB; IQ3_M ~14,5 GB; Q4_K_M ~18,8 GB; Q5_K_M ~21,9 GB; Q6_K ~25,3 GB. A estas cifras hay que sumar la memoria para el contexto KV, que crece con la longitud de contexto (no especificada).
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 3090 (24 GB) para las mismas; A100 40 GB o H100 para Q6_K con contexto largo; GPUs de 12 GB (RTX 3060, RTX 4070) para IQ2_M o IQ3_S.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB con cuantizaciones IQ2/IQ3, y en RTX 4090 con Q4_K_M o Q5_K_M.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF. Para el modelo base en safetensors, vLLM o TGI (no verificado para este merge).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Artoma-Lexicon-31B-i1-GGUF | 30,7B | no disponible | Apache 2.0 | GGUF (i1) | Merge orientado a dark roleplay, solo ingles |
| Modelos de roleplay de ~30B en GGUF (genericos) | ~30B | variable | variable | GGUF | No disponible comparativa concreta en la informacion |
| Modelos base de 30B en safetensors | ~30B | variable | variable | safetensors | No disponible comparativa concreta en la informacion |

No se dispone de datos de benchmarks ni de modelos comparables especificos en la informacion proporcionada; la comparativa se limita a la categoria general de modelos de 30B en GGUF para roleplay.

## Limitaciones y advertencias

- El modelo esta etiquetado como "not-for-all-audiences" y "dark_roleplay": puede generar contenido adulto, violento o de tematica oscura inapropiado para entornos profesionales o públicos.
- Solo soporta ingles; no se garantiza calidad en castellano ni en otros idiomas.
- Riesgo de alucinacion y de deriva de personaje en conversaciones largas, especialmente con cuantizaciones bajas (IQ1, IQ2).
- Las cuantizaciones por debajo de Q3 pierden calidad de forma notable segun las propias notas del autor ("very low quality", "for the desperate").
- La licencia Apache 2.0 se hereda del modelo base, pero el contenido generado puede estar sujeto a restricciones legales segun la jurisdiccion; verificar antes de uso comercial.
- No se documenta longitud de contexto ni politica de seguridad o filtros de contenido.
- El modelo es un merge experimental sin benchmarks publicados; su rendimiento en tareas generales (codigo, matematicas, razonamiento) no esta validado.
- El repositorio ocupa 334,8 GB en total por incluir todas las cuantizaciones; descargar solo la variante necesaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Artoma-Lexicon-31B-i1-GGUF
- Modelo base: https://huggingface.co/Casual-Autopsy/Artoma-Lexicon-31B
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Artoma-Lexicon-31B-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Artoma-Lexicon-31B-i1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/

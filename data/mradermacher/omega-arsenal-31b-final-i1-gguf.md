# mradermacher/Omega-Arsenal-31B-Final-i1-GGUF

## Resumen

Omega-Arsenal-31B-Final-i1-GGUF es una colección de cuantizaciones en formato GGUF (con imatrix, o matriz de importancia) del modelo ReadyArt/Omega-Arsenal-31B-Final, realizadas por el cuantizador comunitario mradermacher. El modelo base es un LLM de 30.697.345.596 parámetros (aproximadamente 31B) orientado a conversación e instrucciones, con un enfoque explícito en contenido sin alinear (unaligned): roleplay, contenido para adultos (ERP), terror, violencia y temática madura en general, tal como indican sus propias etiquetas.

Este repositorio no es un modelo nuevo, sino la versión cuantizada pensada para ejecutarse localmente con llama.cpp y derivados (Ollama, LM Studio, etc.). Su relevancia radica en ofrecer más de 20 variantes de cuantización (desde IQ1_S de 7,3 GB hasta Q6_K de 25,3 GB), lo que permite ajustar el compromiso entre calidad, VRAM y velocidad según el hardware disponible. La licencia es Apache 2.0, heredada del modelo base, lo que permite uso comercial. No se dispone de información sobre la arquitectura exacta del modelo base, la longitud de contexto ni el proceso de entrenamiento, ya que la model card del cuantizador no incluye esos datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, tipo concreto no especificado) |
| Parametros totales | 30.697.345.596 (~31B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, IQ3_M, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas con imatrix) |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones con imatrix) |

## Arquitectura y entrenamiento

El repositorio cuantizado no documenta la arquitectura del modelo base. Lo único que se sabe es que se trata de un modelo denso de unos 31B de parámetros (el tamaño del safetensors original es de 30.697.345.596 parámetros), convertido a GGUF a partir de los pesos de HuggingFace de ReadyArt/Omega-Arsenal-31B-Final. La model card del cuantizador menciona que "this is a vision model" y que los archivos mmproj (proyectores multimodales, si existen) están en el repositorio de cuantizaciones estáticas, lo que sugiere que el modelo base podría tener capacidades visuales, aunque no hay documentación que lo confirme en detalle.

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO, afinados previos) no hay información disponible en la model card. Las etiquetas (unaligned, roleplay, ERP, horror, violence) indican que el modelo ha sido afinado para generar contenido adulto y sin restricciones de alineación, pero el método concreto de entrenamiento no está documentado. Las cuantizaciones de este repositorio usan la técnica de imatrix (matriz de importancia calculada sobre datos de calibración), que según ikawrakow mejora la calidad de las cuantizaciones bajas respecto a las cuantizaciones estáticas equivalentes.

## Capacidades

- Generacion de texto conversacional e instruccional (tags: conversational, instruct).
- Roleplay de larga duracion y escritura creativa, incluido contenido explicito para adultos (ERP), terror y violencia, al ser un modelo "unaligned" sin filtros de seguridad.
- Posible capacidad de vision: la model card del cuantizador lo describe como vision model y remite los archivos mmproj al repositorio de cuantizaciones estaticas, aunque no hay documentacion detallada.
- Soporte para ejecucion local mediante llama.cpp y herramientas compatibles con GGUF, con mas de 20 niveles de cuantizacion.
- Idioma principal: ingles. No hay soporte documentado para otros idiomas.
- No hay informacion sobre tool calling, function calling ni capacidades agenticas.

## Casos de uso

- Roleplay interactivo local: el modelo puede mantener conversaciones de rol multibloque sin filtros de contenido, ejecutandose en hardware de consumo gracias a las cuantizaciones IQ de 7-12 GB.
- Escritura creativa de ficcion adulta: generacion de narrativa con tematica madura (horror, violencia, contenido explicito) para autores que usan herramientas como SillyTavern o frontends similares sobre llama.cpp.
- Chatbots personales sin censura: despliegue en Ollama o LM Studio para asistentes conversacionales con control total sobre el comportamiento y sin politicas de moderacion del proveedor.
- Pruebas de cuantizacion e investigacion: con 23 variantes y el archivo imatrix incluido (0,1 GB), es util para comparar la degradacion de calidad entre niveles IQ y K en un modelo de 31B.
- Experimentacion con modelos unaligned en investigacion de seguridad: analisis de comportamientos sin alinear en un modelo de tamano medio, con licencia Apache 2.0 que permite redistribucion.
- Uso en entornos sin conexion: al ser pesos locales en GGUF, permite despliegue offline en estaciones de trabajo sin depender de APIs externas, util para escritura creativa privada.

No es adecuado para entornos de produccion orientados a usuarios finales sin moderacion, dado el caracter explicito y sin alinear del contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del cuantizador ni los datos del repositorio incluyen evaluaciones (MMLU, HumanEval, GSM8K u otras) del modelo base ReadyArt/Omega-Arsenal-31B-Final.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: depende de la cuantizacion elegida. Rangos aproximados segun el tamano de archivo: IQ1_S (7,3 GB) cabe en GPUs de 8 GB; IQ2_M (11 GB) en GPUs de 12 GB; Q4_K_M (18,8 GB, recomendada) en GPUs de 24 GB; Q6_K (25,3 GB) requiere 32 GB de VRAM o una combinacion GPU+RAM.
- GPUs recomendadas: RTX 3090/4090 (24 GB) para las cuantizaciones Q4-Q5; RTX 3060 12 GB o 4060 Ti 16 GB para cuantizaciones IQ2-IQ3; Apple Silicon con memoria unificada (Mac con 24-32 GB o mas) tambien es viable. Para Q6_K completa en GPU, A100 40 GB o doble GPU.
- Consumer GPUs: si cabe. La cuantizacion IQ1_S/IQ1_M (7,3-7,8 GB) funciona en GPUs de 8 GB; Q4_K_M (18,8 GB) en una RTX 3090/4090 de 24 GB con margen para el contexto.
- Despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, KoboldCpp, text-generation-webui y cualquier runtime compatible con GGUF. No esta pensado para vLLM o TGI, que requieren pesos safetensors (disponibles en el modelo base ReadyArt/Omega-Arsenal-31B-Final).
- Latencia y throughput: no disponibles; en un modelo denso de 31B con cuantizacion Q4 sobre una RTX 4090 cabe esperar velocidades tipicas de este tamano con llama.cpp, pero no hay mediciones publicadas.
- El tamano total del repositorio es de 334,8 GB al incluir todas las cuantizaciones; se recomienda descargar solo los archivos necesarios.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Enfoque |
|---|---|---|---|---|
| Omega-Arsenal-31B-Final-i1-GGUF | ~31B | GGUF (imatrix, 23 quants) | apache-2.0 | Roleplay/contenido adulto unaligned |
| MythoMax / variants de roleplay 22B (ej. Gryphe/MythoMax-L2-13B y sucesores) | 13B | GGUF | varia | Roleplay creativo |
| Nous-Hermes-2-Mixtral-8x7B-DPO | 47B (MoE, ~13B activos) | safetensors/GGUF | apache-2.0 | Instruct general, poco filtrado |

Nota: no hay datos de benchmarks que permitan comparar rendimiento medido; la comparativa se limita a caracteristicas tecnicas. Dentro del nicho de modelos unaligned de roleplay en GGUF cuantizados por mradermacher, este modelo destaca por su tamano (31B, mayor que los 13B tipicos del nicho) y por la amplitud de cuantizaciones disponibles.

## Limitaciones y advertencias

- Contenido explicito sin alinear: el modelo esta etiquetado como nsfw, explicit, unaligned, ERP, horror y violence, y marcado "not-for-all-audiences". No debe desplegarse ante usuarios finales sin moderacion.
- Sesgos conocidos: no documentados; al ser un modelo sin alinear, puede producir contenido ofensivo, peligroso o ilegal segun la jurisdiccion sin reticencias.
- Riesgo de alucinacion: no evaluado; no hay benchmarks publicados, por lo que la fiabilidad factual es desconocida.
- Idioma: documentado solo para ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- Longitud de contexto: no disponible; debe verificarse en la config del modelo base antes de planificar cargas de contexto largas.
- Cuantizaciones muy bajas (IQ1_S, IQ1_M, Q2_K): el propio autor las describe como "for the desperate" y "very low quality", con degradacion notable de coherencia.
- Licencia Apache 2.0: permite uso comercial, pero el contenido generado (adulto, violento) puede estar sujeto a restricciones legales locales y a las politicas de las plataformas de distribucion.
- Posible modelo de vision: la mencion a mmproj no esta acompanada de documentacion; la funcionalidad visual, si existe, requiere descargar archivos adicionales del repositorio estatico.
- La model card es la del cuantizador, no del autor del modelo base; la informacion sobre entrenamiento y capacidades reales de Omega-Arsenal-31B-Final es escasa.

## Enlaces

- Repositorio cuantizado (imatrix): https://huggingface.co/mradermacher/Omega-Arsenal-31B-Final-i1-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Omega-Arsenal-31B-Final
- Cuantizaciones estaticas (y archivos mmproj): https://huggingface.co/mradermacher/Omega-Arsenal-31B-Final-GGUF
- Pagina de descargas resumida: https://hf.tst.eu/model#Omega-Arsenal-31B-Final-i1-GGUF
- FAQ de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

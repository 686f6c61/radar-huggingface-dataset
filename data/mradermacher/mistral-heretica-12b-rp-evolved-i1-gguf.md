# mradermacher/Mistral-Heretica-12B-RP-Evolved-i1-GGUF

## Resumen

Mistral-Heretica-12B-RP-Evolved-i1-GGUF es la cuantizacion en formato GGUF, realizada por mradermacher, del modelo base mrcuddle/Mistral-Heretica-12B-RP-Evolved. Se trata de un modelo de 12.247.782.400 parametros (aproximadamente 12,25 mil millones) orientado a role-play y generacion conversacional, derivado mediante la herramienta mergekit (fusion de modelos) y ajustado sobre un dataset especifico de contenido NSFW denominado mrcuddle/evolved-adonis-nsfw. El autor original del merge es mrcuddle; mradermacher se limita a producir las cuantizaciones ponderadas con imatrix.

La relevancia de esta ficha reside en que el repositorio ofrece una bateria muy amplia de cuantizaciones GGUF (desde IQ1_S de 3,1 GB hasta Q6_K de 10,2 GB), lo que permite ejecutar un modelo de 12B en hardware de consumo. Es un ejemplo tipico del ecosistema de modelos comunitarios para role-play: no hay model card tecnica detallada, no se publican benchmarks ni se especifica la licencia, de modo que su evaluacion debe hacerse de forma empirica.

El modelo esta etiquetado con el idioma ingles y la libreria transformers, con soporte declarado de endpoints_compatible. No se dispone de informacion sobre arquitectura interna, longitud de contexto ni proceso de entrenamiento mas alla de que proviene de una fusion (merge) de modelos Mistral.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de la familia Mistral, fusion via mergekit) |
| Parametros totales | 12.247.782.400 (12,25 B) |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-IQ4_NL, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; incluye fichero imatrix |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base en safetensors |
| Tamano del repositorio | 141,9 GB |
| Descargas | 842 |
| Fecha de creacion | 2026-11-21 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la documentacion proporcionada. Por el nombre y el tamano (12,25 B parametros) y por la etiqueta mergekit, se trata de una fusion de modelos de la familia Mistral, presumiblemente basada en una arquitectura transformer decoder-only. El modelo base mrcuddle/Mistral-Heretica-12B-RP-Evolved fue generado mediante mergekit, tecnica que combina los pesos de varios modelos afinados para obtener caracteristicas hibridas sin un entrenamiento adicional completo.

El dataset declarado en la model card es mrcuddle/evolved-adonis-nsfw, orientado a contenido para adultos y role-play. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o fine-tuning supervisado. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal. La cuantizacion realizada por mradermacher emplea ficheros imatrix (matriz de importancia) para mejorar la calidad de las cuantizaciones de baja precision, un procedimiento habitual en su flujo de trabajo.

## Capacidades

- Generacion de texto conversacional y role-play multi-turno, orientado a personajes y narrativa interactiva.
- Especializacion en contenido para adultos (NSFW) segun el dataset declarado por el autor.
- Soporte de conversacion en ingles; no hay evidencia de capacidades multilingues.
- Compatibilidad con endpoints (tag endpoints_compatible), lo que sugiere uso via APIs compatibles con el formato de Hugging Face.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- No se documentan capacidades de codigo ni matematicas mas alla de lo esperable en un modelo de 12B de la familia Mistral.

## Casos de uso

- Role-play conversacional en local: el modelo esta disenado para mantener personajes y narrativa en conversaciones largas; las cuantizaciones Q4_K_M (7,6 GB) permiten ejecutarlo en GPUs de consumo con 8-12 GB de VRAM.
- Prototipado de chatbots de ficcion interactiva: util para escritores y disenadores de juegos narrativos que necesitan generar dialogos de personajes con consistencia estilistica sin depender de APIs externas.
- Generacion de narrativa para adultos en entornos controlados: el ajuste sobre el dataset evolved-adonis-nsfw lo hace adecuado para plataformas de contenido para adultos que requieran un modelo autoalojado.
- Investigacion sobre fusion de modelos: sirve como caso de estudio de mergekit y de cuantizacion imatrix, comparando la calidad entre las distintas variantes i1 (IQ1 a Q6_K).
- Despliegue en hardware limitado: las variantes IQ2/IQ3 (3,7-5,8 GB) permiten ejecutar el modelo en equipos con 6-8 GB de VRAM o incluso en CPU con llama.cpp, a costa de calidad.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye 25 variantes, lo que facilita estudios empiricos sobre la degradacion de calidad segun el nivel de cuantizacion en tareas de role-play.
- Fine-tuning posterior: al estar disponible el modelo base en safetensors, se puede partir de el para ajustes especificos de personaje o dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del fichero GGUF mas el contexto. Las variantes van desde 3,1 GB (IQ1_S) hasta 10,2 GB (Q6_K); el modelo base en safetensors requiere unos 24,5 GB en FP16.
- GPU recomendadas: RTX 4090 (24 GB) para Q6_K o FP16; RTX 4080/4070 Ti (12-16 GB) para Q5_K_M o Q6_K; RTX 3060/4060 (8-12 GB) para Q4_K_M o Q5_K_S.
- Cabe en GPU de consumo: si, desde Q4_K_M (7,6 GB) en una RTX 3060 de 12 GB o una RTX 4060 Ti de 8 GB con contexto moderado; las variantes IQ2/IQ3 caben en 6-8 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF; el tag endpoints_compatible sugiere integracion con APIs tipo Hugging Face.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Mistral-Heretica-12B-RP-Evolved-i1-GGUF | 12,25 B | no disponible | no disponible | GGUF (25 variantes) | Role-play NSFW, fusion mergekit, solo ingles |
| Mistral-Nemo-Instruct-2407 | 12 B | 128K | Apache 2.0 | safetensors, GGUF | Modelo instructivo generalista, multilingue |
| Mistral-7B-Instruct-v0.3 | 7,25 B | 32K | Apache 2.0 | safetensors, GGUF | Menor tamano, licencia permisiva, uso general |
| Nous-Hermes-2-Mistral-7B-DPO | 7,25 B | 32K | Apache 2.0 | safetensors, GGUF | Fine-tuning DPO para conversacion, sin enfoque NSFW |

La comparativa es orientativa: no se dispone de datos de rendimiento del modelo evaluado, por lo que la eleccion frente a alternativas debe basarse en pruebas empiricas de role-play y en la licencia, que en este caso no esta declarada.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial; es imprescindible contactar con el autor del modelo base (mrcuddle) antes de desplegarlo en produccion.
- Contenido NSFW: el ajuste sobre evolved-adonis-nsfw implica que el modelo puede generar contenido para adultos; requiere moderacion y cumplimiento normativo.
- Solo ingles: la model card declara unicamente el idioma en; el rendimiento en castellano no esta verificado y probablemente sea deficiente.
- Sin benchmarks: no hay datos objetivos de calidad, por lo que el riesgo de alucinacion y de degradacion en tareas no conversacionales es desconocido.
- Cuantizaciones extremas: las variantes IQ1 e IQ2 (3,1-4,5 GB) degradan notablemente la calidad; el propio autor las marca como "for the desperate" o "mostly desperate".
- Modelo derivado de fusion: al no haber un entrenamiento documentado, el comportamiento puede ser inconsistente en tareas de razonamiento, codigo o matematicas.
- Sin soporte documentado de tool calling ni agentes: no es adecuado para pipelines automatizados que requieran function calling.
- Repositorio de 141,9 GB: descargar el conjunto completo de cuantizaciones consume mucho espacio; conviene bajar solo la variante necesaria.
- Fecha de creacion futura (2026-11-21): dato anomalo que conviene verificar en la pagina del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Mistral-Heretica-12B-RP-Evolved-i1-GGUF
- Modelo base: https://huggingface.co/mrcuddle/Mistral-Heretica-12B-RP-Evolved
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Mistral-Heretica-12B-RP-Evolved-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Mistral-Heretica-12B-RP-Evolved-i1-GGUF
- Dataset declarado: https://huggingface.co/datasets/mrcuddle/evolved-adonis-nsfw
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- mergekit: https://github.com/arcee-ai/mergekit
